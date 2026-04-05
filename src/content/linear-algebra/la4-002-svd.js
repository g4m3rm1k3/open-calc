export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la4-004',
  slug: 'svd',
  chapter: 'la4',
  order: 4,
  title: 'Singular Value Decomposition (SVD)',
  subtitle: 'Every matrix — square or not, invertible or not — can be broken into three clean pieces: two rotations and a diagonal stretch. This is the most powerful factorization in all of linear algebra.',
  tags: ['SVD', 'singular value decomposition', 'singular values', 'left singular vectors', 'right singular vectors', 'low-rank approximation', 'image compression', 'PCA', 'pseudoinverse'],
  aliases: 'singular value decomposition SVD left right singular vectors sigma U V compression PCA pseudoinverse rank approximation',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "A photograph is stored as a matrix of pixel values. How can you throw away 90% of the mathematical information in that matrix and still have a recognizable image?",
    realWorldContext: "SVD is one of the most widely used algorithms in all of applied mathematics and computer science. Image compression uses it to keep only the most important components of a picture. Netflix and Spotify recommendation systems use it to find hidden patterns in user-rating matrices. Genomics researchers use it to find the most meaningful variation across thousands of genes. Search engines use it (as Latent Semantic Analysis) to match documents to queries based on meaning rather than exact words. In machine learning, Principal Component Analysis (PCA) — the standard tool for dimensionality reduction — is SVD applied to a data matrix. Any time you need to find the most important structure in a large, possibly noisy dataset, SVD is the answer.",
    previewVisualizationId: 'LALesson12_SVD',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You now know how to find eigenvectors, diagonalize square matrices, project onto subspaces, build orthonormal bases, and solve least squares problems. SVD ties it all together. It is the capstone of the linear algebra course — and arguably the most important single theorem in applied mathematics.',
      'We need SVD because diagonalization has a limitation: it only works for square matrices with enough independent eigenvectors. SVD has no such restriction. It works for any matrix, any shape, any rank.',
      '**The geometric picture.** Any linear transformation — any matrix $A$ — takes a sphere in $\\mathbb{R}^n$ and maps it to an ellipse (possibly flattened) in $\\mathbb{R}^m$. SVD breaks this down into three clean steps:\n\n1. **Rotate** the input sphere to align it with the "right" coordinate axes ($V^T$)\n2. **Stretch** each axis independently — no mixing, no rotating — by the singular values ($\\Sigma$)\n3. **Rotate** again to place the ellipse in the output space ($U$)\n\nEvery matrix does exactly this, no matter how complicated it looks.',
      'The stretching amounts $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq 0$ are the **singular values**. They are always non-negative real numbers, even if the original matrix has complex entries. The largest singular value tells you the maximum amount any unit vector gets stretched by $A$. The smallest tells you the minimum.',
      '**The low-rank approximation idea.** SVD can be written as a sum of rank-1 "slices": $A = \\sigma_1 \\mathbf{u}_1 \\mathbf{v}_1^T + \\sigma_2 \\mathbf{u}_2 \\mathbf{v}_2^T + \\cdots$. Each term $\\sigma_i \\mathbf{u}_i \\mathbf{v}_i^T$ is a rank-1 matrix — the simplest possible building block. The singular values measure how important each piece is. If $\\sigma_{50} = 0.001$ and $\\sigma_1 = 1000$, then the 50th piece contributes almost nothing to the full matrix, and you can discard it. Keep only the first $k$ terms and you get the best possible rank-$k$ approximation to $A$ (in a precise mathematical sense).',
      '**Where this is heading:** This is the end of the linear algebra curriculum. But SVD is really a beginning — it is the entry point to data science, machine learning, signal processing, and numerical analysis. Every major field of applied mathematics uses it.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — Advanced Projections & SVD',
        body: '**Previous:** Least Squares — finding the best approximate solution using projection.\n**This lesson:** SVD — the universal factorization $A = U\\Sigma V^T$ that reveals the core structure of any matrix.\n**Next:** End of Linear Algebra — you now have the full toolkit.',
      },
      {
        type: 'definition',
        title: 'The SVD Decomposition',
        body: 'A = U \\Sigma V^T\n\n• $U$ is $m \\times m$, orthogonal (left singular vectors)\n• $\\Sigma$ is $m \\times n$, diagonal (singular values $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq 0$)\n• $V^T$ is $n \\times n$, orthogonal (right singular vectors)',
      },
      {
        type: 'insight',
        title: 'SVD vs. Diagonalization',
        body: '**Diagonalization** $A = PDP^{-1}$:\n• Square matrices only\n• May not exist (defective matrices)\n• $P$ not necessarily orthogonal\n\n**SVD** $A = U\\Sigma V^T$:\n• Any matrix, any shape\n• Always exists\n• $U$ and $V$ are always orthogonal',
      },
      {
        type: 'insight',
        title: 'Singular Values ≠ Eigenvalues',
        body: 'Singular values are always non-negative real numbers — even for matrices whose eigenvalues are complex or negative.\n\nFor symmetric positive definite matrices, singular values = eigenvalues. Otherwise, they are different objects.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson12_SVD',
        title: 'SVD: Rotate → Stretch → Rotate',
        mathBridge: 'The visualization shows the unit circle (all unit vectors in $\\mathbb{R}^2$) being transformed by $A$. Use the step slider: Step 0 = unit circle. Step 1 = apply $V^T$ (first rotation — the circle rotates but stays circular). Step 2 = apply $\\Sigma$ (axis-aligned stretch — the circle becomes an ellipse). Step 3 = apply $U$ (final rotation — the ellipse rotates to its final position). The lengths of the ellipse axes are the singular values $\\sigma_1$ and $\\sigma_2$.',
        caption: 'Any transformation = two rotations and a diagonal stretch.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      '**How to compute SVD.** The key connection to eigenvalues:\n\n- The **right singular vectors** (columns of $V$) are the eigenvectors of $A^TA$.\n- The **singular values** are $\\sigma_i = \\sqrt{\\lambda_i(A^TA)}$ (square roots of eigenvalues of $A^TA$).\n- The **left singular vectors** (columns of $U$) are $\\mathbf{u}_i = \\frac{1}{\\sigma_i}A\\mathbf{v}_i$.\n\nNote: $A^TA$ is always symmetric and positive semidefinite — it always has real, non-negative eigenvalues, so the square roots are always real.',
      '**The compact (thin) SVD.** If $A$ is $m\\times n$ with $\\text{rank}(A) = r$, only the first $r$ singular values are non-zero. The full SVD has many columns of $U$ and $V$ that multiply zero singular values and contribute nothing. The **compact SVD** keeps only the $r$ non-zero terms:\n\n$$A = U_r \\Sigma_r V_r^T \\qquad (m\\times r)(r\\times r)(r\\times n)$$',
      '**Low-rank approximation (Eckart-Young Theorem).** The rank-$k$ matrix closest to $A$ (in Frobenius norm) is obtained by keeping only the first $k$ singular value terms:\n\n$$A_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i\\mathbf{v}_i^T$$\n\nThe approximation error is $\\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$. No other rank-$k$ matrix is closer to $A$.',
      '**The pseudoinverse via SVD.** Recall from Least Squares: the pseudoinverse $A^+$ gives the minimum-norm least squares solution. Via SVD: $A^+ = V\\Sigma^+U^T$, where $\\Sigma^+$ replaces each non-zero diagonal entry $\\sigma_i$ with $1/\\sigma_i$ and keeps zeros as zeros. This handles rank-deficient matrices gracefully — no division by zero.',
      '**The condition number.** The ratio $\\sigma_1 / \\sigma_r$ (largest singular value over smallest non-zero) is the **condition number** of $A$. It measures how sensitive the solution to $A\\mathbf{x} = \\mathbf{b}$ is to small changes in $\\mathbf{b}$. Large condition number = ill-conditioned = numerically fragile.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Computing SVD from Eigenvalues',
        body: 'A^TA = V\\Lambda V^T \\quad \\text{(eigendecomposition)}\n\n\\sigma_i = \\sqrt{\\lambda_i} \\qquad \\mathbf{u}_i = \\frac{1}{\\sigma_i}A\\mathbf{v}_i',
      },
      {
        type: 'theorem',
        title: 'Eckart-Young: Best Low-Rank Approximation',
        body: 'A_k = \\sigma_1\\mathbf{u}_1\\mathbf{v}_1^T + \\cdots + \\sigma_k\\mathbf{u}_k\\mathbf{v}_k^T\n\nis the closest rank-$k$ matrix to $A$.',
      },
      {
        type: 'definition',
        title: 'Pseudoinverse via SVD',
        body: 'A^+ = V\\Sigma^+U^T\n\nwhere $\\Sigma^+$ replaces each $\\sigma_i > 0$ with $1/\\sigma_i$ (zeros stay zero).',
      },
      {
        type: 'insight',
        title: 'Singular Values Rank the Information',
        body: '$\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq \\sigma_r > 0 = \\sigma_{r+1} = \\cdots$\n\nLarge $\\sigma_i$: that direction carries strong signal.\nSmall $\\sigma_i$: that direction is near-zero, likely noise.\nTruncate after rank $k$: keep the signal, discard the noise.',
      },
    ],
    visualizations: [
      {
        id: 'LowRankApproximationViz',
        title: 'Image Compression via Low-Rank Approximation',
        mathBridge: 'The slider controls $k$ — the number of singular values kept. At $k=1$, only the single most important "direction" of the image is kept — a blurry shadow. As $k$ increases, more detail returns. Observe how quickly the image becomes recognizable (often around $k = 20$ for a $256\\times256$ image, while full quality requires $k = 256$). The compression ratio is $(m + n + 1)k / mn$. Watch it in the corner.',
        caption: 'Singular values ranked by importance. Truncate to compress.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: SVD and Low-Rank Approximation',
        mathBridge: 'U, S, Vt = np.linalg.svd(A). Singular values S are sorted descending. Reconstruct: A ≈ U[:,:k] @ diag(S[:k]) @ Vt[:k,:]. Condition number = S[0]/S[-1]. Rank = number of non-zero singular values.',
        caption: 'Decompose a matrix into singular values, build low-rank approximations, and measure the condition number.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing the SVD',
              prose: [
                '`np.linalg.svd(A)` returns U, S, Vt where A = U @ diag(S) @ Vt.',
                'U has orthonormal columns, S contains singular values in descending order, Vt has orthonormal rows.',
                'The rank of A equals the number of non-zero singular values.',
              ],
              code: `import numpy as np

A = np.array([[3., 1., 1.],
              [1., 3., 1.]])   # 2×3 matrix

U, S, Vt = np.linalg.svd(A)

print(f"Shape of A: {A.shape}")
print(f"U shape: {U.shape}  (orthonormal columns)")
print(f"S = {S.round(4)}  (singular values, descending)")
print(f"Vt shape: {Vt.shape}  (orthonormal rows)")
print()

# Reconstruct A from full SVD
S_mat = np.zeros_like(A, dtype=float)
np.fill_diagonal(S_mat, S)
A_reconstructed = U @ S_mat @ Vt
print("A reconstructed:", np.allclose(A_reconstructed, A))
print()
print(f"rank(A) ≈ {np.sum(S > 1e-10)}  (non-zero singular values)")`,
            },
            {
              id: 2,
              cellTitle: 'Low-rank approximation — Eckart-Young theorem',
              prose: [
                'The rank-k approximation keeps only the k largest singular values. It is the best possible rank-k approximation (Eckart-Young theorem).',
                'Watch how quickly the approximation improves as k increases.',
              ],
              code: `import numpy as np

# A 5×5 matrix
np.random.seed(42)
A = np.random.randint(1, 10, (5, 5)).astype(float)
U, S, Vt = np.linalg.svd(A)

print("Original matrix A:")
print(A)
print(f"Singular values: {S.round(2)}")
print()

for k in [1, 2, 3, 5]:
    # Rank-k approximation
    A_k = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
    error = np.linalg.norm(A - A_k, 'fro')
    print(f"k={k}: Frobenius error = {error:.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'Condition number — numerical stability',
              prose: [
                'The condition number = σ₁ / σₙ (largest / smallest singular value). It measures how much a small change in b amplifies the error in the solution to Ax = b.',
                'A large condition number means the matrix is nearly singular — small input errors cause large output errors.',
              ],
              code: `import numpy as np

# Well-conditioned
A = np.array([[3., 1.], [1., 3.]])
U, S, Vt = np.linalg.svd(A)
cond = S[0] / S[-1]
print(f"Well-conditioned: condition number = {cond:.2f}")
print(f"  (np.linalg.cond = {np.linalg.cond(A):.2f})")
print()

# Ill-conditioned: nearly singular (rows almost proportional)
B = np.array([[1., 2.], [1.001, 2.001]])
print(f"Ill-conditioned: condition number = {np.linalg.cond(B):.1f}")
print("  (large → tiny input error causes huge solution error)")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'SVD-based pseudoinverse',
              difficulty: 'hard',
              prompt: 'Compute the pseudoinverse of A = [[1,2],[3,4],[5,6]] using SVD: A⁺ = V Σ⁺ Uᵀ, where Σ⁺ replaces each σᵢ with 1/σᵢ. Verify by checking that A⁺ @ A ≈ I (n×n identity). Compare with np.linalg.pinv(A).',
              code: `import numpy as np

A = np.array([[1., 2.],
              [3., 4.],
              [5., 6.]])

# U, S, Vt = np.linalg.svd(A, full_matrices=False)
# S_plus = 1/S for non-zero entries
# A_plus = Vt.T @ np.diag(S_plus) @ U.T
# verify: A_plus @ A ≈ I (2×2)
# compare: np.linalg.pinv(A)
`,
              hint: 'Use full_matrices=False for the compact SVD. S_plus = 1.0/S (all entries are non-zero here). A_plus = Vt.T @ np.diag(S_plus) @ U.T. Check np.allclose(A_plus @ A, np.eye(2)).',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Existence of SVD (sketch).** For any real $m\\times n$ matrix $A$, the matrix $A^TA$ is real, symmetric, and positive semidefinite. By the Spectral Theorem, it has a complete orthonormal eigenbasis $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_n\\}$ with non-negative eigenvalues $\\lambda_1 \\geq \\cdots \\geq \\lambda_n \\geq 0$. Setting $\\sigma_i = \\sqrt{\\lambda_i}$ and $\\mathbf{u}_i = A\\mathbf{v}_i/\\sigma_i$ for $\\sigma_i > 0$, and extending $\\{\\mathbf{u}_1,\\ldots,\\mathbf{u}_r\\}$ to an orthonormal basis of $\\mathbb{R}^m$, gives the SVD $A = U\\Sigma V^T$.',
      '**Uniqueness.** The singular values $\\sigma_1 \\geq \\cdots \\geq \\sigma_r > 0$ are uniquely determined by $A$ (they are the square roots of the eigenvalues of $A^TA$). However, $U$ and $V$ are not unique — there is freedom in choosing the singular vectors when singular values are repeated.',
      '**The four fundamental subspaces via SVD.** The SVD cleanly reveals all four subspaces:\n- $\\text{col}(A)$: spanned by $\\{\\mathbf{u}_1, \\ldots, \\mathbf{u}_r\\}$ (left singular vectors for non-zero $\\sigma_i$)\n- $\\text{null}(A^T)$: spanned by $\\{\\mathbf{u}_{r+1}, \\ldots, \\mathbf{u}_m\\}$\n- $\\text{row}(A)$: spanned by $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_r\\}$\n- $\\text{null}(A)$: spanned by $\\{\\mathbf{v}_{r+1}, \\ldots, \\mathbf{v}_n\\}$',
      '**The Eckart-Young Theorem (formal statement).** For the Frobenius norm $\\|M\\|_F = \\sqrt{\\sum_{ij} M_{ij}^2}$:\n\n$$\\min_{\\text{rank}(B)\\leq k} \\|A - B\\|_F = \\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$$\n\nThe truncated SVD $A_k$ is the best rank-$k$ approximation. This holds also for the spectral norm $\\|M\\|_2 = \\sigma_1(M)$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'SVD Existence',
        body: 'Every real $m \\times n$ matrix $A$ has a singular value decomposition $A = U\\Sigma V^T$, where $U$ and $V$ are orthogonal and $\\Sigma$ is diagonal with non-negative entries.',
      },
      {
        type: 'insight',
        title: 'SVD Generalizes Everything',
        body: '• $A^+ = V\\Sigma^+U^T$ (pseudoinverse for least squares)\n• $A_k = \\sum_{i=1}^k \\sigma_i\\mathbf{u}_i\\mathbf{v}_i^T$ (best rank-$k$ approx)\n• PCA = SVD of the centered data matrix\n• $\\text{rank}(A) = $ number of non-zero $\\sigma_i$\n• $\\|A\\|_2 = \\sigma_1$, $\\|A\\|_F = \\sqrt{\\sum_i \\sigma_i^2}$',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la4-004-ex1',
      title: 'Computing the SVD of a 2×2 Matrix',
      problem: 'Find the SVD of $A = \\begin{bmatrix}3&0\\\\0&2\\end{bmatrix}$.',
      steps: [
        {
          expression: 'A^TA = \\begin{bmatrix}3&0\\\\0&2\\end{bmatrix}^T\\begin{bmatrix}3&0\\\\0&2\\end{bmatrix} = \\begin{bmatrix}9&0\\\\0&4\\end{bmatrix}',
          annotation: 'Since $A$ is diagonal and symmetric, $A^TA = A^2$ here.',
          strategyTitle: 'Compute AᵀA',
          checkpoint: 'What are the eigenvalues of this diagonal matrix?',
          hints: ['Diagonal matrix — eigenvalues are the diagonal entries: $\\lambda_1 = 9$, $\\lambda_2 = 4$.'],
        },
        {
          expression: '\\sigma_1 = \\sqrt{9} = 3, \\quad \\sigma_2 = \\sqrt{4} = 2',
          annotation: 'Singular values are square roots of eigenvalues of $A^TA$.',
          strategyTitle: 'Singular values',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'V = I = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} \\quad \\text{(eigenvectors of } A^TA \\text{ are standard basis)}',
          annotation: 'The eigenvectors of a diagonal matrix are the standard basis vectors.',
          strategyTitle: 'Right singular vectors V',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{u}_1 = \\frac{1}{\\sigma_1}A\\mathbf{v}_1 = \\frac{1}{3}\\begin{bmatrix}3\\\\0\\end{bmatrix} = \\begin{bmatrix}1\\\\0\\end{bmatrix}, \\quad \\mathbf{u}_2 = \\frac{1}{2}\\begin{bmatrix}0\\\\2\\end{bmatrix} = \\begin{bmatrix}0\\\\1\\end{bmatrix}',
          annotation: 'Left singular vectors via $\\mathbf{u}_i = A\\mathbf{v}_i/\\sigma_i$.',
          strategyTitle: 'Left singular vectors U',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'A = U\\Sigma V^T = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}3&0\\\\0&2\\end{bmatrix}\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} = A \\quad ✓',
          annotation: 'For a diagonal matrix with positive entries, SVD is trivial — $U = V = I$ and $\\Sigma = A$ itself.',
          strategyTitle: 'Assemble SVD',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'For a diagonal positive matrix, SVD is just the matrix itself. The singular values are the diagonal entries, and both $U$ and $V$ are the identity. This is the simplest possible SVD — the baseline.',
    },
    {
      id: 'la4-004-ex2',
      title: 'Low-Rank Approximation: Rank-1 Truncation',
      problem: 'The matrix $A = \\begin{bmatrix}3&2\\\\2&3\\end{bmatrix}$ has singular values $\\sigma_1 = 5$ and $\\sigma_2 = 1$, with left/right singular vectors $\\mathbf{u}_1 = \\mathbf{v}_1 = \\frac{1}{\\sqrt{2}}[1,1]^T$ and $\\mathbf{u}_2 = \\mathbf{v}_2 = \\frac{1}{\\sqrt{2}}[1,-1]^T$. Find the best rank-1 approximation $A_1$ and the approximation error.',
      steps: [
        {
          expression: 'A_1 = \\sigma_1\\mathbf{u}_1\\mathbf{v}_1^T = 5 \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\end{bmatrix} \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1&1\\end{bmatrix} = 5 \\cdot \\frac{1}{2}\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix} = \\begin{bmatrix}2.5&2.5\\\\2.5&2.5\\end{bmatrix}',
          annotation: 'Keep only the first term of the SVD expansion.',
          strategyTitle: 'Build rank-1 approximation',
          checkpoint: 'What is the rank of $A_1$?',
          hints: ['A rank-1 matrix: all rows are scalar multiples of each other. $A_1$ has rank 1. ✓'],
        },
        {
          expression: 'A - A_1 = \\begin{bmatrix}3&2\\\\2&3\\end{bmatrix} - \\begin{bmatrix}2.5&2.5\\\\2.5&2.5\\end{bmatrix} = \\begin{bmatrix}0.5&-0.5\\\\-0.5&0.5\\end{bmatrix}',
          annotation: 'The discarded portion — what rank-1 truncation throws away.',
          strategyTitle: 'Compute discarded part',
          checkpoint: 'Can you verify this equals $\\sigma_2\\mathbf{u}_2\\mathbf{v}_2^T$?',
          hints: ['$\\sigma_2\\mathbf{u}_2\\mathbf{v}_2^T = 1 \\cdot \\frac{1}{2}[1,-1]^T[1,-1] = \\frac{1}{2}\\begin{bmatrix}1&-1\\\\-1&1\\end{bmatrix} = \\begin{bmatrix}0.5&-0.5\\\\-0.5&0.5\\end{bmatrix}$ ✓'],
        },
        {
          expression: '\\|A - A_1\\|_F = \\sigma_2 = 1',
          annotation: 'The approximation error equals the discarded singular value. This is the Eckart-Young theorem: $\\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots}$. Here $k=1$, so error $= \\sigma_2 = 1$.',
          strategyTitle: 'Approximation error',
          checkpoint: 'What fraction of the "information" (Frobenius norm) did we keep?',
          hints: ['$\\|A\\|_F = \\sqrt{\\sigma_1^2+\\sigma_2^2} = \\sqrt{25+1} = \\sqrt{26}$. We kept $\\sigma_1^2 = 25$ out of $26$. That is $96\\%$ of the information in one rank-1 matrix.'],
        },
      ],
      conclusion: 'The best rank-1 approximation retains 96% of the information ($\\sigma_1^2/\\sum\\sigma_i^2 = 25/26$) with half the storage (4 numbers down to 2). This is the essence of data compression via SVD.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la4-004-ch1',
      difficulty: 'easy',
      problem: 'A matrix has singular values $\\sigma_1 = 10$, $\\sigma_2 = 3$, $\\sigma_3 = 0.1$. (a) What is the rank of the matrix? (b) What percentage of the Frobenius norm is captured by the rank-1 approximation?',
      hint: 'Rank = number of non-zero singular values. Frobenius norm² = sum of σᵢ².',
      walkthrough: [
        {
          expression: '\\text{rank}(A) = 3 \\quad (\\text{all three singular values are non-zero})',
          annotation: 'Every non-zero $\\sigma_i$ corresponds to a linearly independent direction.',
        },
        {
          expression: '\\|A\\|_F^2 = 10^2 + 3^2 + 0.1^2 = 100 + 9 + 0.01 = 109.01',
          annotation: 'Total Frobenius norm squared.',
        },
        {
          expression: '\\text{Rank-1 capture} = \\frac{\\sigma_1^2}{\\|A\\|_F^2} = \\frac{100}{109.01} \\approx 91.7\\%',
          annotation: 'The first singular value captures most of the information.',
        },
      ],
      answer: 'rank = 3; rank-1 approximation captures ≈91.7% of Frobenius norm',
    },
    {
      id: 'la4-004-ch2',
      difficulty: 'medium',
      problem: 'For a symmetric positive definite matrix $A$ with eigenvalues $\\lambda_1 > \\lambda_2 > 0$, show that the singular values equal the eigenvalues.',
      hint: 'Use the fact that for symmetric $A = Q\\Lambda Q^T$ (spectral theorem), the SVD has a specific form.',
      walkthrough: [
        {
          expression: 'A^TA = (Q\\Lambda Q^T)^T(Q\\Lambda Q^T) = Q\\Lambda^TQ^T \\cdot Q\\Lambda Q^T = Q\\Lambda^2 Q^T',
          annotation: 'Since $A$ is symmetric, $A^T = A$. Since $A = Q\\Lambda Q^T$, we get $A^TA = A^2 = Q\\Lambda^2 Q^T$.',
        },
        {
          expression: '\\sigma_i = \\sqrt{\\lambda_i(A^TA)} = \\sqrt{\\lambda_i^2} = |\\lambda_i| = \\lambda_i \\quad (\\text{since } \\lambda_i > 0)',
          annotation: 'Singular values are square roots of eigenvalues of $A^TA = A^2$, which are $\\lambda_i^2$.',
        },
        {
          expression: 'U = V = Q \\quad \\Sigma = \\Lambda',
          annotation: 'For symmetric positive definite matrices, SVD and eigendecomposition coincide: $A = Q\\Lambda Q^T = U\\Sigma V^T$.',
        },
      ],
      answer: 'For symmetric positive definite A: σᵢ = λᵢ. SVD = eigendecomposition.',
    },
    {
      id: 'la4-004-ch3',
      difficulty: 'hard',
      problem: 'A rank-2 matrix has SVD with $\\sigma_1 = 4, \\sigma_2 = 3$, and appropriate $\\mathbf{u}_i, \\mathbf{v}_i$. (a) What is $\\|A\\|_F$? (b) What is the minimum error if you approximate $A$ with a rank-1 matrix? (c) What fraction of the information does rank-1 capture?',
      hint: 'Eckart-Young: error = σ₂. Frobenius norm² = σ₁² + σ₂². Information fraction = σ₁²/(σ₁²+σ₂²).',
      walkthrough: [
        {
          expression: '\\|A\\|_F = \\sqrt{\\sigma_1^2 + \\sigma_2^2} = \\sqrt{16+9} = \\sqrt{25} = 5',
          annotation: 'Frobenius norm via singular values.',
        },
        {
          expression: '\\|A - A_1\\|_F = \\sigma_2 = 3',
          annotation: 'Eckart-Young: minimum rank-1 approximation error equals $\\sigma_2$.',
        },
        {
          expression: '\\frac{\\sigma_1^2}{\\sigma_1^2+\\sigma_2^2} = \\frac{16}{25} = 64\\%',
          annotation: 'Rank-1 captures 64% of the total information. To capture the remaining 36%, add the second term.',
        },
      ],
      answer: '||A||_F = 5, rank-1 error = 3, rank-1 captures 64%',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'A = U\\Sigma V^T', meaning: 'SVD: U and V are orthogonal, Σ is diagonal with singular values σᵢ ≥ 0' },
      { symbol: '\\sigma_i = \\sqrt{\\lambda_i(A^TA)}', meaning: 'Singular values are square roots of eigenvalues of AᵀA' },
      { symbol: 'A_k = \\sum_{i=1}^k \\sigma_i\\mathbf{u}_i\\mathbf{v}_i^T', meaning: 'Best rank-k approximation to A (Eckart-Young)' },
      { symbol: 'A^+ = V\\Sigma^+U^T', meaning: 'Pseudoinverse via SVD — used for minimum-norm least squares' },
      { symbol: '\\sigma_1/\\sigma_r', meaning: 'Condition number — measures numerical stability of the linear system' },
    ],
    rulesOfThumb: [
      'SVD always exists — any matrix, any size, any rank.',
      'Singular values are always non-negative real numbers.',
      'Large singular values = important directions. Small ≈ noise.',
      'Rank = number of non-zero singular values.',
      '||A||_F = sqrt(σ₁² + σ₂² + ...). ||A||₂ = σ₁.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la3-002',
        label: 'Diagonalization',
        note: 'SVD generalizes $A = PDP^{-1}$ to all matrices. The key difference: SVD uses two different orthogonal matrices $U$ and $V$ instead of $P$ and $P^{-1}$, and $\\Sigma$ replaces $D$. SVD always works; diagonalization sometimes does not.',
      },
      {
        lessonId: 'la4-003',
        label: 'Least Squares',
        note: 'The pseudoinverse $A^+ = V\\Sigma^+U^T$ is the deepest way to understand least squares. It gives the minimum-norm solution even when $A^TA$ is singular — something the normal equations cannot handle.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'pca',
        label: 'Principal Component Analysis (PCA)',
        note: 'PCA is SVD applied to a centered data matrix. The right singular vectors are the principal components; singular values squared (divided by $n-1$) are the variances explained. SVD IS PCA.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Any matrix = rotate (Vᵀ) → stretch (Σ) → rotate (U). Three clean steps.',
    'Singular values rank the directions by importance. Large = signal. Small = noise.',
    'SVD always exists. Diagonalization sometimes fails. SVD never does.',
    'Truncate to rank k: keep the k biggest σᵢ terms. Best possible compression.',
    'Pseudoinverse A⁺ = VΣ⁺Uᵀ handles everything least squares cannot.',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la4-004-assess-1',
        type: 'input',
        text: 'A matrix has singular values 6, 4, and 0. What is the rank of the matrix?',
        answer: '2',
        hint: 'Rank = number of non-zero singular values.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'svd-q1',
      type: 'choice',
      text: 'What is guaranteed to be true about the matrices $U$ and $V$ in every SVD $A = U\\Sigma V^T$?',
      options: [
        'They are diagonal',
        'They are square and orthogonal — their columns are orthonormal',
        'They are equal ($U = V$)',
        'They are the same as the eigenvectors of $A$',
      ],
      answer: 'They are square and orthogonal — their columns are orthonormal',
      hints: ['$U$ and $V$ are orthogonal matrices — their columns form orthonormal sets. This is what makes SVD so numerically stable.'],
      reviewSection: 'Intuition tab — SVD Decomposition',
    },
    {
      id: 'svd-q2',
      type: 'choice',
      text: 'How do you compute the singular values of $A$?',
      options: [
        'They are the eigenvalues of $A$ directly',
        'They are the square roots of the eigenvalues of $A^TA$',
        'They are the diagonal entries of $A$',
        'They are the eigenvalues of $A + A^T$',
      ],
      answer: 'They are the square roots of the eigenvalues of $A^TA$',
      hints: ['$A^TA$ is always symmetric positive semidefinite — it always has non-negative real eigenvalues, so square roots are always defined.'],
      reviewSection: 'Math tab — Computing SVD from Eigenvalues',
    },
    {
      id: 'svd-q3',
      type: 'input',
      text: 'A matrix has singular values 5 and 12. What is its Frobenius norm?',
      answer: '13',
      hints: ['$\\|A\\|_F = \\sqrt{\\sigma_1^2 + \\sigma_2^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$.'],
      reviewSection: 'Rigor tab — SVD Generalizes Everything',
    },
    {
      id: 'svd-q4',
      type: 'choice',
      text: 'Why is the rank-$k$ truncated SVD the BEST rank-$k$ approximation to $A$?',
      options: [
        'Because it uses the largest eigenvalues of $A$',
        'Because it uses the first $k$ columns of $A$',
        'The Eckart-Young theorem proves no other rank-$k$ matrix is closer in Frobenius (or spectral) norm',
        'Because $U$ and $V$ are orthogonal',
      ],
      answer: 'The Eckart-Young theorem proves no other rank-$k$ matrix is closer in Frobenius (or spectral) norm',
      hints: ['Eckart-Young: $\\min_{\\text{rank}(B)\\leq k}\\|A-B\\|_F = \\|A-A_k\\|_F = \\sqrt{\\sigma_{k+1}^2+\\cdots}$. Proved, not just claimed.'],
      reviewSection: 'Math tab — Low-Rank Approximation',
    },
  ],
};
