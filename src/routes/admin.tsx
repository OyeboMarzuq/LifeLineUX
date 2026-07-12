import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RoleGuard roles={["SuperAdmin", "VerificationAdmin"]}>
      <Outlet />
    </RoleGuard>
  ),
  head: () => ({ meta: [{ title: "Admin dashboard — LifeLine" }] }),
});