// src/controllers/painel/EntregasController.js
// Responde com res.render() (SSR via EJS). Reutiliza os mesmos services da API REST.

export class PainelEntregasController {
  constructor(entregasService, motoristasService) {
    this.entregasService = entregasService;
    this.motoristasService = motoristasService;
  }

  async index(req, res) {
    const { status, page = 1 } = req.query;
    const pageNum  = Math.max(1, Number(page));
    const limitNum = 10;

    let entregas = await this.entregasService.listarEntregas(status);

    const total      = entregas.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const data       = entregas.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.render('entregas/index', {
      entregas: data,
      total,
      page: pageNum,
      totalPages,
      filtroStatus: status || '',
    });
  }

  async nova(req, res) {
    const motoristas = await this.motoristasService.listarMotoristas();
    return res.render('entregas/nova', { motoristas, valores: {}, erros: [] });
  }

  async criar(req, res) {
    const { descricao, origem, destino } = req.body;
    try {
      await this.entregasService.criarEntrega({ descricao, origem, destino });
      req.flash('sucesso', 'Entrega criada com sucesso!');
      return res.redirect('/painel/entregas');
    } catch (err) {
      const motoristas = await this.motoristasService.listarMotoristas();
      return res.render('entregas/nova', {
        motoristas,
        valores: { descricao, origem, destino },
        erros: [err.message],
      });
    }
  }

  async detalhe(req, res) {
    const entrega = await this.entregasService.buscarPorId(req.params.id);
    return res.render('entregas/detalhe', { entrega });
  }

  async avancar(req, res) {
    try {
      await this.entregasService.avancarStatus(req.params.id);
      req.flash('sucesso', 'Status avançado com sucesso!');
    } catch (err) {
      req.flash('erro', err.message);
    }
    return res.redirect(`/painel/entregas/${req.params.id}`);
  }

  async cancelar(req, res) {
    try {
      await this.entregasService.cancelarEntrega(req.params.id);
      req.flash('sucesso', 'Entrega cancelada.');
    } catch (err) {
      req.flash('erro', err.message);
    }
    return res.redirect(`/painel/entregas/${req.params.id}`);
  }
}
