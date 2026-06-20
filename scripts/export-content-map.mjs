// Generates a JSON map of every course -> chapter -> lesson, including
// source file paths and in-app route paths. Use this to rebuild or audit
// the src/content/ folder structure (e.g. after data loss).
//
// Usage:
//   node scripts/export-content-map.mjs [output-path]
//
// Default output: content-map.json (project root)

import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const contentDir = path.join(projectRoot, "src", "content");

const { CURRICULUM, COURSES } = await import("../src/content/index.js");

// --- Walk src/content, dynamically import every .js file, and build a
//     lesson id -> source file map by inspecting each module's default export.

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules") continue;
      out.push(...walk(full));
    } else if (entry.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

const lessonFileById = new Map();
const lessonFileBySlugChapter = new Map(); // `${chapterNumber}/${slug}` -> path

for (const file of walk(contentDir)) {
  let mod;
  try {
    mod = await import(pathToFileURL(file).href);
  } catch {
    continue;
  }
  const rel = path.relative(contentDir, file).split(path.sep).join("/");
  for (const exported of Object.values(mod)) {
    if (
      exported &&
      typeof exported === "object" &&
      !Array.isArray(exported) &&
      typeof exported.slug === "string" &&
      typeof exported.title === "string" &&
      !Array.isArray(exported.lessons)
    ) {
      if (typeof exported.id === "string") {
        if (lessonFileById.has(exported.id) && lessonFileById.get(exported.id) !== rel) {
          console.warn(
            `[duplicate id] "${exported.id}" found in both ${lessonFileById.get(exported.id)} and ${rel}`,
          );
        }
        lessonFileById.set(exported.id, rel);
      }
      if (exported.chapter !== undefined) {
        lessonFileBySlugChapter.set(`${exported.chapter}/${exported.slug}`, rel);
      }
    }
  }
}

// --- Build the output map ---------------------------------------------------

const courseMap = new Map(
  COURSES.map((c) => [c.key, { ...c, chapters: [] }]),
);

// Global position in app traversal order (course -> chapter -> lesson),
// used as `newId` so every lesson gets a trivially unique id.
let lessonIndex = 0;

for (const chapter of CURRICULUM) {
  const course = courseMap.get(chapter.course);
  const chapterEntry = {
    id: chapter.id ?? null,
    number: chapter.number,
    title: chapter.title,
    slug: chapter.slug,
    routePath: `/chapter/${chapter.number}`,
    lessons: [],
  };

  chapter.lessons.forEach((lesson, i) => {
    const sourceFile =
      lessonFileBySlugChapter.get(`${chapter.number}/${lesson.slug}`) ??
      lessonFileById.get(lesson.id) ??
      null;

    const newId = lessonIndex++;

    chapterEntry.lessons.push({
      id: lesson.id,
      newId,
      slug: lesson.slug,
      title: lesson.title,
      order: lesson.order ?? i,
      routePath: `/chapter/${chapter.number}/${lesson.slug}`,
      sourceFile: sourceFile ? `src/content/${sourceFile}` : null,
    });
  });

  if (course) course.chapters.push(chapterEntry);
}

const output = {
  generatedAt: new Date().toISOString(),
  courses: Array.from(courseMap.values()),
};

const outPath = path.resolve(
  projectRoot,
  process.argv[2] || "content-map.json",
);
writeFileSync(outPath, JSON.stringify(output, null, 2));

const totalLessons = output.courses.reduce(
  (sum, c) => sum + c.chapters.reduce((s, ch) => s + ch.lessons.length, 0),
  0,
);
const unresolved = output.courses.reduce(
  (sum, c) =>
    sum +
    c.chapters.reduce(
      (s, ch) => s + ch.lessons.filter((l) => !l.sourceFile).length,
      0,
    ),
  0,
);
console.log(
  `Wrote ${output.courses.length} courses, ${totalLessons} lessons (${unresolved} unresolved source files) to ${outPath}`,
);
