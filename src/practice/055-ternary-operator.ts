import type { PracticeChallenge } from './loader'

export const title = 'Ternary Operator'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `absValue(n)` using a single ternary expression to return the absolute value of `n`.',
        starter: '',
        tests: `
assert absValue(-5) === 5
assert absValue(5) === 5
assert absValue(0) === 0
`,
        solution: 'function absValue(n) { return n < 0 ? -n : n; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `clamp2(n, min, max)` using a NESTED ternary to clamp `n` into the `[min, max]` range.',
        starter: 'function clamp2(n, min, max) {\n  // TODO: use a nested ternary\n}',
        tests: `
assert clamp2(5, 0, 10) === 5
assert clamp2(-1, 0, 10) === 0
assert clamp2(11, 0, 10) === 10
`,
        solution: 'function clamp2(n, min, max) { return n < min ? min : n > max ? max : n; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `grade2(score)` as a CHAIN of ternaries: `>=90` → `'A'`, `>=80` → `'B'`, `>=70` → `'C'`, else `'F'`.",
        starter: '',
        tests: `
assert grade2(95) === 'A'
assert grade2(85) === 'B'
assert grade2(75) === 'C'
assert grade2(50) === 'F'
`,
        solution: "function grade2(score) { return score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F'; }",
      },
    ],
  },
]

export default challenges
