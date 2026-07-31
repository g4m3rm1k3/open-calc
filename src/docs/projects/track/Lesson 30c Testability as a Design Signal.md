# Lesson 30c: Testability as a Design Signal

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 30b's Pure Function.

**Terms introduced in this lesson:**

- **Testability as a Design Signal** — the friction of trying to write a
  test for a piece of code is frequently the earliest, cheapest signal
  that a design is entangling multiple responsibilities, well before
  that entanglement causes a harder problem later.

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

This is `Testability as a Design Signal` — **first appearance**: the
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
   reappearing** pure-function shape from Lesson 30b, the identical
   comparison, now taking its input as a plain parameter instead of
   reading a field.
3. `ValidationRules.isUsernameValid("Alice")` and
   `ValidationRules.isUsernameValid("Al")` — called directly, with plain
   `String` arguments, no object construction or field-setting required
   at all.

### CS Lens

The friction of testing is diagnostic: a function that's hard to test in
isolation is very often a function that has taken on more than one
responsibility (Lesson 8d's own Single Responsibility Principle, applied
here specifically through the lens of testability). Recognizing that
friction *before* it compounds into a genuinely hard-to-untangle design
is the actual skill this concept names.

Also recognized in: the general software engineering heuristic "if it's
hard to test, it's probably badly designed," test-driven development's
own justification for writing tests before implementation (surfacing
this exact friction as early as possible), dependency injection (the
next lesson) as one common structural fix once this friction is noticed.

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

`SignupForm`'s entangled version versus `ValidationRules`'s extracted,
pure version shows that the *difficulty* of writing a test was itself
useful information, pointing directly at where a design had entangled
responsibilities. The next lesson shows a structural fix for a different
kind of testing friction — a class that depends on something external.

## What Breaks Without This

Treating testing difficulty as merely an annoyance, and writing an
elaborate test harness to work around it instead of fixing the design,
leaves the underlying entanglement in place, ready to cause a harder
problem later.

## Exercises

1. Explain, in your own words, why `SignupForm.isUsernameValid()` is
   harder to test than `ValidationRules.isUsernameValid(...)`, connecting
   your answer to Lesson 30b's own definition of a pure function.
2. Find a method elsewhere in this course that reads a field directly
   rather than taking a parameter, and explain how extracting it into a
   pure function (like `ValidationRules`) would change how it's tested.
3. Explain, in your own words, why testing friction is described as "the
   earliest, cheapest signal," rather than just an inconvenience.

## Definition of Done

- [ ] You ran both the `SignupForm` and `ValidationRules` examples and
      can explain the difference in testing effort.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why testing
      friction is useful design information, not just an obstacle.
