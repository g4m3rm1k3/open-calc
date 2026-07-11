---
series: python-fundamentals
level: 29
title: Testing
lang: python
---

A test is code that checks whether other code does what it is supposed to do. Without tests, bugs surface when users find them. With tests, bugs surface the moment you write them. Every challenge in this series has been a test — this lesson explains the underlying thinking: what makes a good test, how to structure tests, and how to choose which cases to cover.

## assert — The Testing Primitive

`assert condition` raises `AssertionError` if the condition is `False`, and does nothing if it is `True`:

```python
def celsius_to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32

assert celsius_to_fahrenheit(0) == 32.0
assert celsius_to_fahrenheit(100) == 212.0
assert celsius_to_fahrenheit(-40) == -40.0
print("All assertions passed.")
```

```text
All assertions passed.
```

If any assertion fails, the program stops and prints the line number where it failed. The `print` only runs if every assertion before it passed.

`assert` is for verifying correctness of code, not for validating user input. Use `raise` (Level 26) for input validation. `assert` statements can be disabled globally with `python -O` — user-visible error handling must never rely on `assert`.

## What a Good Test Checks

A test must check the **contract** — the relationship between inputs and outputs — not the implementation. Two completely different correct implementations must both pass the same tests.

```text
Weak test:   Checks one typical input
Strong test: Checks zero/identity, typical, and boundary inputs
```

Every function needs at least three kinds of test inputs:

```text
Zero / identity   the empty string, zero, empty list, None
Typical           a representative input that exercises the main logic
Boundary / edge   largest, smallest, off-by-one, or surprising input
```

```python
def count_chars(text):
    return len(text)

assert count_chars("") == 0          # zero/identity
assert count_chars("hello") == 5     # typical
assert count_chars("a") == 1         # boundary (shortest non-empty)
assert count_chars("ab cd") == 5     # edge (space counts as a character)
```

```text
(no output — all assertions passed silently)
```

## Test Functions

Group related assertions into a function named `test_<what_is_being_tested>`. Run it immediately after defining it:

```python
def is_even(number):
    return number % 2 == 0

def test_is_even():
    assert is_even(0) == True
    assert is_even(2) == True
    assert is_even(7) == False
    assert is_even(-4) == True
    assert is_even(1) == False

test_is_even()
print("test_is_even passed.")
```

```text
test_is_even passed.
```

Grouping tests in a function gives the failure a name. When `AssertionError` occurs, the traceback shows `test_is_even` — you know immediately which function is broken, not just which line.

**CS lens:** This pattern is the foundation of every testing framework. `pytest` — the standard Python testing tool — discovers functions named `test_*` automatically and runs them. The `assert` statements inside are identical to what you write manually. `pytest` adds better failure messages (it shows the actual vs expected values), automatic discovery, and test reporting. You have been writing `pytest`-compatible tests throughout this series.

## Testing with Floating Point

Floating-point arithmetic is not exact. Never use `==` to compare floats from computation:

```python
def average(numbers):
    return sum(numbers) / len(numbers)

result = average([1, 2, 3])
print(result)
print(result == 2.0)
print(round(result, 10) == 2.0)
```

```text
2.0
True
True
```

For this case `==` works, but `average([1, 1, 1])` gives `1.0000000000000002` on some hardware. Use `round(result, N) == expected` or `abs(result - expected) < 1e-9` whenever the computation involves division, multiplication of floats, or `math` functions.

**Enable Debug and step through the is_even test function** to watch Python evaluate each assertion. Notice the debugger enters `is_even` on each call.

## Challenge: is_palindrome

Write a function `is_palindrome(text)` that returns `True` if `text` reads the same forwards and backwards (case-insensitive, ignoring spaces), `False` otherwise.

`text.replace(" ", "")` — returns a new string with all spaces removed.
`.lower()` — returns the string in lowercase.
`s[::-1]` — the same string reversed. The slice `[start:stop:step]` with step `-1` reads backwards.

```challenge
def is_palindrome(text):
    pass
```

```test
assert is_palindrome("racecar") == True
assert is_palindrome("hello") == False
assert is_palindrome("") == True
assert is_palindrome("A man a plan a canal Panama") == True
assert is_palindrome("Was it a car or a cat I saw") == True
assert is_palindrome("not a palindrome") == False
```
