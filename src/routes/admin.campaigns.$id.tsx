import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { VerifiedBadge } from "@/components/campaign-card";
import { RoleGuard } from "@/components/role-guard";
import { Loading, ErrorBox } from "@/components/loading";
import { fmtDate, fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/admin/campaigns/$id")({
  component: () => (
    <RoleGuard roles={["SuperAdmin", "VerificationAdmin"]}>
      <Review />
    </RoleGuard>
  ),
  head: () => ({ meta: [{ title: "Review campaign — Admin · LifeLine" }] }),
});

function Review() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [reason, setReason] = useState("");

  const { data: c, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "campaign", id],
    queryFn: () => adminApi.getCampaign(id),
  });

  const verify = useMutation({
  mutationFn: () => adminApi.verifyCampaign(id),
  onSuccess: () => {
    toast.success("Campaign verified.");
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["campaign"] });
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    navigate({ to: "/admin" });
  },
  onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to verify."),
});

const reject = useMutation({
  mutationFn: () => adminApi.rejectCampaign(id, reason),
  onSuccess: () => {
    toast.success("Campaign rejected.");
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["campaign"] });
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    navigate({ to: "/admin" });
  },
  onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to reject."),
});

  if (isLoading) return <div className="container-page py-12"><Loading /></div>;
  if (error || !c) return <div className="container-page py-12"><ErrorBox message="Campaign not found." retry={refetch} /></div>;

  return (
    <div className="container-page py-10 max-w-4xl">
      <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Back to admin</Link>
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <VerifiedBadge status={c.status} />
        <span className="text-sm text-muted-foreground">#{c.id.slice(0, 8)}</span>
        <span className="text-sm text-muted-foreground">Created {fmtDate(c.createdAt)}</span>
      </div>
      <h1 className="font-display text-3xl font-bold mt-3 break-words">{c.title}</h1>
      <p className="text-muted-foreground">{c.patientName} · {c.medicalCondition}</p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 space-y-6">
          {c.coverImageUrl && <img src={c.coverImageUrl} alt="" className="w-full aspect-[16/9] rounded-2xl object-cover border border-border" />}
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold mb-3">Story</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line break-words">{c.story}</p>
          </section>
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold mb-3">Medical documents ({c.documents?.length ?? 0})</h2>
            {(!c.documents || c.documents.length === 0) && (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            )}
            <ul className="space-y-2 text-sm">
              {c.documents?.map((d) => (
                <li key={d.id} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{d.fileName}</div>
                    <div className="text-xs text-muted-foreground">{d.fileType} · uploaded {fmtDate(d.uploadedAt)}</div>
                  </div>
                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold">Open</a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 text-sm">
            <h3 className="font-semibold mb-3">Campaign details</h3>
            <dl className="space-y-2 text-xs">
              <Row k="Goal" v={fmtMoney(c.goalAmount)} />
              <Row k="Raised" v={fmtMoney(c.amountRaised)} />
              <Row k="Donors" v={String(c.donorCount)} />
              <Row k="Creator" v={c.creatorName} />
              <Row k="Email" v={c.creatorEmail} />
            </dl>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 text-sm">
            <h3 className="font-semibold mb-3">Payout account</h3>
            <dl className="space-y-2 text-xs">
              <Row k="Bank" v={c.bankName} />
              <Row k="Account number" v={c.accountNumber} />
              <Row k="Account name" v={c.accountName} />
            </dl>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-3 text-sm">Verification decision</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Required for rejection"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
            />
            <div className="mt-3 grid gap-2">
              <button
                disabled={verify.isPending}
                onClick={() => verify.mutate()}
                className="h-10 rounded-lg bg-success text-success-foreground font-semibold text-sm disabled:opacity-50"
              >
                {verify.isPending ? "Verifying…" : "Approve & verify"}
              </button>
              <button
                disabled={reject.isPending || !reason.trim()}
                onClick={() => reject.mutate()}
                className="h-10 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm disabled:opacity-50"
              >
                {reject.isPending ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right break-all">{v}</dd>
    </div>
  );
}
