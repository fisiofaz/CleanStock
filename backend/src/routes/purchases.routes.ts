import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Listar todas as compras
router.get("/", async (_req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(purchases);
  } catch (error) {
    console.error("Erro ao listar compras:", error);

    res.status(500).json({
      message: "Erro interno ao listar compras.",
    });
  }
});

// Buscar compra por ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID da compra inválido.",
      });
      return;
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            document: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      res.status(404).json({
        message: "Compra não encontrada.",
      });
      return;
    }

    res.json(purchase);
  } catch (error) {
    console.error("Erro ao buscar compra:", error);

    res.status(500).json({
      message: "Erro interno ao buscar compra.",
    });
  }
});

// Cadastrar e confirmar compra
router.post("/", async (req, res) => {
  try {
    const { supplierId, items } = req.body;

    const parsedSupplierId = Number(supplierId);

    if (
      !Number.isInteger(parsedSupplierId) ||
      parsedSupplierId <= 0
    ) {
      res.status(400).json({
        message: "ID do fornecedor inválido.",
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        message: "A compra deve possuir pelo menos um item.",
      });
      return;
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: parsedSupplierId },
    });

    if (!supplier) {
      res.status(404).json({
        message: "Fornecedor não encontrado.",
      });
      return;
    }

    if (!supplier.active) {
      res.status(400).json({
        message: "Não é possível comprar de um fornecedor inativo.",
      });
      return;
    }

    for (const item of items) {
      if (!item || typeof item !== "object") {
        res.status(400).json({
          message: "Item da compra inválido.",
        });
        return;
      }

      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      if (!Number.isInteger(productId) || productId <= 0) {
        res.status(400).json({
          message: "ID do produto inválido.",
        });
        return;
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        res.status(400).json({
          message: "A quantidade deve ser maior que zero.",
        });
        return;
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        res.status(400).json({
          message: "O preço unitário não pode ser negativo.",
        });
        return;
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        res.status(404).json({
          message: `Produto ${productId} não encontrado.`,
        });
        return;
      }

      if (!product.active) {
        res.status(400).json({
          message: `O produto ${product.name} está inativo.`,
        });
        return;
      }
    }

    const total = Number(
      items
        .reduce(
          (sum: number, item: { quantity: number; unitPrice: number }) =>
            sum + Number(item.quantity) * Number(item.unitPrice),
          0,
        )
        .toFixed(2),
    );

    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          supplierId: parsedSupplierId,
          total,
          items: {
            create: items.map((item) => ({
              productId: Number(item.productId),
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
            })),
          },
        },
      });

      for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product || !product.active) {
          throw new Error("Produto indisponível durante a compra.");
        }

        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity + quantity;

        await tx.product.update({
          where: { id: productId },
          data: {
            quantity: newQuantity,
          },
        });

        await tx.movement.create({
          data: {
            type: "ENTRY",
            quantity,
            previousQuantity,
            newQuantity,
            responsible: "Sistema",
            reason: `Entrada por compra #${newPurchase.id}`,
            productId,
          },
        });
      }

      return tx.purchase.findUnique({
        where: { id: newPurchase.id },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      });
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error("Erro ao cadastrar compra:", error);

    res.status(500).json({
      message: "Erro interno ao cadastrar compra.",
    });
  }
});

export default router;
