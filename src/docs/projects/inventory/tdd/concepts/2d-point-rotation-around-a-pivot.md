# Concept: 2D Point Rotation Around a Pivot

**What you'll understand by the end:** the real formula for rotating
a 2D point by a given angle around an arbitrary pivot, where the
`cos`/`sin` terms in it actually come from, and why rotating around
any pivot other than the origin needs a real translate-rotate-
translate-back sequence rather than a single direct formula.

**Prerequisites:** `radians-rotation-unit.md`.

## Setup

Any language with `Math.PI`/`Math.cos`/`Math.sin` (or Python's
`math.pi`/`math.cos`/`math.sin`) — examples below use JavaScript,
runnable in any browser console or Node.js.

## The Problem

Rotating a 2D point by some angle, around some center, is a common
real operation — spinning a shape in a graphics editor, rotating a
game object, or reorienting a machined part's layout. The formula
involves `cos` and `sin`, which can be memorized and typed correctly
without ever understanding *why* those specific functions appear —
leaving no way to derive it again if misremembered, and no way to
recognize the same real idea if it shows up in an unfamiliar form.

## The Math: Where Rotation's `cos`/`sin` Actually Come From

Any 2D point `(x, y)` can be described two equivalent ways: as
Cartesian coordinates, or in **polar form** — a distance `r` from the
origin and an angle `φ` (phi) measured from the positive x-axis, where
`x = r·cos(φ)` and `y = r·sin(φ)` (this is the actual definition of
what sine and cosine mean geometrically: the x- and y-coordinates of a
point at distance `r`, angle `φ`, from the origin).

Rotating that point by an additional angle `θ` (theta) means its new
angle is simply `φ + θ`, at the same real distance `r` (rotation never
changes how far a point is from the center it's rotating around). The
new coordinates are therefore `r·cos(φ+θ)` and `r·sin(φ+θ)`. Expanding
those using the real, standard angle-sum trigonometric identities —
`cos(φ+θ) = cos φ cos θ − sin φ sin θ` and
`sin(φ+θ) = sin φ cos θ + cos φ sin θ` — and substituting back
`r·cos φ = x` and `r·sin φ = y` gives the real, final formula with no
`r` or `φ` left in it at all:

```
new_x = x·cos(θ) − y·sin(θ)
new_y = x·sin(θ) + y·cos(θ)
```

This is why `cos`/`sin` appear paired this specific way — it's not an
arbitrary rule, it's the direct algebraic consequence of what
rotating a point in polar form actually means.

## The Isolated Example

```javascript
function rotatePoint(x, y, angleDegrees, cx, cy) {
  const angle = (angleDegrees * Math.PI) / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const relX = x - cx;
  const relY = y - cy;
  const newX = cx + relX * cosA - relY * sinA;
  const newY = cy + relX * sinA + relY * cosA;
  return [newX, newY];
}

console.log(rotatePoint(1, 0, 90, 0, 0));
console.log(rotatePoint(10, 5, 180, 10, 0));
console.log(rotatePoint(0, 0, 45, 0, 0));
```

**Real output:**
```
[ 6.123233995736766e-17, 1 ]
[ 10, -5 ]
[ 0, 0 ]
```

**What this proves:** rotating `(1, 0)` by 90° around the origin lands
at `(≈0, 1)` — the tiny `6.12e-17` instead of an exact `0` is a real,
honest floating-point artifact (`Math.cos(90°)`'s true value is
exactly `0`, but `90°` converted to radians is itself only an
approximation of the true irrational value, so the computed cosine is
only *approximately* zero) — not a bug in the formula. Rotating
`(10, 5)` by a full 180° around the pivot `(10, 0)` lands at
`(10, -5)`: the point started 5 units *above* the pivot and ends 5
units *below* it, exactly what a real half-turn around that pivot
should do. Rotating the pivot's own coincident point `(0, 0)` around
itself leaves it unmoved, for any angle — a point exactly at the
center of rotation has nowhere to go.

## Mechanical Walkthrough

- `relX = x - cx; relY = y - cy;` — **translate the pivot to the
  origin**: subtracting the pivot's own coordinates re-expresses the
  real point's position *relative to the pivot*, not relative to
  `(0, 0)`. This step is what makes rotation around an *arbitrary*
  pivot possible at all — the formula derived above only rotates
  correctly around the real origin.
- `newX = relX * cosA - relY * sinA; newY = relX * sinA + relY * cosA;`
  — the real rotation formula itself, derived above, applied to the
  now-origin-relative coordinates.
- `cx + ...`, `cy + ...` — **translate back**: the real, rotated
  result is still relative to the pivot; adding the pivot's own
  coordinates back converts it to a real, absolute position again.

## Execution Trace

No loop, recursion, or carried state across calls — each real call to
`rotatePoint` is an independent, straight-line calculation. Not
applicable.

## CS Lens

This is a **linear transformation** represented as a real 2×2
rotation matrix, `[[cos θ, −sin θ], [sin θ, cos θ]]`, applied to the
real vector `(x, y)` — the same real mathematical object underlying
every 3D graphics engine's own camera and object rotations (extended
to 3×3 or 4×4 matrices), robotics' own real coordinate-frame
transforms, and any 2D physics engine's own rigid-body rotation.
Also recognized in: image-editing software rotating a layer around a
chosen anchor point, a CAD program's own "rotate around this vertex"
tool, a satellite's own attitude-control math rotating a 3D
orientation around one axis at a time.

## SE Lens

The real alternative not chosen: storing every shape pre-rotated at
however many discrete angles an application might need (`sprite_0deg`,
`sprite_90deg`, `sprite_180deg`, ...) rather than computing a real
rotation on demand. That avoids any real runtime trigonometry at
all — genuinely faster per frame — at the real cost of only ever
supporting a fixed, pre-baked set of angles, breaking the instant a
real, arbitrary angle is needed (a user dragging a rotation handle to
any real position, not just a preset one). Computing the real
rotation directly trades a small, real, per-call trigonometric cost
for supporting every real angle, not just a chosen few — the correct
real tradeoff whenever the actual angle isn't known until runtime.

## Connection

Builds on `radians-rotation-unit.md` for the real degrees-to-radians
conversion this formula's own angle input needs. The translate-
rotate-translate-back sequence here is a specific, real instance of a
more general technique — re-expressing a problem relative to a
different, more convenient origin, solving it there, then converting
the real answer back — that recurs anywhere a "natural" formula only
works around `(0, 0)` but the real problem needs an arbitrary center.

## Try It Yourself

1. Rotate `(5, 0)` by `360°` around the origin. Confirm the real
   result lands back at (very nearly) `(5, 0)` — a full turn returns
   a point to where it started, modulo the same real floating-point
   noise already seen above.
2. Rotate a real point by a *negative* angle (e.g. `-90°`) and compare
   it to rotating by `270°`. Confirm both produce the same real
   result — a negative rotation is the same real thing as a positive
   rotation the "long way around."
3. Change `rotatePoint` to rotate around the origin unconditionally
   (skip the translate/translate-back steps, always treating `cx`/`cy`
   as `0`), then call it with a real, non-zero pivot. Confirm the
   real result is wrong — the point rotates around `(0, 0)` instead of
   the real pivot you asked for — proving the translate-rotate-
   translate-back sequence isn't optional bookkeeping, it's the actual
   real mechanism that makes an arbitrary pivot work at all.
