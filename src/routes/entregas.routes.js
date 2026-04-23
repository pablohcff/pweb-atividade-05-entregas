// src/routes/entregas.routes.js

import { Router } from 'express';

export function entregasRouter(controller) {
  const router = Router();

  router.post('/', (req, res) => controller.criar(req, res));
  router.get('/', (req, res) => controller.listar(req, res));
  router.get('/:id', (req, res) => controller.buscarPorId(req, res));
  router.patch('/:id/avancar', (req, res) => controller.avancar(req, res));
  router.patch('/:id/cancelar', (req, res) => controller.cancelar(req, res));
  router.get('/:id/historico', (req, res) => controller.historico(req, res));
  router.patch('/:id/atribuir', (req, res) => controller.atribuir(req, res));

  return router;
}
