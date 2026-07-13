---
series: software-construction
level: 14
title: Designing for Change
lang: javascript
---

# Designing for Change

Software that does not change is finished software — meaning it is either perfect or abandoned. Everything else changes. Requirements shift. Users discover new needs. Businesses pivot. The underlying platform evolves. The team that wrote the first version turns over and a new team inherits the system.

Designing for change is the synthesis of everything in this series: writing functions with explicit contracts, separating concerns, managing state carefully, keeping coupling low and cohesion high, injecting dependencies, organising by feature, and refactoring proactively. All of these practices serve a single purpose: making the cost of change as low as possible, for as long as the software lives.

By the end of this lesson you will understand the forces that make software resistant to change, the design properties that make it receptive to change, and how to make concrete design decisions in the service of long-term adaptability.

## The axes of change

Software does not change randomly. It changes along specific axes — the dimensions of variation that the business has told you, explicitly or implicitly, will shift.

```text
COMMON AXES OF CHANGE:
  Providers:    which database, which email service, which payment processor
  Rules:        pricing rules, discount rules, eligibility rules, tax rules
  Presentation: what the output looks like (JSON today, XML tomorrow, CSV on request)
  Behaviour:    which algorithm is used, which strategy is chosen per user segment
  Deployment:   which cloud, which region, which scale
  Users:        which permissions, which features, which limits

Design principle: the places where change is most likely should be the places where
change is cheapest. Design the stable parts to be stable. Design the variable parts
to be easily replaced.
```

```javascript
// Identifying axes of change in a concrete example:

// Pricing rules change when: marketing runs a new campaign, subscriptions add tiers
// Isolation strategy: extract pricing rules into a data structure or a strategy function

// Notification providers change when: company switches from SendGrid to Mailgun
// Isolation strategy: inject the email client as a dependency (dependency inversion)

// Output format changes when: mobile app needs JSON, partner API needs XML
// Isolation strategy: separate computation from serialisation — compute the domain
// object, then serialise separately

function getInvoice(orderId, orderRepo) {
  const order = orderRepo.findById(orderId)    // provider-isolated (injected repo)
  return computeInvoice(order)                 // computation — no format knowledge
}

function computeInvoice(order) {
  return {
    id: order.id,
    lineItems: order.items.map(item => ({ name: item.name, total: item.price * item.quantity })),
    total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }
}

// Serialisation is separated — the caller chooses the format
const toJSON = (invoice) => JSON.stringify(invoice)
const toCSV  = (invoice) => invoice.lineItems.map(l => `${l.name},${l.total}`).join('\n')
```

## Stable core, variable shell

The design pattern that best supports change is: identify what is stable (the core) and what is variable (the shell), and keep them separated.

```javascript
// The core: business logic that rarely changes
// "An order must have at least one item, a valid user, and a positive total."
// This rule is stable — it encodes the business's definition of a valid order.

function validateOrder(order) {
  if (!order.userId) return { valid: false, reason: 'userId is required' }
  if (!order.items || order.items.length === 0) return { valid: false, reason: 'no items' }
  if (order.items.some(i => i.price <= 0)) return { valid: false, reason: 'invalid price' }
  return { valid: true }
}

// The shell: infrastructure that changes when the environment changes
// — database driver, email provider, authentication mechanism

class OrderService {
  constructor(orderRepo, notifier, logger) {  // shell is injected — it can be swapped
    this.orderRepo = orderRepo
    this.notifier = notifier
    this.logger = logger
  }

  async createOrder(rawOrder) {
    const result = validateOrder(rawOrder)   // stable core — never replaced
    if (!result.valid) throw new Error(result.reason)

    const saved = await this.orderRepo.save(rawOrder)   // shell — swappable
    await this.notifier.notify(saved)                    // shell — swappable
    this.logger.info(`Order created: ${saved.id}`)       // shell — swappable
    return saved
  }
}
```

```text
What can change without touching validateOrder():
  Switch from PostgreSQL to MongoDB → new orderRepo, same validateOrder
  Switch from email to SMS notification → new notifier, same validateOrder
  Switch from file logging to cloud logging → new logger, same validateOrder

What changes validateOrder():
  A new business rule: "orders must have a shipping address"
  Removing an old rule: "items can now have price zero for free samples"

Stable parts change for ONE reason: the business rule changed.
Variable parts change when: the technology choice changed.
These are kept separate so that technology changes cannot accidentally modify business rules.
```

**CS lens:** The separation of stable core from variable shell is a manifestation of the **principle of least astonishment** applied at the architecture level: changing the database should not surprise the team by also requiring changes to the business logic. The core cannot know about the shell; the shell depends on the core. This directed dependency graph — shell → core — is the dependency inversion principle in architectural form. It is also what makes the core independently testable: it has no dependencies on the shell at all.

## Accepting that requirements will change

The most common design mistake is assuming that today's requirements are final. They are not. Writing code as if they are produces tight coupling to those requirements — every assumption baked into the code becomes a thing to undo when the requirement changes.

```text
Design checkpoint — before writing a function, ask:
  What is the most likely reason this function will be called with different inputs?
  → Separate that variation into a parameter, not a hardcoded value.

  What is the most likely reason this function will behave differently for different callers?
  → Separate that variation into a strategy parameter or a configuration option.

  What is the most likely reason this function will need to use a different provider?
  → Accept the provider as a dependency rather than creating it.

  What is the most likely reason this module's public API will need to change?
  → Stabilise that API by minimising what it exports and keeping exports general.

These are not hypothetical questions. They are predictions based on how software usually evolves.
Every answer is a design decision.
```

**SE lens:** The phrase "designing for change" is sometimes misread as "design for every possible change" — which leads to over-engineering: abstraction layers that no requirement ever exercises, extension points that nobody extends, configurability for scenarios that never arrive. That is not the goal. The goal is to design so that the changes that ARE coming cost less. The discipline is: design for the changes you can see (the axes of change the business has told you exist), not for every change imaginable. Three similar cases is the threshold — when the third variation arrives, you extract the abstraction. Not before.

**Common mistakes:**
- Premature abstraction: extracting an abstraction before the second variation exists. The abstraction is built on one example and is therefore wrong for the second variation when it arrives.
- Coupling the core to the shell: calling `new PostgresDB()` inside the business logic. When the database changes, so must the business logic, even though business logic has nothing to do with database drivers.
- Over-configuring: replacing values with configuration options "just in case they need to change." Configuration that never changes is not configuration — it is dead code in the config file. Add configuration when a real caller needs to vary the value, not when you imagine they might.

**Debug tip:** When a feature change requires modifications in four or more files, map the change: which file depends on which. The chain of dependencies is the coupling graph, and the longest chain reveals the deepest structural problem. Refactoring the deepest coupling first has the most leverage — it shortens every future chain through that part of the codebase.

## Challenge: design_for_change

Refactor this fixed-format report generator to separate computation from formatting, so that a new format (CSV) can be added without modifying `computeReport()`.

```challenge
// CURRENT: computation and formatting are mixed
function generateReport(orders) {
  const lines = ['=== ORDERS REPORT ===']
  for (const order of orders) {
    const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
    lines.push(`Order ${order.id}: $${total.toFixed(2)}`)
  }
  lines.push(`Total orders: ${orders.length}`)
  return lines.join('\n')
}

// REFACTORED: separate these two concerns:
function computeReport(orders) {
  // Returns a structured data object — no strings, no formatting
}

function formatAsText(report) {
  // Formats the computed report as the current text format
}

function formatAsCSV(report) {
  // Formats the computed report as CSV — first line: "orderId,total", then one row per order
}
```

```test
const orders = [
  { id: 'A1', items: [{ price: 10, quantity: 2 }, { price: 5, quantity: 1 }] },
  { id: 'B2', items: [{ price: 100, quantity: 1 }] },
]
const report = computeReport(orders)
assert report.orders.length === 2 && report.totalOrders === 2
assert Math.abs(report.orders[0].total - 25) < 0.01 && Math.abs(report.orders[1].total - 100) < 0.01
const text = formatAsText(report)
assert text.includes('A1') && text.includes('25.00') && text.includes('B2')
const csv = formatAsCSV(report)
assert csv.includes('orderId') && csv.includes('total')
assert csv.includes('A1') && csv.includes('B2')
```
