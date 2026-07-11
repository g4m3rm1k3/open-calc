---
series: python-fundamentals
level: 13
title: Comparisons & Booleans
lang: python
---

# Comparisons & Booleans

A program that only runs instructions in sequence is not very powerful. To make decisions — do this if the user is logged in, repeat this until the list is empty — the program needs to compare values and get a yes or no answer. That yes or no is a **boolean**: `True` or `False`.

## The Comparison Operators

Six operators compare two values and return a boolean:

```python
score = 85
passing_grade = 60

print(score > passing_grade)
print(score < passing_grade)
print(score >= 85)
print(score <= 84)
print(score == 85)
print(score != 85)
```

```text
True
False
True
False
True
False
```

- `>` — strictly greater than
- `<` — strictly less than
- `>=` — greater than or equal to
- `<=` — less than or equal to
- `==` — equal to (two equals signs — `=` is assignment, `==` is comparison)
- `!=` — not equal to

**The most common beginner mistake:** using `=` instead of `==` in a comparison. `score = 85` assigns. `score == 85` compares.

## Comparing Strings

Comparison operators work on strings too, using alphabetical (lexicographic) order:

```python
print("apple" == "apple")
print("apple" == "Apple")
print("banana" > "apple")
print("cat" < "dog")
```

```text
True
False
True
True
```

`"apple" == "Apple"` is `False` — Python comparisons are case-sensitive. `"banana" > "apple"` is `True` because `"b"` comes after `"a"` in Unicode order.

## Logical Operators: and, or, not

Combine multiple comparisons with `and`, `or`, and `not`:

```python
age = 25
has_license = True
speed_kmh = 110
speed_limit = 120

is_legal_driver = age >= 18 and has_license
is_speeding = speed_kmh > speed_limit
is_not_speeding = not is_speeding

print(is_legal_driver)
print(is_speeding)
print(is_not_speeding)
```

```text
True
False
True
```

- `a and b` — `True` only if both `a` and `b` are `True`
- `a or b` — `True` if at least one of `a` or `b` is `True`
- `not a` — inverts the boolean: `not True` → `False`, `not False` → `True`

**CS lens:** `and` and `or` use **short-circuit evaluation** — Python stops evaluating as soon as the result is determined. For `a and b`, if `a` is `False`, `b` is never evaluated (the result is already `False`). For `a or b`, if `a` is `True`, `b` is never evaluated. This matters when `b` has side effects or is expensive to compute.

## Truthiness — Every Value Has a Boolean Interpretation

`bool(value)` converts any value to `True` or `False`. This is called the value's **truthiness**:

```python
print(bool(0))
print(bool(42))
print(bool(""))
print(bool("hello"))
print(bool(None))
```

```text
False
True
False
True
False
```

**Falsy values:** `0`, `0.0`, `""` (empty string), `[]` (empty list), `{}` (empty dict/set), `None`.
**Everything else is truthy.**

`None` — Python's null value. It represents the absence of a value. A function that does not explicitly return something returns `None`.

## Chained Comparisons

Python allows chaining comparisons, which reads like natural language:

```python
temperature = 22
heart_rate = 75

is_comfortable = 18 <= temperature <= 26
is_healthy_hr = 60 <= heart_rate <= 100

print(is_comfortable)
print(is_healthy_hr)
```

```text
True
True
```

`18 <= temperature <= 26` is equivalent to `18 <= temperature and temperature <= 26` — Python checks both conditions.

## Challenge: is_leap_year

Write a function `is_leap_year(year)` that returns `True` if the year is a leap year, `False` otherwise.

A year is a leap year if:
- it is divisible by 4, **and**
- it is **not** divisible by 100, **or** it is divisible by 400.

In other words: every 4 years is a leap year, except century years (divisible by 100), unless also divisible by 400.

`year % 4 == 0` — `True` if `year` is divisible by 4 (remainder is zero).

Combine the conditions with `and`, `or`, `not`. You do not need `if`.

```challenge
def is_leap_year(year):
    pass
```

```test
assert is_leap_year(2000) == True
assert is_leap_year(1900) == False
assert is_leap_year(2024) == True
assert is_leap_year(2023) == False
assert is_leap_year(1600) == True
```
