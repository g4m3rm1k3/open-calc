#!/usr/bin/env node
/**
 * scan-codebase.js
 * Walks src/, classifies every file, checks wiring and convention compliance.
 * Output: codebase-map.json (used by the /dev/map visualizer)
 *
 * Run: node scripts/scan-codebase.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "codebase-map.json");

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFile(filePath) {
  try { return fs.readFileSync(filePath, "utf8"); } catch { return ""; }
}

function countLines(text) {
  return text.split("\n").length;
}

function extractImports(text) {
  const matches = [];
  const re = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(text)) !== null) matches.push(m[1]);
  return matches;
}

function walkDir(dir, exts = [".js", ".jsx", ".ts", ".tsx"]) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".cache"].includes(entry.name)) continue;
      results.push(...walkDir(full, exts));
    } else if (exts.some(e => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function rel(absPath) {
  return path.relative(ROOT, absPath).replace(/\\/g, "/");
}

// ── Parse App.jsx for routes ──────────────────────────────────────────────────

function parseRoutes() {
  const appSrc = readFile(path.join(SRC, "App.jsx"));

  // lazy imports: const FooPage = lazy(() => import("./pages/FooPage.jsx"))
  const lazyMap = {};
  const lazyRe = /const\s+(\w+)\s*=\s*lazy\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/g;
  let m;
  while ((m = lazyRe.exec(appSrc)) !== null) {
    lazyMap[m[1]] = m[2];
  }

  // Route elements can span lines — strip newlines for matching
  const flatApp = appSrc.replace(/\n/g, " ");

  // <Route path="foo" element={<FooPage />} />  (path before element)
  const routeMap = {};
  const routeRe = /<Route\s[^>]*path=["']([^"']+)["'][^>]*element=\{<(\w+)/g;
  while ((m = routeRe.exec(flatApp)) !== null) routeMap[m[2]] = m[1];

  // <Route element={<FooPage />} path="foo" />  (element before path)
  const routeRe2 = /<Route\s[^>]*element=\{<(\w+)[^>]*path=["']([^"']+)["']/g;
  while ((m = routeRe2.exec(flatApp)) !== null) routeMap[m[1]] = m[2];

  // index route
  const indexRe = /<Route\s+index\s+element=\{<(\w+)/g;
  while ((m = indexRe.exec(flatApp)) !== null) routeMap[m[1]] = "/";

  // Merge: component → { importPath, route }
  const routes = {};
  for (const [comp, importPath] of Object.entries(lazyMap)) {
    routes[comp] = { importPath, route: routeMap[comp] ?? null };
  }
  return routes;
}

// ── Classify src/pages ────────────────────────────────────────────────────────

function scanPages(routes) {
  const pagesDir = path.join(SRC, "pages");
  const files = fs.existsSync(pagesDir)
    ? fs.readdirSync(pagesDir).filter(f => f.endsWith(".jsx") || f.endsWith(".tsx"))
    : [];

  return files.map(file => {
    const filePath = path.join(pagesDir, file);
    const text = readFile(filePath);
    const componentName = file.replace(/\.(jsx|tsx)$/, "");
    const routeInfo = routes[componentName] ?? {};
    const imports = extractImports(text);

    // detect if this page wraps a lab (imports from components/*/Lab)
    const isLab = imports.some(i => /Lab|Studio|Sim/.test(i));
    const hasOnBack = text.includes("onBack");

    return {
      file: rel(filePath),
      component: componentName,
      type: "page",
      isLab,
      route: routeInfo.route ?? null,
      routed: !!routeInfo.route,
      hasOnBack,
      imports,
      loc: countLines(text),
    };
  });
}

// ── Classify src/components ───────────────────────────────────────────────────

function scanComponents() {
  const compDir = path.join(SRC, "components");
  if (!fs.existsSync(compDir)) return [];

  const results = [];
  for (const entry of fs.readdirSync(compDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(compDir, entry.name);
    const files = fs.readdirSync(dir, { withFileTypes: true })
      .filter(f => f.isFile())
      .map(f => f.name);

    const jsxFiles = files.filter(f => f.endsWith(".jsx") || f.endsWith(".tsx"));
    const hasCss = files.some(f => f.endsWith(".module.css") || f.endsWith(".module.scss"));
    const hasIndex = files.includes("index.js") || files.includes("index.ts");
    const isLab = entry.name.toLowerCase().includes("lab") ||
                  entry.name.toLowerCase().includes("studio");

    let totalLoc = 0;
    const allImports = new Set();
    for (const f of jsxFiles) {
      const text = readFile(path.join(dir, f));
      totalLoc += countLines(text);
      extractImports(text).forEach(i => allImports.add(i));
    }

    results.push({
      name: entry.name,
      dir: rel(dir),
      type: isLab ? "lab" : "component",
      files: files.length,
      jsxFiles: jsxFiles.length,
      hasCss,
      hasIndex,
      loc: totalLoc,
      imports: [...allImports],
    });
  }
  return results;
}

// ── Classify src/content ──────────────────────────────────────────────────────

// Fields the convention requires on every lesson default export
const REQUIRED_LESSON_FIELDS = ["id", "title", "slug", "type", "content"];

function scoreLesson(text) {
  const score = { fields: {}, total: 0 };
  for (const field of REQUIRED_LESSON_FIELDS) {
    // match: id:, title:, slug:, etc. inside an export default object
    const present = new RegExp(`\\b${field}\\s*:`).test(text);
    score.fields[field] = present;
    if (present) score.total++;
  }
  score.pct = Math.round((score.total / REQUIRED_LESSON_FIELDS.length) * 100);
  return score;
}

function parseRegisteredCourses() {
  const indexSrc = readFile(path.join(SRC, "content", "index.js"));
  const registered = new Set();
  // import foo from "./some-course/index.js"
  const re = /from\s+["']\.\/([^/'"]+)\/index\.js["']/g;
  let m;
  while ((m = re.exec(indexSrc)) !== null) registered.add(m[1]);
  return registered;
}

function scanContent() {
  const contentDir = path.join(SRC, "content");
  if (!fs.existsSync(contentDir)) return [];

  const registered = parseRegisteredCourses();
  const results = [];

  for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skip = ["templates", "videos", "enhancers", "lessons"];
    if (skip.includes(entry.name)) continue;

    const dir = path.join(contentDir, entry.name);
    const allFiles = walkDir(dir);
    const hasIndex = fs.existsSync(path.join(dir, "index.js"));
    const isRegistered = registered.has(entry.name);

    // Sample up to 5 lesson files for compliance scoring
    const lessonFiles = allFiles.filter(f => !f.endsWith("index.js"));
    const sample = lessonFiles.slice(0, 5);
    let avgScore = 0;
    const lessonScores = sample.map(f => {
      const s = scoreLesson(readFile(f));
      avgScore += s.pct;
      return { file: rel(f), ...s };
    });
    avgScore = sample.length ? Math.round(avgScore / sample.length) : 0;

    results.push({
      course: entry.name,
      dir: rel(dir),
      type: "content",
      registered: isRegistered,
      hasIndex,
      totalFiles: allFiles.length,
      lessonFiles: lessonFiles.length,
      complianceScore: avgScore,
      sampleLessons: lessonScores,
    });
  }

  return results.sort((a, b) => {
    // unregistered first, then by compliance score ascending (most broken first)
    if (a.registered !== b.registered) return a.registered ? 1 : -1;
    return a.complianceScore - b.complianceScore;
  });
}

// ── Classify src/utils ────────────────────────────────────────────────────────

function scanUtils() {
  const utilsDir = path.join(SRC, "utils");
  if (!fs.existsSync(utilsDir)) return [];
  return fs.readdirSync(utilsDir)
    .filter(f => f.endsWith(".js") || f.endsWith(".jsx"))
    .map(f => {
      const text = readFile(path.join(utilsDir, f));
      return {
        file: rel(path.join(utilsDir, f)),
        type: "util",
        loc: countLines(text),
        exports: (text.match(/export\s+(function|const|class|default)/g) ?? []).length,
      };
    });
}

// ── Classify src/data ─────────────────────────────────────────────────────────

function scanData() {
  const dataDir = path.join(SRC, "data");
  if (!fs.existsSync(dataDir)) return [];
  return walkDir(dataDir).map(f => ({
    file: rel(f),
    type: "data",
    loc: countLines(readFile(f)),
  }));
}

// ── Build summary ─────────────────────────────────────────────────────────────

function buildSummary(pages, components, content, utils, data) {
  const unrouted = pages.filter(p => !p.routed);
  const unregistered = content.filter(c => !c.registered);
  const labsWithoutOnBack = pages.filter(p => p.isLab && !p.hasOnBack);
  const lowCompliance = content.filter(c => c.complianceScore < 60 && c.registered);

  return {
    totalPages: pages.length,
    totalComponents: components.length,
    totalCourses: content.length,
    totalUtils: utils.length,
    totalDataFiles: data.length,
    unroutedPages: unrouted.length,
    unregisteredCourses: unregistered.length,
    labsWithoutOnBack: labsWithoutOnBack.length,
    lowComplianceCourses: lowCompliance.length,
    issues: [
      ...unrouted.map(p => ({ severity: "error", type: "unrouted-page", file: p.file, message: `${p.component} has no route in App.jsx` })),
      ...unregistered.map(c => ({ severity: "warning", type: "unregistered-course", file: c.dir, message: `${c.course} not imported in content/index.js (${c.lessonFiles} lesson files orphaned)` })),
      ...labsWithoutOnBack.map(p => ({ severity: "warning", type: "missing-onback", file: p.file, message: `${p.component} is a lab page but has no onBack prop` })),
      ...lowCompliance.map(c => ({ severity: "info", type: "low-compliance", file: c.dir, message: `${c.course} compliance score ${c.complianceScore}% — lessons missing required fields` })),
    ],
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log("Scanning codebase...");

const routes = parseRoutes();
const pages = scanPages(routes);
const components = scanComponents();
const content = scanContent();
const utils = scanUtils();
const data = scanData();
const summary = buildSummary(pages, components, content, utils, data);

const output = {
  generated: new Date().toISOString(),
  summary,
  pages,
  components,
  content,
  utils,
  data,
};

const json = JSON.stringify(output, null, 2);
fs.writeFileSync(OUT, json);
// Also copy into src/ so Vite can import it at /dev/map
fs.writeFileSync(path.join(SRC, "codebase-map.json"), json);

console.log(`\nDone → codebase-map.json`);
console.log(`  Pages:              ${summary.totalPages} (${summary.unroutedPages} unrouted)`);
console.log(`  Components:         ${summary.totalComponents}`);
console.log(`  Courses:            ${summary.totalCourses} (${summary.unregisteredCourses} unregistered)`);
console.log(`  Utils:              ${summary.totalUtils}`);
console.log(`  Issues found:       ${summary.issues.length}`);
console.log(`    Errors:           ${summary.issues.filter(i => i.severity === "error").length}`);
console.log(`    Warnings:         ${summary.issues.filter(i => i.severity === "warning").length}`);
console.log(`    Info:             ${summary.issues.filter(i => i.severity === "info").length}`);
