import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Perfil } from "../models/Usuario";
import { AppError } from "../utils/AppError";

/**
 * Middleware de Autenticação (JWT Bearer): intercepta requisições HTTP,
 * valida o header Authorization, decodifica e verifica a assinatura do token
 * e injeta o contexto do usuário autenticado no objeto Request.
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const cabecalho = req.headers.authorization;

  // Validação estrita do formato do header (padrão Bearer Token)
  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    throw new AppError("Token não informado", 401);
  }

  // Extrai a string do token removendo o prefixo "Bearer " (7 caracteres)
  const token = cabecalho.slice(7);

  try {
    // Verifica a integridade, assinatura e expiração do token JWT
    const payload = jwt.verify(token, env.jwtSecret);

    // Valida se o payload decodificado possui a estrutura esperada (claims padrão)
    if (typeof payload === "string" || !payload.sub) {
      throw new Error("Payload inválido");
    }

    // Injeta o contexto tipado do usuário no request para consumo nos controllers subsequentes
    req.usuario = {
      id: Number(payload.sub),
      perfil: payload.perfil as Perfil,
    };
    next();
  } catch {
    // Captura falhas de assinatura, expiração ou corrupção do token, retornando status 401 padronizado
    throw new AppError("Token inválido ou expirado", 401);
  }
}

/**
 * Middleware de Autorização Baseada em Papéis (RBAC - Role-Based Access Control):
 * Restringe o acesso a rotas sensíveis exclusivamente para usuários com o perfil de administrador.
 */
export function apenasAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Verifica se o usuário anexado no request possui privilégios administrativos
  if (req.usuario?.perfil !== "admin") {
    throw new AppError("Acesso restrito ao administrador", 403);
  }
  next();
}