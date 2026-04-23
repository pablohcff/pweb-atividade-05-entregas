// src/controllers/RelatoriosController.js

export class RelatoriosController {
  constructor(relatoriosRepository) {
    this.repository = relatoriosRepository;
  }

  entregasPorStatus(req, res) {
    const resultado = this.repository.entregasPorStatus();
    return res.status(200).json(resultado);
  }

  motoristasAtivos(req, res) {
    const motoristas = this.repository.motoristasAtivos();
    return res.status(200).json(motoristas);
  }
}
