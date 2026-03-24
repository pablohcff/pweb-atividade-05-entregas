import express from "express";
import { Database } from "../database/database.js";
import { EntregasRepositories } from "../repositories/EntregasRepositories.js";
import { EntregasService } from "../services/EntregasService.js";
import { EntregasController } from "../controller/controller.js";

const router = express.Router();

const database = new Database();
const repository = new EntregasRepositories(database);
const service = new EntregasService(repository);
const controller = new EntregasController(service);

// Rotas corresspondentes
router.post("/", controller.criar);
router.get("/", controller.listar);
router.get("/:id", controller.buscar);
router.patch("/:id/avancar", controller.avancar);
router.patch("/:id/cancelar", controller.cancelar);
router.get("/:id/historico", controller.historico);

export default router;