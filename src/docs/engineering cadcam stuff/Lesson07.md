# Lesson 7: A Location Is Not a Direction

**What you will build:** two small functions — adding two vectors, and
subtracting one point from another — derived by hand first, then coded and
drawn on the canvas using the scene structure from Arc 0. The transferable
problem: **a point and a vector are stored identically (an `x` and a `y`)
but mean fundamentally different things**, and the arithmetic that's
meaningful for one is nonsense for the other, even though the computer
will happily compute it either way. This distinction is the foundation
every transformation, every toolpath direction, and every motion vector in
this entire curriculum is built on.

**What you need to know first:** Lesson 6 (Arc 0) — the `scene` array and
`renderShape`, which this lesson's drawn examples extend.

---

## Concept Unit: Points vs. Vectors

### The Problem

Consider two real values: "the mill's current position is `(100, 50)`,"
and "move 200 units right and 75 units up from wherever you are." Both are
naturally written as `(x, y)` pairs — `(100, 50)` and `(200, 75)` — but
they answer completely different questions. The first says *where
something is*. The second says *how far and in what direction to go*, with
no fixed location of its own — the same `(200, 75)` displacement means
something different starting from `(100, 50)` than it does starting from
`(0, 0)`. Code that doesn't distinguish these two ideas will eventually
perform an operation that's arithmetically valid but conceptually
meaningless — like adding two positions together, which this unit proves
computes a number with no real meaning at all.

### By Hand

A **point** is a location: `P = (100, 50)` means "here."

A **vector** is a displacement: `v = (200, 75)` means "200 right, 75 up,"
regardless of where it starts.

The operations that make sense follow directly from that meaning:

- `point + vector = point` — start somewhere, move by a displacement, end
  up at a new location. Meaningful.
- `vector + vector = vector` — combine two displacements into one
  displacement. Meaningful.
- `point - point = vector` — the displacement *between* two locations.
  Meaningful.
- `point + point = ?` — "here" plus "here" has no geometric meaning at
  all. Not meaningful, even though nothing stops a computer from adding
  the numbers.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none yet — this unit establishes the convention the
  next two units' code follows.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** the tagged-object pattern from Lesson 6 (Arc 0)

### Isolating the Concept

The real, concrete proof that "the arithmetic doesn't know the difference"
— adding two points, which produces a number, but not a meaningful one:

```js
function addVectors(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

const cornerA = { type: "point", x: 100, y: 50 };
const cornerB = { type: "point", x: 300, y: 200 };

const nonsenseResult = addVectors(cornerA, cornerB);
console.log("cornerA + cornerB (numbers happily compute):", JSON.stringify(nonsenseResult));

const displacement = { x: cornerB.x - cornerA.x, y: cornerB.y - cornerA.y };
console.log("cornerB - cornerA (a real, meaningful displacement):", JSON.stringify(displacement));
```

Real output:

```
cornerA + cornerB (numbers happily compute): {"x":400,"y":250}
cornerB - cornerA (a real, meaningful displacement): {"x":200,"y":150}
```

What this proves: `(400, 250)` is a real number pair, computed correctly,
representing *nothing* — it isn't either original corner, and it isn't a
distance or direction between them. The subtraction, by contrast, produces
`(200, 150)` — a genuinely meaningful displacement: "to get from `cornerA`
to `cornerB`, move 200 right and 150 up." Same arithmetic operators, one
result means something and one doesn't — proof this distinction has to be
tracked deliberately, in code, rather than trusted to the math alone.

This project's convention, from here forward: every point and vector object
carries a `type` field — `"point"` or `"vector"` — the exact tagging
pattern Lesson 6 already established for shapes, reused here for a second
purpose.

### Discarding

The scratch `cornerA`/`cornerB` example is discarded — the real project's
points and vectors, built in the next two units, are named for what they
actually represent.

### CS Lens

Distinguishing values that share a representation but not a meaning is
worth naming broadly — this exact point-vs-vector distinction is
standard in computational geometry and physics engines.

```
Also recognized in: physics engines distinguishing position from
velocity (same vector shape, different meaning), timestamps vs. durations
(a moment in time vs. a length of time, easy to conflate), affine
geometry's formal position/displacement distinction, GPS coordinates
(location) vs. a bearing-and-distance (displacement)
```

### SE Lens

The alternative not chosen: represent both as plain `{x, y}` objects with
no `type` field, relying on variable names alone (`startPoint`,
`moveVector`) to keep the distinction straight. That works exactly as long
as every name is chosen carefully and never passed to the wrong function.
The real cost: nothing stops a future version of this code — Arc 2's
transformation math, Arc 4's toolpath geometry — from passing a point where
a vector was expected, and getting a numerically valid, silently wrong
result, the same way `cornerA + cornerB` did above. A `type` tag doesn't
prevent that by itself (this lesson's functions don't check it yet — that's
future work, once this project's own conventions are established enough to
enforce), but it makes the mistake at least *visible* to a reader, and sets
up real type-checking once Arc 3 introduces TypeScript.

### Run It

Real output already shown above.

### Connecting

With the distinction named, the next two units build the two operations
that actually are meaningful — starting with combining two displacements.

---

## Concept Unit: Vector Addition

### The Problem

Two separate displacements — say, one toolpath move followed by another —
need to combine into a single, equivalent displacement: "go 50 right and
30 up, then go 20 right and 90 up" should be expressible as one combined
move.

### By Hand

```
u = (50, 30)
w = (20, 90)

u + w = (u.x + w.x, u.y + w.y)
      = (50 + 20, 30 + 90)
      = (70, 120)
```

Each axis adds independently — the x-displacements combine on their own,
and so do the y-displacements. Nothing about one axis affects the other.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** a new section, after `toMathY`
- **Dependencies:** none new

### The New Code

```js
function addVectors(a, b) {
  return { type: "vector", x: a.x + b.x, y: a.y + b.y };
}
```

### The Updated Project

```js
function toMathY(canvasY, canvasHeight) {
  return canvasHeight - canvasY;
}

function addVectors(a, b) {                              // ← new
  return { type: "vector", x: a.x + b.x, y: a.y + b.y };  // ← new
}                                                          // ← new
```

### Isolating the Concept

The hand-computed case, run for real:

```js
const u = { type: "vector", x: 50, y: 30 };
const w = { type: "vector", x: 20, y: 90 };
const sum = addVectors(u, w);
console.log("u + w = (" + u.x + "+" + w.x + ", " + u.y + "+" + w.y + ") =", JSON.stringify(sum));
```

Real output:

```
u + w = (50+20, 30+90) = {"type":"vector","x":70,"y":120}
```

This matches the hand calculation exactly — `(70, 120)`.

The other meaningful case from the first unit — `point + vector = point`,
translating a location by a displacement:

```js
const pointA = { type: "point", x: 100, y: 50 };
const v = { type: "vector", x: 200, y: 75 };
const translated = addVectors(pointA, v);
console.log("pointA + v = (" + pointA.x + "+" + v.x + ", " + pointA.y + "+" + v.y + ") =", JSON.stringify(translated));
```

Real output:

```
pointA + v = (100+200, 50+75) = {"type":"vector","x":300,"y":125}
```

What this proves: the same function correctly handles both cases — two
vectors combining into a vector, and a point moved by a vector — because
the underlying arithmetic really is identical for both; only the *meaning*
of the inputs and result differs, which is exactly the first unit's point.
(The result above prints `"type":"vector"` even though `pointA + v` is
conceptually a point — a real limitation of this simple version, named
honestly in the SE Lens below rather than hidden.)

### Discarding

The standalone `u`/`w` check is discarded; `pointA`/`v`, drawn on the real
canvas next, carry forward.

### Mechanical Walkthrough

- **`function addVectors(a, b) { ... }`** — (b) a concept reappearing —
  an ordinary function declaration, same shape as every prior function in
  this project.
- **`{ type: "vector", x: a.x + b.x, y: a.y + b.y }`** — (b) an object
  literal, reappearing; what's new is only using it to construct a
  *result*, computed from two inputs, rather than as a fixed literal value.
- **`a.x + b.x` / `a.y + b.y`** — (c) genuinely basic — the same
  subtraction-turned-addition arithmetic already used throughout this
  project.

### CS Lens

Not a new hard concept on its own — vector addition is the routine
component-wise operation; its broader significance (as the foundation for
every transformation in Arc 2) gets its full CS lens once matrices are
introduced there.

### SE Lens

The alternative not chosen: write two separate functions,
`translatePoint(point, vector)` and `combineVectors(v1, v2)`, instead of
one shared `addVectors`. That would correctly return a `"point"`-tagged
result from the first and a `"vector"`-tagged result from the second — a
real improvement this simple version doesn't have. The tradeoff, honestly:
one shared function is less code right now and makes the underlying
arithmetic identity between the two cases obvious, but it currently mislabels
`pointA + v`'s result as a `"vector"` rather than a `"point"`. This is
named debt, not an oversight — splitting the function is a reasonable
future refactor once this project's type conventions matter enough to
enforce (a natural candidate for Arc 3's TypeScript work).

### Run It

On the canvas, drawing the translation as a line from `pointA` to the
result — reusing the `"line"` shape type from Arc 0 exactly as it already
exists, no new rendering code needed:

```js
scene.push({ type: "line", start: pointA, end: translated });
draw(0);

const midMathX = (pointA.x + translated.x) / 2;
const midMathY = (pointA.y + translated.y) / 2;
console.log("pixel at the vector's midpoint:", Array.from(ctx.getImageData(Math.round(midMathX), Math.round(toCanvasY(midMathY, canvas.height)), 1, 1).data));
```

Real output:

```
pixel at the vector's midpoint: [ 0, 0, 0, 255 ]
```

A solid pixel exactly where the hand-computed midpoint predicts — the
vector addition genuinely drew where the math says it should.

### Connecting

Addition combines displacements, or moves a point by one — the next unit
covers the reverse question: given two points, what displacement connects
them?

---

## Concept Unit: Point Subtraction — Finding a Displacement

### The Problem

Toolpath and transformation work constantly needs the opposite of
addition: given two known locations, what displacement gets from one to
the other? This is the operation that turns two points into a usable
direction and distance.

### By Hand

```
A = (100, 50)
B = (300, 200)

B - A = (B.x - A.x, B.y - A.y)
      = (300 - 100, 200 - 50)
      = (200, 150)
```

The result, `(200, 150)`, means "from A, go 200 right and 150 up to reach
B" — a vector, not a point, even though it was computed from two points.

**Check it, by hand:** adding this result back to `A` should return exactly
`B`.

```
A + (B - A) = (100 + 200, 50 + 150) = (300, 200) = B  ✓
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** directly after `addVectors`
- **Dependencies:** `addVectors`, from the previous unit (used only for
  the round-trip check below, not by the function itself)

### The New Code

```js
function subtractPoints(a, b) {
  return { type: "vector", x: a.x - b.x, y: a.y - b.y };
}
```

### The Updated Project

```js
function addVectors(a, b) {
  return { type: "vector", x: a.x + b.x, y: a.y + b.y };
}

function subtractPoints(a, b) {                            // ← new
  return { type: "vector", x: a.x - b.x, y: a.y - b.y };    // ← new
}                                                            // ← new
```

### Isolating the Concept

```js
const pointA = { type: "point", x: 100, y: 50 };
const pointB = { type: "point", x: 300, y: 200 };

const displacement = subtractPoints(pointB, pointA);
console.log("B - A = (" + pointB.x + "-" + pointA.x + ", " + pointB.y + "-" + pointA.y + ") =", JSON.stringify(displacement));

const roundTrip = addVectors(pointA, displacement);
console.log("A + (B - A) =", JSON.stringify(roundTrip), " matches B:", roundTrip.x === pointB.x && roundTrip.y === pointB.y);
```

Real output:

```
B - A = (300-100, 200-50) = {"type":"vector","x":200,"y":150}
A + (B - A) = {"type":"vector","x":300,"y":200}  matches B: true
```

What this proves: `subtractPoints` is the genuine inverse of
`addVectors` for this case — going from `A` to `B` via the computed
displacement lands exactly back on `B`'s own coordinates, matching the
by-hand check above exactly.

### Discarding

Discarded — real project usage, drawn on canvas, follows immediately.

### Mechanical Walkthrough

- **`function subtractPoints(a, b) { ... }`** — (b) a concept reappearing
  — same function-declaration shape as `addVectors`.
- **`a.x - b.x` / `a.y - b.y`** — (c) genuinely basic — ordinary
  subtraction, already used throughout this project since `toCanvasY`.

### CS Lens

Not a new hard concept — the component-wise structure is identical to
addition; no separate lens needed.

### SE Lens

The alternative not chosen: skip a named `subtractPoints` function, and
write `{ x: b.x - a.x, y: b.y - a.y }` inline wherever a displacement is
needed. The real risk, specific to subtraction: argument order matters —
`B - A` and `A - B` point in exactly opposite directions, and an inline
expression makes it easy to swap them by accident without noticing, since
both produce a plausible-looking vector. A named function with a clear
name (`subtractPoints(from, to)` would arguably be even clearer than
`subtractPoints(a, b)` — worth revisiting as this project's API matures)
at least puts the order in one place to get right, once.

### Run It

On the canvas, drawing this exact displacement as a line from `A` to `B`:

```js
scene.push({ type: "line", start: pointA, end: pointB });
draw(0);
console.log("pixel at A:", Array.from(ctx.getImageData(pointA.x, Math.round(toCanvasY(pointA.y, canvas.height)), 1, 1).data));
console.log("pixel at B:", Array.from(ctx.getImageData(pointB.x, Math.round(toCanvasY(pointB.y, canvas.height)), 1, 1).data));
```

Real output:

```
pixel at A: [ 0, 0, 0, 255 ]
pixel at B: [ 0, 0, 0, 255 ]
```

### Connecting

Both directions — combining/translating with `addVectors`, and finding a
displacement with `subtractPoints` — are now real, hand-verified, and
drawn. Everything Arc 2's rotation and scaling math builds happens in terms
of exactly these two operations.

---

## Closing

### Connect the Pieces

One pair of values traced through the whole lesson: `pointA = (100, 50)`
and `pointB = (300, 200)`. `subtractPoints(pointB, pointA)` (Unit 3)
produces the displacement `(200, 150)` — proven, by hand and in code, to be
the exact vector that gets from one to the other. `addVectors(pointA,
displacement)` (Unit 2) proves that going back the other direction returns
`pointB` exactly. The distinction from Unit 1 is what makes this round trip
meaningful at all: `displacement` is tagged `"vector"`, not `"point"`,
because it represents *how far*, not *where*.

### What Breaks Without This

Confusing the two, deliberately, by adding two points as though the type
tag didn't matter:

```js
const wrongResult = addVectors(pointA, pointB);
console.log("pointA + pointB (treating a point like a displacement):", JSON.stringify(wrongResult));
```

Real output:

```
pointA + pointB (treating a point like a displacement): {"type":"vector","x":400,"y":250}
```

This runs without error, exactly like the first unit's `cornerA +
cornerB` example — and produces a coordinate, `(400, 250)`, that
corresponds to nothing meaningful in this project's geometry. The fix
isn't a code change here — it's the discipline established in Unit 1:
know, at every call site, whether a value is a location or a displacement,
before combining it with anything.

### Exercises

- By hand, compute `subtractPoints(pointA, pointB)` (arguments swapped from
  this lesson's example) and predict the sign of both components before
  running it. Confirm your prediction.
- Add a third point, `pointC`, anywhere on the canvas. By hand, compute the
  displacement from `pointB` to `pointC`, then verify it in code.
- Using `addVectors` and `subtractPoints` together, write the midpoint of
  `pointA` and `pointB` — the point exactly halfway between them — without
  simply averaging `x` and `y` directly (hint: find the displacement, then
  travel half of it).

### Definition of Done

- [ ] `addVectors` and `subtractPoints` exist in `script.js` and match
      their by-hand derivations exactly
- [ ] You can state, without looking, which of `point + point`,
      `point + vector`, `vector + vector`, and `point - point` are
      geometrically meaningful, and why the others aren't
- [ ] The round-trip check (`A + (B - A) === B`) passes for at least one
      pair of points you chose yourself, not just this lesson's example
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add vector addition and point subtraction, derived by hand first

  addVectors and subtractPoints are the two meaningful point/vector
  operations this project needs going forward. Verified against hand
  calculations, including a round-trip check (A + (B - A) === B), and
  demonstrated why adding two points computes but is not meaningful."
  ```
