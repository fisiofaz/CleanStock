import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "OPERATOR"),
  async (_req, res) => {
    try {
      const [
        totalProducts,
        products,
        activeProductsForStock,
        totalPurchases,
        recentMovements,
        lowStockProductsData,
      ] = await Promise.all([
        prisma.product.count({
          where: { active: true },
        }),

        prisma.product.findMany({
          where: { active: true },
          select: {
            quantity: true,
            unitPrice: true,
          },
        }),

        prisma.product.findMany({
          where: {
            active: true,
          },
          select: {
            quantity: true,
            minimumStock: true,
          },
        }),

        prisma.purchase.count(),

        prisma.movement.findMany({
          take: 5,
          orderBy: {
            date: "desc",
          },
          include: {
            product: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        }),

        prisma.product.findMany({
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            quantity: true,
            unit: true,
            minimumStock: true,
          },
        }),
      ]);
        
      const inventoryValue = products.reduce(
        (total, product) =>
          total + product.quantity * Number(product.unitPrice),
        0,
      );

      const lowStock = activeProductsForStock.filter(
        (product) => product.quantity <= product.minimumStock,
      ).length;

      const lowStockProducts = lowStockProductsData.filter(
        (product) => product.quantity <= product.minimumStock,
      );

      res.status(200).json({
        totalProducts,
        inventoryValue,
        lowStock,
        totalPurchases,
        recentMovements,
        lowStockProducts,
      });
    } catch {
      res.status(500).json({
        message: "Erro ao carregar os dados do Dashboard.",
      });
    }
  },
);

export default router;
