# Lesson 9d: Fail-Fast Validation

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 9c's boundary validation.

**Terms introduced in this lesson:**

- **Fail-fast validation** — stopping immediately at the first detected
  invalid state rather than propagating bad data further into a system.

---

## Concept Unit: Fail-Fast Validation

### The Problem

An empty name, a non-numeric quantity, and a negative quantity might all
be present in the same form submission at once. Checking every field,
collecting every problem, and only then deciding what to do is a valid
strategy — but a *simpler*, and often preferable, one is to stop at the
very first problem found.

### Introduce the Concept in Isolation

```
mkdir lesson-9d
cd lesson-9d
```

Create `Main.java`:

```java
public class Main {
    static void validateAndCreate(String name, String rawQuantity) {
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty.");
        }
        int quantity;
        try {
            quantity = Integer.parseInt(rawQuantity);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Quantity must be a number.");
        }
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative.");
        }
        System.out.println("Created: " + name + ", " + quantity);
    }

    public static void main(String[] args) {
        try {
            validateAndCreate("", "-5");
        } catch (IllegalArgumentException e) {
            System.out.println("Stopped immediately: " + e.getMessage());
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
Stopped immediately: Name cannot be empty.
```

#### Execution Trace

Trace of `validateAndCreate("", "-5")`'s three possible throw points:

1. `if (name.isEmpty())` — `""` is empty, so this check fails first;
   `throw new IllegalArgumentException("Name cannot be empty.")` runs
   immediately, and the method exits right here.
2. `Integer.parseInt(rawQuantity)` — never reached at all this run, even
   though `"-5"` would still fail the *next* check if execution ever got
   there.
3. `if (quantity < 0)` — also never reached, for the same reason: step 1
   already stopped execution before any later check could run.

Both `""` (an empty name) and `"-5"` (a negative quantity) are invalid,
yet only the *first* problem — the empty name — is ever reported;
execution stops there and never reaches the quantity check at all. This
is `fail-fast validation` — **first appearance**: stopping immediately at
the first detected invalid state rather than propagating bad data further
into a system. `validateAndCreate` never continues past its first failed
check, regardless of how many other problems the input might also have.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `if (name.isEmpty()) { throw ... }` — **(a) first appearance**: the
   first check; fails immediately for `""`.
2. Because step 1 already threw, `Integer.parseInt(rawQuantity)` is never
   reached at all — `"-5"`'s own quantity check never runs this time.
3. `catch (IllegalArgumentException e)` in `main` — catches whichever
   single exception was thrown first, proving execution genuinely stopped
   at the earliest failure.

### CS Lens

Fail-fast trades completeness (reporting every problem at once) for
simplicity and safety (never continuing with any known-bad state, even
briefly). This connects directly to Lesson 9c's own boundary validation:
the boundary is exactly where fail-fast validation should live — reject
immediately, rather than let a partially-valid, partially-invalid object
exist even momentarily.

Also recognized in: assertions in defensive programming (`assert`
statements that halt immediately on a violated invariant), fail-fast
behavior in concurrent collections (`ConcurrentModificationException`
thrown immediately rather than allowing continued, silently-corrupted
iteration).

### SE Lens

The alternative — collecting every validation problem before reporting
any of them — was not chosen for this lesson's own form-validation case
because it requires more code (accumulating a list of errors, rather than
throwing at the first one) for a benefit (showing the user every problem
at once) that matters more for larger, multi-field forms; for a small
form like this one, fail-fast is the simpler, sufficient choice.

---

## Connect the Pieces

`parseQuantity` (Lesson 9c) demonstrated boundary validation — checking
right where untrusted text first crosses into the program. This lesson
adds fail-fast: stopping at the very first problem found, rather than
letting bad data linger even briefly. The next lesson closes the loop
with a small, transient confirmation once a submission actually
succeeds.

## What Breaks Without This

Skipping fail-fast and continuing past a first invalid field risks
constructing a partially-invalid object before the second problem is
even detected.

## Exercises

1. Modify `validateAndCreate` to check the quantity's numeric-ness
   *before* checking whether the name is empty, and explain why the
   reported error changes for the same two invalid inputs.
2. Explain, in your own words, why fail-fast validation pairs naturally
   with boundary validation from the previous lesson.
3. Explain, in your own words, one situation where collecting every
   problem at once, instead of failing fast, would be worth the extra
   code.

## Definition of Done

- [ ] You ran the `validateAndCreate` fail-fast example and can explain
      what it demonstrates.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `validateAndCreate` never reaches its second or third check in
      this run.
