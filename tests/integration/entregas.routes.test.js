// tests/integration/entregas.routes.test.js
// RF-05: Testes de integração — segurança dos endpoints protegidos.
// Verifica token ausente, assinatura inválida, token expirado e RBAC.

import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

// Garante que as variáveis de .env.test estão carregadas neste processo
config({ path: '.env.test' });

const { default: app } = await import('../../src/app.js');
const { prisma }       = await import('../../src/database/database.js');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Registra um usuário e retorna o accessToken via login.
 */
async function criarUsuarioELogar(email, papel = 'OPERADOR') {
  await request(app)
    .post('/api/auth/registrar')
    .send({ nome: 'Usuário Teste', email, senha: 'senha123' });

  // Ajusta o papel diretamente no banco quando for GESTOR
  if (papel === 'GESTOR') {
    await prisma.usuario.update({ where: { email }, data: { papel: 'GESTOR' } });
  }

  const resposta = await request(app)
    .post('/api/auth/login')
    .send({ email, senha: 'senha123' });

  return resposta.body.accessToken;
}

/**
 * Cria uma entrega de teste via API autenticada e retorna o id.
 */
async function criarEntrega(token) {
  const resposta = await request(app)
    .post('/api/entregas')
    .set('Authorization', `Bearer ${token}`)
    .send({ descricao: 'Pacote Teste', origem: 'São Paulo', destino: 'Campinas' });
  return resposta.body.id;
}

// ─── Limpeza ─────────────────────────────────────────────────────────────────

beforeEach(async () => {
  await prisma.entrega.deleteMany();
  await prisma.usuario.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Segurança — rotas autenticadas (/api/entregas)', () => {
  it('retorna 401 quando a requisição não possui token', async () => {
    // Act
    const resposta = await request(app).get('/api/entregas');

    // Assert
    expect(resposta.status).toBe(401);
  });

  it('retorna 401 quando o token possui assinatura inválida', async () => {
    // Arrange — assina com um segredo diferente do configurado
    const tokenInvalido = jwt.sign(
      { id: 1, papel: 'OPERADOR' },
      'segredo_errado_qualquer',
    );

    // Act
    const resposta = await request(app)
      .get('/api/entregas')
      .set('Authorization', `Bearer ${tokenInvalido}`);

    // Assert
    expect(resposta.status).toBe(401);
  });

  it('retorna 401 com mensagem contendo "expirado" quando o token está expirado', async () => {
    // Arrange — gera token com expiração negativa (já expirado)
    const tokenExpirado = jwt.sign(
      { id: 1, papel: 'OPERADOR' },
      process.env.JWT_SECRET,
      { expiresIn: -1 },
    );

    // Act
    const resposta = await request(app)
      .get('/api/entregas')
      .set('Authorization', `Bearer ${tokenExpirado}`);

    // Assert
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.toLowerCase()).toContain('expirado');
  });

  it('retorna 403 quando OPERADOR tenta acessar rota exclusiva de GESTOR (cancelar)', async () => {
    // Arrange
    const tokenOperador = await criarUsuarioELogar('op@test.com', 'OPERADOR');
    const tokenGestor   = await criarUsuarioELogar('gestor@test.com', 'GESTOR');
    const entregaId     = await criarEntrega(tokenGestor);

    // Act — OPERADOR tenta cancelar
    const resposta = await request(app)
      .patch(`/api/entregas/${entregaId}/cancelar`)
      .set('Authorization', `Bearer ${tokenOperador}`);

    // Assert
    expect(resposta.status).toBe(403);
  });

  it('retorna 403 quando OPERADOR tenta cancelar uma entrega diretamente', async () => {
    // Arrange
    const tokenOperador = await criarUsuarioELogar('op2@test.com', 'OPERADOR');
    const tokenGestor   = await criarUsuarioELogar('gestor2@test.com', 'GESTOR');
    const entregaId     = await criarEntrega(tokenGestor);

    // Act
    const resposta = await request(app)
      .patch(`/api/entregas/${entregaId}/cancelar`)
      .set('Authorization', `Bearer ${tokenOperador}`);

    // Assert
    expect(resposta.status).toBe(403);
  });

  it('retorna 200 quando GESTOR acessa a rota de cancelamento', async () => {
    // Arrange
    const tokenGestor = await criarUsuarioELogar('gestor3@test.com', 'GESTOR');
    const entregaId   = await criarEntrega(tokenGestor);

    // Act — GESTOR cancela
    const resposta = await request(app)
      .patch(`/api/entregas/${entregaId}/cancelar`)
      .set('Authorization', `Bearer ${tokenGestor}`);

    // Assert
    expect(resposta.status).toBe(200);
  });
});
