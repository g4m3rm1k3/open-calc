#!/usr/bin/env node
// Syntax-checks every embedded JS sandbox cell (the canvas/DOM "startCode"
// blocks used by geometry/CNC/etc visualizations) using acorn (already a
// dependency). This is a lighter check than scripts/check_python_cells.mjs —
// it parses the code but doesn't execute it, since these cells need a real
// DOM/canvas to run meaningfully. It still catches real syntax errors
// (unbalanced braces, stray tokens) before a student hits them.
//
// Usage:
//   node scripts/check_js_cells.mjs                  # every lesson
//   node scripts/check_js_cells.mjs <courseId>        # only that course
//   node scripts/check_js_cells.mjs --files <file> [file...]  # PR diff

import { readdirSync, statSync } from 'fs'
import { resolve, dirname, relative } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import * as acorn from 'acorn'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const coursesDir = resolve(root, 'src/courses')

function isDir(path) {
  try { return statSync(path).isDirectory() } catch { return false }
}

function findLessonFiles(courseFilter) {
  const files = []
  for (const courseId of readdirSync(coursesDir)) {
    if (courseFilter && courseId !== courseFilter) continue
    const courseDir = resolve(coursesDir, courseId)
    if (!isDir(courseDir)) continue
    for (const chapterDir of readdirSync(courseDir)) {
      const chapterPath = resolve(courseDir, chapterDir)
      if (!isDir(chapterPath)) continue
      for (const fileName of readdirSync(chapterPath)) {
        if (fileName.endsWith('.js')) files.push(resolve(chapterPath, fileName))
      }
    }
  }
  return files
}

// Same "cells"/"initialCells" walk as check_python_cells.mjs, but picks out
// the opposite cell shape: a "startCode" field marks a JS sandbox cell
// (Python cells use "code" with no "startCode" — see that script).
function extractJsCells(lesson) {
  const cells = []
  function walk(value, key) {
    if (value == null || typeof value !== 'object') return
    if (Array.isArray(value)) {
      if (key === 'cells' || key === 'initialCells') {
        for (const item of value) {
          if (item && typeof item.startCode === 'string') cells.push(item)
        }
      }
      value.forEach(v => walk(v, key))
      return
    }
    for (const [k, v] of Object.entries(value)) walk(v, k)
  }
  walk(lesson, null)
  return cells
}

async function main() {
  const args = process.argv.slice(2)
  let files
  if (args[0] === '--files') {
    files = args.slice(1).map(p => resolve(root, p))
  } else {
    files = findLessonFiles(args[0])
  }

  let failed = false
  let cellCount = 0
  let lessonsWithCells = 0

  for (const file of files) {
    const label = relative(root, file)
    let mod
    try {
      mod = await import(pathToFileURL(file).href)
    } catch (error) {
      failed = true
      console.error(`✗ ${label}\n    failed to import: ${error.message}`)
      continue
    }

    const lesson = mod.default
    if (!lesson || typeof lesson !== 'object') continue
    const cells = extractJsCells(lesson)
    if (cells.length === 0) continue

    lessonsWithCells++
    let lessonFailed = false

    for (const cell of cells) {
      cellCount++
      try {
        acorn.parse(cell.startCode, { ecmaVersion: 'latest' })
      } catch (error) {
        failed = true
        lessonFailed = true
        console.error(`✗ ${label} — cell "${cell.cellTitle ?? cell.id ?? '?'}"\n    ${error.message}`)
      }
    }

    if (!lessonFailed) console.log(`✓ ${label}`)
  }

  console.log(`\n${lessonsWithCells} lesson(s) with JS cells, ${cellCount} cell(s) checked.`)
  process.exit(failed ? 1 : 0)
}

main()
