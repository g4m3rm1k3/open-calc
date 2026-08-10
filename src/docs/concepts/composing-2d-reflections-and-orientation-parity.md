# Concept: Composing 2D Reflections — Parity Determines Orientation

**What you'll understand by the end:** why applying one 2D reflection
to a shape reverses its "handedness" (clockwise becomes
counter-clockwise, or vice versa), why applying a **second** reflection
restores the original handedness, and how to detect this with a real,
computed signed area rather than eyeballing a picture.

**Prerequisites:** none beyond the assumed floor.

## Setup

Python 3, no packages needed.

## The Problem

A shape made of ordered points has a real, well-defined **orientation**
— walking around its points in order traces either a clockwise or
counter-clockwise path. Reflecting a shape (flipping it across an
axis) is a common, simple transform — but a real, easy-to-miss
consequence: reflecting **reverses** that orientation. Code that cares
about orientation (which direction an arc sweeps, which side of a
path is "inside") can't just apply a reflection and assume direction-
dependent data still means the same thing afterward.

## The Isolated Example

```python
def reflect_x(point):
    x, y = point
    return (x, -y)


def reflect_y(point):
    x, y = point
    return (-x, y)


def signed_area(triangle):
    (x1, y1), (x2, y2), (x3, y3) = triangle
    return (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)


triangle = [(0, 0), (4, 0), (0, 3)]
print("original signed area:", signed_area(triangle))

flipped_once = [reflect_x(p) for p in triangle]
print("after ONE reflection (flip X), signed area:", signed_area(flipped_once))

flipped_twice = [reflect_y(p) for p in flipped_once]
print("after TWO reflections (flip X, then flip Y), signed area:", signed_area(flipped_twice))

flipped_three = [reflect_x(p) for p in flipped_twice]
print("after THREE reflections, signed area:", signed_area(flipped_three))
```

**Real output, run this session:**
```
original signed area: 12
after ONE reflection (flip X), signed area: -12
after TWO reflections (flip X, then flip Y), signed area: 12
after THREE reflections, signed area: -12
```

**What this proves:** the triangle's own real, unsigned area never
changes (always `12` in magnitude) — reflections preserve size and
shape exactly. The **sign** flips after one reflection (`12` →
`-12`), flips back after a second (`-12` → `12`), and flips again
after a third (`12` → `-12`) — the sign strictly alternates with each
additional reflection, regardless of which axis each one reflects
across.

## Mechanical Walkthrough

- `signed_area` computes twice the real, signed area of a triangle
  from its three ordered vertices — positive when the points are
  ordered counter-clockwise, negative when ordered clockwise, using
  the standard 2D cross-product-based formula.
- A single reflection (`reflect_x` or `reflect_y`) negates exactly one
  coordinate of every point — a real, direct proof that this flips the
  sign of `signed_area` follows from the formula itself: negating one
  coordinate throughout negates the whole computed value.
- Composing a **second** reflection negates a coordinate a second
  time, flipping the sign back — two sign flips cancel out, restoring
  the original orientation, even though the shape's own points have
  genuinely moved to new positions (it isn't restored to its original
  location, only its original orientation).
- This generalizes to any number of composed reflections: the real,
  final orientation depends only on whether an **even** or **odd**
  number of reflections were applied — not on which specific axes, and
  not on what order they were applied in.

## CS Lens

This is a real, concrete instance of **parity** — a property that only
depends on whether a count is even or odd, discarding every other
detail about the individual steps that produced that count. The
identical underlying idea shows up in a permutation's own parity (an
even or odd number of element swaps, determining whether the
permutation is reachable from another via an even number of
transpositions — the basis of a determinant's sign); a light switch
flipped some number of times (only whether the total count is even or
odd determines its final state, not the specific sequence of flips);
and error-correcting parity bits, which detect an odd number of bit
flips precisely because parity is a real, simple, checkable invariant
of a sequence of binary events.

Also recognized in: computer graphics culling (a renderer using
triangle winding order — clockwise vs. counter-clockwise — to decide
which triangle faces to draw, and having to explicitly correct that
winding after an odd number of mirroring transforms); a video game's
own sprite-flipping code needing to know whether a sprite has been
mirrored an even or odd number of times to render collision or attack
directionality correctly.

## SE Lens

The real, practical consequence: any code carrying **direction-
dependent** data through a reflection (which way an arc curves, which
side of a boundary is "outside," a texture's own left-right orientation)
has to explicitly track and correct for this parity — reflecting once
and forgetting to flip that associated data produces a real, silently
wrong result (an arc that curves the wrong way, a face that's now
inside-out) that looks like a mundane transform bug rather than the
mathematically inevitable consequence it actually is. The real, honest
shortcut: tracking parity itself only needs one boolean (or a simple
XOR per reflection applied), not remembering the full history of which
specific reflections happened.

## Connection

Builds on nothing beyond the assumed floor. A real, applied instance:
a coordinate-transform tool offering independent X/Y mirror toggles
alongside arc-based geometry (each arc carrying an explicit clockwise-
or-counter-clockwise direction) — flipping X alone or Y alone (one
reflection) correctly reverses every arc's own direction to keep the
mirrored path geometrically valid; flipping **both** X and Y
(two reflections, composing to a rotation) correctly leaves arc
direction alone, computed directly as `flip_x != flip_y` — XOR is
exactly the real, minimal parity check this file's own theory predicts
is sufficient, with no need to separately reason about each axis.

## Try It Yourself

1. Reflect the same triangle across a **diagonal** line (swap `x` and
   `y`: `(x, y) -> (y, x)`) instead of a coordinate axis, and confirm
   `signed_area`'s sign still flips — real, direct proof this parity
   behavior isn't specific to axis-aligned reflections.
2. Write a function `net_orientation_flipped(reflection_count: int) ->
   bool` that returns whether an odd number of reflections were
   applied, using nothing but `reflection_count % 2` — confirming the
   entire real question reduces to a single parity check, with no
   memory of which specific reflections occurred needed.
3. Combine a reflection with a **rotation** (this file's own
   `signed_area` after a real, generic rotation) and confirm rotation
   alone never flips the sign, however large the angle — real, direct
   proof that only reflections (not rotations) affect orientation,
   reinforcing that parity tracking only needs to count reflections
   specifically.
