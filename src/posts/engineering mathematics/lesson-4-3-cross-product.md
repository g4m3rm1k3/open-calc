# Stage 4, Lesson 4.3 — The Cross Product: Geometry and Computation
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 4.2's tool-alignment example needed a **surface normal
vector** — perpendicular to a surface at a point — and simply handed
one over, ready-made, without saying where it came from. This lesson
answers that: the **cross product** takes two vectors in
$\mathbb{R}^3$ and produces a *third vector*, perpendicular to both
of the originals. Feed it two vectors lying flat along a surface, and
it hands you exactly the normal vector 4.2 assumed. Where the dot
product (Lesson 4.2) collapsed two vectors into a single number
measuring how *aligned* they are, the cross product does the opposite
kind of job: it produces a genuinely new vector measuring how much
two vectors *don't* point the same way, in a direction perpendicular
to both. By the end of this lesson you can compute a cross product
both by formula and by its determinant mnemonic, find its magnitude
and geometric meaning (area of a parallelogram), determine its
direction via the right-hand rule, and use it to compute real surface
normals for a triangulated 3D part — completing the pipeline Lesson
4.2 started.

---

## Historical Context

As mentioned in Lesson 4.2, the cross product and dot product both
fell directly out of Hamilton's quaternion multiplication once Gibbs
and Heaviside split it into a scalar part and a vector part in the
1880s. Unlike the dot product, the cross product is fundamentally a
**3D-specific** construction — there is no meaningful cross product
of two vectors in $\mathbb{R}^2$ or $\mathbb{R}^4$ in the same sense
(a genuinely analogous operation exists only in $\mathbb{R}^7$, tied
to an exotic number system called octonions, and is essentially never
used in engineering). This 3D-specificity is not a limitation to
work around — it reflects something true about ordinary space: torque,
angular momentum, and magnetic force all live naturally in this
"perpendicular to two things" relationship, and all were being worked
out by 19th-century physicists (Maxwell's electromagnetism most
prominently) at almost exactly the same time the notation was being
standardized.

---

## What You Need To Know First

- **Dot product, magnitude** — Lesson 4.2.
- **Determinant, informally** — Lesson 3.6 (`np.linalg.det`, used as
  a black box for the conic degeneracy test). This lesson gives the
  $2\times2$ case of that determinant its first real, hand-computable
  meaning.
- **Sine and the Law of Cosines** — Lessons 2.5, 2.7.

---

## The Lesson

### The Cross Product, by Formula

For $\mathbf u=(u_1,u_2,u_3)$ and $\mathbf v=(v_1,v_2,v_3)$ in
$\mathbb{R}^3$:

$$\mathbf u\times\mathbf v = (u_2v_3-u_3v_2,\ \ u_3v_1-u_1v_3,\ \ u_1v_2-u_2v_1)$$

**Hand-worked example:** $\mathbf u=(1,0,0)$, $\mathbf v=(0,1,0)$.

$$\mathbf u\times\mathbf v = (0\cdot0-0\cdot1,\ \ 0\cdot0-1\cdot0,\ \ 1\cdot1-0\cdot0) = (0,0,1)$$

The cross product of the $x$-axis and $y$-axis unit vectors is the
$z$-axis unit vector — perpendicular to both, exactly as advertised.

### The Determinant Mnemonic

The formula above is genuinely awkward to memorize correctly (it's
easy to mix up which subscripts go where). The standard way to
compute it reliably reuses the determinant concept from Lesson 3.6,
now given its actual computation rule for a $2\times2$ grid:

$$\begin{vmatrix}a&b\\c&d\end{vmatrix} = ad-bc$$

Arrange $\mathbf u$ and $\mathbf v$'s components as rows under the
symbolic unit vectors $\mathbf i,\mathbf j,\mathbf k$ (standing for
$(1,0,0)$, $(0,1,0)$, $(0,0,1)$) and expand:

$$\mathbf u\times\mathbf v = \begin{vmatrix}\mathbf i&\mathbf j&\mathbf k\\u_1&u_2&u_3\\v_1&v_2&v_3\end{vmatrix}
= \mathbf i\begin{vmatrix}u_2&u_3\\v_2&v_3\end{vmatrix} - \mathbf j\begin{vmatrix}u_1&u_3\\v_1&v_3\end{vmatrix} + \mathbf k\begin{vmatrix}u_1&u_2\\v_1&v_2\end{vmatrix}$$

Each $2\times2$ determinant is computed with the $ad-bc$ rule above —
producing exactly the three components of the formula, but in a
layout that's far easier to reconstruct correctly from memory than
the raw formula. (The full theory of $3\times3$ and larger
determinants, and *why* this "expansion" procedure is valid, is
Lesson 4.7 — this is a first, narrow, hand-computable use of the
$2\times2$ case specifically.)

```python
import numpy as np

def cross_product(u, v):
    """Compute u × v using the determinant-expansion formula, by hand."""
    i = u[1]*v[2] - u[2]*v[1]
    j = -(u[0]*v[2] - u[2]*v[0])
    k = u[0]*v[1] - u[1]*v[0]
    return np.array([i, j, k])

u = np.array([1, 0, 0])
v = np.array([0, 1, 0])
print(f"u × v (by hand)  = {cross_product(u, v)}")
print(f"u × v (np.cross) = {np.cross(u, v)}")

# A less trivial example
a = np.array([2, -1, 3])
b = np.array([4, 0, -2])
print(f"\na × b (by hand)  = {cross_product(a, b)}")
print(f"a × b (np.cross) = {np.cross(a, b)}")
```

**Walkthrough.** `np.cross` is a first, deliberate introduction —
the library equivalent of the hand-rolled `cross_product` function,
included specifically to verify the by-hand implementation against a
trusted reference, the same pairing pattern used for
`np.linalg.norm` versus a manual `sqrt` sum back in Lesson 3.4. Note
the minus sign on the `j` component in the code — a direct, easy-to-
forget consequence of the determinant expansion's alternating
$+,-,+$ signs, which is exactly why the mnemonic layout above is
worth learning rather than memorizing the plain formula's three
terms independently.

---

### Geometric Meaning: Magnitude and Direction

**Magnitude:**

$$\|\mathbf u\times\mathbf v\| = \|\mathbf u\|\,\|\mathbf v\|\sin\theta$$

where $\theta$ is the angle between $\mathbf u$ and $\mathbf v$ (the
direct sine counterpart to the dot product's cosine formula from
Lesson 4.2 — the two formulas are companions, one measuring
alignment via $\cos\theta$, the other measuring "spread" via
$\sin\theta$). This magnitude has a clean geometric reading: it is
exactly the **area of the parallelogram** with $\mathbf u$ and
$\mathbf v$ as adjacent sides.

**Direction:** perpendicular to both $\mathbf u$ and $\mathbf v$,
with the specific one of the two possible perpendicular directions
given by the **right-hand rule**: point your right hand's fingers
along $\mathbf u$, curl them toward $\mathbf v$, and your thumb
points along $\mathbf u\times\mathbf v$.

**Anti-commutativity.** Unlike the dot product ($\mathbf u\cdot
\mathbf v=\mathbf v\cdot\mathbf u$, always), the cross product
**reverses sign** when the order is swapped:

$$\mathbf v\times\mathbf u = -(\mathbf u\times\mathbf v)$$

This follows directly from the determinant formula (swapping two rows
of a determinant flips its sign — a general determinant property,
foreshadowed here and formalized in Lesson 4.7) and matches the
right-hand rule directly: curling from $\mathbf v$ toward $\mathbf u$
instead of $\mathbf u$ toward $\mathbf v$ points your thumb the
opposite way.

```python
import numpy as np
import math

def parallelogram_area(u, v):
    """Area of the parallelogram with sides u, v -- ||u × v||."""
    return np.linalg.norm(np.cross(u, v))

u = np.array([3, 0, 0])
v = np.array([0, 4, 0])
area = parallelogram_area(u, v)
print(f"Area of parallelogram (3,0,0) & (0,4,0): {area}")   # a plain rectangle: 3*4=12

# Verify anti-commutativity
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
print(f"\na × b = {np.cross(a, b)}")
print(f"b × a = {np.cross(b, a)}")
print(f"Confirmed opposite: {np.allclose(np.cross(a,b), -np.cross(b,a))}")
```

**Walkthrough.** `np.linalg.norm(np.cross(u, v))` chains two already-
introduced functions to compute an area directly from two edge
vectors — no separate "area formula" needs to be memorized, since the
magnitude of the cross product *is* the area, by the geometric
formula above. `np.allclose` is a first appearance: it checks that
two arrays are equal to within a small floating-point tolerance,
element-by-element, functioning as the array-valued counterpart to
`math.isclose` used constantly throughout Stage 3 for single numbers.

---

### Computing a Surface Normal — Completing Lesson 4.2's Forward Reference

A **surface normal** at a point on a flat patch (a triangle, the most
common building block for representing 3D surfaces computationally)
is found by taking the cross product of two vectors that lie *in*
the surface — any two non-parallel edges of the triangle work — and
normalizing the result.

**Why this works:** a cross product is, by construction, perpendicular
to both inputs; if both inputs lie flat in the surface, the result
must be perpendicular to the surface itself, i.e., the normal.

```python
import numpy as np

def triangle_normal(p0, p1, p2):
    """
    Compute the outward unit normal of a triangle given its three
    vertices, using two edge vectors and the cross product.
    Vertex order (p0->p1->p2) matters: it determines which of the
    two possible normal directions you get, via the right-hand rule.
    """
    edge1 = np.array(p1) - np.array(p0)
    edge2 = np.array(p2) - np.array(p0)
    normal = np.cross(edge1, edge2)
    mag = np.linalg.norm(normal)
    if mag < 1e-12:
        raise ValueError("Degenerate triangle: points are collinear")
    return normal / mag

# A triangle in the XY plane, vertices listed counterclockwise when
# viewed from +Z -- should give a normal pointing in +Z
p0, p1, p2 = (0,0,0), (4,0,0), (0,3,0)
normal = triangle_normal(p0, p1, p2)
print(f"Triangle normal: {normal}")   # expect (0, 0, 1)

# Reverse the vertex order: p0 -> p2 -> p1 -- normal should flip
normal_reversed = triangle_normal(p0, p2, p1)
print(f"Reversed winding order normal: {normal_reversed}")   # expect (0, 0, -1)
```

**Walkthrough.** `edge1 = np.array(p1) - np.array(p0)` and `edge2 =
np.array(p2) - np.array(p0)` build two vectors that genuinely lie in
the triangle's plane, both starting from the same vertex `p0` — a
direct, deliberate application of Lesson 4.1's displacement-vector
reading (position minus position gives a displacement lying in the
surface). The **degenerate-triangle guard** (`if mag < 1e-12`) is the
same fail-fast precondition-checking habit from every prior lesson,
here catching a genuinely common real-data problem: a triangle in a
scanned or generated mesh with (near-)collinear vertices has no
well-defined normal direction, and dividing by its near-zero
magnitude would otherwise silently produce a wildly wrong or infinite
"unit" vector. The **vertex-order experiment** — deliberately
reversing `p1` and `p2` and re-running — makes the right-hand rule's
practical consequence concrete: this exact sensitivity to winding
order is *why* every 3D mesh format (STL for 3D printing, OBJ for
CAD, and every polygon-based format in between) specifies triangle
vertices in a consistent order — get the order backward on even one
triangle and its normal points *into* the part instead of out of it,
which is a real, common source of inside-out shading or failed
slicing in 3D printing software.

---

### Manufacturing Application: Completing the Tool-Alignment Check

Lesson 4.2's `tool_lead_angle` function needed a `surface_normal`
vector as an input and simply received one, unexplained. Now the full
pipeline can be assembled: take a triangle from a machined surface's
CAD mesh, compute its actual normal via `triangle_normal`, and feed
that real, derived vector into the alignment check.

```python
import numpy as np
import math

def angle_between(u, v):
    """From Lesson 4.2."""
    cos_theta = np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))
    cos_theta = np.clip(cos_theta, -1.0, 1.0)
    return math.acos(cos_theta)

def tool_lead_angle(tool_axis, surface_normal):
    """From Lesson 4.2."""
    return angle_between(tool_axis, surface_normal)

# A mesh triangle representing a slightly sloped surface patch
p0, p1, p2 = (0, 0, 10), (5, 0, 10.5), (0, 5, 10.2)
surface_normal = triangle_normal(p0, p1, p2)
print(f"Computed surface normal: {surface_normal}")

tool_axis = np.array([0, 0, 1])   # tool pointing straight up
angle = tool_lead_angle(tool_axis, surface_normal)
print(f"Tool lead angle relative to actual mesh surface: {math.degrees(angle):.3f}°")

max_allowed = 10.0
print(f"Within {max_allowed}° limit: {math.degrees(angle) <= max_allowed}")
```

**Walkthrough.** Every function called here — `triangle_normal`,
`angle_between`, `tool_lead_angle` — was defined in this lesson or
Lesson 4.2; nothing new is introduced in this section beyond the
composition itself. That's the deliberate payoff of the two lessons
together: what looked like an unexplained input in 4.2 is now a
fully derived quantity, computed the same way a real CAM system
computes it from an actual triangulated surface model, and the whole
pipeline — mesh triangle → normal vector → angle check → pass/fail —
runs end to end with tools you built from first principles across
exactly two lessons.

---

## Connect the Pieces

Concrete trace: one triangle from a sloped machined surface.

1. **Two edge vectors**: `p1-p0` and `p2-p0`, both lying flat in the
   triangle's plane (Lesson 4.1's displacement reading of subtraction).
2. **Cross product**: `np.cross(edge1, edge2)` produces a vector
   perpendicular to both — by construction, perpendicular to the
   whole triangle.
3. **Normalize**: dividing by magnitude (Lesson 4.1) gives a clean
   unit normal, with direction fixed by the vertex winding order
   (right-hand rule).
4. **Feed into Lesson 4.2's pipeline**: `angle_between(tool_axis,
   surface_normal)`, with `np.clip` guarding the `arccos` call,
   produces the actual lead angle.
5. **Decision**: compared against a machine's tolerance, exactly as
   in Lesson 4.2 — except now every input in the chain is a
   real, derived geometric quantity rather than a given.

---

## Summary

**Cross product (formula):**
$\mathbf u\times\mathbf v=(u_2v_3-u_3v_2,\ u_3v_1-u_1v_3,\ u_1v_2-u_2v_1)$,
computed reliably via the $2\times2$ determinant-expansion mnemonic.

**Magnitude:** $\|\mathbf u\times\mathbf v\|=\|\mathbf u\|\|\mathbf
v\|\sin\theta$ = area of the parallelogram spanned by $\mathbf u,
\mathbf v$.

**Direction:** perpendicular to both inputs, via the right-hand rule;
**anti-commutative**: $\mathbf v\times\mathbf u=-(\mathbf u\times
\mathbf v)$.

**Surface normals:** cross two in-surface edge vectors, normalize —
vertex order determines which of the two perpendicular directions you
get.

**New Python/CS concepts:**
- `np.cross` — formally introduced (a companion to `np.dot` from
  Lesson 4.2)
- `np.allclose` — array-valued tolerance comparison, the vector
  counterpart to `math.isclose`
- Winding order as a real correctness concern in mesh/surface
  representations

---

## Problems

### Math

**1.** Compute $(2,1,-1)\times(1,-1,2)$ by hand.

<details><summary>Answer</summary>
$i: (1)(2)-(-1)(-1)=2-1=1$
$j: -[(2)(2)-(-1)(1)]=-[4+1]=-5$
$k: (2)(-1)-(1)(1)=-2-1=-3$
Result: $(1,-5,-3)$.
</details>

---

**2.** Find the area of the triangle with vertices $(0,0,0)$,
$(4,0,0)$, $(0,3,0)$.

<details><summary>Answer</summary>
Edge vectors $(4,0,0)$ and $(0,3,0)$. Cross product: $(0,0,12)$.
Parallelogram area = $12$; triangle area = half that = $6$.
</details>

---

**3.** Two vectors have $\|\mathbf u\|=5$, $\|\mathbf v\|=3$, and the
angle between them is $30°$. Find $\|\mathbf u\times\mathbf v\|$.

<details><summary>Answer</summary>
$\|\mathbf u\times\mathbf v\|=5\cdot3\cdot\sin30°=15\cdot0.5=7.5$.
</details>

---

### Code Challenges

**Challenge 1 — Cross product from scratch**

```python
import numpy as np

def cross(u, v):
    """Reimplement cross_product from the lesson, without using np.cross."""
    pass

def triangle_area(p0, p1, p2):
    """Area of a triangle given 3 vertices (3D points), via cross product."""
    pass

# --- tests: do not modify ---
u = np.array([1,0,0]); v = np.array([0,1,0])
assert np.allclose(cross(u,v), [0,0,1])
assert np.allclose(cross(v,u), [0,0,-1])   # anti-commutativity

area = triangle_area((0,0,0),(4,0,0),(0,3,0))
assert math.isclose(area, 6.0, abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Mesh normal batch processor**

```python
import numpy as np

def compute_mesh_normals(triangles):
    """
    triangles: list of (p0, p1, p2) vertex tuples.
    Return a list of unit normal vectors, one per triangle.
    Skip (omit from output) any degenerate triangle rather than raising.
    """
    pass

# --- tests: do not modify ---
tris = [
    ((0,0,0), (1,0,0), (0,1,0)),          # normal +Z
    ((0,0,0), (0,0,0), (1,0,0)),          # degenerate: repeated point
    ((0,0,0), (0,1,0), (1,0,0)),          # normal -Z (reversed winding)
]
normals = compute_mesh_normals(tris)
assert len(normals) == 2   # degenerate one skipped
assert np.allclose(normals[0], [0,0,1], atol=1e-9)
assert np.allclose(normals[1], [0,0,-1], atol=1e-9)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Full tool-clearance pipeline**

```python
import numpy as np
import math

def full_alignment_check(triangle, tool_axis, max_lead_deg):
    """
    Given a triangle (3 vertices), a tool axis vector, and a max
    allowed lead angle, compute the surface normal, the lead angle,
    and return (angle_degrees, within_limits).
    """
    pass

# --- tests: do not modify ---
tri = ((0,0,10), (5,0,10), (0,5,10))   # flat, horizontal
tool = np.array([0,0,1])
angle, ok = full_alignment_check(tri, tool, max_lead_deg=5)
assert math.isclose(angle, 0.0, abs_tol=1e-6)
assert ok

tri_sloped = ((0,0,0), (10,0,3), (0,10,0))   # noticeably sloped
angle2, ok2 = full_alignment_check(tri_sloped, tool, max_lead_deg=5)
assert angle2 > 5
assert not ok2
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that $\mathbf u\times\mathbf v$ is always orthogonal
to $\mathbf u$ (i.e., $(\mathbf u\times\mathbf v)\cdot\mathbf u=0$),
directly from the component formulas for the dot and cross products —
not just by citing the geometric description.

<details><summary>Answer</summary>
$$(\mathbf u\times\mathbf v)\cdot\mathbf u = (u_2v_3-u_3v_2)u_1 + (u_3v_1-u_1v_3)u_2 + (u_1v_2-u_2v_1)u_3$$
Expand:
$$= u_1u_2v_3 - u_1u_3v_2 + u_2u_3v_1 - u_1u_2v_3 + u_1u_3v_2 - u_2u_3v_1$$
Every term cancels with an exact opposite: $u_1u_2v_3$ cancels
$-u_1u_2v_3$, $-u_1u_3v_2$ cancels $u_1u_3v_2$, $u_2u_3v_1$ cancels
$-u_2u_3v_1$. Total: $0$. $\blacksquare$ This confirms algebraically,
term by term, what the geometric definition asserted by
construction — the cross product formula wasn't just designed to
"probably" be perpendicular; it's exactly and provably perpendicular
to both inputs, for every possible $\mathbf u, \mathbf v$.
</details>
