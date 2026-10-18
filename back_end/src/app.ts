import express from "express";
import routes from "./routes/index";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";

// Inicializa a aplicação Express
const app = express();

// Configura o CORS para permitir apenas requisições vindas da URL do front-end definida no ambiente
app.use(cors({ origin: env.frontendUrl }));

// Habilita o Express para interpretar o corpo das requisições no formato JSON
app.use(express.json());

// Registra as rotas principais da API sob o prefixo "/api"
app.use("/api", routes);

// Middleware para capturar requisições feitas a rotas que não existem (retorna status 404)
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// Registra o middleware global de tratamento de erros (deve ser sempre o último middleware)
app.use(errorHandler);

// Exporta a instância do aplicativo configurada para ser usada no arquivo de inicialização
export default app;