import type { PracticeChallenge } from './loader'

export const title = 'Nested Loops'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `multiplicationTable(n)` returning an `n x n` 2D array where `table[i][j] = (i+1) * (j+1)`, using nested loops.',
        starter: '',
        tests: `
assert JSON.stringify(multiplicationTable(2)) === JSON.stringify([[1,2],[2,4]])
`,
        solution: `function multiplicationTable(n) {
  const table = []
  for (let i = 1; i <= n; i++) {
    const row = []
    for (let j = 1; j <= n; j++) {
      row.push(i * j)
    }
    table.push(row)
  }
  return table
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `countPairs(arr, target)` using nested loops to count how many index pairs `(i < j)` sum to `target`.',
        starter: 'function countPairs(arr, target) {\n  // TODO: nested loops counting pairs (i<j) that sum to target\n}',
        tests: `
assert countPairs([1,2,3,4], 5) === 2
assert countPairs([1,1,1], 2) === 3
`,
        solution: `function countPairs(arr, target) {
  let count = 0
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) count++
    }
  }
  return count
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `transpose(grid)` that returns a new 2D array with rows and columns swapped, using nested loops.',
        starter: '',
        tests: `
assert JSON.stringify(transpose([[1,2,3],[4,5,6]])) === JSON.stringify([[1,4],[2,5],[3,6]])
`,
        solution: `function transpose(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const result = []
  for (let j = 0; j < cols; j++) {
    const row = []
    for (let i = 0; i < rows; i++) {
      row.push(grid[i][j])
    }
    result.push(row)
  }
  return result
}`,
      },
    ],
  },
]

export default challenges
