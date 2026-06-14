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
      'Take $A = \\begin{bmatrix}4&3\\\\0&0\\end{bmatrix}$. Compute $A^TA = \\begin{bmatrix}16&12\\\\12&9\\end{bmatrix}$ — eigenvalues 25 and 0, eigenvectors $\\mathbf{v}_1 = [4/5,3/5]^\\top$, $\\mathbf{v}_2 = [-3/5,4/5]^\\top$. Singular values: $\\sigma_1 = 5$, $\\sigma_2 = 0$. Left singular vector: $\\mathbf{u}_1 = (1/5)A\\mathbf{v}_1 = [1,0]^\\top$. SVD: $A = 5\\cdot[1,0]^\\top[4/5,3/5] = \\begin{bmatrix}4&3\\\\0&0\\end{bmatrix}$ ✓. Any matrix — any shape, any rank — factors this way as $A = U\\Sigma V^T$. The singular values tell you how much stretching happens in each direction.',
      'We need SVD because diagonalization has a limitation: it only works for square matrices with enough independent eigenvectors. SVD has no such restriction. It works for any matrix, any shape, any rank.',
      '**The geometric picture.** Any linear transformation — any matrix $A$ — takes a sphere in $\\mathbb{R}^n$ and maps it to an ellipse (possibly flattened) in $\\mathbb{R}^m$. SVD breaks this down into three clean steps:\n\n1. **Rotate** the input sphere to align it with the "right" coordinate axes ($V^T$)\n2. **Stretch** each axis independently — no mixing, no rotating — by the singular values ($\\Sigma$)\n3. **Rotate** again to place the ellipse in the output space ($U$)\n\nEvery matrix does exactly this, no matter how complicated it looks.',
      'The stretching amounts $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq 0$ are the **singular values**. They are always non-negative real numbers, even if the original matrix has complex entries. The largest singular value tells you the maximum amount any unit vector gets stretched by $A$. The smallest tells you the minimum.',
      '**The low-rank approximation idea.** SVD can be written as a sum of rank-1 "slices": $A = \\sigma_1 \\mathbf{u}_1 \\mathbf{v}_1^T + \\sigma_2 \\mathbf{u}_2 \\mathbf{v}_2^T + \\cdots$. Each term $\\sigma_i \\mathbf{u}_i \\mathbf{v}_i^T$ is a rank-1 matrix — the simplest possible building block. The singular values measure how important each piece is. If $\\sigma_{50} = 0.001$ and $\\sigma_1 = 1000$, then the 50th piece contributes almost nothing to the full matrix, and you can discard it. Keep only the first $k$ terms and you get the best possible rank-$k$ approximation to $A$ (in a precise mathematical sense).',
      '**Where this is heading:** This is the end of the linear algebra curriculum. But SVD is really a beginning — it is the entry point to data science, machine learning, signal processing, and numerical analysis. Every major field of applied mathematics uses it.',
      '**CNC machine intelligence via SVD.** (1) **Tool wear detection:** Record the $n$-dimensional cutting force vector over $m$ time steps. Stack these into an $m \\times n$ data matrix $X$. SVD $X = U\\Sigma V^T$ reveals the dominant cutting force pattern: $\\mathbf{v}_1$ is the direction of maximum force variance, $\\sigma_1$ its magnitude. As the tool wears, $\\sigma_1$ grows and the ratio $\\sigma_1/\\sigma_2$ increases — the cutting becomes more "one-dimensional" as chatter dominates. (2) **G-code path compression:** A 3D CNC toolpath with $m$ waypoints is a $3 \\times m$ matrix. Its SVD rank-$k$ approximation keeps the $k$ dominant shape components. For smooth paths, $k = 2$ or $3$ captures 99\\%+ of the path geometry while reducing data by 90\\% — the core idea behind spline fitting in CAM software. (3) **Probe calibration:** When calibrating a touch probe, you collect $m$ probe contact points as an $m \\times 3$ matrix. The singular values reveal probe eccentricity: if $\\sigma_3 \\ll \\sigma_1$, the contacts are nearly coplanar — a surface is being probed. The condition number $\\sigma_1/\\sigma_3$ measures how nearly parallel the probe axes are.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Compute the SVD of a Matrix',
        body: 'Step 1. **Form $A^TA$.** Compute the $n\\times n$ symmetric matrix $A^TA$.\n\nStep 2. **Find eigenvalues of $A^TA$.** These are $\\lambda_1 \\geq \\lambda_2 \\geq \\cdots \\geq 0$ (always non-negative). The singular values are $\\sigma_i = \\sqrt{\\lambda_i}$.\n\nStep 3. **Find eigenvectors of $A^TA$.** These orthonormal eigenvectors become the columns of $V$ (the right singular vectors).\n\nStep 4. **Compute left singular vectors.** For each $\\sigma_i > 0$: $\\mathbf{u}_i = \\frac{1}{\\sigma_i}A\\mathbf{v}_i$. Complete $U$ to an orthonormal basis if needed.\n\nStep 5. **Assemble $A = U\\Sigma V^T$.** Verify by multiplying back: $U\\Sigma V^T$ should equal $A$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 4 of 9 — Orthogonality & SVD',
        body: '**Previous (Lesson 3):** Least Squares — finding the best approximate solution using projection.\n**This lesson:** SVD — the universal factorization $A = U\\Sigma V^T$ that reveals the core structure of any matrix.\n**Next (Lesson 5):** Inner Product Spaces — generalizing length and angle to abstract spaces.',
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
        title: 'Prediction',
        body: 'For $A = \\begin{bmatrix}2&0\\\\0&3\\end{bmatrix}$ (diagonal): before computing, what are the singular values? What are $U$ and $V$? What does $\\Sigma$ look like? After you predict, compute $A^TA$ and verify your answer.',
      },
      {
        type: 'insight',
        title: 'Singular Values ≠ Eigenvalues',
        body: 'Singular values are always non-negative real numbers — even for matrices whose eigenvalues are complex or negative.\n\nFor symmetric positive definite matrices, singular values = eigenvalues. Otherwise, they are different objects.',
      },
    ],
    visualizations: [
      {
        id: 'SVDGeometricViz',
        title: 'SVD — Watch Any Matrix Decompose in Real Time',
        mathBridge: 'Drag the four matrix entries and watch σ₁, σ₂, and both rotation angles update live. The animated sequence shows Vᵀ then Σ then U applied one at a time. Try making the matrix a pure rotation (a=cosθ, b=-sinθ, c=sinθ, d=cosθ) and observe both singular values are 1. Try a rank-1 matrix and see σ₂ drop to zero — the unit circle flattens to a line segment.',
        caption: 'Singular values measure the "stretching power" of a matrix along its best-aligned axes — they are always non-negative and always real.',
      },
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
      '**The compact (thin) SVD.** If $A$ is $m\\times n$ with $\\text{rank}(A) = r$, only the first $r$ singular values are non-zero. The full SVD has many columns of $U$ and $V$ that multiply zero singular values and contribute nothing. The **compact SVD** keeps only the $r$ non-zero terms:\n\n$A = U_r \\Sigma_r V_r^T \\qquad (m\\times r)(r\\times r)(r\\times n)$',
      '**Low-rank approximation (Eckart-Young Theorem).** The rank-$k$ matrix closest to $A$ (in Frobenius norm) is obtained by keeping only the first $k$ singular value terms:\n\n$A_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i\\mathbf{v}_i^T$\n\nThe approximation error is $\\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$. No other rank-$k$ matrix is closer to $A$.',
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
        id: 'OpenMatNotebook',
        title: 'SVD in OpenMat',
        mathBridge: 'Compute SVD with the built-in svd() function, build low-rank approximations, and analyze CNC toolpath compression.',
        caption: 'MATLAB/OpenMat uses [U,S,V] = svd(A) — note S is a full matrix, not a vector.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing SVD: [U,S,V] = svd(A)',
              prose: [
                'MATLAB returns S as a full diagonal matrix. Use diag(S) to extract singular values.',
                'The three matrices encode the full transformation: $A = U\\Sigma V^T$ means "rotate by $V^T$, scale by $\\Sigma$, then rotate by $U$." Columns of $U$ are output directions, columns of $V$ are input directions, and diagonal entries of $S$ are the stretching factors (singular values). The singular values appear in descending order: $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq 0$.',
                "Verify the reconstruction with `norm(A - U*S*V', 'fro') < 1e-10`. The full format gives $S$ as an $m\\times n$ matrix; for a tall matrix ($m > n$), the last $m-n$ columns of $U$ span the left null space and correspond to zero singular values — this is why `svd(A, 'econ')` (economy form) returns a smaller $U$ and drops those columns.",
              ],
              code: `A = [3 1 1; 1 3 1]   % 2x3 matrix
[U, S, V] = svd(A)
disp('Singular values:')
singular_values = diag(S)
disp('U (left singular vectors):')
U
disp('V (right singular vectors):')
V
disp('Verify: U^T*U = I')
U'*U
disp('Verify: V^T*V = I')
V'*V
disp('Reconstruction error:')
norm(A - U*S*V')
`,
            },
            {
              id: 2,
              cellTitle: 'Low-rank approximation',
              prose: [
                'Keep only the k largest singular values to build the best rank-k approximation.',
                'The Eckart-Young theorem guarantees that $A_k = U_k\\Sigma_k V_k^T$ is the best rank-$k$ approximation in both Frobenius and spectral norms: $\\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$ and $\\|A - A_k\\|_2 = \\sigma_{k+1}$. No other rank-$k$ matrix comes closer to $A$.',
                'The energy fraction `sum(s[:k]**2) / sum(s**2)` measures what fraction of $\\|A\\|_F^2$ rank $k$ captures. Most real-world matrices (images, toolpaths, sensor readings) are nearly low-rank: 90% of the energy is typically captured by just 5–10% of the singular values. This makes truncated SVD the fundamental tool for lossy compression and dimensionality reduction.',
              ],
              code: `A = magic(6)   % 6x6 magic square
[U, S, V] = svd(A);
sigma = diag(S);
disp('Singular values of magic(6):')
sigma'

total_sq = sum(sigma.^2);
fprintf('\\nLow-rank approximations:\\n')
for k = 1:6
  Ak = U(:,1:k) * diag(sigma(1:k)) * V(:,1:k)';
  err = norm(A - Ak, 'fro');
  pct = sum(sigma(1:k).^2) / total_sq * 100;
  fprintf('k=%d: error=%.3f, info captured=%.1f%%\\n', k, err, pct);
end
`,
            },
            {
              id: 3,
              cellTitle: 'CNC toolpath compression',
              prose: [
                'A 3D toolpath is a 3xm matrix. SVD reveals its dominant shape and enables compression.',
                'The first singular value and vectors capture the dominant axis of the toolpath (primary feed direction). The second captures secondary variation (side steps in a raster pattern). If the toolpath is nearly 1D, $\\sigma_1 \\gg \\sigma_2$, and the rank-1 approximation reproduces the dominant shape with minimal error. Plotting `diag(S)` shows how quickly the singular values drop — a steep cliff indicates a truly low-rank path.',
                'Compression trade-off: full storage needs $3\\times m$ numbers; rank-$k$ needs $k(3 + m + 1)$ numbers (U: $3k$, S: $k$, Vt: $km$). For $m = 10000$ points with $k = 2$: full = 30000, compressed = 20008 — about 33% savings. For smooth CNC tool paths, rank-2 or rank-3 captures the geometry with sub-micron reconstruction error.',
              ],
              code: `% Simulate a helical CNC toolpath (3 x m matrix)
m = 200;
t = linspace(0, 4*pi, m);
% Helix: x=cos(t), y=sin(t), z=t/(4*pi) scaled
X = [cos(t); sin(t); t/(4*pi)];

[U, S, V] = svd(X, 'econ');
sigma = diag(S);
fprintf('Toolpath singular values: %.4f  %.4f  %.4f\\n', sigma(1), sigma(2), sigma(3))

% Rank-2 approximation captures the helical structure
X2 = U(:,1:2) * diag(sigma(1:2)) * V(:,1:2)';
err2 = norm(X - X2, 'fro') / norm(X, 'fro');
pct2 = sum(sigma(1:2).^2)/sum(sigma.^2)*100;
fprintf('Rank-2 captures %.1f%% of path (relative error: %.4f)\\n', pct2, err2)
fprintf('Storage: %d numbers vs original %d (%.0f%% compression)\\n', ...
  2*(3+m), 3*m, (1-2*(3+m)/(3*m))*100)
`,
            },
          ],
        },
      },
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing the SVD',
              prose: [
                '`np.linalg.svd(A)` returns U, S, Vt where A = U @ diag(S) @ Vt. U has orthonormal columns, S contains singular values in descending order, Vt has orthonormal rows. The rank of A equals the number of non-zero singular values.',
                'The heatmaps show the four matrices side by side. $U$ and $V^T$ have entries near $\\pm 1$ on their "active" directions and 0 elsewhere — they are rotation/reflection matrices. $\\Sigma$ is diagonal with the singular values on the main diagonal. Multiplying left-to-right: $V^T$ rotates input space, $\\Sigma$ stretches along the new axes, $U$ rotates to output space. `np.allclose(U @ np.diag(s) @ Vt, A)` verifies the reconstruction is exact.',
                'Use `full_matrices=False` (economy SVD) to get compact output: $U$ has shape $(m, k)$ and $V^T$ has shape $(k, n)$ where $k = \\min(m,n)$. The full $U$ and $V^T$ include extra columns/rows spanning the null spaces — useful theoretically but wasteful in memory. Singular values are always real and non-negative even for complex or non-square matrices; `np.linalg.matrix_rank(A)` counts those above `max(m,n) * eps * s[0]`.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 1.], [2., 2.], [0., 1.]])
U, s, Vt = np.linalg.svd(A, full_matrices=False)

print("U (left singular vectors):"); print(U.round(4))
print("s (singular values):", s.round(4))
print("Vt (right singular vectors^T):"); print(Vt.round(4))
print("Reconstruct A?", np.allclose(U @ np.diag(s) @ Vt, A))

fig, axes = plt.subplots(1, 4, figsize=(13, 3.5))
Sigma = np.diag(s)
for ax, M, title in zip(axes, [A, U, Sigma, Vt],
                         ['A', 'U (orthonormal)', 'S (singular vals)', 'V^T (orthonormal)']):
    lim = max(abs(M).max(), 0.1)
    ax.imshow(M, cmap='RdBu_r', aspect='auto', vmin=-lim, vmax=lim)
    ax.set_title(title, fontsize=10)
    for i in range(M.shape[0]):
        for j in range(M.shape[1]):
            ax.text(j, i, f'{M[i,j]:.2f}', ha='center', va='center', fontsize=9,
                    color='white' if abs(M[i,j]) > lim*0.6 else 'black')
    ax.set_xticks([]); ax.set_yticks([])
plt.suptitle("SVD: A = U S V^T", fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Low-rank approximation — Eckart-Young theorem',
              prose: [
                'The rank-k approximation keeps only the k largest singular values. It is the best possible rank-k approximation (Eckart-Young theorem). Watch how quickly the approximation improves as k increases.',
                'The visualization maps the unit circle (input space) to an ellipse (output space) via $A$. The axes of the ellipse are the left singular vectors $\\mathbf{u}_1, \\mathbf{u}_2$, and their lengths are the singular values $\\sigma_1, \\sigma_2$. The condition number $\\sigma_1/\\sigma_2$ is the ratio of the ellipse semi-axes — a nearly circular ellipse means a well-conditioned matrix; a very elongated one means ill-conditioned.',
                'The left singular vectors $V$ columns tell you which input directions get stretched most: $A\\mathbf{v}_1 = \\sigma_1\\mathbf{u}_1$ means $\\mathbf{v}_1$ maps to $\\sigma_1\\mathbf{u}_1$ in the output. The energy fraction $\\sigma_k^2 / \\|A\\|_F^2$ tells you what fraction of the total stretching power is in the $k$-th singular value — for most data matrices, the first few account for 95%+ of the energy.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3., 1.], [2., 2.], [0., 1.]])
U, s, Vt = np.linalg.svd(A, full_matrices=False)
V = Vt.T

# Geometric view: SVD maps unit circle to ellipse
# Unit circle in input space -> scale by s -> rotate by U
theta = np.linspace(0, 2*np.pi, 200)
circle = np.array([np.cos(theta), np.sin(theta)])  # 2D input space
ellipse = U * s[:, np.newaxis]  # columns scaled by singular values

print("Singular values:", s.round(4))
print("Condition number:", s[0]/s[-1], "(ratio of largest to smallest)")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
# Input space: unit circle + V columns
Vcircle = V @ circle
axes[0].plot(Vcircle[0], Vcircle[1], color='gray', lw=1, alpha=0.5, linestyle='--')
for i, (v_col, color) in enumerate(zip(V.T, ['steelblue','darkorange'])):
    axes[0].annotate('', xy=v_col, xytext=[0,0], arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    axes[0].text(v_col[0]+0.05, v_col[1]+0.05, f'v{i+1}', color=color, fontsize=11)
axes[0].set_title("Input: V columns (right singular vecs)", fontsize=11)
axes[0].set_aspect('equal'); axes[0].grid(True, alpha=0.3)
axes[0].axhline(0, color='k', lw=0.5); axes[0].axvline(0, color='k', lw=0.5)
# Output space: A maps unit circle to ellipse
output = A @ circle
axes[1].plot(output[0], output[1], color='steelblue', lw=2, alpha=0.7)
for i, (u_col, sv, color) in enumerate(zip(U.T, s, ['steelblue','darkorange'])):
    axes[1].annotate('', xy=sv*u_col, xytext=[0,0], arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    axes[1].text(sv*u_col[0]+0.05, sv*u_col[1]+0.05, f'sigma{i+1}*u{i+1}', color=color, fontsize=9)
axes[1].set_title("Output: A stretches unit circle to ellipse", fontsize=11)
axes[1].set_aspect('equal'); axes[1].grid(True, alpha=0.3)
axes[1].axhline(0, color='k', lw=0.5); axes[1].axvline(0, color='k', lw=0.5)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Condition number — numerical stability',
              prose: [
                'The condition number = σ₁ / σₙ (largest / smallest singular value). It measures how much a small change in b amplifies the error in the solution to Ax = b. A large condition number means the matrix is nearly singular — small input errors cause large output errors.',
                '`np.linalg.cond(A)` returns $\\sigma_1/\\sigma_n$. The well-conditioned matrix has $\\kappa \\approx 2$: a 1% change in $\\mathbf{b}$ causes at most a 2% change in $\\mathbf{x}$. The ill-conditioned $B$ has $\\kappa \\approx 10^4$: rows are almost proportional ($[1,2]$ and $[1.001, 2.001]$), so $B$ nearly collapses a direction — a tiny perturbation in $\\mathbf{b}$ can cause a massive change in the solution.',
                'Numerically, condition number $> 1/\\epsilon_{\\text{machine}} \\approx 10^{16}$ means the matrix is effectively singular. For least squares, a condition number $> 10^8$ means losing 8 decimal digits of precision in the solution. Regularization (ridge regression, `np.linalg.lstsq` with `rcond` parameter) fixes ill-conditioning by treating $\\sigma_i < \\text{rcond} \\cdot \\sigma_1$ as zero, effectively projecting onto a well-conditioned subspace.',
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
              prompt: 'Compute the pseudoinverse of A = [[1,2],[3,4],[5,6]] using SVD: Aâº = V Σâº Uᵀ, where Σâº replaces each σᵢ with 1/σᵢ. Verify by checking that Aâº @ A â‰ˆ I (n×n identity). Compare with np.linalg.pinv(A).',
              code: `import numpy as np

A = np.array([[1., 2.],
              [3., 4.],
              [5., 6.]])

# U, S, Vt = np.linalg.svd(A, full_matrices=False)
# S_plus = 1/S for non-zero entries
# A_plus = Vt.T @ np.diag(S_plus) @ U.T
# verify: A_plus @ A â‰ˆ I (2×2)
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
      '**The Eckart-Young Theorem (formal statement).** For the Frobenius norm $\\|M\\|_F = \\sqrt{\\sum_{ij} M_{ij}^2}$:\n\n$\\min_{\\text{rank}(B)\\leq k} \\|A - B\\|_F = \\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$\n\nThe truncated SVD $A_k$ is the best rank-$k$ approximation. This holds also for the spectral norm $\\|M\\|_2 = \\sigma_1(M)$.',
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
    {
      id: 'la4-002-svd-ex3',
      title: 'Eckart-Young: verifying the best rank-1 approximation',
      problem: 'For $A = \\begin{bmatrix}4&1\\\\1&4\\end{bmatrix}$, find the SVD, the best rank-1 approximation $A_1$, and verify the Frobenius error $\\|A - A_1\\|_F = \\sigma_2$.',
      steps: [
        {
          expression: 'A = A^T \\Rightarrow \\text{SVD} = \\text{eigendecomposition.} \\quad p(\\lambda) = (\\lambda-4)^2-1 = 0 \\Rightarrow \\lambda_1=5,\\; \\lambda_2=3',
          annotation: '$A$ is symmetric, so its singular values are its (positive) eigenvalues. Characteristic polynomial: $\\lambda^2 - 8\\lambda + 15 = (\\lambda-5)(\\lambda-3)$.',
          strategyTitle: 'Find singular values',
          checkpoint: 'For a symmetric PD matrix, how do singular values relate to eigenvalues?',
          hints: ['For symmetric positive definite A, singular values = eigenvalues (both are positive real). For general symmetric A, singular values = |eigenvalues|.'],
        },
        {
          expression: '\\mathbf{v}_1 = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\end{bmatrix}, \\quad \\mathbf{v}_2 = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}-1\\\\1\\end{bmatrix}',
          annotation: 'Eigenvectors of $A$. For $\\lambda=5$: $(A-5I)\\mathbf{v}=0$ → $[-1,1;1,-1]\\mathbf{v}=0$ → $v_1=v_2$. Normalize. For $\\lambda=3$: $v_1=-v_2$.',
          strategyTitle: 'Find singular vectors',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'A_1 = \\sigma_1 \\mathbf{u}_1\\mathbf{v}_1^T = 5 \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\end{bmatrix} \\cdot \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1&1\\end{bmatrix} = \\frac{5}{2}\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}',
          annotation: 'Rank-1 term: $\\sigma_1\\mathbf{u}_1\\mathbf{v}_1^T$. Since $A$ is symmetric, $\\mathbf{u}_1 = \\mathbf{v}_1$.',
          strategyTitle: 'Compute rank-1 approximation',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\|A - A_1\\|_F = \\left\\|\\sigma_2\\mathbf{u}_2\\mathbf{v}_2^T\\right\\|_F = \\sigma_2\\|\\mathbf{u}_2\\|\\|\\mathbf{v}_2\\| = 3 \\cdot 1 \\cdot 1 = 3',
          annotation: 'By Eckart-Young, $\\|A - A_1\\|_F = \\sigma_2 = 3$. Direct check: $A - A_1 = \\begin{bmatrix}4-5/2 & 1-5/2\\\\1-5/2 & 4-5/2\\end{bmatrix} = \\frac{3}{2}\\begin{bmatrix}1&-1\\\\-1&1\\end{bmatrix}$, and $\\|\\cdot\\|_F = \\sqrt{4\\cdot(3/2)^2} = 3$ ✓.',
          strategyTitle: 'Verify Eckart-Young error',
          checkpoint: 'Could any other rank-1 matrix achieve error < 3?',
          hints: ['No — Eckart-Young theorem proves the rank-1 truncated SVD is the best rank-1 approximation in Frobenius norm. Any other rank-1 matrix has error ≥ σ₁.'],
        },
      ],
      conclusion: '$A_1 = (5/2)\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$ is the best rank-1 approximation to $A = \\begin{bmatrix}4&1\\\\1&4\\end{bmatrix}$. The Frobenius error equals $\\sigma_2 = 3$. The information retained: $\\sigma_1^2/(\\sigma_1^2+\\sigma_2^2) = 25/34 \\approx 74\\%$.',
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
      answer: 'rank = 3; rank-1 approximation captures â‰ˆ91.7% of Frobenius norm',
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
      hint: 'Eckart-Young: error = σ₁. Frobenius norm² = σ₁² + σ₁². Information fraction = σ₁²/(σ₁²+σ₁²).',
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
      'Large singular values = important directions. Small â‰ˆ noise.',
      'Rank = number of non-zero singular values.',
      '||A||_F = sqrt(σ₁² + σ₁² + ...). ||A||₁ = σ₁.',
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
    'Pseudoinverse Aâº = VΣâºUᵀ handles everything least squares cannot.',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la4-svd-1', label: 'Read: State the three matrices in A = UΣVᵀ', type: 'read' },
    { id: 'cp-la4-svd-2', label: 'Read: Explain how singular values differ from eigenvalues', type: 'read' },
    { id: 'cp-la4-svd-3', label: 'Read: State the Eckart-Young theorem', type: 'read' },
    { id: 'cp-la4-svd-4', label: 'Lab: Visualize Vᵀ → Σ → U acting on the unit circle', type: 'lab' },
    { id: 'cp-la4-svd-5', label: 'Lab: Compute rank-k approximation and measure compression ratio', type: 'lab' },
    { id: 'cp-la4-svd-6', label: 'Example: SVD of a diagonal matrix', type: 'example' },
    { id: 'cp-la4-svd-7', label: 'Example: Best rank-1 approximation', type: 'example' },
    { id: 'cp-la4-svd-8', label: 'Challenge: Verify Eckart-Young error bound numerically', type: 'challenge' },
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la4-004-assess-1',
        type: 'choice',
        text: 'A matrix has singular values 6, 4, and 0. What is the rank of the matrix?',
        options: ['2', '3', '1', '0'],
        answer: '2',
        hints: ['Rank = number of non-zero singular values. Two of the three singular values (6 and 4) are nonzero, so rank = 2.'],
        reviewSection: 'Math tab — rank from SVD',
      },
      {
        id: 'la4-004-assess-2',
        type: 'choice',
        text: 'In the pseudoinverse $A^+ = V\\Sigma^+U^T$, what does $\\Sigma^+$ do to the diagonal entries of $\\Sigma$?',
        options: [
          'It replaces each non-zero $\\sigma_i$ with $1/\\sigma_i$ and keeps zero entries as zero',
          'It squares each singular value',
          'It transposes $\\Sigma$',
          'It replaces every entry with 1',
        ],
        answer: 'It replaces each non-zero $\\sigma_i$ with $1/\\sigma_i$ and keeps zero entries as zero',
        hints: ['Dividing by zero is the problem with rank-deficient matrices. $\\Sigma^+$ sidesteps it: invert only the non-zero diagonal entries, leave zeros alone.'],
        reviewSection: 'Math tab — Pseudoinverse via SVD',
      },
      {
        id: 'la4-004-assess-3',
        type: 'choice',
        text: 'A rank-2 matrix has singular values $\\sigma_1 = 5$ and $\\sigma_2 = 3$. What is the Frobenius error of the best rank-1 approximation?',
        options: ['3', '5', '$\\sqrt{34}$', '2'],
        answer: '3',
        hints: ['Eckart-Young: $\\|A - A_1\\|_F = \\sigma_2$. The rank-1 truncation discards the second singular value, so the error equals that discarded value: 3.'],
        reviewSection: 'Math tab — Eckart-Young: Best Low-Rank Approximation',
      },
      {
        id: 'la4-004-assess-4',
        type: 'choice',
        text: 'Which statement best describes the geometric meaning of SVD $A = U\\Sigma V^T$?',
        options: [
          'It diagonalizes $A$ into $PDP^{-1}$ using eigenvalues',
          'It factors $A$ into: rotate input ($V^T$) → stretch by singular values ($\\Sigma$) → rotate output ($U$)',
          'It converts $A$ into its reduced row echelon form',
          'It decomposes $A$ into upper and lower triangular matrices',
        ],
        answer: `It factors $A$ into: rotate input ($V^T$) → stretch by singular values ($\\Sigma$) → rotate output ($U$)`,
        hints: ['Every matrix transforms the unit sphere into an ellipse. SVD decomposes that into three steps: first rotate the input (no distortion yet), then stretch each axis independently, then rotate the output to its final position.'],
        reviewSection: 'Intuition tab — geometric picture',
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
      type: 'choice',
      text: 'A matrix has singular values 5 and 12. What is its Frobenius norm?',
      options: ['13', '17', '60', '$\\sqrt{17}$'],
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
    {
      id: 'q-la4-svd-5',
      type: 'choice',
      text: 'For a matrix $A$ with SVD $A = U\\Sigma V^T$, what is the pseudoinverse $A^+$?',
      options: [
        '$(A^TA)^{-1}A^T$',
        '$V\\Sigma^+ U^T$, where $\\Sigma^+$ inverts each non-zero singular value',
        '$U^T\\Sigma^{-1}V$',
        '$(AA^T)^{-1}A$',
      ],
      answer: '$V\\Sigma^+ U^T$, where $\\Sigma^+$ inverts each non-zero singular value',
      hints: ['Σâº replaces each non-zero σᵢ with 1/σᵢ and keeps zeros as zeros. Aâº = VΣâºUᵀ is valid for any rank matrix — it handles rank-deficient cases gracefully.'],
      reviewSection: 'Math — pseudoinverse via SVD',
    },
    {
      id: 'q-la4-svd-6',
      type: 'choice',
      text: 'The condition number $\\sigma_1/\\sigma_n$ of a matrix measures:',
      options: [
        'The largest singular value',
        'The rank of the matrix',
        'How much small changes in $\\mathbf{b}$ can amplify errors in the solution $\\hat{\\mathbf{x}}$ to $A\\mathbf{x} = \\mathbf{b}$',
        'The determinant of $A$',
      ],
      answer: 'How much small changes in $\\mathbf{b}$ can amplify errors in the solution $\\hat{\\mathbf{x}}$ to $A\\mathbf{x} = \\mathbf{b}$',
      hints: ['A perturbation Î´b in b causes a change Î´x with –Î´x–/–x– ≤ Îº(A)·–Î´b–/–b–, where Îº(A)=σ₁/σ₁™. Large Îº means tiny changes in b cause large changes in x.'],
      reviewSection: 'Math — condition number',
    },
    {
      id: 'q-la4-svd-7',
      type: 'choice',
      text: 'The number of non-zero singular values of $A$ equals:',
      options: [
        'The number of rows of $A$',
        'The number of columns of $A$',
        'The rank of $A$',
        'The trace of $A$',
      ],
      answer: 'The rank of $A$',
      hints: ['σᵢ = 0 iff the ith right singular vector is in the null space of A. The number of non-zero σᵢ equals the dimension of the row space = rank(A).'],
      reviewSection: 'Math — SVD and rank',
    },
    {
      id: 'q-la4-svd-8',
      type: 'choice',
      text: 'For a rank-2 matrix with singular values $\\sigma_1 = 10, \\sigma_2 = 2$, what percentage of the Frobenius norm squared is captured by the rank-1 approximation?',
      options: [
        '$50\\%$',
        '$80\\%$',
        '$96\\%$',
        '$100\\%$',
      ],
      answer: '$96\\%$',
      hints: ['σ₁²/(σ₁² + σ₁²) = 100/(100+4) = 100/104 â‰ˆ 96.15%.'],
      reviewSection: 'Math — low-rank approximation',
    },
    {
      id: 'q-la4-svd-9',
      type: 'choice',
      text: 'For a symmetric positive definite matrix $A$, the relationship between eigenvalues and singular values is:',
      options: [
        'Singular values = negative eigenvalues',
        'Singular values = square roots of eigenvalues',
        'Singular values = eigenvalues exactly',
        'They are unrelated',
      ],
      answer: 'Singular values = eigenvalues exactly',
      hints: ['For SPD A: A = QÎ›Qᵀ (spectral theorem), and A^TA = QÎ›²Qᵀ. So σᵢ = âˆšλᵢ(AᵀA) = âˆšλᵢ² = λᵢ (since λᵢ > 0).'],
      reviewSection: 'Intuition — Singular Values ≠ Eigenvalues callout',
    },
    {
      id: 'q-la4-svd-10',
      type: 'choice',
      text: 'In the SVD $A = U\\Sigma V^T$, the columns of $V$ are:',
      options: [
        'Left singular vectors (in the output space)',
        'Right singular vectors (in the input space) — eigenvectors of $A^TA$',
        'The eigenvectors of $AA^T$',
        'The columns of $A$ normalized',
      ],
      answer: 'Right singular vectors (in the input space) — eigenvectors of $A^TA$',
      hints: ['V comes from the eigendecomposition of AᵀA. The transformation A = UΣVᵀ first applies Vᵀ (rotate input), then Σ (scale), then U (rotate output). V acts in the input space (domain of A).'],
      reviewSection: 'Math — computing SVD from eigenvalues',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Singular values are the same as eigenvalues.',
      whyStudentsThinkIt: 'Both appear as diagonal entries in matrix factorizations ($D$ in $PDP^{-1}$ and $\\Sigma$ in $U\\Sigma V^T$), so students conflate them.',
      correctionExample: 'For $A = \\begin{bmatrix}0&2\\\\0&0\\end{bmatrix}$: eigenvalues are both 0, but $A^TA = \\begin{bmatrix}0&0\\\\0&4\\end{bmatrix}$ has eigenvalues 0 and 4, giving singular values 0 and 2. They are completely different.',
      contrastCase: 'Singular values are always non-negative real numbers; eigenvalues can be negative or complex. Only for symmetric positive definite matrices do they coincide.',
    },
    {
      falseBelief: 'The rank-$k$ truncated SVD is an approximation but not necessarily the best rank-$k$ approximation.',
      whyStudentsThinkIt: 'It seems like an intuitive choice rather than a provably optimal one.',
      correctionExample: 'The Eckart-Young theorem proves it: for any rank-$k$ matrix $B$, $\\|A - B\\|_F \\geq \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$. The truncated SVD achieves this bound — no other rank-$k$ matrix can do better.',
      contrastCase: 'For compression: if you truncate to rank 1 and lose $\\sigma_2 = 3$ in the example, no other rank-1 matrix has a smaller Frobenius error than 3.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to compress a high-resolution image stored as a matrix of pixel values (1000×1000 = 1M numbers) for efficient transmission.',
      competingTechniques: 'JPEG compression (DCT-based); Random sampling; SVD truncation',
      whyThisTechniqueWins: 'SVD rank-$k$ truncation is the provably optimal linear compression: for a given storage budget ($k(m+n+1)$ numbers vs $mn$ original), it minimizes Frobenius error. In practice, JPEG is faster to compute, but SVD gives the theoretical baseline for quality.',
    },
    {
      situation: 'In recommendation systems, users × items ratings matrix has many missing entries and is approximately low-rank. You want to predict missing ratings.',
      competingTechniques: 'Fill missing values with average; Nearest neighbor; SVD / matrix factorization',
      whyThisTechniqueWins: 'The observed entries approximately follow a low-rank structure (users can be described by a few "taste factors"). SVD (or its variant, truncated matrix factorization) recovers this structure and generalizes to predict unseen ratings — the basis of Netflix Prize-winning algorithms.',
    },
  ],

  debugging: [
    {
      commonError: 'Confusing $U$ (left singular vectors, $m\\times m$) with $V$ (right singular vectors, $n\\times n$) in $A = U\\Sigma V^T$.',
      symptom: 'Shape mismatch when trying to reconstruct $A$ from the SVD — the matrix product dimensions do not work out.',
      whyItHappened: 'For a rectangular $m\\times n$ matrix, $U$ is $m\\times m$ and $V$ is $n\\times n$. The left singular vectors live in the output space, right singular vectors in the input space.',
      repairStrategy: 'Always check: $U$ is $m\\times m$, $\\Sigma$ is $m\\times n$, $V^T$ is $n\\times n$. The product $(m\\times m)(m\\times n)(n\\times n) = m\\times n$, matching $A$. Also: $\\mathbf{u}_i = (1/\\sigma_i)A\\mathbf{v}_i$ (not the other way).',
    },
    {
      commonError: 'Using eigenvalues of $A$ as singular values for a non-symmetric matrix.',
      symptom: 'Negative "singular values" or complex "singular values" — which are impossible.',
      whyItHappened: 'Singular values are eigenvalues of $A^TA$ (not $A$), and $A^TA$ is always positive semidefinite, so its eigenvalues are always non-negative.',
      repairStrategy: 'For singular values: form $A^TA$, find its eigenvalues $\\lambda_i \\geq 0$, then $\\sigma_i = \\sqrt{\\lambda_i}$. If you get any negative eigenvalues of $A^TA$, re-check the computation — $A^TA$ can never have negative eigenvalues.',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Compute the SVD of a 2×2 matrix via $A^TA$ eigendecomposition, perform rank-$k$ approximation, and state the Frobenius error.',
    explainVerbally: 'Explain the geometric meaning of each matrix in $A = U\\Sigma V^T$, why singular values differ from eigenvalues, and what Eckart-Young guarantees.',
    detectIncorrectApplication: 'Catch eigenvalue-singular value confusion; catch $U$/$V$ shape mismatches; recognize when a condition number signals numerical trouble.',
    transferToUnfamiliar: 'Apply SVD to image compression, recommendation systems, PCA, or pseudoinverse computation — any context requiring a stable matrix factorization.',
  },
};
