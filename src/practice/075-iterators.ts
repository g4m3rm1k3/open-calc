import type { PracticeChallenge } from './loader'

export const title = 'Iterators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeCounterIterator(start, end)` returning `{ next() }` — each call returns `{ value, done: false }` with the next integer from `start` up to (not including) `end`, then `{ value: undefined, done: true }` once exhausted.',
        starter: '',
        tests: `
const it = makeCounterIterator(1, 4)
const r1 = it.next()
assert r1.value === 1 && r1.done === false
const r2 = it.next()
assert r2.value === 2 && r2.done === false
const r3 = it.next()
assert r3.value === 3 && r3.done === false
const r4 = it.next()
assert r4.done === true
`,
        solution: `function makeCounterIterator(start, end) {
  let current = start
  return {
    next() {
      if (current < end) return { value: current++, done: false }
      return { value: undefined, done: true }
    }
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
        prompt: 'Finish `makeEvensIterator(n)` returning `{ next() }` implementing the iterator protocol, producing the first `n` even numbers (`0, 2, 4, ...`) one at a time.',
        starter: 'function makeEvensIterator(n) {\n  // TODO: return { next() } producing the first n even numbers (0, 2, 4, ...)\n  // via the {value, done} iterator protocol\n  return { next() { return { value: undefined, done: true } } }\n}',
        tests: `
const it = makeEvensIterator(3)
const values = []
let result = it.next()
while (!result.done) { values.push(result.value); result = it.next() }
assert JSON.stringify(values) === JSON.stringify([0,2,4])
`,
        solution: `function makeEvensIterator(n) {
  let count = 0
  let value = 0
  return {
    next() {
      if (count < n) {
        const result = { value, done: false }
        value += 2
        count++
        return result
      }
      return { value: undefined, done: true }
    }
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `zipIterators(iterA, iterB)` returning a NEW iterator (`{ next() }`) that pulls one value from each of two given iterators per call, yielding `[a, b]` pairs, and stops (`done: true`) as soon as EITHER source iterator is exhausted.',
        starter: '',
        tests: `
function makeIt(arr) {
  let i = 0
  return { next() { return i < arr.length ? { value: arr[i++], done: false } : { value: undefined, done: true } } }
}
const zipped = zipIterators(makeIt([1,2,3]), makeIt(['a','b']))
const results = []
let r = zipped.next()
while (!r.done) { results.push(r.value); r = zipped.next() }
assert JSON.stringify(results) === JSON.stringify([[1,'a'],[2,'b']])
`,
        solution: `function zipIterators(iterA, iterB) {
  return {
    next() {
      const a = iterA.next()
      const b = iterB.next()
      if (a.done || b.done) return { value: undefined, done: true }
      return { value: [a.value, b.value], done: false }
    }
  }
}`,
      },
    ],
  },
]

export default challenges
