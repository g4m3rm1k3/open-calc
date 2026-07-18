import type { PracticeChallenge } from './loader'

export const title = 'Indexing'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `linearScan(rows, email)` returning `{ row, comparisons }` (checking rows one by one until a match), and `indexedLookup(index, email)` returning `{ row, comparisons: 1 }` using a prebuilt `Map` — a direct lookup, regardless of how many rows exist.',
        starter: '',
        tests: `
const rows = [{id:0,email:'a@x.com'},{id:1,email:'b@x.com'},{id:2,email:'c@x.com'}]
const index = new Map(rows.map(r => [r.email, r]))
assert linearScan(rows, 'c@x.com').comparisons === 3
assert indexedLookup(index, 'c@x.com').comparisons === 1
`,
        solution: `function linearScan(rows, email) {
  let comparisons = 0
  for (const row of rows) {
    comparisons++
    if (row.email === email) return { row, comparisons }
  }
  return { row: null, comparisons }
}
function indexedLookup(index, email) {
  return { row: index.get(email) ?? null, comparisons: 1 }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `buildIndex(rows, key)` returning a `Map` from each row\'s `row[key]` value to the row itself — the precomputed lookup structure an index actually is.',
        starter: 'function buildIndex(rows, key) {\n  // TODO: map each row\'s row[key] value to the row itself, for every row\n  const index = new Map()\n  return index\n}',
        tests: `
const rows = [{id:0,email:'a@x.com'},{id:1,email:'b@x.com'}]
const index = buildIndex(rows, 'email')
assert index.get('a@x.com').id === 0
assert index.get('b@x.com').id === 1
`,
        solution: `function buildIndex(rows, key) {
  const index = new Map()
  for (const row of rows) {
    index.set(row[key], row)
  }
  return index
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `estimateComparisons(rowCount, indexed)`: without an index, worst case is `rowCount` comparisons (a full scan); with a B-tree-style index, it\'s `ceil(log2(rowCount))` — logarithmic instead of linear.',
        starter: '',
        tests: `
assert estimateComparisons(1000000, false) === 1000000
assert estimateComparisons(1000000, true) === 20
`,
        solution: `function estimateComparisons(rowCount, indexed) {
  if (indexed) return Math.ceil(Math.log2(rowCount))
  return rowCount
}`,
      },
    ],
  },
]

export default challenges
