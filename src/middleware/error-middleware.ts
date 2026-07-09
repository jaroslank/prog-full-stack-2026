import { NextFunction, Request, Response } from "express";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction): void {
    // Erros de validação do multer (ex: tipo de arquivo inválido)
    if(err.message && err.message.includes("Apenas imagens")) {
        res.status(400).json({ error: err.message });
        return;
    }

    // Erros de limite de tamanho do multer
    if(err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Arquivo muito grande. Máximo permitido: 5MB" });
        return;
    }

    // Erros com código HTTP definido pela aplicação
    if(err.id && typeof err.id === "number") {
        res.status(err.id).json({ error: err.msg });
        return;
    }

    // Erro genérico
    console.error("Erro não tratado:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
}
