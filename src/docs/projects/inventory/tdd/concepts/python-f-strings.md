# Concept: Python f-strings

**What you'll understand by the end:** how to embed real values directly inside a string literal, and how f-strings compare to older string-formatting approaches.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

Building a message that mixes fixed text with values computed at runtime — "X is not supported, got Y" where X and Y are real variables — by concatenating pieces with `+` is workable but easy to get wrong (missing spaces, wrong types needing manual `str()` conversion) and harder to read than the final message actually looks.

## The Isolated Example

```python
name = "widget"
count = 3

concatenated = "You have " + str(count) + " " + name + "(s)"
f_string = f"You have {count} {name}(s)"

print(concatenated)
print(f_string)
print(concatenated == f_string)
```

**Real output:**
```
You have 3 widget(s)
You have 3 widget(s)
True
```

**What this proves:** both produce the identical final string. The f-string version needed no explicit `str(count)` conversion and no `+` operators stitching pieces together — `{count}` and `{name}` inside the string are replaced with those variables' real values automatically, including converting `count` (an `int`) to text without being asked.

## Mechanical Walkthrough

- The `f` immediately before the opening quote marks this as a **formatted string literal** — without it, `{count}` would be literal, uninterpreted text.
- `{expression}` inside an f-string is replaced with the result of evaluating `expression` — not limited to bare variable names; any valid Python expression works (`{count + 1}`, `{name.upper()}`, even a function call).
- The replacement value is automatically converted to its string representation (the same conversion `str()` would perform) — no manual conversion needed for numbers, lists, or most other types.

## CS Lens

This is **string interpolation** — embedding expressions directly inside a string literal's syntax, evaluated and substituted at the point the string is constructed, rather than assembled afterward through separate concatenation or formatting calls.

Also recognized in: JavaScript's template literals (`` `You have ${count} ${name}(s)` ``, near-identical syntax with `${}` instead of `{}`), and most modern languages have adopted some form of this same feature (Ruby's `"#{expr}"`, C#'s `$"{expr}"`) — a broadly convergent design across languages once the convenience became clear.

## SE Lens

Python had two older approaches before f-strings: `%`-style formatting (`"%s has %d items" % (name, count)`, inherited from C's `printf`) and `.format()` (`"{} has {} items".format(name, count)`). f-strings improve on both specifically by putting the *variable itself* directly where it's used, rather than requiring a reader to match up positional placeholders with a separate argument list elsewhere in the line — a real, meaningful readability improvement, especially as the number of interpolated values grows.

## Connection

Directly useful the moment an error message, a log line, or any user-facing text needs to include a real, dynamic value — exactly the case of building a specific, named error message rather than a generic one.

## Try It Yourself

1. Put a real expression (not just a bare variable) inside the braces — `f"{count * 2} total"` — and confirm the expression is evaluated, not treated as literal text.
2. Add a format specifier — `f"{3.14159:.2f}"` (two decimal places) — and confirm it prints `3.14`. Format specifiers (everything after the `:`) control *how* a value is rendered, independent of the value itself.
3. Try nesting a dictionary access inside an f-string — `f"{data['key']}"` — and confirm it works. Then try the same with double quotes matching the outer string's quotes (`f"{data["key"]}"`) on a Python version older than 3.12 and observe the real syntax error — a genuine, version-dependent limitation worth knowing about if targeting older Python.
