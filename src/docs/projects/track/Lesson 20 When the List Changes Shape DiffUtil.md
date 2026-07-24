# Lesson 20: When the List Changes Shape — DiffUtil and RecyclerView Animations

**What you will build:** `InventoryAdapter` stops calling
`notifyDataSetChanged()` on every `LiveData` update and instead lets
`DiffUtil` figure out exactly what changed — insertions, removals, and
edits all get correct, individual row animations instead of the whole
list silently redrawing. The transferable problem: Lesson 16 wired
`LiveData` to call `adapter.setItems(newList)` on every change, which
internally called `notifyDataSetChanged()` — Lesson 6's opening lesson
already established that "assume everything changed and redo it all"
is the wasteful default a real system should avoid; `RecyclerView` has
had a precise, correct answer to this since Lesson 10's
`notifyItemInserted`, but that only covered one specific case by hand.
This lesson generalizes it: comparing two full list states and
computing the *minimal* set of real changes between them, automatically.

**What you need to know first:** Lesson 6 (`RecyclerView.Adapter`,
`onBindViewHolder`), Lesson 7 (`Item.equals()`/`hashCode()` — read
again for real this lesson, not just for `HashSet` correctness), Lesson
16 (`LiveData` posting a whole new `List<Item>` on every change).

---

## Concept Unit: `DiffUtil` — Computing the Minimal Change Between Two Lists

### The Problem

`adapter.setItems(newList)` currently discards the old list entirely
and calls `notifyDataSetChanged()`, telling `RecyclerView` "assume
every single row might be different, rebind them all" — even when, say,
one item's quantity changed and 49 others didn't. See the actual
algorithm this lesson replaces that assumption with, in isolation,
before wiring it into the real Adapter.

### Introduce the Concept in Isolation

```java
import androidx.recyclerview.widget.DiffUtil;
import java.util.Arrays;
import java.util.List;

public class DiffDemo {
    public static void main(String[] args) {
        List<String> oldList = Arrays.asList("Bolts", "Rags", "Oil");
        List<String> newList = Arrays.asList("Bolts", "Oil", "Calipers");

        DiffUtil.Callback callback = new DiffUtil.Callback() {
            @Override
            public int getOldListSize() {
                return oldList.size();
            }

            @Override
            public int getNewListSize() {
                return newList.size();
            }

            @Override
            public boolean areItemsTheSame(int oldItemPosition, int newItemPosition) {
                return oldList.get(oldItemPosition).equals(newList.get(newItemPosition));
            }

            @Override
            public boolean areContentsTheSame(int oldItemPosition, int newItemPosition) {
                return oldList.get(oldItemPosition).equals(newList.get(newItemPosition));
            }
        };

        DiffUtil.DiffResult result = DiffUtil.calculateDiff(callback);
        System.out.println("Diff computed. Dispatching...");
        result.dispatchUpdatesTo(new androidx.recyclerview.widget.ListUpdateCallback() {
            @Override
            public void onInserted(int position, int count) {
                System.out.println("Inserted " + count + " at " + position);
            }
            @Override
            public void onRemoved(int position, int count) {
                System.out.println("Removed " + count + " at " + position);
            }
            @Override
            public void onMoved(int fromPosition, int toPosition) {
                System.out.println("Moved " + fromPosition + " to " + toPosition);
            }
            @Override
            public void onChanged(int position, int count, Object payload) {
                System.out.println("Changed " + count + " at " + position);
            }
        });
    }
}
```

Run this against a small Android project or a JVM with the RecyclerView
artifact on its classpath (this specific class does depend on the
AndroidX library, unlike this curriculum's plain-`javac` labs — run it
as a scratch method temporarily inside the real app, e.g. called once
from `InventoryListFragment.onViewCreated`, with output read from
Logcat rather than a terminal). Output:

```
Diff computed. Dispatching...
Removed 1 at 1
Inserted 1 at 2
```

This proves the mechanism: comparing `["Bolts", "Rags", "Oil"]` against
`["Bolts", "Oil", "Calipers"]`, `DiffUtil` correctly identified that
"Rags" was removed and "Calipers" was inserted — **not** "everything
after position 0 changed," and **not** five separate row rebinds — the
minimal actual edit between the two states.

### Discard the Throwaway Example

Delete `DiffDemo.java` and the temporary call to it — the real project
uses a purpose-built, higher-level wrapper around this exact mechanism,
built next.

### Mechanical Walkthrough
- `DiffUtil.Callback` — **first appearance.** An abstract class (same
  category as `SQLiteOpenHelper`, Lesson 12) you extend to describe two
  list states — here as an **anonymous class** (Lesson 8's
  `Parcelable.Creator` pattern, reused: multiple methods to implement,
  so a lambda isn't an option).
- `getOldListSize()` / `getNewListSize()` — **first appearance.** Tell
  `DiffUtil` the boundaries of both lists to compare.
- `areItemsTheSame(int oldItemPosition, int newItemPosition)` —
  **first appearance.** Answers "are these two positions, one from
  each list, referring to the *same logical entity*" — for the demo,
  string equality stands in; for real `Item`s (next unit), this becomes
  `id` comparison, not full-field equality.
- `areContentsTheSame(int oldItemPosition, int newItemPosition)` —
  **first appearance.** Only ever called for a pair `DiffUtil` already
  determined *is* the same logical item — answers the follow-up
  question, "but did its displayed content actually change?" For real
- `Item`s, this becomes `Item.equals()` — Lesson 7's method, finally
  used for its originally-stated purpose rather than just `HashSet`
  correctness.
- `DiffUtil.calculateDiff(callback)` — **first appearance.** Runs the
  actual diffing algorithm (a variant of the classic Myers diff
  algorithm used by tools like `git diff`) and returns a `DiffResult`.
- `.dispatchUpdatesTo(ListUpdateCallback)` — **first appearance.**
  Replays the computed minimal edit as a sequence of
- `onInserted`/`onRemoved`/`onMoved`/`onChanged` calls — exactly the
  same method *names* (not coincidentally) as `RecyclerView.Adapter`'s
  own `notifyItemInserted`/`notifyItemRemoved`/etc. from Lesson 10,
  which is precisely how the next unit wires this output directly into
  real row animations.

### CS Lens

**This is a hard concept — computing a minimal edit distance between
two sequences — and it recurs constantly:** finding the smallest set
of insertions, deletions, and substitutions that transforms one
ordered sequence into another. Also recognized in: `git diff`/`diff`
itself (line-by-line, the same underlying algorithm family), spell-
checkers suggesting corrections by edit distance, DNA sequence
alignment in bioinformatics, and React/Vue's virtual-DOM reconciliation
(diffing two component trees to compute minimal real-DOM operations —
already named once, more narrowly, back in Lesson 10's CS Lens; this
is the general algorithm behind that specific case).

---

## Concept Unit: `ListAdapter` — `DiffUtil`, Wired In and Run Off the Main Thread

### The Problem

Wiring `DiffUtil.calculateDiff`/`.dispatchUpdatesTo` by hand, correctly,
every time `LiveData` posts a new list, is exactly the kind of
repeated, easy-to-get-wrong boilerplate Room's generated DAOs (Lesson
13) and the Navigation Component's generated Directions (Lesson 19)
already exist to avoid elsewhere in this project. `RecyclerView`
provides a ready-made base class that does it for you: `ListAdapter`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryAdapter.java`.
- **Change type:** Modify — change the base class and remove now-
  unnecessary manual list/notify management.
- **Dependencies:** `Item.equals()`/`hashCode()` (Lesson 7), `getId()`
  (Lesson 13).

### The New Code

```java
private static final DiffUtil.ItemCallback<Item> DIFF_CALLBACK = new DiffUtil.ItemCallback<Item>() {
    @Override
    public boolean areItemsTheSame(@NonNull Item oldItem, @NonNull Item newItem) {
        return oldItem.getId() == newItem.getId();
    }

    @Override
    public boolean areContentsTheSame(@NonNull Item oldItem, @NonNull Item newItem) {
        return oldItem.equals(newItem);
    }
};
```

```java
public class InventoryAdapter extends ListAdapter<Item, InventoryAdapter.InventoryViewHolder> {
    private final OnItemClickListener listener;
    private int lowStockThreshold = 5;

    InventoryAdapter(OnItemClickListener listener) {
        super(DIFF_CALLBACK);
        this.listener = listener;
    }

    void setLowStockThreshold(int threshold) {
        this.lowStockThreshold = threshold;
        notifyDataSetChanged();
    }

    // onCreateViewHolder unchanged

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        Item item = getItem(position);
        holder.itemNameText.setText(item.getName());
        holder.itemDetailText.setText("Qty: " + item.getQuantity() + " — " + item.getLocation());
        if (item.getQuantity() <= lowStockThreshold) {
            holder.itemDetailText.setTextColor(android.graphics.Color.RED);
        } else {
            holder.itemDetailText.setTextColor(android.graphics.Color.BLACK);
        }
    }

    // InventoryViewHolder unchanged
}
```

### The Updated Project

```java
public class InventoryAdapter extends ListAdapter<Item, InventoryAdapter.InventoryViewHolder> {  // ← changed (was RecyclerView.Adapter)
    private final OnItemClickListener listener;
    private int lowStockThreshold = 5;

    private static final DiffUtil.ItemCallback<Item> DIFF_CALLBACK = new DiffUtil.ItemCallback<Item>() { // ← new
        @Override                                                                                          // ← new
        public boolean areItemsTheSame(@NonNull Item oldItem, @NonNull Item newItem) {                    // ← new
            return oldItem.getId() == newItem.getId();                                                     // ← new
        }                                                                                                   // ← new

        @Override                                                                                           // ← new
        public boolean areContentsTheSame(@NonNull Item oldItem, @NonNull Item newItem) {                  // ← new
            return oldItem.equals(newItem);                                                                 // ← new
        }                                                                                                    // ← new
    };                                                                                                       // ← new

    interface OnItemClickListener {
        void onItemClick(Item item);
    }

    InventoryAdapter(OnItemClickListener listener) {                                 // ← changed (no longer takes items)
        super(DIFF_CALLBACK);                                                         // ← new
        this.listener = listener;
    }

    void setLowStockThreshold(int threshold) {
        this.lowStockThreshold = threshold;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public InventoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_inventory, parent, false);
        InventoryViewHolder holder = new InventoryViewHolder(itemView);
        itemView.setOnClickListener(v -> listener.onItemClick(getItem(holder.getAdapterPosition()))); // ← changed (getItem, not items.get)
        return holder;
    }

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        Item item = getItem(position);                                               // ← changed (was items.get(position))
        holder.itemNameText.setText(item.getName());
        holder.itemDetailText.setText("Qty: " + item.getQuantity() + " — " + item.getLocation());
        if (item.getQuantity() <= lowStockThreshold) {
            holder.itemDetailText.setTextColor(android.graphics.Color.RED);
        } else {
            holder.itemDetailText.setTextColor(android.graphics.Color.BLACK);
        }
    }

    // getItemCount() removed entirely — ListAdapter provides it
    // setItems(List<Item>) removed entirely — submitList(...) replaces it

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        // unchanged from Lesson 6
    }
}
```

`InventoryAdapter` no longer owns a `List<Item> items` field, a
`getItemCount()` override, or a `setItems` method at all — `ListAdapter`
provides all three internally, backed by its own list management and
the `DIFF_CALLBACK` supplied to its constructor.

### Mechanical Walkthrough
- `extends ListAdapter<Item, InventoryAdapter.InventoryViewHolder>` —
  **first appearance.** A `RecyclerView.Adapter` subclass (so
  everything Lesson 6 taught about `onCreateViewHolder`/`onBindViewHolder`
  still applies) that additionally manages its own internal list and
  diffing — the two generic parameters are the item type and the
  ViewHolder type, same shape as Lesson 6's original
  `RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`, with
  one more type parameter for what kind of list it holds.
- `DiffUtil.ItemCallback<Item>` — **first appearance.** A simpler,
  `ListAdapter`-specific alternative to the raw `DiffUtil.Callback`
  from the lab — only two methods instead of four, since
  `ListAdapter` already tracks old/new list sizes and positions
  internally; you only supply the two *comparison* questions.
- `oldItem.getId() == newItem.getId()` — reappearing (`getId()`,
  Lesson 13), first real use for its intended purpose: identity
  comparison by primary key, deliberately **not** using
- `Item.equals()` here — two positions can be "the same logical item"
  even if every displayed field changed (an edited quantity is still
  the same row, not a delete-then-insert), which is exactly the
  distinction `areItemsTheSame` versus `areContentsTheSame` exists to
  draw.
- `oldItem.equals(newItem)` — reappearing (Lesson 7), now used for its
  originally-stated purpose: "did the content actually change," not
  just `HashSet` membership.
- `super(DIFF_CALLBACK)` — reappearing (parent constructor call,
  Lesson 6), new detail: `ListAdapter`'s required constructor argument.
- `getItem(position)` — **first appearance.** `ListAdapter`'s own
- method, replacing `items.get(position)` — reads from `ListAdapter`'s
  internally-held current list, which you never touch directly.

### The New Code — Submitting Lists Instead of Setting Them

In `InventoryListFragment.onViewCreated`:

```java
adapter = new InventoryAdapter(item -> { /* unchanged listener body */ });
recyclerView.setAdapter(adapter);

viewModel.getItems().observe(getViewLifecycleOwner(), updatedItems -> adapter.submitList(updatedItems));
viewModel.loadItems();
```

### The Updated Project

```java
adapter = new InventoryAdapter(item -> {                                             // ← changed (constructor no longer takes items)
    InventoryListFragmentDirections.ActionListToDetail action =
            InventoryListFragmentDirections.actionListToDetail(item);
    androidx.navigation.Navigation.findNavController(view).navigate(action);
});
recyclerView.setAdapter(adapter);

viewModel.getItems().observe(getViewLifecycleOwner(), updatedItems -> adapter.submitList(updatedItems)); // ← changed (was adapter.setItems(...))
viewModel.loadItems();
```

### Mechanical Walkthrough
- `adapter.submitList(updatedItems)` — **first appearance.**
  `ListAdapter`'s replacement for the deleted `setItems` method:
  internally, this triggers `DiffUtil.calculateDiff` between the
- currently-held list and `updatedItems` — **on a background thread**,
  automatically (`ListAdapter` uses its own internal executor for this,
  the same "don't block the main thread with real work" principle from
  Lesson 14, applied here without you writing any `dbExecutor`-style
  code yourself) — then dispatches the resulting precise
  insert/remove/change calls back on the main thread once computed.

### Run It

Run the app. Add a new item: instead of the entire list silently
redrawing, watch the new row **animate in** — a real, visible slide/fade
`RecyclerView` performs automatically once it receives a precise
`notifyItemInserted`-shaped signal instead of a blanket
`notifyDataSetChanged()`. This is the concrete, visible payoff: identical
data, a noticeably better-feeling result, from a change entirely inside
the Adapter and one call site in the Fragment.

### CS Lens

Running the diff computation off the main thread and only touching the
UI with the already-computed, minimal result is a direct application of
Lesson 14's core lesson — expensive work belongs off the main thread,
only the final UI-touching step belongs on it — now applied to list
diffing specifically, and handled for you by the library instead of
hand-written `dbExecutor`/`runOnUiThread` code.

### SE Lens

**Why does `areItemsTheSame` deliberately use `id` while `areContentsTheSame`
uses full-field `equals()`, rather than using the same check for both?**
Collapsing them into one check would break a real, common case: editing
an item's quantity (a future feature this project doesn't have a UI for
yet, but the Adapter must already handle correctly) changes every field
comparison but must still be recognized as "the same row, animate as a
content change" rather than "a different row entirely, animate as a
remove-then-insert" — which would visually jump the item to a new
position and look wrong even though nothing about its position actually
changed. The two-question split exists specifically to let identity and
content vary independently, which single-check equality cannot express.

---

## Connect the Pieces

Full trace: `InventoryViewModel`/`ItemRepository` (Lesson 15/17) post a
new `List<Item>` through `LiveData` exactly as before → `InventoryListFragment`'s
observer now calls `adapter.submitList(updatedItems)` instead of
`setItems` → `ListAdapter` diffs the new list against whatever it
currently holds, off the main thread, using `DIFF_CALLBACK`'s
`id`-based identity check and `Item.equals()`-based content check
(Lesson 7's method, and Lesson 13's `id` field, both finally used for
the purpose their own lessons originally set up) → the resulting
minimal edit is dispatched back on the main thread as precise
`notifyItemInserted`/`notifyItemChanged`/etc. calls → `RecyclerView`
animates exactly the rows that actually changed, nothing else.

## What Breaks Without This

Temporarily change `DIFF_CALLBACK`'s `areItemsTheSame` to always
`return false;` regardless of `id`. Add one new item and watch the
list: **every** row now animates as if newly inserted, not just the
real new one — because `DiffUtil`, told nothing is ever "the same
item," treats every position as entirely new, defeating the whole
point of this lesson while still technically working (the data shown
is still correct). Restore the real `id`-comparison afterward.

## Exercises

1. Temporarily add a `Log.d` inside both `areItemsTheSame` and
   `areContentsTheSame`, add one item, and read Logcat — count how many
   times each is called relative to the list's actual size, and
   consider why `areItemsTheSame` running first, for every pair, before
   `areContentsTheSame` is ever consulted for a matched pair, is a
   sensible order for the algorithm to follow.
2. Revisit Lesson 11's threshold-highlight feature: `setLowStockThreshold`
   still calls a blunt `notifyDataSetChanged()` rather than going
   through `DiffUtil` at all. Explain, in your own words, why this is
   actually the *correct* choice here rather than a leftover
   inconsistency — think about what `areContentsTheSame` can and can't
   see (hint: `lowStockThreshold` isn't a field on `Item` at all).

## Definition of Done

- [ ] `InventoryAdapter` extends `ListAdapter`, not `RecyclerView.Adapter`
      directly, and has no `items` field, `getItemCount()`, or
      `setItems` method of its own anymore.
- [ ] Adding an item shows a real row-insertion animation, not a full
      list redraw.
- [ ] You ran the `DiffDemo` lab and can explain, in your own words,
      what `areItemsTheSame` and `areContentsTheSame` each answer.
- [ ] You broke `areItemsTheSame` on purpose, saw every row animate
      incorrectly, and restored it.
- [ ] Commit: message explaining why (e.g. "Replace notifyDataSetChanged
      with ListAdapter/DiffUtil so list updates compute and animate the
      minimal real change instead of redrawing everything").

Lesson 21 is next: every screen still reaches its actions through
buttons crowded at the bottom of the layout — a real `Toolbar`, an
options menu, search, and sorting, replacing that ad hoc button row
Lesson 11 already flagged as temporary.
