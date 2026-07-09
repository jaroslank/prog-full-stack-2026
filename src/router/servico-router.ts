import { Request, Response, Router } from "express";
import multer from "multer";
import { ServicoController } from "../controller/servico-controller";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "./my-uploads");
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.substring(file.originalname.length - 3));
  }
});

const upload = multer({ storage });

// /api/servicos
export const servicoRotas = (controller: ServicoController): Router => {
  const router = Router();

  router.post("/", controller.inserir);
  router.get("/", controller.listar);
  router.get("/:id", controller.buscarPorId);
  router.put("/:id", controller.atualizar);
  router.delete("/:id", controller.deletar);

  router.post("/imagens/upload", upload.single("imagem"), async (req: Request, res: Response): Promise<any> => {
    console.log(req.file);
    res.send("Imagem carregada com sucesso!");
  });

  return router;
};
