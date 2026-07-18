import type { PracticeChallenge } from './loader'

export const title = 'Recursion'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `factorialRec(n)` that computes `n!` recursively.',
        starter: '',
        tests: `
assert factorialRec(0) === 1
assert factorialRec(1) === 1
assert factorialRec(5) === 120
`,
        solution: 'function factorialRec(n) { if (n <= 1) return 1; return n * factorialRec(n - 1); }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `sumDigits(n)` so it recursively sums the digits of a non-negative integer `n`.',
        starter: 'function sumDigits(n) {\n  // TODO: recursively sum the digits\n}',
        tests: `
assert sumDigits(0) === 0
assert sumDigits(9) === 9
assert sumDigits(123) === 6
assert sumDigits(1000) === 1
`,
        solution: 'function sumDigits(n) { if (n < 10) return n; return n % 10 + sumDigits(Math.floor(n / 10)); }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `fibRec(n)` that recursively computes the `n`th Fibonacci number (0-indexed: `fib(0)=0`, `fib(1)=1`).',
        starter: '',
        tests: `
assert fibRec(0) === 0
assert fibRec(1) === 1
assert fibRec(6) === 8
assert fibRec(10) === 55
`,
        solution: 'function fibRec(n) { if (n <= 1) return n; return fibRec(n-1) + fibRec(n-2); }',
      },
    ],
  },
]

export default challenges
