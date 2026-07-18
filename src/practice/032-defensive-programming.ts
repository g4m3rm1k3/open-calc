import type { PracticeChallenge } from './loader'

export const title = 'Defensive Programming'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `safeGet(obj, key, fallback)` that returns `obj[key]`, or `fallback` if `obj` is `null`/`undefined` OR the key is missing.',
        starter: '',
        tests: `
assert safeGet({a:1},'a',0) === 1
assert safeGet(null,'a',0) === 0
assert safeGet(undefined,'a',5) === 5
`,
        solution: 'function safeGet(obj, key, fallback) { if (obj === null || obj === undefined) { return fallback; } return obj[key] !== undefined ? obj[key] : fallback; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `safeDivideDefensive(a, b)` so it returns `null` if either argument is not a number, or if `b` is `0`, otherwise `a / b`.',
        starter: 'function safeDivideDefensive(a, b) {\n  // TODO: return null if a or b are not numbers, or if b is 0\n}',
        tests: `
assert safeDivideDefensive(10,2) === 5
assert safeDivideDefensive(10,0) === null
assert safeDivideDefensive('a',2) === null
`,
        solution: "function safeDivideDefensive(a, b) { if (typeof a !== 'number' || typeof b !== 'number' || b === 0) { return null; } return a / b; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `processListSafely(list, fn)` that returns `[]` if `list` isn\'t an array, and otherwise maps `fn` over it, silently SKIPPING any element where `fn` throws.',
        starter: '',
        tests: `
assert JSON.stringify(processListSafely([1,2,3], x => x*2)) === JSON.stringify([2,4,6])
assert JSON.stringify(processListSafely(null, x=>x)) === JSON.stringify([])
const fn = x => { if (typeof x !== 'number') throw new Error('bad'); return x*2; }
assert JSON.stringify(processListSafely([1,'a',3], fn)) === JSON.stringify([2,6])
`,
        solution: "function processListSafely(list, fn) { if (!Array.isArray(list)) { return []; } const result = []; for (const item of list) { try { result.push(fn(item)); } catch (e) { continue; } } return result; }",
      },
    ],
  },
]

export default challenges
