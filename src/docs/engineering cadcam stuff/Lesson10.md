# Lesson 10: Left, Right, or Exactly On the Line

**What you will build:** a 2D cross product function, then two real uses of
it — telling which side of a line a point falls on, and finding the area
of the parallelogram two vectors span. The transferable problem: this
project constantly needs to answer "is this point to the left or right of
this edge?" — for toolpath offsetting (Arc 4), for polygon winding order
(also Arc 4), for collision and boundary checks generally — and the 2D
cross product answers that question with a single sign check, no trig
required.

**What you need to know first:** Lesson 9 (Arc 1) — `dot`, contrasted
throughout this lesson with a genuinely different operation that looks
superficially similar but answers a different question.

---

## Concept Unit: The Cross Product Formula

### The Problem

The dot product (Lesson 9) answers "how aligned are these two vectors,"
using their similarity. Nothing so far answers a different, equally common
question: "if I stand on the first vector and look toward the second, am I
turning left or right?" — an orientation question, not a similarity one.

### By Hand

In 2D, the cross product of two vectors is a single number (not a vector,
despite the name it borrows from 3D):

```
a = (1, 0)
b = (0, 1)

a × b = (a.x × b.y) − (a.y × b.x)
      = (1 × 1) − (0 × 0)
      = 1 − 0
      = 1
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `angleBetween`
- **Dependencies:** none new

### The New Code

```js
function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}
```

### The Updated Project

```js
function angleBetween(a, b) {
  const cosTheta = dot(a, b) / (magnitude(a) * magnitude(b));
  return Math.acos(cosTheta);
}

function cross(a, b) {              // ← new
  return a.x * b.y - a.y * b.x;     // ← new
}                                    // ← new
```

### Isolating the Concept

```js
const a = { x: 1, y: 0 };
const b = { x: 0, y: 1 };
console.log("a x b = (" + a.x + "*" + b.y + ") - (" + a.y + "*" + b.x + ") = " + (a.x*b.y) + " - " + (a.y*b.x) + " = " + cross(a, b));
```

Real output:

```
a x b = (1*1) - (0*0) = 1 - 0 = 1
```

Matches the by-hand result. Note this uses the exact same two vectors as
Lesson 9's first dot-product example, where `dot(a, b)` came out to `0` —
same inputs, genuinely different question, genuinely different answer.

### Discarding

Discarded — the real function is `cross`, shown above.

### Mechanical Walkthrough

- **`function cross(a, b) { ... }`** — (b) a concept reappearing —
  ordinary function declaration.
- **`a.x * b.y - a.y * b.x`** — (c) genuinely basic — the same
  multiplication and subtraction operators already established; the
  specific combination (cross-multiply, then subtract) is what's new, not
  the arithmetic itself.

### CS Lens

Not yet expanded — this unit is the raw formula; its two real meanings
(orientation, area) each get their own full CS lens in the next two units.

### SE Lens

Not applicable — like the dot product, this is the standard, universal
definition of the 2D cross product; no meaningful implementation
alternative exists.

### Run It

Real output already shown above.

### Connecting

One number now exists — the next two units are what it actually means,
geometrically.

---

## Concept Unit: The Sign — Which Side of a Line

### The Problem

Given a directed edge (from point `A` to point `B`) and a third point `C`,
a very common question is: does `C` sit to the left of that edge, to the
right, or exactly on it? This shows up constantly — deciding a polygon's
winding direction, checking which side of a toolpath boundary a point
falls on, sorting points around a convex hull.

### By Hand

Take the edge as a vector (`B - A`), and the vector from `A` to the point
in question (`C - A`). Their cross product's *sign* answers the question:

```
A = (0, 0), B = (10, 0)     — edge points along +x
edge = B - A = (10, 0)

C_left  = (5, 3)    toC = C_left - A = (5, 3)
C_right = (5, -3)   toC = C_right - A = (5, -3)

side(C_left)  = edge × toC = (10×3) - (0×5) = 30 - 0 = 30    — positive
side(C_right) = edge × toC = (10×-3) - (0×5) = -30 - 0 = -30  — negative
```

Positive means `C_left` is counterclockwise from the edge — by convention,
this is called the **left** side. Negative means clockwise — the **right**
side. Exactly `0` means `C` sits precisely on the line the edge defines.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none new — a usage pattern of `cross`, combined with
  `subtractPoints` from Lesson 7.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** `cross`, `subtractPoints`

### Isolating the Concept

The by-hand example, run for real, including the exactly-on-the-line case:

```js
const A = { x: 0, y: 0 };
const B = { x: 10, y: 0 };
const edge = subtractPoints(B, A);

function side(edge, from, point) {
  const toPoint = subtractPoints(point, from);
  return cross(edge, toPoint);
}

const C_left = { x: 5, y: 3 };
const C_right = { x: 5, y: -3 };
const C_on = { x: 5, y: 0 };

console.log("side(C_left)  =", side(edge, A, C_left), "-> positive: left of the edge");
console.log("side(C_right) =", side(edge, A, C_right), "-> negative: right of the edge");
console.log("side(C_on)    =", side(edge, A, C_on), "-> zero: exactly on the edge");
```

Real output:

```
side(C_left)  = 30 -> positive: left of the edge
side(C_right) = -30 -> negative: right of the edge
side(C_on)    = 0 -> zero: exactly on the edge
```

What this proves: three genuinely different geometric relationships —
above, below, and exactly on the line through `A` and `B` — are each
correctly distinguished by nothing more than the sign of one cross product,
matching the by-hand prediction exactly, including the boundary case.

### Discarding

Discarded — `A`, `B`, `C_left`/`C_right`/`C_on` are illustrative; real
toolpath edges and boundary points appear starting in Arc 4.

### CS Lens

This orientation test is one of the most-reused primitives in
computational geometry.

```
Also recognized in: the gift-wrapping/convex-hull algorithm (deciding
which point turns "outward"), polygon winding-order determination
(clockwise vs. counterclockwise), ray-casting point-in-polygon tests,
line-segment intersection tests (checking whether two segments' endpoints
straddle each other)
```

### SE Lens

The alternative not chosen: compute the actual angle (Lesson 9's
`angleBetween`) and check whether it's a "left turn" via trigonometric
reasoning about the angle's value. The real cost: `angleBetween` only ever
returns a value between `0` and `180°` — it has no way to distinguish
"30° to the left" from "30° to the right," because `acos` can't recover
that information; the sign got lost the moment `cosTheta` was computed.
The cross product's sign carries exactly the directional information the
dot-product-based angle calculation structurally cannot.

### Run It

Real output already shown above.

### Connecting

The sign answers "which side" — the final unit covers what the cross
product's actual *size* means, independent of its sign.

---

## Concept Unit: The Magnitude — Signed Area

### The Problem

Beyond its sign, the cross product's raw numeric value itself means
something specific and useful — not just "how far from zero," but a real,
measurable geometric quantity.

### By Hand

Two vectors, placed tail-to-tail, span a parallelogram — picture the
shape traced by sliding one vector along the other. The cross product's
value is exactly that parallelogram's area (with the sign indicating
orientation, as the previous unit covered).

The cleanest possible check: two *perpendicular* vectors span a plain
rectangle, whose area is trivial to verify independently.

```
u = (4, 0), w = (0, 3)     — perpendicular, forming a 4×3 rectangle

u × w = (4×3) - (0×0) = 12 - 0 = 12

Rectangle area = width × height = 4 × 3 = 12   ✓ matches exactly
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none new — this unit only interprets `cross`'s
  existing output; no new function is needed.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** `cross`

### Isolating the Concept

```js
const u = { x: 4, y: 0 };
const w = { x: 0, y: 3 };
console.log("u x w =", cross(u, w), "  rectangle area (4*3) =", 4 * 3);
```

Real output:

```
u x w = 12   rectangle area (4*3) = 12
```

What this proves: `cross`'s numeric output, for this perpendicular case,
is not merely proportional to area — it *is* the area exactly, confirmed
against a rectangle's area computed completely independently, with no
geometry formula shared between the two calculations.

### Discarding

Discarded — `u`/`w` here are chosen specifically because their
perpendicularity makes the area trivial to verify independently; real
project usage doesn't need this restriction.

### Mechanical Walkthrough

Nothing new mechanically in this unit — it's a fresh interpretation of the
same `cross` function walked through in the first unit of this lesson.

### CS Lens

Using a cross product's magnitude as a signed area is genuinely
load-bearing for later arcs.

```
Also recognized in: the shoelace formula for polygon area (literally a
sum of cross products around a boundary — directly relevant to Arc 4's
pocketing area calculations), triangle-area formulas in mesh processing
(Arc 7's solid modeling), physics engines computing torque (a 3D cross
product's magnitude relates to rotational force the same way)
```

### SE Lens

The alternative not chosen: compute a parallelogram's or triangle's area
using a dedicated geometric formula (base × height, or Heron's formula for
a triangle from side lengths) instead of recognizing it's already sitting
inside the cross product this project already has. The real benefit of
using `cross` directly: it's one function, already written, already
tested against the by-hand cases above — no separate area-specific code
path to maintain.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

`cross` now has two proven, distinct meanings — orientation (its sign) and
area (its magnitude) — both derived from the exact same single function,
which is the entire reason it's such a heavily reused primitive.

---

## Closing

### Connect the Pieces

One triple of points traced through this lesson: `A = (0,0)`, `B = (10,0)`,
`C = (5,3)`. `subtractPoints` (Lesson 7) turns `B` and `C` into vectors
relative to `A`. `cross(edge, toC)` (Unit 1) computes `30` for this case.
Its **sign**, positive, says `C` is to the left of the `A→B` edge (Unit 2).
Its **magnitude**, `30`, is the exact area of the parallelogram those two
vectors span (Unit 3) — the same single number answering two completely
different, both genuinely useful, geometric questions.

### What Breaks Without This

Confusing `cross` for `dot`, or vice versa — a realistic mistake, since
both take two vectors and both are single lines of similar-looking
arithmetic:

```js
const A = { x: 0, y: 0 };
const B = { x: 10, y: 0 };
const edge = subtractPoints(B, A);
const C = { x: 5, y: 3 };
const toC = subtractPoints(C, A);

console.log("cross(edge, toC) - correct choice for 'which side':", cross(edge, toC));
console.log("dot(edge, toC) - answers a DIFFERENT question (alignment, not side):", dot(edge, toC));
```

Real output:

```
cross(edge, toC) - correct choice for 'which side': 30
dot(edge, toC) - answers a DIFFERENT question (alignment, not side): 50
```

Both calls run without error, and both return plausible-looking numbers —
`dot`'s `50` doesn't crash or warn that it's the wrong tool for an
orientation check; it just silently answers a question nobody asked. This
is precisely why both operations were introduced with worked, verified
by-hand examples: the two functions are easy to reach for interchangeably
by mistake, and only one of them answers "which side."

### Exercises

- By hand, compute `cross((0,1), (1,0))` and predict its sign before
  running it — note this is the *reverse* argument order from this
  lesson's first example; confirm the sign flips.
- Using three points of your own choosing, verify by hand which side of
  the edge the third point falls on, then confirm with `cross` and
  `subtractPoints`.
- Two vectors `(6, 0)` and `(2, 4)` are *not* perpendicular. Compute
  `cross` between them, then separately look up (or derive) the general
  parallelogram-area formula and confirm they agree, even for this
  non-rectangular case.

### Definition of Done

- [ ] `cross` exists in `script.js` and matches its by-hand derivation
      exactly
- [ ] The three-point "which side" check (left/right/on-the-line) all
      produce the correct sign for a case you construct yourself
- [ ] You can explain, without looking, the difference between what `dot`
      and `cross` each answer, given the same two input vectors
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add 2D cross product, derived by hand first

  cross() returns a signed scalar whose sign indicates which side of a
  directed edge a point falls on, and whose magnitude is the exact area
  of the parallelogram the two input vectors span. Verified against hand
  calculations, a rectangle-area sanity check, and a real orientation
  test using three points."
  ```
