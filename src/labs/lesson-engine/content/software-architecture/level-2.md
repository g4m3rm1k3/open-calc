---
series: software-architecture
level: 2
title: Component Design and Boundaries
lang: javascript
---

# Component Design and Boundaries

A component is a unit of software with a defined interface and a clear responsibility. The quality of an architecture depends almost entirely on how well its components are designed: what they expose, what they hide, and where the boundaries between them are drawn. Two metrics quantify component quality — **cohesion** (how related are the things inside a component?) and **coupling** (how much does a component depend on other components' internals?). Both were formalised by Larry Constantine in the 1960s. By the end of this lesson you will understand cohesion, coupling, the Stable Dependencies Principle, and how to draw boundaries that support change rather than obstruct it.

## Cohesion — Everything in Its Place

High cohesion means all code in a component exists for the same reason and changes at the same rate. Low cohesion is the "Utils" class: a bucket for unrelated code.

```javascript
// Measuring cohesion by asking: "what single reason does this component change for?"

function analyseComponent(name, methods) {
  // Group methods by what concept they relate to
  const groups = {}
  for (const { method, concept } of methods) {
    if (!groups[concept]) groups[concept] = []
    groups[concept].push(method)
  }

  const numConcepts = Object.keys(groups).length
  const cohesion = numConcepts === 1 ? 'high' : numConcepts <= 2 ? 'medium' : 'low'

  console.log(`\n[${name}] Cohesion: ${cohesion}`)
  for (const [concept, meths] of Object.entries(groups)) {
    console.log(`  Concept "${concept}": ${meths.join(', ')}`)
  }
  if (numConcepts > 1) {
    console.log(`  Problem: ${numConcepts} unrelated concerns — should be split`)
  }
}

// Low cohesion — Utils is everything
analyseComponent('UtilsService', [
  { method: 'sendEmail',        concept: 'email' },
  { method: 'validateEmail',    concept: 'email' },
  { method: 'formatDate',       concept: 'dates' },
  { method: 'parseDate',        concept: 'dates' },
  { method: 'createUser',       concept: 'users' },
  { method: 'deleteUser',       concept: 'users' },
])

// High cohesion — each service has one concept
analyseComponent('EmailService', [
  { method: 'send',         concept: 'email' },
  { method: 'validate',     concept: 'email' },
  { method: 'renderTemplate', concept: 'email' },
])

analyseComponent('UserService', [
  { method: 'create',  concept: 'users' },
  { method: 'delete',  concept: 'users' },
  { method: 'getById', concept: 'users' },
])
```

```text
[UtilsService] Cohesion: low
  Concept "email": sendEmail, validateEmail
  Concept "dates": formatDate, parseDate
  Concept "users": createUser, deleteUser
  Problem: 3 unrelated concerns — should be split

[EmailService] Cohesion: high
  Concept "email": send, validate, renderTemplate

[UserService] Cohesion: high
  Concept "users": create, delete, getById
```

**CS lens:** The Single Responsibility Principle (the S in SOLID) is a restatement of high cohesion: "a module should have one, and only one, reason to change." If two things in a module change for different reasons (email logic changes when your email provider changes; user logic changes when the business model changes), they belong in separate modules. The test: "what external actor drives changes to this component?"

## Coupling — Depending on Interfaces, Not Implementations

Low coupling means components depend on abstractions, not concrete implementations. When a component is tightly coupled to another's internals, changes propagate: fixing one breaks the other.

```javascript
// Demonstrating low vs high coupling side by side:

// HIGH COUPLING: OrderService knows Stripe's API
// (if we switch to Braintree, we must rewrite OrderService too)
function createTightlyCoupledOrderService() {
  // Directly uses Stripe SDK internals:
  const stripe = { charges: { create: (amount, token) => ({ id: 'ch_123', amount }) } }

  return {
    processOrder(order) {
      // Business logic coupled to Stripe implementation details:
      const charge = stripe.charges.create(order.total * 100, order.stripeToken)
      return { orderId: order.id, chargeId: charge.id }
    }
  }
}

// LOW COUPLING: OrderService depends on a PaymentGateway interface
function createDecoupledOrderService(paymentGateway) {
  // Only knows: gateway.charge(amount) → { success, transactionId }
  return {
    processOrder(order) {
      const result = paymentGateway.charge(order.total)
      if (!result.success) throw new Error('payment failed')
      return { orderId: order.id, transactionId: result.transactionId }
    }
  }
}

// Any implementation can be injected — Stripe, Braintree, mock:
const stripeGateway = {
  charge(amount) {
    console.log(`  Stripe: charging $${amount}`)
    return { success: true, transactionId: `stripe_${Date.now()}` }
  }
}

const mockGateway = {
  charge(amount) {
    console.log(`  Mock: recording charge of $${amount} (no real payment)`)
    return { success: true, transactionId: `mock_${Date.now()}` }
  }
}

const prodService = createDecoupledOrderService(stripeGateway)
const testService = createDecoupledOrderService(mockGateway)

console.log('--- Production ---')
console.log(prodService.processOrder({ id: 1, total: 29.99 }))

console.log('\n--- Testing (no real payment) ---')
console.log(testService.processOrder({ id: 2, total: 9.99 }))
```

```text
--- Production ---
  Stripe: charging $29.99
{ orderId: 1, transactionId: 'stripe_1234567890' }

--- Testing (no real payment) ---
  Mock: recording charge of $9.99 (no real payment)
{ orderId: 2, transactionId: 'mock_1234567890' }
```

Execution trace — what changes when we switch payment providers:
```text
Tightly coupled:
  Switch Stripe → Braintree:
    1. Rewrite OrderService (business logic)  ← forced change to wrong layer
    2. Update tests
    3. Regression risk in business logic

Loosely coupled:
  Switch Stripe → Braintree:
    1. Write BraintreeGateway implementing charge(amount) → { success, transactionId }
    2. Swap injection site: createDecoupledOrderService(braintreeGateway)
    3. OrderService: unchanged
```

**SE lens:** This is Dependency Injection — the gateway is passed in (injected) rather than created internally. DI is not a framework feature; it is a consequence of low coupling. When a component creates its own dependencies, it couples itself to those specific implementations. When dependencies are passed in, the component stays coupled only to the interface.

## The Stable Dependencies Principle

Dependencies should point from unstable components (change frequently) to stable ones (rarely change). When a stable component depends on an unstable one, every change to the unstable component potentially breaks the stable one.

```javascript
function createDependencyAnalyser() {
  const components = new Map()
  const deps = []

  return {
    addComponent(name, stability) {
      components.set(name, { name, stability })
    },
    addDependency(from, to) {
      deps.push({ from, to })
    },
    analyseViolations() {
      const rank = { stable: 3, moderate: 2, instable: 1 }
      const violations = []

      for (const { from, to } of deps) {
        const fromComp = components.get(from)
        const toComp   = components.get(to)
        if (!fromComp || !toComp) continue

        if (rank[fromComp.stability] > rank[toComp.stability]) {
          violations.push({
            from, to,
            issue: `${fromComp.stability} component "${from}" depends on ${toComp.stability} "${to}"`,
            fix: `Introduce an interface between ${from} and ${to} so Domain doesn't need to change when ${to} changes`,
          })
        }
      }

      return violations
    }
  }
}

const analyser = createDependencyAnalyser()
analyser.addComponent('Domain',       'stable')
analyser.addComponent('Application',  'moderate')
analyser.addComponent('UI',           'instable')
analyser.addComponent('PostgresRepo', 'instable')  // specific DB implementation

analyser.addDependency('UI',          'Application')  // instable → moderate: ok
analyser.addDependency('Application', 'Domain')       // moderate → stable: ok
analyser.addDependency('Domain',      'PostgresRepo') // stable → instable: VIOLATION

const violations = analyser.analyseViolations()
console.log(`Found ${violations.length} SDP violation(s):`)
violations.forEach(v => {
  console.log(`\n  VIOLATION: ${v.issue}`)
  console.log(`  Fix: ${v.fix}`)
})
```

```text
Found 1 SDP violation(s):

  VIOLATION: stable component "Domain" depends on instable "PostgresRepo"
  Fix: Introduce an interface between Domain and PostgresRepo so Domain doesn't need to change when PostgresRepo changes
```

**CS lens:** The fix for this SDP violation is the **Repository pattern**: Domain defines a `UserRepository` interface; Application injects a `PostgresUserRepository` that implements it. The dependency now flows: PostgresRepo → [UserRepository interface] ← Domain. The stable component defines the contract; the unstable component conforms to it. This is the Dependency Inversion Principle (the D in SOLID).

## Non-Usage

- **Not all boundaries are beneficial**: every interface adds indirection. Don't introduce an interface unless you have (or will have) multiple implementations, or unless you need to test in isolation
- **Don't split components prematurely** along imagined future boundaries — group by actual change rate, not predicted

## Challenge: dependency_graph

Implement a dependency graph analyser that detects Stable Dependencies Principle violations.

`createDependencyGraph()` — returns an object with:
- `.addComponent(name, stability)` — `stability` is `'stable' | 'moderate' | 'instable'`
- `.addDependency(from, to)` — records that `from` depends on `to`
- `.violations()` — returns `Array<{ from, to, reason: string }>` for each dependency where a more-stable component depends on a less-stable one
- `.dependents(name)` — returns array of component names that depend on `name`

```challenge
function createDependencyGraph() {
  return {
    addComponent(name, stability) {},
    addDependency(from, to) {},
    violations() { return [] },
    dependents(name) { return [] },
  }
}
```

```test
const g = createDependencyGraph()
g.addComponent('Domain', 'stable')
g.addComponent('Application', 'moderate')
g.addComponent('UI', 'instable')
g.addComponent('Database', 'instable')
g.addDependency('UI', 'Application')
g.addDependency('Application', 'Domain')
g.addDependency('Domain', 'Database')
const v = g.violations()
assert v.length === 1
assert v[0].from === 'Domain'
assert v[0].to === 'Database'
assert typeof v[0].reason === 'string'
assert g.dependents('Domain').includes('Application')
assert g.dependents('Database').includes('Domain')
assert g.dependents('UI').length === 0
```
