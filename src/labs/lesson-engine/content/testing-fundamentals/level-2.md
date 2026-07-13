---
series: testing-fundamentals
level: 2
title: Test Doubles — Mocks, Stubs, and Fakes
lang: javascript
---

# Test Doubles — Mocks, Stubs, and Fakes

Unit tests test functions in isolation — but most functions call other functions, reach out to databases, or send HTTP requests. When writing a unit test, you do not want a real database, a real email service, or a real clock. You want control: make the database return exactly this data, make the email fail with exactly this error, make the clock return exactly this timestamp.

Test doubles are the replacements you use in place of real dependencies. The term "test double" comes from the film industry concept of a stunt double — a stand-in that looks and behaves enough like the real thing to serve the test's purpose. By the end of this lesson you will understand the different types of test doubles (fakes, stubs, mocks, spies), when to use each, and how to write them in plain JavaScript.

## The vocabulary: four types of test doubles

```text
FAKE:
  A working implementation that is simpler than the real thing.
  Example: an in-memory array instead of a real database.
  Has real behaviour but no external dependencies or complexity.

STUB:
  Returns pre-configured values.
  No real behaviour — just data.
  Example: a stub that always returns { user: { id: 1, email: 'a@b.com' } }.

SPY:
  Records calls made to it (what was called, with what arguments, how many times).
  May or may not have behaviour.
  Example: a spy on sendEmail that records each call but does nothing.

MOCK:
  A stub OR spy with expectations.
  Pre-programmed with the calls it expects to receive.
  Fails the test if not called as expected.
  Example: expect sendEmail to be called exactly once with subject 'Welcome'.
```

## Fakes: working implementations

```javascript
// FAKE: an in-memory implementation of a database interface
class InMemoryUserRepository {
  #users = new Map()
  #nextId = 1

  async insert(userData) {
    const id = this.#nextId++
    const user = { id, ...userData, createdAt: new Date() }
    this.#users.set(id, user)
    return user
  }

  async findById(id) {
    return this.#users.get(id) ?? null
  }

  async findByEmail(email) {
    for (const user of this.#users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async delete(id) {
    this.#users.delete(id)
  }

  // Test helper: inspect internal state
  count() { return this.#users.size }
  all() { return Array.from(this.#users.values()) }
}

// In tests:
const repo = new InMemoryUserRepository()
const service = new UserService(repo)   // inject the fake

const user = await service.createUser({ email: 'alice@example.com', name: 'Alice' })
assert(user.id === 1)
assert(repo.count() === 1)   // inspect the fake's state
```

```text
FAKES ARE BEST WHEN:
  → The dependency is used across many tests
  → The real implementation is slow (database) or has external dependencies (API)
  → The fake can be reused across test files
  → You want to test multiple operations interacting (e.g., insert then find)

FAKE DISCIPLINE:
  → The fake must implement the SAME interface as the real thing
  → The fake's behaviour must be consistent with the real thing's contract
    (If the real DB returns null for missing records, so should the fake)
  → Keep fakes simple — complex fakes are as hard to maintain as the real code
```

## Stubs: pre-configured return values

```javascript
// STUB: an object that returns specific values when called
function makeUserStub(overrides = {}) {
  const defaultUser = { id: 1, email: 'alice@example.com', name: 'Alice', role: 'user' }
  return {
    findById: async () => ({ ...defaultUser, ...overrides }),
    findByEmail: async () => null,
    insert: async (data) => ({ id: 99, ...data }),
  }
}

// Usage:
const stub = makeUserStub({ role: 'admin' })
const result = await stub.findById(1)
assert(result.role === 'admin')

// Stub that simulates failure:
const failingStub = {
  findById: async () => { throw new Error('Database connection failed') },
  findByEmail: async () => null,
  insert: async () => { throw new Error('Database connection failed') },
}
```

**CS lens:** A stub is an implementation of the **null object pattern** extended with pre-configured return values. The null object always returns safe defaults; a stub returns test-specific values. Both serve the same purpose: satisfying a dependency interface without requiring the real dependency. This is the same principle as dependency injection — the caller does not care which implementation it receives, so you inject the simplest one that satisfies the test.

## Spies: recording calls

```javascript
// SPY: records calls but does not change behaviour (wraps the real thing)
function createSpy(realFn) {
  const calls = []
  const spy = function(...args) {
    calls.push({ args, timestamp: Date.now() })
    return realFn.apply(this, args)
  }
  spy.calls = calls
  spy.callCount = () => calls.length
  spy.calledWith = (...expectedArgs) =>
    calls.some(c => JSON.stringify(c.args) === JSON.stringify(expectedArgs))
  return spy
}

// Usage:
const realCalc = (a, b) => a + b
const spy = createSpy(realCalc)

spy(2, 3)
spy(10, 20)

assert(spy.callCount() === 2)
assert(spy.calledWith(2, 3))
assert(spy.calledWith(10, 20))
assert(!spy.calledWith(99, 0))
```

```javascript
// SPY for a method — useful when you need to verify side effects
function spyOn(obj, methodName) {
  const original = obj[methodName]
  const calls = []

  obj[methodName] = function(...args) {
    calls.push(args)
    return original.apply(this, args)
  }

  return {
    calls,
    callCount: () => calls.length,
    restore: () => { obj[methodName] = original },
  }
}
```

## Building a minimal mock from scratch

```javascript
// Mock: stub + expectations — verifies calls after the test
function createMock(expectations = {}) {
  const actual = {}

  for (const [method, config] of Object.entries(expectations)) {
    const calls = []
    actual[`${method}Calls`] = calls

    if (config.returnValue !== undefined) {
      actual[method] = async (...args) => {
        calls.push(args)
        return config.returnValue
      }
    } else if (config.throw) {
      actual[method] = async (...args) => {
        calls.push(args)
        throw new Error(config.throw)
      }
    }
  }

  actual.verify = () => {
    for (const [method, config] of Object.entries(expectations)) {
      const calls = actual[`${method}Calls`]
      if (config.calledTimes !== undefined) {
        if (calls.length !== config.calledTimes) {
          throw new Error(`Expected ${method} to be called ${config.calledTimes} times, but was called ${calls.length} times`)
        }
      }
    }
  }

  return actual
}

// Usage:
const emailMock = createMock({
  sendWelcomeEmail: { returnValue: true, calledTimes: 1 }
})

const service = new UserService(fakeRepo, emailMock)
await service.registerUser('alice@example.com', 'password123')

emailMock.verify()   // throws if sendWelcomeEmail was not called exactly once
```

**SE lens:** Mocks are the most powerful and the most abused type of test double. The power: they verify that the right calls were made with the right arguments — useful for side effects that have no observable return value (sending an email, logging an audit event). The abuse: when mocks specify the exact internal implementation path (mock A calls B calls C calls D in this order), the test breaks every time the implementation changes, even if the observable behaviour is the same. The rule: mock the interface boundary (the external service), not the internal call sequence.

**Common mistakes:**
- Mocking everything — when every dependency is mocked, you are not testing the function's logic; you are testing that the function calls things in the right order. This is "testing the test". Only mock what crosses a real boundary (network, database, time, randomness).
- Using production mocks (stubs that call real external APIs in "test mode") — calling a real Stripe test account in tests is slow, requires network, and may have rate limits. Use a fake that simulates the Stripe interface locally.
- Not resetting mock state between tests — if a spy accumulates calls across tests, a later test may fail because it sees calls from an earlier test. Reset (or recreate) mocks in beforeEach.

**Debug tip:** When a test that passes a mock fails unexpectedly: first check what the mock is actually returning. Add a log inside the mock to print what is being called and what is being returned. Most mock failures are caused by: wrong return value, wrong argument being passed, or the mock not being called at all (because the code under test bailed out early before reaching the mock call).

## Challenge: fake_repository

Implement an in-memory repository that matches a database interface for use in tests.

```challenge
function createInMemoryProductRepository() {
  // Implements the same interface as a real ProductRepository:
  //   insert({ name, price, category }): inserts and returns the new product with generated id
  //   findById(id): returns the product or null
  //   findByCategory(category): returns array of products in that category
  //   update(id, changes): merges changes into the product; returns updated product or null if not found
  //   count(): returns total number of products
}
```

```test
const repo = createInMemoryProductRepository()

const p1 = await repo.insert({ name: 'Widget', price: 9.99, category: 'tools' })
const p2 = await repo.insert({ name: 'Gadget', price: 24.99, category: 'tech' })
assert p1.id !== undefined && p1.name === 'Widget' && p2.id !== p1.id

assert (await repo.findById(p1.id)).name === 'Widget' && (await repo.findById(99999)) === null

const tools = await repo.findByCategory('tools')
assert tools.length === 1 && tools[0].name === 'Widget'

const updated = await repo.update(p1.id, { price: 12.99 })
assert updated.price === 12.99 && updated.name === 'Widget'   // unchanged fields preserved
assert (await repo.update(99999, { price: 5 })) === null

assert await repo.count() === 2
```
