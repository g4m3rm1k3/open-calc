// App-wide concept library — one markdown file per concept, reusable by any course
// or lesson in the app. A concept file has generic prose (explanation, CS lens, SE
// lens) shared across every language, plus one fenced code example + walkthrough per
// language. This is a small, dedicated parser — not a reuse of
// src/engine/lesson/parser.ts, which is shaped around multi-step lessons with
// challenge/test fences, a shape concept files don't have.

export interface LanguageContent {
  lang: string
  example: string
  walkthrough: string | null
}

export interface ConceptFile {
  id: string
  name: string
  explanation: string
  csLens: string | null
  seLens: string | null
  languages: Record<string, LanguageContent>
}

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

export function parseConceptFile(raw: string, fallbackId: string): ConceptFile {
  const normalized = raw.replace(/\r\n/g, '\n')
  const { meta, body } = parseFrontmatter(normalized)
  const id = meta.concept || fallbackId
  const name = meta.name || fallbackId

  const fenceRe = /```(\w+)\n([\s\S]*?)```\n?/g
  const fences: { lang: string; code: string; start: number; end: number }[] = []
  let m: RegExpExecArray | null
  while ((m = fenceRe.exec(body))) {
    fences.push({ lang: m[1].toLowerCase(), code: m[2].replace(/\n$/, ''), start: m.index, end: fenceRe.lastIndex })
  }

  const genericEnd = fences.length ? fences[0].start : body.length
  const genericText = body.slice(0, genericEnd).trim()
  const paragraphs = genericText.split(/\n\n+/)
  let explanation = ''
  let csLens: string | null = null
  let seLens: string | null = null
  for (const para of paragraphs) {
    const t = para.trim()
    if (t.startsWith('**CS lens:**')) csLens = t.replace(/^\*\*CS lens:\*\*\s*/, '').trim()
    else if (t.startsWith('**SE lens:**')) seLens = t.replace(/^\*\*SE lens:\*\*\s*/, '').trim()
    else explanation += (explanation ? '\n\n' : '') + t
  }

  const languages: Record<string, LanguageContent> = {}
  for (let i = 0; i < fences.length; i++) {
    const f = fences[i]
    const nextStart = i + 1 < fences.length ? fences[i + 1].start : body.length
    const afterFenceText = body.slice(f.end, nextStart).trim()
    const firstPara = afterFenceText.split(/\n\n+/)[0]?.trim() ?? ''
    const walkthrough = firstPara.startsWith('Walkthrough:')
      ? firstPara.replace(/^Walkthrough:\s*/, '').trim()
      : null
    languages[f.lang] = { lang: f.lang, example: f.code, walkthrough }
  }

  return { id, name, explanation, csLens, seLens, languages }
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
