// src/routes/entregas.routes.js
// .catch(next) em cada handler garante que erros de controllers async
// cheguem ao middleware de erro global do Express (app.js).

import { Router } from 'express';
import { autenticar } from '../middleware/autenticar.js';
import { autorizar } from '../middleware/autorizar.js';

export function entregasRouter(controller) {
  const router = Router();

  router.post('/',                 autenticar, (req, res, next) => controller.criar(req, res).catch(next));
  router.get('/',                  autenticar, (req, res, next) => controller.listar(req, res).catch(next));
  router.get('/:id',               autenticar, (req, res, next) => controller.buscarPorId(req, res).catch(next));
  router.patch('/:id/avancar',     autenticar, (req, res, next) => controller.avancar(req, res).catch(next));
  // RF-03: apenas GESTOR pode cancelar
  router.patch('/:id/cancelar',    autenticar, autorizar('GESTOR'), (req, res, next) => controller.cancelar(req, res).catch(next));
  router.get('/:id/historico',     autenticar, (req, res, next) => controller.historico(req, res).catch(next));
  router.patch('/:id/atribuir',    autenticar, (req, res, next) => controller.atribuir(req, res).catch(next));

  return router;
}
