export default {
  id: 'la5-004',
  slug: 'svd-applications',
  chapter: 'la5',
  order: 4,
  title: 'SVD Applications in Python',
  subtitle: 'Reading SVD output, building truncated SVD, and compressing an image — all from scratch.',
  tags: ['numpy', 'scipy', 'python', 'SVD', 'PCA', 'low-rank approximation', 'image compression'],
  aliases: 'SVD singular value decomposition numpy linalg svd truncated rank-k approximation Eckart-Young image compression PCA',

  hook: {
    question: '`np.linalg.svd` returns three arrays. Which one tells you how much information is in your matrix — and how do you use that to compress it?',
    realWorldContext: 'Netflix\'s recommendation engine, Spotify\'s "Discover Weekly," Google\'s latent semantic analysis, JPEG-like image compression, and noise removal in neuroscience brain scans all use one algorithm: the SVD. The code is always `U, s, Vt = np.linalg.svd(A)`. The insight is in reading the singular values `s` and deciding how many to keep.',
  },

  intuition: {
    prose: [
      '**Reading SVD output:** `U, s, Vt = np.linalg.svd(A, full_matrices=False)`. Three arrays: `U` (left singular vectors, columns), `s` (singular values, largest first), `Vt` (right singular vectors, rows — NOT V, already transposed). Reconstruct A: `U @ np.diag(s) @ Vt`.',
      '**Singular values = information content:** The singular values are sorted largest to smallest. Each one σᵢ measures how much of A\'s "energy" is in the i-th direction. The fraction of variance explained by the first k singular values is $\\sum_{i=1}^k\\sigma_i^2 / \\sum_{i=1}^n\\sigma_i^2$.',
      '**Truncated SVD = low-rank approximation:** Keep only the k largest singular values. Set the rest to zero. The result Aₖ = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :] is the best rank-k approximation to A (Eckart-Young theorem). Smaller k = more compression, more information lost.',
      '**Choosing k:** Plot singular values on a log scale and look for a "knee" (elbow) where they drop sharply. Values after the knee are typically noise. For image compression, k=20 retains most visual information while using 20× less storage.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Vt is already transposed — do not transpose it again',
        body: 'NumPy returns `Vt` (V-transpose). The reconstruction is `U @ np.diag(s) @ Vt`, NOT `U @ np.diag(s) @ Vt.T`. The most common SVD bug is forgetting this and double-transposing.',
      },
      {
        type: 'insight',
        title: 'full_matrices=False saves memory',
        body: 'For an m×n matrix with m >> n, `svd(A)` with `full_matrices=True` (the default) returns U as m×m — mostly wasted space. Use `svd(A, full_matrices=False)` (the "thin" or "economy" SVD) to get U as m×n instead. Same mathematical content, much smaller arrays.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'SVD: Anatomy, Reconstruction, and Compression',
        mathBridge: 'Each cell isolates one concept: reading the three arrays, measuring information, building rank-k approximation, and measuring the approximation error.',
        caption: 'Cell 3 is the core insight: each rank-1 term U[:,i] * s[i] * Vt[i,:] is one "layer" of the matrix. Adding layers improves the approximation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'SVD output anatomy: U, s, Vt',
              prose: ['Compute the SVD and examine the shape and meaning of each returned array.'],
              code: `import numpy as np

# A 4×3 matrix (more rows than columns)
A = np.array([[3., 2., 2.],
              [2., 3., -2.],
              [2., -1., 3.],
              [1., 2., 1.]])

# full_matrices=False: economy/thin SVD
U, s, Vt = np.linalg.svd(A, full_matrices=False)
print(f"A shape: {A.shape}")
print(f"U shape: {U.shape}  (left singular vectors, columns are orthonormal)")
print(f"s shape: {s.shape}  (singular values, sorted descending)")
print(f"Vt shape: {Vt.shape}  (RIGHT singular vectors as ROWS — already transposed!)")
print(f"\\nSingular values: {s.round(4)}")

# Verify reconstruction: A = U @ diag(s) @ Vt
A_reconstructed = U @ np.diag(s) @ Vt
print(f"\\nReconstruction exact: {np.allclose(A, A_reconstructed)}")`,
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Singular values as information content',
              prose: ['The fraction of variance explained by singular values tells you how much information is in each "layer" of the matrix.'],
              code: `# Variance explained by each singular value
variance_explained = s**2 / (s**2).sum()
cumulative_variance = np.cumsum(variance_explained)

print("Singular value analysis:")
for i, (sigma, var, cum) in enumerate(zip(s, variance_explained, cumulative_variance)):
    print(f"  σ_{i+1} = {sigma:.4f}  |  {var*100:.1f}% variance  |  {cum*100:.1f}% cumulative")

# Rank of A (number of nonzero singular values, up to numerical tolerance)
rank = np.sum(s > 1e-10)
print(f"\\nNumerical rank of A: {rank}")
print(f"Full reconstruction needs k={rank} singular values")`,
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Rank-k approximation: adding layers one by one',
              prose: ['Each rank-1 term is one "layer" of the matrix. Adding layers progressively refines the approximation. This is the Eckart-Young theorem in action.'],
              code: `# Build rank-k approximation as sum of rank-1 outer products
print("Approximation error by rank:")
for k in range(1, len(s) + 1):
    # Rank-k approximation: sum of first k rank-1 terms
    A_k = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]
    error = np.linalg.norm(A - A_k, ord='fro')  # Frobenius norm
    var = (s[:k]**2).sum() / (s**2).sum()
    print(f"  k={k}: ‖A - A_k‖_F = {error:.4f},  variance retained = {var*100:.1f}%")

# The error equals sqrt(sum of squared dropped singular values)
# (Eckart-Young: A_k minimizes Frobenius error among all rank-k matrices)
print(f"\\nEckart-Young check: ‖A - A_2‖_F = {np.sqrt((s[2:]**2).sum()):.4f}")`,
              status: 'idle',
            },
            {
              id: 4,
              cellTitle: 'Image compression simulation',
              prose: ['Simulate image compression on a random "image" matrix. Compare storage cost: original vs rank-k approximation.'],
              code: `# Simulate a grayscale image as a random matrix (e.g., 100×80 pixels)
np.random.seed(42)
# Create a low-rank "structured" image + some noise
m, n = 100, 80
true_rank = 5  # underlying structure has rank 5
U_true = np.random.randn(m, true_rank)
V_true = np.random.randn(n, true_rank)
noise = 0.1 * np.random.randn(m, n)
image = U_true @ V_true.T + noise  # rank-5 signal + noise

U_img, s_img, Vt_img = np.linalg.svd(image, full_matrices=False)

print("Image SVD — singular value spectrum:")
for i in range(10):
    bar = '█' * int(s_img[i] / s_img[0] * 20)
    print(f"  σ_{i+1:2d} = {s_img[i]:6.2f}  {bar}")

# Compare storage: original vs rank-k
original_entries = m * n
for k in [1, 5, 10, 20]:
    # Rank-k needs k*(m + n + 1) numbers (U columns + Vt rows + s values)
    compressed_entries = k * (m + n + 1)
    ratio = original_entries / compressed_entries
    var = (s_img[:k]**2).sum() / (s_img**2).sum()
    print(f"k={k:2d}: {compressed_entries:5d} numbers ({ratio:.1f}× compression), {var*100:.1f}% variance")`,
              status: 'idle',
            },
          ],
        },
      },
    ],
  },

  math: {
    keyEquations: [
      { label: 'SVD', equation: 'A = U\\Sigma V^\\top' },
      { label: 'Rank-k approximation', equation: 'A_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top' },
      { label: 'Eckart-Young theorem', equation: 'A_k = \\underset{\\text{rank}(B)\\leq k}{\\arg\\min}\\|A - B\\|_F' },
      { label: 'Variance explained by k components', equation: '\\frac{\\sum_{i=1}^k \\sigma_i^2}{\\sum_{i=1}^r \\sigma_i^2}' },
    ],
  },

  walkthroughs: [
    {
      id: 'wt-la5-004-svd-anatomy',
      title: 'Dissecting SVD Output: What U, s, and Vt Actually Mean',
      prereqs: ['SVD definition', 'Singular values', 'Orthonormal matrices'],
      problem: 'Call `np.linalg.svd` on $A = \\begin{bmatrix}3&2&2\\\\2&3&-2\\end{bmatrix}$ and interpret every number returned.',
      steps: [
        {
          label: 'Call SVD and check shapes first',
          strategy: 'Before doing anything with SVD output, print the shapes. Wrong shapes are the source of most SVD bugs. For an m×n matrix, thin SVD gives: U is m×min(m,n), s is min(m,n), Vt is min(m,n)×n.',
          explanation: '`U, s, Vt = np.linalg.svd(A, full_matrices=False)`. For 2×3 A: U is 2×2, s is (2,), Vt is 2×3. Critically: Vt has 3 columns (the dimensionality of the input space) and 2 rows (one per nonzero singular value).',
          math: 'A_{2\\times3} = U_{2\\times2}\\,\\Sigma_{2\\times2}\\,V^\\top_{2\\times3}',
        },
        {
          label: 'Interpret s: singular values are ordered, nonneg, and measure "scale"',
          strategy: 'Singular values are always real, nonneg, sorted descending. Each σᵢ is the "stretch factor" in the i-th direction. The ratio σ₁/σ₂ tells you how "elongated" the mapping is.',
          explanation: 'For A above, s ≈ [5, 3]. The largest singular value σ₁≈5 means A stretches a unit ball the most (factor 5) in the direction v₁ (first row of Vt). The condition number κ = σ₁/σ₂ ≈ 5/3 — well-conditioned.',
          math: '\\sigma_1 \\approx 5 \\geq \\sigma_2 \\approx 3 > 0',
        },
        {
          label: 'Interpret Vt: rows are the input singular vectors',
          strategy: 'The ROWS of Vt are the right singular vectors — the "input directions" that A transforms cleanly. Vt[0, :] is the direction in R³ that A stretches most. These are orthonormal.',
          explanation: '`np.allclose(Vt @ Vt.T, np.eye(2))` → True (rows orthonormal). For a 2×3 matrix, Vt has 2 orthonormal rows in R³ space — they span the row space of A.',
          math: 'V^\\top V = I_k \\text{ (thin SVD, rows orthonormal)}',
          gotcha: 'The COLUMNS of Vt are NOT necessarily orthonormal for thin SVD. The ROWS are. This is the transpose-confusion trap: Vt[i, :] is the i-th right singular vector.',
        },
        {
          label: 'Reconstruct A and verify: `U @ np.diag(s) @ Vt`',
          strategy: 'Every SVD computation should end with a reconstruction check. This catches the double-transpose bug and verifies correctness.',
          explanation: '`np.allclose(A, U @ np.diag(s) @ Vt)`. Note: `np.diag(s)` creates a 2×2 diagonal matrix from the vector s. The full expression is (2×2)(2×2)(2×3) = 2×3. Correct.',
          math: 'A = U\\Sigma V^\\top = \\begin{bmatrix}\\mathbf{u}_1&\\mathbf{u}_2\\end{bmatrix}\\begin{bmatrix}\\sigma_1&0\\\\0&\\sigma_2\\end{bmatrix}\\begin{bmatrix}\\mathbf{v}_1^\\top\\\\\\mathbf{v}_2^\\top\\end{bmatrix}',
        },
      ],
    },
    {
      id: 'wt-la5-004-rank-k',
      title: 'Building Rank-k Approximation: The Eckart-Young Theorem in Code',
      prereqs: ['SVD', 'Frobenius norm', 'Low-rank approximation'],
      problem: 'A 100×80 matrix has singular values $[50, 30, 10, 5, 2, 0.1, \\ldots]$. Implement rank-k approximation, choose the right $k$, and verify the Eckart-Young error formula.',
      steps: [
        {
          label: 'Plot singular values on log scale to find the "knee"',
          strategy: 'True signal vs noise often shows a sharp drop in singular values. The rank of the underlying structure is approximately where the curve goes from steep to flat. Look for this "knee" on a log scale.',
          explanation: '`np.log10(s)` reveals the scale structure. If singular values are [50,30,10,5,2,0.1,0.1,...], there is a clear drop after index 4 — the noise floor is ~0.1. Choose k=5 to retain signal and discard noise.',
          math: '\\text{choose } k: \\sigma_k \\gg \\sigma_{k+1} \\approx \\sigma_{k+2} \\approx \\cdots',
        },
        {
          label: 'Build rank-k approximation: `U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]`',
          strategy: 'Slice the first k columns of U, first k singular values, and first k rows of Vt. The result has rank exactly k.',
          explanation: '`A_k = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]`. Shapes: (m×k)(k×k)(k×n) = m×n. Each rank-1 term `np.outer(U[:, i], Vt[i, :]) * s[i]` adds one "layer." Adding all k layers gives Aₖ.',
          math: 'A_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top',
        },
        {
          label: 'Verify the Eckart-Young error formula',
          strategy: 'The Frobenius norm error of the rank-k approximation equals sqrt(sum of squared dropped singular values). Verify this numerically.',
          explanation: '`error_k = np.linalg.norm(A - A_k, "fro")`. This should equal `np.sqrt((s[k:]**2).sum())`. This identity is the Eckart-Young theorem: no rank-k matrix is closer to A in Frobenius norm than Aₖ.',
          math: '\\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\sigma_{k+2}^2 + \\cdots + \\sigma_r^2}',
          gotcha: 'The Eckart-Young theorem holds for Frobenius norm and spectral (operator) norm. It does NOT hold for all matrix norms. Also: the minimum is achieved by Aₖ (the SVD truncation), but there may be other rank-k matrices that tie for the minimum.',
        },
        {
          label: 'Compute storage savings',
          strategy: 'Count entries to measure compression. Rank-k approximation stores k*(m+n+1) numbers vs m*n for the original. Compression ratio = m*n / (k*(m+n+1)).',
          explanation: 'Storing U[:, :k] needs k*m numbers. Storing s[:k] needs k. Storing Vt[:k, :] needs k*n. Total: k*(m+n+1). For 100×80 matrix with k=5: 5*(100+80+1) = 905 numbers vs 8000 original — 8.8× compression.',
          math: '\\text{compression ratio} = \\frac{mn}{k(m+n+1)} = \\frac{8000}{905} \\approx 8.8\\times',
        },
      ],
    },
  ],

  examples: [
    {
      id: 'la5-004-ex1',
      title: 'Matrix from SVD vs SVD from Matrix',
      problem: 'How do you construct a matrix with prescribed singular values? Build a 3×3 matrix with σ=[5,3,1] and verify with SVD.',
      solution: 'Choose any orthonormal U and V, then A = U @ np.diag(s) @ V.T. Verify with np.linalg.svd(A).',
      steps: [
        'Choose U = identity, V = Hadamard / sqrt(8), s = [5, 3, 1].',
        'Build: `A = U @ np.diag([5,3,1]) @ V.T`.',
        'Verify: `U2, s2, Vt2 = svd(A)` → s2 should be [5,3,1] (may differ in signs of U,V columns).',
        'The singular values are unique; U and V are not (sign ambiguity in each column).',
      ],
    },
    {
      id: 'la5-004-ex2',
      title: 'Pseudoinverse via SVD',
      problem: 'Compute the pseudoinverse of a non-square matrix $A = \\begin{bmatrix}1&0&0\\\\0&1&0\\end{bmatrix}$ using SVD and verify $AA^+A=A$.',
      solution: 'A⁺ = V @ inv(Σ) @ Uᵀ where inv(Σ) inverts nonzero diagonals. In code: s_inv = 1/s; A_pinv = Vt.T @ np.diag(s_inv) @ U.T.',
      steps: [
        '`U, s, Vt = svd(A, full_matrices=False)` → s=[1,1], shapes U:2×2, Vt:2×3.',
        '`s_inv = 1/s` (safe since no zeros here). `A_pinv = Vt.T @ np.diag(s_inv) @ U.T`.',
        'Verify: `np.allclose(A @ A_pinv @ A, A)` → True.',
        '`np.linalg.pinv(A)` does this internally — use it in practice.',
      ],
    },
  ],

  challenges: [
    {
      id: 'la5-004-ch1',
      title: 'Movie recommendation via SVD',
      difficulty: 'hard',
      challengeType: 'write',
      prompt: 'Build a 5-user × 4-movie rating matrix (with some entries missing/zero). Use rank-2 SVD to find latent "genre" dimensions. Interpret: what does U represent (user preferences)? What does Vt represent (movie genre weights)? Then predict the rating user 3 would give movie 4 by computing `U[2, :2] @ np.diag(s[:2]) @ Vt[:2, 3]`.',
      hint: 'Think of the two left singular vectors as "genres." Users with high U[:,0] like genre 0 movies.',
    },
    {
      id: 'la5-004-ch2',
      title: 'Find the optimal k using a scree plot',
      difficulty: 'medium',
      challengeType: 'write',
      prompt: 'Create a 50×40 matrix with true rank 3 (plus 5% noise). Compute SVD and find k such that cumulative variance explained ≥ 95%. Plot the singular values (or just print them). Verify that k=3 is the answer, and explain why the "noise" singular values don\'t drop to exactly zero.',
      hint: 'Generate signal: `low_rank = U_true @ V_true.T`; noise: `0.05 * np.random.randn(50,40)`. The noise singular values are nonzero because random noise has a tiny projection onto every direction.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathtt{np.linalg.svd}(A, \\mathtt{full\\_matrices=False})', meaning: 'Thin (economy) SVD. For m×n matrix: U is m×k, s is (k,), Vt is k×n where k=min(m,n). U and Vt have orthonormal columns/rows respectively.' },
      { symbol: '\\mathtt{s}[i]^2 / \\sum_j \\mathtt{s}[j]^2', meaning: 'Fraction of variance (energy) explained by the i-th singular value. Use cumsum to find how many singular values are needed for a given threshold.' },
      { symbol: 'U[:, :k] @ \\mathtt{np.diag}(s[:k]) @ Vt[:k, :]', meaning: 'Rank-k approximation to A. Best rank-k approximation in Frobenius norm (Eckart-Young). Storage: k*(m+n+1) vs m*n original.' },
      { symbol: '\\|A - A_k\\|_F = \\sqrt{\\sum_{i>k}\\sigma_i^2}', meaning: 'Eckart-Young error: equals sqrt of sum of squared dropped singular values. Verify this numerically as a sanity check on SVD computations.' },
    ],
    rulesOfThumb: [
      'Vt is already transposed — never write `Vt.T` in the reconstruction.',
      'Use full_matrices=False for memory efficiency on tall matrices.',
      'Always verify reconstruction: np.allclose(A, U @ np.diag(s) @ Vt).',
      'Find k where cumulative variance ≥ 90-95% for most applications.',
      'Singular values on log scale — the "knee" shows the true rank.',
    ],
  },

  quiz: [
    {
      id: 'la5-004-q1',
      question: '`np.linalg.svd(A, full_matrices=False)` returns `Vt`. What is `Vt[2, :]`?',
      options: [
        'The third LEFT singular vector (a column of U)',
        'The third RIGHT singular vector (the vector v₃ such that Av₃ = σ₃u₃)',
        'The transpose of the third right singular vector',
        'The third row of U',
      ],
      answer: 1,
      explanation: 'Vt is V-transposed. The i-th row of Vt is the i-th right singular vector vᵢ. These are the "input directions" that A maps cleanly — Avᵢ = σᵢuᵢ. Since Vt is already transposed, `Vt[i, :]` gives you vᵢ directly.',
    },
    {
      id: 'la5-004-q2',
      question: 'You truncate SVD to rank k=5 on a 100×80 matrix with full rank r=20. How many numbers must you store for the rank-5 approximation (U[:,:5], s[:5], Vt[:5,:])?',
      options: ['505', '905', '400', '8000'],
      answer: 1,
      explanation: 'U[:, :5] has 100×5=500 entries. s[:5] has 5 entries. Vt[:5, :] has 5×80=400 entries. Total: 500+5+400=905. Compare to original 100×80=8000 — roughly 8.8× compression.',
    },
  ],
}
