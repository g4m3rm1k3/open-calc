---
series: software-construction
level: 9
title: Dependency Injection and Interfaces
lang: javascript
---

# Dependency Injection and Interfaces

Every non-trivial module depends on other modules. How those dependencies are obtained determines whether the module can be understood in isolation, tested without scaffolding, and changed without ripple effects. The pattern that solves this problem is called **dependency injection**: instead of a module creating or finding its own dependencies, it receives them from the outside.

Dependency injection is not a framework feature or a design pattern requiring complex machinery. It is a discipline about where the `new` keyword lives. When a module creates its own dependencies, those dependencies are invisible, fixed, and untestable. When a module receives its dependencies, they are visible, swappable, and testable.

By the end of this lesson you will understand why modules that create their own dependencies are hard to test and change, how dependency injection solves this, and how to design interfaces that decouple modules from their implementations.

## The problem: hidden dependencies

```javascript
// EmailService creates its own dependencies — they are hidden
class OrderConfirmationService {
  async sendConfirmation(order) {
    const db = new PostgresDB(process.env.DATABASE_URL)    // hidden — creates its own database
    const email = new SendgridClient(process.env.API_KEY)  // hidden — creates its own email client
    const logger = new FileLogger('/var/log/app.log')      // hidden — creates its own logger

    const user = await db.findUser(order.userId)
    await email.send({ to: user.email, subject: 'Order confirmed', body: `Order #${order.id}` })
    logger.info(`Confirmation sent for order ${order.id}`)
  }
}
```

```text
Problems:
  Testing this requires: a real PostgreSQL database, real Sendgrid account, write access to /var/log/.
  Changing the database to MySQL? Edit this class.
  Changing the email provider? Edit this class.
  Logging to a different location? Edit this class.

  The class has three hidden dependencies that are invisible from the outside.
  To know what it depends on, you must read its implementation.
  Every tool it uses is hardwired into it.
```

## The fix: receive dependencies from the outside

```javascript
// OrderConfirmationService receives its dependencies — they are explicit
class OrderConfirmationService {
  constructor(db, emailClient, logger) {
    this.db = db
    this.emailClient = emailClient
    this.logger = logger
  }

  async sendConfirmation(order) {
    const user = await this.db.findUser(order.userId)
    await this.emailClient.send({ to: user.email, subject: 'Order confirmed', body: `Order #${order.id}` })
    this.logger.info(`Confirmation sent for order ${order.id}`)
  }
}
```

```text
What changed:
  The constructor declares every dependency explicitly.
  The class does not know how to create a database — it only uses one.
  The class does not know which email provider is used — it only calls send().
  The class does not know how logging works — it only calls info().

Now:
  Testing: pass fake implementations — no database, no email account required.
  Changing database: change the thing passed to the constructor, not this class.
  Changing email: same — change the caller, not this class.

  The class's purpose is: orchestrate confirming orders.
  That is all it does. Everything else is injected in.
```

```javascript
// Production: wire real implementations
const service = new OrderConfirmationService(
  new PostgresDB(process.env.DATABASE_URL),
  new SendgridClient(process.env.API_KEY),
  new FileLogger('/var/log/app.log')
)

// Testing: wire fakes
const service = new OrderConfirmationService(
  { findUser: async (id) => ({ email: 'test@example.com' }) },  // fake db
  { send: async (msg) => {} },                                    // fake email
  { info: (msg) => {} }                                           // fake logger
)
```

**CS lens:** Dependency injection is the runtime application of the **dependency inversion principle**: high-level modules should not depend on low-level modules — both should depend on abstractions. The `OrderConfirmationService` no longer depends on PostgresDB or SendgridClient specifically. It depends on "something with `findUser`" and "something with `send`". This is an abstraction. The abstraction is defined by how the module uses the dependency, not by who provides it.

## Interfaces — the contract between modules

An interface is a promise: "anything that implements this interface behaves in this way." In JavaScript, interfaces are implicit — there is no `interface` keyword enforcing them at runtime. But the concept is identical: two modules agree on a shared set of method names and behaviours.

```javascript
// The "UserRepository interface" is implicit in JavaScript:
// Any object passed as `userRepository` must have: findById(id) → Promise<User|null>

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  async getUser(id) {
    const user = await this.userRepository.findById(id)
    if (!user) return null
    return user
  }
}

// PostgreSQL implementation of the interface:
class PostgresUserRepository {
  async findById(id) {
    const row = await db.query('SELECT * FROM users WHERE id = $1', [id])
    return row.rows[0] ?? null
  }
}

// In-memory implementation — same interface, no database:
class InMemoryUserRepository {
  constructor(users = []) {
    this.users = new Map(users.map(u => [u.id, u]))
  }

  async findById(id) {
    return this.users.get(id) ?? null
  }
}
```

```text
UserService does not care which implementation it receives.
Both implementations fulfil the same contract: findById(id) → Promise<User|null>.

Production:   new UserService(new PostgresUserRepository())
Tests:        new UserService(new InMemoryUserRepository([testUser]))
Staging:      new UserService(new InMemoryUserRepository(stagingUsers))

Switching from PostgreSQL to MongoDB:
  Write MongoUserRepository with findById(id).
  Change one line in the wiring code.
  UserService is untouched.
```

**SE lens:** The discipline of programming to interfaces (not implementations) is what makes large codebases replaceable. When a team switches payment providers, database engines, or messaging systems, the work is writing the new adapter — not rewriting every module that uses the old one. This is why infrastructure decisions (which database, which cloud, which email service) can be deferred in a well-structured codebase: those decisions are isolated behind interfaces. The business logic — which is the expensive-to-develop part — stays unchanged.

**Common mistakes:**
- Injecting too many dependencies — a constructor that takes 8 parameters is a signal that the class is doing too much. Split it before injecting more.
- Creating factories inside the class — `new Dependency()` inside a method is still a hidden dependency. If the object is used for more than one call, it belongs in the constructor.
- Confusing injection with configuration — `config.databaseUrl` is not a dependency, it is configuration. A dependency is an object with behaviour. Pass the configured database object, not the URL string.

**Debug tip:** When a test requires real infrastructure (an actual database, a real network call) to pass, the dependency was not injected. Find the `new` call inside the class under test and move it to the constructor parameter.

## Challenge: inject_dependencies

Refactor this tightly-coupled function to accept its dependencies as parameters.

```challenge
// BEFORE: tightly coupled
async function generateInvoice(orderId) {
  const db = new PostgresDB(process.env.DATABASE_URL)
  const pdf = new PdfGenerator()
  const store = new S3Storage(process.env.BUCKET)

  const order = await db.findOrder(orderId)
  const invoice = await pdf.generate(order)
  const url = await store.upload(`invoice-${orderId}.pdf`, invoice)
  return url
}

// AFTER: dependencies injected
async function generateInvoice(orderId, db, pdf, store) {
  // same body — only the signature changes
}

// Test it can be called with fakes (this is the test your assertions run against):
const fakeDb    = { findOrder: async (id) => ({ id, total: 99.99, items: [] }) }
const fakePdf   = { generate: async (order) => Buffer.from('pdf-content') }
const fakeStore = { upload: async (name, data) => `https://cdn.example.com/${name}` }

const url = await generateInvoice('ord-42', fakeDb, fakePdf, fakeStore)
```

```test
assert typeof url === 'string'
assert url.includes('ord-42')
assert url.startsWith('https://')
const url2 = await generateInvoice('ord-99', fakeDb, fakePdf, fakeStore)
assert url2.includes('ord-99')
assert url !== url2
```
