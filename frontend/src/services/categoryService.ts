import { apiRequest } from "./api";
import type { Category } from "@/contexts/StockContext";

type CategoryData = Pick<Category, "name" | "description">;

// Listar categorias
export async function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/categories");
}

// Cadastrar categoria
export async function createCategory(data: CategoryData): Promise<Category> {
  return apiRequest<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Atualizar categoria
export async function updateCategory(
  id: number,
  data: CategoryData,
): Promise<Category> {
  return apiRequest<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Alterar status da categoria
export async function updateCategoryStatus(
  id: number,
  active: boolean,
): Promise<Category> {
  return apiRequest<Category>(`/categories/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
