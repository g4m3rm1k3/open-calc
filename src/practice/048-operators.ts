import type { PracticeChallenge } from './loader'

export const title = 'Operators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `compute(a, op, b)` that applies `op` (one of `'+'`, `'-'`, `'*'`, `'/'`) to `a` and `b`.",
        starter: '',
        tests: `
assert compute(2, '+', 3) === 5
assert compute(10, '-', 4) === 6
assert compute(3, '*', 4) === 12
`,
        solution: "function compute(a, op, b) { if (op === '+') return a + b; if (op === '-') return a - b; if (op === '*') return a * b; if (op === '/') return a / b; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `evaluate(a, op, b)` to also support comparison operators `'>'`, `'<'`, `'=='` alongside `'+'` and `'-'`.",
        starter: "function evaluate(a, op, b) {\n  // TODO: support '+', '-', '>', '<', '=='\n}",
        tests: `
assert evaluate(5, '+', 2) === 7
assert evaluate(5, '>', 2) === true
assert evaluate(5, '==', 5) === true
`,
        solution: "function evaluate(a, op, b) { if (op === '+') return a + b; if (op === '-') return a - b; if (op === '>') return a > b; if (op === '<') return a < b; if (op === '==') return a === b; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `applyChain(nums, ops)` that folds `nums` left to right using the operator at each position in `ops` (only `'+'` and `'*'` need supporting).",
        starter: '',
        tests: `
assert applyChain([1,2,3], ['+','+']) === 6
assert applyChain([2,3,4], ['*','+']) === 10
`,
        solution: "function applyChain(nums, ops) { let result = nums[0]; for (let i = 0; i < ops.length; i++) { if (ops[i] === '+') result += nums[i+1]; else if (ops[i] === '*') result *= nums[i+1]; } return result; }",
      },
    ],
  },
]

export default challenges
