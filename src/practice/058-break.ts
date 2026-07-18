import type { PracticeChallenge } from './loader'

export const title = 'break'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `findIndex2(arr, target)` that returns the index of `target` in `arr` (or `-1`), returning as soon as it\'s found.',
        starter: '',
        tests: `
assert findIndex2([1,2,3], 2) === 1
assert findIndex2([1,2,3], 9) === -1
`,
        solution: 'function findIndex2(arr, target) { for (let i = 0; i < arr.length; i++) { if (arr[i] === target) { return i; } } return -1; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `firstNegative(arr)` so it loops through `arr` and uses `break` to stop as soon as it finds a negative number, returning it (or `null` if none exist).',
        starter: 'function firstNegative(arr) {\n  // TODO: loop, break as soon as a negative number is found\n}',
        tests: `
assert firstNegative([1,2,-3,4]) === -3
assert firstNegative([1,2,3]) === null
`,
        solution: 'function firstNegative(arr) { let result = null; for (const n of arr) { if (n < 0) { result = n; break; } } return result; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `findPairSum(grid, target)` that searches a 2D array for `target`, using a LABELED `break` to exit BOTH nested loops as soon as it\'s found, returning `[row, col]` (or `null`).',
        starter: '',
        tests: `
assert JSON.stringify(findPairSum([[1,2],[3,4]], 3)) === JSON.stringify([1,0])
assert findPairSum([[1,2]], 9) === null
`,
        solution: `function findPairSum(grid, target) {
  let result = null
  outer: for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === target) {
        result = [i, j]
        break outer
      }
    }
  }
  return result
}`,
      },
    ],
  },
]

export default challenges
