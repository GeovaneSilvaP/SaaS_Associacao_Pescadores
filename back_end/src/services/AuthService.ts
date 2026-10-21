import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UsuarioPublico } from "../models/Usuario";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { AppError } from "../utils/AppError";

// Constante de negócio definindo a janela de expiração da sessão (Time-to-Live)
const OITO_HORAS_EM_SEGUNDOS = 60 * 60 * 8;

/**
 * Serviço de Autenticação (AuthService): gerencia regras de negócio críticas de identidade,
 * emissão de tokens JWT e segurança de credenciais (criptografia e prevenção de enumeração).
 */
export class AuthService {
  // Injeção de dependência via construtor para desacoplamento e testabilidade (Data Mapper / Repository Pattern)
  constructor(private usuarioRepository: UsuarioRepository) {}

  /**
   * Executa a autenticação de um usuário por e-mail e senha.
   * Implementa proteção contra user enumeration ao retornar uma mensagem genérica para credenciais inválidas.
   */
  async login(email: string, senha: string) {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);

    // Mesma mensagem para e-mail inexistente e senha errada,
    // para não revelar quais e-mails estão cadastrados
    const credenciaisInvalidas = new AppError("E-mail ou senha inválidos", 401);

    if (!usuario) throw credenciaisInvalidas;

    // Validação segura de hash criptográfico (bcrypt comparation)
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) throw credenciaisInvalidas;

    // Emissão do token JWT contendo claims essenciais (perfil) e subject padronizado (ID do usuário)
    const token = jwt.sign({ perfil: usuario.perfil }, env.jwtSecret, {
      subject: String(usuario.id),
      expiresIn: OITO_HORAS_EM_SEGUNDOS,
    });

    // Sanitização de dados sensíveis (Data Masking/Destructuring) para expor apenas o payload público
    const { senha_hash, ...usuarioPublico } = usuario;
    return { token, usuario: usuarioPublico };
  }

  /**
   * Recupera o perfil completo de um usuário autenticado a partir do seu ID.
   * Garante a exclusão segura de dados confidenciais (hash de senha) antes do retorno.
   */
  async perfil(id: number): Promise<UsuarioPublico> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) throw new AppError("Usuário não encontrado", 404);

    // Omiti o campo de hash de senha por segurança antes de retornar o modelo publicável
    const { senha_hash, ...usuarioPublico } = usuario;
    return usuarioPublico;
  }
}
