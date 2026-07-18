import type { PracticeChallenge } from './loader'

export const title = 'Magic Methods (Python)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write a `Money` class with `__init__(self, amount)`, `__add__(self, other)` (returns a new `Money` with summed amounts), `__str__(self)` (returns `f"${self.amount}"`), and `__eq__(self, other)` (compares `.amount`). Create `m1 = Money(10)`, `m2 = Money(5)`, compute `m3 = m1 + m2` and print it, then print `m1 == Money(10)` and `m1 == m2`.',
        starter: '',
        tests: `
assert output === '\\$15\\nTrue\\nFalse'
`,
        solution: `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __add__(self, other):
        return Money(self.amount + other.amount)

    def __str__(self):
        return f"\${self.amount}"

    def __eq__(self, other):
        return self.amount == other.amount


m1 = Money(10)
m2 = Money(5)
m3 = m1 + m2
print(m3)
print(m1 == Money(10))
print(m1 == m2)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Fix `Money`: it has no `__eq__` method, so `m1 == m2` falls back to Python\'s default IDENTITY comparison — two DIFFERENT `Money` instances with the same `.amount` compare as `False`, even though they represent the same value. Add `__eq__(self, other)` returning `self.amount == other.amount`, so equal amounts compare as `True`.',
        starter: `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __str__(self):
        return f"\${self.amount}"


m1 = Money(10)
m2 = Money(10)
print(m1 == m2)
`,
        tests: `
assert output === 'True'
`,
        solution: `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __str__(self):
        return f"\${self.amount}"

    def __eq__(self, other):
        return self.amount == other.amount


m1 = Money(10)
m2 = Money(10)
print(m1 == m2)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write `Money` with `__init__(self, amount)`, `__repr__(self)` (returns `f"${self.amount}"`), and `__lt__(self, other)` (compares `.amount`) — `__repr__` (not `__str__`) is what a LIST\'s own printed representation uses for each element. Create `amounts = [Money(30), Money(10), Money(20)]` and print `sorted(amounts)` — `sorted()` uses `__lt__` to order the custom objects.',
        starter: '',
        tests: `
assert output === '[\\$10, \\$20, \\$30]'
`,
        solution: `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __repr__(self):
        return f"\${self.amount}"

    def __lt__(self, other):
        return self.amount < other.amount


amounts = [Money(30), Money(10), Money(20)]
print(sorted(amounts))
`,
      },
    ],
  },
]

export default challenges
