# Lesson 9: One Number, Two Vectors, a Real Relationship

**What you will build:** a dot product function, then two real uses of it —
a cheap same-direction/opposite-direction/perpendicular check, and a full
angle-between-two-vectors calculation. The transferable problem: two
vectors can be combined into a single number that says something genuinely
useful about how they *relate* to each other — not their individual
lengths or positions, but the relationship between their directions. This
is the single most-reused operation in Arc 2's rotation work and Arc 4's
toolpath-direction logic.

**What you need to know first:** Lesson 8 (Arc 1) — `magnitude`, reused
here to go from the dot product to an actual angle.

---

## Concept Unit: The Dot Product Formula

### The Problem

`addVectors` and `subtractPoints` combine two vectors into a third vector.
Nothing so far combines two vectors into a single, meaningful *number* —
which is exactly the shape needed for a question like "are these two
directions roughly aligned, or opposed?"

### By Hand

The dot product of two vectors multiplies their matching components
together, then adds the results:

```
a = (1, 0)
b = (0, 1)

a · b = (a.x × b.x) + (a.y × b.y)
      = (1 × 0) + (0 × 1)
      = 0 + 0
      = 0
```

(Read `a · b` as "a dot b" — the dot is the actual operator symbol, which
is why this is called the **dot product**.)

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `normalize`
- **Dependencies:** none new

### The New Code

```js
function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}
```

### The Updated Project

```js
function normalize(v) {
  const m = magnitude(v);
  return { type: "vector", x: v.x / m, y: v.y / m };
}

function dot(a, b) {              // ← new
  return a.x * b.x + a.y * b.y;   // ← new
}                                  // ← new
```

### Isolating the Concept

```js
const a = { x: 1, y: 0 };
const b = { x: 0, y: 1 };
console.log("a . b = (" + a.x + "*" + b.x + ") + (" + a.y + "*" + b.y + ") = " + (a.x*b.x) + " + " + (a.y*b.y) + " = " + dot(a, b));
```

Real output:

```
a . b = (1*0) + (0*1) = 0 + 0 = 0
```

Matches the by-hand result exactly. `a` and `b` here happen to be
perpendicular — pointing straight along the x-axis and y-axis — and their
dot product came out to exactly `0`. That's not a coincidence; the next
unit shows why.

### Discarding

Discarded — the real function is `dot`, shown above.

### Mechanical Walkthrough

- **`function dot(a, b) { ... }`** — (b) a concept reappearing — ordinary
  function declaration.
- **`a.x * b.x + a.y * b.y`** — (c) genuinely basic — the same
  multiplication and addition operators already established; what's new
  is only the specific combination (multiply matching components, then
  sum), not the operators themselves.

### CS Lens

Not yet expanded — the dot product's real significance (as the foundation
for projection and angle calculations) is exactly what the next two units
cover in full, with multiple real-world connections there instead.

### SE Lens

The alternative not chosen: there isn't really one here — this is the
standard, universal definition of the 2D dot product; no meaningful
implementation variation exists for it the way there was for, say,
`toCanvasY`'s flip direction.

### Run It

Real output already shown above.

### Connecting

One number now exists to represent something about two vectors together —
the next unit is what that number actually means.

---

## Concept Unit: The Sign of the Dot Product

### The Problem

A single number, on its own, isn't obviously useful yet. What does `0`
actually indicate? What would a positive or negative result mean? Before
computing exact angles (the next unit), there's a cheap, extremely common
check that only needs the dot product's *sign*.

### By Hand

```
a = (1, 0)          — pointing along +x

c = (2, 0)   a · c = (1×2) + (0×0) = 2     — same general direction: positive
d = (-2, 0)  a · d = (1×-2) + (0×0) = -2   — opposite general direction: negative
b = (0, 1)   a · b = (1×0) + (0×1) = 0     — perpendicular: exactly zero
```

The pattern: two vectors pointing in roughly the same direction produce a
**positive** dot product; roughly opposite directions produce a
**negative** one; exactly perpendicular produces **zero** — regardless of
either vector's actual length.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none — this unit is a usage pattern of the existing
  `dot` function, not new code of its own.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** `dot`, from the previous unit

### Isolating the Concept

A practical version of the by-hand example — checking whether a few
candidate directions are roughly "forward" relative to a fixed heading:

```js
const heading = { x: 1, y: 0 };
const candidateA = { x: 1, y: 0.2 };
const candidateB = { x: -1, y: 0.1 };
const candidateC = { x: 0, y: 1 };

console.log("dot(heading, candidateA) =", dot(heading, candidateA), "-> positive: same general direction");
console.log("dot(heading, candidateB) =", dot(heading, candidateB), "-> negative: opposite general direction");
console.log("dot(heading, candidateC) =", dot(heading, candidateC), "-> zero: perpendicular");
```

Real output:

```
dot(heading, candidateA) = 1 -> positive: same general direction
dot(heading, candidateB) = -1 -> negative: opposite general direction
dot(heading, candidateC) = 0 -> zero: perpendicular
```

What this proves: without computing a single angle, or even normalizing
anything, the dot product's sign alone correctly sorted three candidate
directions into "roughly forward," "roughly backward," and "exactly
sideways" — a genuinely useful, cheap check.

### Discarding

Discarded — `heading`/`candidateA/B/C` are illustrative; real project usage
comes with actual toolpath and motion vectors starting in later arcs.

### CS Lens

The dot product's sign as a same-side/opposite-side/perpendicular test is
worth naming broadly, since it recurs everywhere geometry meets decision-
making.

```
Also recognized in: back-face culling in 3D graphics (is a surface facing
the camera or away from it?), collision response (is an object moving
into a surface or away from it?), a lighting model's diffuse shading
(how directly does a surface face a light?), steering behaviors in game
AI (is a target ahead of or behind the current heading?)
```

### SE Lens

The alternative not chosen: compute the *actual* angle (the next unit)
just to check whether it's less than or greater than 90°. The real
tradeoff: an angle calculation needs both magnitudes and an `acos` call —
strictly more work — when only the sign is actually needed. Checking the
raw dot product's sign avoids all of that: cheaper, and immune to the
edge cases (like a zero-length vector) that dividing by magnitude can hit.

### Run It

Real output already shown above.

### Connecting

The sign alone answers "roughly which way" — the final unit gets the exact
number.

---

## Concept Unit: Finding the Actual Angle

### The Problem

Sometimes the sign isn't enough — Arc 2's rotation work and Arc 5's
kinematics both need the *exact* angle between two vectors, in degrees or
radians, not just "positive or negative."

### By Hand

The dot product connects to the angle between two vectors through a real
geometric identity:

```
a · b = |a| |b| cos(θ)
```

Solved for `θ` (the angle itself):

```
θ = acos( (a · b) / (|a| |b|) )
```

Worked with real numbers:

```
u = (3, 4), w = (4, 3)

u · w = (3×4) + (4×3) = 12 + 12 = 24
|u| = sqrt(3² + 4²) = 5
|w| = sqrt(4² + 3²) = 5

cos(θ) = 24 / (5 × 5) = 24/25 = 0.96

θ = acos(0.96) ≈ 0.2838 radians ≈ 16.26°
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `dot`
- **Dependencies:** `dot`, `magnitude`

### The New Code

```js
function angleBetween(a, b) {
  const cosTheta = dot(a, b) / (magnitude(a) * magnitude(b));
  return Math.acos(cosTheta);
}
```

### The Updated Project

```js
function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function angleBetween(a, b) {                                    // ← new
  const cosTheta = dot(a, b) / (magnitude(a) * magnitude(b));     // ← new
  return Math.acos(cosTheta);                                     // ← new
}                                                                  // ← new
```

### Isolating the Concept

```js
const u = { x: 3, y: 4 };
const w = { x: 4, y: 3 };

const dotUW = dot(u, w);
const magU = magnitude(u);
const magW = magnitude(w);
const cosTheta = dotUW / (magU * magW);
const thetaRad = angleBetween(u, w);
const thetaDeg = thetaRad * (180 / Math.PI);

console.log("u . w =", dotUW, ", |u| =", magU, ", |w| =", magW);
console.log("cos(theta) = " + dotUW + "/(" + magU + "*" + magW + ") =", cosTheta);
console.log("theta =", thetaRad, "radians =", thetaDeg, "degrees");
```

Real output:

```
u . w = 24 , |u| = 5 , |w| = 5
cos(theta) = 24/(5*5) = 0.96
theta = 0.283794109208328 radians = 16.260204708311967 degrees
```

Matches the by-hand result exactly — `angleBetween` computes the same
`0.2838` radians, `16.26°`, worked out on paper above.

**Check it at the edges**, since a formula deserves testing at its known
boundary cases, not just one arbitrary example:

```js
const right = { x: 1, y: 0 };
const up = { x: 0, y: 1 };
console.log("angle between perpendicular vectors:", angleBetween(right, up) * (180 / Math.PI), "degrees");

const opposite = { x: -1, y: 0 };
console.log("angle between opposite vectors:", angleBetween(right, opposite) * (180 / Math.PI), "degrees");

const same = { x: 5, y: 0 };
console.log("angle between same-direction vectors:", angleBetween(right, same) * (180 / Math.PI), "degrees");
```

Real output:

```
angle between perpendicular vectors: 90
angle between opposite vectors: 180
angle between same-direction vectors: 0
```

Exactly the three values geometry predicts — perpendicular vectors are
90° apart, opposite vectors are 180° apart, and vectors already pointing
the same way (even at different lengths, per Lesson 8) are 0° apart.

### Discarding

Discarded — `u`/`w`/`right`/`up`/`opposite`/`same` are all illustrative;
they don't persist in the project past this check.

### Mechanical Walkthrough

- **`function angleBetween(a, b) { ... }`** — (b) a concept reappearing —
  ordinary function declaration.
- **`dot(a, b) / (magnitude(a) * magnitude(b))`** — (b) concepts
  reappearing: `dot` and `magnitude` are both already fully explained;
  what's new is only combining them via division, per the by-hand formula
  above.
- **`Math.acos(...)`** — (a) first appearance. The inverse cosine
  function — given a cosine value, returns the angle (in radians) that
  produces it. This is the one genuinely new piece: `cos(θ)` was
  computable directly from the previous line, but only `acos` can turn
  that ratio back into an actual angle.

### CS Lens

The dot-product-to-angle identity is worth its own multi-example lens —
it's one of the most-reused formulas in this entire curriculum.

```
Also recognized in: lighting calculations in every 3D renderer (the
angle between a surface normal and a light direction), robotics inverse
kinematics (finding joint angles from known positions — exactly what
Arc 5 does), machine learning's cosine similarity (comparing how aligned
two data vectors are), navigation systems computing bearing differences
```

### SE Lens

The alternative not chosen: skip `angleBetween` as its own function, and
inline the formula wherever an angle is needed. The real cost: this
formula has a genuine edge case — if either vector has magnitude `0`, the
division produces `NaN`, the same unguarded gap `normalize` had in Lesson
8. Centralizing it in one function means that gap needs fixing (eventually)
in exactly one place, not wherever it happened to get copy-pasted.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

An exact angle between any two vectors is now available — combined with
`normalize` from Lesson 8, this is everything Arc 2's rotation matrices are
about to build on top of.

---

## Closing

### Connect the Pieces

One pair of vectors traced through the whole lesson: `u = (3, 4)` and
`w = (4, 3)`. `dot(u, w)` (Unit 1) computes `24`. Its sign alone (Unit 2)
already says "these point in a broadly similar direction" — positive,
without a single trig function called. `angleBetween(u, w)` (Unit 3)
divides that same `24` by both magnitudes (from Lesson 8) and runs it
through `acos`, arriving at the exact value: `16.26°` apart — a small,
specific, hand-verified angle, not just "similar."

### What Breaks Without This

The genuine edge case named honestly in Unit 3 — calling `angleBetween`
with a zero-length vector:

```js
const zero = { x: 0, y: 0 };
const someVector = { x: 1, y: 0 };
console.log("angleBetween(zero, someVector):", angleBetween(zero, someVector));
```

Real output:

```
angleBetween(zero, someVector): NaN
```

No error is thrown — `NaN` ("Not a Number") silently propagates instead,
exactly like `normalize`'s own zero-magnitude gap from Lesson 8. This is
real, acknowledged debt: neither function currently guards against a
zero-length input. It's named here, deliberately, rather than hidden,
because a `NaN` appearing much later — inside, say, an Arc 4 toolpath
calculation — would be far harder to trace back to its actual cause than
seeing it reproduced cleanly, right here, the moment it was introduced.

### Exercises

- By hand, compute `dot((2, 2), (-1, 1))` and predict its sign before
  running it — these two vectors are actually perpendicular; verify your
  prediction equals exactly `0`.
- By hand, find the angle between `(1, 1)` and `(1, 0)` — this is a
  well-known case (a 45° angle) — then confirm with `angleBetween`.
- Using only the *sign* of `dot`, not `angleBetween`, write a one-line
  check that answers "is vector `b` pointing more toward vector `a` or
  more away from it?"

### Definition of Done

- [ ] `dot` and `angleBetween` exist in `script.js` and match their
      by-hand derivations exactly
- [ ] The three boundary checks (perpendicular = 90°, opposite = 180°,
      same direction = 0°) all pass
- [ ] You can explain, without looking, why the dot product's *sign* alone
      is enough to answer "same side or opposite side," without computing
      an angle
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add dot product and angle-between-vectors, derived by hand first

  dot() computes the raw dot product; angleBetween() combines it with
  magnitude and Math.acos to recover the exact angle, using the identity
  a.b = |a||b|cos(theta). Verified against hand calculations and the
  three boundary cases (0, 90, 180 degrees), and named the unguarded
  zero-vector NaN case as real, acknowledged debt shared with normalize."
  ```
