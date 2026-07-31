# Lesson 09: Exception Handling

**What you will build:** A disposable lab, same pattern as previous
lessons. Today's case study: stopping one bad input from crashing an
entire program, and a real, compiler-enforced distinction Java draws that
Python has no equivalent for.

**What you need to know first:** Nothing beyond the Learner Baseline —
this lesson doesn't depend on any earlier `track-foundations` lesson.

**Terms introduced in this lesson:**

- **Structured exception handling (`try`/`catch`)** — code that might fail
  is wrapped in a block; a handler runs only if a specific kind of failure
  happens, and control resumes after it instead of the program crashing.
- **Checked vs. unchecked exceptions** — Java distinguishes exceptions the
  compiler forces a caller to catch or explicitly re-declare (checked)
  from ones it doesn't force at all (unchecked).

---

## Concept Unit: `try`/`catch` — Recovering From a Failure Instead of Crashing

### The Problem

Some operations can fail in ways a program can't prevent in advance —
parsing text that turns out not to be a valid number, for instance. Left
unhandled, that failure stops the entire program immediately, at the
exact line it happened, with no chance for any of the surrounding code to
recover or respond. A single bad input shouldn't be able to take down an
entire program.

### Introduce the Concept in Isolation

```
mkdir lesson-09
cd lesson-09
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
number — but instead of stopping the program, control jumps straight to
the matching `catch` block, and the line after the whole `try`/`catch`
still runs normally afterward.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Integer.parseInt(input)` — **(a) first appearance**: a standard-
   library method that converts text to an `int`. It accepts a `String`
   and returns an `int` on success; on failure — text that isn't a valid
   whole number — it does not return at all, it **throws** an exception
   instead, immediately abandoning the rest of its own execution.
2. `try { ... }` — **(a) first appearance**: marks the block of code that
   might throw. Everything inside runs normally until (and unless) a
   throw actually happens.
3. `catch (NumberFormatException e) { ... }` — **(a) first appearance**:
   a handler that runs only if the `try` block throws specifically a
   `NumberFormatException` (the exact kind `Integer.parseInt` throws for
   invalid text). `e` is a variable holding the actual exception object
   that was thrown, available for inspection inside the `catch` block
   (not used further here, but present because Java's syntax requires
   naming it).
4. `System.out.println("Parsed: " + value);` — this line, inside the
   `try` block, never runs in this particular execution, because the
   throw happened on the line before it, immediately abandoning the rest
   of the `try` block the moment the exception occurred.
5. `System.out.println("Program continues normally.");`, after the whole
   `try`/`catch` — runs regardless of whether the `try` block succeeded
   or the `catch` block ran, proving the program genuinely continued past
   the failure instead of stopping.

### CS Lens

`try`/`catch` is **structured exception handling**: a language-level
mechanism for a failure to skip forward to a designated recovery point,
rather than a function needing to check and hand back error codes at
every single call site, or the entire program stopping outright.

Also recognized in: `try`/`except` in Python (structurally near-identical
— even the keyword pattern matches closely), `try`/`catch` in C#, C++,
and JavaScript (all share this same control-flow shape), any language
runtime's own top-level crash handler, which is effectively an unhandled
exception's final `catch`.

### SE Lens

The alternative — letting `Integer.parseInt`'s failure crash the entire
program — was not chosen because a single malformed input, from a user or
a file, shouldn't be able to take down an entire running program. Wrapping
just the risky operation in `try`/`catch` isolates the failure to exactly
the code that can actually fail, letting everything else continue running
normally — a real, meaningful boundary between "this specific thing might
go wrong" and "the whole program is broken."

---

## Concept Unit: Checked vs. Unchecked Exceptions

### The Problem

`NumberFormatException`, from the previous unit, could be caught or
ignored — the compiler never forced the `try`/`catch` at all; the program
would have compiled fine without it (and crashed at runtime on bad
input). Not every exception in Java works this way — some are
significant enough that the compiler refuses to compile code that might
throw them unless that possibility is explicitly acknowledged, one way or
another.

### Introduce the Concept in Isolation

```java
import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        try {
            FileReader reader = new FileReader("does-not-exist.txt");
        } catch (IOException e) {
            System.out.println("Could not open the file.");
        }
    }
}
```

Compile and run it. The terminal prints:

```
Could not open the file.
```

Now remove the `try`/`catch` entirely, keeping just the risky line:

```java
import java.io.FileReader;

public class Main {
    public static void main(String[] args) {
        FileReader reader = new FileReader("does-not-exist.txt");
    }
}
```

Trying to compile this produces a real compiler error:

```
error: unreported exception java.io.FileNotFoundException; must be caught or declared to be thrown
        FileReader reader = new FileReader("does-not-exist.txt");
                             ^
```

Contrast this with Lesson 09's own first unit: removing that `try`/`catch`
around `Integer.parseInt` would have compiled fine (and only failed at
runtime). `FileReader`'s constructor is different — it throws a `checked
vs. unchecked exception` — **first appearance**: Java distinguishes
exceptions the compiler forces a caller to catch or explicitly re-declare
(checked) from ones it doesn't force at all (unchecked).
`FileNotFoundException` (a kind of `IOException`) is **checked**: the
compiler refuses to compile code that might throw it unless a `try`/
`catch` (or an explicit `throws` declaration) is present.
`NumberFormatException` is **unchecked**: legal to leave completely
unhandled, compiling fine either way.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `new FileReader("does-not-exist.txt")` — **(a) first appearance** of a
   constructor that can throw a checked exception: opening a file that
   doesn't exist throws `FileNotFoundException`. Genuinely different from
   every constructor seen in earlier lessons, none of which the compiler
   required a `try`/`catch` around.
2. `catch (IOException e)` — `IOException` is the broader category
   `FileNotFoundException` belongs to; catching the broader type also
   catches the more specific one, a detail this lesson doesn't need to go
   further into but is worth naming plainly rather than leaving
   unexplained.
3. Removing the `try`/`catch` — **(b) reappearing** structured exception
   handling from the previous unit, now shown *absent*, specifically to
   demonstrate the compiler's own reaction to a checked exception with no
   handling at all.

### CS Lens

The checked/unchecked distinction is Java's own deliberate design choice
about which failures are significant enough to force acknowledgment at
compile time. A checked exception represents a failure the *type system
itself* considers a real possibility every caller must plan for (a file
that might not exist); an unchecked exception represents a failure Java
considers either a programming mistake (like passing bad input somewhere
that should have been validated first) or too pervasive to reasonably
force handling everywhere it could occur.

Also recognized in: nowhere directly in Python, which has no such
distinction at all — every exception there is effectively "unchecked,"
left entirely to the programmer's judgment whether to handle it. C#
deliberately has no checked exceptions either, a considered design choice
against Java's own model, one this curriculum's cross-language notes
return to more than once.

### SE Lens

The alternative — Java treating every exception as unchecked, like C# and
Python do — was not chosen for this language's own design; checked
exceptions are a real, load-bearing part of Java specifically. The
tradeoff is genuine either way: checked exceptions force every caller to
confront a real failure mode explicitly, which can catch a forgotten
error case at compile time — but can also become ceremony, wrapping
every file operation in a `try`/`catch` even in code paths where a
missing file genuinely can't happen. This curriculum will use both kinds
going forward; recognizing which is which, on sight, is the actual point
of this lesson.

---

## Connect the Pieces

`try`/`catch` around `Integer.parseInt` recovers from a bad input without
crashing the program — the general mechanism. `FileReader`'s constructor
showed that some exceptions, checked ones, aren't optional to handle at
all: the compiler itself refuses to compile code that ignores them
entirely, where `NumberFormatException`, unchecked, left the choice
entirely to the programmer. Both use the exact same `try`/`catch` syntax;
the real difference is what the compiler requires before either even
compiles.

## What Breaks Without This

This lesson's own second unit already demonstrated the concrete failure
directly: removing `try`/`catch` around `FileReader`'s constructor
produces a real compiler error, "unreported exception ... must be caught
or declared to be thrown" — proof the compiler genuinely enforces checked
exceptions, not just a style guideline.

## Exercises

1. Change the first unit's `catch (NumberFormatException e)` to `catch
   (Exception e)` — a broader type — and confirm it still catches the
   same failure; `NumberFormatException` is itself a kind of `Exception`.
2. Try parsing a genuinely valid number (`"42"`) through the first unit's
   code and confirm the `try` block's success path runs instead of the
   `catch` block.
3. Remove the checked-exception `try`/`catch` around `FileReader`, read
   the real compiler error yourself, then restore it.

## Definition of Done

- [ ] You ran the `Integer.parseInt` example with bad input and saw the
      real "not a valid number" recovery message.
- [ ] You ran the `FileReader` example and saw the real "Could not open
      the file" recovery message.
- [ ] You removed the `try`/`catch` around `FileReader`, saw the real
      compiler error, and restored it.
- [ ] You can state, without looking back at this lesson, which of this
      lesson's two exceptions is checked and which is unchecked.
