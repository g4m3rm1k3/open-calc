# Lesson 20c: `ListAdapter`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 6h's `RecyclerView.Adapter`,
Lesson 20b's `DiffUtil`, Lesson 14d's `ExecutorService`.

**Terms introduced in this lesson:**

- **`ListAdapter`** — a `RecyclerView.Adapter` subclass that manages its
  own internal list and runs `DiffUtil` automatically off the main
  thread whenever a new list is submitted.

---

## Concept Unit: `ListAdapter`

### The Problem

Wiring `DiffUtil.calculateDiff`/`.dispatchUpdatesTo` by hand, correctly,
every single time `LiveData` posts a new list, is exactly the repeated
boilerplate Room's own generated DAOs (Lesson 13g) already exist to avoid
elsewhere in this course — and running the diff calculation itself on
the main thread would violate Lesson 14e's own main thread constraint for
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
subclass that manages its own internal list and runs `DiffUtil`
automatically off the main thread whenever a new list is submitted.
`ItemAdapter extends ListAdapter<Item, ViewHolder>` (Lesson 0l's own
inheritance) supplies the same `areItemsTheSame`/`areContentsTheSame`
callbacks Lesson 20b's own previous unit wrote by hand — but
`submitList(...)` itself handles running `DiffUtil` on a background
thread (Lesson 14d's own `ExecutorService`, used internally) and
dispatching the result safely, with no manual
`calculateDiff`/`dispatchUpdatesTo` call required anywhere.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `class ItemAdapter extends ListAdapter<Item, ItemAdapter.ViewHolder>`
   — **(b) reappearing** `RecyclerView.Adapter` inheritance shape from
   Lesson 6h, now extending `ListAdapter` specifically.
2. `super(new DiffUtil.ItemCallback<Item>() { ... })` — **(b)
   reappearing** the same `areItemsTheSame`/`areContentsTheSame` pair
   from Lesson 20b, now supplied once, in the constructor, rather than
   called by hand on every update.
3. `adapter.submitList(updatedItems);` — **(a) first appearance**: the
   only call a caller ever needs; internally, `ListAdapter` runs
   `DiffUtil.calculateDiff` on a background thread and dispatches the
   result safely back to the main thread automatically.

### CS Lens

`ListAdapter` is Lesson 13e's own annotation-driven-ORM-style boilerplate
reduction, applied here to `DiffUtil`: the repeated,
easy-to-get-subtly-wrong wiring (background thread, dispatch back to
main) is handled once, inside the base class, so every caller only ever
needs to call `submitList(...)`.

Also recognized in: any framework providing a higher-level, boilerplate-
reducing base class over a lower-level, more manual API — the same
"provide the common case pre-wired correctly" shape recurring throughout
this course (Room's generated DAOs, `ViewModelProvider` from Lesson 15b).

### SE Lens

The alternative — every `Adapter` subclass wiring `DiffUtil.calculateDiff`/
`.dispatchUpdatesTo` by hand, including correctly moving the calculation
off the main thread — was not chosen because it's easy to get subtly
wrong (running the diff on the main thread, blocking it for a large
list) every single time it's repeated; `ListAdapter` centralizes that
correctness once.

---

## Connect the Pieces

Lesson 20a's minimal edit distance diffing is the general algorithm.
Lesson 20b's `DiffUtil` is Android's real, production implementation of
exactly that, using Lesson 4c's own identity-vs-equality distinction to
separately answer "same row?" and "changed content?". And `ListAdapter`
wraps `DiffUtil` so every caller only ever needs `submitList(...)`, with
the background-thread diffing and safe main-thread dispatch (Lesson 14d)
handled once, correctly, inside the base class.

## What Breaks Without This

Hand-wiring `DiffUtil.calculateDiff` directly on the main thread, rather
than through `ListAdapter`'s own background-thread handling, risks
freezing the UI for a large enough list — exactly the main thread
constraint Lesson 14e established.

## Exercises

1. Modify Lesson 20a's own `describeDiff` example to also detect an item
   present in both lists but at a different position, and explain, in
   your own words, how that maps to `DiffUtil`'s own
   `areItemsTheSame`/`areContentsTheSame` pair.
2. Explain, in your own words, why `areItemsTheSame` and
   `areContentsTheSame` must be two separate methods rather than one.
3. Explain, in your own words, why `ListAdapter.submitList(...)` is safe
   to call directly from `LiveData`'s own main-thread-delivered callback,
   even though `DiffUtil`'s actual calculation runs on a background
   thread.

## Definition of Done

- [ ] You read the real `ListAdapter`/`submitList` example and can explain
      what it handles that a hand-wired `DiffUtil` call would not.
- [ ] You completed Exercise 3.
- [ ] You can state, without looking back at this lesson, why
      `ListAdapter` is described as a boilerplate-reducing wrapper
      around `DiffUtil`.
