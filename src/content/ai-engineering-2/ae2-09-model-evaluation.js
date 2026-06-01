const lesson = {
  id: 'ae2-09',
  slug: 'model-evaluation',
  chapter: 'ML Fundamentals',
  order: 8,
  title: 'Model Evaluation & Validation',
  subtitle: 'Know exactly how well your model will perform before it hits production',
  tags: ['model-evaluation', 'cross-validation', 'metrics', 'learning-curves', 'overfitting'],
  hook: {
    question: 'If your model gets 95% accuracy on a medical test, why might that be a terrible result?',
    realWorldContext: 'A model that predicts "no disease" for every patient achieves 95% accuracy on a dataset where 95% are healthy — but misses every sick person. Choosing the right metric and validation strategy is what separates models that deploy from models that mislead.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `The fundamental rule of evaluation: the test set is touched exactly once — after all design decisions are made. Every time you peek at test performance to choose a hyperparameter, you are fitting to that set and its score becomes optimistic.`,
      `Split your data into three parts. Training data (60–70%) teaches the model. Validation data (10–20%) guides hyperparameter choices. Test data (10–20%) gives you one honest measurement of generalization. The validation score estimates performance; only the test score certifies it.`,
      `When data is scarce, K-fold cross-validation extracts more signal. Split the training data into K equal folds. Train on K−1 folds, validate on the held-out fold. Rotate through all K folds and average the validation scores. Every data point is used for validation exactly once, giving a lower-variance estimate than a single split. Stratified K-fold maintains the class ratio in each fold — critical for imbalanced datasets.`,
      `For classification, accuracy = (TP + TN) / total is misleading when classes are unequal. A 95/5 dataset where you predict the majority class for everything gets 95% accuracy but zero utility. Precision = TP / (TP + FP) answers "of everything you called positive, how many were right?". Recall = TP / (TP + FN) answers "of all true positives, how many did you catch?". F1 = 2 · (precision · recall) / (precision + recall) is the harmonic mean — it is 0 if either precision or recall is 0.`,
      `The ROC curve plots recall (true positive rate) vs. false positive rate at every possible threshold. AUC-ROC = 0.5 means the model is random. AUC-ROC = 1.0 is perfect. AUC is threshold-independent and class-imbalance-robust, making it the default metric for binary classifiers.`,
      `For regression: MSE = (1/n) Σ(yᵢ − ŷᵢ)². RMSE = √MSE, in the same units as y. MAE = (1/n) Σ|yᵢ − ŷᵢ|, robust to outliers. R² = 1 − SS_res/SS_tot tells you what fraction of variance your model explains. R² = 1 is perfect; R² = 0 means the model performs like predicting the mean.`,
      `Learning curves plot training and validation loss vs. training set size. High bias (underfitting): both curves plateau at high error. The fix is a more complex model. High variance (overfitting): training error is low but validation error is much higher. The fix is more data, regularization, or simpler model.`,
      `Common evaluation mistakes: fitting a scaler on the full dataset before splitting (leakage), using accuracy on imbalanced data, tuning hyperparameters on the test set, reporting the best fold score instead of the mean, and forgetting to stratify K-fold on class-imbalanced data.`,
    ],
    callouts: [
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: a binary classifier has TP=80, FP=20, FN=10, TN=890. Compute accuracy, precision, recall, and F1. Then predict: if the positive class is "cancer", which metric should the doctor care about most — precision or recall?`,
      },
      {
        type: 'warning',
        title: 'The #1 Evaluation Mistake',
        body: `Fitting a StandardScaler (or any preprocessing step) on the full dataset — including validation/test rows — before the train/test split. This leaks distribution statistics from the future into training. Always: split first, fit transformers on training data only, apply to val/test.`,
      },
      {
        type: 'info',
        title: 'K-Fold Procedure',
        body: `(1) Shuffle data. (2) Divide into K equal folds. (3) For each fold i: train on all folds except i, evaluate on fold i. (4) Report mean ± std of the K scores. Use K=5 or K=10. Larger K = lower bias, higher variance, higher compute cost.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Model Evaluation Toolkit',
        mathBridge: `Precision = TP/(TP+FP). Recall = TP/(TP+FN). F1 = 2PR/(P+R). AUC = ∫ROC. R² = 1 − SS_res/SS_tot. K-fold: average validation score over K held-out folds.`,
        caption: 'Implement classification metrics, K-fold CV, regression metrics, and learning curves from scratch.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Classification Metrics from Scratch',
              prose: [
                `We build every standard classification metric from a confusion matrix. The confusion matrix is a 2×2 table counting the four outcomes: TP (predicted positive, actually positive), FP (predicted positive, actually negative), FN (predicted negative, actually positive), TN (predicted negative, actually negative).`,
                `Accuracy hides the class imbalance problem. On a 95/5 dataset, predicting the majority class everywhere gives 95% accuracy with zero recall for the minority. F1 score penalizes this because recall = 0 → F1 = 0.`,
                `We also sweep thresholds to show how precision and recall trade off — the PR curve. High threshold → high precision, low recall. Low threshold → high recall, lower precision.`,
              ],
              code: `import numpy as np

def confusion_matrix(y_true, y_pred):
    TP = ((y_pred == 1) & (y_true == 1)).sum()
    FP = ((y_pred == 1) & (y_true == 0)).sum()
    FN = ((y_pred == 0) & (y_true == 1)).sum()
    TN = ((y_pred == 0) & (y_true == 0)).sum()
    return TP, FP, FN, TN

def metrics(y_true, y_pred):
    TP, FP, FN, TN = confusion_matrix(y_true, y_pred)
    accuracy  = (TP + TN) / len(y_true)
    precision = TP / (TP + FP) if (TP + FP) > 0 else 0
    recall    = TP / (TP + FN) if (TP + FN) > 0 else 0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    return accuracy, precision, recall, f1

rng = np.random.default_rng(7)
# Imbalanced dataset: 5% positive
y_true = (rng.random(1000) < 0.05).astype(int)

# Strategy A: always predict negative (accuracy ~95%)
y_all_neg = np.zeros(1000, dtype=int)

# Strategy B: real classifier (some signal, some noise)
prob = 0.05 + (rng.random(1000) * 0.4) * y_true + rng.normal(0, 0.1, 1000)
y_classifier = (prob > 0.3).astype(int)

for name, y_pred in [('All-negative', y_all_neg), ('Classifier', y_classifier)]:
    acc, prec, rec, f1 = metrics(y_true, y_pred)
    TP, FP, FN, TN = confusion_matrix(y_true, y_pred)
    print(f"{name}:  acc={acc:.3f}  prec={prec:.3f}  rec={rec:.3f}  F1={f1:.3f}")
    print(f"  CM: TP={TP}  FP={FP}  FN={FN}  TN={TN}")

# Threshold sweep on classifier
print("\\nThreshold sweep (classifier):")
for t in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]:
    yp = (prob > t).astype(int)
    _, prec, rec, f1 = metrics(y_true, yp)
    print(f"  t={t:.1f}: prec={prec:.3f}  rec={rec:.3f}  F1={f1:.3f}")`,
            },
            {
              id: 2,
              cellTitle: 'K-Fold Cross-Validation',
              prose: [
                `K-fold CV gives a less noisy performance estimate than a single train/val split, especially on small datasets. We implement it from scratch using a simple logistic regression (sigmoid + gradient descent) as the model.`,
                `The key insight: with K=5, each data point is in the validation fold exactly once. The 5 scores usually vary — the mean is our estimate, the std tells us how stable it is. High std suggests the model is sensitive to which particular samples land in training.`,
                `Stratified K-fold sorts by label, then interleaves into folds so each fold has the same class ratio as the full dataset. We show the difference on an imbalanced dataset.`,
              ],
              code: `import numpy as np

def sigmoid(z): return 1 / (1 + np.exp(-np.clip(z, -20, 20)))

def logreg_train(X, y, lr=0.1, epochs=200):
    w = np.zeros(X.shape[1])
    b = 0.0
    for _ in range(epochs):
        pred = sigmoid(X @ w + b)
        err = pred - y
        w -= lr * (X.T @ err) / len(y)
        b -= lr * err.mean()
    return w, b

def logreg_predict(X, w, b, threshold=0.5):
    return (sigmoid(X @ w + b) >= threshold).astype(int)

def accuracy(y_true, y_pred):
    return (y_true == y_pred).mean()

# Dataset
rng = np.random.default_rng(42)
N = 300
X = rng.normal(0, 1, (N, 2))
y = (X[:,0] + 0.5 * X[:,1] + rng.normal(0, 0.5, N) > 0).astype(float)

# Standardize
X = (X - X.mean(0)) / X.std(0)

# K-fold CV
def kfold_cv(X, y, k=5):
    n = len(y)
    idx = np.random.permutation(n)
    folds = np.array_split(idx, k)
    scores = []
    for i in range(k):
        val_idx   = folds[i]
        train_idx = np.concatenate([folds[j] for j in range(k) if j != i])
        X_tr, y_tr = X[train_idx], y[train_idx]
        X_val, y_val = X[val_idx], y[val_idx]
        w, b = logreg_train(X_tr, y_tr)
        preds = logreg_predict(X_val, w, b)
        scores.append(accuracy(y_val, preds))
    return np.array(scores)

np.random.seed(0)
scores = kfold_cv(X, y, k=5)
print("5-Fold CV scores:", np.round(scores, 4))
print(f"Mean: {scores.mean():.4f}  Std: {scores.std():.4f}")
print(f"95% CI: ({scores.mean() - 2*scores.std():.4f}, {scores.mean() + 2*scores.std():.4f})")`,
            },
            {
              id: 3,
              cellTitle: 'Regression Metrics & Learning Curves',
              prose: [
                `For regression problems we have four metrics. MSE penalizes large errors quadratically — a prediction off by 10 is 100× worse than one off by 1. RMSE puts the error back in the original units (useful for interpretation). MAE treats all errors linearly — more robust when outliers are irrelevant. R² tells you how much variance you explain: 0 means you predict the mean for everything, 1 means perfect.`,
                `Learning curves diagnose whether you have a bias or variance problem. We train a polynomial regression at multiple dataset sizes and plot training vs. validation error. High bias: both curves plateau high. High variance: large gap between training and validation curves.`,
              ],
              code: `import numpy as np

def mse(y_true, y_pred):  return ((y_true - y_pred) ** 2).mean()
def rmse(y_true, y_pred): return np.sqrt(mse(y_true, y_pred))
def mae(y_true, y_pred):  return np.abs(y_true - y_pred).mean()
def r2(y_true, y_pred):
    ss_res = ((y_true - y_pred) ** 2).sum()
    ss_tot = ((y_true - y_true.mean()) ** 2).sum()
    return 1 - ss_res / ss_tot

rng = np.random.default_rng(1)
x_all = np.linspace(0, 4, 200)
y_all = np.sin(x_all * 2) + rng.normal(0, 0.3, 200)  # true signal + noise
x_all = x_all.reshape(-1, 1)

# Polynomial feature expansion
def poly_features(x, degree):
    return np.column_stack([x**d for d in range(1, degree+1)])

# Learning curves: vary training size
train_sizes = [10, 20, 40, 80, 120, 160]
val_idx = np.arange(160, 200)
X_val, y_val = poly_features(x_all[val_idx], 4), y_all[val_idx]

print("Learning curves (degree-4 polynomial):")
print(f"{'N_train':>8}  {'Train MSE':>10}  {'Val MSE':>10}  {'R2_val':>8}")
for n_train in train_sizes:
    train_idx = np.arange(n_train)
    Xtr = poly_features(x_all[train_idx], 4)
    ytr = y_all[train_idx]
    # Closed-form least squares
    w = np.linalg.lstsq(np.column_stack([np.ones(n_train), Xtr]),
                        ytr, rcond=None)[0]
    X_aug_val = np.column_stack([np.ones(len(val_idx)), X_val])
    X_aug_tr  = np.column_stack([np.ones(n_train), Xtr])
    train_mse = mse(ytr, X_aug_tr @ w)
    val_mse   = mse(y_val, X_aug_val @ w)
    r2_val    = r2(y_val, X_aug_val @ w)
    print(f"{n_train:>8}  {train_mse:>10.4f}  {val_mse:>10.4f}  {r2_val:>8.4f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Implement AUC-ROC from scratch. Given predicted probabilities and true labels, compute the ROC curve (TPR vs FPR at all thresholds) and the area under it using the trapezoidal rule. Then compare your AUC to a random classifier (AUC ≈ 0.5) and a perfect classifier (AUC = 1.0).`,
              starterCode: `import numpy as np

rng = np.random.default_rng(42)
N = 500
# True labels (10% positive)
y_true = (rng.random(N) < 0.1).astype(int)
# "Good" model: higher prob for positives
prob_good = 0.1 + y_true * 0.5 + rng.normal(0, 0.2, N)
prob_good = np.clip(prob_good, 0, 1)
# Random model
prob_random = rng.random(N)

# TODO: implement roc_curve(y_true, probs) -> (fpr_array, tpr_array)
#   - sweep thresholds from 1.0 down to 0.0
#   - at each threshold, predict positive if prob >= threshold
#   - compute FPR = FP/(FP+TN), TPR = TP/(TP+FN)
# TODO: implement auc(fpr, tpr) using trapezoidal rule
# TODO: print AUC for both models`,
              hint: `Thresholds: use np.sort(np.unique(probs))[::-1] then add 0.0 at the end. Trapezoidal rule: np.trapz(tpr, fpr) or sum of 0.5*(y1+y2)*(x2-x1) for each adjacent pair.`,
              testCode: `# AUC for good model should be > 0.75, random model should be ~0.5`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-09-q1',
      type: 'choice',
      question: `Why should you never tune hyperparameters on the test set?`,
      options: [
        'It makes training too slow',
        'Each peek at test performance fits the model to that set, making the final score optimistic',
        'Test sets are too small for reliable estimates',
        'It increases model complexity unnecessarily',
      ],
      answer: 'Each peek at test performance fits the model to that set, making the final score optimistic',
      hints: ['The test set is supposed to simulate truly unseen data. If you use it to make decisions, it is no longer unseen.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-09-q2',
      type: 'choice',
      question: `A spam classifier has 95% accuracy on a dataset where 95% of emails are not spam. What is the most useful statement about this result?`,
      options: [
        'The model is excellent — 95% accuracy is high',
        'Accuracy is misleading here; a model that always predicts non-spam also gets 95%',
        'The model needs more training data',
        'The model is overfitting to training data',
      ],
      answer: 'Accuracy is misleading here; a model that always predicts non-spam also gets 95%',
      hints: ['The baseline for any classifier is the majority-class classifier. If it matches your accuracy, your model adds nothing.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-09-q3',
      type: 'choice',
      question: `In K-fold cross-validation, each data point is used for validation exactly how many times?`,
      options: ['K times', '0 times', '1 time', 'K−1 times'],
      answer: '1 time',
      hints: ['Each point belongs to exactly one fold. It is in the validation set only when that fold is the held-out fold.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-09-q4',
      type: 'choice',
      question: `A model's training loss is low but validation loss is much higher. What does the learning curve suggest?`,
      options: [
        'Underfitting — the model is too simple',
        'Overfitting — the model memorizes training data but does not generalize',
        'Data leakage — the scaler was fit on all data',
        'The learning rate is too high',
      ],
      answer: 'Overfitting — the model memorizes training data but does not generalize',
      hints: ['High bias shows both curves high. High variance shows a large gap between training (low) and validation (high).'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-09-q5',
      type: 'choice',
      question: `What does AUC-ROC = 0.5 indicate?`,
      options: [
        'The model is 50% accurate',
        'The model performs no better than random guessing on rank ordering',
        'Precision equals recall',
        'The model predicts the positive class half the time',
      ],
      answer: 'The model performs no better than random guessing on rank ordering',
      hints: ['AUC measures the probability that a randomly chosen positive example is ranked higher than a randomly chosen negative example.'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
