# Lesson 12f: `SQLiteOpenHelper`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 12c's SQL, Lesson 0l's
inheritance.

**Terms introduced in this lesson:**

- **`SQLiteOpenHelper`** — Android's base class for managing a SQLite
  database file's lifecycle — creation and version-upgrade — extended to
  define a database's initial schema and migration logic.

---

## Concept Unit: `SQLiteOpenHelper`

### The Problem

A real, on-device SQLite database file needs to be created the first
time an app runs, and its schema needs a defined way to change (an
upgrade) across app versions — neither of which raw SQL, from Lessons
12b and 12c, handles by itself.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
class InventoryDbHelper extends SQLiteOpenHelper {
    InventoryDbHelper(Context context) {
        super(context, "inventory.db", null, 1);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, quantity INTEGER)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS items");
        onCreate(db);
    }
}
```

This is `SQLiteOpenHelper` — **first appearance**: Android's base class
for managing a SQLite database file's lifecycle — creation and
version-upgrade — extended to define a database's initial schema and
migration logic. `InventoryDbHelper` `extends` (Lesson 0l's own
inheritance) `SQLiteOpenHelper`, supplying the app-specific schema
(`onCreate`) and upgrade behavior (`onUpgrade`) that `SQLiteOpenHelper`
itself calls automatically at the right moment.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `class InventoryDbHelper extends SQLiteOpenHelper` — **(b)
   reappearing** inheritance from Lesson 0l, now subclassing a real
   Android framework class.
2. `super(context, "inventory.db", null, 1);` — **(b) reappearing**
   `super` constructor call from Lesson 2n, naming the database file and
   its schema version.
3. `onCreate(SQLiteDatabase db) { db.execSQL("CREATE TABLE ..."); }` —
   **(a) first appearance**: called automatically, exactly once, the
   first time the database file doesn't yet exist.
4. `onUpgrade(...)` — **(a) first appearance**: called automatically when
   the app declares a higher schema version than what's currently on
   disk, giving the app a defined place to migrate its schema.

### CS Lens

`SQLiteOpenHelper` separates a database file's existence/creation,
handled once automatically, from every later open of that same file —
the app never needs to manually check "does this file already exist"
itself.

Also recognized in: database migration frameworks in virtually every
server-side framework (Rails migrations, Django migrations) — the same
"versioned schema, upgrade path defined once" idea.

### SE Lens

The alternative — manually checking whether the database file exists and
running `CREATE TABLE` by hand every time the app starts — was not
chosen because `SQLiteOpenHelper` already handles exactly this check,
correctly, once, with a defined upgrade path for schema changes across
app versions.

---

## Connect the Pieces

`InventoryDbHelper` wires an app's own schema, written in real SQL, into
Android's real, on-device SQLite file. The next lesson reads that
schema's rows back out, one at a time.

## What Breaks Without This

Skipping `SQLiteOpenHelper` in favor of manually checking file existence
risks recreating the table on every launch, destroying existing data —
`SQLiteOpenHelper`'s `onCreate` runs exactly once, guaranteed, precisely
to avoid this.

## Exercises

1. Add a second table, `categories`, to `onCreate`, following the same
   `CREATE TABLE` shape as `items`.
2. Explain, in your own words, why `onUpgrade` drops and recreates the
   table rather than trying to preserve existing data — and what a real
   app would need to do differently to avoid data loss on upgrade.
3. Explain, in your own words, why the schema version number (`1` in
   `super(...)`) matters to `onUpgrade`.

## Definition of Done

- [ ] You read the real `SQLiteOpenHelper` example and can explain what
      `onCreate` and `onUpgrade` are each responsible for.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why manually
      checking file existence every launch is worse than
      `SQLiteOpenHelper`'s approach.
