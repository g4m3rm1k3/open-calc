# Lesson 13f: Room `@Entity`

**What you will build:** No new code to compile — this reads real
Android/Room code directly.

**What you need to know first:** Lesson 13e's annotation-driven ORM,
Lesson 12d's primary key.

**Terms introduced in this lesson:**

- **Room `@Entity`** — a Room-managed class annotated to represent a
  database table, with one field marked as the primary key Room uses to
  generate real SQL from.

---

## Concept Unit: Room `@Entity`

### The Problem

Lesson 13e established annotation-driven ORM in general — but nothing
yet names the specific Room mechanism that turns one particular class
into one particular table, or shows how that class still needs to
identify which of its fields is the table's own primary key.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Room framework source:

```java
@Entity(tableName = "items")
public class Item {
    @PrimaryKey(autoGenerate = true)
    public int id;

    public String name;
    public int quantity;
}
```

This is Room `@Entity` — **first appearance**: a Room-managed class
annotated to represent a database table, with one field marked as the
primary key Room uses to generate real SQL from. `@Entity(tableName =
"items")` declares this exact class *is* the `items` table;
`@PrimaryKey` (Lesson 12d's own primary key concept) marks `id` as the
column guaranteeing each row's uniqueness — Room reads both annotations
at build time and generates the real table-creation code itself.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `@Entity(tableName = "items")` — **(a) first appearance**: names the
   real database table this class defines.
2. `@PrimaryKey(autoGenerate = true)` — **(b) reappearing** primary key
   concept from Lesson 12d, now expressed as a Room annotation rather
   than hand-written SQL; `autoGenerate = true` has Room assign each new
   row's `id` automatically.
3. `public String name; public int quantity;` — ordinary Java fields,
   doubling as the exact column definitions Room generates the real
   table from.

### CS Lens

`@Entity` is where annotation-driven ORM (Lesson 13e) becomes concrete:
one specific class, one specific table, with the primary key explicitly
marked rather than merely implied.

Also recognized in: entity classes across virtually every mainstream
ORM (`@Entity` in JPA/Hibernate, model classes in Django) — the same
"one annotated class defines one table" role.

### SE Lens

The alternative — a hand-written `CREATE TABLE` string kept in sync
manually with `Item`'s own fields, as Lesson 12b did directly — was not
chosen going forward because `@Entity` generates the table definition
directly from the one class Room can see, removing that synchronization
burden entirely.

---

## Connect the Pieces

`@Entity` makes `Item` the single source of truth for both the Java type
and the `items` table. The next lesson collects every operation this
table supports into one declared place.

## What Breaks Without This

A class with no `@Entity` annotation is invisible to Room entirely — it
has no corresponding table, and Room generates no table-creation code
for it at all.

## Exercises

1. Add a third field, `String category`, to `Item` and explain what
   column Room would generate for it.
2. Explain, in your own words, why `@PrimaryKey` must mark exactly one
   field, not zero and not several.
3. Explain, in your own words, why `@Entity`'s `tableName` argument is
   optional in real Room usage (Room can infer a table name from the
   class name itself) but was specified explicitly here.

## Definition of Done

- [ ] You read the real `@Entity` example and can explain what it
      declares.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why `@Entity`
      alone is not enough without a `@PrimaryKey` field.
