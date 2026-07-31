# Lesson 30a: Unit Testing

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0e's method.

**Terms introduced in this lesson:**

- **Unit Testing** — automated, executable tests that mechanically check
  specific behavior still holds, replacing manual re-verification with a
  permanent, runnable specification.

---

## Concept Unit: Unit Testing

### The Problem

Confirming a piece of logic still works correctly, after some later,
unrelated change, by manually re-running the program and checking the
output by eye, does not scale: every future change would need the same
manual re-check, repeated forever, with nothing preventing a human from
simply forgetting or skipping it.

### Introduce the Concept in Isolation

```
mkdir lesson-30a
cd lesson-30a
```

Create `Main.java`:

```java
public class Main {
    static int add(int first, int second) {
        return first + second;
    }

    static void assertEquals(int expected, int actual, String testName) {
        if (expected == actual) {
            System.out.println("PASS: " + testName);
        } else {
            System.out.println("FAIL: " + testName + " (expected " + expected + ", got " + actual + ")");
        }
    }

    public static void main(String[] args) {
        assertEquals(5, add(2, 3), "add(2, 3) should be 5");
        assertEquals(0, add(-1, 1), "add(-1, 1) should be 0");
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
PASS: add(2, 3) should be 5
PASS: add(-1, 1) should be 0
```

`assertEquals` mechanically checks `add`'s actual result against an
expected value, every time this program runs — no human needs to read
`add`'s own logic and manually re-verify it. This is `Unit Testing` —
**first appearance**: automated, executable tests that mechanically
check specific behavior still holds, replacing manual re-verification
with a permanent, runnable specification. Running `java Main` again,
after any future change to `add`, would immediately reveal whether that
change broke either check.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `static int add(int first, int second) { return first + second; }` —
   **(b) reappearing** method shape from Lesson 0e, the actual logic
   under test.
2. `static void assertEquals(int expected, int actual, String testName)`
   — **(a) first appearance** of a hand-rolled assertion: compares an
   expected value against the real, actual result, printing `PASS` or
   `FAIL` accordingly — a small, simplified stand-in for what a real
   testing library (JUnit, in real Java projects) provides directly.
3. `assertEquals(5, add(2, 3), "add(2, 3) should be 5");` — calls the
   real logic (`add(2, 3)`), compares its actual result against the
   expected value `5`, and reports the outcome — this single line *is*
   the automated, repeatable test.

### CS Lens

A unit test is a small, automated, repeatable specification: it encodes
"this specific input should produce this specific output" as real,
executable code, rather than as a comment or a manual testing checklist
a human must remember to follow. Running the same test again costs
nothing and requires no human judgment about what to check.

Also recognized in: JUnit (Java's own real, standard testing framework —
this lesson's `assertEquals` is a deliberately simplified stand-in for
JUnit's own method of the same name), `unittest`/`pytest` in Python,
test frameworks across virtually every mainstream language.

### SE Lens

The alternative — manually running the program and checking `add`'s
output by eye, every time a change might affect it — was not chosen
because it doesn't scale past a handful of checks, and depends entirely
on a human remembering to actually perform it, correctly, every single
time. A unit test, once written, runs identically and immediately,
forever, with no risk of a human forgetting or misjudging the output.

---

## Connect the Pieces

`assertEquals` demonstrates unit testing directly: automated, repeatable
checks replacing manual re-verification. The next lesson shows a
category of code that's especially easy to test this way.

## What Breaks Without This

Skipping automated tests entirely and relying on manual, by-eye checking
means a later, unrelated change can silently break `add`'s own behavior
with nothing pointing at the regression — no test fails, because no test
exists.

## Exercises

1. Add a third `assertEquals` check for `add(0, 0)` and confirm it
   passes.
2. Deliberately break `add`'s own logic (change `+` to `-`) and confirm
   the existing tests correctly report `FAIL`, then restore the correct
   logic.
3. Explain, in your own words, why `assertEquals` is described as a
   "simplified stand-in" for JUnit's own real method.

## Definition of Done

- [ ] You ran the `add`/`assertEquals` example and saw the real output.
- [ ] You completed Exercise 2 and confirmed a broken implementation
      correctly produces a `FAIL` result.
- [ ] You can state, without looking back at this lesson, why an
      automated test scales better than manual, by-eye checking.
