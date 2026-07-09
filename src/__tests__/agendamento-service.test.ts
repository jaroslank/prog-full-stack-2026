import { AgendamentoService } from '../../service/agendamento-service';
import { StatusAgendamento } from '../../entity/agendamento';
import { Repository } from 'typeorm';
import type { Agendamento } from '../../entity/agendamento';
import type { Paciente } from '../../entity/paciente';
import type { Servico } from '../../entity/servico';

const makeRepo = <T>(overrides: Partial<Repository<T>> = {}): Repository<T> =>
  ({
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as unknown as Repository<T>);

describe('AgendamentoService', () => {
  describe('inserir', () => {
    it('deve lançar 400 se paciente não informado', async () => {
      const service = new AgendamentoService(makeRepo(), makeRepo(), makeRepo());
      await expect(service.inserir({ servicos: [{ id: 1, nome: 'x', preco: 10 }], dataHora: new Date() })).rejects.toMatchObject({ id: 400 });
    });

    it('deve lançar 400 se data no passado', async () => {
      const paciente: Paciente = { id: 1, nome: 'Ana', email: 'ana@test.com' };
      const servico: Servico = { id: 1, nome: 'Consulta', preco: 50 };
      const agRepo = makeRepo<Agendamento>({ findOne: jest.fn().mockResolvedValue(null) });
      const pacRepo = makeRepo<Paciente>({ findOneBy: jest.fn().mockResolvedValue(paciente) });
      const servRepo = makeRepo<Servico>({ find: jest.fn().mockResolvedValue([servico]) });
      const service = new AgendamentoService(agRepo, pacRepo, servRepo);
      const dataPassada = new Date(Date.now() - 60000);
      await expect(service.inserir({ paciente: { id: 1 }, servicos: [{ id: 1, nome: 'x', preco: 10 }], dataHora: dataPassada })).rejects.toMatchObject({ id: 400 });
    });

    it('deve lançar 404 se paciente não existe', async () => {
      const agRepo = makeRepo<Agendamento>();
      const pacRepo = makeRepo<Paciente>({ findOneBy: jest.fn().mockResolvedValue(null) });
      const servRepo = makeRepo<Servico>();
      const service = new AgendamentoService(agRepo, pacRepo, servRepo);
      const futuro = new Date(Date.now() + 3600000);
      await expect(service.inserir({ paciente: { id: 99 }, servicos: [{ id: 1, nome: 'x', preco: 10 }], dataHora: futuro })).rejects.toMatchObject({ id: 404 });
    });
  });

  describe('cancelar', () => {
    it('deve lançar 409 se já cancelado', async () => {
      const ag: Agendamento = {
        id: 'uuid-1',
        dataHora: new Date(),
        status: StatusAgendamento.CANCELADO,
        paciente: { id: 1, nome: 'Ana', email: 'ana@test.com' },
        servicos: [],
      };
      const agRepo = makeRepo<Agendamento>({
        findOne: jest.fn().mockResolvedValue(ag),
      });
      const service = new AgendamentoService(agRepo, makeRepo(), makeRepo());
      await expect(service.cancelar('uuid-1')).rejects.toMatchObject({ id: 409 });
    });

    it('deve lançar 409 se concluído', async () => {
      const ag: Agendamento = {
        id: 'uuid-1',
        dataHora: new Date(),
        status: StatusAgendamento.CONCLUIDO,
        paciente: { id: 1, nome: 'Ana', email: 'ana@test.com' },
        servicos: [],
      };
      const agRepo = makeRepo<Agendamento>({
        findOne: jest.fn().mockResolvedValue(ag),
      });
      const service = new AgendamentoService(agRepo, makeRepo(), makeRepo());
      await expect(service.cancelar('uuid-1')).rejects.toMatchObject({ id: 409 });
    });

    it('deve cancelar agendamento agendado', async () => {
      const ag: Agendamento = {
        id: 'uuid-1',
        dataHora: new Date(),
        status: StatusAgendamento.AGENDADO,
        paciente: { id: 1, nome: 'Ana', email: 'ana@test.com' },
        servicos: [],
      };
      const salvoAg = { ...ag, status: StatusAgendamento.CANCELADO };
      const agRepo = makeRepo<Agendamento>({
        findOne: jest.fn().mockResolvedValue(ag),
        save: jest.fn().mockResolvedValue(salvoAg),
      });
      const service = new AgendamentoService(agRepo, makeRepo(), makeRepo());
      const resultado = await service.cancelar('uuid-1');
      expect(resultado.status).toBe(StatusAgendamento.CANCELADO);
    });
  });

  describe('concluir', () => {
    it('deve marcar como concluído', async () => {
      const ag: Agendamento = {
        id: 'uuid-2',
        dataHora: new Date(),
        status: StatusAgendamento.AGENDADO,
        paciente: { id: 1, nome: 'Ana', email: 'ana@test.com' },
        servicos: [],
      };
      const salvoAg = { ...ag, status: StatusAgendamento.CONCLUIDO };
      const agRepo = makeRepo<Agendamento>({
        findOne: jest.fn().mockResolvedValue(ag),
        save: jest.fn().mockResolvedValue(salvoAg),
      });
      const service = new AgendamentoService(agRepo, makeRepo(), makeRepo());
      const resultado = await service.concluir('uuid-2');
      expect(resultado.status).toBe(StatusAgendamento.CONCLUIDO);
    });
  });
});
