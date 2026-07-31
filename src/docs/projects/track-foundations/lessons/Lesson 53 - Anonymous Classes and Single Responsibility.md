# Lesson 53: Anonymous Classes and the Single Responsibility Principle

**What you will build:** Two small, fully runnable, plain Java labs.

**What you need to know first:** Lesson 06's interfaces and contracts.

**Terms introduced in this lesson:**

- **Anonymous class** — an unnamed class defined and instantiated in a
  single expression, implementing an interface or extending a class
  inline — used when a lambda can't apply.
- **Single Responsibility Principle** — a class should have one
  clearly-scoped job — one reason to change — rather than accumulating
  unrelated responsibilities.

---

## Concept Unit: Anonymous Class

### The Problem

Lesson 06 already established that a functional interface (exactly one
abstract method) can be implemented concisely with a lambda. An interface
with *two* abstract methods, though, has no single method a lambda could
target — a lambda's own shorthand syntax genuinely cannot supply an
implementation for more than one method at once.

### Introduce the Concept in Isolation

```
mkdir lesson-53a
cd lesson-53a
```

Create `Main.java`:

```java
public class Main {
    interface Converter {
        String toText(int value);
        int fromText(String text);
    }

    public static void main(String[] args) {
        Converter converter = new Converter() {
            @Override
            public String toText(int value) {
                return "#" + value;
            }

            @Override
            public int fromText(String text) {
                return Integer.parseInt(text.replace("#", ""));
            }
        };

        System.out.println(converter.toText(42));
        System.out.println(converter.fromText("#42"));
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
#42
42
```

`Converter` declares two abstract methods, `toText` and `fromText` — no
lambda could target either one alone, since a lambda's shorthand only
ever supplies exactly one method. This is an `anonymous class` — **first
appearance**: an unnamed class defined and instantiated in a single
expression, implementing an interface or extending a class inline — used
when a lambda can't apply. `new Converter() { ... }` defines a whole,
unnamed class implementing both of `Converter`'s methods, and
instantiates it, all in one expression — no separate, named class file
was ever written.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface Converter { String toText(int value); int fromText(String
   text); }` — **(b) reappearing** interface contract from Lesson 06, now
   with two abstract methods rather than one, ruling out a lambda.
2. `new Converter() { @Override public String toText(...) { ... }
   @Override public int fromText(...) { ... } };` — **(a) first
   appearance**: the anonymous class itself — no name, defined and
   instantiated in this one expression, implementing both required
   methods.
3. `converter.toText(42)` / `converter.fromText("#42")` — both methods
   called normally, through the `Converter` interface reference, proving
   the anonymous class genuinely satisfies the full two-method contract.

### CS Lens

An anonymous class is still a real class, compiled to its own `.class`
file (named mechanically, like `Main$1.class`) — the "anonymous" part is
purely about *source-level* naming; the compiler still needs, and
generates, a real name internally. This is the same underlying mechanism
a lambda itself compiles down to in modern Java — a lambda is closer to
sugar over this same anonymous-class shape than a genuinely different
mechanism.

Also recognized in: anonymous inner classes in any JVM language
supporting them, anonymous functions/closures in JavaScript (a related
but not identical idea — JavaScript's are typically single-function, not
multi-method).

### SE Lens

The alternative — writing a separate, fully-named class implementing
`Converter`, in its own file, purely to use it once, right here — was not
chosen because it adds a permanent, separately-named class to the
codebase for a single, local use; an anonymous class keeps the
implementation exactly where it's used, with no separate file needed for
something never reused elsewhere.

---

## Concept Unit: Single Responsibility Principle

### The Problem

A class handling two unrelated jobs at once — say, both rendering data
*and* deciding what happens when the user taps it — has two entirely
separate reasons to change: a rendering bug fix and a navigation change
both touch the same class, for reasons that have nothing to do with each
other.

### Introduce the Concept in Isolation

```
mkdir lesson-53b
cd lesson-53b
```

Create `Main.java`:

```java
public class Main {
    // Violates the principle: one class, two unrelated jobs.
    static class BadRow {
        String name;
        BadRow(String name) { this.name = name; }

        String render() {
            return "Row: " + name;
        }

        void onTapped() {
            System.out.println("Navigating to detail screen for " + name + "...");
        }
    }

    interface TapListener {
        void onTapped(String name);
    }

    // Follows the principle: rendering and reacting to a tap are separated.
    static class GoodRow {
        String name;
        GoodRow(String name) { this.name = name; }

        String render() {
            return "Row: " + name;
        }
    }

    public static void main(String[] args) {
        GoodRow row = new GoodRow("Wrench");
        TapListener listener = tappedName -> System.out.println("Navigating to detail screen for " + tappedName + "...");

        System.out.println(row.render());
        listener.onTapped(row.name);
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
Row: Wrench
Navigating to detail screen for Wrench...
```

`BadRow` bundles rendering (`render()`) and navigation
(`onTapped()`) into one class — a rendering bug fix and a navigation
change both edit `BadRow`, for unrelated reasons. This is the `Single
Responsibility Principle` — **first appearance**: a class should have one
clearly-scoped job — one reason to change — rather than accumulating
unrelated responsibilities. `GoodRow` keeps only rendering; `TapListener`
(Lesson 06's own interface contract) carries the separate, unrelated
job of reacting to a tap — each with exactly one reason to ever change.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class BadRow { ... render() { ... } ... onTapped() { ... } }` — **(a)
   first appearance**, shown as a counter-example: two unrelated jobs
   bundled into one class.
2. `class GoodRow { ... render() { ... } }` — rendering only, one job, one
   reason to change.
3. `interface TapListener { void onTapped(String name); }` — **(b)
   reappearing** functional interface from Lesson 06, carrying the
   separate, unrelated "react to a tap" job instead.
4. `TapListener listener = tappedName -> ...;` — **(b) reappearing**
   lambda from Lesson 06, supplying `TapListener`'s single method —
   contrasted directly against this same lesson's own anonymous-class
   example, since `TapListener` has only one abstract method.

### CS Lens

This is `track/`'s own real design decision behind `InventoryAdapter`
reporting taps through a listener interface instead of calling
`startActivity` itself: bundling navigation logic directly into a
data-binding/rendering class would give that class a second, unrelated
reason to change, exactly matching this lesson's own `BadRow`
counter-example.

Also recognized in: the "S" in the SOLID principles across
object-oriented design broadly, any code-review heuristic asking "what
would make this class need to change, and is that one thing or several?"

### SE Lens

The alternative — one class handling both rendering and navigation, as
`BadRow` does — was not chosen because it couples two unrelated concerns:
changing how a row navigates now risks breaking how it renders, and vice
versa, purely because they happen to live in the same class rather than
because they're actually related.

---

## Connect the Pieces

`Converter`'s anonymous class demonstrated implementing a multi-method
interface inline, without a separately-named class file. `GoodRow`/
`TapListener` demonstrated *why* separating jobs into distinct
interfaces/classes matters in the first place — the Single Responsibility
Principle. The two connect directly: an anonymous class is exactly the
lightweight mechanism that lets a listener interface's implementation live
right where it's used, without forcing a permanent, separately-named class
onto the codebase just to keep responsibilities properly separated.

## What Breaks Without This

Attempting to supply `Converter`'s two-method interface with a lambda
fails to compile at all — a lambda can only ever target a functional
interface, and `Converter` isn't one. And bundling rendering and
navigation into one class, as `BadRow` does, means a navigation-only
change risks introducing a rendering bug purely by editing a class that
never needed to change for that reason — track/'s real
`InventoryAdapter` avoids exactly this by keeping the two responsibilities
in separate types.

## Exercises

1. Explain, in your own words, why `new Converter() { ... }` compiles but
   `Converter converter = value -> "#" + value;` does not.
2. Add a `LongTapListener` interface with its own `onLongTapped(String
   name)` method, and explain why it should be a separate interface
   rather than a second method added to `TapListener`.
3. Explain, in your own words, how the Single Responsibility Principle
   connects to Lesson 31's own delegation/layering material, if you've
   completed that lesson.

## Definition of Done

- [ ] You ran the `Converter` anonymous-class example and can explain why
      a lambda couldn't replace it.
- [ ] You ran the `GoodRow`/`TapListener` example and can explain what job
      each type has.
- [ ] You can state, without looking back at this lesson, why bundling
      rendering and navigation into one class creates two unrelated
      reasons for that class to change.
