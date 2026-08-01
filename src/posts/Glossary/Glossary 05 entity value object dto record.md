# Data Containers: Entity, Value Object, DTO, Record

## What you will build

Four runnable programs — one per concept — in both Python and TypeScript,
showing four different answers to "how should this piece of data be
represented?" By the end you'll understand why a class is sometimes built
around an ID and sometimes around its values, why some objects refuse to
let you mutate them, and why data crossing a system boundary often gets
its own dedicated, deliberately simple type.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes). No TypeScript knowledge is assumed — every new syntax is
explained at the point it appears. This post stands fully alone.

## Setting up to run TypeScript

TypeScript is compiled to JavaScript before running:

```
npx tsc filename.ts
node filename.js
```

`tsc` checks your code for type errors and produces a `.js` file; `node`
runs it. A type error stops compilation entirely, before the program ever
executes.

---

## The core distinction these four concepts are built on

The single most important question this post answers is: **what makes two
pieces of data "the same"?** Different kinds of data answer this question
differently, and getting it wrong causes real bugs. Two five-dollar bills
are interchangeable — if you have one and I have one, it doesn't matter
which is "yours" and which is "mine," they're worth the same and behave
identically. But two bank accounts, even if they happen to have the exact
same balance at this exact moment, are *not* interchangeable — they have
different owners, different histories, different IDs, even if their
current numeric state matches perfectly. This distinction — "identity
matters" versus "only the values matter" — is the foundation for two of
the four concepts below, and it ripples outward into how you should design
data in any real system.

---

## Concept 1: Entity

An **Entity** is an object whose identity matters more than its current
attribute values — it has a unique identifier (usually an ID) that
persists across the object's entire lifetime, and two entities are
considered "the same" if and only if they have the same identity, even if
every other field differs.

### Python

```python
class User:
    def __init__(self, user_id, name, email):
        self.user_id = user_id
        self.name = name
        self.email = email

    def __eq__(self, other):
        if not isinstance(other, User):
            return False
        return self.user_id == other.user_id

    def __repr__(self):
        return f"User(id={self.user_id}, name='{self.name}')"
```

**Walkthrough — new syntax.** `__eq__` is another dunder method (recall
from earlier posts: double-underscore methods Python treats specially).
It defines what `==` means for this class — without it, Python's default
behavior for `==` between two objects is to check whether they are
*literally the same object in memory* (the same check `is` performs),
which is rarely what you want when comparing two separately-loaded records
representing the same real-world entity. `isinstance(other, User)` checks
whether `other` is actually a `User` (or a subclass of `User`) — guarding
against comparing a `User` to something unrelated, like a string or a
number, which should never be considered equal regardless of any other
field. `self.user_id == other.user_id` is the actual identity check: two
`User` objects are equal *only* if their IDs match — nothing else is even
examined. `__repr__` is a dunder method similar to `__str__` from the
previous post — it controls how an object is displayed when you print a
data structure containing it (like a list of `User` objects), and by
convention should look like valid Python code that could recreate the
object.

```python
user1 = User(1, "Alice", "alice@example.com")
user2 = User(1, "Alice Smith", "alice.smith@example.com")
user3 = User(2, "Alice", "alice@example.com")

print(user1 == user2)
print(user1 == user3)
```

```
True
False
```

**Walkthrough:** `user1` and `user2` have *different* names and emails —
but the same `user_id`, `1`. They compare as equal, because for an
Entity, identity is what matters, not the current values of the other
fields. `user1` and `user3` have the *same* name and email, but different
IDs — they compare as unequal. This might look backward at first glance,
but it correctly models reality: if Alice updates her name in the system
(`user1` becomes `user2`'s state after an edit), it's still the same user
account — same identity, evolved data. If two different users happen to
share the same name and email by coincidence, they are still two distinct
people.

**CS lens.** This is the foundation of how relational databases model
data: every row in a table typically has a primary key (an ID), and two
rows are "the same record" if and only if their primary keys match,
regardless of what the other columns currently say. Entities in code
mirror this directly — the `user_id` here plays the same role as a primary
key in a database table.

**SE lens.** Recognizing something as an Entity tells you a lot about how
to design around it: it needs a stable, unique identifier assigned once
(usually at creation) and never changed; equality and lookups should go
through that identifier, not through comparing every field; and the object
is expected to be *mutable* over its lifetime — a `User`'s name, email, or
other attributes can and do change over time, while the user remains "the
same user."

**What breaks without this:** If `User` relied on Python's default `==`
(identity comparison, checking if it's the same object in memory), then
loading the same user twice from a database — once for a profile page,
once for a settings page — would produce two `User` objects that Python
considers unequal, even though they represent the exact same real-world
person, simply because they're two separate objects in memory holding
identical data. Code that needs to check "is this the same user as that
one?" would silently get the wrong answer.

### TypeScript

```typescript
class User {
  constructor(
    public userId: number,
    public name: string,
    public email: string
  ) {}

  equals(other: User): boolean {
    return this.userId === other.userId;
  }
}
```

**Walkthrough — new syntax.** TypeScript (and JavaScript underneath it)
does not let you override what `==` or `===` mean for your own classes the
way Python's `__eq__` does — there is no equivalent operator-overloading
mechanism for equality. The idiomatic approach instead is to define your
own method — conventionally named `equals` — that callers must explicitly
invoke. This is a real, meaningful difference between the two languages
worth sitting with: Python lets a class redefine what a built-in operator
means; TypeScript/JavaScript does not, and instead relies on explicit
method calls for custom comparison logic.

```typescript
const user1 = new User(1, "Alice", "alice@example.com");
const user2 = new User(1, "Alice Smith", "alice.smith@example.com");
const user3 = new User(2, "Alice", "alice@example.com");

console.log(user1.equals(user2));
console.log(user1.equals(user3));

console.log(user1 === user2);
```

```
true
false
false
```

**Walkthrough:** `user1.equals(user2)` uses our explicit method and
correctly returns `true` — same ID, considered the same entity.
`user1 === user2` uses JavaScript's built-in strict equality, which for
objects checks whether both sides refer to the *exact same object in
memory* — `user1` and `user2` are two separate objects (even though they
represent, conceptually, the same entity at different points in time), so
this returns `false`. This third line is included deliberately to make the
contrast explicit: relying on `===` for entity comparison in TypeScript
would silently give the wrong answer, exactly as relying on Python's
default `==` would.

---

## Concept 2: Value Object

A **Value Object** is the opposite of an Entity in the dimension that
matters: it has no identity at all — two value objects are equal if and
only if *all* their values match, and value objects are typically
**immutable** (cannot be changed after creation; any "modification"
produces a brand new value object instead).

### Python

```python
class Money:
    def __init__(self, amount, currency):
        self._amount = amount
        self._currency = currency

    @property
    def amount(self):
        return self._amount

    @property
    def currency(self):
        return self._currency

    def __eq__(self, other):
        if not isinstance(other, Money):
            return False
        return self._amount == other._amount and self._currency == other._currency

    def add(self, other):
        if self._currency != other._currency:
            raise ValueError("Cannot add Money in different currencies")
        return Money(self._amount + other._amount, self._currency)

    def __repr__(self):
        return f"Money({self._amount}, '{self._currency}')"
```

**Walkthrough — new syntax.** `@property` is a **decorator** — recall
from the first post in this series that the term "Decorator" describes
adding behavior to an object without modifying it directly; Python's
`@property` decorator is a specific, built-in application of that idea at
the language level. Placing `@property` immediately above a method turns
that method into something accessed *like* an attribute, without
parentheses: `money.amount` instead of `money.amount()`. This is used here
specifically to expose `_amount` and `_currency` as read-only — there is no
corresponding `@amount.setter` defined, so `money.amount = 50` would raise
an `AttributeError`, enforcing immutability at the language level rather
than just by convention (the underscore-prefix convention you saw used
loosely in earlier posts).

`__eq__` here compares **every field**, unlike the Entity's `__eq__` from
above, which compared only the ID. This is the defining structural
difference between an Entity and a Value Object: equality based on
identity versus equality based on values.

`add` doesn't modify `self` — it returns a *brand new* `Money` object,
constructed from the sum. This mirrors the immutability of strings and
numbers covered earlier in this series: just as `"hello".upper()` returns
a new string rather than modifying the original, `Money.add()` returns a
new `Money` rather than mutating either operand.

```python
price1 = Money(10, "USD")
price2 = Money(10, "USD")
price3 = Money(15, "USD")

print(price1 == price2)
print(price1 == price3)

total = price1.add(price3)
print(total)
print(price1)
```

```
True
False
Money(25, 'USD')
Money(10, 'USD')
```

**Walkthrough:** `price1` and `price2` are two *separate* objects (created
by two separate calls to `Money(...)`), but they compare as equal, because
*all* their values match — `10` and `"USD"` in both cases. This is the
exact opposite behavior from Entity's `User` example, where two separate
objects with matching values but different IDs compared as unequal. Here,
there is no ID at all — values are the entirety of what `Money` *is*.
`price1.add(price3)` produces a new `Money(25, 'USD')`; afterward,
`price1` still prints as `Money(10, 'USD')`, confirming it was never
mutated.

**CS lens.** Value Objects extend the immutability concept already
covered for strings, tuples, and numbers in this series to *user-defined*
types. The benefit is the same one immutability always provides:
predictability. A `Money` value handed to another function can never be
silently changed underneath you — if you have a reference to
`Money(10, "USD")`, it will represent exactly that value for as long as it
exists, full stop.

**SE lens.** Distinguishing Value Objects from Entities is a foundational
move in a design approach called **Domain-Driven Design** (a body of
software design practice focused on modeling real business concepts
precisely in code). The practical test: "if I have two of these with
identical values, does it matter which one is which?" For money, a
shipping address (at the moment it was recorded), a date range, an RGB
color — no, it doesn't matter, any two with the same values are
interchangeable: Value Objects. For a user account, an order, a bank
account — yes, it matters, even with identical current values: Entities.

**What breaks without this:** If `Money` were mutable (allowing
`price1.amount = 999` directly), and the same `Money` instance were
accidentally shared between two parts of a program — passed by reference,
exactly like the shared-list bug from this series' lists post — then
changing it in one place would silently corrupt it everywhere else it's
referenced. Immutability eliminates this entire category of bug for values
that conceptually should never change once created.

### TypeScript

```typescript
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add Money in different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  toString(): string {
    return `Money(${this.amount}, '${this.currency}')`;
  }
}
```

**Walkthrough — new syntax.** `public readonly amount: number` — `readonly`
is a TypeScript-specific modifier that can be combined with `public` or
`private`. It declares that this property can be set once, during
construction, and never reassigned afterward. The compiler enforces this:
any later attempt to write `someMoney.amount = 50` would be a compile
error, the same enforcement Python's `@property`-without-a-setter achieved,
but expressed as a single keyword rather than a decorator pattern. This is
a meaningfully more direct way to express "this field is immutable" than
Python offers natively.

```typescript
const price1 = new Money(10, "USD");
const price2 = new Money(10, "USD");
const price3 = new Money(15, "USD");

console.log(price1.equals(price2));
console.log(price1.equals(price3));

const total = price1.add(price3);
console.log(total.toString());
console.log(price1.toString());
```

```
true
false
Money(25, 'USD')
Money(10, 'USD')
```

**What the compiler catches that's worth seeing directly:**

```typescript
const broken = new Money(10, "USD");
broken.amount = 50;
```

```
error TS2540: Cannot assign to 'amount' because it is a read-only property.
```

**Walkthrough of the failure:** The compiler statically tracked that
`amount` was declared `readonly`, and rejected the attempted reassignment
before the program ever ran — a guarantee Python's `@property` pattern only
provides at the moment the offending line actually executes (raising an
`AttributeError` at runtime), not before.

---

## Concept 3: DTO (Data Transfer Object)

A **DTO** is an object whose entire purpose is moving data across a
boundary — between layers of an application, across a network, into or out
of a database — with no behavior of its own. A DTO typically has no
methods beyond perhaps basic construction; it's pure data, shaped exactly
to match what's needed at the boundary it's crossing, often different in
shape from the internal domain objects (Entities, Value Objects) it's
derived from.

### Python

Imagine an internal `User` Entity (richer than what an API should expose
publicly — including a password hash that should never leave the server):

```python
class UserEntity:
    def __init__(self, user_id, name, email, password_hash, created_at):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at
```

When sending user data to a client over an API, you don't want to include
`password_hash` — but you also don't want every part of the codebase that
prepares API responses to remember, by convention, "don't forget to leave
out the password hash." A DTO makes the safe shape explicit and
structural:

```python
class UserDTO:
    def __init__(self, user_id, name, email):
        self.user_id = user_id
        self.name = name
        self.email = email

    @classmethod
    def from_entity(cls, entity):
        return cls(entity.user_id, entity.name, entity.email)

    def to_dict(self):
        return {
            "id": self.user_id,
            "name": self.name,
            "email": self.email,
        }
```

**Walkthrough — new syntax.** `@classmethod` is a decorator marking
`from_entity` as a **class method** — a method called on the class itself
(`UserDTO.from_entity(...)`) rather than on an existing instance. The
first parameter, conventionally named `cls` (short for "class," playing
the role `self` plays for instance methods), refers to the class itself —
here, `UserDTO`. This pattern is commonly used for alternative
constructors: ways of building an instance other than the default
`__init__`. `cls(entity.user_id, entity.name, entity.email)` calls
`UserDTO(...)` using `cls`, which works identically to writing
`UserDTO(...)` directly, but remains correct even if this class were later
subclassed — a detail not critical to understand fully right now, just
recognize the pattern. `to_dict` converts the DTO into a plain dictionary —
a format that's trivially convertible to JSON (a widely used data format
for APIs, mentioned briefly in this series' dictionaries post), which is
usually the actual final step before data leaves the server over a
network.

```python
entity = UserEntity(
    1, "Alice", "alice@example.com", "hash_xyz123", "2026-01-15"
)

dto = UserDTO.from_entity(entity)
print(dto.to_dict())
```

```
{'id': 1, 'name': 'Alice', 'email': 'alice@example.com'}
```

**Walkthrough:** Notice `password_hash` and `created_at` simply never made
it into the DTO at all — not filtered out at the last moment, but
structurally absent from `UserDTO`'s definition entirely. Anyone using
`UserDTO` cannot accidentally leak the password hash, because the type
itself doesn't have a field for it.

**CS lens.** A DTO formalizes the **boundary** between two representations
of the same underlying information — internal/complete versus
external/safe, or in-memory object versus wire format. This boundary is a
specific instance of the encapsulation concept from earlier posts: hiding
internal detail (the password hash, internal-only fields) behind a
simplified, intentional public shape.

**SE lens.** DTOs are extremely common at the edges of any system: API
request/response bodies, data read from or written to a database before
it's converted into richer domain objects, data sent between
microservices. The convention of having a `from_entity`-style method (or
its reverse, converting a DTO back into a domain object) is how codebases
keep this boundary explicit and centralized, rather than scattering
ad hoc dictionary construction (`{"id": user.user_id, "name": user.name, ...}`)
across every place an API response needs to be built.

**What breaks without this:** Without a dedicated DTO, every place in the
codebase that builds an API response would need to remember, independently,
which fields are safe to expose — and a single place that forgets and
includes `password_hash` directly is a real security vulnerability, not
just a stylistic inconsistency.

### TypeScript

```typescript
interface UserEntity {
  userId: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface UserDTO {
  id: number;
  name: string;
  email: string;
}

function toUserDTO(entity: UserEntity): UserDTO {
  return {
    id: entity.userId,
    name: entity.name,
    email: entity.email,
  };
}
```

**Walkthrough — new syntax and a real language difference.** This
TypeScript version uses `interface` for both `UserEntity` and `UserDTO`,
rather than `class`, and a plain function, `toUserDTO`, rather than a
class method. This is idiomatic in TypeScript for pure data shapes with no
behavior: when an object truly has no methods of its own — just fields —
an `interface` plus plain object literals (`{ id: ..., name: ..., email:
... }`) is more common than a full `class`. This mirrors the conceptual
definition of a DTO directly: it's *supposed* to be inert data with no
behavior, and TypeScript's `interface` enforces exactly that — interfaces
cannot have method implementations the way classes can (they can declare
that a method must exist, as seen in earlier posts, but here we're not
even doing that — `UserDTO` declares only properties, no methods at all).

```typescript
const entity: UserEntity = {
  userId: 1,
  name: "Alice",
  email: "alice@example.com",
  passwordHash: "hash_xyz123",
  createdAt: "2026-01-15",
};

const dto = toUserDTO(entity);
console.log(dto);
```

```
{ id: 1, name: 'Alice', email: 'alice@example.com' }
```

**Walkthrough:** `const entity: UserEntity = { ... }` is an **object
literal** matching the `UserEntity` interface — TypeScript checks, at
compile time, that every required field is present with the right type. If
`passwordHash` were missing, or `userId` were given as a string instead of
a `number`, this would be a compile error. `console.log(dto)` printing the
object directly (rather than calling a `.toString()` or similar) shows
Node.js's default object formatting — useful for quick inspection, though
real production code would more often call `JSON.stringify(dto)` before
actually sending it over a network.

---

## Concept 4: Record

A **Record** is a simple, immutable data object — the term overlaps
heavily with Value Object and DTO, but specifically emphasizes
*structure*: a Record is defined by its fields, has no significant
behavior, and is typically compared by value rather than identity. In
modern Python, the `dataclass` and `NamedTuple` features (and in
TypeScript, plain object types combined with `readonly`) exist
specifically to make defining this exact shape of object fast and
boilerplate-free.

### Python

So far, every class in this post has needed a hand-written `__init__`,
and the Entity and Value Object examples needed hand-written `__eq__` and
`__repr__` too. Python's `dataclass` decorator generates all of this
automatically for the common case of "this is mostly just a bundle of
fields":

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Coordinate:
    latitude: float
    longitude: float
```

**Walkthrough — new syntax.** `from dataclasses import dataclass` imports
the `dataclass` decorator from Python's built-in `dataclasses` module.
`@dataclass(frozen=True)` is applied above the class, and — given just the
field names and their types (`latitude: float`, `longitude: float`, using
the same type-annotation syntax briefly seen elsewhere in this series) —
automatically generates an `__init__` that accepts those fields as
parameters, a `__repr__` that prints them nicely, and an `__eq__` that
compares all fields (exactly the value-based equality from the Value
Object section above, but without writing it by hand). `frozen=True`
additionally makes every instance immutable — attempting to reassign a
field after creation raises an error, similar in spirit to TypeScript's
`readonly`.

```python
point1 = Coordinate(40.7128, -74.0060)
point2 = Coordinate(40.7128, -74.0060)
point3 = Coordinate(34.0522, -118.2437)

print(point1)
print(point1 == point2)
print(point1 == point3)
```

```
Coordinate(latitude=40.7128, longitude=-74.006)
True
False
```

**Walkthrough:** All of this — the readable `__repr__` output, the
value-based equality — came entirely from the `@dataclass` decorator
generating it, with zero hand-written `__init__`, `__eq__`, or `__repr__`
in the class body. This is a direct, practical payoff of recognizing
"this is just a Record": the language can generate all the boilerplate
for you once you've named the pattern.

```python
point1.latitude = 41.0
```

```
dataclasses.FrozenInstanceError: cannot assign to field 'latitude'
```

**Walkthrough of the failure:** `frozen=True` enforces immutability at
runtime — attempting to assign to any field after construction raises
`FrozenInstanceError`, a specific error type for exactly this situation.

**CS lens.** A Record formalizes "this object's entire identity is its
field values, nothing more" — the same underlying idea as Value Object,
but the term "Record" emphasizes the *structural*, data-only nature
(commonly used when describing rows in a database, entries in a file,
or simple structured data generally) rather than the *domain modeling*
nuance ("does identity matter here?") that "Value Object" emphasizes.

**SE lens.** Recognizing when a class is "just a Record" and reaching for
`@dataclass` instead of hand-writing `__init__`/`__eq__`/`__repr__` is a
genuine productivity and correctness win — every hand-written `__eq__`
is an opportunity to forget a field or introduce a subtle bug; a
generated one cannot have that class of mistake.

**What breaks without this:** Hand-writing `__init__`, `__eq__`, and
`__repr__` for every simple data class in a large codebase is repetitive
and error-prone — particularly `__eq__`, where forgetting to compare one
of several fields produces a class that silently considers two genuinely
different objects equal, a bug that's easy to introduce and hard to spot
in review.

### TypeScript

TypeScript doesn't have a direct decorator-driven equivalent to
`@dataclass` built into the language itself, but the combination of
`readonly` fields and a plain `class` (or even just an `interface` with
object literals, as in the DTO section) achieves the same practical
result:

```typescript
class Coordinate {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {}

  equals(other: Coordinate): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }

  toString(): string {
    return `Coordinate(${this.latitude}, ${this.longitude})`;
  }
}
```

**Walkthrough:** This is structurally identical to the `Money` Value
Object from earlier in this post — `readonly` fields, a value-based
`equals`, a `toString`. This is worth noticing directly: in TypeScript,
"Value Object" and "Record" tend to converge on the *exact same* code
shape, where in Python, `@dataclass` gives "Record" a distinct, more
automatic mechanism that a hand-rolled Value Object (like `Money` above)
doesn't use. The vocabulary difference between Value Object and Record is
mostly about which nuance you're emphasizing in conversation, not a hard
technical boundary in either language.

```typescript
const point1 = new Coordinate(40.7128, -74.006);
const point2 = new Coordinate(40.7128, -74.006);
const point3 = new Coordinate(34.0522, -118.2437);

console.log(point1.toString());
console.log(point1.equals(point2));
console.log(point1.equals(point3));
```

```
Coordinate(40.7128, -74.006)
true
false
```

---

## Connect the pieces

These four concepts all answer "how should this data be shaped and
compared?" but the right choice depends on the answer to one question:
**does identity matter, independent of current values?** An **Entity**
says yes — a `User` is the same user even after every field changes, as
long as the ID matches, and entities are expected to be mutable over
time. A **Value Object** says no — `Money(10, "USD")` *is* ten US dollars;
there's no meaningful difference between two separately-created instances
with the same amount and currency, and value objects are expected to be
immutable. A **DTO** sits orthogonal to this distinction entirely — its
defining feature isn't identity or values, but *purpose*: shaping data
specifically for crossing a boundary, often stripping fields that
shouldn't cross that boundary (like a password hash). A **Record** is the
structural, often language-assisted version of "this is just a bundle of
immutable values" — overlapping heavily with Value Object, but emphasizing
the mechanical shape over the domain-modeling reasoning.

In TypeScript, `readonly` gives compiler-enforced immutability directly,
where Python relies on `@property` without a setter, or `@dataclass(frozen=True)`,
to achieve the same guarantee, mostly enforced at runtime rather than
compile time.

## What breaks without these distinctions

Treating an Entity like a Value Object (comparing by every field instead of
identity) means a user who updates their name suddenly compares as "not
the same user" to code expecting consistent identity. Treating a Value
Object like an Entity (giving `Money` an ID and tracking which instance is
"the original") adds needless complexity to something that should just be
a number-plus-unit. Skipping the DTO boundary risks leaking internal-only
fields across a system boundary, sometimes with real security
consequences. Getting these distinctions right, early, in a data model
prevents a category of subtle correctness bugs that are often expensive
to untangle once a system has grown around the wrong assumption.

## Definition of done

- [ ] You can explain, in your own words, the test for whether something
      should be an Entity or a Value Object ("does identity matter
      independent of current values?").
- [ ] You can explain why `user1 == user2` returns `True` for two `User`
      objects with different names but the same ID, and why `price1 ==
      price2` returns `True` for two `Money` objects with no ID at all.
- [ ] You've run all four examples in both Python and TypeScript and
      confirmed matching output.
- [ ] You can explain what a DTO strips out and why, using the
      `password_hash` example.
- [ ] You can explain what `@dataclass(frozen=True)` generates for you in
      Python, and what `readonly` enforces in TypeScript — and why neither
      language's mechanism is identical to the other's.
- [ ] You've deliberately caused and read both the Python
      `FrozenInstanceError` and the TypeScript `TS2540` read-only
      assignment error.