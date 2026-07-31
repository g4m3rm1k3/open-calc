# Lesson 21b: Projection Over a Dataset

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 21a's command dispatch table.

**Terms introduced in this lesson:**

- **Projection over a dataset** — filtering or transforming a full
  in-memory collection down to a computed subset for display, without
  touching or mutating the underlying data source.

---

## Concept Unit: Projection Over a Dataset

### The Problem

Showing a filtered or computed *view* of a full dataset — search results,
a sorted subset — should not require changing the underlying data itself;
the full dataset needs to remain intact and available, with the filtered
view computed fresh, on demand, from it.

### Introduce the Concept in Isolation

```
mkdir lesson-21b
cd lesson-21b
```

Create `Main.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<String> filterByPrefix(List<String> fullList, String prefix) {
        List<String> result = new ArrayList<>();
        for (String item : fullList) {
            if (item.startsWith(prefix)) {
                result.add(item);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        List<String> allItems = new ArrayList<>();
        allItems.add("Widget");
        allItems.add("Wrench");
        allItems.add("Bolt");

        List<String> filtered = filterByPrefix(allItems, "W");

        System.out.println("Full list: " + allItems);
        System.out.println("Filtered: " + filtered);
    }
}
```

Compile and run it. Here is the real output:

```
Full list: [Widget, Wrench, Bolt]
Filtered: [Widget, Wrench]
```

#### Execution Trace

`filterByPrefix` loops over `fullList` once, deciding per element
whether it belongs in the new result:

1. `item = "Widget"` — `item.startsWith("W")` is `true`, because
   `"Widget"` genuinely begins with the character `"W"`, so
   `result.add(item)` runs, and `result` becomes `[Widget]`.
2. `item = "Wrench"` — `startsWith("W")` is `true` again, for the same
   reason, so `result` grows to `[Widget, Wrench]`.
3. `item = "Bolt"` — `startsWith("W")` is `false`, because `"Bolt"`
   begins with `"B"`, not `"W"`, so `result.add(item)` never runs on
   this iteration, and `result` stays `[Widget, Wrench]`, unchanged.

`fullList` itself is never written to at any point in this loop — only
read from — which is exactly what keeps the original data intact after
filtering.

`allItems`, the underlying data, is unchanged after filtering — `filtered`
is a genuinely separate, new `List`, computed from it. This is a
`projection over a dataset` — **first appearance**: filtering or
transforming a full in-memory collection down to a computed subset for
display, without touching or mutating the underlying data source.
`allItems` still holds all three items; `filtered` is a display-only view
computed on demand.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `List<String> filterByPrefix(List<String> fullList, String prefix) {
   ... }` — **(b) reappearing** generics and `List` from Lesson 0u/0v,
   applied to a filtering operation.
2. `List<String> result = new ArrayList<>(); for (String item :
   fullList) { if (item.startsWith(prefix)) { result.add(item); } }` —
   **(a) first appearance** of this exact shape: builds a brand-new list,
   never modifying `fullList` at all — each element is only ever read
   from `fullList`, never removed from it.
3. `List<String> filtered = filterByPrefix(allItems, "W");` — `allItems`
   is passed in, read, but not mutated; `filtered` is the new, separate
   result.

### CS Lens

A projection computes a *derived view* — logically dependent on the
source data, but not the same storage, and not persisted back into it.
This is the identical underlying idea behind Lesson 16a's own
`ReadableCounter`-style exposure, applied here to a whole collection
rather than one field: the original stays intact and authoritative; the
view is disposable and recomputed as needed.

Also recognized in: SQL `SELECT` queries with a `WHERE` clause (computing
a filtered view without modifying the underlying table), spreadsheet
filters (hiding rows without deleting the underlying data), search
results in virtually any application (a computed subset of a larger,
unchanged dataset).

### SE Lens

The alternative — actually removing non-matching items from `allItems`
itself to "filter" it — was not chosen because it would destroy data the
rest of the program might still need; a projection lets the same
underlying dataset serve many different, simultaneous views (a search
result here, a full list elsewhere) without any of them interfering with
each other or with the source.

---

## Connect the Pieces

`filterByPrefix` computes a projection — a derived, filtered view — from
`allItems`, without ever mutating the original list. The next lesson
names a third, unrelated recurring shape.

## What Breaks Without This

Actually removing non-matching items from `allItems` itself to "filter"
it would destroy data the rest of the program might still need — a
projection avoids that by leaving the source untouched.

## Exercises

1. Add a second projection function, `sortAlphabetically(List<String>
   fullList)`, returning a new, sorted list without mutating the
   original.
2. Explain, in your own words, why `fullList` is never written to inside
   `filterByPrefix`.
3. Explain, in your own words, why a search feature in a real app should
   compute a projection rather than mutating the underlying data.

## Definition of Done

- [ ] You ran the `filterByPrefix` example and saw the real output.
- [ ] You completed Exercise 1 and confirmed the original list was
      unmutated after producing a sorted projection.
- [ ] You can state, without looking back at this lesson, why
      `filterByPrefix` returns a new `List` instead of modifying
      `fullList` directly.
