// Currency + date formatting helpers. The backend stores amounts in Naira (NGN).
const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const fmtMoney = (n: number | null | undefined): string =>
  ngn.format(Math.max(0, Number(n ?? 0)));

export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
};

export const pct = (raised: number, goal: number): number =>
  goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;
