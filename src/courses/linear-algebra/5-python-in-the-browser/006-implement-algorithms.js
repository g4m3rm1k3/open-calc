export default {
  id: 'la5-006',
  slug: 'implement-algorithms',
  chapter: 'la5',
  order: 6,
  title: 'Implementing Algorithms from Scratch',
  subtitle: 'Build Gram-Schmidt, power iteration, and Jacobi iteration — then compare to NumPy/SciPy to see exactly what the library does differently.',
  tags: ['python', 'numpy', 'algorithms', 'gram-schmidt', 'power iteration', 'jacobi', 'numerical methods'],
  aliases: 'gram schmidt implementation power iteration jacobi numpy from scratch numerical algorithms convergence QR',

  hook: {
    question: 'NumPy\'s `qr`, `eig`, and `solve` each perform tasks you\'ve used in one line. What happens if you implement them yourself — and why is the library version different?',
    realWorldContext: 'Understanding what\'s inside the black box is what separates a scientist who uses linear algebra from an engineer who can extend it. When your application needs a custom stopping criterion, a modified inner product, or a domain-specific preconditioner, you cannot rely on the library implementation. Building algorithms from scratch reveals the gap between "mathematically equivalent" and "numerically stable" — and gives you the intuition to choose correctly under pressure.',
  },

  intuition: {
    prose: [
      '**Classical vs Modified Gram-Schmidt:** Both compute the same Q in exact arithmetic. In floating-point, classical GS can lose orthogonality catastrophically when columns are nearly parallel. Modified GS projects against each new vector as it\'s being built (not after), accumulating less rounding error. NumPy\'s QR uses Householder reflections — even more stable than modified GS, but harder to read.',
      '**Power iteration vs eig:** Power iteration finds ONE dominant eigenpair, converges at rate (λ₂/λ₁). It\'s all you need for PageRank, spectral clustering, or any application wanting the top component. `eig` finds ALL eigenpairs at O(n³). When n=10⁶ and you only need 5 eigenvectors, `scipy.sparse.linalg.eigsh` (Lanczos algorithm) is the library\'s answer.',
      '**Jacobi vs np.linalg.solve:** Jacobi iteration is the simplest iterative solver — update each variable using the old values of all others. It only converges if A is diagonally dominant ($|a_{ii}| > \\sum_{j\\neq i}|a_{ij}|$). It converges slowly but is trivially parallelizable. `np.linalg.solve` (LU) always works for non-singular A; Jacobi doesn\'t.',
      '**Why implement if NumPy exists?** Three reasons: (1) Understanding: you\'ll debug numerical failures you can\'t diagnose otherwise. (2) Customization: add domain-specific stopping criteria, inner products, or preconditioners. (3) Embedding in other algorithms: iterative refinement, nonlinear solvers, and optimization routines often embed linear algebra subroutines.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Numerical stability: the central theme',
        body: 'Classical GS loses orthogonality. Modified GS keeps it. Householder QR is the gold standard. This pattern — mathematically equivalent but numerically different — appears everywhere: Gaussian elimination without pivoting vs with pivoting, direct solve vs normal equations. Always benchmark against the library and check orthogonality/residuals explicitly.',
      },
      {
        type: 'warning',
        title: 'Convergence is not guaranteed for Jacobi',
        body: 'Jacobi and Gauss-Seidel only converge if A is diagonally dominant (or in some weaker conditions). For general A, they may diverge. Always monitor the residual ‖Ax-b‖ during iteration. If it\'s growing, the method is diverging.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Build It Yourself: Gram-Schmidt, Power Iteration, Jacobi',
        mathBridge: 'Each cell implements one algorithm from scratch, then compares the result to the NumPy/SciPy equivalent. The comparison reveals where the library adds stability.',
        caption: 'Cell 2 is the most important: it shows classical GS losing orthogonality on nearly-parallel columns, while modified GS stays stable.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Classical Gram-Schmidt: the simple version',
              prose: ['Classical GS orthogonalizes each vector against all previous ones. Simple to read, but numerically fragile for nearly-parallel inputs.'],
              code: `import numpy as np

def classical_gram_schmidt(A):
    """Orthonormalize columns of A using classical Gram-Schmidt."""
    m, n = A.shape
    Q = np.zeros((m, n))
    for j in range(n):
        v = A[:, j].copy()
        # Subtract projections onto all previous q vectors
        for i in range(j):
            v -= np.dot(Q[:, i], A[:, j]) * Q[:, i]
            #               ^^^^^^^^^^^
            # Bug: uses original A[:,j], not updated v
            # This is what makes classical GS unstable
        Q[:, j] = v / np.linalg.norm(v)
    return Q

A = np.array([[1., 1., 1.],
              [0., 1., 1.],
              [0., 0., 1.]])

Q_cgs = classical_gram_schmidt(A)
print("Classical GS — Q:")
print(Q_cgs.round(6))
print(f"Orthogonality ‖QᵀQ - I‖ = {np.linalg.norm(Q_cgs.T @ Q_cgs - np.eye(3)):.2e}")`,
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Modified Gram-Schmidt: the stable version',
              prose: ['Modified GS fixes the stability bug by projecting against the CURRENT vector, not the original. Compare orthogonality on nearly-parallel columns.'],
              code: `def modified_gram_schmidt(A):
    """Modified GS: project against current v at each step, not original A[:,j]."""
    m, n = A.shape
    Q = np.zeros((m, n))
    for j in range(n):
        v = A[:, j].copy()
        for i in range(j):
            v -= np.dot(Q[:, i], v) * Q[:, i]
            #               ^^^
            # Key fix: project against current v, not A[:,j]
            # This is what makes modified GS more stable
        Q[:, j] = v / np.linalg.norm(v)
    return Q

# Test on nearly-parallel columns (worst case for classical GS)
eps = 1e-8
A_hard = np.array([[1.,       1.,       1.      ],
                   [eps,      0.,       0.      ],
                   [0.,       eps,      0.      ],
                   [0.,       0.,       eps     ]])

Q_mgs = modified_gram_schmidt(A_hard)
Q_numpy, _ = np.linalg.qr(A_hard)

print(f"Modified GS orthogonality ‖QᵀQ - I‖ = {np.linalg.norm(Q_mgs.T @ Q_mgs - np.eye(3)):.2e}")
print(f"NumPy QR   orthogonality ‖QᵀQ - I‖ = {np.linalg.norm(Q_numpy.T @ Q_numpy - np.eye(3)):.2e}")

# Classical on same hard input
Q_cgs = classical_gram_schmidt(A_hard)
print(f"Classical GS orthogonality ‖QᵀQ - I‖ = {np.linalg.norm(Q_cgs.T @ Q_cgs - np.eye(3)):.2e}")
print("(Classical GS loses orthogonality; Modified GS and NumPy QR do not)")`,
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Power iteration with convergence monitoring',
              prose: ['Power iteration from scratch: multiply, normalize, estimate eigenvalue, repeat. Monitor convergence by tracking how much the eigenvalue changes each step.'],
              code: `def power_iteration(A, max_iter=100, tol=1e-12):
    """Find dominant eigenvalue and eigenvector."""
    n = A.shape[0]
    v = np.random.randn(n)
    v /= np.linalg.norm(v)

    history = []
    for k in range(max_iter):
        w = A @ v                        # Apply A
        lam = float(v @ w)               # Rayleigh quotient (eigenvalue estimate)
        v_new = w / np.linalg.norm(w)    # Normalize

        history.append(lam)
        if k > 0 and abs(lam - history[-2]) < tol:
            print(f"Converged at iteration {k+1}")
            break
        v = v_new

    return lam, v, history

A = np.array([[4., 1.],
              [2., 3.]])

lam, v_dom, hist = power_iteration(A, max_iter=30)

# Compare to numpy
eigenvalues_np = np.linalg.eigvals(A)
dom_np = np.max(np.abs(eigenvalues_np))

print(f"Power iteration dominant eigenvalue: {lam:.10f}")
print(f"NumPy dominant eigenvalue:           {dom_np:.10f}")
print(f"Convergence rate (λ₂/λ₁): {sorted(np.abs(eigenvalues_np))[0]/dom_np:.4f}")
print(f"Iterations to converge: {len(hist)}")`,
              status: 'idle',
            },
            {
              id: 4,
              cellTitle: 'Jacobi iteration: convergence for diagonally dominant A',
              prose: ['Jacobi iteration: update each variable using the current values of all OTHERS. Converges when A is diagonally dominant.'],
              code: `def jacobi(A, b, x0=None, max_iter=100, tol=1e-10):
    """Jacobi iterative solver. Converges if A is diagonally dominant."""
    n = len(b)
    x = x0 if x0 is not None else np.zeros(n)
    D = np.diag(A)                    # Diagonal elements
    R = A - np.diag(D)                # Off-diagonal part

    residuals = []
    for k in range(max_iter):
        x_new = (b - R @ x) / D      # Update all variables simultaneously
        res = np.linalg.norm(A @ x_new - b)
        residuals.append(res)

        if res < tol:
            print(f"Converged at iteration {k+1}, residual = {res:.2e}")
            return x_new, residuals

        x = x_new

    print(f"Did not converge in {max_iter} iterations, final residual = {residuals[-1]:.2e}")
    return x, residuals

# Diagonally dominant A (|a_ii| > sum of |a_ij| for i≠j)
A = np.array([[10., -1.,  2.],
              [-1.,  11., -1.],
              [ 2., -1.,  10.]])
b = np.array([6., 25., -11.])

x_jacobi, residuals = jacobi(A, b)
x_exact = np.linalg.solve(A, b)
print(f"Jacobi solution: {x_jacobi.round(6)}")
print(f"Exact solution:  {x_exact.round(6)}")
print(f"Error: {np.linalg.norm(x_jacobi - x_exact):.2e}")`,
              status: 'idle',
            },
          ],
        },
      },
    ],
  },

  math: {
    keyEquations: [
      { label: 'Gram-Schmidt orthogonalization', equation: '\\mathbf{v}_j = \\mathbf{a}_j - \\sum_{i<j}(\\mathbf{q}_i^\\top \\mathbf{a}_j)\\mathbf{q}_i,\\quad \\mathbf{q}_j = \\frac{\\mathbf{v}_j}{\\|\\mathbf{v}_j\\|}' },
      { label: 'Power iteration update', equation: '\\mathbf{v}_{k+1} = \\frac{A\\mathbf{v}_k}{\\|A\\mathbf{v}_k\\|},\\quad \\lambda \\approx \\mathbf{v}_k^\\top A\\mathbf{v}_k' },
      { label: 'Jacobi update', equation: 'x_i^{(k+1)} = \\frac{1}{a_{ii}}\\left(b_i - \\sum_{j\\neq i} a_{ij}x_j^{(k)}\\right)' },
      { label: 'Diagonal dominance (convergence condition)', equation: '|a_{ii}| > \\sum_{j\\neq i}|a_{ij}|\\quad\\forall i' },
    ],
  },

  walkthroughs: [
    {
      id: 'wt-la5-006-gs-stability',
      title: 'Why Classical GS Fails and Modified GS Fixes It',
      prereqs: ['Gram-Schmidt', 'Orthogonalization', 'Floating point'],
      problem: 'Trace through classical and modified Gram-Schmidt on the nearly-parallel columns $A = [\\mathbf{a}_1, \\mathbf{a}_2, \\mathbf{a}_3]$ where $\\mathbf{a}_1 \\approx \\mathbf{a}_2 \\approx \\mathbf{a}_3$. Identify the exact line of code where classical GS accumulates error.',
      steps: [
        {
          label: 'Identify the bug in classical GS: the projection uses the wrong vector',
          strategy: 'In classical GS, when computing q_j, you subtract projections of the ORIGINAL a_j onto all previous q_i. But if j=2 and a_2 ≈ a_1, the first projection nearly cancels a_2, leaving a tiny residual — and rounding errors in that tiny residual dominate all subsequent projections.',
          explanation: 'Classical GS line: `v -= dot(Q[:,i], A[:,j]) * Q[:,i]` — uses `A[:,j]` (original). After projection onto q₁, the remainder v is tiny. When projecting onto q₂ in the next iteration, you\'re computing `dot(Q[:,i], A[:,j])` using the original A[:,j] which is still large. The roundoff is proportional to `‖A[:,j]‖`, but the signal is proportional to the tiny remainder. Signal-to-noise ratio collapses.',
          math: '\\text{Classical: project } \\mathbf{a}_j\\text{ against each }\\mathbf{q}_i \\Rightarrow \\text{error} \\propto \\frac{\\varepsilon_{\\text{mach}}\\|\\mathbf{a}_j\\|}{\\|\\mathbf{v}_j\\|}',
        },
        {
          label: 'The modified GS fix: project against the CURRENT v',
          strategy: 'Modified GS updates v after each projection: `v -= dot(Q[:,i], v) * Q[:,i]`. Now each subsequent projection uses the progressively more orthogonal v, and the error is proportional to ‖v‖ (small), not ‖a_j‖ (large).',
          explanation: '`v -= dot(Q[:,i], v) * Q[:,i]` — uses `v` (current, already projected). After the first projection, v has had q₁\'s component removed. The second projection uses this updated v. The roundoff is proportional to ‖v‖ which is small, not ‖a_j‖.',
          math: '\\text{Modified: project current } \\mathbf{v}^{(i)}\\text{ against }\\mathbf{q}_i \\Rightarrow \\text{error} \\propto \\varepsilon_{\\text{mach}}',
        },
        {
          label: 'Compare orthogonality loss numerically: `np.linalg.norm(Q.T @ Q - I)`',
          strategy: 'Always verify Gram-Schmidt implementations with `np.allclose(Q.T @ Q, np.eye(n))`. For ill-conditioned inputs, report `norm(Q.T @ Q - I)` to quantify orthogonality loss.',
          explanation: 'On well-conditioned inputs, both CGS and MGS give `‖QᵀQ-I‖ ≈ 1e-16`. On nearly-parallel inputs (eps=1e-8), CGS gives `‖QᵀQ-I‖ ≈ 1e-8` (catastrophic loss) while MGS gives `‖QᵀQ-I‖ ≈ 1e-14`. NumPy\'s QR (Householder) gives `‖QᵀQ-I‖ ≈ 1e-16` — gold standard.',
          math: '\\text{CGS: }\\|Q^\\top Q - I\\| \\sim \\varepsilon_{\\text{mach}} \\cdot \\kappa(A) \\quad \\text{vs MGS: }\\|Q^\\top Q - I\\| \\sim \\varepsilon_{\\text{mach}}',
          gotcha: 'Modified GS and NumPy QR give the same Q mathematically but different Q numerically for ill-conditioned A. NumPy\'s Householder QR is always the most stable option. Use CGS/MGS when you need a readable implementation for education or when stability analysis doesn\'t matter (a quick prototype).',
        },
      ],
    },
    {
      id: 'wt-la5-006-jacobi-convergence',
      title: 'Why Jacobi Converges (or Diverges): Diagonal Dominance',
      prereqs: ['Iterative methods', 'Diagonal dominance', 'Spectral radius'],
      problem: 'Explain why Jacobi converges on $A = \\begin{bmatrix}10&-1&2\\\\-1&11&-1\\\\2&-1&10\\end{bmatrix}$ but diverges on $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$. Implement both cases and measure residuals per iteration.',
      steps: [
        {
          label: 'Check diagonal dominance: `|a_ii| > sum(|a_ij|, j≠i)` for each row',
          strategy: 'Diagonal dominance is a sufficient condition for Jacobi convergence. For each row i, the diagonal entry must be strictly larger in absolute value than the sum of the off-diagonal entries in that row.',
          explanation: 'Row 1: |10| > |-1|+|2| = 3 ✓. Row 2: |11| > |-1|+|-1| = 2 ✓. Row 3: |10| > |2|+|-1| = 3 ✓. All rows pass — Jacobi converges. In Python: `np.all(np.abs(np.diag(A)) > np.sum(np.abs(A) - np.abs(np.diag(A)), axis=1))`.',
          math: '|a_{ii}| > \\sum_{j\\neq i}|a_{ij}| \\Rightarrow \\rho(D^{-1}(L+U)) < 1 \\Rightarrow \\text{Jacobi converges}',
        },
        {
          label: 'Jacobi update in vectorized form: `x_new = (b - R @ x) / D`',
          strategy: 'The Jacobi update splits A = D + (L+U), then iterates x^{k+1} = D^{-1}(b - (L+U)x^k). In NumPy: compute R = A - diag(diag(A)) once, then each iteration is one matrix-vector multiply and an element-wise divide.',
          explanation: '`D = np.diag(A)` extracts the diagonal as a vector. `R = A - np.diag(D)` is the off-diagonal part. Each iteration: `x_new = (b - R @ x) / D`. This is O(n²) per iteration vs O(n³) for direct solve — worthwhile when n is large and convergence is fast.',
          math: '\\mathbf{x}^{(k+1)} = D^{-1}(\\mathbf{b} - (L+U)\\mathbf{x}^{(k)}) = D^{-1}\\mathbf{b} - D^{-1}R\\mathbf{x}^{(k)}',
        },
        {
          label: 'Monitor convergence: plot `norm(A @ x - b)` per iteration',
          strategy: 'Always track the residual, not just the iteration count. If residuals are increasing, Jacobi is diverging — stop immediately. For the convergent case, residuals should decrease geometrically.',
          explanation: '`residuals.append(np.linalg.norm(A @ x_new - b))`. Plot `residuals` on a log scale — should be a straight line (geometric decay) for well-conditioned, diagonally dominant A. Convergence rate ≈ the spectral radius of $D^{-1}(L+U)$.',
          math: '\\|\\mathbf{r}^{(k+1)}\\| \\leq \\rho(D^{-1}R)\\|\\mathbf{r}^{(k)}\\|',
          gotcha: 'Jacobi and Gauss-Seidel CAN converge for some non-diagonally-dominant matrices (e.g., symmetric positive definite), but the guarantee only holds for diagonal dominance. Always test: run a few iterations and check if residuals decrease. Never assume convergence without measuring it.',
        },
      ],
    },
  ],

  examples: [
    {
      id: 'la5-006-ex1',
      title: 'Deflation: Finding All Eigenpairs via Power Iteration',
      problem: 'Power iteration finds only the dominant eigenpair. Extend it to find the second eigenpair of a symmetric 2×2 matrix using deflation.',
      solution: 'After finding (λ₁, v₁), deflate: A₂ = A - λ₁*np.outer(v₁, v₁). Power iteration on A₂ finds the second eigenpair. Verify: v₁ and v₂ are orthogonal.',
      steps: [
        'Power iteration on A → (λ₁=4, v₁=[1,1]/√2) for [[3,1],[1,3]].',
        'Deflate: `A2 = A - 4 * np.outer(v1, v1)`.',
        'Power iteration on A2 → (λ₂=2, v₂=[1,-1]/√2).',
        'Verify: `np.dot(v1, v2)` ≈ 0 (orthogonal); `np.linalg.norm(A @ v2 - 2 * v2)` ≈ 0.',
      ],
    },
    {
      id: 'la5-006-ex2',
      title: 'Gauss-Seidel vs Jacobi Convergence Speed',
      problem: 'Compare the convergence rate of Jacobi vs Gauss-Seidel on the same diagonally dominant system. Count iterations to reach residual < 1e-8.',
      solution: 'Gauss-Seidel uses updated values immediately (within the same iteration), converging roughly 2× faster than Jacobi for typical diagonally dominant systems.',
      steps: [
        'Jacobi: update all variables simultaneously using OLD values.',
        'Gauss-Seidel: for each variable, use the MOST RECENT values of all others (already updated this iteration).',
        'GS inner loop: `x[i] = (b[i] - A[i,:i] @ x[:i] - A[i,i+1:] @ x[i+1:]) / A[i,i]`.',
        'Benchmark: Jacobi converges in ~25 iters; GS in ~14 iters for this system.',
      ],
    },
  ],

  challenges: [
    {
      id: 'la5-006-ch1',
      title: 'QR algorithm for eigenvalues',
      difficulty: 'hard',
      challengeType: 'write',
      prompt: 'Implement the basic QR algorithm for eigenvalues: repeatedly factor A_k = Q_k R_k, then update A_{k+1} = R_k Q_k. After many iterations, A_k converges to the Schur form (upper triangular with eigenvalues on the diagonal). Test on A = [[3,1],[1,3]] and compare diagonal entries after 30 iterations to `np.linalg.eigvals(A)`.',
      hint: 'Each iteration: `Q, R = np.linalg.qr(A); A = R @ Q`. After convergence, `np.diag(A)` ≈ eigenvalues.',
    },
    {
      id: 'la5-006-ch2',
      title: 'Iterative refinement',
      difficulty: 'hard',
      challengeType: 'write',
      prompt: 'Implement iterative refinement: (1) Solve Ax=b with `lu_factor`/`lu_solve`. (2) Compute residual r = b - Ax in double precision. (3) Solve the correction equation Ae = r for e using the same factorization. (4) Update x = x + e. Repeat steps 2-4. Show that this recovers lost precision for an ill-conditioned 3×3 system.',
      hint: 'For a system with κ≈10⁸, the initial solve has 8 correct digits. After one refinement step, you gain ~8 more digits (to machine precision). The key: compute the residual r = b - A @ x in Python (which uses double precision), then solve for the correction using the already-computed LU factorization.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathbf{v} -= (\\mathbf{q}_i^\\top \\mathbf{v})\\mathbf{q}_i', meaning: 'Modified GS projection: subtracts the component of v in the direction of qᵢ. Uses current v (not original), accumulating less roundoff than classical GS.' },
      { symbol: 'A_{k+1} = R_k Q_k', meaning: 'QR iteration update. Each step is a similarity transformation: A_{k+1} = Q_k^T A_k Q_k. Eigenvalues are preserved; A_k converges to upper triangular (Schur form).' },
      { symbol: 'D^{-1}(\\mathbf{b} - R\\mathbf{x}^{(k)})', meaning: 'Jacobi iteration. D = diag(A), R = A - D. Each update divides by the diagonal and subtracts the off-diagonal contributions from the previous iterate.' },
      { symbol: '\\rho(D^{-1}R) < 1', meaning: 'Jacobi convergence condition: spectral radius of the iteration matrix must be < 1. Diagonal dominance implies this.' },
    ],
    rulesOfThumb: [
      'Classical GS: simple code, unstable for nearly-parallel columns.',
      'Modified GS: one-line change, much more stable — use this for teaching.',
      'NumPy QR (Householder): always the most stable, always preferred in production.',
      'Jacobi only converges if A is diagonally dominant (or SPD in some cases).',
      'Monitor residuals every iteration — never assume convergence.',
    ],
  },

  quiz: [
    {
      id: 'la5-006-q1',
      question: 'The one-line difference between classical and modified Gram-Schmidt is: classical uses `dot(Q[:,i], A[:,j])` while modified uses `dot(Q[:,i], v)`. Why does this matter for nearly-parallel columns?',
      options: [
        'Modified GS is slower because it updates v more often.',
        'In classical GS, the projection coefficient is computed from the original (large) vector A[:,j], not the tiny remainder v — so rounding errors are proportional to ‖A[:,j]‖ instead of ‖v‖.',
        'The two formulas compute different projections mathematically.',
        'Classical GS requires more memory because it keeps the original A.',
      ],
      answer: 1,
      explanation: 'The projection coefficient `dot(Q[:,i], A[:,j])` uses the full-scale original column A[:,j]. If A[:,j] ≈ A[:,j-1], the remainder v after projection is tiny. Computing `dot(Q[:,i], A[:,j])` has rounding error ~εmach × ‖A[:,j]‖, which can be larger than ‖v‖ itself. Modified GS computes `dot(Q[:,i], v)` — the rounding error is ~εmach × ‖v‖, which is proportionally small.',
    },
    {
      id: 'la5-006-q2',
      question: 'Jacobi iteration on a system with A = [[1,2],[3,4]] (NOT diagonally dominant) is likely to:',
      options: [
        'Converge to the exact solution in finite steps.',
        'Converge more slowly than for a diagonally dominant system but still reach the solution.',
        'Diverge — residuals will grow rather than shrink.',
        'Converge only if the initial guess is close enough to the solution.',
      ],
      answer: 2,
      explanation: 'Row 1: |1| < |2| (not diagonally dominant). Row 2: |4| > |3| (dominant). At least one row fails the dominance condition — Jacobi likely diverges. The iteration matrix D⁻¹R has spectral radius > 1, meaning errors grow by that factor each iteration. Always verify diagonal dominance before using Jacobi.',
    },
  ],
}
