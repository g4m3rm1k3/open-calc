# The Rotation Matrix
## How to rotate a point in 2D space — and why the formula is what it is

---

There is a formula you will see in every graphics program, every game engine, every CAD tool:

```
x' = x·cos(θ) - y·sin(θ)
y' = x·sin(θ) + y·cos(θ)
```

Most resources just hand you this and say "use it." That is not learning — that is copying. By the end of this lesson you will have *derived* it yourself from things you already understand, and you will never need to memorize it again because you will know why it has to be that shape.

---

## Part 1 — What We Are Actually Asking

Before any math, let us be precise about the question.

You have a point at coordinates `(x, y)`. You want to rotate it by angle `θ` around the origin `(0, 0)`. What are the new coordinates `(x', y')`?

That is the entire problem. Everything else is finding a clean way to answer it.

The origin is important: we are not rotating around an arbitrary point yet, just around `(0, 0)`. We will handle arbitrary centers later — and it will fall out naturally from what we build here.

---

## Part 2 — The Unit Circle Is the Key

You need one fact. Not a formula — a *geometric fact* that you can see:

**Any point on a circle of radius 1, at angle θ from the positive X axis, has coordinates `(cos θ, sin θ)`.**

That is the definition of cosine and sine. Not "adjacent over hypotenuse" — that is a consequence, not the definition. The definition is: cos and sin are the X and Y coordinates of a point moving around the unit circle.

Let's see this:

```python
import math
import matplotlib.pyplot as plt
import numpy as np

# The unit circle
angles = np.linspace(0, 2 * math.pi, 300)
circle_x = np.cos(angles)
circle_y = np.sin(angles)

# A specific angle — let's use 37 degrees
theta = math.radians(37)
px = math.cos(theta)
py = math.sin(theta)

fig, ax = plt.subplots(1, 1, figsize=(6, 6))
ax.set_aspect('equal')
ax.grid(True, alpha=0.3)
ax.axhline(0, color='black', linewidth=0.5)
ax.axvline(0, color='black', linewidth=0.5)

# Draw the unit circle
ax.plot(circle_x, circle_y, 'lightblue', linewidth=1)

# Draw the point
ax.plot(px, py, 'ro', markersize=8)
ax.plot([0, px], [0, py], 'r-', linewidth=2)  # radius line

# Labels showing the coordinates ARE cos and sin
ax.plot([px, px], [0, py], 'b--', linewidth=1, alpha=0.5)  # vertical dashed
ax.plot([0, px], [py, py], 'g--', linewidth=1, alpha=0.5)  # horizontal dashed

ax.annotate(f'cos(θ) = {px:.3f}', (px/2, -0.12), ha='center', fontsize=10, color='green')
ax.annotate(f'sin(θ) = {py:.3f}', (px + 0.04, py/2), fontsize=10, color='blue')
ax.annotate(f'Point: ({px:.3f}, {py:.3f})', (px + 0.04, py + 0.04), fontsize=10, color='red')
ax.annotate(f'θ = {math.degrees(theta):.0f}°', (0.15, 0.08), fontsize=11)

ax.set_xlim(-1.4, 1.4)
ax.set_ylim(-1.4, 1.4)
ax.set_title('Any point on the unit circle has coordinates (cos θ, sin θ)')
plt.tight_layout()
plt.show()

print(f"At θ = 37°:")
print(f"  cos(37°) = {px:.6f}  ← this IS the x coordinate")
print(f"  sin(37°) = {py:.6f}  ← this IS the y coordinate")
```

Run this. Look at the picture. The point at 37° is at `(0.799, 0.602)`. And `cos(37°) = 0.799`, `sin(37°) = 0.602`. The coordinates and the trig functions are the same thing.

This is the foundation. Everything else follows from it.

---

## Part 3 — A Point at a Known Angle

Now let's think about a general point `P = (x, y)`.

Every point in 2D space (except the origin) has two things:
- A **distance** from the origin: `r = √(x² + y²)`
- An **angle** from the positive X axis: `α = atan2(y, x)`

And because of what we just established about the unit circle, we can always write:

```
x = r · cos(α)
y = r · sin(α)
```

Read that carefully: *x and y are just r times the unit circle coordinates at angle α*. We scaled the unit circle point by r to get the actual point.

Let's verify this:

```python
import math

# A point somewhere in space
x, y = 3.0, 4.0

# Its distance from origin
r = math.sqrt(x**2 + y**2)

# Its angle from positive X axis
alpha = math.atan2(y, x)  # atan2 handles all quadrants correctly

# Reconstruct from r and alpha
x_reconstructed = r * math.cos(alpha)
y_reconstructed = r * math.sin(alpha)

print(f"Original point:       ({x}, {y})")
print(f"Distance r:           {r:.6f}")
print(f"Angle α:              {math.degrees(alpha):.4f}°")
print(f"Reconstructed point:  ({x_reconstructed:.6f}, {y_reconstructed:.6f})")
print(f"Match: {abs(x - x_reconstructed) < 1e-10 and abs(y - y_reconstructed) < 1e-10}")
```

The point `(3, 4)` is at distance 5 (the classic 3-4-5 right triangle) and angle 53.13°. Multiplying `5 · cos(53.13°)` gives back 3, and `5 · sin(53.13°)` gives back 4. We haven't lost anything — `(r, α)` carries the same information as `(x, y)`, just expressed differently.

---

## Part 4 — What Rotation Does to (r, α)

Here is the key insight. It is simple and powerful.

When you rotate a point by angle θ:
- **The distance r does not change.** Rotation is movement around a circle. The point stays the same distance from the center.
- **The angle changes from α to α + θ.** That is literally what rotation means.

So after rotation:

```
x' = r · cos(α + θ)
y' = r · sin(α + θ)
```

That is the entire answer. Rotation takes a point at `(r, α)` and produces a point at `(r, α + θ)`.

But there is a problem: we started with `(x, y)`, not `(r, α)`. We need to express `x'` and `y'` in terms of `x`, `y`, and `θ`. That requires one more step.

---

## Part 5 — The Angle Addition Formulas

We need to expand `cos(α + θ)` and `sin(α + θ)`.

These come from trigonometry — they are called the angle addition formulas:

```
cos(α + θ) = cos(α)·cos(θ) - sin(α)·sin(θ)
sin(α + θ) = sin(α)·cos(θ) + cos(α)·sin(θ)
```

You can look these up and verify them, but here is a quick intuition: when you add two angles, the result involves all the combinations of the cosines and sines of both angles, with specific signs. The signs come from the geometry of the unit circle and can be derived, but for now: accept them, verify them numerically, and move on.

```python
import math

# Verify the angle addition formulas numerically
alpha = math.radians(37)
theta = math.radians(52)

# Direct computation
direct_cos = math.cos(alpha + theta)
direct_sin = math.sin(alpha + theta)

# Via angle addition formulas
formula_cos = math.cos(alpha)*math.cos(theta) - math.sin(alpha)*math.sin(theta)
formula_sin = math.sin(alpha)*math.cos(theta) + math.cos(alpha)*math.sin(theta)

print(f"cos(α+θ) direct:  {direct_cos:.10f}")
print(f"cos(α+θ) formula: {formula_cos:.10f}")
print(f"Match: {abs(direct_cos - formula_cos) < 1e-12}")
print()
print(f"sin(α+θ) direct:  {direct_sin:.10f}")
print(f"sin(α+θ) formula: {formula_sin:.10f}")
print(f"Match: {abs(direct_sin - formula_sin) < 1e-12}")
```

They match to 12 decimal places. The formulas are correct.

---

## Part 6 — The Derivation

Now we have everything. Watch how it comes together.

We want `x'` and `y'` in terms of `x`, `y`, and `θ`. Here are the steps:

**Step 1:** Write the rotated coordinates using what we know:
```
x' = r · cos(α + θ)
y' = r · sin(α + θ)
```

**Step 2:** Expand using the angle addition formulas:
```
x' = r · (cos(α)·cos(θ) - sin(α)·sin(θ))
y' = r · (sin(α)·cos(θ) + cos(α)·sin(θ))
```

**Step 3:** Distribute r:
```
x' = r·cos(α)·cos(θ) - r·sin(α)·sin(θ)
y' = r·sin(α)·cos(θ) + r·cos(α)·sin(θ)
```

**Step 4:** Substitute back. We know `x = r·cos(α)` and `y = r·sin(α)`, so:
```
x' = x·cos(θ) - y·sin(θ)
y' = x·sin(θ) + y·cos(θ)
```

**That is the rotation formula.** It is not magic — it is the angle addition formula substituted with the polar coordinate definition of x and y. Every symbol has a reason.

```python
import math
import matplotlib.pyplot as plt

def rotate_point(x, y, theta_degrees):
    """
    Rotate point (x, y) by theta_degrees around the origin.
    
    Derivation:
      x' = x·cos(θ) - y·sin(θ)   ← from r·cos(α+θ) expanded
      y' = x·sin(θ) + y·cos(θ)   ← from r·sin(α+θ) expanded
    """
    theta = math.radians(theta_degrees)
    c = math.cos(theta)  # compute once, use twice
    s = math.sin(theta)
    
    x_new = x * c - y * s
    y_new = x * s + y * c
    
    return x_new, y_new

# Verify with known results
# Rotating (1, 0) by 90° should give (0, 1)
x, y = rotate_point(1, 0, 90)
print(f"(1,0) rotated 90°: ({x:.6f}, {y:.6f})  expected (0, 1)")

# Rotating (1, 0) by 180° should give (-1, 0)
x, y = rotate_point(1, 0, 180)
print(f"(1,0) rotated 180°: ({x:.6f}, {y:.6f})  expected (-1, 0)")

# Rotating (0, 1) by -90° should give (1, 0)
x, y = rotate_point(0, 1, -90)
print(f"(0,1) rotated -90°: ({x:.6f}, {y:.6f})  expected (1, 0)")

# Rotating (3, 4) by 37° — let's verify distance is preserved
x0, y0 = 3, 4
x1, y1 = rotate_point(x0, y0, 37)
r_before = math.sqrt(x0**2 + y0**2)
r_after  = math.sqrt(x1**2 + y1**2)
print(f"\nDistance before rotation: {r_before:.6f}")
print(f"Distance after rotation:  {r_after:.6f}")
print(f"Distance preserved: {abs(r_before - r_after) < 1e-10}")
```

---

## Part 7 — Visualizing What We Built

```python
import math
import matplotlib.pyplot as plt
import numpy as np

def rotate_point(x, y, theta_degrees):
    theta = math.radians(theta_degrees)
    c, s = math.cos(theta), math.sin(theta)
    return x*c - y*s, x*s + y*c

# A shape: a simple arrow/triangle
shape = [(2, 0), (1, 0.5), (1, -0.5)]

fig, axes = plt.subplots(1, 3, figsize=(14, 5))

for i, angle in enumerate([0, 45, 120]):
    ax = axes[i]
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.3)
    ax.axhline(0, color='black', linewidth=0.5)
    ax.axvline(0, color='black', linewidth=0.5)
    ax.set_xlim(-3, 3)
    ax.set_ylim(-3, 3)
    
    # Original shape (faded)
    orig_xs = [p[0] for p in shape] + [shape[0][0]]
    orig_ys = [p[1] for p in shape] + [shape[0][1]]
    ax.fill(orig_xs[:-1], orig_ys[:-1], alpha=0.1, color='blue')
    ax.plot(orig_xs, orig_ys, 'b--', alpha=0.3, linewidth=1)
    
    # Rotated shape
    rotated = [rotate_point(x, y, angle) for x, y in shape]
    rot_xs = [p[0] for p in rotated] + [rotated[0][0]]
    rot_ys = [p[1] for p in rotated] + [rotated[0][1]]
    ax.fill(rot_xs[:-1], rot_ys[:-1], alpha=0.4, color='red')
    ax.plot(rot_xs, rot_ys, 'r-', linewidth=2)
    
    # Show the rotation arc for the first point
    px0, py0 = shape[0]
    px1, py1 = rotated[0]
    r = math.sqrt(px0**2 + py0**2)
    a0 = math.atan2(py0, px0)
    a1 = math.atan2(py1, px1)
    arc_angles = np.linspace(a0, a0 + math.radians(angle), 50)
    ax.plot(r * np.cos(arc_angles), r * np.sin(arc_angles), 
            'g-', linewidth=1.5, alpha=0.7)
    
    ax.set_title(f'Rotated {angle}°', fontsize=12)
    ax.plot(0, 0, 'ko', markersize=4)  # origin

plt.suptitle("rotate_point(x, y, θ) — distance preserved, angle changes by θ", fontsize=11)
plt.tight_layout()
plt.show()
```

Notice: the shape changes orientation but never changes size. The distance from the origin is always preserved. This is what the formula guarantees — it comes from the fact that `r` never appears in the final formula, only `x` and `y` (which encode `r` and `α` together).

---

## Part 8 — The Matrix Form

The rotation formula is:
```
x' = x·cos(θ) - y·sin(θ)
y' = x·sin(θ) + y·cos(θ)
```

Notice something: `x'` and `y'` are each a *linear combination* of `x` and `y`. That is: each output is a weighted sum of the inputs. No squares, no products of x and y with each other — just constants times x, plus constants times y.

When you have linear combinations like this, you can write them as a matrix multiplication:

```
[x']   [cos(θ)  -sin(θ)] [x]
[y'] = [sin(θ)   cos(θ)] [y]
```

Read this as: "to get x', multiply the first row `[cos(θ), -sin(θ)]` by the column `[x, y]`":
```
x' = cos(θ)·x + (-sin(θ))·y = x·cos(θ) - y·sin(θ)   ✓
```

And to get y', multiply the second row `[sin(θ), cos(θ)]` by the column `[x, y]`:
```
y' = sin(θ)·x + cos(θ)·y = x·sin(θ) + y·cos(θ)   ✓
```

The matrix is just a compact notation for the two equations. It is not a new idea — it is the same idea written more concisely.

```python
import math
import numpy as np

def rotation_matrix(theta_degrees):
    """
    The 2x2 rotation matrix.
    
    Each entry is where it is because of the angle addition formula:
    
      cos(θ)   -sin(θ)     ← row 1: how x' depends on x and y
      sin(θ)    cos(θ)     ← row 2: how y' depends on x and y
    
    The negative sign on -sin(θ) is from the expansion of cos(α+θ):
      cos(α+θ) = cos(α)cos(θ) - sin(α)sin(θ)  ← the minus is here
    """
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    return np.array([
        [c, -s],   # row 1: x' = x·c + y·(-s)
        [s,  c],   # row 2: y' = x·s + y·c
    ])

def rotate_point_matrix(x, y, theta_degrees):
    R = rotation_matrix(theta_degrees)
    result = R @ np.array([x, y])  # @ is matrix multiply in numpy
    return result[0], result[1]

# Verify against our earlier function
test_cases = [(1, 0, 90), (1, 0, 180), (0, 1, -90), (3, 4, 37)]
for x, y, angle in test_cases:
    # Scalar version
    theta = math.radians(angle)
    x1 = x*math.cos(theta) - y*math.sin(theta)
    y1 = x*math.sin(theta) + y*math.cos(theta)
    
    # Matrix version
    x2, y2 = rotate_point_matrix(x, y, angle)
    
    match = abs(x1-x2) < 1e-12 and abs(y1-y2) < 1e-12
    print(f"({x},{y}) rotated {angle}°: ({x1:.4f}, {y1:.4f}) | matrix: ({x2:.4f}, {y2:.4f}) | match: {match}")
```

They produce the same results. The matrix form is not a different operation — it is the same operation written as a matrix so we can use the machinery of linear algebra.

---

## Part 9 — Why the Matrix Form Is Powerful: Composing Rotations

Here is where the matrix form earns its existence.

Suppose you want to rotate a point first by 30°, then by 45°. Using the scalar formula, you would:
1. Apply the 30° formula to get an intermediate point
2. Apply the 45° formula to that result

That works, but you are doing two passes over every point.

With matrices, you can combine the two rotations into one matrix first:

```
R_total = R_45 · R_30      (matrix multiplication)
```

Then apply `R_total` to each point — one pass instead of two. For 100,000 points, this is twice as fast.

And better: the result of `R_45 · R_30` is just `R_75`. Rotating by 30° then 45° is the same as rotating by 75°. The matrices make this obvious.

```python
import math
import numpy as np

def rotation_matrix(theta_degrees):
    theta = math.radians(theta_degrees)
    c, s = math.cos(theta), math.sin(theta)
    return np.array([[c, -s], [s, c]])

# Compose two rotations: first 30°, then 45°
R30 = rotation_matrix(30)
R45 = rotation_matrix(45)

# When composing, R45 goes on the LEFT because it is applied AFTER R30
# Reading right-to-left: "apply R30, then apply R45"
R_composed = R45 @ R30

# The composed matrix should equal R75
R75 = rotation_matrix(75)

print("R45 @ R30:")
print(R_composed.round(6))
print("\nR75 (direct):")
print(R75.round(6))
print(f"\nAre they equal? {np.allclose(R_composed, R75)}")

# Verify with a point
point = np.array([3.0, 1.0])

# Two-step rotation
step1 = R30 @ point
step2 = R45 @ step1
print(f"\nTwo-step (30° then 45°): {step2.round(6)}")

# One-step with composed matrix
one_step = R_composed @ point
print(f"One-step (composed R75): {one_step.round(6)}")

# Direct 75° rotation
direct = R75 @ point
print(f"Direct 75°:              {direct.round(6)}")
print(f"\nAll three agree: {np.allclose(step2, one_step) and np.allclose(one_step, direct)}")
```

This is why the matrix form exists. Not because it is more elegant (though it is) — because composing transforms is something we do constantly in CAD software, and matrix multiplication makes it both efficient and clean.

---

## Part 10 — The Problem With 2×2: Translation

There is something the 2×2 matrix cannot do.

Translation — moving a point by `(dx, dy)` — is:
```
x' = x + dx
y' = y + dy
```

Can you write this as a 2×2 matrix multiplication? No. A 2×2 matrix times a 2D vector gives:
```
x' = a·x + b·y
y' = c·x + d·y
```

Every output is a combination of the *inputs*. There is nowhere to put `dx` — it is a constant added to x, not a multiple of x or y. Translation is not a linear transformation and cannot be expressed as a 2×2 matrix.

This is a real problem for CAD software. We need to compose rotations, scales, *and* translations into a single transform that can be applied with one operation. The solution is homogeneous coordinates — but that is the next lesson.

For now, the point to hold onto is: **2×2 matrices handle rotation and scale, but not translation**. The limitation is not an implementation problem — it is a mathematical limitation of 2×2 linear algebra.

```python
import math
import numpy as np

def rotation_matrix_2x2(theta_degrees):
    theta = math.radians(theta_degrees)
    c, s = math.cos(theta), math.sin(theta)
    return np.array([[c, -s], [s, c]])

# Demonstrate that translation CANNOT be a 2x2 matrix
# We want x' = x + 5, y' = y + 3

# Any 2x2 matrix M gives: [x', y'] = M @ [x, y]
# For translation: x' = 1*x + 0*y + 5  but there is no room for the +5

# Let's show this concretely:
# Suppose we find a 2x2 matrix T such that T @ [x, y] = [x+5, y+3] for all points.
# T @ [1, 0] must give [6, 3]    (x=1, y=0 → x'=6, y'=3)
# T @ [2, 0] must give [7, 3]    (x=2, y=0 → x'=7, y'=3)
# But if T @ [1,0] = [6, 3], then T @ [2, 0] = 2 * T @ [1, 0] = [12, 6]
# That is NOT [7, 3]. Contradiction.

# Linear maps must satisfy T(2v) = 2*T(v). Translation doesn't.
T_row1 = [1, 0]  # first column of T: what T does to [1, 0]
T_row2 = [0, 1]  # second column
# If T @ [1,0] = [6, 3], then:
T = np.array([[6, 3], [3, 3]])  # doesn't matter what we set, it won't work
print("Trying to make a 2x2 translation matrix:")
print(f"  T @ [1, 0] = {T @ [1, 0]}  (want [6, 3])")
print(f"  T @ [2, 0] = {T @ [2, 0]}  (want [7, 3] — a DIFFERENT linear shift)")
print("\nA 2x2 matrix CANNOT represent translation.")
print("The shift is a constant — it doesn't scale with the input.")
print("This is why we need 3x3 matrices (homogeneous coordinates).")
```

---

## What You Now Know

You derived the rotation formula from:
1. The definition of cos and sin as unit circle coordinates
2. The fact that rotation preserves distance (r stays the same)
3. The fact that rotation adds to the angle (α becomes α + θ)
4. The angle addition formulas

The matrix form is not magic — it is a notation for the same two equations, organized so that multiple transforms can be composed by multiplication.

The 2×2 matrix has a real limitation: it cannot represent translation. This motivates the 3×3 homogeneous coordinate system.

---

## Your Turn

Work through these in your environment. Do not look back at the lesson until you are stuck.

**Exercise 1:** Rotation preserves distance. Prove it algebraically using the rotation formulas.

You need to show that if `(x', y') = (x·cos θ - y·sin θ, x·sin θ + y·cos θ)`, then:
```
x'² + y'² = x² + y²
```
Expand `x'² + y'²` and use the identity `sin²(θ) + cos²(θ) = 1` to simplify. The answer should fall out cleanly. If it does not, you made an algebra error — check your expansion of `(x·cos θ - y·sin θ)²`.

**Exercise 2:** In the code below, there is a bug in the rotation formula. Find it by reasoning about what the correct answer should be before running it. Then run it to confirm.

```python
import math

def broken_rotate(x, y, theta_degrees):
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    x_new = x * c + y * s    # bug is here
    y_new = x * s + y * c
    return x_new, y_new

# This should give approximately (0, 1) when rotating (1, 0) by 90°
result = broken_rotate(1, 0, 90)
print(f"Got: {result[0]:.4f}, {result[1]:.4f}")
print(f"Expected: 0.0000, 1.0000")
```

Before running: which sign is wrong, and why? Trace back to the angle addition formula and identify which term has the wrong sign.

**Exercise 3:** Write `rotate_around_point(x, y, cx, cy, theta_degrees)` — rotate point `(x, y)` by `theta_degrees` around the center `(cx, cy)` instead of the origin.

You already have everything you need. The trick: translate so the center is at the origin, rotate, translate back. Write it using only your `rotate_point` function and basic addition. Test it: rotating `(3, 0)` by 90° around `(1, 0)` should give `(1, 2)`.

---

## The Next Lesson

The next lesson is **Homogeneous Coordinates** — how adding a third coordinate to a 2D point lets us represent translation as a matrix multiplication, and how that makes rotation, scaling, and translation all composable with a single matrix multiply. It picks up exactly where this one ends: the limitation of 2×2 matrices that we just demonstrated.
