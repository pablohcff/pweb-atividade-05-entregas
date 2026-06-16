// tests/integration/auth.routes.test.js
// RF-04: Testes de integração dos endpoints de autenticação.
// Usa Supertest com a instância app do Express (sem server.listen).
// Limpa o banco de testes antes de cada caso para garantir isolamento.

import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import { config } from 'dotenv';

// Garante que as variáveis de .env.test estão carregadas neste processo de teste
config({ path: '.env.test' });

const { default: app } = await import('../../src/app.js');

// Importa o PrismaClient para limpeza direta do banco de testes
const { prisma } = await import('../../src/database/database.js');

// ─── Limpeza do banco de testes ──────────────────────────────────────────────

beforeEach(async () => {
  // Remove todos os registros em cascata para garantir isolamento entre testes
  await prisma.entrega.deleteMany();
  await prisma.usuario.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/registrar', () => {
  it('retorna 201 e não expõe o campo senha no payload quando os dados são válidos', async () => {
    // Arrange
    const payload = { nome: 'Operador Teste', email: 'op@test.com', senha: 'senha123' };

    // Act
    const resposta = await request(app)
      .post('/api/auth/registrar')
      .send(payload);

    // Assert
    expect(resposta.status).toBe(201);
    expect(resposta.body).not.toHaveProperty('senhaHash');
    expect(resposta.body).not.toHaveProperty('senha');
  });

  it('retorna 400 quando a senha tem menos de 8 caracteres', async () => {
    // Arrange
    const payload = { nome: 'Teste', email: 'curto@test.com', senha: '1234567' };

    // Act
    const resposta = await request(app)
      .post('/api/auth/registrar')
      .send(payload);

    // Assert
    expect(resposta.status).toBe(400);
  });

  it('retorna 409 quando o e-mail já está cadastrado', async () => {
    // Arrange — cria o usuário uma primeira vez
    await request(app)
      .post('/api/auth/registrar')
      .send({ nome: 'Primeiro', email: 'dup@test.com', senha: 'senha123' });

    // Act — tenta registrar o mesmo e-mail novamente
    const resposta = await request(app)
      .post('/api/auth/registrar')
      .send({ nome: 'Segundo', email: 'dup@test.com', senha: 'outrasenha' });

    // Assert
    expect(resposta.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Garante que existe um usuário para os testes de login
    await request(app)
      .post('/api/auth/registrar')
      .send({ nome: 'Operador', email: 'op@test.com', senha: 'senha123' });
  });

  it('retorna 200 com accessToken e refreshToken para credenciais válidas', async () => {
    // Act
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'op@test.com', senha: 'senha123' });

    // Assert
    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveProperty('accessToken');
    expect(resposta.body).toHaveProperty('refreshToken');
  });

  it('retorna 401 com "Credenciais inválidas" quando a senha está incorreta', async () => {
    // Act
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'op@test.com', senha: 'errada123' });

    // Assert
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('Credenciais inválidas.');
  });

  it('retorna 401 com "Credenciais inválidas" quando o e-mail não existe', async () => {
    // Act
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nao_existe@test.com', senha: 'qualquer123' });

    // Assert
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('Credenciais inválidas.');
  });
});
