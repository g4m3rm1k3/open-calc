import type { PracticeChallenge } from './loader'

export const title = 'Return Value'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write a function `getGreeting(name)` that returns the string `'Hello, ' + name`.",
        starter: '',
        tests: `
assert getGreeting('Alice') === 'Hello, Alice'
assert getGreeting('Bob') === 'Hello, Bob'
`,
        solution: "function getGreeting(name) { return 'Hello, ' + name; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `firstOrDefault(arr, def)` so it returns `arr[0]` if `arr` has elements, or `def` if `arr` is empty — with two distinct return points.',
        starter: 'function firstOrDefault(arr, def) {\n  // TODO: return arr[0], or def if arr is empty\n}',
        tests: `
assert firstOrDefault([1,2,3], 0) === 1
assert firstOrDefault([], 99) === 99
assert firstOrDefault(['a'], 'x') === 'a'
`,
        solution: 'function firstOrDefault(arr, def) { if (arr.length === 0) { return def; } return arr[0]; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `safeDivide(a, b)` that returns `a / b`, or `null` if `b` is `0` — demonstrating explicit return values for different cases.',
        starter: '',
        tests: `
assert safeDivide(10,2) === 5
assert safeDivide(10,0) === null
assert safeDivide(0,5) === 0
`,
        solution: 'function safeDivide(a, b) { if (b === 0) { return null; } return a / b; }',
      },
    ],
  },
]

export default challenges
