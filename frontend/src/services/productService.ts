import { apiRequest } from "./api";
import type { Product } from "@/contexts/StockContext";

interface ProductApiResponse {
  id: number;
  name: string;
  categoryId: number;
  category: {
    name: string;
  };
  quantity: number;
  unit: string;
  unitPrice: number;
  minimumStock: number;
  active: boolean;
  description: string | null;
}

interface CreateProductData {
  name: string;
  categoryId: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  minimumStock: number;
  description?: string;
}

interface UpdateProductData {
  name: string;
  categoryId: number;
  unit: string;
  unitPrice: number;
  minimumStock: number;
  description?: string;
}

// Converter o produto recebido da API para o formato do frontend
function mapProduct(product: ProductApiResponse): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category.name,
    categoryId: product.categoryId,
    quantity: product.quantity,
    unit: product.unit,
    unitPrice: product.unitPrice,
    minimumStock: product.minimumStock,
    active: product.active,
    description: product.description ?? undefined,
  };
}

// Listar produtos
export async function getProducts(): Promise<Product[]> {
  const products = await apiRequest<ProductApiResponse[]>("/products");

  return products.map(mapProduct);
}

// Cadastrar produto
export async function createProduct(data: CreateProductData): Promise<Product> {
  const product = await apiRequest<ProductApiResponse>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return mapProduct(product);
}

// Atualizar produto
export async function updateProduct(
  id: number,
  data: UpdateProductData,
): Promise<Product> {
  const product = await apiRequest<ProductApiResponse>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return mapProduct(product);
}

// Alterar status do produto
export async function updateProductStatus(
  id: number,
  active: boolean,
): Promise<Product> {
  const product = await apiRequest<ProductApiResponse>(
    `/products/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ active }),
    },
  );

  return mapProduct(product);
}
