// For files with generic names (lessonN, ch1-1, etc.), read title/slug from inside and rename.
// Then re-number all files in each chapter sequentially.

import fs from 'fs'
import path from 'path'

const DEST = new URL('../src/courses', import.meta.url).pathname

function slugify(str) {
  return str.toLowerCase()
    .replace(/[&+]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractMeta(fp) {
  try {
    const src = fs.readFileSync(fp, 'utf8')
    const slug = src.match(/\bslug:\s*['"]([^'"]+)['"]/)?.[1]
    const title = src.match(/\btitle:\s*['"]([^'"]+)['"]/)?.[1]
    return { slug, title }
  } catch { return {} }
}

function needsSlugFix(filename) {
  const base = filename.replace(/\.js$/, '').replace(/^\d+-/, '')
  // Generic names: lessonN, lesson0-0, ch1-1, chN-N
  return /^(lesson\d|ch\d)/.test(base)
}

let fixed = 0

for (const courseDir of fs.readdirSync(DEST).sort()) {
  const coursePath = path.join(DEST, courseDir)
  if (!fs.statSync(coursePath).isDirectory()) continue

  for (const chapterDir of fs.readdirSync(coursePath).sort()) {
    const chapterPath = path.join(coursePath, chapterDir)
    if (!fs.statSync(chapterPath).isDirectory()) continue

    let files = fs.readdirSync(chapterPath).filter(f => f.endsWith('.js')).sort()
    let changed = false

    // Step 1: fix generic slugs by reading file content
    for (const file of files) {
      if (!needsSlugFix(file)) continue
      const { slug, title } = extractMeta(path.join(chapterPath, file))
      const newSlug = slug || (title ? slugify(title) : null)
      if (!newSlug) continue

      // Keep the NNN- prefix, replace the slug part
      const num = file.match(/^(\d+)-/)?.[1] ?? '001'
      const newName = `${num}-${newSlug}.js`
      if (newName !== file) {
        fs.renameSync(path.join(chapterPath, file), path.join(chapterPath, newName))
        console.log(`  ${file} → ${newName}`)
        fixed++
        changed = true
      }
    }

    // Step 2: re-read and re-number if anything changed (to fix any collisions)
    if (changed) {
      files = fs.readdirSync(chapterPath).filter(f => f.endsWith('.js')).sort()
      files.forEach((file, idx) => {
        const slug = file.replace(/^\d+-/, '').replace(/\.js$/, '')
        const newName = `${String(idx + 1).padStart(3, '0')}-${slug}.js`
        if (newName !== file) {
          fs.renameSync(path.join(chapterPath, file), path.join(chapterPath, newName))
        }
      })
    }
  }
}

console.log(`\nFixed ${fixed} files.`)
