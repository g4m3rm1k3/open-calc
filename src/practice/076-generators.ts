import type { PracticeChallenge } from './loader'

export const title = 'Generators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a generator function `range(start, end)` that `yield`s each integer from `start` up to (not including) `end`.',
        starter: '',
        tests: `
const result = [...range(1,4)]
assert JSON.stringify(result) === JSON.stringify([1,2,3])
const gen = range(10,12)
const r1 = gen.next()
assert r1.value === 10 && r1.done === false
`,
        solution: `function* range(start, end) {
  let current = start
  while (current < end) {
    yield current
    current++
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
        prompt: 'Finish the generator `evens(n)` so it `yield`s the first `n` even numbers (`0, 2, 4, ...`).',
        starter: 'function* evens(n) {\n  // TODO: yield the first n even numbers (0, 2, 4, ...)\n}',
        tests: `
assert JSON.stringify([...evens(3)]) === JSON.stringify([0,2,4])
`,
        solution: `function* evens(n) {
  let value = 0
  for (let i = 0; i < n; i++) {
    yield value
    value += 2
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
        prompt: 'Write a generator function `fibonacci()` that `yield`s Fibonacci numbers (`1, 1, 2, 3, 5, 8, ...`) forever, without ever returning — the sequence has no end, so only pull as many values as you need via `next()`.',
        starter: '',
        tests: `
const gen = fibonacci()
const vals = []
for (let i = 0; i < 6; i++) { vals.push(gen.next().value) }
assert JSON.stringify(vals) === JSON.stringify([1,1,2,3,5,8])
`,
        solution: `function* fibonacci() {
  let a = 1, b = 1
  while (true) {
    yield a
    ;[a, b] = [b, a + b]
  }
}`,
      },
    ],
  },
]

export default challenges
