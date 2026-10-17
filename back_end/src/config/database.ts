import mysql, { Pool } from "mysql2/promise";
import { env } from "./env";

export const pool: Pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

export const testarConexao = async () => {
  const conexao = await pool.getConnection();
  conexao.release();
};
