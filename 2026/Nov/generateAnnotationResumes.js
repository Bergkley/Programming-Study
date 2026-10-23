const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const resumeDir = path.join(rootDir, "resume");

const ignoredDirectories = new Set(["node_modules", "resume"]);

const categoryResumeFiles = new Map([
  [
    "bancos sql, modelagem e orms",
    "annotationResumeBancosSQLModelagemEORMs.md",
  ],
]);

const summaries = new Map();
const stats = {
  annotationFound: 0,
  added: new Map(),
};

function sortByName(entries) {
  return entries.sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toPascalCase(text) {
  return normalizeText(text)
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function isAnnotationFile(fileName) {
  return path.parse(fileName).name.toLowerCase() === "annotation";
}

function moduleTitle(directory) {
  const relativeDirectory = path.relative(rootDir, directory);
  return relativeDirectory.split(path.sep).join(" - ");
}

function getCategory(directory) {
  const relativeDirectory = path.relative(rootDir, directory);
  const [category] = relativeDirectory.split(path.sep).filter(Boolean);

  return category || "Novembro";
}

function getResumeFileName(category) {
  const normalizedCategory = normalizeText(category);

  return (
    categoryResumeFiles.get(normalizedCategory) ||
    `annotationResume${toPascalCase(category)}.md`
  );
}

function addSummary(filePath) {
  stats.annotationFound += 1;

  const content = fs.readFileSync(filePath, "utf8");

  if (content.trim().length === 0) {
    return;
  }

  const directory = path.dirname(filePath);
  const category = getCategory(directory);
  const resumeFileName = getResumeFileName(category);
  const resumeContent = `# ${moduleTitle(directory)}\n\n${content}\n\n---\n`;

  if (!summaries.has(resumeFileName)) {
    summaries.set(resumeFileName, []);
    stats.added.set(resumeFileName, 0);
  }

  summaries.get(resumeFileName).push(resumeContent);
  stats.added.set(resumeFileName, stats.added.get(resumeFileName) + 1);
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

    if (!entry.isFile() || !isAnnotationFile(entry.name)) {
      continue;
    }

    addSummary(fullPath);
  }
}

fs.mkdirSync(resumeDir, { recursive: true });
walk(rootDir);

for (const [resumeFileName, resumeSummaries] of summaries) {
  fs.writeFileSync(
    path.join(resumeDir, resumeFileName),
    resumeSummaries.join("\n"),
    "utf8",
  );
}

console.log(`Arquivos annotation encontrados: ${stats.annotationFound}`);

for (const [resumeFileName, total] of stats.added) {
  console.log(`Adicionados ao resumo ${resumeFileName}: ${total}`);
}
