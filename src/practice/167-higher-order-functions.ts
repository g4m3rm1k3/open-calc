import type { PracticeChallenge } from './loader'

export const title = 'Higher-Order Functions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `map(arr, fn)` looping over `arr`, applying `fn` to each element, and collecting the results — the SAME `map` function must work correctly whether `fn` doubles, squares, or does anything else.',
        starter: '',
        tests: `
assert JSON.stringify(map([1,2,3], x => x*2)) === JSON.stringify([2,4,6])
assert JSON.stringify(map([1,2,3], x => x*x)) === JSON.stringify([1,4,9])
`,
        solution: `function map(arr, fn) {
  const result = []
  for (const item of arr) result.push(fn(item))
  return result
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `myFilter(arr, predicate)`: only include an item if `predicate(item)` is `true` — the CALLER supplies that decision logic; `myFilter` just applies it to every item, it never hard-codes which items belong.',
        starter: 'function myFilter(arr, predicate) {\n  // TODO: only include an item if predicate(item) is true — the CALLER\n  // supplies that decision logic, myFilter just applies it to every item\n  const result = []\n  for (const item of arr) {\n    result.push(item)\n  }\n  return result\n}',
        tests: `
assert JSON.stringify(myFilter([1,2,3,4,5], x => x % 2 === 0)) === JSON.stringify([2,4])
`,
        solution: `function myFilter(arr, predicate) {
  const result = []
  for (const item of arr) {
    if (predicate(item)) result.push(item)
  }
  return result
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `myReduce(arr, fn, initial)`, starting from `initial` and repeatedly combining the running accumulator with each element via `fn(acc, item)`, returning the final accumulated value — the SAME reduction mechanism must work for summing, multiplying, or any other combining behavior.',
        starter: '',
        tests: `
assert myReduce([1,2,3,4], (acc,x) => acc+x, 0) === 10
assert myReduce([1,2,3,4], (acc,x) => acc*x, 1) === 24
`,
        solution: `function myReduce(arr, fn, initial) {
  let acc = initial
  for (const item of arr) acc = fn(acc, item)
  return acc
}`,
      },
    ],
  },
]

export default challenges
