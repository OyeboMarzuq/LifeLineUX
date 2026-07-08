// Shared types matching the .NET API exactly per the integration guide.

export type Role =
  | "SuperAdmin"
  | "VerificationAdmin"
  | "CampaignCreator"
  | "Donor"
  | "Organization";

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
  statusCode: number;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface JwtClaims {
  sub: string;
  email: string;
  userId: string;
  fullName: string;
  role: Role;
  exp: number;
}

export type CampaignStatus = "Pending" | "Verified" | "Rejected" | "Completed";

export interface Campaign {
  id: string;
  title: string;
  patientName: string;
  medicalCondition: string;
  story: string;
  goalAmount: number;
  amountRaised: number;
  percentageRaised: number;
  coverImageUrl: string | null;
  slug: string;
  status: CampaignStatus;
  isVerified: boolean;
  verifiedAt: string | null;
  surgeryDate: string | null;
  donorCount: number;
  creatorName: string;
  creatorId: string;
  createdAt: string;
}

export interface AdminCampaign extends Campaign {
  bankName: string;
  accountNumber: string;
  accountName: string;
  rejectionReason: string | null;
  creatorEmail: string;
  documents: CampaignDocument[];
}

export interface CampaignDocument {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  postedAt: string;
}

export interface Donation {
  id: string;
  amount: number;
  donorName: string;
  message: string | null;
  isAnonymous: boolean;
  isVerified: boolean;
  donatedAt: string;
}

export interface DonationInitiateResponse {
  paymentReference: string;
  paymentUrl: string;
}


export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  campaignCount: number;
}

export interface CreateCampaignDto {
  title: string;
  patientName: string;
  medicalCondition: string;
  story: string;
  goalAmount: number;
  surgeryDate?: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface UpdateCampaignDto {
  title?: string;
  story?: string;
  goalAmount?: number;
  surgeryDate?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface InitiateDonationDto {
  campaignId: string;
  amount: number;
  isAnonymous?: boolean;
  message?: string;
  donorName?: string;
  donorEmail?: string;
}


export type DocumentFileType =
  | "hospital_bill"
  | "medical_report"
  | "doctor_letter"
  | "other";
