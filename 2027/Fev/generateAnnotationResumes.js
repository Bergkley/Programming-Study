const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const categoryDirName = "React Avançado (Hooks, Context, Performance)";
const categoryDir = path.join(rootDir, categoryDirName);
const resumeDir = path.join(categoryDir, "resume");
const resumePath = path.join(
  resumeDir,
  "annotationResumeReactAvancadoHooksContextPerformance.md",
);

const ignoredDirectories = new Set(["node_modules"]);
const summaries = [];
const stats = {
  annotationFound: 0,
  added: 0,
};

function sortByName(entries) {
  return entries.sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function isAnnotationFile(fileName) {
  const parsedFile = path.parse(fileName);

  return (
    parsedFile.ext.toLowerCase() === ".md" &&
    parsedFile.name.toLowerCase().startsWith("annotation")
  );
}

function getModuleDirectory(filePath) {
  const directory = path.dirname(filePath);

  return path.basename(directory).toLowerCase() === "resume"
    ? path.dirname(directory)
    : directory;
}

function moduleTitle(filePath) {
  const relativeDirectory = path.relative(
    rootDir,
    getModuleDirectory(filePath),
  );

  return relativeDirectory.split(path.sep).join(" - ");
}

function addSummary(filePath) {
  stats.annotationFound += 1;

  const content = fs.readFileSync(filePath, "utf8");

  if (content.trim().length === 0) {
    return;
  }

  summaries.push(`# ${moduleTitle(filePath)}\n\n${content}\n\n---\n`);
  stats.added += 1;
}

function walk(directory) {
  const entries = sortByName(fs.readdirSync(directory, { withFileTypes: true }));

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      walk(fullPath);
      continue;
    }

    if (
      !entry.isFile() ||
      path.resolve(fullPath) === path.resolve(resumePath) ||
      !isAnnotationFile(entry.name)
    ) {
      continue;
    }

    addSummary(fullPath);
  }
}

fs.mkdirSync(resumeDir, { recursive: true });
walk(categoryDir);
fs.writeFileSync(resumePath, summaries.join("\n"), "utf8");

console.log(`Arquivos annotation encontrados: ${stats.annotationFound}`);
console.log(`Adicionados ao resumo de React Avançado: ${stats.added}`);
