import type { PracticeChallenge } from './loader'

export const title = 'Guard Clauses'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `describeInput(x)` using guard clauses (early returns) for `null` → `'null'`, `undefined` → `'undefined'`, a negative number → `'negative'`, otherwise `'ok'`.",
        starter: '',
        tests: `
assert describeInput(null) === 'null'
assert describeInput(undefined) === 'undefined'
assert describeInput(-5) === 'negative'
assert describeInput(5) === 'ok'
`,
        solution: "function describeInput(x) { if (x === null) return 'null'; if (x === undefined) return 'undefined'; if (typeof x === 'number' && x < 0) return 'negative'; return 'ok'; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `processOrder(order)` using guard clauses to validate — missing order → `'no order'`, empty items → `'empty order'`, non-positive total → `'invalid total'`, otherwise `'processing'`.",
        starter: "function processOrder(order) {\n  // TODO: use guard clauses (early returns) to validate order before 'processing'\n}",
        tests: `
assert processOrder(null) === 'no order'
assert processOrder({items:[], total: 10}) === 'empty order'
assert processOrder({items:[1], total: 0}) === 'invalid total'
assert processOrder({items:[1], total: 10}) === 'processing'
`,
        solution: "function processOrder(order) { if (!order) return 'no order'; if (!order.items || order.items.length === 0) return 'empty order'; if (order.total <= 0) return 'invalid total'; return 'processing'; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `safeAccess(obj)` using guard clauses to safely reach `obj.user.address.city`, returning `null` at the first missing link instead of nesting `if`s (a "pyramid of doom").',
        starter: '',
        tests: `
assert safeAccess(null) === null
assert safeAccess({user: null}) === null
assert safeAccess({user: {address: null}}) === null
assert safeAccess({user: {address: {city: 'NYC'}}}) === 'NYC'
`,
        solution: "function safeAccess(obj) { if (!obj) return null; if (!obj.user) return null; if (!obj.user.address) return null; return obj.user.address.city ?? null; }",
      },
    ],
  },
]

export default challenges
