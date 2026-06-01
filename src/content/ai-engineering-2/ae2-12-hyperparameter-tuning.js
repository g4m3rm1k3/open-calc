const lesson = {
  id: 'ae2-12',
  slug: 'hyperparameter-tuning',
  chapter: 'ae-p2',
  order: 11,
  title: 'Hyperparameter Tuning',
  subtitle: 'Find the right knobs to turn — and turn them efficiently',
  tags: ['hyperparameters', 'grid-search', 'random-search', 'bayesian-optimization', 'optuna'],
  hook: {
    question: 'Grid search over 4 hyperparameters with 5 values each requires how many model fits?',
    realWorldContext: '5⁴ = 625 combinations × 10 seconds each = 1.7 hours just for a coarse search. Production ML teams spend 40–60% of compute on hyperparameter search. Knowing when random search beats grid search, and when Bayesian optimization beats both, is what separates efficient practitioners from wasteful ones.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `Parameters are learned by the optimizer during training (weights, biases, split thresholds). Hyperparameters are set before training starts and control how learning happens: learning rate, max depth, regularization strength, batch size, dropout rate. Getting them right is often the difference between a model that works and one that doesn't.`,
      `Grid search evaluates every combination of specified values. For 2 hyperparameters with 5 values each: 5² = 25 evaluations. For 6 hyperparameters with 5 values each: 5⁶ = 15,625 evaluations. Grid search has a fundamental flaw: if only 1–2 hyperparameters actually matter for this problem, most evaluations are wasted varying the unimportant ones. You get only 5 unique values of the important parameter from 25 evaluations.`,
      `Random search samples from distributions instead of a grid. With the same budget of 25 evaluations, you get 25 unique values of each hyperparameter. Bergstra & Bengio (2012) proved that random search dominates grid search when most hyperparameters have low effective dimensionality — which is almost always true. At 60 random trials, you have a 95% chance of finding a point within 5% of the optimum.`,
      `Bayesian optimization learns from past evaluations to decide where to search next. It maintains a surrogate model (usually a Gaussian process) that approximates the expensive objective function from all observed (hyperparameter, score) pairs. The surrogate gives two things at each candidate point: a predicted score (mean) and an uncertainty (variance). An acquisition function balances these: Expected Improvement (EI) = E[max(score − best_so_far, 0)] favors points that are either predicted to be great OR where uncertainty is high. Early in the search, most points are uncertain, so the optimizer explores. Later, it focuses on the most promising region.`,
      `Early stopping eliminates n_estimators/epochs from the search entirely. For gradient boosting and neural networks, set the budget high and stop when validation loss hasn't improved for N consecutive rounds. This is strictly better than treating the number of iterations as a hyperparameter.`,
      `Hyperparameter importance is consistent across models. For gradient-based methods: learning rate always matters most. Regularization strength is second. Max depth / number of layers is third. Batch size within a reasonable range (32–256) rarely matters much. Always tune the most important ones first.`,
      `Use log-uniform distributions for learning rate and regularization — the difference between 0.001 and 0.01 matters as much as 0.1 to 1.0. Searching linearly misses the low end entirely. Use uniform or log-uniform for continuous params, randint for integers.`,
      `Nested cross-validation prevents overfitting the validation set during tuning. Outer loop: 5 folds for unbiased performance estimation. Inner loop: 5-fold CV to find best hyperparameters for each outer fold. Each outer fold independently finds its own best parameters. Expensive but trustworthy for final performance estimates.`,
    ],
    callouts: [
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: a gradient boosting model has 6 hyperparameters. You run 50 random trials. How many unique values does each hyperparameter see vs. a 50-evaluation grid search that only hits √(50) ≈ 7 unique values per axis on a 2D slice? Now predict: for which hyperparameter should you always search on a log scale?`,
      },
      {
        type: 'info',
        title: 'Practical Tuning Workflow',
        body: `(1) Start with library defaults — they're 80% of the way there. (2) Coarse random search: wide ranges, 20–50 trials, early stopping for fast kills. (3) Identify important hyperparameters from the results. (4) Fine search: Bayesian optimization in narrowed space, 50–100 trials. (5) Retrain on full training data with best hyperparameters.`,
      },
      {
        type: 'warning',
        title: 'Overfitting to Validation via Tuning',
        body: `Running thousands of tuning trials effectively trains on the validation set. If you tune on the same validation fold you report final performance on, your reported score is optimistic. Use nested CV for final estimates, or maintain a completely separate test set you touch only once.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Hyperparameter Tuning Strategies',
        mathBridge: `Grid: 5^d evaluations for d hyperparameters × 5 values each. Random: N samples, N unique values per axis. Bayesian EI: E[max(f(x) − f*, 0)] = σ(z·Φ(z) + φ(z)) where z = (μ−f*)/σ. GP kernel: k(x,x') = exp(−||x−x'||²/(2l²)).`,
        caption: 'Compare grid search, random search, and a simple Bayesian optimizer on a synthetic objective. See why random beats grid and Bayes beats both.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Grid Search vs Random Search',
              prose: [
                `We use a synthetic objective that has a clear optimum at learning_rate ≈ 0.01 and max_depth ≈ 4. Most of the variation comes from learning_rate; max_depth matters less. This simulates the real scenario where effective dimensionality < nominal dimensionality.`,
                `Grid search evaluates a fixed grid. Random search samples independently. With the same evaluation budget, random search finds more unique values of the important learning_rate dimension.`,
                `The key insight: grid search gives only k unique values of learning_rate from k² total evaluations. Random search gives k² unique values of learning_rate from k² evaluations — covering the important dimension k× more densely.`,
              ],
              code: `import numpy as np
import itertools

def objective(lr, depth):
    # True optimum at lr=0.01, depth=4. lr matters 4x more than depth.
    return -(np.log10(lr) + 2)**2 * 4 - (depth - 4)**2 + 20

# Grid search
lr_grid    = [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0]
depth_grid = [2, 3, 4, 5, 6, 7]
grid_results = []
for lr, d in itertools.product(lr_grid, depth_grid):
    grid_results.append((lr, d, objective(lr, d)))
grid_best = max(grid_results, key=lambda x: x[2])
print(f"Grid search: {len(grid_results)} evals")
print(f"  Best: lr={grid_best[0]}, depth={grid_best[1]}, score={grid_best[2]:.4f}")

# Random search: same budget
rng = np.random.default_rng(0)
n_rand = len(grid_results)
rand_results = []
for _ in range(n_rand):
    lr  = 10 ** rng.uniform(-3, 0)       # log-uniform [0.001, 1.0]
    d   = rng.integers(2, 8)              # uniform int [2, 7]
    rand_results.append((lr, d, objective(lr, d)))
rand_best = max(rand_results, key=lambda x: x[2])
print(f"\\nRandom search: {len(rand_results)} evals")
print(f"  Best: lr={rand_best[0]:.5f}, depth={rand_best[1]}, score={rand_best[2]:.4f}")

# Count unique lr values in top 10 results
top_grid = sorted(grid_results, key=lambda x:-x[2])[:10]
top_rand = sorted(rand_results, key=lambda x:-x[2])[:10]
print(f"\\nUnique lr values in top 10:")
print(f"  Grid:   {len(set(r[0] for r in top_grid))}")
print(f"  Random: {len(set(round(r[0],4) for r in top_rand))}")`,
            },
            {
              id: 2,
              cellTitle: 'Simple Bayesian Optimization with Gaussian Process',
              prose: [
                `Bayesian optimization builds a probabilistic model (surrogate) of the objective function from all past observations. We use a squared-exponential Gaussian process kernel: k(x, x') = exp(−||x−x'||² / (2l²)).`,
                `Given observed points, the GP gives a mean μ(x) and uncertainty σ(x) at any new point. The acquisition function Expected Improvement (EI) = σ · (z·Φ(z) + φ(z)) where z = (μ − f*) / σ, Φ is the normal CDF, φ is the normal PDF, and f* is the current best score.`,
                `EI naturally trades off: it is high where μ is high (exploitation near known good regions) AND where σ is high (exploration of uncertain regions). This is what makes Bayesian optimization more efficient than random search — it doesn't repeat work near already-explored bad regions.`,
              ],
              code: `import numpy as np
from math import erf, sqrt, pi, exp

def norm_cdf(z): return 0.5 * (1 + erf(z / sqrt(2)))
def norm_pdf(z): return exp(-0.5 * z**2) / sqrt(2 * pi)

def gp_predict(X_obs, y_obs, X_new, length=0.5, noise=1e-4):
    def kern(a, b): return np.exp(-0.5 * np.sum((a-b)**2) / length**2)
    n = len(X_obs)
    K = np.array([[kern(X_obs[i], X_obs[j]) for j in range(n)] for i in range(n)])
    K += noise * np.eye(n)
    K_s = np.array([[kern(x, xo) for xo in X_obs] for x in X_new])
    L = np.linalg.cholesky(K)
    alpha = np.linalg.solve(L.T, np.linalg.solve(L, y_obs - y_obs.mean()))
    mu = K_s @ alpha + y_obs.mean()
    v = np.linalg.solve(L, K_s.T)
    var = np.maximum(1.0 - np.sum(v**2, axis=0), 1e-8)
    return mu, np.sqrt(var)

def expected_improvement(mu, sigma, best):
    z = (mu - best) / (sigma + 1e-10)
    return sigma * (z * norm_cdf(z) + norm_pdf(z))

def objective_1d(lr): return -(np.log10(lr) + 2)**2 * 4 + 20

rng = np.random.default_rng(1)
# Initial 4 random observations
lrs_obs = 10 ** rng.uniform(-3, 0, 4)
scores_obs = np.array([objective_1d(lr) for lr in lrs_obs])
candidates = 10 ** np.linspace(-3, 0, 200)

print("Bayesian optimization (1D: learning rate only):")
print(f"{'Trial':>6}  {'LR chosen':>12}  {'Score':>8}  {'Best so far':>12}")
for trial in range(15):
    X_obs = np.log10(lrs_obs).reshape(-1,1)
    X_cand = np.log10(candidates).reshape(-1,1)
    mu, sigma = gp_predict(X_obs, scores_obs, X_cand)
    ei = expected_improvement(mu, sigma, scores_obs.max())
    next_lr = candidates[np.argmax(ei)]
    next_score = objective_1d(next_lr)
    lrs_obs = np.append(lrs_obs, next_lr)
    scores_obs = np.append(scores_obs, next_score)
    if trial < 8 or trial >= 12:
        print(f"{trial+5:>6}  {next_lr:>12.5f}  {next_score:>8.4f}  {scores_obs.max():>12.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'Cross-Validation Grid Search on a Real Model',
              prose: [
                `We apply grid search with 5-fold cross-validation to tune a ridge regression model. The model has one key hyperparameter: α (regularization strength). We search a log-scale grid from 0.001 to 100.`,
                `The CV grid search: for each α, do 5-fold CV and record mean ± std of validation MSE. The α with lowest mean validation MSE is selected. We then retrain the winner on the full training set.`,
                `This pattern — log-scale grid, 5-fold CV, retrain on full data — is the simplest reliable tuning workflow. For more hyperparameters, swap grid search for random search.`,
              ],
              code: `import numpy as np

def ridge_fit(X, y, alpha):
    n, p = X.shape
    w = np.linalg.solve(X.T @ X + alpha * np.eye(p), X.T @ y)
    return w

def ridge_predict(X, w): return X @ w

def kfold_cv_ridge(X, y, alpha, k=5):
    n = len(y)
    idx = np.random.permutation(n)
    folds = np.array_split(idx, k)
    val_mses = []
    for i in range(k):
        val = folds[i]
        train = np.concatenate([folds[j] for j in range(k) if j != i])
        X_tr, y_tr = X[train], y[train]
        X_val, y_val = X[val], y[val]
        # Standardize on training fold
        mu, sd = X_tr.mean(0), X_tr.std(0) + 1e-8
        X_tr_s = (X_tr - mu) / sd
        X_val_s = (X_val - mu) / sd
        w = ridge_fit(X_tr_s, y_tr, alpha)
        pred = ridge_predict(X_val_s, w)
        val_mses.append(np.mean((pred - y_val)**2))
    return np.array(val_mses)

rng = np.random.default_rng(42)
N = 200
X = rng.normal(0, 1, (N, 10))
true_w = np.array([2, -1, 0.5, 0, 0, 3, 0, -2, 0, 0])  # sparse true weights
y = X @ true_w + rng.normal(0, 0.5, N)

np.random.seed(0)
alphas = [0.001, 0.01, 0.1, 0.5, 1.0, 5.0, 10.0, 50.0, 100.0]
print(f"{'Alpha':>8}  {'Mean MSE':>10}  {'Std':>8}")
results = []
for alpha in alphas:
    scores = kfold_cv_ridge(X, y, alpha)
    print(f"{alpha:>8.3f}  {scores.mean():>10.4f}  {scores.std():>8.4f}")
    results.append((alpha, scores.mean()))

best_alpha = min(results, key=lambda x: x[1])[0]
print(f"\\nBest alpha: {best_alpha}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Implement a simple Hyperband algorithm. Hyperband starts with n_configs configurations, each trained for min_budget rounds. It keeps the top 1/η fraction and gives them η× more budget. Repeat until one config gets the full max_budget. Use the synthetic objective below. Compare total budget used vs. running all configs for max_budget rounds.`,
              starterCode: `import numpy as np
import math

rng = np.random.default_rng(7)

def noisy_objective(lr, depth, n_rounds):
    """Simulates a model trained for n_rounds. Later rounds reveal the true optimum."""
    true_score = -(np.log10(lr) + 2)**2 * 3 - (depth - 4)**2 + 20
    noise = rng.normal(0, 3.0 / np.sqrt(n_rounds))  # noise decreases with rounds
    return true_score + noise

# Hyperband parameters
max_budget = 81    # max rounds per config
eta = 3            # reduction factor
s_max = int(math.log(max_budget, eta))  # number of brackets

# Generate random configs
n_configs = max_budget  # start with 81 configs
configs = [(10**rng.uniform(-3, 0), rng.integers(2, 9)) for _ in range(n_configs)]

# TODO: implement Hyperband
# Round 0: evaluate all n_configs for 1 round, keep top n_configs/eta
# Round 1: evaluate remaining configs for eta rounds, keep top n_configs/eta^2
# Round 2: keep going until 1 config gets max_budget rounds
# Track total_rounds_used (sum of all rounds across all configs/evaluations)
# Print each round: how many configs, budget per config, best score seen so far`,
              hint: `After round r, you have n_configs // eta**(r+1) survivors, each getting eta**(r+1) rounds. Total rounds = sum over r of (n_configs // eta**r * eta**r) = n_configs * (s_max+1). Compare to n_configs * max_budget for full search.`,
              testCode: `# Total rounds used should be much less than n_configs * max_budget`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-12-q1',
      type: 'choice',
      question: `What is the difference between a parameter and a hyperparameter?`,
      options: [
        'Parameters are set by the user; hyperparameters are learned during training',
        'Parameters are learned during training (weights, biases); hyperparameters are set before training starts (learning rate, max depth)',
        'There is no difference; they are synonyms',
        'Parameters apply to neural networks only; hyperparameters apply to tree models',
      ],
      answer: 'Parameters are learned during training (weights, biases); hyperparameters are set before training starts (learning rate, max depth)',
      hints: ['During training, the optimizer updates parameters. Hyperparameters control how that optimization happens.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-12-q2',
      type: 'choice',
      question: `Grid search over 4 hyperparameters with 5 values each requires how many evaluations?`,
      options: ['20', '25', '625', '4'],
      answer: '625',
      hints: ['Grid search evaluates every combination: 5⁴ = 625. This exponential scaling is why grid search breaks down with many hyperparameters.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-12-q3',
      type: 'choice',
      question: `Why does random search often outperform grid search with the same evaluation budget?`,
      options: [
        'Random search uses a better optimization algorithm',
        'Most hyperparameters have low effective dimensionality, so random search covers the important ones more densely',
        'Random search always finds the global optimum',
        'Grid search cannot handle continuous hyperparameters',
      ],
      answer: 'Most hyperparameters have low effective dimensionality, so random search covers the important ones more densely',
      hints: ['Usually only 1–2 hyperparameters matter. Grid search gives only k unique values of each from k² total trials. Random search gives k² unique values per axis.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-12-q4',
      type: 'choice',
      question: `In Bayesian optimization, what does the acquisition function balance?`,
      options: [
        'Training speed and model accuracy',
        'Exploitation (searching near known good points) and exploration (searching uncertain regions)',
        'The number of features and the number of samples',
        'Bias and variance in the surrogate model',
      ],
      answer: 'Exploitation (searching near known good points) and exploration (searching uncertain regions)',
      hints: ['EI = σ·(z·Φ(z) + φ(z)). When σ is high (uncertain region), EI is high even if μ isn\'t great — that\'s exploration.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-12-q5',
      type: 'choice',
      question: `You tune hyperparameters using the test set and report the best test performance. What is wrong with this approach?`,
      options: [
        'Nothing — this is standard practice',
        'You overfitted to the test set; the reported performance is optimistic and will not generalize',
        'The test set should be used for training, not tuning',
        'Hyperparameters should only be integers',
      ],
      answer: 'You overfitted to the test set; the reported performance is optimistic and will not generalize',
      hints: ['Every time you peek at test performance to make a decision, you are implicitly fitting to that set. Use validation data for tuning.'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
