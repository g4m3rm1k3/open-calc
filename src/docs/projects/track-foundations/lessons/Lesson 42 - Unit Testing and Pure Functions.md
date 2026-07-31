# Lesson 42: Unit Testing and Pure Functions

**What you will build:** Three disposable Java labs, same pattern as
earlier lessons in this series.

**What you need to know first:** Lesson 02's `method`.

**Terms introduced in this lesson:**

- **Unit testing** — automated, executable tests that mechanically check
  specific behavior still holds, replacing manual re-verification with a
  permanent, runnable specification.
- **Pure function** — a function whose output depends only on its
  inputs, with no side effects — the easiest category of code to test,
  since a test is just "call it, check the return value."
- **Testability as a design signal** — the friction of trying to write a
  test for a piece of code is frequently the earliest, cheapest signal
  that a design is entangling multiple responsibilities, well before that
  entanglement causes a harder problem later.

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
mkdir lesson-42
cd lesson-42
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
`add`'s own logic and manually re-verify it. This is `unit testing` —
**first appearance**: automated, executable tests that mechanically
check specific behavior still holds, replacing manual re-verification
with a permanent, runnable specification. Running `java Main` again,
after any future change to `add`, would immediately reveal whether that
change broke either check.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `static int add(int first, int second) { return first + second; }` —
   **(b) reappearing** method shape from Lesson 02, the actual logic
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

## Concept Unit: Pure Functions

### The Problem

Some functions are trivial to test — call them, check the return value.
Others depend on external state (a database, a UI element's current
text) or produce side effects beyond their return value, making them
much harder to test in isolation, since testing them means first
recreating or faking that external context.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

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

`isValidQuantity` is a `pure function` — **first appearance**: a function
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
   **(b) reappearing** assertion shape from the previous unit, each one
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

## Concept Unit: Testability as a Design Signal

### The Problem

Recognizing *when* a design is entangling multiple responsibilities
often only becomes obvious once someone actually tries to test it — the
friction of writing that test is real, useful information about the
design itself, not merely an inconvenience to work around.

### Introduce the Concept in Isolation

Contrast two versions of the same validation logic. First, entangled:

```java
class SignupForm {
    String usernameFieldText; // stands in for a real UI element's text

    boolean isUsernameValid() {
        return usernameFieldText != null && usernameFieldText.length() >= 3;
    }
}
```

Testing this requires constructing a whole `SignupForm` object and
setting its field first, just to check one comparison. Extracted into a
pure function instead:

```java
class ValidationRules {
    static boolean isUsernameValid(String username) {
        return username != null && username.length() >= 3;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Valid: " + ValidationRules.isUsernameValid("Alice"));
        System.out.println("Valid: " + ValidationRules.isUsernameValid("Al"));
    }
}
```

Compile and run it. Here is the real output:

```
Valid: true
Valid: false
```

This is `testability as a design signal` — **first appearance**: the
friction of trying to write a test for a piece of code is frequently the
earliest, cheapest signal that a design is entangling multiple
responsibilities, well before that entanglement causes a harder problem
later. Testing `SignupForm.isUsernameValid()` required a whole object;
testing `ValidationRules.isUsernameValid(...)` required nothing but the
one value being checked — the friction difference itself is the signal
that the first version had tangled a UI concern together with a pure
comparison.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class SignupForm { String usernameFieldText; boolean
   isUsernameValid() { ... } }` — the entangled version: the comparison
   logic is inseparable from a field standing in for real UI state.
2. `static boolean isUsernameValid(String username) { ... }` — **(b)
   reappearing** pure-function shape from the previous unit, the
   identical comparison, now taking its input as a plain parameter
   instead of reading a field.
3. `ValidationRules.isUsernameValid("Alice")` and
   `ValidationRules.isUsernameValid("Al")` — called directly, with plain
   `String` arguments, no object construction or field-setting required
   at all.

### CS Lens

The friction of testing is diagnostic: a function that's hard to test in
isolation is very often a function that has taken on more than one
responsibility (Lesson 08's own single-responsibility principle, applied
here specifically through the lens of testability). Recognizing that
friction *before* it compounds into a genuinely hard-to-untangle design
is the actual skill this concept names.

Also recognized in: the general software engineering heuristic "if it's
hard to test, it's probably badly designed," test-driven development's
own justification for writing tests before implementation (surfacing
this exact friction as early as possible), dependency injection (Lesson
15) as one common structural fix once this friction is noticed.

### SE Lens

The alternative — treating testing difficulty as merely an annoyance to
work around (writing an elaborate test harness that constructs a full
`SignupForm` just to test one comparison) — was not chosen because it
treats a real design signal as noise; extracting the pure comparison,
per this unit's own second version, both fixes the immediate testing
friction and produces a better-separated design, the actual, larger
payoff.

---

## Connect the Pieces

`assertEquals` demonstrated unit testing directly: automated,
repeatable checks replacing manual re-verification. `isValidQuantity`
showed why a pure function — output determined only by its input, no
side effects — is trivially testable this way. `SignupForm`'s entangled
version versus `ValidationRules`'s extracted, pure version showed that
the *difficulty* of writing that test was itself useful information,
pointing directly at where a design had entangled responsibilities that
extracting a pure function then cleanly separated.

## What Breaks Without This

Skipping automated tests entirely and relying on manual, by-eye checking
means a later, unrelated change can silently break `add`'s own behavior
with nothing pointing at the regression — no test fails, because no test
exists; the mistake is discovered only if and when a human happens to
notice the wrong output somewhere downstream, possibly much later and far
from the actual change that caused it.

## Exercises

1. Add a third pure function, `isValidName(String name)`, checking it's
   neither `null` nor empty, and write two `assertEquals` checks
   covering both a valid and an invalid case.
2. Deliberately break `add`'s own logic (change `+` to `-`) and confirm
   the existing tests correctly report `FAIL`, then restore the correct
   logic.
3. Explain, in your own words, why `SignupForm.isUsernameValid()` is
   harder to test than `ValidationRules.isUsernameValid(...)`, connecting
   your answer to this lesson's own definition of a pure function.

## Definition of Done

- [ ] You ran all three of this lesson's examples and saw their real
      output.
- [ ] You completed Exercise 2 and confirmed a broken implementation
      correctly produces a `FAIL` result.
- [ ] You can state, without looking back at this lesson, what makes a
      function "pure," and why that property makes it easier to test.
