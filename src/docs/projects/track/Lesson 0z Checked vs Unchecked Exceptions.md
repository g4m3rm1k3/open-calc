# Lesson 0z: Checked vs. Unchecked Exceptions

**What you will build:** A disposable lab, using Java's real
`FileReader`.

**What you need to know first:** Lesson 0y's structured exception
handling.

**Terms introduced in this lesson:**

- **Checked vs. unchecked exceptions** — Java distinguishes exceptions
  the compiler forces a caller to catch or explicitly re-declare
  (checked) from ones it doesn't force at all (unchecked).

---

## Concept Unit: Checked vs. Unchecked Exceptions

### The Problem

`NumberFormatException`, from Lesson 0y, could be caught or ignored —
the compiler never forced the `try`/`catch` at all; the program would
have compiled fine without it (and crashed at runtime on bad input).
Not every exception in Java works this way — some are significant
enough that the compiler refuses to compile code that might throw them
unless that possibility is explicitly acknowledged, one way or another.

### Introduce the Concept in Isolation

```
mkdir lesson-0z
cd lesson-0z
```

Create `Main.java`:

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
```

Contrast this with Lesson 0y's own example: removing that `try`/`catch`
around `Integer.parseInt` would have compiled fine (and only failed at
runtime). `FileReader`'s constructor is different — it throws a
`checked vs. unchecked exception` — **first appearance**: Java
distinguishes exceptions the compiler forces a caller to catch or
explicitly re-declare (checked) from ones it doesn't force at all
(unchecked). `FileNotFoundException` (a kind of `IOException`) is
**checked**: the compiler refuses to compile code that might throw it
unless a `try`/`catch` (or an explicit `throws` declaration) is
present. `NumberFormatException` is **unchecked**: legal to leave
completely unhandled, compiling fine either way.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `new FileReader("does-not-exist.txt")` — **(a) first appearance**
   of a constructor that can throw a checked exception: opening a file
   that doesn't exist throws `FileNotFoundException`. Genuinely
   different from every constructor seen in earlier lessons, none of
   which the compiler required a `try`/`catch` around.
2. `catch (IOException e)` — `IOException` is the broader category
   `FileNotFoundException` belongs to; catching the broader type also
   catches the more specific one.
3. Removing the `try`/`catch` — **(b) reappearing** structured
   exception handling from Lesson 0y, now shown *absent*, specifically
   to demonstrate the compiler's own reaction to a checked exception
   with no handling at all.

### CS Lens

The checked/unchecked distinction is Java's own deliberate design
choice about which failures are significant enough to force
acknowledgment at compile time. A checked exception represents a
failure the *type system itself* considers a real possibility every
caller must plan for (a file that might not exist); an unchecked
exception represents a failure Java considers either a programming
mistake or too pervasive to reasonably force handling everywhere it
could occur.

Also recognized in: nowhere directly in Python, which has no such
distinction at all — every exception there is effectively "unchecked,"
left entirely to the programmer's judgment whether to handle it. C#
deliberately has no checked exceptions either, a considered design
choice against Java's own model.

### SE Lens

The alternative — Java treating every exception as unchecked, like C#
and Python do — was not chosen for this language's own design; checked
exceptions are a real, load-bearing part of Java specifically. The
tradeoff is genuine either way: checked exceptions force every caller
to confront a real failure mode explicitly, which can catch a
forgotten error case at compile time — but can also become ceremony,
wrapping every file operation in a `try`/`catch` even in code paths
where a missing file genuinely can't happen.

---

## Connect the Pieces

Lesson 0y's `try`/`catch` around `Integer.parseInt` recovers from a bad
input the programmer chose to guard against. `FileReader`'s
constructor showed that some exceptions, checked ones, aren't optional
to handle at all: the compiler itself refuses to compile code that
ignores them entirely.

## What Breaks Without This

Removing `try`/`catch` around `FileReader`'s constructor produces a
real compiler error, "unreported exception ... must be caught or
declared to be thrown" — proof the compiler genuinely enforces checked
exceptions, not just a style guideline.

## Exercises

1. Try parsing a genuinely valid number through Lesson 0y's own code
   and confirm no exception is thrown at all in that path.
2. Remove the checked-exception `try`/`catch` around `FileReader`, read
   the real compiler error yourself, then restore it.
3. Explain, in your own words, why `NumberFormatException` compiles
   fine unhandled while `FileNotFoundException` does not.

## Definition of Done

- [ ] You ran the `FileReader` example and saw the real "Could not
      open the file" recovery message.
- [ ] You completed Exercise 2 and saw the real compiler error.
- [ ] You can state, without looking back at this lesson, which of
      this lesson's two exceptions is checked and which is unchecked.
