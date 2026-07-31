# Lesson 12d: Primary Key

**What you will build:** No new code to compile — this reads real,
verified SQL run against a real SQLite database.

**What you need to know first:** Lesson 12c's SQL.

**Terms introduced in this lesson:**

- **Primary key** — a column (or set of columns) in a table guaranteed
  unique per row, used to unambiguously identify one specific record for
  updates or deletes.

---

## Concept Unit: Primary Key

### The Problem

Lesson 7a's `Item.equals()` compares every field — but that can't answer
"update *this exact* item" once two items could coincidentally share
every single value (two "Wrench, 12" rows, say). Something must
distinguish one specific row from every other row, independent of
whether its other data happens to match.

### Introduce the Concept in Isolation

This is not a throwaway lab in the Java sense — it's real, standard SQL,
executed this session against a real SQLite database to verify the
output:

```sql
INSERT INTO items (id, name, quantity) VALUES (1, 'Duplicate', 99);
```

Here is the real output (run against the same database as Lesson 12b,
which already has a row with `id = 1`, verified this session):

```
Error: stepping, UNIQUE constraint failed: items.id (19)
```

This is `primary key` — **first appearance**: a column (or set of
columns) in a table guaranteed unique per row, used to unambiguously
identify one specific record for updates or deletes. `id INTEGER
PRIMARY KEY` (declared in Lesson 12b) means the database itself refuses
this insert — real, verified proof the database enforces uniqueness on
`id`, not merely a convention a developer has to remember.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified SQL.

### Mechanical Walkthrough

1. `id INTEGER PRIMARY KEY` — **(b) reappearing** from Lesson 12b, now
   examined specifically for its uniqueness guarantee.
2. `INSERT INTO items (id, name, quantity) VALUES (1, 'Duplicate', 99);`
   — attempts to insert a *second* row claiming `id = 1`, already used by
   the real `Wrench` row inserted earlier.
3. The database itself rejects the insert with a real
   `UNIQUE constraint failed` error — proof the guarantee is enforced by
   the database, not merely assumed.

### CS Lens

A primary key is what makes "update/delete *this exact* row" possible at
all, regardless of whether every other column happens to match another
row — the same underlying need that motivates unique identifiers in
general (an object's own identity, Lesson 4c, versus its merely-equal
content).

Also recognized in: primary keys in every relational database engine,
unique identifier fields (`id`, UUID) in NoSQL databases and APIs
generally.

### SE Lens

The alternative — identifying a row by its full set of column values
instead of a dedicated key — was not chosen because two rows can
legitimately share every other value (two identical inventory counts);
only a value the database itself guarantees unique can reliably target
one exact row.

---

## Connect the Pieces

`id INTEGER PRIMARY KEY` guarantees each row can always be targeted
exactly, no matter what its other columns hold. The next lesson
introduces the mechanism for stepping through a sequence of results one
at a time, a shape a later lesson connects directly to a database's own
result set.

## What Breaks Without This

Without a primary key, two rows sharing identical values in every other
column would be indistinguishable — there would be no way to update or
delete just one of them without accidentally affecting the other.

## Exercises

1. Attempt this lesson's own duplicate-primary-key `INSERT` yourself and
   confirm you see the same real `UNIQUE constraint failed` error.
2. Explain, in your own words, why two rows with identical `name` and
   `quantity` values are still distinguishable, given a primary key.
3. Explain, in your own words, how a primary key connects to the
   identity-versus-equality distinction from earlier in this course.

## Definition of Done

- [ ] You ran (or read the real, verified output of) the duplicate-key
      `INSERT` and can explain what a primary key guarantees.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a primary
      key is required even when a table's other columns could
      distinguish most rows.
