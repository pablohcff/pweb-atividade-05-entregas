// src/repositories/RelatoriosRepository.js
//
// RF-03 (Atividade 08): Reimplementação com PrismaClient.
// groupBy substitui a query SQL "GROUP BY / HAVING".

export class RelatoriosRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    this.prisma = prisma;
  }

  async entregasPorStatus() {
    // Agrupa entregas por status e conta cada grupo
    const grupos = await this.prisma.entrega.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const resultado = {};
    for (const grupo of grupos) {
      resultado[grupo.status] = grupo._count.id;
    }
    return resultado;
  }

  async motoristasAtivos() {
    // Retorna motoristas com ao menos uma entrega em aberto
    // (status diferente de ENTREGUE e CANCELADA) — equivale ao
    // JOIN + HAVING COUNT(...) > 0 da query SQL original.
    const motoristas = await this.prisma.motorista.findMany({
      where: {
        entregas: {
          some: { status: { notIn: ['ENTREGUE', 'CANCELADA'] } },
        },
      },
      include: {
        _count: {
          select: {
            // Conta apenas as entregas em aberto daquele motorista
            entregas: {
              where: { status: { notIn: ['ENTREGUE', 'CANCELADA'] } },
            },
          },
        },
      },
    });

    return motoristas.map((m) => ({
      motoristaId: m.id,
      nome: m.nome,
      entregasEmAberto: m._count.entregas,
    }));
  }
}
