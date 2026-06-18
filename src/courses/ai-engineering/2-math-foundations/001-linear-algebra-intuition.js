export default {
  id: 'ae-p1-01-linear-algebra-intuition',
  slug: 'linear-algebra-intuition',
  chapter: 'ae-p1',
  order: 0,
  title: 'Linear Algebra Intuition',
  subtitle: 'Every AI model is just matrix math wearing a fancy hat.',
  tags: ['linear-algebra', 'vectors', 'matrices', 'dot-product', 'projection', 'gram-schmidt', 'rank', 'embeddings', 'lora'],

  hook: {
    question: 'What is a neural network actually doing to your data?',
    realWorldContext:
      'Open any ML paper. Within the first page, you\'ll see vectors, matrices, dot products, and transformations. Without linear algebra intuition, these are just symbols. With it, you can see what a neural network is actually doing — moving points around in space. You don\'t need to be a mathematician. You need to see what these operations mean geometrically, then code them yourself.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A vector is a list of numbers — coordinates in space. In AI, vectors represent everything: a word is a vector of 768 numbers (its "meaning" in embedding space), an image is a vector of pixel values, a user is a vector of preferences. The dot product of two vectors measures how similar they are — this is literally how search engines, recommendation systems, and RAG work.',
      'A matrix transforms one vector into another. Neural network weights are matrices. Attention scores are matrices. LoRA fine-tunes large models by decomposing weight updates into low-rank matrices — instead of updating a 4096×4096 weight matrix (16M parameters), LoRA updates two matrices of size 4096×16 and 16×4096 (131K parameters).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The dot product is the core of similarity search',
        body: '`a · b > 0`: same direction (similar). `a · b = 0`: perpendicular (unrelated). `a · b < 0`: opposite direction (dissimilar). This is how RAG retrieval, recommendation systems, and transformer attention all work.',
      },
      {
        type: 'insight',
        title: 'Rank-deficient features cause multicollinearity',
        body: 'If feature_3 = 2*feature_1 + feature_2, adding feature_3 gives the model zero new information and makes the normal equations singular — no unique solution for the weights. Rank = number of independent dimensions of information.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Linear Algebra Intuition',
        mathBridge: 'dot(a, b) = |a||b|cos(θ). When θ=0 (same direction): cos=1, dot is max. When θ=90° (perpendicular): cos=0, dot=0. Cosine similarity normalizes by magnitudes: cos(θ) = a·b / (|a||b|).',
        caption: 'Build vectors and matrices from scratch to see what neural networks are actually computing.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Vectors from scratch',
              prose: [
                '## Vectors Are Points (and Directions)',
                'A vector is a list of numbers representing coordinates in space. The dot product measures alignment.',
                '## The dot product',
                '```\na · b = a₁×b₁ + a₂×b₂ + ... + aₙ×bₙ\n\nSame direction:      a · b > 0  (similar)\nPerpendicular:       a · b = 0  (unrelated)\nOpposite direction:  a · b < 0  (dissimilar)\n```',
                'This is how search engines and RAG work — find vectors with high dot products.',
              ],
              code: `class Vector:
    def __init__(self, components):
        self.components = list(components)
        self.dim = len(self.components)

    def __add__(self, other):
        return Vector([a + b for a, b in zip(self.components, other.components)])

    def __sub__(self, other):
        return Vector([a - b for a, b in zip(self.components, other.components)])

    def dot(self, other):
        return sum(a * b for a, b in zip(self.components, other.components))

    def magnitude(self):
        return sum(x**2 for x in self.components) ** 0.5

    def normalize(self):
        mag = self.magnitude()
        return Vector([x / mag for x in self.components])

    def cosine_similarity(self, other):
        return self.dot(other) / (self.magnitude() * other.magnitude())

    def __repr__(self):
        return f"Vector({self.components})"


a = Vector([1, 2, 3])
b = Vector([4, 5, 6])

print(f"a + b = {a + b}")
print(f"a · b = {a.dot(b)}")
print(f"|a| = {a.magnitude():.4f}")
print(f"cosine similarity = {a.cosine_similarity(b):.4f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Matrices from scratch',
              prose: [
                '## Matrices Are Transformations',
                'A matrix transforms one vector into another. It can rotate, scale, stretch, or project.',
                '## In AI, matrices ARE the model',
                '- Neural network weights → matrices that transform input into output\n- Attention scores → matrices that decide what to focus on\n- Embeddings → matrices that map words to vectors',
              ],
              code: `class Matrix:
    def __init__(self, rows):
        self.rows = [list(row) for row in rows]
        self.shape = (len(self.rows), len(self.rows[0]))

    def __matmul__(self, other):
        if isinstance(other, Vector):
            return Vector([
                sum(self.rows[i][j] * other.components[j] for j in range(self.shape[1]))
                for i in range(self.shape[0])
            ])
        rows = []
        for i in range(self.shape[0]):
            row = []
            for j in range(other.shape[1]):
                row.append(sum(
                    self.rows[i][k] * other.rows[k][j]
                    for k in range(self.shape[1])
                ))
            rows.append(row)
        return Matrix(rows)

    def transpose(self):
        return Matrix([
            [self.rows[j][i] for j in range(self.shape[0])]
            for i in range(self.shape[1])
        ])

    def __repr__(self):
        return f"Matrix({self.rows})"


rotation_90 = Matrix([[0, -1], [1, 0]])
point = Vector([3, 1])

rotated = rotation_90 @ point
print(f"Original: {point}")
print(f"Rotated 90°: {rotated}")

import random
random.seed(42)
weights = Matrix([[random.gauss(0, 0.1) for _ in range(3)] for _ in range(2)])
input_vector = Vector([1.0, 0.5, -0.3])
output = weights @ input_vector
print(f"\\nInput (3D): {input_vector}")
print(f"Output (2D): {output}")
print("This is what a neural network layer does -- matrix multiplication.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Linear independence, projection, and Gram-Schmidt',
              prose: [
                '## Linear Independence',
                'Vectors are linearly independent if no vector in the set can be written as a combination of the others. In a dataset: if feature_3 = 2*feature_1 + feature_2, adding feature_3 gives zero new information and makes the normal equations singular.',
                '## Projection',
                'Projecting vector **a** onto **b**: `proj_b(a) = (a · b / b · b) * b`\n\nThe residual (a - proj_b(a)) is perpendicular to b. Linear regression minimizes the distance from observations to the column space — the solution IS a projection.',
                '## Gram-Schmidt',
                'Converts any set of independent vectors into an orthonormal basis: each vector has length 1 and every pair is perpendicular.',
              ],
              code: `def is_linearly_independent(vectors):
    n = len(vectors)
    dim = len(vectors[0].components)
    rows = [v.components[:] for v in vectors]
    rank = 0
    for col in range(dim):
        pivot = None
        for row in range(rank, len(rows)):
            if abs(rows[row][col]) > 1e-10:
                pivot = row
                break
        if pivot is None:
            continue
        rows[rank], rows[pivot] = rows[pivot], rows[rank]
        scale = rows[rank][col]
        rows[rank] = [x / scale for x in rows[rank]]
        for row in range(len(rows)):
            if row != rank and abs(rows[row][col]) > 1e-10:
                factor = rows[row][col]
                rows[row] = [rows[row][j] - factor * rows[rank][j] for j in range(dim)]
        rank += 1
    return rank == n


def project(a, b):
    scalar = a.dot(b) / b.dot(b)
    return Vector([scalar * x for x in b.components])


def gram_schmidt(vectors):
    orthonormal = []
    for v in vectors:
        w = v
        for u in orthonormal:
            proj = project(w, u)
            w = w - proj
        if w.magnitude() < 1e-10:
            continue
        orthonormal.append(w.normalize())
    return orthonormal


v1 = Vector([1, 0, 0])
v2 = Vector([1, 1, 0])
v3 = Vector([1, 1, 1])
basis = gram_schmidt([v1, v2, v3])
for i, u in enumerate(basis):
    print(f"u{i+1} = {[round(x, 4) for x in u.components]}")
    print(f"  |u{i+1}| = {u.magnitude():.6f}")

print(f"u1 · u2 = {basis[0].dot(basis[1]):.6f}")
print(f"u1 · u3 = {basis[0].dot(basis[2]):.6f}")
print(f"u2 · u3 = {basis[1].dot(basis[2]):.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'NumPy: what you\'ll actually use',
              prose: [
                '## Same operations, 100x faster',
                '```python\nimport numpy as np\n\na = np.array([1, 2, 3], dtype=float)\nb = np.array([4, 5, 6], dtype=float)\n\nprint(f"a + b = {a + b}")\nprint(f"a · b = {np.dot(a, b)}")\nprint(f"|a| = {np.linalg.norm(a):.4f}")\nprint(f"cosine = {np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)):.4f}")\n\nW = np.random.randn(2, 3) * 0.1\nx = np.array([1.0, 0.5, -0.3])\nprint(f"Wx = {W @ x}")\n```',
                '## Connection to AI: LoRA',
                'LoRA fine-tunes large language models by decomposing weight updates into low-rank matrices. Instead of updating a 4096×4096 matrix (16M parameters), LoRA updates two matrices of size 4096×16 and 16×4096 (131K parameters). The rank-16 constraint assumes the update lives in a 16-dimensional subspace. That is linear algebra doing real work.',
              ],
              code: `import numpy as np

a = np.array([1, 2, 3], dtype=float)
b = np.array([4, 5, 6], dtype=float)

print(f"a + b = {a + b}")
print(f"a · b = {np.dot(a, b)}")
print(f"|a| = {np.linalg.norm(a):.4f}")
print(f"cosine = {np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)):.4f}")

W = np.random.randn(2, 3) * 0.1
x = np.array([1.0, 0.5, -0.3])
print(f"\\nWx = {W @ x}")

# Rank and projection
A = np.array([[1, 2], [2, 4]])
print(f"\\nRank: {np.linalg.matrix_rank(A)}")

a2 = np.array([3, 4])
b2 = np.array([1, 0])
proj = (np.dot(a2, b2) / np.dot(b2, b2)) * b2
print(f"Projection of {a2} onto {b2}: {proj}")

# LoRA concept: rank-16 update to a large weight matrix
W_full = np.random.randn(4096, 4096)     # 16M parameters
A_lora = np.random.randn(4096, 16)       # 65K parameters
B_lora = np.random.randn(16, 4096)       # 65K parameters
W_update = A_lora @ B_lora              # rank-16 update
print(f"\\nLoRA: full weight {W_full.shape} = {W_full.size:,} params")
print(f"LoRA A: {A_lora.shape}, B: {B_lora.shape} = {A_lora.size + B_lora.size:,} params")
print(f"Compression ratio: {W_full.size / (A_lora.size + B_lora.size):.0f}x")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Vector class with angle_between',
              difficulty: 'easy',
              prompt: 'Implement `angle_between(self, other)` on the `Vector` class that returns the angle in degrees between two vectors. Use the formula: `theta = arccos(a · b / (|a| * |b|))`. Also add `project_onto(self, other)` that returns the projection of `self` onto `other` as a new Vector.',
              code: `import math

class Vector:
    def __init__(self, components):
        self.components = list(components)

    def dot(self, other):
        return sum(a * b for a, b in zip(self.components, other.components))

    def magnitude(self):
        return sum(x**2 for x in self.components) ** 0.5

    def normalize(self):
        mag = self.magnitude()
        return Vector([x / mag for x in self.components])

    def angle_between(self, other):
        """Return angle in degrees between self and other."""
        pass

    def project_onto(self, other):
        """Return projection of self onto other as a new Vector."""
        pass

    def __repr__(self):
        return f"Vector({[round(x, 4) for x in self.components]})"


a = Vector([1, 0])
b = Vector([0, 1])
print(f"Angle between {a} and {b}: {a.angle_between(b):.1f}°")  # 90.0

c = Vector([1, 1, 0])
d = Vector([1, 0, 0])
print(f"Angle between {c} and {d}: {c.angle_between(d):.1f}°")  # 45.0

e = Vector([3, 4])
f = Vector([1, 0])
proj = e.project_onto(f)
print(f"Projection of {e} onto {f}: {proj}")  # Vector([3.0, 0.0])
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'Vector' not in dir() or not hasattr(Vector([1,0]), 'angle_between'):
    res = "ERROR: Vector class or angle_between not defined."
else:
    a = Vector([1, 0])
    b = Vector([0, 1])
    angle = a.angle_between(b)
    if abs(angle - 90.0) > 0.01:
        res = f"ERROR: angle between [1,0] and [0,1] should be 90.0°, got {angle}"
    else:
        c = Vector([1, 1])
        d = Vector([1, 0])
        angle2 = c.angle_between(d)
        if abs(angle2 - 45.0) > 0.01:
            res = f"ERROR: angle between [1,1] and [1,0] should be 45.0°, got {angle2}"
        else:
            e = Vector([3, 4])
            f = Vector([1, 0])
            proj = e.project_onto(f)
            if abs(proj.components[0] - 3.0) > 0.01 or abs(proj.components[1]) > 0.01:
                res = f"ERROR: projection of [3,4] onto [1,0] should be [3,0], got {proj}"
            else:
                res = "SUCCESS: angle_between and project_onto work correctly."
res
`,
              hint: 'angle_between: cos_theta = self.dot(other) / (self.magnitude() * other.magnitude()), then math.degrees(math.acos(max(-1, min(1, cos_theta)))). project_onto: scalar = self.dot(other) / other.dot(other), return Vector([scalar * x for x in other.components]).',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Cosine similarity search',
              difficulty: 'medium',
              prompt: 'Write `find_most_similar(query, embeddings)` where `query` is a list of floats and `embeddings` is a dict mapping name to list of floats. Return the name of the most similar embedding to the query using cosine similarity. This is the core operation in RAG and semantic search.',
              code: `import math

def cosine_similarity(a, b):
    dot = sum(x*y for x, y in zip(a, b))
    mag_a = sum(x**2 for x in a) ** 0.5
    mag_b = sum(x**2 for x in b) ** 0.5
    return dot / (mag_a * mag_b)

def find_most_similar(query, embeddings):
    """
    Find the most similar embedding to the query by cosine similarity.
    query: list of floats
    embeddings: dict {name: list_of_floats}
    Returns the name with the highest cosine similarity.
    """
    pass

# Simulate word embeddings (simplified 4D)
embeddings = {
    "king":    [0.9, 0.1, 0.8, 0.2],
    "queen":   [0.8, 0.2, 0.7, 0.9],
    "dog":     [0.1, 0.9, 0.1, 0.3],
    "cat":     [0.2, 0.8, 0.2, 0.4],
    "royalty": [0.85, 0.15, 0.75, 0.5],
}

query = [0.88, 0.12, 0.78, 0.3]  # should be closest to "king" or "royalty"
result = find_most_similar(query, embeddings)
print(f"Most similar to query: {result}")

print("\\nAll similarities:")
for name, emb in embeddings.items():
    sim = cosine_similarity(query, emb)
    print(f"  {name}: {sim:.4f}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'find_most_similar' not in dir():
    res = "ERROR: find_most_similar not defined."
else:
    embeddings = {
        "a": [1.0, 0.0, 0.0],
        "b": [0.0, 1.0, 0.0],
        "c": [0.9, 0.1, 0.0],  # most similar to query
    }
    query = [1.0, 0.0, 0.0]
    result = find_most_similar(query, embeddings)
    if result != "a":
        res = f"ERROR: query [1,0,0] should match 'a' (identical), got '{result}'"
    else:
        query2 = [0.9, 0.1, 0.0]
        result2 = find_most_similar(query2, embeddings)
        if result2 not in ("a", "c"):
            res = f"ERROR: query [0.9,0.1,0] should match 'a' or 'c', got '{result2}'"
        else:
            res = "SUCCESS: find_most_similar correctly finds the most similar embedding by cosine similarity."
res
`,
              hint: 'Compute cosine_similarity(query, emb) for each name in embeddings. Return the name with the maximum similarity. Use max(embeddings.keys(), key=lambda name: cosine_similarity(query, embeddings[name])).',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What does the dot product of two vectors measure?',
      options: [
        'The distance between the two vectors',
        'How similar or aligned the two vectors are',
        'The angle between the vectors in degrees',
        'The number of dimensions the vectors share',
      ],
      correct: 1,
      explanation: 'The dot product measures alignment: positive means same direction (similar), zero means perpendicular (unrelated), negative means opposite direction (dissimilar). This is the basis of similarity search in AI.',
    },
    {
      id: 'q2',
      question: "In AI, what does 'embedding' refer to?",
      options: [
        'Inserting one model inside another',
        'A vector representation that captures the meaning of something (word, image, user)',
        'A technique for compressing model weights',
        'The process of converting code to machine instructions',
      ],
      correct: 1,
      explanation: 'An embedding maps discrete objects (words, images, users) to continuous vectors in a high-dimensional space where similar items are close together. It is the bridge between real-world concepts and mathematical operations.',
    },
    {
      id: 'q3',
      question: 'Three vectors v1=[1,0,0], v2=[0,1,0], v3=[2,1,0] are given. Are they linearly independent?',
      options: [
        'Yes, because there are three vectors in 3D space',
        'No, because v3 = 2*v1 + v2, so v3 is a linear combination of the others',
        'Yes, because none of the vectors are identical',
        'No, because they all have a zero component',
      ],
      correct: 1,
      explanation: 'v3 = 2*v1 + v2, making the set linearly dependent. All three vectors lie in the xy-plane and cannot reach [0,0,1]. Despite having 3 vectors in 3D, they only span a 2D subspace.',
    },
    {
      id: 'q4',
      question: 'What does the rank of a matrix tell you in the context of machine learning?',
      options: [
        'How fast the matrix can be multiplied',
        'The number of linearly independent columns, indicating how many dimensions of useful information it contains',
        'The maximum value in the matrix',
        'The number of non-zero entries in the matrix',
      ],
      correct: 1,
      explanation: 'Rank equals the number of linearly independent columns. In ML, a rank-deficient feature matrix means redundant features, infinitely many weight solutions, and the need for regularization.',
    },
    {
      id: 'q5',
      question: 'How does LoRA (Low-Rank Adaptation) use linear algebra to efficiently fine-tune large language models?',
      options: [
        'It removes unused rows from weight matrices to shrink the model',
        'It decomposes weight updates into two small low-rank matrices instead of updating the full weight matrix',
        'It converts all weights from float32 to int8',
        'It freezes the embedding layer and only trains the output head',
      ],
      correct: 1,
      explanation: 'LoRA decomposes a 4096x4096 weight update into two matrices of size 4096x16 and 16x4096 (rank-16), reducing trainable parameters from 16M to 131K by assuming updates live in a low-dimensional subspace.',
    },
  ],
}
