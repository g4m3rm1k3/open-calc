import pcaCloudUrl from '../diagrams/la-pca-data-cloud.svg?url';
import screePlotUrl from '../diagrams/la-pca-scree-plot.svg?url';

export default {
  id: 'la8-001',
  slug: 'pca-dimensionality-reduction',
  chapter: 'la8',
  order: 1,
  title: 'PCA and Dimensionality Reduction',
  subtitle: 'Principal Component Analysis finds the directions of maximum variance in data. These are the eigenvectors of the covariance matrix — or equivalently, the left singular vectors of the centered data matrix.',
  tags: ['PCA', 'principal components', 'covariance matrix', 'SVD', 'dimensionality reduction', 'variance', 'scatter matrix', 'eigenfaces', 'compression'],
  aliases: 'PCA principal component analysis covariance matrix SVD dimensionality reduction variance scatter eigenfaces compression machine learning',

  hook: {
    question: "Your dataset has 10,000 features per sample but only 1,000 samples. The data matrix is 1000 × 10000. Can you reduce to the 50 most informative directions without losing much information?",
    realWorldContext: "PCA is one of the most widely used techniques in data science. In genomics, gene expression datasets have 20,000+ genes — PCA reveals the dominant biological variation axes. In finance, returns on 500 stocks are reduced to a few 'risk factors' via PCA. In computer vision, eigenfaces (PCA of face images) was the dominant face recognition method for a decade. In climate science, PCA identifies the El Niño pattern, the North Atlantic Oscillation, and other dominant climate modes. In machine learning, PCA preprocessing often improves classification accuracy by removing noise dimensions.",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      '**Where you are in the story.** Chapters 1–7 built the mathematical machinery: vectors, matrices, eigenvalues, SVD, orthogonality, numerical methods. Chapter 8 shows where all of that machinery goes — the real problems it was built to solve. Principal Component Analysis is perhaps the single most-applied technique in quantitative science. It is the eigenvalue problem applied to data. You have been building toward this for several chapters; now you see it in action.',

      '**The problem: too many dimensions.** Your dataset has 500 stock returns measured daily for 10 years — a $2500 \\times 500$ matrix. You could work with all 500 dimensions, but most of the variation in stock prices is driven by a handful of underlying factors: market risk, sector effects, interest rate sensitivity. PCA finds those few directions that explain most of the variance. You reduce 500 dimensions to maybe 10, losing almost no information. The 10 directions it finds are not arbitrary — they are the directions of maximum variance, computed via the eigenvalue decomposition of the covariance matrix.',

      '**Concrete first: three points in 2D.** Data: $(0,0)$, $(2,1)$, $(4,2)$. Step 1 — center: subtract mean $(2,1)$, giving $(-2,-1)$, $(0,0)$, $(2,1)$. Covariance matrix: $C = \\frac{1}{2}X^\\top X = \\begin{bmatrix}4&2\\\\2&1\\end{bmatrix}$. Eigenvalues: trace $= 5$, determinant $= 0$, so $\\lambda_1 = 5$, $\\lambda_2 = 0$. Eigenvector for $\\lambda_1 = 5$: $(2/\\sqrt{5}, 1/\\sqrt{5})^\\top$. The data has zero variance in the perpendicular direction and all variance in the $(2,1)$ direction — PCA found that the three points are perfectly collinear, lying on a single line.',

      '**The geometric idea: find the axis of maximum stretch.** Think of the data as a cloud of points. PCA finds the direction through the cloud that is "longest" (maximum variance), then the perpendicular direction that is "next longest," and so on. These are the principal components. They are orthogonal to each other (the eigenvectors of a symmetric matrix are always orthogonal) and ordered by how much variance they capture.',
      ] },
      { type: 'image', src: pcaCloudUrl,
        alt: 'An elongated cloud of scattered points with two arrows from the centroid: a long PC1 arrow along the main spread and a short PC2 arrow perpendicular to it',
        caption: 'PC1 is the direction of maximum spread; PC2 is whatever spread is left over, perpendicular to PC1.' },
      { type: 'prose', paragraphs: [
      '**Predict before reading on.** If all your data points satisfy exactly $y = 2x$, what is the rank of the covariance matrix? How many principal components are needed to capture 100% of the variance? Write your answer before continuing.',

      '**SVD and PCA are the same computation.** The SVD $X = U\\Sigma V^\\top$ gives the principal components directly: columns of $V$ are the directions (principal axes), $\\sigma_i^2/(n-1)$ are the variances along each axis. The covariance matrix approach ($C = X^\\top X/(n-1) = V\\Lambda V^\\top$) and the SVD approach give exactly the same directions — but SVD is numerically preferred because it does not square the matrix (recall: squaring squares the condition number).',

      '**How many components to keep: the scree plot.** The explained variance ratio of component $i$ is $\\lambda_i/\\sum_j \\lambda_j$ — the fraction of total variance captured by that direction. A "scree plot" shows these fractions in decreasing order. Look for the "elbow" where the curve bends — adding more components after that gives diminishing returns. In practice, keeping enough components to explain 95% of variance is a common threshold.',
      ] },
      { type: 'image', src: screePlotUrl,
        alt: 'A bar chart of explained variance ratio per principal component, decreasing from PC1 to PC6, with an elbow circled around PC3',
        caption: 'The elbow marks where added components stop paying for themselves — keep what is before it.' },
      { type: 'prose', paragraphs: [
      '**Where this is heading.** The next lesson applies eigenvalue ideas to a completely different setting: Markov chains and PageRank. The stationary distribution of a random walk is an eigenvector problem. The tools are the same (eigendecomposition, power method) but the interpretation is completely different. After that, you will see eigenvalues drive coupled ODE systems and 3D computer graphics.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'PCA with NumPy',
        mathBridge: 'Perform PCA from scratch using SVD, compute explained variance, project to 2D, and verify the Eckart-Young approximation.',
        caption: 'sklearn.decomposition.PCA uses the same SVD under the hood — but implementing it yourself makes the linear algebra visible.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'PCA step by step on synthetic data',
              prose: [
                'Perform PCA on a correlated 2D dataset: center, SVD, find principal components, compute explained variance.',
                'Step by step: (1) `X_c = X - X.mean(axis=0)` — center the data. (2) `U, s, Vt = np.linalg.svd(X_c, full_matrices=False)` — SVD of centered data. (3) `components = Vt` — principal components (rows). (4) `scores = X_c @ Vt.T` — projected data. (5) `var_explained = s**2 / (s**2).sum()` — variance fractions.',
                'The scatter plot shows the original data with principal component arrows overlaid. Arrow 1 (PC1) points in the direction of maximum variance; arrow 2 (PC2) is perpendicular. Arrow lengths represent the square root of variance explained. The projection onto PC1 (right subplot) shows the 1D representation that preserves the most information.',
              ],
              code: `import numpy as np

rng = np.random.default_rng(42)

# Correlated 2D data: x1 and x2 are correlated
n = 200
x1 = rng.standard_normal(n)
x2 = 0.8 * x1 + 0.2 * rng.standard_normal(n)
X = np.column_stack([x1, x2])

# Step 1: Mean-center
X_centered = X - X.mean(axis=0)

# Step 2: SVD
U, s, Vt = np.linalg.svd(X_centered, full_matrices=False)

# Principal components and explained variance
total_var = (s**2).sum()
explained = s**2 / total_var

print("Principal directions (rows of Vt):")
print(np.round(Vt, 4))
print()
print("Singular values:", np.round(s, 3))
print("Explained variance:     PC1 = {:.1f}%  PC2 = {:.1f}%".format(
    100*explained[0], 100*explained[1]))
print("Cumulative:             PC1 = {:.1f}%  both = 100%".format(
    100*explained[0]))
`,
            },
            {
              id: 2,
              cellTitle: 'Project to k=1 component and reconstruct',
              prose: [
                'Reduce the 2D data to 1 principal component (the direction of max variance) and reconstruct the approximation.',
                '`k=1; X_reduced = scores[:, :k]` — 1D representation. `X_reconstructed = X_reduced @ Vt[:k, :] + X.mean(axis=0)` — map back to original space. The reconstruction error is `np.linalg.norm(X - X_reconstructed, "fro")`. For data with strong correlation, this is tiny; for uncorrelated data, it is large.',
                'The plot shows original points (blue), projected points on the PC1 line (orange), and reconstruction error lines (red). Each data point is projected orthogonally onto PC1 — the red lines ARE the reconstruction error vectors. The Pythagorean identity: `‖X‖²_F = ‖X_reduced‖²_F + ‖X_error‖²_F` — the variance explained by PC1 is `s[0]²/sum(s²)`, and the reconstruction error captures the rest.',
              ],
              code: `import numpy as np

rng = np.random.default_rng(42)
x1 = rng.standard_normal(200)
x2 = 0.8 * x1 + 0.2 * rng.standard_normal(200)
X = np.column_stack([x1, x2])
X_c = X - X.mean(axis=0)

U, s, Vt = np.linalg.svd(X_c, full_matrices=False)
k = 1

# Project onto first k components
Z = X_c @ Vt[:k].T       # (n, k) scores
X_hat = Z @ Vt[:k]       # (n, p) reconstruction

# Approximation error
error_fro = np.linalg.norm(X_c - X_hat, 'fro')
total_fro = np.linalg.norm(X_c, 'fro')

print(f"Reconstruction error ||X - X_hat||_F = {error_fro:.4f}")
print(f"Total ||X||_F = {total_fro:.4f}")
print(f"Relative error = {error_fro/total_fro:.4f}")
print()
print("Eckart-Young: error should equal sqrt(sigma_2^2):")
print(f"  sigma_2 = {s[1]:.4f}")
print(f"  Match: {abs(s[1] - error_fro) < 1e-10}")
`,
            },
            {
              id: 3,
              cellTitle: 'PCA on iris dataset',
              prose: [
                'Apply PCA to the classic 4-feature iris dataset and reduce to 2 principal components.',
                '`from sklearn.datasets import load_iris; iris = load_iris(); X = iris.data; y = iris.target`. Centre: `X_c = X - X.mean(axis=0)`. SVD: `_, s, Vt = np.linalg.svd(X_c)`. Project to 2D: `X_2d = X_c @ Vt[:2].T`. The scree plot shows `s**2 / (s**2).sum()` per component — typically the first 2 components explain >95% of variance in iris.',
                'The 2D scatter coloured by class (setosa/versicolor/virginica) shows that PCA separates the three species well even though it is unsupervised (knows nothing about the labels). This demonstrates that the principal components capture the biologically meaningful variation. Overlay the loadings (Vt[:2].T) as arrows to show which features drive each PC.',
              ],
              code: `import numpy as np

# Iris dataset (4 features: sepal length, sepal width, petal length, petal width)
# Using first 50 samples from each class (150 total)
rng = np.random.default_rng(0)
# Synthetic iris-like data
means = [[5.0, 3.4, 1.5, 0.2],
         [5.9, 2.8, 4.3, 1.3],
         [6.5, 3.0, 5.6, 2.0]]
X = np.vstack([rng.multivariate_normal(m, 0.3*np.eye(4), 50) for m in means])
y = np.repeat([0, 1, 2], 50)

# PCA
X_c = X - X.mean(axis=0)
U, s, Vt = np.linalg.svd(X_c, full_matrices=False)
Z = X_c @ Vt[:2].T  # project to 2D

explained = s**2 / (s**2).sum()
print("Explained variance per PC:")
for i, e in enumerate(explained):
    print(f"  PC{i+1}: {100*e:.1f}%")
print(f"First 2 PCs capture {100*explained[:2].sum():.1f}% of variance")
print()
print("2D projections (first 5 rows of each class):")
for cls, label in enumerate(["setosa", "versicolor", "virginica"]):
    idx = np.where(y == cls)[0][:3]
    print(f"  {label}:", np.round(Z[idx], 2))
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'PCA via SVD',
        mathBridge: 'Perform PCA on a dataset and examine explained variance.',
        caption: 'Principal components = directions of maximum variance = left singular vectors.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'PCA step by step',
              prose: [
                'Perform PCA on a small 2D dataset and find principal components.',
                'Steps: `Xc = X - mean(X); C = (Xc\'*Xc)/size(Xc,1); [V,D] = eig(C)`. Sort: `[d,idx] = sort(diag(D),\'descend\'); V = V(:,idx)`. PC scores: `scores = Xc*V`. Variance fractions: `var_frac = diag(D(idx,idx))/sum(diag(D))`.',
                'The scatter plot with eigenvectors overlaid confirms: PC1 points along the major axis of the data cloud (max variance direction), PC2 is perpendicular. The eigenvalue ratio `d(1)/sum(d)` tells you what fraction of information you keep with just PC1. For strongly correlated data this is often >90%.',
              ],
              code: `% Generate 2D data with correlation
rng(42)
n = 100
t = linspace(0, 2*pi, n)';
X_raw = [2*cos(t) + 0.5*randn(n,1), cos(t) + sin(t) + 0.5*randn(n,1)]

% Step 1: Mean center
X = X_raw - mean(X_raw)

% Step 2: SVD
[U, S, V] = svd(X, 'econ')

% Step 3: Explained variance
variances = diag(S).^2 / (n-1)
total_var = sum(variances)
explained = variances / total_var
disp('Variance explained by each PC:')
explained
disp('Principal components (columns of V):')
V
`,
            },
            {
              id: 2,
              cellTitle: 'Low-rank approximation',
              prose: [
                'Reconstruct data using only the top-1 principal component.',
                '`k=1; scores_k = Xc * V(:,1:k); X_reconstructed = scores_k * V(:,1:k)\' + mean(X)`. Reconstruction error: `norm(X - X_reconstructed, \'fro\')`. This is the Eckart-Young theorem applied to PCA: the rank-k approximation minimises the Frobenius error among all rank-k approximations.',
                'Plot original data and reconstructed data overlaid. Each reconstructed point lies on the PC1 line — the projection squashes the 2D data onto 1D. The green residual lines show what was lost. The fraction of variance RETAINED is `sum(d(1:k))/sum(d)`. Equivalently, `1 - norm(Xc-Xc*V(:,1:k)*V(:,1:k)\',\'fro\')^2 / norm(Xc,\'fro\')^2`.',
              ],
              code: `% Use data from above (re-create here)
rng(42); n = 100
t = linspace(0, 2*pi, n)';
X = [2*cos(t)+0.5*randn(n,1), cos(t)+sin(t)+0.5*randn(n,1)]
X = X - mean(X)
[U, S, V] = svd(X, 'econ')

% Rank-1 approximation (keep first PC only)
X_1 = S(1,1) * U(:,1) * V(:,1)'

% Reconstruction error
err = norm(X - X_1, 'fro') / norm(X, 'fro')
disp('Relative reconstruction error (rank 1):')
err

% Variance explained by PC1
var_explained = S(1,1)^2 / (S(1,1)^2 + S(2,2)^2)
disp('Variance explained by PC1:')
var_explained
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Perform PCA on a Dataset (5 Steps)',
        body: '1. **Center.** Subtract column means: $X_c = X - \\bar{X}$. PCA measures variance around the mean; without this, PC1 points toward the data centroid, not the spread direction.\n2. **SVD.** Compute $X_c = U\\Sigma V^\\top$ via `np.linalg.svd(X_c, full_matrices=False)`. Columns of $V$ are the principal directions; $\\sigma_i^2/(n-1)$ is the variance along direction $i$.\n3. **Scree plot.** Compute explained ratios $e_i = \\sigma_i^2 / \\sum_j \\sigma_j^2$. Plot $e_i$ vs $i$; find the "elbow" where adding more components gives diminishing returns.\n4. **Choose $k$.** Keep the smallest $k$ satisfying $\\sum_{i=1}^k e_i \\geq 0.95$ (or another threshold). Fewer components = more compression; more = less reconstruction error.\n5. **Project and reconstruct.** Scores: $Z = X_c V_k$ ($n\\times k$). Reconstruction: $\\hat{X}_c = ZV_k^\\top$. Eckart-Young guarantees $\\|X_c - \\hat{X}_c\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$ — the minimum possible for rank-$k$ approximations.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 1 of 4 — Applications of Linear Algebra',
        body: '**Chapter 7 (Numerical Methods):** QR, Cholesky, conditioning, stability, sparse matrices.\n**Chapter 8 (Applications), this chapter:** Where the math meets real problems.\n**This lesson:** PCA — eigenvalue decomposition of data covariance; dimensionality reduction.\n**Next:** Markov chains and PageRank — stationary distributions as eigenvectors.',
      },
      {
        type: 'insight',
        title: 'PCA Recipe',
        body: '1. Mean-center: $X \\leftarrow X - \\bar{X}$\n2. SVD: $X = U\\Sigma V^\\top$ (columns of $V$ are principal components)\n3. Choose $k$ by explained variance: keep $\\sigma_1,\\ldots,\\sigma_k$\n4. Project: $Z = X V_k$ ($n \\times k$ score matrix)\n5. Reconstruct: $\\hat{X} = Z V_k^\\top$ (rank-$k$ approximation)\n\nVariance captured: $\\sum_{i=1}^k \\sigma_i^2 / \\sum_i \\sigma_i^2$',
      },
      {
        type: 'insight',
        title: 'Eckart-Young: SVD gives the best approximation',
        body: 'The rank-$k$ approximation $X_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$ is the best rank-$k$ approximation of $X$ in both the 2-norm and Frobenius norm.\n\nError: $\\|X - X_k\\|_F = \\sqrt{\\sigma_{k+1}^2 + \\cdots + \\sigma_r^2}$\n\nNo other $k$-dimensional subspace captures more variance.',
      },
    ],
  },

  math: {
    prose: [
      '**PCA = eigendecomposition of covariance.** The $i$-th principal component maximizes $\\text{Var}(\\mathbf{v}^\\top \\mathbf{x}) = \\mathbf{v}^\\top C \\mathbf{v}$ subject to $\\|\\mathbf{v}\\| = 1$ and orthogonality to previous components. By the Lagrange multiplier method, the solution is the eigenvector of $C$ with the largest remaining eigenvalue. The maximum variance equals $\\lambda_i$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'PCA Optimality',
        body: 'The first $k$ principal components give the $k$-dimensional subspace minimizing the mean squared reconstruction error:\n$\\min_{\\text{rank-}k \\text{ proj}} \\mathbb{E}\\|\\mathbf{x} - P\\mathbf{x}\\|^2 = \\sum_{i > k} \\lambda_i$\n\nEquivalently: they maximize total projected variance $\\sum_{i=1}^k \\lambda_i$.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Kernel PCA.** When data is not linearly separable in the original space, **kernel PCA** maps data to a high-dimensional feature space via a kernel function $k(\\mathbf{x}, \\mathbf{y})$ and performs PCA there — without ever explicitly computing the feature vectors. The kernel matrix $K_{ij} = k(\\mathbf{x}_i, \\mathbf{x}_j)$ is diagonalized. Common kernels: Gaussian (RBF), polynomial.',
      '**Randomized SVD for large-scale PCA.** When the data matrix is too large for full SVD ($n$ or $p$ in the millions), randomized SVD computes an approximate rank-$k$ factorization in $O(np\\log k)$ time instead of $O(np\\min(n,p))$. Algorithm: sample a random projection $Y = A\\Omega$ ($\\Omega$ is $p\\times(k+s)$ Gaussian with $s\\approx10$ oversampling), compute QR of $Y$ to get orthonormal $Q$, project $B = Q^\\top A$, then SVD of $B$. The error is near-optimal: $\\|A - Q Q^\\top A\\|_F \\leq (1+\\varepsilon)\\|A-A_k\\|_F$ with high probability. `sklearn.decomposition.TruncatedSVD` and `sklearn.utils.extmath.randomized_svd` implement this. For a $10^6 \\times 10^4$ matrix with $k=50$: full SVD costs $\\sim10^{14}$ flops; randomized SVD costs $\\sim5\\times10^{10}$ — a 2000× speedup.',
      '**PCA, whitening, and factor models.** In factor analysis, $\\mathbf{x}_i = \\Lambda \\mathbf{f}_i + \\boldsymbol{\\varepsilon}_i$ where $\\mathbf{f}_i$ are $k$ latent factors and $\\Lambda$ is the loading matrix. PCA estimates $\\Lambda$ as the top-$k$ eigenvectors of the covariance, and the scores $Z = XV_k$ are estimates of the factors (up to rotation). Whitening transforms $Y = \\Sigma^{-1/2}X$ so that each direction has unit variance and directions are decorrelated: $\\text{Cov}(Y) = I$. PCA-whitening — project to $k$ PCs, then divide each score by its standard deviation — is standard preprocessing for ICA (Independent Component Analysis) and many deep learning pipelines, because whitened data makes subsequent optimization isotropic.',
      '**Eckart-Young theorem and matrix compression.** The Frobenius-norm reconstruction error of rank-$k$ PCA is $\\|X_c - \\hat{X}_c\\|_F^2 = \\sigma_{k+1}^2 + \\cdots + \\sigma_r^2$ — the sum of squared discarded singular values. No rank-$k$ matrix achieves a smaller Frobenius error (Eckart-Young, 1936). A practical consequence for image compression: a $m\\times m$ grayscale image can be stored as a rank-$k$ SVD using $k(m+m) = 2km$ numbers instead of $m^2$. Storage breakeven at $k = m/2$ — but for natural images, $k \\ll m/2$ suffices for visually acceptable quality. For a $256\\times256$ image, $k=20$ uses $20\\times512 = 10240$ values (16% of original) and captures most visual structure.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'PCA vs Other Dimension Reduction',
        body: 'PCA: linear, globally optimal under Frobenius norm, fast ($O(\\min(n,p)^2 \\max(n,p))$).\nt-SNE: non-linear, preserves local structure, slow ($O(n^2)$ or $O(n \\log n)$ with BH).\nUMAP: non-linear, fast, preserves both local and global structure, stochastic.\nAutoencoder: non-linear, neural network-based, requires training data.\n\nFor linear structure and interpretability, PCA is unsurpassed.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la8-001-1',
      title: 'Eigenface interpretation',
      problem: 'You have 1000 face images, each 64×64 pixels (4096 features). The top 50 singular values capture 95% of variance. How much storage is needed for the compressed representation vs original?',
      solution: 'Original: $1000 \\times 4096 = 4.1 \\times 10^6$ values. Compressed: $1000 \\times 50$ (scores) + $50 \\times 4096$ (components) + $4096$ (mean) $\\approx 2.6 \\times 10^5$ values — a 16× compression at 95% quality.',
    },
    {
      id: 'ex-la8-001-2',
      title: 'Finding PC1 by hand',
      problem: 'Given mean-centered data $X = \\begin{bmatrix}1&1\\\\-1&-1\\\\0&0\\end{bmatrix}$, compute the $2\\times2$ covariance matrix and find the first principal component.',
      solution: '$C = \\frac{1}{2}X^\\top X = \\frac{1}{2}\\begin{bmatrix}2&2\\\\2&2\\end{bmatrix} = \\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$. This is rank 1. Eigenvalues: $\\lambda_1 = 2$, $\\lambda_2 = 0$. Eigenvector for $\\lambda_1 = 2$: $\\mathbf{v}_1 = (1/\\sqrt{2}, 1/\\sqrt{2})$. PC1 is the $(1,1)$ direction — as expected since both columns are identical.',
    },
    {
      id: 'ex-la8-001-3',
      title: 'Scree plot and component selection',
      problem: 'A dataset has eigenvalues $\\lambda = [8, 3, 0.5, 0.3, 0.2]$. How many components explain at least 90% of variance? Compute the cumulative explained variance.',
      solution: 'Total variance $= 8+3+0.5+0.3+0.2 = 12$. Cumulative ratios: $8/12 \\approx 66.7\\%$; $(8+3)/12 \\approx 91.7\\%$; adding more approaches 100%. Two components explain $\\approx 91.7\\% \\geq 90\\%$. The scree "elbow" is after component 2, confirming the choice $k=2$.',
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la8-001-pca-steps',
      title: 'PCA Step by Step: From Data to Principal Components',
      prereqs: ['Covariance matrix', 'Eigenvalues', 'SVD'],
      problem: 'Given centered data matrix $X = \\begin{bmatrix}1&2\\\\3&1\\\\-2&-1\\\\-2&-2\\end{bmatrix}$ (4 samples, 2 features), find the first principal component.',
      steps: [
        {
          label: 'Verify the data is centered (mean = 0)',
          strategy: 'PCA requires zero-mean data. Check column means.',
          explanation: 'Column 1 mean: $(1+3-2-2)/4=0$ ✓. Column 2 mean: $(2+1-1-2)/4=0$ ✓. Already centered.',
          math: '\\bar{x}_1=0,\\quad \\bar{x}_2=0 \\checkmark',
        },
        {
          label: 'Compute the sample covariance matrix $C = X^\\top X/(n-1)$',
          strategy: '$X^\\top X$ sums the outer products of all data points. Dividing by $n-1$ gives unbiased covariance.',
          explanation: '$X^\\top X = \\begin{bmatrix}1^2+3^2+(-2)^2+(-2)^2&1\\cdot2+3\\cdot1+(-2)(-1)+(-2)(-2)\\\\\\cdots&4+1+1+4\\end{bmatrix} = \\begin{bmatrix}18&9\\\\9&10\\end{bmatrix}$. $C = X^\\top X/3 = \\begin{bmatrix}6&3\\\\3&10/3\\end{bmatrix}$.',
          math: 'C = \\frac{X^\\top X}{n-1} = \\frac{1}{3}\\begin{bmatrix}18&9\\\\9&10\\end{bmatrix}',
        },
        {
          label: 'Find the largest eigenvalue and eigenvector of $C$',
          strategy: 'The first principal component is the eigenvector of $C$ with the largest eigenvalue.',
          explanation: '$C$ has eigenvalues $\\lambda_1 \\approx 7.3$ and $\\lambda_2 \\approx 1.7$. The corresponding eigenvector $\\mathbf{v}_1 \\approx [0.89,0.45]^\\top$ is the first principal component direction.',
          math: '\\text{PC1} \\approx \\begin{bmatrix}0.89\\\\0.45\\end{bmatrix},\\quad \\lambda_1\\approx 7.3',
        },
        {
          label: 'Project data onto PC1',
          strategy: 'The 1D representation of the data is $\\mathbf{z} = X\\mathbf{v}_1$ — each sample\'s coordinate along PC1.',
          explanation: '$\\mathbf{z} = X\\mathbf{v}_1$ gives a 4×1 vector of scores. Variance explained: $\\lambda_1/(\\lambda_1+\\lambda_2) = 7.3/9 \\approx 81\\%$ — one component captures 81% of the variance.',
          math: '\\text{variance explained} = \\frac{\\lambda_1}{\\lambda_1+\\lambda_2} \\approx 81\\%',
          gotcha: 'PCA finds the directions of maximum VARIANCE, not the directions most relevant to any outcome. High variance does not mean high predictive power. For supervised tasks, use supervised dimensionality reduction (LDA, etc.).',
        },
      ],
    },
    {
      id: 'wt-la8-001-choose-k',
      title: 'Choosing the Number of Components: Variance Threshold and Scree Plot',
      prereqs: ['PCA', 'Cumulative sum'],
      problem: 'A dataset has singular values $\\sigma = [10, 6, 3, 1, 0.5]$. How many components are needed to explain at least 90% of variance?',
      steps: [
        {
          label: 'Convert singular values to variance (eigenvalues of covariance)',
          strategy: '$\\lambda_i = \\sigma_i^2 / (n-1)$. For the ratio, only the $\\sigma_i^2$ proportions matter.',
          explanation: '$\\sigma^2 = [100, 36, 9, 1, 0.25]$. Total = 146.25.',
          math: '\\sigma_i^2: 100,\\;36,\\;9,\\;1,\\;0.25 \\quad \\text{total}=146.25',
        },
        {
          label: 'Compute cumulative explained variance',
          strategy: 'Sum $\\sigma_i^2$ left to right and divide by total at each step.',
          explanation: 'After 1: $100/146.25\\approx68.4\\%$. After 2: $136/146.25\\approx93.0\\%$. 2 components exceed the 90% threshold.',
          math: 'k=1:\\;68.4\\%,\\quad k=2:\\;93.0\\% \\geq 90\\% \\Rightarrow k^*=2',
          gotcha: 'The 90% threshold is a heuristic, not a law. In some domains (genomics, images) 95% or 99% is standard. In others (exploratory analysis), even 60% may be acceptable. Always state your threshold explicitly.',
        },
        {
          label: 'Scree plot interpretation',
          strategy: 'Look for the "elbow" where the curve bends sharply — the point where additional components add little variance.',
          explanation: 'After component 2, the curve flattens ($9+1+0.25$ remaining vs $136$ already captured). The elbow at $k=2$ confirms the variance threshold choice.',
          math: '\\text{elbow at }k=2 \\Rightarrow \\text{2 components}',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la8-001-1',
      title: 'Covariance vs SVD equivalence',
      difficulty: 'medium',
      problem: 'Show that the eigenvectors of $C = X^\\top X/(n-1)$ (covariance matrix) equal the right singular vectors of $X$ (columns of $V$ in $X = U\\Sigma V^\\top$).',
      walkthrough: [
        { expression: 'C = \\frac{X^\\top X}{n-1} = \\frac{(U\\Sigma V^\\top)^\\top (U\\Sigma V^\\top)}{n-1}', annotation: 'Substitute X = UΣV^T into the covariance formula.' },
        { expression: '= \\frac{V\\Sigma U^\\top U\\Sigma V^\\top}{n-1} = \\frac{V\\Sigma^2 V^\\top}{n-1}', annotation: 'Use U^T U = I (U is orthogonal). The result is V times a diagonal matrix times V^T.' },
        { expression: 'C\\mathbf{v}_i = \\frac{\\sigma_i^2}{n-1}\\mathbf{v}_i \\quad \\Rightarrow \\quad \\lambda_i = \\frac{\\sigma_i^2}{n-1}', annotation: 'The expression V(Σ²/(n-1))V^T is already the eigendecomposition of C. Columns of V are the eigenvectors (= principal directions) and eigenvalues are σ²/(n-1).' },
        { expression: '\\text{Numerical implication: SVD of } X \\text{ gives } C\\text{\'s eigenvectors without forming } C = X^\\top X', annotation: 'Forming C squares the condition number: κ(C) = κ(X)². Computing SVD of X directly avoids this and is numerically preferred for ill-conditioned data.' },
      ],
    },
    {
      id: 'ch-la8-001-2',
      title: 'PCA of perfectly correlated data',
      difficulty: 'easy',
      problem: 'Data (already centered): $X_c = \\begin{bmatrix}-2&-2\\\\0&0\\\\2&2\\end{bmatrix}$. Compute $C = X_c^\\top X_c/2$, find eigenvalues and eigenvectors, and state how many PCs capture 100% of variance.',
      walkthrough: [
        { expression: 'X_c^\\top X_c = \\begin{bmatrix}-2&0&2\\\\-2&0&2\\end{bmatrix}\\begin{bmatrix}-2&-2\\\\0&0\\\\2&2\\end{bmatrix} = \\begin{bmatrix}8&8\\\\8&8\\end{bmatrix}', annotation: 'Each entry: (−2)(−2)+(0)(0)+(2)(2)=8. Both columns of X_c are identical, so X_c^T X_c has equal rows and columns.' },
        { expression: 'C = \\frac{1}{2}\\begin{bmatrix}8&8\\\\8&8\\end{bmatrix} = \\begin{bmatrix}4&4\\\\4&4\\end{bmatrix}', annotation: 'Divide by n-1 = 2. C is rank 1 — signaling that the two features are perfectly correlated.' },
        { expression: '\\det(C-\\lambda I) = \\lambda^2 - 8\\lambda = \\lambda(\\lambda-8) = 0 \\Rightarrow \\lambda_1=8,\\; \\lambda_2=0', annotation: 'Trace = 8 (sum of eigenvalues ✓). The zero eigenvalue confirms rank 1.' },
        { expression: '\\mathbf{v}_1 = \\tfrac{1}{\\sqrt{2}}(1,1)^\\top \\;(\\text{from }(C-8I)\\mathbf{v}=0), \\quad \\mathbf{v}_2 = \\tfrac{1}{\\sqrt{2}}(1,-1)^\\top', annotation: 'PC1 is the diagonal direction — the data lies on the line y=x. PC2 has zero variance: the data has no spread perpendicular to y=x.' },
        { expression: 'R_1 = \\lambda_1/(\\lambda_1+\\lambda_2) = 8/8 = 100\\%', annotation: 'One PC captures 100% of variance. The rank-1 data is effectively 1-dimensional, lying on a line.' },
      ],
    },
    {
      id: 'ch-la8-001-3',
      title: 'Rank-1 approximation and Eckart-Young error',
      difficulty: 'hard',
      problem: 'Let $X = \\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$. Compute the SVD, find the rank-1 approximation $X_1$, and verify the Eckart-Young error formula $\\|X - X_1\\|_F = \\sigma_2$.',
      walkthrough: [
        { expression: 'X^\\top X = \\begin{pmatrix}5&4\\\\4&5\\end{pmatrix}, \\quad \\text{eigenvalues: } \\lambda=9,1 \\Rightarrow \\sigma_1=3,\\;\\sigma_2=1', annotation: 'Compute eigenvalues of X^T X: det(X^T X - λI) = (5-λ)²-16 = λ²-10λ+9 = (λ-9)(λ-1).' },
        { expression: 'V = \\begin{pmatrix}1/\\sqrt{2}&1/\\sqrt{2}\\\\1/\\sqrt{2}&-1/\\sqrt{2}\\end{pmatrix}, \\quad U = \\tfrac{1}{\\sqrt{2}}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}', annotation: 'v_1 = (1,1)^T/√2 (from (X^T X - 9I)v=0), v_2 = (1,-1)^T/√2. Then u_i = X v_i / σ_i: u_1 = X(1,1)^T/(3√2) = (1,1)^T/√2, u_2 = X(1,-1)^T/(√2) = (1,-1)^T/√2.' },
        { expression: 'X_1 = \\sigma_1 \\mathbf{u}_1 \\mathbf{v}_1^\\top = 3 \\cdot \\tfrac{1}{\\sqrt{2}}\\begin{pmatrix}1\\\\1\\end{pmatrix}\\cdot\\tfrac{1}{\\sqrt{2}}(1,1) = \\tfrac{3}{2}\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}', annotation: 'Rank-1 approximation: outer product of first left and right singular vectors, scaled by σ_1.' },
        { expression: 'X - X_1 = \\begin{pmatrix}2&1\\\\1&2\\end{pmatrix} - \\begin{pmatrix}3/2&3/2\\\\3/2&3/2\\end{pmatrix} = \\begin{pmatrix}1/2&-1/2\\\\-1/2&1/2\\end{pmatrix}', annotation: 'The error matrix is the rank-1 outer product σ_2 u_2 v_2^T.' },
        { expression: '\\|X-X_1\\|_F = \\sqrt{4\\cdot(1/2)^2} = \\sqrt{1} = 1 = \\sigma_2\\;\\checkmark', annotation: 'Eckart-Young: ||X - X_1||_F = σ_2 = 1. No other rank-1 matrix achieves smaller Frobenius error.' },
      ],
    },
  ],

  mentalModel: [
    'PCA = find directions of max variance = eigenvectors of covariance = right singular vectors of centered data.',
    'Scree plot: eigenvalue (variance) vs component number. Elbow = good cutoff.',
    'Eckart-Young: first $k$ singular values give the best rank-$k$ approximation (min Frobenius error).',
    'Compression: project to $k$-dim subspace, reconstruct. Trade-off: $k$ vs accuracy.',
  ],

  checkpoints: [
    { id: 'cp-la8-001-1', label: 'Read intuition section', type: 'read' },
    { id: 'cp-la8-001-2', label: 'Read math section', type: 'read' },
    { id: 'cp-la8-001-3', label: 'Read rigor section', type: 'read' },
    { id: 'cp-la8-001-4', label: 'Run first lab', type: 'lab' },
    { id: 'cp-la8-001-5', label: 'Run second lab', type: 'lab' },
    { id: 'cp-la8-001-6', label: 'Work example 1', type: 'example' },
    { id: 'cp-la8-001-7', label: 'Work example 2', type: 'example' },
    { id: 'cp-la8-001-8', label: 'Solve challenge', type: 'challenge' },
  ],

  assessment: 'Given a $100 \\times 5$ data matrix, describe how to perform PCA step by step, how to choose the number of components, and how to compute the reconstruction error for a rank-2 approximation.',

  quiz: [
    { id: 'q-la8-001-1', type: 'choice', question: 'The principal components of a dataset are:', options: ['The rows of the data matrix', 'The eigenvectors of the covariance matrix', 'The sample means', 'The rows of $U$ in the SVD'], answer: 'The eigenvectors of the covariance matrix', hints: ['Think about which matrix captures variance structure.', 'The covariance matrix $C = X^\\top X/(n-1)$ is the key.'], reviewSection: 'intuition' },
    { id: 'q-la8-001-2', type: 'choice', question: 'Why must the data be mean-centered before PCA?', options: ['To make eigenvalues positive', 'So variance measures spread around the mean, not origin', 'To make $X^\\top X$ symmetric', 'To ensure $X$ is full rank'], answer: 'So variance measures spread around the mean, not origin', hints: ['Variance is defined relative to the mean.', 'Without centering, PC1 would point toward the mean, not the spread direction.'], reviewSection: 'intuition' },
    { id: 'q-la8-001-3', type: 'choice', question: 'The Eckart-Young theorem says the best rank-$k$ approximation is given by:', options: ['The first $k$ rows of $X$', 'The first $k$ eigenvalues of $C$', 'The truncated SVD $\\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$', 'The $k$ largest entries of $X$'], answer: 'The truncated SVD $\\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$', hints: ['Best approximation means minimizing Frobenius error.', 'The SVD provides the optimal low-rank factorization.'], reviewSection: 'math' },
    { id: 'q-la8-001-4', type: 'choice', question: 'If the covariance matrix $C$ has eigenvalues $[10, 4, 1]$, what fraction of variance does the first PC explain?', options: ['$1/3$', '$10/15$', '$10/14$', '$4/15$'], answer: '$10/15$', hints: ['Explained variance = eigenvalue / sum of all eigenvalues.', 'Total = $10+4+1 = 15$.'], reviewSection: 'intuition' },
    { id: 'q-la8-001-5', type: 'choice', question: 'In the SVD $X = U\\Sigma V^\\top$, the principal components are:', options: ['Columns of $U$', 'Diagonal entries of $\\Sigma$', 'Columns of $V$', 'Rows of $X$'], answer: 'Columns of $V$', hints: ['The right singular vectors span the PC directions in feature space.', 'Columns of $V$ are the eigenvectors of $X^\\top X$.'], reviewSection: 'intuition' },
    { id: 'q-la8-001-6', type: 'choice', question: 'Kernel PCA differs from standard PCA in that it:', options: ['Uses the covariance matrix instead of kernel matrix', 'Can find nonlinear structure by implicitly mapping to a high-dimensional space', 'Requires fewer data points', 'Only works on image data'], answer: 'Can find nonlinear structure by implicitly mapping to a high-dimensional space', hints: ['The key word is "nonlinear".', 'The kernel trick avoids explicit feature computation.'], reviewSection: 'rigor' },
    { id: 'q-la8-001-7', type: 'choice', question: 'The reconstruction error of a rank-$k$ approximation in the Frobenius norm equals:', options: ['$\\sum_{i=1}^k \\sigma_i^2$', '$\\sqrt{\\sum_{i>k} \\sigma_i^2}$', '$\\sigma_{k+1}$', '$\\|X\\|_F / k$'], answer: '$\\sqrt{\\sum_{i>k} \\sigma_i^2}$', hints: ['Error = norm of the discarded part of $X$.', 'Frobenius norm squares and sums all entries.'], reviewSection: 'math' },
    { id: 'q-la8-001-8', type: 'choice', question: 'A scree plot shows eigenvalues dropping from 9, 8, 1, 0.5, 0.3. The best choice of $k$ using the elbow heuristic is:', options: ['$k=1$', '$k=2$', '$k=4$', '$k=5$'], answer: '$k=2$', hints: ['Look for where the curve bends sharply.', 'After $k=2$ there is a big drop from 8 to 1.'], reviewSection: 'intuition' },
    { id: 'q-la8-001-9', type: 'choice', question: 'Compressing a $1000 \\times 500$ data matrix to rank 10 requires storing:', options: ['$1000 \\times 500$ numbers', '$1000 \\times 10$ scores plus $10 \\times 500$ components', 'Only 10 numbers', '$500 \\times 500$ numbers'], answer: '$1000 \\times 10$ scores plus $10 \\times 500$ components', hints: ['You store the projected scores and the component directions.', 'Count: $U_k$ is $1000 \\times 10$, $V_k^\\top$ is $10 \\times 500$.'], reviewSection: 'intuition' },
    { id: 'q-la8-001-10', type: 'choice', question: 'The covariance matrix $C = X^\\top X/(n-1)$ is always:', options: ['Diagonal', 'Symmetric positive semi-definite', 'Orthogonal', 'Skew-symmetric'], answer: 'Symmetric positive semi-definite', hints: ['$C = C^\\top$ by construction.', 'For any vector $\\mathbf{v}$: $\\mathbf{v}^\\top C \\mathbf{v} = \\|X\\mathbf{v}\\|^2/(n-1) \\geq 0$.'], reviewSection: 'math' },
  ],

  mastery: { targetLevel: 2, solveIndependently: 'Given a small data matrix, compute the covariance matrix, find eigenvalues/eigenvectors, and project data onto the top principal component.', explainVerbally: 'Explain why PCA finds the directions of maximum variance and how the SVD makes this computation efficient.', detectIncorrectApplication: 'Recognize when PCA is inappropriate — e.g., when structure is nonlinear and t-SNE or UMAP would be better.', transferToUnfamiliar: 'Apply PCA to a new domain (e.g., financial time series) by identifying the data matrix, centering, and interpreting principal components as latent factors.' },
  misconceptions: [
    { falseBelief: 'PCA requires the data to be Gaussian.', whyStudentsThinkIt: 'Many derivations assume Gaussian distributions because variance is a natural measure for Gaussians.', correctionExample: 'PCA is purely geometric — it finds directions of max variance regardless of the distribution. Apply it to any numeric data.', contrastCase: 'Compare PCA on uniformly distributed vs Gaussian data on the same ellipse — PC directions are identical.' },
    { falseBelief: 'The first PC is the feature with the largest variance.', whyStudentsThinkIt: 'Students conflate marginal variance of individual features with the variance in a direction combining all features.', correctionExample: 'In 2D data where $x_1$ has variance 4 and $x_2$ has variance 4 but they are correlated, PC1 is the diagonal direction $(1/\\sqrt{2}, 1/\\sqrt{2})$, not $(1,0)$ or $(0,1)$.', contrastCase: 'Compute PC1 on correlated data and show it differs from the highest-variance feature direction.' },
  ],
  transferPrompts: [
    { situation: 'You have a $50000 \\times 20000$ gene expression matrix and want to visualize samples.', competingTechniques: 'Use all 20000 genes directly; use t-SNE; use PCA then t-SNE.', whyThisTechniqueWins: 'PCA reduces to ~50 components first (removing noise), then t-SNE on the 50-dim scores is fast and captures nonlinear structure. Direct t-SNE on 20000 features is computationally prohibitive.' },
    { situation: 'You want to remove correlated noise from a signal measured by 10 sensors.', competingTechniques: 'Average all sensors; use PCA; use ICA.', whyThisTechniqueWins: 'PCA identifies the dominant signal directions. Discard low-variance PCs (which capture noise) and reconstruct from the top PCs. Simple averaging ignores the variance structure.' },
  ],
  semantics: {
    core: [
      { symbol: 'C = X^\\top X/(n-1)', meaning: 'Sample covariance matrix — eigenvalues are variances along principal directions, eigenvectors are the principal components.' },
      { symbol: 'X = U\\Sigma V^\\top', meaning: 'SVD of centered data: columns of $V$ are principal directions, $\\sigma_i^2/(n-1)$ is the variance along PC $i$.' },
      { symbol: 'Z = X_c V_k', meaning: 'Score matrix — the $n\\times k$ projection of centered data onto the top-$k$ principal components.' },
      { symbol: 'R_k = \\sum_{i=1}^k \\lambda_i / \\sum_i \\lambda_i', meaning: 'Explained variance ratio — fraction of total variance captured by the first $k$ PCs; target 90–95%.' },
      { symbol: 'X_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i\\mathbf{v}_i^\\top', meaning: 'Rank-$k$ approximation (Eckart-Young optimal) — minimizes both Frobenius and spectral norm errors over all rank-$k$ matrices.' },
      { symbol: '\\|X_c - X_k\\|_F = \\sqrt{\\sigma_{k+1}^2+\\cdots+\\sigma_r^2}', meaning: 'Eckart-Young reconstruction error — directly computed from discarded singular values; no rank-$k$ matrix achieves smaller Frobenius error.' },
    ],
    rulesOfThumb: [
      'Always mean-center before PCA — without centering, PC1 aligns with the data centroid direction, not the spread direction.',
      'Use SVD of $X_c$ for PCA, not eigendecomposition of $C = X^\\top X$ — SVD avoids squaring the condition number: $\\kappa(C) = \\kappa(X)^2$.',
      'Choose $k$ where cumulative explained variance $\\geq 90$–$95\\%$; use the scree elbow as a visual check.',
      'When $n \\ll p$ (few samples, many features), eigendecompose the $n\\times n$ Gram matrix $XX^\\top$ instead of the $p\\times p$ covariance — same non-zero eigenvalues, much cheaper.',
      'PCA is linear — for data on a nonlinear manifold (spiral, Swiss roll), use kernel PCA, t-SNE, or UMAP instead.',
    ],
  },

  spiral: {
    recoveryPoints: ['la5-003', 'la5-001'],
    futureLinks: ['la8-002', 'la9-001'],
  },

  debugging: [
    { commonError: 'Forgetting to mean-center the data before PCA.', symptom: 'PC1 points in the direction of the data mean rather than the spread direction; explained variance ratios do not reflect true structure.', whyItHappened: 'The covariance formula assumes centered data. Without centering, $X^\\top X$ measures second moments, not variance.', repairStrategy: 'Always subtract the column means: $X \\leftarrow X - \\mathbf{1}\\bar{\\mathbf{x}}^\\top$ before computing SVD or covariance.' },
    { commonError: 'Using the wrong singular vectors (columns of $U$ instead of $V$) as principal components.', symptom: 'Projected scores have wrong dimension; reconstruction fails.', whyItHappened: 'Confusion between left ($U$, $n \\times n$) and right ($V$, $p \\times p$) singular vectors. PCs live in feature space (dimension $p$), so they come from $V$.', repairStrategy: 'Remember: $Z = XV_k$ (project data onto $V_k$). $U_k$ contains the normalized scores, not the component directions.' },
  ],
};
