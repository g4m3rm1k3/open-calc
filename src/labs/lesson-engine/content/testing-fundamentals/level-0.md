---
series: testing-fundamentals
level: 0
title: Why We Test
lang: javascript
---

# Why We Test

Most developers know they should write tests. Fewer understand why tests are worth the time they cost, or why tests that exist are often insufficient to prevent the bugs that actually reach production. Testing is not a box to check — it is a practice with specific techniques that provide specific benefits.

By the end of this lesson you will understand what tests actually guarantee (and what they don't), how tests change the way code is designed, and why the feedback loop tests provide is more valuable than the bug prevention alone. By the end of this series you will be able to write unit tests, integration tests, and know when each is appropriate.

## What tests actually do

```text
WHAT A PASSING TEST GUARANTEES:
  → The code behaves as specified in the test, for the inputs provided in the test.
  → That is it. No more.

WHAT A PASSING TEST DOES NOT GUARANTEE:
  → The code is correct for ALL possible inputs.
  → The code is correct in all environments.
  → The code handles edge cases you did not test.
  → The code will remain correct after future changes.

FAMOUS INSIGHT (Dijkstra):
  "Testing can show the presence of bugs, but not their absence."

WHY TESTS ARE STILL WORTH WRITING:
  → Regression prevention: once a bug is fixed, a test ensures it never comes back.
  → Specification: tests are executable documentation of what the code is supposed to do.
  → Refactoring safety: a test suite lets you change implementation without fear.
  → Fast feedback: "npm test" tells you in 2 seconds if something broke — before the user does.
  → Design pressure: code that is hard to test is hard to understand and hard to change.
    Testing pressure is design pressure.
```

## The testing pyramid

Different types of tests make different tradeoffs between speed, reliability, and coverage:

```text
THE TESTING PYRAMID:

                  ▲
                 /  \
                / E2E \     ← End-to-end: test the full app as a user
               /  (few) \      Slow, brittle, expensive to write
              /──────────\
             / Integration\  ← Integration: test components working together
            / (moderate)   \    Medium speed, tests real interactions
           /────────────────\
          /   Unit Tests      \ ← Unit: test one function/class in isolation
         /    (many)           \   Fast, reliable, cheap to write and run
        /──────────────────────\

UNIT TESTS:
  → Test one function, one class, one module in isolation
  → Dependencies are replaced with fakes/mocks
  → Run in milliseconds — entire suite in seconds
  → High volume: test every case, every edge, every error path

INTEGRATION TESTS:
  → Test multiple components working together (e.g., service + real database)
  → Dependencies are real or use a test double for external services only
  → Run in seconds to minutes
  → Medium volume: test the main paths, not every edge case

END-TO-END TESTS:
  → Test the full system from user action to database change
  → Everything is real — browser, server, database
  → Slow, fragile (UI changes break them), expensive
  → Low volume: test the critical user journeys only
```

## Testing as design pressure

The hardest-to-test code is usually the worst-designed code. This is not a coincidence.

```javascript
// HARD TO TEST: tightly coupled to the database and email service
async function registerUser(email, password) {
  const user = await db.users.insert({ email, password: hash(password) })
  await emailService.sendWelcomeEmail(user.email)
  return user
}
// To test this: need a real database AND a real email service
// OR: complex mocking setup for each test

// EASY TO TEST: dependencies are injected
async function registerUser(email, password, { userRepository, emailService }) {
  const user = await userRepository.insert({ email, password: hash(password) })
  await emailService.sendWelcomeEmail(user.email)
  return user
}
// To test: create tiny fakes for userRepository and emailService
// const fakeRepo = { insert: async (data) => ({ id: 1, ...data }) }
// const fakeEmail = { sendWelcomeEmail: async () => {} }
// const user = await registerUser('alice@example.com', 'password', { userRepository: fakeRepo, emailService: fakeEmail })
```

```text
THE DESIGN PRESSURE CYCLE:
  Hard to test → must inject dependencies → naturally low coupling
  Hard to test → must separate concerns → naturally single responsibility
  Hard to test → must use pure functions where possible → naturally testable

  Following testing pressure naturally produces SOLID designs.
  Tests are not just verification — they are a design tool.
```

**CS lens:** A test is a **specification expressed as code**. It states: "given these inputs, the function should produce this output." This is the same as a mathematical function definition: f(x) = y. For pure functions, this specification is complete — every input maps to exactly one output, and the test captures the mapping. For functions with side effects, the specification must also capture the effects: "after calling this function, the database should contain this record." Tests are formal specifications that happen to be executable.

**SE lens:** The most practical argument for testing is not "catch bugs before production" — it is **refactoring safety**. Without tests, changing the implementation of a function requires manually verifying that all callers still work. With tests, you change the implementation and run the suite: if it passes, the observable behaviour (as measured by the tests) has not changed. This safety is what makes codebases improvable over time rather than accumulating technical debt that becomes too risky to touch.

**Common mistakes:**
- Writing tests after the code is "working" — testing is most valuable during development, not after. Writing the test first (or alongside) forces you to think about the interface before the implementation.
- Testing implementation instead of behaviour — `assert(db.users.insert.calledOnce)` tests that a specific function was called, not that the user was saved. If the implementation changes (using a different ORM), the test breaks even though the behaviour is the same. Test observable behaviour, not internal mechanics.
- Not testing failure paths — most test suites have good coverage of the happy path and almost no coverage of error cases. But production failures almost always happen in error paths. Test every `throw`, every `null` check, every `else` branch.

**Debug tip:** When you fix a bug, write a test that reproduces the bug first, watch it fail, then fix the code and watch it pass. This is called regression testing. The test now ensures that the bug never silently comes back in the future. It also documents exactly what went wrong, which is useful months later when someone asks "why is this test here?"

## Challenge: test_reasoning

Reason about what tests guarantee and where they are appropriate.

```challenge
function testReasoning(scenario) {
  if (scenario === 'what-passing-means') {
    // A function has 5 tests, all passing.
    // Does this guarantee the function is bug-free?
    return {
      bugFree: false,   // true or false
      reason: '',       // one sentence
    }
  }

  if (scenario === 'design-pressure') {
    // A function is hard to test because it reads from the database directly.
    // What design change would make it easier to test?
    return {
      change: '',   // one sentence describing the change
    }
  }

  if (scenario === 'test-type') {
    // You are testing a function that calculates tax for an order.
    // It takes an order object and returns a number. No database, no network.
    // Which type of test should this be?
    return {
      type: '',   // 'unit' | 'integration' | 'end-to-end'
    }
  }

  if (scenario === 'regression') {
    // A bug is reported: orders with $0 total are being charged tax.
    // What should you do BEFORE fixing the bug?
    return {
      action: '',   // one sentence
    }
  }
}
```

```test
const w = testReasoning('what-passing-means')
assert w.bugFree === false && w.reason.length > 15

const d = testReasoning('design-pressure')
assert d.change.length > 15
assert d.change.toLowerCase().includes('inject') || d.change.toLowerCase().includes('parameter') || d.change.toLowerCase().includes('pass')

const t = testReasoning('test-type')
assert t.type === 'unit'

const r = testReasoning('regression')
assert r.action.length > 15
assert r.action.toLowerCase().includes('test') || r.action.toLowerCase().includes('reproduc')
```
