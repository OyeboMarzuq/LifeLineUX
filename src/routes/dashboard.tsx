import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/campaigns";
import { VerifiedBadge } from "@/components/campaign-card";
import { RoleGuard } from "@/components/role-guard";
import { Loading, ErrorBox } from "@/components/loading";
import { fmtMoney, pct } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — LifeLine" }] }),
});

function DashboardPage() {
  return (
    <RoleGuard roles={["CampaignCreator", "Organization", "SuperAdmin"]}>
      <div className="container-page py-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Dashboard</p>
            <h1 className="font-display text-3xl font-bold">My campaigns</h1>
          </div>
        </div>
        <CreatorCampaigns />
      </div>
    </RoleGuard>
  );
}

function CreatorCampaigns() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["campaigns", "mine"],
    queryFn: () => campaignsApi.mine(),
  });
  const mine = data ?? [];
  const totalRaised = mine.reduce((s, c) => s + c.amountRaised, 0);
  const totalDonors = mine.reduce((s, c) => s + c.donorCount, 0);

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <Stat label="Total raised" value={fmtMoney(totalRaised)} accent />
        <Stat label="Campaigns" value={String(mine.length)} />
        <Stat label="Donors" value={String(totalDonors)} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-semibold">Your campaigns</h2>
        <Link to="/create" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center">+ New campaign</Link>
      </div>

      {isLoading && <Loading />}
      {error && <ErrorBox message="Could not load your campaigns." retry={refetch} />}
      {!isLoading && !error && mine.length === 0 && (
        <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-2xl mt-4">
          You haven't created any campaigns yet.
        </div>
      )}

      <div className="mt-4 grid gap-4">
        {mine.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-5 shadow-soft">
            {c.coverImageUrl && <img src={c.coverImageUrl} alt="" className="w-full md:w-32 h-32 rounded-xl object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <VerifiedBadge status={c.status} />
                <span className="text-xs text-muted-foreground">{c.donorCount} donors</span>
              </div>
              <h3 className="font-semibold mt-2 truncate">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.patientName} · {c.medicalCondition}</p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct(c.amountRaised, c.goalAmount)}%` }} />
              </div>
              <div className="mt-2 text-sm flex justify-between">
                <span><span className="font-semibold">{fmtMoney(c.amountRaised)}</span> <span className="text-muted-foreground">of {fmtMoney(c.goalAmount)}</span></span>
              </div>
              {c.status !== "Verified" && (
                <p className="mt-2 text-xs text-muted-foreground">Pending verification — donations open once approved.</p>
              )}
            </div>
            <div className="flex md:flex-col gap-2 md:w-40">
              <Link to="/campaigns/$slug" params={{ slug: c.slug }} className="flex-1 h-9 rounded-lg border border-border bg-background text-sm font-medium inline-flex items-center justify-center">View</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
      <div className={`text-xs ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
