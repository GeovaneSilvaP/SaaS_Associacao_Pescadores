import app from "./app";
import { env } from "./config/env";
import { testarConexao } from "./config/database";

async function iniciar(): Promise<void> {
  try {
    await testarConexao();
    console.log("Conectando ao MYSQL");

    app.listen(env.port, () => {
      console.log(`API rodando na porta ${env.port}`);
    });
  } catch (error) {
    console.log("Falha ao iniciar a aplicação", error);
    process.exit(1);
  }
}

iniciar();
