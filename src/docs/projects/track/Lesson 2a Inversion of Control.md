# Lesson 2a: Inversion of Control — The Framework Calls You

**What you will build:** A small, fully runnable, hand-rolled "fake
framework" in plain Java — no Android involved yet — to isolate this
idea before meeting its real Android form.

**What you need to know first:** Lesson 0l's inheritance, Lesson 0m's
method overriding, Lesson 0n's dynamic dispatch.

**Terms introduced in this lesson:**

- **Inversion of control** — a framework, not your own code, decides
  when your code runs — it calls into your code at specific points,
  rather than your code calling it.

---

## Concept Unit: Inversion of Control — The Framework Calls You

### The Problem

Every program written so far has had one shape: `main` runs, top to
bottom, calling whatever methods it needs, in an order this program's
own code fully controls. Some systems work the opposite way — a
separate piece of software decides when your code runs, calling into it
at specific moments it chooses, rather than your code ever calling out
to request that. This reversal — who calls whom — needs its own name
before Android, which works exactly this way, makes any sense.

### Introduce the Concept in Isolation

```
mkdir lesson-2a
cd lesson-2a
```

Create `Main.java`:

```java
abstract class MiniFramework {
    void run() {
        System.out.println("Framework starting up...");
        onStart();
        System.out.println("Framework shutting down...");
    }

    abstract void onStart();
}

class MyProgram extends MiniFramework {
    void onStart() {
        System.out.println("My code is running now.");
    }
}

public class Main {
    public static void main(String[] args) {
        MyProgram program = new MyProgram();
        program.run();
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
Framework starting up...
My code is running now.
Framework shutting down...
```

`main` calls `program.run()` exactly once — everything after that is
`MiniFramework`'s own code deciding when `onStart()` gets called, not
`MyProgram`'s own code requesting it. This is `inversion of control` —
**first appearance**: a framework, not your own code, decides when your
code runs — it calls into your code at specific points, rather than
your code calling it. `MyProgram` never calls `onStart()` itself
anywhere — `MiniFramework.run()` does, at the specific moment
`MiniFramework` chooses.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `abstract class MiniFramework { ... }` — **(a) first appearance** of
   `abstract` on a class: a class that cannot be instantiated directly
   with `new` (trying `new MiniFramework()` would fail to compile) and
   may declare methods with no body at all, left for a subclass to
   supply.
2. `abstract void onStart();` — **(a) first appearance** of an abstract
   method: a declaration with no body, ending in `;` like an interface
   method (Lesson 0q), but inside a class rather than an interface. Any
   concrete (non-abstract) subclass of `MiniFramework` must supply a
   real body for it.
3. `void run() { ... }` — an ordinary, fully-implemented method. Its
   body calls `onStart()` — a call to a method `MiniFramework` itself
   never implements, resolved at runtime against whatever concrete
   subclass actually exists, the same dynamic dispatch mechanism from
   Lesson 0n.
4. `class MyProgram extends MiniFramework { void onStart() { ... } }` —
   **(b) reappearing** inheritance and method overriding: `MyProgram`
   supplies the one piece `MiniFramework` left unfinished.
5. `program.run();` — the only call `main` makes. `onStart()` is never
   called directly by `Main` or by `MyProgram` — only indirectly,
   through `run()`, at the exact point `MiniFramework`'s own code
   decides.

### CS Lens

Inversion of control flips the usual direction of calling: instead of
application code calling into a library (`Integer.parseInt(...)`,
Lesson 0y), a framework calls into application code. The framework owns
`main`-like control of the overall sequence; the application only ever
supplies pieces the framework calls at its own chosen moments.

Also recognized in: every GUI toolkit's event loop, every web
framework's request-handling pipeline, dependency-injection containers
generally (which construct and wire up application objects rather than
the application constructing itself) — a very widely recurring shape
once named.

### SE Lens

The alternative — application code calling the framework directly,
`main` itself deciding exactly when startup, rendering, and shutdown
happen — was not chosen by frameworks like this one because the
framework often has real requirements about ordering and timing
(permissions checked first, resources released last) that the framework
itself is better positioned to guarantee than every individual
application. Giving up control is the real cost: `MyProgram` cannot
decide to skip `run()`'s shutdown message, or call `onStart()` twice —
`MiniFramework` owns that sequence entirely now.

---

## Connect the Pieces

`main` calls `program.run()` exactly once; everything after that is
`MiniFramework`'s own decision, not `MyProgram`'s. The next lesson
(Callback) shows one specific, concrete shape this same reversal takes.

## What Breaks Without This

Try calling `onStart()` directly from `main`, bypassing `run()`
entirely. It compiles and runs — but skips `run()`'s own surrounding
`"Framework starting up..."`/`"Framework shutting down..."` messages
entirely, proving those messages were never `MyProgram`'s own
responsibility to print — they belong to whichever code actually owns
the calling sequence.

## Exercises

1. Add a second method, `onFinish()`, called by `run()` right before
   the shutdown message, and override it in `MyProgram`.
2. Try instantiating `MiniFramework` directly with
   `new MiniFramework();` and read the real compiler error.
3. Explain, in your own words, why `MyProgram` never calls
   `onStart()` itself anywhere in its own code.

## Definition of Done

- [ ] You ran the example and saw all three real output lines, in
      order.
- [ ] You completed Exercise 2 and saw the real compiler error for
      instantiating an abstract class.
- [ ] You can state, without looking back at this lesson, who actually
      decides when `onStart()` runs.
