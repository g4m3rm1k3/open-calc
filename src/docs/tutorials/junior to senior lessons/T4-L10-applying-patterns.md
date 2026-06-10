# Junior to Senior — T4·L10 — Applying Patterns to the Domain

**Prerequisites:** T4·L9 (Scheduling Domain: TDD). You have a working domain model.
This lesson adds three design patterns — Factory Method, Strategy, and Observer via
domain events — applied directly to the scheduling domain.

**What this lab adds:**
- Factory Method: `Event.create()` validates invariants before construction
- Strategy: multiple recurrence rules implementing a common interface
- Domain events: `Calendar.addEvent` emits `EventAdded` — not `emailService.send()`
- The Open/Closed Principle: adding a recurrence strategy without modifying existing code
- Constructor vs factory: when each is correct

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A constructor cannot return `null` or a `Result` type. What is the alternative
>    for "try to create this object, but it might not be valid"?
> 2. You have three recurrence types: Daily, Weekly, MonthlyByWeekday. New types will
>    be added. Which pattern avoids changing existing code when adding a new type?
> 3. `Calendar.addEvent` currently calls `console.log`. Later it needs to update a
>    search index and send an email. What pattern avoids modifying `Calendar` each time?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Three patterns added to the scheduling domain:

```ts
// Factory Method:
const result = Event.create('Team Meeting', range, organiser);
if (!result.ok) console.log(result.errors);   // validation errors, not exceptions

// Strategy:
const daily  = new DailyRecurrence();
const weekly = new WeeklyRecurrence(1);  // Mondays
daily.getOccurrences(startDate, 3);      // → [Mon, Tue, Wed]
weekly.getOccurrences(startDate, 3);     // → [Mon-week1, Mon-week2, Mon-week3]

// Domain events:
const calendar = new Calendar('cal-1');
calendar.addEvent('Meeting', range, organiser);
const events = calendar.popDomainEvents();
// → [{ type: 'EventAdded', event: ... }]
```

---

### Concept: Factory Method — Creating Objects That Might Fail

**What it is:** A static factory method is a named constructor. It validates all
invariants before creating the object and returns either the object or a description
of what went wrong — something a constructor cannot do gracefully.

**The problem before (constructor throws):**

```ts
class Event {
  constructor(title: string, range: TimeRange, organiser: Email) {
    if (!title.trim()) throw new Error('Title required');  // throws — caller must try/catch
    this.title = title;
    // ...
  }
}

// Caller must wrap every construction in try/catch:
try {
  const event = new Event('', range, organiser);
} catch (e) {
  // handle error — what kind? Could be anything
}
```

**The solution — a factory method returning `Result<T>`:**

```ts
class Event {
  private constructor(  // private — callers cannot use `new Event(...)` directly
    readonly id:        string,
    readonly title:     string,
    readonly range:     TimeRange,
    readonly organiser: Email,
  ) {}

  static create(
    title:     string,
    range:     TimeRange,
    organiser: Email,
  ): { ok: true; event: Event } | { ok: false; errors: string[] } {
    const errors: string[] = [];

    if (!title.trim()) errors.push('Title is required');
    if (title.trim().length > 100) errors.push('Title must be 100 characters or fewer');

    if (errors.length > 0) return { ok: false, errors };

    const event = new Event(generateId(), title.trim(), range, organiser);
    return { ok: true, event };
  }
}

// Caller gets a typed result — no try/catch:
const result = Event.create('', range, organiser);
if (!result.ok) {
  console.log(result.errors);  // ['Title is required']
}
```

**What it hides:** ID generation (internal) and multi-error validation (collected before
constructing). The caller sees a clean interface: pass the data, get either the event or
the errors.

**Canonical example:** A passport application form. A regular constructor would be:
"fill in the form and if anything is wrong, expect an explosion." A factory method is:
"fill in the form, and if it has errors, receive a list of what to fix."

**Project Application:** `Event.create()` validates the title before constructing.
`Calendar.addEvent` uses it internally — the caller to `Calendar.addEvent` only sees
calendar-level errors (conflicts), not event construction errors.

**You will see this again in:**
- Rust's `Result<T, E>` type — the language-level equivalent
- `Result[T]` from T5-L0k — Python equivalent
- Pydantic's `model_validate()` — returns validation errors without raising
- Standard pattern in functional programming: parsers, validators, form submission

**Watch for:** Don't use factory methods for EVERYTHING. If a constructor can always
succeed (no invariants to validate), use a regular constructor. Factory methods are
for fallible construction.

---

## Step 1 — Add Factory Method to `Event`

Update `src/event.ts`:

```ts
import { TimeRange } from './time-range';
import { Email }     from './email';

let _eventIdCounter = 1;
function generateEventId(): string {
  return `event-${_eventIdCounter++}`;
}

export type EventStatus = 'active' | 'cancelled';

export type EventCreateResult =
  | { ok: true;  event: Event }
  | { ok: false; errors: string[] };

export class Event {
  private _status: EventStatus = 'active';

  private constructor(   // ← private: callers must use Event.create()
    readonly id:        string,
    readonly title:     string,
    readonly range:     TimeRange,
    readonly organiser: Email,
  ) {}

  static create(
    title:      string,
    range:      TimeRange,
    organiser:  Email,
  ): EventCreateResult {
    const errors: string[] = [];

    if (!title.trim())             errors.push('Title is required');
    if (title.trim().length > 100) errors.push('Title must be 100 characters or fewer');

    if (errors.length > 0) return { ok: false, errors };

    const event = new Event(generateEventId(), title.trim(), range, organiser);
    return { ok: true, event };
  }

  get status(): EventStatus  { return this._status; }
  get isActive(): boolean    { return this._status === 'active'; }

  cancel(): void {
    if (this._status === 'cancelled') throw new Error(`"${this.title}" is already cancelled`);
    this._status = 'cancelled';
  }
}
```

Update `src/calendar.ts` to use `Event.create()`:

```ts
addEvent(title: string, range: TimeRange, organiser: Email): Event {
  const conflict = this._events.filter(e => e.isActive).find(e => e.range.overlaps(range));
  if (conflict) throw new Error(`Cannot schedule "${title}": overlaps with "${conflict.title}"`);

  const result = Event.create(title, range, organiser);
  if (!result.ok) throw new Error(result.errors.join('; '));

  this._events.push(result.event);
  return result.event;
}
```

---

## Step 2 — Add the Strategy Pattern for Recurrence

### Concept: Strategy — Swappable Algorithms

**What it is:** Strategy defines a family of algorithms, encapsulates each one,
and makes them interchangeable. The caller selects the algorithm at runtime.

**The problem before:**

```ts
// Without Strategy — one big switch statement:
function getOccurrences(type: 'daily' | 'weekly', start: Date, count: number): Date[] {
  switch (type) {
    case 'daily':  return getDailyOccurrences(start, count);
    case 'weekly': return getWeeklyOccurrences(start, count);
    // Adding 'monthly' requires modifying this switch — Open/Closed violation
  }
}
```

**The solution:**

```ts
interface RecurrenceRule {
  getOccurrences(startDate: Date, count: number): Date[];
  describe(): string;
}

class DailyRecurrence implements RecurrenceRule {
  getOccurrences(startDate: Date, count: number): Date[] { ... }
  describe(): string { return 'Daily'; }
}

class WeeklyRecurrence implements RecurrenceRule {
  constructor(private readonly dayOfWeek: number) {}
  getOccurrences(startDate: Date, count: number): Date[] { ... }
  describe(): string { return `Weekly on day ${this.dayOfWeek}`; }
}

// Adding YearlyRecurrence requires ZERO changes to Daily or Weekly:
class YearlyRecurrence implements RecurrenceRule { ... }
```

**What it hides:** The algorithm selection. Callers work with `RecurrenceRule` — they
do not know or care which specific algorithm is running.

**Pattern category:** Behavioral  
**Official name:** Strategy (Gang of Four)  
**Tradeoff:** More classes, but each class is simple and open for extension.

**Canonical example:** A sorting algorithm selector. `Collections.sort(list, comparator)` —
the `comparator` IS the strategy. You swap comparators without changing the sort logic.

**Open/Closed Principle:** Open for extension (add new strategy), closed for modification
(don't change existing strategies).

**You will see this again in:**
- `Array.sort((a, b) => ...)` — the comparison function is a strategy
- CSS: `display: flex` vs `grid` vs `block` — layout strategies
- `@classmethod` with `from_x()` factory methods often implement strategy-like patterns

**Watch for:** The strategy receives all the context it needs via constructor or method
parameters. It should not reach back into the caller's state.

---

Create `src/recurrence-rule.ts`:

```ts
export interface RecurrenceRule {
  getOccurrences(startDate: Date, count: number): Date[];
  describe(): string;
}

export class DailyRecurrence implements RecurrenceRule {
  getOccurrences(startDate: Date, count: number): Date[] {
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(startDate);
      d.setUTCDate(d.getUTCDate() + i);
      return d;
    });
  }

  describe(): string { return 'Daily'; }
}

export class WeeklyRecurrence implements RecurrenceRule {
  constructor(private readonly dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) {}

  getOccurrences(startDate: Date, count: number): Date[] {
    const dates: Date[] = [];
    const cursor = new Date(startDate);

    // Advance to the target day:
    while (cursor.getUTCDay() !== this.dayOfWeek) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    for (let i = 0; i < count; i++) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }

    return dates;
  }

  describe(): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `Weekly on ${days[this.dayOfWeek]}`;
  }
}

// New strategies require ZERO changes to above:
export class MonthlyRecurrence implements RecurrenceRule {
  getOccurrences(startDate: Date, count: number): Date[] {
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(startDate);
      d.setUTCMonth(d.getUTCMonth() + i);
      return d;
    });
  }

  describe(): string { return 'Monthly'; }
}
```

---

## Step 3 — Add Domain Events

### Concept: Domain Events — Observer in the Domain Layer

**What it is:** Domain events are records of something that happened in the domain.
Instead of calling side-effect code directly from a domain method, the method emits
an event. Listeners react independently — zero changes to the domain method.

**The problem before:**

```ts
class Calendar {
  addEvent(...): Event {
    // ...add event logic...
    console.log(`Event added: ${event.title}`);    // coupled to console
    searchIndex.update(event);                      // coupled to search index
    emailService.sendConfirmation(organiser);       // coupled to email
    // Adding more side effects requires editing this method every time
  }
}
```

**The solution:**

```ts
class Calendar {
  private readonly _domainEvents: CalendarDomainEvent[] = [];

  addEvent(...): Event {
    // ...add event logic...
    this._domainEvents.push({ type: 'EventAdded', event });   // just record
    return event;
  }

  popDomainEvents(): CalendarDomainEvent[] {
    return this._domainEvents.splice(0);  // return and clear
  }
}

// Application service reads and dispatches:
class AddEventUseCase {
  async execute(...): Promise<void> {
    const calendar = await this.repo.getById(calId);
    calendar.addEvent(...);
    await this.repo.update(calendar);

    for (const domainEvent of calendar.popDomainEvents()) {
      await this.eventBus.emit(domainEvent);  // sends email, updates index, etc.
    }
  }
}
```

**What it hides:** The coupling between business logic and side effects. `Calendar` has
no idea who is listening for `EventAdded`. New side effects are added by subscribing to
the event bus — zero changes to `Calendar`.

**Pattern category:** Behavioral  
**Official name:** Observer (applied via domain events)  
**Tradeoff:** Introduces indirection — harder to trace what runs when an event fires.

**You will see this again in:**
- `EventBus` from T2-L6 — the in-process event bus
- Message queues (RabbitMQ, Kafka) — the distributed equivalent
- React's `useEffect` on state changes — a form of reactive observation

---

Update `src/calendar.ts` to emit domain events:

```ts
import { Event, EventCreateResult } from './event';
import { TimeRange }                 from './time-range';
import { Email }                     from './email';

export type CalendarDomainEvent =
  | { type: 'EventAdded';     event: Event }
  | { type: 'EventCancelled'; eventId: string };

export class Calendar {
  private readonly _events:       Event[]               = [];
  private readonly _domainEvents: CalendarDomainEvent[] = [];

  constructor(readonly id: string) {}

  addEvent(
    title:        string,
    range:        TimeRange,
    organiser:    Email,
    attendees:    Email[] = [],
    roomCapacity: number  = Infinity,
  ): Event {
    if (attendees.length > roomCapacity) {
      throw new Error(`"${title}": ${attendees.length} attendees exceeds capacity ${roomCapacity}`);
    }

    const conflict = this._events.filter(e => e.isActive).find(e => e.range.overlaps(range));
    if (conflict) throw new Error(`Cannot schedule "${title}": overlaps with "${conflict.title}"`);

    const result = Event.create(title, range, organiser);
    if (!result.ok) throw new Error(result.errors.join('; '));

    this._events.push(result.event);
    this._domainEvents.push({ type: 'EventAdded', event: result.event });   // ← emit
    return result.event;
  }

  cancelEvent(eventId: string): void {
    const event = this._events.find(e => e.id === eventId);
    if (!event) throw new Error(`Event "${eventId}" not found`);
    event.cancel();
    this._domainEvents.push({ type: 'EventCancelled', eventId });           // ← emit
  }

  popDomainEvents(): CalendarDomainEvent[] {
    return this._domainEvents.splice(0);  // return all and clear
  }

  getActiveEvents(): Event[] {
    return this._events.filter(e => e.isActive).sort((a, b) => a.range.startMs - b.range.startMs);
  }

  get eventCount(): number { return this._events.filter(e => e.isActive).length; }
}
```

---

## Step 4 — Write Pattern Tests

Create `src/patterns.test.ts`:

```ts
import { describe, it, expect }                  from 'vitest';
import { Event }                                  from './event';
import { TimeRange }                              from './time-range';
import { Email }                                  from './email';
import { DailyRecurrence, WeeklyRecurrence }      from './recurrence-rule';
import { Calendar }                               from './calendar';

const organiser = new Email('org@example.com');

// ── Factory Method ────────────────────────────────────────────────────────

describe('Event.create factory', () => {

  it('creates a valid event', () => {
    const result = Event.create('Team Meeting', TimeRange.fromHours(9, 11), organiser);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.title).toBe('Team Meeting');
      expect(result.event.id).toBeDefined();
    }
  });

  it('returns errors for an empty title', () => {
    const result = Event.create('', TimeRange.fromHours(9, 11), organiser);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('Title is required');
    }
  });

  it('returns errors for a title exceeding 100 characters', () => {
    const result = Event.create('A'.repeat(101), TimeRange.fromHours(9, 11), organiser);
    expect(result.ok).toBe(false);
  });

});

// ── Strategy: Recurrence ──────────────────────────────────────────────────

describe('RecurrenceRule strategy', () => {

  it('DailyRecurrence generates N consecutive days', () => {
    const daily     = new DailyRecurrence();
    const startDate = new Date('2024-01-01T00:00:00Z');
    const dates     = daily.getOccurrences(startDate, 3);

    expect(dates).toHaveLength(3);
    expect(dates[0].toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(dates[1].toISOString()).toBe('2024-01-02T00:00:00.000Z');
    expect(dates[2].toISOString()).toBe('2024-01-03T00:00:00.000Z');
  });

  it('WeeklyRecurrence generates occurrences on the specified day of week', () => {
    const weekly    = new WeeklyRecurrence(1);   // Monday
    const startDate = new Date('2024-01-01T00:00:00Z');   // Monday Jan 1 2024
    const dates     = weekly.getOccurrences(startDate, 3);

    expect(dates).toHaveLength(3);
    expect(dates.every(d => d.getUTCDay() === 1)).toBe(true);   // all Mondays
    expect(dates[1].getTime() - dates[0].getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('strategies are interchangeable through the interface', () => {
    const rules = [new DailyRecurrence(), new WeeklyRecurrence(0)];
    const start = new Date('2024-01-01T00:00:00Z');

    // Both satisfy RecurrenceRule — same call site:
    for (const rule of rules) {
      const dates = rule.getOccurrences(start, 2);
      expect(dates).toHaveLength(2);
    }
  });

});

// ── Domain Events ─────────────────────────────────────────────────────────

describe('Calendar domain events', () => {

  it('emits EventAdded after successfully adding an event', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    const range    = TimeRange.fromHours(9, 11);

    // Act
    calendar.addEvent('Standup', range, organiser);
    const events = calendar.popDomainEvents();

    // Assert
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('EventAdded');
    if (events[0].type === 'EventAdded') {
      expect(events[0].event.title).toBe('Standup');
    }
  });

  it('emits EventCancelled after cancelling an event', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    const event    = calendar.addEvent('Standup', TimeRange.fromHours(9, 11), organiser);
    calendar.popDomainEvents();   // clear the add event

    // Act
    calendar.cancelEvent(event.id);
    const events = calendar.popDomainEvents();

    // Assert
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('EventCancelled');
  });

  it('clears domain events after popping', () => {
    const calendar = new Calendar('cal-1');
    calendar.addEvent('Standup', TimeRange.fromHours(9, 11), organiser);

    calendar.popDomainEvents();   // first pop
    const secondPop = calendar.popDomainEvents();
    expect(secondPop).toHaveLength(0);   // already cleared
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ Event.create factory > creates a valid event
✓ Event.create factory > returns errors for an empty title
✓ Event.create factory > returns errors for a title exceeding 100 characters
✓ RecurrenceRule strategy > DailyRecurrence generates N consecutive days
✓ RecurrenceRule strategy > WeeklyRecurrence generates occurrences on correct day
✓ RecurrenceRule strategy > strategies are interchangeable through the interface
✓ Calendar domain events > emits EventAdded after adding an event
✓ Calendar domain events > emits EventCancelled after cancelling
✓ Calendar domain events > clears domain events after popping

Tests  9 passed (9)
```

---

## 🎯 Challenge: Add a `YearlyRecurrence` Strategy

**You know:** Strategy pattern, the `RecurrenceRule` interface.

**Task:** Add `YearlyRecurrence` that generates annual occurrences.
It must NOT require any changes to `DailyRecurrence`, `WeeklyRecurrence`, or `MonthlyRecurrence`.

```ts
const yearly = new YearlyRecurrence();
yearly.getOccurrences(new Date('2024-03-15T00:00:00Z'), 3);
// → [2024-03-15, 2025-03-15, 2026-03-15]
```

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export class YearlyRecurrence implements RecurrenceRule {
  getOccurrences(startDate: Date, count: number): Date[] {
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(startDate);
      d.setUTCFullYear(d.getUTCFullYear() + i);
      return d;
    });
  }

  describe(): string { return 'Yearly'; }
}
```

**Tests:**
```ts
it('generates occurrences on the same date each year', () => {
  const yearly    = new YearlyRecurrence();
  const startDate = new Date('2024-03-15T00:00:00Z');
  const dates     = yearly.getOccurrences(startDate, 3);

  expect(dates[0].getUTCFullYear()).toBe(2024);
  expect(dates[1].getUTCFullYear()).toBe(2025);
  expect(dates[2].getUTCFullYear()).toBe(2026);
  dates.forEach(d => {
    expect(d.getUTCMonth()).toBe(2);  // March (0-indexed)
    expect(d.getUTCDate()).toBe(15);
  });
});

it('no changes to Daily or Weekly were needed', () => {
  // This test documents the Open/Closed Principle:
  const daily  = new DailyRecurrence();
  const weekly = new WeeklyRecurrence(1);
  const yearly = new YearlyRecurrence();

  // All three satisfy the same interface:
  const rules: import('./recurrence-rule').RecurrenceRule[] = [daily, weekly, yearly];
  const start = new Date('2024-01-01T00:00:00Z');

  for (const rule of rules) {
    expect(rule.getOccurrences(start, 2)).toHaveLength(2);
  }
});
```

**Key insight:** Zero lines changed in `DailyRecurrence`, `WeeklyRecurrence`, or
`MonthlyRecurrence`. The Open/Closed Principle: adding a new strategy only required
creating a new class. The `RecurrenceRule` interface is the extension point.

</details>

---

## Final Check

| Pattern | Test |
|---|---|
| Factory method returns error | `Event.create('')` → `{ ok: false }` |
| Factory method returns event | `Event.create('valid')` → `{ ok: true }` |
| Strategy is interchangeable | Both `DailyRecurrence` and `WeeklyRecurrence` satisfy interface |
| New strategy needs no existing changes | Add `YearlyRecurrence` without touching existing classes |
| Domain events emitted | `popDomainEvents()` after `addEvent` returns one event |
| Domain events cleared | Second `popDomainEvents()` returns empty |

---

## Quick Check Answers

**1. Constructor cannot return null or Result. Alternative for "might not be valid"?**

A static factory method with a private constructor. The factory method returns a
discriminated union: `{ ok: true; event: Event } | { ok: false; errors: string[] }`.
The private constructor ensures callers must go through the factory, which validates
all invariants before constructing.

**2. Three recurrence types, new types will be added. Which pattern avoids modifying existing code?**

Strategy pattern with an interface. Each recurrence type implements the `RecurrenceRule`
interface. When a new type is added, it is a new class — no changes to existing classes.
This satisfies the Open/Closed Principle.

**3. `Calendar.addEvent` has side effects. Pattern to avoid modifying `Calendar` each time?**

Domain Events (Observer pattern). `Calendar.addEvent` pushes to an internal `_domainEvents`
list — that is all. The application service reads the domain events after calling `addEvent`
and dispatches them to the event bus. New side effects are added by subscribing to the bus —
zero changes to `Calendar`. The domain remains clean and the side effects live in the
application/infrastructure layer.
