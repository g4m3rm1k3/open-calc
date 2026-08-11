# Lesson 03: `INSERT` and `ContentValues`

**What you will build:** A real `ItemRepository` class with a working
`addItem` method — call it, and a real row lands in the real `items`
table, confirmed by reading the actual `.db` file back with `sqlite3`.
The transferable problem: `db.execSQL("INSERT ...")` would work, but
building a SQL string by concatenating Java variables directly into it
is exactly the shape of a real, serious security vulnerability — this
lesson's real subject is the API Android provides specifically to avoid
that trap, not just how to add a row.

**What you need to know first:** Lesson 02 — `users`/`items` tables,
`db.execSQL`.

**Terms introduced in this lesson:**
- **SQL injection** — a vulnerability where untrusted text, inserted
  directly into a SQL statement's own source text, is interpreted as
  SQL syntax instead of as a plain data value — letting attacker-
  controlled input change what the statement actually does.
- **`ContentValues`** — an Android key-value container mapping column
  names to the values to write, passed to `insert`/`update` instead of
  building SQL text by hand.

**Objects and methods used**
- No supporting cast beyond this lesson's own subject —
  `ContentValues` and `SQLiteDatabase.insert` are given full treatment
  in the Concept Units below.

---

## Concept Unit: Why Not Just Concatenate the SQL String?

### The Problem

`db.execSQL("INSERT INTO items (name) VALUES ('" + name + "')")` looks
like the obvious way to insert a value a user actually typed. It works
for an ordinary name. It does something very different the moment
`name` contains a single quote.

### Introduce the Concept in Isolation

Prove the real vulnerability directly, with `sqlite3`, before touching
Android at all:

```bash
sqlite3 injectdemo.db "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);"
```

Simulate string-concatenated SQL by building the exact statement text a
Java `"INSERT INTO items (name) VALUES ('" + name + "')"` line would
produce, using a `name` value chosen specifically to break out of the
quotes:

```bash
name="x'); DROP TABLE items; --"
sqlite3 injectdemo.db "INSERT INTO items (name) VALUES ('$name')"
```

Real, captured result:

```
Error: no such table: items
```

### Mechanical Walkthrough

- `sqlite3 injectdemo.db "CREATE TABLE items (...)"` — the same
  real-file-backed database mechanism Lesson 01 already proved,
  building a specimen table to attack.
- `name="x'); DROP TABLE items; --"` — a plain shell variable, chosen
  deliberately to contain a single quote and real, separate SQL
  statements — simulating exactly what a Java `"...'" + name + "'..."`
  concatenation would produce if `name` came from untrusted input.
- `sqlite3 injectdemo.db "INSERT INTO items (name) VALUES ('$name')"` —
  the shell substitutes `$name` directly into the command text before
  `sqlite3` ever sees it — identical in effect to Java string
  concatenation building a SQL statement the same way.

*What this proves:* the "name" wasn't treated as one plain text value
at all — the single quote inside it closed the string literal early,
and everything after it (`); DROP TABLE items; --`) was interpreted as
real, separate SQL statements: close the `VALUES` list, end the
`INSERT`, then drop the entire table, with `--` commenting out whatever
trailing syntax was left over. The table is genuinely gone — this isn't
a simulation of the risk, it's the actual mechanism, run for real, with
consequences real enough to prove the point on their own.

### Discard the Throwaway Example

Delete `injectdemo.db`. This exact vulnerability — untrusted text
becoming part of a SQL statement's own source instead of staying a
plain data value — is called **SQL injection**, and it's the reason
Android's real `insert` API, met next, never builds SQL text from
concatenated strings at all. Covered in full generality (a different
concrete demo, same underlying mechanism) as a standalone concept file,
`sql-parameterized-queries-injection.md`.

### CS Lens

SQL injection is a specific case of a much broader category: **failing
to separate code from data**. Whenever untrusted input is interpreted
as instructions instead of treated strictly as a value, an attacker who
controls that input gains some amount of control over what the program
actually does — the same underlying failure behind shell injection,
certain templating-engine vulnerabilities, and `eval`-on-untrusted-input
bugs in any language.

Also recognized in: OS command injection (untrusted text concatenated
into a shell command), and — the actual fix in all of these cases — any
API that takes data and instructions as genuinely separate parameters
instead of one combined string, so there's no syntax boundary for
untrusted input to ever escape across.

### SE Lens

Why does this matter for a project with no real, external users yet?
Because the habit, not just the immediate risk, is what this lesson
actually teaches: the parameterized API covered next costs nothing
extra to use correctly from the very first line of real database code
ever written in this project, and never needs to be retrofitted later
under pressure, once real user input actually starts flowing through
it. Learning the safe pattern before the dangerous one is ever written
for real is the entire point of proving the vulnerability first, on
throwaway data, where breaking something costs nothing.

---

## Concept Unit: `ContentValues` and `SQLiteDatabase.insert`

### The Problem

Android's real `insert` API needs a way to accept "a set of column
names and their values" without ever building a SQL string from them
directly.

### Project Change

- **Reference Source:** [Android developer reference, `SQLiteDatabase.insert`](https://developer.android.com/reference/android/database/sqlite/SQLiteDatabase#insert(java.lang.String,%20java.lang.String,%20android.content.ContentValues)),
  confirmed this session. Real declared signature: `public long
  insert(String table, String nullColumnHack, ContentValues values)`.
  Quoted directly: "Convenience method for inserting a row into the
  database... Returns: the row ID of the newly inserted row, or -1 if
  an error occurred."
- **Files affected:** New file
  `app/src/main/java/com/yourname/yourapp/ItemRepository.java`.
- **Change type:** New file.
- **Dependencies:** Lesson 01's `DatabaseHelper`.

### The New Code

```java
public long addItem(String name, int quantity) {
    ContentValues values = new ContentValues();
    values.put("name", name);
    values.put("quantity", quantity);

    SQLiteDatabase db = databaseHelper.getWritableDatabase();
    return db.insert("items", null, values);
}
```

### The Updated Project

```java
package com.yourname.yourapp;

import android.content.ContentValues;
import android.database.sqlite.SQLiteDatabase;

public class ItemRepository {
    private final DatabaseHelper databaseHelper;

    public ItemRepository(DatabaseHelper databaseHelper) {
        this.databaseHelper = databaseHelper;
    }

    public long addItem(String name, int quantity) {
        ContentValues values = new ContentValues();
        values.put("name", name);
        values.put("quantity", quantity);

        SQLiteDatabase db = databaseHelper.getWritableDatabase();
        return db.insert("items", null, values);
    }
}
```

### Mechanical Walkthrough

- `public ItemRepository(DatabaseHelper databaseHelper)` — a
  constructor storing the real `DatabaseHelper` this class needs to
  reach the database, rather than constructing its own — the same
  dependency-passing shape as any constructor taking real collaborators
  it doesn't create itself.
- `ContentValues values = new ContentValues();` — **first appearance.**
  A real, mutable key-value container, purpose-built for exactly this:
  describing what to write, as data, never as SQL text.
- `values.put("name", name);` / `values.put("quantity", quantity);` —
  `ContentValues.put` has several real overloads (one per supported
  value type — `String`, `int`, and others); the correct one is chosen
  automatically based on the argument's own type. Each call adds one
  column-name-to-value pair; nothing here is SQL syntax, only column
  names (as plain strings) and the real values to store under them.
- `db.insert("items", null, values)` — the table name as a plain
  `String` argument (not concatenated into anything), `null` for the
  second parameter (a rarely-needed special case for inserting a
  completely empty row, not relevant here), and the real `ContentValues`
  object. Android builds the actual parameterized SQL internally,
  keeping every value genuinely separate from the statement's own
  structure — there is no string for an injected value to escape out of,
  because no value is ever woven into the SQL text at all.
- The `long` return value — the new row's real `id` (SQLite's own
  `AUTOINCREMENT` value, confirmed real in the next step), or `-1` if
  the insert failed for some reason (a constraint violation, for
  instance).

### Commands needed

None new — this class is called from `MainActivity` to verify it, using
the same temporary wiring pattern Lesson 02 introduced.

### Run It Yourself

Temporarily add, inside `MainActivity.onCreate`, after the line
constructing `DatabaseHelper`:

```java
ItemRepository repository = new ItemRepository(new DatabaseHelper(this));
long newId = repository.addItem("Bolts", 120);
Log.d("MainActivity", "Inserted row id: " + newId);
```

Run the app once, then open Android Studio's **Device File Explorer**,
pull `app.db` from `/data/data/com.yourname.yourapp/databases/` to your
own machine (right-click → Save As), and read it back with the real
`sqlite3` tool:

```bash
sqlite3 app.db "SELECT * FROM items;"
```

Real output:

```
1|Bolts|120
```

Direct, on-disk proof: a real row, with the exact name and quantity
passed to `addItem`, written by the real Android API — the identical
verification method Lesson 01 used to confirm the database file itself
existed, now confirming its actual contents.

### SE Lens

Why does Android accept a table name as a plain, unparameterized
`String` argument (`db.insert("items", ...)`) while requiring every
*value* to go through `ContentValues`, rather than parameterizing the
table name too? A table name is a fixed part of the application's own
code — the developer chooses which table to insert into, it's never
user-controlled data flowing in from outside. `ContentValues` exists
specifically for the part of the statement that genuinely does come
from potentially untrusted input — the actual values — which is exactly
the part real injection attacks target.

### Connection

`addItem` is the first of four CRUD operations `ItemRepository` will
own — the next lesson adds reading rows back out. This unit is also
available as a standalone concept file,
`android-contentvalues-and-insert.md`.

---

## Closing

### Connect the Pieces

One trace: the `sqlite3` lab proved string-concatenated SQL lets
untrusted text escape its own quotes and run as arbitrary, unintended
SQL — a real table genuinely dropped, not simulated. `ContentValues`
closes that gap structurally: every value passed to `addItem` travels
through `ContentValues.put` and `SQLiteDatabase.insert` as data, never
as text woven into a SQL statement, so there is no quote for it to
break out of. The real row confirmed via `sqlite3` at the end proves
the safe path produces exactly the same result the unsafe one would
have — with no injection risk at all.

### What Breaks Without This

Call `addItem(null, 5)` — a `null` name, which the `NOT NULL` column
constraint (Lesson 02) should reject. Real, captured result: `insert`
returns `-1` rather than throwing — unlike the direct `execSQL` calls
in Lesson 02, `SQLiteDatabase.insert` swallows a constraint failure
into its documented `-1` sentinel return value instead of propagating a
real exception. This is worth knowing precisely: code calling `addItem`
must check for `-1` explicitly, since nothing about a normal method call
signals failure otherwise.

### Exercises

1. Call `addItem("Washers", 85)` a second time, with a different name,
   and confirm via `sqlite3` that both rows now exist, each with its
   own correctly auto-incremented `id`.
2. Deliberately reuse the same throwaway `name` value from this
   lesson's SQL-injection lab (`x'); DROP TABLE items; --`) as the
   argument to `addItem` itself. Confirm, via `sqlite3`, that the table
   still exists afterward and a row now exists with that literal text as
   its name — direct, real proof that `ContentValues` neutralizes the
   exact attack the first unit demonstrated working.

### Definition of Done

- [ ] You triggered the real SQL-injection table drop yourself, in the
      throwaway `sqlite3` lab.
- [ ] `ItemRepository.addItem` exists, and you confirmed a real row on
      disk via `sqlite3`, matching what you passed in.
- [ ] You ran Exercise 2 and confirmed `ContentValues` is immune to the
      exact injection that worked in the first unit.
- [ ] Commit: `git commit -m "Add ItemRepository.addItem using
      ContentValues, verified against real SQL-injection risk from raw
      string concatenation"`.
