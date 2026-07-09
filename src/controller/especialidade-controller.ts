import { Request, Response } from "express";
import { EspecialidadeService } from "../service/especialidade-service";

export class EspecialidadeController {
    constructor(private service: EspecialidadeService) {}

    inserir = async (req: Request, res: Response): Promise<void> => {
        try {
            const nova = await this.service.inserir(req.body);
            res.status(201).json(nova);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    listar = async (_req: Request, res: Response): Promise<void> => {
        const lista = await this.service.listar();
        res.json(lista);
    }

    buscarPorId = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            const especialidade = await this.service.buscarPorId(id);
            res.json(especialidade);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    atualizar = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            const especialidade = await this.service.atualizar(id, req.body);
            res.json(especialidade);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    deletar = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            await this.service.deletar(id);
            res.status(204).send();
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }
}
