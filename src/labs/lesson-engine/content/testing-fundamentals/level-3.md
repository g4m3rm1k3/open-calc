---
series: testing-fundamentals
level: 3
title: Integration Tests and Testing Async Code
lang: javascript
---

# Integration Tests and Testing Async Code

Unit tests prove that individual pieces work in isolation. But isolation means the pieces are never talking to each other. Integration tests verify that the pieces actually work together: the service layer correctly uses the database layer, the API correctly parses request bodies, the job queue correctly enqueues and processes tasks.

Integration tests are slower than unit tests (they involve real database connections, real file I/O), but they catch a category of bugs that unit tests cannot: the bugs in how components interact. By the end of this lesson you will understand what integration tests test, how to structure them, and how to test async code including promises, timers, and event-driven behaviour.

## What integration tests test

```text
UNIT TEST (isolated):
  → function calculateDiscount(amount, rate) works correctly in isolation
  → The database is a fake

INTEGRATION TEST (real components):
  → OrderService.createOrder() correctly saves to the real database
  → The price is stored as the calculated discounted amount
  → The order status is 'pending' in the database after creation

THE GAP BETWEEN UNIT AND INTEGRATION:
  → Unit tests: "calculateDiscount returns the right number"
  → Integration tests: "the discounted number ends up in the database correctly"
  → The gap: unit tests don't verify the number goes through the ORM correctly,
             isn't rounded incorrectly by the database column type,
             isn't overwritten by a trigger, etc.
```

## Structuring integration tests

Integration tests need real dependencies — but controlled ones. Use a dedicated test database, not the development database.

```javascript
// Integration test: OrderService + real database (SQLite in-memory for speed)
import Database from 'better-sqlite3'
import { OrderService } from './order-service.js'
import { SqliteOrderRepository } from './sqlite-order-repository.js'

let db
let service

// Set up a fresh database before each test
function beforeEach() {
  db = new Database(':memory:')   // in-memory SQLite: fast, isolated, disposable
  db.exec(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_email TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    )
  `)

  const repo = new SqliteOrderRepository(db)
  service = new OrderService(repo)
}

// Clean up after each test
function afterEach() {
  db.close()
}

// Integration test: does the order get saved correctly?
async function test_createOrder_savesToDatabase() {
  // Arrange
  const orderData = {
    customerEmail: 'alice@example.com',
    items: [{ product: 'Widget', price: 25.00, quantity: 2 }],
  }

  // Act
  const order = await service.createOrder(orderData)

  // Assert: via the service (tests the interface)
  assert(order.id !== undefined)
  assert(order.total === 50.00)
  assert(order.status === 'pending')

  // Assert: via the database (tests that persistence actually worked)
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id)
  assert(row.customer_email === 'alice@example.com')
  assert(row.total === 50.00)
  assert(row.status === 'pending')
}
```

```text
INTEGRATION TEST SETUP PATTERNS:

  In-memory database (SQLite ':memory:'):
    → Fast (no disk I/O)
    → Isolated (each test gets a fresh database)
    → Limited (SQLite is not Postgres — some SQL may differ)

  Test database (real Postgres/MySQL, separate from dev):
    → Matches production exactly
    → Slower (real disk I/O, network)
    → Needs cleanup between tests (transactions that roll back, or truncate after each test)

  Transaction rollback (for fast cleanup):
    beforeEach: db.beginTransaction()
    afterEach:  db.rollback()   // undo all test changes, no truncation needed
```

## Testing async code

Async functions require specific patterns to test correctly. The most common mistake: not `await`-ing the async call in the test.

```javascript
// WRONG: the assertion runs before the async call completes
function test_fetchUser_returnsUser() {
  const promise = fetchUser(1)   // not awaited
  assert(promise.name === 'Alice')   // promise is not the user! promise.name is undefined
  // Test passes vacuously — the assertion is against the Promise object, not the result
}

// CORRECT: await the async call
async function test_fetchUser_returnsUser() {
  const user = await fetchUser(1)
  assert(user.name === 'Alice')
}
```

```javascript
// Testing that an async function throws
async function test_fetchUser_throwsForMissingUser() {
  let threw = false
  try {
    await fetchUser(99999)
  } catch (error) {
    threw = true
    assert(error.message.includes('not found'))
  }
  assert(threw, 'Expected fetchUser to throw for missing user')
}

// Alternatively, a utility that captures async throws:
async function assertThrows(asyncFn, expectedMessage) {
  try {
    await asyncFn()
    throw new Error('Expected function to throw, but it did not')
  } catch (error) {
    if (error.message === 'Expected function to throw, but it did not') throw error
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error "${expectedMessage}" but got "${error.message}"`)
    }
  }
}

await assertThrows(() => fetchUser(99999), 'not found')
```

## Controlling time in tests

Code that depends on `Date.now()`, `setTimeout`, or `setInterval` is non-deterministic in tests. Control time by injecting a clock.

```javascript
// PROBLEM: this function is hard to test because it uses the real clock
function createSession(userId) {
  return {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000,   // 30 minutes from "now"
  }
}

// SOLUTION: inject the clock
function createSession(userId, { now = Date.now } = {}) {
  const timestamp = now()
  return {
    userId,
    createdAt: timestamp,
    expiresAt: timestamp + 30 * 60 * 1000,
  }
}

// In tests: inject a fixed clock
const FIXED_TIME = 1700000000000   // a specific timestamp
const session = createSession('u_1', { now: () => FIXED_TIME })
assert(session.createdAt === FIXED_TIME)
assert(session.expiresAt === FIXED_TIME + 30 * 60 * 1000)
```

**CS lens:** Injecting time as a parameter is an instance of **parametric abstraction** — abstracting over a concrete resource (the system clock) by replacing it with a parameter. The function becomes a pure function of its inputs: same inputs → same output, always. This is why time injection makes tests deterministic: there is no external state that can vary between test runs. The same pattern applies to random number generation, UUIDs, and any other source of non-determinism.

## Testing event-driven and callback-based code

```javascript
// Testing code that uses EventEmitter or callbacks
function createEventCapture(emitter, eventName) {
  const events = []
  emitter.on(eventName, (data) => events.push(data))
  return {
    events,
    waitFor: (count, timeoutMs = 1000) => new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (events.length >= count) {
          clearInterval(interval)
          resolve(events)
        }
      }, 10)
      setTimeout(() => {
        clearInterval(interval)
        reject(new Error(`Expected ${count} events but only got ${events.length}`))
      }, timeoutMs)
    }),
  }
}

// Usage:
const store = new CounterStore()
const capture = createEventCapture(store, 'change')

store.increment()
store.increment()
store.increment()

const events = await capture.waitFor(3)
assert(events.length === 3)
assert(events[2].count === 3)
```

**SE lens:** The event capture pattern reveals a general testing principle: when testing asynchronous code, you need to **wait for the expected condition**, not just run to completion. `await` handles sequential async (one thing at a time); event capture handles concurrent async (many things happening over time). The `waitFor(count)` pattern is how integration tests for queues, streams, and event-driven systems avoid race conditions in test assertions.

**Common mistakes:**
- Not making test setup and teardown symmetric — if `beforeEach` opens a database connection, `afterEach` must close it. Leaked connections cause the next test to fail mysteriously.
- Testing the mock instead of the code — if you inject a mock that always returns `{ total: 100 }` and then assert that the result is `{ total: 100 }`, you are testing the mock, not the function. Make the mock return raw inputs; test that the function transforms them correctly.
- Not testing the unhappy integration path — most integration tests only test the successful case. Test what happens when the database is down, when the third-party API returns 500, when a record doesn't exist.

**Debug tip:** When an integration test fails intermittently (sometimes passes, sometimes fails), look for test isolation issues: shared state between tests, non-deterministic ordering, race conditions, or leaked async operations. A test that sometimes fails is worse than a test that always fails — it provides false confidence and is harder to diagnose. Common cause: tests that do not properly await all async work, leaving side effects to bleed into the next test.

## Challenge: async_test_utils

Implement utilities for testing async code.

```challenge
async function assertRejects(asyncFn, errorMatcher) {
  // asyncFn: an async function (no arguments) to call
  // errorMatcher: string (error message must contain this) or function (called with error, must return true)
  //
  // If asyncFn DOES NOT throw: throw Error('Expected function to throw but it did not')
  // If asyncFn throws but errorMatcher is a string and the message doesn't contain it:
  //   throw Error('Error message mismatch: expected "X" to include "Y"')
  // If asyncFn throws but errorMatcher is a function and it returns false:
  //   throw Error('Error did not match the provided predicate')
  // If all matches: return the error that was thrown
}

async function waitForCondition(predicate, timeoutMs = 500, intervalMs = 10) {
  // predicate: a function that returns true when the condition is met
  // timeoutMs: max wait time
  // intervalMs: how often to check
  //
  // Polls predicate every intervalMs milliseconds.
  // If predicate returns true: resolve immediately.
  // If timeoutMs elapses before predicate returns true: throw Error('Condition not met within Xms')
}
```

```test
// assertRejects: happy path
const err = await assertRejects(
  async () => { throw new Error('invalid input') },
  'invalid'
)
assert err.message === 'invalid input'

// assertRejects: did not throw
let metaThrew = false
try {
  await assertRejects(async () => 42, 'anything')
} catch (e) {
  metaThrew = true
  assert e.message.includes('Expected function to throw')
}
assert metaThrew

// assertRejects: with predicate
await assertRejects(
  async () => { throw new Error('timeout') },
  (e) => e.message === 'timeout'
)

// waitForCondition: resolves when condition is met
let count = 0
const increment = setInterval(() => count++, 50)
await waitForCondition(() => count >= 3, 1000)
clearInterval(increment)
assert count >= 3

// waitForCondition: times out
let threw = false
try {
  await waitForCondition(() => false, 100)
} catch (e) {
  threw = true
  assert e.message.includes('Condition not met')
}
assert threw
```
