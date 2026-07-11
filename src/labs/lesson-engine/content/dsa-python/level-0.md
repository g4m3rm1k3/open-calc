---
series: dsa-python
level: 0
title: Lists & Indexing
lang: python
---

# Lists & Indexing

A list is Python's built-in dynamic array — an ordered, numbered sequence of values.
Every algorithm you write will use lists. This level teaches how to read from any
position, cut out any portion, and rearrange a list using Python's slice syntax —
the exact tools you need to rotate and deduplicate a list.

## List Indices

A list stores values at numbered positions called indices. The first position is index
`0`, not `1`. The last position is index `len(arr) - 1`. Negative indices count
backwards from the end: `-1` is the last element, `-2` is second-to-last. Counting
from both ends lets you access the last element without knowing the length.

```python
fruits = ["apple", "banana", "cherry", "date"]

print(fruits[0])     # "apple"  — first element, index 0
print(fruits[3])     # "date"   — last element, index 3
print(fruits[-1])    # "date"   — same element using negative index
print(fruits[-2])    # "cherry" — second from the end
print(len(fruits))   # 4        — number of elements
```

**CS lens:** Python stores lists as contiguous blocks of memory. To find element at
index `i`, Python computes `base_address + (i × element_size)` — a single arithmetic
operation. This is why index access is O(1) regardless of list size. Searching for a
value (`x in arr`) is different: Python scans from index 0 until it finds `x`, which
is O(n).

**SE lens:** Index 0 (zero-based indexing) is universal across C, Java, Python,
JavaScript, and most modern languages. The reason: if the list starts at memory address
`base`, element 0 is at offset `0 × size = 0` from base — the most natural formula.
One-based indexing would add a constant offset to every access.

## Slices — reading a portion of a list

A slice `arr[start:end]` returns a new list containing elements from index `start` up
to but not including index `end`. Omitting `start` means "from the beginning".
Omitting `end` means "to the end". A slice never modifies the original list.

```python
items = [10, 20, 30, 40, 50]

print(items[1:4])   # [20, 30, 40] — index 1, 2, 3 (not 4)
print(items[:3])    # [10, 20, 30] — from start up to index 3
print(items[2:])    # [30, 40, 50] — from index 2 to the end
```

`items[1:4]` is four characters (`1`, `:`, `4`) but specifies three elements. The
end index is exclusive — this is consistent with Python's `range(1, 4)` which also
excludes 4. Once you accept that slices and ranges share the same exclusive-end
convention, the mental model becomes consistent across the language.

**CS lens:** A slice copies elements into a new list. Creating `items[1:4]` allocates
new memory and copies three references into it — O(k) where k is the slice length.
The original list is untouched. This is different from languages where slices are
"views" into the original memory.

**SE lens:** Immutable operations that return new values (slices, `sorted()`) are
safer than in-place mutations when you need to keep the original. The cost is a copy;
the benefit is that callers cannot observe unexpected mutations to their data.

## Slice Concatenation — rearranging with `+`

Two lists can be joined with `+`, which returns a new list containing all elements of
the left list followed by all elements of the right. Combining slices with `+` lets
you rearrange a list without a loop.

The key insight for rotation: if you split a list at position `k`, the left part is
`arr[:k]` and the right part is `arr[k:]`. Putting the right part first gives you
`arr[k:] + arr[:k]` — every element shifted left by `k` positions.

```python
arr = [1, 2, 3, 4, 5]
k = 2

left  = arr[:k]           # [1, 2]       — first k elements
right = arr[k:]           # [3, 4, 5]    — everything after k

rotated = right + left    # [3, 4, 5, 1, 2] — right part first, then left
print(rotated)
```

`arr[k:]` reads: "give me everything from index k to the end". `arr[:k]` reads:
"give me everything from the start up to (not including) index k". Concatenating them
in the order `right + left` moves the first `k` elements to the back — a left rotation.

**CS lens:** Slice concatenation is O(n) — Python allocates a new list of length n
and copies every element into it. For rotation, this is the optimal cost: you must
read every element at least once to produce the output, so O(n) is the best possible.

**SE lens:** This one-liner replaces what would otherwise be a loop with index
arithmetic. Expressing the rotation as `arr[k:] + arr[:k]` names what it does —
"the right part followed by the left part". A loop with index math would require
the reader to reconstruct that meaning.

## Challenge: rotate left

Given a list `arr` and an integer `k`, return a new list that is `arr` rotated left
by `k` positions. Rotating left by `k` means the first `k` elements move to the end.
`[1, 2, 3, 4, 5]` rotated left by `2` becomes `[3, 4, 5, 1, 2]`.

If `k` is larger than the list length, wrap around using `k % len(arr)` — rotating
a 5-element list left by 7 is the same as rotating it left by 2.

```challenge
def rotate_left(arr, k):
    pass
```

```test
assert rotate_left([1, 2, 3, 4, 5], 2) == [3, 4, 5, 1, 2]
assert rotate_left([1, 2, 3, 4, 5], 0) == [1, 2, 3, 4, 5]
assert rotate_left([1, 2, 3, 4, 5], 5) == [1, 2, 3, 4, 5]
assert rotate_left([1, 2, 3], 4) == [2, 3, 1]
assert rotate_left([7], 3) == [7]
```

## Building a Result List

Many list problems are solved by the same pattern: start with an empty list, scan
the input, and selectively append elements to the result. The result grows one element
at a time. `x in result` checks whether `x` is already in the result list — Python
scans from index 0, so this is O(n).

```python
words = ["cat", "dog", "cat", "bird", "dog", "fish"]

seen = []
for word in words:
    if word not in seen:   # O(n) scan — is this word already collected?
        seen.append(word)  # no — add it for the first time

print(seen)  # ["cat", "dog", "bird", "fish"]
```

The order of the output matches the order of first appearances in the input. That is
not an accident — we scan left to right and append each new word when first seen.
If you need a different output order, you sort after collecting.

**CS lens:** `word not in seen` is O(n) on a list. For a list of 1 000 words where
every word is unique, this means 1 + 2 + 3 + ... + 999 ≈ 500 000 comparisons —
O(n²) total. Level 2 replaces `seen` with a `set`, which checks membership in O(1)
and reduces the whole algorithm to O(n). For now, the list version is correct and
readable.

**SE lens:** `result = []` followed by a loop and `result.append(x)` is the standard
"filter and collect" pattern in Python. It is used in every domain: filtering log
lines, deduplicating records, collecting matching database rows. Recognising the
pattern makes the intent obvious regardless of what `x` is.

## Challenge: remove duplicates preserving order

Given a list, return a new list with duplicates removed. Keep the first occurrence of
each value. Preserve the relative order of the remaining elements.
`[3, 1, 2, 1, 3]` becomes `[3, 1, 2]`.

Do not use a set — the `seen` list and `not in` check from this step are enough.

```challenge
def remove_duplicates(arr):
    pass
```

```test
assert remove_duplicates([3, 1, 2, 1, 3]) == [3, 1, 2]
assert remove_duplicates([1, 2, 3]) == [1, 2, 3]
assert remove_duplicates([1, 1, 1]) == [1]
assert remove_duplicates([]) == []
assert remove_duplicates([5, 3, 5, 2, 3]) == [5, 3, 2]
```
