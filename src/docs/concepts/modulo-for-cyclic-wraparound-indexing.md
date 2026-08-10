# Concept: Modulo for Cyclic Wraparound Indexing

**What you'll understand by the end:** how the modulo operator (`%`)
turns a plain incrementing/decrementing index into one that wraps
around a fixed-size sequence's real boundaries automatically, in both
directions — cycling from the last element back to the first, and from
the first back to the last.

**Prerequisites:** none beyond the assumed floor.

## Setup

None — plain Python, no packages.

## The Problem

Moving to the "next" or "previous" item in a fixed-size, real sequence
— cycling through search results, advancing a rotation, walking around
a clock face — needs to wrap around at the ends: past the last real
item should return to the first, and before the first should return to
the last. A plain `i + 1` or `i - 1` eventually walks off either end
of the sequence, needing an explicit boundary check every single time
unless the wraparound is handled structurally instead.

## The Isolated Example

```python
items = ["a", "b", "c", "d", "e"]
current = 3

def next_index(i, length):
    return (i + 1) % length

def previous_index(i, length):
    return (i - 1) % length

i = current
for _ in range(4):
    i = next_index(i, len(items))
    print("forward ->", i, items[i])

print("previous_index(0, 5):", previous_index(0, len(items)))
print("items[that index]:", items[previous_index(0, len(items))])
```

**Real output, run this session:**
```
forward -> 4 e
forward -> 0 a
forward -> 1 b
forward -> 2 c
previous_index(0, 5): 4
items[that index]: e
```

**What this proves:** starting from index `3` and calling
`next_index` repeatedly walked `4` (the real last index), then
genuinely **wrapped** straight to `0` (the real first index) with no
special-case code anywhere in `next_index` itself — the modulo
operation handled the boundary automatically. `previous_index(0, 5)`
— stepping backward from the very first index — correctly wrapped to
`4`, the real last valid index, not a negative or invalid one.

## Mechanical Walkthrough

- `%` (**modulo**) returns the real remainder of dividing its left
  operand by its right — `5 % 5` is `0`, because `5` divides evenly;
  `(i + 1) % length` therefore "resets" back to `0` exactly when `i +
  1` reaches `length` (one past the last real valid index).
- Python's own modulo operator returns a real, **non-negative** result
  for a positive right operand, even when the left operand is negative
  — `-1 % 5` is `4`, not `-1` — which is *exactly* why `(i - 1) %
  length` correctly wraps a decrement below `0` around to the real
  last index, with no explicit `if i < 0: i = length - 1` check needed
  anywhere. (This isn't universal across languages — some languages'
  `%` can return a real negative result for a negative left operand,
  meaning this exact trick doesn't port over unmodified.)
- The technique generalizes to stepping by more than one position at a
  time too: `(i + n) % length` correctly wraps regardless of how large
  or small `n` is, including multiple full wraps for a large enough
  `n`.

## CS Lens

This is **modular arithmetic** applied directly to indexing — treating
a fixed-size sequence's valid indices as points on a real, circular
number line (like a clock face's 12 positions) rather than a flat,
bounded range needing explicit edge checks. The same real underlying
math (`clock_hour % 12`) is why analog clock arithmetic and this
indexing technique are genuinely the same idea, just applied to
different real domains.

Also recognized in: circular/ring buffers (a fixed-size buffer whose
write position wraps around via modulo once full); hash table bucket
indexing (`hash(key) % num_buckets`, the identical real technique
mapping an unbounded range onto a fixed-size one); any round-robin
scheduling algorithm cycling through a fixed real list of participants.

## SE Lens

The real, practical payoff over explicit boundary checks: `(i + 1) %
length` is a single, real expression correct for every case (including
`length == 1`, where every step "wraps" back to the same single valid
index) — an explicit `if i + 1 >= length: i = 0 else: i = i + 1`
version says the identical thing with more real code and more chances
to get a boundary condition subtly wrong (an off-by-one on `>=` vs.
`>`, say). The real, honest limit: this technique assumes `length` is
genuinely fixed and known at the point of computing the next index —
if the underlying sequence can change size *between* computing an index
and using it, the wraparound math and the actual indexing could
disagree, a real, separate risk to watch for in genuinely dynamic
sequences.

## Connection

Directly relevant to any real "cycle through a fixed list, wrapping at
both ends" feature — a search feature's Next/Previous match cycling is
exactly this shape, real positions advancing and wrapping via `%
len(matches)` rather than hand-written boundary checks. A real,
applied instance of this file's own second facet, from this project's
own history: a circular-arc interpolator normalizing a G-code arc's
real swept angle into `[0, 2π)` via the identical `%=` mechanism, with
the identical zero-after-wraparound correction (a same-angle start and
end reinterpreted as a full circle, not zero motion) worked out
independently for the exact same real reason this file's own second
facet demonstrates.

## Try It Yourself

1. Set `length` to `1` and confirm both `next_index` and
   `previous_index` always return `0` — the real, correct behavior for
   a single-item sequence with no real "other" position to wrap to.
2. Compute `next_index` applied `n` times in a row, for an `n` larger
   than `length` (say, stepping forward 12 times through a 5-item
   list) and confirm it lands on the identical real index as a single
   call to `(current + 12) % length` — repeated single steps and one
   combined step agree.
3. Try the identical technique in a language whose `%` operator can
   return a negative result for a negative left operand (research
   which languages do this) and identify what adjustment the
   `previous_index` formula would need there to still wrap correctly.

## A Second Real Facet: Continuous-Value Wraparound, and a Genuine Zero-Ambiguity It Introduces

Every use above wraps a **discrete integer index**. The identical `%`
mechanism wraps a **continuous, real-valued** quantity — an angle —
into a canonical range too, but doing so surfaces a real ambiguity
this file's discrete examples never face.

```python
import math


def normalized_sweep(start_angle, end_angle, clockwise):
    if clockwise:
        sweep = start_angle - end_angle
    else:
        sweep = end_angle - start_angle
    sweep %= 2 * math.pi
    if sweep == 0:
        sweep = 2 * math.pi  # zero after wraparound means a FULL circle here, not none
    return sweep


print("quarter turn:", normalized_sweep(0, math.pi / 2, clockwise=False))
print("start == end (same angle):", normalized_sweep(math.pi / 2, math.pi / 2, clockwise=False))
```

**Real output, run this session:**
```
quarter turn: 1.5707963267948966
start == end (same angle): 6.283185307179586
```

**What this proves:** `sweep %= 2 * math.pi` correctly normalizes a
quarter turn to `π/2`. But when `start_angle` and `end_angle` are
**identical**, the raw subtraction is `0`, and `0 % (2 * math.pi)` is
still `0` — genuinely indistinguishable, by the modulo operation
alone, from "no rotation happened." An explicit, additional check
(`if sweep == 0: sweep = 2 * math.pi`) is what correctly reinterprets
that `0` as **a full circle** — confirmed by the second call's real
output, `6.283185307179586`, which is `2 * math.pi`, not `0.0`.

**Mechanical note — why this ambiguity has no discrete counterpart:**
in this file's own `next_index`/`previous_index` examples, an index
landing back on `0` after wraparound is never ambiguous — it
unambiguously means "the first element," a real, distinct, meaningful
position, with no competing interpretation. A **swept angle** of `0`
is different: it's the natural result both when literally nothing
rotated *and* when a rotation went exactly, fully around back to its
own starting angle — two genuinely different, real physical
situations that modulo alone cannot tell apart, since arithmetic sees
identical inputs (`start == end`) either way. Resolving that ambiguity
requires **domain knowledge** external to the modulo operation itself
— here, the real fact that "a same-angle start and end always means a
full circle was swept, never zero motion" (a zero-length move simply
wouldn't be represented as an arc at all).

### Try It Yourself (second facet)

1. Call `normalized_sweep` with `start_angle` and `end_angle` a tiny,
   nonzero real distance apart (e.g. `0` and `0.0001`) and confirm the
   result is a small positive sweep, not `2 * math.pi` — real proof the
   zero-correction only fires for an *exact* match, not "very close."
2. Reason about (then confirm) whether `clockwise=True` versus `False`
   changes which raw difference gets computed, but *not* whether the
   same zero-ambiguity correction is still needed in both directions.
3. Compare this facet's real correction against `previous_index(0,
   len(items))` from this file's own first, discrete facet — explain
   concretely why the discrete version never needed an equivalent "is
   this actually zero, or does zero mean something else" check.

## A Third Real Facet: `math.fmod` Takes the Sign of the Dividend, `%` Takes the Sign of the Divisor

This file's own first facet leans on a specific, real fact about
Python's `%`: `-1 % 5` is `4`, a **non-negative** result, which is
exactly what makes the wraparound trick work with no extra sign
handling. Python's standard library also provides `math.fmod`, a
second, genuinely different real function for "the remainder of
dividing `a` by `b`" — and it does **not** share that sign behavior:

```python
import math

print("math.fmod(-7, 3):", math.fmod(-7, 3))
print("Python -7 % 3:", -7 % 3)
print("math.fmod(7, -3):", math.fmod(7, -3))
print("Python 7 % -3:", 7 % -3)
```

**Real output, run this session:**
```
math.fmod(-7, 3): -1.0
Python -7 % 3: 2
math.fmod(7, -3): 1.0
Python 7 % -3: -2
```

**What this proves:** for the identical real inputs, `math.fmod` and
`%` genuinely disagree — `math.fmod(-7, 3)` is `-1.0` (negative,
matching the sign of `-7`, the **dividend**), while `-7 % 3` is `2`
(non-negative, matching the sign of `3`, the **divisor**). The second
pair shows the same real split from the other direction: `math.fmod(7,
-3)` is positive (`1.0`, matching `7`'s sign), while `7 % -3` is
negative (`-2`, matching `-3`'s sign).

**Mechanical note — why this matters, not just as trivia:** this
file's own first facet's wraparound trick (`(i - 1) % length` correctly
wrapping a negative index to the real last valid one) depends
**specifically** on `%`'s divisor-sign behavior — substituting
`math.fmod` into that same wraparound formula would silently produce a
real, negative, invalid index for exactly the case the trick exists to
handle. `math.fmod` exists because it matches C's own `fmod` (and
many other languages' `%`) — genuinely useful when interoperating with
code or a real spec written against *that* convention, but the wrong
real choice for Python's own cyclic-indexing idiom this file teaches.

### Try It Yourself (third facet)

1. Substitute `math.fmod` into `previous_index` in place of `%` and
   run it against `previous_index(0, 5)` — confirm it produces a real,
   negative, invalid index instead of the correct wraparound to `4`.
2. Find a real language or spec (C, Java's `%`, or a documented binary
   file format) whose own remainder operator matches `math.fmod`'s
   sign convention rather than Python's `%` — reasoning about why
   `math.fmod` exists in Python's standard library at all, given `%`
   already covers the common, everyday case.
3. Compute `math.fmod(-7, 3) == -7 % 3` and confirm it's `False` —
   direct, real proof these are two genuinely different functions, not
   two spellings of the identical operation.
