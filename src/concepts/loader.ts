// App-wide concept library — one markdown file per concept, reusable by any course
// or lesson in the app. Every concept is authored against a fixed set of teaching
// dimensions (not a free-form document) so the same shape scales from `slice()` up
// to dependency injection or parsers without changing structure:
//
//   Definition   — what is this?
//   Problem      — why does it exist?
//   Execution    — what actually happens when it runs (generic, language-agnostic;
//                  use this when the runtime model doesn't differ by language —
//                  for concepts where it genuinely does, per-language walkthroughs
//                  below carry that instead)
//   Computer Science / Software Engineering — short paragraph + a scannable tag
//                  list (e.g. "Object graphs, Directed graphs") naming where this
//                  connects, not just naming the concept itself
//   Common Mistakes — bullet list
//   Exercises       — bullet list, "try this yourself" prompts
//   <language>      — one section per language: a code fence + its walkthrough
//
// Sections are `## Header` blocks in the body (after frontmatter) — anything whose
// header isn't one of the fixed names above is treated as a language section.

export interface CodeExample {
  /** Null for the default single-example case. Set when a language section has
   *  more than one example — e.g. "✕ Swallows the error" / "✓ Rethrows with
   *  context" — via a `**Label:**` line immediately before that example's fence. */
  label: string | null
  code: string
  walkthrough: string | null
}

export interface LanguageContent {
  lang: string
  /** Almost always length 1. See CONCEPT_CONTRACT.md — "When a concept needs
   *  more than one example" — for when a second, contrasting example belongs here. */
  examples: CodeExample[]
}

export interface LensContent {
  text: string
  tags: string[]
}

export interface ConceptFile {
  id: string
  name: string
  definition: string
  problem: string | null
  execution: string | null
  cs: LensContent | null
  se: LensContent | null
  commonMistakes: string[]
  exercises: string[]
  languages: Record<string, LanguageContent>
  series: string | null
  seriesTitle: string | null
  part: number | null
}

const FIXED_SECTIONS = new Set([
  'definition', 'problem', 'execution',
  'computer science', 'software engineering',
  'common mistakes', 'exercises',
])

function parseFrontmatter(md: string): { meta: Record<string, string>; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {}, body: md }
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { meta, body: m[2] }
}

function parseBulletList(text: string): string[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2).trim())
}

function parseLens(text: string): LensContent {
  const tagLine = text.split('\n').find(l => l.trim().toLowerCase().startsWith('tags:'))
  const tags = tagLine ? tagLine.replace(/^\s*Tags:\s*/i, '').split(',').map(t => t.trim()).filter(Boolean) : []
  const body = tagLine ? text.replace(tagLine, '').trim() : text.trim()
  return { text: body, tags }
}

// Almost always matches exactly one fence. When a language section legitimately
// needs a second, contrasting example (a mistake vs. the fix — see
// CONCEPT_CONTRACT.md), each fence may be preceded by its own `**Label:**` line;
// everything between one example's fence and the next example's label line (or
// end of section) is that example's Walkthrough.
function parseLanguageSection(text: string): CodeExample[] {
  const examples: CodeExample[] = []
  const fenceRe = /```(\w+)\n([\s\S]*?)```\n?/g
  const labelRe = /\*\*(.+?):?\*\*\s*:?\s*$/
  let match: RegExpExecArray | null
  let cursor = 0
  while ((match = fenceRe.exec(text))) {
    const before = text.slice(cursor, match.index).trim()
    const labelMatch = before.match(labelRe)
    const label = labelMatch ? labelMatch[1].trim() : null
    const code = match[2].replace(/\n$/, '')
    cursor = fenceRe.lastIndex

    const nextFenceIdx = text.slice(cursor).search(/```/)
    const afterEnd = nextFenceIdx === -1 ? text.length : cursor + nextFenceIdx
    let after = text.slice(cursor, afterEnd).trim()
    const trailingLabelMatch = after.match(labelRe)
    if (trailingLabelMatch) after = after.slice(0, trailingLabelMatch.index).trim()
    const walkthrough = after.startsWith('Walkthrough:')
      ? after.replace(/^Walkthrough:\s*/, '').trim()
      : (after || null)

    examples.push({ label, code, walkthrough })
  }
  return examples
}

export function parseConceptFile(raw: string, fallbackId: string): ConceptFile {
  const normalized = raw.replace(/\r\n/g, '\n')
  const { meta, body } = parseFrontmatter(normalized)
  const id = meta.concept || fallbackId
  const name = meta.name || fallbackId

  const chunks = body.split(/(?=^## )/m).filter(s => s.trim())

  let definition = ''
  let problem: string | null = null
  let execution: string | null = null
  let cs: LensContent | null = null
  let se: LensContent | null = null
  let commonMistakes: string[] = []
  let exercises: string[] = []
  const languages: Record<string, LanguageContent> = {}

  for (const chunk of chunks) {
    const lines = chunk.split('\n')
    const header = lines[0].replace(/^##\s*/, '').trim()
    const headerKey = header.toLowerCase()
    const text = lines.slice(1).join('\n').trim()

    if (headerKey === 'definition') definition = text
    else if (headerKey === 'problem') problem = text
    else if (headerKey === 'execution') execution = text
    else if (headerKey === 'computer science') cs = parseLens(text)
    else if (headerKey === 'software engineering') se = parseLens(text)
    else if (headerKey === 'common mistakes') commonMistakes = parseBulletList(text)
    else if (headerKey === 'exercises') exercises = parseBulletList(text)
    else if (!FIXED_SECTIONS.has(headerKey)) {
      // Not a fixed section name — treat the header as a language key.
      const lang = headerKey.replace(/\s+/g, '')
      const examples = parseLanguageSection(text)
      if (examples.length) languages[lang] = { lang, examples }
    }
  }

  const series = meta.series || null
  const seriesTitle = meta.seriesTitle || null
  const part = meta.part ? parseInt(meta.part, 10) : null

  return { id, name, definition, problem, execution, cs, se, commonMistakes, exercises, languages, series, seriesTitle, part }
}

const CONCEPT_RAW_FILES = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const CONCEPTS: Record<string, ConceptFile> = {}
for (const [path, raw] of Object.entries(CONCEPT_RAW_FILES)) {
  const id = path.replace(/^\.\//, '').replace(/\.md$/, '')
  CONCEPTS[id] = parseConceptFile(raw, id)
}

export function getConceptFile(id: string): ConceptFile | null {
  return CONCEPTS[id] ?? null
}

export function getAvailableConceptIds(): string[] {
  return Object.keys(CONCEPTS)
}

/** All parts of a series, in order — null part numbers sort last. */
export function getConceptSeries(seriesId: string): ConceptFile[] {
  return Object.values(CONCEPTS)
    .filter(c => c.series === seriesId)
    .sort((a, b) => (a.part ?? Infinity) - (b.part ?? Infinity))
}
