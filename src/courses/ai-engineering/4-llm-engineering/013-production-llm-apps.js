export default {
  id: 'ae11-13',
  slug: 'production-llm-apps',
  chapter: 'ae-p11',
  order: 12,
  title: 'Production LLM Apps',
  subtitle: 'Latency budgets, retry strategies, streaming, and observability for LLMs in production.',
  tags: ['production', 'streaming', 'retry', 'observability', 'latency', 'rate-limiting'],
  hook: {
    question: 'Your LLM call returns in 300ms sometimes and 8 seconds other times. Users are complaining. How do you diagnose, harden, and monitor this?',
    realWorldContext: 'LLM APIs are probabilistic, rate-limited, and occasionally flaky. Production-grade apps need streaming to hide latency, exponential backoff to survive rate limits, and distributed tracing to understand where time is actually going.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'Streaming returns tokens as they are generated rather than waiting for the full response. Users see output start in < 500ms even for long responses — perceived latency drops dramatically.',
      'LLM APIs enforce rate limits by requests-per-minute (RPM) and tokens-per-minute (TPM). When you hit a 429, retry with exponential backoff plus jitter: wait 1s, 2s, 4s, 8s... with ±25% random noise to prevent thundering herd.',
      'Latency percentiles matter more than averages. A p50 of 1s with a p99 of 12s means 1% of your users are waiting 12 seconds. Track p50, p95, and p99 separately.',
      'LLM observability tools (Langfuse, Helicone, LangSmith) record every prompt, completion, latency, token count, and cost. They let you trace a slow user request back to the exact model call that caused it.',
    ],
    callouts: [
      { type: 'key-insight', text: 'Time-to-first-token (TTFT) is the metric that determines perceived responsiveness. Streaming makes TTFT visible; without it users see only total response time.' },
      { type: 'tip', text: 'Add a unique trace_id to every LLM call and log it. When a user reports "my answer was wrong at 3:42pm", you can find the exact prompt in your observability tool.' },
      { type: 'warning', text: 'Exponential backoff without jitter causes all retrying clients to wake up at the same time, creating a new spike. Always add random jitter.' },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        initialCells: [
          {
            id: 1,
            cellTitle: 'Simulating Streaming Token Output',
            prose: 'In production, the Anthropic SDK yields events as they arrive. Here we simulate the token-by-token stream and measure time-to-first-token.',
            code: `import time, random

def mock_stream(text: str, tokens_per_second: float = 30):
    """Yield (token, elapsed_ms) tuples simulating an SSE stream."""
    delay = 1.0 / tokens_per_second
    words = text.split()
    start = time.time()
    for word in words:
        time.sleep(delay + random.uniform(0, delay * 0.2))
        yield word, (time.time() - start) * 1000

response_text = "The capital of France is Paris, a city known for the Eiffel Tower."
first_token_ms = None
full_output = []

for token, elapsed in mock_stream(response_text):
    if first_token_ms is None:
        first_token_ms = elapsed
    full_output.append(token)

print(f"Time-to-first-token: {first_token_ms:.1f}ms")
print(f"Total tokens: {len(full_output)}")
print(f"Full response: {' '.join(full_output)}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 2,
            cellTitle: 'Latency Percentiles',
            prose: 'Collect call latencies and compute p50, p95, p99. These tell you very different things about your system\'s health.',
            code: `import random, statistics

random.seed(42)

def simulate_latencies(n=200):
    """Mostly fast, occasionally slow (log-normal distribution)."""
    import math
    results = []
    for _ in range(n):
        base = random.gauss(1.2, 0.3)        # typical call ~1.2s
        spike = 8.0 if random.random() < 0.05 else 0  # 5% spike to 8s
        results.append(max(0.1, base + spike))
    return results

latencies = simulate_latencies()

def percentile(data, p):
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * p / 100
    f, c = int(k), min(int(k) + 1, len(sorted_data) - 1)
    return sorted_data[f] + (sorted_data[c] - sorted_data[f]) * (k - f)

print(f"p50  (median):    {percentile(latencies, 50):.2f}s")
print(f"p95:              {percentile(latencies, 95):.2f}s")
print(f"p99:              {percentile(latencies, 99):.2f}s")
print(f"mean:             {statistics.mean(latencies):.2f}s")
print(f"\nNote: mean hides the tail — p99 is {percentile(latencies, 99)/statistics.mean(latencies):.1f}x the mean")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 3,
            cellTitle: 'Exponential Backoff with Jitter',
            prose: 'When you receive a 429 rate-limit error, wait and retry. Add jitter so clients don\'t all retry simultaneously.',
            code: `import time, random, math

def backoff_delay(attempt: int, base: float = 1.0, cap: float = 32.0) -> float:
    """Full jitter: random value in [0, min(cap, base * 2^attempt)]."""
    max_delay = min(cap, base * math.pow(2, attempt))
    return random.uniform(0, max_delay)

def call_with_retry(fn, max_retries=5):
    for attempt in range(max_retries):
        try:
            return fn()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            delay = backoff_delay(attempt)
            print(f"Attempt {attempt + 1} failed ({e}). Retrying in {delay:.2f}s...")
            time.sleep(delay)

# Simulate a flaky API call
attempt_counter = [0]
def flaky_api():
    attempt_counter[0] += 1
    if attempt_counter[0] < 3:
        raise Exception("429 Too Many Requests")
    return "Success!"

result = call_with_retry(flaky_api)
print(f"Result after {attempt_counter[0]} attempts: {result}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 'c1',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'Retry with Exponential Backoff',
            difficulty: 'intermediate',
            prompt: `Implement \`retry(fn, max_retries, base_delay)\` that:
1. Calls \`fn()\`
2. On exception, waits \`base_delay * 2^attempt\` seconds (no jitter for determinism) and retries
3. Re-raises the last exception after \`max_retries\` failed attempts
4. Returns the result on success

Test it: create a counter that starts at 0, increments on each call, and raises \`ValueError\` until the counter reaches 3. Call \`retry(fn, max_retries=5, base_delay=0.01)\` and store the return value in \`res\`.`,
            code: `import time, math

def retry(fn, max_retries=5, base_delay=1.0):
    # YOUR CODE HERE
    pass

count = [0]
def eventually_works():
    count[0] += 1
    if count[0] < 3:
        raise ValueError(f"Not ready (attempt {count[0]})")
    return f"done after {count[0]} attempts"

res = retry(eventually_works, max_retries=5, base_delay=0.01)
print(res)`,
            output: '',
            status: 'idle',
            figureJson: null,
            testCode: `res = isinstance(res, str) and "done" in res
res`,
            hint: 'Loop from 0 to max_retries-1. Wrap fn() in try/except. On exception, call time.sleep(base_delay * math.pow(2, attempt)) then continue. After the loop, raise the last exception.',
          },
        ],
      },
    ],
  },
  quiz: [
    {
      id: 1,
      question: 'What does time-to-first-token (TTFT) measure?',
      options: [
        'The total time to generate the full response',
        'The time from sending the request until the first output token arrives',
        'The number of tokens generated per second',
        'The delay introduced by rate limiting',
      ],
      correct: 1,
      explanation: 'TTFT is the key perceived-responsiveness metric. Streaming exposes it — users see text starting to appear even before the full response is ready.',
    },
    {
      id: 2,
      question: 'Why is jitter important in exponential backoff?',
      options: [
        'Jitter increases the maximum retry delay to avoid API bans',
        'Jitter prevents all retrying clients from waking up simultaneously and creating a new spike',
        'Jitter reduces the number of retries needed to succeed',
        'Jitter is required by the Anthropic API terms of service',
      ],
      correct: 1,
      explanation: 'Without jitter, every client that hit a rate limit at the same time will retry at the same scheduled intervals — creating synchronized request spikes that keep triggering rate limits.',
    },
    {
      id: 3,
      question: 'Which metric is MOST useful for understanding worst-case user experience?',
      options: ['Mean latency', 'p50 latency', 'p99 latency', 'Minimum latency'],
      correct: 2,
      explanation: 'p99 latency is the value below which 99% of requests fall. It represents the worst 1% of experiences — the users who complain. Mean latency can look healthy while p99 is unacceptable.',
    },
  ],
};
