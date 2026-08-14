# Concept: Proportional Tessellation — Scaling Point Count to Arc Length

**What you'll understand by the end:** why approximating a curve with
straight-line segments should use a point count that scales with how
*much* of the curve is being drawn, not a fixed count regardless of
length — and how getting this wrong wastes points on short curves
while under-representing long ones.

**Prerequisites:** `python-math-atan2.md`.

## Setup

Python 3, no packages needed.

## The Problem

A real curve (a circular arc, a smooth path) rendered on a screen or
sent to a machine has to be approximated as a series of straight
segments — a real process called **tessellation**. A single, fixed
number of segments applied to *every* curve regardless of its own real
length produces a visibly wrong result at both ends of the scale: a
short curve gets far more points than it needs (wasted computation, no
visible improvement), while a long curve gets spread far too thin
(visible faceting, a curve that looks like a polygon instead of
smooth).

## The Isolated Example

```python
import math


def points_for_sweep(sweep_radians, points_per_full_revolution=64):
    fraction_of_circle = sweep_radians / (2 * math.pi)
    return max(2, round(points_per_full_revolution * fraction_of_circle))


quarter_turn = math.pi / 2
half_turn = math.pi
full_turn = 2 * math.pi

print("quarter turn point count:", points_for_sweep(quarter_turn))
print("half turn point count:", points_for_sweep(half_turn))
print("full turn point count:", points_for_sweep(full_turn))
```

**Real output, run this session:**
```
quarter turn point count: 16
half turn point count: 32
full turn point count: 64
```

**What this proves:** a quarter turn — one-fourth of a full circle —
genuinely got one-fourth the points (`16` of a full circle's `64`), a
half turn got exactly half (`32`). The point count scales linearly
with the real fraction of the circle being swept, not a flat `64`
regardless.

The real payoff — checking actual point *spacing* along each curve,
using a real radius of `10`:

```python
radius = 10
for sweep, label in [(math.pi / 2, "quarter"), (math.pi, "half"), (2 * math.pi, "full")]:
    count = points_for_sweep(sweep)
    arc_length = radius * sweep
    spacing = arc_length / (count - 1)
    print(f"{label}: count={count}, arc_length={arc_length:.2f}, spacing={spacing:.3f}")
```

**Real output, run this session:**
```
quarter: count=16, arc_length=15.71, spacing=1.047
half: count=32, arc_length=31.42, spacing=1.013
full: count=64, arc_length=62.83, spacing=0.997
```

**What this proves:** despite three genuinely different real arc
lengths (15.71, 31.42, 62.83 units), the actual distance between
consecutive points stays roughly **constant** across all three
(~1.0 units apart, every time) — proportional tessellation doesn't
just scale point count arbitrarily, it specifically keeps visual
*density* consistent regardless of how much of the circle is being
drawn.

## Mechanical Walkthrough

- `fraction_of_circle = sweep_radians / (2 * math.pi)` computes what
  portion of one full revolution the real curve actually covers — a
  value between `0` and `1` for anything from no rotation up to (and
  including) a full circle.
- `points_per_full_revolution * fraction_of_circle` scales a real,
  chosen "density" constant (how many points a *full* circle would
  get) down proportionally to match a shorter arc's own real, smaller
  share of that circle.
- `max(2, round(...))` guards the real lower bound — a line segment
  needs at least its own two endpoints no matter how short the real
  sweep is; `round(...)` turns the real, continuous scaled value into
  a whole, usable point count.
- The result: point **density** (points per unit of real arc length)
  stays approximately constant across arcs of different real length,
  rather than point **count** staying constant while density varies
  wildly.

## CS Lens

This is a real instance of **adaptive discretization** — choosing how
finely to sample a continuous quantity based on a real property of
what's being sampled (here, its own length), rather than applying a
single fixed resolution universally. The same underlying idea
generalizes to any real curve-approximation problem, not just circular
arcs: a smooth spline rendered with more segments where it curves
sharply and fewer where it's nearly straight is the identical real
principle taken further (adapting to local curvature, not just overall
length).

Also recognized in: level-of-detail (LOD) systems in 3D graphics
(a distant object gets fewer polygons, a close one gets more, keeping
visual density roughly constant relative to screen size); adaptive
numerical integration (Simpson's rule variants that subdivide more
finely where a function changes rapidly); font rendering at different
sizes (a large glyph gets more curve subdivisions than a tiny one, to
keep the visible smoothness consistent).

## SE Lens

The real, practical tradeoff: a fixed point count is simpler code
(no length computation needed at all) but produces a genuinely worse
real result at both extremes of curve length — visible faceting on
long curves, wasted computation on short ones. Proportional
tessellation costs one extra real computation (the length or sweep
fraction) in exchange for consistent real visual quality regardless of
how varied the actual curves turn out to be — worth the small added
complexity specifically when curves of meaningfully different real
lengths are expected to coexist in the same rendered scene, as they
generally are in any real, non-trivial geometry.

## Connection

Builds on `python-math-atan2.md` for the angle computation typically
feeding a sweep value in the first place. A real, applied instance in
this project's own history: a circular-arc interpolator scaling its
own per-arc point count by the real fraction of a full circle actually
swept, so a quarter-circle pocket and a full-circle pocket both render
with comparably smooth, consistent visual density instead of the
quarter circle being needlessly over-sampled or the full circle being
under-sampled at a single, one-size-fits-all point count. A second,
real instance of the identical broader principle — size a rendering
parameter relative to the actual data, not a fixed constant — from
later in this project's own history: a live playback marker's own
radius computed as a fraction of the real 3D scene's bounding-box
diagonal (via `python-math-dist.md`), so it reads sensibly whether the
real program being visualized is tiny or large, rather than a fixed
pixel/world size looking comically oversized or invisibly tiny
depending on scene scale.

## Try It Yourself

1. Compute `points_for_sweep` for a sweep of `0.1` radians (a tiny
   arc) and confirm the `max(2, ...)` floor kicks in — the real point
   count never drops below `2`, even though the raw scaled value would
   round to `0` or `1`.
2. Change `points_per_full_revolution` to a much smaller number (say,
   `8`) and rerun the spacing calculation for all three sweeps —
   confirm spacing still stays roughly constant across the three, just
   at a coarser, shared density.
3. Write a version that instead always uses a **fixed** count of `16`
   regardless of sweep, and compute the resulting spacing for the
   quarter, half, and full turns — a concrete, felt sense of exactly
   how much the full turn's own spacing degrades (points spread nearly
   4x farther apart) compared to the proportional version.
