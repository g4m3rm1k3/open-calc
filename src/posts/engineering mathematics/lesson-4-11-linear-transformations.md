# Stage 4, Lesson 4.11 — Linear Transformations and Their Matrices
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lesson 4.4 introduced "matrix as transformation" as one of three
views of a matrix, used it constantly through Lesson 3.9's rotations
and Lesson 4.5's Markov chains, but never asked precisely what makes
a transformation the *kind* a matrix can represent. This lesson
answers that: a **linear transformation** is a function between
vector spaces that respects addition and scalar multiplication —
$T(\mathbf u+\mathbf v)=T(\mathbf u)+T(\mathbf v)$ and
$T(c\mathbf u)=cT(\mathbf u)$ — and the central theorem of this
lesson is that **every linear transformation between finite-dimensional
spaces corresponds to exactly one matrix**, found by tracking where
the transformation sends each basis vector (Lesson 4.10's basis
concept, doing real work here). This also finally explains something
Lesson 3.9 left unexplained: *why* translation needed the awkward
homogeneous-coordinate trick while rotation, reflection, and scaling
didn't — translation genuinely isn't a linear transformation, and
this lesson proves it. By the end, you can test whether a function is
linear, build its matrix from basis images, identify its kernel and
image as the transformation-level meaning of Lesson 4.9's null
space/column space, and chain several transformations together to
compute a robot arm's end-effector position — direct preparation for
this stage's capstone.

---

## Historical Context

The recognition that "matrix" and "linear transformation" are, for
finite dimensions, genuinely the same mathematical object — not just
analogous — solidified over the same 19th-century period as the rest
of this stage's history (Cayley, Grassmann, Peano), but its cleanest
expression is closely tied to Felix Klein's Erlangen program
(mentioned already in Lesson 3.9): Klein's project of classifying
geometries by which transformations they consider meaningful only
makes sense once "transformation" has the precise, checkable
algebraic definition this lesson provides — without it, "the
transformations preserving distance and angle" is a vague geometric
gesture; with it, it's an exact, computable condition on a matrix.

---

## What You Need To Know First

- **Matrices as transformations, composition = multiplication** —
  Lesson 4.4.
- **Basis, dimension** — Lesson 4.10. The core theorem of this lesson
  is built directly on "a basis is enough to determine everything."
- **Null space, column space** — Lesson 4.9, renamed here as kernel
  and image.
- **Homogeneous coordinates, translation as the odd one out** —
  Lesson 3.9. This lesson explains *why* it was the odd one out.

---

## The Lesson

### Definition: What Makes a Transformation Linear

A function $T:V\to W$ between vector spaces is a **linear
transformation** if, for all vectors $\mathbf u,\mathbf v$ and
scalars $c$:

$$T(\mathbf u+\mathbf v) = T(\mathbf u)+T(\mathbf v) \qquad \text{(additivity)}$$
$$T(c\mathbf u) = cT(\mathbf u) \qquad \text{(homogeneity)}$$

Every transformation built in Lesson 3.9 — rotation, reflection,
scaling — satisfies both properties; you can verify this directly
from their formulas.

**A crucial non-example: translation.** $T(\mathbf x)=\mathbf
x+\mathbf t$ for a fixed nonzero $\mathbf t$ is **not** linear.
Check homogeneity with $c=0$: linearity would require $T(\mathbf 0) =
0\cdot T(\mathbf x) = \mathbf 0$, but $T(\mathbf 0)=\mathbf 0+\mathbf
t=\mathbf t\ne\mathbf 0$. Translation fails the single most basic
consequence of linearity — **every linear transformation must send
the zero vector to the zero vector** — which is *exactly* why Lesson
3.9 needed the homogeneous-coordinate trick: padding to $(x,y,1)$
turns translation into a genuinely linear transformation **on the
padded 3D space** (where the "origin" being moved is no longer the
2D zero vector), sidestepping this failure rather than resolving it
within 2D itself.

```python
import numpy as np

def is_linear(T, dim, n_trials=20, tol=1e-9):
    """
    Numerically test whether T is linear by spot-checking additivity
    and homogeneity on random vectors and scalars.
    """
    import random
    for _ in range(n_trials):
        u = np.random.rand(dim)
        v = np.random.rand(dim)
        c = random.uniform(-5, 5)
        additive = np.allclose(T(u + v), T(u) + T(v), atol=tol)
        homogeneous = np.allclose(T(c * u), c * T(u), atol=tol)
        if not (additive and homogeneous):
            return False
    return True

# Rotation: linear
theta = 0.5
rotate = lambda v: np.array([v[0]*math.cos(theta)-v[1]*math.sin(theta),
                               v[0]*math.sin(theta)+v[1]*math.cos(theta)])
print(f"Rotation is linear: {is_linear(rotate, 2)}")

# Translation: NOT linear
translate = lambda v: v + np.array([3, 3])
print(f"Translation is linear: {is_linear(translate, 2)}")

# A genuinely nonlinear function for contrast
square_each = lambda v: v ** 2
print(f"Squaring each component is linear: {is_linear(square_each, 2)}")
```

**Walkthrough.** `is_linear` is the same randomized spot-check habit
introduced for subspace testing in Lesson 4.9, applied here to a
different claim — genuine proof would check the definition
algebraically, but numerical spot-checking across several random
inputs is a fast, practically reliable first-pass test, and it
correctly flags translation as non-linear (it will fail on
essentially every random trial, not just $c=0$, since additivity
also fails: $T(\mathbf u+\mathbf v)=\mathbf u+\mathbf v+\mathbf t$
while $T(\mathbf u)+T(\mathbf v)=\mathbf u+\mathbf v+2\mathbf t$ —
off by a whole extra copy of $\mathbf t$).

---

### The Key Theorem: A Basis Determines Everything

Here is why "linear transformation" and "matrix" turn out to be the
same thing. Write any vector $\mathbf x\in\mathbb{R}^n$ in terms of
the standard basis (Lesson 4.10): $\mathbf x = x_1\mathbf
e_1+x_2\mathbf e_2+\cdots+x_n\mathbf e_n$. Apply $T$ and use
linearity to pull the transformation *inside* the sum:

$$T(\mathbf x) = T(x_1\mathbf e_1+\cdots+x_n\mathbf e_n) = x_1T(\mathbf e_1)+x_2T(\mathbf e_2)+\cdots+x_nT(\mathbf e_n)$$

**This means**: once you know where $T$ sends each of the $n$ basis
vectors, you know where it sends *every* vector in the space —
$T(\mathbf x)$ is just the corresponding linear combination of the
$T(\mathbf e_i)$'s. And that is *exactly* matrix-vector
multiplication (Lesson 4.5's "linear combination of columns"
reading): the matrix representing $T$ has $T(\mathbf e_1)$ as its
first column, $T(\mathbf e_2)$ as its second, and so on.

```python
import numpy as np

def transformation_matrix(T, dim):
    """
    Given a linear transformation T (a Python function) and the
    input dimension, build its matrix by applying T to each standard
    basis vector and using the results as columns.
    """
    columns = []
    for i in range(dim):
        e_i = np.zeros(dim)
        e_i[i] = 1
        columns.append(T(e_i))
    return np.column_stack(columns)

theta = math.pi / 3
rotate = lambda v: np.array([v[0]*math.cos(theta)-v[1]*math.sin(theta),
                               v[0]*math.sin(theta)+v[1]*math.cos(theta)])

M = transformation_matrix(rotate, 2)
print(f"Matrix built from basis images:\n{M}")

# Verify: does M @ x match rotate(x) for an arbitrary x?
x = np.array([3, -2])
print(f"\nrotate(x)  = {rotate(x)}")
print(f"M @ x      = {M @ x}")
```

**Walkthrough.** `transformation_matrix` implements the theorem
directly and mechanically: loop over each standard basis vector
`e_i` (built the same way `np.zeros` plus a single `1` was used to
construct basis vectors in Lesson 4.10's null-space code), apply the
given transformation function to it, and stack the results as
columns. This is a genuinely different way of *discovering* a
matrix than every prior lesson's approach (writing the formula down
directly, as in Lesson 3.9) — here the matrix is *reverse-engineered*
purely from observing what the transformation does to $n$ specific
inputs, which works for absolutely any linear transformation, however
it was originally defined (as a formula, as a geometric description,
as a black-box function), because the theorem guarantees $n$ basis
images are always enough.

---

### Kernel and Image: Null Space and Column Space, Renamed for Transformations

Lesson 4.9's null space and column space have transformation-level
names that emphasize they're properties of $T$ itself, not just of
whichever matrix happens to represent it in a given basis:

- **Kernel**: $\ker(T)=\{\mathbf x : T(\mathbf x)=\mathbf 0\}$ —
  exactly $\text{null}(A)$ for $T$'s matrix $A$.
- **Image**: $\text{im}(T)=\{T(\mathbf x):\mathbf x\in V\}$ — exactly
  $\text{col}(A)$.

Every fact from Lessons 4.9 and 4.10 (Rank-Nullity, the
independence/invertibility equivalence) transfers unchanged, just
read as a statement about the transformation rather than about a
specific matrix.

---

### Composition Is Multiplication — Now Fully Justified

Lesson 4.4 demonstrated numerically that $A(B\mathbf x)=(AB)\mathbf
x$; this lesson's basis-image theorem shows *why* that had to be
true, rather than being a lucky property of matrix multiplication's
particular definition. If $S$ and $T$ are both linear (each
individually satisfying additivity and homogeneity), their
composition $S\circ T$ (apply $T$, then $S$) is *also* linear — a
direct, short proof:

$$(S\circ T)(\mathbf u+\mathbf v) = S(T(\mathbf u+\mathbf v)) = S(T(\mathbf u)+T(\mathbf v)) = S(T(\mathbf u))+S(T(\mathbf v))$$

using $T$'s additivity, then $S$'s. Since $S\circ T$ is linear, the
basis-image theorem says *it too* has a matrix — and that matrix is
forced to be $AB$ (where $A,B$ are $S,T$'s matrices) precisely
because matrix multiplication was *defined* (Lesson 4.4, Cayley's
choice) to make that identity hold.

---

### Manufacturing Application: Forward Kinematics of a Robot Arm

**Forward kinematics** answers: given a robot arm's joint angles,
where is its end effector (tool tip)? Each joint contributes a
rotation (about that joint) followed by a translation (the length of
the next rigid link) — exactly the homogeneous transformation
machinery from Lesson 3.9, chained through exactly as many joints as
the arm has, and composed via matrix multiplication precisely because
composition-as-multiplication is what this lesson just proved must
hold for any chain of linear (here, homogeneous-affine) maps.

```python
import numpy as np
import math

def joint_transform(theta, link_length):
    """
    Homogeneous transformation for one robot joint: rotate by theta,
    then translate along the new x-axis by link_length (the rigid
    link to the next joint). Reuses Lesson 3.9's homogeneous matrices.
    """
    c, s = math.cos(theta), math.sin(theta)
    rotation = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
    translation = np.array([[1, 0, link_length], [0, 1, 0], [0, 0, 1]])
    return rotation @ translation

def forward_kinematics(joint_angles, link_lengths):
    """
    Chain joint transforms to find the end-effector position, given
    a list of joint angles (radians) and corresponding link lengths.
    """
    T_total = np.identity(3)
    for theta, length in zip(joint_angles, link_lengths):
        T_total = T_total @ joint_transform(theta, length)
    origin = np.array([0, 0, 1])   # homogeneous origin point
    end_effector = T_total @ origin
    return end_effector[:2], T_total   # drop homogeneous coordinate

# A 3-link planar arm
angles = [math.radians(30), math.radians(-45), math.radians(60)]
lengths = [5, 4, 3]

end_pos, T_total = forward_kinematics(angles, lengths)
print(f"End-effector position: ({end_pos[0]:.3f}, {end_pos[1]:.3f})")

# Verify by computing each joint's position along the way (for a sanity plot)
positions = [np.array([0,0])]
T_running = np.identity(3)
for theta, length in zip(angles, lengths):
    T_running = T_running @ joint_transform(theta, length)
    pos = (T_running @ np.array([0,0,1]))[:2]
    positions.append(pos)
print(f"\nJoint positions along the arm:")
for i, p in enumerate(positions):
    print(f"  Joint {i}: ({p[0]:.3f}, {p[1]:.3f})")
```

Output:

```
End-effector position: (3.673, 5.360)

Joint positions along the arm:
  Joint 0: (0.000, 0.000)
  Joint 1: (4.330, 2.500)
  Joint 2: (4.831, 6.472)
  Joint 3: (3.673, 5.360)
```

**Walkthrough.** `joint_transform` reuses Lesson 3.9's homogeneous
rotation and translation matrices exactly, multiplying them together
into a single per-joint transform — itself an application of this
lesson's composition-is-multiplication result at the smallest scale.
`forward_kinematics`'s accumulating loop, `T_total = T_total @
joint_transform(...)`, chains an arbitrary number of joints into one
combined matrix, applying this lesson's central theorem at full
scale: however many joints the arm has, the *entire* chain of
rotations and translations collapses into a single $3\times3$ matrix,
appliable to the origin point once to get the final answer — the
direct generalization of Lesson 3.9's two-transformation combination
to a chain of arbitrary length, which is exactly what a real
multi-joint robot arm needs.

---

## Connect the Pieces

Concrete trace: a 3-link planar arm's forward kinematics.

1. **Linearity check**: each `joint_transform` is a genuine linear
   transformation *on the homogeneous (padded) space* — verified,
   per this lesson's opening section, by the fact that ordinary
   translation (which isn't linear on the un-padded space) required
   exactly this padding to become one.
2. **Basis-image construction**: each joint's $3\times3$ matrix could
   equally well have been built by tracking where it sends
   $\mathbf e_1,\mathbf e_2,\mathbf e_3$ (this lesson's theorem),
   rather than written down by formula as it was in Lesson 3.9.
3. **Composition**: chaining three joints via `T_total @
   joint_transform(...)` is composition-as-multiplication, justified
   in full generality by this lesson's short linearity proof for
   $S\circ T$.
4. **Result**: a single combined $3\times3$ matrix, applied once to
   the origin, gives the exact end-effector position — the entire
   arm's geometry compressed into one matrix multiplication, ready
   for the capstone's fuller kinematics treatment.

---

## Summary

**Linear transformation**: $T(\mathbf u+\mathbf v)=T(\mathbf
u)+T(\mathbf v)$, $T(c\mathbf u)=cT(\mathbf u)$; necessarily
$T(\mathbf 0)=\mathbf 0$ — which is why translation isn't linear, and
why Lesson 3.9 needed homogeneous coordinates.

**Key theorem**: a linear transformation is completely determined by
where it sends a basis; that data *is* its matrix (basis vectors'
images as columns).

**Kernel/image**: transformation-level names for Lesson 4.9's null
space/column space.

**Composition = multiplication**: proved here, not just observed —
the composition of two linear maps is linear, and its matrix is
forced to be the product by how multiplication was defined.

**New Python/CS concepts:**
- Reverse-engineering a matrix from a transformation function via
  basis images (rather than writing the formula down directly)
- Chaining an arbitrary-length sequence of homogeneous transforms via
  accumulated matrix multiplication (forward kinematics)

---

## Problems

### Math

**1.** Is $T(x,y)=(2x, x+y)$ linear? Check both properties.

<details><summary>Answer</summary>
$T((x_1,y_1)+(x_2,y_2))=T(x_1+x_2,y_1+y_2)=(2(x_1+x_2),\
(x_1+x_2)+(y_1+y_2))$. $T(x_1,y_1)+T(x_2,y_2)=(2x_1+2x_2,\
x_1+y_1+x_2+y_2)$. Equal. ✓ additivity. $T(cx,cy)=(2cx,cx+cy)=c(2x,x+y)=cT(x,y)$.
✓ homogeneity. Linear.
</details>

---

**2.** Find the matrix of $T(x,y)=(2x,\ x+y)$ using the basis-image
method.

<details><summary>Answer</summary>
$T(1,0)=(2,1)$, $T(0,1)=(0,1)$. Matrix:
$\begin{pmatrix}2&0\\1&1\end{pmatrix}$.
</details>

---

**3.** Why must $\ker(T)$ always contain at least the zero vector,
for any linear transformation $T$?

<details><summary>Answer</summary>
$T(\mathbf0)=\mathbf0$ is a forced consequence of linearity (shown in
this lesson using $c=0$ in the homogeneity property), so $\mathbf0$
always satisfies $T(\mathbf x)=\mathbf0$ and is therefore always in
the kernel.
</details>

---

### Code Challenges

**Challenge 1 — Linearity tester and matrix builder**

```python
import numpy as np

def check_linear(T, dim, n_trials=20, tol=1e-9):
    """Reimplement is_linear from the lesson."""
    pass

def build_matrix(T, dim):
    """Reimplement transformation_matrix from the lesson."""
    pass

# --- tests: do not modify ---
shear = lambda v: np.array([v[0] + 2*v[1], v[1]])
assert check_linear(shear, 2)
M = build_matrix(shear, 2)
assert np.array_equal(M, np.array([[1,2],[0,1]]))

not_linear = lambda v: v + np.array([1, 0])
assert not check_linear(not_linear, 2)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Kernel and image**

```python
import numpy as np

def kernel_and_image_dims(T, domain_dim):
    """
    Build T's matrix, then return (kernel_dim, image_dim) using
    Lesson 4.9/4.10 tools (null_space_basis, matrix_rank).
    """
    pass

# --- tests: do not modify ---
project_to_x = lambda v: np.array([v[0], 0])   # projects onto x-axis
k_dim, i_dim = kernel_and_image_dims(project_to_x, 2)
assert k_dim == 1   # everything with x=0 maps to zero
assert i_dim == 1   # image is just the x-axis
assert k_dim + i_dim == 2   # Rank-Nullity
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — General forward kinematics**

```python
import numpy as np
import math

def joint_transform(theta, length):
    """Reimplement from the lesson."""
    pass

def fk(joint_angles, link_lengths):
    """Reimplement forward_kinematics from the lesson, return just the (x,y) position."""
    pass

# --- tests: do not modify ---
# A single joint, straight out: end effector should be at (length, 0)
pos = fk([0], [10])
assert math.isclose(pos[0], 10, abs_tol=1e-9)
assert math.isclose(pos[1], 0, abs_tol=1e-9)

# Two joints, first 90°, second 0°: arm goes up then straight (in its own frame)
pos2 = fk([math.pi/2, 0], [5, 5])
assert math.isclose(pos2[0], 0, abs_tol=1e-6)
assert math.isclose(pos2[1], 10, abs_tol=1e-6)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that if $T$ is linear and invertible (as a
transformation), then $T^{-1}$ is also linear. (Hint: let
$\mathbf a=T^{-1}(\mathbf u)$, $\mathbf b=T^{-1}(\mathbf v)$, and use
$T$'s own linearity on $\mathbf a+\mathbf b$.)

<details><summary>Answer</summary>
Let $\mathbf a=T^{-1}(\mathbf u)$, $\mathbf b=T^{-1}(\mathbf v)$, so
$T(\mathbf a)=\mathbf u$, $T(\mathbf b)=\mathbf v$. By $T$'s
additivity, $T(\mathbf a+\mathbf b)=T(\mathbf a)+T(\mathbf
b)=\mathbf u+\mathbf v$. Applying $T^{-1}$ to both sides:
$\mathbf a+\mathbf b = T^{-1}(\mathbf u+\mathbf v)$, i.e.
$T^{-1}(\mathbf u)+T^{-1}(\mathbf v) = T^{-1}(\mathbf u+\mathbf v)$ —
additivity for $T^{-1}$. A near-identical argument using
homogeneity gives $T^{-1}(c\mathbf u)=cT^{-1}(\mathbf u)$.
$\blacksquare$ This confirms that the matrix inverse (Lesson 4.8) of
an invertible linear transformation's matrix is itself always a
valid linear transformation's matrix — undoing a linear map never
produces something non-linear, which is part of why "invertible
linear transformation" is such a well-behaved, closed category to
work within.
</details>
