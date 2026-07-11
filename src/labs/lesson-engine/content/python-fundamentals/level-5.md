---
series: python-fundamentals
level: 5
title: Variables
lang: python
---

# Variables

A variable is a name bound to a value. When you write `score = 100`, you are not creating a box and putting `100` in it — you are telling Python "the name `score` now refers to the integer object `100`." That distinction is not pedantic; it is the reason Python behaves the way it does when you assign one variable to another.

This lesson covers how Python names work, how to choose good names, and what happens in memory when you assign, reassign, and assign one variable to another.

## Assignment: Binding a Name to a Value

The `=` operator is the **assignment operator**. It evaluates the right side first, then binds the result to the name on the left.

```python
city = "Cape Town"
population = 4_600_000
area_km2 = 2_461.0
is_capital = False

print(city, "—", population, "people")
print("Area:", area_km2, "km²")
```

Four names, four values. Python stores the values and lets you use the names to refer to them later. The numbers use `_` as a thousands separator — Python ignores underscores in numeric literals, so `4_600_000` and `4600000` are identical. The underscore makes large numbers easier to read.

**CS lens:** A variable in Python is a reference — a pointer to an object in memory. The object has a type and a value. The variable has only a name. When you write `city = "Cape Town"`, Python creates a string object containing `"Cape Town"` and makes `city` point to it. Two variables can point to the same object. This is different from languages like C where a variable *is* the storage location.

## Naming Rules and Conventions

Python enforces rules for valid names and has conventions for readable ones.

**Rules (enforced by Python — violations are SyntaxErrors):**
```text
✓ letters, digits, underscores
✓ must not start with a digit
✗ no spaces, hyphens, or special characters
✗ cannot be a Python keyword (if, for, def, return, class, ...)
```

**Conventions (not enforced — violations are just bad style):**
```text
snake_case          for variables and functions:   user_name, total_price
SCREAMING_SNAKE     for constants:                 MAX_SIZE, PI
avoid abbreviations:  items_count not ic, not cnt
be specific:          monthly_revenue not amount, not value
```

```python
first_name = "Grace"
last_name = "Hopper"
birth_year = 1906
is_admiral = True

full_name = first_name + " " + last_name
age_in_2026 = 2026 - birth_year

print(full_name, "was born in", birth_year)
print("Age in 2026:", age_in_2026)
```

**SE lens:** A variable name is a communication to the next person who reads this code (often you, six months from now). `x = 1906` forces the reader to figure out what 1906 means. `birth_year = 1906` makes it obvious. The time spent writing a good name is recovered many times over in reading time.

## Rebinding: Reassigning a Variable

A name can be rebound to a new value at any time. The old value is not destroyed immediately — Python's garbage collector reclaims it when nothing else references it.

```python
temperature = 20
print("Morning:", temperature)

temperature = 35
print("Afternoon:", temperature)

temperature = temperature + 5
print("Evening:", temperature)
```

```text
Morning: 20
Afternoon: 35
Evening: 40
```

`temperature = temperature + 5` evaluates the right side first (`35 + 5 = 40`), then rebinds `temperature` to `40`. The old value `35` is gone from `temperature`, though the integer `35` may still exist in memory briefly.

**Enable Debug and step through this.** Watch `temperature` change value at each assignment. This is rebinding — the name moves to a new value, not the value inside a box changing.

## Multiple Assignment and Swap

Python lets you assign multiple names in one line using commas:

```python
latitude, longitude = 51.5074, -0.1278
print("London:", latitude, longitude)

first, second, third = "bronze", "silver", "gold"
print(first, second, third)
```

Swap two variables without a temporary variable using the same pattern:

```python
player_score = 100
opponent_score = 250

player_score, opponent_score = opponent_score, player_score

print("Player:", player_score)
print("Opponent:", opponent_score)
```

Python evaluates the right side completely before assigning — so both values are captured before either name is rebound.

## Challenge: swap_and_compute

Write a function `largest_minus_smallest(value_a, value_b)` that returns the difference between the larger and smaller of two numbers.

The result is always non-negative. `largest_minus_smallest(3, 10)` returns `7`. `largest_minus_smallest(10, 3)` also returns `7`.

You have not learned `if` yet. Use the fact that `abs(value)` returns the absolute value of a number — the distance from zero, always non-negative. `abs(-7)` returns `7`. `abs(7)` returns `7`.

`abs(value)` — returns the absolute value. `abs(-3)` → `3`. `abs(5)` → `5`.

```challenge
def largest_minus_smallest(value_a, value_b):
    pass
```

```test
assert largest_minus_smallest(3, 10) == 7
assert largest_minus_smallest(10, 3) == 7
assert largest_minus_smallest(0, 0) == 0
assert largest_minus_smallest(-5, 5) == 10
assert largest_minus_smallest(100, 100) == 0
```
