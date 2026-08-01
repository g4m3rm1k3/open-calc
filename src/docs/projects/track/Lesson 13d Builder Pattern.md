# Lesson 13d: Builder Pattern

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 13a's application context.

**Terms introduced in this lesson:**

- **Builder Pattern** — constructing a complex object step by step
  through a chain of configuration calls, finalized by one explicit
  method that returns the real, usable object.

---

## Concept Unit: Builder Pattern

### The Problem

Constructing a real, running database instance needs several pieces of
configuration at once (a `Context`, the database class, a file name, and
potentially more later) — a single constructor taking every one of these
as positional parameters becomes hard to read and easy to call
incorrectly as more configuration is added over time.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
AppDatabase db = Room.databaseBuilder(appContext, AppDatabase.class, "inventory").build();
```

This is the `Builder Pattern` — **first appearance**: constructing a
complex object step by step through a chain of configuration calls,
finalized by one explicit method that returns the real, usable object.
`Room.databaseBuilder(...)` returns a builder object configured with the
application Context (Lesson 13a), the `AppDatabase` class itself, and
the database's file name; `.build()` is the final step, producing the
real, working `AppDatabase` instance only once every needed piece has
been supplied.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `Room.databaseBuilder(appContext, AppDatabase.class, "inventory")` —
   **(a) first appearance**: constructs the builder itself, configured
   with the application Context (Lesson 13a's own concept, applied here
   directly), the database class, and the file name.
2. `.build();` — **(a) first appearance**: the final step, producing the
   real `AppDatabase` instance from everything configured on the builder
   so far.

### CS Lens

`Room.databaseBuilder(...).build()` separates *configuration* from
*construction* as two genuinely distinct phases: nothing about calling
`.databaseBuilder(...)` itself produces a working database — the
builder object is inert until `.build()` runs, meaning partially-
configured state can never leak into a real, usable object by accident.
This exact shape recurs across other Android APIs going forward,
wherever an object needs several pieces of configuration before it's
safe to use at all.

Also recognized in: builder patterns across virtually every mainstream
language and framework (`StringBuilder` in Java itself, fluent builder
APIs in countless libraries), any API preferring configured, incremental
construction over one large constructor.

### SE Lens

The alternative — a single constructor taking a `Context`, a class
reference, and a file name (and potentially more configuration later) as
positional parameters — was not chosen because it becomes harder to
read and easier to call incorrectly (parameters in the wrong order) as
more configuration options are added; a builder makes each piece of
configuration explicit and named.

---

## Connect the Pieces

`Room.databaseBuilder(...).build()` is how a real database instance
actually gets constructed, once its required pieces are configured. The
next few lessons build the schema — the entities and DAOs — that this
builder call will eventually wire together.

## What Breaks Without This

A single constructor taking every configuration option as a positional
parameter becomes error-prone the moment two parameters share a type (a
class reference and a file name, say, both easy to swap by accident) —
a builder's named, chained calls remove that ambiguity.

## Exercises

1. Explain, in your own words, why `.build()` is a separate, final call
   rather than something `databaseBuilder(...)` does automatically.
2. Name one other builder-style API you've encountered (in Java or any
   other language) and describe its final, object-producing call.
3. Explain, in your own words, why a builder scales better than a large
   constructor as configuration options grow over time.

## Definition of Done

- [ ] You read the real `Room.databaseBuilder(...).build()` example and
      can explain what the Builder Pattern is.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a builder
      is preferred over one large constructor here.
