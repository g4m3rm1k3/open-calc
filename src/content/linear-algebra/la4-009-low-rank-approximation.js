export default {
  id: 'la4-009',
  slug: 'low-rank-approximation',
  chapter: 'la4',
  order: 9,
  title: 'Low-Rank Approximation',
  subtitle: 'The best rank-$k$ approximation to any matrix $A$ is obtained by keeping the top $k$ singular values and discarding the rest. This theorem — proved by Eckart-Young — is the mathematical foundation of data compression, PCA, and dimensionality reduction.',
  tags: ['low-rank approximation', 'Eckart-Young theorem', 'truncated SVD', 'data compression', 'best approximation', 'singular values', 'rank-k', 'image compression'],
  aliases: 'low-rank approximation Eckart-Young truncated SVD best rank-k approximation data compression image compression PCA dimensionality reduction',

  hook: {
    question: "A $1000 \\times 1000$ image has $10^6$ pixel values. Can you store the essential information in just $1000 \\times 20 = 20000$ numbers — 50x compression — while keeping the image recognizable? The answer is yes, using low-rank approximation.",
    realWorldContext: "Low-rank approximation is the engine behind Netflix's recommendation system (collaborative filtering), image and video compression (JPEG-2000 uses wavelets, which are low-rank), face recognition (eigenfaces = top PCA components), NLP word embeddings (GloVe, word2vec use low-rank matrix factorizations of co-occurrence matrices), and physics simulations (reduced-order models approximate high-dimensional PDEs with low-rank dynamics). The Eckart-Young theorem guarantees these are the BEST possible approximations in both the 2-norm and Frobenius norm.",
  },

  intuition: {
    prose: [
      'Imagine a $256 \\times 256$ grayscale image — a matrix of 65,536 pixel values. Computing its SVD reveals something striking: most of the visual information sits in the first 10—20 singular values, while the remaining 236+ are near zero. If you keep only the top $k$ singular values and discard the rest, you get a matrix that looks almost identical to the original image — but stores only $k(256 + 256 + 1)$ numbers instead of 65,536. For $k=20$, that is 10,260 numbers versus 65,536 — an 84% reduction with barely visible quality loss. The mathematics that makes this exact and optimal is the Eckart-Young theorem.',
      '**Best rank-1 approximation with numbers.** Take $A = \\begin{pmatrix}4&3\\\\2&1\\end{pmatrix}$. SVD: singular values $\\sigma_1 \\approx 5.46$, $\\sigma_2 \\approx 0.37$. Top singular vectors: $u_1 \\approx (0.86, 0.51)^\\top$, $v_1 \\approx (0.90, 0.44)^\\top$. Best rank-1 approximation: $A_1 = \\sigma_1 u_1 v_1^\\top \\approx 5.46 \\cdot \\begin{pmatrix}0.77&0.38\\\\0.46&0.22\\end{pmatrix} \\approx \\begin{pmatrix}4.2&2.1\\\\2.5&1.2\\end{pmatrix}$. Error $\\|A - A_1\\|_2 = \\sigma_2 \\approx 0.37$ — the best possible for any rank-1 matrix. The singular value $\\sigma_2$ is the "cost" of discarding the second component.',
      '**The Eckart-Young theorem.** For $A = \\sum_{i=1}^r \\sigma_i u_i v_i^\\top$, the rank-$k$ truncation $A_k = \\sum_{i=1}^k \\sigma_i u_i v_i^\\top$ satisfies: (1) $\\|A - A_k\\|_2 = \\sigma_{k+1}$ (the $(k+1)$-th singular value). (2) $\\|A - A_k\\|_F^2 = \\sigma_{k+1}^2 + \\cdots + \\sigma_r^2$ (sum of discarded singular values squared). (3) For any rank-$k$ matrix $B$: $\\|A - B\\|_2 \\geq \\sigma_{k+1}$ and $\\|A - B\\|_F \\geq \\|A - A_k\\|_F$. $A_k$ is the BEST rank-$k$ approximation in BOTH norms simultaneously.',
      '**Compression ratio and energy.** The Frobenius norm $\\|A\\|_F^2 = \\sum_i \\sigma_i^2$ is the total "energy." Keeping the top $k$ singular values captures energy fraction $\\sum_{i=1}^k \\sigma_i^2 / \\sum_{i=1}^r \\sigma_i^2$. For images, often 90% of the energy is in the top 1-5% of singular values. Storage: $A$ needs $mn$ numbers; $A_k = U_k \\Sigma_k V_k^\\top$ needs $mk + k + nk = k(m+n+1)$ numbers. Compression ratio: $mn / (k(m+n+1))$.',
      '**Why the singular values decay fast for natural data.** Real-world data matrices — images, user ratings, genomic data — tend to have rapidly decaying singular values because the data has structure. A natural image is not random noise: nearby pixels are correlated, and the image can be described as a sum of a few dominant patterns (edges, gradients, textures) plus small corrections. Random noise has singular values of roughly equal size (all $\\approx \\sqrt{n}$ by random matrix theory). The faster the singular values decay, the more compressible the matrix — and the better low-rank approximation works.',
      '**PCA is low-rank approximation applied to a covariance matrix.** Given data matrix $X$ ($m$ samples, $n$ features, zero-centered), the covariance is $C = X^TX / m$ (symmetric). By the spectral theorem, $C = Q\\Lambda Q^T$. The top eigenvector $\\mathbf{q}_1$ is the direction of maximum variance — the first principal component. Projecting each sample onto $\\mathbf{q}_1,\\ldots,\\mathbf{q}_k$ reduces the data from $n$-dimensional to $k$-dimensional while preserving the maximum variance. This is exactly the rank-$k$ approximation: project data onto the top $k$ principal directions, discard the rest. Eckart-Young guarantees this is the best possible $k$-dimensional linear projection.',
      '**CNC toolpath compression with SVD.** A 3D CNC toolpath with $m$ waypoints is stored as a $3 \\times m$ matrix $T$ (each column is a 3D point). For smooth paths — circles, spirals, polynomial splines — the matrix $T$ has low rank: all the geometry lives in 2 or 3 directions. The rank-$k$ approximation $T_k = U_k \\Sigma_k V_k^T$ keeps only the dominant shape components. For a helical toolpath, $k=2$ captures $>99\\%$ of the path geometry. In CAM software, this is essentially what happens when the system converts waypoints to NURBS splines: it finds a low-dimensional representation of the toolpath. The approximation error in the SVD sense gives a bound on how far the compressed path deviates from the original.',
      '**Where this is heading.** Low-rank approximation is the final major idea of the linear algebra curriculum. Looking forward: in data science, it connects to **matrix completion** (fill in missing entries from a partially-observed matrix — the Netflix problem), **robust PCA** (separate a low-rank signal from sparse noise), and **tensor decompositions** (generalizing SVD to 3D+ arrays). Every one of these builds on the same core idea: real data has low-dimensional structure, and SVD is the optimal tool for finding it.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Compute the Best Rank-$k$ Approximation',
        body: 'Step 1. **Compute the full SVD.** $A = U\\Sigma V^\\top$ with $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq \\sigma_r > 0$.\n\nStep 2. **Choose $k$.** Either specify $k$ directly, or choose $k$ to capture a target energy fraction: find smallest $k$ with $\\sum_{i=1}^k \\sigma_i^2 / \\sum_i \\sigma_i^2 \\geq$ target.\n\nStep 3. **Form $A_k$.** Keep only the first $k$ columns of $U$, first $k$ singular values, and first $k$ rows of $V^\\top$:\n$A_k = U_k \\Sigma_k V_k^\\top = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$\n\nStep 4. **Compute the error.** 2-norm error $= \\sigma_{k+1}$. Frobenius error $= \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$. Eckart-Young guarantees no rank-$k$ matrix does better.\n\nStep 5. **Verify the compression.** Storage: $k(m+n+1)$ numbers vs $mn$ original. Check that $A_k$ is close enough to $A$ for the intended use case.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 9 of 9 — Orthogonality & SVD',
        body: '**Previous (Lesson 8):** Pseudoinverse — the minimum-norm least-squares solution via $A^+ = V\\Sigma^+U^T$.\n**This lesson:** Low-Rank Approximation — the Eckart-Young theorem and why keeping the top $k$ singular values is the best possible rank-$k$ approximation in both the 2-norm and Frobenius norm.\n**Next (Chapter 6):** Abstract Vector Spaces — extending the ideas of bases, dimension, and linear transformations beyond $\\mathbb{R}^n$.',
      },
      {
        type: 'insight',
        title: 'Prediction: how much rank-1 captures',
        body: 'Let $A = \\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$ (diagonal). Singular values: $\\sigma_1=3$, $\\sigma_2=1$. **Before computing:** predict what fraction of the Frobenius energy the rank-1 approximation captures. After predicting: $\\|A\\|_F^2 = 9+1=10$. $A_1 = 3e_1e_1^\\top = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$. Energy captured: $9/10 = 90\\%$. Error $\\|A-A_1\\|_F = 1 = \\sigma_2$. So throwing away the second singular value loses only 10% of the energy but drops rank from 2 to 1.',
      },
      {
        type: 'theorem',
        title: 'Eckart-Young Theorem',
        body: 'Let $A = U\\Sigma V^\\top$ with $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq \\sigma_r > 0$. Define $A_k = \\sum_{i=1}^k \\sigma_i u_i v_i^\\top$ (truncated SVD).\n\n**Best 2-norm:** $\\min_{\\text{rank}(B)\\leq k}\\|A-B\\|_2 = \\sigma_{k+1}$, achieved by $B=A_k$.\n\n**Best Frobenius:** $\\min_{\\text{rank}(B)\\leq k}\\|A-B\\|_F = \\sqrt{\\sigma_{k+1}^2+\\cdots+\\sigma_r^2}$, achieved by $B=A_k$.\n\nThe same $A_k$ is optimal for both norms simultaneously.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Low-Rank Approximation',
        mathBridge: 'Compute truncated SVD approximations and measure approximation quality.',
        caption: 'Rank-k approximation = sum of top k singular value × outer product terms.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'SVD truncation and energy',
              prose: [
                'Compute low-rank approximations and measure how much energy each rank captures.',
                '`[U, S, V] = svd(A)` returns the full SVD. For a rank-k approximation: take the first k columns of U, the top-left k×k block of S, and the first k columns of V. `A_k = U(:,1:k) * S(1:k,1:k) * V(:,1:k)\'`. The energy fraction is `sum(diag(S(1:k,1:k)).^2) / sum(diag(S).^2)`.',
                'Plot both: (1) singular values on a semilogy plot — look for the "elbow" where values drop sharply, that is the natural rank; (2) energy fraction vs k — most matrices reach 95% energy with very small k. These two plots together tell you how much compression is possible before you start losing significant information.',
              ],
              code: `% Create a test matrix with decaying singular values
rng(42)
A = randn(10, 8)  % random 10x8 matrix

[U, S, V] = svd(A)
sigma = diag(S)
disp('Singular values:')
sigma'

% Total energy
total_energy = sum(sigma.^2)

% Cumulative energy fraction
cumulative = cumsum(sigma.^2) / total_energy
disp('Cumulative energy fraction:')
cumulative'

% Rank-k approximation for k = 1, 2, 3
for k = 1:3
    Ak = U(:,1:k) * S(1:k,1:k) * V(:,1:k)'
    err_F = norm(A - Ak, 'fro')
    err_2 = norm(A - Ak, 2)
    sigma_next = sigma(k+1)
    fprintf('k=%d: ||A-Ak||_F=%.4f, ||A-Ak||_2=%.4f, sigma_%d=%.4f\\n', ...
            k, err_F, err_2, k+1, sigma_next)
end
`,
            },
            {
              id: 2,
              cellTitle: 'Image compression via SVD',
              prose: [
                'Simulate image compression by approximating a matrix with low-rank truncated SVD.',
                'For a grayscale image matrix M (pixels as matrix entries), `[U, S, V] = svd(M)` decomposes it. The rank-k approximation `M_k = U(:,1:k) * S(1:k,1:k) * V(:,1:k)\'` stores only `k*(m+n+1)` numbers instead of `m*n`. The compression ratio is `k*(m+n+1) / (m*n)`. For k=10 on a 100×100 image: 10*(100+100+1)/10000 = 20.1% of original size.',
                'Show the reconstructed image using `imagesc(M_k); colormap(gray)` for several values of k. At k=1, you see only the dominant brightness gradient. By k=5–10, the main structure is recognizable. By k=20–30, the image looks nearly identical to the original. This is the Eckart-Young theorem in action: each added rank-1 term `sigma_i * u_i * v_i\'` fills in one more "frequency layer".',
              ],
              code: `% Create a structured "image-like" matrix
n = 50
[X, Y] = meshgrid(1:n, 1:n)
% Structured image: sum of rank-1 patterns
A = sin(X/5) .* cos(Y/5) + 0.5*sin(X/10) + randn(n,n)*0.1

[U, S, V] = svd(A)
sigma = diag(S)

% Show singular values (should decay quickly for structured data)
disp('Top 10 singular values:')
sigma(1:10)'

% Approximation quality vs rank
ranks = [1, 3, 5, 10]
total_energy = norm(A, 'fro')^2
for k = ranks
    Ak = U(:,1:k) * S(1:k,1:k) * V(:,1:k)'
    energy_pct = sum(sigma(1:k).^2) / total_energy * 100
    err = norm(A - Ak, 'fro') / norm(A, 'fro') * 100
    storage_ratio = k*(2*n+1) / n^2 * 100
    fprintf('Rank %2d: %.1f%% energy, %.1f%% error, %.1f%% storage\\n', ...
            k, energy_pct, err, storage_ratio)
end
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof sketch of Eckart-Young.** Suppose $B$ has rank $k$ and $\\|A-B\\|_2 < \\sigma_{k+1}$. Since $\\text{rank}(B)=k$, its null space $N(B)$ has dimension $\\geq n-k$. The span of $\\{v_1,\\ldots,v_{k+1}\\}$ has dimension $k+1$, so by dimension count, there exists a unit vector $\\mathbf{w}$ in $N(B) \\cap \\text{span}\\{v_1,\\ldots,v_{k+1}\\}$. Then $\\|(A-B)\\mathbf{w}\\| = \\|A\\mathbf{w}\\|$ (since $B\\mathbf{w}=0$). But $A\\mathbf{w} = \\sum_{i=1}^{k+1}\\sigma_i(v_i^\\top\\mathbf{w})u_i$, so $\\|A\\mathbf{w}\\|^2 = \\sum_{i=1}^{k+1}\\sigma_i^2(v_i^\\top\\mathbf{w})^2 \\geq \\sigma_{k+1}^2\\sum(v_i^\\top\\mathbf{w})^2 = \\sigma_{k+1}^2$ (since $\\|\\mathbf{w}\\|=1$ and the $v_i$ are orthonormal). Contradiction.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Nuclear Norm and Convex Relaxation',
        body: 'The rank-$k$ constraint (rank$(B) \\leq k$) is non-convex and NP-hard to optimize over in general. The **nuclear norm** $\\|A\\|_* = \\sum_i \\sigma_i$ is the convex envelope of the rank function.\n\nMinimizing $\\|A-B\\|_F^2 + \\lambda\\|B\\|_*$ gives a convex problem whose solution is the soft-thresholded SVD: $B = \\sum_i \\max(\\sigma_i - \\lambda, 0)\\cdot u_i v_i^\\top$.\n\nThis is used in matrix completion (Netflix problem) and robust PCA.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Low-Rank Approximation and PCA',
        mathBridge: 'Truncated SVD: U[:,:k] @ np.diag(S[:k]) @ Vt[:k,:]. Energy fraction: np.sum(S[:k]**2)/np.sum(S**2). PCA via eigh on covariance matrix.',
        caption: 'Eckart-Young: the rank-k truncated SVD is the best possible rank-k matrix approximation in both the 2-norm and Frobenius norm.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Eckart-Young theorem — verify best rank-k approximation',
              prose: [
                'The rank-$k$ truncated SVD is the best rank-$k$ approximation. $\\|A - A_k\\|_2 = \\sigma_{k+1}$ and $\\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots}$. No other rank-$k$ matrix does better. We verify: for each $k$, compute the error and confirm it equals the $(k+1)$-th singular value.',
                'Pattern: `U, s, Vt = np.linalg.svd(A, full_matrices=False)`. Rank-k approximation: `A_k = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]`. Error in spectral norm: `np.linalg.norm(A - A_k, ord=2)` should equal `s[k]`. Error in Frobenius norm: `np.linalg.norm(A - A_k, "fro")` should equal `np.sqrt(np.sum(s[k:]**2))`.',
                'The two error curves (spectral and Frobenius) both decrease as k increases, but at different rates. The Frobenius curve drops faster because it sums the remaining singular values squared. The spectral curve drops one step at a time (each step = one singular value). Plotting both helps you decide k: where does the "elbow" in the Frobenius curve occur?',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Image-like matrix: rank-k approximation
np.random.seed(42)
# Construct a rank-3 matrix (3 signal components) + noise
true_signal = np.outer(np.sin(np.linspace(0,np.pi,20)), np.cos(np.linspace(0,np.pi,20)))
true_signal += 0.5 * np.outer(np.linspace(-1,1,20), np.linspace(-1,1,20))
A = true_signal + 0.3 * np.random.randn(20, 20)

U, s, Vt = np.linalg.svd(A, full_matrices=False)

# Rank-k approximations
def rank_k(U, s, Vt, k):
    return U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]

print("Singular values (first 8):", s[:8].round(3))
print("Cumulative energy at k=1:", (s[0]**2 / (s**2).sum() * 100).round(1), "%")
print("Cumulative energy at k=3:", ((s[:3]**2).sum() / (s**2).sum() * 100).round(1), "%")

fig, axes = plt.subplots(1, 4, figsize=(13, 3.5))
for ax, (M, title) in zip(axes, [(A,'Original'), (rank_k(U,s,Vt,1),'Rank-1'),
                                   (rank_k(U,s,Vt,3),'Rank-3'), (rank_k(U,s,Vt,10),'Rank-10')]):
    ax.imshow(M, cmap='RdBu_r', aspect='equal', vmin=-1.5, vmax=1.5)
    err = np.linalg.norm(A - M, 'fro') / np.linalg.norm(A, 'fro')
    ax.set_title(f"{title}\nerror={err:.3f}", fontsize=10)
    ax.set_xticks([]); ax.set_yticks([])
plt.suptitle("Low-rank approximation via SVD truncation", fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'PCA as low-rank approximation of the covariance matrix',
              prose: [
                'PCA finds the $k$ directions of maximum variance in data. The covariance matrix $C = X^TX/m$ is symmetric — its eigenvectors are the principal components. Projecting data onto the top $k$ eigenvectors is equivalent to the rank-$k$ approximation $X \\approx X_k$ (Eckart-Young applied to the data matrix).',
                'Centre the data first: `X_c = X - X.mean(axis=0)`. Then `U, s, Vt = np.linalg.svd(X_c, full_matrices=False)`. The principal components are the rows of Vt; scores (projected data) are `X_c @ Vt[:k].T`. Variance explained by each PC is `s**2 / (s**2).sum()`. This is mathematically equivalent to `np.linalg.eigh(X_c.T @ X_c)` but numerically more stable.',
                'The biplot shows data projected onto PC1 and PC2. Overlay the original feature directions as arrows scaled by `s[i]`. Long arrows = high-variance features. The angle between arrows shows correlation — perpendicular arrows = uncorrelated features. This directly visualises the geometry: PCA finds orthogonal directions of maximum spread.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
true_signal = np.outer(np.sin(np.linspace(0,np.pi,20)), np.cos(np.linspace(0,np.pi,20)))
A = true_signal + 0.3 * np.random.randn(20, 20)
U, s, Vt = np.linalg.svd(A, full_matrices=False)

# Scree plot: singular values and cumulative energy
cumulative_energy = np.cumsum(s**2) / (s**2).sum() * 100
k90 = np.searchsorted(cumulative_energy, 90) + 1
print(f"Rank needed for 90% energy: k = {k90}")
print(f"First 5 singular values: {s[:5].round(3)}")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].bar(range(1, len(s)+1), s, color='steelblue', alpha=0.8)
axes[0].set_xlim(0, 15); axes[0].set_xlabel("k"); axes[0].set_ylabel("Singular value")
axes[0].set_title("Singular values (scree plot)", fontsize=11)
axes[0].grid(True, alpha=0.3, axis='y')

axes[1].plot(range(1, len(s)+1), cumulative_energy, 'o-', color='darkorange', lw=2)
axes[1].axhline(90, color='crimson', lw=1.5, linestyle='--', label='90% threshold')
axes[1].axvline(k90, color='crimson', lw=1.5, linestyle='--', label=f'k={k90}')
axes[1].set_xlim(0, 15); axes[1].set_xlabel("k"); axes[1].set_ylabel("Cumulative energy (%)")
axes[1].set_title("Cumulative energy explained", fontsize=11)
axes[1].legend(fontsize=9); axes[1].grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'CNC toolpath compression via low-rank SVD',
              prose: [
                'A smooth 3D CNC toolpath has low-dimensional structure — it lives near a 2D surface. Store the path as a $3 \\times m$ matrix and compute the SVD. The rank-$k$ approximation captures the dominant shape with far fewer numbers. Measure how much of the path geometry (Frobenius energy) the rank-2 approximation preserves.',
                '`U, s, Vt = np.linalg.svd(path, full_matrices=False)`. Rank-2 approximation: `path_2 = U[:, :2] @ np.diag(s[:2]) @ Vt[:2, :]`. Compression ratio: `2*(3+m+1)/(3*m)`. The Frobenius error is `np.linalg.norm(path - path_2, "fro")` — if the path is truly nearly 2D, this will be tiny even at rank 2.',
                'Plot the original 3D path and the rank-2 approximation overlaid in 3D with `ax.plot3D`. If the path is a helix or spiral in a tilted plane, the rank-2 approximation captures the plane but misses the third dimension. The error quantifies how "out-of-plane" the actual path is — useful for detecting whether a nominally-flat toolpath has unwanted Z-axis variation.',
              ],
              code: `import numpy as np

# Helical CNC toolpath: x=cos(t), y=sin(t), z=t/(2pi)
m = 300
t = np.linspace(0, 4*np.pi, m)
path = np.array([np.cos(t), np.sin(t), t / (4*np.pi)])   # 3 × m

U, S, Vt = np.linalg.svd(path)
print(f"Path shape: {path.shape}")
print(f"Singular values: {S.round(4)}")
print(f"Energy distribution: {(S**2/np.sum(S**2)*100).round(1)}%")

for k in [1, 2, 3]:
    path_k = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
    err = np.linalg.norm(path - path_k, 'fro') / np.linalg.norm(path, 'fro')
    original_storage = 3 * m
    compressed_storage = k * (3 + m + 1)
    ratio = original_storage / compressed_storage
    print(f"k={k}: relative error={err:.5f}, compression ratio={ratio:.1f}x")`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Matrix completion and the Netflix problem.** Given a partially observed matrix $M$ (most entries missing), find the lowest-rank matrix consistent with the observations. Under incoherence conditions (the singular vectors are "spread out"), $M$ can be exactly recovered from $O(rn\\log n)$ random entries by nuclear norm minimization — far fewer than the $mn$ total entries. This is the mathematical foundation of collaborative filtering: if user preferences form a low-rank matrix (users cluster into groups, items cluster into genres), then a few ratings suffice to predict all ratings.',
      '**Proof sketch of Eckart-Young.** Suppose $B$ is any rank-$k$ matrix. We want to show $\\|A - B\\|_2 \\geq \\sigma_{k+1}$. Since rank$(B) = k$, there exists a nonzero $\\mathbf{w} \\in N(B) \\cap \\text{span}(\\mathbf{v}_1,\\ldots,\\mathbf{v}_{k+1})$ (a nonzero vector in both the null space of $B$ and the span of the first $k+1$ right singular vectors — this intersection is nonempty by dimension counting). Then $\\|A - B\\|_2 \\geq \\|(A-B)\\mathbf{w}/\\|\\mathbf{w}\\|\\|_2 = \\|A\\mathbf{w}/\\|\\mathbf{w}\\|\\|_2 \\geq \\sigma_{k+1}$ (since $\\mathbf{w}$ is a linear combination of $\\mathbf{v}_1,\\ldots,\\mathbf{v}_{k+1}$ and $A\\mathbf{v}_i = \\sigma_i\\mathbf{u}_i$, the minimum stretch in this subspace is $\\sigma_{k+1}$).',
      '**Stable rank and numerical rank.** The "numerical rank" of a matrix at tolerance $\\varepsilon$ is the number of singular values exceeding $\\varepsilon \\sigma_1$. The "stable rank" is $\\|A\\|_F^2 / \\|A\\|_2^2 = \\sum \\sigma_i^2 / \\sigma_1^2$, which measures how "spread out" the singular values are. A matrix with stable rank much smaller than its true rank is highly compressible — the top few singular values dominate. Random matrices have stable rank $\\approx \\min(m,n)$ (all singular values similar), while structured data matrices have stable rank $\\ll \\min(m,n)$.',
      '**Relation to PCA and the bias-variance tradeoff.** In PCA, choosing $k$ balances two competing effects. Small $k$: high bias (the model is too simple, misses real structure), but low variance (not sensitive to noise in the training data). Large $k$: low bias (captures all real structure), but high variance (fits noise). The "elbow" in the scree plot (where singular values stop decaying fast) suggests a natural $k$ — above this point, additional components capture mostly noise rather than signal. This is the linear algebra version of the bias-variance tradeoff that governs all of machine learning.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Randomized SVD for Large-Scale Data',
        body: 'For a large $m \\times n$ matrix, computing the full SVD costs $O(mn\\min(m,n))$. The **randomized SVD** (Halko, Martinsson, Tropp 2011) estimates the top $k$ singular vectors in $O(mnk)$ time:\n1. Sample a random matrix $\\Omega \\in \\mathbb{R}^{n\\times (k+p)}$\n2. Compute $Y = A\\Omega$ (sketch)\n3. Orthogonalize: $Q = \\text{orth}(Y)$\n4. $B = Q^\\top A$, then SVD of small $B$\n\nThis gives near-optimal low-rank approximations at a fraction of the cost. Used in sklearn, NumPy, and TensorFlow.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-009-1',
      title: 'Best rank-1 approximation with explicit calculation',
      problem: 'For $A = \\begin{pmatrix}3&2\\\\6&4\\\\1&2\\end{pmatrix}$, find the best rank-1 approximation $A_1$ and compute the approximation error.',
      steps: [
        { explanation: 'Compute $A^\\top A = \\begin{pmatrix}3&6&1\\\\2&4&2\\end{pmatrix}\\begin{pmatrix}3&2\\\\6&4\\\\1&2\\end{pmatrix} = \\begin{pmatrix}46&32\\\\32&24\\end{pmatrix}$.' },
        { explanation: 'Eigenvalues of $A^\\top A$: $\\text{tr}=70$, $\\det=46\\cdot24-32^2=1104-1024=80$. $\\lambda = (70\\pm\\sqrt{70^2-4\\cdot80})/2 = (70\\pm\\sqrt{4580})/2 \\approx (70\\pm67.67)/2$. So $\\lambda_1 \\approx 68.84$, $\\lambda_2 \\approx 1.17$. Singular values: $\\sigma_1\\approx8.30$, $\\sigma_2\\approx1.08$.' },
        { explanation: 'Top right singular vector $v_1$: eigenvector of $A^\\top A$ for $\\lambda_1 \\approx 68.84$. $(A^\\top A - 68.84I)v = 0$: $-22.84v_1+32v_2=0$, so $v_1 \\propto (32, 22.84) \\propto (1, 0.714)$. Normalized: $v_1 \\approx (0.815, 0.579)^\\top$.' },
        { explanation: 'Top left singular vector: $u_1 = Av_1/\\sigma_1 = (3\\cdot0.815+2\\cdot0.579, 6\\cdot0.815+4\\cdot0.579, 0.815+2\\cdot0.579)^\\top / 8.30 \\approx (3.603, 7.206, 1.973)^\\top/8.30 \\approx (0.434, 0.868, 0.238)^\\top$.' },
        { explanation: 'Best rank-1 approximation: $A_1 = \\sigma_1 u_1 v_1^\\top \\approx 8.30 \\cdot (0.434, 0.868, 0.238)^\\top(0.815, 0.579)$. Check: $A$ has rank 2 (columns $(3,6,1)^\\top$ and $(2,4,2)^\\top$ are not proportional). Error: $\\|A-A_1\\|_2 = \\sigma_2 \\approx 1.08$, $\\|A-A_1\\|_F = \\sigma_2 \\approx 1.08$ (only one remaining singular value).' },
      ],
    },
    {
      id: 'ex-la4-009-2',
      title: 'Compression ratio for image approximation',
      problem: 'A $200 \\times 300$ grayscale image (rank $\\approx 200$) is approximated by a rank-20 SVD. (a) How many numbers are stored? (b) What is the compression ratio? (c) If the top 20 singular values capture 95% of the Frobenius energy, what is the relative error?',
      steps: [
        { explanation: 'Original storage: $200 \\times 300 = 60000$ numbers.' },
        { explanation: 'Rank-20 SVD storage: $U_{200\\times 20}$ + $\\Sigma_{20\\times 20}$ (20 values) + $V_{300\\times 20}$. Total: $200\\cdot20 + 20 + 300\\cdot20 = 4000 + 20 + 6000 = 10020$ numbers.' },
        { explanation: 'Compression ratio: $60000 / 10020 \\approx 6:1$ (store 6x fewer numbers).' },
        { explanation: 'Relative error: if top 20 singular values capture 95% of energy, then $\\sum_{i=1}^{20}\\sigma_i^2/\\sum_{i=1}^{200}\\sigma_i^2 = 0.95$. By Eckart-Young: $\\|A-A_{20}\\|_F^2/\\|A\\|_F^2 = 1-0.95 = 0.05$. Relative error $= \\sqrt{0.05} \\approx 22\\%$ — the image looks slightly blurry but recognizable.' },
        { explanation: 'If you want 1% relative error: need $\\sum_{i>k}\\sigma_i^2/\\|A\\|_F^2 \\leq 0.0001$, i.e., capture 99.99% of energy. The required $k$ depends on how fast singular values decay — natural images typically need $k\\approx 50$-$100$ for near-lossless quality.' },
      ],
    },
    {
      id: 'ex-la4-009-3',
      title: 'Soft-thresholded SVD for nuclear norm minimization',
      problem: 'Apply soft-thresholding with $\\lambda = 2$ to $A = \\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$ (already diagonal = SVD). Compute the nuclear-norm-regularized solution and compare to the Eckart-Young rank-1 approximation.',
      steps: [
        { explanation: 'SVD of $A$: already diagonal, $\\sigma_1=3$, $\\sigma_2=1$, $U=V=I$.' },
        { explanation: 'Soft-threshold with $\\lambda=2$: $\\max(\\sigma_i-\\lambda, 0)$. $\\sigma_1-2=1>0$ ✓; $\\sigma_2-1=0$ (wait: $1-2=-1<0$, so $\\max(-1,0)=0$).' },
        { explanation: 'Soft-thresholded approximation: $B = \\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$ (rank 1). Nuclear norm of $B$: $\\|B\\|_* = 1$.' },
        { explanation: 'Compare to Eckart-Young rank-1 (hard threshold): keep $\\sigma_1=3$, set $\\sigma_2=0$. Hard threshold gives $A_1 = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$. Eckart-Young minimizes $\\|A-B\\|_F$ over rank-1 matrices — the answer is $A_1$ with $\\|A-A_1\\|_F=1$. Soft threshold minimizes $\\|A-B\\|_F^2+2\\|B\\|_*$ — a different (convex) objective, giving a shrunken approximation.' },
        { explanation: 'Takeaway: hard threshold (Eckart-Young) gives the best rank-$k$ approximation for a fixed rank budget. Soft threshold (nuclear norm) is the convex relaxation — it automatically chooses the rank based on $\\lambda$, allowing $\\lambda$ to be tuned by cross-validation.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la4-009-1',
      title: 'When does rank-k perfectly reconstruct?',
      difficulty: 'medium',
      problem: 'Prove that $A_k = A$ (the rank-$k$ approximation equals $A$ exactly) if and only if rank$(A) \\leq k$.',
      hint: 'Use the SVD expansion $A = \\sum_{i=1}^r \\sigma_i u_i v_i^\\top$ and the definition $A_k = \\sum_{i=1}^k \\sigma_i u_i v_i^\\top$.',
      walkthrough: [
        {
          expression: 'A = \\sum_{i=1}^r \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top, \\quad A_k = \\sum_{i=1}^{\\min(r,k)} \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top',
          annotation: 'The SVD has exactly $r = \\text{rank}(A)$ nonzero terms. $A_k$ keeps the first $\\min(r,k)$ terms.',
        },
        {
          expression: '(\\Rightarrow) \\text{ If } \\text{rank}(A) \\leq k \\text{ then } r \\leq k \\text{, so } A_k = \\sum_{i=1}^r \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top = A',
          annotation: 'When $r \\leq k$, all $r$ nonzero terms are kept: $A_k$ has all the same terms as $A$ and none extra.',
        },
        {
          expression: '(\\Leftarrow) \\text{ If } A_k = A \\text{, then } A \\text{ is a sum of } k \\text{ rank-1 matrices} \\implies \\text{rank}(A) \\leq k',
          annotation: 'A sum of at most $k$ rank-1 matrices has rank at most $k$.',
        },
      ],
      answer: 'Aₖ = A ↔ rank(A) ≤ k. If rank(A) = r ≤ k, all r nonzero SVD terms are retained. Conversely, if Aₖ = A, A has rank ≤ k.',
    },
    {
      id: 'ch-la4-009-2',
      title: 'Compute rank-1 and rank-2 approximations with errors',
      difficulty: 'easy',
      problem: 'For $A = \\begin{pmatrix}4&0&0\\\\0&2&0\\\\0&0&1\\end{pmatrix}$: (a) write $A_1$ and $A_2$; (b) compute $\\|A-A_1\\|_2$, $\\|A-A_1\\|_F$, $\\|A-A_2\\|_2$, $\\|A-A_2\\|_F$; (c) what percentage of Frobenius energy does rank-2 capture?',
      hint: '$A$ is already diagonal — the SVD is trivial: $\\sigma_1=4, \\sigma_2=2, \\sigma_3=1$, singular vectors = standard basis.',
      walkthrough: [
        {
          expression: 'A_1 = \\begin{pmatrix}4&0&0\\\\0&0&0\\\\0&0&0\\end{pmatrix}, \\quad A_2 = \\begin{pmatrix}4&0&0\\\\0&2&0\\\\0&0&0\\end{pmatrix}',
          annotation: 'Keep the top 1 (resp. 2) singular values; zero out the rest.',
        },
        {
          expression: '\\|A-A_1\\|_2 = \\sigma_2 = 2, \\quad \\|A-A_1\\|_F = \\sqrt{4+1} = \\sqrt{5}',
          annotation: '2-norm error = next singular value. Frobenius error = √(σ₂²+σ₃²) = √(4+1).',
        },
        {
          expression: '\\|A-A_2\\|_2 = \\sigma_3 = 1, \\quad \\|A-A_2\\|_F = 1',
          annotation: 'Only σ₃=1 is discarded.',
        },
        {
          expression: '\\text{Energy captured by rank-2: } \\frac{16+4}{16+4+1} = \\frac{20}{21} \\approx 95.2\\%',
          annotation: '$\\|A\\|_F^2 = 16+4+1 = 21$. Rank-2 keeps $16+4 = 20$: $20/21 \\approx 95.2\\%$ of total energy.',
        },
      ],
      answer: 'A₁ = diag(4,0,0), A₂ = diag(4,2,0). ‖A−A₁‖₂=2, ‖A−A₁‖_F=√5. ‖A−A₂‖₂=1, ‖A−A₂‖_F=1. Rank-2 captures 95.2% of energy.',
    },
    {
      id: 'ch-la4-009-3',
      title: 'Compression ratio for an image matrix',
      difficulty: 'medium',
      problem: 'A grayscale image is stored as a $512 \\times 512$ matrix. (a) How many numbers does the full matrix store? (b) A rank-20 approximation stores only $U_{512\\times 20}$, $\\Sigma_{20\\times 1}$, and $V_{512\\times 20}$. How many numbers is that? (c) What is the compression ratio? (d) If the singular values are $\\sigma_i = 1000/i$ and you want to capture $\\geq 99\\%$ of the Frobenius energy, what is the minimum $k$?',
      hint: 'Total energy $= \\sum_{i=1}^{512} (1000/i)^2 = 10^6 \\sum_{i=1}^{512} 1/i^2 \\approx 10^6 \\cdot 1.639$. Cumulative energy for rank $k$: $10^6 \\sum_{i=1}^k 1/i^2$.',
      walkthrough: [
        {
          expression: '\\text{Full: } 512 \\times 512 = 262{,}144 \\text{ numbers}',
          annotation: 'The original matrix.',
        },
        {
          expression: '\\text{Rank-20: } 512 \\cdot 20 + 20 + 512 \\cdot 20 = 20480 + 20 + 20480 = 40980 \\text{ numbers}',
          annotation: '$U$ (512×20) + $\\Sigma$ (20 scalars) + $V$ (512×20).',
        },
        {
          expression: '\\text{Compression ratio: } \\frac{262144}{40980} \\approx 6.4\\times',
          annotation: 'The rank-20 approximation requires only ~16% the storage of the original.',
        },
        {
          expression: '\\sum_{i=1}^k \\frac{1}{i^2} \\geq 0.99 \\sum_{i=1}^{512} \\frac{1}{i^2} \\approx 0.99 \\times 1.639',
          annotation: 'Need $\\sum_{i=1}^k 1/i^2 \\geq 1.622$. Since $\\sum_{i=1}^{10} 1/i^2 \\approx 1.5498$, $\\sum_{i=1}^{14} 1/i^2 \\approx 1.609$, $\\sum_{i=1}^{17} 1/i^2 \\approx 1.626 > 1.622$. Minimum $k \\approx 17$.',
        },
      ],
      answer: '(a) 262,144. (b) 40,980. (c) ≈6.4× compression. (d) k≈17 to capture 99% of energy.',
    },
  ],

  mentalModel: [
    'Best rank-$k$: keep top $k$ terms of SVD, discard the rest. Error $= \\sigma_{k+1}$ (in 2-norm).',
    'Eckart-Young: $A_k$ is optimal for BOTH 2-norm and Frobenius simultaneously.',
    'Energy = $\\sum\\sigma_i^2$. Fraction captured by rank-$k$: $\\sum_{i\\leq k}\\sigma_i^2 / \\sum_i \\sigma_i^2$.',
    'Storage: $k(m+n+1)$ vs $mn$ original. Compression ratio $mn/(k(m+n))$.',
    'Soft threshold (nuclear norm) = convex relaxation of rank; hard threshold = exact rank constraint.',
  ],

  checkpoints: [
    { id: 'cp-la4-009-1', label: 'Read the concrete rank-1 approximation example with numbers', type: 'read' },
    { id: 'cp-la4-009-2', label: 'Read the Eckart-Young theorem statement', type: 'read' },
    { id: 'cp-la4-009-3', label: 'Read the compression ratio and energy fraction formulas', type: 'read' },
    { id: 'cp-la4-009-4', label: 'Compute truncated SVD approximations and errors in notebook', type: 'lab' },
    { id: 'cp-la4-009-5', label: 'Analyze the structured image compression experiment', type: 'lab' },
    { id: 'cp-la4-009-6', label: 'Trace the explicit rank-1 approximation calculation', type: 'example' },
    { id: 'cp-la4-009-7', label: 'Trace the image compression ratio and error example', type: 'example' },
    { id: 'cp-la4-009-8', label: 'Prove when rank-k approximation exactly equals A', type: 'challenge' },
  ],

  assessment: 'For $A = \\begin{pmatrix}4&0&0\\\\0&2&0\\\\0&0&0.1\\end{pmatrix}$: (a) compute the rank-1 and rank-2 approximations; (b) compute the approximation errors in both 2-norm and Frobenius norm; (c) what percentage of Frobenius energy does rank-2 capture?',

  quiz: [
    {
      id: 'q-la4-009-1',
      type: 'choice',
      text: 'The Eckart-Young theorem says the best rank-$k$ approximation (in 2-norm) has error equal to:',
      options: ['$\\sigma_k$', '$\\sigma_{k+1}$', '$\\sigma_1 - \\sigma_k$', '$\\sum_{i>k}\\sigma_i$'],
      answer: '$\\sigma_{k+1}$',
      hints: ['Discarding singular values $\\sigma_{k+1},\\ldots,\\sigma_r$ introduces an error equal to the largest discarded one.', 'In 2-norm: error = largest remaining singular value after discarding.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-2',
      type: 'choice',
      text: 'The Frobenius error $\\|A - A_k\\|_F$ equals:',
      options: ['$\\sigma_{k+1}$', '$\\sum_{i>k}\\sigma_i$', '$\\sqrt{\\sum_{i>k}\\sigma_i^2}$', '$\\sigma_r$'],
      answer: '$\\sqrt{\\sum_{i>k}\\sigma_i^2}$',
      hints: ['Frobenius norm squared = sum of squared singular values.', '$\\|A-A_k\\|_F^2 = $ sum of DISCARDED singular values squared.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-3',
      type: 'choice',
      text: 'For $A = \\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$, the best rank-1 approximation $A_1$ is:',
      options: ['$\\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$', '$\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$', '$\\begin{pmatrix}2&0\\\\0&2\\end{pmatrix}$', '$\\begin{pmatrix}0&0\\\\0&1\\end{pmatrix}$'],
      answer: '$\\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$',
      hints: ['SVD: $A$ is already diagonal. Keep top singular value $\\sigma_1=3$.', '$A_1 = 3\\cdot e_1 e_1^\\top = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-4',
      type: 'choice',
      text: 'For a $200\\times 300$ matrix approximated by rank-20, how many numbers are stored (approximately)?',
      options: ['$60000$', '$6000$', '$10000$', '$1000$'],
      answer: '$10000$',
      hints: ['$U$ (200×20) + 20 singular values + $V$ (300×20).', '$4000 + 20 + 6000 = 10020 \\approx 10000$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la4-009-5',
      type: 'choice',
      text: 'If the top 5 singular values of $A$ capture 90% of its Frobenius energy, the relative error $\\|A-A_5\\|_F/\\|A\\|_F$ is:',
      options: ['$0.1$', '$\\sqrt{0.1} \\approx 0.316$', '$0.9$', '$0.01$'],
      answer: '$\\sqrt{0.1} \\approx 0.316$',
      hints: ['Relative squared error = 1 - (fraction captured) = 0.1.', 'Relative error = $\\sqrt{0.1}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-6',
      type: 'choice',
      text: 'The rank-$k$ approximation $A_k = A$ exactly when:',
      options: ['$k \\geq 1$', '$k = $ rank$(A)$', 'rank$(A) \\leq k$', '$\\sigma_{k+1} = \\sigma_k$'],
      answer: 'rank$(A) \\leq k$',
      hints: ['If $A$ has rank $r \\leq k$, all $r$ nonzero singular values are kept.', 'The discarded singular values $\\sigma_{k+1},\\ldots$ are all zero, so the error is zero.'],
      reviewSection: 'challenges',
    },
    {
      id: 'q-la4-009-7',
      type: 'choice',
      text: 'The nuclear norm $\\|A\\|_* = \\sum_i \\sigma_i$ is important because:',
      options: [
        'It equals the rank of $A$',
        'It is the convex relaxation of the rank function',
        'It equals the Frobenius norm squared',
        'It measures the condition number',
      ],
      answer: 'It is the convex relaxation of the rank function',
      hints: ['Rank is non-convex and NP-hard to optimize.', 'The nuclear norm provides a convex surrogate that can be minimized efficiently.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-009-8',
      type: 'choice',
      text: 'In recommendation systems, the "matrix completion" problem works because:',
      options: [
        'User-item rating matrices are usually full rank',
        'The rating matrix is approximately low-rank (users and items cluster)',
        'Missing entries are always zero',
        'The singular values are all equal',
      ],
      answer: 'The rating matrix is approximately low-rank (users and items cluster)',
      hints: ['Users group into types (action fans, rom-com fans...) and items into genres.', 'A few "user types" × "item types" interactions explain most ratings — low rank.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la4-009-9',
      type: 'choice',
      text: 'The Eckart-Young theorem guarantees $A_k$ is best for:',
      options: ['Only the 2-norm', 'Only the Frobenius norm', 'Both 2-norm and Frobenius norm simultaneously', 'The 1-norm'],
      answer: 'Both 2-norm and Frobenius norm simultaneously',
      hints: ['This is what makes the theorem powerful.', 'The same $A_k$ is simultaneously optimal for both the 2-norm and Frobenius norm.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-009-10',
      type: 'choice',
      text: 'Soft-thresholding singular values by $\\lambda$ (setting $\\sigma_i \\to \\max(\\sigma_i-\\lambda,0)$) solves:',
      options: [
        'Minimizing rank$(B)$ subject to $\\|A-B\\|_F \\leq \\epsilon$',
        'Minimizing $\\|A-B\\|_F^2 + \\lambda\\|B\\|_*$ (nuclear norm regularization)',
        'Finding the best rank-$k$ approximation for $k=\\lambda$',
        'Minimizing the condition number of $B$',
      ],
      answer: 'Minimizing $\\|A-B\\|_F^2 + \\lambda\\|B\\|_*$ (nuclear norm regularization)',
      hints: ['Nuclear norm = convex relaxation of rank. Adding $\\lambda\\|B\\|_*$ promotes low rank.', 'Soft thresholding is the proximal operator of the nuclear norm.'],
      reviewSection: 'math',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given a matrix with known singular values, compute the rank-$k$ approximation error in both 2-norm and Frobenius norm; determine the compression ratio; and find the minimum $k$ needed to capture a given fraction of total energy.',
    explainVerbally: 'Explain why the Eckart-Young theorem works: why keeping the top $k$ singular values simultaneously minimizes both norms, and why the error equals $\\sigma_{k+1}$.',
    detectIncorrectApplication: 'Catch the error of thinking rank-$k$ approximation always gives small relative error — if singular values decay slowly, even high-rank approximations may be poor.',
    transferToUnfamiliar: 'Given a new data matrix, identify whether its singular values decay quickly (low-rank structure present) or slowly (no compressible structure), and explain what this means for data compression and model complexity.',
  },

  misconceptions: [
    {
      falseBelief: 'The best rank-$k$ approximation in the Frobenius norm is different from the best in the 2-norm.',
      whyStudentsThinkIt: 'Different norms usually lead to different optima. For vector problems, $\\ell^1$ and $\\ell^2$ minimizers are different. Students expect the same for matrices.',
      correctionExample: 'For $A = \\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$, the best rank-1 in 2-norm: $A_1 = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$, error $= 1$. The best rank-1 in Frobenius: also $A_1 = \\begin{pmatrix}3&0\\\\0&0\\end{pmatrix}$, error $= 1$. Same answer.',
      contrastCase: 'This is unique to the SVD truncation. The Eckart-Young theorem says the SAME $A_k$ minimizes both simultaneously — a remarkable property with no analog in vector optimization.',
    },
    {
      falseBelief: 'You can always recover the original matrix from a low-rank approximation with enough computation.',
      whyStudentsThinkIt: 'Compression seems reversible — like a zip file. Students think "approximation" means the original is still there somewhere.',
      correctionExample: 'The discarded singular values ($\\sigma_{k+1},\\ldots,\\sigma_r$) and their corresponding singular vectors are THROWN AWAY. The information in those components is lost. Even with infinite computation, you cannot recover $A$ from $A_k$ when rank$(A) > k$.',
      contrastCase: 'Lossless compression (like zip/gzip) stores the exact original. SVD truncation is LOSSY — the $\\sigma_{k+1}$ error is unavoidable. The Eckart-Young theorem guarantees you cannot do better than $A_k$ within the rank-$k$ constraint.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A recommender system has a 500,000 user × 100,000 movie rating matrix, but only 1% of entries are observed. How does low-rank structure make this tractable?',
      competingTechniques: 'Try to fill in the matrix by interpolation; Model the matrix as low-rank (say rank 50): 50 "user taste" vectors × 50 "movie profile" vectors',
      whyThisTechniqueWins: 'A rank-50 matrix has only $50\\times(500000+100000) = 30$ million parameters vs $50$ billion entries. The low-rank assumption converts a hopelessly under-determined problem into an over-determined one. Nuclear norm minimization or alternating least squares can recover the rank-50 matrix from the 1% observations under incoherence conditions.',
    },
    {
      situation: 'A high-dimensional dynamical system (e.g., fluid simulation on a $10^6$-node mesh) needs to be simulated over time. The state at each time is a $10^6$-dimensional vector. How does low-rank approximation help?',
      competingTechniques: 'Simulate the full 10⁶-dimensional system at each timestep; Find the top k POD (proper orthogonal decomposition) modes, reduce to k-dimensional system',
      whyThisTechniqueWins: 'If the snapshots matrix (each column = one timestep) has rapidly decaying singular values, the dynamics live in a low-dimensional subspace. Projecting the PDE onto this subspace gives a $k \\times k$ system that is thousands of times cheaper to simulate, with errors bounded by the discarded singular values.',
    },
  ],

  debugging: [
    {
      commonError: 'Confusing the Frobenius error formula: using $\\sigma_{k+1}$ instead of $\\sqrt{\\sum_{i>k}\\sigma_i^2}$.',
      symptom: 'Student reports Frobenius error $= \\sigma_{k+1}$ (the 2-norm error), not the Frobenius error.',
      whyItHappened: 'The 2-norm error equals $\\sigma_{k+1}$ (the largest discarded value). The Frobenius error is larger: all discarded singular values contribute. Students copy the 2-norm formula for both.',
      repairStrategy: 'Remember: 2-norm error = $\\sigma_{k+1}$ (single term). Frobenius error = $\\sqrt{\\sigma_{k+1}^2 + \\sigma_{k+2}^2 + \\cdots + \\sigma_r^2}$ (sum of all discarded, square-rooted). Frobenius error $\\geq$ 2-norm error always.',
    },
    {
      commonError: 'Computing storage for rank-$k$ as $k$ numbers instead of $k(m+n+1)$.',
      symptom: 'Student says "rank-5 approximation stores 5 numbers" — forgetting that each rank-1 term $\\sigma_i u_i v_i^\\top$ requires $m + 1 + n$ numbers.',
      whyItHappened: 'Rank is just a number $k$, and students conflate the rank with the number of parameters needed to specify the approximation.',
      repairStrategy: 'Each rank-1 term needs: $m$ numbers for $u_i$, $1$ for $\\sigma_i$, $n$ for $v_i$. Total for rank-$k$: $k(m+1+n)$ numbers. Compression only helps when $k(m+n+1) < mn$, i.e., $k < mn/(m+n+1) \\approx \\min(m,n)/2$ (roughly).',
    },
  ],

  semantics: {
    core: [
      { symbol: 'A_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top', meaning: 'Rank-k truncated SVD — keep only the top k singular value/vector triples' },
      { symbol: '\\|A - A_k\\|_2 = \\sigma_{k+1}', meaning: 'Eckart-Young: 2-norm error equals the next discarded singular value' },
      { symbol: '\\|A - A_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}', meaning: 'Frobenius error equals RMS of discarded singular values' },
      { symbol: '\\frac{\\sum_{i=1}^k \\sigma_i^2}{\\|A\\|_F^2}', meaning: 'Fraction of total energy captured by rank-k approximation' },
      { symbol: 'k(m + n + 1)', meaning: 'Storage cost of rank-k approximation (U: mk, Σ: k, V: nk numbers)' },
    ],
    rulesOfThumb: [
      'Eckart-Young: Aₖ is the BEST rank-k approximation in BOTH 2-norm and Frobenius simultaneously. No other rank-k matrix is closer.',
      'Compression helps when k(m+n+1) < mn, i.e., k < mn/(m+n) ≈ min(m,n)/2.',
      'Fast singular value decay = high compressibility. Natural images/data: top 5-20% of singular values hold 90%+ of energy.',
      'The "elbow" in the scree plot (singular values vs index) marks where noise starts dominating over signal.',
      'For full SVD: A has rank r, Aₖ = A exactly when k ≥ r.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la4-002-svd',
        label: 'SVD',
        note: 'Low-rank approximation IS the truncated SVD. Every algorithm in this lesson begins with $A = U\\Sigma V^\\top$ — the full SVD — then discards the small singular values.',
      },
      {
        lessonId: 'la4-006',
        label: 'Spectral Theorem',
        note: 'For symmetric matrices, SVD = spectral decomposition. PCA is the spectral decomposition of the covariance matrix, and the Eckart-Young theorem applied to $C = Q\\Lambda Q^\\top$ gives the best low-dimensional projection.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la5-001',
        label: 'Abstract Vector Spaces',
        note: 'The ideas of rank, dimension, and low-rank structure generalize to abstract function spaces. The counterpart of SVD for integral operators is the Hilbert-Schmidt expansion — the functional analogue of the spectral decomposition.',
      },
    ],
  },
};
