// Minimal migration: export default → export const lesson
// Content untouched. Just moves files to autoLoader path convention.

import fs from 'fs'
import path from 'path'

const ROOT   = new URL('..', import.meta.url).pathname
const SRC    = path.join(ROOT, 'src/content')
const DEST   = path.join(ROOT, 'src/content/lessons')

const COURSES = ['sim-1', 'sim-2', 'sim-3', 'sim-4']

for (const courseId of COURSES) {
  // Source folder: src/content/sim-1/ etc.
  const srcDir = path.join(SRC, courseId)
  if (!fs.existsSync(srcDir)) {
    console.log(`skip (no source): ${courseId}`)
    continue
  }

  // Dest chapter folder: src/content/lessons/sim-1/1-sim-1/
  const chapterSlug = courseId  // use courseId as chapter slug
  const destDir = path.join(DEST, courseId, `1-${chapterSlug}`)
  fs.mkdirSync(destDir, { recursive: true })

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js') && f !== 'index.js')

  for (const filename of files) {
    // Extract 3-digit number + slug from filename like "sim1-001-how-the-lab-works.js"
    const m = filename.match(/(?:^|-)(\d{3})-(.+)\.js$/)
    if (!m) { console.log(`  skip (no match): ${filename}`); continue }

    const num  = m[1]   // "001"
    const slug = m[2]   // "how-the-lab-works"

    let src = fs.readFileSync(path.join(srcDir, filename), 'utf8')

    // Pattern 1: export default { ... }
    src = src.replace(/^export\s+default\s+\{/m, 'export const lesson = {')

    // Pattern 2: const foo = { ... }; export default foo
    const varRef = src.match(/export\s+default\s+(\w+)\s*;?\s*$/m)
    if (varRef) {
      const v = varRef[1]
      src = src.replace(new RegExp(`^(const|let|var)\\s+${v}\\s*=\\s*\\{`, 'm'), 'export const lesson = {')
      src = src.replace(/export\s+default\s+\w+\s*;?\s*$/m, '')
    }

    const outFile = path.join(destDir, `${num}-${slug}.js`)
    fs.writeFileSync(outFile, src)
    console.log(`  ✓ ${filename} → ${num}-${slug}.js`)
  }

  console.log(`done: ${courseId}`)
}
