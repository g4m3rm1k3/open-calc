#!/usr/bin/env node
// Actually EXECUTES every lesson's Python notebook cell against a headless
// Pyodide interpreter (the `pyodide` npm package, same engine the app loads
// from a CDN in the browser) — not static analysis. This is what would have
// caught the real bug that prompted this script: a lesson calling
// `fig.plot(fn, xmin=0.3, xmax=15)` against a Figure.plot() whose parameter
// was actually named `ys_or_xmin`, only discoverable by actually running it.
//
// Cells within one lesson share a Python namespace (later cells can use
// variables an earlier cell defined, same as the real in-app notebook); the
// namespace resets between lesson files so one lesson's leftovers can't
// mask or cause a failure in another.
//
// Usage:
//   node scripts/check_python_cells.mjs                  # every lesson
//   node scripts/check_python_cells.mjs <courseId>        # only that course
//   node scripts/check_python_cells.mjs --files <file> [file...]  # PR diff

import { readdirSync, statSync } from 'fs'
import { resolve, dirname, relative } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { loadPyodide } from 'pyodide'
import { OPENCALC_LIB_SOURCE } from '../src/components/notebooks/opencalcLibSource.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const coursesDir = resolve(root, 'src/courses')

// Same package list PythonNotebook.jsx preloads — a cell using one of these
// shouldn't fail here just because the checker didn't load it.
const PACKAGES = ['numpy', 'pandas', 'matplotlib', 'scikit-learn', 'scipy', 'statsmodels', 'sqlite3', 'sympy']

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

// Lesson schemas vary a lot (same lesson as scripts/check_latex.mjs found),
// and Python cells turn up in more places than the 4 "official" schema keys
// builderUtils.js handles (python/PythonNotebook/notebooks.python/pythonLab)
// — e.g. some lessons seed a notebook visualization's starting cells via
// math.visualizations[].props.initialCells. Rather than hand-enumerate every
// nesting pattern, walk the whole lesson object for any array literally
// named "cells" or "initialCells" whose items look like Python cells (have
// a "code" string, but no "startCode" — that field marks a JS sandbox cell
// like the geometry/CNC viz blocks instead).
function extractPythonCells(lesson) {
  const cells = []
  function walk(value, key) {
    if (value == null || typeof value !== 'object') return
    if (Array.isArray(value)) {
      if (key === 'cells' || key === 'initialCells') {
        for (const item of value) {
          if (item && typeof item.code === 'string' && typeof item.startCode === 'undefined') {
            cells.push(item)
          }
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

  console.log('Starting Pyodide...')
  const pyodide = await loadPyodide()
  pyodide.FS.writeFile('/home/pyodide/opencalc.py', OPENCALC_LIB_SOURCE)
  await pyodide.loadPackage(PACKAGES, { messageCallback: () => {} })
  console.log('Pyodide ready.\n')

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
    const cells = extractPythonCells(lesson)
    if (cells.length === 0) continue

    lessonsWithCells++
    const namespace = pyodide.globals.get('dict')()
    let lessonFailed = false

    for (const cell of cells) {
      if (!cell.code) continue
      cellCount++
      try {
        await pyodide.runPythonAsync(cell.code, { globals: namespace })
      } catch (error) {
        failed = true
        lessonFailed = true
        const headline = String(error.message).trim().split('\n').pop()
        console.error(`✗ ${label} — cell "${cell.cellTitle ?? cell.id ?? '?'}"\n    ${headline}`)
      }
    }
    namespace.destroy()

    if (!lessonFailed) console.log(`✓ ${label}`)
  }

  console.log(`\n${lessonsWithCells} lesson(s) with Python cells, ${cellCount} cell(s) checked.`)
  process.exit(failed ? 1 : 0)
}

main()
