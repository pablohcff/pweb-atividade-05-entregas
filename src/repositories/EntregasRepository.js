// src/repositories/EntregasRepository.js

export class EntregasRepository {
  constructor(database) {
    this.database = database;
  }

  listarTodos() {
    return this.database.getEntregas();
  }

  buscarPorId(id) {
    return this.database.getEntregas().find((e) => e.id === id) || null;
  }

  criar(dados) {
    const novaEntrega = {
      id: this.database.generateId(),
      ...dados,
    };
    this.database.getEntregas().push(novaEntrega);
    return novaEntrega;
  }

  atualizar(id, dados) {
    const entregas = this.database.getEntregas();
    const index = entregas.findIndex((e) => e.id === id);
    if (index === -1) return null;
    entregas[index] = { ...entregas[index], ...dados };
    return entregas[index];
  }
}
