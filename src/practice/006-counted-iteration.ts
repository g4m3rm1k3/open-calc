import type { PracticeChallenge } from './loader'

export const title = 'Counted Iteration (for loop)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `sumToN(n)` that sums the integers from 1 to `n` using a `for` loop.',
        starter: '',
        tests: `
assert sumToN(5) === 15
assert sumToN(1) === 1
assert sumToN(0) === 0
`,
        solution: 'function sumToN(n) { let total = 0; for (let i = 1; i <= n; i++) { total += i; } return total; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `repeatString(str, times)` so it uses a `for` loop to build and return `str` repeated `times` times.',
        starter: 'function repeatString(str, times) {\n  // TODO: use a for loop to build the repeated string\n}',
        tests: `
assert repeatString('ab', 3) === 'ababab'
assert repeatString('x', 0) === ''
assert repeatString('hi', 1) === 'hi'
`,
        solution: "function repeatString(str, times) { let result = ''; for (let i = 0; i < times; i++) { result += str; } return result; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `factorial(n)` that computes `n!` using a `for` loop.',
        starter: '',
        tests: `
assert factorial(0) === 1
assert factorial(1) === 1
assert factorial(5) === 120
`,
        solution: 'function factorial(n) { let result = 1; for (let i = 2; i <= n; i++) { result *= i; } return result; }',
      },
    ],
  },
]

export default challenges
