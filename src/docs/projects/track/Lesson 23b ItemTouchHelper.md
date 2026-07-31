# Lesson 23b: `ItemTouchHelper`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 23a's event stream
classification, Lesson 6h's `RecyclerView.Adapter`.

**Terms introduced in this lesson:**

- **`ItemTouchHelper`** — a RecyclerView helper detecting swipe (and
  optionally drag) gestures against rows, distinguishing them from
  vertical scrolling, and reporting completed swipes for the app to act
  on.

---

## Concept Unit: `ItemTouchHelper`

### The Problem

`RecyclerView` (Lesson 6h) already handles vertical scrolling, but has no
built-in way to detect a horizontal swipe against one specific row,
distinct from the vertical scrolling gesture it already recognizes.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
ItemTouchHelper.SimpleCallback callback = new ItemTouchHelper.SimpleCallback(
    0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {

    @Override
    public boolean onMove(RecyclerView rv, RecyclerView.ViewHolder vh, RecyclerView.ViewHolder target) {
        return false;
    }

    @Override
    public void onSwiped(RecyclerView.ViewHolder viewHolder, int direction) {
        int position = viewHolder.getAdapterPosition();
        System.out.println("Row " + position + " was swiped away.");
    }
};

new ItemTouchHelper(callback).attachToRecyclerView(recyclerView);
```

This is `ItemTouchHelper` — **first appearance**: a RecyclerView helper
detecting swipe (and optionally drag) gestures against rows,
distinguishing them from vertical scrolling, and reporting completed
swipes for the app to act on. `ItemTouchHelper` is Android's own real
event-stream classifier for RecyclerView rows specifically —
distinguishing a horizontal swipe from the vertical scroll `RecyclerView`
already handles, and calling `onSwiped` only once a swipe genuinely
completes.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.LEFT |
   ItemTouchHelper.RIGHT)` — **(a) first appearance**: the first
   argument (`0`) disables drag gestures; the second names which swipe
   directions to detect.
2. `onMove(...) { return false; }` — **(a) first appearance**: handles
   drag-and-reorder gestures, disabled here by always returning `false`,
   since this example only cares about swiping.
3. `onSwiped(RecyclerView.ViewHolder viewHolder, int direction)` — **(a)
   first appearance**: called only once a swipe gesture is fully
   classified and completed — the direct equivalent of Lesson 23a's own
   `classifyMovement` returning `"HORIZONTAL_SWIPE"`, now real and
   load-bearing.
4. `viewHolder.getAdapterPosition()` — **(b) reappearing** connection to
   Lesson 6f's own `ViewHolder`, identifying which specific row was
   swiped.
5. `new ItemTouchHelper(callback).attachToRecyclerView(recyclerView);` —
   **(a) first appearance**: attaches the classifier to a real
   `RecyclerView`, which begins routing its own raw touch events through
   it.

### CS Lens

`ItemTouchHelper` is Lesson 23a's own event stream classification, real
and load-bearing: raw touch coordinates against a `RecyclerView` are
classified into "this is a swipe" versus "this is ordinary scrolling,"
with application code only ever reacting to the already-classified,
completed swipe event via `onSwiped`.

Also recognized in: swipe-to-delete/swipe-to-archive gestures across
virtually every mainstream mobile list UI, drag handles in reorderable
lists (the same helper's own optional drag-detection half).

### SE Lens

The alternative — `RecyclerView` itself detecting and distinguishing
swipes from scrolling internally — was not chosen because gesture
detection is a genuinely separate concern from arranging and recycling
rows (Lesson 6h's own `LayoutManager`/`Adapter` split); `ItemTouchHelper`
keeps that classification logic in one focused, swappable helper, rather
than baked into `RecyclerView` itself.

---

## Connect the Pieces

`ItemTouchHelper` is Lesson 23a's classification idea, real and
load-bearing, layered on top of `RecyclerView`: distinguishing a
horizontal swipe from ordinary vertical scrolling, and calling
`onSwiped` only once a swipe genuinely, fully completes. The next lesson
shows the feedback shown once that swipe is acted on.

## What Breaks Without This

A `RecyclerView` with no `ItemTouchHelper` attached has no way to detect
a swipe gesture at all — a finger dragged horizontally across a row is
either ignored entirely or misinterpreted as an attempted vertical
scroll, with no error or crash, simply no swipe-to-delete behavior at
all, since nothing is classifying the raw touch stream into that
specific gesture.

## Exercises

1. Explain, in your own words, why `onMove` returning `false` disables
   drag-and-reorder specifically, without affecting swipe detection.
2. Explain, in your own words, why `onSwiped` receives a `ViewHolder`
   rather than a raw row index directly, connecting your answer to
   Lesson 6f's own `ViewHolder` material.
3. Change `ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT` to only
   `ItemTouchHelper.LEFT`, and explain, in your own words, what gesture
   would no longer be detected.

## Definition of Done

- [ ] You read the real `ItemTouchHelper` example and can explain what
      triggers `onSwiped`.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `RecyclerView` needs a separate helper for swipe detection instead
      of handling it internally.
