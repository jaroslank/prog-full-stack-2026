import { Repository } from "typeorm";
import { Paciente } from "../entity/paciente";

export class PacienteService {
    constructor(private repository: Repository<Paciente>) {}

    async inserir(paciente: Paciente): Promise<Paciente> {
        if(!paciente || !paciente.nome || !paciente.email) {
            throw ({id: 400, msg: "Falta dados obrigatórios do paciente"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(paciente.email)) {
            throw ({id: 400, msg: "Email inválido"});
        }

        if(paciente.cpf) {
            const cpfLimpo = paciente.cpf.replace(/\D/g, '');
            if(cpfLimpo.length !== 11) {
                throw ({id: 400, msg: "CPF inválido"});
            }
            const cpfExistente = await this.repository.findOneBy({ cpf: paciente.cpf });
            if(cpfExistente) {
                throw ({id: 409, msg: "CPF já cadastrado para outro paciente"});
            }
        }

        const existente = await this.repository.findOneBy({ email: paciente.email });
        if(existente) {
            throw ({id: 409, msg: "Email já cadastrado para outro paciente"});
        }

        return await this.repository.save(paciente);
    }

    async listar(): Promise<Paciente[]> {
        return await this.repository.find();
    }

    async buscarPorId(id: number): Promise<Paciente> {
        const paciente = await this.repository.findOneBy({ id });
        if(!paciente) {
            throw ({id: 404, msg: "Paciente não encontrado"});
        }
        return paciente;
    }

    async atualizar(id: number, pacienteAlterado: Paciente): Promise<Paciente> {
        const paciente = await this.repository.findOneBy({ id });
        if(!paciente) {
            throw ({id: 404, msg: "Paciente não encontrado"});
        }

        if(!pacienteAlterado || (!pacienteAlterado.nome && !pacienteAlterado.email)) {
            throw ({id: 400, msg: "Nenhum dado para atualizar"});
        }

        if(pacienteAlterado.email && pacienteAlterado.email !== paciente.email) {
            const existente = await this.repository.findOneBy({ email: pacienteAlterado.email });
            if(existente && existente.id !== id) {
                throw ({id: 409, msg: "Email já cadastrado para outro paciente"});
            }
            paciente.email = pacienteAlterado.email;
        }

        if(pacienteAlterado.nome) {
            paciente.nome = pacienteAlterado.nome;
        }

        return await this.repository.save(paciente);
    }

    async deletar(id: number): Promise<void> {
        const paciente = await this.repository.findOneBy({ id });
        if(!paciente) {
            throw ({id: 404, msg: "Paciente não encontrado"});
        }
        await this.repository.delete({ id });
    }
}
