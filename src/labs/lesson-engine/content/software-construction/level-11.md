---
series: software-construction
level: 11
title: Refactoring
lang: javascript
---

# Refactoring

Refactoring is the disciplined process of changing code's internal structure without changing its observable behaviour. The operative word is "disciplined": this is not rewriting, not adding features, not fixing bugs. It is restructuring existing code so it is easier to understand, cheaper to change, and safer to extend — while producing the same outputs for every input it already handled.

The reason refactoring exists as a distinct activity is that software that works is not the same as software that is easy to change. Code accumulates structure debt — design decisions that made sense at the time but now slow down every subsequent change. Refactoring pays that debt down incrementally, without stopping to rewrite everything.

By the end of this lesson you will be able to recognise the structural signals that tell you code needs to change, apply the fundamental refactoring moves that address those signals, and do so safely using the discipline of refactoring rather than the chaos of rewriting.

## When code needs to change (code smells)

Code smells are signals — patterns that indicate the structure is fighting against you. They do not mean the code is wrong; they mean it will become wrong, or expensive, under the next change.

```text
LONG FUNCTION: one function doing too much
  Signals: you need to scroll to read it, you add comments explaining what each "section" does,
           the function name ends in "AndThen..." or contains "also".
  Move: extract the sections into named functions.

DUPLICATE CODE: the same logic in multiple places
  Signals: fixing a bug requires the same fix in 3 locations.
           Two functions are almost identical except for one variable.
  Move: extract the shared logic into one function and call it from both places.

LONG PARAMETER LIST: a function that takes 6+ parameters
  Signals: callers pass positional arguments and you cannot tell which is which.
           Adding a feature requires adding another parameter to many call sites.
  Move: group related parameters into an object. Separate the function's concerns.

FEATURE ENVY: a function that uses more of another module's data than its own
  Signals: a function accesses five properties of an object passed to it.
           The function "belongs" in the class of the object it manipulates.
  Move: move the function to the class where the data lives.

MAGIC NUMBERS AND STRINGS: unexplained numeric or string literals
  Signals: if (retries > 3), if (status === 'STATUS_ACTIVE')
  Move: name the constants: const MAX_RETRIES = 3, const STATUS_ACTIVE = 'STATUS_ACTIVE'
```

## The core refactoring moves

**Extract Function:** Pull a block of code into a named function.

```javascript
// BEFORE: a long function with a comment-delimited "section"
function processOrder(order) {
  // Validate the order
  if (!order.userId) throw new Error('userId is required')
  if (!order.items || order.items.length === 0) throw new Error('Order must have items')
  if (order.items.some(item => item.quantity < 1)) throw new Error('Quantities must be positive')

  // Calculate the total
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal + tax + shipping

  return { orderId: order.id, total }
}
```

```javascript
// AFTER: each section is now a named function with its own clear responsibility
function validateOrder(order) {
  if (!order.userId) throw new Error('userId is required')
  if (!order.items || order.items.length === 0) throw new Error('Order must have items')
  if (order.items.some(item => item.quantity < 1)) throw new Error('Quantities must be positive')
}

function calculateOrderTotal(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = subtotal > 100 ? 0 : 9.99
  return subtotal + tax + shipping
}

function processOrder(order) {
  validateOrder(order)
  const total = calculateOrderTotal(order.items)
  return { orderId: order.id, total }
}
```

```text
What changed — observable behaviour: NOTHING. Same inputs → same outputs.
What changed — structure:
  processOrder() is now a three-step narrative: validate, calculate, return.
  validateOrder() can be tested independently.
  calculateOrderTotal() can be tested independently with any array of items.
  Each function has one job.
```

**Rename:** Give a variable, function, or parameter a name that says what it is.

```javascript
// BEFORE:
function calc(d, r) {
  const x = d * r / 100
  return d - x
}

// AFTER:
function calculateDiscountedPrice(originalPrice, discountPercent) {
  const discountAmount = originalPrice * discountPercent / 100
  return originalPrice - discountAmount
}
```

```text
calc(200, 15) → 170   (what does this mean?)
calculateDiscountedPrice(200, 15) → 170   (a 15% discount on $200 = $170)

The function does not change. The function becomes understandable.
Renaming is the cheapest refactoring and has the highest return on investment.
```

**CS lens:** Refactoring as a formalised discipline was named and systematised by Martin Fowler in "Refactoring: Improving the Design of Existing Code" (1999). Before that, developers rewrote code that was hard to understand — a high-risk activity that frequently introduced regressions. The key insight Fowler formalised is that refactoring is safe only when done in small, verified steps: make one change, run the tests, verify nothing broke, then make the next change. The discipline is the step size. Small steps mean any regression is immediately visible and immediately reversible.

## The refactoring discipline

The rule: refactoring must not change observable behaviour. The safety mechanism is tests.

```text
The refactoring loop:
  1. Identify a smell.
  2. Write a test that captures the current behaviour (if one does not exist).
  3. Make the smallest change that addresses the smell.
  4. Run the tests. If they pass, the refactoring is safe.
  5. Repeat.

Breaking the loop:
  → Changing behaviour AND restructuring at the same time is not refactoring — it is rewriting.
    Rewrites do not have the safety guarantee. They frequently introduce bugs.
  → Skipping the tests means "no observable behaviour change" is an unverified claim.

The distinction matters in practice:
  If you hit a bug while refactoring, stop. Fix the bug first (which changes behaviour), commit,
  then continue refactoring (which does not change behaviour). Never mix the two.
```

**SE lens:** The business case for refactoring is that every structural problem in the code multiplies the cost of future changes. A function that requires 30 minutes to understand before it can be changed safely, called 100 times over a year, costs 50 engineer-hours of friction. Refactoring that function once — removing the complexity permanently — might cost 2 hours. The calculus is clear for any function that will be touched again. The skill is identifying which functions will be touched again: usually the ones at the core of the business domain.

**Common mistakes:**
- Renaming without updating all call sites — a function rename that leaves the old name in some files is not a rename, it is confusion. Use your editor's "rename symbol" to update all references atomically.
- Refactoring without tests — the safety guarantee evaporates. If you cannot test before refactoring, write the test first.
- Mixing refactoring with feature additions — "I'll clean this up while I add the feature" is how bugs hide. The diff mixes structural and behavioural changes. Reviewers cannot tell what is safe and what is risky.

**Debug tip:** When a refactoring produces a failing test, the test is telling you that the refactoring changed observable behaviour — which means it was not a refactoring, it was a bug fix or a feature change disguised as structure. Revert to the last passing state and separate the changes: fix the bug separately, then refactor the structure separately.

## Challenge: refactor_discount

Refactor this function by extracting the discount logic into a separate, named function. The output of `applyDiscounts(cart)` must not change.

```challenge
function applyDiscounts(cart) {
  let total = 0
  for (const item of cart.items) {
    let price = item.price
    if (cart.membershipLevel === 'gold' && item.category === 'electronics') {
      price = item.price * 0.85
    } else if (cart.membershipLevel === 'silver' && item.category === 'electronics') {
      price = item.price * 0.92
    }
    total += price * item.quantity
  }
  return total
}

// Extract the per-item discount logic into this function:
function discountedPrice(item, membershipLevel) {
  // Returns the discounted unit price for the item given the membership level.
}
```

```test
const cart1 = { membershipLevel: 'gold',   items: [{ price: 100, quantity: 2, category: 'electronics' }, { price: 50, quantity: 1, category: 'clothing' }] }
const cart2 = { membershipLevel: 'silver', items: [{ price: 200, quantity: 1, category: 'electronics' }] }
const cart3 = { membershipLevel: 'none',   items: [{ price: 100, quantity: 3, category: 'electronics' }] }
assert Math.abs(applyDiscounts(cart1) - 220) < 0.01
assert Math.abs(applyDiscounts(cart2) - 184) < 0.01
assert Math.abs(applyDiscounts(cart3) - 300) < 0.01
assert Math.abs(discountedPrice({ price: 100, category: 'electronics' }, 'gold')   - 85) < 0.01
assert Math.abs(discountedPrice({ price: 100, category: 'electronics' }, 'silver') - 92) < 0.01
assert Math.abs(discountedPrice({ price: 100, category: 'clothing'    }, 'gold')   - 100) < 0.01
```
