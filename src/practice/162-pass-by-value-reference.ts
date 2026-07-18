import type { PracticeChallenge } from './loader'

export const title = 'Pass by Value vs Pass by Reference'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `tryChangeNumber(n)` (reassigns `n`, never affects the caller), `pushItem(arr)` (mutates `arr` in place, visible to the caller), and `reassignArray(arr)` (reassigns the LOCAL `arr` parameter, never affects the caller).',
        starter: '',
        tests: `
let x = 5
assert (tryChangeNumber(x), true)
assert x === 5
let list = [1,2]
assert (pushItem(list), true)
assert JSON.stringify(list) === JSON.stringify([1,2,99])
let list2 = [1,2]
assert (reassignArray(list2), true)
assert JSON.stringify(list2) === JSON.stringify([1,2])
`,
        solution: `function tryChangeNumber(n) { n = 99 }
function pushItem(arr) { arr.push(99) }
function reassignArray(arr) { arr = [100] }`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `safeSortedCopy(arr)`: it must sort a COPY of `arr`, not `arr` itself — `.sort()` mutates in place, so calling it directly on the parameter would silently mutate the caller\'s original array.',
        starter: 'function safeSortedCopy(arr) {\n  // TODO: sort a COPY of arr, not arr itself — the caller\'s original array\n  // must remain untouched\n  return arr.sort((a, b) => a - b)\n}',
        tests: `
const original = [3,1,2]
const sorted = safeSortedCopy(original)
assert JSON.stringify(sorted) === JSON.stringify([1,2,3])
assert JSON.stringify(original) === JSON.stringify([3,1,2])
`,
        solution: `function safeSortedCopy(arr) {
  return [...arr].sort((a, b) => a - b)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `swapPrimitives(a, b)` (reassigns its LOCAL parameters — can NEVER swap the caller\'s actual variables) and `swapViaObject(pair)` (mutates `pair.a`/`pair.b` in place — DOES swap the caller\'s values, since `pair` is a shared reference).',
        starter: '',
        tests: `
let x = 1, y = 2
assert (swapPrimitives(x, y), true)
assert x === 1 && y === 2
const pair = { a: 1, b: 2 }
assert (swapViaObject(pair), true)
assert pair.a === 2 && pair.b === 1
`,
        solution: `function swapPrimitives(a, b) {
  const temp = a
  a = b
  b = temp
}
function swapViaObject(pair) {
  const temp = pair.a
  pair.a = pair.b
  pair.b = temp
}`,
      },
    ],
  },
]

export default challenges
