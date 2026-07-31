import path from "path";
import { fileURLToPath } from "url";
import { processFile } from "./index.mjs";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const defaultInput = path.resolve(projectRoot, "data/customers-500000.csv");
const defaultOutput = path.resolve(
  projectRoot,
  "data/customers-500000-transformed.csv",
);

function resolveCliPath(filePath, fallback) {
  if (!filePath) {
    return fallback;
  }

  return path.resolve(process.cwd(), filePath);
}

async function main() {
  const [, , inputArg, outputArg] = process.argv;
  const inputPath = resolveCliPath(inputArg, defaultInput);
  const outputPath = resolveCliPath(outputArg, defaultOutput);

  await processFile({
    inputPath,
    outputPath,
  });

  console.log(`Arquivo gravado com sucesso: ${outputPath}`);
}

main().catch((error) => {
  console.error("Erro ao processar arquivo:", error.message);
  process.exitCode = 1;
});
