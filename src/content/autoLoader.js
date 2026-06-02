// Auto-discovers lessons from src/content/lessons/<course>/<chapter>/<lesson>.js
//
// Folder convention:  lessons/<course-id>/<N>-<chapter-title-slug>/
// File convention:    <NNN>-<lesson-slug>.js
//
// Example:
//   lessons/python-1/1-python-fundamentals/001-variables.js
//     → course: "python-1", chapter number: 1, title: "Python Fundamentals", order: 1
//
// Lessons migrate here one chapter at a time. Old content/<course>/index.js entries
// stay untouched until a chapter is fully moved over.

// import.meta.glob is Vite-only — guard for Node.js scripts (e.g. build-search-index)
let ALL_MODULES = {};
try { ALL_MODULES = import.meta.glob('./lessons/**/*.js', { eager: true }); } catch { /* Node.js */ }

function slugToTitle(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Build tree: { [courseId]: { [chapterNum]: { number, title, lessons[] } } }
const tree = {};

for (const [path, mod] of Object.entries(ALL_MODULES)) {
  // path looks like: ./lessons/python-1/1-python-fundamentals/001-variables.js
  const rel = path.replace('./lessons/', '');
  const parts = rel.split('/');
  if (parts.length !== 3) continue;

  const [courseId, chapterFolder, filename] = parts;

  const chapterMatch = chapterFolder.match(/^(\d+)-(.+)$/);
  if (!chapterMatch) continue;
  const chapterNum = parseInt(chapterMatch[1], 10);
  const chapterTitle = slugToTitle(chapterMatch[2]);

  const fileMatch = filename.replace('.js', '').match(/^(\d+)-(.+)$/);
  if (!fileMatch) continue;
  const lessonOrder = parseInt(fileMatch[1], 10);

  const lesson = mod?.default;
  if (!lesson) continue;

  // Namespace chapter number with courseId to avoid collisions with other courses
  // e.g. git-0 chapter 1 → "git-0-1", not just 1 (which would clash with calc ch1)
  const chapterId = `${courseId}-${chapterNum}`;
  if (!tree[courseId]) tree[courseId] = {};
  if (!tree[courseId][chapterNum]) {
    tree[courseId][chapterNum] = { number: chapterId, title: chapterTitle, lessons: [] };
  }
  tree[courseId][chapterNum].lessons.push({ ...lesson, _fileOrder: lessonOrder });
}

// Sort lessons by file order within each chapter, chapters by number.
// Returns chapters in the same shape as old index.js exports:
// [ { number, title, course, lessons: [...] }, ... ]
export function getAutoChapters(courseId) {
  const chapters = Object.values(tree[courseId] ?? {});
  chapters.sort((a, b) => a.number - b.number);
  for (const ch of chapters) {
    ch.lessons.sort((a, b) => a._fileOrder - b._fileOrder);
    ch.lessons = ch.lessons.map(({ _fileOrder, ...l }) => l);
  }
  return chapters.map((ch) => ({ ...ch, course: courseId }));
}

// All auto-discovered chapters across all courses.
export function getAllAutoChapters() {
  return Object.keys(tree).flatMap((courseId) => getAutoChapters(courseId));
}
