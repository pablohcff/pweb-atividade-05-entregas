export class UsuariosRepository {
  constructor() {

    this.usuarios = [
      { id: 1, nome: 'Ana Silva',   email: 'ana@exemplo.com',   senha: '123' },
      { id: 2, nome: 'Bruno Costa', email: 'bruno@exemplo.com', senha: 'hash2' },
    ];
    this.proximoId = 3;
  }

  async listarTodos() {
    return this.usuarios;
  }

  async buscarPorId(id) {
    return this.usuarios.find((u) => u.id === id) ?? null;
  }

  async criar(dados) {
    const novoUsuario = { id: this.proximoId++, ...dados };
    this.usuarios.push(novoUsuario);
    return novoUsuario;
  }

  async atualizar(id, dados) {
    const indice = this.usuarios.findIndex((u) => u.id === id);
    if (indice === -1) return null;
    this.usuarios[indice] = { ...this.usuarios[indice], ...dados, id };
    return this.usuarios[indice];
  }
  // aaa
