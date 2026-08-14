# Concept: `math.floor` — Rounding Down, Not to the Nearest

**What you'll understand by the end:** why "round down" and "round to
the nearest whole number" are genuinely different operations, and how to
get the specific one you mean.

**Prerequisites:** none.

## Setup

Any Python 3 install — `math` is standard library, no install needed:
`import math`.

## The Problem

A real G-code can carry a decimal suffix that still means the same base
code — `G43.1` is a variant of `G43` (tool length compensation), not a
different, unrelated code. Deciding "which case does this number belong
to" needs to strip that suffix down to the code's whole-number identity
— and Python's built-in `round()` is the wrong tool for that: `round(43.6)`
gives `44` (nearest), not `43` (the actual `G43` family).

## The Isolated Example

```python
import math

print(math.floor(43.1))
print(math.floor(43.9))
print(round(43.9))
print(math.floor(-1.5))
```

**Real output, run this session:**
```
43
43
44
-2
```

**What this proves:** `math.floor` always moves *toward negative
infinity*, regardless of how close the decimal part is to the next whole
number — `43.9` floors to `43`, not `44`, exactly the behavior a
`G43.9`-style suffix needs (still `G43`). `round(43.9)`, by contrast,
gives `44` — proof the two functions solve genuinely different problems,
not the same one with different names. `math.floor(-1.5)` giving `-2`
(not `-1`) confirms "toward negative infinity," not "toward zero" —
a real, easy place to guess wrong.

## Mechanical Walkthrough

- `import math` — **(a) first appearance** — `math` is a Python standard-library
  module, not a builtin; unlike `len()` or `round()`, it has to be
  imported before its functions are available.
- `math.floor(x)` — **(a) first appearance** — returns the largest whole
  number less than or equal to `x`, as a real `int`, always rounding
  toward negative infinity.
- `round(x)` — **(b) reappearing**, already-known basic Python — rounds to
  the *nearest* whole number, included here specifically to contrast
  against `floor`, not to introduce it fresh.

## CS Lens

`floor` and `round` are two different real functions from the broader
family of **rounding modes** — a numeric value's exact representation
often can't be used directly where only a whole number makes sense
(an array index, a fixed set of dispatch cases), and *which* rounding
mode applies changes the real answer, not just its precision.

Also recognized in: `math.ceil` (floor's mirror, rounding toward positive
infinity), integer division's own truncation behavior in several
languages (which floors for positive numbers but truncates toward zero
for negative ones — a real, historic source of off-by-one bugs), and any
pricing system rounding currency down specifically to avoid ever
overcharging by a fraction of a cent.

## SE Lens

Using `round()` where `floor()` was actually meant is a real, quiet bug
class: it produces the *correct* answer for every input that happens to
round down anyway, and a *wrong* one only for inputs past the halfway
point — exactly the kind of bug that passes casual testing and fails on
a real, specific input later. Naming the intended rounding mode
explicitly (`floor`, not a bare `round` trusted to "probably" do the
same thing) removes that whole class of doubt.

## Connection

Directly relevant to `core/parser.py`'s own `_apply_g_code`: a real
G-code number like `43.1` needs to floor to `43` to select the right
dispatch case, mirroring `cnc/engineGCodeApply.ts`'s own real
`Math.floor(g2)` line exactly — JavaScript's `Math.floor` and Python's
`math.floor` are the same real operation, one language's standard
library instead of another's.

## Try It Yourself

1. Compute `math.floor(43.1 * 10) / 10` by hand for `g = 43.14` and
   confirm it lands on `43.1`, not `43.14` or `43` — tracing exactly what
   the real `g2 = round(g * 10) / 10` line does before `floor` ever runs:
   it first rounds to one decimal place, *then* floors that rounded value
   to a whole number.
2. Compare `math.floor(2.0)` against `math.trunc(2.0)` for a negative
   input, `-2.5` — confirm they disagree specifically on negative,
   non-whole numbers, and read `math.trunc`'s own real definition
   ("toward zero") to see why.
3. Look up why `int(-1.5)` in Python performs truncation (`-1`), not
   flooring (`-2`) — the same two real, different operations, reachable
   through two different, easy-to-confuse spellings.
