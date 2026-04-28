// src/repositories/MotoristasRepository.js
//
// RF-03 (Atividade 08): Reimplementação com PrismaClient.
// Os contratos de interface foram mantidos idênticos aos da Atividade 07.
// Mapeamento: snake_case do SQL antigo → camelCase do Prisma
//   placa_veiculo → placaVeiculo

import { AppError } from '../utils/AppError.js';

export class MotoristasRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    this.prisma = prisma;
  }

  _mapMotorista(motorista) {
    return {
      id: motorista.id,
      nome: motorista.nome,
      cpf: motorista.cpf,
      placaVeiculo: motorista.placaVeiculo,
      status: motorista.status,
    };
  }

  async listarTodos() {
    const motoristas = await this.prisma.motorista.findMany({ orderBy: { createdAt: 'asc' } });
    return motoristas.map((m) => this._mapMotorista(m));
  }

  async buscarPorId(id) {
    const motorista = await this.prisma.motorista.findUnique({ where: { id } });
    return motorista ? this._mapMotorista(motorista) : null;
  }

  async buscarPorCPF(cpf) {
    const motorista = await this.prisma.motorista.findUnique({ where: { cpf } });
    return motorista ? this._mapMotorista(motorista) : null;
  }

  async criar(dados) {
    const { nome, cpf, placaVeiculo, status } = dados;
    try {
      const motorista = await this.prisma.motorista.create({
        data: { nome, cpf, placaVeiculo, status },
      });
      return this._mapMotorista(motorista);
    } catch (err) {
      // Código Prisma P2002 → violação de constraint única (CPF duplicado)
      if (err.code === 'P2002') {
        throw new AppError(`Já existe um motorista cadastrado com o CPF ${cpf}.`, 409);
      }
      throw err;
    }
  }

  async atualizar(id, dados) {
    const { nome, cpf, placaVeiculo, status } = dados;
    const data = {};

    if (nome !== undefined) data.nome = nome;
    if (cpf !== undefined) data.cpf = cpf;
    if (placaVeiculo !== undefined) data.placaVeiculo = placaVeiculo;
    if (status !== undefined) data.status = status;

    if (Object.keys(data).length === 0) return this.buscarPorId(id);

    const motorista = await this.prisma.motorista.update({ where: { id }, data });
    return this._mapMotorista(motorista);
  }
}
