export default {
  id: 'ae-p1-14-norms-distances',
  slug: 'norms-distances',
  chapter: 'ae-p1',
  order: 13,
  title: 'Norms and Distances',
  subtitle: 'L1 makes models sparse. L2 keeps them small. Cosine ignores scale. Each solves a different problem.',
  tags: ['norms', 'L1', 'L2', 'cosine-similarity', 'distances', 'regularization', 'Mahalanobis', 'embeddings'],

  hook: {
    question: 'Why does L1 regularization produce sparse weights while L2 does not?',
    realWorldContext:
      'Norms are everywhere in ML: L2 norm (Euclidean distance) in k-NN and clustering, cosine similarity in every embedding search (RAG, recommendations, semantic search), L1 regularization (Lasso) for feature selection, L2 regularization (Ridge/weight decay) for preventing overfitting. The geometry of each norm directly determines what kind of solutions a regularized model finds. L1 has sharp corners at the axes — solutions get pushed to those corners (sparse). L2 is a smooth ball — solutions get pushed toward the origin uniformly (small but non-zero). Understanding norms is understanding why regularization works the way it does.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A norm ‖x‖ measures the "size" or "length" of a vector. Different norms measure differently. L1 (Manhattan): ‖x‖₁ = Σ|xᵢ|. Add up absolute values — distance a taxi drives on a grid. L2 (Euclidean): ‖x‖₂ = √(Σxᵢ²). Straight-line distance. L∞ (Chebyshev): ‖x‖∞ = max|xᵢ|. The largest single component dominates.',
      'Cosine similarity measures the angle between two vectors, ignoring magnitude: cos(θ) = a·b / (‖a‖₂‖b‖₂). Two documents with the same word proportions but different lengths get cosine similarity 1. This is why it is used for embedding search — whether a document is short or long should not change its semantic similarity. The distance version is 1 - cosine_similarity. Mahalanobis distance accounts for correlations between dimensions — essential when features have different scales or are correlated.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Regularization = constrained optimization in norm ball geometry',
        body: 'L2 regularization (weight decay) = solution lies in an L2 ball (sphere). Optimal solution is wherever the loss surface first touches the sphere. Since a sphere has no flat edges, this almost never happens at an axis — all weights are small but non-zero.\n\nL1 regularization = solution lies in an L1 ball (diamond shape). The diamond has corners on the axes. The loss surface touches a corner first → many weights exactly 0. This is why Lasso produces sparse models: it is a geometric consequence of the L1 ball shape.',
      },
      {
        type: 'insight',
        title: 'Cosine similarity is the core of all modern embedding search',
        body: 'OpenAI text-embedding-3, Sentence-BERT, and all RAG systems compute cosine similarity between query and document embeddings. In high-dimensional spaces, Euclidean distance is unreliable (curse of dimensionality — all points become equidistant). Cosine similarity measures alignment, not distance, and degrades much more gracefully in high dimensions.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Norms and Distances',
        mathBridge: '‖x‖ₚ = (Σ|xᵢ|ᵖ)^(1/p). Cosine(a,b) = a·b / (‖a‖₂ ‖b‖₂). Distance = 1 - cosine. Mahalanobis = sqrt((x-μ)ᵀ Σ⁻¹ (x-μ)).',
        caption: 'Implement all major norms and distances from scratch. See the regularization geometry.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'L1, L2, Lp, L∞ norms',
              prose: [
                '## The p-norm family',
                '```\n‖x‖₁ = Σ|xᵢ|                   (Manhattan/L1)\n‖x‖₂ = √(Σxᵢ²)                (Euclidean/L2)\n‖x‖ₚ = (Σ|xᵢ|ᵖ)^(1/p)        (general Lp)\n‖x‖∞ = max|xᵢ|                 (Chebyshev/L∞, limit as p→∞)\n```',
                'All norms satisfy: non-negativity, definiteness (‖x‖=0 ↔ x=0), homogeneity (‖αx‖=|α|‖x‖), and triangle inequality (‖x+y‖ ≤ ‖x‖+‖y‖).',
              ],
              code: `import math

def l1_norm(x): return sum(abs(xi) for xi in x)
def l2_norm(x): return sum(xi**2 for xi in x) ** 0.5
def lp_norm(x, p):
    if p == float('inf'): return max(abs(xi) for xi in x)
    return sum(abs(xi)**p for xi in x) ** (1/p)

x = [3.0, -4.0, 0.0]
print(f"x = {x}")
print(f"  L1 norm: {l1_norm(x):.4f}  (sum of absolutes)")
print(f"  L2 norm: {l2_norm(x):.4f}  (Euclidean, sqrt(9+16) = 5)")
print(f"  L3 norm: {lp_norm(x, 3):.4f}")
print(f"  L∞ norm: {lp_norm(x, float('inf')):.4f}  (max component = 4)")

# Distances: same norms applied to difference vector
def l1_dist(a, b): return l1_norm([ai-bi for ai,bi in zip(a,b)])
def l2_dist(a, b): return l2_norm([ai-bi for ai,bi in zip(a,b)])

a = [0.0, 0.0]
b = [3.0, 4.0]
print(f"\\na = {a}, b = {b}")
print(f"  L1 distance (Manhattan): {l1_dist(a, b):.4f}  (taxi: 3+4=7)")
print(f"  L2 distance (Euclidean): {l2_dist(a, b):.4f}  (straight: sqrt(9+16)=5)")

# Norm unit balls: compare what x has ‖x‖ = 1 in each norm
print("\\nPoints on unit 'circle' (‖x‖=1) for 2D vector [a,b]:")
print("  L1: all |a|+|b|=1 → diamond shape")
print("  L2: all a²+b²=1  → actual circle")
print("  L∞: all max(|a|,|b|)=1 → square")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Cosine similarity and embedding search',
              prose: [
                '## Cosine Similarity',
                '```\ncos(θ) = a·b / (‖a‖₂ × ‖b‖₂)    ∈ [-1, 1]\n```',
                '- **1**: identical direction (most similar)',
                '- **0**: perpendicular (unrelated)',
                '- **-1**: opposite direction (most different)',
                '## Why Use Cosine for Embeddings?',
                'Two documents: one 100 words, one 5000 words, same topic. Euclidean distance is huge (different magnitudes). Cosine distance is near zero (same direction). Cosine similarity captures semantic similarity independent of text length.',
              ],
              code: `import math

def cosine_similarity(a, b):
    dot = sum(ai*bi for ai,bi in zip(a,b))
    norm_a = sum(x**2 for x in a)**0.5
    norm_b = sum(x**2 for x in b)**0.5
    if norm_a == 0 or norm_b == 0: return 0.0
    return dot / (norm_a * norm_b)

def cosine_distance(a, b):
    return 1.0 - cosine_similarity(a, b)

def find_most_similar(query, corpus):
    """Return (best_match, similarity) from corpus dict {name: vector}."""
    best, best_sim = None, -2
    for name, vec in corpus.items():
        sim = cosine_similarity(query, vec)
        if sim > best_sim:
            best, best_sim = name, sim
    return best, best_sim

# Embedding search: find closest document to query
# (simplified 4D embeddings — real ones are 768D+)
documents = {
    "machine_learning":    [0.9, 0.1, 0.2, 0.1],
    "deep_learning":       [0.85, 0.15, 0.3, 0.05],
    "cooking_recipes":     [0.05, 0.9, 0.1, 0.8],
    "gardening_tips":      [0.1, 0.85, 0.05, 0.75],
    "neural_networks":     [0.8, 0.1, 0.35, 0.0],
}

query = [0.88, 0.12, 0.28, 0.08]  # should match ML/DL
best, sim = find_most_similar(query, documents)
print(f"Query: {query}")
print(f"Best match: {best}  (cosine similarity: {sim:.4f})")
print("\\nAll similarities:")
for name, vec in documents.items():
    s = cosine_similarity(query, vec)
    print(f"  {name:<22} {s:.4f}")

# Scale invariance: multiplying a vector by a constant doesn't change cosine similarity
a = [1.0, 2.0, 3.0]
b_small = [0.1, 0.2, 0.3]
b_large = [100.0, 200.0, 300.0]
print(f"\\nScale invariance:")
print(f"  cos(a, b_small): {cosine_similarity(a, b_small):.6f}")
print(f"  cos(a, b_large): {cosine_similarity(a, b_large):.6f}")
print("  (Identical — cosine only measures angle, not magnitude)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Regularization geometry: L1 vs L2',
              prose: [
                '## Why L1 → Sparsity, L2 → Smallness',
                'Regularization = add a penalty term to the loss:',
                '```\nL1: minimize Loss(w) + λ‖w‖₁   ← pushes toward L1 ball (diamond)\nL2: minimize Loss(w) + λ‖w‖₂²  ← pushes toward L2 ball (sphere)\n```',
                'The L1 ball has corners at the axes (e.g., [1,0,0,...]). When the loss surface first touches the L1 ball, it almost always hits a corner — setting most weights to exactly 0.',
                'The L2 ball is smooth everywhere — no corners. The optimal point is almost never exactly at an axis.',
              ],
              code: `import math

def l1_norm(x): return sum(abs(xi) for xi in x)
def l2_norm(x): return sum(xi**2 for xi in x) ** 0.5

# Simulate: gradient descent with L1 vs L2 regularization on a simple problem
# We want to fit: y ≈ w1 * x1 + w2 * x2 where x2 is not actually useful

import random
random.seed(42)
n = 50
X = [(random.gauss(0,1), random.gauss(0,1)) for _ in range(n)]
true_w = [2.0, 0.0]  # only x1 matters
y = [true_w[0]*x[0] + 0.1*random.gauss(0,1) for x in X]

def mse_loss(w, X, y):
    return sum((w[0]*xi[0] + w[1]*xi[1] - yi)**2 for xi, yi in zip(X, y)) / len(y)

def mse_grad(w, X, y):
    n = len(y)
    g0 = sum(2*(w[0]*xi[0] + w[1]*xi[1] - yi)*xi[0] for xi,yi in zip(X,y)) / n
    g1 = sum(2*(w[0]*xi[0] + w[1]*xi[1] - yi)*xi[1] for xi,yi in zip(X,y)) / n
    return [g0, g1]

def train(X, y, lam, reg_type='l2', lr=0.01, steps=500):
    w = [0.0, 0.0]
    for _ in range(steps):
        g = mse_grad(w, X, y)
        if reg_type == 'l2':
            w = [wi - lr*(gi + 2*lam*wi) for wi,gi in zip(w,g)]
        elif reg_type == 'l1':
            sign = [1 if wi > 0 else -1 if wi < 0 else 0 for wi in w]
            w = [wi - lr*(gi + lam*si) for wi,gi,si in zip(w,g,sign)]
        else:
            w = [wi - lr*gi for wi,gi in zip(w,g)]
    return w

w_no_reg = train(X, y, lam=0, reg_type='none')
w_l2 = train(X, y, lam=0.5, reg_type='l2')
w_l1 = train(X, y, lam=0.3, reg_type='l1')

print(f"True weights:    w1={true_w[0]:.3f}, w2={true_w[1]:.3f}")
print(f"No regularization: w1={w_no_reg[0]:.4f}, w2={w_no_reg[1]:.4f}")
print(f"L2 (Ridge):        w1={w_l2[0]:.4f}, w2={w_l2[1]:.4f}  (w2 small but not 0)")
print(f"L1 (Lasso):        w1={w_l1[0]:.4f}, w2={w_l1[1]:.4f}  (w2 ≈ 0, sparse)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Frobenius norm and matrix distances',
              prose: [
                '## Matrix Norms',
                '```\nFrobenius norm: ‖A‖_F = sqrt(Σᵢⱼ aᵢⱼ²) = sqrt(trace(AᵀA)) = sqrt(Σ σᵢ²)\nSpectral norm:  ‖A‖₂ = σ_max   (largest singular value)\nNuclear norm:   ‖A‖_* = Σ σᵢ  (sum of all singular values, promotes low rank)\n```',
                '## Applications',
                '- **Frobenius**: ‖W_original - W_quantized‖_F measures quantization error',
                '- **Spectral norm**: controls Lipschitz constant of a layer (spectral normalization in GANs)',
                '- **Nuclear norm**: the convex relaxation of rank — minimizing it promotes low-rank solutions (LoRA)',
              ],
              code: `import numpy as np

# Matrix norms
A = np.array([[1, 2, 3], [4, 5, 6]], dtype=float)
print(f"Matrix A (shape {A.shape}):")
print(A)

frobenius = np.linalg.norm(A, 'fro')
spectral = np.linalg.norm(A, 2)  # largest singular value
U, S, Vt = np.linalg.svd(A, full_matrices=False)
nuclear = S.sum()

print(f"\\nFrobenius ‖A‖_F:  {frobenius:.4f}  (= sqrt({sum(A.ravel()**2):.0f}))")
print(f"Spectral ‖A‖₂:    {spectral:.4f}  (= σ_max = {S[0]:.4f})")
print(f"Nuclear ‖A‖_*:    {nuclear:.4f}  (= Σσᵢ = {S.round(4)})")
print(f"Verify Frobenius = sqrt(Σσᵢ²): {np.sqrt((S**2).sum()):.4f}")

# Gradient norm clipping (used in training to prevent exploding gradients)
def clip_gradient(grads, max_norm=1.0):
    """Clip gradient list to have total L2 norm <= max_norm."""
    total_norm = sum(g**2 for g in grads) ** 0.5
    if total_norm > max_norm:
        scale = max_norm / total_norm
        return [g * scale for g in grads], total_norm
    return list(grads), total_norm

grads = [3.0, -4.0, 0.5]  # L2 norm = 5
clipped, norm = clip_gradient(grads, max_norm=1.0)
print(f"\\nGradient norm clipping:")
print(f"  Original grads: {grads}  (norm={norm:.2f})")
print(f"  Clipped grads:  {[round(g,4) for g in clipped]}  (norm={sum(g**2 for g in clipped)**0.5:.4f})")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement cosine similarity search',
              difficulty: 'easy',
              prompt: 'Implement `cosine_similarity(a, b)` and `top_k_similar(query, embeddings, k)` where embeddings is a dict mapping names to vectors. Return the k most similar names and their similarity scores, sorted descending.',
              code: `import math

def cosine_similarity(a, b):
    """Cosine similarity between two vectors."""
    pass

def top_k_similar(query, embeddings, k):
    """Return [(name, similarity)] for top k most similar embeddings."""
    pass

# Simulate word embeddings (5D)
embeddings = {
    "cat":    [0.8, 0.1, 0.5, 0.2, 0.0],
    "kitten": [0.75, 0.15, 0.45, 0.25, 0.05],
    "dog":    [0.7, 0.2, 0.4, 0.1, 0.1],
    "ocean":  [0.1, 0.9, 0.1, 0.0, 0.8],
    "sea":    [0.15, 0.85, 0.05, 0.05, 0.75],
    "river":  [0.2, 0.8, 0.15, 0.1, 0.6],
}

query = [0.78, 0.12, 0.48, 0.22, 0.02]  # should be closest to "cat"
results = top_k_similar(query, embeddings, k=3)
print("Top 3 most similar to query:")
for name, sim in results:
    print(f"  {name:>8}: {sim:.4f}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'cosine_similarity' not in dir() or 'top_k_similar' not in dir():
    res = "ERROR: cosine_similarity or top_k_similar not defined."
else:
    # Identical vectors should have cosine = 1
    a = [1.0, 2.0, 3.0]
    cs = cosine_similarity(a, a)
    if abs(cs - 1.0) > 0.001:
        res = f"ERROR: cosine_similarity(a,a) should be 1.0, got {cs}"
    else:
        # Orthogonal vectors should have cosine = 0
        b = [0.0, 0.0, 1.0]
        c = [1.0, 0.0, 0.0]
        cs2 = cosine_similarity(b, c)
        if abs(cs2) > 0.001:
            res = f"ERROR: cosine_similarity of orthogonal vectors should be 0, got {cs2}"
        else:
            embeddings = {"a": [1,0,0], "b": [0,1,0], "c": [0.9, 0.1, 0]}
            q = [1.0, 0.0, 0.0]
            results = top_k_similar(q, embeddings, k=2)
            if results[0][0] != "a":
                res = f"ERROR: top match for [1,0,0] should be 'a', got '{results[0][0]}'"
            elif results[0][1] < results[1][1]:
                res = "ERROR: results should be sorted descending by similarity"
            else:
                res = f"SUCCESS: cosine_similarity and top_k_similar work. Top match: {results[0]}"
res
`,
              hint: 'cosine_similarity: dot = sum(ai*bi). mag = sqrt(sum(x^2)). return dot/(mag_a*mag_b). top_k_similar: compute similarity for each embedding, sort by descending similarity, return first k as [(name, sim)] list.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'The L1 norm of vector [3, -4, 0] is:',
      options: [
        '5 (Euclidean distance)',
        '7 (sum of absolute values)',
        '4 (maximum component)',
        '9 (sum of squares)',
      ],
      correct: 1,
      explanation: '‖x‖₁ = |3| + |-4| + |0| = 3 + 4 + 0 = 7. L2 norm = sqrt(9+16+0) = 5. L∞ norm = max(3,4,0) = 4.',
    },
    {
      id: 'q2',
      question: 'Why does L1 regularization produce sparse models (many zero weights) while L2 does not?',
      options: [
        'L1 is stronger regularization so it pushes more weights to zero',
        'The L1 ball has corners on the axes; L2 is a smooth sphere. Loss surfaces first touch corners, setting those weights to exactly zero',
        'L1 regularization clips weights below a threshold to zero',
        'L2 regularization adds a soft constraint while L1 adds a hard constraint',
      ],
      correct: 1,
      explanation: 'Geometrically, the constrained optimal solution is where the loss surface first touches the norm ball. The L1 ball (diamond) has corners at axis-aligned points like [1,0,0,...]. These are the most likely contact points. The L2 ball (sphere) is smooth — contact occurs everywhere with equal probability, almost never exactly on an axis.',
    },
    {
      id: 'q3',
      question: 'Two document vectors: A = [1,2,3] and B = [2,4,6]. What is their cosine similarity?',
      options: [
        '0 (perpendicular)',
        '0.5 (partially aligned)',
        '1 (identical direction)',
        '√14 (Euclidean distance)',
      ],
      correct: 2,
      explanation: 'B = 2A, so they point in exactly the same direction. cos(A,B) = A·B / (‖A‖‖B‖) = (2+8+18) / (√14 × √56) = 28 / √784 = 28/28 = 1. Cosine similarity is 1 regardless of scale.',
    },
    {
      id: 'q4',
      question: 'Gradient clipping limits the total L2 norm of the gradient vector to max_norm. If the current norm is 10 and max_norm = 1, how are gradients rescaled?',
      options: [
        'All components above 1 are clipped to 1',
        'All components are multiplied by 1/10',
        'Only the largest component is reduced',
        'Gradients are set to zero if the norm exceeds max_norm',
      ],
      correct: 1,
      explanation: 'Gradient clipping: if ‖g‖₂ > max_norm, scale = max_norm/‖g‖₂ = 1/10. All components are multiplied by scale = 0.1. The direction is preserved; only the magnitude is limited.',
    },
    {
      id: 'q5',
      question: 'The nuclear norm ‖A‖_* = Σ σᵢ promotes what property in matrix optimization?',
      options: [
        'Sparse columns (many zero columns)',
        'Low rank (few non-zero singular values)',
        'Orthogonality of rows',
        'Symmetry of the matrix',
      ],
      correct: 1,
      explanation: 'Nuclear norm is the convex relaxation of rank (the minimum rank is NP-hard to minimize directly). Minimizing ‖A‖_* encourages many singular values to be zero, which means low rank. This is why adding a nuclear norm penalty to a recommendation problem produces low-rank matrix factorizations.',
    },
  ],
}
