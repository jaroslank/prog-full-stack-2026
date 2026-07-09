import { Repository } from "typeorm";
import { Profissional } from "../entity/profissional";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = "Sen@c2026";

export class LoginService {
    private repository: Repository<Profissional>;

    constructor(repository:Repository<Profissional>) {
        this.repository = repository;
    }

    async verificarLogin(email: string, senha: string): Promise<string> {
        if(!email || !senha) {
            throw ({id: 400, msg: "Email e senha são obrigatórios"});
        }
        const profissional = await this.repository.findOneBy({email});
        if(profissional && profissional.senha && await bcrypt.compare(senha, profissional.senha)) {
            const token = jwt.sign({
                profissionalId: profissional.id,
                profissionalEmail: profissional.email
            }, SECRET,
            { expiresIn: '1h'});
            return token;
        }
        throw ({id: 401, msg:"Profissional ou senha inválidos"});
    }

    async validarToken (token: string): Promise<void> {
        try{
            const payload = jwt.verify(token, SECRET);            
            if(!payload) {
                throw({id: 401, msg: "Token inválido"});
            }
            return;
        }
        catch (err) {
            throw({id: 401, msg: "Token inválido"});
        }
    }
}