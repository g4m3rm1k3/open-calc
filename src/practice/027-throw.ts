import type { PracticeChallenge } from './loader'

export const title = 'throw'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `requirePositive(n)` that throws `new Error('must be positive')` if `n <= 0`, otherwise returns `n`.",
        starter: '',
        tests: `
assert requirePositive(5) === 5
let caught = null
try { requirePositive(-1) } catch (e) { caught = e.message }
assert caught === 'must be positive'
`,
        solution: "function requirePositive(n) { if (n <= 0) { throw new Error('must be positive'); } return n; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `divide(a, b)` so it throws `new Error('cannot divide by zero')` when `b` is `0`, otherwise returns `a / b`.",
        starter: 'function divide(a, b) {\n  // TODO: throw an Error if b is 0\n}',
        tests: `
assert divide(10, 2) === 5
let caught = null
try { divide(1, 0) } catch (e) { caught = e.message }
assert caught === 'cannot divide by zero'
`,
        solution: "function divide(a, b) { if (b === 0) { throw new Error('cannot divide by zero'); } return a / b; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `withdraw(balance, amount)` that throws a plain object `{ code: \'INSUFFICIENT_FUNDS\', shortfall }` (not an `Error`) when `amount` exceeds `balance`, otherwise returns `balance - amount`.',
        starter: '',
        tests: `
assert withdraw(100, 50) === 50
let caught = null
try { withdraw(100, 150) } catch (e) { caught = e }
assert caught.code === 'INSUFFICIENT_FUNDS'
assert caught.shortfall === 50
`,
        solution: "function withdraw(balance, amount) { if (amount > balance) { throw { code: 'INSUFFICIENT_FUNDS', shortfall: amount - balance }; } return balance - amount; }",
      },
    ],
  },
]

export default challenges
