# Lesson 13i: Room `@Database`

**What you will build:** No new code to compile — this reads real
Android/Room code directly.

**What you need to know first:** Lesson 13c's abstract class, Lesson
13g's Room `@Dao`, Lesson 13h's Singleton Pattern, Lesson 13d's Builder
Pattern.

**Terms introduced in this lesson:**

- **Room `@Database`** — an abstract class wiring together a set of Room
  entities and DAOs into one real, running database instance, built via
  Room's builder.

---

## Concept Unit: Room `@Database`

### The Problem

`Item` (Lesson 13f's own `@Entity`) and `ItemDao` (Lesson 13g's own
`@Dao`) exist independently of each other until something declares
"this is the actual database, made of these entities, offering these
DAOs" and provides the one real instance the rest of the app uses.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
@Database(entities = {Item.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();
}
```

This is Room `@Database` — **first appearance**: an abstract class
wiring together a set of Room entities and DAOs into one real, running
database instance, built via Room's builder. `AppDatabase` (an abstract
class, Lesson 13c) `extends`ing Room's own `RoomDatabase` declares
`itemDao()` with no body at all — Room generates the real implementation,
returning a working `ItemDao` backed by this exact database.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `@Database(entities = {Item.class}, version = 1)` — **(a) first
   appearance**: lists every `@Entity` this database manages, and the
   schema's own version number.
2. `public abstract class AppDatabase extends RoomDatabase` — **(b)
   reappearing** abstract class from Lesson 13c, now subclassing Room's
   real `RoomDatabase` base class.
3. `public abstract ItemDao itemDao();` — **(b) reappearing** `@Dao`
   interface from Lesson 13g, declared here with no body — Room
   generates the real, working implementation.

### CS Lens

`@Database` is exactly the mix an abstract class was introduced for:
`AppDatabase` holds real, hand-written logic (Lesson 13h's own
`getInstance`) alongside a method (`itemDao()`) Room itself supplies an
implementation for — neither a plain class nor a plain interface could
express that combination.

Also recognized in: the same "one class wires together every entity and
DAO into a real database" role across virtually every annotation-driven
ORM (JPA's own `EntityManager`, Entity Framework's `DbContext`).

### SE Lens

The alternative — each part of the app opening and querying the database
file directly and independently — was not chosen because nothing would
declare, in one place, exactly which entities and DAOs together make up
"the real inventory database"; `@Database` is that one declaration, with
Room generating a real, working implementation from it, constructed via
Lesson 13d's builder and shared via Lesson 13h's singleton.

---

## Connect the Pieces

Lesson 13c's abstract class is the mix `AppDatabase` needs. Lesson 13f's
`@Entity` makes `Item` the single source of truth for both the Java type
and the database table. Lesson 13g's `@Dao` collects every operation
against that table into `ItemDao`. `@Database` wires `Item` and
`ItemDao` together into one real, declared database. Lesson 13d's
Builder Pattern actually constructs that real instance from its needed
configuration, and Lesson 13h's Singleton Pattern, wrapping that builder
call in `getInstance`, ensures it only ever runs once, with every caller
in the app sharing the exact same `AppDatabase` object afterward.

## What Breaks Without This

Without `@Database` declaring which entities and DAOs belong together,
nothing tells Room which `@Dao` interfaces are valid for which `@Entity`
classes — there is no single, real database object for the rest of the
app to actually use.

## Exercises

1. Add a second entity, `Category`, to `entities = {...}`, and explain
   what would need to change elsewhere for it to be usable.
2. Explain, in your own words, why `AppDatabase` must be an abstract
   class rather than a plain interface, connecting your answer to Lesson
   13c's own material.
3. Trace, on paper, the full chain from `AppDatabase.getInstance(context)`
   being called for the very first time, through to a working `ItemDao`
   being returned.

## Definition of Done

- [ ] You read the real `@Database` example and can explain what it
      declares.
- [ ] You completed Exercise 3.
- [ ] You can state, without looking back at this lesson, how `@Entity`,
      `@Dao`, `@Database`, the Builder Pattern, and the Singleton Pattern
      each contribute to the one real `AppDatabase` instance.
