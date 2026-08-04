# Concept: A General Solution Correctly Handles Its Own Special Cases, With No Extra Code

**What you'll understand by the end:** why writing one function that
correctly solves the *general* version of a problem often means a
seemingly distinct "special case" is already handled correctly too,
automatically, purely because it's a degenerate instance of the same
general math — with no dedicated branch needed for it at all.

**Prerequisites:** `avoid-premature-abstraction.md`.

## Setup

Python 3, no packages needed.

## The Problem

A function solving a general real problem ("interpolate between two
values") sometimes has an obvious-looking special case sitting inside
its own input space — what if the two values happen to be *the same*?
It's tempting to reach for a dedicated `if start == end: return
[start] * steps` branch to "handle" that case explicitly, assuming the
general formula might not behave correctly (or might look wasteful)
when nothing is actually changing.

## The Isolated Example

```python
def interpolate(start, end, steps):
    return [start + (end - start) * (i / (steps - 1)) for i in range(steps)]


# The general case: genuinely different start and end values.
print("changing value, 5 steps:", [round(v, 2) for v in interpolate(0.0, 10.0, 5)])

# The "special" case a programmer might be tempted to special-case:
# start and end are the SAME value (no real change at all).
print("constant value, 5 steps: ", [round(v, 2) for v in interpolate(5.0, 5.0, 5)])
```

**Real output, run this session:**
```
changing value, 5 steps: [0.0, 2.5, 5.0, 7.5, 10.0]
constant value, 5 steps:  [5.0, 5.0, 5.0, 5.0, 5.0]
```

**What this proves:** `interpolate` was written with **zero** special
handling for `start == end` anywhere in its own body — it's the exact
same one-line formula both times. When `start` and `end` genuinely
match, `end - start` naturally evaluates to `0`, and `start + 0 *
(anything)` is just `start`, every single step — the general formula
already, correctly produces a constant sequence, with no dedicated
branch required to make that happen.

## Mechanical Walkthrough

- `interpolate`'s own formula, `start + (end - start) * fraction`, is
  a real, general **linear interpolation** ("lerp") — it works for any
  real `start`/`end` pair, including a pair that happens to be equal.
- When `end - start` is genuinely `0` (the "special" case), the
  formula's own multiplication term vanishes on its own — not because
  any code detected and handled that case, but because the *math
  itself* naturally degenerates to the correct constant answer.
- No `if start == end` branch exists anywhere — the general formula's
  own correctness already covers every real input, including the
  boundary case a less careful implementation might have felt the need
  to special-case defensively.
- This only works because the general formula is genuinely correct at
  the boundary — recognizing *that* it's correct there (rather than
  assuming a special case always needs its own explicit handling) is
  the real, worthwhile thing to check before reaching for an
  unnecessary branch.

## CS Lens

This is a real instance of exploiting **mathematical degeneracy** — a
"special case" is often not a genuinely separate scenario requiring
separate logic, but a specific, valid point within the exact same
general input space the general solution already, correctly covers.
Recognizing a special case as a degenerate instance of the general one
(rather than as a fundamentally different problem) is what allows a
single, general implementation to subsume it for free.

Also recognized in: a general `pow(x, n)` function correctly returning
`1` for `n == 0` with no dedicated zero-exponent branch, because the
underlying mathematical definition already degenerates correctly
there; a general "distance between two points" formula correctly
returning `0` for two identical points, with no special "same point"
check; a general recursive algorithm's own base case often being
nothing more than the general recursive step evaluated at its own
smallest valid input, rather than a conceptually separate rule.

## SE Lens

The real, practical payoff: **less code**, and less code means fewer
real places a bug can hide — a dedicated special-case branch is itself
a second implementation that could disagree with the general one, has
to be tested separately, and has to be kept in sync if the general
formula ever changes. The real, honest risk on the other side: not
every apparent special case actually *is* a correct degenerate
instance of the general formula — verifying that it genuinely produces
the right answer (as this file's isolated example does directly,
rather than assuming it) is a real, necessary step before skipping the
defensive branch; a special case that the general formula gets
*wrong* absolutely does need its own explicit handling.

## Connection

Builds on `avoid-premature-abstraction.md`'s own judgment-call
discipline, applied here in the opposite direction — this is a case
*against* adding extra code (a special-case branch) that isn't
actually needed, for a closely related underlying reason: unnecessary
code, whether a premature abstraction or an unneeded special case,
both add real complexity without a genuine, corresponding benefit. A
real, applied instance in this project's own history: a circular-arc
interpolator's Z-axis coordinate, computed with the exact same linear
interpolation used for every other varying quantity along the arc —
when a real program's Z value happens to stay constant across an arc
(the ordinary, flat case), the general formula already produces a
flat Z automatically; when Z genuinely changes across the sweep (a
real helical move), the identical, unmodified formula produces a
correct helix — one general formula, two real outcomes, with no
dedicated "is this a helix" branch anywhere in the code.

## Try It Yourself

1. Call `interpolate` with `steps=1` and observe what happens — reason
   about whether this is a real, additional degenerate case the
   current formula handles correctly, or a genuine edge case (division
   by `steps - 1`) that would need its own explicit guard.
2. Write a deliberately special-cased version (`if start == end: return
   [start] * steps`) alongside the general one, and confirm both
   produce identical real output for the constant-value case — direct,
   concrete proof the special case was genuinely redundant, not just
   assumed to be.
3. Think of (or find, in a real codebase) a function with an `if`
   branch explicitly handling what looks like a special case, and
   check whether removing the branch and letting the general logic run
   unmodified still produces the correct result — a real, concrete test
   of whether that branch was ever actually necessary.
