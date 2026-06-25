export default {
  id: 'la5-003',
  slug: 'eigenvalues-python',
  chapter: 'la5',
  order: 3,
  title: 'Eigenvalues and Eigenvectors in Python',
  subtitle: 'Using `eig` and `eigh`, verifying $AV=V\\Lambda$, and building power iteration from scratch.',
  tags: ['numpy', 'scipy', 'python', 'eigenvalues', 'eigenvectors', 'eig', 'eigh', 'power iteration'],
  aliases: 'eigenvalues eigenvectors numpy eig eigh scipy power iteration symmetric diagonalization',

  hook: {
    question: 'You called `np.linalg.eig(A)` and got eigenvalues. How do you know they\'re right — and which `eig` variant should you have used?',
    realWorldContext: 'Google\'s PageRank is the dominant eigenvector of a 100-billion-node transition matrix. PCA is just computing eigenvectors of a covariance matrix. Structural engineers compute eigenvectors to find which vibration mode will destroy a bridge. The tool is `eig` — but which variant, in which order, with which verification, separates code that works from code that looks like it works.',
  },

  intuition: {
    prose: [
      '**`eig` vs `eigh`:** Use `np.linalg.eigh` whenever your matrix is symmetric (or Hermitian). It uses a dedicated algorithm that guarantees real eigenvalues, returns them sorted in ascending order, and is 2–3× faster. `np.linalg.eig` (the general version) can return complex eigenvalues for real inputs if the matrix is not symmetric — this is correct math, but often a surprise.',
      '**The eigenvalue equation is your verification:** After calling `eigenvalues, V = np.linalg.eig(A)`, the relationship $AV = V\\Lambda$ must hold exactly (to machine precision). Verify with `np.allclose(A @ V, V * eigenvalues)`. If it fails, either the matrix is ill-conditioned or you\'re using the wrong function.',
      '**Eigenvector ordering:** `eig` returns eigenvectors in no particular order. `eigh` returns them sorted by ascending eigenvalue. When you need the *largest* eigenvalue (PCA, PageRank, spectral clustering), you want the last column of `eigh`\'s output, or you call power iteration directly.',
      '**Near-degenerate eigenvalues:** When two eigenvalues are close (e.g., 1.0000001 and 1.0000002), the eigenvectors are numerically ill-defined — any rotation in the eigenspace is equally valid. `eigh` handles this correctly by guaranteeing orthonormal output; `eig` may not.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Always verify AV = VΛ',
        body: 'Eigenvalue computation is numerically sensitive. Always run `np.allclose(A @ V, V * eigenvalues)` after calling `eig`. If this fails, check whether your matrix is actually symmetric (use `eigh`) and whether it\'s well-conditioned.',
      },
      {
        type: 'insight',
        title: 'Which eigenvalue function to use',
        body: '| Matrix type | Function | Returns | Notes |\n|---|---|---|---|\n| General (may be non-symmetric) | `np.linalg.eig` | Complex eigenvalues possible | Slower, unsorted |\n| Symmetric / Hermitian | `np.linalg.eigh` | Real, sorted ascending | 2–3× faster |\n| Large sparse | `scipy.sparse.linalg.eigsh` | k largest/smallest | Arnoldi iteration |\n| Need only dominant | `power_iteration` | 1 eigenvalue | Simple to implement |',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Eigenvalues in Python: From Setup to Verification',
        mathBridge: 'Each cell builds understanding of one piece: the eig call, verification, the difference between eig and eigh, and finally building the algorithm from scratch.',
        caption: 'Cell 4 shows why eigh is preferred for symmetric matrices — the output is cleaner and more reliable.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Using np.linalg.eig and verifying AV = VΛ',
              prose: ['np.linalg.eig returns (eigenvalues, eigenvectors). The i-th eigenvector is the i-th COLUMN of V.'],
              code: `import numpy as np

A = np.array([[3., 1.],
              [1., 3.]])

eigenvalues, V = np.linalg.eig(A)
print(f"Eigenvalues: {eigenvalues}")
print(f"Eigenvectors (columns):\\n{V}")

# Verify: A @ V should equal V * eigenvalues (broadcasting: each column scaled by its eigenvalue)
AV = A @ V
VL = V * eigenvalues   # equivalent to V @ np.diag(eigenvalues)
print(f"\\nA @ V:\\n{AV}")
print(f"V @ Λ:\\n{VL}")
print(f"Verified AV = VΛ: {np.allclose(AV, VL)}")`,
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'eigh for symmetric matrices — sorted, real, orthonormal',
              prose: ['For symmetric A, eigh is more reliable: eigenvalues are guaranteed real, sorted ascending, and eigenvectors are orthonormal.'],
              code: `# Same matrix, but use eigh (symmetric-specific)
eigenvalues_h, V_h = np.linalg.eigh(A)
print(f"eigh eigenvalues (sorted ascending): {eigenvalues_h}")
print(f"Eigenvectors orthonormal: {np.allclose(V_h.T @ V_h, np.eye(2))}")

# Largest eigenvalue and its eigenvector
print(f"\\nLargest eigenvalue: {eigenvalues_h[-1]}")
print(f"Corresponding eigenvector: {V_h[:, -1]}")

# Compare: eig gives same values but NOT necessarily sorted
eigenvalues_g, _ = np.linalg.eig(A)
print(f"\\neig eigenvalues (not guaranteed sorted): {eigenvalues_g}")`,
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Reconstruction: A = V Λ Vᵀ (spectral decomposition)',
              prose: ['For a symmetric matrix, we can reconstruct A from its eigendecomposition. This is the spectral theorem.'],
              code: `# Reconstruct A from eigendecomposition (spectral theorem)
A_reconstructed = V_h @ np.diag(eigenvalues_h) @ V_h.T
print(f"Original A:\\n{A}")
print(f"Reconstructed V Λ Vᵀ:\\n{A_reconstructed}")
print(f"Reconstruction exact: {np.allclose(A, A_reconstructed)}")

# Power of A via eigendecomposition: A^10 = V Λ^10 Vᵀ
A_power_10 = V_h @ np.diag(eigenvalues_h ** 10) @ V_h.T
A_power_10_direct = np.linalg.matrix_power(A, 10)
print(f"\\nA^10 via eigendecomp matches direct: {np.allclose(A_power_10, A_power_10_direct)}")`,
              status: 'idle',
            },
            {
              id: 4,
              cellTitle: 'Power iteration: finding the dominant eigenvalue',
              prose: ['Power iteration is the algorithm behind PageRank. It multiplies by A repeatedly — the dominant eigenvector emerges naturally.'],
              code: `def power_iteration(A, num_iters=50, tol=1e-10):
    """Find the largest eigenvalue and its eigenvector."""
    n = A.shape[0]
    # Start with a random vector
    v = np.random.randn(n)
    v = v / np.linalg.norm(v)

    eigenvalue_prev = 0
    for i in range(num_iters):
        # Multiply: move in the direction A "prefers"
        w = A @ v
        # Rayleigh quotient: current eigenvalue estimate
        eigenvalue = v @ w
        # Normalize to prevent overflow
        v = w / np.linalg.norm(w)

        if abs(eigenvalue - eigenvalue_prev) < tol:
            print(f"Converged at iteration {i+1}")
            break
        eigenvalue_prev = eigenvalue

    return eigenvalue, v

lam, v_dom = power_iteration(A)
print(f"Dominant eigenvalue (power iteration): {lam:.8f}")
print(f"True largest eigenvalue (eigh):        {eigenvalues_h[-1]:.8f}")
print(f"Match: {np.isclose(lam, eigenvalues_h[-1])}")`,
              status: 'idle',
            },
          ],
        },
      },
    ],
  },

  math: {
    keyEquations: [
      { label: 'Eigenvalue equation', equation: 'A\\mathbf{v} = \\lambda \\mathbf{v}' },
      { label: 'Diagonalization', equation: 'A = V\\Lambda V^{-1}' },
      { label: 'Symmetric diagonalization (spectral theorem)', equation: 'A = V\\Lambda V^\\top \\quad (A = A^\\top)' },
      { label: 'Power iteration update', equation: '\\mathbf{v}_{k+1} = \\frac{A\\mathbf{v}_k}{\\|A\\mathbf{v}_k\\|}' },
    ],
  },

  walkthroughs: [
    {
      id: 'wt-la5-003-eig-vs-eigh',
      title: 'When to Use `eig` vs `eigh`: A Decision Tree in Code',
      prereqs: ['Eigenvalues', 'Symmetric matrices', 'Spectral theorem'],
      problem: 'Given the matrix $A=\\begin{bmatrix}3&1\\\\1&3\\end{bmatrix}$, compute eigenvalues using both `eig` and `eigh`, compare the outputs, and decide which is correct to use here.',
      steps: [
        {
          label: 'Check if A is symmetric: `np.allclose(A, A.T)`',
          strategy: 'Before choosing `eig` vs `eigh`, test symmetry. Symmetric matrices have real eigenvalues and orthonormal eigenvectors — `eigh` exploits this structure for faster, more reliable computation.',
          explanation: '`np.allclose(A, A.T)` returns `True` → A is symmetric. This unlocks `eigh`. The test is numerical (uses a tolerance), not exact — essential because floating-point arithmetic can introduce tiny asymmetries.',
          math: 'A = A^\\top \\Rightarrow \\text{use } \\mathtt{eigh}',
        },
        {
          label: 'Call `np.linalg.eigh(A)` and read the output',
          strategy: '`eigh` returns eigenvalues sorted ascending and eigenvectors as columns. The last column is the dominant eigenvector (largest eigenvalue). Index with `[-1]` to get the top eigenpair.',
          explanation: '`eigenvalues, V = np.linalg.eigh(A)` → `eigenvalues = [2, 4]`, `V[:, 0]` is the eigenvector for λ=2, `V[:, 1]` for λ=4. Columns of V are orthonormal: `V.T @ V` = identity.',
          math: '\\lambda_1 = 2,\\; \\mathbf{v}_1 = \\tfrac{1}{\\sqrt{2}}[1,-1]^\\top;\\quad \\lambda_2 = 4,\\; \\mathbf{v}_2 = \\tfrac{1}{\\sqrt{2}}[1,1]^\\top',
        },
        {
          label: 'Verify: `np.allclose(A @ V, V * eigenvalues)`',
          strategy: 'This single line checks the fundamental identity AV=VΛ for all eigenpairs simultaneously. Broadcasting handles the multiplication: column i of V is scaled by eigenvalues[i].',
          explanation: '`V * eigenvalues` uses NumPy broadcasting: each row of V is element-wise multiplied by the eigenvalues vector, which is equivalent to `V @ np.diag(eigenvalues)`. If this returns False, there is a bug.',
          math: 'AV = V\\Lambda \\Leftrightarrow A\\mathbf{v}_i = \\lambda_i \\mathbf{v}_i \\text{ for all } i',
          gotcha: 'For `eig` (not `eigh`), complex-symmetric matrices may return complex eigenvalues even when you expect real ones. Always check `np.isrealobj(eigenvalues)` when using `eig`. For `eigh`, eigenvalues are always real — this is a mathematical guarantee, not just a numerical observation.',
        },
        {
          label: 'Use the eigendecomposition to compute $A^{10}$ efficiently',
          strategy: 'Matrix powers via eigendecomposition: A^k = VΛ^k V^T. Computing Λ^k is just raising each diagonal entry to the k-th power — O(n) work instead of k matrix multiplications.',
          explanation: '`A_10 = V @ np.diag(eigenvalues**10) @ V.T`. Each eigenvalue is raised to the 10th power independently, then the matrix is reconstructed. This is O(n²) for reconstruction, vs O(n³) per multiplication for the direct approach.',
          math: 'A^{10} = V \\begin{bmatrix}2^{10}&0\\\\0&4^{10}\\end{bmatrix} V^\\top = V \\begin{bmatrix}1024&0\\\\0&1{,}048{,}576\\end{bmatrix} V^\\top',
        },
      ],
    },
    {
      id: 'wt-la5-003-power-iteration',
      title: 'Power Iteration: How PageRank Works, Piece by Piece',
      prereqs: ['Dominant eigenvalue', 'Rayleigh quotient', 'Eigenvectors'],
      problem: 'Implement power iteration for $A=\\begin{bmatrix}3&1\\\\1&3\\end{bmatrix}$. Trace through the first 3 iterations, explaining what each line of code does to the vector.',
      steps: [
        {
          label: 'Start with a random unit vector',
          strategy: 'Power iteration works from any starting vector (as long as it has a nonzero component in the dominant eigenvector direction). Normalize first to prevent numerical overflow on the first multiply.',
          explanation: '`v = np.random.randn(n); v /= np.linalg.norm(v)`. The random start ensures (with probability 1) that v has a component in the direction of the dominant eigenvector. Normalizing prevents `A @ v` from blowing up when λ > 1.',
          math: '\\mathbf{v}_0 = \\frac{\\mathbf{r}}{\\|\\mathbf{r}\\|} \\text{ for random } \\mathbf{r}',
        },
        {
          label: 'Multiply by A: `w = A @ v`',
          strategy: 'Each multiply by A amplifies components in the dominant eigenvector direction by λ₁ and other directions by their smaller eigenvalues. After many iterations, the dominant direction overwhelms the rest.',
          explanation: 'Write v₀ = αv₁ + βv₂ (sum of eigenvectors). Then A^k v₀ = α λ₁^k v₁ + β λ₂^k v₂. Since λ₁=4 > λ₂=2, the ratio of components is (λ₁/λ₂)^k = 2^k → ∞. The dominant eigenvector direction wins exponentially fast.',
          math: 'A^k\\mathbf{v}_0 = \\alpha\\lambda_1^k\\mathbf{v}_1 + \\beta\\lambda_2^k\\mathbf{v}_2 \\approx \\alpha\\lambda_1^k\\mathbf{v}_1',
        },
        {
          label: 'Estimate eigenvalue via Rayleigh quotient: `lam = v @ w`',
          strategy: 'The Rayleigh quotient $R(\\mathbf{v}) = \\mathbf{v}^\\top A\\mathbf{v}$ is the best eigenvalue estimate from a given vector. When v ≈ v₁, `v @ A @ v` ≈ v^T λ₁ v₁ = λ₁.',
          explanation: 'Since `w = A @ v`, `v @ w = v^T (A v) = R(v)`. For a unit vector, R(v) equals the eigenvalue when v is an exact eigenvector. We compute this BEFORE normalizing w (while we still have the unscaled Aw).',
          math: 'R(\\mathbf{v}) = \\mathbf{v}^\\top A\\mathbf{v} = \\mathbf{v}^\\top\\mathbf{w} \\xrightarrow{\\mathbf{v}\\to\\mathbf{v}_1} \\lambda_1',
        },
        {
          label: 'Normalize: `v = w / norm(w)`',
          strategy: 'Normalizing prevents the vector from growing without bound across iterations. After normalizing, v is the current estimate of the dominant eigenvector.',
          explanation: '`v = w / np.linalg.norm(w)`. After ~10 iterations, this v is within machine precision of the true dominant eigenvector. Convergence rate: each iteration multiplies the error by λ₂/λ₁ = 2/4 = 0.5 — the error halves each step.',
          math: '\\mathbf{v}_{k+1} = \\frac{A\\mathbf{v}_k}{\\|A\\mathbf{v}_k\\|},\\quad \\text{error} \\sim \\left(\\frac{\\lambda_2}{\\lambda_1}\\right)^k = 0.5^k',
          gotcha: 'Power iteration only finds the DOMINANT (largest magnitude) eigenvector. To find all eigenvectors, you need deflation (subtract off the found eigenpair) or use `eigh`. Power iteration diverges if two eigenvalues have the same magnitude (e.g., ±λ) — in that case, use `scipy.sparse.linalg.eigs` instead.',
        },
      ],
    },
  ],

  examples: [
    {
      id: 'la5-003-ex1',
      title: 'PCA via Eigendecomposition',
      problem: 'A 2D dataset has covariance matrix $C=\\begin{bmatrix}4&2\\\\2&2\\end{bmatrix}$. Find the principal components (eigenvectors) and the percentage of variance explained by the first component.',
      solution: 'eigh(C) → λ=[0.76, 5.24]. First PC: eigenvector for λ=5.24. Variance explained: 5.24/(5.24+0.76) = 87.3%.',
      steps: [
        'Call `eigenvalues, V = np.linalg.eigh(C)`. Eigenvalues sorted ascending: [0.76, 5.24].',
        'PC1 = `V[:, -1]` (last column = largest eigenvalue). PC2 = `V[:, 0]`.',
        'Variance explained: `eigenvalues[-1] / eigenvalues.sum()` = 5.24/6.0 = 87.3%.',
        'Project data: `X_reduced = X @ V[:, -1]` (scalar per data point = coordinate along PC1).',
      ],
    },
    {
      id: 'la5-003-ex2',
      title: 'Detecting a Defective Matrix',
      problem: 'The matrix $A=\\begin{bmatrix}3&1\\\\0&3\\end{bmatrix}$ has eigenvalue $\\lambda=3$ with algebraic multiplicity 2. Use `eig` to compute eigenvectors and verify that only one independent eigenvector exists.',
      solution: 'eig returns eigenvalues [3,3] and V = [[1,?],[0,0]] (second column is also [1,0] or numerically unstable). Check: V has rank 1. This is a defective (non-diagonalizable) matrix.',
      steps: [
        'Call `eigenvalues, V = np.linalg.eig(A)`. Both eigenvalues = 3.',
        'Check rank: `np.linalg.matrix_rank(V)` = 1 (columns are proportional).',
        'A is defective — cannot be diagonalized. Need Jordan normal form or matrix exponential instead.',
        'Practical impact: for ODEs ẋ=Ax, the solution has a `t * e^{3t}` term (not just e^{3t}).',
      ],
    },
  ],

  challenges: [
    {
      id: 'la5-003-ch1',
      title: 'Inverse power iteration',
      difficulty: 'hard',
      challengeType: 'write',
      prompt: 'Implement inverse power iteration to find the SMALLEST eigenvalue of $A=\\begin{bmatrix}3&1\\\\1&3\\end{bmatrix}$. Hint: the smallest eigenvalue of A is the dominant eigenvalue of $A^{-1}$. Use `scipy.linalg.lu_factor` + `lu_solve` inside the iteration loop (don\'t compute `inv(A)`).',
      hint: 'Structure: `lu, piv = lu_factor(A)`, then each iteration: `w = lu_solve((lu, piv), v)`. The eigenvalue of A is `1 / (v @ w)`.',
    },
    {
      id: 'la5-003-ch2',
      title: 'Verify spectral decomposition for a 3×3 matrix',
      difficulty: 'medium',
      challengeType: 'write',
      prompt: 'For $A=\\begin{bmatrix}4&1&1\\\\1&4&1\\\\1&1&4\\end{bmatrix}$, use `eigh` to compute eigenvalues and eigenvectors, reconstruct $A=V\\Lambda V^\\top$, and verify the reconstruction. Then compute $A^{1/2}$ (the matrix square root) using $V\\Lambda^{1/2}V^\\top$.',
      hint: 'Matrix square root: `V @ np.diag(np.sqrt(eigenvalues)) @ V.T`. Verify: `A_sqrt @ A_sqrt` should equal A.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathtt{np.linalg.eig}(A)', meaning: 'General eigendecomposition. May return complex eigenvalues for real A if A is not symmetric. Returns (eigenvalues, eigenvectors) where eigenvectors are columns. No guarantee of sorting or orthogonality.' },
      { symbol: '\\mathtt{np.linalg.eigh}(A)', meaning: 'Eigendecomposition for symmetric/Hermitian A. Returns real eigenvalues sorted ascending, orthonormal eigenvectors. 2–3× faster than eig. Use this whenever A = Aᵀ.' },
      { symbol: '\\mathtt{V * eigenvalues}', meaning: 'Broadcasting: scales each column i of V by eigenvalues[i]. Equivalent to V @ np.diag(eigenvalues). Used in the verification AV = V * eigenvalues.' },
      { symbol: '\\mathbf{v}^\\top A\\mathbf{v}', meaning: 'Rayleigh quotient. Equals the eigenvalue when v is an exact eigenvector. Used in power iteration to estimate the dominant eigenvalue from the current vector.' },
    ],
    rulesOfThumb: [
      'Use eigh for symmetric/Hermitian matrices — always.',
      'Always verify AV = V * eigenvalues after calling eig.',
      'Last column of eigh output = dominant eigenvector (largest eigenvalue).',
      'Power iteration converges at rate (λ₂/λ₁) per iteration — the wider the gap, the faster.',
      'Never assume eigenvectors from eig are orthonormal — only eigh guarantees this.',
    ],
  },

  quiz: [
    {
      id: 'la5-003-q1',
      question: 'After calling `eigenvalues, V = np.linalg.eigh(A)` on a 4×4 symmetric matrix, how do you get the eigenvector corresponding to the LARGEST eigenvalue?',
      options: ['`V[0]` (first row)', '`V[:, 0]` (first column)', '`V[:, -1]` (last column)', '`V[-1, :]` (last row)'],
      answer: 2,
      explanation: '`eigh` returns eigenvalues sorted ascending (smallest first, largest last). Eigenvectors are stored as COLUMNS. So `eigenvalues[-1]` is the largest eigenvalue and `V[:, -1]` is the corresponding eigenvector.',
    },
    {
      id: 'la5-003-q2',
      question: 'In power iteration, what does normalizing the vector after each `A @ v` step accomplish?',
      options: [
        'It makes the algorithm converge to the smallest eigenvalue instead of the largest.',
        'It prevents the vector magnitude from growing without bound across iterations, while preserving the direction.',
        'It ensures the eigenvalue estimate is exactly correct after each iteration.',
        'It orthogonalizes the vector against all previous iterates.',
      ],
      answer: 1,
      explanation: 'The direction of A^k v converges to the dominant eigenvector regardless of normalization. But without normalizing, the vector magnitude grows as λ₁^k, which overflows for λ₁ > 1. Normalizing maintains a unit vector while preserving the directional convergence.',
    },
  ],
}
