export default {
  id: 'ae-p11-06-rag',
  slug: 'retrieval-augmented-generation',
  chapter: 'ae-p11',
  order: 5,
  title: 'RAG: Retrieval-Augmented Generation',
  subtitle: 'Retrieve relevant facts, augment the context, generate grounded answers.',
  tags: ['rag', 'retrieval', 'chunking', 'vector database', 'chroma', 'faiss', 'hallucination reduction', 'knowledge base'],

  hook: {
    question: 'How do you give an LLM access to 10,000 documents without fine-tuning?',
    realWorldContext:
      'Fine-tuning bakes knowledge into model weights — expensive, slow to update, and opaque about what was learned. RAG (Retrieval-Augmented Generation) is the alternative: at query time, retrieve the relevant documents and put them in the context window. The model reads fresh, specific, current information for every question. This is how every serious production LLM application works: Notion AI, GitHub Copilot Chat, Perplexity, and virtually every enterprise chatbot. It is cheaper than fine-tuning, easier to update (just re-index), and more transparent (you can see exactly what was retrieved).',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'RAG has two phases: indexing (one-time, offline) and querying (real-time). Indexing: split documents into chunks → embed each chunk → store in a vector database. Querying: embed the user\'s question → find similar chunks → add to context → generate answer.',
      'The three RAG failure modes: (1) retrieval failure — the right chunk is not retrieved (fix: better chunking, more examples, reranking); (2) context failure — the right chunk is retrieved but ignored by the model (fix: position it first, reduce noise); (3) generation failure — the model ignores the context and hallucinates anyway (fix: stricter system prompt, reduce temperature).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Chunking strategy is the most important RAG decision',
        body: 'Chunk too small (< 100 tokens): individual chunks lack enough context to be useful. Chunk too large (> 1000 tokens): retrieval precision suffers. Sweet spot: 256–512 tokens with 10–20% overlap. For structured docs (code, tables), use structure-aware chunking.',
      },
      {
        type: 'warning',
        title: 'RAG vs. fine-tuning: know which to use',
        body: 'RAG: for factual, current, or proprietary knowledge. Fine-tuning: for style, format, and behavior changes. Never fine-tune to teach facts — models forget them inconsistently and it is expensive to update. Always use RAG for knowledge retrieval.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'RAG: Retrieval-Augmented Generation',
        mathBridge: 'RAG reduces hallucination by grounding generation: P(answer | context, query) vs P(answer | query). With context, the model conditions on retrieved facts rather than parametric memory.',
        caption: 'Build a complete RAG pipeline: document chunker, vector index, retriever, and answer generator.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The RAG architecture: indexing vs. querying',
              prose: [
                '## Two phases, one pipeline',
                '**Indexing (one-time):**\n```\nDocuments → Chunker → Embedding Model → Vector Database\n```',
                '**Querying (real-time):**\n```\nUser Question → Embedding Model → Vector Search → Top-K Chunks → LLM → Answer\n```',
                '## The full data flow',
                '1. Load document (PDF, HTML, Markdown, code)\n2. Split into chunks (256-512 tokens with overlap)\n3. Embed each chunk with a text embedding model\n4. Store (embedding, text, metadata) in vector DB\n5. At query time: embed the question, cosine-search the index\n6. Build context: system prompt + retrieved chunks + question\n7. Call LLM, return grounded answer',
              ],
              code: `# RAG pipeline overview

class RAGPipeline:
    """Complete RAG pipeline: index + query."""

    def __init__(self, embed_fn, llm_fn, chunk_size=256, overlap=50):
        self.embed_fn = embed_fn
        self.llm_fn = llm_fn
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.index = []  # list of {text, embedding, metadata}

    # ── INDEXING PHASE ──────────────────────────────────────────
    def index_documents(self, documents):
        """Chunk, embed, and index a list of documents."""
        total_chunks = 0
        for doc in documents:
            chunks = self._chunk(doc["text"])
            for i, chunk in enumerate(chunks):
                embedding = self.embed_fn(chunk)
                self.index.append({
                    "text": chunk,
                    "embedding": embedding,
                    "metadata": {**doc.get("metadata", {}), "chunk_index": i}
                })
                total_chunks += 1
        return total_chunks

    def _chunk(self, text):
        """Split text into overlapping word-chunks."""
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk_words = words[i: i + self.chunk_size]
            chunks.append(" ".join(chunk_words))
            i += self.chunk_size - self.overlap
        return chunks

    # ── QUERY PHASE ─────────────────────────────────────────────
    def query(self, question, k=3, system_prompt=None):
        """Retrieve relevant chunks and generate a grounded answer."""
        # Embed the question
        q_embedding = self.embed_fn(question)

        # Retrieve top-k chunks
        chunks = self._retrieve(q_embedding, k)

        # Build context
        context = "\\n\\n".join([f"[Source: {c['metadata'].get('title', 'doc')}]\\n{c['text']}"
                                 for c in chunks])

        # Generate
        system = system_prompt or (
            "You are a helpful assistant. Answer based on the provided context only. "
            "If the context does not contain the answer, say 'I don\\'t know based on the provided context.'"
        )
        prompt = f"Context:\\n{context}\\n\\nQuestion: {question}"
        answer = self.llm_fn(system, prompt)

        return {
            "answer": answer,
            "retrieved_chunks": chunks,
            "context_tokens": len(context.split()) * 4 // 3,  # approx
        }

    def _retrieve(self, query_embedding, k):
        """Find top-k most similar chunks."""
        import math
        def cosine_sim(a, b):
            dot = sum(x*y for x, y in zip(a, b))
            na = math.sqrt(sum(x**2 for x in a))
            nb = math.sqrt(sum(x**2 for x in b))
            return dot / (na * nb) if na and nb else 0
        scored = [(i, cosine_sim(query_embedding, item["embedding"]))
                  for i, item in enumerate(self.index)]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [self.index[i] for i, _ in scored[:k]]

print("RAGPipeline class defined. Next cells show it in action.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Document chunking: size, overlap, strategies',
              prose: [
                '## The chunking problem',
                'Semantic similarity works best when each chunk is a coherent, self-contained unit of meaning. A chunk that starts mid-sentence is meaningless to the embedding model.',
                '## Chunking strategies',
                '| Strategy | Best for |\n|---|---|\n| Fixed-size word chunks | Homogeneous prose |\n| Sentence-level | Any natural language |\n| Paragraph-level | Well-structured docs |\n| Recursive character | Mixed content (LangChain default) |\n| Structure-aware | Code, tables, PDFs |',
                '## Overlap',
                'Add 10-20% overlap between adjacent chunks. This ensures that a sentence spanning a chunk boundary appears in at least one complete chunk. Without overlap, sentences split across boundaries are lost.',
              ],
              code: `import re

def chunk_by_words(text, chunk_size=256, overlap=50):
    """Fixed-size word-based chunking with overlap."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i: i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def chunk_by_sentences(text, max_tokens_per_chunk=300, overlap_sentences=2):
    """Sentence-based chunking — respects natural boundaries."""
    # Simple sentence splitter
    sentences = re.split(r'(?<=[.!?])\\s+', text.strip())

    chunks = []
    current = []
    current_tokens = 0

    for sent in sentences:
        sent_tokens = len(sent.split())
        if current_tokens + sent_tokens > max_tokens_per_chunk and current:
            chunks.append(" ".join(current))
            # Keep overlap sentences
            current = current[-overlap_sentences:] if overlap_sentences else []
            current_tokens = sum(len(s.split()) for s in current)
        current.append(sent)
        current_tokens += sent_tokens

    if current:
        chunks.append(" ".join(current))
    return chunks

# Test with an AI engineering document
sample_doc = """
Large language models are neural networks trained on vast corpora of text.
They learn to predict the next token given all previous tokens in a sequence.
This simple objective, applied at scale, produces models that can write code, answer questions, and reason.

RAG stands for Retrieval-Augmented Generation. It combines retrieval with generation.
The retrieval step finds relevant documents from a knowledge base.
The generation step uses these documents as context to produce grounded answers.

Fine-tuning modifies the model's weights through additional training.
It is expensive, slow to update, and requires large amounts of labeled examples.
RAG is preferred for knowledge retrieval tasks.
"""

word_chunks = chunk_by_words(sample_doc.strip(), chunk_size=50, overlap=10)
sent_chunks = chunk_by_sentences(sample_doc.strip(), max_tokens_per_chunk=60, overlap_sentences=1)

print(f"Word-based chunks ({len(word_chunks)} total):")
for i, c in enumerate(word_chunks[:3]):
    print(f"  [{i}] {c[:80]}...")

print(f"\\nSentence-based chunks ({len(sent_chunks)} total):")
for i, c in enumerate(sent_chunks):
    print(f"  [{i}] {c[:80]}...")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Complete RAG demo: index + query',
              prose: 'Putting it all together: index a small knowledge base, then query it with natural language questions. The pipeline retrieves the most relevant chunks and returns a grounded answer.',
              code: `import hashlib
import random
import math

def sim_embed(text, dims=32):
    """Deterministic simulated embedding."""
    seed = int(hashlib.md5(text[:100].encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)
    v = [rng.gauss(0, 1) for _ in range(dims)]
    n = math.sqrt(sum(x**2 for x in v))
    return [x/n for x in v]

def sim_llm(system, prompt):
    """Simulate LLM response using context."""
    context_start = prompt.find("Context:")
    question_start = prompt.find("Question:")
    if context_start == -1 or question_start == -1:
        return "I don't have enough context to answer."
    context = prompt[context_start+8:question_start].strip()
    question = prompt[question_start+9:].strip()
    return f"Based on the provided context: {context[:120]}... [answering: {question[:60]}]"

# Build the pipeline
rag = RAGPipeline(embed_fn=sim_embed, llm_fn=sim_llm, chunk_size=50, overlap=10)

# Index documents
knowledge_base = [
    {
        "text": "RAG retrieval augmented generation combines vector search with language model generation. The system retrieves relevant documents based on semantic similarity and uses them as context.",
        "metadata": {"title": "RAG Overview", "date": "2024"}
    },
    {
        "text": "Fine-tuning modifies model weights with additional training data. It is expensive and slow to update but produces models with deeply integrated knowledge.",
        "metadata": {"title": "Fine-tuning Guide", "date": "2024"}
    },
    {
        "text": "Chunk size affects RAG performance significantly. Chunks of 256 to 512 tokens with 10 percent overlap work best for most document types.",
        "metadata": {"title": "Chunking Strategy", "date": "2024"}
    },
    {
        "text": "Vector databases store embedding vectors alongside metadata. Popular options include FAISS for in-memory use, Chroma for local development, and Pinecone for production.",
        "metadata": {"title": "Vector Databases", "date": "2024"}
    },
]

n_chunks = rag.index_documents(knowledge_base)
print(f"Indexed {len(knowledge_base)} documents → {n_chunks} chunks")
print(f"Index size: {len(rag.index)} chunks\\n")

# Query
questions = [
    "What is the difference between RAG and fine-tuning?",
    "What chunk size should I use?",
    "Which vector database should I use for local development?",
]

for q in questions:
    result = rag.query(q, k=2)
    print(f"Q: {q}")
    print(f"A: {result['answer'][:150]}...")
    print(f"   (retrieved {len(result['retrieved_chunks'])} chunks, ~{result['context_tokens']} tokens)")
    print()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Chunking overlap calculator',
              difficulty: 'easy',
              prompt: 'Write `count_chunks(doc_word_count, chunk_size, overlap)` that returns the exact number of chunks that `chunk_by_words` would produce for a document of `doc_word_count` words.',
              code: `def count_chunks(doc_word_count, chunk_size, overlap):
    """Return number of chunks produced by word-based chunker."""
    pass

# Tests
print(count_chunks(100, 50, 0))   # 2 (no overlap: 0-49, 50-99)
print(count_chunks(100, 50, 10))  # 3 (with overlap: step=40, 0-49, 40-89, 80-100)
print(count_chunks(256, 64, 16))  # should be 5
print(count_chunks(50, 100, 20))  # 1 (doc smaller than chunk)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'count_chunks' not in dir():
    res = "ERROR: count_chunks not defined."
else:
    tests = [
        (100, 50, 0, 2),
        (50, 100, 20, 1),
    ]
    failures = []
    for words, size, overlap, expected in tests:
        got = count_chunks(words, size, overlap)
        if got != expected:
            failures.append(f"count_chunks({words},{size},{overlap}) → {got}, expected {expected}")

    # Verify against actual chunker
    text_100 = "word " * 100
    actual = len(chunk_by_words(text_100.strip(), 50, 0))
    predicted = count_chunks(100, 50, 0)
    if actual != predicted:
        failures.append(f"Predicted {predicted} but actual chunker returns {actual}")

    if failures:
        res = "ERROR: " + "; ".join(failures)
    else:
        res = "SUCCESS: count_chunks matches actual chunker output."
res
`,
              hint: 'step = chunk_size - overlap. import math. return math.ceil((doc_word_count - overlap) / step) if doc_word_count > 0 else 0. But handle edge case: if doc_word_count <= chunk_size return 1.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'RAG context builder',
              difficulty: 'medium',
              prompt: 'Write `build_rag_prompt(question, retrieved_chunks, system_instruction)` that assembles the full prompt for a RAG query. Each chunk is `{"text": str, "score": float, "source": str}`. Include source attribution in the context. Return `{"system": str, "user": str}`.',
              code: `def build_rag_prompt(question, retrieved_chunks, system_instruction=None):
    """Build a complete RAG prompt with source attribution."""
    pass

chunks = [
    {"text": "RAG uses vector search to find relevant documents.", "score": 0.92, "source": "rag_guide.md"},
    {"text": "Fine-tuning modifies model weights with training data.", "score": 0.78, "source": "finetuning.md"},
]

prompt = build_rag_prompt(
    question="How does RAG work?",
    retrieved_chunks=chunks,
)

print("System:", prompt["system"][:100])
print("\\nUser:", prompt["user"])
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'build_rag_prompt' not in dir():
    res = "ERROR: build_rag_prompt not defined."
else:
    chunks = [
        {"text": "RAG retrieves documents.", "score": 0.9, "source": "doc1.md"},
    ]
    p = build_rag_prompt("What is RAG?", chunks)
    if "system" not in p or "user" not in p:
        res = "ERROR: must return dict with 'system' and 'user' keys"
    elif "RAG retrieves documents" not in p["user"]:
        res = "ERROR: retrieved chunk text should appear in user message"
    elif "What is RAG?" not in p["user"]:
        res = "ERROR: question should appear in user message"
    elif "doc1.md" not in p["user"]:
        res = "ERROR: source attribution should appear in user message"
    else:
        res = "SUCCESS: RAG prompt correctly assembles context with source attribution."
res
`,
              hint: 'Format each chunk as "[Source: {source}] {text}". Join chunks with newlines. Build user message as "Context:\\n{context}\\n\\nQuestion: {question}". System: default to "Answer based on the provided context only."',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the recommended chunk size for RAG?',
      options: [
        '50-100 tokens (maximize retrieval precision)',
        '256-512 tokens with 10-20% overlap (balance between context richness and precision)',
        '1000-2000 tokens (maximize context per chunk)',
        'The entire document as one chunk',
      ],
      correct: 1,
      explanation: '256-512 tokens provides enough context for the chunk to be semantically meaningful while maintaining retrieval precision. Smaller chunks lack context (a sentence fragment is hard to match semantically). Larger chunks reduce precision (the relevant sentence is diluted with irrelevant content). Overlap ensures sentences near chunk boundaries appear in complete form.',
    },
    {
      id: 'q2',
      question: 'What is the primary advantage of RAG over fine-tuning for knowledge retrieval?',
      options: [
        'RAG is always faster at inference time',
        'RAG is cheaper to update — just re-index the documents; fine-tuning requires an expensive retraining run',
        'RAG produces better answers for style and format tasks',
        'Fine-tuning cannot store factual knowledge',
      ],
      correct: 1,
      explanation: 'When your knowledge base updates, RAG requires only re-embedding and re-indexing the changed documents. Fine-tuning requires a full retraining run (expensive, slow) and the new knowledge may interfere with old knowledge (catastrophic forgetting). RAG also provides attribution — you can show exactly which document the answer came from.',
    },
    {
      id: 'q3',
      question: 'What are the three RAG failure modes?',
      options: [
        'Too few documents, too many documents, wrong embedding model',
        'Retrieval failure (wrong chunks retrieved), context failure (right chunk ignored), generation failure (model hallucinates despite context)',
        'High latency, high cost, low accuracy',
        'Small context window, large documents, slow embedding',
      ],
      correct: 1,
      explanation: '(1) Retrieval failure: the chunk containing the answer is not in the top-k results. Fix: better chunking, more k, reranking. (2) Context failure: the right chunk is retrieved but the model ignores it (lost-in-the-middle). Fix: position it first, reduce context noise. (3) Generation failure: the model ignores the context and hallucinates. Fix: stricter system prompt ("only use provided context"), lower temperature.',
    },
  ],
}
