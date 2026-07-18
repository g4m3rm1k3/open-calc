import type { PracticeChallenge } from './loader'

export const title = 'Expression vs Statement'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `evaluateSum(a, b)` that returns the value of the expression `a + b`.',
        starter: '',
        tests: `
assert evaluateSum(2,3) === 5
assert evaluateSum(-1,1) === 0
`,
        solution: 'function evaluateSum(a, b) { return a + b; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `isEven(n)` so it returns the value of a boolean EXPRESSION (not an if/else statement).',
        starter: 'function isEven(n) {\n  // TODO: return the value of a boolean expression, not an if/else block\n}',
        tests: `
assert isEven(4) === true
assert isEven(3) === false
assert isEven(0) === true
`,
        solution: 'function isEven(n) { return n % 2 === 0; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write a function `classify(n)` that uses a single ternary EXPRESSION (not if/else statements) to return `'negative'`, `'zero'`, or `'positive'`.",
        starter: '',
        tests: `
assert classify(-5) === 'negative'
assert classify(0) === 'zero'
assert classify(5) === 'positive'
`,
        solution: "function classify(n) { return n < 0 ? 'negative' : n === 0 ? 'zero' : 'positive'; }",
      },
    ],
  },
]

export default challenges
