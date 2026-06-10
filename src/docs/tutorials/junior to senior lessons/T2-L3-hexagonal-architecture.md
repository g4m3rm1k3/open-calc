# Junior to Senior — T2·L3 — Hexagonal Architecture (Ports and Adapters)

**Prerequisites:** T2·L2 (Layered Architecture). You understand layers and
their failure modes. This lesson covers hexagonal architecture — the pattern
that keeps the domain completely isolated from all infrastructure.

**What this lab adds:**
- Ports: interfaces the domain defines (what it needs)
- Adapters: implementations of those interfaces (how infrastructure provides it)
- Primary adapters: drive the application (HTTP, CLI, tests)
- Secondary adapters: driven by the application (database, email, file system)
- Why the domain never imports a framework
- Testing benefit: swap real adapters for fakes

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In hexagonal architecture, does the domain import the database adapter,
>    or does the database adapter import the domain?
> 2. A "port" is an interface. Who defines it — the domain or the infrastructure?
> 3. You want to test the business logic without a real database. What do
>    you substitute?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The same contact manager as T2·L2, but restructured so the domain has no imports
from infrastructure — verified by running the domain tests with no database:

```
$ npx ts-node hexagonal.ts

--- Test with InMemory adapter (fast, no DB) ---
✓ Creates a contact
✓ Prevents duplicate emails
✓ Validates required name

--- Test with File adapter (different infrastructure, same domain) ---
✓ Creates a contact (saved to contacts.json)
✓ Duplicate check still works

All tests passed — the domain works with any adapter
```

---

### Concept: Ports and Adapters

**What it is:** In hexagonal architecture, the domain defines *ports* — interfaces
that express what the domain needs. Infrastructure provides *adapters* — implementations
of those interfaces. The domain never imports infrastructure; infrastructure imports
the domain.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   Primary Adapters                    Secondary Adapters             │
│   (drive the application)             (driven by the application)    │
│   ┌──────────┐                        ┌──────────────────────────┐  │
│   │ HTTP API │                        │ MongoDB ContactRepository │  │
│   │ CLI Tool │                        │ InMemory ContactRepo      │  │
│   │ Tests    │                        │ File ContactRepository    │  │
│   └────┬─────┘                        └────────────┬─────────────┘  │
│        │                                           ↑                 │
│        │ calls                         implements  │                 │
│        ↓                                           │                 │
│   ┌────────────────────────────────────────────────┴────────────┐   │
│   │                        DOMAIN                                │   │
│   │                                                              │   │
│   │   Primary Ports           Secondary Ports (Interfaces)      │   │
│   │   (use cases)             ContactRepository interface        │   │
│   │   - createContact()       NotificationSender interface       │   │
│   │   - listContacts()                                           │   │
│   │                                                              │   │
│   │   Domain Objects          Business Rules                    │   │
│   │   Contact                 - no duplicate emails              │   │
│   │                           - name required                    │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Dependency arrows:
  Adapters → Domain    (adapters depend on domain)
  Domain → (nothing outside itself)
```

**The key difference from layered architecture:**

In layered architecture, the business logic layer calls the data layer directly.
If the data layer changes (MongoDB → PostgreSQL), the business logic layer may
need to change.

In hexagonal architecture, the domain defines a `ContactRepository` interface.
The MongoDB adapter implements it. The PostgreSQL adapter also implements it.
The domain never changes when infrastructure changes — it only changes when
business rules change.

**What it hides:** Hexagonal architecture hides all infrastructure from the
domain. The domain is a pure expression of business logic. It does not know
whether contacts are stored in a database, a file, or an in-memory dictionary.
It does not know whether HTTP, gRPC, or a CLI is used to interact with it.

The invariant: the domain contains no `import` statement that refers to
any framework, database, HTTP library, or file system. Every infrastructure
dependency goes in the other direction — adapters import the domain.

**Canonical example:** A hexagonal system is like a universal power socket.
The socket (the domain port) defines the interface: two round holes, specific
voltage. Any plug (adapter) that fits that interface works: German, French,
Swiss. The lamp (the domain) does not know which country's power grid it is
connected to. It just needs its defined interface to be satisfied.

---

## Step 1 — Define the Domain with Ports

Create `hexagonal.ts`:

```ts
// ══════════════════════════════════════════════════════════════════════
// DOMAIN — no imports from infrastructure whatsoever
// ══════════════════════════════════════════════════════════════════════

// ── Domain objects ───────────────────────────────────────────────────

interface Contact {
  id:        string;
  name:      string;
  email:     string;
  createdAt: Date;
}

// ── Secondary ports (interfaces the domain needs) ────────────────────
// The domain DEFINES these. Infrastructure IMPLEMENTS them.

interface ContactRepository {
  findByEmail(email: string): Contact | undefined;
  save(contact: Contact): void;
  findAll(): Contact[];
}

// ── Domain errors ─────────────────────────────────────────────────────

class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

// ── Domain service (use cases) ────────────────────────────────────────
// Depends only on the ContactRepository interface — never on a specific adapter.

function createContactService(contacts: ContactRepository) {
  return {
    create(name: string, email: string): Contact {
      if (!name.trim()) {
        throw new DomainError('Name is required', 'VALIDATION_ERROR');
      }
      if (!email.includes('@')) {
        throw new DomainError('Invalid email', 'VALIDATION_ERROR');
      }
      if (contacts.findByEmail(email)) {
        throw new DomainError('Email already registered', 'DUPLICATE_EMAIL');
      }

      const contact: Contact = {
        id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name:      name.trim(),
        email:     email.toLowerCase(),
        createdAt: new Date(),
      };

      contacts.save(contact);
      return contact;
    },

    list(): Contact[] {
      return contacts.findAll();
    },
  };
}
```

### SAVE AND TRY

```bash
npx ts-node hexagonal.ts
```

Expected: no output. Notice: the domain module has ZERO imports from infrastructure.
It defines its own interface (`ContactRepository`).

---

## Step 2 — Two Different Adapters, Same Domain

```ts
// ══════════════════════════════════════════════════════════════════════
// ADAPTERS — implement the ports, import the domain types
// ══════════════════════════════════════════════════════════════════════

// ── Adapter 1: In-memory (for tests) ─────────────────────────────────

class InMemoryContactRepository implements ContactRepository {
  private readonly store: Map<string, Contact> = new Map();

  findByEmail(email: string): Contact | undefined {
    return [...this.store.values()].find(c => c.email === email);
  }

  save(contact: Contact): void {
    this.store.set(contact.id, contact);
  }

  findAll(): Contact[] {
    return [...this.store.values()];
  }
}

// ── Adapter 2: File-based (different infrastructure, same port) ───────

import * as fs   from 'fs';
import * as path from 'path';

class FileContactRepository implements ContactRepository {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    // Create empty file if it does not exist:
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf-8');
    }
  }

  private readAll(): Contact[] {
    const raw = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(raw).map((c: Record<string, string>) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    }));
  }

  findByEmail(email: string): Contact | undefined {
    return this.readAll().find(c => c.email === email);
  }

  save(contact: Contact): void {
    const all = this.readAll();
    all.push(contact);
    fs.writeFileSync(this.filePath, JSON.stringify(all, null, 2), 'utf-8');
  }

  findAll(): Contact[] {
    return this.readAll();
  }
}
```

---

## Step 3 — Test the Domain With Both Adapters

```ts
// ══════════════════════════════════════════════════════════════════════
// TESTS — the domain works identically with any adapter
// ══════════════════════════════════════════════════════════════════════

function runDomainTests(
  adapterName: string,
  createRepository: () => ContactRepository,
): void {
  console.log(`\n--- Testing with ${adapterName} ---`);
  let passed = 0;
  let failed  = 0;

  function test(name: string, fn: () => void): void {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`  ✗ ${name}: ${error}`);
      failed++;
    }
  }

  function assertEqual<T>(actual: T, expected: T, msg: string): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  function assertThrows(fn: () => void, code: string): void {
    try {
      fn();
      throw new Error(`Expected DomainError with code ${code} but no error was thrown`);
    } catch (error) {
      if (!(error instanceof DomainError) || error.code !== code) {
        throw error;
      }
    }
  }

  // Create a fresh repository for each test run:
  const repo    = createRepository();
  const service = createContactService(repo);

  test('Creates a contact', () => {
    const contact = service.create('Alice', 'alice@example.com');
    assertEqual(contact.name, 'Alice', 'name');
    assertEqual(contact.email, 'alice@example.com', 'email');
    assertEqual(service.list().length, 1, 'list length');
  });

  test('Prevents duplicate emails', () => {
    const repo2    = createRepository();
    const service2 = createContactService(repo2);
    service2.create('Alice', 'alice@example.com');
    assertThrows(() => service2.create('Alice2', 'alice@example.com'), 'DUPLICATE_EMAIL');
  });

  test('Validates required name', () => {
    const repo3    = createRepository();
    const service3 = createContactService(repo3);
    assertThrows(() => service3.create('', 'bob@example.com'), 'VALIDATION_ERROR');
  });

  console.log(`  ${passed} passed, ${failed} failed`);
}

// Run the SAME tests with TWO different adapters:
runDomainTests('InMemoryContactRepository', () => new InMemoryContactRepository());

const testFilePath = path.join(__dirname, 'test-contacts.json');
if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath); // clean up
runDomainTests('FileContactRepository', () => new FileContactRepository(testFilePath));
if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath); // clean up
```

### SAVE AND TRY

```bash
npx ts-node hexagonal.ts
```

Expected:
```
--- Testing with InMemoryContactRepository ---
  ✓ Creates a contact
  ✓ Prevents duplicate emails
  ✓ Validates required name
  3 passed, 0 failed

--- Testing with FileContactRepository ---
  ✓ Creates a contact
  ✓ Prevents duplicate emails
  ✓ Validates required name
  3 passed, 0 failed
```

**The domain logic passes all tests regardless of which adapter is used.**
This is the core benefit of hexagonal architecture — swapping infrastructure
(in-memory → file → database) does not break business rules.

**Change something:** Add a third adapter: `NullContactRepository` that throws
`new Error('Database unavailable')` on every call. Run the domain tests with it.
Expected: all tests fail — but the domain code does not change. The failure is
in the adapter, not in the business logic.

---

### Concept: Primary vs Secondary Ports

**Primary ports (driving the application):**

Primary ports are the use cases the application exposes. They are the entry points.
`createContact`, `listContacts`, `deleteContact` — these are primary ports.

In hexagonal architecture, primary ports are often defined as an interface
that the application service implements:

```ts
interface ContactUseCases {
  create(name: string, email: string): Contact;
  list(): Contact[];
}
```

The HTTP adapter, CLI adapter, and test adapter all call through this interface.

**Secondary ports (driven by the application):**

Secondary ports are the dependencies the application needs. `ContactRepository`,
`EmailSender`, `AuditLogger` — these are secondary ports.

The domain defines them as interfaces. Infrastructure implements them.

**Why the naming matters:**

"Primary" = the application is the actor (it does something when called)
"Secondary" = the application calls out (it needs something from outside)

Primary adapters wrap the application. Secondary adapters are wrapped by the application.

---

## 🎯 Challenge: Add an Email Notification Port

**You know:** Ports, adapters, the dependency direction.

**Task:** Add a `NotificationSender` secondary port to the domain. After a contact
is successfully created, the service sends a "Welcome" notification.

Write:
1. `NotificationSender` interface in the domain (one method: `sendWelcome(to: string, name: string): void`)
2. `ConsoleNotificationSender` adapter (logs to console)
3. `SilentNotificationSender` adapter (does nothing — for tests that should not log)
4. Update `createContactService` to accept and use the sender
5. Confirm tests still pass with `SilentNotificationSender`

**Requirements:**
- The domain interface must be generic — it does not know if welcome messages go to email, SMS, or console
- The `ConsoleNotificationSender` does not import the domain (it only implements the interface)
- The domain service works with any `NotificationSender`

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In the domain — a secondary port:
interface NotificationSender {
  sendWelcome(to: string, name: string): void;
}

// Update createContactService:
function createContactService(
  contacts: ContactRepository,
  notifications: NotificationSender,
) {
  return {
    create(name: string, email: string): Contact {
      // ... validation and duplicate check unchanged ...

      const contact: Contact = { /* ... */ };
      contacts.save(contact);

      // Use the port — does not know what 'sendWelcome' actually does:
      notifications.sendWelcome(contact.email, contact.name);

      return contact;
    },
    // ...
  };
}

// Adapters:
class ConsoleNotificationSender implements NotificationSender {
  sendWelcome(to: string, name: string): void {
    console.log(`  [Email] Welcome ${name}! Sent to ${to}`);
  }
}

class SilentNotificationSender implements NotificationSender {
  sendWelcome(_to: string, _name: string): void {
    // Do nothing — for tests
  }
}

// Usage in tests — silent sender:
runDomainTests('InMemory + SilentNotifications', () => {
  const repo    = new InMemoryContactRepository();
  const service = createContactService(repo, new SilentNotificationSender());
  return { /* wrap service in a pseudo-repo for the test harness */ };
});
```

**Key insight:** Adding a new infrastructure concern (email notifications)
required: one new interface in the domain, two new adapter classes, and a
parameter addition to `createContactService`. The domain service's logic
did not change at all — it calls `notifications.sendWelcome(...)` without
knowing whether that sends an email, logs to console, or publishes to a
message queue. Replacing email with Slack notifications means writing a new
adapter — zero changes to the domain.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Domain has no infrastructure imports | Search domain section for `import * as fs` | Not found |
| Same domain, different adapters | Run with InMemory and File | Both pass |
| Port is defined by domain | `ContactRepository` interface location | In domain section |
| Adapter implements port | `InMemoryContactRepository implements ContactRepository` | Passes TypeScript check |
| Tests don't need real DB | Run tests without MongoDB running | All pass (using InMemory) |

---

## Quick Check Answers

**1. Does the domain import the database adapter, or vice versa?**

The database adapter imports the domain. The direction is: `MongoContactRepository`
imports the `Contact` type and implements the `ContactRepository` interface defined
in the domain. The domain never knows `MongoContactRepository` exists.
This is dependency inversion: the domain defines the contract; infrastructure
implements it. If it were reversed (domain imports MongoDB), changing the database
would require changing the domain — which should only change when business rules change.

**2. Who defines a port — domain or infrastructure?**

The domain defines ports. A port is an interface that expresses what the domain
needs ("I need something that can find contacts by email and save contacts").
The domain does not care HOW this is done — only WHAT it needs. Infrastructure
provides adapters that satisfy this "what." If infrastructure defined the interfaces,
the domain would have to conform to infrastructure's design decisions. The domain
defines the contract on its own terms.

**3. What do you substitute to test without a real database?**

A fake adapter — typically an in-memory implementation of the `ContactRepository`
interface that stores data in a `Map` or array. The fake satisfies the same
interface as the real database adapter, runs in microseconds (no I/O), and is
completely deterministic (no network flakiness). The domain cannot tell the
difference — it only sees the `ContactRepository` interface. This is the
primary testing benefit of hexagonal architecture: domain logic tests run
without any infrastructure setup.
