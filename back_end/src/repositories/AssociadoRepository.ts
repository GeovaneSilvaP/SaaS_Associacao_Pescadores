import { pool } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import {
  Associado,
  DadosAssociado,
  FiltroAssociados,
  StatusAssociado,
} from "../models/Associado";

type AssociadoRow = Associado & RowDataPacket;

export class AssociadoRepository {
  async listar(
    filtro: FiltroAssociados,
  ): Promise<{ associados: Associado[]; total: number }> {
    const condicoes: string[] = [];
    const valores: (string | number)[] = [];

    if (filtro.nome) {
      condicoes.push("nome LIKE ?");
      valores.push(`%${filtro.nome}%`);
    }

    if (filtro.status) {
      condicoes.push("status = ?");
      valores.push(filtro.status);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
    const offset = (filtro.pagina - 1) * filtro.limite;

    const [linhas] = await pool.query<AssociadoRow[]>(
      `SELECT * FROM associados ${where} ORDER BY nome ASC LIMIT ? OFFSET ?`,
      [...valores, filtro.limite, offset],
    );

    const contagem = await pool.query<RowDataPacket[] & { total: number }>(
      `SELECT COUNT(*) AS total FROM associados ${where}`,
      valores,
    );

    return { associados: linhas, total: contagem[0].total };
  }

  async buscarPorId(id: number): Promise<Associado | null> {
    const [rows] = await pool.query<AssociadoRow[]>(
      "SELECT * FROM associados WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] ?? null;
  }

  async buscarPorCpf(cpf: string): Promise<Associado | null> {
    const [rows] = await pool.query<AssociadoRow[]>(
      "SELECT * FROM associados WHERE cpf = ? LIMIT 1",
      [cpf],
    );
    return rows[0] ?? null;
  }

  async criar(dados: DadosAssociado): Promise<number> {
    const [resultado] = await pool.query<ResultSetHeader>(
      `INSERT INTO associados
         (nome, cpf, telefone, endereco, registro_pesca, data_filiacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.cpf,
        dados.telefone,
        dados.endereco,
        dados.registro_pesca,
        dados.data_filiacao,
      ],
    );

    return resultado.insertId;
  }

  async atualizar(id: number, dados: DadosAssociado) {
    await pool.query<ResultSetHeader>(
      `UPDATE associados
          SET nome = ?, cpf = ?, telefone = ?, endereco = ?,
              registro_pesca = ?, data_filiacao = ?
        WHERE id = ?`,
      [
        dados.nome,
        dados.cpf,
        dados.telefone,
        dados.endereco,
        dados.registro_pesca,
        dados.data_filiacao,
        id,
      ],
    );
  }

  async alterarStatus(id: number, status: StatusAssociado) {
    await pool.query<ResultSetHeader>(
      "UPDATE associados SET status = ? WHERE id = ?",
      [status, id],
    );
  }
}
