import { Request, Response } from "express";
import { AgendamentoService } from "../service/agendamento-service";

export class AgendamentoController {
    constructor(private service: AgendamentoService) {}

    inserir = async (req: Request, res: Response): Promise<void> => {
        const { paciente, servicos, dataHora } = req.body;
        try {
            const novo = await this.service.inserir({ paciente, servicos, dataHora });
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
            res.status(500).json({ error: "Erro interno ao listar agendamentos" });
        }
    }

    buscarPorId = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        try {
            const agendamento = await this.service.buscarPorId(id as string);
            res.json(agendamento);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    atualizar = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        try {
            const atualizado = await this.service.atualizar(id as string, req.body);
            res.json(atualizado);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    deletar = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        try {
            await this.service.deletar(id as string);
            res.status(204).send();
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    cancelar = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        try {
            const agendamento = await this.service.cancelar(id as string);
            res.json(agendamento);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    concluir = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        try {
            const agendamento = await this.service.concluir(id as string);
            res.json(agendamento);
        }
        catch(err: any) {
            res.status(err.id).json({ error: err.msg });
        }
    }

    listarPorPaciente = async (req: Request, res: Response): Promise<void> => {
        const pacienteId = Number(req.params.pacienteId);
        try {
            const lista = await this.service.listarPorPaciente(pacienteId);
            res.json(lista);
        }
        catch(err: any) {
            res.status(err.id ?? 500).json({ error: err.msg ?? "Erro interno" });
        }
    }
}
