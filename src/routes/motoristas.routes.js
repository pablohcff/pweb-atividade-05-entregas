import { Router } from 'express';
import { autenticar } from '../middleware/autenticar.js';
import { autorizar } from '../middleware/autorizar.js';
 
export function motoristasRouter(controller) {
  const router = Router();
 
  // RF-03: criar e atualizar motorista restritos a GESTOR
  router.post('/',               autenticar, autorizar('GESTOR'), (req, res, next) => controller.criar(req, res).catch(next));
  router.get('/',                autenticar, (req, res, next) => controller.listar(req, res).catch(next));
  router.get('/:id',             autenticar, (req, res, next) => controller.buscarPorId(req, res).catch(next));
  router.get('/:id/entregas',    autenticar, (req, res, next) => controller.listarEntregas(req, res).catch(next));
 
  return router;
}
 