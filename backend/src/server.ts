import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";
import categoriesRoutes from "./routes/categories.routes.js";
import productsRoutes from "./routes/products.routes.js";
import suppliersRoutes from "./routes/suppliers.routes.js";
import purchasesRoutes from "./routes/purchases.routes.js";
import movementsRoutes from "./routes/movements.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/movements", movementsRoutes);

// Rota inicial
app.get("/", (_req, res) => {
  res.json({
    message: "API CleanStock funcionando!",
    status: "online",
  });
});

// Inicialização do servidor
async function startServer() {
  try {
    await prisma.$connect();

    console.log("Conexão com PostgreSQL estabelecida!");

    app.listen(PORT, () => {
      console.log(`CleanStock API rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();
