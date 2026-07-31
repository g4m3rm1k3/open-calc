# Lesson 08: Annotations and Override Checking

**What you will build:** A disposable lab, same pattern as Lessons 01–07.
Today's case study: metadata attached to code that the compiler itself
reads and acts on — and the specific, real bug class one particular
annotation exists to catch, already used without full explanation back in
Lesson 05.

**What you need to know first:** Lesson 01's `class`, Lesson 05's `method
overriding`.

**Terms introduced in this lesson:**

- **Annotation** — metadata attached to a class, method, or field, read
  by a compiler, IDE, or library tool — not executed as part of the
  program's own normal flow.
- **`@Override` compiler checking** — a specific, hardcoded compiler
  check triggered by the `@Override` annotation — verifying a method
  genuinely overrides something in its parent, turning a typo'd method
  name into a compile error instead of a silent, unrelated new method.

---

## Concept Unit: Annotations — Metadata the Compiler Actually Reads

### The Problem

Lesson 05 used `@Override` above a method without stopping to name what
that `@`-prefixed word actually was, beyond "the compiler checks this."
That shape — a word starting with `@`, sitting above a class, method, or
field — recurs constantly in Java code, in this curriculum and beyond
(`@NonNull`, `@Entity`, `@Test`), and without a name for the general
category, each new one looks like an unrelated, unexplained decoration
rather than an instance of one consistent mechanism.

### Introduce the Concept in Isolation

```
mkdir lesson-08
cd lesson-08
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

`@Deprecated` is an `annotation` — **first appearance**: metadata attached
to a class, method, or field, read by a compiler, IDE, or library tool —
not executed as part of the program's own normal flow. `@Deprecated`
itself does nothing at runtime — the program compiles and runs exactly as
it would without it — but the compiler reads it and prints a warning
anywhere `OldLogger` gets used, flagging that this class is marked as
something callers shouldn't rely on going forward.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `@Deprecated`, written directly above `class OldLogger` — **(a) first
   appearance.** Attaches metadata to the class declaration itself. No
   parentheses, no arguments — this particular annotation carries no
   extra information beyond its own presence.
2. `class OldLogger { ... }` — an ordinary class otherwise, **(c)**
   reused shape.
3. `new OldLogger()` and `logger.log(...)` — **(c)** reused
   object-creation and method-call syntax. Nothing about runtime behavior
   changed because of `@Deprecated` — the warning is entirely a
   compile-time, informational thing, never affecting what the program
   actually does when it runs.

### CS Lens

An annotation is data *about* code, not code itself — it never executes
as part of the program's control flow the way a method body does.
Whatever reads an annotation (the compiler here; sometimes an IDE,
sometimes a separate library or framework tool) decides what to do with
that metadata; the annotated code has no say in it and, at runtime,
behaves identically whether the annotation is present or not.

Also recognized in: decorators in Python (`@property`, `@staticmethod`) —
visually near-identical syntax, but a real, consequential semantic
difference: a Python decorator is executable code that runs and can
transform the decorated function, where a Java annotation is inert by
default unless some tool specifically chooses to read it. Attributes in
C# (`[Obsolete]`) are the closer structural equivalent — same
inert-unless-read behavior as Java's own.

### SE Lens

The alternative — a comment (`// deprecated, don't use this`) — was not
chosen for cases where a *tool* needs to act on the information, not just
a human reader. A comment is invisible to the compiler; `@Deprecated` is
not — it's why the warning above appeared automatically, with no human
needing to notice and act on a comment at all. This is the general reason
annotations exist: turning information that matters into something a
tool can actually check or act on, instead of something only a careful
human reader might catch.

---

## Concept Unit: `@Override` Compiler Checking — Turning a Typo Into an Error

### The Problem

Lesson 05 used `@Override` above every overriding method, without
demonstrating the specific failure it exists to catch. That failure is
concrete and easy to actually hit: a method meant to override a parent's
method, but whose name is misspelled, compiles perfectly fine on its own
— Java has no way to know an unrelated new method wasn't intended on
purpose — and simply never gets called by anything, silently.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Animal {
    void makeSound() {
        System.out.println("Generic animal sound.");
    }
}

class Dog extends Animal {
    void makeSond() {
        System.out.println("Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal myAnimal = new Dog();
        myAnimal.makeSound();
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
Generic animal sound.
```

`Dog`'s `makeSond()` — misspelled, missing the final `u` — was clearly
meant to override `Animal.makeSound()`, but doesn't, because Java matches
method names exactly. The program compiles without any error at all:
`makeSond()` is legal as a brand-new, unrelated method that nothing ever
calls, and `myAnimal.makeSound()` runs `Animal`'s original, unreplaced
version instead of `Dog`'s intended bark. This is exactly the failure
`override-checking` — **first appearance** — exists to catch: a specific,
hardcoded compiler check triggered by the `@Override` annotation —
verifying a method genuinely overrides something in its parent, turning a
typo'd method name into a compile error instead of a silent, unrelated
new method.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `void makeSond() { ... }` inside `Dog` — compiles as a perfectly
   ordinary, valid new method. Nothing about Java's own rules objects to
   a class having a method that happens to almost, but not quite, match a
   parent's method name.
2. `myAnimal.makeSound();` — calls `Animal`'s original method, via
   dynamic dispatch (Lesson 05), because `Dog` never actually overrode
   it — `Dog`'s real, if misspelled, method is a completely different,
   unrelated one that this call never touches.

Now add `@Override` above the typo'd method and try to compile again:

```java
class Dog extends Animal {
    @Override
    void makeSond() {
        System.out.println("Woof!");
    }
}
```

```
javac Main.java
```

Trying to compile this now produces a real compiler error:

```
error: method does not override or implement a method from a supertype
    @Override
    ^
```

`@Override` asserted a claim — "this method overrides something in the
parent" — that the compiler could now actually check, and found false:
no method named exactly `makeSond` exists in `Animal` to override. The
exact same typo that compiled silently a moment ago now fails loudly, at
compile time, before the program ever runs.

### CS Lens

`@Override` is one of the very few Java annotations the compiler itself
enforces, rather than merely tolerating as inert metadata some other tool
might read later. Most annotations (like `@Deprecated`, from the previous
unit) only ever produce warnings or are read by external tools; `@Override`
is hardcoded directly into the compiler's own checking, turning a specific
category of naming mistake into a hard compile error.

Also recognized in: `override` as a required keyword in C# (not optional
metadata the way Java's `@Override` is — C#'s compiler enforces this
category of correctness by making the keyword mandatory in the first
place, so this exact failure mode can't occur there the same way it can
in Java without the optional annotation).

### SE Lens

The alternative — never using `@Override`, relying on careful reading to
catch a mismatched method name — was not chosen going forward because the
previous unit's example is exactly how this bug actually hides: the
program compiles, runs, and produces *some* output, just not the output
anyone intended, with nothing pointing at the actual mistake. `@Override`
costs one line per overriding method and converts an entire category of
silent, hard-to-notice bug into a compile-time error with a message
pointing at the exact problem. This is why every overriding method in
this curriculum, from Lesson 05 onward, has carried `@Override` — not
decoration, a real, load-bearing safety check.

---

## Connect the Pieces

`@Deprecated` demonstrated the general shape: an annotation is metadata a
tool reads, never code that executes on its own. `@Override` is the same
mechanism, aimed at one specific, real bug: a method meant to override a
parent's but misspelled compiles silently as an unrelated dead method
without it, and fails loudly, at the exact point of the mistake, with it.
Every `@Override` written since Lesson 05 has been doing exactly this
job the whole time.

## What Breaks Without This

This lesson's own second unit already showed the concrete failure
directly: `makeSond()`, without `@Override`, compiles and runs, silently
producing "Generic animal sound." instead of "Woof!" — no error, no
warning, nothing pointing at the mistake at all. That silent wrong
behavior *is* the failure mode `@Override` exists to convert into a loud,
specific compile-time error.

## Exercises

1. Fix the typo (`makeSond` → `makeSound`) with `@Override` still present,
   and confirm the program now both compiles and correctly prints "Woof!"
2. Add `@Deprecated` above a method (not a whole class this time) and
   confirm calling that method also produces the same kind of compiler
   warning as calling a deprecated class did.
3. Deliberately reintroduce the typo one more time, with `@Override`
   present, and read the exact compiler error yourself before fixing it
   again — connecting the error message directly to the missing method
   name it's complaining about.

## Definition of Done

- [ ] You ran the `@Deprecated` example and saw the real compiler
      warning.
- [ ] You ran the misspelled `makeSond()` example *without* `@Override`
      and saw it silently produce the wrong output.
- [ ] You added `@Override` to the same misspelled method and saw the
      real "does not override or implement" compiler error.
- [ ] You fixed the typo and confirmed the program then compiled and
      produced the correct output.
- [ ] You can state, without looking back at this lesson, why
      `@Deprecated` only ever produces a warning while `@Override` can
      produce a hard error.
