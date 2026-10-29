import {
  DadosGeracao,
  FiltroMensalidades,
  Mensalidade,
} from "../models/Mensalidade";
import { AppError } from "../utils/AppError";
import { MensalidadeRepository } from "../repositories/MensalidadeRepository";
import { AssociadoRepository } from "../repositories/AssociadoRepository";
import { hojeNoBrasil, ultimoDiaDoMes } from "../utils/datas";

export class MensalidadeService {
  constructor(
    private mensalidadeRepository: MensalidadeRepository,
    private associadoRepository: AssociadoRepository,
  ) {}

  async listar(filtro: FiltroMensalidades) {
    const { mensalidades, total } = await this.mensalidadeRepository.listar(
      filtro,
      hojeNoBrasil(),
    );

    return {
      dados: mensalidades,
      paginacao: {
        pagina: filtro.pagina,
        limite: filtro.limite,
        total,
        totalPaginas: Math.ceil(total / filtro.limite),
      },
    };
  }

  async listarPorAssociado(
    associadoId: number,
    pagina: number,
    limite: number,
  ) {
    const associado = await this.associadoRepository.buscarPorId(associadoId);
    if (!associado) {
      throw new AppError("Associado não encontrado", 404);
    }

    return this.listar({ associadoId, pagina, limite });
  }

  async buscar(id: number): Promise<Mensalidade> {
    const mensalidade = await this.mensalidadeRepository.buscarPorId(
      id,
      hojeNoBrasil(),
    );
    if (!mensalidade) {
      throw new AppError("Mensalidade não encontrada", 404);
    }
    return mensalidade;
  }

  async gerar({ competencia, valor, diaVencimento }: DadosGeracao) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(competencia)) {
      throw new AppError("Competência inválida. Use o formato YYYY-MM.", 400);
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      throw new AppError(
        "O valor da mensalidade deve ser maior que zero.",
        400,
      );
    }

    if (
      !Number.isInteger(diaVencimento) ||
      diaVencimento < 1 ||
      diaVencimento > 31
    ) {
      throw new AppError("O dia de vencimento deve estar entre 1 e 31.", 400);
    }

    const [anoTexto, mesTexto] = competencia.split("-");
    const ano = Number(anoTexto);
    const mes = Number(mesTexto);

    const ultimoDia = ultimoDiaDoMes(ano, mes);

    const ultimoDiaCompetencia = `${competencia}-${String(ultimoDia).padStart(2, "0")}`;

    const dia = Math.min(diaVencimento, ultimoDia);

    const vencimento = `${competencia}-${String(dia).padStart(2, "0")}`;

    const vencimentoNumero = Number(vencimento.replaceAll("-", ""));

    const elegiveis =
      await this.mensalidadeRepository.contarElegiveis(ultimoDiaCompetencia);

    if (elegiveis === 0) {
      throw new AppError(
        "Nenhum associado ativo e filiado até essa competência para gerar mensalidades.",
        409,
      );
    }

    const criadas = await this.mensalidadeRepository.gerar(
      competencia,
      valor,
      vencimentoNumero,
      ultimoDiaCompetencia,
    );

    return {
      competencia,
      valor,
      vencimento,
      associados_elegiveis: elegiveis,
      criadas,
      ja_existentes: elegiveis - criadas,
    };
  }
}
