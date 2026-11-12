import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (_req, res) => {
  res.json({
    message: "API CleanStock funcionando!",
    status: "online",
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`CleanStock API rodando na porta ${PORT}`);
});
