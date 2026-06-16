// tests/unit/services/AuthService.test.js
// RF-03: Testes unitários do AuthService.
// ⚠️  Nenhuma conexão com banco de dados — repository e bcrypt são mockados
//     inteiramente com jest.fn() / jest.unstable_mockModule().

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ── Funções mock para bcryptjs ────────────────────────────────────────────────
// Declaradas antes de unstable_mockModule para serem referenciadas no retorno.
const mockHash    = jest.fn();
const mockCompare = jest.fn();

// ── Mock do módulo bcryptjs ANTES de importar o service ─────────────────────
// Fornece 'default' porque AuthService usa: import bcrypt from 'bcryptjs'
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash:    mockHash,
    compare: mockCompare,
  },
}));

// Após registrar o mock, importamos os módulos dinamicamente
const { AuthService } = await import('../../../src/services/AuthService.js');
const { AppError }    = await import('../../../src/utils/AppError.js');

// ─── Fábrica de mock do repository ──────────────────────────────────────────

function criarRepositoryMock() {
  return {
    buscarPorEmail: jest.fn(),
    criar:          jest.fn(),
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let repository;
  let service;

  beforeEach(() => {
    // Arrange (compartilhado): limpa mocks e instância o service
    jest.clearAllMocks();
    repository = criarRepositoryMock();
    service    = new AuthService(repository);

    // JWT_SECRET precisa existir para jwt.sign não lançar
    process.env.JWT_SECRET = 'chave_secreta_testes_minimo_32_caracteres_ok';
  });

  // ── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('lança AppError 401 com "Credenciais inválidas" quando o e-mail não existe', async () => {
      // Arrange — repository não encontra nenhum usuário
      repository.buscarPorEmail.mockResolvedValue(null);

      // Act
      const ato = () => service.login({ email: 'inexistente@test.com', senha: 'qualquer' });

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 401);
      await expect(ato()).rejects.toHaveProperty('message', 'Credenciais inválidas.');
    });

    it('lança AppError 401 com "Credenciais inválidas" quando a senha está incorreta', async () => {
      // Arrange — e-mail existe mas senha não bate
      repository.buscarPorEmail.mockResolvedValue({
        id: 1, nome: 'Teste', email: 'op@test.com', papel: 'OPERADOR',
        senhaHash: '$2b$10$hashfake',
      });
      mockCompare.mockResolvedValue(false);

      // Act
      const ato = () => service.login({ email: 'op@test.com', senha: 'errada' });

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 401);
      await expect(ato()).rejects.toHaveProperty('message', 'Credenciais inválidas.');
    });

    it('a mensagem de erro é idêntica para e-mail inexistente e senha incorreta (prevenção de enumeração)', async () => {
      // Arrange
      const mensagemEsperada = 'Credenciais inválidas.';

      repository.buscarPorEmail.mockResolvedValueOnce(null); // e-mail inexistente
      const erroEmailInexistente = await service
        .login({ email: 'nao@existe.com', senha: '123' })
        .catch((e) => e);

      repository.buscarPorEmail.mockResolvedValueOnce({
        id: 1, senhaHash: 'hash',
      });
      mockCompare.mockResolvedValueOnce(false); // senha errada
      const erroSenhaErrada = await service
        .login({ email: 'existe@test.com', senha: 'errada' })
        .catch((e) => e);

      // Assert — as mensagens devem ser idênticas para evitar enumeração de usuários
      expect(erroEmailInexistente.message).toBe(mensagemEsperada);
      expect(erroSenhaErrada.message).toBe(mensagemEsperada);
    });

    it('login bem-sucedido retorna accessToken, refreshToken e objeto usuario', async () => {
      // Arrange
      const usuario = {
        id: 1, nome: 'Operador', email: 'op@test.com',
        papel: 'OPERADOR', senhaHash: '$2b$10$hashfake',
      };
      repository.buscarPorEmail.mockResolvedValue(usuario);
      mockCompare.mockResolvedValue(true);

      // Act
      const resultado = await service.login({ email: 'op@test.com', senha: 'senha123' });

      // Assert
      expect(resultado).toHaveProperty('accessToken');
      expect(resultado).toHaveProperty('refreshToken');
      expect(resultado).toHaveProperty('usuario');
    });

    it('o objeto usuario retornado no login não contém o campo senha (senhaHash)', async () => {
      // Arrange
      const usuario = {
        id: 1, nome: 'Operador', email: 'op@test.com',
        papel: 'OPERADOR', senhaHash: '$2b$10$hashfake',
      };
      repository.buscarPorEmail.mockResolvedValue(usuario);
      mockCompare.mockResolvedValue(true);

      // Act
      const resultado = await service.login({ email: 'op@test.com', senha: 'senha123' });

      // Assert — senhaHash não deve vazar para o chamador
      expect(resultado.usuario).not.toHaveProperty('senhaHash');
      expect(resultado.usuario).not.toHaveProperty('senha');
    });
  });

  // ── registrar ───────────────────────────────────────────────────────────────

  describe('registrar', () => {
    it('lança AppError 409 quando o e-mail já está cadastrado e não chama repository.criar', async () => {
      // Arrange — e-mail já existe
      repository.buscarPorEmail.mockResolvedValue({ id: 1, email: 'existente@test.com' });

      // Act
      const ato = () => service.registrar({ nome: 'Teste', email: 'existente@test.com', senha: 'senha123' });

      // Assert
      await expect(ato()).rejects.toBeInstanceOf(AppError);
      await expect(ato()).rejects.toHaveProperty('statusCode', 409);
      expect(repository.criar).not.toHaveBeenCalled();
    });

    it('chama bcrypt.hash antes de repository.criar no registro bem-sucedido', async () => {
      // Arrange — e-mail ainda não existe
      repository.buscarPorEmail.mockResolvedValue(null);
      mockHash.mockResolvedValue('$2b$10$hashgerado');
      repository.criar.mockResolvedValue({
        id: 1, nome: 'Novo', email: 'novo@test.com', papel: 'OPERADOR', senhaHash: '$2b$10$hashgerado',
      });

      // Act
      await service.registrar({ nome: 'Novo', email: 'novo@test.com', senha: 'senha123' });

      // Assert — a ordem de chamada importa: hash antes de criar
      const ordemHash  = mockHash.mock.invocationCallOrder[0];
      const ordemCriar = repository.criar.mock.invocationCallOrder[0];
      expect(ordemHash).toBeLessThan(ordemCriar);
    });
  });
});
