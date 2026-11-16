import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { comparePassword, generateToken } from "../lib/auth.js";

const router = Router();

// Login do usuário
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({
        message: "Informe e-mail e senha.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    // Não revelar se o e-mail existe ou se a senha está incorreta
    if (!user || !user.active) {
      res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
      return;
    }

    const passwordIsValid = await comparePassword(password, user.passwordHash);

    if (!passwordIsValid) {
      res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);

    res.status(500).json({
      message: "Erro interno ao realizar login.",
    });
  }
});

export default router;
