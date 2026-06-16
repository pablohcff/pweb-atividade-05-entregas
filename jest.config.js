// jest.config.js
// Carrega .env.test antes de qualquer teste para isolar o banco de dados e segredos.
import { config } from 'dotenv';
config({ path: '.env.test' });

export default {
  // Usa módulos ES nativos do Node (sem transpilação Babel)
  testEnvironment: 'node',
  transform: {},
  // Nota: '.js' não precisa ser declarado aqui — é inferido automaticamente
  // a partir de "type": "module" no package.json

  // Executa apenas testes unitários e de integração (E2E fica com Playwright)
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
  ],

  // SQLite não suporta múltiplas conexões simultâneas com segurança;
  // executa as suítes sequencialmente para evitar conflitos no banco de testes.
  maxWorkers: 1,

  // Arquivo de configuração global executado após o framework Jest ser carregado
  globalSetup: './tests/setup.js',

  // Diretório de saída da cobertura
  coverageDirectory: 'coverage',

  // Coletores de cobertura — apenas as camadas definidas no RF-07
  collectCoverageFrom: [
    'src/services/**/*.js',
    'src/middleware/**/*.js',
    'src/utils/**/*.js',
  ],

  // Limiares mínimos de cobertura exigidos pelo RF-07
  coverageThreshold: {
    './src/services/': {
      statements: 80,
    },
    './src/middleware/': {
      statements: 85,
    },
    './src/utils/': {
      statements: 75,
    },
  },
};
