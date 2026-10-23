import { associadoController } from "../controllers/AssociadoController";
import { apenasAdmin, authMiddleware } from "../middlewares/authMiddleware";
import { Router } from "express";

const associadoRoutes = Router();

// Todas as rotas deste módulo exigem login e perfil admin
associadoRoutes.use(authMiddleware, apenasAdmin);

associadoRoutes.get("/", associadoController.listar);
associadoRoutes.post("/", associadoController.criar);
associadoRoutes.get("/:id", associadoController.buscar);
associadoRoutes.put("/:id", associadoController.atualizar);
associadoRoutes.patch("/:id/inativar", associadoController.inativar);
associadoRoutes.patch("/:id/reativar", associadoController.reativar);

export default associadoRoutes;