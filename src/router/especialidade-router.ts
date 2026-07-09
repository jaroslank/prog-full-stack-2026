import { Router } from "express";
import { EspecialidadeController } from "../controller/especialidade-controller";

// /api/especialidades
export const especialidadeRotas = (controller: EspecialidadeController): Router => {
    const router = Router();

    router.post("/", controller.inserir);
    router.get("/", controller.listar);
    router.get("/:id", controller.buscarPorId);
    router.put("/:id", controller.atualizar);
    router.delete("/:id", controller.deletar);

    return router;
};
