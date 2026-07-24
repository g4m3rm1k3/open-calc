# Lesson 12: A Table Is Not a List — SQLite and the Relational Model

**What you will build:** Nothing that ships — this entire lesson is a
guided, throwaway detour into raw SQLite, built and then deliberately
deleted before Lesson 13 replaces it with Room. The transferable
problem: `SharedPreferences` (Lesson 11) is a fine home for one number,
but the inventory list itself — potentially hundreds of `Item`s,
needing to be searched, filtered, and queried by more than just
"give me everything" — needs a real **relational database**, and the
raw SQL API underneath it is worth seeing with your own eyes at least
once, string-typed rough edges and all, before a later lesson hides
those edges behind a friendlier tool. Understanding what Room
(Lesson 13) is actually doing for you requires having felt what it's
saving you from.

**What you need to know first:** Lesson 7 (`Item`'s fields — this
lesson models the same shape as database columns), Lesson 9 (`try`/`catch`,
since SQL operations can fail), Lesson 11 (persistent storage outliving
process memory — the same core need, met by a different, more powerful
tool this time).

---

## Concept Unit: What a Relational Database Actually Is

### The Problem

`SharedPreferences` stores flat key-value pairs — perfectly fine for
"one threshold number," useless for "find every item stored in Bin 4"
or "how many total items do I have across all locations?" Those are
*queries* over structured, repeated records — exactly what a
**relational database** is built for, and exactly what a `List<Item>`
sitting only in memory (built fresh every launch since Lesson 7) cannot
do once the app closes.

### The Concept, in Prose

A relational database organizes data into **tables** — each table a
fixed set of named, typed **columns**, and any number of **rows**, each
row one record. This should look immediately familiar: a table is the
persisted, queryable version of the exact shape `Item.java` already
gives one in-memory record. An `items` table with columns `name`,
`quantity`, `location` would hold exactly the same information as your
`List<Item>` — just durable, and searchable with a query language
(SQL) instead of a Java loop.

Every table conventionally has a **primary key** — a column (or set of
columns) guaranteed unique per row, used to unambiguously identify one
specific record for updates or deletes. Nothing about `Item.java` has
had one yet — `equals()` from Lesson 7 compares every field, which
doesn't help you say "update *this exact* item's quantity" once two
items could coincidentally share a name. A database table needs a
real, stable identifier — typically a simple auto-incrementing integer
the database itself assigns, unrelated to any of the item's actual
data.

### CS Lens

This is the **relational model** — data organized as sets of tuples
(rows) conforming to a fixed schema (columns), queried declaratively
rather than by manually walking a data structure. Also recognized in:
every SQL database engine (SQLite, PostgreSQL, MySQL), spreadsheet
software (a sheet is a table; a row a record), and even a CSV file with
a header row, which is a table in its most stripped-down form.

---

## Concept Unit: `SQLiteOpenHelper` — a Throwaway Look at the Raw API

### The Problem

Time to see this for real, with actual Android code. This entire
Concept Unit is a lab, larger than the ones in previous lessons because
the "minimum surrounding code needed to run it" for a database
genuinely requires a full helper class — but it follows the same rule:
built, run, understood, then deleted.

### Introduce the Concept in Isolation

Create a throwaway file, `ScratchDbHelper.java`, inside the project
(it needs a real Android `Context`, so it can't run as plain `javac`
the way earlier labs did — it runs inside the app, once, then is
deleted):

```java
package com.yourname.pocketinventory;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class ScratchDbHelper extends SQLiteOpenHelper {
    ScratchDbHelper(Context context) {
        super(context, "scratch.db", null, 1);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE scratch_items (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "name TEXT, " +
                "quantity INTEGER)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS scratch_items");
        onCreate(db);
    }
}
```

Temporarily add this to `InventoryActivity.onCreate`, after the
existing setup:

```java
ScratchDbHelper dbHelper = new ScratchDbHelper(this);
SQLiteDatabase db = dbHelper.getWritableDatabase();

ContentValues values = new ContentValues();
values.put("name", "Test Widget");
values.put("quantity", 42);
db.insert("scratch_items", null, values);

Cursor cursor = db.rawQuery("SELECT name, quantity FROM scratch_items", null);
while (cursor.moveToNext()) {
    String name = cursor.getString(0);
    int quantity = cursor.getInt(1);
    android.util.Log.d("ScratchDb", name + ": " + quantity);
}
cursor.close();
db.close();
```

Run the app. Logcat prints `Test Widget: 42`. Run the app a **second**
time (without uninstalling): Logcat now prints `Test Widget: 42` twice
— proof the row genuinely persisted across separate app launches, on
disk, exactly the durability Lesson 11 established `SharedPreferences`
provides for a single value, now demonstrated for structured, tabular
data.

### The Execution Trace

The `while (cursor.moveToNext())` loop, made concrete for two rows
(after running the app twice, per above):

```
Iteration 1: moveToNext() → true, cursor now on row 0
             getString(0) → "Test Widget", getInt(1) → 42
             Log: "Test Widget: 42"
Iteration 2: moveToNext() → true, cursor now on row 1
             getString(0) → "Test Widget", getInt(1) → 42
             Log: "Test Widget: 42"
Iteration 3: moveToNext() → false, loop ends
```

### Discard the Throwaway Example

Delete `ScratchDbHelper.java` entirely, and remove the temporary block
from `InventoryActivity.onCreate`. Neither appears in the real project
again — Lesson 13 replaces this whole raw-SQL approach with Room, built
from scratch as the project's real, permanent persistence layer.
(Optionally, uninstall and reinstall the app to also clear
`scratch.db` off the emulator's disk, though this isn't required for
the lesson.)

### Mechanical Walkthrough
- `extends SQLiteOpenHelper` — **first appearance.** The framework's
  base class for managing a SQLite database's lifecycle — creation,
  and version upgrades — same "must extend the framework's class"
  pattern as `AppCompatActivity` (Lesson 2) and `RecyclerView.Adapter`
  (Lesson 6), different base class again.
- `super(context, "scratch.db", null, 1)` — reappearing (parent
  constructor call pattern, Lesson 6's `ViewHolder`), new arguments: a
  `Context`, the database's on-disk filename, a `null` (an optional
  advanced `Cursor` factory, unused here), and a **schema version
- number** — first appearance, explained by `onUpgrade` next.
- `onCreate(SQLiteDatabase db)` — **first appearance**, a different
  method from `Activity.onCreate` despite the same name (Java allows
  same-named methods on unrelated classes; there's no conflict since
  they're called by entirely different framework machinery) — called
  automatically, exactly once, the very first time this database file
  is opened and doesn't yet exist on disk.
- `db.execSQL("CREATE TABLE scratch_items (...)")` — **first
  appearance of SQL itself** inside this curriculum. `execSQL` runs any
  SQL statement that doesn't return rows. `CREATE TABLE`, column names,
- and types (`INTEGER`, `TEXT`) are SQL syntax, not Java — worth
  flagging plainly as an entirely different language embedded as a
  string.
- `id INTEGER PRIMARY KEY AUTOINCREMENT` — **first appearance**, the
  concrete realization of the "primary key" concept from the previous
  unit: SQLite assigns and increments this column's value automatically
  on every insert; you never set it yourself.
- `onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion)` —
  **first appearance.** Called automatically if the app is reinstalled
  or updated with a *higher* version number than the one passed to
- `super(...)` above (here, `1`) than what's already on the device —
  this project's throwaway version just destroys and rebuilds the table,
  which is fine for scratch data but would delete a real user's
  inventory in production; correctly migrating a real schema (adding a
  column without losing data) is real, nontrivial work — flagged here,
  properly handled by Room's own migration system, out of scope for
  this throwaway lab.
- `dbHelper.getWritableDatabase()` — **first appearance.** Returns the
  actual `SQLiteDatabase` object to run operations against, triggering
  `onCreate`/`onUpgrade` internally if needed, the first time it's
  called.
- `new ContentValues()` — **first appearance.** A `Map`-like
  string-keyed container (the same conceptual shape as `Bundle`, Lesson
  5/8) purpose-built for describing one row's column values before an
  insert or update.
- `values.put("name", "Test Widget")` / `values.put("quantity", 42)` —
  **first appearance**, `ContentValues.put`, overloaded like
  `Intent.putExtra` (Lesson 8) across types.
- `db.insert("scratch_items", null, values)` — **first appearance.**
  Table name, an optional "nullColumnHack" (a SQLite quirk for
- inserting an all-default row — irrelevant here, always `null` in
  practice), and the `ContentValues` to insert.
- `db.rawQuery("SELECT name, quantity FROM scratch_items", null)` —
  **first appearance.** Runs a raw `SELECT` SQL string and returns a
- `Cursor` — an object representing a *position within* the result
  rows, not the rows themselves loaded all at once (worth connecting
  back to Lesson 6's opening lab: this is the framework's own version
  of "don't eagerly load everything you don't need yet").
- `cursor.moveToNext()` — **first appearance.** Advances the cursor to
- the next row and returns `true`, or `false` once there are no more —
  the loop condition itself, driving the execution trace above.
- `cursor.getString(0)` / `cursor.getInt(1)` — **first appearance.**
  Reads a column's value at the cursor's *current* row, by **integer
- position** in the `SELECT` clause — `0` for `name` (listed first in
  the query), `1` for `quantity` (listed second). This positional,
  stringly-untyped access is the exact rough edge the next unit names
  directly.
- `cursor.close()` / `db.close()` — **first appearance.** Both hold
  real OS resources (open file handles, database locks) that must be
  released explicitly — unlike ordinary Java objects, letting these go
  out of scope without closing them is a real resource leak, not just
  wasted memory.

### CS Lens

`Cursor`'s row-at-a-time traversal, driven by `moveToNext()`, is the
same **iterator pattern** any `for`-each loop over a `List` uses
internally, just implemented against a database result set instead of
an in-memory collection — and the same "don't materialize everything
up front" idea from `RecyclerView`'s ViewHolder recycling (Lesson 6)
and `LayoutInflater`'s on-demand row inflation. Also recognized in: file
I/O read-line-at-a-time APIs, generator functions in Python, and
paginated REST API responses fetched one page at a time.

### SE Lens

**Why does this raw API feel this rough — string SQL, positional
column indices, manual open/close?** This *is* the honest, low-level
API SQLite (and most databases) expose: fast, powerful, and
close to the metal, at the direct cost of zero compile-time safety.
Every one of these is a real, silent-failure-shaped risk: misspell
`"quntity"` in `execSQL`'s `CREATE TABLE`, and it compiles fine — the
error only appears at runtime, the first time that column is queried.
Swap `cursor.getString(0)` and `cursor.getInt(1)`'s order by accident,
and it also compiles fine, silently returning wrong-typed or garbled
data. And building a query string via ordinary string concatenation
with untrusted input (not shown here, deliberately) opens the door to
**SQL injection** — a user-supplied string containing SQL syntax
altering the query's actual meaning, one of the most common real-world
security vulnerabilities in software history. None of these are
`SQLite`'s fault specifically — they're the cost of a stringly-typed
API with no compiler in the loop, and they are exactly what Lesson 13's
Room fixes, by generating this same underlying SQL from checked Java
annotations instead of hand-written strings.

---

## Connect the Pieces

This lesson has no persistent artifact of its own by design — the
trace that matters is conceptual: an `Item` (Lesson 7) maps naturally
onto a table row, its fields onto typed columns, and "keep this beyond
the current process" (Lesson 11's core problem) has a much more capable
answer here than a single `SharedPreferences` key ever could — full
queries, not just "read this one value back." You watched a row survive
two separate app launches (`db.insert` once, then `SELECT` finding it
again after a full relaunch), and you watched, directly, every rough
edge of doing this by hand: string SQL, positional column reads, manual
resource cleanup. Lesson 13 keeps the destination — a real SQLite
database, unchanged underneath — and replaces this entire raw path.

## What Breaks Without This

In the (still-present, not yet deleted) scratch code, deliberately swap
`cursor.getString(0)` and `cursor.getInt(1)` to `cursor.getInt(0)` and
`cursor.getString(1)` — reading the columns in the wrong order relative
to how the `SELECT` clause listed them. Run it and read the actual
crash (a type-mismatch exception from the `Cursor`, or garbled/wrong
output depending on the exact type coercion SQLite attempts) — a real,
concrete instance of the "no compiler in the loop" cost named above.
This is exploration, not a "restore afterward" step — the whole file is
being deleted at the end of this unit regardless.

## Exercises

1. Before deleting the scratch code, add a second `execSQL` call inside
   `onCreate` that also creates a `scratch_locations` table
   (`id`, `name`) and manually insert a row referencing an item's
   location by name (not by a proper foreign key — SQLite supports
   them, but wiring one up by hand here is intentionally left as
   friction you can feel, not solve, in this throwaway lab).
2. Open a terminal and locate the actual `scratch.db` file on the
   emulator's filesystem via Android Studio's **Device File Explorer**
   (`View → Tool Windows → Device File Explorer`, then
   `data/data/com.yourname.pocketinventory/databases/`) — confirm a
   real binary SQLite file exists on simulated disk, the literal thing
   `getWritableDatabase()` was writing into the whole time.

## Definition of Done

- [ ] You ran the raw `SQLiteOpenHelper` lab, inserted a row, queried
      it back, and watched it survive a full app relaunch.
- [ ] You can explain, in your own words, what a table, a column, a
      row, and a primary key are, connecting them back to `Item.java`'s
      fields.
- [ ] You broke the `Cursor` column-order on purpose and saw the real
      failure.
- [ ] You located the actual `.db` file on the emulator's filesystem.
- [ ] `ScratchDbHelper.java` and the temporary block in
      `InventoryActivity` are both deleted — nothing from this lesson
      remains in the project.
- [ ] Commit: message explaining why (e.g. "No production change this
      lesson — explored raw SQLiteOpenHelper as a throwaway lab before
      Room replaces it in Lesson 13, so the tradeoffs Room resolves are
      felt firsthand first").

Lesson 13 is next: replacing every field and quantity in the inventory
list's in-memory `ArrayList` with Room — real persistence, no more raw
SQL strings, and the actual, permanent fix for everything Lesson 11 and
this lesson's throwaway lab both pointed toward.
