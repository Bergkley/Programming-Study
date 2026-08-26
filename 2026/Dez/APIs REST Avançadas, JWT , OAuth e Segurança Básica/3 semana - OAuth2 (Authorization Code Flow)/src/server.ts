import dotEnv from "dotenv";
import app from "./app.js";
import { prisma } from "../src/database/prisma.js";

dotEnv.config();

const port = process.env.PORT ?? 3000;

const [, server] = await Promise.all([
  prisma.$connect(),
  app.listen(port, () => {
    console.log("servidor rodando com sucesso");
  }),
]);

async function shutdown() {
  await prisma.$disconnect();
  await server.close();
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
