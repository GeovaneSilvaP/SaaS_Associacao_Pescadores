import { Router, Request, Response } from "express";
import { pool } from "../config/database";
import authRoutes from "./authRoutes";
import associadoRoutes from "../routes/associadoRoutes";

// Instancia o roteador central da API responsável por agrupar e orquestrar todos os subdomínios de rotas
const routes = Router();

/**
 * Endpoint de Health Check / Liveness probe: verifica a integridade operacional
 * da API e a capacidade de comunicação ativa com a camada de persistência.
 */
routes.get("/health", async (req: Request, res: Response) => {
  // Executa uma query leve de verificação (ping) no banco de dados
  await pool.query("SELECT 1");
  res.json({ status: "ok", banco: "conectado" });
});

// Registra e agrupa o ecossistema de rotas de autenticação sob o prefixo "/auth"
routes.use("/auth", authRoutes);
routes.use("/associados", associadoRoutes);

// Exporta o roteador principal consolidado para ser consumido na inicialização do Express
export default routes;
