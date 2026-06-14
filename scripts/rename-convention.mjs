// Rename everything in src/courses/ to the convention:
// Chapter folders: {N}-{slug}
// Lesson files:    {NNN}-{slug}.js

import fs from 'fs'
import path from 'path'

const BASE = new URL('../src/courses', import.meta.url).pathname

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Rename a lesson filename to NNN-slug.js
function renameLesson(filename) {
  const base = filename.replace(/\.js$/, '')

  // Already correct: starts with 3 digits + dash
  if (/^\d{3}-/.test(base)) return filename

  // Has 3-digit number somewhere: strip prefix up to NNN-
  const m3 = base.match(/(\d{3}-.+)$/)
  if (m3) return m3[1] + '.js'

  // 2-digit prefix: 00-slug → 001-slug
  const m2 = base.match(/^(\d{2})[a-z]?-(.+)$/)
  if (m2) return String(parseInt(m2[1]) + 1).padStart(3, '0') + '-' + m2[2] + '.js'

  // ch1-1 style (python): keep as-is but pad
  const mch = base.match(/^ch(\d+)-(\d+)$/)
  if (mch) return String(parseInt(mch[2])).padStart(3, '0') + '-' + base + '.js'

  // Fallback: use as-is
  return filename
}

// Rename a chapter folder name to N-slug
function renameChapter(name) {
  // Already correct: starts with digit(s)-slug
  if (/^\d+-[a-z]/.test(name)) return name

  // chapter-N
  const mch = name.match(/^chapter-(\d+)$/)
  if (mch) return (parseInt(mch[1]) + 1) + '-chapter'

  // somecourse-N (e.g. geometry-1, chemistry-2, precalc-3)
  const mc = name.match(/^(.+?)-(\d+)$/)
  if (mc) return mc[2] + '-' + slugify(mc[1])

  return name
}

let renamed = 0

function processDir(dirPath) {
  let entries = fs.readdirSync(dirPath)

  for (const entry of entries) {
    const full = path.join(dirPath, entry)
    const stat = fs.statSync(full)

    if (stat.isDirectory()) {
      const newName = renameChapter(entry)
      let newFull = full
      if (newName !== entry) {
        newFull = path.join(dirPath, newName)
        fs.renameSync(full, newFull)
        console.log(`  dir: ${entry} → ${newName}`)
        renamed++
      }
      processDir(newFull)
    } else if (entry.endsWith('.js') && entry !== 'index.js') {
      const newName = renameLesson(entry)
      if (newName !== entry) {
        fs.renameSync(full, path.join(dirPath, newName))
        console.log(`  file: ${entry} → ${newName}`)
        renamed++
      }
    }
  }
}

processDir(BASE)
console.log(`\nDone. ${renamed} items renamed.`)
