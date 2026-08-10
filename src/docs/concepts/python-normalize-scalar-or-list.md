# Concept: Normalizing "One or Many" Into Always-a-List

**What you'll understand by the end:** a small, common idiom for handling a value that might be a single item or a list of items, by always converting it to a list first.

**Prerequisites:** `python-isinstance.md`.

## Setup

Python 3, no install needed:
```
python3 --version
```

## The Problem

Some data genuinely comes in two shapes depending on context — a single value most of the time, but occasionally a list of several — because whatever produced it (a parser recognizing a repeated field, an API that returns one object or an array depending on how many results exist) didn't commit to always wrapping it consistently. Code that consumes this value then has to handle both shapes everywhere it's used, or risk crashing the moment the "unexpected" shape actually shows up.

## The Isolated Example

```python
def describe(value):
    items = value if isinstance(value, list) else [value]
    return f"{len(items)} item(s): {items}"

print(describe(5))
print(describe([1, 2, 3]))
print(describe("single string, not a list of characters"))
```

**Real output:**
```
1 item(s): [5]
3 item(s): [1, 2, 3]
1 item(s): ['single string, not a list of characters']
```

**What this proves:** all three real, different-shaped inputs — a bare number, an actual list, and a string (which, notably, is *not* automatically exploded into individual characters) — were normalized into a real Python list, letting `len(items)` and the `for`/iteration logic that would follow work identically regardless of which shape the original value actually was.

## Mechanical Walkthrough

- `value if isinstance(value, list) else [value]` — a single conditional expression (see `ternary-conditional-operator.md`'s own conditional-expression form, in a different language): if `value` is already a list, use it as-is; otherwise, wrap it in a new, one-element list.
- This is specifically checking for `list`, not any generically iterable type — a string is iterable too (`for ch in "abc"` works), but `isinstance("abc", list)` is `False`, so a string correctly gets wrapped as a single one-element list (`["abc"]`), not exploded into individual characters (`['a', 'b', 'c']`) — a real, easy mistake to make with a looser check like "is this iterable" instead of the specific `isinstance(..., list)` check shown here.
- Once normalized, everything downstream (looping, counting, indexing) can assume exactly one shape — a real list — regardless of how the original value arrived.

## CS Lens

This is **input normalization** — converting several possible representations of conceptually the same kind of data into one single, canonical shape as early as possible, so every subsequent piece of code only ever has to reason about that one shape. This is a specific, small instance of the same idea a **parser** applies at a larger scale (raw text, in many possible surface forms, normalized into one consistent structure) — see `lexer-preprocessing-before-parsing.md`.

Also recognized in: many real-world APIs and libraries that accept "a single item or a list" as a convenience for callers (a function accepting either one file path or a list of paths, for instance), and this exact "coerce to array" idiom appearing under similar names across other languages (JavaScript's `Array.isArray(x) ? x : [x]` is the direct syntactic equivalent).

## SE Lens

Normalizing once, at the point data first enters a function, rather than repeatedly checking "is this a list?" at every later point the value is used, keeps the "handle both shapes" logic in exactly one place — a real, concrete instance of avoiding duplicated conditional logic scattered across a codebase. The real risk worth naming: this pattern silently accepts *both* shapes as valid, which is convenient for a caller but means a genuine mistake (accidentally passing a list where a single scalar was intended, or vice versa) is never flagged as an error — worth choosing deliberately, not by default, when a stricter, single-shape contract would actually be more correct.

## Connection

Builds on `python-isinstance.md`. Directly used wherever a tokenizer or parser's own output format allows a repeated field to collapse to either a single value or a list depending on how many times it appeared — the exact real situation this pattern addresses when a single line of input might mention the same field once or several times.

## Try It Yourself

1. Call `describe` with an empty list (`describe([])`) and confirm it reports `0 item(s)` correctly — the normalization doesn't change *behavior* for an already-correct shape, only for the scalar case.
2. Write the equivalent normalization for a value that might be `None`, a single item, or a list (`items = [] if value is None else (value if isinstance(value, list) else [value])`) and test all three cases.
3. Find a real function (in this project or another codebase you have access to) that currently only handles one of these two shapes, and reason about whether normalizing its input this way would make it more robust — and whether silently accepting both shapes is actually the right choice there, or whether rejecting the "wrong" shape outright would be more correct for that specific case.
