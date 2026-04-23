// src/repositories/MotoristasRepository.js

import { AppError } from '../utils/AppError.js';

export class MotoristasRepository {
  constructor(db) {
    this.db = db;
  }

  _mapRow(row) {
    return {
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      placaVeiculo: row.placa_veiculo,
      status: row.status,
    };
  }

  listarTodos() {
    return this.db.prepare('SELECT * FROM motoristas').all().map((row) => this._mapRow(row));
  }

  buscarPorId(id) {
    const row = this.db.prepare('SELECT * FROM motoristas WHERE id = ?').get(id);
    return row ? this._mapRow(row) : null;
  }

  buscarPorCPF(cpf) {
    const row = this.db.prepare('SELECT * FROM motoristas WHERE cpf = ?').get(cpf);
    return row ? this._mapRow(row) : null;
  }

  criar(dados) {
    const { nome, cpf, placaVeiculo, status } = dados;
    try {
      const result = this.db
        .prepare('INSERT INTO motoristas (nome, cpf, placa_veiculo, status) VALUES (?, ?, ?, ?)')
        .run(nome, cpf, placaVeiculo, status);
      return this.buscarPorId(Number(result.lastInsertRowid));
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new AppError(`Já existe um motorista cadastrado com o CPF ${cpf}.`, 409);
      }
      throw err;
    }
  }

  atualizar(id, dados) {
    const { nome, cpf, placaVeiculo, status } = dados;
    const updates = [];
    const values = [];

    if (nome !== undefined) { updates.push('nome = ?'); values.push(nome); }
    if (cpf !== undefined) { updates.push('cpf = ?'); values.push(cpf); }
    if (placaVeiculo !== undefined) { updates.push('placa_veiculo = ?'); values.push(placaVeiculo); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) return this.buscarPorId(id);

    values.push(id);
    this.db.prepare(`UPDATE motoristas SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return this.buscarPorId(id);
  }
}
