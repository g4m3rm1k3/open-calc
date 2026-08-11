# Concept: `SQLiteOpenHelper` — Managing a Database File's Lifecycle

**What you'll understand by the end:** what `SQLiteOpenHelper` actually
manages for you, why `onCreate`/`onUpgrade` exist as separate callbacks
you fill in rather than code you call yourself, and when each one
actually runs.

**Prerequisites:** `extends`/`@Override` and Inversion of Control (a
framework calling your code at a moment it decides, not your code
calling the framework).

## Setup

A real Android project, or reasoning through the API directly — this
concept's own callback-timing claims are demonstrated on a real device;
its underlying engine (SQLite itself) can be proven directly with the
`sqlite3` command-line tool, no Android required.

## The Problem

A database file has to exist, with the right tables, before an app can
use it — but asking a user to somehow "set up" the database before
first use isn't realistic, and running raw `CREATE TABLE` SQL every
single time the app starts is wasteful and, for schema *changes* (not
just first creation), actively wrong: a rename or a data migration
can't safely just run again on every launch.

## The Isolated Example

The underlying engine, proven directly, no Android involved:

```bash
sqlite3 demo.db "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);"
sqlite3 demo.db "INSERT INTO items (name) VALUES ('Widget');"
sqlite3 demo.db "SELECT * FROM items;"
```

**Real output:**
```
1|Widget
```

Each `sqlite3` invocation above is a separate, short-lived process —
proof a SQLite database is one real file on disk, its contents
persisting independently of any process's lifetime.

`SQLiteOpenHelper`'s real declared shape — the two abstract methods a
subclass must supply:

```java
public abstract class SQLiteOpenHelper {
    public SQLiteOpenHelper(Context context, String name,
                             SQLiteDatabase.CursorFactory factory, int version) { ... }

    public abstract void onCreate(SQLiteDatabase db);
    public abstract void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion);

    public SQLiteDatabase getReadableDatabase() { ... }
    public SQLiteDatabase getWritableDatabase() { ... }
}
```

**What this proves:** the constructor takes a version number, not just
a filename — that number is the entire mechanism the rest of this
concept depends on.

## Mechanical Walkthrough

- `super(context, DATABASE_NAME, null, DATABASE_VERSION)` — forwards to
  the parent constructor: a `Context` (needed to resolve where on the
  device to store the file), a filename, an optional cursor factory
  (`null` for the common case), and the schema version.
- `onCreate(SQLiteDatabase db)` — called by `SQLiteOpenHelper` itself,
  automatically, the *first* time the database is opened and no file
  yet exists at that path. Never called again after that on the same
  device, unless the app is uninstalled and reinstalled.
- `onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion)` —
  called instead of `onCreate` when a file already exists but its
  stored version number is lower than the version the constructor was
  given — the mechanism that lets a schema evolve across app updates
  without silently corrupting or ignoring a user's already-saved data.
- `getWritableDatabase()` / `getReadableDatabase()` — the methods real
  code actually calls to get a usable `SQLiteDatabase` object; both
  trigger the `onCreate`/`onUpgrade` check internally before returning,
  so a caller never has to invoke either callback directly.

## CS Lens

`onCreate`/`onUpgrade` being called by the framework at a moment it
decides, based on real, checked conditions, is **Inversion of
Control** — the same shape as `Activity.onCreate` itself, applied to a
database's own setup instead of a screen's.

Also recognized in: any framework's schema-migration system (Rails'
ActiveRecord migrations, Django's migrations) — a stored version number
compared against the code's current expectation, with framework-owned
logic deciding whether a migration step needs to run.

## SE Lens

Why require an explicit version number, rather than always running
`onCreate`'s SQL with `CREATE TABLE IF NOT EXISTS` to make it safe to
repeat? Because not every schema change is an *addition* a repeatable
statement can express — renaming a column, splitting one table into
two, or migrating existing rows into a new shape all need real,
one-time logic that must run exactly once, in the right order, only
when the stored version is actually behind. The version number turns
"does this device's database need updating" into a single integer
comparison the framework checks for you.

## Connection

Builds on `extends`/`@Override` and Inversion of Control generally.
Every real CRUD operation against the resulting database — `INSERT`,
`SELECT`, `UPDATE`, `DELETE` — goes through the `SQLiteDatabase` object
`getWritableDatabase()`/`getReadableDatabase()` hands back.

## Try It Yourself

1. In the `sqlite3` lab, run the exact same `CREATE TABLE` command a
   second time against the same file, without deleting it first. Read
   the real error, and connect it back to why `onCreate` is guaranteed
   to run only once per file, not once per app launch.
2. Reason through (or test, in a real project): a device already has
   version `1` of a database installed. The app updates, and its
   `DatabaseHelper` now requests version `2`. Which callback runs the
   next time the app opens — `onCreate`, `onUpgrade`, or neither?
