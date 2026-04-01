// src/app.js
 
import express from 'express';
import { entregasController, motoristasController } from './bootstrap.js';
import { entregasRouter } from './routes/entregas.routes.js';
import { motoristasRouter } from './routes/motoristas.routes.js';
import { AppError } from './utils/AppError.js';
 
const app = express();
app.use(express.json());
 
app.use('/api/entregas', entregasRouter(entregasController));
app.use('/api/motoristas', motoristasRouter(motoristasController));
 
// Error handler global
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});
 
export default app;