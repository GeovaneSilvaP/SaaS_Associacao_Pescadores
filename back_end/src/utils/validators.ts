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

/**
 * Valida a estrutura matemática e o algoritmo oficial de dígitos verificadores do CPF brasileiro.
 * Sanitiza a entrada removendo caracteres não numéricos e rejeita sequências repetidas inválidas.
 */
export function validarCPF(valor: unknown): string {
  const cpf = campoObrigatorio(valor, "CPF").replace(/\D/g, "");

  // Regra de negócio: verifica tamanho exato de 11 dígitos e bloqueia falsos CPFs de dígitos repetidos (ex: 111.111.111-11)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    throw new AppError("CPF inválido", 400);
  }

  // Função auxiliar para o cálculo do Módulo 11 (algoritmo padrão da Receita Federal)
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

  // Valida os dígitos verificadores calculados contra os dígitos informados no CPF
  if (digito1 !== Number(cpf[9]) || digito2 !== Number(cpf[10])) {
    throw new AppError("CPF inválido", 400);
  }

  return cpf;
}

/**
 * Valida e normaliza datas no formato padrão ISO (YYYY-MM-DD),
 * realizando validação estrita de calendário para evitar datas inconsistentes (ex: 31 de fevereiro).
 */
export function validarData(valor: unknown, nome: string) {
  const texto = campoObrigatorio(valor, nome);

  // Assegura conformidade estrita com o padrão estipulado (YYYY-MM-DD) antes da conversão
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw new AppError(`O campo ${nome} deve estar no formato AAAA-MM-DD`, 400);
  }

  // Validação semântica: garante que o ecossistema Date reconheça a data como real e consistente (evita overflow de dias/meses)
  const data = new Date(`${texto}T00:00:00Z`);
  if (
    Number.isNaN(data.getTime()) ||
    data.toISOString().slice(0, 10) !== texto
  ) {
    throw new AppError(`O campo ${nome} contém uma data inválida`, 400);
  }

  return texto;
}

/**
 * Processa campos de texto opcionais aplicando trim, validação de tipo string
 * e restrição de tamanho máximo (limite de caracteres). Retorna null se ausente/vazio.
 */
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

/**
 * Sanitiza e valida números de telefone opcionais (fixo ou celular),
 * garantindo a obrigatoriedade da estrutura básica contendo DDD + número (10 a 11 dígitos numéricos).
 */
export function telefoneOpcional(valor: unknown) {
  const texto = textoOpcional(valor, "telefone", 30);
  if (texto === null) return null;

  const digitos = texto.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11) {
    throw new AppError("Telefone inválido: informe DDD + número", 400);
  }

  return digitos;
}

/**
 * Realiza o parsing e validação de identificadores numéricos passados por parâmetros de rota/query,
 * assegurando que sejam inteiros positivos estritos maiores que zero.
 */
export function validarId(valor: unknown) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("ID inválido", 400);
  }

  return id;
}

/**
 * Valida valores categóricos de status de usuário, permitindo estritamente
 * os estados de domínio definidos ("ativo" ou "inativo").
 */
export function validarStatus(valor: unknown): "ativo" | "inativo" {
  if (valor !== "ativo" && valor !== "inativo") {
    throw new AppError("Status deve ser 'ativo' ou 'inativo'", 400);
  }

  return valor;
}

/**
 * Valida e sanitiza parâmetros de paginação (offset-based pagination),
 * aplicando valores padrão seguros e limites máximos de itens por página para proteção de performance.
 */
export function validarPaginacao(
  pagina: unknown,
  limite: unknown,
): { pagina: number; limite: number } {
  const p = pagina === undefined ? 1 : Number(pagina);
  const l = limite === undefined ? 20 : Number(limite);

  if (!Number.isInteger(p) || p < 1) {
    throw new AppError("Página inválida", 400);
  }

  // Previne ataques de negação de serviço (DoS) por exaustão de memória com limites muito altos (hard cap em 100)
  if (!Number.isInteger(l) || l < 1 || l > 100) {
    throw new AppError("O limite deve estar entre 1 e 100", 400);
  }

  return { pagina: p, limite: l };
}

//
export function validarCompetencia(valor: unknown) {
  const texto = campoObrigatorio(valor, "competencia");

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(texto)) {
    throw new AppError("A competência deve estar no formato AAAA-MM", 400);
  }

  return texto;
}

//
export function validarValor(valor: unknown): number {
  let numero = Number.NaN;

  if (typeof valor === "number") {
    numero = valor;
  } else if (typeof valor === "string" && valor.trim() !== "") {
    numero = Number(valor.trim().replace(",", "."));
  }

  if (!Number.isFinite(numero) || numero <= 0 || numero > 99999999.99) {
    throw new AppError("Valor inválido: informe um número maior que zero", 400);
  }

  if (Math.abs(numero * 100 - Math.round(numero * 100)) > 1e-9) {
    throw new AppError("O valor deve ter no máximo 2 casas decimais", 400);
  }

  return Math.round(numero * 100) / 100;
}

//
export function validarDiaVencimento(valor: unknown) {
  const dia = Number(valor);

  if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
    throw new AppError(
      "O dia de vencimento deve ser um número entre 1 e 31",
      400,
    );
  }

  return dia;
}

export function validarStatusMensalidade(
  valor: unknown,
): "pendente" | "pago" | "atrasado" {
  if (valor !== "pendente" && valor !== "pago" && valor !== "atrasado") {
    throw new AppError("Status deve ser 'pendente', 'pago' ou 'atrasado'", 400);
  }

  return valor;
}
