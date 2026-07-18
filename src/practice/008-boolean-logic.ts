import type { PracticeChallenge } from './loader'

export const title = 'Boolean Logic'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `bothTrue(a, b)` that returns `a && b`.',
        starter: '',
        tests: `
assert bothTrue(true, true) === true
assert bothTrue(true, false) === false
assert bothTrue(false, false) === false
`,
        solution: 'function bothTrue(a, b) { return a && b; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `isInRange(n, low, high)` so it returns `true` only if `n` is greater than or equal to `low` AND less than or equal to `high`.',
        starter: 'function isInRange(n, low, high) {\n  // TODO\n}',
        tests: `
assert isInRange(5, 1, 10) === true
assert isInRange(0, 1, 10) === false
assert isInRange(10, 1, 10) === true
`,
        solution: 'function isInRange(n, low, high) { return n >= low && n <= high; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `xor(a, b)` that returns `true` if exactly one of `a`, `b` is true (not both, not neither) — without using `^`.',
        starter: '',
        tests: `
assert xor(true, false) === true
assert xor(false, true) === true
assert xor(true, true) === false
assert xor(false, false) === false
`,
        solution: 'function xor(a, b) { return (a || b) && !(a && b); }',
      },
    ],
  },
]

export default challenges
