# Lesson 34: Polygon Orientation

**What you will build:** `polygon_signed_area`, the **shoelace formula**
— summing `cross_product` between every consecutive pair of vertices,
using Lesson 33's own `get_edge` and accumulator loop unchanged — and
`polygon_orientation`, reading that sum's sign to report whether an
entire polygon winds counterclockwise or clockwise. The transferable
problem: Lesson 26 built `orientation` for exactly three points. A real
polygon has any number of vertices, and nothing before this lesson could
say which way the *whole shape* winds — a question that matters
directly: CAM software depends on knowing a pocket boundary's winding
direction to decide which side of a cut the tool should stay on.

**What you need to know first:** Lesson 33's `get_edge` and its own
accumulator-loop pattern, Lesson 8's `cross_product`, and Lesson 26's
`orientation` and `signed_area` for a single triangle.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–33.

**Terms introduced in this lesson:**

- **Shoelace formula** — a method for computing a polygon's signed area
  by summing `cross_product(vertex[i], vertex[i+1])` over every edge,
  then halving the total. Why: this is the direct generalization of
  Lesson 26's own three-point `signed_area` to a shape with any number of
  vertices, named for the crisscrossing pattern its terms make when
  written out by hand.
- **Winding direction** — whether a polygon's vertices, walked in order,
  circle counterclockwise or clockwise. Why: this is the whole-shape
  generalization of Lesson 19's per-triangle turn direction, and it's a
  real, load-bearing property in CAD/CAM software, not just a
  mathematical curiosity — climb versus conventional milling depends on
  which side of a cut the tool stays on, which depends directly on a
  pocket boundary's own winding direction.

**Objects and methods used:**

None. `polygon_signed_area` and `polygon_orientation` are hand-authored
project code, built from Lesson 8 and 33's own reused functions.

---

## Concept Unit: The Shoelace Formula — Signed Area for Any Polygon

### The Problem

Lesson 26's `signed_area(a, b, c)` only ever measures one triangle. A
polygon with more than three vertices has no single triangle to measure
— its area needs to come from every edge together, not from three
individually named points.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–33.
- **Files affected:** `geometry_lesson_34.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def polygon_signed_area(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        v1 = edge[0]
        v2 = edge[1]
        total = total + cross_product(v1, v2)
    return total / 2


ccw_polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

print(polygon_signed_area(ccw_polygon))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `cross_product` and `get_edge` are Lesson 8 and 33's
own functions, retyped unchanged; the accumulator loop shape is Lesson
33's own `polygon_perimeter` pattern, reused. No new Python construct
appears here, so no isolated throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def cross_product(a, b): ...`, `def get_edge(polygon, i): ...` —
  Lesson 8 and 33's own functions, retyped unchanged. No re-explanation
  owed, per the Repetition Rule.
- `def polygon_signed_area(polygon): ...` — first appearance: this
  lesson's own subject.
- `total = 0` — a **hard concept reappearing**: Lesson 33's own
  accumulator pattern, restated briefly rather than re-derived: a running
  total, updated once per edge rather than checked and returned
  immediately.
- `for i in range(len(polygon)): ...` — already-basic reuse, identical
  to Lesson 33's own `polygon_perimeter` loop.
- `edge = get_edge(polygon, i)`, `v1 = edge[0]`, `v2 = edge[1]` —
  already-basic reuse, identical to Lesson 33's own unpacking pattern.
- `total = total + cross_product(v1, v2)` — first appearance: instead of
  `polygon_perimeter`'s own `norm`-based edge *length*, each edge
  contributes `cross_product(v1, v2)` — the **shoelace formula**'s own
  term, treating each vertex as a vector measured from the origin, not
  from the previous vertex.
- `return total / 2` — halving the accumulated sum, exactly the way
  Lesson 26's own `signed_area` halved a single `cross_product` result.
- `ccw_polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]` — Lesson 33's own
  rectangle, listed counter-clockwise.
- `print(polygon_signed_area(ccw_polygon))` — prints `12.0`, the
  rectangle's true area (`4` by `3`), positive because the vertices are
  listed counter-clockwise.

### CS Lens

Generalizing a formula that worked for one fixed-size case (a triangle)
into a summed version that works for any size, by recognizing the
original formula as one term of a larger pattern, is a common and
powerful move.

```
Also recognized in: numerical integration (the trapezoidal rule computes
an area under a curve by summing many small trapezoids, generalizing a
single triangle's or rectangle's area formula the same way this lesson
generalizes a single triangle's `cross_product`), GIS and mapping
software (computing a country or property boundary's true area from its
recorded vertex list uses this exact shoelace formula, at a much larger
scale), and 3D mesh processing (a polygon mesh's total surface area is
computed by summing each individual face's own signed area, the 3D
generalization of this lesson's own 2D sum)
```

### SE Lens

The design principle is **recognizing a special case as one term of a
general sum**, rather than writing separate logic for triangles,
quadrilaterals, and larger polygons. The alternative not chosen: keep
Lesson 26's `signed_area(a, b, c)` as the only area function, and write
a `polygon_signed_area` that special-cases 3-vertex, 4-vertex, and
larger shapes with separate formulas for each.

That alternative would need a genuinely new formula for every possible
vertex count. The real value of recognizing the shoelace formula's own
shape: `polygon_signed_area` already works correctly for a 3-vertex
polygon too, with zero special-casing — Lesson 26's own triangle is
simply the smallest possible input this general loop already handles.

### Commands Needed

`python geometry_lesson_34.py` — same interpreter and command as every
prior lesson.

### Run It

```
12.0
```

Verified by actually running the file above.

### Connection

`polygon_signed_area` correctly measures the rectangle's true area. The
next unit reads its *sign* to answer this lesson's actual question:
which way does the polygon wind.

---

## Concept Unit: Reading the Winding Direction — Counterclockwise or Clockwise

### The Problem

`polygon_signed_area`'s magnitude is the polygon's real area — but its
*sign*, the same way Lesson 26's `signed_area` already proved for a
single triangle, carries a second, independent piece of information: the
order the vertices were walked in.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_34.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(polygon_signed_area(ccw_polygon))`
  line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `polygon_signed_area`.

### The New Code

```python
def polygon_orientation(polygon):
    signed_area = polygon_signed_area(polygon)

    if signed_area > 0:
        return "counterclockwise"
    elif signed_area < 0:
        return "clockwise"
    else:
        return "degenerate"


cw_polygon = [(0, 0), (0, 3), (4, 3), (4, 0)]

print(polygon_signed_area(cw_polygon))
print(polygon_orientation(ccw_polygon))
print(polygon_orientation(cw_polygon))
```

### The Updated Project

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def polygon_signed_area(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        v1 = edge[0]
        v2 = edge[1]
        total = total + cross_product(v1, v2)
    return total / 2


ccw_polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

print(polygon_signed_area(ccw_polygon))


def polygon_orientation(polygon):                                        # ← new
    signed_area = polygon_signed_area(polygon)                           # ← new
                                                                           # ← new
    if signed_area > 0:                                                 # ← new
        return "counterclockwise"                                       # ← new
    elif signed_area < 0:                                                # ← new
        return "clockwise"                                               # ← new
    else:                                                                # ← new
        return "degenerate"                                              # ← new


cw_polygon = [(0, 0), (0, 3), (4, 3), (4, 0)]                            # ← new

print(polygon_signed_area(cw_polygon))                                   # ← new
print(polygon_orientation(ccw_polygon))                                  # ← new
print(polygon_orientation(cw_polygon))                                   # ← new
```

The file now answers this lesson's actual question directly: not just a
polygon's area, but which way it winds.

*A note on method:* `if`/`elif`/`else` is Lesson 19's own already-taught
construct. No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def polygon_orientation(polygon): ...` — first appearance: this
  lesson's own predicate.
- `signed_area = polygon_signed_area(polygon)` — Concept Unit 1's own
  function, reused.
- `if signed_area > 0: return "counterclockwise"`, `elif signed_area <
  0: return "clockwise"`, `else: return "degenerate"` — a **hard concept
  reappearing**: the identical three-way sign-reading structure Lesson
  26's `orientation` already used for a single triangle, restated here
  for a whole polygon's own signed area instead of one triangle's.
- `cw_polygon = [(0, 0), (0, 3), (4, 3), (4, 0)]` — the *exact same four
  corners* as `ccw_polygon`, listed in the opposite order.
- `print(polygon_signed_area(cw_polygon))` — prints `-12.0`: identical
  magnitude to `ccw_polygon`'s own `12.0`, negated.
- `print(polygon_orientation(ccw_polygon))` — prints
  `"counterclockwise"`.
- `print(polygon_orientation(cw_polygon))` — prints `"clockwise"` — the
  identical shape, identical true area, differing only in which
  direction its vertex list was written.

### CS Lens

A whole shape's winding direction, computed from nothing but the sign of
one accumulated number, is a load-bearing convention in real graphics and
manufacturing systems, not just a mathematical detail.

```
Also recognized in: 3D graphics backface culling (a triangle's winding
order, computed exactly this way in screen space, is how a GPU decides
whether it's facing the camera or facing away, and skips rendering it
accordingly — a wrongly-wound triangle simply vanishes), GIS boundary
conventions (the GeoJSON and shapefile formats both specify a required
winding direction for outer boundaries versus holes, precisely so
software can tell them apart using this same sign test), and CNC pocket
milling (a pocket boundary's winding direction, combined with the
spindle's rotation direction, determines whether a cut is climb milling
or conventional milling — a real, physical distinction affecting surface
finish and tool wear, not a cosmetic one)
```

### SE Lens

The design principle is **reusing an already-proven sign convention at a
larger scale**, rather than inventing a new one for whole polygons. The
alternative not chosen: define "counterclockwise" and "clockwise" for a
polygon using some entirely different test — checking the turn direction
at just one vertex, say, rather than summing every edge's own
contribution.

That alternative would be cheaper to compute, but fragile: a single
vertex's own turn direction says nothing reliable about the *whole*
shape's winding for anything but a convex polygon, and this curriculum
hasn't yet proven — or assumed — that every polygon it builds is convex.
`polygon_signed_area`'s full sum, by contrast, correctly reflects the
shape's true overall winding regardless of how its individual corners
turn, because it's built from literally every edge, not a sample of one.

### Commands Needed

`python geometry_lesson_34.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
12.0
-12.0
counterclockwise
clockwise
```

Verified by actually running the updated file above.

### Connection

The same four corners, listed in opposite orders, produce opposite
winding directions and identical magnitudes. Connect the Pieces, below,
traces both start to finish.

---

## Connect the Pieces

Two vertex orderings of the same rectangle, traced through everything
this lesson built, start to finish:

1. `ccw_polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]` — `polygon_signed_area`
   sums `cross_product` over all four edges (via `get_edge`), giving
   `24`, halved to `12.0`.
2. `cw_polygon = [(0, 0), (0, 3), (4, 3), (4, 0)]` — the identical four
   corners, opposite order. The same summation gives `-24`, halved to
   `-12.0`.
3. `polygon_orientation` reads each sign: `"counterclockwise"` for the
   positive case, `"clockwise"` for the negative one — the exact same
   shape and area, distinguished only by which way the vertex list winds.

## What Breaks Without This

`polygon_signed_area` assumes its vertex list traces a **simple**
polygon — one whose edges never cross each other. Check what happens
when that assumption fails, using the *same four corners* as
`ccw_polygon`, listed in a self-intersecting, "bowtie" order instead:

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def polygon_signed_area(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        v1 = edge[0]
        v2 = edge[1]
        total = total + cross_product(v1, v2)
    return total / 2


def polygon_orientation(polygon):
    signed_area = polygon_signed_area(polygon)

    if signed_area > 0:
        return "counterclockwise"
    elif signed_area < 0:
        return "clockwise"
    else:
        return "degenerate"


bowtie_polygon = [(0, 0), (4, 3), (4, 0), (0, 3)]

print(polygon_signed_area(bowtie_polygon))
print(polygon_orientation(bowtie_polygon))
```

```
0.0
degenerate
```

Verified by actually running this. `bowtie_polygon` uses the *exact
same four corner points* as `ccw_polygon` — nothing about its actual
area is zero — just connected in an order that crosses itself, tracing
two triangular lobes on opposite sides of an X shape instead of one
rectangle. `polygon_signed_area` doesn't crash and doesn't raise any
error: it silently reports `0.0`, and `polygon_orientation` silently
reports `"degenerate"` — because the two crossed lobes wind in *opposite*
directions from each other, and their signed contributions cancel out
exactly, even though the shape traced is real, visible, and has genuine
area. This is not a bug in the shoelace formula; it's a real limitation
of what it promises: it correctly measures signed area *for a simple
polygon*, and silently produces a misleading answer the moment that
assumption is violated — exactly the kind of situation Lesson 44, Robust
2D Geometry, will need to detect explicitly rather than assume away.

## Exercises

1. Using `polygon_signed_area`, verify that shifting every vertex of
   `ccw_polygon` by the same offset — for example, adding `(100, 100)`
   to each point — leaves the computed area unchanged at `12.0`. Explain
   why the shoelace formula gives the same answer regardless of where
   the polygon sits, even though it measures each vertex from the
   origin, not from the polygon's own position.
2. Build a triangle, `[(0, 0), (5, 0), (0, 5)]`, and confirm
   `polygon_signed_area` gives the same answer as Lesson 26's own
   `signed_area((0, 0), (5, 0), (0, 5))`, proving this lesson's general
   formula truly reduces to Lesson 26's for the smallest possible
   polygon.
3. Using `polygon_orientation`, predict and then verify what a polygon
   listed with only two vertices — `[(0, 0), (4, 0)]` — reports. Explain
   what `polygon_signed_area` actually computes for a shape that isn't a
   real polygon at all.

## Definition of Done

- [ ] `geometry_lesson_34.py` exists and runs with no errors via `python
      geometry_lesson_34.py`.
- [ ] Running it prints `12.0`, `-12.0`, `counterclockwise`, then
      `clockwise` — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, how the shoelace
      formula generalizes Lesson 26's own triangle `signed_area`.
- [ ] You can explain why `polygon_orientation` reported `"degenerate"`
      for the bowtie polygon despite it having real, visible area, using
      this lesson's own verified counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Generalize signed area to whole polygons via the shoelace formula and read winding direction from its sign"`,
      not `git commit -m "add polygon_orientation"`.

Next: Lesson 35 — Point-in-Polygon, which reuses this lesson's own
`get_edge` to determine whether an arbitrary point lies inside a
polygon's boundary — the question every pocket-milling and containment
check in a real CAD/CAM system ultimately depends on.
