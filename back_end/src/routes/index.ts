import { Router, Request, Response } from "express";
import { pool } from "../config/database";

const routes = Router();

routes.get("/health", async (req: Request, res: Response) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", banco: "conectado" });
});

export default routes;
