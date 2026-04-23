// src/routes/relatorios.routes.js

import { Router } from 'express';

export function relatoriosRouter(controller) {
  const router = Router();

  router.get('/entregas-por-status', (req, res) => controller.entregasPorStatus(req, res));
  router.get('/motoristas-ativos', (req, res) => controller.motoristasAtivos(req, res));

  return router;
}
