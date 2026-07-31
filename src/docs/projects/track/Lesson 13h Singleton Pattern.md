# Lesson 13h: Singleton Pattern

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 0i's class-level state, Lesson
13d's Builder Pattern.

**Terms introduced in this lesson:**

- **Singleton Pattern** — exactly one instance of a class exists for the
  whole application's lifetime, created lazily the first time it's
  needed and reused on every subsequent request.

---

## Concept Unit: Singleton Pattern

### The Problem

`Room.databaseBuilder(...).build()` (Lesson 13d) is real, working code —
but calling it every single time the app needs the database would
construct a brand new, separate database instance each time, when
exactly one, shared instance is what the rest of the app actually needs.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();

    private static AppDatabase instance;

    public static AppDatabase getInstance(Context context) {
        if (instance == null) {
            Context appContext = context.getApplicationContext();
            instance = Room.databaseBuilder(appContext, AppDatabase.class, "inventory").build();
        }
        return instance;
    }
}
```

This is the `Singleton Pattern` — **first appearance**: exactly one
instance of a class exists for the whole application's lifetime, created
lazily the first time it's needed and reused on every subsequent
request. `instance` (Lesson 0i's own class-level state) holds the one
real database object once built; `getInstance` builds it exactly once —
the first time any caller asks — and hands back that exact same object
on every later call, no matter how many different callers ask.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `private static AppDatabase instance;` — **(b) reappearing**
   class-level state from Lesson 0i, holding the one, shared instance
   once built.
2. `if (instance == null) { ... instance = Room.databaseBuilder(...)
   .build(); }` — **(b) reappearing** builder call from Lesson 13d; runs
   only the very first time `getInstance` is ever called, since
   `instance` stays non-null on every later call.
3. `context.getApplicationContext()` — **(b) reappearing** application
   context from Lesson 13a, ensuring the singleton itself outlives any
   one Activity.
4. `return instance;` — hands back the exact same object on every call,
   after the first — proof `getInstance` never constructs a second,
   separate database.

### CS Lens

The Singleton Pattern is the formal name for a shape this course has
already used informally: exactly one instance, built once, shared by
every caller thereafter.

Also recognized in: singletons across virtually every object-oriented
language, connection pools, configuration objects, and logging
frameworks generally — anywhere exactly one shared instance is the
correct design.

### SE Lens

The alternative — constructing a fresh database instance (and a fresh
underlying database connection) every time it's needed — was not chosen
because it wastes real resources reopening the same database file
repeatedly, and risks two separate instances disagreeing about the same
underlying data; a single, shared instance guarantees every part of the
app reads and writes through the exact same connection.

---

## Connect the Pieces

`getInstance` wraps Lesson 13d's builder call so it only ever runs once,
with every caller sharing the exact same instance afterward. The next
lesson wires everything from this group — the entity, the DAO, the
builder, and this singleton shape — into one real, declared database.

## What Breaks Without This

Calling `Room.databaseBuilder(...).build()` directly, every time the
database is needed, instead of wrapping it in a singleton's
`getInstance`, constructs a separate instance (and a separate underlying
connection) each time — wasteful, and a real risk that two instances
disagree about the same data.

## Exercises

1. Explain, in your own words, what would go wrong if `getInstance`
   omitted the `if (instance == null)` check entirely.
2. Explain, in your own words, why `instance` must be `static` rather
   than an ordinary field.
3. Name one other shared, long-lived object in a typical app (besides a
   database) that would benefit from this same singleton shape.

## Definition of Done

- [ ] You read the real `getInstance` example and can explain why it
      only ever builds one instance.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a fresh
      database instance on every call would be a real problem.
