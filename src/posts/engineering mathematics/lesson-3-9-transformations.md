# Stage 3, Lesson 3.9 — Transformations of the Plane
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lesson 3.6 rotated a conic's coordinate axes to eliminate a cross
term. Lesson 3.8 used rotation informally in passing. Neither lesson
stopped to name what was actually happening: a **transformation** —
a rule that takes every point in the plane and moves it somewhere
else, in a way controlled enough to be reversed, combined with other
transformations, and applied to an entire shape at once rather than
point by point by hand.

This lesson formalizes the three transformations you've been using
piecemeal — **translation**, **rotation**, **reflection** — plus
**scaling**, and introduces the single representation that unifies
all four: a small grid of numbers (a **matrix**) that a point's
coordinates get multiplied through. You haven't formally met matrices
yet (that's Stage 4), so this lesson uses them as a genuinely useful
tool now, with the full theory — why matrix multiplication works the
way it does, what a matrix *is* beyond "a grid you multiply by" —
deliberately deferred. By the end of this lesson you can translate,
rotate, reflect, and scale a shape; combine transformations in a
specific order and explain why that order matters; and use the
**homogeneous coordinate** trick that lets even translation (which
isn't naturally a matrix operation) join the same unified pipeline —
the exact technique every CAD system, game engine, and robotics
controller uses to move objects around.

---

## Historical Context

The systematic study of geometric transformations as objects in their
own right — not just operations performed on a shape, but things you
can combine, invert, and reason about algebraically — is largely
credited to Felix Klein's 1872 Erlangen program, which proposed
classifying entire branches of geometry by *which transformations
they consider "the same shape."* Euclidean geometry, in this view, is
the study of properties preserved by translation, rotation, and
reflection (distances and angles); other geometries (projective,
affine) allow more transformations and study what survives them. The
homogeneous-coordinate trick for folding translation into matrix
multiplication predates Klein, tracing to August Möbius in the 1820s,
but it became indispensable only with computer graphics in the 1960s
and 70s, when representing every transformation — translate, rotate,
scale, and eventually 3D perspective projection — as "multiply by a
matrix" let hardware apply the exact same operation to millions of
points per second regardless of which transformation was requested.

---

## What You Need To Know First

- **Rotation-of-axes formulas** — Lesson 3.6. You already derived and
  used the rotation matrix's entries; this lesson names them as a
  matrix and generalizes.
- **Dot product** — first used in Lesson 3.3's reflective-property
  code. Needed for the general-line reflection formula.
- **Vectors** — Lesson 2.8, reused throughout.

---

## The Lesson

### Translation

The simplest transformation: shift every point by a fixed vector
$(t_x, t_y)$.

$$T(x,y) = (x+t_x,\ y+t_y)$$

Nothing new here mathematically — you've done this every time you
shifted a conic's centre from the origin to $(h,k)$ throughout this
stage. What's new is treating it as a **named, reusable operation**
that applies to an entire shape (every point of a toolpath, every
control point of a Bezier curve) rather than being baked into one
equation's derivation.

```python
def translate(points, tx, ty):
    """Translate a list of (x,y) points by (tx, ty)."""
    return [(x + tx, y + ty) for x, y in points]
```

---

### Rotation About the Origin

Rotating a point $(x,y)$ by angle $\theta$ counterclockwise about the
origin:

$$x' = x\cos\theta - y\sin\theta \qquad y' = x\sin\theta + y\cos\theta$$

This is the exact substitution used in Lesson 3.6's
`rotate_conic_coeffs` — the same formula, now applied to a single
point instead of to a whole equation's coefficients.

**As a matrix.** Package the two output formulas as a $2\times2$ grid
of coefficients:

$$R(\theta) = \begin{pmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{pmatrix}$$

and "multiplying" this matrix by the point $(x,y)$ (written as a
column) means: take the top row, multiply it entrywise against
$(x,y)$, and sum — that's $x'$; do the same with the bottom row for
$y'$. That's all matrix-vector multiplication *is*, for now — a
mechanical recipe for producing the same two formulas above, in a
notation general enough to also describe reflection and scaling
below with different number grids. The full theory of why this
recipe is the right way to define "multiplication" for matrices, and
what a matrix represents more deeply, is Lesson 4.4 and 4.11 — here,
treat it purely as useful shorthand you can already verify by hand.

```python
import math
import numpy as np

def rotation_matrix(theta):
    """Return the 2x2 rotation matrix for angle theta (radians)."""
    c, s = math.cos(theta), math.sin(theta)
    return np.array([[c, -s],
                      [s,  c]])

def rotate(points, theta):
    """Rotate a list of (x,y) points about the origin by theta."""
    R = rotation_matrix(theta)
    return [tuple(R @ np.array([x, y])) for x, y in points]

# Verify against the by-hand formula
theta = math.pi / 6   # 30°
pt = (3, 0)
result = rotate([pt], theta)[0]
expected = (3*math.cos(theta), 3*math.sin(theta))
print(f"Rotated (3,0) by 30°: {result}")
print(f"Expected:             {expected}")
```

**Walkthrough.** `np.array([[c, -s], [s, c]])` is a first appearance
of a 2D NumPy array used to represent a matrix — a grid rather than a
flat list, built from a list of rows. `R @ np.array([x, y])` is a
first appearance of the `@` operator for **matrix multiplication** —
distinct from `*`, which would multiply entrywise rather than perform
the row-times-column recipe described above; using `*` here would
silently produce the wrong (and differently-shaped) result. Verifying
against the direct formula, rather than trusting the matrix
machinery blindly, is the same "check the new tool against a case you
can already compute by hand" habit used throughout this stage.

---

### Reflection

**Reflection across the $x$-axis:** $(x,y)\to(x,-y)$.
**Reflection across the $y$-axis:** $(x,y)\to(-x,y)$.
**Reflection across the line $y=x$:** $(x,y)\to(y,x)$.

**Reflection across a general line through the origin** at angle
$\phi$ to the $x$-axis uses the **vector projection** idea (dot
product, first used in Lesson 3.3): decompose the point into a
component along the line and a component perpendicular to it, then
flip the perpendicular component.

$$\text{Reflect}(P) = 2(P\cdot \hat{u})\hat{u} - P$$

where $\hat{u}$ is the unit vector along the line. This is *exactly*
the vector reflection formula from Lesson 3.3's ray-tracing code
(`reflected = 2 * (d_dot_t) * t - incoming`) — reused here for
reflecting a point across a line instead of reflecting a ray off a
tangent; same formula, different job.

```python
import numpy as np

def reflect_across_line(points, phi):
    """Reflect points across a line through the origin at angle phi."""
    u = np.array([math.cos(phi), math.sin(phi)])
    result = []
    for x, y in points:
        P = np.array([x, y])
        reflected = 2 * np.dot(P, u) * u - P
        result.append(tuple(reflected))
    return result

# Reflect (2, 5) across the x-axis (phi=0) -- should give (2, -5)
print(reflect_across_line([(2, 5)], phi=0))
# Reflect (3, 0) across the line y=x (phi=45°) -- should give (0, 3)
print(reflect_across_line([(3, 0)], phi=math.pi/4))
```

---

### Scaling

$$S(x,y) = (s_x \cdot x,\ s_y \cdot y)$$

Uniform scaling ($s_x=s_y$) preserves shape and enlarges/shrinks;
non-uniform scaling ($s_x\ne s_y$) distorts — literally how you'd
turn a circle into an ellipse by scaling one axis, connecting all the
way back to the ellipse's parametrization $(a\cos t, b\sin t)$ in
Lesson 3.4, which is exactly "a unit circle, scaled by $a$ in $x$ and
$b$ in $y$."

```python
def scale(points, sx, sy):
    """Scale a list of (x,y) points by (sx, sy) about the origin."""
    return [(x*sx, y*sy) for x, y in points]
```

---

### Composing Transformations — Order Matters

Applying rotation then translation is **not** the same as translation
then rotation. This is a concrete, checkable fact, not an abstract
warning:

```python
point = [(1, 0)]

# Rotate 90°, then translate by (5, 0)
rotated_first = translate(rotate(point, math.pi/2), 5, 0)

# Translate by (5, 0), then rotate 90°
translated_first = rotate(translate(point, 5, 0), math.pi/2)

print(f"Rotate then translate: {rotated_first}")
print(f"Translate then rotate: {translated_first}")
```

Output:

```
Rotate then translate: [(5.0, 1.0)]
Translate then rotate: [(6.123233995736766e-16, 6.0)]
```

Two visibly different results from the same two operations, applied
in opposite order. Rotating first turns $(1,0)$ into $(0,1)$, then
shifting right by 5 gives $(5,1)$. Translating first gives $(6,0)$,
and rotating *that* by 90° swings it up to $(0,6)$ (the tiny
`6e-16` is floating-point rounding noise for what is mathematically
exactly 0). **Composition of transformations is not commutative** —
the same warning you'll formalize for matrix multiplication in
general in Lesson 4.5, seen here concretely first.

---

### Homogeneous Coordinates: Folding Translation into a Matrix

Rotation, reflection, and scaling are all genuine matrix
multiplications — a $2\times2$ grid times a point. Translation is
not: there is no $2\times2$ matrix $M$ such that $M(x,y)^T =
(x+t_x,y+t_y)$ for every $(x,y)$, because matrix multiplication by a
fixed matrix always sends the origin $(0,0)$ to $(0,0)$, while
translation is supposed to move the origin.

The fix, used everywhere in graphics and CAD: represent a 2D point
$(x,y)$ as a **3D vector** $(x,y,1)$ — an extra coordinate, always
held at 1, called the **homogeneous coordinate**. Every 2D
transformation, including translation, now becomes a genuine
$3\times3$ matrix:

$$\text{Translate}(t_x,t_y) = \begin{pmatrix}1&0&t_x\\0&1&t_y\\0&0&1\end{pmatrix} \qquad
\text{Rotate}(\theta) = \begin{pmatrix}\cos\theta&-\sin\theta&0\\\sin\theta&\cos\theta&0\\0&0&1\end{pmatrix}$$

Multiplying either $3\times3$ matrix by $(x,y,1)$ reproduces exactly
the formulas above (verify the translation matrix by hand: row 1
gives $x+t_x$, row 2 gives $y+t_y$, row 3 gives $1$ — the extra
coordinate stays fixed at 1, which is the entire trick). The payoff:
**every** transformation, translation included, is now the same kind
of object, and composing two transformations is just multiplying
their two matrices together *once*, producing a single matrix that
does both operations in one multiplication instead of two separate
steps.

```python
import numpy as np
import math

def translation_matrix(tx, ty):
    return np.array([[1, 0, tx],
                      [0, 1, ty],
                      [0, 0, 1]])

def rotation_matrix_h(theta):
    """Homogeneous (3x3) version of rotation_matrix."""
    c, s = math.cos(theta), math.sin(theta)
    return np.array([[c, -s, 0],
                      [s,  c, 0],
                      [0,  0, 1]])

def apply_h(matrix, points):
    """Apply a 3x3 homogeneous matrix to a list of (x,y) points."""
    result = []
    for x, y in points:
        v = np.array([x, y, 1])
        v2 = matrix @ v
        result.append((v2[0], v2[1]))   # drop the homogeneous coordinate
    return result

# Combine rotate-then-translate into ONE matrix, via matrix multiplication
theta = math.pi / 2
combined = translation_matrix(5, 0) @ rotation_matrix_h(theta)
result = apply_h(combined, [(1, 0)])
print(f"Combined matrix, one multiplication: {result}")
print(f"Matches the two-step 'rotate then translate' result from above")
```

Output:

```
Combined matrix, one multiplication: [(5.0, 1.0)]
```

Matches the earlier two-step result exactly — confirming that
`translation_matrix(5, 0) @ rotation_matrix_h(theta)`, multiplied
*once*, is a genuinely equivalent single operation to applying
rotation and then translation as two separate steps.

**Walkthrough.** `np.array([x, y, 1])` pads a 2D point with a third
coordinate fixed at 1 — the homogeneous coordinate itself, a first
appearance of the technique the section derives. `matrix @ v` reuses
the `@` operator from the rotation section, now on $3\times3$
matrices — the mechanics are identical, only the grid size changed.
`translation_matrix(5, 0) @ rotation_matrix_h(theta)` — multiplying
two matrices together, rather than a matrix and a point — is new: it
produces a *third matrix* representing "do this rotation, then this
translation," which can then be applied to any number of points with
a single multiplication each, instead of two. Note the order: the
rightmost matrix in a chain of `@`s is applied to the point *first*
— `combined @ v` means "first rotate `v`, then translate the
result" — matching the non-commutativity demonstrated in the
previous section, now expressed as matrix multiplication order rather
than function-call nesting order.

---

### Manufacturing Application: Bolt Circles and Mirrored Parts

**Bolt circle pattern.** A very common manufacturing feature is a
ring of identical holes evenly spaced around a centre — a "bolt
circle." Generating it is nothing but rotating one hole's position
repeatedly:

```python
import math

def bolt_circle(hole_position, centre, n_holes):
    """
    Generate n_holes positions evenly spaced in a circle, by rotating
    hole_position around centre.
    """
    cx, cy = centre
    hx, hy = hole_position
    # Work in coordinates relative to the centre, rotate, then shift back
    rel = (hx - cx, hy - cy)
    positions = []
    for i in range(n_holes):
        theta = 2*math.pi * i / n_holes
        rotated = rotate([rel], theta)[0]
        positions.append((rotated[0] + cx, rotated[1] + cy))
    return positions

# 6 holes on a 40mm-radius bolt circle centred at (100, 100)
holes = bolt_circle(hole_position=(140, 100), centre=(100, 100), n_holes=6)
print("Bolt circle hole positions:\n")
for i, (x, y) in enumerate(holes):
    print(f"  Hole {i+1}: X{x:.3f} Y{y:.3f}")

# Verify every hole is exactly 40mm from centre
for x, y in holes:
    r = math.hypot(x - 100, y - 100)
    assert math.isclose(r, 40, abs_tol=1e-9)
print("\n✓ All holes verified at radius 40mm")
```

**Mirrored part.** A left-hand and right-hand version of an
asymmetric bracket is generated by reflecting the entire profile
across an axis — the same `reflect_across_line` function from above,
applied to a full toolpath instead of a single point:

```python
# A simple asymmetric profile (a few points of an L-bracket corner)
profile = [(0, 0), (20, 0), (20, 5), (5, 5), (5, 20), (0, 20)]
mirrored = reflect_across_line(profile, phi=math.pi/2)   # mirror across the y-axis

print("\nOriginal profile:", profile[:3], "...")
print("Mirrored profile:", [(round(x,2), round(y,2)) for x, y in mirrored[:3]], "...")
```

**Walkthrough.** `bolt_circle` shifts each hole to be relative to the
centre before rotating, then shifts back afterward
(`rotated[0] + cx`) — this is the translate-rotate-translate-back
pattern, a genuine composition of three transformations done
explicitly with plain function calls rather than a combined
homogeneous matrix; either approach works, and seeing the plain
version here makes clear exactly what the homogeneous-matrix version
above is compressing into one multiplication.

---

## Connect the Pieces

Concrete trace: placing 6 bolt holes and mirroring a bracket profile.

1. **Rotation formula** — verified against Lesson 3.6's coefficient
   rotation, now applied to individual points instead of equation
   coefficients.
2. **Composition order** — demonstrated concretely that rotate-then-
   translate ≠ translate-then-rotate, both as chained function calls
   and as chained matrix multiplication.
3. **Homogeneous coordinates** — folded translation, previously the
   odd one out, into the same $3\times3$ matrix framework as
   rotation, confirmed by matching the two-step result exactly.
4. **Bolt circle** — six real hole positions generated purely by
   repeated rotation, verified to sit exactly on the intended radius.
5. **Mirroring** — an entire profile's point list reflected in one
   function call, producing the tooling data for a mirror-image part
   without redrawing anything by hand.

---

## Summary

**Translation:** $(x+t_x, y+t_y)$ — not naturally a matrix operation
in 2D.

**Rotation:** $2\times2$ matrix
$\begin{pmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{pmatrix}$,
the same formula from Lesson 3.6, now applied to points.

**Reflection across a line:** $2(P\cdot\hat u)\hat u - P$, reusing
Lesson 3.3's ray-reflection formula.

**Composition is not commutative** — order matters, both as chained
function calls and as matrix multiplication order.

**Homogeneous coordinates**: pad $(x,y)\to(x,y,1)$, use $3\times3$
matrices, and translation becomes a genuine matrix multiplication —
the technique that unifies every 2D (and later 3D) transformation
into "multiply by a matrix," letting any chain of transformations
collapse into one combined matrix.

**New Python/CS concepts:**
- `np.array` for representing matrices (nested rows)
- `@` operator for matrix multiplication (distinct from entrywise `*`)
- Homogeneous coordinate padding — the 2D→3D trick for translation

---

## Problems

### Math

**1.** Rotate the point $(4,0)$ by $60°$ about the origin. Give the
exact answer (not decimal).

<details><summary>Answer</summary>
$x'=4\cos60°-0=4(1/2)=2$. $y'=4\sin60°+0=4(\sqrt3/2)=2\sqrt3$.
Result: $(2, 2\sqrt3)$.
</details>

---

**2.** Reflect the point $(6,2)$ across the line $y=x$. Then reflect
the *result* across the $x$-axis. What single transformation does the
combination equal?

<details><summary>Answer</summary>
Reflect across $y=x$: $(6,2)\to(2,6)$. Reflect across $x$-axis:
$(2,6)\to(2,-6)$. This combination — reflect across $y=x$, then
across the $x$-axis — is equivalent to a single $90°$ clockwise
rotation about the origin (verify: rotating $(6,2)$ by $-90°$ gives
$(2,-6)$ ✓). Two reflections compose into a rotation — a fact worth
noticing now and formalized in Lesson 9.5's discussion of symmetry
groups.
</details>

---

**3.** Write the single $3\times3$ homogeneous matrix for "scale by 2
in both directions, then translate by $(3,-1)$."

<details><summary>Answer</summary>
$$\begin{pmatrix}1&0&3\\0&1&-1\\0&0&1\end{pmatrix}\begin{pmatrix}2&0&0\\0&2&0\\0&0&1\end{pmatrix}=\begin{pmatrix}2&0&3\\0&2&-1\\0&0&1\end{pmatrix}$$
</details>

---

### Code Challenges

**Challenge 1 — Transformation toolkit**

```python
import math
import numpy as np

def translate(points, tx, ty):
    pass

def rotate(points, theta):
    pass

def scale(points, sx, sy):
    pass

def reflect_across_line(points, phi):
    pass

# --- tests: do not modify ---
pts = [(1, 0), (0, 1)]
t = translate(pts, 2, 3)
assert t == [(3, 3), (2, 4)]

r = rotate([(1, 0)], math.pi/2)
assert math.isclose(r[0][0], 0, abs_tol=1e-9)
assert math.isclose(r[0][1], 1, abs_tol=1e-9)

s = scale([(3, 4)], 2, 0.5)
assert s == [(6, 2.0)]

refl = reflect_across_line([(5, 0)], phi=math.pi/2)
assert math.isclose(refl[0][0], -5, abs_tol=1e-9)
assert math.isclose(refl[0][1], 0, abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Homogeneous matrix pipeline**

```python
import numpy as np
import math

def translation_matrix(tx, ty):
    pass

def rotation_matrix_h(theta):
    pass

def scale_matrix_h(sx, sy):
    """3x3 homogeneous scaling matrix."""
    pass

def apply_h(matrix, points):
    pass

# --- tests: do not modify ---
combined = translation_matrix(10, 0) @ rotation_matrix_h(math.pi/2) @ scale_matrix_h(2, 2)
result = apply_h(combined, [(1, 0)])
# scale (1,0)->(2,0), rotate 90 -> (0,2), translate (10,0) -> (10,2)
assert math.isclose(result[0][0], 10, abs_tol=1e-6)
assert math.isclose(result[0][1], 2, abs_tol=1e-6)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Bolt circle generator**

```python
import math

def bolt_circle_positions(hole_position, centre, n_holes):
    """Reimplement bolt_circle from the lesson."""
    pass

# --- tests: do not modify ---
holes = bolt_circle_positions((150, 100), (100, 100), 8)
assert len(holes) == 8
for x, y in holes:
    assert math.isclose(math.hypot(x-100, y-100), 50, abs_tol=1e-6)
# Angular spacing should be even: check consecutive angles differ by 2π/8
import numpy as np
angles = sorted(math.atan2(y-100, x-100) % (2*math.pi) for x, y in holes)
diffs = [angles[i+1]-angles[i] for i in range(len(angles)-1)]
assert all(math.isclose(d, 2*math.pi/8, abs_tol=1e-6) for d in diffs)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Show algebraically that rotation followed by translation is,
in general, not the same as translation followed by rotation — i.e.
derive both composite formulas symbolically (not just check one
numeric example) and identify the exact term that differs.

<details><summary>Answer</summary>
Rotate then translate: $(x,y)\to(x\cos\theta-y\sin\theta+t_x,\
x\sin\theta+y\cos\theta+t_y)$.

Translate then rotate: $(x,y)\to(x+t_x,y+t_y)\to
((x+t_x)\cos\theta-(y+t_y)\sin\theta,\ (x+t_x)\sin\theta+(y+t_y)\cos\theta)$
$=(x\cos\theta-y\sin\theta + t_x\cos\theta-t_y\sin\theta,\
x\sin\theta+y\cos\theta+t_x\sin\theta+t_y\cos\theta)$.

The two results agree only if $t_x\cos\theta-t_y\sin\theta=t_x$ and
$t_x\sin\theta+t_y\cos\theta=t_y$ — i.e., only when $\theta=0$ (no
rotation) or $(t_x,t_y)=(0,0)$ (no translation). The differing term
is exactly the translation vector getting rotated in the
translate-then-rotate case, but not in the rotate-then-translate
case — the rotation "sees" the translation in one order and not the
other. $\blacksquare$
</details>
