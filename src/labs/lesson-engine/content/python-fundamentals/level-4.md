---
series: python-fundamentals
level: 4
title: print()
lang: python
---

# print()

`print()` appeared in every lesson so far, but it has been used without explanation. This lesson gives it the full treatment — every parameter, every edge case, and why it exists.

`print()` is not a statement. It is a function call. Understanding the difference matters: functions receive inputs, do work, and return values. `print()` receives values, converts them to text, and sends that text to stdout. That is its entire job.

## What print() Does

`print()` takes any number of values, converts each one to a string, joins them with a separator (a space by default), and writes the result to stdout followed by a newline.

```text
print(value1, value2, ..., sep=' ', end='\n')
```

- `value1, value2, ...` — any number of values, any type
- `sep` — the string placed between values (default: one space)
- `end` — the string placed after the last value (default: newline `\n`)

Run this to see the defaults in action:

```python
print("Python", "is", "readable")
print(1, 2, 3)
print("only one value")
print()
```

Output:
```text
Python is readable
1 2 3
only one value

```

The empty `print()` on the last line prints nothing except the newline — producing a blank line. This is useful for spacing output.

## sep — Changing the Separator

The `sep` keyword argument controls what goes between values. It defaults to a single space. Any string can be used, including an empty string.

```python
print("2026", "07", "11", sep="-")
print("a", "b", "c", sep="")
print("one", "two", "three", sep=" | ")
```

```text
2026-07-11
abc
one | two | three
```

`sep="-"` joins the parts with a hyphen, producing a date. `sep=""` joins with nothing, producing a single concatenated string without needing the `+` operator.

**CS lens:** `sep` is a keyword argument — an argument passed by name rather than position. Python distinguishes between positional arguments (matched by order) and keyword arguments (matched by name). Keyword arguments have defaults, so you only pass them when you want to change the default. The full treatment of function arguments is in Level 19.

## end — Controlling the Newline

By default `print()` adds `\n` (a newline character) after every call. That is why each `print()` appears on its own line. `end` overrides this.

`\n` — the **newline character**. A single invisible character that tells the terminal to move to the next line. Every line of text you have ever read ended with one.

```python
print("Loading", end="")
print(".", end="")
print(".", end="")
print(".")
```

```text
Loading...
```

All four calls write to the same line because none of them end with `\n` until the last one. `end=""` replaces the default newline with an empty string.

## Printing Different Types

`print()` calls `str()` on every value before printing. This means it can print any type — integers, floats, booleans — without you needing to convert them first.

```python
items_in_cart = 3
price_per_item = 9.99
is_member = True

print("Items:", items_in_cart)
print("Total:", items_in_cart * price_per_item)
print("Member discount:", is_member)
```

```text
Items: 3
Total: 29.97
Items: 3
Member discount: True
```

`print()` converted the integer `3`, the float `29.97`, and the boolean `True` to their string representations automatically. This is the only context where Python converts types silently — `print()` is designed for human-readable output, so conversion is always safe.

**SE lens:** `print()` is for humans. It is not for storing data, not for sending values between functions, not for tests. A function that does its work using `print()` instead of `return` cannot be tested and cannot be reused. Every challenge in this series returns values rather than printing them for exactly this reason.

## Challenge: join_words

Write a function `join_words(separator, word_a, word_b, word_c)` that returns the three words joined by the separator — the same thing `print(word_a, word_b, word_c, sep=separator)` would print, but returned as a string instead of printed.

`+` — joins two strings. `"a" + "-" + "b"` produces `"a-b"`.

The function takes four strings and returns one string. Do not use `print()` inside the function — return the result.

```challenge
def join_words(separator, word_a, word_b, word_c):
    pass
```

```test
assert join_words("-", "2026", "07", "11") == "2026-07-11"
assert join_words(", ", "red", "green", "blue") == "red, green, blue"
assert join_words("", "a", "b", "c") == "abc"
assert join_words(" | ", "one", "two", "three") == "one | two | three"
assert join_words(" ", "Hello", "beautiful", "world") == "Hello beautiful world"
```
