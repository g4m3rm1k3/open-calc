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
      '**What PCA does.** Given a data matrix $X$ ($n$ samples × $p$ features, mean-centered), PCA finds an orthonormal basis $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ for a $k$-dimensional subspace that captures as much variance in $X$ as possible. The $i$-th principal component $\\mathbf{v}_i$ is the direction of maximum remaining variance after removing all previous components.',
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
    { id: 'cp-la8-001-1', question: 'How are the principal components related to the SVD of the data matrix?', answer: 'The principal components are the columns of $V$ in $X = U\\Sigma V^\\top$ (right singular vectors).' },
    { id: 'cp-la8-001-2', question: 'What does "explained variance" of a principal component mean?', answer: 'The fraction of total variance captured by that component: $\\lambda_i / \\sum_j \\lambda_j$.' },
    { id: 'cp-la8-001-3', question: 'What theorem justifies that SVD gives the best low-rank approximation?', answer: 'The Eckart-Young theorem: the rank-$k$ truncated SVD minimizes approximation error in any unitarily invariant norm.' },
  ],

  assessment: 'Given a $100 \\times 5$ data matrix, describe how to perform PCA step by step, how to choose the number of components, and how to compute the reconstruction error for a rank-2 approximation.',

  quiz: [
    { id: 'q-la8-001-1', question: 'The principal components of a dataset are:', options: ['The rows of the data matrix', 'The eigenvectors of the covariance matrix', 'The sample means', 'The rows of $U$ in the SVD'], answer: 'The eigenvectors of the covariance matrix' },
    { id: 'q-la8-001-2', question: 'Why must the data be mean-centered before PCA?', options: ['To make eigenvalues positive', 'So variance measures spread around the mean, not origin', 'To make $X^\\top X$ symmetric', 'To ensure $X$ is full rank'], answer: 'So variance measures spread around the mean, not origin' },
    { id: 'q-la8-001-3', question: 'The Eckart-Young theorem says the best rank-$k$ approximation is given by:', options: ['The first $k$ rows of $X$', 'The first $k$ eigenvalues of $C$', 'The truncated SVD $\\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$', 'The $k$ largest entries of $X$'], answer: 'The truncated SVD $\\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$' },
  ],
};
