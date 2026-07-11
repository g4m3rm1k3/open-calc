---
series: python-fundamentals
level: 3
title: Reading Error Messages
lang: python
---

# Reading Error Messages

Every programmer, at every level of experience, gets error messages. The difference between a beginner and an expert is not that experts get fewer errors — it is that experts can read an error message and know exactly where to look within ten seconds.

An error message is not a failure. It is Python telling you precisely what went wrong, on which line, and why. A programmer who cannot read error messages is flying blind. A programmer who can reads them like a map.

This lesson teaches the three most common Python errors and how to read the traceback that accompanies them. You will see real errors, understand what they mean, and know how to fix them.

## The Anatomy of an Error Message

When Python cannot execute your code, it stops and prints an **error message** — sometimes called a **traceback**. Every traceback has the same structure:

```text
Traceback (most recent call last):
  File "program.py", line 3, in <module>
    result = total / count
NameError: name 'total' is not defined
```

Reading it from bottom to top:

```text
Bottom line:  NameError: name 'total' is not defined
              │           └── what specifically went wrong
              └── the error type

Middle lines: File "program.py", line 3, in <module>
              result = total / count
              └── where it happened: file, line number, the actual line of code

Top line:     Traceback (most recent call last):
              └── boilerplate header — ignore it, start from the bottom
```

**Always read a traceback from bottom to top.** The bottom tells you *what*. The middle tells you *where*.

## SyntaxError: Python Could Not Parse Your Code

A `SyntaxError` means Python could not understand your code as valid Python. It happened before any of your code executed — Python noticed the problem during the *parsing* phase (Level 0: when Python reads your text and builds its internal understanding of the structure).

Run this to see one:

```python
print("Hello"
print("World")
```

```text
  File "program.py", line 2
    print("World")
    ^^^^^
SyntaxError: '(' was never closed
```

Python expected the first `print(` to be closed with `)` before the next line started. The caret (`^`) points to the line Python was on when it realized something was wrong — often one line *after* the actual mistake, because Python does not notice the missing `)` until it encounters the next statement.

**Common SyntaxErrors and what they mean:**

```text
SyntaxError: '(' was never closed       → missing closing parenthesis
SyntaxError: EOL while scanning string  → missing closing quote
SyntaxError: invalid syntax             → Python cannot parse the structure
SyntaxError: expected ':'               → missing colon after if/def/for/while
SyntaxError: unexpected indent          → code is indented where Python didn't expect it
```

Fix the first program by adding the missing `)`:

```python
print("Hello")
print("World")
```

## NameError: Used a Name That Does Not Exist

A `NameError` happens at runtime — the code parsed correctly but, when Python tried to execute a line, it looked up a name and found nothing under it.

```python
print(result)
```

```text
Traceback (most recent call last):
  File "program.py", line 1, in <module>
    print(result)
NameError: name 'result' is not defined
```

`result` was never assigned a value before this line. Python has no binding for that name — it does not exist.

The three most common causes:

```text
Cause 1: Typo in the name
    total_cost = 100
    print(totel_cost)   ← 'totel_cost' ≠ 'total_cost'

Cause 2: Used before assigned
    print(count)        ← count hasn't been assigned yet
    count = 0

Cause 3: Wrong scope (Level 19 covers this)
    def calculate():
        answer = 42
    print(answer)       ← answer only exists inside calculate()
```

```python
monthly_salary = 5000
annual_salary = monthly_slary * 12
print(annual_salary)
```

**Enable Debug and step through this.** Python will fail on line 2. The variables panel at that step shows `monthly_salary = 5000` — the first assignment worked. The error is a typo: `monthly_slary` instead of `monthly_salary`. Fix it, run again, see the correct result.

**SE lens:** NameErrors from typos are caught immediately by Python because Python does not guess what you meant. This strictness is a feature, not a bug — a language that silently accepted typos would produce programs that ran but computed wrong answers, with no indication why. The error message is Python doing you a favour.

## TypeError: Wrong Type for an Operation

A `TypeError` happens when you try to do something with a value that does not support it — usually mixing types that cannot be combined.

```python
age = 25
message = "I am " + age + " years old."
print(message)
```

```text
Traceback (most recent call last):
  File "program.py", line 2, in <module>
    message = "I am " + age + " years old."
TypeError: can only concatenate str (not "int") to str
```

`+` between two strings joins them. But `age` is an integer, not a string. Python does not automatically convert `25` to `"25"` — it raises a TypeError instead.

**Why doesn't Python just convert automatically?**

Because automatic conversion creates ambiguity. In JavaScript (which does silently convert), `"5" + 3` produces `"53"` (string concatenation) but `"5" - 3` produces `2` (numeric subtraction). The inconsistency causes real bugs. Python's rule is explicit: if you want to combine different types, you say so.

Fix: use `str()` to convert the integer to a string first.

```python
age = 25
message = "I am " + str(age) + " years old."
print(message)
```

**Common TypeErrors:**

```text
TypeError: can only concatenate str (not "int") to str    → mixing str and int with +
TypeError: unsupported operand type(s) for +: 'int' and 'str'  → same, other direction
TypeError: 'int' object is not iterable                   → tried to loop over a number
TypeError: 'NoneType' object is not subscriptable         → used [] on None
```

**CS lens:** Python is a **dynamically typed** language — types are checked at runtime, not at compile time. This is why a TypeError happens when the line *executes*, not when Python first reads your file. A **statically typed** language like TypeScript or Java checks types before the program runs, catching TypeErrors before you ever click Run. Both approaches have tradeoffs; Python chose runtime checking for flexibility.

## Errors Are Not Failures — They Are Feedback

When you get an error:

```text
1. Read from the bottom up — what type of error is it?
2. Read the file and line number — where did it happen?
3. Look at the highlighted line — what is Python telling you?
4. Enable Debug and step to that line — what are the variable values?
5. Fix the specific problem the error named.
```

That is the entire debugging workflow for errors you have already learned. Later lessons add more error types — `IndexError`, `KeyError`, `ValueError`, `AttributeError` — and each one gets the same treatment: read it, locate it, fix it.

## Challenge: safe_divide

Write a function `divide(numerator, denominator)` that returns the result of dividing `numerator` by `denominator`.

`numerator` and `denominator` are both integers. Return the result as a float using `/` (not `//`).

There is no error handling required — assume `denominator` is never zero.

The challenge is straightforward. The point is to write a function that returns the right type and verify it passes the tests — then deliberately break it in a way that would cause a TypeError (try `return numerator + str(denominator)`) and observe the error message before fixing it.

```challenge
def divide(numerator, denominator):
    pass
```

```test
assert divide(10, 2) == 5.0
assert divide(7, 2) == 3.5
assert divide(0, 5) == 0.0
assert divide(100, 4) == 25.0
assert divide(1, 3) == round(1/3, 10)
```
