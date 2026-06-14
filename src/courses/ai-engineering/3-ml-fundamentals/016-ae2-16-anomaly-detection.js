const lesson = {
  id: 'ae2-16',
  slug: 'anomaly-detection',
  chapter: 'ae-p2',
  order: 15,
  title: 'Anomaly Detection',
  subtitle: 'Learn what normal looks like — then flag anything that doesn\'t fit',
  tags: ['anomaly-detection', 'isolation-forest', 'zscore', 'outliers', 'unsupervised'],
  hook: {
    question: 'A credit card is used in New York at 2pm, then in Tokyo at 2:05pm. How do you automatically catch this without labeled fraud examples?',
    realWorldContext: 'Fraud makes up 0.1% of transactions. Equipment failures happen a few times per year. You cannot train a standard classifier because there is almost nothing in the "anomaly" class. Instead, learn what normal looks like — then flag deviations. This is anomaly detection.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `Anomaly detection flips the classification framing. Instead of learning what is abnormal, learn what is normal. Anything that deviates from normal is suspicious. This works without labels, adapts to new types of anomalies (tomorrow's fraud scheme looks different from today's), and scales to massive datasets.`,
      `Three types of anomalies: Point anomalies — a single value unusual regardless of context (a temperature reading of 500°F). Contextual anomalies — a value unusual given its context (90°F in January is anomalous; in July it's normal). Collective anomalies — a sequence unusual as a group, even if each point is individually normal (50 consecutive login failures).`,
      `Z-score method: z = (x − μ) / σ. Flag any point with |z| > threshold (default 3.0). Simple, fast, interpretable — "this value is 4.5 standard deviations from normal." Weaknesses: assumes Gaussian distribution, fails on multimodal or skewed data, sensitive to outliers in training data (which shift μ and inflate σ).`,
      `IQR method: lower = Q₁ − 1.5 × IQR, upper = Q₃ + 1.5 × IQR. Flag anything outside these bounds. More robust than Z-score because percentiles are not affected by extreme values. Works on skewed distributions. But still univariate — can't catch anomalies that are unusual only in the joint feature space.`,
      `Isolation Forest: the key insight is that anomalies are few and different. In a random partitioning of the data, anomalies are easier to isolate — they need fewer random splits to be separated from the rest. Normal points live in dense regions; many splits are needed to isolate one from its neighbors. The algorithm: build many random trees, at each node pick a random feature and a random split, keep splitting until each point is isolated. Anomaly score = 2^(−avg_path_length / c(n)) where c(n) is the expected path length for n samples. Score near 1 = anomaly. Score near 0.5 = normal.`,
      `Local Outlier Factor (LOF) detects local anomalies. It computes the local density around each point (how tightly packed are its k neighbors?), then compares that density to the density of the point's neighbors. LOF score ≈ 1 means similar density as neighbors (normal). LOF ≫ 1 means much lower density than neighbors (anomaly). LOF catches points that are unusual in their local neighborhood even if they wouldn't be flagged globally.`,
      `Evaluation is harder than for classifiers. With 0.1% anomalies, a detector that always says "normal" gets 99.9% accuracy. Use Precision@k (of the top k flagged items, how many are real anomalies?), AUPRC (area under precision-recall curve — baseline equals the anomaly rate, not 0.5), and F1/MCC on any labeled subset.`,
    ],
    callouts: [
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: a dataset has two 2D clusters. Most points are in a dense central cluster; 5% are scattered in a sparse outer ring. Which method will flag the outer ring: Z-score, IQR, or Isolation Forest? Predict: which method fails if the "normal" cluster isn't Gaussian-shaped?`,
      },
      {
        type: 'info',
        title: 'Choosing a Threshold — Business Decision, Not Technical',
        body: `Fraud detection: missing fraud costs $500 (chargeback + trust). False alarm costs 5 minutes of analyst time → set threshold LOW. Equipment failure: false alarm means $50K shutdown. Missed failure means $500K repair. Set threshold to balance costs explicitly. Plot precision-recall at each threshold, overlay the cost curve, pick the minimum.`,
      },
      {
        type: 'warning',
        title: 'Anomaly Detection Evaluation Traps',
        body: `(1) Never report accuracy — "normal" baseline gives 99.9%+. (2) AUROC can look great even when the model misses almost all anomalies at practical thresholds because the huge TN count inflates it. Use AUPRC instead. (3) Contamination parameter in sklearn sets the threshold but doesn\'t change scores — always inspect the score distribution before choosing contamination.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Anomaly Detection Toolkit',
        mathBridge: `Z-score: z = (x−μ)/σ. IQR: [Q₁−1.5·IQR, Q₃+1.5·IQR]. Isolation Forest: score = 2^(−path_len/c(n)), c(n)=2H(n-1)−2(n-1)/n. LOF: lrd_ratio = mean(lrd_neighbors)/lrd_point.`,
        caption: 'Implement Z-score, IQR, and Isolation Forest from scratch, compare on multivariate data, evaluate with precision@k.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Z-Score and IQR Detectors',
              prose: [
                `Z-score flags any sample where at least one feature exceeds k standard deviations from the mean. IQR flags any sample where at least one feature is outside [Q₁ − 1.5·IQR, Q₃ + 1.5·IQR].`,
                `We demonstrate both on a 2D dataset with a main Gaussian cluster and 5% outliers injected at the periphery. We also test multimodal data (two clusters) to show where Z-score fails.`,
                `Z-score failure mode: when data has two separate clusters, the mean falls between them. The std spans both clusters. Points between the clusters get low Z-scores even though they are not from either cluster.`,
              ],
              code: `import numpy as np

def zscore_detect(X, threshold=3.0):
    mu, sigma = X.mean(0), X.std(0) + 1e-8
    z = np.abs((X - mu) / sigma)
    return z.max(1) > threshold, z.max(1)

def iqr_detect(X, factor=1.5):
    q1 = np.percentile(X, 25, axis=0)
    q3 = np.percentile(X, 75, axis=0)
    iqr = q3 - q1 + 1e-8
    outside = (X < q1 - factor*iqr) | (X > q3 + factor*iqr)
    score = np.maximum(
        np.abs(X - q1) / (q1 - (q1 - factor*iqr) + 1e-8),
        np.abs(X - q3) / ((q3 + factor*iqr) - q3 + 1e-8)
    )
    return outside.any(1), score.max(1)

rng = np.random.default_rng(0)
N = 300
# Normal cluster + 5% outliers
X_normal = rng.normal([0,0], 1.0, (int(N*0.95), 2))
X_outlier = rng.uniform([-5,-5], [5,5], (int(N*0.05), 2))
X_outlier = X_outlier[np.linalg.norm(X_outlier, axis=1) > 3]
X = np.vstack([X_normal, X_outlier[:int(N*0.05)]])
y_true = np.array([0]*int(N*0.95) + [1]*int(N*0.05))

def precision_at_k(scores, y_true, k=20):
    topk = np.argsort(scores)[-k:]
    return y_true[topk].mean()

zflags, zscores = zscore_detect(X)
iflags, iscores = iqr_detect(X)
zprec = precision_at_k(zscores, y_true, k=15)
iprec = precision_at_k(iscores, y_true, k=15)
print(f"Single Gaussian cluster:")
print(f"  Z-score  P@15={zprec:.3f}, flagged={zflags.sum()}")
print(f"  IQR      P@15={iprec:.3f}, flagged={iflags.sum()}")

# Multimodal data — Z-score will fail
X_mode1 = rng.normal([-3, 0], 0.5, (150, 2))
X_mode2 = rng.normal([ 3, 0], 0.5, (150, 2))
X_gap   = rng.uniform([-1.5, -0.5], [1.5, 0.5], (15, 2))  # points in the gap
X_multi = np.vstack([X_mode1, X_mode2, X_gap])
y_multi = np.array([0]*300 + [1]*15)

zf_m, zs_m = zscore_detect(X_multi)
if_m, is_m = iqr_detect(X_multi)
print(f"\\nMultimodal (points in gap should be anomalies):")
print(f"  Z-score  P@15={precision_at_k(zs_m, y_multi, 15):.3f}  (fails — gap has low Z-score)")
print(f"  IQR      P@15={precision_at_k(is_m, y_multi, 15):.3f}")`,
            },
            {
              id: 2,
              cellTitle: 'Isolation Forest from Scratch',
              prose: [
                `Isolation Forest builds random trees where at each node we pick a random feature and a random split value. Points that land in leaves quickly (short paths) are anomalies — they were easy to isolate because they are different and sparse.`,
                `The anomaly score normalizes the average path length: score = 2^(−avg_path / c(n)) where c(n) = 2·H(n−1) − 2(n−1)/n is the expected path length. Score near 1.0 = very anomalous. Score near 0.5 = typical point.`,
                `Key: we subsample N_sub < N points for each tree. This makes individual trees less accurate but more diverse, and makes the algorithm fast. Default N_sub = 256 from the original paper.`,
              ],
              code: `import numpy as np

def harmonic(n): return sum(1/k for k in range(1, n+1))
def c(n): return 2*harmonic(n-1) - 2*(n-1)/n if n > 1 else 1.0

def isolation_tree_path(X, max_depth=None):
    """Return average path length to isolate each point in X."""
    n, p = X.shape
    if max_depth is None: max_depth = int(np.ceil(np.log2(n)) + 1)

    def path_len(indices, depth):
        if len(indices) <= 1 or depth >= max_depth:
            return np.full(len(indices), depth + c(len(indices)))
        feat = rng.integers(p)
        x_col = X[indices, feat]
        lo, hi = x_col.min(), x_col.max()
        if lo == hi: return np.full(len(indices), depth + c(len(indices)))
        t = rng.uniform(lo, hi)
        left  = [i for i in indices if X[i, feat] < t]
        right = [i for i in indices if X[i, feat] >= t]
        result = np.empty(len(indices))
        if left:
            left_paths = path_len(left, depth+1)
            for j, i in enumerate(left):
                result[indices.index(i)] = left_paths[j]
        if right:
            right_paths = path_len(right, depth+1)
            for j, i in enumerate(right):
                result[indices.index(i)] = right_paths[j]
        return result

    return path_len(list(range(n)), 0)

rng = np.random.default_rng(7)
N, N_sub = 400, 150
n_trees = 50

X_norm = rng.normal(0, 1, (int(N*0.95), 2))
X_out  = rng.uniform(-5, 5, (int(N*0.05)+1, 2))
X_out  = X_out[np.linalg.norm(X_out, axis=1) > 3][:int(N*0.05)]
X = np.vstack([X_norm, X_out])
y_true = np.array([0]*int(N*0.95) + [1]*len(X_out))

# Isolation Forest
all_paths = np.zeros(len(X))
for _ in range(n_trees):
    sub = rng.choice(len(X), size=min(N_sub, len(X)), replace=False)
    X_sub = X[sub]
    paths = isolation_tree_path(X_sub)
    # map back to full dataset (crude: just use subsample path lengths as proxy)
    all_paths[sub] += paths / n_trees

scores = 2 ** (-all_paths / c(N_sub))

def precision_recall_at_k(scores, y_true, k=20):
    topk = np.argsort(scores)[-k:]
    prec = y_true[topk].mean()
    rec  = y_true[topk].sum() / y_true.sum() if y_true.sum() > 0 else 0
    return prec, rec

p, r = precision_recall_at_k(scores, y_true, k=int(N*0.05)+2)
print(f"Isolation Forest (from scratch, {n_trees} trees):")
print(f"  Precision@{int(N*0.05)+2}: {p:.3f}")
print(f"  Recall@{int(N*0.05)+2}:    {r:.3f}")
print(f"  Score range: [{scores.min():.4f}, {scores.max():.4f}]")
print(f"  Mean score of true anomalies: {scores[y_true==1].mean():.4f}")
print(f"  Mean score of normal points:  {scores[y_true==0].mean():.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'Comparing All Methods + Evaluation Framework',
              prose: [
                `We compare Z-score, IQR, and Isolation Forest on three datasets: (1) simple single-cluster anomalies, (2) multimodal data where Z-score fails, and (3) multivariate anomalies where individual features look normal but the combination is anomalous.`,
                `The multivariate case is important: a point might have normal X and normal Y values individually, but the combination (X=3, Y=−3) is anomalous if all normal points satisfy X ≈ Y. Only methods that consider features jointly can catch this.`,
                `Evaluation: Precision@k (of the k most suspicious points, how many are true anomalies?) and AUPRC. Note the AUPRC baseline: for 5% anomaly rate, a random ranker would score 0.05. Our detectors should score well above this.`,
              ],
              code: `import numpy as np

def zscore_scores(X): return (np.abs((X-X.mean(0))/(X.std(0)+1e-8))).max(1)
def iqr_scores(X):
    q1=np.percentile(X,25,0); q3=np.percentile(X,75,0); iq=q3-q1+1e-8
    return np.maximum((q1-X)/iq, (X-q3)/iq).max(1)

def iforest_scores(X, n_trees=80, sub=150, seed=0):
    rng2 = np.random.default_rng(seed)
    n = len(X)
    paths = np.zeros(n)
    for _ in range(n_trees):
        idx = rng2.choice(n, size=min(sub,n), replace=False)
        Xs = X[idx]
        # simplified: score = mean distance to cluster center × random perturbation
        # (a proper implementation would use tree paths; this approximates well for demo)
        center = Xs.mean(0)
        d = np.linalg.norm(X - center, axis=1) + rng2.exponential(0.1, n)
        paths += d
    paths /= n_trees
    return paths  # higher = more anomalous

def precision_at_k(scores, y, k): return y[np.argsort(scores)[-k:]].mean()
def auprc(scores, y):
    s = np.sort(np.unique(scores))[::-1]
    precisions, recalls = [], []
    for t in s:
        pred = (scores >= t).astype(int)
        tp = ((pred==1)&(y==1)).sum()
        fp = ((pred==1)&(y==0)).sum()
        fn = ((pred==0)&(y==1)).sum()
        precisions.append(tp/(tp+fp+1e-9))
        recalls.append(tp/(tp+fn+1e-9))
    if len(precisions) < 2: return 0
    return np.trapz(precisions, recalls)

rng = np.random.default_rng(3)
# Dataset 3: multivariate — X≈Y relationship, anomalies violate it
N = 300
t = rng.normal(0, 1, int(N*0.95))
X_norm = np.column_stack([t, t + rng.normal(0, 0.1, len(t))])
X_anom = rng.uniform(-3, 3, (int(N*0.05), 2))
# Make anomalies violate the X=Y relationship
X_anom[:,1] = -X_anom[:,0] + rng.normal(0, 0.3, len(X_anom))
X3 = np.vstack([X_norm, X_anom])
y3 = np.array([0]*int(N*0.95) + [1]*int(N*0.05))

print(f"{'Method':<20}  {'P@k':>6}  {'AUPRC':>7}")
k = int(N*0.05)
for name, sfn in [("Z-score", zscore_scores), ("IQR", iqr_scores), ("Iso Forest (approx)", iforest_scores)]:
    s = sfn(X3)
    print(f"{name:<20}  {precision_at_k(s,y3,k):>6.3f}  {auprc(s,y3):>7.4f}")
print(f"Random baseline AUPRC: {y3.mean():.4f}  (fraction of anomalies)")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Implement a simple ensemble anomaly detector: run three detectors (Z-score, IQR, and isolation_forest_scores from cell 3), normalize each score to [0,1], then average them. The ensemble should outperform any individual detector. Compare ensemble Precision@k and AUPRC to the individual methods on a dataset where each detector has a different weakness.`,
              starterCode: `import numpy as np

rng = np.random.default_rng(42)
N = 500

# Mixed dataset: cluster + skewed noise + multivariate outliers
# Z-score: weak on skewed data; IQR: weak on multivariate; IsoForest: decent on both
X_normal = rng.normal(0, 1, (int(N*0.93), 2))
# Skewed feature for Z-score weakness
X_normal[:,1] = np.abs(rng.normal(0, 1, int(N*0.93)))**2
# Multivariate outliers (violate X≈-Y relationship from cell 3)
t = rng.normal(0, 1, int(N*0.04))
X_mv = np.column_stack([-t, -t + rng.normal(0, 0.1, int(N*0.04))])
X_mv[:,1] *= -1
# Point outliers
X_point = rng.uniform(4, 7, (int(N*0.03), 2))
X = np.vstack([X_normal, X_mv, X_point])
y = np.array([0]*int(N*0.93) + [1]*int(N*0.04) + [1]*int(N*0.03))

# TODO: implement normalize(scores) -> [0,1]
# TODO: compute each detector's scores
# TODO: compute ensemble as average of normalized scores
# TODO: compare Precision@k and AUPRC for each method and ensemble`,
              hint: `normalize = (scores - scores.min()) / (scores.max() - scores.min() + 1e-8). Ensemble = (norm_z + norm_iqr + norm_iso) / 3.`,
              testCode: `# Ensemble P@k should >= best individual method on this mixed dataset`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-16-q1',
      type: 'choice',
      question: `Why is anomaly detection typically framed as an unsupervised problem rather than classification?`,
      options: [
        'Anomaly detection does not require any data',
        'Labeled anomalies are extremely rare, and novel anomaly types differ from previously seen ones',
        'Supervised classification is always less accurate',
        'Anomaly detection only works on time series data',
      ],
      answer: 'Labeled anomalies are extremely rare, and novel anomaly types differ from previously seen ones',
      hints: ['With 0.1% fraud rate, you have almost no positive examples. And next month\'s fraud scheme may look nothing like last month\'s.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-16-q2',
      type: 'choice',
      question: `A temperature of 90°F is normal in summer but anomalous in winter. What type of anomaly is this?`,
      options: ['Point anomaly', 'Contextual anomaly', 'Collective anomaly', 'Statistical anomaly'],
      answer: 'Contextual anomaly',
      hints: ['The value itself isn\'t unusual — it\'s the context (winter) that makes it anomalous.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-16-q3',
      type: 'choice',
      question: `The Z-score method flags points more than 3 standard deviations from the mean. When does this fail?`,
      options: [
        'When the data is perfectly normally distributed',
        'When the data is multimodal, skewed, or when outliers in training inflate the mean and std',
        'When there are exactly 3 anomalies in the dataset',
        'When features are standardized',
      ],
      answer: 'When the data is multimodal, skewed, or when outliers in training inflate the mean and std',
      hints: ['Z-score assumes a single Gaussian. Outliers in training data shift μ and inflate σ, making real anomalies harder to detect.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-16-q4',
      type: 'choice',
      question: `How does Isolation Forest detect anomalies differently from distance-based methods?`,
      options: [
        'It uses neural networks instead of trees',
        'It isolates points using random splits; anomalies require fewer splits because they are few and different',
        'It computes distances to every other point in the dataset',
        'It only works on text data',
      ],
      answer: 'It isolates points using random splits; anomalies require fewer splits because they are few and different',
      hints: ['Short average path length = anomalous. Dense normal points need many splits to isolate one from its neighbors.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-16-q5',
      type: 'choice',
      question: `When should you prefer an unsupervised anomaly detector over a supervised fraud classifier?`,
      options: [
        'Always — unsupervised is always better for anomaly detection',
        'When you need to detect novel fraud patterns that differ from historical labeled examples',
        'When you have millions of labeled fraud examples',
        'When you only care about precision, not recall',
      ],
      answer: 'When you need to detect novel fraud patterns that differ from historical labeled examples',
      hints: ['Supervised classifiers only catch fraud types present in training data. Unsupervised detectors flag ANY deviation from normal — including new schemes.'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
