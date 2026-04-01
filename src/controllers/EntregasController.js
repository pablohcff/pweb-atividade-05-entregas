export class EntregasController {
  constructor(service) {
    this.service = service;
  }
 
  criar(req, res) {
    const entrega = this.service.criarEntrega(req.body);
    return res.status(201).json(entrega);
  }
 
  listar(req, res) {
    const { status } = req.query;
    const entregas = this.service.listarEntregas(status);
    return res.status(200).json(entregas);
  }
 
  buscarPorId(req, res) {
    const entrega = this.service.buscarPorId(req.params.id);
    return res.status(200).json(entrega);
  }
 
  avancar(req, res) {
    const entrega = this.service.avancarStatus(req.params.id);
    return res.status(200).json(entrega);
  }
 
  cancelar(req, res) {
    const entrega = this.service.cancelarEntrega(req.params.id);
    return res.status(200).json(entrega);
  }
 
  historico(req, res) {
    const historico = this.service.buscarHistorico(req.params.id);
    return res.status(200).json(historico);
  }
 
  atribuir(req, res) {
    const entrega = this.service.atribuirMotorista(req.params.id, req.body.motoristaId);
    return res.status(200).json(entrega);
  }
}