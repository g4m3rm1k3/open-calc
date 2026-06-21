// Connects a stated goal to courses that ALREADY EXIST in this app — no AI,
// no invented recommendation. Two tiers, both deterministic:
//
// 1. Direct match — the goal text shares real words with a course's label/
//    description/key. Handles "learn linear algebra" -> the Linear Algebra
//    course directly, since its own description already contains the words.
// 2. Curated broad-term table — career/umbrella phrasings ("software
//    engineering", "data science") share zero keyword overlap with specific
//    course titles ("javascript", "git"), so tier 1 alone finds nothing for
//    them. This is a small, hand-written mapping — same "curate, don't
//    invent" discipline as playbooks.ts — not an attempt to cover every
//    possible phrasing. No match here just means no recommendation shown,
//    which is honest; it never fakes a connection.
//
// See buildplan.md "What is the purpose of the app otherwise" — this is
// the piece that makes Compass specific to THIS app instead of a generic
// goal tracker: it can point at real lessons with real progress tracking
// (ProgressContext) instead of generic external advice.
import { COURSES } from '../../courses/index.js'

interface Course {
  key: string
  label: string
  description: string
  icon: string
  domain: string
  path: string
}

const STOPWORDS = new Set(['a', 'an', 'the', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'i', 'want', 'learn', 'master', 'study', 'understand', 'become', 'be'])

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9+]+/).filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

// Broad career/umbrella terms -> real course keys in this app. Curated, not
// exhaustive — add an entry when a real gap is found, never guess broadly.
const BROAD_TERMS: { match: RegExp; courseKeys: string[] }[] = [
  { match: /software (engineer|engineering|developer)|\bprogrammer\b|\bcoding\b/, courseKeys: ['data-structures-and-algorithms', 'javascript', 'python', 'git', 'command-line-interface'] },
  { match: /web develop(er|ment)|front[- ]?end|full[- ]?stack/, courseKeys: ['javascript', 'web', 'git', 'design'] },
  { match: /data scien(ce|tist)|machine learning|\bml\b/, courseKeys: ['python', 'applied-statistics', 'data-science', 'sql'] },
  { match: /\bai\b|artificial intelligence|llm/, courseKeys: ['ai-engineering', 'python', 'applied-statistics'] },
  { match: /electr(ical|onics?) (engineer|engineering)?/, courseKeys: ['electronics', 'digital-fundamentals', 'programmable-logic-controllers'] },
  { match: /\bmath(ematics)?\b/, courseKeys: ['linear-algebra', 'calculus', 'precalculus', 'discrete-math', 'geometry'] },
  { match: /cnc|machinist|manufactur/, courseKeys: ['cnc', 'gcode-parser'] },
]

function directMatches(title: string): Course[] {
  const goalTokens = new Set(tokenize(title))
  if (goalTokens.size === 0) return []
  return (COURSES as Course[]).filter((c) => {
    const courseTokens = tokenize(`${c.key} ${c.label} ${c.description}`)
    return courseTokens.some((t) => goalTokens.has(t))
  })
}

function broadTermMatches(title: string): Course[] {
  const rule = BROAD_TERMS.find((r) => r.match.test(title))
  if (!rule) return []
  return rule.courseKeys.map((key) => (COURSES as Course[]).find((c) => c.key === key)).filter((c): c is Course => !!c)
}

/** Deterministic, no AI. Empty array is an honest "no real match found." */
export function matchCourses(title: string): Course[] {
  const direct = directMatches(title)
  const broad = broadTermMatches(title)
  const seen = new Set<string>()
  const merged: Course[] = []
  for (const c of [...direct, ...broad]) {
    if (seen.has(c.key)) continue
    seen.add(c.key)
    merged.push(c)
  }
  return merged.slice(0, 6)
}
