export class MotoristasController {
  constructor(motoristasService, entregasService) {
    this.motoristasService = motoristasService;
    this.entregasService = entregasService;
  }

  async criar(req, res) {
    const motorista = await this.motoristasService.criarMotorista(req.body);
    return res.status(201).json(motorista);
  }

  async listar(req, res) {
    const motoristas = await this.motoristasService.listarMotoristas();
    return res.status(200).json(motoristas);
  }

  async buscarPorId(req, res) {
    const motorista = await this.motoristasService.buscarPorId(req.params.id);
    return res.status(200).json(motorista);
  }

  async listarEntregas(req, res) {
    const { status } = req.query;
    const entregas = await this.entregasService.listarPorMotorista(req.params.id, status);
    return res.status(200).json(entregas);
  }
}