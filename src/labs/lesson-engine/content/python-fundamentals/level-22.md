---
series: python-fundamentals
level: 22
title: Tuples
lang: python
---

# Tuples

A tuple is an ordered, **immutable** sequence. It looks like a list but uses parentheses and cannot be changed after creation. Where a list represents a collection of similar things (a list of scores, a list of names), a tuple represents a fixed group of related but different things (a coordinate `(x, y)`, a person `(name, age)`, a result `(value, error)`).

## Creating Tuples

```python
coordinates = (51.5074, -0.1278)
person = ("Ada Lovelace", 1815, "mathematician")
rgb_colour = (255, 128, 0)
single = (42,)
empty = ()

print(coordinates)
print(person[0])
print(len(rgb_colour))
```

```text
(51.5074, -0.1278)
Ada Lovelace
3
```

The comma is what makes a tuple — `(42)` is just `42` in parentheses (an integer). `(42,)` is a one-element tuple. Parentheses are optional: `coordinates = 51.5074, -0.1278` creates the same tuple.

## Immutability

Tuples cannot be modified after creation:

```python
point = (3, 4)
point[0] = 10
```

```text
TypeError: 'tuple' object does not support item assignment
```

This is intentional. A tuple's immutability signals to the reader: "these values belong together and should not change." If you need to change them, use a list.

**CS lens:** Immutability makes tuples **hashable** — they can be used as dictionary keys (Level 23) and stored in sets (Level 24). Lists cannot. This is because a hash function must produce the same value every time it is called on an object. A mutable object's value can change, making its hash unreliable.

## Tuple Unpacking

Tuple unpacking assigns each element to a separate variable in one line:

```python
location = ("Cape Town", -33.9, 18.4)

city_name, latitude, longitude = location

print(f"{city_name}: {latitude}, {longitude}")
```

```text
Cape Town: -33.9, 18.4
```

The number of variables must match the number of elements. Unpacking is used constantly — function return values, `enumerate()` in `for` loops, and `dict.items()` all produce tuples that are unpacked this way.

## When to Use Tuple vs List

```text
Use a list when:                  Use a tuple when:
  Items are similar type            Items are different types
  Collection can grow/shrink        Group is fixed and related
  Order is not semantic             Order has meaning (x before y)
  Items can change                  Items should not change
  e.g. [score1, score2, score3]    e.g. (name, age, role)
```

```python
scores = [88, 92, 75]
employee = ("Ada", 35, "Engineer")

scores.append(95)
print(scores)
print(employee)
```

```text
[88, 92, 75, 95]
('Ada', 35, 'Engineer')
```

`scores` grows. `employee` stays fixed. Both are correct uses of their respective types.

## Returning Multiple Values

Functions "returning multiple values" actually return a tuple:

```python
def statistics(numbers):
    total = sum(numbers)
    count = len(numbers)
    average = total / count
    return average, min(numbers), max(numbers)

avg, low, high = statistics([88, 92, 75, 95, 83])
print(f"Average: {avg:.1f}, Low: {low}, High: {high}")
```

```text
Average: 86.6, Low: 75, High: 95
```

`sum(iterable)` — returns the sum of all elements. The tuple `(average, min, max)` is created automatically by the comma in `return average, min(...), max(...)`.

## Challenge: parse_rgb

Write a function `parse_rgb(hex_colour)` that parses a hex colour string like `"#FF8000"` and returns a tuple `(red, green, blue)` of integers.

A hex colour is `#RRGGBB` where each pair is a two-digit hexadecimal number.

`hex_colour[1:3]` — the red part (characters 1 and 2, skipping `#`).
`int(hex_string, 16)` — converts a hexadecimal string to an integer. `int("FF", 16)` → `255`.

```challenge
def parse_rgb(hex_colour):
    pass
```

```test
assert parse_rgb("#FF0000") == (255, 0, 0)
assert parse_rgb("#00FF00") == (0, 255, 0)
assert parse_rgb("#0000FF") == (0, 0, 255)
assert parse_rgb("#FF8000") == (255, 128, 0)
assert parse_rgb("#000000") == (0, 0, 0)
```
