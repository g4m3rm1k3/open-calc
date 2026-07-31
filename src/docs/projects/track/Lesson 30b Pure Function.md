# Lesson 30b: Pure Function

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 30a's Unit Testing.

**Terms introduced in this lesson:**

- **Pure Function** — a function whose output depends only on its
  inputs, with no side effects — the easiest category of code to test,
  since a test is just "call it, check the return value."

---

## Concept Unit: Pure Functions

### The Problem

Some functions are trivial to test — call them, check the return value.
Others depend on external state (a database, a UI element's current
text) or produce side effects beyond their return value, making them
much harder to test in isolation, since testing them means first
recreating or faking that external context.

### Introduce the Concept in Isolation

```
mkdir lesson-30b
cd lesson-30b
```

Create `Main.java`:

```java
public class Main {
    static boolean isValidQuantity(int quantity) {
        return quantity > 0;
    }

    static void assertEquals(boolean expected, boolean actual, String testName) {
        if (expected == actual) {
            System.out.println("PASS: " + testName);
        } else {
            System.out.println("FAIL: " + testName);
        }
    }

    public static void main(String[] args) {
        assertEquals(true, isValidQuantity(5), "5 is a valid quantity");
        assertEquals(false, isValidQuantity(-3), "-3 is not a valid quantity");
        assertEquals(false, isValidQuantity(0), "0 is not a valid quantity");
    }
}
```

Compile and run it. Here is the real output:

```
PASS: 5 is a valid quantity
PASS: -3 is not a valid quantity
PASS: 0 is not a valid quantity
```

`isValidQuantity` is a `Pure Function` — **first appearance**: a function
whose output depends only on its inputs, with no side effects — the
easiest category of code to test, since a test is just "call it, check
the return value." Nothing about `isValidQuantity`'s result depends on
anything except the one argument passed in — no field, no external
state, no side effect of any kind — which is exactly why testing it
required nothing beyond calling it directly with different inputs.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `static boolean isValidQuantity(int quantity) { return quantity > 0;
   }` — **(a) first appearance** of a pure function examined explicitly:
   its result depends only on `quantity`, the one input — calling it
   twice with the same argument always produces the identical result,
   with nothing else in the program able to change that.
2. Three separate `assertEquals` calls, each with a different input —
   **(b) reappearing** assertion shape from Lesson 30a, each one
   independently verifying one input/output pair with no setup beyond
   the call itself.

### CS Lens

Purity is a real, testable property: a pure function's output is fully
determined by its arguments alone, with no dependency on external,
mutable state and no observable effect beyond its return value. This is
precisely what makes a pure function trivially, mechanically testable —
no database to fake, no UI to simulate, no ordering of calls to manage.

Also recognized in: mathematical functions generally (`sin`, `sqrt` — the
same input always produces the same output), functional programming's
own strong emphasis on purity as a design goal, any "pure" function
annotation or convention across other languages.

### SE Lens

The alternative — leaving validation logic entangled inside a method that
also reads a UI element's current text directly — was not chosen because
testing it would then require simulating a real UI element just to test
a simple comparison; extracting the comparison itself into a pure
function, separate from the UI-reading code, is what makes it testable
without any UI involved at all.

---

## Connect the Pieces

`isValidQuantity` shows why a pure function — output determined only by
its input, no side effects — is trivially testable. The next lesson uses
this exact contrast to name a broader design signal.

## What Breaks Without This

Leaving validation logic entangled inside a method that also reads a UI
element's current text directly means testing it requires simulating a
real UI element just to test a simple comparison.

## Exercises

1. Add a third pure function, `isValidName(String name)`, checking it's
   neither `null` nor empty, and write two `assertEquals` checks
   covering both a valid and an invalid case.
2. Explain, in your own words, why `isValidQuantity` never needs a
   database, a UI, or any other external context to test.
3. Name one function from earlier in this course that is NOT pure, and
   explain what makes it impure.

## Definition of Done

- [ ] You ran the `isValidQuantity` example and saw the real output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what makes a
      function "pure," and why that property makes it easier to test.
