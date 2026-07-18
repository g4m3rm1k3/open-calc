import type { PracticeChallenge } from './loader'

export const title = 'Git Hooks'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runPreCommitHook(lintErrors)` (non-zero `exitCode` if `lintErrors` is non-empty, `aborted` reflects that) and `attemptCommit(message, lintErrors)` (blocks the commit — `{ committed: false, ... }` — if the hook aborted, otherwise `{ committed: true, message }`).',
        starter: '',
        tests: `
const blocked = attemptCommit('add feature', ['missing semicolon on line 12'])
assert blocked.committed === false
const allowed = attemptCommit('add feature', [])
assert allowed.committed === true
assert allowed.message === 'add feature'
`,
        solution: `function runPreCommitHook(lintErrors) {
  const exitCode = lintErrors.length > 0 ? 1 : 0
  return { exitCode, aborted: exitCode !== 0 }
}
function attemptCommit(message, lintErrors) {
  const hookResult = runPreCommitHook(lintErrors)
  if (hookResult.aborted) {
    return { committed: false, reason: 'pre-commit hook failed', exitCode: hookResult.exitCode }
  }
  return { committed: true, message }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `attemptCommit(message, hookResult)`: a hook\'s success or failure is determined ONLY by its exit code, never by what it printed. A hook that prints something scary but exits `0` must still allow the commit; a hook that exits non-zero must still block it, regardless of its output text.',
        starter: 'function runHook(exitCode, output) {\n  return { exitCode, output, aborted: exitCode !== 0 }\n}\nfunction attemptCommit(message, hookResult) {\n  // TODO: a hook\'s success/failure is determined ONLY by its exit code,\n  // never by what it printed — do not inspect hookResult.output at all\n  if (hookResult.output.includes(\'ERROR\')) return { committed: false, reason: \'pre-commit hook failed\' }\n  return { committed: true, message }\n}',
        tests: `
const misleadingHook = runHook(0, 'ERROR: something looks wrong')
assert attemptCommit('msg', misleadingHook).committed === true
const realFailure = runHook(1, 'all good')
assert attemptCommit('msg', realFailure).committed === false
`,
        solution: `function runHook(exitCode, output) {
  return { exitCode, output, aborted: exitCode !== 0 }
}
function attemptCommit(message, hookResult) {
  if (hookResult.aborted) return { committed: false, reason: 'pre-commit hook failed' }
  return { committed: true, message }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `simulateClone(hasInstallStep)` returning `{ hooksInstalled }`. A fresh clone NEVER has hooks active by default, even if the original repository used them — only an explicit install step brings hooks into a new clone.',
        starter: '',
        tests: `
assert simulateClone(false).hooksInstalled === false
assert simulateClone(true).hooksInstalled === true
`,
        solution: `function simulateClone(hasInstallStep) {
  const hooksFolder = []
  if (hasInstallStep) {
    hooksFolder.push('pre-commit')
  }
  return { hooksInstalled: hooksFolder.length > 0 }
}`,
      },
    ],
  },
]

export default challenges
