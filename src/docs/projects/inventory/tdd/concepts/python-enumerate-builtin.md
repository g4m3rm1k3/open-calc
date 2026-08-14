# Concept: The `enumerate()` Built-in

**What you'll understand by the end:** how `enumerate()` pairs each
element of an iterable with its real index, letting a `for` loop unpack
both directly, without a separate `range(len(...))` counter — and how
to unpack a real, more complex element (like a tuple) inside that same
loop.

**Prerequisites:** `python-tuple-unpacking.md`, `python-iterators.md`.

## Setup

Python 3, no packages needed.

## The Problem

Looping over a real sequence while also needing each element's own
index — to mark "this is the current one," to build a position-aware
message — is a common real need. Reaching for `range(len(sequence))`
and then indexing back into the sequence inside the loop body works,
but is more real code than the need calls for, and introduces a small,
avoidable indexing step on every single iteration.

## The Isolated Example

```python
matches = [(0, 2), (3, 5), (6, 8)]
current_index = 1

for i, (start, end) in enumerate(matches):
    marker = " <- current" if i == current_index else ""
    print(f"match {i}: positions {start}-{end}{marker}")

print("---")
for i in range(len(matches)):
    start, end = matches[i]
    print(f"match {i}: positions {start}-{end}")

print("---")
for i, item in enumerate(["a", "b", "c"], start=1):
    print(i, item)
```

**Real output, run this session:**
```
match 0: positions 0-2
match 1: positions 3-5 <- current
match 2: positions 6-8
---
match 0: positions 0-2
match 1: positions 3-5
match 2: positions 6-8
---
1 a
2 b
3 c
```

**What this proves:** `enumerate(matches)` and the manual
`range(len(matches))` version produce the identical real output — the
same indices, the same values — but `enumerate`'s version never
indexes back into `matches` at all; `i, (start, end)` unpacks the real
index **and** the tuple's own two fields in one line. The third
example shows `enumerate`'s optional `start=1` genuinely changes where
counting begins, without changing which real elements get iterated.

## Mechanical Walkthrough

- `enumerate(iterable)` returns a real, lazy iterator (per
  `python-iterators.md`'s own framing) that yields `(index, element)`
  pairs, one at a time — `index` starts at `0` by default and
  increments by exactly one per element, regardless of what the
  elements themselves are.
- `for i, (start, end) in enumerate(matches):` unpacks **two levels**
  at once: the outer `i, (...)` unpacks each `(index, element)` pair
  `enumerate` yields; the inner `(start, end)` simultaneously unpacks
  `element` itself, since each element here is its own 2-tuple — the
  same real tuple-unpacking mechanism `python-tuple-unpacking.md`
  covers, applied twice in a single `for` target.
- `enumerate(iterable, start=N)` begins counting from `N` instead of
  `0` — useful for real, human-facing output where counting from `1`
  reads more naturally than a 0-indexed internal position.
- The `range(len(...))` alternative requires indexing back into the
  original sequence (`matches[i]`) inside the loop body — real,
  additional code doing work `enumerate` already does internally,
  and a real, small opportunity for a mismatched index if the loop body
  ever indexes into a *different* sequence by mistake.

## CS Lens

This is a real, small instance of Python's broader iterator-composition
idiom: `enumerate` doesn't build a new list of pairs upfront — it wraps
an existing iterable, producing pairs lazily as they're consumed,
exactly the same lazy-production idea `python-comprehension-forms-
list-vs-generator.md` already covers for generator expressions.
`enumerate` is itself implemented as a real, built-in iterator, not
special `for`-loop syntax — it could be consumed with `next()` directly
the same way any other iterator can.

Also recognized in: many languages' own "index + value" loop
constructs (JavaScript's `Array.prototype.entries()`, paired with
destructuring; Rust's `.iter().enumerate()`) — a broadly convergent,
real convenience once a language supports iterating with an index
without a manual counter.

## SE Lens

The real, practical value: `enumerate` removes an entire, small class of
possible bugs — indexing the wrong sequence, an off-by-one in a manual
counter — by never introducing a separate counter variable that could
drift out of sync with the loop at all. It's also simply less real code
for an extremely common real need, read immediately by anyone familiar
with Python's own idioms as "loop with an index," rather than requiring
a reader to notice a `range(len(...))` pattern and infer the same
intent.

## Connection

Builds on `python-tuple-unpacking.md` (used twice at once in the
isolated example above) and `python-iterators.md` (the lazy-production
mechanism `enumerate` itself relies on). Directly relevant to any real
loop needing to mark "the current" element among several — cycling
through search matches and highlighting the current one differently
is exactly this shape.

## Try It Yourself

1. Use `enumerate` on a plain list of strings (no tuples) and confirm
   the inner unpacking simplifies to a single name (`for i, word in
   enumerate(words):`) — the double-unpacking in this file's own
   example is specific to elements that are themselves tuples.
2. Try `enumerate` on an empty list and confirm the loop body simply
   never runs — no error, no special case needed.
3. Rewrite this file's own `range(len(matches))` version using
   `enumerate` instead, and count how many fewer real tokens
   (variables, indexing operations) the `enumerate` version needs for
   the identical real result.
