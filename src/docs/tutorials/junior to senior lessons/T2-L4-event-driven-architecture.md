# Junior to Senior — T2·L4 — Event-Driven Architecture

**Prerequisites:** T2·L3 (Hexagonal Architecture). You understand ports and
adapters. This lesson covers event-driven architecture — where components
communicate through events instead of direct calls.

**What this lab adds:**
- Events as facts: immutable records of what happened
- Event bus: the routing mechanism between producers and consumers
- Synchronous vs asynchronous event dispatch
- Choreography vs orchestration
- When event-driven is the right choice — and when it is not

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Module A calls module B directly. Module B is slow. What happens to module A?
>    If A emits an event instead, what happens?
> 2. "Choreography" vs "orchestration" — what is the difference?
> 3. An event says `ContactDeleted`. Is it correct for an event to say `DeleteContact`?
>    What is the difference?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact system where creating a contact triggers independent reactions —
without the contact service knowing any of them exist:

```
$ npx ts-node events.ts

[ContactService] Created contact: Alice (alice@example.com)

[AuditListener]   Logged: Contact alice@example.com created at 2026-05-19T...
[EmailListener]   Sent welcome email to alice@example.com
[IndexListener]   Indexed Alice for search

All three reactions happened — ContactService triggered none of them directly
```

---

### Concept: Events as Facts

**What it is:** In event-driven architecture, modules communicate by emitting
and consuming *events* — immutable records of something that happened.
An event is a fact, not a command.

**The naming distinction:**

| Type | Example | Direction |
|---|---|---|
| **Command** | `CreateContact` | "Please do this" — imperative, directed at a receiver |
| **Event** | `ContactCreated` | "This happened" — past tense, broadcast to anyone listening |

Commands can be rejected. Events cannot — they are facts about the past.
`ContactCreated` means a contact was created. It is not asking anyone to do anything.

**Why this matters:**

If `ContactService` calls `EmailService.sendWelcome()` directly (command style),
`ContactService` must know about `EmailService`. Adding Slack notifications
requires changing `ContactService`.

If `ContactService` emits `ContactCreated` (event style), it knows nothing
about what happens next. Slack notifications are added by subscribing to the event —
zero changes to `ContactService`.

**What it hides:** Events hide the coupling between producers and consumers.
`ContactService` has no idea who, if anyone, is listening. It just emits the fact.
Consumers subscribe independently.

The invariant: an event describes what happened, not what should happen next.
Consumers interpret the event and decide their own response.

**Canonical example:** An event is like a newspaper headline. "ELECTION RESULTS:
Smith wins" is a fact. Readers decide what to do: some vote next time, some
write a letter, some ignore it. The newspaper does not call each reader
individually and tell them what to do.

---

### Concept: The Event Bus

**What it is:** An event bus (also called an event emitter, message bus, or
pub/sub system) routes events from producers to all subscribed consumers.

```ts
// Simple synchronous event bus:
type EventHandler<T> = (payload: T) => void;

class EventBus {
  private handlers: Map<string, EventHandler<unknown>[]> = new Map();

  on<T>(event: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(event) ?? [];
    this.handlers.set(event, [...existing, handler as EventHandler<unknown>]);
  }

  emit<T>(event: string, payload: T): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.forEach(handler => handler(payload));
  }
}
```

**Synchronous dispatch:** `emit` calls all handlers before returning.
The producer waits for all consumers to finish. Simple, predictable, but
one slow consumer blocks the producer.

**Asynchronous dispatch:** `emit` schedules handlers to run later
(setTimeout, process.nextTick, Worker). The producer returns immediately.
More complex, but no consumer can block another.

---

## Step 1 — Define Events and the Bus

Create `events.ts`:

```ts
// ── Event types ────────────────────────────────────────────────────────

interface ContactCreatedEvent {
  contactId: string;
  name:      string;
  email:     string;
  timestamp: Date;
}

interface ContactDeletedEvent {
  contactId: string;
  email:     string;
  timestamp: Date;
}

// ── Typed event bus ────────────────────────────────────────────────────

type EventMap = {
  'contact.created': ContactCreatedEvent;
  'contact.deleted': ContactDeletedEvent;
};

class TypedEventBus {
  private readonly handlers: Map<string, Array<(payload: unknown) => void>> = new Map();

  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void {
    const existing = this.handlers.get(event as string) ?? [];
    this.handlers.set(event as string, [...existing, handler as (p: unknown) => void]);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.handlers.get(event as string) ?? [];
    handlers.forEach(handler => handler(payload));
  }
}

// Single shared bus instance:
const bus = new TypedEventBus();
```

### SAVE AND TRY

```bash
npx ts-node events.ts
```

Expected: no output. Nothing listens or emits yet.

**Change something:** Emit a test event: `bus.emit('contact.created', { contactId: '1', name: 'Test', email: 'test@e.com', timestamp: new Date() })`.
Expected: no output — nothing is listening yet.

---

## Step 2 — Producers and Consumers

```ts
// ── Contact service (producer) — emits events, never calls consumers ──

interface Contact { id: string; name: string; email: string }

const contacts: Map<string, Contact> = new Map();

function createContact(name: string, email: string): Contact {
  const contact: Contact = {
    id:    `${Date.now()}`,
    name,
    email,
  };
  contacts.set(contact.id, contact);

  // Emit event — does not know who listens:
  bus.emit('contact.created', {
    contactId: contact.id,
    name:      contact.name,
    email:     contact.email,
    timestamp: new Date(),
  });

  console.log(`[ContactService] Created contact: ${name} (${email})`);
  return contact;
}

// ── Consumers — subscribe independently ─────────────────────────────

// Consumer 1: audit log
bus.on('contact.created', (event) => {
  console.log(`[AuditListener]   Logged: Contact ${event.email} created at ${event.timestamp.toISOString()}`);
});

// Consumer 2: welcome email
bus.on('contact.created', (event) => {
  console.log(`[EmailListener]   Sent welcome email to ${event.email}`);
});

// Consumer 3: search index
bus.on('contact.created', (event) => {
  console.log(`[IndexListener]   Indexed ${event.name} for search`);
});

// ── Run ───────────────────────────────────────────────────────────────

createContact('Alice', 'alice@example.com');
```

### SAVE AND TRY

```bash
npx ts-node events.ts
```

Expected:
```
[ContactService] Created contact: Alice (alice@example.com)
[AuditListener]   Logged: Contact alice@example.com created at ...
[EmailListener]   Sent welcome email to alice@example.com
[IndexListener]   Indexed Alice for search
```

**Change something:** Add a new consumer at the bottom (after the `createContact` call).
Expected: the new consumer does NOT fire for Alice — she was created before the
consumer subscribed. This demonstrates the key behaviour of event buses: consumers
only receive events emitted after they subscribe. Events are not replayed.

Now move the new consumer above the `createContact` call. Expected: it fires.

---

### Concept: Choreography vs Orchestration

**Two ways to coordinate multiple services:**

**Choreography** — each service listens for events and reacts:
```
ContactService emits ContactCreated
  ↓ EventBus routes to:
AuditService (subscribed to ContactCreated) → logs it
EmailService (subscribed to ContactCreated) → sends email
SearchService (subscribed to ContactCreated) → indexes it

No central coordinator. Each service decides what to do.
```

**Orchestration** — a central coordinator calls each service:
```
ContactWorkflow calls:
  1. ContactService.create()
  2. AuditService.log()
  3. EmailService.sendWelcome()
  4. SearchService.index()

One process controls the sequence.
```

**When to use each:**

| Use choreography | Use orchestration |
|---|---|
| Services are independent — each just reacts | The workflow has complex conditional logic |
| Services are owned by different teams | You need compensating transactions (saga pattern) |
| Loose coupling is required | Debugging requires understanding one place |
| Adding features without modifying existing code | The sequence must be explicit and auditable |

**The choreography trade-off:** Adding a new step is zero code changes — just
add a subscriber. But understanding the full workflow requires reading ALL subscribers
scattered across the codebase. "What happens when a contact is created?" has no
single answer — you must search for all `contact.created` subscribers.

**The orchestration trade-off:** The workflow is readable in one place. But adding
a step requires modifying the orchestrator — coupling the orchestrator to every service.

---

## Step 3 — The Unsubscribe Pattern (Memory Safety)

A common mistake: subscribing to events without unsubscribing, causing memory leaks
when the subscriber is destroyed.

```ts
// The event bus should support unsubscription:
class SafeEventBus extends TypedEventBus {
  off<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void {
    const existing = this.handlers.get(event as string) ?? [];
    this.handlers.set(
      event as string,
      existing.filter(h => h !== (handler as (p: unknown) => void)),
    );
  }
}

const safeBus = new SafeEventBus();

// Register a listener and keep a reference:
const welcomeHandler = (event: ContactCreatedEvent): void => {
  console.log(`[SafeEmail] Welcome ${event.name}!`);
};

safeBus.on('contact.created', welcomeHandler);

// Emit — handler fires:
safeBus.emit('contact.created', {
  contactId: '1', name: 'Bob', email: 'bob@e.com', timestamp: new Date(),
});

// Unsubscribe — handler no longer fires:
safeBus.off('contact.created', welcomeHandler);

safeBus.emit('contact.created', {
  contactId: '2', name: 'Carol', email: 'carol@e.com', timestamp: new Date(),
});

console.log('\nBob should have received a welcome. Carol should not.');
```

### SAVE AND TRY

```bash
npx ts-node events.ts
```

Expected at the bottom:
```
[SafeEmail] Welcome Bob!

Bob should have received a welcome. Carol should not.
```

**Change something:** Remove the `safeBus.off(...)` call. Expected: Carol also
receives a welcome. This demonstrates why unsubscription is essential — without it,
destroyed or deactivated components continue to receive and process events.

---

## 🎯 Challenge: Event-Driven Validation Pipeline

**You know:** Event bus, producers, consumers, typed events.

**Task:** Build an event-driven validation pipeline for contact imports. Rather
than validating a contact in one function, split validation into independent
rule-checkers that each listen for the same event:

```ts
// Emit this event for each row:
bus.emit('contact.parsed', { rowNumber: 1, fields: { name: '', email: 'not-valid', city: 'Berlin' } });

// Each validator subscribes and emits its own event:
bus.emit('validation.error', { rowNumber: 1, field: 'name', message: 'Name is required' });
bus.emit('validation.error', { rowNumber: 1, field: 'email', message: 'Invalid email' });
```

**Requirements:**
- Three validators: `nameValidator`, `emailValidator`, `cityValidator`
- Each subscribes to `contact.parsed` and emits `validation.error` for each problem
- A `reporter` subscribes to `validation.error` and collects all errors
- After all rows are processed, the reporter prints a summary

**This tests:** understanding that event-driven components are independent —
each validator does not know about the others, and none know about the reporter.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
type ValidationBus = {
  'contact.parsed': { rowNumber: number; fields: { name: string; email: string; city: string } };
  'validation.error': { rowNumber: number; field: string; message: string };
};

class ValidationEventBus {
  private handlers: Map<string, Array<(p: unknown) => void>> = new Map();

  on<K extends keyof ValidationBus>(event: K, handler: (p: ValidationBus[K]) => void): void {
    const existing = this.handlers.get(event as string) ?? [];
    this.handlers.set(event as string, [...existing, handler as (p: unknown) => void]);
  }

  emit<K extends keyof ValidationBus>(event: K, payload: ValidationBus[K]): void {
    (this.handlers.get(event as string) ?? []).forEach(h => h(payload));
  }
}

const validationBus = new ValidationEventBus();
const errors: { rowNumber: number; field: string; message: string }[] = [];

// Validators — each subscribes independently:
validationBus.on('contact.parsed', ({ rowNumber, fields }) => {
  if (!fields.name.trim())
    validationBus.emit('validation.error', { rowNumber, field: 'name', message: 'Name is required' });
});

validationBus.on('contact.parsed', ({ rowNumber, fields }) => {
  if (!fields.email.includes('@'))
    validationBus.emit('validation.error', { rowNumber, field: 'email', message: 'Invalid email format' });
});

validationBus.on('contact.parsed', ({ rowNumber, fields }) => {
  if (!fields.city.trim())
    validationBus.emit('validation.error', { rowNumber, field: 'city', message: 'City is required' });
});

// Reporter — aggregates errors:
validationBus.on('validation.error', (error) => {
  errors.push(error);
});

// Process rows:
[
  { name: '',      email: 'not-valid', city: 'Berlin' },
  { name: 'Alice', email: 'alice@e.com', city: '' },
  { name: 'Bob',   email: 'bob@e.com', city: 'Paris' },
].forEach((fields, i) => {
  validationBus.emit('contact.parsed', { rowNumber: i + 1, fields });
});

// Report:
console.log(`\nValidation complete: ${errors.length} errors`);
errors.forEach(e => console.log(`  Row ${e.rowNumber} [${e.field}]: ${e.message}`));
```

**Key insight:** Each validator is completely independent — adding a fourth
validator (e.g. phone format checker) requires zero changes to existing validators.
The reporter does not care how many validators exist; it just collects whatever
`validation.error` events are emitted. This is choreography: each component
reacts to the same event independently, and the overall behaviour emerges from
their combined reactions.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Producer doesn't import consumers | Search `events.ts` for cross-imports | None found |
| New consumer needs zero changes to producer | Add 4th listener after 3rd | Works without modifying `createContact` |
| Unsubscribe works | Off, then emit | Handler does not fire |
| Typed bus prevents wrong payloads | Emit 'contact.created' with wrong shape | TypeScript error |
| Synchronous dispatch | Log order | Handlers run before next console.log in caller |

---

## Quick Check Answers

**1. A calls B directly (B is slow) vs A emits an event — what happens to A?**

With a direct call: A waits for B to finish before continuing. If B takes 2 seconds,
A is blocked for 2 seconds. Every operation A needs to complete is delayed. In a
web server, every request is affected.

With asynchronous event dispatch: A emits the event and continues immediately.
B processes the event in the background — A does not wait. A's performance is
unaffected by B's slowness. The trade-off is that A cannot receive a return value
from B synchronously; they communicate only through further events.

**2. Choreography vs orchestration?**

Choreography: each service independently decides what to do when it receives an
event. No central coordinator. Adding new behaviour means subscribing a new
service — zero changes elsewhere. The downside: understanding the full workflow
requires reading all subscribers.

Orchestration: a central process calls each service in sequence and manages
the workflow. The workflow is readable in one place. The downside: the orchestrator
is coupled to every service, and adding a step means modifying the orchestrator.

Neither is universally better. Choreography scales to many teams working
independently. Orchestration is clearer for complex workflows with conditional
logic and compensation.

**3. `ContactDeleted` vs `DeleteContact` — what is the difference?**

`ContactDeleted` is an event — a fact in the past tense. It says "this happened."
Nobody commanded it; it simply occurred. Consumers decide what to do (audit log,
notify owner, remove from index).

`DeleteContact` is a command — a request in the imperative. It says "please do
this." Commands can be rejected if the operation is not valid. Commands are
directed at a specific receiver.

Events are always past tense. They describe completed facts that cannot be undone
by the event bus itself (though the system may later compensate). Using past tense
in event names enforces this semantic: you cannot "undo" an event by emitting
the opposite event — you emit a new compensating event like `ContactRestored`.
