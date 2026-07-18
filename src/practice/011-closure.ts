import type { PracticeChallenge } from './loader'

export const title = 'Closure'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `makeAdder(x)` that returns a NEW function which adds `x` to whatever argument it\'s called with.',
        starter: '',
        tests: `
assert makeAdder(5)(3) === 8
assert makeAdder(0)(10) === 10
assert makeAdder(-2)(2) === 0
`,
        solution: 'function makeAdder(x) { return function(y) { return x + y; }; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `makeCounter()` so it returns a function that, each time it is called, increments and returns a count starting at 1 — the count must persist across calls via closure.',
        starter: 'function makeCounter() {\n  // TODO: return a function that increments and returns a count, starting at 1\n}',
        tests: `
const c1 = makeCounter()
assert c1() === 1
assert c1() === 2
assert c1() === 3
`,
        solution: 'function makeCounter() { let count = 0; return function() { count++; return count; }; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `memoizeOnce(fn)` that returns a wrapped version of `fn` which calls `fn` on the FIRST invocation only, caching and always returning that same result afterward regardless of new arguments.',
        starter: '',
        tests: `
let calls = 0
function inc() { calls++; return calls; }
const memoized = memoizeOnce(inc)
assert memoized() === 1
assert memoized() === 1
assert calls === 1
`,
        solution: 'function memoizeOnce(fn) { let called = false; let result; return function(...args) { if (!called) { result = fn(...args); called = true; } return result; }; }',
      },
    ],
  },
]

export default challenges
