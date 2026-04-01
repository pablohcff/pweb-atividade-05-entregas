export class Database {
  constructor() {
    this.entregas = [];
    this.motoristas = [];
    this.nextId = 1;
  }
 
  getEntregas() {
    return this.entregas;
  }
 
  getMotoristas() {
    return this.motoristas;
  }
 
  generateId() {
    return this.nextId++;
  }
}