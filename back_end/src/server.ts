import app from "./app";
import { env } from "./config/env";
import { testarConexao } from "./config/database";

/**
 * Função assíncrona responsável por iniciar a aplicação de forma segura.
 * Ela testa a conexão com o banco antes de subir o servidor HTTP.
 */
async function iniciar(): Promise<void> {
  try {
    // Tenta estabelecer a comunicação com o banco de dados
    await testarConexao();
    console.log("Conectando ao MYSQL");

    // Inicia o servidor na porta especificada nas variáveis de ambiente
    app.listen(env.port, () => {
      console.log(`API rodando na porta ${env.port}`);
    });
  } catch (error) {
    // Caso ocorra qualquer erro (ex: falha no banco de dados), loga o erro e encerra o processo
    console.log("Falha ao iniciar a aplicação", error);
    process.exit(1); // Encerra a aplicação com código de erro (1)
  }
}

// Executa a função de inicialização assim que o arquivo é lido
iniciar();
