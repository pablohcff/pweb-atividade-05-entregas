// prisma/seed.js
// RF-06: popula o banco com dados de demonstração.
// Cobre todos os status (CRIADA, EM_TRANSITO, ENTREGUE, CANCELADA),
// inclui 3 motoristas e 10 entregas com histórico de eventos.
//
// As datas são distribuídas em 2025 e 2026 para permitir testar
// o filtro de intervalo de datas (RF-05):
//   • createdDe=2025-01-01&createdAte=2025-12-31 → 6 entregas
//   • createdDe=2026-01-01                       → 4 entregas
//
// Execução: node prisma/seed.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpa o banco na ordem correta para respeitar foreign keys
  await prisma.eventoEntrega.deleteMany();
  await prisma.entrega.deleteMany();
  await prisma.motorista.deleteMany();

  // Reseta os contadores AUTOINCREMENT do SQLite para que IDs comecem em 1.
  // Necessário porque o Prisma usa "INTEGER PRIMARY KEY AUTOINCREMENT" e o
  // SQLite rastreia o maior ID já usado na tabela sqlite_sequence.
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name IN ('Motorista', 'Entrega', 'EventoEntrega')`;

  // ── Motoristas (criados em sequência para garantir IDs 1, 2, 3) ────────────
  const m1 = await prisma.motorista.create({
    data: { nome: 'Carlos Silva', cpf: '111.111.111-11', placaVeiculo: 'ABC-1234', status: 'ATIVO' },
  });
  const m2 = await prisma.motorista.create({
    data: { nome: 'Ana Pereira', cpf: '222.222.222-22', placaVeiculo: 'DEF-5678', status: 'ATIVO' },
  });
  const m3 = await prisma.motorista.create({
    data: { nome: 'Bruno Oliveira', cpf: '333.333.333-33', placaVeiculo: 'GHI-9012', status: 'INATIVO' },
  });

  // ── Datas auxiliares ───────────────────────────────────────────────────────
  const d = (iso) => new Date(iso);

  // ── Entregas ───────────────────────────────────────────────────────────────

  // 1. ENTREGUE — jan/2025
  await prisma.entrega.create({
    data: {
      descricao: 'Notebook Dell', origem: 'Maceió', destino: 'Recife',
      status: 'ENTREGUE', motoristaId: m1.id, createdAt: d('2025-01-15T10:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.',                                              createdAt: d('2025-01-15T10:00:00Z') },
          { descricao: 'Status atualizado de "CRIADA" para "EM_TRANSITO".',            createdAt: d('2025-01-16T08:00:00Z') },
          { descricao: 'Status atualizado de "EM_TRANSITO" para "ENTREGUE".',          createdAt: d('2025-01-17T15:00:00Z') },
        ],
      },
    },
  });

  // 2. EM_TRANSITO — mar/2025
  await prisma.entrega.create({
    data: {
      descricao: 'Smartphone Samsung', origem: 'São Paulo', destino: 'Rio de Janeiro',
      status: 'EM_TRANSITO', motoristaId: m2.id, createdAt: d('2025-03-20T14:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.',                                              createdAt: d('2025-03-20T14:00:00Z') },
          { descricao: 'Status atualizado de "CRIADA" para "EM_TRANSITO".',            createdAt: d('2025-03-21T10:00:00Z') },
        ],
      },
    },
  });

  // 3. CRIADA — mar/2025 (sem motorista)
  await prisma.entrega.create({
    data: {
      descricao: 'TV LG 50"', origem: 'Fortaleza', destino: 'Natal',
      status: 'CRIADA', createdAt: d('2025-03-20T14:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.', createdAt: d('2025-03-20T14:00:00Z') },
        ],
      },
    },
  });

  // 4. CANCELADA — jun/2025
  await prisma.entrega.create({
    data: {
      descricao: 'Geladeira Brastemp', origem: 'Belo Horizonte', destino: 'Salvador',
      status: 'CANCELADA', motoristaId: m1.id, createdAt: d('2025-06-10T09:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.',                                              createdAt: d('2025-06-10T09:00:00Z') },
          { descricao: 'Entrega cancelada. Status anterior: "CRIADA".',                createdAt: d('2025-06-11T08:00:00Z') },
        ],
      },
    },
  });

  // 5. EM_TRANSITO — jun/2025
  await prisma.entrega.create({
    data: {
      descricao: 'Mesa de escritório', origem: 'Curitiba', destino: 'Porto Alegre',
      status: 'EM_TRANSITO', motoristaId: m2.id, createdAt: d('2025-06-10T09:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.',                                              createdAt: d('2025-06-10T09:00:00Z') },
          { descricao: 'Status atualizado de "CRIADA" para "EM_TRANSITO".',            createdAt: d('2025-06-12T09:00:00Z') },
        ],
      },
    },
  });

  // 6. ENTREGUE — jun/2025 (motorista INATIVO fez a entrega antes de ser desativado)
  await prisma.entrega.create({
    data: {
      descricao: 'Ar-condicionado Consul', origem: 'Manaus', destino: 'Belém',
      status: 'ENTREGUE', motoristaId: m3.id, createdAt: d('2025-06-13T08:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.',                                              createdAt: d('2025-06-13T08:00:00Z') },
          { descricao: 'Status atualizado de "CRIADA" para "EM_TRANSITO".',            createdAt: d('2025-06-14T08:00:00Z') },
          { descricao: 'Status atualizado de "EM_TRANSITO" para "ENTREGUE".',          createdAt: d('2025-06-14T16:00:00Z') },
        ],
      },
    },
  });

  // 7. CRIADA — jan/2026 (sem motorista)
  await prisma.entrega.create({
    data: {
      descricao: 'Caixa de documentos', origem: 'Brasília', destino: 'Goiânia',
      status: 'CRIADA', createdAt: d('2026-01-05T08:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.', createdAt: d('2026-01-05T08:00:00Z') },
        ],
      },
    },
  });

  // 8. EM_TRANSITO — jan/2026
  await prisma.entrega.create({
    data: {
      descricao: 'Bicicleta elétrica', origem: 'Recife', destino: 'João Pessoa',
      status: 'EM_TRANSITO', motoristaId: m1.id, createdAt: d('2026-01-05T08:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.',                                              createdAt: d('2026-01-05T08:00:00Z') },
          { descricao: 'Status atualizado de "CRIADA" para "EM_TRANSITO".',            createdAt: d('2026-01-06T10:00:00Z') },
        ],
      },
    },
  });

  // 9. CRIADA — abr/2026
  await prisma.entrega.create({
    data: {
      descricao: 'Sofá retrátil', origem: 'Florianópolis', destino: 'Blumenau',
      status: 'CRIADA', motoristaId: m2.id, createdAt: d('2026-04-01T11:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.', createdAt: d('2026-04-01T11:00:00Z') },
        ],
      },
    },
  });

  // 10. CANCELADA — abr/2026 (sem motorista)
  await prisma.entrega.create({
    data: {
      descricao: 'Equipamento médico', origem: 'Vitória', destino: 'Campos dos Goytacazes',
      status: 'CANCELADA', createdAt: d('2026-04-01T11:00:00Z'),
      historico: {
        create: [
          { descricao: 'Entrega criada.',                                              createdAt: d('2026-04-01T11:00:00Z') },
          { descricao: 'Entrega cancelada. Status anterior: "CRIADA".',                createdAt: d('2026-04-01T12:00:00Z') },
        ],
      },
    },
  });

  const [totalMotoristas, totalEntregas, totalEventos] = await Promise.all([
    prisma.motorista.count(),
    prisma.entrega.count(),
    prisma.eventoEntrega.count(),
  ]);

  console.log(`✔ Seed concluído: ${totalMotoristas} motoristas, ${totalEntregas} entregas, ${totalEventos} eventos.`);
  console.log('  Distribuição de datas:');
  console.log('    2025 → entregas 1–6 (jan, mar, jun)');
  console.log('    2026 → entregas 7–10 (jan, abr)');
  console.log('  Para testar RF-05:');
  console.log('    GET /api/entregas?createdDe=2025-01-01&createdAte=2025-12-31  → 6 registros');
  console.log('    GET /api/entregas?createdDe=2026-01-01                        → 4 registros');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
