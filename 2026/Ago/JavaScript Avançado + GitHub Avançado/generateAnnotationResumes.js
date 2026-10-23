const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const resumeDir = path.join(rootDir, "resume");
const javascriptResumePath = path.join(resumeDir, "annotationResumeJavaScript.md");
const gitResumePath = path.join(resumeDir, "annotationGit.md");

const summaries = {
  javascript: [],
  git: [],
};

const stats = {
  annotationFound: 0,
  gitMarkdownFound: 0,
  javascript: 0,
  git: 0,
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
  return path.parse(fileName).name.toLowerCase() === "annotation";
}

function isMarkdownFile(fileName) {
  return path.extname(fileName).toLowerCase() === ".md";
}

function isGitRelated(relativeDirectory) {
  return relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .some((segment) => /git|github/i.test(segment));
}

function moduleTitle(directory) {
  const relativeDirectory = path.relative(rootDir, directory);
  return relativeDirectory.split(path.sep).join(" - ");
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
  const target = isGitRelated(relativeDirectory) ? "git" : "javascript";

  addSummary(filePath, target, moduleTitle(directory));
}

function addGitMarkdownSummary(filePath) {
  stats.gitMarkdownFound += 1;

  const directory = path.dirname(filePath);
  const title = `${moduleTitle(directory)} - ${path.parse(filePath).name}`;

  addSummary(filePath, "git", title);
}

function walk(directory) {
  const entries = sortByName(fs.readdirSync(directory, { withFileTypes: true }));

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (fullPath === resumeDir) {
        continue;
      }

      walk(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relativeDirectory = path.relative(rootDir, directory);

    if (isAnnotationFile(entry.name)) {
      addAnnotationSummary(fullPath);
      continue;
    }

    if (isGitRelated(relativeDirectory) && isMarkdownFile(entry.name)) {
      addGitMarkdownSummary(fullPath);
    }
  }
}

fs.mkdirSync(resumeDir, { recursive: true });
walk(rootDir);

fs.writeFileSync(javascriptResumePath, summaries.javascript.join("\n"), "utf8");
fs.writeFileSync(gitResumePath, summaries.git.join("\n"), "utf8");

console.log(`Arquivos annotation encontrados: ${stats.annotationFound}`);
console.log(`Arquivos Markdown de Git encontrados: ${stats.gitMarkdownFound}`);
console.log(`Adicionados ao resumo de JavaScript: ${stats.javascript}`);
console.log(`Adicionados ao resumo de Git: ${stats.git}`);
