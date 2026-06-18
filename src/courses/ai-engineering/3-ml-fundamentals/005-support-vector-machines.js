export default {
  id: 'ae-p2-05-svms',
  slug: 'support-vector-machines',
  chapter: 'ae-p2',
  order: 4,
  title: 'Support Vector Machines',
  subtitle: 'Find the widest street between two classes. The math behind SVMs is the most elegant in all of ML.',
  tags: ['SVM', 'support-vectors', 'margin', 'hinge-loss', 'kernel-trick', 'RBF-kernel', 'soft-margin', 'C-parameter'],

  hook: {
    question: 'Infinitely many lines could separate two classes of data. Which one should you choose? And why does the answer — the one with the widest gap — generalize better to new data?',
    realWorldContext:
      'Support Vector Machines were the dominant classification algorithm before deep learning. They still outperform neural networks on small datasets, high-dimensional data (gene expression, text), and problems where you need theoretical guarantees. The maximum margin principle has a clear geometric interpretation: a wider street between classes means you can perturb points further before misclassifying them. The kernel trick — one of the most clever ideas in all of ML — lets SVMs learn curved boundaries without ever computing in the high-dimensional space. This lesson builds an SVM from scratch using hinge loss and gradient descent, then demonstrates how kernels change what boundaries are learnable.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The maximum margin principle: given two linearly separable classes, infinitely many hyperplanes separate them. The SVM picks the one that maximizes the margin — the distance between the hyperplane and the nearest point on each side. Formal: the distance from point xᵢ to hyperplane wᵀx + b = 0 is |wᵀxᵢ + b| / ‖w‖. The margin is 2/‖w‖ when we normalize so that the closest points satisfy |wᵀxᵢ + b| = 1. Maximizing 2/‖w‖ is equivalent to minimizing ‖w‖²/2.',
      'Support vectors are the training points that sit exactly on the margin boundaries, where yᵢ·(wᵀxᵢ + b) = 1. They are the only points that determine the hyperplane. All other points are irrelevant — move or remove any non-support-vector and the decision boundary does not change. This has a beautiful practical consequence: at prediction time you only need to store the support vectors, not the full training set. The number of support vectors also bounds the generalization error: fewer support vectors relative to dataset size → better generalization.',
      'Soft margin (the C parameter): real data is rarely perfectly separable. The soft margin formulation introduces slack variables ξᵢ ≥ 0 that allow points to violate the margin. The objective becomes: minimize (1/2)‖w‖² + C·Σξᵢ. C controls the tradeoff: large C penalizes violations heavily → narrow margin, fits training data closely, risks overfitting. Small C allows violations → wide margin, more misclassifications, better generalization. C is the regularization strength, inverted relative to most other algorithms.',
      'Hinge loss: the soft margin SVM can be written as unconstrained minimization: L(w,b) = (λ/2)‖w‖² + (1/n)·Σmax(0, 1 − yᵢ·(wᵀxᵢ+b)). The term max(0, 1 − y·f(x)) is the hinge loss. It is zero when the point is correctly classified beyond the margin (y·f(x) ≥ 1). It grows linearly when the point is inside the margin or wrong. Compare to logistic loss: logistic is smooth and never exactly zero (all points contribute). Hinge is exactly zero for most points (only support vectors contribute). This sparsity is what makes SVMs efficient.',
      'Gradient descent for hinge loss. The subgradient: if yᵢ·(wᵀxᵢ+b) ≥ 1: ∂L/∂w = λw (only regularization). If yᵢ·(wᵀxᵢ+b) < 1: ∂L/∂w = λw − yᵢxᵢ (regularization minus the corrective signal). Update: w ← w − η·(∂L/∂w). This is called the primal formulation. It runs in O(n·d) per epoch and works well for large, high-dimensional, sparse data like text.',
      'The kernel trick: the SVM dual formulation (from Lagrangian duality / KKT conditions) only involves dot products xᵢ·xⱼ between training points. Key insight: replace every dot product with K(xᵢ, xⱼ) = φ(xᵢ)·φ(xⱼ) where φ maps to a higher-dimensional feature space. The polynomial kernel K(x,z) = (x·z + c)ᵈ computes degree-d polynomial feature interactions in O(d) time instead of O(dᵈ). The RBF (Gaussian) kernel K(x,z) = exp(−γ‖x−z‖²) corresponds to infinite-dimensional features — it can represent any smooth boundary. The trick: you never compute φ(x) explicitly. You compute K(xᵢ,xⱼ) directly, which is a dot product in the high-dimensional space achieved without going there.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why maximum margin generalizes: the geometry argument',
        body: 'Imagine your decision boundary is a line. If you draw a circle of radius r around any test point, every point inside the circle must be classified the same way. The maximum margin hyperplane maximizes this "safety radius" — the minimum distance between the boundary and any training point.\n\nFormal result: the expected test error is bounded by O(R²/margin²) where R is the radius of the smallest ball containing the data. Maximizing the margin minimizes this bound.',
      },
      {
        type: 'procedure',
        title: 'Choosing the right SVM kernel',
        steps: [
          'Start with linear kernel: works for high-dimensional sparse data (text, genetics)',
          'Try RBF kernel if data is not linearly separable: K(x,z) = exp(-γ||x-z||²)',
          'Tune C and gamma together: C controls margin/error tradeoff, gamma controls locality of RBF',
          'Large gamma: each training point has very local influence (risk of overfitting)',
          'Small gamma: smooth, global boundaries (risk of underfitting)',
          'Use cross-validation grid search over C=[0.01, 0.1, 1, 10] and gamma=[0.01, 0.1, 1, 10]',
        ],
      },
      {
        type: 'warning',
        title: 'Feature scaling is required for SVMs',
        body: 'SVMs use distance (‖w‖²) and dot products. If one feature ranges 0–1 and another 0–1000, the second feature dominates all distances and dot products.\n\nAlways standardize features to zero mean and unit variance before training an SVM. Unlike decision trees, SVMs are not scale-invariant.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Support Vector Machines',
        mathBridge: 'Hinge loss: max(0, 1−y·f(x)). SVM objective: (λ/2)‖w‖² + (1/n)Σhinge. Gradient: λw − yᵢxᵢ when violated.',
        caption: 'Implement linear SVM with hinge loss via gradient descent, identify support vectors, and visualize how the C parameter controls the margin-error tradeoff.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Linear SVM with hinge loss and gradient descent',
              prose: [
                'The SVM objective is (λ/2)‖w‖² + (1/n)·Σmax(0, 1−yᵢ·(wᵀxᵢ+b)). Labels must be ±1 (not 0/1).',
                'The subgradient for each training point: if yᵢ·(wᵀxᵢ+b) ≥ 1, the point is beyond the margin — only regularization applies. If < 1, the corrective term −yᵢxᵢ also applies.',
                'After training, identify support vectors: points where yᵢ·(wᵀxᵢ+b) < 1.05 (within or near the margin). Only these points determine the boundary.',
              ],
              code: `import random
import math

random.seed(42)

# Generate binary data: labels in {-1, +1}
N = 100
X, y = [], []
for _ in range(N//2):
    X.append([random.gauss(1, 0.8), random.gauss(1, 0.8)]); y.append(-1)
for _ in range(N//2):
    X.append([random.gauss(4, 0.8), random.gauss(4, 0.8)]); y.append(1)
pairs = list(zip(X,y)); random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]

# Standardize
means = [sum(x[j] for x in X)/N for j in range(2)]
stds  = [(sum((x[j]-means[j])**2 for x in X)/N)**0.5 for j in range(2)]
X = [[(x[j]-means[j])/stds[j] for j in range(2)] for x in X]

split = 80
X_tr, y_tr, X_te, y_te = X[:split], y[:split], X[split:], y[split:]

# SVM training: hinge loss + L2 regularization
lam = 0.001   # regularization lambda (corresponds to C = 1/lambda)
lr  = 0.01
w   = [0.0, 0.0]
b   = 0.0
n   = len(y_tr)

for epoch in range(2000):
    dw = [lam * w[j] for j in range(2)]  # regularization gradient always
    db = 0.0
    total_hinge = 0.0
    for i in range(n):
        margin = y_tr[i] * (w[0]*X_tr[i][0] + w[1]*X_tr[i][1] + b)
        if margin < 1:  # point is inside margin or wrong: add corrective term
            dw[0] -= y_tr[i] * X_tr[i][0] / n
            dw[1] -= y_tr[i] * X_tr[i][1] / n
            db    -= y_tr[i] / n
            total_hinge += (1 - margin)
    w[0] -= lr * dw[0]
    w[1] -= lr * dw[1]
    b    -= lr * db
    if epoch % 400 == 0:
        loss = (lam/2)*(w[0]**2+w[1]**2) + total_hinge/n
        print(f"  epoch {epoch:4d} | loss={loss:.4f} | w=[{w[0]:.3f},{w[1]:.3f}]")

# Identify support vectors (inside or on the margin)
support_vectors = [(X_tr[i], y_tr[i])
                   for i in range(n)
                   if y_tr[i]*(w[0]*X_tr[i][0]+w[1]*X_tr[i][1]+b) < 1.05]

# Test accuracy
preds = [1 if w[0]*x[0]+w[1]*x[1]+b >= 0 else -1 for x in X_te]
acc   = sum(p==yi for p,yi in zip(preds, y_te)) / len(y_te)
print(f"\\nTest accuracy: {acc:.4f}")
print(f"Support vectors: {len(support_vectors)} / {n} training points")
print(f"Margin width ≈ 2/‖w‖ = {2 / (w[0]**2+w[1]**2)**0.5:.4f}")`,
            },
            {
              id: 2,
              cellTitle: 'The C parameter: margin vs error tradeoff',
              prose: [
                'The C parameter controls the tradeoff between margin width and training errors. Large C: penalize every violation heavily → narrow margin, fewer errors, risk of overfitting. Small C: allow violations → wide margin, more training errors, better generalization.',
                'Note: in the hinge loss formulation, C ≈ 1/λ. Larger C = smaller λ = less regularization. This is the OPPOSITE of most regularization hyperparameters.',
                'Sweep C values and watch how training accuracy, test accuracy, and support vector count change.',
              ],
              code: `import random
import math

random.seed(42)

def train_svm(X_tr, y_tr, C=1.0, lr=0.01, epochs=1500):
    lam = 1.0 / C   # regularization = 1/C
    n = len(y_tr)
    w = [0.0, 0.0]; b = 0.0
    for epoch in range(epochs):
        dw = [lam * w[j] for j in range(2)]
        db = 0.0
        for i in range(n):
            margin = y_tr[i] * (w[0]*X_tr[i][0] + w[1]*X_tr[i][1] + b)
            if margin < 1:
                dw[0] -= y_tr[i] * X_tr[i][0] / n
                dw[1] -= y_tr[i] * X_tr[i][1] / n
                db    -= y_tr[i] / n
        w[0] -= lr * dw[0]; w[1] -= lr * dw[1]; b -= lr * db
    return w, b

def accuracy(X, y, w, b):
    preds = [1 if w[0]*x[0]+w[1]*x[1]+b >= 0 else -1 for x in X]
    return sum(p==yi for p,yi in zip(preds, y)) / len(y)

def n_support(X_tr, y_tr, w, b):
    return sum(1 for i in range(len(y_tr))
               if y_tr[i]*(w[0]*X_tr[i][0]+w[1]*X_tr[i][1]+b) < 1.05)

# Slightly overlapping classes to make C matter
N = 120
X, y = [], []
for _ in range(N//2):
    X.append([random.gauss(0, 1.2), random.gauss(0, 1.2)]); y.append(-1)
for _ in range(N//2):
    X.append([random.gauss(2, 1.2), random.gauss(2, 1.2)]); y.append(1)
pairs = list(zip(X,y)); random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]
means = [sum(x[j] for x in X)/N for j in range(2)]
stds  = [(sum((x[j]-means[j])**2 for x in X)/N)**0.5 for j in range(2)]
X = [[(x[j]-means[j])/stds[j] for j in range(2)] for x in X]
X_tr, y_tr, X_te, y_te = X[:96], y[:96], X[96:], y[96:]

print(f"{'C':>8} {'Train Acc':>10} {'Test Acc':>10} {'Support Vecs':>14} {'Margin':>8}")
print("-" * 55)
for C in [0.01, 0.1, 1, 10, 100]:
    w, b = train_svm(X_tr, y_tr, C=C)
    tr_acc = accuracy(X_tr, y_tr, w, b)
    te_acc = accuracy(X_te, y_te, w, b)
    nsv    = n_support(X_tr, y_tr, w, b)
    margin = 2 / (w[0]**2 + w[1]**2)**0.5 if (w[0]**2+w[1]**2) > 0 else 0
    print(f"{C:>8.2f} {tr_acc:>10.3f} {te_acc:>10.3f} {nsv:>14d} {margin:>8.3f}")

print()
print("Small C: wide margin, more support vectors, allows errors.")
print("Large C: narrow margin, fewer support vectors, fits training data tightly.")`,
            },
            {
              id: 3,
              cellTitle: 'The kernel trick: learning nonlinear boundaries',
              prose: [
                'A linear SVM fails on data with a curved boundary (e.g., two concentric circles). The kernel trick replaces every dot product with K(xᵢ, xⱼ), computing the similarity in a high-dimensional space without going there.',
                'RBF kernel: K(x,z) = exp(−γ‖x−z‖²). Points close in input space have K ≈ 1 (very similar in feature space). Points far apart have K ≈ 0 (orthogonal). Gamma controls locality: large γ = tight neighborhoods, small γ = broad similarity.',
                'This demo uses a kernelized prediction (1-NN SVM approximation) to show the difference between linear and RBF decision surfaces.',
              ],
              code: `import random
import math

random.seed(42)

# Concentric circles: linear SVM fails, kernel SVM succeeds
N = 160
X_c, y_c = [], []
for _ in range(N//2):
    angle = random.uniform(0, 2*math.pi)
    r = random.gauss(1.0, 0.15)          # inner circle: radius ~1
    X_c.append([r*math.cos(angle), r*math.sin(angle)]); y_c.append(-1)
for _ in range(N//2):
    angle = random.uniform(0, 2*math.pi)
    r = random.gauss(3.0, 0.15)          # outer circle: radius ~3
    X_c.append([r*math.cos(angle), r*math.sin(angle)]); y_c.append(1)
pairs = list(zip(X_c, y_c)); random.shuffle(pairs)
X_c, y_c = [p[0] for p in pairs], [p[1] for p in pairs]
X_tr_c, y_tr_c = X_c[:128], y_c[:128]
X_te_c, y_te_c = X_c[128:], y_c[128:]

def rbf_kernel(x1, x2, gamma=0.5):
    dist_sq = sum((a-b)**2 for a,b in zip(x1,x2))
    return math.exp(-gamma * dist_sq)

def linear_kernel(x1, x2):
    return sum(a*b for a,b in zip(x1,x2))

# Kernel SVM prediction: use kernel-weighted nearest-neighbor vote (approximation)
# Real kernel SVM uses SMO or QP — this demo shows the geometry
def kernel_predict(X_tr, y_tr, X_te, kernel_fn, n_support=30):
    """Use top-n support vectors (by margin violation heuristic) to predict."""
    preds = []
    for x_test in X_te:
        scores = [kernel_fn(x_test, x_tr) * yi for x_tr, yi in zip(X_tr, y_tr)]
        vote   = sum(scores)
        preds.append(1 if vote >= 0 else -1)
    return preds

def accuracy(preds, y_true):
    return sum(p==yi for p,yi in zip(preds, y_true)) / len(y_true)

print("Comparing linear vs RBF kernel on concentric circles:")
print()

# Linear kernel
lin_preds = kernel_predict(X_tr_c, y_tr_c, X_te_c, linear_kernel)
print(f"Linear kernel accuracy:       {accuracy(lin_preds, y_te_c):.3f}")
print(f"  (Expected ~0.5 — linear SVM cannot separate circles)")
print()

# RBF kernel with different gamma
for gamma in [0.1, 0.5, 2.0]:
    rbf_fn = lambda x1, x2, g=gamma: rbf_kernel(x1, x2, g)
    rbf_preds = kernel_predict(X_tr_c, y_tr_c, X_te_c, rbf_fn)
    print(f"RBF kernel (gamma={gamma:.1f}) accuracy: {accuracy(rbf_preds, y_te_c):.3f}")

print()
print("RBF maps to infinite dimensions — can learn any smooth curved boundary.")
print("Gamma controls locality: large gamma = each point only similar to nearby points.")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: 'Implement multi-class SVM using one-vs-rest (OVR). For k classes, train k binary SVMs: classifier j is trained with class j as +1 and all other classes as -1. At prediction time, run all k SVMs and predict the class whose SVM gives the highest score (wᵀx + b). Train on a 3-class dataset (three Gaussian clusters) and compute per-class accuracy.',
              starterCode: `import random
import math

random.seed(42)

def train_svm_binary(X_tr, y_tr, C=1.0, lr=0.01, epochs=1500):
    """Train binary SVM. y_tr contains only +1 and -1."""
    lam = 1.0 / C
    n = len(y_tr)
    w = [0.0] * len(X_tr[0]); b = 0.0
    for epoch in range(epochs):
        dw = [lam * w[j] for j in range(len(w))]
        db = 0.0
        for i in range(n):
            margin = y_tr[i] * (sum(w[j]*X_tr[i][j] for j in range(len(w))) + b)
            if margin < 1:
                for j in range(len(w)):
                    dw[j] -= y_tr[i] * X_tr[i][j] / n
                db -= y_tr[i] / n
        for j in range(len(w)):
            w[j] -= lr * dw[j]
        b -= lr * db
    return w, b

# 3-class dataset
N = 150
X3, y3 = [], []
centers = [(0,0), (5,0), (2.5, 4)]
for label, (cx,cy) in enumerate(centers):
    for _ in range(N//3):
        X3.append([random.gauss(cx,0.8), random.gauss(cy,0.8)]); y3.append(label)
pairs = list(zip(X3,y3)); random.shuffle(pairs)
X3, y3 = [p[0] for p in pairs], [p[1] for p in pairs]
# Standardize
means = [sum(x[j] for x in X3)/N for j in range(2)]
stds  = [(sum((x[j]-means[j])**2 for x in X3)/N)**0.5 for j in range(2)]
X3 = [[(x[j]-means[j])/stds[j] for j in range(2)] for x in X3]
X_tr3, y_tr3 = X3[:120], y3[:120]
X_te3, y_te3 = X3[120:], y3[120:]

# TODO: train 3 binary SVMs using one-vs-rest strategy
# For class k: y_binary = [1 if yi==k else -1 for yi in y_train]
# Store trained (w, b) for each class

# TODO: predict using OVR — return class with highest score
# score_k(x) = w_k^T x + b_k

# TODO: compute and print overall accuracy and per-class accuracy
`,
              hint: 'Train 3 SVMs: classifiers = [train_svm_binary(X_tr3, [1 if yi==k else -1 for yi in y_tr3]) for k in range(3)]. Predict: scores = [w@x + b for (w,b) in classifiers], predicted_class = argmax(scores). Per-class accuracy: count correct for each class k separately.',
              testCode: `try:
    assert 'classifiers' in dir(), "Define 'classifiers' as a list of (w, b) tuples for each class"
    assert len(classifiers) == 3, "Need 3 classifiers for 3 classes"
    def predict_ovr(x, classifiers):
        scores = [sum(w[j]*x[j] for j in range(len(w))) + b for w, b in classifiers]
        return scores.index(max(scores))
    preds = [predict_ovr(x, classifiers) for x in X_te3]
    overall_acc = sum(p==yi for p,yi in zip(preds, y_te3)) / len(y_te3)
    assert overall_acc > 0.7, f"Overall accuracy {overall_acc:.3f} is too low (expected >0.7)"
    print(f"PASS: OVR SVM overall accuracy = {overall_acc:.4f}")
    for k in range(3):
        class_mask = [i for i in range(len(y_te3)) if y_te3[i] == k]
        class_acc  = sum(preds[i]==k for i in class_mask) / len(class_mask)
        print(f"  Class {k} accuracy: {class_acc:.3f} ({len(class_mask)} test samples)")
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
      question: 'What are support vectors in an SVM?',
      options: [
        'All data points in the training set',
        'The training points closest to the decision boundary that determine the hyperplane',
        'The feature vectors after kernel transformation',
        'The weight vectors learned during training',
      ],
      answer: 'The training points closest to the decision boundary that determine the hyperplane',
      hints: [
        'Support vectors sit exactly on the margin boundaries where yᵢ·(wᵀxᵢ+b) = 1',
        'Only support vectors determine the hyperplane — remove any other point and the boundary is unchanged',
      ],
      reviewSection: 'Maximum Margin Classifier',
    },
    {
      type: 'choice',
      question: 'What happens when you increase the C parameter in an SVM?',
      options: [
        'The margin gets wider and more misclassifications are allowed',
        'The margin gets narrower, fewer misclassifications are tolerated, and the model may overfit',
        'The kernel function changes from linear to RBF automatically',
        'The number of support vectors always decreases',
      ],
      answer: 'The margin gets narrower, fewer misclassifications are tolerated, and the model may overfit',
      hints: [
        'Large C = heavily penalize margin violations → the model squeezes the margin tighter to avoid errors',
        'Remember: C ≈ 1/λ, so large C = small λ = less regularization — the opposite of λ in ridge regression',
      ],
      reviewSection: 'Soft Margin and the C Parameter',
    },
    {
      type: 'choice',
      question: 'How does the kernel trick enable SVMs to learn nonlinear boundaries?',
      options: [
        'It replaces the SVM with a neural network that can learn nonlinear functions',
        'It computes dot products in a high-dimensional feature space without explicitly constructing that space',
        'It removes outliers from the dataset before training',
        'It adds polynomial features to the input data as a preprocessing step',
      ],
      answer: 'It computes dot products in a high-dimensional feature space without explicitly constructing that space',
      hints: [
        'The SVM dual only requires dot products xᵢ·xⱼ. Replace with K(xᵢ,xⱼ) = φ(xᵢ)·φ(xⱼ) without computing φ explicitly.',
        'The RBF kernel corresponds to infinite-dimensional features — no finite mapping exists, yet K(x,z) = exp(−γ‖x−z‖²) is O(d) to compute',
      ],
      reviewSection: 'The Kernel Trick',
    },
    {
      type: 'choice',
      question: 'Hinge loss is zero when y · f(x) ≥ 1. What does this mean about that data point?',
      options: [
        'The point is misclassified',
        'The point is correctly classified and lies outside the margin boundary',
        'The point is exactly on the decision boundary',
        'The point is a noise sample that should be ignored',
      ],
      answer: 'The point is correctly classified and lies outside the margin boundary',
      hints: [
        'y·f(x) ≥ 1 means the point is on the correct side AND far enough from the boundary (beyond the margin)',
        'Only points where y·f(x) < 1 contribute to hinge loss — these are inside the margin or wrong',
      ],
      reviewSection: 'Hinge Loss',
    },
    {
      type: 'choice',
      question: 'You train an SVM on 10,000 examples. At test time, which data do you need to store for predictions?',
      options: [
        'All 10,000 training examples',
        'Only the support vectors (typically much fewer than 10,000)',
        'A compressed version of all 10,000 examples',
        'The kernel matrix of all pairwise similarities',
      ],
      answer: 'Only the support vectors (typically much fewer than 10,000)',
      hints: [
        'Non-support-vector points have zero weight (α = 0) in the dual formulation — they do not affect predictions',
        'The prediction is sign(Σ αᵢyᵢK(xᵢ,x)) summed only over support vectors',
      ],
      reviewSection: 'Support Vectors Are the Critical Few',
    },
  ],
}
