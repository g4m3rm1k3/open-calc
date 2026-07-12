---
series: software-construction
level: 12
title: Testing as You Build
lang: javascript
---

# Testing as You Build

Testing is not a phase that comes after writing code. It is a practice woven into the act of writing code. The distinction matters because code written without tests is systematically different from code written with tests: it tends to have hidden dependencies, hard-to-call functions, and tangled concerns — because no external caller (the test) ever exercised it before the first real user did.

Writing tests as you build forces a specific discipline: every function must be callable from outside itself, with any inputs, producing a verifiable output. Functions that cannot be tested without setting up a database, without starting a server, without modifying global state — these are functions with design problems that the tests are revealing. Tests are a quality signal, not just a verification tool.

By the end of this lesson you will understand what makes code testable vs untestable, how to write unit tests that are fast and reliable, and how to use tests to drive design decisions rather than verify them after the fact.

## What makes code testable

The single most important property of testable code is: **a function's behaviour depends only on its inputs and returns its result, with no hidden dependencies**.

```javascript
// UNTESTABLE: hidden dependencies make the output unpredictable from outside
function calculateShippingCost(orderId) {
  const order = globalOrderCache[orderId]       // depends on global state — what is in the cache?
  const rate  = config.shippingRatePerKg        // depends on config — what is the rate?
  const now   = new Date()                      // depends on the current time — which second?
  return order.weightKg * rate * (now.getHours() < 12 ? 0.9 : 1)  // peak hours surcharge
}

// To test this, you must: populate globalOrderCache with the right data,
// set config.shippingRatePerKg to a known value, AND control what new Date() returns.
// Three things to set up just to call one function.
```

```javascript
// TESTABLE: all dependencies are explicit inputs
function calculateShippingCost(weightKg, ratePerKg, isPeakHour) {
  const multiplier = isPeakHour ? 1 : 0.9
  return weightKg * ratePerKg * multiplier
}
```

```text
calculateShippingCost(5, 2.00, false)   → 9.00   (5kg × $2 × 0.9 off-peak)
calculateShippingCost(5, 2.00, true)    → 10.00  (5kg × $2 × 1.0 peak)
calculateShippingCost(0, 2.00, false)   → 0.00   (zero weight, zero cost)

No setup required. The function takes numbers in and produces a number out.
The test is: "given these inputs, assert this output." That is all.
```

## Writing a unit test

A unit test has three parts: **Arrange** (set up inputs), **Act** (call the function), **Assert** (verify the output).

```javascript
// The function under test:
function formatCurrency(amountCents, currencyCode = 'USD') {
  if (typeof amountCents !== 'number' || amountCents < 0) {
    throw new TypeError('amountCents must be a non-negative number')
  }
  const amount = amountCents / 100
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode })
    .format(amount)
}

// The tests:
function testFormatCurrency() {
  // Arrange + Act + Assert — all in one line for simple cases
  console.assert(formatCurrency(1999) === '$19.99',    'whole dollar amount')
  console.assert(formatCurrency(100)  === '$1.00',     'one dollar')
  console.assert(formatCurrency(0)    === '$0.00',     'zero amount')
  console.assert(formatCurrency(1999, 'EUR') === '€19.99', 'EUR currency')

  // Test the error case:
  let threw = false
  try { formatCurrency(-100) } catch { threw = true }
  console.assert(threw, 'negative amount should throw')
}
```

```text
What these tests cover:
  Happy path: standard dollar amounts
  Edge cases: zero, different currencies
  Error case: negative input (contract enforcement)

What they do NOT need:
  A database. A server. A configuration file. An environment variable.
  Nothing. Just the function.

Each test is: arrange inputs → call function → assert output.
If the assertion fails, the test tells you exactly what failed and what it expected.
```

**CS lens:** The practice of writing tests that are fast, isolated, and fully deterministic is called **unit testing**. The "unit" is the smallest testable piece of logic — typically a single function. Unit tests run in milliseconds and can be run thousands of times per development session. They contrast with integration tests (which test multiple units working together, including databases and APIs) and end-to-end tests (which test a complete user workflow through the UI). The testing pyramid says: many unit tests, fewer integration tests, very few end-to-end tests. Unit tests are cheap because they have no infrastructure dependencies.

## Testing edge cases

The most valuable tests are not the happy-path tests — those are obvious. The most valuable tests are the ones that cover the cases where code frequently breaks: empty inputs, boundary values, invalid types, and combinations that "shouldn't happen" but do.

```javascript
// findMostExpensive(items) — finds the most expensive item in an array
function findMostExpensive(items) {
  if (!Array.isArray(items) || items.length === 0) return null
  return items.reduce((max, item) => item.price > max.price ? item : max)
}

// Tests to write:
function testFindMostExpensive() {
  // Single item — "most expensive of one" is that item
  const single = findMostExpensive([{ name: 'Hat', price: 20 }])
  console.assert(single.name === 'Hat', 'single item')

  // Multiple items — finds the right one
  const items = [{ name: 'Shirt', price: 30 }, { name: 'Jacket', price: 120 }, { name: 'Socks', price: 5 }]
  console.assert(findMostExpensive(items).name === 'Jacket', 'finds highest price')

  // Tie — picks one (either is acceptable, but the test documents which)
  const tied = [{ name: 'A', price: 50 }, { name: 'B', price: 50 }]
  console.assert(findMostExpensive(tied).price === 50, 'tied prices')

  // Empty — returns null, not an error
  console.assert(findMostExpensive([]) === null, 'empty array')

  // Invalid input — returns null, not an error
  console.assert(findMostExpensive(null) === null, 'null input')
}
```

```text
Test coverage guide — for any function, ask:
  What is the expected happy-path output?           → test it
  What happens at the minimum valid input?          → test it (1 item, 0 amount, empty string that is valid)
  What happens at the maximum valid input?          → test it if there is a boundary
  What happens with an empty collection or zero?   → test it
  What happens with invalid input types?            → test it
  What happens with null or undefined?              → test it
  What are the failure cases I explicitly handle?  → test them

If you can answer all of these questions with passing tests, the function is well-tested.
```

**SE lens:** Tests are most valuable when they are written at the same time as the code, not after. "I'll add tests later" produces code that is hard to test (because testability was not a design constraint) and tests that do not get written (because the feature is already "done"). The discipline is: no function is done until it has tests. This is not a bureaucratic rule — it is the constraint that produces testable, decoupled design, because the act of writing the test forces you to think: "how would I call this without setting up everything around it?"

**Common mistakes:**
- Testing implementation details rather than behaviour — if the test breaks when you rename a private variable, it is testing too deeply. Tests should test what a function returns, not how it works internally.
- Writing tests only for the happy path — the edge cases are where production bugs live. Test the paths you have written code to handle, not just the most common case.
- Tests that depend on each other — test A sets up state that test B relies on. When test A fails, test B also fails for the wrong reason. Each test must be fully independent.

**Debug tip:** When a function is hard to test, the difficulty is diagnostic. "I need a database to test this" → the function is directly coupled to the database; inject the dependency. "I cannot control the output because it depends on the current time" → pass the time as a parameter. "I need to set three globals before calling this" → the function has too many hidden dependencies. The test reveals the design problem.

## Challenge: test_cart_total

Write the function and tests for a cart total calculator. The function `cartTotal(items, discountCode)` sums item prices, applies a discount if the code is valid (`'SAVE10'` = 10% off, `'SAVE20'` = 20% off), and returns the total rounded to 2 decimal places.

```challenge
const DISCOUNT_CODES = { 'SAVE10': 0.10, 'SAVE20': 0.20 }

function cartTotal(items, discountCode = null) {
  // items: [{ price: number, quantity: number }]
  // Returns the total after discount, rounded to 2 decimal places.
}
```

```test
assert cartTotal([{ price: 10, quantity: 2 }]) === 20
assert cartTotal([{ price: 10, quantity: 2 }, { price: 5, quantity: 1 }]) === 25
assert cartTotal([{ price: 100, quantity: 1 }], 'SAVE10') === 90
assert cartTotal([{ price: 100, quantity: 1 }], 'SAVE20') === 80
assert cartTotal([{ price: 100, quantity: 1 }], 'BOGUS') === 100
assert cartTotal([]) === 0
assert cartTotal([{ price: 9.99, quantity: 3 }]) === 29.97
```
