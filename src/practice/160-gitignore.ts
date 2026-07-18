import type { PracticeChallenge } from './loader'

export const title = '.gitignore'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `matchesIgnorePattern(filename, patterns)` (a trailing-`/` pattern matches by prefix, directory-style; otherwise exact match) and `gitStatus(allFiles, ignorePatterns, alreadyTracked)` returning only files that are either already tracked or don\'t match any ignore pattern.',
        starter: '',
        tests: `
const allFiles = ['index.js', 'node_modules/react.js', '.env', 'dist/bundle.js']
const ignorePatterns = ['node_modules/', '.env', 'dist/']
assert JSON.stringify(gitStatus(allFiles, ignorePatterns, new Set())) === JSON.stringify(['index.js'])
`,
        solution: `function matchesIgnorePattern(filename, patterns) {
  return patterns.some(pattern => {
    if (pattern.endsWith('/')) return filename.startsWith(pattern)
    return filename === pattern
  })
}
function gitStatus(allFiles, ignorePatterns, alreadyTracked) {
  return allFiles.filter(f => alreadyTracked.has(f) || !matchesIgnorePattern(f, ignorePatterns))
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `gitStatus`: a file that\'s ALREADY tracked must still show up, even if it matches an ignore pattern — `.gitignore` never retroactively untracks a file that was committed before being added to it.',
        starter: 'function matchesIgnorePattern(filename, patterns) {\n  return patterns.some(pattern => {\n    if (pattern.endsWith(\'/\')) return filename.startsWith(pattern)\n    return filename === pattern\n  })\n}\nfunction gitStatus(allFiles, ignorePatterns, alreadyTracked) {\n  // TODO: a file that\'s ALREADY tracked must still show up, even if it\n  // matches an ignore pattern — .gitignore never retroactively untracks\n  // a file that was committed before being added to it\n  return allFiles.filter(f => !matchesIgnorePattern(f, ignorePatterns))\n}',
        tests: `
const allFiles = ['index.js', '.env']
const ignorePatterns = ['.env']
const alreadyTracked = new Set(['.env'])
assert JSON.stringify(gitStatus(allFiles, ignorePatterns, alreadyTracked).sort()) === JSON.stringify(['.env','index.js'])
`,
        solution: `function matchesIgnorePattern(filename, patterns) {
  return patterns.some(pattern => {
    if (pattern.endsWith('/')) return filename.startsWith(pattern)
    return filename === pattern
  })
}
function gitStatus(allFiles, ignorePatterns, alreadyTracked) {
  return allFiles.filter(f => alreadyTracked.has(f) || !matchesIgnorePattern(f, ignorePatterns))
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `untrackFile(alreadyTracked, filename)` removing `filename` from the `alreadyTracked` set — the extra explicit step actually needed before `.gitignore` takes effect for a file that was already tracked.',
        starter: '',
        tests: `
const allFiles = ['index.js', '.env']
const ignorePatterns = ['.env']
const alreadyTracked = new Set(['.env'])
assert gitStatus(allFiles, ignorePatterns, alreadyTracked).includes('.env') === true
assert (untrackFile(alreadyTracked, '.env'), true)
assert gitStatus(allFiles, ignorePatterns, alreadyTracked).includes('.env') === false
`,
        solution: `function matchesIgnorePattern(filename, patterns) {
  return patterns.some(pattern => {
    if (pattern.endsWith('/')) return filename.startsWith(pattern)
    return filename === pattern
  })
}
function gitStatus(allFiles, ignorePatterns, alreadyTracked) {
  return allFiles.filter(f => alreadyTracked.has(f) || !matchesIgnorePattern(f, ignorePatterns))
}
function untrackFile(alreadyTracked, filename) {
  alreadyTracked.delete(filename)
}`,
      },
    ],
  },
]

export default challenges
