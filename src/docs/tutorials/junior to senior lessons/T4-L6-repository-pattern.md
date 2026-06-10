# Junior to Senior — T4·L6 — Repository Pattern in the Domain

**Prerequisites:** T4·L5 (Domain Services). You can write domain services. This lesson
shows how the domain interacts with persistence — through a repository interface it defines,
implemented by infrastructure.

**What this lab adds:**
- The repository interface: defined BY the domain, not the database
- Why the domain never calls `db.query()` or `session.commit()`
- In tests: a fake repository provides domain object isolation
- In production: a SQLAlchemy or MongoDB implementation satisfies the same interface
- Contract tests ensure fake and real stay aligned

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The domain needs to save a calendar. Where does it call
>    `db.collection('calendars').insertOne(...)`?
> 2. You switch databases from SQLite to PostgreSQL. Which layer must change?
>    Which must NOT change?
> 3. `calendarRepository.getById(id)` — what does it return if no calendar exists?
>    Should it return `null`, `undefined`, or throw?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `CalendarRepository` interface in the domain layer, with a fake and a contract test
that runs against both implementations:

```ts
// Domain defines the interface — no database knowledge:
interface CalendarRepository {
  getById(id: string): Calendar | null;
  add(calendar: Calendar): void;
  update(calendar: Calendar): void;
  list(): Calendar[];
}

// Infrastructure implements it — knows about the database:
class SQLiteCalendarRepository implements CalendarRepository {
  async getById(id: string): Calendar | null {
    const row = await db.prepare('SELECT * FROM calendars WHERE id = ?').get(id);
    return row ? deserialise(row) : null;
  }
  // ...
}
```

---

### Concept: The Repository Interface

**What it is:** The repository is an interface the domain defines to express what
persistence operations it needs. It feels like a collection — `get`, `add`, `list` —
not like a database query language.

**The problem before (domain calling database directly):**

```ts
// Domain directly imports and calls the ORM — domain is now coupled to SQLAlchemy:
import mongoose from 'mongoose';

class CalendarService {
  async getCalendar(id: string): Promise<Calendar | null> {
    const doc = await mongoose.model('Calendar').findById(id);  // ← ORM in domain
    if (!doc) return null;
    return Calendar.fromDocument(doc);
  }
}
```

Changing from MongoDB to PostgreSQL requires editing the domain class. Testing requires
a real database.

**The solution — dependency inversion:**

```ts
// Domain defines the interface (what it needs):
interface CalendarRepository {
  getById(id: string): Calendar | null;
  add(calendar: Calendar): void;
}

// Infrastructure implements it (how to do it):
class MongoCalendarRepository implements CalendarRepository {
  getById(id: string): Calendar | null { /* MongoDB */ }
  add(calendar: Calendar): void        { /* MongoDB */ }
}

// Domain uses the interface — never the implementation:
class CalendarService {
  constructor(private readonly repo: CalendarRepository) {}  // interface, not concrete class

  getCalendar(id: string): Calendar | null {
    return this.repo.getById(id);   // no ORM, no database knowledge
  }
}
```

**What it hides:** The entire infrastructure stack. The domain calls `repo.getById(id)`
and gets a `Calendar` back. Whether the data came from MongoDB, PostgreSQL, SQLite, or
an in-memory dictionary — the domain does not know and does not care.

**The invariant the repository protects:** The domain always works with domain objects —
never with raw database rows. The repository translates between the two.

**Canonical example:** A library catalogue. The catalogue tells you "book X is on shelf 3B."
You don't know if the catalogue is a paper card system, a database, or a spreadsheet.
You just ask the catalogue and receive the answer.

**Project Application:** `CalendarRepository` is the interface. `FakeCalendarRepository`
is used in tests. `SQLAlchemyCalendarRepository` (T5-L3) is used in production.
Switching between them requires only changing which implementation is injected.

**You will see this again in:**
- `AbstractTaskRepository` from T5-L0f — the Python version of this pattern
- Every well-structured backend framework uses this pattern
- The "ports and adapters" / hexagonal architecture (T2-L3) is based on this

**Watch for:** Repository methods returning `null` vs `undefined`. Convention:
repositories return `null` for "not found" (explicitly absent) vs `undefined`
(never looked). Be consistent within a codebase.

---

## Step 1 — Define the Repository Interface

Add `src/calendar-repository.ts` (in the domain — no database imports):

```ts
import { Calendar } from './calendar';

export interface CalendarRepository {
  getById(id: string): Calendar | null;
  add(calendar: Calendar): void;
  update(calendar: Calendar): void;
  list(): Calendar[];
}
```

Add `src/fake-calendar-repository.ts`:

```ts
import type { CalendarRepository } from './calendar-repository';
import { Calendar }                 from './calendar';

export class FakeCalendarRepository implements CalendarRepository {
  private readonly store = new Map<string, Calendar>();

  getById(id: string): Calendar | null {
    return this.store.get(id) ?? null;
  }

  add(calendar: Calendar): void {
    if (this.store.has(calendar.id)) {
      throw new Error(`Calendar "${calendar.id}" already exists`);
    }
    this.store.set(calendar.id, calendar);
  }

  update(calendar: Calendar): void {
    if (!this.store.has(calendar.id)) {
      throw new Error(`Calendar "${calendar.id}" not found`);
    }
    this.store.set(calendar.id, calendar);
  }

  list(): Calendar[] {
    return [...this.store.values()];
  }
}
```

---

## Step 2 — Write Contract Tests

Create `src/calendar-repository.contract.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { CalendarRepository } from './calendar-repository';
import { FakeCalendarRepository }   from './fake-calendar-repository';
import { Calendar }                 from './calendar';
import { TimeRange }                from './time-range';
import { Email }                    from './email';

function runCalendarRepositoryContract(
  label:          string,
  makeRepository: () => CalendarRepository,
): void {
  describe(label, () => {

    it('saves a calendar and retrieves it by id', () => {
      // Arrange
      const repo     = makeRepository();
      const calendar = new Calendar('cal-42');

      // Act
      repo.add(calendar);
      const found = repo.getById('cal-42');

      // Assert
      expect(found).not.toBeNull();
      expect(found!.id).toBe('cal-42');
    });

    it('returns null for an id that was never saved', () => {
      const repo  = makeRepository();
      const found = repo.getById('nonexistent');
      expect(found).toBeNull();
    });

    it('update preserves calendar changes', () => {
      // Arrange
      const repo     = makeRepository();
      const calendar = new Calendar('cal-1');
      repo.add(calendar);

      // Act — add an event (modifies the calendar):
      const organiser = new Email('org@e.com');
      calendar.addEvent('Meeting', TimeRange.fromHours(9, 11), organiser);
      repo.update(calendar);

      // Assert — retrieved calendar has the event:
      const found = repo.getById('cal-1');
      expect(found!.eventCount).toBe(1);
    });

    it('lists all saved calendars', () => {
      // Arrange
      const repo = makeRepository();
      repo.add(new Calendar('cal-1'));
      repo.add(new Calendar('cal-2'));

      // Act
      const all = repo.list();

      // Assert
      expect(all).toHaveLength(2);
    });

  });
}


// Run contract against both implementations:
runCalendarRepositoryContract(
  'CalendarRepository contract (FakeCalendarRepository)',
  () => new FakeCalendarRepository(),
);

// When you add a real implementation, add it here:
// runCalendarRepositoryContract(
//   'CalendarRepository contract (SQLiteCalendarRepository)',
//   () => new SQLiteCalendarRepository(testDb),
// );
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ CalendarRepository contract (FakeCalendarRepository) > saves a calendar and retrieves it by id
✓ CalendarRepository contract (FakeCalendarRepository) > returns null for an id that was never saved
✓ CalendarRepository contract (FakeCalendarRepository) > update preserves calendar changes
✓ CalendarRepository contract (FakeCalendarRepository) > lists all saved calendars

Tests  4 passed (4)
```

**Change something:** Introduce a drift bug in `FakeCalendarRepository.getById`:

```ts
getById(_id: string): Calendar | null {
  return this.store.values().next().value ?? null;  // BUG: always returns first
}
```

Run tests. Expected: `'returns null for an id that was never saved'` fails — the fake
returns the first calendar instead of null. This is the contract test catching drift.
Restore the correct implementation.

---

## Step 3 — Use the Repository in Service Tests

Create `src/calendar-service.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FakeCalendarRepository }             from './fake-calendar-repository';
import { SchedulingService }                  from './scheduling-service';
import { Calendar }                           from './calendar';
import { TimeRange }                          from './time-range';
import { Duration }                           from './duration';
import { Email }                              from './email';

const organiser = new Email('alice@example.com');

describe('Service using FakeCalendarRepository', () => {
  let repo:    FakeCalendarRepository;
  let service: SchedulingService;

  beforeEach(() => {
    repo    = new FakeCalendarRepository();
    service = new SchedulingService();
  });

  it('creates a calendar, saves it, and finds an available slot', () => {
    // Arrange — set up a calendar with one existing event:
    const calendar = new Calendar('cal-1');
    calendar.addEvent('Morning Meeting', TimeRange.fromHours(9, 11), organiser);
    repo.add(calendar);

    // Act — load from repo and find a slot:
    const loaded = repo.getById('cal-1');
    const slot   = service.findNextAvailableSlot(loaded!, Duration.ofHours(1), 9 * 3_600_000);

    // Assert — slot starts after the morning meeting:
    expect(slot).not.toBeNull();
    expect(slot!.startMs).toBe(11 * 3_600_000);
  });

  it('persists calendar changes to the repository', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    repo.add(calendar);

    // Act — load, modify, save back:
    const loaded = repo.getById('cal-1')!;
    loaded.addEvent('New Meeting', TimeRange.fromHours(9, 11), organiser);
    repo.update(loaded);

    // Assert — reload and verify the event was persisted:
    const reloaded = repo.getById('cal-1');
    expect(reloaded!.eventCount).toBe(1);
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** All tests pass.

---

## 🎯 Challenge: Add a `RoomRepository`

**You know:** Repository interface, contract tests, fake implementation.

**Task:** Define `RoomRepository` and `FakeRoomRepository` for the `Room` entity.

Interface: `getById(id: RoomId): Room | null`, `add(room: Room): void`, `list(): Room[]`

Write 3 contract tests before implementing the fake.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// room-repository.ts (domain interface):
import { Room }   from './room';
import { RoomId } from './room-id';

export interface RoomRepository {
  getById(id: RoomId): Room | null;
  add(room: Room): void;
  list(): Room[];
}

// fake-room-repository.ts:
import type { RoomRepository } from './room-repository';
import { Room }                 from './room';
import { RoomId }               from './room-id';

export class FakeRoomRepository implements RoomRepository {
  private readonly store = new Map<string, Room>();

  getById(id: RoomId): Room | null {
    return this.store.get(id.value) ?? null;
  }

  add(room: Room): void {
    this.store.set(room.id.value, room);
  }

  list(): Room[] {
    return [...this.store.values()];
  }
}
```

**Contract tests:**
```ts
it('saves a room and retrieves it by id', () => {
  const repo = new FakeRoomRepository();
  const room = new Room(new RoomId('r-1'), 'Conference A', 10);
  repo.add(room);
  const found = repo.getById(new RoomId('r-1'));
  expect(found).not.toBeNull();
  expect(found!.name).toBe('Conference A');
});

it('returns null for an unknown id', () => {
  const repo = new FakeRoomRepository();
  expect(repo.getById(new RoomId('nonexistent'))).toBeNull();
});

it('lists all saved rooms', () => {
  const repo = new FakeRoomRepository();
  repo.add(new Room(new RoomId('r-1'), 'A', 10));
  repo.add(new Room(new RoomId('r-2'), 'B', 20));
  expect(repo.list()).toHaveLength(2);
});
```

</details>

---

## Final Check

| Concept | Verify |
|---|---|
| Interface in domain, no DB imports | Open `calendar-repository.ts` — no `import` from DB |
| Dependency direction | Infrastructure imports domain; domain never imports infrastructure |
| Contract tests catch fake drift | Introduce bug in fake → contract test fails |
| Returns null, not undefined | `getById` returns `null` for not-found |
| Fake used in service tests | Service tests pass with no database |

---

## Quick Check Answers

**1. The domain needs to save a calendar. Where does it call `insertOne(...)`?**

It does not. The domain calls `calendarRepository.add(calendar)` — a method on the
repository interface it defines. The infrastructure implementation of `CalendarRepository`
contains the `insertOne` call. The domain never imports or knows about `db`.

**2. SQLite → PostgreSQL. Which layer changes? Which doesn't?**

Must change: the infrastructure layer — specifically the SQLite repository implementation,
replaced by a PostgreSQL implementation satisfying the same `CalendarRepository` interface.

Must NOT change: the domain layer, domain services, application service layer, or any
test that uses fakes. These all depend on the `CalendarRepository` interface, not
the implementation.

**3. `calendarRepository.getById(id)` — what to return for not found?**

`null`. The convention: `null` means "was looked for, not found" (explicitly absent).
`undefined` means "was never looked for" or "missing property." Repositories should
return `null` for not-found so the caller can distinguish "the calendar does not exist"
from "I forgot to pass an id." Be consistent within a codebase.
