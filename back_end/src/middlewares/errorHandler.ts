import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

/**
 * Middleware global de tratamento de erros do Express.
 * Intercepta qualquer erro lançado na aplicação, formatando a resposta adequada para o cliente.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Verifica se o erro gerado é um erro operacional conhecido e customizado (AppError)
  if (err instanceof AppError) {
    // Retorna o status HTTP definido no erro (ex: 400, 401, 404) e a mensagem correspondente
    res.status(err.statusCode).json({ erro: err.message });
    return;
  }

  // Se for um erro desconhecido/inesperado (ex: falhas de sintaxe, bugs, perda de conexão), registra no console para debug
  console.error(err);

  // Retorna um erro genérico 500 (Internal Server Error) para não expor detalhes técnicos sensíveis ao usuário
  res.status(500).json({ erro: "Erro interno do servidor" });
};
