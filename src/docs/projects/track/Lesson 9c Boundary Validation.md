# Lesson 9c: Boundary Validation

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 9b's UI hint vs. enforced
validation.

**Terms introduced in this lesson:**

- **Boundary validation** — validating data specifically at the point
  where it crosses from an untrusted source (like user input) into the
  rest of a program, rather than trusting it further downstream.

---

## Concept Unit: Boundary Validation

### The Problem

Bad data doesn't stay contained. Left unchecked at the point it's
entered, it would flow into an `Item` object, then into the in-memory
list, then — starting with a later lesson's own permanent-storage
material — into storage itself, getting harder to trace back to its
actual source the further it travels.

### Introduce the Concept in Isolation

```
mkdir lesson-9c
cd lesson-9c
```

Create `Main.java`:

```java
public class Main {
    static int parseQuantity(String rawQuantity) {
        // Validated right here, at the boundary — before this value
        // goes anywhere else in the program.
        return Integer.parseInt(rawQuantity);
    }

    public static void main(String[] args) {
        int quantity = parseQuantity("12");
        System.out.println("Parsed quantity: " + quantity);

        try {
            parseQuantity("abc");
        } catch (NumberFormatException e) {
            System.out.println("Rejected at the boundary: " + e.getMessage());
        }
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
Parsed quantity: 12
Rejected at the boundary: For input string: "abc"
```

`parseQuantity` is the single point where raw, untrusted text first
becomes a real `int` used by the rest of the program. This is
`boundary validation` — **first appearance**: validating data
specifically at the point where it crosses from an untrusted source
(like user input) into the rest of a program, rather than trusting it
further downstream. `"abc"` is rejected right here, at the boundary,
before it could ever reach an `Item`, a list, or storage.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `parseQuantity("12")` — **(a) first appearance**: valid input,
   crosses the boundary successfully, becomes a real `int`.
2. `parseQuantity("abc")` — invalid input, caught and rejected at this
   exact boundary — `Integer.parseInt` throws before an `int` is ever
   produced.
3. Nothing downstream of `parseQuantity` ever sees `"abc"` at all — the
   boundary is the only place this specific check needs to exist.

### CS Lens

Boundary validation names *where* a check belongs, not merely *that*
one exists — the entry point where untrusted data first enters trusted
territory. The same concept recurs anywhere a system has a trust
boundary: a network request handler, a file parser, a form submission
handler.

Also recognized in: input sanitization at API boundaries in web
backends, parser validation at a file format's own entry point,
"validate at the edges" as a general architecture principle.

### SE Lens

The alternative — checking a quantity's validity scattered across
several places further downstream (say, once before saving, and again
before displaying) — was not chosen because it duplicates the check and
still leaves a window where invalid data exists in memory between the
boundary and wherever the "real" check eventually runs; one check, right
at the boundary, means invalid data is never represented anywhere past
that point at all.

---

## Connect the Pieces

Lesson 9b showed that a UI hint alone is never a real guarantee. This
lesson shows the actual guarantee: a real check, running in code,
right at the point untrusted text first crosses into the program. The
next lesson builds on this same boundary to stop at the *first*
problem found, rather than checking everything before deciding what to
do.

## What Breaks Without This

Trusting `inputType="number"` alone, with no boundary check in code,
lets a pasted or hardware-typed non-numeric string reach `Integer
.parseInt` deep inside the app, crashing with an uncaught
`NumberFormatException` far from where the bad data actually entered.

## Exercises

1. Explain, in your own words, why `parseQuantity` is the correct
   place for this check, rather than checking again later just before
   saving.
2. Modify `parseQuantity` to also reject a negative number, and
   explain why that check belongs at the same boundary.
3. Explain, in your own words, why validating scattered across several
   downstream places is weaker than one check at the boundary.

## Definition of Done

- [ ] You ran the `parseQuantity` boundary-validation example and can
      explain what it demonstrates.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why the
      boundary is the correct place for this check.
