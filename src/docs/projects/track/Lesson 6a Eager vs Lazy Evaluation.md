# Lesson 6a: Eager vs. Lazy Evaluation

**What you will build:** A small, fully runnable, plain Java lab — the
first of several building up to Android's real RecyclerView subsystem.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Eager vs. lazy evaluation** — doing all the work upfront regardless
  of whether it's needed (eager) versus doing only the work a specific
  moment actually requires (lazy/on-demand).

---

## Concept Unit: Eager vs. Lazy Evaluation

### The Problem

A list of a thousand items, displayed on a screen tall enough to show
only ten at a time, doesn't need all thousand corresponding visual
rows constructed at once — building every row upfront wastes real work
on rows that will never actually be seen.

### Introduce the Concept in Isolation

```
mkdir lesson-6a
cd lesson-6a
```

Create `Main.java`:

```java
public class Main {
    static String buildExpensiveRow(int index) {
        System.out.println("Building row " + index + "...");
        return "Row " + index;
    }

    public static void main(String[] args) {
        System.out.println("Eager: building all 5 rows upfront.");
        for (int i = 0; i < 5; i++) {
            buildExpensiveRow(i);
        }

        System.out.println("Lazy: building only the 2 rows actually needed.");
        String visibleRow1 = buildExpensiveRow(0);
        String visibleRow2 = buildExpensiveRow(1);
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
Eager: building all 5 rows upfront.
Building row 0...
Building row 1...
Building row 2...
Building row 3...
Building row 4...
Lazy: building only the 2 rows actually needed.
Building row 0...
Building row 1...
```

#### Execution Trace

The `for` loop runs a fixed number of times regardless of need, which
is exactly the eager behavior being demonstrated:

1. `i = 0`, `i < 5` is `true`, so `buildExpensiveRow(0)` runs,
   unconditionally — nothing checked whether row 0 would ever actually
   be displayed.
2. `i = 1`, `i < 5` is still `true`, so `buildExpensiveRow(1)` runs the
   same way, `i` having been incremented from `0` to `1` by the loop's
   own increment step.
3. This repeats identically for `i = 2`, `3`, and `4` — five total
   calls, because the loop's own condition, `i < 5`, is the only thing
   deciding how many times it runs, with no connection at all to how
   many rows a real screen could ever display.
4. `i` becomes `5`; `i < 5` is now `false`, so the loop stops. All
   five calls already happened, unconditionally, before this point —
   the defining trait of eager evaluation.

The eager section calls `buildExpensiveRow` five times, regardless of
need; the lazy section calls it only twice, exactly matching what's
actually used. This is `eager vs. lazy evaluation` — **first
appearance**: doing all the work upfront regardless of whether it's
needed (eager) versus doing only the work a specific moment actually
requires (lazy/on-demand).

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `for (int i = 0; i < 5; i++) { buildExpensiveRow(i); }` — **(a)
   first appearance** of eager evaluation examined explicitly: every
   possible row is built immediately, whether or not it will ever be
   needed.
2. `String visibleRow1 = buildExpensiveRow(0); String visibleRow2 =
   buildExpensiveRow(1);` — **(a) first appearance** of lazy
   evaluation: only the specific rows actually required are built, and
   only at the moment they're required.

### CS Lens

Eager evaluation trades wasted work for simplicity; lazy evaluation
trades a small amount of extra bookkeeping (tracking what's actually
needed) for avoiding unnecessary work entirely. This is exactly what's
wasteful about looping and constructing every row's View upfront
instead of only the ones currently visible on screen.

Also recognized in: lazy sequences in many functional languages,
`yield`-based generators in Python, database query result streaming
(rows fetched only as they're actually consumed, not all loaded into
memory upfront).

### SE Lens

The alternative — always eager, for simplicity — was not chosen for
genuinely large or expensive-to-construct collections, because the
wasted work compounds with size: a thousand-row list built eagerly
does a thousand times the necessary work if only ten rows are ever
visible at once.

---

## Connect the Pieces

Building all five rows upfront wastes work on rows nothing ever
displays. The next lesson (Cache an Expensive Lookup on First Use)
shows what happens when even a lazily-built row's own internal work is
repeated unnecessarily.

## What Breaks Without This

Building every row of a genuinely large list eagerly, upfront, wastes
real, measurable work — and the cost compounds directly with list
size, unlike lazy evaluation, which only ever does as much work as is
actually visible.

## Exercises

1. Change the eager loop to build 100 rows instead of 5, and observe
   how much more output appears, compared to the lazy section's
   unchanged 2 lines.
2. Explain, in your own words, why lazy evaluation trades simplicity
   for saved work.
3. Name, from memory, one place outside this lesson where doing work
   "only when needed" would save real effort.

## Definition of Done

- [ ] You ran the example and saw the real, contrasting output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, the
      difference between eager and lazy evaluation.
