import { pathToFileURL } from "node:url";
import { getDatabaseSummary } from "./CRUD";
import { prisma } from "./prisma";

export * from "./CRUD";

async function main() {
  const summary = await getDatabaseSummary();

  console.log("Banco SQLite conectado:", summary);
}

const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main()
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
