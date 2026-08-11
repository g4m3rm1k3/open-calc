# Concept: `ContentValues` and `SQLiteDatabase.insert`

**What you'll understand by the end:** how Android's real `insert` API
accepts data to write without ever building a SQL string by hand, and
why the table name and the actual values are treated so differently by
that same API.

**Prerequisites:** `sql-parameterized-queries-injection.md`,
`android-sqliteopenhelper.md`.

## Setup

A real Android project with a working `SQLiteOpenHelper` subclass and
an open, writable database.

## The Problem

`db.execSQL("INSERT INTO items (name) VALUES ('" + name + "')")` works
for an ordinary value and is a real SQL-injection vulnerability the
moment `name` contains a single quote (`sql-parameterized-queries-injection.md`
proves the general mechanism). Android needs a real API for writing a
row that never builds SQL text out of untrusted values at all.

## The Isolated Example

```java
ContentValues values = new ContentValues();
values.put("name", "Bolts");
values.put("quantity", 120);

SQLiteDatabase db = databaseHelper.getWritableDatabase();
long newId = db.insert("items", null, values);
```

Real declared signature (`SQLiteDatabase.insert`, confirmed against
official Android reference documentation): `public long insert(String
table, String nullColumnHack, ContentValues values)` — returns the new
row's `id`, or `-1` if the insert failed.

**What this proves (verified by reading the resulting `.db` file back
with the real `sqlite3` tool):** a real row lands in the table with
exactly the values passed to `put`, with no SQL text ever containing
those values directly.

## Mechanical Walkthrough

- `ContentValues` — a real, mutable key-value container purpose-built
  for describing what to write, as data, never as SQL text.
- `values.put("name", "Bolts")` — `ContentValues.put` has several real
  overloads, one per supported value type (`String`, `int`, and
  others); the correct one is chosen automatically from the argument's
  own type. Each call adds one column-name-to-value pair.
- `db.insert("items", null, values)` — the table name is a plain
  `String` argument, never concatenated into anything; `null` is a
  rarely-needed second parameter for inserting a fully empty row; the
  real `ContentValues` object carries every value to write. Android
  builds the actual parameterized SQL internally — there is no SQL
  string for a value to escape out of, because no value is ever woven
  into SQL text at all.
- The `long` return value is the new row's real, database-assigned
  `id`, or `-1` on failure — `insert` does not throw on a constraint
  violation, it returns `-1`; calling code must check for it explicitly.

## CS Lens

`ContentValues` is a concrete instance of the general parameterized-
query pattern (`sql-parameterized-queries-injection.md`): data and SQL
structure travel to the database engine through genuinely separate
channels, so there's no syntax boundary for untrusted input to escape
across — the API shape differs (a key-value container instead of a `?`
placeholder plus a tuple), but the underlying guarantee is identical.

Also recognized in: any ORM's own object-to-row mapping layer (an
entity's fields become parameterized values the same way), and web
frameworks' form-binding objects that map submitted fields to typed
values before they ever reach a database call.

## SE Lens

Why does the API accept the table name as a plain, unparameterized
`String` while requiring every *value* to go through `ContentValues`?
A table name is a fixed part of the application's own code — the
developer chooses which table to write to; it's never user-controlled
data flowing in from outside. `ContentValues` exists specifically for
the part of the statement that genuinely can originate from untrusted
input — the actual values — which is exactly what real injection
attacks target.

## Connection

Builds directly on `sql-parameterized-queries-injection.md` and
`android-sqliteopenhelper.md`. `SQLiteDatabase.update` (a separate,
related method for changing existing rows) takes the same
`ContentValues` shape, plus a `WHERE` clause and its own arguments.

## Try It Yourself

1. Call `insert` with a `ContentValues` object missing the `name` key
   entirely, against a table where `name` is `NOT NULL`. Confirm the
   real return value is `-1`, not a thrown exception — and that calling
   code checking only "did an exception happen" would silently miss
   this failure.
2. Reuse a real SQL-injection payload string
   (`x'); DROP TABLE items; --`) as the actual value passed to
   `values.put("name", ...)`. Confirm, by reading the table back, that
   it's stored as a completely ordinary, harmless row value, and the
   table itself survives — direct proof `ContentValues` neutralizes the
   exact attack a string-concatenated `execSQL` call would not.
