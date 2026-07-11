---
series: dsa-python
level: 2
title: Hash Maps & Sets
lang: python
---

# Hash Maps & Sets

A hash map stores key-value pairs. A set stores unique values. Both give you O(1)
lookup, insertion, and deletion on average — far faster than scanning a list. Recognising
when a problem needs a hash map or set is one of the highest-leverage pattern-recognition
skills in algorithm design.

## Hash Maps: dict

Python's `dict` is a hash map. It stores key-value pairs and lets you retrieve a value
by its key in O(1) time on average. Under the hood, Python computes a hash of the key
— a number derived from the key's content — and uses it to find the storage slot
directly, without scanning.

```python
word_count = {}

words = ["the", "quick", "the", "brown", "the", "fox"]
for word in words:
    if word in word_count:
        word_count[word] += 1
    else:
        word_count[word] = 1

print(word_count)
# {"the": 3, "quick": 1, "brown": 1, "fox": 1}
```

**CS lens:** This is the frequency table pattern — a hash map from value to count.
It appears in counting characters, words, elements, and frequencies of any kind.
`word in word_count` is an O(1) hash lookup; the same check on a list would be O(n).

**SE lens:** `dict.get(key, default)` is the idiomatic way to avoid the
"check then set" pattern above. `word_count.get(word, 0) + 1` reads: "give me the
current count for this word, or 0 if I have not seen it yet."

```python
word_count = {}
for word in ["the", "quick", "the", "brown", "the", "fox"]:
    word_count[word] = word_count.get(word, 0) + 1

print(word_count)  # {"the": 3, "quick": 1, "brown": 1, "fox": 1}

# Dict methods
print(word_count.keys())    # all keys
print(word_count.values())  # all values
print(word_count.items())   # all (key, value) pairs
print("fox" in word_count)  # True  — O(1) key lookup
```

## Challenge: two sum

Given a list of integers and a target, return the indices of the two numbers that
add up to the target. Each input has exactly one solution and you may not use the
same element twice.

Store each number and its index in a hash map as you scan. For each number, check
whether `target - number` is already in the map. If it is, you have found the pair.
This is O(n) — one pass, one lookup per element.

```challenge
def two_sum(arr, target):
    pass
```

```test
assert two_sum([2, 7, 11, 15], 9) == [0, 1]
assert two_sum([3, 2, 4], 6) == [1, 2]
assert two_sum([3, 3], 6) == [0, 1]
assert two_sum([1, 5, 3, 7], 8) == [1, 3]
```

## Sets: unique membership in O(1)

A `set` is a hash map with no values — only keys. It answers one question in O(1):
"have I seen this before?" Use it wherever you need to track membership without
caring about counts or order.

```python
seen = set()

for value in [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]:
    if value in seen:
        print(f"{value} is a duplicate")
    else:
        seen.add(value)

# 1 is a duplicate
# 5 is a duplicate
# 3 is a duplicate
```

**CS lens:** A set is backed by the same hash table as a dict. `value in seen` is O(1)
because Python hashes `value`, finds the slot, and checks — no iteration. The same
check on a list is O(n) because Python has to scan from the beginning.

**SE lens:** Replacing a list with a set for membership testing is one of the most
common O(n²) → O(n) transformations. Any time you write `if x in some_list` inside
a loop, ask whether `some_list` should be a set.

Sets support the standard mathematical operations. These are also O(n) or O(min(m,n)):

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a & b)  # {3, 4}       — intersection: elements in both
print(a | b)  # {1,2,3,4,5,6} — union: elements in either
print(a - b)  # {1, 2}       — difference: in a but not b
print(a ^ b)  # {1,2,5,6}    — symmetric difference: in one but not both
```

## Challenge: first unique element

Given a list of integers, return the first element that appears exactly once.
If no such element exists, return -1.

Use a hash map to count occurrences in one pass. Then scan the original list in order
and return the first element whose count is exactly 1. The order of the second scan
matters — you must return the first unique element in the original order, not any
unique element.

```challenge
def first_unique(arr):
    pass
```

```test
assert first_unique([3, 3, 4, 4, 5]) == 5
assert first_unique([1, 2, 3]) == 1
assert first_unique([7, 7, 8, 8]) == -1
assert first_unique([1]) == 1
assert first_unique([9, 3, 9, 3, 6]) == 6
```
