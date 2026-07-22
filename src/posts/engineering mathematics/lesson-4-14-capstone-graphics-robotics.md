# Stage 4, Lesson 4.14 — Capstone: 3D Graphics Pipeline and Robot Kinematics
**Threads:** Math · Physics · Engineering
**Estimated time:** 100–120 minutes

---

## What This Lesson Is About

Every tool this stage built gets used here. Vectors and the dot/cross
product (4.1–4.3) become 3D geometry primitives. Matrices,
transformations, and homogeneous coordinates (4.4, 3.9, 4.11) extend
from 2D into full 3D, and gain one genuinely new piece: **perspective
projection**, the non-linear "divide by depth" step that turns a 3D
scene into a 2D image on screen — the actual final stage of every
real-time graphics pipeline. Determinants and inverses (4.7, 4.8)
check for degenerate transforms and undo camera motion. Null space
and rank (4.9, 4.10) return to answer, properly, the redundant-robot-
joint question first raised in Lesson 4.9. And the capstone project
closes with an honest piece of unfinished business: using the
Jacobian (previewed in 4.9 and built formally here via numerical
differentiation, since calculus is still a stage away) to drive a
simple, real **inverse kinematics** solver — given a target position,
find joint angles that reach it, iteratively.

---

## Historical Context

The modern graphics pipeline's structure — model, view, projection,
screen — crystallized through the 1970s-80s as dedicated graphics
hardware (and later, APIs like OpenGL) standardized exactly this
sequence of matrix transforms, because expressing every stage as
"multiply by a matrix" (even the projection step, once folded into
homogeneous coordinates) let hardware apply the identical operation
to millions of vertices with no special-casing. Robot kinematics has
its own parallel formalization: the Denavit-Hartenberg convention
(1955) standardized how to describe a chain of robot joints with a
minimal, consistent set of parameters, essentially the same
homogeneous-transform-chaining idea from Lesson 4.11's forward
kinematics, systematized for arbitrary real robot geometries. Inverse
kinematics — this lesson's closing project — has been solved by
increasingly sophisticated numerical methods since the 1960s; the
Jacobian transpose method used here is one of the oldest and simplest
still in genuine practical use, particularly where speed matters more
than absolute precision (real-time animation, teleoperation).

---

## What You Need To Know First

This capstone draws on the entire stage — vectors and dot/cross
products (4.1–4.3), matrices and transformations (4.4, 3.9),
Gaussian elimination and the numerical-differentiation habit (4.6,
3.7), determinants and inverses (4.7, 4.8), null space/rank/basis
(4.9, 4.10), linear transformations and forward kinematics (4.11),
and eigenvalues where they clarify a transform's behavior (4.12,
4.13).

---

## Part 1: 3D Transformations

### Rotation About Each Axis

Lesson 3.9's 2D rotation generalizes to three separate 3D rotations,
one about each axis (the axis being rotated about stays fixed;
compare to the 2D case, which implicitly rotated "about" the missing
$z$-axis):

$$R_x(\theta)=\begin{pmatrix}1&0&0\\0&\cos\theta&-\sin\theta\\0&\sin\theta&\cos\theta\end{pmatrix} \quad
R_y(\theta)=\begin{pmatrix}\cos\theta&0&\sin\theta\\0&1&0\\-\sin\theta&0&\cos\theta\end{pmatrix} \quad
R_z(\theta)=\begin{pmatrix}\cos\theta&-\sin\theta&0\\\sin\theta&\cos\theta&0\\0&0&1\end{pmatrix}$$

$R_z$ is exactly Lesson 3.9's 2D rotation, embedded in 3D with $z$
untouched — confirming the 2D case was always a special case of this
one.

### 4×4 Homogeneous Transforms

Extending Lesson 3.9's $3\times3$ homogeneous trick one dimension
further: pad a 3D point to $(x,y,z,1)$, and every 3D transform
(rotation, translation, scaling) becomes a $4\times4$ matrix.

```python
import numpy as np
import math

def rotation_x(theta):
    c, s = math.cos(theta), math.sin(theta)
    return np.array([[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]])

def rotation_y(theta):
    c, s = math.cos(theta), math.sin(theta)
    return np.array([[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]])

def rotation_z(theta):
    c, s = math.cos(theta), math.sin(theta)
    return np.array([[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]])

def translation(tx, ty, tz):
    T = np.identity(4)
    T[:3, 3] = [tx, ty, tz]
    return T

def apply_transform(M, point3d):
    v = np.array([*point3d, 1])
    result = M @ v
    return result[:3]

# Verify: rotate (1,0,0) 90° about z, then translate up by 5
combined = translation(0,0,5) @ rotation_z(math.pi/2)
p = apply_transform(combined, (1,0,0))
print(f"Transformed point: {p}")   # expect ≈ (0, 1, 5)
```

**Walkthrough.** `T[:3, 3] = [tx, ty, tz]` is a first appearance of
assigning directly into a **slice** of an array (rather than only
reading from one, as in Lesson 4.4's `A[0,:]`) — it writes the three
translation values into the top three entries of the last column,
leaving the rest of the identity matrix untouched. Everything else —
padding to homogeneous coordinates, `@` for the combined transform —
is a direct, unmodified reuse of Lesson 3.9's 2D machinery at one
higher dimension, confirming that stage's central claim: the
homogeneous-coordinate trick was never specific to 2D.

---

## Part 2: The Graphics Pipeline

A 3D point's journey to a pixel on screen passes through several
coordinate systems, each a matrix transform away from the last:

$$\text{Model space} \xrightarrow{M} \text{World space} \xrightarrow{V} \text{Camera space} \xrightarrow{P} \text{Clip space} \xrightarrow{\div w} \text{Screen space}$$

- **Model matrix $M$**: positions an object within the world (Part
  1's transforms).
- **View matrix $V$**: repositions the *world* so the camera sits at
  the origin looking down an axis — literally the **inverse** of the
  camera's own world transform (Lesson 4.8's inverse, doing real work
  here: "move the world opposite to how the camera moved" is
  identical to "undo the camera's transform").
- **Projection matrix $P$**: the new piece. Squashes 3D depth into a
  2D image with perspective (closer objects appear larger) — and,
  critically, is the **first genuinely non-linear step** in this
  entire stage's transform pipeline.

### Why Perspective Projection Isn't Linear (and the Fix)

A linear transformation (Lesson 4.11) can't do what perspective needs
— objects farther away must shrink *by a factor depending on their
own distance*, and no single fixed matrix applied the ordinary way
can make the amount of shrinkage depend on the input point's own
coordinates in the necessary way, because linear maps scale every
point by the *same* matrix, not a distance-dependent one. The
resolution, still using matrices: build a $4\times4$ matrix that
puts each point's depth $z$ into the **homogeneous coordinate**
(instead of leaving it fixed at 1, as Part 1 did), and then, as a
*final, separate, non-matrix step*, **divide** the resulting $x,y,z$
by that new $w$ — the "perspective divide." The matrix multiplication
itself stays perfectly linear; the division afterward is what
actually introduces the distance-dependent shrinking.

```python
import numpy as np

def perspective_matrix(fov_y, aspect, near, far):
    """
    Standard perspective projection matrix (a simplified version of
    the one used in real graphics APIs).
    fov_y: vertical field of view, radians. aspect: width/height.
    near, far: distances to the near/far clipping planes.
    """
    f = 1 / math.tan(fov_y / 2)
    return np.array([
        [f/aspect, 0, 0, 0],
        [0, f, 0, 0],
        [0, 0, (far+near)/(near-far), 2*far*near/(near-far)],
        [0, 0, -1, 0],
    ])

def project_point(P, point_camera_space):
    """Apply the projection matrix, then the perspective divide."""
    v = np.array([*point_camera_space, 1])
    clip = P @ v
    if abs(clip[3]) < 1e-12:
        raise ValueError("Point at infinity -- cannot project")
    ndc = clip[:3] / clip[3]   # the perspective divide
    return ndc

P = perspective_matrix(math.radians(60), aspect=16/9, near=0.1, far=100)

# Two points at the same (x,y) but different depths -- perspective should
# make the farther one appear smaller (closer to the screen centre)
near_point = project_point(P, (1, 1, -2))
far_point = project_point(P, (1, 1, -20))
print(f"Point at depth 2:  {near_point}")
print(f"Point at depth 20: {far_point}")
print(f"(Farther point's x,y are closer to 0 -- it appears smaller/more centred)")
```

**Walkthrough.** `clip = P @ v` is an entirely ordinary $4\times4$
matrix-vector multiplication — still linear, still following every
rule from Lesson 4.11. `ndc = clip[:3] / clip[3]` is the new,
genuinely non-linear step: dividing the first three components by
the fourth. Because `clip[3]` comes out equal to (in this
construction) the point's own camera-space depth, points at different
depths get divided by different amounts — exactly the
distance-dependent shrinking a single linear map could never produce
on its own, resolved here by using the matrix machinery to *set up*
the divisor, then performing the division as a separate operation
outside the matrix multiplication itself.

### Rendering a Cube: The Full Pipeline

```python
import numpy as np
import matplotlib.pyplot as plt

# 8 vertices of a unit cube, centred at the origin, in model space
cube_vertices = [
    (-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),
    (-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1),
]
edges = [(0,1),(1,2),(2,3),(3,0), (4,5),(5,6),(6,7),(7,4), (0,4),(1,5),(2,6),(3,7)]

# Model transform: rotate the cube
M = rotation_y(math.radians(30)) @ rotation_x(math.radians(20))

# View transform: camera pulled back along z, looking at the origin
V = np.linalg.inv(translation(0, 0, 6))

# Projection
P = perspective_matrix(math.radians(60), aspect=1.0, near=0.1, far=100)

def pipeline(vertex_model):
    world = apply_transform(M, vertex_model)
    camera = apply_transform(V, world)
    ndc = project_point(P, camera)
    return ndc[:2]   # screen-space x,y (dropping depth for a 2D plot)

screen_points = [pipeline(v) for v in cube_vertices]

fig, ax = plt.subplots(figsize=(6,6))
for i, j in edges:
    p1, p2 = screen_points[i], screen_points[j]
    ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#2980b9', lw=2)
ax.set_aspect('equal'); ax.set_title('Cube through the full pipeline', fontsize=11)
plt.tight_layout()
plt.show()
```

**Walkthrough.** Nothing in `pipeline` is new — it is a direct,
literal implementation of the model→view→projection chain diagrammed
above, using `apply_transform` (Part 1) for the linear stages and
`project_point` (this section) for the non-linear final stage. This
is the payoff of building each piece separately: the full pipeline is
just composing them in order, exactly as Lesson 4.11's forward-
kinematics chain composed joint transforms.

---

## Part 3: Robot Kinematics in 3D

### Forward Kinematics, Extended to 3D

Directly generalizing Lesson 4.11's 2D chain, using $4\times4$
matrices and per-joint rotation axes:

```python
import numpy as np
import math

def joint_transform_3d(theta, axis, link_vector):
    """
    One joint: rotate by theta about the given axis ('x','y', or 'z'),
    then translate along link_vector to the next joint.
    """
    rot = {'x': rotation_x, 'y': rotation_y, 'z': rotation_z}[axis](theta)
    trans = translation(*link_vector)
    return rot @ trans

def forward_kinematics_3d(joint_angles, joint_axes, link_vectors):
    T = np.identity(4)
    for theta, axis, link in zip(joint_angles, joint_axes, link_vectors):
        T = T @ joint_transform_3d(theta, axis, link)
    return apply_transform(T, (0,0,0))

# A 3-joint arm: base rotates about z, then two "elbow" joints about y
angles = [math.radians(30), math.radians(-40), math.radians(20)]
axes = ['z', 'y', 'y']
links = [(0,0,2), (0,0,3), (0,0,2)]

end_effector = forward_kinematics_3d(angles, axes, links)
print(f"End-effector position: {end_effector}")
```

### The Jacobian, via Finite Differences

The **Jacobian** $J$ relates small joint-angle changes to the
resulting end-effector velocity: $\Delta\mathbf x\approx
J\Delta\boldsymbol\theta$. Without calculus yet available, build it
the same way Lesson 3.7 estimated tangent directions — a central
difference, one column at a time (nudge one joint angle slightly, see
how much the end effector moves, divide by the nudge size):

```python
import numpy as np

def numerical_jacobian(joint_angles, joint_axes, link_vectors, h=1e-6):
    """
    Build the 3xN Jacobian numerically: column i is the end-effector's
    sensitivity to joint i, via central difference (Lesson 3.7's
    tangent-estimation technique, applied per joint instead of per
    curve parameter).
    """
    n = len(joint_angles)
    J = np.zeros((3, n))
    for i in range(n):
        angles_plus = list(joint_angles); angles_plus[i] += h
        angles_minus = list(joint_angles); angles_minus[i] -= h
        pos_plus = forward_kinematics_3d(angles_plus, joint_axes, link_vectors)
        pos_minus = forward_kinematics_3d(angles_minus, joint_axes, link_vectors)
        J[:, i] = (pos_plus - pos_minus) / (2*h)
    return J

J = numerical_jacobian(angles, axes, links)
print(f"Jacobian:\n{J}")
print(f"\nRank: {np.linalg.matrix_rank(J)}  (out of {J.shape[1]} joints, "
      f"{J.shape[0]} output dimensions)")
print(f"Redundant: {np.linalg.matrix_rank(J) < J.shape[1]}")
```

**Walkthrough.** `numerical_jacobian` reuses Lesson 3.7's central-
difference pattern exactly, but nudges a *joint angle* rather than a
*curve parameter* — the same numerical-derivative idea, applied to a
different kind of input entirely, confirming that Lesson 3.7's
technique was never specific to curves. Checking `J`'s rank directly
reuses Lesson 4.9's redundancy detector: a 3-joint arm producing only
3 output dimensions ($x,y,z$) with rank 3 has **no** redundancy here
(3 joints, 3 outputs, none wasted) — unlike Lesson 4.9's earlier
example, which deliberately used more joints than outputs.

---

## Capstone Project: Iterative Inverse Kinematics

**Goal**: given a target position, find joint angles that reach it —
the reverse of forward kinematics, and, unlike forward kinematics,
generally has **no direct formula** for anything beyond the simplest
arms. The **Jacobian transpose method** is a simple, genuinely used
iterative approach: at each step, compute the error (target minus
current position), and nudge the joint angles in the direction
$J^T\times\text{error}$ — an approximate "which way should each joint
turn to reduce the error" signal, cheap to compute (just a transpose
and matrix-vector product, no inverse needed) and reliable enough for
many real applications, even though it isn't the mathematically
optimal step a full inverse (or pseudo-inverse) would give.

```python
import numpy as np
import math

def inverse_kinematics_jacobian_transpose(target, joint_axes, link_vectors,
                                            initial_angles=None,
                                            max_iters=500, step_size=0.1, tol=1e-3):
    """
    Iteratively solve for joint angles reaching `target`, using the
    Jacobian transpose method.
    """
    n = len(joint_axes)
    angles = list(initial_angles) if initial_angles else [0.0]*n
    target = np.array(target)

    for iteration in range(max_iters):
        current = forward_kinematics_3d(angles, joint_axes, link_vectors)
        error = target - current
        if np.linalg.norm(error) < tol:
            return angles, iteration, True

        J = numerical_jacobian(angles, joint_axes, link_vectors)
        delta = step_size * (J.T @ error)
        angles = [a + d for a, d in zip(angles, delta)]

    return angles, max_iters, False

target = (2.5, 3.0, 3.5)
solution, iters, converged = inverse_kinematics_jacobian_transpose(
    target, axes, links, initial_angles=[0.1, 0.1, 0.1])

final_pos = forward_kinematics_3d(solution, axes, links)
print(f"Target:    {target}")
print(f"Converged: {converged} after {iters} iterations")
print(f"Reached:   {final_pos}")
print(f"Joint angles (deg): {[math.degrees(a) for a in solution]}")
print(f"Final error: {np.linalg.norm(np.array(target) - final_pos):.6f}")
```

**Walkthrough.** `J.T @ error` is the entire Jacobian transpose
method in one line: transpose the $3\times n$ Jacobian into
$n\times3$, then multiply by the 3D position error to get an
$n$-dimensional joint-angle adjustment — dimensionally, this makes
sense as "each joint's contribution to the error, summed" (recall
$J$'s columns are each joint's effect on position; $J^T$'s *rows* are
those same columns, so $J^T\times\text{error}$ dots each joint's
effect-direction against the error, giving a signed "how much would
moving this joint help" score per joint). This is deliberately *not*
the mathematically optimal step (that would need $J^+$, the
Moore-Penrose pseudo-inverse, built from the SVD — a genuine forward
reference beyond this curriculum's current tools), but it is
directionally correct and cheap, converging reliably for most
reachable targets — a real, honest engineering tradeoff (approximate
but simple and fast) rather than a compromise hidden from the reader.

---

## Connect the Pieces

The full arc of Stage 4, in one capstone:

1. **Vectors and dot/cross products** (4.1–4.3): every 3D point, edge
   vector, and Jacobian column is built from these primitives.
2. **Matrices and homogeneous transforms** (4.4, 3.9, this lesson):
   extended cleanly from 2D to 3D with no new concepts, only new
   dimensions.
3. **Determinants/inverses** (4.7, 4.8): the view matrix is literally
   a camera transform's inverse; a degenerate projection matrix
   (checkable via determinant) would collapse the rendered scene.
4. **Linear transformations, and their limits** (4.11, this lesson):
   the entire pipeline is linear except one deliberate, necessary
   exception — the perspective divide — introduced explicitly as
   exactly the kind of non-linearity Lesson 4.11 proved a matrix
   alone cannot produce.
5. **Null space, rank** (4.9, 4.10): reused unmodified to check robot
   redundancy from real, numerically-computed Jacobians.
6. **Numerical differentiation** (3.7): resurfaces to build the
   Jacobian without calculus, a genuine, working substitute years
   ahead of the derivative's formal treatment (Stage 5).
7. **Iterative solving** (this lesson): inverse kinematics has no
   closed form for a general arm — the Jacobian transpose method is
   this stage's answer, an honest, approximate, and genuinely used
   engineering technique to close out the capstone.

---

## Summary

**3D transforms**: $R_x,R_y,R_z$ and $4\times4$ homogeneous matrices
— direct extensions of Lesson 3.9, no new concepts.

**Graphics pipeline**: model → view (camera inverse) → projection
(the one non-linear step, via the perspective divide) → screen.

**Robot kinematics in 3D**: forward kinematics chains joint
transforms exactly as in Lesson 4.11; the Jacobian, built numerically
via central differences, answers "how does each joint affect the end
effector" and reveals redundancy via its null space.

**Inverse kinematics**: generally has no closed form; the Jacobian
transpose method offers a simple, iterative, genuinely-used
approximate solution.

**New Python/CS concepts:**
- Direct slice assignment (`T[:3,3] = [...]`)
- The perspective divide as a deliberate, isolated non-linear step
  outside an otherwise-linear pipeline
- Numerical Jacobian construction via per-parameter central
  differences
- Iterative approximate inverse-kinematics (Jacobian transpose method)

---

## Problems

### Code Challenges

**Challenge 1 — 3D transform pipeline**

```python
import numpy as np
import math

def build_pipeline(model_angles, camera_distance, fov_deg, aspect):
    """
    Return a function that takes a 3D model-space point and returns
    its 2D screen coordinates, chaining rotation_y/rotation_x (model),
    a translation-inverse (view), and perspective_matrix (projection).
    """
    pass

# --- tests: do not modify ---
pipeline = build_pipeline((0,0), camera_distance=5, fov_deg=60, aspect=1.0)
origin_screen = pipeline((0,0,0))
assert math.isclose(origin_screen[0], 0, abs_tol=1e-6)
assert math.isclose(origin_screen[1], 0, abs_tol=1e-6)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Redundancy-aware Jacobian**

```python
import numpy as np

def jacobian_and_redundancy(joint_angles, joint_axes, link_vectors):
    """
    Return (J, is_redundant: bool), reusing numerical_jacobian and
    the rank/null-space redundancy check from Lessons 4.9/4.10.
    """
    pass

# --- tests: do not modify ---
angles4 = [0.2, 0.3, -0.1, 0.4]
axes4 = ['z','y','y','y']
links4 = [(0,0,1),(0,0,1),(0,0,1),(0,0,1)]
J, redundant = jacobian_and_redundancy(angles4, axes4, links4)
assert redundant   # 4 joints, only 3 output dims -- must be redundant
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Full IK solver test**

```python
import numpy as np
import math

def solve_ik(target, joint_axes, link_vectors, **kwargs):
    """Reimplement inverse_kinematics_jacobian_transpose."""
    pass

# --- tests: do not modify ---
axes = ['z','y','y']
links = [(0,0,2),(0,0,3),(0,0,2)]
# A reachable target (within the arm's total reach of 7)
target = (1.0, 1.0, 4.0)
solution, iters, converged = solve_ik(target, axes, links, initial_angles=[0.1,0.1,0.1])
assert converged
final = forward_kinematics_3d(solution, axes, links)
assert np.linalg.norm(np.array(target) - final) < 0.01
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** The Jacobian transpose method uses $J^T$ as an approximate
substitute for what would ideally be $J^{-1}$ (or, for a non-square
Jacobian, a pseudo-inverse). Using this lesson's Jacobian rank/
redundancy check, explain why $J^{-1}$ literally **cannot** exist for
a redundant arm (more joints than output dimensions) — connecting
back to which matrices are invertible at all (Lessons 4.7, 4.8) — and
why this makes an approximate method like Jacobian transpose
necessary rather than merely convenient in that case.

<details><summary>Answer</summary>
$J^{-1}$ requires $J$ to be **square** (Lesson 4.8: inverses are only
defined for square matrices) — but a redundant arm's Jacobian is
$3\times n$ with $n>3$ (more joint columns than position-output rows),
which is never square, so $J^{-1}$ is not merely hard to compute, it
is **not defined at all** for such an arm. This isn't a limitation of
this lesson's specific numerical method — it's a structural fact
about non-square matrices (Lesson 4.8 restricted inverses to square
matrices for exactly this reason). A full solution for redundant arms
needs the Moore-Penrose pseudo-inverse (built from the SVD, beyond
this curriculum's current tools) or an iterative method like Jacobian
transpose — the approximation isn't a shortcut taken for convenience,
it's the only kind of tool available at this stage's level, given
that the "obviously correct" tool (a genuine inverse) doesn't
mathematically exist for this shape of problem.
</details>
