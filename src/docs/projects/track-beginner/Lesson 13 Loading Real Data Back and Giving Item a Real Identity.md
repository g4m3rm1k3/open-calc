# Lesson 13: Loading Real Data Back — Giving `Item` a Real Identity

**What you will build:** The app finally loads its item list *from* the
real database on every launch — the five hardcoded seed items are gone
for good, replaced by whatever `pocketinventory.db` actually contains.
Swiping a row away now deletes it from the database too, not just the
screen — the last piece of Lesson 11's own promise, "a swiped-away row
is gone from the screen the same way an added one only ever lived in
memory, until real item persistence arrives." It has arrived.

**What you need to know first:** Lesson 12 (`DatabaseHelper`, the real
`items` table, inserting a new row on Add). Lesson 11 (swipe-to-delete,
in-memory only until now). Lesson 8 (constructor overloading —
`Item` gains a second constructor the exact same way `Parcelable`'s
`Item` did).

**Terms introduced in this lesson:**
- **`Cursor`** — an object representing a *position within* a query's
  result rows, not the rows themselves loaded all at once; the same
  "don't materialize everything up front" idea `RecyclerView`'s own
  `ViewHolder` recycling already proved.
- **`rawQuery(String sql, String[] selectionArgs)`** — runs a `SELECT`
  statement and returns a `Cursor` to walk its results.
- **`cursor.moveToNext()`** — advances the cursor to the next row,
  returning `true`, or `false` once there are no more rows.
- **`cursor.getInt(index)` / `getString(index)`** — reads a column's
  value at the cursor's current row, by integer position in the
  `SELECT` clause's own column order.
- **`db.delete(table, whereClause, whereArgs)`** — deletes every row
  matching a `WHERE`-style condition, with `?` placeholders filled in
  from `whereArgs` — the same parameterized-value idea `insert`'s
  `ContentValues` already used, applied to a condition instead of a
  full row.

---

## Concept Unit: Giving `Item` a Real Primary Key

### The Problem

`Item.java` still has no equivalent of the `items` table's own `id`
column — Lesson 12 named this gap directly and deferred it. Deleting
*this specific row and no other* requires exactly that stable
identifier; matching by name, quantity, and location instead would
silently delete the wrong row the moment two items ever shared all
three values.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Item.java`.
- **Change type:** Add.
- **Dependencies:** none new.

### The New Code

```java
private final int id;

public Item(int id, String name, int quantity, String location) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.location = location;
}

public int getId() {
    return id;
}
```

### The Updated Project

```java
package com.yourname.pocketinventory;

public class Item {
    private final int id;                                                    // ← new
    private final String name;
    private int quantity;
    private final String location;

    public Item(String name, int quantity, String location) {
        this(0, name, quantity, location);                                    // ← new
    }

    public Item(int id, String name, int quantity, String location) {        // ← new
        this.id = id;                                                          // ← new
        this.name = name;                                                     // ← new
        this.quantity = quantity;                                             // ← new
        this.location = location;                                             // ← new
    }                                                                          // ← new

    public int getId() {                                                      // ← new
        return id;                                                            // ← new
    }                                                                          // ← new

    public String getName() {
        return name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getLocation() {
        return location;
    }
}
```

The original three-argument constructor is kept, not deleted — every
existing call to `new Item(name, quantity, location)` (the Add form,
Lesson 9; the five old seed lines, about to be deleted anyway) keeps
compiling unchanged, defaulting `id` to `0` for an item that has never
been assigned a real database identity yet.

### Mechanical Walkthrough

- `private final int id;` — reappearing (`private final` field,
  already-basic), the exact new column this lesson's later units read
  back from the database.
- `public Item(String name, int quantity, String location) { this(0, name, quantity, location); }`
  — **first appearance of one constructor calling another.**
  `this(...)`, used as a constructor's very first statement, calls a
  *different* constructor on the same class rather than a parent's —
  contrast `super(...)`, which always calls the parent's constructor.
  This is constructor overloading (Lesson 8's `Item(Parcel in)`) used
  in a new way: instead of two independent bodies, the simpler
  constructor delegates to the fuller one, so the "set every field"
  logic exists in exactly one place.
- `public Item(int id, String name, int quantity, String location)` —
  reappearing (constructor overloading), the fuller version other code
  now delegates to.
- `public int getId()` — reappearing (getter/accessor, Lesson 7),
  applied to the one field this project has never needed to read back
  out until now.

### CS Lens

`this(...)` delegating to a fuller constructor is **constructor
chaining** — concentrating "how to fully initialize this object" in
one place, with every other constructor calling into it rather than
duplicating the same field assignments. Also recognized in: C#'s
identical `: this(...)` syntax, Python's convention of one `__init__`
calling a classmethod factory for simpler cases, and any function with
multiple overloads that all funnel into one "does the real work"
implementation to avoid three copies of the same logic silently
drifting apart.

### SE Lens

**Why keep the old three-argument constructor at all, instead of just
changing every call site to pass `0` explicitly?** Because every
existing caller — the Add form's `new Item(name, quantity, location)`
— has no *meaningful* id to pass yet; a real `Item` doesn't get one
until the database actually assigns it, several lines later. Forcing
every caller to type a placeholder `0` by hand would be both more
typing and, worse, would make `0` look like a deliberate choice instead
of the "no real id yet" default it actually is. Keeping both
constructors lets each caller use whichever one actually matches what
it knows at that point — new items build without an id; items loaded
back from the database, next, provide the real one.

---

## Concept Unit: `SELECT` and `Cursor` — Reading Rows Back

### The Problem

Every item added since Lesson 12 has been written into
`pocketinventory.db`, but nothing reads it back — the on-screen list
still starts from the same five hardcoded lines every single launch.

### Introduce the Concept in Isolation

This project's own `items` table, already populated by whatever you've
added through the running app, is the fastest way to prove this
mechanism — no separate scratch table needed this time. Temporarily
add this to the end of `InventoryActivity.onCreate`, after the existing
setup:

```java
SQLiteDatabase readDb = dbHelper.getWritableDatabase();
Cursor cursor = readDb.rawQuery("SELECT id, name, quantity, location FROM items", null);
while (cursor.moveToNext()) {
    int scratchId = cursor.getInt(0);
    String scratchName = cursor.getString(1);
    android.util.Log.d("ScratchRead", scratchId + ": " + scratchName);
}
cursor.close();
```

Run the app on your emulator. Logcat prints one line per row currently
in the table, in whatever order SQLite happens to return them — every
item you've added since Lesson 12, still there, confirmed by reading
it back through a brand-new `Cursor` rather than trusting it's there
from memory.

#### Execution Trace

Assume two rows already exist (ids `1` and `2`, added earlier through
the running app):

1. `cursor.moveToNext()` — returns `true`, because a first row is
   waiting in the result set, advancing the cursor onto it and making
   `scratchId = 1` and `scratchName` readable through `getInt(0)`/
   `getString(1)` — logs `1: <whatever name row 1 has>`.
2. `cursor.moveToNext()` — returns `true` again, since the result set
   still has a second row left to visit, advancing onto it — logs
   `2: <whatever name row 2 has>`.
3. `cursor.moveToNext()` — returns `false`, since every row from the
   result set has now been consumed — this is what actually causes the
   `while` loop to end; nothing further is logged because no third row
   exists.

### Discard the Throwaway Example

Delete this temporary block. The real version, next, builds real
`Item` objects instead of just logging two fields.

### The New Code — Loading Every Row on Launch

```java
private List<Item> loadItemsFromDatabase() {
    List<Item> loadedItems = new ArrayList<>();
    SQLiteDatabase db = dbHelper.getWritableDatabase();
    Cursor cursor = db.rawQuery("SELECT id, name, quantity, location FROM items", null);
    while (cursor.moveToNext()) {
        int id = cursor.getInt(0);
        String name = cursor.getString(1);
        int quantity = cursor.getInt(2);
        String location = cursor.getString(3);
        loadedItems.add(new Item(id, name, quantity, location));
    }
    cursor.close();
    return loadedItems;
}
```

### The Updated Project

```java
List<Item> items = loadItemsFromDatabase();                                   // ← changed (was five hardcoded items.add(...) calls)
```

The five hardcoded `items.add(new Item(...))` lines that have opened
every version of `onCreate` since Lesson 7 are gone — `items` is now
built entirely from whatever `loadItemsFromDatabase()` actually finds
on disk, empty on a brand-new install, growing with every real item
ever added since.

#### Execution Trace

Assume three rows currently exist in `items` (ids `1`, `2`, `3`, from
earlier Add taps), and `SELECT` returns them in that order:

1. `cursor.moveToNext()` — returns `true`, because a first row is
   waiting in the result set, advancing the cursor onto it and making
   `id = 1` and its matching `name`/`quantity`/`location` available
   through `getInt`/`getString` — `new Item(1, ...)` is built and
   appended to `loadedItems`.
2. `cursor.moveToNext()` — returns `true` again, since the result set
   still has rows left to visit, advancing to the row where `id = 2` —
   another `Item` built and appended.
3. `cursor.moveToNext()` — returns `true` a third time, advancing to
   the row where `id = 3` — the third `Item` built and appended.
4. `cursor.moveToNext()` — returns `false`, because every row from the
   result set has now been consumed — this is what actually causes the
   `while` loop to end; `loadedItems` now holds exactly three `Item`
   objects, matching the three rows that genuinely existed in the
   table.

### Mechanical Walkthrough

- `private List<Item> loadItemsFromDatabase()` — first appearance of a
  method with a real, non-`void` return type doing meaningful work in
  this project. Returns a plain `List<Item>`, not something tied to
  `RecyclerView` directly — this method has no idea it's being called
  from `onCreate`, which keeps it reusable independent of any specific
  screen.
- `db.rawQuery("SELECT id, name, quantity, location FROM items", null)`
  — first appearance of `SELECT` in real project code. Naming all four
  columns explicitly, in the exact order `getInt(0)`/`getString(1)`/
  `getInt(2)`/`getString(3)` below assumes — if this list and that
  order ever disagree, the mismatch fails silently or throws, exactly
  the risk this lesson's own exercises make you feel on purpose.
- `cursor.getInt(0)` / `getString(1)` / `getInt(2)` / `getString(3)` —
  reading each column at the cursor's current row, by position, not by
  name — position `0` is whichever column was listed first in the
  `SELECT` clause, regardless of that column's position inside `CREATE
  TABLE` itself.
- `new Item(id, name, quantity, location)` — the four-argument
  constructor from this lesson's first unit, used for the first time
  for its real purpose: an `Item` that already has a genuine database
  identity, not the placeholder `0`.
- `cursor.close()` — reappearing pattern (closing a resource that holds
  a real OS-level handle, the same obligation `SQLiteDatabase` itself
  carries) — must run even though this method has no `try`/`finally`
  around it yet, which is itself worth noticing as a real, imperfect
  edge of this lesson's code (an exception between `rawQuery` and
  `cursor.close()` would leak the cursor — flagged honestly, not fixed
  here, since introducing `try`/`finally`-for-resource-safety properly
  is more than this lesson's scope).

### CS Lens

`Cursor`'s row-at-a-time traversal, driven by `moveToNext()`, is the
same **iterator pattern** any `foreach`-style loop over a `List` uses
internally — just implemented against a database result set instead of
an in-memory collection, and the same "don't materialize everything up
front" idea `RecyclerView`'s own view recycling already proved. Also
recognized in: file-reading APIs that read one line at a time, Python
generator functions, and paginated REST API responses fetched one page
at a time rather than in one enormous response.

### SE Lens

**Why build a brand-new `List<Item>` inside `loadItemsFromDatabase()`
instead of clearing and refilling the existing `items` list in
place?** Because this method has no reference to the existing list at
all, by design — it's a small, self-contained function that answers
one question ("what's currently saved?") and hands back a fresh
answer, with no side effects on anything that already exists. Handing
back a new list keeps this method testable and reusable on its own
terms, independent of whatever `onCreate` happens to do with the
result.

---

## Concept Unit: Deleting the Real Row

### The Problem

Swiping a row away (Lesson 11) still only ever calls
`adapter.removeItem(position)` — an in-memory removal with no matching
database operation. Reopen the app after swiping an item away, and it
reappears, loaded right back from a database that never heard about
the deletion.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Add.
- **Location:** Inside the `onSwiped` override, alongside the existing
  `adapter.removeItem(...)` call.
- **Dependencies:** `Item.getId()`, this lesson's first unit.

### The New Code

```java
Item removedItem = adapter.getItemAt(viewHolder.getAdapterPosition());
adapter.removeItem(viewHolder.getAdapterPosition());
dbHelper.getWritableDatabase().delete("items", "id = ?",
        new String[]{String.valueOf(removedItem.getId())});
```

`InventoryAdapter` needs one small new method to make `removedItem`
possible — reading an item back out by position, the read-only
counterpart to everything `addItem`/`removeItem` already mutate:

```java
Item getItemAt(int position) {
    return items.get(position);
}
```

### The Updated Project

```java
static class InventoryViewHolder extends RecyclerView.ViewHolder {
    // unchanged
}

Item getItemAt(int position) {                                                // ← new
    return items.get(position);                                              // ← new
}                                                                              // ← new
```

```java
@Override
public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
    int position = viewHolder.getAdapterPosition();                          // ← changed (position read once, reused)
    Item removedItem = adapter.getItemAt(position);                          // ← new
    adapter.removeItem(position);                                            // ← changed (was inline)
    dbHelper.getWritableDatabase().delete("items", "id = ?",                 // ← new
            new String[]{String.valueOf(removedItem.getId())});              // ← new
}
```

### Mechanical Walkthrough

- `adapter.getItemAt(position)` — first appearance. Reads the `Item`
  still sitting at this position *before* it's removed — position has
  to be captured and the item read back *before* calling
  `removeItem`, since the moment `removeItem` runs, that position no
  longer refers to the same item (Lesson 11's own position-shift
  proof, now directly relevant to writing correct code, not just
  understanding it).
- `db.delete("items", "id = ?", new String[]{String.valueOf(removedItem.getId())})`
  — first appearance. `"id = ?"` is a `WHERE` clause with one
  placeholder; `String.valueOf(removedItem.getId())` supplies the real
  value substituted in for that `?`, the same parameterized-value
  mechanism `insert`'s `ContentValues` used, applied here to a
  condition instead of a whole row's data — never build this clause by
  directly concatenating the id into the SQL string, for the exact SQL
  injection reason named back in Lesson 12.
- `String.valueOf(removedItem.getId())` — reappearing (converting a
  primitive to its `String` representation, Lesson 10), needed because
  `whereArgs` is declared as `String[]`, even though the value being
  substituted is really an `int`.

### CS Lens

Reading `removedItem` *before* mutating the list, then using its own
data (the id) to drive the delete, is **capturing state before it
changes** — the same discipline any code doing "remove this, but I
still need to know what it was" requires, whether that's an undo
feature, a deletion log, or, here, knowing which database row
corresponds to a position that's about to become meaningless.

### SE Lens

**Why does `onSwiped` delete by `id`, specifically, instead of by
matching the item's name/quantity/location the way `equals()` from
Lesson 7 would?** Because this lesson's entire first unit exists to
close exactly this gap: two items could coincidentally share every
other field, but never the same `id` — the primary key is the one
piece of data guaranteed to identify this exact row and no other,
which is the entire reason a real database gives every row one in the
first place.

---

## Connect the Pieces

Full trace, both directions finally meeting: on launch,
`loadItemsFromDatabase()` runs a real `SELECT`, walks every row with a
`Cursor`, and builds a real `Item` — complete with its own database
`id` — for each one, replacing the five hardcoded seed lines this
project has carried since Lesson 7. Adding an item (Lesson 12) writes a
new row with SQLite assigning its `id` automatically. Swiping an item
away (Lesson 11) now reads that same `id` back off the `Item` about to
be removed, before it's gone from the in-memory list, and uses it to
delete the exact matching row — never any other. Close the app
entirely, at any point, and reopen it: the list shows exactly what
survived, no more, no less — the promise this whole persistence story,
started with `SharedPreferences` in Lesson 10, finally keeps in full
for every item, not just one saved number.

## What Breaks Without This

In `loadItemsFromDatabase()`, temporarily swap the column order in the
`SELECT` clause — change `"SELECT id, name, quantity, location FROM items"`
to `"SELECT id, quantity, name, location FROM items"` — without
touching the `cursor.getInt(1)`/`getString(2)` calls that assumed the
old order. Run the app. Real, representative failure: the app crashes
with a real type-mismatch exception the first time it tries to read a
`TEXT` column as an `int` (or vice versa) — proof that `SELECT`'s
column order and the positional `cursor.get...` calls reading it back
are connected by nothing but careful reading on your part; the
compiler cannot catch this mismatch, only a real run can. Restore the
original column order afterward.

## Exercises

1. Add three items through the running app, then swipe one away from
   the *middle* of the list (not the first or last). Fully close and
   reopen the app (per Lesson 10's process-death test) and confirm
   exactly the two remaining items load back — not the swiped one, and
   not the wrong one.
2. Temporarily add a `Log.d` printing every loaded `Item`'s `getId()`
   inside `loadItemsFromDatabase()`'s loop, and confirm the ids you see
   are *not* necessarily consecutive after you've deleted a few items
   over multiple runs — connect this back to `AUTOINCREMENT` (Lesson
   12) never reusing a deleted row's old id.

## Definition of Done

- [ ] `Item` has a real `id` field and a four-argument constructor,
      with the original three-argument one still working unchanged.
- [ ] The app loads its entire item list from `pocketinventory.db` on
      every launch — no hardcoded seed items remain in
      `InventoryActivity`.
- [ ] Swiping an item away deletes it from the database, confirmed by
      fully closing and reopening the app and seeing it stay gone.
- [ ] You broke the `SELECT` column order on purpose, saw the real
      crash, and restored it.
- [ ] Commit: message explaining why (e.g. "Load items from the real
      SQLite database on launch and delete the matching row on swipe,
      since a database that's only ever written to and never read from
      isn't actually persistence yet").

This closes Pocket Inventory's core persistence story — every item
added, viewed, and removed now genuinely survives the process itself
ending, not just a screen rotation, built from the ground up: `Item`
(Lesson 7), `RecyclerView`/`Adapter` (Lesson 6), `SharedPreferences` for
one setting (Lesson 10), and now a real relational table for the
growing list itself (Lessons 12–13).
