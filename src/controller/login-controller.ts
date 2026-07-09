import { Request, Response } from "express";
import { LoginService } from "../service/login-service";

export class LoginController {
    private service: LoginService;

    constructor(service: LoginService){
        this.service = service;
    }

    realizaLogin = async (req: Request, res: Response): Promise<void> => {
        const {email, senha} = req.body;
        try {
            const token = await this.service.verificarLogin(email, senha);
            res.status(200).json({token});
        }
        catch(err: any) {
            res.status(err.id ?? 500).json({ error: err.msg ?? "Erro interno" });
        }
    }
}