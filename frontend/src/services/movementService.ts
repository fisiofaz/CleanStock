import { apiRequest } from "./api";
import type { Movement, MovementType } from "@/contexts/StockContext";

type MovementData = {
  productId: number;
  type: MovementType;
  quantity: number;
  responsible: string;
  reason: string;
};

type MovementApiResponse = {
  id: number;
  productId: number;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  date: string;
  responsible: string;
  reason: string;
  product: {
    id: number;
    name: string;
    unit: string;
  };
};

function mapMovement(movement: MovementApiResponse): Movement {
  return {
    id: movement.id,
    productId: movement.productId,
    productName: movement.product.name,
    type: movement.type,
    quantity: movement.quantity,
    previousQuantity: movement.previousQuantity,
    newQuantity: movement.newQuantity,
    date: movement.date,
    responsible: movement.responsible,
    reason: movement.reason,
  };
}

export async function getMovements(): Promise<Movement[]> {
  const data = await apiRequest<MovementApiResponse[]>("/movements");

  return data.map(mapMovement);
}

export async function createMovement(
  movementData: MovementData,
): Promise<Movement> {
  const data = await apiRequest<MovementApiResponse>("/movements", {
    method: "POST",
    body: JSON.stringify(movementData),
  });

  return mapMovement(data);
}
