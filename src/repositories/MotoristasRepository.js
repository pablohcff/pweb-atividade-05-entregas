
export class MotoristasRepository {
  constructor(database) {
    this.database = database;
  }
 
  listarTodos() {
    return this.database.getMotoristas();
  }
 
  buscarPorId(id) {
    return this.database.getMotoristas().find((m) => m.id === id) || null;
  }
 
  buscarPorCPF(cpf) {
    return this.database.getMotoristas().find((m) => m.cpf === cpf) || null;
  }
 
  criar(dados) {
    const novoMotorista = {
      id: this.database.generateId(),
      ...dados,
    };
    this.database.getMotoristas().push(novoMotorista);
    return novoMotorista;
  }
 
  atualizar(id, dados) {
    const motoristas = this.database.getMotoristas();
    const index = motoristas.findIndex((m) => m.id === id);
    if (index === -1) return null;
    motoristas[index] = { ...motoristas[index], ...dados };
    return motoristas[index];
  }
}