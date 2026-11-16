import "dotenv/config";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret: string = process.env.JWT_SECRET ?? "";

if (jwtSecret.length === 0) {
  throw new Error("A variável JWT_SECRET não foi configurada.");
}

import type { UserRole } from "../middlewares/auth.middleware.js";

// Criptografar senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Comparar senha informada com a senha armazenada
export async function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

// Gerar token de autenticação
export function generateToken(userId: number, role: UserRole): string {
  return jwt.sign(
    {
      sub: String(userId),
      role,
    },
    jwtSecret,
    {
      expiresIn: "8h",
    },
  );
}
