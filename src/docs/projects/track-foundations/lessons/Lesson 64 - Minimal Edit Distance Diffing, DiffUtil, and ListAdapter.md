# Lesson 64: Minimal Edit Distance Diffing, `DiffUtil`, and `ListAdapter`

**What you will build:** One unit is a small, fully runnable, plain Java
lab. Two units read real Android mechanisms directly.

**What you need to know first:** Lesson 18's identity vs. equality,
Lesson 46's `RecyclerView.Adapter`, Lesson 60's `ExecutorService`.

**Terms introduced in this lesson:**

- **Minimal edit distance diffing** — computing the smallest set of
  insertions, removals, and moves that transforms one sequence into
  another, rather than assuming every element changed.
- **`DiffUtil`** — Android's implementation of minimal edit distance
  diffing between two list states, used to compute exactly which rows
  were inserted, removed, moved, or changed.
- **`ListAdapter`** — a `RecyclerView.Adapter` subclass that runs
  `DiffUtil` automatically on a background thread every time a new list
  is submitted, dispatching only the precise, minimal set of row changes.

---

## Concept Unit: Minimal Edit Distance Diffing

### The Problem

`notifyDataSetChanged()` (Lesson 46) tells `RecyclerView` to assume every
single row might have changed and redraw the whole list — even when, in
reality, only one item out of a hundred actually differs between the old
list and the new one.

### Introduce the Concept in Isolation

```
mkdir lesson-64
cd lesson-64
```

Create `Main.java`:

```java
import java.util.List;

public class Main {
    static void describeDiff(List<String> oldList, List<String> newList) {
        for (String item : oldList) {
            if (!newList.contains(item)) {
                System.out.println("Removed: " + item);
            }
        }
        for (String item : newList) {
            if (!oldList.contains(item)) {
                System.out.println("Inserted: " + item);
            }
        }
    }

    public static void main(String[] args) {
        List<String> oldList = List.of("Wrench", "Bolt", "Hammer");
        List<String> newList = List.of("Wrench", "Hammer", "Screwdriver");

        describeDiff(oldList, newList);
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Removed: Bolt
Inserted: Screwdriver
```

#### Execution Trace

Trace of `describeDiff`'s own two loops, against `oldList = ["Wrench",
"Bolt", "Hammer"]` and `newList = ["Wrench", "Hammer", "Screwdriver"]`:

1. `"Wrench"` (first loop) — present in `newList`, so nothing is printed.
2. `"Bolt"` (first loop) — absent from `newList`; `"Removed: Bolt"` is
   printed.
3. `"Hammer"` (first loop) — present in `newList`, so nothing is printed.
4. `"Wrench"` (second loop) — present in `oldList`, so nothing is printed.
5. `"Hammer"` (second loop) — present in `oldList`, so nothing is printed.
6. `"Screwdriver"` (second loop) — absent from `oldList`, causing
   `"Inserted: Screwdriver"` to print.

Only `"Bolt"` and `"Screwdriver"` are reported — `"Wrench"` and
`"Hammer"`, present in both lists, are correctly identified as unchanged
and never mentioned. This is `minimal edit distance diffing` — **first
appearance**: computing the smallest set of insertions, removals, and
moves that transforms one sequence into another, rather than assuming
every element changed. `describeDiff` computes the actual, precise
difference between two list states — the same algorithm family behind
`git diff`.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `for (String item : oldList) { if (!newList.contains(item)) { ... } }`
   — **(a) first appearance**: finds every element present in the old
   list but absent from the new one — `"Bolt"` only.
2. `for (String item : newList) { if (!oldList.contains(item)) { ... } }`
   — **(a) first appearance**: finds every element present in the new
   list but absent from the old one — `"Screwdriver"` only.
3. `"Wrench"` and `"Hammer"` appear in both lists and are never printed
   by either loop — correctly identified as unchanged, requiring no
   reported difference at all.

### CS Lens

Minimal edit distance diffing is the same algorithm family behind `git
diff` (comparing two versions of a text file) and spell-checkers'
edit-distance suggestions — computing the smallest transformation between
two sequences, rather than treating them as entirely unrelated.

Also recognized in: `git diff` and other version-control diffing, DOM
diffing in virtual-DOM UI frameworks (React, Vue) — comparing an old and
new UI tree to compute the minimal real DOM changes needed.

### SE Lens

The alternative — assuming every element changed and redrawing
everything, as `notifyDataSetChanged()` does — was not chosen where
performance matters because it does real, unnecessary work redrawing rows
that never actually changed; minimal edit distance diffing computes
exactly which rows changed, so only those need to be redrawn.

---

## Concept Unit: `DiffUtil`

### The Problem

`notifyDataSetChanged()` after every `LiveData` (Lesson 61) update
redraws the entire list even when only one row actually differs — this
lesson's own `describeDiff` proved the actual difference can be computed
precisely; Android needs a real, production-ready version of exactly that
computation.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
DiffUtil.DiffResult result = DiffUtil.calculateDiff(new DiffUtil.Callback() {
    @Override
    public boolean areItemsTheSame(int oldPos, int newPos) {
        return oldList.get(oldPos).id == newList.get(newPos).id;
    }

    @Override
    public boolean areContentsTheSame(int oldPos, int newPos) {
        return oldList.get(oldPos).equals(newList.get(newPos));
    }
    // ... getOldListSize()/getNewListSize() omitted for brevity.
});

result.dispatchUpdatesTo(adapter);
```

This is `DiffUtil` — **first appearance**: Android's implementation of
minimal edit distance diffing between two list states, used to compute
exactly which rows were inserted, removed, moved, or changed. `DiffUtil
.calculateDiff(...)` is this lesson's own `describeDiff`, made real and
precise: `areItemsTheSame` checks identity (Lesson 18's own `id`-based
identity, not full content equality) to detect a moved-but-unchanged row,
while `areContentsTheSame` checks whether a same-identity row's own
content actually differs.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `areItemsTheSame(int oldPos, int newPos)` — **(a) first appearance**:
   compares by identity/key (`id`) — is this logically the *same* item,
   possibly moved, regardless of whether its content changed?
2. `areContentsTheSame(int oldPos, int newPos)` — **(a) first
   appearance**: only meaningful for a pair already confirmed to be "the
   same item" — did its actual displayed content change? **(b)
   reappearing** identity-vs-equality distinction from Lesson 18, applied
   directly: these are two genuinely different questions.
3. `result.dispatchUpdatesTo(adapter);` — **(a) first appearance**:
   applies only the precise, computed set of insertions/removals/moves to
   the real `RecyclerView.Adapter` (Lesson 46) — not a full
   `notifyDataSetChanged()`.

### CS Lens

`DiffUtil` is this lesson's own minimal edit distance diffing, real and
load-bearing, with `areItemsTheSame` versus `areContentsTheSame`
expressing Lesson 18's own identity-vs-equality distinction precisely:
identity answers "is this the same logical row," equality answers "did
its content change" — two separate questions `DiffUtil` needs answered
separately to compute a correct, minimal diff.

Also recognized in: virtual-DOM reconciliation algorithms using a
"key"-based identity check (analogous to `areItemsTheSame`) alongside a
content comparison, across virtually every modern UI framework.

### SE Lens

The alternative — calling `notifyDataSetChanged()` after every `LiveData`
update, as a naive integration might — was not chosen because it redraws
every row regardless of whether it actually changed, discarding real
performance and any row-level animation; `DiffUtil` computes the precise,
minimal set of changes instead.

---

## Concept Unit: `ListAdapter`

### The Problem

Wiring `DiffUtil.calculateDiff`/`.dispatchUpdatesTo` by hand, correctly,
every single time `LiveData` posts a new list, is exactly the repeated
boilerplate Room's own generated DAOs (Lesson 56) already exist to avoid
elsewhere in this project — and running the diff calculation itself on
the main thread would violate Lesson 60's own main thread constraint for
a large enough list.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
public class ItemAdapter extends ListAdapter<Item, ItemAdapter.ViewHolder> {
    ItemAdapter() {
        super(new DiffUtil.ItemCallback<Item>() {
            @Override
            public boolean areItemsTheSame(Item oldItem, Item newItem) {
                return oldItem.id == newItem.id;
            }

            @Override
            public boolean areContentsTheSame(Item oldItem, Item newItem) {
                return oldItem.equals(newItem);
            }
        });
    }
}
```

```java
viewModel.getItems().observe(this, updatedItems -> adapter.submitList(updatedItems));
```

This is `ListAdapter` — **first appearance**: a `RecyclerView.Adapter`
subclass that runs `DiffUtil` automatically on a background thread every
time a new list is submitted, dispatching only the precise, minimal set
of row changes. `ItemAdapter extends ListAdapter<Item, ViewHolder>`
(Lesson 05's own inheritance) supplies the same `areItemsTheSame`/
`areContentsTheSame` callbacks this lesson's own previous unit wrote by
hand — but `submitList(...)` itself handles running `DiffUtil` on a
background thread (Lesson 60's own `ExecutorService`, used internally)
and dispatching the result safely, with no manual
`calculateDiff`/`dispatchUpdatesTo` call required anywhere.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `class ItemAdapter extends ListAdapter<Item, ItemAdapter.ViewHolder>`
   — **(b) reappearing** `RecyclerView.Adapter` inheritance shape from
   Lesson 46, now extending `ListAdapter` specifically.
2. `super(new DiffUtil.ItemCallback<Item>() { ... })` — **(b)
   reappearing** the same `areItemsTheSame`/`areContentsTheSame` pair
   from this lesson's own previous unit, now supplied once, in the
   constructor, rather than called by hand on every update.
3. `adapter.submitList(updatedItems);` — **(a) first appearance**: the
   only call a caller ever needs; internally, `ListAdapter` runs
   `DiffUtil.calculateDiff` on a background thread and dispatches the
   result safely back to the main thread automatically.

### CS Lens

`ListAdapter` is Lesson 56's own annotation-driven-ORM-style boilerplate
reduction, applied here to `DiffUtil`: the repeated,
easy-to-get-subtly-wrong wiring (background thread, dispatch back to
main) is handled once, inside the base class, so every caller only ever
needs to call `submitList(...)`.

Also recognized in: any framework providing a higher-level, boilerplate-
reducing base class over a lower-level, more manual API — the same
"provide the common case pre-wired correctly" shape recurring throughout
this curriculum (Room's generated DAOs, `ViewModelProvider`).

### SE Lens

The alternative — every `Adapter` subclass wiring `DiffUtil.calculateDiff`/
`.dispatchUpdatesTo` by hand, including correctly moving the calculation
off the main thread — was not chosen because it's easy to get subtly
wrong (running the diff on the main thread, blocking it for a large
list) every single time it's repeated; `ListAdapter` centralizes that
correctness once.

---

## Connect the Pieces

Minimal edit distance diffing is the general algorithm: compute the
smallest real difference between two sequences, rather than assuming
everything changed. `DiffUtil` is Android's real, production
implementation of exactly that, using Lesson 18's own
identity-vs-equality distinction to separately answer "same row?" and
"changed content?". And `ListAdapter` wraps `DiffUtil` so every caller
only ever needs `submitList(...)`, with the background-thread diffing and
safe main-thread dispatch (Lesson 60) handled once, correctly, inside the
base class.

## What Breaks Without This

Calling `notifyDataSetChanged()` after every list update, instead of
using `DiffUtil`/`ListAdapter`, redraws every row regardless of whether
it actually changed — wasted work, and the loss of any row-level
animation a precise diff would otherwise enable. And hand-wiring
`DiffUtil.calculateDiff` directly on the main thread, rather than through
`ListAdapter`'s own background-thread handling, risks freezing the UI for
a large enough list — exactly the main thread constraint Lesson 60
established.

## Exercises

1. Modify this lesson's own `describeDiff` example to also detect an item
   present in both lists but at a different position, and explain, in
   your own words, how that maps to `DiffUtil`'s own
   `areItemsTheSame`/`areContentsTheSame` pair.
2. Explain, in your own words, why `areItemsTheSame` and
   `areContentsTheSame` must be two separate methods rather than one,
   connecting your answer to Lesson 18's own identity-vs-equality
   material.
3. Explain, in your own words, why `ListAdapter.submitList(...)` is safe
   to call directly from `LiveData`'s own main-thread-delivered callback,
   even though `DiffUtil`'s actual calculation runs on a background
   thread.

## Definition of Done

- [ ] You ran the `describeDiff` example and can explain why `"Wrench"`
      and `"Hammer"` are never printed.
- [ ] You read the real `DiffUtil.Callback` example and can explain the
      difference between `areItemsTheSame` and `areContentsTheSame`.
- [ ] You read the real `ListAdapter`/`submitList` example and can explain
      what it handles that a hand-wired `DiffUtil` call would not.
