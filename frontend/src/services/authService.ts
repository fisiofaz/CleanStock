import { apiRequest } from "./api";
import type { LoginResponse } from "@/types/auth";

interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
