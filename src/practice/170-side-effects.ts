import type { PracticeChallenge } from './loader'

export const title = 'Side Effects'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `calculateTotal(items)` (pure — sums `item.price` across `items`) and `checkout(items)` (calls `calculateTotal`, then returns the total — the pure computation and the eventual side effect step stay clearly separate).',
        starter: '',
        tests: `
const items = [{price:10},{price:25}]
assert calculateTotal(items) === 35
assert checkout(items) === 35
`,
        solution: `function calculateTotal(items) {
  return items.reduce((sum, i) => sum + i.price, 0)
}
function checkout(items) {
  const total = calculateTotal(items)
  return total
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `calculateTotalWithLog(items, log)`: compute the total PURELY first (no side effects inside the loop), then push exactly ONE log entry with the final total — don\'t scatter a side effect into every iteration of the core computation.',
        starter: 'function calculateTotalWithLog(items, log) {\n  // TODO: compute the total PURELY first (with no side effects inside the\n  // loop), then push exactly ONE log entry with the final total — don\'t\n  // scatter a side effect into every iteration of the core computation\n  let sum = 0\n  for (const i of items) {\n    sum += i.price\n    log.push(\'added \' + i.price)\n  }\n  return sum\n}',
        tests: `
const items = [{price:10},{price:25},{price:5}]
const log = []
const total = calculateTotalWithLog(items, log)
assert total === 40
assert log.length === 1
assert log[0] === 'Total: $40'
`,
        solution: `function calculateTotalWithLog(items, log) {
  const total = items.reduce((sum, i) => sum + i.price, 0)
  log.push('Total: $' + total)
  return total
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `calculatePure(items)` (pure) and `functionalCoreImperativeShell(items, sideEffectFn)` — the "functional core, imperative shell" pattern: compute the result with the pure core, THEN call the injected `sideEffectFn` with it as a separate final step, returning the result either way.',
        starter: '',
        tests: `
const items = [{price:10},{price:20}]
const effects = []
const result = functionalCoreImperativeShell(items, total => effects.push('saved:' + total))
assert result === 30
assert JSON.stringify(effects) === JSON.stringify(['saved:30'])
`,
        solution: `function calculatePure(items) {
  return items.reduce((sum, i) => sum + i.price, 0)
}
function functionalCoreImperativeShell(items, sideEffectFn) {
  const result = calculatePure(items)
  sideEffectFn(result)
  return result
}`,
      },
    ],
  },
]

export default challenges
