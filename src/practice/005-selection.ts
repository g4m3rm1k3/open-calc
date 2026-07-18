import type { PracticeChallenge } from './loader'

export const title = 'Selection (if / else)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `max2(a, b)` that returns the larger of two numbers using `if`/`else`.',
        starter: '',
        tests: `
assert max2(3,5) === 5
assert max2(5,3) === 5
assert max2(4,4) === 4
`,
        solution: 'function max2(a, b) { if (a > b) { return a; } else { return b; } }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `grade(score)` using an if/else-if chain: >=90 returns `'A'`, >=80 `'B'`, >=70 `'C'`, otherwise `'F'`.",
        starter: 'function grade(score) {\n  // TODO: use if/else if to return the letter grade\n}',
        tests: `
assert grade(95) === 'A'
assert grade(85) === 'B'
assert grade(75) === 'C'
assert grade(50) === 'F'
`,
        solution: "function grade(score) { if (score >= 90) return 'A'; else if (score >= 80) return 'B'; else if (score >= 70) return 'C'; else return 'F'; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `fizzbuzzOne(n)`: return `'FizzBuzz'` if `n` is a multiple of 15, `'Fizz'` if a multiple of 3, `'Buzz'` if a multiple of 5, otherwise `n` as a string.",
        starter: '',
        tests: `
assert fizzbuzzOne(15) === 'FizzBuzz'
assert fizzbuzzOne(3) === 'Fizz'
assert fizzbuzzOne(5) === 'Buzz'
assert fizzbuzzOne(7) === '7'
`,
        solution: "function fizzbuzzOne(n) { if (n % 15 === 0) return 'FizzBuzz'; if (n % 3 === 0) return 'Fizz'; if (n % 5 === 0) return 'Buzz'; return String(n); }",
      },
    ],
  },
]

export default challenges
