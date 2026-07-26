# Lesson 11: Swipe to Delete — and Why Every Later Position Shifts

**What you will build:** Swipe any row left or right to remove it from
the inventory list — a real `ItemTouchHelper` attached to the
`RecyclerView`, no custom touch-listener code written by hand. The
transferable problem underneath it: removing one element from a list
doesn't just make that one element disappear — every element that came
*after* it silently shifts down one position, and any code holding onto
a position number from before the removal is now pointing at the wrong
row unless it re-reads that position fresh.

**What you need to know first:** Lesson 6e (`InventoryAdapter`,
`getItemCount`, `items`, the overall Adapter shape). Lesson 8
(`getAdapterPosition()`, and *why* it re-reads live instead of
capturing a position once). Lesson 9 (`addItem`/`notifyItemInserted`,
the exact sibling pattern this lesson mirrors for removal). Lesson 10
(`SharedPreferences`, and specifically that it's the right tool for one
saved number, not for the growing item list itself — this lesson never
touches persistence, on purpose; a swiped-away row is gone from the
screen the same way an added one only ever lived in memory, until real
item persistence arrives later).

**Terms introduced in this lesson:**
- **`List.remove(index)`** — removes whatever element currently sits at
  the given index, shifting every later element one position earlier
  (contrast: `List.remove(value)`, already used).
- **Fine-grained change notification** — telling a listener precisely
  *what* changed and *how* (one row inserted at position 3), instead of
  a blunt "something changed, redraw everything."
- **`notifyItemRemoved(position)`** — a `RecyclerView.Adapter` method
  telling the `RecyclerView` exactly which position was removed.
- **`ItemTouchHelper`** — an Android class providing swipe/drag
  gestures on `RecyclerView` rows without hand-rolled touch listeners.
- **`ItemTouchHelper.SimpleCallback`** — a ready-made
  `ItemTouchHelper.Callback` needing only `onMove`/`onSwiped`
  implemented.
- **`onMove`** — the `SimpleCallback` method for drag-and-reorder
  gestures; required by the interface even when unused.
- **`onSwiped`** — the `SimpleCallback` method called when a row is
  swiped away.
- **`attachToRecyclerView(recyclerView)`** — connects an
  `ItemTouchHelper` to a specific `RecyclerView` so it starts
  intercepting touch gestures on it.

---

## Concept Unit: Removing by Position Shifts Every Later Index

### The Problem

Deleting a row means telling `InventoryAdapter` to remove *one specific
position* from `items`. That sounds like it should only affect the row
at that exact position — it doesn't. Every row after it moves.

### Introduce the Concept in Isolation

```bash
mkdir -p ~/pkgdemo10 && cd ~/pkgdemo10
```

Create `RemoveShiftDemo.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class RemoveShiftDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Alpha");
        names.add("Bravo");
        names.add("Charlie");
        names.add("Delta");

        System.out.println("Before: " + names);
        names.remove(1);
        System.out.println("After removing index 1: " + names);

        for (int i = 0; i < names.size(); i++) {
            System.out.println("index " + i + " = " + names.get(i));
        }
    }
}
```

Compile and run:

```
javac RemoveShiftDemo.java
java RemoveShiftDemo
```

Real output, this session:

```
Before: [Alpha, Bravo, Charlie, Delta]
After removing index 1: [Alpha, Charlie, Delta]
index 0 = Alpha
index 1 = Charlie
index 2 = Delta
```

#### Execution Trace

1. `i = 0` — `names.get(0)` still returns `"Alpha"`, unchanged, since
   index `0` sat before the removed element and nothing shifts ahead
   of a removal point — prints `"index 0 = Alpha"`.
2. `i = 1` — `names.get(1)` now returns `"Charlie"`, not `"Bravo"`,
   because removing index `1` shifted every later element one
   position earlier, so the element that used to answer to index `2`
   now answers to index `1` — prints `"index 1 = Charlie"`.
3. `i = 2` — `names.get(2)` now returns `"Delta"` for the same reason:
   it shifted down from its original index `3` to index `2` — prints
   `"index 2 = Delta"`.

"Bravo" was at index `1` before the removal. After `names.remove(1)`,
"Charlie" — previously at index `2` — is now at index `1`, and "Delta"
— previously at index `3` — is now at index `2`. Nothing about "Charlie"
or "Delta" themselves changed; only their *position in the list*
changed, purely as a side effect of the element before them being
removed. Any code that had captured "Charlie is at index 2" *before*
the removal and tried to use that number *after* the removal would now
be reading the wrong element entirely — it would read "Delta."

### Discard the Throwaway Example

Delete `RemoveShiftDemo.java` and the `pkgdemo10` folder — the real
project feels this exact shift firsthand next, through
`InventoryAdapter`'s own `items` list.

### Mechanical Walkthrough

- `names.remove(1);` — **first appearance of `List.remove` by index**
  (as opposed to `List.remove` by value, already used once in this
  curriculum). Removes whatever element currently sits at index `1`
  and shifts every element after it one position earlier.
- `for (int i = 0; i < names.size(); i++)` — reappearing (already-basic
  loop), here specifically to observe the *result* of the shift, one
  position at a time.
- `names.get(i)` — reappearing (`List.get`, already-basic), reading
  whatever element is *currently* at position `i` — not whichever
  element used to be there before the removal.

### CS Lens

**This is a hard concept — index invalidation on removal — and it
recurs constantly.** Any array-backed or list-backed sequence has this
same property: removing (or inserting) an element at position `k`
changes the position of every element at index `> k`, even though those
elements themselves never moved in any meaningful sense — only their
*address within the sequence* did. Also recognized in: a spreadsheet
deleting row 5 and every row below it renumbering up by one, a Python
list's own `del names[1]` doing the identical shift, a file's line
numbers all shifting after a line is deleted from the middle of it, and
a database `DELETE` on a row with an auto-incrementing *display* rank
(not a stable primary key) needing every later rank recomputed.

### SE Lens

**Why does this matter enough to isolate and prove by hand, instead of
just trusting `ArrayList.remove` to "do the right thing"?** Because the
*mechanism* being right (the list itself stays internally consistent)
doesn't automatically mean *your* code stays consistent — any variable,
field, or callback that captured a position *before* a removal and
reads `items.get(thatOldPosition)` *after* one is now silently wrong,
with no exception thrown, no warning, just a mismatched row. This is
precisely why `InventoryAdapter`'s click handler was already
built to call `holder.getAdapterPosition()` fresh, at the moment of the
actual tap, rather than capturing a position once in `onBindViewHolder`
and reusing it later — that design decision was quietly protecting
against exactly the shift this lab just proved happens.

---

## Concept Unit: Letting the Adapter Remove Its Own Rows

### The Problem

`InventoryAdapter` can add a row (`addItem`, already built). It has no
matching way to remove one yet — and per the previous unit, removing
one has to update both the underlying `items` list *and* tell the
`RecyclerView` which position to stop drawing, or the two silently
drift out of sync exactly the way an unannounced `Add` used to.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryAdapter.java`.
- **Change type:** Add.
- **Location:** A new method on `InventoryAdapter`, alongside `addItem`.
- **Dependencies:** the index-shift behavior proved in the previous
  unit.

### The New Code

```java
void removeItem(int position) {
    items.remove(position);
    notifyItemRemoved(position);
}
```

### The Updated Project

```java
public class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {
    private final List<Item> items;
    private final OnItemClickListener listener;

    interface OnItemClickListener {
        void onItemClick(Item item);
    }

    InventoryAdapter(List<Item> items, OnItemClickListener listener) {
        this.items = items;
        this.listener = listener;
    }

    void addItem(Item item) {
        items.add(item);
        notifyItemInserted(items.size() - 1);
    }

    void removeItem(int position) {                                        // ← new
        items.remove(position);                                             // ← new
        notifyItemRemoved(position);                                        // ← new
    }                                                                        // ← new

    @NonNull
    @Override
    public InventoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_inventory, parent, false);
        InventoryViewHolder holder = new InventoryViewHolder(itemView);
        itemView.setOnClickListener(v ->
                listener.onItemClick(items.get(holder.getAdapterPosition())));
        return holder;
    }

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        Item item = items.get(position);
        holder.itemNameText.setText(item.getName());
        holder.itemDetailText.setText("Qty: " + item.getQuantity() + " — " + item.getLocation());
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        TextView itemNameText;
        TextView itemDetailText;

        InventoryViewHolder(View itemView) {
            super(itemView);
            itemNameText = itemView.findViewById(R.id.itemNameText);
            itemDetailText = itemView.findViewById(R.id.itemDetailText);
        }
    }
}
```

`InventoryAdapter` now owns the complete, symmetrical pair: `addItem`
inserts and announces an insertion; `removeItem` removes and announces
a removal. Neither leaves `items` and the `RecyclerView`'s own idea of
"what's on screen" out of sync, even for a moment.

### Mechanical Walkthrough

- `void removeItem(int position)` — **first appearance.** Package-private,
  same visibility and calling shape as `addItem` — something that holds
  a reference to this exact adapter (the next unit) will call it with
  whichever position the user just swiped.
- `items.remove(position);` — reappearing (`List.remove` by index,
  this lesson's own lab), now removing from the real project's actual
  data instead of a throwaway list of names.
- `notifyItemRemoved(position);` — **first appearance.** The removal
  counterpart to `notifyItemInserted` — tells the `RecyclerView` exactly
  which position was removed, so it can animate that one row sliding
  away and correctly re-bind every row after it to its new, shifted
  position, rather than redrawing the entire list from scratch.

### CS Lens

`notifyItemRemoved` completes the same **fine-grained change
notification** idea `notifyItemInserted` already introduced — precise
"what changed and how" information instead of a blunt "redraw
everything." Also recognized in: version control representing a commit
as a small, specific diff rather than a full new copy of every file,
and the same row-level replication-log idea named in the previous
lesson, now covering deletions as well as insertions.

### SE Lens

**Why does `removeItem` take a raw `int position` instead of the `Item`
itself, when `addItem` took a whole `Item` object?** Because the two
operations are handed genuinely different information by whatever calls
them: adding a new item starts from the *data* (a freshly typed-in
`Item`, with no position yet — it doesn't have one until it's appended).
Removing starts from the *user's gesture* — a swipe on a specific,
currently-visible row — and a `RecyclerView`'s own touch-handling
machinery, covered next, already knows that row's position directly; it
would be redundant (and, per this lesson's first unit, riskier) to look
up the `Item` first just to hand it back for `removeItem` to look up
the position again.

---

## Concept Unit: `ItemTouchHelper` — Swipe Gestures Without Hand-Rolled Touch Listeners

### The Problem

`removeItem(position)` exists, but nothing calls it yet. Detecting "the
user dragged a finger across this specific row, far enough, and let go"
is a real, nontrivial amount of touch-event bookkeeping — tracking
finger position across multiple events, distance thresholds, direction,
release velocity — none of which this project should have to hand-write
from raw touch events.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Add.
- **Location:** Inside `onCreate`, after the `RecyclerView`'s adapter is
  attached.
- **Dependencies:** `removeItem`, previous unit.

### The Contract You're Filling In

`new ItemTouchHelper.SimpleCallback(...) { ... }` below is an anonymous
subclass — extending a real framework class without ever naming a new
class of your own. Worth reading that real class's own shape first,
rather than inferring it from which two methods happen to be
overridden. From `androidx.recyclerview.widget.ItemTouchHelper` itself,
not this project's code (verified against the real class, this
session):

```java
public abstract static class SimpleCallback extends ItemTouchHelper.Callback {
    public SimpleCallback(int dragDirs, int swipeDirs) { /* ... */ }

    public abstract boolean onMove(RecyclerView recyclerView,
                                    RecyclerView.ViewHolder viewHolder,
                                    RecyclerView.ViewHolder target);
    public abstract void onSwiped(RecyclerView.ViewHolder viewHolder, int direction);
}
```

Two real facts this makes checkable instead of assumed: `SimpleCallback`
itself `extends` a fuller, more complex framework class,
`ItemTouchHelper.Callback` — `SimpleCallback` exists specifically to
supply reasonable default behavior for everything `Callback` requires
*except* `onMove` and `onSwiped`, which it deliberately leaves
`abstract`, unfilled, for you. And the constructor signature —
`(int dragDirs, int swipeDirs)` — is exactly why this project's own
call passes `0` (no dragging allowed) and
`ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT` (swipe either
direction) as its two arguments, not something to guess the meaning of
from position alone.

### The New Code

```java
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
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<Item> items = new ArrayList<>();
        items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));
        items.add(new Item("Shop Rags", 12, "Shelf B"));
        items.add(new Item("Cutting Oil", 3, "Shelf B"));
        items.add(new Item("Digital Calipers", 2, "Toolbox 1"));
        items.add(new Item("Safety Glasses", 8, "Shelf A"));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        final InventoryAdapter adapter = new InventoryAdapter(items, item -> {
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        ItemTouchHelper itemTouchHelper = new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(     // ← new
                0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {                                     // ← new
            @Override                                                                                  // ← new
            public boolean onMove(@NonNull RecyclerView recyclerView,                                  // ← new
                                   @NonNull RecyclerView.ViewHolder viewHolder,                         // ← new
                                   @NonNull RecyclerView.ViewHolder target) {                           // ← new
                return false;                                                                           // ← new
            }                                                                                           // ← new

            @Override                                                                                  // ← new
            public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {          // ← new
                adapter.removeItem(viewHolder.getAdapterPosition());                                    // ← new
            }                                                                                           // ← new
        });                                                                                             // ← new
        itemTouchHelper.attachToRecyclerView(recyclerView);                                            // ← new

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
            nameInput.setText("");
            quantityInput.setText("");
            locationInput.setText("");
        });
    }
}
```

`onCreate` now wires three independent ways the list can change —
tapping a row (navigate), tapping "Add" (insert), and swiping a row
(remove) — each one calling exactly one method on `adapter` and letting
the adapter itself handle keeping the `RecyclerView` correctly in sync.

### Mechanical Walkthrough

- `new ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT)`
  — **first appearance.** `SimpleCallback` is a ready-made
  `ItemTouchHelper.Callback` that only needs the two methods below
  filled in — the constructor's first argument is which *drag*
  directions to allow (`0` — none; this project doesn't support
  drag-to-reorder), the second is which *swipe* directions to allow,
  combined with `|` (bitwise OR, first appearance — combining two flag
  values into one number the framework can check for either bit being
  set) to permit both left and right.
- `onMove(...)` — **first appearance,** required by `SimpleCallback`
  even though this project doesn't use it: it's the hook for
  drag-and-drop reordering, and returning `false` means "reordering
  never succeeds," which is exactly right when `dragDirs` above was
  already `0`.
- `onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction)`
  — **first appearance.** Called once, automatically, the moment a
  swipe gesture on some row finishes — `viewHolder` is the specific row
  that was swiped, `direction` (unused here, since both directions do
  the same thing) says which way.
- `viewHolder.getAdapterPosition()` — reappearing (already used inside
  `InventoryAdapter` itself for taps), now called from
  `InventoryActivity` on the `ViewHolder` the framework handed directly
  to `onSwiped` — read fresh, at the exact moment of the swipe, for
  precisely the reason this lesson's first unit proved matters.
- `itemTouchHelper.attachToRecyclerView(recyclerView);` — **first
  appearance.** The step that actually turns this configured callback
  into live touch handling on the real `RecyclerView` — nothing above
  this line does anything until it's attached.

### CS Lens

`ItemTouchHelper` is the **Strategy pattern** again, reappearing a
third time in this project (`RecyclerView`/`LayoutManager` split,
`IDataErrorInfo`'s WPF-sibling-lesson equivalent — this project's own
validation strategy — and now this): the *what counts as a valid
gesture and what happens when one completes* logic is a swappable,
self-contained object handed to a generic host (`RecyclerView`), which
never needs to know anything about touch-event bookkeeping itself.

### SE Lens

**Why does `SimpleCallback` demand `onMove` be implemented at all, when
this project always returns `false` from it?** Because `ItemTouchHelper`
is a genuinely dual-purpose tool — drag-to-reorder *and*
swipe-to-dismiss share the same underlying touch-tracking machinery,
and the framework has no way to know, generically, which of the two (or
both) any given screen wants without asking. Returning `false`
unconditionally is this project's explicit, honest answer to "can rows
be reordered here?" — not an oversight, a real decision, stated in code
rather than left implicit.

### Run It

Run the app. Swipe any row left, or right — the row detaches and slides
away, and the row that was directly below it moves up to take its exact
former position, correctly re-numbered. Swipe a second row afterward
and confirm it's still the row you actually meant to remove, not the
one that used to be below it before the first swipe.

### Connect the Pieces

Full trace: the user swipes a row → `ItemTouchHelper`'s internal
touch-tracking machinery (none of it written by this project) detects a
completed swipe and calls `onSwiped`, handing back the exact
`ViewHolder` involved → `viewHolder.getAdapterPosition()` reads that
row's *current* position, fresh, at this exact moment → `adapter.removeItem(position)`
removes that index from `items` (shifting every later element down
one, exactly as this lesson's own lab proved) and calls
`notifyItemRemoved(position)`, telling the `RecyclerView` precisely
which row to animate away and which later rows need re-binding to their
new positions. No position captured earlier in the app's life is ever
reused after a removal — every read happens fresh, at the moment it's
needed.

## What Breaks Without This

Temporarily change `onSwiped` to call
`adapter.removeItem(0)` unconditionally, ignoring `viewHolder`'s actual
position entirely. Run the app and swipe the *third* row in the list.
Real, representative failure: the *first* row disappears instead of the
third one you actually swiped — a real, visible demonstration of
exactly the "using the wrong position" failure this lesson's opening
unit predicted in the abstract. Restore the real
`viewHolder.getAdapterPosition()` call afterward.

## Exercises

1. Swipe every row in the list, one at a time, until it's empty. Add a
   new item afterward and confirm the list still works correctly from
   a genuinely empty starting state.
2. Add three items, then swipe the *middle* one. Predict, then verify,
   which two items remain and in what order — connect your prediction
   to this lesson's own `RemoveShiftDemo` trace.
3. Research (or predict, then verify): what does `direction` inside
   `onSwiped` actually equal when you swipe left versus right? Print it
   with a temporary `Log.d` call and check Logcat against the real
   `ItemTouchHelper.LEFT`/`ItemTouchHelper.RIGHT` constant values.

## Definition of Done

- [ ] Swiping a row, in either direction, removes it from the list with
      a real slide-away animation.
- [ ] You ran the `RemoveShiftDemo` lab yourself and can explain, in
      your own words, why every later index shifts after a removal.
- [ ] You added several items, removed one from the middle, and
      confirmed the remaining rows are correct, not off-by-one.
- [ ] You triggered the "wrong row removed" failure on purpose by
      hardcoding position `0`, and restored the real position read.
- [ ] Commit: message explaining why (e.g. "Add swipe-to-delete via
      ItemTouchHelper, reading each ViewHolder's position fresh at
      swipe-time so removal never targets a stale index").

Lesson 12 is next: `SharedPreferences` was the right tool for one saved
number, but the inventory list itself — potentially hundreds of items,
each with several fields — needs a real relational model. Raw SQLite,
first, before anything hides the mechanics from you.
