# Junior to Senior — T4·L9 — Building the Scheduling Domain: TDD

**Prerequisites:** T4·L8 (Identifying Domain Objects). You have the domain model
designed. This lesson builds the complete scheduling domain test-first, including
the interval overlap algorithm and the slot-finding algorithm.

**What this lab adds:**
- Writing tests directly from business rules — one rule, one test
- The interval overlap formula: `[a,b]` and `[c,d]` overlap if `a < d AND c < b`
- Sorting events as a prerequisite for efficient slot-finding
- Verifying edge cases: adjacent slots, cancelled events, full calendars

**Time:** 90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `[9, 11]` and `[11, 13]` — do they overlap? (Think carefully about the formula.)
> 2. You have 50 events. You want the first free 1-hour slot. Is it faster to
>    sort them first and scan once, or scan all pairs?
> 3. A cancelled event occupies the same slot as a new event. Is there a conflict?
>
> *(Answers at the end of this lab)*

---

## The Overlap Formula — Proved

Two intervals `[a, b]` and `[c, d]` overlap if and only if:

```
a < d  AND  c < b
```

In words: the first starts before the second ends, AND the second starts before the first ends.

**Verifying with examples:**

```
[9, 11] vs [10, 12]:  9 < 12 = true, 10 < 11 = true   → OVERLAP ✓
[9, 11] vs [11, 13]:  9 < 13 = true, 11 < 11 = false  → NO OVERLAP (adjacent) ✓
[9, 11] vs [12, 14]:  9 < 14 = true, 12 < 11 = false  → NO OVERLAP ✓
[9, 11] vs [7,  15]:  9 < 15 = true,  7 < 11 = true   → OVERLAP (contained) ✓
```

Adjacent intervals (`[9,11]` and `[11,13]`) do NOT overlap — the end of the first
equals the start of the second, but `11 < 11` is false. A meeting that ends at 11:00
and one starting at 11:00 are fine.

---

## Step 1 — Test the Overlap Formula

Add these tests to `src/time-range.test.ts` (or create it if needed):

```ts
import { describe, it, expect } from 'vitest';
import { TimeRange }             from './time-range';

describe('TimeRange.overlaps — the interval overlap formula', () => {

  it('detects an overlap when intervals intersect', () => {
    const a = TimeRange.fromHours(9, 11);
    const b = TimeRange.fromHours(10, 12);
    expect(a.overlaps(b)).toBe(true);
    expect(b.overlaps(a)).toBe(true);   // symmetric
  });

  it('reports no overlap for adjacent intervals', () => {
    // Business rule: ending at 11 and starting at 11 is fine
    const morning = TimeRange.fromHours(9, 11);
    const noon    = TimeRange.fromHours(11, 13);
    expect(morning.overlaps(noon)).toBe(false);
    expect(noon.overlaps(morning)).toBe(false);
  });

  it('reports no overlap when there is a gap', () => {
    const morning   = TimeRange.fromHours(9, 11);
    const afternoon = TimeRange.fromHours(13, 15);
    expect(morning.overlaps(afternoon)).toBe(false);
  });

  it('detects overlap when one interval contains the other', () => {
    const outer = TimeRange.fromHours(9, 17);
    const inner = TimeRange.fromHours(10, 11);
    expect(outer.overlaps(inner)).toBe(true);
  });

  it('detects overlap for identical intervals', () => {
    const a = TimeRange.fromHours(9, 11);
    const b = TimeRange.fromHours(9, 11);
    expect(a.overlaps(b)).toBe(true);
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** All overlap tests pass. If any fail, the `overlaps` method in
`time-range.ts` has a bug — verify it uses `this.startMs < other.endMs && other.startMs < this.endMs`.

---

## Step 2 — Test Calendar Rules From Business Rules

Each business rule from T4-L8 becomes at least one test. Add to `src/calendar.test.ts`:

```ts
describe('Calendar business rules', () => {
  const organiser = new Email('org@example.com');

  // Rule 4: no double-booking
  it('allows booking adjacent slots (end time = start time)', () => {
    const cal = new Calendar('cal-1');
    cal.addEvent('Meeting 1', TimeRange.fromHours(9, 11), organiser);
    // Adjacent — should NOT throw:
    expect(() => cal.addEvent('Meeting 2', TimeRange.fromHours(11, 13), organiser)).not.toThrow();
  });

  it('throws on exact duplicate time slot', () => {
    const cal = new Calendar('cal-1');
    cal.addEvent('Meeting 1', TimeRange.fromHours(9, 11), organiser);
    expect(() => cal.addEvent('Meeting 2', TimeRange.fromHours(9, 11), organiser)).toThrow();
  });

  it('throws when new event contains an existing event', () => {
    const cal = new Calendar('cal-1');
    cal.addEvent('Inner', TimeRange.fromHours(10, 11), organiser);
    expect(() => cal.addEvent('Outer', TimeRange.fromHours(9, 12), organiser)).toThrow();
  });

  // Rule 5: cancelled events do not block slots
  it('allows booking a slot that was previously cancelled', () => {
    const cal   = new Calendar('cal-1');
    const event = cal.addEvent('Meeting', TimeRange.fromHours(9, 11), organiser);
    cal.cancelEvent(event.id);
    // Should succeed — cancelled event doesn't count:
    expect(() => cal.addEvent('Replacement', TimeRange.fromHours(9, 11), organiser)).not.toThrow();
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** All calendar business rule tests pass.

---

## Step 3 — Test the Slot-Finding Algorithm Edge Cases

Add to `src/scheduling-service.test.ts`:

```ts
describe('SchedulingService edge cases', () => {

  it('returns the search start time when the calendar is empty', () => {
    const cal  = new Calendar('c1');
    const slot = service.findNextAvailableSlot(cal, Duration.ofMinutes(30), h(9), h(8));
    expect(slot?.startMs).toBe(h(9));
    expect(slot?.durationMs).toBe(30 * 60_000);
  });

  it('handles a calendar with a single all-day event', () => {
    const cal = new Calendar('c1');
    cal.addEvent('All Day', TimeRange.fromHours(9, 17), organiser);

    // Search for 1 hour in an 8-hour window starting at 9:
    const slot = service.findNextAvailableSlot(cal, Duration.ofHours(1), h(9), h(8));
    // 9-17 fills the window; nothing after 17 before 17+8=25:
    expect(slot).toBeNull();
  });

  it('finds a slot that exactly fits between two events', () => {
    const cal = new Calendar('c1');
    // Gap of exactly 1 hour between 10:00 and 11:00:
    cal.addEvent('M1', TimeRange.fromHours(9, 10),  organiser);
    cal.addEvent('M2', TimeRange.fromHours(11, 12), organiser);

    const slot = service.findNextAvailableSlot(cal, Duration.ofHours(1), h(9), h(8));
    expect(slot!.startMs).toBe(h(10));
    expect(slot!.endMs).toBe(h(11));
  });

  it('does not find a slot when every gap is smaller than the duration', () => {
    const cal = new Calendar('c1');
    // Gaps of 30 minutes each — not enough for a 1-hour slot:
    cal.addEvent('M1', new TimeRange(h(9),    h(9)    + 30 * 60_000), organiser);
    cal.addEvent('M2', new TimeRange(h(10),   h(11)), organiser);
    cal.addEvent('M3', new TimeRange(h(11.5), h(12)), organiser);

    const slot = service.findNextAvailableSlot(cal, Duration.ofHours(1), h(9), h(3));
    expect(slot).toBeNull();
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:** All edge case tests pass.

---

## Step 4 — Verify All Business Rules Are Tested

Create a checklist. For each rule, a test that would fail if the rule were removed:

| Rule | Test |
|---|---|
| 1. Room has name, location, capacity | `new Room(id, '', 0)` — constructor validation |
| 2. TimeSlot: end must be after start | `TimeRange.fromHours(11, 9)` → throws |
| 3. Event occupies a room | `Event` has `title`, `range`, `organiser` |
| 4. No double-booking | Adding overlapping event → throws |
| 4a. Adjacent slots OK | Adding adjacent events → does not throw |
| 5. Attendees ≤ capacity | Adding with too many attendees → throws |
| 5a. Cancelled events don't block | Book cancelled slot → does not throw |
| 8. Find available slot | Empty calendar → returns search start time |
| 8a. Skip existing events | Slot after existing meeting returned |
| 8b. No slot when full | Fully booked calendar → null |

```bash
npm test
```

**All tests should pass.** Each test in this list is a direct translation of a
business rule into executable code.

---

## 🎯 Challenge: Add Recurring Events

**You know:** Domain modeling, TDD, the scheduling domain.

**Task:** Extend the domain to support weekly recurring events. A recurring event
occupies the same time slot every week.

**Business rules:**
- A recurring event has a pattern: `{ dayOfWeek: 0-6, startHour: number, endHour: number }`
- `dayOfWeek`: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
- When checking availability, recurring events must be considered

**Deliverables:**
- Design the domain objects (write the glossary entry, not code)
- Write at least 2 test cases
- Implement the minimum to make them pass

---

<details>
<summary>▶ Show Solution</summary>

**Glossary entry:**

```
RecurringEvent
  An event that repeats every week on the same day and time.
  Pattern: { dayOfWeek, startHour, endHour }
  INVARIANT: endHour > startHour
```

**Helper function (domain logic):**

```ts
// Does a recurring event conflict with a specific TimeRange?
function recurringConflicts(
  pattern: { dayOfWeek: number; startHour: number; endHour: number },
  range: TimeRange,
): boolean {
  const startDate = new Date(range.startMs);
  const endDate   = new Date(range.endMs);

  if (startDate.getUTCDay() !== pattern.dayOfWeek) return false;

  const rangeStartHour = startDate.getUTCHours() + startDate.getUTCMinutes() / 60;
  const rangeEndHour   = endDate.getUTCHours()   + endDate.getUTCMinutes()   / 60;

  return rangeStartHour < pattern.endHour && pattern.startHour < rangeEndHour;
}
```

**Tests:**
```ts
it('detects conflict on the same day and overlapping time', () => {
  const monday9to11 = { dayOfWeek: 1, startHour: 9, endHour: 11 };
  // Monday at 10:00 UTC:
  const range = new TimeRange(
    Date.UTC(2024, 0, 8, 10, 0),   // Mon Jan 8 10:00
    Date.UTC(2024, 0, 8, 11, 0),
  );
  expect(recurringConflicts(monday9to11, range)).toBe(true);
});

it('no conflict on a different day', () => {
  const monday9to11 = { dayOfWeek: 1, startHour: 9, endHour: 11 };
  const tuesday = new TimeRange(
    Date.UTC(2024, 0, 9, 10, 0),   // Tue Jan 9
    Date.UTC(2024, 0, 9, 11, 0),
  );
  expect(recurringConflicts(monday9to11, tuesday)).toBe(false);
});
```

</details>

---

## Final Check

| Business rule | Test |
|---|---|
| No double-booking | Overlap → throws |
| Adjacent OK | End=start does not throw |
| Cancelled doesn't block | Cancel then rebook succeeds |
| Slot-finding: next slot | Empty calendar → search start |
| Slot-finding: skip events | Returns slot after last event |
| Slot-finding: no slot | Full calendar → null |

---

## Quick Check Answers

**1. `[9, 11]` and `[11, 13]` — do they overlap?**

No. The formula: `a < d AND c < b` → `9 < 13 = true` AND `11 < 11 = false`.
Since both must be true, they do not overlap. Adjacent slots are not overlapping —
this is the correct business behaviour: a meeting ending at 11:00 and one starting
at 11:00 can coexist.

**2. Sort first, then scan once — vs scan all pairs?**

Sort first, then scan linearly — O(n log n) total. After sorting by start time, a
single linear pass finds all gaps in O(n). Scanning all pairs is O(n²). For 50 events:
sorting + scan ≈ 300 operations; all pairs ≈ 1,250 operations.

**3. Cancelled event occupies the same slot as a new event. Conflict?**

No. Only ACTIVE events prevent booking. Cancelled events are filtered out before
the overlap check: `this._events.filter(e => e.isActive).find(e => e.range.overlaps(range))`.
This is why "allows booking a slot that was previously cancelled" is an explicit test.
