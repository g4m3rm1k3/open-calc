# Lesson 6i: `RecyclerView.LayoutManager`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 6h's `RecyclerView.Adapter`,
Lesson 6g's Strategy Pattern.

**Terms introduced in this lesson:**

- **`RecyclerView.LayoutManager`** — a swappable collaborator
  responsible purely for arranging a RecyclerView's rows spatially,
  independent of the Adapter that supplies data.

---

## Concept Unit: `RecyclerView.LayoutManager`

### The Problem

`ItemAdapter`, from Lesson 6h, decides what data goes in which row —
but says nothing about whether rows are arranged vertically,
horizontally, or in a grid. A `RecyclerView` refuses to render
anything at all without a separate answer to that question.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
recyclerView.setLayoutManager(new LinearLayoutManager(this));
recyclerView.setAdapter(itemAdapter);
```

This is `RecyclerView.LayoutManager` — **first appearance**: a
swappable collaborator responsible purely for arranging a
RecyclerView's rows spatially, independent of the Adapter that
supplies data. `LinearLayoutManager` arranges rows in a simple
vertical (or horizontal) list; a `GridLayoutManager` could be swapped
in instead, arranging the identical `ItemAdapter`'s rows into a grid,
with zero changes to `ItemAdapter` itself.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `recyclerView.setLayoutManager(new LinearLayoutManager(this));` —
   **(a) first appearance**: assigns the arrangement strategy,
   entirely separate from the data-and-view strategy assigned next.
2. `recyclerView.setAdapter(itemAdapter);` — **(b) reappearing**
   assignment of Lesson 6h's own `Adapter`, independent of whichever
   `LayoutManager` was just assigned.

### CS Lens

`LayoutManager` is Lesson 6g's own strategy pattern, real and
load-bearing: arrangement logic is deliberately not built into
`RecyclerView` itself, or into `Adapter` — it's a separate, swappable
collaborator, exactly the same shape as Lesson 6g's own
`Sorter`/`SortStrategy` example.

Also recognized in: layout strategy objects across other UI toolkits
generally, any system separating "what to display" from "how to
arrange it spatially" into two independently swappable pieces.

### SE Lens

The alternative — baking one fixed arrangement directly into
`RecyclerView` or `Adapter` itself — was not chosen because it would
mean a grid-based list and a vertical list would need entirely
separate, duplicated Adapter implementations; keeping arrangement as a
swappable `LayoutManager` means the identical `ItemAdapter` works
correctly with any arrangement strategy, unchanged.

---

## Connect the Pieces

Nine ideas, one real subsystem: eager/lazy evaluation (Lesson 6a)
named the general waste this design avoids. Caching (Lesson 6b) is
exactly what `ViewHolder` does with `findViewById`. View recycling
(Lesson 6c) is the bounded-pool reuse strategy applied to entire row
Views. Layout inflation (Lesson 6d) is how a new row's Views actually
get built from XML. Static nested classes (Lesson 6e) are why
`ViewHolder` avoids a hidden Adapter reference. `ViewHolder` (Lesson
6f) combines all of the above. The strategy pattern (Lesson 6g) is why
`Adapter` (Lesson 6h) and `LayoutManager` are two separate, swappable
collaborators rather than one entangled class. Every one of these
ideas serves the same real, cohesive system: showing a long,
scrollable list efficiently, without wasting work on rows the user
never actually sees.

## What Breaks Without This

A `RecyclerView` with an `Adapter` set but no `LayoutManager` throws a
real runtime error the moment it tries to render:

```
java.lang.NullPointerException: No LayoutManager set on RecyclerView
```

This is concrete proof `LayoutManager` and `Adapter` are genuinely
separate, both required, neither substituting for the other — exactly
the strategy-pattern separation Lesson 6g established.

## Exercises

1. Explain, in your own words, why swapping `LinearLayoutManager` for
   a `GridLayoutManager` requires zero changes to `ItemAdapter`.
2. Try omitting `setLayoutManager` entirely (in your own reasoning, not
   by running code) and predict the real error this produces.
3. Explain, in your own words, why `Adapter` and `LayoutManager` are
   assigned in two separate calls rather than one combined one.

## Definition of Done

- [ ] You read the real `LayoutManager`/`Adapter` assignment example
      and can explain what each is responsible for.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a
      `RecyclerView` refuses to render without a `LayoutManager`.
