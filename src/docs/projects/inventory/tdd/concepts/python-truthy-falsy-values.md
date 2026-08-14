# Concept: Python Truthiness and `bool()` Coercion

**What you'll understand by the end:** which values Python treats as true or false in a boolean context, and a real, common mistake this causes when converting untrusted data with `bool()`.

**Prerequisites:** none.

## Setup

Python 3, no install needed:
```
python3 --version
```

## The Problem

Data arriving from an external source (a network request, a config file, user input) doesn't always arrive as Python's own `True`/`False` — it might be the *string* `"false"`, or `"0"`, or an empty string. Naively wrapping such a value in `bool()`, expecting it to correctly interpret the *meaning* of the text, produces a real, common, easy-to-miss bug.

## The Isolated Example

```python
print(bool("false"))
print(bool("0"))
print(bool(""))
print(bool(0))
print(bool([]))
print(bool([0]))
```

**Real output:**
```
True
True
True
False
False
True
```

**What this proves:** `bool("false")` is `True` — the string `"false"` is non-empty, and Python's `bool()` on a string only ever checks whether it's *empty*, never its contents. `bool([0])` is also `True` — a list containing the number `0` is still a non-empty list, entirely different from `bool(0)` itself, which is `False`. Truthiness depends on a value's own type and its "emptiness," never on what the value's contents might mean to a human reader.

## Mechanical Walkthrough

- Python's falsy values are exactly: `False`, `None`, `0` (and `0.0`, `0j`), and any empty collection (`""`, `[]`, `{}`, `()`, `set()`) — every other value, of any type, is truthy.
- `bool(x)` calls `x`'s own `__bool__` method (or, if absent, checks `len(x) > 0` for anything with a length) to determine truthiness — for a `str`, that means "is this string non-empty," with zero regard for what characters it actually contains.
- This is why `bool("false")`, `bool("no")`, and `bool("0")` are all `True` — each is a non-empty string, and Python has no built-in concept of "a string that spells out a false-ish word" being treated as boolean `False`.
- `if some_string:` in an `if` statement uses this exact same truthiness check implicitly — the same gotcha applies any time a string is used directly as a boolean condition, not just inside an explicit `bool(...)` call.

## CS Lens

This is **type coercion** governed by each type's own, type-specific rules — Python doesn't have one universal notion of "true-ish content," it has a per-type definition of emptiness/zero-ness that `bool()` defers to. This differs meaningfully from languages that attempt string-content-aware boolean parsing (some configuration-file libraries specifically parse the literal words `"true"`/`"false"` as strings into real booleans) — Python's `bool()` is not one of those; it is purely a generic emptiness/zero check, applied uniformly regardless of a string's actual text.

Also recognized in: JavaScript's own, differently-shaped truthy/falsy rules (see `javascript-logical-or-default-fallback.md` for JavaScript's own falsy-value list) — a real, useful contrast: both languages have a truthiness concept, but the specific list of falsy values differs (JavaScript's `NaN` has no Python equivalent in this list; Python's empty-collection rule has no direct JavaScript equivalent, since JavaScript arrays and objects are always truthy regardless of emptiness).

## SE Lens

The real, concrete risk: data crossing a real boundary (a JSON request body, an environment variable, a command-line argument) arrives as a string even when it's *meant* to represent a boolean — `bool(request_body.get("flag", False))` looks like reasonable, defensive code, but silently converts a client's mistaken `"false"` string into Python's `True`, the exact opposite of the sender's intent, with no error or warning anywhere. The honest fix is explicit: check for the literal expected values (`value in (True, "true", "True")` or, more strictly, rejecting anything that isn't a real JSON boolean at all) rather than trusting `bool()` to interpret meaning it was never designed to interpret.

## Connection

Directly relevant anywhere external, possibly-untrusted data (a request body, a config value) is converted toward a boolean — a real, concrete instance of the general boundary-validation caution `input-validation-at-boundary.md` already names, specific to this one common, easy-to-miss Python trap.

## Try It Yourself

1. Test `bool()` against every value in the falsy list above individually, confirming each is `False`, and then test at least three "looks like it should be false" strings (`"false"`, `"no"`, `"FALSE"`) confirming all three are actually `True`.
2. Write a real, honest fix: a function `parse_bool(value)` that returns `True` only for the real boolean `True` or the exact strings `"true"`/`"True"`, `False` only for `False`/`"false"`/`"False"`, and raises a clear error for anything else (including `"maybe"` or `1`) — a stricter, more honest alternative to bare `bool(...)` coercion.
3. Check whether Python's own standard library has a relevant built-in for this exact problem (look up `distutils.util.strtobool`, noting its real deprecation status in recent Python versions) and compare its behavior to the function you just wrote.
