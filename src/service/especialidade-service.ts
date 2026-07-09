import { Repository } from "typeorm";
import { Especialidade } from "../entity/especialidade";

export class EspecialidadeService {
    constructor(private repository: Repository<Especialidade>) {}

    async inserir(especialidade: Especialidade): Promise<Especialidade> {
        if(!especialidade || !especialidade.nome) {
            throw ({id: 400, msg: "Falta nome da especialidade"});
        }
        return await this.repository.save(especialidade);
    }

    async listar(): Promise<Especialidade[]> {
        return await this.repository.find();
    }

    async buscarPorId(id: number): Promise<Especialidade> {
        const especialidade = await this.repository.findOneBy({ id });
        if(!especialidade) {
            throw ({id: 404, msg: "Especialidade não encontrada"});
        }
        return especialidade;
    }

    async atualizar(id: number, especialidadeAlterada: Especialidade): Promise<Especialidade> {
        if(!especialidadeAlterada || !especialidadeAlterada.nome) {
            throw ({id: 400, msg: "Especialidade sem dados corretos"});
        }

        const especialidade = await this.repository.findOneBy({ id });
        if(!especialidade) {
            throw ({id: 404, msg: "Especialidade não encontrada"});
        }

        especialidade.nome = especialidadeAlterada.nome;
        return await this.repository.save(especialidade);
    }

    async deletar(id: number): Promise<void> {
        const especialidade = await this.repository.findOneBy({ id });
        if(!especialidade) {
            throw ({id: 404, msg: "Especialidade não encontrada"});
        }
        await this.repository.delete({ id });
    }
}
