import "dotenv/config";
import App from "./app.js";
import { prisma } from "./database/prisma.js";
const PORT = process.env.PORT || 3000;

const app = new App();

const [, server] = await Promise.all([
  prisma.$connect(),
  app.instance.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
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
