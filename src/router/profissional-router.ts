import { Router } from "express";
import { ProfissionalController } from "../controller/profissional-controller";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "my-uploads";
if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profissional-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const isValid = allowed.test(path.extname(file.originalname).toLowerCase())
            && allowed.test(file.mimetype);
        if(isValid) {
            cb(null, true);
        } else {
            cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)"));
        }
    }
});

// /api/profissionais
export const profissionalRotas = (controller: ProfissionalController): Router => {
    const router = Router();

    // A rota POST para inserir já é pública em app.ts
    // router.post("/", controller.inserir);

    router.get("/", controller.listar);
    router.get("/:id", controller.buscarPorId);
    router.put("/:id", controller.atualizar);
    router.patch("/:id/foto", upload.single("foto"), controller.uploadFoto);
    router.delete("/:id", controller.deletar);

    return router;
};
