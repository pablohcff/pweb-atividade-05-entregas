// src/routes/entregas.routes.js
// .catch(next) em cada handler garante que erros de controllers async
// cheguem ao middleware de erro global do Express (app.js).

import { Router } from 'express';

export function entregasRouter(controller) {
  const router = Router();

  router.post('/',                 (req, res, next) => controller.criar(req, res).catch(next));
  router.get('/',                  (req, res, next) => controller.listar(req, res).catch(next));
  router.get('/:id',               (req, res, next) => controller.buscarPorId(req, res).catch(next));
  router.patch('/:id/avancar',     (req, res, next) => controller.avancar(req, res).catch(next));
  router.patch('/:id/cancelar',    (req, res, next) => controller.cancelar(req, res).catch(next));
  router.get('/:id/historico',     (req, res, next) => controller.historico(req, res).catch(next));
  router.patch('/:id/atribuir',    (req, res, next) => controller.atribuir(req, res).catch(next));

  return router;
}
