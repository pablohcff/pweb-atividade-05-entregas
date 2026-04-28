// src/routes/relatorios.routes.js

import { Router } from 'express';

export function relatoriosRouter(controller) {
  const router = Router();

  router.get('/entregas-por-status', (req, res, next) => controller.entregasPorStatus(req, res).catch(next));
  router.get('/motoristas-ativos',   (req, res, next) => controller.motoristasAtivos(req, res).catch(next));

  return router;
}
