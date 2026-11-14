import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Listar todos os produtos
router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);

    res.status(500).json({
      message: "Erro interno ao listar produtos.",
    });
  }
});

// Buscar um produto pelo ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID do produto inválido.",
      });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        message: "Produto não encontrado.",
      });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);

    res.status(500).json({
      message: "Erro interno ao buscar produto.",
    });
  }
});

 // Cadastrar um produto
router.post("/", async (req, res) => {
  try {
    const {
      name,
      categoryId,
      quantity,
      unit,
      unitPrice,
      minimumStock,
      description,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isInteger(Number(categoryId)) ||
      Number(categoryId) <= 0 ||
      typeof unit !== "string" ||
      !unit.trim() ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) < 0 ||
      !Number.isFinite(Number(unitPrice)) ||
      Number(unitPrice) < 0 ||
      !Number.isFinite(Number(minimumStock)) ||
      Number(minimumStock) < 0 ||
      (description !== undefined && description !== null &&
        typeof description !== "string")
    ) {
      res.status(400).json({
        message: "Dados do produto inválidos ou incompletos.",
      });
      return;
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: Number(categoryId),
      },
    });

    if (!existingCategory) {
      res.status(400).json({
        message: "A categoria informada não existe.",
      });
      return;
    }

    if (!existingCategory.active) {
      res.status(400).json({
        message: "Não é possível cadastrar produtos em uma categoria inativa.",
      });
      return;
    }

    const product = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
            data: {
            name: name.trim(),
            categoryId: Number(categoryId),
            quantity: Number(quantity),
            unit: unit.trim(),
            unitPrice: Number(unitPrice),
            minimumStock: Number(minimumStock),
            description: description?.trim() || null,
            },
            include: {
            category: {
                select: {
                name: true,
                },
            },
            },
        });

        if (Number(quantity) > 0) {
            await tx.movement.create({
            data: {
                type: "ENTRY",
                quantity: Number(quantity),
                previousQuantity: 0,
                newQuantity: Number(quantity),
                responsible: "Cadastro do sistema",
                reason: "Estoque inicial no cadastro do produto",
                productId: newProduct.id,
            },
            });
        }

        return newProduct;
    });


    res.status(201).json(product);
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);

    res.status(500).json({
      message: "Erro interno ao cadastrar produto.",
    });
  }
});


// Atualizar os dados de um produto
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID do produto inválido.",
      });
      return;
    }

    const {
      name,
      categoryId,
      unit,
      unitPrice,
      minimumStock,
      description,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isInteger(Number(categoryId)) ||
      Number(categoryId) <= 0 ||
      typeof unit !== "string" ||
      !unit.trim() ||
      !Number.isFinite(Number(unitPrice)) ||
      Number(unitPrice) < 0 ||
      !Number.isFinite(Number(minimumStock)) ||
      Number(minimumStock) < 0 ||
      (description !== undefined &&
        description !== null &&
        typeof description !== "string")
    ) {
      res.status(400).json({
        message: "Dados do produto inválidos ou incompletos.",
      });
      return;
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({
        message: "Produto não encontrado.",
      });
      return;
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: Number(categoryId),
      },
    });

    if (!existingCategory) {
      res.status(400).json({
        message: "A categoria informada não existe.",
      });
      return;
    }

    if (!existingCategory.active) {
      res.status(400).json({
        message: "Não é possível utilizar uma categoria inativa.",
      });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        categoryId: Number(categoryId),
        unit: unit.trim(),
        unitPrice: Number(unitPrice),
        minimumStock: Number(minimumStock),
        description: description?.trim() || null,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

    res.status(500).json({
      message: "Erro interno ao atualizar produto.",
    });
  }
});


// Ativar ou desativar um produto
router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { active } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID do produto inválido.",
      });
      return;
    }

    if (typeof active !== "boolean") {
      res.status(400).json({
        message: "O campo active deve ser verdadeiro ou falso.",
      });
      return;
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({
        message: "Produto não encontrado.",
      });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: { active },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(product);
  } catch (error) {
    console.error("Erro ao alterar status do produto:", error);

    res.status(500).json({
      message: "Erro interno ao alterar status do produto.",
    });
  }
});

export default router;
