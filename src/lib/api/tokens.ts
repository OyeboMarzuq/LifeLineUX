// In-memory token store with sessionStorage mirror for the refresh token.
// Access token is kept in memory only (XSS hardening, per the integration guide).
// Listeners are notified on changes so React hooks can re-render.

import type { AuthSession } from "./types";

const REFRESH_KEY = "lifeline.refreshToken";
const SESSION_SNAPSHOT_KEY = "lifeline.session";

type Listener = () => void;
const listeners = new Set<Listener>();

let accessToken: string | null = null;
let refreshToken: string | null = null;

// Hydrate from sessionStorage on first load (browser only).
if (typeof window !== "undefined") {
  refreshToken = sessionStorage.getItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setTokens(session: Pick<AuthSession, "accessToken" | "refreshToken">) {
  accessToken = session.accessToken;
  refreshToken = session.refreshToken;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(REFRESH_KEY, session.refreshToken);
  }
  emit();
}

export function setSessionSnapshot(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) sessionStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_SNAPSHOT_KEY);
}

export function getSessionSnapshot(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(SESSION_SNAPSHOT_KEY);
  }
  emit();
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((l) => l());
}
