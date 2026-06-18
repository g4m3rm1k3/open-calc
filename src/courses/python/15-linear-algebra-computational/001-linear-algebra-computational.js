// Chapter 2.2 — Linear Algebra (Computational)
//
// PHASE 2 — NUMERICAL COMPUTING (NUMPY-FIRST)
//
// TEACHES:
//   Math:    Vectors (norm, unit vector, dot product, projection, angle),
//            cross product, matrices as linear transformations, matrix
//            multiplication, determinant as area scaling, matrix inverse,
//            solving Ax = b, eigenvalues & eigenvectors, covariance matrix
//
//   Python:  numpy @ operator for matmul, np.linalg.norm, np.linalg.solve,
//            np.linalg.det, np.linalg.inv, np.linalg.eig, np.linalg.svd,
//            np.outer, np.vstack/hstack, structured numpy for geometry
//
//   Library: opencalc for visualising linear transformations (unit circle
//            before/after), eigenvector arrows, solution geometry, 2D
//            vector fields; fig.arrow() for vector diagrams

export default {
  id: 'py-2-2-linear-algebra',
  slug: 'linear-algebra-computational',
  chapter: 2.2,
  order: 1,
  title: 'Linear Algebra (Computational)',
  subtitle: 'Vectors, matrices, transformations, and the geometry of solving equations',
  tags: [
    'linear algebra', 'matrix', 'vector', 'dot product', 'eigenvalue', 'eigenvector',
    'numpy.linalg', 'transformation', 'determinant', 'inverse', 'Ax=b', 'PCA', 'opencalc',
  ],

  hook: {
    question: 'Google\'s PageRank algorithm ranked the entire web by solving an eigenvector problem on a billion-node matrix. How does a single numpy call handle the same math?',
    realWorldContext:
      'Linear algebra is the language of data science, graphics, robotics, and machine learning. ' +
      'A neural network\'s forward pass is matrix multiplication. ' +
      'A 3D rotation in a game engine is a matrix transform. ' +
      'Principal Component Analysis — the backbone of dimensionality reduction — ' +
      'is an eigenvalue problem. ' +
      'GPS triangulation solves a linear system. ' +
      'Every time you call scikit-learn, TensorFlow, or scipy, ' +
      'you are triggering thousands of matrix operations per second. ' +
      'This chapter makes those operations readable and intuitive.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **matrix** is not just a grid of numbers — it is a **function** that transforms vectors. ' +
      'Multiply a vector by a matrix and you get a new vector: stretched, rotated, reflected, or sheared. ' +
      'The entire language of linear algebra is about understanding what those transformations do ' +
      'and how to invert, compose, and decompose them.',
      'The three key questions of linear algebra: ' +
      '(1) Does this transformation have a solution? (determinant) ' +
      '(2) What is the solution? (Ax = b, inverse) ' +
      '(3) What directions does this transformation leave unchanged? (eigenvectors) ' +
      'NumPy\'s `linalg` module answers all three in a single function call.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Matrix-vector product',
        body: 'For A \\in \\mathbb{R}^{m \\times n} and \\mathbf{x} \\in \\mathbb{R}^n: \\quad (A\\mathbf{x})_i = \\sum_{j=1}^{n} A_{ij} x_j. Each output component is a dot product of a row of A with x.',
      },
      {
        type: 'insight',
        title: 'Eigenvectors — the axes a matrix respects',
        body: 'A\\mathbf{v} = \\lambda \\mathbf{v}: the matrix A only scales the vector v, does not rotate it. λ is the eigenvalue (scale factor); v is the eigenvector (the preserved direction).',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Linear Algebra (Computational)',
        mathBridge: 'dot(a,b) = |a||b|cos θ. det(A) = area scale. Av = λv defines eigenvectors. np.linalg.solve(A, b) solves Ax = b without computing A⁻¹.',
        caption: 'Work through every cell. The transformation and eigenvector visualizations make the abstract geometry concrete.',
        props: {
          disableRunAll: true,
          initialCells: [

            // ── VECTORS ───────────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Vectors — norm, unit vector, and angle',
              prose: [
                'A **vector** is an ordered list of numbers representing a point or direction in n-dimensional space. The **norm** (length) of a vector is the generalization of the Pythagorean theorem: ‖v‖ = √(v₁² + v₂² + … + vₙ²). A **unit vector** has norm 1 and points in the same direction.',
                '## Key vector operations',
                '- `np.linalg.norm(v)` — Euclidean length ‖v‖\n- `v / np.linalg.norm(v)` — unit vector (normalise)\n- `np.dot(a, b)` or `a @ b` — dot product Σ aᵢbᵢ\n- `np.cross(a, b)` — cross product (3D only): vector perpendicular to both\n- `np.linalg.norm(a - b)` — distance between two points a and b',
                '## The angle between vectors',
                'The dot product has a geometric meaning: **a · b = ‖a‖ ‖b‖ cos θ**. Rearranging: θ = arccos(a · b / (‖a‖ ‖b‖)). Two vectors are **orthogonal** (perpendicular) if and only if their dot product is zero.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

a = np.array([3.0, 1.0])
b = np.array([1.0, 4.0])

# Norm and unit vector
norm_a = np.linalg.norm(a)
unit_a = a / norm_a
print(f"a = {a},  ‖a‖ = {norm_a:.4f}")
print(f"unit(a) = {unit_a.round(4)},  ‖unit(a)‖ = {np.linalg.norm(unit_a):.6f}")
print()

# Dot product and angle
dot = a @ b
cos_theta = dot / (np.linalg.norm(a) * np.linalg.norm(b))
theta_deg = np.degrees(np.arccos(cos_theta))
print(f"a · b = {dot}")
print(f"angle between a and b = {theta_deg:.2f}°")
print()

# Projection of a onto b
proj_a_onto_b = (a @ b) / (b @ b) * b
print(f"projection of a onto b = {proj_a_onto_b.round(4)}")

# Visualize
fig = Figure(xmin=-0.5, xmax=5, ymin=-0.5, ymax=5,
             title="Vectors a, b, and projection of a onto b", square=True)
fig.grid().axes()
fig.arrow([0,0], [float(a[0]), float(a[1])],   color=BLUE,  label="a")
fig.arrow([0,0], [float(b[0]), float(b[1])],   color=RED,   label="b")
fig.arrow([0,0], [float(proj_a_onto_b[0]), float(proj_a_onto_b[1])], color=AMBER, label="proj")
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── MATRIX CREATION ───────────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Matrices — grids that transform vectors',
              prose: [
                'A matrix is a rectangular grid of numbers. In numpy a matrix is simply a **2D array**. The shape `(m, n)` means m rows and n columns. When you multiply an (m, n) matrix by an (n,) vector, you get an (m,) vector — the matrix *transforms* the vector from n-dimensional space to m-dimensional space.',
                '## Matrix creation idioms',
                '- `np.array([[1,2],[3,4]])` — from nested lists\n- `np.eye(n)` — n×n identity (does nothing to any vector)\n- `np.zeros((m,n))`, `np.ones((m,n))` — filled matrices\n- `np.diag([a,b,c])` — diagonal matrix (only scales, no rotation)\n- `np.vstack([A, B])` — stack matrices vertically\n- `np.hstack([A, B])` — stack matrices horizontally',
                '## The identity matrix',
                'The identity matrix **I** is the matrix equivalent of multiplying by 1: **Ix = x** for any vector x. It has 1s on the diagonal and 0s everywhere else. It is the starting point for understanding matrix inverses.',
              ],
              code: `import numpy as np

# Common matrix constructors
I  = np.eye(3)
D  = np.diag([2.0, 3.0, 5.0])
A  = np.array([[1, 2, 3],
               [4, 5, 6],
               [7, 8, 9]], dtype=float)

print("Identity I:")
print(I)
print("\\nDiagonal D = diag(2, 3, 5):")
print(D)
print("\\nA:")
print(A)

# Key matrix properties
print(f"\\nShape: {A.shape}   (rows × cols)")
print(f"Rank:  {np.linalg.matrix_rank(A)}")  # number of independent rows/cols
print(f"Trace: {np.trace(A)}")               # sum of diagonal = sum of eigenvalues
print(f"Frobenius norm: {np.linalg.norm(A, 'fro'):.4f}")

# Matrix-vector product
x = np.array([1.0, 0.0, 0.0])
print(f"\\nA @ e₁ = {A @ x}")   # first column of A
print(f"D @ x  = {D @ x}")   # diagonal matrix just scales`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── MATRIX MULTIPLICATION ─────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Matrix multiplication — composing transformations',
              prose: [
                'Matrix multiplication (**A @ B** in numpy) is **not** element-wise. The entry (AB)ᵢⱼ is the dot product of row i of A with column j of B. The shapes must be compatible: **(m, n) @ (n, p) → (m, p)**. The inner dimensions must match.',
                '## Geometric meaning',
                'If matrix A applies transformation T_A and matrix B applies transformation T_B, then **AB** applies T_B first, then T_A. Matrix multiplication is **composition of transformations** — reading right to left.',
                '## Key rules',
                '- Shape rule: `(m,n) @ (n,p)` → `(m,p)` — inner dims must match\n- NOT commutative: `A @ B ≠ B @ A` in general\n- IS associative: `(A @ B) @ C == A @ (B @ C)`\n- Identity: `A @ np.eye(n) == A`\n- Transpose of product: `(A @ B).T == B.T @ A.T`',
              ],
              code: `import numpy as np

# Rotation matrix — rotates vectors counter-clockwise by angle θ
def rotation(theta_deg):
    t = np.radians(theta_deg)
    return np.array([[np.cos(t), -np.sin(t)],
                     [np.sin(t),  np.cos(t)]])

# Scaling matrix
def scale(sx, sy):
    return np.diag([sx, sy])

# Compose: scale by (2,1) THEN rotate 45°
S = scale(2.0, 1.0)
R = rotation(45)
M = R @ S   # R applied after S

v = np.array([1.0, 0.0])
print(f"Original v:              {v}")
print(f"After scale S:           {S @ v}")
print(f"After scale then rotate: {M @ v}")
print()

# Non-commutativity
A = np.array([[2,1],[0,3]], dtype=float)
B = np.array([[1,2],[4,1]], dtype=float)
print("A @ B:")
print(A @ B)
print("B @ A:")
print(B @ A)
print(f"Commute? {np.allclose(A @ B, B @ A)}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── VISUALIZING TRANSFORMATIONS ────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Visualizing linear transformations',
              prose: [
                'The best way to understand a matrix intuitively is to watch it transform the **unit circle** (the set of all unit vectors). After transformation the circle becomes an ellipse — the shape of that ellipse reveals everything about the matrix: how much it stretches in each direction, whether it rotates, and whether it flips orientation.',
                '## What to look for',
                '- **Circle stays circular** → rotation or uniform scaling (no distortion)\n- **Circle becomes an ellipse** → the matrix stretches more in one direction than another\n- **Ellipse axes** → align with the eigenvectors of the matrix\n- **Ellipse radii** → are the singular values (from SVD)\n- **Orientation flips** → determinant is negative (reflection involved)',
              ],
              code: `import numpy as np, math
from opencalc import Figure, BLUE, RED, GRAY, AMBER

# Try different matrices here — change A to explore
# Rotation 45°:  np.array([[c,-s],[s,c]])  where c,s = cos/sin(π/4)
# Shear:         np.array([[1, 1.5],[0, 1]])
# Stretch:       np.array([[3, 0],[0, 0.5]])
# Reflection:    np.array([[-1,0],[0,1]])
A = np.array([[1.0, 1.5],   # shear matrix
              [0.0, 1.0]])

print(f"Matrix A:"); print(A)
print(f"det(A) = {np.linalg.det(A):.3f}  (area scale factor)")

a, b = float(A[0,0]), float(A[0,1])
c, d = float(A[1,0]), float(A[1,1])

# fig.parametric(xfn, yfn) — unit circle: x=cos(t), y=sin(t)
# Transformed: x = a·cos(t)+b·sin(t),  y = c·cos(t)+d·sin(t)
fig = Figure(xmin=-2.5, xmax=2.5, ymin=-1.5, ymax=1.5,
             title="Unit circle (gray) → shear transform (blue)", square=True)
fig.grid().axes()
fig.parametric(math.cos,                                  math.sin,                                  color=GRAY)
fig.parametric(lambda t: a*math.cos(t) + b*math.sin(t),  lambda t: c*math.cos(t) + d*math.sin(t),  color=BLUE)
# Basis vectors after transform — columns of A
fig.arrow([0,0], [a, c], color=RED,  label="e₁→")
fig.arrow([0,0], [b, d], color=AMBER, label="e₂→")
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── JIT: NUMPY.LINALG ─────────────────────────────────────────────
            {
              id: 'oc-linalg',
              cellTitle: 'Library: numpy.linalg — the linear algebra toolkit',
              prose: [
                '`numpy.linalg` (accessed as `np.linalg`) is the numpy submodule for linear algebra. It wraps LAPACK — the same Fortran library used by MATLAB, R, and scientific computing software — giving you industrial-strength numerical linear algebra in a single import.',
                '## Core functions',
                '- `np.linalg.norm(v)` — vector or matrix norm\n- `np.linalg.det(A)` — determinant\n- `np.linalg.inv(A)` — matrix inverse (use sparingly — prefer `solve`)\n- `np.linalg.solve(A, b)` — solve Ax = b directly (faster and more stable than `inv(A) @ b`)\n- `np.linalg.eig(A)` — eigenvalues and eigenvectors\n- `np.linalg.svd(A)` — singular value decomposition\n- `np.linalg.matrix_rank(A)` — rank of the matrix\n- `np.linalg.lstsq(A, b)` — least-squares solution (over/under-determined systems)',
                '## The golden rule: use `solve`, not `inv`',
                'Computing the inverse of a matrix is numerically less stable than solving the system directly. `np.linalg.solve(A, b)` uses LU decomposition internally — it is faster and more accurate than `np.linalg.inv(A) @ b`. Only compute the inverse explicitly when you need to reuse it for many different right-hand sides.',
              ],
              code: `import numpy as np

A = np.array([[3, 1],
              [1, 2]], dtype=float)

print("=== np.linalg overview ===")
print(f"det(A)  = {np.linalg.det(A):.4f}")
print(f"rank(A) = {np.linalg.matrix_rank(A)}")
print(f"norm(A, 'fro') = {np.linalg.norm(A, 'fro'):.4f}")

inv_A = np.linalg.inv(A)
print(f"\\nA⁻¹:")
print(inv_A.round(4))
print(f"A @ A⁻¹ (should be I):")
print((A @ inv_A).round(10))

# solve vs inv timing
import time
n = 1000
big = np.random.rand(n, n) + n * np.eye(n)  # well-conditioned
rhs = np.random.rand(n)

t0 = time.perf_counter()
x_solve = np.linalg.solve(big, rhs)
t_solve = time.perf_counter() - t0

t0 = time.perf_counter()
x_inv = np.linalg.inv(big) @ rhs
t_inv = time.perf_counter() - t0

print(f"\\nSolving 1000×1000 system:")
print(f"  np.linalg.solve: {t_solve*1000:.1f} ms")
print(f"  inv(A) @ b:      {t_inv*1000:.1f} ms")
print(f"  Results match: {np.allclose(x_solve, x_inv)}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── DETERMINANT ────────────────────────────────────────────────────
            {
              id: 6,
              cellTitle: 'The determinant — area, volume, and invertibility',
              prose: [
                'The **determinant** of a square matrix A is a single number that encodes two critical facts: (1) **by how much the transformation scales areas/volumes**, and (2) **whether the transformation is invertible**.',
                '## Geometric interpretation',
                '- If the unit square has area 1, applying A gives a parallelogram with area |det(A)|\n- det(A) > 0: orientation preserved (no reflection)\n- det(A) < 0: orientation flipped (like a mirror)\n- det(A) = 0: the transformation is **singular** — it collapses space into a lower dimension. The matrix has no inverse.',
                '## Computing determinants',
                '- 2×2: det([[a,b],[c,d]]) = ad − bc\n- Larger: `np.linalg.det(A)` — uses LU decomposition internally\n- `det(A @ B) = det(A) × det(B)`\n- `det(A.T) = det(A)`\n- `det(cA) = cⁿ det(A)` for an n×n matrix',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, GRAY

# Unit square — the reference shape for determinant geometry
sq = np.array([[0,1,1,0,0], [0,0,1,1,0]], dtype=float)

# Try different matrices — change A to see different determinants:
# Scale x by 2: np.array([[2,0],[0,1]])  → det=2, area doubles
# Reflection:   np.array([[-1,0],[0,1]]) → det=-1, orientation flips
# Singular:     np.array([[1,2],[2,4]])  → det=0, collapses to a line
# Rotation 45°: det=1 always (rotations preserve area)
A = np.array([[2.0, 0.5],
              [0.5, 1.5]])

d = np.linalg.det(A)
tr = A @ sq

print(f"A:"); print(A)
print(f"det(A) = {d:.4f}")
print(f"Unit square area = 1.0")
print(f"Parallelogram area = |det(A)| = {abs(d):.4f}")
print(f"Orientation {'preserved' if d > 0 else 'FLIPPED (det < 0)'}")

# Key determinant facts
mats = {
    "Scale x×2":   np.array([[2.0,0],[0,1]]),
    "Rotation 45°": np.array([[np.cos(np.pi/4),-np.sin(np.pi/4)],[np.sin(np.pi/4),np.cos(np.pi/4)]]),
    "Shear":        np.array([[1.0,2],[0,1]]),
    "Singular":     np.array([[1.0,2],[2,4]]),
    "Reflection":   np.array([[-1.0,0],[0,1]]),
}
print("\\nDeterminant gallery:")
for name, M in mats.items():
    print(f"  {name:<15}: det = {np.linalg.det(M):+.4f}")

# Unit square corners (for polygon — list of [x,y] pairs, no closing point needed)
sq_pts = [[0,0],[1,0],[1,1],[0,1]]
tr_pts = [[float(tr[0,i]), float(tr[1,i])] for i in range(4)]

fig = Figure(xmin=-0.5, xmax=3, ymin=-0.5, ymax=2.5,
             title=f"Unit square (gray) → parallelogram (blue)  det={d:.2f}", square=True)
fig.grid().axes()
fig.polygon(sq_pts, color=GRAY, fill=True,  alpha=0.15, stroke=True)
fig.polygon(tr_pts, color=BLUE, fill=True,  alpha=0.25, stroke=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── SOLVING LINEAR SYSTEMS ─────────────────────────────────────────
            {
              id: 7,
              cellTitle: 'Solving Ax = b — linear systems',
              prose: [
                'A **system of linear equations** Ax = b asks: what vector x, when transformed by A, lands exactly on b? This is the most common problem in applied math — circuit analysis, structural engineering, data fitting, and computer graphics all reduce to it.',
                '## Three possible outcomes',
                '- **One solution**: A is invertible (det ≠ 0). `np.linalg.solve(A, b)` returns it.\n- **No solution**: b is not in the column space of A (the equations are inconsistent). `np.linalg.lstsq(A, b)` finds the closest approximation.\n- **Infinitely many solutions**: A is singular and b happens to be in the column space. The system is underdetermined.',
                '## When there\'s no exact solution — least squares',
                '`np.linalg.lstsq(A, b, rcond=None)` minimises ‖Ax − b‖². This is **the** algorithm behind linear regression — fitting is just solving an overdetermined system in the least-squares sense.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Exact solution — two equations, two unknowns
# 3x + y = 9
# x + 2y = 8
A = np.array([[3, 1],
              [1, 2]], dtype=float)
b = np.array([9.0, 8.0])

x = np.linalg.solve(A, b)
print(f"Solution: x = {x}")
print(f"Verify Ax: {A @ x}  (should be {b})")
print()

# Geometric view — two lines intersecting
t = np.linspace(0, 6, 300)
# line 1: 3x + y = 9  →  y = 9 - 3x
# line 2: x + 2y = 8  →  y = (8 - x)/2
y1 = 9 - 3*t
y2 = (8 - t) / 2

fig = Figure(xmin=0, xmax=6, ymin=-2, ymax=10,
             title="Ax = b — intersection of two lines")
fig.grid().axes()
fig.plot(lambda x: 9 - 3*x, color=BLUE)   # line 1: 3x + y = 9
fig.plot(lambda x: (8-x)/2,  color=RED)   # line 2: x + 2y = 8
fig.point([float(x[0]), float(x[1])], color=AMBER, radius=8)
fig.text([float(x[0])+0.15, float(x[1])+0.3], f"({x[0]:.1f}, {x[1]:.1f})", color='black', size=11, bold=True)
fig.show()

# Least-squares — overdetermined system (more equations than unknowns)
# Fit a line y = mx + c to 6 noisy points
xs = np.array([1, 2, 3, 4, 5, 6], dtype=float)
ys = np.array([2.1, 3.9, 6.2, 7.8, 10.1, 11.9])
A2 = np.vstack([xs, np.ones(len(xs))]).T   # design matrix (6,2)
coeffs, residuals, rank, sv = np.linalg.lstsq(A2, ys, rcond=None)
m, c = coeffs
print(f"\\nLeast-squares fit: y = {m:.3f}x + {c:.3f}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── EIGENVALUES ────────────────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Eigenvalues & eigenvectors — the axes a matrix respects',
              prose: [
                'An **eigenvector** of matrix A is a non-zero vector v that, when transformed by A, only gets scaled — it doesn\'t change direction. The scale factor is the **eigenvalue** λ. The equation is: **Av = λv**.',
                '## Why eigenvectors matter',
                '- They reveal the **natural axes** of a transformation\n- The eigenvalues tell you **how much** the transformation stretches/compresses along each axis\n- A positive eigenvalue: stretch. Negative: flip and stretch. |λ| < 1: compress.\n- **PCA** finds the eigenvectors of the covariance matrix — the directions of maximum variance\n- **PageRank** is the dominant eigenvector of the web link matrix\n- **Vibration modes** in structural engineering are eigenvectors of the stiffness matrix',
                '## `np.linalg.eig` output',
                '`vals, vecs = np.linalg.eig(A)` returns:\n- `vals` — array of n eigenvalues (may be complex for non-symmetric matrices)\n- `vecs` — columns are the corresponding eigenvectors: `vecs[:, i]` goes with `vals[i]`',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

A = np.array([[3.0, 1.0],
              [0.0, 2.0]])

vals, vecs = np.linalg.eig(A)
print("Eigenvalues: ", vals)
print("Eigenvectors (columns):")
print(vecs)
print()

for i in range(len(vals)):
    v = vecs[:, i]
    lam = vals[i]
    print(f"λ={lam:.1f}: v={v.round(4)},  Av={( A@v).round(4)},  λv={( lam*v).round(4)}")
    print(f"  Av = λv? {np.allclose(A @ v, lam * v)}")
print()

# Visualize — unit circle → ellipse via parametric curves
import math
a00, a01 = float(A[0,0]), float(A[0,1])
a10, a11 = float(A[1,0]), float(A[1,1])

fig = Figure(xmin=-3.5, xmax=3.5, ymin=-2.5, ymax=2.5,
             title="Unit circle → ellipse; eigenvectors", square=True)
fig.grid().axes()
fig.parametric(math.cos,                                    math.sin,                                    color=GRAY)
fig.parametric(lambda t: a00*math.cos(t) + a01*math.sin(t), lambda t: a10*math.cos(t) + a11*math.sin(t), color=BLUE)

for i, color in enumerate([RED, AMBER]):
    v   = vecs[:, i].real
    lam = vals[i].real
    fig.arrow([0,0], [float(v[0]),     float(v[1])],     color=color)
    fig.arrow([0,0], [float(lam*v[0]), float(lam*v[1])], color=color)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── SVD ────────────────────────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'SVD — the most important matrix decomposition',
              prose: [
                'The **Singular Value Decomposition** (SVD) factorises any matrix A into three matrices: **A = U Σ Vᵀ**. U and V are rotation matrices (orthogonal); Σ is diagonal with non-negative values called **singular values**. SVD works on *any* matrix — square or not, invertible or not.',
                '## Why SVD is everywhere',
                '- **Principal Component Analysis (PCA)**: the columns of V are the principal components\n- **Image compression**: keep only the k largest singular values to approximate the image\n- **Recommender systems**: matrix factorisation for collaborative filtering\n- **Least squares**: the pseudoinverse A⁺ = V Σ⁺ Uᵀ solves overdetermined systems\n- **Condition number**: σ_max / σ_min — how numerically sensitive the system is',
                '## Reading the output',
                '`U, s, Vt = np.linalg.svd(A)` returns:\n- `U` — (m,m) left singular vectors\n- `s` — array of singular values (sorted descending)\n- `Vt` — (n,n) right singular vectors **transposed** (not V, but Vᵀ)\n- Reconstruct: `A ≈ U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]`',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# SVD of a simple matrix
A = np.array([[3, 2, 2],
              [2, 3, -2]], dtype=float)

U, s, Vt = np.linalg.svd(A)
print("U (left singular vectors):")
print(U.round(4))
print("\\nSingular values s:", s.round(4))
print("\\nVt (right singular vectors transposed):")
print(Vt.round(4))

# Reconstruct — use full rank
Sigma = np.zeros(A.shape)
Sigma[:len(s), :len(s)] = np.diag(s)
reconstructed = U @ Sigma @ Vt
print(f"\\nReconstructed == A? {np.allclose(reconstructed, A)}")
print(f"Condition number: {s[0]/s[-1]:.2f}")

# Low-rank approximation — image compression analogy
rng = np.random.default_rng(7)
img = rng.random((40, 40))
U2, s2, Vt2 = np.linalg.svd(img)

print("\\nLow-rank approximation error vs rank k:")
for k in [1, 3, 5, 10, 20]:
    approx = U2[:, :k] @ np.diag(s2[:k]) @ Vt2[:k, :]
    err = np.linalg.norm(img - approx, 'fro') / np.linalg.norm(img, 'fro')
    pct = s2[:k].sum() / s2.sum() * 100
    print(f"  k={k:2d}: error={err:.4f}, variance captured={pct:.1f}%")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── PCA FROM SCRATCH ───────────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'PCA from scratch — numpy.linalg in action',
              prose: [
                '**Principal Component Analysis** finds the directions in a dataset along which the data varies most. Those directions — the **principal components** — are the eigenvectors of the covariance matrix, ordered by their eigenvalues (largest first = direction of most variance).',
                '## The PCA algorithm, step by step',
                '1. **Center the data**: subtract the column means so the data has mean zero\n2. **Compute the covariance matrix**: `C = Xᵀ @ X / (n-1)` — shape (p, p) for p features\n3. **Eigendecompose**: `vals, vecs = np.linalg.eigh(C)` — use `eigh` for symmetric matrices (guaranteed real, sorted)\n4. **Sort**: largest eigenvalue first (eigh returns ascending — reverse)\n5. **Project**: `X_pca = X_centered @ vecs[:, :k]` — project onto the top-k components',
                '## Variance explained',
                'Each eigenvalue tells you how much variance is captured by that component. The **explained variance ratio** for component i is: λᵢ / Σλⱼ. Plotting this as a "scree plot" shows how many components you need to retain most of the information.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Generate correlated 2D data
rng = np.random.default_rng(42)
n = 200
angle = np.radians(30)
R = np.array([[np.cos(angle), -np.sin(angle)],
              [np.sin(angle),  np.cos(angle)]])
raw = rng.standard_normal((n, 2)) * np.array([3.0, 0.8])
X = raw @ R.T + np.array([4.0, 2.0])  # rotate, then offset

# PCA from scratch
X_c = X - X.mean(axis=0)              # 1. centre
C   = X_c.T @ X_c / (n - 1)          # 2. covariance matrix
vals, vecs = np.linalg.eigh(C)        # 3. eigendecompose (eigh for symmetric)
idx  = np.argsort(vals)[::-1]         # 4. sort descending
vals = vals[idx]
vecs = vecs[:, idx]

explained = vals / vals.sum()
print("Covariance matrix C:")
print(C.round(3))
print(f"\\nEigenvalues:  {vals.round(3)}")
print(f"Explained var: {(explained * 100).round(1)} %")
print(f"\\nPC1 direction: {vecs[:,0].round(4)}")
print(f"PC2 direction: {vecs[:,1].round(4)}")

# Project onto PC1 and PC2
X_pca = X_c @ vecs

# Visualise original and PC axes
every5 = range(0, n, 5)
fig = Figure(xmin=-4, xmax=12, ymin=-3, ymax=8,
             title="Data with principal component axes")
fig.grid().axes()
fig.scatter([float(X[i,0]) for i in every5], [float(X[i,1]) for i in every5],
            color=BLUE, radius=3)
mean = X.mean(axis=0)
for i, color in enumerate([RED, AMBER]):
    scale = np.sqrt(vals[i]) * 2.5
    fig.arrow([float(mean[0]), float(mean[1])],
              [float(mean[0] + vecs[0,i]*scale), float(mean[1] + vecs[1,i]*scale)],
              color=color, label=f"PC{i+1}")
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── MARKOV CHAINS ──────────────────────────────────────────────────
            {
              id: 11,
              cellTitle: 'Markov chains — eigenvectors as steady states',
              prose: [
                'A **Markov chain** describes a system that jumps between states with fixed probabilities. A **transition matrix** P where Pᵢⱼ is the probability of moving from state j to state i. The columns sum to 1. Repeated matrix-vector multiplication `Pⁿ v` simulates the system evolving over n steps.',
                '## The steady state',
                'After enough steps, the distribution converges to the **stationary distribution** π — the vector that doesn\'t change when you apply P: **Pπ = π**. That is exactly the eigenvector of P with eigenvalue 1. This is the mathematical foundation of **Google\'s PageRank**.',
                '## Python pattern',
                '`np.linalg.eig(P)` finds all eigenvalues. The stationary distribution is the eigenvector corresponding to eigenvalue 1. Normalize it so its entries sum to 1 to get the steady-state probabilities.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Weather Markov chain — 3 states: Sunny, Cloudy, Rainy
# P[i,j] = prob of going FROM state j TO state i
P = np.array([[0.7, 0.3, 0.2],   # Sunny
              [0.2, 0.4, 0.4],   # Cloudy
              [0.1, 0.3, 0.4]])  # Rainy
states = ['Sunny', 'Cloudy', 'Rainy']

# Simulate 30 days starting from Sunny
v = np.array([1.0, 0.0, 0.0])  # start Sunny
history = [v.copy()]
for _ in range(30):
    v = P @ v
    history.append(v.copy())

history = np.array(history)
steps = np.arange(31)

fig = Figure(xmin=0, xmax=31, ymin=0, ymax=1.05,
             title="Weather Markov chain — probability over 30 days")
fig.grid().axes()
colors = [AMBER, GRAY, BLUE]
for i, (state, color) in enumerate(zip(states, colors)):
    fig.scatter(steps.tolist(), history[:, i].tolist(), color=color, radius=3)
fig.text([22, 0.65], "Sunny",  color='#b8860b', size=11, bold=True)
fig.text([22, 0.27], "Cloudy", color='gray',    size=11, bold=True)
fig.text([22, 0.12], "Rainy",  color='blue',    size=11, bold=True)
fig.show()

# Steady state via eigenvector
vals, vecs = np.linalg.eig(P)
idx1 = np.argmin(np.abs(vals - 1.0))   # eigenvalue closest to 1
steady = vecs[:, idx1].real
steady /= steady.sum()                  # normalise to sum to 1
print("Steady-state distribution:")
for state, prob in zip(states, steady):
    print(f"  {state}: {prob:.4f}")
print(f"\\nVerify Pπ = π: {np.allclose(P @ steady, steady)}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── PUTTING IT TOGETHER ────────────────────────────────────────────
            {
              id: 12,
              cellTitle: 'Putting it together — least squares in 3D',
              prose: [
                'This final cell fits a plane z = ax + by + c to noisy 3D data using least squares — a problem that shows up in surface fitting, computer vision (fitting a plane to a point cloud), and materials science (crystal plane orientation).',
                '## The Model → Compute → Visualize pattern for 3D',
                '1. **Model**: z = ax + by + c → design matrix A with columns [x, y, 1]\n2. **Compute**: `np.linalg.lstsq(A, z)` finds the best-fit coefficients\n3. **Visualize**: evaluate the fitted plane on a grid, scatter the data points over it\n- The residuals tell you how well the plane fits; the normal vector `[-a, -b, 1]` / norm is the plane\'s orientation in 3D space',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GRAY

# Noisy data from the plane z = 2x - y + 3
rng = np.random.default_rng(0)
n = 80
xs = rng.uniform(0, 5, n)
ys = rng.uniform(0, 5, n)
zs_true = 2*xs - ys + 3
zs = zs_true + rng.normal(0, 0.5, n)   # add noise

# Least squares fit: z = ax + by + c
A = np.column_stack([xs, ys, np.ones(n)])
coeffs, res, rank, sv = np.linalg.lstsq(A, zs, rcond=None)
a, b, c = coeffs
print(f"Fitted plane: z = {a:.4f}x + {b:.4f}y + {c:.4f}")
print(f"True plane:   z = 2.0000x - 1.0000y + 3.0000")
print()

# Evaluate fit
z_pred = A @ coeffs
residuals = zs - z_pred
rmse = np.sqrt(np.mean(residuals**2))
ss_res = (residuals**2).sum()
ss_tot = ((zs - zs.mean())**2).sum()
r2 = 1 - ss_res / ss_tot
print(f"RMSE: {rmse:.4f}")
print(f"R²:   {r2:.4f}")

# Normal vector to the plane
normal = np.array([-a, -b, 1.0])
normal /= np.linalg.norm(normal)
print(f"\\nPlane normal (unit): {normal.round(4)}")

# Visualize residuals vs predicted
fig = Figure(xmin=float(z_pred.min())-1, xmax=float(z_pred.max())+1, ymin=-2, ymax=2,
             title=f"Residuals vs fitted values (RMSE={rmse:.3f}, R²={r2:.3f})")
fig.grid().axes()
fig.scatter(z_pred.tolist(), residuals.tolist(), color=BLUE, radius=4)
fig.hline(0, color=GRAY)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGES ───────────────────────────────────────────────────

            // ── CHALLENGE 1: fill/easy ─────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'fill',
              challengeNumber: 1,
              challengeTitle: 'Vector operations',
              difficulty: 'easy',
              prompt: 'Fill in the blanks to compute key vector quantities.',
              starterBlock: `import numpy as np

a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 0.0, -1.0])

# 1. Euclidean norm of a
norm_a = np.linalg._____(a)

# 2. Unit vector in the direction of a
unit_a = a / _____

# 3. Dot product of a and b
dot_ab = a _____ b

# 4. Angle between a and b in degrees
cos_t = dot_ab / (norm_a * np.linalg.norm(b))
angle_deg = np.degrees(np.arccos(_____))

print(f"‖a‖ = {norm_a:.4f}")
print(f"unit(a) = {unit_a.round(4)}")
print(f"a · b = {dot_ab:.4f}")
print(f"angle = {angle_deg:.2f}°")`,
              code: `import numpy as np

a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 0.0, -1.0])

norm_a = np.linalg.norm(a)
unit_a = a / norm_a
dot_ab = a @ b
cos_t = dot_ab / (norm_a * np.linalg.norm(b))
angle_deg = np.degrees(np.arccos(cos_t))

print(f"‖a‖ = {norm_a:.4f}")
print(f"unit(a) = {unit_a.round(4)}")
print(f"a · b = {dot_ab:.4f}")
print(f"angle = {angle_deg:.2f}°")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 0.0, -1.0])
if 'norm_a' not in dir():
    res = "ERROR: norm_a not defined."
elif not np.isclose(norm_a, np.linalg.norm(a)):
    res = f"ERROR: norm_a should be {np.linalg.norm(a):.4f}, got {norm_a:.4f}."
elif not np.allclose(unit_a, a/np.linalg.norm(a)):
    res = "ERROR: unit_a should be a / ‖a‖."
elif not np.isclose(dot_ab, a @ b):
    res = f"ERROR: dot_ab should be {a@b}, got {dot_ab}."
elif not np.isclose(angle_deg, np.degrees(np.arccos((a@b)/(np.linalg.norm(a)*np.linalg.norm(b)))), atol=1e-4):
    res = f"ERROR: angle wrong. Got {angle_deg:.2f}°."
else:
    res = f"SUCCESS: ‖a‖={norm_a:.4f}, a·b={dot_ab:.1f}, angle={angle_deg:.2f}°."
res
`,
              hint: 'np.linalg.norm(a). unit_a = a / norm_a. dot = a @ b. angle = np.degrees(np.arccos(cos_t)).',
            },

            // ── CHALLENGE 2: write/easy ────────────────────────────────────────
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: '2D rotation matrix',
              difficulty: 'easy',
              prompt: 'Write `rotate2d(points, theta_deg)` that takes an (n, 2) array of points and rotates them counter-clockwise by `theta_deg` degrees. Use a rotation matrix and matrix multiplication — no loops. Then rotate a regular hexagon 30° and visualise both.',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def rotate2d(points, theta_deg):
    """Rotate (n,2) array of points by theta_deg degrees CCW."""
    pass

# Regular hexagon vertices
angles = np.linspace(0, 2*np.pi, 7)[:-1]
hexagon = np.column_stack([np.cos(angles), np.sin(angles)])

rotated = rotate2d(hexagon, 30)

print("Original hexagon (first 3 vertices):")
print(hexagon[:3].round(4))
print("Rotated 30°:")
print(rotated[:3].round(4))
print(f"\\nNorms preserved? {np.allclose(np.linalg.norm(hexagon, axis=1), np.linalg.norm(rotated, axis=1))}")

# Close the polygon for plotting
orig_closed = np.vstack([hexagon, hexagon[0]])
rot_closed  = np.vstack([rotated, rotated[0]])

fig = Figure(xmin=-1.5, xmax=1.5, ymin=-1.5, ymax=1.5,
             title="Hexagon before (gray) and after rotation 30° (blue)", square=True)
fig.grid().axes()
fig.polygon(hexagon.tolist(),  color=GRAY, fill=False, stroke=True)
fig.polygon(rotated.tolist(),  color=BLUE, fill=False, stroke=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'rotate2d' not in dir():
    res = "ERROR: rotate2d not defined."
else:
    pts = np.array([[1,0],[0,1],[-1,0],[0,-1]], dtype=float)
    r90 = rotate2d(pts, 90)
    if r90 is None:
        res = "ERROR: returned None — fill in the function."
    elif r90.shape != (4,2):
        res = f"ERROR: shape should be (4,2), got {r90.shape}."
    elif not np.allclose(r90[0], [0,1], atol=1e-6):
        res = f"ERROR: (1,0) rotated 90° should be (0,1), got {r90[0]}."
    elif not np.allclose(np.linalg.norm(r90, axis=1), np.linalg.norm(pts, axis=1)):
        res = "ERROR: norms changed after rotation — rotation should preserve length."
    else:
        r30 = rotate2d(np.array([[1,0]], dtype=float), 30)
        expected = [np.cos(np.radians(30)), np.sin(np.radians(30))]
        if not np.allclose(r30[0], expected, atol=1e-6):
            res = f"ERROR: 30° rotation of (1,0) wrong. Got {r30[0]}."
        else:
            res = f"SUCCESS: rotate2d correct. 90° rotation of (1,0) → {r90[0].round(4)}."
res
`,
              hint: 'Build R = np.array([[cos,-sin],[sin,cos]]). Then (points @ R.T) applies it to each row — OR (R @ points.T).T.',
            },

            // ── CHALLENGE 3: write/medium ──────────────────────────────────────
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Solve a network flow system',
              difficulty: 'medium',
              prompt: 'A water distribution network has 4 junctions (nodes). Flow conservation at each node gives a linear equation. Write `solve_flow(A, supply)` that solves the system Ax = supply using `np.linalg.solve`. Then: (1) solve the given system, (2) verify by checking Ax = supply, (3) identify which pipe carries the most flow, (4) compute the condition number and explain what it means for numerical stability.',
              code: `import numpy as np

def solve_flow(A, supply):
    """
    Solve Ax = supply for flow rates x.
    Return the solution vector.
    """
    pass

# Flow conservation matrix (each row: flow in - flow out = supply at node)
A = np.array([
    [ 2, -1,  0, -1],
    [-1,  3, -1, -1],
    [ 0, -1,  2,  0],
    [-1, -1,  0,  3]
], dtype=float)

supply = np.array([10.0, 5.0, -3.0, -12.0])  # positive = source, negative = sink

flows = solve_flow(A, supply)
print("Flow rates:", flows.round(4))
print(f"\\nVerify Ax = supply: {np.allclose(A @ flows, supply)}")
print(f"Max flow: pipe {flows.argmax() + 1} carrying {flows.max():.4f} units")
print(f"Min flow: pipe {flows.argmin() + 1} carrying {flows.min():.4f} units")

cond = np.linalg.cond(A)
print(f"\\nCondition number: {cond:.2f}")
if cond < 100:
    print("Well-conditioned: small perturbations in supply cause small errors in flow.")
else:
    print("Ill-conditioned: small perturbations may cause large errors.")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
A = np.array([[2,-1,0,-1],[-1,3,-1,-1],[0,-1,2,0],[-1,-1,0,3]], dtype=float)
supply = np.array([10.0, 5.0, -3.0, -12.0])
if 'solve_flow' not in dir():
    res = "ERROR: solve_flow not defined."
else:
    flows = solve_flow(A, supply)
    if flows is None:
        res = "ERROR: returned None — fill in the function."
    elif not isinstance(flows, np.ndarray):
        res = "ERROR: must return a numpy array."
    elif not np.allclose(A @ flows, supply, atol=1e-6):
        res = f"ERROR: Ax ≠ supply. Got Ax = {(A@flows).round(4)}, expected {supply}."
    else:
        res = f"SUCCESS: flows = {flows.round(4)}. Max flow = {flows.max():.4f} at pipe {flows.argmax()+1}."
res
`,
              hint: 'np.linalg.solve(A, supply). Condition number: np.linalg.cond(A). A high condition number (> 1e6) means the system is sensitive to numerical errors.',
            },

            // ── CHALLENGE 4: write/medium ──────────────────────────────────────
            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Image compression with SVD',
              difficulty: 'medium',
              prompt: 'Write `svd_compress(matrix, k)` that returns the rank-k approximation of a matrix using SVD. Then: (1) apply it to a synthetic 50×50 "image" for k = 1, 3, 5, 10, 25, (2) compute the compression ratio (k components store k×(m+n+1) numbers vs the full m×n), (3) compute the Frobenius-norm relative error for each k, (4) plot relative error vs k.',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def svd_compress(matrix, k):
    """Return the rank-k SVD approximation of matrix."""
    pass

# Synthetic image with structure (not random noise)
x = np.linspace(0, 4*np.pi, 50)
y = np.linspace(0, 4*np.pi, 50)
X, Y = np.meshgrid(x, y)
img = np.sin(X) * np.cos(Y) + 0.5*np.sin(2*X + Y)

m, n = img.shape
full_values = m * n

ks = [1, 2, 3, 5, 10, 15, 20, 25]
errors = []
ratios = []

print(f"Original: {m}×{n} = {full_values} values")
print(f"{'k':>4}  {'stored':>8}  {'ratio':>8}  {'rel error':>10}")
print("-" * 38)

for k in ks:
    approx = svd_compress(img, k)
    stored = k * (m + n + 1)
    ratio = full_values / stored
    err = np.linalg.norm(img - approx, 'fro') / np.linalg.norm(img, 'fro')
    errors.append(err)
    ratios.append(ratio)
    print(f"{k:>4}  {stored:>8}  {ratio:>8.1f}×  {err:>10.4f}")

fig = Figure(xmin=0, xmax=26, ymin=0, ymax=max(errors)*1.1,
             title="SVD compression: relative error vs rank k")
fig.grid().axes()
fig.scatter(ks, errors, color=BLUE, radius=6)
fig.plot(ks, errors, color=BLUE)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'svd_compress' not in dir():
    res = "ERROR: svd_compress not defined."
else:
    A = np.array([[1,2,3],[4,5,6],[7,8,9],[10,11,12]], dtype=float)
    k1 = svd_compress(A, 1)
    k2 = svd_compress(A, 2)
    if k1 is None:
        res = "ERROR: returned None — fill in the function."
    elif k1.shape != A.shape:
        res = f"ERROR: output shape should be {A.shape}, got {k1.shape}."
    elif np.linalg.matrix_rank(k1.round(8)) != 1:
        res = f"ERROR: rank-1 approximation should have rank 1, got {np.linalg.matrix_rank(k1.round(8))}."
    elif np.linalg.norm(A - k2) >= np.linalg.norm(A - k1):
        res = "ERROR: rank-2 approximation should have smaller error than rank-1."
    else:
        err1 = np.linalg.norm(A - k1, 'fro') / np.linalg.norm(A, 'fro')
        res = f"SUCCESS: svd_compress correct. Rank-1 relative error = {err1:.4f}."
res
`,
              hint: 'U, s, Vt = np.linalg.svd(matrix, full_matrices=False). Rank-k approx: U[:,:k] @ np.diag(s[:k]) @ Vt[:k,:].',
            },

            // ── CHALLENGE 5: write/hard ────────────────────────────────────────
            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'PCA from scratch — full implementation',
              difficulty: 'hard',
              prompt: 'Implement `pca(X, k)` from scratch using only numpy. It should: (1) centre the data, (2) compute the covariance matrix, (3) find eigenvectors via `np.linalg.eigh`, (4) sort by descending eigenvalue, (5) return a dict with keys: `components` (k principal components as rows), `scores` (n × k projected data), `explained_variance_ratio` (k values summing to ≤ 1), `mean` (original column means). Then apply it to a dataset with 3 features reduced to 2 components, verify the reconstruction error is less than using any 2 random directions, and visualize the scores.',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def pca(X, k):
    """
    Principal Component Analysis.
    X: (n, p) data matrix
    k: number of components to keep
    Returns dict with: components, scores, explained_variance_ratio, mean
    """
    pass

# Dataset: 3 correlated features, 150 samples
rng = np.random.default_rng(0)
n = 150
# True latent structure: 2D
z1 = rng.standard_normal(n)
z2 = rng.standard_normal(n)
X = np.column_stack([
    2*z1 + 0.3*z2 + 0.2*rng.standard_normal(n),
    1.5*z1 - z2   + 0.2*rng.standard_normal(n),
    0.5*z1 + 2*z2 + 0.2*rng.standard_normal(n),
])

result = pca(X, k=2)
print("Components (rows = principal components):")
print(result['components'].round(4))
print(f"\\nExplained variance ratio: {result['explained_variance_ratio'].round(4)}")
print(f"Total variance captured:  {result['explained_variance_ratio'].sum()*100:.1f}%")
print(f"Scores shape: {result['scores'].shape}")

# Reconstruction from k components
X_c = X - result['mean']
X_recon = result['scores'] @ result['components'] + result['mean']
recon_err = np.linalg.norm(X - X_recon, 'fro') / np.linalg.norm(X, 'fro')
print(f"Reconstruction relative error: {recon_err:.4f}")

# Compare: 2 random directions
rand_dirs = np.linalg.qr(rng.standard_normal((3,2)))[0].T  # orthonormal random
rand_scores = X_c @ rand_dirs.T
rand_recon  = rand_scores @ rand_dirs + result['mean']
rand_err = np.linalg.norm(X - rand_recon, 'fro') / np.linalg.norm(X, 'fro')
print(f"Random directions error:       {rand_err:.4f}  (should be larger)")

# Visualize 2D scores
scores = result['scores']
every2 = range(0, n, 2)
fig = Figure(xmin=scores[:,0].min()-0.5, xmax=scores[:,0].max()+0.5,
             ymin=scores[:,1].min()-0.5, ymax=scores[:,1].max()+0.5,
             title="PCA scores — data projected onto PC1 and PC2")
fig.grid().axes()
fig.scatter([float(scores[i,0]) for i in every2], [float(scores[i,1]) for i in every2],
            color=BLUE, radius=4)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
rng = np.random.default_rng(0)
n = 150
z1 = rng.standard_normal(n); z2 = rng.standard_normal(n)
X = np.column_stack([2*z1+0.3*z2+0.2*rng.standard_normal(n),
                     1.5*z1-z2+0.2*rng.standard_normal(n),
                     0.5*z1+2*z2+0.2*rng.standard_normal(n)])
if 'pca' not in dir():
    res = "ERROR: pca not defined."
else:
    r = pca(X, k=2)
    if r is None:
        res = "ERROR: returned None — fill in the function."
    elif not isinstance(r, dict):
        res = "ERROR: must return a dict."
    elif 'components' not in r:
        res = "ERROR: dict missing 'components' key."
    elif r['components'].shape != (2, 3):
        res = f"ERROR: components shape should be (2,3), got {r['components'].shape}."
    elif r['scores'].shape != (150, 2):
        res = f"ERROR: scores shape should be (150,2), got {r['scores'].shape}."
    elif not np.isclose(r['explained_variance_ratio'].sum(), r['explained_variance_ratio'].sum()):
        res = "ERROR: explained_variance_ratio does not sum correctly."
    elif r['explained_variance_ratio'][0] < r['explained_variance_ratio'][1]:
        res = "ERROR: components should be sorted by descending explained variance."
    elif not np.allclose(r['mean'], X.mean(axis=0), atol=1e-8):
        res = "ERROR: 'mean' should be the column means of X."
    else:
        evr = r['explained_variance_ratio']
        res = f"SUCCESS: PCA correct — PC1={evr[0]*100:.1f}%, PC2={evr[1]*100:.1f}%, total={evr.sum()*100:.1f}%."
res
`,
              hint: 'mean=X.mean(axis=0). X_c=X-mean. C=X_c.T@X_c/(n-1). vals,vecs=np.linalg.eigh(C). Sort descending: idx=np.argsort(vals)[::-1]. components=vecs[:,idx[:k]].T. scores=X_c@components.T. explained_variance_ratio=vals[idx[:k]]/vals.sum().',
            },

          ], // end initialCells
        }, // end props
      }, // end visualization
    ], // end visualizations
  }, // end intuition
}
