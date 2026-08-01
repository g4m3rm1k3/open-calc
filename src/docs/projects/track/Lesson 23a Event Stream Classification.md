# Lesson 23a: Event Stream Classification

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 6h's `RecyclerView.Adapter`.

**Terms introduced in this lesson:**

- **Event stream classification** — raw, low-level input events get
  interpreted into a small set of meaningful, named higher-level events
  by a layer sitting between the raw signal and application code.

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
mkdir lesson-23a
cd lesson-23a
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
   how far the raw movement traveled in each direction, relative to its
   own starting point rather than absolute screen position — every
   classification below depends only on this relative distance, which
   is what makes the same gesture classify identically no matter where
   on the screen it happens.
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
same general shape as Lesson 0z's own exception classification (checked
versus unchecked) or Lesson 21a's own command dispatch table, applied
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

## Connect the Pieces

`classifyMovement` demonstrates the general shape: raw coordinates in,
one named, meaningful category out. The next lesson shows Android's own
real mechanism built on exactly this idea, layered on top of
`RecyclerView`.

## What Breaks Without This

Application code reading raw touch coordinates directly, deciding for
itself what gesture occurred, would repeat the identical classification
logic on every single screen that needs gesture handling.

## Exercises

1. Add a fourth classification case to `classifyMovement`,
   `"DIAGONAL"`, for movements where `deltaX` and `deltaY` are roughly
   equal in magnitude, and confirm it's reached correctly.
2. Explain, in your own words, why the threshold of `5` matters for
   distinguishing a tap from a very short swipe.
3. Name one other raw signal (besides touch coordinates) that needs
   classification into named events before application code can react
   to it.

## Definition of Done

- [ ] You ran the `classifyMovement` example and saw the real, correctly
      classified output for all three cases.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      application code never sees raw coordinates directly.
