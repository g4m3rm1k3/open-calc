# Junior to Senior — T4·L3 — Entity vs Value Object

**Prerequisites:** T4·L2 (What a Domain Model Is). You understand the domain layer.
This lesson introduces the two fundamental building blocks of every domain model:
entities (defined by identity) and value objects (defined by value).

**What this lab adds:**
- Entity: same identity even if data changes — a Room is the same Room after renaming
- Value Object: same value = same thing — two `TimeRange(9am, 11am)` are identical
- Immutability for value objects — why you never modify them; create new ones instead
- Invariant enforcement: the constructor is the only place to validate
- The primitive obsession smell — and when to create a value object

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have two `Event` objects with the same title, same time, and same room —
>    but different IDs. Are they the same event?
> 2. You have two `TimeRange(9am, 11am)` objects (different instances). Are they equal?
>    Does JavaScript's `===` answer this correctly?
> 3. Your function accepts `duration: number`. A caller passes `120` and you don't
>    know if it is minutes or seconds. What pattern fixes this ambiguity forever?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Updated domain objects that enforce their own invariants and use strong value types:

```ts
// Entity: identity by ID
const room1 = new Room(new RoomId('r-42'), 'Conference A', 10);
const room2 = new Room(new RoomId('r-42'), 'Conference B', 12);  // renamed
room1.equals(room2)   // → true — same identity, different data

// Value Object: identity by value
const a = TimeRange.fromHours(9, 11);
const b = TimeRange.fromHours(9, 11);
a.equals(b)           // → true — same value
a === b               // → false — different JavaScript objects
a.extendBy(30 * 60_000)   // → new TimeRange (original unchanged)

// Primitive obsession → value object
const duration = Duration.ofMinutes(120);
duration.ms       // → 7_200_000
duration.minutes  // → 120
```

---

### Concept: Entity — Defined By Identity

**What it is:** An entity is a domain object defined by its identity. Two entities
with the same data but different IDs are DIFFERENT objects. An entity's data can
change over time — but its identity does not.

**The problem before (comparing by data):**

```ts
// Without explicit identity:
const room1 = { id: 'r-42', name: 'Conference A', capacity: 10 };
const room2 = { id: 'r-42', name: 'Conference B', capacity: 12 };

room1 === room2         // false — different objects (JS reference equality)
room1.name === room2.name  // false — different names
// How do you say "these are the same room"? No clean answer.
```

**The solution:**

```ts
class Room {
  constructor(
    readonly id:       RoomId,   // the identifier — never changes
    public   name:     string,   // data — can change
    public   capacity: number,   // data — can change
  ) {}

  equals(other: Room): boolean {
    return this.id.equals(other.id);   // identity comparison
  }
}

const room1 = new Room(new RoomId('r-42'), 'Conference A', 10);
const room2 = new Room(new RoomId('r-42'), 'Conference B', 12);
room1.equals(room2)   // true — same ID → same room
```

**What it hides:** The JavaScript object identity problem. `===` compares references,
not domain meaning. An entity's `equals()` method encodes the DOMAIN meaning of equality.

**Canonical example:** A person's identity. Alice changes her name from "Smith" to "Jones."
She is still the same person. Her ID (passport number, SSN) uniquely identifies her —
the name is data that can change.

**Project Application:** `Room`, `Event`, and `User` are entities. A `Room` can be
renamed — it is still the same room (same bookings, same location). Its ID is stable.

**Smallest possible example:**

```ts
class User {
  constructor(readonly id: string, public name: string) {}

  equals(other: User): boolean {
    return this.id === other.id;
  }
}

const u1 = new User('u-1', 'Alice Smith');
const u2 = new User('u-1', 'Alice Jones');  // name changed
u1.equals(u2)   // → true — same user
```

**You will see this again in:**
- SQLAlchemy: models have primary keys (entity identity)
- Pydantic: `model.id` is the entity identifier in API responses
- Every database row has a primary key — this IS entity identity

**Watch for:** Entities in a database are identified by their primary key. In a domain
model, the entity ID should be a value object (`RoomId`), not a raw `string`. This prevents
accidentally passing a `UserId` where a `RoomId` is expected.

---

### Concept: Value Object — Defined By Value

**What it is:** A value object is a domain object defined by its value. Two value
objects with the same data are equal regardless of instance. Value objects are
immutable — you never modify them; create a new one instead.

**The problem before (using primitives for domain concepts):**

```ts
// Two different uses of 'number' that mean different things:
function scheduleEvent(
  roomId:    string,   // which room?
  startMs:   number,   // when? in milliseconds or seconds?
  endMs:     number,   // same question
  duration:  number,   // minutes? hours? milliseconds?
): void { ... }

scheduleEvent('r-1', 9, 11, 2);  // completely ambiguous — what unit?
```

**The solution:**

```ts
function scheduleEvent(
  roomId:   RoomId,    // strongly typed — can't accidentally pass a UserId
  range:    TimeRange, // self-documenting — start AND end together
  duration: Duration,  // Duration.ofHours(2) — unit is explicit
): void { ... }

scheduleEvent(
  new RoomId('r-1'),
  TimeRange.fromHours(9, 11),
  Duration.ofHours(2),
);
```

**What it hides:** The unit and validity issues. `Duration.ofMinutes(120)` stores
120 minutes internally — forever. You cannot pass `120` and wonder if it's minutes
or seconds. The factory method name carries the unit.

**The immutability rule:** `timeRange.extendBy(30 * 60_000)` returns a NEW `TimeRange`.
It does not modify the existing one. This makes sharing safe — two objects can hold the
same `TimeRange` reference without either one changing the other's data.

**Canonical example:** Money. Two $5 bills are the same value — you do not care which
specific bill you receive. But a $5 bill is not the same as €5 — different currency.
Money is a value object: `new Money(5, 'USD').equals(new Money(5, 'USD'))` is `true`.

**Project Application:** `TimeRange`, `Duration`, `Email`, and `Money` are value objects.
Two `TimeRange.fromHours(9, 11)` objects are interchangeable — no identity needed.

**Smallest possible example:**

```ts
class Celsius {
  constructor(readonly degrees: number) {
    Object.freeze(this);  // immutable
  }

  toFahrenheit(): Fahrenheit {
    return new Fahrenheit(this.degrees * 9/5 + 32);  // new object — original unchanged
  }

  equals(other: Celsius): boolean {
    return this.degrees === other.degrees;
  }
}

const a = new Celsius(100);
const b = new Celsius(100);
a.equals(b)   // → true (same value)
a === b        // → false (different JS objects)
```

**You will see this again in:**
- `frozen=True` dataclasses in Python (T5-L0e) — the Python value object pattern
- Pydantic models with `frozen=True` — immutable API schemas
- TypeScript: using `readonly` and `Object.freeze()` for immutability

**Watch for:** Mutable value objects break sharing. If you modify a `TimeRange` after
creation, every holder of that `TimeRange` sees the mutation. `Object.freeze()` in
TypeScript prevents accidental mutation.

---

### Concept: Primitive Obsession — When to Create a Value Object

**What it is:** Primitive obsession is using raw strings and numbers for domain
concepts that have their own rules. The fix: create a value object.

**Signs of primitive obsession:**
- `duration: number` — what unit?
- `email: string` — is it validated?
- `roomId: string` — could accidentally receive a `userId`

**The test for "does this need a value object?":**

1. Does it have constraints? (valid email, positive duration)
2. Does it have behaviour? (email normalisation to lowercase)
3. Would passing the wrong value be a silent bug? (passing `userId` where `roomId` expected)

If YES to any: create a value object.

**Project Application:** `Duration.ofMinutes(120)` vs `duration: number`. The value
object makes the unit explicit at the call site — forever.

**You will see this again in:**
- Money: `new Money(10, 'USD')` — no confusion about currency
- Coordinates: `new GeoPoint(lat, lng)` — no confusion about order
- Percentages: `new Percentage(0.15)` — is 0.15 the rate or 15% represented as 15?

---

## Step 1 — Build the Value Objects

Add to `src/room-id.ts`:

```ts
export class RoomId {
  constructor(readonly value: string) {
    if (!value.trim()) throw new Error('RoomId cannot be empty');
    Object.freeze(this);
  }

  equals(other: RoomId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

Add `src/duration.ts`:

```ts
export class Duration {
  private constructor(readonly ms: number) {
    if (ms <= 0) throw new Error('Duration must be positive');
    Object.freeze(this);
  }

  static ofMinutes(minutes: number): Duration {
    return new Duration(minutes * 60_000);
  }

  static ofHours(hours: number): Duration {
    return new Duration(hours * 3_600_000);
  }

  get minutes(): number { return this.ms / 60_000; }
  get hours():   number { return this.ms / 3_600_000; }

  equals(other: Duration): boolean {
    return this.ms === other.ms;
  }
}
```

Update `src/room.ts` to use `RoomId`:

```ts
import { TimeRange } from './time-range';
import { RoomId }    from './room-id';

export class Room {
  private readonly bookings: TimeRange[] = [];

  constructor(
    readonly id:       RoomId,   // ← changed from string to RoomId
    readonly name:     string,
    readonly capacity: number,
  ) {}

  book(range: TimeRange): void {
    const conflict = this.bookings.find(b => b.overlaps(range));
    if (conflict) {
      throw new Error(`Room "${this.name}" is already booked during that time`);
    }
    this.bookings.push(range);
  }

  isAvailableDuring(range: TimeRange): boolean {
    return !this.bookings.some(b => b.overlaps(range));
  }

  equals(other: Room): boolean {
    return this.id.equals(other.id);   // identity by RoomId
  }
}
```

---

## Step 2 — Write Tests

Create `src/entity-value-object.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TimeRange }             from './time-range';
import { Duration }              from './duration';
import { RoomId }                from './room-id';
import { Room }                  from './room';

describe('TimeRange (value object)', () => {

  it('two ranges with the same times are equal', () => {
    const a = TimeRange.fromHours(9, 11);
    const b = TimeRange.fromHours(9, 11);
    expect(a.equals(b)).toBe(true);
  });

  it('two ranges with different times are not equal', () => {
    const a = TimeRange.fromHours(9, 11);
    const b = TimeRange.fromHours(9, 12);
    expect(a.equals(b)).toBe(false);
  });

  it('extendBy returns a new range without modifying the original', () => {
    const original  = TimeRange.fromHours(9, 11);
    const extended  = original.extendBy(30 * 60 * 1000);  // +30 min

    expect(original.durationMs).toBe(2 * 60 * 60 * 1000);   // unchanged
    expect(extended.durationMs).toBe(2.5 * 60 * 60 * 1000); // new object
    expect(original.equals(extended)).toBe(false);
  });

});

describe('Duration (value object)', () => {

  it('Duration.ofMinutes and Duration.ofHours create equivalent durations', () => {
    expect(Duration.ofHours(2).equals(Duration.ofMinutes(120))).toBe(true);
  });

  it('throws for non-positive duration', () => {
    expect(() => Duration.ofMinutes(-1)).toThrow();
    expect(() => Duration.ofMinutes(0)).toThrow();
  });

  it('minutes property returns the duration in minutes', () => {
    expect(Duration.ofMinutes(90).minutes).toBe(90);
  });

});

describe('Room entity identity', () => {

  it('two rooms with the same id are equal regardless of other data', () => {
    const id    = new RoomId('r-42');
    const room1 = new Room(id, 'Conference A', 10);
    const room2 = new Room(id, 'Conference B', 12);  // different name/capacity
    expect(room1.equals(room2)).toBe(true);
  });

  it('two rooms with different ids are different rooms even with the same data', () => {
    const room1 = new Room(new RoomId('r-1'), 'Conference A', 10);
    const room2 = new Room(new RoomId('r-2'), 'Conference A', 10);
    expect(room1.equals(room2)).toBe(false);
  });

  it('RoomId cannot be empty', () => {
    expect(() => new RoomId('')).toThrow();
    expect(() => new RoomId('   ')).toThrow();
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ TimeRange (value object) > two ranges with the same times are equal
✓ TimeRange (value object) > two ranges with different times are not equal
✓ TimeRange (value object) > extendBy returns a new range without modifying the original
✓ Duration (value object) > Duration.ofMinutes and ofHours create equivalent durations
✓ Duration (value object) > throws for non-positive duration
✓ Duration (value object) > minutes property returns the duration in minutes
✓ Room entity identity > two rooms with the same id are equal regardless of other data
✓ Room entity identity > two rooms with different ids are different rooms
✓ Room entity identity > RoomId cannot be empty

Tests  9 passed (9)
```

**Change something:** Remove `Object.freeze(this)` from `TimeRange`. Try mutating a range:

```bash
npx tsx -e "
const { TimeRange } = await import('./src/time-range.js');
const r = TimeRange.fromHours(9, 11);
r.startMs = 0;   // attempt mutation
console.log(r.startMs);  // 0 if freeze removed — invariant violated
"
```

With `Object.freeze`, this throws `TypeError: Cannot assign to read only property`.
Without freeze, the mutation silently corrupts the value object. Restore `Object.freeze(this)`.

---

## 🎯 Challenge: Build a `Money` Value Object

**You know:** Value objects, immutability, invariant enforcement, factory methods.

**Task:** Build `Money` that represents an amount in a specific currency:

```ts
const price = new Money(1000, 'USD');   // $10.00 (amounts in cents, always integer)
const tax   = new Money(100, 'USD');
const total = price.add(tax);

total.amount    // → 1100
total.currency  // → 'USD'
```

Requirements:
- `amount` is in minor units (cents for USD/EUR) — always a non-negative integer
- `currency` is exactly 3 uppercase ASCII letters
- `add(other: Money): Money` — throws if currencies differ
- `multiply(factor: number): Money` — rounds to integer (no fractional cents)
- Constructor throws for negative amounts or invalid currency codes

Write 5 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export class Money {
  constructor(
    readonly amount:   number,
    readonly currency: string,
  ) {
    if (amount < 0)                                       throw new Error('Amount cannot be negative');
    if (!Number.isInteger(amount))                        throw new Error('Amount must be an integer');
    if (!/^[A-Z]{3}$/.test(currency))                    throw new Error('Currency must be 3 uppercase letters');
    Object.freeze(this);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add ${this.currency} and ${other.currency}`);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.currency} ${(this.amount / 100).toFixed(2)}`;
  }
}
```

**Tests:**
```ts
it('creates a valid money value', () => {
  const m = new Money(1000, 'USD');
  expect(m.amount).toBe(1000);
  expect(m.currency).toBe('USD');
});

it('throws for a negative amount', () => {
  expect(() => new Money(-1, 'USD')).toThrow();
});

it('throws for an invalid currency code', () => {
  expect(() => new Money(100, 'US')).toThrow();
  expect(() => new Money(100, 'usd')).toThrow();  // must be uppercase
});

it('adds two same-currency amounts', () => {
  const a = new Money(1000, 'USD');
  const b = new Money(500, 'USD');
  expect(a.add(b).amount).toBe(1500);
});

it('throws when adding different currencies', () => {
  const usd = new Money(1000, 'USD');
  const eur = new Money(1000, 'EUR');
  expect(() => usd.add(eur)).toThrow();
});
```

</details>

---

## Final Check

| | Entity | Value Object |
|---|---|---|
| Equality | By ID | By value (`.equals()`) |
| Mutability | Data can change; ID cannot | Immutable — create new instead |
| JavaScript `===` | Not reliable | Not reliable — use `.equals()` |
| Example | Room, User, Order | TimeRange, Email, Money, Duration |
| Invariant enforcement | Constructor (ID format) | Constructor (ALL domain rules) |

---

## Quick Check Answers

**1. Two `Event` objects, same data, different IDs. Same event?**

No. An event is an entity — defined by its identity (ID). The same meeting rescheduled
has the same ID even though the time changed. Two events with different IDs are two
different events, even if every field is identical.

**2. Two `TimeRange(9am, 11am)` objects. Are they equal? Does `===` answer this?**

They are `.equals()` equal but NOT `===` equal. JavaScript `===` compares object
references — two separate instances are different references even if all fields match.
Value objects require an explicit `.equals()` method that compares by field values.
This is why `Object.freeze()` is not enough — it prevents mutation but doesn't fix equality.

**3. `duration: number` — caller passes 120, you don't know if minutes or seconds. Fix?**

Create a value object with explicit factory methods:

```ts
class Duration {
  static ofMinutes(m: number): Duration { return new Duration(m * 60_000); }
  static ofSeconds(s: number): Duration { return new Duration(s * 1_000); }
}
```

The caller writes `Duration.ofMinutes(120)` or `Duration.ofSeconds(120)`. The unit
is encoded in the method name — no ambiguity possible. You can never confuse the two.
