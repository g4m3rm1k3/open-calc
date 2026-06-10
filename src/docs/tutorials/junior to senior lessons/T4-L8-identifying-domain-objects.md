# Junior to Senior — T4·L8 — Identifying Domain Objects

**Prerequisites:** T4·L7 (Dependency Graph). You understand the core domain patterns.
This lesson applies them — starting from business rules, extracting domain objects,
and drawing boundaries before writing any code.

**What this lab adds:**
- Extracting entities and value objects from business rules by identifying nouns
- Identifying aggregates from consistency requirements
- Writing the ubiquitous language glossary before code
- Drawing aggregate boundaries on paper (or in ASCII)

**Time:** 45–60 minutes (analysis, less code)

---

> **Quick Check — try to answer before reading:**
>
> 1. The business says "an event has a location." Is `location` an entity or a
>    value object?
> 2. "When a room is double-booked, send an alert." Who sends the alert — the
>    `Room`, the `Booking`, or something else?
> 3. You have `Event` and `Room`. When you add an event, you check the room's
>    availability. Does `Event` know about `Room` or vice versa?
>
> *(Answers at the end of this lab)*

---

## The Process: Rules First, Code Second

The most common domain modeling mistake is writing code before understanding the domain.
The correct order:

1. Write the business rules in plain language
2. Identify nouns (potential objects) and verbs (potential operations)
3. Classify each noun: entity, value object, or aggregate root?
4. Write the ubiquitous language glossary
5. Draw the aggregate boundaries
6. THEN write code

This lesson covers steps 1–5 for the scheduling domain.

---

## The Business Rules

```
Business rules for the Room Scheduling System:

1. A room has a name, a location, and a maximum capacity.

2. A time slot is a pair of (start time, end time).
   The end time must be strictly after the start time.

3. An event occupies a room during a specific time slot.
   Events have a title, an organiser, and a list of attendees.

4. A room cannot have two events at the same time (no double-booking).

5. An event cannot have more attendees than the room's capacity.

6. An organiser can own multiple events.

7. A calendar belongs to a specific room and tracks all events in that room.

8. A "schedule check" finds the next available slot in a given room for a
   given duration, starting from a given time.
```

---

### Step 1 — Extract Nouns and Verbs

**Nouns (potential objects):**

| Noun | Appears in rules |
|---|---|
| Room | 1, 4, 5, 7, 8 |
| Time slot | 2 |
| Event | 3, 4, 5 |
| Title | 3 |
| Organiser | 3, 6 |
| Attendee | 3, 5 |
| Capacity | 1, 5 |
| Calendar | 7 |
| Duration | 8 |
| Available slot | 8 |

**Verbs (potential operations):**

| Verb | Belongs to |
|---|---|
| occupy (a room) | Event creation |
| check (double-booking) | Calendar |
| find (next available slot) | SchedulingService |
| own (multiple events) | Organiser |

---

### Step 2 — Classify Each Noun

**Entities** (defined by identity, have a lifecycle):

| Entity | Why |
|---|---|
| `Room` | Tracked over time; renaming it does not make it a different room |
| `Event` | Tracked by ID; can be cancelled, changing its state but not identity |
| `Organiser` | A specific person tracked across multiple events |
| `Calendar` | The booking history for a specific room |

**Value Objects** (defined by value, no independent identity):

| Value Object | Why |
|---|---|
| `TimeSlot` (= `TimeRange`) | Two `TimeSlot(9am, 11am)` objects are identical |
| `Duration` | `Duration.ofHours(2)` equals any other 2-hour duration |
| `Attendee` | Identified by email — two `Attendee("alice@e.com")` are the same |
| `RoomCapacity` | A positive integer with a constraint |
| `Location` | Two `Location("Floor 3")` are the same |

**Aggregate Roots** (control consistency of a cluster):

| Aggregate Root | Contains | Why |
|---|---|---|
| `Calendar` | `Event`s | Enforces "no double-booking" |
| `Room` | Room data | Simple entity, its own root |

**Domain Services** (span multiple aggregates):

| Service | What it does |
|---|---|
| `SchedulingService` | `findNextAvailableSlot(calendar, duration)` |

---

### Step 3 — The Ubiquitous Language Glossary

Write the glossary before any code. This is the shared vocabulary.

```
GLOSSARY — Room Scheduling System

Room
  A physical space that can be booked. Identified by its RoomId.
  Has a name (display label), location, and capacity (max people).
  INVARIANT: capacity > 0

TimeSlot (= TimeRange in code)
  A contiguous period defined by start and end timestamps.
  INVARIANT: end > start
  Two TimeSlots with identical start and end are EQUAL (value object).
  SYNONYM: time range, booking window

Event
  A booking of a room for a specific TimeSlot. Has a title, organiser,
  and attendees. Status: active or cancelled.
  INVARIANT: attendee count ≤ room capacity

Organiser
  A person responsible for an event. Identified by email address.

Calendar
  The complete booking history for one room. Enforces that no two active
  events overlap. The calendar is the ONLY way to create or cancel events.
  INVARIANT: no two active events overlap

Duration
  A length of time (always positive).
  FACTORY: Duration.ofMinutes(n), Duration.ofHours(n)

Available Slot
  A TimeSlot during which a calendar has no active events.
  PRIMARY OPERATION: SchedulingService.findNextAvailableSlot(calendar, duration, from)

Double-booking
  When two events are scheduled for the same room at overlapping times.
  DOMAIN ERROR: the Calendar prevents it.
```

---

### Step 4 — Aggregate Boundary Diagram

```
┌──────────────────────────────────────────────────────┐
│  Calendar (aggregate root)                           │
│                                                      │
│  id: string                                          │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ Event (entity, inside Calendar aggregate)    │    │
│  │                                              │    │
│  │ id:        string                            │    │
│  │ title:     string                            │    │
│  │ range:     TimeSlot (VO)                     │    │
│  │ organiser: Email (VO)                        │    │
│  │ attendees: Email[] (VO)                      │    │
│  │ status:    EventStatus                       │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  addEvent(title, range, organiser, attendees, cap)   │
│  cancelEvent(id)                                     │
│  getActiveEvents()                                   │
└──────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│ Room (aggregate)            │
│                             │
│ id:       RoomId            │
│ name:     string            │
│ location: string            │
│ capacity: number            │
└─────────────────────────────┘

    Calendar references Room by RoomId only — not by object

┌──────────────────────────────────────────────────────┐
│ SchedulingService (domain service)                   │
│                                                      │
│ findNextAvailableSlot(calendar, duration, from)      │
│ findAllAvailableSlots(calendar, duration, range)     │
└──────────────────────────────────────────────────────┘
```

**Key boundary decisions:**

1. `Event` is inside the `Calendar` aggregate — all event modifications go through
   `Calendar.addEvent()` and `Calendar.cancelEvent()`. This enforces no-overlap.

2. `Room` is a separate aggregate — `Calendar` references it by `RoomId` only.
   Room capacity is passed as a parameter to `Calendar.addEvent`.

3. `SchedulingService` is outside both aggregates — it reads from `Calendar` and
   returns `TimeRange` value objects.

---

## Step 1 — Verify the Glossary Against Existing Code

Run the tests. If everything passes, your code matches the glossary.

```bash
npm test
```

**You should see all existing tests pass.** If any test uses a term not in the glossary
(or uses a term differently), update either the glossary or the code to align them.

---

## 🎯 Challenge: Model a New Domain — Library Book Checkout

**You know:** The analysis process: rules → nouns/verbs → classify → glossary → boundaries.

**Task:** Apply the same analysis to this domain:

```
Business rules — Library Book Checkout System:

1. A book has a title, an author, and an ISBN (unique identifier).
   A library can have multiple copies of the same book (same ISBN).

2. A library member has a name and a membership number.
   Members can check out books.

3. A copy can be checked out by one member at a time.
   When checked out, it has a due date (14 days from checkout).

4. A member cannot check out more than 5 books simultaneously.

5. If a copy is overdue, the member incurs a fine: $0.25 per day overdue.

6. A member with unpaid fines cannot check out new books.
```

**Deliverables (written, not code):**

1. Noun/verb table
2. Classification of each noun (entity, value object, aggregate root)
3. A short glossary (8–12 terms)
4. An ASCII aggregate boundary diagram

---

<details>
<summary>▶ Show Solution</summary>

**1. Nouns and Verbs:**

| Noun | Classification |
|---|---|
| Book (ISBN) | Value Object — defined by ISBN |
| Copy | Entity — has state: available/checked-out/overdue |
| Member | Aggregate Root — controls checkout limit |
| Checkout | Entity, inside Member aggregate |
| Fine | Value Object — a monetary amount |
| DueDate | Value Object — a date |

**2. Classifications:**

- `Copy` — Entity (tracked by physical ID; state changes)
- `Member` — Aggregate Root (controls the "max 5 books" and "no fines" invariants)
- `Checkout` — Entity inside the Member aggregate (a record of one borrowing)
- `Book` — Value Object (no identity; defined by ISBN)
- `Fine` — Value Object (amount + reason)

**3. Glossary (excerpt):**

```
Copy
  A specific physical instance of a book.
  Status: available, checked-out, overdue.

Member
  A registered library user. Identified by membership number.
  INVARIANT: at most 5 active checkouts
  INVARIANT: cannot check out with unpaid fines

Checkout
  A record of one member borrowing one copy.
  INVARIANT: due date = checkout date + 14 days
```

**4. Aggregate boundaries:**

```
┌─────────────────────────────────────────────┐
│ Member (aggregate root)                     │
│                                             │
│ membershipNumber: string                    │
│ unpaidFines: Fine[]                         │
│                                             │
│ ┌─────────────────────────────────────┐     │
│ │ Checkout (entity, inside Member)    │     │
│ │ copyId: string  (ref by ID)         │     │
│ │ checkedOut: Date                    │     │
│ │ dueDate: Date                       │     │
│ │ returnedAt: Date | null             │     │
│ └─────────────────────────────────────┘     │
│                                             │
│ checkout(copyId, today): void               │
│ returnCopy(checkoutId, today): void         │
└─────────────────────────────────────────────┘

┌──────────────────────────────────┐
│ Copy (aggregate)                 │
│ id: string                       │
│ bookIsbn: string (ref by value)  │
│ status: 'available' | ...        │
└──────────────────────────────────┘
```

**Key insight:** `Checkout` is inside the `Member` aggregate because the "max 5 books" rule
requires seeing all of a member's checkouts atomically. If `Checkout` were a separate
aggregate, enforcing the 5-book limit would require a transaction across multiple aggregates.

</details>

---

## Final Check

| Step | What to verify |
|---|---|
| Business rules extracted | Each rule stated in plain language |
| Nouns classified | Each noun is entity, value object, or service |
| Glossary written | Each term has: definition, invariants, synonyms |
| Aggregate boundaries drawn | Clear diagram showing what is inside each root |
| Questions identified | Each boundary method answers a specific domain question |

---

## Quick Check Answers

**1. "An event has a location." Is `location` an entity or value object?**

Value object. A location is described entirely by its value (floor number, building name).
Two events on the same floor have the same location — there is no individual identity
for a location that needs to be tracked. If the location changes for an event, you replace
the value.

**2. "When a room is double-booked, send an alert." Who sends the alert?**

Neither `Room` nor `Booking`. The domain objects detect and prevent the double-booking;
sending an alert is a side effect that infrastructure handles. The `Calendar` throws a
`DoubleBookingError` domain exception. An application service catches this error and
delegates to an alert service. The domain stays pure.

**3. When adding an event, you check room availability. Does `Event` know about `Room`?**

Neither. The `Calendar` aggregate manages events for a specific room. When adding an event,
the calendar checks its own event list for overlaps. Room capacity is passed as a parameter.
Neither `Event` nor `Room` knows about the other — they are separate aggregates. `Calendar`
stores a `RoomId` (reference by ID) but has no direct dependency on the `Room` aggregate.
