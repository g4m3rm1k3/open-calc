# Junior to Senior — T2·L7 — Three Architectures: Side-by-Side Comparison

**Prerequisites:** T2·L6 (Internal Event Bus). You have built the bus.
This lesson takes the contacts tool from Topic 1 and restructures it three
ways so you see the tradeoffs directly in working code.

**What this lab adds:**
- The same contacts tool implemented in layered, hexagonal, and event-driven styles
- Direct code comparison — what changes, what stays the same
- Identifying architecture from an existing codebase
- The seam: where domain logic ends and infrastructure begins

**Time:** 90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In which architecture does the domain contain import statements from
>    the database library?
> 2. You want to add a Slack notification when a contact is created.
>    In which architecture do you modify zero existing files?
> 3. A test for the domain layer must set up a real database in which architecture?
>
> *(Answers at the end of this lab)*

---

## Setup

All three versions use the same observable behaviour — create a contact,
detect duplicates, validate — but implement it differently.

Create `three-architectures.ts`. We will add each architecture in sections.

---

## Architecture 1 — Layered

**Layers:** Presentation → Service → Repository  
**Dependency direction:** each layer imports the layer below it  
**Key property:** business logic lives in the service layer

```ts
// ═══════════════════════════════════════════════
// LAYERED ARCHITECTURE
// ═══════════════════════════════════════════════

namespace Layered {

  // ── Data Layer ──────────────────────────────

  interface ContactRow { id: string; name: string; email: string }
  const layeredDb: ContactRow[] = [];

  const ContactRepository = {
    findByEmail(email: string): ContactRow | undefined {
      return layeredDb.find(r => r.email === email);
    },
    save(row: ContactRow): void {
      layeredDb.push(row);
    },
    findAll(): ContactRow[] {
      return [...layeredDb];
    },
  };

  // ── Service Layer ────────────────────────────
  // Imports the repository directly (tight coupling to data layer)

  interface Contact { id: string; name: string; email: string }

  export const ContactService = {
    create(name: string, email: string): Contact {
      if (!name.trim())          throw new Error('Name required');
      if (!email.includes('@'))  throw new Error('Invalid email');
      if (ContactRepository.findByEmail(email)) throw new Error('Duplicate');

      const contact = { id: `l-${Date.now()}`, name, email };
      ContactRepository.save(contact);
      return contact;
    },
    list(): Contact[] {
      return ContactRepository.findAll();
    },
  };

  // ── Presentation Layer ───────────────────────
  // Handles HTTP-like input/output, calls service layer

  export function handleCreate(body: unknown): { status: number; body: unknown } {
    const { name, email } = body as Record<string, string>;
    try {
      const contact = ContactService.create(name, email);
      return { status: 201, body: contact };
    } catch (e) {
      return { status: 422, body: { error: (e as Error).message } };
    }
  }

}
```

---

## Architecture 2 — Hexagonal

**Layers:** Domain (pure) ↔ Adapters (implement domain interfaces)  
**Dependency direction:** adapters import domain; domain imports nothing  
**Key property:** domain defines interfaces; infrastructure implements them

```ts
// ═══════════════════════════════════════════════
// HEXAGONAL ARCHITECTURE
// ═══════════════════════════════════════════════

namespace Hexagonal {

  // ── Domain (no infrastructure imports) ──────

  interface Contact { id: string; name: string; email: string }

  // Port defined by the domain:
  interface ContactRepository {
    findByEmail(email: string): Contact | undefined;
    save(contact: Contact): void;
    findAll(): Contact[];
  }

  export function createContactService(repo: ContactRepository) {
    return {
      create(name: string, email: string): Contact {
        if (!name.trim())          throw new Error('Name required');
        if (!email.includes('@'))  throw new Error('Invalid email');
        if (repo.findByEmail(email)) throw new Error('Duplicate');

        const contact = { id: `h-${Date.now()}`, name, email };
        repo.save(contact);
        return contact;
      },
      list(): Contact[] {
        return repo.findAll();
      },
    };
  }

  // ── Adapters (implement the port) ───────────

  export class InMemoryContactRepository implements ContactRepository {
    private readonly store: Contact[] = [];
    findByEmail(email: string): Contact | undefined {
      return this.store.find(c => c.email === email);
    }
    save(contact: Contact): void { this.store.push(contact); }
    findAll(): Contact[] { return [...this.store]; }
  }

  // ── Primary adapter (HTTP-like) ──────────────

  export function handleCreate(
    service: ReturnType<typeof createContactService>,
    body: unknown,
  ): { status: number; body: unknown } {
    const { name, email } = body as Record<string, string>;
    try {
      const contact = service.create(name, email);
      return { status: 201, body: contact };
    } catch (e) {
      return { status: 422, body: { error: (e as Error).message } };
    }
  }

}
```

---

## Architecture 3 — Event-Driven

**Layers:** Domain emits events; listeners react independently  
**Dependency direction:** listeners import domain types; domain emits events  
**Key property:** adding behaviour requires zero changes to existing code

```ts
// ═══════════════════════════════════════════════
// EVENT-DRIVEN ARCHITECTURE
// ═══════════════════════════════════════════════

namespace EventDriven {

  interface Contact { id: string; name: string; email: string }

  // ── Event bus ────────────────────────────────

  type EventMap = {
    'contact.created': Contact;
    'contact.create_failed': { reason: string };
  };

  type Handler<T> = (payload: T) => void;

  class Bus {
    private readonly handlers = new Map<string, Handler<unknown>[]>();
    on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
      const existing = this.handlers.get(event as string) ?? [];
      this.handlers.set(event as string, [...existing, handler as Handler<unknown>]);
    }
    emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
      (this.handlers.get(event as string) ?? []).forEach(h => h(payload));
    }
  }

  export const bus = new Bus();

  // ── Domain service (emits, never calls listeners) ──

  const store: Contact[] = [];

  export const ContactService = {
    create(name: string, email: string): void {
      if (!name.trim() || !email.includes('@') || store.find(c => c.email === email)) {
        bus.emit('contact.create_failed', {
          reason: !name.trim() ? 'Name required'
                : !email.includes('@') ? 'Invalid email'
                : 'Duplicate',
        });
        return;
      }
      const contact = { id: `e-${Date.now()}`, name, email };
      store.push(contact);
      bus.emit('contact.created', contact);
    },
    list(): Contact[] { return [...store]; },
  };

  // ── Independent listeners ─────────────────────

  bus.on('contact.created', contact => {
    // Could be: send email, audit log, search index — all independent
  });

}
```

---

## Comparison — Run All Three

```ts
// ── Run all three ──────────────────────────────

console.log('=== LAYERED ===');
console.log(Layered.handleCreate({ name: 'Alice', email: 'alice@example.com' }));
console.log(Layered.handleCreate({ name: 'Alice2', email: 'alice@example.com' }));
console.log(Layered.handleCreate({ name: '', email: 'x' }));

console.log('\n=== HEXAGONAL ===');
const hexRepo    = new Hexagonal.InMemoryContactRepository();
const hexService = Hexagonal.createContactService(hexRepo);
console.log(Hexagonal.handleCreate(hexService, { name: 'Alice', email: 'alice@example.com' }));
console.log(Hexagonal.handleCreate(hexService, { name: 'Alice2', email: 'alice@example.com' }));

console.log('\n=== EVENT-DRIVEN ===');
const results: unknown[] = [];
EventDriven.bus.on('contact.created',       c  => results.push({ ok: true,  contact: c }));
EventDriven.bus.on('contact.create_failed', e  => results.push({ ok: false, error: e.reason }));
EventDriven.ContactService.create('Alice', 'alice@example.com');
EventDriven.ContactService.create('Alice2', 'alice@example.com');
console.log(results);
```

### SAVE AND TRY

```bash
npx ts-node three-architectures.ts
```

Expected:
```
=== LAYERED ===
{ status: 201, body: { id: 'l-...', name: 'Alice', email: 'alice@example.com' } }
{ status: 422, body: { error: 'Duplicate' } }
{ status: 422, body: { error: 'Name required' } }

=== HEXAGONAL ===
{ status: 201, body: { id: 'h-...', name: 'Alice', email: 'alice@example.com' } }
{ status: 422, body: { error: 'Duplicate' } }

=== EVENT-DRIVEN ===
[
  { ok: true,  contact: { id: 'e-...', name: 'Alice', email: 'alice@example.com' } },
  { ok: false, error: 'Duplicate' }
]
```

---

## The Direct Comparison

| Question | Layered | Hexagonal | Event-Driven |
|---|---|---|---|
| Does domain import infrastructure? | Yes (repository) | No | No |
| Test domain without DB? | No (must mock repo) | Yes (inject fake) | Yes (listen to events) |
| Add Slack notification? | Modify service | Add a new adapter | Subscribe to event — zero changes elsewhere |
| Understand the full workflow? | Read the service | Read the service | Read all subscribers |
| Error handling? | Exception propagates | Exception propagates | Emit an error event |
| Domain owns the interface? | No (data layer owns it) | Yes (domain defines the port) | Shared event types |

**None is universally "best."** The choice depends on:
- How often does the infrastructure change? → Hexagonal
- How many independent reactions to domain events? → Event-driven
- Simple workflow with clear layers? → Layered
- Starting a new system? → Hexagonal or Layered, then event-driven as needed

---

## Step 2 — Identifying Architecture From Code

Given these three code snippets, identify which architecture each uses and why.

**Snippet A:**
```ts
class OrderService {
  constructor(private readonly db: Database) {}

  placeOrder(items: Item[]): Order {
    const order = this.db.orders.create({ items, status: 'pending' });
    this.db.inventory.decrementAll(items);
    this.notifyWarehouse(order);
    return order;
  }

  private notifyWarehouse(order: Order): void { ... }
}
```

**Snippet B:**
```ts
function placeOrder(
  orderRepo: OrderRepository,
  inventoryRepo: InventoryRepository,
  notifier: WarehouseNotifier,
  items: Item[],
): Order {
  const order = orderRepo.save({ items, status: 'pending' });
  inventoryRepo.decrementAll(items);
  notifier.notify(order);
  return order;
}
```

**Snippet C:**
```ts
bus.on('order.placed', order => inventoryService.decrement(order.items));
bus.on('order.placed', order => warehouseService.notify(order));

function placeOrder(items: Item[]): void {
  const order = { id: generateId(), items, status: 'pending' };
  orderStore.save(order);
  bus.emit('order.placed', order);
}
```

### SAVE AND TRY

Write your analysis — then compare:

**Snippet A — Layered (anemic domain):**  
`OrderService` imports `Database` directly — the data layer. `notifyWarehouse` is buried inside the service as a private method. Testing this service requires a real (or mocked) `Database`. Adding a new notification means modifying `OrderService`.

**Snippet B — Hexagonal:**  
`placeOrder` receives all dependencies as parameters (injected). Each is an interface, not a concrete implementation. Testing requires fake implementations. Adding a new notification means passing a different `WarehouseNotifier` — zero changes to `placeOrder`.

**Snippet C — Event-driven:**  
`placeOrder` emits an event and has no knowledge of inventory or warehouse. Adding a new reaction means subscribing — zero changes to `placeOrder`. Testing `placeOrder` in isolation means checking only that `order.placed` was emitted.

---

## 🎯 Challenge: Refactor Snippet A

**You know:** All three architectures and their tradeoffs.

**Task:** Refactor Snippet A from the identifying exercise using both hexagonal
and event-driven approaches.

**Hexagonal version:** Remove the `Database` import. Define the `OrderRepository`,
`InventoryRepository`, and `WarehouseNotifier` interfaces. Inject them.

**Event-driven version:** `placeOrder` emits `order.placed`. `inventoryService`
and `warehouseService` subscribe independently. `placeOrder` has zero knowledge
of them.

**Which version would you choose for a new order management system? Write a
one-paragraph justification.**

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// ── Hexagonal version ───────────────────────────────────────────────────

interface Order { id: string; items: string[]; status: string }
interface Item   { id: string; quantity: number }

interface OrderRepository    { save(order: Omit<Order, 'id'>): Order }
interface InventoryRepository { decrementAll(items: Item[]): void }
interface WarehouseNotifier   { notify(order: Order): void }

function placeOrderHex(
  orderRepo:     OrderRepository,
  inventoryRepo: InventoryRepository,
  notifier:      WarehouseNotifier,
  items:         Item[],
): Order {
  const order = orderRepo.save({ items: items.map(i => i.id), status: 'pending' });
  inventoryRepo.decrementAll(items);
  notifier.notify(order);
  return order;
}

// ── Event-driven version ────────────────────────────────────────────────

const orderBus = new TypedEventBus(); // using our bus from T2-L6

// placeOrder only knows about orders:
function placeOrderEvent(items: Item[]): Order {
  const order = { id: generateId(), items: items.map(i => i.id), status: 'pending' };
  orderStore.save(order);
  orderBus.emit('order.placed', order);  // does not call inventory or warehouse
  return order;
}

// Independent reactions:
orderBus.on('order.placed', order => inventoryService.decrementAll(order.items));
orderBus.on('order.placed', order => warehouseService.notify(order));
```

**Which to choose:**

For a new order management system where inventory updates and warehouse notifications
will have many future additions (email, ERP integration, analytics), the event-driven
approach is better. Each new consumer adds zero code to `placeOrder`. The hexagonal
approach is better if the workflow is complex with conditional logic (what if
inventory is insufficient — do you still notify the warehouse?) because the service
is explicit about the sequence and can inspect results at each step.

In practice, many systems use both: hexagonal for the core workflow (where sequence
matters) and event-driven for cross-cutting reactions (audit logs, notifications,
caching) that are genuinely independent.

</details>

---

## Final Check

| Architecture | Key identifier in code |
|---|---|
| Layered | Service imports a concrete repository directly |
| Hexagonal | Service parameter is an interface; adapters implement it |
| Event-driven | Service emits events; handlers subscribe independently |

| Question | Answer without looking |
|---|---|
| Which allows domain testing without a database? | |
| Which allows adding a listener without changing existing code? | |
| Which makes the full workflow readable in one place? | |
| Which architecture does the CAD/CAM application use? | |

---

## Quick Check Answers

**1. In which architecture does the domain import from the database library?**

Layered. The service layer typically imports the repository directly (which
uses the database library). In Hexagonal, the domain defines an interface and
has zero imports from infrastructure. In Event-Driven, the domain emits events
through the bus (which is usually in-process and does not involve infrastructure).

**2. Adding a Slack notification requires modifying zero existing files in which architecture?**

Event-Driven. Adding Slack notifications means writing one new `bus.on('contact.created', ...)`
subscriber. The `ContactService` does not change. The existing email subscriber does
not change. The only new file is the Slack subscriber. In Layered or Hexagonal,
the service must be modified to call the Slack notifier.

**3. A domain test must set up a real database in which architecture?**

Layered (potentially). In the simplest Layered implementation, the service imports
the repository directly and the repository uses the real database — tests require
the database. With dependency injection, Layered can use fakes. Hexagonal makes
this easy by design (inject any `ContactRepository` implementation). Event-Driven
tests typically just check that the right events were emitted — no database needed
at all for the domain tests.
