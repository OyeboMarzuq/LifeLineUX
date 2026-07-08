import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  component: Unauthorized,
  head: () => ({ meta: [{ title: "Access denied — LifeLine" }] }),
});

function Unauthorized() {
  return (
    <div className="container-page py-24 max-w-md text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/15 text-destructive grid place-items-center mx-auto">
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m0-9a3 3 0 11-3 3v0a3 3 0 013-3zM5 21h14a2 2 0 002-2v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h1 className="font-display text-3xl font-bold mt-5">Access denied</h1>
      <p className="text-muted-foreground mt-2">You don't have permission to view that page. If you think this is a mistake, contact support.</p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link to="/" className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center">Go home</Link>
        <Link to="/login" className="h-10 px-5 rounded-lg border border-border bg-card font-semibold text-sm inline-flex items-center">Sign in</Link>
      </div>
    </div>
  );
}
