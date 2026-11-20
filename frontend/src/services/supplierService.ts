import { apiRequest } from "./api";
import type { Supplier } from "@/contexts/StockContext";

type SupplierData = Omit<Supplier, "id" | "active">;

export async function getSuppliers(): Promise<Supplier[]> {
  return apiRequest<Supplier[]>("/suppliers");
}

export async function createSupplier(data: SupplierData): Promise<Supplier> {
  return apiRequest<Supplier>("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSupplier(
  id: number,
  data: SupplierData,
): Promise<Supplier> {
  return apiRequest<Supplier>(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateSupplierStatus(
  id: number,
  active: boolean,
): Promise<Supplier> {
  return apiRequest<Supplier>(`/suppliers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
