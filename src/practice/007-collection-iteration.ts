import type { PracticeChallenge } from './loader'

export const title = 'Collection Iteration (for-each)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `joinWithCommas(arr)` that iterates `arr` with a for-each style loop and returns its elements joined by `", "`.',
        starter: '',
        tests: `
assert joinWithCommas(['a','b','c']) === 'a, b, c'
assert joinWithCommas(['x']) === 'x'
assert joinWithCommas([]) === ''
`,
        solution: "function joinWithCommas(arr) { let result = ''; for (const item of arr) { result += (result ? ', ' : '') + item; } return result; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `countMatches(arr, target)` so it iterates `arr` with `for...of` and returns how many elements equal `target`.',
        starter: 'function countMatches(arr, target) {\n  // TODO: iterate arr and count matches\n}',
        tests: `
assert countMatches([1,2,1,3,1], 1) === 3
assert countMatches([], 5) === 0
assert countMatches(['a','b'], 'c') === 0
`,
        solution: 'function countMatches(arr, target) { let count = 0; for (const item of arr) { if (item === target) count++; } return count; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `flattenOnce(arrays)` that iterates an array of arrays and combines every element into one flat array (without using `.flat()`).',
        starter: '',
        tests: `
assert JSON.stringify(flattenOnce([[1,2],[3],[4,5]])) === JSON.stringify([1,2,3,4,5])
assert JSON.stringify(flattenOnce([])) === JSON.stringify([])
`,
        solution: 'function flattenOnce(arrays) { let result = []; for (const arr of arrays) { for (const item of arr) { result.push(item); } } return result; }',
      },
    ],
  },
]

export default challenges
