---
series: software-construction
level: 7
title: State Management
lang: javascript
---

# State Management

State is any value that persists between operations. A counter that increments, a shopping cart that accumulates items, a user session that remembers who is logged in — these are state. State is necessary. It is also the primary source of bugs in non-trivial programs.

The problem is not that state exists. The problem is when state is spread across many places, mutated from anywhere, and difficult to trace. A program where any piece of code can change any piece of state at any time is a program where understanding one part requires understanding the whole.

By the end of this lesson you will understand what state is, why its location and access patterns matter, how to minimise state and localise it correctly, and how to use state machines when state transitions need to be explicit.

## What state is and where it lives

```text
State lives in three places, with different implications for each:

LOCAL STATE — inside a function, lives for one call
  function sum(numbers) {
    let total = 0           // local state — born when called, dies when done
    for (const n of numbers) total += n
    return total
  }
  Easiest to understand. Cannot affect anything outside the function.

MODULE STATE — in a module's private variables, lives as long as the module
  let requestCount = 0     // module-level — persists across calls
  export function trackRequest() { requestCount++ }
  export function getCount() { return requestCount }
  Visible only to the module. Shared by all callers of that module.

GLOBAL STATE — accessible from anywhere
  window.currentUser = { id: '123' }   // visible to every piece of code
  Hardest to reason about. Any code anywhere can change it.
  Bugs become: "something changed currentUser between these two lines, but what?"
```

## Minimising and localising state

The rule: state should live at the lowest level that gives it the access it needs. Local is better than module-level. Module-level is better than global.

```javascript
// BAD: shared mutable state with no ownership
let currentFilters = { category: null, maxPrice: null, inStock: false }
let filteredProducts = []

function setCategory(cat) { currentFilters.category = cat }
function setMaxPrice(p)   { currentFilters.maxPrice = p }
function applyFilters()   { filteredProducts = filterProducts(currentFilters) }
// Any function anywhere can read or mutate currentFilters.
// When filteredProducts is wrong, who changed currentFilters?

// GOOD: state owned by one place, modified through a controlled interface
function createFilterState() {
  let filters = { category: null, maxPrice: null, inStock: false }

  return {
    setCategory(cat) { filters = { ...filters, category: cat } },
    setMaxPrice(p)   { filters = { ...filters, maxPrice: p } },
    getFilters()     { return { ...filters } },   // returns a copy — callers cannot mutate internals
  }
}

const filterState = createFilterState()
filterState.setCategory('electronics')
filterState.setMaxPrice(500)
const current = filterState.getFilters()   // { category: 'electronics', maxPrice: 500, inStock: false }
```

```text
What changed:
  filters is now private to createFilterState(). Only three functions can touch it.
  getFilters() returns a copy — callers see the state but cannot mutate it.
  Debugging is: "which of these three functions was called?" — not "who out of
  every function in the program might have touched this?"

This pattern — private state + controlled interface — is the essence of encapsulation,
whether in an object, a module, or a closure.
```

**CS lens:** The discipline of minimising mutable shared state is the practical application of the **principle of least privilege** applied to data: each piece of code should have access to only the state it genuinely needs to do its job. In functional programming, this is taken to the extreme — no mutable state at all. In practice, the goal is not zero state but **localised state**: state that is owned by exactly one module, modified through exactly one interface, and visible to exactly the code that needs it.

## State machines — when transitions matter

Some state is not just a value — it is a position in a sequence of allowed transitions. An order that goes from `pending` to `confirmed` to `shipped` to `delivered` (or `cancelled`) has transitions, not just values. Representing this as a plain string with if/else scattered everywhere misses the structure.

```javascript
// Without a state machine: scattered, error-prone
let status = 'pending'

function confirm(order) {
  if (status === 'pending') {
    status = 'confirmed'
    sendConfirmationEmail(order)
  }
  // What if status is 'shipped'? Nothing happens. Silent failure.
}

// With a state machine: explicit, enforceable
const TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipped',   'cancelled'],
  shipped:   ['delivered'],
  delivered: [],
  cancelled: [],
}

function transition(currentState, nextState, action) {
  const allowed = TRANSITIONS[currentState]
  if (!allowed) throw new Error(`Unknown state: ${currentState}`)
  if (!allowed.includes(nextState)) {
    throw new Error(`Cannot transition from ${currentState} to ${nextState}`)
  }
  action()
  return nextState
}
```

```text
Using the state machine:
  status = transition('pending', 'confirmed', () => sendConfirmationEmail(order))
  → 'confirmed'   (valid transition)

  status = transition('delivered', 'confirmed', () => sendConfirmationEmail(order))
  → throws: "Cannot transition from delivered to confirmed"
  (attempting to go backwards — caught immediately)

  status = transition('pending', 'shipped', () => {})
  → throws: "Cannot transition from pending to shipped"
  (skipping 'confirmed' — caught immediately)

Before: invalid transitions fail silently, leaving state inconsistent.
After:  invalid transitions throw immediately at the point of the mistake.
```

**SE lens:** The most expensive category of bugs in production systems is **invalid state** — data in the database that represents something that should never have been possible (a shipped order with no tracking number, a confirmed payment with no user ID, a cancelled subscription with an active billing cycle). State machines make invalid transitions impossible at the code level. They are standard practice in payment systems, workflow engines, and any domain where state transitions have business or legal significance.

**Common mistakes:**
- Using booleans for state that has more than two values — `isLoading`, `isError`, `isSuccess` as three separate booleans allows the invalid state `isLoading: true, isError: true` simultaneously. Use a single state value: `'idle' | 'loading' | 'success' | 'error'`.
- Mutable state that is also a function argument — passing an object to a function that modifies it mixes two responsibilities. The function either computes a new value or modifies external state — not both.
- Global state for things that are not truly global — the current user might feel global, but a function that formats a report should receive the user it needs rather than reading from a global. Functions that depend on global state become untestable in isolation.

**Debug tip:** When a state bug occurs, the question is: "how did the system get into this state?" Add logging at every point where state changes: `console.log('State transition:', { from: currentState, to: nextState, trigger: 'userAction' })`. A log of state transitions is a time machine for understanding how the system reached a wrong state.

## Challenge: order_state_machine

Implement a state machine for a support ticket system. Tickets move through: `open` → `in_progress` → `resolved` → `closed`. A ticket can also be `cancelled` from `open` or `in_progress`. No other transitions are valid.

```challenge
const TICKET_TRANSITIONS = {
  // fill in the allowed transitions for each state
}

function transitionTicket(currentState, nextState) {
  // Throws if the transition is invalid.
  // Returns nextState if valid.
}
```

```test
assert transitionTicket('open', 'in_progress') === 'in_progress'
assert transitionTicket('in_progress', 'resolved') === 'resolved'
assert transitionTicket('resolved', 'closed') === 'closed'
assert transitionTicket('open', 'cancelled') === 'cancelled'
assert transitionTicket('in_progress', 'cancelled') === 'cancelled'
let threw = false; try { transitionTicket('resolved', 'open') } catch { threw = true }
assert threw
```
