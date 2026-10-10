/**
 * Confere se TODO import do projeto aponta para um arquivo que está no Git,
 * com as maiúsculas e minúsculas EXATAS.
 *
 * Por que existe: o Windows não diferencia "Screens" de "screens", então o
 * jogo roda no seu computador. A Vercel usa Linux, que diferencia, e só
 * enxerga o que foi enviado ao Git. Esta verificação simula a Vercel.
 *
 * Uso (na pasta do frontend, depois de "git add ."):
 *   node scripts/check-imports.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const SOURCE_FILE = /^src\/.*\.(js|jsx|css)$/;

const IMPORT_PATTERNS = [
  /\bfrom\s*["']([^"']+)["']/g, // import x from "..." / export ... from "..."
  /\bimport\s*["']([^"']+)["']/g, // import "..."
  /\bimport\(\s*["']([^"']+)["']\s*\)/g, // import("...")
  /@import\s*(?:url\()?\s*["']([^"']+)["']/g // CSS: @import "..."
];

const EXTENSIONS = ["", ".js", ".jsx", ".json", ".css", "/index.js", "/index.jsx"];

function listTrackedFiles() {
  const output = execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });

  return output.split("\0").filter(Boolean);
}

function findImports(source) {
  const found = new Set();

  for (const pattern of IMPORT_PATTERNS) {
    for (const match of source.matchAll(pattern)) {
      found.add(match[1]);
    }
  }

  return [...found].filter(specifier => specifier.startsWith("."));
}

function candidatesFor(fromFile, specifier) {
  const base = path.posix.normalize(
    path.posix.join(path.posix.dirname(fromFile), specifier)
  );

  return EXTENSIONS.map(extension => base + extension);
}

const tracked = new Set(listTrackedFiles());
const byLowerCase = new Map([...tracked].map(file => [file.toLowerCase(), file]));

const problems = [];

function checkSpecifier(fromFile, specifier) {
  const candidates = candidatesFor(fromFile, specifier);

  if (candidates.some(candidate => tracked.has(candidate))) {
    return;
  }

  const wrongCase = candidates
    .map(candidate => byLowerCase.get(candidate.toLowerCase()))
    .find(Boolean);

  problems.push({
    fromFile,
    specifier,
    reason: wrongCase
      ? `O Git guarda "${wrongCase}", mas o código pede outro uso de maiúsculas/minúsculas.`
      : "Esse arquivo NÃO está no Git (não foi adicionado, ou está no .gitignore)."
  });
}

for (const file of tracked.values()) {
  if (!SOURCE_FILE.test(file)) {
    continue;
  }

  const source = readFileSync(file, "utf8");

  for (const specifier of findImports(source)) {
    checkSpecifier(file, specifier);
  }
}

// O index.html aponta para o arquivo de entrada (ex.: /src/main.jsx)
if (tracked.has("index.html")) {
  const html = readFileSync("index.html", "utf8");

  for (const match of html.matchAll(/src="\/(src\/[^"]+)"/g)) {
    if (!tracked.has(match[1])) {
      problems.push({
        fromFile: "index.html",
        specifier: `/${match[1]}`,
        reason: byLowerCase.has(match[1].toLowerCase())
          ? `O Git guarda "${byLowerCase.get(match[1].toLowerCase())}" com outra grafia.`
          : "Esse arquivo NÃO está no Git."
      });
    }
  }
}

if (problems.length === 0) {
  console.log("OK: todos os imports apontam para arquivos que estão no Git, com a grafia certa.");
  process.exit(0);
}

console.error(`\nENCONTREI ${problems.length} PROBLEMA(S) que quebrariam o build na Vercel:\n`);

for (const problem of problems) {
  console.error(`  em ${problem.fromFile}`);
  console.error(`    import: ${problem.specifier}`);
  console.error(`    ${problem.reason}\n`);
}

process.exit(1);