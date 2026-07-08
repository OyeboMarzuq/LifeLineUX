export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <div className="w-9 h-9 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 text-sm text-destructive p-5 flex items-center justify-between gap-4">
      <span>{message}</span>
      {retry && (
        <button onClick={retry} className="h-8 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold">
          Retry
        </button>
      )}
    </div>
  );
}
