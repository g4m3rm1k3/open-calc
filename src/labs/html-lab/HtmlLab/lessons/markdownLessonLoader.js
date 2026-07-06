// Drop a .md file in ./markdown and it shows up here automatically — same
// zero-manifest convention already proven by the blog's post loader
// (src/pages/BlogListPage.jsx) and the course catalog (courseLoader.js).
//
// Two shapes are supported, exactly like the blog:
//   ./markdown/some-lesson.md              -> a standalone lesson
//   ./markdown/some-series/01-first.md     -> one lesson in a named series
// A README.md inside a series folder becomes that series' overview page and
// supplies its title (its first "# " heading), instead of being listed as a
// numbered lesson.
const LESSON_MODULES = import.meta.glob('./markdown/**/*.md', { query: '?raw', import: 'default', eager: true })

function pathToRelative(path) {
  return path.replace(/^.*\/markdown\//, '').replace(/\.md$/, '')
}

function pathToFolderName(path) {
  const rel = pathToRelative(path)
  const parts = rel.split('/')
  return parts.length > 1 ? parts.slice(0, -1).join('/') : null
}

function titleFromContent(raw, fallback) {
  const h1 = raw.split('\n').find((l) => l.startsWith('# '))
  return h1 ? h1.replace(/^# /, '').trim() : fallback.replace(/-/g, ' ')
}

function folderNameToTitle(folder) {
  return folder.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Lesson titles inside a series tend to repeat the series name and lesson
// number ("Frontend Client — Lesson 01 — Connecting to a Real API"), which is
// redundant once shown as a numbered row under that series' own heading —
// strip it down to just the descriptive part for the row label.
function shortLessonTitle(title) {
  const parts = title.split(/\s+—\s+/)
  return parts.length >= 3 ? parts.slice(2).join(' — ') : title
}

const allEntries = Object.entries(LESSON_MODULES)
  .map(([path, raw]) => {
    const slug = pathToRelative(path)
    const folder = pathToFolderName(path)
    const fileName = slug.split('/').pop()
    return {
      slug,
      folder,
      isOverview: fileName.toLowerCase() === 'readme',
      title: titleFromContent(raw, fileName),
      content: raw,
    }
  })
  .sort((a, b) => a.slug.localeCompare(b.slug))

// Standalone lessons: not inside any series folder.
export const MARKDOWN_LESSONS = allEntries.filter((entry) => entry.folder === null)

// Series: every series folder becomes one group, its README (if any) becomes
// the series' overview + title source, and every other file becomes one of
// its numbered lessons, sorted by filename (e.g. 01-, 02-, ...).
const seriesByFolder = new Map()
for (const entry of allEntries) {
  if (entry.folder === null) continue
  if (!seriesByFolder.has(entry.folder)) seriesByFolder.set(entry.folder, [])
  seriesByFolder.get(entry.folder).push(entry)
}

export const MARKDOWN_LESSON_SERIES = Array.from(seriesByFolder.entries())
  .map(([folder, entries]) => {
    const overview = entries.find((entry) => entry.isOverview) || null
    const lessons = entries
      .filter((entry) => !entry.isOverview)
      .map((entry) => ({ ...entry, title: shortLessonTitle(entry.title) }))
    return {
      folder,
      title: overview ? titleFromContent(overview.content, folder) : folderNameToTitle(folder),
      overview,
      lessons,
    }
  })
  .sort((a, b) => a.folder.localeCompare(b.folder))
