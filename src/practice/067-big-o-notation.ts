import type { PracticeChallenge } from './loader'

export const title = 'Big-O Notation'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `countOperations(n)` that returns how many iterations a single `for` loop from `0` to `n` performs — demonstrating O(n) growth directly.',
        starter: '',
        tests: `
assert countOperations(5) === 5
assert countOperations(0) === 0
`,
        solution: 'function countOperations(n) { let count = 0; for (let i = 0; i < n; i++) { count++; } return count; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `linearSearchOps(arr, target)` so it returns the number of COMPARISONS a linear search makes to find `target` (or to exhaust `arr`).',
        starter: 'function linearSearchOps(arr, target) {\n  // TODO: count how many comparisons a linear search makes to find target (or exhaust the array)\n}',
        tests: `
assert linearSearchOps([5,3,8,1], 8) === 3
assert linearSearchOps([1,2,3], 9) === 3
`,
        solution: 'function linearSearchOps(arr, target) { let comparisons = 0; for (const x of arr) { comparisons++; if (x === target) return comparisons; } return comparisons; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `compareComplexity(n)` returning `{ linear: n, quadratic: n * n }`, directly contrasting O(n) versus O(n²) growth for the same input size.',
        starter: '',
        tests: `
assert JSON.stringify(compareComplexity(5)) === JSON.stringify({linear:5,quadratic:25})
assert JSON.stringify(compareComplexity(10)) === JSON.stringify({linear:10,quadratic:100})
`,
        solution: 'function compareComplexity(n) { return { linear: n, quadratic: n * n }; }',
      },
    ],
  },
]

export default challenges
