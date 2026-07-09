import { In, Repository } from "typeorm";
import { Agendamento, StatusAgendamento } from "../entity/agendamento";
import { Paciente } from "../entity/paciente";
import { Servico } from "../entity/servico";

export class AgendamentoService {
    constructor(
        private repository: Repository<Agendamento>,
        private pacienteRepository: Repository<Paciente>,
        private servicoRepository: Repository<Servico>
    ) {}

    async inserir(agendamento: Agendamento): Promise<Agendamento> {
        if(!agendamento.paciente?.id || !agendamento.servicos || agendamento.servicos.length <= 0 || !agendamento.dataHora) {
            throw ({id: 400, msg: "Falta dados obrigatórios do agendamento"});
        }

        const paciente = await this.pacienteRepository.findOneBy({ id: agendamento.paciente.id });
        if(!paciente) {
            throw ({id: 404, msg: "Paciente não encontrado"});
        }

        const idsServicos = agendamento.servicos
            .map((s) => s.id)
            .filter((id): id is number => typeof id === "number");

        if(idsServicos.length !== agendamento.servicos.length) {
            throw ({id: 400, msg: "Lista de serviços inválida"});
        }

        const servicos = await this.servicoRepository.find({
            where: { id: In(idsServicos) },
            relations: { especialidade: true }
        });

        if(servicos.length !== idsServicos.length) {
            throw ({id: 404, msg: "Um ou mais serviços não foram encontrados"});
        }

        const dataHora = new Date(agendamento.dataHora);
        if(isNaN(dataHora.getTime()) || dataHora.getTime() < Date.now()) {
            throw ({id: 400, msg: "Data/hora do agendamento deve ser futura e válida"});
        }

        const conflito = await this.repository.findOne({
            where: {
                dataHora,
                paciente: { id: paciente.id }
            },
            relations: { paciente: true }
        });

        if(conflito) {
            throw ({id: 409, msg: "Paciente já possui agendamento nesse horário"});
        }

        const novoAgendamento: Agendamento = {
            dataHora,
            paciente,
            servicos
        };

        return await this.repository.save(novoAgendamento);
    }

    async listar(): Promise<Agendamento[]> {
        return await this.repository.find({
            relations: {
                paciente: true,
                servicos: { especialidade: true }
            }
        });
    }

    async buscarPorId(id: string): Promise<Agendamento> {
        const agendamento = await this.repository.findOne({
            where: { id },
            relations: {
                paciente: true,
                servicos: { especialidade: true }
            }
        });

        if(!agendamento) {
            throw ({id: 404, msg: "Agendamento não encontrado"});
        }

        return agendamento;
    }

    async atualizar(id: string, agendamentoAlterado: Agendamento): Promise<Agendamento> {
        const agendamento = await this.buscarPorId(id);

        if(agendamentoAlterado.dataHora) {
            const dataHora = new Date(agendamentoAlterado.dataHora);
            if(isNaN(dataHora.getTime()) || dataHora.getTime() < Date.now()) {
                throw ({id: 400, msg: "Data/hora do agendamento deve ser futura e válida"});
            }
            agendamento.dataHora = dataHora;
        }

        if(agendamentoAlterado.servicos && agendamentoAlterado.servicos.length > 0) {
            const idsServicos = agendamentoAlterado.servicos
                .map((s) => s.id)
                .filter((sid): sid is number => typeof sid === "number");

            const servicos = await this.servicoRepository.findBy({ id: In(idsServicos) });
            if(servicos.length !== idsServicos.length) {
                throw ({id: 404, msg: "Um ou mais serviços não foram encontrados"});
            }
            agendamento.servicos = servicos;
        }

        if(agendamentoAlterado.paciente?.id) {
            const paciente = await this.pacienteRepository.findOneBy({ id: agendamentoAlterado.paciente.id });
            if(!paciente) {
                throw ({id: 404, msg: "Paciente não encontrado"});
            }
            agendamento.paciente = paciente;
        }

        return await this.repository.save(agendamento);
    }

    async deletar(id: string): Promise<void> {
        const agendamento = await this.repository.findOneBy({ id });
        if(!agendamento) {
            throw ({id: 404, msg: "Agendamento não encontrado"});
        }
        await this.repository.delete({ id });
    }

    async cancelar(id: string): Promise<Agendamento> {
        const agendamento = await this.buscarPorId(id);
        if(agendamento.status === StatusAgendamento.CANCELADO) {
            throw ({id: 409, msg: "Agendamento já está cancelado"});
        }
        if(agendamento.status === StatusAgendamento.CONCLUIDO) {
            throw ({id: 409, msg: "Não é possível cancelar um agendamento concluído"});
        }
        agendamento.status = StatusAgendamento.CANCELADO;
        return await this.repository.save(agendamento);
    }

    async concluir(id: string): Promise<Agendamento> {
        const agendamento = await this.buscarPorId(id);
        if(agendamento.status === StatusAgendamento.CANCELADO) {
            throw ({id: 409, msg: "Não é possível concluir um agendamento cancelado"});
        }
        if(agendamento.status === StatusAgendamento.CONCLUIDO) {
            throw ({id: 409, msg: "Agendamento já está concluído"});
        }
        agendamento.status = StatusAgendamento.CONCLUIDO;
        return await this.repository.save(agendamento);
    }

    async listarPorPaciente(pacienteId: number): Promise<Agendamento[]> {
        return await this.repository.find({
            where: { paciente: { id: pacienteId } },
            relations: {
                paciente: true,
                servicos: { especialidade: true }
            }
        });
    }
}
