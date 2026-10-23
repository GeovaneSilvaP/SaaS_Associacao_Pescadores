export type StatusAssociado = "ativo" | "inativo";

export interface Associado {
  id: number;
  nome: string;
  cpf: string;
  telefone: string | null;
  endereco: string | null;
  registro_pesca: string | null;
  data_filiacao: string;
  status: StatusAssociado;
  criado_em: string;
}

export interface DadosAssociado {
  nome: string;
  cpf: string;
  telefone: string | null;
  endereco: string | null;
  registro_pesca: string | null;
  data_filiacao: string;
}

export interface FiltroAssociados {
  nome?: string | undefined;
  status?: StatusAssociado | undefined;
  pagina: number;
  limite: number;
}
