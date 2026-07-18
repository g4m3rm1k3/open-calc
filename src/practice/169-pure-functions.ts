import type { PracticeChallenge } from './loader'

export const title = 'Pure Functions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `add(a, b)` (returns `a + b`, no external dependency) and `firstOrZero(arr)` (returns the first element or `0`, WITHOUT mutating `arr`) — both pure: same input always produces the same output, no side effects.',
        starter: '',
        tests: `
assert add(2,3) === 5
assert add(2,3) === 5
const original = [1,2,3]
assert firstOrZero(original) === 1
assert JSON.stringify(original) === JSON.stringify([1,2,3])
`,
        solution: `function add(a, b) { return a + b }
function firstOrZero(arr) { return arr.length > 0 ? arr[0] : 0 }`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `removeDuplicates(arr)`: it must return a NEW array with duplicates removed, WITHOUT mutating the input array via `splice()` or similar — a pure function never mutates its arguments as a side effect.',
        starter: 'function removeDuplicates(arr) {\n  // TODO: return a NEW array with duplicates removed — do not mutate the\n  // input array with splice() or similar; a pure function never mutates\n  // its arguments as a side effect\n  for (let i = arr.length - 1; i >= 0; i--) {\n    if (arr.indexOf(arr[i]) !== i) arr.splice(i, 1)\n  }\n  return arr\n}',
        tests: `
const original = [1,2,2,3,3,3]
const result = removeDuplicates(original)
assert JSON.stringify([...result].sort()) === JSON.stringify([1,2,3])
assert JSON.stringify(original) === JSON.stringify([1,2,2,3,3,3])
`,
        solution: `function removeDuplicates(arr) {
  return [...new Set(arr)]
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `isPure(fn, input)`: call `fn(input)` twice and return whether both results are identical (compared via `JSON.stringify`) — a practical check for whether a function is deterministic (the defining trait of purity) versus dependent on changing external state.',
        starter: '',
        tests: `
function pureDouble(x) { return x * 2 }
assert isPure(pureDouble, 5) === true
let counter = 0
function impureIncrement(x) { counter++; return x + counter }
assert isPure(impureIncrement, 5) === false
`,
        solution: `function isPure(fn, input) {
  const result1 = fn(input)
  const result2 = fn(input)
  return JSON.stringify(result1) === JSON.stringify(result2)
}`,
      },
    ],
  },
]

export default challenges
