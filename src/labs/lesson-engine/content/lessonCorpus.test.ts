// Corpus-wide checks that turn UPSKILLOS_CURRICULUM_CONTRACT.md rules into automated tests.
// These check structure and wiring, not teaching quality (prose quality, whether an
// explanation truly answers WHY, whether an example's output is correct — those still
// need a human or a much heavier check that actually executes each example).
//
// Known state as of writing: this suite is expected to FAIL on real, pre-existing
// content bugs (sql-fundamentals challenge fences, cpp/csharp/java test fences the
// engine can't grade, the assertion-count spread, the orphaned vue-fundamentals
// series). That is the point — it turns "found by manual audit" into "found by CI."

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseLesson } from '../../../engine/lesson/parser'
import { SERIES } from '../series'

const CONTENT_DIR = dirname(fileURLToPath(import.meta.url))
const LAB_DIR = join(CONTENT_DIR, '..')
const LESSON_ENGINE_LAB_SRC = readFileSync(join(LAB_DIR, 'LessonEngineLab.tsx'), 'utf-8')

// ── Discover all lesson files on disk ───────────────────────────────────────────

function findMarkdownFiles(dir: string, base = dir): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      out.push(...findMarkdownFiles(join(dir, entry.name), base))
    } else if (entry.name.endsWith('.md')) {
      out.push(join(dir, entry.name).slice(base.length + 1).replace(/\\/g, '/'))
    }
  }
  return out
}

const filesOnDisk = findMarkdownFiles(CONTENT_DIR).sort()

const registeredFiles = SERIES.flatMap(s => s.levels.map(l => l.file)).sort()

// LessonEngineLab.tsx imports each file as `import xyz from './content/<path>?raw'`
// and separately registers it in a lookup keyed by the same `<path>`. Both must exist
// for a lesson to actually be openable in the running app.
const importedPaths = new Set(
  [...LESSON_ENGINE_LAB_SRC.matchAll(/from '\.\/content\/([^']+)\?raw'/g)].map(m => m[1])
)
const registeredLookupPaths = new Set(
  [...LESSON_ENGINE_LAB_SRC.matchAll(/'([a-zA-Z0-9_-]+\/level-\d+\.md)':\s*\w+/g)].map(m => m[1])
)

// ── Wiring parity ────────────────────────────────────────────────────────────────

describe('lesson corpus — wiring parity', () => {
  it('every file on disk is registered in series.ts (no orphaned content)', () => {
    const orphaned = filesOnDisk.filter(f => !registeredFiles.includes(f))
    expect(orphaned, `Files on disk with no series.ts entry — unreachable in the app:\n${orphaned.join('\n')}`).toEqual([])
  })

  it('every series.ts entry has a file on disk', () => {
    const missing = registeredFiles.filter(f => !filesOnDisk.includes(f))
    expect(missing, `series.ts references files that do not exist on disk:\n${missing.join('\n')}`).toEqual([])
  })

  it('every series.ts entry is imported in LessonEngineLab.tsx', () => {
    const missing = registeredFiles.filter(f => !importedPaths.has(f))
    expect(missing, `series.ts entries with no '?raw' import in LessonEngineLab.tsx — unopenable in the app:\n${missing.join('\n')}`).toEqual([])
  })

  it('every series.ts entry is registered in the LessonEngineLab.tsx lookup map', () => {
    const missing = registeredFiles.filter(f => !registeredLookupPaths.has(f))
    expect(missing, `series.ts entries imported but not wired into the lookup map:\n${missing.join('\n')}`).toEqual([])
  })
})

// ── Per-lesson structural checks (UPSKILLOS_CURRICULUM_CONTRACT.md, Part 3) ────────

const SUPPORTED_TEST_LANGS = new Set(['python', 'py', 'javascript', 'js', 'typescript', 'ts', 'css', 'jsx', 'react', 'vue', 'sql', 'sqlite', 'cpp', 'c', 'c++', 'cpp-program', 'csharp', 'cs', 'c#', 'java'])
const KNOWN_UNSUPPORTED_TEST_LANGS = new Set(['bash', 'shell', 'sh'])

describe.each(registeredFiles.filter(f => filesOnDisk.includes(f)))('lesson: %s', file => {
  // Vite's `?raw` loader does NOT normalize CRLF to LF (an earlier assumption here
  // was wrong and masked a real bug — see parseLesson's own normalization, which is
  // now the actual fix). Match fs.readFileSync to what parseLesson does internally.
  const raw = readFileSync(join(CONTENT_DIR, file), 'utf-8').replace(/\r\n/g, '\n')
  const lesson = parseLesson(raw)

  it('has required frontmatter fields', () => {
    expect(lesson.series).not.toBe('unknown')
    expect(lesson.title).toBeTruthy()
    expect(lesson.lang).toBeTruthy()
  })

  it('frontmatter series id matches a registered series', () => {
    expect(SERIES.some(s => s.id === lesson.series)).toBe(true)
  })

  for (const step of lesson.steps) {
    const stepLabel = step.title || '(intro)'

    it(`step "${stepLabel}": has a challenge fence whenever it has a test fence`, () => {
      if (step.tests !== null) {
        expect(step.challenge, 'a ```test fence with no ```challenge fence cannot grade anything — check the fence is literally tagged ```challenge, not the language name').not.toBeNull()
      }
    })

    if (step.tests !== null && step.challenge !== null) {
      const rawLang = step.challenge.lang.toLowerCase()
      // `<lang>-program` challenges (runProgramOutputTest) grade captured stdout with
      // plain JS assertions, same shape as every other supported language once the
      // `-program` suffix is stripped for this check.
      const intendedLang = rawLang.endsWith('-program') ? rawLang.slice(0, -'-program'.length) : rawLang

      it(`step "${stepLabel}": test fence only present for a language the engine can grade`, () => {
        if (KNOWN_UNSUPPORTED_TEST_LANGS.has(intendedLang)) {
          throw new Error(
            `lang '${rawLang}' has no working test harness (see UPSKILLOS_CURRICULUM_CONTRACT.md Part 4). ` +
            `Remove the test fence or wait for engine support before shipping this challenge.`
          )
        }
      })

      if (SUPPORTED_TEST_LANGS.has(intendedLang)) {
        const assertionLines = step.tests
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.startsWith('assert '))

        it(`step "${stepLabel}": has 4-6 assertions`, () => {
          expect(assertionLines.length, `found ${assertionLines.length} assertions:\n${step.tests}`).toBeGreaterThanOrEqual(4)
          expect(assertionLines.length, `found ${assertionLines.length} assertions:\n${step.tests}`).toBeLessThanOrEqual(6)
        })
      }

      // Language inference (see UPSKILLOS_CURRICULUM_CONTRACT.md Part 3) can land on a
      // technically-"supported" language that still doesn't match the challenge's real
      // content — e.g. a JS scenario-quiz object inferred as `css` because the lesson's
      // own frontmatter lang is css. That's not caught by the checks above (css IS
      // supported) and routes the getComputedStyle harness at plain JS, which is a
      // silent no-op, not an error. This is deliberately narrow — only JS declaration
      // keywords a real CSS rule could never start with, chosen to avoid false
      // positives on legitimate CSS (`#id { }`, `.class { }`, `:root { }` etc.).
      if (intendedLang === 'css') {
        const firstLine = step.challenge.code.split('\n').find(l => l.trim())?.trim() ?? ''
        it(`step "${stepLabel}": css challenge content is not actually a JS object/function`, () => {
          expect(firstLine, `challenge is tagged css but starts with JS syntax:\n${firstLine}`)
            .not.toMatch(/^(const |let |var |function |async function )/)
        })
      }
    }

    it(`step "${stepLabel}": is not a mix of concept examples and a challenge (never both)`, () => {
      const hasRunnableExample = step.examples.some(e =>
        !['html', 'text', 'plaintext'].includes(e.lang.toLowerCase())
      )
      if (step.challenge !== null) {
        expect(hasRunnableExample, 'a step with a challenge should not also carry a runnable (non-context) example — split into two steps').toBe(false)
      }
    })
  }
})
