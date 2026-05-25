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
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**PCA in action — concrete numbers first.** Start with three data points: $(0,0)$, $(2,1)$, $(4,2)$. Mean: $(2,1)$. Centered: $(-2,-1)$, $(0,0)$, $(2,1)$. The centered data matrix is $X = \\begin{bmatrix}-2&-1\\\\0&0\\\\2&1\\end{bmatrix}$. The covariance matrix $C = \\frac{1}{n-1}X^\\top X = \\frac{1}{2}\\begin{bmatrix}8&4\\\\4&2\\end{bmatrix} = \\begin{bmatrix}4&2\\\\2&1\\end{bmatrix}$. Eigenvalues: $\\lambda_1 = 5$, $\\lambda_2 = 0$. Eigenvector for $\\lambda_1 = 5$: $\\mathbf{v}_1 = (2/\\sqrt{5},\\, 1/\\sqrt{5})$. Project first point onto PC1: $(-2,-1)\\cdot(2/\\sqrt{5},1/\\sqrt{5}) = -5/\\sqrt{5} = -\\sqrt{5}$. The entire dataset lies on one line — PCA finds it exactly.',
      '**What PCA does in general.** Given a data matrix $X$ ($n$ samples × $p$ features, mean-centered), PCA finds an orthonormal basis $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ for a $k$-dimensional subspace that captures as much variance in $X$ as possible. The $i$-th principal component $\\mathbf{v}_i$ is the direction of maximum remaining variance after removing all previous components.',
      '**Connection to SVD and covariance.** The $p \\times p$ sample covariance matrix is $C = \\frac{1}{n-1}X^\\top X$. Its eigenvectors are the principal components; its eigenvalues are the variances along each component. Equivalently: compute the SVD $X = U\\Sigma V^\\top$. The columns of $V$ are the principal components; $\\sigma_i^2/(n-1)$ are the variances. The $k$-rank approximation $X_k = U_k \\Sigma_k V_k^\\top$ is the best rank-$k$ approximation to $X$ in the Frobenius norm (Eckart-Young theorem).',
      '**How much to keep.** The "explained variance ratio" of component $i$ is $\\lambda_i / \\sum_j \\lambda_j$ (eigenvalue fraction). Plot the cumulative explained variance vs number of components ("scree plot"). Keep enough components to explain 90-99% of variance, or use the "elbow" heuristic.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'PCA Recipe',
        body: '1. Mean-center each feature: $X \\leftarrow X - \\bar{X}$\n2. Compute SVD: $X = U\\Sigma V^\\top$ (or eigendecompose $C = X^\\top X/(n-1)$)\n3. Choose $k$ by explained variance threshold\n4. Project: $Z = X V_k$ ($n \\times k$ score matrix)\n5. Reconstruct: $\\hat{X} = Z V_k^\\top$ ($n \\times p$, rank-$k$ approximation)\n\nVariance captured by first $k$ components: $\\sum_{i=1}^k \\sigma_i^2 / \\sum_i \\sigma_i^2$',
      },
      {
        type: 'insight',
        title: 'Eckart-Young Theorem',
        body: 'The best rank-$k$ approximation of $X$ (in 2-norm or Frobenius norm) is $X_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$.\n\nApproximation error: $\\|X - X_k\\|_F = \\sqrt{\\sum_{i>k} \\sigma_i^2}$\n\nThis is why SVD-based PCA is optimal — no other rank-$k$ subspace captures more variance.',
      },
      {
        type: 'sequencing',
        title: 'Prediction',
        body: 'If the data is perfectly correlated — every point satisfies $y = x$ — what is the rank of the covariance matrix $C$? What does that imply about the number of nonzero eigenvalues and how many principal components are needed to capture 100% of the variance?',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'PCA via SVD',
        mathBridge: 'Perform PCA on a dataset and examine explained variance.',
        caption: 'Principal components = directions of maximum variance = left singular vectors.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'PCA step by step',
              prose: ['Perform PCA on a small 2D dataset and find principal components.'],
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
              prose: ['Reconstruct data using only the top-1 principal component.'],
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

  challenges: [
    {
      id: 'ch-la8-001-1',
      title: 'Covariance vs SVD equivalence',
      difficulty: 'medium',
      prompt: 'Show that the eigenvectors of $C = X^\\top X/(n-1)$ (covariance matrix) equal the right singular vectors of $X$ (columns of $V$ in $X = U\\Sigma V^\\top$).',
      hint: 'Substitute the SVD into the expression for $C$ and simplify.',
      solution: '$C = X^\\top X/(n-1) = (U\\Sigma V^\\top)^\\top (U\\Sigma V^\\top)/(n-1) = V\\Sigma^2 V^\\top/(n-1)$. This is the eigendecomposition of $C$ — eigenvalues $\\lambda_i = \\sigma_i^2/(n-1)$ and eigenvectors = columns of $V$.',
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
  debugging: [
    { commonError: 'Forgetting to mean-center the data before PCA.', symptom: 'PC1 points in the direction of the data mean rather than the spread direction; explained variance ratios do not reflect true structure.', whyItHappened: 'The covariance formula assumes centered data. Without centering, $X^\\top X$ measures second moments, not variance.', repairStrategy: 'Always subtract the column means: $X \\leftarrow X - \\mathbf{1}\\bar{\\mathbf{x}}^\\top$ before computing SVD or covariance.' },
    { commonError: 'Using the wrong singular vectors (columns of $U$ instead of $V$) as principal components.', symptom: 'Projected scores have wrong dimension; reconstruction fails.', whyItHappened: 'Confusion between left ($U$, $n \\times n$) and right ($V$, $p \\times p$) singular vectors. PCs live in feature space (dimension $p$), so they come from $V$.', repairStrategy: 'Remember: $Z = XV_k$ (project data onto $V_k$). $U_k$ contains the normalized scores, not the component directions.' },
  ],
};
