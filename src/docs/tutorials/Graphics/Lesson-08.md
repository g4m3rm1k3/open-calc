# Lesson 8: Cross Products

**What you will build:** A `cross_product` function — a second way to
combine two vectors into a single scalar, answering a question the dot
product can't: not "how aligned are these two directions," but "which way
would you have to turn to get from one to the other." You'll use it to
determine whether three points, walked in order, turn left or right — the
exact test a polygon-orientation check needs. The transferable problem:
Lesson 7's dot product is symmetric — it doesn't care which vector comes
first. This lesson's operation is the opposite on purpose, and that
asymmetry is precisely what makes it useful.

**What you need to know first:** Lesson 2's `subtract_points`, Lesson 6's
basis vectors, and Lesson 7's dot product — specifically, the fact that a
dot product doesn't care about argument order, which this lesson's
operation will contradict on purpose.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–7.

**Terms introduced in this lesson:**

- **Cross product** (2D form) — an operation that combines two vectors into
  a single scalar, computed as `a[0]*b[1] - a[1]*b[0]`. Why: the dot
  product can measure alignment, but it can't distinguish "b is rotated
  counterclockwise from a" from "b is rotated clockwise from a" — the cross
  product's sign is exactly that distinction, made computable.
- **Signed area** — the area of the parallelogram formed by two vectors,
  carrying a sign that reflects their rotational order. Why: the cross
  product's magnitude turns out to equal this area, and the sign is what
  makes it "signed" rather than a plain, orientation-blind measurement —
  vocabulary this lesson needs to describe what the number it computes
  actually represents geometrically.

**Objects and methods used:**

None. This lesson reuses Lesson 2's `subtract_points`; everything else is
built from plain arithmetic already covered.

---

## Concept Unit: A Second Way to Combine Two Vectors into One Number

### The Problem

Lesson 7's dot product answers "how aligned are these two vectors" with a
single number — but it's fundamentally blind to one thing: `dot_product(a,
b)` and `dot_product(b, a)` are always equal, so nothing about a dot
product alone can ever say "b sits to the *left* of a" versus "b sits to
the *right* of a." That distinction — which side, which rotational
direction — is exactly what a polygon-winding check, a "which side of this
line" test, or a "did I just turn left or right" question actually needs.

*A note on method:* like the dot product, the cross product is a genuinely
new arithmetic pattern, not just a new use of an already-known construct —
but it's built entirely from multiplication and subtraction, both already
covered. No separate throwaway syntax lab is needed; the new content is
mathematical, taught directly in the real code below.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–7.
- **Files affected:** `geometry_lesson_08.py` — created, as a new file for
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
print(cross_product(y_axis, x_axis))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `def cross_product(a, b):` — a function definition, already-basic
  syntax.
- `return a[0] * b[1] - a[1] * b[0]` — this is the new pattern. Unlike
  Lesson 7's dot product, which multiplied *matching* components
  (`a[0]*b[0]`, `a[1]*b[1]`), this multiplies *crossed* components
  (`a[0]*b[1]`, `a[1]*b[0]`) and subtracts one product from the other
  instead of adding them. Every piece — indexing, multiplication,
  subtraction — is already covered; the new idea is entirely in which
  components get multiplied together and combined how.
- `x_axis = (1, 0)` and `y_axis = (0, 1)` — Lesson 6's own basis vectors,
  retyped, chosen because their cross product is easy to check by hand:
  `1*1 - 0*0` is exactly `1`.
- `print(cross_product(x_axis, y_axis))` — produces `1`, confirming the
  hand calculation.
- `print(cross_product(y_axis, x_axis))` — the same two vectors, arguments
  swapped: `0*0 - 1*1` is exactly `-1`. The sign flipped, using the exact
  same two vectors — the first concrete proof that, unlike the dot
  product, argument order matters here.

### CS Lens

An operation whose result flips sign when its two arguments are swapped is
**anticommutative** — a real, named mathematical property, not just an
observed coincidence.

```
Also recognized in: subtraction itself (a - b is the negation of b - a),
matrix determinants (swapping two rows or columns of a matrix negates its
determinant, the same anticommutative pattern generalized to more
dimensions), and rock-paper-scissors-style relations (a "beats" b implies
b does not "beat" a — an asymmetric relationship, structurally similar to
this operation's sensitivity to argument order)
```

### SE Lens

The design principle is **building an operation whose asymmetry carries
real information**, rather than treating asymmetry as a defect to eliminate.
The alternative not chosen: define a symmetric version instead — perhaps
`abs(a[0]*b[1] - a[1]*b[0])`, always positive, agreeing regardless of
argument order.

That alternative would still measure the parallelogram's area correctly,
since area itself can't be negative. The real cost of throwing away the
sign: it's exactly the sign that answers "which way did I turn" or "which
side is this point on," and once it's gone (via `abs()`), no amount of
further computation on the remaining positive number can bring it back.
Keeping the sign, unreduced, is what makes the very next unit's
turn-direction check possible at all.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_08.py`.
Nothing new here.

### Run It

```
1
-1
```

Verified by actually running the file above.

### Connection

`cross_product`'s sign already flipped once, predictably, when its
arguments were swapped. The next unit puts that exact sign to work,
answering a real geometric question instead of just demonstrating the
operation's own personality.

---

## Concept Unit: Which Way Did You Turn?

### The Problem

Walk three points, in order — `p0`, then `p1`, then `p2` — the way a
polygon's boundary or a toolpath's corner sequence naturally would. At each
corner, did the path turn left (counterclockwise) or right (clockwise)?
Answering that by eye, from a diagram, is easy. Answering it from three
plain coordinate pairs, with no diagram at all, needs an actual
computation.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_08.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(cross_product(y_axis, x_axis))`
  line added in Concept Unit 1.
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
```

### The Updated Project

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


x_axis = (1, 0)
y_axis = (0, 1)

print(cross_product(x_axis, y_axis))
print(cross_product(y_axis, x_axis))


def subtract_points(head, tail):                # ← new
    return (head[0] - tail[0], head[1] - tail[1])  # ← new


p0 = (0, 0)                                        # ← new
p1 = (4, 0)                                        # ← new
p2 = (4, 3)                                        # ← new

edge1 = subtract_points(p1, p0)                    # ← new
edge2 = subtract_points(p2, p1)                    # ← new

print(cross_product(edge1, edge2))                 # ← new
```

The file as a whole now covers both of this lesson's teaching points:
`cross_product`'s own anticommutative personality, proved against the
basis vectors, and its real use — reading a turn direction from three
ordinary points.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def subtract_points(head, tail): ...` — Lesson 2's own function,
  retyped unchanged. No re-explanation owed for its mechanics, per the
  Repetition Rule.
- `p0 = (0, 0)`, `p1 = (4, 0)`, `p2 = (4, 3)` — three points, chosen to
  form an easily-checked path: straight right, then straight up-and-right
  — visibly a left (counterclockwise) turn at `p1`.
- `edge1 = subtract_points(p1, p0)` — the vector describing the first leg
  of the path, `(4, 0)`.
- `edge2 = subtract_points(p2, p1)` — the vector describing the second leg,
  `(0, 3)`.
- `print(cross_product(edge1, edge2))` — `4*3 - 0*0` evaluates to `12`,
  positive. **A positive cross product means the second edge turns
  counterclockwise relative to the first** — exactly matching what the
  three chosen points visibly do.

### CS Lens

Reading a sequence of edges' cross-product signs to determine a path's
overall turning direction is the core computation behind **winding
order** — a concept this lesson only previews; Lesson 34, Polygon
Orientation, gives it full treatment once polygons themselves have been
properly introduced.

```
Also recognized in: computer graphics (a triangle's vertices, listed
counterclockwise versus clockwise, determine which side is considered its
"front" face — computed with exactly this sign), robotics path planning
(determining whether a robot's path curves left or right at each
waypoint), and computational geometry algorithms like the convex hull
scan, which repeatedly asks this exact left-or-right question at every
candidate point
```

### SE Lens

The design principle is **trusting a cheap sign check over an expensive
angle computation**, the same principle Lesson 7 used for the dot product's
sign. The alternative not chosen: compute the actual angle at `p1`, in
degrees, and check whether it falls on the counterclockwise or clockwise
side of straight.

An actual angle needs vector length — not yet available until Lesson 9 —
and even once it is, computing a full angle is more work than this
lesson's single multiply-subtract-multiply-subtract for a question that
only needs a yes/no answer: left or right. The cross product's sign gives
that yes/no answer directly, without ever computing a number that would
need to be interpreted in degrees at all.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_08.py`. Nothing
new here.

### Run It

```
1
-1
12
```

Verified by actually running the updated file above.

### Connection

`cross_product` now has a genuine geometric reading: its sign tells you
whether a path turns left or right at a corner, and Concept Unit 1's proof
that argument order matters is exactly why that reading is trustworthy —
swap the edges, and the answer would lie.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `p0 = (0, 0)`, `p1 = (4, 0)`, `p2 = (4, 3)` — three points forming a
   path that visibly turns left.
2. `subtract_points(p1, p0)` computes `(4 - 0, 0 - 0) = (4, 0)` — the first
   edge.
3. `subtract_points(p2, p1)` computes `(4 - 4, 3 - 0) = (0, 3)` — the
   second edge.
4. `cross_product((4, 0), (0, 3))` computes `4*3 - 0*0`.
5. `4*3` is `12`. `0*0` is `0`. `12 - 0` is `12` — positive, meaning the
   path turned counterclockwise (left) at `p1`, exactly matching what the
   three chosen coordinates describe visually.

## What Breaks Without This

Lesson 7's dot product didn't care about argument order — `dot_product(a,
b)` and `dot_product(b, a)` were always equal. It would be a completely
natural, and wrong, assumption to expect the same from `cross_product`:

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


edge1 = (4, 0)
edge2 = (0, 3)

backwards_turn = cross_product(edge2, edge1)
print(backwards_turn)
```

```
-12
```

Verified by actually running this. Swapping the two edges didn't just
change the number — it flipped its sign entirely, from `12` to `-12`. Fed
into a real polygon-winding check, this backwards call would report that a
visibly counterclockwise path was actually clockwise, silently, with no
crash and no obviously wrong-looking output — `-12` is just as plausible a
number as `12`. The lesson here isn't a bug in `cross_product`; it's that
`cross_product`'s whole purpose depends on argument order in a way
`dot_product`'s never did, and treating the two operations as
interchangeable is exactly the mistake this closing section exists to
rule out.

## Exercises

1. Predict, then verify: what does `cross_product(v, v)` return, for any
   vector `v` — a vector crossed with itself? Explain, using the formula
   itself, why that answer is guaranteed regardless of what `v` actually
   is.
2. Using the three points `p0 = (0, 0)`, `p1 = (4, 0)`, `p3 = (4, -3)`
   (note the negative y, unlike this lesson's `p2`), compute the turn
   direction at `p1`. Confirm it comes out clockwise, and explain why
   flipping the sign of one point's y-coordinate was enough to flip the
   turn direction.
3. `cross_product(edge1, edge2)` returned `12`. The parallelogram formed by
   `edge1 = (4, 0)` and `edge2 = (0, 3)` is a `4`-by-`3` rectangle. Compute
   that rectangle's area by hand (base times height) and compare it to
   `12`. State, in one sentence, what you notice about the relationship
   between the cross product's value and the parallelogram's actual area.

## Definition of Done

- [ ] `geometry_lesson_08.py` exists and runs with no errors via
      `python geometry_lesson_08.py`.
- [ ] Running it prints `1`, `-1`, then `12` — matching this lesson's
      verified output exactly.
- [ ] You can explain, without looking at the file, why
      `cross_product(a, b)` and `cross_product(b, a)` differ, using the
      formula itself, not just "because it's anticommutative."
- [ ] You can explain what a positive versus negative cross product tells
      you about a turn from one edge to the next.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add cross products: an anticommutative operation for reading turn direction and signed area"`,
      not `git commit -m "add cross_product function"`.

Next: Lesson 9 — Norms and Distance, where Lesson 7's dot product, applied
to a vector and itself, finally answers a question every lesson so far has
sidestepped: how long is a vector, really?
