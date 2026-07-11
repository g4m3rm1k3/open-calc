---
series: python-fundamentals
level: 18
title: Functions
lang: python
---

# Functions

A function is a named, reusable block of code. You have written functions since Level 0 — `def introduce(name, language): return ...` — but they have always been containers for the test harness. This lesson explains what functions actually are: why they exist, how parameters and return values work, how default arguments save repetition, and what happens when a function does not return anything.

## Why Functions Exist

Without functions, every program is a flat sequence of instructions. When you need to do the same thing twice, you repeat the code. When you need to change how that thing works, you change it in every place. Functions solve both problems.

```python
def circle_area(radius):
    return 3.14159 * radius ** 2

small_area = circle_area(5)
large_area = circle_area(20)
unit_area = circle_area(1)

print(f"Small: {small_area:.2f}")
print(f"Large: {large_area:.2f}")
print(f"Unit:  {unit_area:.2f}")
```

```text
Small: 78.54
Large: 1256.64
Unit:  3.14
```

`circle_area` is called three times with different inputs. The formula lives in one place. If `3.14159` were wrong, you would fix it once.

**SE lens:** This is the **DRY principle** — Don't Repeat Yourself. Every piece of knowledge has exactly one representation in a codebase. Functions are the primary tool for eliminating duplication in logic.

## Parameters and Arguments

A **parameter** is the name in the function definition. An **argument** is the value passed when calling the function:

```python
def greet(first_name, title):
    return f"Hello, {title} {first_name}."

print(greet("Ada", "Dr."))
print(greet("Grace", "Admiral"))
```

```text
Hello, Dr. Ada.
Hello, Admiral Grace.
```

`first_name` and `title` are parameters — they exist only inside the function. `"Ada"` and `"Dr."` are arguments — values passed at the call site. Arguments are matched to parameters left to right.

## Default Arguments

A parameter can have a default value, used when the caller does not provide that argument:

```python
def power(base, exponent=2):
    return base ** exponent

print(power(3))
print(power(3, 3))
print(power(2, 10))
```

```text
9
27
1024
```

`exponent=2` means "if the caller does not provide `exponent`, use `2`." `power(3)` uses the default and computes `3²`. `power(3, 3)` overrides it and computes `3³`.

Parameters with defaults must come after parameters without defaults — `def f(a=1, b)` is a `SyntaxError`.

## Return Values

`return` sends a value back to the caller and immediately exits the function. A function can return any type:

```python
def classify_score(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    else:
        return "F"

print(classify_score(95))
print(classify_score(83))
print(classify_score(65))
```

```text
A
B
F
```

Each `return` exits the function at that point. As soon as `return "A"` executes, the function is done — the remaining `elif` and `else` branches are never checked.

## Functions That Return Nothing

A function without a `return` statement implicitly returns `None`:

```python
def print_banner(message):
    print("=" * len(message))
    print(message)
    print("=" * len(message))

result = print_banner("Hello")
print(f"Return value: {result}")
```

```text
========
Hello
========
Return value: None
```

`print_banner` prints but does not return. Assigning its result gives `None`. Functions that perform actions (printing, writing files) often return `None`. Functions that compute values should always return the result.

**CS lens:** This distinction — functions that **compute** values vs functions that **perform** actions — is the difference between **pure functions** and **procedures**. Pure functions always return a value and have no side effects (they do not change anything outside themselves). Pure functions are easier to test, easier to reason about, and easier to compose. Every challenge in this series tests pure functions for exactly this reason.

## Multiple Return Values

Python functions can return multiple values as a **tuple** (Level 22) — multiple values packed together:

```python
def min_and_max(values_list):
    smallest = values_list[0]
    largest = values_list[0]
    for value in values_list:
        if value < smallest:
            smallest = value
        if value > largest:
            largest = value
    return smallest, largest

low, high = min_and_max([3, 1, 4, 1, 5, 9, 2, 6])
print(f"Min: {low}, Max: {high}")
```

```text
Min: 1, Max: 9
```

`return smallest, largest` returns both values. `low, high = min_and_max(...)` unpacks them into two separate variables.

## Challenge: fizzbuzz

Write a function `fizzbuzz(number)` that returns:
- `"FizzBuzz"` if the number is divisible by both 3 and 5
- `"Fizz"` if divisible by 3 only
- `"Buzz"` if divisible by 5 only
- The number as a string otherwise

Check the combined case first — if you check divisibility by 3 first and return `"Fizz"`, you will never reach the `"FizzBuzz"` case for multiples of 15.

`str(value)` — converts an integer to its string representation.

```challenge
def fizzbuzz(number):
    pass
```

```test
assert fizzbuzz(15) == "FizzBuzz"
assert fizzbuzz(3) == "Fizz"
assert fizzbuzz(5) == "Buzz"
assert fizzbuzz(7) == "7"
assert fizzbuzz(30) == "FizzBuzz"
assert fizzbuzz(1) == "1"
```
