import { Router } from 'express';
 
export function motoristasRouter(controller) {
  const router = Router();
 
  router.post('/',               (req, res, next) => controller.criar(req, res).catch(next));
  router.get('/',                (req, res, next) => controller.listar(req, res).catch(next));
  router.get('/:id',             (req, res, next) => controller.buscarPorId(req, res).catch(next));
  router.get('/:id/entregas',    (req, res, next) => controller.listarEntregas(req, res).catch(next));
 
  return router;
}
 