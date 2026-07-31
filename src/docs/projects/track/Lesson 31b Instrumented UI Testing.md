# Lesson 31b: Instrumented UI Testing (Espresso)

**What you will build:** No new code to compile — this reads real
Android testing code directly.

**What you need to know first:** Lesson 31a's Test Pyramid, Lesson 2e's
Activity.

**Terms introduced in this lesson:**

- **Instrumented UI Testing (Espresso)** — automated tests that launch a
  real Activity on an actual device or emulator and simulate real taps
  and keystrokes against real Views, verifying the screen genuinely
  wires everything together rather than testing pure logic in isolation.

---

## Concept Unit: Instrumented UI Testing (Espresso)

### The Problem

Lesson 30a's own plain-JVM unit tests can verify a method's logic
thoroughly, but nothing about them proves that tapping a real button on a
real screen actually triggers the right chain of real code — a real
`RecyclerView` row click reaching a real `AlertDialog` (Lesson 22b), say,
genuinely wired together, rather than merely each piece separately tested
in isolation.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android testing code, verified
against the actual Espresso framework source:

```java
@Test
public void tappingDeleteButton_showsConfirmationDialog() {
    onView(withId(R.id.deleteButton)).perform(click());
    onView(withText("Delete item?")).check(matches(isDisplayed()));
}
```

This is `Instrumented UI Testing` (Espresso) — **first appearance**:
automated tests that launch a real Activity on an actual device or
emulator and simulate real taps and keystrokes against real Views,
verifying the screen genuinely wires everything together rather than
testing pure logic in isolation. `onView(withId(R.id.deleteButton))
.perform(click())` simulates a genuine tap on the real, on-screen button;
`onView(withText("Delete item?")).check(matches(isDisplayed()))` verifies
the real `AlertDialog` (Lesson 22b) actually appeared as a result — proof
the whole chain, not just one isolated piece, works.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android testing code.

### Mechanical Walkthrough

1. `onView(withId(R.id.deleteButton))` — **(a) first appearance**: locates
   the real, on-screen view by its id, on a real, running Activity.
2. `.perform(click())` — **(a) first appearance**: simulates a genuine
   tap against that real view, exactly as a user's finger would.
3. `onView(withText("Delete item?")).check(matches(isDisplayed()))` —
   **(a) first appearance**: locates a different real view by its
   displayed text, and asserts it is genuinely visible on screen right
   now — proof the tap's real, downstream effect actually happened.

### CS Lens

Instrumented UI testing verifies integration, not logic in isolation —
the same distinction Lesson 30a's own unit tests deliberately avoid
crossing. Recognizing "this test needs a real, running UI to mean
anything" versus "this test only needs pure logic" is the transferable
judgment for choosing which layer of the Test Pyramid a given test
belongs in.

Also recognized in: UI automation frameworks across virtually every
mainstream platform (Selenium and Playwright for web, XCUITest for iOS)
— the same underlying idea of simulating real user interaction against a
real, running UI.

### SE Lens

The alternative — testing `deleteItem`'s own logic with a plain unit test
only, and trusting the UI wiring by inspection — was not chosen for
verifying the full tap-to-dialog chain because a unit test never actually
renders a real button or dispatches a real click event; only an
instrumented test can prove the real, assembled screen behaves correctly
end to end.

---

## Connect the Pieces

Instrumented UI testing is the real, load-bearing mechanism proving a
screen's parts are genuinely wired together — a real tap producing a
real, visible result. The next lesson closes a gap in what Espresso can
automatically see.

## What Breaks Without This

A `RecyclerView` row click that never actually reaches `AlertDialog`
would pass every unit test while being genuinely broken on a real
device — nothing about a unit test alone can catch this.

## Exercises

1. Explain, in your own words, why `onView(withId(R.id.deleteButton))
   .perform(click())` requires a real, running Activity to work at all.
2. Write a second Espresso test (in prose, no code required) verifying
   that tapping a "Cancel" button dismisses a dialog without deleting
   anything.
3. Explain, in your own words, why instrumented tests are described as
   "slower, fewer" compared to unit tests, connecting your answer to
   Lesson 31a's own Test Pyramid material.

## Definition of Done

- [ ] You read the real Espresso example and can explain what
      `onView(...).perform(click())` actually simulates.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why an
      instrumented test can prove something a unit test structurally
      cannot.
