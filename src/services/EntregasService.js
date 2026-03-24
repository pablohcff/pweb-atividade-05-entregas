import { AppError } from "../utils/utils.js";

const STATUS = {
  CRIADA: "CRIADA",
  EM_TRANSITO: "EM_TRANSITO",
  ENTREGUE: "ENTREGUE",
  CANCELADA: "CANCELADA"
};

export class EntregasService {
  constructor(repository) {
    this.repository = repository;
  }

  listarTodos(status) {
    const entregas = this.repository.listarTodos();

    if (status) {
      return entregas.filter(e => e.status === status);
    }

    return entregas;
  }

  buscarPorId(id) {
    const entrega = this.repository.buscarPorId(id);

    if (!entrega) {
      throw new AppError("Entrega não encontrada", 404);
    }

    return entrega;
  }

  criar({ descricao, origem, destino }) {
    if (origem === destino) {
      throw new AppError("Origem e destino não podem ser iguais");
    }

    const entregas = this.repository.listarTodos();

    const duplicada = entregas.find(e =>
      e.descricao === descricao &&
      e.origem === origem &&
      e.destino === destino &&
      e.status !== STATUS.ENTREGUE &&
      e.status !== STATUS.CANCELADA
    );

    if (duplicada) {
      throw new AppError("Entrega duplicada ativa");
    }

    const novaEntrega = {
      id: this.repository.database.generateId(),
      descricao,
      origem,
      destino,
      status: STATUS.CRIADA,
      historico: [
        {
          data: new Date().toISOString(),
          descricao: "Entrega criada"
        }
      ]
    };

    return this.repository.criar(novaEntrega);
  }

  avancar(id) {
    const entrega = this.buscarPorId(id);

    if (entrega.status === STATUS.CANCELADA || entrega.status === STATUS.ENTREGUE) {
      throw new AppError("Entrega já finalizada");
    }

    let novoStatus;

    if (entrega.status === STATUS.CRIADA) {
      novoStatus = STATUS.EM_TRANSITO;
    } else if (entrega.status === STATUS.EM_TRANSITO) {
      novoStatus = STATUS.ENTREGUE;
    } else {
      throw new AppError("Transição inválida");
    }

    entrega.status = novoStatus;
    entrega.historico.push({
      data: new Date().toISOString(),
      descricao: `Status alterado para ${novoStatus}`
    });

    return this.repository.atualizar(id, entrega);
  }

  cancelar(id) {
    const entrega = this.buscarPorId(id);

    if (entrega.status === STATUS.ENTREGUE) {
      throw new AppError("Não é possível cancelar entrega já finalizada");
    }

    if (entrega.status === STATUS.CANCELADA) {
      throw new AppError("Entrega já cancelada");
    }

    entrega.status = STATUS.CANCELADA;
    entrega.historico.push({
      data: new Date().toISOString(),
      descricao: "Entrega cancelada"
    });

    return this.repository.atualizar(id, entrega);
  }

  historico(id) {
    const entrega = this.buscarPorId(id);
    return entrega.historico;
  }
}