# Concept: `math.dist` — Euclidean Distance Between Two Points

**What you'll understand by the end:** how `math.dist(p1, p2)`
computes the straight-line (Euclidean) distance between two points of
*any* matching dimensionality — 2D, 3D, or higher — without writing
out the sum-of-squares formula by hand, and why it generalizes past
whatever specific number of coordinates a hand-rolled version would
have to hardcode.

**Prerequisites:** none beyond the assumed floor.

## Setup

Python 3.8+, no packages needed — `math` is standard library.

## The Problem

The straight-line distance between two real points is one of the most
common real geometric computations there is — how far apart two
positions are, regardless of the path between them. Writing it by hand
(`sqrt((x2-x1)**2 + (y2-y1)**2)`) works for 2D, but has to be rewritten
with an extra term the moment a real third dimension (or more) is
involved, and is an easy place to introduce a small, real arithmetic
slip (a missed square, a wrong sign) that a shorter, standard call
avoids entirely.

## The Isolated Example

```python
import math

p1 = (0, 0, 0)
p2 = (3, 4, 0)
print("math.dist:", math.dist(p1, p2))

manual = math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))
print("hand-rolled formula:", manual)

p3 = (1, 2, 3)
p4 = (4, 6, 3)
print("a second, real 3D pair:", math.dist(p3, p4))
```

**Real output, run this session:**
```
math.dist: 5.0
hand-rolled formula: 5.0
a second, real 3D pair: 5.0
```

**What this proves:** `math.dist((0, 0, 0), (3, 4, 0))` and the
hand-written `sqrt(sum of squared differences)` formula produce the
**identical** real result (`5.0`, the real 3-4-5 right triangle) —
`math.dist` is doing exactly that same computation, just without the
caller writing it out. The second, genuinely different 3D pair
(`(1,2,3)` to `(4,6,3)`) also correctly comes out to `5.0`, confirming
it isn't a coincidence specific to the first example.

## Mechanical Walkthrough

- `math.dist(p1, p2)` accepts two real, equal-length sequences of
  coordinates — `(x, y)` pairs, `(x, y, z)` triples, or longer — and
  returns the real straight-line distance between them.
- Internally, it computes the same real formula the hand-rolled
  version does: the square root of the sum of each coordinate pair's
  own squared difference — but it works for **any** matching
  dimensionality without the caller writing a different formula for
  each case.
- Both points must have the **same** number of coordinates — `math.
  dist` doesn't implicitly pad or truncate a mismatched pair; a real,
  explicit `ValueError` is raised instead.

## CS Lens

This is a real, standard-library instance of the general **Euclidean
norm** / **L2 distance** computation — the same underlying formula
used throughout geometry, physics, and machine learning (where it's
often called the L2 distance between two vectors). Using the
standard-library function over a hand-written formula is a small, real
instance of **not reinventing a well-established, easy-to-get-subtly-
wrong computation** — the kind of thing worth reaching for a tested,
standard implementation of rather than re-deriving from scratch every
time it's needed.

Also recognized in: `numpy.linalg.norm(p2 - p1)` (the identical real
computation, vectorized); a physics engine computing how far apart two
real objects are; any real k-nearest-neighbors algorithm, whose
entire core operation is repeatedly computing this exact distance
between points.

## SE Lens

The real, practical payoff: `math.dist` genuinely generalizes across
dimensionality with **zero** code changes — the identical call works
whether the real points are 2D, 3D, or higher, while a hand-rolled
`sqrt((x2-x1)**2 + (y2-y1)**2)` has to be rewritten (adding a `(z2-
z1)**2` term) the moment a project's own data grows a third real
dimension. The real, small cost of the standard-library call over the
inline formula is essentially nothing — worth defaulting to it any
time the standard library already solves exactly the real problem at
hand.

## Connection

A close sibling of `python-math-atan2.md` — both are standard-library
`math` functions solving a common, real geometric problem correctly
across edge cases a naive hand-written formula would need to handle
explicitly itself. A real, applied instance in this project's own
history: sizing a live playback marker in a 3D scene relative to the
real scene's own bounding-box diagonal — `math.dist` computing that
diagonal's real length directly from the scene's own two extreme
corner points, so the marker reads sensibly whether the real program
being visualized is tiny or large.

## Try It Yourself

1. Call `math.dist((0, 0), (0, 0))` — two identical points — and
   confirm it correctly returns `0.0`, the real, expected distance
   between a point and itself.
2. Call `math.dist((0, 0), (1, 1, 1))` (mismatched dimensionality) and
   read the real, resulting `ValueError` — confirming `math.dist`
   actively checks this rather than silently producing a wrong answer.
3. Use `math.dist` to compute the real diagonal length of a 3D
   bounding box, given its two extreme corners (e.g. `(0, 0, 0)` and
   `(10, 5, 8)`) — reasoning about why that's exactly the same real
   operation as finding the distance between two ordinary points.
