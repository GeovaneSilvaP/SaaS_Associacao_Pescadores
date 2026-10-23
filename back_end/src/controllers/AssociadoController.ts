import { Request, Response } from "express";
import {
  campoObrigatorio,
  telefoneOpcional,
  textoOpcional,
  validarCPF,
  validarData,
  validarId,
  validarPaginacao,
  validarStatus,
} from "../utils/validators";
import { AssociadoRepository } from "../repositories/AssociadoRepository";
import { AssociadoService } from "../services/AssociadoService";
import { DadosAssociado } from "../models/Associado";
import { AppError } from "../utils/AppError";

function lerDadosAssociado(body: any): DadosAssociado {
  const dados = body ?? {};

  const data_filiacao = validarData(dados.data_filiacao, "data_filiacao");
  if (data_filiacao > new Date().toISOString().slice(0, 10)) {
    throw new AppError("A data de filiação não pode ser futura", 400);
  }

  return {
    nome: campoObrigatorio(dados.nome, "nome"),
    cpf: validarCPF(dados.cpf),
    telefone: telefoneOpcional(dados.telefone),
    endereco: textoOpcional(dados.endereco, "endereco", 255),
    registro_pesca: textoOpcional(dados.registro_pesca, "registro_pesca", 50),
    data_filiacao,
  };
}

export class AssociadoController {
  constructor(private associadoService: AssociadoService) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    const { nome, status, pagina, limite } = req.query;

    const resultado = await this.associadoService.listar({
      nome: typeof nome === "string" && nome.trim() ? nome.trim() : undefined,
      status: status === undefined ? undefined : validarStatus(status),
      ...validarPaginacao(pagina, limite),
    });

    res.json(resultado);
  };

  buscar = async (req: Request, res: Response): Promise<void> => {
    const associado = await this.associadoService.buscar(
      validarId(req.params.id),
    );
    res.json(associado);
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    const associado = await this.associadoService.criar(
      lerDadosAssociado(req.body),
    );
    res.json(associado);
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    const associado = await this.associadoService.atualizar(
      validarId(req.params.id),
      lerDadosAssociado(req.body),
    );
    res.json(associado);
  };

  inativar = async (req: Request, res: Response): Promise<void> => {
    const associado = await this.associadoService.alterarStatus(
      validarId(req.params.id),
      "inativo",
    );
    res.json(associado);
  };

  reativar = async (req: Request, res: Response): Promise<void> => {
    const associado = await this.associadoService.alterarStatus(
      validarId(req.params.id),
      "ativo",
    );
    res.json(associado);
  };
}

export const associadoController = new AssociadoController(
  new AssociadoService(new AssociadoRepository()),
);
