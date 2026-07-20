# Stage 4, Lesson 4.2 — Dot Product, Projections, and the Angle Between Vectors
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 3.3 used `np.dot` inside the ray-reflection formula, with an
explicit note that its full geometric meaning was still a lesson
away. This is that lesson. The **dot product** takes two vectors and
returns a single number — not another vector — and that single number
turns out to encode two of the most useful facts about how two
vectors relate: **how much they point in the same direction**, and,
by extension, **the angle between them**. From those two facts follow
orthogonality testing (are these vectors perpendicular?), vector
projection (how much of this vector lies along that direction?), and
the physics definition of work. By the end of this lesson you can
compute a dot product both algebraically and geometrically, find the
angle between any two vectors in $\mathbb{R}^n$, test for
orthogonality, project one vector onto another, and apply all of this
to a concrete 5-axis machining problem: checking whether a cutting
tool's axis is properly aligned with a surface.

---

## Historical Context

The dot product emerged from the same 1880s Gibbs–Heaviside
simplification of Hamilton's quaternions mentioned in Lesson 4.1 —
Hamilton's quaternion multiplication, applied to two purely "vector"
quaternions, naturally produces two separate pieces: a scalar part
(what became the dot product) and a vector part (what became the
cross product, Lesson 4.3). Gibbs split these into two independent,
simpler operations because 19th-century physicists needed the scalar
piece constantly — most obviously for **work** in mechanics, defined
as force dotted with displacement — without wanting to carry the full
quaternion apparatus along for the ride. The projection and
angle-finding uses of the dot product follow directly and were
understood essentially immediately once the operation was isolated;
what's changed since is mainly scale — the same formula now runs
routinely on vectors with thousands of components in machine learning
similarity searches, a use Gibbs could not have anticipated but which
is algebraically identical to a 19th-century physicist computing work
on a lever.

---

## What You Need To Know First

- **Vectors in $\mathbb{R}^n$, magnitude** — Lesson 4.1.
- **Law of Cosines** — Lesson 2.7. Used directly to derive the
  geometric dot product formula.
- **`np.dot`, informally** — Lesson 3.3 (ray reflection) and Lesson
  3.4 (`np.linalg.norm`, which is secretly a dot product of a vector
  with itself). This lesson gives the operation its full derivation.

---

## The Lesson

### The Dot Product, Algebraically

For $\mathbf{u}=(u_1,\dots,u_n)$ and $\mathbf{v}=(v_1,\dots,v_n)$ in
$\mathbb{R}^n$:

$$\mathbf{u}\cdot\mathbf{v} = u_1v_1+u_2v_2+\cdots+u_nv_n = \sum_{i=1}^n u_iv_i$$

Multiply corresponding components, sum the results — the exact
mechanical recipe used without derivation back in Lesson 3.3. Note
the result is a single **scalar** (an ordinary number), never a
vector — worth stating explicitly since every other vector operation
in Lesson 4.1 returned another vector.

**Hand-worked example:** $\mathbf{u}=(2,-1,3)$,
$\mathbf{v}=(4,0,-2)$.

$$\mathbf{u}\cdot\mathbf{v} = (2)(4)+(-1)(0)+(3)(-2) = 8+0-6=2$$

**A fact worth noticing immediately:** $\mathbf{v}\cdot\mathbf{v} =
v_1^2+\cdots+v_n^2 = \|\mathbf{v}\|^2$ — dotting a vector with itself
gives its squared magnitude. `np.linalg.norm` in Lesson 4.1 was
secretly computing $\sqrt{\mathbf{v}\cdot\mathbf{v}}$ the entire time.

```python
import numpy as np

u = np.array([2, -1, 3])
v = np.array([4, 0, -2])

print(f"u · v = {np.dot(u, v)}")
print(f"u · u = {np.dot(u, u)}, ||u||² = {np.linalg.norm(u)**2}")
```

**Walkthrough.** `np.dot(u, v)` is the deliberate, from-scratch
introduction of the function used ahead of schedule twice already —
it implements exactly the sum-of-products formula above. Confirming
`np.dot(u, u) == np.linalg.norm(u)**2` numerically is the same
verify-a-claimed-identity habit used throughout Stage 3, now applied
to a relationship between two functions rather than a geometric
property.

---

### The Dot Product, Geometrically

There is a second formula for the same quantity:

$$\mathbf{u}\cdot\mathbf{v} = \|\mathbf{u}\|\,\|\mathbf{v}\|\cos\theta$$

where $\theta$ is the angle between the two vectors. That these two
completely different-looking formulas — one pure arithmetic on
components, one pure geometry involving lengths and an angle — always
agree is not obvious on sight, so derive it rather than take it on
faith.

**Derivation, via the Law of Cosines (Lesson 2.7).** Place
$\mathbf{u}$ and $\mathbf{v}$ tail-to-tail; the third side of the
resulting triangle is $\mathbf{u}-\mathbf{v}$, and the angle between
$\mathbf{u}$ and $\mathbf{v}$ at the shared tail is $\theta$. The Law
of Cosines gives:

$$\|\mathbf{u}-\mathbf{v}\|^2 = \|\mathbf{u}\|^2+\|\mathbf{v}\|^2-2\|\mathbf{u}\|\|\mathbf{v}\|\cos\theta$$

Expand the left side using $\|\mathbf{w}\|^2=\mathbf{w}\cdot\mathbf{w}$
(just established above) and the algebraic dot product's distribution
over subtraction (a direct consequence of the sum-of-products
definition, the same way ordinary multiplication distributes over
addition):

$$\|\mathbf{u}-\mathbf{v}\|^2 = (\mathbf{u}-\mathbf{v})\cdot(\mathbf{u}-\mathbf{v}) = \mathbf{u}\cdot\mathbf{u} - 2\,\mathbf{u}\cdot\mathbf{v} + \mathbf{v}\cdot\mathbf{v} = \|\mathbf{u}\|^2-2\,\mathbf{u}\cdot\mathbf{v}+\|\mathbf{v}\|^2$$

Set the two expressions for $\|\mathbf{u}-\mathbf{v}\|^2$ equal and
cancel the matching $\|\mathbf{u}\|^2+\|\mathbf{v}\|^2$ terms from
both sides:

$$-2\,\mathbf{u}\cdot\mathbf{v} = -2\|\mathbf{u}\|\|\mathbf{v}\|\cos\theta \quad\Longrightarrow\quad \mathbf{u}\cdot\mathbf{v}=\|\mathbf{u}\|\|\mathbf{v}\|\cos\theta$$

Both formulas for the dot product are the same quantity, viewed two
ways.

**Finding the angle between two vectors.** Solving for $\theta$:

$$\theta = \arccos\left(\frac{\mathbf{u}\cdot\mathbf{v}}{\|\mathbf{u}\|\|\mathbf{v}\|}\right)$$

```python
import numpy as np
import math

def angle_between(u, v):
    """
    Angle (radians) between two vectors, using the geometric dot
    product formula solved for theta.
    """
    cos_theta = np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))
    # Floating-point error can push cos_theta a hair outside [-1, 1],
    # which math.acos rejects outright -- clip it back into range first.
    cos_theta = np.clip(cos_theta, -1.0, 1.0)
    return math.acos(cos_theta)

u = np.array([1, 0, 0])
v = np.array([1, 1, 0])
theta = angle_between(u, v)
print(f"Angle between {u} and {v}: {math.degrees(theta):.4f}°")

# A case where floating-point drift genuinely happens: two identical vectors
w = np.array([0.1, 0.2, 0.3])
theta_same = angle_between(w, w)
print(f"Angle between a vector and itself: {math.degrees(theta_same):.10f}°")
```

**Walkthrough.** `np.clip(cos_theta, -1.0, 1.0)` is a first
appearance of `np.clip`, and it's here to fix a genuine, reproducible
bug: mathematically, $\cos\theta$ for the angle between any vector
and itself is exactly $1$, but floating-point arithmetic computing
`np.dot(w,w) / (norm(w)*norm(w))` can land at `1.0000000000000002` —
a hair above 1 due to rounding — which `math.acos` rejects with a
`ValueError` because arccos is only defined on $[-1,1]$. `np.clip`
forces any such stray value back to exactly the nearest boundary
before `math.acos` ever sees it — a small defensive step that matters
in practice, not a hypothetical concern, which is why the second test
case (a vector against itself) is included specifically to surface
it.

---

### Orthogonality

Two vectors are **orthogonal** (perpendicular, generalized to any
$\mathbb{R}^n$) exactly when their dot product is zero — directly
from the geometric formula, since $\cos(90°)=0$ makes
$\mathbf{u}\cdot\mathbf{v}=\|\mathbf{u}\|\|\mathbf{v}\|\cdot0=0$
regardless of the vectors' lengths.

$$\mathbf{u}\perp\mathbf{v} \iff \mathbf{u}\cdot\mathbf{v}=0$$

**Hand-worked example:** are $(3,4)$ and $(4,-3)$ orthogonal?
$3(4)+4(-3)=12-12=0$. Yes.

```python
def is_orthogonal(u, v, tol=1e-9):
    return abs(np.dot(u, v)) < tol

print(is_orthogonal(np.array([3, 4]), np.array([4, -3])))    # True
print(is_orthogonal(np.array([1, 0, 0]), np.array([0, 1, 1])))  # True
print(is_orthogonal(np.array([1, 1]), np.array([1, 0])))     # False
```

---

### Vector Projection

**The question:** given two vectors $\mathbf{u}$ and $\mathbf{v}$,
how much of $\mathbf{u}$ points in the direction of $\mathbf{v}$?
This is the **projection** of $\mathbf{u}$ onto $\mathbf{v}$ — the
shadow $\mathbf{u}$ would cast on the line through $\mathbf{v}$ if
light shone perpendicular to that line.

**Scalar projection** (a number — how far along $\mathbf{v}$'s
direction):

$$\text{comp}_{\mathbf v}\mathbf u = \frac{\mathbf u\cdot\mathbf v}{\|\mathbf v\|}$$

**Vector projection** (an actual vector — the shadow itself, lying
along $\mathbf{v}$):

$$\text{proj}_{\mathbf v}\mathbf u = \frac{\mathbf u\cdot\mathbf v}{\|\mathbf v\|^2}\,\mathbf v$$

This is exactly the same idea already used, unnamed, twice in Stage
3: Lesson 3.3's ray-reflection formula
$2(\mathbf d\cdot\hat{\mathbf t})\hat{\mathbf t}$ and Lesson 3.9's
point-reflection formula both compute a projection onto a unit vector
as their first step (when $\mathbf v$ is already a unit vector,
$\|\mathbf v\|^2=1$ and the projection formula simplifies to
$(\mathbf u\cdot\hat{\mathbf v})\hat{\mathbf v}$ — precisely what
those two formulas used).

```python
import numpy as np

def scalar_projection(u, v):
    return np.dot(u, v) / np.linalg.norm(v)

def vector_projection(u, v):
    return (np.dot(u, v) / np.dot(v, v)) * v

u = np.array([4, 3])
v = np.array([5, 0])   # projecting onto the x-axis direction

comp = scalar_projection(u, v)
proj = vector_projection(u, v)
print(f"Scalar projection of u onto v: {comp}")
print(f"Vector projection of u onto v: {proj}")

# The leftover piece, u minus its projection, should be ORTHOGONAL to v
leftover = u - proj
print(f"Leftover (u - proj): {leftover}")
print(f"Leftover ⊥ v: {is_orthogonal(leftover, v)}")
```

Output:

```
Scalar projection of u onto v: 4.0
Vector projection of u onto v: [4. 0.]
Leftover (u - proj): [0. 3.]
Leftover ⊥ v: True
```

**Walkthrough.** `(np.dot(u, v) / np.dot(v, v)) * v` computes the
scalar coefficient $\frac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot
\mathbf v}$ first, then scales `v` by it — direct translation of the
boxed formula, using `np.dot(v,v)` rather than
`np.linalg.norm(v)**2` (the two are identical, per the earlier
identity, and `np.dot(v,v)` avoids a redundant square-root-then-
square round trip). The **leftover check** — confirming
$\mathbf u-\text{proj}_{\mathbf v}\mathbf u$ is genuinely orthogonal
to $\mathbf v$ — is a real geometric fact worth verifying rather than
assuming: it confirms that projection really does split $\mathbf u$
cleanly into "the part along $\mathbf v$" and "the part perpendicular
to $\mathbf v$," which is the property that makes projection useful
in the first place, not just a formula that happens to have that name.

---

### Manufacturing Application: Tool-Axis Alignment Checking

In 5-axis machining, a surface at any given point has a **normal
vector** — a vector perpendicular to the surface at that point,
pointing away from the material. For many machining strategies (flank
milling, certain finishing passes), the cutting tool's axis needs to
be held at a controlled angle *relative to that surface normal* — for
example, tilted a specific lead/lag angle away from straight-on, to
achieve the right cutting geometry and avoid the tool's non-cutting
centre dragging on the material. Checking that angle is a direct
application of `angle_between`.

```python
import numpy as np
import math

def tool_lead_angle(tool_axis, surface_normal):
    """
    Compute the angle between a tool's axis vector and the local
    surface normal. 0° means the tool is pointing straight along the
    normal (perpendicular to the surface, the most common case);
    larger angles mean the tool is tilted.
    """
    return angle_between(tool_axis, surface_normal)

# A tool tilted slightly forward, cutting a surface whose local normal
# points mostly upward with a slight lean
tool_axis = np.array([0.1, 0.0, 0.995])
surface_normal = np.array([0.0, 0.0, 1.0])

lead_angle = tool_lead_angle(tool_axis, surface_normal)
print(f"Tool lead angle: {math.degrees(lead_angle):.3f}°")

# Check against a machine's allowed range, e.g. max 15° lead
max_allowed = 15.0
within_limits = math.degrees(lead_angle) <= max_allowed
print(f"Within {max_allowed}° limit: {within_limits}")

# A second check: is the tool nearly perpendicular to the surface (within 1°)?
nearly_perpendicular = math.degrees(lead_angle) < 1.0
print(f"Nearly perpendicular to surface: {nearly_perpendicular}")
```

**Walkthrough.** This function is a one-line wrapper around
`angle_between`, deliberately: the entire point is that no new
mathematics is needed for a genuine 5-axis machining check — it's the
identical calculation as the earlier abstract angle-between-vectors
example, applied to physically meaningful vectors instead of
arbitrary ones. This is worth noticing as a pattern in itself: a
large fraction of "new" engineering calculations turn out to be an
existing piece of math wearing different variable names, and
recognizing that is often more valuable than learning another formula.

---

## Connect the Pieces

Concrete trace: checking whether a tilted 5-axis tool stays within a
15° lead-angle limit.

1. **Algebraic dot product**: `np.dot(tool_axis, surface_normal)`
   combines the two vectors' components into one number.
2. **Geometric meaning**: dividing by both magnitudes and taking
   `arccos` recovers the actual angle between them — the same
   derivation, run via the Law of Cosines, that ties the algebraic and
   geometric dot product formulas together.
3. **Clipping guard**: `np.clip` protects the calculation from a
   `ValueError` on the (frequent, in real machining data) case where
   the tool is very nearly perpendicular to the surface and
   floating-point drift could otherwise push the cosine just past 1.
4. **Decision**: the resulting angle, compared against the machine's
   allowed range, becomes a pass/fail check a real CAM post-processor
   would run automatically on every single toolpath point before
   sending the program to the machine.

---

## Summary

**Algebraic dot product:** $\mathbf u\cdot\mathbf v=\sum u_iv_i$ —
a scalar.

**Geometric dot product:** $\mathbf u\cdot\mathbf v=\|\mathbf
u\|\|\mathbf v\|\cos\theta$ — derived from the Law of Cosines
(Lesson 2.7).

**Angle between vectors:** $\theta=\arccos\left(\dfrac{\mathbf
u\cdot\mathbf v}{\|\mathbf u\|\|\mathbf v\|}\right)$; clip the cosine
to $[-1,1]$ before calling `arccos` to guard against floating-point
drift.

**Orthogonality:** $\mathbf u\cdot\mathbf v=0 \iff \mathbf u\perp
\mathbf v$.

**Vector projection:** $\text{proj}_{\mathbf v}\mathbf u=
\dfrac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\mathbf v$ —
the same computation used unnamed in Lessons 3.3 and 3.9's reflection
formulas.

**New Python/CS concepts:**
- `np.dot` — formally introduced (used ahead of schedule in Lesson 3.3)
- `np.clip` — guarding against floating-point drift outside a valid
  domain, before calling a function (like `arccos`) that would reject it

---

## Problems

### Math

**1.** Find $\mathbf u\cdot\mathbf v$ and the angle between
$\mathbf u=(1,1,1)$ and $\mathbf v=(1,0,0)$.

<details><summary>Answer</summary>
$\mathbf u\cdot\mathbf v=1$. $\|\mathbf u\|=\sqrt3$, $\|\mathbf
v\|=1$. $\cos\theta=1/\sqrt3\approx0.577$.
$\theta=\arccos(0.577)\approx54.74°$.
</details>

---

**2.** Find a vector orthogonal to $(2,3)$.

<details><summary>Answer</summary>
Swap components and negate one: $(-3,2)$ (or any scalar multiple).
Check: $2(-3)+3(2)=-6+6=0$. ✓
</details>

---

**3.** Find the vector projection of $(6,2)$ onto $(3,4)$.

<details><summary>Answer</summary>
$\mathbf u\cdot\mathbf v=18+8=26$. $\mathbf v\cdot\mathbf v=9+16=25$.
$\text{proj}=\frac{26}{25}(3,4)=(3.12,\ 4.16)$.
</details>

---

### Code Challenges

**Challenge 1 — Dot product toolkit**

```python
import numpy as np
import math

def dot(u, v):
    """Compute the dot product without using np.dot -- sum of products."""
    pass

def angle_deg(u, v):
    """Angle between two vectors, in degrees, with clipping for safety."""
    pass

def is_orthogonal(u, v, tol=1e-9):
    pass

def vector_projection(u, v):
    pass

# --- tests: do not modify ---
u = np.array([2, -1, 3])
v = np.array([4, 0, -2])
assert dot(u, v) == 2

assert math.isclose(angle_deg(np.array([1,0]), np.array([0,1])), 90.0, abs_tol=1e-6)
assert is_orthogonal(np.array([3,4]), np.array([4,-3]))
assert not is_orthogonal(np.array([1,1]), np.array([1,0]))

proj = vector_projection(np.array([4,3]), np.array([5,0]))
assert np.allclose(proj, [4, 0])
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Tool alignment checker**

```python
import numpy as np
import math

def check_tool_alignment(tool_axis, surface_normal, max_lead_deg):
    """
    Return (angle_degrees, within_limits: bool).
    """
    pass

# --- tests: do not modify ---
tool = np.array([0.0, 0.0, 1.0])
normal = np.array([0.0, 0.0, 1.0])
angle, ok = check_tool_alignment(tool, normal, max_lead_deg=15)
assert math.isclose(angle, 0.0, abs_tol=1e-6)
assert ok

tilted = np.array([0.5, 0.0, 0.866])   # ~30 degrees off
angle2, ok2 = check_tool_alignment(tilted, normal, max_lead_deg=15)
assert angle2 > 15
assert not ok2
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Cosine similarity (ML forward reference)**

```python
import numpy as np

def cosine_similarity(a, b):
    """
    Cosine similarity: cos(theta) between two vectors, used throughout
    machine learning to compare feature vectors regardless of their
    magnitude (Stage 10 forward reference). Returns a value in [-1, 1].
    """
    pass

# --- tests: do not modify ---
# Identical direction, different magnitude -> similarity 1
a = np.array([1, 2, 3])
b = np.array([2, 4, 6])
assert math.isclose(cosine_similarity(a, b), 1.0, abs_tol=1e-9)

# Orthogonal -> similarity 0
c = np.array([1, 0])
d = np.array([0, 1])
assert math.isclose(cosine_similarity(c, d), 0.0, abs_tol=1e-9)

# Opposite direction -> similarity -1
e = np.array([1, 1])
f = np.array([-1, -1])
assert math.isclose(cosine_similarity(e, f), -1.0, abs_tol=1e-9)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that vector projection is **idempotent** in the
following sense: projecting $\text{proj}_{\mathbf v}\mathbf u$ onto
$\mathbf v$ a second time gives back the exact same vector (i.e.,
once a vector already lies along $\mathbf v$, projecting it onto
$\mathbf v$ again changes nothing).

<details><summary>Answer</summary>
Let $\mathbf p = \text{proj}_{\mathbf v}\mathbf u =
\frac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\mathbf v = k\mathbf v$
where $k=\frac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot\mathbf v}$ is a
scalar. Project $\mathbf p$ onto $\mathbf v$:
$$\text{proj}_{\mathbf v}\mathbf p = \frac{\mathbf p\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\mathbf v = \frac{(k\mathbf v)\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\mathbf v = \frac{k(\mathbf v\cdot\mathbf v)}{\mathbf v\cdot\mathbf v}\mathbf v = k\mathbf v = \mathbf p$$
using the fact that dot product is linear in each argument (a scalar
multiple factors straight out, the same distribution property used
in this lesson's Law-of-Cosines derivation). $\blacksquare$ This
matches geometric intuition directly: $\mathbf p$ already lies
exactly along $\mathbf v$'s direction, so "casting its shadow" onto
that same direction changes nothing — it's already there.
</details>
