/**
 * port-ae1.mjs
 * Extracts all 22 Phase 1 Math Foundations lessons from source material into
 * UpSkillOS lesson JS files.
 *
 * Source: incomplete ideas/ai-engineering-from-scratch-main/phases/01-math-foundations/
 *   Each folder has: docs/en.md  quiz.json  code/*.py
 *
 * Output: src/content/ai-engineering-1/ae1-XX-slug.js  +  index.js
 *
 * Run: node scripts/port-ae1.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SOURCE = path.join(ROOT, 'incomplete ideas/ai-engineering-from-scratch-main/phases/01-math-foundations')
const TARGET = path.join(ROOT, 'src/content/ai-engineering-1')

// ── Lesson manifest ────────────────────────────────────────────────────────
const LESSONS = [
  { num: '01', folder: '01-linear-algebra-intuition',     slug: 'linear-algebra-intuition' },
  { num: '02', folder: '02-vectors-matrices-operations',  slug: 'vectors-matrices-operations' },
  { num: '03', folder: '03-matrix-transformations',       slug: 'matrix-transformations' },
  { num: '04', folder: '04-calculus-for-ml',              slug: 'calculus-for-ml' },
  { num: '05', folder: '05-chain-rule-and-autodiff',      slug: 'chain-rule-autodiff' },
  { num: '06', folder: '06-probability-and-distributions',slug: 'probability-distributions' },
  { num: '07', folder: '07-bayes-theorem',                slug: 'bayes-theorem' },
  { num: '08', folder: '08-optimization',                 slug: 'optimization' },
  { num: '09', folder: '09-information-theory',           slug: 'information-theory' },
  { num: '10', folder: '10-dimensionality-reduction',     slug: 'dimensionality-reduction' },
  { num: '11', folder: '11-singular-value-decomposition', slug: 'svd' },
  { num: '12', folder: '12-tensor-operations',            slug: 'tensor-operations' },
  { num: '13', folder: '13-numerical-stability',          slug: 'numerical-stability' },
  { num: '14', folder: '14-norms-and-distances',          slug: 'norms-distances' },
  { num: '15', folder: '15-statistics-for-ml',            slug: 'statistics-for-ml' },
  { num: '16', folder: '16-sampling-methods',             slug: 'sampling-methods' },
  { num: '17', folder: '17-linear-systems',               slug: 'linear-systems' },
  { num: '18', folder: '18-convex-optimization',          slug: 'convex-optimization' },
  { num: '19', folder: '19-complex-numbers',              slug: 'complex-numbers' },
  { num: '20', folder: '20-fourier-transform',            slug: 'fourier-transform' },
  { num: '21', folder: '21-graph-theory',                 slug: 'graph-theory' },
  { num: '22', folder: '22-stochastic-processes',         slug: 'stochastic-processes' },
]

// ── Markdown parser ────────────────────────────────────────────────────────

function parseMd(raw) {
  const lines = raw.split('\n')
  const out = { title: '', subtitle: '', objectives: [], sections: {} }

  // title
  const titleLine = lines.find(l => l.startsWith('# '))
  out.title = titleLine ? titleLine.replace(/^# /, '').trim() : ''

  // tagline / subtitle
  const tagLine = lines.find(l => l.startsWith('> '))
  out.subtitle = tagLine ? tagLine.replace(/^> /, '').trim() : ''

  // split into H2 sections
  const h2Blocks = raw.split(/^## /m).slice(1)
  for (const block of h2Blocks) {
    const nl = block.indexOf('\n')
    const heading = block.slice(0, nl).trim()
    const body = block.slice(nl + 1).trim()
    out.sections[heading] = body
  }

  // learning objectives
  const objBody = out.sections['Learning Objectives'] ?? ''
  out.objectives = objBody
    .split('\n')
    .filter(l => l.startsWith('- '))
    .map(l => l.replace(/^- /, '').trim())

  return out
}

/**
 * Split "## The Concept" body into ### subsections.
 * Returns array of { heading, body } objects.
 * Mermaid blocks are replaced with viz-placeholder markers.
 */
function parseConcept(conceptBody) {
  // Replace ```mermaid...``` with placeholder comment
  const cleaned = conceptBody.replace(/```mermaid[\s\S]*?```/g, (match) => {
    // Try to infer what the diagram described
    const hint = match.includes('graph') ? 'flow diagram'
      : match.includes('sequenceDiagram') ? 'sequence diagram'
      : match.includes('classDiagram') ? 'class diagram'
      : 'diagram'
    return `<!-- VIZ_PLACEHOLDER:${hint} -->`
  })

  const parts = cleaned.split(/^### /m)
  const intro = parts[0].trim()
  const subsections = parts.slice(1).map(s => {
    const nl = s.indexOf('\n')
    const heading = s.slice(0, nl).trim()
    const body = s.slice(nl + 1).trim()
    return { heading, body }
  })
  return { intro, subsections }
}

/**
 * Convert a subsection into a prose string.
 * Headings become **bold**, viz placeholders become callout markers.
 */
function subsectionToProse(heading, body) {
  // Keep body as-is (it's markdown, rendered by MarkdownProse)
  return `**${heading}**\n\n${body}`
}

/**
 * Extract viz-placeholder callouts from prose content.
 * Returns { prose: string (cleaned), callouts: [] }
 */
function extractVizPlaceholders(prose) {
  const callouts = []
  const cleaned = prose.replace(/<!-- VIZ_PLACEHOLDER:(.+?) -->/g, (_, hint) => {
    callouts.push({
      type: 'info',
      title: '📊 Visualization Placeholder',
      body: `Interactive visualization — ${hint}. This will be replaced with a custom interactive component.`,
    })
    return ''
  })
  return { cleaned: cleaned.trim(), callouts }
}

// ── Python code parser ─────────────────────────────────────────────────────

/**
 * Extract top-level function definitions from Python source.
 * Returns array of { name, body } — body is everything between def and the next def.
 */
function extractPyFunctions(pySource) {
  const fns = []
  // Match: def name(...): \n body
  const regex = /^def (\w+)\([^)]*\):/gm
  let match
  const matches = []
  while ((match = regex.exec(pySource)) !== null) {
    matches.push({ name: match[1], start: match.index })
  }

  for (let i = 0; i < matches.length; i++) {
    const { name, start } = matches[i]
    const end = i + 1 < matches.length ? matches[i + 1].start : pySource.length
    // Extract function including def line
    let body = pySource.slice(start, end).trim()
    fns.push({ name, body })
  }

  // Also grab the if __name__ block
  const mainMatch = pySource.match(/^if __name__ == ['"]__main__['"]:[\s\S]*/m)
  if (mainMatch) {
    fns.push({ name: '__main__', body: mainMatch[0] })
  }

  return fns
}

/**
 * Prettify a function name for use as a cell title.
 * demo_norms -> Norms
 * demo_cosine_vs_dot -> Cosine vs dot
 */
function prettifyFnName(name) {
  return name
    .replace(/^demo_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Build notebook cells from Python source.
 * Strategy:
 *   - Cells 1 to N-1: demo_* functions (body, inline — no def wrapper)
 *   - Skip: utility/private functions, __main__
 *   - Limit to 6 teaching cells max
 */
function buildNotebookCells(pySource, lessonTitle) {
  const allFns = extractPyFunctions(pySource)

  // Demo functions are the main teaching content
  const demoFns = allFns.filter(f => f.name.startsWith('demo_') && f.name !== '__main__')

  // Utility functions (non-demo, non-private, non-main)
  const utilFns = allFns.filter(
    f => !f.name.startsWith('demo_') && !f.name.startsWith('_') && f.name !== '__main__'
  )

  const cells = []

  // Cell 1: key utility/algorithm functions (first 6 utilities max, or all if <= 6)
  if (utilFns.length > 0) {
    const utilLimit = Math.min(utilFns.length, 8)
    const utilCode = utilFns.slice(0, utilLimit).map(f => f.body).join('\n\n\n')
    cells.push({
      id: 1,
      cellTitle: `${lessonTitle}: core functions`,
      prose: [
        `## Building from scratch`,
        `These are the core algorithm implementations for this lesson. Read each function carefully — every line maps directly to the math from the lesson above.`,
      ],
      code: utilCode,
      output: '', status: 'idle', figureJson: null,
    })
  }

  // Demo cells
  const demoLimit = Math.min(demoFns.length, 5)
  for (let i = 0; i < demoLimit; i++) {
    const fn = demoFns[i]
    // Extract body without the def line
    const defLineEnd = fn.body.indexOf('\n')
    const rawBody = fn.body.slice(defLineEnd + 1)
    // Dedent: find minimum indent
    const bodyLines = rawBody.split('\n')
    const nonEmpty = bodyLines.filter(l => l.trim().length > 0)
    const minIndent = nonEmpty.length > 0
      ? Math.min(...nonEmpty.map(l => l.match(/^(\s*)/)[1].length))
      : 0
    const dedented = bodyLines.map(l => l.slice(minIndent)).join('\n').trim()

    cells.push({
      id: i + 2,
      cellTitle: prettifyFnName(fn.name),
      prose: [
        `## ${prettifyFnName(fn.name)}`,
        `Run this cell to see the concept in action.`,
      ],
      code: dedented,
      output: '', status: 'idle', figureJson: null,
    })
  }

  return cells
}

/**
 * Build challenge cells from the ## Exercises section.
 */
function buildChallengeCells(exercisesBody) {
  if (!exercisesBody) return []
  const exercises = exercisesBody
    .split('\n')
    .filter(l => /^\d+\./.test(l.trim()))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3)

  return exercises.map((ex, i) => ({
    id: `c${i + 1}`,
    challengeType: 'write',
    challengeNumber: i + 1,
    challengeTitle: ex.slice(0, 60) + (ex.length > 60 ? '...' : ''),
    difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard',
    prompt: ex,
    code: `# Your implementation here\n`,
    output: '', status: 'idle', figureJson: null,
    testCode: `res = "Implement the function above to complete this challenge."`,
    hint: `Review the core functions in cell 1 and the concept explanations above.`,
  }))
}

// ── Quiz converter ─────────────────────────────────────────────────────────

function convertQuiz(quizJson) {
  return (quizJson.questions ?? []).map((q, i) => ({
    id: `q${i + 1}`,
    question: q.question,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  }))
}

// ── Tag extractor ──────────────────────────────────────────────────────────

function extractTags(slug, title, objectives) {
  const base = slug.split('-').filter(t => t.length > 2)
  const fromObjectives = objectives
    .join(' ')
    .toLowerCase()
    .match(/\b[a-z]{4,}\b/g) ?? []
  const extra = [...new Set(fromObjectives)]
    .filter(t => !['that', 'this', 'from', 'with', 'your', 'into', 'each', 'them'].includes(t))
    .slice(0, 6)
  return [...new Set([...base, ...extra])].slice(0, 10)
}

// ── Callout builder ────────────────────────────────────────────────────────

function buildCallouts(md, objectives) {
  const callouts = []

  // Sequencing callout
  const lessonNum = parseInt(md.title.match(/\d+/) ?? ['0'])
  callouts.push({
    type: 'sequencing',
    title: `Phase 1 — Math Foundations`,
    body: `**Learning objectives:**\n${objectives.map(o => `- ${o}`).join('\n')}`,
  })

  // Key takeaway from the problem section
  const problemBody = md.sections['The Problem'] ?? ''
  if (problemBody) {
    const firstSentence = problemBody.split('.')[0].trim()
    if (firstSentence.length > 20) {
      callouts.push({
        type: 'insight',
        title: 'Why this matters',
        body: firstSentence + '.',
      })
    }
  }

  // Key Terms as a reference callout (if section exists)
  const keyTerms = md.sections['Key Terms'] ?? ''
  if (keyTerms) {
    // Extract first 5 rows from the markdown table
    const tableRows = keyTerms
      .split('\n')
      .filter(l => l.startsWith('|') && !l.startsWith('| Term') && !l.startsWith('|---') && !l.startsWith('| ---'))
      .slice(0, 5)
      .map(l => {
        const cells = l.split('|').filter(Boolean).map(c => c.trim())
        return cells.length >= 2 ? `**${cells[0]}**: ${cells[1]}` : null
      })
      .filter(Boolean)

    if (tableRows.length > 0) {
      callouts.push({
        type: 'definition',
        title: 'Key Terms',
        body: tableRows.join('\n'),
      })
    }
  }

  return callouts
}

// ── JS file generator ──────────────────────────────────────────────────────

function generateLessonJs(lesson) {
  const { id, slug, order, title, subtitle, tags, hook, intuition, quiz } = lesson

  // We use JSON.stringify for all string values to get proper escaping
  const s = JSON.stringify

  const proseLines = intuition.prose
    .map(p => `    ${s(p)},`)
    .join('\n')

  const calloutLines = intuition.callouts
    .map(c => `      ${JSON.stringify(c, null, 0)},`)
    .join('\n')

  const quizLines = quiz
    .map(q => `    ${JSON.stringify(q, null, 0)},`)
    .join('\n')

  const cells = intuition.cells

  const cellLines = cells.map(cell => {
    if (cell.id.toString().startsWith('c')) {
      // Challenge cell
      return `            {
              id: ${s(cell.id)},
              challengeType: 'write',
              challengeNumber: ${cell.challengeNumber},
              challengeTitle: ${s(cell.challengeTitle)},
              difficulty: ${s(cell.difficulty)},
              prompt: ${s(cell.prompt)},
              code: ${s(cell.code)},
              output: '', status: 'idle', figureJson: null,
              testCode: ${s(cell.testCode)},
              hint: ${s(cell.hint)},
            }`
    }
    const proseArr = (cell.prose ?? []).map(p => `                ${s(p)},`).join('\n')
    return `            {
              id: ${cell.id},
              cellTitle: ${s(cell.cellTitle)},
              prose: [
${proseArr}
              ],
              code: ${s(cell.code)},
              output: '', status: 'idle', figureJson: null,
            }`
  }).join(',\n')

  return `export default {
  id: ${s(id)},
  slug: ${s(slug)},
  chapter: 'ae-p1',
  order: ${order},
  title: ${s(title)},
  subtitle: ${s(subtitle)},
  tags: ${JSON.stringify(tags)},

  hook: {
    question: ${s(hook.question)},
    realWorldContext: ${s(hook.realWorldContext)},
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
${proseLines}
    ],
    callouts: [
${calloutLines}
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: ${s(title)},
        mathBridge: ${s(intuition.mathBridge)},
        caption: ${s(intuition.caption)},
        props: {
          initialCells: [
${cellLines}
          ],
        },
      },
    ],
  },

  quiz: [
${quizLines}
  ],
}
`
}

// ── Main ───────────────────────────────────────────────────────────────────

function portLesson(entry, order) {
  const dir = path.join(SOURCE, entry.folder)
  const mdPath = path.join(dir, 'docs/en.md')
  const quizPath = path.join(dir, 'quiz.json')
  const codeDir = path.join(dir, 'code')

  if (!fs.existsSync(mdPath)) {
    console.warn(`  ⚠ No docs/en.md for ${entry.folder}, skipping`)
    return null
  }

  const raw = fs.readFileSync(mdPath, 'utf-8')
  const md = parseMd(raw)

  const quizRaw = fs.existsSync(quizPath)
    ? JSON.parse(fs.readFileSync(quizPath, 'utf-8'))
    : { questions: [] }

  // Find Python source file
  let pySource = ''
  if (fs.existsSync(codeDir)) {
    const pyFiles = fs.readdirSync(codeDir).filter(f => f.endsWith('.py'))
    if (pyFiles.length > 0) {
      pySource = fs.readFileSync(path.join(codeDir, pyFiles[0]), 'utf-8')
    }
  }

  // Parse concept section
  const conceptBody = md.sections['The Concept'] ?? ''
  const { intro: conceptIntro, subsections } = parseConcept(conceptBody)

  // Build prose array — each ### subsection is one prose entry
  const allProseEntries = []
  const allVizCallouts = []

  // Intro text of The Concept (before first ###)
  if (conceptIntro.trim()) {
    const { cleaned, callouts } = extractVizPlaceholders(conceptIntro)
    if (cleaned) allProseEntries.push(cleaned)
    allVizCallouts.push(...callouts)
  }

  // Each subsection
  for (const sub of subsections) {
    const rawProse = subsectionToProse(sub.heading, sub.body)
    const { cleaned, callouts } = extractVizPlaceholders(rawProse)
    if (cleaned) allProseEntries.push(cleaned)
    allVizCallouts.push(...callouts)
  }

  // Also include ## Use It as a prose entry if present
  const useItBody = md.sections['Use It'] ?? md.sections['Use it'] ?? ''
  if (useItBody) {
    const { cleaned, callouts } = extractVizPlaceholders(`**Using this in practice**\n\n${useItBody}`)
    if (cleaned) allProseEntries.push(cleaned)
    allVizCallouts.push(...callouts)
  }

  // Build callouts: sequencing + insights + key terms + viz placeholders
  const callouts = buildCallouts(md, md.objectives)
  callouts.push(...allVizCallouts)

  // Build notebook cells
  const teachingCells = pySource ? buildNotebookCells(pySource, md.title) : []
  const exercisesBody = md.sections['Exercises'] ?? ''
  const challengeCells = buildChallengeCells(exercisesBody)
  const allCells = [...teachingCells, ...challengeCells]

  // Hook question: first learning objective or synthesize from tagline
  const hookQuestion = md.objectives[0]
    ?? `What is ${md.title.toLowerCase()} and why does it matter for AI?`

  // Math bridge: a brief formula summary from concept
  const mathBridge = subsections.length > 0
    ? `Key concepts: ${subsections.slice(0, 3).map(s => s.heading).join(', ')}.`
    : md.subtitle

  const lesson = {
    id: `ae-p1-${entry.num}-${entry.slug}`,
    slug: entry.slug,
    order,
    title: md.title,
    subtitle: md.subtitle || `${md.title} for AI engineering`,
    tags: extractTags(entry.slug, md.title, md.objectives),
    hook: {
      question: hookQuestion,
      realWorldContext: (md.sections['The Problem'] ?? '').trim(),
    },
    intuition: {
      prose: allProseEntries,
      callouts,
      mathBridge,
      caption: `Build every concept from scratch in Python.`,
      cells: allCells,
    },
    quiz: convertQuiz(quizRaw),
  }

  return lesson
}

function generateIndexJs(lessonEntries) {
  const imports = lessonEntries
    .map(e => `import lesson${e.num} from './${e.filename}'`)
    .join('\n')

  const lessonList = lessonEntries.map(e => `    lesson${e.num},`).join('\n')

  return `${imports}

export default [
  {
    number: 'ae-p1',
    title: 'Math Foundations',
    course: 'ai-engineering',
    lessons: [
${lessonList}
    ],
  },
]
`
}

// ── Run ────────────────────────────────────────────────────────────────────

console.log('Porting AI Engineering Phase 1 lessons...\n')

const lessonEntries = []
let order = 0

for (const entry of LESSONS) {
  process.stdout.write(`  [${entry.num}] ${entry.folder}... `)
  try {
    const lesson = portLesson(entry, order)
    if (!lesson) continue

    const filename = `ae1-${entry.num}-${entry.slug}.js`
    const outPath = path.join(TARGET, filename)
    fs.writeFileSync(outPath, generateLessonJs(lesson), 'utf-8')
    lessonEntries.push({ ...entry, filename })
    order++
    console.log('✓')
  } catch (err) {
    console.log(`ERROR: ${err.message}`)
    console.error(err.stack)
  }
}

// Write index.js
const indexPath = path.join(TARGET, 'index.js')
fs.writeFileSync(indexPath, generateIndexJs(lessonEntries), 'utf-8')
console.log('\n✓ index.js written')
console.log(`\nDone. ${lessonEntries.length}/22 lessons ported to ${TARGET}`)
