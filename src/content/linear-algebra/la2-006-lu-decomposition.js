export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-006',
  slug: 'lu-decomposition',
  chapter: 'la2',
  order: 6,
  title: 'LU Decomposition',
  subtitle: 'Factoring a matrix into a lower and upper triangle — so Gaussian elimination runs once and solves unlimited systems.',
  tags: ['LU decomposition', 'LU factorization', 'forward substitution', 'back substitution', 'partial pivoting', 'PA=LU', 'Gaussian elimination'],
  aliases: 'LU factorization lower upper triangular forward back substitution partial pivoting PA=LU Gaussian elimination matrix factorization',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 35,
  coreConcept: 'LU decomposition factors A into A = LU (lower × upper triangular). The elimination work happens once. Then solving Ax = b for any number of different b vectors costs only O(n²) per solve instead of O(n³). It also computes det(A) as a free byproduct.',
  prerequisites: ['la2-005'],
  nextLesson: 'eigenvectors-and-eigenvalues',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "You need to solve 1,000 different systems of equations — all with the same matrix A but different right-hand sides. Must you run Gaussian elimination 1,000 times?",
    realWorldContext: "Every structural engineering simulation solves the same stiffness matrix $K$ (representing the physical structure) with thousands of different load vectors $\\mathbf{f}$ (different stress scenarios). The matrix does not change — only the forces do. Running full Gaussian elimination every time would be catastrophically slow. LU decomposition is the solution: factor $A$ once in $O(n^3)$ time, then solve each new system in $O(n^2)$ time by simple forward and backward substitution. This one-time factorization / many-time solve pattern appears everywhere: finite element analysis, neural network training, circuit simulation, and computer graphics.",
    previewVisualizationId: 'GaussianEliminationStepper',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      'Gaussian-eliminate $A = \\begin{bmatrix}2&1\\\\4&3\\end{bmatrix}$: $R_2 \\to R_2 - 2R_1$ gives $U = \\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}$. The multiplier used was $m_{21} = 4/2 = 2$. Store it below the diagonal: $L = \\begin{bmatrix}1&0\\\\2&1\\end{bmatrix}$. Verify: $LU = \\begin{bmatrix}1&0\\\\2&1\\end{bmatrix}\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix} = \\begin{bmatrix}2&1\\\\4+0&2+1\\end{bmatrix} = \\begin{bmatrix}2&1\\\\4&3\\end{bmatrix} = A$. The elimination multipliers ARE the entries of $L$. This is LU decomposition — you get it for free while running Gaussian elimination.',
      '**The core observation:** When you perform Gaussian elimination on $A$, you subtract multiples of rows from each other to create zeros below the diagonal. Each multiplier you use — the number you multiply the pivot row by before subtracting — gets recorded into a matrix called $L$ (Lower). The resulting upper triangular matrix is $U$ (Upper). Together, $A = L \\cdot U$.',
      'Concretely: if you eliminate column 1 of $A$ by subtracting $m_{21}$ times row 1 from row 2, and $m_{31}$ times row 1 from row 3, those multipliers $m_{21}$ and $m_{31}$ go directly into $L$ at positions $(2,1)$ and $(3,1)$. The $L$ matrix has 1s on its diagonal and the elimination multipliers below the diagonal.',
      '**Why this is useful: the two-phase solve**',
      'Once you have $A = LU$, solving $A\\mathbf{x} = \\mathbf{b}$ splits into two easy steps:',
      '1. **Forward substitution**: Solve $L\\mathbf{y} = \\mathbf{b}$ for $\\mathbf{y}$. Because $L$ is lower triangular, $y_1$ is immediate, then $y_2$, then $y_3$ — each using only previously computed values.',
      '2. **Back substitution**: Solve $U\\mathbf{x} = \\mathbf{y}$ for $\\mathbf{x}$. Because $U$ is upper triangular, $x_n$ is immediate, then $x_{n-1}$, working backwards.',
      'Each substitution phase is $O(n^2)$ operations. The factorization $A = LU$ costs $O(n^3)$ once. For 1,000 different right-hand sides, you pay $O(n^3)$ once instead of $O(n^3)$ a thousand times.',
      '**The problem with zero pivots: Partial Pivoting**',
      'LU decomposition fails if a pivot (diagonal entry during elimination) is zero — you cannot divide by zero. It also fails numerically if a pivot is very small — dividing by a near-zero number amplifies rounding errors. The fix is **partial pivoting**: before each elimination step, swap rows to bring the largest entry in the current column to the pivot position. This introduces a permutation matrix $P$ (recording the swaps), giving the formula $PA = LU$ instead of $A = LU$.',
      'A **permutation matrix** $P$ is a matrix with exactly one 1 in each row and column and 0s everywhere else. Multiplying $PA$ reorders the rows of $A$ according to the swaps made.',
      '**Determinant as a byproduct**',
      'Once you have $PA = LU$, the determinant is immediate: $\\det(A) = \\det(P^{-1}) \\cdot \\det(U)$. Since $L$ has 1s on its diagonal, $\\det(L) = 1$. Since $P$ is a permutation, $\\det(P^{-1}) = \\pm 1$ (depending on the number of row swaps). And $\\det(U)$ is just the product of $U$\'s diagonal entries. This is exactly why NumPy computes determinants via LU — never via cofactor expansion.',
      '**Predict before reading on.** If you use LU decomposition to factor $A$ once ($O(n^3)$ cost), then solve $A\\mathbf{x} = \\mathbf{b}$ for 100 different right-hand sides: how many total $O(n^2)$ solves do you perform? What is the total cost vs. factoring fresh each time? Write your estimate, then check the Computational Complexity callout.',
      '**Where this is heading:** LU decomposition is foundational for numerical linear algebra. The QR decomposition (used in eigenvalue algorithms and least squares) and the SVD (the ultimate factorization) both rely on the same factorization-then-solve pattern.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 6 of 12 — Matrices & Transformations',
        body: '**Previous:** Determinants — general computation and properties.\n**This lesson:** LU decomposition — Gaussian elimination packaged as a product of two triangular matrices.\n**Next (Chapter 3):** Eigenvalues and Eigenvectors — the invariant directions of a transformation.',
      },
      {
        type: 'insight',
        title: 'What L and U Look Like',
        body: 'For any $n \\times n$ matrix $A$:\n\n$L = \\begin{bmatrix} 1 & 0 & 0 \\\\ m_{21} & 1 & 0 \\\\ m_{31} & m_{32} & 1 \\end{bmatrix} \\quad U = \\begin{bmatrix} u_{11} & u_{12} & u_{13} \\\\ 0 & u_{22} & u_{23} \\\\ 0 & 0 & u_{33} \\end{bmatrix}$\n\n$L$ has 1s on the diagonal and the Gaussian elimination multipliers below. $U$ is exactly the result of Gaussian elimination (upper triangular form). Neither has to be symmetric or square — but both are always triangular.',
      },
      {
        type: 'insight',
        title: 'Permutation Matrix — Definition',
        body: 'A **permutation matrix** $P$ is an $n \\times n$ matrix with exactly one 1 in each row and column (and 0s everywhere else). $PA$ reorders the rows of $A$ according to those positions. $P^{-1} = P^T$ (permutation matrices are orthogonal). $\\det(P) = \\pm 1$.',
      },
      {
        type: 'warning',
        title: 'Career Signal — LU Decomposition',
        body: 'LU decomposition is the backbone of scipy.linalg.solve, MATLAB\'s backslash operator, and virtually every scientific computing library. Interview questions include: "How does np.linalg.solve work internally?" (LU with pivoting), "When would you use np.linalg.inv vs np.linalg.solve?" (never invert — always solve), and "What is O(n³) vs O(n²) and why does it matter?" Knowing these separates someone who has used a library from someone who understands it.',
      },
    ],
    visualizations: [
      {
        id: 'GaussianEliminationStepper',
        title: 'Gaussian Elimination — Tracking the Multipliers',
        mathBridge: 'Watch each elimination step. Every time a multiple of one row is subtracted from another, the multiplier used is the exact number that gets placed into matrix L. After all eliminations, the matrix that remains is U. Step through the full process and observe how L accumulates the multipliers bottom-up while U is built top-down.',
        caption: 'LU decomposition is Gaussian elimination with the multipliers stored.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      '**LU Decomposition — Formal Definition**',
      'Given an $n \\times n$ matrix $A$, the LU decomposition (without pivoting) finds matrices $L$ and $U$ such that:\n\n$A = LU$\n\nwhere $L$ is **lower triangular** with 1s on the diagonal (called a unit lower triangular matrix) and $U$ is **upper triangular**.',
      '**The Algorithm: Gaussian Elimination with Multiplier Recording**',
      'For each column $k = 1, \\ldots, n-1$:\n\nFor each row $i = k+1, \\ldots, n$:\n\n$m_{ik} = a_{ik} / a_{kk}$ ← the elimination multiplier for position $(i,k)$\n\n$R_i \\leftarrow R_i - m_{ik} R_k$ ← standard row replacement\n\nAfter all eliminations: $L_{ij} = m_{ij}$ for $i > j$, $L_{ii} = 1$, $U$ = result of elimination.',
      '**Solving $A\\mathbf{x} = \\mathbf{b}$ via LU**',
      'Substitute $A = LU$:\n\n$LU\\mathbf{x} = \\mathbf{b}$\n\nLet $\\mathbf{y} = U\\mathbf{x}$. Solve in two phases:',
      '**Phase 1 — Forward substitution** (solve $L\\mathbf{y} = \\mathbf{b}$):\n\n$y_1 = b_1$\n\n$y_i = b_i - \\sum_{j=1}^{i-1} L_{ij} y_j \\quad (i = 2, \\ldots, n)$',
      '**Phase 2 — Back substitution** (solve $U\\mathbf{x} = \\mathbf{y}$):\n\n$x_n = y_n / U_{nn}$\n\n$x_i = \\left(y_i - \\sum_{j=i+1}^{n} U_{ij} x_j\\right) / U_{ii} \\quad (i = n-1, \\ldots, 1)$',
      '**With Partial Pivoting: $PA = LU$**',
      'Before eliminating column $k$, find the row $i \\geq k$ with the largest $|a_{ik}|$ (the "partial pivot") and swap it to position $k$. The permutation matrix $P$ records all these swaps. The factored form is:\n\n$PA = LU$\n\nTo solve $A\\mathbf{x} = \\mathbf{b}$: first apply $P$ to $\\mathbf{b}$ (reorder it), then forward substitute, then back substitute.',
      '**Determinant from LU**',
      '$\\det(A) = \\det(P^{-1}) \\cdot \\det(L) \\cdot \\det(U) = (\\pm 1) \\cdot 1 \\cdot (U_{11} \\cdot U_{22} \\cdots U_{nn})$\n\nThe sign is $(-1)^s$ where $s$ is the number of row swaps in $P$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'LU Decomposition Existence',
        body: 'If all leading submatrices of $A$ are invertible (all pivots are non-zero with no pivoting), then $A = LU$ exists and is unique. With partial pivoting, every non-singular $A$ has a factorization $PA = LU$.',
      },
      {
        type: 'theorem',
        title: 'Computational Complexity',
        body: 'LU factorization: $O(n^3)$ — performed once.\nForward substitution: $O(n^2)$ — per right-hand side.\nBack substitution: $O(n^2)$ — per right-hand side.\n\nFor $k$ different right-hand sides:\n• Naïve (re-run elimination each time): $O(kn^3)$\n• LU factorization: $O(n^3 + kn^2)$ — far cheaper when $k$ is large.',
      },
      {
        type: 'strategy',
        title: 'Never Compute A⁻¹ Just to Solve Ax = b',
        body: 'Computing $A^{-1}$ requires $O(n^3)$ work AND introduces numerical errors. Then multiplying $A^{-1}\\mathbf{b}$ adds another $O(n^2)$. Solving via LU is the same cost but more numerically stable. In NumPy: always use `np.linalg.solve(A, b)`, never `np.linalg.inv(A) @ b`.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: LU Decomposition',
        mathBridge: 'MATLAB: `[L, U, P] = lu(A)` returns the LU factorization with partial pivoting such that `P*A = L*U`. `A \\ b` uses LU internally. `lu_factor` then `lu_solve` lets you re-use the factorization for multiple right-hand sides.',
        caption: 'Three cells: manual LU, solving multiple systems, and CNC finite-element load analysis.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'LU decomposition in MATLAB — [L, U, P] = lu(A)',
              prose: [
                '`[L, U, P] = lu(A)` gives the factorization with pivoting: P*A = L*U.',
                'L is unit lower triangular (1s on diagonal). U is upper triangular. P is a permutation matrix.',
              ],
              code: `A = [2 1 1; 4 3 3; 8 7 9];

[L, U, P] = lu(A);
fprintf('L = \\n'); disp(L)
fprintf('U = \\n'); disp(U)
fprintf('P = \\n'); disp(P)

% Verify: P*A = L*U
fprintf('P*A - L*U = (should be zeros)\\n'); disp(P*A - L*U)

% Determinant from U's diagonal (times det(P))
det_from_U = prod(diag(U)) * det(P);
fprintf('det(A) from U diagonal = %g\\n', det_from_U)
fprintf('det(A) from MATLAB     = %g\\n', det(A))`,
            },
            {
              id: 2,
              cellTitle: 'Solving multiple systems with the same A — one factorization',
              prose: [
                'Factor A once, then solve Ax = b for multiple right-hand sides using forward/back substitution.',
                'In MATLAB: L \\ b is forward substitution; U \\ y is back substitution. Each is O(n²).',
              ],
              code: `A = [2 1 1; 4 3 3; 8 7 9];
[L, U, P] = lu(A);

% Solve for two different right-hand sides
b1 = [4; 10; 20];
b2 = [1; 0; 3];

% For each b: forward substitution (Ly = Pb), then back (Ux = y)
solve_LU = @(b) U \ (L \ (P * b));  % = A \ b

x1 = solve_LU(b1);
x2 = solve_LU(b2);

fprintf('x1 (for b1): [%g; %g; %g]\\n', x1(1), x1(2), x1(3))
fprintf('Verify A*x1 = b1: %d\\n', norm(A*x1 - b1) < 1e-10)

fprintf('x2 (for b2): [%g; %g; %g]\\n', x2(1), x2(2), x2(3))
fprintf('Verify A*x2 = b2: %d\\n', norm(A*x2 - b2) < 1e-10)`,
            },
            {
              id: 3,
              cellTitle: 'Application: CNC structural analysis — one stiffness matrix, many load cases',
              prose: [
                'A CNC machine\'s structural frame is modeled as a finite element stiffness matrix K. Engineers test many load scenarios (different cutting forces, different tool positions) — all use the same K but different force vectors.',
                'LU-factoring K once lets you solve all scenarios with O(n²) each. This is the standard in structural FEM.',
              ],
              code: `% Simplified 4×4 FEM stiffness matrix (symmetric positive definite)
% Represents spring-connected nodes in a CNC gantry frame
K = [4 -1  0 -1;
    -1  4 -1  0;
     0 -1  4 -1;
    -1  0 -1  4];

% Factor K once
[L, U, P] = lu(K);
fprintf('Stiffness matrix K factored (one-time cost O(n^3))\\n')
fprintf('Condition number: %.2f\\n', cond(K))

% Three load cases: light cut, heavy cut, rapid traverse
F_light  = [10; 0; 5; 0];   % N, light cutting forces
F_heavy  = [50; 20; 40; 10]; % N, heavy milling
F_rapid  = [0; 0; 0; 0];    % no forces during rapid

solve_K = @(F) U \\ (L \\ (P * F));

disp_light = solve_K(F_light);
disp_heavy = solve_K(F_heavy);
disp_rapid = solve_K(F_rapid);

fprintf('\\nMax deflection (light cut): %.4f mm\\n', max(abs(disp_light)))
fprintf('Max deflection (heavy cut): %.4f mm\\n', max(abs(disp_heavy)))
fprintf('Max deflection (rapid):     %.4f mm\\n', max(abs(disp_rapid)))`,
            },
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: LU Decomposition',
        mathBridge: 'scipy.linalg.lu(A) returns (P, L, U) such that A = P @ L @ U. np.linalg.solve(A, b) uses LU internally. The cells below: (1) manually compute LU for a 3×3, (2) verify via scipy, (3) solve two systems by forward/back substitution, (4) compute determinant from U.',
        caption: 'Build intuition for LU by computing it step by step, then verify with scipy.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Manual LU decomposition of a 3×3 matrix',
              prose: [
                'We trace Gaussian elimination on A = [[2,1,1],[4,3,3],[8,7,9]] step by step, recording the multipliers into L.',
                'Step 1: eliminate column 1. Multipliers: m21 = 4/2 = 2, m31 = 8/2 = 4. These go into L[1,0] and L[2,0].',
                'Step 2: eliminate column 2. Multiplier: m32 = 3/1 = 3. This goes into L[2,1].',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import linalg

A = np.array([[2., 1., 1.], [4., 3., 3.], [8., 7., 9.]])
P, L, U = linalg.lu(A)
print("L ="); print(L.round(4))
print("U ="); print(U.round(4))
print("P@A = L@U?", np.allclose(P @ A, L @ U))

fig, axes = plt.subplots(1, 3, figsize=(11, 3.5))
for ax, M, title in zip(axes, [L, U, L@U], ['L (lower tri)', 'U (upper tri)', 'L @ U = P@A']):
    ax.imshow(M, cmap='RdBu_r', aspect='equal', vmin=-10, vmax=10)
    ax.set_title(title, fontsize=12)
    for i in range(M.shape[0]):
        for j in range(M.shape[1]):
            ax.text(j, i, f'{M[i,j]:.2f}', ha='center', va='center', fontsize=10,
                    color='white' if abs(M[i,j]) > 5 else 'black')
    ax.set_xticks([]); ax.set_yticks([])
plt.suptitle("LU Decomposition: A = L @ U (with partial pivoting)", fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Verify: L @ U equals the original A',
              prose: [
                'If our LU is correct, L @ U should exactly reproduce the original matrix A.',
                'We also use scipy.linalg.lu to verify — it returns (P, L, U) where A = P @ L @ U.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import linalg

A = np.array([[2., 1., 1.], [4., 3., 3.], [8., 7., 9.]])
b = np.array([4., 10., 24.])
P, L, U = linalg.lu(A)

# Forward substitution: solve Ly = Pb
Pb = P.T @ b
y = linalg.solve_triangular(L, Pb, lower=True)
x = linalg.solve_triangular(U, y)

print(f"y (forward sub) = {y.round(4)}")
print(f"x (back sub)    = {x.round(4)}")
print(f"Verify A@x = {(A@x).round(4)}  (should be {b})")

fig, ax = plt.subplots(figsize=(6, 4))
stages = ['b', 'Pb', 'y (Ly=Pb)', 'x (Ux=y)']
vals = [b, Pb, y, x]
colors = ['steelblue', 'darkorange', 'green', 'crimson']
for k, (stage, v, color) in enumerate(zip(stages, vals, colors)):
    for i, vi in enumerate(v):
        ax.bar(k + i*0.25 - 0.25, vi, 0.2, color=color, alpha=0.85)
ax.set_xticks(range(4)); ax.set_xticklabels(stages, fontsize=10)
ax.set_title("LU Solve: b -> Pb -> y -> x", fontsize=12)
ax.axhline(0, color='k', lw=0.5); ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Solving two systems with the same A (one factorization, two solves)',
              prose: [
                'The power of LU: factor A once, solve Ax = b for multiple b vectors.',
                'We use scipy.linalg.lu_factor and lu_solve — the standard interface for multiple right-hand sides.',
              ],
              code: `import numpy as np
from scipy.linalg import lu_factor, lu_solve

A = np.array([[2., 1., 1.],
              [4., 3., 3.],
              [8., 7., 9.]])

# Factor once (O(n³))
lu_factored = lu_factor(A)   # stores LU + pivot permutation

# Solve for two different right-hand sides (each O(n²))
b1 = np.array([1., 2., 4.])
b2 = np.array([5., 3., 1.])

x1 = lu_solve(lu_factored, b1)
x2 = lu_solve(lu_factored, b2)

print("Solution to Ax = b1:")
print(x1.round(6))
print("Verify A @ x1 = b1:", np.allclose(A @ x1, b1))

print()
print("Solution to Ax = b2:")
print(x2.round(6))
print("Verify A @ x2 = b2:", np.allclose(A @ x2, b2))`,
            },
            {
              id: 4,
              cellTitle: 'Determinant from LU decomposition',
              prose: [
                'det(A) = product of diagonal of U, times (−1)^(number of row swaps).',
                'scipy.linalg.lu tells us the pivot swaps via matrix P. Each swap flips the sign.',
              ],
              code: `import numpy as np
from scipy.linalg import lu

A = np.array([[2., 1., 1.],
              [4., 3., 3.],
              [8., 7., 9.]])

P, L, U = lu(A)

# Product of diagonal of U
diag_product = np.prod(np.diag(U))

# Count row swaps: P is a permutation matrix.
# det(P) = +1 if even number of swaps, -1 if odd.
det_P = np.linalg.det(P)   # +1 or -1

det_from_LU = det_P * diag_product

print(f"Diagonal of U: {np.diag(U)}")
print(f"Product of diagonal: {diag_product:.4f}")
print(f"det(P) (swap sign): {det_P:.0f}")
print(f"det(A) from LU: {det_from_LU:.4f}")
print(f"np.linalg.det(A): {np.linalg.det(A):.4f}")
print(f"Match: {np.isclose(det_from_LU, np.linalg.det(A))}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Manual LU and forward/back substitution',
              difficulty: 'hard',
              prompt: 'For A = [[1,2,1],[2,3,3],[1,5,2]]: (1) compute L and U by hand (show the multipliers at each step), (2) verify A = L @ U in code, (3) solve Ax = [6,14,10] using forward substitution (Ly = b) then back substitution (Ux = y), (4) verify with np.linalg.solve.',
              code: `import numpy as np

A = np.array([[1., 2., 1.],
              [2., 3., 3.],
              [1., 5., 2.]])
b = np.array([6., 14., 10.])

# 1. LU by hand: record multipliers m21, m31, m32
#    After eliminating col 1: m21 = A[1,0]/A[0,0], m31 = A[2,0]/A[0,0]
#    After eliminating col 2: m32 = (new A[2,1])/(new A[1,1])
#    Build L = [[1,0,0],[m21,1,0],[m31,m32,1]]
#    U = result of elimination

# 2. verify np.allclose(L @ U, A)

# 3. Forward substitution: Ly = b
#    y1 = b[0]
#    y2 = b[1] - m21*y1
#    y3 = b[2] - m31*y1 - m32*y2
#
#    Back substitution: Ux = y
#    x3 = y3 / U[2,2]
#    x2 = (y2 - U[1,2]*x3) / U[1,1]
#    x1 = (y1 - U[0,1]*x2 - U[0,2]*x3) / U[0,0]

# 4. verify with np.linalg.solve(A, b)
`,
              hint: 'Multipliers: m21 = 2/1 = 2, m31 = 1/1 = 1. After step 1: A becomes [[1,2,1],[0,-1,1],[0,3,1]]. Then m32 = 3/(−1) = −3. After step 2: U[2] becomes [0,0,4]. So U = [[1,2,1],[0,−1,1],[0,0,4]].',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The LU decomposition exists and is unique when all the leading principal submatrices of $A$ (the $1 \\times 1$, $2 \\times 2$, ..., $(n-1) \\times (n-1)$ upper-left submatrices) are nonsingular. This is equivalent to saying Gaussian elimination can proceed without encountering a zero pivot.',
      'When pivoting is required, the correct statement is: for any nonsingular $n \\times n$ matrix $A$, there exists a permutation matrix $P$ such that $PA = LU$ where $L$ is unit lower triangular and $U$ is upper triangular with nonzero diagonal. The permutation $P$ is unique given the choice of pivoting strategy.',
      'The LU decomposition is not unique without the unit lower triangular constraint on $L$. If we allow $L$ to have arbitrary diagonal, any factorization $A = L\'U\'$ can be rescaled: let $D$ be the diagonal of $L\'$, then $A = (L\'D^{-1})(DU\')$, giving the $LDU$ decomposition where $L$ and $U$ are both unit triangular and $D$ is diagonal.',
      'Numerical stability: partial pivoting guarantees that all entries of $L$ satisfy $|L_{ij}| \\leq 1$. This bounds the growth of rounding errors. Complete pivoting (choosing the globally largest entry, not just within a column) gives even better stability but requires more work. Partial pivoting is the standard industry choice — it handles all practical cases and is what scipy, LAPACK, and MATLAB implement.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Existence and Uniqueness of LU',
        body: '**Without pivoting:** $A = LU$ with $L$ unit lower triangular and $U$ upper triangular exists and is unique iff all leading principal submatrices $A_k$ (top-left $k \\times k$ corners) are nonsingular for $k = 1, \\ldots, n-1$.\n\n**With partial pivoting:** For any nonsingular $A$, there exists a permutation matrix $P$ such that $PA = LU$. The factorization $PA = LU$ always exists — pivoting guarantees no zero pivot.',
      },
      {
        type: 'theorem',
        title: 'The LDU Decomposition',
        body: 'If $A$ has an LU decomposition, it can be further refined to $A = LDU$ where:\n- $L$ is unit lower triangular\n- $D$ is diagonal\n- $U$ is unit upper triangular\n\nThe diagonal $D$ contains the pivots. This form is unique. For symmetric $A$, $L = U^T$ and the decomposition becomes $A = LDL^T$ (LDLT), which is more efficient and numerically stable for symmetric systems.',
      },
      {
        type: 'insight',
        title: 'Why Partial Pivoting Keeps L Bounded',
        body: 'Partial pivoting chooses the largest entry in the current column as the pivot before each elimination step. This guarantees that all multipliers satisfy $|m_{ij}| \\leq 1$ — so all entries of $L$ are at most 1 in absolute value.\n\nWithout pivoting, multipliers can be huge (if the pivot is tiny), causing $L$ to have enormous entries that amplify rounding errors catastrophically. Partial pivoting prevents this growth.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "la2-006-ex1",
      title: "Computing LU Decomposition by Hand",
      problem: "Find $L$ and $U$ such that $A = LU$ for $A = \\begin{bmatrix} 2 & 1 & 1 \\\\ 4 & 3 & 3 \\\\ 8 & 7 & 9 \\end{bmatrix}$.",
      steps: [
        {
          expression: "m_{21} = \\frac{4}{2} = 2, \\quad R_2 \\leftarrow R_2 - 2R_1: \\quad \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & 1 & 1 \\\\ 8 & 7 & 9 \\end{bmatrix}",
          annotation: "Eliminate entry (2,1). The multiplier $m_{21} = 4/2 = 2$ is stored into $L$ at position $(2,1)$. Row replacement: det of the matrix is unchanged.",
          strategyTitle: "Eliminate (2,1) — record multiplier",
          checkpoint: "Why do we divide 4 by 2 (not 2 by 4) to get the multiplier?",
          hints: ["We want to subtract a multiple of row 1 from row 2 so that the (2,1) entry becomes exactly 0. That multiple is (entry to eliminate)/(pivot) = 4/2 = 2."],
        },
        {
          expression: "m_{31} = \\frac{8}{2} = 4, \\quad R_3 \\leftarrow R_3 - 4R_1: \\quad \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & 1 & 1 \\\\ 0 & 3 & 5 \\end{bmatrix}",
          annotation: "Eliminate entry (3,1). Multiplier $m_{31} = 8/2 = 4$ goes into $L$ at position $(3,1)$.",
          strategyTitle: "Eliminate (3,1) — record multiplier",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "m_{32} = \\frac{3}{1} = 3, \\quad R_3 \\leftarrow R_3 - 3R_2: \\quad \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 2 \\end{bmatrix}",
          annotation: "Eliminate entry (3,2). The new pivot is 1 (from the previous step). Multiplier $m_{32} = 3/1 = 3$ goes into $L$ at position $(3,2)$. The matrix is now $U$.",
          strategyTitle: "Eliminate (3,2) — record multiplier",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "L = \\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ 4 & 3 & 1 \\end{bmatrix}, \\quad U = \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 2 \\end{bmatrix}",
          annotation: "Assemble $L$ from the recorded multipliers: 1s on the diagonal, multipliers below. $U$ is the result of the elimination. Verify: $LU = A$.",
          strategyTitle: "Assemble L and U",
          checkpoint: "What is det(A) from this factorization?",
          hints: ["det(A) = det(U) = product of U's diagonal = 2 × 1 × 2 = 4. (L has det = 1 because its diagonal is all 1s.)"],
        }
      ],
      conclusion: "L stores the elimination multipliers below a diagonal of 1s. U is the upper triangular result of elimination. Together: A = LU. det(A) = product of U's diagonal = 4.",
    },
    {
      id: "la2-006-ex2",
      title: "Solving Ax = b via Forward and Back Substitution",
      problem: "Using the factorization $A = LU$ from Example 1, solve $A\\mathbf{x} = \\begin{bmatrix} 4 \\\\ 10 \\\\ 20 \\end{bmatrix}$.",
      steps: [
        {
          expression: "L\\mathbf{y} = \\mathbf{b}: \\quad \\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ 4 & 3 & 1 \\end{bmatrix} \\begin{bmatrix} y_1 \\\\ y_2 \\\\ y_3 \\end{bmatrix} = \\begin{bmatrix} 4 \\\\ 10 \\\\ 20 \\end{bmatrix}",
          annotation: "Substitute $A = LU$ into $A\\mathbf{x} = \\mathbf{b}$ to get $LU\\mathbf{x} = \\mathbf{b}$. Let $\\mathbf{y} = U\\mathbf{x}$ and first solve $L\\mathbf{y} = \\mathbf{b}$. This is Phase 1: forward substitution.",
          strategyTitle: "Phase 1 setup — forward substitution",
          checkpoint: "Why can we solve Ly = b without inverting L?",
          hints: ["L is lower triangular: y₁ is immediately known from the first row, then y₁ uses only y₁, then y₁ƒ uses only y₁ and y₁. No matrix inversion needed."],
        },
        {
          expression: "y_1 = 4, \\quad y_2 = 10 - 2(4) = 2, \\quad y_3 = 20 - 4(4) - 3(2) = 20 - 16 - 6 = -2",
          annotation: "Row 1: $y_1 = 4$. Row 2: $2y_1 + y_2 = 10 \\Rightarrow y_2 = 10 - 8 = 2$. Row 3: $4y_1 + 3y_2 + y_3 = 20 \\Rightarrow y_3 = 20 - 16 - 6 = -2$. Each value uses only previously computed values — the defining property of forward substitution.",
          strategyTitle: "Forward substitution — compute y",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "U\\mathbf{x} = \\mathbf{y}: \\quad \\begin{bmatrix} 2 & 1 & 1 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 2 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix} = \\begin{bmatrix} 4 \\\\ 2 \\\\ -2 \\end{bmatrix}",
          annotation: "Phase 2: back substitution. Solve $U\\mathbf{x} = \\mathbf{y}$ working from the bottom row upward.",
          strategyTitle: "Phase 2 setup — back substitution",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "x_3 = -2/2 = -1, \\quad x_2 = 2 - (-1) = 3, \\quad x_1 = (4 - 3 - (-1))/2 = 2/2 = 1",
          annotation: "Row 3: $2x_3 = -2 \\Rightarrow x_3 = -1$. Row 2: $x_2 + x_3 = 2 \\Rightarrow x_2 = 3$. Row 1: $2x_1 + x_2 + x_3 = 4 \\Rightarrow 2x_1 = 4 - 3 + 1 = 2 \\Rightarrow x_1 = 1$. Solution: $\\mathbf{x} = [1, 3, -1]^T$.",
          strategyTitle: "Back substitution — compute x",
          checkpoint: "Verify: does A @ [1, 3, -1]^T equal [4, 10, 20]^T?",
          hints: ["Row 1: 2(1)+1(3)+1(-1) = 2+3-1 = 4 ✓. Row 2: 4(1)+3(3)+3(-1) = 4+9-3 = 10 ✓. Row 3: 8(1)+7(3)+9(-1) = 8+21-9 = 20 ✓."],
        }
      ],
      conclusion: "x = [1, 3, −1]. The two-phase approach (forward then back substitution) each takes O(n²) operations. Critically, the LU factorization from Example 1 can now be reused for any different b vector without redoing the elimination.",
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "la2-006-ch1",
      difficulty: "easy",
      problem: "For $A = \\begin{bmatrix} 3 & 6 \\\\ 1 & 4 \\end{bmatrix}$, find $L$ and $U$ such that $A = LU$. Then compute $\\det(A)$ directly from $U$.",
      hint: "There is only one multiplier: $m_{21} = 1/3$. After the single row replacement, the result is $U$. $L$ has 1s on the diagonal and $m_{21}$ below.",
      walkthrough: [
        {
          expression: "m_{21} = 1/3, \\quad R_2 \\leftarrow R_2 - \\tfrac{1}{3}R_1: \\quad U = \\begin{bmatrix} 3 & 6 \\\\ 0 & 2 \\end{bmatrix}",
          annotation: "One row replacement creates U."
        },
        {
          expression: "L = \\begin{bmatrix} 1 & 0 \\\\ 1/3 & 1 \\end{bmatrix}",
          annotation: "L has 1s on diagonal and the multiplier 1/3 below."
        },
        {
          expression: "\\det(A) = \\det(U) = 3 \\cdot 2 = 6",
          annotation: "Product of diagonal of U."
        }
      ],
      answer: "det(A) = 6"
    },
    {
      id: "la2-006-ch2",
      difficulty: "medium",
      problem: "Using the LU decomposition $L = \\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ 1 & 3 & 1 \\end{bmatrix}$, $U = \\begin{bmatrix} 2 & 4 & -2 \\\\ 0 & 1 & 5 \\\\ 0 & 0 & 3 \\end{bmatrix}$, solve $A\\mathbf{x} = \\begin{bmatrix} 0 \\\\ 1 \\\\ 8 \\end{bmatrix}$ via forward substitution then back substitution.",
      hint: "Phase 1: Ly = b. y₁ = 0, then y₂ = b₂ − 2y₁ = 1, then y₃ = b₃ − 1·y₁ − 3·y₂ = 5. Phase 2: Ux = y. x₃ = y₃/3 = 5/3, then x₂ = (y₂ − 5·x₃)/1 = −22/3, then x₁ = (y₁ − 4·x₂ − (−2)·x₃)/2 = 49/3.",
      walkthrough: [
        {
          expression: "y_1 = 0, \\quad y_2 = 1 - 2(0) = 1, \\quad y_3 = 8 - 1(0) - 3(1) = 5",
          annotation: "Forward substitution: work down through L."
        },
        {
          expression: "x_3 = 5/3, \\quad x_2 = (1 - 5 \\cdot 5/3)/1 = 1 - 25/3 = -22/3",
          annotation: "Back substitution: work up through U."
        },
        {
          expression: "x_1 = (0 - 4(-22/3) - (-2)(5/3))/2 = (88/3 + 10/3)/2 = (98/3)/2 = 49/3",
          annotation: "Back substitution continued. Solution: x = [49/3, −22/3, 5/3]."
        }
      ],
      answer: "x = [49/3, −22/3, 5/3]"
    },
    {
      id: "la2-006-ch3",
      difficulty: "hard",
      problem: "The matrix $A = \\begin{bmatrix} 0 & 2 & 1 \\\\ 1 & 3 & 2 \\\\ 3 & 2 & 4 \\end{bmatrix}$ requires a row swap before LU decomposition can begin because $a_{11} = 0$. (1) Swap rows 1 and 2 to get $A'$. (2) Compute $L$ and $U$ for $A'$ by Gaussian elimination. (3) What is $\\det(A)$? Remember the row swap affected the sign.",
      hint: "After swapping rows 1 and 2: A' = [[1,3,2],[0,2,1],[3,2,4]]. Then eliminate column 1 of A'. Multiplier m31 = 3/1 = 3. Then eliminate column 2. Record all multipliers into L. det(A) = −det(A') because of the one row swap.",
      walkthrough: [
        {
          expression: "\\text{Swap } R_1 \\leftrightarrow R_2: \\quad A' = \\begin{bmatrix} 1 & 3 & 2 \\\\ 0 & 2 & 1 \\\\ 3 & 2 & 4 \\end{bmatrix}",
          annotation: "One row swap. det(A) = −det(A')."
        },
        {
          expression: "m_{31} = 3, \\quad R_3 \\leftarrow R_3 - 3R_1: \\quad \\begin{bmatrix} 1 & 3 & 2 \\\\ 0 & 2 & 1 \\\\ 0 & -7 & -2 \\end{bmatrix}",
          annotation: "Eliminate (3,1). m21 = 0 (already zero, no operation needed)."
        },
        {
          expression: "m_{32} = -7/2, \\quad R_3 \\leftarrow R_3 + \\tfrac{7}{2}R_2: \\quad U = \\begin{bmatrix} 1 & 3 & 2 \\\\ 0 & 2 & 1 \\\\ 0 & 0 & 3/2 \\end{bmatrix}",
          annotation: "Eliminate (3,2). m32 = (−7)/(2) = −7/2."
        },
        {
          expression: "\\det(A') = 1 \\cdot 2 \\cdot 3/2 = 3, \\quad \\det(A) = -3",
          annotation: "Product of diagonal of U = 3. One row swap: det(A) = −det(A') = −3."
        }
      ],
      answer: "det(A) = −3"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "A = LU",
        meaning: "LU decomposition: A factors into a unit lower triangular matrix L (1s on diagonal, multipliers below) and an upper triangular matrix U (result of Gaussian elimination)."
      },
      {
        symbol: "PA = LU",
        meaning: "LU with partial pivoting: P permutes the rows of A so that the largest entry in each column becomes the pivot, improving numerical stability."
      },
      {
        symbol: "L\\mathbf{y} = \\mathbf{b}, \\quad U\\mathbf{x} = \\mathbf{y}",
        meaning: "The two-phase solve: forward substitution (top-to-bottom through L) produces y, then back substitution (bottom-to-top through U) produces x."
      },
      {
        symbol: "m_{ik} = a_{ik}/a_{kk}",
        meaning: "The Gaussian elimination multiplier: entry to eliminate divided by the pivot. Placed at position (i,k) in L — no extra work, it is recorded as elimination runs."
      },
      {
        symbol: "\\det(A) = (\\pm 1) \\cdot U_{11} \\cdots U_{nn}",
        meaning: "Determinant as LU byproduct: product of U's diagonal, negated once per row swap in P. Free after factorization."
      },
      {
        symbol: "O(n^3) + k \\cdot O(n^2)",
        meaning: "Total cost for k right-hand sides: one factorization (O(n³)) plus k triangular solves (O(n²) each) — far cheaper than k full eliminations (k × O(n³))."
      }
    ],
    rulesOfThumb: [
      "Factor A once (O(n³)), solve multiple right-hand sides in O(n²) each.",
      "Never compute A⁻¹ just to multiply it by b — use np.linalg.solve (which uses LU internally).",
      "If a pivot is zero (or very small), swap to the row with the largest entry in that column (partial pivoting).",
      "det(A) from LU: product of U's diagonal, times (−1)^(number of row swaps)."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-004',
        label: 'Gaussian Elimination',
        note: 'LU decomposition is Gaussian elimination with one extra step: instead of discarding the multipliers, you save them into the matrix L. Everything else is identical.'
      },
      {
        lessonId: 'la2-005',
        label: 'Determinant Properties',
        note: 'The row replacements in LU decomposition are exactly Property 4 (no det change). Row swaps in pivoting are Property 2 (each flips sign). The diagonal of U gives the triangular determinant formula.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la4-002',
        label: 'QR Decomposition',
        note: 'QR decomposition factors A into an orthogonal matrix Q and upper triangular R. It is the backbone of eigenvalue algorithms (QR algorithm) and least squares, and follows the same factorize-once, solve-many pattern as LU.'
      },
      {
        lessonId: 'la4-004',
        label: 'SVD',
        note: 'The SVD (A = UΣVᵀ) is the ultimate matrix factorization. Like LU, it is computed once and reused for multiple operations: solving, compressing, pseudoinverse, rank approximation.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "la2-006-assess-1",
        type: "choice",
        text: "You need to solve Ax = b for 500 different vectors b, all with the same matrix A. Which approach is computationally cheapest?",
        options: [
          "Compute A⁻¹ once, then multiply A⁻¹ b for each b",
          "Run Gaussian elimination from scratch for each of the 500 systems",
          "Compute the LU decomposition of A once, then apply forward/back substitution 500 times",
          "Compute the determinant of A to check invertibility, then use Cramer's rule"
        ],
        answer: "Compute the LU decomposition of A once, then apply forward/back substitution 500 times",
        hint: "LU factors once at O(n³), then each solve is O(n²). Computing A⁻¹ is also O(n³) but less numerically stable. Running full Gaussian elimination 500 times is 500 × O(n³)."
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "LU decomposition = Gaussian elimination with the multipliers saved into L.",
    "Two-phase solve: Ly = b (forward, top to bottom), then Ux = y (back, bottom to top).",
    "Partial pivoting: before each elimination, swap to the row with the largest pivot entry — prevents division by zero and stabilizes numerical errors.",
    "det(A) = product of U's diagonal × (−1)^(swap count) — free after LU.",
    "Factor once (O(n³)), solve many times (O(n²) each) — the fundamental reuse pattern of numerical linear algebra."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la2-006-1', label: 'Read intuition — understand how LU stores Gaussian elimination', type: 'read' },
    { id: 'cp-la2-006-2', label: 'Read math — trace forward and back substitution formulas', type: 'read' },
    { id: 'cp-la2-006-3', label: 'Read rigor — understand pivoting and the existence theorem', type: 'read' },
    { id: 'cp-la2-006-4', label: 'Run OpenMAT cell 1 — compute LU with lu() and verify P*A = L*U', type: 'lab' },
    { id: 'cp-la2-006-5', label: 'Run OpenMAT cell 3 — reuse factorization to solve two systems', type: 'lab' },
    { id: 'cp-la2-006-6', label: 'Complete example 1: trace all 3 multipliers into L by hand', type: 'example' },
    { id: 'cp-la2-006-7', label: 'Complete example 2: perform both substitution phases', type: 'example' },
    { id: 'cp-la2-006-8', label: 'Attempt challenge 1: 2×2 LU and det from U diagonal', type: 'challenge' },
    { id: 'cp-la2-006-9', label: 'Attempt challenge 3: LU with pivoting on a zero-diagonal matrix', type: 'challenge' },
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'la2-006-quiz-1',
      type: 'choice',
      text: "What is stored in the matrix $L$ during LU decomposition?",
      options: [
        "The eigenvalues of A",
        "The diagonal entries of A",
        "The Gaussian elimination multipliers used to create zeros below each pivot, with 1s on the diagonal",
        "The transpose of U"
      ],
      answer: "The Gaussian elimination multipliers used to create zeros below each pivot, with 1s on the diagonal",
      hints: ["Each multiplier m_ik = (entry to eliminate) / (pivot) is recorded at position (i,k) in L. The diagonal of L is always 1s."],
      reviewSection: 'Intuition tab — The core observation'
    },
    {
      id: 'la2-006-quiz-2',
      type: 'choice',
      text: "Why does partial pivoting improve numerical stability?",
      options: [
        "It finds the exact solution faster by sorting the pivots",
        "It prevents large multipliers (values greater than 1 in L) by ensuring the pivot is always the largest entry in its column",
        "It changes the determinant to be positive",
        "It makes U a symmetric matrix"
      ],
      answer: "It prevents large multipliers (values greater than 1 in L) by ensuring the pivot is always the largest entry in its column",
      hints: ["If a pivot is small relative to the entries below it, the multiplier m_ik = entry/pivot can be very large. Large multipliers amplify rounding errors. Partial pivoting guarantees |L_ij| ≤ 1 by always choosing the largest available pivot."],
      reviewSection: 'Intuition tab — Partial Pivoting'
    },
    {
      id: 'la2-006-quiz-3',
      type: 'choice',
      text: "You need to solve $A\\mathbf{x} = \\mathbf{b}$ for 500 different $\\mathbf{b}$ vectors. You have already computed the LU factorization. How many operations does each subsequent solve require?",
      options: [
        "$O(n^2)$ — forward substitution and back substitution each cost $O(n^2)$.",
        "$O(n^3)$ — same as the original factorization.",
        "$O(n)$ — since $L$ and $U$ are triangular, each row is solved in one step.",
        "$O(n^4)$ — the inverse must be recomputed each time."
      ],
      answer: "$O(n^2)$ — forward substitution and back substitution each cost $O(n^2)$.",
      hints: ["Forward substitution (through $L$) requires $n(n-1)/2$ multiply-adds. Back substitution (through $U$) also requires $n(n-1)/2$. Both are $O(n^2)$, far cheaper than the $O(n^3)$ factorization."],
      reviewSection: 'Math tab — Computational Complexity callout'
    },
    {
      id: 'la2-006-quiz-4',
      type: 'choice',
      text: "How is $\\det(A)$ computed from the LU factorization $PA = LU$?",
      options: [
        "Product of all entries of $L$ and $U$.",
        "$\\det(L) \\cdot \\det(U) \\cdot \\det(P)$, which simplifies to $\\pm$ product of $U$'s diagonal entries.",
        "Trace of $U$ (sum of diagonal entries).",
        "Rank of $U$."
      ],
      answer: "$\\det(L) \\cdot \\det(U) \\cdot \\det(P)$, which simplifies to $\\pm$ product of $U$'s diagonal entries.",
      hints: ["$\\det(L) = 1$ (L has 1s on diagonal). $\\det(P) = \\pm 1$ (one flip per row swap). $\\det(U)$ = product of diagonal entries. So $\\det(A) = (\\pm 1) \\times \\prod U_{ii}$."],
      reviewSection: 'Intuition tab — Determinant as byproduct'
    },
    {
      id: 'la2-006-quiz-5',
      type: 'choice',
      text: "In forward substitution solving $L\\mathbf{y} = \\mathbf{b}$, you compute $y_3 = b_3 - L_{31}y_1 - L_{32}y_2$. Why can you compute $y_3$ directly without solving a full system?",
      options: [
        "Because $L$ is lower triangular: by the time you compute $y_3$, the values $y_1$ and $y_2$ are already known from the previous two rows.",
        "Because $L$ is always symmetric.",
        "Because forward substitution runs backward from $y_n$.",
        "Because $L_{33} = 0$ so the equation simplifies."
      ],
      answer: "Because $L$ is lower triangular: by the time you compute $y_3$, the values $y_1$ and $y_2$ are already known from the previous two rows.",
      hints: ["Lower triangular structure means row $i$ of $L\\mathbf{y} = \\mathbf{b}$ only involves $y_1, y_2, \\ldots, y_i$. Since $y_1$ through $y_{i-1}$ are already computed, $y_i$ follows immediately."],
      reviewSection: 'Math tab — Forward substitution formula'
    },
    {
      id: 'la2-006-quiz-6',
      type: 'choice',
      text: "Which MATLAB/NumPy idiom is correct for solving $A\\mathbf{x} = \\mathbf{b}$ numerically?",
      options: [
        "`x = inv(A) * b` in MATLAB — compute the inverse first.",
        "`x = A \\ b` in MATLAB (or `np.linalg.solve(A, b)` in Python) — use LU decomposition directly.",
        "`x = det(A) * b` — scale by the determinant.",
        "`x = A' * b` — use the transpose instead of the inverse."
      ],
      answer: "`x = A \\ b` in MATLAB (or `np.linalg.solve(A, b)` in Python) — use LU decomposition directly.",
      hints: ["Computing `inv(A)` is more expensive AND less numerically stable than solving directly via LU. Professional code always uses `A \\ b` (MATLAB backslash) or `np.linalg.solve(A, b)`, which call LAPACK LU routines internally."],
      reviewSection: 'Math tab — Never compute A⁻¹ callout',
    },
    {
      id: 'la2-006-quiz-7',
      type: 'choice',
      text: 'If $L = \\begin{bmatrix}1&0\\\\3&1\\end{bmatrix}$ and $U = \\begin{bmatrix}2&5\\\\0&4\\end{bmatrix}$, what is the original matrix $A = LU$?',
      options: [
        '$\\begin{bmatrix}2&5\\\\6&19\\end{bmatrix}$',
        '$\\begin{bmatrix}2&5\\\\3&4\\end{bmatrix}$',
        '$\\begin{bmatrix}5&2\\\\19&6\\end{bmatrix}$',
        '$\\begin{bmatrix}2&5\\\\0&12\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}2&5\\\\6&19\\end{bmatrix}$',
      hints: ['$LU$: row 1 = $[1,0] \\cdot$ columns of $U$ = $[2,5]$. Row 2 = $[3,1] \\cdot$ columns: entry $(2,1) = 3(2)+1(0)=6$; entry $(2,2) = 3(5)+1(4)=19$.'],
      reviewSection: 'Example 1 — verifying LU factorization',
    },
    {
      id: 'la2-006-quiz-8',
      type: 'choice',
      text: 'To solve $L\\mathbf{y} = \\mathbf{b}$ where $L = \\begin{bmatrix}1&0\\\\2&1\\end{bmatrix}$ and $\\mathbf{b} = \\begin{bmatrix}3\\\\8\\end{bmatrix}$, what is $y_2$?',
      options: [
        '$y_2 = 2$ — forward substitution: $y_1 = 3$, then $2y_1 + y_2 = 8 \\Rightarrow y_2 = 2$',
        '$y_2 = 8$',
        '$y_2 = 14$',
        '$y_2 = 4$',
      ],
      answer: '$y_2 = 2$ — forward substitution: $y_1 = 3$, then $2y_1 + y_2 = 8 \\Rightarrow y_2 = 2$',
      hints: ['Row 1: $y_1 = 3$. Row 2: $2(3) + y_2 = 8 \\Rightarrow y_2 = 8 - 6 = 2$.'],
      reviewSection: 'Math tab — Forward substitution formula',
    },
    {
      id: 'la2-006-quiz-9',
      type: 'choice',
      text: 'What does partial pivoting add to the standard LU factorization?',
      options: [
        'A permutation matrix $P$ such that $PA = LU$ — rows are swapped before each elimination step to put the largest entry in the pivot position',
        'An extra triangular factor $P$ that represents the permutation',
        'Scaling of each row to make diagonal entries equal to 1',
        'Iterative refinement to improve accuracy',
      ],
      answer: 'A permutation matrix $P$ such that $PA = LU$ — rows are swapped before each elimination step to put the largest entry in the pivot position',
      hints: ['Without pivoting, a small pivot entry makes the multiplier $m_{ik} = a_{ik}/a_{kk}$ very large, amplifying rounding errors. Partial pivoting swaps the row with the largest entry to the pivot position, guaranteeing $|L_{ij}| \\leq 1$.'],
      reviewSection: 'Intuition tab — Partial Pivoting',
    },
    {
      id: 'la2-006-quiz-10',
      type: 'choice',
      text: 'An $n \\times n$ matrix $A$ fails to have an LU factorization without pivoting (a zero appears in the pivot position during elimination). What must be done?',
      options: [
        'Apply partial pivoting — swap a row to bring a nonzero entry to the pivot position, producing $PA = LU$',
        'The matrix has no LU factorization at all and cannot be solved',
        'Replace the zero pivot with a very small number ($\\epsilon$) to avoid division by zero',
        'Transpose the matrix and try again',
      ],
      answer: 'Apply partial pivoting — swap a row to bring a nonzero entry to the pivot position, producing $PA = LU$',
      hints: ['Every invertible matrix has an LU factorization with pivoting ($PA = LU$). Even singular matrices have a factorization (though $U$ will have a zero on its diagonal). Substituting $\\epsilon$ for zero is a numerical trick but introduces errors.'],
      reviewSection: 'Intuition tab — Partial Pivoting',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'LU decomposition requires storing two separate matrices — it uses twice as much memory as $A$.',
      whyStudentsThinkIt: 'Students think of $L$ and $U$ as two complete $n\\times n$ matrices stored separately.',
      correctionExample: 'In practice, $L$ and $U$ are stored IN-PLACE in the same memory as $A$: the upper triangle holds $U$, and the strict lower triangle holds the multipliers of $L$ (since $L$\'s diagonal is always 1, it need not be stored). Total memory: one $n\\times n$ matrix.',
      contrastCase: 'Contrast with eigendecomposition $A = PDP^{-1}$, which requires storing $P$, $D$, and $P^{-1}$ as three separate matrices.',
    },
    {
      falseBelief: 'Solving with LU is more complex than directly applying the inverse: why not just compute $A^{-1}\\mathbf{b}$?',
      whyStudentsThinkIt: 'Inverting a matrix and multiplying feels like one "mathematical step" — students don\'t account for the cost of computing $A^{-1}$.',
      correctionExample: 'Computing $A^{-1}$ requires $O(n^3)$ operations and stores an additional $n\\times n$ matrix. For a single right-hand side, this is identical cost to LU but numerically less stable. For 100 right-hand sides: LU factorization once ($O(n^3)$) + 100 triangular solves ($100 \\times O(n^2)$) vs 100 full solves ($100 \\times O(n^3)$). LU is 100× cheaper.',
      contrastCase: 'The only time computing $A^{-1}$ is justified is when you need the inverse matrix itself (e.g., for analysis or symbolic computation), not just solutions to linear systems.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A finite element solver must assemble a $10000 \\times 10000$ stiffness matrix and solve it for 50 different load vectors (different structural loads on the same mesh). Why is LU factorization the right approach, and what is the computational saving?',
      competingTechniques: ['Solve the full system fresh each time using Gaussian elimination', 'Factor once with LU, then solve each load vector with triangular substitutions'],
      whyThisTechniqueWins: 'Factoring once: $O(n^3)$ = $10^{12}$ operations. Each subsequent solve: $O(n^2) = 10^8$ operations. For 50 loads: $10^{12} + 50 \\times 10^8 = 1.05 \\times 10^{12}$ operations vs $50 \\times 10^{12}$ fresh solves — a 47.6× speedup for the amortized loads.',
    },
    {
      situation: 'A robotics simulation uses LU decomposition to solve dynamics equations in real-time at 1000 Hz. Between time steps, the mass matrix $M$ (which determines how mass resists acceleration) changes slightly. Should the simulation re-factor $M$ every step, or cache and reuse the LU factorization?',
      competingTechniques: ['Re-factor $M$ every time step', 'Cache the LU factorization and only update when $M$ changes significantly'],
      whyThisTechniqueWins: 'If $M$ changes every time step (robot joint positions change), refactoring every step is unavoidable. But if the dynamics include slowly-changing terms, caching and reusing the factorization (or doing low-rank updates) saves significant computation. The engineer must profile the update rate vs. the factorization cost.',
    },
  ],

  debugging: [
    {
      commonError: 'Placing the multiplier in the wrong position of $L$ — storing $m_{ki}$ instead of $m_{ik}$.',
      symptom: 'The product $LU \\neq A$ — the off-diagonal entry of $L$ is in the wrong row or column.',
      whyItHappened: 'The multiplier $m_{ik}$ eliminates row $i$ using row $k$ — it goes at position $(i,k)$ in $L$. Students sometimes store it at $(k,i)$.',
      repairStrategy: 'Remember: $m_{ik}$ = (the entry you want to zero) / (the pivot). Row $i$, column $k$ in $L$ (below the diagonal means $i > k$). Verify: $L_{ik} \\times U_{kk}$ should reconstruct the entry in $A$ at position $(i,k)$ that was eliminated.',
    },
    {
      commonError: 'Forgetting that the diagonal of $L$ must be 1s.',
      symptom: 'Student writes a diagonal entry of $L$ as the pivot value (copying it from $A$) instead of 1.',
      whyItHappened: '$L$ has the pivot values ON the diagonal, and students confuse $L$\'s role with $U$\'s.',
      repairStrategy: '$L$ has 1s on its diagonal ALWAYS. The pivot values go on $U$\'s diagonal. After each elimination step, normalize: the current pivot row becomes a row of $U$ (with the pivot entry as its diagonal); the multipliers (how much of the pivot row was subtracted from lower rows) become entries of $L$ below the diagonal.',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Perform LU decomposition by hand on a $3\\times 3$ matrix (recording multipliers in $L$ during forward elimination), then use forward and back substitution to solve $A\\mathbf{x} = \\mathbf{b}$ for a given $\\mathbf{b}$.',
    explainVerbally: 'Explain why LU decomposition is preferred over computing $A^{-1}$ for repeated solves, and why partial pivoting is necessary for numerical stability.',
    detectIncorrectApplication: 'Identify when a student stores multipliers in the wrong position of $L$, forgets the 1s on $L$\'s diagonal, or accounts incorrectly for row swaps in the determinant formula.',
    transferToUnfamiliar: 'Given a finite element stiffness matrix that changes slightly between time steps, explain the trade-off between re-factoring and updating the LU decomposition.',
  },
};
