// Rename lesson files in src/courses to {NNN}-{slug}.js
// Sort alphabetically within each chapter (preserves existing order), assign sequential 3-digit numbers.

import fs from 'fs'
import path from 'path'

const DEST = new URL('../src/courses', import.meta.url).pathname

function extractSlug(filename) {
  const base = filename.replace(/\.js$/, '')
  // Has NNN- somewhere (e.g. stat7-001-foo, elec0-001-bar): grab everything from NNN onward, drop the number
  const m3 = base.match(/\d{3}-(.+)$/)
  if (m3) return m3[1]
  // 2-digit prefix with optional letter (e.g. 00-foo, 00a-foo, 01-foo): strip it
  const m2 = base.match(/^\d+[a-z]?-(.+)$/)
  if (m2) return m2[1]
  return base
}

let renamed = 0

for (const courseDir of fs.readdirSync(DEST).sort()) {
  const coursePath = path.join(DEST, courseDir)
  if (!fs.statSync(coursePath).isDirectory()) continue

  for (const chapterDir of fs.readdirSync(coursePath).sort()) {
    const chapterPath = path.join(coursePath, chapterDir)
    if (!fs.statSync(chapterPath).isDirectory()) continue

    const files = fs.readdirSync(chapterPath)
      .filter(f => f.endsWith('.js'))
      .sort()

    files.forEach((file, idx) => {
      const slug = extractSlug(file)
      const newName = `${String(idx + 1).padStart(3, '0')}-${slug}.js`
      if (newName !== file) {
        fs.renameSync(path.join(chapterPath, file), path.join(chapterPath, newName))
        renamed++
      }
    })

    console.log(`${courseDir}/${chapterDir}: ${files.length} files`)
  }
}

console.log(`\nRenamed ${renamed} files.`)
