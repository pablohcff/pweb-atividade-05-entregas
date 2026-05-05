// src/routes/painel/motoristas.routes.js
import { Router } from 'express';

export function painelMotoristasRouter(controller) {
  const router = Router();

  const h = (fn) => (req, res, next) => fn.call(controller, req, res).catch(next);

  router.get('/',      h(controller.index));
  router.get('/novo',  h(controller.novo));
  router.post('/',     h(controller.criar));

  return router;
}
