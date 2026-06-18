/**
 * Rename lesson files from NNN-{garbage}.js → NNN-{slug}.js
 * where slug is the `slug:` field exported from each lesson.
 *
 * Dry-run by default — shows what would change.
 * Run with --apply to actually rename.
 *
 * Usage:
 *   node scripts/rename-lessons.mjs            # preview
 *   node scripts/rename-lessons.mjs --apply    # rename for real
 */

import { readFileSync, renameSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT     = dirname(dirname(fileURLToPath(import.meta.url)))
const COURSES  = join(ROOT, 'src/courses')
const APPLY    = process.argv.includes('--apply')

const SLUG_RE  = /\bslug:\s*['"]([a-z0-9][a-z0-9_-]*)['"]/ // first slug: 'value' in file

let renamed = 0, skipped = 0, collisions = 0, noSlug = 0

for (const courseId of readdirSync(COURSES).sort()) {
  const courseDir = join(COURSES, courseId)
  if (!statSync(courseDir).isDirectory()) continue
  if (courseId === 'courseLoader.js') continue

  for (const chapterDir of readdirSync(courseDir).sort()) {
    if (!/^\d+-.+$/.test(chapterDir)) continue
    const chapterPath = join(courseDir, chapterDir)
    if (!statSync(chapterPath).isDirectory()) continue

    for (const filename of readdirSync(chapterPath).sort()) {
      if (!/^\d+-.+\.js$/.test(filename)) continue

      const m = filename.replace(/\.js$/, '').match(/^(\d+)-(.+)$/)
      if (!m) continue
      const prefix = m[1]   // e.g. "001"
      const oldSlug = m[2]  // e.g. "la1-001-vectors"

      const fullPath = join(chapterPath, filename)
      let src
      try { src = readFileSync(fullPath, 'utf8') } catch { continue }

      const sm = SLUG_RE.exec(src)
      if (!sm) {
        console.log(`NO SLUG   ${courseId}/${chapterDir}/${filename}`)
        noSlug++
        continue
      }

      const newSlug = sm[1]           // e.g. "what-is-a-vector"
      if (newSlug === oldSlug) { skipped++; continue }

      const newFilename = `${prefix}-${newSlug}.js`
      const newPath     = join(chapterPath, newFilename)

      // Collision check
      try {
        statSync(newPath)
        console.log(`COLLISION ${courseId}/${chapterDir}/${filename} → ${newFilename} (target exists)`)
        collisions++
        continue
      } catch { /* good — target doesn't exist */ }

      console.log(`${APPLY ? 'RENAME' : 'WOULD  '} ${courseId}/${chapterDir}/${filename}`)
      console.log(`       → ${newFilename}`)

      if (APPLY) renameSync(fullPath, newPath)
      renamed++
    }
  }
}

console.log(`\n${APPLY ? 'Renamed' : 'Would rename'}: ${renamed}`)
if (skipped)    console.log(`Already correct: ${skipped}`)
if (noSlug)     console.log(`No slug field:   ${noSlug}`)
if (collisions) console.log(`Collisions:      ${collisions}`)
if (!APPLY && renamed > 0) console.log('\nRun with --apply to rename for real.')
