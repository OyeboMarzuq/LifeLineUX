import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/campaigns";
import { CampaignCard } from "@/components/campaign-card";
import { Loading, ErrorBox } from "@/components/loading";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
  head: () => ({
    meta: [
      { title: "Browse campaigns — LifeLine" },
      { name: "description", content: "Discover verified medical fundraisers and donate to people who need urgent care." },
    ],
  }),
});

function CampaignsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | "Verified" | "Pending">("All");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["campaigns", page],
    queryFn: () => campaignsApi.list(page, 12),
  });

  const list = (data ?? [])
    .filter((c) => (filter === "All" ? true : c.status === filter))
    .filter((c) =>
      q === "" ||
      c.patientName.toLowerCase().includes(q.toLowerCase()) ||
      c.medicalCondition.toLowerCase().includes(q.toLowerCase()) ||
      c.title.toLowerCase().includes(q.toLowerCase()),
    );

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">Browse campaigns</h1>
        <p className="text-muted-foreground mt-2">Every donation is tracked. Every story is verified.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by patient name, title, or condition…"
          className="flex-1 h-11 px-4 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-2">
          {(["All", "Verified", "Pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-11 px-4 rounded-lg text-sm font-medium border transition ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Loading />}
      {error && <ErrorBox message="Could not load campaigns." retry={refetch} />}
      {!isLoading && !error && list.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">No campaigns match your search.</div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((c) => <CampaignCard key={c.id} c={c} />)}
      </div>

      {data && data.length > 0 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-10 px-4 rounded-lg border border-border bg-card disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="h-10 px-4 inline-flex items-center text-sm text-muted-foreground">Page {page}</span>
          <button
            disabled={(data?.length ?? 0) < 12}
            onClick={() => setPage((p) => p + 1)}
            className="h-10 px-4 rounded-lg border border-border bg-card disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
