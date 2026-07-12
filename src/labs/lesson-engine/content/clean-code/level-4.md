---
series: clean-code
level: 4
title: Code Structure and Layout
lang: javascript
---

# Code Structure and Layout

Code is read top-to-bottom, just like prose. The way you organise code within a file — the order of functions, the use of blank lines, the indentation — determines how much effort the reader must spend tracking context. Well-structured code guides the reader through a logical narrative. Poorly structured code forces the reader to jump around, hold multiple threads simultaneously, and reconstruct the narrative from fragments.

Structure is not about style guides or linters. It is about reducing the cognitive load required to understand what the code is doing and why. By the end of this lesson you will have practical heuristics for organising code within a file, grouping related code, and formatting for maximum readability.

## The newspaper rule: important things first

A newspaper article puts the most important information first (the headline and lede), then fills in details. A function in code should work the same way: the most important logic at the top, implementation details below.

```javascript
// NEWSPAPER RULE applied to a file:
//
// 1. Imports (the "what this file depends on")
// 2. Constants (the key values)
// 3. Main exported function (the "what this file does")
// 4. Helper functions (the "how the main function does it")
// 5. Private utilities (the lowest-level details)

import { parseDate, formatCurrency } from './utils.js'

const LATE_FEE_RATE = 0.05
const GRACE_PERIOD_DAYS = 7

// Main function: what the module does (read first)
export function calculateInvoice(order, currentDate) {
  const dueDate = parseDate(order.dueDate)
  const daysOverdue = daysBetween(dueDate, currentDate)
  const lateFee = daysOverdue > GRACE_PERIOD_DAYS
    ? calculateLateFee(order.total)
    : 0
  return {
    subtotal: order.total,
    lateFee,
    total: order.total + lateFee,
    formatted: formatCurrency(order.total + lateFee),
  }
}

// Helper: how calculateInvoice does part of its work (read if needed)
function calculateLateFee(amount) {
  return Math.round(amount * LATE_FEE_RATE * 100) / 100
}

// Utility: a building block (read only if understanding daysBetween matters)
function daysBetween(date1, date2) {
  const ms = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}
```

```text
THE CALLER-BEFORE-CALLEE RULE:
  Functions should appear in the order they are called.
  The function that calls another should appear BEFORE the function it calls.
  This mirrors the newspaper rule: the high-level summary comes first,
  the implementation details come later.

  Reader strategy: read top-down to understand the big picture.
  Skip down only when you need to understand a specific detail.
```

**CS lens:** The newspaper rule is an application of the **principle of progressive disclosure**: show the reader what they need to know first, and let them drill down into details only when they need to. This is the same pattern used in good API design (the simple case first, the options later), in good documentation (quick start before reference), and in good data structure design (index before full data). Progressive disclosure respects the reader's time and attention.

## Blank lines as paragraph breaks

Blank lines in code serve the same function as paragraph breaks in prose: they signal "a new thought begins here." Used well, they make the structure of logic visible at a glance.

```javascript
// BAD: no blank lines — the reader cannot see the structure
function processPayment(order, user) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax
  if (!user.hasPaymentMethod) { throw new Error('No payment method') }
  if (user.balance < total) { throw new Error('Insufficient balance') }
  user.balance -= total
  order.status = 'paid'
  order.paidAt = new Date()
  await db.save(user)
  await db.save(order)
  await notifyUser(user, 'Payment successful')
}
```

```javascript
// GOOD: blank lines create visual paragraphs
function processPayment(order, user) {
  // Calculate total
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  // Validate preconditions
  if (!user.hasPaymentMethod) throw new Error('No payment method')
  if (user.balance < total) throw new Error('Insufficient balance')

  // Apply payment
  user.balance -= total
  order.status = 'paid'
  order.paidAt = new Date()

  // Persist and notify
  await db.save(user)
  await db.save(order)
  await notifyUser(user, 'Payment successful')
}
```

```text
BLANK LINE RULES:
  → Separate logically distinct steps (calculation, validation, mutation, I/O)
  → Do not use blank lines within a single logical step (they imply structure that isn't there)
  → Two blank lines between function definitions (signals a new function)
  → One blank line between logical blocks within a function
  → No blank line at the start or end of a function body
```

## Guard clauses: return early to reduce nesting

Deep nesting forces the reader to hold the state of multiple conditions simultaneously. Guard clauses (early returns) flatten the nesting and put the happy path at the top level.

```javascript
// BAD: deep nesting (readers must track 3 levels of conditions simultaneously)
function processOrder(order) {
  if (order) {
    if (order.items && order.items.length > 0) {
      if (order.status === 'pending') {
        // ... the actual logic starts here, 3 levels deep
        return calculateTotal(order)
      } else {
        throw new Error('Order is not pending')
      }
    } else {
      throw new Error('Order has no items')
    }
  } else {
    throw new Error('Order is required')
  }
}

// GOOD: guard clauses eliminate nesting (readers reach the logic immediately)
function processOrder(order) {
  if (!order) throw new Error('Order is required')
  if (!order.items || order.items.length === 0) throw new Error('Order has no items')
  if (order.status !== 'pending') throw new Error('Order is not pending')

  // Happy path — no nesting
  return calculateTotal(order)
}
```

```text
GUARD CLAUSE PATTERN:
  1. Handle error cases at the top of the function with early returns/throws
  2. The happy path is the last thing — it needs no else
  3. The function body reads: "if this problem, bail out; if that problem, bail out; otherwise, succeed"

WHEN GUARD CLAUSES ARE APPROPRIATE:
  → When the conditions are independent (not part of a business rule tree)
  → When the error cases are "exit conditions" rather than "branches"
  → When the happy path is the main purpose of the function

WHEN NOT TO USE GUARD CLAUSES:
  → When the branches represent different valid paths (use if/else to signal they are equivalent)
  → When the conditions are part of a mutually-exclusive decision tree
```

**SE lens:** Guard clauses are a specific case of the **fail-fast principle**: detect and report errors as early as possible, at the point where they can be identified cleanly. This eliminates the need to track "have we validated this yet?" state through the rest of the function. The function body after the guard clauses can assume all preconditions are satisfied — it handles only the happy path. This assumption reduces the mental model required to understand the function's core logic.

**Common mistakes:**
- Over-commenting to explain structure — if you need a `// validation section` comment above guard clauses and a `// processing section` comment above the logic, those sections should be separate functions. The section headers are a sign that the function is doing multiple things.
- Mixing guard clauses with positive logic — some functions have guard clauses at the top and then more conditions below. If the guard clauses handle errors and the conditions below handle valid variations, that is fine. If the conditions below are more guard clauses, move them all to the top.
- Inconsistent indentation for continuation lines — function arguments that span multiple lines should be consistently indented to show that they are a continuation, not a new statement.

**Debug tip:** When a function is hard to understand, draw the control flow on paper. How many paths through the function are there? How deeply nested is the deepest path? If you need more than one hand to draw the paths, the function has too much branching. Extract the nested branches into well-named functions, and the control flow will collapse to a linear sequence of named steps.

## Challenge: restructure_function

Restructure a nested function using guard clauses and clear layout.

```challenge
function applyPromoCode(cart, promoCode, currentDate) {
  // This function applies a promo code to a cart.
  // Restructure it using guard clauses (early returns for errors).
  // The function should:
  //   1. Guard: if cart is null/undefined → return { error: 'Cart is required' }
  //   2. Guard: if promoCode is null/undefined/empty → return { error: 'Promo code is required' }
  //   3. Guard: if promoCode.expired (promoCode.expiresAt < currentDate) → return { error: 'Promo code expired' }
  //   4. Guard: if cart.total < promoCode.minimumOrder → return { error: 'Order total too low' }
  //   5. Happy path: return { discount: cart.total * promoCode.discountRate, newTotal: cart.total * (1 - promoCode.discountRate) }
  //
  // All numeric results should be rounded to 2 decimal places.
}
```

```test
const validPromo = { discountRate: 0.10, minimumOrder: 50, expiresAt: new Date('2099-01-01') }
const expiredPromo = { discountRate: 0.10, minimumOrder: 50, expiresAt: new Date('2000-01-01') }
const cart = { total: 100 }
const now = new Date()

const result = applyPromoCode(cart, validPromo, now)
assert result.discount === 10.00
assert result.newTotal === 90.00

const noCart = applyPromoCode(null, validPromo, now)
assert noCart.error === 'Cart is required'

const noPromo = applyPromoCode(cart, null, now)
assert noPromo.error === 'Promo code is required'

const expired = applyPromoCode(cart, expiredPromo, now)
assert expired.error === 'Promo code expired'

const tooLow = applyPromoCode({ total: 20 }, validPromo, now)
assert tooLow.error === 'Order total too low'
```
