---
series: python-fundamentals
level: 33
title: Formatting & Linting
lang: python
---

Formatting is the consistent arrangement of code — indentation, spacing, line length, quote style. Linting is the automatic detection of errors and style violations before the code runs. Together they make codebases readable by any team member, and they catch entire categories of bugs without writing a single test.

## PEP 8 — Python's Style Guide

PEP 8 is the official Python style guide. It specifies how Python code should look. The most important rules:

```text
Naming
───────────────────────────────────────────────────────
snake_case           variables, functions, parameters, modules
UPPER_SNAKE_CASE     constants  (PI = 3.14159)
PascalCase           classes    (class BankAccount:)
_leading_underscore  private/internal names

Spacing
───────────────────────────────────────────────────────
4 spaces             indentation (never tabs)
1 blank line         between methods inside a class
2 blank lines        between top-level definitions
spaces around =      in assignment: x = 5
no spaces around =   in keyword arguments: func(key=value)
spaces around ops    x + y, not x+y

Line length
───────────────────────────────────────────────────────
79 characters        maximum (72 for docstrings)
```

**SE lens:** The purpose of a style guide is not aesthetics — it is predictability. When all Python code follows PEP 8, every developer can read any codebase without decoding someone else's idiosyncratic choices. Style guides pay off when a team grows, when code is reviewed, and when bugs are hunted at 2am.

## What a Linter Does

A linter reads your code without running it and reports violations. Common linters:

```text
Tool       What it checks
──────────────────────────────────────────────────────
flake8     PEP 8 violations, undefined names, unused imports
pylint     Everything flake8 checks, plus logic errors
ruff       Extremely fast drop-in replacement for flake8
mypy       Type annotation correctness (from Level 31)
```

A linter catches things tests cannot:

```python
import os

def greet(name):
    mesage = "Hello, " + name
    return message
```

A linter reports:
- `os` imported but unused
- `mesage` assigned but `message` used — likely a typo that would cause `NameError`

The typo is invisible to the eye but obvious to the linter. No test could catch it before the function is called — and by then, users see the crash.

## Black — The Opinionated Formatter

Black reformats Python code automatically. It has almost no configuration options by design — every Black-formatted codebase looks identical:

```python
# Before Black
x={"key":"value","other_key":  42}
def my_func(a,b,c) :
    return a+b+c

# After Black
x = {"key": "value", "other_key": 42}

def my_func(a, b, c):
    return a + b + c
```

Run it with `black .` in your project directory. Black rewrites your files in place. No arguments, no choices — this is intentional. The time saved arguing about formatting is spent writing features.

## Common Linting Errors and What They Mean

```text
E501   Line too long (79 > 79 characters)
E302   Expected 2 blank lines between top-level definitions
F401   'os' imported but unused
F821   Undefined name 'mesage'
W291   Trailing whitespace on a line
E711   Comparison to None should use 'is' not '=='
E712   Comparison to True should use 'if cond:' not 'if cond == True:'
```

`E711` and `E712` are worth understanding. `None`, `True`, and `False` are singletons — there is only one of each. `is` tests identity (same object); `==` tests equality (same value). Using `==` with singletons works in practice but suggests a misunderstanding of how Python represents these values.

## Applying Naming Conventions

Naming is where linters cannot help — a linter cannot tell whether `x` is a bad variable name. That judgment is yours.

```python
def convert(x, y):
    return (x - 32) * 5 / 9

def celsius_from_fahrenheit(fahrenheit: float) -> float:
    return (fahrenheit - 32) * 5 / 9
```

Both functions work identically. The second one explains itself. A reader of the first must guess: is `x` Fahrenheit or Celsius? What does `y` do? (It does nothing — `y` is unused, which a linter would flag as `F841`.)

## Challenge: to_snake_case

Write a function `to_snake_case(name)` that converts a camelCase or PascalCase identifier to snake_case.

Rules:
- Insert an underscore before every uppercase letter that follows a lowercase letter
- Lowercase the entire result

`char.isupper()` — `True` if `char` is an uppercase letter.
`char.islower()` — `True` if `char` is a lowercase letter.
`char.lower()` — returns the lowercased character.

Build the result character by character. When you find an uppercase letter that is preceded by a lowercase letter, prepend `_` before lowercasing it.

```challenge
def to_snake_case(name):
    pass
```

```test
assert to_snake_case("camelCase") == "camel_case"
assert to_snake_case("PascalCase") == "pascal_case"
assert to_snake_case("myVariableName") == "my_variable_name"
assert to_snake_case("alreadylower") == "alreadylower"
assert to_snake_case("HTMLParser") == "h_t_m_l_parser"
assert to_snake_case("getHTTPResponse") == "get_h_t_t_p_response"
```
