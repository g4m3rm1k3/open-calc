# Lesson 8d: Single Responsibility Principle

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0q's interfaces, Lesson 0t's
lambda expression.

**Terms introduced in this lesson:**

- **Single Responsibility Principle** — a class should have one
  clearly-scoped job — one reason to change — rather than accumulating
  unrelated responsibilities.

---

## Concept Unit: Single Responsibility Principle

### The Problem

A class handling two unrelated jobs at once — say, both rendering
data *and* deciding what happens when the user taps it — has two
entirely separate reasons to change: a rendering bug fix and a
navigation change both touch the same class, for reasons that have
nothing to do with each other.

### Introduce the Concept in Isolation

```
mkdir lesson-8d
cd lesson-8d
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
Responsibility Principle` — **first appearance**: a class should have
one clearly-scoped job — one reason to change — rather than
accumulating unrelated responsibilities. `GoodRow` keeps only
rendering; `TapListener` (Lesson 0q's own interface contract) carries
the separate, unrelated job of reacting to a tap — each with exactly
one reason to ever change.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `class BadRow { ... render() { ... } ... onTapped() { ... } }` —
   **(a) first appearance**, shown as a counter-example: two unrelated
   jobs bundled into one class.
2. `class GoodRow { ... render() { ... } }` — rendering only, one job,
   one reason to change.
3. `interface TapListener { void onTapped(String name); }` — **(b)
   reappearing** functional interface from Lesson 0q, carrying the
   separate, unrelated "react to a tap" job instead.
4. `TapListener listener = tappedName -> ...;` — **(b) reappearing**
   lambda from Lesson 0t, supplying `TapListener`'s single method —
   contrasted directly against Lesson 8a's own anonymous-class
   example, since `TapListener` has only one abstract method.

### CS Lens

This is `track/`'s own real design decision behind `InventoryAdapter`
reporting taps through a listener interface instead of calling
`startActivity` itself: bundling navigation logic directly into a
data-binding/rendering class would give that class a second,
unrelated reason to change, exactly matching this lesson's own
`BadRow` counter-example.

Also recognized in: the "S" in the SOLID principles across
object-oriented design broadly, any code-review heuristic asking
"what would make this class need to change, and is that one thing or
several?"

### SE Lens

The alternative — one class handling both rendering and navigation,
as `BadRow` does — was not chosen because it couples two unrelated
concerns: changing how a row navigates now risks breaking how it
renders, and vice versa, purely because they happen to live in the
same class rather than because they're actually related.

---

## Connect the Pieces

Lesson 8a's anonymous class and Lesson 8c's `Parcelable` both showed
mechanisms for keeping code exactly where it's needed. This lesson
names the design principle motivating a related discipline: keeping
each class scoped to exactly one job, so a change for one reason never
risks breaking something unrelated.

## What Breaks Without This

Bundling rendering and navigation into one class, as `BadRow` does,
means a navigation-only change risks introducing a rendering bug
purely by editing a class that never needed to change for that reason
— `track/`'s real `InventoryAdapter` avoids exactly this by keeping
the two responsibilities in separate types.

## Exercises

1. Add a `LongTapListener` interface with its own `onLongTapped(String
   name)` method, and explain why it should be a separate interface
   rather than a second method added to `TapListener`.
2. Add a third, unrelated job to `BadRow` (a `save()` method, say) and
   explain, in your own words, why this makes the class even harder
   to maintain.
3. Explain, in your own words, how the Single Responsibility Principle
   connects to keeping a class's own public surface small and focused.

## Definition of Done

- [ ] You ran the `GoodRow`/`TapListener` example and can explain
      what job each type has.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      bundling rendering and navigation into one class creates two
      unrelated reasons for that class to change.
