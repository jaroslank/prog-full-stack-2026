import { Repository } from "typeorm";
import { Servico } from "../entity/servico";

export class ServicoService {
    private repository: Repository<Servico>;

    constructor(repository: Repository<Servico>) {
        this.repository = repository;
    }

    async inserir(servico: Servico): Promise<Servico> {
        if(!servico || !servico.nome || !servico.preco) {
            throw ({id: 400, msg: "Falta dados obrigatórios do serviço"});
        }
        return await this.repository.save(servico);
    }

    async listar(): Promise<Servico[]> {
        return await this.repository.find({
            relations: { especialidade: true }
        });
    }

    async buscarPorId(id: number): Promise<Servico> {
        const servico = await this.repository.findOne({
            where: { id },
            relations: { especialidade: true }
        });

        if(!servico) {
            throw ({id: 404, msg: "Serviço não encontrado"});
        }

        return servico;
    }

    async atualizar(id: number, servicoAlterado: Servico): Promise<Servico> {
        if(!servicoAlterado || !servicoAlterado.nome || !servicoAlterado.preco) {
            throw ({id: 400, msg: "Serviço sem dados corretos"});
        }

        const servico = await this.repository.findOneBy({ id });
        if(!servico) {
            throw ({id: 404, msg: "Serviço não encontrado"});
        }

        servico.nome = servicoAlterado.nome;
        servico.preco = servicoAlterado.preco;
        servico.especialidade = servicoAlterado.especialidade;

        return await this.repository.save(servico);
    }

    async deletar(id: number): Promise<Servico> {
        const servico = await this.repository.findOneBy({ id });
        if(!servico) {
            throw ({id: 404, msg: "Serviço não encontrado"});
        }
        await this.repository.delete({ id });
        return servico;
    }
}
