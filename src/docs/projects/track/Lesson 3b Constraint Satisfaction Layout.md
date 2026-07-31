# Lesson 3b: Constraint Satisfaction Layout

**What you will build:** No new code — a real Android layout example,
read directly.

**What you need to know first:** Lesson 3a's view tree.

**Terms introduced in this lesson:**

- **Constraint satisfaction (layout)** — a system where you declare
  relationships that must hold between elements, and a solver — not you
  — computes concrete positions/sizes that satisfy all of them
  simultaneously.

---

## Concept Unit: Constraint Satisfaction Layout

### The Problem

Even within a view tree, some way is needed to precisely express *how*
elements relate to each other and their parent — "aligned to the
parent's bottom edge," "centered horizontally" — without manually
computing exact pixel positions that would need recalculating for
every possible screen size.

### Introduce the Concept in Isolation

A `ConstraintLayout` fragment, verified against the real Android
layout schema:

```xml
<androidx.constraintlayout.widget.ConstraintLayout>
    <Button
        android:id="@+id/saveButton"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

This is `constraint satisfaction layout` — **first appearance**: a
system where you declare relationships that must hold between
elements, and a solver — not you — computes concrete positions/sizes
that satisfy all of them simultaneously.
`app:layout_constraintBottom_toBottomOf="parent"` declares a
relationship — "my bottom edge aligns with my parent's bottom edge" —
never an actual pixel value; Android's own layout solver computes the
real, concrete position at render time, correctly, regardless of the
parent's actual size on any given device.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
layout XML.

### Mechanical Walkthrough

1. `<androidx.constraintlayout.widget.ConstraintLayout>` — **(a) first
   appearance** of this specific layout type: a container whose entire
   purpose is solving declared constraints, rather than applying one
   fixed, simple rule (like `LinearLayout`'s own top-to-bottom or
   side-by-side stacking).
2. `app:layout_constraintBottom_toBottomOf="parent"` and
   `app:layout_constraintEnd_toEndOf="parent"` — **(a) first
   appearance** of constraint attributes: each declares one
   relationship to satisfy — "bottom edge matches parent's bottom,"
   "end edge matches parent's end" — with no pixel coordinate anywhere
   in either declaration.

### CS Lens

A constraint-satisfaction system is a genuinely different
computational approach from directly assigning positions: you declare
*what must be true* simultaneously, and a solver finds concrete values
satisfying every declared constraint at once — the same general idea
behind spreadsheet formula solvers, physics simulation engines
resolving multiple simultaneous forces, or a Sudoku solver satisfying
every row/column/box rule at once.

Also recognized in: Auto Layout on iOS (a near-identical
constraint-declaration system for the same underlying reason), CSS
Flexbox and Grid on the web (declared relationships — "space evenly,"
"align center" — resolved by the browser's own layout engine, not the
developer's own pixel math).

### SE Lens

The alternative — computing and hardcoding each element's exact pixel
position by hand — was not chosen because it would need
recalculating, by hand, for every distinct screen size and orientation
a device might have; declaring relationships once and letting a
solver compute the concrete result is what lets one layout XML file
correctly serve every screen size without per-device rewriting.

---

## Connect the Pieces

Lesson 3a's view tree established that position is relative, never
absolute. This lesson showed the precise mechanism computing those
relative positions: declared constraints, solved automatically. The
next lesson (`dp`/`sp`) covers the actual size units used within a
solved layout.

## What Breaks Without This

Hardcoding a button's exact pixel position instead of declaring a
constraint would need recalculating by hand for every distinct screen
size — a real, ongoing maintenance cost the solver removes entirely by
computing the correct position itself, on every device, from the same
one declaration.

## Exercises

1. Write a real `ConstraintLayout` fragment declaring a `TextView`
   centered both horizontally and vertically within its parent, using
   the appropriate constraint attributes.
2. Add a second `Button`, constrained to sit directly above the first
   one.
3. Explain, in your own words, why a constraint declares a
   relationship rather than a pixel value.

## Definition of Done

- [ ] You read the `ConstraintLayout` example and can explain what
      `layout_constraintBottom_toBottomOf="parent"` declares.
- [ ] You completed Exercise 1 and wrote a correct, real constraint
      declaration.
- [ ] You can state, without looking back at this lesson, what a
      constraint-satisfaction solver actually does.
