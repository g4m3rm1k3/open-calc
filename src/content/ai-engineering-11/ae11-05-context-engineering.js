export default {
  id: 'ae-p11-05-context-engineering',
  slug: 'context-engineering',
  chapter: 'ae-p11',
  order: 4,
  title: 'Context Engineering',
  subtitle: 'The context window is your most expensive real estate. Fill it deliberately.',
  tags: ['context window', 'context engineering', 'token budget', 'lost-in-the-middle', 'compression', 'conversation history', 'memory'],

  hook: {
    question: 'If your model has a 200K context window, why does adding more context sometimes make it worse?',
    realWorldContext:
      'In 2023, Liu et al. published "Lost in the Middle: How Language Models Use Long Contexts" showing that LLMs perform best when relevant information is at the beginning or end of the context — and worst when it is buried in the middle. A 200K context window does not mean 200K tokens of equal attention. It means 200K tokens with a U-shaped attention curve. Context engineering — deciding what goes in the window, where it goes, and what to cut — is more impactful than prompt phrasing.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The context window contains: system prompt, tool definitions, retrieved documents (RAG), conversation history, few-shot examples, and the generation budget. All of these compete for the same limited space. Context engineering is the discipline of allocating that space optimally.',
      'The lost-in-the-middle effect: performance on retrieval tasks peaks when relevant information is in the first 20% or last 10% of the context. Information in the middle 70% is attended to less reliably. Practical implication: put the most critical context first, put recent conversation last, bury long supporting documents in the middle only if they are background reference.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Context signal-to-noise ratio matters more than raw size',
        body: 'A 10K token prompt that is 90% signal outperforms a 100K token prompt that is 10% signal. More context means more noise for the attention mechanism to filter. Cut aggressively: summarize old conversation, filter irrelevant retrieved chunks, prune unused tool definitions.',
      },
      {
        type: 'warning',
        title: 'Never assume the model reads everything',
        body: 'Even models with 2M context windows (Gemini 3) do not attend equally to all positions. The lost-in-the-middle effect grows with context length. For information the model MUST use, put it in the first 2K tokens or the last 1K tokens.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Context Engineering',
        mathBridge: 'The context window is a finite resource: context_tokens = system_tokens + tool_tokens + retrieved_tokens + history_tokens + generation_budget. If the sum exceeds the window, you must cut something. Build a context budget manager.',
        caption: 'Build a token counter, context budget allocator, conversation compressor, and dynamic retrieval filter.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Token counting and budget planning',
              prose: [
                '## Token vs. word',
                '1 token ≈ 0.75 words in English. Common rule of thumb: 1000 tokens ≈ 750 words ≈ 4 pages of text. The OpenAI `tiktoken` library counts tokens exactly for OpenAI models.',
                '## Context window budgets',
                'Allocate the budget before filling any slot. Reserve 20% for generation. The rest splits between system prompt, tools, retrieval, and history.',
              ],
              code: `# Token counting utilities

def count_tokens_approx(text):
    """Approximate: ~4 chars per token for English."""
    return max(1, len(text) // 4)

class ContextBudget:
    """Manages token allocation across context window slots."""

    def __init__(self, model_context_window: int):
        self.total = model_context_window
        self.slots = {}

    def allocate(self, slot_name: str, max_tokens: int):
        self.slots[slot_name] = {"max": max_tokens, "used": 0}
        return self

    def use(self, slot_name: str, tokens: int):
        if slot_name not in self.slots:
            raise ValueError(f"Slot '{slot_name}' not allocated")
        self.slots[slot_name]["used"] += tokens

    def remaining(self, slot_name: str) -> int:
        slot = self.slots[slot_name]
        return max(0, slot["max"] - slot["used"])

    def total_used(self) -> int:
        return sum(s["used"] for s in self.slots.values())

    def report(self):
        print(f"Context Budget: {self.total_used():,} / {self.total:,} tokens")
        print(f"{'Slot':<20} {'Used':>8} {'Max':>8} {'%':>6}")
        print("-" * 45)
        for name, slot in self.slots.items():
            pct = slot["used"] / self.total * 100
            bar = "█" * int(pct / 5)
            print(f"{name:<20} {slot['used']:>8,} {slot['max']:>8,} {pct:>5.1f}% {bar}")

# For Claude Sonnet 4.6 (200K context)
budget = ContextBudget(model_context_window=200_000)
budget.allocate("system_prompt", max_tokens=2_000)
budget.allocate("tool_definitions", max_tokens=5_000)
budget.allocate("retrieved_context", max_tokens=40_000)
budget.allocate("conversation_history", max_tokens=20_000)
budget.allocate("few_shot_examples", max_tokens=3_000)
budget.allocate("generation_budget", max_tokens=16_000)

# Fill with example usage
budget.use("system_prompt", count_tokens_approx("You are an expert assistant. " * 100))
budget.use("tool_definitions", 1_200)
budget.use("retrieved_context", 12_500)
budget.use("conversation_history", 8_300)
budget.use("few_shot_examples", 900)

budget.report()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Lost-in-the-middle: position matters',
              prose: [
                '## The Liu et al. (2023) finding',
                'When 20 documents are in context and only 1 is relevant, model performance by relevant document position:',
                '| Position | Performance |\n|---|---|\n| First (position 1) | 71% |\n| Position 5 | 60% |\n| Position 10 (middle) | 49% |\n| Position 15 | 55% |\n| Last (position 20) | 69% |',
                '## Practical implications',
                '1. Put the most critical retrieved document first\n2. Put the most recent conversation turn last\n3. Long reference material goes in the middle (accepted lower recall)\n4. System prompt instructions at the start AND end for critical rules',
              ],
              code: `# Simulate lost-in-the-middle performance degradation

def simulate_retrieval_performance(n_docs, relevant_position):
    """
    Simulate performance based on position of relevant document.
    Based on Liu et al. (2023) lost-in-the-middle findings.
    """
    # U-shaped performance curve
    relative_pos = relevant_position / n_docs  # 0 = first, 1 = last

    # U-shaped: high at 0, low at 0.5, high at 1.0
    # Approximate with: p = 0.5 + 0.25 * cos(pi * relative_pos)
    import math
    base_performance = 0.50 + 0.25 * math.cos(math.pi * relative_pos)
    return round(base_performance, 3)

n_docs = 20
print(f"Retrieval performance with {n_docs} documents in context:")
print(f"(1 relevant document at different positions)")
print()
print(f"{'Position':<12} {'Accuracy':>10}")
print("-" * 25)
for pos in [1, 3, 5, 8, 10, 12, 15, 18, 20]:
    perf = simulate_retrieval_performance(n_docs, pos)
    bar = "█" * int(perf * 30)
    print(f"Position {pos:<4}: {perf:.1%}  {bar}")

print()
print("Recommendation: put the most important retrieved document FIRST or LAST.")
print("Never bury critical context in the middle of a large context window.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Conversation history compression',
              prose: [
                '## The history growth problem',
                'In a multi-turn conversation, history grows linearly: message N costs N times more tokens than message 1. Without compression, you hit the context limit after ~100 turns at typical message lengths.',
                '## Compression strategies',
                '1. **Rolling window** — keep only the last N turns (simplest, loses early context)\n2. **Summarization** — periodically compress old turns to a summary (preserve key facts)\n3. **Entity extraction** — compress to key facts: "User is building a RAG system. Uses Chroma. Python 3.12."\n4. **Importance scoring** — keep turns that contain key decisions, discard small talk',
              ],
              code: `from typing import List, Dict

class ConversationManager:
    """Manages conversation history with compression."""

    def __init__(self, max_tokens: int = 8000):
        self.max_tokens = max_tokens
        self.messages: List[Dict] = []
        self.summary: str = ""

    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        self._maybe_compress()

    def _count_tokens(self) -> int:
        return sum(count_tokens_approx(m["content"]) for m in self.messages)

    def _maybe_compress(self):
        """Compress old messages if approaching token limit."""
        if self._count_tokens() > self.max_tokens * 0.8:
            self._compress_old_messages()

    def _compress_old_messages(self):
        """Summarize oldest 50% of messages."""
        n = len(self.messages)
        to_compress = self.messages[:n // 2]
        self.messages = self.messages[n // 2:]

        # Build a text summary of compressed messages
        new_facts = []
        for msg in to_compress:
            if len(msg["content"]) > 100:
                # Extract key content (in production: call LLM to summarize)
                new_facts.append(f"[{msg['role']}]: {msg['content'][:100]}...")
        if new_facts:
            addition = " | ".join(new_facts)
            self.summary = (self.summary + " " + addition).strip()

    def get_messages_with_summary(self) -> List[Dict]:
        """Return messages with optional summary prefix."""
        if not self.summary:
            return self.messages
        return [
            {"role": "system", "content": f"[Earlier conversation summary]: {self.summary}"},
            *self.messages
        ]

    @property
    def token_count(self) -> int:
        return self._count_tokens()

# Simulate a long conversation
manager = ConversationManager(max_tokens=500)  # small limit to trigger compression

conversation = [
    ("user", "I'm building a RAG system for our company's documentation"),
    ("assistant", "Great! What vector database are you considering?"),
    ("user", "I'm thinking Chroma for local development and Pinecone for production"),
    ("assistant", "Good choice. What embedding model will you use?"),
    ("user", "text-embedding-3-small from OpenAI. Budget is the main concern"),
    ("assistant", "That's cost-effective at $0.02 per million tokens"),
    ("user", "How many chunks should I aim for per document?"),
    ("assistant", "Typically 3-10 meaningful chunks per document, 256-512 tokens each"),
]

print(f"{'Turn':<6} {'Msg Count':>10} {'Token Count':>12} {'Compressed?':>12}")
print("-" * 45)
for i, (role, content) in enumerate(conversation):
    had_messages = len(manager.messages)
    manager.add_message(role, content)
    compressed = len(manager.messages) < had_messages + 1
    print(f"{i+1:<6} {len(manager.messages):>10} {manager.token_count:>12} {'yes' if compressed else 'no':>12}")

print(f"\\nSummary: {manager.summary[:150]}...")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Dynamic context assembly: relevance filtering',
              prose: [
                '## The full context assembly pipeline',
                '1. **Retrieve** k candidates from vector index\n2. **Score** each for relevance to the query\n3. **Filter** below a minimum score threshold\n4. **Sort** by position (most relevant first, per lost-in-the-middle)\n5. **Truncate** to fit the token budget\n6. **Assemble** into the final context window',
              ],
              code: `import math

def relevance_score(chunk: str, query: str) -> float:
    """Simple keyword overlap relevance score (0-1)."""
    query_words = set(query.lower().split())
    chunk_words = set(chunk.lower().split())
    if not query_words:
        return 0.0
    overlap = len(query_words & chunk_words) / len(query_words)
    return round(overlap, 3)

def assemble_rag_context(
    query: str,
    retrieved_chunks: List[Dict],
    token_budget: int,
    min_relevance: float = 0.1,
) -> Dict:
    """Assemble optimally ordered context from retrieved chunks."""

    # Score and filter
    scored = []
    for chunk in retrieved_chunks:
        score = relevance_score(chunk["text"], query)
        if score >= min_relevance:
            scored.append({**chunk, "relevance": score})

    # Sort by relevance (most relevant first)
    scored.sort(key=lambda x: x["relevance"], reverse=True)

    # Truncate to token budget
    selected = []
    tokens_used = 0
    for chunk in scored:
        chunk_tokens = count_tokens_approx(chunk["text"])
        if tokens_used + chunk_tokens <= token_budget:
            selected.append(chunk)
            tokens_used += chunk_tokens
        else:
            break

    return {
        "selected_chunks": selected,
        "tokens_used": tokens_used,
        "chunks_considered": len(retrieved_chunks),
        "chunks_filtered": len(retrieved_chunks) - len(scored),
        "chunks_selected": len(selected),
    }

# Test assembly
chunks = [
    {"text": "RAG retrieval augmented generation combines search with generation", "source": "doc1"},
    {"text": "The weather in Tokyo is usually mild in spring", "source": "doc2"},
    {"text": "Vector embeddings enable semantic search for RAG pipelines", "source": "doc3"},
    {"text": "Python list comprehensions are syntactic sugar for for loops", "source": "doc4"},
    {"text": "RAG reduces hallucinations by grounding generation in retrieved facts", "source": "doc5"},
]

query = "How does RAG reduce hallucinations?"
result = assemble_rag_context(query, chunks, token_budget=100)

print(f"Query: {query}")
print(f"Considered: {result['chunks_considered']}, Filtered (low relevance): {result['chunks_filtered']}")
print(f"Selected: {result['chunks_selected']}, Tokens used: {result['tokens_used']}")
print("\\nSelected chunks (ordered by relevance):")
for c in result["selected_chunks"]:
    print(f"  [{c['relevance']:.2f}] {c['text'][:70]}...")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Token budget validator',
              difficulty: 'easy',
              prompt: 'Write `validate_context_budget(slots, context_window)` where `slots` is a dict of `{name: token_count}`. Return `{"valid": bool, "total": int, "headroom": int, "overflow_slots": list}`. It\'s valid if total <= context_window.',
              code: `def validate_context_budget(slots: dict, context_window: int) -> dict:
    """Validate that allocated context slots fit in the context window."""
    pass

# Tests
slots = {
    "system": 800,
    "tools": 1200,
    "retrieval": 15000,
    "history": 5000,
    "generation": 4000,
}

result = validate_context_budget(slots, context_window=32000)
print(f"Valid: {result['valid']}")
print(f"Total: {result['total']:,}")
print(f"Headroom: {result['headroom']:,}")

# Over budget
over_slots = dict(slots, retrieval=50000)
result2 = validate_context_budget(over_slots, context_window=32000)
print(f"\\nOver-budget: valid={result2['valid']}, headroom={result2['headroom']}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'validate_context_budget' not in dir():
    res = "ERROR: validate_context_budget not defined."
else:
    s1 = {"system": 800, "retrieval": 5000}
    r1 = validate_context_budget(s1, 10000)
    s2 = {"system": 800, "retrieval": 50000}
    r2 = validate_context_budget(s2, 10000)
    if not r1["valid"]:
        res = f"ERROR: 5800 tokens fits in 10000, should be valid"
    elif r1["total"] != 5800:
        res = f"ERROR: total should be 5800, got {r1['total']}"
    elif r1["headroom"] != 4200:
        res = f"ERROR: headroom should be 4200, got {r1['headroom']}"
    elif r2["valid"]:
        res = f"ERROR: 50800 tokens exceeds 10000, should not be valid"
    else:
        res = "SUCCESS: validate_context_budget correctly detects budget violations."
res
`,
              hint: 'total = sum(slots.values()). valid = total <= context_window. headroom = context_window - total. For overflow_slots (bonus): [name for name, count in slots.items() if count > context_window * 0.5].',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the "lost-in-the-middle" effect?',
      options: [
        'When tokens are lost during API transmission',
        'When relevant information buried in the middle of a long context is attended to less reliably than information at the start or end',
        'When the conversation summary loses key details',
        'When vector search returns irrelevant results',
      ],
      correct: 1,
      explanation: 'Liu et al. (2023) showed LLM performance has a U-shaped curve by position: best for information in the first 20% or last 10% of context, worst for information in the middle. Practical implication: always put the most critical retrieved document first.',
    },
    {
      id: 'q2',
      question: 'Why does more context sometimes make LLM performance worse?',
      options: [
        'More tokens cost more money, creating rate limiting',
        'The attention mechanism must filter noise from irrelevant context, and more noise means more filtering errors',
        'The model cannot handle more than a certain number of tokens',
        'Temperature increases with longer contexts',
      ],
      correct: 1,
      explanation: 'A 10K token prompt that is 90% signal outperforms a 100K token prompt that is 10% signal. Every irrelevant token is noise that the attention mechanism must attend to and discount. Context engineering is about maximizing signal-to-noise ratio, not raw context size.',
    },
  ],
}
