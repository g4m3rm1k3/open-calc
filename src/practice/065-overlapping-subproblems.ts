import type { PracticeChallenge } from './loader'

export const title = 'Overlapping Subproblems'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `naiveFibCallCount(n)` — a naive recursive Fibonacci that, instead of returning the Fibonacci number, returns the TOTAL number of recursive calls made computing it.',
        starter: '',
        tests: `
assert naiveFibCallCount(1) === 1
assert naiveFibCallCount(5) === 15
`,
        solution: `function naiveFibCallCount(n) {
  if (n <= 1) return 1
  return 1 + naiveFibCallCount(n - 1) + naiveFibCallCount(n - 2)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `memoFibCallCount(n)` — recursive Fibonacci WITH a cache — returning the number of CACHE MISSES (distinct subproblems actually computed), demonstrating how much smaller this is than the naive call count.',
        starter: 'function memoFibCallCount(n) {\n  // TODO: recursive fib with a cache; return the number of CACHE MISSES (distinct subproblems actually solved)\n}',
        tests: `
assert memoFibCallCount(5) === 6
assert memoFibCallCount(10) === 11
`,
        solution: `function memoFibCallCount(n) {
  const cache = {}
  let misses = 0
  function fib(k) {
    if (k in cache) return cache[k]
    misses++
    const result = k <= 1 ? k : fib(k-1) + fib(k-2)
    cache[k] = result
    return result
  }
  fib(n)
  return misses
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `compareSubproblems(n)` returning `{ naive, distinct }` — the naive recursive call count versus the number of genuinely DISTINCT subproblems — directly quantifying the overlap.',
        starter: '',
        tests: `
assert JSON.stringify(compareSubproblems(5)) === JSON.stringify({naive:15,distinct:6})
`,
        solution: `function compareSubproblems(n) {
  function naiveCalls(k) { if (k <= 1) return 1; return 1 + naiveCalls(k-1) + naiveCalls(k-2); }
  const cache = {}
  let misses = 0
  function memo(k) { if (k in cache) return cache[k]; misses++; const r = k<=1?k:memo(k-1)+memo(k-2); cache[k]=r; return r; }
  memo(n)
  return { naive: naiveCalls(n), distinct: misses }
}`,
      },
    ],
  },
]

export default challenges
