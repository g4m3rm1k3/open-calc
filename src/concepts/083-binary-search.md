---
concept: 083-binary-search
name: Binary Search
---

## Definition

Binary search finds a target value in a *sorted* collection by repeatedly
comparing the target to the middle element and discarding the half of the
search space that can't possibly contain it — instead of checking every
element in order.

## Problem

Scanning a sorted collection one element at a time (linear search) is O(n) —
correct, but wasteful, since the collection already being sorted tells you
which half a target could be in after just one comparison. Binary search
exploits that sortedness to eliminate half the remaining possibilities with
every single comparison.

## Execution

Search for 11 in [1, 3, 5, 7, 9, 11, 13], lo=0, hi=6
↓
mid = 3, arr[3] = 7 → 7 < 11 → discard the left half, lo = 4
↓
mid = 5, arr[5] = 11 → matches! return index 5

## Computer Science

Binary search is O(log n) because each comparison eliminates half of
whatever remains — the number of times n can be halved before reaching 1 is
exactly log₂(n), which is why doubling the input size only adds *one* more
comparison in the worst case, not double the work. This is the classic,
most intuitive example of logarithmic time complexity (see the Big-O
Notation concept).

Tags: Logarithmic time, Divide and conquer, Sorted precondition, Search space

## Software Engineering

Binary search requires the collection to already be sorted — running it on
unsorted data doesn't just give a wrong answer occasionally, it can
silently return the wrong result or miss a value that IS actually present,
since the "discard half" logic depends entirely on sortedness holding. It's
also a common building block underneath more advanced techniques —
searching over an answer space, finding an insertion point — far beyond
just "find this exact value in this exact array."

Tags: Sorted precondition, Search-on-answer-space, Insertion point, Off-by-one bugs

## Common Mistakes

- Running binary search on unsorted data, expecting it to still work — it silently produces wrong or missing results, since the entire algorithm depends on the sortedness precondition.
- Off-by-one errors in the lo/hi/mid bounds — a common source of infinite loops or missing the target by one position; small variations in how bounds are updated matter a great deal and depend on exactly what invariant the loop is meant to maintain.

## Exercises

- Trace binary search by hand searching for 2 in `[1, 2, 4, 8, 16, 32]`, writing out `lo`, `hi`, and `mid` at each step until it's found.
- Modify the search to find the LEFTMOST occurrence of a value that appears more than once in the array — what changes about how the loop responds to a match?

## javascript

```javascript
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}

const sorted = [1, 3, 5, 7, 9, 11, 13]
console.log(binarySearch(sorted, 11))   // 5
console.log(binarySearch(sorted, 4))    // -1 — not present
```
Walkthrough: `mid` is always the midpoint of the current `[lo, hi]` search
range. If `arr[mid]` is too small, the target must be to the right, so `lo`
moves past `mid`; if too large, `hi` moves before `mid`. Each comparison
discards half of whatever range remained, which is why this takes only a
handful of comparisons even on a large sorted array.

## python

```python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


sorted_arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(sorted_arr, 11))   # 5
print(binary_search(sorted_arr, 4))    # -1 -- not present
```
Walkthrough: identical halving logic as the JavaScript version — `mid`,
`lo`, and `hi` are tracked exactly the same way, and each comparison
eliminates half of the remaining search range regardless of language.
