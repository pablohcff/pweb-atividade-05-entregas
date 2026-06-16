// src/controllers/api/AuthController.js

export class AuthController {
  constructor(service) {
    this.service = service;
  }

  async registrar(req, res) {
    const usuario = await this.service.registrar(req.body);
    return res.status(201).json(usuario);
  }

  async login(req, res) {
    // Retorna ambos os tokens; usuario fica apenas no payload do accessToken
    const { accessToken, refreshToken } = await this.service.login(req.body);
    return res.status(200).json({ accessToken, refreshToken });
  }
}
