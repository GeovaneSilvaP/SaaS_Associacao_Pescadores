import { pool } from "../config/database";
import { Usuario, NovoUsuario } from "../models/Usuario";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Tipo auxiliar para mapear o modelo de domínio com os pacotes de dados retornados pelo driver
type UsuarioRow = Usuario & RowDataPacket;

/**
 * Repositório de Usuários (Data Mapper / Repository Pattern): isola a camada de persistência,
 * centralizando as queries SQL e a interação direta com o pool de conexões do MySQL.
 */
export class UsuarioRepository {
  /**
   * Busca um usuário pelo endereço de e-mail de forma otimizada (limitada a 1 registro).
   * Retorna a entidade mapeada ou null caso não seja encontrada.
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const [rows] = await pool.query<UsuarioRow[]>(
      "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
      [email],
    );

    return rows[0] ?? null;
  }

  /**
   * Busca um usuário pelo seu identificador único (ID).
   * Utilizado comumente em middlewares de autenticação e contextos de sessão.
   */
  async buscarPorId(id: number): Promise<Usuario | null> {
    const [rows] = await pool.query<UsuarioRow[]>(
      "SELECT * FROM usuarios WHERE id = ? LIMIT 1",
      [id],
    );

    return rows[0] ?? null;
  }

  /**
   * Persiste um novo registro de usuário na base de dados utilizando prepared statements
   * (proteção contra SQL Injection) e retorna o ID autoincrementado gerado.
   */
  async criar(data: NovoUsuario): Promise<number> {
    const [resultado] = await pool.query<ResultSetHeader>(
      "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)",
      [data.nome, data.email, data.senha_hash, data.perfil],
    );

    return resultado.insertId;
  }
}
