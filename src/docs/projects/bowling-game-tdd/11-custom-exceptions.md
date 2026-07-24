# Lesson 11: Rejecting Nonsense on Purpose

*(Custom Exceptions, Checked vs. Unchecked)*

**User Story**
> As a developer, I want rolling a negative pin count or more than ten
> pins to fail clearly and immediately, not silently corrupt the score.

**What you will build**
A real gap Lesson 4's own "what breaks without this" section named
honestly: nothing currently stops `roll(-5)` or `roll(15)`. This lesson
closes it with a custom exception.

**What you need to know first**
Lesson 9's `Roll` (the same "define a type's own rules" instinct, applied
to validation instead of equality).

---

## Concept Unit: Checked vs. Unchecked — Two Genuinely Different Kinds of Exception

### The Problem

Java has two exception families with a real, compiler-enforced
difference, and picking the wrong one for `roll()`'s validation matters.

### Introduce the concept in isolation

```java
import java.io.IOException;

class CheckedDemo {
    void mightFail() throws IOException {
        throw new IOException("simulated failure");
    }
}
```

```java
public class CheckedCaller {
    public static void main(String[] args) {
        CheckedDemo demo = new CheckedDemo();
        demo.mightFail();
    }
}
```

Try to compile:

```bash
javac CheckedDemo.java CheckedCaller.java
```

Real output — verified this session:

```text
CheckedCaller.java:4: error: unreported exception IOException; must be caught or declared to be thrown
        demo.mightFail();
                      ^
1 error
```

*What this proves:* `IOException` is a **checked exception** — any method
that might throw it must either catch it or declare `throws IOException`
itself, and the *compiler enforces this*, at every call site, forever.
Now contrast with a `RuntimeException`-based one:

```java
class InvalidRollException extends RuntimeException {
    InvalidRollException(String message) {
        super(message);
    }
}
```

```java
class ValidatingGame {
    void roll(int pins) {
        if (pins < 0 || pins > 10) {
            throw new InvalidRollException("Pins must be between 0 and 10, got: " + pins);
        }
    }
}
```

```java
public class ValidatingGameDemo {
    public static void main(String[] args) {
        ValidatingGame game = new ValidatingGame();
        game.roll(7);
        System.out.println("7 pins accepted");
        game.roll(11);
    }
}
```

Run it (note: no `throws` declaration needed anywhere, and it compiles
fine):

```bash
javac InvalidRollException.java ValidatingGame.java ValidatingGameDemo.java
java ValidatingGameDemo
```

Real output — verified this session:

```text
7 pins accepted
Exception in thread "main" InvalidRollException: Pins must be between 0 and 10, got: 11
	at ValidatingGame.roll(ValidatingGame.java:4)
	at ValidatingGameDemo.main(ValidatingGameDemo.java:6)
```

*What this proves:* `InvalidRollException extends RuntimeException` is
**unchecked** — no `throws` declaration was required anywhere, and the
compiler doesn't force every caller to handle it. `game.roll(7)` ran fine,
proving valid input works; `game.roll(11)` crashed with a clear, specific
message naming exactly what was wrong, at the exact call site that caused
it.

### Discard the throwaway examples

`CheckedDemo`/`CheckedCaller` are discarded. `InvalidRollException` and
the validation logic move into the real project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `InvalidRollException.java`; `Game.roll()`.
- **Change type:** Add validation.
- **Location:** The start of `roll(int pins)`, before `rolls.add(pins)`.
- **Dependencies:** None new.

### The Updated Project

```java
void roll(int pins) {
    if (pins < 0 || pins > 10) {
        throw new InvalidRollException("Pins must be between 0 and 10, got: " + pins);
    }
    rolls.add(pins);
}
```

### CS Lens

This is **failing fast** — rejecting bad input at the exact moment it
enters the system, rather than letting it silently corrupt later
computation (a negative roll would otherwise make `score()` produce a
wrong, hard-to-trace number many method calls later). Also recognized in:
input validation at any system boundary — this repo's other projects'
own "trusting input at a boundary" lessons name the same principle.

### SE Lens

Why `RuntimeException` (unchecked) instead of a checked exception here?
A checked `InvalidRollException` would force *every* caller of `roll()`
— including every test in Epic 1 — to add a `try`/`catch` or a `throws`
declaration, for an error condition that, in correct, valid gameplay,
should never actually happen. Checked exceptions are the right tool for
failures a caller can reasonably be expected to *recover from and
continue* (a file genuinely not being found); unchecked exceptions are
the right tool for programmer errors and invalid input that indicate a
real bug or bad data, which is exactly what a nonsensical pin count is.

### Connection

Every test written from here on that rolls a valid pin count is
unaffected — no signature changes, no `throws` clauses needed anywhere.

---

## Closing

### Connect the pieces

Checked vs. unchecked (unit 1) is a real, compiler-enforced distinction,
proven with a genuine compile error for the checked case and a clean,
un-declared throw for the unchecked case. `InvalidRollException`, chosen
as unchecked, validates `roll()`'s input at the exact point it enters the
system, with a clear, specific message.

### What breaks without this

Roll a negative number, say `-5`, against Lesson 7's un-validated `Game`
(before this lesson's fix). Real, observable consequence: no exception at
all — the negative value gets silently stored in `rolls` and used in
future arithmetic, potentially producing a wrong, hard-to-diagnose score
several frames later, far from where the bad value actually entered.
After this lesson's fix, the exact same call throws immediately, at the
exact line responsible.

### Exercises

- Write a test asserting that `game.roll(-1)` throws `InvalidRollException`
  (JUnit's `assertThrows` is the tool for this — look up its signature).
- Add a second validation rule: the sum of two rolls in the same
  (non-strike) frame can never exceed 10. This one is genuinely harder —
  it needs to know about the *previous* roll, not just the current one in
  isolation.

### Definition of done

- [ ] `roll(-1)` and `roll(11)` both throw `InvalidRollException` with a
      clear message, verified by you.
- [ ] Every existing Epic 1 test still passes, unaffected.
- [ ] You can explain, in your own words, why this exception is unchecked
      and not checked.
- [ ] Commit: `git commit -m "Add InvalidRollException — roll() now rejects nonsensical pin counts immediately"`.
