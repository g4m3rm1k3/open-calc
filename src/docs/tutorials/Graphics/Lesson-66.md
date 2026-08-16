# Lesson 66: Sphere Geometry

**What you will build:** `classify_point_vs_sphere` and
`sphere_line_intersection` — the direct 3D extension of Lesson 30–32's
own 2D circle geometry, using the identical center-and-radius
representation and the identical quadratic-formula derivation, one
dimension higher. The transferable problem: Lesson 30's own
`circle_line_intersection` solves `|line_point + t · direction −
center|² = radius²` for `t` — an equation that never actually depended
on being in 2D specifically; it only used whichever dot product the
curriculum had on hand at the time. This lesson's own opening confirms
that reusing the *2D* dot product on a genuinely 3D line doesn't fail
loudly and consistently — it fails two different ways depending on the
input, one a real crash and one a silently wrong answer, both from the
identical formula.

**What you need to know first:** Lesson 30's own `(center, radius)`
representation and `classify_point_vs_circle`. Lesson 31's own
`circle_line_intersection` and its quadratic-formula derivation —
this lesson's own new code is that identical formula, rebuilt from
Lesson 63's 3D pieces. Lesson 63's `dot3`, `point_on_line_3d`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–65.

**Terms introduced in this lesson:**

None. A sphere's own representation and the intersection formula are
both direct dimensional extensions of Lesson 30–31's already-taught 2D
circle — the same judgment call this handoff has applied since Lesson
46.

**Objects and methods used:**

None new.

---

## Concept Unit: Does the 2D Circle Formula Already Fit?

### The Problem

Lesson 31's own `circle_line_intersection` never actually contained
anything 2D-specific in its own algebra — `a`, `b`, and `c` in its
quadratic formula are built entirely from dot products and
subtractions, both operations this curriculum now has genuine 3D
versions of. Before writing anything new, this unit asks the same
question Lessons 48, 55, and 62 have each already asked of their own
prior lessons' work: does the 2D version already work correctly if
simply handed 3D input?

### Project Change

- **Reference Source:** No reference counterpart — this unit tests
  existing project code (`circle_line_intersection`, Lesson 31) against
  a new input shape rather than adding new project code.
- **Files affected:** none — verification only.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `circle_line_intersection` (Lesson 31).

### The New Code

```python
circle_2d = ((0, 0), 5)
try:
    naive = circle_line_intersection((0, 0, -10), (0, 0, 1), circle_2d)
    print("z-only direction:", naive)
except ZeroDivisionError as e:
    print("z-only direction raised ZeroDivisionError:", e)
```

### Real Output

Running the print above:

```
z-only direction raised ZeroDivisionError: division by zero
```

A real crash — not the silent wrong-value pattern Lesson 46, 48, 55, and
62 each disclosed for their own 2D-to-3D reuse attempts. Lesson 31's own
`a = dot_product(line_direction, line_direction)` uses the 2D
`dot_product`, which reads only `line_direction`'s first two
components — both `0` for a direction pointing purely along `z`. That
makes `a` exactly `0`, and the quadratic formula's own `/ (2 * a)`
divides by it. Try a direction with real `x`/`y` components instead, to
see whether every case fails this loudly:

```python
try:
    naive2 = circle_line_intersection((-10, -10, -10), (1, 1, 1), circle_2d)
    print("(1,1,1) direction:", naive2)
except ZeroDivisionError as e:
    print("(1,1,1) direction raised ZeroDivisionError:", e)
```

Real output:

```
(1,1,1) direction: ((-3.5355339059327378, -3.5355339059327378), (3.5355339059327378, 3.5355339059327378))
```

No crash this time — a plausible-looking pair of 2-tuples instead,
missing the `z` component entirely and, worse, computed against the
wrong implicit shape: the 2D `dot_product` only ever measured distance
within the `x`/`y` plane, so this result solves for where a line
crosses a *circle* of radius `5` in that plane, not where it actually
crosses the genuine 3D sphere. This is the exact "sometimes a crash,
sometimes a silently wrong answer, depending on the specific input"
pattern this curriculum has now shown is possible from reusing
lower-dimensional code on higher-dimensional input without checking
first.

### Connecting Sentence

The 2D formula's own algebra is sound; only its choice of dot product is
wrong for 3D input — rebuilding it from genuinely 3D pieces is the
entire fix needed.

---

## Concept Unit: `classify_point_vs_sphere` and `sphere_line_intersection`

### The Problem

A sphere needs the same two operations Lesson 30–31 already built for a
circle: classify where a point sits relative to it, and find where a
line crosses it — both using genuinely 3D distance and dot products this
time.

### Project Change

- **Reference Source:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`, Lesson
  30's `classify_point_vs_circle` and Lesson 31's
  `circle_line_intersection` — both functions reused verbatim in shape,
  rebuilt from Lesson 63's 3D primitives.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 65's `ray_triangle_intersection`).
- **Change type:** add.
- **Location:** new section, `# ── L66: sphere geometry ──`.
- **Dependencies:** `norm_3d`, `subtract_points_3d`, `dot3`,
  `point_on_line_3d` (Lesson 63), `nearly_equal` (Lesson 17).

### The New Code

```python
def classify_point_vs_sphere(point, sphere, tolerance):
    center, radius = sphere
    distance = norm_3d(subtract_points_3d(point, center))
    if nearly_equal(distance, radius, tolerance):
        return "on"
    elif distance < radius:
        return "inside"
    else:
        return "outside"


def sphere_line_intersection(line_point, line_direction, sphere):
    center, radius = sphere
    d = subtract_points_3d(line_point, center)
    a = dot3(line_direction, line_direction)
    b = 2 * dot3(d, line_direction)
    c = dot3(d, d) - radius * radius
    discriminant = b * b - 4 * a * c
    if nearly_equal(discriminant, 0, 0.0000001):
        t = -b / (2 * a)
        return (point_on_line_3d(line_point, line_direction, t),)
    elif discriminant < 0:
        return "no intersection"
    else:
        sqrt_discriminant = math.sqrt(discriminant)
        t1 = (-b - sqrt_discriminant) / (2 * a)
        t2 = (-b + sqrt_discriminant) / (2 * a)
        return (
            point_on_line_3d(line_point, line_direction, t1),
            point_on_line_3d(line_point, line_direction, t2),
        )
```

### The Updated Project

Both brand-new, freestanding functions, per the schema's own stated
exception. `geometry_verified_library.py` now carries
`classify_point_vs_sphere` and `sphere_line_intersection` in its new
"L66: sphere geometry" section.

### Mechanical Walkthrough

Every line in both functions is either **(b) hard concept
reappearing** — `norm_3d`/`subtract_points_3d` (Lesson 63),
`dot3`/`point_on_line_3d` (Lesson 63), `nearly_equal` (Lesson 17), and
the entire quadratic-formula structure itself, restated by name as the
same derivation Lesson 31 already gave full treatment — or **(c)
already basic** (plain arithmetic, tuple unpacking, `if`/`elif`/`else`).
No line in either function introduces a genuinely new construct; this
is a Repetition-Rule dimensional extension in the exact shape Lesson 46
already established, just applied here to Lesson 30–31's own circle
work instead of Lesson 1–3's own point/vector work.

### Real Verification

```python
sphere = ((0, 0, 0), 5)
print(classify_point_vs_sphere((3, 4, 0), sphere, 1e-9))
print(classify_point_vs_sphere((0, 0, 0), sphere, 1e-9))
print(classify_point_vs_sphere((10, 0, 0), sphere, 1e-9))

result = sphere_line_intersection((0, 0, -10), (0, 0, 1), sphere)
print(result)
tangent = sphere_line_intersection((5, -10, 0), (0, 1, 0), sphere)
print(tangent)
miss = sphere_line_intersection((10, -10, 0), (0, 1, 0), sphere)
print(miss)
```

Real output:

```
on
inside
outside
((0.0, 0.0, -5.0), (0.0, 0.0, 5.0))
((5.0, 0.0, 0.0),)
no intersection
```

`(3, 4, 0)` — distance exactly `5` from the origin, matching Lesson 9's
own `3-4-5` triangle one more time — correctly classifies as `"on"`.
A line straight through the center hits at exactly `±radius` along its
own axis. A tangent line returns exactly one point, and a line passing
well outside the sphere entirely correctly reports no intersection at
all — the same three cases Lesson 31's own circle version already
proved, now genuinely in three dimensions.

Confirm a line that isn't axis-aligned at all still lands exactly on
the sphere's own surface, not merely close to it:

```python
off_axis = sphere_line_intersection((-10, -10, -10), (1, 1, 1), sphere)
print(off_axis)
for pt in off_axis:
    print("  distance from center:", norm_3d(pt))
```

Real output:

```
((-2.88675134594813, -2.88675134594813, -2.88675134594813), (2.886751345948129, 2.886751345948129, 2.886751345948129))
  distance from center: 5.000000000000002
  distance from center: 5.000000000000001
```

Both returned points sit at distance `≈5` from the center — matching
`radius` exactly, within floating-point noise — confirming the formula
holds for a genuinely diagonal line, not just the convenient axis-
aligned cases shown first.

### Connecting Sentence

The 3D formula gives correct answers across tangent, miss, straight-
through, and off-axis cases — the closing below compares its own
off-axis result directly against what the 2D version's own naive reuse
produced for the identical line.

---

## Closing

### Connect the Pieces

Trace the exact same diagonal line — from `(-10, -10, -10)` in
direction `(1, 1, 1)` — through both this lesson's own correct
`sphere_line_intersection` and this lesson's own opening naive reuse of
the 2D formula, side by side:

```python
correct = sphere_line_intersection((-10, -10, -10), (1, 1, 1), sphere)
naive = circle_line_intersection((-10, -10, -10), (1, 1, 1), circle_2d)
print("correct 3D result:", correct)
print("naive 2D-reuse result:", naive)
```

Real output:

```
correct 3D result: ((-2.88675134594813, -2.88675134594813, -2.88675134594813), (2.886751345948129, 2.886751345948129, 2.886751345948129))
naive 2D-reuse result: ((-3.5355339059327378, -3.5355339059327378), (3.5355339059327378, 3.5355339059327378))
```

Not just missing a `z` component — the `x`/`y` values themselves
disagree (`±2.887` against `±3.536`), because the naive version solved
an entirely different equation: where does this line cross a *circle*
of radius `5` in the `x`/`y` plane, not where does it cross the genuine
3D sphere. Rebuilding the formula from Lesson 63's own 3D dot product,
this lesson's own real fix, is what closes that gap completely.

### What Breaks Without This

This lesson's own opening unit already ran the real failure directly:
the identical formula, reusing the 2D dot product on 3D input, crashes
with a real `ZeroDivisionError` for one direction and returns a
plausible-looking, numerically wrong pair of 2-tuples for another —
both from the exact same underlying mistake, diverging only because of
which specific numbers happened to be involved. Repeating that test here
would be redundant with the opening proof already given; the honest
closing observation is that neither failure mode announces itself as
"this is 2D code getting 3D input" — a `ZeroDivisionError`'s own
traceback points at the division, not at the real root cause, and the
silently wrong `(1, 1, 1)`-direction case gives no error signal at all.
Rebuilding from genuinely 3D primitives, as this lesson's own real code
does, is the only fix that removes the mistake at its source rather than
guarding against one specific symptom of it.

### Exercises

- Confirm `sphere_line_intersection` returns exactly one point (not
  zero, not two) for a line tangent to the sphere at a point other than
  this lesson's own `(5, 0, 0)` example.
- Using `classify_point_vs_sphere`, confirm both intersection points
  from this lesson's own off-axis example classify as `"on"` the
  sphere, not merely close to it.
- Build a sphere with a center other than the origin, and confirm
  `sphere_line_intersection` still correctly finds both crossing points
  for a line you choose that genuinely passes through it.

### Definition of Done

- [ ] `classify_point_vs_sphere` and `sphere_line_intersection` both
      exist in `geometry_verified_library.py`.
- [ ] The 2D-reuse failure was actually run and shown to fail two
      different ways (a real crash, and a real silently-wrong value)
      depending on the specific input, not just asserted as risky in
      general.
- [ ] All of tangent, miss, straight-through, and off-axis cases were
      verified with real numbers, not just the axis-aligned convenient
      ones.
- [ ] The off-axis result was independently confirmed to sit at exactly
      `radius` distance from the center, not merely trusted from the
      formula's own derivation.
- [ ] Commit with a message stating *why*: sphere geometry now exists as
      a direct, verified 3D extension of Lesson 30–31's own circle work,
      with the specific 2D-reuse pitfall this lesson opened with
      resolved at its actual source.
