# Junior to Senior — T4·L4 — Aggregates

**Prerequisites:** T4·L3 (Entity vs Value Object). You can build entities and
value objects. This lesson introduces aggregates — clusters of objects that must
stay internally consistent — and the aggregate root that guards them.

**What this lab adds:**
- What an aggregate is: a cluster that stays consistent together
- The aggregate root: the ONLY public entry point into the cluster
- Why direct access to internal objects is forbidden
- Consistency boundaries: everything inside changes in one atomic step
- Small aggregates: why large aggregates cause performance and contention problems

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A `Calendar` contains `Event`s. A developer writes
>    `calendar.events[0].startMs = newTime` to reschedule an event.
>    What business rules might this bypass?
> 2. You have an aggregate with 50 fields. Two users simultaneously try to save
>    changes. What problem can occur, and why does it not happen with a small aggregate?
> 3. `Calendar.addEvent(event)` checks for conflicts and adds the event atomically.
>    What pattern is this called?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `Calendar` aggregate that manages `Event`s — you cannot create an inconsistent state
from outside the aggregate:

```ts
const calendar = new Calendar('cal-1');
calendar.addEvent('Team Standup', TimeRange.fromHours(9, 10), organiser);   // OK
calendar.addEvent('Overlapping', TimeRange.fromHours(9, 11), organiser);    // throws

// Direct mutation blocked — TypeScript enforces this:
calendar._events[0].range = differentRange;  // compile error — _events is private
```

---

### Concept: Why Aggregate Boundaries Matter

**What it is:** An aggregate is a cluster of domain objects (entities and value objects)
that must always stay consistent with each other. The aggregate root is the only object
in the cluster that outside code can hold a reference to.

**The problem before (no boundary):**

```ts
// Without boundary — the overlap rule CAN be bypassed:
const calendar = new Calendar('cal-1');
const event    = new Event('Meeting', TimeRange.fromHours(9, 11));
calendar.events.push(event);           // bypasses overlap check — BAD

// Also — direct mutation of internal event:
calendar.events[0].startMs = 0;        // sets startMs to epoch — no validation
```

**The solution — aggregate with private internals:**

```ts
// With boundary — the ONLY entry point:
class Calendar {
  private readonly _events: Event[] = [];   // private — cannot be accessed from outside

  addEvent(title: string, range: TimeRange, organiser: Email): Event {
    const conflict = this._events.find(e => e.range.overlaps(range));
    if (conflict) throw new Error(`Conflicts with "${conflict.title}"`);
    const event = new Event(generateId(), title, range, organiser);
    this._events.push(event);
    return event;
  }
}

// Now bypassing is impossible:
calendar.addEvent('Meeting', range, organiser);  // ← only way in — rule always checked
calendar._events.push(event);                    // compile error — TypeScript blocks it
```

**What it hides:** The consistency invariant. The aggregate root hides ALL internal
objects. No external code can reach in and modify them directly — it must go through
the root's methods.

The invariant an aggregate protects: "all objects inside the boundary are always mutually
consistent." For `Calendar`, the invariant is "no two active events overlap."

**Canonical example:** A bank account. The account (aggregate root) is the only way
to interact with the balance (internal state). The bank teller (external code) cannot
reach into the vault and directly change the balance. They must go through the account's
methods (`deposit`, `withdraw`), which enforce "balance cannot go negative."

**Project Application:** `Calendar` enforces the no-overlap rule. `Event`s inside a
calendar cannot be modified directly — only through `Calendar.addEvent` and
`Calendar.cancelEvent`.

**You will see this again in:**
- DDD literature: "Aggregates" chapter in Domain-Driven Design (Evans)
- CQRS/Event Sourcing: aggregates are the unit of state change
- Every well-designed service boundary in microservices

**Watch for:** Lazy loading in aggregates. If `Calendar.addEvent` loads events from
a database, a large number of events could make this slow. Start small; optimise later.

---

### Concept: The Consistency Boundary

**What it is:** All changes to an aggregate must happen in one transaction. Either
ALL changes succeed, or NONE do. The aggregate defines what "consistent" means —
and ensures every operation leaves it in a consistent state.

**The problem before (no consistency guarantee):**

```ts
// Thread A reads Calendar → sees events [9-11, 13-15]
// Thread B reads Calendar → sees events [9-11, 13-15]
// Thread A adds [10-12] → no conflict with its snapshot → saves
// Thread B adds [11-14] → no conflict with its snapshot → saves
// Result: Calendar has [9-11, 10-12, 11-14, 13-15] — OVERLAPPING events
```

**The solution:** Load the aggregate, apply the change in memory, save the aggregate
as a single transaction. The database lock prevents concurrent modification.

**Project Application:** The in-memory `Calendar` in this lesson is always consistent
(single-threaded, no concurrency). In production, optimistic concurrency (version numbers)
or database transactions enforce it.

**Smallest possible example:**

```ts
// Consistent — the overlap check and the append happen in one method call:
addEvent(title: string, range: TimeRange): void {
  if (this._events.some(e => e.range.overlaps(range))) throw new Error('Conflict');
  this._events.push(new Event(title, range));  // check + add = atomic
}
```

---

## Step 1 — Build the Calendar Aggregate

Add `src/event.ts`:

```ts
import { TimeRange } from './time-range';
import { Email }     from './email';

export type EventStatus = 'active' | 'cancelled';

export class Event {
  private _status: EventStatus = 'active';

  constructor(
    readonly id:        string,
    readonly title:     string,
    readonly range:     TimeRange,
    readonly organiser: Email,
  ) {}

  get status(): EventStatus { return this._status; }
  get isActive(): boolean   { return this._status === 'active'; }

  cancel(): void {
    if (this._status === 'cancelled') throw new Error(`"${this.title}" is already cancelled`);
    this._status = 'cancelled';
  }
}
```

You'll need a simple `Email` value object. Add `src/email.ts`:

```ts
export class Email {
  readonly value: string;

  constructor(raw: string) {
    const normalised = raw.trim().toLowerCase();
    if (!normalised || !normalised.includes('@') || !normalised.includes('.')) {
      throw new Error(`"${raw}" is not a valid email address`);
    }
    this.value = normalised;
    Object.freeze(this);
  }

  equals(other: Email): boolean { return this.value === other.value; }
  toString(): string             { return this.value; }
}
```

Add `src/calendar.ts`:

```ts
import { Event }     from './event';
import { TimeRange } from './time-range';
import { Email }     from './email';

let _nextEventId = 1;

export class Calendar {
  private readonly _events: Event[] = [];   // private — aggregate boundary

  constructor(readonly id: string) {}

  addEvent(title: string, range: TimeRange, organiser: Email): Event {
    const conflict = this._events.filter(e => e.isActive).find(e => e.range.overlaps(range));
    if (conflict) {
      throw new Error(`Cannot schedule "${title}": overlaps with "${conflict.title}"`);
    }

    const event = new Event(`event-${_nextEventId++}`, title, range, organiser);
    this._events.push(event);
    return event;
  }

  cancelEvent(eventId: string): void {
    const event = this._events.find(e => e.id === eventId);
    if (!event) throw new Error(`Event "${eventId}" not found in this calendar`);
    event.cancel();
  }

  getActiveEvents(): Event[] {
    return this._events
      .filter(e => e.isActive)
      .sort((a, b) => a.range.startMs - b.range.startMs);
  }

  get eventCount(): number {
    return this._events.filter(e => e.isActive).length;
  }
}
```

---

## Step 2 — Write the Tests

Create `src/calendar.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Calendar }                           from './calendar';
import { TimeRange }                          from './time-range';
import { Email }                              from './email';

const organiser = new Email('alice@example.com');

describe('Calendar', () => {

  it('adds an event to an empty calendar', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    const range    = TimeRange.fromHours(9, 11);

    // Act
    const event = calendar.addEvent('Team Standup', range, organiser);

    // Assert
    expect(event.id).toBeDefined();
    expect(event.title).toBe('Team Standup');
    expect(calendar.eventCount).toBe(1);
  });

  it('throws when adding an event that overlaps an existing one', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    calendar.addEvent('Morning Meeting', TimeRange.fromHours(9, 11), organiser);

    // Act + Assert
    expect(() =>
      calendar.addEvent('Overlapping Event', TimeRange.fromHours(10, 12), organiser)
    ).toThrow();
  });

  it('allows adding a non-overlapping event after an existing one', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    calendar.addEvent('Morning Meeting', TimeRange.fromHours(9, 11), organiser);

    // Act
    const event = calendar.addEvent('Afternoon Review', TimeRange.fromHours(13, 15), organiser);

    // Assert
    expect(calendar.eventCount).toBe(2);
    expect(event.title).toBe('Afternoon Review');
  });

  it('cancels an active event by id', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    const event    = calendar.addEvent('Team Standup', TimeRange.fromHours(9, 10), organiser);

    // Act
    calendar.cancelEvent(event.id);

    // Assert
    expect(calendar.eventCount).toBe(0);  // cancelled — not counted
  });

  it('allows rescheduling into a cancelled slot', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    const event    = calendar.addEvent('Meeting', TimeRange.fromHours(9, 11), organiser);
    calendar.cancelEvent(event.id);

    // Act — same time slot is now available:
    const newEvent = calendar.addEvent('Replacement', TimeRange.fromHours(9, 11), organiser);

    // Assert
    expect(newEvent.title).toBe('Replacement');
  });

  it('returns active events sorted by start time', () => {
    // Arrange
    const calendar = new Calendar('cal-1');
    calendar.addEvent('Afternoon', TimeRange.fromHours(14, 15), organiser);
    calendar.addEvent('Morning',   TimeRange.fromHours(9, 10),  organiser);
    calendar.addEvent('Midday',    TimeRange.fromHours(12, 13), organiser);

    // Act
    const sorted = calendar.getActiveEvents();

    // Assert — sorted by start time:
    expect(sorted.map(e => e.title)).toEqual(['Morning', 'Midday', 'Afternoon']);
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ Calendar > adds an event to an empty calendar
✓ Calendar > throws when adding an event that overlaps an existing one
✓ Calendar > allows adding a non-overlapping event after an existing one
✓ Calendar > cancels an active event by id
✓ Calendar > allows rescheduling into a cancelled slot
✓ Calendar > returns active events sorted by start time

Tests  6 passed (6)
```

**Change something:** Try to access `calendar._events` directly from a test.
Expected: TypeScript reports `Property '_events' is private and only accessible
within class 'Calendar'`. This is the aggregate boundary enforced at compile time.

---

## 🎯 Challenge: Add Attendee Capacity

**You know:** Aggregate root, consistency boundary, invariant enforcement.

**Task:** Add a rule: "an event cannot be added if the number of attendees exceeds
the room's capacity."

Update `addEvent` signature:
```ts
addEvent(title: string, range: TimeRange, organiser: Email,
         attendees?: Email[], roomCapacity?: number): Event
```

Write 3 tests before implementing:
- Exceeding capacity throws
- Exactly at capacity succeeds
- No attendees (default) always succeeds

---

<details>
<summary>▶ Show Solution</summary>

```ts
addEvent(
  title:        string,
  range:        TimeRange,
  organiser:    Email,
  attendees:    Email[] = [],
  roomCapacity: number  = Infinity,
): Event {
  if (attendees.length > roomCapacity) {
    throw new Error(
      `"${title}": ${attendees.length} attendees exceeds room capacity of ${roomCapacity}`
    );
  }

  const conflict = this._events.filter(e => e.isActive).find(e => e.range.overlaps(range));
  if (conflict) throw new Error(`Cannot schedule "${title}": overlaps with "${conflict.title}"`);

  const event = new Event(`event-${_nextEventId++}`, title, range, organiser, attendees);
  this._events.push(event);
  return event;
}
```

**Tests:**
```ts
it('throws when attendee count exceeds room capacity', () => {
  const calendar  = new Calendar('cal-1');
  const attendees = [new Email('a@e.com'), new Email('b@e.com'), new Email('c@e.com')];
  expect(() =>
    calendar.addEvent('Big Meeting', TimeRange.fromHours(9, 11), organiser, attendees, 2)
  ).toThrow('attendees exceeds room capacity');
});

it('allows booking when attendees equal capacity exactly', () => {
  const calendar  = new Calendar('cal-1');
  const attendees = [new Email('a@e.com'), new Email('b@e.com')];
  expect(() =>
    calendar.addEvent('Full Room', TimeRange.fromHours(9, 11), organiser, attendees, 2)
  ).not.toThrow();
});

it('allows booking with no attendees regardless of capacity', () => {
  const calendar = new Calendar('cal-1');
  expect(() =>
    calendar.addEvent('Empty Meeting', TimeRange.fromHours(9, 11), organiser, [], 0)
  ).not.toThrow();   // 0 attendees ≤ 0 capacity
});
```

**Key insight:** The capacity check is another invariant enforced by the aggregate
root. Neither `Event` nor external code can violate it — `Calendar.addEvent` is the
single enforcement point for ALL calendar booking rules.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Aggregate root is the only entry | `calendar._events` compile error |
| Invariant always enforced | Can you add overlapping events? No — throws |
| Cancelled events excluded | Cancel an event → eventCount decreases |
| Consistent state | Add + conflict check happen in one method call |

---

## Quick Check Answers

**1. Developer writes `calendar.events[0].startMs = ...`. What business rules might be bypassed?**

The overlap check. `Calendar.addEvent` checks that no existing events overlap with the
new event before adding. If you can mutate an event's `startMs` directly, the event could
now overlap with another event in the same calendar — the overlap rule was never checked
for the new time. The aggregate root's job is to be the only path through which changes happen.

**2. Aggregate with 50 fields, two simultaneous users. What problem?**

Optimistic concurrency conflict. Both users load the same aggregate, both make changes,
both try to save. The second save fails because the aggregate was already modified (version
number changed). Even if the two users were modifying completely different parts of the
aggregate, they still conflict. Small aggregates reduce the blast radius of these conflicts.

**3. `Calendar.addEvent` checks and adds atomically. What pattern?**

The Aggregate Root pattern. The calendar enforces its invariants within a consistency
boundary — the overlap check and the append happen in one method call, never leaving
the aggregate in an inconsistent state.
