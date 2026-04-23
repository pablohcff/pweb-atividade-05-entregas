// src/repositories/EntregasRepository.js

export class EntregasRepository {
  constructor(db) {
    this.db = db;
  }

  _getEventos(entregaId) {
    return this.db
      .prepare('SELECT data, descricao FROM eventos_entrega WHERE entrega_id = ? ORDER BY id')
      .all(entregaId);
  }

  _mapRow(row, eventos) {
    return {
      id: row.id,
      descricao: row.descricao,
      origem: row.origem,
      destino: row.destino,
      status: row.status,
      motoristaId: row.motorista_id,
      historico: eventos.map((e) => ({ data: e.data, descricao: e.descricao })),
    };
  }

  listarTodos() {
    const rows = this.db.prepare('SELECT * FROM entregas').all();
    return rows.map((row) => this._mapRow(row, this._getEventos(row.id)));
  }

  buscarPorId(id) {
    const row = this.db.prepare('SELECT * FROM entregas WHERE id = ?').get(id);
    if (!row) return null;
    return this._mapRow(row, this._getEventos(row.id));
  }

  criar(dados) {
    const { descricao, origem, destino, status, motoristaId, historico } = dados;

    const result = this.db
      .prepare('INSERT INTO entregas (descricao, origem, destino, status, motorista_id) VALUES (?, ?, ?, ?, ?)')
      .run(descricao, origem, destino, status, motoristaId ?? null);

    const entregaId = Number(result.lastInsertRowid);

    const insertEvento = this.db.prepare(
      'INSERT INTO eventos_entrega (entrega_id, data, descricao) VALUES (?, ?, ?)'
    );
    for (const evento of historico) {
      insertEvento.run(entregaId, evento.data, evento.descricao);
    }

    return this.buscarPorId(entregaId);
  }

  atualizar(id, dados) {
    const { status, motoristaId, historico } = dados;

    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (motoristaId !== undefined) {
      updates.push('motorista_id = ?');
      values.push(motoristaId);
    }

    if (updates.length > 0) {
      values.push(id);
      this.db.prepare(`UPDATE entregas SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    if (historico !== undefined) {
      this.db.prepare('DELETE FROM eventos_entrega WHERE entrega_id = ?').run(id);
      const insertEvento = this.db.prepare(
        'INSERT INTO eventos_entrega (entrega_id, data, descricao) VALUES (?, ?, ?)'
      );
      for (const evento of historico) {
        insertEvento.run(id, evento.data, evento.descricao);
      }
    }

    return this.buscarPorId(id);
  }
}

