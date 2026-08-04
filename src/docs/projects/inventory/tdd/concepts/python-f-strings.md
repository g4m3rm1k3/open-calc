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

## A Second Real Facet: Format Specifiers

Every f-string above rendered a value using its plain, default string
form. A real, common need is controlling *how* a value renders —
written after a `:` inside the braces:

```python
value = 1.0
letter = "X"

# The real motivating case: :g trims a trailing .0 automatically.
plain = f"{letter}{value}"
general = f"{letter}{value:g}"
print("no format spec:  ", repr(plain))
print("with :g spec:    ", repr(general))

pi = 3.14159
print("with :.2f spec:  ", f"{pi:.2f}")

count = 7
print("with :03d spec:  ", f"{count:03d}")

big = 1234567
print("with :, spec:    ", f"{big:,}")
```

**Real output, run this session:**
```
no format spec:   'X1.0'
with :g spec:     'X1'
with :.2f spec:   3.14
with :03d spec:   007
with :, spec:     1,234,567
```

**What this proves:** the identical value `1.0`, interpolated with no
format spec, renders as `'X1.0'` — but with `:g` (a "general" numeric
format), it renders as `'X1'`, dropping the trailing `.0` entirely.
This is a real, concrete, meaningful difference — a real program
formatting a value this way (say, a coordinate or a count that's often
a whole number) genuinely produces different, shorter output text
purely because of the format spec, with the underlying value (`1.0`)
never changing at all. `:.2f` rounds to exactly two decimal places
regardless of the input's own precision; `:03d` pads an integer to at
least 3 digits with leading zeros; `:,` inserts thousands separators —
four genuinely different real specifiers, each controlling a distinct
aspect of rendering.

**Mechanical note:** everything after the `:` inside `{expression:spec}`
is the **format spec** — its own small, real mini-language (`g` for
general float formatting, `.Nf` for N decimal places, `0Nd` for
zero-padded integers of width N, `,` for thousands separators, and
more) — evaluated and applied *after* `expression` itself is computed,
purely controlling the resulting string's appearance.

### Try It Yourself (second facet)

1. Apply `:g` to a value that already has no meaningful trailing zeros
   (say, `3.14159`) and observe how it differs from `:.2f` — `:g`
   doesn't round to a fixed number of decimals the way `:.2f` does.
2. Combine a width and a format together (`f"{count:5d}"`, right-aligned
   in a field 5 characters wide) and print two different values through
   it to see the real, consistent alignment this produces — useful for
   real, tabular text output.
3. Look up Python's full Format Specification Mini-Language
   documentation and find one specifier not covered here (percentage
   formatting, `%`, is a good one) — use it in a real f-string and
   confirm the output matches what the documentation describes.

## A Third Real Facet: Adjacent String Literal Concatenation

A real, separate piece of Python syntax — not specific to f-strings,
but commonly used alongside them to break a long line — lets two
string literals sitting next to each other, with nothing between them,
be automatically joined into one:

```python
name = "motor"
count = 3
message = f"checking {name}: " f"found {count} issues"
print(message)
```

**Real output, run this session:**
```
checking motor: found 3 issues
```

**What this proves:** two separate literals — `f"checking {name}: "`
and `f"found {count} issues"` — with only whitespace between them in
the source, combined into a single real string at compile time, each
one's own `{...}` interpolation resolved independently before the
join. No `+` operator appears anywhere.

**Mechanical note:** this works for **any** adjacent string literals,
not just f-strings (`"a" "b"` becomes `"ab"` the identical way) — it's
a real, general piece of Python syntax, most commonly reached for to
split one long, real f-string across multiple source lines without an
explicit `+` at each break.

### Try It Yourself (third facet)

1. Split a genuinely long f-string across three physical lines using
   this technique (each line its own literal, with parentheses
   wrapping the whole expression) and confirm it still produces one
   real, correctly-interpolated string.
2. Try adjacent-concatenating a plain string literal with an f-string
   (`"prefix " f"{value}"`) and confirm it works identically —
   the two literals don't need to both be f-strings.
3. Compare this technique against explicit `+` concatenation
   (`f"a" + f"b"`) for the identical real result, and reason about why
   Python offers both — what does the adjacent-literal form avoid that
   `+` doesn't?
