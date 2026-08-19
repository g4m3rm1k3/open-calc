# Two Paths for Two Real Situations: SQLiteOpenHelper Migration

**What problem this solves.** When an app already has real, permanent
user data stored in a specific shape — a set of tables, specific
columns — and its authors need to change that shape later after the
app has already shipped, simply changing the code that describes "what
a fresh database looks like" does nothing for a device that already has
a database file sitting there in the old shape. What's needed is two
distinct pieces of logic living side by side: one for brand-new installs
(build the current shape directly, in one step) and a separate one for
existing installs (transform whatever old shape is already there into
the current shape, in place, without losing what's in it) — plus a
reliable way to tell, for any given device, which of the two situations
it's actually in.

**Classic pattern family.** Not a clean Gang-of-Four fit — this is a
version-gated migration protocol, closer in spirit to how a database
migration framework or a document format's own version marker solves
the same general problem. The specific mechanism — a stamped integer
version number, compared automatically by a framework class — is
Android's own applied shape of that general idea.

**Where you'll meet it in Android.**
`android.database.sqlite.SQLiteOpenHelper` (the abstract base class),
its `onCreate(SQLiteDatabase)` and `onUpgrade(SQLiteDatabase, int,
int)` callbacks, and the version number passed to its constructor.

**Terms used in this pattern.**

- **SQL DDL statement** (`CREATE TABLE`, `ALTER TABLE`) — a statement
  describing the structure of stored data itself — what tables and
  columns exist — rather than reading or writing rows within an
  already-existing structure. It's the actual language both callbacks
  issue their real work through.
- **Cascading independent `if` checks** — a series of conditions, each
  evaluated independently rather than as mutually exclusive branches
  (not `else if`, not `switch`), so that a device starting several
  versions behind runs every applicable block in order rather than only
  the first match. It exists specifically to correctly handle a device
  that skipped multiple versions at once.

**Objects and methods used.**

- **`SQLiteOpenHelper`**
  *What it is:* an abstract base class managing the opening, creation,
  and version-tracking of a SQLite database file.
  *Implementation:* `public abstract class SQLiteOpenHelper`,
  constructed with `public SQLiteOpenHelper(Context context, String
  name, SQLiteDatabase.CursorFactory factory, int version)`, declaring
  abstract `onCreate(SQLiteDatabase)` and `onUpgrade(SQLiteDatabase,
  int, int)`.
  *Its use:* the actual mechanism deciding, on its own, which of the
  two callbacks to call — by comparing the version number given to its
  constructor against a number physically stamped inside the existing
  database file the last time it was created or upgraded. The app's own
  code never performs this comparison itself.
- **`onCreate(SQLiteDatabase db)`**
  *What it is:* an abstract method on `SQLiteOpenHelper`, returning
  `void`.
  *Implementation:* `public abstract void onCreate(SQLiteDatabase db)`.
  *Its use:* called exactly once ever, per device — only the very first
  time this app's database file doesn't yet exist at all — never called
  again afterward, no matter how many times the declared schema
  subsequently changes in later code.
- **`onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion)`**
  *What it is:* an abstract method on `SQLiteOpenHelper`, returning
  `void`.
  *Implementation:* `public abstract void onUpgrade(SQLiteDatabase db,
  int oldVersion, int newVersion)`.
  *Its use:* called instead of `onCreate` whenever a database file
  already exists on the device but its stamped version number is lower
  than the version this code currently declares; `oldVersion` is the
  real, actual version already on this specific device, letting the
  migration logic apply only what's genuinely still needed.
- **`SQLiteDatabase.execSQL(String sql)`**
  *What it is:* an instance method on `SQLiteDatabase`, returning
  `void`.
  *Implementation:* `public void execSQL(String sql)`.
  *Its use:* runs a raw SQL statement directly against the real
  database file — the actual mechanism doing the real structural work
  in either callback.

---

## The Shape

Five participants:

- **`SQLiteOpenHelper`** — the framework class managing the whole
  decision.
- **A version number physically stamped inside the real database
  file** on a specific device, from whenever it was last created or
  upgraded.
- **The version number declared in the app's own current code**
  (`DATABASE_VERSION`).
- **`onCreate`** — the brand-new-install path.
- **`onUpgrade`** — the existing-install path.

The relationship: the app's own code never directly decides which of
`onCreate`/`onUpgrade` to call — `SQLiteOpenHelper` does, automatically,
by comparing the two version numbers the moment the database is
actually opened. The app's code only ever supplies the content of each
path; it never writes the comparison logic itself. A device's database
file physically carries its own version number forward across every
future `onUpgrade` call — after a migration runs, the file is
re-stamped with the new version, so the next time this logic runs (a
future app update), it compares against this new, current number,
never re-running migrations that already happened on this device.

```
   App opens the database (SQLiteOpenHelper)
        |
        v
   compare: file's stamped version  vs  code's DATABASE_VERSION
        |
   -------------------------------------------
   |  file doesn't exist yet                  |
   |    -> onCreate(db) runs once             |
   |-------------------------------------------|
   |  file exists, stamped version is LOWER    |
   |    -> onUpgrade(db, oldVersion, newVer)   |
   |       runs, oldVersion = what THIS        |
   |       specific device's file actually has |
   |-------------------------------------------|
   |  file exists, stamped version matches     |
   |    -> neither runs; already current       |
   -------------------------------------------
```

---

## Mechanical Walkthrough

```java
public class InventoryDbHelper extends SQLiteOpenHelper {

    private static final int DATABASE_VERSION = 3;
    private static final String DATABASE_NAME = "inventory.db";

    public InventoryDbHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE items (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "name TEXT NOT NULL, " +
                "quantity INTEGER NOT NULL, " +
                "category TEXT)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (oldVersion < 2) {
            db.execSQL("ALTER TABLE items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 0");
        }
        if (oldVersion < 3) {
            db.execSQL("ALTER TABLE items ADD COLUMN category TEXT");
        }
    }
}
```

- **`super(context, DATABASE_NAME, null, DATABASE_VERSION);`** — passes
  the current declared version to the parent class; this alone is what
  `SQLiteOpenHelper` will later compare against whatever's stamped in a
  real device's file.
- **`db.execSQL("CREATE TABLE items (...)")`** inside `onCreate` — the
  entire current, final table shape, built in one step, because this
  path only ever runs against an empty, brand-new file with nothing to
  preserve.
- **`if (oldVersion < 2) { db.execSQL("ALTER TABLE items ADD COLUMN quantity ..."); }`**
  — runs only for a device whose stamped version is still below 2;
  a device already at version 2 or higher skips this block entirely.
- **`if (oldVersion < 3) { db.execSQL("ALTER TABLE items ADD COLUMN category TEXT"); }`**
  — a second, independent check, not an `else` — a device jumping from
  version 1 straight to 3 runs *both* blocks, in order, catching up
  fully in one pass; a device already at 2 runs only this second one.

---

## Collaboration — how it actually runs

1. The app constructs `InventoryDbHelper`, calling `super(context,
   DATABASE_NAME, null, DATABASE_VERSION)` — this configures what
   version this code currently declares but doesn't open or touch the
   file yet.
2. The first time the database is actually accessed, `SQLiteOpenHelper`
   opens the real file and checks whether it exists at all.
3. On a brand-new install with no existing file, `onCreate(db)` runs
   exactly once, building the table in its current, final shape
   directly — `oldVersion` doesn't apply here at all, since there was
   nothing to upgrade from.
4. On a device that already has a database file from an earlier version
   of this app, `SQLiteOpenHelper` compares the file's own stamped
   version against `DATABASE_VERSION`; if the file's version is lower,
   `onUpgrade(db, oldVersion, newVersion)` runs instead, with
   `oldVersion` set to whatever this specific device's file actually
   has stamped.
5. Inside `onUpgrade`, each independent `if (oldVersion < N)` block
   runs only if this specific device genuinely still needs that step —
   a device already partway upgraded skips what it's already passed,
   while a device that skipped several versions entirely runs every
   applicable block in sequence.
6. Once `onUpgrade` finishes, the file is re-stamped with the new,
   current version, so the next time this logic runs, the comparison in
   step 4 starts from this new baseline.

---

## Why It's Shaped This Way

The design principle is **separating "build the current shape from
nothing" from "transform an existing shape into the current one,
preserving its data"**, because these are genuinely different problems
requiring genuinely different code, not two cases of the same
operation.

The alternative not chosen: one single method that always runs, using
the current `CREATE TABLE` statement, dropping and rebuilding the table
every time the app updates. The real cost: this would destroy every
real row of user data already in the table on every single schema
change — completely unacceptable for anything beyond a debug build.

The cost this pattern itself carries: `onUpgrade`'s own logic only ever
grows over an app's real lifetime — every past version bump needs its
own permanent `if (oldVersion < N)` block, kept correct and present
forever, because a device that hasn't been opened in years might still
update straight from version 1 to version 12, needing every single
intermediate step still available and correctly ordered.

---

## Recognizing It Elsewhere

Also recognized in: a database migration framework (Flyway, Rails'
own migrations) in any backend project, running only the migrations a
given database hasn't already applied, tracked by its own stored
version marker; a game save file's own version field, letting a newer
version of the game read and upgrade an old save format in place
rather than discarding it; a document format's own version marker, an
old file opened by newer software and upgraded in place rather than
rejected.

---

## Where This Actually Breaks

The most common real mistake: changing the `CREATE TABLE` statement
inside `onCreate` to reflect the new, current schema, without adding a
matching `if (oldVersion < N)` block inside `onUpgrade`, and without
bumping `DATABASE_VERSION` at all. Because `onCreate` never runs again
on any device that already has the app installed, this "fix" only ever
affects brand-new installs going forward — every existing user's device
keeps running against the old, unmigrated table shape indefinitely,
silently, with no error thrown anywhere, since nothing in the framework
can detect that `onCreate`'s own logic and reality have quietly
diverged for everyone except new users.
