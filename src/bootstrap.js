import 'dotenv/config';
import { prisma } from './database/database.js';
import { EntregasRepository } from './repositories/EntregasRepository.js';
import { MotoristasRepository } from './repositories/MotoristasRepository.js';
import { RelatoriosRepository } from './repositories/RelatoriosRepository.js';
import { EntregasService } from './services/EntregasService.js';
import { MotoristasService } from './services/MotoristasService.js';
import { EntregasController } from './controllers/api/EntregasController.js';
import { MotoristasController } from './controllers/api/MotoristasController.js';
import { RelatoriosController } from './controllers/api/RelatoriosController.js';
import { PainelEntregasController } from './controllers/painel/EntregasController.js';
import { PainelMotoristasController } from './controllers/painel/MotoristasController.js';

// Atividade 08: repositórios recebem a instância do PrismaClient (em vez do db do better-sqlite3)
const entregasRepo      = new EntregasRepository(prisma);
const motoristasRepo    = new MotoristasRepository(prisma);
const relatoriosRepo    = new RelatoriosRepository(prisma);
const entregasService   = new EntregasService(entregasRepo, motoristasRepo);
const motoristasService = new MotoristasService(motoristasRepo);
const entregasController   = new EntregasController(entregasService);
const motoristasController = new MotoristasController(motoristasService, entregasService);
const relatoriosController = new RelatoriosController(relatoriosRepo);
const painelEntregasController   = new PainelEntregasController(entregasService, motoristasService);
const painelMotoristasController = new PainelMotoristasController(motoristasService);

export { entregasController, motoristasController, relatoriosController, painelEntregasController, painelMotoristasController };

