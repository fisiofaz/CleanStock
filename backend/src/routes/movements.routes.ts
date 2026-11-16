import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Listar todas as movimentações
router.get("/", async (_req, res) => {
  try {
    const movements = await prisma.movement.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(movements);
  } catch (error) {
    console.error("Erro ao listar movimentações:", error);

    res.status(500).json({
      message: "Erro interno ao listar movimentações.",
    });
  }
});

 // Registrar uma nova movimentação
router.post("/", async (req, res) => {
  const { productId, type, quantity, responsible, reason } = req.body;

  // Validar o ID do produto
  if (!Number.isInteger(productId) || productId <= 0) {
    res.status(400).json({
      message: "ID do produto inválido.",
    });
    return;
  }

  // Validar o tipo de movimentação
  const validTypes = ["ENTRY", "EXIT", "LOSS", "ADJUSTMENT"];

  if (!validTypes.includes(type)) {
    res.status(400).json({
      message: "Tipo de movimentação inválido.",
    });
    return;
  }

  // Validar a quantidade
  if (
    typeof quantity !== "number" ||
    !Number.isFinite(quantity) ||
    quantity < 0 ||
    (type !== "ADJUSTMENT" && quantity === 0)
  ) {
    res.status(400).json({
      message: "Informe uma quantidade válida.",
    });
    return;
  }

  // Validar responsável e justificativa
  if (
    typeof responsible !== "string" ||
    !responsible.trim() ||
    typeof reason !== "string" ||
    !reason.trim()
  ) {
    res.status(400).json({
      message: "Informe o responsável e a justificativa.",
    });
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return { error: "NOT_FOUND" as const };
      }

      if (!product.active) {
        return { error: "INACTIVE" as const };
      }

      const previousQuantity = product.quantity;

      let newQuantity: number;

      switch (type) {
        case "ENTRY":
          newQuantity = previousQuantity + quantity;
          break;

        case "EXIT":
        case "LOSS":
          newQuantity = previousQuantity - quantity;
          break;

        case "ADJUSTMENT":
          newQuantity = quantity;
          break;

        default:
          return { error: "INVALID_TYPE" as const };
      }

      if (newQuantity < 0) {
        return { error: "INSUFFICIENT_STOCK" as const };
      }

      if (newQuantity === previousQuantity) {
        return { error: "NO_CHANGE" as const };
      }

      // Atualizar o estoque do produto
      await tx.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      });

      // Registrar a movimentação
      const movement = await tx.movement.create({
        data: {
          type,
          quantity:
            type === "ADJUSTMENT"
              ? Math.abs(newQuantity - previousQuantity)
              : quantity,
          previousQuantity,
          newQuantity,
          responsible: responsible.trim(),
          reason: reason.trim(),
          productId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true,
            },
          },
        },
      });

      return { movement };
    });

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        res.status(404).json({
          message: "Produto não encontrado.",
        });
        return;
      }

      if (result.error === "INACTIVE") {
        res.status(400).json({
          message: "Não é possível movimentar um produto inativo.",
        });
        return;
      }

      if (result.error === "INSUFFICIENT_STOCK") {
        res.status(400).json({
          message: "Estoque insuficiente para realizar essa movimentação.",
        });
        return;
      }

      if (result.error === "NO_CHANGE") {
        res.status(400).json({
          message: "A quantidade informada não altera o estoque.",
        });
        return;
      }

      res.status(400).json({
        message: "Tipo de movimentação inválido.",
      });
      return;
    }

    res.status(201).json(result.movement);
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);

    res.status(500).json({
      message: "Erro interno ao registrar movimentação.",
    });
  }
});

 // Buscar movimentação por ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID da movimentação inválido.",
      });
      return;
    }

    const movement = await prisma.movement.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    });

    if (!movement) {
      res.status(404).json({
        message: "Movimentação não encontrada.",
      });
      return;
    }

    res.json(movement);
  } catch (error) {
    console.error("Erro ao buscar movimentação:", error);

    res.status(500).json({
      message: "Erro interno ao buscar movimentação.",
    });
  }
});


export default router;
