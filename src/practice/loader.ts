// App-wide practice library — challenges are their own effort, independent from
// src/concepts/ (no shared id scheme, no shared contract). A practice file gets a
// display `title` of its own; its filename only needs to be a unique key, numbered
// in whatever order the topics were authored in. Each concept gets up to 3 levels,
// and each level ships one variant per language it supports — verified against the
// exact same test-running engine lessons already use (testRunner.ts's
// `assert ...`-line format / the `-program` stdout-grading path), so nothing new
// had to be built to grade a submission, only to browse and present one across
// several languages at once.

export interface ChallengeVariant {
  /** Plain lang id ('javascript', 'python', 'java', 'csharp', 'cpp') routes to the
   *  per-assertion test harness. A '-program' suffix (e.g. 'python-program') grades
   *  the learner's whole-program stdout instead — for concepts with no natural
   *  function signature to call (e.g. "What is a Program?", "Statements"). */
  lang: string
  /** One line stating the task for THIS language — phrasing/identifier casing may
   *  legitimately differ per language (camelCase vs PascalCase, etc). */
  prompt: string
  /** '' (or omitted) means a bare/blank-slate challenge — write it from scratch.
   *  Non-empty means "finish this implementation" — the tests' assert lines (or
   *  the program's expected stdout) must exercise exactly what the starter declares. */
  starter?: string
  /** Raw assert-line test source (or, for '-program' challenges, plain JS assertions
   *  against a bound `output` string) — identical format to LessonStep.tests. Must
   *  NOT redeclare the function under test — buildJSHarness/etc. append these lines
   *  after the user's own code, so a stub here would silently shadow a correct
   *  submission instead of testing it. */
  tests: string
  /** A known-correct submission for this variant — never shown to learners. Exists
   *  purely so tooling can verify `tests` actually passes a valid answer (and, for
   *  non-blank starters, that the starter alone does NOT already pass it). */
  solution: string
}

export interface PracticeChallenge {
  level: 1 | 2 | 3
  variants: ChallengeVariant[]
}

export interface PracticeFile {
  id: string
  title: string
  challenges: PracticeChallenge[]
}

const RAW_MODULES = import.meta.glob('./*.ts', { eager: true }) as Record<string, { default: PracticeChallenge[]; title?: string }>

const PRACTICE: Record<string, PracticeFile> = {}
for (const [path, mod] of Object.entries(RAW_MODULES)) {
  if (path.endsWith('/loader.ts')) continue
  const id = path.replace(/^\.\//, '').replace(/\.ts$/, '')
  const challenges = [...(mod.default ?? [])].sort((a, b) => a.level - b.level)
  if (challenges.length > 0) PRACTICE[id] = { id, title: mod.title ?? id, challenges }
}

export function getPracticeFile(id: string): PracticeFile | null {
  return PRACTICE[id] ?? null
}

export function getAvailablePracticeIds(): string[] {
  return Object.keys(PRACTICE)
}
