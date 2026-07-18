import type { PracticeChallenge } from './loader'

export const title = 'Type'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `typeOf(x)` that returns the JavaScript type of `x` using `typeof`.',
        starter: '',
        tests: `
assert typeOf(5) === 'number'
assert typeOf('hi') === 'string'
assert typeOf(true) === 'boolean'
`,
        solution: 'function typeOf(x) { return typeof x; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `isSameType(a, b)` that returns `true` if `a` and `b` have the same type.',
        starter: 'function isSameType(a, b) {\n  // TODO\n}',
        tests: `
assert isSameType(1, 2) === true
assert isSameType(1, '1') === false
assert isSameType(true, false) === true
`,
        solution: 'function isSameType(a, b) { return typeof a === typeof b; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `describeTypes(arr)` that returns a new array containing the `typeof` string for each element of `arr`.',
        starter: '',
        tests: `
assert JSON.stringify(describeTypes([1, 'a', true])) === JSON.stringify(['number','string','boolean'])
assert JSON.stringify(describeTypes([])) === JSON.stringify([])
`,
        solution: 'function describeTypes(arr) { return arr.map(x => typeof x); }',
      },
    ],
  },
]

export default challenges
