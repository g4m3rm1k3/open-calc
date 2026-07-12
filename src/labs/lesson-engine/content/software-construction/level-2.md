---
series: software-construction
level: 2
title: Designing Functions
lang: javascript
---

# Designing Functions

A function is the smallest unit of reuse in a program. It is also the smallest unit of misdesign. A function that does too much, takes the wrong arguments, mutates things it shouldn't, or returns results nobody can predict is not a building block — it is a hazard.

Good function design is not a matter of taste. There are specific, learnable properties that determine whether a function is trustworthy: its contract (what it promises), its inputs (what it needs), its outputs (what it produces), and whether it can be predicted. Each property has a direct impact on whether the function can be tested, reused, and changed safely.

By the end of this lesson you will be able to write functions with clear contracts, make deliberate decisions about parameters and return values, understand the difference between pure and impure functions, and know when each is appropriate.

## The function contract

A contract is an agreement between the function and its callers. It has two parts:

```text
PRECONDITIONS — what the caller must guarantee before calling
  "email must be a non-empty string"
  "items must be an array with at least one element"
  "amount must be a positive number"

POSTCONDITIONS — what the function guarantees when it returns
  "returns true if the email is valid, false otherwise — never throws"
  "returns a new sorted array — the original is not modified"
  "returns a number rounded to two decimal places"
```

```javascript
// Contract stated clearly in the function name and documentation:
// Precondition:  items is a non-empty array of numbers
// Postcondition: returns the arithmetic mean, rounded to 2 decimal places
function averageOf(items) {
  const sum = items.reduce((total, item) => total + item, 0)
  return Math.round((sum / items.length) * 100) / 100
}
```

```text
averageOf([10, 20, 30])   → 20       (sum=60, length=3, mean=20)
averageOf([1, 2])          → 1.5     (sum=3, length=2, mean=1.5)
averageOf([7])             → 7       (sum=7, length=1, mean=7)

The contract is: "give me a non-empty array of numbers, I give you their average."
The function honours that contract on every valid input.
What it does NOT contract: what happens if items is empty. That is undefined behaviour
within this contract — the precondition excludes empty arrays.
```

The contract is the most important thing to decide before writing the body of the function. Once the contract is clear, the implementation is usually straightforward.

## Parameters — what a function needs to know

A function's parameters are its explicit dependencies: the things it admits needing. Good parameter design keeps that list minimal and honest.

```javascript
// BAD: the function secretly depends on global state
let taxRate = 0.2

function calculateTotal(subtotal) {
  return subtotal + subtotal * taxRate   // reads taxRate from outside
}

// GOOD: the function declares all its dependencies
function calculateTotal(subtotal, taxRate) {
  return subtotal + subtotal * taxRate
}
```

```text
Why the second form is better:

  calculateTotal(100, 0.2)  → 120   (explicit, readable at the call site)
  calculateTotal(100, 0.0)  → 100   (easy to test zero-tax case)
  calculateTotal(100, 0.15) → 115   (easy to test other rates)

  The first form forces you to mutate global state to test different rates.
  It also hides a dependency — reading the function signature tells you nothing
  about taxRate. You discover the dependency by reading the body.

  Rule: a function should receive everything it needs as parameters.
        It should not reach outside itself for values.
```

```javascript
// Parameters should describe what the caller knows, not implementation details

// BAD: caller must know internal representation
function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// GOOD: caller works with what they naturally have
function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
```

**CS lens:** The principle that a function should receive all its dependencies as parameters is called **referential transparency** when taken to its logical conclusion — a referentially transparent function, given the same inputs, always produces the same output and has no side effects. Referential transparency is the foundation of functional programming and the property that makes functions easiest to test, reason about, and compose. Even in non-functional codebases, designing towards referential transparency improves predictability.

## Return values vs side effects

A function either computes a value and returns it, or it changes something in the world. Understanding the difference determines how functions are composed and tested.

```javascript
// RETURN VALUE: produces a result, changes nothing
function discountedPrice(price, discountPercent) {
  return price * (1 - discountPercent / 100)
}

// SIDE EFFECT: changes something outside itself
function applyDiscountToCart(cart, discountPercent) {
  cart.total = cart.total * (1 - discountPercent / 100)  // mutates cart
}
```

```text
Return values:
  → Easy to test: call the function, check what comes back
  → Easy to compose: pass the return value to the next function
  → Safe to call multiple times: calling it again doesn't change anything

Side effects:
  → Required for output (writing to screen, database, file)
  → Harder to test: must inspect external state after calling
  → Cannot be called freely: each call changes the world

Rule: prefer return values over side effects for computation.
      Reserve side effects for where they are the point (output, persistence, I/O).
```

```javascript
// Composing return values (clean)
const price = 100
const discounted = discountedPrice(price, 20)     // → 80
const withTax = calculateTotal(discounted, 0.1)   // → 88
const formatted = formatCurrency(withTax)          // → "$88.00"

// The output of each function becomes the input of the next.
// No shared state. No mutation. Predictable at every step.
```

## Pure vs impure functions

A **pure** function has two properties: given the same inputs it always returns the same output, and it has no side effects. An **impure** function violates at least one of these.

```javascript
// Pure: same inputs → same output, no side effects
function add(a, b) {
  return a + b
}

// Impure: depends on external state (Date.now() changes every call)
function currentYear() {
  return new Date().getFullYear()
}

// Impure: side effect (writes to console)
function logAndReturn(value) {
  console.log(value)
  return value
}

// Impure: mutates its input
function sortInPlace(items) {
  items.sort()   // modifies the original array
  return items
}

// Pure version of the sort:
function sorted(items) {
  return [...items].sort()   // spread creates a copy; original untouched
}
```

```text
Pure functions are the most trustworthy kind.
They can be:
  • Tested with zero setup — no mocking, no cleanup, no state management
  • Called in any order — they do not affect each other
  • Memoised — cache the result for a given input, call is free next time
  • Parallelised — no shared state means no race conditions

Most programs are mostly pure functions with a thin layer of impure functions
at the edges (reading from databases, writing to files, talking to networks).
Push impurity to the boundary. Keep the core pure.
```

**SE lens:** The distinction between pure and impure functions is the most practical tool for writing testable code. A test for a pure function is: call it with inputs, check the return value. A test for an impure function must set up state, call the function, check that state changed correctly, then clean up. The setup/teardown problem is the primary reason tests become slow, fragile, and eventually abandoned. Designing towards pure functions is designing towards a codebase where testing is cheap.

**Common mistakes:**
- Functions that both compute and mutate — `calculateAndSaveTotal(cart)` breaks the return-value/side-effect separation. The calculation logic becomes untestable without saving. Split it: `calculateTotal(cart)` returns the total; the caller decides whether to save it.
- Parameters that carry too much — passing a `User` object to a function that only needs `user.email` creates a hidden dependency on the entire `User` shape. Pass what the function needs: `sendEmail(email)`, not `sendEmail(user)`.
- Silent mutation — returning a value AND mutating an input. The caller does not expect both. Choose one behaviour per function.

**Debug tip:** When a function produces different results on different calls with the same arguments, it is impure — it depends on something external. The debugger will show the function's inputs and outputs but not the hidden state it reads. Add the hidden state as an explicit logged variable to make it visible.

## Challenge: design_function

Design a function that calculates a shipping cost based on weight and destination.

Rules:
- Weight under 1kg: flat rate of $3
- Weight 1kg and above: $3 + $2 per kg above 1kg (rounded up to nearest kg)
- International destinations add a $10 surcharge

`Math.ceil(n)` — rounds n up to the nearest integer. `Math.ceil(1.2)` → `2`.

```challenge
function shippingCost(weightKg, isInternational) {
  // weightKg: a positive number (the weight in kilograms)
  // isInternational: boolean (true if shipping internationally)
  // Returns: the total shipping cost in dollars (a number)
}
```

```test
assert shippingCost(0.5, false) === 3
assert shippingCost(1, false) === 3
assert shippingCost(2, false) === 5
assert shippingCost(2.1, false) === 7
assert shippingCost(0.5, true) === 13
assert shippingCost(3, true) === 19
```
