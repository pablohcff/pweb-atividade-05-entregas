export class EntregasController {
  constructor(service) {
    this.service = service;
  }

  async criar(req, res) {
    const entrega = await this.service.criarEntrega(req.body);
    return res.status(201).json(entrega);
  }
  // RF-04: paginação via page/limit; RF-05: filtro por intervalo de datas.
  async listar(req, res) {
    const { status, page = 1, limit = 10, createdDe, createdAte } = req.query;

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(Math.max(1, Number(limit)), 50); // máximo 50

    // O service valida o status e retorna os registros filtrados por ele
    let entregas = await this.service.listarEntregas(status);

    // RF-05: filtro de intervalo de datas (aplicado sobre o resultado do service)
    if (createdDe || createdAte) {
      const de  = createdDe  ? new Date(createdDe)                       : null;
      // inclui o dia inteiro para createdAte (até 23:59:59.999)
      const ate = createdAte ? new Date(createdAte + 'T23:59:59.999Z')   : null;
      entregas = entregas.filter((e) => {
        const created = new Date(e.createdAt);
        if (de  && created < de)  return false;
        if (ate && created > ate) return false;
        return true;
      });
    }

    // RF-04: metadados de paginação
    const total      = entregas.length;
    const totalPages = Math.ceil(total / limitNum);
    const data       = entregas.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({ data, total, page: pageNum, limit: limitNum, totalPages });
  }

  async buscarPorId(req, res) {
    // historico incluído via include no repository (ver EntregasRepository.buscarPorId)
    const entrega = await this.service.buscarPorId(req.params.id);
    return res.status(200).json(entrega);
  }

  async avancar(req, res) {
    const entrega = await this.service.avancarStatus(req.params.id);
    return res.status(200).json(entrega);
  }

  async cancelar(req, res) {
    const entrega = await this.service.cancelarEntrega(req.params.id);
    return res.status(200).json(entrega);
  }

  async historico(req, res) {
    const historico = await this.service.buscarHistorico(req.params.id);
    return res.status(200).json(historico);
  }

  async atribuir(req, res) {
    const entrega = await this.service.atribuirMotorista(req.params.id, req.body.motoristaId);
    return res.status(200).json(entrega);
  }
}