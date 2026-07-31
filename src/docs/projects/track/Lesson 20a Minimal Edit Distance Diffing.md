# Lesson 20a: Minimal Edit Distance Diffing

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 6h's `RecyclerView.Adapter`.

**Terms introduced in this lesson:**

- **Minimal edit distance diffing** — computing the smallest set of
  insertions, deletions, and substitutions that transforms one ordered
  sequence into another.

---

## Concept Unit: Minimal Edit Distance Diffing

### The Problem

`notifyDataSetChanged()` (Lesson 6h) tells `RecyclerView` to assume every
single row might have changed and redraw the whole list — even when, in
reality, only one item out of a hundred actually differs between the old
list and the new one.

### Introduce the Concept in Isolation

```
mkdir lesson-20a
cd lesson-20a
```

Create `Main.java`:

```java
import java.util.List;

public class Main {
    static void describeDiff(List<String> oldList, List<String> newList) {
        for (String item : oldList) {
            if (!newList.contains(item)) {
                System.out.println("Removed: " + item);
            }
        }
        for (String item : newList) {
            if (!oldList.contains(item)) {
                System.out.println("Inserted: " + item);
            }
        }
    }

    public static void main(String[] args) {
        List<String> oldList = List.of("Wrench", "Bolt", "Hammer");
        List<String> newList = List.of("Wrench", "Hammer", "Screwdriver");

        describeDiff(oldList, newList);
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
Removed: Bolt
Inserted: Screwdriver
```

#### Execution Trace

Trace of `describeDiff`'s own two loops, against `oldList = ["Wrench",
"Bolt", "Hammer"]` and `newList = ["Wrench", "Hammer", "Screwdriver"]`:

1. `"Wrench"` (first loop) — present in `newList`, so nothing is printed.
2. `"Bolt"` (first loop) — absent from `newList`; `"Removed: Bolt"` is
   printed.
3. `"Hammer"` (first loop) — present in `newList`, so nothing is printed.
4. `"Wrench"` (second loop) — present in `oldList`, so nothing is printed.
5. `"Hammer"` (second loop) — present in `oldList`, so nothing is printed.
6. `"Screwdriver"` (second loop) — absent from `oldList`, causing
   `"Inserted: Screwdriver"` to print.

Only `"Bolt"` and `"Screwdriver"` are reported — `"Wrench"` and
`"Hammer"`, present in both lists, are correctly identified as unchanged
and never mentioned. This is `minimal edit distance diffing` — **first
appearance**: computing the smallest set of insertions, deletions, and
substitutions that transforms one ordered sequence into another.
`describeDiff` computes the actual, precise difference between two list
states — the same algorithm family behind `git diff`.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `for (String item : oldList) { if (!newList.contains(item)) { ... } }`
   — **(a) first appearance**: finds every element present in the old
   list but absent from the new one — `"Bolt"` only.
2. `for (String item : newList) { if (!oldList.contains(item)) { ... } }`
   — **(a) first appearance**: finds every element present in the new
   list but absent from the old one — `"Screwdriver"` only.
3. `"Wrench"` and `"Hammer"` appear in both lists and are never printed
   by either loop — correctly identified as unchanged, requiring no
   reported difference at all.

### CS Lens

Minimal edit distance diffing is the same algorithm family behind `git
diff` (comparing two versions of a text file) and spell-checkers'
edit-distance suggestions — computing the smallest transformation between
two sequences, rather than treating them as entirely unrelated.

Also recognized in: `git diff` and other version-control diffing, DOM
diffing in virtual-DOM UI frameworks (React, Vue) — comparing an old and
new UI tree to compute the minimal real DOM changes needed.

### SE Lens

The alternative — assuming every element changed and redrawing
everything, as `notifyDataSetChanged()` does — was not chosen where
performance matters because it does real, unnecessary work redrawing rows
that never actually changed; minimal edit distance diffing computes
exactly which rows changed, so only those need to be redrawn.

---

## Connect the Pieces

`describeDiff` computes the actual, precise difference between two list
states. The next lesson shows Android's own real, production
implementation of this exact idea.

## What Breaks Without This

Assuming every element changed and redrawing everything, as
`notifyDataSetChanged()` does, does real, unnecessary work redrawing rows
that never actually changed.

## Exercises

1. Modify `describeDiff` to also print a count of how many items were
   unchanged, using both lists' own sizes and the two counts already
   computed.
2. Explain, in your own words, why `"Wrench"` and `"Hammer"` are never
   printed by either loop.
3. Explain, in your own words, why this algorithm family is described as
   "minimal" — what would a non-minimal diff look like instead?

## Definition of Done

- [ ] You ran the `describeDiff` example and can explain why `"Wrench"`
      and `"Hammer"` are never printed.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why assuming
      everything changed is wasteful compared to a minimal diff.
