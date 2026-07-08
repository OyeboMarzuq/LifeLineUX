import { apiDelete, apiGet, apiPost, apiPut, http } from "./client";
import { getAccessToken } from "./tokens";
import type {
  Bank,
  Campaign,
  CampaignUpdate,
  CreateCampaignDto,
  DocumentFileType,
  UpdateCampaignDto,
} from "./types";

export const campaignsApi = {
  banks: () => apiGet<Bank[]>("/campaign/banks"),
  list: (page = 1, pageSize = 10) =>

    apiGet<Campaign[]>("/campaigns", { params: { page, pageSize } }),
  bySlug: (slug: string) => apiGet<Campaign>(`/campaigns/${slug}`),
  mine: () => apiGet<Campaign[]>("/campaigns/my"),
  create: (dto: CreateCampaignDto) => apiPost<Campaign>("/campaigns", dto),
  update: (id: string, dto: UpdateCampaignDto) => apiPut<Campaign>(`/campaigns/${id}`, dto),
  remove: (id: string) => apiDelete<unknown>(`/campaigns/${id}`),

  async uploadCoverImage(id: string, file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await http.post(`/campaigns/${id}/cover-image`, form, {
      headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
    });
    const env = res.data as { isSuccess: boolean; data: string | null; message: string | null };
    if (!env.isSuccess) throw new Error(env.message ?? "Upload failed");
    return env.data as string;
  },

  async uploadDocument(id: string, file: File, fileType: DocumentFileType): Promise<void> {
    const form = new FormData();
    form.append("file", file);
    form.append("fileType", fileType);
    const res = await http.post(`/campaigns/${id}/documents`, form, {
      headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
    });
    const env = res.data as { isSuccess: boolean; message: string | null };
    if (!env.isSuccess) throw new Error(env.message ?? "Upload failed");
  },

  postUpdate: (id: string, dto: { title: string; content: string; imageUrl?: string }) =>
    apiPost<unknown>(`/campaigns/${id}/updates`, dto),
  listUpdates: (id: string) => apiGet<CampaignUpdate[]>(`/campaigns/${id}/updates`),
};
