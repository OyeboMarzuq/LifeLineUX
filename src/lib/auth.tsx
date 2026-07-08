// Auth provider wired to the LifeLine .NET API.
// User identity is derived from the JWT claims; tokens live in the in-memory store
// (see ./api/tokens.ts) with a sessionStorage mirror so refresh survives reloads.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { authApi, type RegisterDto } from "./api/auth";
import { ApiError } from "./api/client";
import {
  clearTokens,
  getAccessToken,
  getSessionSnapshot,
  setSessionSnapshot,
  setTokens,
  subscribe,
} from "./api/tokens";
import type { AuthSession, JwtClaims, Role } from "./api/types";

export type UserRole = Role;

export type AuthUser = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  signup: (dto: RegisterDto) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  canCreateCampaign: () => boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

function sessionToUser(s: AuthSession): AuthUser {
  const [firstName, ...rest] = (s.fullName || "").split(" ");
  return {
    id: s.userId,
    fullName: s.fullName,
    firstName: firstName || s.fullName || s.email,
    lastName: rest.join(" "),
    email: s.email,
    role: s.role,
  };
}

function claimsToUser(claims: JwtClaims): AuthUser {
  const [firstName, ...rest] = (claims.fullName || "").split(" ");
  return {
    id: claims.userId || claims.sub,
    fullName: claims.fullName,
    firstName: firstName || claims.fullName || claims.email,
    lastName: rest.join(" "),
    email: claims.email,
    role: claims.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from sessionStorage snapshot on mount, then keep in sync.
  useEffect(() => {
    const snap = getSessionSnapshot();
    if (snap) {
      setTokens(snap);
      setUser(sessionToUser(snap));
    }
    setLoading(false);

    return subscribe(() => {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const claims = jwtDecode<JwtClaims>(token);
        setUser(claimsToUser(claims));
      } catch {
        setUser(null);
      }
    });
  }, []);

  const persist = useCallback((s: AuthSession) => {
    setTokens(s);
    setSessionSnapshot(s);
    setUser(sessionToUser(s));
  }, []);

  const api: AuthCtx = useMemo(() => ({
    user,
    loading,
    async signup(dto) {
      const session = await authApi.register(dto);
      persist(session);
      toast.success("Welcome to LifeLine!");
    },
    async login(email, password) {
      const session = await authApi.login(email, password);
      persist(session);
      toast.success("Welcome back!");
    },
    async logout() {
      try { await authApi.logout(); } catch { /* ignore */ }
      clearTokens();
      setSessionSnapshot(null);
      setUser(null);
    },
    async changePassword(current, next) {
      await authApi.changePassword(current, next);
      clearTokens();
      setSessionSnapshot(null);
      setUser(null);
      toast.success("Password changed. Please sign in again.");
    },
    async requestPasswordReset(email) {
      await authApi.forgotPassword(email);
    },
    async resetPassword(email, token, newPassword) {
      await authApi.resetPassword(email, token, newPassword);
    },
    async loginWithGoogle(idToken) {
      const session = await authApi.google(idToken);
      persist(session);
    },
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => !!user && roles.includes(user.role),
    isAdmin: () => !!user && (user.role === "SuperAdmin" || user.role === "VerificationAdmin"),
    canCreateCampaign: () =>
      !!user && (user.role === "CampaignCreator" || user.role === "Organization" || user.role === "SuperAdmin"),
  }), [user, loading, persist]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
};

// Re-export so existing route files can read field errors from a 422.
export { ApiError };
