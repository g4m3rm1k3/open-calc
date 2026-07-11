---
series: dsa-python
level: 6
title: Binary Search
lang: python
---

# Binary Search

Binary search finds a target value in a sorted sequence in O(log n) time by halving
the search space at every step. Searching a million elements takes at most 20 comparisons.
The same idea — eliminate half the candidates per step — applies far beyond sorted arrays:
finding the first/last position of a value, searching on answer space, and minimizing
costs that vary monotonically.

## The Core Algorithm

Binary search maintains a window `[left, right]` that always contains the target if
it exists. Each iteration reads the midpoint, decides which half of the window cannot
contain the target, and discards that half. When `left > right`, the window is empty
and the target is not present.

```python
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2   # integer midpoint — no overflow risk in Python
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1    # target is in the right half
        else:
            right = mid - 1   # target is in the left half
    return -1   # target not found

nums = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(nums, 7))   # 3  (index of 7)
print(binary_search(nums, 6))   # -1 (6 is not in the list)
```

**CS lens:** The invariant is: if `target` is in `arr`, it is in `arr[left..right]`.
Each iteration either finds the target or shrinks the window by at least half. After
k iterations, the window is at most `n / 2^k` elements wide. When `n / 2^k < 1`,
the loop ends — this happens after at most `log₂(n)` iterations.

**SE lens:** `mid = (left + right) // 2` avoids integer overflow. In Java or C, adding
two large indices can overflow a 32-bit integer. Python integers are arbitrary precision
so there is no overflow, but the formula `left + (right - left) // 2` is worth knowing
as a language-agnostic habit. The formula `(left + right) // 2` is cleaner in Python.

Binary search requires that the array is sorted. If you find yourself writing binary
search on an unsorted array, either sort it first (O(n log n)), or reach for a different
data structure. The performance guarantee only holds for sorted input.

```python
def search_insert_position(arr, target):
    # Return the index where target is found, or where it would be inserted.
    left = 0
    right = len(arr)
    while left < right:
        mid = (left + right) // 2
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left

print(search_insert_position([1, 3, 5, 6], 5))  # 2  (found at 2)
print(search_insert_position([1, 3, 5, 6], 2))  # 1  (would insert at 1)
print(search_insert_position([1, 3, 5, 6], 7))  # 4  (would insert at end)
```

## Challenge: binary search

Write `binary_search(arr, target)` that returns the index of `target` in the sorted
list `arr`, or `-1` if `target` is not present. The function must run in O(log n) time —
do not use `arr.index()` or any linear scan.

```challenge
def binary_search(arr, target):
    pass
```

```test
assert binary_search([1, 3, 5, 7, 9], 5) == 2
assert binary_search([1, 3, 5, 7, 9], 1) == 0
assert binary_search([1, 3, 5, 7, 9], 9) == 4
assert binary_search([1, 3, 5, 7, 9], 6) == -1
assert binary_search([], 5) == -1
assert binary_search([42], 42) == 0
```

## Finding Boundaries

Many binary search problems ask for the first or last position of a value — not just
any occurrence. The key change: when you find the target, do not stop. Record the
position and continue searching in one direction.

To find the first occurrence: when `arr[mid] == target`, record `mid` and set
`right = mid - 1` (continue searching left). To find the last: record `mid` and set
`left = mid + 1` (continue searching right).

```python
def first_occurrence(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            result = mid       # candidate found — but keep searching left
            right = mid - 1
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return result

def last_occurrence(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            result = mid        # candidate found — but keep searching right
            left = mid + 1
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return result

nums = [1, 2, 2, 2, 3, 4]
print(first_occurrence(nums, 2))   # 1
print(last_occurrence(nums, 2))    # 3
```

**CS lens:** This is the left-boundary / right-boundary variant of binary search.
The invariant changes: `result` holds the best candidate found so far. The search
continues past the first match to see if a better (earlier or later) match exists.
This is a common pattern — you will see it in search engines (find the first document
matching a query) and database indices (find the first row with a given key).

**SE lens:** Both functions share the same structure: only the line that updates
`result` and the next search direction differ. When two algorithms differ in one line,
extract that line into a parameter or a flag rather than duplicating the entire function.
Here, a single boolean `find_first` would unify them.

## Challenge: search range

Given a sorted list of integers and a target, return `[first, last]` where `first` is
the index of the first occurrence of target and `last` is the index of the last
occurrence. If the target is not in the list, return `[-1, -1]`.

```challenge
def search_range(arr, target):
    pass
```

```test
assert search_range([5, 7, 7, 8, 8, 10], 8) == [3, 4]
assert search_range([5, 7, 7, 8, 8, 10], 7) == [1, 2]
assert search_range([5, 7, 7, 8, 8, 10], 6) == [-1, -1]
assert search_range([1], 1) == [0, 0]
assert search_range([], 5) == [-1, -1]
assert search_range([2, 2, 2, 2], 2) == [0, 3]
```
