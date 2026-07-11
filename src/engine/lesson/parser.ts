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

interface Fence { lang: string; code: string; raw: string }

function extractFences(text: string): { fences: Fence[]; prose: string } {
  const fences: Fence[] = []
  const prose = text.replace(/```(\w*)\n([\s\S]*?)```/g, (raw, lang, code) => {
    fences.push({ lang: lang || 'plaintext', code: code.replace(/\n$/, ''), raw })
    return ''
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

function buildStep(raw: string, idx: number): LessonStep {
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
      challenge = { lang: fences[i - 1]?.lang ?? 'python', code: f.code }
      // infer lang from the challenge fence name or nearest prior example
    } else if (f.lang === 'test') {
      tests = f.code
    } else {
      examples.push({ lang: f.lang, code: f.code })
    }
  }

  // If challenge has no lang, inherit from examples in this step
  if (challenge && challenge.lang === 'python' && examples.length > 0) {
    challenge = { ...challenge, lang: examples[examples.length - 1].lang }
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

  for (let i = 0; i < rawSteps.length; i++) {
    const chunk = rawSteps[i].trim()
    if (chunk.startsWith('## ')) {
      steps.push(buildStep(chunk, i))
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
