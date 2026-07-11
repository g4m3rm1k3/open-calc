---
series: python-fundamentals
level: 11
title: Comments
lang: python
---

# Comments

A comment is text in your source code that Python ignores completely. Its only reader is a human. That makes comments a communication tool, not a technical one — and like all communication tools, they can be used well or badly.

Most beginners write too many comments and explain the wrong things. Most experienced developers write fewer comments and explain the right things. This lesson teaches the difference.

## The # Comment

Any text after `#` on a line is a comment. Python skips it entirely when executing:

```python
speed_of_light = 299_792_458
earth_radius_km = 6_371

circumference = 2 * 3.14159 * earth_radius_km
print(f"Earth circumference: {circumference:.0f} km")
```

These four lines need no comments. The names `speed_of_light`, `earth_radius_km`, and `circumference` say exactly what they are. Adding `# speed of light` next to the first line adds nothing a reader cannot already see.

**SE lens:** A comment that repeats what the code says is noise. Reading noise costs attention. The goal of a comment is to convey information the code cannot — the WHY, the non-obvious constraint, the gotcha. If a comment could be deleted without the reader losing any understanding, delete it.

## What Comments Are For

**The why — not the what:**

```python
CACHE_TTL_SECONDS = 300

items_per_page = 20

MAX_RETRIES = 3
```

These constants need comments explaining why these specific values were chosen:

```python
CACHE_TTL_SECONDS = 300  # matches the CDN's minimum TTL; shorter values cause cache thrashing

items_per_page = 20  # user research showed 20 items before "load more" maximises scroll depth

MAX_RETRIES = 3  # vendor API rejects clients that retry more than 5 times in 60 seconds
```

Now the comments earn their place. A future developer changing `CACHE_TTL_SECONDS` to `60` needs to know about the CDN constraint. Without the comment, they would not.

**Warnings and surprises:**

```python
birthday = "1815-12-10"
year = int(birthday.split("-")[0])
```

A comment here is warranted:

```python
birthday = "1815-12-10"
year = int(birthday.split("-")[0])  # assumes ISO 8601 format — will break on "10/12/1815"
```

That single comment prevents a future bug.

## Docstrings

A **docstring** is a string literal (not a `#` comment) placed as the first statement of a function, class, or module. It describes what the function does, its parameters, and what it returns.

```python
def celsius_to_fahrenheit(celsius):
    """Convert a temperature from Celsius to Fahrenheit.

    celsius — the temperature in degrees Celsius (float or int)
    Returns the equivalent temperature in Fahrenheit as a float.
    """
    return (celsius * 9 / 5) + 32

print(celsius_to_fahrenheit(100))
```

Docstrings are accessible at runtime via `help(function_name)` or `function.__doc__`. This makes them part of Python's built-in documentation system — unlike `#` comments, which disappear at runtime.

**The contract**: a good docstring describes the function's **contract** — what callers must provide and what they will receive. It does not describe the implementation. How the function works is secondary. What it guarantees is primary.

## Commented-Out Code

The worst kind of comment is code that has been commented out:

```python
# old_calculation = value * 1.15
result = value * 1.18
# result = apply_discount(result)
```

This creates questions with no answers: Why was the old calculation removed? Is it coming back? Is the discount coming back? Use version control (git) to track what changed and why. Commented-out code is a sign that git is not being used — not a feature.

## Challenge: annotate_calculation

Write a function `hypotenuse(leg_a, leg_b)` that returns the length of the hypotenuse of a right triangle given the two legs.

The Pythagorean theorem: `c = √(a² + b²)`, implemented as `(leg_a**2 + leg_b**2) ** 0.5`.

Write the function with a docstring that describes: what it computes, what the parameters are, and what it returns. The docstring is not tested — only the return value is — but write it anyway.

```challenge
def hypotenuse(leg_a, leg_b):
    """Write your docstring here."""
    pass
```

```test
assert hypotenuse(3, 4) == 5.0
assert hypotenuse(5, 12) == 13.0
assert hypotenuse(0, 5) == 5.0
assert round(hypotenuse(1, 1), 5) == round(2 ** 0.5, 5)
assert hypotenuse(8, 15) == 17.0
```
