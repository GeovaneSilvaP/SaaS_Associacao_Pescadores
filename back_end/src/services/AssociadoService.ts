import {
  Associado,
  DadosAssociado,
  FiltroAssociados,
  StatusAssociado,
} from "../models/Associado";
import { AssociadoRepository } from "../repositories/AssociadoRepository";
import { AppError } from "../utils/AppError";

function ehEntradaDuplicada(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    erro.code === "ER_DUP_ENTRY"
  );
}

export class AssociadoService {
  constructor(private associadoRepository: AssociadoRepository) {}

   async listar(filtro: FiltroAssociados) {
    const { associados, total } = await this.associadoRepository.listar(filtro)

    return {
      dados: associados,
      paginacao: {
        pagina: filtro.pagina,
        limite: filtro.limite,
        total,
        totalPaginas: Math.ceil(total / filtro.limite),
      },
    }
  }

  async buscar(id: number) {
    const associados = await this.associadoRepository.buscarPorId(id);

    if (!associados) {
      throw new AppError("Associado não encontrado", 404);
    }
    return associados;
  }

  async criar(dados: DadosAssociado): Promise<Associado> {
    if (await this.associadoRepository.buscarPorCpf(dados.cpf)) {
      throw new AppError("Já existe um associado com esse CPF", 409);
    }

    try {
      const id = await this.associadoRepository.criar(dados);
      return await this.buscar(id);
    } catch (error) {
      // Cobre a corrida entre a checagem acima e o INSERT (UNIQUE do banco)
      if (ehEntradaDuplicada(error)) {
        throw new AppError("Já existe um associado com esse CPF", 409);
      }
      throw error;
    }
  }

  async atualizar(id: number, dados: DadosAssociado): Promise<Associado> {
    await this.buscar(id);

    const existente = await this.associadoRepository.buscarPorCpf(dados.cpf);
    if (existente && existente.id !== id) {
      throw new AppError("Já existe outro associado com esse CPF", 409);
    }

    try {
      await this.associadoRepository.atualizar(id, dados);
    } catch (error) {
      if (ehEntradaDuplicada(error)) {
        throw new AppError("Já existe outro associado com esse CPF", 409);
      }
      throw error;
    }

    return this.buscar(id);
  }

  async alterarStatus(id: number, status: StatusAssociado): Promise<Associado> {
    const associado = await this.buscar(id);

    if (associado.status === status) {
      throw new AppError(`O associado já está ${status}`, 409);
    }

    await this.associadoRepository.alterarStatus(id, status);
    return this.buscar(id);
  }
}
