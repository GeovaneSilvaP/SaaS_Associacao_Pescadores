import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { AppError } from "../utils/AppError";
import { senhaInformada, validarEmail } from "../utils/validators";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, senha } = req.body ?? {};

    const resultado = await this.authService.login(
      validarEmail(email),
      senhaInformada(senha),
    );

    res.json(resultado);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.usuario) throw new AppError("Não autenticado", 401);

    const usuario = await this.authService.perfil(req.usuario.id);
    res.json(usuario);
  };
}

export const authController = new AuthController(
  new AuthService(new UsuarioRepository()),
);
