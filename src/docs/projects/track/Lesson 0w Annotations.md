# Lesson 0w: Annotations — Metadata the Compiler Actually Reads

**What you will build:** A disposable lab. Today's case study: metadata
attached to code that the compiler itself reads and acts on.

**What you need to know first:** Lesson 0a's `class`, Lesson 0m's
`@Override` (already used without full explanation).

**Terms introduced in this lesson:**

- **Annotation** — metadata attached to a class, method, or field, read
  by a compiler, IDE, or library tool — not executed as part of the
  program's own normal flow.

---

## Concept Unit: Annotations — Metadata the Compiler Actually Reads

### The Problem

Lesson 0m used `@Override` above a method without stopping to name
what that `@`-prefixed word actually was, beyond "the compiler checks
this." That shape — a word starting with `@`, sitting above a class,
method, or field — recurs constantly in Java code (`@NonNull`,
`@Entity`, `@Test`), and without a name for the general category, each
new one looks like an unrelated, unexplained decoration rather than an
instance of one consistent mechanism.

### Introduce the Concept in Isolation

```
mkdir lesson-0w
cd lesson-0w
```

Create `Main.java`:

```java
@Deprecated
class OldLogger {
    void log(String message) {
        System.out.println("[old] " + message);
    }
}

public class Main {
    public static void main(String[] args) {
        OldLogger logger = new OldLogger();
        logger.log("Starting up.");
    }
}
```

Compile it and read the real compiler output:

```
javac Main.java
```

It prints a warning, not an error:

```
Note: Main.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
```

Then run it:

```
java Main
```

The terminal prints:

```
[old] Starting up.
```

`@Deprecated` is an `annotation` — **first appearance**: metadata
attached to a class, method, or field, read by a compiler, IDE, or
library tool — not executed as part of the program's own normal flow.
`@Deprecated` itself does nothing at runtime — the program compiles
and runs exactly as it would without it — but the compiler reads it and
prints a warning anywhere `OldLogger` gets used, flagging that this
class is marked as something callers shouldn't rely on going forward.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `@Deprecated`, written directly above `class OldLogger` — **(a)
   first appearance.** Attaches metadata to the class declaration
   itself. No parentheses, no arguments — this particular annotation
   carries no extra information beyond its own presence.
2. `class OldLogger { ... }` — an ordinary class otherwise.
3. `new OldLogger()` and `logger.log(...)` — reused object-creation
   and method-call syntax. Nothing about runtime behavior changed
   because of `@Deprecated` — the warning is entirely a compile-time,
   informational thing, never affecting what the program actually does
   when it runs.

### CS Lens

An annotation is data *about* code, not code itself — it never
executes as part of the program's control flow the way a method body
does. Whatever reads an annotation (the compiler here; sometimes an
IDE, sometimes a separate library or framework tool) decides what to do
with that metadata; the annotated code has no say in it and, at
runtime, behaves identically whether the annotation is present or not.

Also recognized in: decorators in Python (`@property`, `@staticmethod`)
— visually near-identical syntax, but a real, consequential semantic
difference: a Python decorator is executable code that runs and can
transform the decorated function, where a Java annotation is inert by
default unless some tool specifically chooses to read it. Attributes in
C# (`[Obsolete]`) are the closer structural equivalent.

### SE Lens

The alternative — a comment (`// deprecated, don't use this`) — was
not chosen for cases where a *tool* needs to act on the information, not
just a human reader. A comment is invisible to the compiler;
`@Deprecated` is not — it's why the warning above appeared
automatically, with no human needing to notice and act on a comment at
all.

---

## Connect the Pieces

`@Deprecated` demonstrated the general shape: an annotation is metadata
a tool reads, never code that executes on its own. The next lesson
(`@Override` Compiler Checking) shows the same mechanism aimed at one
specific, real, hard-error-producing case.

## What Breaks Without This

Remove `@Deprecated` from `OldLogger`. Compile it yourself and compare
the output — the warning disappears entirely, since nothing tells the
compiler to flag this class at all. Nothing else about the program
changes at runtime either way — real proof the annotation is purely
informational here.

## Exercises

1. Add `@Deprecated` above a single method instead of a whole class,
   and confirm calling that method also produces a compiler warning.
2. Remove `@Deprecated` and confirm the compiler warning disappears.
3. Explain, in your own words, why an annotation is "read," not
   "executed."

## Definition of Done

- [ ] You ran the `@Deprecated` example and saw the real compiler
      warning.
- [ ] You completed Exercise 2 and confirmed the warning disappears
      without the annotation.
- [ ] You can state, without looking back at this lesson, why an
      annotation never changes a program's runtime behavior by itself.
