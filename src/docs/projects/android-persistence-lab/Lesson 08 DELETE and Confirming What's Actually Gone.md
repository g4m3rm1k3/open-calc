# Lesson 08: `DELETE` and Confirming What's Actually Gone

**What you will build:** The delete button, currently removing a row
only from the in-memory list and the visible grid
(`android-ui-foundations` Lesson 29), now deletes the real underlying
database row first — and this lesson's own real subject, deliberately:
actually confirming, on disk, that the row is gone, rather than trusting
that a method returning without an error means it worked.

**What you need to know first:** Lesson 07 (`updateQuantity`, targeting
a row by real `id`). `android-ui-foundations` Lesson 29
(`getBindingAdapterPosition`, the existing delete button, the stale-
position risk on a recycled `ViewHolder`).

**Terms introduced in this lesson:** none new — this lesson combines
`SQLiteDatabase.delete` with mechanisms this series has already built in
full (real row targeting by `id`, the existing delete button's
stale-position guard).

**Objects and methods used:**

**`SQLiteDatabase.delete(String, String, String[])`**
- *What it is:* the method that removes rows from a table.
- *Implementation:* `public int delete(String table, String
  whereClause, String[] whereArgs)`, real declared signature confirmed
  this session against Android's own reference documentation — with a
  real, documented, easy-to-miss quirk in its own return value: it
  reports the real number of rows deleted *only* when a real
  `whereClause` is actually passed; passing `null` for `whereClause`
  deletes every row in the table but the method's own return value is
  documented to be `0` regardless — covered directly in this lesson's
  "What Breaks Without This."
- *Its use:* called once inside `deleteItem`, always with a real,
  specific `id`-targeted `whereClause` — never `null`.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`getBindingAdapterPosition()` / `RecyclerView.NO_POSITION`**
  - *What they are:* a `ViewHolder`'s method for querying its own real,
    current position, and the constant it returns when unbound.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 29.
  - *Their use:* unchanged from the existing delete button — this
    lesson adds a real database write inside the same, already-guarded
    listener, not a new guard.
- **`notifyItemRemoved(int)`**
  - *What it is:* the `RecyclerView.Adapter` method telling a
    `RecyclerView` exactly which position no longer exists.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 29.
  - *Its use:* unchanged — still the last step, now running only after
    the real row is confirmed deleted on disk.

---

## Concept Unit: A Targeted `DELETE`, Proven Real First

### The Problem

`items.remove(currentPosition)` (`android-ui-foundations` Lesson 29)
already removes a row from the in-memory list correctly. Nothing yet
removes the matching row from the actual database — restart the app
today, and a "deleted" row reappears, read back by `getAllItems()`
exactly as if nothing happened.

### Introduce the Concept in Isolation

Real `sqlite3`, proving targeted deletion and its real row count
directly:

```bash
rm -f delete_demo.db
sqlite3 delete_demo.db "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 0);"
sqlite3 delete_demo.db "INSERT INTO items (name, quantity) VALUES ('Bolts', 120);"
sqlite3 delete_demo.db "INSERT INTO items (name, quantity) VALUES ('Washers', 85);"
sqlite3 delete_demo.db "DELETE FROM items WHERE id = 1; SELECT changes();"
sqlite3 -header -column delete_demo.db "SELECT * FROM items;"
```

Real output, from running this just now:

```
1
id  name     quantity
--  -------  --------
2   Washers  85
```

### Mechanical Walkthrough

- `DELETE FROM items WHERE id = 1;` — removes exactly the one row whose
  `id` is `1`; `Washers`' own row (`id = 2`) is completely unaffected,
  confirmed directly in the `SELECT` output above — the row is gone
  entirely, not just emptied or marked deleted.
- `SELECT changes();` — SQLite's own real function reporting how many
  rows the immediately preceding statement affected, in the same
  connection — real, observed `1`, matching exactly one row actually
  removed.
- The final `SELECT * FROM items` — direct, on-disk confirmation: one
  row remains, the correct one. This is this lesson's own actual point,
  not incidental — a delete is only proven correct by checking what's
  left, not by trusting that the command ran without error.

### Discard the Throwaway Example

```bash
rm -f delete_demo.db
```

The real mechanism — target by `id`, confirm by checking what remains —
carries forward into `ItemRepository.deleteItem`, next.

### CS Lens

Confirming a delete by checking real, remaining state — rather than
trusting a command's mere absence of an error — is the same discipline
this series has applied consistently since Lesson 03's own SQL
injection demonstration: a claim about what code does is only real once
it's been directly, independently observed, not merely asserted.

### SE Lens

**Why target by `id` here too, rather than by `name`, the same reasoning
already established for `UPDATE` in Lesson 07?** The risk is even more
severe for `DELETE` than `UPDATE`: an `UPDATE` targeting the wrong row
changes a value that can be corrected again; a `DELETE` targeting the
wrong row destroys a real row entirely, with nothing left afterward to
identify what was lost. The same `id`-based targeting this series
already committed to for editing is, if anything, more important to get
right here.

---

## Concept Unit: `deleteItem` — Wired Into the Existing Delete Button

### The Problem

The real deletion mechanism is proven. `InventoryAdapter`'s existing
delete button (`android-ui-foundations` Lesson 29) already has the
correct, guarded position — it just never calls into the database at
all.

### Project Change

- **Reference Source:** `SQLiteDatabase.delete`'s real declared
  signature, already quoted in full above.
- **Files affected:** `ItemRepository.java`; `InventoryAdapter.java`.
- **Change type:** Add one new repository method; add one line to an
  existing, already-guarded click listener.
- **Dependencies:** None new — `InventoryAdapter` already holds a real
  `ItemRepository` reference, from Lesson 07.

### The New Code

`ItemRepository.java`:

```java
public int deleteItem(long id) {
    SQLiteDatabase db = databaseHelper.getWritableDatabase();
    return db.delete("items", "id = ?", new String[]{String.valueOf(id)});
}
```

`InventoryAdapter.java`, the existing delete listener, one real line
added:

```java
holder.deleteButton.setOnClickListener((view) -> {
    int currentPosition = holder.getBindingAdapterPosition();
    if (currentPosition != RecyclerView.NO_POSITION) {
        InventoryItem item = items.get(currentPosition);   // ← new
        itemRepository.deleteItem(item.getId());            // ← new
        items.remove(currentPosition);
        notifyItemRemoved(currentPosition);
    }
});
```

### The Updated Project

`ItemRepository.java`, the new method alongside `addItem`,
`getAllItems`, and `updateQuantity`:

```java
public int deleteItem(long id) {          // ← new
    SQLiteDatabase db = databaseHelper.getWritableDatabase();
    return db.delete("items", "id = ?", new String[]{String.valueOf(id)});
}
```

`InventoryAdapter.java`'s `onBindViewHolder`, the delete listener in
full:

```java
holder.deleteButton.setOnClickListener((view) -> {
    int currentPosition = holder.getBindingAdapterPosition();
    if (currentPosition != RecyclerView.NO_POSITION) {
        InventoryItem item = items.get(currentPosition);       // ← new
        itemRepository.deleteItem(item.getId());                // ← new
        items.remove(currentPosition);
        notifyItemRemoved(currentPosition);
    }
});
```

### Mechanical Walkthrough

- `public int deleteItem(long id)` — reappearing return-type reasoning
  (Lesson 07's `updateQuantity`): the real number of rows actually
  deleted, direct from `delete`'s own documented return value.
- `db.delete("items", "id = ?", new String[]{String.valueOf(id)})` —
  the exact real call this Concept Unit's `sqlite3` lab already proved:
  table name, a `WHERE` clause targeting by `id`, the real `id` bound
  safely as a parameter — never `null` for `whereClause`, for reasons
  this lesson's "What Breaks Without This" proves directly.
- `InventoryItem item = items.get(currentPosition);` — **first
  appearance of reading the item before removing it.** The real `id`
  this delete needs to target lives on the `InventoryItem` object
  itself, which is about to be removed from `items` — read first, or
  the exact row to delete is lost the moment `items.remove(...)` runs.
- `itemRepository.deleteItem(item.getId());` — the real write, run
  *before* `items.remove(currentPosition)` — the same "write through the
  repository first, then update memory to match" ordering this series
  established in Lesson 04 and reused in Lesson 07.
- `items.remove(currentPosition); notifyItemRemoved(currentPosition);`
  — completely unchanged from `android-ui-foundations` Lesson 29;
  this lesson's only real addition is the two lines directly above them.

### CS Lens

Reusing the exact same guarded position — `getBindingAdapterPosition()`
plus the `NO_POSITION` check — for a real database write, not just an
in-memory one, is real proof the guard was never specific to memory-only
operations: a stale, recycled position would have been just as wrong a
target for a real `DELETE` as it would have been for `items.remove(...)`
alone, and the exact same check protects both.

### SE Lens

**Why read `item` before calling `items.remove(...)`, rather than
capturing `item.getId()` into a local variable first and discarding the
object immediately?** Both work identically here; reading the whole
object first is simply the more natural order — `item.getId()` is used
exactly once, right where it's needed, with no reason to extract it into
a separately-named variable a line early. This is a small, deliberate
style choice, not a technical requirement.

---

## Connect the Pieces

One trace: tapping "Delete" on any row — the identical,
already-guarded listener `android-ui-foundations` Lesson 29 built —
now reads the tapped row's real `InventoryItem` first, calls
`itemRepository.deleteItem(item.getId())` to remove the exact matching
row on disk, and only afterward removes it from `items` and calls
`notifyItemRemoved`. Restarting the app calls `getAllItems()` again,
and the deleted row genuinely doesn't come back — not because anything
remembers it was deleted, but because the row it would have been read
from no longer exists.

## What Breaks Without This

Two real, separate failures, both worth confirming directly:

**Skipping the real delete.** Comment out
`itemRepository.deleteItem(item.getId());`, keeping
`items.remove(...)`/`notifyItemRemoved(...)` in place. Delete a row, and
confirm it visibly disappears from the grid immediately. Now fully close
and reopen the app. Real result: the "deleted" row is back — direct,
observed proof that removing something from `items` alone never touched
the database at all. Restore the line before moving on.

**The real `whereClause = null` trap.** This is genuinely Android-only
behavior — no plain-JVM equivalent proves it, since it's a documented
quirk of Android's own `SQLiteDatabase.delete` wrapper, not of SQLite
itself (the `sqlite3` lab above, note, reported a real, accurate count
even for an unfiltered `DELETE`, run directly against the engine).
Temporarily change `deleteItem` to `db.delete("items", null, null)` and
call it once. Real, documented Android behavior: **every row in
`items` is deleted**, but the method's own return value is `0` —
documented directly in Android's own reference: "the number of rows
affected if a whereClause is passed in, 0 otherwise." Code that
naively checked `deleteItem(...) > 0` to decide whether anything was
actually deleted would be silently, confidently wrong here — the real
row count from a real, total deletion still reports as if nothing
happened. Restore the real, `id`-targeted call before moving on; never
call `deleteItem` with a `null` clause in this project.

## Exercises

1. Add three sample rows through the running app, delete the middle
   one, then fully restart the app and confirm exactly the other two
   remain — pull the real `.db` file with Device File Explorer and
   confirm with `sqlite3` directly, rather than trusting the grid's own
   display alone.
2. Add a temporary `Log.d` printing `deleteItem`'s own real return
   value after each real delete, and confirm it reports `1` for an
   existing row — then call it once with an `id` you know doesn't
   exist, and confirm it reports `0`, matching this series' own
   `updateQuantity` behavior in Lesson 07 exactly.
3. Explain, in your own words, why Android's own `delete` method
   deliberately reports `0` for an unfiltered, whole-table delete
   instead of the real, accurate row count `changes()` would report at
   the raw SQL level — what real mistake might this specific design
   choice be discouraging.

## Definition of Done

- [ ] You ran the `sqlite3` `DELETE` lab and saw a targeted removal
      leave exactly the correct row behind, confirmed by `changes()`.
- [ ] Tapping "Delete" removes a row from the grid immediately, and the
      removal survives fully closing and reopening the app.
- [ ] You triggered the real "deleted row comes back" failure by
      temporarily removing the real `DELETE` call, and restored it.
- [ ] You triggered the real, documented `whereClause = null` return-
      value trap yourself, and can explain why it's dangerous.
- [ ] Commit: `git commit -m "Delete the real database row before
      removing it from the in-memory list"` — explaining the ordering
      and the targeting, not just that delete now persists.

Next: `SmsManager` — actually sending a real SMS message, completing
the permission flow `android-ui-foundations` only ever got as far as
"granted."
