import type { PracticeChallenge } from './loader'

export const title = 'Mutability'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `pushToShared(arr, item)` (mutates `arr` in place with `.push`) and `upperOf(str)` (returns a NEW uppercased string, since strings are immutable and can never be changed in place).',
        starter: '',
        tests: `
const arr = [1,2,3]
const otherRef = arr
assert (pushToShared(arr, 4), true)
assert JSON.stringify(otherRef) === JSON.stringify([1,2,3,4])
const str = 'hello'
const otherStr = str
const upper = upperOf(str)
assert str === 'hello'
assert otherStr === 'hello'
assert upper === 'HELLO'
`,
        solution: `function pushToShared(arr, item) {
  arr.push(item)
}
function upperOf(str) {
  return str.toUpperCase()
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `pushToSharedViaFunction(arr, item)`: it must mutate the SAME array passed in, not create a local copy — the caller\'s original array must see the change too, since arrays are passed by reference.',
        starter: 'function pushToSharedViaFunction(arr, item) {\n  // TODO: mutate the SAME array passed in — do not create a local copy,\n  // since the caller\'s original array must see this change too\n  arr = [...arr, item]\n}',
        tests: `
const original = [1,2,3]
function callerPushes(arr) { pushToSharedViaFunction(arr, 99) }
assert (callerPushes(original), true)
assert JSON.stringify(original) === JSON.stringify([1,2,3,99])
`,
        solution: `function pushToSharedViaFunction(arr, item) {
  arr.push(item)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `safeImmutablePush(arr, item)` returning a BRAND NEW array with `item` appended, leaving the original `arr` completely untouched — the pattern frameworks like React rely on for cheap reference-equality change detection.',
        starter: '',
        tests: `
const original = [1,2,3]
const updated = safeImmutablePush(original, 4)
assert JSON.stringify(original) === JSON.stringify([1,2,3])
assert JSON.stringify(updated) === JSON.stringify([1,2,3,4])
assert (original === updated) === false
`,
        solution: `function safeImmutablePush(arr, item) {
  return [...arr, item]
}`,
      },
    ],
  },
]

export default challenges
