// build-courses-temp.mjs
// Copies src/content/ into /tmp/courses-rebuild/ using the same mapping as rebuild-courses.mjs.
// Nothing in the repo is changed or deleted.
// Usage: node scripts/build-courses-temp.mjs

import fs from 'fs'
import path from 'path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC  = path.join(ROOT, 'src/content')
const DEST = path.join(ROOT, 'tmp', 'courses-rebuild')

// Clean temp dest only
if (fs.existsSync(DEST)) fs.rmSync(DEST, { recursive: true, force: true })
fs.mkdirSync(DEST, { recursive: true })

let totalFiles = 0
let totalCourses = 0

function readMeta(fp) {
  try {
    const text = fs.readFileSync(fp, 'utf8').slice(0, 600)
    const order = text.match(/^\s*order:\s*(\d+)/m)?.[1]
    const slug  = text.match(/^\s*slug:\s*['"]([^'"]+)['"]/m)?.[1]
    return { order: order != null ? parseInt(order, 10) : null, slug: slug ?? null }
  } catch { return { order: null, slug: null } }
}

function copyLessons(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) { console.log(`  MISSING: ${srcDir}`); return 0 }
  fs.mkdirSync(destDir, { recursive: true })
  const files = fs.readdirSync(srcDir).filter(f =>
    f.endsWith('.js') && f !== 'index.js' && !f.includes(' ') &&
    !['lesson-stubs.js', 'la-sandbox.js'].includes(f)
  )
  let copied = 0
  for (const f of files) {
    const srcPath = path.join(srcDir, f)
    const { order, slug } = readMeta(srcPath)
    if (order == null || !slug) {
      // Fall back: keep original filename so nothing is silently dropped
      fs.copyFileSync(srcPath, path.join(destDir, f))
      process.stderr.write(`  WARN no order/slug: ${srcDir}/${f}\n`)
    } else {
      const destName = `${String(order).padStart(3, '0')}-${slug}.js`
      fs.copyFileSync(srcPath, path.join(destDir, destName))
    }
    copied++
  }
  const rel = destDir.replace(DEST + '/', '')
  console.log(`  ${rel}: ${copied} files`)
  totalFiles += copied
  return copied
}

function extractChapter(fp) {
  try {
    const m = fs.readFileSync(fp, 'utf8').match(/chapter:\s*(['"]?)([^'",\s\n]+)\1/)
    return m ? m[2] : null
  } catch { return null }
}

function grouped(course, chapters) {
  console.log(`\n${course}/`)
  totalCourses++
  chapters.forEach(([src, slug], i) =>
    copyLessons(path.join(SRC, src), path.join(DEST, course, `${i + 1}-${slug}`))
  )
}

function single(course, src, slug) {
  console.log(`\n${course}/`)
  totalCourses++
  copyLessons(path.join(SRC, src), path.join(DEST, course, `1-${slug}`))
}

function multi(course, src, map) {
  console.log(`\n${course}/`)
  totalCourses++
  const srcDir = path.join(SRC, src)
  if (!fs.existsSync(srcDir)) { console.log(`  MISSING`); return }
  const files = fs.readdirSync(srcDir).filter(f =>
    f.endsWith('.js') && f !== 'index.js' && !f.includes(' ') &&
    !['lesson-stubs.js', 'la-sandbox.js'].includes(f)
  )
  const buckets = {}
  const unmapped = []
  for (const f of files) {
    const ch = extractChapter(path.join(srcDir, f))
    const folder = map[ch]
    if (!folder) { unmapped.push(`${f} (chapter=${ch})`); continue }
    if (!buckets[folder]) buckets[folder] = []
    buckets[folder].push(f)
  }
  for (const [folder, flist] of Object.entries(buckets)) {
    const destDir = path.join(DEST, course, folder)
    fs.mkdirSync(destDir, { recursive: true })
    for (const f of flist) {
      const srcPath = path.join(srcDir, f)
      const { order, slug } = readMeta(srcPath)
      if (order == null || !slug) {
        fs.copyFileSync(srcPath, path.join(destDir, f))
        process.stderr.write(`  WARN no order/slug: ${srcDir}/${f}\n`)
      } else {
        const destName = `${String(order).padStart(3, '0')}-${slug}.js`
        fs.copyFileSync(srcPath, path.join(destDir, destName))
      }
    }
    console.log(`  ${course}/${folder}: ${flist.length} files`)
    totalFiles += flist.length
  }
  if (unmapped.length) console.log(`  UNMAPPED (${unmapped.length}): ${unmapped.slice(0, 5).join(', ')}${unmapped.length > 5 ? '...' : ''}`)
}

// ── Grouped courses ───────────────────────────────────────────────────────────

grouped('calculus', [
  ['chapter-0', 'prerequisites'],
  ['chapter-1', 'limits-and-continuity'],
  ['chapter-2', 'derivatives'],
  ['chapter-3', 'applications-of-derivatives'],
  ['chapter-4', 'integration'],
  ['chapter-5', 'sequences-series-and-beyond'],
  ['chapter-6', 'parametric-polar-and-vectors'],
])

grouped('electronics', [
  ['elec-0', 'electrical-fundamentals'],
  ['elec-1', 'dc-electricity'],
  ['elec-2', 'ac-electricity'],
  ['elec-3', 'semiconductors-and-solid-state-devices'],
  ['elec-4', 'amplifiers-and-op-amps'],
  ['elec-5', 'rf-and-communications'],
  ['elec-6', 'systems-integration'],
])

grouped('chemistry', [
  ['chemistry-1', 'elements-and-atomic-structure'],
  ['chemistry-2', 'chemical-bonding'],
  ['chemistry-3', 'matter-in-bulk'],
  ['chemistry-4', 'chemical-reactions'],
])

grouped('precalculus', [
  ['precalc',   'precalculus-foundations'],
  ['precalc-2', 'algebra'],
  ['precalc-3', 'trigonometry'],
  ['precalc-4', 'exponential-and-logarithmic-functions'],
  ['precalc-5', 'polar-complex-and-vectors'],
])

grouped('geometry', [
  ['geometry-1', 'chapter-1'],
  ['geometry-2', 'chapter-2'],
  ['geometry-3', 'chapter-3'],
  ['geometry-4', 'chapter-4'],
  ['geometry-5', 'chapter-5'],
  ['geometry-6', 'chapter-6'],
])

grouped('c-plus-plus', [
  ['cpp-0', 'cpp-foundations'],
  ['cpp-1', 'cpp-intermediate'],
  ['cpp-2', 'cpp-standard-library'],
  ['cpp-3', 'cpp-advanced-techniques'],
  ['cpp-4', 'cpp-build-systems-and-testing'],
])

grouped('git', [
  ['git-0', 'git'],
  ['git-1', 'git-internals-and-logic'],
])

grouped('sql', [
  ['sql-0', 'sql-zero-to-mastery'],
  ['sql-1', 'python-and-sql'],
])

grouped('three-js', [
  ['three-js-1', 'foundations'],
  ['three-js-2', 'setup-and-your-first-scene'],
])

grouped('ai-engineering', [
  ['ai-engineering-0',  'setup-and-tooling'],
  ['ai-engineering-1',  'math-foundations'],
  ['ai-engineering-2',  'ml-fundamentals'],
  ['ai-engineering-11', 'llm-engineering'],
])

grouped('simulation', [
  ['sim-1', 'getting-started'],
  ['sim-2', 'build-a-function-plotter'],
  ['sim-3', '3d-bowling-physics-and-simulation'],
  ['sim-4', 'ocean-simulation'],
])

// ── Physics (sub-folders already in content) ─────────────────────────────────

console.log('\nphysics-1/')
totalCourses++
const physTitles = [
  'foundations-the-language-of-physics',
  'vectors-the-language-of-physics',
  'kinematics-motion-without-forces',
  'motion-in-2d',
  'newton',
  'work-and-energy',
  'momentum-and-collisions',
  'rotational-motion',
  'oscillations-and-waves',
]
for (let i = 0; i <= 8; i++) {
  copyLessons(
    path.join(SRC, 'physics-1', `chapter-${i}`),
    path.join(DEST, 'physics-1', `${i + 1}-${physTitles[i]}`)
  )
}

// ── Single chapter courses ────────────────────────────────────────────────────

single('canvas-1',            'canvas-1',            'html-canvas-2d-graphics-from-zero')
single('command-line',        'cli-0',               'command-line')
single('cnc',                 'cnc-1',               'cnc-macro-systems')
single('data-science',        'data-science',        'computational-foundations')
single('design-1',            'design-1',            'interface-design-systems')
single('discrete-math',       'discrete-math',       'discrete-mathematics-foundations')
single('dynamic-programming', 'dp-1',                'foundations')
single('gcode-parser-1',      'gcode-parser-1',      'math-and-geometry-foundations')
single('javascript',          'javascript-1',        'javascript-core-foundations')
single('logic',               'logic-0',             'boolean-logic-and-digital-fundamentals')
single('nosql',               'nosql-1',             'nosql-databases')
single('programmable-logic-controllers', 'plc-0',    'plc-programming-fundamentals')
single('tetris',              'tetris-1',            'build-tetris')

// ── Multi-chapter (split by chapter field) ───────────────────────────────────

multi('data-structures-and-algorithms', 'dsa-1', {
  dsa0: '1-computational-foundations',
  dsa1: '2-linear-structures',
  dsa2: '3-recursion-and-state',
  dsa3: '4-hashing',
  dsa4: '5-trees',
  dsa5: '6-graphs',
  dsa6: '7-sorting-and-searching',
  dsa7: '8-algorithmic-paradigms',
})

multi('linear-algebra', 'linear-algebra', {
  la1:  '1-vectors-and-spaces',
  la2:  '2-matrices-and-transformations',
  la3:  '3-eigenvalues-and-eigenvectors',
  la4:  '4-orthogonality-projections-and-svd',
  la5:  '5-python-in-the-browser',
  la6:  '6-abstract-vector-spaces',
  la7:  '7-numerical-linear-algebra',
  la8:  '8-applications-of-linear-algebra',
  la9:  '9-iterative-solvers-and-preconditioning',
  la10: '10-advanced-theory',
})

multi('web', 'web-1', {
  w1: '1-the-web-as-a-system',
  w2: '2-javascript-as-behavior',
  w3: '3-time-and-asynchrony',
  w4: '4-stateful-ui-systems',
  w5: '5-data-and-real-systems',
  w6: '6-advanced-engineering',
  w7: '7-capstone-system',
})

multi('applied-statistics', 'applied-statistics', {
  stat1: '1-foundations-of-statistical-thinking',
  stat2: '2-data-visualization',
  stat3: '3-descriptive-statistics',
  stat4: '4-probability-and-counting',
  stat5: '5-probability-distributions',
  stat6: '6-statistical-inference',
  stat7: '7-regression-analysis',
})

multi('python', 'python-1', {
  '0.1': '1-computational-foundations',
  '0.2': '2-python-core-syntax',
  '0.3': '3-computational-methods',
  '0.4': '4-logic-and-control-flow',
  '0.5': '5-iteration',
  '0.6': '6-data-structures',
  '0.7': '7-abstraction-and-design',
  '1.1': '8-numbers-and-structure',
})

multi('digital-fundamentals', 'digital-fundamentals', {
  'df.1': '1-signals-binary-and-data',
  'df.2': '2-number-systems',
  'df.3': '3-logic-gates',
  'df.4': '4-boolean-algebra',
  'df.5': '5-combinational-logic',
  'df.6': '6-sequential-logic',
})

console.log(`\n${'─'.repeat(50)}`)
console.log(`${totalCourses} courses  |  ${totalFiles} lesson files`)
console.log(`Output: ${DEST}`)
