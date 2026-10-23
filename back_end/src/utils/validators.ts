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

export function validarCPF(valor: unknown): string {
  const cpf = campoObrigatorio(valor, "CPF").replace(/\D/g, "");

  // 11 dígitos e não pode ser sequência repetida (111.111.111-11 etc.)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    throw new AppError("CPF inválido", 400);
  }

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }

    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(cpf.slice(0, 9), 10);
  const digito2 = calcularDigito(cpf.slice(0, 10), 11);

  if (digito1 !== Number(cpf[9]) || digito2 !== Number(cpf[10])) {
    throw new AppError("CPF inválido", 400);
  }

  return cpf;
}

export function validarData(valor: unknown, nome: string) {
  const texto = campoObrigatorio(valor, nome);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw new AppError(`O campo ${nome} deve estar no formato AAAA-MM-DD`, 400);
  }

  // Rejeita datas que não existem (ex.: 2024-02-31)
  const data = new Date(`${texto}T00:00:00Z`);
  if (
    Number.isNaN(data.getTime()) ||
    data.toISOString().slice(0, 10) !== texto
  ) {
    throw new AppError(`O campo ${nome} contém uma data inválida`, 400);
  }

  return texto;
}

export function textoOpcional(valor: unknown, nome: string, max: number) {
  if (valor === undefined || valor === null || valor === "") return null;

  if (typeof valor !== "string") {
    throw new AppError(`O campo ${nome} deve ser um texto`, 400);
  }

  const texto = valor.trim();
  if (texto.length > max) {
    throw new AppError(
      `O campo ${nome} deve ter no máximo ${max} caracteres`,
      400,
    );
  }

  return texto === "" ? null : texto;
}

export function telefoneOpcional(valor: unknown) {
  const texto = textoOpcional(valor, "telefone", 30);
  if (texto === null) return null;

  const digitos = texto.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11) {
    throw new AppError("Telefone inválido: informe DDD + número", 400);
  }

  return digitos;
}

export function validarId(valor: unknown) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("ID inválido", 400);
  }

  return id;
}

export function validarStatus(valor: unknown): "ativo" | "inativo" {
  if (valor !== "ativo" && valor !== "inativo") {
    throw new AppError("Status deve ser 'ativo' ou 'inativo'", 400);
  }

  return valor;
}

export function validarPaginacao(
  pagina: unknown,
  limite: unknown,
): { pagina: number; limite: number } {
  const p = pagina === undefined ? 1 : Number(pagina);
  const l = limite === undefined ? 20 : Number(limite);

  if (!Number.isInteger(p) || p < 1) {
    throw new AppError("Página inválida", 400);
  }

  if (!Number.isInteger(l) || l < 1 || l > 100) {
    throw new AppError("O limite deve estar entre 1 e 100", 400);
  }

  return { pagina: p, limite: l };
}
