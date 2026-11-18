export type UserRole = "ADMIN" | "OPERATOR";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
