import type { PracticeChallenge } from './loader'

export const title = 'Encapsulation'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `makeBankAccount(initialBalance)` that returns `{ deposit(amt), getBalance() }`, keeping the balance private (not directly accessible as a property).',
        starter: '',
        tests: `
const acc = makeBankAccount(100)
acc.deposit(50)
assert acc.getBalance() === 150
assert acc.balance === undefined
`,
        solution: 'function makeBankAccount(initialBalance) { let balance = initialBalance; return { deposit(amt) { balance += amt; }, getBalance() { return balance; } }; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish the `Counter` class with a private `#count` field starting at 0, an `increment()` method, and a `value` getter.',
        starter: 'class Counter {\n  // TODO: private #count field, increment(), value getter\n}',
        tests: `
const c = new Counter()
assert (c.increment(), true)
assert (c.increment(), true)
assert c.value === 2
`,
        solution: 'class Counter { #count = 0; increment() { this.#count++; } get value() { return this.#count; } }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `makeStack()` returning `{ push(x), pop(), peek(), isEmpty() }`, with the underlying array kept private.',
        starter: '',
        tests: `
const s = makeStack()
s.push(1)
s.push(2)
assert s.peek() === 2
assert s.pop() === 2
assert s.peek() === 1
assert s.isEmpty() === false
`,
        solution: 'function makeStack() { const items = []; return { push(x) { items.push(x); }, pop() { return items.pop(); }, peek() { return items[items.length - 1]; }, isEmpty() { return items.length === 0; } }; }',
      },
    ],
  },
]

export default challenges
