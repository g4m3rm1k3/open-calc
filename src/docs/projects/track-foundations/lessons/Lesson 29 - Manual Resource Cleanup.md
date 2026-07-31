# Lesson 29: Manual Resource Cleanup

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons. Today's case study: a category of object garbage
collection alone does not fully clean up.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Manual resource cleanup** — some objects hold real OS resources (file
  handles, locks, connections) that must be explicitly released rather
  than left to garbage collection, unlike ordinary in-memory objects.

---

## Concept Unit: Manual Resource Cleanup

### The Problem

An ordinary object — a `Dog`, a `Box` — holds only in-memory data; when
nothing references it anymore, Java's garbage collector reclaims that
memory automatically, eventually, with no code needing to do anything
explicit. Some objects hold something different: a real, limited
operating-system resource — an open file, a network connection — that
the OS itself tracks separately from Java's own memory. Waiting for
garbage collection to notice and clean these up is not reliable enough:
a program can hold a file open, unnecessarily, for far longer than it
should, or run out of a limited OS resource entirely, well before garbage
collection ever runs.

### Introduce the Concept in Isolation

```
mkdir lesson-29
cd lesson-29
```

Create a small text file, `notes.txt`, with any text content, then
create `Main.java`:

```java
import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        FileReader reader = new FileReader("notes.txt");

        int firstCharacter = reader.read();
        System.out.println("First character code: " + firstCharacter);

        reader.close();
        System.out.println("File closed.");
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output (the exact number depends on `notes.txt`'s own
first character):

```
First character code: 72
File closed.
```

`reader.close()` is `manual resource cleanup` — **first appearance**:
some objects hold real OS resources (file handles, locks, connections)
that must be explicitly released rather than left to garbage collection,
unlike ordinary in-memory objects. `FileReader` holds a real, OS-level
file handle — a limited resource the operating system itself tracks —
not just in-memory Java data. `close()` releases that OS-level handle
explicitly, immediately, rather than waiting for garbage collection to
eventually notice the `FileReader` object is unreachable.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `new FileReader("notes.txt")` — **(b) reappearing** checked-exception-
   throwing constructor from Lesson 09, here actually used to open a
   real file for reading.
2. `reader.read()` — **(a) first appearance**: reads one character from
   the open file, returning its numeric character code.
3. `reader.close()` — **(a) first appearance**: releases the underlying
   OS file handle explicitly. Without this call, the file handle would
   remain open — held by this program, unavailable for anything else to
   fully claim exclusively — for as long as the `FileReader` object
   happens to still be reachable, which garbage collection makes no
   promises about the timing of at all.

### CS Lens

Garbage collection reclaims *memory* — it makes no promises at all about
*when*, or whether, it reclaims other resources a Java object happens to
also be holding, like an OS file handle. This is exactly why classes
wrapping OS resources provide an explicit `close()` (or similar) method:
memory management and resource management are genuinely different
concerns, and only one of them is automatic in Java.

Also recognized in: `with` blocks in Python (automatically closing a
file at the end of the block, a language-level convenience Java's own
`try`-with-resources syntax, a later lesson's own subject, provides
similarly), `using` statements in C#, database connection pools requiring
explicit release back to the pool in virtually every language.

### SE Lens

The alternative — never calling `close()`, trusting garbage collection
to eventually clean up the file handle — was not chosen because it's not
reliable: garbage collection runs on its own schedule, unpredictable from
application code's own perspective, and a program that opens many files
without closing them can exhaust the OS's own limit on simultaneously
open file handles well before garbage collection ever reclaims the
unreachable `FileReader` objects holding them.

---

## Connect the Pieces

`new FileReader("notes.txt")` opens a real OS resource, not just
in-memory data. `reader.close()` is the explicit release that resource
genuinely requires — proof that some objects need cleanup Java's own
automatic garbage collector does not, and cannot reliably, perform on
their behalf.

## What Breaks Without This

Opening many files in a loop without closing any of them eventually
throws a real runtime error, resembling:

```
java.io.FileNotFoundException: too_many_files.txt (Too many open files)
```

This is concrete, OS-enforced proof that open file handles are a real,
limited resource — one garbage collection's own unpredictable timing does
not reliably protect a program from exhausting.

## Exercises

1. Deliberately remove `reader.close()` from this lesson's own example
   and confirm the program still compiles and produces the same visible
   output — proof the omission is silent, not caught by the compiler at
   all.
2. Open a second `FileReader` on the same file, reading a second
   character, and confirm both readers can be closed independently.
3. Explain, in your own words, why a plain `Dog` object (from Lesson 01)
   never needs an equivalent `close()` method.

## Definition of Done

- [ ] You ran the file-reading example and saw the real character-code
      output.
- [ ] You completed Exercise 1 and confirmed omitting `close()` produces
      no compiler error at all.
- [ ] You can state, without looking back at this lesson, what kind of
      object needs manual cleanup, and what kind doesn't.
