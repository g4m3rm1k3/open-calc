# Junior to Senior — T4·L5 — Domain Services

**Prerequisites:** T4·L4 (Aggregates). You can build aggregate roots. This lesson
covers the operations that span multiple aggregates and belong in neither entity.

**What this lab adds:**
- Domain service: an operation with no natural home in a single entity
- Domain service vs application service — the critical distinction
- Naming domain services from the ubiquitous language
- The slot-finding scheduling operation as a domain service
- Testing domain services with nothing but domain objects

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. "A booking cannot overlap with any booking in the same room on the same day"
>    involves `Calendar` and `Room`. Where does this rule live?
> 2. A function calls `await db.query()` and `await emailClient.send()`. Is it
>    a domain service?
> 3. `SchedulingService.findNextAvailableSlot(calendar, duration)` — why does
>    this NOT belong in `Calendar` or `TimeRange`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `SchedulingService` that finds available slots in a calendar — pure domain logic,
no database, no HTTP, testable with just domain objects:

```ts
const service  = new SchedulingService();
const calendar = new Calendar('cal-1');
calendar.addEvent('Morning Meeting', TimeRange.fromHours(9, 11), organiser);

const slot = service.findNextAvailableSlot(
  calendar,
  Duration.ofHours(1),
  9 * 3_600_000,  // search from 9am
);

slot?.startMs === 11 * 3_600_000   // → 11:00 — first gap after the existing meeting
```

---

### Concept: What Makes an Operation a Domain Service

**What it is:** A domain service is a named operation in the domain's language that:
- Involves multiple domain objects or aggregates
- Has no natural home in any single entity or value object
- Contains business rules (not just coordination of infrastructure calls)

**The test for a domain service:**

```
Can this operation be implemented without importing any database, HTTP client,
file system, or external service? Can it be fully tested with pure domain objects?
→ If YES: it is a domain service.
→ If NO:  it is an application service (belongs outside the domain layer).
```

**The problem before (logic with no clear home):**

```ts
// Where does slot-finding live?
// Not in Calendar — Calendar doesn't know about Duration
// Not in TimeRange — TimeRange doesn't know about bookings
// Not in a database query — this is a business rule, not a storage concern
```

**The solution:**

```ts
class SchedulingService {
  findNextAvailableSlot(
    calendar:      Calendar,
    duration:      Duration,
    searchFromMs:  number,
  ): TimeRange | null {
    // Pure business logic — no I/O
  }
}
```

**What it hides:** The algorithm complexity. Callers just call `findNextAvailableSlot`
and get a slot back — or `null` if none is available. The greedy search algorithm
is hidden inside the service.

**Canonical example:** A hotel concierge service. The concierge knows about room
availability, guest preferences, and hotel rules — but doesn't manage the rooms
directly (that's the Room entity) and doesn't take payments (that's infrastructure).
They coordinate domain knowledge to answer "what's the best option for this guest?"

**Project Application:** `SchedulingService` uses `Calendar.getActiveEvents()` to
find gaps. It does not add events or modify the calendar — it only reads state to
make recommendations.

**You will see this again in:**
- "Domain Services" chapter in DDD (Evans) — the authoritative source
- Pattern: any operation that takes multiple aggregates as arguments
- Testing: domain services have the simplest tests — just pass in domain objects

**Watch for:** Domain services that grow into application services. If `SchedulingService`
starts calling `await emailService.notifyOrganiser(...)`, it has crossed into
infrastructure. Move that call to the application service layer.

---

### Concept: Domain Service vs Application Service

**What it is:**

| | Domain Service | Application Service |
|---|---|---|
| Contains | Business rules | Coordination of calls |
| Imports | Domain objects only | Infrastructure (DB, HTTP, email) |
| Tested with | Pure fakes | Integration tests or mocks |
| Knows about DB? | Never | Yes |
| Knows about HTTP? | Never | Yes |

**The problem before (mixing concerns):**

```ts
// This is an APPLICATION service masquerading as a domain service:
class SchedulingService {
  async findAndBook(calendarId: string, duration: Duration): Promise<Event> {
    const calendar = await this.calendarRepo.findById(calendarId);   // ← DB
    const slot = this.findSlot(calendar, duration);
    const event = await this.calendarRepo.save(calendar);            // ← DB
    await this.emailService.notify(event);                           // ← Email
    return event;
  }
}
```

This service has infrastructure imports — it belongs in the application layer.

**The solution — separate the layers:**

```ts
// Domain service: pure logic
class SchedulingService {
  findNextAvailableSlot(calendar: Calendar, duration: Duration, from: number): TimeRange | null {
    // Only domain objects — no I/O
  }
}

// Application service: coordinates I/O
class BookEventUseCase {
  async execute(calendarId: string, duration: Duration): Promise<void> {
    const calendar = await this.repo.findById(calendarId);  // DB
    const slot     = this.scheduler.findNextAvailableSlot(calendar, duration, Date.now()); // domain
    if (!slot) throw new Error('No slots available');
    calendar.addEvent('Auto-scheduled', slot, this.systemUser);
    await this.repo.save(calendar);                         // DB
    await this.emailService.notify(calendar);               // Email
  }
}
```

**You will see this again in:**
- Clean Architecture: "Use Cases" are application services
- Every well-structured backend separates "what the business decides" from "how it is stored"

---

## Step 1 — Build the Scheduling Service

Add `src/scheduling-service.ts`:

```ts
import { Calendar }   from './calendar';
import { TimeRange }  from './time-range';
import { Duration }   from './duration';

export class SchedulingService {
  /**
   * Finds the earliest available time slot in a calendar.
   * Searches forward from `searchFromMs` until a slot of the requested duration is found.
   * Returns null if no slot is found within `searchWindowMs`.
   */
  findNextAvailableSlot(
    calendar:       Calendar,
    duration:       Duration,
    searchFromMs:   number,
    searchWindowMs: number = 8 * 3_600_000,  // default: search 8 hours ahead
  ): TimeRange | null {
    const searchUntilMs = searchFromMs + searchWindowMs;
    let candidateStart  = searchFromMs;

    while (candidateStart + duration.ms <= searchUntilMs) {
      const candidate = new TimeRange(candidateStart, candidateStart + duration.ms);

      const conflict = calendar
        .getActiveEvents()
        .find(e => e.range.overlaps(candidate));

      if (!conflict) {
        return candidate;   // found a free slot
      }

      // Jump past the conflicting event to avoid retrying during it:
      candidateStart = conflict.range.endMs;
    }

    return null;  // no slot found in the search window
  }

  /**
   * Returns all available slots of the given duration within a time range.
   */
  findAllAvailableSlots(
    calendar:    Calendar,
    duration:    Duration,
    searchRange: TimeRange,
  ): TimeRange[] {
    const slots: TimeRange[] = [];
    let cursor = searchRange.startMs;

    while (cursor + duration.ms <= searchRange.endMs) {
      const candidate = new TimeRange(cursor, cursor + duration.ms);

      const conflict = calendar
        .getActiveEvents()
        .find(e => e.range.overlaps(candidate));

      if (!conflict) {
        slots.push(candidate);
        cursor += duration.ms;  // advance past this slot
      } else {
        cursor = conflict.range.endMs;  // jump past the conflict
      }
    }

    return slots;
  }
}
```

---

## Step 2 — Write the Tests

Create `src/scheduling-service.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Calendar }               from './calendar';
import { SchedulingService }      from './scheduling-service';
import { TimeRange }              from './time-range';
import { Duration }               from './duration';
import { Email }                  from './email';

const organiser = new Email('alice@example.com');
const service   = new SchedulingService();

// Helper: hours to milliseconds
const h = (hour: number) => hour * 3_600_000;

describe('SchedulingService', () => {

  describe('findNextAvailableSlot', () => {

    it('returns the search start time when the calendar is empty', () => {
      // Arrange
      const calendar = new Calendar('cal-1');
      const duration = Duration.ofHours(1);

      // Act
      const slot = service.findNextAvailableSlot(calendar, duration, h(9), h(8));

      // Assert
      expect(slot).not.toBeNull();
      expect(slot!.startMs).toBe(h(9));
      expect(slot!.durationMs).toBe(duration.ms);
    });

    it('skips an existing event and finds the next gap', () => {
      // Arrange
      const calendar = new Calendar('cal-1');
      calendar.addEvent('Morning Meeting', TimeRange.fromHours(9, 11), organiser);
      const duration = Duration.ofHours(1);

      // Act
      const slot = service.findNextAvailableSlot(calendar, duration, h(9), h(8));

      // Assert — should skip the 9-11 meeting and start at 11:
      expect(slot).not.toBeNull();
      expect(slot!.startMs).toBe(h(11));
    });

    it('returns null when no slot fits in the search window', () => {
      // Arrange — fill the search window (9-17) with back-to-back meetings:
      const calendar = new Calendar('cal-1');
      calendar.addEvent('Meeting 1', TimeRange.fromHours(9,  11), organiser);
      calendar.addEvent('Meeting 2', TimeRange.fromHours(11, 13), organiser);
      calendar.addEvent('Meeting 3', TimeRange.fromHours(13, 15), organiser);
      calendar.addEvent('Meeting 4', TimeRange.fromHours(15, 17), organiser);

      // Act — looking for a 1-hour slot in a fully booked window:
      const slot = service.findNextAvailableSlot(
        calendar, Duration.ofHours(1), h(9), h(8),
      );

      // Assert
      expect(slot).toBeNull();
    });

    it('finds a slot between two events', () => {
      // Arrange
      const calendar = new Calendar('cal-1');
      calendar.addEvent('Morning',  TimeRange.fromHours(9, 10), organiser);
      calendar.addEvent('Midday',   TimeRange.fromHours(12, 14), organiser);

      // Act — looking for a 1-hour slot:
      const slot = service.findNextAvailableSlot(calendar, Duration.ofHours(1), h(9), h(8));

      // Assert — gap at 10-11 is available:
      expect(slot!.startMs).toBe(h(10));
      expect(slot!.endMs).toBe(h(11));
    });

  });

  describe('findAllAvailableSlots', () => {

    it('returns all slots when calendar is empty', () => {
      // Arrange
      const calendar    = new Calendar('cal-1');
      const searchRange = TimeRange.fromHours(9, 12);   // 3 hours

      // Act
      const slots = service.findAllAvailableSlots(calendar, Duration.ofHours(1), searchRange);

      // Assert — 3 one-hour slots fit in 3 hours:
      expect(slots).toHaveLength(3);
      expect(slots[0].startMs).toBe(h(9));
      expect(slots[1].startMs).toBe(h(10));
      expect(slots[2].startMs).toBe(h(11));
    });

    it('returns slots around an existing event', () => {
      // Arrange
      const calendar = new Calendar('cal-1');
      calendar.addEvent('Block', TimeRange.fromHours(10, 11), organiser);
      const searchRange = TimeRange.fromHours(9, 13);

      // Act
      const slots = service.findAllAvailableSlots(calendar, Duration.ofHours(1), searchRange);

      // Assert — slots at 9-10, 11-12, 12-13:
      expect(slots).toHaveLength(3);
      expect(slots[0].startMs).toBe(h(9));
      expect(slots[1].startMs).toBe(h(11));
      expect(slots[2].startMs).toBe(h(12));
    });

  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ SchedulingService > findNextAvailableSlot > returns the search start time when empty
✓ SchedulingService > findNextAvailableSlot > skips an existing event and finds the gap
✓ SchedulingService > findNextAvailableSlot > returns null when no slot fits
✓ SchedulingService > findNextAvailableSlot > finds a slot between two events
✓ SchedulingService > findAllAvailableSlots > returns all slots when calendar is empty
✓ SchedulingService > findAllAvailableSlots > returns slots around an existing event

Tests  6 passed (6)
```

**Notice:** Zero database, zero HTTP. The `SchedulingService` is a pure domain service
tested entirely with domain objects. This is what makes domain services easy to test and reason about.

---

## 🎯 Challenge: Find a Slot For Multiple Attendees

**You know:** Domain services, how to write slot-finding logic.

**Task:** Add `findNextSlotForAll(calendars: Calendar[], duration: Duration, from: number): TimeRange | null`
that finds the first slot where ALL calendars are simultaneously free.

Algorithm:
1. Try a candidate slot starting at `from`
2. Check each calendar for a conflict
3. If ALL calendars are free: return the slot
4. If any calendar has a conflict: jump to that conflict's end and try again

Write 3 tests: empty calendars, one calendar busy, no slot available.

---

<details>
<summary>▶ Show Solution</summary>

```ts
findNextSlotForAll(
  calendars:     Calendar[],
  duration:      Duration,
  searchFromMs:  number,
  searchWindowMs = 8 * 3_600_000,
): TimeRange | null {
  const searchUntilMs = searchFromMs + searchWindowMs;
  let cursor = searchFromMs;

  while (cursor + duration.ms <= searchUntilMs) {
    const candidate = new TimeRange(cursor, cursor + duration.ms);

    // Find the latest conflict across all calendars:
    let latestConflictEnd = -1;

    for (const calendar of calendars) {
      const conflict = calendar.getActiveEvents()
        .find(e => e.range.overlaps(candidate));
      if (conflict) {
        latestConflictEnd = Math.max(latestConflictEnd, conflict.range.endMs);
      }
    }

    if (latestConflictEnd === -1) {
      return candidate;   // all calendars are free
    }

    cursor = latestConflictEnd;   // jump past the latest conflict
  }

  return null;
}
```

**Tests:**
```ts
it('finds a slot when all calendars are empty', () => {
  const slots = service.findNextSlotForAll(
    [new Calendar('c1'), new Calendar('c2')],
    Duration.ofHours(1), h(9)
  );
  expect(slots?.startMs).toBe(h(9));
});

it('skips when one calendar is busy', () => {
  const cal1 = new Calendar('c1');
  const cal2 = new Calendar('c2');
  cal1.addEvent('Busy', TimeRange.fromHours(9, 10), organiser);

  const slot = service.findNextSlotForAll([cal1, cal2], Duration.ofHours(1), h(9));
  expect(slot?.startMs).toBe(h(10));
});
```

**Key insight:** Jump past the LATEST conflict, not the first. If cal1 is busy until 11
and cal2 is busy until 12, jumping to 11 would immediately fail on cal2. Jumping to 12
skips that failed attempt.

</details>

---

## Final Check

| | Domain Service | Application Service |
|---|---|---|
| Contains | Business rules | Infrastructure coordination |
| `import` includes | Only domain objects | Repositories, HTTP, email |
| Tested with | Pure domain objects | Integration tests |
| Knows about database? | Never | Yes |

---

## Quick Check Answers

**1. "Booking cannot overlap with bookings in the same room." Calendar AND Room. Where?**

In a domain service. The rule involves two aggregates — it cannot live in either one
without creating a dependency between them. A `SchedulingService` receives both as
parameters and applies the rule. Neither aggregate knows about the other.

**2. Function calls `db.query()` and `emailClient.send()`. Domain service?**

No. It is an application service. Domain services contain business rules and operate
only on domain objects. `db.query()` and `emailClient.send()` are infrastructure
operations. The application service layer coordinates infrastructure; the domain service
layer contains rules.

**3. `SchedulingService.findNextAvailableSlot` — why not in `Calendar` or `TimeRange`?**

It does not belong in `Calendar` because `Calendar` owns bookings — not scheduling
algorithms. It does not belong in `TimeRange` because `TimeRange` is a value object
with no knowledge of calendars. The slot-finding operation spans both — it is an
algorithm that reads from a calendar and reasons about time ranges. That combination
has no natural home in either entity, making it a domain service.
