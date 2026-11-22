import { apiRequest } from "./api";

export type DashboardMovement = {
  id: number;
  type: "ENTRY" | "EXIT" | "LOSS" | "ADJUSTMENT";
  quantity: number;
  date: string;
  responsible: string;
  reason: string;
  product: {
    name: string;
    unit: string;
  };
};

export type LowStockProduct = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minimumStock: number;
};

export type DashboardData = {
  totalProducts: number;
  inventoryValue: number;
  lowStock: number;
  totalPurchases: number;
  recentMovements: DashboardMovement[];
  lowStockProducts: LowStockProduct[];
};

export async function getDashboard(): Promise<DashboardData> {
  return apiRequest<DashboardData>("/dashboard");
}
