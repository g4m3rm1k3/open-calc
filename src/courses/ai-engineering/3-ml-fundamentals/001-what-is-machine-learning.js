export default {
  id: 'ae-p2-01-what-is-ml',
  slug: 'what-is-machine-learning',
  chapter: 'ae-p2',
  order: 0,
  title: 'What Is Machine Learning',
  subtitle: 'Machine learning is teaching computers to find patterns in data instead of writing rules by hand.',
  tags: ['machine-learning', 'supervised-learning', 'unsupervised-learning', 'reinforcement-learning', 'classification', 'regression', 'overfitting'],

  hook: {
    question: 'You build a spam filter with hundreds of hand-written rules. Spammers change their wording. You rewrite the rules. This cycle never ends. How does machine learning break it?',
    realWorldContext:
      'Machine learning flips the programming model: instead of writing rules, you give the computer thousands of labeled examples and let it discover the rules. Every recommendation engine, voice assistant, self-driving car, and language model works this way. The core shift is from "programmer specifies logic" to "algorithm infers logic from data." The model that comes out of training IS the rules, encoded as numbers (weights). It generalizes from examples it has seen to make predictions on data it has never seen.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Traditional programming: rules + data → output. Machine learning: data + desired outputs → rules (the model). The model encodes whatever patterns the algorithm found in the training data. When spammers change tactics, you retrain on new data instead of rewriting code. This difference — learning vs programming — is why ML scales to problems where the rules are too complex or too numerous to write by hand: recognizing faces in photos, understanding speech, predicting which protein a drug molecule will bind to.',
      'Three types of ML. Supervised learning: you have input-output pairs. The model learns to map inputs to correct outputs. Classification ("is this spam or not?") and regression ("what will this house sell for?") are both supervised. Unsupervised learning: inputs only, no labels. The model finds structure — clusters, patterns, compressed representations — on its own. Reinforcement learning: an agent takes actions in an environment and receives rewards or penalties. It learns a strategy (policy) to maximize total reward. Most production ML uses supervised learning. Unsupervised learning is common for preprocessing and exploration. RL powers game AI, robotics, and RLHF (the technique used to align language models with human preferences).',
      'Beyond the big three. Semi-supervised learning uses a small labeled set and a large unlabeled set (common in medical imaging where labels are expensive). Self-supervised learning creates supervision from the data itself — masked language modeling (BERT hides words and predicts them), next-token prediction (GPT predicts the next word), contrastive learning (SimCLR trains on two augmented views of the same image). These are technically supervised (the model predicts something) but labels are generated automatically. GPT-style language models are self-supervised — every text document on the internet becomes a training example with zero human labeling.',
      'Classification vs regression. Classification: discrete output categories — is this email spam or not? What digit is this? Is this skin lesion malignant? Loss function: cross-entropy. Metric: accuracy, precision, recall, F1. Regression: continuous numeric output — what will this house sell for? How long will this battery last? What is tomorrow\'s temperature? Loss function: mean squared error (MSE) or mean absolute error (MAE). Metric: R², RMSE. The same problem can often be framed either way: predicting whether a stock goes up or down is classification; predicting the exact price is regression.',
      'The ML workflow: collect data → clean and explore (this takes 60–80% of project time) → feature engineering (transforming raw data into useful inputs) → split into train/validation/test sets → train model → evaluate → iterate → deploy → monitor. The test set is sacred — you only look at it once, at the very end, to get an unbiased estimate of real-world performance. Using the test set during development leads to optimistic results that do not hold in production. Train/validation/test is typically 70/15/15 or 80/10/10 depending on dataset size.',
      'When NOT to use ML. Celsius to Fahrenheit is a fixed formula — ML adds complexity with no benefit. Systems where you need 100% interpretable, auditable decisions (some financial regulations). Real-time control systems with hard latency constraints. Problems where you have fewer than ~100 labeled examples (usually better off with rule-based systems). ML is not the right tool when the rules are simple, fixed, and well-understood. It IS the right tool when the rules are too complex to write, when they change over time, or when they need to be discovered from data.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Overfitting vs underfitting',
        body: 'Overfitting: model performs well on training data, poorly on test data. Memorized noise instead of learning patterns. Fix: more data, regularization, simpler model, dropout.\n\nUnderfitting: model performs poorly on BOTH training and test data. Too simple to capture the pattern. Fix: more complex model, more features, less regularization.\n\nThe goal: a model that performs well on both — it generalizes. The train/test split is how you detect the difference.',
      },
      {
        type: 'procedure',
        title: 'The ML project checklist',
        steps: [
          'Frame the problem: is this classification, regression, or something else? What is success?',
          'Collect and understand the data: sources, volume, quality, distribution, missing values',
          'Establish a baseline: what does a simple rule-based approach achieve?',
          'Split into train/validation/test BEFORE any exploration (to prevent data leakage)',
          'Build a minimal working model first, then iterate',
          'Evaluate on validation set, tune, then final eval on test set (once only)',
        ],
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        type: 'PythonNotebook',
        cells: [
          {
            id: 1,
            prose: [
              'Implement a nearest centroid classifier from scratch — the simplest possible supervised classifier.',
              'Training: compute the mean (centroid) of each class. Prediction: assign the class whose centroid is closest to the input.',
              'This is supervised learning in its simplest form: the model learns from labeled examples (the centroids) and makes predictions on new data.',
            ],
            code: `import math
import random

random.seed(42)

def generate_2class_data(n_per_class=50):
    """Generate two classes of 2D points: class 0 centered at (1,1), class 1 at (4,4)."""
    data = []
    for label in range(2):
        cx = 1.0 + 3.0 * label
        cy = 1.0 + 3.0 * label
        for _ in range(n_per_class):
            x = cx + random.gauss(0, 0.8)
            y = cy + random.gauss(0, 0.8)
            data.append((x, y, label))
    random.shuffle(data)
    return data

class NearestCentroidClassifier:
    def __init__(self):
        self.centroids = {}

    def fit(self, X, y):
        """Compute the centroid (mean) of each class."""
        classes = set(y)
        for c in classes:
            class_pts = [X[i] for i in range(len(X)) if y[i] == c]
            n = len(class_pts)
            # centroid = mean of all points in this class
            cx = sum(pt[0] for pt in class_pts) / n
            cy = sum(pt[1] for pt in class_pts) / n
            self.centroids[c] = (cx, cy)

    def predict(self, point):
        """Return the class whose centroid is closest to the point."""
        best_class = None
        best_dist = float('inf')
        for c, (cx, cy) in self.centroids.items():
            dist = math.sqrt((point[0]-cx)**2 + (point[1]-cy)**2)
            if dist < best_dist:
                best_dist = dist
                best_class = c
        return best_class

# Generate data, split into train (80%) and test (20%)
data = generate_2class_data(50)
split = int(0.8 * len(data))
train, test = data[:split], data[split:]

X_train = [(d[0], d[1]) for d in train]
y_train = [d[2] for d in train]
X_test  = [(d[0], d[1]) for d in test]
y_test  = [d[2] for d in test]

# Train
clf = NearestCentroidClassifier()
clf.fit(X_train, y_train)

# Evaluate
correct = sum(1 for i in range(len(X_test)) if clf.predict(X_test[i]) == y_test[i])
accuracy = correct / len(y_test)

print(f"Trained on {len(X_train)} samples, tested on {len(X_test)}")
print(f"Learned centroids: class 0 = {tuple(round(v,2) for v in clf.centroids[0])}")
print(f"                   class 1 = {tuple(round(v,2) for v in clf.centroids[1])}")
print(f"Test accuracy: {accuracy:.2%}  ({correct}/{len(y_test)} correct)")
print("\\nThis IS supervised learning: the model learned from labeled data.")`,
          },
          {
            id: 2,
            prose: [
              'Train/test split and the overfitting trap: demonstrate why you need a separate test set.',
              'A memorization model achieves 100% training accuracy by simply storing every training example. But on new data, it performs no better than random.',
              'This is overfitting in its extreme form. The gap between training accuracy (100%) and test accuracy (~50%) is the signal that something is wrong.',
            ],
            code: `import random

random.seed(0)

def generate_binary_data(n=200, noise=0.2):
    """Generate binary classification: label = 1 if x > 0.5, else 0, with noise."""
    data = []
    for _ in range(n):
        x = random.random()
        true_label = 1 if x > 0.5 else 0
        # Flip label with probability 'noise'
        label = 1 - true_label if random.random() < noise else true_label
        data.append((x, label))
    return data

class MemorizationClassifier:
    """Overfits perfectly: memorizes all training examples."""
    def __init__(self, default_label=0):
        self.memory = {}
        self.default = default_label

    def fit(self, X, y):
        for xi, yi in zip(X, y):
            self.memory[xi] = yi   # store exact training point

    def predict(self, x):
        return self.memory.get(x, self.default)  # no memory = default guess

class ThresholdClassifier:
    """Learns a simple threshold."""
    def __init__(self):
        self.threshold = 0.5

    def fit(self, X, y):
        pass  # threshold is fixed at 0.5 (prior knowledge)

    def predict(self, x):
        return 1 if x > self.threshold else 0

data = generate_binary_data(200)
split = 160
X_train = [d[0] for d in data[:split]]
y_train = [d[1] for d in data[:split]]
X_test  = [d[0] for d in data[split:]]
y_test  = [d[1] for d in data[split:]]

# Memorization model
mem = MemorizationClassifier()
mem.fit(X_train, y_train)
train_acc = sum(1 for xi, yi in zip(X_train, y_train) if mem.predict(xi)==yi) / len(y_train)
test_acc  = sum(1 for xi, yi in zip(X_test, y_test)   if mem.predict(xi)==yi) / len(y_test)
print(f"Memorization model:  train={train_acc:.0%}  test={test_acc:.0%}  <-- OVERFITTING")

# Simple threshold model
thr = ThresholdClassifier()
thr.fit(X_train, y_train)
train_acc2 = sum(1 for xi, yi in zip(X_train, y_train) if thr.predict(xi)==yi) / len(y_train)
test_acc2  = sum(1 for xi, yi in zip(X_test, y_test)   if thr.predict(xi)==yi) / len(y_test)
print(f"Threshold model:     train={train_acc2:.0%}  test={test_acc2:.0%}  <-- GENERALIZES")
print()
print("The gap train-test reveals overfitting.")
print("The memorizer 'knows' all training answers but fails on new data.")`,
          },
          {
            id: 3,
            prose: [
              'The ML workflow in action: collect → split → train → evaluate → report. The golden rule: never touch the test set until the very end.',
              'Simulate running two different classifiers, using the VALIDATION set to pick between them, then report the FINAL result on the test set.',
              'If you had used the test set to choose between models, your reported accuracy would be optimistic — the model that happened to do best on that specific test set is not necessarily the best model.',
            ],
            code: `import random
import math

random.seed(99)

def make_dataset(n=300):
    data = []
    for _ in range(n):
        x = random.uniform(-3, 3)
        noise = random.gauss(0, 0.5)
        # True relationship: label = 1 if x > 0
        label = 1 if x + noise > 0 else 0
        data.append((x, label))
    return data

def accuracy(preds, labels):
    return sum(p==l for p,l in zip(preds,labels)) / len(labels)

def threshold_clf(data_X, threshold):
    return [1 if x > threshold else 0 for x in data_X]

# Collect and split (never look at test set until end)
data = make_dataset(300)
random.shuffle(data)
train_data  = data[:210]   # 70%
val_data    = data[210:255] # 15%
test_data   = data[255:]    # 15%

X_tr, y_tr = [d[0] for d in train_data], [d[1] for d in train_data]
X_va, y_va = [d[0] for d in val_data],   [d[1] for d in val_data]
X_te, y_te = [d[0] for d in test_data],  [d[1] for d in test_data]

# Try different thresholds on VALIDATION set only
print("Threshold tuning on VALIDATION set (not test):")
best_val_acc, best_threshold = 0, 0
for t in [-0.5, -0.25, 0.0, 0.25, 0.5]:
    val_acc = accuracy(threshold_clf(X_va, t), y_va)
    marker = " <-- selected" if val_acc > best_val_acc else ""
    print(f"  threshold={t:+.2f}  val_acc={val_acc:.3f}{marker}")
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        best_threshold = t

# Only now: evaluate the chosen model on test set
test_acc = accuracy(threshold_clf(X_te, best_threshold), y_te)
print(f"\\nFinal evaluation on TEST set (chosen threshold={best_threshold}):")
print(f"  Test accuracy: {test_acc:.3f}")
print("\\nThis is the unbiased estimate of real-world performance.")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement a k-nearest neighbors (k-NN) classifier. For prediction: find the k training examples closest to the query point (Euclidean distance), return the majority class among those k neighbors. Test with k = 1, 3, 5 on a generated 2-class dataset and report train accuracy and test accuracy for each k. Which k generalizes best?',
            starterCode: `import math
import random

random.seed(42)

def euclidean_distance(a, b):
    return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b)))

class KNNClassifier:
    def __init__(self, k=3):
        self.k = k
        self.X_train = []
        self.y_train = []

    def fit(self, X, y):
        self.X_train = X
        self.y_train = y

    def predict(self, x):
        """Return majority class among k nearest neighbors."""
        # TODO: compute distance from x to every training point
        # Sort by distance, take k nearest, return majority class
        pass

    def predict_all(self, X):
        return [self.predict(x) for x in X]

def accuracy(preds, labels):
    return sum(p==l for p,l in zip(preds,labels)) / len(labels)

# Generate data: class 0 near (1,1), class 1 near (4,4)
def gen_data(n=100):
    data = []
    for label in range(2):
        for _ in range(n):
            x = [1+3*label + random.gauss(0,1), 1+3*label + random.gauss(0,1)]
            data.append((x, label))
    random.shuffle(data)
    return data

data = gen_data(100)
split = int(0.8 * len(data))
X_tr = [d[0] for d in data[:split]]
y_tr = [d[1] for d in data[:split]]
X_te = [d[0] for d in data[split:]]
y_te = [d[1] for d in data[split:]]

# TODO: test k=1, 3, 5 and print train/test accuracy for each
`,
            hint: 'In predict: compute distances to all X_train points, sort by distance (use sorted with a key), take the first k, count class 0 and class 1 votes, return the class with more votes.',
            testCode: `try:
    for k in [1, 3, 5]:
        clf = KNNClassifier(k=k)
        clf.fit(X_tr, y_tr)
        test_pred = clf.predict_all(X_te)
        test_acc = accuracy(test_pred, y_te)
        assert 0 < test_acc <= 1.0
        print(f"k={k}: test_acc={test_acc:.3f}")
    print("PASS: k-NN works for k=1, 3, 5")
except Exception as e:
    print(f"FAIL: {e}")`,
          },
        ],
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'In supervised learning, what does the model receive during training?',
      options: [
        'Only input data with no labels',
        'Input-output pairs where the correct answer is provided',
        'A reward signal for each action taken',
        'A set of rules written by a human expert',
      ],
      answer: 'Input-output pairs where the correct answer is provided',
      hints: [
        '"Supervised" means a teacher provides the correct answers — the labels',
        'Unsupervised learning has no labels; reinforcement learning has reward signals but no direct correct answers',
      ],
      reviewSection: 'Three Types of ML',
    },
    {
      type: 'choice',
      question: 'What is the purpose of splitting data into training and test sets?',
      options: [
        'To make training faster by using less data',
        'To have backup data in case the training data is lost',
        'To evaluate whether the model generalizes to data it has never seen during training',
        'To balance the classes in the dataset',
      ],
      answer: 'To evaluate whether the model generalizes to data it has never seen during training',
      hints: [
        'If you evaluate on training data, you measure memorization, not learning',
        'The test set measures generalization — performance on data the model never saw during training',
      ],
      reviewSection: 'ML Workflow',
    },
    {
      type: 'choice',
      question: 'A model gets 98% accuracy on training data but 55% on test data. What is this an example of?',
      options: [
        'Underfitting: the model is too simple',
        'Overfitting: the model memorized training noise instead of learning general patterns',
        'Data drift: the test distribution changed',
        'Good generalization: the model learned the true patterns',
      ],
      answer: 'Overfitting: the model memorized training noise instead of learning general patterns',
      hints: [
        'A large gap (high train accuracy, low test accuracy) is the hallmark of overfitting',
        'Underfitting would show low accuracy on BOTH train and test',
      ],
      reviewSection: 'Overfitting vs Underfitting',
    },
    {
      type: 'choice',
      question: 'An e-commerce site wants to group customers into segments based on purchase behavior without any predefined labels. Which type of ML is this?',
      options: [
        'Supervised learning (classification)',
        'Supervised learning (regression)',
        'Unsupervised learning (clustering)',
        'Reinforcement learning',
      ],
      answer: 'Unsupervised learning (clustering)',
      hints: [
        'No predefined labels means no supervision — the model must find structure on its own',
        'Finding natural groupings is clustering, a form of unsupervised learning',
      ],
      reviewSection: 'Three Types of ML',
    },
    {
      type: 'choice',
      question: 'Which scenario is NOT a good use case for machine learning?',
      options: [
        'Predicting customer churn from historical behavior data',
        'Detecting fraudulent transactions in a stream of millions of payments',
        'Converting temperatures from Celsius to Fahrenheit',
        'Classifying images of skin lesions as benign or malignant',
      ],
      answer: 'Converting temperatures from Celsius to Fahrenheit',
      hints: [
        'F = 9/5 · C + 32 is a fixed, well-defined formula — no learning needed',
        'ML is the right tool when rules are complex, unknown, or need to be discovered from data',
      ],
      reviewSection: 'When Not to Use ML',
    },
  ],
}
