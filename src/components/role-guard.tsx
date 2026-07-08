import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth, type UserRole } from "@/lib/auth";

export function RoleGuard({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user, hasAnyRole } = useAuth();
  if (!user) {
    return (
      <div className="container-page py-20 max-w-md text-center">
        <h1 className="font-display text-2xl font-bold">Please sign in</h1>
        <p className="text-muted-foreground mt-2 text-sm">You need an account to view this page.</p>
        <Link to="/login" className="mt-6 inline-flex h-10 px-5 items-center rounded-lg bg-primary text-primary-foreground font-semibold">Sign in</Link>
      </div>
    );
  }
  if (!hasAnyRole(roles)) {
    return (
      <div className="container-page py-20 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-destructive/15 text-destructive grid place-items-center mx-auto">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 className="font-display text-2xl font-bold mt-4">Access denied</h1>
        <p className="text-muted-foreground mt-2 text-sm">Your role ({user.role}) doesn't have permission to view this page.</p>
        <Link to="/" className="mt-6 inline-flex h-10 px-5 items-center rounded-lg bg-primary text-primary-foreground font-semibold">Go home</Link>
      </div>
    );
  }
  return <>{children}</>;
}
