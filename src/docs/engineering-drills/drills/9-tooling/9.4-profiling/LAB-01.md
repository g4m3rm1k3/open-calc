# Drill 9.4 — Profiling: Find the Real Bottleneck Before You Optimize

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — `pip install memory-profiler line-profiler` — standard library: `cProfile`, `timeit`
**What you will build:** A slow data processing function, then three increasingly specific profiling tools to find the exact bottleneck — function level, line level, and memory allocation level. You will find a bottleneck you couldn't see from reading the code.
**What you will understand:** Why guessing bottlenecks is wrong, what cProfile shows vs line_profiler, the difference between CPU time and wall time, and how to profile memory separately from CPU.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You have a function that takes 5 seconds. You "optimize" the loop inside it, making it 50% faster. The function now takes 4.9 seconds. What went wrong with your optimization strategy?

2. `cProfile` reports cumulative time for a function. A function shows 3 seconds cumulative. It only runs 10ms itself, but it calls 50 other functions. What does the 3 seconds include?

3. What is the difference between CPU time and wall time? Which one should you care about for a web request that waits for a database?

4. Memory profiling shows your function allocates 500MB of temporary objects. The function itself runs in 200ms. Is this a problem? Under what circumstances?

*(Answers at the bottom.)*

---

## The Concept: Profiling

### Concept: Measure Before You Optimize

**What it is:**
Profiling is the process of measuring where a program spends its time and memory. A profiler instruments the code (either by sampling or by adding hooks at every function call) and produces a report showing which functions or lines consumed the most resources.

**The Pareto principle for code:**
In most programs, 80-90% of execution time is in 10-20% of the code. Finding that 10-20% is the entire point of profiling. If you optimize the wrong 80%, you get no measurable speedup.

**Why guessing is wrong:**
Intuition about performance is unreliable because:
- The bottleneck is often in code you don't suspect (a library function, a seemingly innocent loop, an allocation inside a comprehension)
- Modern CPUs, caches, and interpreters have complex behavior that doesn't match intuition
- A loop with 1000 iterations of cheap operations can be faster than 10 iterations of expensive ones — depends on cache and branch prediction

**The three profiling tools:**

**cProfile** (call-level): instruments every function call. Reports total time, cumulative time, and call count per function. Use to find WHICH functions are slow. Overhead: significant — 10-100% slowdown. Use during development, not production.

**line_profiler** (line-level): instruments every line inside decorated functions. Reports time per line. Use after cProfile identifies the function — find WHICH LINES are slow. Much higher overhead than cProfile.

**memory_profiler** (memory-level): tracks memory allocation line by line. Reports MB used and incremental change per line. Use when memory is the bottleneck (GC pressure, large allocations).

**Sampling vs instrumentation:**
- Instrumentation: adds code at every function call/line (cProfile, line_profiler). Accurate but slow.
- Sampling: periodically pauses execution and records where the program is (py-spy, Scalene). Low overhead, can be used in production. Less precise.

**Constraints:**
- The observer effect: profiling changes program behavior. cProfile's overhead can change which functions appear to be the bottleneck for very fast functions.
- I/O-bound vs CPU-bound: cProfile measures CPU time. If your bottleneck is waiting for a database query, cProfile won't show it as slow — the program is idle during the wait. Use wall-time profiling (`time.perf_counter()`) or tracing tools for I/O bottlenecks.
- Thread bottlenecks: cProfile profiles one thread. If threads wait on locks, cProfile shows idle time incorrectly.

**Tradeoffs:**
- Profile first vs optimize speculatively: speculative optimization (micro-optimizations without measuring) wastes time and creates complex code for no measurable benefit. Profile, find the real bottleneck, optimize exactly that.
- readability vs performance: once you find the bottleneck, the optimization might make code harder to read. Comment the WHY of the optimization.

**Failure modes:**
- Profiling with small inputs: a function that's fast on 100 items might be O(n²) and catastrophic at 100,000. Profile with realistic input sizes.
- Optimizing one part while ignoring Amdahl's Law: if 90% of time is in function A and 10% in function B, optimizing function B by 10x only speeds up the overall program by 9%.
- Memory profiling in isolation: allocating 500MB is fine if it's reused. It's a problem if it's allocated freshly on every request (no reuse), if GC pauses spike under load, or if you're near the container memory limit.

**Operational reality:**
Python's built-in `cProfile` is sufficient for most optimization work. `line_profiler` and `memory_profiler` are used when you need more precision. In production: `py-spy` (sampling, no code changes needed) or `Scalene` (CPU + memory, low overhead) can profile running processes without restarting them. FastAPI apps can be profiled with `pyinstrument` middleware.

**You will see this again in:**
Optimizing data pipelines, finding slow database query generators (ORM N+1), reducing Docker image build times, profiling FastAPI endpoints, reducing peak memory usage in data science scripts.

**Watch for:**
The difference between "this line is slow" and "this line is called many times." A line that takes 1ms but is called 10,000 times costs 10 seconds. cProfile shows call counts — look for functions that are called far more often than expected. That's usually where N+1 bugs hide.

---

## Step 1 — Create a Slow Program and Profile with cProfile

Create `slow_data.py`:

```python
# slow_data.py — data processing with several hidden bottlenecks
import time
import re
from collections import Counter

def load_data(n: int) -> list[dict]:
    """Generate n records simulating a dataset."""
    words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"]
    return [
        {
            "id": i,
            "name": f"item_{i}",
            "description": " ".join(words[i % len(words)] for _ in range(50)),
            "tags": [f"tag_{j}" for j in range(i % 5 + 1)],
            "value": (i * 17 + 3) % 100,
        }
        for i in range(n)
    ]


def search_descriptions(records: list[dict], keyword: str) -> list[int]:
    """
    Find all record IDs where description contains keyword.
    HIDDEN BOTTLENECK: compiles regex on every call.
    """
    results = []
    for record in records:
        # BUG: re.search recompiles the pattern on every iteration
        if re.search(keyword, record["description"], re.IGNORECASE):
            results.append(record["id"])
    return results


def compute_tag_frequency(records: list[dict]) -> dict[str, int]:
    """Count how often each tag appears across all records."""
    counts = {}
    for record in records:
        for tag in record["tags"]:
            # BUG: using dict.get() in a loop — slow but not obvious
            counts[tag] = counts.get(tag, 0) + 1
    return counts


def filter_by_value(records: list[dict], threshold: int) -> list[dict]:
    """Return records where value > threshold."""
    result = []
    for record in records:
        if record["value"] > threshold:
            result.append(record)  # HIDDEN COST: repeated list.append() with copies
    return result


def build_summary(records: list[dict]) -> str:
    """Build a text summary. BOTTLENECK: string concatenation in loop."""
    summary = ""  # BUG: O(n²) string concatenation
    for record in records:
        summary += f"ID={record['id']}, name={record['name']}, value={record['value']}\n"
    return summary


def run_pipeline(n: int = 5000) -> dict:
    """Run all processing steps."""
    data = load_data(n)
    
    results_a = search_descriptions(data, "apple")
    results_b = search_descriptions(data, "banana")
    tag_counts = compute_tag_frequency(data)
    filtered = filter_by_value(data, 50)
    summary = build_summary(filtered[:100])
    
    return {
        "total_records": n,
        "apple_matches": len(results_a),
        "banana_matches": len(results_b),
        "unique_tags": len(tag_counts),
        "filtered_count": len(filtered),
        "summary_len": len(summary),
    }


if __name__ == "__main__":
    start = time.perf_counter()
    result = run_pipeline(5000)
    elapsed = time.perf_counter() - start
    print(f"Pipeline result: {result}")
    print(f"Time: {elapsed:.3f}s")
```

Create `profile_cpu.py`:

```python
# profile_cpu.py — profile with cProfile
import cProfile
import pstats
import io
from slow_data import run_pipeline

print("=== cProfile Report ===\n")

profiler = cProfile.Profile()
profiler.enable()
result = run_pipeline(5000)
profiler.disable()

# Print sorted by cumulative time
stream = io.StringIO()
stats = pstats.Stats(profiler, stream=stream)
stats.sort_stats("cumulative")
stats.print_stats(20)  # top 20 functions
print(stream.getvalue())

# Also show what's calling the slow functions
print("\n=== Who is calling the slow functions? ===")
stats.print_callers("search_descriptions")
```

### SAVE AND TRY

```
python profile_cpu.py
```

Expected output (abridged — actual SHAs will differ):
```
=== cProfile Report ===

   ncalls  tottime  cumtime  filename:lineno(function)
    10000    2.341    2.341   <string>:1(<module>)    <- re.search compiles 10000 times
        2    1.205    3.546   slow_data.py:23(search_descriptions)
     5000    0.234    0.234   slow_data.py:36(compute_tag_frequency)
      100    0.089    0.089   slow_data.py:52(build_summary)
```

The key insight: `search_descriptions` is called twice (once for "apple", once for "banana"), but the inner `re.search` is called 10,000 times total. This is the bottleneck.

**Read the report:**
- `ncalls`: how many times this function was called
- `tottime`: time spent inside this function (not in sub-calls)
- `cumtime`: cumulative time (includes all sub-calls)
- The function with highest `tottime` is often the real bottleneck

**Change something:** Profile `build_summary` by increasing `[:100]` to `[:1000]`. The string concatenation becomes quadratic — watch `build_summary`'s time jump dramatically.

---

## Step 2 — Line-Level Profiling

cProfile found the function. Now find the exact line:

Create `profile_line.py`:

```python
# profile_line.py — line-level profiling with line_profiler
from line_profiler import LineProfiler
from slow_data import search_descriptions, build_summary, load_data

data = load_data(5000)

# Profile search_descriptions line by line
profiler = LineProfiler()
profiler.add_function(search_descriptions)
profiler.runcall(search_descriptions, data, "apple")
profiler.runcall(search_descriptions, data, "banana")

print("=== Line Profile: search_descriptions ===")
profiler.print_stats()

# Profile build_summary
profiler2 = LineProfiler()
profiler2.add_function(build_summary)
profiler2.runcall(build_summary, data[:200])

print("\n=== Line Profile: build_summary ===")
profiler2.print_stats()
```

### SAVE AND TRY

```
python profile_line.py
```

Expected output:
```
=== Line Profile: search_descriptions ===
Line #      Hits         Time  Per Hit   % Time  Line Contents
===========================================================
    23                                           def search_descriptions(records, keyword):
    24         2       5.1      2.6      0.0      results = []
    25     10002      45.2      0.0      0.4      for record in records:
    26     10000   11234.8      1.1     99.2          if re.search(keyword, record["description"], re.IGNORECASE):
    27      1429      23.1      0.0      0.2              results.append(record["id"])
    28         2       1.2      0.6      0.0      return results

=== Line Profile: build_summary ===
Line #      Hits         Time  Per Hit   % Time  Line Contents
===========================================================
    45                                           def build_summary(records):
    46         1       0.8      0.8      0.0      summary = ""
    47       201       9.2      0.0      0.1      for record in records:
    48       200   14231.5     71.2     99.9          summary += f"..."
    49         1       0.3      0.3      0.0      return summary
```

Line 26 (`re.search`) consumes 99.2% of `search_descriptions`' time. Line 48 (string concatenation) consumes 99.9% of `build_summary`'s time. Exact line, exact percentage.

---

## Step 3 — Fix the Bottlenecks and Measure

Create `fast_data.py`:

```python
# fast_data.py — optimized versions of slow functions
import re
from collections import Counter

def search_descriptions_fast(records: list[dict], keyword: str) -> list[int]:
    """Fix: compile regex once outside the loop."""
    pattern = re.compile(keyword, re.IGNORECASE)  # compile once
    return [record["id"] for record in records if pattern.search(record["description"])]


def compute_tag_frequency_fast(records: list[dict]) -> dict[str, int]:
    """Fix: use Counter (implemented in C, single pass)."""
    all_tags = (tag for record in records for tag in record["tags"])
    return dict(Counter(all_tags))


def build_summary_fast(records: list[dict]) -> str:
    """Fix: use join instead of += concatenation."""
    lines = [
        f"ID={record['id']}, name={record['name']}, value={record['value']}"
        for record in records
    ]
    return "\n".join(lines)
```

Create `benchmark.py`:

```python
# benchmark.py — compare slow vs fast
import time
from slow_data import load_data, search_descriptions, compute_tag_frequency, build_summary
from fast_data import search_descriptions_fast, compute_tag_frequency_fast, build_summary_fast

data = load_data(5000)

def time_it(label, fn, *args):
    start = time.perf_counter()
    result = fn(*args)
    elapsed = (time.perf_counter() - start) * 1000
    return elapsed, result

print("=== Before/After Optimization Comparison ===\n")

# search_descriptions
slow_t, _ = time_it("slow", search_descriptions, data, "apple")
fast_t, _ = time_it("fast", search_descriptions_fast, data, "apple")
print(f"search_descriptions:")
print(f"  Slow: {slow_t:.1f}ms")
print(f"  Fast: {fast_t:.1f}ms")
print(f"  Speedup: {slow_t/fast_t:.1f}x")

# compute_tag_frequency
slow_t, _ = time_it("slow", compute_tag_frequency, data)
fast_t, _ = time_it("fast", compute_tag_frequency_fast, data)
print(f"\ncompute_tag_frequency:")
print(f"  Slow: {slow_t:.1f}ms")
print(f"  Fast: {fast_t:.1f}ms")
print(f"  Speedup: {slow_t/fast_t:.1f}x")

# build_summary (use 500 records to make it slow enough to measure)
slow_t, _ = time_it("slow", build_summary, data[:500])
fast_t, _ = time_it("fast", build_summary_fast, data[:500])
print(f"\nbuild_summary (500 records):")
print(f"  Slow: {slow_t:.1f}ms")
print(f"  Fast: {fast_t:.1f}ms")
print(f"  Speedup: {slow_t/fast_t:.1f}x")
```

### SAVE AND TRY

```
python benchmark.py
```

Expected output (rough):
```
=== Before/After Optimization Comparison ===

search_descriptions:
  Slow: 1203.4ms
  Fast: 87.2ms
  Speedup: 13.8x

compute_tag_frequency:
  Slow: 45.3ms
  Fast: 12.1ms
  Speedup: 3.7x

build_summary (500 records):
  Slow: 842.1ms
  Fast: 2.3ms
  Speedup: 366.1x
```

The string concatenation fix is 366x faster — the most dramatic improvement. The regex compilation fix is 14x faster. These speedups came from MEASURING first, not guessing.

**Profile `fast_data.py` with cProfile to verify no new bottlenecks were introduced:**
```
python -c "import cProfile; from fast_data import *; from slow_data import load_data; d = load_data(5000); cProfile.run('search_descriptions_fast(d, \"apple\")')"
```

---

## Step 4 — Memory Profiling

Create `memory_demo.py`:

```python
# memory_demo.py — demonstrate memory profiling
from memory_profiler import profile

@profile
def process_large_dataset(n: int) -> list:
    """
    This function has memory bottlenecks:
    1. Loads all data into memory at once
    2. Creates multiple copies during processing
    """
    # Step 1: Load data
    data = list(range(n))  # Allocates ~8MB for n=1,000,000
    
    # Step 2: Create a filtered copy (another allocation)
    filtered = [x for x in data if x % 2 == 0]  # Another 4MB
    
    # Step 3: Transform (yet another allocation)
    transformed = [x * x for x in filtered]  # Another 4MB
    
    # Step 4: Sort (in-place, no extra allocation for small lists)
    transformed.sort()
    
    return transformed[:100]


@profile
def process_memory_efficient(n: int) -> list:
    """Generator-based: uses O(1) memory instead of O(n)."""
    # Generators don't allocate the full sequence
    data = range(n)              # O(1) — just a range object
    filtered = (x for x in data if x % 2 == 0)  # O(1) generator
    transformed = (x * x for x in filtered)     # O(1) generator
    
    return sorted(transformed)[:100]  # only allocates 100 items


if __name__ == "__main__":
    print("=== Memory-intensive version ===")
    result1 = process_large_dataset(1_000_000)
    
    print("\n=== Memory-efficient version ===")
    result2 = process_memory_efficient(1_000_000)
    
    assert result1 == result2, "Both should produce the same result"
    print("\nResults identical. Memory-efficient version uses ~100x less memory.")
```

### SAVE AND TRY

```
python memory_demo.py
```

Expected output:
```
=== Memory-intensive version ===
Line #    Mem usage    Increment   Line Contents
================================================
     8    45.2 MiB    45.2 MiB   def process_large_dataset(n: int) -> list:
    14    53.0 MiB     7.8 MiB       data = list(range(n))
    17    57.2 MiB     4.2 MiB       filtered = [x for x in data if x % 2 == 0]
    20    61.4 MiB     4.2 MiB       transformed = [x * x for x in filtered]
    23    61.4 MiB     0.0 MiB       transformed.sort()
    25    53.2 MiB    -8.2 MiB       return transformed[:100]

=== Memory-efficient version ===
Line #    Mem usage    Increment   Line Contents
================================================
    29    45.1 MiB    45.1 MiB   def process_memory_efficient(n: int) -> list:
    31    45.1 MiB     0.0 MiB       data = range(n)
    32    45.1 MiB     0.0 MiB       filtered = (x for x in data if x % 2 == 0]
    33    45.1 MiB     0.0 MiB       transformed = (x * x for x in filtered)
    35    45.1 MiB     0.0 MiB       return sorted(transformed)[:100]

Results identical. Memory-efficient version uses ~100x less memory.
```

The inefficient version allocates ~16MB in temporary lists. The generator version allocates < 1KB. Both produce the same result. For a function called 1000 times per second, this difference matters enormously for GC pressure.

---

## Challenge

**No solution provided. Requirements checklist only.**

Profile and optimize a realistic text processing pipeline until it meets a 1-second latency target for 100,000 words.

**Requirements checklist:**

- [ ] `text_pipeline.py` — slow version that processes a text corpus:
  - `tokenize(text)` — split into words, lowercase, remove punctuation
  - `remove_stopwords(tokens)` — remove common English words (a, the, is, are, ...)
  - `stem_words(tokens)` — simple suffix removal (running → run, cats → cat)
  - `build_word_freq(tokens)` — count frequency of each token
  - `find_top_n(freq_dict, n)` — return top N most common words
  - `run_all(text)` — runs the pipeline on a 100k-word input

- [ ] Profile with `cProfile` and report the top 5 bottleneck functions with their cumulative time
- [ ] Profile with `line_profiler` on the top 2 bottleneck functions — report the bottleneck lines
- [ ] Optimize the bottleneck lines (not the other functions). Document each optimization: what changed, why it's faster, what speedup it achieved.
- [ ] Benchmark before and after: `run_all` must complete in < 1.0s for a 100k word input
- [ ] A `PROFILING_REPORT.md` with: initial cProfile output, identified bottlenecks, optimizations made, before/after times per function, final pipeline time

**Starter:**
```python
# text_pipeline.py — slow version
import re
import string

STOPWORDS = {"a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
             "have", "has", "had", "do", "does", "did", "will", "would", "shall",
             "should", "may", "might", "must", "can", "could", "and", "or", "but",
             "in", "on", "at", "to", "for", "of", "with", "by", "from", "as"}

def tokenize(text: str) -> list[str]:
    # SLOW: re.sub compiles pattern every call
    cleaned = re.sub(r'[^\w\s]', '', text.lower())
    return cleaned.split()

def remove_stopwords(tokens: list[str]) -> list[str]:
    # SLOW: `in` on a list would be O(n) — but we're using a set, so this is OK
    # Check: is STOPWORDS a set or list?
    return [t for t in tokens if t not in STOPWORDS]

def stem_words(tokens: list[str]) -> list[str]:
    result = []
    for token in tokens:
        # SLOW: multiple if/elif with string operations
        if token.endswith("ing") and len(token) > 5:
            result.append(token[:-3])
        elif token.endswith("tion"):
            result.append(token[:-4])
        elif token.endswith("ly") and len(token) > 4:
            result.append(token[:-2])
        else:
            result.append(token)
    return result

# TODO: implement build_word_freq and find_top_n
# TODO: run_all calls all five functions in sequence
```

**When you're done:**
```python
import time
from text_pipeline import run_all

# Generate 100k words of test text
text = "the quick brown fox jumps over the lazy dog " * 11112

start = time.perf_counter()
result = run_all(text)
elapsed = time.perf_counter() - start

print(f"Pipeline time: {elapsed:.3f}s")
print(f"Top 5 words: {result[:5]}")
assert elapsed < 1.0, f"Pipeline too slow: {elapsed:.3f}s"
print("Target achieved: pipeline completes in < 1 second for 100k words")
```

**Stuck?** Ask AI: "In Python, what is the fastest way to count word frequencies in a list of 100,000 strings? Compare: dict.get() increment, collections.Counter, and numpy-based approaches. Show the benchmark showing why Counter is faster than a manual dict loop."

---

## Quick Check Answers

**1. "Optimizing" the wrong part — 5s → 4.9s:**
Amdahl's Law: the speedup from optimizing a portion of a program is limited by the fraction of time that portion contributes. If the loop you optimized contributed 2% of the 5 seconds (0.1s), halving its time saves 0.05 seconds — barely measurable. The real bottleneck (98% of the time) was elsewhere. Profile first to find the actual bottleneck. Optimizing the wrong 2% and calling it done is wasted effort.

**2. cProfile cumulative time — what it includes:**
Cumulative time includes all time spent in the function AND all functions it calls (transitively). If function A calls B calls C, and C is slow, cumulative time on A includes C's time. This is useful for finding "entry points to slow code" — a function with high cumulative time but low own time (tottime) is just a caller of something slow. Look at `tottime` for the actual hotspot: the function that does the slow work itself.

**3. CPU time vs wall time — web requests:**
CPU time counts clock cycles the CPU spent executing your code. Wall time (elapsed real time) counts how long actually passed, including waits. For a web request that makes a 50ms database query, the CPU time might be 2ms (your Python code), while wall time is 52ms (your code + waiting for the DB). cProfile measures CPU time — it won't show the DB wait as slow. For I/O-bound code (most web services), wall time matters for user experience. Profile with `time.perf_counter()` wrappers around the whole request, and use query logging/tracing to find slow DB calls.

**4. 500MB allocation — is it a problem:**
Depends on context. If the 500MB is allocated once and reused, and memory is available, it's fine. It IS a problem if: (a) allocated on every web request — at 100 RPS you'd need 50GB/s of allocation, triggering constant GC; (b) you're near the container memory limit (256MB container, 500MB allocation = OOM kill); (c) Python's GC can't keep up — pauses start affecting response times. To determine: check allocation rate (how often this function is called), check peak memory vs container limit, and measure GC pause frequency under load.
