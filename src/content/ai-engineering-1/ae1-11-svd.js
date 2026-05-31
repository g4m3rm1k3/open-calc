export default {
  id: 'ae-p1-11-svd',
  slug: 'svd',
  chapter: 'ae-p1',
  order: 10,
  title: 'Singular Value Decomposition',
  subtitle: 'Every matrix is three things: rotate, stretch, rotate. SVD shows you all three.',
  tags: ['SVD', 'singular-values', 'low-rank', 'compression', 'pseudoinverse', 'PCA', 'Eckart-Young', 'noise-reduction'],

  hook: {
    question: 'How does JPEG compress an image to 5% of its original size without looking terrible?',
    realWorldContext:
      'SVD is the engine behind a striking range of AI applications: image compression, noise reduction, recommendation systems (Netflix Prize), Latent Semantic Analysis (early NLP), and the geometric intuition behind PCA and low-rank adaptation (LoRA). The Eckart-Young theorem proves that truncated SVD gives the best possible low-rank approximation to a matrix. When LoRA fine-tunes a 4096×4096 weight matrix with rank-16, it is assuming the weight update lies in a 16-dimensional subspace — which is an SVD claim. Understanding SVD means understanding what "the essential structure of a matrix" actually means.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Every matrix A (m×n) can be written as A = UΣVᵀ. U (m×m) and V (n×n) are orthogonal matrices (pure rotations). Σ (m×n) is diagonal with non-negative entries called singular values, sorted largest to smallest. Geometrically: Vᵀ rotates the input space, Σ stretches each axis, U rotates the output. Any matrix transformation decomposes into these three steps.',
      'The power of SVD comes from truncation. Keep only the k largest singular values: A_k = U_k Σ_k Vᵀ_k. This is the best possible rank-k approximation to A in the Frobenius norm (Eckart-Young theorem). For a 256×256 image with singular values decaying rapidly, k=20 can capture 95% of the image energy at 6% of the storage. The singular values measure how much each "layer" contributes to the matrix.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'PCA is SVD on centered data',
        body: 'Center the data: X̃ = X - mean(X). Compute SVD: X̃ = UΣVᵀ. The columns of V are the principal components. The singular values σᵢ relate to variance: λᵢ = σᵢ²/(n-1). This is why sklearn\'s PCA uses SVD internally — it is numerically more stable than eigendecomposing the covariance matrix directly.',
      },
      {
        type: 'insight',
        title: 'Condition number = σ_max / σ_min measures numerical stability',
        body: 'If condition number K = 10^6, a perturbation of size ε in the input causes error up to K·ε in the solution. Ill-conditioned systems (large K) amplify small errors. The pseudoinverse A⁺ = V Σ⁺ Uᵀ (where Σ⁺ inverts non-zero singular values) provides the minimum-norm least-squares solution to Ax = b — stable even when A is rank-deficient.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'SVD from Scratch',
        mathBridge: 'A = UΣVᵀ. A_k = U_k Σ_k V_kᵀ is rank-k. Frobenius error = sqrt(σ_{k+1}² + ... + σ_r²). PCA principal components = columns of V.',
        caption: 'Implement SVD via power iteration, build truncated approximations, and see the geometry.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'SVD fundamentals and verification',
              prose: [
                '## A = UΣVᵀ',
                '- **U** (m×m): left singular vectors. Columns are orthonormal. Span the column space.',
                '- **Σ** (m×n): diagonal, singular values σ₁ ≥ σ₂ ≥ ... ≥ 0.',
                '- **Vᵀ** (n×n): right singular vectors. Rows are orthonormal. Span the row space.',
                'Key property: A·vᵢ = σᵢ·uᵢ — each right singular vector maps to the corresponding left singular vector, scaled by the singular value.',
                '## Geometric interpretation',
                '1. Vᵀ: rotate/reflect input space',
                '2. Σ: stretch along each axis by σᵢ',
                '3. U: rotate/reflect output space',
              ],
              code: `import numpy as np

np.random.seed(42)

# Create a 4×3 matrix and compute SVD
A = np.array([[3, 1, 0],
              [1, 2, 1],
              [0, 1, 3],
              [1, 0, 1]], dtype=float)

U, S, Vt = np.linalg.svd(A, full_matrices=False)
# full_matrices=False gives "thin SVD": U is (m×k), S is (k,), Vt is (k×n), k=min(m,n)

print(f"A shape: {A.shape}")
print(f"U shape: {U.shape}  (left singular vectors)")
print(f"S shape: {S.shape}  (singular values: {S.round(4)})")
print(f"Vt shape: {Vt.shape} (right singular vectors, transposed)")

# Verify reconstruction: A = U @ diag(S) @ Vt
A_reconstructed = U @ np.diag(S) @ Vt
print(f"\\nReconstruction error: {np.linalg.norm(A - A_reconstructed):.2e}")

# Verify U and V are orthogonal: UᵀU = I, VVᵀ = I
print(f"UᵀU = I?  max error: {np.abs(U.T @ U - np.eye(3)).max():.2e}")
print(f"VVᵀ = I?  max error: {np.abs(Vt @ Vt.T - np.eye(3)).max():.2e}")

# Verify A @ vᵢ = σᵢ × uᵢ
print("\\nVerify A·vᵢ = σᵢ·uᵢ:")
for i in range(3):
    v_i = Vt[i]
    u_i = U[:, i]
    lhs = A @ v_i
    rhs = S[i] * u_i
    match = np.allclose(lhs, rhs) or np.allclose(lhs, -rhs)
    print(f"  i={i}: σ={S[i]:.4f}  match={match}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Low-rank approximation: the Eckart-Young theorem',
              prose: [
                '## Truncated SVD = Best Low-Rank Approximation',
                'Eckart-Young theorem: among all rank-k matrices B, the one that minimizes ‖A - B‖_F is A_k = U_k Σ_k V_kᵀ.',
                '```\nA_k = Σᵢ₌₁ᵏ σᵢ · uᵢ · vᵢᵀ\n```',
                'Each rank-1 layer σᵢ·uᵢ·vᵢᵀ contributes σᵢ² to the Frobenius norm squared.',
                'Frobenius reconstruction error: ‖A - A_k‖_F = sqrt(σ_{k+1}² + ... + σ_r²)',
                'This is exactly why LoRA works: if the update ΔW lives in a low-rank subspace, truncating to rank k captures most of the update with much fewer parameters.',
              ],
              code: `import numpy as np

np.random.seed(42)

# Create a rank-5 matrix in 100×80 ambient space
m, n, true_rank = 100, 80, 5
U_true = np.linalg.qr(np.random.randn(m, true_rank))[0]
V_true = np.linalg.qr(np.random.randn(n, true_rank))[0]
S_true = np.array([50.0, 30.0, 15.0, 8.0, 3.0])
A = U_true @ np.diag(S_true) @ V_true.T  # exact rank-5 matrix

U, S, Vt = np.linalg.svd(A, full_matrices=False)

print(f"Matrix shape: {A.shape}, true rank: {true_rank}")
print(f"Top 8 singular values: {S[:8].round(4)}")
print(f"(Values 6-8 should be ~0 since true rank is {true_rank})\\n")

# Eckart-Young: truncated SVD gives best rank-k approximation
A_frob = np.linalg.norm(A, 'fro')
print(f"{'k':>4}  {'Error ‖A-Aₖ‖_F':>16}  {'Rel Error':>12}  {'Storage ratio':>14}")
print("-" * 52)
for k in range(1, 8):
    A_k = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
    error = np.linalg.norm(A - A_k, 'fro')
    # Verify: error = sqrt(sum of discarded sigma^2)
    theory_error = np.sqrt(np.sum(S[k:]**2))
    storage = k * (m + n + 1)
    ratio = storage / (m * n)
    print(f"{k:>4}  {error:>16.6f}  {error/A_frob:>12.6f}  {ratio:>13.1%}  (theory={theory_error:.4f})")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'SVD for image compression',
              prose: [
                '## SVD as Compression',
                'An m×n image stored as a matrix needs m×n numbers. Keeping k singular value layers needs k×(m+n+1) numbers.',
                '```\nCompression ratio = k(m+n+1) / (m×n)\n```',
                'For a 256×256 image: full = 65,536 values. k=20: 20×(256+256+1) = 10,260 values (15% storage). The singular values decay rapidly for natural images and structured data — small singular values correspond to high-frequency noise and fine detail.',
              ],
              code: `import numpy as np

np.random.seed(42)

# Build a synthetic structured "image" (256×256)
rows, cols = 256, 256
x = np.linspace(-3, 3, cols)
y = np.linspace(-3, 3, rows)
X, Y = np.meshgrid(x, y)
image = np.sin(X) * np.cos(Y) + 0.5 * np.sin(2*X + Y)
image = (image - image.min()) / (image.max() - image.min()) * 255

print(f"Image: {rows}×{cols} = {rows*cols:,} values")

U, S, Vt = np.linalg.svd(image, full_matrices=False)

total_energy = np.sum(S**2)
print(f"Total singular values: {len(S)}")
print(f"Top 10 singular values: {S[:10].round(2)}")
print()

print(f"{'k':>5}  {'Storage':>10}  {'Ratio':>8}  {'Energy %':>10}  {'RMSE':>8}")
print("-" * 46)
for k in [1, 5, 10, 20, 50, 100, 200]:
    compressed = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
    storage = k * (rows + cols + 1)
    ratio = storage / (rows * cols)
    energy = np.sum(S[:k]**2) / total_energy
    rmse = np.sqrt(np.mean((image - compressed)**2))
    print(f"{k:>5}  {storage:>10,}  {ratio:>7.1%}  {energy:>9.4%}  {rmse:>8.4f}")

print(f"\\nk=20 captures {np.sum(S[:20]**2)/total_energy:.1%} of energy at {20*(rows+cols+1)/(rows*cols):.1%} storage")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Pseudoinverse and PCA connection',
              prose: [
                '## Moore-Penrose Pseudoinverse',
                'A⁺ = V Σ⁺ Uᵀ where Σ⁺ replaces each non-zero σᵢ with 1/σᵢ (and 0 stays 0).',
                '- **Overdetermined system** (m > n, no exact solution): A⁺b gives the minimum-norm least-squares solution',
                '- **Underdetermined system** (m < n, infinitely many solutions): A⁺b gives the minimum-norm solution',
                '- **Singular matrix**: A⁺ handles rank deficiency gracefully; direct inverse fails',
                '## PCA = SVD on centered data',
                '```\nX̃ = U Σ Vᵀ  →  principal components = columns of V\nVariance λᵢ = σᵢ² / (n-1)\n```',
              ],
              code: `import numpy as np

def pseudoinverse(A, tol=1e-10):
    U, S, Vt = np.linalg.svd(A, full_matrices=False)
    S_inv = np.array([1/s if s > tol else 0.0 for s in S])
    return Vt.T @ np.diag(S_inv) @ U.T

# Overdetermined: 3 equations, 2 unknowns — best fit (least squares)
A = np.array([[1, 1], [2, 1], [3, 1]], dtype=float)
b = np.array([3.0, 5.0, 6.0])
x = pseudoinverse(A) @ b
print("Overdetermined system (3 equations, 2 unknowns):")
print(f"  x = {x.round(6)}  residual = {np.linalg.norm(A@x - b):.6f}")

# Underdetermined: 2 equations, 3 unknowns — minimum norm solution
A2 = np.array([[1, 2, 3], [4, 5, 6]], dtype=float)
b2 = np.array([14.0, 32.0])
x2 = pseudoinverse(A2) @ b2
print(f"\\nUnderdetermined system (2 equations, 3 unknowns):")
print(f"  x = {x2.round(6)}  ‖x‖ = {np.linalg.norm(x2):.6f}")
print(f"  A @ x = {(A2 @ x2).round(6)}  (should equal b)")

# PCA is SVD on centered data
np.random.seed(42)
n, d = 100, 5
X = np.random.randn(n, d) @ np.random.randn(d, d)  # correlated features
X_c = X - X.mean(axis=0)

# Method 1: eigendecompose covariance
cov = X_c.T @ X_c / (n - 1)
ev_cov, evec_cov = np.linalg.eigh(cov)
idx = np.argsort(ev_cov)[::-1]
pca_variance = ev_cov[idx]

# Method 2: SVD of centered data
U, S, Vt = np.linalg.svd(X_c, full_matrices=False)
svd_variance = S**2 / (n - 1)

print(f"\\nPCA via covariance eigenvalues:  {pca_variance.round(4)}")
print(f"PCA via SVD (σ²/n-1):            {svd_variance.round(4)}")
print(f"Match: {np.allclose(pca_variance, svd_variance)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Truncated SVD reconstruction',
              difficulty: 'easy',
              prompt: 'Implement `truncated_svd(A, k)` that returns the best rank-k approximation of matrix A, and `compression_ratio(m, n, k)` that returns the fraction of storage used (k*(m+n+1) / (m*n)). Verify that error decreases monotonically as k increases.',
              code: `import numpy as np

np.random.seed(42)

def truncated_svd(A, k):
    """Return best rank-k approximation of A using SVD."""
    pass

def compression_ratio(m, n, k):
    """Return storage fraction: k*(m+n+1) / (m*n)."""
    pass

# Test on a structured matrix
A = np.random.randn(50, 40)
A[:, :5] *= 5  # make first 5 columns dominant

print(f"Matrix shape: {A.shape}")
print(f"\\n{'k':>4}  {'Error':>12}  {'Compression':>14}")
print("-" * 34)
prev_error = float('inf')
for k in [1, 2, 5, 10, 20, 40]:
    A_k = truncated_svd(A, k)
    error = np.linalg.norm(A - A_k, 'fro')
    ratio = compression_ratio(*A.shape, k)
    assert error <= prev_error + 1e-10, f"Error should decrease: k={k}, error={error:.4f} > prev={prev_error:.4f}"
    prev_error = error
    print(f"{k:>4}  {error:>12.4f}  {ratio:>13.1%}")

print("\\nError decreases monotonically ✓")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
np.random.seed(42)
if 'truncated_svd' not in dir() or 'compression_ratio' not in dir():
    res = "ERROR: truncated_svd or compression_ratio not defined."
else:
    A = np.random.randn(30, 20)
    # k=min(m,n) should reconstruct perfectly
    A_full = truncated_svd(A, min(A.shape))
    if np.linalg.norm(A - A_full) > 1e-8:
        res = f"ERROR: k=min(m,n) should reconstruct A perfectly, error={np.linalg.norm(A - A_full):.2e}"
    else:
        # rank-1 approximation should be outer product
        A1 = truncated_svd(A, 1)
        if np.linalg.matrix_rank(A1) > 1:
            res = "ERROR: truncated_svd(A, 1) should be rank-1"
        else:
            # error should decrease
            errs = [np.linalg.norm(A - truncated_svd(A, k)) for k in [1,3,5,10]]
            if not all(errs[i] >= errs[i+1] - 1e-10 for i in range(len(errs)-1)):
                res = f"ERROR: errors should decrease with k: {[round(e,4) for e in errs]}"
            elif abs(compression_ratio(100, 80, 5) - 5*181/(100*80)) > 0.001:
                res = "ERROR: compression_ratio(100,80,5) is wrong"
            else:
                res = "SUCCESS: truncated_svd and compression_ratio work correctly."
res
`,
              hint: 'truncated_svd: U, S, Vt = np.linalg.svd(A, full_matrices=False). Return U[:,:k] @ np.diag(S[:k]) @ Vt[:k,:]. compression_ratio: return k*(m+n+1)/(m*n).',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Compute condition number and detect ill-conditioning',
              difficulty: 'medium',
              prompt: 'Implement `condition_number(A)` = σ_max / σ_min (0 if σ_min ≈ 0). Implement `is_ill_conditioned(A, threshold=1e6)` that returns True if condition number > threshold. Test on a range of matrices from well-conditioned to nearly singular.',
              code: `import numpy as np

def condition_number(A):
    """Compute condition number = sigma_max / sigma_min via SVD.
    Return inf if matrix is singular."""
    pass

def is_ill_conditioned(A, threshold=1e6):
    """Return True if condition number > threshold."""
    pass

matrices = {
    "Identity 3x3":     np.eye(3),
    "Scaled identity":  2.0 * np.eye(3),
    "Symmetric pos def":np.array([[4,2,1],[2,3,1],[1,1,2]], dtype=float),
    "Hilbert 4x4":      np.array([[1/(i+j+1) for j in range(4)] for i in range(4)]),
    "Near-singular":    np.array([[1.0, 1.0], [1.0, 1.0001]]),
    "Singular":         np.array([[1.0, 2.0], [2.0, 4.0]]),
}

print(f"{'Matrix':>22}  {'Condition #':>14}  {'Ill-conditioned?':>18}")
print("-" * 58)
for name, A in matrices.items():
    K = condition_number(A)
    ill = is_ill_conditioned(A)
    print(f"{name:>22}  {K:>14.2f}  {str(ill):>18}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'condition_number' not in dir() or 'is_ill_conditioned' not in dir():
    res = "ERROR: condition_number or is_ill_conditioned not defined."
else:
    K_eye = condition_number(np.eye(4))
    if abs(K_eye - 1.0) > 0.001:
        res = f"ERROR: condition_number(identity) should be 1.0, got {K_eye}"
    else:
        K_near_sing = condition_number(np.array([[1.0, 1.0], [1.0, 1.0001]]))
        if K_near_sing < 1e3:
            res = f"ERROR: near-singular matrix should have large condition number, got {K_near_sing:.0f}"
        else:
            K_singular = condition_number(np.array([[1.0, 2.0], [2.0, 4.0]]))
            if not (K_singular > 1e10 or K_singular == float('inf')):
                res = f"ERROR: singular matrix should have infinite condition number, got {K_singular}"
            else:
                if not is_ill_conditioned(np.array([[1.0, 1.0], [1.0, 1.0001]])):
                    res = "ERROR: near-singular matrix should be ill-conditioned"
                elif is_ill_conditioned(np.eye(3)):
                    res = "ERROR: identity should not be ill-conditioned"
                else:
                    res = f"SUCCESS: condition_number(identity)={K_eye:.1f}, near-singular={K_near_sing:.0f}"
res
`,
              hint: 'U, S, Vt = np.linalg.svd(A, full_matrices=False). condition_number: if S[-1] < 1e-10, return float("inf"), else return S[0]/S[-1]. is_ill_conditioned: return condition_number(A) > threshold.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'In A = UΣVᵀ, the singular values in Σ are:',
      options: [
        'The eigenvalues of A',
        'Non-negative values measuring the "stretch" along each principal direction',
        'The diagonal entries of A',
        'The squared norms of the columns of A',
      ],
      correct: 1,
      explanation: 'Singular values σᵢ are the square roots of eigenvalues of AᵀA (or AAᵀ). They measure how much A stretches each singular direction. σ₁ ≥ σ₂ ≥ ... ≥ 0. For symmetric positive semi-definite matrices, singular values equal eigenvalues.',
    },
    {
      id: 'q2',
      question: 'The Eckart-Young theorem says the best rank-k approximation to A (minimizing Frobenius error) is:',
      options: [
        'The top-k eigendecomposition of A',
        'The truncated SVD: A_k = U_k Σ_k V_kᵀ',
        'The k largest columns of A',
        'The Gram-Schmidt orthogonalization of the k largest rows',
      ],
      correct: 1,
      explanation: 'Eckart-Young: among all matrices B with rank ≤ k, ‖A - B‖_F is minimized by A_k = Σᵢ₌₁ᵏ σᵢ uᵢ vᵢᵀ. The reconstruction error is exactly sqrt(Σᵢ₌ₖ₊₁ σᵢ²).',
    },
    {
      id: 'q3',
      question: 'How does LoRA use SVD concepts to fine-tune large models efficiently?',
      options: [
        'It computes the full SVD of each weight matrix during training',
        'It assumes weight updates have low rank, parameterizing ΔW = AB where A and B are thin matrices',
        'It removes small singular values from the original weight matrices',
        'It replaces all weight matrices with their best rank-1 approximations',
      ],
      correct: 1,
      explanation: 'LoRA parameterizes ΔW = A·B where A is (d×r) and B is (r×d), with r << d. This is a rank-r matrix — the same structure as truncated SVD. The assumption is that the weight update lives in a low-dimensional subspace, which is empirically validated.',
    },
    {
      id: 'q4',
      question: 'The pseudoinverse A⁺ = V Σ⁺ Uᵀ solves overdetermined systems Ax = b by finding:',
      options: [
        'The exact solution',
        'The minimum-norm least-squares solution',
        'The solution with the largest possible norm',
        'The solution that maximizes ‖Ax - b‖',
      ],
      correct: 1,
      explanation: 'For overdetermined systems (no exact solution), A⁺b minimizes ‖Ax - b‖₂ (least squares). Among all least-squares solutions, it picks the one with minimum ‖x‖₂ (minimum norm). This is the same as what numpy\'s lstsq computes.',
    },
    {
      id: 'q5',
      question: 'Why is computing PCA via SVD of X̃ preferred over eigendecomposing the covariance matrix X̃ᵀX̃?',
      options: [
        'SVD is always faster regardless of matrix size',
        'The covariance matrix XᵀX has condition number σ²_max/σ²_min — the square of SVD\'s condition number — losing accuracy for ill-conditioned data',
        'SVD can handle non-square matrices but eigendecomposition cannot',
        'The covariance matrix does not have eigenvalues for non-square data',
      ],
      correct: 1,
      explanation: 'The condition number of AᵀA = (condition number of A)². For ill-conditioned data (small singular values), this squares the numerical error. Direct SVD of the centered data X̃ computes singular values directly without squaring, maintaining twice as many digits of precision.',
    },
  ],
}
