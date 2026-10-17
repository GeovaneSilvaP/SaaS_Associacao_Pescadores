import express from "express";
import routes from "./routes/index";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.use(errorHandler);

export default app;
