import { Database } from './database/database.js';
import { EntregasRepository } from './repositories/EntregasRepository.js';
import { MotoristasRepository } from './repositories/MotoristasRepository.js';
import { EntregasService } from './services/EntregasService.js';
import { MotoristasService } from './services/MotoristasService.js';
import { EntregasController } from './controllers/EntregasController.js';
import { MotoristasController } from './controllers/MotoristasController.js';
 
const database          = new Database();
const entregasRepo      = new EntregasRepository(database);
const motoristasRepo    = new MotoristasRepository(database);
const entregasService   = new EntregasService(entregasRepo, motoristasRepo);
const motoristasService = new MotoristasService(motoristasRepo);
const entregasController   = new EntregasController(entregasService);
const motoristasController = new MotoristasController(motoristasService, entregasService);
 
export { entregasController, motoristasController };