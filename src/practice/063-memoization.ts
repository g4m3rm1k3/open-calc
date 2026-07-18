import type { PracticeChallenge } from './loader'

export const title = 'Memoization'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `memoize(fn)` that returns a wrapped version of `fn` caching each result by its argument, calling `fn` only ONCE per distinct input.',
        starter: '',
        tests: `
let calls = 0
const slowSquare = memoize(x => { calls++; return x * x; })
assert slowSquare(5) === 25
assert slowSquare(5) === 25
assert calls === 1
`,
        solution: `function memoize(fn) {
  const cache = new Map()
  return function(x) {
    if (cache.has(x)) return cache.get(x)
    const result = fn(x)
    cache.set(x, result)
    return result
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `fibMemo(n, cache = {})` — a recursive Fibonacci that caches each computed result in `cache` so no subproblem is recomputed.',
        starter: 'function fibMemo(n, cache = {}) {\n  // TODO: recursive fibonacci, caching results in `cache` to avoid recomputation\n}',
        tests: `
assert fibMemo(0) === 0
assert fibMemo(1) === 1
assert fibMemo(10) === 55
assert fibMemo(20) === 6765
`,
        solution: `function fibMemo(n, cache = {}) {
  if (n <= 1) return n
  if (cache[n] !== undefined) return cache[n]
  cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)
  return cache[n]
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `memoizeWithStats(fn)` — like `memoize`, but the wrapper also exposes a `.stats()` method reporting `{ hits, misses }` across all calls.',
        starter: '',
        tests: `
const f = memoizeWithStats(x => x * 2)
f(1); f(2); f(1); f(1)
assert JSON.stringify(f.stats()) === JSON.stringify({hits:2,misses:2})
`,
        solution: `function memoizeWithStats(fn) {
  const cache = new Map()
  let hits = 0
  let misses = 0
  const wrapped = function(x) {
    if (cache.has(x)) { hits++; return cache.get(x); }
    misses++
    const result = fn(x)
    cache.set(x, result)
    return result
  }
  wrapped.stats = () => ({ hits, misses })
  return wrapped
}`,
      },
    ],
  },
]

export default challenges
