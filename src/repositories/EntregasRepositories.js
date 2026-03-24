export class EntregasRepositories {
  constructor(database) {
    this.database = database;
  }

  listarTodos() {
    return this.database.getEntregas();
  }

  buscarPorId(id) {
    return this.database.getEntregas().find(e => e.id === id);
  }

  criar(entrega) {
    this.database.getEntregas().push(entrega);
    return entrega;
  }

  atualizar(id, dados) {
    const entregas = this.database.getEntregas();
    const index = entregas.findIndex(e => e.id === id);

    if (index === -1) return null;

    entregas[index] = { ...entregas[index], ...dados };
    return entregas[index];
  }
}