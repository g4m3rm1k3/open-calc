---
series: debugging-fundamentals
level: 7
title: Debugging Fundamentals — Putting It Together
lang: javascript
---

# Debugging Fundamentals — Putting It Together

Debugging is a skill built from overlapping techniques, not a single method. Each technique in this series is a tool for a specific situation: the five-step process for any bug, error type recognition for immediate narrowing, the debugger for watching execution, logging for production visibility, binary search for localisation, category classification for directing the investigation, and event loop understanding for async bugs.

A complete debugger applies all of these in sequence and knows when to switch between them. This capstone lesson integrates them by presenting a realistic multi-function bug that requires the full toolkit — tracing through errors, localising with binary search, recognising the category, and reasoning about async behaviour.

## The complete debugging toolkit

```text
WHEN YOU SEE:                       USE:

Error message / crash               → Read the error type and stack trace (Level 1)
                                      TypeError → null/undefined access
                                      ReferenceError → name does not exist
                                      RangeError → exceeded range (stack overflow)
                                      SyntaxError → code cannot parse

"Works for most inputs, not all"    → Binary search the execution path (Level 4)
                                      Add checkpoints at midpoints
                                      Narrow to the step that produces wrong data

Wrong output, no error              → Binary search + manual trace (Level 4 + Level 0)
                                      Reduce to an MRE
                                      Trace manually to find where expected diverges from actual

Intermittent failures               → Concurrency bug (Level 5)
                                      Add timestamps to logs
                                      Add artificial delays to make the race consistent

Works locally, not in CI/staging    → Environment bug (Level 5)
                                      Compare Node.js version, env vars, file case, paths

Production failure, no reproduction → Structured logs + correlation ID (Level 3)
                                      Find the requestId in the error
                                      Filter all log entries for that ID

Complex async bug                   → Event loop reasoning + async traces (Level 6)
                                      Add await before all async calls
                                      Catch at every await boundary
```

## A real debugging session: the order total is wrong

Read through this debugging session as a model of the complete process applied to a realistic bug.

```javascript
// Bug report: "the order confirmation email shows the wrong total.
// Customer ordered 3 items for $15 each = $45 total, but email shows $30."

// The relevant code path:
async function sendOrderConfirmation(orderId) {
  const order = await getOrder(orderId)
  const total = calculateTotal(order.items)
  await emailService.send({
    to: order.customer.email,
    subject: 'Order confirmed',
    body: `Your total: $${total}`,
  })
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

```text
STEP 1 — REPRODUCE:
  getOrder('bad-order-id') returns: { items: [{ price: 15 }, { price: 15 }], customer: {...} }
  Wait — only 2 items, not 3. The order has 2 items, not 3. Total is correct: $30.
  
  Is the bug in the total calculation, or in what getOrder() returns?

STEP 2 — LOCATE (binary search):
  Midpoint: what does getOrder() return?
  Add: const order = await getOrder(orderId); console.log('order:', JSON.stringify(order))
  
  Output: {"items":[{"price":15},{"price":15}],"customer":{...}}
  → Only 2 items. calculateTotal([{price:15},{price:15}]) = 30 is CORRECT.
  → Bug is in getOrder(), not in calculateTotal().

STEP 3 — HYPOTHESISE:
  "I believe getOrder() returns only 2 of the 3 items, possibly because the query
   filters items by some condition, or the data model stores items separately."

STEP 4 — VERIFY:
  Look at getOrder():
    async function getOrder(id) {
      const order = await db.orders.findById(id)
      const items = await db.items.find({ orderId: id, status: 'confirmed' })
      return { ...order, items }
    }
  
  Key finding: items are filtered by status: 'confirmed'.
  Check the database: 3 items for this order, but one has status: 'pending'.
  → The pending item is excluded from the total because the filter excludes it.
  
  IS THIS THE BUG? It depends on the specification.
  Spec check: "total should include all items placed, regardless of fulfilment status."
  → YES, this is the bug. The filter is wrong — it should include all items.

STEP 5 — FIX AND CONFIRM:
  Fix: remove the status filter from the items query.
  Confirm: rerun with the order that had 3 items → total is now $45.
  Write test: getOrder(idWithPendingItem) returns all items including pending ones.
```

**CS lens:** This debugging session demonstrates the **hypothesis-test cycle** of the scientific method applied to software. The initial symptom ("wrong total") is a high-entropy observation — it could have hundreds of causes. Each step reduces entropy: the binary search midpoint observation eliminates half the code. The hypothesis is a specific prediction (items are filtered by status). The verification either confirms or refutes it. The session takes 5 steps instead of 50 because entropy was reduced at each step rather than through random exploration.

## Building permanent debugging habits

```text
HABITS THAT PREVENT BUGS:
  → Write the test that would catch this bug BEFORE fixing it.
    If you fix without a test, the bug can return undetected.
  → When a bug is found, ask "why wasn't this caught by existing tests?"
    That question leads to a category of missing tests.
  → When fixing a bug, check if the same class of bug exists elsewhere.
    A boundary bug in calculateTotal may mean calculateDiscount has the same bug.

HABITS THAT MAKE BUGS FINDABLE:
  → Add a correlation ID to every request at entry. Propagate it through all logs.
  → Validate inputs at the boundary (first function to touch external data).
    Invalid data caught at the boundary is 5 stack frames fewer to trace.
  → Log the "before state" at every mutation.
    If a value changes unexpectedly, the before-state log tells you the last known good state.
  → Add assertInvariant() calls at boundaries:
    After every data transformation, assert that the result has the shape you expect.
    These catch bugs immediately after they are introduced, not 10 steps later.
```

**SE lens:** The ultimate measure of a debugging practice is Mean Time to Resolution (MTTR): how long from "bug reported" to "bug fixed and deployed." MTTR is determined by: (1) time to reproduce (MREs shorten this), (2) time to locate (binary search shortens this), (3) time to understand the cause (reading error messages correctly shortens this), (4) time to verify the fix (tests shorten this). Each technique in this series directly reduces one of these four components. A team that applies all of them consistently can achieve MTTR of minutes for bugs that take hours in teams that do not.

**Common mistakes (series summary):**
- Not making bugs reproducible before investigating — if you cannot reproduce it, you cannot verify a fix.
- Fixing symptoms instead of root causes — the bug returns, in a different form, after every symptom fix.
- Not writing a test after fixing — the next developer (or you in six months) will reintroduce it.
- Skipping the hypothesis step — "I'll just add logs and see what happens" is not a hypothesis. It is expensive exploration. Form a hypothesis first, then design the minimal observation to test it.

## Challenge: full_debug_session

Trace through this pipeline and identify the root cause using the full debugging process.

```challenge
// Bug report: processOrders([{id:'a', amount:100}, {id:'b', amount:200}]) returns 200
// instead of the expected {total: 300, count: 2}

function parseAmounts(orders) {
  return orders.map(o => o.amount)
}

function filterValid(amounts) {
  return amounts.filter(n => n !== null && n !== undefined)
}

function sumAmounts(amounts) {
  return amounts.reduce((acc, n) => acc + n)   // note: no initial value
}

function processOrders(orders) {
  const amounts  = parseAmounts(orders)
  const valid    = filterValid(amounts)
  const total    = sumAmounts(valid)
  return { total, count: orders.length }
}

const debugSession = {
  // What does parseAmounts return for the input above?
  step1Output: [],

  // What does filterValid return?
  step2Output: [],

  // What does sumAmounts return? (trace the reduce manually)
  step3Output: 0,

  // What is the actual output of processOrders?
  actualOutput: {},

  // Is the output wrong? If so, which step contains the bug?
  bugInStep: '',    // 'parseAmounts', 'filterValid', 'sumAmounts', or 'processOrders wrapper'

  // What is the root cause?
  rootCause: '',
}
```

```test
const d = debugSession
assert JSON.stringify(d.step1Output) === JSON.stringify([100, 200])
assert JSON.stringify(d.step2Output) === JSON.stringify([100, 200])
assert d.step3Output === 300
assert d.actualOutput.total === 300 && d.actualOutput.count === 2
assert d.bugInStep === 'processOrders wrapper' || d.bugInStep === 'none' || d.bugInStep === ''
const rc = d.rootCause.toLowerCase()
assert rc.includes('no bug') || rc.includes('correct') || rc.includes('works') || rc.length > 5
```
