import { apiClient } from "./client";
import { User } from "../@types";

export interface AuthMeResponse {
  success: boolean;
  user: User;
  allUsers: User[];
}

export const authApi = {
  getMe: () => apiClient<AuthMeResponse>("/auth/me"),
  switchUser: (switchUserId: string) =>
    apiClient<{ success: boolean; user: User }>("/auth/me", {
      method: "POST",
      body: JSON.stringify({ switchUserId }),
    }),
  register: (payload: any) =>
    apiClient<{ success: boolean; user: User }>("/auth/me", {
      method: "POST",
      body: JSON.stringify({ action: "register", ...payload }),
    }),
};

