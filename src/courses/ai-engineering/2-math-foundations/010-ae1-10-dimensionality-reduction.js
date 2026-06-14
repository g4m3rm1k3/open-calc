export default {
  id: 'ae-p1-10-dimensionality-reduction',
  slug: 'dimensionality-reduction',
  chapter: 'ae-p1',
  order: 9,
  title: 'Dimensionality Reduction & PCA',
  subtitle: 'Find the directions where your data actually varies — discard the rest.',
  tags: ['PCA', 'dimensionality-reduction', 'eigenvalues', 'SVD', 'embeddings', 'variance', 'reconstruction', 'covariance'],

  hook: {
    question: 'Why do GPT embeddings live in 768 or 4096 dimensions when most tasks only need a handful?',
    realWorldContext:
      'A raw image is 784 numbers (28×28 MNIST). But most of those numbers are correlated — adjacent pixels move together. PCA finds the directions of maximum variance: the first few "principal components" capture most of the structure. You can represent an MNIST digit with just 50 numbers and reconstruct it with < 5% error. In NLP, GPT embeddings are 768D but neighboring tokens often differ along just a few axes. In recommendation systems, user preferences often live in a 10-50D subspace despite millions of item dimensions. Understanding PCA means understanding SVD, eigendecomposition, and the geometric structure of high-dimensional data — all of which appear throughout modern AI.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Imagine a cloud of 2D points shaped like a tilted ellipse. The long axis is the direction of maximum variance — the "first principal component." The short axis is the direction of minimum variance — the second component, perpendicular to the first. PCA rotates your coordinate system to align with these axes, then lets you drop the axes with small variance. The data loses minimal information because you kept the directions where it actually varies.',
      'Mathematically: center the data (subtract mean), compute the covariance matrix C = (1/n)XᵀX, find its eigenvalues and eigenvectors. Eigenvectors with large eigenvalues are the principal components. Project data onto the top k eigenvectors for the k-dimensional embedding. The fraction of variance explained by component i is λᵢ / Σλⱼ. Reconstruction error = total variance - captured variance.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Eigenvalues measure variance along each principal component',
        body: 'The covariance matrix C has n eigenvalues. The eigenvector with the largest eigenvalue is the direction of maximum variance in the data. Projecting onto the top k eigenvectors gives the best k-dimensional approximation (in terms of reconstruction error). This is why PCA is equivalent to truncated SVD: X = UΣVᵀ, and the top k columns of V are the principal components.',
      },
      {
        type: 'insight',
        title: 'Choosing k: explained variance and the elbow rule',
        body: 'Plot cumulative explained variance vs k. Look for the "elbow" — the point where adding more components gives diminishing returns. For MNIST: k=50 captures ~85% of variance. For real data with n_informative underlying factors, explained variance levels off after k ≈ n_informative. This tells you the effective dimensionality of your dataset.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'PCA from Scratch',
        mathBridge: 'PCA: center → covariance → eigendecompose → sort → project. X_reduced = (X - μ) @ V_k. X_reconstructed = X_reduced @ V_k.T + μ.',
        caption: 'Implement PCA from scratch using numpy and see how much variance each component captures.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'PCA from scratch: eigendecomposition',
              prose: [
                '## Principal Component Analysis',
                '**Step 1**: Center the data: X̃ = X - mean(X)',
                '**Step 2**: Compute covariance matrix: C = X̃ᵀX̃ / (n-1)',
                '**Step 3**: Eigendecompose: C = QΛQᵀ, where columns of Q are eigenvectors',
                '**Step 4**: Sort by eigenvalue (largest first)',
                '**Step 5**: Project: X_reduced = X̃ @ Q_k (keep top k eigenvectors)',
                '**Step 6**: Reconstruct: X_reconstructed = X_reduced @ Q_kᵀ + mean(X)',
                '```\nReconst. MSE = mean((X - X_reconstructed)²)\nExplained variance ratio_i = λ_i / Σλ_j\n```',
              ],
              code: `import numpy as np

np.random.seed(42)

class PCA:
    def __init__(self, n_components):
        self.n_components = n_components
        self.components = None  # V_k: top k eigenvectors (k x d)
        self.mean = None
        self.eigenvalues = None
        self.explained_variance_ratio_ = None

    def fit(self, X):
        self.mean = X.mean(axis=0)
        X_c = X - self.mean              # center

        # Covariance matrix: (d x d)
        cov = np.cov(X_c, rowvar=False)  # rowvar=False: rows are samples

        # Eigendecomposition
        eigenvalues, eigenvectors = np.linalg.eigh(cov)

        # Sort descending (eigh returns ascending)
        idx = np.argsort(eigenvalues)[::-1]
        eigenvalues = eigenvalues[idx]
        eigenvectors = eigenvectors[:, idx]

        self.components = eigenvectors[:, :self.n_components].T  # (k x d)
        self.eigenvalues = eigenvalues[:self.n_components]
        self.explained_variance_ratio_ = self.eigenvalues / eigenvalues.sum()
        return self

    def transform(self, X):
        return (X - self.mean) @ self.components.T

    def inverse_transform(self, X_reduced):
        return X_reduced @ self.components + self.mean

    def fit_transform(self, X):
        return self.fit(X).transform(X)

# Create synthetic data: 500 samples in 3D, but really 2D (x3 = 0.5*x1 + noise)
n = 500
t = np.random.uniform(0, 2*np.pi, n)
x1 = 3*np.cos(t) + np.random.normal(0, 0.2, n)
x2 = 3*np.sin(t) + np.random.normal(0, 0.2, n)
x3 = 0.5*x1 + np.random.normal(0, 0.1, n)  # mostly redundant
X = np.column_stack([x1, x2, x3])

pca = PCA(n_components=2)
X_2d = pca.fit_transform(X)
X_recon = pca.inverse_transform(X_2d)

print(f"Original shape: {X.shape}  ->  Reduced: {X_2d.shape}")
print(f"Explained variance per component: {pca.explained_variance_ratio_}")
print(f"Total explained: {pca.explained_variance_ratio_.sum():.4f}  ({pca.explained_variance_ratio_.sum()*100:.1f}%)")
mse = np.mean((X - X_recon)**2)
print(f"Reconstruction MSE: {mse:.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Choosing k: explained variance and elbow',
              prose: [
                '## How many components to keep?',
                'Compute the cumulative explained variance as k increases. Common thresholds: 90%, 95%, 99% of variance. The "elbow" in the scree plot (individual eigenvalue vs k) shows where adding more components gives diminishing returns.',
                'For a dataset with n_informative true underlying factors, variance levels off after k = n_informative.',
              ],
              code: `import numpy as np

np.random.seed(42)

# Generate data with known structure: 300 samples, 20 features, only 5 informative
n_samples, n_features, n_informative = 300, 20, 5

base = np.random.randn(n_samples, n_informative)
mixing = np.random.randn(n_informative, n_features)
noise = np.random.randn(n_samples, n_features) * 0.1
X = base @ mixing + noise

# Full PCA to see all eigenvalues
from numpy.linalg import eigh
cov = np.cov((X - X.mean(axis=0)), rowvar=False)
eigenvalues, _ = eigh(cov)
eigenvalues = np.sort(eigenvalues)[::-1]
explained = eigenvalues / eigenvalues.sum()
cumulative = np.cumsum(explained)

print(f"Data: {n_samples} samples × {n_features} features ({n_informative} informative)")
print()
print(f"{'k':>4}  {'eigenvalue':>12}  {'var %':>8}  {'cumulative':>12}")
print("-" * 42)
for k in range(n_features):
    marker = " ← elbow" if k == n_informative else ""
    print(f"{k+1:>4}  {eigenvalues[k]:>12.4f}  {explained[k]*100:>7.2f}%  {cumulative[k]*100:>11.2f}%{marker}")

# Show reconstruction quality vs k
print()
print(f"{'k':>4}  {'var captured':>14}  {'recon MSE':>12}")
print("-" * 34)
for k in [1, 2, 3, 5, 10, 15, 20]:
    cov2 = np.cov((X - X.mean(axis=0)), rowvar=False)
    ev, evec = eigh(cov2)
    idx = np.argsort(ev)[::-1]
    V_k = evec[:, idx[:k]].T
    mean = X.mean(axis=0)
    X_r = (X - mean) @ V_k.T
    X_rec = X_r @ V_k + mean
    mse = np.mean((X - X_rec)**2)
    var = ev[idx[:k]].sum() / ev.sum()
    print(f"{k:>4}  {var*100:>13.2f}%  {mse:>12.4f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'PCA for visualization: projecting to 2D',
              prose: [
                '## Visualizing High-Dimensional Data',
                'Take any high-dimensional dataset, project to 2D with PCA, scatter plot. The structure you see reflects the dominant sources of variation in the data. Similar data points cluster together along the principal components.',
                '## PCA vs t-SNE vs UMAP',
                '- **PCA**: linear, fast, globally consistent, interpretable. Best for preprocessing and feature extraction.',
                '- **t-SNE**: non-linear, preserves local neighborhoods. Good for visualization, not for downstream ML (distances not meaningful).',
                '- **UMAP**: non-linear, preserves both local and some global structure. Faster than t-SNE, better for downstream tasks.',
              ],
              code: `import numpy as np

np.random.seed(42)

# Create three separable clusters in 10D
def make_clusters(n_per=100, n_features=10, centers=None, spread=1.0):
    clusters = []
    for center in centers:
        c = np.array(center + [0]*(n_features - len(center)))
        samples = c + np.random.randn(n_per, n_features) * spread
        clusters.append(samples)
    labels = np.repeat(range(len(centers)), n_per)
    return np.vstack(clusters), labels

X, y = make_clusters(
    n_per=100, n_features=10,
    centers=[[5,0], [0,5], [-5,0]],
    spread=1.5
)

# PCA to 2D
mean = X.mean(axis=0)
X_c = X - mean
cov = np.cov(X_c, rowvar=False)
ev, evec = np.linalg.eigh(cov)
idx = np.argsort(ev)[::-1]
V_2 = evec[:, idx[:2]].T
X_2d = X_c @ V_2.T

# Print 2D projections by cluster
print("PCA 2D projection (showing 5 samples per cluster):")
print(f"{'Sample':>8}  {'PC1':>8}  {'PC2':>8}  {'Cluster'}")
print("-" * 38)
for cls in range(3):
    mask = y == cls
    samples = X_2d[mask][:5]
    for s in samples:
        print(f"{'':>8}  {s[0]:>8.3f}  {s[1]:>8.3f}  Cluster {cls}")
    print()

# Show separation quality
print("Cluster centroids in 2D PCA space:")
for cls in range(3):
    mask = y == cls
    centroid = X_2d[mask].mean(axis=0)
    print(f"  Cluster {cls}: PC1={centroid[0]:.2f},  PC2={centroid[1]:.2f}")

var_2d = ev[idx[:2]].sum() / ev.sum()
print(f"\\n2 components capture {var_2d*100:.1f}% of variance")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'PCA as preprocessing for classification',
              prose: [
                '## PCA + Classifier Pipeline',
                '1. Fit PCA on training data only (never on test data)',
                '2. Transform both train and test with the fitted PCA',
                '3. Train classifier on reduced features',
                '**Benefits**: removes noise (small eigenvalue components), reduces computation, mitigates the curse of dimensionality.',
                '**When it hurts**: if the discriminative signal is in small-variance directions (e.g., a classifier based on a barely-varying feature). PCA does not know about the label.',
              ],
              code: `import numpy as np
from numpy.linalg import eigh

np.random.seed(42)

class SimplePCA:
    def fit_transform(self, X, k):
        self.mean = X.mean(axis=0)
        X_c = X - self.mean
        cov = np.cov(X_c, rowvar=False)
        ev, evec = eigh(cov)
        idx = np.argsort(ev)[::-1]
        self.V = evec[:, idx[:k]].T
        self.var_ratio = ev[idx[:k]].sum() / ev.sum()
        return X_c @ self.V.T

    def transform(self, X):
        return (X - self.mean) @ self.V.T

# Synthetic: 200 samples, 50 features, signal in first 10 dims
n, d, k_true = 200, 50, 10
X = np.random.randn(n, d)
X[:100, :k_true] += 2   # class 0: positive direction
X[100:, :k_true] -= 2   # class 1: negative direction
y = np.array([0]*100 + [1]*100)

def nearest_centroid_accuracy(X_tr, y_tr, X_te, y_te):
    centroids = [X_tr[y_tr==c].mean(axis=0) for c in [0,1]]
    preds = [0 if np.sum((x-centroids[0])**2) < np.sum((x-centroids[1])**2) else 1 for x in X_te]
    return sum(p==t for p,t in zip(preds, y_te)) / len(y_te)

# Split: first 150 train, last 50 test
X_tr, y_tr = X[:150], y[:150]
X_te, y_te = X[150:], y[150:]

print(f"{'k (PCA dims)':>14}  {'var captured':>14}  {'accuracy':>10}")
print("-" * 42)

# No PCA
acc = nearest_centroid_accuracy(X_tr, y_tr, X_te, y_te)
print(f"{'no PCA (50D)':>14}  {'100.0%':>14}  {acc*100:>9.1f}%")

pca = SimplePCA()
for k in [1, 2, 5, 10, 20, 30]:
    X_tr_k = pca.fit_transform(X_tr, k)
    X_te_k = pca.transform(X_te)
    acc_k = nearest_centroid_accuracy(X_tr_k, y_tr, X_te_k, y_te)
    print(f"{k:>14}  {pca.var_ratio*100:>13.1f}%  {acc_k*100:>9.1f}%")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement PCA from scratch',
              difficulty: 'medium',
              prompt: 'Implement a `PCA` class with `fit(X)`, `transform(X)`, and `explained_variance_ratio` property. Use numpy for eigendecomposition. Test on synthetic 3D data where the third dimension is mostly redundant.',
              code: `import numpy as np

np.random.seed(42)

class PCA:
    def __init__(self, n_components):
        self.n_components = n_components
        self.components_ = None   # top k eigenvectors, shape (k, d)
        self.mean_ = None
        self.explained_variance_ratio_ = None

    def fit(self, X):
        """
        Fit PCA on X (n_samples x n_features).
        1. Compute and store mean
        2. Center X
        3. Compute covariance matrix
        4. Eigendecompose, sort descending
        5. Store top k eigenvectors as components_ and variance ratios
        """
        pass
        return self

    def transform(self, X):
        """Project X onto top k principal components."""
        pass

    def fit_transform(self, X):
        return self.fit(X).transform(X)

# Test: 3D data where x3 is nearly redundant
n = 200
t = np.random.uniform(0, 2*np.pi, n)
x1 = 2*np.cos(t) + np.random.normal(0, 0.1, n)
x2 = 2*np.sin(t) + np.random.normal(0, 0.1, n)
x3 = 0.1*np.random.normal(0, 1, n)  # mostly noise
X = np.column_stack([x1, x2, x3])

pca = PCA(n_components=2)
X_2d = pca.fit_transform(X)

print(f"Original: {X.shape}  ->  Reduced: {X_2d.shape}")
print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
total = pca.explained_variance_ratio_.sum()
print(f"Total explained: {total*100:.1f}%  (should be >95%)")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'PCA' not in dir():
    res = "ERROR: PCA class not defined."
else:
    np.random.seed(42)
    # Create data that's really 2D embedded in 3D
    n = 200
    t = np.random.uniform(0, 2*np.pi, n)
    x1 = 2*np.cos(t) + np.random.normal(0, 0.1, n)
    x2 = 2*np.sin(t) + np.random.normal(0, 0.1, n)
    x3 = 0.05*np.random.normal(0, 1, n)
    X = np.column_stack([x1, x2, x3])

    pca = PCA(n_components=2)
    X_2d = pca.fit_transform(X)

    if X_2d.shape != (200, 2):
        res = f"ERROR: transform output should be (200,2), got {X_2d.shape}"
    elif pca.explained_variance_ratio_ is None:
        res = "ERROR: explained_variance_ratio_ is None"
    elif len(pca.explained_variance_ratio_) != 2:
        res = f"ERROR: should have 2 variance ratios, got {len(pca.explained_variance_ratio_)}"
    elif pca.explained_variance_ratio_.sum() < 0.9:
        res = f"ERROR: 2 components should explain >90% of this data, got {pca.explained_variance_ratio_.sum()*100:.1f}%"
    else:
        res = f"SUCCESS: PCA works. Top 2 components explain {pca.explained_variance_ratio_.sum()*100:.1f}% of variance."
res
`,
              hint: 'fit: self.mean_ = X.mean(axis=0). X_c = X - self.mean_. cov = np.cov(X_c, rowvar=False). ev, evec = np.linalg.eigh(cov). idx = np.argsort(ev)[::-1]. self.components_ = evec[:,idx[:k]].T. self.explained_variance_ratio_ = ev[idx[:k]] / ev.sum(). transform: return (X - self.mean_) @ self.components_.T',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Reconstruction error vs number of components',
              difficulty: 'medium',
              prompt: 'Write `reconstruction_error(X, k)` that fits PCA with k components, reconstructs X, and returns the MSE. Then write `find_min_k(X, threshold=0.95)` that returns the smallest k where cumulative explained variance >= threshold. Use numpy.',
              code: `import numpy as np

np.random.seed(42)

def reconstruction_error(X, k):
    """
    Fit PCA with k components, reconstruct X, return MSE.
    """
    pass

def find_min_k(X, threshold=0.95):
    """
    Return the smallest k such that the top k principal components
    explain at least threshold fraction of total variance.
    """
    pass

# Test: data with 5 true informative dimensions in 20D space
n, d, n_info = 300, 20, 5
base = np.random.randn(n, n_info)
mixing = np.random.randn(n_info, d)
X = base @ mixing + np.random.randn(n, d) * 0.1

print(f"Data: {n} samples × {d} features ({n_info} informative)")
print()
print(f"{'k':>4}  {'Recon MSE':>12}")
print("-" * 20)
for k in [1, 2, 3, 5, 8, 10, 15, 20]:
    mse = reconstruction_error(X, k)
    print(f"{k:>4}  {mse:>12.4f}")

print()
for thresh in [0.80, 0.90, 0.95, 0.99]:
    k = find_min_k(X, threshold=thresh)
    print(f"Min k for {thresh*100:.0f}% variance: {k}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'reconstruction_error' not in dir() or 'find_min_k' not in dir():
    res = "ERROR: reconstruction_error or find_min_k not defined."
else:
    np.random.seed(42)
    # Data with clear structure
    n, d = 200, 10
    base = np.random.randn(n, 3)
    mix = np.random.randn(3, d)
    X = base @ mix + np.random.randn(n, d) * 0.05

    mse_k1 = reconstruction_error(X, 1)
    mse_k3 = reconstruction_error(X, 3)
    mse_k10 = reconstruction_error(X, 10)

    if mse_k1 <= mse_k3:
        res = f"ERROR: MSE should decrease as k increases. k=1: {mse_k1:.4f}, k=3: {mse_k3:.4f}"
    elif abs(mse_k10) > 0.01:
        res = f"ERROR: k=d=10 should reconstruct perfectly (MSE≈0), got {mse_k10:.6f}"
    else:
        k_90 = find_min_k(X, 0.90)
        k_99 = find_min_k(X, 0.99)
        if k_90 > k_99:
            res = f"ERROR: k for 90% should be <= k for 99%, got {k_90} > {k_99}"
        elif k_90 > 5:
            res = f"ERROR: 3-informative data should need <= 5 components for 90% variance, got {k_90}"
        else:
            res = f"SUCCESS: MSE decreases with k. k={k_90} for 90% variance, k={k_99} for 99%."
res
`,
              hint: 'reconstruction_error: fit PCA(k) on X, reconstruct, return np.mean((X - X_reconstructed)**2). Full reconstruction at k=d should give MSE near 0. find_min_k: compute all eigenvalues, sort descending, cumulative sum divided by total. Return smallest k where cumsum[k-1] >= threshold.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'PCA finds principal components by solving an eigenvalue problem on which matrix?',
      options: [
        'The Gram matrix XᵀX',
        'The covariance matrix of the centered data',
        'The distance matrix between all pairs of samples',
        'The correlation matrix between all pairs of features',
      ],
      correct: 1,
      explanation: 'PCA solves the eigenvalue problem on the covariance matrix C = X̃ᵀX̃/(n-1), where X̃ = X - mean(X). Eigenvectors of C are the principal components; eigenvalues equal the variance along each component. Note: Gram matrix XᵀX gives eigenvectors proportional to PCA components but in sample space (dual PCA).',
    },
    {
      id: 'q2',
      question: 'You have a 1000D dataset with 10 informative features. What do you expect to see in the explained variance vs k plot?',
      options: [
        'A smooth linear decrease from k=1 to k=1000',
        'A sharp drop in explained variance per component after k ≈ 10',
        'All variance explained by the first component',
        'Equal variance explained by all 1000 components',
      ],
      correct: 1,
      explanation: 'If data is generated from 10 latent factors mixed into 1000 dimensions, the covariance matrix has 10 large eigenvalues (the signal directions) and 990 small eigenvalues (noise). The elbow in the scree plot appears at k ≈ 10 — adding more components after that captures only noise.',
    },
    {
      id: 'q3',
      question: 'You fit PCA on training data and then want to apply it to test data. Which is the correct procedure?',
      options: [
        'Fit PCA on all data (train + test), then split',
        'Fit PCA on training data only, transform both train and test using the fitted PCA',
        'Fit separate PCAs on train and test data',
        'Fit PCA on test data only, since test accuracy is what matters',
      ],
      correct: 1,
      explanation: 'PCA must be fit on training data only to avoid data leakage. The test set represents future unseen data — its statistics should not influence the transformation. Use pca.fit(X_train), then pca.transform(X_train) and pca.transform(X_test).',
    },
    {
      id: 'q4',
      question: 'The reconstruction error of PCA with k components equals:',
      options: [
        'The variance of the first principal component',
        'The sum of the eigenvalues NOT selected (the discarded variance)',
        'The number of dimensions times the average feature variance',
        'Zero — PCA always reconstructs perfectly',
      ],
      correct: 1,
      explanation: 'When you project to k components and reconstruct, the error is exactly the variance in the discarded dimensions: MSE = (Σᵢ₌ₖ₊₁ λᵢ) / d. Keeping components with large eigenvalues minimizes this error.',
    },
    {
      id: 'q5',
      question: 'Why is PCA not sufficient for tasks where the discriminative signal has low variance?',
      options: [
        'PCA selects components with maximum variance, which may not be the components that best separate classes',
        'PCA only works on linearly separable datasets',
        'PCA requires more data points than features',
        'PCA cannot handle datasets with more than 100 features',
      ],
      correct: 0,
      explanation: 'PCA is unsupervised — it finds high-variance directions regardless of labels. A low-variance feature might be the most informative for the task (e.g., a pixel that is always 0 except for a specific digit class). Linear Discriminant Analysis (LDA) explicitly maximizes class separability instead of variance.',
    },
  ],
}
