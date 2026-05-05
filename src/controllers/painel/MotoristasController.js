// src/controllers/painel/MotoristasController.js
// Responde com res.render() (SSR via EJS). Reutiliza o MotoristasService.

export class PainelMotoristasController {
  constructor(motoristasService) {
    this.motoristasService = motoristasService;
  }

  async index(req, res) {
    const motoristas = await this.motoristasService.listarMotoristas();
    return res.render('motoristas/index', { motoristas });
  }

  async novo(req, res) {
    return res.render('motoristas/novo', { valores: {}, erros: [] });
  }

  async criar(req, res) {
    const { nome, cpf, placaVeiculo } = req.body;
    try {
      await this.motoristasService.criarMotorista({ nome, cpf, placaVeiculo });
      req.flash('sucesso', 'Motorista cadastrado com sucesso!');
      return res.redirect('/painel/motoristas');
    } catch (err) {
      return res.render('motoristas/novo', {
        valores: { nome, cpf, placaVeiculo },
        erros: [err.message],
      });
    }
  }
}
