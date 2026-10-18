import dotenv from "dotenv";

dotenv.config();

/**
 * Função utilitária para garantir que uma variável de ambiente obrigatória exista.
 * Caso a variável não esteja definida, interrompe a execução lançando um erro.
 * @param nome Nome da variável de ambiente a ser validada.
 * @returns O valor da variável de ambiente caso ela exista.
 */
const obrigatoria = (nome: string): string => {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida`);
  }

  return valor;
};

/**
 * Objeto centralizado contendo todas as variáveis de ambiente da aplicação,
 * aplicando valores padrão quando necessário e validando as obrigatórias.
 */
export const env = {
  port: Number(process.env.PORT) || 3333, // Porta onde a API vai rodar (padrão: 3333)
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173", // URL permitida pelo CORS (padrão: Vite local)
  jwtSecret: obrigatoria("JWT_SECRET"), // Chave secreta obrigatória para assinar tokens JWT
  db: {
    host: obrigatoria("DB_HOST"), // Host/endereço obrigatório do banco de dados
    user: obrigatoria("DB_USER"), // Usuário obrigatório do banco de dados
    password: obrigatoria("DB_PASSWORD"), // Senha obrigatória do banco de dados
    database: obrigatoria("DB_NAME"), // Nome obrigatório do banco de dados
  },
};
