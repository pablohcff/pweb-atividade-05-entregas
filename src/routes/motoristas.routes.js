import { Router } from 'express';
 
export function motoristasRouter(controller) {
  const router = Router();
 
  router.post('/', (req, res) => controller.criar(req, res));
  router.get('/', (req, res) => controller.listar(req, res));
  router.get('/:id', (req, res) => controller.buscarPorId(req, res));
  router.get('/:id/entregas', (req, res) => controller.listarEntregas(req, res));
 
  return router;
}
 