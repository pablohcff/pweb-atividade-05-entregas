export class EntregasController {
  constructor(service) {
    this.service = service;
  }

  listar = (req, res, next) => {
    try {
      const { status } = req.query;
      const data = this.service.listarTodos(status);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  buscar = (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = this.service.buscarPorId(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  criar = (req, res, next) => {
    try {
      const data = this.service.criar(req.body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  avancar = (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = this.service.avancar(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  cancelar = (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = this.service.cancelar(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  historico = (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = this.service.historico(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}