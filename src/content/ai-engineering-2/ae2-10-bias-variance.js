const lesson = {
  id: 'ae2-10',
  slug: 'bias-variance-tradeoff',
  chapter: 'ML Fundamentals',
  order: 9,
  title: 'The Bias-Variance Tradeoff',
  subtitle: 'Every model error has a source — learn to diagnose which one is hurting you',
  tags: ['bias-variance', 'overfitting', 'underfitting', 'regularization', 'learning-curves'],
  hook: {
    question: 'Your model has 2% training error and 25% test error. What single change would help most?',
    realWorldContext: 'A fraud detection model scores perfectly in testing but fails in production. A house price model trained for a week still predicts the average for every house. Both are broken — but in opposite ways. The bias-variance tradeoff is the lens that reveals which problem you have and what to do about it.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `Every model error you observe on test data has exactly three sources: bias, variance, and irreducible noise. Expected Error = Bias² + Variance + σ². You can control only the first two.`,
      `Bias is systematic error. Train the same model architecture on many different datasets drawn from the same distribution. Bias is the gap between the average prediction and the true answer. A linear model fit to a parabola has high bias — it consistently misses the curve no matter how much data you give it. This is underfitting.`,
      `Variance is sensitivity error. It measures how much predictions change when you retrain on different subsets of data. A degree-20 polynomial on 15 points will thread through every training point perfectly, but train it on a slightly different 15 points and the curve looks completely different. This is overfitting.`,
      `The formal decomposition for squared loss: E[(y − f̂(x))²] = (E[f̂(x)] − f(x))² + E[(f̂(x) − E[f̂(x)])²] + σ². The first term is Bias², the second is Variance, the third is noise in the labels themselves — irreducible, no matter how good your model is.`,
      `Model complexity drives the tradeoff. Simple models (degree-1 polynomial) have high bias and low variance. Complex models (degree-20 polynomial) have low bias and high variance. Somewhere in between is the sweet spot where total error is minimized. This is the classic U-shaped error curve.`,
      `Regularization shifts where you sit on the curve without changing the model architecture. L2 (Ridge) shrinks all weights toward zero. L1 (Lasso) pushes some weights to exactly zero. Dropout randomly disables neurons during training. Early stopping halts before the model fully memorizes training data. All of these deliberately increase bias to decrease variance — and the net effect is lower total error when variance was the dominant problem.`,
      `The double descent phenomenon: classical theory says error rises monotonically past the complexity sweet spot. But in overparameterized neural networks (parameters ≫ samples), error can decrease again. At the interpolation threshold (just enough parameters to fit all training data exactly), variance peaks. Far past the threshold, the optimizer's implicit bias toward simple solutions acts as implicit regularization, and test error drops. The lesson: never stop your model exactly at the interpolation threshold.`,
      `Diagnosing your model: compute both training error and test error. Large gap (train low, test high) → high variance → get more data, regularize, or simplify. Small gap but both high → high bias → use a more complex model, add features, or reduce regularization. Both low → ship it.`,
    ],
    callouts: [
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: a degree-5 polynomial is trained on 20 points vs. 500 points from the same distribution. Which will have higher variance? Predict how the learning curve will look — draw it mentally: training error on one axis, validation error on the other, both as a function of training set size.`,
      },
      {
        type: 'info',
        title: 'Diagnostic Checklist',
        body: `(1) Both errors high, small gap → bias. Fix: more complex model, add features, less regularization. (2) Train low, test high, large gap → variance. Fix: more data, regularization, simpler model. (3) Learning curve plateaus with both errors high → more data will NOT help. (4) Learning curve shows shrinking gap → more data will help.`,
      },
      {
        type: 'warning',
        title: 'Ensemble Interaction',
        body: `Bagging (random forests) reduces variance without much bias change. Boosting reduces bias but can increase variance. Practical rule: if your base model overfits (high variance), use bagging. If it underfits (high bias), use boosting.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Bias-Variance Decomposition',
        mathBridge: `E[Error] = Bias² + Variance + σ². Bias² = (E[f̂(x)] − f(x))². Variance = E[(f̂(x) − E[f̂(x)])²]. Empirical estimate: train on B bootstrap samples, compute mean_pred = average prediction at each test point. Bias² = mean((mean_pred − y_true)²). Variance = mean(var over bootstrap samples).`,
        caption: 'Empirically decompose prediction error into bias and variance across polynomial degrees, then visualize regularization effects.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Bootstrap Bias-Variance Decomposition',
              prose: [
                `We measure bias² and variance empirically by training on many bootstrap samples. The key insight: if we average predictions over many training sets, the mean prediction gives us E[f̂(x)]. Squaring the gap to the true function gives bias². The spread of individual predictions around the mean gives variance.`,
                `true_function: f(x) = sin(1.5x) + 0.5x. We add Gaussian noise with std=0.5. Since we know the true function, we can compute exact bias.`,
                `We sweep polynomial degrees 1 through 9. Degree 1 is a line (high bias, low variance). Degree 9 on 30 samples is severely overfit (low bias, high variance). The decomposition shows both terms and their sum.`,
              ],
              code: `import numpy as np

def true_fn(x): return np.sin(1.5 * x) + 0.5 * x

def poly_predict(x_train, y_train, x_test, degree, lam=0.0):
    X_tr = np.column_stack([x_train**d for d in range(degree+1)])
    X_te = np.column_stack([x_test**d  for d in range(degree+1)])
    if lam > 0:
        pen = lam * np.eye(X_tr.shape[1]); pen[0,0] = 0
        w = np.linalg.solve(X_tr.T @ X_tr + pen, X_tr.T @ y_train)
    else:
        w = np.linalg.lstsq(X_tr, y_train, rcond=None)[0]
    return X_te @ w

rng = np.random.default_rng(0)
x_test = np.linspace(-3, 3, 60)
y_true = true_fn(x_test)
B = 150   # bootstrap samples
N = 30    # training set size
noise = 0.5

print(f"{'Degree':>8}  {'Bias²':>10}  {'Variance':>10}  {'Total':>10}")
for deg in [1, 2, 3, 4, 5, 6, 9]:
    preds = []
    for _ in range(B):
        x_tr = rng.uniform(-3, 3, N)
        y_tr = true_fn(x_tr) + rng.normal(0, noise, N)
        preds.append(poly_predict(x_tr, y_tr, x_test, deg))
    preds = np.array(preds)  # (B, 60)
    mean_pred = preds.mean(0)
    bias2    = np.mean((mean_pred - y_true)**2)
    variance = np.mean(preds.var(0))
    total    = bias2 + variance + noise**2
    print(f"{deg:>8}  {bias2:>10.4f}  {variance:>10.4f}  {total:>10.4f}")`,
            },
            {
              id: 2,
              cellTitle: 'Learning Curves: Diagnosing Bias vs Variance',
              prose: [
                `Learning curves plot training and validation error as a function of training set size. They reveal whether the problem is solvable by getting more data (high variance with a shrinking gap) or requires a better model (high bias where both curves plateau high).`,
                `We compare two polynomial degrees: degree 1 (high bias) and degree 5 (high variance at small N). For each training size, we average over 50 random draws to get stable curves.`,
                `High bias signature: both train and validation errors plateau at high values. The gap between them is small. More data won't help. High variance signature: training error is low, validation error is much higher. The gap shrinks as N grows.`,
              ],
              code: `import numpy as np

def true_fn(x): return np.sin(1.5 * x) + 0.5 * x

def poly_predict(x_tr, y_tr, x_te, deg, lam=0.0):
    X_tr = np.column_stack([x_tr**d for d in range(deg+1)])
    X_te = np.column_stack([x_te**d for d in range(deg+1)])
    if lam > 0:
        pen = lam * np.eye(X_tr.shape[1]); pen[0,0] = 0
        w = np.linalg.solve(X_tr.T @ X_tr + pen, X_tr.T @ y_tr)
    else:
        w = np.linalg.lstsq(X_tr, y_tr, rcond=None)[0]
    return X_te @ w

rng = np.random.default_rng(1)
noise = 0.5
# Fixed validation set
x_val = rng.uniform(-3, 3, 100)
y_val = true_fn(x_val) + rng.normal(0, noise, 100)

train_sizes = [5, 10, 15, 20, 30, 50, 80, 120]
runs_per_size = 40

print("Degree 1 (HIGH BIAS):")
print(f"{'N':>5}  {'Train MSE':>10}  {'Val MSE':>10}")
for n in train_sizes:
    tr_errs, va_errs = [], []
    for _ in range(runs_per_size):
        x_tr = rng.uniform(-3, 3, n)
        y_tr = true_fn(x_tr) + rng.normal(0, noise, n)
        pv = poly_predict(x_tr, y_tr, x_val, 1)
        pt = poly_predict(x_tr, y_tr, x_tr,  1)
        va_errs.append(np.mean((pv - y_val)**2))
        tr_errs.append(np.mean((pt - y_tr)**2))
    print(f"{n:>5}  {np.mean(tr_errs):>10.4f}  {np.mean(va_errs):>10.4f}")

print("\\nDegree 5 (HIGH VARIANCE at small N):")
print(f"{'N':>5}  {'Train MSE':>10}  {'Val MSE':>10}")
for n in train_sizes:
    tr_errs, va_errs = [], []
    for _ in range(runs_per_size):
        x_tr = rng.uniform(-3, 3, n)
        y_tr = true_fn(x_tr) + rng.normal(0, noise, n)
        pv = poly_predict(x_tr, y_tr, x_val, 5)
        pt = poly_predict(x_tr, y_tr, x_tr,  5)
        va_errs.append(np.mean((pv - y_val)**2))
        tr_errs.append(np.mean((pt - y_tr)**2))
    print(f"{n:>5}  {np.mean(tr_errs):>10.4f}  {np.mean(va_errs):>10.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'Regularization as Bias-Variance Control',
              prose: [
                `Regularization sweeps the bias-variance curve using a continuous knob (λ) instead of changing model architecture. We fix a high-degree polynomial (degree 10) and sweep Ridge regularization from λ=0 (no constraint) to λ=100 (near-constant model).`,
                `Low λ: the model chases noise in every bootstrap sample → high variance dominates. High λ: the penalty squeezes all weights to near zero → the model can't fit the curve → high bias. The optimal λ minimizes total error at the minimum of the U-curve.`,
                `This is directly analogous to the complexity sweep from cell 1, but regularization gives fine-grained, continuous control — which is why it is the preferred tool in practice.`,
              ],
              code: `import numpy as np

def true_fn(x): return np.sin(1.5 * x) + 0.5 * x

def ridge_predict(x_tr, y_tr, x_te, deg, lam):
    X_tr = np.column_stack([x_tr**d for d in range(1, deg+1)])
    X_te = np.column_stack([x_te**d for d in range(1, deg+1)])
    pen = lam * np.eye(X_tr.shape[1])
    w = np.linalg.solve(X_tr.T @ X_tr + pen, X_tr.T @ y_tr)
    return X_te @ w

rng = np.random.default_rng(2)
noise = 0.5
deg = 10
B = 100
N = 30
x_test = np.linspace(-3, 3, 60)
y_true = true_fn(x_test)

lambdas = [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0, 10.0, 50.0]
print(f"{'Lambda':>8}  {'Bias²':>10}  {'Variance':>10}  {'Total':>10}")
for lam in lambdas:
    preds = []
    for _ in range(B):
        x_tr = rng.uniform(-3, 3, N)
        y_tr = true_fn(x_tr) + rng.normal(0, noise, N)
        preds.append(ridge_predict(x_tr, y_tr, x_test, deg, lam))
    preds = np.array(preds)
    mean_pred = preds.mean(0)
    bias2    = np.mean((mean_pred - y_true)**2)
    variance = np.mean(preds.var(0))
    print(f"{lam:>8.3f}  {bias2:>10.4f}  {variance:>10.4f}  {bias2+variance+noise**2:>10.4f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Implement a bagging ensemble of 20 degree-5 polynomials. Each model trains on a bootstrap sample (sample N points with replacement from the training set). Average their predictions on the test set. Compare the bias² and variance of the single model vs. the bagged ensemble using the bootstrap decomposition from cell 1. Show that bagging reduces variance without changing bias much.`,
              starterCode: `import numpy as np

def true_fn(x): return np.sin(1.5 * x) + 0.5 * x

def poly_fit_predict(x_tr, y_tr, x_te, deg):
    X_tr = np.column_stack([x_tr**d for d in range(deg+1)])
    X_te = np.column_stack([x_te**d for d in range(deg+1)])
    w = np.linalg.lstsq(X_tr, y_tr, rcond=None)[0]
    return X_te @ w

rng = np.random.default_rng(99)
noise = 0.5
deg = 5
N = 30
n_bag = 20
B = 100  # bootstrap repetitions
x_test = np.linspace(-3, 3, 60)
y_true = true_fn(x_test)

# TODO: for each of B bootstrap repetitions:
#   1. Sample a training set of N points (with noise)
#   2. Single model: fit poly on that training set, record predictions on x_test
#   3. Bagged ensemble: draw n_bag bootstrap sub-samples FROM the training set,
#      fit one poly each, average their predictions → bagged prediction
# TODO: compute and print bias² and variance for single vs bagged model`,
              hint: `Bootstrap sample from the training set: idx = rng.integers(0, N, size=N). Then x_bag = x_tr[idx], y_bag = y_tr[idx]. Bagged prediction = mean of 20 individual predictions.`,
              testCode: `# Bagged variance should be noticeably lower than single-model variance
# Bias should be similar (bagging does not reduce bias)`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-10-q1',
      type: 'choice',
      question: `A linear model is used to fit a clearly curved (quadratic) relationship. Which error component dominates?`,
      options: [
        'Variance: the model changes too much with different training data',
        'Bias: the model is too rigid to capture the true nonlinear pattern',
        'Irreducible noise: the data is too noisy',
        'None: the model fits perfectly',
      ],
      answer: 'Bias: the model is too rigid to capture the true nonlinear pattern',
      hints: ['A linear model cannot capture a quadratic curve no matter how much data you give it. Consistent systematic error is bias.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-10-q2',
      type: 'choice',
      question: `The bias-variance decomposition has three terms. Which one cannot be reduced by any model?`,
      options: [
        'Bias squared',
        'Variance',
        'Irreducible noise (σ²)',
        'All three can be reduced to zero',
      ],
      answer: 'Irreducible noise (σ²)',
      hints: ['Irreducible noise comes from randomness in the data itself — measurement error, missing variables. No model can predict noise.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-10-q3',
      type: 'choice',
      question: `Adding L2 regularization increases bias and decreases variance. Why is this useful?`,
      options: [
        'It always improves both training and test accuracy',
        'The reduction in variance can outweigh the increase in bias, lowering total error',
        'L2 regularization eliminates irreducible noise',
        'It makes the model faster to train',
      ],
      answer: 'The reduction in variance can outweigh the increase in bias, lowering total error',
      hints: ['Regularization is useful when the model is overfitting (variance is the dominant error). It trades a small bias increase for a large variance decrease.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-10-q4',
      type: 'choice',
      question: `A model has training error = 2% and test error = 25%. What is the most likely diagnosis?`,
      options: [
        'High bias (underfitting): the model is too simple',
        'High variance (overfitting): the model memorized training data and fails to generalize',
        'High irreducible noise: the data is too noisy',
        'The model is perfectly calibrated',
      ],
      answer: 'High variance (overfitting): the model memorized training data and fails to generalize',
      hints: ['Low training error + high test error + large gap = high variance. The model fits training-specific noise.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-10-q5',
      type: 'choice',
      question: `You train the same model on 50 different random training subsets and observe that predictions vary wildly. What does this indicate?`,
      options: [
        'High bias: the model consistently misses the true pattern',
        'High variance: the model is sensitive to which specific training data it sees',
        'High irreducible noise: the target variable is random',
        'The learning rate is too high',
      ],
      answer: 'High variance: the model is sensitive to which specific training data it sees',
      hints: ['Variance = how much predictions change when trained on different data subsets. Wildly different predictions across subsets is the definition of high variance.'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
