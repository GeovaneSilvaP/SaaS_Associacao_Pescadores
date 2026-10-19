import { Router, Request, Response } from "express";
import { pool } from "../config/database";
import authRoutes from "./authRoutes";

const routes = Router();

routes.get("/health", async (req: Request, res: Response) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", banco: "conectado" });
});

routes.use("/auth", authRoutes);

export default routes;
