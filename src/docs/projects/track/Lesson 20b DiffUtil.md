# Lesson 20b: `DiffUtil`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 20a's minimal edit distance
diffing, Lesson 4c's identity vs. equality.

**Terms introduced in this lesson:**

- **`DiffUtil`** — Android's implementation of minimal-edit-distance
  diffing between two list states, used to compute exactly which rows
  were inserted, removed, moved, or changed rather than assuming
  everything changed.

---

## Concept Unit: `DiffUtil`

### The Problem

`notifyDataSetChanged()` after every `LiveData` (Lesson 16b) update
redraws the entire list even when only one row actually differs — Lesson
20a's own `describeDiff` proved the actual difference can be computed
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
minimal-edit-distance diffing between two list states, used to compute
exactly which rows were inserted, removed, moved, or changed rather than
assuming everything changed. `DiffUtil.calculateDiff(...)` is Lesson
20a's own `describeDiff`, made real and precise: `areItemsTheSame`
checks identity (Lesson 4c's own `id`-based identity, not full content
equality) to detect a moved-but-unchanged row, while `areContentsTheSame`
checks whether a same-identity row's own content actually differs.

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
   reappearing** identity-vs-equality distinction from Lesson 4c, applied
   directly: these are two genuinely different questions.
3. `result.dispatchUpdatesTo(adapter);` — **(a) first appearance**:
   applies only the precise, computed set of insertions/removals/moves to
   the real `RecyclerView.Adapter` (Lesson 6h) — not a full
   `notifyDataSetChanged()`.

### CS Lens

`DiffUtil` is Lesson 20a's own minimal edit distance diffing, real and
load-bearing, with `areItemsTheSame` versus `areContentsTheSame`
expressing Lesson 4c's own identity-vs-equality distinction precisely:
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

## Connect the Pieces

`DiffUtil.calculateDiff(...)` is Lesson 20a's own diffing idea, real and
load-bearing. The next lesson shows the `RecyclerView.Adapter` subclass
that wraps this exact mechanism so no caller ever has to wire it by hand.

## What Breaks Without This

Calling `notifyDataSetChanged()` after every `LiveData` update redraws
every row regardless of whether it actually changed, discarding real
performance and any row-level animation.

## Exercises

1. Explain, in your own words, why `areItemsTheSame` and
   `areContentsTheSame` must be two separate methods rather than one,
   connecting your answer to Lesson 4c's own identity-vs-equality
   material.
2. Explain, in your own words, what `result.dispatchUpdatesTo(adapter)`
   does that a plain `notifyDataSetChanged()` call does not.
3. Explain, in your own words, why `areItemsTheSame` is checked before
   `areContentsTheSame` is ever meaningful for a given pair of rows.

## Definition of Done

- [ ] You read the real `DiffUtil.Callback` example and can explain the
      difference between `areItemsTheSame` and `areContentsTheSame`.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why `DiffUtil`
      is described as Lesson 20a's own diffing idea, "real and
      load-bearing."
