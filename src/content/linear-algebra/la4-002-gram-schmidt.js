export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la4-002',
  slug: 'gram-schmidt',
  chapter: 'la4',
  order: 2,
  title: 'Gram-Schmidt Orthogonalization',
  subtitle: 'How to manufacture a perfectly clean, perpendicular coordinate system out of any messy, tilted basis.',
  tags: ['gram-schmidt', 'orthogonalization', 'orthonormal basis', 'QR decomposition', 'projection', 'normalization'],
  aliases: 'orthogonal basis orthonormal set QR factorization perpendicular basis construct orthogonal',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "Your GPS calculates position using satellite signals that arrive from messy, non-perpendicular directions. How does it clean up the geometry to make the math tractable?",
    realWorldContext: "Gram-Schmidt is the algorithm behind QR decomposition, which is used everywhere: solving least squares problems in statistics, finding eigenvalues numerically (the QR algorithm), compressing images, and training neural networks. Every time you want to work in coordinates that are clean and perpendicular — even if your original data is tilted and messy — Gram-Schmidt does the cleaning. It is one of the most-used algorithms in scientific computing.",
    previewVisualizationId: 'GramSchmidtProcess',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      'Take $\\mathbf{v}_1 = [3,4]^\\top$ and $\\mathbf{v}_2 = [2,0]^\\top$ — two vectors at an awkward angle. After one Gram-Schmidt step: $\\mathbf{e}_1 = [3/5,4/5]^\\top$ (normalize $\\mathbf{v}_1$). Subtract the shadow: $\\mathbf{v}_2 - (\\mathbf{v}_2 \\cdot \\mathbf{e}_1)\\mathbf{e}_1 = [32/25, -24/25]^\\top$, then normalize to $\\mathbf{e}_2 = [4/5, -3/5]^\\top$. Check: $\\mathbf{e}_1 \\cdot \\mathbf{e}_2 = 12/25 - 12/25 = 0$ ✓. Same 2D span, now perfectly perpendicular. That subtraction step — removing the shadow — is the entire algorithm.',
      'Here is the core idea in plain language: imagine you have two vectors in 2D that are *not* perpendicular — they are tilted at some weird angle to each other. You want to replace them with two perpendicular vectors that span the exact same space. Gram-Schmidt tells you how.',
      '**Step 1: Keep the first vector as-is.** There is nothing to clean yet. Just normalize it to length 1: $\\mathbf{e}_1 = \\mathbf{v}_1 / \\|\\mathbf{v}_1\\|$.',
      '**Step 2: Subtract off the "contamination."** Take your second vector $\\mathbf{v}_2$. It has some component that points in the direction of $\\mathbf{e}_1$ (the part that overlaps). Subtract that component away, leaving only the part that is perpendicular to $\\mathbf{e}_1$. That remainder is already orthogonal to $\\mathbf{e}_1$ by construction. Normalize it to get $\\mathbf{e}_2$.',
      '**Step 3: Repeat for every remaining vector.** For $\\mathbf{v}_3$: subtract its projection onto $\\mathbf{e}_1$ AND its projection onto $\\mathbf{e}_2$. What is left is perpendicular to both. Normalize. Repeat until done.',
      'The beautiful guarantee: at every step, what remains after subtracting all prior projections is perpendicular to every previously computed basis vector. You are peeling off contamination one direction at a time.',
      '**Why orthonormal bases are worth the effort.** When your basis is orthonormal, nearly everything becomes simpler. Coordinates are just dot products. The inverse of the basis matrix $Q$ is just its transpose $Q^T$ (no computation needed!). Projections are $QQ^T\\mathbf{b}$. The entire least squares algorithm simplifies. Orthonormal bases are the "clean room" of linear algebra.',
      '**CNC machine axis calibration.** A CNC machine\'s $X$, $Y$, $Z$ axis directions are ideally perfectly orthogonal. In practice, a precision ball-bar probe measures the actual axis directions as unit vectors $\\mathbf{v}_X, \\mathbf{v}_Y, \\mathbf{v}_Z$ — and they are slightly non-orthogonal due to mechanical tolerances. Gram-Schmidt converts these measured directions into a perfectly orthonormal frame $\\{\\mathbf{e}_X, \\mathbf{e}_Y, \\mathbf{e}_Z\\}$ that the CNC controller uses as its reference. The "squareness" error of the machine is precisely the deviation of the original vectors from orthogonality — and Gram-Schmidt quantifies and removes it.',
      '**Where this is heading:** Gram-Schmidt is the constructive proof that every subspace has an orthonormal basis. It directly produces the QR decomposition ($A = QR$, where $Q$ has orthonormal columns and $R$ is upper triangular). The next lesson on Least Squares uses this heavily, and SVD generalizes it further.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 9 — Orthogonality & SVD',
        body: '**Previous (Lesson 1):** Orthogonal Projections — how to find the shadow of a vector onto a subspace.\n**This lesson:** Gram-Schmidt — how to build a clean, perpendicular basis from any basis, using projection as the cleaning tool.\n**Next (Lesson 3):** Least Squares — how to find the best approximate solution when a system has no exact answer.',
      },
      {
        type: 'insight',
        title: 'The Subtraction IS the Orthogonalization',
        body: 'When you subtract the projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$, the remainder is perpendicular to $\\mathbf{e}_1$ — always, automatically, by the definition of projection. You are not checking for orthogonality; you are manufacturing it.',
      },
      {
        type: 'definition',
        title: 'Orthonormal Set',
        body: 'A set of vectors $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_k\\}$ is orthonormal if:\n• $\\mathbf{e}_i \\cdot \\mathbf{e}_j = 0$ for all $i \\neq j$ (orthogonal — pairwise perpendicular)\n• $\\|\\mathbf{e}_i\\| = 1$ for all $i$ (normal — all unit length)',
      },
      {
        type: 'strategy',
        title: 'Orthonormal Superpower: Inverse = Transpose',
        body: 'If $Q$ is a matrix with orthonormal columns, then $Q^{-1} = Q^T$. This is called an orthogonal matrix. Inverting it costs nothing — just transpose. This is why numerical algorithms love orthonormal bases.',
      },
      {
        type: 'insight',
        title: 'Predict: Gram-Schmidt on a Simple Pair',
        body: 'For $\\mathbf{v}_1 = [1,1]^\\top$ and $\\mathbf{v}_2 = [1,0]^\\top$: after Gram-Schmidt, what direction does $\\mathbf{e}_2$ point? Will it point up-right, straight up, or up-left? Predict, then compute: $\\mathbf{e}_1 = [1/\\sqrt{2}, 1/\\sqrt{2}]^\\top$, find $\\mathbf{v}_2 \\cdot \\mathbf{e}_1$, subtract, and normalize.',
      },
    ],
    visualizations: [
      {
        id: 'GramSchmidtProcess',
        title: 'Gram-Schmidt in 2D',
        mathBridge: 'Start with two non-perpendicular vectors (the default, shown in red and blue). Press "Step 1" to see $\\mathbf{v}_1$ normalized to $\\mathbf{e}_1$. Press "Step 2" to see the projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$ subtracted away — watch the remainder (green) snap to exactly 90° from $\\mathbf{e}_1$. Drag the original vectors to different angles and run the process again. Confirm that no matter how tilted the input, the output is always perpendicular.',
        caption: 'Projection peels off contamination, leaving perpendicularity behind.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Given a set of linearly independent vectors $\\{\\mathbf{v}_1, \\mathbf{v}_2, \\ldots, \\mathbf{v}_k\\}$, the Gram-Schmidt process produces an orthonormal set $\\{\\mathbf{e}_1, \\mathbf{e}_2, \\ldots, \\mathbf{e}_k\\}$ that spans the exact same subspace.',
      'The recipe has two clean phases: (1) subtract off all prior-direction contamination, then (2) normalize to unit length.',
      'For the first vector: there is nothing to subtract yet. Just normalize:\n\n$\\mathbf{e}_1 = \\frac{\\mathbf{v}_1}{\\|\\mathbf{v}_1\\|}$',
      'For each subsequent vector $\\mathbf{v}_j$, subtract its projection onto every previously computed basis vector, then normalize:\n\n$\\mathbf{u}_j = \\mathbf{v}_j - \\sum_{i=1}^{j-1} (\\mathbf{v}_j \\cdot \\mathbf{e}_i)\\,\\mathbf{e}_i \\qquad \\mathbf{e}_j = \\frac{\\mathbf{u}_j}{\\|\\mathbf{u}_j\\|}$',
      'The term $(\\mathbf{v}_j \\cdot \\mathbf{e}_i)$ is just the scalar projection of $\\mathbf{v}_j$ onto $\\mathbf{e}_i$ — the amount of $\\mathbf{v}_j$ that points in the $\\mathbf{e}_i$ direction. Subtracting that amount removes all overlap with $\\mathbf{e}_i$.',
      '**Connection to QR decomposition.** If we assemble the original vectors as columns of a matrix $A$, then Gram-Schmidt produces a factorization $A = QR$, where $Q$ has orthonormal columns (the $\\mathbf{e}_j$\'s) and $R$ is upper triangular with entries $r_{ij} = \\mathbf{v}_j \\cdot \\mathbf{e}_i$. QR is the matrix restatement of Gram-Schmidt.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Gram-Schmidt Formula',
        body: '\\mathbf{u}_j = \\mathbf{v}_j - \\sum_{i=1}^{j-1} (\\mathbf{v}_j \\cdot \\mathbf{e}_i)\\,\\mathbf{e}_i \\qquad \\mathbf{e}_j = \\frac{\\mathbf{u}_j}{\\|\\mathbf{u}_j\\|}',
      },
      {
        type: 'insight',
        title: 'Why the Remainder is Orthogonal',
        body: 'For any $i < j$: $(\\mathbf{u}_j) \\cdot \\mathbf{e}_i = (\\mathbf{v}_j - \\sum_k (\\mathbf{v}_j \\cdot \\mathbf{e}_k)\\mathbf{e}_k) \\cdot \\mathbf{e}_i = (\\mathbf{v}_j \\cdot \\mathbf{e}_i) - (\\mathbf{v}_j \\cdot \\mathbf{e}_i) = 0$. The subtraction was designed precisely to cancel this dot product.',
      },
      {
        type: 'definition',
        title: 'QR Decomposition',
        body: 'If $A = [\\mathbf{v}_1 \\cdots \\mathbf{v}_k]$ has linearly independent columns, then:\n$A = QR$\nwhere $Q = [\\mathbf{e}_1 \\cdots \\mathbf{e}_k]$ has orthonormal columns and $R$ is upper triangular with $r_{ij} = \\mathbf{v}_j \\cdot \\mathbf{e}_i$.',
      },
      {
        type: 'warning',
        title: 'Gram-Schmidt Requires Linear Independence',
        body: 'If $\\mathbf{v}_j$ is already in the span of $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_{j-1}\\}$, then $\\mathbf{u}_j = \\mathbf{0}$ and cannot be normalized. Gram-Schmidt breaks down — by design — on linearly dependent sets.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Gram-Schmidt and CNC Axis Calibration',
        mathBridge: 'MATLAB: `[Q, R] = qr(A)` computes the QR factorization (Gram-Schmidt result). Verify Q\'*Q = I. The off-diagonal entries of Q\'*Q measure orthogonality errors.',
        caption: 'Three cells: manual Gram-Schmidt, QR decomposition, and CNC axis calibration via orthogonalization.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Gram-Schmidt step by step in MATLAB',
              prose: [
                '`orth(A)` computes an orthonormal basis for the column space of A. `[Q,R] = qr(A)` gives the full QR decomposition.',
                'Manual Gram-Schmidt: normalize v1, subtract projection from v2, normalize. Verify e1·e2 = 0.',
              ],
              code: `v1 = [3; 4];
v2 = [2; 0];

% Step 1: normalize v1
e1 = v1 / norm(v1);

% Step 2: remove e1 component from v2, then normalize
u2 = v2 - dot(v2, e1) * e1;
e2 = u2 / norm(u2);

fprintf('e1 = [%.4f; %.4f]\\n', e1(1), e1(2))
fprintf('e2 = [%.4f; %.4f]\\n', e2(1), e2(2))
fprintf('e1 · e2 = %.2e (should be 0)\\n', dot(e1, e2))
fprintf('||e1|| = %.6f  ||e2|| = %.6f  (should be 1)\\n', norm(e1), norm(e2))`,
            },
            {
              id: 2,
              cellTitle: 'QR decomposition — Gram-Schmidt as a matrix equation',
              prose: [
                '`[Q, R] = qr(A)` factorizes A into orthogonal Q and upper-triangular R. Q*R = A exactly.',
                'Q*Q\' = I confirms the columns are orthonormal. R encodes the projection coefficients.',
              ],
              code: `A = [1 1 0; 1 0 1; 0 1 1];

[Q, R] = qr(A);

fprintf('Q (orthonormal columns):\\n'); disp(Q)
fprintf('R (upper triangular):\\n'); disp(R)
fprintf('Q*R = A?\\n'); disp(Q*R)

fprintf('Q''*Q (should be identity):\\n')
disp(Q'*Q)
fprintf('Max off-diagonal error: %.2e\\n', max(max(abs(Q'*Q - eye(3)))))`,
            },
            {
              id: 3,
              cellTitle: 'CNC axis calibration — orthogonalizing measured axis directions',
              prose: [
                'A probe measures slightly non-orthogonal axis directions due to machine geometry tolerances. Gram-Schmidt creates a perfect orthonormal reference frame.',
                'The off-diagonal entries of V\'*V (before Gram-Schmidt) quantify the squareness error in radians.',
              ],
              code: `% Measured CNC axis directions (slightly non-orthogonal due to tolerance)
v_X = [1.000; 0.0012; 0.0008];    % X-axis direction (measured)
v_Y = [-0.0011; 1.000; 0.0015];   % Y-axis direction (measured)
v_Z = [-0.0007; -0.0014; 1.000];  % Z-axis direction (measured)

V = [v_X, v_Y, v_Z];

% Squareness errors before calibration
fprintf('Before Gram-Schmidt — V''*V (should be identity):\\n')
VtV = V' * V;
disp(VtV)
fprintf('Off-diagonal elements (squareness errors in rad):\\n')
fprintf('  X-Y: %.6f rad (%.4f arcsec)\\n', VtV(1,2), VtV(1,2)*206265)
fprintf('  X-Z: %.6f rad (%.4f arcsec)\\n', VtV(1,3), VtV(1,3)*206265)
fprintf('  Y-Z: %.6f rad (%.4f arcsec)\\n', VtV(2,3), VtV(2,3)*206265)

% Gram-Schmidt orthogonalization
[Q, ~] = qr(V);
fprintf('\\nAfter Gram-Schmidt — Q''*Q (perfect identity):\\n')
disp(Q'*Q)
fprintf('Max residual: %.2e\\n', max(max(abs(Q'*Q - eye(3)))))`,
            },
          ]
        }
      },
      {
        id: 'QRDecompositionViz',
        title: 'From Gram-Schmidt to QR',
        mathBridge: 'The visualization shows a 2×2 matrix $A$ with its columns as vectors. Run Gram-Schmidt to see $Q$ (the orthonormal columns) and $R$ (the upper triangular matrix) appear. Verify that $QR = A$ by multiplying them back together. Change $A$ and confirm the decomposition always works.',
        caption: 'QR decomposition is Gram-Schmidt, written as a matrix equation.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Gram-Schmidt and QR Decomposition',
        mathBridge: 'numpy.linalg.qr(A) returns the QR factorization directly. Q has orthonormal columns (Qᵀ Q = I), R is upper triangular. Verify: Q @ R ≈ A and Q.T @ Q ≈ I.',
        caption: 'Implement Gram-Schmidt step by step, then verify it matches NumPy\'s QR decomposition.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Gram-Schmidt step by step',
              prose: 'Each step: subtract all projections onto previous basis vectors, then normalize. After the process, every pair of output vectors is orthogonal (dot product = 0), and each has magnitude 1.',
              code: `import numpy as np
import matplotlib.pyplot as plt

# Gram-Schmidt on 2 vectors in R^2
v1 = np.array([3., 1.])
v2 = np.array([2., 2.])

# Step 1: normalize v1
e1 = v1 / np.linalg.norm(v1)
# Step 2: remove e1 component from v2, then normalize
v2_perp = v2 - np.dot(v2, e1) * e1
e2 = v2_perp / np.linalg.norm(v2_perp)

print(f"e1 = {e1.round(4)}  (||e1|| = {np.linalg.norm(e1):.4f})")
print(f"e2 = {e2.round(4)}  (||e2|| = {np.linalg.norm(e2):.4f})")
print(f"e1 . e2 = {np.dot(e1, e2):.10f}  (orthogonal?)")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
origin = np.zeros(2)
for ax, (u1,u2,t1,t2), title in [
    (axes[0], (v1,v2,'v1','v2'), "Original: v1, v2"),
    (axes[1], (e1,e2,'e1','e2'), "After Gram-Schmidt: e1, e2 (orthonormal)")
]:
    for v, color, lbl in [(u1,'steelblue',t1),(u2,'darkorange',t2)]:
        ax.annotate('', xy=v, xytext=origin, arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
        ax.text(v[0]+0.05, v[1]+0.05, lbl, color=color, fontsize=12, fontweight='bold')
    ax.set_title(title, fontsize=11)
    ax.set_xlim(-0.5, 4); ax.set_ylim(-0.5, 2.5)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'QR decomposition — Gram-Schmidt as a matrix equation',
              prose: '`np.linalg.qr(A)` computes the QR decomposition. Q has orthonormal columns; R is upper triangular. Verify: Q @ R ≈ A (reconstruction). Qᵀ Q ≈ I (orthonormality).',
              code: `import numpy as np
import matplotlib.pyplot as plt

# QR decomposition via scipy (numerically stable Gram-Schmidt)
from scipy.linalg import qr

A = np.array([[1., 2., 0.],
              [1., 0., 1.],
              [0., 1., 1.]])

Q, R = qr(A)
print("Q (orthonormal columns):"); print(Q.round(4))
print("R (upper triangular):"); print(R.round(4))
print("Q^T @ Q = I?", np.allclose(Q.T @ Q, np.eye(3)))
print("Q @ R = A?", np.allclose(Q @ R, A))

fig, axes = plt.subplots(1, 3, figsize=(11, 3.5))
for ax, M, title in zip(axes, [A, Q, R], ['A', 'Q (orthonormal)', 'R (upper tri)']):
    lim = max(abs(M).max(), 0.1)
    ax.imshow(M, cmap='RdBu_r', aspect='equal', vmin=-lim, vmax=lim)
    ax.set_title(title, fontsize=12)
    for i in range(3):
        for j in range(3):
            ax.text(j, i, f'{M[i,j]:.2f}', ha='center', va='center', fontsize=10,
                    color='white' if abs(M[i,j]) > lim*0.6 else 'black')
    ax.set_xticks([]); ax.set_yticks([])
plt.suptitle("QR Decomposition: A = Q @ R", fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Gram-Schmidt by hand, verified by QR',
              difficulty: 'hard',
              prompt: 'Given v1 = [3, 1] and v2 = [2, 2], apply Gram-Schmidt manually: (1) e1 = v1 / –v1–, (2) u2 = v2 − (v2·e1)e1, e2 = u2 / –u2–. Verify e1·e2 = 0 and –e1– = –e2– = 1. Then confirm using np.linalg.qr.',
              code: `import numpy as np

v1 = np.array([3.0, 1.0])
v2 = np.array([2.0, 2.0])

# Step 1: normalize v1 to get e1
# Step 2: subtract projection of v2 onto e1, normalize to get e2
# Step 3: verify orthogonality and unit length
# Step 4: confirm with np.linalg.qr(np.column_stack([v1, v2]))
`,
              hint: 'e1 = v1/np.linalg.norm(v1). u2 = v2 - np.dot(v2,e1)*e1. e2 = u2/np.linalg.norm(u2). Then check np.dot(e1,e2) ≈ 0.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Theorem:** Every finite-dimensional inner product space has an orthonormal basis. The Gram-Schmidt process is the constructive proof — it does not just assert existence, it builds the basis explicitly.',
      'The process preserves span at every step: $\\text{span}\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_j\\} = \\text{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_j\\}$ for each $j$. This is proved by induction: $\\mathbf{e}_j$ is a linear combination of $\\mathbf{v}_1, \\ldots, \\mathbf{v}_j$, and conversely $\\mathbf{v}_j$ can be recovered from $\\mathbf{e}_1, \\ldots, \\mathbf{e}_j$.',
      '**Numerical stability.** The "classical" Gram-Schmidt formula above is mathematically correct but numerically fragile: small rounding errors in floating-point arithmetic accumulate and the resulting vectors drift from true orthogonality. In practice, **Modified Gram-Schmidt** (which subtracts projections one at a time onto the current $\\mathbf{u}_j$ rather than the original $\\mathbf{v}_j$) is used instead. The results are algebraically identical but numerically far more stable.',
      'For large-scale computations, even Modified Gram-Schmidt can be insufficient. The **Householder** and **Givens** methods produce QR decompositions that are more numerically stable and are used in production linear algebra libraries (LAPACK, NumPy, MATLAB).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Gram-Schmidt Produces an ONB',
        body: 'If $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ are linearly independent, the Gram-Schmidt output $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_k\\}$ is an orthonormal basis for $\\text{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$.',
      },
      {
        type: 'insight',
        title: 'Modified vs. Classical Gram-Schmidt',
        body: 'Classical: subtract all projections from the original $\\mathbf{v}_j$.\nModified: subtract projections from the running $\\mathbf{u}_j$ after each one.\nAlgebraically identical. Numerically, Modified is preferred — error does not accumulate.',
      },
    ],
    visualizations: [
      {
        id: 'OrthogonalityModuleViz',
        title: 'Gram-Schmidt & Orthogonality — Step-by-Step',
        mathBridge: 'A five-tab module: Concept explains orthogonality, orthonormal bases, QR decomposition, and why they matter; Canonical steps through Gram-Schmidt for 2 or 3 vectors — subtract each projection, normalize, show all dot-products confirming orthogonality; Real World shows QR in CNC least-squares fitting and numerical stability; Interactive lets you enter 2 or 3 vectors and animate the full orthogonalization; Practice has four problems.',
        caption: 'Gram-Schmidt builds a perpendicular basis one vector at a time — subtract all previous projections, then normalize.',
      },
    ],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la4-002-ex1',
      title: 'Gram-Schmidt in ℝ²',
      problem: 'Apply Gram-Schmidt to $\\mathbf{v}_1 = \\begin{bmatrix}3\\\\4\\end{bmatrix}$ and $\\mathbf{v}_2 = \\begin{bmatrix}2\\\\0\\end{bmatrix}$.',
      steps: [
        {
          expression: '\\mathbf{e}_1 = \\frac{\\mathbf{v}_1}{\\|\\mathbf{v}_1\\|} = \\frac{1}{5}\\begin{bmatrix}3\\\\4\\end{bmatrix} = \\begin{bmatrix}3/5\\\\4/5\\end{bmatrix}',
          annotation: 'Normalize the first vector. Its magnitude is $\\sqrt{9+16}=5$.',
          strategyTitle: 'Normalize v₁',
          checkpoint: 'Verify $\\|\\mathbf{e}_1\\| = 1$.',
          hints: ['$(3/5)^2 + (4/5)^2 = 9/25 + 16/25 = 25/25 = 1$. ✓'],
        },
        {
          expression: '\\mathbf{v}_2 \\cdot \\mathbf{e}_1 = \\begin{bmatrix}2\\\\0\\end{bmatrix} \\cdot \\begin{bmatrix}3/5\\\\4/5\\end{bmatrix} = \\frac{6}{5}',
          annotation: 'Compute how much of $\\mathbf{v}_2$ overlaps with $\\mathbf{e}_1$. This is the scalar projection.',
          strategyTitle: 'Compute scalar projection',
          checkpoint: 'What does this number mean geometrically?',
          hints: ['It means $\\mathbf{v}_2$ extends $\\frac{6}{5}$ units in the direction of $\\mathbf{e}_1$.'],
        },
        {
          expression: '\\mathbf{u}_2 = \\mathbf{v}_2 - \\frac{6}{5}\\mathbf{e}_1 = \\begin{bmatrix}2\\\\0\\end{bmatrix} - \\frac{6}{5}\\begin{bmatrix}3/5\\\\4/5\\end{bmatrix} = \\begin{bmatrix}2\\\\0\\end{bmatrix} - \\begin{bmatrix}18/25\\\\24/25\\end{bmatrix} = \\begin{bmatrix}32/25\\\\-24/25\\end{bmatrix}',
          annotation: 'Subtract off the contamination. The result $\\mathbf{u}_2$ is perpendicular to $\\mathbf{e}_1$.',
          strategyTitle: 'Subtract projection',
          checkpoint: 'Verify: $\\mathbf{u}_2 \\cdot \\mathbf{e}_1 = 0$?',
          hints: ['$(32/25)(3/5) + (-24/25)(4/5) = 96/125 - 96/125 = 0$. ✓'],
        },
        {
          expression: '\\|\\mathbf{u}_2\\| = \\sqrt{(32/25)^2 + (24/25)^2} = \\frac{1}{25}\\sqrt{1024+576} = \\frac{40}{25} = \\frac{8}{5}',
          annotation: 'Find the magnitude of $\\mathbf{u}_2$ before normalizing.',
          strategyTitle: 'Compute magnitude',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{e}_2 = \\frac{\\mathbf{u}_2}{\\|\\mathbf{u}_2\\|} = \\frac{5}{8}\\begin{bmatrix}32/25\\\\-24/25\\end{bmatrix} = \\begin{bmatrix}4/5\\\\-3/5\\end{bmatrix}',
          annotation: 'Normalize $\\mathbf{u}_2$. The final orthonormal pair is $\\{\\mathbf{e}_1, \\mathbf{e}_2\\}$.',
          strategyTitle: 'Normalize to get e₁',
          checkpoint: 'Verify: $\\mathbf{e}_1 \\cdot \\mathbf{e}_2 = 0$ and $\\|\\mathbf{e}_2\\| = 1$.',
          hints: ['$(3/5)(4/5) + (4/5)(-3/5) = 12/25 - 12/25 = 0$. ✓  $(4/5)^2 + (-3/5)^2 = 16/25 + 9/25 = 1$. ✓'],
        },
      ],
      conclusion: 'The orthonormal basis is $\\mathbf{e}_1 = [3/5,\\; 4/5]^T$ and $\\mathbf{e}_2 = [4/5,\\; -3/5]^T$. These span the same 2D space as the originals, but now they are perfectly perpendicular and both have unit length.',
    },
    {
      id: 'la4-002-ex2',
      title: 'Gram-Schmidt in ℝ³',
      problem: 'Find an orthonormal basis for the span of $\\mathbf{v}_1 = \\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix}$, $\\mathbf{v}_2 = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix}$.',
      steps: [
        {
          expression: '\\mathbf{e}_1 = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix}',
          annotation: '$\\|\\mathbf{v}_1\\| = \\sqrt{2}$. Normalize directly.',
          strategyTitle: 'Normalize v₁',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{v}_2 \\cdot \\mathbf{e}_1 = \\frac{1}{\\sqrt{2}}(1 + 0 + 0) = \\frac{1}{\\sqrt{2}}',
          annotation: 'Scalar projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$.',
          strategyTitle: 'Scalar projection',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{u}_2 = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} - \\frac{1}{\\sqrt{2}} \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix} = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} - \\begin{bmatrix}1/2\\\\1/2\\\\0\\end{bmatrix} = \\begin{bmatrix}1/2\\\\-1/2\\\\1\\end{bmatrix}',
          annotation: 'Subtract the projection. The scalar is $(1/\\sqrt{2}) \\cdot \\mathbf{e}_1 = \\frac{1}{2}[1,1,0]^T$.',
          strategyTitle: 'Subtract projection',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\|\\mathbf{u}_2\\| = \\sqrt{1/4 + 1/4 + 1} = \\sqrt{3/2} = \\frac{\\sqrt{6}}{2} \\qquad \\mathbf{e}_2 = \\frac{1}{\\sqrt{6}}\\begin{bmatrix}1\\\\-1\\\\2\\end{bmatrix}',
          annotation: 'Normalize. (Multiply numerator and denominator by 2 to simplify: $\\mathbf{u}_2 = \\frac{1}{2}[1,-1,2]^T$, so $\\mathbf{e}_2 = [1,-1,2]^T/\\sqrt{6}$.)',
          strategyTitle: 'Normalize to get e₁',
          checkpoint: 'Verify $\\mathbf{e}_1 \\cdot \\mathbf{e}_2 = 0$.',
          hints: ['$(1/\\sqrt{2})(1/\\sqrt{6}) + (1/\\sqrt{2})(-1/\\sqrt{6}) + 0 = 1/\\sqrt{12} - 1/\\sqrt{12} = 0$. ✓'],
        },
      ],
      conclusion: 'The two-dimensional subspace spanned by $\\mathbf{v}_1$ and $\\mathbf{v}_2$ now has the clean orthonormal basis $\\{\\mathbf{e}_1, \\mathbf{e}_2\\}$. Any computation within this subspace is now far simpler.',
    },
    {
      id: 'la4-002-ex3',
      title: 'Gram-Schmidt produces QR decomposition',
      problem: 'For $A = \\begin{bmatrix}1&1\\\\1&0\\\\0&1\\end{bmatrix}$ (columns $\\mathbf{v}_1 = [1,1,0]^T$, $\\mathbf{v}_2 = [1,0,1]^T$), run Gram-Schmidt to find $Q$ and then compute $R = Q^T A$.',
      steps: [
        {
          expression: '\\mathbf{e}_1 = \\frac{\\mathbf{v}_1}{\\|\\mathbf{v}_1\\|} = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix}',
          annotation: '$\\|\\mathbf{v}_1\\| = \\sqrt{1+1+0} = \\sqrt{2}$. Normalize.',
          strategyTitle: 'Normalize v₁',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{u}_2 = \\mathbf{v}_2 - (\\mathbf{v}_2 \\cdot \\mathbf{e}_1)\\mathbf{e}_1 = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} - \\frac{1}{\\sqrt{2}} \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix} = \\begin{bmatrix}1/2\\\\-1/2\\\\1\\end{bmatrix}',
          annotation: '$\\mathbf{v}_2 \\cdot \\mathbf{e}_1 = (1+0+0)/\\sqrt{2} = 1/\\sqrt{2}$. Subtract $(1/\\sqrt{2})\\mathbf{e}_1$.',
          strategyTitle: 'Subtract projection',
          checkpoint: 'Check: u₁ · e₁ = 0?',
          hints: ['u₁ · e₁ = (1/2)(1/√2) + (-1/2)(1/√2) + 1·0 = 0 ✓'],
        },
        {
          expression: '\\mathbf{e}_2 = \\frac{\\mathbf{u}_2}{\\|\\mathbf{u}_2\\|} = \\frac{1}{\\sqrt{3/2}}\\begin{bmatrix}1/2\\\\-1/2\\\\1\\end{bmatrix} = \\frac{1}{\\sqrt{6}}\\begin{bmatrix}1\\\\-1\\\\2\\end{bmatrix}',
          annotation: '$\\|\\mathbf{u}_2\\|^2 = 1/4 + 1/4 + 1 = 3/2$, so $\\|\\mathbf{u}_2\\| = \\sqrt{6}/2$.',
          strategyTitle: 'Normalize u₁',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'R = Q^T A = \\begin{bmatrix}\\mathbf{e}_1^T\\\\\\mathbf{e}_2^T\\end{bmatrix}\\begin{bmatrix}\\mathbf{v}_1 & \\mathbf{v}_2\\end{bmatrix} = \\begin{bmatrix}\\mathbf{e}_1^T\\mathbf{v}_1 & \\mathbf{e}_1^T\\mathbf{v}_2 \\\\ 0 & \\mathbf{e}_2^T\\mathbf{v}_2\\end{bmatrix} = \\begin{bmatrix}\\sqrt{2} & 1/\\sqrt{2} \\\\ 0 & \\sqrt{6}/2\\end{bmatrix}',
          annotation: '$R_{11} = \\mathbf{e}_1^T\\mathbf{v}_1 = \\sqrt{2}$, $R_{12} = \\mathbf{e}_1^T\\mathbf{v}_2 = 1/\\sqrt{2}$, $R_{21} = 0$ (by G-S construction), $R_{22} = \\mathbf{e}_2^T\\mathbf{v}_2 = \\sqrt{6}/2$. $R$ is upper triangular.',
          strategyTitle: 'Compute R = QᵀA',
          checkpoint: 'Verify: A = QR (recover original columns from Q and R)',
          hints: ['Column 1 of QR: e₁·R₁₁ = v₁/√2 · √2 = v₁ ✓. Column 2: e₁·(1/√2) + e₂·(√6/2) = (1/2)[1,1,0]ᵀ + (1/2)[1,-1,2]ᵀ = [1,0,1]ᵀ = v₂ ✓.'],
        },
      ],
      conclusion: '$A = QR$ where $Q = [\\mathbf{e}_1 \\; \\mathbf{e}_2]$ has orthonormal columns and $R$ is upper triangular. This is the QR decomposition. Gram-Schmidt is the algorithm; QR is the matrix factorization it produces. Numerical solvers use QR because $Q^{-1} = Q^T$ makes subsequent computations cheap.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la4-002-ch1',
      difficulty: 'easy',
      problem: 'Apply Gram-Schmidt to $\\mathbf{v}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix}$ and $\\mathbf{v}_2 = \\begin{bmatrix}3\\\\4\\end{bmatrix}$.',
      hint: '$\\mathbf{v}_1$ is already a unit vector. The projection of $\\mathbf{v}_2$ onto $\\mathbf{v}_1$ is just the x-component of $\\mathbf{v}_2$.',
      walkthrough: [
        {
          expression: '\\mathbf{e}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix}',
          annotation: '$\\mathbf{v}_1$ is already a unit vector.',
        },
        {
          expression: '\\mathbf{u}_2 = \\begin{bmatrix}3\\\\4\\end{bmatrix} - (3)\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}0\\\\4\\end{bmatrix}',
          annotation: 'Scalar projection = $[3,4] \\cdot [1,0] = 3$. Subtract $3\\mathbf{e}_1$.',
        },
        {
          expression: '\\mathbf{e}_2 = \\begin{bmatrix}0\\\\1\\end{bmatrix}',
          annotation: 'Normalize: magnitude is 4, so $\\mathbf{e}_2 = [0,4]/4 = [0,1]$. The standard basis!',
        },
      ],
      answer: 'e₁ = [1,0]ᵀ, e₁ = [0,1]ᵀ',
    },
    {
      id: 'la4-002-ch2',
      difficulty: 'medium',
      problem: 'Show that if $\\mathbf{v}_1$ and $\\mathbf{v}_2$ are already orthogonal (but not necessarily unit length), Gram-Schmidt just normalizes each one — no subtraction needed. Explain why this makes sense.',
      hint: 'Compute $\\mathbf{v}_2 \\cdot \\mathbf{e}_1$. What is it when the vectors are already orthogonal?',
      walkthrough: [
        {
          expression: '\\mathbf{v}_2 \\cdot \\mathbf{e}_1 = \\mathbf{v}_2 \\cdot \\frac{\\mathbf{v}_1}{\\|\\mathbf{v}_1\\|} = \\frac{\\mathbf{v}_1 \\cdot \\mathbf{v}_2}{\\|\\mathbf{v}_1\\|} = 0',
          annotation: 'Because $\\mathbf{v}_1 \\cdot \\mathbf{v}_2 = 0$ by assumption.',
        },
        {
          expression: '\\mathbf{u}_2 = \\mathbf{v}_2 - 0 \\cdot \\mathbf{e}_1 = \\mathbf{v}_2',
          annotation: 'Nothing is subtracted. $\\mathbf{v}_2$ has zero contamination in the $\\mathbf{e}_1$ direction.',
        },
        {
          expression: '\\mathbf{e}_2 = \\mathbf{v}_2 / \\|\\mathbf{v}_2\\|',
          annotation: 'Just normalize. Gram-Schmidt degenerates to simple normalization when the input is already orthogonal.',
        },
      ],
      answer: 'When inputs are already orthogonal, Gram-Schmidt reduces to pure normalization.',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: '\\mathbf{e}_j', meaning: 'The jth orthonormal basis vector produced by Gram-Schmidt' },
      { symbol: '\\mathbf{v}_j \\cdot \\mathbf{e}_i', meaning: 'Scalar projection of v_j onto e_i — the amount of contamination to remove' },
      { symbol: 'A = QR', meaning: 'QR decomposition: Q has orthonormal columns, R is upper triangular' },
      { symbol: 'Q^{-1} = Q^T', meaning: 'For orthogonal matrices, the inverse is free — just transpose' },
    ],
    rulesOfThumb: [
      'Each new vector = original vector minus its projections onto all prior orthonormal vectors.',
      'The subtraction manufactures orthogonality — it does not check for it.',
      'Gram-Schmidt fails on linearly dependent sets (subtraction gives the zero vector).',
      'In code, use Modified Gram-Schmidt or Householder for numerical stability.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la4-001',
        label: 'Orthogonal Projections',
        note: 'Every subtraction step in Gram-Schmidt IS an orthogonal projection. The formula $\\mathbf{v}_j \\cdot \\mathbf{e}_i$ is the scalar projection, and $(\\mathbf{v}_j \\cdot \\mathbf{e}_i)\\mathbf{e}_i$ is the vector projection.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la4-003',
        label: 'Least Squares',
        note: 'Gram-Schmidt produces QR, and QR makes least squares computationally efficient. The normal equations $A^TA\\mathbf{x}=A^T\\mathbf{b}$ become $R\\mathbf{x}=Q^T\\mathbf{b}$ — a simple triangular system.',
      },
      {
        lessonId: 'la4-004',
        label: 'Singular Value Decomposition',
        note: 'SVD generalizes QR: instead of one set of orthonormal vectors, SVD finds two (one for the domain, one for the codomain). Gram-Schmidt is the single-set case.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Gram-Schmidt = project, subtract contamination, normalize. Repeat.',
    'The subtraction manufactures orthogonality — guaranteed by algebra.',
    'Output spans the same space as the input, but with clean right angles.',
    'QR decomposition is Gram-Schmidt written as a matrix equation.',
    'Orthonormal basis: inverse = transpose. All coordinates = dot products.',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la4-002-1', label: 'Read: Explain why subtraction creates orthogonality', type: 'read' },
    { id: 'cp-la4-002-2', label: 'Read: State when Gram-Schmidt breaks down', type: 'read' },
    { id: 'cp-la4-002-3', label: 'Read: Explain why Q⁻¹ = Qᵀ for orthonormal columns', type: 'read' },
    { id: 'cp-la4-002-4', label: 'Lab: Step through Gram-Schmidt on two non-perpendicular vectors', type: 'lab' },
    { id: 'cp-la4-002-5', label: 'Lab: Verify e₁·e₁ = 0 and –e₁– = –e₁– = 1 after output', type: 'lab' },
    { id: 'cp-la4-002-6', label: 'Example: Run Gram-Schmidt in ℝ²', type: 'example' },
    { id: 'cp-la4-002-7', label: 'Example: Run Gram-Schmidt in ℝ³ to get orthonormal basis', type: 'example' },
    { id: 'cp-la4-002-8', label: 'Challenge: Derive QR from Gram-Schmidt for a 3×2 matrix', type: 'challenge' },
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la4-002-assess-1',
        type: 'choice',
        text: 'After running Gram-Schmidt on two vectors, what is the dot product of the two output vectors?',
        options: ['0', '1', 'It depends on the input vectors', 'The magnitude of the first output vector'],
        answer: '0',
        hints: ['Gram-Schmidt produces orthogonal (perpendicular) vectors — their dot product is always 0 by construction.'],
        reviewSection: 'Intuition tab — Gram-Schmidt process',
      },
      {
        id: 'la4-002-assess-2',
        type: 'choice',
        text: 'For $\\mathbf{v}_1 = [3,4]^T$ and $\\mathbf{v}_2 = [2,0]^T$, the first Gram-Schmidt basis vector $\\mathbf{e}_1$ is:',
        options: ['$[3,4]^T$', '$[3/5,\\; 4/5]^T$', '$[1,0]^T$', '$[4/5,\\; -3/5]^T$'],
        answer: '$[3/5,\\; 4/5]^T$',
        hints: ['$\\mathbf{e}_1 = \\mathbf{v}_1 / \\|\\mathbf{v}_1\\| = [3,4]^T / 5 = [3/5, 4/5]^T$.'],
        reviewSection: 'Examples tab — Gram-Schmidt in ℝ²',
      },
      {
        id: 'la4-002-assess-3',
        type: 'choice',
        text: 'If $Q$ is a matrix with orthonormal columns, then $Q^TQ$ equals:',
        options: ['$QQ^T$', 'The identity matrix $I$', '$Q^2$', '$\\det(Q) \\cdot I$'],
        answer: 'The identity matrix $I$',
        hints: ['$(Q^TQ)_{ij}$ = (column $i$ of $Q$) · (column $j$ of $Q$) = $\\delta_{ij}$ by orthonormality. So $Q^TQ = I$.'],
        reviewSection: 'Math tab — QR Decomposition / orthonormal columns',
      },
      {
        id: 'la4-002-assess-4',
        type: 'choice',
        text: 'In the QR decomposition, $R = Q^TA$ is upper triangular because:',
        options: [
          '$A$ is always symmetric',
          '$R_{ij} = \\mathbf{e}_i^T \\mathbf{v}_j = 0$ for $i > j$, since each $\\mathbf{e}_i$ is orthogonal to all $\\mathbf{v}_j$ with $j < i$',
          '$Q$ is always diagonal',
          'Upper triangular matrices are always produced by matrix multiplication',
        ],
        answer: '$R_{ij} = \\mathbf{e}_i^T \\mathbf{v}_j = 0$ for $i > j$, since each $\\mathbf{e}_i$ is orthogonal to all $\\mathbf{v}_j$ with $j < i$',
        hints: ['Gram-Schmidt builds $\\mathbf{e}_i$ to be orthogonal to $\\text{span}(\\mathbf{e}_1,\\ldots,\\mathbf{e}_{i-1}) = \\text{span}(\\mathbf{v}_1,\\ldots,\\mathbf{v}_{i-1})$. So $\\mathbf{e}_i \\cdot \\mathbf{v}_j = 0$ for $j < i$.'],
        reviewSection: 'Examples tab — QR decomposition example',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'gram-schmidt-q1',
      type: 'choice',
      text: 'In the Gram-Schmidt process, why do we subtract the projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$?',
      options: [
        'To increase the length of $\\mathbf{v}_2$',
        'To remove the component of $\\mathbf{v}_2$ that overlaps with $\\mathbf{e}_1$, guaranteeing the remainder is perpendicular',
        'To ensure $\\mathbf{v}_2$ points in the same direction as $\\mathbf{e}_1$',
        'To normalize $\\mathbf{v}_2$ to unit length',
      ],
      answer: 'To remove the component of $\\mathbf{v}_2$ that overlaps with $\\mathbf{e}_1$, guaranteeing the remainder is perpendicular',
      hints: ['Think of projection as the "shadow" of $\\mathbf{v}_2$ on $\\mathbf{e}_1$. Subtracting the shadow removes the overlap.'],
      reviewSection: 'Intuition tab — The Subtraction IS the Orthogonalization',
    },
    {
      id: 'gram-schmidt-q2',
      type: 'choice',
      text: 'What happens when you apply Gram-Schmidt to a linearly dependent set of vectors?',
      options: [
        'You get an orthonormal basis for the full space',
        'The process produces a zero vector, which cannot be normalized — it breaks down',
        'You get the standard basis automatically',
        'The process runs but gives incorrect results',
      ],
      answer: 'The process produces a zero vector, which cannot be normalized — it breaks down',
      hints: ['If $\\mathbf{v}_j$ is in the span of the previous vectors, subtracting all projections leaves exactly $\\mathbf{0}$.'],
      reviewSection: 'Math tab — Gram-Schmidt Requires Linear Independence',
    },
    {
      id: 'gram-schmidt-q3',
      type: 'choice',
      text: 'If $Q$ is a matrix with orthonormal columns, what is $Q^{-1}$?',
      options: ['$Q^2$', '$-Q$', '$Q^T$', '$\\det(Q) \\cdot Q$'],
      answer: '$Q^T$',
      hints: ['This is the defining property of an orthogonal matrix. It follows from $Q^TQ = I$ (which holds because $Q$\'s columns are orthonormal).'],
      reviewSection: 'Intuition tab — Orthonormal Superpower',
    },
    {
      id: 'q-la4-002-4',
      type: 'choice',
      text: 'In Gram-Schmidt, why must the vectors being processed be linearly independent?',
      options: [
        'So each vector can be made longer',
        'If any vector is in the span of the previous ones, its residual after projection is $\\mathbf{0}$ — which cannot be normalized',
        'So the output has unit length',
        'To ensure the output spans a different space than the input',
      ],
      answer: 'If any vector is in the span of the previous ones, its residual after projection is $\\mathbf{0}$ — which cannot be normalized',
      hints: ['If v₁ƒ = αv₁ + βv₁, then after subtracting all projections onto e₁ and e₁, the residual is exactly 0. You cannot normalize the zero vector.'],
      reviewSection: 'Math — Gram-Schmidt requires linear independence',
    },
    {
      id: 'q-la4-002-5',
      type: 'choice',
      text: 'Gram-Schmidt preserves which property of the original set of vectors?',
      options: [
        'Their individual lengths',
        'Their angles with each other',
        'The subspace they span',
        'Their components along the standard basis',
      ],
      answer: 'The subspace they span',
      hints: ['Gram-Schmidt replaces vectors with linear combinations of themselves — it never leaves the span. The subspace is identical; only the basis changes to an orthonormal one.'],
      reviewSection: 'Intuition — Gram-Schmidt preserves span',
    },
    {
      id: 'q-la4-002-6',
      type: 'choice',
      text: 'If $Q$ has orthonormal columns, what is $Q^TQ$?',
      options: ['$QQ^T$', '$I$', '$Q^2$', '$\\det(Q) \\cdot I$'],
      answer: '$I$',
      hints: ['$(Q^TQ)_{ij}$ = (column $i$) · (column $j$) = $\\delta_{ij}$ (1 if i=j, 0 otherwise) by orthonormality. So $Q^TQ = I$.'],
      reviewSection: 'Intuition — Orthonormal Superpower',
    },
    {
      id: 'q-la4-002-7',
      type: 'choice',
      text: 'In the QR decomposition $A = QR$, the matrix $R$ is:',
      options: [
        'Symmetric',
        'Upper triangular',
        'Diagonal',
        'Orthogonal',
      ],
      answer: 'Upper triangular',
      hints: ['R = QᵀA. By the Gram-Schmidt construction, each e_j is orthogonal to all v_i for i < j. This makes the lower triangle of R zero. R_{ij} = 0 when i > j.'],
      reviewSection: 'Examples — QR decomposition example',
    },
    {
      id: 'q-la4-002-8',
      type: 'choice',
      text: 'Why do computational algorithms prefer Modified Gram-Schmidt over classical Gram-Schmidt?',
      options: [
        'Modified Gram-Schmidt produces a different QR factorization',
        'In floating point arithmetic, classical Gram-Schmidt accumulates errors that destroy orthogonality; Modified Gram-Schmidt corrects this step by step',
        'Modified Gram-Schmidt is faster in exact arithmetic',
        'Classical Gram-Schmidt only works for 2D vectors',
      ],
      answer: 'In floating point arithmetic, classical Gram-Schmidt accumulates errors that destroy orthogonality; Modified Gram-Schmidt corrects this step by step',
      hints: ['In exact arithmetic both are equivalent. In floating point, subtracting projections in one batch (classical) causes round-off accumulation. Modified G-S updates the remaining vectors after each projection, keeping errors small.'],
      reviewSection: 'Rigor — numerical stability',
    },
    {
      id: 'q-la4-002-9',
      type: 'choice',
      text: 'The Gram-Schmidt step $\\mathbf{u}_k = \\mathbf{v}_k - \\sum_{j=1}^{k-1}(\\mathbf{v}_k \\cdot \\mathbf{e}_j)\\mathbf{e}_j$ is equivalent to:',
      options: [
        'Normalizing $\\mathbf{v}_k$',
        'Projecting $\\mathbf{v}_k$ onto the orthogonal complement of $\\text{span}(\\mathbf{e}_1, \\ldots, \\mathbf{e}_{k-1})$',
        'Computing the cross product of $\\mathbf{v}_k$ with $\\mathbf{e}_1$',
        'Removing the largest component of $\\mathbf{v}_k$',
      ],
      answer: 'Projecting $\\mathbf{v}_k$ onto the orthogonal complement of $\\text{span}(\\mathbf{e}_1, \\ldots, \\mathbf{e}_{k-1})$',
      hints: ['The sum Σ(v_k·e_j)e_j is the projection of v_k onto span{e₁,...,e_{k-1}}. Subtracting it gives the component of v_k perpendicular to that span — which is the projection onto the orthogonal complement.'],
      reviewSection: 'Math — Gram-Schmidt algorithm',
    },
    {
      id: 'q-la4-002-10',
      type: 'choice',
      text: 'In GPS navigation, the least squares system $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$ is solved numerically. What is the advantage of using QR over directly inverting $A^TA$?',
      options: [
        '$A^TA$ is always singular',
        'QR avoids squaring the condition number: solving $R\\hat{\\mathbf{x}} = Q^T\\mathbf{b}$ is more numerically stable than computing $(A^TA)^{-1}A^T\\mathbf{b}$',
        'QR is faster in exact arithmetic',
        'QR only works for square matrices',
      ],
      answer: 'QR avoids squaring the condition number: solving $R\\hat{\\mathbf{x}} = Q^T\\mathbf{b}$ is more numerically stable than computing $(A^TA)^{-1}A^T\\mathbf{b}$',
      hints: ['Forming AᵀA squares the condition number of A. If κ(A) = 100, then κ(AᵀA) = 10000 — tiny perturbations in b get amplified 10000× instead of 100×. QR preserves the original conditioning.'],
      reviewSection: 'Rigor — numerical stability',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Gram-Schmidt changes the subspace spanned by the vectors.',
      whyStudentsThinkIt: 'The output vectors look completely different from the input (different directions, different lengths), so students assume the span changed.',
      correctionExample: 'For $\\mathbf{v}_1 = [3,4]^T$ and $\\mathbf{v}_2 = [2,0]^T$ spanning $\\mathbb{R}^2$: the Gram-Schmidt output $\\mathbf{e}_1, \\mathbf{e}_2$ also spans all of $\\mathbb{R}^2$ — same subspace, different (cleaner) basis.',
      contrastCase: 'What does change: the individual vectors, their directions and lengths. What does not change: the set of all linear combinations — the span.',
    },
    {
      falseBelief: 'Gram-Schmidt only works on two vectors.',
      whyStudentsThinkIt: 'Most examples show the two-vector case. Students do not see how to extend the subtraction step.',
      correctionExample: 'For three vectors: $\\mathbf{u}_3 = \\mathbf{v}_3 - (\\mathbf{v}_3 \\cdot \\mathbf{e}_1)\\mathbf{e}_1 - (\\mathbf{v}_3 \\cdot \\mathbf{e}_2)\\mathbf{e}_2$. Subtract projections onto ALL previous orthonormal vectors. The pattern extends to any number of input vectors.',
      contrastCase: 'The formula is identical for $k$ vectors — just sum over all $j < k$ in the projection subtraction.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are fitting a polynomial $p(x) = a_0 + a_1 x + a_2 x^2$ to data, but the monomials $\\{1, x, x^2\\}$ are nearly collinear on $[-1,1]$, causing numerical instability.',
      competingTechniques: ['Use monomials directly', 'Least squares with normal equations', 'Gram-Schmidt to build orthogonal polynomials'],
      whyThisTechniqueWins: 'Applying Gram-Schmidt to $\\{1, x, x^2\\}$ under an appropriate inner product produces Legendre polynomials — an orthogonal basis for polynomials. Fitting in this basis is numerically stable and the coefficients are independent.',
    },
    {
      situation: 'In computer graphics, you need to orient a camera at a point of interest using forward, up, and right vectors — but the user-specified "up" may not be exactly perpendicular to the forward direction.',
      competingTechniques: ['Use the vectors as-is (rendering artifacts)', 'Manually adjust one vector', 'Gram-Schmidt orthogonalization'],
      whyThisTechniqueWins: 'Gram-Schmidt on {forward, user_up} gives a guaranteed orthonormal frame. One step: subtract the projection of user_up onto forward, normalize. This is standard in every 3D engine\'s "look-at" calculation.',
    },
  ],

  debugging: [
    {
      commonError: 'Subtracting the projection in the wrong order — projecting $\\mathbf{e}_1$ onto $\\mathbf{v}_2$ instead of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$.',
      symptom: 'The residual $\\mathbf{u}_2$ is not perpendicular to $\\mathbf{e}_1$ — the dot product check fails.',
      whyItHappened: 'Projection is not symmetric: $\\text{proj}_{\\mathbf{e}_1}\\mathbf{v}_2 \\neq \\text{proj}_{\\mathbf{v}_2}\\mathbf{e}_1$. The formula $\\mathbf{v}_2 \\cdot \\mathbf{e}_1$ is the projection of $\\mathbf{v}_2$ onto $\\mathbf{e}_1$ (not the other way around).',
      repairStrategy: 'Always verify with the dot product check: compute $\\mathbf{u}_2 \\cdot \\mathbf{e}_1$ after subtraction. It must be zero. If not, re-check which vector you projected onto which.',
    },
    {
      commonError: 'Forgetting to subtract the projection onto $\\mathbf{e}_2$ when computing $\\mathbf{u}_3$ in the three-vector case.',
      symptom: '$\\mathbf{e}_3$ is orthogonal to $\\mathbf{e}_2$ but not to $\\mathbf{e}_1$.',
      whyItHappened: 'In the third step, you must subtract projections onto ALL previous orthonormal vectors: both $\\mathbf{e}_1$ and $\\mathbf{e}_2$.',
      repairStrategy: 'For $k$ vectors, the $k$-th step subtracts $k-1$ projections. Write $\\mathbf{u}_k = \\mathbf{v}_k - \\sum_{j=1}^{k-1}(\\mathbf{v}_k \\cdot \\mathbf{e}_j)\\mathbf{e}_j$ and check all pairwise dot products in the output.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Apply Gram-Schmidt to orthogonalize 2 or 3 vectors, verify orthogonality of output, and extract QR from the computation.',
    explainVerbally: 'Explain why the subtraction step creates orthogonality, what breaks when vectors are dependent, and why $Q^{-1} = Q^T$ saves computation.',
    detectIncorrectApplication: 'Catch wrong projection direction; catch missing projections in the multi-vector step; catch failure to verify $\\mathbf{e}_i \\cdot \\mathbf{e}_j = 0$.',
    transferToUnfamiliar: 'Apply Gram-Schmidt to functions (orthogonal polynomials), 3D camera orientation, or QR-based least squares — any context requiring a clean orthonormal basis from a messy one.',
  },
};
