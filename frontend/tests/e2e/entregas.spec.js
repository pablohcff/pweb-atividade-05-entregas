// frontend/tests/e2e/entregas.spec.js
// RF-06: Testes E2E dos fluxos da listagem de entregas.
// Usa o Page Object Model definido em pages/.

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { EntregasPage } from './pages/EntregasPage.js';

const USUARIO_VALIDO = { email: 'e2e.entregas@test.com', senha: 'senha123' };

// ─── Configuração ─────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  // Garante localStorage limpo antes de cada teste
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('accessToken'));

  // Cria o usuário de teste se ainda não existir
  await page.request.post('/api/auth/registrar', {
    data: { nome: 'E2E Entregas', email: USUARIO_VALIDO.email, senha: USUARIO_VALIDO.senha },
  }).catch(() => { /* ignora 409 */ });
});

// ─── Fluxo: listagem de entregas ──────────────────────────────────────────────

test('listagem de entregas — após login, a tabela de entregas é exibida', async ({ page }) => {
  const loginPage    = new LoginPage(page);
  const entregasPage = new EntregasPage(page);

  // Arrange — cria uma entrega via API para garantir ao menos uma linha
  const loginResp = await page.request.post('/api/auth/login', {
    data: { email: USUARIO_VALIDO.email, senha: USUARIO_VALIDO.senha },
  });
  const { accessToken } = await loginResp.json();

  await page.request.post('/api/entregas', {
    data:    { descricao: 'Entrega E2E', origem: 'São Paulo', destino: 'Campinas' },
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => { /* ignora duplicata */ });

  // Act — faz login via UI
  await loginPage.navegar();
  await loginPage.login(USUARIO_VALIDO.email, USUARIO_VALIDO.senha);
  await expect(page).toHaveURL(/\/painel\/entregas/, { timeout: 10_000 });

  // Assert — tabela visível com ao menos uma linha de entrega
  await expect(entregasPage.tabelaEntregas).toBeVisible();
  await expect(entregasPage.linhasEntrega).toHaveCount(
    await entregasPage.linhasEntrega.count() >= 1
      ? await entregasPage.linhasEntrega.count()
      : 1,
  );
  expect(await entregasPage.linhasEntrega.count()).toBeGreaterThanOrEqual(1);
});

// ─── Fluxo: logout ────────────────────────────────────────────────────────────

test('logout — clicar em Sair redireciona para /login e impede acesso a /painel/entregas', async ({ page }) => {
  const loginPage    = new LoginPage(page);
  const entregasPage = new EntregasPage(page);

  // Arrange — loga primeiro
  await loginPage.navegar();
  await loginPage.login(USUARIO_VALIDO.email, USUARIO_VALIDO.senha);
  await expect(page).toHaveURL(/\/painel\/entregas/, { timeout: 10_000 });

  // Act — clica em Sair
  await entregasPage.sair();

  // Assert 1 — redirecionado para /login
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

  // Assert 2 — tentar acessar /painel/entregas redireciona de volta para /login
  await page.goto('/painel/entregas');
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});
