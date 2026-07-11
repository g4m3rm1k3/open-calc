---
series: python-fundamentals
level: 12
title: Input & Type Conversion
lang: python
---

# Input & Type Conversion

Programs that only work with hardcoded values are not very useful. `input()` lets a program pause and wait for the user to type something. The result is always a string — which means type conversion is nearly always the next step.

**Note:** `input()` requires a running terminal to work. In this engine, calling `input()` in a runnable example will pause execution. The examples here are written to show the pattern; the challenge tests type conversion separately, which is where the real skill lies.

## input() — Reading from the User

`input(prompt)` — prints `prompt` to the terminal, waits for the user to type a line and press Enter, then returns what they typed as a **string**.

```text
name = input("What is your name? ")
# User types: Ada
# name is now the string "Ada"
```

The return value is always `str`, even if the user types `42`. This is the most important fact about `input()`: you always get a string back, and you are always responsible for converting it to the type you need.

```text
age_text = input("How old are you? ")
# User types: 25
# age_text is "25" — a string, not the integer 25
# age_text + 1  →  TypeError
# int(age_text) + 1  →  26
```

## Converting input() Results

Since `input()` returns a string, every numeric input must be converted before arithmetic:

```text
Converting str → int:   int("42")    → 42
Converting str → float: float("3.7") → 3.7
Converting str → bool:  bool("yes")  → True  (non-empty string is truthy)
```

The pattern for numeric input:

```python
def add_years(birth_year_text, years_to_add):
    birth_year = int(birth_year_text)
    future_year = birth_year + years_to_add
    return future_year

print(add_years("1815", 50))
print(add_years("1906", 100))
```

```text
1865
2006
```

`int("1815")` converts the string `"1815"` to the integer `1815`. Then `1815 + 50 = 1865`.

**Enable Debug and step through this.** At line 2, `birth_year_text` is the string `"1815"`. After line 2, `birth_year` is the integer `1815`. Watch the type change in the variables panel.

## What Happens When Conversion Fails

`int("hello")` raises a `ValueError` — the string does not represent a valid integer. This is expected and normal. In Level 28 (Exceptions) you will learn how to handle this gracefully. For now, assume the input is always valid.

```python
def safe_convert_demo(text_value):
    result = int(text_value)
    return result * 2

print(safe_convert_demo("21"))
```

## strip() Before Converting

User input often has leading or trailing whitespace (from accidental spaces or copy-pasting). Always strip before converting:

```python
def parse_temperature(raw_text):
    cleaned = raw_text.strip()
    temperature = float(cleaned)
    return temperature

print(parse_temperature("  98.6  "))
print(parse_temperature("37.0"))
```

```text
98.6
37.0
```

Without `.strip()`, `float("  98.6  ")` raises `ValueError: could not convert string to float: '  98.6  '`. Python's conversion functions do not strip whitespace automatically.

**SE lens:** The pattern `value = convert(raw_input.strip())` is so common it should be a reflex. Any time you receive text from outside your code (user input, files, network responses), strip and convert before trusting the value.

## Challenge: parse_coordinates

Write a function `parse_coordinates(coordinate_text)` that parses a string like `"51.5,-0.1"` and returns the sum of the two coordinate values as a float.

The input is always two decimal numbers separated by a comma, with no spaces. Use `.split(",")` to split on the comma, then `float()` to convert each part.

`.split(separator)` — splits a string into a list at each separator. `"a,b".split(",")` → `["a", "b"]`. Access parts with `[0]` and `[1]`.

```challenge
def parse_coordinates(coordinate_text):
    pass
```

```test
assert parse_coordinates("51.5,-0.1") == 51.4
assert parse_coordinates("0.0,0.0") == 0.0
assert parse_coordinates("90.0,180.0") == 270.0
assert round(parse_coordinates("-33.9,151.2"), 1) == 117.3
assert parse_coordinates("10.0,-10.0") == 0.0
```
