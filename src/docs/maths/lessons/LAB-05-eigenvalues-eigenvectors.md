# Computational Mathematics — LAB 05 — Eigenvalues and Eigenvectors

**Prerequisites:** LAB-01 (NumPy), LAB-02 (vectors, dot product), LAB-04 (matrix multiplication)
**Environment:** Python 3.10+ | pip install numpy matplotlib sympy | python lab05.py
**Time:** 75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. When you multiply a vector by a matrix, what two things can happen to the vector geometrically?
> 2. If `Av = 3v`, what does that tell you about what A does to the vector v?
> 3. *(Prediction)* A 2×2 matrix has two eigenvalues. Could they both be the same number? Could they be negative? Could they be zero?
>
> *(Answers at the end)*

---

## What You Will Build

```
=== The transformation ===
A = [[3, 1],
     [0, 2]]

=== Characteristic polynomial ===
det(A - λI) = (3 - λ)(2 - λ) - 0 = λ² - 5λ + 6 = 0

=== Eigenvalues ===
λ₁ = 3,  λ₂ = 2

=== Eigenvectors ===
For λ₁ = 3:  v₁ = [1, 0]
For λ₂ = 2:  v₂ = [1, -1]

=== Verification ===
A @ v₁ = [3, 0] = 3 * [1, 0]  ✓
A @ v₂ = [1, -2] = 2 * [1, -1] ... wait, is that right?
```

Plus a visualization showing random vectors before and after transformation — the eigenvectors stand out because they are the only ones that do not rotate.

---

## Step 1 — The Geometry (Start Here, Before Any Formula)

### What problem are we actually solving?

Take any matrix A and any vector v. Multiply them: `Av`. The result is a new vector. In general, two things happen to that new vector compared to the original: it **rotates** (points in a different direction) and it **scales** (changes length).

Here is the question: **are there any special vectors that skip the rotation entirely — vectors where Av points in exactly the same direction as v, just longer or shorter?**

Those special vectors are called **eigenvectors**. The scaling factor is the **eigenvalue**.

Geometrically: if you imagine the matrix as a machine that warps space, eigenvectors are the directions in space that do not bend — they only stretch or compress.

```
Normal vector v:   Av points somewhere else entirely (rotated AND scaled)
Eigenvector v:     Av = λv  (only scaled, same direction or exactly reversed)
```

### See it before computing it

Create the file `lab05.py` and paste this:

```python
import numpy as np
import matplotlib.pyplot as plt

# --- The matrix we will study for this entire lab ---
A = np.array([[3, 1],
              [0, 2]], dtype=float)  # 2x2 matrix, float so division works cleanly

# --- Generate 24 unit vectors spread in a full circle ---
# np.linspace: evenly spaced angles from 0 to 2π (one full rotation)
angles = np.linspace(0, 2 * np.pi, 24, endpoint=False)

# Each column is one unit vector: [cos(θ), sin(θ)]
# This gives us vectors pointing in every direction around the circle
unit_vectors = np.array([np.cos(angles), np.sin(angles)])  # shape (2, 24)

# --- Apply the matrix to every vector at once ---
# A @ unit_vectors: matrix-multiplies A (2x2) by the 2x24 grid of vectors
# Result: 2x24 grid of transformed vectors
transformed = A @ unit_vectors  # each column is A applied to one unit vector

# --- Plot: before (blue) and after (red) ---
fig, ax = plt.subplots(figsize=(8, 8))
ax.set_aspect('equal')
ax.axhline(0, color='gray', linewidth=0.5)
ax.axvline(0, color='gray', linewidth=0.5)
ax.set_title('Matrix A applied to unit circle vectors\nBlue = original, Red = transformed')

origin = np.zeros(2)  # both arrows start at the origin

for i in range(24):
    v_orig = unit_vectors[:, i]   # original unit vector
    v_trans = transformed[:, i]   # where it went after A was applied

    # Draw original vector in blue, small alpha so they do not clutter
    ax.annotate('', xy=v_orig, xytext=origin,
                arrowprops=dict(arrowstyle='->', color='blue', alpha=0.4))

    # Draw transformed vector in red
    ax.annotate('', xy=v_trans, xytext=origin,
                arrowprops=dict(arrowstyle='->', color='red', alpha=0.4))

plt.tight_layout()
plt.savefig('lab05_step1_geometry.png', dpi=100)
plt.show()
print("Step 1 plot saved: lab05_step1_geometry.png")
```

**RUN AND TEST:** `python lab05.py`

Look at the plot. Notice how most red arrows point in a completely different direction from their blue counterparts. The matrix is rotating AND scaling them. But look carefully — can you spot any red arrows that seem to point in the same direction as their blue originals? Those are near the eigenvectors. We will find them exactly in later steps.

---

## Step 2 — The Mathematical Definition

### Concept: The equation Ax = λx

Now that you have seen the geometry, here is the precise definition:

A vector **x** (not the zero vector) is an **eigenvector** of matrix A if there exists a scalar **λ** such that:

```
Ax = λx
```

Read this as: "multiplying x by the matrix A gives the same result as multiplying x by the scalar λ." The direction does not change (or flips if λ is negative). Only the length changes.

The scalar **λ** (Greek letter lambda) is the **eigenvalue** corresponding to that eigenvector.

### Examples of what this means physically

| λ value | Effect on the eigenvector |
|---------|--------------------------|
| λ = 3 | stretches the vector to 3× its length |
| λ = 0.5 | shrinks the vector to half its length |
| λ = 1 | leaves the vector completely unchanged |
| λ = -1 | flips the vector to point the opposite direction, same length |
| λ = 0 | collapses the vector to zero (the matrix is singular in that direction) |

Add this check to `lab05.py`:

```python
# --- Demonstrate the definition Ax = λx by brute force ---
# We will verify that [1, 0] is an eigenvector of A with λ = 3

v1 = np.array([1.0, 0.0])   # candidate eigenvector
lam1 = 3.0                   # candidate eigenvalue

Av1 = A @ v1          # left side: apply the matrix
lam_v1 = lam1 * v1   # right side: just scale the vector

print("=== Verifying Av = λv ===")
print(f"v1         = {v1}")
print(f"A @ v1     = {Av1}")        # should be [3, 0]
print(f"3 * v1     = {lam_v1}")     # should also be [3, 0]
print(f"They match: {np.allclose(Av1, lam_v1)}")  # allclose: handles float rounding
print()
```

**RUN AND TEST:** `python lab05.py`

You should see that `A @ v1` and `3 * v1` produce the same vector. This is what an eigenvector relationship looks like — the matrix and the scalar do identical things to that one special vector.

---

## Step 3 — Deriving the Characteristic Equation (Why the Method Works)

### Concept: How do we find eigenvectors without guessing?

We cannot just test every possible vector — there are infinitely many. We need an algebraic method.

Start from the definition:

```
Ax = λx
```

Rewrite the right side using the identity matrix I (multiplying by I does nothing, so Ix = x):

```
Ax = λIx
```

Move everything to the left side:

```
Ax - λIx = 0
(A - λI)x = 0         ← factor out x
```

Now ask: when does `(A - λI)x = 0` have a solution where x is not the zero vector?

This is a system of linear equations. From LAB-03 you know that a homogeneous system `Mx = 0` has a non-trivial solution (x ≠ 0) only when M is **singular** — meaning it cannot be inverted, meaning its determinant is zero.

So we need:

```
det(A - λI) = 0
```

This equation in λ is called the **characteristic equation** (or characteristic polynomial). Solving it gives us the eigenvalues. Then we plug each eigenvalue back in and solve `(A - λI)x = 0` to get the eigenvectors.

### Build the 2×2 determinant from scratch

Add this to `lab05.py`:

```python
# --- Build det() for a 2x2 matrix from scratch ---
# For a 2x2 matrix [[a, b], [c, d]], the determinant is ad - bc
# This is the signed area of the parallelogram formed by the two rows

def det2x2(M):
    """
    Compute determinant of a 2x2 matrix.
    det([[a,b],[c,d]]) = a*d - b*c
    This tells us whether the matrix is invertible:
      det != 0  →  invertible (non-singular)
      det == 0  →  NOT invertible (singular) — this is what we want for eigenvalues
    """
    a = M[0][0]   # top-left
    b = M[0][1]   # top-right
    c = M[1][0]   # bottom-left
    d = M[1][1]   # bottom-right
    return a * d - b * c   # the fundamental 2x2 determinant formula

# --- Test our det2x2 ---
print("=== Testing det2x2 ===")
test_M = np.array([[4, 2], [1, 3]])
print(f"M = {test_M}")
print(f"det2x2(M) = {det2x2(test_M)}")          # should be 4*3 - 2*1 = 10
print(f"np.linalg.det(M) = {np.linalg.det(test_M):.4f}")   # confirm with NumPy
print()
```

**RUN AND TEST:** `python lab05.py`

Both should give 10. Now we trust our `det2x2` function.

---

## Step 4 — By Hand: Characteristic Polynomial for A = [[3,1],[0,2]]

### Concept: Computing det(A - λI) symbolically

We have:

```
A = [[3, 1],
     [0, 2]]

I = [[1, 0],
     [0, 1]]

λI = [[λ, 0],
      [0, λ]]

A - λI = [[3-λ,  1 ],
          [0,   2-λ]]
```

Now apply the determinant formula:

```
det(A - λI) = (3-λ)(2-λ) - (1)(0)
             = (3-λ)(2-λ)
             = 6 - 3λ - 2λ + λ²
             = λ² - 5λ + 6
```

Set this equal to zero and factor:

```
λ² - 5λ + 6 = 0
(λ - 3)(λ - 2) = 0

λ₁ = 3,  λ₂ = 2
```

### Implement the characteristic polynomial by hand in Python

Add this to `lab05.py`:

```python
# --- Compute the characteristic polynomial by hand ---
# We will evaluate det(A - λI) for a range of λ values
# The eigenvalues are where this function equals zero

def char_poly_2x2(A, lam):
    """
    Compute det(A - λI) for a 2x2 matrix A and scalar λ.
    This is the characteristic polynomial evaluated at λ.
    The roots of this function are the eigenvalues.
    """
    # Build (A - λI) by subtracting λ from each diagonal entry
    A_minus_lI = np.array([[A[0, 0] - lam,  A[0, 1]      ],
                            [A[1, 0],         A[1, 1] - lam]])
    return det2x2(A_minus_lI)   # the determinant of that matrix

# --- Evaluate at the eigenvalues we found by hand ---
print("=== Characteristic polynomial at eigenvalues ===")
print(f"det(A - 3I) = {char_poly_2x2(A, 3)}")   # should be 0
print(f"det(A - 2I) = {char_poly_2x2(A, 2)}")   # should be 0
print(f"det(A - 1I) = {char_poly_2x2(A, 1)}")   # should NOT be 0 (1 is not an eigenvalue)
print()

# --- Plot the characteristic polynomial as a curve ---
# Where the curve crosses zero on the x-axis, those are the eigenvalues
lam_range = np.linspace(-1, 5, 300)   # test λ values from -1 to 5
poly_values = [char_poly_2x2(A, lam) for lam in lam_range]  # evaluate at each λ

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(lam_range, poly_values, 'b-', linewidth=2, label='det(A - λI)')
ax.axhline(0, color='black', linewidth=1)    # the zero line — roots are where curve crosses this
ax.axvline(2, color='red', linestyle='--', label='λ = 2 (eigenvalue)')
ax.axvline(3, color='green', linestyle='--', label='λ = 3 (eigenvalue)')
ax.scatter([2, 3], [0, 0], color='red', s=80, zorder=5)  # mark the roots
ax.set_xlabel('λ')
ax.set_ylabel('det(A - λI)')
ax.set_title('Characteristic polynomial — roots are eigenvalues')
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('lab05_step4_char_poly.png', dpi=100)
plt.show()
print("Step 4 plot saved: lab05_step4_char_poly.png")
```

**RUN AND TEST:** `python lab05.py`

The polynomial curve should cross zero exactly at λ = 2 and λ = 3 — the eigenvalues we found by hand. This is the visual proof of our algebra.

---

## Step 5 — Finding Eigenvectors by Solving (A - λI)x = 0

### Concept: Back-substituting each eigenvalue

Once we have an eigenvalue λ, we plug it back into `(A - λI)x = 0` and solve for x using row reduction (from LAB-03). The solution is the eigenvector.

**For λ₁ = 3:**

```
A - 3I = [[3-3,  1 ],   =   [[0,  1],
           [0,  2-3]]         [0, -1]]

System: 0·x₁ + 1·x₂ = 0
        0·x₁ - 1·x₂ = 0

Both equations say: x₂ = 0
x₁ is free (can be anything).
Set x₁ = 1  →  eigenvector v₁ = [1, 0]
```

**For λ₂ = 2:**

```
A - 2I = [[3-2,  1 ],   =   [[1,  1],
           [0,  2-2]]         [0,  0]]

System: 1·x₁ + 1·x₂ = 0
        (second row is all zeros — no new information)

One equation: x₁ = -x₂
x₂ is free. Set x₂ = -1  →  x₁ = 1  →  eigenvector v₂ = [1, -1]
```

Note: eigenvectors are **not unique** — any scalar multiple of an eigenvector is also an eigenvector. NumPy will return unit-length (normalized) eigenvectors.

### Implement eigenvector solving from scratch

Add this to `lab05.py`:

```python
# --- Solve (A - λI)x = 0 by hand for a 2x2 system ---
# For a 2x2 system this is straightforward:
# The matrix (A - λI) has rank 1 at an eigenvalue,
# so one row gives us the constraint and we set the free variable to 1

def find_eigenvector_2x2(A, lam):
    """
    Find an eigenvector for eigenvalue lam using row reduction.
    Works for 2x2 matrices only.
    Returns an unnormalized eigenvector.
    """
    # Build A - λI
    M = np.array([[A[0, 0] - lam,  A[0, 1]     ],
                  [A[1, 0],         A[1, 1] - lam]], dtype=float)

    # Row 0 of M gives us: M[0,0]*x1 + M[0,1]*x2 = 0
    # If M[0,0] is near zero (which happens for upper-triangular A when lam=diagonal),
    # use row 1 instead
    if abs(M[0, 0]) > 1e-10:
        # Use row 0: x1 = -M[0,1]/M[0,0] * x2
        # Set x2 = 1 (free variable = 1)
        x2 = 1.0
        x1 = -M[0, 1] / M[0, 0] * x2
    else:
        # Row 0 tells us x2 = 0, so x1 is free
        x1 = 1.0
        x2 = 0.0

    return np.array([x1, x2])

# --- Find eigenvectors for our two eigenvalues ---
lam1, lam2 = 3.0, 2.0

v1_manual = find_eigenvector_2x2(A, lam1)
v2_manual = find_eigenvector_2x2(A, lam2)

print("=== Eigenvectors found by hand ===")
print(f"For λ = {lam1}: eigenvector = {v1_manual}")
print(f"For λ = {lam2}: eigenvector = {v2_manual}")
print()

# --- Verify: A @ v should equal λ * v ---
# This is the fundamental check — if this fails, something is wrong
print("=== Verification: A @ v == λ * v ===")
for lam, v in [(lam1, v1_manual), (lam2, v2_manual)]:
    Av = A @ v              # apply the matrix
    lam_v = lam * v         # scale the original vector
    match = np.allclose(Av, lam_v)   # check they are equal (within floating point)
    print(f"λ = {lam}: A@v = {Av}, λ*v = {lam_v}, match = {match}")
print()
```

**RUN AND TEST:** `python lab05.py`

Both verifications should print `match = True`. If they do, your hand-coded eigenvector solver works correctly.

---

## Step 6 — NumPy's np.linalg.eig

### Concept: What NumPy returns and how to read it

Now that you understand what eigenvalues and eigenvectors ARE (because you built them from scratch), you can use NumPy's fast built-in solver.

The function is: `eigenvalues, eigenvectors = np.linalg.eig(A)`

**Critical detail:** The eigenvectors are stored as **columns**, not rows. The k-th eigenvector is `eigenvectors[:, k]` — colon means all rows, k means column k.

Add this to `lab05.py`:

```python
# --- NumPy eigenvalue decomposition ---
# np.linalg.eig uses LAPACK routines under the hood (highly optimized Fortran code)
eigenvalues, eigenvectors = np.linalg.eig(A)

print("=== np.linalg.eig results ===")
print(f"Eigenvalues:  {eigenvalues}")
print(f"Eigenvectors matrix:\n{eigenvectors}")
print()
print("IMPORTANT: columns, not rows, are the eigenvectors")
print(f"  First eigenvector  (column 0): {eigenvectors[:, 0]}")   # [:, 0] = all rows, col 0
print(f"  Second eigenvector (column 1): {eigenvectors[:, 1]}")   # [:, 1] = all rows, col 1
print()

# --- Verify each pair: A @ v should equal λ * v ---
print("=== NumPy verification: A @ v == λ * v ===")
for k in range(len(eigenvalues)):
    lam = eigenvalues[k]            # k-th eigenvalue
    v = eigenvectors[:, k]          # k-th eigenvector (k-th COLUMN)
    Av = A @ v                      # apply matrix
    lam_v = lam * v                 # scale vector
    match = np.allclose(Av, lam_v)  # should be True for every pair
    print(f"k={k}: λ={lam:.4f}, A@v={Av}, λ*v={lam_v}, match={match}")
print()

# --- Compare hand results to NumPy results ---
# NumPy normalizes eigenvectors to unit length, so magnitudes differ
# But the direction must match (or be exactly opposite — a flip is also valid)
print("=== Comparing hand vs NumPy (directions should match) ===")
# For v1: [1, 0] vs NumPy's first eigenvector
v1_numpy = eigenvectors[:, 0]
print(f"Hand v1 = {v1_manual},  NumPy v1 = {v1_numpy}")
# Normalize hand result to compare directions
v1_norm = v1_manual / np.linalg.norm(v1_manual)  # linalg.norm = vector length
print(f"Normalized hand v1 = {v1_norm}")
print()
```

**RUN AND TEST:** `python lab05.py`

NumPy will give normalized (unit-length) eigenvectors. The direction should match your hand-computed result (or be exactly flipped — both are valid eigenvectors, since -v is also an eigenvector if v is).

---

## Step 7 — SymPy: The Characteristic Polynomial as an Exact Expression

### Concept: Symbolic vs numeric computation

NumPy gives floating-point numbers. SymPy gives exact algebraic expressions. For understanding eigenvalues, SymPy lets us see the characteristic polynomial written out as algebra, not just numbers.

Add this to `lab05.py`:

```python
import sympy as sp

# --- Compute the characteristic polynomial symbolically ---
lam = sp.Symbol('lambda')    # create a symbolic variable called λ

# Build A as a SymPy matrix so it can do symbolic determinants
A_sym = sp.Matrix([[3, 1],
                   [0, 2]])

# Build the identity matrix scaled by λ
I_sym = sp.eye(2)   # 2x2 identity: [[1,0],[0,1]]

# Compute A - λI  symbolically
A_minus_lI_sym = A_sym - lam * I_sym
print("=== A - λI (symbolic) ===")
sp.pprint(A_minus_lI_sym)
print()

# Compute the determinant as a polynomial in λ
char_poly_sym = A_minus_lI_sym.det()
print("=== Characteristic polynomial det(A - λI) ===")
sp.pprint(char_poly_sym)   # pprint = "pretty print" — shows it as formatted math
print()

# Factor the polynomial — this gives (λ-3)(λ-2)
char_poly_factored = sp.factor(char_poly_sym)
print("=== Factored form ===")
sp.pprint(char_poly_factored)
print()

# Solve for the roots (eigenvalues)
eigenvals_sym = sp.solve(char_poly_sym, lam)   # find where polynomial = 0
print(f"=== Eigenvalues (exact symbolic roots) ===")
print(f"λ = {eigenvals_sym}")
print()

# SymPy can also compute eigenvectors directly
print("=== SymPy eigenvectors ===")
# .eigenvects() returns list of (eigenvalue, multiplicity, [eigenvectors])
for eigenval, mult, evects in A_sym.eigenvects():
    print(f"  λ = {eigenval}, multiplicity = {mult}, eigenvector = {evects[0].T}")
print()
```

**RUN AND TEST:** `python lab05.py`

SymPy should print the characteristic polynomial as `λ² - 5λ + 6`, factored as `(λ-2)(λ-3)`, and solve it to `[2, 3]`. This is the same result as your hand calculation, but computed by the computer as pure algebra.

---

## Step 8 — Visualization: Eigenvectors Are the Special Directions

### Concept: Drawing the transformation to see eigenvectors

The best way to understand what eigenvectors are is to draw them on top of the transformation picture from Step 1.

Add this to `lab05.py`:

```python
# --- Final visualization: show eigenvectors on top of the transformation ---
fig, axes = plt.subplots(1, 2, figsize=(14, 7))

# ---- LEFT PLOT: arrows before and after, with eigenvectors highlighted ----
ax = axes[0]
ax.set_aspect('equal')
ax.set_xlim(-4, 5)
ax.set_ylim(-4, 5)
ax.axhline(0, color='gray', linewidth=0.5)
ax.axvline(0, color='gray', linewidth=0.5)
ax.set_title('Blue=original, Red=transformed, Green=eigenvectors')

origin = np.zeros(2)

# Draw random unit vectors before and after transformation
angles_plot = np.linspace(0, 2 * np.pi, 20, endpoint=False)
for angle in angles_plot:
    v = np.array([np.cos(angle), np.sin(angle)])   # unit vector at this angle
    Av = A @ v                                       # transformed vector

    # Original in blue
    ax.annotate('', xy=v, xytext=origin,
                arrowprops=dict(arrowstyle='->', color='royalblue', alpha=0.5, lw=1.0))
    # Transformed in red
    ax.annotate('', xy=Av, xytext=origin,
                arrowprops=dict(arrowstyle='->', color='tomato', alpha=0.5, lw=1.0))

# Draw eigenvectors in green — much thicker so they stand out
ev1 = eigenvectors[:, 0]   # first eigenvector (unit length from NumPy)
ev2 = eigenvectors[:, 1]   # second eigenvector (unit length from NumPy)

# Draw eigenvector directions (scaled up so they are visible)
scale = 2.5
for ev, lam_val, label in [(ev1, eigenvalues[0], 'v₁ (λ=3)'), 
                             (ev2, eigenvalues[1], 'v₂ (λ=2)')]:
    ax.annotate('', xy=scale * ev, xytext=origin,
                arrowprops=dict(arrowstyle='->', color='green', lw=2.5))
    ax.text(scale * ev[0] + 0.1, scale * ev[1] + 0.1, label,
            color='darkgreen', fontsize=10, fontweight='bold')

    # Also draw the TRANSFORMED eigenvector (should be along same direction)
    Aev = A @ ev   # should equal λ * ev, i.e., just scaled, same direction
    ax.annotate('', xy=Aev, xytext=origin,
                arrowprops=dict(arrowstyle='->', color='limegreen', lw=2.0,
                                linestyle='dashed'))

ax.legend(handles=[
    plt.Line2D([0], [0], color='royalblue', label='Original'),
    plt.Line2D([0], [0], color='tomato', label='Transformed'),
    plt.Line2D([0], [0], color='green', lw=2, label='Eigenvectors'),
    plt.Line2D([0], [0], color='limegreen', lw=2, linestyle='dashed',
               label='Transformed eigenvectors'),
], fontsize=8)

# ---- RIGHT PLOT: unit circle → ellipse, eigenvectors are principal axes ----
ax2 = axes[1]
ax2.set_aspect('equal')
ax2.set_title('Unit circle → ellipse under A\nEigenvectors = axes of the ellipse')

# Create a dense circle of vectors
angles_circle = np.linspace(0, 2 * np.pi, 200)
circle = np.array([np.cos(angles_circle), np.sin(angles_circle)])  # (2, 200) circle

# Transform the entire circle at once
ellipse = A @ circle   # each column is A applied to one point on the circle

# Plot the original circle and the resulting ellipse
ax2.plot(circle[0], circle[1], 'b-', linewidth=1.5, label='Unit circle')
ax2.plot(ellipse[0], ellipse[1], 'r-', linewidth=1.5, label='Transformed (ellipse)')
ax2.axhline(0, color='gray', linewidth=0.5)
ax2.axvline(0, color='gray', linewidth=0.5)

# Draw eigenvectors scaled to show they align with the ellipse axes
for ev, lam_val, col in [(ev1, eigenvalues[0], 'green'),
                          (ev2, eigenvalues[1], 'darkgreen')]:
    # The eigenvector in the transformed space is λ * ev (eigenvalue × direction)
    # This gives the actual axis length of the ellipse in that direction
    axis_end = lam_val * ev   # where the ellipse extends in the eigenvector direction
    ax2.annotate('', xy=axis_end, xytext=origin,
                arrowprops=dict(arrowstyle='->', color=col, lw=2.5))
    ax2.text(axis_end[0] + 0.1, axis_end[1] + 0.1,
             f'λ={lam_val:.0f}', color=col, fontsize=10, fontweight='bold')

ax2.legend()

plt.tight_layout()
plt.savefig('lab05_step8_eigenvectors.png', dpi=100)
plt.show()
print("Step 8 plot saved: lab05_step8_eigenvectors.png")
```

**RUN AND TEST:** `python lab05.py`

In the left plot, the green eigenvector arrows and the dashed green arrows (transformed eigenvectors) should lie along the same line — proof that the matrix only stretches them. In the right plot, the eigenvectors should align with the principal axes (longest and shortest directions) of the ellipse.

---

## Step 9 — Putting It All Together: Full Summary Print

Add this block at the end of `lab05.py` to produce a clean summary:

```python
# --- Final summary: print everything neatly ---
print("=" * 50)
print("FULL EIGENVALUE DECOMPOSITION SUMMARY")
print("=" * 50)
print(f"\nMatrix A:\n{A}")
print()
print(f"Eigenvalues:  {eigenvalues}")
print()
print("Eigenvectors (each column is one eigenvector):")
print(eigenvectors)
print()

for k in range(len(eigenvalues)):
    lam = eigenvalues[k]
    v = eigenvectors[:, k]
    Av = A @ v
    lam_v = lam * v
    print(f"  Pair {k+1}:")
    print(f"    λ = {lam:.6f}")
    print(f"    v = {v}")
    print(f"    A @ v     = {Av}")
    print(f"    λ * v     = {lam_v}")
    print(f"    |A@v - λv| = {np.linalg.norm(Av - lam_v):.2e}")   # error, should be ~0
    print()
```

**RUN AND TEST:** `python lab05.py`

The error `|A@v - λv|` should be essentially zero (something like `1.11e-16`) for each pair. That tiny number is floating-point rounding, not an error in the math.

---

## Challenge

A **symmetric matrix** is one where A = Aᵀ (the matrix equals its own transpose). For example:

```
S = [[4, 2],
     [2, 3]]
```

Note: `S[0,1] == S[1,0]` (the off-diagonal entries are equal).

Symmetric matrices have a special theorem: their eigenvalues are always real, and their eigenvectors are always **orthogonal** (perpendicular to each other — dot product equals zero).

Your task:

1. Using `S = np.array([[4, 2], [2, 3]], dtype=float)`, compute eigenvalues and eigenvectors using `np.linalg.eig`.

2. Verify that the two eigenvectors of S are orthogonal. The dot product of two perpendicular vectors is zero. Use `np.dot(v1, v2)` and confirm the result is very close to zero.

3. Visualize: transform a circle of points using S, then draw both eigenvectors on the resulting ellipse. Confirm visually that they are perpendicular AND aligned with the ellipse axes.

4. Verify the A² rule: if Av = λv, then A²v = λ²v. Check this for both eigenvectors of S by computing `S @ S @ v` and comparing it to `λ**2 * v`.

**When you're done:**

- What eigenvalues did you find for S?
- Is the dot product of the eigenvectors truly zero (within floating-point rounding)?
- Do the eigenvectors visually look perpendicular in your plot?
- Does the A² rule hold for both pairs?

**Stuck?** Ask AI: "Why are eigenvectors of a symmetric matrix always perpendicular to each other? Show me a proof using the definition Av = λv and the transpose."

---

## Quick Check Answers

1. When you multiply a vector by a matrix, the vector generally **rotates** (changes direction) AND **scales** (changes length). Both can happen simultaneously.

2. If `Av = 3v`, the matrix A stretches the vector v to **3 times its original length** without changing its direction. The eigenvalue 3 means "scale by 3 in this direction."

3. Yes to all three. Two eigenvalues can be equal (called a "repeated eigenvalue"). Eigenvalues can be negative (the eigenvector flips direction). Eigenvalues can be zero (the matrix collapses that eigenvector direction to the zero vector, which means the matrix is singular and has no inverse).

---

## Concept Summary

| Term | Meaning |
|------|---------|
| Eigenvector | A special vector that only scales (no rotation) when multiplied by A |
| Eigenvalue | The scaling factor λ for that eigenvector: `Av = λv` |
| Characteristic equation | `det(A - λI) = 0` — solving this gives the eigenvalues |
| Characteristic polynomial | The polynomial in λ whose roots are the eigenvalues |
| `np.linalg.eig(A)` | Returns (eigenvalues, eigenvectors_as_columns) |
| `eigenvectors[:, k]` | The k-th eigenvector (column k, not row k) |
| Symmetric matrix | A matrix where `A == Aᵀ`; always has real, orthogonal eigenvectors |

## What comes next

- **LAB-06** — Eigenvalue decomposition and diagonalization: `A = PDP⁻¹` where D is a diagonal matrix of eigenvalues
- **LAB-07** — Singular Value Decomposition (SVD): the generalization of eigenvalues to non-square matrices, and the foundation of PCA
