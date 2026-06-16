// frontend/playwright.config.js
// RF-06: Configuração do Playwright para testes E2E.
// Os testes apontam para o servidor Express (porta 3002) em vez de uma SPA
// separada, pois o frontend é server-side rendering com EJS.

import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carrega variáveis do .env de produção para iniciar o servidor nos testes E2E
loadEnv({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 3002;

export default defineConfig({
  // Diretório raiz dos testes E2E
  testDir: './tests/e2e',

  // Captura screenshot apenas quando o teste falha
  use: {
    baseURL:    `http://localhost:${PORT}`,
    screenshot: 'only-on-failure',
    // Aguarda as ações antes de prosseguir
    actionTimeout: 10_000,
  },

  // Executa apenas no Chromium por padrão
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Sobe o servidor Express automaticamente antes dos testes E2E
  webServer: {
    command: 'node src/server.js',
    cwd:     path.join(__dirname, '..'),
    url:     `http://localhost:${PORT}`,
    // Reutiliza servidor já em execução se disponível
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
