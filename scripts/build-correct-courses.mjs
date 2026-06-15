// build-correct-courses.mjs
// Uses CURRICULUM from src/content/index.js as the authoritative source.
// Scans src/content/ to locate each lesson file by id/slug.
// Copies to tmp/courses-correct/ with correct naming: {N}-{chapterSlug}/{NNN}-{lessonSlug}.js
// Nothing in src/ is touched.
//
// Usage: node scripts/build-correct-courses.mjs

import { CURRICULUM } from '../src/content/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT   = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const CONTENT = path.join(ROOT, 'src', 'content')
const DEST   = path.join(ROOT, 'tmp', 'courses-correct')

const SKIP_ROOT = new Set(['courses.js','index.js','algebraRegistry.js','linear-algebra-data.js','reference-data.js','default-notes.json'])

// ── 1. Scan all lesson files → id/slug → filepath ────────────────────────────
const idMap   = {}
const slugMap = {}

function scan(dir, isRoot = false) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const fp = path.join(dir, entry.name)
    if (entry.isDirectory()) { scan(fp); continue }
    if (!entry.name.endsWith('.js')) continue
    if (entry.name === 'index.js') continue
    if (isRoot && SKIP_ROOT.has(entry.name)) continue
    try {
      const text = fs.readFileSync(fp, 'utf8').slice(0, 600)
      const id   = text.match(/^\s*id:\s*['"]([^'"]+)['"]/m)?.[1]
      const slug = text.match(/^\s*slug:\s*['"]([^'"]+)['"]/m)?.[1]
      if (id)   idMap[id]       = fp
      if (slug) slugMap[slug]   = fp
    } catch {}
  }
}
scan(CONTENT, true)

// ── 2. Group CURRICULUM chapters per course (preserving order) ────────────────
const courseChapters = {}
for (const ch of CURRICULUM) {
  const course = ch.course
  if (!courseChapters[course]) courseChapters[course] = []
  courseChapters[course].push(ch)
}

// ── 3. Clean dest ─────────────────────────────────────────────────────────────
if (fs.existsSync(DEST)) fs.rmSync(DEST, { recursive: true, force: true })
fs.mkdirSync(DEST, { recursive: true })

// ── 4. Copy with correct naming ───────────────────────────────────────────────
let copied = 0, warned = 0

for (const [course, chapters] of Object.entries(courseChapters)) {
  chapters.forEach((ch, idx) => {
    const chN    = idx + 1
    const chSlug = ch.slug ?? ch.title.toLowerCase().replace(/\s+/g, '-')
    const lessons = [...ch.lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    for (const lesson of lessons) {
      const srcFile = (lesson.id && idMap[lesson.id]) ?? slugMap[lesson.slug]
      if (!srcFile) {
        process.stderr.write(`WARN  ${course}  ch${chN}  "${lesson.slug}" (id=${lesson.id}) — source not found\n`)
        warned++
        continue
      }
      const order   = String(lesson.order ?? 1).padStart(3, '0')
      const dest    = path.join(DEST, course, `${chN}-${chSlug}`, `${order}-${lesson.slug}.js`)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(srcFile, dest)
      copied++
    }
  })
}

console.log(`\n${Object.keys(courseChapters).length} courses | ${copied} lessons copied | ${warned} warnings`)
console.log(`Output: ${DEST}`)
