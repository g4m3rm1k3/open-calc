# Lesson 13: Affine Transformations

**What you will build:** Proof that Lesson 12's single `transform_to_global`
function already performs translation, rotation, and scaling — three
transformations that felt like different ideas across Lessons 4 through
6 — just by changing which origin and basis vectors get passed in. Then
you'll build the one transformation type this curriculum hasn't shown yet:
shear, which tilts one axis relative to the other without rotating or
scaling either. The transferable problem: "translation," "rotation," and
"scaling" have been treated, since Lesson 4, as though they were three
separate operations needing three separate ideas. They aren't. This lesson
names the one family they all belong to.

**What you need to know first:** Lesson 12's `transform_to_global`, Lesson
6's basis vectors, and Lesson 11's orientation test.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–12.

**Terms introduced in this lesson:**

- **Affine transformation** — any transformation built from a linear
  combination of basis vectors plus an origin shift — exactly the shape of
  Lesson 12's `transform_to_global`. Why: this is the formal name for the
  entire family of transformations this curriculum has been building,
  piece by piece, since Lesson 4 — translation, rotation, scaling, and this
  lesson's shear are not four unrelated ideas; they're four different
  inputs to the exact same underlying operation.
- **Shear** — an affine transformation that tilts one basis vector relative
  to another, without rotating or changing either one's length. Why: this
  is the one member of the "translation, rotation, scaling, shear" family
  this curriculum hasn't built yet, and it behaves differently enough from
  the other three to be worth its own concrete example.

**Objects and methods used:**

None new. This lesson reuses Lesson 12's `transform_to_global` and Lesson
9's `norm` exactly as written.

---

## Concept Unit: Four Names for One Operation

### The Problem

Lesson 4 called its origin-only conversion a coordinate conversion. Lesson
6 called its basis-only conversion `from_components`. Neither lesson ever
said the word "translation" or "rotation" — but that's exactly what each
one was building, without naming it. Before adding anything new, name what
`transform_to_global` has already been doing since Lesson 12, using the
vocabulary the rest of this field actually uses.

*A note on method:* this unit's content is entirely a matter of naming and
recognizing what Lesson 12's function already does under different
inputs — no new Python construct, and no throwaway syntax lab, is needed
here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–12.
- **Files affected:** `geometry_lesson_13.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


def transform_to_global(point_in_local, origin_in_global, x_axis_in_global, y_axis_in_global):
    offset = from_components(point_in_local[0], point_in_local[1], x_axis_in_global, y_axis_in_global)
    return add_vector_to_point(origin_in_global, offset)


feature = (3, 4)

translated = transform_to_global(feature, (10, 5), (1, 0), (0, 1))
rotated = transform_to_global(feature, (0, 0), (0, 1), (-1, 0))
scaled = transform_to_global(feature, (0, 0), (2, 0), (0, 2))

print(translated)
print(rotated)
print(scaled)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `def add_vector_to_point(...)`, `def scale_vector(...)`, `def
  from_components(...)`, `def transform_to_global(...)` — Lessons 2, 3, 6,
  and 12's own functions, retyped unchanged. No re-explanation owed for
  their mechanics, per the Repetition Rule.
- `feature = (3, 4)` — one point, reused across all three calls below,
  specifically so the same input's three different results can be compared
  directly.
- `translated = transform_to_global(feature, (10, 5), (1, 0), (0, 1))` —
  the standard basis (no rotation or scaling at all) with a nonzero origin.
  **This is a pure translation** — a slide, with nothing about the point's
  shape or orientation changed, only its position.
- `rotated = transform_to_global(feature, (0, 0), (0, 1), (-1, 0))` —
  Lesson 6's tilted basis (a 90-degree turn, still unit length, still
  perpendicular) with a zero origin. **This is a pure rotation** — a turn
  around the origin, with nothing about the point's distance from the
  origin changed, only its direction.
- `scaled = transform_to_global(feature, (0, 0), (2, 0), (0, 2))` — basis
  vectors pointing the same directions as standard, but twice as long,
  with a zero origin. **This is a pure scaling** — a stretch, with nothing
  about the point's direction from the origin changed, only its distance.
- The three `print(...)` calls — already basic, producing `(13, 9)`, `(-4,
  3)`, and `(6, 8)` — three visibly different results, from the exact same
  starting point and the exact same function, differing only in which
  origin and basis vectors were passed in.

### CS Lens

Recognizing that translation, rotation, and scaling are the same
underlying operation with different parameters, rather than three separate
algorithms, is the core insight of the **affine transformation** — a
single mathematical family covering an enormous range of geometric
behavior.

```
Also recognized in: CSS and SVG transforms (translate(), rotate(), and
scale() are all implemented, underneath the browser's own rendering
engine, as the exact same kind of combined matrix this lesson's function
represents informally), image editing software (moving, rotating, and
resizing a layer are all one "transform" tool internally, not three
separate tools), and 3D engines (an object's position, rotation, and
scale in a scene are stored and applied together as one transform, not
three independent operations)
```

### SE Lens

The design principle is **recognizing a shared abstraction across
features that were built separately**, rather than maintaining three
separate, differently-shaped functions for translation, rotation, and
scaling. The alternative not chosen: keep Lesson 4's origin-only
conversion and a hypothetical separate `rotate_point` and `scale_point`
function as three unrelated tools, each with its own logic to test and
maintain.

That alternative isn't unreasonable on its own — three small, focused
functions can each be simpler to read in isolation than one general
`transform_to_global` with four parameters. The real cost it pays: three
separate implementations mean three separate places a bug could hide, and
three separate places a future improvement — better numerical handling,
say — would need to be applied by hand. This curriculum's actual path
— building the general case in Lesson 12, then recognizing translation,
rotation, and scaling as special cases of it here — means exactly one
implementation to trust, tested three different ways.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_13.py`.
Nothing new here.

### Run It

```
(13, 9)
(-4, 3)
(6, 8)
```

Verified by actually running the file above.

### Connection

Three of the four names in this lesson's title — translation, rotation,
scaling — turned out to be nothing more than different inputs to a
function this curriculum already built. The fourth, shear, hasn't
appeared at all yet.

---

## Concept Unit: Shear — The One New Transformation

### The Problem

Every basis vector this curriculum has used so far has come from either a
rotation (Lesson 6's tilted basis, still perpendicular, still unit length)
or a uniform stretch (this lesson's `scaled` example, still perpendicular,
just longer). Nothing so far has tilted *one* axis relative to the other
without touching both equally — the transformation that turns a square
into a slanted parallelogram while leaving its base edge exactly where it
was.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_13.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(scaled)` line added in Concept
  Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


shear_x_axis = (1, 0)
shear_y_axis = (1, 1)

sheared = transform_to_global(feature, (0, 0), shear_x_axis, shear_y_axis)
print(sheared)
print(cross_product(shear_x_axis, shear_y_axis))
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


def transform_to_global(point_in_local, origin_in_global, x_axis_in_global, y_axis_in_global):
    offset = from_components(point_in_local[0], point_in_local[1], x_axis_in_global, y_axis_in_global)
    return add_vector_to_point(origin_in_global, offset)


feature = (3, 4)

translated = transform_to_global(feature, (10, 5), (1, 0), (0, 1))
rotated = transform_to_global(feature, (0, 0), (0, 1), (-1, 0))
scaled = transform_to_global(feature, (0, 0), (2, 0), (0, 2))

print(translated)
print(rotated)
print(scaled)


def cross_product(a, b):                                            # ← new
    return a[0] * b[1] - a[1] * b[0]                                 # ← new


shear_x_axis = (1, 0)                                                 # ← new
shear_y_axis = (1, 1)                                                 # ← new

sheared = transform_to_global(feature, (0, 0), shear_x_axis, shear_y_axis)  # ← new
print(sheared)                                                        # ← new
print(cross_product(shear_x_axis, shear_y_axis))                      # ← new
```

The file as a whole now demonstrates all four named affine transformations
— translation, rotation, scaling, and shear — as four different calls to
the exact same `transform_to_global` function.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def cross_product(a, b): ...` — Lesson 8's own function, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `shear_x_axis = (1, 0)` — the standard x-axis, completely unchanged.
- `shear_y_axis = (1, 1)` — this is the new idea: the y-axis, tilted to
  also point partway in the x-direction, without changing its length
  (`math.sqrt(1*1 + 1*1)` is not `1`, so this particular shear also happens
  to change the y-axis's length slightly — a shear doesn't have to
  preserve unit length, only avoid a pure rotation or pure scaling).
- `sheared = transform_to_global(feature, (0, 0), shear_x_axis,
  shear_y_axis)` — the same function, called with this tilted basis,
  producing `(7, 4)` — the x-coordinate shifted by an amount proportional
  to the original y-coordinate, exactly what "shear" describes: a slant
  that grows the further a point sits from the base axis.
- `print(cross_product(shear_x_axis, shear_y_axis))` — `1*1 - 0*1`
  evaluates to `1`, positive. **This shear preserves orientation** —
  Lesson 11's handedness test still passes, even though the basis is
  neither a pure rotation nor a pure scaling of the standard one.

### CS Lens

A shear preserving orientation (Lesson 11's cross-product test still comes
back positive) while still distorting shape is proof that **orientation
and shape are independent properties** — a transformation can leave one
untouched while changing the other completely.

```
Also recognized in: typography (italic text is, geometrically, exactly a
shear applied to upright letterforms — the baseline stays fixed while the
tops of the letters lean over), geology (shear stress in materials
science describes exactly this kind of sliding deformation, layer past
layer, without rotation or volume change), and computer vision (shear is
one of the standard distortions image-alignment algorithms have to
account for when matching two photos of the same scene taken from
different angles)
```

### SE Lens

The design principle, again, is that `transform_to_global` **never had to
change** to support shear — only the basis vectors passed into it did.
The alternative not chosen: write a dedicated `shear_point` function,
separate from `transform_to_global`, the way an earlier design might have
kept translation, rotation, and scaling as three separate functions.

The real proof of this lesson's whole point is that shear needed exactly
zero new code — only two new tuples, `shear_x_axis` and `shear_y_axis`,
handed to a function that already existed. Every future transformation
this curriculum will ever build that fits the affine shape — any
combination of origin shift and basis change — gets this same benefit for
free, without a single new function.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_13.py`. Nothing
new here.

### Run It

```
(13, 9)
(-4, 3)
(6, 8)
(7, 4)
1
```

Verified by actually running the updated file above.

### Connection

All four named affine transformations — translation, rotation, scaling,
shear — turned out to be nothing more than different basis vectors and
origins handed to one function. Lesson 14, Homogeneous Coordinates,
addresses a real limitation this lesson's own code quietly has: origin and
basis are still two separate arguments here, computed with two separate
operations, rather than one unified mathematical object.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `feature = (3, 4)` — one point, run through four different affine
   transformations.
2. `transform_to_global(feature, (10, 5), (1, 0), (0, 1))`: the standard
   basis contributes `(3, 4)` unchanged (from `from_components`), and
   adding the origin `(10, 5)` gives `(13, 9)` — pure translation.
3. `transform_to_global(feature, (0, 0), (0, 1), (-1, 0))`: the tilted
   basis contributes `(-4, 3)`, and adding the zero origin changes
   nothing, giving `(-4, 3)` — pure rotation.
4. `transform_to_global(feature, (0, 0), (2, 0), (0, 2))`: the doubled
   basis contributes `(6, 8)` — each component of `feature` scaled by `2`
   — and again the zero origin changes nothing, giving `(6, 8)` — pure
   scaling.
5. `transform_to_global(feature, (0, 0), (1, 0), (1, 1))`: the sheared
   basis contributes `3*(1, 0) + 4*(1, 1)`, which is `(3, 0) + (4, 4)`,
   which is `(7, 4)` — shear.
6. All four results — `(13, 9)`, `(-4, 3)`, `(6, 8)`, `(7, 4)` — came from
   the identical starting point and the identical function, differing only
   in which four numbers were passed in as the origin and basis.

## What Breaks Without This

Lesson 5 proved that translation preserves the vector — and therefore the
distance — between two points. It would be a natural, and wrong,
assumption that *every* affine transformation shares that property. Check
it against this lesson's shear, using the one point it fixes in place —
the origin itself, which any transformation with a zero origin leaves
exactly where it was:

```python
import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


feature = (3, 4)
sheared_feature = (7, 4)

print(norm(feature))
print(norm(sheared_feature))
```

```
5.0
8.06225774829855
```

Verified by actually running this. `feature`'s distance from the origin
was `5.0`. After shearing, its distance from that same, unmoved origin
became `8.06225774829855` — not preserved at all. This isn't a bug in
`transform_to_global`; shear is *supposed* to distort distances, the same
way scaling is. The real danger is carrying Lesson 5's translation-
invariance proof over to every transformation by habit: only translation
and rotation preserve distances between points exactly; scaling and shear
both distort them on purpose, and code that assumes otherwise — comparing
pre- and post-transform distances as if they must match — would be wrong
the moment a scale or shear enters the picture.

## Exercises

1. Build a basis for a shear in the *other* direction — tilt `x_axis`
   relative to `y_axis` instead of `y_axis` relative to `x_axis`. Apply it
   to `feature` and compare the result to this lesson's own shear.
2. Predict, then verify, whether a scaling transformation (like this
   lesson's `scaled` example) preserves orientation, using Lesson 11's
   `cross_product` test on the scaled basis vectors, the same way this
   lesson checked the shear.
3. Using `norm`, confirm that rotation — unlike shear or scaling — really
   does preserve a point's distance from the origin, by comparing
   `norm(feature)` to `norm(rotated)`.

## Definition of Done

- [ ] `geometry_lesson_13.py` exists and runs with no errors via
      `python geometry_lesson_13.py`.
- [ ] Running it prints `(13, 9)`, `(-4, 3)`, `(6, 8)`, `(7, 4)`, then `1`
      — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, which basis and origin
      choices produce a pure translation, a pure rotation, and a pure
      scaling, using `transform_to_global`.
- [ ] You can explain why shear preserves orientation but not distance,
      using this lesson's own verified numbers.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Recognize translation, rotation, scaling, and shear as one affine family, not four separate ideas"`,
      not `git commit -m "add shear example"`.

Next: Lesson 14 — Homogeneous Coordinates, where origin and basis stop
being two separate arguments passed around by hand and become one unified
mathematical object.
