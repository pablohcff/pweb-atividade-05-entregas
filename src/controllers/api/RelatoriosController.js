// src/controllers/RelatoriosController.js

export class RelatoriosController {
  constructor(relatoriosRepository) {
    this.repository = relatoriosRepository;
  }

  async entregasPorStatus(req, res) {
    const resultado = await this.repository.entregasPorStatus();
    return res.status(200).json(resultado);
  }

  async motoristasAtivos(req, res) {
    const motoristas = await this.repository.motoristasAtivos();
    return res.status(200).json(motoristas);
  }
}
