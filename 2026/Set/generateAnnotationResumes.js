const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const resumeDir = path.join(rootDir, "resume");
const typeScriptResumePath = path.join(resumeDir, "annotationResumeTypeScipt.md");
const nodeJsInternalsResumePath = path.join(
  resumeDir,
  "annotationResumeNodeJsInternals.md",
);

const summaries = {
  typescript: [],
  nodeJsInternals: [],
};

const stats = {
  annotationFound: 0,
  typescript: 0,
  nodeJsInternals: 0,
};

const ignoredDirectories = new Set(["node_modules", "resume"]);
const nodeJsInternalsDirectories = new Set([
  "childprocess + cluster",
  "cluster",
  "garbage collector",
  "memory leak",
  "node.js internals",
  "streams",
]);

function sortByName(entries) {
  return entries.sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function isAnnotationFile(fileName) {
  return path.parse(fileName).name.toLowerCase() === "annotation";
}

function moduleTitle(directory) {
  const relativeDirectory = path.relative(rootDir, directory);
  return relativeDirectory.split(path.sep).join(" - ");
}

function normalizeSegment(segment) {
  return segment.toLowerCase();
}

function isNodeJsInternalsRelated(relativeDirectory) {
  return relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .map(normalizeSegment)
    .some((segment) => nodeJsInternalsDirectories.has(segment));
}

function addSummary(filePath, target, title) {
  const content = fs.readFileSync(filePath, "utf8");

  if (content.trim().length === 0) {
    return;
  }

  summaries[target].push(`# ${title}\n\n${content}\n\n---\n`);
  stats[target] += 1;
}

function addAnnotationSummary(filePath) {
  stats.annotationFound += 1;

  const directory = path.dirname(filePath);
  const relativeDirectory = path.relative(rootDir, directory);
  const target = isNodeJsInternalsRelated(relativeDirectory)
    ? "nodeJsInternals"
    : "typescript";

  addSummary(filePath, target, moduleTitle(directory));
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

    addAnnotationSummary(fullPath);
  }
}

fs.mkdirSync(resumeDir, { recursive: true });
walk(rootDir);

fs.writeFileSync(typeScriptResumePath, summaries.typescript.join("\n"), "utf8");
fs.writeFileSync(
  nodeJsInternalsResumePath,
  summaries.nodeJsInternals.join("\n"),
  "utf8",
);

console.log(`Arquivos annotation encontrados: ${stats.annotationFound}`);
console.log(`Adicionados ao resumo de TypeScript: ${stats.typescript}`);
console.log(
  `Adicionados ao resumo de Node.js Internals: ${stats.nodeJsInternals}`,
);
