import type { PracticeChallenge } from './loader'

export const title = 'ACID'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeAccount()` returning `{ withdraw(amount) }`, demonstrating Consistency: `withdraw` must throw (not apply the change) if it would make the balance negative, and return the new balance otherwise.',
        starter: '',
        tests: `
const account = makeAccount()
assert account.withdraw(50) === 50
let threw = false
try { account.withdraw(1000) } catch (e) { threw = true }
assert threw === true
assert account.withdraw(0) === 50
`,
        solution: `function makeAccount() {
  let balance = 100
  return {
    withdraw(amount) {
      const wouldBe = balance - amount
      if (wouldBe < 0) {
        throw new Error('Consistency violation: balance cannot go negative')
      }
      balance = wouldBe
      return balance
    },
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
        prompt: 'Fix `makeIsolatedCounter()`, demonstrating Isolation: a transaction\'s `increment()` must change its OWN staged value, not the shared `committed` value directly — an uncommitted change must be invisible to `counter.read()` until `commit()` is called.',
        starter: 'function makeIsolatedCounter() {\n  let committed = 0\n  return {\n    read() { return committed },\n    beginTransaction() {\n      let staged = committed\n      return {\n        // TODO: increment must change the transaction\'s own STAGED value,\n        // not the shared committed value directly — an uncommitted change\n        // must be invisible to outside reads until commit() is called\n        increment() { committed += 1 },\n        read() { return staged },\n        commit() { committed = staged },\n      }\n    },\n  }\n}',
        tests: `
const counter = makeIsolatedCounter()
const txn = counter.beginTransaction()
assert (txn.increment(), true)
assert txn.read() === 1
assert counter.read() === 0
assert (txn.commit(), true)
assert counter.read() === 1
`,
        solution: `function makeIsolatedCounter() {
  let committed = 0
  return {
    read() { return committed },
    beginTransaction() {
      let staged = committed
      return {
        increment() { staged += 1 },
        read() { return staged },
        commit() { committed = staged },
      }
    },
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
        prompt: 'Write `commitWithWAL(wal, key, value)` (appends `{ key, value }` to the write-ahead log array, returns `{ committed: true }`) and `recoverFromWAL(wal)` (rebuilds final state by replaying every logged entry) — demonstrating Durability: committed data survives being rebuilt from the durable log alone.',
        starter: '',
        tests: `
const wal = []
assert (commitWithWAL(wal, 'balance', 400), true)
const recoveredState = recoverFromWAL(wal)
assert recoveredState.balance === 400
`,
        solution: `function commitWithWAL(wal, key, value) {
  wal.push({ key, value })
  return { committed: true }
}
function recoverFromWAL(wal) {
  const state = {}
  for (const entry of wal) state[entry.key] = entry.value
  return state
}`,
      },
    ],
  },
]

export default challenges
