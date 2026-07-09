import { Request, Response } from "express";
import { ProfissionalService } from "../service/profissional-service";

export class ProfissionalController {
    constructor(private service: ProfissionalService) {}

    inserir = async (req: Request, res: Response): Promise<void> => {
        try {
            const novo = await this.service.inserir(req.body);
            res.status(201).json(novo);
        }
        catch(err: any) {
            res.status(err.id ?? 500).json({ error: err.msg ?? "Erro interno" });
        }
    }

    listar = async (_req: Request, res: Response): Promise<void> => {
        try {
            const lista = await this.service.listar();
            res.json(lista);
        }
        catch(err: any) {
            res.status(500).json({ error: "Erro interno ao listar profissionais" });
        }
    }

    buscarPorId = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            const profissional = await this.service.buscarPorId(id);
            res.json(profissional);
        }
        catch(err: any) {
            res.status(err.id ?? 500).json({ error: err.msg ?? "Erro interno" });
        }
    }

    atualizar = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            const profissional = await this.service.atualizar(id, req.body);
            res.json(profissional);
        }
        catch(err: any) {
            res.status(err.id ?? 500).json({ error: err.msg ?? "Erro interno" });
        }
    }

    deletar = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            await this.service.deletar(id);
            res.status(204).send();
        }
        catch(err: any) {
            res.status(err.id ?? 500).json({ error: err.msg ?? "Erro interno" });
        }
    }

    uploadFoto = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            if(!req.file) {
                res.status(400).json({ error: "Nenhuma imagem enviada" });
                return;
            }
            const profissional = await this.service.atualizarFoto(id, req.file.filename);
            res.json(profissional);
        }
        catch(err: any) {
            res.status(err.id ?? 500).json({ error: err.msg ?? "Erro interno" });
        }
    }
}
