import { Router } from "express";
import { authController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";

const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.get("/me", authMiddleware, authController.me);

export default authRoutes;
