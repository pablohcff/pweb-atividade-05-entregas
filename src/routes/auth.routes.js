// src/routes/auth.routes.js

import { Router } from 'express';

export function authRouter(controller) {
  const router = Router();

  router.post('/registrar', (req, res, next) => controller.registrar(req, res).catch(next));
  router.post('/login',     (req, res, next) => controller.login(req, res).catch(next));

  return router;
}
