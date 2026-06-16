// src/repositories/EntregasRepository.js
//
// RF-03 (Atividade 08): Reimplementação com PrismaClient.
// Os contratos de interface (nomes de métodos e assinaturas) foram mantidos
// idênticos aos da Atividade 07 — os Services não precisam de nenhuma
// alteração de lógica, apenas de await (ver comentário nos Services).
//
// Mapeamento de campos antigo → Prisma:
//   motorista_id  → motoristaId  (camelCase do Prisma)
//   eventos_entrega.data (TEXT) → EventoEntrega.createdAt (DateTime)
//     • ao criar: new Date(evento.data) → createdAt
//     • ao ler  : e.createdAt.toISOString() → data

export class EntregasRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Transforma o objeto Prisma no formato esperado pelos Services.
  // Expõe createdAt/updatedAt para que o controller possa filtrar por data
  // sem precisar alterar o Service.
  _mapEntrega(entrega) {
    return {
      id: entrega.id,
      descricao: entrega.descricao,
      origem: entrega.origem,
      destino: entrega.destino,
      status: entrega.status,
      motoristaId: entrega.motoristaId,
      criadorId: entrega.criadorId ?? null,  // RF-04 Auth
      createdAt: entrega.createdAt,  // exposto para filtro de datas (RF-05)
      updatedAt: entrega.updatedAt,
      historico: (entrega.historico ?? []).map((e) => ({
        // "data" é o campo que o Service espera; mapeado de createdAt do Prisma
        data: e.createdAt.toISOString(),
        descricao: e.descricao,
      })),
    };
  }

  async listarTodos() {
    const entregas = await this.prisma.entrega.findMany({
      include: { historico: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return entregas.map((e) => this._mapEntrega(e));
  }

  async buscarPorId(id) {
    // RF-03 / cenário de teste: retorna a entrega com historico via include
    const entrega = await this.prisma.entrega.findUnique({
      where: { id },
      include: { historico: { orderBy: { createdAt: 'asc' } } },
    });
    return entrega ? this._mapEntrega(entrega) : null;
  }

  async criar(dados) {
    const { descricao, origem, destino, status, motoristaId, criadorId, historico } = dados;

    const entrega = await this.prisma.entrega.create({
      data: {
        descricao,
        origem,
        destino,
        status,
        motoristaId: motoristaId ?? null,
        criadorId: criadorId ?? null,
        historico: {
          // Preserva o timestamp fornecido pelo Service (evento.data)
          create: historico.map((e) => ({
            descricao: e.descricao,
            createdAt: new Date(e.data),
          })),
        },
      },
      include: { historico: { orderBy: { createdAt: 'asc' } } },
    });

    return this._mapEntrega(entrega);
  }

  async atualizar(id, dados) {
    const { status, motoristaId, historico } = dados;

    const dataUpdate = {};
    if (status !== undefined) dataUpdate.status = status;
    if (motoristaId !== undefined) dataUpdate.motoristaId = motoristaId;

    if (historico !== undefined) {
      // Substitui todo o histórico em uma transação atômica:
      // apaga os eventos existentes e cria os novos.
      // onDelete: Cascade no schema garante remoção automática se a entrega
      // fosse deletada, mas aqui fazemos a substituição explicitamente.
      dataUpdate.historico = {
        deleteMany: {},
        create: historico.map((e) => ({
          descricao: e.descricao,
          createdAt: new Date(e.data),
        })),
      };
    }

    const entrega = await this.prisma.entrega.update({
      where: { id },
      data: dataUpdate,
      include: { historico: { orderBy: { createdAt: 'asc' } } },
    });

    return this._mapEntrega(entrega);
  }
}

