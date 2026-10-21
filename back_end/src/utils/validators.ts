import { AppError } from "./AppError";

/**
 * Valida se um valor arbitrário é uma string não vazia, aplicando sanitização básica (trim).
 * Dispara um AppError (400) caso a validação falhe.
 */
export function campoObrigatorio(valor: unknown, nome: string): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new AppError(`O campo ${nome} é obrigatorio`, 400);
  }

  return valor.trim();
}

/**
 * Realiza o parsing e validação de formato para endereços de e-mail.
 * Reaproveita a validação de campo obrigatório e normaliza a string para lowercase.
 */
export function validarEmail(valor: unknown): string {
  const email = campoObrigatorio(valor, "e-mail").toLocaleLowerCase();
  const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!formatoValido) {
    throw new AppError("E-mail inválido", 400);
  }

  return email;
}

/**
 * Validação restrita para campos de senha, assegurando que o payload recebido seja 
 * uma string preenchida (preservando espaços e caracteres especiais intencionais).
 */
export function senhaInformada(valor: unknown): string {
  if (typeof valor !== "string" || valor.length === 0) {
    throw new AppError("O campo senha é obrigatório", 400);
  }

  return valor;
}

/**
 * Valida políticas de segurança para novas senhas (ex: enforce de tamanho mínimo).
 * Compõe com a função de verificação de senha informada.
 */
export function validarSenhaNova(valor: unknown): string {
  const senha = senhaInformada(valor);
  if (senha.length < 8) {
    throw new AppError("A senha deve ter no mínimo 8 caracteres", 400);
  }

  return senha;
}
