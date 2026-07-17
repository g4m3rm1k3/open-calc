---
concept: 082-sorting-algorithms
name: Sorting Algorithms
---

## Definition

Sorting algorithms rearrange a collection into order according to some
comparison rule — different algorithms make different trade-offs in speed,
memory use, and whether equal elements keep their original relative order
(stability).

## Problem

Comparing every possible pair of elements to determine order works but
scales poorly. Real sorting algorithms exploit structure — partitioning
around a pivot, merging already-sorted halves — to sort in O(n log n)
instead, the best achievable for comparison-based sorting in the general
case.

## Execution

Bubble sort on [5, 2, 4, 1]:
↓
Pass 1: compare (5,2)→swap→[2,4,1,5] after sweeping the whole row
↓
Pass 2: compare adjacent pairs again → [2,1,4,5]
↓
Pass 3: compare adjacent pairs again → [1,2,4,5]
↓
Pass 4: no swaps needed anywhere in the sweep → already sorted, stop: [1, 2, 4, 5]

## Computer Science

Comparison-based sorting has a proven lower bound of O(n log n) — no
algorithm that sorts purely by comparing pairs of elements can do better
than that in the worst case, a result provable via a decision-tree argument
(there are n! possible orderings, and each comparison can only cut the
remaining possibilities roughly in half). Bubble and insertion sort are
O(n²) but simple; merge sort and quicksort achieve O(n log n) by dividing
the problem (see the Recursion concept) rather than comparing every pair.

Tags: Comparison sort, Lower bound, Divide and conquer, Stability

## Software Engineering

Stability (whether equal elements keep their original relative order)
matters whenever a "sort by X, then by Y" multi-key sort is needed — sorting
by Y first, then stably by X, correctly preserves the Y-order among
equal-X elements; an unstable sort would scramble that secondary order.
Most languages' built-in sort is a hybrid, well-tuned algorithm (Timsort,
introsort) — reimplementing your own sort from scratch is rarely justified
outside of learning the algorithms themselves.

Tags: Stability, Timsort, Built-in sort, Multi-key sorting

## Common Mistakes

- Assuming a language's built-in sort is always O(n log n) with no further thought — usually true, but it's worth knowing which algorithm and whether it's stable, since that occasionally matters for correctness (multi-key sorts), not just speed.
- Writing a comparator that returns the opposite of what's intended — this silently produces a reverse sort, or worse, an inconsistent, only-partially-sorted result if the comparator isn't a genuinely consistent ordering.

## Exercises

- Trace bubble sort by hand on `[3, 1, 4, 1, 5]`, writing out the array's state after each full pass, until no swaps are needed.
- Sort a list of `{name, age}` records first by `age`, then (stably) by `name` for people the same age — confirm the age-groups stay correctly ordered by name.

## javascript

```javascript
function bubbleSort(arr) {
  const a = [...arr]
  let swapped
  do {
    swapped = false
    for (let i = 0; i < a.length - 1; i++) {
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]]
        swapped = true
      }
    }
  } while (swapped)
  return a
}

console.log(bubbleSort([5, 2, 4, 1]))                // [1, 2, 4, 5]
console.log([3, 1, 4, 1, 5].sort((a, b) => a - b))   // [1, 1, 3, 4, 5] — built-in, O(n log n)
```
Walkthrough: `bubbleSort` repeatedly sweeps through the array, swapping any
adjacent out-of-order pair, until an entire pass makes no swaps — the
traditional, simple, but O(n²) approach. The built-in `.sort()` (with a
proper numeric comparator) uses a much faster O(n log n) algorithm
internally, which is why real code should almost always prefer it over a
hand-rolled sort like this one.

## python

```python
def bubble_sort(arr):
    a = list(arr)
    swapped = True
    while swapped:
        swapped = False
        for i in range(len(a) - 1):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
    return a


print(bubble_sort([5, 2, 4, 1]))     # [1, 2, 4, 5]
print(sorted([3, 1, 4, 1, 5]))       # [1, 1, 3, 4, 5] -- built-in, O(n log n), stable
```
Walkthrough: identical bubble-sort mechanics as the JavaScript version.
Python's built-in `sorted()` uses Timsort, a real-world hybrid algorithm
that's both O(n log n) and stable — the reason a hand-written sort is
almost never the right choice outside of learning how sorting algorithms
work.
