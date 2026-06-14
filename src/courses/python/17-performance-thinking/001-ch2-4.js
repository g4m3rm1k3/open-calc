// Chapter 2.4 — Performance Thinking
//
// PHASE 2 — NUMERICAL COMPUTING (NUMPY-FIRST)
//
// TEACHES:
//   Math:    Big-O complexity (O(n), O(n²), O(n log n), O(n³)),
//            memory layout and cache effects, floating-point operation
//            counting, amortised analysis, space-time tradeoffs
//
//   Python:  time.perf_counter, timeit, memory_profiler concepts,
//            list comprehensions vs numpy, generator pipelines,
//            caching with functools.lru_cache, algorithm selection,
//            profiling bottlenecks, in-place vs copy operations
//
//   Library: fig.scatter + fig.plot(fn) to visualise empirical timing
//            curves alongside theoretical Big-O curves

export default {
  id: 'py-2-4-performance-thinking',
  slug: 'performance-thinking',
  chapter: 2.4,
  order: 3,
  title: 'Performance Thinking',
  subtitle: 'How to measure, reason about, and improve the speed of numerical Python code',
  tags: [
    'performance', 'Big-O', 'complexity', 'vectorization', 'cache',
    'profiling', 'timeit', 'memory', 'lru_cache', 'numpy', 'opencalc',
  ],

  hook: {
    question: 'Two Python programs produce the same correct answer. One takes 2 milliseconds; the other takes 45 minutes. What is the difference — and how do you find it before it costs you?',
    realWorldContext:
      'In scientific computing, performance is not optional. ' +
      'A climate model that takes 3 months to run on a supercluster is useless for forecasting. ' +
      'A trading algorithm that takes 10ms when competitors take 0.1ms loses every trade. ' +
      'Performance thinking is a skill: measure first, reason about complexity, ' +
      'then apply targeted fixes. ' +
      'This chapter teaches you to time code reliably, read Big-O complexity, ' +
      'and apply the highest-leverage optimizations available in Python — ' +
      'vectorization, caching, and algorithm selection.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Performance optimization has a strict order of operations: ' +
      '**measure first, then fix**. Guessing where code is slow leads to wasted effort. ' +
      'Profiling tells you where the program actually spends its time — ' +
      'which is almost never where you expect.',
      'The most important performance question is not "how fast is this?" but ' +
      '"**how does it scale?**" An O(n²) algorithm that runs in 1ms for n=100 ' +
      'takes 10 seconds for n=10,000 and 28 hours for n=1,000,000. ' +
      'Switching to an O(n log n) algorithm at that point saves orders of magnitude.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Big-O notation',
        body: 'f(n) = O(g(n)) means: there exist constants c > 0 and n₀ such that f(n) ≤ c·g(n) for all n > n₀. Big-O describes the asymptotic growth rate — how runtime scales as input size grows, ignoring constant factors.',
      },
      {
        type: 'insight',
        title: 'The 80/20 rule of optimization',
        body: '80% of execution time is spent in 20% of the code. Profile to find the hotspot, then fix only that. Optimizing the other 80% gives negligible benefit.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Performance Thinking',
        mathBridge: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ). Vectorization replaces Python loops with compiled C — typically 100–1000× faster.',
        caption: 'Work through every cell. Pay attention to the timing ratios — they reveal which complexity class your code belongs to.',
        props: {
          disableRunAll: true,
          initialCells: [

            // ── TIMING BASICS ─────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Timing code — doing it right',
              prose: [
                '`time.perf_counter()` measures wall-clock time with nanosecond resolution. The pattern is always: record time before, run code, record time after, subtract. But a single measurement is noisy — the OS may schedule other work mid-run. For reliable micro-benchmarks, run the code many times and take the minimum.',
                '## Why minimum, not mean?',
                'The **minimum** time is the true cost of the computation — it represents a run with no OS interference. The mean is inflated by occasional context switches and cache misses that are not part of your code. The `timeit` module automates this: it runs the code thousands of times and reports the best.',
                '## The measurement rules',
                '- Always time the same operation at multiple input sizes\n- Use at least 5 repetitions; take the minimum\n- Warm up the cache with one un-timed run first\n- For numpy: include `.copy()` if you want to time allocation separately\n- Never include `print()` inside the timed block — I/O dominates',
              ],
              code: `import time
import numpy as np

def time_fn(fn, reps=3):
    """Run fn() reps times, return minimum time in milliseconds."""
    times = []
    fn()  # warm-up run
    for _ in range(reps):
        t0 = time.perf_counter()
        fn()
        times.append((time.perf_counter() - t0) * 1000)
    return min(times)

# Compare three ways to sum 1 million numbers
n = 500_000   # 500k — measurable but not too slow in Pyodide
py_list = list(range(n))
np_arr  = np.arange(n, dtype=float)

t_builtin = time_fn(lambda: sum(py_list))
t_loop    = time_fn(lambda: sum(x for x in py_list))
t_numpy   = time_fn(lambda: np_arr.sum())

print(f"Python built-in sum:   {t_builtin:.3f} ms")
print(f"Generator expression:  {t_loop:.3f} ms")
print(f"numpy .sum():          {t_numpy:.3f} ms")
print()
def speedup(a, b): return a/b if b > 0 else float('inf')
print(f"numpy speedup vs builtin: {speedup(t_builtin, t_numpy):.0f}×")
print(f"numpy speedup vs loop:    {speedup(t_loop,    t_numpy):.0f}×")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── BIG-O VISUALISED ──────────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Big-O complexity — visualising the growth curves',
              prose: [
                '**Big-O notation** describes how runtime grows as input size n increases. The complexity class matters far more than the constant factor: an O(n log n) algorithm with a large constant will eventually beat any O(n²) algorithm for large enough n.',
                '## Common complexity classes (slowest to fastest)',
                '- O(2ⁿ) — exponential: unusable beyond n≈30\n- O(n³) — cubic: matrix multiply naively; fine up to n≈1,000\n- O(n²) — quadratic: nested loops; fine up to n≈10,000\n- O(n log n) — linearithmic: sort, FFT; fine up to n≈10⁸\n- O(n) — linear: single pass; scales to any n\n- O(log n) — logarithmic: binary search; essentially free\n- O(1) — constant: dictionary lookup, array index',
                '## Reading the chart',
                'The chart shows operations (relative units) vs input size n. Notice how O(n²) and O(n³) shoot upward while O(n log n) and O(n) stay manageable. This is why algorithm choice dominates all other performance decisions.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER, GREEN, GRAY, PURPLE

# Complexity classes — operations relative to O(n) at n=100
fig = Figure(xmin=1, xmax=100, ymin=0, ymax=800,
             title="Big-O complexity classes (relative operations)")
fig.grid().axes()

# O(log n)
fig.plot(lambda n: math.log2(n) * 10,        color=GREEN,  label="O(log n)")
# O(n)
fig.plot(lambda n: n,                          color=BLUE,   label="O(n)")
# O(n log n)
fig.plot(lambda n: n * math.log2(max(n,1.1)), color=AMBER,  label="O(n log n)")
# O(n²)  — clipped so plot stays readable
fig.plot(lambda n: min(n**2 * 0.08, 790),     color=RED,    label="O(n²)")
# O(n³)  — clipped
fig.plot(lambda n: min(n**3 * 0.001, 790),    color=PURPLE, label="O(n³)")

fig.text([85,  20], "O(log n)",   color='green',  size=10, bold=True)
fig.text([85,  95], "O(n)",       color='blue',   size=10, bold=True)
fig.text([70, 580], "O(n log n)", color='#b8860b',size=10, bold=True)
fig.text([55, 250], "O(n²)",      color='red',    size=10, bold=True)
fig.text([28, 700], "O(n³)",      color='purple', size=10, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── EMPIRICAL COMPLEXITY ──────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Measuring empirical complexity — finding your Big-O',
              prose: [
                'You can determine an algorithm\'s complexity experimentally: time it at several input sizes and look at the ratio. If doubling n doubles the time → O(n). If doubling n quadruples the time → O(n²). If it increases by 8× → O(n³).',
                '## The doubling rule',
                '- Time ratio ≈ 2 when n doubles → **O(n)**\n- Time ratio ≈ 4 when n doubles → **O(n²)**\n- Time ratio ≈ 8 when n doubles → **O(n³)**\n- Time ratio ≈ 2·log(2n)/log(n) ≈ 2 (plus small log factor) → **O(n log n)**',
                '## Log-log plots',
                'On a log-log plot, O(nᵏ) appears as a straight line with slope k. This makes it easy to visually identify the complexity class of any algorithm from timing data alone.',
              ],
              code: `import time, math
import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def time_ms(fn, reps=5):
    fn()  # warm up
    return min((time.perf_counter(), fn(), time.perf_counter())[2] -
               (time.perf_counter(), fn(), time.perf_counter())[0]
               for _ in range(reps)) * 1000

def time_ms(fn, reps=5):
    fn()
    best = float('inf')
    for _ in range(reps):
        t0 = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - t0)
    return best * 1000

# Algorithm A: O(n)  — single numpy sum
# Algorithm B: O(n²) — Python nested loop (keep n small — Pyodide is ~10× slower than CPython)
sizes_lin  = [500, 1000, 2000, 4000, 8000, 16000]
sizes_quad = [50, 100, 150, 200]   # n²: 200² = 40k ops — safe in Pyodide

times_linear = []
times_quad   = []

for n in sizes_lin:
    arr = np.arange(n, dtype=float)
    times_linear.append(time_ms(lambda a=arr: a.sum()))

for n in sizes_quad:
    lst = list(range(n))
    times_quad.append(time_ms(lambda l=lst, n=n: sum(l[i]+l[j] for i in range(n) for j in range(n))))

print("O(n) — numpy sum:")
print(f"  {'n':>6}  {'time (ms)':>10}  {'ratio':>8}")
for i, (n, t) in enumerate(zip(sizes_lin, times_linear)):
    prev = times_linear[i-1] if i > 0 else None
    ratio = t / prev if (prev is not None and prev > 0) else 1.0
    print(f"  {n:>6}  {t:>10.4f}  {ratio:>8.2f}×")

print("\\nO(n²) — Python nested loop:")
print(f"  {'n':>6}  {'time (ms)':>10}  {'ratio':>8}")
for i, (n, t) in enumerate(zip(sizes_quad, times_quad)):
    prev = times_quad[i-1] if i > 0 else None
    ratio = t / prev if (prev is not None and prev > 0) else 1.0
    print(f"  {n:>6}  {t:>10.2f}  {ratio:>8.2f}×")

# Log-log plot
log_n_lin  = [math.log10(n) for n in sizes_lin]
log_n_quad = [math.log10(n) for n in sizes_quad]
log_tl = [math.log10(max(t, 1e-6)) for t in times_linear]
log_tq = [math.log10(max(t, 1e-6)) for t in times_quad]

all_log_t = log_tl + log_tq
fig = Figure(xmin=1.6, xmax=4.3, ymin=min(all_log_t)-0.5, ymax=max(all_log_t)+0.5,
             title="Log-log plot: slope = complexity exponent")
fig.grid().axes()
fig.scatter(log_n_lin,  log_tl, color=BLUE, radius=6)
fig.scatter(log_n_quad, log_tq, color=RED,  radius=6)
fig.text([3.5, max(log_tl)+0.1], "O(n) — slope≈1",  color='blue', size=11, bold=True)
fig.text([2.1, max(log_tq)-0.3], "O(n²) — slope≈2", color='red',  size=11, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── VECTORIZATION VS LOOPS ────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Vectorization — the single biggest Python speedup',
              prose: [
                'Replacing a Python loop with a numpy vectorized operation is the highest-leverage optimization available in numerical Python. The speedup comes from three sources: (1) no per-element Python interpreter overhead, (2) no per-element object allocation, (3) the CPU can use SIMD instructions to process multiple elements per clock cycle.',
                '## The vectorization checklist',
                '- Does the loop apply the same operation to every element? → use a numpy ufunc or arithmetic operator\n- Does the loop accumulate a sum, product, or running value? → use `np.sum`, `np.prod`, `np.cumsum`, `np.cumprod`\n- Does the loop filter elements by condition? → use boolean indexing\n- Does the loop compute pairwise distances or outer products? → use broadcasting\n- Does the loop depend on the previous result? → may not be vectorizable (recurrence)',
                '## When loops are unavoidable',
                'A recurrence like `x[i] = f(x[i-1])` cannot be vectorized — each step depends on the last. In that case: write it in numpy as efficiently as possible, or consider Cython/Numba for compiled loops.',
              ],
              code: `import time, numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def bench(label, fn, n_runs=5):
    fn()
    best = float('inf')
    for _ in range(n_runs):
        t0 = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - t0)
    print(f"  {label:<40} {best*1000:.3f} ms")

n = 500_000
arr = np.random.rand(n)
lst = arr.tolist()

print(f"Benchmarks on n={n:,} elements:")
print()

print("1. Sum all elements:")
bench("Python sum(list)",          lambda: sum(lst))
bench("np.sum(array)",             lambda: np.sum(arr))

print("\\n2. Square root of each element:")
bench("list comprehension",        lambda: [x**0.5 for x in lst])
bench("np.sqrt(array)",            lambda: np.sqrt(arr))

print("\\n3. Clip values to [0.2, 0.8]:")
bench("list comprehension",        lambda: [max(0.2, min(0.8, x)) for x in lst])
bench("np.clip(array, 0.2, 0.8)", lambda: np.clip(arr, 0.2, 0.8))

print("\\n4. Count values > 0.5:")
bench("Python sum(x>0.5 for x in lst)", lambda: sum(1 for x in lst if x > 0.5))
bench("(arr > 0.5).sum()",         lambda: (arr > 0.5).sum())

print("\\n5. Normalise to zero mean, unit std:")
bench("loop + stats",              lambda: [(x - sum(lst)/n) for x in lst])
bench("(arr - arr.mean())/arr.std()", lambda: (arr - arr.mean()) / arr.std())`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── MEMORY LAYOUT ─────────────────────────────────────────────────
            {
              id: 5,
              cellTitle: 'Memory layout — row-major vs column-major',
              prose: [
                'A 2D numpy array stores its numbers in a flat block of memory. **Row-major** (C order, numpy default) stores row 0, then row 1, etc. **Column-major** (Fortran order) stores column 0, then column 1, etc. This affects performance because CPUs read memory in cache lines of 64 bytes — accessing sequential memory addresses is fast; jumping around is slow.',
                '## The practical consequence',
                '- Iterating over rows of a C-order array is fast (sequential memory access)\n- Iterating over columns of a C-order array is slow (strided memory access)\n- `arr.T` does NOT copy data — it just swaps the strides, so column access on a transpose is still slow\n- For matrix multiply: numpy calls BLAS, which handles layout internally — no manual tuning needed',
                '## Views and copies',
                '- `arr[::2]` — a **view**: no copy, shared memory\n- `arr.reshape(m, n)` — usually a **view** (same data, different strides)\n- `arr.T` — a **view** (swapped strides)\n- `arr.flatten()` — always a **copy**\n- `arr.ravel()` — a **view** when possible, **copy** when necessary\n- `np.ascontiguousarray(arr)` — forces a copy into C-contiguous layout',
              ],
              code: `import time, numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def bench_ms(fn, reps=5):
    fn()
    best = float('inf')
    for _ in range(reps):
        t0 = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - t0)
    return best * 1000

n = 2000
arr_c = np.random.rand(n, n)                      # C-order (row-major)
arr_f = np.asfortranarray(arr_c)                  # Fortran-order (column-major)

t_row_c = bench_ms(lambda: arr_c.sum(axis=1))     # sum each row — fast for C
t_col_c = bench_ms(lambda: arr_c.sum(axis=0))     # sum each col — slow for C
t_row_f = bench_ms(lambda: arr_f.sum(axis=1))     # sum each row — slow for F
t_col_f = bench_ms(lambda: arr_f.sum(axis=0))     # sum each col — fast for F

print(f"Sum each row (axis=1):")
print(f"  C-order (row-major):     {t_row_c:.3f} ms  ← sequential, fast")
print(f"  F-order (column-major):  {t_row_f:.3f} ms  ← strided, slower")
print(f"\\nSum each column (axis=0):")
print(f"  C-order (row-major):     {t_col_c:.3f} ms  ← strided, slower")
print(f"  F-order (column-major):  {t_col_f:.3f} ms  ← sequential, fast")

print(f"\\nMemory layout flags:")
print(f"  C-order arr is C_CONTIGUOUS: {arr_c.flags['C_CONTIGUOUS']}")
print(f"  F-order arr is F_CONTIGUOUS: {arr_f.flags['F_CONTIGUOUS']}")
print(f"  arr_c.T is C_CONTIGUOUS: {arr_c.T.flags['C_CONTIGUOUS']}")
print(f"  arr_c.T is F_CONTIGUOUS: {arr_c.T.flags['F_CONTIGUOUS']}")

print(f"\\nStrides (bytes between elements in each dimension):")
print(f"  C-order strides: {arr_c.strides}  (row stride {arr_c.strides[0]}, col stride {arr_c.strides[1]})")
print(f"  F-order strides: {arr_f.strides}  (row stride {arr_f.strides[0]}, col stride {arr_f.strides[1]})")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CACHING WITH LRU_CACHE ────────────────────────────────────────
            {
              id: 6,
              cellTitle: 'Caching — trading memory for speed',
              prose: [
                '**Memoization** stores the result of a function call so that the same inputs never require recomputation. Python\'s `functools.lru_cache` decorator adds this automatically with a fixed-size cache (LRU = Least Recently Used — evicts the least recently accessed entry when the cache is full).',
                '## When caching helps',
                '- The function is **pure** (same inputs always give same outputs)\n- The function is **expensive** relative to a dictionary lookup\n- The **same inputs recur** — caching a function called with always-unique inputs wastes memory with zero benefit\n- **Recursive algorithms** with overlapping subproblems are the classic case (Fibonacci, dynamic programming)',
                '## `@lru_cache` syntax',
                '`@lru_cache(maxsize=None)` — unlimited cache size (use with care — can exhaust memory)\n`@lru_cache(maxsize=128)` — keeps the 128 most recently used results\n`cache_info()` — returns hits, misses, maxsize, currsize\nArguments must be **hashable** — tuples work, lists and numpy arrays do not',
              ],
              code: `import time
from functools import lru_cache
from opencalc import Figure, BLUE, RED, GRAY

# Fibonacci — classic overlapping subproblems
def fib_naive(n):
    """Exponential time — recomputes the same subproblems repeatedly."""
    if n <= 1: return n
    return fib_naive(n-1) + fib_naive(n-2)

@lru_cache(maxsize=None)
def fib_cached(n):
    """O(n) time with memoization — each subproblem solved exactly once."""
    if n <= 1: return n
    return fib_cached(n-1) + fib_cached(n-2)

# Time both
def time_ms(fn, *args):
    t0 = time.perf_counter()
    result = fn(*args)
    return (time.perf_counter() - t0) * 1000, result

# Naive — only feasible for small n
naive_times, cached_times, ns = [], [], []
for n in [10, 15, 20, 25, 30, 35]:
    if n <= 30:
        t_naive, _ = time_ms(fib_naive, n)
        naive_times.append(float(t_naive))
    else:
        naive_times.append(None)
    fib_cached.cache_clear()
    t_cached, _ = time_ms(fib_cached, n)
    cached_times.append(float(t_cached))
    ns.append(n)

print(f"{'n':>4}  {'naive (ms)':>12}  {'cached (ms)':>12}  {'speedup':>10}")
print("-" * 46)
for i, n in enumerate(ns):
    t_n = f"{naive_times[i]:>12.3f}" if naive_times[i] is not None else "      (skipped)"
    t_c = f"{cached_times[i]:>12.6f}"
    speedup = f"{naive_times[i]/cached_times[i]:>10.0f}×" if naive_times[i] else "         n/a"
    print(f"{n:>4}  {t_n}  {t_c}  {speedup}")

print(f"\\nCache info: {fib_cached.cache_info()}")

# Show cache hit/miss for repeated calls
fib_cached.cache_clear()
fib_cached(40)                     # first call — populates cache
info_after_first = fib_cached.cache_info()
fib_cached(40)                     # second call — pure cache hit
fib_cached(38)                     # already cached as subproblem
info_after_second = fib_cached.cache_info()
print(f"After first fib(40):  hits={info_after_first.hits}, misses={info_after_first.misses}")
print(f"After fib(40)+fib(38): hits={info_after_second.hits}, misses={info_after_second.misses}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── IN-PLACE OPERATIONS ───────────────────────────────────────────
            {
              id: 7,
              cellTitle: 'In-place operations — avoiding unnecessary copies',
              prose: [
                'Every `arr + 1` in numpy allocates a new array. For large arrays this means large memory allocations — which are slow. **In-place operations** (`arr += 1`, `np.add(arr, 1, out=arr)`) modify the existing array without allocating memory, which is faster when you do not need the original.',
                '## In-place operator table',
                '- `arr += scalar` — add in place\n- `arr *= scalar` — multiply in place\n- `arr -= scalar` — subtract in place\n- `arr /= scalar` — divide in place\n- `np.sqrt(arr, out=arr)` — square root in place (use `out=` parameter)\n- `np.add(a, b, out=c)` — add a+b and store in c (pre-allocated)',
                '## When NOT to use in-place',
                'In-place operations modify the array **and any views of it** (slices, transposes). If other code holds a reference to the same array, in-place changes will affect them. Always use in-place only when you own the data and know no other references exist.',
              ],
              code: `import time, numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def bench_ms(fn, reps=7):
    fn()
    best = float('inf')
    for _ in range(reps):
        t0 = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - t0)
    return best * 1000

n = 5_000_000
base = np.random.rand(n)

# Copy version — allocates a new array each time
def normalize_copy(arr):
    arr = arr - arr.mean()   # new array
    arr = arr / arr.std()    # another new array
    return arr

# In-place version — reuses the buffer
def normalize_inplace(arr):
    arr = arr.copy()         # one copy — then modify in place
    arr -= arr.mean()
    arr /= arr.std()
    return arr

t_copy    = bench_ms(lambda: normalize_copy(base))
t_inplace = bench_ms(lambda: normalize_inplace(base))

print(f"Copy-based normalisation:    {t_copy:.2f} ms")
print(f"In-place normalisation:      {t_inplace:.2f} ms")
print(f"Speedup:                     {t_copy/t_inplace:.2f}×" if t_inplace > 0 else "Speedup: (t_inplace too fast to measure)")
print()

# Demonstrate view aliasing danger
arr = np.array([1.0, 2.0, 3.0, 4.0])
view = arr[1:3]              # view shares memory
print(f"Before: arr={arr}, view={view}")
arr += 10                    # in-place on arr — affects view too!
print(f"After arr+=10: arr={arr}, view={view}  ← view changed!")
print()

# out= parameter for ufuncs
a = np.random.rand(n)
result = np.empty(n)         # pre-allocate output
t_alloc  = bench_ms(lambda: np.sqrt(a))
t_out    = bench_ms(lambda: np.sqrt(a, out=result))
print(f"np.sqrt (allocates):   {t_alloc:.2f} ms")
print(f"np.sqrt(out=result):   {t_out:.2f} ms")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── ALGORITHM SELECTION ───────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Algorithm selection — complexity beats constants',
              prose: [
                'The fastest implementation of a slow algorithm is still slower than a fast algorithm. This cell demonstrates the crossover point between a naively fast O(n²) approach and a slightly more complex O(n log n) approach — and shows that for large n, complexity always wins.',
                '## Sorting as the canonical example',
                'Sorting is the most studied algorithmic problem. Python\'s `sorted()` uses **Timsort** — O(n log n) worst case, O(n) on nearly-sorted data. A naive bubble sort is O(n²). For n=10 they are comparable; for n=10,000 there is no contest.',
                '## The crossover n',
                'Every pair of complexity classes has a crossover point where the faster-complexity algorithm becomes faster in practice. Below that n, the simpler O(n²) algorithm may win due to lower overhead. Above it, the asymptotically better algorithm always wins.',
              ],
              code: `import time, random
import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def bench_ms(fn, reps=3):
    best = float('inf')
    for _ in range(reps):
        t0 = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - t0)
    return best * 1000

def bubble_sort(lst):
    """O(n²) — swap adjacent elements until sorted."""
    a = lst[:]
    n = len(a)
    for i in range(n):
        for j in range(n - i - 1):
            if a[j] > a[j+1]:
                a[j], a[j+1] = a[j+1], a[j]
    return a

# Keep bubble sort small — O(n²) in pure Python is slow in Pyodide
# n=300: ~45k iterations; n=500: ~125k iterations — safe
sizes = [50, 100, 200, 300, 500, 1000, 5000]
bubble_limit = 300   # only run bubble sort up to this size

t_bubble = []
t_timsort = []
t_numpy_sort = []

print(f"{'n':>6}  {'bubble (ms)':>12}  {'Timsort (ms)':>13}  {'np.sort (ms)':>13}")
print("-" * 50)

for n in sizes:
    data = [random.random() for _ in range(n)]
    arr  = np.array(data)

    t_b = bench_ms(lambda d=data: bubble_sort(d)) if n <= bubble_limit else None
    t_t = bench_ms(lambda d=data: sorted(d))
    t_n = bench_ms(lambda a=arr: np.sort(a))

    t_bubble.append(t_b)
    t_timsort.append(float(t_t))
    t_numpy_sort.append(float(t_n))

    b_str = f"{t_b:>12.2f}" if t_b is not None else "     (skipped)"
    print(f"{n:>6}  {b_str}  {t_t:>13.3f}  {t_n:>13.3f}")

# Plot Timsort and numpy sort (excluding bubble for clarity)
import math
log_ns  = [math.log10(n) for n in sizes]   # all sizes for Timsort/np.sort
log_tim = [math.log10(max(t, 1e-6)) for t in t_timsort]
log_nps = [math.log10(max(t, 1e-6)) for t in t_numpy_sort]

fig = Figure(xmin=1.6, xmax=3.8,
             ymin=min(log_nps)-0.3, ymax=max(log_tim)+0.3,
             title="Log-log: Timsort vs np.sort (slope ≈ 1 means O(n log n))")
fig.grid().axes()
fig.scatter(log_ns, log_tim, color=BLUE, radius=5)
fig.scatter(log_ns, log_nps, color=RED,  radius=5)
fig.text([3.0, max(log_tim)+0.1],  "Timsort", color='blue', size=11, bold=True)
fig.text([3.0, max(log_nps)-0.25], "np.sort", color='red',  size=11, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── PROFILING ─────────────────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Profiling — finding the real bottleneck',
              prose: [
                'Profiling measures where time is actually spent in a program. Python\'s `cProfile` module instruments every function call and reports: how many times each function was called, total time spent inside it, and time excluding sub-calls.',
                '## Reading the profile output',
                '- `tottime` — time spent in the function itself (excluding calls to sub-functions) — this is where optimisation effort pays off\n- `cumtime` — cumulative time including all functions called from this one\n- `ncalls` — number of times the function was called\n- Focus on functions with large `tottime` and high `ncalls` — these are the hotspots',
                '## The optimization workflow',
                '1. Profile the full program — do NOT guess where it is slow\n2. Find the function with the highest `tottime`\n3. Understand why it is slow (algorithmic or implementation?)\n4. Apply the smallest change that fixes the bottleneck\n5. Profile again — verify improvement, check for new bottlenecks',
              ],
              code: `import cProfile, pstats, io
import numpy as np

def slow_pairwise_sum(arr):
    """O(n²) — computes sum of all pairs. Slow but correct."""
    n = len(arr)
    total = 0.0
    for i in range(n):
        for j in range(i+1, n):
            total += arr[i] + arr[j]
    return total

def fast_pairwise_sum(arr):
    """O(n) equivalent formula: each element appears (n-1) times."""
    n = len(arr)
    return float((n - 1) * arr.sum())

arr = np.arange(200, dtype=float)

# Verify correctness
slow_result = slow_pairwise_sum(arr)
fast_result = fast_pairwise_sum(arr)
print(f"slow result: {slow_result:.1f}")
print(f"fast result: {fast_result:.1f}")
print(f"Match: {abs(slow_result - fast_result) < 1e-6}")
print()

# Profile the slow version
pr = cProfile.Profile()
pr.enable()
for _ in range(3):
    slow_pairwise_sum(arr)
pr.disable()

stream = io.StringIO()
ps = pstats.Stats(pr, stream=stream).sort_stats('tottime')
ps.print_stats(10)
profile_output = stream.getvalue()

# Print key lines only
for line in profile_output.split('\\n'):
    if line.strip() and ('tottime' in line or 'slow' in line or 'ncalls' in line or 'function' in line):
        print(line)`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── PUTTING IT TOGETHER ───────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'Putting it together — optimising a real computation',
              prose: [
                'This cell walks through a realistic optimisation story: starting from a correct but slow implementation, measuring it, identifying the bottleneck, and applying the right fix at each stage.',
                '## The problem',
                'Given a time series of n observations, compute for each point the mean of all points within a window of radius r (a "moving average"). This shows up in signal processing, finance, and sensor smoothing.',
                '## Three implementations',
                '1. **Naive Python loops** — O(n·r): correct but slow\n2. **numpy vectorized window** — O(n·r) but with vectorized inner loop\n3. **Cumulative sum trick** — O(n): use `np.cumsum` to compute any window mean in O(1) per point',
              ],
              code: `import time, numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def moving_avg_loop(arr, r):
    """O(n·r) — pure Python loop."""
    n = len(arr)
    out = np.empty(n)
    for i in range(n):
        lo = max(0, i - r)
        hi = min(n, i + r + 1)
        out[i] = sum(arr[lo:hi]) / (hi - lo)
    return out

def moving_avg_cumsum(arr, r):
    """O(n) — prefix sum trick."""
    n = len(arr)
    # Pad with edge values so every window is full
    padded = np.concatenate([np.full(r, arr[0]), arr, np.full(r, arr[-1])])
    cs = np.cumsum(padded)
    # Window from i-r to i+r (length 2r+1) — use prefix sums
    window = 2*r + 1
    # cs[i+window] - cs[i] gives sum of window elements
    out = (cs[window:] - cs[:n]) / window
    return out

def bench_ms(fn, reps=3):
    best = float('inf')
    for _ in range(reps):
        t0 = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - t0)
    return best * 1000

# Generate noisy signal
rng = np.random.default_rng(0)
n   = 2000
t   = np.linspace(0, 4*3.14159, n)
signal = np.sin(t) + 0.4*rng.standard_normal(n)
r = 30

t_loop   = bench_ms(lambda: moving_avg_loop(signal, r))
t_cumsum = bench_ms(lambda: moving_avg_cumsum(signal, r))

smoothed_loop   = moving_avg_loop(signal, r)
smoothed_cumsum = moving_avg_cumsum(signal, r)

print(f"Window radius: {r} (window size {2*r+1})")
print(f"Signal length: {n}")
print(f"Loop method:   {t_loop:.2f} ms")
print(f"Cumsum method: {t_cumsum:.3f} ms")
print(f"Speedup:       {t_loop/t_cumsum:.0f}×" if t_cumsum > 0 else "Speedup: (cumsum too fast to measure)")
print(f"Results match: {np.allclose(smoothed_loop, smoothed_cumsum, atol=1e-10)}")

# Plot original vs smoothed
step = 5
t_list = t[::step].tolist()
fig = Figure(xmin=0, xmax=float(t[-1])+0.2, ymin=-2, ymax=2,
             title=f"Moving average (r={r}): noisy signal vs cumsum smoothed")
fig.grid().axes()
fig.scatter(t_list, signal[::step].tolist(), color=GRAY, radius=2)
fig.scatter(t_list, smoothed_cumsum[::step].tolist(), color=BLUE, radius=3)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGES ───────────────────────────────────────────────────

            {
              id: 'c1',
              challengeType: 'fill',
              challengeNumber: 1,
              challengeTitle: 'Identify the complexity class',
              difficulty: 'easy',
              prompt: 'Fill in the Big-O complexity for each code snippet, then verify by timing two sizes and computing the ratio.',
              starterBlock: `import time, numpy as np

def time_ms(fn):
    t0 = time.perf_counter(); fn(); return (time.perf_counter()-t0)*1000

n1, n2 = 1000, 2000

# Snippet A: single numpy sum
tA1 = time_ms(lambda: np.arange(n1).sum())
tA2 = time_ms(lambda: np.arange(n2).sum())
complexity_A = "O(___)"   # fill in

# Snippet B: nested Python loop
def fn_B(n): return sum(i+j for i in range(n) for j in range(n))
tB1 = time_ms(lambda: fn_B(n1))
tB2 = time_ms(lambda: fn_B(n2))
complexity_B = "O(___)"   # fill in

print(f"A: {tA1:.3f}ms → {tA2:.3f}ms  ratio={tA2/tA1:.2f}  {complexity_A}")
print(f"B: {tB1:.1f}ms → {tB2:.1f}ms  ratio={tB2/tB1:.2f}  {complexity_B}")`,
              code: `import time, numpy as np

def time_ms(fn):
    t0 = time.perf_counter(); fn(); return (time.perf_counter()-t0)*1000

n1, n2 = 1000, 2000

tA1 = time_ms(lambda: np.arange(n1).sum())
tA2 = time_ms(lambda: np.arange(n2).sum())
complexity_A = "O(n)"

def fn_B(n): return sum(i+j for i in range(n) for j in range(n))
tB1 = time_ms(lambda: fn_B(n1))
tB2 = time_ms(lambda: fn_B(n2))
complexity_B = "O(n²)"

print(f"A: {tA1:.3f}ms → {tA2:.3f}ms  ratio={tA2/tA1:.2f}  {complexity_A}")
print(f"B: {tB1:.1f}ms → {tB2:.1f}ms  ratio={tB2/tB1:.2f}  {complexity_B}")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'complexity_A' not in dir():
    res = "ERROR: complexity_A not defined."
elif 'complexity_B' not in dir():
    res = "ERROR: complexity_B not defined."
elif 'n' not in complexity_A.lower():
    res = f"ERROR: complexity_A should contain 'n', got '{complexity_A}'."
elif 'n²' not in complexity_B and 'n^2' not in complexity_B.lower() and 'n2' not in complexity_B.lower():
    res = f"ERROR: complexity_B should be O(n²), got '{complexity_B}'."
else:
    res = f"SUCCESS: A={complexity_A}, B={complexity_B}. Ratio for A≈2, ratio for B≈4."
res
`,
              hint: 'Doubling n: if time ratio ≈ 2 → O(n). If ratio ≈ 4 → O(n²). A single pass is O(n); a nested loop over n×n is O(n²).',
            },

            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Vectorize a computation',
              difficulty: 'easy',
              prompt: 'The function `slow_zscore(data)` computes the z-score of each element using a Python loop. Write `fast_zscore(data)` that does the same using only numpy operations (no loops). Verify correctness and measure the speedup.',
              code: `import time, numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def slow_zscore(data):
    """O(n) Python loop — computes (x - mean) / std for each element."""
    mean = sum(data) / len(data)
    variance = sum((x - mean)**2 for x in data) / len(data)
    std = variance ** 0.5
    return [(x - mean) / std for x in data]

def fast_zscore(data):
    """Vectorized numpy version — no Python loops."""
    pass

rng = np.random.default_rng(5)
data_np  = rng.normal(10, 3, 100_000)
data_list = data_np.tolist()

# Correctness
result_slow = slow_zscore(data_list[:1000])
result_fast = fast_zscore(data_np[:1000])
if result_fast is not None:
    print(f"Results match: {np.allclose(result_slow, result_fast, atol=1e-8)}")

# Speed
def bench(fn, reps=5):
    best = float('inf')
    for _ in range(reps):
        t0 = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - t0)
    return best * 1000

t_slow = bench(lambda: slow_zscore(data_list))
t_fast = bench(lambda: fast_zscore(data_np))
print(f"slow_zscore: {t_slow:.2f} ms")
print(f"fast_zscore: {t_fast:.3f} ms")
print(f"Speedup:     {t_slow/t_fast:.0f}×" if t_fast > 0 else "Speedup: (fast_zscore too quick to measure)")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'fast_zscore' not in dir():
    res = "ERROR: fast_zscore not defined."
else:
    arr = np.array([2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0])
    z = fast_zscore(arr)
    if z is None:
        res = "ERROR: returned None — fill in the function."
    else:
        z = np.array(z)
        expected = (arr - arr.mean()) / arr.std()
        if not np.allclose(z, expected, atol=1e-8):
            res = f"ERROR: z-scores wrong. Got {z.round(4)}, expected {expected.round(4)}."
        elif not np.isclose(z.mean(), 0.0, atol=1e-8):
            res = f"ERROR: z-score mean should be 0, got {z.mean():.6f}."
        elif not np.isclose(z.std(), 1.0, atol=1e-6):
            res = f"ERROR: z-score std should be 1, got {z.std():.6f}."
        else:
            res = f"SUCCESS: fast_zscore correct — mean={z.mean():.2e}, std={z.std():.6f}."
res
`,
              hint: '(arr - arr.mean()) / arr.std(). numpy does all three operations vectorized — no loop needed.',
            },

            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Empirical complexity measurement',
              difficulty: 'medium',
              prompt: 'Write `measure_complexity(fn, sizes, reps=5)` that times `fn(n)` at each size in `sizes` and returns a dict with keys `sizes`, `times_ms`, `ratios` (time[i]/time[i-1] for i>0), and `estimated_exponent` (slope of log-log fit using np.polyfit). Apply it to three functions: (A) np.sum on an array of size n, (B) sorting an array, (C) matrix multiply of two (n,n) matrices. Print results and plot all three on one log-log figure.',
              code: `import time, numpy as np, math
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def measure_complexity(fn, sizes, reps=5):
    """
    Time fn(n) at each size. Returns dict with:
    sizes, times_ms, ratios, estimated_exponent.
    """
    pass

sizes_vec  = [1000, 2000, 4000, 8000, 16000]
sizes_sort = [1000, 2000, 4000, 8000, 16000]
sizes_mm   = [30, 60, 100, 150]   # matmul is cubic — n=150: 3.4M ops × 5 reps = safe

rng = np.random.default_rng(7)

result_A = measure_complexity(lambda n: np.arange(n, dtype=float).sum(),     sizes_vec)
result_B = measure_complexity(lambda n: np.sort(rng.random(n)),              sizes_sort)
result_C = measure_complexity(lambda n: rng.random((n,n)) @ rng.random((n,n)), sizes_mm)

for label, r in [("A: np.sum  ", result_A), ("B: np.sort ", result_B), ("C: matmul  ", result_C)]:
    exp = r['estimated_exponent']
    print(f"{label}  exponent≈{exp:.2f}  times(ms): {[round(t,3) for t in r['times_ms']]}")

# Log-log plot
def log_scatter(r, color, label):
    log_n = [math.log10(n) for n in r['sizes']]
    log_t = [math.log10(max(t, 1e-6)) for t in r['times_ms']]
    fig_ref['fig'].scatter(log_n, log_t, color=color, radius=5)
    # Label at last point
    fig_ref['fig'].text([log_n[-1]+0.02, log_t[-1]+0.05], label, color=color, size=10, bold=True)

all_times = result_A['times_ms'] + result_B['times_ms'] + result_C['times_ms']
all_sizes = result_A['sizes']    + result_B['sizes']    + result_C['sizes']
log_t_all = [math.log10(max(t,1e-6)) for t in all_times]
log_n_all = [math.log10(n) for n in all_sizes]

fig = Figure(xmin=min(log_n_all)-0.1, xmax=max(log_n_all)+0.3,
             ymin=min(log_t_all)-0.3,  ymax=max(log_t_all)+0.4,
             title="Empirical complexity — log-log (slope = exponent)")
fig.grid().axes()

for r, color, lbl in [(result_A, BLUE, "sum O(n)"),
                       (result_B, RED,  "sort O(n logn)"),
                       (result_C, AMBER,"matmul O(n³)")]:
    log_n = [math.log10(n) for n in r['sizes']]
    log_t = [math.log10(max(t,1e-6)) for t in r['times_ms']]
    fig.scatter(log_n, log_t, color=color, radius=5)
    fig.text([log_n[-1]+0.05, log_t[-1]], lbl, color=color, size=10, bold=True)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'measure_complexity' not in dir():
    res = "ERROR: measure_complexity not defined."
else:
    r = measure_complexity(lambda n: np.arange(n).sum(), [100, 200, 400], reps=3)
    if r is None:
        res = "ERROR: returned None — fill in the function."
    elif not isinstance(r, dict):
        res = "ERROR: must return a dict."
    elif 'times_ms' not in r:
        res = "ERROR: dict missing 'times_ms'."
    elif 'estimated_exponent' not in r:
        res = "ERROR: dict missing 'estimated_exponent'."
    elif len(r['times_ms']) != 3:
        res = f"ERROR: times_ms should have 3 entries (one per size), got {len(r['times_ms'])}."
    elif not all(t > 0 for t in r['times_ms']):
        res = "ERROR: times_ms values should be positive."
    else:
        exp = r['estimated_exponent']
        res = f"SUCCESS: measure_complexity works. np.sum exponent≈{exp:.2f} (expect ≈1.0)."
res
`,
              hint: 'Time each size with a loop using time.perf_counter. ratios = [times[i]/times[i-1] for i in range(1,len)]. estimated_exponent = np.polyfit(np.log10(sizes), np.log10(times), 1)[0] — the slope of the log-log line.',
            },

            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Optimise a matrix distance computation',
              difficulty: 'medium',
              prompt: 'Given two sets of points A (m×2) and B (n×2), compute the full m×n matrix D where D[i,j] is the Euclidean distance from A[i] to B[j]. Write three versions: (1) `dist_loop(A, B)` — pure Python loops, (2) `dist_vectorized(A, B)` — using broadcasting (no loops), (3) verify they match and measure the speedup. Then find the closest point in B for each point in A using `np.argmin` on D.',
              code: `import time, numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def dist_loop(A, B):
    """O(m·n) with Python loops."""
    m, n = len(A), len(B)
    D = np.empty((m, n))
    for i in range(m):
        for j in range(n):
            dx = A[i,0] - B[j,0]
            dy = A[i,1] - B[j,1]
            D[i,j] = (dx*dx + dy*dy)**0.5
    return D

def dist_vectorized(A, B):
    """O(m·n) with broadcasting — no loops."""
    pass

rng = np.random.default_rng(2)
A = rng.random((50,  2))
B = rng.random((200, 2))

D_loop = dist_loop(A, B)
D_vec  = dist_vectorized(A, B)

if D_vec is not None:
    print(f"Results match: {np.allclose(D_loop, D_vec, atol=1e-10)}")
    print(f"Shape: {D_vec.shape}  (50 query points × 200 target points)")

def bench(fn, reps=5):
    best = float('inf')
    for _ in range(reps):
        t0 = time.perf_counter(); fn(); best = min(best, time.perf_counter()-t0)
    return best*1000

t_loop = bench(lambda: dist_loop(A, B))
t_vec  = bench(lambda: dist_vectorized(A, B))
print(f"\\nLoop:         {t_loop:.2f} ms")
print(f"Vectorized:   {t_vec:.3f} ms")
print(f"Speedup:      {t_loop/t_vec:.0f}×" if t_vec > 0 else "Speedup: (vectorized too fast to measure)")

# Nearest neighbour: for each point in A, find closest in B
if D_vec is not None:
    nearest_idx = np.argmin(D_vec, axis=1)   # shape (50,) — index into B
    nearest_dist = D_vec[np.arange(len(A)), nearest_idx]
    print(f"\\nNearest neighbour distances (first 5): {nearest_dist[:5].round(4)}")
    print(f"Mean nearest-neighbour distance: {nearest_dist.mean():.4f}")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'dist_vectorized' not in dir():
    res = "ERROR: dist_vectorized not defined."
else:
    A = np.array([[0.,0.],[1.,0.],[0.,1.]])
    B = np.array([[1.,1.],[2.,0.]])
    D = dist_vectorized(A, B)
    if D is None:
        res = "ERROR: returned None — fill in the function."
    elif D.shape != (3,2):
        res = f"ERROR: shape should be (3,2), got {D.shape}."
    elif not np.isclose(D[0,0], 2**0.5, atol=1e-8):
        res = f"ERROR: D[0,0] should be sqrt(2)≈{2**0.5:.4f}, got {D[0,0]:.4f}."
    elif not np.isclose(D[1,0], 1.0, atol=1e-8):
        res = f"ERROR: D[1,0] should be 1.0, got {D[1,0]:.4f}."
    else:
        res = f"SUCCESS: dist_vectorized correct — shape {D.shape}, D[0,0]={D[0,0]:.4f}."
res
`,
              hint: 'diff = A[:, np.newaxis, :] - B[np.newaxis, :, :]  gives shape (m, n, 2). Then np.sqrt((diff**2).sum(axis=2)) gives (m, n) distances.',
            },

            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Optimise a dynamic programming recurrence',
              difficulty: 'hard',
              prompt: 'The longest common subsequence (LCS) of two sequences is a classic O(m·n) dynamic programming problem. Write `lcs_length(s, t)` using a numpy 2D DP table (no Python lists for the table — use `np.zeros`). The recurrence is: dp[i,j] = dp[i-1,j-1]+1 if s[i-1]==t[j-1] else max(dp[i-1,j], dp[i,j-1]). Then benchmark it on random DNA sequences of lengths 500 and 1000, and verify the result matches a reference implementation.',
              code: `import numpy as np
import time

def lcs_length_ref(s, t):
    """Reference implementation using Python lists."""
    m, n = len(s), len(t)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s[i-1] == t[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

def lcs_length(s, t):
    """
    LCS using numpy 2D DP table.
    dp = np.zeros((m+1, n+1), dtype=int)
    Fill row by row using numpy operations where possible.
    """
    pass

# Test correctness
s1, t1 = "ABCBDAB", "BDCABA"
ref = lcs_length_ref(s1, t1)
fast = lcs_length(s1, t1)
print(f"LCS of '{s1}' and '{t1}':")
print(f"  Reference: {ref}  (correct answer: 4)")
print(f"  Your impl: {fast}")
print(f"  Match: {ref == fast}")
print()

# Benchmark on random DNA
rng = np.random.default_rng(0)
bases = ['A', 'T', 'C', 'G']
def rand_dna(n): return ''.join(rng.choice(bases) for _ in range(n))

for n in [200, 500]:
    s = rand_dna(n); t = rand_dna(n)
    t0 = time.perf_counter(); ref_r = lcs_length_ref(s, t); t_ref = (time.perf_counter()-t0)*1000
    t0 = time.perf_counter(); my_r  = lcs_length(s, t);     t_my  = (time.perf_counter()-t0)*1000
    print(f"n={n}: ref={ref_r}, yours={my_r}, match={ref_r==my_r}, ref={t_ref:.1f}ms, yours={t_my:.1f}ms")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'lcs_length' not in dir():
    res = "ERROR: lcs_length not defined."
else:
    tests = [("ABCBDAB","BDCABA",4), ("AGGTAB","GXTXAYB",4), ("","ABC",0), ("A","A",1)]
    for s, t, expected in tests:
        got = lcs_length(s, t)
        if got is None:
            res = "ERROR: returned None — fill in the function."
            break
        if got != expected:
            res = f"ERROR: lcs('{s}','{t}') should be {expected}, got {got}."
            break
    else:
        res = f"SUCCESS: all LCS tests pass — including empty string and single char cases."
res
`,
              hint: 'dp = np.zeros((m+1, n+1), dtype=int). Loop i from 1 to m, j from 1 to n. Use int(s[i-1]==t[j-1]) to get 0 or 1 without branching. dp[i,j] = dp[i-1,j-1]+match if match else max(dp[i-1,j], dp[i,j-1]). You can vectorize the inner j loop using np.where on a row comparison.',
            },

          ], // end initialCells
        }, // end props
      }, // end visualization
    ], // end visualizations
  }, // end intuition
}
