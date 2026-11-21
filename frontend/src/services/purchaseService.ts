import { apiRequest } from "./api";
import type { Purchase } from "@/contexts/StockContext";

type PurchaseItemData = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

type CreatePurchaseData = {
  supplierId: number;
  date: string;
  items: PurchaseItemData[];
};

// Estrutura retornada pela API
type PurchaseApiResponse = {
  id: number;
  supplierId: number;
  supplier: {
    id: number;
    name: string;
  };
  date: string;
  total: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
    product: {
      id: number;
      name: string;
      unit: string;
    };
  }[];
};

// Converte a resposta da API para o modelo do frontend
function mapPurchase(purchase: PurchaseApiResponse): Purchase {
  return {
    id: purchase.id,
    supplierId: purchase.supplierId,
    supplierName: purchase.supplier.name,
    date: purchase.date.slice(0, 10),
    total: purchase.total,
    status: "CONFIRMED",
    items: purchase.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      unit: item.product.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

// Listar compras
export async function getPurchases(): Promise<Purchase[]> {
  const data = await apiRequest<PurchaseApiResponse[]>("/purchases");

  return data.map(mapPurchase);
}

// Cadastrar compra
export async function createPurchase(
  purchaseData: CreatePurchaseData,
): Promise<Purchase> {
  const data = await apiRequest<PurchaseApiResponse>("/purchases", {
    method: "POST",
    body: JSON.stringify(purchaseData),
  });

  return mapPurchase(data);
}
