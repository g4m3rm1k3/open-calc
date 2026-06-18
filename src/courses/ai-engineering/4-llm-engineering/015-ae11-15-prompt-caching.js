export default {
  id: 'ae11-15',
  slug: 'prompt-caching',
  chapter: 'ae-p11',
  order: 14,
  title: 'Prompt Caching',
  subtitle: 'Cache your system prompt once, pay for it once — save 90% on repeated calls.',
  tags: ['prompt-caching', 'cache-control', 'cost', 'anthropic', 'tokens', 'ttl'],
  hook: {
    question: 'Your 4,000-token system prompt is re-processed on every single API call. What if you only had to pay for it once every 5 minutes?',
    realWorldContext: 'Anthropic\'s prompt caching was the biggest cost reduction shipped in 2024. Apps with large system prompts — RAG context, tool definitions, few-shot examples — can cut input token costs by up to 90% with a few lines of code change.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'Prompt caching works by marking a stable prefix of your request with `cache_control: {type: "ephemeral"}`. On the first call, Anthropic processes and caches that prefix. Subsequent calls with the same prefix pay only 10% of the normal input price.',
      'The cache TTL is 5 minutes for standard ephemeral caching. An extended-beta option raises it to 1 hour. Any variation in the prefix — even one token — misses the cache.',
      'You can place up to 4 cache breakpoints per request. Each one marks the end of a cacheable prefix. The longest matching prefix is used on a cache hit.',
      'The ROI depends on your call volume and prefix size. A 2,000-token system prompt reused 1,000 times per hour saves 1,800,000 tokens of input cost per hour — roughly $5.40/hr at Sonnet pricing.',
      'Cache write tokens cost 25% more than normal input tokens. The break-even is 1.25 / (1 - 0.10) ≈ 1.4 calls. After the second call you are saving money.',
    ],
    callouts: [
      { type: 'key-insight', text: 'The cache is per-workspace and per-model. A cache built with claude-sonnet-4-5 does not transfer to claude-opus-4-5.' },
      { type: 'tip', text: 'Order your content from most-stable to least-stable: system prompt → tool definitions → few-shot examples → user message. Put the breakpoint at the last stable boundary.' },
      { type: 'warning', text: 'OpenAI\'s prefix caching is automatic and invisible — you just see cached_tokens in the usage object. Anthropic requires explicit cache_control markers.' },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        initialCells: [
          {
            id: 1,
            cellTitle: 'Cache ROI Calculator',
            prose: 'Calculate how many API calls it takes to break even on a cached prefix, and the total savings over a given volume.',
            code: `def cache_roi(
    prefix_tokens: int,
    calls: int,
    input_price_per_1m: float = 3.0,
    cache_write_multiplier: float = 1.25,
    cache_read_fraction: float = 0.10,
):
    """
    Returns a dict with cost_without_cache, cost_with_cache, savings, breakeven_calls.
    Assumes the prefix is written once and read (calls-1) times.
    """
    normal_cost_per_call = prefix_tokens * input_price_per_1m / 1_000_000

    cost_without = calls * normal_cost_per_call

    write_cost = normal_cost_per_call * cache_write_multiplier        # first call
    read_cost  = (calls - 1) * normal_cost_per_call * cache_read_fraction  # subsequent
    cost_with  = write_cost + read_cost

    savings = cost_without - cost_with
    # breakeven: write_cost + n * read_rate * normal = (n+1) * normal  => solve for n
    breakeven = cache_write_multiplier / (1 - cache_read_fraction)
    return {
        "cost_without_cache": round(cost_without, 4),
        "cost_with_cache":    round(cost_with, 4),
        "savings_usd":        round(savings, 4),
        "savings_pct":        round(savings / cost_without * 100, 1),
        "breakeven_calls":    round(breakeven, 2),
    }

result = cache_roi(prefix_tokens=4_000, calls=500)
for k, v in result.items():
    print(f"{k:25}: {v}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 2,
            cellTitle: 'Optimal Cache Breakpoint Placement',
            prose: 'Simulate a request showing where to place cache breakpoints for maximum hit rate.',
            code: `import json

system_prompt = "You are an expert Python tutor. " * 50   # ~400 tokens stable
tool_defs = [{"name": "run_code", "description": "Execute Python in a sandbox."}]
few_shot = [
    {"role": "user",      "content": "How do I reverse a list?"},
    {"role": "assistant", "content": "Use my_list[::-1] or list.reverse()."},
]

# The dynamic part — changes every call
user_message = "How do I sort a dict by value?"

request = {
    "model": "claude-sonnet-4-5",
    "system": [
        {
            "type": "text",
            "text": system_prompt,
            "cache_control": {"type": "ephemeral"}     # BP1: after system prompt
        }
    ],
    "tools": [
        {**tool_defs[0], "cache_control": {"type": "ephemeral"}}  # BP2: after tools
    ],
    "messages": [
        *few_shot,
        # cache_control could go here to also cache few-shot examples
        {"role": "user", "content": user_message}     # NOT cached — dynamic
    ],
    "max_tokens": 512,
}

print(f"System prompt tokens (approx): {len(system_prompt.split())}")
print(f"Cache breakpoints placed:      2")
print(f"Dynamic content (not cached):  user message only")
print()
print("Structure (truncated):")
print(f"  system[0].text = '{system_prompt[:40]}...'  [CACHED]")
print(f"  tools[0].name  = '{tool_defs[0]['name']}'              [CACHED]")
print(f"  messages[-1]   = '{user_message}'  [NOT CACHED]")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 3,
            cellTitle: 'Reading Cache Stats from API Response',
            prose: 'The usage object in the API response tells you exactly how many tokens were cache hits vs writes vs normal reads.',
            code: `import json

# Simulated API response usage objects
first_call_usage = {
    "input_tokens": 150,             # dynamic (user message) — normal price
    "cache_creation_input_tokens": 4000,  # prefix written to cache — 1.25x price
    "cache_read_input_tokens": 0,    # nothing cached yet
    "output_tokens": 120,
}

second_call_usage = {
    "input_tokens": 145,             # slightly different user message
    "cache_creation_input_tokens": 0,  # prefix unchanged — no write needed
    "cache_read_input_tokens": 4000,   # prefix served from cache — 0.10x price
    "output_tokens": 98,
}

PRICE = {"normal": 3.0, "write": 3.0 * 1.25, "read": 3.0 * 0.10, "output": 15.0}

def call_cost(usage: dict) -> float:
    return (
        usage["input_tokens"]                  * PRICE["normal"]  / 1_000_000 +
        usage["cache_creation_input_tokens"]   * PRICE["write"]   / 1_000_000 +
        usage["cache_read_input_tokens"]       * PRICE["read"]    / 1_000_000 +
        usage["output_tokens"]                 * PRICE["output"]  / 1_000_000
    )

c1 = call_cost(first_call_usage)
c2 = call_cost(second_call_usage)
print(f"Call 1 (cache write): \${c1:.6f}")
print(f"Call 2 (cache hit):   \${c2:.6f}")
print(f"Savings on call 2:    \${c1 - c2:.6f}  ({(1 - c2/c1)*100:.1f}% cheaper)")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 'c1',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'Cache ROI Calculator',
            difficulty: 'beginner',
            prompt: `Write \`cache_savings(prefix_tokens, daily_calls, price_per_1m=3.0)\` that returns the daily USD savings from caching vs not caching.

Assume: cache is written once per day (at 1.25x price), all remaining calls are cache reads (at 0.10x price).

Store the result (rounded to 4 decimal places) of \`cache_savings(2000, 1000)\` in \`res\`.`,
            code: `def cache_savings(prefix_tokens, daily_calls, price_per_1m=3.0):
    # YOUR CODE HERE
    pass

res = round(cache_savings(2000, 1000), 4)
print(f"Daily savings: \${res}")`,
            output: '',
            status: 'idle',
            figureJson: null,
            testCode: `normal  = 2000 * 1000 * 3.0 / 1_000_000
cached  = 2000 * 3.0 * 1.25 / 1_000_000 + 2000 * 999 * 3.0 * 0.10 / 1_000_000
expected = round(normal - cached, 4)
res = abs(res - expected) < 0.0001
res`,
            hint: 'cost_without = daily_calls * prefix_tokens * price/1M. cost_with = 1 write at 1.25x + (daily_calls-1) reads at 0.10x. Return cost_without - cost_with.',
          },
        ],
      },
    ],
  },
  quiz: [
    {
      id: 1,
      question: 'What is the default TTL (time-to-live) for Anthropic\'s ephemeral prompt cache?',
      options: ['30 seconds', '5 minutes', '1 hour', '24 hours'],
      correct: 1,
      explanation: 'Ephemeral cache entries live for 5 minutes. Each cache hit resets the TTL. Extended-beta caching offers 1-hour TTL.',
    },
    {
      id: 2,
      question: 'What happens if a single token in the cached prefix changes between calls?',
      options: [
        'The cache partially matches and you pay a reduced rate',
        'The request is rejected with a validation error',
        'The cache misses entirely — you pay full price for that call',
        'The model automatically reuses the nearest matching prefix',
      ],
      correct: 2,
      explanation: 'Prompt caching matches exact prefixes. Any change — even one token — results in a full cache miss. Stable prefixes are essential for high hit rates.',
    },
    {
      id: 3,
      question: 'How many API calls does it typically take to break even on an Anthropic cache write?',
      options: ['10 calls', '5 calls', 'About 2 calls', '100 calls'],
      correct: 2,
      explanation: 'Cache write costs 1.25x normal; cache read costs 0.10x. Break-even is at ~1.4 calls, meaning by the second call you are already saving money.',
    },
  ],
};
