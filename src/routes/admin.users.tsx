import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { RoleGuard } from "@/components/role-guard";
import { Loading, ErrorBox } from "@/components/loading";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <RoleGuard roles={["SuperAdmin"]}>
      <UsersPage />
    </RoleGuard>
  ),
  head: () => ({ meta: [{ title: "User management — Admin · LifeLine" }] }),
});

function UsersPage() {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.listUsers(1, 50),
  });
  const list = data ?? [];

  const suspend = useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => { toast.success("User suspended."); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Suspend failed"),
  });
  const reactivate = useMutation({
    mutationFn: (id: string) => adminApi.reactivateUser(id),
    onSuccess: () => { toast.success("User reactivated."); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Reactivate failed"),
  });

  return (
    <div className="container-page py-10">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Admin</p>
      <h1 className="font-display text-3xl font-bold">User management</h1>

      {isLoading && <Loading />}
      {error && <ErrorBox message="Could not load users." retry={refetch} />}

      <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted-foreground text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">Email</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">Campaigns</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-5 py-4">
                  <div className="font-medium">{u.fullName}</div>
                  <div className="text-xs text-muted-foreground">Joined {fmtDate(u.createdAt)}</div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell text-xs">{u.email}</td>
                <td className="px-5 py-4 text-xs">{u.role}</td>
                <td className="px-5 py-4 hidden md:table-cell">{u.campaignCount}</td>
                <td className="px-5 py-4">
                  {u.isActive
                    ? <span className="text-xs text-success font-medium">Active</span>
                    : <span className="text-xs text-destructive font-medium">Suspended</span>}
                </td>
                <td className="px-5 py-4 text-right">
                  {u.isActive ? (
                    <button disabled={suspend.isPending} onClick={() => suspend.mutate(u.id)} className="h-8 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold disabled:opacity-50">Suspend</button>
                  ) : (
                    <button disabled={reactivate.isPending} onClick={() => reactivate.mutate(u.id)} className="h-8 px-3 rounded-md bg-success text-success-foreground text-xs font-semibold disabled:opacity-50">Reactivate</button>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
