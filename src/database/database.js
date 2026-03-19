export class Database {
  constructor() {
    this.entregas = [];
    this.nextId = 1;
  }

  getEntregas() {
    return this.entregas;
  }

  generateId() {
    return this.nextId++;
  }
}
