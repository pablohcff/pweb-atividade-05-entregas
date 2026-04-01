// src/services/EntregasService.js
import { STATUS, TRANSICOES_VALIDAS, STATUS_FINAIS } from '../utils/status.js';
import { AppError } from '../utils/AppError.js';
 
export class EntregasService {
  /**
   * @param {import('../repositories/IEntregasRepository.js').IEntregasRepository} repository
   * @param {import('../repositories/IMotoristasRepository.js').IMotoristasRepository} motoristasRepository
   */
  constructor(repository, motoristasRepository) {
    this.repository = repository;
    this.motoristasRepository = motoristasRepository;
  }
 
  _criarEvento(descricao) {
    return { data: new Date().toISOString(), descricao };
  }
 
  _verificarDuplicidade(descricao, origem, destino, ignorarId = null) {
    const ativas = this.repository
      .listarTodos()
      .filter((e) => !STATUS_FINAIS.includes(e.status));
 
    const duplicada = ativas.find(
      (e) =>
        e.id !== ignorarId &&
        e.descricao === descricao &&
        e.origem === origem &&
        e.destino === destino
    );
 
    if (duplicada) {
      throw new AppError('Já existe uma entrega ativa com a mesma descrição, origem e destino.', 409);
    }
  }
 
  // ─── casos de uso ────────────────────────────────────────────────────────────
 
  criarEntrega({ descricao, origem, destino }) {
    if (!descricao || !origem || !destino) {
      throw new AppError('Os campos descricao, origem e destino são obrigatórios.');
    }
 
    if (origem.trim().toLowerCase() === destino.trim().toLowerCase()) {
      throw new AppError('Origem e destino não podem ser iguais.');
    }
 
    this._verificarDuplicidade(descricao, origem, destino);
 
    const historico = [this._criarEvento('Entrega criada.')];
 
    return this.repository.criar({
      descricao,
      origem,
      destino,
      status: STATUS.CRIADA,
      motoristaId: null,
      historico,
    });
  }
 
  listarEntregas(filtroStatus) {
    const todas = this.repository.listarTodos();
 
    if (filtroStatus) {
      const statusNormalizado = filtroStatus.toUpperCase();
      if (!Object.values(STATUS).includes(statusNormalizado)) {
        throw new AppError(`Status inválido: ${filtroStatus}.`);
      }
      return todas.filter((e) => e.status === statusNormalizado);
    }
 
    return todas;
  }
 
  buscarPorId(id) {
    const entrega = this.repository.buscarPorId(Number(id));
    if (!entrega) throw new AppError('Entrega não encontrada.', 404);
    return entrega;
  }
 
  avancarStatus(id) {
    const entrega = this.buscarPorId(id);
 
    if (STATUS_FINAIS.includes(entrega.status)) {
      throw new AppError(`Não é possível avançar o status de uma entrega com status "${entrega.status}".`);
    }
 
    const proximoStatus = TRANSICOES_VALIDAS[entrega.status];
    if (!proximoStatus) {
      throw new AppError(`Não há transição válida a partir do status "${entrega.status}".`);
    }
 
    const evento = this._criarEvento(`Status atualizado de "${entrega.status}" para "${proximoStatus}".`);
    const historico = [...entrega.historico, evento];
 
    return this.repository.atualizar(entrega.id, { status: proximoStatus, historico });
  }
 
  cancelarEntrega(id) {
    const entrega = this.buscarPorId(id);
 
    if (entrega.status === STATUS.ENTREGUE) {
      throw new AppError('Não é possível cancelar uma entrega já finalizada (ENTREGUE).');
    }
    if (entrega.status === STATUS.CANCELADA) {
      throw new AppError('Esta entrega já está cancelada.');
    }
 
    const evento = this._criarEvento(`Entrega cancelada. Status anterior: "${entrega.status}".`);
    const historico = [...entrega.historico, evento];
 
    return this.repository.atualizar(entrega.id, { status: STATUS.CANCELADA, historico });
  }
 
  buscarHistorico(id) {
    const entrega = this.buscarPorId(id);
    return entrega.historico;
  }
 
  atribuirMotorista(id, motoristaId) {
    const entrega = this.buscarPorId(id);
 
    if (entrega.status !== STATUS.CRIADA) {
      throw new AppError(`Não é possível atribuir motorista a uma entrega com status "${entrega.status}".`);
    }
 
    const motorista = this.motoristasRepository.buscarPorId(Number(motoristaId));
    if (!motorista) throw new AppError('Motorista não encontrado.', 404);
 
    if (motorista.status === 'INATIVO') {
      throw new AppError('Não é possível atribuir um motorista com status INATIVO.');
    }
 
    const descricaoEvento = entrega.motoristaId
      ? `Motorista substituído. Novo motorista: ID ${motorista.id} (${motorista.nome}).`
      : `Motorista atribuído: ID ${motorista.id} (${motorista.nome}).`;
 
    const historico = [...entrega.historico, this._criarEvento(descricaoEvento)];
 
    return this.repository.atualizar(entrega.id, { motoristaId: motorista.id, historico });
  }
 
  listarPorMotorista(motoristaId, filtroStatus) {
    const motorista = this.motoristasRepository.buscarPorId(Number(motoristaId));
    if (!motorista) throw new AppError('Motorista não encontrado.', 404);
 
    let entregas = this.repository.listarTodos().filter((e) => e.motoristaId === Number(motoristaId));
 
    if (filtroStatus) {
      const statusNormalizado = filtroStatus.toUpperCase();
      if (!Object.values(STATUS).includes(statusNormalizado)) {
        throw new AppError(`Status inválido: ${filtroStatus}.`);
      }
      entregas = entregas.filter((e) => e.status === statusNormalizado);
    }
 
    return entregas;
  }
}