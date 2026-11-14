import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Listar todos os fornecedores
router.get("/", async (_req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(suppliers);
  } catch (error) {
    console.error("Erro ao listar fornecedores:", error);

    res.status(500).json({
      message: "Erro interno ao listar fornecedores.",
    });
  }
});

// Buscar fornecedor por ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID do fornecedor inválido.",
      });
      return;
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      res.status(404).json({
        message: "Fornecedor não encontrado.",
      });
      return;
    }

    res.json(supplier);
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error);

    res.status(500).json({
      message: "Erro interno ao buscar fornecedor.",
    });
  }
});

// Cadastrar fornecedor
router.post("/", async (req, res) => {
  try {
    const {
      name,
      document,
      contactName,
      phone,
      email,
      address,
    } = req.body;

    const fields = {
      name,
      document,
      contactName,
      phone,
      email,
      address,
    };

    for (const [field, value] of Object.entries(fields)) {
      if (typeof value !== "string" || !value.trim()) {
        res.status(400).json({
          message: `O campo ${field} é obrigatório.`,
        });
        return;
      }
    }

    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({
        message: "E-mail inválido.",
      });
      return;
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        document: document.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
        address: address.trim(),
      },
    });

    res.status(201).json(supplier);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        message: "Já existe um fornecedor cadastrado com esse documento.",
      });
      return;
    }

    console.error("Erro ao cadastrar fornecedor:", error);

    res.status(500).json({
      message: "Erro interno ao cadastrar fornecedor.",
    });
  }
});

// Atualizar fornecedor
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID do fornecedor inválido.",
      });
      return;
    }

    const {
      name,
      document,
      contactName,
      phone,
      email,
      address,
    } = req.body;

    const fields = {
      name,
      document,
      contactName,
      phone,
      email,
      address,
    };

    for (const [field, value] of Object.entries(fields)) {
      if (typeof value !== "string" || !value.trim()) {
        res.status(400).json({
          message: `O campo ${field} é obrigatório.`,
        });
        return;
      }
    }

    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({
        message: "E-mail inválido.",
      });
      return;
    }

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      res.status(404).json({
        message: "Fornecedor não encontrado.",
      });
      return;
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name.trim(),
        document: document.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
        address: address.trim(),
      },
    });

    res.json(supplier);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        message: "Já existe um fornecedor cadastrado com esse documento.",
      });
      return;
    }

    console.error("Erro ao atualizar fornecedor:", error);

    res.status(500).json({
      message: "Erro interno ao atualizar fornecedor.",
    });
  }
});

// Alterar status do fornecedor
router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { active } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "ID do fornecedor inválido.",
      });
      return;
    }

    if (typeof active !== "boolean") {
      res.status(400).json({
        message: "O campo active deve ser verdadeiro ou falso.",
      });
      return;
    }

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      res.status(404).json({
        message: "Fornecedor não encontrado.",
      });
      return;
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: { active },
    });

    res.json(supplier);
  } catch (error) {
    console.error("Erro ao alterar status do fornecedor:", error);

    res.status(500).json({
      message: "Erro interno ao alterar status do fornecedor.",
    });
  }
});

export default router;
