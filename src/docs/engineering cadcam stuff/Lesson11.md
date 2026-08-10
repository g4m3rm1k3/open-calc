# Lesson 11: Which Way Is It, Exactly

**What you will build:** a `distance` function (built from pieces this
project already has) and an `angleOf` function using `Math.atan2`, plus a
real, reproduced proof of the classic bug `atan2` exists specifically to
avoid. The transferable problem: knowing a vector's exact **angle** —
not just how it relates to another vector (Lesson 9's `angleBetween`), but
its heading in absolute terms — is something a naive approach gets subtly,
silently wrong for half of all possible directions.

**What you need to know first:** Lesson 10 (Arc 1) — this is the last
lesson of Arc 1; it closes out the vector-math foundation before Arc 2's
transformation matrices build on top of all of it.

---

## Concept Unit: Distance Between Two Points

### The Problem

"How far apart are these two points?" is a distinct, extremely common
question — and this project already has every piece needed to answer it,
just not assembled into one obviously-named function yet.

### By Hand

Distance is exactly the magnitude of the displacement between two points:

```
A = (0, 0), B = (3, 4)

displacement = B - A = (3, 4)
distance = |displacement| = sqrt(3² + 4²) = sqrt(9 + 16) = sqrt(25) = 5
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `cross`
- **Dependencies:** `subtractPoints` (Lesson 7), `magnitude` (Lesson 8)

### The New Code

```js
function distance(a, b) {
  return magnitude(subtractPoints(a, b));
}
```

### The Updated Project

```js
function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

function distance(a, b) {                          // ← new
  return magnitude(subtractPoints(a, b));           // ← new
}                                                    // ← new
```

### Isolating the Concept

```js
const A = { x: 0, y: 0 };
const B = { x: 3, y: 4 };
console.log("distance(A,B) = magnitude(B - A) = magnitude((" + (B.x-A.x) + "," + (B.y-A.y) + ")) =", distance(A, B));
```

Real output:

```
distance(A,B) = magnitude(B - A) = magnitude((3,4)) = 5
```

Matches the by-hand result exactly. Nothing here is a new formula — it's
the same Pythagorean calculation from Lesson 8, reached by composing two
functions this project already trusts.

### Discarding

Discarded — `A`/`B` here are illustrative; the real function is
`distance`.

### Mechanical Walkthrough

- **`function distance(a, b) { ... }`** — (b) a concept reappearing —
  ordinary function declaration.
- **`subtractPoints(a, b)`** — (b) a concept reappearing, from Lesson 7.
- **`magnitude(...)`** — (b) a concept reappearing, from Lesson 8, applied
  here to the *result* of `subtractPoints` rather than to a standalone
  vector.

### CS Lens

Not a new hard concept — this is a direct application of magnitude,
already given its full CS lens in Lesson 8.

### SE Lens

The alternative not chosen: inline `magnitude(subtractPoints(a, b))`
wherever a distance is needed, rather than naming it. The real value of
naming it: a reader scanning this project's code later sees `distance(A,
B)` and immediately knows the intent, without mentally re-deriving that a
subtraction-then-magnitude pair means "distance" — a small but real
readability cost avoided for one extra function.

### Run It

Real output already shown above.

### Connecting

Distance answers "how far" — the rest of this lesson answers "which way,"
in absolute terms.

---

## Concept Unit: `Math.atan2()` — a Vector's Absolute Angle

### The Problem

`angleBetween` (Lesson 9) only reports the angle *between two* vectors —
it can't answer "what is this one vector's own heading, relative to, say,
straight right (`+x`)?" That's a different, simpler-sounding question that
needs its own tool.

### By Hand

A vector's angle from the positive x-axis can be found from its `y` and
`x` components using the inverse tangent — but, critically, using *both*
components together, not their ratio alone (the next unit proves exactly
why that distinction matters).

```
v = (1, 1)   — pointing up and to the right, 45° from the x-axis by inspection
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `distance`
- **Dependencies:** none new

### The New Code

```js
function angleOf(v) {
  return Math.atan2(v.y, v.x);
}
```

### The Updated Project

```js
function distance(a, b) {
  return magnitude(subtractPoints(a, b));
}

function angleOf(v) {                 // ← new
  return Math.atan2(v.y, v.x);        // ← new
}                                      // ← new
```

### Isolating the Concept

Checked against all four quadrants, not just the one obvious case — a
function like this needs proving across its full range, not one
convenient example:

```js
const v1 = { x: 1, y: 1 };
const v2 = { x: -1, y: 1 };
const v3 = { x: -1, y: -1 };
const v4 = { x: 1, y: -1 };

console.log("angleOf(1,1) =", angleOf(v1) * (180/Math.PI), "degrees");
console.log("angleOf(-1,1) =", angleOf(v2) * (180/Math.PI), "degrees");
console.log("angleOf(-1,-1) =", angleOf(v3) * (180/Math.PI), "degrees");
console.log("angleOf(1,-1) =", angleOf(v4) * (180/Math.PI), "degrees");
```

Real output:

```
angleOf(1,1) = 45 degrees
angleOf(-1,1) = 135 degrees
angleOf(-1,-1) = -135 degrees
angleOf(1,-1) = -45 degrees
```

What this proves: all four quadrants come back with distinct, correct
angles — `45°` for upper-right exactly matches the by-hand expectation,
and each of the other three quadrants gets its own, genuinely different
value, with negative angles used for clockwise-from-positive-x directions
(the standard math convention).

### Discarding

Discarded — `v1`–`v4` are illustrative; `angleOf` itself is the real
function.

### Mechanical Walkthrough

- **`function angleOf(v) { ... }`** — (b) a concept reappearing —
  ordinary function declaration.
- **`Math.atan2(v.y, v.x)`** — (a) first appearance. Takes `y` and `x` as
  two *separate* arguments (in that order — `y` first is easy to get
  backward) and returns the angle of the point `(x, y)` from the origin,
  correctly accounting for which quadrant it's in.

### CS Lens

Not yet expanded — `atan2`'s real significance, why it needs both
components separately rather than their ratio, is exactly what the next
unit proves concretely.

### SE Lens

The alternative not chosen — using plain `Math.atan(v.y / v.x)` instead —
is exactly what the next unit demonstrates is a real, silent bug, not a
reasonable simplification.

### Run It

Real output already shown above.

### Connecting

`angleOf` correctly distinguishes all four quadrants — the final unit
proves, concretely, why the more "obvious" one-argument approach fails to.

---

## Concept Unit: Why `atan2`, Not `atan`

### The Problem

`Math.atan(y / x)` looks like a simpler, more direct way to get the same
angle — one argument instead of two, and it's the ratio that actually
appears in the trigonometric definition of tangent. It has a real,
specific flaw: dividing `y` by `x` throws away information the moment both
components change sign together.

### By Hand

```
v1 = (1, 1)     y/x = 1/1 = 1
v2 = (-1, -1)   y/x = -1/-1 = 1     — the SAME ratio as v1
```

`v1` points up-and-right (45°); `v2` points down-and-left, the exact
opposite direction (225°, equivalently −135°). Their `y/x` ratios are
identical — `atan` alone has no way to tell them apart, because the
division already discarded the information (each component's own sign)
that distinguished the two cases.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none — this unit is a verification of the design
  decision already made in the previous unit, not new code.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** `angleOf`, from the previous unit

### Isolating the Concept

```js
const v1 = { x: 1, y: 1 };
const v2 = { x: -1, y: -1 };

console.log("atan2(v1):", Math.atan2(v1.y, v1.x) * (180/Math.PI), "degrees");
console.log("atan2(v2):", Math.atan2(v2.y, v2.x) * (180/Math.PI), "degrees");

console.log("--- now the naive atan(y/x), which loses quadrant info ---");
console.log("atan(v1.y/v1.x):", Math.atan(v1.y/v1.x) * (180/Math.PI), "degrees");
console.log("atan(v2.y/v2.x):", Math.atan(v2.y/v2.x) * (180/Math.PI), "degrees (SAME ratio as v1, opposite actual direction)");
```

Real output:

```
atan2(v1): 45 degrees
atan2(v2): -135 degrees
--- now the naive atan(y/x), which loses quadrant info ---
atan(v1.y/v1.x): 45 degrees
atan(v2.y/v2.x): 45 degrees (SAME ratio as v1, opposite actual direction)
```

What this proves, concretely: `atan2` correctly reports two different
angles, `45°` and `-135°`, for two vectors pointing in genuinely opposite
directions. Plain `atan`, given only the ratio, reports `45°` for *both* —
a real, silent, reproducible bug, not a hypothetical one. `atan2` avoids
this specifically because it receives `y` and `x` as two separate values
and can inspect each one's own sign, rather than a single pre-divided
ratio that already erased that information.

### Discarding

Discarded — this comparison never appears as real project code; `angleOf`,
built on `atan2`, is the only version that persists.

### Mechanical Walkthrough

Nothing new mechanically — this unit reuses `Math.atan2` from the previous
unit and introduces `Math.atan` only to demonstrate its failure, not to
adopt it.

### CS Lens

Preserving distinguishing information (each component's sign) rather than
collapsing it too early (into a single ratio) before it's actually needed
is a general principle, not unique to trigonometry.

```
Also recognized in: hashing two different values to the same hash (a
collision — different inputs, indistinguishable outputs), floating-point
operations losing precision when combined in the wrong order, lossy data
compression discarding information that later turns out to matter,
database normalization losing information when two columns get
prematurely merged into one
```

### SE Lens

The alternative not chosen — `Math.atan(v.y / v.x)` — was named directly
in the Problem section as the naive-but-tempting choice. The real cost, now
proven: it silently returns the wrong angle for exactly half of all
possible directions (both quadrants where `x` and `y` share a sign with
their opposite-quadrant counterpart), with no error, no warning, and a
perfectly plausible-looking number. `Math.atan2` costs nothing extra to
call correctly — it's the same one built-in function call, just with two
arguments instead of a pre-computed ratio — which makes this one of the
rare cases in this curriculum where there's no real tradeoff at all: only
a mistake to avoid.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

`angleOf`, built correctly on `atan2` in the previous unit, is now proven
—not just claimed— to handle every direction correctly, closing out
everything Arc 1 set out to build.

---

## Closing

### Connect the Pieces

Arc 1's entire toolkit, traced through one final example: point
`A = (0, 0)` and point `B = (3, 4)`. `subtractPoints(B, A)` (Lesson 7)
gives the vector `(3, 4)`. `distance(A, B)` (this lesson) reports `5`,
using `magnitude` (Lesson 8) on that same vector. `angleOf((3,4))` (this
lesson), via `atan2`, reports the vector's exact heading —
`53.13°` — while `dot` and `cross` (Lessons 9–10) remain available for
comparing it against any second vector, for alignment or orientation.
Every later arc's geometry — Arc 2's rotations, Arc 4's toolpath edges,
Arc 5's kinematics — is built entirely out of these seven small,
individually hand-verified functions: `addVectors`, `subtractPoints`,
`magnitude`, `normalize`, `dot`, `cross`, `distance`, and `angleOf`.

### What Breaks Without This

Reusing the exact `atan` failure from Unit 3, but framed as what it would
mean for a real toolpath direction check — two tool movements that are
actually opposite directions, both reported as the same 45° heading by a
version of this project that used `Math.atan(y/x)` instead of `atan2`:

```js
function wrongAngleOf(v) {
  return Math.atan(v.y / v.x);
}

const moveForward = { x: 1, y: 1 };
const moveBackward = { x: -1, y: -1 };

console.log("wrongAngleOf(moveForward):", wrongAngleOf(moveForward) * (180/Math.PI), "degrees");
console.log("wrongAngleOf(moveBackward):", wrongAngleOf(moveBackward) * (180/Math.PI), "degrees (WRONG - should be opposite)");
console.log("angleOf(moveForward):", angleOf(moveForward) * (180/Math.PI), "degrees");
console.log("angleOf(moveBackward):", angleOf(moveBackward) * (180/Math.PI), "degrees (correct - genuinely opposite)");
```

Real output:

```
wrongAngleOf(moveForward): 45 degrees
wrongAngleOf(moveBackward): 45 degrees (WRONG - should be opposite)
angleOf(moveForward): 45 degrees
angleOf(moveBackward): -135 degrees (correct - genuinely opposite)
```

A toolpath direction check built on `wrongAngleOf` would treat these two
opposite moves as identical — a real, dangerous class of bug for a CNC
context specifically, where "direction" genuinely matters. `angleOf`,
built on `atan2` from the start, never has this problem.

### Exercises

- By hand, compute `distance((1,1), (4,5))` (a 3-4-5 triangle again, offset
  from the origin this time), then confirm with `distance`.
- By hand, predict the sign and rough size of `angleOf((-5, 0.001))` — a
  vector barely above the negative x-axis — before running it. This is a
  genuine edge case worth seeing directly.
- Using `angleOf` and `distance` together, write a function
  `describeDirection(a, b)` that logs a sentence like "B is 5.0 units from
  A, at a heading of 53.1°."

### Definition of Done

- [ ] `distance` and `angleOf` exist in `script.js` and match their
      by-hand derivations exactly
- [ ] `angleOf` correctly distinguishes all four quadrants, verified
      against at least one vector you chose yourself in each quadrant
- [ ] You can explain, without looking, exactly why `Math.atan(y/x)` fails
      for some directions and `Math.atan2(y, x)` does not
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add distance and angleOf (atan2), closing out Arc 1

  distance() composes subtractPoints and magnitude; angleOf() uses
  Math.atan2 rather than Math.atan specifically because atan2 preserves
  quadrant information atan's y/x ratio silently discards - reproduced
  with two opposite-direction vectors atan reports as identical. This
  closes Arc 1: addVectors, subtractPoints, magnitude, normalize, dot,
  cross, distance, and angleOf are now the complete hand-verified vector
  toolkit Arc 2's transformation matrices build on."
  ```

This closes Arc 1. Every function built across these five lessons was
derived by hand before being coded, and every one of them is about to be
reused — not replaced — once Arc 2 introduces rotation, scaling, and
matrix composition.
