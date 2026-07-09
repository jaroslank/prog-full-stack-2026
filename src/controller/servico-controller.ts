import { Request, Response } from "express";
import { ServicoService } from "../service/servico-service";

export class ServicoController {
    private service: ServicoService;

    constructor(service: ServicoService) {
        this.service = service;
    }

    inserir = async (req: Request, res: Response): Promise<void> => {
        const servico = req.body;
        try {
            const novoServico = await this.service.inserir(servico);
            res.status(201).json(novoServico);
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
            const servico = await this.service.buscarPorId(id);
            res.json(servico);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    atualizar = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            const servico = await this.service.atualizar(id, req.body);
            res.json(servico);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    deletar = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            const servico = await this.service.deletar(id);
            res.json(servico);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }
}
