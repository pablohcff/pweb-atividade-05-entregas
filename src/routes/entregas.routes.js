// src/routes/entregas.routes.js

import { Router } from 'express';
import { Database } from '../database/database.js';
import { EntregasRepository } from '../repositories/EntregasRepository.js';
import { EntregasService } from '../services/EntregasService.js';
import { EntregasController } from '../controllers/EntregasController.js';

const router = Router();

// Composição / injeção de dependência
const database = new Database();
const repository = new EntregasRepository(database);
const service = new EntregasService(repository);
const controller = new EntregasController(service);

router.post('/', (req, res) => controller.criar(req, res));
router.get('/', (req, res) => controller.listar(req, res));
router.get('/:id', (req, res) => controller.buscarPorId(req, res));
router.patch('/:id/avancar', (req, res) => controller.avancar(req, res));
router.patch('/:id/cancelar', (req, res) => controller.cancelar(req, res));
router.get('/:id/historico', (req, res) => controller.historico(req, res));
router.patch('/:id/atribuir', (req, res) => controller.atribuir(req, res));

export default router;

