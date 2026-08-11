# Lesson 01: `SQLiteOpenHelper` and a Database That Outlives the Process

**What you will build:** A real `DatabaseHelper` class, and a real
`.db` file created the first time the app runs — proven, by actually
restarting the app, to still be there afterward. The transferable
problem: everything the login screen and the grid hold right now lives
in ordinary Java fields, in process memory. The instant the app's
process is killed — the user swipes it away, the OS reclaims the
memory, the device reboots — every field resets to nothing. A real app
needs storage that survives the one thing in-memory data never does:
the process itself ending.

**What you need to know first:** `android-ui-foundations` in full,
specifically Lesson 07's Inversion of Control (a framework calling your
code, not the reverse) and Lesson 06's `extends`/`@Override` — this
lesson's central class is built the same way.

**Terms introduced in this lesson:**
- **Persistent storage** — data written to disk, surviving not just a
  variable going out of scope but the entire process that wrote it
  ending and a new one starting later.
- **Database file** — a single file on disk holding an entire database
  — tables, rows, indexes — in one self-contained package, as opposed to
  a database server running as its own separate, long-lived process.
- **Schema** — the declared structure of a database: what tables exist,
  what columns each one has, and what type each column holds.
- **Schema version** — an integer a database file itself is stamped
  with, letting code detect "this file's structure is older than what
  the app currently expects" and react deliberately, rather than
  silently misreading it.
- **`final`** — a modifier on a field meaning it can only be assigned
  once; any attempt to reassign it anywhere else is a compile error,
  the same guarantee C#'s `readonly` provides.

**Objects and methods used:**

**`SQLiteOpenHelper`**
- *What it is:* the framework base class managing a SQLite database
  file's own creation and version upgrades.
- *Implementation:* `public abstract class SQLiteOpenHelper`, real
  declared shape verified against Android's own official reference
  documentation, quoted in full below — a constructor plus two abstract
  methods, `onCreate(SQLiteDatabase)` and `onUpgrade(SQLiteDatabase,
  int, int)`.
- *Its use:* the class `DatabaseHelper` extends, giving this project a
  real database file that outlives the process.

---

## Concept Unit: A Database File Is a Real, Self-Contained File on Disk

### The Problem

Before touching any Android-specific API, it's worth seeing the actual
engine underneath it directly: SQLite is not an Android invention.
`android.database.sqlite` is a thin Java wrapper around the same,
real, open-source SQLite engine used by browsers, desktop apps, and
countless other systems — proving what it actually does doesn't require
Android at all.

### Introduce the Concept in Isolation

On any machine with the `sqlite3` command-line tool (it ships with
macOS and most Linux distributions):

```bash
sqlite3 demo.db "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);"
sqlite3 demo.db "INSERT INTO items (name) VALUES ('Widget');"
```

Confirm the file genuinely exists on disk, independent of either
command above still running:

```bash
ls -la demo.db
```

Real output:

```
-rw-r--r--  1 user  staff  12288 Aug 10 20:05 demo.db
```

Now, in a completely fresh `sqlite3` invocation — a new process, with no
memory of the two commands above:

```bash
sqlite3 demo.db "SELECT * FROM items;"
```

Real output:

```
1|Widget
```

*What this proves:* every command above was a separate, short-lived
process — `sqlite3` started, ran one statement, and exited, three
separate times. The row inserted by the second process was still there
for the third, because it was never held in any process's memory to
begin with — it was written to `demo.db` itself, a real, ordinary file
on disk, the instant the `INSERT` ran. Deleting the file (not shown
here, but worth trying) is the only thing that would make the data
actually gone.

### Discard the Throwaway Example

Delete `demo.db`. The mechanism it proved — a SQLite database is one
real file, and writes to it persist independent of any one process's
lifetime — is exactly what `SQLiteOpenHelper` gives your Android app
access to, starting in the next unit.

### Mechanical Walkthrough

- `sqlite3 demo.db "CREATE TABLE ..."` — the `sqlite3` CLI tool, given a
  filename and a SQL statement as arguments, opens (or creates, if
  absent) that file as a SQLite database and runs the statement against
  it.
- `CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`
  — declares a **schema**: a table named `items`, with an `id` column
  that's the table's primary key and fills itself in automatically, and
  a `name` column that can never be left empty (`NOT NULL`).
- `INSERT INTO items (name) VALUES ('Widget')` — writes one real row.
  `id` is omitted deliberately — `AUTOINCREMENT` supplies it.
- `ls -la demo.db` — an ordinary shell command, listing the real file
  and its size in bytes — proof this is genuinely a file, not an
  abstraction.

### CS Lens

A database engine that reads and writes one ordinary file, with no
separate server process, is an **embedded database** — the opposite
architecture from something like a networked database server that many
separate client processes connect to over a socket. SQLite is, by a
wide margin, the most widely deployed database engine in the world
specifically because of this shape: it needs nothing running, nothing
configured, nothing but a file path.

Also recognized in: every desktop app that quietly uses a `.sqlite`
file for its own settings or local cache, browsers' own local storage
implementations, and this same engine appearing again, identically,
anywhere a mobile or desktop app needs real local persistence without
running a database server.

### SE Lens

Why is SQLite specifically the right tool for a single mobile app's own
local data, when a "real" client-server database (Postgres, MySQL)
exists and is what a web backend would use? A client-server database
solves a problem this app doesn't have: many separate processes, often
on different machines, all reading and writing the same data at once.
One app, on one device, owning one file it never shares with another
process, doesn't need that machinery — running a whole separate
database server process on a phone purely to serve one app would be
real, unjustified overhead, for a coordination problem that was never
actually present.

### Connection

The next unit wraps this exact same engine in the Android-specific API
that manages the file's location, its schema version, and its lifecycle
for you.

---

## Concept Unit: `SQLiteOpenHelper` — Managing the File's Lifecycle

### The Problem

The `sqlite3` CLI lab above required *you* to remember to create the
table, by hand, before ever inserting anything — and running the
`CREATE TABLE` statement a second time against a file that already has
that table produces an error, not a harmless no-op. A real app can't
ask its user to type SQL commands before first use; something has to
run the schema-creation SQL automatically, exactly once, the first time
the app ever touches the database — and never again after that.

### Project Change

- **Reference Source:** the real, documented contract for this class —
  [Android developer reference, `SQLiteOpenHelper`](https://developer.android.com/reference/android/database/sqlite/SQLiteOpenHelper),
  confirmed this session. Quoted directly:

  > "A helper class to manage database creation and version management...
  > This class makes it easy for [ContentProvider] implementations to
  > defer opening and upgrading the database until first use, to avoid
  > opening the database (which can be expensive) while initializing
  > components... this class will take care of automatically opening
  > the database as needed... If your application does not have
  > sufficient free disk space, [database calls] may fail. Once a
  > database has been corrupted... this class is only intended to help
  > safely open and upgrade the database, not to protect against loss
  > of data."

  Its real declared shape — the abstract methods any subclass must
  implement, and the two the subclass gets for free:

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

  `onCreate` and `onUpgrade` are `abstract` — every subclass, including
  the one this unit writes, must supply a real body for both, the same
  requirement Lesson 06 covered for any `abstract` method.
- **Files affected:** a new file, `DatabaseHelper.java`, in the same
  package as `MainActivity`.
- **Change type:** new file.
- **Location:** not applicable — this is the file's entire content.
- **Dependencies:** None new.

### The New Code

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
        // Real CREATE TABLE statements arrive in the next lesson.
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Real migration logic arrives once this project's schema
        // actually needs to change from one version to another.
    }
}
```

### The Updated Project

This is the entire new contents of `DatabaseHelper.java` — a brand-new
file, so there's no larger enclosing structure to place it within yet.

### Mechanical Walkthrough

- `public class DatabaseHelper extends SQLiteOpenHelper` — **first
  appearance.** The same `extends` mechanism Lesson 06 covered for
  `MainActivity extends AppCompatActivity`, now applied to a different
  Android base class — `DatabaseHelper` inherits `SQLiteOpenHelper`'s
  entire lifecycle machinery and fills in only the two methods that
  machinery can't supply on its own.
- `public DatabaseHelper(Context context) { super(context, DATABASE_NAME, null, DATABASE_VERSION); }`
  — a constructor that immediately forwards to the parent class's own
  constructor via `super(...)` (the same mechanism Lesson 06's
  `SmartLightbulb` used), supplying the app's own `Context` (needed to
  know where on the device to actually store the file — full treatment
  of `Context` itself is `android-ui-foundations`' own established
  ground), a filename, `null` for the optional third parameter (a
  customization point this project doesn't need), and the schema
  version number.
- `@Override public void onCreate(SQLiteDatabase db)` — the method
  `SQLiteOpenHelper` itself calls, automatically, the *first* time the
  database is actually opened and no file exists yet at that path —
  never called again after that, on this device, unless the app is
  uninstalled and reinstalled.
- `@Override public void onUpgrade(...)` — called instead of `onCreate`
  when a file already exists but its stored version number is lower
  than `DATABASE_VERSION` — the mechanism that lets a schema evolve
  across app updates without silently corrupting or ignoring an
  existing user's already-saved data.
- `private static final String DATABASE_NAME = "app.db";` — a `static`
  field (Lesson 01a-equivalent ground from `android-ui-foundations`)
  combined with `final` — **first appearance of `final` on a field.**
  `final` means this field can only be assigned once (here, inline,
  never reassigned anywhere else) — the exact same guarantee C#'s
  `readonly` or a locked constant provides, applied to Java.

### CS Lens

`onCreate`/`onUpgrade` being called by `SQLiteOpenHelper` itself, at a
moment it decides based on real, checked conditions (does the file
exist yet? does its version match?), is the same **Inversion of
Control** relationship Lesson 07 already proved for `Activity.onCreate`
— a framework class owning the decision of *when* your code runs,
your code only supplying *what* runs.

Also recognized in: any framework's own migration system (Rails'
ActiveRecord migrations, Django's migrations) — schema versioning
tied to a stored version number, with framework-owned code deciding
whether a migration step needs to run.

### SE Lens

Why does `SQLiteOpenHelper` require an explicit version number at all,
rather than just always running `onCreate`'s SQL every time the app
starts (using `CREATE TABLE IF NOT EXISTS` to make it safe to repeat)?
Because schema changes are not always additions a repeatable "create if
missing" statement can express — renaming a column, splitting one table
into two, or migrating existing rows into a new shape all require real,
one-time logic that must run exactly once, in order, exactly when the
stored version is behind. The version number turns "has this device's
database already been updated to the current shape" into a single
integer comparison `SQLiteOpenHelper` checks for you, rather than a
question your own code would otherwise have to answer some other,
less reliable way.

### Commands needed

None yet — this class isn't invoked from `MainActivity` until the next
lesson gives `onCreate` real SQL to run and something to actually call
`getWritableDatabase()` on.

### Run It Yourself

Nothing visibly changes yet — `DatabaseHelper` exists but nothing
constructs it. Confirm the project still compiles and the app still
runs exactly as it did at the end of `android-ui-foundations`, with one
new, currently-unused file sitting in the project. The next lesson
gives this class real work to do.

### Connection

`DatabaseHelper` is the one object this entire series' persistence
layer is built on — the login screen, the grid, and every CRUD
operation from here forward all go through it. Both units in this
lesson are also available as a standalone concept file,
`android-sqliteopenhelper.md`.

---

## Closing

### Connect the Pieces

One trace: `sqlite3`'s own CLI proved a SQLite database is a real file
on disk, its writes surviving independently of any one process.
Android's `SQLiteOpenHelper` wraps that exact same engine and adds one
real mechanism on top: `onCreate`, called automatically, exactly once,
the first time the database file doesn't yet exist, and `onUpgrade`,
called instead when an existing file's stored version number falls
behind the app's current expectation — both driven by the framework
deciding when, the same Inversion of Control shape already proven for
`Activity.onCreate`.

### What Breaks Without This

Temporarily remove the `@Override` annotations from both `onCreate` and
`onUpgrade` (leaving the methods themselves in place). Real result: the
project still compiles — `@Override` is a check, not a requirement for
the override itself to function — but change one method's signature
slightly (add an extra unused parameter, for instance) with `@Override`
still removed, and the class now silently compiles with a method that
looks like an override but isn't one at all, never called by
`SQLiteOpenHelper`. Restore both `@Override` annotations and the exact
original signatures — this is precisely the failure `@Override` exists
to catch at compile time instead of leaving as a silent, undetectable
bug.

### Exercises

1. In the `sqlite3` lab, run the exact same `CREATE TABLE` command a
   second time against the same `demo.db` file, without deleting it
   first. Read the real error and connect it back to why
   `SQLiteOpenHelper`'s `onCreate` is guaranteed to run only once per
   file, not once per app launch.
2. Change `DATABASE_VERSION` from `1` to `2` in a scratch copy of
   `DatabaseHelper`, temporarily add a `System.out`-style log line
   inside `onUpgrade`, and reason through (without running it yet —
   the next lesson gives `onCreate` real SQL to test this against)
   which method would run on a device that already has version `1` of
   the database installed.

### Definition of Done

- [ ] You ran the `sqlite3` lab yourself and saw the real file persist
      across three separate, independent CLI invocations.
- [ ] `DatabaseHelper.java` exists in your project, extending
      `SQLiteOpenHelper`, with both abstract methods overridden.
- [ ] You can explain, in your own words, the difference between
      `onCreate` and `onUpgrade` — which conditions trigger each one.
- [ ] The project still compiles and runs, unchanged in visible
      behavior.
- [ ] Commit: `git commit -m "Add DatabaseHelper extending
      SQLiteOpenHelper — schema creation logic arrives next lesson"`.
