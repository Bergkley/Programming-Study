import fs from "fs/promises";
import { pipeline } from "stream";
import { promisify } from "util";
import { createFileReader } from "./src/streams/reader.mjs";
import { createUppercaseTransform } from "./src/streams/transformer.mjs";
import { createFileWriter } from "./src/streams/writer.mjs";

const pipelineAsync = promisify(pipeline);

async function validateInputFile(inputPath) {
  try {
    const stats = await fs.stat(inputPath);

    if (!stats.isFile()) {
      throw new Error(`Input path is not a file: ${inputPath}`);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    throw error;
  }
}

function createTempOutputPath(outputPath) {
  return `${outputPath}.tmp-${process.pid}-${Date.now()}`;
}

async function removeTempFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

export const processFile = async (options) => {
  const { inputPath, outputPath, encoding = "utf8" } = options;

  if (!inputPath) {
    throw new Error("inputPath is required");
  }

  if (!outputPath) {
    throw new Error("outputPath is required");
  }

  await validateInputFile(inputPath);

  const tempOutputPath = createTempOutputPath(outputPath);

  try {
    await pipelineAsync(
      createFileReader(inputPath, { encoding }),
      createUppercaseTransform({ encoding }),
      createFileWriter(tempOutputPath)
    );

    await fs.rename(tempOutputPath, outputPath);
  } catch (error) {
    await removeTempFile(tempOutputPath);
    throw error;
  }
};
