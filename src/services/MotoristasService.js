import { AppError } from '../utils/AppError.js';
 
export class MotoristasService {
  /**
   * @param {import('../repositories/IMotoristasRepository.js').IMotoristasRepository} repository
   */
  constructor(repository) {
    this.repository = repository;
  }
 
  criarMotorista({ nome, cpf, placaVeiculo }) {
    if (!nome || !cpf || !placaVeiculo) {
      throw new AppError('Os campos nome, cpf e placaVeiculo são obrigatórios.');
    }
 
    const existente = this.repository.buscarPorCPF(cpf);
    if (existente) {
      throw new AppError(`Já existe um motorista cadastrado com o CPF ${cpf}.`, 409);
    }
 
    return this.repository.criar({ nome, cpf, placaVeiculo, status: 'ATIVO' });
  }
 
  listarMotoristas() {
    return this.repository.listarTodos();
  }
 
  buscarPorId(id) {
    const motorista = this.repository.buscarPorId(Number(id));
    if (!motorista) throw new AppError('Motorista não encontrado.', 404);
    return motorista;
  }
}