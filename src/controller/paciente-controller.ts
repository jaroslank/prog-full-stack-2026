import { Request, Response } from "express";
import { PacienteService } from "../service/paciente-service";

export class PacienteController {
    constructor(private service: PacienteService) {}

    inserir = async (req: Request, res: Response): Promise<void> => {
        try {
            const novo = await this.service.inserir(req.body);
            res.status(201).json(novo);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    listar = async (_req: Request, res: Response): Promise<void> => {
        try {
            const lista = await this.service.listar();
            res.json(lista);
        }
        catch(err: any) {
            res.status(500).json({ error: "Erro interno ao listar pacientes" });
        }
    }

    buscarPorId = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            const paciente = await this.service.buscarPorId(id);
            res.json(paciente);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    atualizar = async (req: Request, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        try {
            const paciente = await this.service.atualizar(id, req.body);
            res.json(paciente);
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
