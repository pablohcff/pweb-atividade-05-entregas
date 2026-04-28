// src/database/database.js
// Substituído de better-sqlite3 (síncrono) para PrismaClient (assíncrono).
// Exporta uma única instância (singleton) para evitar múltiplas conexões.

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
