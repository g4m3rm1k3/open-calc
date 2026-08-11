# Lesson 02: `CREATE TABLE` and a Schema That Matches the Model

**What you will build:** Real SQL running for real inside
`DatabaseHelper.onCreate` — two tables, `users` and `items`, designed
deliberately rather than improvised in the moment. The transferable
problem: a table's structure is far more expensive to change once real
user data already depends on it than it is to get right before any data
exists — a column that should have rejected empty values, or a
duplicate that should have been impossible, are the kind of mistakes
that are trivial to prevent up front and genuinely painful to fix later
without losing data.

**What you need to know first:** Lesson 01 — `SQLiteOpenHelper`,
`onCreate`, and a database file's own persistence.

**Terms introduced in this lesson:**
- **Column constraint** — a rule attached to one column, checked by the
  database itself on every write, that a value must satisfy to be
  accepted at all (`NOT NULL`, `UNIQUE`, and others).
- **`UNIQUE` constraint** — guarantees no two rows can ever share the
  same value in that column; an `INSERT` that would violate it fails
  outright rather than silently succeeding with a duplicate.
- **`DEFAULT`** — a value a column receives automatically when an
  `INSERT` doesn't specify one for it, rather than leaving it undefined
  or forcing every insert to always name every column.
- **Primary key** — the column (or columns) that uniquely identifies
  each row in a table; every other table's foreign keys, and every
  direct row lookup, refer back to it.

**Objects and methods used**
- `SQLiteOpenHelper` — the framework base class managing a SQLite
  database file's own creation and version upgrades — and `onCreate` —
  the lifecycle method it calls exactly once, the first time the
  database file doesn't yet exist — both taught in Lesson 01, reappear
  here unchanged, now with real SQL inside the method body.
  `SQLiteDatabase.execSQL(String)` — a method that runs one SQL
  statement with no result rows expected (the right tool for `CREATE
  TABLE`, as opposed to a method that returns query results) — full
  treatment below, since this is its first real use.

---

## Concept Unit: Designing Two Tables Before Writing Any SQL

### The Problem

`android-ui-foundations`' login screen checks a username and password
against nothing real; its grid displays a hardcoded, in-memory list.
Both need a real table behind them — and getting each column's type and
constraints right the first time avoids a real, common failure: a
`users` table that allows two accounts with the same username, or an
`items` table that allows a row with no name at all.

### Introduce the Concept in Isolation

Prove the real constraint behavior directly with `sqlite3`, before
writing a single line of Android code:

```bash
sqlite3 schema_demo.db "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL);"
sqlite3 schema_demo.db "INSERT INTO users (username, password_hash) VALUES ('alice', 'x');"
sqlite3 schema_demo.db "INSERT INTO users (username, password_hash) VALUES ('alice', 'y');"
```

Real, captured output — the second `INSERT`:

```
Error: stepping, UNIQUE constraint failed: users.username (19)
```

*What this proves:* `UNIQUE` on the `username` column isn't a
suggestion or something the app has to remember to check — the database
itself rejected the second `alice` outright, at the moment of the
attempted write, before the row could ever exist. No application code
ran at all to prevent this; the schema itself made the duplicate
impossible.

### Discard the Throwaway Example

Delete `schema_demo.db`. The two real `CREATE TABLE` statements it
proved are what `DatabaseHelper.onCreate` runs for real, next.

### Mechanical Walkthrough

- `CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL)`
  — `id` is the **primary key**, auto-assigned; `username` must be
  present (`NOT NULL`) and can never repeat (`UNIQUE`); `password_hash`
  must be present — never a plain-text password column, covered fully
  once account creation is real (Lesson 06).
- `INSERT INTO users (username, password_hash) VALUES ('alice', 'x')`
  — the first insert, succeeds, since no other row holds `'alice'` yet.
- The second, identical-username `INSERT` — the database checks the
  `UNIQUE` constraint on `username` at write time and rejects it,
  producing the real captured error above.

### CS Lens

A constraint checked by the database itself, on every write, regardless
of which application code performed that write, is a form of
**invariant enforcement at the data layer** — the guarantee holds even
if a future bug, or a completely different program with access to the
same file, tries to violate it, rather than depending on every caller
remembering to check first.

Also recognized in: a relational database's `FOREIGN KEY` constraints
(a later lesson's subject once a second related table exists), a
type system rejecting an invalid value at compile time instead of
runtime, and any API that validates at its own boundary rather than
trusting every caller to have already validated.

### SE Lens

Why enforce `UNIQUE`/`NOT NULL` in the schema at all, instead of just
checking in Java before every `INSERT` ("does a user with this name
already exist?")? Because a schema-level constraint is checked exactly
once, in exactly one place, no matter how many different screens or
future code paths eventually insert a row — an application-level check
has to be remembered and correctly repeated at every single call site
that writes to the table, forever, and a single missed call site is a
real, silent data-integrity bug. The schema constraint can't be
forgotten, because it isn't optional application logic at all.

### Connection

The next unit runs these exact `CREATE TABLE` statements from inside
`onCreate`, making them part of the real, running project.

---

## Concept Unit: Running Real SQL From `onCreate`

### The Problem

Lesson 01 left `onCreate` empty. The schema just designed and proven
above needs to actually run, exactly once, the first time the app's
database file is created.

### Project Change

- **Reference Source:** [Android developer reference, `SQLiteDatabase.execSQL`](https://developer.android.com/reference/android/database/sqlite/SQLiteDatabase#execSQL(java.lang.String)),
  confirmed this session. Quoted directly: "Execute a single SQL
  statement that is not a query. For example, `CREATE TABLE`, `DELETE`,
  `INSERT`, etc... It has no means to return any data (such as the
  number of affected rows)."
- **Files affected:** `DatabaseHelper.java`, from Lesson 01.
- **Change type:** Fill in the previously-empty `onCreate` body.
- **Location:** Inside `onCreate(SQLiteDatabase db)`.
- **Dependencies:** Lesson 01's `DatabaseHelper` class.

### The New Code

```java
db.execSQL("CREATE TABLE users (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "username TEXT NOT NULL UNIQUE, " +
    "password_hash TEXT NOT NULL)");

db.execSQL("CREATE TABLE items (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "name TEXT NOT NULL, " +
    "quantity INTEGER NOT NULL DEFAULT 0)");
```

### The Updated Project

```java
package com.yourname.yourapp;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "app.db";
    private static final int DATABASE_VERSION = 1;

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE users (" +                          // ← new
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +                // ← new
            "username TEXT NOT NULL UNIQUE, " +                       // ← new
            "password_hash TEXT NOT NULL)");                          // ← new

        db.execSQL("CREATE TABLE items (" +                          // ← new
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +                // ← new
            "name TEXT NOT NULL, " +                                  // ← new
            "quantity INTEGER NOT NULL DEFAULT 0)");                  // ← new
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Real migration logic arrives once this project's schema
        // actually needs to change from one version to another.
    }
}
```

### Mechanical Walkthrough

- `db.execSQL("CREATE TABLE ...")` — **first appearance.** `db` is the
  real `SQLiteDatabase` object `SQLiteOpenHelper` hands `onCreate` as a
  parameter — already open, already pointed at the right file.
  `execSQL` runs one SQL statement that produces no result rows to read
  back — the right tool for `CREATE TABLE`, and later, `INSERT`/
  `UPDATE`/`DELETE`, as opposed to a `SELECT`, which does return rows
  (Lesson 04's own subject).
- The SQL text itself is a Java `String`, built with ordinary `+`
  concatenation across several lines purely for readability — the
  database engine receives one complete statement, identical to what
  the `sqlite3` lab proved directly.
- Two separate `execSQL` calls — one per table — each independent; a
  failure in one wouldn't be caused by, or prevent, the other (a real
  multi-table schema change needing atomicity together is a transaction
  concern, covered once this project's bulk operations need it).

### Run It Yourself

Nothing on screen changes yet — nothing calls
`new DatabaseHelper(this).getWritableDatabase()` anywhere in
`MainActivity` yet, so `onCreate` hasn't actually run. Add one
temporary line inside `MainActivity.onCreate`, after
`setContentView(...)`:

```java
new DatabaseHelper(this).getWritableDatabase();
```

Run the app once, then use Android Studio's **Device File Explorer**
(View → Tool Windows → Device File Explorer) to navigate to
`/data/data/com.yourname.yourapp/databases/` on the running
emulator/device. Real result: `app.db` now exists at that exact path —
direct, on-device proof `onCreate` really ran and really created the
file, the Android-side equivalent of the `ls -la demo.db` proof from
Lesson 01's own throwaway lab. Leave the temporary line in place — the
next lesson gives it a permanent, real reason to be there.

### SE Lens

Why does `onCreate` build both tables through raw SQL strings rather
than some higher-level, code-based table-definition API? `execSQL`
takes exactly the same SQL any other SQLite tool — including the
`sqlite3` CLI already used to prove this schema — understands, with
nothing Android-specific about the statement itself. That means the
exact schema this lesson proved directly, with the exact tool used to
prove it, is what actually ships in the app: no separate translation
layer between "the SQL that was verified" and "the SQL that actually
runs," and no risk of a code-based abstraction silently generating
something subtly different from what was tested.

### Connection

`users` and `items` now exist as real tables, empty. The next lesson
writes real rows into them.

---

## Closing

### Connect the Pieces

One trace: the `sqlite3` lab proved `UNIQUE`/`NOT NULL` constraints are
enforced by the database itself, not application code, using a
throwaway file. The exact same `CREATE TABLE` statements, run through
`db.execSQL(...)` inside `onCreate`, now build the real `users` and
`items` tables inside this project's own `app.db` — confirmed directly
on a real device via the Device File Explorer, not just asserted.

### What Breaks Without This

Temporarily change the `items` table's `quantity` column from `INTEGER
NOT NULL DEFAULT 0` to `INTEGER NOT NULL` (no default), delete the
app's data (Android Studio → the app's own storage settings, or
uninstall and reinstall, so `onCreate` runs again fresh), and — once
Lesson 03 adds a real `INSERT` that omits `quantity` — that write will
fail with a real `NOT NULL constraint failed: items.quantity` error
instead of silently defaulting to `0`. Restore `DEFAULT 0` before
continuing; this is worth remembering now, since a genuine version of
this exact mistake is easy to make.

### Exercises

1. In the `sqlite3` lab, attempt `INSERT INTO users (username) VALUES
   ('bob')` — omitting `password_hash` entirely. Read the real error
   and connect it back to `NOT NULL`'s exact guarantee.
2. Add a third column to a scratch copy of the `items` table,
   `location TEXT`, with no `NOT NULL` — confirm (via `sqlite3`) that a
   row can be inserted while leaving `location` unset, and that it
   reads back as SQL `NULL`, the schema's own way of allowing "this
   value is genuinely optional."

### Definition of Done

- [ ] You triggered the real `UNIQUE constraint failed` error yourself
      in the `sqlite3` lab.
- [ ] `onCreate` contains both real `CREATE TABLE` statements, and you
      confirmed `app.db` exists on a real device via Device File
      Explorer.
- [ ] You can explain, without re-reading this lesson, why a `UNIQUE`
      constraint is safer than an application-level "check first" call.
- [ ] Commit: `git commit -m "Create users and items tables in
      onCreate, with constraints proven against real duplicate/missing
      data before trusting them"`.
