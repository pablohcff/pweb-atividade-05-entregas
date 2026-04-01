export class MotoristasController {
  constructor(motoristasService, entregasService) {
    this.motoristasService = motoristasService;
    this.entregasService = entregasService;
  }
 
  criar(req, res) {
    const motorista = this.motoristasService.criarMotorista(req.body);
    return res.status(201).json(motorista);
  }
 
  listar(req, res) {
    const motoristas = this.motoristasService.listarMotoristas();
    return res.status(200).json(motoristas);
  }
 
  buscarPorId(req, res) {
    const motorista = this.motoristasService.buscarPorId(req.params.id);
    return res.status(200).json(motorista);
  }
 
  listarEntregas(req, res) {
    const { status } = req.query;
    const entregas = this.entregasService.listarPorMotorista(req.params.id, status);
    return res.status(200).json(entregas);
  }
}