import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { AppError } from "../utils/AppError";
import { senhaInformada, validarEmail } from "../utils/validators";

/**
 * Controller de Autenticação (Layer de Apresentação/HTTP): responsável por processar requisições,
 * acionar a camada de serviços de domínio e formatar as respostas HTTP adequadas.
 */
export class AuthController {
  // Injeção de dependência via construtor para facilitar testes unitários e mock de serviços
  constructor(private authService: AuthService) {}

  /**
   * Endpoint HTTP de login: realiza o parsing defensivo do body, valida os dados de entrada
   * (e-mail e senha) através de funções utilitárias e delega a autenticação ao AuthService.
   */
  login = async (req: Request, res: Response): Promise<void> => {
    // Parsing defensivo do payload para evitar erros caso o body venha indefinido ou nulo
    const { email, senha } = req.body ?? {};

    const resultado = await this.authService.login(
      validarEmail(email),
      senhaInformada(senha),
    );

    res.json(resultado);
  };

  /**
   * Endpoint HTTP para recuperação do perfil do usuário autenticado ("me").
   * Valida a presença do contexto de sessão no request injetado pelo middleware de autenticação.
   */
  me = async (req: Request, res: Response): Promise<void> => {
    // Garante fail-fast caso o middleware de auth não tenha sido executado ou a sessão seja inválida
    if (!req.usuario) throw new AppError("Não autenticado", 401);

    const usuario = await this.authService.perfil(req.usuario.id);
    res.json(usuario);
  };
}

// Instancia e exporta o controller pré-configurado com as dependências reais encadeadas (Composition Root simplificado)
export const authController = new AuthController(
  new AuthService(new UsuarioRepository()),
);