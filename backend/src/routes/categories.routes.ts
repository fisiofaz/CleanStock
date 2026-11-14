import { Router } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Listar todas as categorias
router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);

    res.status(500).json({
      message: "Erro interno ao buscar categorias.",
    });
  }
});

// Buscar uma categoria pelo ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID da categoria inválido.",
      });
      return;
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      res.status(404).json({
        message: "Categoria não encontrada.",
      });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);

    res.status(500).json({
      message: "Erro interno ao buscar categoria.",
    });
  }
});

// Cadastrar uma nova categoria
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      !name.trim() ||
      !description.trim()
    ) {
      res.status(400).json({
        message: "Nome e descrição são obrigatórios.",
      });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description.trim(),
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        message: "Já existe uma categoria com esse nome.",
      });
      return;
    }

    console.error("Erro ao cadastrar categoria:", error);

    res.status(500).json({
      message: "Erro interno ao cadastrar categoria.",
    });
  }
});

// Atualizar uma categoria
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID da categoria inválido.",
      });
      return;
    }

    const { name, description } = req.body;

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      !name.trim() ||
      !description.trim()
    ) {
      res.status(400).json({
        message: "Nome e descrição são obrigatórios.",
      });
      return;
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      res.status(404).json({
        message: "Categoria não encontrada.",
      });
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description.trim(),
      },
    });

    res.json(category);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        message: "Já existe uma categoria com esse nome.",
      });
      return;
    }

    console.error("Erro ao atualizar categoria:", error);

    res.status(500).json({
      message: "Erro interno ao atualizar categoria.",
    });
  }
});

// Ativar ou desativar uma categoria
router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID da categoria inválido.",
      });
      return;
    }

    const { active } = req.body;

    if (typeof active !== "boolean") {
      res.status(400).json({
        message: "O status deve ser true ou false.",
      });
      return;
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      res.status(404).json({
        message: "Categoria não encontrada.",
      });
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        active,
      },
    });

    res.json(category);
  } catch (error) {
    console.error("Erro ao alterar status da categoria:", error);

    res.status(500).json({
      message: "Erro interno ao alterar status da categoria.",
    });
  }
});

export default router;
