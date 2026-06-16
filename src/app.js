// src/app.js

import express from 'express';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { entregasController, motoristasController, relatoriosController, authController, painelEntregasController, painelMotoristasController } from './bootstrap.js';
import { entregasRouter } from './routes/entregas.routes.js';
import { motoristasRouter } from './routes/motoristas.routes.js';
import { relatoriosRouter } from './routes/relatorios.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { painelEntregasRouter } from './routes/painel/entregas.routes.js';
import { painelMotoristasRouter } from './routes/painel/motoristas.routes.js';
import { AppError } from './utils/AppError.js';

const require = createRequire(import.meta.url);
const session  = require('express-session');
const flash    = require('connect-flash');
const override = require('method-override');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ── View engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(override('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'painel-secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());

// Disponibiliza flash nas views via res.locals
app.use((req, res, next) => {
  res.locals.flash = (tipo) => req.flash(tipo);
  next();
});

// ── Auth (RF-01) ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter(authController));

// ── API REST ──────────────────────────────────────────────────────────────────
app.use('/api/entregas',   entregasRouter(entregasController));
app.use('/api/motoristas', motoristasRouter(motoristasController));
app.use('/api/relatorios', relatoriosRouter(relatoriosController));

// ── Login page (RF-05) ────────────────────────────────────────────────────────
app.get('/login', (req, res) => res.render('auth/login', { title: 'Login' }));

// ── Painel SSR ────────────────────────────────────────────────────────────────
app.use('/painel/entregas',   painelEntregasRouter(painelEntregasController));
app.use('/painel/motoristas', painelMotoristasRouter(painelMotoristasController));

// ── Redirecionamento raiz ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/painel/entregas'));

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

export default app;
