# Concept: `math.atan2` — the Angle of a Point, Not Just a Ratio

**What you'll understand by the end:** why finding "the angle of this
point relative to the origin" needs a two-argument function, not
`atan(y / x)`, and how `atan2` avoids both a division-by-zero crash and a
lost quadrant.

**Prerequisites:** `radians-rotation-unit.md`.

## Setup

Python 3, no packages needed — `math` is standard library.

## The Problem

Given a point `(x, y)`, "what angle is this point at, measured from the
positive X axis" is a common real question — but the naive approach,
`math.atan(y / x)`, has two real problems: it crashes with
`ZeroDivisionError` the moment `x` is `0` (straight up or down), and even
when it doesn't crash, `atan` alone can't tell `(1, 1)` apart from `(-1,
-1)` — both give the same ratio (`1`), but they're on opposite sides of
the origin, 180° apart.

## The Isolated Example

```python
import math

print(math.atan2(1, 1))
print(math.atan2(1, -1))
print(math.atan2(-1, -1))
print(math.atan2(-1, 1))
print(math.atan(1 / 1))
print(math.atan2(1, 0))
```

**Real output:**
```
0.7853981633974483
2.356194490192345
-2.356194490192345
-0.7853981633974483
0.7853981633974483
1.5707963267948966
```

**What this proves:** `math.atan2(y, x)` gives four genuinely different
answers for four points that all share `|y| = |x| = 1` — it knows which
quadrant the point is actually in, something `atan(y / x)` structurally
cannot, since division throws away the individual signs of `y` and `x`
the moment it computes their ratio. `math.atan2(1, 0)` — straight up,
where `y / x` would be `1 / 0` — returns a real answer, `π / 2`
(90°, matching `radians-rotation-unit.md`), instead of crashing.

## Mechanical Walkthrough

- `math.atan2(y, x)` takes `y` *first*, `x` second — the reverse of how
  the fraction `y / x` reads, a common source of transposed-argument
  bugs when first using it.
- It returns an angle in radians, in the range `(-π, π]`, measured
  counterclockwise from the positive X axis — `(1, 0)` is `0`, `(0, 1)`
  is `π/2`, `(-1, 0)` is `π`, `(0, -1)` is `-π/2`.
- Unlike `math.atan`, it takes the point's two components *separately*,
  never forming the ratio `y / x` at all internally — which is exactly
  why `x = 0` doesn't crash it, and why the sign information that a plain
  division would discard is preserved.

## CS Lens

This is the real, general problem of recovering an angle from Cartesian
coordinates — converting `(x, y)` to `(r, θ)`, polar form. `atan2` is the
standard library's answer to "do this correctly, including the
edge cases," rather than leaving every caller to hand-roll their own
quadrant-correction logic on top of plain `atan`.

Also recognized in: robotics (heading from a velocity vector), game
physics (aiming a turret at a target point), signal processing (phase
angle of a complex number, `cmath.phase` is `atan2` under another name).

## SE Lens

The real, concrete reason this matters for computing a circular arc's
start and end angle around a real center point: the center is rarely at
the origin, and the point being measured can be in any of the four
quadrants relative to it, including directly above/below/left/right
(where a naive ratio would divide by zero). Computing `math.atan2(y -
center_y, x - center_x)` — the offset from center, not the raw
coordinate — is what makes this correct for *any* real center, not just
one conveniently placed at `(0, 0)`.

## Connection

`radians-rotation-unit.md` (the unit `atan2`'s return value is
measured in). This project's own first real use is computing a circular
arc's start and end angle relative to its real, resolved center point
(`core/path.py`'s `_add_arc_points`). A real, further instance from
later in this project's own history, on the *parsing* side rather than
the geometry side: a macro-expression grammar's real `ATAN` function
turned out to have two genuinely different forms — an ordinary,
one-argument arctangent, and a real two-argument `ATAN[Y]/[X]` syntax
serving exactly the purpose this file's own two-argument `atan2`
serves, resolved by the parser via one-token lookahead (see
`recursive-descent-expression-parsing.md`'s own second facet) — the
identical real two-argument need this file explains at the math level,
surfacing again at the grammar level.

## Try It Yourself

1. Compute `math.atan2(0, -1)` and `math.atan2(0, 1)` — two points on the
   X axis, opposite sides of the origin. Confirm they're genuinely
   different (`π` vs. `0`), even though both have `y = 0` and would
   produce the identical, useless `atan(0/x) = 0` under the naive
   approach for the `x = 1` case, and a wrong sign for `x = -1`.
2. Pick a real center point *not* at the origin (say `(5, 5)`) and a real
   point on a circle of radius `3` around it (`(8, 5)`, directly right of
   center). Compute the angle using `math.atan2(y - 5, x - 5)`, not
   `math.atan2(y, x)` directly — confirm the un-shifted version gives a
   wrong, meaningless answer.
3. Confirm live that `math.atan(1 / 0)` really does raise
   `ZeroDivisionError` in Python (not `inf`, unlike some languages'
   floating-point division) — read the real traceback.
