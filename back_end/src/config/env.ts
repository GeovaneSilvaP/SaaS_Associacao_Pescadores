import dotenv from "dotenv";

dotenv.config();

const obrigatoria = (nome: string): string => {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida`);
  }

  return valor;
};

export const env = {
  port: Number(process.env.PORT) || 3333,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: obrigatoria("JWT_SECRET"),
  db: {
    host: obrigatoria("DB_HOST"),
    user: obrigatoria("DB_USER"),
    password: obrigatoria("DB_PASSWORD"),
    database: obrigatoria("DB_NAME"),
  },
};
