import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import type { CampaignStatus } from "@/lib/api/types";
import { VerifiedBadge } from "@/components/campaign-card";
import { RoleGuard } from "@/components/role-guard";
import { Loading, ErrorBox } from "@/components/loading";
import { fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RoleGuard roles={["SuperAdmin", "VerificationAdmin"]}>
      <AdminDashboard />
    </RoleGuard>
  ),
  head: () => ({ meta: [{ title: "Admin dashboard — LifeLine" }] }),
});

const FILTERS: Array<{ label: string; value: CampaignStatus | undefined }> = [
  { label: "All", value: undefined },
  { label: "Pending", value: "Pending" },
  { label: "Verified", value: "Verified" },
  { label: "Rejected", value: "Rejected" },
  { label: "Completed", value: "Completed" },
];

function AdminDashboard() {
  const [status, setStatus] = useState<CampaignStatus | undefined>("Pending");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "campaigns", status ?? "all"],
    queryFn: () => adminApi.listCampaigns({ page: 1, pageSize: 50, status }),
  });
  const list = data ?? [];

  return (
    <div className="container-page py-10">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Admin</p>
          <h1 className="font-display text-3xl font-bold">Verification & oversight</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users" className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium inline-flex items-center">Users</Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={`h-9 px-4 rounded-lg text-sm font-medium border ${status === f.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <Loading />}
      {error && <ErrorBox message="Could not load campaigns." retry={refetch} />}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted-foreground text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Patient</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">Raised</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">Creator</th>
              <th className="text-right px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {c.coverImageUrl && <img src={c.coverImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <div className="font-semibold">{c.patientName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{c.medicalCondition}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><VerifiedBadge status={c.status} /></td>
                <td className="px-5 py-4 hidden md:table-cell">{fmtMoney(c.amountRaised)}</td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <div className="text-xs">{c.creatorName}</div>
                  <div className="text-xs text-muted-foreground">{c.creatorEmail}</div>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link to="/admin/campaigns/$id" params={{ id: c.id }} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center">Review</Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && !isLoading && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No campaigns in this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
