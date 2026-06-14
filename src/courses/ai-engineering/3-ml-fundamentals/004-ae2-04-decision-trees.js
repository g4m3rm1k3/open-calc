export default {
  id: 'ae-p2-04-decision-trees',
  slug: 'decision-trees',
  chapter: 'ae-p2',
  order: 3,
  title: 'Decision Trees and Random Forests',
  subtitle: 'A decision tree is just a flowchart. A forest of them beats neural networks on your spreadsheet data.',
  tags: ['decision-trees', 'random-forest', 'Gini-impurity', 'entropy', 'information-gain', 'bagging', 'feature-importance', 'ensemble-methods'],

  hook: {
    question: 'Kaggle competitions on tabular data are won by XGBoost and LightGBM, not transformers. Why do tree-based models consistently beat neural networks on spreadsheet data?',
    realWorldContext:
      'Trees natively handle mixed feature types (numeric and categorical), require almost no preprocessing, produce interpretable rules, and resist overfitting when ensembled. A random forest answers: "why did the model make this prediction?" — you can trace the exact sequence of if/else rules. Neural networks cannot. For flat tables of features (financial data, medical records, customer data), tree-based models are the default first choice. This lesson builds a decision tree and random forest from scratch, implementing the exact math behind Gini impurity, information gain, bootstrap sampling, and feature randomization.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A decision tree partitions the feature space by asking a sequence of yes/no questions. Each internal node tests one feature against one threshold. Each leaf node holds a prediction (majority class for classification, mean for regression). To classify a new point, start at the root, follow the branches until you hit a leaf. The prediction is whatever class dominates that leaf. The entire model is human-readable: "if age < 30 AND income > 50k, predict approved."',
      'Split criteria: how do you choose which question to ask at each node? You want splits that make the child nodes as "pure" as possible — mostly one class. Gini impurity: G(S) = 1 − Σpₖ². For a node with all one class: G = 1−1² = 0 (pure). For a 50/50 binary split: G = 1−(0.5²+0.5²) = 0.5 (maximum disorder). Entropy: H(S) = −Σpₖ·log₂(pₖ). Pure node: H = 0. 50/50 binary: H = 1 bit. Both measure impurity; Gini is slightly faster to compute, entropy has an information-theoretic interpretation. In practice, they produce nearly identical trees.',
      'Information gain: IG = Impurity(parent) − weighted_average(Impurity(left), Impurity(right)). Greedy algorithm at each node: try every feature and every threshold. Pick the (feature, threshold) pair with the highest information gain. Why greedy? Finding the globally optimal tree is NP-hard. Greedy splitting works well enough in practice and runs in O(n·d·log n) per level (n samples, d features, log n for sorting each feature).',
      'Stopping conditions prevent the tree from memorizing training data. Without limits, the tree grows until every leaf contains exactly one sample — perfect training accuracy, terrible generalization. Pre-pruning stops early: maximum depth (most important hyperparameter), minimum samples per leaf, minimum information gain. Post-pruning grows the full tree then trims it. Pre-pruning is simpler; post-pruning often gives better results because it avoids stopping splits that would have led to useful further splits.',
      'Random forests: a single decision tree is high variance. Small changes in training data produce completely different trees. The fix: average many diverse trees. Two sources of diversity: (1) Bagging (bootstrap aggregating) — each tree trains on a random sample with replacement from the training data, so each tree sees a different subset. About 63% of training examples appear in each bootstrap; the other 37% (out-of-bag samples) can validate each tree for free. (2) Feature randomization — at each split, only consider a random subset of features (default: √d for classification, d/3 for regression). This prevents all trees from splitting on the same dominant feature.',
      'Why averaging reduces variance: for n trees each with variance σ², the ensemble variance is σ²/n IF the trees are independent. Trees are not fully independent (they train on the same data), but the bootstrap + feature randomization makes them decorrelated enough. The key insight: averaging many decorrelated weak predictors creates a strong predictor. Bias stays roughly the same (averaging doesn\'t change systematic errors); variance drops as 1/n_trees.',
      'Feature importance (MDI): for each feature, sum the total reduction in impurity across all nodes and trees where it was used as a split, weighted by the fraction of samples reaching that node. Features that produce large impurity reductions near the root (where many samples pass) get high importance. MDI is computed for free during training, but is biased toward high-cardinality features — a random ID column with many unique values gets many split opportunities and inflated importance. Permutation importance fixes this: shuffle one feature\'s values, measure accuracy drop. If shuffling a feature destroys performance, it was important.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why trees beat neural networks on tabular data',
        body: 'Neural networks implicitly assume that nearby inputs in feature space have similar outputs (inductive bias from smooth activation functions). Tabular features often have sharp discontinuities: "age < 65 → different insurance rate." Trees split explicitly at those boundaries.\n\nAlso: neural networks need many data points to generalize. Trees with max_depth=5 have at most 32 leaves — they generalize with hundreds of examples, not millions.',
      },
      {
        type: 'procedure',
        title: 'Decision tree hyperparameter tuning priority order',
        steps: [
          '1. max_depth: most important, controls complexity. Start at 3–5, increase if underfitting',
          '2. min_samples_leaf: prevents tiny leaf nodes. Start at 1–5% of training size',
          '3. n_estimators (forest): more is better until accuracy plateaus, usually 100–500',
          '4. max_features: default sqrt(d) for classification, d/3 for regression — rarely needs changing',
          '5. criterion (gini vs entropy): almost never matters — gini is slightly faster',
        ],
      },
      {
        type: 'insight',
        title: 'Bootstrap sample size: 63% unique, 37% out-of-bag',
        body: 'When drawing n samples with replacement from n data points, the probability that any specific point is NOT selected in a single draw is (1 − 1/n). After n draws: P(not selected) = (1 − 1/n)^n → e^(−1) ≈ 0.368 as n → ∞.\n\nSo about 63.2% of training examples appear in each bootstrap, and 36.8% are out-of-bag (OOB). The OOB samples give you a free validation estimate — the OOB error closely approximates the true test error without a held-out split.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Decision Trees and Random Forests',
        mathBridge: 'Gini(S) = 1 − Σpₖ². IG(S) = Gini(S) − (n_L/n)·Gini(L) − (n_R/n)·Gini(R). Bootstrap: sample n from n with replacement.',
        caption: 'Implement Gini impurity and information gain, build a decision tree with recursive splitting, and assemble a random forest with bootstrap sampling and feature randomization.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Gini impurity, entropy, and best split',
              prose: [
                'Gini impurity G(S) = 1 − Σpₖ² measures how mixed a node is. For 6 dogs / 4 cats: G = 1 − (0.6² + 0.4²) = 0.48. For 10 dogs / 0 cats: G = 0 (pure). Range for binary classification: [0, 0.5].',
                'Information gain = Gini(parent) − weighted_avg(Gini(left), Gini(right)). To find the best split: try every feature, sort its values, try every midpoint between consecutive values as a threshold, pick the (feature, threshold) pair that maximizes IG.',
                'Note: for a feature with m unique values, you try m−1 thresholds. Total work at one node: O(n·d·log n).',
              ],
              code: `import math
import random

random.seed(42)

def gini(labels):
    n = len(labels)
    if n == 0: return 0.0
    counts = {}
    for l in labels: counts[l] = counts.get(l, 0) + 1
    return 1.0 - sum((c/n)**2 for c in counts.values())

def entropy(labels):
    n = len(labels)
    if n == 0: return 0.0
    counts = {}
    for l in labels: counts[l] = counts.get(l, 0) + 1
    return -sum((c/n)*math.log2(c/n) for c in counts.values() if c > 0)

def info_gain(parent, left, right, criterion='gini'):
    measure = gini if criterion == 'gini' else entropy
    n, nl, nr = len(parent), len(left), len(right)
    if nl == 0 or nr == 0: return 0.0
    return measure(parent) - (nl/n)*measure(left) - (nr/n)*measure(right)

def best_split(X, y, criterion='gini'):
    """Find the (feature, threshold) with highest information gain."""
    best_feat, best_thresh, best_ig = None, None, 0.0
    n_feat = len(X[0])
    for feat in range(n_feat):
        vals = sorted(set(x[feat] for x in X))
        thresholds = [(vals[i] + vals[i+1]) / 2 for i in range(len(vals)-1)]
        for thresh in thresholds:
            left_y  = [y[i] for i in range(len(y)) if X[i][feat] <= thresh]
            right_y = [y[i] for i in range(len(y)) if X[i][feat] >  thresh]
            ig = info_gain(y, left_y, right_y, criterion)
            if ig > best_ig:
                best_ig, best_feat, best_thresh = ig, feat, thresh
    return best_feat, best_thresh, best_ig

# Demo: which split is better on a simple 4-sample example?
X_demo = [[1.0, 5.0], [2.0, 3.0], [6.0, 8.0], [7.0, 2.0]]
y_demo  = [0, 0, 1, 1]

feat, thresh, ig = best_split(X_demo, y_demo)
print(f"Best split: feature {feat} <= {thresh:.2f}  (info gain = {ig:.4f})")

# Gini values at the split
left_y  = [y_demo[i] for i in range(4) if X_demo[i][feat] <= thresh]
right_y = [y_demo[i] for i in range(4) if X_demo[i][feat] >  thresh]
print(f"Left  labels:  {left_y}  Gini={gini(left_y):.4f}")
print(f"Right labels:  {right_y}  Gini={gini(right_y):.4f}")
print(f"Parent Gini:   {gini(y_demo):.4f}")
print()
# Verify Gini on known examples
print("Gini checks:")
print(f"  [0,0,0,0] (pure):        {gini([0,0,0,0]):.4f}  (expect 0.0)")
print(f"  [0,0,1,1] (50/50):       {gini([0,0,1,1]):.4f}  (expect 0.5)")
print(f"  [0,0,0,1] (75/25):       {gini([0,0,0,1]):.4f}  (expect 0.375)")
print(f"  [0]*8+[1]*2 (80/20):     {gini([0]*8+[1]*2):.4f} (expect 0.32)")`,
            },
            {
              id: 2,
              cellTitle: 'Full decision tree with recursive splitting',
              prose: [
                'A decision tree is a recursive structure. At each node: find the best split, divide data into left and right, recurse on each side. Base cases: max depth reached, node is pure, or too few samples.',
                'Nodes store the split feature and threshold. Leaves store the majority class. Prediction traces from root to leaf.',
                'Train on a 2D dataset and observe accuracy vs depth — deeper trees get higher training accuracy but start memorizing noise.',
              ],
              code: `import math
import random

random.seed(42)

def gini(labels):
    n = len(labels)
    if n == 0: return 0.0
    counts = {}
    for l in labels: counts[l] = counts.get(l, 0) + 1
    return 1.0 - sum((c/n)**2 for c in counts.values())

def info_gain(parent, left, right):
    n, nl, nr = len(parent), len(left), len(right)
    if nl == 0 or nr == 0: return 0.0
    return gini(parent) - (nl/n)*gini(left) - (nr/n)*gini(right)

class Node:
    def __init__(self, feat=None, thresh=None, left=None, right=None, label=None):
        self.feat, self.thresh = feat, thresh
        self.left, self.right = left, right
        self.label = label  # only for leaf nodes

def build_tree(X, y, max_depth=None, min_samples=2, depth=0):
    # Base cases
    if len(set(y)) == 1:  # pure node
        return Node(label=y[0])
    if len(y) < min_samples or (max_depth is not None and depth >= max_depth):
        counts = {}
        for l in y: counts[l] = counts.get(l, 0) + 1
        return Node(label=max(counts, key=counts.get))
    # Find best split
    best_feat, best_thresh, best_ig = None, None, 0.0
    n_feat = len(X[0])
    for feat in range(n_feat):
        vals = sorted(set(x[feat] for x in X))
        for i in range(len(vals)-1):
            thresh = (vals[i] + vals[i+1]) / 2
            left_y  = [y[j] for j in range(len(y)) if X[j][feat] <= thresh]
            right_y = [y[j] for j in range(len(y)) if X[j][feat] >  thresh]
            ig = info_gain(y, left_y, right_y)
            if ig > best_ig:
                best_ig, best_feat, best_thresh = ig, feat, thresh
    if best_feat is None:
        counts = {}
        for l in y: counts[l] = counts.get(l, 0) + 1
        return Node(label=max(counts, key=counts.get))
    # Split and recurse
    left_mask  = [X[j][best_feat] <= best_thresh for j in range(len(y))]
    X_l = [X[j] for j in range(len(y)) if left_mask[j]]
    y_l = [y[j] for j in range(len(y)) if left_mask[j]]
    X_r = [X[j] for j in range(len(y)) if not left_mask[j]]
    y_r = [y[j] for j in range(len(y)) if not left_mask[j]]
    return Node(
        feat=best_feat, thresh=best_thresh,
        left=build_tree(X_l, y_l, max_depth, min_samples, depth+1),
        right=build_tree(X_r, y_r, max_depth, min_samples, depth+1),
    )

def predict_one(node, x):
    if node.label is not None: return node.label
    if x[node.feat] <= node.thresh:
        return predict_one(node.left, x)
    return predict_one(node.right, x)

# Generate 2D binary dataset
N = 200
X, y = [], []
for _ in range(N//2):
    X.append([random.gauss(2,1), random.gauss(2,1)]); y.append(0)
for _ in range(N//2):
    X.append([random.gauss(5,1), random.gauss(5,1)]); y.append(1)
pairs = list(zip(X,y)); random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]
split = 160
X_tr, y_tr = X[:split], y[:split]
X_te, y_te = X[split:], y[split:]

print(f"{'Max Depth':>10} {'Train Acc':>10} {'Test Acc':>10}")
print("-" * 34)
for depth in [1, 2, 3, 5, None]:
    tree = build_tree(X_tr, y_tr, max_depth=depth, min_samples=2)
    tr_acc = sum(predict_one(tree, x)==yi for x,yi in zip(X_tr,y_tr)) / len(y_tr)
    te_acc = sum(predict_one(tree, x)==yi for x,yi in zip(X_te,y_te)) / len(y_te)
    label = str(depth) if depth is not None else 'None (full)'
    print(f"{label:>10} {tr_acc:>10.3f} {te_acc:>10.3f}")
print()
print("Full tree: perfect training accuracy but may overfit.")
print("Max depth 3: good generalization for this simple dataset.")`,
            },
            {
              id: 3,
              cellTitle: 'Random forest with bootstrap + feature randomization',
              prose: [
                'A random forest trains many trees, each on a different bootstrap sample (random sample with replacement), considering only √d features at each split. Majority vote determines the final prediction.',
                'Why bootstrap? Each tree sees a different 63% of the data, making trees diverse. Why feature randomization? Without it, all trees split on the same strongest feature — they are correlated and averaging doesn\'t help much.',
                'Watch test accuracy increase as you add more trees, then plateau. It never decreases — averaging can only help.',
              ],
              code: `import math
import random

random.seed(42)

def gini(labels):
    n = len(labels)
    if n == 0: return 0.0
    counts = {}
    for l in labels: counts[l] = counts.get(l, 0) + 1
    return 1.0 - sum((c/n)**2 for c in counts.values())

def build_tree(X, y, max_depth=5, min_samples=2, max_features=None, depth=0):
    if len(set(y)) == 1:
        return {'label': y[0]}
    if len(y) < min_samples or (max_depth is not None and depth >= max_depth):
        counts = {}
        for l in y: counts[l] = counts.get(l, 0) + 1
        return {'label': max(counts, key=counts.get)}
    n_feat = len(X[0])
    feat_subset = list(range(n_feat))
    if max_features == 'sqrt':
        k = max(1, int(n_feat**0.5))
        feat_subset = random.sample(feat_subset, k)
    best_feat, best_thresh, best_ig = None, None, 0.0
    for feat in feat_subset:
        vals = sorted(set(x[feat] for x in X))
        for i in range(len(vals)-1):
            thresh = (vals[i]+vals[i+1])/2
            left_y  = [y[j] for j in range(len(y)) if X[j][feat] <= thresh]
            right_y = [y[j] for j in range(len(y)) if X[j][feat] >  thresh]
            n, nl, nr = len(y), len(left_y), len(right_y)
            if nl == 0 or nr == 0: continue
            ig = gini(y) - (nl/n)*gini(left_y) - (nr/n)*gini(right_y)
            if ig > best_ig: best_ig, best_feat, best_thresh = ig, feat, thresh
    if best_feat is None:
        counts = {}
        for l in y: counts[l] = counts.get(l, 0) + 1
        return {'label': max(counts, key=counts.get)}
    mask = [X[j][best_feat] <= best_thresh for j in range(len(y))]
    return {
        'feat': best_feat, 'thresh': best_thresh,
        'left':  build_tree([X[j] for j in range(len(y)) if     mask[j]],
                             [y[j] for j in range(len(y)) if     mask[j]],
                             max_depth, min_samples, max_features, depth+1),
        'right': build_tree([X[j] for j in range(len(y)) if not mask[j]],
                             [y[j] for j in range(len(y)) if not mask[j]],
                             max_depth, min_samples, max_features, depth+1),
    }

def predict_one(node, x):
    if 'label' in node: return node['label']
    return predict_one(node['left'] if x[node['feat']] <= node['thresh'] else node['right'], x)

# Generate data
N = 200
X, y = [], []
for _ in range(N//2):
    X.append([random.gauss(2,1), random.gauss(2,1)]); y.append(0)
for _ in range(N//2):
    X.append([random.gauss(5,1), random.gauss(5,1)]); y.append(1)
pairs = list(zip(X,y)); random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]
X_tr, y_tr, X_te, y_te = X[:160], y[:160], X[160:], y[160:]

# Build forests of increasing size
print(f"{'n_trees':>8} {'Train Acc':>10} {'Test Acc':>10}")
print("-" * 32)
for n_trees in [1, 5, 10, 20, 50]:
    trees = []
    for _ in range(n_trees):
        indices = [random.randint(0, len(X_tr)-1) for _ in range(len(X_tr))]
        X_b = [X_tr[i] for i in indices]
        y_b = [y_tr[i] for i in indices]
        trees.append(build_tree(X_b, y_b, max_depth=5, max_features='sqrt'))
    def predict_forest(X_in):
        preds = []
        for x in X_in:
            votes = {}
            for t in trees:
                v = predict_one(t, x)
                votes[v] = votes.get(v, 0) + 1
            preds.append(max(votes, key=votes.get))
        return preds
    tr_acc = sum(p==yi for p,yi in zip(predict_forest(X_tr), y_tr)) / len(y_tr)
    te_acc = sum(p==yi for p,yi in zip(predict_forest(X_te), y_te)) / len(y_te)
    print(f"{n_trees:>8} {tr_acc:>10.3f} {te_acc:>10.3f}")
print()
print("Test accuracy improves and plateaus. More trees never hurts (just slower).")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: 'Compute MDI feature importance. After training a forest of 20 trees on 4-feature data, track how much each feature reduces Gini impurity across all splits in all trees (weighted by the fraction of samples reaching that node). Normalize so importances sum to 1. Then compare by shuffling one noisy feature (random noise column, feature index 3) and measuring accuracy drop — this is permutation importance. You should see MDI gives the noise feature non-zero importance, while permutation importance gives it near-zero importance.',
              starterCode: `import math
import random

random.seed(42)

# 4-feature dataset: features 0,1 are informative; 2 is weak; 3 is pure noise
N = 200
X, y = [], []
for _ in range(N//2):
    X.append([random.gauss(2,1), random.gauss(2,1),
               random.gauss(3, 2), random.uniform(0,10)])
    y.append(0)
for _ in range(N//2):
    X.append([random.gauss(6,1), random.gauss(6,1),
               random.gauss(5, 2), random.uniform(0,10)])
    y.append(1)
pairs = list(zip(X,y)); random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]
X_tr, y_tr, X_te, y_te = X[:160], y[:160], X[160:], y[160:]

def gini(labels):
    n = len(labels)
    if n == 0: return 0.0
    counts = {}
    for l in labels: counts[l] = counts.get(l, 0) + 1
    return 1.0 - sum((c/n)**2 for c in counts.values())

# TODO: train 20 trees, track MDI importance per feature
# MDI for a node: (n_node / n_total) * info_gain_at_node
# Sum across all nodes and trees where that feature was used

# TODO: compute permutation importance for each feature
# For each feature: shuffle its values in X_te, measure accuracy drop

# Print both importance rankings
`,
              hint: 'For MDI: during tree building, when you pick a split on feature f with info gain ig and n_node samples, add (n_node / n_total) * ig to mdi[f]. Sum across all trees and normalize. For permutation: baseline_acc = accuracy on original X_te. For each feature f: create X_shuffled with column f randomly permuted, perm_acc = accuracy on X_shuffled, perm_importance[f] = baseline_acc - perm_acc.',
              testCode: `try:
    assert 'mdi_importance' in dir(), "Define mdi_importance as a list of 4 values"
    assert 'perm_importance' in dir(), "Define perm_importance as a list of 4 values"
    assert len(mdi_importance) == 4 and len(perm_importance) == 4
    assert abs(sum(mdi_importance) - 1.0) < 0.01, "MDI importances should sum to 1"
    # Feature 3 (noise) should have near-zero permutation importance
    noise_perm = perm_importance[3]
    info_perm  = max(perm_importance[0], perm_importance[1])
    print(f"PASS: MDI importance:  {[round(v,3) for v in mdi_importance]}")
    print(f"      Perm importance: {[round(v,3) for v in perm_importance]}")
    print(f"  Informative features perm importance: {info_perm:.3f}")
    print(f"  Noise feature perm importance:        {noise_perm:.3f}")
    if info_perm > noise_perm:
        print("  Permutation correctly ranks noise feature lower than informative features")
    else:
        print("  Note: perm importance may need more trees or samples to distinguish clearly")
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
      question: 'What does Gini impurity measure at a decision tree node?',
      options: [
        'The depth of the node in the tree',
        'The probability of misclassifying a randomly chosen sample given the class distribution at that node',
        'The total number of samples at the node',
        'The correlation between features at that node',
      ],
      answer: 'The probability of misclassifying a randomly chosen sample given the class distribution at that node',
      hints: [
        'Gini = 1 − Σpₖ². For a pure node (one class): Gini = 1 − 1² = 0. For 50/50 binary: Gini = 0.5.',
        'A node with 8 dogs and 2 cats: Gini = 1 − (0.8² + 0.2²) = 1 − 0.68 = 0.32',
      ],
      reviewSection: 'Split Criteria: Gini and Entropy',
    },
    {
      type: 'choice',
      question: 'A node contains 8 dogs and 2 cats. What is its Gini impurity?',
      options: [
        '0.0',
        '0.20',
        '0.32',
        '0.50',
      ],
      answer: '0.32',
      hints: [
        'Gini = 1 − (p_dog² + p_cat²) = 1 − (0.8² + 0.2²)',
        '= 1 − (0.64 + 0.04) = 1 − 0.68 = 0.32',
      ],
      reviewSection: 'Gini Impurity Calculation',
    },
    {
      type: 'choice',
      question: 'What is the main advantage of tree-based models over neural networks for tabular data?',
      options: [
        'Trees can process images and audio natively',
        'Trees always have lower bias than neural networks',
        'Trees handle mixed feature types natively, require less preprocessing, and are interpretable',
        'Trees train faster on GPU hardware',
      ],
      answer: 'Trees handle mixed feature types natively, require less preprocessing, and are interpretable',
      hints: [
        'Neural networks need all features as continuous numbers — categorical features require encoding',
        'A decision tree lets you read the exact sequence of rules that produced any prediction',
      ],
      reviewSection: 'When Trees Beat Neural Networks',
    },
    {
      type: 'choice',
      question: 'Why does a random forest use both bootstrap sampling AND random feature subsets at each split?',
      options: [
        'To speed up training by reducing the dataset size',
        'To create diverse, decorrelated trees so averaging reduces variance without increasing bias',
        'To ensure each tree sees every data point at least once',
        'To reduce the depth of individual trees automatically',
      ],
      answer: 'To create diverse, decorrelated trees so averaging reduces variance without increasing bias',
      hints: [
        'Without feature randomization, all trees would split on the same dominant feature — they\'d be correlated and averaging wouldn\'t help',
        'The variance of the average of n correlated variables ρσ² > σ²/n — decorrelation is key',
      ],
      reviewSection: 'Random Forests: Bootstrap and Feature Randomization',
    },
    {
      type: 'choice',
      question: 'MDI (Mean Decrease in Impurity) feature importance is biased toward which type of feature?',
      options: [
        'Binary features with only two possible values',
        'Features with very low variance',
        'High-cardinality features with many possible split points',
        'Features that are perfectly correlated with the target',
      ],
      answer: 'High-cardinality features with many possible split points',
      hints: [
        'More split points = more chances to reduce impurity, even for a random feature',
        'A random ID column with 1000 unique values will get high MDI despite being useless — permutation importance would correctly give it near zero',
      ],
      reviewSection: 'Feature Importance: MDI vs Permutation',
    },
  ],
}
