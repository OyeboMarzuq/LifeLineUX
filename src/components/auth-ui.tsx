import { type ReactNode } from "react";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-12 bg-gradient-to-b from-background to-surface">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-soft p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: string; error?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </label>
  );
}

export const inputCls =
  "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export const btnPrimary =
  "w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-soft hover:opacity-90 transition disabled:opacity-60";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">
      {message}
    </div>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm px-3 py-2">
      {message}
    </div>
  );
}
