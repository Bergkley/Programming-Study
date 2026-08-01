import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { processFile } from "../index.mjs";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
let testDir;

describe("processFile", () => {
  beforeAll(async () => {
    testDir = await fs.mkdtemp(path.join(projectRoot, "../.tmp-test-"));
  });

  afterAll(async () => {
    await fs.rm(testDir, {
      recursive: true,
      force: true,
    });
  });

  test("transforms the file content to uppercase", async () => {
    const inputPath = path.join(testDir, "input.csv");
    const outputPath = path.join(testDir, "output.csv");

    await fs.writeFile(inputPath, "nome,email\nana,ana@email.com", "utf8");

    await processFile({
      inputPath,
      outputPath,
    });

    await expect(fs.readFile(outputPath, "utf8")).resolves.toBe(
      "NOME,EMAIL\nANA,ANA@EMAIL.COM",
    );
  });

  test("does not create an output file when the input does not exist", async () => {
    const inputPath = path.join(testDir, "missing.csv");
    const outputPath = path.join(testDir, "missing-output.csv");

    await expect(
      processFile({
        inputPath,
        outputPath,
      }),
    ).rejects.toThrow("Input file not found");

    await expect(fs.access(outputPath)).rejects.toThrow();
  });
});

