import { AppDataSource, initializeDatabase } from "./data-source";
import { runMutationExamples } from "./mutations";
import { runQueryBuilderExamples } from "./query-builder";
import { resetAndSeed } from "./seed";

async function main(): Promise<void> {
  try {
    await initializeDatabase();
    await resetAndSeed();
    await runQueryBuilderExamples();
    await runMutationExamples();
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main().catch((error: unknown) => {
  console.error("Erro ao executar o estudo:", error);
  process.exitCode = 1;
});
