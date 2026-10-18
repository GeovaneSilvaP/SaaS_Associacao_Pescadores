import { pool } from "../config/database";
import { Usuario, NovoUsuario } from "../models/Usuario";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

type UsuarioRow = Usuario & RowDataPacket;

export class UsuarioRepository {
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const [rows] = await pool.query<UsuarioRow[]>(
      "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
      [email],
    );

    return rows[0] ?? null;
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const [rows] = await pool.query<UsuarioRow[]>(
      "SELECT * FROM usuarios WHERE id = ? LIMIT 1",
      [id],
    );

    return rows[0] ?? null;
  }

  async criar(data: NovoUsuario): Promise<number> {
    const [resultado] = await pool.query<ResultSetHeader>(
      "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)",
      [data.nome, data.email, data.senha_hash, data.perfil],
    );

    return resultado.insertId;
  }
}
