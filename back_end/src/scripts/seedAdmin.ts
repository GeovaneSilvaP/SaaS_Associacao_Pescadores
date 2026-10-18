import bcrypt from "bcrypt";
import { pool } from "../config/database";
import {
  campoObrigatorio,
  validarEmail,
  validarSenhaNova,
} from "../utils/validators";
import { UsuarioRepository } from "../repositories/UsuarioRepository";

async function criarAdmin() {
  const nome = campoObrigatorio(process.env.ADMIN_NOME, "ADMIN_NOME");
  const email = validarEmail(process.env.ADMIN_EMAIL);
  const senha = validarSenhaNova(process.env.ADMIN_SENHA);

  const repository = new UsuarioRepository();

  if (await repository.buscarPorEmail(email)) {
    console.log("Já existe um usuário com esse e-mail. Nada foi feito.");
    return;
  }

  const senha_hash = await bcrypt.hash(senha, 10);
  await repository.criar({ nome, email, senha_hash, perfil: "admin" });

  console.log(`Administrador ${email} criado com sucesso.`);
}

criarAdmin()
  .catch((error) => {
    console.error("Erro ao criar administrador:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
