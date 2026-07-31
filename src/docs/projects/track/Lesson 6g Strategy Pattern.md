# Lesson 6g: The Strategy Pattern

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0q's interface.

**Terms introduced in this lesson:**

- **Strategy pattern** — an algorithm or behavior is extracted into a
  separate, swappable object or interface, rather than baked directly
  into the class that uses it.

---

## Concept Unit: The Strategy Pattern

### The Problem

A `RecyclerView`'s two jobs — deciding *what data* goes in which row,
and deciding *how rows are spatially arranged* (a vertical list, a
grid) — are genuinely independent concerns; baking both into one class
would mean any new arrangement needs a whole new, duplicated
data-handling class alongside it.

### Introduce the Concept in Isolation

```
mkdir lesson-6g
cd lesson-6g
```

Create `Main.java`:

```java
interface SortStrategy {
    void sort(int[] numbers);
}

class AscendingSort implements SortStrategy {
    public void sort(int[] numbers) {
        java.util.Arrays.sort(numbers);
    }
}

class Sorter {
    private SortStrategy strategy;

    Sorter(SortStrategy strategy) {
        this.strategy = strategy;
    }

    void sortNumbers(int[] numbers) {
        strategy.sort(numbers);
    }
}

public class Main {
    public static void main(String[] args) {
        int[] numbers = {5, 2, 8, 1};
        Sorter sorter = new Sorter(new AscendingSort());
        sorter.sortNumbers(numbers);

        System.out.println("Sorted: " + java.util.Arrays.toString(numbers));
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
Sorted: [1, 2, 5, 8]
```

`Sorter` never implements sorting logic itself — it delegates to
whichever `SortStrategy` it holds. This is the `strategy pattern` —
**first appearance**: an algorithm or behavior is extracted into a
separate, swappable object or interface, rather than baked directly
into the class that uses it. A different sorting strategy could be
swapped in with zero changes to `Sorter` itself.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `interface SortStrategy { void sort(int[] numbers); }` — **(b)
   reappearing** interface shape from Lesson 0q, this time describing
   an algorithm rather than a general capability.
2. `Sorter(SortStrategy strategy) { this.strategy = strategy; }` —
   **(a) first appearance** of this exact shape: the algorithm itself
   is handed in from outside, rather than hardcoded inside `Sorter`.

### CS Lens

The strategy pattern injects a swappable algorithm as a collaborator,
rather than one class hardcoding one algorithm — precisely why
`RecyclerView`'s `Adapter` (data → views) and `LayoutManager`
(arrangement) are deliberately two independent, swappable
collaborators, not one class doing both jobs.

Also recognized in: sorting algorithm selection in many standard
libraries, payment-processing systems supporting multiple swappable
payment methods, any "pluggable algorithm" design.

### SE Lens

The alternative — one `Sorter` class hardcoding one specific sort
algorithm — was not chosen because a new algorithm would require an
entirely new, duplicated class; extracting the algorithm into a
swappable `SortStrategy` means `Sorter` itself never changes, no
matter how many different algorithms are later added.

---

## Connect the Pieces

`Sorter` never implements sorting itself — it holds a swappable
`SortStrategy`. The next lesson (`RecyclerView.Adapter`) shows the
first of `RecyclerView`'s own two independent, swappable collaborators
this exact pattern makes possible.

## What Breaks Without This

Hardcoding `AscendingSort`'s own logic directly inside `Sorter`,
instead of holding it as a swappable `SortStrategy`, would mean adding
a `DescendingSort` later requires either duplicating `Sorter` entirely
or modifying it — exactly the coupling the strategy pattern avoids.

## Exercises

1. Add a second `SortStrategy` implementation, `DescendingSort`, and
   swap it into `Sorter` with no changes to `Sorter` itself.
2. Explain, in your own words, why `Sorter` takes a `SortStrategy` in
   its constructor rather than hardcoding one algorithm.
3. Name, from memory, one other place in this course where a swappable
   collaborator, rather than a hardcoded behavior, has already
   appeared.

## Definition of Done

- [ ] You ran the example and saw the real, sorted output.
- [ ] You completed Exercise 1 and swapped a strategy with zero
      changes to `Sorter`.
- [ ] You can state, without looking back at this lesson, why
      `Sorter` never changes when a new sorting algorithm is added.
