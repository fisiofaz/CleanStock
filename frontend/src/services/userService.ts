import { apiRequest } from "./api";

import type { User } from "@/contexts/StockContext";

type UserData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "ADMIN" | "OPERATOR";
};

type UpdateUserData = {
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "OPERATOR";
};

export async function getUsers(): Promise<User[]> {
  return apiRequest<User[]>("/users");
}

export async function createUser(userData: UserData): Promise<User> {
  return apiRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function updateUser(
  id: number,
  userData: UpdateUserData,
): Promise<User> {
  return apiRequest<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function updateUserStatus(
  id: number,
  active: boolean,
): Promise<User> {
  return apiRequest<User>(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}


