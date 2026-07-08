import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, ApiError } from "@/lib/auth";
import { AuthCard, Field, inputCls, btnPrimary, FormError, FormSuccess } from "@/components/auth-ui";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password — LifeLine" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string>();
  const [ok, setOk] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(undefined); setOk(undefined); setBusy(true);
    try {
      await requestPasswordReset(email);
      setOk("If this email is registered, a password reset link has been sent. Check your inbox.");
    } catch (e: unknown) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="We'll email a secure link to reset it."
      footer={<>Remembered it? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={err} />
        <FormSuccess message={ok} />
        <Field label="Email">
          <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <button disabled={busy} className={btnPrimary}>{busy ? "Sending..." : "Send reset link"}</button>
        <p className="text-xs text-muted-foreground">The link opens the reset page where you'll choose a new password.</p>
      </form>
    </AuthCard>
  );
}
