// src/repositories/RelatoriosRepository.js

export class RelatoriosRepository {
  constructor(db) {
    this.db = db;
  }

  entregasPorStatus() {
    const rows = this.db
      .prepare('SELECT status, COUNT(*) AS total FROM entregas GROUP BY status')
      .all();

    const resultado = {};
    for (const row of rows) {
      resultado[row.status] = row.total;
    }
    return resultado;
  }

  motoristasAtivos() {
    return this.db
      .prepare(
        `SELECT
           m.id   AS motoristaId,
           m.nome AS nome,
           COUNT(e.id) AS entregasEmAberto
         FROM motoristas m
         JOIN entregas e ON e.motorista_id = m.id
         WHERE e.status NOT IN ('ENTREGUE', 'CANCELADA')
         GROUP BY m.id, m.nome
         HAVING COUNT(e.id) > 0`
      )
      .all();
  }
}
