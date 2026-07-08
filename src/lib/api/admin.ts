import { apiGet, apiPut } from "./client";
import type { AdminCampaign, AdminUser, CampaignStatus } from "./types";

export const adminApi = {
  listCampaigns: (params: { page?: number; pageSize?: number; status?: CampaignStatus } = {}) =>
    apiGet<AdminCampaign[]>("/admin/campaigns", { params }),
  getCampaign: (id: string) => apiGet<AdminCampaign>(`/admin/campaigns/${id}`),
  verifyCampaign: (id: string) => apiPut<unknown>(`/admin/campaigns/${id}/verify`),
  rejectCampaign: (id: string, reason: string) =>
    apiPut<unknown>(`/admin/campaigns/${id}/reject`, { reason }),
  listUsers: (page = 1, pageSize = 20) =>
    apiGet<AdminUser[]>("/admin/users", { params: { page, pageSize } }),
  suspendUser: (id: string) => apiPut<unknown>(`/admin/users/${id}/suspend`),
  reactivateUser: (id: string) => apiPut<unknown>(`/admin/users/${id}/reactivate`),
};
