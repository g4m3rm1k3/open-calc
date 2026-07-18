import type { PracticeChallenge } from './loader'

export const title = 'Operator Precedence'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `calc1()` that returns the value of `2 + 3 * 4` (relying on multiplication\'s higher precedence, no parentheses).',
        starter: '',
        tests: `
assert calc1() === 14
`,
        solution: 'function calc1() { return 2 + 3 * 4; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `withParens(a, b, c)` so it returns `(a + b) * c` — using parentheses to override default precedence.',
        starter: 'function withParens(a, b, c) {\n  // TODO: return (a + b) * c\n}',
        tests: `
assert withParens(1, 2, 3) === 9
assert withParens(0, 0, 5) === 0
`,
        solution: 'function withParens(a, b, c) { return (a + b) * c; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `precedenceQuiz(a, b, c, d)` that returns `a + b * c - d / 2`, relying purely on standard operator precedence (no parentheses).',
        starter: '',
        tests: `
assert precedenceQuiz(1, 2, 3, 4) === 5
assert precedenceQuiz(0, 0, 0, 0) === 0
`,
        solution: 'function precedenceQuiz(a, b, c, d) { return a + b * c - d / 2; }',
      },
    ],
  },
]

export default challenges
