# Lesson 47: Event Stream Classification and ItemTouchHelper

**What you will build:** The first unit is a small, fully runnable, plain
Java lab. The second reads Android's real swipe-detection mechanism
directly.

**What you need to know first:** Lesson 46's `RecyclerView.Adapter`.

**Terms introduced in this lesson:**

- **Event stream classification** — raw, low-level input events get
  interpreted into a small set of meaningful, named higher-level events
  by a layer sitting between the raw signal and application code.
- **`ItemTouchHelper`** — a RecyclerView helper detecting swipe (and
  optionally drag) gestures against rows, distinguishing them from
  vertical scrolling, and reporting completed swipes for the app to act
  on.

---

## Concept Unit: Event Stream Classification

### The Problem

A touchscreen only ever reports raw, low-level coordinates as a finger
moves — nothing about "the user swiped left" or "the user tapped" is
directly available; some layer must interpret a whole sequence of raw
coordinates into one meaningful, named gesture before application code
can react to it sensibly.

### Introduce the Concept in Isolation

```
mkdir lesson-47
cd lesson-47
```

Create `Main.java`:

```java
public class Main {
    static String classifyMovement(int startX, int startY, int endX, int endY) {
        int deltaX = endX - startX;
        int deltaY = endY - startY;

        if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
            return "TAP";
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return "HORIZONTAL_SWIPE";
        } else {
            return "VERTICAL_SCROLL";
        }
    }

    public static void main(String[] args) {
        System.out.println(classifyMovement(0, 0, 2, 1));
        System.out.println(classifyMovement(0, 0, 100, 5));
        System.out.println(classifyMovement(0, 0, 5, 100));
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
TAP
HORIZONTAL_SWIPE
VERTICAL_SCROLL
```

`classifyMovement` takes raw start/end coordinates and produces one of
three named, meaningful categories. This is `event stream classification`
— **first appearance**: raw, low-level input events get interpreted into
a small set of meaningful, named higher-level events by a layer sitting
between the raw signal and application code. Application code never sees
raw coordinates directly — it reacts to `"TAP"`, `"HORIZONTAL_SWIPE"`, or
`"VERTICAL_SCROLL"`, already classified.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `int deltaX = endX - startX; int deltaY = endY - startY;` — computes
   how far the raw movement traveled in each direction.
2. `if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) { return "TAP"; }`
   — **(a) first appearance** of this classification shape: a small,
   near-zero movement is classified as a tap, not a swipe or scroll.
3. `else if (Math.abs(deltaX) > Math.abs(deltaY)) { return
   "HORIZONTAL_SWIPE"; }` — a movement traveling further horizontally
   than vertically is classified as a horizontal swipe.
4. `else { return "VERTICAL_SCROLL"; }` — anything else (traveling
   further vertically) is classified as a vertical scroll.

### CS Lens

Event stream classification sits between raw signal and meaning — the
same general shape as Lesson 09's own exception classification (checked
versus unchecked) or Lesson 37's own command dispatch table, applied
here to continuous, low-level input rather than discrete, named
requests. Recognizing "this raw stream needs classifying into named
categories" is the transferable skill, regardless of what the raw signal
actually is.

Also recognized in: gesture recognition in every touch-based UI
framework, speech recognition (raw audio classified into words), any
system interpreting a continuous raw signal into discrete, named events.

### SE Lens

The alternative — application code reading raw touch coordinates
directly, deciding for itself what gesture occurred — was not chosen
because every single screen that needs gesture handling would repeat the
identical classification logic; a shared classification layer means
every screen reacts to the same, already-named events, with the
classification logic written and correct exactly once.

---

## Concept Unit: `ItemTouchHelper`

### The Problem

`RecyclerView` (Lesson 46) already handles vertical scrolling, but has no
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
   classified and completed — the direct equivalent of this lesson's own
   `classifyMovement` returning `"HORIZONTAL_SWIPE"`, now real and
   load-bearing.
4. `viewHolder.getAdapterPosition()` — **(b) reappearing** connection to
   Lesson 46's own `ViewHolder`, identifying which specific row was
   swiped.
5. `new ItemTouchHelper(callback).attachToRecyclerView(recyclerView);` —
   **(a) first appearance**: attaches the classifier to a real
   `RecyclerView`, which begins routing its own raw touch events through
   it.

### CS Lens

`ItemTouchHelper` is this lesson's own event stream classification, real
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
rows (Lesson 46's own `LayoutManager`/`Adapter` split); `ItemTouchHelper`
keeps that classification logic in one focused, swappable helper, rather
than baked into `RecyclerView` itself.

---

## Connect the Pieces

`classifyMovement` demonstrated the general shape: raw coordinates in,
one named, meaningful category out. `ItemTouchHelper` is that exact
mechanism, real and load-bearing, layered on top of `RecyclerView`:
distinguishing a horizontal swipe from ordinary vertical scrolling, and
calling `onSwiped` only once a swipe genuinely, fully completes.

## What Breaks Without This

A `RecyclerView` with no `ItemTouchHelper` attached has no way to detect
a swipe gesture at all — a finger dragged horizontally across a row is
either ignored entirely or misinterpreted as an attempted vertical
scroll, with no error or crash, simply no swipe-to-delete behavior at
all, since nothing is classifying the raw touch stream into that
specific gesture.

## Exercises

1. Add a fourth classification case to `classifyMovement`,
   `"DIAGONAL"`, for movements where `deltaX` and `deltaY` are roughly
   equal in magnitude, and confirm it's reached correctly.
2. Explain, in your own words, why `onMove` returning `false` disables
   drag-and-reorder specifically, without affecting swipe detection.
3. Explain, in your own words, why `onSwiped` receives a `ViewHolder`
   rather than a raw row index directly, connecting your answer to
   Lesson 46's own `ViewHolder` material.

## Definition of Done

- [ ] You ran the `classifyMovement` example and saw the real, correctly
      classified output for all three cases.
- [ ] You read the real `ItemTouchHelper` example and can explain what
      triggers `onSwiped`.
- [ ] You can state, without looking back at this lesson, why
      `RecyclerView` needs a separate helper for swipe detection instead
      of handling it internally.
