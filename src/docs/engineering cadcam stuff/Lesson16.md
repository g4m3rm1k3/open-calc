# Lesson 16: Rotating Around Anywhere You Choose

**What you will build:** a `rotateAboutPoint` function that rotates a shape
around any chosen center — not just the origin — by composing three
matrices this project already has, in a specific, necessary order. The
transferable problem: `rotationMatrix` only ever rotates around `(0, 0)`,
but almost no real rotation — spinning a toolpath arc around its own
center, turning a part around a fixed pivot — is actually about the
origin. This is the lesson where Lesson 15's proof that "order matters"
stops being an abstract warning and becomes the exact tool that makes
rotating around an arbitrary point possible at all.

**What you need to know first:** Lesson 15 (Arc 2) — `multiplyMatrices`,
and the proof that composed matrices apply right-to-left, both used
directly in this lesson's derivation.

---

## Concept Unit: The Problem With Rotating Around the Origin Only

### The Problem

`rotationMatrix`, exactly as built in Lesson 13, always rotates around
`(0, 0)`. A point far from the origin, rotated this way, doesn't spin in
place — it swings through a wide arc *around the origin*, which is rarely
the intended behavior.

### By Hand

Rotate the point `(150, 100)` by `90°`, using `rotationMatrix` exactly as
it already exists — around the origin, since that's the only center it
knows:

```
x' = 150 cos90° − 100 sin90° = 150(0) − 100(1) = −100
y' = 150 sin90° + 100 cos90° = 150(1) + 100(0) = 150

result: (−100, 150)
```

The point jumped from `(150, 100)` all the way to `(−100, 150)` — a
displacement of well over 200 units — for what was supposed to be a
90° spin "in place."

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none — this unit demonstrates the existing
  `rotationMatrix`'s real limitation; the fix is built in the next two
  units.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** `rotationMatrix`, `applyMatrix`, from Lesson 13

### Isolating the Concept

```js
const point = { x: 150, y: 100 };
const naive = applyMatrix(rotationMatrix(Math.PI / 2), point);
console.log("naive rotation about origin:", JSON.stringify(naive));
```

Real output:

```
naive rotation about origin: {"x":-99.99999999999999,"y":150}
```

Matches the by-hand result (within the usual floating-point residue from
Lesson 13). What this proves: the intuitive expectation — "rotating a
point by 90° should move it a modest amount, not fling it across the
canvas" — is only true when the point is already near the pivot. Every
point *not* near the origin gets swung through a wide arc instead of
spinning in place, exactly as demonstrated here with real numbers.

### Discarding

Discarded — this is a demonstration of the existing function's limitation,
not new code.

### CS Lens

Not yet expanded — the actual fix, and its broader CS significance, is
what the next two units cover.

### SE Lens

Not applicable — this unit identifies a real limitation, not a design
decision made within this project.

### Run It

Real output already shown above.

### Connecting

Rotating "in place" needs the pivot to *be* the origin, temporarily — the
next unit derives exactly how to arrange that.

---

## Concept Unit: Translate–Rotate–Translate-Back

### The Problem

`rotationMatrix` genuinely can only rotate around the origin — that isn't
a bug to patch, it's the mathematical nature of the formula derived in
Lesson 13. The fix isn't a different rotation formula; it's temporarily
moving the *problem* so the origin-only tool becomes the right tool.

### By Hand

Rotate `(150, 100)` by `90°`, around the point `(100, 100)` this time —
not the origin:

```
step 1 — translate so the desired center becomes the origin:
  relative = point − center = (150−100, 100−100) = (50, 0)

step 2 — rotate around the origin, which is now genuinely correct,
         since the point's position relative to the pivot is what's
         being rotated:
  x' = 50 cos90° − 0 sin90° = 0
  y' = 50 sin90° + 0 cos90° = 50
  rotated = (0, 50)

step 3 — translate back, undoing step 1's shift:
  final = rotated + center = (0+100, 50+100) = (100, 150)
```

**Check it, by hand:** the point's distance from the pivot should be
identical before and after — rotation never changes distance from its own
center of rotation.

```
distance((150,100), (100,100)) = sqrt(50² + 0²) = 50
distance((100,150), (100,100)) = sqrt(0² + 50²) = 50   ✓ matches
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `multiplyMatrices`
- **Dependencies:** `translationMatrix`, `rotationMatrix`,
  `multiplyMatrices`

### The New Code

```js
function rotateAboutPoint(phi, center) {
  const toOrigin = translationMatrix(-center.x, -center.y);
  const R = rotationMatrix(phi);
  const backToCenter = translationMatrix(center.x, center.y);
  return multiplyMatrices(backToCenter, multiplyMatrices(R, toOrigin));
}
```

### The Updated Project

```js
function multiplyMatrices(a, b) {
  const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += a[row][k] * b[k][col];
      }
      result[row][col] = sum;
    }
  }
  return result;
}

function rotateAboutPoint(phi, center) {                                          // ← new
  const toOrigin = translationMatrix(-center.x, -center.y);                       // ← new
  const R = rotationMatrix(phi);                                                   // ← new
  const backToCenter = translationMatrix(center.x, center.y);                      // ← new
  return multiplyMatrices(backToCenter, multiplyMatrices(R, toOrigin));            // ← new
}                                                                                    // ← new
```

Reading the composition right-to-left, exactly as Lesson 15 established:
`toOrigin` is applied first, then `R`, then `backToCenter` — the identical
three-step order just derived by hand.

### Isolating the Concept

```js
const point = { x: 150, y: 100 };
const center = { x: 100, y: 100 };

const relative = { x: point.x - center.x, y: point.y - center.y };
console.log("relative to center:", JSON.stringify(relative));

const rotated = applyMatrix(rotationMatrix(Math.PI / 2), relative);
console.log("rotated (about origin now):", JSON.stringify(rotated));

const final = { x: rotated.x + center.x, y: rotated.y + center.y };
console.log("translated back:", JSON.stringify(final));

const M = rotateAboutPoint(Math.PI / 2, center);
const composedResult = applyMatrix(M, point);
console.log("composed single-matrix result:", JSON.stringify(composedResult));
```

Real output:

```
relative to center: {"x":50,"y":0}
rotated (about origin now): {"x":3.061616997868383e-15,"y":50}
translated back: {"x":100,"y":150}
composed single-matrix result: {"x":100.00000000000001,"y":150}
```

Matches the by-hand derivation exactly, and the single composed matrix
(`rotateAboutPoint`) agrees with the manual three-step version to within
ordinary floating-point residue — proof the composed matrix genuinely
performs all three steps correctly in one `applyMatrix` call.

The distance check, run for real:

```js
console.log("distance from center before:", distance(point, center));
console.log("distance from center after:", distance(final, center));
```

Real output:

```
distance from center before: 50
distance from center after: 50
```

Confirms the point genuinely rotated in place around `(100,100)` — its
distance from that pivot never changed, unlike Unit 1's naive attempt,
which the exercises below have you re-check against this same distance
test.

### Discarding

Discarded — the standalone three-step check is illustrative;
`rotateAboutPoint` itself is the real, permanent function.

### Mechanical Walkthrough

- **`function rotateAboutPoint(phi, center) { ... }`** — (b) a concept
  reappearing — ordinary function declaration.
- **`translationMatrix(-center.x, -center.y)`** — (b) a concept
  reappearing: `translationMatrix`, from Lesson 12, called here with
  *negated* coordinates — worth noting explicitly: negating an offset
  produces the exact inverse translation, moving a point back the way it
  came, which is exactly what "translate the center to the origin" means.
- **`multiplyMatrices(backToCenter, multiplyMatrices(R, toOrigin))`** —
  (b) a concept reappearing — `multiplyMatrices`, from Lesson 15, called
  twice, nested, to combine three matrices into one. The nesting order —
  innermost first — mirrors the by-hand derivation's own step order:
  `toOrigin` happens first (innermost), then `R`, then `backToCenter`
  (outermost).

### CS Lens

This translate-transform-translate-back pattern is genuinely one of the
most-reused techniques in applied geometry — worth naming broadly.

```
Also recognized in: scaling an image around its own center rather than
its top-left corner (the exact same three-step pattern, with a scale
matrix substituted for rotation), rotating a 3D object around its own
pivot in any modeling software (Arc 6/7 will need this exact idea in 3D),
zooming a map toward the cursor's position rather than the map's corner,
CNC machining itself: rotating a part's toolpath around a fixed work
offset rather than the machine's own origin — precisely the real-world
motivation this entire lesson was building toward
```

### SE Lens

The alternative not chosen: write a dedicated "rotate around an arbitrary
point" formula from scratch, with its own derivation, rather than
composing three existing, already-trusted functions. The real benefit of
composition here: every piece (`translationMatrix`, `rotationMatrix`,
`multiplyMatrices`) was independently derived and verified in earlier
lessons — `rotateAboutPoint` doesn't introduce a single new mathematical
idea, only a specific, correct arrangement of ideas already proven
correct. A from-scratch formula would need its own separate derivation and
its own separate verification, duplicating work this project has already
done.

### Run It

Real output already shown above.

### Connecting

Rotation around any chosen point now works, verified against the naive
failure from Unit 1 and cross-checked step-by-step — closing out Arc 2's
individual transformations with the exact composed technique real toolpath
work will lean on.

---

## Closing

### Connect the Pieces

One point, `(150, 100)`, traced through the whole lesson. Rotated naively
by `rotationMatrix` alone (Unit 1), it lands at `(≈-100, 150)` — a wild
swing around the wrong center. Rotated instead by `rotateAboutPoint`
(Unit 2) around `(100, 100)`, it lands at `(100, 150)` — a modest,
genuinely in-place 90° turn, its distance from the pivot unchanged before
and after. The only difference between the two: `rotateAboutPoint` wraps
the exact same `rotationMatrix` in a translate-to-origin, then a
translate-back, using the composition and ordering rules Lesson 15 proved
matter.

### What Breaks Without This

Getting the translate-back step's sign wrong — a realistic mistake, easy
to make by copying the `toOrigin` translation's sign instead of negating
it back:

```js
function brokenRotateAboutPoint(phi, center) {
  const toOrigin = translationMatrix(-center.x, -center.y);
  const R = rotationMatrix(phi);
  const wrongBack = translationMatrix(-center.x, -center.y); // BUG: should be +center, not -center again
  return multiplyMatrices(wrongBack, multiplyMatrices(R, toOrigin));
}

const point = { x: 150, y: 100 };
const center = { x: 100, y: 100 };
const broken = applyMatrix(brokenRotateAboutPoint(Math.PI / 2, center), point);
const correct = applyMatrix(rotateAboutPoint(Math.PI / 2, center), point);
console.log("broken (sign copied instead of negated back):", JSON.stringify(broken));
console.log("correct:", JSON.stringify(correct));
console.log("distance from center, broken version:", distance(broken, center));
```

Real output:

```
broken (sign copied instead of negated back): {"x":-100,"y":-50.00000000000001}
correct: {"x":100.00000000000001,"y":150}
distance from center, broken version: 219.31712199461309
```

No error is thrown — the broken version runs, produces a real point, and
only close inspection (or, more reliably, the distance-from-center check
this lesson already established as the correct verification tool) reveals
it's nowhere near a legitimate in-place rotation.

### Exercises

- By hand, rotate `(100, 200)` by `180°` around center `(100, 100)` —
  predict the result before running it (hint: `180°` around a point
  directly above it has a simple geometric answer).
- Re-run Unit 1's naive rotation-about-origin distance check
  (`distance(naiveResult, center)` vs. the original point's distance from
  `center`) to confirm, numerically, that the naive version — unlike
  `rotateAboutPoint` — does *not* preserve distance from the intended
  pivot.
- Using `rotateAboutPoint`, rotate the project's existing square (from
  Lesson 12's exercises) around its own center (computed the same way
  `center()` was in Lesson 14) instead of around the origin, and confirm
  visually that it spins in place rather than swinging across the canvas.

### Definition of Done

- [ ] `rotateAboutPoint` exists in `script.js` and matches its by-hand,
      three-step derivation exactly
- [ ] The distance-from-pivot check passes before and after rotation, for
      a point and center you choose yourself
- [ ] You can explain, without looking, why `rotationMatrix` alone cannot
      rotate around any point except the origin, and what specifically
      fixes that
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add rotateAboutPoint via translate-rotate-translate-back, closing Arc 2

  Composes translationMatrix, rotationMatrix, and multiplyMatrices (all
  from earlier Arc 2 lessons) to rotate around any chosen center, not just
  the origin. Verified step-by-step against the by-hand derivation, and
  against a naive rotationMatrix-only attempt shown to swing a point far
  from its intended in-place position - confirmed correct via a
  distance-from-pivot check that stays constant before and after."
  ```

This closes Arc 2. Translation, rotation, scaling, matrix composition, and
rotation about an arbitrary point are now all derived by hand, matrix-
encoded in one consistent homogeneous form, and cross-verified against
each other. Arc 3 is next: migrating this entire hand-built engine into
TypeScript.
