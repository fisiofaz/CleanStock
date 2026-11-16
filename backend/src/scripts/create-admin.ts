import "dotenv/config";

import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/auth.js";

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const phone = process.env.ADMIN_PHONE?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !phone || !password || password.length < 8) {
    throw new Error(
      "Informe nome, e-mail, telefone e senha com pelo menos 8 caracteres.",
    );
  }

  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    throw new Error(
      "Já existem usuários cadastrados. O primeiro administrador só pode ser criado quando o banco estiver vazio.",
    );
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "ADMIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Administrador criado com sucesso:");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error("Erro ao criar administrador:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
