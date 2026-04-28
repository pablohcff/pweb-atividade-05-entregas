// ALTERAÇÃO (Atividade 08): adicionado async/await — motivação idêntica à do
// EntregasService: PrismaClient é assíncrono, portanto é inevitável.
// A lógica de negócio permanece completamente inalterada.
import { AppError } from '../utils/AppError.js';
 
export class MotoristasService {
  /**
   * @param {import('../repositories/IMotoristasRepository.js').IMotoristasRepository} repository
   */
  constructor(repository) {
    this.repository = repository;
  }
 
  async criarMotorista({ nome, cpf, placaVeiculo }) {
    if (!nome || !cpf || !placaVeiculo) {
      throw new AppError('Os campos nome, cpf e placaVeiculo são obrigatórios.');
    }
 
    const existente = await this.repository.buscarPorCPF(cpf);
    if (existente) {
      throw new AppError(`Já existe um motorista cadastrado com o CPF ${cpf}.`, 409);
    }
 
    return this.repository.criar({ nome, cpf, placaVeiculo, status: 'ATIVO' });
  }
 
  async listarMotoristas() {
    return this.repository.listarTodos();
  }
 
  async buscarPorId(id) {
    const motorista = await this.repository.buscarPorId(Number(id));
    if (!motorista) throw new AppError('Motorista não encontrado.', 404);
    return motorista;
  }
}