---
series: debugging-fundamentals
level: 5
title: Categories of Bugs
lang: javascript
---

# Categories of Bugs

Every bug is unique, but every bug belongs to a small number of categories. Recognising the category from the symptom immediately suggests the right investigative technique. A "works on my machine" bug is an environment bug — check environment differences, not logic. An off-by-one error is a boundary bug — check loop conditions and array indexing. A race condition is a concurrency bug — check what happens when timing changes.

Learning to categorise bugs is learning to apply the right diagnostic tool immediately rather than thrashing through possibilities randomly. By the end of this lesson you will be able to identify logic bugs, boundary bugs, reference bugs, concurrency bugs, and environment bugs from their symptoms, and know the specific investigation strategy for each.

## Logic bugs: the algorithm is wrong

A logic bug produces incorrect output for valid input when the algorithm itself has a flaw. There is no error thrown — the code runs to completion and returns a wrong answer.

```text
SIGNALS:
  — Correct output for most inputs, wrong output for specific inputs.
  — No exception, no crash — just a wrong value.
  — The bug is predictable: the same input always produces the same wrong output.

INVESTIGATION:
  1. Find an input where the output is wrong.
  2. Trace through the algorithm manually with that input.
  3. Find the step where the manually computed value diverges from the code's value.
```

```javascript
// Logic bug: discount should apply only to orders over $100, but it applies to all
function calculateTotal(items, hasDiscount) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  if (hasDiscount) {
    return subtotal * 0.9   // BUG: should check subtotal > 100 before applying discount
  }
  return subtotal
}

// calculateTotal([{price: 50}], true) → 45   (wrong: 10% off a $50 order — should not apply)
// calculateTotal([{price: 150}], true) → 135  (correct: 10% off a $150 order)
```

```text
Manual trace with [{price: 50}], true:
  subtotal = 50
  hasDiscount is true → applies discount
  returns 50 * 0.9 = 45

Expected behaviour: discount only applies when subtotal > 100.
  50 > 100 is false → should return 50, not 45.

Bug location: the if condition is missing `&& subtotal > 100`.
Fix: if (hasDiscount && subtotal > 100) { ... }
```

## Boundary bugs: off-by-one and edge cases

Boundary bugs occur at the edges of ranges: the first element, the last element, zero, empty collections, the exact boundary of a condition.

```text
SIGNALS:
  — Correct for most values; wrong for the smallest or largest valid input.
  — Wrong for empty arrays or zero-length strings.
  — An extra item included or a missing item at the end.
  — Results are off by one (too many or too few iterations).

INVESTIGATION:
  Test with: empty input, single-element input, two-element input, the exact boundary value.
  Check loop conditions: < vs <=, > vs >=, 0 vs 1 as starting index.
```

```javascript
// Off-by-one: function is supposed to return all items up to AND INCLUDING maxPrice,
// but uses < instead of <=
function filterByMaxPrice(items, maxPrice) {
  return items.filter(item => item.price < maxPrice)   // BUG: should be <=
}

// filterByMaxPrice([{price: 50}, {price: 100}], 100)
// → [{price: 50}]    (wrong: the $100 item should be included)
// → Should be [{price: 50}, {price: 100}]
```

```text
Testing at the boundary:
  maxPrice = 100, item.price = 100: 100 < 100 is false → filtered out (wrong)
  maxPrice = 100, item.price = 99:  99  < 100 is true  → included    (correct)
  maxPrice = 100, item.price = 101: 101 < 100 is false → filtered out (correct)

The bug is exactly at the boundary (price === maxPrice).
The fix: change < to <=.

Boundary test rule: always test the EXACT boundary value, one below, and one above.
```

**CS lens:** Off-by-one errors are sometimes called "fencepost errors" after this problem: if you have 100 fence sections, how many fence posts do you need? The naive answer is 100, but the correct answer is 101 (you need a post at each end). The error generalises to any situation where you must count either the elements or the gaps between them. Inclusive vs exclusive range conventions (`<` vs `<=`, 0-indexed vs 1-indexed) are the most common source of fencepost errors in code.

## Reference bugs: wrong value from shared state

A reference bug occurs when two pieces of code share a reference to the same object, one modifies it, and the other sees the unexpected change.

```text
SIGNALS:
  — A variable's value changes without that code changing it.
  — A function produces different results on the second call with the same input.
  — An object passed to a function is modified (its fields change) after the function returns.
  — A cache or accumulated state contains unexpected entries.

INVESTIGATION:
  Find everywhere the object is referenced.
  Add a log before and after every function that receives it.
  Identify which function modified it when it should not have.
```

```javascript
// Reference bug: addItem() mutates the array it receives, affecting the caller
function addItem(cart, item) {
  cart.push(item)   // BUG: mutates the parameter (the caller's array)
  return cart
}

const originalCart = ['hat', 'shirt']
const newCart = addItem(originalCart, 'shoes')

// Expected: originalCart is unchanged, newCart has the new item
// Actual:   BOTH are ['hat', 'shirt', 'shoes'] — originalCart was mutated
```

```text
What happened:
  `cart` inside addItem is the same array as `originalCart` in the caller.
  They are the same heap address — not a copy.
  cart.push(item) mutates the array at that address.
  The caller's `originalCart` variable still points to the same (now-modified) array.

Fix: create a new array instead of mutating:
  function addItem(cart, item) {
    return [...cart, item]   // creates a new array — originalCart is unaffected
  }
```

## Concurrency bugs: timing-dependent failures

Concurrency bugs occur when two operations that should not interleave do interleave, producing incorrect results that depend on execution timing.

```javascript
// Concurrency bug: two async operations updating the same counter
let requestCount = 0

async function handleRequest() {
  const current = requestCount    // reads the count
  await processRequest()          // async work — other code can run here
  requestCount = current + 1      // writes back — may overwrite another handler's increment
}

// Two simultaneous requests:
//   Handler A reads: current = 0
//   Handler B reads: current = 0 (before A writes back)
//   Handler A writes: requestCount = 1
//   Handler B writes: requestCount = 1  (overwrites A — lost increment)
// Expected: requestCount = 2. Actual: requestCount = 1.
```

```text
SIGNALS of concurrency bugs:
  — Works correctly when requests are sent one at a time; fails under load.
  — Intermittent failures that cannot be reproduced consistently.
  — Counters, totals, or aggregates are wrong by unpredictable amounts.
  — Tests pass locally (sequential) but fail in CI (parallel test runner).

INVESTIGATION:
  Add timestamps and handler IDs to each log entry to see interleaving.
  Run the suspect code with artificial delays (await delay(Math.random() * 10))
  to increase the chance of hitting the race condition.

FIX: eliminate shared mutable state between async handlers.
  — Use atomic operations (database transactions, atomic counters).
  — Read-modify-write must be atomic or guarded.
  — Prefer message passing over shared state.
```

## Environment bugs: works on my machine

An environment bug produces different behaviour in different environments — different OS, different Node.js version, different environment variables, different file paths.

```text
SIGNALS:
  — Works locally, fails in CI.
  — Works in development, fails in staging or production.
  — Works on one developer's machine, fails on another's.
  — Started failing after an update to Node.js, a dependency, or OS.

INVESTIGATION CHECKLIST:
  □ Are the Node.js versions the same? (node -v)
  □ Are the package versions the same? (package-lock.json committed?)
  □ Are environment variables the same? (compare .env files)
  □ Are file paths the same? (case-sensitive on Linux, case-insensitive on macOS)
  □ Are timezone settings the same? (Date behavior differs)
  □ Are external services reachable from both environments?
  □ Are there hardcoded absolute paths? (C:\Users\ vs /home/)
```

```text
Common environment bug: case-sensitive file paths

  On macOS (case-insensitive): require('./Utils') and require('./utils') both work.
  On Linux (case-sensitive):   require('./Utils') works, require('./utils') fails if the
                                file is named Utils.js.

  The code works on the developer's Mac, fails in the Linux CI container.
  Fix: always use the exact case that matches the filename.
```

**SE lens:** Environment bugs are prevented by **environment parity**: making every environment (dev, staging, production) as identical as possible. Containers (Docker) achieve this by packaging the code, runtime, and dependencies into an image that runs identically everywhere. The moment a developer says "it works on my machine," they are describing an environment parity failure. The long-term fix is not "check the environment differences" — it is eliminating the differences by containerising.

**Common mistakes:**
- Assuming a bug is a logic bug when it is actually an environment bug — the investigation techniques are completely different. Check environment parity before diving into the algorithm.
- Testing edge cases only after a boundary bug appears — test boundary values from the start. `empty`, `single element`, `minimum boundary value`, `maximum boundary value` should be in every test suite.
- Treating a concurrency bug as a logic bug — if adding `await asyncOperation()` at a random point changes when the bug appears, it is a concurrency bug, not a logic bug.

**Debug tip:** For concurrency bugs, the most revealing tool is a log that includes timestamps to the millisecond and a handler ID: `logger.info('handler update', { handlerId, before: current, after: current+1, ts: Date.now() })`. If two handlers log the same `before` value, they are racing on the same read-modify-write cycle. That log entry immediately proves the race condition.

## Challenge: classify_the_bug

Read each symptom and classify the bug category.

```challenge
const bugClassifications = {
  // Symptom 1: sum([1, 2, 3]) returns 6 (correct), but sum([]) throws "Cannot reduce empty array"
  bug1_category: '',   // 'logic', 'boundary', 'reference', 'concurrency', or 'environment'
  bug1_why: '',

  // Symptom 2: after calling sort(arr), the original `arr` variable is now sorted —
  // the caller did not expect this and the display order is wrong
  bug2_category: '',
  bug2_why: '',

  // Symptom 3: a counter shows 98 after 100 increments when run under high concurrency,
  // but shows 100 when run sequentially
  bug3_category: '',
  bug3_why: '',

  // Symptom 4: getDiscount(price) returns 0 for price=100 when it should return 10
  // (the spec says "discount applies to orders of $100 or more" but the code checks price > 100)
  bug4_category: '',
  bug4_why: '',
}
```

```test
const b = bugClassifications
assert b.bug1_category === 'boundary' && b.bug1_why.length > 10
assert b.bug2_category === 'reference' && b.bug2_why.length > 10
assert b.bug3_category === 'concurrency' && b.bug3_why.length > 10
assert b.bug4_category === 'boundary' || b.bug4_category === 'logic'
assert b.bug4_why.length > 10
```
