import { Router } from "express";
import { Prisma } from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { hashPassword } from "../lib/auth.js";

const router = Router();

// Listar usuários (somente administradores)
router.get("/", authenticate, authorize("ADMIN"), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    res.status(500).json({
      message: "Erro interno ao listar usuários.",
    });
  }
});


 // Cadastrar usuário (somente administradores)
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const { name, email, phone, password, role } = req.body;

      // Validar campos obrigatórios
      if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof phone !== "string" ||
        !phone.trim() ||
        typeof password !== "string" ||
        password.length < 8
      ) {
        res.status(400).json({
          message:
            "Informe nome, e-mail, telefone e uma senha com pelo menos 8 caracteres.",
        });
        return;
      }

      // Validar perfil
      const userRole = role ?? "OPERATOR";

      if (userRole !== "ADMIN" && userRole !== "OPERATOR") {
        res.status(400).json({
          message: "Perfil de usuário inválido.",
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Verificar se o e-mail já está cadastrado
      const existingUser = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (existingUser) {
        res.status(409).json({
          message: "Este e-mail já está cadastrado.",
        });
        return;
      }

      // Criptografar a senha antes de salvar
      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          passwordHash,
          role: userRole,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        res.status(409).json({
          message: "Este e-mail já está cadastrado.",
        });
        return;
      }

      res.status(500).json({
        message: "Erro interno ao cadastrar usuário.",
      });
    }
  },
);


 // Buscar usuário pelo ID (somente administradores)
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          message: "ID de usuário inválido.",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          message: "Usuário não encontrado.",
        });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);

      res.status(500).json({
        message: "Erro interno ao buscar usuário.",
      });
    }
  },
);


 // Atualizar usuário (somente administradores)
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          message: "ID de usuário inválido.",
        });
        return;
      }

      const { name, email, phone, role } = req.body;

      if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof phone !== "string" ||
        !phone.trim()
      ) {
        res.status(400).json({
          message: "Nome, e-mail e telefone são obrigatórios.",
        });
        return;
      }

      if (role !== "ADMIN" && role !== "OPERATOR") {
        res.status(400).json({
          message: "Perfil de usuário inválido.",
        });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        res.status(404).json({
          message: "Usuário não encontrado.",
        });
        return;
      }

      // Impedir que o administrador perca o próprio acesso
      if (req.user?.id === id && role !== "ADMIN") {
        res.status(400).json({
          message: "Você não pode alterar seu próprio perfil para operador.",
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const emailInUse = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id },
        },
      });

      if (emailInUse) {
        res.status(409).json({
          message: "Este e-mail já está sendo utilizado.",
        });
        return;
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        res.status(409).json({
          message: "Este e-mail já está sendo utilizado.",
        });
        return;
      }

      res.status(500).json({
        message: "Erro interno ao atualizar usuário.",
      });
    }
  },
);

 // Ativar ou desativar usuário (somente administradores)
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { active } = req.body;

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          message: "ID de usuário inválido.",
        });
        return;
      }

      if (typeof active !== "boolean") {
        res.status(400).json({
          message: "Informe o status como verdadeiro ou falso.",
        });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        res.status(404).json({
          message: "Usuário não encontrado.",
        });
        return;
      }

      // Impedir que o administrador desative a própria conta
      if (req.user?.id === id && active === false) {
        res.status(400).json({
          message: "Você não pode desativar sua própria conta.",
        });
        return;
      }

      const user = await prisma.user.update({
        where: { id },
        data: { active },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          active: true,
          updatedAt: true,
        },
      });

      res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao alterar status do usuário:", error);

      res.status(500).json({
        message: "Erro interno ao alterar status do usuário.",
      });
    }
  },
);

export default router;
