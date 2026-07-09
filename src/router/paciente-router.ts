import { Router } from "express";
import { PacienteController } from "../controller/paciente-controller";

// /api/pacientes
export const pacienteRotas = (controller: PacienteController): Router => {
    const router = Router();

    router.post("/", controller.inserir);
    router.get("/", controller.listar);
    router.get("/:id", controller.buscarPorId);
    router.put("/:id", controller.atualizar);
    router.delete("/:id", controller.deletar);

    return router;
};
