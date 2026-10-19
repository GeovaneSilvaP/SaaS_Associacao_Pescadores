import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Perfil } from "../models/Usuario";
import { AppError } from "../utils/AppError";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    throw new AppError("Token não informado", 401);
  }

  const token = cabecalho.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (typeof payload === "string" || !payload.sub) {
      throw new Error("Payload inválido");
    }

    req.usuario = {
      id: Number(payload.sub),
      perfil: payload.perfil as Perfil,
    };
    next();
  } catch {
    throw new AppError("Token inválido ou expirado", 401);
  }
}

export function apenasAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.usuario?.perfil !== "admin") {
    throw new AppError("Acesso restrito ao administrador", 403);
  }
  next();
}
