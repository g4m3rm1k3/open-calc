import type { PracticeChallenge } from './loader'

export const title = 'Backtracking'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `solveNQueensCount(n)` returning the total number of valid N-Queens arrangements for an `n`×`n` board, using backtracking with pruning (skip a column immediately if it conflicts with an already-placed queen) plus proper undo when backtracking.',
        starter: '',
        tests: `
assert solveNQueensCount(4) === 2
assert solveNQueensCount(1) === 1
`,
        solution: `function solveNQueensCount(n) {
  const cols = new Set(), diag1 = new Set(), diag2 = new Set()
  let count = 0
  function backtrack(row) {
    if (row === n) { count++; return }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue
      cols.add(col); diag1.add(row - col); diag2.add(row + col)
      backtrack(row + 1)
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col)
    }
  }
  backtrack(0)
  return count
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `generateSubsets(arr)`: after recursing with an element INCLUDED, you must UNDO that choice (remove it from `current`) before recursing again with it EXCLUDED — forgetting this corrupts every subset generated afterward.',
        starter: 'function generateSubsets(arr) {\n  const result = []\n  const current = []\n  function backtrack(index) {\n    if (index === arr.length) { result.push([...current]); return }\n    current.push(arr[index])\n    backtrack(index + 1)\n    // TODO: undo the push above (current.pop()) before trying the "exclude"\n    // branch — without it, later subsets are corrupted by earlier choices\n    backtrack(index + 1)\n  }\n  backtrack(0)\n  return result\n}',
        tests: `
assert JSON.stringify(generateSubsets([1,2])) === JSON.stringify([[1,2],[1],[2],[]])
`,
        solution: `function generateSubsets(arr) {
  const result = []
  const current = []
  function backtrack(index) {
    if (index === arr.length) { result.push([...current]); return }
    current.push(arr[index])
    backtrack(index + 1)
    current.pop()
    backtrack(index + 1)
  }
  backtrack(0)
  return result
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `generateValidParens(n)` returning every valid combination of `n` pairs of balanced parentheses, using backtracking: only add `(` while `open < n`, only add `)` while `close < open` (pruning any prefix that could never become balanced).',
        starter: '',
        tests: `
assert JSON.stringify(generateValidParens(2)) === JSON.stringify(['(())','()()'])
assert JSON.stringify(generateValidParens(3)) === JSON.stringify(['((()))','(()())','(())()','()(())','()()()'])
`,
        solution: `function generateValidParens(n) {
  const result = []
  function backtrack(current, open, close) {
    if (current.length === 2 * n) { result.push(current); return }
    if (open < n) backtrack(current + '(', open + 1, close)
    if (close < open) backtrack(current + ')', open, close + 1)
  }
  backtrack('', 0, 0)
  return result
}`,
      },
    ],
  },
]

export default challenges
