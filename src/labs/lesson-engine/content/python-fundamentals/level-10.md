---
series: python-fundamentals
level: 10
title: f-strings
lang: python
---

# f-strings

Building strings with `+` and `str()` works, but it produces cluttered code that is hard to read. f-strings are the modern solution: embed any Python expression directly inside a string literal using `{}` braces. Python evaluates the expression and inserts the result.

f-strings were introduced in Python 3.6 and are now the standard way to format strings in Python. If you read older code, you will see `%` formatting and `.format()` — they still work, but f-strings are cleaner for everything new.

## Basic f-string Syntax

Prefix the string with `f` (or `F`) before the opening quote. Any expression inside `{}` is evaluated and inserted:

```python
first_name = "Ada"
birth_year = 1815
language = "Python"

greeting = f"Hello, {first_name}!"
fact = f"{first_name} was born in {birth_year}."
combo = f"{first_name} writes {language}."

print(greeting)
print(fact)
print(combo)
```

```text
Hello, Ada!
Ada was born in 1815.
Ada writes Python.
```

`f"Hello, {first_name}!"` — the `f` prefix enables f-string mode. `{first_name}` is replaced by the value of `first_name`. Everything outside `{}` is literal text.

## Expressions Inside {}

The `{}` can contain any Python expression, not just variable names:

```python
width = 8
height = 5
price = 9.99
quantity = 3

print(f"Area: {width * height}")
print(f"Total: {price * quantity}")
print(f"Half of width: {width / 2}")
print(f"Type of width: {type(width).__name__}")
```

```text
Area: 40
Total: 29.97
Half of width: 4.0
Type of width: int
```

Any expression that produces a value can go inside `{}` — arithmetic, function calls, method calls, comparisons. Python evaluates the expression fully before inserting the result.

## Format Specifiers — Controlling Output

After the expression, a colon `:` introduces a **format specifier** that controls how the value is displayed:

```python
pi = 3.14159265358979
temperature = 98.6
population = 4_600_000

print(f"Pi to 2 places: {pi:.2f}")
print(f"Pi to 4 places: {pi:.4f}")
print(f"Temperature: {temperature:.1f}°F")
print(f"Population: {population:,}")
```

```text
Pi to 2 places: 3.14
Pi to 4 places: 3.1416
Temperature: 98.6°F
Population: 4,600,000
```

Format specifiers:
- `:.2f` — float with exactly 2 decimal places (the `f` means fixed-point notation)
- `:.4f` — float with exactly 4 decimal places
- `:,` — integer with thousands separators (commas)

This solves the Level 4 problem where `str(1.5)` gave `"1.5"` but you needed `"1.50"` — `f"{1.5:.2f}"` always gives `"1.50"`.

**SE lens:** Format specifiers in f-strings make the output format part of the code that produces it. The intent is visible at the point of use, not buried in a separate formatting function. This is the principle of **locality of information** — related things should be near each other.

## Width and Alignment

```python
label = "Revenue"
value = 125_430

print(f"|{label:<10}|{value:>10,}|")
print(f"|{'Name':<10}|{'Score':>10}|")
print(f"|{'Alice':<10}|{9850:>10,}|")
```

```text
|Revenue   |   125,430|
|Name      |     Score|
|Alice     |      9,850|
```

- `:<10` — left-align in a field 10 characters wide
- `:>10` — right-align in a field 10 characters wide
- `:>10,` — right-align and add thousands separators

This lets you build aligned tables in plain text output.

## Debugging with f-strings: The = Specifier

Python 3.8 added a shorthand for printing both the expression and its value — useful for quick debugging:

```python
width = 8
height = 5
area = width * height

print(f"{width=}")
print(f"{height=}")
print(f"{area=}")
print(f"{width * height * 2=}")
```

```text
width=8
height=5
area=40
width * height * 2=80
```

`{expression=}` prints `expression=value`. Much faster than writing `print(f"width: {width}")` during debugging.

## Challenge: format_reading

Write a function `format_reading(sensor_name, value, unit)` that returns a formatted sensor reading string.

Format: `"Temperature: 98.60 °F"` — the sensor name, a colon and space, the value to exactly 2 decimal places, a space, and the unit.

`:.2f` — formats a float to exactly 2 decimal places, adding trailing zeros when needed. `f"{98.6:.2f}"` → `"98.60"`.

```challenge
def format_reading(sensor_name, value, unit):
    pass
```

```test
assert format_reading("Temperature", 98.6, "°F") == "Temperature: 98.60 °F"
assert format_reading("Pressure", 1013.25, "hPa") == "Pressure: 1013.25 hPa"
assert format_reading("Humidity", 45.0, "%") == "Humidity: 45.00 %"
assert format_reading("Speed", 0.5, "m/s") == "Speed: 0.50 m/s"
assert format_reading("Voltage", 3.3, "V") == "Voltage: 3.30 V"
```
