# Junior to Senior — T2·L2 — Layered (N-Tier) Architecture

**Prerequisites:** T2·L1 (What Architecture Is). You understand coupling,
cohesion, and the dependency rule. This lesson covers the most common architecture
you will encounter — the layered (N-tier) model.

**What this lab adds:**
- The three-layer model: Presentation, Business Logic, Data
- The strict layering rule — why skipping layers is a problem
- The anemic domain model — the most common failure mode of layered architecture
- How to identify a layered architecture in an existing codebase
- Where layered architecture breaks down

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In a three-layer architecture, can the Presentation layer call the
>    Data layer directly? Why or why not?
> 2. What is an "anemic domain model"? Is it a good thing?
> 3. A feature request requires changes to all three layers. Does this mean
>    the architecture is wrong?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A layered contact management system — three distinct layers with clean boundaries:

```
$ npx ts-node layered.ts

--- Presentation Layer (simulated HTTP request) ---
POST /contacts: { name: 'Alice', email: 'alice@example.com' }

--- Business Logic Layer ---
Validating contact...
Checking for duplicate email...
Creating contact...

--- Data Layer ---
Saved to database: Contact #1

--- Response ---
{ id: 1, name: 'Alice', email: 'alice@example.com', createdAt: '...' }
```

---

### Concept: The Three-Layer Model

**What it is:** The three-layer model separates an application into three horizontal
tiers, where each layer may only communicate with the layer directly adjacent to it.

```
┌──────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                              │
│  • Receives user input (HTTP, CLI, GUI)                          │
│  • Formats output (JSON, HTML, terminal)                         │
│  • Does NOT contain business logic                               │
│  • Does NOT access the database directly                         │
└────────────────────┬─────────────────────────────────────────────┘
                     │ calls ↓
┌────────────────────▼─────────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (also called: Domain, Service)             │
│  • Contains business rules and workflows                         │
│  • Validates data against domain rules                           │
│  • Orchestrates data access through the data layer               │
│  • Does NOT know about HTTP or UI                                │
│  • Does NOT access the database directly                         │
└────────────────────┬─────────────────────────────────────────────┘
                     │ calls ↓
┌────────────────────▼─────────────────────────────────────────────┐
│  DATA LAYER                                                      │
│  • Reads and writes to persistent storage                        │
│  • Translates between domain objects and database representation │
│  • Does NOT contain business logic                               │
│  • Does NOT know about HTTP or UI                                │
└──────────────────────────────────────────────────────────────────┘
```

**The strict layering rule:** Each layer may only call the layer directly below it.
Presentation calls Business Logic. Business Logic calls Data. Presentation
NEVER calls Data directly (that would skip the business logic layer, bypassing
all validation and domain rules).

**What it hides:** The layered model hides implementation details across
boundaries. The presentation layer does not know whether the business logic
uses MongoDB or PostgreSQL. The business logic does not know whether requests
come from HTTP or a CLI script. Changing the presentation (switching from REST
to GraphQL) does not require touching the data layer.

The invariant: every data access in the application goes through the business
logic layer. You cannot accidentally bypass validation by calling the database directly.

**Canonical example:** Layered architecture is like a restaurant. The dining
room (presentation) takes orders from guests and serves food. The kitchen (business
logic) cooks, applies recipes, and manages quality. The pantry (data) stores ingredients
and supplies. A guest cannot walk into the pantry — they order through the dining
room. A waiter does not cook — they give orders to the kitchen. Each role is separate.

---

## Step 1 — Implement the Three Layers

Create `layered.ts`:

```ts
// ══════════════════════════════════════════════════════════════════════
// DATA LAYER — storage only, no business logic
// ══════════════════════════════════════════════════════════════════════

interface ContactRecord {
  id:        number;
  name:      string;
  email:     string;
  createdAt: Date;
}

// Simulates a database:
let nextId = 1;
const database: ContactRecord[] = [];

const ContactDataAccess = {
  findByEmail(email: string): ContactRecord | undefined {
    return database.find(c => c.email === email);
  },

  save(name: string, email: string): ContactRecord {
    const record: ContactRecord = { id: nextId++, name, email, createdAt: new Date() };
    database.push(record);
    console.log(`--- Data Layer ---\nSaved to database: Contact #${record.id}`);
    return record;
  },

  findAll(): ContactRecord[] {
    return [...database];
  },
};
```

### SAVE AND TRY

```bash
npx ts-node layered.ts
```

Expected: no output (nothing calls the data layer yet).

**Change something:** Call `ContactDataAccess.save('Test', 'test@e.com')` at the
bottom and log the result. Expected: saves and returns the record.

---

## Step 2 — Business Logic Layer

```ts
// ══════════════════════════════════════════════════════════════════════
// BUSINESS LOGIC LAYER — rules and workflows, no HTTP or database details
// ══════════════════════════════════════════════════════════════════════

interface CreateContactInput {
  name:  string;
  email: string;
}

interface Contact {
  id:        number;
  name:      string;
  email:     string;
  createdAt: Date;
}

class ContactValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = 'ContactValidationError';
  }
}

const ContactService = {
  create(input: CreateContactInput): Contact {
    console.log('--- Business Logic Layer ---');

    // Validation rules — business concerns, not database concerns:
    console.log('Validating contact...');
    if (!input.name.trim()) {
      throw new ContactValidationError('Name is required', 'name');
    }
    if (!input.email.includes('@')) {
      throw new ContactValidationError('Email must contain @', 'email');
    }

    // Domain rule: no duplicate emails:
    console.log('Checking for duplicate email...');
    const existing = ContactDataAccess.findByEmail(input.email);
    if (existing) {
      throw new ContactValidationError(`Email already registered`, 'email');
    }

    // Delegate to data layer for persistence:
    console.log('Creating contact...');
    const record = ContactDataAccess.save(input.name.trim(), input.email.toLowerCase());

    // Return domain object (not the raw database record):
    return {
      id:        record.id,
      name:      record.name,
      email:     record.email,
      createdAt: record.createdAt,
    };
  },

  list(): Contact[] {
    return ContactDataAccess.findAll();
  },
};
```

### SAVE AND TRY

Add a direct call to the service:

```ts
const contact = ContactService.create({ name: 'Test', email: 'test@example.com' });
console.log('Created:', contact);
```

```bash
npx ts-node layered.ts
```

Expected:
```
--- Business Logic Layer ---
Validating contact...
Checking for duplicate email...
Creating contact...
--- Data Layer ---
Saved to database: Contact #1
Created: { id: 1, name: 'Test', email: 'test@example.com', createdAt: ... }
```

---

## Step 3 — Presentation Layer

```ts
// ══════════════════════════════════════════════════════════════════════
// PRESENTATION LAYER — HTTP handling only, no business logic
// ══════════════════════════════════════════════════════════════════════

// Simulates an HTTP request handler (no actual Express dependency):
function handleCreateContact(body: unknown): { status: number; body: unknown } {
  console.log('--- Presentation Layer ---');
  console.log(`POST /contacts: ${JSON.stringify(body)}`);

  // Input parsing — presentation concern:
  if (typeof body !== 'object' || body === null) {
    return { status: 400, body: { error: 'Request body must be an object' } };
  }

  const { name, email } = body as Record<string, unknown>;

  if (typeof name !== 'string' || typeof email !== 'string') {
    return { status: 400, body: { error: 'name and email must be strings' } };
  }

  // Delegate all business logic to the service layer:
  try {
    const contact = ContactService.create({ name, email });
    return { status: 201, body: contact };
  } catch (error) {
    // Translate domain errors to HTTP responses:
    if (error instanceof ContactValidationError) {
      return { status: 422, body: { error: error.message, field: error.field } };
    }
    return { status: 500, body: { error: 'Internal server error' } };
  }
}

// ── Run it ───────────────────────────────────────────────────────────

console.log('=== Creating Alice ===');
const response1 = handleCreateContact({ name: 'Alice', email: 'alice@example.com' });
console.log('--- Response ---');
console.log(response1);

console.log('\n=== Duplicate email ===');
const response2 = handleCreateContact({ name: 'Alice2', email: 'alice@example.com' });
console.log('--- Response ---');
console.log(response2);

console.log('\n=== Invalid input ===');
const response3 = handleCreateContact({ name: '', email: 'not-an-email' });
console.log('--- Response ---');
console.log(response3);
```

### SAVE AND TRY

```bash
npx ts-node layered.ts
```

Expected:
```
=== Creating Alice ===
--- Presentation Layer ---
POST /contacts: {"name":"Alice","email":"alice@example.com"}
--- Business Logic Layer ---
Validating contact...
Checking for duplicate email...
Creating contact...
--- Data Layer ---
Saved to database: Contact #1
--- Response ---
{ status: 201, body: { id: 1, name: 'Alice', email: 'alice@example.com', createdAt: ... } }

=== Duplicate email ===
...
--- Response ---
{ status: 422, body: { error: 'Email already registered', field: 'email' } }

=== Invalid input ===
...
--- Response ---
{ status: 422, body: { error: 'Name is required', field: 'name' } }
```

**Change something:** Add a `console.log('DB accessed!')` inside `ContactDataAccess.save`.
Notice that when validation fails (invalid input or duplicate email), the log
never appears — the data layer is never reached. This is the invariant in action:
invalid data cannot bypass the business logic layer to reach the database.

---

### Concept: The Anemic Domain Model — The Common Failure

**What it is:** An anemic domain model is when the business logic layer contains
only procedure-oriented service functions, and the domain objects are just data
containers with no behaviour. This appears to be layered architecture but
misses the benefit.

**What it looks like:**

```ts
// Anemic — the Contact class is just a bag of data:
class Contact {
  id:        number = 0;
  name:      string = '';
  email:     string = '';
  isActive:  boolean = true;
  tags:      string[] = [];
}

// All logic is in services (ContactService knows EVERYTHING):
class ContactService {
  validate(contact: Contact): boolean { ... }
  activate(contact: Contact): void { contact.isActive = true; }
  deactivate(contact: Contact): void { contact.isActive = false; }
  addTag(contact: Contact, tag: string): void { contact.tags.push(tag); }
  removeTag(contact: Contact, tag: string): void {
    contact.tags = contact.tags.filter(t => t !== tag);
  }
  isEligibleForVip(contact: Contact): boolean { return contact.loginCount > 10; }
}
```

**The problem:** `ContactService` must know and manage every aspect of a Contact.
It grows without bound. There is no natural place for new behaviour to live —
everything goes into `ContactService`.

**The alternative — rich domain model:**

```ts
class Contact {
  constructor(
    public readonly id: number,
    private name: string,
    private readonly email: string,
    private isActive: boolean = true,
    private tags: string[] = [],
  ) {}

  // Behaviour lives on the object it belongs to:
  activate(): void { this.isActive = true; }
  deactivate(): void { this.isActive = false; }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) this.tags.push(tag);
  }

  isEligibleForVip(loginCount: number): boolean {
    return this.isActive && loginCount > 10;
  }
}
```

Now `Contact` knows how to manage itself. `ContactService` orchestrates
workflows that involve multiple objects — not individual field operations.

**You will see this again in:** Topic 4 (Domain Modeling). The rich vs anemic
domain model debate is central to DDD.

**Watch for:** If your service methods look like `setField`, `getField`,
`activate`, `deactivate` with no logic beyond field setting — you have an
anemic domain model. Move behaviour onto the objects it belongs to.

---

### Where Layered Architecture Breaks Down

**Feature slices cut vertically — layered architecture is horizontal:**

```
A layered architecture:

Presentation  │ UI for users │ UI for admins │ UI for API
─────────────────────────────────────────────────────────
Business Logic│   user svc   │   admin svc   │   api svc
─────────────────────────────────────────────────────────
Data          │  user repo   │  admin repo   │  api repo

A feature change (add audit logging):
  → touches ALL THREE layers for EACH of the three feature areas
  → every change is expensive
```

**When a single feature requires simultaneous changes to all three layers,
the team must coordinate all three layers for every story. Testing requires
all three layers to exist.**

This is why larger systems move toward vertical slices (one service per feature
that owns all three layers), microservices, or hexagonal architecture.

**The lesson:** Layered architecture is a good starting point. It provides
clear separation of concerns. It fails when features become the primary unit
of change and layers become a coordination overhead.

---

## 🎯 Challenge: Add a Delete Feature

**You know:** Three-layer architecture, where each concern belongs.

**Task:** Add a `deleteContact(id: number)` function across all three layers:

1. **Data Layer** — `ContactDataAccess.deleteById(id: number): boolean`
   (returns true if found and deleted, false if not found)
2. **Business Logic Layer** — `ContactService.delete(id: number): void`
   (throws a domain error if the contact does not exist)
3. **Presentation Layer** — `handleDeleteContact(id: number)` returns
   `{ status: 200, body: { deleted: true } }` on success,
   `{ status: 404, body: { error: 'Contact not found' } }` if not found

**Requirements:**
- The presentation layer catches domain errors and converts to HTTP status codes
- The business logic layer never knows about HTTP status codes
- The data layer never knows about business rules

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Data Layer addition:
const ContactDataAccess = {
  // ... existing methods ...

  deleteById(id: number): boolean {
    const index = database.findIndex(c => c.id === id);
    if (index === -1) return false;
    database.splice(index, 1);
    return true;
  },
};

// Business Logic Layer addition:
class ContactNotFoundError extends Error {
  constructor(id: number) {
    super(`Contact ${id} not found`);
    this.name = 'ContactNotFoundError';
  }
}

const ContactService = {
  // ... existing methods ...

  delete(id: number): void {
    const deleted = ContactDataAccess.deleteById(id);
    if (!deleted) {
      throw new ContactNotFoundError(id);
    }
    // Could emit an event here: EventBus.emit('ContactDeleted', { id })
  },
};

// Presentation Layer addition:
function handleDeleteContact(id: number): { status: number; body: unknown } {
  try {
    ContactService.delete(id);
    return { status: 200, body: { deleted: true } };
  } catch (error) {
    if (error instanceof ContactNotFoundError) {
      return { status: 404, body: { error: error.message } };
    }
    return { status: 500, body: { error: 'Internal server error' } };
  }
}
```

**Key insight:** Each layer has a different error vocabulary:
- Data layer returns `boolean` (found/not found) — no exceptions
- Business logic throws a domain exception (`ContactNotFoundError`) — no HTTP codes
- Presentation catches domain exceptions and maps them to HTTP status codes

This separation means: changing the HTTP status for "not found" from 404 to 410
requires touching only the presentation layer. Changing the business rule about
when deletion is allowed requires touching only the business logic layer.
Changing the database query requires touching only the data layer.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Presentation doesn't access DB | Try calling `ContactDataAccess` directly in handler | Should be unnecessary — service handles it |
| Business logic doesn't know HTTP | Search for `status:` in business logic layer | Not found |
| Validation before DB write | Try inserting invalid data | Data layer never called |
| Duplicate check works | Insert same email twice | Second insert fails at service layer |
| Error translation | Service throws `ValidationError` | Handler returns 422, not 500 |

---

## Quick Check Answers

**1. Can Presentation call Data directly?**

In strict layered architecture, no. Allowing Presentation to call Data directly
would bypass the Business Logic layer — all validation, domain rules, and
business workflows in that layer could be circumvented. A UI component that
directly queries the database has no guarantee that the data meets business
invariants. In practice, many systems do allow this for read-only operations
(fetching data for display only) as a pragmatic optimisation. But for writes,
the rule is absolute: Presentation must go through Business Logic.

**2. What is an anemic domain model? Is it good?**

An anemic domain model is one where domain objects (entities) are passive data
containers — they have fields but no behaviour. All behaviour is in service
classes. It is NOT generally considered good practice (Martin Fowler called it
an "anti-pattern"). The problem: the service grows without bound because it owns
all behaviour for all domain objects. Objects that represent "things the business
cares about" should also contain the rules that govern those things. A `Contact`
that knows how to validate itself, add a tag, or check VIP eligibility is more
maintainable than a `ContactService` that knows everything about contacts.

**3. Does needing to change all three layers for a feature mean the architecture is wrong?**

Not necessarily — it is expected for features that genuinely span all concerns.
Adding a "contact status" field naturally touches the presentation (show the status),
business logic (enforce status transitions), and data (store the status). This
is called a "vertical slice." It becomes a problem when MOST features require
all-layer changes AND the layers are independently owned by different teams
(creating a coordination bottleneck). If you find yourself doing all-layer
changes for trivial features, that suggests the layers are too granular or
incorrectly drawn.
