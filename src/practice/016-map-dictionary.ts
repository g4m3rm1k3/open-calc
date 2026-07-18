import type { PracticeChallenge } from './loader'

export const title = 'Map / Dictionary'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `buildAgeMap(names, ages)` that returns a `Map` from each name to its corresponding age.',
        starter: '',
        tests: `
const m = buildAgeMap(['a','b'], [1,2])
assert m.get('a') === 1
assert m.get('b') === 2
assert m.size === 2
`,
        solution: 'function buildAgeMap(names, ages) { const m = new Map(); for (let i = 0; i < names.length; i++) { m.set(names[i], ages[i]); } return m; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `wordFrequency(words)` so it returns a `Map` of each word to how many times it appears in `words`.',
        starter: 'function wordFrequency(words) {\n  // TODO: return a Map of word -> count\n}',
        tests: `
const m = wordFrequency(['a','b','a'])
assert m.get('a') === 2
assert m.get('b') === 1
assert m.get('c') === undefined
`,
        solution: "function wordFrequency(words) { const m = new Map(); for (const w of words) { m.set(w, (m.get(w) || 0) + 1); } return m; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `invertMap(map)` that returns a NEW `Map` with every key and value swapped.',
        starter: '',
        tests: `
const m = new Map([['a',1],['b',2]])
const inv = invertMap(m)
assert inv.get(1) === 'a'
assert inv.get(2) === 'b'
assert inv.size === 2
`,
        solution: 'function invertMap(map) { const result = new Map(); for (const [k, v] of map) { result.set(v, k); } return result; }',
      },
    ],
  },
]

export default challenges
