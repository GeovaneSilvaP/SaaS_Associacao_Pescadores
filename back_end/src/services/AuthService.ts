import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UsuarioPublico } from "../models/Usuario";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { AppError } from "../utils/AppError";

const OITO_HORAS_EM_SEGUNDOS = 60 * 60 * 8;

export class AuthService {
  constructor(private usuarioRepository: UsuarioRepository) {}

  async login(email: string, senha: string) {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);

    // Mesma mensagem para e-mail inexistente e senha errada,
    // para não revelar quais e-mails estão cadastrados
    const credenciaisInvalidas = new AppError("E-mail ou senha inválidos", 401);

    if (!usuario) throw credenciaisInvalidas;

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) throw credenciaisInvalidas;

    const token = jwt.sign({ perfil: usuario.perfil }, env.jwtSecret, {
      subject: String(usuario.id),
      expiresIn: OITO_HORAS_EM_SEGUNDOS,
    });

    const { senha_hash, ...usuarioPublico } = usuario;
    return { token, usuario: usuarioPublico };
  }

  async perfil(id: number): Promise<UsuarioPublico> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) throw new AppError("Usuário não encontrado", 404);

    const { senha_hash, ...usuarioPublico } = usuario;
    return usuarioPublico;
  }
}
