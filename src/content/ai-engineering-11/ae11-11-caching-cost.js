export default {
  id: 'ae11-11',
  slug: 'caching-and-cost',
  chapter: 'ae-p11',
  order: 10,
  title: 'Caching & Cost Optimization',
  subtitle: 'Token costs compound — cache aggressively, measure everything.',
  tags: ['caching', 'cost', 'tokens', 'prompt-caching', 'optimization', 'batching'],
  hook: {
    question: 'Your app makes 10,000 LLM calls per day with a 2,000-token system prompt. How much money are you wasting by not caching?',
    realWorldContext: 'A production RAG app at modest scale can burn $500/month on a single long system prompt that never changes. Prompt caching and semantic deduplication typically cut costs by 60–90% with one afternoon of work.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'Every token sent to an LLM costs money — both input tokens and output tokens. The single biggest lever is reducing repeated input tokens through caching.',
      'Anthropic\'s prompt caching lets you mark a prefix of your request with cache_control. On a cache hit you pay 10% of the normal input price. The cache lives for 5 minutes (ephemeral) or 1 hour (extended beta).',
      'OpenAI automatically caches the longest matching prefix of your request and reports cached_tokens in the usage object — no explicit opt-in needed.',
      'Semantic caching goes further: store past (query, response) pairs with their embeddings. Before calling the LLM, find the nearest cached query. If similarity exceeds a threshold, return the cached response directly.',
      'Batching is the throughput play: Anthropic\'s Message Batches API offers 50% cost reduction for workloads that tolerate 24-hour latency.',
    ],
    callouts: [
      { type: 'key-insight', text: 'Cache hits on Anthropic cost 0.1× the normal input price. A 1,000-token system prompt called 10,000 times saves roughly 9,000,000 tokens in cost.' },
      { type: 'tip', text: 'Place cache breakpoints at stable boundaries: end of system prompt, end of tool definitions, end of few-shot examples. Dynamic content goes after the last breakpoint.' },
      { type: 'warning', text: 'Semantic caching can return stale answers if your underlying data changes. Always set a cache TTL and invalidate on data updates.' },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        initialCells: [
          {
            id: 1,
            cellTitle: 'Token Cost Estimation',
            prose: 'Model the cost of a workload before writing a single line of app code. Know your numbers.',
            code: `def estimate_cost(
    calls_per_day: int,
    input_tokens: int,
    output_tokens: int,
    input_price_per_1m: float,
    output_price_per_1m: float,
    cache_hit_rate: float = 0.0,
    cache_discount: float = 0.10,
) -> dict:
    effective_input = input_tokens * (
        cache_hit_rate * cache_discount + (1 - cache_hit_rate)
    )
    daily_input_cost  = calls_per_day * effective_input * input_price_per_1m / 1_000_000
    daily_output_cost = calls_per_day * output_tokens   * output_price_per_1m / 1_000_000
    daily_total = daily_input_cost + daily_output_cost
    return {
        "daily_usd":   round(daily_total, 4),
        "monthly_usd": round(daily_total * 30, 2),
        "annual_usd":  round(daily_total * 365, 2),
    }

# Claude Sonnet 3.7 pricing ($/1M tokens)
no_cache = estimate_cost(10_000, 2_000, 500, 3.0, 15.0, cache_hit_rate=0.0)
cached   = estimate_cost(10_000, 2_000, 500, 3.0, 15.0, cache_hit_rate=0.9)

print(f"Without caching: \${no_cache['monthly_usd']}/mo")
print(f"With 90% cache:  \${cached['monthly_usd']}/mo")
print(f"Savings: \${no_cache['monthly_usd'] - cached['monthly_usd']:.2f}/mo")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 2,
            cellTitle: 'Semantic Cache with Embeddings',
            prose: 'Simulate a semantic cache: store past responses keyed by a mock embedding vector, look up the nearest neighbor before calling the LLM.',
            code: `import math, hashlib, json

def mock_embed(text: str) -> list:
    """Deterministic fake embedding: hash-derived 4-D unit vector."""
    h = int(hashlib.md5(text.lower().encode()).hexdigest(), 16)
    raw = [(h >> (i * 16)) & 0xFFFF for i in range(4)]
    norm = math.sqrt(sum(x**2 for x in raw)) or 1
    return [x / norm for x in raw]

def cosine_sim(a, b):
    return sum(x * y for x, y in zip(a, b))

class SemanticCache:
    def __init__(self, threshold=0.97):
        self.store = []
        self.threshold = threshold

    def get(self, query):
        vec = mock_embed(query)
        for entry in self.store:
            if cosine_sim(vec, entry["vec"]) >= self.threshold:
                return entry["response"]
        return None

    def set(self, query, response):
        self.store.append({"vec": mock_embed(query), "query": query, "response": response})

cache = SemanticCache()
cache.set("What is the capital of France?", "Paris")
print(cache.get("What is the capital of France?"))   # hit (identical)
print(cache.get("Capital of Germany?"))              # miss (different hash)`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 3,
            cellTitle: 'Anthropic Cache Control Format',
            prose: 'See what a cache_control-annotated request looks like. The model processes up to the last breakpoint as a cached prefix.',
            code: `import json

system_prompt = "You are a helpful coding assistant with deep Python expertise."
tool_defs = [{"name": "run_code", "description": "Execute Python code safely."}]

request_body = {
    "model": "claude-sonnet-4-5",
    "system": [
        {
            "type": "text",
            "text": system_prompt,
            "cache_control": {"type": "ephemeral"}   # cache breakpoint #1
        }
    ],
    "tools": [
        {**tool_defs[0], "cache_control": {"type": "ephemeral"}}  # breakpoint #2
    ],
    "messages": [
        {"role": "user", "content": "Write a binary search function."}
    ],
    "max_tokens": 512,
}

print(json.dumps(request_body, indent=2))
print("\nEverything before the last cache_control is eligible for caching.")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 'c1',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'Cost Estimator for a Given Workload',
            difficulty: 'beginner',
            prompt: `Write a function \`monthly_cost(calls, input_tokens, output_tokens, cache_hit_rate)\` that returns the estimated monthly USD cost using these prices:
- Input:  $3.00 per 1M tokens (full price)
- Cached input: $0.30 per 1M tokens (10% of full price)
- Output: $15.00 per 1M tokens

Assume 30 days per month. Store the result of calling \`monthly_cost(50_000, 1_500, 400, 0.8)\` in \`res\` (rounded to 2 decimal places).`,
            code: `def monthly_cost(calls, input_tokens, output_tokens, cache_hit_rate):
    # YOUR CODE HERE
    pass

res = round(monthly_cost(50_000, 1_500, 400, 0.8), 2)
print(f"\${res}/month")`,
            output: '',
            status: 'idle',
            figureJson: null,
            testCode: `expected = round(
    50_000 * 30 * (1_500 * (0.8 * 0.30 + 0.2 * 3.0) / 1_000_000 + 400 * 15.0 / 1_000_000), 2
)
res = abs(res - expected) < 0.02
res`,
            hint: 'Effective input price per token = cache_hit_rate * 0.30/1M + (1-cache_hit_rate) * 3.0/1M. Multiply by calls per day * 30 days * input_tokens for the input portion.',
          },
        ],
      },
    ],
  },
  quiz: [
    {
      id: 1,
      question: 'What is the cost of a cache hit on Anthropic\'s prompt caching, relative to normal input token price?',
      options: ['50% of normal price', '25% of normal price', '10% of normal price', 'Free — cache hits are not billed'],
      correct: 2,
      explanation: 'Cache hits are billed at 10% (0.1×) of the normal input token price, making repeated use of long system prompts dramatically cheaper.',
    },
    {
      id: 2,
      question: 'Where should you place the last cache_control breakpoint in a request?',
      options: [
        'At the very beginning of the system prompt',
        'After the user message so everything is cached',
        'At the boundary between static content (system/tools) and dynamic content (user message)',
        'Cache breakpoints must be placed evenly throughout the prompt',
      ],
      correct: 2,
      explanation: 'Static content (system prompt, tool definitions, few-shot examples) belongs before the breakpoint. The dynamic user message goes after — it changes every call and must not be cached.',
    },
    {
      id: 3,
      question: 'What is the main risk of semantic caching?',
      options: [
        'It increases latency more than calling the LLM directly',
        'It can return stale answers when the underlying data changes',
        'It requires a larger context window than direct API calls',
        'Embeddings are too expensive to generate for every query',
      ],
      correct: 1,
      explanation: 'If your knowledge base updates but the cache is not invalidated, a semantically similar new query can receive an outdated cached answer. Always use TTLs and data-change-triggered invalidation.',
    },
  ],
};
