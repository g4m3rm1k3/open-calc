import type { PracticeChallenge } from './loader'

export const title = 'Set'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `uniqueValues(arr)` that returns an array of `arr`\'s unique values, using a `Set`.',
        starter: '',
        tests: `
assert JSON.stringify(uniqueValues([1,2,2,3,1])) === JSON.stringify([1,2,3])
assert JSON.stringify(uniqueValues([])) === JSON.stringify([])
`,
        solution: 'function uniqueValues(arr) { return [...new Set(arr)]; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `hasDuplicates(arr)` so it returns `true` if `arr` contains any duplicate value, using a `Set`.',
        starter: 'function hasDuplicates(arr) {\n  // TODO: use a Set\n}',
        tests: `
assert hasDuplicates([1,2,3]) === false
assert hasDuplicates([1,2,2]) === true
`,
        solution: 'function hasDuplicates(arr) { return new Set(arr).size !== arr.length; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `intersection(a, b)` that returns an array of the unique elements present in BOTH `a` and `b`, using a `Set`.',
        starter: '',
        tests: `
assert JSON.stringify(intersection([1,2,3],[2,3,4]).sort()) === JSON.stringify([2,3])
assert JSON.stringify(intersection([1,2],[3,4])) === JSON.stringify([])
`,
        solution: 'function intersection(a, b) { const setB = new Set(b); return [...new Set(a)].filter(x => setB.has(x)); }',
      },
    ],
  },
]

export default challenges
