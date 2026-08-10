# Lesson 8: How Long, and Which Way

**What you will build:** a function computing a vector's length, and a
second one that strips that length away entirely, leaving only its pure
direction. The transferable problem: a vector conflates two separate
pieces of information — **how far** and **which way** — and plenty of real
code (toolpath direction, motion-profile heading, camera-facing vectors
later in Three.js) only ever wants the second one. Using a vector's raw
`x, y` as "just a direction" without accounting for its length is a bug
this lesson proves, concretely, before it has a chance to happen for real.

**What you need to know first:** Lesson 7 (Arc 1) — `addVectors`, and the
point-vs-vector distinction it established.

---

## Concept Unit: Vector Magnitude

### The Problem

`addVectors` and `subtractPoints` from the previous lesson both produce
vectors — but neither says anything about how *long* those vectors are.
"How far does this displacement actually travel?" is a real, separate
question a vector's raw `x, y` doesn't answer directly.

### By Hand

A vector's `x` and `y` components are literally the two legs of a right
triangle — the horizontal distance and the vertical distance — with the
vector itself as the hypotenuse. Its length is exactly the Pythagorean
theorem:

```
v = (3, 4)

|v| = sqrt(x² + y²)
    = sqrt(3² + 4²)
    = sqrt(9 + 16)
    = sqrt(25)
    = 5
```

`|v|` (read "the magnitude of v," sometimes written `‖v‖`) is the standard
notation for a vector's length.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `subtractPoints`
- **Dependencies:** none new

### The New Code

```js
function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
```

### The Updated Project

```js
function subtractPoints(a, b) {
  return { type: "vector", x: a.x - b.x, y: a.y - b.y };
}

function magnitude(v) {                              // ← new
  return Math.sqrt(v.x * v.x + v.y * v.y);            // ← new
}                                                      // ← new
```

### Isolating the Concept

```js
const v = { x: 3, y: 4 };
console.log("|v| = sqrt(" + v.x + "^2 + " + v.y + "^2) = sqrt(" + (v.x*v.x) + " + " + (v.y*v.y) + ") = sqrt(" + (v.x*v.x + v.y*v.y) + ") = " + magnitude(v));
```

Real output:

```
|v| = sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5
```

This matches the by-hand result exactly. `Math.sqrt` is the built-in
square root function on the global `Math` object — the same object
`Math.PI` came from in Arc 0.

### Discarding

Discarded — the real function is `magnitude` above; this was only a
verification of it.

### Mechanical Walkthrough

- **`function magnitude(v) { ... }`** — (b) a concept reappearing —
  ordinary function declaration, same shape as every function so far.
- **`v.x * v.x`** — (a) first appearance of multiplication in this
  project's code, used here to square a value (`v.x * v.x` is `v.x²`,
  written this way because JavaScript has no dedicated exponent-squaring
  shorthand as clean as multiplying a value by itself).
- **`Math.sqrt(...)`** — (a) first appearance. Returns the square root of
  its argument — the one step in the Pythagorean formula with no simpler
  arithmetic equivalent.

### CS Lens

Not a hard concept in itself — this is a direct arithmetic formula; its
broader significance (as the basis for distance calculations throughout
computational geometry) doesn't need a separate multi-example lens here.

### SE Lens

The alternative not chosen: inline `Math.sqrt(v.x * v.x + v.y * v.y)`
everywhere a length is needed, rather than a named function. The real
cost: this exact formula is about to be needed again, immediately, inside
`normalize` (the next unit) — a named function means that dependency is
explicit and the formula exists in exactly one place.

### Run It

Real output already shown above.

### Connecting

With a way to measure a vector's length, the next unit uses it to remove
that length entirely.

---

## Concept Unit: Normalization

### The Problem

A "direction, with no particular length" — pure direction, exactly one
unit long — is needed constantly: to move something a fixed distance per
frame regardless of how some other calculation produced its heading, to
point a camera, to offset a toolpath by a fixed distance perpendicular to
its direction (Arc 4). Every vector needs a reliable way to become exactly
that.

### By Hand

Dividing a vector by its own magnitude scales it down (or up) to exactly
length 1, while leaving its direction completely unchanged — dividing both
components by the same positive number can't rotate the vector, only
resize it.

```
v = (3, 4), |v| = 5

unit = (v.x / |v|, v.y / |v|)
     = (3/5, 4/5)
     = (0.6, 0.8)
```

**Check it, by hand:** the result's own magnitude should be exactly `1`.

```
|unit| = sqrt(0.6² + 0.8²) = sqrt(0.36 + 0.64) = sqrt(1.0) = 1  ✓
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** directly after `magnitude`
- **Dependencies:** `magnitude`, from the previous unit

### The New Code

```js
function normalize(v) {
  const m = magnitude(v);
  return { type: "vector", x: v.x / m, y: v.y / m };
}
```

### The Updated Project

```js
function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v) {                                       // ← new
  const m = magnitude(v);                                      // ← new
  return { type: "vector", x: v.x / m, y: v.y / m };            // ← new
}                                                                // ← new
```

### Isolating the Concept

```js
const v = { x: 3, y: 4 };
const unit = normalize(v);
console.log("unit = (" + v.x + "/" + magnitude(v) + ", " + v.y + "/" + magnitude(v) + ") =", JSON.stringify(unit));
console.log("|unit| =", magnitude(unit));
```

Real output:

```
unit = (3/5, 4/5) = {"type":"vector","x":0.6,"y":0.8}
|unit| = 1
```

Matches the by-hand check exactly — `magnitude(unit)` really does come
back to `1`, computed by the same function trusted in the previous unit,
not just asserted.

### Discarding

Discarded — the real function is `normalize`, shown above.

### Mechanical Walkthrough

- **`function normalize(v) { ... }`** — (b) a concept reappearing —
  ordinary function declaration.
- **`const m = magnitude(v);`** — (b) a concept reappearing: calling
  `magnitude`, already fully explained in the previous unit, and storing
  its result under a short local name for reuse in the next line.
- **`v.x / m` / `v.y / m`** — (a) first appearance of division in this
  project's code — scaling each component down by the same factor.

### CS Lens

Producing a **unit vector** — magnitude exactly 1, direction preserved —
is worth naming broadly on its own.

```
Also recognized in: surface normals in 3D graphics (always kept unit
length), a compass bearing (direction with distance stripped out), a
probability distribution normalized to sum to 1, audio signal
normalization (adjusting amplitude while preserving waveform shape)
```

### SE Lens

The alternative not chosen: skip normalization, and use a vector's raw
`x, y` directly anywhere "just the direction" is needed, trusting that its
magnitude happens not to matter for that particular use. The Closing
section below proves, with real numbers, exactly why that trust is
misplaced.

There's also a real edge case worth naming honestly: `normalize` divides
by `magnitude(v)`, and a zero-length vector (`{x: 0, y: 0}`) has magnitude
`0` — dividing by it produces `NaN`, not an error. This version doesn't
guard against that yet; it's real, known debt, worth revisiting once this
project's functions get real input validation (a natural fit once Arc 3
brings type-checking).

### Run It

Real output already shown above.

### Connecting

A true unit vector now exists — the closing section proves, concretely,
why skipping this step is a real and easy bug to introduce.

---

## Closing

### Connect the Pieces

One pair of vectors traced through the whole lesson: `v1 = (3, 4)` and
`v2 = (6, 8)` — pointing in exactly the same direction (`v2` is just `v1`
doubled), but with different lengths. `magnitude` (Unit 1) reports `5` and
`10` respectively. `normalize` (Unit 2), applied to each, produces the
*exact same result* for both: `(0.6, 0.8)` — proof that normalization
genuinely discards length while preserving direction, for two vectors that
started numerically different but geometrically identical in heading.

### What Breaks Without This

A concrete, real bug: using `v1` and `v2` directly as a per-frame movement
step, without normalizing first.

```js
const v1 = { x: 3, y: 4 };
const v2 = { x: 6, y: 8 };

console.log("v1 magnitude:", magnitude(v1));
console.log("v2 magnitude:", magnitude(v2));

console.log("using v1 directly as a movement step, distance per frame:", magnitude(v1));
console.log("using v2 directly as a movement step, distance per frame:", magnitude(v2));
console.log("same intended direction, but v2 moves " + (magnitude(v2) / magnitude(v1)) + "x faster - a real bug");
```

Real output:

```
v1 magnitude: 5
v2 magnitude: 10
using v1 directly as a movement step, distance per frame: 5
using v2 directly as a movement step, distance per frame: 10
same intended direction, but v2 moves 2x faster - a real bug
```

Two things meant to represent "the same direction" move at genuinely
different speeds, because their raw lengths leaked into a calculation
that was only supposed to care about direction. The fix:

```js
const fixedStepFromV1 = normalize(v1);
const fixedStepFromV2 = normalize(v2);
console.log("normalized v1:", JSON.stringify(fixedStepFromV1));
console.log("normalized v2:", JSON.stringify(fixedStepFromV2));
console.log("both normalized vectors have magnitude 1:", magnitude(fixedStepFromV1), magnitude(fixedStepFromV2));
```

Real output:

```
normalized v1: {"type":"vector","x":0.6,"y":0.8}
normalized v2: {"type":"vector","x":0.6,"y":0.8}
both normalized vectors have magnitude 1: 1 1
```

Normalized first, both vectors collapse to the exact same direction —
matching, then scaled by a single, deliberately-chosen speed value, is how
consistent motion actually gets built, starting in Arc 5.

### Exercises

- By hand, compute the magnitude of `(5, 12)` (a 5-12-13 right triangle —
  a classic Pythagorean triple), then confirm it with `magnitude`.
- Normalize `(5, 12)` by hand (divide each component by the magnitude you
  just found), then confirm with `normalize`, and check that
  `magnitude()` of your result comes back to `1`.
- Draw a vector's normalized direction on the canvas, scaled up to a fixed
  visible length (say, multiplied by `100`), starting from a chosen origin
  point — using `addVectors` from Lesson 7 to place its endpoint.

### Definition of Done

- [ ] `magnitude` and `normalize` exist in `script.js` and match their
      by-hand derivations exactly
- [ ] `magnitude(normalize(v))` equals `1` (or very close to it — floating
      point) for at least one vector you chose yourself
- [ ] You can explain, without looking, a real situation where using an
      un-normalized vector as "just a direction" would cause a visible bug
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add vector magnitude and normalization, derived by hand first

  magnitude uses the Pythagorean theorem to find a vector's length;
  normalize divides by that length to produce a unit vector. Verified
  against hand calculations and demonstrated the real bug that using an
  un-normalized vector as a direction causes - two vectors pointing the
  same way moving at different speeds."
  ```
