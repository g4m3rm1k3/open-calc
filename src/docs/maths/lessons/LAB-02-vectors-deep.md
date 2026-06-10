# Computational Mathematics — LAB 02 — Vectors: The Math and the Code

**Prerequisites:** LAB-01. You understand NumPy arrays and vectorized operations.

**What this lab builds:**
- What a vector actually IS and why it has both magnitude and direction
- WHERE the magnitude formula comes from (not just memorizing √(x²+y²))
- WHY normalizing preserves direction — the geometric argument
- WHAT the dot product is measuring, not just how to compute it
- All of this coded in NumPy with Matplotlib to make it visible

**Environment:** Python 3.10+ | `pip install numpy matplotlib`

**Time:** 60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The magnitude formula is `√(x² + y²)`. This is just the Pythagorean theorem. Draw a 2D vector `[3, 4]` on paper as an arrow from the origin. What right triangle does it form, and what is the hypotenuse?
> 2. If you halve every component of a vector, what happens to its direction? What happens to its magnitude?
> 3. *(Prediction)* Two vectors point in exactly the same direction. One is `[1, 0]`, the other is `[100, 0]`. What is the angle between them? What is their dot product?
>
> *(Answers at the end)*

---

## What You Will Build

```
=== Understanding magnitude ===
v = [3. 4.]  — this forms a right triangle: legs 3 and 4, hypotenuse = ?
Pythagorean theorem: √(3² + 4²) = √(9+16) = √25 = 5.0

=== Normalizing: extracting pure direction ===
v = [3. 4.],  magnitude = 5.0
v_hat = [0.6 0.8]   ← same direction, length exactly 1
Check: 0.6² + 0.8² = 0.36 + 0.64 = 1.0  ✓

=== The dot product: measuring alignment ===
Same direction:    dot = 1.0  (angle = 0°)
Perpendicular:     dot = 0.0  (angle = 90°)
Opposite:          dot = -1.0 (angle = 180°)
u·v = ‖u‖‖v‖cos(θ)  →  θ = arccos(u·v / ‖u‖‖v‖) = 18.43°
```

Plus a plot showing vectors as arrows with the right triangle that proves the magnitude formula.

---

## The Math — What Is a Vector?

A vector is not "an array of numbers." That is how a computer stores it.

A vector is **a quantity that has both magnitude and direction.** The numbers are a description of it in a coordinate system — but the vector itself exists independently of coordinates.

When you write `v = [3, 4]`, you are saying: "this vector travels 3 units in the x-direction and 4 units in the y-direction." It is an arrow. The numbers tell you how far along each axis.

**Why this distinction matters:**
A temperature of 72°F is a scalar — just a number, no direction. A wind speed of 15 mph NNE is a vector — it has magnitude (15 mph) and direction (NNE). You cannot add temperatures and wind speeds. You cannot add scalars and vectors. But you can add two vectors because both carry the same kind of information.

In linear algebra you are studying how vectors transform, project, span spaces, and encode information. NumPy is how you compute with them. But to understand what the computations mean, you need the geometric picture.

---

## Concept: Where Does the Magnitude Formula Come From?

**The formula:** `‖v‖ = √(v₁² + v₂² + ... + vₙ²)`

This is NOT magic. It is the Pythagorean theorem, applied once for 2D and extended for higher dimensions.

**In 2D — draw it:**

```
        (3, 4)
        /|
       / |
      /  |  4  ← the y-component
     /   |
    /    |
   /_____|
  (0,0)    (3,0)
      3      ← the x-component

The vector [3, 4] IS the hypotenuse of this right triangle.
The legs are the x-component (3) and y-component (4).
Pythagorean theorem: hypotenuse² = 3² + 4² = 9 + 16 = 25
hypotenuse = √25 = 5
```

**Extending to 3D:**
`v = [3, 4, 0]` — first use Pythagorean theorem on the x-y plane: horizontal distance = √(3² + 4²) = 5. Then use it again with the z-component: total distance = √(5² + 0²) = 5.

The general formula `‖v‖ = √(v₁² + v₂² + ... + vₙ²)` is just applying Pythagorean theorem once in each dimension, chained together.

**The name — L2 norm:**
This is called the Euclidean norm or L2 norm. "L2" means we square the components (power 2). There are other norms (L1 = sum of absolute values, L∞ = maximum component) but L2 is the default geometric distance.

**What it measures:** The straight-line distance from the origin to the tip of the vector — the same distance you would measure with a ruler on a graph.

---

## Concept: Why Does Dividing by Magnitude Preserve Direction?

**The question:** You have `v = [3, 4]`. You want a vector that points the same way but has length 1. Why does `v / ‖v‖ = [3/5, 4/5] = [0.6, 0.8]` work?

**The geometric argument:**

When you multiply a vector by a positive scalar `k`, you are stretching or shrinking the arrow without rotating it. Every component scales by the same factor, so all the ratios between components stay the same — and ratios between components determine direction.

```
v = [3, 4]          direction: "right 3, up 4" — slope of the arrow = 4/3

2 * v = [6, 8]      direction: "right 6, up 8" — slope = 8/6 = 4/3  ← same
v / 5 = [0.6, 0.8]  direction: "right 0.6, up 0.8" — slope = 0.8/0.6 = 4/3  ← same
```

Scaling changes the length. It does not change the direction. So:
- `v / ‖v‖` scales the vector so its new length is `‖v‖ / ‖v‖ = 1`
- The direction is preserved because we divided every component by the same number

**Formal check:**
After normalization: `‖v / ‖v‖‖ = ‖v‖ / ‖v‖ = 1`. The magnitude is always exactly 1.

**Why unit vectors matter:**
A unit vector is "pure direction, no magnitude." In linear algebra you will encounter:
- Normal vectors (perpendicular to a surface — must be length 1)
- Basis vectors (e₁ = [1,0,0], e₂ = [0,1,0], e₃ = [0,0,1] — unit vectors along each axis)
- Eigenvectors (typically reported as unit vectors)
- Cosine similarity (comparing directions of data vectors)

In all these cases you normalize to separate the "which way" from the "how far."

---

## Step 1 — Visualize the Right Triangle Behind Magnitude

Create `lab02.py`:

```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches   # for drawing the right-angle square

# ── The right triangle that proves magnitude ───────────────────────────────────

v = np.array([3.0, 4.0])

fig, ax = plt.subplots(figsize=(6, 6))

# Draw the vector itself
ax.quiver(0, 0, v[0], v[1],
          angles='xy', scale_units='xy', scale=1,
          color='blue', width=0.015,
          label=f'v = {v},  ‖v‖ = {np.linalg.norm(v):.1f}')

# Draw the right triangle legs
ax.plot([0, v[0]], [0, 0], color='red',   linewidth=2, label=f'x-component = {v[0]}')
ax.plot([v[0], v[0]], [0, v[1]], color='green', linewidth=2, label=f'y-component = {v[1]}')

# Right angle square at the corner of the triangle
sq = patches.Rectangle((v[0]-0.15, 0), 0.15, 0.15,
                        linewidth=1, edgecolor='black', facecolor='none')
ax.add_patch(sq)

# Label the hypotenuse
mid = v / 2
ax.text(mid[0] - 0.5, mid[1] + 0.1,
        f'‖v‖ = √({int(v[0])}² + {int(v[1])}²)\n= √{int(v[0]**2+v[1]**2)} = {np.linalg.norm(v):.0f}',
        fontsize=11, color='blue')

ax.set_xlim(-0.5, 5)
ax.set_ylim(-0.5, 5.5)
ax.set_aspect('equal')
ax.axhline(0, color='black', linewidth=0.5)
ax.axvline(0, color='black', linewidth=0.5)
ax.grid(True, alpha=0.3)
ax.legend(loc='upper left')
ax.set_title('Vector magnitude = hypotenuse of the right triangle')

plt.tight_layout()
plt.show()
```

### SAVE AND TRY

Run: `python lab02.py`

**You should see:** The vector `[3,4]` as a blue arrow, with red and green legs showing the x and y components forming a right triangle. The label shows the Pythagorean calculation.

**The point of this plot:** The formula `‖v‖ = √(x² + y²)` is not a definition to memorize. It is the Pythagorean theorem applied to the right triangle the vector makes with the axes. Every time you see a magnitude formula, you are seeing a triangle measurement.

**Change something:** Change `v` to `[1.0, 1.0]`. The right triangle now has both legs = 1, and the hypotenuse = √2 ≈ 1.414. This is the diagonal of a unit square. Change it back.

---

## Step 2 — Compute Magnitude and Normalize, Built From Scratch

Add to `lab02.py`:

```python
# ── Build magnitude from the formula, step by step ────────────────────────────

v = np.array([3.0, 4.0])

print("=== Building magnitude from Pythagorean theorem ===")
squared = v ** 2                       # square each component: [9. 16.]
sum_of_squares = np.sum(squared)       # sum them: 25.0
magnitude = np.sqrt(sum_of_squares)    # take square root: 5.0

print(f"v:                   {v}")
print(f"v² (each component): {squared}")
print(f"sum of squares:      {sum_of_squares}")
print(f"magnitude (√sum):    {magnitude}")
print(f"np.linalg.norm(v):   {np.linalg.norm(v)}")   # same answer, one call
print()

# ── Normalizing: preserving direction, setting length to 1 ────────────────────

unit_v = v / magnitude     # divide every component by the magnitude
# v = [3, 4],  magnitude = 5
# unit_v = [3/5, 4/5] = [0.6, 0.8]
# The ratio 3:4 is preserved → direction preserved
# New magnitude: √(0.6² + 0.8²) = √(0.36 + 0.64) = √1 = 1

print("=== Normalization ===")
print(f"v      = {v}")
print(f"‖v‖    = {magnitude}")
print(f"v/‖v‖  = {unit_v}")
print(f"‖v/‖v‖‖ = {np.linalg.norm(unit_v):.10f}")   # must be 1.0000000000
print()
print(f"Verify: {unit_v[0]:.1f}² + {unit_v[1]:.1f}² = "
      f"{unit_v[0]**2:.2f} + {unit_v[1]**2:.2f} = {unit_v[0]**2 + unit_v[1]**2:.2f}")
```

### SAVE AND TRY

**You should see** each intermediate step spelled out. The key line is the verification: `0.36 + 0.64 = 1.00`. The unit vector's components square and sum to 1 — that IS the Pythagorean theorem confirming the length is 1.

---

## The Math — What Is the Dot Product Actually Measuring?

The formula is `u · v = u₁v₁ + u₂v₂ + ... + uₙvₙ`.

That tells you how to compute it. It does not tell you what it means.

**The geometric meaning: projection and alignment**

The dot product measures "how much of `u` goes in the direction of `v`."

More precisely: if you project `u` onto `v` (find the shadow that `u` casts on the line through `v`), the dot product is the length of that shadow times the length of `v`.

```
         u
        /|
       / |
      /  |  ← perpendicular component of u
     /   |     (the part of u NOT in v's direction)
    /θ   |
───────────────→ v
    ←→
  proj of u onto v
  = ‖u‖ cos(θ)
```

The dot product formula connecting algebra to geometry:
```
u · v = ‖u‖ · ‖v‖ · cos(θ)
```

**Reading this formula:**
- `‖u‖ cos(θ)` is the length of the shadow u casts on v's direction
- Multiplied by `‖v‖` gives the dot product
- If you use unit vectors: `û · v̂ = cos(θ)` directly — the dot product of two unit vectors IS the cosine of the angle between them

**What the sign tells you:**

```
cos(0°)   =  1.0  → u and v point the same way → dot product positive
cos(90°)  =  0.0  → u and v are perpendicular  → dot product is zero
cos(180°) = -1.0  → u and v point opposite ways → dot product negative
```

**Why this matters in linear algebra:**
- `u · v = 0` is the algebraic definition of perpendicularity (orthogonality)
- The dot product appears in the projection formula (how much of one vector lies along another)
- The Gram-Schmidt process uses dot products to remove components in unwanted directions
- Every least-squares problem is built on dot products

**The formula `u · v = u₁v₁ + u₂v₂` is not arbitrary** — it is the unique bilinear operation that satisfies the geometric requirements: it equals zero when vectors are perpendicular, it scales linearly with magnitude, and it equals ‖v‖² when you dot a vector with itself.

---

## Concept: Computing the Dot Product in NumPy

The dot product is the sum of element-wise products:

```
u = [u₁, u₂]
v = [v₁, v₂]
u · v = u₁v₁ + u₂v₂
```

Two NumPy approaches:
```python
dot = np.sum(u * v)    # element-wise multiply then sum — shows the mechanism
dot = np.dot(u, v)     # dedicated function — same result
dot = u @ v            # @ operator — for vectors this is the dot product
```

All three give the same answer. Use `np.dot` or `@` in practice; use `np.sum(u * v)` when you want to see what is happening.

**Finding the angle:**
Rearrange `u · v = ‖u‖ · ‖v‖ · cos(θ)`:
```
cos(θ) = (u · v) / (‖u‖ · ‖v‖)
θ = arccos(u · v / (‖u‖ · ‖v‖))
```

`np.arccos` returns radians. `np.degrees()` converts to degrees.

---

## Step 3 — Compute Dot Products and Angles

Add to `lab02.py`:

```python
# ── Dot product: step by step ────────────────────────────────────────────────

u = np.array([1.0, 2.0])
v = np.array([3.0, 4.0])

print("=== Dot product, built up ===")
products = u * v                 # element-wise: [1×3, 2×4] = [3, 8]
dot = np.sum(products)           # sum: 3 + 8 = 11
print(f"u = {u},  v = {v}")
print(f"u * v (element-wise) = {products}")
print(f"sum = {dot}")
print(f"np.dot(u, v) = {np.dot(u, v)}")    # same answer
print()

# ── Angle from dot product ────────────────────────────────────────────────────
# u · v = ‖u‖ · ‖v‖ · cos(θ)
# cos(θ) = (u · v) / (‖u‖ · ‖v‖)
# θ = arccos(cos(θ))

cos_theta = dot / (np.linalg.norm(u) * np.linalg.norm(v))
theta = np.degrees(np.arccos(cos_theta))

print(f"cos(θ) = dot / (‖u‖ · ‖v‖) = {dot} / ({np.linalg.norm(u):.3f} × {np.linalg.norm(v):.3f})")
print(f"cos(θ) = {cos_theta:.4f}")
print(f"θ = arccos({cos_theta:.4f}) = {theta:.2f}°")
print()

# ── Verify the three cases: same direction, perpendicular, opposite ────────────

e1 = np.array([1.0, 0.0])    # unit vector along x-axis
e2 = np.array([0.0, 1.0])    # unit vector along y-axis — perpendicular to e1

print("=== Dot product cases (using unit vectors so ‖u‖‖v‖ = 1) ===")
print(f"Same direction:    [1,0] · [1,0]  = {np.dot(e1, e1):.1f}   (angle = 0°,   cos(0°) = 1.0)")
print(f"Perpendicular:     [1,0] · [0,1]  = {np.dot(e1, e2):.1f}   (angle = 90°,  cos(90°) = 0.0)")
print(f"Opposite:          [1,0] · [-1,0] = {np.dot(e1, -e1):.1f}  (angle = 180°, cos(180°) = -1.0)")
print()

# ── Finding a perpendicular vector ────────────────────────────────────────────
# To find a vector perpendicular to [a, b], use [-b, a]
# Proof: [a, b] · [-b, a] = a×(-b) + b×a = -ab + ab = 0

v = np.array([3.0, 4.0])
perp = np.array([-v[1], v[0]])   # rotate 90°: swap and negate the first
print(f"v = {v},  perp = {perp}")
print(f"v · perp = {np.dot(v, perp)}")    # must be 0
```

### SAVE AND TRY

**You should see** each step of the dot product computation, then the three special cases (0°, 90°, 180°). Note that `cos(90°) = 0` — that is not a coincidence or a definition. It is the algebraic consequence of two vectors being perpendicular.

**In the terminal — test your intuition:**
```python
python -c "import numpy as np; a=np.array([1,1]); b=np.array([1,-1]); print(np.dot(a,b), np.degrees(np.arccos(np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)))))"
```
Expected: `0.0  90.0` — `[1,1]` (northeast) and `[1,-1]` (southeast) are perpendicular.

---

## Step 4 — Visualize Dot Product and Angle

Add to `lab02.py`:

```python
# ── Visualize: vectors and the angle between them ─────────────────────────────

u = np.array([1.0, 2.0])
v = np.array([3.0, 4.0])

fig, ax = plt.subplots(figsize=(7, 7))

ax.quiver(0, 0, u[0], u[1], angles='xy', scale_units='xy', scale=1,
          color='red',  width=0.012, label=f'u = {u}')
ax.quiver(0, 0, v[0], v[1], angles='xy', scale_units='xy', scale=1,
          color='blue', width=0.012, label=f'v = {v}')

# Draw an arc showing the angle between them
theta_u = np.degrees(np.arctan2(u[1], u[0]))   # angle of u from x-axis
theta_v = np.degrees(np.arctan2(v[1], v[0]))   # angle of v from x-axis
arc = patches.Arc((0, 0), 1.0, 1.0,
                  angle=0, theta1=theta_u, theta2=theta_v,
                  color='purple', linewidth=2)
ax.add_patch(arc)
# Label the angle at the midpoint of the arc
mid_angle = np.radians((theta_u + theta_v) / 2)
ax.text(0.7 * np.cos(mid_angle), 0.7 * np.sin(mid_angle),
        f'{theta:.1f}°', fontsize=11, color='purple', ha='center')

# Annotate dot product value
ax.text(2.5, 0.5,
        f'u · v = {np.dot(u, v):.0f}\n= ‖u‖ · ‖v‖ · cos({theta:.1f}°)\n= {np.linalg.norm(u):.2f} × {np.linalg.norm(v):.2f} × {cos_theta:.3f}',
        fontsize=10, bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8))

ax.set_xlim(-1, 5.5)
ax.set_ylim(-1, 5.5)
ax.set_aspect('equal')
ax.axhline(0, color='black', linewidth=0.5)
ax.axvline(0, color='black', linewidth=0.5)
ax.grid(True, alpha=0.3)
ax.legend(loc='upper left')
ax.set_title('Dot product = ‖u‖ · ‖v‖ · cos(θ)')
plt.tight_layout()
plt.show()
```

### SAVE AND TRY

**You should see** both vectors as arrows with a purple arc marking the angle between them. The annotation box shows the dot product factored as magnitude × magnitude × cosine.

---

## 🏗️ Challenge: Decompose a Vector Into Two Perpendicular Parts

**The math you need:**

Any vector `u` can be split into two perpendicular pieces:
1. The part that lies along `v` (called the **projection of u onto v**)
2. The part that is perpendicular to `v` (the **rejection**)

These two pieces add back to `u`:
```
u = proj + rejection
```

The projection formula:
```
proj_v(u) = ( u·v / ‖v‖² ) × v
```

**Why this formula works:** `u·v / ‖v‖²` is a scalar that tells you "how many copies of v fit into u's shadow." Multiply by `v` to get the actual vector along v's direction.

**Why divide by ‖v‖²?** The dot product `u·v = ‖u‖‖v‖cos(θ)` gives the projection of u in the direction of v scaled by ‖v‖. Dividing by ‖v‖² normalizes this to get pure projection along v, regardless of v's length.

**What you're building:**
A function `decompose(u, v)` that:
1. Computes the projection of `u` onto `v`
2. Computes the rejection (the perpendicular part)
3. Verifies they are actually perpendicular (`dot(proj, rejection) ≈ 0`)
4. Verifies they add back to `u`
5. Plots all three vectors: `u`, `proj`, and `rejection` (starting from the tip of `proj`)

**Requirements:**
- [ ] `proj + rejection` equals `u` for any inputs
- [ ] `np.dot(proj, rejection) < 1e-10` (perpendicular, allowing floating-point error)
- [ ] Works for 3D vectors, not just 2D
- [ ] The plot shows `rejection` starting from the TIP of `proj`, not the origin

**Starter code:**
```python
import numpy as np

def decompose(u, v):
    """Split u into components parallel and perpendicular to v."""
    u = np.array(u, dtype=float)
    v = np.array(v, dtype=float)

    # TODO: compute projection (the part of u along v)
    # Formula: (np.dot(u, v) / np.dot(v, v)) * v

    # TODO: compute rejection (the part of u perpendicular to v)
    # Formula: u - projection

    # TODO: return both
    pass

u = np.array([2.0, 3.0])
v = np.array([4.0, 1.0])

proj, rej = decompose(u, v)
print(f"u = {u}")
print(f"Projection onto v: {proj}")
print(f"Rejection from v:  {rej}")
print(f"proj + rej = u: {np.allclose(proj + rej, u)}")
print(f"proj ⊥ rej (dot ≈ 0): {np.isclose(np.dot(proj, rej), 0)}")
```

**When you're done:** Both print checks show `True`. The plot shows three arrows — `u` going all the way, `proj` going partway in v's direction, and `rej` continuing at a right angle from the tip of `proj` to reach the tip of `u`.

**Stuck?** Ask AI: "Geometrically, why does subtracting the projection from u give the perpendicular component? Draw it on paper first, then explain the algebra."

---

## Final Check

| What to check | How to verify |
|---|---|
| Right triangle plot is correct | 3-4-5 triangle visible; magnitude labeled as 5 |
| Normalization formula shown step by step | Squared components, sum, sqrt all printed |
| Unit vector magnitude is 1.0000000000 | Ten decimal places of precision |
| Dot product = 11 for `[1,2]` and `[3,4]` | Element-wise products [3,8] then sum 11 |
| 90° case gives dot = 0 | `[1,0] · [0,1] = 0.0` |
| Opposite case gives dot = -1 | `[1,0] · [-1,0] = -1.0` |
| Perpendicular vector construction works | `v · perp = 0.0` |
| Angle plot shows labeled arc | Purple arc between the two arrows |

---

## Quick Check Answers

**1. The right triangle behind `[3, 4]`:**
The vector forms a right triangle where the horizontal leg = 3 (the x-component), the vertical leg = 4 (the y-component), and the vector itself is the hypotenuse. Pythagorean theorem: `c² = 3² + 4² = 25`, so `c = 5`. The magnitude formula is not a separate definition — it IS the Pythagorean theorem applied to the components.

**2. Halve every component — direction and magnitude:**
Direction stays the same — halving every component scales all the ratios equally, so the arrow points the same way. Magnitude is halved — `‖(0.5v)‖ = 0.5‖v‖`. Scaling a vector by any positive constant stretches or shrinks the arrow without rotating it. Scaling by a negative constant flips the direction.

**3. Same direction vectors `[1,0]` and `[100,0]`:**
Angle = 0°. Dot product of the unit versions = `[1,0] · [1,0] = 1`. For the actual vectors: `[1,0] · [100,0] = 100`. The raw dot product is large because one vector is large, but the geometric angle is zero. This is why using unit vectors (`û · v̂ = cos(θ)`) gives the angle directly without the magnitudes interfering.
