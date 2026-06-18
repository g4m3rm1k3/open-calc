export default {
  id: 'ae-p2-07-unsupervised-learning',
  slug: 'unsupervised-learning',
  chapter: 'ae-p2',
  order: 6,
  title: 'Unsupervised Learning',
  subtitle: 'No labels, no teacher. The algorithm finds structure on its own.',
  tags: ['K-means', 'DBSCAN', 'GMM', 'clustering', 'silhouette-score', 'elbow-method', 'anomaly-detection', 'EM-algorithm'],

  hook: {
    question: 'You have millions of customer records but no one has labeled them as "high-value," "at-risk," or "new." How do you discover those groups without being told they exist?',
    realWorldContext:
      'Every supervised ML lesson so far assumed labeled data. In the real world, labels are expensive. Hospitals have millions of patient records with no disease tags. Security teams have network logs with no anomaly flags. E-commerce sites have billions of clicks with no hand-labeled customer segments. Unsupervised learning finds patterns without being told what to look for. This lesson builds K-Means, DBSCAN, and Gaussian Mixture Models from scratch, evaluates cluster quality with the silhouette score, and uses clustering for anomaly detection.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'K-Means: partition data into exactly K clusters by minimizing total within-cluster squared distance (inertia). Lloyd\'s algorithm: (1) pick K random initial centroids; (2) assign each point to the nearest centroid; (3) recompute each centroid as the mean of its points; (4) repeat until assignments stop changing. Convergence is guaranteed (inertia never increases), but only to a local minimum. Different random initializations give different results. K-Means++ initialization (choose each new centroid with probability proportional to its squared distance from existing centroids) dramatically reduces bad initializations.',
      'Choosing K: the elbow method runs K-Means for K = 1, 2, ..., n. Plot inertia vs K. The "elbow" is where inertia stops decreasing rapidly. The silhouette score is more principled: for each point i, compute a = mean distance to other points in the same cluster, b = mean distance to all points in the nearest other cluster. Silhouette coefficient s(i) = (b−a)/max(a,b). Range [−1, +1]: s near +1 means well-separated, s near −1 means the point should be in the other cluster. Maximize the mean silhouette across all points.',
      'DBSCAN (Density-Based Spatial Clustering): finds clusters as dense regions separated by sparse ones. Two parameters: eps (neighborhood radius), min_samples (minimum points to form a dense core). Three point types: core point (≥ min_samples points within eps), border point (within eps of a core but not itself a core), noise point (neither — these are automatically identified as outliers). Clusters grow by connecting core points that are within eps of each other. Border points join the nearest cluster. Noise points belong to cluster label −1.',
      'K-Means vs DBSCAN: K-Means requires K upfront and assumes spherical (convex) clusters — it fails on two interlocking crescents because the decision surface is a straight line. DBSCAN requires eps and min_samples and finds clusters of any shape (connected by density). DBSCAN automatically identifies outliers. Limitation: DBSCAN struggles when clusters have very different densities.',
      'Gaussian Mixture Models (GMM): model data as drawn from K Gaussian distributions, each with mean μₖ, covariance Σₖ, and mixing weight πₖ. Unlike K-Means, assignments are soft (probabilistic): each point has a probability of belonging to each Gaussian. The EM algorithm alternates: E-step — compute responsibility rᵢₖ = P(cluster k | xᵢ) using Bayes\' rule; M-step — update μₖ, Σₖ, πₖ using weighted statistics from the responsibilities. GMM converges to a local maximum of the log-likelihood. It can model elliptical clusters and naturally handles overlapping distributions.',
      'Clustering for anomaly detection: K-Means — points far from their centroid are anomalies (high reconstruction error). DBSCAN — noise points (label −1) are anomalies by definition. GMM — points with low total probability density Σπₖ·N(x|μₖ,Σₖ) are anomalies. The GMM approach is principled: the threshold is a log-probability cutoff. Points below the threshold are flagged. This is equivalent to fitting a multivariate normal density and flagging points in the tails.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Without labels, how do you know if clustering is working?',
        body: 'You cannot use accuracy — there are no labels. Three proxies:\n1. Silhouette score: are points closer to their own cluster than to other clusters?\n2. Inertia: is within-cluster variance low?\n3. Domain validation: do the clusters make business/scientific sense?\n\nThe hard truth: unsupervised learning produces patterns, not facts. Cluster labels are whatever you call them. Always validate against domain knowledge.',
      },
      {
        type: 'procedure',
        title: 'Choosing between K-Means, DBSCAN, and GMM',
        steps: [
          'K-Means: start here for large datasets with roughly spherical clusters',
          'Use elbow + silhouette to choose K (plot both)',
          'Switch to DBSCAN if: clusters have irregular shapes, outliers are present, K is unknown',
          'Tune DBSCAN eps: plot k-distance graph (distance to k-th neighbor for each point), find the knee',
          'Use GMM if: clusters overlap, you need soft assignments, or clusters are elliptical',
          'Validate with domain knowledge — cluster quality metrics are proxies, not ground truth',
        ],
      },
      {
        type: 'insight',
        title: 'K-Means converges but not to the global optimum',
        body: 'K-Means minimizes inertia = Σ‖xᵢ − μ_{c(i)}‖². Each iteration provably decreases or maintains inertia (assignments step: move to nearer centroid; mean step: mean is the minimizer of squared distance). So it always converges.\n\nBut the objective is non-convex — there are many local minima. Run K-Means multiple times with different random seeds and keep the best solution. K-Means++ makes the initial centroids diverse, which reduces the chance of bad local minima.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Unsupervised Learning',
        mathBridge: 'K-Means inertia = Σ‖xᵢ−μₖ‖². Silhouette: s = (b−a)/max(a,b). DBSCAN: core point has ≥ min_samples in eps-ball.',
        caption: 'Implement K-Means with the elbow method, DBSCAN for arbitrary-shape clusters and outlier detection, and a simple GMM with EM updates.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'K-Means from scratch with elbow and silhouette',
              prose: [
                'Lloyd\'s algorithm: assign each point to nearest centroid, recompute centroids as cluster means, repeat until convergence. Guaranteed to converge but may find a local minimum.',
                'Elbow method: plot inertia vs K. Look for the point where adding more clusters gives diminishing returns.',
                'Silhouette score: for each point, s = (b−a)/max(a,b) where a = mean intra-cluster distance, b = mean distance to nearest other cluster. Higher is better (max = 1).',
              ],
              code: `import math
import random

random.seed(42)

def l2(a, b):
    return sum((ai-bi)**2 for ai,bi in zip(a,b))**0.5

def kmeans(data, k, max_iter=100):
    random.seed(42)
    centroids = random.sample(data, k)
    assignments = [0] * len(data)
    for _ in range(max_iter):
        new_assign = [min(range(k), key=lambda j: l2(x, centroids[j])) for x in data]
        if new_assign == assignments: break
        assignments = new_assign
        clusters = [[] for _ in range(k)]
        for x, c in zip(data, assignments): clusters[c].append(x)
        centroids = [
            [sum(p[j] for p in cl)/len(cl) for j in range(len(data[0]))]
            if cl else random.choice(data)
            for cl in clusters
        ]
    return assignments, centroids

def inertia(data, assignments, centroids):
    return sum(l2(x, centroids[c])**2 for x, c in zip(data, assignments))

def silhouette(data, assignments):
    n = len(data)
    cluster_ids = list(set(assignments))
    if len(cluster_ids) < 2: return 0.0
    scores = []
    clusters = {c: [data[i] for i in range(n) if assignments[i]==c] for c in cluster_ids}
    for i in range(n):
        ci = assignments[i]
        same   = [l2(data[i], p) for p in clusters[ci] if p is not data[i]]
        a_val  = sum(same)/len(same) if same else 0.0
        other_means = []
        for cj in cluster_ids:
            if cj == ci: continue
            pts = clusters[cj]
            other_means.append(sum(l2(data[i], p) for p in pts) / len(pts))
        b_val = min(other_means) if other_means else 0.0
        denom = max(a_val, b_val)
        scores.append((b_val - a_val) / denom if denom > 0 else 0.0)
    return sum(scores) / n

# 3-cluster dataset
N = 150
data = []
for cx, cy in [(1,1), (5,1), (3,5)]:
    for _ in range(N//3):
        data.append([random.gauss(cx, 0.7), random.gauss(cy, 0.7)])

print(f"{'K':>4} {'Inertia':>10} {'Silhouette':>12}")
print("-" * 30)
for k in range(2, 7):
    a, c = kmeans(data, k)
    inn  = inertia(data, a, c)
    sil  = silhouette(data, a)
    flag = " <-- true K" if k == 3 else ""
    print(f"{k:>4} {inn:>10.2f} {sil:>12.4f}{flag}")

print()
print("Elbow: inertia drops sharply from K=2→3, slowly after.")
print("Silhouette peaks at K=3 — best internal validation.")`,
            },
            {
              id: 2,
              cellTitle: 'DBSCAN for non-spherical clusters and outlier detection',
              prose: [
                'DBSCAN finds clusters as dense regions connected by density reachability. Core points have ≥ min_samples neighbors within eps. Border points are near a core. Noise points (outliers) are label = −1.',
                'K-Means fails on non-spherical data (e.g., two crescents) because it cuts space with hyperplanes. DBSCAN follows density contours.',
                'The noise points identified by DBSCAN are a natural anomaly detector — no extra logic needed.',
              ],
              code: `import math
import random

random.seed(42)

def l2(a, b):
    return sum((ai-bi)**2 for ai,bi in zip(a,b))**0.5

def dbscan(data, eps, min_samples):
    n = len(data)
    labels = [-2] * n   # -2 = unvisited
    neighbors = [
        [j for j in range(n) if i != j and l2(data[i], data[j]) <= eps]
        for i in range(n)
    ]
    cluster_id = 0
    for i in range(n):
        if labels[i] != -2: continue
        if len(neighbors[i]) < min_samples:
            labels[i] = -1   # noise
            continue
        # Start new cluster from core point i
        labels[i] = cluster_id
        seeds = list(neighbors[i])
        while seeds:
            j = seeds.pop()
            if labels[j] == -1: labels[j] = cluster_id   # border
            if labels[j] != -2: continue
            labels[j] = cluster_id
            if len(neighbors[j]) >= min_samples:
                seeds.extend(neighbors[j])
        cluster_id += 1
    return labels

# Two crescents (non-spherical)
def make_crescents(n_each=80):
    pts, labels = [], []
    for _ in range(n_each):
        a = random.uniform(0, math.pi)
        pts.append([math.cos(a) + random.gauss(0, 0.1),
                    math.sin(a) + random.gauss(0, 0.1)])
        labels.append(0)
    for _ in range(n_each):
        a = random.uniform(0, math.pi)
        pts.append([1 - math.cos(a) + random.gauss(0, 0.1),
                    0.5 - math.sin(a) + random.gauss(0, 0.1)])
        labels.append(1)
    return pts, labels

data_c, true_labels = make_crescents(80)
# Add 10 outliers
outliers = [[random.uniform(-1, 2), random.uniform(-1, 1.5)] for _ in range(10)]
data_all = data_c + outliers

# K-Means on crescents (expected to fail)
def kmeans2(data, k=2):
    random.seed(1)
    centroids = random.sample(data, k)
    assignments = [0]*len(data)
    for _ in range(100):
        new_a = [min(range(k), key=lambda j: l2(x,centroids[j])) for x in data]
        if new_a == assignments: break
        assignments = new_a
        for ci in range(k):
            pts = [data[i] for i in range(len(data)) if assignments[i]==ci]
            if pts: centroids[ci] = [sum(p[j] for p in pts)/len(pts) for j in range(2)]
    return assignments

km_labels  = kmeans2(data_all, k=2)
dbs_labels = dbscan(data_all, eps=0.3, min_samples=5)

# K-Means: how many of each true class in each cluster?
km_correct = sum(1 for i in range(len(data_c)) if km_labels[i] == true_labels[i])
print(f"K-Means accuracy on crescents:  {km_correct}/{len(data_c)} = {km_correct/len(data_c):.2f}")
print(f"  (K-Means sees spherical clusters, fails on crescents)")

n_clusters_dbs = len(set(l for l in dbs_labels if l >= 0))
n_noise        = sum(1 for l in dbs_labels if l == -1)
print(f"\\nDBSCAN: found {n_clusters_dbs} clusters, {n_noise} noise points")
print(f"  (10 outliers added, DBSCAN detects ~10 noise points)")

# Check how many outliers were correctly flagged
noise_indices = [i for i, l in enumerate(dbs_labels) if l == -1]
true_outlier_indices = list(range(len(data_c), len(data_all)))
detected = sum(1 for i in noise_indices if i in true_outlier_indices)
print(f"  Outlier recall: {detected}/{len(outliers)} true outliers detected as noise")`,
            },
            {
              id: 3,
              cellTitle: 'Gaussian Mixture Model with EM',
              prose: [
                'GMM fits K Gaussian distributions to the data using Expectation-Maximization (EM). E-step: compute the probability (responsibility) that each point belongs to each Gaussian. M-step: update means, variances, and mixture weights using those responsibilities.',
                'Soft assignments: each point has fractional membership across all clusters. This handles overlapping clusters that K-Means would hard-cut.',
                'The log-likelihood of the data under the fitted GMM is a natural anomaly score — low-density points have low log-likelihood.',
              ],
              code: `import math
import random

random.seed(42)

def normal_pdf(x, mu, sigma):
    """1D Gaussian probability density."""
    if sigma <= 0: return 1e-300
    return math.exp(-0.5*((x-mu)/sigma)**2) / (sigma * math.sqrt(2*math.pi))

def gmm_em(data, k, n_iter=50):
    """1D Gaussian Mixture Model via EM."""
    n = len(data)
    # Initialize: cluster into k equal parts by sorted order
    sorted_d = sorted(data)
    mus    = [sorted_d[int((i+0.5)*n/k)] for i in range(k)]
    sigmas = [1.0] * k
    pis    = [1.0/k] * k    # mixing weights (must sum to 1)

    for iteration in range(n_iter):
        # E-step: responsibilities r[i][k] = P(k | x_i)
        r = []
        for xi in data:
            raw = [pis[j] * normal_pdf(xi, mus[j], sigmas[j]) for j in range(k)]
            total = sum(raw) + 1e-300
            r.append([rv/total for rv in raw])

        # M-step: update parameters
        Nk = [sum(r[i][j] for i in range(n)) for j in range(k)]
        for j in range(k):
            if Nk[j] < 1e-6:
                continue
            mus[j]    = sum(r[i][j]*data[i] for i in range(n)) / Nk[j]
            sigmas[j] = math.sqrt(sum(r[i][j]*(data[i]-mus[j])**2 for i in range(n)) / Nk[j])
            sigmas[j] = max(sigmas[j], 0.01)
            pis[j]    = Nk[j] / n

        if iteration % 10 == 0:
            loglik = sum(
                math.log(max(sum(pis[j]*normal_pdf(xi, mus[j], sigmas[j]) for j in range(k)), 1e-300))
                for xi in data
            )
            print(f"  iter {iteration:3d} | log-likelihood = {loglik:.2f}")

    return mus, sigmas, pis

def log_density(x, mus, sigmas, pis):
    return math.log(max(sum(pis[j]*normal_pdf(x, mus[j], sigmas[j]) for j in range(len(mus))), 1e-300))

# Two overlapping Gaussians + outliers
data_gmm  = [random.gauss(0, 1) for _ in range(100)]
data_gmm += [random.gauss(5, 1) for _ in range(100)]
outliers  = [-8, -7, 10, 12, -9]
data_all  = data_gmm + outliers
random.shuffle(data_all)

print("=== Fitting 2-component GMM ===")
mus, sigmas, pis = gmm_em(data_all, k=2, n_iter=30)
print(f"\\nFitted components:")
for j in range(2):
    print(f"  Component {j}: mu={mus[j]:.3f}  sigma={sigmas[j]:.3f}  pi={pis[j]:.3f}")

print(f"\\nAnomaly detection (log-density < threshold):")
log_densities = [(x, log_density(x, mus, sigmas, pis)) for x in data_all]
threshold     = sorted(ld for _, ld in log_densities)[int(0.05*len(data_all))]  # bottom 5%
flagged       = [x for x, ld in log_densities if ld < threshold]
true_positive = sum(1 for x in flagged if x in outliers)
print(f"  Flagged {len(flagged)} points, {true_positive}/{len(outliers)} true outliers in them")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: 'Implement k-means++ initialization. Standard K-Means chooses K random initial centroids which can lead to poor local minima. K-Means++ improves this: (1) choose the first centroid uniformly at random; (2) for each subsequent centroid, choose a new data point with probability proportional to its squared distance from the nearest existing centroid. Compare standard K-Means and K-Means++ on a dataset with 4 well-separated clusters by running each 10 times and reporting the average and minimum inertia across runs.',
              starterCode: `import math
import random

random.seed(42)

def l2(a, b):
    return sum((ai-bi)**2 for ai,bi in zip(a,b))**0.5

def kmeans(data, k, init_centroids):
    """K-Means with provided initial centroids."""
    centroids = [list(c) for c in init_centroids]
    assignments = [0]*len(data)
    for _ in range(100):
        new_a = [min(range(k), key=lambda j: l2(x, centroids[j])) for x in data]
        if new_a == assignments: break
        assignments = new_a
        for ci in range(k):
            pts = [data[i] for i in range(len(data)) if assignments[i]==ci]
            if pts:
                centroids[ci] = [sum(p[j] for p in pts)/len(pts) for j in range(len(data[0]))]
    return assignments, centroids

def inertia(data, assignments, centroids):
    return sum(l2(x, centroids[c])**2 for x, c in zip(data, assignments))

def random_init(data, k):
    return random.sample(data, k)

def kmeans_pp_init(data, k):
    """TODO: implement K-Means++ initialization."""
    pass  # return list of k centroids

# 4-cluster dataset
data = []
for cx, cy in [(0,0), (8,0), (0,8), (8,8)]:
    for _ in range(50):
        data.append([random.gauss(cx, 1.0), random.gauss(cy, 1.0)])

# TODO: run each init strategy 10 times and compare average + min inertia
n_runs = 10
k = 4
`,
              hint: 'K-Means++: centroids = [random.choice(data)]. Then loop k-1 times: for each point, compute dist_sq = min squared distance to any existing centroid. Sample next centroid with probability proportional to dist_sq (use random.choices with weights=dist_sq_list).',
              testCode: `try:
    assert kmeans_pp_init is not None
    test_centroids = kmeans_pp_init(data, 4)
    assert test_centroids is not None, "kmeans_pp_init should return 4 centroids"
    assert len(test_centroids) == 4, f"Expected 4 centroids, got {len(test_centroids)}"
    assert 'random_inertias' in dir() or 'avg_random' in dir(), "Run 10 trials for random init"
    assert 'pp_inertias' in dir() or 'avg_pp' in dir(), "Run 10 trials for K-Means++ init"
    # Either individual lists or averaged values are fine
    if 'random_inertias' in dir() and 'pp_inertias' in dir():
        avg_r = sum(random_inertias)/len(random_inertias)
        avg_p = sum(pp_inertias)/len(pp_inertias)
    else:
        avg_r, avg_p = avg_random, avg_pp
    print(f"PASS: Random init avg inertia:   {avg_r:.2f}")
    print(f"      K-Means++ avg inertia:      {avg_p:.2f}")
    if avg_p <= avg_r:
        print(f"      K-Means++ reduces avg inertia by {(1-avg_p/avg_r)*100:.1f}%")
    else:
        print("      (Note: K-Means++ improvement may be small on this simple dataset)")
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
      question: 'What distinguishes unsupervised learning from supervised learning?',
      options: [
        'Unsupervised learning uses more data than supervised learning',
        'Unsupervised learning has no labeled outputs — the algorithm finds structure on its own',
        'Unsupervised learning only works with text data',
        'Unsupervised learning always produces better results than supervised',
      ],
      answer: 'Unsupervised learning has no labeled outputs — the algorithm finds structure on its own',
      hints: [
        'In supervised learning, you provide (input, correct_output) pairs. In unsupervised, you only provide inputs.',
        'Without labels, you cannot compute accuracy — you need other metrics like silhouette score',
      ],
      reviewSection: 'Unsupervised Learning Overview',
    },
    {
      type: 'choice',
      question: 'What does K-Means require you to specify before training?',
      options: [
        'The exact cluster centers (centroids)',
        'The number of clusters K',
        'The label for each data point',
        'The distance metric to use',
      ],
      answer: 'The number of clusters K',
      hints: [
        'K-Means will always produce exactly K clusters regardless of the true structure',
        'The elbow method and silhouette score help you choose a good K',
      ],
      reviewSection: 'K-Means Algorithm',
    },
    {
      type: 'choice',
      question: 'K-Means fails on two interlocking half-moon shapes but DBSCAN succeeds. Why?',
      options: [
        'DBSCAN uses more data than K-Means',
        'DBSCAN finds clusters based on density and can discover arbitrary shapes; K-Means assumes spherical clusters',
        'DBSCAN always outperforms K-Means on every dataset',
        'K-Means cannot handle 2D data',
      ],
      answer: 'DBSCAN finds clusters based on density and can discover arbitrary shapes; K-Means assumes spherical clusters',
      hints: [
        'K-Means assigns each point to the nearest centroid — the decision boundary is always a straight line/hyperplane',
        'DBSCAN grows clusters by following density — it can follow the curved shape of each crescent',
      ],
      reviewSection: 'DBSCAN vs K-Means',
    },
    {
      type: 'choice',
      question: 'What is the silhouette score measuring?',
      options: [
        'The total number of clusters found',
        'How similar each point is to its own cluster compared to the nearest other cluster',
        'The speed of the clustering algorithm',
        'The percentage of outliers in the dataset',
      ],
      answer: 'How similar each point is to its own cluster compared to the nearest other cluster',
      hints: [
        's = (b−a)/max(a,b) where a = mean intra-cluster distance, b = mean distance to nearest other cluster',
        's = 1: tightly clustered, far from other clusters. s = −1: likely in the wrong cluster',
      ],
      reviewSection: 'Evaluating Cluster Quality',
    },
    {
      type: 'choice',
      question: 'How does a Gaussian Mixture Model differ from K-Means in cluster assignments?',
      options: [
        'GMM uses hard assignments where each point belongs to exactly one cluster',
        'GMM gives soft (probabilistic) assignments — each point has a probability of belonging to each Gaussian',
        'GMM does not use cluster centers at all',
        'GMM only works with one-dimensional data',
      ],
      answer: 'GMM gives soft (probabilistic) assignments — each point has a probability of belonging to each Gaussian',
      hints: [
        'K-Means: each point → exactly one cluster. GMM: each point → probability vector over K clusters',
        'GMM can model elliptical clusters and naturally handles overlapping distributions',
      ],
      reviewSection: 'Gaussian Mixture Models',
    },
  ],
}
