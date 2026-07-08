import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { donationsApi } from "@/lib/api/donations";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/donate/callback")({
  component: CallbackPage,
  validateSearch: (s: Record<string, unknown>) => ({
    reference: typeof s.reference === "string" ? s.reference : "",
  }),
  head: () => ({ meta: [{ title: "Verifying donation — LifeLine" }] }),
});

function CallbackPage() {
  const { reference } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "duplicate" | "failed">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!reference) { setStatus("failed"); setMessage("Missing payment reference."); return; }
    donationsApi.verify(reference)
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          if (err.message.toLowerCase().includes("already verified")) setStatus("duplicate");
          else setStatus("failed");
          setMessage(err.message);
        } else {
          setStatus("failed");
          setMessage("Could not verify payment.");
        }
      });
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="container-page py-24 max-w-md text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
        <h1 className="font-display text-2xl font-bold mt-6">Verifying your payment…</h1>
        <p className="text-muted-foreground mt-2 text-sm">Reference: <span className="font-mono">{reference}</span></p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="container-page py-20 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/15 text-destructive grid place-items-center mx-auto">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/></svg>
        </div>
        <h1 className="font-display text-2xl font-bold mt-5">Payment could not be verified</h1>
        <p className="text-muted-foreground mt-2 text-sm">{message}</p>
        <p className="text-muted-foreground mt-1 text-xs font-mono">{reference}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/campaigns" className="h-10 px-5 rounded-lg border border-border bg-card font-semibold text-sm inline-flex items-center">Browse campaigns</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-20 max-w-md text-center">
      <div className="w-16 h-16 rounded-full bg-success/15 text-success grid place-items-center mx-auto">
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <h1 className="font-display text-2xl font-bold mt-5">
        {status === "duplicate" ? "Already verified" : "Thank you!"}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {status === "duplicate" ? "We already received this payment — no further action needed." : "Your donation was successfully recorded."}
      </p>
      <p className="text-muted-foreground mt-1 text-xs font-mono">{reference}</p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link to="/campaigns" className="h-10 px-5 rounded-lg border border-border bg-card font-semibold text-sm inline-flex items-center">Browse more</Link>
        <Link to="/" className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center">Home</Link>
      </div>
    </div>
  );
}
