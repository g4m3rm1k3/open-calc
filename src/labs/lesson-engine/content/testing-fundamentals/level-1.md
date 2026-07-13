---
series: testing-fundamentals
level: 1
title: Unit Tests — Structure and Patterns
lang: javascript
---

# Unit Tests — Structure and Patterns

A unit test tests one function or one class in isolation. It calls the function with specific inputs and asserts that the outputs match expectations. When a unit test fails, the failure tells you exactly which function is broken and what the wrong behaviour is.

Unit tests are the foundation of any test suite. They should be fast (milliseconds), reliable (no network, no database, no filesystem), and specific (one function per test). By the end of this lesson you will know how to structure unit tests, what to test, how to identify edge cases, and how to use the Arrange-Act-Assert pattern to write tests that communicate clearly.

## The Arrange-Act-Assert pattern

Every test has three phases: set up the inputs (Arrange), call the code under test (Act), and verify the result (Assert).

```javascript
// Testing a pure function with Arrange-Act-Assert (AAA)
import { calculateDiscount } from './pricing.js'

// Test 1: 10% discount on orders over $100
function test_calculateDiscount_applyDiscount() {
  // Arrange
  const amount = 200
  const discountRate = 0.10

  // Act
  const result = calculateDiscount(amount, discountRate)

  // Assert
  assert(result === 180, `Expected 180, got ${result}`)
}

// Test 2: no discount when rate is 0
function test_calculateDiscount_zeroDiscount() {
  // Arrange
  const amount = 150
  const discountRate = 0

  // Act
  const result = calculateDiscount(amount, discountRate)

  // Assert
  assert(result === 150, `Expected 150, got ${result}`)
}
```

```text
WHY ARRANGE-ACT-ASSERT MATTERS:
  → The structure is immediately recognisable — any reader knows where to look
  → Arrange is the test's documentation: what inputs does this case test?
  → Act is exactly one call — if you are calling multiple functions, you might be testing
    two things at once (split into two tests)
  → Assert is the specification: what should the output be?

NAMING TESTS:
  Name format: test_functionName_description
    test_calculateDiscount_appliesPercentageDiscount
    test_calculateDiscount_returnsOriginalAmountWhenRateIsZero
    test_calculateDiscount_throwsWhenRateIsNegative
  The description should explain WHAT CASE is being tested, not HOW it is tested.
```

## What to test: cases and edges

For every function, there are three categories of cases to test: the happy path, edge cases, and error cases.

```javascript
// Function under test:
function parseAmount(input) {
  if (typeof input !== 'string') throw new TypeError('Amount must be a string')
  const cleaned = input.replace(/[$,\s]/g, '')
  const amount = parseFloat(cleaned)
  if (isNaN(amount)) throw new Error(`Cannot parse amount: "${input}"`)
  if (amount < 0) throw new Error('Amount cannot be negative')
  return Math.round(amount * 100) / 100
}
```

```javascript
// HAPPY PATH: the normal case
// assert parseAmount('$1,234.56') === 1234.56
// assert parseAmount('  100  ')   === 100
// assert parseAmount('0.01')      === 0.01

// EDGE CASES: the boundary and zero cases
// assert parseAmount('$0')        === 0        (zero is valid)
// assert parseAmount('0.001')     === 0         (rounded to 2 dp — may be unexpected!)
// assert parseAmount('$999,999')  === 999999    (large number)

// ERROR CASES: invalid inputs that should throw
// throws TypeError for: parseAmount(100)    (number, not string)
// throws TypeError for: parseAmount(null)
// throws Error for:     parseAmount('abc')
// throws Error for:     parseAmount('-5')
// throws Error for:     parseAmount('')
```

```text
THE TESTING CHECKLIST FOR ANY FUNCTION:

  ✓ Happy path: typical valid inputs
  ✓ Boundary values:
      Numbers: 0, negative, max, min, fractional
      Strings: empty, single character, very long, special characters
      Arrays: empty [], single element [x], large array
      Objects: null, undefined, missing required properties
  ✓ Error paths: every throw/error condition the function can produce
  ✓ Combinations: multiple parameters that interact in non-obvious ways

  RULE OF THUMB: if you were fixing a bug in this function, what inputs would you test?
  Write those tests before you know there is a bug.
```

**CS lens:** Unit testing is a form of **specification testing** — you are testing whether the function's implementation matches its specification. The test cases you write define the specification. This is why "test the boundary cases" is important: boundaries are where specifications are often ambiguous or wrong. Does `parseAmount('0')` return `0` or throw? Does `calculateDiscount(100, 0.10)` return `90` or `90.00`? Tests force precision in specifications.

## Test isolation: one thing at a time

Each test should test exactly one behaviour. When a test fails, you should be able to identify the problem from the test name alone.

```javascript
// BAD: one test covering multiple behaviours
function test_calculateOrder() {
  const order = createOrder([item1, item2])
  applyDiscount(order, 0.10)
  applyTax(order, 0.08)
  const total = finaliseTotal(order)
  assert(total === 97.20)   // if this fails: which function is wrong?
}

// GOOD: each test covers one behaviour
function test_calculateSubtotal_sumsPriceTimesQuantity() {
  const items = [{ price: 10, quantity: 3 }, { price: 5, quantity: 2 }]
  assert(calculateSubtotal(items) === 40)
}

function test_applyDiscount_reducesTotalByPercentage() {
  assert(applyDiscount(100, 0.10) === 90)
}

function test_applyTax_addsPercentageToTotal() {
  assert(applyTax(90, 0.08) === 97.20)
}
```

```text
ISOLATION PRINCIPLES:
  → One assertion per test (or assertions that all verify the same fact)
  → One function under test per test file
  → No shared mutable state between tests
  → Each test sets up its own inputs (Arrange)
  → Test order should not matter — tests must be independent

WHEN ISOLATION IS BROKEN:
  → A test fails because a previous test left state in a wrong condition
  → Tests pass when run alone but fail when run together
  → Changing one test causes unrelated tests to fail
  Signal: your tests share mutable global state. Fix: reset state in a beforeEach/afterEach hook.
```

## Test helpers: DRY in tests

Repeated test setup code can be extracted into helpers. But keep helpers simple — obscure helpers make tests hard to understand.

```javascript
// Common: factory functions for test data
function makeUser(overrides = {}) {
  return {
    id: 'u_1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  }
}

// Usage:
const adminUser = makeUser({ role: 'admin' })
const premiumUser = makeUser({ email: 'vip@example.com', isPremium: true })

// HELPFUL: removes boilerplate, makes test data customisable
// UNHELPFUL: complex factory functions with conditional logic that you must understand
//            to understand the test
```

**SE lens:** Test factories (the `makeUser()` pattern) serve the same purpose as test fixtures — they provide a default valid object that the test can customise. This is the **Builder pattern** applied to test data. Without factories, every test creates a complete user object from scratch, including fields that are irrelevant to the test. Factories eliminate the noise and highlight what the test actually cares about: `makeUser({ role: 'admin' })` clearly says "this test is about admin users, not about email format."

**Common mistakes:**
- Writing tests that are longer than the code they test — if setting up the test requires more code than the function being tested, the function is probably too tightly coupled. Simplify the design before writing more test setup.
- Testing trivial code — getter functions, simple data transformations, and pass-through wrappers are often not worth testing. Focus test effort on logic with branches, edge cases, and error conditions.
- Asserting implementation details — `assert(internalList.length === 1)` tests how the function stores data internally. If the implementation changes (using a Map instead of an Array), the test breaks even though the behaviour is the same. Assert on observable outputs: return values, thrown errors, or observable state changes.

**Debug tip:** When a test fails unexpectedly, add `console.log` to print the actual values at the assertion point. Compare the actual to the expected. If the function returns `null` when you expected an object, trace back through the Arrange to check whether the setup produced what you thought it did. Most failing tests are caused by wrong setup (Arrange), not wrong implementation — the function is doing what it should but the inputs were not what you intended.

## Challenge: write_unit_tests

Write unit tests for a discount function, covering all cases.

```challenge
function applyCartDiscount(cart, coupon) {
  // cart: { items: [{ price: number, quantity: number }], total: number }
  // coupon: { code: string, type: 'percentage' | 'flat', value: number } | null
  //
  // Returns: { total: number, discountApplied: number }
  //   If coupon is null: no discount, discountApplied = 0
  //   If type === 'percentage': discount = total * (value / 100)
  //   If type === 'flat': discount = Math.min(value, total) (can't discount more than total)
  //   total (returned) = cart.total - discountApplied
  //   All values rounded to 2 decimal places
}
```

```test
const cart1 = { items: [], total: 100 }

// Percentage and flat coupons
const r1 = applyCartDiscount(cart1, { code: 'SAVE10', type: 'percentage', value: 10 })
assert r1.discountApplied === 10 && r1.total === 90
const r2 = applyCartDiscount(cart1, { code: 'FLAT5', type: 'flat', value: 5 })
assert r2.discountApplied === 5 && r2.total === 95

// No coupon: unchanged
const r3 = applyCartDiscount(cart1, null)
assert r3.discountApplied === 0 && r3.total === 100

// Flat coupon larger than total must not go negative
const r4 = applyCartDiscount({ items: [], total: 50 }, { code: 'BIG', type: 'flat', value: 200 })
assert r4.discountApplied === 50 && r4.total === 0

// Zero total
const r5 = applyCartDiscount({ items: [], total: 0 }, { code: 'SAVE10', type: 'percentage', value: 10 })
assert r5.discountApplied === 0 && r5.total === 0
```
