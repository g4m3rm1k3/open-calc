import type { PracticeChallenge } from './loader'

export const title = 'continue'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `sumOdds(arr)` that sums only the ODD numbers in `arr`, using `continue` to skip even ones.',
        starter: '',
        tests: `
assert sumOdds([1,2,3,4,5]) === 9
assert sumOdds([2,4,6]) === 0
`,
        solution: 'function sumOdds(arr) { let total = 0; for (const n of arr) { if (n % 2 === 0) continue; total += n; } return total; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `filterPositive(arr)` using `continue` to skip non-positive numbers, collecting the rest into a result array.',
        starter: 'function filterPositive(arr) {\n  // TODO: use continue to skip non-positive numbers\n}',
        tests: `
assert JSON.stringify(filterPositive([1,-2,3,0,-4])) === JSON.stringify([1,3])
`,
        solution: 'function filterPositive(arr) { const result = []; for (const n of arr) { if (n <= 0) continue; result.push(n); } return result; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `skipDiagonal(n)` that returns every `[i, j]` pair for an `n x n` grid EXCEPT where `i === j`, using `continue` inside nested loops.',
        starter: '',
        tests: `
assert JSON.stringify(skipDiagonal(2)) === JSON.stringify([[0,1],[1,0]])
`,
        solution: `function skipDiagonal(n) {
  const pairs = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      pairs.push([i, j])
    }
  }
  return pairs
}`,
      },
    ],
  },
]

export default challenges
