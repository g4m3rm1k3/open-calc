# Lesson 0y: Structured Exception Handling — `try`/`catch`

**What you will build:** A disposable lab. Today's case study: stopping
one bad input from crashing an entire program.

**What you need to know first:** Nothing beyond the Learner Baseline —
this lesson doesn't depend on any earlier lesson in this series.

**Terms introduced in this lesson:**

- **Structured exception handling (`try`/`catch`)** — code that might
  fail is wrapped in a block; a handler runs only if a specific kind of
  failure happens, and control resumes after it instead of the program
  crashing.

---

## Concept Unit: `try`/`catch` — Recovering From a Failure Instead of Crashing

### The Problem

Some operations can fail in ways a program can't prevent in advance —
parsing text that turns out not to be a valid number, for instance.
Left unhandled, that failure stops the entire program immediately, at
the exact line it happened, with no chance for any of the surrounding
code to recover or respond. A single bad input shouldn't be able to
take down an entire program.

### Introduce the Concept in Isolation

```
mkdir lesson-0y
cd lesson-0y
```

Create `Main.java`:

```java
public class Main {
    public static void main(String[] args) {
        String input = "not a number";

        try {
            int value = Integer.parseInt(input);
            System.out.println("Parsed: " + value);
        } catch (NumberFormatException e) {
            System.out.println("That wasn't a valid number.");
        }

        System.out.println("Program continues normally.");
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

The terminal prints:

```
That wasn't a valid number.
Program continues normally.
```

`try { ... } catch (NumberFormatException e) { ... }` is `structured
exception handling` — **first appearance**: code that might fail is
wrapped in a block; a handler runs only if a specific kind of failure
happens, and control resumes after it instead of the program crashing.
`Integer.parseInt("not a number")` fails — the text isn't a valid
number — but instead of stopping the program, control jumps straight
to the matching `catch` block, and the line after the whole
`try`/`catch` still runs normally afterward.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Integer.parseInt(input)` — **(a) first appearance**: a
   standard-library method that converts text to an `int`. It accepts
   a `String` and returns an `int` on success; on failure — text that
   isn't a valid whole number — it does not return at all, it
   **throws** an exception instead, immediately abandoning the rest of
   its own execution.
2. `try { ... }` — **(a) first appearance**: marks the block of code
   that might throw. Everything inside runs normally until (and
   unless) a throw actually happens.
3. `catch (NumberFormatException e) { ... }` — **(a) first
   appearance**: a handler that runs only if the `try` block throws
   specifically a `NumberFormatException` (the exact kind
   `Integer.parseInt` throws for invalid text). `e` is a variable
   holding the actual exception object that was thrown, available for
   inspection inside the `catch` block.
4. `System.out.println("Parsed: " + value);` — this line, inside the
   `try` block, never runs in this particular execution, because the
   throw happened on the line before it.
5. `System.out.println("Program continues normally.");`, after the
   whole `try`/`catch` — runs regardless of whether the `try` block
   succeeded or the `catch` block ran, proving the program genuinely
   continued past the failure instead of stopping.

### CS Lens

`try`/`catch` is **structured exception handling**: a language-level
mechanism for a failure to skip forward to a designated recovery
point, rather than a function needing to check and hand back error
codes at every single call site, or the entire program stopping
outright.

Also recognized in: `try`/`except` in Python (structurally
near-identical — even the keyword pattern matches closely), `try`/
`catch` in C#, C++, and JavaScript (all share this same control-flow
shape), any language runtime's own top-level crash handler, which is
effectively an unhandled exception's final `catch`.

### SE Lens

The alternative — letting `Integer.parseInt`'s failure crash the
entire program — was not chosen because a single malformed input, from
a user or a file, shouldn't be able to take down an entire running
program. Wrapping just the risky operation in `try`/`catch` isolates
the failure to exactly the code that can actually fail, letting
everything else continue running normally.

---

## Connect the Pieces

`try`/`catch` around `Integer.parseInt` recovers from a bad input
without crashing the program. The next lesson (Checked vs. Unchecked
Exceptions) shows that not every exception gives a programmer the
choice of whether to handle it at all.

## What Breaks Without This

Remove the `try`/`catch`, keeping only `int value =
Integer.parseInt(input);`. Run it yourself and see the real output —
the program crashes entirely at that line, and
`"Program continues normally."` never prints at all.

## Exercises

1. Change `catch (NumberFormatException e)` to `catch (Exception e)` —
   a broader type — and confirm it still catches the same failure.
2. Try parsing a genuinely valid number (`"42"`) and confirm the `try`
   block's success path runs instead of the `catch` block.
3. Remove the `try`/`catch` entirely, run the program, and read the
   real crash output yourself before restoring it.

## Definition of Done

- [ ] You ran the example with bad input and saw the real "not a valid
      number" recovery message.
- [ ] You completed Exercise 3 and saw the real crash when
      `try`/`catch` is removed.
- [ ] You can state, without looking back at this lesson, what happens
      to code after a `try` block once an exception is thrown inside
      it.
