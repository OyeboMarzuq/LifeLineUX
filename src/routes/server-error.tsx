import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/server-error")({
  component: ServerError,
  head: () => ({ meta: [{ title: "Something went wrong — LifeLine" }] }),
});

function ServerError() {
  return (
    <div className="container-page py-24 max-w-md text-center">
      <div className="w-16 h-16 rounded-full bg-warning/20 text-warning-foreground grid place-items-center mx-auto">
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h1 className="font-display text-3xl font-bold mt-5">Something went wrong</h1>
      <p className="text-muted-foreground mt-2">Our team has been notified. Please try again in a moment.</p>
      <div className="mt-6 flex gap-3 justify-center">
        <button onClick={() => window.location.reload()} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Try again</button>
        <Link to="/" className="h-10 px-5 rounded-lg border border-border bg-card font-semibold text-sm inline-flex items-center">Go home</Link>
      </div>
    </div>
  );
}
