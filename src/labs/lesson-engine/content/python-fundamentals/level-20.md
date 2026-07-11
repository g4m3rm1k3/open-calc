---
series: python-fundamentals
level: 20
title: Lists
lang: python
---

# Lists

Imagine tracking five quiz scores without a list: `score1 = 88`, `score2 = 92`, `score3 = 75`, `score4 = 95`, `score5 = 83`. To compute the average, you write `(score1 + score2 + score3 + score4 + score5) / 5`. To support six scores, you add `score6` everywhere. To support any number of scores, the approach breaks completely — you cannot write a loop over five separate variable names.

A list solves this. It stores any number of values under a single name, in order, and lets you process all of them with a single loop. That is why lists exist: to turn "five separate things" into "one collection of things."

A list is an ordered, mutable sequence of values. "Ordered" means the values have positions (indices). "Mutable" means the list can be changed after creation — values can be added, removed, or replaced. This makes lists the opposite of strings, which are immutable sequences.

## Creating Lists

A list is created with square brackets, values separated by commas:

```python
temperatures = [22, 35, 18, 29, 41]
names = ["Ada", "Grace", "Linus"]
mixed = [1, "hello", 3.14, True]
empty_list = []

print(temperatures)
print(names)
print(len(temperatures))
```

```text
[22, 35, 18, 29, 41]
['Ada', 'Grace', 'Linus']
5
```

Lists can hold any type, including mixed types. In practice, lists usually hold items of the same type — mixing types makes the list harder to work with.

## Indexing and Slicing

Lists use the same indexing rules as strings (Level 8) — zero-based, negative indices count from the end:

```python
scores = [88, 92, 75, 95, 83]

print(scores[0])
print(scores[-1])
print(scores[1:4])
print(scores[:3])
```

```text
88
83
[92, 75, 95]
[88, 92, 75]
```

`scores[1:4]` — elements at indices 1, 2, 3 (not 4). Returns a new list.

## Mutability — Changing Elements

Unlike strings, you can change elements of a list after creation:

```python
temperatures = [22, 35, 18, 29, 41]
print(temperatures)

temperatures[2] = 20
print(temperatures)
```

```text
[22, 35, 18, 29, 41]
[22, 35, 20, 29, 41]
```

`temperatures[2] = 20` replaces the element at index 2. The list is modified in place — the same list object now has a different value at that position.

**CS lens:** Lists in Python are **dynamic arrays** — contiguous blocks of memory that can grow. When you change an element, Python writes the new value to that memory position. When you append an element, Python either writes to the next position (if space exists) or allocates a larger block and copies everything (amortized O(1) time).

## in — Membership Testing

`value in list` — returns `True` if the value appears anywhere in the list:

```python
allowed_colours = ["red", "green", "blue"]

print("red" in allowed_colours)
print("yellow" in allowed_colours)
print("green" not in allowed_colours)
```

```text
True
False
False
```

## Iterating Over Lists

`for` loops work naturally with lists (from Level 16):

```python
grades = [88, 92, 75, 95, 83]

total = 0
for grade in grades:
    total = total + grade

average = total / len(grades)
print(f"Average grade: {average:.1f}")
```

```text
Average grade: 86.6
```

## enumerate() — Index and Value Together

`enumerate(iterable)` — yields `(index, value)` pairs, letting you access both the position and the value in one loop:

```python
podium = ["Gold", "Silver", "Bronze"]

for position, medal in enumerate(podium):
    print(f"{position + 1}. {medal}")
```

```text
1. Gold
2. Silver
3. Bronze
```

`enumerate(podium)` produces `(0, "Gold")`, `(1, "Silver")`, `(2, "Bronze")`. The `position, medal = ...` assignment unpacks each tuple.

## Nested Lists

A list can contain other lists:

```python
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

print(matrix[1])
print(matrix[1][2])
```

```text
[4, 5, 6]
6
```

`matrix[1]` — the second row (a list). `matrix[1][2]` — the element at row 1, column 2.

## Challenge: reverse_list

Write a function `reverse_list(items)` that returns a new list with the elements in reverse order.

Do not modify the original list — build a new one. Use a `for` loop with `range(len(items) - 1, -1, -1)` to iterate backwards, or build the result by prepending to a new list.

`range(start, stop, step)` with a negative step (from Level 17) counts downward.

```challenge
def reverse_list(items):
    pass
```

```test
assert reverse_list([1, 2, 3]) == [3, 2, 1]
assert reverse_list([]) == []
assert reverse_list([42]) == [42]
assert reverse_list(["a", "b", "c"]) == ["c", "b", "a"]
assert reverse_list([1, 2, 3, 4, 5]) == [5, 4, 3, 2, 1]
```
