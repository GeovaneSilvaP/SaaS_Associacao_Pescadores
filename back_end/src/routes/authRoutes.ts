import { Router } from "express";
import { authController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";

// Instancia o roteador modular do Express para o subdomínio de autenticação
const authRoutes = Router();

// Endpoint público para autenticação de credenciais e emissão de token JWT
authRoutes.post("/login", authController.login);

// Endpoint protegido (requer autenticação prévia via middleware) para recuperar os dados do u
authRoutes.get("/me", authMiddleware, authController.me);

// Exporta o roteador configurado para ser integrado ao dispatcher central de rotas da ap
export default authRoutes;
