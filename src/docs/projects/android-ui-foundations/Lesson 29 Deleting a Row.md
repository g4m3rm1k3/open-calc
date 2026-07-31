# Lesson 29: Deleting a Row

**What you will build:** A delete button on every row, correctly removing
that exact row from both the underlying list and the visible grid. This
completes the data-grid requirement's final piece. The transferable
problem: a per-row button inside a recycled `ViewHolder` can't simply
remember "which row am I" the way a normal, one-off button can — because
the very same `ViewHolder` object gets reused for different rows over
time (Lesson 18's recycling), a naive approach captures a position that
can silently go stale, and the fix is a real, well-documented Android
pattern worth understanding precisely rather than copying blind.

**What you need to know first:** Lesson 26 (`InventoryAdapter`,
`InventoryViewHolder`, the static-nested-class fact this lesson directly
uses), Lesson 28 (`notifyItemInserted`, the sibling method this lesson's
`notifyItemRemoved` mirrors).

**Terms introduced in this lesson:**
- **`getBindingAdapterPosition`** — a `RecyclerView.ViewHolder` method
  returning a holder's *current* position, queried fresh at the moment
  it's called, as opposed to a position value captured earlier and
  potentially stale.
- **`RecyclerView.NO_POSITION`** — a constant (`-1`) a holder's position
  methods can return when the holder isn't currently bound to any valid
  row (mid-removal-animation, for instance).
- **`notifyItemRemoved`** — the `RecyclerView.Adapter` method telling a
  `RecyclerView` exactly which single position no longer exists.

---

## Concept Unit: Why the Row Itself Can't Just "Know" Its Position

### The Problem

Lesson 26 established that `InventoryViewHolder` is a `static` nested
class specifically so it holds **no** implicit reference back to the
`InventoryAdapter` that created it. A delete button living inside that
same `ViewHolder` needs two things it doesn't automatically have: a way
to reach back into the adapter to actually remove data, and — less
obviously — a reliable way to know *which* row it currently represents,
given that the exact same `ViewHolder` object is reused for different
data items over its lifetime as the user scrolls.

### Project Change

- **Reference Source:** `RecyclerView.ViewHolder.getBindingAdapterPosition()`
  and the `RecyclerView.NO_POSITION` constant — real, current AndroidX
  API (`getBindingAdapterPosition` replaced the now-deprecated
  `getAdapterPosition` starting in `androidx.recyclerview:recyclerview:1.2.0`,
  specifically to remove ambiguity in setups with more than one adapter —
  not this project's case, but the current, correct method regardless).
- **Files affected:** `app/src/main/res/layout/item_inventory.xml`;
  `InventoryAdapter.java`.
- **Change type:** Add a delete button to the row layout; add a click
  listener inside `onBindViewHolder`; add a `removeItem`-equivalent
  directly inline.
- **Dependencies:** None new.

### The New Code

In `item_inventory.xml`, a third column added to the existing horizontal
row:

```xml
<Button
    android:id="@+id/deleteButton"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/delete_button_label" />
```

In `strings.xml`:

```xml
<string name="delete_button_label">Delete</string>
```

In `InventoryAdapter.java`, inside `onBindViewHolder`:

```java
holder.deleteButton.setOnClickListener((view) -> {
    int currentPosition = holder.getBindingAdapterPosition();
    if (currentPosition != RecyclerView.NO_POSITION) {
        items.remove(currentPosition);
        notifyItemRemoved(currentPosition);
    }
});
```

And inside the nested `InventoryViewHolder` class, one more cached field:

```java
final Button deleteButton;
```

### The Updated Project

```java
package com.yourname.yourapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {

    private final List<InventoryItem> items;

    InventoryAdapter(List<InventoryItem> items) {
        this.items = items;
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

        holder.deleteButton.setOnClickListener((view) -> {          // ← new
            int currentPosition = holder.getBindingAdapterPosition();
            if (currentPosition != RecyclerView.NO_POSITION) {
                items.remove(currentPosition);
                notifyItemRemoved(currentPosition);
            }
        });
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        final TextView nameText;
        final TextView quantityText;
        final Button deleteButton;    // ← new

        InventoryViewHolder(View rowView) {
            super(rowView);
            nameText = rowView.findViewById(R.id.itemNameText);
            quantityText = rowView.findViewById(R.id.itemQuantityText);
            deleteButton = rowView.findViewById(R.id.deleteButton);  // ← new
        }
    }
}
```

### Mechanical Walkthrough

- `holder.deleteButton.setOnClickListener((view) -> {...})` set **inside
  `onBindViewHolder`**, not inside `InventoryViewHolder`'s constructor —
  **first appearance of this specific placement decision.** Registering
  it here means it's re-registered every time this holder is bound to
  (possibly different) data, which is deliberate: the lambda's body reads
  `items` and calls `notifyItemRemoved`, both belonging to the enclosing
  `InventoryAdapter` — reachable here because `onBindViewHolder` is an
  ordinary instance method, with a normal, implicit `this` referring to
  the adapter. `InventoryViewHolder`'s own constructor has no such
  access at all — the exact `static`-nested-class fact from Lesson 26,
  now the concrete reason this registration couldn't have lived there
  instead.
- `holder.getBindingAdapterPosition()` — **first appearance, and the
  actual point of this lesson.** Rather than using the `position`
  parameter `onBindViewHolder` already received (available to the lambda
  as a captured value, the same closure mechanism Lesson 14 introduced),
  this deliberately re-queries `holder`'s position **fresh, at the moment
  of the actual tap** — which is not always the same value it had when
  this specific bind call happened, per the Execution Trace below.
- `RecyclerView.NO_POSITION` — **first appearance.** A constant value
  (`-1`) `getBindingAdapterPosition()` can return when a holder currently
  isn't bound to any valid row — mid removal-animation, for instance.
  The `if` check guards against acting on that invalid value; without
  it, `items.remove(-1)` would throw
  `IndexOutOfBoundsException` immediately.
- `items.remove(currentPosition)` — **first appearance of `List`'s
  by-index `remove` overload in real project code** (Lesson 20 already
  distinguished it from by-value `remove` in a throwaway lab); here,
  deliberately by index, since `currentPosition` is exactly that.
- `notifyItemRemoved(currentPosition)` — **first appearance**, the direct
  sibling of Lesson 28's `notifyItemInserted`: tells `RecyclerView`
  precisely which single position no longer exists, so it can remove and
  animate out exactly that one row rather than re-checking everything.

### Execution Trace — Why `position` Alone Isn't Safe to Capture

This is exactly the "captured value vs. queried-fresh value" tension the
walkthrough above names — worth tracing as real, ordered events, not just
asserting one is safer:

1. The grid currently shows three rows: position `0` ("Bolts"), `1`
   ("Washers"), `2` ("Nuts"). `onBindViewHolder` has already run once for
   each, meaning each row's delete-button lambda has already captured
   whatever `position` value existed *at that specific bind call*: `0`,
   `1`, and `2` respectively, permanently fixed inside each lambda unless
   that exact row gets bound again later.
2. The user taps "Delete" on "Bolts" (position `0`). Inside that lambda,
   `holder.getBindingAdapterPosition()` is called and correctly returns
   `0` — at this exact moment, bind-time position and current position
   still agree, since nothing has changed yet.
3. `items.remove(0)` runs; "Washers" and "Nuts" shift down to become
   positions `0` and `1`. `notifyItemRemoved(0)` runs, and `RecyclerView`
   schedules `onBindViewHolder` to run again for the rows whose position
   just changed — but this doesn't necessarily happen in the exact same
   instant as step 3, and until it does, the "Washers" row's delete
   button is still holding whatever it captured *before* this shift.
4. **If** the delete listener had instead been written to capture and
   reuse the plain `position` parameter directly (not shown in this
   project's real code, but easy to write by habit), tapping "Washers"'s
   delete button in the narrow window before its rebind completes would
   call `items.remove(1)` — `1` being the *old*, now-stale position
   "Washers" had *before* step 3's shift, which after that shift now
   refers to "Nuts" instead. The wrong row would be deleted, silently,
   with no crash or error to reveal the mistake.
5. Because this project's real code calls `holder.getBindingAdapterPosition()`
   fresh, inside the lambda, at the moment of *this* tap rather than
   relying on anything captured earlier, step 4's failure mode cannot
   occur here — every delete tap asks "what is my real position, right
   now" instead of trusting a number that may already be outdated.

### CS Lens

Querying current state at the moment it's needed, rather than trusting a
value captured and carried forward from earlier, is the same category of
problem as **cache invalidation** — one of the genuinely hard, famous
problems in computer science: a cached value (here, a captured
`position`) is only correct until the thing it describes changes, and
nothing forces code holding the cached value to notice that change
unless it deliberately re-checks.

Also recognized in: HTTP caching headers (a browser trusting a cached
page version until it's told otherwise), database query caches
invalidated on write, and any UI framework where a component's stored
"which item am I displaying" index can drift out of sync with the
underlying data after an insertion or removal elsewhere in the list.

### SE Lens

**Why does `RecyclerView.ViewHolder` provide a method to query current
position at all, instead of just trusting the `position` parameter
`onBindViewHolder` already hands you?** The `position` parameter is
correct for exactly one instant: the moment that specific
`onBindViewHolder` call is executing. Any code that captures it into a
listener for use *later* — which a delete button, by its very nature,
always does — is holding a value that's only a guarantee about the past,
not the present. Providing a dedicated "ask me now" method acknowledges
this honestly instead of quietly hoping the captured value never goes
stale before it's used.

---

## Connect the Pieces

One trace, start to finish: `onBindViewHolder` writes an `InventoryItem`'s
data onto a row and registers a fresh delete-click lambda every time it
runs — a lambda that, when eventually tapped, asks the holder for its
*real, current* position rather than trusting anything captured earlier,
removes exactly that position from `items` (Lesson 22's list), and calls
`notifyItemRemoved` (Lesson 28's sibling method) so `RecyclerView`
removes precisely that one row. Both the data-grid requirement's add and
delete pieces are now real, working, and provably correct even as rows
shift underneath the grid.

## What Breaks Without This

Temporarily rewrite the delete listener to capture and use the plain
`position` parameter directly instead of `holder.getBindingAdapterPosition()`:

```java
holder.deleteButton.setOnClickListener((view) -> {
    items.remove(position);
    notifyItemRemoved(position);
});
```

Add a fourth and fifth sample item so there's room to observe a shift,
then tap "Delete" on the *first* row, and immediately tap "Delete" again
on what is now visually the new first row, as quickly as you can. On a
real device or emulator, you may see the wrong row removed, or a crash —
`IndexOutOfBoundsException` — if the previously-captured `position` now
exceeds `items`'s new, smaller size. This is exactly the Execution
Trace's step 4 failure mode, made real rather than only asserted.
Restore the `getBindingAdapterPosition()` version before moving on.

## Exercises

1. Add a temporary `Log.d` printing both `position` (the method
   parameter) and `holder.getBindingAdapterPosition()` inside
   `onBindViewHolder`, delete a few rows, and scroll if your sample list
   is long enough to require it — confirm for yourself, in real Logcat
   output, the two values agreeing right after a bind and potentially
   diverging afterward.
2. Add a sixth sample item and confirm deleting from the middle of the
   list (not the first or last row) still removes exactly the intended
   row and leaves the rest correctly ordered.

## Definition of Done

- [ ] You can explain, precisely, why the delete listener is registered
      inside `onBindViewHolder` and not inside `InventoryViewHolder`'s
      own constructor.
- [ ] You can explain what `RecyclerView.NO_POSITION` represents and why
      the `if` check exists.
- [ ] You reproduced the stale-position failure yourself with the
      rewritten listener, and restored the correct version.
- [ ] Tapping "Delete" on any row — first, middle, or last — removes
      exactly that row and no other.
- [ ] Commit: `git commit -m "Add per-row delete using
      getBindingAdapterPosition instead of a captured bind-time
      position"` — explaining the staleness risk being avoided, not
      just that a delete button was added.

Milestone 5 is done — the data grid screen fully satisfies its
requirement: labeled headers, add, and per-row delete, all correctly
handling `RecyclerView`'s recycling behavior rather than working only by
accident on a small sample list. Milestone 6 moves to the SMS permission
screen: declaring a dangerous permission in the Manifest, and requesting
it from the user at runtime.
