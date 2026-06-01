const featureSelection = {
  id: 'ae2-18',
  slug: 'feature-selection',
  chapter: 'ae-p2',
  order: 17,
  title: 'Feature Selection',
  subtitle: 'More features is not better. The right features is better.',
  tags: ['feature-selection', 'filter-methods', 'wrapper-methods', 'embedded-methods', 'mutual-information', 'RFE', 'L1-lasso', 'variance-threshold'],
  hook: {
    question: 'You have 500 features. Your model overfits, trains slowly, and nobody can explain it. What do you do?',
    realWorldContext: 'Every real dataset has noise, redundancy, and irrelevant columns. Adding more features past a certain point actively hurts generalization — the curse of dimensionality. Feature selection strips away the noise and keeps the signal.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'Adding features should always help — more information means better predictions. Except it does not. Once you have enough irrelevant features, the model starts memorizing noise. Distances between points converge. The model needs exponentially more data to separate signal from noise. This is the curse of dimensionality.',
      'Three categories of feature selection attack this problem. Filter methods score each feature independently using statistics — no model required. Fast but they miss interactions between features. Wrapper methods train a model and use its performance to evaluate feature subsets. Better results, but expensive. Embedded methods select features during training itself — L1 regularization is the canonical example.',
      'Variance threshold is the simplest filter. Compute var(x) = mean((x − mean(x))²) for each feature. Drop every feature whose variance falls below a threshold (e.g., 0.01). A feature that is 0.0 for 999 out of 1000 samples cannot help any model distinguish classes. This costs almost nothing and catches the obviously useless features first.',
      'Mutual information measures how much knowing X reduces uncertainty about Y: I(X;Y) = Σ p(x,y)·log(p(x,y) / (p(x)·p(y))). If X and Y are independent, p(x,y) = p(x)·p(y) and I = 0. The key advantage over Pearson correlation: MI captures nonlinear relationships. A quadratic feature (y = x²) has zero correlation but high mutual information. For continuous features, discretize into bins first, then compute the joint frequency table.',
      'Recursive Feature Elimination (RFE) is a wrapper method. Train the model on all features. Rank by importance (absolute coefficient for linear models, impurity reduction for trees). Remove the least important feature. Retrain. Repeat until the target count is reached. Each retrain reassesses importances with the remaining features — removing a correlated feature changes the importance of its counterpart. RFE sees interactions; filter methods do not.',
      'L1 (Lasso) regularization adds the absolute weight sum to the loss: loss = prediction_error + α·Σ|w_i|. The geometry of the L1 constraint (a diamond in weight space) forces solutions to corners where some weights are exactly zero. L2 (ridge) uses a sphere — weights shrink but almost never hit zero. This is embedded selection: the model learns which features to ignore during training itself. Higher α prunes more aggressively.',
      'Permutation importance is model-agnostic. Train the model, record baseline performance. For each feature: shuffle its values randomly, measure the drop in performance. If shuffling a feature does not hurt performance, the model does not depend on it. This avoids the cardinality bias of tree-based importance, where a random ID column can appear important because it perfectly splits every sample.',
    ],
    callouts: [
      {
        type: 'info',
        title: 'Which Method to Use',
        body: 'Start with variance threshold — it\'s free. Then: if you have < 50 features, add mutual information. If you\'re using a linear model, add L1. If you\'re using trees, read off tree importance. For the final selection on any model, RFE is most thorough but slowest. Validate by comparing held-out performance with vs without selection.',
      },
      {
        type: 'info',
        title: 'Filter vs Wrapper vs Embedded',
        body: 'Filter: no model, fast, misses interactions (variance threshold, mutual info, correlation). Wrapper: trains model repeatedly, slow, captures interactions (RFE, forward selection). Embedded: selection happens during training, single pass (L1/Lasso, tree importance, elastic net).',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Feature Selection Methods from Scratch',
        mathBridge: 'Mutual information: I(X;Y) = Σ p(x,y)·log(p(x,y)/(p(x)·p(y))). L1 update: w ← soft_threshold(w − lr·grad, lr·α) where soft_threshold(w,λ) = sign(w)·max(|w|−λ, 0). RFE: train → rank |w| → drop lowest → repeat.',
        caption: 'Build variance threshold, mutual information, RFE, and L1 feature selection from scratch on a dataset with known ground-truth feature structure.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Generating Data with Known Structure',
              prose: [
                'Create a dataset with 20 features and known ground truth: 5 informative, 5 correlated copies, 10 pure noise.',
                'The target y depends only on features 0, 1, and 2: y = (2·x1 − 1.5·x2 + x3 > 0).',
                'A good selection method should rank features 0–4 highest and noise features 10–19 lowest.',
              ],
              code: `import numpy as np

def make_feature_selection_data(n_samples=500, seed=42):
    rng = np.random.RandomState(seed)
    x1 = rng.randn(n_samples)
    x2 = rng.randn(n_samples)
    x3 = rng.randn(n_samples)
    # Correlated copies of x1, x2
    x4 = x1 + 0.1 * rng.randn(n_samples)
    x5 = x2 + 0.1 * rng.randn(n_samples)
    informative = np.column_stack([x1, x2, x3, x4, x5])
    correlated = np.column_stack([
        x1 * 0.9 + 0.1 * rng.randn(n_samples),
        x2 * 0.8 + 0.2 * rng.randn(n_samples),
        x3 * 0.7 + 0.3 * rng.randn(n_samples),
        x1 * 0.5 + x2 * 0.5 + 0.1 * rng.randn(n_samples),
        x2 * 0.6 + x3 * 0.4 + 0.1 * rng.randn(n_samples),
    ])
    noise = rng.randn(n_samples, 10) * 0.5
    X = np.hstack([informative, correlated, noise])
    y = (2*x1 - 1.5*x2 + x3 + 0.5*rng.randn(n_samples) > 0).astype(int)
    return X, y

X, y = make_feature_selection_data(500, seed=42)
print(f"Dataset shape: {X.shape}")
print(f"Features 0-4:  informative (true signal)")
print(f"Features 5-9:  correlated with informative features")
print(f"Features 10-19: pure noise")
print(f"\\nClass balance: {np.mean(y):.1%} positive")`,
            },
            {
              id: 2,
              cellTitle: 'Filter Methods: Variance Threshold and Mutual Information',
              prose: [
                'Variance threshold removes near-constant features: drop if var(x) < threshold. It runs in a single pass and requires no target variable.',
                'Mutual information discretizes each feature into bins, builds the joint frequency table, and computes I(X;Y) = Σ p(x,y)·log(p(x,y)/(p(x)·p(y))).',
                'The MI scores should rank informative features (0–4) above noise (10–19) even though MI does not know the ground truth labels.',
              ],
              code: `def variance_threshold(X, threshold=0.01):
    variances = np.var(X, axis=0)
    return variances > threshold, variances

def discretize(x, n_bins=10):
    min_v, max_v = x.min(), x.max()
    if max_v == min_v:
        return np.zeros_like(x, dtype=int)
    edges = np.linspace(min_v, max_v, n_bins + 1)
    return np.digitize(x, edges[1:-1])

def mutual_information(X, y, n_bins=10):
    n, n_feat = X.shape
    scores = np.zeros(n_feat)
    y_vals, y_counts = np.unique(y, return_counts=True)
    p_y = y_counts / n
    for f in range(n_feat):
        xb = discretize(X[:, f], n_bins)
        x_vals, x_counts = np.unique(xb, return_counts=True)
        p_x = dict(zip(x_vals, x_counts / n))
        mi = 0.0
        for xv in x_vals:
            for yi, yv in enumerate(y_vals):
                p_xy = np.sum((xb == xv) & (y == yv)) / n
                if p_xy > 0:
                    mi += p_xy * np.log(p_xy / (p_x[xv] * p_y[yi]))
        scores[f] = mi
    return scores

X, y = make_feature_selection_data(500, seed=42)

mask_vt, variances = variance_threshold(X, threshold=0.01)
print(f"Variance threshold keeps {mask_vt.sum()} / {X.shape[1]} features")

mi_scores = mutual_information(X, y, n_bins=10)
ranking = np.argsort(mi_scores)[::-1]
print("\\nTop 8 features by mutual information:")
for rank, fi in enumerate(ranking[:8]):
    group = "informative" if fi < 5 else ("correlated" if fi < 10 else "noise")
    print(f"  Rank {rank+1}: feature {fi:2d} ({group}) — MI={mi_scores[fi]:.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'Recursive Feature Elimination (RFE)',
              prose: [
                'RFE trains logistic regression, ranks features by |weight|, removes the least important, then retrains. Iterating until n_features_to_select remain.',
                'Each retrain reassesses importances with the current feature set — removing a correlated feature often elevates its pair.',
                'RFE should select from features 0–4 (the true signal), but it accounts for correlations where simpler filters cannot.',
              ],
              code: `def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))

def fit_logistic(X, y, lr=0.05, epochs=150):
    w = np.zeros(X.shape[1])
    b = 0.0
    for _ in range(epochs):
        pred = sigmoid(X @ w + b)
        err = pred - y
        w -= lr * (X.T @ err) / len(y)
        b -= lr * np.mean(err)
    return w, b

def rfe(X, y, n_select=5):
    remaining = list(range(X.shape[1]))
    rankings = {}
    rank = X.shape[1]
    while len(remaining) > n_select:
        X_sub = X[:, remaining]
        w, _ = fit_logistic(X_sub, y)
        # Remove the feature with smallest absolute weight
        least = int(np.argmin(np.abs(w)))
        rankings[remaining[least]] = rank
        rank -= 1
        remaining.pop(least)
    for fi in remaining:
        rankings[fi] = 1
    return remaining, rankings

X, y = make_feature_selection_data(500, seed=42)
selected, rankings = rfe(X, y, n_select=5)
print("RFE selected features:", selected)
print("\\nRFE ranking (1 = best):")
for fi in sorted(rankings, key=rankings.get):
    group = "informative" if fi < 5 else ("correlated" if fi < 10 else "noise")
    print(f"  Feature {fi:2d} ({group:11s}): rank {rankings[fi]}")`,
            },
            {
              id: 4,
              cellTitle: 'L1 (Lasso) Embedded Feature Selection',
              prose: [
                'L1 adds soft-thresholding after each gradient step: w ← sign(w)·max(|w|−λ, 0). This drives small weights to exactly zero during training.',
                'The diamond geometry of the L1 penalty forces solutions to corners of the constraint region, where coordinates are exactly zero. L2 (ridge) uses a sphere — weights shrink but rarely reach zero.',
                'Sweeping alpha shows the regularization path: small alpha keeps most features, large alpha drives all but the strongest to zero.',
              ],
              code: `def soft_threshold(w, lam):
    # sign(w) * max(|w| - lambda, 0) — shrinks toward zero, kills small weights
    return np.sign(w) * np.maximum(np.abs(w) - lam, 0)

def l1_logistic(X, y, alpha=0.1, lr=0.01, epochs=500):
    w = np.zeros(X.shape[1])
    b = 0.0
    for _ in range(epochs):
        pred = sigmoid(X @ w + b)
        err = pred - y
        grad = (X.T @ err) / len(y)
        w -= lr * grad
        # Proximal gradient step: apply L1 penalty
        w = soft_threshold(w, lr * alpha)
        b -= lr * np.mean(err)
    selected = np.abs(w) > 1e-6
    return selected, w

X, y = make_feature_selection_data(500, seed=42)

# Normalize features for L1 to work fairly
X_std = (X - X.mean(axis=0)) / (X.std(axis=0) + 1e-8)

print(f"{'Alpha':>8} {'# Selected':>12}  Feature groups")
for alpha in [0.01, 0.05, 0.1, 0.2]:
    sel, w = l1_logistic(X_std, y, alpha=alpha)
    selected_idx = np.where(sel)[0]
    info_cnt = (selected_idx < 5).sum()
    corr_cnt = ((selected_idx >= 5) & (selected_idx < 10)).sum()
    noise_cnt = (selected_idx >= 10).sum()
    print(f"  {alpha:>6.2f} {sel.sum():>10}   info={info_cnt} corr={corr_cnt} noise={noise_cnt}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: 'Implement permutation importance from scratch. For each feature: shuffle its values, measure the drop in accuracy compared to baseline, restore the feature. Repeat 5 times and average. Then compare: which features does permutation importance rank highest? Does it agree with mutual information? Run both on the synthetic dataset and print a side-by-side comparison.',
              starterCode: `import numpy as np

def make_feature_selection_data(n_samples=500, seed=42):
    rng = np.random.RandomState(seed)
    x1 = rng.randn(n_samples)
    x2 = rng.randn(n_samples)
    x3 = rng.randn(n_samples)
    x4 = x1 + 0.1 * rng.randn(n_samples)
    x5 = x2 + 0.1 * rng.randn(n_samples)
    informative = np.column_stack([x1, x2, x3, x4, x5])
    correlated = np.column_stack([
        x1 * 0.9 + 0.1 * rng.randn(n_samples),
        x2 * 0.8 + 0.2 * rng.randn(n_samples),
        x3 * 0.7 + 0.3 * rng.randn(n_samples),
        x1 * 0.5 + x2 * 0.5 + 0.1 * rng.randn(n_samples),
        x2 * 0.6 + x3 * 0.4 + 0.1 * rng.randn(n_samples),
    ])
    noise = rng.randn(n_samples, 10) * 0.5
    X = np.hstack([informative, correlated, noise])
    y = (2*x1 - 1.5*x2 + x3 + 0.5*rng.randn(n_samples) > 0).astype(int)
    return X, y

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))

def fit_logistic(X, y, lr=0.05, epochs=150):
    w = np.zeros(X.shape[1])
    b = 0.0
    for _ in range(epochs):
        pred = sigmoid(X @ w + b)
        err = pred - y
        w -= lr * (X.T @ err) / len(y)
        b -= lr * np.mean(err)
    return w, b

def permutation_importance(X_val, y_val, w, b, n_repeats=5, seed=42):
    # TODO: compute baseline accuracy, then for each feature shuffle n_repeats times
    # and average the accuracy drop. Return array of importance scores.
    pass

X, y = make_feature_selection_data(500, seed=42)
split = int(0.8 * len(y))
X_train, X_val = X[:split], X[split:]
y_train, y_val = y[:split], y[split:]

w, b = fit_logistic(X_train, y_train)
perm_scores = permutation_importance(X_val, y_val, w, b)

if perm_scores is not None:
    ranking = np.argsort(perm_scores)[::-1]
    print("Top 8 features by permutation importance:")
    for i, fi in enumerate(ranking[:8]):
        group = "informative" if fi < 5 else ("correlated" if fi < 10 else "noise")
        print(f"  Rank {i+1}: feature {fi:2d} ({group}) — importance={perm_scores[fi]:.4f}")`,
              hint: 'For baseline, compute accuracy on X_val with the trained w,b. For each feature fi: copy X_val, shuffle column fi with rng.shuffle(X_copy[:,fi]), recompute accuracy, record drop = baseline_acc − shuffled_acc. Average drop over n_repeats.',
              testCode: `assert permutation_importance is not None, "permutation_importance not defined"
import numpy as np
result = permutation_importance(X_val, y_val, w, b)
assert result is not None, "permutation_importance returned None"
assert len(result) == X_val.shape[1], f"Expected {X_val.shape[1]} scores, got {len(result)}"
assert result[0] > result[15], "informative feature 0 should score higher than noise feature 15"
print("Permutation importance implementation looks correct!")`,
            },
          ],
        },
      },
    ],
  },
  quiz: [
    {
      id: 'ae2-18-q1',
      type: 'choice',
      question: 'Why can adding more features actually make a model perform worse?',
      options: [
        'More features always improve model accuracy',
        'Irrelevant features add noise, increase overfitting risk, and dilute the signal from useful features',
        'Models have a hard limit on the number of features they can accept',
        'More features make the model run out of memory',
      ],
      answer: 'Irrelevant features add noise, increase overfitting risk, and dilute the signal from useful features',
      hints: ['Think about what happens to distances between points as dimensionality grows.', 'The model has more opportunities to fit noise when there are more noise features.'],
      reviewSection: 'The Problem — Curse of Dimensionality',
    },
    {
      id: 'ae2-18-q2',
      type: 'choice',
      question: 'What is the key difference between filter and wrapper feature selection methods?',
      options: [
        'Filter methods use a model to evaluate features; wrapper methods use statistics',
        'Filter methods score features using statistics without a model; wrapper methods train a model to evaluate feature subsets',
        'Filter methods are always more accurate than wrapper methods',
        'Wrapper methods can only select one feature at a time',
      ],
      answer: 'Filter methods score features using statistics without a model; wrapper methods train a model to evaluate feature subsets',
      hints: ['Variance threshold and mutual information never train a model.', 'RFE trains and retrains a model for each removal step.'],
      reviewSection: 'Three Categories of Feature Selection',
    },
    {
      id: 'ae2-18-q3',
      type: 'choice',
      question: 'Mutual information can detect relationships that Pearson correlation cannot. What kind?',
      options: [
        'Linear relationships between continuous features',
        'Nonlinear relationships such as quadratic or periodic dependencies',
        'Relationships between categorical features only',
        'Relationships that require more than 1000 data points',
      ],
      answer: 'Nonlinear relationships such as quadratic or periodic dependencies',
      hints: ['Pearson correlation measures only linear association.', 'y = x² has zero correlation (symmetric around zero) but high mutual information.'],
      reviewSection: 'Mutual Information',
    },
    {
      id: 'ae2-18-q4',
      type: 'choice',
      question: 'L1 (Lasso) regularization performs feature selection as part of training. How?',
      options: [
        'It removes features with low variance before training starts',
        'It drives the weights of irrelevant features to exactly zero, effectively eliminating them from the model',
        'It ranks features by correlation with the target',
        'It trains separate models for each feature',
      ],
      answer: 'It drives the weights of irrelevant features to exactly zero, effectively eliminating them from the model',
      hints: ['The soft-thresholding step: w ← sign(w)·max(|w|−λ, 0) sets small weights to exactly zero.', 'L2/ridge shrinks weights but rarely makes them exactly zero — the sphere geometry lands on the interior, not a corner.'],
      reviewSection: 'L1 (Lasso) Regularization',
    },
    {
      id: 'ae2-18-q5',
      type: 'choice',
      question: 'RFE removes the least important feature and retrains. Why is this better than removing all low-importance features at once?',
      options: [
        'It is not better — removing all at once is always preferred',
        'Feature importances change as features are removed, so iterative removal accounts for interactions between features',
        'RFE uses a different importance metric than single-step removal',
        'Removing one at a time is only necessary for neural networks',
      ],
      answer: 'Feature importances change as features are removed, so iterative removal accounts for interactions between features',
      hints: ['When two correlated features exist, removing one changes the importance of the other.', 'Single-step removal sees importances computed with all redundant features present — the signal gets split across correlated features.'],
      reviewSection: 'Recursive Feature Elimination (RFE)',
    },
  ],
}

export default featureSelection
