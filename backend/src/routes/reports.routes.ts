import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "OPERATOR"),
  async (req, res) => {
    try {
      const productIdParam = req.query.productId;

      let productIdFilter: number | undefined;

      if (productIdParam !== undefined) {
        if (
          typeof productIdParam !== "string" ||
          !/^[1-9]\d*$/.test(productIdParam)
        ) {
          res.status(400).json({
            message: "ID do produto inválido.",
          });
          return;
        }

        productIdFilter = Number(productIdParam);
      }

      const startDateParam = req.query.startDate;
      const endDateParam = req.query.endDate;

      if (
        (startDateParam !== undefined &&
          (typeof startDateParam !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(startDateParam))) ||
        (endDateParam !== undefined &&
          (typeof endDateParam !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(endDateParam)))
      ) {
        res.status(400).json({
          message: "Formato de data inválido. Utilize YYYY-MM-DD.",
        });
        return;
      }

      function isValidDate(value: string): boolean {
        const date = new Date(`${value}T00:00:00.000Z`);

        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      }

      if (
        (typeof startDateParam === "string" && !isValidDate(startDateParam)) ||
        (typeof endDateParam === "string" && !isValidDate(endDateParam))
      ) {
        res.status(400).json({
          message: "Data inválida.",
        });
        return;
      }

      if (
        typeof startDateParam === "string" &&
        typeof endDateParam === "string" &&
        startDateParam > endDateParam
      ) {
        res.status(400).json({
          message: "A data inicial não pode ser posterior à data final.",
        });
        return;
      }

      const startDate =
        typeof startDateParam === "string"
          ? new Date(`${startDateParam}T00:00:00.000`)
          : undefined;

      const endDate =
        typeof endDateParam === "string"
          ? new Date(`${endDateParam}T23:59:59.999`)
          : undefined;

      const [activeProducts, products, purchases, allMovements, movements] =
        await Promise.all([
          prisma.product.count({
            where: { active: true },
          }),

          prisma.product.findMany({
            where: { active: true },
            select: {
              quantity: true,
              unitPrice: true,
              minimumStock: true,
            },
          }),

          prisma.purchase.findMany({
            select: {
              total: true,
            },
          }),

          prisma.movement.findMany({
            select: {
              type: true,
            },
          }),

          prisma.movement.findMany({
            where: {
              ...(productIdFilter !== undefined && {
                productId: productIdFilter,
              }),

              ...((startDate || endDate) && {
                date: {
                  ...(startDate && { gte: startDate }),
                  ...(endDate && { lte: endDate }),
                },
              }),
            },
            select: {
              id: true,
              productId: true,
              type: true,
              quantity: true,
              date: true,
            },
          }),
        ]);

      const inventoryValue = products.reduce(
        (total, product) =>
          total + product.quantity * Number(product.unitPrice),
        0,
      );

      const lowStockProducts = products.filter(
        (product) => product.quantity <= product.minimumStock,
      ).length;

      const totalPurchaseValue = purchases.reduce(
        (total, purchase) => total + Number(purchase.total),
        0,
      );

      const totalEntries = allMovements.filter(
        (movement) => movement.type === "ENTRY",
      ).length;

      const totalConsumptions = allMovements.filter(
        (movement) => movement.type === "EXIT",
      ).length;

      const totalLosses = allMovements.filter(
        (movement) => movement.type === "LOSS",
      ).length;

      const totalAdjustments = allMovements.filter(
        (movement) => movement.type === "ADJUSTMENT",
      ).length;

      const productEntries = movements
        .filter((movement) => movement.type === "ENTRY")
        .reduce((total, movement) => total + movement.quantity, 0);

      const productConsumptions = movements
        .filter((movement) => movement.type === "EXIT")
        .reduce((total, movement) => total + movement.quantity, 0);

      const productLosses = movements
        .filter((movement) => movement.type === "LOSS")
        .reduce((total, movement) => total + movement.quantity, 0);

      const monthlyMovements = Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - (5 - index));

        const year = date.getFullYear();
        const month = date.getMonth();

        const monthMovements = movements.filter((movement) => {
          const movementDate = new Date(movement.date);

          return (
            movementDate.getFullYear() === year &&
            movementDate.getMonth() === month
          );
        });

        return {
          month: date.toLocaleDateString("pt-BR", { month: "short" }),

          entries: monthMovements
            .filter((movement) => movement.type === "ENTRY")
            .reduce((total, movement) => total + movement.quantity, 0),

          consumptions: monthMovements
            .filter((movement) => movement.type === "EXIT")
            .reduce((total, movement) => total + movement.quantity, 0),

          losses: monthMovements
            .filter((movement) => movement.type === "LOSS")
            .reduce((total, movement) => total + movement.quantity, 0),
        };
      });

      res.status(200).json({
        activeProducts,
        inventoryValue,
        lowStockProducts,
        totalPurchases: purchases.length,
        totalPurchaseValue,
        totalEntries,
        totalConsumptions,
        totalLosses,
        totalAdjustments,
        productEntries,
        productConsumptions,
        productLosses,
        monthlyMovements,
      });
    } catch {
      res.status(500).json({
        message: "Erro ao carregar os relatórios.",
      });
    }
  },
);

export default router;
