# FOUNDATIONS — LAB-052 — SOLID: Dependency Inversion Principle

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 50–65 minutes.

---

## What You Will Build

A high-level `OrderService` that directly instantiates its database dependency (the violation), a refactored version using constructor injection, and a test that substitutes an in-memory implementation without changing `OrderService`. After this lab you will understand why "high-level modules should not depend on low-level modules" and what "inversion of control" means mechanically.

---

## What You Need to Know First

**From LAB-017 (Interfaces):** DIP's mechanism is the interface. The high-level module depends on an interface; the low-level module implements it.

**From LAB-049 (OCP) and LAB-051 (ISP):** DIP completes SOLID by handling the direction of dependencies. All three are implemented via interfaces.

---

> **Quick Check — try to answer before reading:**
>
> 1. What does "inversion of control" mean? What is inverted?
> 2. The original code has `new MySQLDatabase()` inside `OrderService`. What problem does this create?
> 3. What is "dependency injection"? Is it the same as DIP?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Violation: Depending on a Concrete Class

```typescript
// Low-level module: a specific database implementation
class MySQLDatabase {
  saveOrder(order: { id: string; total: number }): void {
    console.log(`[MySQL] INSERT INTO orders VALUES ('${order.id}', ${order.total})`);
  }

  getOrder(id: string): { id: string; total: number } | null {
    console.log(`[MySQL] SELECT * FROM orders WHERE id = '${id}'`);
    return { id, total: 99.99 };  // simulated
  }
}

// High-level module: directly creates its low-level dependency
class OrderService {
  private readonly database = new MySQLDatabase();  // violation — concrete dependency

  placeOrder(orderId: string, total: number): void {
    const order = { id: orderId, total };
    this.database.saveOrder(order);
    console.log(`Order ${orderId} placed successfully`);
  }

  getOrderSummary(orderId: string): string {
    const order = this.database.getOrder(orderId);
    return order ? `Order ${order.id}: $${order.total}` : 'Not found';
  }
}
```

**The walkthrough — why this is a problem:**

1. **`OrderService` cannot be tested without MySQL.** `new MySQLDatabase()` runs when `OrderService` is instantiated. Any test of `OrderService` hits a real MySQL database — requires a running server, test data, cleanup.
2. **Switching to PostgreSQL requires editing `OrderService`.** The high-level business logic depends on the low-level storage detail. They are tightly coupled.
3. **The dependency graph flows downward:** `OrderService → MySQLDatabase`. The high-level module controls when the low-level module is created and configured.

**The CS lens — the dependency direction:** In the violation, `OrderService` (high level) knows about `MySQLDatabase` (low level). Changes to `MySQLDatabase` affect `OrderService`. The coupling flows from high to low — the wrong direction.

---

### Step 2 — The Fix: Depend on an Abstraction

```typescript
// The abstraction — both modules depend on this, not on each other:
interface OrderDatabase {
  saveOrder(order: { id: string; total: number }): void;
  getOrder(id: string): { id: string; total: number } | null;
}

// Low-level module implements the abstraction:
class MySQLDatabase implements OrderDatabase {
  saveOrder(order: { id: string; total: number }): void {
    console.log(`[MySQL] INSERT INTO orders: ${JSON.stringify(order)}`);
  }
  getOrder(id: string): { id: string; total: number } | null {
    console.log(`[MySQL] SELECT from orders WHERE id = '${id}'`);
    return { id, total: 99.99 };
  }
}

// High-level module depends on the abstraction — not the concrete class:
class OrderService {
  constructor(private readonly database: OrderDatabase) {}  // injection

  placeOrder(orderId: string, total: number): void {
    const order = { id: orderId, total };
    this.database.saveOrder(order);
    console.log(`Order ${orderId} placed`);
  }

  getOrderSummary(orderId: string): string {
    const order = this.database.getOrder(orderId);
    return order ? `Order ${order.id}: $${order.total}` : 'Not found';
  }
}
```

**The walkthrough — dependency injection:**

`OrderService` receives its `database` through the constructor — this is **constructor injection**. The `OrderService` does not create the database; the caller does. The caller controls which implementation is used. `OrderService` only knows about `OrderDatabase` (the interface), not `MySQLDatabase` or any other concrete class.

The dependency graph is now:
```
OrderDatabase (interface)
├── MySQLDatabase implements OrderDatabase
└── OrderService depends on OrderDatabase
```

Both `OrderService` and `MySQLDatabase` depend on the interface. Neither depends on the other. The interface is the inversion point — it inverts the classical top-down dependency direction.

---

### Step 3 — Testing with a Substitute

```typescript
// In-memory implementation for tests — zero real infrastructure:
class InMemoryDatabase implements OrderDatabase {
  private readonly orders = new Map<string, { id: string; total: number }>();

  saveOrder(order: { id: string; total: number }): void {
    this.orders.set(order.id, order);
  }

  getOrder(id: string): { id: string; total: number } | null {
    return this.orders.get(id) ?? null;
  }
}

// Test — no MySQL, no network, no setup:
function testOrderService(): void {
  const testDatabase = new InMemoryDatabase();
  const orderService = new OrderService(testDatabase);  // inject test implementation

  orderService.placeOrder('order-001', 59.99);

  const summary = orderService.getOrderSummary('order-001');
  console.assert(summary === 'Order order-001: $59.99', `Expected correct summary, got: ${summary}`);

  const notFound = orderService.getOrderSummary('order-999');
  console.assert(notFound === 'Not found', `Expected Not found, got: ${notFound}`);

  console.log('All tests passed');
}

testOrderService();

// Production wiring:
const productionService = new OrderService(new MySQLDatabase());
productionService.placeOrder('prod-001', 99.99);
```

**The walkthrough — what changed:** `OrderService` did not change. `MySQLDatabase` did not change. A new `InMemoryDatabase` was added. The test instantiates `OrderService` with `InMemoryDatabase`. Production instantiates it with `MySQLDatabase`. The wiring (which implementation to inject) is the only decision that varies.

**The SE lens — inversion of control:** "Inversion of control" means that the control of creating dependencies is inverted — moved from the class (which used to `new` its dependencies) to the caller (which injects them). This separates the business logic from the infrastructure wiring. The class knows WHAT it needs; the caller decides which concrete thing satisfies that need.

DIP is the principle. Constructor injection is one mechanism. Other mechanisms: method injection (pass the dependency to a method), property injection (set after construction). Constructor injection is preferred because it makes all dependencies visible at construction time.

---

### Step 4 — DIP and the Test Suite Quality

```typescript
// How many tests can you write for each version?

// Version 1 (concrete dependency):
// - Cannot test without MySQL running
// - Tests are slow (network round-trips)
// - Tests require a specific database state
// - Tests may interfere with each other (shared database)

// Version 2 (interface + injection):
// - Test with InMemoryDatabase — instant, no setup
// - Can test error cases (simulate database failure)
// - Tests are isolated — each creates its own InMemoryDatabase instance
// - Tests run in parallel safely

// Demonstrating a simulated failure test:
class FailingDatabase implements OrderDatabase {
  saveOrder(order: { id: string; total: number }): void {
    throw new Error('Database connection lost');
  }
  getOrder(_id: string): null { return null; }
}

function testOrderServiceHandlesFailure(): void {
  const failingDb = new FailingDatabase();
  const service = new OrderService(failingDb);

  try {
    service.placeOrder('order-fail', 10);
    console.error('Expected error was not thrown');
  } catch (error) {
    console.assert(error instanceof Error && error.message === 'Database connection lost');
    console.log('Failure test passed');
  }
}
```

This test simulates a database failure — something impossible to trigger reliably against a real MySQL database. DIP makes this straightforward.

---

## Connect the Pieces

- **Every framework uses DIP.** Express middleware receives `req` and `res` — it does not create them. React components receive `props` — they do not fetch them. The framework injects the dependencies; the component uses them.
- **Dependency injection containers** (NestJS, Spring, Angular's DI) automate the wiring. They scan the codebase for `@Injectable` classes and wire constructors automatically — the principle is DIP; the container is a convenience.
- **The Repository pattern** (LAB-090) is DIP applied to data access: domain logic depends on a `Repository` interface; the implementation (SQL, MongoDB, in-memory) is injected.

---

## What Breaks Without This

**The hidden dependency test:**

```typescript
class OrderServiceBroken {
  private readonly database = new MySQLDatabase();  // hidden dependency
}

// This line is a lie — orderService has a dependency on MySQL that is invisible here:
const orderService = new OrderServiceBroken();

// To discover the dependency, you must read the class internals.
// To change the database, you must edit the class.
// To test the class, you must have MySQL running.
```

Hidden dependencies are the root cause of tests that require a running database, tests that fail because of environment state, and classes that cannot be tested in isolation. Making dependencies explicit via constructor injection eliminates all three problems.

---

## Definition of Done

- [ ] `OrderService` constructor takes `OrderDatabase` — not `MySQLDatabase`
- [ ] `testOrderService()` passes with `InMemoryDatabase` — no MySQL required
- [ ] `testOrderServiceHandlesFailure()` demonstrates testing an error case via `FailingDatabase`
- [ ] Switching from `MySQLDatabase` to `PostgresDatabase` requires only changing the wiring (the `new` call) — not `OrderService`
- [ ] You can explain "inversion of control" in one sentence without using the words "dependency" or "injection"

**Git commit:**

```
git add src/
git commit -m "LAB-052: DIP — OrderService depends on OrderDatabase interface, not MySQLDatabase; constructor injection enables testing with InMemoryDatabase"
```

---

## Quick Check Answers

1. **Control of object creation is moved from the class that uses an object to the class that creates and wires the application.** Normally, a class controls when and how its dependencies are created (`new MySQLDatabase()`). With IoC, that control is inverted — the framework, test, or composition root creates the dependencies and provides them. What is inverted: who is in charge of creating and configuring collaborators.
2. **`OrderService` cannot be used or tested without MySQL.** The `new MySQLDatabase()` executes at construction time. Any test of `OrderService.placeOrder` requires a real database connection, database state, and cleanup. It also means switching databases requires editing the business logic class — violating both DIP and the SRP principle (business logic now also contains infrastructure decisions).
3. **Dependency injection is a mechanism; DIP is a principle.** DIP says high-level modules should depend on abstractions. Dependency injection is one technique for achieving this — you pass the dependency from outside rather than creating it inside. You can violate DIP while using injection (if you inject a concrete class rather than an interface). You can satisfy DIP without injection (using a factory or service locator — less common). Constructor injection is the most common, explicit, and testable form of DI.
