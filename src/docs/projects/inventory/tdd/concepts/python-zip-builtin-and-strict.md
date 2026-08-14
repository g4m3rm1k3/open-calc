# Concept: `zip()` and Its `strict=True` Length Check

**What you'll understand by the end:** how `zip()` pairs up elements
from several real sequences positionally, its real default behavior
when the sequences have different lengths, and how `strict=True`
(Python 3.10+) turns a silent, potentially-wrong truncation into a
real, explicit error.

**Prerequisites:** `python-tuple-unpacking.md`.

## Setup

Python 3.10+ for `strict=True` specifically (`zip()` itself is much
older); no packages needed.

## The Problem

Combining two or more real, separate sequences element-by-element — a
list of names alongside a list of scores, say — needs some way to walk
them together, pairing up corresponding positions, rather than
indexing into each one separately by hand.

## The Isolated Example

```python
names = ["Ana", "Lee", "Sam"]
scores = [90, 85, 78]

pairs = list(zip(names, scores))
print("zip pairs:", pairs)

for name, score in zip(names, scores):
    print(f"{name}: {score}")

short_scores = [90, 85]
print("mismatched lengths, default zip:", list(zip(names, short_scores)))

try:
    list(zip(names, short_scores, strict=True))
except ValueError as e:
    print(f"ValueError: {e}")
```

**Real output, run this session:**
```
zip pairs: [('Ana', 90), ('Lee', 85), ('Sam', 78)]
Ana: 90
Lee: 85
Sam: 78
mismatched lengths, default zip: [('Ana', 90), ('Lee', 85)]
ValueError: zip() argument 2 is shorter than argument 1
```

**What this proves:** `zip(names, scores)` correctly paired each real
name with its corresponding score, in order. With mismatched lengths
(`names` has 3 elements, `short_scores` has 2), plain `zip()` silently
stopped at the **shorter** sequence — `"Sam"` was silently dropped,
with no error or warning at all. `strict=True`, given the identical
mismatched inputs, raised a real, explicit `ValueError` instead.

## Mechanical Walkthrough

- `zip(a, b)` returns a real, lazy iterator (per `python-iterators.md`'s
  own framing) yielding one tuple per position: `(a[0], b[0])`, `(a[1],
  b[1])`, and so on.
- By **default**, `zip()` stops as soon as the **shortest** input
  sequence is exhausted — any extra elements in a longer sequence are
  silently ignored, never included in any yielded tuple.
- `zip(a, b, strict=True)` performs the identical pairing, but
  additionally checks, once any input is exhausted, whether **every**
  input was exhausted at the same position — if one sequence still had
  elements remaining when another ran out, it raises a real
  `ValueError` immediately, rather than silently continuing or
  finishing early.
- This is real, deliberate, opt-in strictness — `strict=True` isn't
  the default (for backward compatibility with decades of existing
  code relying on the silent-truncation behavior), so it must be
  explicitly requested wherever it matters.

## CS Lens

This is a real, small instance of **fail-fast validation**
(`fail-fast-validation.md`'s own idea) applied to an iteration
primitive: rather than silently producing a partial, possibly-
misleading result when an underlying invariant (both sequences are
meant to be the same length) is violated, `strict=True` surfaces the
violation immediately and loudly. Plain `zip()`'s default behavior is
itself a real, deliberate design choice too — genuinely useful when
"stop at the shorter one" is exactly the intended behavior (pairing an
infinite or open-ended sequence with a fixed one, for instance).

Also recognized in: any API offering both a lenient default and an
opt-in strict mode for the identical underlying operation — the same
real tradeoff `python-mypy-static-type-checking.md`'s own configurable
checks represent, lenient by default, tightened deliberately where it
matters.

## SE Lens

The real, practical risk plain `zip()` carries: two sequences that
*should* always be the same length, but silently aren't due to a real,
upstream bug, produce a plausible-looking, genuinely wrong result with
zero indication anything went wrong — exactly the kind of silent data
loss `strict=True` exists to catch. The real, correct default choice:
reach for `strict=True` whenever the two sequences are expected to be
in lockstep by a real, load-bearing assumption (as with pairing two
same-length line ranges in a diff), and leave it off only when
mismatched lengths are a genuinely normal, expected case.

## Connection

Builds on `python-tuple-unpacking.md` (each yielded pair is unpacked
the identical, already-covered way) and shares its underlying
philosophy with `fail-fast-validation.md`.

## Try It Yourself

1. Zip three sequences together at once (`zip(a, b, c)`) and confirm
   each yielded item is now a real 3-tuple, not a pair — `zip` accepts
   any number of input sequences.
2. Deliberately make all three inputs to a `strict=True` call the same
   length and confirm it produces the identical real result as plain
   `zip()` — `strict=True` only ever changes behavior when lengths
   genuinely differ.
3. Look up `itertools.zip_longest` — the real, opposite alternative,
   padding the *shorter* sequence with a fill value instead of either
   truncating or raising — and decide which of the three real
   behaviors (`zip`, `zip(strict=True)`, `zip_longest`) best fits a
   real scenario of your own choosing.

## A Second Real Facet: `itertools.zip_longest` — the Opposite Real Choice

`strict=True` treats a length mismatch as **a bug** — something that
should never happen, worth stopping the program for. A real, different
situation treats a length mismatch as **real, expected, meaningful
data** — worth representing explicitly, not erroring on at all:

```python
from itertools import zip_longest

channel_a_waits = [10, 20, 30]
channel_b_waits = [15, 25]

pairs = list(zip_longest(channel_a_waits, channel_b_waits))
print("paired by order of occurrence, mismatch made EXPLICIT:", pairs)

pairs_filled = list(zip_longest(channel_a_waits, channel_b_waits, fillvalue="MISSING"))
print("with a custom real fill value:", pairs_filled)

try:
    list(zip(channel_a_waits, channel_b_waits, strict=True))
except ValueError as e:
    print(f"zip(strict=True) refuses instead: {e}")
```

**Real output, run this session:**
```
paired by order of occurrence, mismatch made EXPLICIT: [(10, 15), (20, 25), (30, None)]
with a custom real fill value: [(10, 15), (20, 25), (30, 'MISSING')]
zip(strict=True) refuses instead: zip() argument 2 is shorter than argument 1
```

**What this proves:** `zip_longest`, given the identical real
mismatched inputs `zip(strict=True)` refuses to process at all,
instead produced a complete, real pairing — `channel_a`'s third,
unmatched value (`30`) paired with a real, explicit `None` (or a
custom fill value) rather than being silently dropped or truncated.
Both real functions handle the identical mismatch, but hand it back to
the caller in two deliberately different, both-correct ways.

**The real, honest distinction driving the choice:** `strict=True` is
correct when a length mismatch represents a genuine, internal
**invariant violation** — two sequences that were always *supposed* to
be the same length, where a mismatch signals a real, upstream bug.
`zip_longest` is correct when a mismatch is real, **legitimate,
meaningful input** — this project's own real case: two machine
channels genuinely can have a different number of wait codes, and that
*is itself* the real, important fact worth surfacing (a genuine
program error that would deadlock the real machine — one channel
waiting forever for a partner that never arrives), not something to
crash the whole analysis over.

### Try It Yourself (second facet)

1. Use the paired output to write a real check flagging every pair
   containing a `None` — direct, real "this is where the mismatch
   is" reporting, made possible by `zip_longest`'s own explicit fill
   value.
2. Compare `zip_longest`'s output length against plain `zip`'s (no
   `strict`) on the identical mismatched inputs — confirm plain `zip`
   silently drops the extra element entirely, while `zip_longest`
   genuinely preserves and reports it.
3. Write one sentence, for a real, new pairing problem of your own,
   stating which of the three real behaviors (`zip`, `zip(strict=True)`,
   `zip_longest`) is correct and why — practicing the real judgment
   call this file's own two facets exist to teach.
