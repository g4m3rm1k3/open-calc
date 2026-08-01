# CPP DSA — LAB-15 — Sorting Algorithms, Visualized

**Prerequisites:** LAB-14 (Hash Tables From Scratch)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What does "comparison sort" mean, and what's the one operation every algorithm in this lab is built entirely out of?
2. Why is merge sort's O(n log n) meaningfully faster than bubble sort's O(n²) for large inputs — at n = 1,000,000, roughly how many times faster?
3. What does "stable" mean for a sorting algorithm, and why would it matter when sorting a list of people by last name, if some share the same last name?

## What You Will Build

Four sorting algorithms — bubble, insertion, merge, quick — each printing the array's state after every meaningful step, so you watch each one's actual strategy unfold rather than just trusting a black-box `sort()` call. Every implementation operates on `MyVector<int>` (LAB-06) directly.

```
$ ./sort_demo
Bubble sort on [5, 2, 8, 1, 9]:
  pass 1: [2, 5, 1, 8, 9]  (swapped 5&2, swapped 8&1)
  pass 2: [2, 1, 5, 8, 9]  (swapped 5&1)
  pass 3: [1, 2, 5, 8, 9]  (swapped 2&1)
  pass 4: [1, 2, 5, 8, 9]  (no swaps -- DONE early)

Merge sort on [5, 2, 8, 1, 9]:
  split: [5, 2, 8] | [1, 9]
  split: [5, 2] | [8]  ...  [1] | [9]
  merge: [2, 5]  merge: [1, 8, 9]  wait -- 8 alone, merge later
  merge: [1, 2, 5, 8, 9]
```

## Concept: Comparison Sorts — All Built From One Operation, Combined Differently

**What it is:** Every algorithm in this lab is a **comparison sort**: the entire algorithm is built from one repeated operation — compare two elements, and possibly swap or reorder them based on the result. What differs between bubble sort, insertion sort, merge sort, and quicksort isn't the comparison itself, but the *strategy* for which elements to compare and when, and that strategy is exactly what determines each algorithm's time complexity.

**The problem before:** `MyVector` (LAB-06), `MyLinkedList` (LAB-07), and `MyHashMap` (LAB-14) all store elements in *whatever order they were inserted* (or, for the hash map, effectively no meaningful order at all) — none of them keep data sorted automatically. Plenty of real problems need sorted data directly (displaying a leaderboard) or need it as a stepping stone to a faster operation (LAB-16's binary search *requires* sorted input to work at all).

**The solution:** Different sorting strategies trade simplicity for speed differently. Bubble sort and insertion sort are simple to understand and correctly write, but O(n²) — for every element, they potentially compare against every other element. Merge sort and quicksort are more intricate (both recursive, both built on a "divide into smaller pieces, solve each, combine" strategy) but achieve O(n log n) — the same halving-the-problem idea that gave LAB-13's balanced BST its O(log n) search, applied here to reduce the *total* number of comparisons needed across the whole sort, not just one lookup.

**Canonical example:**

```cpp
void bubbleSort(MyVector<int>& arr) {
    for (int i = 0; i < arr.getSize() - 1; i++) {
        for (int j = 0; j < arr.getSize() - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
}
```

**Project Application:** LAB-16's binary search requires sorted input — this lab is the direct prerequisite for that one. LAB-19's file-backed database sorts loaded records by a chosen field before displaying search results, reusing whichever of these four algorithms fits the dataset size best.

**Watch for:** Choosing bubble sort or insertion sort (O(n²)) for a large dataset out of habit, once merge sort/quicksort (O(n log n)) are available and understood. For small arrays (roughly under 20–30 elements) the simpler algorithms can actually be *faster* in practice due to lower constant overhead — but as `n` grows into the thousands or millions, the O(n²) algorithms become dramatically, unusably slower, exactly the gap Step 4's measurement makes concrete.

## Step 1: Bubble sort — repeatedly swap adjacent out-of-order pairs

```cpp
#include "MyVector.h" // LAB-06
#include <iostream>

void bubbleSort(MyVector<int>& arr) {
    int n = arr.getSize();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        std::cout << "pass " << (i + 1) << ": ["; // print current state after each full pass
        for (int k = 0; k < n; k++) std::cout << arr[k] << (k < n - 1 ? ", " : "");
        std::cout << "]" << (swapped ? "" : "  (no swaps -- DONE early)") << "\n";
        if (!swapped) break; // the array is already sorted -- no point continuing
    }
}
```

Each outer-loop pass "bubbles" the largest remaining unsorted value to its correct position at the end — after pass 1, the single largest element is guaranteed to be in its final spot; after pass 2, the two largest are; and so on, which is why the inner loop's range shrinks by one (`n - 1 - i`) each pass — no need to re-check positions already proven correct. The `swapped` flag is a genuine, worthwhile optimization: if a full pass makes zero swaps, the array is already sorted, and continuing further passes would just be wasted comparisons — `break` exits early rather than mechanically running all `n-1` passes regardless.

### SAVE AND TRY

Run `bubbleSort` on `{5, 2, 8, 1, 9}` (loaded into a `MyVector<int>`) and confirm the printed passes match "What You Will Build" — specifically confirm the early-exit "no swaps" message appears, and count how many total passes actually ran versus how many `n - 1` (the worst-case maximum) would have been.

**Stability, briefly:** a sort is called **stable** if two elements that compare as *equal* keep their original relative order in the output. Bubble sort is stable — the swap condition is strictly `arr[j] > arr[j + 1]`, so two equal adjacent elements are never swapped, and equal elements never leapfrog past each other over the course of the algorithm. This matters concretely when sorting *records* by one field (say, last name) while other fields (first name) were already in a meaningful order beforehand — a stable sort preserves that pre-existing order among ties; an unstable one offers no such guarantee. Watch for this again in Step 3 (merge sort, stable) and the Challenge (quicksort, not stable as written).

## Step 2: Insertion sort — build up a sorted prefix, one element at a time

```cpp
void insertionSort(MyVector<int>& arr) {
    int n = arr.getSize();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j]; // shift this larger element one slot right
            j--;
        }
        arr[j + 1] = key; // insert key into the gap left by shifting

        std::cout << "after inserting index " << i << ": [";
        for (int k = 0; k < n; k++) std::cout << arr[k] << (k < n - 1 ? ", " : "");
        std::cout << "]\n";
    }
}
```

The mental model: everything to the left of index `i` (indices `0` through `i-1`) is *already sorted*, by invariant maintained across every loop iteration — `insertionSort`'s job at each step is just to take the next element (`arr[i]`) and slide it leftward through the already-sorted prefix until it lands in its correct position, shifting larger elements one slot right to make room. This is a genuinely different strategy from bubble sort's repeated full-array passes: insertion sort never touches elements past index `i` at all until it's their turn — a "grow a sorted region" strategy instead of a "repeatedly scan everything" one.

### SAVE AND TRY

Run `insertionSort` on the same `{5, 2, 8, 1, 9}` and print after every outer-loop step. Confirm the sorted-prefix invariant directly: after processing index `2` (the third element), manually check that `arr[0]` through `arr[2]` really are in sorted order relative to *each other*, even though `arr[3]` and `arr[4]` haven't been touched yet.

## Step 3: Merge sort — divide, conquer, combine

```cpp
void merge(MyVector<int>& arr, int left, int mid, int right) {
    MyVector<int> leftPart, rightPart;
    for (int i = left; i <= mid; i++) leftPart.push_back(arr[i]);
    for (int i = mid + 1; i <= right; i++) rightPart.push_back(arr[i]);

    int i = 0, j = 0, k = left;
    while (i < leftPart.getSize() && j < rightPart.getSize()) {
        if (leftPart[i] <= rightPart[j]) { arr[k++] = leftPart[i++]; }
        else { arr[k++] = rightPart[j++]; }
    }
    while (i < leftPart.getSize()) arr[k++] = leftPart[i++]; // copy any remaining left elements
    while (j < rightPart.getSize()) arr[k++] = rightPart[j++]; // or any remaining right elements
}

void mergeSort(MyVector<int>& arr, int left, int right) {
    if (left >= right) return; // base case: 0 or 1 elements, already "sorted"

    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);       // sort the left half
    mergeSort(arr, mid + 1, right);  // sort the right half
    merge(arr, left, mid, right);    // combine the two sorted halves into one sorted whole
}
```

This is LAB-11's recursion applied directly to sorting: the base case (`left >= right`, a subarray of 0 or 1 elements) is trivially already sorted; the recursive case splits the array roughly in half, recursively sorts *each half independently*, then `merge`s the two already-sorted halves back together — the actual "combine" step, which only needs a single linear pass comparing the fronts of both halves, since each half is already internally sorted before `merge` ever runs. The recursive halving is exactly what produces the `O(log n)` factor in `O(n log n)`: the array is split in half roughly `log2(n)` times before reaching single-element base cases, and each of those `log2(n)` "levels" does O(n) total work merging.

### SAVE AND TRY

Add a temporary print inside `mergeSort` right before the `left >= right` check, showing `left` and `right` — run `mergeSort` on `{5, 2, 8, 1, 9}` and trace the printed calls, confirming they show the array being split into ever-smaller ranges before any merging happens at all, matching "What You Will Build"'s split/merge trace at the top of this lab.

## Step 4: Measuring the difference — O(n²) vs O(n log n), for real

```cpp
#include <chrono>
#include <random>

MyVector<int> generateRandomArray(int n) {
    MyVector<int> arr;
    std::mt19937 rng(42); // fixed seed for reproducible results
    std::uniform_int_distribution<int> dist(0, 1000000);
    for (int i = 0; i < n; i++) arr.push_back(dist(rng));
    return arr;
}

void benchmarkSort(const std::string& name, void (*sortFn)(MyVector<int>&), int n) {
    MyVector<int> arr = generateRandomArray(n);
    auto start = std::chrono::high_resolution_clock::now();
    sortFn(arr);
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << name << " on " << n << " elements: " << duration.count() << "ms\n";
}
```

This is LAB-08's complexity-benchmarking instinct from the SE Masterclass series (measure, don't guess) arriving here in C++, using `<chrono>` — the standard library's real timing facility — instead of a hand-rolled counter. Wrapping the sorting call's *silent* passes (turn off the per-step printing from Steps 1–3 for this benchmark, or the I/O overhead will dominate the measurement) between two `high_resolution_clock::now()` calls gives an actual wall-clock duration, not a theoretical estimate.

### SAVE AND TRY

Benchmark bubble sort and merge sort (both with printing disabled) on arrays of size `1,000`, then `10,000`, then `100,000`. Confirm bubble sort's time grows roughly by a factor of 100 each time `n` grows by 10 (consistent with O(n²): `(10n)² = 100n²`), while merge sort's time grows by roughly a factor of 10–11 each time (consistent with O(n log n)) — the gap should become dramatic and unmistakable by `100,000` elements, a real, measured confirmation of the complexity classes this lab's concept section named.

## 🎯 Challenge

Implement quicksort: pick a pivot (the last element is simplest), partition the array so everything smaller than the pivot ends up to its left and everything larger ends up to its right, then recursively sort each side — structurally similar to merge sort's divide-and-conquer shape, but partitioning happens *before* the recursive calls instead of merging happening *after* them.

<details>
<summary>Solution</summary>

```cpp
int partition(MyVector<int>& arr, int low, int high) {
    int pivot = arr[high]; // choose the last element as pivot
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]); // place the pivot in its final sorted position
    return i + 1; // the pivot's final index
}

void quickSort(MyVector<int>& arr, int low, int high) {
    if (low >= high) return; // base case

    int pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);   // everything smaller than pivot
    quickSort(arr, pivotIndex + 1, high);  // everything larger than pivot
}
```

Unlike merge sort, quicksort's recursive splitting isn't a fixed midpoint — it's wherever `partition` happens to land the pivot, which depends entirely on the data. This is genuinely a trade-off: quicksort's average case is O(n log n), competitive with merge sort, but its *worst* case (already-sorted or reverse-sorted input, with this simple "always pick the last element" pivot strategy) degrades to O(n²) — directly analogous to LAB-13's unbalanced-BST danger, just showing up in a sorting algorithm instead of a tree.

</details>

## Mental Model

| Concept | Bubble / Insertion sort | Merge sort / Quicksort |
|---|---|---|
| Complexity | O(n²) | O(n log n) |
| Strategy | Repeatedly compare/shift within the whole array | Divide into smaller pieces, solve each, combine |
| Simplicity | Easy to write correctly, easy to trace by hand | More intricate, genuinely recursive |
| Best for | Small arrays, or nearly-sorted data (insertion sort especially) | Large arrays, where the complexity gap actually matters |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does bubble sort's inner loop range shrink by one on every pass? | |
| 2 | Why is merge sort's base case "0 or 1 elements" rather than "already checked to be sorted"? | |
| 3 | What real-world input pattern makes quicksort (with a naive last-element pivot) degrade toward O(n²)? | |

## Quick Check Answers

1. Every algorithm in this lab is built from exactly one repeated operation: comparing two elements against each other, then possibly reordering based on the result — bubble sort compares and swaps adjacent pairs, insertion sort compares while shifting, merge sort compares while merging, quicksort compares while partitioning; the strategy for *which* comparisons to make and *when* is what differs.
2. At n = 1,000,000: n² is 1,000,000,000,000 (a trillion), while n·log₂(n) is roughly 1,000,000 × 20 ≈ 20,000,000 (twenty million) — merge sort would be on the order of 50,000 times fewer total comparisons, a difference that turns "runs instantly" into "would take an impractically long time" for the O(n²) algorithm at this scale.
3. A stable sort preserves the original relative order of elements that compare as equal — if two people share the same last name, a stable sort keeps them in whatever order they originally appeared (e.g., by first name, if the list happened to already be sorted that way), while an unstable sort offers no such guarantee and might reorder them arbitrarily relative to each other.

*Next: [LAB-16 — Searching Algorithms](CPP-S02-LAB-16-SEARCHING-ALGORITHMS.md)*
