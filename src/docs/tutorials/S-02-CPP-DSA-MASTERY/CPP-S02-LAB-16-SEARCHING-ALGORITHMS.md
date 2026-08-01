# CPP DSA — LAB-16 — Searching Algorithms

**Prerequisites:** LAB-15 (Sorting Algorithms, Visualized)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does linear search work on completely unsorted data, while binary search cannot?
2. At each step, binary search eliminates roughly what fraction of the remaining search space?
3. Why is `mid = low + (high - low) / 2` written that way instead of the seemingly simpler `mid = (low + high) / 2`?

## What You Will Build

Linear search and binary search implemented side by side on the same data, with a printed trace of exactly which indices each one checks — making the O(n) vs. O(log n) gap from LAB-15 directly visible again, this time for lookups instead of full sorts.

```
$ ./search_demo
Array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]  (10 elements, sorted)

Linear search for 15:
  check index 0 (value 1)... no
  check index 1 (value 3)... no
  ...
  check index 7 (value 15)... FOUND at index 7  (8 checks total)

Binary search for 15:
  check index 4 (value 9), target > mid, search RIGHT half
  check index 7 (value 15)... FOUND at index 7  (2 checks total)
```

## Concept: Binary Search — Halving the Search Space, Requires Sorted Data

**What it is:** Linear search checks every element, one at a time, from the start, until it finds a match or runs out of elements — it makes no assumption about the data's order, which is both its strength (works on anything) and its weakness (O(n), no shortcuts possible). Binary search instead checks the *middle* element of a sorted range: if the target is smaller, the entire right half can be discarded (everything there is guaranteed larger, by the sortedness); if larger, the entire left half is discarded. Repeating this on the remaining half, then the remaining quarter, then the remaining eighth, is what produces O(log n) — this is the exact same "halve the remaining search space" idea LAB-13's balanced BST used, here applied to a plain sorted array instead of a tree structure.

**The problem before:** LAB-14's hash table gives O(1) average lookup, but only for exact-match lookups by key, and only after building the table in the first place — sometimes data is already just sitting in a sorted array (the output of LAB-15's sort, or LAB-19's file-loaded records after sorting), and building a whole separate hash table just to do a handful of lookups would be wasted setup work. For sorted data already sitting in an array, binary search gets most of the hash table's speed benefit (O(log n), not O(1), but far better than O(n)) with zero extra data structure needed.

**The solution:** Track `low` and `high` bounds marking the current range still worth searching. Compute `mid`, compare the target against `arr[mid]`, and narrow the range to one half or the other based on the comparison — repeat until either the target is found or the range becomes empty (`low > high`, meaning it isn't present at all). Every single comparison eliminates roughly half of whatever range remained, which is precisely what makes the total number of comparisons grow only logarithmically with the array's size, not linearly.

**Canonical example:**

```cpp
int binarySearch(MyVector<int>& arr, int target) {
    int low = 0, high = arr.getSize() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // not found
}
```

**Project Application:** LAB-19's file-backed database offers binary search as the fast-path lookup option once records are sorted by key (an alternative to LAB-14's hash table, worth comparing directly) — and this lab's linear-vs-binary comparison is the exact demonstration of *why* that choice matters for a real tool working with potentially large files.

**Watch for:** Running binary search on *unsorted* data. It compiles fine, runs without crashing, and produces a plausible-looking wrong answer — because the entire algorithm's correctness depends on the sortedness guarantee ("everything past `mid` in this direction is guaranteed larger/smaller"), and without that guarantee, discarding half the array based on one comparison is simply invalid, silently dropping the actual target from consideration.

## Step 1: Linear search — the baseline, works on anything

```cpp
#include "MyVector.h"
#include <iostream>

int linearSearch(MyVector<int>& arr, int target) {
    for (int i = 0; i < arr.getSize(); i++) {
        std::cout << "  check index " << i << " (value " << arr[i] << ")... ";
        if (arr[i] == target) {
            std::cout << "FOUND at index " << i << "\n";
            return i;
        }
        std::cout << "no\n";
    }
    std::cout << "  not found after checking all " << arr.getSize() << " elements\n";
    return -1;
}
```

This makes zero assumptions about the data — it would work identically on unsorted, reverse-sorted, or already-sorted data, checking each index in order until a match is found or the array is exhausted. This generality is exactly why it's O(n) worst-case: with no structural guarantee to exploit, there's no way to skip checking any element that might turn out to be the answer.

### SAVE AND TRY

```cpp
MyVector<int> arr;
for (int v : {1, 3, 5, 7, 9, 11, 13, 15, 17, 19}) arr.push_back(v);
linearSearch(arr, 15);
```

Confirm this prints exactly 8 "check" lines before finding `15` at index `7` (indices `0` through `7`, inclusive — `8` total checks) — matching "What You Will Build" exactly.

## Step 2: Binary search — requires sorted data, halves the range each step

```cpp
int binarySearch(MyVector<int>& arr, int target) {
    int low = 0;
    int high = arr.getSize() - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        std::cout << "  check index " << mid << " (value " << arr[mid] << "), ";

        if (arr[mid] == target) {
            std::cout << "FOUND\n";
            return mid;
        } else if (arr[mid] < target) {
            std::cout << "target > mid, search RIGHT half\n";
            low = mid + 1;
        } else {
            std::cout << "target < mid, search LEFT half\n";
            high = mid - 1;
        }
    }
    std::cout << "  not found\n";
    return -1;
}
```

`mid = low + (high - low) / 2` (not the simpler-looking `(low + high) / 2`) is written this way specifically to avoid **integer overflow**: if `low` and `high` were both very large (near the maximum value an `int` can hold), `low + high` could overflow *before* the division happens, producing a garbage, wrapped-around result — `low + (high - low) / 2` computes the identical midpoint mathematically, but never adds two large numbers together, only ever adding `low` to a value that's already been divided down to something small. This is a real, historically famous bug (found in production binary search implementations, including once in Java's own standard library) — worth internalizing here rather than discovering the hard way later.

### SAVE AND TRY

```cpp
binarySearch(arr, 15);
```

Confirm this finds `15` in exactly 2 checks (matching "What You Will Build"), and manually trace through why: `mid` starts at index 4 (value `9`) — `15 > 9`, so search narrows to the right half (`low = 5`); the new `mid` lands at index 7 (value `15`) — found immediately.

## Step 3: What happens on unsorted data — the silent wrong answer

```cpp
MyVector<int> unsorted;
for (int v : {15, 3, 9, 1, 19, 7, 11, 5, 17, 13}) unsorted.push_back(v); // same VALUES, different ORDER

int result = binarySearch(unsorted, 15);
std::cout << "binarySearch found 15 at index: " << result << "\n";
```

Run this and trace by hand *why* it fails: `mid` starts at index 4 (value `19`) — `15 < 19`, so the algorithm searches the *left* half (`high = 3`), completely discarding indices 5 through 9 — which happens to include index 0, where `15` actually lives. The algorithm isn't "confused" or crashing; it's doing exactly what it's designed to do — correctly narrowing based on a comparison — the comparison's *result* is just meaningless on unsorted data, since "everything to the right is larger" was never actually true here.

### SAVE AND TRY

Run this and confirm `binarySearch` reports `-1` (not found) even though `15` is genuinely present in the array, just at an index the algorithm's (invalid, on unsorted data) assumptions caused it to skip over entirely. Then run `linearSearch` on the exact same unsorted array and confirm it *does* find `15` correctly — direct, side-by-side proof of the concept section's "watch for" warning.

## Step 4: Combining LAB-15 and this lab — sort, then binary search

```cpp
void insertionSort(MyVector<int>& arr); // from LAB-15

int sortThenSearch(MyVector<int>& arr, int target) {
    insertionSort(arr); // ensure the precondition binary search requires
    return binarySearch(arr, target);
}
```

This is the realistic pattern: if data isn't already sorted and you need to search it more than once, sorting it *once* (LAB-15, O(n log n) for merge sort, or acceptable even at O(n²) for a one-time cost on modest-sized data) and then using binary search for every subsequent lookup (O(log n) each) is usually far cheaper overall than running linear search (O(n)) repeatedly — the sort's one-time cost gets "paid back" across every search performed afterward.

### SAVE AND TRY

Time (using `<chrono>`, from LAB-15 Step 4) 1,000 linear searches against an unsorted 10,000-element array, versus one sort followed by 1,000 binary searches against the same data. Confirm the sort-then-binary-search approach is dramatically faster overall — a direct, measured justification for why this combination is worth the upfront sorting cost when many lookups are expected.

## 🎯 Challenge

Write a recursive version of `binarySearch` (instead of Step 2's iterative `while` loop) — same logic, but expressed as `binarySearchRecursive(arr, target, low, high)` calling itself on the narrowed half instead of looping. Compare its structure directly against LAB-13's `searchHelper` for a BST — they should look strikingly similar, since both are the same "compare, then recurse into exactly one half" idea, just operating on a flat array versus a tree.

<details>
<summary>Solution</summary>

```cpp
int binarySearchRecursive(MyVector<int>& arr, int target, int low, int high) {
    if (low > high) return -1; // base case: range is empty, not found

    int mid = low + (high - low) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, high);
    return binarySearchRecursive(arr, target, low, mid - 1);
}
```

```cpp
int result = binarySearchRecursive(arr, 15, 0, arr.getSize() - 1);
```

Compare this directly against LAB-13's `searchHelper`:

```cpp
bool searchHelper(TreeNode<T>* node, T target, int& comparisons) {
    if (node == nullptr) return false; // base case
    if (target == node->value) return true;
    if (target < node->value) return searchHelper(node->left, target, comparisons);
    return searchHelper(node->right, target, comparisons);
}
```

Both have the identical shape: a base case for "nothing left to search" (`low > high` here, `node == nullptr` there), a direct-match check, and exactly one recursive call into whichever "half" the comparison points toward. This isn't a coincidence — a sorted array's implicit "left half / right half" split *is* structurally a balanced BST in disguise, just represented as index ranges instead of actual pointers.

</details>

## Mental Model

| Concept | Linear search | Binary search |
|---|---|---|
| Requires sorted data? | No | Yes — required, not optional |
| Complexity | O(n) | O(log n) |
| On unsorted data | Works correctly | Runs without error, but silently WRONG |
| `mid` calculation | N/A | `low + (high - low) / 2`, not `(low + high) / 2` |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does binary search's correctness depend entirely on the data already being sorted? | |
| 2 | Why does `low + (high - low) / 2` avoid a bug that `(low + high) / 2` doesn't? | |
| 3 | Why might it be worth sorting an unsorted array before searching it, even though sorting itself costs O(n log n) or more? | |

## Quick Check Answers

1. Linear search makes no assumption about data order — it just checks every element in turn, so any arrangement works identically; binary search's entire strategy depends on being able to say "everything past this point in one direction is guaranteed smaller/larger," a guarantee that only sorted data provides.
2. Roughly half — each comparison against the middle element allows discarding either everything before it or everything after it, cutting the remaining range approximately in two at every single step.
3. `(low + high)` risks integer overflow if both values are large (close to the maximum representable `int`), producing a garbage, incorrect midpoint; `low + (high - low) / 2` computes the same mathematical midpoint without ever summing two potentially-large numbers together, avoiding the overflow risk entirely.

## Module 4 Complete

This closes hashing, sorting, and searching: hash tables (LAB-14) for average-O(1) lookup independent of insertion order, four sorting strategies (LAB-15) trading simplicity for speed, and two searching strategies (this lab) showing the exact same sorted-data-enables-halving idea that powered LAB-13's BST, now applied to a plain array. Every one of these is a tool this series has now shown you how to build from nothing — not because the STL versions don't exist, but because you now know precisely what they're doing underneath, and precisely where each one's specific danger hides.

*Next: [LAB-17 — Graphs and Traversal](CPP-S02-LAB-17-GRAPHS-AND-TRAVERSAL.md)*
