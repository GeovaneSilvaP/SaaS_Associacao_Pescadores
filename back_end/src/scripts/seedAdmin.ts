import bcrypt from "bcrypt";
import { pool } from "../config/database";
import {
  campoObrigatorio,
  validarEmail,
  validarSenhaNova,
} from "../utils/validators";
import { UsuarioRepository } from "../repositories/UsuarioRepository";

/**
 * Script de inicialização (Seed/Migration utilitária): responsável por garantir
 * a criação idempotente de um usuário administrador raiz a partir de variáveis de ambiente.
 */
async function criarAdmin() {
  // Validação estrita e parsing dos parâmetros de ambiente necessários para o bootstrap do admin
  const nome = campoObrigatorio(process.env.ADMIN_NOME, "ADMIN_NOME");
  const email = validarEmail(process.env.ADMIN_EMAIL);
  const senha = validarSenhaNova(process.env.ADMIN_SENHA);

  const repository = new UsuarioRepository();

  // Verificação de idempotência: evita duplicidade caso o script seja executado múltiplas vezes
  if (await repository.buscarPorEmail(email)) {
    console.log("Já existe um usuário com esse e-mail. Nada foi feito.");
    return;
  }

  // Geração de hash seguro para a senha utilizando salt rounds recomendados (cost factor 10)
  const senha_hash = await bcrypt.hash(senha, 10);
  // Persistência do novo usuário com perfil privilegiado (admin)
  await repository.criar({ nome, email, senha_hash, perfil: "admin" });

  console.log(`Administrador ${email} criado com sucesso.`);
}

// Execução controlada do script com tratamento de exceções, código de saída apropriado e encerramento seguro do pool de conexões
criarAdmin();
criarAdmin()
  .catch((error) => {
    console.error("Erro ao criar administrador:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
