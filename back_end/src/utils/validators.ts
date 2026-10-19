import { AppError } from "./AppError";

export function campoObrigatorio(valor: unknown, nome: string): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new AppError(`O campo ${nome} é obrigatorio`, 400);
  }

  return valor.trim();
}

export function validarEmail(valor: unknown): string {
  const email = campoObrigatorio(valor, "e-mail").toLocaleLowerCase();
  const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!formatoValido) {
    throw new AppError("E-mail inválido", 400);
  }

  return email;
}

export function senhaInformada(valor: unknown): string {
  if (typeof valor !== "string" || valor.length === 0) {
    throw new AppError("O campo senha é obrigatório", 400);
  }

  return valor;
}

export function validarSenhaNova(valor: unknown): string {
  const senha = senhaInformada(valor);
  if (senha.length < 8) {
    throw new AppError("A senha deve ter no mínimo 8 caracteres", 400);
  }

  return senha;
}
