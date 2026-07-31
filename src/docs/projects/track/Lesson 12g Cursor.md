# Lesson 12g: `Cursor`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 12e's Iterator Pattern, Lesson
12f's `SQLiteOpenHelper`.

**Terms introduced in this lesson:**

- **`Cursor`** — an Android object representing a position within a SQL
  query's result rows, read one row at a time via `moveToNext()`, rather
  than loading every row into memory at once.

---

## Concept Unit: `Cursor`

### The Problem

Loading every single row of a very large table into memory at once, just
to read them one at a time, wastes memory the app may never need all at
once — the same "don't eagerly load everything" concern Lesson 6c's own
view-recycling material already raised for on-screen rows.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Cursor cursor = db.rawQuery("SELECT id, name, quantity FROM items", null);
while (cursor.moveToNext()) {
    int id = cursor.getInt(0);
    String name = cursor.getString(1);
    int quantity = cursor.getInt(2);
    System.out.println(id + ": " + name + ", " + quantity);
}
cursor.close();
```

This is `Cursor` — **first appearance**: an Android object representing
a position within a SQL query's result rows, read one row at a time via
`moveToNext()`, rather than loading every row into memory at once.
`cursor.moveToNext()` advances to, and loads, exactly one row at a time
— the rest of the result set stays on disk until actually requested,
the same `hasNext()`/`next()`-style shape as Lesson 12e's own Iterator
Pattern.

#### Execution Trace

Trace of the `while (cursor.moveToNext())` loop against `items`'s own
three rows from Lesson 12b:

1. `cursor.moveToNext()` — advances to the Wrench row, returns `true`;
   `getInt`/`getString` read only that one row's own three columns, and
   `1: Wrench, 12` is printed.
2. `cursor.moveToNext()` — advances to the Bolt row, returns `true`; the
   Wrench row is not re-read or kept in memory — `2: Bolt, 340` is
   printed.
3. `cursor.moveToNext()` — advances to the Hammer row, returns `true`;
   `3: Hammer, 5` is printed.
4. `cursor.moveToNext()` — no rows remain, returns `false`; the loop ends
   without ever having held more than one row's data at a time.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `db.rawQuery("SELECT ...", null)` — **(a) first appearance**: runs the
   SQL query and returns a `Cursor` positioned before the first row — no
   row data has been read into memory yet.
2. `while (cursor.moveToNext())` — **(b) reappearing** iterator-style
   shape from Lesson 12e: advances to the next row, returning `false`
   once no rows remain, ending the loop.
3. `cursor.getInt(0)`, `cursor.getString(1)`, `cursor.getInt(2)` — **(a)
   first appearance**: read the current row's columns by position, only
   for the one row currently loaded.
4. `cursor.close();` — **(b) reappearing** manual-resource-cleanup
   pattern from Lesson 12a: releases the `Cursor`'s own underlying
   resources once done.

### CS Lens

`Cursor` reads on demand instead of eagerly — the same underlying
resource-efficiency concern as lazy evaluation generally, and a concrete
Android instance of Lesson 12e's own general Iterator Pattern.

Also recognized in: database cursors in virtually every SQL client
library across languages, lazy sequences/generators in Python and other
languages.

### SE Lens

The alternative — a method returning a fully-loaded `List<Item>` of every
matching row at once — was not chosen for very large result sets because
it forces loading everything into memory immediately, even if the caller
only needs the first few rows; `Cursor` defers that cost until each row is
actually requested.

---

## Connect the Pieces

`SQLiteOpenHelper` (Lesson 12f) wires an app's schema into a real
database file; `Cursor` reads that schema's rows back out on demand, one
at a time, using the same shape Lesson 12e's Iterator Pattern already
established. The next lesson shows the real, verified cost of building
any of these queries carelessly.

## What Breaks Without This

Loading every row into a `List` instead of using `Cursor` wastes memory
on very large tables — the entire result set sits in memory even when
only the first few rows are ever actually read.

## Exercises

1. Modify the query to `SELECT id, name, quantity FROM items WHERE
   quantity > 10` and confirm the loop only prints the matching rows.
2. Explain, in your own words, why `cursor.close()` is required even
   though the loop already finished naturally.
3. Explain, in your own words, why `Cursor` is described as the "concrete
   Android instance" of the Iterator Pattern.

## Definition of Done

- [ ] You read the real `Cursor` example and can explain what
      `moveToNext()` does.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why `Cursor`
      doesn't load every row into memory at once.
