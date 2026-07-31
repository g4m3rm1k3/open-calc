# Lesson 6f: `ViewHolder`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 6e's static vs. non-static
nested classes, Lesson 6b's caching, Lesson 4j's `findViewById`.

**Terms introduced in this lesson:**

- **`ViewHolder`** — an object caching one row's view references once,
  at construction, so later data updates skip re-searching the view
  tree.

---

## Concept Unit: `ViewHolder`

### The Problem

Without caching each row's found views, `findViewById` (Lesson 4j)
would need to be called fresh on every scroll frame, for every visible
row — real, measurable, repeated overhead this design exists
specifically to remove.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
static class ItemViewHolder extends RecyclerView.ViewHolder {
    TextView nameLabel;

    ItemViewHolder(View itemView) {
        super(itemView);
        nameLabel = itemView.findViewById(R.id.nameLabel);
    }
}
```

This is `ViewHolder` — **first appearance**: an object caching one
row's view references once, at construction, so later data updates
skip re-searching the view tree. `findViewById` runs exactly once per
`ItemViewHolder`, inside its constructor — every later data update
reads `nameLabel` directly, the cached reference, never searching the
view tree again for the same row.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `static class ItemViewHolder extends RecyclerView.ViewHolder { ...
   }` — **(b) reappearing** `static` nested class from Lesson 6e,
   specifically avoiding a hidden reference to the Adapter, plus
   inheritance (Lesson 0l) from a real framework base class.
2. `ItemViewHolder(View itemView) { super(itemView); nameLabel =
   itemView.findViewById(R.id.nameLabel); }` — **(b) reappearing**
   constructor and `super()` (Lesson 2n) shape, calling `findViewById`
   (Lesson 4j) exactly once, caching the result in a field — Lesson
   6b's own caching pattern, real and load-bearing.

### CS Lens

`ViewHolder` combines three earlier concepts at once: it's
constructed lazily (only when a new, uncached row is actually needed),
it caches an expensive lookup on first use (`findViewById`, cached
exactly once), and it's declared `static` specifically to avoid an
unwanted hidden Adapter reference.

Also recognized in: the ViewHolder pattern by name across virtually
every mainstream mobile UI framework's own recyclable-list
implementation — a genuinely standard, widely-recognized solution to
this exact repeated-lookup problem.

### SE Lens

The alternative — calling `findViewById` fresh, every time a row's
data is updated — was not chosen because it repeats real, measurable
tree-search overhead on every single scroll frame, for every visible
row; caching it once, in a `ViewHolder`, pays that cost exactly once
per holder, no matter how many times that holder's row is later
refilled with new data as the user scrolls.

---

## Connect the Pieces

Lesson 6e established why `ViewHolder` is declared `static`. This
lesson showed `ViewHolder` itself, combining that choice with Lesson
6b's own caching pattern applied directly to `findViewById`. The next
lesson (Strategy Pattern) introduces a different idea `RecyclerView`
also depends on.

## What Breaks Without This

Calling `findViewById` fresh inside a method that runs on every
scroll frame, instead of caching it once in a `ViewHolder`
constructor, repeats a real, measurable tree search on every single
frame — a real, avoidable performance cost.

## Exercises

1. Add a second cached view, `TextView quantityLabel`, following the
   exact same constructor pattern as `nameLabel`.
2. Explain, in your own words, why `findViewById` runs inside the
   constructor rather than inside a method called on every scroll
   frame.
3. Explain, in your own words, why `ViewHolder` is declared `static`,
   connecting your answer to Lesson 6e's own material.

## Definition of Done

- [ ] You read the real `ItemViewHolder` example and can explain when
      `findViewById` runs.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `findViewById` is called inside the constructor rather than on
      every data update.
