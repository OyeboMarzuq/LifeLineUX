import { apiPost } from "./client";
import type { AuthSession } from "./types";

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export const authApi = {
  register: (dto: RegisterDto) => apiPost<AuthSession>("/auth/register", dto),
  login: (email: string, password: string) =>
    apiPost<AuthSession>("/auth/login", { email, password }),
  logout: () => apiPost<unknown>("/auth/logout"),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiPost<unknown>("/auth/change-password", { currentPassword, newPassword }),
  forgotPassword: (email: string) => apiPost<unknown>("/auth/forgot-password", { email }),
  resetPassword: (email: string, token: string, newPassword: string) =>
    apiPost<unknown>("/auth/reset-password", { email, token, newPassword }),
  google: (idToken: string) => apiPost<AuthSession>("/auth/google", { idToken }),
};
