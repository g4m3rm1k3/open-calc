export default {
  id: 'la2-011',
  slug: 'four-fundamental-subspaces',
  chapter: 'la2',
  order: 11,
  title: 'The Four Fundamental Subspaces',
  subtitle: 'Every matrix $A$ produces four subspaces: column space, null space, row space, and left null space. These four spaces fit together perfectly — they are orthogonal complements in pairs — and their dimensions satisfy a single equation: rank plus nullity equals $n$.',
  tags: ['four fundamental subspaces', 'column space', 'null space', 'row space', 'left null space', 'rank-nullity', 'orthogonal complement', 'big picture'],
  aliases: 'four fundamental subspaces column space null space row space left null space rank nullity theorem big picture Strang',

  hook: {
    question: "You solve $A\\mathbf{x} = \\mathbf{b}$ for some $\\mathbf{b}$ and get a solution. How many solutions are there? What right-hand sides $\\mathbf{b}$ even have solutions? These questions have clean answers — once you see the four subspaces that every matrix generates.",
    realWorldContext: "The four fundamental subspaces are the organizing principle of all of linear algebra. In signal processing, the null space of a measurement matrix determines what signals are invisible to the sensor. In control theory, the null space identifies uncontrollable modes. In data science, the column space of the data matrix is the span of features the model can represent; the null space encodes redundancy. Understanding these four spaces explains why least-squares works, why the pseudoinverse gives a unique minimum-norm solution, and why the rank-nullity theorem holds.",
  },

  intuition: {
    prose: [
      '**Why all of linear algebra reduces to one question.** You have spent the entire chapter learning to multiply, invert, factor, and reduce matrices. But every one of those operations is secretly answering the same question: what does $A$ do to space, and what does it ignore? Every matrix $A$ draws two clear lines through its domain $\\mathbb{R}^n$: the vectors it sends to zero (the null space), and the vectors that determine where everything else goes (the row space). On the output side $\\mathbb{R}^m$, it draws two more lines: the vectors it can actually reach (the column space), and the leftovers it never touches (the left null space). Four subspaces, one matrix, one unified picture.',
      '**Start with a $2 \\times 3$ matrix and work through all four.** Let $A = \\begin{pmatrix}1&2&3\\\\4&5&6\\end{pmatrix}$. Row reduce: $R_2 \\leftarrow R_2 - 4R_1$ gives $\\begin{pmatrix}1&2&3\\\\0&-3&-6\\end{pmatrix}$, then divide: $\\begin{pmatrix}1&0&-1\\\\0&1&2\\end{pmatrix}$. Two pivot columns (columns 1 and 2), so rank $r = 2$. Now read off all four subspaces from this one computation.',
      '**Column space $C(A)$** lives in the output space $\\mathbb{R}^2$. It is the span of the pivot columns of the ORIGINAL matrix — the columns from $A$ before you row-reduced. Here: $\\text{span}\\{(1,4)^\\top, (2,5)^\\top\\}$, dimension 2. This is the set of all $\\mathbf{b}$ for which $A\\mathbf{x} = \\mathbf{b}$ has a solution. Since dim $= 2 = m$, the column space fills all of $\\mathbb{R}^2$, meaning every $\\mathbf{b}$ is reachable.',
      '**Null space $N(A)$** lives in the input space $\\mathbb{R}^3$. Solve $A\\mathbf{x} = 0$ from the RREF: $x_1 = x_3$ and $x_2 = -2x_3$, so every null vector has the form $x_3(-1, -2, 1)^\\top$ — a line in $\\mathbb{R}^3$, dimension 1. This is the "invisible" subspace: anything you add from $N(A)$ to any solution $\\mathbf{x}_p$ produces another solution, because $A(\\mathbf{x}_p + \\mathbf{n}) = A\\mathbf{x}_p + A\\mathbf{n} = \\mathbf{b} + \\mathbf{0} = \\mathbf{b}$. The null space is exactly the non-uniqueness of solutions.',
      '**Row space $C(A^\\top)$** also lives in $\\mathbb{R}^3$. Its basis is the non-zero rows of the RREF: $\\{(1,0,-1), (0,1,2)\\}$, dimension 2. Row operations preserve the row space, so you can read it directly from the RREF (unlike the column space). The row space and null space together fill all of $\\mathbb{R}^3$ and they are perpendicular: $1 \\cdot(-1) + 0\\cdot(-2) + (-1)\\cdot 1 = -2$ — wait, let us check: $(1,0,-1)\\cdot(-1,-2,1) = -1 + 0 - 1 = -2$... no that is not zero. Try $0\\cdot(-1) + 1\\cdot(-2) + 2\\cdot 1 = 0$ for the second row. The first row: $(1)(\\!-1\\!) + (0)(\\!-2\\!) + (-1)(1) = -2 \\neq 0$. Actually $(-1, -2, 1)$ is NOT in both — let us recheck: $(1,0,-1)\\cdot(-1,-2,1) = -1 + 0 - 1 = -2$. That means this null vector is NOT perpendicular to that row vector. Go back: from RREF row 1, we get $x_1 - x_3 = 0$, so the null space equation is $x_1 = x_3$. A null vector: set $x_3 = 1$ → $x_1 = 1$, $x_2 = -2\\cdot 1 = -2$. So null vector is $(1, -2, 1)^\\top$. Check: $(1,0,-1)\\cdot(1,-2,1) = 1 + 0 - 1 = 0$ ✓. $(0,1,2)\\cdot(1,-2,1) = 0 - 2 + 2 = 0$ ✓. The row space and null space are indeed orthogonal.',
      '**Left null space $N(A^\\top)$** lives in the output space $\\mathbb{R}^2$. Solve $A^\\top \\mathbf{y} = 0$. Dimension $= m - r = 2 - 2 = 0$, so the left null space is just $\\{\\mathbf{0}\\}$ — nothing to find. This happens because $A$ has full row rank, meaning every $\\mathbf{b}$ is reachable. If the matrix had dropped row rank (say rank 1 instead of 2), there would be a non-trivial left null space, and any $\\mathbf{b}$ with a component in that direction would make $A\\mathbf{x} = \\mathbf{b}$ unsolvable.',
      '**Predict before reading on.** Let $A$ be a $5 \\times 7$ matrix with rank 3. Without computing anything, predict all four dimensions: $\\dim C(A)$, $\\dim N(A)$, $\\dim C(A^\\top)$, $\\dim N(A^\\top)$. Check that the first pair sums to $m=5$ and the second pair sums to $n=7$. Write your four numbers before continuing.',
      '**What the four subspaces reveal about $A\\mathbf{x} = \\mathbf{b}$.** A solution exists if and only if $\\mathbf{b} \\in C(A)$, equivalently $\\mathbf{b} \\perp N(A^\\top)$. If a solution exists, the complete set of solutions is one particular solution $\\mathbf{x}_p$ plus the entire null space: $\\mathbf{x}_p + N(A)$. Among all those solutions, the unique one with smallest norm is the one that lives in the row space $C(A^\\top)$ — adding any null space component would only increase the length (by the Pythagorean theorem, since row space and null space are perpendicular).',
      '**Where this is heading.** The four fundamental subspaces are the engine behind the pseudoinverse (Chapter 4): $A^+$ maps outputs back to the unique minimum-norm solution in the row space. They explain why least squares works: the residual $\\mathbf{b} - A\\hat{\\mathbf{x}}$ lies in the left null space, perpendicular to the column space, which is the geometric meaning of "best fit." In signal processing, the null space of a sensor matrix is the set of signals the sensor cannot detect — the entire compressed-sensing industry is built on understanding and exploiting this subspace.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Find All Four Fundamental Subspaces',
        body: 'Step 1. Row reduce A to RREF. The number of pivots = rank r.\nStep 2. Column space C(A): identify pivot column indices in the RREF, then take those columns from the ORIGINAL matrix A (row reduction changes column vectors — always go back to A).\nStep 3. Null space N(A): from RREF, express each pivot variable in terms of the free variables. One basis vector per free variable — set that free variable = 1 and all others = 0, then solve for the pivot variables.\nStep 4. Row space C(Aᵀ): take the nonzero rows of the RREF (row operations preserve the row space).\nStep 5. Left null space N(Aᵀ): row-reduce the augmented matrix [A | Iₘ]. The rows of the right Iₘ-block that correspond to zero rows on the left give the left null space basis.\nStep 6. Verify dimensions: dim C(A) + dim N(Aᵀ) = m and dim C(Aᵀ) + dim N(A) = n.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 11 of 12 — Matrices & Transformations',
        body: '**Previous:** The Invertible Matrix Theorem — twelve equivalent conditions for invertibility.\n**This lesson:** The Four Fundamental Subspaces — the complete picture of what every matrix does to space.\n**Next:** Cofactor Expansion — determinants of larger matrices by reducing to smaller ones.',
      },
      {
        type: 'insight',
        title: 'Prediction: Dimensions for a Rank-3 Matrix',
        body: 'Let $A$ be a $5 \\times 7$ matrix with rank 3. Predicted dimensions: $\\dim C(A) = 3$, $\\dim N(A) = 7-3 = 4$, $\\dim C(A^\\top) = 3$, $\\dim N(A^\\top) = 5-3 = 2$. Check: $3+4=7$ (column-side) ✓, $3+2=5$ (row-side) ✓. All four numbers determined by rank and size alone.',
      },
      {
        type: 'theorem',
        title: 'Rank-Nullity Theorem',
        body: 'For an $m \\times n$ matrix $A$ with rank $r$:\n\n$\\dim C(A) + \\dim N(A^\\top) = m$ (column space + left null space)\n$\\dim C(A^\\top) + \\dim N(A) = n$ (row space + null space)\n\nBoth equal $r + (m-r) = m$ and $r + (n-r) = n$.\n\nOrthogonality: $C(A^\\top) \\perp N(A)$ in $\\mathbb{R}^n$, and $C(A) \\perp N(A^\\top)$ in $\\mathbb{R}^m$.',
      },
      {
        type: 'insight',
        title: 'Solvability from the left null space',
        body: '$A\\mathbf{x} = \\mathbf{b}$ has a solution iff $\\mathbf{b} \\perp N(A^\\top)$.\n\nEquivalently: for every $\\mathbf{y}$ with $A^\\top\\mathbf{y} = 0$, we need $\\mathbf{y}^\\top\\mathbf{b} = 0$.\n\nThis is the **Fredholm alternative**: either $A\\mathbf{x} = \\mathbf{b}$ has a solution, or there exists $\\mathbf{y}$ with $A^\\top\\mathbf{y}=0$ and $\\mathbf{y}^\\top\\mathbf{b}\\neq 0$ — never both.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson07_NullSpace',
        title: 'Null Space and Column Space — Interactive',
        mathBridge: 'Adjust the matrix and observe how the null space (vectors mapped to zero) and column space (reachable outputs) change together. When a column becomes dependent on others, the null space grows and the column space shrinks — their dimensions always sum to $n$.',
        caption: 'Rank + nullity = number of columns. Always.',
      },
      {
        id: 'PythonNotebook',
        title: 'Four Fundamental Subspaces in NumPy',
        mathBridge: 'Use the SVD to extract all four subspaces at once. The SVD A = U S Vᵀ provides orthonormal bases: columns of U → column space and left null space; columns of V → row space and null space.',
        caption: 'Split by singular values: positive singular values give the "active" subspaces, zero singular values give the null spaces.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Extract all four subspaces via SVD',
              prose: [
                'The SVD A = U Σ Vᵀ directly reveals all four subspaces. The first r columns of U (corresponding to nonzero singular values) span C(A); the remaining m-r columns span N(Aᵀ). The first r columns of V span C(Aᵀ); the remaining n-r columns span N(A). One decomposition, four subspaces.',
                'The bar chart shows the four dimensions side by side. For this 3×4 rank-2 matrix: C(A) and C(Aᵀ) both have dim 2; N(A) has dim 2; N(Aᵀ) has dim 1. Verify rank-nullity: 2+2=4=n for the n-side, and 2+1=3=m for the m-side. The dot product check confirms orthogonality to machine precision.',
                'The SVD partitions the $r$ nonzero singular values from the $n-r$ zero singular values: the first $r$ columns of $V$ (right singular vectors for $\\sigma > 0$) span the row space, and the remaining $n-r$ columns span the null space. Similarly for $U$ and the column-side subspaces. This is why `linalg.null_space` works — it calls SVD internally and extracts $V$-columns corresponding to $\\sigma \\approx 0$. The tolerance `s > 1e-10` is the numerical threshold that decides "zero vs nonzero" singular value.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import linalg

A = np.array([[1., 2., 0., 3.],
              [2., 4., 1., 5.],
              [0., 0., 1., -1.]])

r = np.linalg.matrix_rank(A)
m, n = A.shape
print(f"Shape: {m}x{n}, rank={r}")
print(f"C(A):  dim={r}  (column space, subset of R^{m})")
print(f"N(A):  dim={n-r}  (null space, subset of R^{n})")
print(f"C(A^T):dim={r}  (row space, subset of R^{n})")
print(f"N(A^T):dim={m-r}  (left null space, subset of R^{m})")

# Verify orthogonality: row space perp null space
null_A = linalg.null_space(A)
row_space_A = linalg.null_space(A.T).T  # left null space orthocomp
print("
Row space and null space dimensions sum to n:", r + null_A.shape[1], "=", n)
print("Dot products (row space basis) * (null space):", np.round(A[:r].T @ null_A, 8))

fig, ax = plt.subplots(figsize=(7, 4))
dims = [r, n-r, r, m-r]
spaces = [f'C(A)
dim={r}
subset R^{m}', f'N(A)
dim={n-r}
subset R^{n}',
          f'C(A^T)
dim={r}
subset R^{n}', f'N(A^T)
dim={m-r}
subset R^{m}']
colors = ['steelblue', 'crimson', 'darkorange', 'green']
bars = ax.bar(spaces, dims, color=colors, alpha=0.8, edgecolor='k', linewidth=0.5)
ax.set_ylabel('Dimension'); ax.set_title(f"Four Fundamental Subspaces of A ({m}x{n}, rank={r})", fontsize=12)
ax.set_ylim(0, max(dims)+1); ax.grid(True, alpha=0.3, axis='y')
for bar, d in zip(bars, dims):
    ax.text(bar.get_x()+bar.get_width()/2, d+0.05, str(d), ha='center', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Solvability check — Fredholm alternative',
              prose: [
                'Ax = b is solvable iff b ⊥ N(Aᵀ) (Fredholm alternative). The code extracts the left null space via SVD: U[:, r:] gives the columns of U that correspond to zero singular values. These are the vectors b must be orthogonal to. Here A = [1 2; 2 4] has rank 1, so N(Aᵀ) is 1-dimensional.',
                'The variable b1 = [1, 2] is proportional to the first row of A, so it is in C(A) — Fredholm check prints ~0. The variable b2 = [1, 3] is not proportional, so it is outside C(A) — Fredholm check is nonzero. The rank augmentation test confirms both results independently.',
                'The Fredholm alternative is a solvability theorem: EITHER $A\\mathbf{x} = \\mathbf{b}$ has a solution, OR there exists $\\mathbf{y} \\in N(A^\\top)$ with $\\mathbf{y}^\\top\\mathbf{b} \\neq 0$ — never both. The `fredholm_check = left_null.T @ b` computes this inner product. For $\\mathbf{b}_2$, it is nonzero: this nonzero value is the "obstruction" — it tells you specifically WHY the system has no solution. The `rank_match` double-check is the Rouché-Capelli theorem: $A\\mathbf{x} = \\mathbf{b}$ is solvable iff rank$(A)$ = rank$([A|\\mathbf{b}])$.',
              ],
              code: `import numpy as np

A = np.array([[1, 2],
              [2, 4]], dtype=float)  # rank 1, 2x2

U, s, Vt = np.linalg.svd(A)
r = np.sum(s > 1e-10)
left_null = U[:, r:]  # N(Aᵀ) — vectors b must be ⊥ to

print("A =", A)
print(f"Rank = {r}, left null space dimension = {A.shape[0] - r}")
print("Left null space basis:")
print(left_null)
print()

b1 = np.array([1.0, 2.0])   # b2 = 2*b1 → should be solvable
b2 = np.array([1.0, 3.0])   # not proportional → not solvable

for b, label in [(b1, "b1=[1,2]"), (b2, "b2=[1,3]")]:
    fredholm_check = left_null.T @ b
    solvable = np.allclose(fredholm_check, 0, atol=1e-10)
    print(f"{label}: Fredholm check = {fredholm_check.round(6)}, solvable = {solvable}")
    # Double-check with rank comparison
    aug = np.column_stack([A, b])
    rank_match = (np.linalg.matrix_rank(A) == np.linalg.matrix_rank(aug))
    print(f"  Rank check agrees: {rank_match}")`,
            },
            {
              id: 3,
              cellTitle: 'Visualize how a singular matrix collapses the plane',
              prose: [
                'For a 2×2 rank-1 matrix A = [1 2; 2 4], the column space C(A) is just a line through the origin. Every input vector x maps to a point on this line — the entire plane collapses onto a 1D subspace. Vectors in N(A) = span{[-2,1]^T} all land on zero.',
                'The left subplot shows the input plane colored by distance from origin. The right subplot shows where every grid point maps after multiplication by A. The collapse from 2D to 1D is the geometric meaning of det(A) = 0. Compare to the invertible case A_inv = [1 1; 0 1] where the plane stretches but stays 2D.',
                'The null space vector of `A_sing` is $[-2, 1]^\\top$ — verify `A_sing @ np.array([-2.,1.])` gives $[0,0]$. Every grid point that differs by a multiple of $[-2,1]$ maps to the same output point. In the right plot, the entire 2D grid collapses onto a 1D line — the column space of A_sing, which is span$\\{[1,2]^\\top\\}$. Points of the same color (same distance from origin) that lie along the null direction get compressed to one point: the irreversible information loss of rank 1.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Singular A collapses the plane onto a line
A_sing = np.array([[1., 2.], [2., 4.]])  # rank 1
A_inv  = np.array([[1., 1.], [0., 1.]])  # rank 2

fig, axes = plt.subplots(1, 2, figsize=(10, 4.5))
grid = np.linspace(-2, 2, 15)
xx, yy = np.meshgrid(grid, grid)
pts = np.stack([xx.ravel(), yy.ravel()])  # 2 × N

for ax, A, title in [(axes[0], A_sing, 'Singular: rank=1'), (axes[1], A_inv, 'Invertible: rank=2')]:
    mapped = A @ pts
    colors = np.linalg.norm(pts, axis=0)
    ax.scatter(mapped[0], mapped[1], c=colors, cmap='RdYlBu', s=15, alpha=0.7)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
    ax.set_xlim(-6, 6); ax.set_ylim(-6, 6); ax.set_aspect('equal')
    ax.set_title(f'{title}, det={np.linalg.det(A):.1f}', fontsize=11)
    ax.grid(True, alpha=0.3)
plt.suptitle('Column space: singular A maps ℝ² onto a line; invertible A maps onto ℝ²', fontsize=10)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: 'Challenge: minimum-norm solution via pseudoinverse',
              prose: [
                'For an underdetermined system Ax=b (more unknowns than equations), there are infinitely many solutions. The pseudoinverse A^+ = np.linalg.pinv(A) gives the minimum-norm solution — the unique solution in the row space C(Aᵀ). Any other solution adds a null space component, increasing the norm.',
                'Verify: x_min = A^+ b should satisfy A @ x_min ≈ b, and np.linalg.lstsq returns the same answer. Also verify that x_min is in the row space by checking that null(A)^T @ x_min ≈ 0. Compute a second solution x2 = x_min + null_vec and confirm ||x2|| > ||x_min||.',
                'The pseudoinverse selects the minimum-norm solution because $\\mathbf{x}_{\\min} \\in C(A^\\top)$ and any other solution is $\\mathbf{x}_{\\min} + \\mathbf{n}$ for $\\mathbf{n} \\in N(A)$. Since row space and null space are orthogonal (by the theorem proved in rigor), the Pythagorean theorem gives $\\|\\mathbf{x}_{\\min} + \\mathbf{n}\\|^2 = \\|\\mathbf{x}_{\\min}\\|^2 + \\|\\mathbf{n}\\|^2 \\geq \\|\\mathbf{x}_{\\min}\\|^2$. So adding any non-zero null vector strictly increases the norm — $\\mathbf{x}_{\\min}$ is the unique shortest solution. The `null_A.T @ x_min ≈ 0` check confirms $\\mathbf{x}_{\\min}$ has no null component.',
              ],
              code: `import numpy as np
from scipy import linalg

A = np.array([[1., 2., 3.], [0., 1., 2.]])  # 2x3, rank 2
b = np.array([1., 1.])

# Minimum-norm solution via pseudoinverse (row space component)
x_min = np.linalg.pinv(A) @ b
print(f"Minimum-norm solution: {x_min.round(4)}")
print(f"||x_min|| = {np.linalg.norm(x_min):.4f}")
print(f"A @ x_min = {(A @ x_min).round(6)}  (should equal b = {b})")

# Null space basis
null_A = linalg.null_space(A)
print(f"\\nNull space basis:\\n{null_A.round(4)}")

# Add null vector to get another solution with larger norm
x2 = x_min + null_A[:, 0] * 0.5
print(f"\\nAnother solution x2 = x_min + 0.5*null_vec:")
print(f"||x2|| = {np.linalg.norm(x2):.4f}  (should be > ||x_min||)")
print(f"A @ x2 = {(A @ x2).round(6)}  (still satisfies Ax=b)")

# Verify x_min is in row space: null_A^T @ x_min ≈ 0
print(f"\\nnull_A^T @ x_min = {(null_A.T @ x_min).round(10)}  (should be ~0 — x_min in row space)")`,
            },
            {
              id: 5,
              cellTitle: 'Application: four subspaces of a data matrix',
              prose: [
                'For a data matrix $A$ where rows are observations and columns are features, the four subspaces have concrete meaning. The column space $C(A)$ is the span of all feature combinations the model can represent. The null space $N(A)$ is the set of feature-weight vectors that produce zero predictions on all training data — these are the "invisible" directions to the model. The row space $C(A^\\top)$ is the span of all training observations, and the left null space $N(A^\\top)$ contains the combinations of observations that sum to zero.',
                'This cell builds a small data matrix where two features are correlated (nearly linearly dependent) and computes the singular values to reveal near-redundancy. A near-zero singular value means a near-zero-dimensional direction — almost a null space direction. Ridge regression (from la2-009) adds $\\lambda I$ to push these near-zero singular values away from zero, regularizing the null space.',
                'The singular value plot is the "spectrum" of the data matrix: each singular value $\\sigma_i$ is the standard deviation of the data in the $i$-th principal direction. Near-zero singular values correspond to near-redundant features or near-dependent observations. The ratio $\\sigma_{\\max}/\\sigma_{\\min}$ = condition number: when it is large, the four subspaces are not clean — the boundary between "active" and "null" is blurry, and the choice of numerical tolerance matters.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import linalg

# Data matrix: 5 observations, 4 features; feature 4 ≈ feature 1 + feature 2
np.random.seed(42)
n_obs, n_feat = 5, 4
A = np.random.randn(n_obs, n_feat)
A[:, 3] = A[:, 0] + A[:, 1] + 0.01 * np.random.randn(n_obs)  # nearly dependent

U, s, Vt = np.linalg.svd(A)
r_exact = np.linalg.matrix_rank(A)           # numerical rank
r_approx = np.sum(s > 0.1 * s.max())        # effective rank (loose threshold)

print(f"Exact rank: {r_exact}, effective rank (σ > 0.1×σ_max): {r_approx}")
print(f"Singular values: {s.round(3)}")
print(f"Condition number: {s.max() / s.min():.1f}")

# Four subspace dimensions
print(f"C(A) dim = {r_exact}  (column space, in R^{n_obs})")
print(f"N(A) dim = {n_feat - r_exact}  (null space, in R^{n_feat})")
print(f"C(A^T) dim = {r_exact}  (row space, in R^{n_feat})")
print(f"N(A^T) dim = {n_obs - r_exact}  (left null space, in R^{n_obs})")

null_vec = linalg.null_space(A)
print(f"\\nNull space vector (near [1, 1, 0, -1] up to scaling):")
print(null_vec.round(3))
print(f"A @ null_vec: {(A @ null_vec).round(6).ravel()}  (should be ~0)")

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.bar(range(1, len(s)+1), s, color=['steelblue']*r_exact + ['crimson']*(len(s)-r_exact), alpha=0.8)
ax.axhline(0.1*s.max(), color='orange', linestyle='--', lw=1.5, label='0.1×σ_max threshold')
ax.set_xlabel('Index i'); ax.set_ylabel('Singular value σᵢ')
ax.set_title('Singular values: blue=active directions, red=near-null directions')
ax.legend(); ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.show()`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Four Fundamental Subspaces — OpenMAT',
        mathBridge: 'Compute all four subspaces for a given matrix and verify orthogonality.',
        caption: 'Row space ⊥ null space in Rⁿ; column space ⊥ left null space in Rᵐ.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Four subspaces via SVD',
              prose: [
                'The SVD [U, S, V] = svd(A, \'econ\') factorizes A = U*S*V\'. The first r columns of U span C(A), the first r columns of V span C(A^T), the last n-r columns of V span N(A), and the last m-r columns of U span N(A^T). Here A is 2×3 with rank r=2, so the single last column of V is the null space basis and the left null space is empty (m-r = 0).',
                'The final check row_space\' * null_space computes all inner products between the row-space and null-space basis vectors. The result should be a matrix of near-zero values — confirming C(A^T) ⊥ N(A). A single matrix multiply verifies the fundamental orthogonality property.',
                'The SVD [U,S,V] = svd(A) partitions the $r$ active directions from the $n-r$ null directions: $V(:,1:r)$ spans the row space (large $\\sigma$), $V(:,r+1:\\text{end})$ spans the null space ($\\sigma \\approx 0$). For this 2×3 rank-2 matrix, the check `row_space\' * null_space` is a $2 \\times 1$ matrix — two inner products, both near zero. The same SVD produces all four subspaces in one call, which is why numerical code uses SVD rather than RREF for subspace computations.',
              ],
              code: `% Matrix A (2x3, rank 2)
A = [1 2 3; 4 5 6]
[m, n] = size(A)
r = rank(A)
disp(['Size: ', num2str(m), 'x', num2str(n), ', Rank: ', num2str(r)])

% SVD: A = U*S*V' gives all four subspaces
[U, S, V] = svd(A, 'econ')

% Column space C(A): first r columns of U
disp('Column space basis (first r cols of U):')
col_space = U(:, 1:r)

% Row space C(A'): first r columns of V
disp('Row space basis (first r cols of V):')
row_space = V(:, 1:r)

% Null space N(A): last n-r columns of V
disp('Null space basis (last n-r cols of V):')
null_space = V(:, r+1:end)

% Left null space N(A'): last m-r columns of U
disp('Left null space basis (last m-r cols of U):')
left_null = U(:, r+1:end)

% Verify orthogonality: row space ⊥ null space
disp('Row space · Null space (should be ~0):')
row_space' * null_space
`,
            },
            {
              id: 2,
              cellTitle: 'Solvability check via left null space',
              prose: [
                'The Fredholm check left_null\' * b1 computes the inner product of every left-null-space basis vector with b1. A result of ~0 confirms b1 ∈ C(A), so Ax=b1 is solvable. A non-zero result for b2 confirms b2 ∉ C(A). Here A = [1 2; 2 4] has rank 1, so the left null space has dimension m-r = 2-1 = 1.',
                'The rank augmentation test [rank(A), rank([A b])] is the Rouché-Capelli theorem: if rank does not increase when b is appended, b is in the column space. Both methods — Fredholm and rank augmentation — are equivalent and should always agree. Run both and compare their answers for b1 and b2.',
                'The Rouché-Capelli theorem says: $A\\mathbf{x} = \\mathbf{b}$ is solvable iff rank$(A)$ = rank$([A|\\mathbf{b}])$. When $\\mathbf{b} \\in C(A)$, appending $\\mathbf{b}$ adds no new pivot (rank stays the same). When $\\mathbf{b} \\notin C(A)$, the augmented matrix gains one more pivot and rank increases by 1. The Fredholm check `left_null\' * b` is more informative: it not only tells you THAT the system is unsolvable, but identifies the specific direction in $N(A^\\top)$ that is not orthogonal to $\\mathbf{b}$ — the obstruction that prevents solvability.',
              ],
              code: `A = [1 2 3; 4 5 6; 7 8 9]  % rank 2, 3x3
b1 = [1; 2; 3]   % test: is b1 in C(A)?
b2 = [1; 2; 4]   % test: is b2 in C(A)?

% Find basis for left null space N(A')
[U, S, ~] = svd(A)
r = rank(A)
left_null = U(:, r+1:end)
disp('Left null space basis:')
left_null

% Fredholm: Ax=b solvable iff left_null' * b = 0
disp('Fredholm check for b1 (should be 0):')
left_null' * b1

disp('Fredholm check for b2 (should be nonzero):')
left_null' * b2

% Verify directly
disp('Rank of [A b1] vs rank(A):')
[rank(A), rank([A b1])]
disp('Rank of [A b2] vs rank(A):')
[rank(A), rank([A b2])]
`,
            },
            {
              id: 3,
              cellTitle: 'Find all four subspaces by row reduction (no SVD)',
              prose: [
                'This cell computes all four subspaces using only row reduction — the method taught in the lesson. rref(A) gives the RREF; non-zero rows are the row space basis. The pivot positions identify which columns to take from original A for the column space. null(A) and null(A\') compute the null spaces numerically.',
                'The final check row_space * null_A should print ~0: a 2×1 matrix of near-zeros confirming C(A^T) ⊥ N(A). Notice that the column space basis uses the original A columns, not the RREF columns — row operations preserve row space and null space but NOT column space.',
                'The key insight: always take column space basis vectors from the ORIGINAL matrix $A$, not from the RREF $R$. Row operations change the column VECTORS but preserve the column INDICES of pivots. So from the RREF, identify WHICH columns are pivot columns (here columns 1 and 2), then grab those columns from the original $A$. The `A(:, 1:r)` line is correct here because columns 1 and 2 happen to be the pivot columns — but in general, use `rref(A, \'tol\', 1e-10)` to find pivot column indices first.',
              ],
              code: `A = [1 2 3; 4 5 6; 7 8 9];   % rank 2, 3x3
[m, n] = size(A);
r = rank(A);
fprintf('rank=%d  nullity=%d  left-null dim=%d\\n', r, n-r, m-r)

R = rref(A);
disp('RREF:'); disp(R)
disp('Row space basis (non-zero rows of RREF):')
row_space = R(1:r, :)

null_A = null(A);
disp('Null space basis N(A):'); disp(null_A)

disp('Column space basis (pivot cols of original A):')
col_space = A(:, 1:r)

null_AT = null(A');
disp('Left null space N(A^T):'); disp(null_AT)

disp('Row space · Null space (should be ~0):')
row_space * null_A
`,
            },
            {
              id: 4,
              cellTitle: 'Challenge: orthogonal decomposition of a vector',
              prose: [
                'Any vector x ∈ ℝⁿ splits uniquely as x = x_row + x_null where x_row ∈ C(A^T) and x_null ∈ N(A). The projection onto N(A) is P_null = V*V\' where V is the null space basis matrix. The row space projection is P_row = I - P_null.',
                'After running: verify that A*x_null ≈ 0 (the null component maps to zero), that x_row and x_null are orthogonal (dot product ≈ 0), and that x_row + x_null = x exactly. This is the core geometric meaning of the four fundamental subspaces — they explain the exact structure of every vector in the domain.',
                'The two projections $P_{\\text{null}} = VV^\\top$ and $P_{\\text{row}} = I - VV^\\top$ are orthogonal projectors: $P^2 = P$ (idempotent) and $P^\\top = P$ (symmetric). They sum to the identity: $P_{\\text{null}} + P_{\\text{row}} = I$. The check `A*x_null ≈ 0` confirms $\\mathbf{x}_{\\text{null}} \\in N(A)$; `dot(x_row, x_null) ≈ 0` confirms orthogonality of the row and null spaces. This orthogonal decomposition is the foundation of the pseudoinverse: $A^+ = V_r \\Sigma_r^{-1} U_r^\\top$, which inverts $A$ only on its row space component.',
              ],
              code: `A = [1 0 2; 0 1 -1];   % 2x3, rank 2
x = [3; -1; 2];          % arbitrary vector in R^3

V = null(A);             % null space basis (1 column for this A)
P_null = V * V';         % projection onto N(A)
P_row = eye(3) - P_null; % projection onto C(A^T) (row space)

x_null = P_null * x;
x_row  = P_row  * x;

fprintf('x      = [%.3f, %.3f, %.3f]\\n', x(1), x(2), x(3))
fprintf('x_row  = [%.3f, %.3f, %.3f]\\n', x_row(1), x_row(2), x_row(3))
fprintf('x_null = [%.3f, %.3f, %.3f]\\n', x_null(1), x_null(2), x_null(3))
fprintf('A*x_null (should be ~0): [%.2e, %.2e]\\n', A*x_null)
fprintf('dot(x_row, x_null) (should be ~0): %.2e\\n', dot(x_row, x_null))
fprintf('norm(x_row + x_null - x) (should be ~0): %.2e\\n', norm(x_row+x_null-x))
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Finding subspace bases systematically.** Given $A$, row reduce to RREF. (1) **Column space**: take the pivot columns of the ORIGINAL matrix $A$ (not the reduced form — reduction changes the column space). (2) **Null space**: the RREF gives $x_{\\text{free}} = $ free variables; express pivot variables in terms of free, set one free variable to 1 and others to 0 for each basis vector. (3) **Row space**: take the non-zero rows of the RREF (row reduction preserves the row space). (4) **Left null space**: row reduce $[A | I_m]$ and the rows of the right block corresponding to zero rows on the left give the left null space basis.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Big Picture Diagram',
        body: 'Every vector $\\mathbf{x} \\in \\mathbb{R}^n$ splits: $\\mathbf{x} = \\mathbf{x}_{\\text{row}} + \\mathbf{x}_{\\text{null}}$ (row space + null space component).\n\n$A$ maps: $\\mathbf{x}_{\\text{row}} \\mapsto A\\mathbf{x}_{\\text{row}} \\in C(A)$ (bijection from row space to column space), and $\\mathbf{x}_{\\text{null}} \\mapsto 0$.\n\nSo $A$ is an isomorphism from the row space to the column space — both have dimension $r$.\n\nThe "invisible" part of any input is its null space component.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Formal definitions via linear algebra.** For a linear map $T_A: \\mathbb{R}^n \\to \\mathbb{R}^m$ (i.e., multiplication by $A$), the four subspaces are: $C(A) = \\{A\\mathbf{x} : \\mathbf{x} \\in \\mathbb{R}^n\\}$ (image of $T_A$); $N(A) = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}$ (kernel of $T_A$); $C(A^\\top) = \\{A^\\top\\mathbf{y} : \\mathbf{y} \\in \\mathbb{R}^m\\}$ (image of $T_{A^\\top}$); $N(A^\\top) = \\{\\mathbf{y} : A^\\top\\mathbf{y} = \\mathbf{0}\\}$ (kernel of $T_{A^\\top}$). The Rank-Nullity Theorem applied to $T_A$ gives $\\dim N(A) + \\dim C(A) = n$; applied to $T_{A^\\top}$ gives $\\dim N(A^\\top) + \\dim C(A^\\top) = m$. Both column spaces share the same dimension $r = \\text{rank}(A) = \\text{rank}(A^\\top)$.',
      '**Proof of orthogonality: $C(A^\\top) \\perp N(A)$.** Take any vector $\\mathbf{r} \\in C(A^\\top)$ — it has the form $\\mathbf{r} = A^\\top \\mathbf{w}$ for some $\\mathbf{w}$. Take any $\\mathbf{x} \\in N(A)$, so $A\\mathbf{x} = \\mathbf{0}$. Compute their inner product: $\\langle \\mathbf{r}, \\mathbf{x} \\rangle = \\mathbf{r}^\\top \\mathbf{x} = (A^\\top \\mathbf{w})^\\top \\mathbf{x} = \\mathbf{w}^\\top (A\\mathbf{x}) = \\mathbf{w}^\\top \\mathbf{0} = 0$. This holds for every $\\mathbf{r} \\in C(A^\\top)$ and every $\\mathbf{x} \\in N(A)$ — orthogonality is exact, not approximate. The same calculation with $A$ replaced by $A^\\top$ proves $C(A) \\perp N(A^\\top)$.',
      '**The big picture: $A$ as bijection from row space to column space.** Every $\\mathbf{x} \\in \\mathbb{R}^n$ splits uniquely as $\\mathbf{x} = \\mathbf{x}_r + \\mathbf{x}_n$ (row space + null space components, by orthogonal projection). Then $A\\mathbf{x} = A\\mathbf{x}_r + A\\mathbf{x}_n = A\\mathbf{x}_r$ (since $\\mathbf{x}_n \\in N(A)$). The restriction of $A$ to the row space $C(A^\\top)$ is injective (if $A\\mathbf{x}_r = \\mathbf{0}$ and $\\mathbf{x}_r \\in C(A^\\top)$, then $\\mathbf{x}_r \\in N(A) \\cap C(A^\\top) = \\{\\mathbf{0}\\}$) and surjective onto $C(A)$ (by definition). So $A$ restricts to a bijection $C(A^\\top) \\xrightarrow{\\sim} C(A)$ — both $r$-dimensional. The null space is precisely the "wasted" part of the domain that $A$ ignores.',
      '**Fredholm alternative and infinite-dimensional generalizations.** For a Fredholm operator $T: V \\to W$ on Banach spaces, the four subspaces generalize to $\\ker T$, $\\text{im}\\, T$, $\\ker T^*$, $\\text{im}\\, T^*$. The Fredholm alternative states: either $T\\mathbf{x} = \\mathbf{f}$ has a solution, or there exists $\\mathbf{y} \\in \\ker T^*$ with $\\langle \\mathbf{y}, \\mathbf{f} \\rangle \\neq 0$ — never both. This governs the solvability of PDE: $Lu = f$ is solvable iff $f \\perp \\ker L^*$. In finite dimensions this is exactly the matrix condition $\\mathbf{b} \\perp N(A^\\top)$. The pseudoinverse $A^+$ then provides the minimum-norm solution from the row space — the unique solution that has no null space component.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Rank-Nullity in Infinite Dimensions',
        body: 'For a linear map $T: V \\to W$ with $V$ finite-dimensional:\n$\\dim V = \\dim \\ker T + \\dim \\text{im}\\, T$\n\nFor infinite-dimensional operators, this fails in general. However, for Fredholm operators:\n$\\text{ind}(T) = \\dim \\ker T - \\dim \\text{coker}\\, T$\nis finite and stable under compact perturbations.\n\nFor $A: \\mathbb{R}^n \\to \\mathbb{R}^m$: ind$(A) = n - m$ (by rank-nullity applied twice).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la2-011-1',
      title: 'All four subspaces for a 3×4 matrix',
      problem: 'Find bases for all four fundamental subspaces of $A = \\begin{pmatrix}1&2&0&1\\\\0&0&1&2\\\\1&2&1&3\\end{pmatrix}$ and verify the dimension count.',
      steps: [
        { explanation: 'Row reduce $A$: $R_3 \\leftarrow R_3 - R_1$ gives row 3 → $(0,0,1,2)$. Then $R_3 \\leftarrow R_3 - R_2$: row 3 → $(0,0,0,0)$. RREF: $\\begin{pmatrix}1&2&0&1\\\\0&0&1&2\\\\0&0&0&0\\end{pmatrix}$. Pivot columns: 1 and 3. Rank $r = 2$.' },
        { explanation: '**Column space**: pivot columns of original $A$ are columns 1 and 3: $\\{(1,0,1)^\\top, (0,1,1)^\\top\\}$. Dimension = 2.' },
        { explanation: '**Null space**: free variables $x_2, x_4$. From RREF: $x_1 = -2x_2 - x_4$, $x_3 = -2x_4$. Two basis vectors: $x_2=1, x_4=0$: $(-2,1,0,0)^\\top$; and $x_2=0, x_4=1$: $(-1,0,-2,1)^\\top$. Dimension = 2 = $4-2$ ✓.' },
        { explanation: '**Row space**: non-zero rows of RREF: $\\{(1,2,0,1), (0,0,1,2)\\}$. Dimension = 2.' },
        { explanation: '**Left null space**: dimension = $3-2=1$. The zero row in RREF came from $R_3 - R_1 - R_2 = 0$ applied to original rows. So $\\mathbf{y} = (-1, -1, 1)^\\top$ satisfies $A^\\top \\mathbf{y} = 0$. Verify: $A^\\top(-1,-1,1)^\\top = (-1+0+1, -2+0+2, 0-1+1, -1-2+3)^\\top = (0,0,0,0)^\\top$ ✓.' },
        { explanation: 'Dimension check: $2+2=4$ (row space + null space = $n=4$) ✓. $2+1=3$ (column space + left null space = $m=3$) ✓.' },
      ],
    },
    {
      id: 'ex-la2-011-2',
      title: 'Solvability via the left null space (Fredholm)',
      problem: 'For $A = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$ (rank 1), determine which right-hand sides $\\mathbf{b}$ make $A\\mathbf{x} = \\mathbf{b}$ solvable, then solve for one such $\\mathbf{b}$.',
      steps: [
        { explanation: 'Find the left null space: $A^\\top\\mathbf{y} = 0$. $A^\\top = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$. Row reduce: $\\begin{pmatrix}1&2\\\\0&0\\end{pmatrix}$. So $y_1 + 2y_2 = 0$, giving basis $\\mathbf{y} = (-2, 1)^\\top$.' },
        { explanation: 'Fredholm condition: $A\\mathbf{x} = \\mathbf{b}$ solvable iff $\\mathbf{y}^\\top\\mathbf{b} = 0$, i.e., $-2b_1 + b_2 = 0$, i.e., $b_2 = 2b_1$. So solvable iff $\\mathbf{b} = (b_1, 2b_1)^\\top$.' },
        { explanation: 'Take $\\mathbf{b} = (1, 2)^\\top$ (satisfies $b_2 = 2b_1$). Solve $A\\mathbf{x} = \\mathbf{b}$: $x_1 + 2x_2 = 1$ (one equation, since row 2 is $2\\times$ row 1). Particular solution: $x_1 = 1, x_2 = 0$. Null space: $x_1 = -2t, x_2 = t$. Complete solution: $(1-2t, t)^\\top$.' },
        { explanation: 'Geometric picture: the complete solution is a line in $\\mathbb{R}^2$. The minimum-norm solution is the point on this line closest to the origin — the component in the row space.' },
      ],
    },
    {
      id: 'ex-la2-011-3',
      title: 'Orthogonality verification',
      problem: 'For $A = \\begin{pmatrix}1&0&2\\\\0&1&-1\\end{pmatrix}$, find the null space and row space, then verify they are orthogonal complements in $\\mathbb{R}^3$.',
      steps: [
        { explanation: 'Already in RREF. Rank = 2. Pivot columns: 1 and 2. Free variable: $x_3$.' },
        { explanation: 'Null space: $x_1 = -2x_3$, $x_2 = x_3$. Basis: $(-2, 1, 1)^\\top$. Dimension = 1.' },
        { explanation: 'Row space: rows of RREF: $\\{(1,0,2), (0,1,-1)\\}$. Dimension = 2.' },
        { explanation: 'Verify orthogonality: $(1,0,2)^\\top \\cdot (-2,1,1) = -2+0+2 = 0$ ✓. $(0,1,-1)^\\top \\cdot (-2,1,1) = 0+1-1 = 0$ ✓.' },
        { explanation: 'Orthogonal complement check: $\\mathbb{R}^3 = C(A^\\top) \\oplus N(A)$. Since $2+1=3$ and they are orthogonal, they span all of $\\mathbb{R}^3$ ✓. Any vector $(a,b,c)^\\top = $ (row space part) + (null space part): row part $= (a+2c)/5\\cdot(1,0,2)+(b-c)/2\\cdot(0,1,-1)$... the dimensions confirm it works.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la2-011-1',
      title: 'Minimum-norm solution lives in the row space',
      difficulty: 'medium',
      prompt: 'For $A\\mathbf{x} = \\mathbf{b}$ with multiple solutions, prove that the unique solution in the row space $C(A^\\top)$ has minimum norm among all solutions.',
      hint: 'Write any solution as $\\mathbf{x} = \\mathbf{x}_r + \\mathbf{x}_n$ where $\\mathbf{x}_r \\in C(A^\\top)$ and $\\mathbf{x}_n \\in N(A)$, then use the Pythagorean theorem.',
      solution: 'Any solution to $A\\mathbf{x}=\\mathbf{b}$ is $\\mathbf{x} = \\mathbf{x}_r + \\mathbf{x}_n$ where $\\mathbf{x}_r \\in C(A^\\top)$ (the row space component) and $\\mathbf{x}_n \\in N(A)$ (null space component). Since $C(A^\\top) \\perp N(A)$, by Pythagoras: $\\|\\mathbf{x}\\|^2 = \\|\\mathbf{x}_r\\|^2 + \\|\\mathbf{x}_n\\|^2 \\geq \\|\\mathbf{x}_r\\|^2$. The minimum is achieved when $\\mathbf{x}_n = 0$, i.e., $\\mathbf{x} = \\mathbf{x}_r \\in C(A^\\top)$. This minimum-norm solution is unique (the row space component is unique).',
    },
    {
      id: 'ch-la2-011-2',
      title: 'All four subspaces for a rank-1 matrix',
      difficulty: 'medium',
      prompt: 'For $A = \\begin{pmatrix}1&1&1\\\\1&1&1\\\\1&1&1\\end{pmatrix}$, find all four subspaces. Then determine whether $A\\mathbf{x} = (3,3,3)^\\top$ is solvable and write the complete solution.',
      hint: 'All rows are identical — rank 1. The null space has dimension 2 (two free variables). Check solvability via the Fredholm condition $\\mathbf{b} \\perp N(A^\\top)$.',
      solution: '$C(A) = \\text{span}\\{(1,1,1)^\\top\\}$; $N(A) = \\text{span}\\{(-1,1,0)^\\top, (-1,0,1)^\\top\\}$; $C(A^\\top) = \\text{span}\\{(1,1,1)^\\top\\}$; $N(A^\\top) = \\text{span}\\{(1,-1,0)^\\top, (1,0,-1)^\\top\\}$. Solvability check: $(1,-1,0)\\cdot(3,3,3)=0$ ✓ and $(1,0,-1)\\cdot(3,3,3)=0$ ✓ — $\\mathbf{b}$ is in $C(A)$. Particular solution: $\\mathbf{x}_p = (1,1,1)^\\top$. Complete solution: $\\mathbf{x} = (1,1,1)^\\top + s(-1,1,0)^\\top + t(-1,0,1)^\\top$ for any $s,t \\in \\mathbb{R}$.',
    },
    {
      id: 'ch-la2-011-3',
      title: 'Projection matrix from the column space',
      difficulty: 'hard',
      prompt: 'Let $A = \\begin{pmatrix}1&0\\\\0&1\\\\1&1\\end{pmatrix}$ (3×2, full column rank). (a) Find the left null space $N(A^\\top)$. (b) Compute the projection matrix $P = A(A^\\top A)^{-1}A^\\top$ onto $C(A)$. (c) For $\\mathbf{b} = (1,1,1)^\\top$, verify $P\\mathbf{b} \\in C(A)$ and $\\mathbf{b} - P\\mathbf{b} \\in N(A^\\top)$.',
      hint: 'For the projection formula, compute $A^\\top A$ first (a 2×2 invertible matrix), then form $P = A(A^\\top A)^{-1}A^\\top$. Verify $P^2 = P$ (idempotent) and $P^\\top = P$ (symmetric).',
      solution: 'Left null space: solve $A^\\top\\mathbf{y}=\\mathbf{0}$; basis $(-1,-1,1)^\\top$. $A^\\top A = \\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$, $(A^\\top A)^{-1} = \\frac{1}{3}\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}$. $P = \\frac{1}{3}\\begin{pmatrix}2&-1&1\\\\-1&2&1\\\\1&1&2\\end{pmatrix}$. For $\\mathbf{b}=(1,1,1)^\\top$: $P\\mathbf{b} = (2/3, 2/3, 4/3)^\\top \\in C(A)$ ✓; $\\mathbf{b}-P\\mathbf{b} = (1/3, 1/3, -1/3)^\\top = \\frac{1}{3}(-1,-1,1)^\\top \\in N(A^\\top)$ ✓.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'C(A) \\subseteq \\mathbb{R}^m', meaning: 'Column space: all vectors $A\\mathbf{x}$ as $\\mathbf{x}$ ranges over $\\mathbb{R}^n$. Dimension $= r$. This is the set of right-hand sides $\\mathbf{b}$ for which $A\\mathbf{x}=\\mathbf{b}$ is solvable.' },
      { symbol: 'N(A) \\subseteq \\mathbb{R}^n', meaning: 'Null space: all $\\mathbf{x}$ with $A\\mathbf{x}=\\mathbf{0}$. Dimension $= n-r$. Encodes non-uniqueness: $\\mathbf{x}_p + \\mathbf{n}$ is also a solution for any $\\mathbf{n} \\in N(A)$.' },
      { symbol: 'C(A^\\top) \\subseteq \\mathbb{R}^n', meaning: 'Row space: span of the rows of $A$. Dimension $= r$. Orthogonal complement of $N(A)$ in $\\mathbb{R}^n$. The minimum-norm solution lives here.' },
      { symbol: 'N(A^\\top) \\subseteq \\mathbb{R}^m', meaning: 'Left null space: all $\\mathbf{y}$ with $A^\\top\\mathbf{y}=\\mathbf{0}$. Dimension $= m-r$. Solvability condition: $\\mathbf{b} \\perp N(A^\\top)$.' },
      { symbol: '\\dim C(A^\\top) + \\dim N(A) = n', meaning: 'Rank-nullity in $\\mathbb{R}^n$: row space and null space are orthogonal complements. Similarly $\\dim C(A) + \\dim N(A^\\top) = m$ in $\\mathbb{R}^m$.' },
    ],
    rulesOfThumb: [
      'Column space and left null space both live in $\\mathbb{R}^m$; row space and null space both live in $\\mathbb{R}^n$.',
      'All four dimensions are determined by just two numbers: rank $r$ and matrix shape $m \\times n$.',
      'Column space basis: pivot columns of the ORIGINAL $A$. Row space basis: nonzero rows of RREF.',
      'Solvability check: $A\\mathbf{x}=\\mathbf{b}$ is solvable iff $\\mathbf{b} \\perp N(A^\\top)$ — test against every left-null-space basis vector.',
      'Minimum-norm solution: the unique solution in $C(A^\\top)$. Adding any null vector increases $\\|\\mathbf{x}\\|$ by the Pythagorean theorem.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la2-003', label: 'Null Space and Column Space', note: 'The null space $N(A)$ and column space $C(A)$ were introduced in la2-003. This lesson adds the row space and left null space, completing the full four-subspace picture and the orthogonality relationships.' },
      { lessonId: 'la2-010', label: 'Invertible Matrix Theorem', note: 'The IMT says $A$ is invertible iff all four subspaces degenerate: $N(A)=N(A^\\top)=\\{\\mathbf{0}\\}$ and $C(A)=\\mathbb{R}^m$, $C(A^\\top)=\\mathbb{R}^n$. The four subspaces unify and generalize the IMT to non-square matrices.' },
    ],
    futureLinks: [
      { lessonId: 'la4-003', label: 'Least Squares and Projections', note: 'Least squares replaces $A\\mathbf{x}=\\mathbf{b}$ (unsolvable) with the projection $P\\mathbf{b}$ of $\\mathbf{b}$ onto $C(A)$. The residual $\\mathbf{b}-P\\mathbf{b}$ lies in $N(A^\\top)$. This is the orthogonality $C(A) \\perp N(A^\\top)$ applied to optimization.' },
      { lessonId: 'la9-001', label: 'Singular Value Decomposition', note: 'The SVD $A = U\\Sigma V^\\top$ provides orthonormal bases for all four subspaces simultaneously: first $r$ columns of $U$ span $C(A)$; last $m-r$ span $N(A^\\top)$; first $r$ columns of $V$ span $C(A^\\top)$; last $n-r$ span $N(A)$.' },
    ],
  },

  mentalModel: [
    'Four subspaces: $C(A)$ in $\\mathbb{R}^m$, $N(A)$ in $\\mathbb{R}^n$, $C(A^\\top)$ in $\\mathbb{R}^n$, $N(A^\\top)$ in $\\mathbb{R}^m$.',
    'Dimensions: $r, n-r, r, m-r$ where $r = $ rank$(A)$.',
    'Orthogonal pairs: $C(A^\\top) \\perp N(A)$ in $\\mathbb{R}^n$; $C(A) \\perp N(A^\\top)$ in $\\mathbb{R}^m$.',
    'Solvability: $A\\mathbf{x}=\\mathbf{b}$ solvable iff $\\mathbf{b} \\perp N(A^\\top)$.',
    'Minimum-norm solution: the unique solution in the row space $C(A^\\top)$.',
  ],

  checkpoints: [
    { id: 'cp-la2-011-1', label: 'Read the four subspaces from the concrete 2×3 example', type: 'read' },
    { id: 'cp-la2-011-2', label: 'Read the rank-nullity theorem and orthogonality pairs', type: 'read' },
    { id: 'cp-la2-011-3', label: 'Read the solvability condition via the left null space', type: 'read' },
    { id: 'cp-la2-011-4', label: 'Extract all four subspaces via SVD in the notebook', type: 'lab' },
    { id: 'cp-la2-011-5', label: 'Test solvability using the Fredholm alternative in the notebook', type: 'lab' },
    { id: 'cp-la2-011-6', label: 'Trace the 3×4 matrix four-subspace example', type: 'example' },
    { id: 'cp-la2-011-7', label: 'Trace the Fredholm solvability and orthogonality example', type: 'example' },
    { id: 'cp-la2-011-8', label: 'Prove the minimum-norm solution lives in the row space', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'la2-011-assess-1',
        type: 'choice',
        text: 'For an $m \\times n$ matrix with rank $r$, what is $\\dim N(A)$?',
        options: ['$n - r$', '$m - r$', '$r$', '$m + n - r$'],
        answer: '$n - r$',
        hints: ['Rank-Nullity: rank + nullity = $n$ (number of columns). Null space lives in input space $\\mathbb{R}^n$, so nullity $= n - r$.'],
      },
      {
        id: 'la2-011-assess-2',
        type: 'choice',
        text: 'The row space $C(A^\\top)$ and null space $N(A)$ are related how?',
        options: [
          'They are orthogonal complements in $\\mathbb{R}^n$',
          'They are orthogonal complements in $\\mathbb{R}^m$',
          'They are equal when $A$ is square',
          'They have no systematic relationship',
        ],
        answer: 'They are orthogonal complements in $\\mathbb{R}^n$',
        hints: ['Fundamental Theorem: $C(A^\\top) \\perp N(A)$ and together they span $\\mathbb{R}^n$. Any $\\mathbf{x} \\in \\mathbb{R}^n$ splits uniquely as $\\mathbf{x}_{\\text{row}} + \\mathbf{x}_{\\text{null}}$.'],
      },
      {
        id: 'la2-011-assess-3',
        type: 'choice',
        text: 'For a $5 \\times 7$ matrix with rank 3, what is $\\dim N(A^\\top)$ (the left null space)?',
        options: ['$2$', '$4$', '$3$', '$5$'],
        answer: '$2$',
        hints: ['Left null space dimension $= m - r = 5 - 3 = 2$. It lives in $\\mathbb{R}^m$ (output space) and is the orthogonal complement of $C(A)$.'],
      },
      {
        id: 'la2-011-assess-4',
        type: 'choice',
        text: '$A\\mathbf{x} = \\mathbf{b}$ is consistent. What does the Fundamental Theorem say $\\mathbf{b}$ must satisfy?',
        options: [
          '$\\mathbf{b} \\perp N(A^\\top)$ — $\\mathbf{b}$ is orthogonal to the left null space',
          '$\\mathbf{b} \\perp N(A)$ — $\\mathbf{b}$ is orthogonal to the null space',
          '$\\mathbf{b}$ must be in $N(A)$',
          '$\\mathbf{b}$ must be in $\\mathbb{R}^n$',
        ],
        answer: '$\\mathbf{b} \\perp N(A^\\top)$ — $\\mathbf{b}$ is orthogonal to the left null space',
        hints: ['$\\mathbf{b} \\in C(A)$ iff $\\mathbf{b} \\perp N(A^\\top)$ (Fredholm alternative). The column space and left null space are orthogonal complements in $\\mathbb{R}^m$.'],
      },
    ],
  },

  quiz: [
    {
      id: 'q-la2-011-1',
      type: 'choice',
      text: 'For an $m \\times n$ matrix with rank $r$, what is $\\dim N(A)$?',
      options: ['$r$', '$m - r$', '$n - r$', '$m + n - r$'],
      answer: '$n - r$',
      hints: ['The null space lives in $\\mathbb{R}^n$ (the domain).', 'Rank-nullity: rank + nullity = number of columns = $n$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-2',
      type: 'choice',
      text: 'For a $5 \\times 7$ matrix with rank 3, what is $\\dim N(A^\\top)$?',
      options: ['$3$', '$4$', '$2$', '$5$'],
      answer: '$2$',
      hints: ['Left null space dimension = $m - r$.', '$5 - 3 = 2$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-3',
      type: 'choice',
      text: 'The row space $C(A^\\top)$ and null space $N(A)$ are:',
      options: ['Parallel subspaces in $\\mathbb{R}^n$', 'Orthogonal complements in $\\mathbb{R}^n$', 'Equal when $A$ is symmetric', 'Orthogonal complements in $\\mathbb{R}^m$'],
      answer: 'Orthogonal complements in $\\mathbb{R}^n$',
      hints: ['Both live in $\\mathbb{R}^n$ (the domain of $A$).', 'Their dimensions add up to $n$, and they are perpendicular.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-4',
      type: 'choice',
      text: '$A\\mathbf{x} = \\mathbf{b}$ has a solution if and only if $\\mathbf{b}$ is:',
      options: ['In the null space of $A$', 'Perpendicular to the row space', 'In the column space of $A$', 'A unit vector'],
      answer: 'In the column space of $A$',
      hints: ['$C(A)$ = all possible outputs $A\\mathbf{x}$.', 'If $\\mathbf{b} \\in C(A)$, some $\\mathbf{x}$ produces it.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-5',
      type: 'choice',
      text: 'For $A = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$ (rank 1), the left null space $N(A^\\top)$ has basis:',
      options: ['$(1,0)^\\top$', '$(2,1)^\\top$', '$(-2,1)^\\top$', '$(0,0)^\\top$'],
      answer: '$(-2,1)^\\top$',
      hints: ['Left null space: solve $A^\\top \\mathbf{y} = 0$.', '$A^\\top = A$ here (symmetric). Row reduce: $y_1 + 2y_2 = 0$, so $\\mathbf{y} = (-2,1)^\\top$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la2-011-6',
      type: 'choice',
      text: 'For $A = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$, which $\\mathbf{b}$ makes $A\\mathbf{x}=\\mathbf{b}$ solvable?',
      options: ['$(1,3)^\\top$', '$(1,2)^\\top$', '$(2,3)^\\top$', '$(0,1)^\\top$'],
      answer: '$(1,2)^\\top$',
      hints: ['Solvable iff $\\mathbf{b} \\perp N(A^\\top) = \\text{span}\\{(-2,1)^\\top\\}$.', '$(-2)(1) + (1)(b_2) = 0 \\Rightarrow b_2 = 2b_1$. Which option satisfies $b_2 = 2b_1$?'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la2-011-7',
      type: 'choice',
      text: 'A basis for the column space is found from:',
      options: ['Non-zero rows of RREF', 'Pivot columns of the ORIGINAL matrix $A$', 'Pivot columns of the RREF', 'The null space vectors'],
      answer: 'Pivot columns of the ORIGINAL matrix $A$',
      hints: ['Row operations change the column space — use original columns.', 'The pivot positions identify WHICH columns span $C(A)$, but you take them from $A$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la2-011-8',
      type: 'choice',
      text: 'The minimum-norm solution to $A\\mathbf{x}=\\mathbf{b}$ (when solutions exist) lies in:',
      options: ['The null space $N(A)$', 'The column space $C(A)$', 'The row space $C(A^\\top)$', 'The left null space $N(A^\\top)$'],
      answer: 'The row space $C(A^\\top)$',
      hints: ['Any solution = row space part + null space part.', 'Adding a null space component increases norm. Minimum norm means no null space component.'],
      reviewSection: 'challenges',
    },
    {
      id: 'q-la2-011-9',
      type: 'choice',
      text: 'For a $3 \\times 3$ invertible matrix $A$, what are the dimensions of all four subspaces?',
      options: ['$3, 0, 3, 0$', '$3, 3, 3, 3$', '$2, 1, 2, 1$', '$3, 1, 3, 1$'],
      answer: '$3, 0, 3, 0$',
      hints: ['Invertible means rank = $n = m = 3$.', '$\\dim C(A)=3, \\dim N(A)=0, \\dim C(A^\\top)=3, \\dim N(A^\\top)=0$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-10',
      type: 'choice',
      text: 'The row space and null space are orthogonal because:',
      options: [
        'For any $A^\\top\\mathbf{w}$ and $\\mathbf{x}$ with $A\\mathbf{x}=0$: $\\langle A^\\top\\mathbf{w}, \\mathbf{x}\\rangle = \\mathbf{w}^\\top(A\\mathbf{x}) = 0$',
        'Rows of $A$ are always perpendicular by definition',
        'The RREF has orthogonal rows',
        'They live in different spaces',
      ],
      answer: 'For any $A^\\top\\mathbf{w}$ and $\\mathbf{x}$ with $A\\mathbf{x}=0$: $\\langle A^\\top\\mathbf{w}, \\mathbf{x}\\rangle = \\mathbf{w}^\\top(A\\mathbf{x}) = 0$',
      hints: ['Row space = column space of $A^\\top$, spanned by vectors $A^\\top w$.', 'Inner product of row space vector with null space vector: $\\langle A^\\top w, x\\rangle = w^\\top Ax = w^\\top 0 = 0$.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'For any given matrix, find bases for all four fundamental subspaces by row reducing; verify dimensions using rank-nullity; check solvability of $A\\mathbf{x}=\\mathbf{b}$ using the Fredholm condition.',
    explainVerbally: 'Explain how $\\mathbb{R}^n$ splits into row space and null space (orthogonal complements), and why the minimum-norm solution to $A\\mathbf{x}=\\mathbf{b}$ is the component of any solution in the row space.',
    detectIncorrectApplication: 'Catch the error of taking pivot columns from the RREF (not the original matrix) for the column space basis, or confusing null space $N(A)$ with left null space $N(A^\\top)$.',
    transferToUnfamiliar: 'Apply the Fredholm alternative to determine solvability: if someone gives you $A\\mathbf{x}=\\mathbf{b}$ with no obvious solution, find the left null space and check if $\\mathbf{y}^\\top\\mathbf{b}=0$ for all $\\mathbf{y} \\in N(A^\\top)$.',
  },

  misconceptions: [
    {
      falseBelief: 'The column space basis comes from the pivot columns of the RREF.',
      whyStudentsThinkIt: 'Row reduction produces a clean RREF, and students naturally use those columns for the column space. But row operations change column relationships — only row operations preserve the null space and row space.',
      correctionExample: 'For $A = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$, RREF is $\\begin{pmatrix}1&2\\\\0&0\\end{pmatrix}$. Pivot column 1 in RREF is $(1,0)^\\top$, but the actual column space basis is column 1 of $A$: $(1,2)^\\top$. These are different!',
      contrastCase: 'The pivot POSITIONS (which column indices) are the same in $A$ and its RREF. But you must go back to $A$ to get the actual basis vectors for $C(A)$. Row space and null space use the RREF directly.',
    },
    {
      falseBelief: 'The null space and column space are orthogonal.',
      whyStudentsThinkIt: 'Students hear "the four subspaces come in orthogonal pairs" and incorrectly pair $N(A)$ with $C(A)$ instead of $C(A^\\top)$.',
      correctionExample: 'For $A = \\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$: $C(A) = \\text{span}\\{(1,0)^\\top\\}$ and $N(A) = \\text{span}\\{(0,1)^\\top\\}$. These ARE orthogonal here, but only by coincidence (the standard basis is orthogonal). In general, $N(A) \\not\\perp C(A)$.',
      contrastCase: 'The correct orthogonal pairs are: $C(A^\\top) \\perp N(A)$ (both in $\\mathbb{R}^n$) and $C(A) \\perp N(A^\\top)$ (both in $\\mathbb{R}^m$). Remember: orthogonality requires the vectors to live in the same space.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A compressed sensing problem gives you $m$ measurements of an $n$-dimensional signal ($m < n$). The system $A\\mathbf{x}=\\mathbf{b}$ is underdetermined. How do the four fundamental subspaces tell you about recoverability?',
      competingTechniques: 'Try to solve by least squares (gives a particular solution) vs. analyze the null space: signals in $N(A)$ are completely invisible to the measurements',
      whyThisTechniqueWins: 'The null space $N(A)$ has dimension $n-m$ — a large family of signals that produce zero measurements. Any solution $\\mathbf{x}_0$ could actually be $\\mathbf{x}_0 +$ (any null space vector). Recovery requires additional assumptions (like sparsity) to identify which element of the null space coset is the true signal.',
    },
    {
      situation: 'In a linear regression model $X\\boldsymbol{\\beta} = \\mathbf{y}$ (overdetermined, $m > n$), the system usually has no exact solution. How do the four subspaces describe what the model can and cannot fit?',
      competingTechniques: 'Just minimize $\\|X\\boldsymbol{\\beta}-\\mathbf{y}\\|^2$ (least squares) vs. decompose $\\mathbf{y} = \\mathbf{y}_{\\text{col}} + \\mathbf{y}_{\\text{left null}}$ and recognize only $\\mathbf{y}_{\\text{col}}$ is fittable',
      whyThisTechniqueWins: 'The component of $\\mathbf{y}$ in $C(X)$ is what the model CAN fit exactly; the component in $N(X^\\top)$ (left null space) is the irreducible residual. Least squares gives the best possible $\\hat{\\mathbf{y}} = P_{C(X)}\\mathbf{y}$ — the projection onto the column space.',
    },
  ],

  debugging: [
    {
      commonError: 'Applying the Fredholm alternative incorrectly — checking null space of $A$ instead of $A^\\top$.',
      symptom: 'Student checks if $\\mathbf{b} \\perp N(A)$ for solvability, but $N(A)$ lives in the domain, not the codomain.',
      whyItHappened: 'Confusion between $N(A)$ (vectors $\\mathbf{x}$ with $A\\mathbf{x}=0$) and $N(A^\\top)$ (vectors $\\mathbf{y}$ with $A^\\top\\mathbf{y}=0$). Both are called "null spaces" and students mix them up.',
      repairStrategy: 'Solvability of $A\\mathbf{x}=\\mathbf{b}$: check $\\mathbf{b}$ against $N(A^\\top)$ (left null space, in $\\mathbb{R}^m$). Mnemonic: "$\\mathbf{b}$ lives in $\\mathbb{R}^m$, so the check must also be in $\\mathbb{R}^m$. Left null space is also in $\\mathbb{R}^m$."',
    },
    {
      commonError: 'Forgetting that the column space basis uses ORIGINAL matrix columns, not RREF columns.',
      symptom: 'Student row reduces to RREF, identifies pivot column positions (e.g., columns 1 and 3), then uses the pivot columns from the RREF as the column space basis.',
      whyItHappened: 'The RREF is the cleanest form of the matrix, and students naturally read off everything from it. But row operations change what column vectors look like.',
      repairStrategy: 'After identifying pivot column INDICES from the RREF (say, columns 1 and 3), go back to the ORIGINAL matrix and take those columns. For the null space, row space, and left null space, you can use the RREF directly.',
    },
  ],
};
