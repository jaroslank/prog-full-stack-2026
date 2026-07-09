import { PacienteService } from '../../service/paciente-service';
import { Repository } from 'typeorm';
import { Paciente } from '../../entity/paciente';

const makeRepo = (overrides: Partial<Repository<Paciente>> = {}): Repository<Paciente> =>
  ({
    findOneBy: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as unknown as Repository<Paciente>);

describe('PacienteService', () => {
  describe('inserir', () => {
    it('deve lançar 400 se nome não informado', async () => {
      const service = new PacienteService(makeRepo());
      await expect(service.inserir({ nome: '', email: 'a@b.com' })).rejects.toMatchObject({ id: 400 });
    });

    it('deve lançar 400 se email inválido', async () => {
      const service = new PacienteService(makeRepo());
      await expect(service.inserir({ nome: 'João', email: 'invalido' })).rejects.toMatchObject({ id: 400 });
    });

    it('deve lançar 400 se CPF inválido (menos de 11 dígitos)', async () => {
      const service = new PacienteService(makeRepo({ findOneBy: jest.fn().mockResolvedValue(null) }));
      await expect(service.inserir({ nome: 'João', email: 'joao@test.com', cpf: '123' })).rejects.toMatchObject({ id: 400 });
    });

    it('deve lançar 409 se CPF duplicado', async () => {
      const repo = makeRepo({ findOneBy: jest.fn().mockResolvedValueOnce({ id: 99, nome: 'Outro', email: 'outro@test.com', cpf: '12345678901' }) });
      const service = new PacienteService(repo);
      await expect(service.inserir({ nome: 'João', email: 'joao@test.com', cpf: '12345678901' })).rejects.toMatchObject({ id: 409 });
    });

    it('deve lançar 409 se email duplicado', async () => {
      const repo = makeRepo({
        findOneBy: jest.fn()
          .mockResolvedValueOnce(null) // sem CPF duplicado
          .mockResolvedValueOnce({ id: 1 }), // email duplicado
      });
      const service = new PacienteService(repo);
      await expect(service.inserir({ nome: 'João', email: 'joao@test.com' })).rejects.toMatchObject({ id: 409 });
    });

    it('deve salvar paciente válido', async () => {
      const novoPaciente: Paciente = { id: 1, nome: 'João', email: 'joao@test.com' };
      const repo = makeRepo({
        findOneBy: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockResolvedValue(novoPaciente),
      });
      const service = new PacienteService(repo);
      const resultado = await service.inserir({ nome: 'João', email: 'joao@test.com' });
      expect(resultado).toEqual(novoPaciente);
    });
  });

  describe('buscarPorId', () => {
    it('deve lançar 404 se não encontrado', async () => {
      const repo = makeRepo({ findOneBy: jest.fn().mockResolvedValue(null) });
      const service = new PacienteService(repo);
      await expect(service.buscarPorId(999)).rejects.toMatchObject({ id: 404 });
    });

    it('deve retornar paciente se encontrado', async () => {
      const paciente: Paciente = { id: 1, nome: 'Maria', email: 'maria@test.com' };
      const repo = makeRepo({ findOneBy: jest.fn().mockResolvedValue(paciente) });
      const service = new PacienteService(repo);
      const resultado = await service.buscarPorId(1);
      expect(resultado).toEqual(paciente);
    });
  });

  describe('deletar', () => {
    it('deve lançar 404 se não encontrado', async () => {
      const repo = makeRepo({ findOneBy: jest.fn().mockResolvedValue(null) });
      const service = new PacienteService(repo);
      await expect(service.deletar(999)).rejects.toMatchObject({ id: 404 });
    });

    it('deve deletar se encontrado', async () => {
      const paciente: Paciente = { id: 1, nome: 'Maria', email: 'maria@test.com' };
      const deleteFn = jest.fn().mockResolvedValue(undefined);
      const repo = makeRepo({ findOneBy: jest.fn().mockResolvedValue(paciente), delete: deleteFn });
      const service = new PacienteService(repo);
      await service.deletar(1);
      expect(deleteFn).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
