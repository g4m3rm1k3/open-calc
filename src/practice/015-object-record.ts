import type { PracticeChallenge } from './loader'

export const title = 'Object / Record'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `makePoint(x, y)` that returns an object `{ x, y }`.',
        starter: '',
        tests: `
assert JSON.stringify(makePoint(1,2)) === JSON.stringify({x:1,y:2})
assert JSON.stringify(makePoint(0,0)) === JSON.stringify({x:0,y:0})
`,
        solution: 'function makePoint(x, y) { return { x: x, y: y }; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `getProperty(obj, key)` so it returns `obj[key]` (or `undefined` if the key is absent).',
        starter: 'function getProperty(obj, key) {\n  // TODO\n}',
        tests: `
assert getProperty({a:1}, 'a') === 1
assert getProperty({a:1}, 'b') === undefined
`,
        solution: 'function getProperty(obj, key) { return obj[key]; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `mergeObjects(a, b)` that returns a NEW object combining `a` and `b` (with `b`\'s properties winning on conflict), without mutating either input.',
        starter: '',
        tests: `
const a = { x: 1, y: 2 }
const b = { y: 99, z: 3 }
const merged = mergeObjects(a, b)
assert JSON.stringify(merged) === JSON.stringify({ x: 1, y: 99, z: 3 })
assert JSON.stringify(a) === JSON.stringify({ x: 1, y: 2 })
assert JSON.stringify(b) === JSON.stringify({ y: 99, z: 3 })
`,
        solution: 'function mergeObjects(a, b) { return { ...a, ...b }; }',
      },
    ],
  },
]

export default challenges
