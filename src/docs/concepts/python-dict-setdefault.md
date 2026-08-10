# Concept: `dict.setdefault` — Set Only If Not Already Present

**What you'll understand by the end:** how `dict.setdefault(key,
value)` sets a key's value only the **first** time it's seen, leaving
every later attempt for the same key untouched — genuinely different
real behavior from plain assignment, which always keeps the most
recent value.

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

Building a dictionary from a real, repeated stream of `(key, value)`
pairs sometimes needs to keep only the **first** value seen for each
key — every later occurrence of the same key should be ignored, not
overwrite it. Plain dictionary assignment (`d[key] = value`) always
does the opposite: the most recent assignment wins, silently discarding
whatever was there before.

## The Isolated Example

```python
line_values = {}

readings = [("X", 10), ("Y", 5), ("X", 99), ("Z", 3), ("Y", 88)]

for letter, value in readings:
    line_values.setdefault(letter, value)

print("only first value per key kept:", line_values)

overwritten = {}
for letter, value in readings:
    overwritten[letter] = value

print("plain assignment keeps the LAST value:", overwritten)
```

**Real output, run this session:**
```
only first value per key kept: {'X': 10, 'Y': 5, 'Z': 3}
plain assignment keeps the LAST value: {'X': 99, 'Y': 88, 'Z': 3}
```

**What this proves:** `X`'s real, second occurrence (`99`) never
overwrote its first value (`10`) in the `setdefault` version — the
dictionary correctly ends with `X: 10`, `X`'s real first-seen value.
The plain-assignment version, given the identical input, ends with
`X: 99` instead — the last value it happened to see. Same real input,
two genuinely different, both valid, real outcomes depending purely on
which mechanism was used.

## Mechanical Walkthrough

- `d.setdefault(key, value)` checks whether `key` **already exists**
  in `d`. If it doesn't, it sets `d[key] = value` and returns `value`.
  If it **does** already exist, it does nothing to `d` and simply
  returns the **existing** value instead — `value` (the argument just
  passed) is silently discarded in that case.
- This is a genuinely different real operation from `d[key] = value`,
  which always sets the value unconditionally, every single time,
  regardless of whether the key already existed.
- `setdefault` is also commonly used for its **return value** — a real,
  common idiom is `d.setdefault(key, []).append(item)`, which either
  creates a fresh empty list for a new key or returns the existing one,
  in either case letting `.append(...)` run against a real, guaranteed-
  to-exist list.

## CS Lens

This is a real, atomic "check, then set only if absent" operation,
expressed as a single real method call rather than a separate
`if key not in d: d[key] = value` — the identical real result, more
concisely, and (in genuinely concurrent contexts, though not relevant
to this project's own single-threaded use) without a real race
condition between the check and the set.

Also recognized in: `dict.get(key, default)` (a related, read-only
sibling — returns a fallback without ever modifying the dictionary at
all, distinct from `setdefault`'s own real side effect of inserting
when absent); `collections.defaultdict`, which generalizes this exact
"insert a default if missing" behavior to apply automatically on
**every** access, not just an explicit `setdefault` call.

## SE Lens

The real, practical signal for reaching for `setdefault` specifically:
whenever "first value wins" (or "create an empty collection to append
into") is the actual, intended real behavior — using plain assignment
by mistake in that situation is a real, easy, silent bug, since nothing
errors; it just quietly keeps the wrong (most recent, rather than
first) value with no warning at all.

## Connection

Directly relevant to any real "collect only the first real occurrence
per key" need — this project's own real code uses exactly this
mechanism to ensure only a line's first real value for a given letter
counts, matching G-code's own real convention that a repeated word on
one line is likely a mistake, not a meaningful override.

## Try It Yourself

1. Rewrite the `setdefault` version using an explicit `if letter not in
   line_values:` check instead, and confirm it produces the identical
   real result — `setdefault` is real, valid shorthand for this exact
   pattern, not a different behavior.
2. Use `d.setdefault(key, []).append(item)` to group a real list of
   `(category, item)` pairs into a dictionary of lists, one list per
   category — a real, common, idiomatic use beyond simple scalar
   values.
3. Compare `setdefault`'s real behavior against `dict.get(key,
   default)` on the identical dictionary — confirm `get` never
   modifies the dictionary even when the key is missing, while
   `setdefault` does.

## A Second Real Facet: `setdefault` with a Mutable Default — Grouping by Key

Every value seeded so far has been a real, plain scalar. A genuinely
common, different real use passes a **mutable** default — an empty
list — specifically to group every real value sharing a key together,
not just remember the first one:

```python
readings = [("X", 10), ("Y", 5), ("X", 12), ("Z", 3), ("Y", 8)]

grouped = {}
for letter, value in readings:
    grouped.setdefault(letter, []).append(value)

print("all real values grouped by letter:", grouped)
```

**Real output, run this session:**
```
all real values grouped by letter: {'X': [10, 12], 'Y': [5, 8], 'Z': [3]}
```

**What this proves:** every real reading, including repeats of the
same letter, ended up correctly grouped — `X`'s two real values (`10`,
`12`) both landed in the same real list, in order. This is a genuinely
different real use from this file's own first facet ("keep only the
first value") — here, `setdefault(letter, [])` returns the **same**
real list object on every call for an already-seen key (never creating
a fresh one), so `.append(value)` keeps adding to that one, real,
shared list rather than ever discarding a later value.

**Mechanical note:** this real idiom works specifically because
`setdefault` returns the value now stored at that key — whether it
just inserted the fresh `[]` or found an already-existing list from an
earlier call — so `.append(...)` always has a real, valid list to work
with, first occurrence or not.

### Try It Yourself (second facet)

1. Compare this technique against `collections.defaultdict(list)` —
   confirm it produces the identical real grouped result with slightly
   different real syntax (no explicit `[]` argument needed on each
   call).
2. Confirm the real, mutable-default risk this pattern deliberately
   relies on rather than avoids: check whether `grouped.setdefault(
   "X", [])` on a **second**, separate call for the same key returns
   the exact same real list object as the first call (`is`, not `==`)
   — direct, real proof of why `.append` correctly accumulates rather
   than resetting.
3. Extend the grouping example to also track each value's own original
   position (group `(position, value)` tuples instead of bare values)
   — a real, common refinement once grouped data needs to preserve more
   than just the grouped values themselves.
