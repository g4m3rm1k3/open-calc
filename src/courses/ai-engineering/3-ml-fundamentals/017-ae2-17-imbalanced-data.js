const imbalancedData = {
  id: 'ae2-17',
  slug: 'imbalanced-data',
  chapter: 'ae-p2',
  order: 16,
  title: 'Handling Imbalanced Data',
  subtitle: 'When 99% accuracy is a lie',
  tags: ['imbalanced-data', 'SMOTE', 'class-weights', 'threshold-tuning', 'MCC', 'AUPRC', 'fraud-detection'],
  hook: {
    question: 'Your fraud detection model hits 99.9% accuracy. Why is that a problem?',
    realWorldContext: 'Fraud detection, disease diagnosis, network intrusion, and defect detection all share one property: the cases that matter most are the rarest. A model that ignores them entirely can look excellent on paper.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'You ship a fraud detection model. Accuracy: 99.9%. You celebrate. Then someone asks: "How many fraudulent transactions did it catch?" Zero.',
      'This is not a bug. With only 0.1% fraud in the dataset, predicting "not fraud" for every single transaction gives 99.9% accuracy. The model is technically correct and completely useless.',
      'The confusion matrix reveals the truth. For 1000 samples with 990 negative and 10 positive: TP=0, TN=990, FP=0, FN=10. Accuracy = (0+990)/1000 = 99%. But Recall = 0/10 = 0% and F1 = 0. These metrics correctly identify the model as worthless — catching zero fraud.',
      'Three tools fix this. First: better metrics. Recall = TP/(TP+FN) measures how many positives you caught. F1 = 2·precision·recall/(precision+recall) penalizes extreme imbalance between the two. MCC = (TP·TN − FP·FN)/sqrt((TP+FP)(TP+FN)(TN+FP)(TN+FN)) only gives a high score when the model performs well on both classes. AUPRC (Area Under Precision-Recall Curve) starts at the positive class rate as its baseline — not 0.5 like ROC — making real improvements much easier to see.',
      'Second: SMOTE (Synthetic Minority Oversampling Technique). Random oversampling just duplicates minority samples, risking overfitting. SMOTE creates new synthetic minority samples by interpolation: for each minority sample x, find its k nearest minority neighbors, pick one randomly, then generate new_sample = x + rand(0,1) × (neighbor − x). This places new points in the same region of feature space without exact duplication.',
      'Third: class weights. Instead of changing the data, change how the model penalizes errors. For 950 negative and 50 positive samples: weight_negative = 1000/(2×950) = 0.526, weight_positive = 1000/(2×50) = 10.0. The minority class gets 19× the weight. Misclassifying one fraud now costs as much as misclassifying 19 legitimate transactions. The model is forced to pay attention.',
      'Threshold tuning is a fourth lever. Most classifiers output a probability; the default cutoff is 0.5. But a fraud classifier outputting P(fraud)=0.15 labels that "not fraud" at threshold 0.5 and correctly catches it at threshold 0.10. Sweep 0.0 to 1.0, compute F1 at each value on a validation set, and pick the threshold that maximizes your metric. Lowering the threshold always raises recall and lowers precision — you catch more fraud but flag more false alarms.',
    ],
    callouts: [
      {
        type: 'info',
        title: 'Imbalance Strategy by Severity',
        body: 'Mild (80/20): try class weights first — fastest, no data modification. Moderate (95/5): SMOTE + threshold tuning. Severe (99/1): combine SMOTE + class weights + threshold optimization. Always evaluate with F1, AUPRC, or MCC — never accuracy alone.',
      },
      {
        type: 'info',
        title: 'SMOTE Step by Step',
        body: '1. For each minority sample x, find k nearest neighbors among other minority samples. 2. Pick one neighbor randomly. 3. Generate: new_sample = x + rand(0,1) × (neighbor − x). The scalar rand(0,1) places the new point anywhere on the line between x and the neighbor — interpolation, not duplication.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Imbalanced Data Techniques from Scratch',
        mathBridge: 'SMOTE formula: new = x + t×(neighbor−x), t~Uniform(0,1). Class weight: w_class = n_samples/(n_classes × count_class). MCC = (TP·TN−FP·FN)/sqrt((TP+FP)(TP+FN)(TN+FP)(TN+FN))',
        caption: 'Build SMOTE, class weights, and threshold tuning from scratch, then compare all strategies side by side.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The Accuracy Paradox',
              prose: [
                'Start by generating a severely imbalanced dataset: 950 majority samples vs 50 minority.',
                'A model that always predicts the majority class achieves 95% accuracy — but zero recall on the minority class.',
                'The four metrics below show the difference between what accuracy reports and what actually matters.',
              ],
              code: `import numpy as np

def make_imbalanced_data(n_majority=950, n_minority=50, seed=42):
    rng = np.random.RandomState(seed)
    X_maj = rng.randn(n_majority, 2) * 1.0
    X_min = rng.randn(n_minority, 2) * 0.8 + np.array([2.5, 2.5])
    X = np.vstack([X_maj, X_min])
    y = np.concatenate([np.zeros(n_majority), np.ones(n_minority)])
    idx = rng.permutation(len(y))
    return X[idx], y[idx]

def confusion_values(y_true, y_pred):
    tp = np.sum((y_pred == 1) & (y_true == 1))
    tn = np.sum((y_pred == 0) & (y_true == 0))
    fp = np.sum((y_pred == 1) & (y_true == 0))
    fn = np.sum((y_pred == 0) & (y_true == 1))
    return tp, tn, fp, fn

def compute_metrics(y_true, y_pred):
    tp, tn, fp, fn = confusion_values(y_true, y_pred)
    accuracy = (tp + tn) / len(y_true)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    denom = np.sqrt(float((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn)))
    mcc = (tp*tn - fp*fn) / denom if denom > 0 else 0.0
    return {'accuracy': accuracy, 'precision': precision, 'recall': recall, 'f1': f1, 'mcc': mcc}

X, y = make_imbalanced_data(950, 50, seed=42)
print(f"Dataset: {np.sum(y==0):.0f} negative, {np.sum(y==1):.0f} positive")
print(f"Positive rate: {np.mean(y):.1%}")

always_negative = np.zeros(len(y))
m = compute_metrics(y, always_negative)
print("\\nAlways-predict-negative baseline:")
for k, v in m.items():
    print(f"  {k:12s}: {v:.3f}")`,
            },
            {
              id: 2,
              cellTitle: 'SMOTE from Scratch',
              prose: [
                'SMOTE finds k nearest minority neighbors for each minority sample and interpolates between them.',
                'The formula new = x + t×(neighbor−x) with t~Uniform(0,1) places new points anywhere on the line segment — not exact copies.',
                'Compare the before/after class counts to see how SMOTE rebalances the dataset.',
              ],
              code: `def euclidean_distance(a, b):
    return np.sqrt(np.sum((a - b) ** 2))

def find_k_neighbors(X, idx, k):
    distances = [(i, euclidean_distance(X[idx], X[i])) for i in range(len(X)) if i != idx]
    distances.sort(key=lambda x: x[1])
    return [d[0] for d in distances[:k]]

def smote(X_minority, k=5, n_synthetic=100, seed=42):
    rng = np.random.RandomState(seed)
    n = len(X_minority)
    k = min(k, n - 1)
    synthetic = []
    for _ in range(n_synthetic):
        idx = rng.randint(0, n)
        neighbors = find_k_neighbors(X_minority, idx, k)
        neighbor_idx = neighbors[rng.randint(0, len(neighbors))]
        t = rng.random()
        # Interpolate: new = x + t*(neighbor - x)
        new_point = X_minority[idx] + t * (X_minority[neighbor_idx] - X_minority[idx])
        synthetic.append(new_point)
    return np.array(synthetic)

X, y = make_imbalanced_data(950, 50, seed=42)
split = int(0.8 * len(y))
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

X_minority = X_train[y_train == 1]
n_needed = int((y_train == 0).sum()) - int((y_train == 1).sum())
synthetic = smote(X_minority, k=5, n_synthetic=n_needed)

X_smote = np.vstack([X_train, synthetic])
y_smote = np.concatenate([y_train, np.ones(len(synthetic))])
print(f"Before SMOTE: {int((y_train==0).sum())} negative, {int((y_train==1).sum())} positive")
print(f"After  SMOTE: {int((y_smote==0).sum())} negative, {int((y_smote==1).sum())} positive")

# Show example interpolation
x_sample = X_minority[0]
neighbor = X_minority[find_k_neighbors(X_minority, 0, 1)[0]]
t = 0.4
new_pt = x_sample + t * (neighbor - x_sample)
print(f"\\nExample: x={x_sample.round(2)}, neighbor={neighbor.round(2)}")
print(f"  t=0.4 => new point = {new_pt.round(2)}")`,
            },
            {
              id: 3,
              cellTitle: 'Class Weights and Threshold Tuning',
              prose: [
                'Class weights modify the loss function so minority misclassifications cost more.',
                'Formula: weight_class = n_samples / (n_classes × count_class). For 950 vs 50: positive weight = 1000/(2×50) = 10, negative weight = 1000/(2×950) ≈ 0.53.',
                'Threshold tuning sweeps from 0.0 to 1.0 on validation data and picks the cutoff that maximizes F1. Lowering the threshold always trades precision for recall.',
              ],
              code: `def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))

def logistic_weighted(X, y, weights, lr=0.1, epochs=300):
    w = np.zeros(X.shape[1])
    b = 0.0
    for _ in range(epochs):
        pred = sigmoid(X @ w + b)
        err = (pred - y) * weights
        w -= lr * (X.T @ err) / len(y)
        b -= lr * np.mean(err)
    return w, b

def compute_class_weights(y):
    classes, counts = np.unique(y, return_counts=True)
    n, nc = len(y), len(classes)
    wmap = {c: n / (nc * cnt) for c, cnt in zip(classes, counts)}
    return np.array([wmap[yi] for yi in y])

def find_optimal_threshold(y_true, y_probs):
    best_t, best_f1 = 0.5, -1.0
    for t in np.arange(0.05, 0.96, 0.01):
        pred = (y_probs >= t).astype(int)
        tp = np.sum((pred==1)&(y_true==1))
        fp = np.sum((pred==1)&(y_true==0))
        fn = np.sum((pred==0)&(y_true==1))
        p = tp/(tp+fp) if (tp+fp)>0 else 0.0
        r = tp/(tp+fn) if (tp+fn)>0 else 0.0
        f1 = 2*p*r/(p+r) if (p+r)>0 else 0.0
        if f1 > best_f1:
            best_f1, best_t = f1, t
    return best_t, best_f1

X, y = make_imbalanced_data(950, 50, seed=42)
split = int(0.8 * len(y))
val_split = int(0.7 * split)
X_train, X_val = X[:val_split], X[val_split:split]
y_train, y_val = y[:val_split], y[val_split:split]
X_test, y_test = X[split:], y[split:]

# Class weights computed from formula
cw = compute_class_weights(y_train)
print(f"Negative weight: {cw[y_train==0][0]:.3f}")
print(f"Positive weight: {cw[y_train==1][0]:.3f}")

w_cw, b_cw = logistic_weighted(X_train, y_train, cw)
probs_val = sigmoid(X_val @ w_cw + b_cw)
best_t, best_f1 = find_optimal_threshold(y_val, probs_val)
print(f"\\nOptimal threshold on validation: {best_t:.2f} (F1={best_f1:.3f})")

probs_test = sigmoid(X_test @ w_cw + b_cw)
preds_thresh = (probs_test >= best_t).astype(int)
m = compute_metrics(y_test, preds_thresh)
print("Class weights + tuned threshold on test set:")
for k, v in m.items():
    print(f"  {k:12s}: {v:.3f}")`,
            },
            {
              id: 4,
              cellTitle: 'Comparing All Strategies',
              prose: [
                'Now compare four strategies: baseline (no treatment), random oversample, SMOTE, and class weights + threshold tuning.',
                'Accuracy looks similar across strategies — the differences are in recall, F1, and MCC.',
                'MCC only gives a high score when the model performs well on both classes simultaneously, making it the most honest single number for imbalanced problems.',
              ],
              code: `def random_oversample(X, y, seed=42):
    rng = np.random.RandomState(seed)
    max_cnt = int((y==0).sum())
    min_idx = np.where(y==1)[0]
    extra = rng.choice(min_idx, size=max_cnt - len(min_idx), replace=True)
    X_out = np.vstack([X, X[extra]])
    y_out = np.concatenate([y, y[extra]])
    idx = rng.permutation(len(y_out))
    return X_out[idx], y_out[idx]

X, y = make_imbalanced_data(950, 50, seed=42)
split = int(0.8 * len(y))
val_split = int(0.7 * split)
X_tr, X_val = X[:val_split], X[val_split:split]
y_tr, y_val = y[:val_split], y[val_split:split]
X_te, y_te = X[split:], y[split:]

# Baseline
w0, b0 = logistic_weighted(X_tr, y_tr, np.ones(len(y_tr)))
m_base = compute_metrics(y_te, (sigmoid(X_te @ w0 + b0) >= 0.5).astype(int))

# Oversampled
X_ov, y_ov = random_oversample(X_tr, y_tr)
w1, b1 = logistic_weighted(X_ov, y_ov, np.ones(len(y_ov)))
m_over = compute_metrics(y_te, (sigmoid(X_te @ w1 + b1) >= 0.5).astype(int))

# SMOTE
X_min_tr = X_tr[y_tr==1]
n_needed = int((y_tr==0).sum()) - int((y_tr==1).sum())
synth = smote(X_min_tr, k=5, n_synthetic=n_needed)
X_sm = np.vstack([X_tr, synth])
y_sm = np.concatenate([y_tr, np.ones(len(synth))])
w2, b2 = logistic_weighted(X_sm, y_sm, np.ones(len(y_sm)))
m_smote = compute_metrics(y_te, (sigmoid(X_te @ w2 + b2) >= 0.5).astype(int))

# Class weights + threshold
cw2 = compute_class_weights(y_tr)
w3, b3 = logistic_weighted(X_tr, y_tr, cw2)
best_t, _ = find_optimal_threshold(y_val, sigmoid(X_val @ w3 + b3))
m_cw = compute_metrics(y_te, (sigmoid(X_te @ w3 + b3) >= best_t).astype(int))

print(f"{'Strategy':<22} {'Accuracy':>9} {'Recall':>8} {'F1':>8} {'MCC':>8}")
print("-" * 60)
for name, m in [('Baseline', m_base), ('Oversample', m_over), ('SMOTE', m_smote), ('CW+Threshold', m_cw)]:
    print(f"{name:<22} {m['accuracy']:>9.3f} {m['recall']:>8.3f} {m['f1']:>8.3f} {m['mcc']:>8.3f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: 'Implement AUPRC (Area Under the Precision-Recall Curve) from scratch. Sweep thresholds from 0 to 1, compute (precision, recall) at each, sort by recall, and use the trapezoidal rule to compute the area. Compare AUPRC for the baseline model vs the class-weighted model. The AUPRC baseline for a random classifier equals the positive class rate (~0.05 here) — not 0.5 like AUC-ROC.',
              starterCode: `import numpy as np

def make_imbalanced_data(n_majority=950, n_minority=50, seed=42):
    rng = np.random.RandomState(seed)
    X_maj = rng.randn(n_majority, 2) * 1.0
    X_min = rng.randn(n_minority, 2) * 0.8 + np.array([2.5, 2.5])
    X = np.vstack([X_maj, X_min])
    y = np.concatenate([np.zeros(n_majority), np.ones(n_minority)])
    idx = rng.permutation(len(y))
    return X[idx], y[idx]

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))

def logistic_weighted(X, y, weights, lr=0.1, epochs=300):
    w = np.zeros(X.shape[1])
    b = 0.0
    for _ in range(epochs):
        pred = sigmoid(X @ w + b)
        err = (pred - y) * weights
        w -= lr * (X.T @ err) / len(y)
        b -= lr * np.mean(err)
    return w, b

def compute_class_weights(y):
    classes, counts = np.unique(y, return_counts=True)
    n, nc = len(y), len(classes)
    wmap = {c: n / (nc * cnt) for c, cnt in zip(classes, counts)}
    return np.array([wmap[yi] for yi in y])

def compute_auprc(y_true, y_probs):
    # TODO: sweep thresholds, compute (precision, recall) pairs,
    # sort by recall, apply trapezoidal rule
    pass

X, y = make_imbalanced_data(950, 50, seed=42)
split = int(0.8 * len(y))
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

# Train baseline and class-weighted models
w_base, b_base = logistic_weighted(X_train, y_train, np.ones(len(y_train)))
cw = compute_class_weights(y_train)
w_cw, b_cw = logistic_weighted(X_train, y_train, cw)

probs_base = sigmoid(X_test @ w_base + b_base)
probs_cw = sigmoid(X_test @ w_cw + b_cw)

auprc_base = compute_auprc(y_test, probs_base)
auprc_cw = compute_auprc(y_test, probs_cw)

positive_rate = np.mean(y_test)
print(f"Random classifier AUPRC baseline: {positive_rate:.3f}")
print(f"Baseline model AUPRC:             {auprc_base}")
print(f"Class-weighted model AUPRC:       {auprc_cw}")`,
              hint: 'For each threshold in np.linspace(0,1,200), compute tp, fp, fn. precision=tp/(tp+fp), recall=tp/(tp+fn). Collect all (recall, precision) pairs, add (0,1) and (1,0) endpoints, sort by recall, then np.trapz(precisions, recalls).',
              testCode: `assert compute_auprc is not None, "compute_auprc not defined"
import numpy as np
y_t = np.array([1,1,0,0,1,0])
p_t = np.array([0.9,0.8,0.3,0.2,0.7,0.1])
result = compute_auprc(y_t, p_t)
assert result is not None, "compute_auprc returned None"
assert 0 < result <= 1.0, f"AUPRC should be in (0,1], got {result}"
print("AUPRC implementation looks correct!")`,
            },
          ],
        },
      },
    ],
  },
  quiz: [
    {
      id: 'ae2-17-q1',
      type: 'choice',
      question: 'A fraud detection dataset has 99.9% legitimate transactions and 0.1% fraud. A model predicts "legitimate" for every transaction. What is its accuracy?',
      options: ['50%', '0.1%', '99.9%', '100%'],
      answer: '99.9%',
      hints: ['Count the correct predictions: 999 out of 1000 transactions are labeled correctly as legitimate.', 'Accuracy does not care which class the correct predictions belong to.'],
      reviewSection: 'Why Accuracy Fails',
    },
    {
      id: 'ae2-17-q2',
      type: 'choice',
      question: 'Which metric correctly identifies the always-predict-negative model as useless?',
      options: ['Accuracy (99.9%)', 'Recall (0%) or F1 score (0%)', 'Specificity (100%)', 'True negative rate (100%)'],
      answer: 'Recall (0%) or F1 score (0%)',
      hints: ['Recall = TP/(TP+FN). If the model never predicts positive, TP=0 and all fraud is missed.', 'F1 is the harmonic mean of precision and recall — if recall is 0, F1 is 0.'],
      reviewSection: 'Better Metrics',
    },
    {
      id: 'ae2-17-q3',
      type: 'choice',
      question: 'How does SMOTE generate synthetic minority samples?',
      options: [
        'By duplicating existing minority samples exactly',
        'By randomly generating points anywhere in the feature space',
        'By interpolating between a minority sample and one of its k nearest minority neighbors',
        'By flipping the labels of majority class samples',
      ],
      answer: 'By interpolating between a minority sample and one of its k nearest minority neighbors',
      hints: ['SMOTE uses k-NN among minority samples only — not all samples.', 'The formula: new = x + rand(0,1)×(neighbor−x) places the new point on the line between x and neighbor.'],
      reviewSection: 'SMOTE: Synthetic Minority Oversampling Technique',
    },
    {
      id: 'ae2-17-q4',
      type: 'choice',
      question: 'You lower the classification threshold from 0.5 to 0.3 on an imbalanced dataset. What happens to precision and recall?',
      options: [
        'Both precision and recall increase',
        'Recall increases (more positives caught) but precision decreases (more false positives)',
        'Precision increases but recall decreases',
        'Neither changes — threshold only affects speed',
      ],
      answer: 'Recall increases (more positives caught) but precision decreases (more false positives)',
      hints: ['Lowering the threshold classifies more samples as positive, catching more true positives.', 'But it also flags more false positives, which lowers precision.'],
      reviewSection: 'Threshold Tuning',
    },
    {
      id: 'ae2-17-q5',
      type: 'choice',
      question: 'Why is AUPRC (Area Under Precision-Recall Curve) more informative than AUC-ROC for highly imbalanced datasets?',
      options: [
        'AUPRC is always higher than AUC-ROC',
        'A random classifier has AUPRC equal to the positive class rate (e.g., 0.001), making improvements visible, while AUC-ROC baseline is 0.5 regardless of imbalance',
        'AUPRC does not require a threshold',
        'AUC-ROC cannot be computed for imbalanced data',
      ],
      answer: 'A random classifier has AUPRC equal to the positive class rate (e.g., 0.001), making improvements visible, while AUC-ROC baseline is 0.5 regardless of imbalance',
      hints: ['AUC-ROC can look deceptively good because the large number of true negatives inflates TNR.', 'AUPRC baseline = positive rate, so going from 0.001 to 0.3 AUPRC represents a meaningful real improvement.'],
      reviewSection: 'Better Metrics — AUPRC',
    },
  ],
}

export default imbalancedData
