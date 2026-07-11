---
series: python-fundamentals
level: 21
title: List Methods
lang: python
---

# List Methods

A list is an object. Like strings, lists have methods — functions built into the object that you call with dot notation. Unlike string methods, which return new strings (because strings are immutable), most list methods **modify the list in place**.

## append() and extend() — Adding Elements

`.append(value)` — adds a single value to the end of the list.
`.extend(iterable)` — adds every element of an iterable to the end.

```python
languages = ["Python", "JavaScript"]

languages.append("TypeScript")
print(languages)

languages.extend(["Go", "Rust"])
print(languages)
```

```text
['Python', 'JavaScript', 'TypeScript']
['Python', 'JavaScript', 'TypeScript', 'Go', 'Rust']
```

`append` adds one item. `extend` adds many. `languages.append(["Go", "Rust"])` would add the list as a single element: `[..., ["Go", "Rust"]]` — not what you usually want.

## insert() — Adding at a Position

`.insert(index, value)` — inserts `value` before the element at `index`, shifting everything after it right:

```python
fruits = ["apple", "cherry", "date"]
fruits.insert(1, "banana")
print(fruits)
```

```text
['apple', 'banana', 'cherry', 'date']
```

## pop() and remove() — Removing Elements

`.pop(index)` — removes and returns the element at `index`. Default index is `-1` (the last element).
`.remove(value)` — removes the first occurrence of `value`. Raises `ValueError` if not found.

```python
stack = [1, 2, 3, 4, 5]

last = stack.pop()
print(f"Popped: {last}, List: {stack}")

stack.remove(3)
print(stack)
```

```text
Popped: 5, List: [1, 2, 3, 4]
[1, 2, 4]
```

**CS lens:** `.pop()` from the end is O(1) — the list just decrements its length and returns the last value. `.pop(0)` from the front is O(n) — every remaining element must shift left by one position. For queue-like operations that remove from the front frequently, use `collections.deque` instead.

## sort() and sorted()

`.sort()` — sorts the list in place. `sorted(iterable)` — returns a new sorted list without modifying the original.

```python
scores = [88, 92, 75, 95, 83]

scores.sort()
print(scores)

words = ["banana", "apple", "cherry"]
sorted_words = sorted(words)
print(words)
print(sorted_words)
```

```text
[75, 83, 88, 92, 95]
['banana', 'apple', 'cherry']
['apple', 'banana', 'cherry']
```

`.sort()` changed `scores` permanently. `sorted(words)` left `words` unchanged and returned a new list.

`.sort(reverse=True)` and `sorted(iterable, reverse=True)` sort in descending order.

**SE lens:** Use `sorted()` when you need the original list to survive unchanged. Use `.sort()` when the list is yours to modify and you want the efficiency of in-place sorting. This mutate-vs-copy distinction appears throughout Python — knowing which methods modify in place and which return new objects is essential.

## count() and index()

`.count(value)` — returns the number of times `value` appears.
`.index(value)` — returns the index of the first occurrence of `value`. Raises `ValueError` if not found.

```python
votes = ["yes", "no", "yes", "yes", "no", "yes"]

print(votes.count("yes"))
print(votes.count("no"))
print(votes.index("no"))
```

```text
4
2
1
```

## copy() — Shallow Copy

`.copy()` — returns a new list with the same elements:

```python
original = [1, 2, 3]
reference = original
copy = original.copy()

original.append(4)

print(original)
print(reference)
print(copy)
```

```text
[1, 2, 3, 4]
[1, 2, 3, 4]
[1, 2, 3]
```

`reference = original` makes both names point to the same list — a change to `original` is visible through `reference`. `.copy()` creates a new list with independent identity.

## Challenge: top_three

Write a function `top_three(scores)` that returns a list of the three highest scores in descending order.

The input is a list of integers with at least 3 elements. Do not modify the input list — work on a copy.

`sorted(iterable, reverse=True)` — returns a new list sorted in descending order.

Slicing `[:3]` returns the first three elements.

```challenge
def top_three(scores):
    pass
```

```test
assert top_three([88, 92, 75, 95, 83]) == [95, 92, 88]
assert top_three([1, 2, 3]) == [3, 2, 1]
assert top_three([5, 5, 5, 5]) == [5, 5, 5]
assert top_three([100, 0, 50, 75, 25]) == [100, 75, 50]
```
