# Lesson 3: Tests Deserve the Same Care as Production Code

*(A Test Helper, and Varargs)*

**User Story**
> As a developer, I want to stop copy-pasting `for` loops in every test,
> before the upcoming spare and strike tests make that repetition worse.

**What you will build**
No new `Game` behavior — a genuinely mixed-frame test proving the current
naive summing is correct for any open-frame game, plus two small test
helper methods that every remaining Epic 1 lesson reuses.

**What you need to know first**
Lesson 2's `List<Integer>`-backed `Game`. Nothing new about `Game` itself
in this lesson — the subject is test *quality*, which Kent Beck's own
writing treats as seriously as production code quality.

---

## Concept Unit: A Test Proving the Current Design's Real Limit

### The Problem

Every test so far used the same roll value repeated twenty times — that's
not a strong enough proof that summing works in general, only that it
works when every frame looks identical. Before adding spare/strike logic,
it's worth a test with genuinely varied, unequal rolls, to nail down that
**this specific case doesn't need new code yet**.

### The New Code

```java
@Test
void mixedOpenFramesSumCorrectly() {
    Game game = new Game();
    int[] rolls = {3, 4, 2, 6, 1, 1, 0, 0, 5, 4};
    for (int pins : rolls) {
        game.roll(pins);
    }
    for (int i = 0; i < 10; i++) {
        game.roll(0);
    }
    assertEquals(26, game.score());
}
```

### Run it

Real output — verified this session:

```text
[         3 tests found           ]
[         3 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* `3+4+2+6+1+1+0+0+5+4 = 26`, and the existing naive
summing implementation gets this right with zero code changes — a real,
honest confirmation that **simple addition is order-independent**, so no
frame-boundary awareness is needed *yet*. This matters for what comes
next: Lesson 4's spare test is specifically chosen because it's the first
case where that stops being true.

### CS Lens

This test is worth naming for what it *doesn't* do: it doesn't drive any
new production code. That's a legitimate, common outcome in TDD — a test
can exist purely to document and lock in a fact about current behavior,
protecting against a future change accidentally breaking something that
already works.

---

## Concept Unit: Varargs — Cleaning Up Repeated Test Setup

### The Problem

`GameTest` now has real duplication: several tests build up a list of
rolls with near-identical `for` loops, differing only in which numbers get
rolled. Kent Beck's own writing on TDD is explicit that test code deserves
the same refactoring discipline production code does — duplication in
tests is still duplication.

### Introduce the concept in isolation

```java
public class VarargsDemo {
    static int sum(int... numbers) {
        int total = 0;
        for (int n : numbers) {
            total += n;
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum(1, 2, 3));
        System.out.println(sum(5));
        System.out.println(sum());
    }
}
```

Run it:

```bash
javac VarargsDemo.java
java VarargsDemo
```

Real output — verified this session:

```text
6
5
0
```

*What this proves:* `int... numbers` lets `sum` accept **any number** of
`int` arguments — zero, one, or many — all without overloading `sum` for
each possible argument count. Inside the method, `numbers` is treated as a
plain `int[]` array.

### Discard the throwaway example

Deleted. Varargs are used for real in `GameTest`'s new helper methods
next.

### The New Code

```java
private void rollMany(Game game, int times, int pins) {
    for (int i = 0; i < times; i++) {
        game.roll(pins);
    }
}

private void rollAll(Game game, int... pins) {
    for (int p : pins) {
        game.roll(p);
    }
}
```

### The Updated Project

Every existing test in `GameTest` is rewritten using these two helpers —
shown here for the two most affected:

```java
@Test
void gutterGameScoresZero() {
    Game game = new Game();
    rollMany(game, 20, 0);            // ← was a 3-line for loop
    assertEquals(0, game.score());
}

@Test
void mixedOpenFramesSumCorrectly() {
    Game game = new Game();
    rollAll(game, 3, 4, 2, 6, 1, 1, 0, 0, 5, 4);  // ← was an int[] + for loop
    rollMany(game, 10, 0);
    assertEquals(26, game.score());
}
```

### Mechanical walkthrough

1. `private void rollMany(Game game, int times, int pins)` — (hard concept
   reappearing) `private` (Lesson 0) — this helper is internal to the test
   class, no reason for anything outside it to call it.
2. `private void rollAll(Game game, int... pins)` — (first appearance in
   this project) the varargs parameter, allowing calls like
   `rollAll(game, 3, 4, 2, 6, 1, 1, 0, 0, 5, 4)` to read as a direct,
   literal list of rolls, instead of constructing an array explicitly.

### CS Lens

This is exactly the same refactor discipline named in Lesson 1's third
phase, applied to test code specifically — recognizing repeated structure
and extracting it, verified safe by the fact that every existing test
still passes afterward, unchanged in what it actually verifies.

### SE Lens

Kent Beck's own writing is direct about this: test code is not a
second-class citizen exempt from good design — duplicated setup logic
across tests is exactly the kind of thing that makes a test suite
expensive to maintain and easy to get subtly wrong (copy a loop, forget to
change one number). `rollMany`/`rollAll` make every future test in this
project read as *what's being tested*, not *how to set up a loop*.

### Run it

Real output — verified this session, after rewriting every test to use
the helpers:

```text
[         3 tests found           ]
[         3 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* the refactor changed nothing about what's being
tested — same three tests, same pass count, cleaner code, exactly what a
refactor step should achieve.

### Connection

Every remaining Epic 1 test, starting with Lesson 4's spare test, is
written using `rollAll`/`rollMany` from the very first draft — the
duplication this lesson fixed never comes back.

---

## Closing

### Connect the pieces

A mixed-frame test (unit 1) confirmed the current naive-sum design handles
any open-frame game correctly, with no new code — a real, deliberate
"nothing to do yet" result. Varargs (unit 2), proven first in isolation,
then let `GameTest`'s repeated setup collapse into two small, reusable
helpers, refactored with the full test suite as proof nothing broke.

### What breaks without this

Introduce a typo into `rollMany` — change `times` to `times - 1` — and
re-run the whole suite. Real, observable failure: `gutterGameScoresZero`
still passes (nineteen zeros still sum to zero), but a test relying on an
exact roll *count* mattering would catch it — a good illustration of why a
shared helper, once correct, is safer than repeating slightly-different
loops by hand in every test: one bug, one place, one fix, instead of
hunting through several copy-pasted variants.

### Exercises

- Add a test with an odd, specific pattern (e.g., `1, 2, 3, 4, 0, 0, 0, 0,
  9, 0` for the first two frames) and confirm your predicted sum matches
  the real output before running it.
- Try calling `rollAll(game)` with zero arguments and confirm it compiles
  and runs without error — connect this to varargs accepting zero
  arguments, proven in the `VarargsDemo` lab.

### Definition of done

- [ ] `mixedOpenFramesSumCorrectly` passes, proving the current design's
      real scope honestly.
- [ ] Every existing test uses `rollMany`/`rollAll`, with no behavior
      change (same pass/fail results as before the refactor).
- [ ] You can explain, in your own words, why cleaning up test code counts
      as "refactor," the same as cleaning up production code.
- [ ] Commit: `git commit -m "Refactor test setup into rollMany/rollAll helpers using varargs — no production code changed"`.
