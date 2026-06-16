// src/services/AuthService.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export class AuthService {
  /**
   * @param {import('../repositories/UsuariosRepository.js').UsuariosRepository} usuariosRepository
   */
  constructor(usuariosRepository) {
    this.usuariosRepository = usuariosRepository;
  }

  async registrar({ nome, email, senha }) {
    if (!nome || !email || !senha) {
      throw new AppError('Os campos nome, email e senha são obrigatórios.', 400);
    }

    // Valida comprimento mínimo da senha (segurança básica)
    if (senha.length < 8) {
      throw new AppError('A senha deve ter no mínimo 8 caracteres.', 400);
    }

    const existe = await this.usuariosRepository.buscarPorEmail(email);
    if (existe) {
      throw new AppError('Email já cadastrado.', 409);
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await this.usuariosRepository.criar({ nome, email, senhaHash, papel: 'OPERADOR' });

    // Não retorna senhaHash
    const { senhaHash: _, ...dados } = usuario;
    return dados;
  }

  async login({ email, senha }) {
    if (!email || !senha) {
      throw new AppError('Email e senha são obrigatórios.', 400);
    }

    const usuario = await this.usuariosRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaOk) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    // refreshToken: JWT de longa duração (sem persistência nesta versão)
    const refreshToken = jwt.sign(
      { sub: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    // Retorna os tokens e o objeto do usuário sem o campo senhaHash
    const { senhaHash: _, ...dadosUsuario } = usuario;
    return { accessToken, refreshToken, usuario: dadosUsuario };
  }
}
