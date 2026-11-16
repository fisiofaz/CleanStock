import "dotenv/config";

import type { Request, RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export type UserRole = "ADMIN" | "OPERATOR";

// Adiciona os dados do usuário autenticado ao Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
      };
    }
  }
}

const jwtSecret: string = process.env.JWT_SECRET ?? "";

if (jwtSecret.length === 0) {
  throw new Error("A variável JWT_SECRET não foi configurada.");
}

// Verifica se o token enviado é válido
export const authenticate: RequestHandler = async (req: Request, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Token de autenticação não informado.",
    });
    return;
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "Token de autenticação inválido.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded !== "object" || decoded === null) {
      res.status(401).json({
        message: "Token inválido.",
      });
      return;
    }

    const payload = decoded as JwtPayload;
    const userId = Number(payload.sub);
    const role = payload.role;

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      (role !== "ADMIN" && role !== "OPERATOR")
    ) {
      res.status(401).json({
        message: "Token inválido.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        active: true,
      },
    });

    if (!user || !user.active || user.role !== role) {
      res.status(401).json({
        message: "Usuário não encontrado ou inativo.",
      });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
};

// Verifica se o usuário possui o perfil necessário
export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        message: "Usuário não autenticado.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "Você não tem permissão para realizar esta operação.",
      });
      return;
    }

    next();
  };
}

