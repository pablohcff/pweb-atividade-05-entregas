// frontend/tests/e2e/login.spec.js
// RF-06: Testes E2E dos fluxos de autenticação.
// Usa o Page Object Model definido em pages/.

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';

// ─── Credenciais de teste ────────────────────────────────────────────────────
// O usuário abaixo deve existir no banco semeado (prisma/seed.js).
// Caso não exista, ajuste as credenciais ou use a API para criá-lo antes dos testes.
const USUARIO_VALIDO  = { email: 'op@test.com',       senha: 'senha123' };
const USUARIO_INVALIDO = { email: 'wrong@email.com',  senha: 'senhaerrada' };

// ─── Configuração ─────────────────────────────────────────────────────────────
// Garante que cada teste começa sem token em localStorage
test.beforeEach(async ({ page }) => {
  // Navega para uma página qualquer do domínio para poder acessar localStorage
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('accessToken'));
});

// ─── Fluxo: login inválido ────────────────────────────────────────────────────
test('login inválido — credenciais incorretas exibem mensagem de erro e não redirecionam', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Arrange
  await loginPage.navegar();

  // Act
  await loginPage.login(USUARIO_INVALIDO.email, USUARIO_INVALIDO.senha);

  // Assert — mensagem de erro visível
  await expect(loginPage.mensagemErro).toBeVisible();
  await expect(loginPage.mensagemErro).not.toHaveClass(/d-none/);

  // Assert — permanece na página de login (sem redirecionamento)
  await expect(page).toHaveURL(/\/login/);
});

// ─── Fluxo: login válido ──────────────────────────────────────────────────────
test('login válido — credenciais corretas redirecionam para /painel/entregas', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Arrange — cria o usuário de teste via API antes do teste E2E
  await page.request.post('/api/auth/registrar', {
    data: { nome: 'Operador E2E', email: USUARIO_VALIDO.email, senha: USUARIO_VALIDO.senha },
  }).catch(() => { /* ignora 409 se o usuário já existir */ });

  await loginPage.navegar();

  // Act
  await loginPage.login(USUARIO_VALIDO.email, USUARIO_VALIDO.senha);

  // Assert — redireciona para a listagem de entregas
  await expect(page).toHaveURL(/\/painel\/entregas/, { timeout: 10_000 });
});

// ─── Fluxo: acesso sem autenticação ──────────────────────────────────────────
test('acesso sem autenticação — navegar para /painel/entregas redireciona para /login', async ({ page }) => {
  // Arrange — garante que não há token
  await page.evaluate(() => localStorage.removeItem('accessToken'));

  // Act
  await page.goto('/painel/entregas');

  // Assert — script da página detecta ausência de token e redireciona para /login
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});
