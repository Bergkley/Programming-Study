import { app } from "./app.js";
import { prisma } from "./database/prisma.js";

const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, () => {
  console.log(`Catalog API running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
