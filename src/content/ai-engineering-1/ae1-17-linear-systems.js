export default {
  id: 'ae-p1-17-linear-systems',
  slug: 'linear-systems',
  chapter: 'ae-p1',
  order: 16,
  title: 'Linear Systems',
  subtitle: 'Solving Ax = b is the oldest problem in mathematics that still runs your neural network.',
  tags: ['linear-systems', 'gaussian-elimination', 'LU', 'Cholesky', 'least-squares', 'condition-number', 'ridge-regression', 'normal-equations'],

  hook: {
    question: 'Every call to sklearn\'s LinearRegression.fit() solves a linear system. What system is it solving, and why can adding a single line of regularization make it 10¹⁰ times more numerically stable?',
    realWorldContext:
      'The equation Ax = b appears everywhere in ML. In linear regression, A is your data matrix, b is your target vector, and x is the weight vector you want to find. In Gaussian processes, A is the kernel matrix and you need to both solve Ay = b and compute log det(A). When you add regularization (ridge regression), you modify the system to (A + λI)x = b. The condition number of A determines whether your solution is trustworthy — a condition number of 10¹⁶ means the answer is numerical noise. Understanding which solver to use and why is the difference between ML code that works and ML code that silently returns garbage.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The column picture of Ax = b is the right way to think about linear systems. Each column of A is a vector. The question is: what linear combination of those column vectors produces b? If A has columns c₁, c₂, ..., cₙ, and x has entries x₁, x₂, ..., xₙ, then Ax = x₁c₁ + x₂c₂ + ... + xₙcₙ. The system has a solution iff b lies in the span of A\'s columns (the column space). Three outcomes: one solution (A is full rank, b is in the column space), no solution (b is outside the column space — overdetermined), infinite solutions (A has a null space — underdetermined). Most ML problems are overdetermined: more data points than parameters. No exact solution exists, so you find the best approximation. That is least squares.',
      'Gaussian elimination with partial pivoting: transform Ax = b into an upper triangular system Ux = c, then back-substitute. For each column k (the pivot column): (1) find the row with the largest absolute value in column k at or below row k — swap that row up (partial pivoting); (2) for each row below k, subtract a multiple of row k to zero out that entry. Partial pivoting prevents disaster when the pivot is small: without it, a pivot of 0.001 forces a multiplier of 1000, amplifying floating-point errors by 1000×. With pivoting, multipliers stay ≤ 1. Cost: O(n³) for elimination, O(n²) for back substitution.',
      'LU decomposition: Gaussian elimination builds two matrices simultaneously. L stores the multipliers used during elimination (lower triangular, 1s on diagonal). U is the result after elimination (upper triangular). Then A = L·U (or P·A = L·U with row swaps). Why factor instead of just eliminating? Because once you have L and U, solving Ax = b for ANY new b costs only O(n²): solve Ly = b (forward substitution), then Ux = y (back substitution). The O(n³) cost is paid once. If you have 1000 different b vectors with the same A, LU saves a factor of ~333 in total work.',
      'QR decomposition: factor A into Q (orthogonal: Q^T Q = I, columns are orthonormal vectors) and R (upper triangular). Solving Ax = b: QRx = b → Rx = Q^T·b → back substitute. QR is more stable than LU for least-squares problems because Q preserves lengths and angles — multiplication by Q doesn\'t amplify errors. The Gram-Schmidt process builds Q column by column: remove the component of each new vector along all previous Q columns, then normalize. Each step ensures the new column is orthogonal to all previous ones.',
      'Cholesky decomposition: when A is symmetric (A = A^T) and positive definite (all eigenvalues > 0), factor A = L·L^T where L is lower triangular. Half the cost of LU (O(n³/3)), half the storage. Works ONLY for symmetric positive definite matrices, but those appear constantly in ML: covariance matrices, kernel matrices in Gaussian processes, A^T·A + λI in ridge regression. In Gaussian processes: solve K·α = y with Cholesky, compute log det(K) = 2·Σlog(diag(L)). The condition that A is positive definite is checked during factorization — if L[i][i]² < 0, factorization fails, telling you the matrix is not positive definite.',
      'Least squares — when Ax = b has no exact solution: minimize ‖Ax − b‖² over x. The minimizer satisfies the normal equations: A^T·A·x = A^T·b. Derivation: ‖Ax−b‖² = (Ax−b)^T(Ax−b) = x^T A^T Ax − 2x^T A^T b + const. Gradient = 2A^T Ax − 2A^T b = 0 → A^T Ax = A^T b. This IS linear regression: your data matrix X has one row per sample. X^T X w = X^T y. Solution: w = (X^T X)⁻¹ X^T y. Every call to `sklearn.LinearRegression.fit()` computes this (or an equivalent via QR or SVD). Add λI to get ridge regression: (X^T X + λI)w = X^T y. This system is always solvable via Cholesky when λ > 0.',
      'Condition number: κ(A) = σ_max/σ_min (ratio of largest to smallest singular value). Measures how sensitive the solution is to small changes in b or A. If b changes by ε, x can change by up to κ·ε. In float64 (~15 decimal digits of precision), you lose about log₁₀(κ) digits. κ = 100: safe. κ = 10⁸: you trust about 7 digits. κ = 10¹⁶: the answer is meaningless. Ill-conditioning in ML: features that are nearly collinear make X^T X nearly singular → κ explodes. Regularization helps: (X^T X + λI) has κ = (σ_max + λ)/(σ_min + λ). For small σ_min and λ >> σ_min, this reduces to approximately σ_max/λ — much smaller than σ_max/σ_min.',
      'Which solver to use: Gaussian elimination → one-off solve of a square system. LU decomposition → multiple solves with the same A. QR → least-squares, numerically stable. Cholesky → symmetric positive definite A (covariance, kernel, ridge). Normal equations → linear regression for small feature counts. SVD/pseudoinverse → rank-deficient systems, minimum-norm solutions. Conjugate gradient → very large sparse symmetric positive definite systems (millions of unknowns). The condition number of your matrix determines which method is trustworthy.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Normal equations ARE linear regression',
        body: 'The closed-form solution to linear regression minimizes Σ(yᵢ − wᵀxᵢ)² over w. Taking the gradient and setting it to zero gives:\n\nX^T X w = X^T y\nw = (X^T X)⁻¹ X^T y\n\nThis is the normal equations. sklearn\'s LinearRegression does exactly this (via QR internally for numerical stability). Ridge regression adds λI:\n\n(X^T X + λI) w = X^T y\n\nλ > 0 guarantees X^T X + λI is positive definite → solvable via Cholesky → always a unique solution.',
      },
      {
        type: 'insight',
        title: 'Why Cholesky is preferred for covariance and kernel matrices',
        body: 'Covariance matrices Σ and kernel matrices K are ALWAYS symmetric positive semi-definite (positive definite after adding a small δI for numerical stability). Cholesky exploits both properties:\n- Symmetric → only compute and store the lower triangle (half the work + half the memory vs LU)\n- Positive definite → L[i][i] = sqrt(positive number) never fails\n- Twice as fast as LU: O(n³/3) vs O(2n³/3)\n- Log-determinant for free: log det(K) = 2·Σᵢlog(L[i][i])\n\nIn Gaussian processes, you need both the solution K⁻¹y AND log det(K) for the marginal likelihood. Cholesky gives you both in one factorization.',
      },
      {
        type: 'procedure',
        title: 'Diagnosing and fixing ill-conditioned systems',
        steps: [
          'Compute the condition number κ = σ_max / σ_min (via SVD)',
          'If κ > 10¹² and you are using float64: your solution is unreliable',
          'Check for nearly collinear features: pairwise correlations close to ±1',
          'Add regularization: solve (A + λI)x = b instead of Ax = b',
          'Start with λ = 10⁻³ and decrease until the solution stops changing significantly',
          'Report κ(A + λI) — if still > 10⁸, increase λ further',
        ],
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        type: 'PythonNotebook',
        cells: [
          {
            id: 1,
            prose: [
              'Gaussian elimination with partial pivoting: the foundational O(n³) algorithm for solving Ax = b. Build it from scratch to see exactly how row operations eliminate unknowns one by one.',
              'Partial pivoting is the key numerical stability trick: before eliminating in column k, find the row with the largest absolute value and swap it to position k. This keeps the multipliers small (≤ 1) and prevents error amplification.',
              'After elimination you have an upper triangular system — solve it by back substitution: the last equation has one unknown, solve it, substitute into the second-to-last, and so on.',
            ],
            code: `import math

def gaussian_elimination(A, b):
    """Solve Ax = b via Gaussian elimination with partial pivoting."""
    n = len(b)
    # Augmented matrix [A | b] — work on a copy
    Ab = [row[:] + [b[i]] for i, row in enumerate(A)]

    for k in range(n):
        # Partial pivoting: find row with largest |A[i][k]| for i >= k
        max_row = k
        for i in range(k+1, n):
            if abs(Ab[i][k]) > abs(Ab[max_row][k]):
                max_row = i
        Ab[k], Ab[max_row] = Ab[max_row], Ab[k]

        if abs(Ab[k][k]) < 1e-12:
            raise ValueError(f"Singular or nearly singular at pivot {k}")

        # Eliminate column k in all rows below k
        for i in range(k+1, n):
            m = Ab[i][k] / Ab[k][k]     # multiplier: how much of row k to subtract
            for j in range(k, n+1):
                Ab[i][j] -= m * Ab[k][j]

    # Back substitution: solve from last row up
    x = [0.0] * n
    for i in range(n-1, -1, -1):
        x[i] = Ab[i][n]
        for j in range(i+1, n):
            x[i] -= Ab[i][j] * x[j]
        x[i] /= Ab[i][i]
    return x

# Example: 3x3 system
A = [[2, 1, 1],
     [4, 3, 3],
     [2, 3, 1]]
b = [8, 20, 12]

x = gaussian_elimination(A, b)
print(f"Solution: x = {[round(v, 4) for v in x]}")

# Verify: compute Ax and compare to b
Ax = [sum(A[i][j]*x[j] for j in range(3)) for i in range(3)]
print(f"Ax     = {[round(v, 4) for v in Ax]}")
print(f"b      = {b}")
print(f"Max error: {max(abs(Ax[i]-b[i]) for i in range(3)):.2e}")`,
          },
          {
            id: 2,
            prose: [
              'The normal equations connect least squares to linear regression. When Ax = b has no exact solution (overdetermined: more rows than columns), the least-squares solution minimizes ‖Ax − b‖². Setting the gradient to zero gives A^T A x = A^T b.',
              'This is linear regression in matrix form. X is your data matrix (one row per sample, one column per feature). y is your target. The weight vector w = (X^T X)⁻¹ X^T y minimizes the sum of squared errors across all training examples.',
              'See how the normal equations reduce a 4×2 overdetermined system to a 2×2 solvable system, then verify the weights produce the correct trend through the data.',
            ],
            code: `import math

def matrix_multiply(A, B):
    """Multiply matrix A (m x k) by B (k x n)."""
    m, k, n = len(A), len(B), len(B[0])
    return [[sum(A[i][j]*B[j][c] for j in range(k)) for c in range(n)] for i in range(m)]

def transpose(A):
    return [[A[j][i] for j in range(len(A))] for i in range(len(A[0]))]

def gaussian_elimination(A, b):
    n = len(b)
    Ab = [row[:] + [b[i]] for i, row in enumerate(A)]
    for k in range(n):
        max_row = max(range(k, n), key=lambda i: abs(Ab[i][k]))
        Ab[k], Ab[max_row] = Ab[max_row], Ab[k]
        for i in range(k+1, n):
            m = Ab[i][k] / Ab[k][k]
            for j in range(k, n+1):
                Ab[i][j] -= m * Ab[k][j]
    x = [0.0] * n
    for i in range(n-1, -1, -1):
        x[i] = Ab[i][n]
        for j in range(i+1, n):
            x[i] -= Ab[i][j] * x[j]
        x[i] /= Ab[i][i]
    return x

# Data: 4 points, trying to fit y = w0 + w1*x
# Overdetermined: 4 equations, 2 unknowns
data_x = [1.0, 2.0, 3.0, 4.0]
data_y = [3.1, 4.9, 6.8, 9.2]

# Build design matrix X with intercept column
X = [[1.0, xi] for xi in data_x]   # shape (4, 2)
y = data_y

# Normal equations: X^T X w = X^T y
Xt   = transpose(X)
XtX  = matrix_multiply(Xt, X)         # (2, 2)
Xty  = [sum(Xt[i][j]*y[j] for j in range(len(y))) for i in range(2)]  # (2,)

w = gaussian_elimination(XtX, Xty)
print(f"Fitted weights: intercept = {w[0]:.4f}, slope = {w[1]:.4f}")
print(f"True trend: intercept ≈ 1, slope ≈ 2")

# Predictions and residuals
preds = [w[0] + w[1]*xi for xi in data_x]
residuals = [yi - pi for yi, pi in zip(data_y, preds)]
print(f"\\nPredictions: {[round(p,3) for p in preds]}")
print(f"Targets:     {data_y}")
print(f"Residuals:   {[round(r,4) for r in residuals]}")
sse = sum(r**2 for r in residuals)
print(f"Sum of squared errors: {sse:.4f}")`,
          },
          {
            id: 3,
            prose: [
              'The condition number is the most important diagnostic for a linear system. It tells you how many digits of your solution you can trust.',
              'In float64 (~15 decimal digits), you lose approximately log₁₀(κ) digits of precision. A condition number of 10⁸ means you trust about 7 digits. κ = 10¹⁵ means the answer is complete noise.',
              'Regularization (adding λI) dramatically improves conditioning. Watch how a nearly singular matrix with κ = 10¹⁰ becomes well-conditioned after adding a small λI, and how the solution quality changes.',
            ],
            code: `import math

def dot(v, w):
    return sum(a*b for a, b in zip(v, w))

def mat_vec(A, x):
    return [dot(row, x) for row in A]

def transpose(A):
    return [[A[j][i] for j in range(len(A))] for i in range(len(A[0]))]

def gaussian_elimination(A, b):
    n = len(b)
    Ab = [row[:] + [b[i]] for i, row in enumerate(A)]
    for k in range(n):
        max_row = max(range(k, n), key=lambda i: abs(Ab[i][k]))
        Ab[k], Ab[max_row] = Ab[max_row], Ab[k]
        if abs(Ab[k][k]) < 1e-20:
            return None  # singular
        for i in range(k+1, n):
            m = Ab[i][k] / Ab[k][k]
            for j in range(k, n+1):
                Ab[i][j] -= m * Ab[k][j]
    x = [0.0] * n
    for i in range(n-1, -1, -1):
        x[i] = Ab[i][n]
        for j in range(i+1, n):
            x[i] -= Ab[i][j] * x[j]
        x[i] /= Ab[i][i]
    return x

def residual_norm(A, x, b):
    Ax = mat_vec(A, x)
    return math.sqrt(sum((Ax[i]-b[i])**2 for i in range(len(b))))

# Nearly singular 2x2 matrix: columns almost identical
# A = [[1, 1], [1, 1+eps]] — tiny eps makes the matrix ill-conditioned
eps = 1e-8
A_ill = [[1.0,     1.0    ],
         [1.0,     1.0+eps]]
b_vec = [2.0, 2.0 + eps]   # true solution: x = [1, 1]

x_ill = gaussian_elimination(A_ill, b_vec)
print(f"Ill-conditioned system (eps={eps}):")
print(f"  Solution: x = {[f'{v:.4f}' for v in x_ill]}")
print(f"  Residual: {residual_norm(A_ill, x_ill, b_vec):.2e}")

# Regularization: add lambda * I
for lam in [1e-8, 1e-4, 1e-2]:
    A_reg = [[A_ill[i][j] + (lam if i==j else 0) for j in range(2)] for i in range(2)]
    x_reg = gaussian_elimination(A_reg, b_vec)
    err = math.sqrt(sum((x_reg[i]-1.0)**2 for i in range(2)))
    print(f"  lambda={lam:.0e}  solution={[f'{v:.4f}' for v in x_reg]}  error from [1,1]: {err:.4f}")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement Cholesky decomposition for a symmetric positive definite matrix. Then use it to solve ridge regression: given data X and targets y, solve (X^T X + λI)w = X^T y. Test with a 4×2 data matrix and λ = 0.5.',
            starterCode: `import math

def cholesky(A):
    """
    Factor symmetric positive definite matrix A = L @ L^T.
    L is lower triangular. Return L.

    L[i][i] = sqrt(A[i][i] - sum(L[i][k]^2 for k < i))
    L[i][j] = (A[i][j] - sum(L[i][k]*L[j][k] for k < j)) / L[j][j]  for i > j
    """
    n = len(A)
    L = [[0.0]*n for _ in range(n)]
    # TODO: fill in L row by row
    return L

def forward_sub(L, b):
    """Solve Ly = b where L is lower triangular."""
    n = len(b)
    y = [0.0]*n
    for i in range(n):
        y[i] = (b[i] - sum(L[i][k]*y[k] for k in range(i))) / L[i][i]
    return y

def back_sub(U, y):
    """Solve Ux = y where U is upper triangular."""
    n = len(y)
    x = [0.0]*n
    for i in range(n-1, -1, -1):
        x[i] = (y[i] - sum(U[i][k]*x[k] for k in range(i+1, n))) / U[i][i]
    return x

def cholesky_solve(A, b):
    """Solve Ax = b when A is symmetric positive definite."""
    L = cholesky(A)
    Lt = [[L[j][i] for j in range(len(A))] for i in range(len(A))]  # L^T
    y = forward_sub(L, b)
    return back_sub(Lt, y)

# Test: ridge regression on 4 samples, 2 features
X = [[1.0, 1.0],
     [1.0, 2.0],
     [1.0, 3.0],
     [1.0, 4.0]]
y = [3.0, 5.0, 7.0, 9.0]   # true: intercept=1, slope=2
lam = 0.5

# TODO: compute XtX, Xty, add lam*I to XtX, then call cholesky_solve
`,
            hint: 'For Cholesky: L[i][i] = sqrt(A[i][i] - sum(L[i][k]**2 for k in range(i))); for j < i: L[i][j] = (A[i][j] - sum(L[i][k]*L[j][k] for k in range(j))) / L[j][j]. For XtX: it is 2×2, compute it manually or with nested loops.',
            testCode: `try:
    assert L is not None and len(L) == 2
    # Check L @ L^T = original 2x2 matrix
    XtX_reg = [[XtX[i][j] + (lam if i==j else 0) for j in range(2)] for i in range(2)]
    LLt = [[sum(L[i][k]*L[j][k] for k in range(2)) for j in range(2)] for i in range(2)]
    err = max(abs(LLt[i][j] - XtX_reg[i][j]) for i in range(2) for j in range(2))
    assert err < 1e-8, f"L @ L^T != A, error {err:.2e}"
    print(f"PASS: Cholesky correct, L @ L^T = A  (max error {err:.2e})")
    print(f"Ridge weights: w = {[round(v,4) for v in w]}")
    print(f"Expected: intercept < 1, slope < 2 (regularization shrinks toward 0)")
except Exception as e:
    print(f"FAIL: {e}")`,
          },
        ],
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What does it mean geometrically when a system Ax = b has no exact solution?',
      options: [
        'The matrix A has all zero entries',
        'The vector b does not lie in the column space of A',
        'The system has more unknowns than equations',
        'The matrix A is symmetric',
      ],
      answer: 'The vector b does not lie in the column space of A',
      hints: [
        'Ax = b asks: what linear combination of A\'s columns produces b?',
        'If b is not in the span of those columns, no combination works — but least squares finds the closest point that is in the column space',
      ],
      reviewSection: 'Column Picture vs Row Picture',
    },
    {
      type: 'choice',
      question: 'Why is partial pivoting used in Gaussian elimination?',
      options: [
        'It reduces the time complexity from O(n³) to O(n²)',
        'It selects the largest available pivot to minimize error amplification from dividing by small numbers',
        'It ensures the result is always an integer',
        'It eliminates the need for back substitution',
      ],
      answer: 'It selects the largest available pivot to minimize error amplification from dividing by small numbers',
      hints: [
        'Without pivoting, a small pivot forces a large multiplier — errors get amplified by that factor',
        'The largest pivot minimizes the multiplier magnitudes and keeps floating-point errors small',
      ],
      reviewSection: 'Partial Pivoting',
    },
    {
      type: 'choice',
      question: 'Why is Cholesky decomposition preferred over LU for solving (X^T X + λI)w = X^T y in ridge regression?',
      options: [
        'Cholesky works on any matrix while LU requires square matrices',
        'The matrix X^T X + λI is symmetric positive definite, so Cholesky is twice as fast as LU and requires half the storage',
        'Cholesky gives a more accurate answer than LU',
        'LU decomposition cannot handle regularization terms',
      ],
      answer: 'The matrix X^T X + λI is symmetric positive definite, so Cholesky is twice as fast as LU and requires half the storage',
      hints: [
        'X^T X is always symmetric and positive semi-definite. Adding λI (λ > 0) makes it strictly positive definite',
        'Cholesky exploits symmetry by computing only the lower triangle: O(n³/3) vs LU\'s O(2n³/3)',
      ],
      reviewSection: 'Cholesky Decomposition',
    },
    {
      type: 'choice',
      question: 'A matrix has condition number κ = 10⁸. You are using float64 (~15 digits of precision). How many digits of the solution can you trust?',
      options: [
        'About 15 digits',
        'About 7 digits (15 − log₁₀(10⁸) = 15 − 8)',
        'About 8 digits',
        'Zero digits — the solution is meaningless',
      ],
      answer: 'About 7 digits (15 − log₁₀(10⁸) = 15 − 8)',
      hints: [
        'You lose approximately log₁₀(κ) digits of precision due to floating-point rounding during elimination',
        '15 available digits minus 8 lost to conditioning = 7 trustworthy digits',
      ],
      reviewSection: 'Condition Number',
    },
    {
      type: 'choice',
      question: 'What is the main advantage of LU decomposition over Gaussian elimination when you need to solve Ax = b for many different b vectors?',
      options: [
        'LU decomposition is more numerically stable',
        'The O(n³) factorization is done once; each subsequent solve with a new b costs only O(n²)',
        'LU decomposition works on rectangular matrices',
        'LU always produces a unique solution',
      ],
      answer: 'The O(n³) factorization is done once; each subsequent solve with a new b costs only O(n²)',
      hints: [
        'Gaussian elimination redoes the full O(n³) work for every new b',
        'LU stores L and U after the first solve; new b vectors just need forward substitution (Ly = b) and back substitution (Ux = y), each O(n²)',
      ],
      reviewSection: 'LU Decomposition',
    },
  ],
}
