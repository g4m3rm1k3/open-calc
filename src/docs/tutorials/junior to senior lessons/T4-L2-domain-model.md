# Junior to Senior — T4·L2 — What a Domain Model Is

**Prerequisites:** T4·L1 (Data Structures). You know the basic data structures.
This lesson defines what a domain model is, why it exists separately from infrastructure,
and what happens when it does not.

**What this lab adds:**
- Domain: the problem the software solves — its rules and vocabulary
- Domain model: the code representation of those rules
- Why the domain must not import databases, HTTP, or UI frameworks
- Rich vs anemic domain model — with concrete code examples of each
- Ubiquitous language: code that speaks the domain's words

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You add `import mongoose from 'mongoose'` to the geometry domain class.
>    What did you just do to the domain?
> 2. The business rule is: "A booking cannot overlap with an existing booking."
>    In an anemic model, where does this rule live? In a rich model?
> 3. Your domain object is called `TblContacts`. What is wrong with that name?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A room scheduling domain with a `TimeRange` value object and a `Room` entity that
enforces its own business rules — all in pure TypeScript with no external dependencies:

```ts
const room = new Room('r-1', 'Conference A', 10);
room.book(TimeRange.fromHours(9, 11));    // OK
room.book(TimeRange.fromHours(10, 12));   // throws — overlaps existing booking

console.log(room.isAvailableDuring(TimeRange.fromHours(13, 15)));  // true
```

---

### Concept: The Problem Without a Domain Model

**What it is:** Without a deliberate domain model, business logic scatters across
route handlers, utility functions, and database callbacks. No single place owns the rules.

**The problem before (logic in route handlers):**

```ts
// Everything mixed together in one place:
async function createContact(req: Request, res: Response): Promise<void> {
  const { name, email } = req.body;

  // Validation (business logic):
  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: 'Name required' });
    return;
  }
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  // Duplicate check (business logic):
  const existing = await db.collection('contacts').findOne({ email });
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  // Storage (infrastructure):
  await db.collection('contacts').insertOne({ name: name.trim(), email });
  res.status(201).json({ name, email });
}
```

Problems:
- Business rule ("no duplicate emails") is in an HTTP handler — mixed with HTTP concerns
- To test the duplicate rule, you need a running server and database
- The rule may be duplicated in other handlers that also create contacts
- Changing from MongoDB to PostgreSQL requires editing this file

**The solution — a domain model:**

```ts
// Domain (no HTTP, no database, no framework):
class Contact {
  private constructor(readonly name: string, readonly email: string) {}

  static create(name: string, email: string): Contact {
    if (!name.trim()) throw new DomainError('Name is required');
    if (!email.includes('@')) throw new DomainError('Invalid email');
    return new Contact(name.trim(), email);
  }
}

// Repository (database interface, defined by the domain):
interface ContactRepository {
  findByEmail(email: string): Contact | undefined;
  save(contact: Contact): void;
}

// Application service (connects domain to infrastructure):
async function createContactUseCase(
  name: string, email: string, repo: ContactRepository,
): Promise<Contact> {
  if (repo.findByEmail(email)) throw new DomainError('Email already in use');
  const contact = Contact.create(name, email);
  repo.save(contact);
  return contact;
}
```

**What it hides:** Infrastructure complexity. The domain model only knows about its own
rules — not about MongoDB, HTTP, or React. Infrastructure adapts to the domain, not
the other way around.

**Canonical example:** A chess rulebook vs a chess-playing robot. The rulebook
(domain model) defines the rules of chess — which pieces can move where, what constitutes
check. The robot (infrastructure) handles the physical board, the display, and the network.
The rulebook doesn't know about screens or WiFi. The robot doesn't define the rules.

**Project Application:** The contacts domain defines validation and uniqueness rules.
The FastAPI routes (T5-L1) and the SQLAlchemy repository (T5-L3) are infrastructure.
Changing from SQLAlchemy to a different ORM requires changing infrastructure only —
the domain rules are unchanged.

**You will see this again in:**
- "Clean Architecture" (Robert C. Martin) — this is the central principle
- DDD (Domain-Driven Design) — the field that formalised this approach
- Every well-structured production codebase separates domain from infrastructure

**Watch for:** The domain importing from infrastructure is the most common violation.
`import mongoose from 'mongoose'` inside a domain class couples domain logic to a
specific database library. If you see infrastructure imports in domain code, the
boundary has been crossed.

---

### Concept: Rich vs Anemic Domain Model

**What it is:**
- **Anemic model:** Objects are data containers. All logic lives in external service scripts.
- **Rich model:** Objects contain both the data AND the rules that govern that data.

**The anemic model (anti-pattern):**

```ts
// Anemic — Room is just data:
interface Room {
  id:       string;
  name:     string;
  capacity: number;
}

// All rules live in a separate service:
class BookingService {
  bookRoom(room: Room, startMs: number, endMs: number, bookings: Booking[]): Booking {
    // Rule buried in the service:
    const conflict = bookings.find(b =>
      b.roomId === room.id && b.startMs < endMs && startMs < b.endMs
    );
    if (conflict) throw new Error('Room not available');
    return { id: generateId(), roomId: room.id, startMs, endMs };
  }
}
```

Problems: the overlap rule can exist in multiple services; nothing stops code from
bypassing `BookingService` and creating conflicting bookings directly.

**The rich model:**

```ts
// Rich — Room knows about bookings:
class Room {
  private readonly bookings: TimeRange[] = [];

  constructor(readonly id: string, readonly name: string, readonly capacity: number) {}

  book(range: TimeRange): void {
    const conflict = this.bookings.find(b => b.overlaps(range));
    if (conflict) throw new Error(`Room "${this.name}" is not available`);
    this.bookings.push(range);
  }

  isAvailableDuring(range: TimeRange): boolean {
    return !this.bookings.some(b => b.overlaps(range));
  }
}
```

The overlap rule lives where the data lives. Any code that wants to book a room MUST
call `room.book()` — the rule cannot be bypassed.

**What it hides:** The enforcement point. With a rich model, the invariant "no overlapping
bookings" is enforced by the object itself — not by whatever service happens to be called.

**Canonical example:** A bank account. An anemic model has `balance: number` with a
separate `TransactionService.withdraw(account, amount)` that enforces the
"balance cannot go negative" rule. A rich model has `account.withdraw(amount)` that
enforces it internally. Any code path that wants to withdraw must call `account.withdraw()`.

**Project Application:** `Room.book()` enforces the no-overlap rule. No bypass is possible.
`SchedulingService` (from T4-L5) uses `Room` objects — it does not re-implement overlap checking.

**You will see this again in:**
- DDD: "Aggregates" contain their own consistency rules
- Active Record pattern: `user.activate()` vs `UserService.activate(user)`
- Every framework that promotes rich domain models (Axon, Spring DDD, etc.)

**Watch for:** Anemic models are tempting in small projects — they start simpler. They
become unmaintainable as rules multiply, because every rule is in a different service
and nothing prevents bypassing the service.

---

### Concept: Ubiquitous Language

**What it is:** The domain model code uses the exact words the domain experts use.
When a machinist says "contour toolpath," the code has `ContourToolpath`. No translation.

**The problem before — developer language in domain code:**

```ts
// Developer language — domain expert cannot read this:
class TblGeomItem {
  calcPathSegs(feedRate: number): LineSegment[] { ... }
}
```

"TblGeomItem" — a database table artefact. "calcPathSegs" — an abbreviation a
machinist would not recognise. Every conversation requires translation:
"You mean the path segment calculator in the geometry item table?"

**The solution:**

```ts
// Ubiquitous language — machinist can verify this:
class Profile {
  generateToolpath(tool: EndMill, params: ToolpathParameters): Toolpath { ... }
}
```

**What it hides:** Technical implementation. The code reads like a requirements document.
A machinist reviewing requirements can point to `Profile.generateToolpath()` and confirm
"yes, that is what we mean."

**The rule:** When a domain expert uses a word consistently, that word belongs in the code.
When the code uses a word the domain expert does not recognise, that word is probably an
implementation detail leaking into the domain layer.

**You will see this again in:**
- Every DDD book emphasises ubiquitous language as foundational
- API design: endpoints named after business concepts, not database tables
- Code review: "is this term from the business domain, or did we invent it?"

---

## Step 1 — Build the Room Scheduling Domain

Create a new project for this topic:

```bash
mkdir scheduling-domain
cd scheduling-domain
npm init -y
npm install -D vitest typescript
```

Create `src/time-range.ts`:

```ts
export class TimeRange {
  constructor(
    readonly startMs: number,
    readonly endMs:   number,
  ) {
    if (endMs <= startMs) {
      throw new Error(`TimeRange end must be after start`);
    }
  }

  overlaps(other: TimeRange): boolean {
    return this.startMs < other.endMs && other.startMs < this.endMs;
  }

  get durationMs(): number {
    return this.endMs - this.startMs;
  }

  extendBy(ms: number): TimeRange {
    return new TimeRange(this.startMs, this.endMs + ms);
  }

  static fromHours(startHour: number, endHour: number): TimeRange {
    const msPerHour = 60 * 60 * 1000;
    return new TimeRange(startHour * msPerHour, endHour * msPerHour);
  }
}
```

### SAVE AND TRY

```bash
npx tsx src/time-range.ts 2>/dev/null || echo "file created"
```

Or check with TypeScript:

```bash
npx tsc --noEmit src/time-range.ts --allowImportingTsExtensions 2>&1 || echo "no type errors"
```

Expected: no errors.

Create `src/room.ts`:

```ts
import { TimeRange } from './time-range';

export class Room {
  private readonly bookings: TimeRange[] = [];

  constructor(
    readonly id:       string,
    readonly name:     string,
    readonly capacity: number,
  ) {}

  book(range: TimeRange): void {
    const conflict = this.bookings.find(b => b.overlaps(range));
    if (conflict) {
      throw new Error(`Room "${this.name}" is already booked during the requested time`);
    }
    this.bookings.push(range);
  }

  isAvailableDuring(range: TimeRange): boolean {
    return !this.bookings.some(b => b.overlaps(range));
  }

  getBookings(): TimeRange[] {
    return [...this.bookings];
  }
}
```

Create `src/domain.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TimeRange }             from './time-range';
import { Room }                  from './room';

describe('TimeRange', () => {

  it('creates a valid range when end is after start', () => {
    const range = TimeRange.fromHours(9, 11);
    expect(range.durationMs).toBe(2 * 60 * 60 * 1000);
  });

  it('throws when end is not after start', () => {
    expect(() => TimeRange.fromHours(11, 9)).toThrow();
  });

  it('detects overlapping ranges', () => {
    const morning = TimeRange.fromHours(9, 11);
    const overlap = TimeRange.fromHours(10, 12);
    expect(morning.overlaps(overlap)).toBe(true);
  });

  it('reports non-overlapping ranges as not overlapping', () => {
    const morning   = TimeRange.fromHours(9, 11);
    const afternoon = TimeRange.fromHours(13, 15);
    expect(morning.overlaps(afternoon)).toBe(false);
  });

  it('adjacent ranges do not overlap', () => {
    const morning = TimeRange.fromHours(9, 11);
    const after   = TimeRange.fromHours(11, 13);
    expect(morning.overlaps(after)).toBe(false);
  });

});

describe('Room', () => {

  it('allows booking an available time slot', () => {
    const room = new Room('r1', 'Conference A', 10);
    expect(() => room.book(TimeRange.fromHours(9, 11))).not.toThrow();
  });

  it('throws when booking a time slot that overlaps an existing booking', () => {
    const room = new Room('r1', 'Conference A', 10);
    room.book(TimeRange.fromHours(9, 11));
    expect(() => room.book(TimeRange.fromHours(10, 12))).toThrow();
  });

  it('reports available when no bookings exist', () => {
    const room = new Room('r1', 'Conference A', 10);
    expect(room.isAvailableDuring(TimeRange.fromHours(9, 11))).toBe(true);
  });

  it('reports unavailable when an overlapping booking exists', () => {
    const room = new Room('r1', 'Conference A', 10);
    room.book(TimeRange.fromHours(9, 11));
    expect(room.isAvailableDuring(TimeRange.fromHours(10, 12))).toBe(false);
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ TimeRange > creates a valid range when end is after start
✓ TimeRange > throws when end is not after start
✓ TimeRange > detects overlapping ranges
✓ TimeRange > reports non-overlapping ranges as not overlapping
✓ TimeRange > adjacent ranges do not overlap
✓ Room > allows booking an available time slot
✓ Room > throws when booking an overlapping time slot
✓ Room > reports available when no bookings exist
✓ Room > reports unavailable when an overlapping booking exists

Tests  9 passed (9)
```

**Notice:** Zero database, zero HTTP, zero framework. These are pure domain tests —
they run in under 5ms and can run anywhere.

**Change something:** Add an infrastructure import to `room.ts` temporarily:

```ts
import mongoose from 'mongoose';  // ← infrastructure in the domain
```

This won't compile (mongoose not installed), but the error message makes the point:
the domain has no business importing infrastructure. Delete this line.

---

## 🎯 Challenge: Identify Domain vs Infrastructure

**You know:** Domain model definition, the separation rule, rich vs anemic.

**Task:** For each of the following, identify whether it belongs in the domain or
infrastructure layer. Justify each answer in one sentence.

1. `Room.isAvailableDuring(range: TimeRange): boolean`
2. `await db.collection('rooms').findOne({ id })`
3. `timeRange.overlaps(other: TimeRange): boolean`
4. `res.status(409).json({ error: 'Room not available' })`
5. `await emailClient.sendBookingConfirmation(attendee.email, booking)`
6. `booking.calculateRefundAmount(cancellationPolicy: CancellationPolicy): Money`
7. `const booking = JSON.parse(req.body)`
8. `new TimeRange(startMs, endMs)` — throws if `endMs <= startMs`

---

<details>
<summary>▶ Show Solution</summary>

1. **Domain** — business rule query. No I/O. Operates on pure domain objects.

2. **Infrastructure** — MongoDB query. The domain defines an interface; infrastructure implements it.

3. **Domain** — overlap detection is a business rule. Pure function on value objects.

4. **Infrastructure** — HTTP status codes are the HTTP adapter's concern. The domain
   throws a `RoomNotAvailableError`; the HTTP adapter converts it to a 409 response.

5. **Infrastructure** — email is a side effect handled by an email adapter. The domain
   emits a `BookingConfirmed` event; infrastructure listens and sends the email.

6. **Domain** — refund calculation is a business rule. `Money` is a value object;
   `CancellationPolicy` is a domain concept.

7. **Infrastructure** — parsing the HTTP request body is the HTTP adapter's job.
   The domain receives a typed object, not raw JSON.

8. **Domain** — enforcing the invariant "end must be after start" is a business rule
   on the `TimeRange` value object. This belongs in the constructor.

**The test for each:** "Can I write a passing unit test for this without any database,
HTTP server, file system, or network?" If yes: domain. If no: infrastructure.

</details>

---

## Final Check

| Belongs in the domain | Does NOT belong in the domain |
|---|---|
| Business rules and invariants | Database queries |
| Value object construction | HTTP request/response handling |
| Entity state transitions | File system access |
| Domain service logic | External API calls |
| Domain event definitions | Framework configuration |

---

## Quick Check Answers

**1. `import mongoose from 'mongoose'` in the domain. What did you do?**

Coupled the domain to a specific database technology. Now changing from MongoDB to
PostgreSQL requires modifying domain code — code that should only change when business
rules change. The domain defines interfaces (repository ports) and lets infrastructure
implement them.

**2. "No booking overlap" rule — anemic vs rich model home?**

In an anemic model: the rule lives in a service script. It can be bypassed by calling
the repository directly. In a rich model: the rule lives in `Room.book()`. Any code
path that creates a booking must go through this method, and the rule is enforced automatically.

**3. Domain object named `TblContacts` — what is wrong?**

`Tbl` is a database implementation detail. The domain does not have tables — tables are
a relational database concept. The correct domain name is `Contact`. Naming domain objects
after database artefacts signals that the domain/infrastructure separation does not exist.
