# Lesson 12: SQLite and Why a Table Isn't Just Another Collection

**What you will build:** Real, permanent storage — every item you add
from here on is written into an actual SQLite database file on the
device, surviving a full app close and reopen. The result is
deliberately half-finished, the same honest way `SharedPreferences`
was in Lesson 10 before Lesson 10 finished its own job: this lesson
proves the *write* side works; the on-screen list still loads from the
same five hardcoded seed items every launch, because nothing reads
from the database yet. Lesson 13 finishes the job. The transferable
problem underneath it: `SharedPreferences` (Lesson 10) is the right
tool for one saved number, but a growing list of structured records —
potentially hundreds of `Item`s, each needing to be found, updated, or
counted — needs a real **relational database**, and the raw SQL API
underneath it is worth seeing with your own eyes at least once before
anything hides those mechanics from you.

**What you need to know first:** Lesson 7 (`Item`'s fields — this
lesson models the exact same shape as table columns). Lesson 9
(`try`/`catch`, since SQL operations can fail). Lesson 10
(`SharedPreferences`, and specifically why it's the right tool for one
number and the wrong one for a growing list of records).

**Terms introduced in this lesson:**
- **Relational database** — data organized into named, typed
  **tables**, each with a fixed set of **columns** and any number of
  **rows**, one row per record — queried with a query language (SQL)
  instead of walked with a loop.
- **Primary key** — a column guaranteed unique per row, used to
  unambiguously identify one specific record for later updates or
  deletes.
- **`SQLiteOpenHelper`** — the Android framework's base class for
  managing a SQLite database file's creation and version upgrades.
- **`execSQL(String sql)`** — runs any SQL statement that doesn't
  return rows (`CREATE TABLE`, for instance) — the SQL text itself is
  a completely different language from Java, embedded as a plain
  string.
- **`ContentValues`** — a `Map`-like, string-keyed container purpose-built
  for describing one row's column values before an insert or update.
- **Schema version** — an integer, supplied to `SQLiteOpenHelper`'s
  constructor, that `onUpgrade` compares against to decide whether the
  database's structure needs to change.

---

## Concept Unit: What a Relational Database Actually Is

### The Problem

`SharedPreferences` stores flat key-value pairs — perfectly fine for
"one threshold number," useless for "find every item stored in Bin 4"
or "how many total items exist across all locations?" Those are
*queries* over structured, repeated records — exactly what a
relational database is built for, and exactly what a `List<Item>`
sitting only in memory (rebuilt from five hardcoded lines every single
launch since Lesson 7) has never been able to do once the app closes.

### The Concept, in Prose

A relational database organizes data into tables — each table a fixed
set of named, typed columns, and any number of rows, each row one
record. This should look immediately familiar: a table is the
persisted, queryable version of the exact shape `Item.java` already
gives one in-memory record. An `items` table with columns `name`,
`quantity`, `location` would hold exactly the same information as your
`List<Item>` — just durable, and searchable with SQL instead of a Java
loop.

Every table conventionally has a primary key — a column guaranteed
unique per row, used to unambiguously identify one specific record for
updates or deletes. Nothing about `Item.java` has had one yet —
`equals()` from Lesson 7 compares every field, which stops helping the
moment two items could coincidentally share a name and quantity. A
database table needs a real, stable identifier — typically a simple
auto-incrementing integer the database itself assigns, unrelated to
any of the item's actual data.

### Mechanical Walkthrough

No code fence to enumerate — this unit names vocabulary, not syntax:

- **Table** — a named collection of records, all sharing the same
  fixed set of columns; the persisted equivalent of `Item.java`'s own
  shape, repeated for every item.
- **Column** — one named, typed field every row in a table has —
  `name`, `quantity`, `location`, matching `Item`'s three fields
  exactly.
- **Row** — one single record — one saved `Item`, in this project's
  case.
- **Primary key** — a column guaranteed unique per row, used to
  unambiguously identify one specific record; `Item.java` has no
  equivalent yet, which is exactly the gap the next unit's `id` column
  closes.

### CS Lens

This is the **relational model** — data organized as sets of records
conforming to a fixed schema, queried declaratively rather than by
manually walking a data structure. Also recognized in: every SQL
database engine (SQLite, PostgreSQL, MySQL), spreadsheet software (a
sheet is a table; a row a record), and even a CSV file with a header
row, which is a table in its most stripped-down form.

### SE Lens

**Why not just serialize the whole `List<Item>` to a plain file and
read it back, the way `Parcelable` already proved objects can be
turned into bytes?** That approach genuinely works for small data, but
it costs more the larger the list grows: changing one item's quantity
means rewriting the *entire* file, every time, since there's no way to
update one record in place inside a flat serialized blob. It also
offers no way to ask "which items are in Bin 4" without loading
everything into memory first and filtering by hand — exactly the
"query" capability a real database provides directly. A relational
database's whole reason to exist is making single-record updates and
structured queries both cheap, without ever needing to rewrite
everything else.

---

## Concept Unit: `SQLiteOpenHelper` — Declaring and Creating a Real Table

### The Problem

Before any data can be saved, the database needs a table to save it
into — created once, the first time the app ever runs on a given
device, and never again after that.

### The Contract You're Extending

`extends SQLiteOpenHelper` means fitting into a shape Android itself
already declared — worth reading that real shape before writing a
class that extends it. From `android.database.sqlite` itself, not this
project's code (verified against the real class, this session):

```java
public abstract class SQLiteOpenHelper {
    public SQLiteOpenHelper(Context context, String name,
                             SQLiteDatabase.CursorFactory factory, int version) { /* ... */ }

    public abstract void onCreate(SQLiteDatabase db);
    public abstract void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion);
}
```

Two real facts this makes checkable instead of assumed: the
constructor takes exactly four arguments — a `Context`, the database's
on-disk filename, an optional cursor factory (`null` in every real use
in this project), and an integer version — which is exactly what
`super(...)`, below, has to supply, in that order. And only two methods
are `abstract` — `onCreate` and `onUpgrade` — meaning those two, and
only those two, are what a subclass is actually required to supply;
everything else about managing the database file is handled for you.

### Introduce the Concept in Isolation

This is one of the rare concepts in this curriculum that can't be
proven with a plain `javac`/`java` throwaway lab — `android.database.sqlite`
only exists inside a real Android runtime, not the plain JDK every
earlier lab in this course has used. The isolated proof has to run
inside the app itself, on a scratch table, before touching the real
one.

Temporarily add this nested class inside `InventoryActivity` (delete
it at the end of this step — it's a lab, not the real code):

```java
static class ScratchDbHelper extends SQLiteOpenHelper {
    ScratchDbHelper(Context context) {
        super(context, "scratch.db", null, 1);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE scratch_items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS scratch_items");
        onCreate(db);
    }
}
```

And temporarily, at the end of `onCreate`, after the existing setup:

```java
ScratchDbHelper scratchHelper = new ScratchDbHelper(this);
SQLiteDatabase scratchDb = scratchHelper.getWritableDatabase();
ContentValues scratchValues = new ContentValues();
scratchValues.put("name", "Test Widget");
long rowId = scratchDb.insert("scratch_items", null, scratchValues);
android.util.Log.d("ScratchDb", "Inserted row id: " + rowId);
```

Run the app on your emulator. Logcat prints `Inserted row id: 1`. Run
the app a **second** time (close it fully first, per Lesson 10's own
process-death test, then relaunch — don't just background it): Logcat
now prints `Inserted row id: 2` — proof a *second* row was added to the
*same* underlying file, which only makes sense if `scratch.db` and its
table genuinely persisted between the two separate process runs, on
disk, exactly the durability Lesson 10 proved for a single
`SharedPreferences` value, now demonstrated for a real table.

### Discard the Throwaway Example

Delete `ScratchDbHelper` entirely, and remove the temporary block from
`onCreate`. Neither appears in the real project again.

### The New Code — a Real, Permanent Database Helper

Create `app/src/main/java/.../DatabaseHelper.java`:

```java
package com.yourname.pocketinventory;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "pocketinventory.db";
    private static final int DATABASE_VERSION = 1;

    DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE items (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "name TEXT, " +
                "quantity INTEGER, " +
                "location TEXT)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS items");
        onCreate(db);
    }
}
```

### The Updated Project

This is the whole new file — `items`' four columns are the exact same
four pieces of data `Item.java` already holds (`id` is new; `name`,
`quantity`, `location` match its three fields exactly), the concrete
realization of this lesson's opening claim that a table is the
persisted version of an in-memory record's shape.

### Mechanical Walkthrough

- `DATABASE_NAME` / `DATABASE_VERSION` — reappearing (`static final`
  fields, already-basic), naming the actual file (`pocketinventory.db`)
  and the schema version `onUpgrade` compares against.
- `super(context, DATABASE_NAME, null, DATABASE_VERSION)` — reappearing
  (parent constructor call, Lesson 6c's `ViewHolder`), now with the
  four real arguments the verified contract above requires.
- `onCreate(SQLiteDatabase db)` — a different method from
  `Activity.onCreate`, despite the identical name (Java allows
  same-named methods on unrelated classes — there's no conflict, since
  each is called by entirely different framework machinery). Called
  automatically, exactly once, the first time this database file is
  opened and doesn't yet exist on disk.
- `db.execSQL("CREATE TABLE items (...)")` — first appearance of SQL
  itself inside this project's real code. `id INTEGER PRIMARY KEY
  AUTOINCREMENT` is the concrete realization of "primary key" from the
  previous unit — SQLite assigns and increments this column's value
  automatically on every insert; nothing in this project's own code
  ever sets it directly.
- `onUpgrade(...)` — called automatically only if the app is
  reinstalled with a *higher* `DATABASE_VERSION` than what's already on
  the device. This project's version just destroys and rebuilds the
  table — correct for a schema that hasn't shipped to a real user yet,
  and flagged honestly: doing this against a real user's existing data
  would delete their inventory, which is why real apps need a genuine
  migration strategy this lesson doesn't attempt.

### CS Lens

`DATABASE_VERSION` plus `onUpgrade` is a small instance of **schema
migration** — a versioned, structured way to change a stored data
shape after it already has real data in it, instead of assuming the
shape never changes. Also recognized in: database migration tools in
almost every backend framework (Rails, Django, Entity Framework),
mobile app update mechanisms generally, and semantic versioning applied
to a file format instead of a piece of software.

### SE Lens

**Why does `onCreate` run automatically, the first time, instead of
this project calling it directly the way `EnsureDatabaseCreated` might
suggest?** Because `SQLiteOpenHelper` is specifically designed so a
caller never has to know or check whether the database file already
exists — `getWritableDatabase()`, used next, triggers `onCreate` (or
`onUpgrade`) internally, automatically, only when actually needed. The
alternative — checking "does the file exist yet?" by hand, everywhere
the database is used — is exactly the kind of repeated, easy-to-get-wrong
bookkeeping a framework class exists to take off your hands.

---

## Concept Unit: Saving a Real Item — `ContentValues` and `insert`

### The Problem

The table exists, but nothing writes to it yet — tapping "Add" still
only updates the in-memory list, gone the moment the process ends.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Add.
- **Location:** A new field, plus one new block inside the existing
  `addItemButton` click handler.
- **Dependencies:** `DatabaseHelper`, previous unit.

### The New Code

```java
private DatabaseHelper dbHelper;
```

```java
dbHelper = new DatabaseHelper(this);
```

```java
ContentValues values = new ContentValues();
values.put("name", name);
values.put("quantity", quantity);
values.put("location", location);
dbHelper.getWritableDatabase().insert("items", null, values);
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    private InventoryAdapter adapter;
    private DatabaseHelper dbHelper;                                                     // ← new

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        dbHelper = new DatabaseHelper(this);                                             // ← new

        List<Item> items = new ArrayList<>();
        items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));
        items.add(new Item("Shop Rags", 12, "Shelf B"));
        items.add(new Item("Cutting Oil", 3, "Shelf B"));
        items.add(new Item("Digital Calipers", 2, "Toolbox 1"));
        items.add(new Item("Safety Glasses", 8, "Shelf A"));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(items, item -> {
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        ItemTouchHelper itemTouchHelper = new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(
                0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {
            @Override
            public boolean onMove(@NonNull RecyclerView recyclerView,
                                   @NonNull RecyclerView.ViewHolder viewHolder,
                                   @NonNull RecyclerView.ViewHolder target) {
                return false;
            }

            @Override
            public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
                adapter.removeItem(viewHolder.getAdapterPosition());
            }
        });
        itemTouchHelper.attachToRecyclerView(recyclerView);

        EditText nameInput = findViewById(R.id.nameInput);
        EditText quantityInput = findViewById(R.id.quantityInput);
        EditText locationInput = findViewById(R.id.locationInput);
        Button addItemButton = findViewById(R.id.addItemButton);

        addItemButton.setOnClickListener(v -> {
            String name = nameInput.getText().toString().trim();
            String quantityText = quantityInput.getText().toString().trim();
            String location = locationInput.getText().toString().trim();

            if (name.isEmpty() || location.isEmpty()) {
                return;
            }

            int quantity;
            try {
                quantity = Integer.parseInt(quantityText);
            } catch (NumberFormatException e) {
                return;
            }

            adapter.addItem(new Item(name, quantity, location));

            ContentValues values = new ContentValues();                                 // ← new
            values.put("name", name);                                                    // ← new
            values.put("quantity", quantity);                                            // ← new
            values.put("location", location);                                            // ← new
            dbHelper.getWritableDatabase().insert("items", null, values);                // ← new

            nameInput.setText("");
            quantityInput.setText("");
            locationInput.setText("");
        });

        Button settingsButton = findViewById(R.id.settingsButton);
        settingsButton.setOnClickListener(v ->
                startActivity(new Intent(InventoryActivity.this, SettingsActivity.class)));
    }

    @Override
    protected void onResume() {
        super.onResume();
        SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE);
        int threshold = prefs.getInt("low_stock_threshold", 5);
        adapter.setLowStockThreshold(threshold);
    }
}
```

### Mechanical Walkthrough

- `private DatabaseHelper dbHelper;` — a field, for the same reason
  `adapter` became one in Lesson 10: nothing outside `onCreate` needs
  it yet in this lesson, but keeping the database connection reachable
  for the rest of the class's lifetime, rather than reopening it
  repeatedly, is the correct default.
- `dbHelper.getWritableDatabase()` — returns the real `SQLiteDatabase`
  object to run operations against, triggering `onCreate`/`onUpgrade`
  internally if needed, the first time it's called.
- `new ContentValues()` — a `Map`-like, string-keyed container
  purpose-built for describing one row's column values before an
  insert.
- `values.put("name", name)` — `ContentValues.put`, overloaded across
  types the same way `Intent.putExtra` was back in Lesson 8 — one
  `put` per column, matched by the exact column name string used in
  `CREATE TABLE`.
- `dbHelper.getWritableDatabase().insert("items", null, values)` — the
  table name, an optional "null column hack" (a SQLite quirk for
  inserting an all-default row — irrelevant here, always `null` in
  practice), and the `ContentValues` to insert. Runs *in addition to*
  `adapter.addItem(...)`, not instead of it — the in-memory list still
  drives what's on screen right now; the database call is this
  lesson's entire new contribution, running silently alongside it.

### CS Lens

Keying a row's values by column name string (`"name"`, `"quantity"`,
`"location"`) rather than by a typed field is the same
**string-keyed dictionary passing** idea `Bundle`/`Intent` extras
already used back in Lesson 8 — the same real tradeoff applies too: a
typo in a key string compiles fine and fails silently or with a
runtime error, never a compile-time one.

### SE Lens

**Why does `insert` run after `adapter.addItem(...)`, in the exact same
click handler, instead of somewhere else entirely?** Because both
calls are really the same user action — "a new item was just
confirmed" — happening in two places that currently have no connection
to each other at all: the in-memory list (what's on screen right now)
and the database (what survives the app closing). Keeping both writes
directly next to each other, in the same handler, makes that
duplication visible and honest rather than hidden across separate
files — a real, temporary seam this lesson leaves exposed on purpose,
which Lesson 13 closes by making the database the *only* source of
truth the list reads from, rather than two things kept in sync by
hand.

---

## Connect the Pieces

Full trace: the user types a name, quantity, and location and taps
"Add" → the existing validation (`try`/`catch` around
`Integer.parseInt`, Lesson 9) runs exactly as before → `adapter.addItem(...)`
updates what's on screen, unchanged from Lesson 9 → a new
`ContentValues` object packages the same three values by column name →
`dbHelper.getWritableDatabase().insert("items", null, values)` writes
them into `pocketinventory.db`, a real file on the device's disk,
created once by `onCreate` the very first time this database was ever
opened. Close the app entirely and reopen it: the screen still shows
the same five hardcoded items (nothing reads from the database yet),
but the row you added is still sitting in the real file underneath —
provable by re-adding it and watching the primary key climb past where
it left off, or by inspecting the file directly, per this lesson's
exercises.

## What Breaks Without This

Temporarily misspell one of `ContentValues`'s keys — change
`values.put("location", location);` to
`values.put("locaton", location);` (a typo, one letter dropped) — and
run the app. Add a new item. Real, representative failure: the app
does **not** crash. `insert` succeeds silently, creating a row where
the `location` column is simply left at its default (`NULL`), because
`ContentValues` has no way to know `"locaton"` was meant to be
`"location"` — it just writes whatever key you gave it. This is the
exact silent-failure shape named in this unit's own CS Lens, now felt
directly rather than just described. Restore the correct key
afterward.

## Exercises

1. Add a fourth item through the running app, then fully close and
   reopen it (per Lesson 10's own process-death test — swipe away in
   Recent Apps, not just press Home). Add a fifth item and confirm,
   via Logcat or a temporary `Log.d` of the row ID `insert` returns,
   that its primary key continues climbing from where the fourth one
   left off — proof the table itself, not just the running process,
   remembers how many rows have ever existed.
2. Open Android Studio's **Device File Explorer** (`View → Tool Windows
   → Device File Explorer`) and locate the actual `pocketinventory.db`
   file at `data/data/com.yourname.pocketinventory/databases/` — confirm
   a real binary SQLite file exists on simulated disk, the literal
   thing `getWritableDatabase()` has been writing into the whole
   time.

## Definition of Done

- [ ] You ran the throwaway `ScratchDbHelper` lab and watched a row's
      primary key climb across two full process restarts, then deleted
      it entirely.
- [ ] `DatabaseHelper` creates a real `items` table with columns
      matching `Item`'s three fields plus a primary key.
- [ ] Adding an item through the running app writes a real row into
      `pocketinventory.db`, confirmed via Device File Explorer or a
      row-ID check across a full app restart.
- [ ] You broke a `ContentValues` key on purpose, saw the silent
      failure, and restored it.
- [ ] You can explain, in your own words, why the on-screen list still
      shows the same five items after a restart even though the
      database itself is correctly gaining new rows.
- [ ] Commit: message explaining why (e.g. "Write new items into a
      real SQLite database alongside the existing in-memory list,
      since a growing collection of structured records needs a real
      relational store, not a single SharedPreferences value").

Lesson 13 is next: the on-screen list still loads the same five
hardcoded items every launch — replacing that with a real `SELECT`
that loads every saved row back from `pocketinventory.db`, and wiring
Lesson 11's swipe-to-delete to actually remove a row from the database,
not just the screen.
