---
series: python-fundamentals
level: 24
title: Sets
lang: python
---

# Sets

A set is an unordered collection of **unique** values. "Unordered" means there is no index — you cannot do `my_set[0]`. "Unique" means duplicates are automatically removed. Sets are the right data structure when you need to track membership, eliminate duplicates, or compare two collections.

## Creating Sets

```python
colours = {"red", "green", "blue", "red", "green"}
print(colours)
print(len(colours))

empty_set = set()
from_list = set([1, 2, 2, 3, 3, 3])
print(from_list)
```

```text
{'red', 'green', 'blue'}
3
{1, 2, 3}
```

`{}` with values (no colons) creates a set. Duplicates are silently removed. The order of elements in the output is not guaranteed — sets have no defined order.

`set()` (no arguments) creates an empty set. Use `set()` not `{}` because `{}` creates an empty dictionary.

`set(iterable)` converts any iterable to a set, removing duplicates.

**CS lens:** Sets are implemented as hash tables over values rather than key-value pairs. Membership testing (`value in set`) is O(1) — Python hashes the value and checks the bucket directly. This is why sets are preferred over lists for membership testing when you have many items: `value in large_list` is O(n), `value in large_set` is O(1).

## add() and remove()

`.add(value)` — adds a value. Does nothing if already present.
`.remove(value)` — removes a value. Raises `KeyError` if not present.
`.discard(value)` — removes a value. Does nothing if not present.

```python
visited_pages = set()

visited_pages.add("/home")
visited_pages.add("/about")
visited_pages.add("/home")
print(visited_pages)

visited_pages.discard("/contact")
print(len(visited_pages))
```

```text
{'/home', '/about'}
2
```

## in — O(1) Membership Testing

```python
valid_extensions = {".py", ".js", ".ts", ".html", ".css"}

filename = "app.py"
extension = filename[filename.rfind("."):]

print(extension in valid_extensions)
```

```text
True
```

`rfind(".")` — returns the index of the last occurrence of `"."`. `filename[index:]` — everything from that index to the end. The result is the file extension including the dot.

## Set Operations

Sets support the classic mathematical set operations:

```python
python_users = {"Alice", "Bob", "Charlie", "Diana"}
javascript_users = {"Bob", "Diana", "Eve", "Frank"}

both = python_users & javascript_users
either = python_users | javascript_users
python_only = python_users - javascript_users
either_not_both = python_users ^ javascript_users

print("Both:", both)
print("Either:", either)
print("Python only:", python_only)
print("One but not both:", either_not_both)
```

```text
Both: {'Bob', 'Diana'}
Either: {'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'}
Python only: {'Alice', 'Charlie'}
One but not both: {'Alice', 'Charlie', 'Eve', 'Frank'}
```

- `&` — intersection: values in both sets
- `|` — union: values in either set
- `-` — difference: values in the left set but not the right
- `^` — symmetric difference: values in one set but not both

Also available as methods: `.intersection()`, `.union()`, `.difference()`, `.symmetric_difference()`.

**SE lens:** Set operations express intent precisely. `active_users & premium_users` reads like a specification. The same logic written with loops and lists would take many more lines and be harder to verify correct.

## Deduplication

Converting a list to a set and back removes duplicates:

```python
raw_tags = ["python", "code", "python", "tutorial", "code", "python"]
unique_tags = list(set(raw_tags))
print(unique_tags)
```

```text
['code', 'tutorial', 'python']
```

Note: the order is not preserved. If order matters, use a different approach.

## Challenge: common_elements

Write a function `common_elements(list_a, list_b)` that returns a sorted list of values that appear in both `list_a` and `list_b`, with no duplicates.

Use set intersection to find common values, then convert to a sorted list.

`sorted(iterable)` — returns a sorted list (from Level 21).

```challenge
def common_elements(list_a, list_b):
    pass
```

```test
assert common_elements([1, 2, 3, 4], [3, 4, 5, 6]) == [3, 4]
assert common_elements([1, 2, 2, 3], [2, 2, 4]) == [2]
assert common_elements([1, 2, 3], [4, 5, 6]) == []
assert common_elements(["a", "b", "c"], ["b", "c", "d"]) == ["b", "c"]
assert common_elements([1, 1, 2, 2], [2, 2, 3, 3]) == [2]
```
