---
series: oop-design
level: 2
title: SOLID Principles
lang: javascript
---

# SOLID Principles

SOLID is an acronym for five design principles that, applied together, produce object-oriented code that is easier to understand, modify, and extend. Each principle addresses a specific category of design problem. They are not rules to follow rigidly but heuristics: signals that a design is becoming harder to change.

The principles are: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. You will recognise some of these from earlier in the curriculum — they are not new ideas, but formalisations of intuitions you have already seen. By the end of this lesson you will be able to identify violations of each principle and describe the refactoring that fixes them.

## S — Single Responsibility Principle

A class (or module) should have one reason to change. That means it has one responsibility, one job.

```javascript
// VIOLATION: UserService has three reasons to change
//   1. Authentication logic changes → update UserService
//   2. Email template changes → update UserService
//   3. Database schema changes → update UserService
class UserService {
  async register(email, password) {
    const hash = await bcrypt.hash(password, 10)
    const user = await db.users.insert({ email, passwordHash: hash })
    await transporter.sendMail({
      to: email,
      subject: 'Welcome!',
      html: `<h1>Hi ${email}</h1><p>Thanks for registering.</p>`
    })
    return user
  }
}
```

```javascript
// FIXED: each class has one responsibility
class UserRepository {
  async insert(email, passwordHash) {
    return db.users.insert({ email, passwordHash })
  }
}

class PasswordService {
  async hash(password) {
    return bcrypt.hash(password, 10)
  }
}

class WelcomeEmailService {
  async send(email) {
    return transporter.sendMail({
      to: email,
      subject: 'Welcome!',
      html: `<h1>Hi ${email}</h1><p>Thanks for registering.</p>`
    })
  }
}

class UserRegistrationService {
  constructor(userRepo, passwordService, emailService) {
    this.userRepo = userRepo
    this.passwordService = passwordService
    this.emailService = emailService
  }

  async register(email, password) {
    const hash = await this.passwordService.hash(password)
    const user = await this.userRepo.insert(email, hash)
    await this.emailService.send(email)
    return user
  }
}
```

## O — Open/Closed Principle

Classes (and functions) should be open for extension but closed for modification. You should be able to add new behaviour without changing existing code.

```javascript
// VIOLATION: every new discount type requires modifying applyDiscount
function applyDiscount(order, discountType) {
  if (discountType === 'percentage') {
    return order.total * (1 - order.discountValue)
  } else if (discountType === 'flat') {
    return order.total - order.discountValue
  } else if (discountType === 'buy-two-get-one') {
    // ... new case requires opening the function
  }
}

// FIXED: new discount types extend the system without modifying applyDiscount
const DISCOUNT_STRATEGIES = {
  percentage: (total, value) => total * (1 - value),
  flat:       (total, value) => Math.max(0, total - value),
}

function applyDiscount(order) {
  const strategy = DISCOUNT_STRATEGIES[order.discountType]
  if (!strategy) throw new Error(`Unknown discount type: ${order.discountType}`)
  return strategy(order.total, order.discountValue)
}

// Adding a new discount type: add one entry to DISCOUNT_STRATEGIES. Touch nothing else.
DISCOUNT_STRATEGIES['buy-two-get-one'] = (total, value, items) =>
  total - Math.floor(items.length / 3) * value
```

**CS lens:** The open/closed principle is a consequence of the **extension vs. modification tradeoff**. When behaviour is data (a lookup table, a registry, a plugin), adding new behaviour is additive — you add a row to the table. When behaviour is code (a switch or if-else chain), adding new behaviour requires modifying the existing code — which risks breaking existing cases. The registry/strategy pattern converts "behaviour as code" into "behaviour as data," enabling extension without modification.

## L — Liskov Substitution Principle

If `S` is a subclass of `T`, then objects of type `S` must be substitutable for objects of type `T` without breaking the program. A subclass should fulfil all the contracts of its parent.

```javascript
// VIOLATION: ReadOnlyList extends Array but breaks the array contract
class ReadOnlyList extends Array {
  push() { throw new Error('This list is read-only!') }   // breaks array's push() contract
  pop()  { throw new Error('This list is read-only!') }
}

// This will throw when passed to code that expects an Array and calls push():
function addItem(list, item) {
  list.push(item)   // WORKS for Array, THROWS for ReadOnlyList — LSP violated
}
```

```javascript
// FIXED: don't extend Array — create a new type with only the operations it supports
class ReadOnlyList {
  #items

  constructor(items) {
    this.#items = [...items]
  }

  get(index) { return this.#items[index] }
  get length() { return this.#items.length }
  [Symbol.iterator]() { return this.#items[Symbol.iterator]() }
  // No push(), pop(), splice() — ReadOnlyList doesn't pretend to be mutable
}
```

```text
LSP VIOLATION SIGNALS:
  → Subclass overrides a method to throw "not supported" or "not implemented"
  → Callers check `instanceof` before calling a method (means types are not substitutable)
  → Subclass requires callers to call methods in a specific order the parent doesn't require
  → Subclass weakens a precondition or strengthens a postcondition

LSP COMPLIANCE SIGNALS:
  → Any code that works with the parent class works with the subclass unchanged
  → The subclass can be used wherever the parent is used, with no surprises
```

## I — Interface Segregation Principle

No client should depend on methods it does not use. Large interfaces should be split into smaller, more specific ones.

```javascript
// VIOLATION: one fat interface forces implementors to implement everything
// (In JS, this is usually expressed as a comment or type, not enforced syntax)
//
// interface Storage {
//   read(key), write(key, value), delete(key),
//   list(), clear(), count(),
//   backup(), restore(), export(), import()
// }
//
// A caching storage only needs read/write/delete — it is forced to implement
// backup(), restore(), export(), import() even though it doesn't need them.

// FIXED: smaller, focused interfaces
// interface ReadableStorage { read(key) }
// interface WritableStorage { read(key), write(key, value), delete(key) }
// interface ManagedStorage extends WritableStorage { list(), clear(), count() }
// interface BackupStorage extends ManagedStorage { backup(), restore() }
//
// CacheStorage implements WritableStorage — no backup methods required.
// ArchiveStorage implements BackupStorage — full interface needed.
```

**SE lens:** Interface Segregation forces you to think about what each CALLER needs. A caching layer needs read/write. An analytics service needs only read. An admin tool needs list/clear/count. Segregating by caller need means each caller depends only on what it uses — so changing backup logic doesn't break the cache, and changing the cache doesn't break the admin tool. This is a specific application of the dependency rule: depend on what you need, not on what happens to be nearby.

## D — Dependency Inversion Principle

High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details.

```javascript
// VIOLATION: OrderService depends directly on the concrete EmailService
class OrderService {
  async completeOrder(order) {
    order.status = 'completed'
    await db.orders.save(order)

    // Direct dependency on the specific EmailService implementation
    const emailService = new EmailService()   // hardcoded
    await emailService.sendOrderConfirmation(order)
  }
}

// FIXED: OrderService depends on an abstraction (the interface), not the implementation
class OrderService {
  constructor(orderRepository, notificationService) {
    // Dependencies are injected — the service doesn't know which implementations
    this.orderRepository = orderRepository
    this.notificationService = notificationService
  }

  async completeOrder(order) {
    order.status = 'completed'
    await this.orderRepository.save(order)
    await this.notificationService.sendConfirmation(order)   // calls the abstraction
  }
}

// In tests: inject a fake notifier
const fakeNotifier = { sendConfirmation: async () => {} }
const service = new OrderService(fakeRepository, fakeNotifier)

// In production: inject the real email service
const emailNotifier = new EmailNotificationService(config.emailApiKey)
const service = new OrderService(realRepository, emailNotifier)
```

```text
DEPENDENCY INVERSION ACHIEVES:
  → OrderService can be tested without sending real emails
  → Swapping email provider: replace one injected argument, touch nothing else
  → High-level policy (complete the order) is separate from low-level mechanism (send email)
```

**Common mistakes:**
- Treating SOLID as rules to follow perfectly rather than heuristics — a 50-line utility script does not need SOLID. These principles pay off at the module and class level in larger codebases where change is frequent.
- Over-applying Single Responsibility until everything is tiny — a class with 3 methods that all relate to the same concept does not need to be split. "One reason to change" means one domain concern, not one method per class.
- Confusing Dependency Inversion with dependency injection — DI is the mechanism (injecting via constructor), DIP is the principle (depend on abstractions). You can have injection without inversion (inject a concrete class) and inversion without injection (use a factory that returns abstract types).

**Debug tip:** When a test requires setting up many things that aren't the thing being tested — mocking the database, mocking the email service, seeding test users — the class under test is violating Single Responsibility or Dependency Inversion. The test's pain is the design's feedback. Redesign the class to depend on injected abstractions; the test setup shrinks to the one thing you are testing.

## Challenge: solid_principles

Identify which SOLID principle is violated in each scenario.

```challenge
function identifyViolation(scenario) {
  // Returns: { principle: string, description: string }
  //   principle: 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP'
  //   description: one sentence explaining the violation

  if (scenario === 'god-class') {
    // UserManager: handles authentication, profile updates, email sending, audit logging,
    // billing, and session management — 800 lines, 40 methods.
  }

  if (scenario === 'throws-not-supported') {
    // class PermanentList extends MutableList {
    //   remove() { throw new Error('Cannot remove from permanent list') }
    // }
    // Code that uses MutableList calls remove() and crashes with PermanentList.
  }

  if (scenario === 'hardcoded-new') {
    // class ReportService {
    //   generate() { const db = new PostgresDatabase(); return db.query(...) }
    // }
    // Cannot test without a real Postgres database.
  }

  if (scenario === 'switch-on-type') {
    // function renderWidget(widget) {
    //   if (widget.type === 'button') { ... }
    //   else if (widget.type === 'input') { ... }
    //   else if (widget.type === 'dropdown') { ... }
    // }
    // Adding 'checkbox' requires modifying renderWidget.
  }
}
```

```test
const g = identifyViolation('god-class')
assert g.principle === 'SRP'
assert g.description.length > 15

const t = identifyViolation('throws-not-supported')
assert t.principle === 'LSP'
assert t.description.length > 15

const h = identifyViolation('hardcoded-new')
assert h.principle === 'DIP'
assert h.description.length > 15

const s = identifyViolation('switch-on-type')
assert s.principle === 'OCP'
assert s.description.length > 15
```
