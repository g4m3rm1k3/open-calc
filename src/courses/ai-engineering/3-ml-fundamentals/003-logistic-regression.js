export default {
  id: 'ae-p2-03-logistic-regression',
  slug: 'logistic-regression',
  chapter: 'ae-p2',
  order: 2,
  title: 'Logistic Regression',
  subtitle: 'The S-curve that turns linear scores into probabilities and answers yes-or-no questions.',
  tags: ['logistic-regression', 'sigmoid', 'binary-cross-entropy', 'classification', 'softmax', 'precision-recall', 'F1', 'confusion-matrix', 'decision-boundary'],

  hook: {
    question: 'You want to predict whether a tumor is malignant. Linear regression outputs 1.7 for one patient and -0.3 for another. What do those numbers mean? How do you turn them into a probability?',
    realWorldContext:
      'Linear regression outputs unbounded numbers. Classification needs bounded probabilities between 0 and 1 — and a clear yes/no decision. Logistic regression solves this by passing the linear output through the sigmoid function, which squashes any number into (0, 1). The output is a probability: P(malignant | features). Despite its name, logistic regression is a classification algorithm, not a regression algorithm. It is one of the most widely deployed ML models in production — spam filtering, click-through prediction, credit scoring, and medical diagnosis all use variants of it. It also introduces the two concepts that every neural network uses: a nonlinear activation function, and cross-entropy loss.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Why linear regression fails for classification: fit a line to predict pass/fail (1/0) from study hours. The line might output −0.2 at 1 hour and 1.3 at 10 hours. These are not probabilities. They go below 0 and above 1. A student who studied 100 hours would drag the line up, changing predictions for everyone else. Classification needs a function that outputs values in [0, 1], creates a sharp transition near the decision boundary, and is not distorted by outliers far from the boundary.',
      'The sigmoid function: σ(z) = 1/(1 + e^(−z)). When z is large positive: σ → 1. When z is large negative: σ → 0. When z = 0: σ = 0.5. Output is always in (0, 1). Smooth and differentiable. The derivative has a convenient form: σ\'(z) = σ(z)·(1 − σ(z)) — which means you can compute the derivative from the output, no need to recompute z. The model: p = σ(wᵀx + b). Output p is the probability that the input belongs to class 1. Predict class 1 if p ≥ 0.5 (i.e., if wᵀx + b ≥ 0).',
      'Binary cross-entropy loss: L = −(1/n)·Σ[yᵢ·log(pᵢ) + (1−yᵢ)·log(1−pᵢ)]. When y=1 and p→1: log(1)=0, loss→0 (correct). When y=1 and p→0: log(0)→−∞, loss→∞ (wrong, maximum penalty). When y=0 and p→0: loss→0 (correct). When y=0 and p→1: loss→∞ (wrong). This loss is convex with logistic regression — one global minimum, guaranteed. Why not MSE? MSE combined with the sigmoid produces a non-convex surface with local minima that gradient descent can get stuck in.',
      'Gradient descent for logistic regression. The gradients have a surprisingly clean form: ∂L/∂w = (1/n)·Σ(pᵢ − yᵢ)·xᵢ and ∂L/∂b = (1/n)·Σ(pᵢ − yᵢ). These look identical to the linear regression gradients — the only difference is that p = σ(wᵀx + b) instead of p = wᵀx + b. This structural similarity is not a coincidence; it comes from the mathematical duality between sigmoid/cross-entropy and linear/MSE. This same gradient form appears in the output layer of every neural network trained for classification.',
      'Decision boundary: in 2D, the boundary is the line where w₁x₁ + w₂x₂ + b = 0. Points with positive z are classified as 1, points with negative z as 0. Logistic regression always produces a LINEAR decision boundary. If the true boundary is curved (two concentric circles, for example), logistic regression fails — you either need polynomial features or a nonlinear model.',
      'Multi-class classification with softmax. For k classes, each class k has weights wₖ. Compute a score zₖ = wₖᵀx + bₖ for each class. Softmax converts scores to probabilities: p_k = exp(z_k) / Σexp(z_j). The denominator normalizes so probabilities sum to 1. Predicted class = argmax(p_k). Loss is categorical cross-entropy: L = −(1/n)·Σ log(p_{y_i}) where y_i is the true class. The gradient per class is p_k − 1{y=k} — exactly the error between predicted and target probability.',
      'Classification metrics beyond accuracy. Accuracy is misleading when classes are imbalanced. For 95% negative / 5% positive data, a model that always predicts negative gets 95% accuracy while being completely useless. The confusion matrix breaks down four types of outcomes: True Positive (TP), True Negative (TN), False Positive (FP), False Negative (FN). Precision = TP/(TP+FP): of all predicted positives, what fraction are truly positive? Recall = TP/(TP+FN): of all actual positives, what fraction did we find? F1 = 2·P·R/(P+R): harmonic mean that balances both. Use precision when false positives are costly (spam filter, fraud alert). Use recall when false negatives are costly (cancer screening, missing a tumor is far worse than an unnecessary biopsy).',
      'Threshold tuning: the default decision threshold is 0.5, but it is a hyperparameter. Lowering the threshold to 0.3 increases recall (catch more positives) at the cost of precision (more false alarms). Raising it to 0.7 increases precision (fewer false alarms) at the cost of recall. The ROC curve plots recall vs (1−specificity) for every possible threshold. The AUC (area under the ROC curve) summarizes the classifier\'s ability to rank positives above negatives — 0.5 is random, 1.0 is perfect, independent of threshold choice.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Sigmoid + cross-entropy = the output layer of every classification neural network',
        body: 'The logistic regression update rule:\n\n∂L/∂w = (1/n)·Σ(p − y)·x\n\nis identical to the linear regression update rule, just with p = σ(wᵀx+b).\n\nEvery neural network trained for binary classification ends with a sigmoid activation and binary cross-entropy loss. For multi-class, it ends with softmax and categorical cross-entropy. Logistic regression IS the final layer of a neural network with no hidden layers.',
      },
      {
        type: 'procedure',
        title: 'Choosing precision vs recall: the medical test analogy',
        steps: [
          'Identify the cost of false positives (predicting positive when actually negative)',
          'Identify the cost of false negatives (predicting negative when actually positive)',
          'If false positives are costly (spam filters, fraud alerts, content moderation): maximize precision',
          'If false negatives are costly (cancer screening, defect detection, security): maximize recall',
          'If both matter equally: use F1 score as your optimization target',
          'Adjust the classification threshold (not just the model) to tune the precision/recall tradeoff',
        ],
      },
      {
        type: 'warning',
        title: 'Accuracy is almost always the wrong metric',
        body: 'If your dataset has 99% class 0 and 1% class 1:\n- A model that always predicts class 0 gets 99% accuracy\n- Its recall for class 1 is 0% (misses every positive)\n- Its F1 score is 0.0\n\nAlways check class distribution before choosing a metric. For imbalanced datasets: use F1, precision, recall, or AUC-ROC. Report per-class metrics. Never optimize for accuracy alone.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Logistic Regression',
        mathBridge: 'σ(z) = 1/(1+e^(−z)). Loss = −(1/n)Σ[y·log(p) + (1−y)·log(1−p)]. Gradients: ∂L/∂w = (1/n)Σ(p−y)·x.',
        caption: 'Build logistic regression with sigmoid and cross-entropy from scratch, implement the full confusion matrix / F1 metrics, and extend to softmax for 3-class classification.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Logistic regression from scratch',
              prose: [
                'The sigmoid squashes any number into (0, 1). The model is p = σ(w·x + b). The loss is binary cross-entropy: −[y·log(p) + (1−y)·log(1−p)].',
                'The gradient update is ∂L/∂w = (1/n)·Σ(p−y)·x. Note: (p−y) is the prediction error, same structure as linear regression.',
                'Generate two Gaussian clouds (class 0 at center (2,2), class 1 at center (5,5)) and watch the model learn to separate them.',
              ],
              code: `import random
import math

random.seed(42)

def sigmoid(z):
    z = max(-500, min(500, z))
    return 1.0 / (1.0 + math.exp(-z))

# Generate two-class data: class 0 near (2,2), class 1 near (5,5)
N = 200
X, y = [], []
for _ in range(N // 2):
    X.append([random.gauss(2, 1), random.gauss(2, 1)])
    y.append(0)
for _ in range(N // 2):
    X.append([random.gauss(5, 1), random.gauss(5, 1)])
    y.append(1)

pairs = list(zip(X, y))
random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]

split = int(0.8 * N)
X_tr, X_te = X[:split], X[split:]
y_tr, y_te = y[:split], y[split:]

# Logistic regression: weights for 2 features + bias
w = [0.0, 0.0]
b = 0.0
lr = 0.1
n = len(y_tr)

for epoch in range(1000):
    # Forward pass
    probs = [sigmoid(w[0]*x[0] + w[1]*x[1] + b) for x in X_tr]
    # Loss: binary cross-entropy
    loss = -sum(yi * math.log(max(pi, 1e-15)) + (1-yi) * math.log(max(1-pi, 1e-15))
                for yi, pi in zip(y_tr, probs)) / n
    # Gradients: dL/dw = (1/n)*sum((p-y)*x)
    errors = [p - yi for p, yi in zip(probs, y_tr)]
    dw0 = sum(e * x[0] for e, x in zip(errors, X_tr)) / n
    dw1 = sum(e * x[1] for e, x in zip(errors, X_tr)) / n
    db  = sum(errors) / n
    w[0] -= lr * dw0
    w[1] -= lr * dw1
    b    -= lr * db
    if epoch % 200 == 0:
        preds = [1 if sigmoid(w[0]*x[0]+w[1]*x[1]+b) >= 0.5 else 0 for x in X_tr]
        acc = sum(p==yi for p, yi in zip(preds, y_tr)) / n
        print(f"  epoch {epoch:4d} | loss={loss:.4f} | train_acc={acc:.3f}")

# Test accuracy
probs_te = [sigmoid(w[0]*x[0] + w[1]*x[1] + b) for x in X_te]
preds_te = [1 if p >= 0.5 else 0 for p in probs_te]
test_acc = sum(p==yi for p, yi in zip(preds_te, y_te)) / len(y_te)
print(f"\\nTest accuracy: {test_acc:.4f}")
print(f"Weights: w=[{w[0]:.4f}, {w[1]:.4f}]  b={b:.4f}")
print(f"Decision boundary: {w[0]:.4f}*x1 + {w[1]:.4f}*x2 + {b:.4f} = 0")`,
            },
            {
              id: 2,
              cellTitle: 'Confusion matrix and precision/recall/F1',
              prose: [
                'Accuracy alone misleads. A confusion matrix breaks predictions into four categories: TP (correctly predicted positive), TN (correctly predicted negative), FP (false alarm), FN (missed positive).',
                'Precision = TP/(TP+FP): how trustworthy are your positive predictions? Recall = TP/(TP+FN): what fraction of actual positives did you find? F1 = harmonic mean of both.',
                'See how the threshold changes the tradeoff: lowering it catches more positives (recall up) but creates more false alarms (precision down).',
              ],
              code: `import random
import math

random.seed(42)

def sigmoid(z):
    z = max(-500, min(500, z))
    return 1.0 / (1.0 + math.exp(-z))

# Reuse trained weights from cell 1 (approximate values after convergence)
w = [1.85, 1.85]
b = -13.9

# Regenerate test data
N = 200
X, y = [], []
for _ in range(N // 2):
    X.append([random.gauss(2, 1), random.gauss(2, 1)]); y.append(0)
for _ in range(N // 2):
    X.append([random.gauss(5, 1), random.gauss(5, 1)]); y.append(1)
pairs = list(zip(X, y)); random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]
X_te, y_te = X[160:], y[160:]

def get_metrics(y_true, y_pred):
    tp = sum(1 for a,p in zip(y_true, y_pred) if a==1 and p==1)
    tn = sum(1 for a,p in zip(y_true, y_pred) if a==0 and p==0)
    fp = sum(1 for a,p in zip(y_true, y_pred) if a==0 and p==1)
    fn = sum(1 for a,p in zip(y_true, y_pred) if a==1 and p==0)
    prec   = tp/(tp+fp) if (tp+fp) > 0 else 0.0
    recall = tp/(tp+fn) if (tp+fn) > 0 else 0.0
    f1     = 2*prec*recall/(prec+recall) if (prec+recall) > 0 else 0.0
    acc    = (tp+tn)/(tp+tn+fp+fn)
    return tp, tn, fp, fn, acc, prec, recall, f1

probs_te = [sigmoid(w[0]*x[0] + w[1]*x[1] + b) for x in X_te]

# Threshold tuning table
print(f"{'Threshold':>10} {'Acc':>7} {'Prec':>7} {'Recall':>8} {'F1':>7}")
print("-" * 45)
for t in [0.2, 0.3, 0.5, 0.7, 0.8]:
    preds = [1 if p >= t else 0 for p in probs_te]
    tp,tn,fp,fn, acc,prec,recall,f1 = get_metrics(y_te, preds)
    print(f"{t:>10.1f} {acc:>7.3f} {prec:>7.3f} {recall:>8.3f} {f1:>7.3f}")

# Confusion matrix at threshold 0.5
preds05 = [1 if p >= 0.5 else 0 for p in probs_te]
tp,tn,fp,fn, acc,prec,recall,f1 = get_metrics(y_te, preds05)
print(f"\\nConfusion matrix at threshold=0.5:")
print(f"              Predicted 0   Predicted 1")
print(f"  Actual 0       {tn:4d}          {fp:4d}   (TN / FP)")
print(f"  Actual 1       {fn:4d}          {tp:4d}   (FN / TP)")
print(f"\\nLowering threshold: recall goes up (catch more), precision goes down (more false alarms)")`,
            },
            {
              id: 3,
              cellTitle: 'Softmax regression for 3 classes',
              prose: [
                'Softmax extends logistic regression to k classes. Each class gets its own weight vector. Scores z_k = w_k·x + b_k. Softmax: p_k = exp(z_k) / Σexp(z_j). Probabilities sum to 1.',
                'The gradient for class k is (p_k − 1{y=k}) — prediction error for that class. Loss is categorical cross-entropy: −log(p_{true_class}).',
                'Three Gaussian clouds at (1,1), (5,1), (3,5) — watch the model learn three separate decision boundaries simultaneously.',
              ],
              code: `import random
import math

random.seed(42)

def softmax(scores):
    m = max(scores)
    exps = [math.exp(s - m) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

# 3-class dataset: centers at (1,1), (5,1), (3,5)
centers = [(1,1), (5,1), (3,5)]
X3, y3 = [], []
for label, (cx, cy) in enumerate(centers):
    for _ in range(50):
        X3.append([random.gauss(cx, 0.8), random.gauss(cy, 0.8)])
        y3.append(label)
pairs = list(zip(X3, y3)); random.shuffle(pairs)
X3, y3 = [p[0] for p in pairs], [p[1] for p in pairs]
split = 120
X_tr3, y_tr3 = X3[:split], y3[:split]
X_te3, y_te3 = X3[split:], y3[split:]

# Weights: 3 classes × 2 features + bias per class
W = [[0.0, 0.0] for _ in range(3)]
B = [0.0, 0.0, 0.0]
lr, n = 0.1, len(y_tr3)

for epoch in range(2000):
    total_loss = 0.0
    dW = [[0.0, 0.0] for _ in range(3)]
    dB = [0.0, 0.0, 0.0]
    for i in range(n):
        scores = [W[k][0]*X_tr3[i][0] + W[k][1]*X_tr3[i][1] + B[k] for k in range(3)]
        probs  = softmax(scores)
        total_loss -= math.log(max(probs[y_tr3[i]], 1e-15))
        for k in range(3):
            err = probs[k] - (1.0 if y_tr3[i] == k else 0.0)
            dW[k][0] += err * X_tr3[i][0]
            dW[k][1] += err * X_tr3[i][1]
            dB[k]    += err
    for k in range(3):
        W[k][0] -= lr * dW[k][0] / n
        W[k][1] -= lr * dW[k][1] / n
        B[k]    -= lr * dB[k]    / n
    if epoch % 400 == 0:
        print(f"  epoch {epoch:4d} | loss={total_loss/n:.4f}")

def predict3(x):
    scores = [W[k][0]*x[0] + W[k][1]*x[1] + B[k] for k in range(3)]
    probs = softmax(scores)
    return probs.index(max(probs)), probs

train_acc = sum(predict3(x)[0] == yi for x, yi in zip(X_tr3, y_tr3)) / len(y_tr3)
test_acc  = sum(predict3(x)[0] == yi for x, yi in zip(X_te3, y_te3)) / len(y_te3)
print(f"\\nTrain accuracy: {train_acc:.4f}  Test accuracy: {test_acc:.4f}")
print("\\nSample predictions:")
for i in range(5):
    pred, probs = predict3(X_te3[i])
    print(f"  true={y_te3[i]} pred={pred} probs=[{', '.join(f'{p:.3f}' for p in probs)}]")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: 'Build the ROC curve from scratch. For 50 threshold values from 0.01 to 0.99, compute the true positive rate (TPR = recall) and false positive rate (FPR = FP/(FP+TN)) on the binary test set. Print a text table of threshold, TPR, and FPR. Then calculate the AUC using the trapezoidal rule: AUC = sum of (FPR[i+1]-FPR[i]) * (TPR[i]+TPR[i+1]) / 2 for sorted thresholds. A perfect classifier has AUC = 1.0, random has AUC = 0.5.',
              starterCode: `import random
import math

random.seed(42)

def sigmoid(z):
    z = max(-500, min(500, z))
    return 1.0 / (1.0 + math.exp(-z))

# Train a quick logistic regression on binary data
N = 200
X, y = [], []
for _ in range(N // 2):
    X.append([random.gauss(2,1), random.gauss(2,1)]); y.append(0)
for _ in range(N // 2):
    X.append([random.gauss(5,1), random.gauss(5,1)]); y.append(1)
pairs = list(zip(X,y)); random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]
X_te, y_te = X[160:], y[160:]
w = [1.85, 1.85]; b = -13.9   # pre-trained weights

probs_te = [sigmoid(w[0]*x[0] + w[1]*x[1] + b) for x in X_te]

# TODO: for 50 thresholds from 0.01 to 0.99:
#   compute TPR = TP/(TP+FN) and FPR = FP/(FP+TN) at each threshold
#   store as two parallel lists

# TODO: compute AUC with the trapezoidal rule
# Sort by FPR first, then sum trapezoids

# TODO: print 10 representative rows (threshold, FPR, TPR)
# and print the final AUC value
`,
              hint: 'Use thresholds = [0.01 + i*0.02 for i in range(50)]. For each: predictions = [1 if p >= t else 0 for p in probs_te], count TP/TN/FP/FN, compute TPR and FPR. Sort the (FPR, TPR) pairs by FPR before computing the trapezoidal sum.',
              testCode: `try:
    assert 'auc' in dir(), "Define a variable named 'auc' for the area under the ROC curve"
    assert isinstance(auc, float), "auc should be a float"
    assert 0.5 <= auc <= 1.0, f"AUC={auc:.4f} should be between 0.5 and 1.0 for a trained classifier"
    print(f"PASS: AUC = {auc:.4f}")
    if auc > 0.95:
        print("  Excellent discrimination — model strongly separates the two classes")
    elif auc > 0.8:
        print("  Good discrimination")
    else:
        print("  Weak discrimination — check your threshold / TPR / FPR calculations")
except AssertionError as e:
    print(f"FAIL: {e}")`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What is the output range of the sigmoid function?',
      options: [
        'Negative infinity to positive infinity',
        'Strictly between 0 and 1',
        '−1 to 1',
        '0 to positive infinity',
      ],
      answer: 'Strictly between 0 and 1',
      hints: [
        'σ(z) = 1/(1+e^(−z)). As z → +∞, e^(−z) → 0 so σ → 1. As z → −∞, e^(−z) → ∞ so σ → 0.',
        'The sigmoid never actually reaches 0 or 1 — only approaches them asymptotically',
      ],
      reviewSection: 'The Sigmoid Function',
    },
    {
      type: 'choice',
      question: 'Why is logistic regression called "regression" if it is used for classification?',
      options: [
        'It predicts continuous values that are then rounded to 0 or 1',
        'The name comes from the logistic (sigmoid) function it uses, not from regression analysis',
        'It was originally designed for regression problems',
        'It minimizes mean squared error like linear regression',
      ],
      answer: 'The name comes from the logistic (sigmoid) function it uses, not from regression analysis',
      hints: [
        'The "logistic" in logistic regression refers to the logistic function (sigmoid), not to a type of regression',
        'The algorithm outputs probabilities (which are continuous) and then thresholds them for classification',
      ],
      reviewSection: 'Logistic Regression Model',
    },
    {
      type: 'choice',
      question: 'Why is binary cross-entropy used instead of MSE for logistic regression?',
      options: [
        'Cross-entropy is faster to compute',
        'MSE with sigmoid creates a non-convex cost surface with local minima; cross-entropy is convex',
        'MSE can only be used with linear models',
        'Cross-entropy works only when the dataset is balanced',
      ],
      answer: 'MSE with sigmoid creates a non-convex cost surface with local minima; cross-entropy is convex',
      hints: [
        'MSE composed with the sigmoid function is no longer a simple bowl — it has bumps that gradient descent can get stuck in',
        'Binary cross-entropy with sigmoid is provably convex — one global minimum, gradient descent guaranteed to find it',
      ],
      reviewSection: 'Binary Cross-Entropy Loss',
    },
    {
      type: 'choice',
      question: 'A cancer screening model has precision = 0.95 and recall = 0.60. What does this mean in practice?',
      options: [
        '95% of all patients are correctly classified, and 60% of cancers are caught',
        'When it flags cancer, it is right 95% of the time, but it only catches 60% of actual cancers',
        '60% of flagged patients have cancer, and 95% of all cancers are caught',
        'The model is 95% accurate on test data and 60% on training data',
      ],
      answer: 'When it flags cancer, it is right 95% of the time, but it only catches 60% of actual cancers',
      hints: [
        'Precision = TP/(TP+FP): of all positive predictions, how many are true',
        'Recall = TP/(TP+FN): of all actual positives, how many did the model find',
      ],
      reviewSection: 'Precision and Recall',
    },
    {
      type: 'choice',
      question: 'In softmax regression for 4 classes, what is true about the four output values?',
      options: [
        'Each class gets an independent probability between 0 and 1',
        'The four probabilities sum to 1, and the class with the highest probability is the prediction',
        'Only the top-2 classes receive nonzero probabilities',
        'The outputs are raw scores, not probabilities',
      ],
      answer: 'The four probabilities sum to 1, and the class with the highest probability is the prediction',
      hints: [
        'Softmax: p_k = exp(z_k) / Σexp(z_j). The denominator ensures the outputs sum to 1.',
        'The predicted class is argmax(p_k) — the class with the highest probability',
      ],
      reviewSection: 'Softmax for Multi-Class Classification',
    },
  ],
}
