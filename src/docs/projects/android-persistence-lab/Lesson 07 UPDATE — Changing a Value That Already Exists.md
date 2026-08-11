# Lesson 07: `UPDATE` — Changing a Value That Already Exists

**What you will build:** Tapping any row in the grid opens a real dialog
to change its quantity — saving writes a real `UPDATE` to the exact
database row that item came from, persisting the change past a restart.
The transferable problem: every real write so far has been additive —
`INSERT` creates a row that didn't exist; nothing yet has changed a
value a row *already* has. `UPDATE` needs to find and modify one
specific existing row without touching any other, and the same real
row `id` this series added back in Lesson 04 is exactly what makes that
targeting possible.

**What you need to know first:** Lesson 04 (`InventoryItem.getId()`,
the real row `id`). Lesson 03 (`ContentValues`). `android-ui-foundations`
Lesson 26 (`InventoryAdapter`, `InventoryViewHolder`), Lesson 28
(`AlertDialog`), Lesson 29 (`getBindingAdapterPosition`,
`RecyclerView.NO_POSITION`, the stale-position risk a recycled
`ViewHolder` carries).

**Terms introduced in this lesson:**
- **`notifyItemChanged`** — the `RecyclerView.Adapter` method telling a
  `RecyclerView` exactly which single position's *data* changed, without
  the row being inserted or removed.
- **Row targeting** — this lesson's own informal name for identifying
  exactly one real row to modify, by its own unique `id`, rather than by
  a value (like `name`) that isn't guaranteed unique.

**Objects and methods used:**

**`SQLiteDatabase.update(String, ContentValues, String, String[])`**
- *What it is:* the method that changes column values on rows already
  in a table.
- *Implementation:* `public int update(String table, ContentValues
  values, String whereClause, String[] whereArgs)`, real declared
  signature confirmed this session against Android's own reference
  documentation — returns the real number of rows actually changed.
  `whereClause`/`whereArgs` use the identical `?`-placeholder binding
  already proven safe in Lesson 03's `INSERT` and Lesson 05's `SELECT`.
- *Its use:* called once inside `updateQuantity`, targeting exactly one
  row by its real `id`.

**`RecyclerView.Adapter.notifyItemChanged(int)`**
- *What it is:* the method telling a `RecyclerView` exactly which
  position's data changed, without inserting or removing anything.
- *Implementation:* inherited from `RecyclerView.Adapter`
  (`android-ui-foundations` Lesson 26), the direct sibling of
  `notifyItemInserted`/`notifyItemRemoved` — real, same shape, told
  "changed" instead of "inserted" or "removed."
- *Its use:* called after a successful save, telling `RecyclerView` to
  re-run `onBindViewHolder` for exactly the one row that changed.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`ContentValues`**
  - *What it is:* an Android key-value container mapping column names
    to values.
  - *Implementation:* given full treatment in Lesson 03.
  - *Its use:* now carries only `quantity` — the one column this update
    actually changes.
- **`AlertDialog`**
  - *What it is:* a small, modal overlay window for short, focused
    input.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 28.
  - *Its use:* the real quantity-editing form this lesson builds,
    reused unchanged from the add-item flow's own shape.
- **`getBindingAdapterPosition()` / `RecyclerView.NO_POSITION`**
  - *What they are:* a `ViewHolder`'s method for querying its own real,
    current position, and the constant it returns when unbound.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 29.
  - *Their use:* the identical stale-position guard from the delete
    flow, protecting this lesson's new tap-to-edit listener the same
    way.

---

## Concept Unit: Targeting One Row by Its Real `id`

### The Problem

`items.remove(currentPosition)` and `notifyItemRemoved` (Lesson 29)
already handle *removing* a specific row correctly. Changing a value on
an *existing* row needs the same precision on the database side —
`UPDATE`'s own `WHERE` clause has to identify exactly one real row, and
`name` alone was never a safe choice (`android-ui-foundations` never
declared it `UNIQUE`, unlike `username` on `users`). The real `id` every
`InventoryItem` has carried since Lesson 04 is exactly the value that's
always safe to target with.

### Introduce the Concept in Isolation

Real `sqlite3`, proving `UPDATE`'s targeting and its real, honest
failure mode — matching zero rows — directly:

```bash
rm -f update_demo.db
sqlite3 update_demo.db "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 0);"
sqlite3 update_demo.db "INSERT INTO items (name, quantity) VALUES ('Bolts', 120);"
sqlite3 update_demo.db "INSERT INTO items (name, quantity) VALUES ('Washers', 85);"
sqlite3 update_demo.db "UPDATE items SET quantity = 200 WHERE id = 1;"
sqlite3 -header -column update_demo.db "SELECT * FROM items;"
echo "rows changed by targeting a nonexistent id:"
sqlite3 update_demo.db "UPDATE items SET quantity = 999 WHERE id = 999;"
sqlite3 update_demo.db "SELECT changes();"
```

Real output, from running this just now:

```
id  name     quantity
--  -------  --------
1   Bolts    200
2   Washers  85
rows changed by targeting a nonexistent id:
0
```

### Mechanical Walkthrough

- `UPDATE items SET quantity = 200 WHERE id = 1;` — changes only
  `quantity`, only on the one row whose `id` is `1`; `Washers`' own row
  (`id = 2`) is untouched, confirmed directly in the `SELECT` output
  above.
- `SET quantity = 200` — names exactly one column to change; every other
  column on the matched row keeps its existing value, unmentioned and
  unaffected.
- `WHERE id = 999` — targets an `id` that doesn't exist. Real, observed
  result: `changes()` — SQLite's own function reporting how many rows
  the most recent statement actually affected — reports `0`. This is not
  an error; a real, honest, silent "nothing matched," the same shape
  `SQLiteDatabase.update`'s own real return value gives Java code below.

### Discard the Throwaway Example

```bash
rm -f update_demo.db
```

The real mechanism — target by `id`, change only the named columns,
report how many rows actually matched — carries forward into
`ItemRepository.updateQuantity`, next.

### CS Lens

Targeting a row by its own unique `id` rather than by a value that
merely tends to be distinct is the same reasoning a **primary key**
exists for in the first place (Lesson 02): any column that *could* repeat
is an unsafe target for a single-row operation, no matter how unlikely a
collision seems in practice — `id` is safe specifically because the
schema itself, not application logic, guarantees it can never repeat.

### SE Lens

**Why does `UPDATE` (and `SQLiteDatabase.update`) report *how many* rows
changed, rather than just succeeding or failing?** A `WHERE` clause
targeting by `id` should, by construction, only ever match zero or one
row — reporting the real count lets calling code detect the zero case
directly (the row was deleted by something else between reading it and
saving a change, for instance) instead of silently believing a write
succeeded when nothing on disk actually changed.

---

## Concept Unit: `updateQuantity` — the Real Repository Method

### The Problem

With real targeting proven, `ItemRepository` needs one real method:
given a row's own `id` and a new quantity, change exactly that row's
`quantity` column and nothing else.

### Project Change

- **Reference Source:** `SQLiteDatabase.update`'s real declared
  signature, already quoted in full above.
- **Files affected:** `ItemRepository.java`.
- **Change type:** Add one new method.
- **Dependencies:** None new.

### The New Code

```java
public int updateQuantity(long id, int quantity) {
    ContentValues values = new ContentValues();
    values.put("quantity", quantity);

    SQLiteDatabase db = databaseHelper.getWritableDatabase();
    return db.update("items", values, "id = ?", new String[]{String.valueOf(id)});
}
```

### The Updated Project

`ItemRepository.java`, the new method added alongside `addItem` and
`getAllItems`:

```java
public int updateQuantity(long id, int quantity) {   // ← new
    ContentValues values = new ContentValues();
    values.put("quantity", quantity);

    SQLiteDatabase db = databaseHelper.getWritableDatabase();
    return db.update("items", values, "id = ?", new String[]{String.valueOf(id)});
}
```

### Mechanical Walkthrough

- `public int updateQuantity(long id, int quantity)` — **first
  appearance.** Returns a plain `int` — the real number of rows changed,
  reappearing directly from `update`'s own documented return value,
  proven in isolation above.
- `ContentValues values = new ContentValues(); values.put("quantity", quantity);`
  — reappearing (Lesson 03), now carrying exactly one column, since
  `quantity` is the only value this method ever changes.
- `db.update("items", values, "id = ?", new String[]{String.valueOf(id)})`
  — the real call this Concept Unit's `sqlite3` lab already proved:
  table name, the one changed column, a `WHERE` clause targeting by
  `id`, and the real `id` value bound safely as a parameter — `id` is a
  `long`; `String.valueOf(id)` converts it to the `String` the
  `whereArgs` array requires, the same conversion direction as
  `android-ui-foundations` Lesson 26's `String.valueOf(int)`, applied to
  a `long` instead.

### CS Lens

`updateQuantity` deliberately takes an `id`, never a whole
`InventoryItem` object, and changes exactly one named column — the
smallest possible real interface for what this project's own UI
actually needs to do. A method accepting a whole object and writing
every one of its fields back would work too, but would silently
overwrite `name` with whatever the in-memory object happened to hold,
even when nothing about `name` was ever meant to change.

### SE Lens

**Why not just call `getAllItems()` again after every quantity change,
the same "just re-read everything" strategy Lesson 04's own SE Lens
defended for the initial grid load?** Re-reading the entire table after
one single-column change on one row is real, unnecessary work — a table
with thousands of rows would re-read and re-convert every single one of
them to update a single number on a single row. `notifyItemChanged`,
next, is the real, targeted alternative: change exactly the one row
that changed, both on disk and on screen, without touching anything
else.

---

## Concept Unit: Wiring a Tap-to-Edit Dialog

### The Problem

Nothing in the grid currently responds to a tap on a row at all.
Building a real edit affordance means reaching the exact same
stale-position risk Lesson 29 already solved for the delete button — the
`ViewHolder` a tap fires on might, by the time the tap is actually
handled, be showing different data than it was bound with.

### Project Change

- **Reference Source:** No new external framework signature —
  `AlertDialog` and `getBindingAdapterPosition` are already fully
  proven, cited above.
- **Files affected:** `InventoryAdapter.java`; `InventoryActivity.java`
  (passes its `ItemRepository` into the adapter's constructor).
- **Change type:** Add a constructor parameter; add a click listener and
  one new private method.
- **Dependencies:** `ItemRepository` (now constructed one lesson
  earlier than the adapter needs it).

### The New Code

`InventoryAdapter.java`, the constructor and the new listener:

```java
private final ItemRepository itemRepository;

InventoryAdapter(List<InventoryItem> items, ItemRepository itemRepository) {
    this.items = items;
    this.itemRepository = itemRepository;
}
```

Inside `onBindViewHolder`, after the existing delete-button wiring:

```java
holder.itemView.setOnClickListener((view) -> {
    int currentPosition = holder.getBindingAdapterPosition();
    if (currentPosition != RecyclerView.NO_POSITION) {
        showEditQuantityDialog(view.getContext(), currentPosition);
    }
});
```

The new private method:

```java
private void showEditQuantityDialog(Context context, int position) {
    InventoryItem item = items.get(position);

    EditText quantityInput = new EditText(context);
    quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);
    quantityInput.setText(String.valueOf(item.getQuantity()));

    new AlertDialog.Builder(context)
        .setTitle("Update Quantity")
        .setView(quantityInput)
        .setPositiveButton("Save", (dialog, which) -> {
            int newQuantity = Integer.parseInt(quantityInput.getText().toString());
            itemRepository.updateQuantity(item.getId(), newQuantity);
            item.setQuantity(newQuantity);
            notifyItemChanged(position);
        })
        .setNegativeButton("Cancel", null)
        .show();
}
```

In `InventoryActivity.onCreate`, the adapter construction:

```java
adapter = new InventoryAdapter(items, repository);
```

### The Updated Project

`InventoryAdapter.java` in full:

```java
package com.yourname.yourapp;

import android.content.Context;
import android.text.InputType;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AlertDialog;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {

    private final List<InventoryItem> items;
    private final ItemRepository itemRepository;    // ← new

    InventoryAdapter(List<InventoryItem> items, ItemRepository itemRepository) {  // ← changed
        this.items = items;
        this.itemRepository = itemRepository;        // ← new
    }

    @Override
    public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View rowView = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_inventory, parent, false);
        return new InventoryViewHolder(rowView);
    }

    @Override
    public void onBindViewHolder(InventoryViewHolder holder, int position) {
        InventoryItem item = items.get(position);
        holder.nameText.setText(item.getName());
        holder.quantityText.setText(String.valueOf(item.getQuantity()));

        holder.itemView.setOnClickListener((view) -> {                          // ← new
            int currentPosition = holder.getBindingAdapterPosition();           // ← new
            if (currentPosition != RecyclerView.NO_POSITION) {                  // ← new
                showEditQuantityDialog(view.getContext(), currentPosition);     // ← new
            }                                                                    // ← new
        });                                                                      // ← new

        holder.deleteButton.setOnClickListener((view) -> {
            int currentPosition = holder.getBindingAdapterPosition();
            if (currentPosition != RecyclerView.NO_POSITION) {
                items.remove(currentPosition);
                notifyItemRemoved(currentPosition);
            }
        });
    }

    private void showEditQuantityDialog(Context context, int position) {         // ← new
        InventoryItem item = items.get(position);

        EditText quantityInput = new EditText(context);
        quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);
        quantityInput.setText(String.valueOf(item.getQuantity()));

        new AlertDialog.Builder(context)
            .setTitle("Update Quantity")
            .setView(quantityInput)
            .setPositiveButton("Save", (dialog, which) -> {
                int newQuantity = Integer.parseInt(quantityInput.getText().toString());
                itemRepository.updateQuantity(item.getId(), newQuantity);
                item.setQuantity(newQuantity);
                notifyItemChanged(position);
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        final TextView nameText;
        final TextView quantityText;
        final Button deleteButton;

        InventoryViewHolder(View rowView) {
            super(rowView);
            nameText = rowView.findViewById(R.id.itemNameText);
            quantityText = rowView.findViewById(R.id.itemQuantityText);
            deleteButton = rowView.findViewById(R.id.deleteButton);
        }
    }
}
```

### Mechanical Walkthrough

- `private final ItemRepository itemRepository;` — a new field, the
  adapter's own real path to the database, alongside the `items` list it
  already held.
- `InventoryAdapter(List<InventoryItem> items, ItemRepository itemRepository)`
  — the constructor's signature changes; every existing call site
  constructing an `InventoryAdapter` must now supply a real
  `ItemRepository` too, a deliberate compile error everywhere it's
  missed.
- `holder.itemView.setOnClickListener(...)` — **first appearance of a
  click listener on the row itself**, rather than on one specific
  button inside it — reappearing `setOnClickListener` mechanism
  (`android-ui-foundations` Lesson 16), applied to the entire row
  `View` a `ViewHolder` wraps (`itemView`, Lesson 26's own field) instead
  of one widget inside it.
- `int currentPosition = holder.getBindingAdapterPosition(); if (currentPosition != RecyclerView.NO_POSITION)`
  — reappearing exactly (`android-ui-foundations` Lesson 29), the
  identical stale-position guard, now protecting a tap instead of a
  delete.
- `showEditQuantityDialog(view.getContext(), currentPosition)` — **first
  appearance.** `view.getContext()` — the tapped row's own `Context`,
  the same reasoning `LayoutInflater.from(parent.getContext())` already
  used (Lesson 26) for an adapter that has no `Context` of its own to
  offer directly.
- `EditText quantityInput = new EditText(context); quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);`
  — reappearing (`android-ui-foundations` Lesson 28's own in-Java
  `EditText` construction), restricting input to digits only, same
  reasoning as the original add-item dialog.
- `quantityInput.setText(String.valueOf(item.getQuantity()));` — **first
  appearance of pre-filling a dialog field.** Shows the row's *current*
  quantity as a starting point, rather than an empty field the user
  would have to retype from scratch.
- `new AlertDialog.Builder(context)` through `.show()` — reappearing
  builder chain (`android-ui-foundations` Lesson 28), same shape, a
  different real action wired to `"Save"`.
- `itemRepository.updateQuantity(item.getId(), newQuantity);` — the real
  write, targeting the exact row this specific `InventoryItem` came
  from — `item.getId()` (Lesson 04) is what makes this safe regardless
  of how many other rows share the same name or quantity.
- `item.setQuantity(newQuantity);` — reappearing setter
  (`android-ui-foundations` Lesson 22), updating the in-memory object to
  match what was just written to disk — the same "write through the
  repository, then update memory to match" ordering Lesson 04 already
  established for adding a row.
- `notifyItemChanged(position);` — this lesson's own subject: tells
  `RecyclerView` to re-run `onBindViewHolder` for exactly this one
  position, redrawing its now-updated quantity text — no insertion, no
  removal, no animation beyond a simple content refresh.
- `adapter = new InventoryAdapter(items, repository);` — the one call
  site this constructor change actually touches; `repository` already
  exists as a field, built one lesson earlier (Lesson 04) than the
  adapter previously needed it.

### CS Lens

Passing `itemRepository` into `InventoryAdapter`'s own constructor,
rather than reaching back out to `InventoryActivity` through some other
path, is **dependency injection** in its simplest possible form: a
class that needs a collaborator to do its job receives that
collaborator directly, from whoever constructs it, instead of
constructing or looking it up itself — the same shape `InventoryAdapter`
already used for `items`, now extended to a second real dependency.

### SE Lens

**Why does `InventoryAdapter` reach into the database directly, instead
of `InventoryActivity` handling the real write and only telling the
adapter afterward that a position changed?** Both are legitimate
designs; this project's own reasoning: the edit *originates* entirely
inside the adapter's own row-tap handling — the tapped row, its data,
and its exact position are all already in scope there, and routing the
save back out through `InventoryActivity` would mean passing that same
context back and forth for no structural benefit. The same
dependency-injection shape used here would look identical either way; a
larger app with more complex edit flows might reasonably centralize
writes in the Activity instead, once an adapter starts needing several
different kinds of edits.

---

## Connect the Pieces

One trace: tapping any row calls `getBindingAdapterPosition()` first,
exactly the way the delete button already does, guarding against a
stale, recycled position. A real dialog opens, pre-filled with that
row's actual current quantity. Saving calls
`itemRepository.updateQuantity(item.getId(), newQuantity)` — a real
`UPDATE`, targeting the exact database row this `InventoryItem` came
from by its own unique `id` — then updates the in-memory object to
match, and calls `notifyItemChanged` so the grid's own visible text
refreshes to show it. Restarting the app calls `getAllItems()` again,
and the changed quantity is exactly what comes back — not because
anything remembered it, but because it was written to disk the moment
"Save" was tapped.

## What Breaks Without This

Comment out `itemRepository.updateQuantity(item.getId(), newQuantity);`
inside the dialog's `"Save"` handler, keeping `item.setQuantity(...)`
and `notifyItemChanged(...)` in place. Run the app, edit a quantity, and
confirm the grid visibly updates immediately — the in-memory object and
the screen both changed correctly. Now fully close and reopen the app.
Real result: the edit is gone, back to whatever value was actually on
disk — direct, observed proof that `setQuantity`/`notifyItemChanged`
alone only ever affected memory and the screen, never the database, and
that this lesson's entire real point is the one line that writes the
change to disk. Restore the line before moving on.

## Exercises

1. Edit the same row's quantity twice in a row, without restarting the
   app in between, and confirm both edits took effect on disk (pull the
   real `.db` file with Device File Explorer and check with `sqlite3`
   directly) — confirming `updateQuantity` correctly handles being
   called repeatedly on the same row, not just once.
2. Temporarily change `updateQuantity`'s `whereClause` from `"id = ?"`
   to `"name = ?"`, passing `item.getName()` instead of `item.getId()`.
   Add two rows with the same name and different quantities, then edit
   one of them — observe, directly, whether the wrong row (or both
   rows) get changed, connecting the real result back to this lesson's
   own "targeting by a non-unique value" warning.
3. Add a temporary `Log.d` printing `updateQuantity`'s own real `int`
   return value after each save, and confirm it reports `1` for a real
   edit — then temporarily call it with an `id` you know doesn't exist,
   and confirm it reports `0`, matching the real `sqlite3` lab's own
   `changes()` result exactly.

## Definition of Done

- [ ] You ran the `sqlite3` `UPDATE` lab and saw a targeted change
      affect exactly one row, plus the real `0`-rows-changed result from
      a nonexistent `id`.
- [ ] Tapping a row opens a real dialog pre-filled with its current
      quantity.
- [ ] Saving a new quantity updates the grid immediately, and the change
      survives fully closing and reopening the app.
- [ ] You triggered the real "edit lost after restart" failure by
      temporarily removing the real `UPDATE` call, and restored it.
- [ ] You can explain, precisely, why this project targets `UPDATE` by
      `id` rather than by `name`.
- [ ] Commit: `git commit -m "Add tap-to-edit quantity, writing through
      a real UPDATE targeted by row id"` — explaining the targeting
      choice, not just that editing now works.

Next: `DELETE` — removing a row for real, replacing Milestone 5's
in-memory-only removal with a real, persisted one.
