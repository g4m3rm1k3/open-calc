import type { PracticeChallenge } from './loader'

export const title = 'Async, Part 2 — Promises & Futures'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeEagerPromise(startFn)` returning `new Promise(resolve => { startFn(); resolve(\'done\') })` — demonstrating that a JavaScript Promise is EAGER: the executor function (and anything inside it, like `startFn()`) runs the INSTANT the Promise is constructed, not deferred until something attaches a `.then()`.',
        starter: '',
        tests: `
let started = false
function startFn() { started = true }
const p = makeEagerPromise(startFn)
assert started === true
assert p instanceof Promise
`,
        solution: `function makeEagerPromise(startFn) {
  return new Promise(resolve => {
    startFn()
    resolve('done')
  })
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `getUserPlaceholder`: it returns the value `{ id }` DIRECTLY instead of a placeholder — callers expecting to treat this like a real async result (checking `typeof result.then === \'function\'`, or that it\'s a genuine `Promise`) get a plain object instead, breaking the placeholder contract. Wrap the return value in `new Promise(resolve => resolve({ id }))`.',
        starter: `function getUserPlaceholder(id) {
  return { id }
}`,
        tests: `
const result = getUserPlaceholder(1)
assert typeof result.then === 'function'
assert result instanceof Promise
`,
        solution: `function getUserPlaceholder(id) {
  return new Promise(resolve => resolve({ id }))
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `attachAndCheck(promise, onValue)` that calls `promise.then(onValue)` and returns `promise`. Demonstrate that `.then()` is ALWAYS deferred — even on an ALREADY-resolved promise (`Promise.resolve(99)`), the attached callback does NOT run synchronously; it only runs later, as a microtask, so a value it sets is still unset immediately after the `.then()` call returns.',
        starter: '',
        tests: `
let receivedValue = null
const p = Promise.resolve(99)
attachAndCheck(p, value => { receivedValue = value })
assert receivedValue === null
`,
        solution: `function attachAndCheck(promise, onValue) {
  promise.then(onValue)
  return promise
}`,
      },
    ],
  },
]

export default challenges
