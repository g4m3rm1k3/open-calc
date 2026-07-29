# Lesson 21: `DiffUtil` — Redrawing Only What Changed

**What you will build:** A real "Refresh" button on the inventory
screen that re-reads `pocketinventory.db` from disk and reconciles the
result against what's currently on screen — and, once that button
exists and is proven wasteful in its first, naive form, `DiffUtil`:
the tool that computes exactly which rows were added, removed, or
changed between two lists, so `RecyclerView` redraws only those rows
instead of every visible one. The transferable problem:
`notifyDataSetChanged()` (used once already, for the very first load,
Lessons 15–17) tells `RecyclerView` "something changed, re-bind
everything you can currently see" — correct, but blunt. The moment this
project has a real reason to reload an *already-populated* list, that
bluntness becomes measurable, wasted work, provable the same way this
course has proven every other performance claim: with a real count, not
an assertion.

**What you need to know first:** Lesson 15–17 (`InventoryViewModel`,
`InventoryRepository`, `LiveData`, the shared, mutated-in-place `items`
list Lesson 16 specifically chose — this lesson explains why that
exact choice has to change). Lesson 7 (`Item.equals()`, reused here for
a second, real purpose). Lesson 9/11 (`onBindViewHolder`,
`notifyItemInserted`/`notifyItemRemoved` — this lesson's granular
add/delete, unchanged).

**Terms introduced in this lesson:**
- **`DiffUtil`** — a class that compares two lists and computes the
  minimal set of insertions, removals, and changes between them.
- **`DiffUtil.Callback`** — an abstract class describing how to compare
  an old and a new list: which items are "the same" underlying thing,
  and whether a matched pair's contents actually differ.
- **`areItemsTheSame(int, int)`** — asks whether the old list's item at
  one position and the new list's item at another represent the *same
  underlying row*, by identity (here, `Item.getId()`) — not whether
  their contents currently match.
- **`areContentsTheSame(int, int)`** — called only for a pair
  `areItemsTheSame` already said is the same row; asks whether its
  *displayed* content is unchanged.
- **`DiffUtil.calculateDiff(Callback, boolean detectMoves)`** — runs the
  comparison and returns a `DiffResult`; `detectMoves` controls whether
  an item that only changed position is reported as a move rather than
  a removal-plus-insertion.
- **`DiffResult.dispatchUpdatesTo(RecyclerView.Adapter)`** — replays the
  computed differences as the exact granular `notify...` calls
  (Lesson 9/11's own vocabulary) needed to update only what changed.
- **Method reference (`::`)** — a shorthand for a lambda whose entire
  body is "call this one existing method with the argument I was
  given," naming the method directly instead of writing
  `x -> someObject.someMethod(x)`.

---

## Concept Unit: A Real Reason to Reload — Adding a Refresh Action

### The Problem

Every item this project has ever added or removed since Lesson 9/11
has gone through `InventoryAdapter`'s own precise
`notifyItemInserted`/`notifyItemRemoved` — genuinely minimal already,
needing no help from anything this lesson introduces. But nothing in
this project can currently reconcile the on-screen list against
`pocketinventory.db` *after* the initial load — if this project ever
needed to confirm the screen still matches disk (a real, ordinary
feature many apps have, and necessary groundwork for a future lesson
where data could genuinely change from outside this app, once
networking arrives), reloading the full list into an *already
populated* screen is the first time this project's list-updating story
has to deal with two independent snapshots at once, not one list
grown or shrunk by exactly one row.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `fragment_inventory_list.xml` (add a button),
  `InventoryListFragment.java`, `InventoryViewModel.java`.
- **Change type:** Add.
- **Dependencies:** `InventoryViewModel`/`InventoryRepository` (Lesson
  15/17).

### The New Code — the Button and the ViewModel Method

Add a `Button` to `fragment_inventory_list.xml`, anywhere above the
`RecyclerView`:

```xml
<Button
    android:id="@+id/refreshButton"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Refresh" />
```

In `InventoryViewModel`, add a new method, unguarded by
`loadItemsIfNeeded`'s own `itemsLoaded` flag:

```java
public void refreshItems() {
    repository.loadItems(loadedItems -> itemsLiveData.postValue(loadedItems));
}
```

In `InventoryListFragment`, wire the button:

```java
Button refreshButton = view.findViewById(R.id.refreshButton);
refreshButton.setOnClickListener(v -> viewModel.refreshItems());
```

### The Updated Project

`InventoryViewModel` now has two ways to trigger the exact same
underlying load: `loadItemsIfNeeded()`, guarded to run at most once per
`ViewModel` instance (Lesson 15), and this lesson's own
`refreshItems()`, which always runs, every time it's called. Both post
their result to the same `itemsLiveData`, observed the same way,
unchanged, inside `InventoryListFragment`.

### Mechanical Walkthrough

- `public void refreshItems() { repository.loadItems(loadedItems -> itemsLiveData.postValue(loadedItems)); }`
  — **first appearance of an unguarded reload.** Structurally identical
  to `loadItemsIfNeeded`'s own body (Lesson 17), minus the
  `if (itemsLoaded) return;` check — deliberately callable any number
  of times, since "refresh" specifically means "do this again," not
  "do this once."
- `refreshButton.setOnClickListener(v -> viewModel.refreshItems());` —
  reappearing (`setOnClickListener`, Lesson 4), calling this lesson's
  own new method.

### Run It, and Prove the Waste

Temporarily add a `Log.d` as the first line inside
`InventoryAdapter.onBindViewHolder` (Lesson 6e), printing the position
it was called with. Run the app with several items already added and
visible. Tap **Refresh** once, with nothing on disk actually different
from what's already shown. Real, reproducible proof — check this
yourself, on your own emulator: Logcat shows `onBindViewHolder` called
once for **every currently visible row**, even though not one of them
actually changed — because the observer still calls
`adapter.notifyDataSetChanged()` (Lesson 16), which makes no attempt to
ask *which* rows are actually different before telling `RecyclerView`
to re-bind all of them. Delete the temporary `Log.d` afterward.

### CS Lens

This is the same **eager, unconditionally-repeated work** idea Lesson
6a's `addView` loop and Lesson 15's own rotation-reload waste already
proved, in a third shape: `notifyDataSetChanged()` doesn't know *how
much* actually changed, so it always assumes the maximum (everything),
the same way an unconditional loop always does all its iterations
regardless of whether they'd all produce the same result as before.

### SE Lens

**Given this project's own granular `notifyItemInserted`/
`notifyItemRemoved` (Lesson 9/11) already avoid this exact waste for
single-item changes, why does a *full reload* need anything more than
calling those same methods manually, one at a time, for whatever
changed?** Because doing that by hand requires already knowing exactly
which rows were added, removed, or changed — which is precisely the
information a full reload does *not* hand you directly: it hands you
one complete new list, with no indication of which parts of it match
the old one and which don't. Lesson 9/11's granular calls work because
*the code performing the mutation* already knows exactly what changed
(one item, added or removed, right there). A full reload needs
something that can look at two whole lists and compute that same
information after the fact — which is exactly what this lesson's tool
does.

---

## Concept Unit: `DiffUtil` — Computing the Minimal Update

### The Problem

Given an old list and a new list, compute exactly which positions were
added, removed, or changed — without hand-writing that comparison
yourself.

### The Contract You're Extending

`DiffUtil.Callback` itself (from `androidx.recyclerview.widget`,
verified against the real library source):

```java
public abstract static class Callback {
    public abstract int getOldListSize();
    public abstract int getNewListSize();
    public abstract boolean areItemsTheSame(int oldItemPosition, int newItemPosition);
    public abstract boolean areContentsTheSame(int oldItemPosition, int newItemPosition);

    @Nullable
    public Object getChangePayload(int oldItemPosition, int newItemPosition) {
        return null;
    }
}
```

Four methods are genuinely `abstract` — any subclass must supply real
bodies for all four, or it fails to compile, the same all-four-or-
nothing shape `RecyclerView.Adapter`'s own three abstract methods
(Lesson 6e) already established. `getChangePayload` is the one
non-abstract method, with a real default body returning `null` — an
optional refinement (a more precise description of *what* changed
within a matched pair, useful for animating just the changed field)
this project's own version does not need and will not override.

### Introduce the Concept in Isolation

`DiffUtil`'s own algorithm has no dependency on any real `View` or
`Activity` at all — it's pure comparison logic — but it does live in
the `androidx.recyclerview` library this project already depends on
(Lesson 6a), so this proof runs inside the project, temporarily, rather
than via plain `javac`. Temporarily add this block anywhere inside
`InventoryListFragment.onViewCreated`, after the existing setup:

```java
java.util.List<String> oldWords = java.util.Arrays.asList("apple", "banana", "cherry");
java.util.List<String> newWords = java.util.Arrays.asList("apple", "cherry", "date");

DiffUtil.Callback wordDiff = new DiffUtil.Callback() {
    @Override
    public int getOldListSize() {
        return oldWords.size();
    }

    @Override
    public int getNewListSize() {
        return newWords.size();
    }

    @Override
    public boolean areItemsTheSame(int oldItemPosition, int newItemPosition) {
        return oldWords.get(oldItemPosition).equals(newWords.get(newItemPosition));
    }

    @Override
    public boolean areContentsTheSame(int oldItemPosition, int newItemPosition) {
        return true;
    }
};

DiffUtil.DiffResult result = DiffUtil.calculateDiff(wordDiff, true);
android.util.Log.d("DiffUtilProof", "Dispatching diff for " + oldWords + " -> " + newWords);
result.dispatchUpdatesTo(new androidx.recyclerview.widget.ListUpdateCallback() {
    @Override
    public void onInserted(int position, int count) {
        android.util.Log.d("DiffUtilProof", "onInserted at " + position + ", count " + count);
    }

    @Override
    public void onRemoved(int position, int count) {
        android.util.Log.d("DiffUtilProof", "onRemoved at " + position + ", count " + count);
    }

    @Override
    public void onMoved(int fromPosition, int toPosition) {
        android.util.Log.d("DiffUtilProof", "onMoved from " + fromPosition + " to " + toPosition);
    }

    @Override
    public void onChanged(int position, int count, Object payload) {
        android.util.Log.d("DiffUtilProof", "onChanged at " + position + ", count " + count);
    }
});
```

### Run It Yourself

Run the app, filter Logcat to `DiffUtilProof`. Real, reader-run proof —
`["apple", "banana", "cherry"]` becoming `["apple", "cherry", "date"]`
removes `"banana"` and adds `"date"`; `"apple"` and `"cherry"` are
untouched:

```
Dispatching diff for [apple, banana, cherry] -> [apple, cherry, date]
onRemoved at 1, count 1
onInserted at 2, count 1
```

Not four operations (one per word in either list) — exactly two,
matching precisely what actually differs. `"apple"` at position 0 and
the word that ends up at position 0 in the new list are the same
string content, so `areItemsTheSame` (here, just string equality,
standing in for `Item.getId()` in the real version next) correctly
matched them and neither was reported as changed at all.

### Discard the Throwaway Example

Delete this temporary block entirely. The real version, next, compares
`Item` objects by id, not word strings by equality.

### Mechanical Walkthrough

- `new DiffUtil.Callback() { ... }` — **first appearance of
  `DiffUtil.Callback`.** An anonymous class (Lesson 4) implementing all
  four abstract methods from the Contract block above, built inline
  since this comparison is only ever needed once, right here.
- `getOldListSize()` / `getNewListSize()` — **first appearance.** Tell
  `DiffUtil` how large each list is, so it knows the bounds of the
  comparison it's about to run.
- `areItemsTheSame(int oldItemPosition, int newItemPosition)` — **first
  appearance.** Called repeatedly, for candidate pairs of positions,
  asking "could these be the same underlying thing?" — here, plain
  string equality; the real version, next, compares `Item.getId()`
  instead, since two different real items could coincidentally have
  identical displayed text.
- `areContentsTheSame(int oldItemPosition, int newItemPosition)` —
  **first appearance.** Only ever called for a pair `areItemsTheSame`
  already confirmed is the same item — this lab always returns `true`
  since these words never need re-binding once matched; the real
  version, next, genuinely checks whether displayed content changed.
- `DiffUtil.calculateDiff(wordDiff, true)` — **first appearance.** Runs
  the actual comparison algorithm and returns a `DiffResult`; `true` is
  `detectMoves` — asks `DiffUtil` to additionally notice when an item's
  *position* changed without its content changing, reporting a move
  instead of a remove-plus-insert (not exercised by this particular
  lab, since nothing here changes position, only membership).
- `result.dispatchUpdatesTo(new ListUpdateCallback() { ... })` — **first
  appearance.** Replays the computed diff as a sequence of calls — here,
  a throwaway `ListUpdateCallback` that only logs each one, to make the
  computed result directly visible; the real version, next, dispatches
  to the actual `RecyclerView.Adapter` instead, which turns each of
  these calls into the exact `notifyItemInserted`/`notifyItemRemoved`
  calls (Lesson 9/11) it would have taken to write by hand.

### CS Lens

This is the **longest common subsequence** family of algorithms — the
same general problem `diff`/`git diff` solve for comparing two text
files line by line, and the same one spreadsheet or document
"track changes" features solve for comparing two versions of content.
`DiffUtil` is a direct, purpose-built application of that same idea to
two `RecyclerView`-bound lists instead of two files.

### SE Lens

**Why does `DiffUtil` need a whole `Callback` object instead of just
taking two `List<Item>` arguments directly and calling `.equals()` on
each pair itself?** Because "are these the same underlying row" and
"is the content the same" are two genuinely different questions this
project's own `Item.equals()` (Lesson 7) cannot answer on its own — it
only answers the second one. Splitting them into two separate methods
is what lets `DiffUtil` correctly report "this row's content changed"
(same id, different fields) as distinct from "this row is gone and a
different one arrived" (different id entirely) — a single `.equals()`
check conflates both into one yes/no answer, unable to tell them apart.

---

## Concept Unit: Wiring `ItemDiffCallback` Into `InventoryAdapter`

### The Problem

Apply this for real — but doing so exposes a real conflict with an
existing design choice: Lesson 16 deliberately had `InventoryViewModel`
and `InventoryAdapter` share the *exact same* mutable `items` list
object, specifically so mutating it in one place kept both in sync
automatically. `DiffUtil` needs the opposite: a genuinely old snapshot,
compared against a genuinely new one, still separate at the moment the
comparison runs. Sharing one mutable object for both makes that
comparison meaningless — mutate first, and there is no "old" version
left to compare against.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file `ItemDiffCallback.java`,
  `InventoryAdapter.java`, `InventoryViewModel.java`,
  `InventoryListFragment.java`.
- **Change type:** Create, then refactor three existing files.
- **Dependencies:** `Item.equals()` (Lesson 7), `Item.getId()` (Lesson
  13).

### The New Code — `ItemDiffCallback`

```java
package com.yourname.pocketinventory;

import androidx.recyclerview.widget.DiffUtil;
import java.util.List;

class ItemDiffCallback extends DiffUtil.Callback {
    private final List<Item> oldItems;
    private final List<Item> newItems;

    ItemDiffCallback(List<Item> oldItems, List<Item> newItems) {
        this.oldItems = oldItems;
        this.newItems = newItems;
    }

    @Override
    public int getOldListSize() {
        return oldItems.size();
    }

    @Override
    public int getNewListSize() {
        return newItems.size();
    }

    @Override
    public boolean areItemsTheSame(int oldItemPosition, int newItemPosition) {
        return oldItems.get(oldItemPosition).getId() == newItems.get(newItemPosition).getId();
    }

    @Override
    public boolean areContentsTheSame(int oldItemPosition, int newItemPosition) {
        return oldItems.get(oldItemPosition).equals(newItems.get(newItemPosition));
    }
}
```

### Mechanical Walkthrough

- `extends DiffUtil.Callback` — reappearing (this lesson's own lab),
  now a real, named, non-anonymous class — worth its own file since
  both `InventoryAdapter` (next) and, potentially, a future adapter
  elsewhere in this project could reuse it.
- `oldItems.get(oldItemPosition).getId() == newItems.get(newItemPosition).getId()`
  — reappearing (`getId()`, Lesson 13), used here for the specific job
  `areItemsTheSame` needs: identity, not content.
- `oldItems.get(oldItemPosition).equals(newItems.get(newItemPosition))`
  — reappearing (`Item.equals()`, Lesson 7), finally reused for a
  second real purpose beyond its original one (safe `Map`/collection
  membership) — worth noting precisely: `equals()` compares
  `name`/`quantity`/`location` only, never `id` (Lesson 7 predates
  `id`'s existence, Lesson 13), which is exactly the right behavior
  here — `areContentsTheSame` should ask "did the *displayed* fields
  change," and `id` is never displayed at all.

### The New Code — `InventoryAdapter`

Add a new method:

```java
void updateItems(List<Item> newItems) {
    ItemDiffCallback diffCallback = new ItemDiffCallback(items, newItems);
    DiffUtil.DiffResult diffResult = DiffUtil.calculateDiff(diffCallback, true);
    items.clear();
    items.addAll(newItems);
    diffResult.dispatchUpdatesTo(this);
}
```

### Mechanical Walkthrough

- `new ItemDiffCallback(items, newItems)` — reappearing (this lesson's
  own new class), comparing `items` — this adapter's own current,
  still-unmutated list — against `newItems`, the freshly loaded list
  handed in, *before* either one changes.
- `DiffUtil.calculateDiff(diffCallback, true)` — reappearing (this
  lesson's own lab), run *before* `items` is touched at all — the
  entire comparison depends on `items` still holding its old content at
  this exact line.
- `items.clear(); items.addAll(newItems);` — reappearing (`List`
  methods, already-basic), only *now*, after the diff is already fully
  computed, does `items` actually become the new content — order here
  is not a style choice, it's the one thing that makes the line above
  it meaningful at all.
- `diffResult.dispatchUpdatesTo(this);` — reappearing (this lesson's own
  lab), `this` being the adapter itself (a real `RecyclerView.Adapter`,
  satisfying `dispatchUpdatesTo`'s own overload that takes one
  directly) — replays the computed diff as real, precise
  `notifyItemInserted`/`notifyItemRemoved`/etc. calls against this
  adapter, the same category of call Lesson 9/11 already made by hand,
  now generated instead of written.

### The New Code — Removing the Shared List

In `InventoryViewModel`, remove the `items` field entirely:

```java
private final MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(new ArrayList<>());
```

```java
public void loadItemsIfNeeded() {
    if (itemsLoaded) {
        return;
    }
    itemsLoaded = true;
    refreshItems();
}

public void refreshItems() {
    repository.loadItems(itemsLiveData::postValue);
}
```

In `InventoryListFragment`, the adapter now starts genuinely empty, and
the observer calls `updateItems` instead of `notifyDataSetChanged`:

```java
adapter = new InventoryAdapter(new ArrayList<>(), item -> {
    Bundle args = new Bundle();
    args.putParcelable("EXTRA_ITEM", item);
    Navigation.findNavController(requireView())
            .navigate(R.id.action_inventoryListFragment_to_itemDetailFragment, args);
});
recyclerView.setAdapter(adapter);

viewModel.getItems().observe(getViewLifecycleOwner(), adapter::updateItems);
viewModel.loadItemsIfNeeded();
```

### The Updated Project

`InventoryViewModel` no longer holds a mutable `items` list at all —
`itemsLiveData` holds whichever list was most recently loaded, as an
independent object each time, never mutated after being posted.
`InventoryAdapter` owns the one list that's actually mutated, in two
different ways now: directly, one row at a time, for `addItem`/
`removeItem` (Lesson 9/11, completely unchanged); and wholesale,
diffed against a fresh snapshot, for `updateItems` (this lesson).

### Mechanical Walkthrough

- `new MutableLiveData<>(new ArrayList<>());` — reappearing
  (`MutableLiveData`, Lesson 16), now holding a fresh, independent list
  each time `postValue` runs, rather than the same object mutated
  in place — this is the actual fix for the conflict this unit opened
  with.
- `refreshItems() { repository.loadItems(itemsLiveData::postValue); }`
  — **first appearance of a method reference.** `itemsLiveData::postValue`
  is shorthand for `loadedItems -> itemsLiveData.postValue(loadedItems)`
  — legal specifically because `Consumer<List<Item>>`'s one method,
  `accept(T value)`, and `postValue(T value)` have matching shapes: a
  method reference names an existing method directly wherever a lambda
  would have done nothing but immediately call that same method with
  its own argument, unchanged.
- `new InventoryAdapter(new ArrayList<>(), item -> { ... })` —
  reappearing (`InventoryAdapter`'s constructor, Lesson 6e), now always
  starting empty — `viewModel.getItems().getValue()` is no longer read
  here at all, since the adapter's own list is no longer the same
  object the `ViewModel` holds.
- `viewModel.getItems().observe(getViewLifecycleOwner(), adapter::updateItems);`
  — reappearing (`observe`, Lesson 16), a second method reference:
  `adapter::updateItems` stands in for
  `itemList -> adapter.updateItems(itemList)`, legal for the same
  reason as `itemsLiveData::postValue` above — `Observer<List<Item>>`'s
  `onChanged(T value)` and `updateItems(List<Item> newItems)` match.

### CS Lens

Splitting "the list mutated one row at a time" (Lesson 9/11's
`addItem`/`removeItem`) from "the list replaced wholesale, reconciled
by diffing" (this lesson's `updateItems`) is the same **two paths for
the same destination, chosen by which one is actually cheaper for the
situation at hand** idea as `System.arraycopy`-based `ArrayList`
growth (Lesson 6e) doubling instead of growing by one — both are about
recognizing that "the general-purpose way" and "the way that's optimal
for a specific, common case" can coexist without contradiction.

### SE Lens

**Now that `InventoryViewModel` no longer holds the actual item list,
does it still have any real job at all?** Yes — exactly the two jobs
Lesson 17 originally gave it: surviving rotation (via `ViewModel`
itself, Lesson 15) and announcing changes through `LiveData` (Lesson
16), neither of which required *also* being the one true copy of the
data. Lesson 16's original design shared one object because nothing had
yet forced the two roles apart; this lesson is the concrete moment that
requirement stopped being free, and the fix was removing an
assumption that had quietly gone unquestioned since Lesson 16, not
patching around it.

---

## Connect the Pieces

Full trace: tapping the new Refresh button calls
`viewModel.refreshItems()`, which asks `InventoryRepository` to reload
every row from disk and posts the result — a genuinely new `List<Item>`
— to `itemsLiveData`. `InventoryListFragment`'s observer,
`adapter::updateItems`, hands that new list to the adapter alongside
its own still-unmutated current list; `ItemDiffCallback` compares the
two by id (`areItemsTheSame`) and by displayed content
(`areContentsTheSame`, reusing Lesson 7's own `equals()`) before either
list changes at all. Only after that comparison finishes does `items`
actually become the new content, and `dispatchUpdatesTo` replays
exactly the granular `notify...` calls needed — no more, no less — the
same category of call this project has written by hand since Lesson 9,
now computed instead.

## What Breaks Without This

Temporarily revert `InventoryListFragment`'s observer back to
`itemList -> adapter.notifyDataSetChanged()`. Re-add the temporary
`onBindViewHolder` `Log.d` from this lesson's first unit. Tap Refresh
with several items already visible and confirm every row logs a rebind
again, even though nothing changed — the exact waste this lesson
exists to remove. Restore `adapter::updateItems` and delete the
temporary log line afterward.

## Exercises

1. Add a new item through the running app, then tap Refresh without
   changing anything else. Predict, then confirm via a temporary
   `Log.d` inside `ItemDiffCallback.areContentsTheSame`, exactly how
   many times it's actually called, and connect that count to how many
   items currently exist.
2. Temporarily change `areItemsTheSame` to always `return true`
   regardless of id. Add an item, then delete a *different* item, then
   tap Refresh. Observe the wrong row's content appear to change
   instead of a genuine removal-plus-insertion being reported — direct,
   hands-on proof of why identity and content are genuinely separate
   questions. Restore the correct check afterward.

## Definition of Done

- [ ] The Refresh button exists and reconciles the on-screen list
      against `pocketinventory.db` without redrawing every row when
      nothing changed, confirmed via the `onBindViewHolder` `Log.d`
      proof.
- [ ] `ItemDiffCallback` exists and correctly distinguishes "same row,
      different content" from "different row entirely," using `getId()`
      and `Item.equals()` respectively.
- [ ] `InventoryViewModel` no longer holds a mutable `items` field;
      `itemsLiveData` posts an independent list snapshot on every load.
- [ ] Adding and deleting items (Lesson 9/11's granular path) still
      works exactly as before, unaffected by this lesson's changes.
- [ ] Commit: message explaining why (e.g. "Add a Refresh action and
      wire it through DiffUtil instead of notifyDataSetChanged, after
      proving the naive version rebinds every row for zero actual
      changes").

Lesson 22 is next: every screen so far has been reached by a button
built directly into that screen's own layout — a `Toolbar` and an
options menu, and the standard, consistent place Android apps put
navigation and screen-level actions instead of a bespoke button per
screen.
