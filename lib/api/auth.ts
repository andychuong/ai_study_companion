import apiClient from "./client";
import { User } from "@/types";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor";
  grade?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (data: LoginData) =>
    apiClient.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>("/auth/register", data),

  logout: () =>
    apiClient.post("/auth/logout"),

  getCurrentUser: () =>
    apiClient.get<User>("/auth/me"),
};

