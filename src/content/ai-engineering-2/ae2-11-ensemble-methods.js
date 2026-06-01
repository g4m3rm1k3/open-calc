const lesson = {
  id: 'ae2-11',
  slug: 'ensemble-methods',
  chapter: 'ML Fundamentals',
  order: 10,
  title: 'Ensemble Methods',
  subtitle: 'Combine weak learners into a model stronger than any individual',
  tags: ['ensemble', 'random-forest', 'boosting', 'adaboost', 'gradient-boosting', 'stacking'],
  hook: {
    question: 'If 21 independent classifiers each have 60% accuracy, what accuracy does majority vote achieve?',
    realWorldContext: 'XGBoost and LightGBM — both gradient boosting ensemble methods — have won more Kaggle competitions than all other algorithms combined. Random forests power everything from credit scoring to medical diagnosis. Understanding why ensembles work is understanding the heart of practical ML.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `If N classifiers each have accuracy p > 0.5 and make independent errors, majority vote accuracy is P(majority correct) = Σ_{k > N/2} C(N,k) · p^k · (1−p)^(N-k). For N=21, p=0.6: about 74%. For N=101: about 84%. Errors cancel out when models make different mistakes.`,
      `The critical requirement is diversity. If all models make the same errors, combining them changes nothing. Diversity comes from: different training subsets (bagging), different feature subsets (random forests), sequential error correction (boosting), or entirely different model families (stacking).`,
      `Bagging (Bootstrap Aggregating) creates diversity by training each model on a different bootstrap sample — drawn with replacement, same size as the original. About 63.2% of unique samples appear in each bootstrap; the remaining 36.8% (out-of-bag samples) give a free validation estimate. Bagging reduces variance. Each tree overfits to its bootstrap sample, but the overfitting is different for each tree, so averaging cancels noise. Random forests add one more twist: at each split, only sqrt(n_features) candidate features are considered, forcing even more diversity.`,
      `Boosting is sequential rather than parallel. AdaBoost: start with uniform weights w_i = 1/N. For each round t, train a weak learner h_t on the weighted data. Compute weighted error err_t = Σ(w_i · 1[h_t(xᵢ) ≠ yᵢ]). Compute model weight α_t = 0.5 · ln((1 − err_t) / err_t). Update weights: w_i ← w_i · exp(−α_t · yᵢ · h_t(xᵢ)). Normalize. Final prediction: sign(Σ α_t · h_t(x)). Models with lower error get higher alpha. Misclassified samples get higher weights so the next model focuses on them.`,
      `Gradient boosting generalizes this to any differentiable loss. Instead of reweighting samples, each new model fits the residuals (negative gradient of the loss) of the current ensemble. For squared error loss, pseudo-residuals rᵢ = yᵢ − F_{t-1}(xᵢ). Each tree literally corrects the remaining error. F_t(x) = F_{t-1}(x) + η · h_t(x), where η is the learning rate (shrinkage). Smaller η requires more trees but generalizes better.`,
      `XGBoost dominates tabular data through engineering: regularized leaf weights (L1+L2 penalties), second-order Taylor expansion for split scoring, sparsity-aware splits for missing values, column subsampling for diversity, and cache-aware memory layout. For tabular data, start with XGBoost or LightGBM before trying neural networks.`,
      `Stacking uses predictions from base models as features for a meta-learner. The meta-learner learns which base model to trust on which inputs. To prevent leakage: generate meta-features via K-fold cross-validation on training data. Never train base models and generate meta-features on the same data fold.`,
    ],
    callouts: [
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: 21 independent classifiers each have p=0.6 accuracy. What is P(at least 11 are correct)? This is a binomial tail sum. Predict: is it above or below 70%? How does it change if p=0.51 vs p=0.7?`,
      },
      {
        type: 'info',
        title: 'Which Ensemble for Which Problem?',
        body: `(1) High variance base model (deep tree, high-degree polynomial) → use bagging/random forest. (2) High bias base model (decision stump, shallow tree) → use boosting. (3) Tabular data, production use → start with LightGBM/XGBoost defaults. (4) Need last 0.5% → stacking with diverse base models.`,
      },
      {
        type: 'warning',
        title: 'Boosting Can Overfit',
        body: `Unlike random forests, gradient boosting CAN overfit if you run too many rounds. Use early stopping: monitor validation loss and stop when it hasn't improved for N consecutive rounds. This removes n_estimators from the hyperparameter search entirely.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Ensemble Methods from Scratch',
        mathBridge: `AdaBoost: α_t = 0.5·ln((1−err_t)/err_t). Weight update: w_i ← w_i·exp(−α_t·yᵢ·h_t(xᵢ)). Gradient Boosting: rᵢ = yᵢ − F_{t-1}(xᵢ). F_t = F_{t-1} + η·h_t. Majority vote: argmax over k of Σ_{models} P(class=k).`,
        caption: 'Implement AdaBoost, gradient boosting, and a bagging ensemble from scratch, then compare all methods.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Decision Stump & AdaBoost from Scratch',
              prose: [
                `A decision stump is the simplest possible classifier: split on one feature at one threshold. It is the standard base learner for AdaBoost. Alone it barely beats random; combined with weighting and accumulation, 50 stumps can achieve strong accuracy.`,
                `AdaBoost key formulas: err_t = Σ(w_i · 1[wrong]) / Σ(w_i). α_t = 0.5 · ln((1 − err_t) / err_t). Weight update: w_i ← w_i · exp(−α_t · yᵢ · h_t(xᵢ)). Normalize weights to sum to 1. Final: sign(Σ α_t · h_t(x)).`,
                `Note: AdaBoost uses labels ±1 (not 0/1). The update exp(−α·y·h) increases weight when y ≠ h (wrong prediction: −y·h > 0) and decreases it when correct.`,
              ],
              code: `import numpy as np

class Stump:
    def fit(self, X, y, w):
        n, p = X.shape
        self.feat, self.thresh, self.pol, self.err = 0, 0, 1, np.inf
        for f in range(p):
            for t in np.unique(X[:,f]):
                for pol in (1, -1):
                    pred = np.where(pol * X[:,f] >= pol * t, 1, -1)
                    err = w[pred != y].sum()
                    if err < self.err:
                        self.feat, self.thresh, self.pol, self.err = f, t, pol, err
    def predict(self, X):
        return np.where(self.pol * X[:,self.feat] >= self.pol * self.thresh, 1, -1)

class AdaBoost:
    def __init__(self, T=50): self.T = T
    def fit(self, X, y):
        n = len(y)
        w = np.full(n, 1/n)
        self.stumps, self.alphas = [], []
        for _ in range(self.T):
            s = Stump(); s.fit(X, y, w)
            err = np.clip(s.err, 1e-10, 1-1e-10)
            alpha = 0.5 * np.log((1-err)/err)
            w *= np.exp(-alpha * y * s.predict(X))
            w /= w.sum()
            self.stumps.append(s); self.alphas.append(alpha)
    def predict(self, X):
        return np.sign(sum(a * s.predict(X) for a, s in zip(self.alphas, self.stumps)))

rng = np.random.default_rng(7)
N = 300
X = rng.normal(0, 1, (N, 2))
y = np.sign(X[:,0]**2 + X[:,1]**2 - 1.2 + rng.normal(0, 0.3, N))  # circular boundary

split = int(0.7*N)
X_tr, X_te = X[:split], X[split:]
y_tr, y_te = y[:split], y[split:]

# Single stump baseline
stump = Stump(); stump.fit(X_tr, y_tr, np.full(split, 1/split))
stump_acc = (stump.predict(X_te) == y_te).mean()

# AdaBoost
ada = AdaBoost(T=100); ada.fit(X_tr, y_tr)
ada_acc = (ada.predict(X_te) == y_te).mean()

print(f"Single stump accuracy: {stump_acc:.4f}")
print(f"AdaBoost (100 rounds) accuracy: {ada_acc:.4f}")
print(f"Alpha values (first 5): {[round(a,3) for a in ada.alphas[:5]]}")`,
            },
            {
              id: 2,
              cellTitle: 'Gradient Boosting from Scratch',
              prose: [
                `Gradient boosting for regression: start with the mean prediction F_0 = mean(y). At each step, compute residuals r = y − F_{t-1}(x). Fit a shallow regression tree to the residuals. Add η × tree_prediction to the ensemble. Repeat T times.`,
                `For squared error loss, residuals ARE the negative gradient: −∂L/∂F = y − F. For other losses (log loss, huber), the formula for pseudo-residuals differs but the structure is identical.`,
                `We use a minimal depth-limited regression tree stump (depth 1 = one split). The learning rate η (shrinkage) controls how aggressively we update. Smaller η = more trees needed = better generalization. Typical: η = 0.05–0.1.`,
              ],
              code: `import numpy as np

class RegStump:
    def fit(self, X, r):
        n, p = X.shape
        self.feat, self.thresh, self.left, self.right, self.best_err = 0, 0, 0, 0, np.inf
        for f in range(p):
            for t in np.unique(X[:,f]):
                mask = X[:,f] < t
                if mask.sum() == 0 or (~mask).sum() == 0: continue
                l, r_ = r[mask].mean(), r[~mask].mean()
                err = ((r[mask] - l)**2).sum() + ((r[~mask] - r_)**2).sum()
                if err < self.best_err:
                    self.feat, self.thresh, self.left, self.right, self.best_err = f, t, l, r_, err
    def predict(self, X):
        return np.where(X[:,self.feat] < self.thresh, self.left, self.right)

class GradBoost:
    def __init__(self, T=100, lr=0.1): self.T = T; self.lr = lr
    def fit(self, X, y):
        self.F0 = y.mean()
        F = np.full(len(y), self.F0)
        self.trees = []
        for _ in range(self.T):
            res = y - F
            t = RegStump(); t.fit(X, res)
            F += self.lr * t.predict(X)
            self.trees.append(t)
    def predict(self, X):
        F = np.full(X.shape[0], self.F0)
        for t in self.trees: F += self.lr * t.predict(X)
        return F

rng = np.random.default_rng(5)
N = 400
x = rng.uniform(-3, 3, N)
y = np.sin(x) + rng.normal(0, 0.3, N)
X = x.reshape(-1,1)

split = int(0.75*N)
X_tr, X_te = X[:split], X[split:]
y_tr, y_te = y[:split], y[split:]

print(f"{'T':>6}  {'Train MSE':>10}  {'Val MSE':>10}")
for T in [10, 30, 50, 100, 200]:
    gb = GradBoost(T=T, lr=0.1); gb.fit(X_tr, y_tr)
    tr_mse = np.mean((gb.predict(X_tr) - y_tr)**2)
    te_mse = np.mean((gb.predict(X_te) - y_te)**2)
    print(f"{T:>6}  {tr_mse:>10.4f}  {te_mse:>10.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'Random Forest & Ensemble Comparison',
              prose: [
                `Random forests add feature subsampling to bagging: at each split, only sqrt(n_features) candidate features are considered. This decorrelates the trees — even if the same dominant feature would be chosen every time, some trees are forced to split on other features, creating diversity.`,
                `Out-of-bag (OOB) error gives a free validation estimate without a holdout set. Each bootstrap sample omits ~36.8% of the data. For each omitted sample, we average predictions from all trees that did NOT include it in training.`,
                `We compare single tree, random forest, and gradient boosting on the same dataset. Gradient boosting usually wins on clean data; random forests are more robust to outliers and noise.`,
              ],
              code: `import numpy as np

def gini(y):
    if len(y) == 0: return 0
    p = np.bincount(y.astype(int), minlength=2) / len(y)
    return 1 - (p**2).sum()

def best_split(X, y, max_feats=None):
    n, p = X.shape
    feats = np.random.choice(p, size=min(max_feats or p, p), replace=False)
    best = (np.inf, 0, 0)
    for f in feats:
        for t in np.unique(X[:,f]):
            m = X[:,f] < t
            if m.sum() == 0 or (~m).sum() == 0: continue
            g = (m.sum()*gini(y[m]) + (~m).sum()*gini(y[~m])) / n
            if g < best[0]: best = (g, f, t)
    return best[1], best[2]

def build_tree(X, y, depth=0, max_depth=5, max_feats=None):
    if depth == max_depth or len(np.unique(y)) == 1:
        return int(np.bincount(y.astype(int)).argmax())
    f, t = best_split(X, y, max_feats)
    m = X[:,f] < t
    if m.sum() == 0 or (~m).sum() == 0:
        return int(np.bincount(y.astype(int)).argmax())
    return (f, t, build_tree(X[m], y[m], depth+1, max_depth, max_feats),
                   build_tree(X[~m], y[~m], depth+1, max_depth, max_feats))

def predict_tree(node, x):
    if isinstance(node, int): return node
    f, t, l, r = node
    return predict_tree(l, x) if x[f] < t else predict_tree(r, x)

rng = np.random.default_rng(3)
N = 300
X = rng.normal(0, 1, (N, 4))
y = ((X[:,0] + X[:,1]**2 - X[:,2]) > 0).astype(float)
y += (rng.random(N) < 0.05).astype(float)  # 5% label noise
y = np.clip(y, 0, 1)

split = int(0.75*N)
X_tr, X_te = X[:split], X[split:]
y_tr, y_te = y[:split], y[split:]

# Random Forest
n_trees = 50
max_feats = int(np.sqrt(X.shape[1]))
preds = np.zeros(len(y_te))
for _ in range(n_trees):
    idx = np.random.choice(split, size=split, replace=True)
    tree = build_tree(X_tr[idx], y_tr[idx], max_feats=max_feats)
    preds += np.array([predict_tree(tree, x) for x in X_te])
rf_acc = ((preds / n_trees > 0.5).astype(int) == y_te.astype(int)).mean()

# Single tree
single = build_tree(X_tr, y_tr)
single_acc = (np.array([predict_tree(single, x) for x in X_te]) == y_te.astype(int)).mean()

print(f"Single tree accuracy:  {single_acc:.4f}")
print(f"Random forest ({n_trees} trees): {rf_acc:.4f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Implement a soft-voting ensemble that combines three different classifiers: (1) a random forest (use the build_tree function from cell 3, 20 trees), (2) logistic regression (sigmoid gradient descent), and (3) a 3-nearest-neighbor classifier. Each model outputs a probability. Average the three probability estimates and predict the majority class. Compare the ensemble accuracy to each individual model.`,
              starterCode: `import numpy as np

# Setup: reusable dataset
rng = np.random.default_rng(42)
N = 400
X = rng.normal(0, 1, (N, 2))
y = ((X[:,0]**2 + X[:,1]**2) < 1.5).astype(float)
split = int(0.75*N)
X_tr, X_te = X[:split], X[split:]
y_tr, y_te = y[:split], y[split:]

# Standardize
mu, sd = X_tr.mean(0), X_tr.std(0)
X_tr_s = (X_tr - mu) / sd
X_te_s = (X_te - mu) / sd

# TODO: implement logistic regression (sigmoid + gradient descent)
# TODO: implement 3-NN probability (fraction of 3 nearest neighbors that are positive)
# TODO: implement a small random forest (reuse or simplify cell 3's approach)
# TODO: average probabilities and compare all four accuracies`,
              hint: `For 3-NN probability: compute L2 distance from each test point to all train points, find 3 nearest, return mean(y_tr[3-nearest]). For logistic regression: sigmoid(X@w + b), update w -= lr * X.T @ (pred - y) / n.`,
              testCode: `# Ensemble accuracy should exceed at least two of the three individual models`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-11-q1',
      type: 'choice',
      question: `Why does combining multiple weak classifiers into an ensemble improve accuracy?`,
      options: [
        'Each weak classifier memorizes a different part of the test set',
        'If the classifiers make different errors, majority voting cancels out individual mistakes',
        'Ensembles always use more training data than single models',
        'Weak classifiers are always faster than strong classifiers',
      ],
      answer: 'If the classifiers make different errors, majority voting cancels out individual mistakes',
      hints: ['The key is diversity. A wrong answer must fool more than half the models simultaneously for the ensemble to be wrong.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-11-q2',
      type: 'choice',
      question: `What is the main difference between bagging and boosting?`,
      options: [
        'Bagging trains models in parallel on random subsets; boosting trains models sequentially, focusing on previous errors',
        'Bagging uses deep neural networks; boosting uses decision trees',
        'Bagging reduces bias; boosting reduces variance',
        'Bagging requires labeled data; boosting works unsupervised',
      ],
      answer: 'Bagging trains models in parallel on random subsets; boosting trains models sequentially, focusing on previous errors',
      hints: ['Bagging = parallel + bootstrap samples = variance reduction. Boosting = sequential + error correction = bias reduction.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-11-q3',
      type: 'choice',
      question: `In AdaBoost, what happens to the sample weight of a misclassified training point after each round?`,
      options: [
        'It stays the same',
        'It increases, so the next weak learner focuses more on this hard example',
        'It decreases, so the next learner ignores it',
        'It is removed from the training set',
      ],
      answer: 'It increases, so the next weak learner focuses more on this hard example',
      hints: ['Weight update: w_i ← w_i · exp(−α·y·h). When h ≠ y (wrong), −α·y·h > 0, so exp(·) > 1, increasing weight.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-11-q4',
      type: 'choice',
      question: `A random forest with 100 trees has the same test accuracy as 500 trees. Why?`,
      options: [
        'The random forest is underfitting and needs a different algorithm',
        'After enough trees, variance reduction plateaus and more trees give diminishing returns without increasing overfitting',
        '500 is the maximum allowed number of trees',
        'The trees are all identical so adding more has no effect',
      ],
      answer: 'After enough trees, variance reduction plateaus and more trees give diminishing returns without increasing overfitting',
      hints: ['Unlike boosting, adding more trees to a random forest does not cause overfitting. It just stops helping past the saturation point.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-11-q5',
      type: 'choice',
      question: `Gradient boosting fits each new tree to what quantity?`,
      options: [
        'The original target values',
        'The residuals (errors) of the current ensemble\'s predictions',
        'Random subsets of features',
        'The predictions of the previous tree',
      ],
      answer: 'The residuals (errors) of the current ensemble\'s predictions',
      hints: ['For squared error loss, pseudo-residuals = y − F_{t-1}(x). Each tree literally fits the remaining error.'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
