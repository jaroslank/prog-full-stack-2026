import { Router } from "express";
import { AgendamentoController } from "../controller/agendamento-controller";

// /api/agendamentos
export const agendamentoRotas = (controller: AgendamentoController): Router => {
    const router = Router();

    router.post("/", controller.inserir);
    router.get("/", controller.listar);
    router.get("/paciente/:pacienteId", controller.listarPorPaciente);
    router.get("/:id", controller.buscarPorId);
    router.put("/:id", controller.atualizar);
    router.patch("/:id/cancelar", controller.cancelar);
    router.patch("/:id/concluir", controller.concluir);
    router.delete("/:id", controller.deletar);

    return router;
};
