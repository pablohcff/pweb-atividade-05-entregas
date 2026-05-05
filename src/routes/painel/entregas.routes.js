// src/routes/painel/entregas.routes.js
import { Router } from 'express';

export function painelEntregasRouter(controller) {
  const router = Router();

  const h = (fn) => (req, res, next) => fn.call(controller, req, res).catch(next);

  router.get('/',                    h(controller.index));
  router.get('/nova',                h(controller.nova));
  router.post('/',                   h(controller.criar));
  router.get('/:id',                  h(controller.detalhe));
  router.patch('/:id/avancar',        h(controller.avancar));
  router.patch('/:id/cancelar',       h(controller.cancelar));

  return router;
}
