export type StatusMensalidade = 'pendente' | 'pago' | 'atrasado'

export interface Mensalidade {
  id: number
  associado_id: number
  associado_nome: string
  competencia: string
  valor: number
  vencimento: string
  data_pagamento: string | null
  status: StatusMensalidade
}

export interface FiltroMensalidades {
  competencia?: string | undefined
  status?: StatusMensalidade | undefined
  associadoId?: number | undefined
  pagina: number
  limite: number
}

export interface DadosGeracao {
  competencia: string
  valor: number
  diaVencimento: number
}