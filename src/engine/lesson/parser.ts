import type { ParsedLesson, LessonStep, CodeSnippet } from './types'

// ── Frontmatter ───────────────────────────────────────────────────────────────

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

// ── Code fence extraction ─────────────────────────────────────────────────────

interface Fence { lang: string; code: string; raw: string; info: string }

// Only these langs are extracted as runnable examples or special blocks.
// All other fences (text, plaintext, no lang) stay in the prose for markdown rendering.
const RUNNABLE_LANGS = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
  'html', 'css',
  'sql', 'sqlite',
  'bash', 'shell', 'sh',
  'c', 'cpp', 'c++',
  'csharp', 'cs',
  'java',
])
const SPECIAL_LANGS  = new Set(['challenge', 'test'])

function extractFences(text: string): { fences: Fence[]; prose: string } {
  const fences: Fence[] = []
  const prose = text.replace(/```([^\n`]*)\n([\s\S]*?)```/g, (raw, lang, code) => {
    const info = (lang || '').trim()
    const l = (info || 'plaintext').split(/\s+/)[0].toLowerCase()
    if (RUNNABLE_LANGS.has(l) || SPECIAL_LANGS.has(l)) {
      fences.push({ lang: l, code: code.replace(/\n$/, ''), raw, info })
      return ''   // remove from prose — rendered by RunExample / ChallengeStep
    }
    return raw    // keep in prose — rendered as display-only by ReactMarkdown
  }).replace(/\n{3,}/g, '\n\n').trim()
  return { fences, prose }
}

// ── Lens extraction ───────────────────────────────────────────────────────────

function extractLenses(prose: string): { prose: string; lenses: { cs?: string; se?: string } } {
  const lenses: { cs?: string; se?: string } = {}
  const paragraphs = prose.split(/\n\n+/)
  const remaining: string[] = []
  for (const para of paragraphs) {
    const t = para.trim()
    if (t.startsWith('**CS lens:**')) {
      lenses.cs = t.replace(/^\*\*CS lens:\*\*\s*/, '').trim()
    } else if (t.startsWith('**SE lens:**')) {
      lenses.se = t.replace(/^\*\*SE lens:\*\*\s*/, '').trim()
    } else {
      remaining.push(para)
    }
  }
  return { prose: remaining.join('\n\n').trim(), lenses }
}

// ── Step builder ──────────────────────────────────────────────────────────────

// Langs that should not be inferred as challenge lang — they're context/display fences
const NON_CHALLENGE_LANGS = new Set(['html', 'text', 'plaintext'])

function buildStep(raw: string, idx: number, metaLang: string): LessonStep {
  const lines = raw.split('\n')
  const titleLine = lines[0] ?? ''
  const title = titleLine.replace(/^##\s*/, '').trim()
  const body = lines.slice(1).join('\n')

  const { fences, prose: rawProse } = extractFences(body)
  const { prose, lenses } = extractLenses(rawProse)

  const examples: CodeSnippet[] = []
  let challenge: CodeSnippet | null = null
  let tests: string | null = null

  for (let i = 0; i < fences.length; i++) {
    const f = fences[i]
    if (f.lang === 'challenge') {
      // Explicit language wins: ```challenge javascript```. Written the same way every
      // other fence declares its language, and it's the only reliable way to grade a
      // scenario-style challenge (e.g. a JS quiz object inside a bash-topic lesson) —
      // inferring from context guesses wrong in exactly that case.
      const explicit = f.info.split(/\s+/)[1]?.toLowerCase()
      // Otherwise infer lang from the previous runnable fence, skipping display/context
      // fences. Fall back to the lesson's meta.lang so CSS challenges get lang:'css'
      // even when the previous fence is the HTML structure context.
      const prev = fences[i - 1]?.lang
      const inferredLang = explicit || ((prev && !NON_CHALLENGE_LANGS.has(prev)) ? prev : metaLang)
      challenge = { lang: inferredLang, code: f.code }
    } else if (f.lang === 'test') {
      tests = f.code
    } else {
      examples.push({ lang: f.lang, code: f.code })
    }
  }

  return { id: `step-${idx}`, title, prose, lenses, examples, challenge, tests }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseLesson(markdown: string): ParsedLesson {
  const { meta, body } = parseFrontmatter(markdown)

  // Split on ## headers — keep delimiter on each chunk
  const rawSteps = body.split(/(?=^## )/m).filter(s => s.trim())

  // If first chunk has no ## it's the intro prose (under the # title)
  const steps: LessonStep[] = []
  let introProse = ''

  const metaLang = meta.lang ?? 'python'

  for (let i = 0; i < rawSteps.length; i++) {
    const chunk = rawSteps[i].trim()
    if (chunk.startsWith('## ')) {
      steps.push(buildStep(chunk, i, metaLang))
    } else {
      // intro section — extract the # title and remaining prose
      introProse = chunk.replace(/^#[^#][^\n]*\n?/, '').trim()
    }
  }

  // Title: from frontmatter, or first # heading in body
  const titleFromBody = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? 'Lesson'
  const title = meta.title ?? titleFromBody

  // Merge intro prose into the first step so there's no thin intro-only step
  if (introProse && steps.length > 0) {
    steps[0] = { ...steps[0], prose: introProse + (steps[0].prose ? '\n\n' + steps[0].prose : '') }
  } else if (introProse) {
    steps.unshift({ id: 'step-intro', title: '', prose: introProse, examples: [], challenge: null, tests: null })
  }

  return {
    title,
    series: meta.series ?? 'unknown',
    level: parseInt(meta.level ?? '0', 10),
    topic: meta.topic,
    lang: meta.lang ?? 'python',
    steps,
  }
}
