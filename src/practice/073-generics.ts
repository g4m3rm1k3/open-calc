import type { PracticeChallenge } from './loader'

export const title = 'Generics'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `firstOrNull(items)` returning the first element of `items`, or `null` if it\'s empty — the same function body must work correctly no matter what type the array holds.',
        starter: '',
        tests: `
assert firstOrNull([1,2,3]) === 1
assert firstOrNull(['a','b']) === 'a'
assert firstOrNull([]) === null
`,
        solution: `function firstOrNull(items) {
  return items.length > 0 ? items[0] : null
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `makeGenericStack()` returning `{ push(x), pop(), peek(), size() }` — a stack that works for ANY type of value pushed onto it (numbers, strings, objects), not just one hard-coded type.',
        starter: 'function makeGenericStack() {\n  // TODO: return { push(x), pop(), peek(), size() } — a stack that works for ANY type of value\n}',
        tests: `
const s = makeGenericStack()
assert (s.push(1), true)
assert (s.push('two'), true)
assert (s.push({ three: 3 }), true)
assert s.size() === 3
assert JSON.stringify(s.pop()) === JSON.stringify({ three: 3 })
assert s.pop() === 'two'
assert s.peek() === 1
`,
        solution: `function makeGenericStack() {
  const items = []
  return {
    push(x) { items.push(x) },
    pop() { return items.pop() },
    peek() { return items[items.length - 1] },
    size() { return items.length },
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
        prompt: 'Write `maxBy(a, b, keyFn)` returning whichever of `a` or `b` has the larger `keyFn(x)` value — a generic max that works on numbers, strings, or objects, since it never compares `a` and `b` directly, only via the supplied key function (the "constraint" a plain `>` couldn\'t express).',
        starter: '',
        tests: `
assert maxBy(3, 5, x => x) === 5
assert maxBy('apple', 'fig', x => x.length) === 'apple'
assert JSON.stringify(maxBy({name:'a',score:10}, {name:'b',score:20}, x => x.score)) === JSON.stringify({name:'b',score:20})
`,
        solution: `function maxBy(a, b, keyFn) {
  return keyFn(a) >= keyFn(b) ? a : b
}`,
      },
    ],
  },
]

export default challenges
