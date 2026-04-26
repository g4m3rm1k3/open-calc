export default {
  id: 'ae-p11-04-embeddings',
  slug: 'embeddings-and-vector-search',
  chapter: 'ae-p11',
  order: 3,
  title: 'Embeddings & Vector Search',
  subtitle: 'Meaning as geometry: how semantic similarity becomes a nearest-neighbor search problem.',
  tags: ['embeddings', 'vector search', 'cosine similarity', 'faiss', 'semantic search', 'text-embedding', 'nearest neighbors'],

  hook: {
    question: 'How does a search engine find "automobile accident" when you search for "car crash"?',
    realWorldContext:
      'The answer is embeddings — dense vector representations that encode meaning rather than characters. Two sentences with completely different words but the same meaning will have similar embedding vectors. This is the foundation of semantic search, RAG systems, recommendation engines, and duplicate detection. Understanding embeddings is understanding how modern AI "reads" text.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'An embedding is a list of floating-point numbers (typically 768–3072 dimensions) that encodes the meaning of a piece of text. Text with similar meaning produces similar vectors — similar in the sense of small cosine distance.',
      'Vector search (ANN — approximate nearest neighbor) finds the k most similar embeddings in a collection, typically using FAISS or a dedicated vector database. The key operations: embed your documents once (index), embed the query at search time, find the k nearest neighbors by cosine distance.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Cosine similarity > Euclidean distance for text',
        body: 'For text embeddings, cosine similarity (1 - cosine_distance) is preferred over L2/Euclidean distance. Cosine measures the angle between vectors, ignoring magnitude. This makes it invariant to document length — a short and long document about the same topic score similarly.',
      },
      {
        type: 'insight',
        title: '2025 embedding model landscape',
        body: 'Best-in-class: `text-embedding-3-large` (OpenAI, 3072d), `voyage-3-large` (Voyage AI, best for code+retrieval), `gemini-embedding-exp` (Google), `BGE-M3` (open-weight, multilingual). For most RAG: `text-embedding-3-small` at $0.02/M tokens is sufficient.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Embeddings & Vector Search',
        mathBridge: 'Cosine similarity: cos(θ) = (A·B) / (|A||B|). Range: -1 (opposite) to 1 (identical). For unit-normalized vectors: cosine_similarity = dot_product. Most embedding APIs return unit-normalized vectors.',
        caption: 'Implement cosine similarity, a simple in-memory vector index, and a semantic search function.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Cosine similarity: the geometry of meaning',
              prose: [
                '## Why cosine?',
                'Two vectors are similar if they point in the same direction, regardless of their magnitude. `cos(0°) = 1` (identical direction, perfectly similar). `cos(90°) = 0` (orthogonal, unrelated). `cos(180°) = -1` (opposite, antonyms).',
                '## Computing cosine similarity',
                '1. Normalize both vectors to unit length: `v / ||v||`\n2. Dot product of normalized vectors = cosine similarity',
              ],
              code: `import math

def dot_product(a, b):
    return sum(x * y for x, y in zip(a, b))

def norm(v):
    return math.sqrt(sum(x**2 for x in v))

def cosine_similarity(a, b):
    """Cosine similarity between two vectors. Range: [-1, 1]."""
    denom = norm(a) * norm(b)
    if denom == 0:
        return 0.0
    return dot_product(a, b) / denom

def normalize(v):
    """Return unit-length version of vector."""
    n = norm(v)
    return [x / n for x in v] if n > 0 else v

# Simulated embeddings (2D for illustration)
# In reality, embeddings are 768-3072 dimensions
car = [0.9, 0.1]         # "car"
automobile = [0.85, 0.15] # "automobile" — similar direction
bicycle = [0.3, 0.9]     # "bicycle" — different direction
truck = [0.8, 0.2]       # "truck" — somewhat similar

print("Cosine similarities to 'car':")
for name, vec in [("automobile", automobile), ("bicycle", bicycle), ("truck", truck)]:
    sim = cosine_similarity(car, vec)
    bar = "█" * int(sim * 20)
    print(f"  {name:<12}: {sim:.3f} {bar}")

print("\\nKey insight: automobile and car are closer than bicycle and car,")
print("even though both are vehicles. Embedding geometry encodes semantic meaning.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Simulating text embeddings with TF-IDF',
              prose: [
                'Real embeddings come from models like `text-embedding-3-small`. To demonstrate the concept without an API key, we use TF-IDF to create sparse vector representations. While not as powerful as neural embeddings, they demonstrate the same retrieval mechanics.',
                '## TF-IDF embedding',
                '- **TF (term frequency):** how often a word appears in this document\n- **IDF (inverse document frequency):** how rare the word is across all documents\n- **TF-IDF:** product — high for words that appear often in one doc but rarely in others',
              ],
              code: `import math
from collections import Counter

def tfidf_vectorize(documents):
    """Compute TF-IDF vectors for a list of documents."""
    # Tokenize
    tokenized = [doc.lower().split() for doc in documents]

    # IDF: log(N / df) for each term
    N = len(documents)
    df = Counter()
    for tokens in tokenized:
        for term in set(tokens):
            df[term] += 1
    idf = {term: math.log(N / count) for term, count in df.items()}
    vocabulary = sorted(idf.keys())

    # TF-IDF vectors
    vectors = []
    for tokens in tokenized:
        tf = Counter(tokens)
        vec = [tf.get(term, 0) * idf.get(term, 0) for term in vocabulary]
        # Normalize to unit length
        n = math.sqrt(sum(x**2 for x in vec))
        vectors.append([x / n for x in vec] if n > 0 else vec)

    return vectors, vocabulary

# Documents to index
docs = [
    "Machine learning models learn patterns from training data",
    "Deep learning neural networks have multiple layers",
    "Natural language processing handles text and speech",
    "Computer vision processes images and video",
    "Reinforcement learning agents learn from rewards",
    "Python is the most popular programming language for AI",
]

vectors, vocab = tfidf_vectorize(docs)
print(f"Vocabulary size: {len(vocab)} terms")
print(f"Vector dimensions: {len(vectors[0])}")
print()

# Semantic search
def semantic_search(query, documents, doc_vectors, vocabulary, top_k=3):
    """Find most similar documents to a query."""
    # Vectorize query using same IDF weights
    query_tokens = query.lower().split()
    tf = Counter(query_tokens)
    query_vec = []
    for term in vocabulary:
        if term in tf:
            # Re-use the IDF we already computed
            idf_val = math.log(len(documents) / max(1, sum(1 for d in documents if term in d.lower())))
            query_vec.append(tf[term] * idf_val)
        else:
            query_vec.append(0.0)
    n = math.sqrt(sum(x**2 for x in query_vec))
    query_vec = [x / n for x in query_vec] if n > 0 else query_vec

    scores = [(i, cosine_similarity(query_vec, dv)) for i, dv in enumerate(doc_vectors)]
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_k]

# Test search
query = "neural networks deep learning"
results = semantic_search(query, docs, vectors, vocab)
print(f"Query: '{query}'")
print("Top results:")
for rank, (idx, score) in enumerate(results, 1):
    print(f"  {rank}. [{score:.3f}] {docs[idx]}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'In-memory vector index: the FAISS-lite pattern',
              prose: [
                '## FAISS and vector databases',
                'FAISS (Facebook AI Similarity Search) is the most common in-memory vector index for AI applications. For production, use a vector database: Chroma (local), Pinecone (managed), Qdrant (self-hosted), or pgvector (PostgreSQL extension).',
                '## The three operations',
                '1. `index.add(vectors)` — add embeddings to the index\n2. `index.search(query_vector, k)` — find k nearest neighbors\n3. `index.reset()` — clear the index',
                '## When to use what',
                '| Scale | Choice |\n|---|---|\n| < 100K docs | In-memory (FAISS or dict) |\n| 100K–10M docs | Chroma, Qdrant, Weaviate |\n| 10M+ docs | Pinecone, managed vector DB |\n| Existing Postgres | pgvector extension |',
              ],
              code: `class VectorIndex:
    """Simple in-memory vector index (FAISS-lite pattern)."""

    def __init__(self):
        self.vectors = []
        self.metadata = []

    def add(self, vector, metadata=None):
        """Add a vector with optional metadata."""
        self.vectors.append(vector)
        self.metadata.append(metadata or {})

    def add_batch(self, vectors, metadatas=None):
        for i, v in enumerate(vectors):
            self.add(v, (metadatas or [{}] * len(vectors))[i])

    def search(self, query_vector, k=5):
        """Return top-k most similar vectors and their metadata."""
        if not self.vectors:
            return []
        scores = [
            (i, cosine_similarity(query_vector, v))
            for i, v in enumerate(self.vectors)
        ]
        scores.sort(key=lambda x: x[1], reverse=True)
        return [
            {"score": score, "metadata": self.metadata[i], "index": i}
            for i, score in scores[:k]
        ]

    def __len__(self):
        return len(self.vectors)

# Build a small document index
index = VectorIndex()
index.add_batch(vectors, [{"text": doc, "id": i} for i, doc in enumerate(docs)])

print(f"Index size: {len(index)} documents")

# Search
query_vec_result = semantic_search("reinforcement learning rewards", docs, vectors, vocab, top_k=1)
query_idx = query_vec_result[0][0]
query_vec = vectors[query_idx]  # use an existing vec as proxy

results = index.search(query_vec, k=3)
print(f"\\nSemantic search results:")
for r in results:
    print(f"  [{r['score']:.3f}] {r['metadata']['text']}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Using real embedding APIs (Anthropic / OpenAI)',
              prose: [
                '## Real embedding calls (requires API key)',
                '```python\n# OpenAI text-embedding-3-small\nimport openai\nclient = openai.OpenAI()\n\nresponse = client.embeddings.create(\n    model="text-embedding-3-small",\n    input=["text to embed", "another sentence"],\n)\nvectors = [item.embedding for item in response.data]\nprint(f"Dimensions: {len(vectors[0])}")  # 1536\n```',
                '## Cost and dimension comparison',
                '| Model | Dimensions | Cost per 1M tokens |\n|---|---|---|\n| text-embedding-3-small | 1536 | $0.02 |\n| text-embedding-3-large | 3072 | $0.13 |\n| voyage-3-large | 1024 | $0.06 |\n| BGE-M3 (open) | 1024 | Free |\n| nomic-embed-text (open) | 768 | Free |',
                '## Batching rule',
                'Always batch embedding requests. Sending 100 texts in one API call is ~100x cheaper and faster than 100 individual calls. Most APIs accept up to 2048 texts per call.',
              ],
              code: `# Simulate an embedding API response
import hashlib
import random

def simulate_embedding(text, dimensions=1536):
    """Simulate a text embedding using deterministic hash-based generation."""
    # Use hash seed for determinism (same text → same embedding)
    seed = int(hashlib.md5(text.encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)
    vec = [rng.gauss(0, 1) for _ in range(dimensions)]
    # Normalize to unit sphere (as real embedding APIs do)
    n = math.sqrt(sum(x**2 for x in vec))
    return [x / n for x in vec]

def batch_embed(texts, dimensions=1536):
    """Simulate batch embedding API call."""
    return [simulate_embedding(t, dimensions) for t in texts]

# Demonstrate batch embedding and search
texts_to_embed = [
    "How do I fine-tune a language model?",
    "What is LoRA and how does it work?",
    "Explain gradient descent optimization",
    "How does RLHF train language models?",
    "What is the difference between RAG and fine-tuning?",
    "How do I reduce hallucinations in my AI application?",
]

embeddings = batch_embed(texts_to_embed, dimensions=64)  # 64d for demo speed
index2 = VectorIndex()
index2.add_batch(embeddings, [{"text": t} for t in texts_to_embed])

query = "How can I prevent my LLM from making things up?"
query_embedding = simulate_embedding(query, dimensions=64)

print(f"Query: {query}")
print("\\nMost semantically similar documents:")
for r in index2.search(query_embedding, k=3):
    print(f"  [{r['score']:.3f}] {r['metadata']['text']}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement cosine similarity for batches',
              difficulty: 'easy',
              prompt: 'Write `top_k_similar(query_vec, corpus_vecs, k)` that returns the indices and cosine similarity scores of the top-k most similar vectors to the query, sorted by descending similarity.',
              code: `import math

def cosine_similarity(a, b):
    denom = math.sqrt(sum(x**2 for x in a)) * math.sqrt(sum(x**2 for x in b))
    if denom == 0: return 0.0
    return sum(x*y for x,y in zip(a,b)) / denom

def top_k_similar(query_vec, corpus_vecs, k=3):
    """Return list of (index, score) tuples, sorted by descending similarity."""
    pass

# Test
corpus = [
    [1.0, 0.0, 0.0],  # 0: points along x
    [0.9, 0.1, 0.0],  # 1: mostly x — similar to query
    [0.0, 1.0, 0.0],  # 2: points along y — different
    [0.8, 0.2, 0.0],  # 3: mostly x — similar
    [0.0, 0.0, 1.0],  # 4: points along z — different
]
query = [1.0, 0.0, 0.0]

results = top_k_similar(query, corpus, k=3)
print("Top 3 similar to query [1,0,0]:")
for idx, score in results:
    print(f"  index {idx}: {score:.3f}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'top_k_similar' not in dir():
    res = "ERROR: top_k_similar not defined."
else:
    corpus = [[1,0,0],[0.9,0.1,0],[0,1,0],[0.8,0.2,0],[0,0,1]]
    query = [1,0,0]
    results = top_k_similar(query, corpus, k=3)
    if len(results) != 3:
        res = f"ERROR: should return 3 results, got {len(results)}"
    elif results[0][0] != 0:
        res = f"ERROR: index 0 should be most similar, got {results[0][0]}"
    elif not all(results[i][1] >= results[i+1][1] for i in range(len(results)-1)):
        res = f"ERROR: results should be sorted by descending score"
    else:
        res = "SUCCESS: top_k_similar returns correct indices sorted by similarity."
res
`,
              hint: 'scores = [(i, cosine_similarity(query_vec, v)) for i, v in enumerate(corpus_vecs)]. Sort by score descending. Return scores[:k].',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'Why is cosine similarity preferred over Euclidean distance for text embeddings?',
      options: [
        'Cosine similarity is faster to compute',
        'Cosine measures angular similarity (direction), ignoring magnitude — making it length-invariant: a short and long document about the same topic score similarly',
        'Euclidean distance cannot work with high-dimensional vectors',
        'Cosine similarity is required by the OpenAI embedding API',
      ],
      correct: 1,
      explanation: 'Cosine similarity measures the angle between vectors, not their magnitude. A 100-word document and a 1000-word document about machine learning will both point in roughly the same direction in embedding space, so their cosine similarity is high even though their Euclidean distance is large (different magnitudes).',
    },
  ],
}
