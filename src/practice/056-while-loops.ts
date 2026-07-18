import type { PracticeChallenge } from './loader'

export const title = 'while Loops'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `countUpTo(n)` returning an array counting `1` up to `n`, using a `while` loop.',
        starter: '',
        tests: `
assert JSON.stringify(countUpTo(3)) === JSON.stringify([1,2,3])
assert JSON.stringify(countUpTo(0)) === JSON.stringify([])
`,
        solution: 'function countUpTo(n) { let result = []; let i = 1; while (i <= n) { result.push(i); i++; } return result; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `collatzSteps(n)` so it counts how many steps the Collatz sequence takes to reach `1` (halve if even, `3n+1` if odd), using a `while` loop.',
        starter: 'function collatzSteps(n) {\n  // TODO: count steps for the Collatz sequence to reach 1\n}',
        tests: `
assert collatzSteps(1) === 0
assert collatzSteps(6) === 8
`,
        solution: 'function collatzSteps(n) { let steps = 0; while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; steps++; } return steps; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `findFirstDivisor(n)` that returns the smallest divisor of `n` greater than 1, using a `while` loop.',
        starter: '',
        tests: `
assert findFirstDivisor(15) === 3
assert findFirstDivisor(7) === 7
assert findFirstDivisor(8) === 2
`,
        solution: 'function findFirstDivisor(n) { let d = 2; while (n % d !== 0) { d++; } return d; }',
      },
    ],
  },
]

export default challenges
