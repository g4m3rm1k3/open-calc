---
series: software-construction
level: 8
title: Coupling and Cohesion
lang: javascript
---

# Coupling and Cohesion

Two forces shape every software system: how much pieces depend on each other (coupling) and how well the pieces within each module belong together (cohesion). Every design decision either tightens or loosens coupling; every module boundary either increases or decreases cohesion. Understanding these forces is understanding why some codebases are easy to change and others are not.

The goal is not zero coupling — coupled code is how modules communicate. The goal is **low coupling and high cohesion**: each module knows as little as possible about other modules, and contains things that genuinely belong together. This is the most important structural property of maintainable software.

By the end of this lesson you will be able to identify coupling in your code and reduce it, recognise cohesive and incohesive modules, and understand why these properties determine the long-term cost of a codebase.

## Coupling — the cost of knowing

Coupling measures how much a change in one module requires a change in another. High coupling means changes ripple. Low coupling means changes are localised.

```javascript
// HIGH COUPLING: UserService knows the exact shape of the database layer

class UserService {
  async getUser(id) {
    // Directly accesses the database connection and knows its API
    const row = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    )
    return row.rows[0]    // knows that pg returns .rows[0]
  }
}
```

```javascript
// LOW COUPLING: UserService depends on an interface, not an implementation

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository   // receives its dependency
  }

  async getUser(id) {
    return this.userRepository.findById(id)   // knows only: "find by id returns a user"
  }
}
```

```text
HIGH COUPLING consequences:
  Changing from PostgreSQL to MongoDB? Rewrite UserService.
  Testing UserService? Must run a real database.
  Moving UserService to a different project? Must bring the database layer with it.

LOW COUPLING consequences:
  Changing the database? Provide a different userRepository — UserService unchanged.
  Testing? Pass a fake repository that returns test data — no database needed.
  Moving? UserService goes anywhere, takes its interface with it.

Coupling is the number of things a module must know to do its job.
Reduce what it must know.
```

## Types of coupling (worst to best)

```text
CONTENT COUPLING (worst): one module modifies another module's internal state
  orderModule.cart.items = []   // reaching into another module's internals
  → Any change to how cart stores items breaks this line.

GLOBAL COUPLING: both modules depend on the same global variable
  function processOrder() { if (currentUser.isAdmin) ... }
  → Untestable without manipulating global state.

CONTROL COUPLING: one module tells another how to behave via a flag
  function formatDate(date, useISO) { if (useISO) ... else ... }
  → The flag is really two functions pretending to be one. Split them.

DATA COUPLING (acceptable): modules share only the data they need
  function formatDate(date) { ... }   // receives a Date, returns a string
  → Clean. formatDate knows nothing about the caller.

INTERFACE COUPLING (best): modules agree on an interface, not an implementation
  class UserService { constructor(repo) { this.repo = repo } }
  → UserService and the database agree on repo.findById() — nothing else.
```

## Cohesion — the quality of belonging together

Cohesion measures how well the things inside a module belong together. A highly cohesive module has one clear purpose and contains everything needed to fulfil it.

```javascript
// LOW COHESION: a "utils" file that is a dumping ground
// utils.js
export function formatCurrency(amount) { ... }
export function parseUserAgent(ua) { ... }
export function sendEmail(address, body) { ... }
export function generateSlug(text) { ... }
export function validateCreditCard(number) { ... }
// These have nothing to do with each other. "utils" is not a purpose.
// This module will grow forever as developers add "stuff with nowhere else to go."
```

```javascript
// HIGH COHESION: each module has a clear, single purpose
// currency.js        — everything about formatting and parsing monetary values
// email.js           — everything about sending and templating emails
// slug.js            — everything about URL-safe string generation
// payment-validation.js — everything about validating payment details

// Each module is cohesive: its contents belong together because they serve one purpose.
// When requirements change for email formatting, only email.js changes.
// When payment validation rules change, only payment-validation.js changes.
```

```text
Signs of LOW cohesion:
  → The module is named "utils", "helpers", "common", "misc"
  → You cannot describe what the module does in one sentence without "and"
  → Adding a feature requires adding to this module even though the feature
     has nothing to do with what was already there
  → The module grows indefinitely as the project grows

Signs of HIGH cohesion:
  → The module has a clear, single sentence description
  → Everything in it would be described as part of that same sentence
  → When a feature changes, only this module and its direct users change
```

**CS lens:** Coupling and cohesion are inversely related to each other in well-designed systems — but they are not the same thing measured in opposite directions. A module can have low coupling (knows nothing about other modules) and also low cohesion (its contents have nothing to do with each other). The combination to aim for is: **low coupling between modules** (each module depends on little about others) and **high cohesion within modules** (each module's contents belong together). This combination is what Robert Martin (and before him, Larry Constantine and Edward Yourdon) formalised as the principle of designing software around "reasons to change."

**SE lens:** The practical impact of coupling and cohesion becomes visible during refactoring. A low-coupling, high-cohesion codebase can be refactored one module at a time: you change a module's implementation, run its tests, and are confident that nothing else broke because the coupling was low. A high-coupling codebase requires understanding the whole system before changing any part: a change to the database schema forces changes to the ORM mapping, the service layer, the API serialisation, and the tests all at once. This is called "shotgun surgery" — one logical change, many physical locations.

**Common mistakes:**
- Accepting "utils" as a module name — it is a signal that no design decision was made about where this code belongs. Find the actual purpose and name it.
- Reducing coupling by making everything configurable — a function with ten parameters is not loosely coupled, it is just loosely coupled in a different direction. True low coupling means the module needs less information, not that the caller provides more.
- Confusing low coupling with no coupling — modules must communicate. The goal is that they communicate only through clean, minimal interfaces, not that they operate in complete isolation.

**Debug tip:** When a bug fix requires changes in three or more modules that seem unrelated, the coupling is too high. Map which modules changed: this is the coupling graph. Anywhere that "one logical change = N file changes" is a design smell worth addressing in the next refactoring pass.

## Challenge: identify_coupling

Analyse this code and identify the coupling issues.

```challenge
// payment-processor.js
import db from './database.js'
import { currentUser } from './globals.js'
import Stripe from 'stripe'

export async function processPayment(orderId, amount) {
  // Reads from global state
  if (!currentUser.hasPaymentMethod) return false

  // Reaches into database directly
  const order = await db.query(`SELECT * FROM orders WHERE id = ${orderId}`)

  // Creates infrastructure dependency directly
  const stripe = new Stripe(process.env.STRIPE_KEY)
  const charge = await stripe.charges.create({ amount: amount * 100 })

  // Updates database directly
  await db.query(`UPDATE orders SET paid = true WHERE id = ${orderId}`)

  return charge.id
}

const couplingIssues = {
  // Name the THREE coupling problems in processPayment and what type each is
  issue1: '',   // e.g. "reads currentUser from global state — global coupling"
  issue2: '',
  issue3: '',
  // What would make this function easier to test?
  testFix: '',
}
```

```test
assert couplingIssues.issue1 !== '' && couplingIssues.issue2 !== '' && couplingIssues.issue3 !== ''
const all = Object.values(couplingIssues).join(' ').toLowerCase()
assert all.includes('global') || all.includes('currentuser')
assert all.includes('database') || all.includes('db') || all.includes('sql')
assert all.includes('stripe') || all.includes('payment') || all.includes('infrastructure') || all.includes('direct')
assert couplingIssues.testFix.length > 15
```
