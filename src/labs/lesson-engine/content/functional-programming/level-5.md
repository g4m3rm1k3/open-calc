---
series: functional-programming
level: 5
title: Functional Patterns in Practice
lang: javascript
---

# Functional Patterns in Practice

Functional programming's concepts — pure functions, immutability, higher-order functions, composition, Maybe, and Result — become fully useful when applied to realistic problems. Knowing what they are is not the same as knowing when and how to use them in the code you write every day.

This lesson applies the full functional toolkit to three practical scenarios: processing data pipelines, managing application state without mutation, and structuring asynchronous operations. Each scenario shows both an imperative baseline and a functional refactoring, so the tradeoffs are visible rather than abstract.

## Pattern 1: functional data pipelines

Real data processing involves multiple stages: parsing, filtering, transforming, aggregating, formatting. The functional approach separates each stage into a named, testable function, then composes them into a pipeline.

```javascript
// SCENARIO: process raw sales data from an API
// Raw data: [{ product_id, qty, unit_price_cents, region, date }]
// Goal: total revenue by region for completed sales this month

// IMPERATIVE (all in one function — hard to test each step):
function processMonthly(rawSales) {
  const now = new Date()
  const result = {}
  for (const sale of rawSales) {
    const saleDate = new Date(sale.date)
    if (saleDate.getMonth() !== now.getMonth() || saleDate.getFullYear() !== now.getFullYear()) continue
    if (!result[sale.region]) result[sale.region] = 0
    result[sale.region] += sale.qty * sale.unit_price_cents / 100
  }
  return result
}
```

```javascript
// FUNCTIONAL (each transformation is a named, testable unit):

// Step 1: parse raw API shape into domain model
function parseSale(raw) {
  return {
    region:      raw.region,
    revenueUsd:  raw.qty * raw.unit_price_cents / 100,
    date:        new Date(raw.date),
  }
}

// Step 2: filter to current month (pure — takes month/year as params instead of using Date.now())
function isCurrentMonth(sale, year, month) {
  return sale.date.getFullYear() === year && sale.date.getMonth() === month
}

// Step 3: aggregate by region
function groupByRegion(sales) {
  return sales.reduce((acc, sale) => ({
    ...acc,
    [sale.region]: (acc[sale.region] ?? 0) + sale.revenueUsd
  }), {})
}

// Compose into a pipeline:
function processMonthly(rawSales, year = new Date().getFullYear(), month = new Date().getMonth()) {
  return rawSales
    .map(parseSale)
    .filter(sale => isCurrentMonth(sale, year, month))
    .reduce(groupByRegion, {})    // note: passing groupByRegion directly — it has wrong signature
}
// Correction: reduce needs (acc, item), not (items):
function processMonthlyFixed(rawSales, year = new Date().getFullYear(), month = new Date().getMonth()) {
  const parsed   = rawSales.map(parseSale)
  const filtered = parsed.filter(sale => isCurrentMonth(sale, year, month))
  return groupByRegion(filtered)
}
```

```text
What the functional version provides that the imperative does not:

  parseSale() is independently testable:
    parseSale({ qty:2, unit_price_cents:1000, region:'US', date:'2024-01-15' })
    → { region:'US', revenueUsd:20, date: Date('2024-01-15') }

  isCurrentMonth() is independently testable:
    isCurrentMonth(sale, 2024, 0) → true/false — no dependency on the current time.
    The year and month are parameters — the function is pure.

  groupByRegion() is independently testable with any array of parsed sales.

  The composition connects these tested units.
  If processMonthlyFixed is wrong, only the connection logic needs investigation —
  not the parsing, filtering, or aggregation.
```

**CS lens:** This pattern — breaking a transformation into atomic stages, testing each stage independently, then composing them — is the **pipeline architecture**. It maps directly to the Unix philosophy: each program does one thing well; programs are composed by piping output to input. The benefit in software: each stage is a testable unit with clear inputs and outputs. A bug is locatable by testing stages in isolation. A new requirement (e.g., filter by a different date range) is a one-stage change.

## Pattern 2: immutable state management

Managing state without mutation is the functional answer to the "shared mutable state" problem from Software Construction. Instead of updating the current state in place, each update produces a new state, leaving the old state intact.

```javascript
// SCENARIO: a shopping cart that must support undo

// IMPERATIVE (mutable — no history):
const cart = { items: [], total: 0 }
function addItem(cart, item) {
  cart.items.push(item)               // mutation
  cart.total += item.price            // mutation
}

// FUNCTIONAL (immutable — history is automatic):
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.item],
        total: state.total + action.item.price,
      }
    case 'REMOVE_ITEM':
      const remaining = state.items.filter(item => item.id !== action.id)
      return {
        ...state,
        items: remaining,
        total: remaining.reduce((sum, item) => sum + item.price, 0),
      }
    default:
      return state
  }
}

// Usage with history:
const history = [{ items: [], total: 0 }]   // initial state

function dispatch(action) {
  const prev = history[history.length - 1]
  const next = cartReducer(prev, action)
  history.push(next)                          // each state is a new entry
  return next
}

dispatch({ type: 'ADD_ITEM', item: { id: 'a', price: 29.99 } })
dispatch({ type: 'ADD_ITEM', item: { id: 'b', price: 9.99  } })
// history: [initial, after_a, after_b]
// undo: history[history.length - 2] — just go to the previous entry
```

```text
This is exactly how React's useState and Redux work:
  — State is never mutated — cartReducer always returns a new object.
  — Each dispatch produces a new state without destroying the previous.
  — History is the array of states; undo is stepping backwards in it.
  — Time-travel debugging: inspect any prior state directly.

The functional constraint (no mutation) makes undo/redo trivially correct.
With mutable state, undo requires implementing an inverse operation for every action.
With immutable state, undo is always: go back to the previous state.
```

## Pattern 3: functional async with chains

Promises are a monad: they wrap a value (the eventual result) and define `.then()` as `map` — applying a function to the wrapped value when it resolves. Async/await is syntactic sugar for Promise chains. Structuring async code as a functional pipeline separates each async step into a named, testable function.

```javascript
// SCENARIO: fetch a user's orders and compute their lifetime value

// Mixing async and data transformation (harder to test):
async function getLifetimeValue(userId) {
  const user   = await fetch(`/api/users/${userId}`).then(r => r.json())
  const orders = await fetch(`/api/orders?userId=${userId}`).then(r => r.json())
  const paid   = orders.filter(o => o.status === 'paid')
  const total  = paid.reduce((sum, o) => sum + o.amount, 0)
  return { userId, name: user.name, lifetimeValue: total }
}

// Functional: each concern is a separate, testable function
async function fetchJSON(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
  return response.json()
}

function computeLifetimeValue(user, orders) {
  const paidOrders = orders.filter(o => o.status === 'paid')
  const total      = paidOrders.reduce((sum, o) => sum + o.amount, 0)
  return { userId: user.id, name: user.name, lifetimeValue: total }
}

async function getLifetimeValue(userId) {
  const [user, orders] = await Promise.all([
    fetchJSON(`/api/users/${userId}`),
    fetchJSON(`/api/orders?userId=${userId}`),
  ])
  return computeLifetimeValue(user, orders)
}
```

```text
What separating concerns gives you:

  fetchJSON() is independently testable (give it a URL, assert it returns parsed JSON
  or throws on error). It knows nothing about users or orders.

  computeLifetimeValue() is a PURE function — testable with any user and orders objects.
  No network. No mocking. Just: computeLifetimeValue(fakeUser, fakeOrders) → assert result.

  getLifetimeValue() is the thin composition layer: fetch both, compute.
  It is the only function that needs async infrastructure to test.

Promise.all: runs both fetches concurrently (not sequentially).
  Sequential: user fetch completes, then order fetch starts. Total time = t_user + t_orders.
  Concurrent: both start simultaneously. Total time = max(t_user, t_orders).
  For independent operations, Promise.all is always faster.
```

**SE lens:** The functional discipline of separating pure computation from I/O (pure functions for transformation, async functions only for fetching) is the closest JavaScript can get to Haskell's IO monad — the formal separation of pure computation from impure effects. The engineering benefit: pure functions (computeLifetimeValue) can be unit tested trivially. Async functions (getLifetimeValue) require integration tests (mocking fetch). Minimising the async boundary minimises the code that requires integration testing.

**Common mistakes:**
- Writing the pure computation inside the async function — every line of data transformation inside an `async function` becomes untestable without network infrastructure. Extract the transformation into a separate pure function.
- Using `Promise.all` when operations are sequential (each depends on the previous) — `Promise.all` requires independent operations. If fetching orders requires the userId from the user response, they cannot be parallel.
- Returning mutable objects from reducers — `{ ...state, items: state.items.push(item) }` mutates state.items AND evaluates to a number (push returns the new length). Use spread: `{ ...state, items: [...state.items, item] }`.

**Debug tip:** When a functional pipeline produces the wrong result, test each stage function in isolation with the exact input it receives in the pipeline. The stage whose output differs from expectation contains the bug. This test-in-isolation approach is only possible because each stage is a pure function — it is the payoff of the functional discipline.

## Challenge: functional_pipeline

Build a complete functional pipeline: fetch simulated data, filter, transform, and aggregate.

```challenge
// Pure transformation functions — implement these:
function parseOrder(raw) {
  // raw: { order_id, customer_id, amount_cents, status, region }
  // Returns: { id, customerId, amountUsd, status, region }
}

function isPaidOrder(order) {
  // Returns true if order.status === 'paid'
}

function totalByRegion(orders) {
  // Returns { [region]: totalAmountUsd } for all paid orders
  // Use reduce with spread (immutable)
}

// The simulated "data store" — already provided:
const rawOrders = [
  { order_id: '1', customer_id: 'c1', amount_cents: 5000, status: 'paid',    region: 'US' },
  { order_id: '2', customer_id: 'c2', amount_cents: 3000, status: 'pending', region: 'EU' },
  { order_id: '3', customer_id: 'c3', amount_cents: 7500, status: 'paid',    region: 'EU' },
  { order_id: '4', customer_id: 'c4', amount_cents: 2000, status: 'paid',    region: 'US' },
]

function processSalesReport(rawOrders) {
  return totalByRegion(rawOrders.map(parseOrder).filter(isPaidOrder))
}
```

```test
const parsed = parseOrder({ order_id: 'x1', customer_id: 'c9', amount_cents: 1999, status: 'paid', region: 'US' })
assert parsed.id === 'x1' && parsed.customerId === 'c9' && Math.abs(parsed.amountUsd - 19.99) < 0.01

assert isPaidOrder({ status: 'paid' }) === true && isPaidOrder({ status: 'pending' }) === false

const report = processSalesReport(rawOrders)
assert Math.abs(report['US'] - 70) < 0.01 && Math.abs(report['EU'] - 75) < 0.01
assert report['pending'] === undefined
```
