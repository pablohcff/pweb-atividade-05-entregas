import express from "express";
import entregasRoutes from "./routes/routes.js";
import { AppError } from "./utils/utils.js";

const app = express();

app.use(express.json());

app.use("/api/entregas", entregasRoutes);

// Middleware de erro
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message });
  }

  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});