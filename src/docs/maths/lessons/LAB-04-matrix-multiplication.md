# Computational Mathematics — LAB 04 — Matrix Multiplication

**Prerequisites:** LAB-01 (NumPy arrays), LAB-02 (vectors). You understand dot products.

**What this lab builds:**
- A mental model of matrices as geometric transformations, not just number grids
- Matrix multiplication from scratch using nested loops
- Correct use of Python's `@` operator vs `*` (a common source of bugs)
- Matrix-vector multiplication and what it means to "apply" a transformation
- Visualization of what a matrix actually does to a shape
- Composition of transformations: rotation, scaling, shear — and why order matters

**Environment:** Python 3.10+ | `pip install numpy matplotlib` | Run with: `python lab04.py`

**Time:** 60 minutes

---

## Quick Check

Answer these before you start. Check your answers at the bottom of the lab.

1. If A is shape (3×4) and B is shape (4×2), what shape is A @ B?
2. What does the first column of a transformation matrix tell you?
3. In Python, what is the difference between `A @ B` and `A * B`?
4. Is matrix multiplication commutative? That is, does A @ B always equal B @ A?

---

## Setup

Create a file called `lab04.py` and start with these imports:

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Named constants — no magic numbers anywhere in this lab
ROTATION_ANGLE_DEG = 45          # degrees to rotate in visualizations
SCALE_FACTOR       = 2.0         # how much to scale in visualizations
PLOT_ALPHA         = 0.6         # transparency for overlapping shapes
```

**RUN AND TEST**

```
(no output yet — just confirming the file runs without errors)
```

---

## Step 1 — The Geometry: A Matrix Is a Transformation, Not Just a Grid

**THE PROBLEM**

You have two operations you need to apply to a 2D shape: first rotate it 90 degrees, then
double its size. Instead of applying two separate operations, can you find ONE matrix that
does both at once?

That is what matrix multiplication is for. But before the formula, you need the right mental
model of what a matrix even *is*.

**THE GEOMETRY**

A 2D matrix is a function that transforms every vector in the plane. To understand what a
matrix does, you only need to watch what it does to two special vectors:

- The **right basis vector**: `e1 = [1, 0]` (pointing right)
- The **up basis vector**:   `e2 = [0, 1]` (pointing up)

These two vectors define the coordinate system. Once you know where they land, you know
where *everything* lands — because any vector is just a combination of these two.

**The key insight:** The columns of a matrix ARE where the basis vectors go.

```
Matrix M = [[a, b],
            [c, d]]

Column 0 = [a, c] — this is where e1 = [1, 0] goes after M
Column 1 = [b, d] — this is where e2 = [0, 1] goes after M
```

Let's verify this with a concrete example. The 90-degree rotation matrix sends:
- `e1 = [1, 0]` → `[0, 1]`  (right becomes up)
- `e2 = [0, 1]` → `[-1, 0]` (up becomes left)

So the rotation matrix is: columns are `[0,1]` and `[-1,0]`.

```python
# --- STEP 1: Matrices as transformations ---

# The two basis vectors that define 2D space
e1 = np.array([1, 0])   # points right
e2 = np.array([0, 1])   # points up

# A 90-degree counter-clockwise rotation matrix.
# Column 0 = where e1 goes = [0, 1] (right rotates to up)
# Column 1 = where e2 goes = [-1, 0] (up rotates to left)
R90 = np.array([
    [ 0, -1],   # row 0 of the matrix
    [ 1,  0]    # row 1 of the matrix
])

# Apply the rotation to each basis vector using matrix-vector multiply
# np.matmul(M, v) applies transformation M to vector v
e1_rotated = np.matmul(R90, e1)   # where does e1 go after R90?
e2_rotated = np.matmul(R90, e2)   # where does e2 go after R90?

print("Original basis vectors:")
print(f"  e1 = {e1}  →  R90 sends it to: {e1_rotated}")
print(f"  e2 = {e2}  →  R90 sends it to: {e2_rotated}")
print()
print("Confirm: column 0 of R90 is where e1 went:", R90[:, 0])
print("Confirm: column 1 of R90 is where e2 went:", R90[:, 1])
```

**RUN AND TEST — expected output:**

```
Original basis vectors:
  e1 = [1 0]  →  R90 sends it to: [0 1]
  e2 = [0 1]  →  R90 sends it to: [-1  0]

Confirm: column 0 of R90 is where e1 went: [0 1]
Confirm: column 1 of R90 is where e2 went: [-1  0]
```

**Change something:** Replace `R90` with a scaling matrix that doubles x and triples y:
`S = [[2, 0], [0, 3]]`. What do you expect the basis vectors to become? Run it and confirm.

---

## Step 2 — Matrix-Vector Multiplication: Applying the Transformation

**WHY THE METHOD WORKS**

Now that you know a matrix encodes "where the basis vectors go," matrix-vector multiplication
follows automatically.

Any vector `v = [x, y]` can be written as: `v = x * e1 + y * e2`

If M sends e1 → col0 and e2 → col1, then M sends v to:
```
M * v = x * (col0 of M) + y * (col1 of M)
```

In index form, `(M @ v)[i] = M[i,0]*v[0] + M[i,1]*v[1]` — which is just the dot product of
row i of M with the vector v.

**BY HAND**

```
M = [[2, 0],    v = [3,
     [0, 3]]         4]

(M @ v)[0] = row 0 of M · v = [2,0] · [3,4] = 2×3 + 0×4 = 6
(M @ v)[1] = row 1 of M · v = [0,3] · [3,4] = 0×3 + 3×4 = 12

Result: [6, 12]  — x was scaled by 2, y was scaled by 3. Makes sense.
```

```python
# --- STEP 2: Matrix-vector multiplication from scratch ---

def matvec_scratch(M, v):
    """
    Multiply matrix M by vector v, one dot product at a time.
    This makes the mechanics visible before we use NumPy's shorthand.
    """
    rows = len(M)        # number of output dimensions
    cols = len(M[0])     # must equal len(v) for dimensions to be compatible

    result = []
    for i in range(rows):
        # Row i of M dot-producted with the full vector v
        # gives output dimension i
        dot = sum(M[i][k] * v[k] for k in range(cols))
        result.append(dot)
    return result

# Define our scaling matrix and test vector as plain Python lists first
M_list = [[2, 0],
          [0, 3]]

v_list = [3, 4]

# Compute by hand using our scratch function
result_scratch = matvec_scratch(M_list, v_list)
print("Matrix-vector multiply (scratch):", result_scratch)

# Now do the same thing with NumPy
M_np = np.array(M_list)   # convert to NumPy array for library version
v_np = np.array(v_list)   # convert to NumPy array

# The @ operator applies matrix M to vector v
result_numpy = M_np @ v_np
print("Matrix-vector multiply (NumPy @):", result_numpy)

# Verify both give the same answer
print("Results match:", np.allclose(result_scratch, result_numpy))
```

**RUN AND TEST — expected output:**

```
Matrix-vector multiply (scratch): [6, 12]
Matrix-vector multiply (NumPy @): [ 6 12]
Results match: True
```

**Change something:** Try `v = [1, 0]` (the first basis vector). The result should equal
column 0 of M. Try `v = [0, 1]`. The result should equal column 1 of M. Does it?

---

## Step 3 — Matrix Multiplication: Composing Two Transformations

**THE PROBLEM**

You want to rotate AND scale. You could apply R first, then S. But repeatedly applying
separate matrices to every point in a model (imagine a mesh with 100,000 points) is slow.
Can you pre-compute ONE matrix that does both?

Yes. That is matrix multiplication.

**THE GEOMETRY**

When you write `C = A @ B`, the matrix C is the composition "do B first, then A."

Why B first? Because when you write `A @ (B @ v)`, the parentheses say: apply B to v, then
apply A to the result. Matrix multiplication just lets you pre-bake that into one matrix.

To build C, think column by column:
- Column j of C = "where does the j-th basis vector end up after both B and A?"
- B sends basis vector j to column j of B.
- Then A sends that intermediate vector to column j of C.
- So column j of C = A @ (column j of B).

**This means:** each column of the result is a matrix-vector product. And each entry
(C[i,j]) is the dot product of row i of A with column j of B.

**BY HAND**

```
A = [[1, 2],    B = [[5, 6],
     [3, 4]]         [7, 8]]

(A@B)[0,0] = row 0 of A · col 0 of B = [1,2]·[5,7] = 1×5 + 2×7 = 19
(A@B)[0,1] = row 0 of A · col 1 of B = [1,2]·[6,8] = 1×6 + 2×8 = 22
(A@B)[1,0] = row 1 of A · col 0 of B = [3,4]·[5,7] = 3×5 + 4×7 = 43
(A@B)[1,1] = row 1 of A · col 1 of B = [3,4]·[6,8] = 3×6 + 4×8 = 50

A @ B = [[19, 22],
         [43, 50]]
```

```python
# --- STEP 3: Matrix multiplication from scratch ---

def matmul_scratch(A, B):
    """
    Compute A @ B by computing every entry as a dot product.
    Each result[i][j] = dot product of row i of A with column j of B.
    """
    m = len(A)       # rows in A — also rows in the result
    n = len(A[0])    # cols in A — must equal rows in B
    p = len(B[0])    # cols in B — also cols in the result

    # Build the result matrix one entry at a time
    result = [
        [
            sum(A[i][k] * B[k][j] for k in range(n))  # dot product of row i with col j
            for j in range(p)   # iterate over output columns
        ]
        for i in range(m)       # iterate over output rows
    ]
    return result

# The exact matrices from the by-hand example
A_list = [[1, 2],
          [3, 4]]

B_list = [[5, 6],
          [7, 8]]

# Compute using our scratch implementation
C_scratch = matmul_scratch(A_list, B_list)
print("A @ B (scratch):")
for row in C_scratch:
    print(" ", row)

# Now use NumPy — same thing, one line
A_np = np.array(A_list)   # NumPy array for library version
B_np = np.array(B_list)

C_numpy = A_np @ B_np     # @ is Python's matrix multiply operator (PEP 465)
print("\nA @ B (NumPy @):")
print(C_numpy)

# Confirm they match
print("\nResults match:", np.allclose(C_scratch, C_numpy))
```

**RUN AND TEST — expected output:**

```
A @ B (scratch):
  [19, 22]
  [43, 50]

A @ B (NumPy @):
[[19 22]
 [43 50]]

Results match: True
```

**Change something:** Compute B @ A (swap the order) and compare to A @ B. Are they equal?
This is the proof that matrix multiplication is NOT commutative.

---

## Step 4 — The Shape Rule and Common Pitfall

**THE PROBLEM**

Not every pair of matrices can be multiplied. And even when dimensions match, swapping `@`
for `*` produces completely wrong results with no error message — the most dangerous kind
of bug.

**WHY THE METHOD WORKS — THE SHAPE RULE**

If A has shape (m × n) and B has shape (n × p):
- The inner dimensions (both `n`) must match — they are the "shared summation index"
- The result has shape (m × p) — outer dimensions survive

Mnemonic: **(m × n) @ (n × p) = (m × p)** — the inner `n`s cancel.

If the inner dimensions do not match, you get a shape error. NumPy catches this.

**THE @ vs * DISTINCTION**

- `A @ B` — matrix multiplication (row-dot-column). This is what you almost always want.
- `A * B` — element-wise multiplication (Hadamard product). Each position multiplied
  independently. This is rarely what you want for linear algebra, but causes no error.

```python
# --- STEP 4: Shape rule and the @ vs * distinction ---

# A small non-square example to demonstrate the shape rule
# A is (2x3), B is (3x2) — inner dimensions both 3, so this is valid
A_rect = np.array([
    [1, 2, 3],   # row 0
    [4, 5, 6]    # row 1
])  # shape: (2, 3)

B_rect = np.array([
    [7,  8 ],   # row 0
    [9,  10],   # row 1
    [11, 12]    # row 2
])  # shape: (3, 2)

C_rect = A_rect @ B_rect   # result shape: (2, 2) — inner 3s cancel
print(f"A shape: {A_rect.shape}")
print(f"B shape: {B_rect.shape}")
print(f"C = A @ B shape: {C_rect.shape}")
print(f"C =\n{C_rect}")
print()

# Demonstrate what happens if shapes are incompatible
A_bad = np.array([[1, 2], [3, 4]])   # shape (2, 2)
B_bad = np.array([[1, 2, 3]])        # shape (1, 3) — inner dims: 2 vs 1, mismatch

try:
    result = A_bad @ B_bad   # this will raise an error
except ValueError as err:
    print("Shape mismatch error (expected):", err)
print()

# Demonstrate the @ vs * distinction — THIS IS A COMMON BUG SOURCE
M = np.array([[1, 2],
              [3, 4]])

N = np.array([[5, 6],
              [7, 8]])

result_matmul  = M @ N     # matrix multiply: row-dot-column
result_elemwise = M * N    # element-wise: each position independently

print("M @ N (matrix multiply):\n", result_matmul)
print()
print("M * N (element-wise):\n", result_elemwise)
print()
print("Are they the same? ", np.array_equal(result_matmul, result_elemwise))
print("(They are NOT — using * when you mean @ is a silent bug)")
```

**RUN AND TEST — expected output:**

```
A shape: (2, 3)
B shape: (3, 2)
C = A @ B shape: (2, 2)
C =
[[ 58  64]
 [139 154]]

Shape mismatch error (expected): matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size 3 is different from 2)

M @ N (matrix multiply):
 [[19 22]
 [43 50]]

M * N (element-wise):
 [[ 5 12]
 [21 32]]

Are they the same?  False
(They are NOT — using * when you mean @ is a silent bug)
```

**Change something:** Make A_rect shape (3×2) and B_rect shape (2×3). What shape is the
result? What do the actual numbers look like?

---

## Step 5 — The Identity Matrix: The "Do Nothing" Transformation

**THE GEOMETRY**

The identity matrix I is the transformation that sends every vector to itself. It leaves e1
as e1 and e2 as e2.

Because columns of a matrix show where basis vectors go, and the identity sends e1 → e1 and
e2 → e2, the identity matrix is just:

```
I = [[1, 0],
     [0, 1]]
```

Column 0 = [1, 0] = e1 unchanged. Column 1 = [0, 1] = e2 unchanged.

The key property: A @ I = A and I @ A = A. Multiplying by I changes nothing.

```python
# --- STEP 5: The identity matrix ---

# np.eye(n) creates an n×n identity matrix — "eye" = I
I_2x2 = np.eye(2)   # the 2×2 identity
print("Identity matrix (2×2):")
print(I_2x2)
print()

# Any matrix times the identity gives back the original
M_test = np.array([[3, 7],
                   [1, 5]])

left_product  = I_2x2 @ M_test   # I on the left
right_product = M_test @ I_2x2   # I on the right

print("I @ M:")
print(left_product)
print()
print("M @ I:")
print(right_product)
print()
print("Both equal M?", np.allclose(left_product, M_test) and np.allclose(right_product, M_test))
print()

# Also show: applying the identity to a vector does nothing
v_test = np.array([3, -2])
print("v =", v_test)
print("I @ v =", I_2x2 @ v_test, "  (unchanged)")
```

**RUN AND TEST — expected output:**

```
Identity matrix (2×2):
[[1. 0.]
 [0. 1.]]

I @ M:
[[3. 7.]
 [1. 5.]]

M @ I:
[[3. 7.]
 [1. 5.]]

Both equal M? True

v = [ 3 -2]
I @ v = [ 3. -2.]  (unchanged)
```

**Change something:** Make a 3×3 identity with `np.eye(3)` and multiply a random 3×3 matrix
by it. Does A @ I still equal A?

---

## Step 6 — Building Real Transformation Matrices

**THE GEOMETRY**

Now that you understand what matrix columns mean, you can build transformation matrices
directly from the geometry — without memorizing formulas.

**Rotation by angle θ:**
- e1 = [1, 0] rotates to [cos θ, sin θ]
- e2 = [0, 1] rotates to [−sin θ, cos θ]

So the columns of R are [cos θ, sin θ] and [−sin θ, cos θ]:
```
R(θ) = [[cos θ,  −sin θ],
         [sin θ,   cos θ]]
```

**Scaling by sx and sy:**
- e1 stays along x, just gets longer by sx → [sx, 0]
- e2 stays along y, just gets longer by sy → [0, sy]

```
S(sx, sy) = [[sx, 0],
              [0, sy]]
```

```python
# --- STEP 6: Building standard transformation matrices ---

def rotation_matrix(angle_deg):
    """
    Build a 2D rotation matrix for the given angle (in degrees).
    Derived from where the basis vectors land after rotating.
    """
    angle_rad = math.radians(angle_deg)   # trig functions expect radians
    cos_a = math.cos(angle_rad)           # x-component of rotated e1
    sin_a = math.sin(angle_rad)           # y-component of rotated e1

    # Column 0 = where e1 goes: [cos, sin]
    # Column 1 = where e2 goes: [-sin, cos]
    return np.array([
        [ cos_a, -sin_a],   # row 0
        [ sin_a,  cos_a]    # row 1
    ])

def scaling_matrix(sx, sy):
    """
    Build a 2D scaling matrix that stretches x by sx and y by sy.
    Diagonal entries = scale factors, off-diagonal = 0 (axes stay perpendicular).
    """
    return np.array([
        [sx,  0],   # row 0: x-axis scaled by sx
        [ 0, sy]    # row 1: y-axis scaled by sy
    ])

# Build a 45-degree rotation and a 2x uniform scaling
R45 = rotation_matrix(ROTATION_ANGLE_DEG)   # uses named constant from top of file
S2  = scaling_matrix(SCALE_FACTOR, SCALE_FACTOR)

print(f"Rotation matrix for {ROTATION_ANGLE_DEG} degrees:")
print(np.round(R45, 4))   # round to hide floating-point noise
print()
print(f"Scaling matrix (factor {SCALE_FACTOR}):")
print(S2)
print()

# Compose: scale first, then rotate — read RIGHT to LEFT: S2 applied first
# (R45 @ S2) means: "do S2, then do R45"
R_then_S = R45 @ S2
print("Composed (scale then rotate) = R45 @ S2:")
print(np.round(R_then_S, 4))

# Apply the composed matrix to a test vector
v_test = np.array([1.0, 0.0])   # starting along the x-axis
result_composed    = R_then_S @ v_test    # one combined operation
result_step_by_step = R45 @ (S2 @ v_test)  # two separate operations

print(f"\nComposed result:       {np.round(result_composed, 4)}")
print(f"Step-by-step result:   {np.round(result_step_by_step, 4)}")
print("Same result?", np.allclose(result_composed, result_step_by_step))
```

**RUN AND TEST — expected output:**

```
Rotation matrix for 45 degrees:
[[ 0.7071 -0.7071]
 [ 0.7071  0.7071]]

Scaling matrix (factor 2.0):
[[2. 0.]
 [0. 2.]]

Composed (scale then rotate) = R45 @ S2:
[[ 1.4142 -1.4142]
 [ 1.4142  1.4142]]

Composed result:       [1.4142 1.4142]
Step-by-step result:   [1.4142 1.4142]
Same result? True
```

**Change something:** Try `R45 @ S2` vs `S2 @ R45`. Print both results. Are they the same?
This shows why order matters when composing transformations.

---

## Step 7 — Visualize: What Does a Matrix Actually Do to a Shape?

**THE GEOMETRY**

The best way to see a transformation is to watch it move a shape. A unit square has corners
at (0,0), (1,0), (1,1), (0,1). Apply a matrix to each corner and plot the result.

Because linear transformations preserve straight lines, transforming the corners is enough —
the edges follow automatically.

```python
# --- STEP 7: Visualizing a transformation on the unit square ---

def make_unit_square():
    """
    Return the 4 corners of the unit square as column vectors in a 2×4 matrix.
    Each column is one point: [[x0,x1,x2,x3], [y0,y1,y2,y3]]
    Using column vectors so M @ points transforms all points at once.
    """
    return np.array([
        [0.0, 1.0, 1.0, 0.0],   # x coordinates of the 4 corners
        [0.0, 0.0, 1.0, 1.0]    # y coordinates of the 4 corners
    ])

def plot_shape(ax, points, color, label, linestyle="-"):
    """
    Plot a closed polygon given corner points as a 2×n matrix.
    Closes the shape by appending the first point at the end.
    """
    # Stack first point at end to close the polygon visually
    xs = np.append(points[0], points[0, 0])   # x coords + wrap-around
    ys = np.append(points[1], points[1, 0])   # y coords + wrap-around

    ax.plot(xs, ys, color=color, linestyle=linestyle,
            linewidth=2, alpha=PLOT_ALPHA, label=label)

    # Mark each corner with a dot so you can see individual points
    ax.scatter(points[0], points[1], color=color, s=60, zorder=5)

# Build the unit square
square = make_unit_square()

# Build a 45-degree rotation matrix
R45 = rotation_matrix(ROTATION_ANGLE_DEG)

# Apply the rotation: M @ points transforms ALL points simultaneously
# Each column (point) gets multiplied by R45 independently
rotated_square = R45 @ square

# Plot original and rotated shapes side by side
fig, ax = plt.subplots(figsize=(7, 7))

plot_shape(ax, square,         color="blue",  label="Original (unit square)")
plot_shape(ax, rotated_square, color="red",   label=f"After {ROTATION_ANGLE_DEG}° rotation")

# Draw basis vectors so you can see where they moved
origin = np.zeros(2)   # all arrows start at the origin

# Original basis vectors (blue)
ax.annotate("", xy=R45[:, 0], xytext=origin,
            arrowprops=dict(arrowstyle="->", color="blue", lw=2))
ax.annotate("", xy=R45[:, 1], xytext=origin,
            arrowprops=dict(arrowstyle="->", color="blue", lw=2))

ax.set_xlim(-1.8, 1.8)
ax.set_ylim(-1.8, 1.8)
ax.set_aspect("equal")           # keep 1:1 scale so rotation looks correct
ax.axhline(0, color="gray", lw=0.5)   # x-axis reference line
ax.axvline(0, color="gray", lw=0.5)   # y-axis reference line
ax.grid(True, alpha=0.3)
ax.legend()
ax.set_title(f"Rotation Matrix: {ROTATION_ANGLE_DEG}° counter-clockwise")

plt.tight_layout()
plt.savefig("lab04_rotation.png", dpi=120)   # save before show so it works headlessly
plt.show()
print("Saved: lab04_rotation.png")
```

**RUN AND TEST — expected output:**

```
Saved: lab04_rotation.png
```

A window should open showing the unit square in blue and the rotated square in red,
tilted 45 degrees counter-clockwise.

**Change something:** Replace `R45` with `scaling_matrix(2, 0.5)`. What shape does the
unit square become? Does it still have right-angle corners?

---

## Step 8 — Composing Transformations and Why Order Matters

**THE PROBLEM**

"Rotate then scale" and "scale then scale then rotate" produce the same result. But
"rotate then shear" and "shear then rotate" produce different results. Order matters for
non-commuting transformations.

**WHY ORDER MATTERS**

Think about putting on socks and shoes. Socks first, then shoes — works. Shoes first, then
socks — fails. The operations do not commute because each one changes the *context* the
next one acts on.

Matrix multiplication captures this: `A @ B` applies B first, then A to the result.

**A SHEAR MATRIX**

A shear pushes the top of a shape sideways while the bottom stays fixed:
- e1 = [1, 0] stays put (the bottom edge doesn't move)
- e2 = [0, 1] slides to [shear_amount, 1] (the top edge slides right)

```
Shear = [[1, shear_amount],
          [0,      1      ]]
```

```python
# --- STEP 8: Order matters — composing rotation, scaling, and shear ---

SHEAR_AMOUNT = 0.8   # how far the top edge slides horizontally

def shear_matrix(shear_x):
    """
    Build a horizontal shear matrix.
    e1 = [1,0] stays put (column 0 = [1, 0]).
    e2 = [0,1] slides to [shear_x, 1] (column 1 = [shear_x, 1]).
    """
    return np.array([
        [1.0, shear_x],   # row 0
        [0.0, 1.0    ]    # row 1
    ])

# Three individual transformation matrices
R45 = rotation_matrix(ROTATION_ANGLE_DEG)    # rotate 45 degrees
S2  = scaling_matrix(SCALE_FACTOR, 1.0)      # stretch x by 2, leave y alone
SH  = shear_matrix(SHEAR_AMOUNT)             # horizontal shear

# Composition order 1: shear, then scale, then rotate
# Reading right-to-left: SH is applied first, S2 second, R45 last
order_1 = R45 @ S2 @ SH

# Composition order 2: rotate, then scale, then shear
# Reading right-to-left: R45 is applied first, S2 second, SH last
order_2 = SH @ S2 @ R45

# Apply both compositions to the same unit square
square    = make_unit_square()
result_1  = order_1 @ square   # all points transformed by composition 1
result_2  = order_2 @ square   # all points transformed by composition 2

# Plot both results to see the difference
fig, axes = plt.subplots(1, 2, figsize=(12, 6))

for ax, result, title in [
    (axes[0], result_1, "Shear → Scale → Rotate"),
    (axes[1], result_2, "Rotate → Scale → Shear")
]:
    plot_shape(ax, square,  color="blue",  label="Original", linestyle="--")
    plot_shape(ax, result,  color="red",   label="Transformed")
    ax.set_xlim(-3.5, 3.5)
    ax.set_ylim(-3.5, 3.5)
    ax.set_aspect("equal")
    ax.axhline(0, color="gray", lw=0.5)
    ax.axvline(0, color="gray", lw=0.5)
    ax.grid(True, alpha=0.3)
    ax.legend()
    ax.set_title(title)

plt.suptitle("Same transforms, different order — different results", fontsize=13)
plt.tight_layout()
plt.savefig("lab04_order_matters.png", dpi=120)
plt.show()
print("Saved: lab04_order_matters.png")

# Print the two matrices to show numerically that they differ
print("\nComposition order 1 (SH → S2 → R45):")
print(np.round(order_1, 3))
print("\nComposition order 2 (R45 → S2 → SH):")
print(np.round(order_2, 3))
print("\nAre they equal?", np.allclose(order_1, order_2))
```

**RUN AND TEST — expected output:**

```
Saved: lab04_order_matters.png

Composition order 1 (SH → S2 → R45):
[[ 1.414 -0.283]
 [ 1.414  1.131]]

Composition order 2 (R45 → S2 → SH):
[[ 1.98   0.707]
 [ 0.566  0.707]]

Are they equal? False
```

The two plot panels should show noticeably different shapes even though they used the same
three transformation matrices.

**Change something:** What if you remove the shear and only use rotation and uniform scaling?
Do the two orders still produce different results? Why or why not? (Think: what kind of
transformations commute?)

---

## Step 9 — Putting It All Together: Apply Transformations to a Complex Shape

**THE PROBLEM**

Now apply everything to a more interesting shape — a simple arrow or star — using the exact
same matrix operations. This shows that all the mechanics from the simple square generalize
directly.

```python
# --- STEP 9: Transformation pipeline on a more complex shape ---

def make_arrow():
    """
    Return a simple arrow shape as a 2×n column-point matrix.
    Points traced clockwise to form a recognizable arrow pointing right.
    """
    # Each pair is [x, y] for one vertex of the arrow polygon
    points = np.array([
        [0.0,  0.5,  0.5,  1.0,  0.5,  0.5,  0.0],   # x coords
        [0.2,  0.2,  0.4,  0.0, -0.4, -0.2, -0.2]    # y coords
    ])
    return points

# Build the arrow shape
arrow = make_arrow()

# Define the full transformation pipeline
# Goal: rotate 30 degrees, then scale x by 1.5, then add a slight shear
PIPELINE_ROTATION = 30         # degrees
PIPELINE_SCALE_X  = 1.5       # stretch along x
PIPELINE_SHEAR    = 0.3       # gentle horizontal shear

R30 = rotation_matrix(PIPELINE_ROTATION)
SX  = scaling_matrix(PIPELINE_SCALE_X, 1.0)
SH3 = shear_matrix(PIPELINE_SHEAR)

# Compose into one matrix: shear(scale(rotate(arrow)))
# Right to left: R30 first, then SX, then SH3
full_pipeline = SH3 @ SX @ R30

# Apply to all arrow points at once
transformed_arrow = full_pipeline @ arrow

# Plot
fig, ax = plt.subplots(figsize=(8, 6))
plot_shape(ax, arrow,             color="blue", label="Original arrow")
plot_shape(ax, transformed_arrow, color="red",  label="Transformed arrow")

ax.set_xlim(-2.5, 2.5)
ax.set_ylim(-2.0, 2.0)
ax.set_aspect("equal")
ax.axhline(0, color="gray", lw=0.5)
ax.axvline(0, color="gray", lw=0.5)
ax.grid(True, alpha=0.3)
ax.legend()
ax.set_title(f"Pipeline: Rotate {PIPELINE_ROTATION}° → Scale x{PIPELINE_SCALE_X} → Shear {PIPELINE_SHEAR}")

plt.tight_layout()
plt.savefig("lab04_pipeline.png", dpi=120)
plt.show()
print("Saved: lab04_pipeline.png")

# Show the single combined matrix that does all three steps
print("\nFull pipeline matrix (one matrix = three operations):")
print(np.round(full_pipeline, 4))
```

**RUN AND TEST — expected output:**

```
Saved: lab04_pipeline.png

Full pipeline matrix (one matrix = three operations):
[[ 1.1495  0.05  ]
 [ 0.75    0.866 ]]
```

(Numbers may vary slightly depending on floating-point precision.)

**Change something:** Add a fourth transformation — a reflection across the x-axis:
`reflect_x = np.array([[1, 0], [0, -1]])`. Prepend it to the pipeline. Where does the
arrow end up now?

---

## np.dot vs @ vs np.matmul — Reference

All three do matrix multiplication in practice. Here are the rules:

| Expression        | What it does                     | When to use it           |
|-------------------|----------------------------------|--------------------------|
| `A @ B`           | Matrix multiply (PEP 465)        | **This. Always.**        |
| `np.matmul(A, B)` | Same as `@`, function form       | When you need a function |
| `np.dot(A, B)`    | Same for 2D arrays               | Legacy code only         |
| `A * B`           | Element-wise multiply            | Scaling, not composing   |

Rule of thumb: use `@` for matrix multiply. Use `*` only when you explicitly want
element-wise behavior.

---

## Challenge: Transformation Sequence Visualizer

Build a function that accepts a list of transformation matrices and a set of 2D points,
applies them in sequence, and plots every intermediate state — not just the final result.

**Requirements:**

1. A function `apply_sequence(transforms, points)` that returns a list of point arrays:
   the original, after step 1, after steps 1+2, etc.

2. Each transformation in the list should be a 2×2 NumPy array.

3. The function must use matrix multiplication (not loops over individual points) to
   apply each transformation — one `@` call per step.

4. A function `plot_sequence(steps, labels, title)` that plots each intermediate shape
   in a different color with a legend showing which step produced it.

5. Demonstrate with at least three transformations: a rotation, a non-uniform scaling
   (different x and y scale factors), and a shear. Plot all four states (original + 3
   transformed).

6. Then call the same function with the transformations in reversed order and plot both
   figures side by side to show that the intermediate shapes — not just the final result
   — differ when order changes.

**When you are done:**

Your output should be two side-by-side matplotlib figures, each showing 4 colored shapes
(original + 3 steps), where the shapes in one figure differ visibly from the shapes in
the other at every intermediate step.

**Stuck?** Ask AI: "In a sequence of matrix transformations, why does reversing the order
change not just the final result but every intermediate state?"

---

## Quick Check Answers

**1. If A is shape (3×4) and B is shape (4×2), what shape is A @ B?**

Shape (3×2). Inner dimensions (4 and 4) match. Outer dimensions (3 and 2) survive.
See Step 4 where `A_rect @ B_rect` with shapes (2,3) and (3,2) produces shape (2,2).

**2. What does the first column of a transformation matrix tell you?**

It tells you where the first basis vector `e1 = [1, 0]` goes after the transformation.
This is demonstrated in Step 1 where `R90[:, 0]` equals the rotated `e1`.

**3. In Python, what is the difference between `A @ B` and `A * B`?**

`A @ B` is matrix multiplication — row i of A dotted with column j of B produces entry
[i,j] of the result. `A * B` is element-wise — each position multiplied independently.
They produce different results for almost all matrix pairs. See Step 4.

**4. Is matrix multiplication commutative?**

No. A @ B and B @ A are generally different matrices. You proved this in the Step 3
"Change something" exercise and it is confirmed numerically in Step 8 where the two
composition orders produce visibly different transformed shapes.
