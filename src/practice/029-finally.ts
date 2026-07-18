import type { PracticeChallenge } from './loader'

export const title = 'finally'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runWithFinally(fn)` returning `{ result, cleanedUp }` — `cleanedUp` must become `true` in a `finally` block regardless of whether `fn()` throws; `result` is `fn()`\'s return value, or `null` if it threw.',
        starter: '',
        tests: `
const ok = runWithFinally(() => 42)
assert ok.result === 42
assert ok.cleanedUp === true
const bad = runWithFinally(() => { throw new Error('x'); })
assert bad.result === null
assert bad.cleanedUp === true
`,
        solution: 'function runWithFinally(fn) { let result = null; let cleanedUp = false; try { result = fn(); } catch (e) { result = null; } finally { cleanedUp = true; } return { result, cleanedUp }; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `countAttempts(fn)` so it returns `fn()`\'s result, using `try`/`finally` so cleanup logic runs even if `fn` throws.',
        starter: 'function countAttempts(fn) {\n  // TODO: increment attempts before AND after (in finally), return fn() result\n}',
        tests: `
assert countAttempts(() => 'done') === 'done'
`,
        solution: 'function countAttempts(fn) { let attempts = 0; try { attempts++; return fn(); } finally { attempts++; } }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `withLock(log, fn)` that pushes `"locked"` onto `log`, calls `fn()`, and — via `finally` — ALWAYS pushes `"unlocked"` afterward, even if `fn()` throws (the exception should still propagate to the caller).',
        starter: '',
        tests: `
const log = []
let result
try { result = withLock(log, () => { throw new Error("boom"); }); } catch (e) { result = "caught: " + e.message; }
assert JSON.stringify(log) === JSON.stringify(["locked","unlocked"])
assert result === "caught: boom"
`,
        solution: 'function withLock(log, fn) { log.push("locked"); try { return fn(); } finally { log.push("unlocked"); } }',
      },
    ],
  },
]

export default challenges
