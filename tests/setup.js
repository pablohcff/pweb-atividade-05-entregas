// tests/setup.js
// globalSetup: executado uma única vez antes de todos os testes.
// Aplica as migrações no banco de testes para garantir que o schema está atualizado.

import { execSync } from 'child_process';
import { config } from 'dotenv';

export default async function globalSetup() {
  // Garante que as variáveis de .env.test estão disponíveis neste processo
  config({ path: '.env.test' });

  // Aplica o schema Prisma no banco de testes (cria tabelas se não existirem)
  execSync('npx prisma db push --schema ./prisma/schema.prisma --skip-generate', {
    env: { ...process.env },
    stdio: 'inherit',
  });
}
