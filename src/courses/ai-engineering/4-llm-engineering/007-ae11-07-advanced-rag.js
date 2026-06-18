export default {
  id: 'ae-p11-07-advanced-rag',
  slug: 'advanced-rag',
  chapter: 'ae-p11',
  order: 6,
  title: 'Advanced RAG',
  subtitle: 'Reranking, hybrid search, HyDE, and the techniques that turn good RAG into great RAG.',
  tags: ['reranking', 'hybrid search', 'bm25', 'hyde', 'query expansion', 'reciprocal rank fusion', 'cohere rerank'],

  hook: {
    question: 'Your basic RAG pipeline scores 62% on retrieval accuracy. What is the cheapest single improvement?',
    realWorldContext: 'Add a reranker. A two-stage pipeline — dense vector retrieval (top-50) followed by a cross-encoder reranker (top-5) — consistently outperforms single-stage dense retrieval by 10-25% on standard benchmarks. The key insight: bi-encoder embeddings (used in vector search) encode query and document independently. Cross-encoders see both simultaneously, enabling much finer-grained relevance judgments. The reranker is slower but only runs on 50 candidates, not millions.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Basic RAG: embed → cosine search → top-k. Advanced RAG: embed → cosine search → top-50 → rerank → top-5 → LLM. The first stage is fast (approximate nearest neighbor). The second stage is accurate (cross-encoder reads both query and document together).',
      'HyDE (Hypothetical Document Embeddings): instead of embedding the query, generate a hypothetical document that would answer the query, then embed that. The hypothesis often uses vocabulary closer to the corpus, improving retrieval recall by 15-30%.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Hybrid search: BM25 + dense = best of both',
        body: 'BM25 is keyword-based (exact match, fast). Dense embeddings are semantic (meaning-based, slower). Hybrid search runs both and combines the ranked lists using Reciprocal Rank Fusion (RRF). RRF has no hyperparameters and consistently outperforms pure dense or pure BM25 on RAG benchmarks.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Advanced RAG',
        mathBridge: 'Reciprocal Rank Fusion: RRF_score(d) = Σ_k 1 / (k + rank_k(d)). For each ranking list, add the reciprocal of the document\'s rank (plus a constant k=60 to avoid overflow). Sum across all lists.',
        caption: 'Implement a reranker simulation, BM25 scorer, and Reciprocal Rank Fusion.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Reranking: two-stage retrieval pipeline',
              prose: [
                '## Stage 1: Bi-encoder (fast, approximate)',
                'Embed query and documents independently, compute cosine similarity. Retrieve top-50 candidates. Fast because embeddings are precomputed.',
                '## Stage 2: Cross-encoder reranker (slow, accurate)',
                'See query and document together. Much better relevance judgment. Cohere Rerank, Voyage Rerank, BGE Reranker are the main options.',
                '## Production setup',
                '```python\nfrom cohere import Client\nclient = Client(api_key=...)\nresults = client.rerank(\n    model="rerank-english-v3.0",\n    query="...",\n    documents=[chunk["text"] for chunk in candidates],\n    top_n=5\n)\n```',
              ],
              code: `# Simulate a cross-encoder reranker

def cross_encoder_score(query, document):
    """
    Simulate cross-encoder relevance score.
    Real cross-encoders see (query, document) together.
    """
    q_words = set(query.lower().split())
    d_words = set(document.lower().split())
    # Exact keyword overlap (simplified)
    exact_matches = len(q_words & d_words) / len(q_words) if q_words else 0

    # Bonus for query phrase appearing in document
    phrase_bonus = 0.3 if query.lower()[:15] in document.lower() else 0

    return min(1.0, exact_matches + phrase_bonus)

def two_stage_retrieval(query, candidates, top_n_final=3):
    """
    Stage 1: dense retrieval (simulate with keyword score)
    Stage 2: cross-encoder reranking
    """
    # Stage 1: quick score, retrieve top-10
    stage1_scores = [(i, cross_encoder_score(query, c["text"]) * 0.7)  # bi-encoder is less accurate
                     for i, c in enumerate(candidates)]
    stage1_scores.sort(key=lambda x: x[1], reverse=True)
    top_candidates_idx = [i for i, _ in stage1_scores[:10]]

    # Stage 2: rerank top-10 with cross-encoder (more accurate)
    stage2_scores = []
    for idx in top_candidates_idx:
        score = cross_encoder_score(query, candidates[idx]["text"])
        stage2_scores.append((idx, score))
    stage2_scores.sort(key=lambda x: x[1], reverse=True)

    return [(candidates[i], score) for i, score in stage2_scores[:top_n_final]]

# Test
docs = [
    {"text": "RAG reduces hallucinations by grounding LLM responses in retrieved documents", "id": 0},
    {"text": "The weather in Paris is pleasant in spring", "id": 1},
    {"text": "Vector databases store embeddings for semantic search and RAG retrieval", "id": 2},
    {"text": "Hallucinations in LLMs can be reduced by providing factual context", "id": 3},
    {"text": "Python is a high-level programming language", "id": 4},
]

query = "How does RAG prevent hallucinations?"
results = two_stage_retrieval(query, docs)

print(f"Query: {query}")
print("\\nTwo-stage results (reranked):")
for doc, score in results:
    print(f"  [{score:.3f}] {doc['text'][:60]}...")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Reciprocal Rank Fusion: combining multiple rankers',
              prose: 'RRF combines rankings from multiple retrieval systems (e.g., BM25 + dense embeddings) without requiring calibrated scores. The formula rewards documents that rank highly across multiple systems.',
              code: `def reciprocal_rank_fusion(ranked_lists, k=60):
    """
    Combine multiple ranked lists using Reciprocal Rank Fusion.
    ranked_lists: list of lists of document IDs, each ordered by relevance
    k: smoothing constant (default 60, from original paper)
    Returns: list of (doc_id, rrf_score) sorted by descending score
    """
    scores = {}
    for ranked_list in ranked_lists:
        for rank, doc_id in enumerate(ranked_list, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)

    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

# Simulate BM25 and dense retrieval returning different orderings
query = "fine-tuning language models LoRA"

# BM25 ranking (keyword-based — good at exact matches)
bm25_ranking = ["doc_lora", "doc_peft", "doc_finetuning", "doc_training", "doc_rag"]

# Dense embedding ranking (semantic-based — good at meaning)
dense_ranking = ["doc_finetuning", "doc_lora", "doc_training", "doc_quantization", "doc_peft"]

# Individual rankings
print("BM25 top-5:   ", bm25_ranking[:5])
print("Dense top-5:  ", dense_ranking[:5])

# Hybrid with RRF
hybrid = reciprocal_rank_fusion([bm25_ranking, dense_ranking])

print("\\nHybrid RRF ranking:")
for rank, (doc_id, score) in enumerate(hybrid[:5], 1):
    in_bm25 = "BM25" if doc_id in bm25_ranking[:5] else "    "
    in_dense = "Dense" if doc_id in dense_ranking[:5] else "     "
    print(f"  {rank}. {doc_id:<20} {score:.4f}  [{in_bm25}] [{in_dense}]")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'HyDE: Hypothetical Document Embedding',
              difficulty: 'medium',
              prompt: 'HyDE generates a hypothetical answer to the query and embeds that instead of the raw query. Write `hyde_query(question, hypothetical_answer, embed_fn)` that returns the embedding of `hypothetical_answer + " " + question` (combining both for a richer representation).',
              code: `import hashlib, random, math

def sim_embed(text, dims=8):
    seed = int(hashlib.md5(text[:50].encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)
    v = [rng.gauss(0, 1) for _ in range(dims)]
    n = math.sqrt(sum(x**2 for x in v))
    return [x/n for x in v]

def hyde_query(question, hypothetical_answer, embed_fn):
    """Return embedding of the hypothetical document (answer + question)."""
    pass

# Test
question = "What is LoRA and how does it work?"
hypothesis = "LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning method that decomposes weight updates into low-rank matrices, reducing trainable parameters by 1000x."

regular_embedding = sim_embed(question)
hyde_embedding = hyde_query(question, hypothesis, sim_embed)

print(f"Question embedding dim: {len(regular_embedding)}")
print(f"HyDE embedding dim:     {len(hyde_embedding)}")
print(f"Are they different? {regular_embedding != hyde_embedding}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'hyde_query' not in dir():
    res = "ERROR: hyde_query not defined."
else:
    q = "What is RAG?"
    h = "RAG combines retrieval with generation."
    emb = hyde_query(q, h, sim_embed)
    expected = sim_embed(h + " " + q)
    if len(emb) != len(expected):
        res = f"ERROR: embedding dimension mismatch"
    elif emb == sim_embed(q):
        res = "ERROR: HyDE embedding should be different from bare question embedding"
    elif emb != expected:
        res = "ERROR: should embed (hypothesis + ' ' + question)"
    else:
        res = "SUCCESS: hyde_query correctly embeds the hypothetical document."
res
`,
              hint: 'combined = hypothetical_answer + " " + question. return embed_fn(combined)',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'Why does a two-stage retrieval pipeline (dense + reranker) outperform single-stage dense retrieval?',
      options: [
        'The reranker uses a larger embedding model',
        'Cross-encoders see query and document together, enabling finer relevance judgments than bi-encoders that encode them independently',
        'Two stages double the compute, which always improves accuracy',
        'Reranking removes duplicates from the results',
      ],
      correct: 1,
      explanation: 'Bi-encoders (used in dense retrieval) embed query and document independently. They cannot capture fine-grained relevance signals that depend on the specific interaction between query terms and document terms. Cross-encoders see both simultaneously and can model this interaction — but they are too slow to run on millions of documents, so they run only on the top-50 bi-encoder candidates.',
    },
  ],
}
