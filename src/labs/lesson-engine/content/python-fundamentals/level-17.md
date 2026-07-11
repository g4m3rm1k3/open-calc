---
series: python-fundamentals
level: 17
title: range()
lang: python
---

# range()

`range()` generates a sequence of integers. It is the standard tool for repeating something a specific number of times, iterating over indices, and producing arithmetic sequences. It appeared briefly in Level 16 — this lesson gives it the full treatment.

## range(stop)

`range(stop)` generates integers from `0` up to (but not including) `stop`:

```python
for number in range(6):
    print(number)
```

```text
0
1
2
3
4
5
```

Six numbers, starting at `0`. The stop value is not included — this is the same "up to but not including" rule as string slicing.

## range(start, stop)

`range(start, stop)` generates integers from `start` up to (but not including) `stop`:

```python
for year in range(2020, 2027):
    print(year)
```

```text
2020
2021
2022
2023
2024
2025
2026
```

Seven values. `2027` is excluded.

## range(start, stop, step)

`range(start, stop, step)` generates integers starting at `start`, incrementing by `step`, stopping before `stop`:

```python
for even in range(0, 11, 2):
    print(even)
```

```text
0
2
4
6
8
10
```

`step=2` means "increment by 2 each time." Negative steps count downward:

```python
for countdown in range(10, 0, -1):
    print(countdown)
```

```text
10
9
8
7
6
5
4
3
2
1
```

**CS lens:** `range()` does not store all the integers in memory. It is a **lazy generator** — it computes the next value on demand. `range(1_000_000)` uses the same tiny amount of memory as `range(10)`, because it generates values one at a time as the loop requests them. This is fundamentally different from creating a list of a million integers.

## list(range()) — Seeing the Values

To see a `range()` as a list, wrap it in `list()`:

```python
print(list(range(5)))
print(list(range(2, 8)))
print(list(range(0, 20, 5)))
print(list(range(10, 0, -3)))
```

```text
[0, 1, 2, 3, 4]
[2, 3, 4, 5, 6, 7]
[0, 5, 10, 15]
[10, 7, 4, 1]
```

`list(iterable)` — converts any iterable into a list. The result is the same sequence of values the `for` loop would have seen.

## Iterating with Indices

Sometimes you need both the index and the value while iterating. One approach:

```python
fruits = ["apple", "banana", "cherry"]

for index in range(len(fruits)):
    print(f"{index}: {fruits[index]}")
```

```text
0: apple
1: banana
2: cherry
```

`range(len(fruits))` generates `0, 1, 2` — the valid indices for the list. `fruits[index]` retrieves the value at each index.

A cleaner approach uses `enumerate()` (introduced in Level 20), but `range(len(...))` is valid and commonly seen.

## Challenge: multiplication_table

Write a function `multiplication_table(number, up_to)` that returns the sum of `number * 1` through `number * up_to`.

Example: `multiplication_table(3, 4)` computes `3*1 + 3*2 + 3*3 + 3*4 = 3 + 6 + 9 + 12 = 30`.

Use `range(1, up_to + 1)` to iterate from `1` to `up_to` inclusive. Accumulate the products.

```challenge
def multiplication_table(number, up_to):
    pass
```

```test
assert multiplication_table(3, 4) == 30
assert multiplication_table(1, 10) == 55
assert multiplication_table(5, 5) == 75
assert multiplication_table(0, 100) == 0
assert multiplication_table(2, 1) == 2
```
