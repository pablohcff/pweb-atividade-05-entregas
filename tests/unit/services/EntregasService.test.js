// tests/unit/services/EntregasService.test.js
// RF-02: Testes unitários do EntregasService.
// ⚠️  Nenhuma conexão com banco de dados — todos os colaboradores externos
//     são substituídos por dublês (jest.fn()).

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EntregasService } from '../../../src/services/EntregasService.js';
import { AppError } from '../../../src/utils/AppError.js';
import { STATUS } from '../../../src/utils/status.js';

// ─── Fábricas de mocks ───────────────────────────────────────────────────────

/**
 * Cria um mock completo do EntregasRepository com todos os métodos como jest.fn().
 */
function criarRepositoryMock() {
  return {
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    criar:       jest.fn(),
    atualizar:   jest.fn(),
  };
}

/**
 * Cria um mock completo do MotoristasRepository.
 */
function criarMotoristasRepositoryMock() {
  return {
    buscarPorId: jest.fn(),
  };
}

/**
 * Fábrica de entrega com valores padrão sobrescrevíveis.
 */
function fazerEntrega(overrides = {}) {
  return {
    id:          1,
    descricao:   'Pacote A',
    origem:      'São Paulo',
    destino:     'Campinas',
    status:      STATUS.CRIADA,
    motoristaId: null,
    historico:   [{ data: new Date().toISOString(), descricao: 'Entrega criada.' }],
    ...overrides,
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('EntregasService', () => {
  let repository;
  let motoristasRepository;
  let service;

  beforeEach(() => {
    // Arrange (compartilhado): instância limpa antes de cada caso
    repository           = criarRepositoryMock();
    motoristasRepository = criarMotoristasRepositoryMock();
    service              = new EntregasService(repository, motoristasRepository);
  });

  // ── criarEntrega ────────────────────────────────────────────────────────────

  describe('criarEntrega', () => {
    it('lança AppError 400 quando origem é igual ao destino', async () => {
      // Arrange
      const dados = { descricao: 'Pacote', origem: 'São Paulo', destino: 'São Paulo' };

      // Act
      const ato = () => service.criarEntrega(dados);

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 400);
    });

    it('lança AppError 409 quando já existe entrega ativa com mesma descrição, origem e destino', async () => {
      // Arrange — repository retorna uma entrega ativa com os mesmos dados
      const entregaAtiva = fazerEntrega({ status: STATUS.EM_TRANSITO });
      repository.listarTodos.mockResolvedValue([entregaAtiva]);

      const dados = {
        descricao: entregaAtiva.descricao,
        origem:    entregaAtiva.origem,
        destino:   entregaAtiva.destino,
      };

      // Act
      const ato = () => service.criarEntrega(dados);

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 409);
    });

    it('cria a entrega com sucesso quando não há duplicata', async () => {
      // Arrange
      repository.listarTodos.mockResolvedValue([]);
      const entregaCriada = fazerEntrega();
      repository.criar.mockResolvedValue(entregaCriada);

      const dados = { descricao: 'Pacote A', origem: 'São Paulo', destino: 'Campinas' };

      // Act
      const resultado = await service.criarEntrega(dados);

      // Assert
      expect(repository.criar).toHaveBeenCalledTimes(1);
      expect(resultado.status).toBe(STATUS.CRIADA);
    });
  });

  // ── avancarStatus ───────────────────────────────────────────────────────────

  describe('avancarStatus', () => {
    it('transição CRIADA → EM_TRANSITO: retorna entrega com status EM_TRANSITO', async () => {
      // Arrange
      const entrega     = fazerEntrega({ status: STATUS.CRIADA });
      const atualizada  = fazerEntrega({ status: STATUS.EM_TRANSITO });
      repository.buscarPorId.mockResolvedValue(entrega);
      repository.atualizar.mockResolvedValue(atualizada);

      // Act
      const resultado = await service.avancarStatus(1);

      // Assert
      expect(resultado.status).toBe(STATUS.EM_TRANSITO);
      expect(repository.atualizar).toHaveBeenCalledWith(
        entrega.id,
        expect.objectContaining({ status: STATUS.EM_TRANSITO }),
      );
    });

    it('transição EM_TRANSITO → ENTREGUE: retorna entrega com status ENTREGUE', async () => {
      // Arrange
      const entrega    = fazerEntrega({ status: STATUS.EM_TRANSITO });
      const atualizada = fazerEntrega({
        status:      STATUS.ENTREGUE,
        dataEntrega: new Date().toISOString(),
      });
      repository.buscarPorId.mockResolvedValue(entrega);
      repository.atualizar.mockResolvedValue(atualizada);

      // Act
      const resultado = await service.avancarStatus(1);

      // Assert
      expect(resultado.status).toBe(STATUS.ENTREGUE);
      expect(repository.atualizar).toHaveBeenCalledWith(
        entrega.id,
        expect.objectContaining({ status: STATUS.ENTREGUE }),
      );
    });

    it('transição ENTREGUE → EM_TRANSITO (inválida): lança AppError 422', async () => {
      // Arrange — entrega já está no status final ENTREGUE
      const entrega = fazerEntrega({ status: STATUS.ENTREGUE });
      repository.buscarPorId.mockResolvedValue(entrega);

      // Act
      const ato = () => service.avancarStatus(1);

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 422);
    });

    it('transição CRIADA → ENTREGUE diretamente (inválida): avancarStatus retorna EM_TRANSITO, não ENTREGUE', async () => {
      // Arrange — verifica que a única transição possível a partir de CRIADA é EM_TRANSITO
      const entrega    = fazerEntrega({ status: STATUS.CRIADA });
      const atualizada = fazerEntrega({ status: STATUS.EM_TRANSITO });
      repository.buscarPorId.mockResolvedValue(entrega);
      repository.atualizar.mockResolvedValue(atualizada);

      // Act
      const resultado = await service.avancarStatus(1);

      // Assert — prova que ENTREGUE não é alcançável diretamente a partir de CRIADA
      expect(resultado.status).toBe(STATUS.EM_TRANSITO);
      expect(resultado.status).not.toBe(STATUS.ENTREGUE);
    });
  });

  // ── cancelarEntrega ─────────────────────────────────────────────────────────

  describe('cancelarEntrega', () => {
    it('cancela com sucesso uma entrega com status CRIADA', async () => {
      // Arrange
      const entrega    = fazerEntrega({ status: STATUS.CRIADA });
      const cancelada  = fazerEntrega({ status: STATUS.CANCELADA });
      repository.buscarPorId.mockResolvedValue(entrega);
      repository.atualizar.mockResolvedValue(cancelada);

      // Act
      const resultado = await service.cancelarEntrega(1);

      // Assert
      expect(resultado.status).toBe(STATUS.CANCELADA);
      expect(repository.atualizar).toHaveBeenCalledWith(
        entrega.id,
        expect.objectContaining({ status: STATUS.CANCELADA }),
      );
    });

    it('lança AppError 422 ao tentar cancelar entrega com status ENTREGUE', async () => {
      // Arrange
      const entrega = fazerEntrega({ status: STATUS.ENTREGUE });
      repository.buscarPorId.mockResolvedValue(entrega);

      // Act
      const ato = () => service.cancelarEntrega(1);

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 422);
    });
  });
});
