---
series: python-fundamentals
level: 0
title: Variables & Types
lang: python
---

# Variables & Types

Python stores values in variables. A variable is just a name that points at a value — no type
declaration needed. Python figures out the type from what you assign.

## Variables & Primitive Types

A variable has a name, a value, and a type. When you write `x = 5`, you bind the integer `5`
to the name `x`. Use `x` anywhere after that and Python substitutes the value.

Python has four primitive types you will use constantly:

- **int** — whole numbers: `0`, `-7`, `1_000_000`
- **float** — decimals: `3.14`, `-0.5`
- **str** — text in quotes: `"hello"`, `'world'`
- **bool** — exactly `True` or `False`

```python
name = "Ada Lovelace"
year = 1843
pi = 3.14159
is_done = False

print(name, year)
print(type(year))
print(type(pi))
```

The `type()` built-in tells you exactly what kind of value a name holds. Try changing
`year` to a string and re-run — notice `type()` changes too.

```python
x = 42          # int
y = 3.14        # float
s = "hello"     # str
b = True        # bool

print(type(x), type(y), type(s), type(b))
```

## Challenge: type inspector

Write `describe(value)` — it should return a string in the format `"type: value"`,
like `"int: 42"` or `"str: hello"`. Use `type(value).__name__` to get the type name
as a string.

```challenge
def describe(value):
    pass
```

```test
assert describe(42) == "int: 42"
assert describe("hello") == "str: hello"
assert describe(3.14) == "float: 3.14"
assert describe(True) == "bool: True"
```

## Arithmetic & Type Conversion

Python gives you six arithmetic operators. Two of them surprise beginners:

```python
x = 10
y = 3

print(x + y)   # 13
print(x - y)   # 7
print(x * y)   # 30
print(x / y)   # 3.3333...  — always a float
print(x // y)  # 3          — floor division, drops the decimal
print(x % y)   # 1          — remainder (modulo)
```

`/` always returns a float, even when both sides are ints.
`//` rounds toward negative infinity. `%` gives what is left over after division.

Convert between types with the built-in functions `int()`, `float()`, `str()`, `bool()`.
Python will not do this implicitly — `"Total: " + 42` raises a `TypeError`.

```python
age_str = "25"
age_int = int(age_str)

print(age_int + 1)      # 26
print(str(age_int))     # "25"
print(float(age_int))   # 25.0
print(bool(0))          # False
print(bool(42))         # True
```

## Challenge: celsius to fahrenheit

Write `celsius_to_fahrenheit(c)`. The formula is `F = (C × 9/5) + 32`.

```challenge
def celsius_to_fahrenheit(c):
    pass
```

```test
assert celsius_to_fahrenheit(0) == 32.0
assert celsius_to_fahrenheit(100) == 212.0
assert celsius_to_fahrenheit(-40) == -40.0
assert celsius_to_fahrenheit(37) == 98.6
```
