import { Repository } from "typeorm";
import { Profissional } from "../entity/profissional";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export class ProfissionalService {
    constructor(private repository: Repository<Profissional>) {}

    async inserir(profissional: Profissional): Promise<Profissional> {
        if(!profissional || !profissional.email || !profissional.senha) {
            throw ({id: 400, msg: "Falta dados obrigatórios do profissional"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(profissional.email)) {
            throw ({id: 400, msg: "Email inválido"});
        }

        if(profissional.senha.length < 6) {
            throw ({id: 400, msg: "A senha deve ter pelo menos 6 caracteres"});
        }

        const existente = await this.repository.findOneBy({ email: profissional.email });
        if(existente) {
            throw ({id: 409, msg: "Email já cadastrado"});
        }

        profissional.senha = await bcrypt.hash(profissional.senha, SALT_ROUNDS);
        const salvo = await this.repository.save(profissional);
        return { id: salvo.id, nome: salvo.nome, email: salvo.email };
    }

    async listar(): Promise<Profissional[]> {
        return await this.repository.find({
            select: {
                id: true,
                nome: true,
                email: true,
                foto: true
            }
        });
    }

    async buscarPorId(id: number): Promise<Profissional> {
        const profissional = await this.repository.findOne({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                foto: true
            }
        });

        if(!profissional) {
            throw ({id: 404, msg: "Profissional não encontrado"});
        }

        return profissional;
    }

    async atualizar(id: number, profissionalAlterado: Profissional): Promise<Profissional> {
        const profissional = await this.repository.findOneBy({ id });
        if(!profissional) {
            throw ({id: 404, msg: "Profissional não encontrado"});
        }

        if(!profissionalAlterado || (!profissionalAlterado.email && !profissionalAlterado.senha && !profissionalAlterado.nome)) {
            throw ({id: 400, msg: "Nenhum dado para atualizar"});
        }

        if(profissionalAlterado.email && profissionalAlterado.email !== profissional.email) {
            const existente = await this.repository.findOneBy({ email: profissionalAlterado.email });
            if(existente && existente.id !== id) {
                throw ({id: 409, msg: "Email já cadastrado"});
            }
            profissional.email = profissionalAlterado.email;
        }

        if(profissionalAlterado.nome !== undefined) {
            profissional.nome = profissionalAlterado.nome;
        }

        if(profissionalAlterado.senha) {
            if(profissionalAlterado.senha.length < 6) {
                throw ({id: 400, msg: "A senha deve ter pelo menos 6 caracteres"});
            }
            profissional.senha = await bcrypt.hash(profissionalAlterado.senha, SALT_ROUNDS);
        }

        const salvo = await this.repository.save(profissional);
        return { id: salvo.id, nome: salvo.nome, email: salvo.email, foto: salvo.foto };
    }

    async atualizarFoto(id: number, nomeArquivo: string): Promise<Profissional> {
        const profissional = await this.repository.findOneBy({ id });
        if(!profissional) {
            throw ({id: 404, msg: "Profissional não encontrado"});
        }
        profissional.foto = nomeArquivo;
        const salvo = await this.repository.save(profissional);
        return { id: salvo.id, nome: salvo.nome, email: salvo.email, foto: salvo.foto };
    }

    async deletar(id: number): Promise<void> {
        const profissional = await this.repository.findOneBy({ id });
        if(!profissional) {
            throw ({id: 404, msg: "Profissional não encontrado"});
        }
        await this.repository.delete({ id });
    }
}
