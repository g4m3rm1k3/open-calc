# Lesson 6c: View Recycling

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 3a's view tree, Lesson 6a's
eager vs. lazy evaluation.

**Terms introduced in this lesson:**

- **View recycling** — keeping only a small, roughly-screen-sized pool
  of row View objects alive and reusing them as the user scrolls,
  refilling each recycled view with new data instead of constructing a
  fresh view per data item.

---

## Concept Unit: View Recycling

### The Problem

A list long enough to require scrolling, if every row's View were kept
alive simultaneously, would construct far more View objects than are
ever visible on screen at once — genuinely wasteful, the same problem
Lesson 6a already named in the abstract.

### Introduce the Concept in Isolation

```
mkdir lesson-6c
cd lesson-6c
```

Create `Main.java`:

```java
import java.util.ArrayList;
import java.util.List;

class RowPool {
    private List<String> pool = new ArrayList<>();
    private int poolSize = 3;

    String obtainRow() {
        if (pool.size() < poolSize) {
            String newRow = "NewRow#" + pool.size();
            pool.add(newRow);
            System.out.println("Constructed: " + newRow);
            return newRow;
        }
        String recycled = pool.remove(0);
        System.out.println("Recycled: " + recycled);
        pool.add(recycled);
        return recycled;
    }
}

public class Main {
    public static void main(String[] args) {
        RowPool pool = new RowPool();
        for (int i = 0; i < 6; i++) {
            pool.obtainRow();
        }
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
Constructed: NewRow#0
Constructed: NewRow#1
Constructed: NewRow#2
Recycled: NewRow#0
Recycled: NewRow#1
Recycled: NewRow#2
```

#### Execution Trace

The loop calls `obtainRow()` six times; which branch runs each time
depends on how full the pool already is:

1. `i = 0`: `pool.size()` is `0`, `poolSize` is `3`, so `0 < 3` is
   `true` — a genuinely new row, `NewRow#0`, is constructed and added
   to the pool.
2. `i = 1`: `pool.size()` is now `1`, `1 < 3` is still `true` — a
   second new row, `NewRow#1`, is constructed the same way.
3. `i = 2`: `pool.size()` is `2`, `2 < 3` is still `true` — a third
   new row, `NewRow#2`, is constructed; the pool has now reached its
   target size of `3`.
4. `i = 3`: `pool.size()` is `3`, `3 < 3` is `false` — the pool is
   full, so this call falls through to the recycling branch instead:
   the oldest row, `NewRow#0`, is removed from the front and
   immediately re-added at the back, simulating reuse rather than
   construction.
5. `i = 4` and `i = 5` repeat the identical recycling branch, in
   order, recycling `NewRow#1` and then `NewRow#2` — each time because
   `pool.size()` never drops below `poolSize` once the pool is full,
   so the condition `pool.size() < poolSize` stays `false` for every
   remaining call.

Only 3 rows are ever actually constructed, even across 6 total
requests — the pool reuses existing rows instead of constructing new
ones once `poolSize` is reached. This is `view recycling` — **first
appearance**: keeping only a small, roughly-screen-sized pool of row
View objects alive and reusing them as the user scrolls, refilling
each recycled view with new data instead of constructing a fresh view
per data item.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `if (pool.size() < poolSize) { ... }` — constructs a genuinely new
   row only while the pool hasn't yet reached its target size.
2. `String recycled = pool.remove(0); ... pool.add(recycled);` — **(a)
   first appearance** of recycling: takes an already-constructed row
   out of the pool and puts it back, simulating reuse rather than
   construction.

### CS Lens

View recycling is Lesson 6a's own eager/lazy distinction, applied with
a twist: rather than purely lazy (constructing exactly what's needed,
new, every time), a bounded pool is built once, lazily up to its
target size, and then *reused* indefinitely — the actual fix for the
wasteful "construct every row upfront" approach.

Also recognized in: connection pools and thread pools generally (a
later lesson's own Object Pool Pattern names this same idea directly),
any system reusing a bounded set of expensive-to-construct resources
rather than constructing and discarding them repeatedly.

### SE Lens

The alternative — constructing and discarding a fresh row for every
single scroll position — was not chosen because it wastes real,
measurable construction cost on rows that will be visible only
briefly; reusing a small, bounded pool means construction cost is paid
once, for roughly as many rows as can fit on screen, never again.

---

## Connect the Pieces

Lesson 6b cached one expensive lookup's result. This lesson applies
the same underlying idea to entire View objects: a small, bounded pool
is built once and reused indefinitely, rather than constructing a
fresh row per data item.

## What Breaks Without This

Constructing a fresh row View for every single scroll position, never
reusing existing ones, wastes real construction cost that compounds
directly with how far a user scrolls — a real, measurable performance
cost view recycling exists specifically to eliminate.

## Exercises

1. Change `poolSize` to `5` and confirm five rows are constructed
   before recycling begins.
2. Add a `print` statement showing the pool's current contents after
   each `obtainRow()` call.
3. Explain, in your own words, why the pool never grows past
   `poolSize`, no matter how many times `obtainRow()` is called.

## Definition of Done

- [ ] You ran the example and saw exactly three real "Constructed:"
      lines followed by three "Recycled:" lines.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a pool
      of View objects is kept small rather than growing to match the
      full list size.
