// src/repositories/UsuariosRepository.js

export class UsuariosRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    this.prisma = prisma;
  }

  async criar({ nome, email, senhaHash, papel }) {
    return this.prisma.usuario.create({
      data: { nome, email, senhaHash, papel },
    });
  }

  async buscarPorEmail(email) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }
}
