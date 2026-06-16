// tests/unit/services/MotoristasService.test.js
// Testes unitários do MotoristasService com mocks completos do repository.

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MotoristasService } from '../../../src/services/MotoristasService.js';
import { AppError } from '../../../src/utils/AppError.js';

// ─── Fábrica de mocks ───────────────────────────────────────────────────────

function criarRepositoryMock() {
  return {
    listarTodos:  jest.fn(),
    buscarPorId:  jest.fn(),
    buscarPorCPF: jest.fn(),
    criar:        jest.fn(),
  };
}

function fazerMotorista(overrides = {}) {
  return {
    id:           1,
    nome:         'João Silva',
    cpf:          '123.456.789-00',
    placaVeiculo: 'ABC-1234',
    status:       'ATIVO',
    ...overrides,
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('MotoristasService', () => {
  let repository;
  let service;

  beforeEach(() => {
    repository = criarRepositoryMock();
    service    = new MotoristasService(repository);
  });

  // ── criarMotorista ──────────────────────────────────────────────────────────

  describe('criarMotorista', () => {
    it('cria um motorista com sucesso quando os campos são válidos', async () => {
      // Arrange
      repository.buscarPorCPF.mockResolvedValue(null);
      const motorista = fazerMotorista();
      repository.criar.mockResolvedValue(motorista);

      const dados = { nome: 'João Silva', cpf: '123.456.789-00', placaVeiculo: 'ABC-1234' };

      // Act
      const resultado = await service.criarMotorista(dados);

      // Assert
      expect(resultado.status).toBe('ATIVO');
      expect(repository.criar).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'João Silva', status: 'ATIVO' }),
      );
    });

    it('lança AppError 400 quando faltam campos obrigatórios', async () => {
      // Arrange
      const dados = { nome: 'João Silva', cpf: '', placaVeiculo: 'ABC-1234' };

      // Act
      const ato = () => service.criarMotorista(dados);

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 400);
    });

    it('lança AppError 409 quando já existe motorista com o mesmo CPF', async () => {
      // Arrange
      const motoristaPre = fazerMotorista({ cpf: '123.456.789-00' });
      repository.buscarPorCPF.mockResolvedValue(motoristaPre);

      const dados = { nome: 'João Silva', cpf: '123.456.789-00', placaVeiculo: 'ABC-1234' };

      // Act
      const ato = () => service.criarMotorista(dados);

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 409);
      expect(repository.criar).not.toHaveBeenCalled();
    });
  });

  // ── listarMotoristas ────────────────────────────────────────────────────────

  describe('listarMotoristas', () => {
    it('retorna a lista de todos os motoristas', async () => {
      // Arrange
      const motoristas = [
        fazerMotorista({ id: 1 }),
        fazerMotorista({ id: 2, nome: 'Maria Silva' }),
      ];
      repository.listarTodos.mockResolvedValue(motoristas);

      // Act
      const resultado = await service.listarMotoristas();

      // Assert
      expect(resultado).toHaveLength(2);
      expect(repository.listarTodos).toHaveBeenCalledTimes(1);
    });

    it('retorna lista vazia quando não há motoristas', async () => {
      // Arrange
      repository.listarTodos.mockResolvedValue([]);

      // Act
      const resultado = await service.listarMotoristas();

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  // ── buscarPorId ─────────────────────────────────────────────────────────────

  describe('buscarPorId', () => {
    it('retorna o motorista quando encontrado', async () => {
      // Arrange
      const motorista = fazerMotorista({ id: 42 });
      repository.buscarPorId.mockResolvedValue(motorista);

      // Act
      const resultado = await service.buscarPorId(42);

      // Assert
      expect(resultado).toEqual(motorista);
      expect(repository.buscarPorId).toHaveBeenCalledWith(42);
    });

    it('lança AppError 404 quando motorista não existe', async () => {
      // Arrange
      repository.buscarPorId.mockResolvedValue(null);

      // Act
      const ato = () => service.buscarPorId(999);

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 404);
    });

    it('converte o id para número antes de buscar', async () => {
      // Arrange
      const motorista = fazerMotorista({ id: 10 });
      repository.buscarPorId.mockResolvedValue(motorista);

      // Act
      await service.buscarPorId('10');

      // Assert
      expect(repository.buscarPorId).toHaveBeenCalledWith(10);
    });
  });
});
