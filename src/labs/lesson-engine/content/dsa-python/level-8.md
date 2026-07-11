---
series: dsa-python
level: 8
title: Sorting
lang: python
---

# Sorting

Sorting is one of the most studied problems in computer science, and most production
code delegates it to a library. But understanding how sorting works — what decisions
different algorithms make, what guarantees they provide, and why — is foundational.
You cannot choose the right sort, diagnose a bug in a custom comparator, or recognise
when a problem reduces to sorting without knowing the mechanisms.

## Selection Sort

Selection sort divides the list into a sorted region (left) and an unsorted region
(right). Each pass finds the minimum element in the unsorted region and swaps it to
the boundary. It is the simplest O(n²) sort and illustrates the core sorting idea:
grow a sorted prefix one element at a time.

```python
def selection_sort(arr):
    result = arr[:]    # copy so we don't modify the input
    n = len(result)
    for boundary in range(n):
        min_index = boundary
        for i in range(boundary + 1, n):
            if result[i] < result[min_index]:
                min_index = i
        result[boundary], result[min_index] = result[min_index], result[boundary]
    return result

print(selection_sort([64, 25, 12, 22, 11]))  # [11, 12, 22, 25, 64]
print(selection_sort([5, 3, 1, 4, 2]))       # [1, 2, 3, 4, 5]
```

**CS lens:** Selection sort is O(n²) in all cases — best, average, and worst. The outer
loop runs n times; the inner loop runs n − boundary times; together they total
`n + (n-1) + ... + 1 = n(n+1)/2` comparisons. The number of swaps is O(n) — at most one
per outer loop iteration — which makes selection sort good for situations where writes
are expensive.

**SE lens:** Returning a copy (`arr[:]`) rather than sorting in place is the functional
style: the caller's data is unchanged. Python's built-in `sorted()` follows the same
convention; `.sort()` sorts in place and returns `None`. Choose based on whether the
original order is still needed after sorting.

Insertion sort builds the sorted prefix differently: instead of finding the minimum,
it takes the next element and inserts it into the correct position in the sorted prefix
by shifting elements right until the right slot is found.

```python
def insertion_sort(arr):
    result = arr[:]
    for i in range(1, len(result)):
        key = result[i]
        j = i - 1
        while j >= 0 and result[j] > key:
            result[j + 1] = result[j]   # shift element right
            j -= 1
        result[j + 1] = key   # insert key into its correct position
    return result

print(insertion_sort([5, 2, 4, 6, 1, 3]))  # [1, 2, 3, 4, 5, 6]
```

Insertion sort is O(n²) worst-case but O(n) on nearly-sorted data — each element
is already close to its final position, so the inner `while` loop runs very few times.
Python's `sort()` and `sorted()` use Timsort, which recognises and exploits sorted runs
for exactly this reason.

## Challenge: selection sort

Write `selection_sort(arr)` that returns a new sorted list using the selection sort
algorithm. Do not modify the input list. Return the sorted copy.

```challenge
def selection_sort(arr):
    pass
```

```test
assert selection_sort([5, 3, 1, 4, 2]) == [1, 2, 3, 4, 5]
assert selection_sort([1]) == [1]
assert selection_sort([]) == []
assert selection_sort([3, 3, 1, 2]) == [1, 2, 3, 3]
assert selection_sort([9, 8, 7, 6, 5]) == [5, 6, 7, 8, 9]
```

## Merge Sort

Merge sort is a divide-and-conquer algorithm. Split the list in half, recursively sort
each half, then merge the two sorted halves into one sorted list. The merge step is the
core operation: compare the front elements of each half, take the smaller one, and repeat.

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])    # append remaining elements from whichever half is non-empty
    result.extend(right[j:])
    return result

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))  # [3, 9, 10, 27, 38, 43, 82]
```

**CS lens:** Merge sort is O(n log n) guaranteed — best, average, and worst case.
The recursion depth is O(log n) because we halve the list at each level. At each level,
the merge step does O(n) work total across all merges at that level. O(log n) levels ×
O(n) work per level = O(n log n). This is optimal: any comparison-based sort requires
at least O(n log n) comparisons.

**SE lens:** Merge sort demonstrates the divide-and-conquer pattern: the problem is
reduced to independent subproblems, each solved recursively, with a combination step
that synthesises the results. The combination step (merge) is where the work happens —
the recursion just sets it up. This pattern recurs in parallel algorithms, external
sorting (when data does not fit in memory), and inversion counting.

## Challenge: merge two sorted lists

Write `merge_sorted(left, right)` that takes two sorted lists and returns a single
sorted list containing all elements from both. The input lists are already sorted.
Do not sort them — merge them in O(n + m) time where n and m are the lengths.

```challenge
def merge_sorted(left, right):
    pass
```

```test
assert merge_sorted([1, 3, 5], [2, 4, 6]) == [1, 2, 3, 4, 5, 6]
assert merge_sorted([], [1, 2, 3]) == [1, 2, 3]
assert merge_sorted([1, 2, 3], []) == [1, 2, 3]
assert merge_sorted([1, 5, 9], [2, 6, 10]) == [1, 2, 5, 6, 9, 10]
assert merge_sorted([1, 2], [1, 2]) == [1, 1, 2, 2]
```
