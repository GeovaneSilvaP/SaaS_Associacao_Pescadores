import mysql, { Pool } from "mysql2/promise";
import { env } from "./env";

/**
 * Cria um pool de conexões com o MySQL utilizando as variáveis de ambiente.
 * O pool gerencia automaticamente a abertura e o fechamento de conexões para otimizar performance.
 */
export const pool: Pool = mysql.createPool({
  host: env.db.host, // Endereço do servidor do banco de dados
  user: env.db.user, // Usuário de acesso ao banco
  password: env.db.password, // Senha do usuário
  database: env.db.database, // Nome do banco de dados a ser utilizado
  waitForConnections: true, // Aguarda na fila se todas as conexões estiverem em uso
  connectionLimit: 10, // Número máximo de conexões simultâneas permitidas no pool
  dateStrings: true, // Retorna campos de data como strings em vez de objetos Date do JavaScript
});

/**
 * Função assíncrona para testar se a conexão com o banco de dados está funcionando.
 * Pega uma conexão do pool e a libera imediatamente em seguida.
 */
export const testarConexao = async () => {
  const conexao = await pool.getConnection(); // Tenta obter uma conexão ativa do pool
  conexao.release(); // Devolve a conexão de volta para o pool para ser reutilizada
};
