# Concept: `list.sort(key=...)` — Sorting Without Relying on Full Comparability

**What you'll understand by the end:** why sorting a list of tuples
whose second element isn't inherently orderable needs an explicit
`key=` function, and the real, concrete crash it avoids the moment two
first elements tie.

**Prerequisites:** `python-classes-instances.md`.

## Setup

Python 3, no packages needed.

## The Problem

Sorting a list of `(position, item)` pairs by `position` alone seems
like it should just work with plain `.sort()` — Python compares tuples
element by element, so it starts by comparing the positions anyway.
The real, easy-to-miss risk: if two positions are ever equal, Python
falls through to comparing the *second* element too, and that second
element may not support comparison at all.

## The Isolated Example

```python
class Token:
    def __init__(self, text):
        self.text = text

    def __repr__(self):
        return f"Token({self.text!r})"


positioned = [(5, Token("X10")), (0, Token("G1")), (2, Token("Y20"))]

# The CORRECT way: an explicit key= comparing only the position.
positioned.sort(key=lambda item: item[0])
print("sorted with key=:", positioned)

# The RISKY way: sorting the tuples directly, with no key.
# This "works" here only because no two positions are equal.
positioned2 = [(5, Token("X10")), (0, Token("G1")), (2, Token("Y20"))]
positioned2.sort()
print("sorted with NO key (no ties, so it happens to work):", positioned2)

# But if two positions DO tie, Python falls through to comparing the
# TOKENS themselves -- which have no real ordering defined -- and crashes.
tied = [(0, Token("G1")), (0, Token("N100"))]
try:
    tied.sort()
except TypeError as e:
    print(f"TypeError: {e}")

# The key= version handles the tie without ever comparing the Tokens:
tied.sort(key=lambda item: item[0])
print("sorted with key= despite a tie:", tied)
```

**Real output, run this session:**
```
sorted with key=: [(0, Token('G1')), (2, Token('Y20')), (5, Token('X10'))]
sorted with NO key (no ties, so it happens to work): [(0, Token('G1')), (2, Token('Y20')), (5, Token('X10'))]
TypeError: '<' not supported between instances of 'Token' and 'Token'
sorted with key= despite a tie: [(0, Token('G1')), (0, Token('N100'))]
```

**What this proves:** with no ties in the data, plain `.sort()` with no
`key` genuinely produced the identical, correct real result as the
`key=` version — the risk was invisible in this specific data. The
moment two positions **tie** (`(0, Token("G1"))` and `(0,
Token("N100"))`), plain `.sort()` genuinely **crashes** — Python
compares the tuples' first elements (`0 == 0`, a tie), then falls
through to comparing the second elements (`Token` instances), which
have no `<` defined at all, raising a real `TypeError`. The `key=`
version handles the identical tied data with no error, because it
never compares the `Token` objects at all — only ever the extracted
position.

## Mechanical Walkthrough

- `list.sort()` with no arguments compares elements using their own
  natural ordering — for tuples, that means comparing element-by-
  element, left to right, only moving to the next element if the
  current ones are equal.
- `list.sort(key=function)` instead computes `function(item)` for every
  real element **once**, and sorts based purely on those computed
  values — the original elements are still what ends up in the sorted
  list, but the *comparison* only ever looks at what `key` extracted.
- `lambda item: item[0]` extracts just the position from each
  `(position, Token)` pair — `Token` objects are never compared to each
  other at all, because the sort never needs to look past the
  (always-unique-enough, or explicitly accepted-as-tied) key value.
- A real `TypeError` on `<` between two objects means Python attempted
  a genuine comparison between them and found no `__lt__` method (or
  equivalent) telling it how — `Token` here defines no ordering at all,
  which is completely reasonable for a class with no natural "less
  than" meaning.

## CS Lens

This is a **key-extraction sort** — separating "what to compare" from
"what to actually sort," a real, common and deliberate design in
sorting APIs across many languages, precisely because forcing every
element type in a collection to support full ordering (implementing
`<`, `>`, and friends) is often unnecessary and sometimes genuinely
meaningless (there's no natural, real "less than" between two `Token`
objects). A `key` function lets sorting work with *any* type, as long
as *something* extractable from it is orderable.

Also recognized in: JavaScript's `Array.prototype.sort((a, b) => ...)`
comparator functions, SQL's `ORDER BY <expression>` (sorting by a
computed expression rather than requiring the whole row to be
comparable), and `sorted(iterable, key=...)` — Python's own
non-mutating sibling of `.sort()`, sharing the identical `key=`
mechanism.

## SE Lens

The real, practical risk of skipping `key=` when it's genuinely needed:
the bug is **data-dependent** — it stays completely invisible in
testing or production until the first real tie actually occurs, then
crashes with a real, possibly confusing `TypeError` about a completely
unrelated class (`Token`) rather than anything obviously about sorting.
Using `key=` explicitly whenever a tuple's non-key elements aren't
guaranteed comparable removes this risk entirely, rather than depending
on the data never happening to tie.

## Connection

Builds on `python-classes-instances.md`. A real, applied instance in
this project's own history: sorting `(position, Token)` pairs by
position alone, using exactly this file's own `key=` technique, to
correctly reassemble a line's tokens in original order after they were
identified out of order across multiple separate scanning passes.

A second, real, applied instance: merging two independently-built
lists of real events (motion segments and wait markers) that share the
same line-number space into one real, chronological timeline, sorted
by a real, composite `(line_index, is_wait)` tuple key — the same
two-part key shape this file's own second facet already establishes
(a primary field, then a tie-break), used here so that a wait event
and a motion event landing on the identical line number resolve to a
real, deterministic, meaningful order rather than whatever order
Python's stable sort happened to preserve them in from the original,
separately-built lists.

## Try It Yourself

1. Add `__lt__` to `Token` (comparing by `.text`) and confirm plain
   `.sort()` with no `key` now works even with tied positions — direct,
   real proof the crash was specifically about `Token` lacking any
   defined ordering, not about tuples or sorting in general.
2. Use `sorted(positioned, key=lambda item: item[0])` (the non-mutating
   version) instead of `.sort()` and confirm it returns a new, sorted
   list while leaving the original list's own order untouched.
3. Sort a real list of dictionaries by one specific key
   (`sorted(records, key=lambda r: r["age"])`) — confirming the
   identical `key=` technique generalizes cleanly beyond tuples to any
   real type a useful sort key can be extracted from.

## A Second Real Facet: a Boolean as the Primary Sort Key

A real, richer `key=` can return a **tuple** — sorted lexicographically,
comparing the first element first, falling back to the second only on
a tie. A genuinely useful, idiomatic real trick: using a **boolean**
expression as that first element, to control which group of items
sorts first:

```python
class Pair:
    def __init__(self, line):
        self.line = line

    def __repr__(self):
        return f"Pair({self.line!r})"


pairs = [Pair(30), Pair(None), Pair(10), Pair(None), Pair(20)]

pairs.sort(key=lambda p: (p.line is None, p.line))
print(pairs)
```

**Real output, run this session:**
```
[Pair(10), Pair(20), Pair(30), Pair(None), Pair(None)]
```

**What this proves:** every real, non-`None` `Pair` sorted **before**
every `None` one, and the non-`None` ones sorted correctly among
themselves by their own real value (`10`, `20`, `30`) — all from one
single, real `key=` expression, with no separate pass or explicit
`if`/`else` branching needed anywhere.

**Mechanical note:** `p.line is None` evaluates to a real Python
`bool` — and Python's `bool` is a real subclass of `int`
(`python-isinstance.md`'s own Try It Yourself #1 already notes this),
where `False` (`0`) sorts before `True` (`1`). Using it as the
**first** element of a tuple key means every item where the condition
is `False` (a real, non-`None` line) sorts entirely before every item
where it's `True` (`None`) — the second tuple element (`p.line`
itself) then only matters for breaking ties *within* each of those two
real groups, since Python's own tuple comparison only consults a later
element when every earlier one is equal.

### Try It Yourself (second facet)

1. Reverse the boolean condition (`p.line is not None`) and confirm
   the sort order flips — `None` values now sort first instead of
   last, direct, real proof of exactly which boolean value controls
   which group goes where.
2. Add a real, third tuple element as a further tiebreaker (say, an
   `id`) and confirm it only ever gets consulted when the first two
   elements are equal for two different real items.
3. Rewrite the identical sort using two explicit passes (partition into
   non-`None` and `None` groups, sort each separately, concatenate) and
   compare the real amount of code against the one-line tuple-key
   version — reasoning about which you find easier to read correctly
   at a glance.
