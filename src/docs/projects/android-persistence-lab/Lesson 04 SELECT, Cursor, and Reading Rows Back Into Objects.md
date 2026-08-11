# Lesson 04: `SELECT`, `Cursor`, and Reading Rows Back Into Objects

**What you will build:** A real `getAllItems()` method on `ItemRepository`
that reads every row out of the real `items` table and converts each one
into a real `InventoryItem` object — then `InventoryActivity` wired to
display that real list on launch, and its existing "Add Item" flow
wired to write through the real database instead of only an in-memory
`ArrayList`. After this lesson, adding a row and restarting the app
shows the same row again — the grid's data genuinely survives the
process ending, for the first time.

**What you need to know first:** Lesson 03 (`ItemRepository`, `addItem`,
`ContentValues`). `android-ui-foundations` in full — specifically
Lesson 20 (`ArrayList<E>`), Lesson 22 (`InventoryItem`), Lessons 26–29
(`InventoryAdapter`, the grid's real `RecyclerView`, `notifyItemInserted`).

**Terms introduced in this lesson:**
- **`SELECT`** — the SQL statement that reads rows back out of a table,
  optionally filtered and ordered, without changing anything.
- **`Cursor`** — Android's real, live position over a query's result
  set — not a copy of the data sitting in memory all at once, a moving
  pointer you advance one row at a time.
- **Row mapping** — this lesson's own informal name for the mechanical
  step of turning one `Cursor` row into one real Java object, field by
  field, by column name.

**Objects and methods used:**

**`SQLiteDatabase.query(String, String[], String, String[], String, String, String)`**
- *What it is:* the method that runs a real `SELECT` and hands back a
  live result set.
- *Implementation:* `public Cursor query(String table, String[]
  columns, String selection, String[] selectionArgs, String groupBy,
  String having, String orderBy)`, real declared signature confirmed
  this session against Android's own reference documentation (mirrored
  at Microsoft's .NET-for-Android API docs, which link back to
  `developer.android.com`'s own reference for the same method).
  Returns a `Cursor` object, positioned *before* the first row — moving
  it is the caller's job, covered below. `columns = null` means "all
  columns"; `selection`/`selectionArgs` work exactly like `?`
  placeholders in `INSERT` (Lesson 03) — real parameter binding, never
  string concatenation, for the same SQL-injection reasons already
  proven there.
- *Its use:* called once inside `getAllItems()`, with no `WHERE` clause
  at all — every row in `items`, ordered by name.

**`Cursor`**
- *What it is:* Android's real, live position over a `SELECT`'s result
  set.
- *Implementation:* an interface, not a concrete data holder — the five
  methods this lesson actually calls, exact declared shapes confirmed
  this session against Android's own reference documentation:
  ```java
  boolean moveToNext();               // advances one row; false once past the last row
  int getColumnIndexOrThrow(String columnName); // real column position, or throws
  long getLong(int columnIndex);      // this row's value in that column, as a long
  String getString(int columnIndex);  // this row's value in that column, as a String
  int getInt(int columnIndex);        // this row's value in that column, as an int
  void close();                       // releases the Cursor's real underlying resources
  ```
  `getColumnIndexOrThrow` throws `IllegalArgumentException` — real,
  documented behavior, not an inferred guess — the moment the column
  name doesn't exist, rather than silently returning a sentinel a
  caller might forget to check.
- *Its use:* the return value of `query`, walked one row at a time
  inside `getAllItems()`, and explicitly closed once every row has been
  read.

---

## Concept Unit: `SELECT` Reads Rows Back Without Changing Anything

### The Problem

Lesson 03 proved `INSERT` writes one new row. Nothing so far has proven
that a row, once written, can actually be read back — or what "reading
it back" even returns: one value, all values at once, or something else
entirely.

### Introduce the Concept in Isolation

Real `sqlite3`, the same engine `android.database.sqlite` wraps, proving
`SELECT` directly before any Android API enters the picture:

```bash
rm -f select_demo.db
sqlite3 select_demo.db "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 0);"
sqlite3 select_demo.db "INSERT INTO items (name, quantity) VALUES ('Bolts', 120);"
sqlite3 select_demo.db "INSERT INTO items (name, quantity) VALUES ('Washers', 85);"
sqlite3 select_demo.db "INSERT INTO items (name, quantity) VALUES ('Nuts', 200);"
sqlite3 -header -column select_demo.db "SELECT id, name, quantity FROM items ORDER BY name;"
```

Real output, from running this just now:

```
id  name     quantity
--  -------  --------
1   Bolts    120
3   Nuts     200
2   Washers  85
```

### Mechanical Walkthrough

- `SELECT id, name, quantity FROM items` — names exactly which columns
  to return, and from which table; naming them explicitly (rather than
  `SELECT *`) is a real, deliberate habit worth starting now — a later
  schema change that adds a column never silently changes what an
  explicit `SELECT` returns.
- `ORDER BY name` — **first appearance.** Requests a specific row order
  from the database engine itself, rather than whatever order rows
  happen to sit in on disk (notice the *inserted* order was Bolts,
  Washers, Nuts — the *real, requested* output order is alphabetical:
  Bolts, Nuts, Washers).
- The result — three whole rows, all three columns each, all at once —
  is the *conceptual* shape `SELECT` returns. Android's real `Cursor`,
  next, returns this same information, but never all three rows in
  memory at once the way this terminal output shows them; that
  distinction is this lesson's actual point.

### Discard the Throwaway Example

```bash
rm -f select_demo.db
```

The real mechanism — `SELECT` reads, filters, and orders rows without
writing anything — carries forward into `SQLiteDatabase.query`, next.

### CS Lens

`SELECT` is a **pure read** — running it twice in a row, with nothing
else changing in between, produces the identical result both times. This
is the same **idempotent** shape already named for
`ContextCompat.checkSelfPermission` in `android-ui-foundations` Lesson 31:
calling a read-only operation any number of times has the same effect as
calling it once, as opposed to `INSERT` (Lesson 03), which genuinely
changes the database's state every time it runs.

Also recognized in: HTTP's own `GET` versus `POST` distinction (`GET` is
specified to be safe and idempotent for exactly this reason), and any
API design that separates "operations that only observe state" from
"operations that change it."

### SE Lens

**Why order rows in the database query at all, instead of just reading
them back in whatever order and sorting them afterward in Java?** SQLite
is specifically built and optimized to sort rows efficiently, including
using an index when one exists on the sorted column (none does yet,
here — a later concern once this table has real scale). Reading rows
back in arbitrary order and sorting them in application code duplicates
work the database already does correctly, and throws away the option to
let the database use an index for it later with zero application-code
changes.

---

## Concept Unit: `Cursor` — Reading One Row at a Time, Not All at Once

### The Problem

The `sqlite3` output above showed all three rows at once, printed to a
terminal. A real, growing `items` table might have thousands of rows —
loading every single one into memory simultaneously, every time the grid
opens, is real, unnecessary memory pressure for data the screen can only
show a handful of at a time anyway.

### The Contract You're Reading From (from `android.database.Cursor`, not your code)

`Cursor`'s real declared shape, the four methods this lesson actually
calls — confirmed this session against Android's own reference
documentation:

```java
boolean moveToNext();
int getColumnIndexOrThrow(String columnName);
long getLong(int columnIndex);
String getString(int columnIndex);
int getInt(int columnIndex);
void close();
```

Read this precisely: a `Cursor` is **not** a `List` of rows sitting fully
built in memory — Lesson 20's `ArrayList<E>` genuinely holds every
element at once; a `Cursor` holds a live *position* over the database
engine's own result set, one row at a time. `moveToNext()` — real,
documented behavior — "move[s] the cursor to the next row," returning
`false` the moment there isn't one, which is exactly the loop-termination
signal `getAllItems()` uses below. A brand-new `Cursor`, before
`moveToNext()` is ever called, is positioned **before** the first row —
calling `getString`/`getInt`/`getLong` before the first `moveToNext()`
call is a real, documented misuse, not something this lesson's own code
ever does, since the loop always calls `moveToNext()` first.

### Mechanical Walkthrough

- `boolean moveToNext()` — the method this lesson's `while` loop
  condition calls directly, below; advances the live position one row,
  returning whether a row was actually there to advance to.
- `int getColumnIndexOrThrow(String)` — real, position-independent
  column lookup by name, called fresh on every row inside the loop; the
  method this lesson's "What Breaks Without This" triggers directly with
  a misspelled column name.
- `long getLong(int)` / `String getString(int)` / `int getInt(int)` —
  the three type-specific readers this lesson's schema actually needs:
  `id` (`INTEGER`, read as `long` to match `InventoryItem`'s new field),
  `name` (`TEXT`), `quantity` (`INTEGER`, read as `int`) — each takes
  the column's real position, not its name; that lookup is
  `getColumnIndexOrThrow`'s own job, one line above each call site.
- `void close()` — releases the `Cursor`'s real underlying resources;
  called exactly once, after the loop finishes, inside the `finally`
  block `getAllItems()` builds below — never called mid-loop, since
  every remaining row still needs it open.

### CS Lens

A `Cursor` is the **iterator pattern** — an object providing sequential
access to a collection's elements one at a time, without exposing the
collection's own internal structure or requiring the whole thing to
exist in memory at once. `moveToNext()` returning `false` at the end is
the same "keep going until told to stop" shape as Java's own
`Iterator.hasNext()`/`.next()` pair, expressed with one combined method
instead of two.

Also recognized in: Java's own `Iterator` interface across every
standard-library collection, a file-reading API that hands back one line
at a time instead of the whole file's contents at once, and a paginated
web API that returns one page of results plus a "next page" token rather
than every result in a single response.

### SE Lens

**Why does `Cursor` require an explicit `close()` call at all, instead of
Java's garbage collector eventually cleaning it up automatically, the
way an ordinary object works?** A `Cursor` holds onto real, underlying
resources — an open connection to the result set inside SQLite's own
engine — that the JVM's garbage collector has no visibility into and no
reason to reclaim promptly; an unclosed `Cursor` can hold that resource
open for as long as the object happens to survive, which is a real,
observable leak over many repeated queries, not a hypothetical concern.
Requiring an explicit `close()` puts that decision under this project's
own control, at the exact moment the data has genuinely been fully read
— covered concretely in "What Breaks Without This," below.

---

## Concept Unit: `getAllItems()` — Real Rows Into Real Objects

### The Problem

`InventoryItem` (`android-ui-foundations` Lesson 22) has a `name` and a
`quantity` — enough to display a row, but nothing that uniquely
identifies *which* real database row it came from. Later lessons in this
series — `UPDATE` (Lesson 07), `DELETE` (Lesson 08) — need to target one
exact row, and a name alone isn't guaranteed unique (two different rows
could legitimately both be named "Bolts"). The real table already has
exactly the right value for this: its own `id` column, `INTEGER PRIMARY
KEY AUTOINCREMENT` (Lesson 02) — nothing new to add to the database,
only to `InventoryItem` itself.

### Project Change

- **Reference Source:** No external framework signature to cite —
  `InventoryItem` is an application class this project already owns and
  is now extending, and `getAllItems()` is new code in the
  already-existing `ItemRepository`.
- **Files affected:** `InventoryItem.java` (add an `id` field);
  `ItemRepository.java` (add `getAllItems()`).
- **Change type:** Add a field, a getter, and update the constructor;
  add one new method.
- **Dependencies:** None new.

### The New Code

`InventoryItem.java`, the real change:

```java
private final long id;

InventoryItem(long id, String name, int quantity) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
}

long getId() {
    return id;
}
```

`ItemRepository.java`, the new method:

```java
public List<InventoryItem> getAllItems() {
    List<InventoryItem> items = new ArrayList<>();
    SQLiteDatabase db = databaseHelper.getReadableDatabase();
    Cursor cursor = db.query("items", null, null, null, null, null, "name ASC");
    try {
        while (cursor.moveToNext()) {
            long id = cursor.getLong(cursor.getColumnIndexOrThrow("id"));
            String name = cursor.getString(cursor.getColumnIndexOrThrow("name"));
            int quantity = cursor.getInt(cursor.getColumnIndexOrThrow("quantity"));
            items.add(new InventoryItem(id, name, quantity));
        }
    } finally {
        cursor.close();
    }
    return items;
}
```

### The Updated Project

`InventoryItem.java` in full:

```java
package com.yourname.yourapp;

class InventoryItem {
    private final long id;
    private String name;
    private int quantity;

    InventoryItem(long id, String name, int quantity) {  // ← changed: id added
        this.id = id;                                     // ← new
        this.name = name;
        this.quantity = quantity;
    }

    long getId() {           // ← new
        return id;
    }

    String getName() {
        return name;
    }

    int getQuantity() {
        return quantity;
    }

    void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
```

`ItemRepository.java` in full:

```java
package com.yourname.yourapp;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import java.util.ArrayList;
import java.util.List;

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

    public List<InventoryItem> getAllItems() {          // ← new
        List<InventoryItem> items = new ArrayList<>();
        SQLiteDatabase db = databaseHelper.getReadableDatabase();
        Cursor cursor = db.query("items", null, null, null, null, null, "name ASC");
        try {
            while (cursor.moveToNext()) {
                long id = cursor.getLong(cursor.getColumnIndexOrThrow("id"));
                String name = cursor.getString(cursor.getColumnIndexOrThrow("name"));
                int quantity = cursor.getInt(cursor.getColumnIndexOrThrow("quantity"));
                items.add(new InventoryItem(id, name, quantity));
            }
        } finally {
            cursor.close();
        }
        return items;
    }
}
```

### Mechanical Walkthrough

- `private final long id;` — reappearing (`android-ui-foundations`
  Lesson 13's `private`/`final`), a genuinely new field: every
  `InventoryItem` now carries the exact real row it came from, not just
  display data.
- `InventoryItem(long id, String name, int quantity)` — the constructor
  signature changes; every existing call site that builds an
  `InventoryItem` now needs a real `id` — deliberately a compile error
  everywhere it's missed, rather than a silently-optional value.
- `long getId()` — reappearing getter pattern (Lesson 22), the read
  access this new `private final` field requires.
- `db.getReadableDatabase()` — the read counterpart to Lesson 03's
  `getWritableDatabase()`; both return the same real, single database
  connection `SQLiteOpenHelper` manages, and either one works for a
  read, but naming intent (`Readable` for a `SELECT`, `Writable` for an
  `INSERT`) documents which operation each method actually performs.
- `db.query("items", null, null, null, null, null, "name ASC")` — the
  real call this Concept Unit's contract described: `"items"` the table,
  `null` for columns (every column), `null`/`null` for
  `selection`/`selectionArgs` (no filter — every row), `null`/`null` for
  `groupBy`/`having` (no grouping), `"name ASC"` for `orderBy` — the same
  real ordering the `sqlite3` lab proved above.
- `while (cursor.moveToNext())` — **first appearance of the real
  Cursor-walking loop.** Advances one row at a time; the loop body runs
  once per real row, and stops the instant `moveToNext()` reports there
  isn't a next one — an empty table runs the loop body zero times, with
  no special-casing needed anywhere in this code.
- `cursor.getColumnIndexOrThrow("id")` (and its two siblings) — looked up
  fresh, by name, on every row inside the loop; a real, small,
  repeated cost, in exchange for code that reads column values by name
  (`"name"`, `"quantity"`) rather than by a fragile positional number
  that silently breaks the moment a column is added or reordered in a
  future schema change.
- `cursor.getLong(...)`/`getString(...)`/`getInt(...)` — each reads
  *this row's* value in the given column index, converted to the
  requested Java type; calling the wrong one (`getInt` on a `TEXT`
  column, for instance) is a real, documented way to get a wrong or
  garbage value back, not something this lesson's own code risks, since
  each call here matches the real column type declared in Lesson 02's
  schema.
- `items.add(new InventoryItem(id, name, quantity))` — reappearing
  `new`/`ArrayList.add` (Lessons 20 and 22), now building a real object
  from a real row instead of a hardcoded literal.
- `try { ... } finally { cursor.close(); }` — **first appearance.**
  Guarantees `close()` runs whether the loop finishes normally or an
  exception is thrown partway through reading a row — a `finally` block
  runs in both cases, the exact guarantee this lesson's "What Breaks
  Without This" needs `close()` to have.

### CS Lens

Converting one external, foreign representation (a database row) into
one of this project's own real objects (`InventoryItem`), row by row, is
the **mapper** pattern — a small, dedicated translation step keeping
"how data is stored" (SQL rows, column names) and "how this project's
own code thinks about the data" (a real `InventoryItem` object) as two
separate concerns that can each change independently. Nothing in
`InventoryAdapter` (`android-ui-foundations` Lesson 26) needs to know
`items` even a `Cursor` or a database exists at all.

Also recognized in: an ORM (object-relational mapper) library doing this
exact row-to-object conversion automatically instead of by hand, and any
API client that converts a raw JSON response into typed objects before
handing it to the rest of an application.

### SE Lens

**Why build a whole `List<InventoryItem>` in memory at all, instead of
handing the `RecyclerView` the live `Cursor` directly and letting it
read rows on demand as the user scrolls?** Android does offer this
(`CursorAdapter`, a real, older alternative) — but it couples the
`Adapter` directly to a specific `Cursor`'s lifetime and column layout,
the same tight-coupling cost `android-ui-foundations` Lesson 18 already
weighed choosing `RecyclerView.Adapter` over `GridView`. Converting to a
plain `List<InventoryItem>` once, up front, keeps `InventoryAdapter`
completely unaware persistence exists at all — the exact same adapter
class written in `android-ui-foundations` before any database existed
still works, unchanged, real proof that the mapping step earns its keep.

---

## Concept Unit: Wiring the Grid to Real Data

### The Problem

`InventoryActivity` (`android-ui-foundations` Lesson 28) currently
builds its list from three hardcoded `new InventoryItem(...)` calls
inside `onCreate`, and its "Add Item" dialog only ever calls
`items.add(...)` — a real, growing in-memory list, but one that starts
over from the same three hardcoded rows every time the app restarts.
Both need to go through the real `ItemRepository` this lesson just
finished.

### Project Change

- **Reference Source:** No external framework signature — wiring
  together two already-real classes this project owns.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Replace the hardcoded list construction; change
  `addItem` to write through the repository first.
- **Dependencies:** `ItemRepository`, `DatabaseHelper` (Lessons 01–04).

### The New Code

Replacing the three hardcoded lines inside `onCreate`:

```java
ItemRepository repository = new ItemRepository(new DatabaseHelper(this));
List<InventoryItem> items = repository.getAllItems();
```

The existing `addItem` method, now writing through the repository first:

```java
private void addItem(String name, int quantity) {
    long newId = repository.addItem(name, quantity);
    items.add(new InventoryItem(newId, name, quantity));
    adapter.notifyItemInserted(items.size() - 1);
}
```

### The Updated Project

```java
package com.yourname.yourapp;

public class InventoryActivity extends AppCompatActivity {
    private ItemRepository repository;         // ← new
    private List<InventoryItem> items;
    private InventoryAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        repository = new ItemRepository(new DatabaseHelper(this));  // ← new
        items = repository.getAllItems();                           // ← changed

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(items);
        recyclerView.setAdapter(adapter);

        Button addItemButton = findViewById(R.id.addItemButton);
        addItemButton.setOnClickListener((view) -> showAddItemDialog());
    }

    private void showAddItemDialog() {
        // Unchanged from android-ui-foundations Lesson 28
    }

    private void addItem(String name, int quantity) {
        long newId = repository.addItem(name, quantity);   // ← new
        items.add(new InventoryItem(newId, name, quantity)); // ← changed
        adapter.notifyItemInserted(items.size() - 1);
    }
}
```

### Mechanical Walkthrough

- `private ItemRepository repository;` — a new field, the same
  Lesson-13-style reasoning as `adapter`: `addItem` (a different method)
  needs to reach it too, so it can't stay a local variable confined to
  `onCreate`.
- `repository = new ItemRepository(new DatabaseHelper(this));` —
  reappearing construction pattern (Lesson 03's own verification code),
  now permanent, real project wiring instead of a temporary check.
- `items = repository.getAllItems();` — replaces the three hardcoded
  `items.add(...)` calls entirely; on a brand-new install with an empty
  table, this correctly returns an empty list — no crash, no special
  case, the grid simply starts blank until a real row is added.
- `long newId = repository.addItem(name, quantity);` — **first
  appearance of the add flow writing to the real database.** Reuses
  Lesson 03's `addItem` unchanged; the returned real row `id` is exactly
  what `InventoryItem`'s new constructor requires.
- `items.add(new InventoryItem(newId, name, quantity))` — changed only
  in which constructor it calls; `notifyItemInserted` immediately after
  is unchanged from `android-ui-foundations` Lesson 28 — `RecyclerView`
  has no idea the row now also lives on disk.

### CS Lens

`getAllItems()` at launch plus `repository.addItem(...)` on every add is
the simplest real consistency strategy available: the in-memory `items`
list and the database table are kept in sync by *always going through
the repository first*, then updating the in-memory copy to match what
was actually written — never the other way around. This ordering
matters: if `items.add(...)` ran before `repository.addItem(...)` and
the write then failed, the grid would show a row that was never actually
saved.

### SE Lens

**Why re-read the entire table with `getAllItems()` once at launch,
rather than keeping the in-memory list and the database perfectly
synchronized incrementally from the very first run?** A fresh read at
launch is simple and correct by construction — whatever the database
genuinely contains *is* what the screen shows, with no way for the two
to have quietly drifted apart from an earlier, forgotten edge case. The
cost is exactly one query per screen open, negligible at this project's
real scale; an app with a much larger table would need a more careful
incremental strategy, but "just re-read it" is the honestly correct
starting point here, not a shortcut to fix later.

---

## Connect the Pieces

One trace, start to finish: `InventoryActivity.onCreate` now calls
`repository.getAllItems()`, which runs a real `SELECT` via
`db.query(...)`, walks the real `Cursor` one row at a time with
`moveToNext()`, reads each column by name, and builds one real
`InventoryItem` per row — closing the `Cursor` once every row is read.
Tapping "Add Item" now calls `repository.addItem(...)` first, writing a
real row via Lesson 03's `ContentValues`/`insert`, and only then adds
the same data to the in-memory list `InventoryAdapter` already displays.
Restarting the app runs `getAllItems()` again, and the added row is
still there — not because anything remembers it in memory, but because
it was never only in memory to begin with.

## What Breaks Without This

Two real, separate failures, both worth triggering directly:

**Forgetting `cursor.close()`.** Remove the `finally` block, leaving
`cursor.close()` uncalled. This is genuinely Android-only behavior — no
plain-JVM equivalent proves it the way `javac`/`java` proved earlier
lessons' claims — so verify it on-device instead: repeatedly open and
close `InventoryActivity` (back button, then reopen) 20–30 times in a
row, watching Android Studio's **Logcat**, filtered for `SQLiteConnectionPool`
or `SQLiteCursor`. Real, documented behavior: an unclosed `Cursor`
being garbage-collected instead of explicitly closed produces a Logcat
warning naming the leaked resource — direct, on-device proof this isn't
a hypothetical concern. Restore the `finally` block before moving on.

**A wrong column name.** Temporarily change
`cursor.getColumnIndexOrThrow("quantity")` to
`cursor.getColumnIndexOrThrow("quantityy")` (an extra letter) and run
the app. Real, documented result: `getColumnIndexOrThrow` throws
`IllegalArgumentException` naming the exact missing column, the moment
`getAllItems()` runs — a real, immediate crash rather than a silently
wrong value, exactly the contract this lesson's Concept Unit quoted
directly from Android's own reference documentation. Fix the typo before
moving on.

## Exercises

1. Add a `WHERE` clause for real: change `db.query`'s `selection`
   argument from `null` to `"quantity < ?"` and `selectionArgs` from
   `null` to `new String[]{"100"}`, confirming only low-stock items come
   back — direct, observed proof the same `?`-placeholder parameter
   binding from Lesson 03's `INSERT` also applies to `SELECT`'s own
   `selection` argument.
2. Change `orderBy` from `"name ASC"` to `"quantity DESC"` and confirm
   the grid's row order changes to match, with zero changes anywhere in
   `InventoryAdapter` — direct proof the adapter genuinely doesn't care
   where its list's order comes from.
3. Add a temporary `Log.d` printing `items.size()` immediately after
   `getAllItems()` returns, on a fresh install versus after adding a few
   rows and restarting — confirm the count is real and persists exactly
   as `INSERT`'s own real, on-disk effect predicts.

## Definition of Done

- [ ] You ran the `sqlite3` lab yourself and saw real, ordered rows come
      back from a real `SELECT`.
- [ ] You can explain, precisely, why a `Cursor` is not the same thing
      as a `List` already holding every row.
- [ ] `InventoryItem` now carries a real `id`; every constructor call
      site was updated, not left broken.
- [ ] The grid shows real rows from the database on launch, including
      correctly showing nothing on a brand-new install with an empty
      table.
- [ ] Adding a row, then fully closing and reopening the app, shows the
      added row still there — the actual, working proof this lesson
      exists to deliver.
- [ ] You triggered the real `IllegalArgumentException` from a wrong
      column name, and restored the correct one.
- [ ] You performed the repeated open/close Logcat check for an
      unclosed `Cursor`, and restored the `finally` block.
- [ ] Commit: `git commit -m "Read real rows via SELECT/Cursor; wire the
      grid and Add flow to the database instead of in-memory data"` —
      explaining what became persistent, not just the new method.

Next: real login — checking a typed username and password against a
real `users` table row, instead of accepting anything typed at all.
