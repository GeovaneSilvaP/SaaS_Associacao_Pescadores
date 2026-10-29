import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database";
import { FiltroMensalidades, Mensalidade } from "../models/Mensalidade";

type MensalidadeRow = Mensalidade & RowDataPacket;

// O status "atrasado" é calculado aqui. O "?" é a data de hoje.
const COLUNAS = `
m.id, m.associado_id, a.nome AS associado_nome, m.competencia, m.valor,
  m.vencimento, m.data_pagamento,
  CASE
    WHEN m.status = 'pago' THEN 'pago'
    WHEN m.vencimento < ? THEN 'atrasado'
    ELSE 'pendente'
  END AS status`;

export class MensalidadeRepository {
  private montarFiltro(filtro: FiltroMensalidades, hoje: string) {
    const condicoes: string[] = [];
    const valores: (string | number)[] = [];

    if (filtro.competencia) {
      condicoes.push("m.competencia = ?");
      valores.push(filtro.competencia);
    }
    if (filtro.associadoId) {
      condicoes.push("m.associado_id = ?");
      valores.push(filtro.associadoId);
    }
    if (filtro.status === "pago") {
      condicoes.push("m.status = 'pago'");
    } else if (filtro.status === "pendente") {
      condicoes.push("m.status = 'pendente' AND m.vencimento >= ?");
      valores.push(hoje);
    } else if (filtro.status === "atrasado") {
      condicoes.push("m.status = 'pendente' AND m.vencimento < ?");
      valores.push(hoje);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
    return { where, valores };
  }

  async listar(
    filtro: FiltroMensalidades,
    hoje: string,
  ): Promise<{ mensalidades: Mensalidade[]; total: number }> {
    const { where, valores } = this.montarFiltro(filtro, hoje);
    const offset = (filtro.pagina - 1) * filtro.limite;

    const [linhas] = await pool.query<MensalidadeRow[]>(
      `SELECT ${COLUNAS}
         FROM mensalidades m
         JOIN associados a ON a.id = m.associado_id
         ${where}
        ORDER BY m.vencimento DESC, a.nome ASC
        LIMIT ? OFFSET ?`,
      [hoje, ...valores, filtro.limite, offset],
    );

    const [contagem] = await pool.query<(RowDataPacket & { total: number })[]>(
      `SELECT COUNT(*) AS total FROM mensalidades m ${where}`,
      valores,
    );

    return { mensalidades: linhas, total: contagem[0]?.total ?? 0 };
  }

  async buscarPorId(id: number, hoje: string): Promise<Mensalidade | null> {
    const [rows] = await pool.query<MensalidadeRow[]>(
      `SELECT ${COLUNAS}
         FROM mensalidades m
         JOIN associados a ON a.id = m.associado_id
        WHERE m.id = ?
        LIMIT 1`,
      [hoje, id],
    );

    return rows[0] ?? null;
  }

  // Associados ativos que já eram filiados até o fim da competência
  async contarElegiveis(ultimoDiaCompetencia: string): Promise<number> {
    const [rows] = await pool.query<(RowDataPacket & { total: number })[]>(
      `SELECT COUNT(*) AS total FROM associados
        WHERE status = 'ativo' AND data_filiacao <= ?`,
      [ultimoDiaCompetencia],
    );
    return rows[0]?.total ?? 0;
  }

  // INSERT IGNORE: quem já tem a mensalidade da competência é pulado (UNIQUE)
  async gerar(
    competencia: string,
    valor: number,
    vencimento: number,
    ultimoDiaCompetencia: string,
  ): Promise<number> {
    const [resultado] = await pool.query<ResultSetHeader>(
      `INSERT IGNORE INTO mensalidades (associado_id, competencia, valor, vencimento)
       SELECT id, ?, ?, ? FROM associados
        WHERE status = 'ativo' AND data_filiacao <= ?`,
      [competencia, valor, vencimento, ultimoDiaCompetencia],
    );

    return resultado.affectedRows;
  }

  async registrarPagamento(
    id: number,
    dataPagamento: string,
  ): Promise<boolean> {
    const [resultado] = await pool.query<ResultSetHeader>(
      `UPDATE mensalidades
          SET status = 'pago', data_pagamento = ?
        WHERE id = ? AND status <> 'pago'`,
      [dataPagamento, id],
    );

    return resultado.affectedRows > 0;
  }
}
