# Computational Mathematics — LAB 02 — Vectors and Matplotlib

**Prerequisites:** LAB-01 complete. You understand NumPy arrays, vectorized operations, and shape/dtype.

**What this lab adds:**
- Vectors as NumPy arrays — magnitude, direction, unit vectors
- The dot product — what it measures geometrically and computationally
- Matplotlib basics — plotting vectors as arrows to see the math
- The angle between vectors — computed from the dot product

**Environment:** Python 3.10+ | Run with `python lab02.py`
**Install:** `pip install numpy matplotlib`

**Time:** 60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What does it mean geometrically when the dot product of two vectors is zero?
> 2. If `v = [3, 4]`, what is the magnitude of `v`? (Think Pythagorean theorem.)
> 3. *(Prediction)* If you multiply every component of a vector by the same positive number, what happens to its direction? What happens to its magnitude?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A script that computes and visualizes vector operations:

```
=== Vector operations ===
v = [3. 4.]
Magnitude of v: 5.0
Unit vector:    [0.6 0.8]

u = [1. 2.]
Dot product u · v = 11.0
Angle between u and v: 18.43°

=== Is dot product zero? ===
v = [3. 4.],  perp = [-4.  3.]
Dot product: 0.0   ← perpendicular confirmed
```

Plus a Matplotlib plot showing all three vectors as arrows — `v`, `u`, and `v`'s perpendicular — with labels and a labeled angle arc.

---

## Concept: Vectors as NumPy Arrays

**What it is:** A vector is an ordered list of numbers that represents both a magnitude (how long) and a direction (which way). In NumPy, a vector is a 1D array.

**The two ways to think about a vector:**

*Geometric:* An arrow in space. `[3, 4]` points 3 units right and 4 units up.

*Computational:* A 1D array of numbers. `np.array([3.0, 4.0])`.

These are the same object seen from different angles. Your linear algebra course works geometrically. NumPy lets you compute.

**Magnitude (length of the arrow):**
The Pythagorean theorem generalizes to any number of dimensions:
```
‖v‖ = √(v₁² + v₂² + ... + vₙ²)
```

For `[3, 4]`: `‖v‖ = √(9 + 16) = √25 = 5`

This is called the **L2 norm** or **Euclidean norm**. `np.linalg.norm(v)` computes it.

**Unit vector (direction only, magnitude 1):**
Divide every component by the magnitude:
```
v̂ = v / ‖v‖
```
A unit vector preserves the direction of `v` but has magnitude exactly 1. It answers: "which way is v pointing, without caring how far?"

**Why it matters here:** Normalizing vectors appears everywhere in linear algebra (Gram-Schmidt), machine learning (cosine similarity), and graphics (surface normals). You will compute it manually first to see the mechanism, then use `np.linalg.norm`.

**Watch for:** `np.linalg.norm(v)` returns a scalar (a single number), not an array. Dividing an array by a scalar divides every element — that is broadcasting. The result is a new array the same shape as the input.

---

## Step 1 — Vector Magnitude and Unit Vector from Scratch

Create `lab02.py`:

```python
import numpy as np
import matplotlib.pyplot as plt    # pyplot is the standard plotting interface
                                    # plt is the universal convention

# ── Vector basics ─────────────────────────────────────────────────────────────

v = np.array([3.0, 4.0])          # a 2D vector — 3 right, 4 up
print(f"v = {v}")

# Magnitude — from scratch: square each component, sum, take square root
magnitude_scratch = np.sqrt(np.sum(v**2))
# v**2:         [9. 16.]    — square every element
# np.sum(...):  25.0         — sum all elements
# np.sqrt(...): 5.0          — square root of the sum

# Magnitude — with NumPy's linalg (linear algebra) module
magnitude_numpy = np.linalg.norm(v)
# linalg.norm computes Euclidean (L2) norm by default
# 'linalg' is NumPy's linear algebra submodule

print(f"Magnitude (from scratch): {magnitude_scratch}")
print(f"Magnitude (np.linalg.norm): {magnitude_numpy}")
print(f"Both match: {np.isclose(magnitude_scratch, magnitude_numpy)}")
# np.isclose() instead of == because floating point arithmetic can give
# 4.999999999 instead of 5.0 — isclose allows a tiny tolerance

# Unit vector — divide every component by the magnitude
unit_v = v / magnitude_numpy
# This is broadcasting: array / scalar → each element divided by the scalar
print(f"Unit vector: {unit_v}")
print(f"Magnitude of unit vector: {np.linalg.norm(unit_v):.6f}")   # must be 1.0
print()
```

### SAVE AND TRY

Run: `python lab02.py`

**You should see:**
```
v = [3. 4.]
Magnitude (from scratch): 5.0
Magnitude (np.linalg.norm): 5.0
Both match: True
Unit vector: [0.6 0.8]
Magnitude of unit vector: 1.000000
```

`np.isclose()` instead of `==` — floating point arithmetic can produce `4.999999999999` instead of exactly `5.0`. `==` would return `False`. `isclose` allows a small tolerance. Always use `np.isclose()` when comparing floats.

**Change something:** Change `v` to `np.array([1.0, 1.0])`. The magnitude should be `√2 ≈ 1.414`. The unit vector should be `[0.707, 0.707]`. Change it back to `[3.0, 4.0]`.

---

## Concept: The Dot Product

**What it is:** The dot product of two vectors `u` and `v` is a single number (a scalar) computed by multiplying corresponding components and summing:

```
u · v = u₁v₁ + u₂v₂ + ... + uₙvₙ
```

For `u = [1, 2]` and `v = [3, 4]`: `u · v = 1×3 + 2×4 = 3 + 8 = 11`

**The geometric interpretation — why it matters:**
The dot product equals the product of the magnitudes times the cosine of the angle between them:

```
u · v = ‖u‖ · ‖v‖ · cos(θ)
```

This means:
- `u · v > 0` → angle < 90° → vectors point roughly the same direction
- `u · v = 0` → angle = 90° → vectors are **perpendicular** (orthogonal)
- `u · v < 0` → angle > 90° → vectors point roughly opposite directions

**This is the algebraic definition of perpendicularity.** Two vectors are orthogonal if and only if their dot product is zero. In your linear algebra class you will see this constantly.

**Solving for the angle:**
Rearrange `u · v = ‖u‖ · ‖v‖ · cos(θ)`:
```
cos(θ) = (u · v) / (‖u‖ · ‖v‖)
θ = arccos( (u · v) / (‖u‖ · ‖v‖) )
```

`np.arccos` computes arccosine and returns radians. Multiply by `180 / np.pi` to get degrees.

**Canonical example:** Work in physics. Force `F` applied at angle `θ` to displacement `d`: work = F · d (dot product). When the force is perpendicular to motion (θ=90°), the dot product is zero — no work done, which matches physical intuition.

**NumPy:** `np.dot(u, v)` or the `@` operator for 1D arrays. For matrices, `@` is matrix multiplication.

**Watch for:** `np.dot(u, v)` on two 1D arrays gives a scalar (the dot product). `np.dot(A, B)` on two 2D arrays gives matrix multiplication. Same function, different behavior based on input shape. `@` is explicit: `A @ B` is always matrix multiply; `u @ v` is the dot product for vectors.

---

## Step 2 — Compute the Dot Product and Angle

Add to `lab02.py`:

```python
# ── Dot product and angle ──────────────────────────────────────────────────────

u = np.array([1.0, 2.0])
v = np.array([3.0, 4.0])            # same v as before

# Dot product from scratch
dot_scratch = np.sum(u * v)
# u * v:         [3. 8.]   — element-wise multiplication
# np.sum(...):   11.0       — sum of products

# Dot product with NumPy
dot_numpy = np.dot(u, v)
# also valid: u @ v  (@ operator for dot product on 1D arrays)

print(f"u = {u},  v = {v}")
print(f"Dot product (from scratch): {dot_scratch}")
print(f"Dot product (np.dot):       {dot_numpy}")
print()

# Angle between u and v — from the dot product formula
# cos(θ) = (u · v) / (‖u‖ · ‖v‖)
cos_theta = dot_numpy / (np.linalg.norm(u) * np.linalg.norm(v))
theta_radians = np.arccos(cos_theta)              # arccos returns radians
theta_degrees = np.degrees(theta_radians)         # np.degrees converts to degrees
# equivalent: theta_degrees = theta_radians * 180 / np.pi

print(f"Angle between u and v: {theta_degrees:.2f}°")
print()

# ── Perpendicular vectors — dot product = 0 ───────────────────────────────────

v = np.array([3.0, 4.0])
perp = np.array([-4.0, 3.0])       # rotate v by 90°: swap and negate one component

print(f"v = {v},  perp = {perp}")
print(f"Dot product: {np.dot(v, perp)}")    # must be 0.0 — they are perpendicular
print()
```

### SAVE AND TRY

Run: `python lab02.py`

**You should see:**
```
u = [1. 2.],  v = [3. 4.]
Dot product (from scratch): 11.0
Dot product (np.dot):       11.0

Angle between u and v: 18.43°

v = [3. 4.],  perp = [-4.  3.]
Dot product: 0.0
```

A dot product of 0.0 confirms `v` and `perp` are perpendicular. Try to verify this geometrically: `[3,4]` points northeast. `[-4,3]` points northwest. They should be 90° apart.

**In the terminal:**
```python
python -c "import numpy as np; u=np.array([1,0]); v=np.array([0,1]); print(np.dot(u,v))"
```
Expected: `0` — the x-axis and y-axis are orthogonal, dot product zero.

**Change something:** Change `perp` to `np.array([4.0, -3.0])` — the other perpendicular direction. The dot product should still be `0.0`. Change it back.

---

## Concept: Matplotlib Basics

**What it is:** Matplotlib is Python's standard plotting library. `matplotlib.pyplot` is the interface that mirrors MATLAB's plotting commands. Every plot starts with a Figure (the whole window) and an Axes (one coordinate system to plot in).

**The structure:**
```python
fig, ax = plt.subplots()   # create a Figure and one Axes
ax.plot(x, y)              # draw on the Axes
ax.set_xlabel("x")         # label the x axis
ax.set_title("My plot")    # title the Axes
plt.show()                 # open the window
```

`fig` is the window. `ax` is the coordinate system inside it. You do almost everything through `ax`. This two-level structure becomes important when you have multiple plots side by side (`plt.subplots(1, 3)` gives you three Axes).

**Plotting vectors as arrows:**
`ax.quiver(x, y, dx, dy)` draws an arrow starting at `(x, y)` going to `(x+dx, y+dy)`. For vectors starting at the origin: `ax.quiver(0, 0, vx, vy)`.

**Why it matters here:** Making vectors visible makes linear algebra intuitive. Perpendicularity, angles, projections, and eigenvectors all make sense immediately once you can see them. Matplotlib is the tool that bridges your algebra and your intuition.

**Python idiom — `f-string` formatting:**
`f"Angle: {theta:.2f}°"` — the `:` starts a format spec, `.2f` means "float with 2 decimal places." This appears constantly in scientific Python code to control output precision.

**Watch for:** `plt.show()` opens the window and **blocks execution** until you close it. Nothing after `plt.show()` runs until the window is closed. For scripts that produce multiple plots, either show them at the end or use `plt.savefig("plot.png")` to save without blocking.

---

## Step 3 — Visualize the Vectors

Add to `lab02.py`:

```python
# ── Visualization ──────────────────────────────────────────────────────────────

u = np.array([1.0, 2.0])
v = np.array([3.0, 4.0])
perp = np.array([-4.0, 3.0])

fig, ax = plt.subplots(figsize=(7, 7))
# figsize=(width, height) in inches — 7×7 makes it square since our vectors
# have similar x and y ranges

# Draw each vector as an arrow from the origin
# quiver(x_start, y_start, x_component, y_component)
ax.quiver(0, 0, v[0], v[1],    color='blue',   angles='xy', scale_units='xy', scale=1,
          label=f'v = {v}')
ax.quiver(0, 0, u[0], u[1],    color='red',    angles='xy', scale_units='xy', scale=1,
          label=f'u = {u}')
ax.quiver(0, 0, perp[0], perp[1], color='green', angles='xy', scale_units='xy', scale=1,
          label=f'perp = {perp}')
# angles='xy', scale_units='xy', scale=1 : these three arguments make the arrows
# draw in data coordinates (actual vector lengths), not scaled to the plot size

# Label the angle between u and v
theta_mid = theta_degrees / 2                          # midpoint angle
ax.annotate(
    f'θ = {theta_degrees:.1f}°',
    xy=(0.8, 1.0),                                     # where the label points
    fontsize=11, color='black'
)

# Axes configuration
ax.set_xlim(-5, 5)        # x axis from -5 to 5
ax.set_ylim(-5, 5)        # y axis from -5 to 5
ax.axhline(0, color='black', linewidth=0.5)   # horizontal line at y=0 (x-axis)
ax.axvline(0, color='black', linewidth=0.5)   # vertical line at x=0 (y-axis)
ax.set_aspect('equal')    # equal scaling so 90° looks like 90° on screen
ax.grid(True, alpha=0.3)  # light grid — alpha=0.3 means 30% opacity
ax.legend()               # show the labels from the quiver calls
ax.set_title('Vector visualization: v, u, and perpendicular to v')

plt.tight_layout()        # adjusts margins so labels don't get clipped
plt.show()                # open the window — blocks until closed
```

### SAVE AND TRY

Run: `python lab02.py`

**You should see:** A plot with three colored arrows from the origin:
- Blue: `v = [3, 4]` pointing northeast
- Red: `u = [1, 2]` pointing northeast but less steeply
- Green: `perp = [-4, 3]` pointing northwest — perpendicular to blue

The green and blue arrows should look 90° apart. If they don't — check `ax.set_aspect('equal')`. Without equal scaling, 90° looks distorted.

**Change something:** Change the `figsize` from `(7, 7)` to `(12, 4)`. The plot becomes wide and short — the vectors look distorted because the aspect ratio changed. `set_aspect('equal')` corrects the data coordinates but not the figure shape. Change it back to `(7, 7)`.

---

## 🏗️ Challenge: Project One Vector onto Another

**Concept tested:** Dot product, unit vectors, vectorized NumPy operations, Matplotlib

**The math — vector projection:**
The projection of `u` onto `v` is the component of `u` that points in the direction of `v`. Geometrically, it is the shadow that `u` casts on `v` when light shines perpendicular to `v`.

```
proj_v(u) = (u · v / ‖v‖²) · v
```

Or equivalently, using the unit vector of `v`:
```
proj_v(u) = (u · v̂) · v̂
```

**What you're building:**
A function `project(u, v)` that returns the projection of `u` onto `v`, plus a Matplotlib plot showing:
1. Vector `v` (blue)
2. Vector `u` (red)
3. The projection of `u` onto `v` (orange, along `v`)
4. The perpendicular component `u - proj` (dashed, from the tip of `proj` to the tip of `u`)
5. A right angle marker at the projection point

**Requirements:**
- [ ] `project([1, 2], [3, 4])` returns a NumPy array (not a scalar)
- [ ] The projection lies along `v` — verify `np.cross(project(u, v), v)` is 0
- [ ] `project(u, v) + (u - project(u, v))` equals `u` (projection + remainder = original)
- [ ] The plot shows all four components labeled

**Starter code:**

```python
import numpy as np
import matplotlib.pyplot as plt

def project(u, v):
    u = np.array(u, dtype=float)
    v = np.array(v, dtype=float)
    # TODO: compute the projection of u onto v
    # Formula: (dot(u,v) / dot(v,v)) * v
    pass

u = np.array([1.0, 3.0])
v = np.array([4.0, 1.0])

proj = project(u, v)
perp_component = u - proj   # the part of u perpendicular to v

print(f"u          = {u}")
print(f"projection = {proj}")
print(f"remainder  = {perp_component}")
print(f"proj + remainder = u: {np.allclose(proj + perp_component, u)}")  # must be True
```

**When you're done:** The print statements confirm the decomposition. The plot shows `u` decomposed into two perpendicular parts along and across `v`. The right angle at the projection point confirms orthogonality.

**Stuck?** Ask AI: "In the vector projection formula `proj = (dot(u,v) / dot(v,v)) * v`, why do we divide by `dot(v,v)` instead of `norm(v)`? What does each form compute?"

---

## Final Check

| What to check | How to verify |
|---|---|
| Magnitude of `[3, 4]` is 5.0 | Script outputs `5.0` |
| Unit vector magnitude is 1.0 | `np.linalg.norm(unit_v)` prints `1.000000` |
| Dot product of perpendicular vectors is 0 | `np.dot(v, perp)` prints `0.0` |
| Angle computed correctly | `18.43°` between `[1,2]` and `[3,4]` |
| Vectors visible in Matplotlib | Three arrows from origin, different colors |
| Perpendicular vectors look 90° apart | With `set_aspect('equal')`, green and blue are visually perpendicular |

---

## Quick Check Answers

**1. What does dot product = 0 mean geometrically?**
The vectors are perpendicular — they point at exactly 90° to each other. The formula `u · v = ‖u‖ · ‖v‖ · cos(θ)` equals zero when `cos(θ) = 0`, which happens at θ = 90°. This is the algebraic definition of orthogonality. In your linear algebra class you will use `u · v = 0` to prove that two vectors are orthogonal — the geometric fact and the algebraic fact are the same thing.

**2. Magnitude of `[3, 4]`?**
5. By the Pythagorean theorem: the vector forms a right triangle with legs 3 and 4. `‖v‖ = √(3² + 4²) = √(9 + 16) = √25 = 5`. This is a 3-4-5 right triangle — the most famous Pythagorean triple. The Euclidean norm generalizes this to any number of dimensions.

**3. Multiply every component by the same positive number — what happens?**
The direction stays the same (all components scale equally, so the ratios between them are unchanged). The magnitude scales by that same number (if you double every component, the arrow is twice as long, pointing the same way). Multiplying a vector by a scalar is called scalar multiplication — it stretches or shrinks the vector without rotating it.
