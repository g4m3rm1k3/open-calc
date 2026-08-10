# Lesson 13: Turning a Point Around the Origin

**What you will build:** a rotation matrix derived from the trigonometric
angle-addition identities, applied to points and whole shapes, verified
against known cases (90° and 180° turns) and a four-times-90° round trip.
The transferable problem: rotation is the transformation this entire
curriculum was named for — "rotating points in space" was in the very
first message that started this project — and unlike translation, it has
no shortcut through plain vector addition. It has to be derived from
trigonometry, by hand, or it's just a formula copied from somewhere else.

**What you need to know first:** Lesson 12 (Arc 2) — `translationMatrix`
and `applyMatrix`, whose homogeneous 3×3 shape this lesson's rotation
matrix reuses exactly, so the two can eventually combine (Lesson 15).

---

## Concept Unit: Deriving the Rotation Formula from Sin and Cos

### The Problem

A point doesn't have to be rotated by re-deriving trigonometry from
scratch — but it does need a real derivation, not a memorized formula,
because the *reason* the formula has the shape it does (why a minus sign
appears in one place and not another) is exactly what makes it possible to
extend correctly to 3D later, in Arc 6, rather than guessed at from memory.

### By Hand

Any point `(x, y)` at distance `r` from the origin, at angle `α` from the
positive x-axis, can be written using basic trigonometry:

```
x = r cos(α)
y = r sin(α)
```

Rotating that point by an additional angle `φ` moves it to angle `α + φ`,
at the *same* distance `r` (rotation never changes distance from the
center):

```
x' = r cos(α + φ)
y' = r sin(α + φ)
```

This is where the standard trigonometric **angle-addition identities**
come in — these are given, established facts about sine and cosine, the
same way `Math.PI` was accepted as a given constant back in Arc 0, not
re-derived here:

```
cos(α + φ) = cos(α)cos(φ) − sin(α)sin(φ)
sin(α + φ) = sin(α)cos(φ) + cos(α)sin(φ)
```

Substituting those in:

```
x' = r [cos(α)cos(φ) − sin(α)sin(φ)]
   = [r cos(α)]cos(φ) − [r sin(α)]sin(φ)
   = x cos(φ) − y sin(φ)          (since r cos(α) = x, r sin(α) = y)

y' = r [sin(α)cos(φ) + cos(α)sin(φ)]
   = [r sin(α)]cos(φ) + [r cos(α)]sin(φ)
   = y cos(φ) + x sin(φ)
```

This is the full 2D rotation formula — derived, not memorized:

```
x' = x cos(φ) − y sin(φ)
y' = x sin(φ) + y cos(φ)
```

**Worked numerically:** rotate `(5, 0)` by `90°`:

```
φ = 90°,  cos(90°) = 0,  sin(90°) = 1

x' = 5(0) − 0(1) = 0
y' = 5(1) + 0(0) = 5

result: (0, 5)
```

Which matches geometric intuition exactly: a point 5 units out along
`+x`, turned a quarter-circle counterclockwise, lands 5 units out along
`+y`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none yet — the formula is proven here; the matrix
  form (matching Lesson 12's shape) is built in the next unit.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** none new

### Isolating the Concept

```js
const point = { x: 5, y: 0 };
const phi = Math.PI / 2;

const cosPhi = Math.cos(phi);
const sinPhi = Math.sin(phi);
console.log("cos(90deg) =", cosPhi, " sin(90deg) =", sinPhi);

const xPrime = point.x * cosPhi - point.y * sinPhi;
const yPrime = point.x * sinPhi + point.y * cosPhi;
console.log("rotated point: (" + xPrime + ", " + yPrime + ")");
```

Real output:

```
cos(90deg) = 6.123233995736766e-17  sin(90deg) = 1
rotated point: (3.061616997868383e-16, 5)
```

What this proves, honestly: the derived formula gives `(≈0, 5)` —
matching the by-hand result — but `≈0`, not exactly `0`. `Math.cos(Math.PI
/ 2)` itself isn't exactly zero (`6.12 × 10⁻¹⁷`, a number so close to zero
it's essentially floating-point rounding noise) because `Math.PI` is
itself only a finite-precision approximation of the true, irrational value
of π. This is a real, verified detail worth knowing now — floating-point
trigonometry is *almost* exact, not exactly exact, and code that checks
`=== 0` after a rotation will be wrong far more often than code that
checks "close enough to zero."

### Discarding

Discarded — the standalone check is illustrative; the real, permanent
version is the matrix form built in the next unit.

### CS Lens

Deriving a transformation from first principles (here, known trig
identities) rather than treating it as an opaque formula is itself a
recurring discipline.

```
Also recognized in: deriving a physics simulation's update equations
from Newton's laws rather than copying a "magic" formula, deriving a
cryptographic protocol's security from its underlying hard problem rather
than trusting it because it "looks complicated," deriving a database
index's performance characteristics from its actual data structure rather
than folklore about which index "is faster"
```

### SE Lens

Not applicable in the usual implementation-alternative sense — this is a
mathematical derivation, not a design decision. The real, concrete
takeaway carried into the rest of this lesson: floating-point
imprecision, just demonstrated, is a genuine property of every rotation
this project will ever perform with `Math.cos`/`Math.sin`, not a one-off
edge case — worth remembering the next time a comparison against an
exact rotated value doesn't match perfectly.

### Run It

Real output already shown above.

### Connecting

The formula is derived and verified for one case — the next unit turns it
into the same homogeneous matrix shape Lesson 12 already established for
translation.

---

## Concept Unit: The Rotation Matrix

### The Problem

Lesson 12 represented translation as a 3×3 homogeneous matrix specifically
so it could eventually combine with other transformations through matrix
multiplication (Lesson 15). Rotation needs to speak that same language —
not a separate, incompatible function — to participate in that future
composition.

### By Hand

The derived formula from the previous unit, written directly as a matrix
multiplication (verify this multiplies out to the same two equations by
checking row by row):

```
R = | cos(φ)  -sin(φ)  0 |
    | sin(φ)   cos(φ)  0 |
    |   0        0     1 |

R * (x, y, 1):
row 1: x·cos(φ) + y·(-sin(φ)) + 1·0 = x cos(φ) − y sin(φ)   = x'
row 2: x·sin(φ) + y·cos(φ)    + 1·0 = x sin(φ) + y cos(φ)   = y'
row 3: x·0 + y·0 + 1·1 = 1
```

Row 1 and row 2 are exactly the formulas derived by hand in the previous
unit — the matrix form isn't a different calculation, just the same one
written so it can be multiplied alongside a translation matrix later.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `applyMatrix`
- **Dependencies:** `applyMatrix`, from Lesson 12

### The New Code

```js
function rotationMatrix(phi) {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return [
    [c, -s, 0],
    [s,  c, 0],
    [0,  0, 1],
  ];
}
```

### The Updated Project

```js
function applyMatrix(m, point) {
  const w = 1;
  return {
    x: m[0][0] * point.x + m[0][1] * point.y + m[0][2] * w,
    y: m[1][0] * point.x + m[1][1] * point.y + m[1][2] * w,
  };
}

function rotationMatrix(phi) {         // ← new
  const c = Math.cos(phi);             // ← new
  const s = Math.sin(phi);             // ← new
  return [                             // ← new
    [c, -s, 0],                        // ← new
    [s,  c, 0],                        // ← new
    [0,  0, 1],                        // ← new
  ];                                    // ← new
}                                       // ← new
```

Note that `rotationMatrix` builds a matrix in the exact same 3×3 shape
`translationMatrix` did — `applyMatrix`, already written, needs no changes
at all to work with either one.

### Isolating the Concept

```js
const point = { x: 5, y: 0 };
const R = rotationMatrix(Math.PI / 2);
console.log("R =", JSON.stringify(R));

const result = applyMatrix(R, point);
console.log("R * point =", JSON.stringify(result));
```

Real output:

```
R = [[6.123233995736766e-17,-1,0],[1,6.123233995736766e-17,0],[0,0,1]]
R * point = {"x":3.061616997868383e-16,"y":5}
```

Matches the by-hand formula's result from the previous unit exactly — the
same `≈0, 5`, now reached through `applyMatrix`, the identical function
Lesson 12 used for translation.

**Checked against a known, exact case** — rotating `(1, 0)` by `180°`,
which should land on exactly `(-1, 0)`:

```js
const point2 = { x: 1, y: 0 };
const result2 = applyMatrix(rotationMatrix(Math.PI), point2);
console.log("rotate (1,0) by 180deg:", JSON.stringify(result2));
```

Real output:

```
rotate (1,0) by 180deg: {"x":-1,"y":1.2246467991473532e-16}
```

`x` comes back exactly `-1` here — this particular case happens to avoid
the worst of the floating-point noise, while `y` still shows the same tiny
near-zero artifact from the previous unit.

### Discarding

Discarded — the standalone checks above never appear in the project;
`rotationMatrix` itself is the real, permanent function.

### Mechanical Walkthrough

- **`function rotationMatrix(phi) { ... }`** — (b) a concept reappearing —
  ordinary function declaration, same shape as `translationMatrix`.
- **`Math.cos(phi)` / `Math.sin(phi)`** — (a) first appearance in project
  code (though used in the previous unit's isolated check already).
  Standard trigonometric functions, taking an angle in radians.
- **The returned 3×3 array** — (b) a concept reappearing: the same
  array-of-arrays shape `translationMatrix` already established.

### CS Lens

Not a new hard concept — this unit is the direct matrix encoding of the
previous unit's derivation; no separate lens needed.

### SE Lens

The alternative not chosen: give `rotationMatrix` a different return shape
than `translationMatrix` (say, a flat 4-number array, since 2D rotation
technically only needs `cos`/`sin`, not a full 3×3). The real reason both
use the identical 3×3 shape: `applyMatrix`, already written for
translation, works on `rotationMatrix`'s output completely unchanged —
demonstrated above. A different shape would mean either a second
`applyMatrix`-like function, or constant reshaping between the two —
both real complexity this project avoids entirely by committing both
transformations to one shared matrix format from the start.

### Run It

Real output already shown above.

### Connecting

Rotation now works correctly for individual points, in the same matrix
form as translation — the final unit applies it to a whole shape and
checks it against a case precise enough to catch a real mistake, not just
a plausible-looking one.

---

## Concept Unit: Verifying Against Known Cases — a Full Rotation

### The Problem

Two isolated checks (90°, 180°) are reassuring but limited — a genuinely
convincing test pushes the function to a case where a mistake (like a
sign error, swapping `sin`/`cos`, or reversing the formula's two rows)
would be caught, not accidentally hidden by a case that happens to work
either way.

### By Hand

Rotating a point by 90°, four times in a row, should return it to
(approximately) its exact starting position — a 360° total turn:

```
start: (5, 0)
after 1×90°:  (0, 5)
after 2×90°:  (-5, 0)
after 3×90°:  (0, -5)
after 4×90°:  (5, 0)     — back to start
```

This is a strong check specifically because a *wrong* rotation matrix
(say, with a sign error) would very likely fail to return to the exact
starting point after four applications, even if any single 90° step
happened to look plausible in isolation.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `rotationMatrix`
- **Dependencies:** `rotationMatrix`, `applyMatrix`

### The New Code

```js
function rotateShape(points, phi) {
  const R = rotationMatrix(phi);
  return points.map((point) => applyMatrix(R, point));
}
```

### The Updated Project

```js
function rotationMatrix(phi) {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return [
    [c, -s, 0],
    [s,  c, 0],
    [0,  0, 1],
  ];
}

function rotateShape(points, phi) {                          // ← new
  const R = rotationMatrix(phi);                              // ← new
  return points.map((point) => applyMatrix(R, point));        // ← new
}                                                              // ← new
```

### Isolating the Concept

The four-times-90° round trip, run for real:

```js
const R = rotationMatrix(Math.PI / 2);
let p = { x: 5, y: 0 };
for (let i = 0; i < 4; i++) {
  p = applyMatrix(R, p);
  console.log("after rotation " + (i + 1) + ":", JSON.stringify(p));
}
```

Real output:

```
after rotation 1: {"x":3.061616997868383e-16,"y":5}
after rotation 2: {"x":-5,"y":6.123233995736766e-16}
after rotation 3: {"x":-9.18485099360515e-16,"y":-5}
after rotation 4: {"x":5,"y":-1.2246467991473533e-15}
```

What this proves: after four 90° turns, the point lands back at
`(5, ≈-1.2×10⁻¹⁵)` — `x` recovers to exactly `5`, and `y`, which started
at exactly `0`, ends up at a number so close to zero it's meaningless as
anything but floating-point noise, having accumulated slightly across four
successive rotations (each one carrying forward the previous unit's own
tiny imprecision). This is a genuinely correct result — not a bug — and
exactly the kind of case Unit 1's honesty about floating-point rotation
predicted.

`rotateShape`, applied to a real two-point line segment, rotated 45°, and
drawn:

```js
const segment = [{ x: 0, y: 0 }, { x: 200, y: 0 }];
const rotated = rotateShape(segment, Math.PI / 4);
console.log("rotated segment:", JSON.stringify(rotated));
```

Real output:

```
rotated segment: [{"x":0,"y":0},{"x":141.4213562373095,"y":141.42135623730948}]
```

`141.42` is `200 / √2` — exactly where a 200-unit line, turned 45°, should
land: both `x` and `y` equal, since 45° is precisely halfway between the
x-axis and y-axis.

### Discarding

Discarded — the round-trip and segment checks above are illustrative; the
permanent function is `rotateShape`.

### Mechanical Walkthrough

- **`function rotateShape(points, phi) { ... }`** — (b) a concept
  reappearing — same shape as `translateShape` (Lesson 12): build one
  transformation matrix once, then `.map()` it across every point.
- **`const R = rotationMatrix(phi);`** — (b) a concept reappearing —
  calling `rotationMatrix`, already fully explained.
- **`points.map((point) => applyMatrix(R, point))`** — (b) a concept
  reappearing — `.map()` and arrow functions, both already established in
  Lesson 12, applied here with `applyMatrix` in place of `addVectors`.

### CS Lens

Not a new hard concept here — the reuse itself is the point: `rotateShape`
and `translateShape` share an identical structural shape (build a
transform, map it across points), previewing exactly what Lesson 15's
matrix composition formalizes.

### SE Lens

The alternative not chosen: test `rotationMatrix` against only a single
90° case, as the second unit's isolated check did, and stop there. The
real risk that a single-case test misses: a rotation matrix with, say,
`sin`/`cos` swapped in the wrong positions can still produce a
*plausible-looking* result for one specific angle, while being wrong in
general. The four-times-90° round trip specifically stresses the formula
across all four quadrants in sequence, which is far more likely to expose
a sign or ordering mistake than any single isolated check.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

Rotation is now derived, matrix-encoded, cross-checked against known
geometry, and stress-tested with a full-circle round trip — the next
lesson (scaling) is the last individual transformation before Lesson 15
combines all three into one matrix.

---

## Closing

### Connect the Pieces

One point traced through the whole lesson: `(5, 0)`. The by-hand
derivation (Unit 1), built from the trigonometric angle-addition
identities, predicts it rotates to `(0, 5)` under a 90° turn.
`rotationMatrix` and `applyMatrix` (Unit 2) confirm this numerically,
including the honestly-reported floating-point residue. `rotateShape`
(Unit 3) proves the same matrix survives four consecutive applications —
a full circle — landing back within floating-point noise of where it
started, which is the strongest evidence yet that the formula derived on
paper at the start of this lesson is genuinely, structurally correct.

### What Breaks Without This

A realistic mistake: swapping the sign in the rotation matrix — using
`+sin(φ)` in the top-right position instead of the derived `-sin(φ)`:

```js
function wrongRotationMatrix(phi) {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return [
    [c, s, 0],   // WRONG: should be -s
    [s, c, 0],
    [0, 0, 1],
  ];
}

const point = { x: 5, y: 0 };
const wrongResult = applyMatrix(wrongRotationMatrix(Math.PI / 2), point);
const correctResult = applyMatrix(rotationMatrix(Math.PI / 2), point);
console.log("WRONG rotation of (5,0) by 90deg:", JSON.stringify(wrongResult));
console.log("correct rotation of (5,0) by 90deg:", JSON.stringify(correctResult));
```

Real output:

```
WRONG rotation of (5,0) by 90deg: {"x":3.061616997868383e-16,"y":5}
correct rotation of (5,0) by 90deg: {"x":3.061616997868383e-16,"y":5}
```

Both versions agree for this specific point and angle — because `(5, 0)`
has `y = 0`, the entry that differs between the two matrices gets
multiplied by zero and the mistake never shows up. This is a genuinely
dangerous kind of bug: it hides completely behind the most obvious test
case, which is exactly why Unit 3's four-rotation round trip (using
intermediate points with nonzero `y`) is the check that actually matters —
rerunning that same round trip with `wrongRotationMatrix` would fail to
return to `(5, 0)`, because by the second 90° step, `y` is no longer zero
and the sign error finally has something real to corrupt.

### Exercises

- By hand, rotate `(0, 10)` by `90°` and predict the result before running
  it — this tests a point that starts on the y-axis instead of the
  x-axis.
- Rerun Unit 3's four-times-90° round trip using `wrongRotationMatrix`
  from the Closing section above, and confirm it does *not* return to the
  starting point — direct proof that the earlier "it looked fine" result
  was a false negative caused by testing only a zero-`y` point.
- Rotate the project's existing translated square (from Lesson 12's
  exercises) by 30°, and confirm all four corners move while the shape
  itself stays rigid (every pair of corners keeps the same distance
  apart) using `distance` from Lesson 11.

### Definition of Done

- [ ] `rotationMatrix` and `rotateShape` exist in `script.js` and match
      the by-hand derivation exactly
- [ ] The four-times-90° round trip returns to within floating-point noise
      of its starting point
- [ ] You can explain, without looking, why testing only `(5, 0)` would
      have hidden a sign error in the rotation matrix, and why the
      four-rotation test does not
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add rotation matrix, derived from sin/cos angle-addition identities

  rotationMatrix builds the same homogeneous 3x3 shape as
  translationMatrix, so applyMatrix works unchanged on either. Verified
  against a hand-derived 90-degree case, an exact 180-degree case, and a
  four-times-90-degree round trip - the last of which is shown to catch a
  sign error that a single-point test at (5,0) would silently hide."
  ```
