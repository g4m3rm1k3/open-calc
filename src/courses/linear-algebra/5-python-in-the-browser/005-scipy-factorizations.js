export default {
  id: 'la5-005',
  slug: 'scipy-factorizations',
  chapter: 'la5',
  order: 5,
  title: 'SciPy Factorizations: LU, Cholesky, QR',
  subtitle: 'When to use each factorization, how to reuse them, and why the naive one-shot approach leaves performance on the table.',
  tags: ['scipy', 'python', 'LU', 'Cholesky', 'QR', 'factorizations', 'numerical linear algebra'],
  aliases: 'scipy LU factorization Cholesky QR decomposition positive definite least squares performance reuse',

  hook: {
    question: '`np.linalg.solve` is one line. Why would you ever reach for `scipy.linalg.lu_factor`?',
    realWorldContext: 'A finite-element simulation solves the same stiffness matrix K against thousands of different load vectors f. A Kalman filter updates covariance matrices with new sensor readings at 100Hz. A linear program pivots through the same basis matrix dozens of times before finding the optimum. In all these cases, one-shot `solve` wastes 99% of the work by re-factoring the same matrix every call. Factorization reuse is the difference between a simulation that finishes in seconds and one that finishes next week.',
  },

  intuition: {
    prose: [
      '**LU: general square systems.** `lu, piv = scipy.linalg.lu_factor(A)` computes the $PA=LU$ factorization once ($O(n^3)$). Each subsequent `scipy.linalg.lu_solve((lu, piv), b)` costs only $O(n^2)$. If you\'re solving the same $A$ against $k$ right-hand sides, the speedup is from $k\\cdot O(n^3)$ to $O(n^3) + k\\cdot O(n^2)$.',
      '**Cholesky: symmetric positive definite systems.** For SPD matrices (covariance matrices, stiffness matrices, regularized normal equations), `scipy.linalg.cholesky(A)` gives a 2× speedup over LU by exploiting the structure: it only processes the lower triangle. L = cholesky(A), then `scipy.linalg.cho_solve((L, lower), b)`.',
      '**QR: least squares and eigenvalue problems.** `Q, R = scipy.linalg.qr(A)`. For least squares, `R x = Q^T b` avoids forming $A^T A$ (which squares the condition number). For eigenvalue computation, QR iteration converges to the Schur form.',
      '**Decision tree:** Is A square? → LU or Cholesky. Is A SPD? → Cholesky. Is A overdetermined? → QR. Solving A against many b? → factor-once pattern. Otherwise → `np.linalg.solve`/`lstsq` for simplicity.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Factorization comparison',
        body: '| Method | Matrix type | Cost | Advantage |\n|---|---|---|---|\n| LU | General square | O(n³) | Always works with pivoting |\n| Cholesky | SPD | ~½ O(n³) | 2× faster, uses half the storage |\n| QR | Any (incl. rect.) | O(mn²) m≥n | Numerically stable, handles rank-deficient cases |\n| Solve (one-shot) | General square | O(n³) | Simple, no reuse |',
      },
      {
        type: 'warning',
        title: 'Cholesky fails on non-SPD matrices',
        body: '`scipy.linalg.cholesky` raises `LinAlgError` if A is not positive definite. This is actually a useful test: if Cholesky succeeds, A is SPD (positive definite). If it fails with a valid covariance matrix, check for numerical issues — add a small ridge `A + 1e-10 * np.eye(n)`.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'SciPy Factorizations: Factor Once, Solve Many',
        mathBridge: 'Each cell shows one factorization pattern with timing context — emphasizing the factor-once, solve-many workflow.',
        caption: 'Cell 2 shows the critical performance pattern: lu_factor + lu_solve.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'LU factorization: factor once, solve many times',
              prose: ['Factor A once for O(n³), then each solve costs only O(n²). Essential when solving the same system with many right-hand sides.'],
              code: `import numpy as np
import scipy.linalg

A = np.array([[4.,  3.,  2.],
              [6.,  3.,  1.],
              [2.,  5.,  8.]])

b_list = [
    np.array([9., 10., 15.]),
    np.array([1.,  2.,  3.]),
    np.array([5.,  5., 10.]),
]

# ── One-shot approach: 3 × O(n³) ────────────────────────────────────────
print("One-shot (re-factors every time):")
for b in b_list:
    x = np.linalg.solve(A, b)
    print(f"  x = {x.round(4)},  ‖Ax-b‖ = {np.linalg.norm(A @ x - b):.1e}")

# ── Factor-once approach: O(n³) + 3 × O(n²) ────────────────────────────
print("\\nFactor-once (lu_factor + lu_solve):")
lu, piv = scipy.linalg.lu_factor(A)
for b in b_list:
    x = scipy.linalg.lu_solve((lu, piv), b)
    print(f"  x = {x.round(4)},  ‖Ax-b‖ = {np.linalg.norm(A @ x - b):.1e}")`,
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Cholesky: 2× faster for symmetric positive definite matrices',
              prose: ['Cholesky exploits symmetry: only processes the lower triangle. If it succeeds, A is SPD. Use cho_factor + cho_solve for reuse.'],
              code: `# Symmetric positive definite matrix (covariance-like)
A_spd = np.array([[4., 2., 1.],
                  [2., 5., 2.],
                  [1., 2., 6.]])

# Verify SPD: eigenvalues all positive
eigenvalues = np.linalg.eigvalsh(A_spd)
print(f"Eigenvalues (must all be > 0 for SPD): {eigenvalues.round(4)}")
print(f"A is SPD: {np.all(eigenvalues > 0)}")

# Cholesky factorization: A = L Lᵀ
L = scipy.linalg.cholesky(A_spd, lower=True)  # lower=True gives L (lower triangular)
print(f"\\nCholesky factor L:\\n{L.round(4)}")
print(f"L Lᵀ = A: {np.allclose(L @ L.T, A_spd)}")

# Factor-once + solve pattern for Cholesky
c, lower = scipy.linalg.cho_factor(A_spd, lower=True)
b = np.array([7., 10., 10.])
x = scipy.linalg.cho_solve((c, lower), b)
print(f"\\nSolution x = {x.round(4)}")
print(f"Residual ‖Ax-b‖ = {np.linalg.norm(A_spd @ x - b):.1e}")`,
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'QR for least squares: avoid squaring the condition number',
              prose: ['Normal equations A^T A x = A^T b square the condition number. QR avoids this by working with Q^T b and R directly.'],
              code: `# Overdetermined system: 4 equations, 2 unknowns
A_over = np.array([[1., 0.],
                   [1., 1.],
                   [1., 2.],
                   [1., 3.]])
b_over = np.array([1., 2., 3., 3.5])

# Method 1: Normal equations (simple but condition number is squared)
ATA = A_over.T @ A_over
ATb = A_over.T @ b_over
x_normal = np.linalg.solve(ATA, ATb)
print(f"Normal equations solution: {x_normal.round(4)}")
print(f"κ(A):   {np.linalg.cond(A_over):.2f}")
print(f"κ(AᵀA): {np.linalg.cond(ATA):.2f}  (squared!)")

# Method 2: QR (preferred — works with original condition number)
Q, R = scipy.linalg.qr(A_over, mode='economic')  # thin QR: Q is 4×2, R is 2×2
print(f"\\nQ shape: {Q.shape}, R shape: {R.shape}")
# Solve triangular: R x = Qᵀ b
Qtb = Q.T @ b_over
x_qr = scipy.linalg.solve_triangular(R, Qtb)
print(f"QR solution:              {x_qr.round(4)}")
print(f"Same answer: {np.allclose(x_normal, x_qr)}")`,
              status: 'idle',
            },
            {
              id: 4,
              cellTitle: 'Choosing between LU, Cholesky, and QR',
              prose: ['A single function that selects the right factorization based on matrix properties.'],
              code: `def smart_solve(A, b):
    """Choose LU, Cholesky, or lstsq based on A's shape and structure."""
    m, n = A.shape

    if m != n:
        # Rectangular — use lstsq (internally uses QR or SVD)
        x, _, _, _ = np.linalg.lstsq(A, b, rcond=None)
        method = "lstsq (overdetermined)"
        return x, method

    # Square — check if SPD (symmetric and positive definite)
    is_symmetric = np.allclose(A, A.T)
    if is_symmetric:
        try:
            c, lower = scipy.linalg.cho_factor(A)
            x = scipy.linalg.cho_solve((c, lower), b)
            return x, "Cholesky (SPD detected)"
        except scipy.linalg.LinAlgError:
            pass  # Not positive definite — fall through to LU

    # General square
    lu, piv = scipy.linalg.lu_factor(A)
    x = scipy.linalg.lu_solve((lu, piv), b)
    return x, "LU (general square)"

# Test on each type
for A_test, b_test, label in [
    (np.array([[4.,2.],[2.,3.]]), np.array([8.,7.]), "2×2 SPD"),
    (np.array([[4.,3.],[6.,3.]]), np.array([10.,12.]), "2×2 general"),
    (np.array([[1.,0.],[1.,1.],[1.,2.]]), np.array([1.,2.,3.5]), "3×2 overdetermined"),
]:
    x, method = smart_solve(A_test, b_test)
    print(f"{label:20s} → {method}")`,
              status: 'idle',
            },
          ],
        },
      },
    ],
  },

  math: {
    keyEquations: [
      { label: 'LU factorization with pivoting', equation: 'PA = LU' },
      { label: 'Cholesky factorization (SPD)', equation: 'A = LL^\\top' },
      { label: 'QR least squares solve', equation: 'A = QR \\Rightarrow R\\hat{\\mathbf{x}} = Q^\\top\\mathbf{b}' },
      { label: 'Condition number squaring in normal equations', equation: '\\kappa(A^\\top A) = \\kappa(A)^2' },
    ],
  },

  walkthroughs: [
    {
      id: 'wt-la5-005-lu-reuse',
      title: 'LU Factor-Once Pattern: When and Why',
      prereqs: ['LU factorization', 'Triangular solve', 'Computational complexity'],
      problem: 'You need to solve $A\\mathbf{x} = \\mathbf{b}_1$, $A\\mathbf{x}=\\mathbf{b}_2$, $A\\mathbf{x}=\\mathbf{b}_3$ for $A\\in\\mathbb{R}^{n\\times n}$. Walk through the factor-once pattern and explain each step\'s cost.',
      steps: [
        {
          label: 'Recognize the pattern: same A, different b',
          strategy: 'Any time you solve $Ax=b$ more than once with the same $A$, factor-once is appropriate. Look for: loops over right-hand sides, Kalman filter updates, multi-load structural analysis, parameter sweeps.',
          explanation: 'The key observation: `np.linalg.solve(A, b)` internally calls `lu_factor` + `lu_solve` every time. If A doesn\'t change, re-factoring is pure waste. Separating the steps exposes the factorization for reuse.',
          math: '\\text{naive: } k\\cdot O(n^3)\\quad\\text{vs}\\quad\\text{reuse: } O(n^3) + k\\cdot O(n^2)',
        },
        {
          label: 'Call `lu_factor(A)`: what is stored and what does pivoting mean?',
          strategy: '`lu, piv = scipy.linalg.lu_factor(A)` computes $PA=LU$ using partial pivoting. The result is a compact storage format: both L (unit lower triangular) and U (upper triangular) are packed into a single n×n array.',
          explanation: '`lu` is an n×n array where the upper triangle (including diagonal) stores U, and the strictly lower triangle stores L (without the implicit 1s on the diagonal). `piv` is an integer array of length n recording the row permutations. This compact format avoids allocating two separate n×n matrices.',
          math: 'PA = LU,\\quad\\text{stored as packed } (L,U)\\text{ array}',
        },
        {
          label: 'Call `lu_solve((lu, piv), b)` for each right-hand side',
          strategy: '`lu_solve` does two O(n²) triangular solves: forward substitution ($L\\mathbf{y}=P\\mathbf{b}$) then backward substitution ($U\\mathbf{x}=\\mathbf{y}$). No factoring.',
          explanation: 'Step 1: Apply permutation: $\\mathbf{c} = P\\mathbf{b}$ (row swap, O(n)). Step 2: Forward solve $L\\mathbf{y}=\\mathbf{c}$ (O(n²)). Step 3: Backward solve $U\\mathbf{x}=\\mathbf{y}$ (O(n²)). Total O(n²) per right-hand side.',
          math: 'L\\mathbf{y} = P\\mathbf{b} \\Rightarrow U\\mathbf{x} = \\mathbf{y} \\quad O(n^2)',
          gotcha: 'Do NOT modify A between `lu_factor` and `lu_solve` calls. The `lu` array contains a reference-like dependency on the original matrix structure. If A changes (e.g., you\'re doing iterative refinement), re-call `lu_factor` before the next `lu_solve`.',
        },
      ],
    },
    {
      id: 'wt-la5-005-cholesky-vs-lu',
      title: 'Cholesky vs LU: The SPD Advantage',
      prereqs: ['Positive definite matrices', 'Cholesky factorization', 'LU factorization'],
      problem: 'A ridge regression problem requires solving $(A^\\top A + \\lambda I)\\mathbf{x} = A^\\top\\mathbf{b}$ for the same coefficient matrix with many different $\\lambda$ values. Choose between LU and Cholesky and explain why.',
      steps: [
        {
          label: 'Recognize $A^\\top A + \\lambda I$ as SPD',
          strategy: 'For any $\\lambda > 0$, $A^\\top A + \\lambda I$ is symmetric (obvious) and positive definite (for any x≠0: x^T(AᵀA+λI)x = ‖Ax‖²+λ‖x‖² > 0). This unlocks Cholesky.',
          explanation: '`np.allclose(M, M.T)` verifies symmetry. `np.all(np.linalg.eigvalsh(M) > 0)` verifies positive definiteness, but Cholesky itself is a faster test: if it succeeds, M is SPD.',
          math: '\\mathbf{x}^\\top(A^\\top A + \\lambda I)\\mathbf{x} = \\|A\\mathbf{x}\\|^2 + \\lambda\\|\\mathbf{x}\\|^2 > 0 \\quad (\\lambda>0)',
        },
        {
          label: 'Use `cho_factor` and `cho_solve` for the reuse pattern',
          strategy: 'Cholesky reuse pattern: `c, lower = scipy.linalg.cho_factor(M); x = scipy.linalg.cho_solve((c, lower), b)`. Same structure as LU reuse, 2× faster for SPD.',
          explanation: 'Cholesky processes only the lower triangle — roughly half the work of LU. For n=1000, this is approximately 500M flops vs 1B for LU. At scale, this difference is meaningful.',
          math: 'A = LL^\\top,\\quad L\\mathbf{y}=\\mathbf{b}\\Rightarrow L^\\top\\mathbf{x}=\\mathbf{y}',
          gotcha: '`scipy.linalg.cho_factor` has a `lower=True/False` parameter selecting which triangle to use. Always pass `lower=True` explicitly (the default varies by version). Then pass the same `lower` flag to `cho_solve`. Mixing lower/upper between the two calls gives wrong answers silently.',
        },
      ],
    },
  ],

  examples: [
    {
      id: 'la5-005-ex1',
      title: 'Testing if a Matrix is Positive Definite via Cholesky',
      problem: 'The matrix $A=\\begin{bmatrix}2&3\\\\3&4\\end{bmatrix}$ is symmetric. Is it positive definite? Use Cholesky to check.',
      solution: 'Cholesky raises LinAlgError for non-SPD matrices. Try cho_factor: eigenvalues are 6.16 and -0.16 (one negative) → fails. For A to be SPD, all eigenvalues must be positive.',
      steps: [
        'Check symmetry: `np.allclose(A, A.T)` → True.',
        'Attempt: `scipy.linalg.cho_factor(A)` → raises `LinAlgError: Matrix is not positive definite`.',
        'Confirm: `np.linalg.eigvalsh(A)` → [-0.16, 6.16]. One negative eigenvalue → not SPD.',
        'Conclusion: symmetric does NOT imply positive definite. Both conditions required for Cholesky.',
      ],
    },
    {
      id: 'la5-005-ex2',
      title: 'QR with Column Pivoting for Rank-Deficient Least Squares',
      problem: 'Solve the overdetermined system with a rank-deficient coefficient matrix using QR with pivoting.',
      solution: 'scipy.linalg.qr(A, pivoting=True) returns Q, R, P (column permutation). If R[k,k] is near zero, the column P[k] is redundant. Use `scipy.linalg.lstsq` which handles this internally.',
      steps: [
        'Build a 4×3 matrix where column 3 = column 1 + column 2 (rank 2).',
        '`Q, R, P = scipy.linalg.qr(A, pivoting=True)` → R[2,2] ≈ 0.',
        'Detect rank: `np.sum(np.abs(np.diag(R)) > 1e-10)` = 2.',
        'For the actual solve, use `lstsq` which uses SVD internally and handles rank deficiency correctly.',
      ],
    },
  ],

  challenges: [
    {
      id: 'la5-005-ch1',
      title: 'Kalman filter update',
      difficulty: 'hard',
      challengeType: 'write',
      prompt: 'Implement one Kalman filter update step using Cholesky for the innovation covariance inversion. The innovation covariance is $S = H P H^\\top + R$ where P is the state covariance (SPD) and R is the measurement noise (SPD). Use `cho_factor` + `cho_solve` to compute the Kalman gain $K = P H^\\top S^{-1}$ without explicitly inverting S.',
      hint: 'K = (S^{-T} @ (H @ P^T))^T. In practice: `K = cho_solve(cho_factor(S), H @ P).T` — verify with a small example.',
    },
    {
      id: 'la5-005-ch2',
      title: 'Factorization benchmark',
      difficulty: 'medium',
      challengeType: 'write',
      prompt: 'For n=200, time (using `time.perf_counter`) three approaches: (1) 50 calls to `np.linalg.solve(A, b)`, (2) one `lu_factor` + 50 `lu_solve` calls, and (3) one `cho_factor` + 50 `cho_solve` calls (using an SPD matrix). Report the timing ratio between approach 1 and approaches 2 and 3.',
      hint: 'Generate SPD A: `U = np.random.randn(n,n); A = U.T @ U + n * np.eye(n)`. Generate 50 random b vectors with `np.random.randn(n, 50)` and iterate over columns.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathtt{scipy.linalg.lu\\_factor}(A)', meaning: 'Computes PA=LU factorization once ($O(n^3)$). Returns (lu, piv) packed representation. Pair with lu_solve for reuse.' },
      { symbol: '\\mathtt{scipy.linalg.lu\\_solve}((lu, piv), b)', meaning: 'Solves Ax=b using precomputed LU factorization. Cost: $O(n^2)$. Two triangular solves (forward + backward substitution).' },
      { symbol: '\\mathtt{scipy.linalg.cho\\_factor}(A)', meaning: 'Cholesky factorization A=LLᵀ for SPD A. ~2× faster than LU. Raises LinAlgError if A is not positive definite.' },
      { symbol: '\\mathtt{scipy.linalg.qr}(A, \\mathtt{mode=\\'economic\\'})', meaning: 'Thin QR factorization. Q is m×n, R is n×n upper triangular. Use for least squares (solve Rx = Qᵀb) and avoids squaring the condition number.' },
    ],
    rulesOfThumb: [
      'Same A, multiple b? Factor once with lu_factor/cho_factor.',
      'Symmetric positive definite? Always prefer Cholesky — 2× faster.',
      'Overdetermined? Use QR or lstsq — never form AᵀA explicitly.',
      'Cholesky failure = A is not SPD (useful as a test).',
      'κ(AᵀA) = κ(A)² — avoid normal equations for poorly-conditioned A.',
    ],
  },

  quiz: [
    {
      id: 'la5-005-q1',
      question: 'You call `scipy.linalg.cho_factor(A)` and it raises `LinAlgError`. What does this tell you?',
      options: [
        'A is singular (has a zero eigenvalue)',
        'A is not positive definite (has a zero or negative eigenvalue)',
        'A is not symmetric',
        'A is too large for Cholesky decomposition',
      ],
      answer: 1,
      explanation: 'Cholesky fails specifically when A is not positive definite — i.e., it has zero or negative eigenvalues. It does NOT directly test for symmetry (you pass that implicitly). A symmetric matrix with all positive eigenvalues will succeed; with any non-positive eigenvalue, it fails.',
    },
    {
      id: 'la5-005-q2',
      question: 'Why is solving least squares via the normal equations $A^\\top A \\mathbf{x} = A^\\top\\mathbf{b}$ numerically risky for ill-conditioned A?',
      options: [
        'The normal equations have more unknowns than equations.',
        'Forming AᵀA squares the condition number, so κ(AᵀA) = κ(A)², losing twice as many significant digits.',
        'AᵀA is never invertible for overdetermined systems.',
        'The normal equations only work when m = 2n.',
      ],
      answer: 1,
      explanation: 'Condition number measures sensitivity to perturbations. If κ(A) = 10⁴, you lose 4 digits of precision solving a system with A. But κ(AᵀA) = κ(A)² = 10⁸, so solving the normal equations loses 8 digits. QR avoids forming AᵀA and works directly with κ(A).',
    },
  ],
}
