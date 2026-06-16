// src/routes/relatorios.routes.js

import { Router } from 'express';
import { autenticar } from '../middleware/autenticar.js';
import { autorizar } from '../middleware/autorizar.js';

export function relatoriosRouter(controller) {
  const router = Router();

  // RF-03: relatórios restritos a GESTOR
  router.get('/entregas-por-status', autenticar, autorizar('GESTOR'), (req, res, next) => controller.entregasPorStatus(req, res).catch(next));
  router.get('/motoristas-ativos',   autenticar, autorizar('GESTOR'), (req, res, next) => controller.motoristasAtivos(req, res).catch(next));

  return router;
}
