import { apiRequest } from "./api";

export type ReportData = {
  activeProducts: number;
  inventoryValue: number;
  lowStockProducts: number;
  totalPurchases: number;
  totalPurchaseValue: number;
  totalEntries: number;
  totalConsumptions: number;
  totalLosses: number;
  totalAdjustments: number;
  productEntries: number;
  productConsumptions: number;
  productLosses: number;
  monthlyMovements: {
    month: string;
    entries: number;
    consumptions: number;
    losses: number;
  }[];
};

type ReportFilters = {
  productId?: number;
  startDate?: string;
  endDate?: string;
};

export async function getReports(
  filters: ReportFilters = {},
): Promise<ReportData> {
  const params = new URLSearchParams();

  if (filters.productId !== undefined) {
    params.set("productId", filters.productId.toString());
  }

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const query = params.toString();

  return apiRequest<ReportData>(`/reports${query ? `?${query}` : ""}`);
}
