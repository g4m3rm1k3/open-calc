---
series: python-fundamentals
level: 26
title: Exceptions
lang: python
---

# Exceptions

An exception is a signal that something went wrong during execution. Python raises an exception when it cannot complete an operation — dividing by zero, accessing a missing key, converting `"hello"` to an integer. Without handling them, exceptions crash the program.

`try`/`except` lets you catch an exception, handle it gracefully, and keep the program running.

## What Happens Without Handling

```python
values = [10, 20, 0, 30]
results = []

for value in values:
    result = 100 / value
    results.append(result)

print(results)
```

```text
ZeroDivisionError: division by zero
```

The program crashes on the third iteration when it tries `100 / 0`. The results computed before the crash are lost.

## try / except

Wrap the code that might fail in a `try` block. The `except` block runs if the exception occurs:

```python
values = [10, 20, 0, 30]
results = []

for value in values:
    try:
        result = 100 / value
        results.append(result)
    except ZeroDivisionError:
        results.append(None)

print(results)
```

```text
[10.0, 5.0, None, 3.3333333333333335]
```

When `100 / 0` raises `ZeroDivisionError`, Python jumps to the `except ZeroDivisionError:` block. The loop continues with the next value.

## Specific Exception Types

Catch the specific exception you expect. Catching `Exception` (the base class) hides bugs:

```python
def safe_int(text):
    try:
        return int(text)
    except ValueError:
        return None

print(safe_int("42"))
print(safe_int("hello"))
print(safe_int("  7  "))
```

```text
42
None
7
```

`int("hello")` raises `ValueError`. `int("  7  ")` works — `int()` strips whitespace. The function returns `None` when conversion fails, `int` otherwise.

**Common exception types:**

```text
ValueError       — argument has the right type but wrong value: int("hello")
TypeError        — wrong type for operation: "hi" + 42
KeyError         — dictionary key not found: d["missing"]
IndexError       — list index out of range: lst[100]
ZeroDivisionError — division by zero: 1 / 0
FileNotFoundError — file does not exist: open("missing.txt")
AttributeError   — object has no such attribute: "hello".nonexistent()
```

## else and finally

`else` runs if no exception occurred. `finally` always runs, exception or not:

```python
def divide_safe(numerator, denominator):
    try:
        result = numerator / denominator
    except ZeroDivisionError:
        return "Cannot divide by zero"
    else:
        return f"Result: {result:.2f}"
    finally:
        print("divide_safe called")

print(divide_safe(10, 4))
print(divide_safe(10, 0))
```

```text
divide_safe called
Result: 2.50
divide_safe called
Cannot divide by zero
```

`finally` is used for cleanup that must happen regardless of success or failure — closing files, releasing network connections, resetting state.

## raise — Signalling Your Own Errors

`raise ExceptionType("message")` — signals that your function detected an error:

```python
def square_root(number):
    if number < 0:
        raise ValueError(f"Cannot take square root of negative number: {number}")
    return number ** 0.5

print(square_root(16))
print(square_root(-4))
```

```text
4.0
ValueError: Cannot take square root of negative number: -4
```

Raising a `ValueError` with a clear message is better than returning a sentinel value like `-1` or `None` — it tells the caller exactly what went wrong and prevents silent errors from propagating.

**SE lens:** Exception handling is a contract between a function and its callers. A function should raise an exception when it cannot fulfil its contract (the inputs are invalid, a required resource is missing). The caller decides how to handle the failure. Never use exceptions for normal control flow — they are for exceptional conditions.

## Challenge: safe_average

Write a function `safe_average(numbers)` that returns the average of a list of numbers.

If the list is empty, raise a `ValueError` with the message `"Cannot average an empty list"`.

`sum(iterable)` — returns the sum of all elements.
`len(iterable)` — returns the number of elements.

```challenge
def safe_average(numbers):
    pass
```

```test
assert safe_average([1, 2, 3, 4, 5]) == 3.0
assert safe_average([10, 20]) == 15.0
assert safe_average([42]) == 42.0
assert safe_average([0]) == 0.0
assert safe_average([-1, 1]) == 0.0
```
