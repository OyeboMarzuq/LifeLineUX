import { apiGet, apiPost } from "./client";
import type { Donation, DonationInitiateResponse, InitiateDonationDto } from "./types";

export const donationsApi = {
  initiate: (dto: InitiateDonationDto) =>
    apiPost<DonationInitiateResponse>("/donations/initiate", dto),
  verify: (reference: string) =>
    apiGet<unknown>("/donations/verify", { params: { reference } }),
  forCampaign: (campaignId: string) => apiGet<Donation[]>(`/donations/campaign/${campaignId}`),
};
