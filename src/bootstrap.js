import 'dotenv/config';
import { db } from './database/database.js';
import { EntregasRepository } from './repositories/EntregasRepository.js';
import { MotoristasRepository } from './repositories/MotoristasRepository.js';
import { RelatoriosRepository } from './repositories/RelatoriosRepository.js';
import { EntregasService } from './services/EntregasService.js';
import { MotoristasService } from './services/MotoristasService.js';
import { EntregasController } from './controllers/EntregasController.js';
import { MotoristasController } from './controllers/MotoristasController.js';
import { RelatoriosController } from './controllers/RelatoriosController.js';

const entregasRepo      = new EntregasRepository(db);
const motoristasRepo    = new MotoristasRepository(db);
const relatoriosRepo    = new RelatoriosRepository(db);
const entregasService   = new EntregasService(entregasRepo, motoristasRepo);
const motoristasService = new MotoristasService(motoristasRepo);
const entregasController   = new EntregasController(entregasService);
const motoristasController = new MotoristasController(motoristasService, entregasService);
const relatoriosController = new RelatoriosController(relatoriosRepo);

export { entregasController, motoristasController, relatoriosController };
