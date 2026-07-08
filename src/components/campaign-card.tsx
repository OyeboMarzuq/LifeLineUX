import { Link } from "@tanstack/react-router";
import type { Campaign, CampaignStatus } from "@/lib/api/types";
import { fmtMoney, pct } from "@/lib/format";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=70";

export function VerifiedBadge({ status }: { status: CampaignStatus }) {
  const map: Record<CampaignStatus, string> = {
    Verified: "bg-trust/15 text-trust border-trust/30",
    Pending: "bg-warning/15 text-warning-foreground border-warning/40",
    Rejected: "bg-destructive/15 text-destructive border-destructive/30",
    Completed: "bg-success/15 text-success border-success/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${map[status]}`}>
      {status === "Verified" && (
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M12 1l3 2 3-1 2 3 3 1v3l1 3-2 3 1 3-3 1-2 3-3-1-3 2-3-2-3 1-2-3-3-1 1-3-2-3 1-3V6l3-1 2-3 3 1z"/></svg>
      )}
      {status}
    </span>
  );
}

export function ProgressBar({ value, goal }: { value: number; goal: number }) {
  const p = pct(value, goal);
  return (
    <div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${p}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground">{fmtMoney(value)}</span> raised</span>
        <span>of {fmtMoney(goal)} · {p.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export function CampaignCard({ c }: { c: Campaign }) {
  return (
    <Link
      to="/campaigns/$slug"
      params={{ slug: c.slug }}
      className="group block bg-card rounded-2xl overflow-hidden border border-border shadow-soft hover:shadow-lift transition-all"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={c.coverImageUrl || FALLBACK_IMAGE}
          alt={c.patientName}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <VerifiedBadge status={c.status} />
          <span className="text-xs text-muted-foreground truncate max-w-[40%]">{c.creatorName}</span>
        </div>
        <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
          {c.patientName}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.medicalCondition}</p>
        <div className="mt-4">
          <ProgressBar value={c.amountRaised} goal={c.goalAmount} />
        </div>
        <div className="mt-3 text-xs text-muted-foreground">{c.donorCount} donors</div>
      </div>
    </Link>
  );
}
