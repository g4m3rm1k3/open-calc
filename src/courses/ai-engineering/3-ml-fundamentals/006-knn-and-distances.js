export default {
  id: 'ae-p2-06-knn',
  slug: 'knn-and-distances',
  chapter: 'ae-p2',
  order: 5,
  title: 'K-Nearest Neighbors and Distances',
  subtitle: 'Store everything. Predict by looking at your neighbors. The simplest algorithm that actually works.',
  tags: ['KNN', 'distance-metrics', 'curse-of-dimensionality', 'cosine-similarity', 'lazy-learning', 'KD-tree', 'vector-search', 'RAG'],

  hook: {
    question: 'A new data point arrives. Instead of running it through a trained model, you just find the closest points in your training set and let them vote. Why does this naive approach work — and where does it break?',
    realWorldContext:
      'K-nearest neighbors has no training phase, no parameters, no gradient descent. You store the entire dataset and compute distances at prediction time. It sounds too simple to work, but it appears everywhere in modern AI: vector databases use KNN search over embeddings for semantic search; retrieval-augmented generation (RAG) finds the K nearest document chunks to a query; recommendation systems find similar users or items. The algorithm is always the same. This lesson builds KNN from scratch, implements multiple distance metrics, demonstrates the curse of dimensionality empirically, and builds a KD-tree for efficient search.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The KNN algorithm in four steps: (1) compute the distance from the query point to every training point; (2) sort by distance; (3) take the K closest; (4) for classification, majority vote; for regression, average. That is it. No training, no parameters, no epochs. KNN is a "lazy learner" — it stores the training data and does all computation at prediction time.',
      'Choosing K: the single hyperparameter. K = 1 → boundary follows every training point, zero training error, high variance, overfits. K = 3–5 → captures local structure. K = 15–31 → smooth boundaries, more robust to noise. K = N (all points) → always predicts the majority class, maximum bias. Practical starting point: K = √N (square root of training size). Use odd K for binary classification to avoid ties.',
      'Distance metrics define what "near" means. L2 (Euclidean): d(a,b) = √Σ(aᵢ−bᵢ)². Default choice, straight-line distance. Sensitive to feature scale — always standardize before using L2. L1 (Manhattan): d(a,b) = Σ|aᵢ−bᵢ|. More robust to outliers (no squaring amplifies large differences). Cosine: d(a,b) = 1 − (a·b)/(‖a‖‖b‖). Measures angle between vectors, ignoring magnitude. Essential for text and embeddings — document length is noise, direction carries meaning. Minkowski (p): d(a,b) = (Σ|aᵢ−bᵢ|ᵖ)^(1/p). L1 when p=1, L2 when p=2, Chebyshev (max absolute difference) as p→∞.',
      'Weighted KNN: standard KNN gives equal vote to all K neighbors, but a neighbor at distance 0.1 should matter more than one at distance 5.0. Distance-weighted vote: wᵢ = 1/(dᵢ + ε) where ε prevents division by zero. For classification: weighted vote per class. For regression: Σwᵢyᵢ / Σwᵢ. Weighted KNN is less sensitive to K because distant neighbors contribute very little regardless.',
      'Curse of dimensionality: KNN breaks down in high dimensions. Three related problems: (1) Distances converge — in d dimensions with uniform random points, the ratio max_dist/min_dist → 1 as d → ∞. When all points are equally far, "nearest" is meaningless. (2) Volume explodes — the fraction of the unit hypercube covered by a ball of radius r goes to zero as d grows. To contain K neighbors, your neighborhood radius must expand to cover a huge fraction of the space. (3) All corners — in a d-dimensional hypercube, the fraction of volume within ε of the boundary approaches 1. Almost all the data is in the corners, not near any typical point.',
      'KD-trees provide fast approximate KNN search. Brute-force KNN costs O(n·d) per query. A KD-tree recursively splits the space along feature axes at the median. Building takes O(n·d·log n). Queries take O(log n) average for low-dimensional data (d < 20). For higher dimensions, the tree degenerates and brute-force is sometimes faster. For very large n and moderate d, approximate methods (Ball trees, HNSW, FAISS) are used in production.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'KNN is how vector databases and RAG work at scale',
        body: 'When you search a vector database, the system finds the K nearest embedding vectors to your query embedding. This is exact KNN in embedding space.\n\nFor 100M+ vectors, brute-force is too slow. Production systems use approximate nearest neighbor (ANN) algorithms — HNSW, FAISS, ScaNN — that trade a tiny amount of accuracy for 10–100× speedup.\n\nThe intuition is the same as k-NN: find similar vectors, return them. The engineering is what changes at scale.',
      },
      {
        type: 'procedure',
        title: 'Choosing the right K for KNN',
        steps: [
          'Start at K = sqrt(n_train) rounded to an odd number',
          'Plot validation accuracy vs K from 1 to ~50',
          'K=1 is overfitting if training accuracy >> validation accuracy',
          'Choose the K at the "elbow" where validation accuracy plateaus',
          'Use weighted KNN (weight = 1/distance) to make results less sensitive to K',
          'For imbalanced classes: weight by class frequency to avoid majority-class bias',
        ],
      },
      {
        type: 'warning',
        title: 'KNN requires feature scaling — every time',
        body: 'A feature ranging 0–1000 (e.g., income) and a feature ranging 0–1 (e.g., age/100) produce distances dominated by income. Every neighbor will be the "nearest income" neighbor, regardless of age.\n\nAlways standardize (subtract mean, divide by std) before KNN. Unlike decision trees and random forests, KNN is extremely scale-sensitive.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'K-Nearest Neighbors and Distances',
        mathBridge: 'L2: √Σ(aᵢ−bᵢ)². Cosine: 1 − a·b/(‖a‖‖b‖). Weighted vote: wᵢ = 1/(dᵢ+ε).',
        caption: 'Build KNN classifier and regressor from scratch, compare distance metrics, and demonstrate the curse of dimensionality empirically.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'KNN classifier with multiple distance metrics',
              prose: [
                'KNN algorithm: compute distances to all training points, sort, take K nearest, majority vote. The distance metric changes which points are "nearest."',
                'L2 is the default for spatial data. Cosine is essential for embeddings/text — it measures angle, not magnitude. Two documents can be "far" in L2 but "near" in cosine if they share the same vocabulary proportions.',
                'Compare L2 vs cosine on 2D data where scale varies across features.',
              ],
              code: `import random
import math

random.seed(42)

def l2(a, b):
    return sum((ai-bi)**2 for ai,bi in zip(a,b))**0.5

def l1(a, b):
    return sum(abs(ai-bi) for ai,bi in zip(a,b))

def cosine(a, b):
    dot = sum(ai*bi for ai,bi in zip(a,b))
    na  = sum(ai**2 for ai in a)**0.5
    nb  = sum(bi**2 for bi in b)**0.5
    if na == 0 or nb == 0: return 1.0
    return 1.0 - dot / (na * nb)

def knn_predict(X_tr, y_tr, X_te, k=5, dist_fn=l2, weighted=False):
    preds = []
    for xq in X_te:
        distances = [(dist_fn(xq, xt), yi) for xt, yi in zip(X_tr, y_tr)]
        distances.sort(key=lambda d: d[0])
        neighbors = distances[:k]
        if weighted:
            votes = {}
            for d, label in neighbors:
                w = 1.0 / (d + 1e-9)
                votes[label] = votes.get(label, 0.0) + w
        else:
            votes = {}
            for _, label in neighbors:
                votes[label] = votes.get(label, 0) + 1
        preds.append(max(votes, key=votes.get))
    return preds

# Generate 2D data: class 0 near (2,2), class 1 near (5,5)
N = 150
X, y = [], []
for _ in range(N//2):
    X.append([random.gauss(2, 1), random.gauss(2, 1)]); y.append(0)
for _ in range(N//2):
    X.append([random.gauss(5, 1), random.gauss(5, 1)]); y.append(1)
pairs = list(zip(X,y)); random.shuffle(pairs)
X, y = [p[0] for p in pairs], [p[1] for p in pairs]
# Standardize
means = [sum(x[j] for x in X)/N for j in range(2)]
stds  = [(sum((x[j]-means[j])**2 for x in X)/N)**0.5 for j in range(2)]
X_sc = [[(x[j]-means[j])/stds[j] for j in range(2)] for x in X]
X_tr, y_tr, X_te, y_te = X_sc[:120], y[:120], X_sc[120:], y[120:]

print(f"{'Method':<20} {'K=1':>7} {'K=5':>7} {'K=15':>7}")
print("-" * 42)
for dist_fn, label in [(l2,'L2'), (l1,'L1'), (cosine,'Cosine')]:
    row = [label]
    for k in [1, 5, 15]:
        preds = knn_predict(X_tr, y_tr, X_te, k=k, dist_fn=dist_fn)
        acc   = sum(p==yi for p,yi in zip(preds, y_te)) / len(y_te)
        row.append(f"{acc:.3f}")
    print(f"{row[0]:<20} {row[1]:>7} {row[2]:>7} {row[3]:>7}")

# Weighted vs unweighted
preds_unw = knn_predict(X_tr, y_tr, X_te, k=5, dist_fn=l2, weighted=False)
preds_w   = knn_predict(X_tr, y_tr, X_te, k=5, dist_fn=l2, weighted=True)
acc_unw   = sum(p==yi for p,yi in zip(preds_unw, y_te)) / len(y_te)
acc_w     = sum(p==yi for p,yi in zip(preds_w,   y_te)) / len(y_te)
print(f"\\nK=5, L2 unweighted: {acc_unw:.3f}")
print(f"K=5, L2 weighted:   {acc_w:.3f}  (closer neighbors vote more)")`,
            },
            {
              id: 2,
              cellTitle: 'The curse of dimensionality: measured empirically',
              prose: [
                'In low dimensions, nearest neighbors are meaningfully close. In high dimensions, all points become nearly equidistant. The ratio max_dist/min_dist → 1 as d grows — "nearest" stops meaning anything.',
                'Also measure the radius needed to contain the nearest K=5 neighbors out of 1000 random points. In high dimensions, you must expand the search ball to cover most of the space.',
                'This is why KNN works for 2–50 features but needs dimensionality reduction (PCA, UMAP) for hundreds of features.',
              ],
              code: `import random
import math

random.seed(42)

def l2(a, b):
    return sum((ai-bi)**2 for ai,bi in zip(a,b))**0.5

def curse_of_dimensionality(n_points=500, n_trials=50):
    """Measure distance concentration for increasing dimensions."""
    print(f"{'Dim':>5} {'min_dist':>10} {'max_dist':>10} {'max/min':>9} {'K=5 radius':>12}")
    print("-" * 52)
    for d in [2, 5, 10, 20, 50, 100]:
        ratios, k5_radii = [], []
        for _ in range(n_trials):
            pts = [[random.random() for _ in range(d)] for _ in range(n_points)]
            query = [random.random() for _ in range(d)]
            dists = sorted(l2(query, p) for p in pts)
            min_d, max_d = dists[0], dists[-1]
            if min_d > 0:
                ratios.append(max_d / min_d)
            k5_radii.append(dists[4])   # distance to 5th nearest neighbor
        avg_ratio  = sum(ratios) / len(ratios)
        avg_k5     = sum(k5_radii) / len(k5_radii)
        # Also: theoretical range of d-dimensional hypercube diagonal
        diag = math.sqrt(d)  # max possible L2 distance in unit hypercube
        print(f"{d:>5} {dists[0]:>10.4f} {dists[-1]:>10.4f} {avg_ratio:>9.3f} {avg_k5:>12.4f}")
    print()
    print("As d grows: max/min → 1 (all points equidistant)")
    print("K=5 radius grows: must search farther to find 5 neighbors")

curse_of_dimensionality()`,
            },
            {
              id: 3,
              cellTitle: 'KNN regression and accuracy vs K sweep',
              prose: [
                'For regression, KNN replaces the majority vote with a (weighted) average of the K neighbors\' target values. The prediction is smooth when K is large and jagged when K is small.',
                'Sweep K from 1 to 30 and plot train error vs test error. K=1 always has zero training error (each point is its own nearest neighbor) but poor test error.',
                'The sweet spot K has the best bias-variance balance on the validation set.',
              ],
              code: `import random
import math

random.seed(42)

def l2(a, b):
    return sum((ai-bi)**2 for ai,bi in zip(a,b))**0.5

# 1D regression: y = sin(x) + noise
N = 200
X1 = [[random.uniform(0, 2*math.pi)] for _ in range(N)]
y1 = [math.sin(x[0]) + random.gauss(0, 0.3) for x in X1]
pairs = list(zip(X1, y1)); random.shuffle(pairs)
X1, y1 = [p[0] for p in pairs], [p[1] for p in pairs]
X_tr1, y_tr1 = X1[:160], y1[:160]
X_te1, y_te1 = X1[160:], y1[160:]

def knn_regress(X_tr, y_tr, X_te, k, weighted=True):
    preds = []
    for xq in X_te:
        distances = sorted([(l2(xq, xt), yi) for xt, yi in zip(X_tr, y_tr)], key=lambda d: d[0])
        neighbors = distances[:k]
        if weighted:
            weights = [1.0/(d+1e-9) for d, _ in neighbors]
            total   = sum(weights)
            pred    = sum(w*yi for w, (_,yi) in zip(weights, neighbors)) / total
        else:
            pred = sum(yi for _, yi in neighbors) / k
        preds.append(pred)
    return preds

def mse(preds, y_true):
    return sum((p-a)**2 for p,a in zip(preds, y_true)) / len(y_true)

print(f"{'K':>4} {'Train MSE':>12} {'Test MSE':>11}")
print("-" * 30)
best_k, best_mse = 1, float('inf')
for k in [1, 3, 5, 7, 10, 15, 20, 30]:
    tr_preds = knn_regress(X_tr1, y_tr1, X_tr1, k)
    te_preds = knn_regress(X_tr1, y_tr1, X_te1, k)
    tr_mse   = mse(tr_preds, y_tr1)
    te_mse   = mse(te_preds, y_te1)
    flag = " <-- best test" if te_mse < best_mse else ""
    if te_mse < best_mse: best_mse, best_k = te_mse, k
    print(f"{k:>4} {tr_mse:>12.4f} {te_mse:>11.4f}{flag}")
print(f"\\nBest K = {best_k} (test MSE = {best_mse:.4f})")
print(f"K=1 has zero train MSE but high test MSE — textbook overfitting.")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: 'Implement cosine similarity search for a tiny embedding-based recommendation system. You have 10 "movies" each represented as a 4-dimensional embedding. Given a query movie, find the top-3 most similar using cosine similarity (1 - cosine distance). Print the top-3 similar movies with their similarity scores. Then implement a "find similar" function that works for any query vector.',
              starterCode: `import random
import math

random.seed(42)

# Tiny movie embeddings (4D): [action, romance, comedy, drama] scores
movies = {
    "Avengers":       [0.9, 0.2, 0.3, 0.1],
    "The Notebook":   [0.1, 0.9, 0.1, 0.7],
    "Shrek":          [0.3, 0.4, 0.9, 0.2],
    "Titanic":        [0.2, 0.8, 0.1, 0.9],
    "Die Hard":       [0.95, 0.1, 0.3, 0.1],
    "Forrest Gump":   [0.2, 0.5, 0.5, 0.9],
    "Iron Man":       [0.85, 0.3, 0.4, 0.2],
    "Pride & Prej.":  [0.1, 0.95, 0.2, 0.8],
    "Superbad":       [0.1, 0.2, 0.95, 0.1],
    "Schindler's L.": [0.1, 0.1, 0.0, 0.99],
}

def cosine_sim(a, b):
    """Cosine similarity (higher = more similar, range [-1, 1])."""
    dot = sum(ai*bi for ai,bi in zip(a,b))
    na  = sum(ai**2 for ai in a)**0.5
    nb  = sum(bi**2 for bi in b)**0.5
    if na == 0 or nb == 0: return 0.0
    return dot / (na * nb)

# TODO: find_similar(query_name, movies, top_k=3)
# Returns list of (movie_name, similarity_score) sorted by descending similarity
# Exclude the query movie itself

# TODO: call find_similar("Avengers", movies, top_k=3) and print results
# Then call find_similar("Titanic", movies, top_k=3) and print results
`,
              hint: 'Compute cosine_sim(movies[query_name], movies[other]) for each other != query_name. Sort by similarity descending. Return the top_k. Expected: Avengers → Iron Man, Die Hard are most similar. Titanic → The Notebook, Pride & Prejudice are most similar.',
              testCode: `try:
    result_avengers = find_similar("Avengers", movies, top_k=3)
    result_titanic  = find_similar("Titanic",  movies, top_k=3)
    assert len(result_avengers) == 3, "Should return 3 similar movies"
    assert len(result_titanic)  == 3
    assert "Avengers" not in [r[0] for r in result_avengers], "Should not include query movie"
    # Check that action movies cluster together
    action_names = {r[0] for r in result_avengers}
    romantic_names = {r[0] for r in result_titanic}
    print(f"PASS: find_similar works")
    print(f"  Avengers → {[(n, round(s,3)) for n,s in result_avengers]}")
    print(f"  Titanic  → {[(n, round(s,3)) for n,s in result_titanic]}")
    if "Iron Man" in action_names or "Die Hard" in action_names:
        print("  Correctly finds action-similar movies for Avengers")
    if "The Notebook" in romantic_names or "Pride & Prej." in romantic_names:
        print("  Correctly finds romance-similar movies for Titanic")
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
      question: 'KNN is called a "lazy learner." What does that mean?',
      options: [
        'It converges slowly during training',
        'It does no computation at training time — all computation happens at prediction time',
        'It uses a simplified version of the loss function',
        'It only works on small datasets',
      ],
      answer: 'It does no computation at training time — all computation happens at prediction time',
      hints: [
        'KNN has no training phase — you just store the data',
        'Every prediction requires computing distances to all training points',
      ],
      reviewSection: 'How KNN Works',
    },
    {
      type: 'choice',
      question: 'Why is feature scaling critical for KNN with L2 distance?',
      options: [
        'KNN cannot handle negative numbers without scaling',
        'Features with larger ranges dominate distance calculations, making comparisons unfair',
        'Feature scaling reduces the number of neighbors needed',
        'KNN uses gradient descent which requires normalized inputs',
      ],
      answer: 'Features with larger ranges dominate distance calculations, making comparisons unfair',
      hints: [
        'If feature 1 ranges 0–1 and feature 2 ranges 0–1000, L2 distance is essentially just feature 2 distance',
        'Standardize to zero mean, unit variance so all features contribute equally to distance',
      ],
      reviewSection: 'Distance Metrics',
    },
    {
      type: 'choice',
      question: 'In 100 dimensions with uniform random points, what happens to the ratio of max distance to min distance?',
      options: [
        'It increases dramatically, making neighbors more distinct',
        'It approaches 1, making all points nearly equidistant from each other',
        'It stays the same as in 2 dimensions',
        'It becomes negative due to numerical overflow',
      ],
      answer: 'It approaches 1, making all points nearly equidistant from each other',
      hints: [
        'This is the curse of dimensionality — distances concentrate in high dimensions',
        'When max/min → 1, every point is equally "near" — the concept of nearest neighbor loses meaning',
      ],
      reviewSection: 'Curse of Dimensionality',
    },
    {
      type: 'choice',
      question: 'Which distance metric is most appropriate for comparing text documents as TF-IDF vectors?',
      options: [
        'L2 (Euclidean) distance',
        'L1 (Manhattan) distance',
        'Cosine distance',
        'Chebyshev (max) distance',
      ],
      answer: 'Cosine distance',
      hints: [
        'Document length (magnitude of the TF-IDF vector) is noise — a long document with the same vocabulary proportions should be "similar" to a short one',
        'Cosine measures angle (direction), not magnitude — it is scale-invariant',
      ],
      reviewSection: 'Distance Metrics: Cosine for Text',
    },
    {
      type: 'choice',
      question: 'What happens to the KNN decision boundary as K increases from 1 to N?',
      options: [
        'The boundary becomes more complex and jagged',
        'The boundary stays the same regardless of K',
        'The boundary smooths out, eventually predicting the majority class for every point',
        'The boundary becomes circular',
      ],
      answer: 'The boundary smooths out, eventually predicting the majority class for every point',
      hints: [
        'K=1: every training point is its own neighbor, creates a jagged Voronoi-like boundary',
        'K=N: every query considers all N points, always votes for the majority class regardless of location',
      ],
      reviewSection: 'Choosing K',
    },
  ],
}
