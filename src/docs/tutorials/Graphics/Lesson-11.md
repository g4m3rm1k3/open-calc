# Lesson 11: Orientation

**What you will build:** A formal test for whether a coordinate system's
basis vectors are "positively" or "negatively" oriented, applied first to
Lesson 6's own two bases, then to a genuinely mirrored one — and the same
test applied to a whole path's vertices to determine which way it winds.
The transferable problem: Lesson 6 quietly used a tilted basis without
asking whether it was fundamentally the same *kind* of coordinate system as
the standard one, or secretly a mirror image of it. Lesson 8 could tell you
whether one corner of a path turned left or right, but not whether an
entire coordinate system itself was built "the right way around." This
lesson answers both, with the same operation.

**What you need to know first:** Lesson 6's basis vectors (standard and
tilted), Lesson 8's `cross_product` and its turn-direction reading, and
Lesson 2's `subtract_points`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–10.

**Terms introduced in this lesson:**

- **Orientation** (of an ordered pair of vectors) — whether crossing the
  first vector into the second produces a positive or negative result. Why:
  this is the formal name for the "which way did I turn" question Lesson 8
  already computed, general enough to apply to a whole coordinate system's
  basis vectors, not just one corner of one path.
- **Handedness** — whether a coordinate system's own basis vectors are
  positively oriented (this curriculum, matching common convention, calls
  this **right-handed**) or negatively oriented (**left-handed**). Why: two
  coordinate systems can look equally reasonable on paper while secretly
  being mirror images of each other — handedness is the name for which
  family a given basis belongs to.
- **Winding** — the overall rotational direction, counterclockwise or
  clockwise, that an ordered sequence of points traces out. Why: Lesson 8
  could read one corner's turn direction; winding is what that same
  question becomes once it's asked about how an entire path — or the order
  its vertices are listed in — turns as a whole.

**Objects and methods used:**

None new. This lesson reuses Lesson 2's `subtract_points` and Lesson 8's
`cross_product` exactly as written.

---

## Concept Unit: Orientation Is a Property of a Whole Basis

### The Problem

Lesson 6 built a second, tilted basis — `tilted_x_axis = (0, 1)`,
`tilted_y_axis = (-1, 0)` — and treated it as just as legitimate a
coordinate system as the standard one, without ever asking whether it was
fundamentally the *same kind* of coordinate system, only rotated, or
secretly a mirror image with the axes' relationship flipped. Those are two
genuinely different possibilities, and nothing built so far can tell them
apart.

*A note on method:* this unit's operation is Lesson 8's own
`cross_product`, applied to a new kind of input — a coordinate system's own
basis vectors, rather than a path's edges. No new Python construct, and no
throwaway syntax lab, is needed here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–10.
- **Files affected:** `geometry_lesson_11.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


x_axis = (1, 0)
y_axis = (0, 1)
print(cross_product(x_axis, y_axis))

tilted_x_axis = (0, 1)
tilted_y_axis = (-1, 0)
print(cross_product(tilted_x_axis, tilted_y_axis))

reflected_x_axis = (0, 1)
reflected_y_axis = (1, 0)
print(cross_product(reflected_x_axis, reflected_y_axis))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `def cross_product(a, b): ...` — Lesson 8's own function, retyped
  unchanged. No re-explanation owed for its mechanics, per the Repetition
  Rule.
- `x_axis = (1, 0)` and `y_axis = (0, 1)` — Lesson 6's standard basis,
  retyped.
- `print(cross_product(x_axis, y_axis))` — already computed once, in
  Lesson 8: `1`, positive.
- `tilted_x_axis = (0, 1)` and `tilted_y_axis = (-1, 0)` — Lesson 6's
  tilted basis, retyped.
- `print(cross_product(tilted_x_axis, tilted_y_axis))` — `0*0 - 1*(-1)`
  evaluates to `1`, also positive. **The tilted basis has the same
  orientation as the standard one** — Lesson 6's 90-degree rotation moved
  the axes to new directions without flipping which side of `x_axis`
  `y_axis` sits on.
- `reflected_x_axis = (0, 1)` and `reflected_y_axis = (1, 0)` — a new
  basis, deliberately built by *swapping* the standard basis's two vectors
  rather than rotating them.
- `print(cross_product(reflected_x_axis, reflected_y_axis))` — `0*0 -
  1*1` evaluates to `-1`, negative. **This basis has the opposite
  orientation from the standard one** — not a rotation of it, but its
  mirror image.

### CS Lens

Testing whether an ordered pair of basis vectors has positive or negative
orientation is testing the coordinate system's **handedness** — a property
that survives rotation but flips under reflection.

```
Also recognized in: your own two hands (a right hand rotated any amount
is still recognizably a right hand; only reflecting it in a mirror turns
it into a left hand — the origin of the term "handedness" itself), screen
versus print coordinate conventions (flipping only the y-axis, as Lesson
6's closing example did, is exactly this kind of reflection, and flips
handedness the same way), and chemistry (a molecule and its mirror-image
"enantiomer" share every bond length and angle but are not the same
molecule — a real-world case where reflection, not rotation, is what
actually matters)
```

### SE Lens

The design principle is **testing a coordinate system's own consistency
before trusting anything measured inside it** — one cheap cross-product
check, applied once to a basis, instead of discovering a mirrored problem
only after geometry built on top of that basis starts producing backwards
results. The alternative not chosen: assume any two vectors handed to a
function as "the axes" are automatically fine, with no orientation check
at all.

That alternative is exactly what every lesson through Lesson 10 has quietly
done — none of them ever verified that a basis wasn't secretly a mirror
image. It cost nothing while every basis this curriculum built happened to
be right-handed. The Closing section shows exactly what a left-handed
basis, used without anyone noticing the flip, actually does to a real
point.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_11.py`.
Nothing new here.

### Run It

```
1
1
-1
```

Verified by actually running the file above.

### Connection

Orientation, applied to a whole basis, distinguishes a rotation from a
reflection. The next unit applies the exact same test to a path's vertices
instead of a coordinate system's axes.

---

## Concept Unit: Winding — Orientation Applied to a Whole Path

### The Problem

Lesson 8 checked one corner of a three-point path and found it turned
counterclockwise. That was a fact about one specific corner. A path — the
boundary of a polygon, the outline a toolpath traces — is described by an
*ordered list* of points, and listing those same points in a different
order changes more than just which point comes first: it can change which
way the whole path winds.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_11.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(cross_product(reflected_x_axis,
  reflected_y_axis))` line added in Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def subtract_points(head, tail):
    return (head[0] - tail[0], head[1] - tail[1])


p0 = (0, 0)
p1 = (4, 0)
p2 = (4, 3)

edge1 = subtract_points(p1, p0)
edge2 = subtract_points(p2, p1)
print(cross_product(edge1, edge2))

reversed_edge1 = subtract_points(p2, p0)
reversed_edge2 = subtract_points(p1, p2)
print(cross_product(reversed_edge1, reversed_edge2))
```

### The Updated Project

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


x_axis = (1, 0)
y_axis = (0, 1)
print(cross_product(x_axis, y_axis))

tilted_x_axis = (0, 1)
tilted_y_axis = (-1, 0)
print(cross_product(tilted_x_axis, tilted_y_axis))

reflected_x_axis = (0, 1)
reflected_y_axis = (1, 0)
print(cross_product(reflected_x_axis, reflected_y_axis))


def subtract_points(head, tail):                    # ← new
    return (head[0] - tail[0], head[1] - tail[1])    # ← new


p0 = (0, 0)                                            # ← new
p1 = (4, 0)                                            # ← new
p2 = (4, 3)                                            # ← new

edge1 = subtract_points(p1, p0)                        # ← new
edge2 = subtract_points(p2, p1)                        # ← new
print(cross_product(edge1, edge2))                     # ← new

reversed_edge1 = subtract_points(p2, p0)                # ← new
reversed_edge2 = subtract_points(p1, p2)                # ← new
print(cross_product(reversed_edge1, reversed_edge2))    # ← new
```

The file as a whole now covers both applications of orientation this
lesson set out to teach: a coordinate system's own handedness, and a
path's winding direction, using the exact same `cross_product` underneath
both.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def subtract_points(head, tail): ...`, `p0`, `p1`, `p2`, `edge1`,
  `edge2`, and the first `print(cross_product(edge1, edge2))` — this is
  Lesson 8's own triangle example, retyped unchanged, producing the same
  already-verified `12`.
- `reversed_edge1 = subtract_points(p2, p0)` — the vector from `p0`
  straight to `p2`, skipping `p1` entirely — the first leg of the path if
  its three points were instead walked in the order `p0, p2, p1`.
- `reversed_edge2 = subtract_points(p1, p2)` — the second leg of that
  reordered path.
- `print(cross_product(reversed_edge1, reversed_edge2))` — `4*(-3) -
  3*0` evaluates to `-12`, the exact negative of the original `12`.
  **Reversing the order the same three points are walked in reverses the
  path's winding** — the same physical triangle, described by the same
  three points, wound the opposite way just by listing them differently.

### CS Lens

A polygon's vertex order determining its winding — and its winding
determining facts a program can act on, like "which side is the front" —
is the foundation of **winding number** and **orientation-based
classification**, ideas Lesson 34, Polygon Orientation, and Lesson 19,
Geometric Predicates, both build on directly.

```
Also recognized in: 3D graphics (a triangle's vertex order determines
which of its two faces is considered "front," used to decide which
triangles to skip drawing entirely — back-face culling), CNC contouring
(a pocket's boundary, walked clockwise versus counterclockwise, tells a
CAM system which side is material to remove and which side is material to
keep), and topology (the winding number of a closed curve around a point
determines whether that point counts as "inside" the curve at all)
```

### SE Lens

The design principle is **treating vertex order as meaningful data, not
an arbitrary detail**. The alternative not chosen: treat a path as nothing
more than an unordered collection of points, extracting only their
locations and discarding the sequence they were listed in.

Discarding the order would make `p0, p1, p2` and `p0, p2, p1` look
identical — the same three points, and nothing else. This unit just proved
they aren't identical at all: one winds counterclockwise, the other
clockwise, a real geometric difference invisible to anything that only
looks at the set of points involved. The cost of preserving order:
functions built on windings, from here forward, have to receive their
points in a specific, meaningful sequence — get that sequence backwards by
accident, and the answer flips sign silently, exactly the way Lesson 8's
own "what breaks" section already demonstrated once.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_11.py`. Nothing
new here.

### Run It

```
1
1
-1
12
-12
```

Verified by actually running the updated file above.

### Connection

This lesson's single cross-product test now answers two related but
distinct questions: whether a coordinate system's own basis is right- or
left-handed, and whether a path's own vertex order winds counterclockwise
or clockwise. Lesson 19, Geometric Predicates, builds real yes/no
geometric tests — like "is this point inside this triangle" — directly out
of exactly this orientation check, repeated across a shape's edges.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `x_axis = (1, 0)`, `y_axis = (0, 1)` — the standard basis.
   `cross_product(x_axis, y_axis)` computes `1*1 - 0*0 = 1` — positive,
   right-handed.
2. `reflected_x_axis = (0, 1)`, `reflected_y_axis = (1, 0)` — the same two
   numbers as the standard basis's vectors, but swapped between the two
   axes.
3. `cross_product(reflected_x_axis, reflected_y_axis)` computes `0*0 -
   1*1 = -1` — negative, left-handed. Swapping which vector plays which
   role flipped the sign, even though neither individual vector changed at
   all.
4. `p0 = (0, 0)`, `p1 = (4, 0)`, `p2 = (4, 3)`, walked in that order,
   produce a cross product of `12` — counterclockwise.
5. The same three points, walked as `p0, p2, p1` instead, produce `-12` —
   clockwise. The physical triangle never moved; only the order its
   corners were visited in did, and that alone was enough to reverse its
   winding.

## What Breaks Without This

Feed a feature's coordinates through the reflected basis instead of the
standard one, the way a program might if a coordinate system's handedness
got flipped by accident somewhere upstream — a swapped wiring convention,
a copy-pasted basis with two lines transposed:

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


feature_in_part = (3, 4)
x_axis = (1, 0)
y_axis = (0, 1)
reflected_x_axis = (0, 1)
reflected_y_axis = (1, 0)

intended = from_components(feature_in_part[0], feature_in_part[1], x_axis, y_axis)
mirrored = from_components(feature_in_part[0], feature_in_part[1], reflected_x_axis, reflected_y_axis)

print(intended)
print(mirrored)
```

```
(3, 4)
(4, 3)
```

Verified by actually running this. `(4, 3)` is not an error, and it's not
even an unreasonable-looking point — it's the exact mirror image of the
intended `(3, 4)`, reflected across the diagonal. A real part programmed
against the intended, right-handed basis, but actually cut by a machine
whose axes were wired according to the reflected, left-handed one, comes
out as a genuine mirror image of the design — every feature on the correct
side flipped to the wrong one. Nothing about this failure crashes, prints
an error, or even looks obviously wrong on its own; it only becomes visible
by comparing against the orientation this lesson's `cross_product` test
would have caught immediately.

## Exercises

1. Build a third basis, `x_axis = (1, 0)`, `y_axis = (0, -1)` — Lesson 6's
   own screen-space example. Predict, then verify, whether
   `cross_product(x_axis, y_axis)` comes out positive or negative, and
   connect your answer to what Lesson 6's closing section already showed
   about this exact basis.
2. Using `p0 = (0, 0)`, `p1 = (0, 4)`, `p2 = (3, 4)` — a different triangle
   than this lesson's own — determine its winding direction by hand
   (sketch it, or reason about lefts and rights), predict the sign of
   `cross_product` on its first two edges, then verify.
3. Reversing the order of *all three* points of a triangle (not just
   swapping the last two, as this lesson did) also flips its winding.
   Verify this using `p2, p1, p0` as the walking order for this lesson's
   own triangle, and explain in one sentence why a full reversal has the
   same effect on winding as reversing any two of the three points.

## Definition of Done

- [ ] `geometry_lesson_11.py` exists and runs with no errors via
      `python geometry_lesson_11.py`.
- [ ] Running it prints `1`, `1`, `-1`, `12`, then `-12` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why Lesson 6's tilted
      basis and the standard basis share the same handedness, while the
      reflected basis in this lesson does not.
- [ ] You can explain why reversing the order of a path's points can flip
      its winding, using this lesson's own triangle as a concrete example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add orientation: a cross-product sign test for basis handedness and path winding"`,
      not `git commit -m "add orientation checks"`.

Next: Lesson 12 — Coordinate Transformations, where Lesson 4/5's origin
shifts and Lesson 6's basis changes finally combine into one general
operation for moving geometry between any two coordinate systems at once.
