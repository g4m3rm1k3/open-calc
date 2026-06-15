// Chapter 1.6 — Sequences & Series
//
// PHASE 1 — MATHEMATICAL FOUNDATIONS (COMPUTATIONAL FIRST)
//
// TEACHES:
//   Math:    Sequence notation, arithmetic & geometric sequences,
//            sigma notation, partial sums, infinite series,
//            convergence & divergence, special sequences (Fibonacci,
//            harmonic, π approximations, e from a series)
//
//   Python:  List comprehensions, generator expressions, enumerate(),
//            yield-based generators, itertools.islice, while-convergence
//            loops, functools.reduce, memoization with a dict cache
//
//   Library: fig.scatter() with per-point labels, fig.bars() for
//            partial sums, visualising convergence with fig.hline(),
//            combining scatter + plot to show a limit being approached

export default {
  id: 'py-1-6-sequences-series',
  slug: 'sequences-and-series',
  chapter: 1.6,
  order: 5,
  title: 'Sequences & Series',
  subtitle: 'Ordered lists of numbers, their sums, and what happens as you take infinitely many terms',
  tags: [
    'sequence', 'series', 'arithmetic', 'geometric', 'sigma', 'convergence',
    'divergence', 'Fibonacci', 'harmonic', 'infinite series', 'partial sum', 'opencalc',
  ],

  hook: {
    question: 'If you add 1 + 1/2 + 1/4 + 1/8 + … forever, do you get infinity — or something finite?',
    realWorldContext:
      'Sequences and series underpin almost every numerical algorithm. ' +
      'A mortgage is a geometric series — your monthly payments are terms in a sequence ' +
      'whose sum equals the loan principal plus interest. ' +
      'The Taylor series for eˣ, sin(x), and cos(x) are infinite series that your CPU ' +
      'evaluates to compute math.exp() and math.sin(). ' +
      'JPEG compression uses Fourier series. ' +
      'Neural network training is a sequence of gradient-descent steps. ' +
      'This lesson teaches you to construct, sum, and reason about sequences in Python — ' +
      'building the foundation for limits and calculus.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **sequence** is an ordered list of numbers: a₁, a₂, a₃, … ' +
      'Each number is a **term**, identified by its index n. ' +
      'A **series** is the sum of a sequence: S = a₁ + a₂ + a₃ + … ' +
      'The key question for any infinite series is whether the sum approaches a finite limit ' +
      '(converges) or grows without bound (diverges).',
      'The two simplest families — **arithmetic** (add a constant each step) and ' +
      '**geometric** (multiply by a constant each step) — both have exact closed-form ' +
      'formulas for their partial sums. These formulas appear in finance, physics, and ' +
      'algorithm analysis.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Arithmetic vs Geometric',
        body: '\\text{Arithmetic: } a_n = a_1 + (n-1)d \\quad \\text{Geometric: } a_n = a_1 \\cdot r^{n-1}',
      },
      {
        type: 'insight',
        title: 'Convergence rule for geometric series',
        body: 'The infinite geometric series a + ar + ar² + … converges if and only if |r| < 1. The sum is a / (1 − r). If |r| ≥ 1 the series diverges.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Sequences & Series',
        mathBridge: 'aₙ — the nth term. Sₙ = Σaₖ — the nth partial sum. lim Sₙ = S — the infinite series sum (if it converges).',
        caption: 'Each cell builds one piece of the sequences mental model. The final cells show real loan amortisation and a race between π approximations.',
        props: {
          initialCells: [

            // ── WHAT IS A SEQUENCE ─────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'What is a sequence — notation and general term',
              prose: [
                'A **sequence** is a function from the positive integers to the reals: it assigns a number aₙ to every index n = 1, 2, 3, … The **general term** (or **nth term formula**) lets you compute any term directly without listing all the previous ones. Given a general term, a sequence is completely determined.',
                '## Three ways to define a sequence in Python',
                '- **Explicit formula:** `a = lambda n: ...` — compute any term directly from n\n- **List comprehension:** `[f(n) for n in range(1, N+1)]` — generate N terms at once\n- **Generator function:** `yield`-based — produces terms one at a time, never stores the whole list (memory-efficient for large N)',
                '## Python indexing note',
                'Mathematics counts from n = 1; Python lists start at index 0. The convention `a[n-1]` bridges the two: `a[0]` holds a₁, `a[1]` holds a₂, etc. Keep this mapping explicit in your code.',
              ],
              code: `# Three equivalent ways to define the sequence aₙ = n²

# 1. Lambda — any term on demand
a = lambda n: n**2
print("a(1) =", a(1), "  a(5) =", a(5), "  a(100) =", a(100))

# 2. List comprehension — first N terms as a list
N = 10
terms = [n**2 for n in range(1, N + 1)]
print("First 10 terms:", terms)

# 3. Generator — memory-efficient, one term at a time
def squares():
    n = 1
    while True:
        yield n**2
        n += 1

gen = squares()
first_5 = [next(gen) for _ in range(5)]
print("Generator (first 5):", first_5)

# Useful sequences
print("\\nSome named sequences:")
print("1/n         :", [round(1/n, 4) for n in range(1, 8)])
print("(-1)^n / n  :", [round((-1)**n / n, 4) for n in range(1, 8)])
print("2^n         :", [2**n for n in range(1, 9)])
print("n!          :", [__import__('math').factorial(n) for n in range(1, 9)])`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── ARITHMETIC SEQUENCES ──────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Arithmetic sequences — constant difference',
              prose: [
                'An **arithmetic sequence** adds the same constant **d** (the common difference) at every step: a₁, a₁+d, a₁+2d, … The general term is **aₙ = a₁ + (n−1)·d**. The graph of an arithmetic sequence is a discrete straight line — each term falls on y = a₁ + (n−1)d, which has slope d.',
                '## Key formulas',
                '- **nth term:** aₙ = a₁ + (n−1)·d\n- **Common difference from two terms:** d = (aₙ − aₖ) / (n − k)\n- **Number of terms between a and b:** n = (b − a)/d + 1\n- **Sum of first n terms (arithmetic series):** Sₙ = n/2 · (a₁ + aₙ) = n/2 · (2a₁ + (n−1)d)',
                '## Python',
                '`range(start, stop, step)` is Python\'s built-in arithmetic sequence — it generates `start, start+step, start+2*step, …` The step is the common difference d. For non-integer d, use a list comprehension: `[a1 + i*d for i in range(n)]`.',
              ],
              code: `def arithmetic(a1, d, n):
    """Return the first n terms of an arithmetic sequence starting at a1 with difference d."""
    return [a1 + i * d for i in range(n)]

def arith_term(a1, d, n):
    """Return the nth term (1-indexed)."""
    return a1 + (n - 1) * d

def arith_sum(a1, d, n):
    """Sum of first n terms: n/2 * (2*a1 + (n-1)*d)."""
    return n / 2 * (2 * a1 + (n - 1) * d)

# Examples
seq1 = arithmetic(a1=3, d=4, n=8)
print("3, 7, 11, 15, … (d=4):", seq1)
print(f"  10th term: {arith_term(3, 4, 10)}")
print(f"  Sum of 10 terms: {arith_sum(3, 4, 10)}")

seq2 = arithmetic(a1=100, d=-7, n=8)
print("\\n100, 93, 86, … (d=-7):", seq2)

# Identifying arithmetic sequences
mystery = [5, 8, 11, 14, 17, 20]
diffs = [mystery[i] - mystery[i-1] for i in range(1, len(mystery))]
print(f"\\nMystery diffs: {diffs}")
print(f"Is arithmetic: {len(set(diffs)) == 1}  (d = {diffs[0]})")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── GEOMETRIC SEQUENCES ───────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Geometric sequences — constant ratio',
              prose: [
                'A **geometric sequence** multiplies by the same constant **r** (the common ratio) at every step: a₁, a₁r, a₁r², … The general term is **aₙ = a₁ · r^(n−1)**. The graph on a linear scale looks exponential; on a log scale it looks linear — because log(aₙ) = log(a₁) + (n−1)·log(r) is arithmetic.',
                '## Key formulas',
                '- **nth term:** aₙ = a₁ · r^(n−1)\n- **Common ratio from two terms:** r = (aₙ / aₖ)^(1/(n−k))\n- **Sum of first n terms:** Sₙ = a₁ · (1 − rⁿ) / (1 − r)  (r ≠ 1)\n- **Infinite sum:** S∞ = a₁ / (1 − r)  if |r| < 1',
                '## Python',
                'The ratio test for geometric sequences: compute `[seq[i]/seq[i-1] for i in range(1, n)]` and check if all values are equal (using `math.isclose`). This is the numerical analogue of dividing consecutive terms in the formula.',
              ],
              code: `import math

def geometric(a1, r, n):
    """Return the first n terms of a geometric sequence."""
    return [a1 * r**(i) for i in range(n)]

def geo_term(a1, r, n):
    """Return the nth term (1-indexed)."""
    return a1 * r**(n - 1)

def geo_sum(a1, r, n):
    """Sum of first n terms."""
    if math.isclose(r, 1.0):
        return a1 * n
    return a1 * (1 - r**n) / (1 - r)

def geo_infinite_sum(a1, r):
    """Infinite sum — only valid when |r| < 1."""
    if abs(r) >= 1:
        return float('inf')
    return a1 / (1 - r)

# Example: 2, 6, 18, 54, … (r=3, growth)
seq_grow = geometric(a1=2, r=3, n=7)
print("2, 6, 18, 54, … (r=3):", seq_grow)
print(f"  7th term:        {geo_term(2, 3, 7)}")
print(f"  Sum of 7 terms:  {geo_sum(2, 3, 7):.0f}")

# Example: 64, 32, 16, 8, … (r=0.5, decay)
seq_decay = geometric(a1=64, r=0.5, n=8)
print("\\n64, 32, 16, 8, … (r=0.5):", seq_decay)
print(f"  Sum of 8 terms:   {geo_sum(64, 0.5, 8):.4f}")
print(f"  Infinite sum:     {geo_infinite_sum(64, 0.5):.4f}  (should be 128)")

# Ratio test
mystery = [5, 15, 45, 135, 405]
ratios = [mystery[i]/mystery[i-1] for i in range(1, len(mystery))]
print(f"\\nMystery ratios: {ratios}")
print(f"Is geometric: {all(math.isclose(r, ratios[0]) for r in ratios)}  (r = {ratios[0]})")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── VISUALISING SEQUENCES ─────────────────────────────────────────
            {
              id: 'oc-scatter-labels',
              cellTitle: 'opencalc: fig.scatter() with per-point labels',
              prose: [
                'You have used `fig.scatter(xs, ys)` for unlabelled data clouds. For sequences — where every point has a meaningful index — the optional `labels` parameter annotates each dot individually. Pass a list of strings the same length as `xs` and `ys`.',
                '## fig.scatter() — full parameter list',
                '- `xs` — list of x coordinates\n- `ys` — list of y coordinates\n- `color` — dot colour (constant or string)\n- `radius` — dot size in pixels (default 5)\n- `labels` — list of strings, one per point; shown in the legend/tooltip',
                '## When to label individual points',
                'Use per-point labels when: the index has a meaningful name (n=1, n=5, n=10), there are outliers to call out, or you want to annotate specific convergence milestones. For large datasets (n > 20), leave labels off to avoid clutter.',
              ],
              code: `from opencalc import Figure, BLUE, AMBER, RED

# Scatter with per-point labels — useful for sequences
ns  = list(range(1, 9))
a_n = [2 * n + 1 for n in ns]    # aₙ = 2n + 1

fig = Figure(xmin=0, xmax=9, ymin=0, ymax=20,
             title="Arithmetic sequence aₙ = 2n + 1 — labelled points")
fig.grid().axes()

# Per-point labels: one string per (x, y) pair
point_labels = [f"a{n}={v}" for n, v in zip(ns, a_n)]
fig.scatter(ns, a_n, color=BLUE, radius=8, labels=point_labels)

# Also draw the underlying linear function for comparison
fig.plot(lambda x: 2*x + 1, color=AMBER, width=1.5,
         label='continuous 2x+1 — shows the discrete line')

fig.show()

# Key rule: labels list must be the same length as xs and ys
print(f"len(ns)={len(ns)}, len(a_n)={len(a_n)}, len(labels)={len(point_labels)}")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 4,
              cellTitle: 'Visualizing sequences — scatter and the underlying pattern',
              prose: [
                'Sequences are **discrete** — defined only at integer indices. The right visualisation is a scatter plot, not a continuous curve. But plotting the continuous formula alongside the dots reveals what kind of function the sequence samples: a straight line for arithmetic, an exponential curve for geometric, and more exotic shapes for others.',
                '## What to look for in a sequence scatter plot',
                '- **Evenly spaced dots in a straight line** → arithmetic\n- **Dots following an exponential curve** → geometric\n- **Dots approaching a horizontal line** → sequence converges\n- **Dots growing without bound** → sequence diverges\n- **Dots oscillating** → alternating signs (e.g. (−1)ⁿ terms)',
                '**Library:** Plotting both `fig.scatter(ns, terms)` for the sequence and `fig.plot(fn, ...)` for the continuous formula overlaid makes the sampling relationship visible. Adding `fig.hline(limit)` marks the limit the sequence is converging toward.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, GRAY, PURPLE

ns = list(range(1, 16))

fig = Figure(xmin=0, xmax=16, ymin=-1.5, ymax=5,
             title="Four sequence types — scatter vs continuous")
fig.grid().axes()

# Arithmetic: aₙ = 0.3n + 0.5
a_arith = [0.3*n + 0.5 for n in ns]
fig.scatter(ns, a_arith, color=BLUE, radius=5)
fig.plot(lambda x: 0.3*x + 0.5, color=BLUE, width=1,
         label='arithmetic 0.3n+0.5')

# Geometric (decaying): aₙ = 4 · 0.7^(n-1)
a_geo = [4 * 0.7**(n-1) for n in ns]
fig.scatter(ns, a_geo, color=RED, radius=5)
fig.plot(lambda x: 4 * 0.7**(x-1), color=RED, width=1,
         label='geometric 4·(0.7)ⁿ⁻¹')

# Alternating convergent: aₙ = (-1)^n / n
a_alt = [(-1)**n / n for n in ns]
fig.scatter(ns, a_alt, color=GREEN, radius=5)
fig.hline(0, color='gray')

# Convergent to e-like limit: aₙ = (1 + 1/n)^n
a_e = [(1 + 1/n)**n for n in ns]
fig.scatter(ns, a_e, color=AMBER, radius=5)
fig.plot(lambda x: (1 + 1/x)**x, color=AMBER, width=1,
         label='(1+1/n)ⁿ → e')
fig.hline(math.e, color=GRAY)
fig.text([10, math.e + 0.1], f"e ≈ {math.e:.4f}", color='gray', size=11)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── SIGMA NOTATION AND PARTIAL SUMS ──────────────────────────────
            {
              id: 5,
              cellTitle: 'Sigma notation and partial sums',
              prose: [
                '**Sigma notation** Σ is mathematical shorthand for a sum. Σ_{n=1}^{N} aₙ means "add up aₙ for every integer n from 1 to N." The **nth partial sum** Sₙ = a₁ + a₂ + … + aₙ is itself a sequence — as n grows, Sₙ either approaches a finite limit (convergence) or grows without bound (divergence).',
                '## Python equivalents',
                '- **`sum([aₙ for n in range(1, N+1)])`** — compute Sₙ directly\n- **`sum(a(n) for n in range(1, N+1))`** — generator version, no list created\n- **`itertools.accumulate(terms)`** — produces every partial sum S₁, S₂, …, Sₙ at once; ideal for plotting how the sum evolves\n- **`functools.reduce(op, terms)`** — generalised reduction (not just addition)',
                '## Reading sigma notation',
                'Σ_{n=1}^{10} n² reads as: "n² evaluated for n = 1, 2, …, 10, then summed." In Python: `sum(n**2 for n in range(1, 11))`.',
              ],
              code: `import itertools, functools

# Sigma notation → Python sum()
# Σ_{n=1}^{10} n
print("Σ n  (n=1..10):", sum(n for n in range(1, 11)))          # 55

# Σ_{n=1}^{10} n²
print("Σ n² (n=1..10):", sum(n**2 for n in range(1, 11)))       # 385

# Closed form: Σ n = n(n+1)/2
n = 10
print(f"Closed form n(n+1)/2 = {n*(n+1)//2}")    # should be 55

# Closed form: Σ n² = n(n+1)(2n+1)/6
print(f"Closed form n(n+1)(2n+1)/6 = {n*(n+1)*(2*n+1)//6}")  # should be 385

# Partial sums as a sequence — using itertools.accumulate
terms = [n**2 for n in range(1, 11)]
partial_sums = list(itertools.accumulate(terms))
print("\\nPartial sums of n²:", partial_sums)
# [1, 5, 14, 30, 55, 91, 140, 204, 285, 385]

# functools.reduce for the same result
total = functools.reduce(lambda acc, x: acc + x, terms, 0)
print("Total via reduce:", total)

# How many terms until Σ (1/n²) exceeds 1.5?
running = 0.0
n = 1
while running < 1.5:
    running += 1 / n**2
    n += 1
print(f"\\nΣ(1/n²) exceeds 1.5 after {n-1} terms (sum ≈ {running:.6f})")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 6,
              cellTitle: 'Visualizing partial sums — watching a series grow',
              prose: [
                'Plotting partial sums Sₙ against n turns the question "does this series converge?" into a visual one: does the curve flatten toward a horizontal limit, or does it grow without bound? The horizontal line `fig.hline(limit)` marks the theoretical infinite sum — seeing the curve approach it makes convergence tangible.',
                '**Python pattern:** `itertools.accumulate(terms)` generates partial sums lazily — each call to `next()` adds the next term to the running total without storing intermediate lists. Converting to a list with `list(itertools.accumulate(...))` gives you all partial sums at once for plotting.',
              ],
              code: `import math, itertools
from opencalc import Figure, BLUE, RED, GREEN, AMBER, GRAY

ns = list(range(1, 31))

fig = Figure(xmin=0, xmax=32, ymin=-0.5, ymax=3.5,
             title="Partial sums Sₙ — convergent vs divergent")
fig.grid().axes()

# 1. Geometric series: Σ (1/2)^n → converges to 1
terms_geo = [(0.5)**n for n in ns]
partial_geo = list(itertools.accumulate(terms_geo))
fig.scatter(ns, partial_geo, color=BLUE, radius=4)
fig.plot(lambda x: 1 - 0.5**x, xmin=1, xmax=31,
         color=BLUE, width=1.5, label='Σ(½)ⁿ → 1')
fig.hline(1.0, color=BLUE)
fig.text([22, 1.06], "limit = 1", color='blue', size=11)

# 2. Alternating series: Σ (-1)^(n+1)/n = ln(2) ≈ 0.693
terms_alt = [(-1)**(n+1) / n for n in ns]
partial_alt = list(itertools.accumulate(terms_alt))
fig.scatter(ns, partial_alt, color=RED, radius=4)
fig.hline(math.log(2), color=RED)
fig.text([22, math.log(2) + 0.07], f"ln(2)≈{math.log(2):.3f}", color='red', size=11)

# 3. Harmonic series: Σ 1/n — diverges slowly
terms_harm = [1/n for n in ns]
partial_harm = list(itertools.accumulate(terms_harm))
fig.scatter(ns, partial_harm, color=AMBER, radius=4)
fig.plot(lambda x: math.log(x) + 0.5772,  # ln(n) + Euler-Mascheroni
         color=AMBER, width=1.5, label='Σ(1/n) — diverges like ln(n)')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CONVERGENCE ───────────────────────────────────────────────────
            {
              id: 7,
              cellTitle: 'Infinite series — convergence and divergence',
              prose: [
                'An **infinite series** Σaₙ **converges** if the sequence of partial sums Sₙ approaches a finite limit L as n → ∞. It **diverges** if Sₙ → ±∞ or oscillates without settling. Convergence is not about individual terms being small — it is about the *accumulation*.',
                '## Key convergence tests',
                '- **Geometric series:** |r| < 1 → converges to a₁/(1−r). This is the only test that gives an exact sum.\n- **Divergence test (necessary condition):** if aₙ → 0 is false, the series diverges. But aₙ → 0 does NOT guarantee convergence (harmonic series)\n- **Comparison:** if 0 ≤ aₙ ≤ bₙ and Σbₙ converges, so does Σaₙ\n- **Ratio test:** if lim|a_{n+1}/aₙ| < 1 → converges; > 1 → diverges',
                '## The harmonic series — the classic trap',
                'Σ 1/n diverges even though 1/n → 0. The partial sums grow like ln(n) — infinitely slowly, but without bound. This is the most important counterexample in series theory: a decreasing-to-zero sequence whose series still diverges.',
              ],
              code: `import math, itertools

def partial_sum(term_fn, n):
    """Sum of first n terms of the series defined by term_fn(k)."""
    return sum(term_fn(k) for k in range(1, n + 1))

def appears_to_converge(term_fn, max_n=10000, tol=1e-6):
    """
    Numerically test convergence: compute partial sums up to max_n.
    If the last 100 terms add less than tol total, call it convergent.
    """
    total = 0.0
    for k in range(1, max_n + 1):
        total += term_fn(k)
        if k == max_n - 100:
            total_at_start = total
    tail_contribution = total - total_at_start
    return abs(tail_contribution) < tol, total

# Test several series
series = {
    'Σ (1/2)^n':    lambda k: (0.5)**k,           # converges to 1
    'Σ 1/n²':       lambda k: 1 / k**2,            # converges to π²/6
    'Σ 1/n':        lambda k: 1 / k,               # diverges (harmonic)
    'Σ 1/n^0.5':    lambda k: 1 / k**0.5,          # diverges (p-series, p≤1)
    'Σ (-1)^n/n':   lambda k: (-1)**k / k,         # converges (alternating)
    'Σ n/(n+1)':    lambda k: k / (k + 1),         # diverges (terms → 1, not 0)
}

print(f"{'Series':20s}  {'Converges?':12s}  {'Partial sum at N=10000':>22s}")
print("-" * 60)
for name, fn in series.items():
    conv, total = appears_to_converge(fn)
    print(f"{name:20s}  {str(conv):12s}  {total:>22.6f}")

print(f"\\nNote: π²/6 = {math.pi**2 / 6:.6f}  (expected sum of Σ 1/n²)")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── SPECIAL SEQUENCES ─────────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Fibonacci — recursive sequences and memoization',
              prose: [
                'The **Fibonacci sequence** F₁=1, F₂=1, Fₙ = Fₙ₋₁ + Fₙ₋₂ is defined **recursively** — each term depends on the previous two. Recursive sequences are mathematically elegant but computationally expensive when implemented naively: computing F₄₀ with a plain recursive function makes ~300 million calls. **Memoization** — caching already-computed values — eliminates redundant work and brings the complexity from O(2ⁿ) to O(n).',
                '## Python strategies for recursive sequences',
                '- **Naive recursion:** clean code, exponential time — only for small n\n- **Memoized recursion:** `cache = {}` dict stores computed values; O(n) time and space\n- **`functools.lru_cache`:** decorator-based automatic memoization — the idiomatic Python way\n- **Iterative:** loop with two variables; O(n) time, O(1) space — fastest in practice',
                '## The golden ratio',
                'The ratio Fₙ₊₁/Fₙ converges to φ = (1+√5)/2 ≈ 1.61803 as n → ∞. This is because the Fibonacci sequence is the only sequence (up to scaling) satisfying its recurrence that grows at a constant ratio — and that ratio must satisfy φ² = φ + 1.',
              ],
              code: `import math, functools
from opencalc import Figure, BLUE, AMBER, RED, GRAY

# Naive recursive — exponential time, only works for small n
def fib_naive(n):
    if n <= 2: return 1
    return fib_naive(n - 1) + fib_naive(n - 2)

# Memoized with a dict — O(n) time
def fib_memo(n, cache={1: 1, 2: 1}):
    if n not in cache:
        cache[n] = fib_memo(n - 1) + fib_memo(n - 2)
    return cache[n]

# Decorator-based — cleanest idiom
@functools.lru_cache(maxsize=None)
def fib(n):
    if n <= 2: return 1
    return fib(n - 1) + fib(n - 2)

# Iterative — O(1) space, fastest
def fib_iter(n):
    a, b = 1, 1
    for _ in range(n - 2):
        a, b = b, a + b
    return b if n > 1 else 1

# First 15 terms
terms = [fib(n) for n in range(1, 16)]
print("Fibonacci:", terms)

# Ratio convergence to golden ratio φ
phi = (1 + math.sqrt(5)) / 2
print(f"\nGolden ratio φ = {phi:.8f}")
print(f"{'n':>4}  {'F(n)':>10}  {'F(n+1)/F(n)':>14}  {'error':>12}")
for n in [2, 5, 10, 15, 20, 30]:
    ratio = fib(n + 1) / fib(n)
    print(f"{n:>4}  {fib(n):>10}  {ratio:>14.8f}  {abs(ratio - phi):>12.2e}")

# Visualize
ns = list(range(1, 16))
fig = Figure(xmin=0, xmax=16, ymin=0, ymax=650,
             title="Fibonacci sequence (1-15) and ratio convergence to φ")
fig.grid().axes()
fig.scatter(ns, terms, color=BLUE, radius=7,
            labels=[f"F{n}={v}" for n, v in zip(ns, terms)])
fig.plot(lambda x: phi**x / math.sqrt(5),
         color=AMBER, width=1.5, label="φⁿ/√5 — Binet's formula")
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 9,
              cellTitle: 'The number e as an infinite series',
              prose: [
                'One of the most beautiful results in mathematics: **e = Σ_{n=0}^∞ 1/n! = 1 + 1 + 1/2 + 1/6 + 1/24 + …** This series converges extremely fast — the denominator n! grows faster than any exponential, so the terms shrink to zero rapidly. You only need about 20 terms to compute e to 15 decimal places.',
                '## Why series representations matter',
                '- **Computation:** your CPU computes math.exp(x) using the series eˣ = Σ xⁿ/n!\n- **Taylor series:** every smooth function has a series expansion around any point\n- **Convergence speed** is the practical engineering concern — how many terms until the error is below machine epsilon?\n- **Building intuition:** seeing e emerge term-by-term from simple fractions makes it feel less mysterious',
                '**Python:** `math.factorial(n)` computes n! exactly (arbitrary precision int). The loop below builds partial sums and tracks the error against `math.e`.',
              ],
              code: `import math
from opencalc import Figure, BLUE, AMBER, RED, GRAY

# e = Σ 1/n!  (n from 0 to ∞)
print("Building e term by term:")
print(f"{'n':>3}  {'1/n!':>18}  {'Σ so far':>18}  {'error vs math.e':>18}")
print("-" * 65)

total = 0.0
for n in range(15):
    term = 1 / math.factorial(n)
    total += term
    error = abs(total - math.e)
    print(f"{n:>3}  {term:>18.15f}  {total:>18.15f}  {error:>18.2e}")

# How many terms for machine precision?
total, n = 0.0, 0
while not math.isclose(total, math.e, rel_tol=1e-15):
    total += 1 / math.factorial(n)
    n += 1
print(f"\nMachine precision reached after {n} terms!")
print(f"Series value: {total:.15f}")
print(f"math.e:       {math.e:.15f}")

# Visualize convergence
ns = list(range(0, 14))
partial_sums = []
running = 0.0
for k in ns:
    running += 1 / math.factorial(k)
    partial_sums.append(running)

fig = Figure(xmin=-0.5, xmax=13.5, ymin=1.0, ymax=3.2,
             title="Partial sums of Σ 1/n! converging to e")
fig.grid().axes()
fig.scatter(ns, partial_sums, color=BLUE, radius=7)
fig.hline(math.e, color=AMBER)
fig.text([7, math.e + 0.05], f"e = {math.e:.5f}", color='amber', size=11, bold=True)
fig.plot(lambda x: math.e - math.e/(math.factorial(int(x)+1) + 1) if x > 0 else 1,
         color='gray', width=1)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── APPLICATIONS ──────────────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'π from infinite series — convergence race',
              prose: [
                'Several infinite series converge to π. They differ dramatically in speed — Leibniz\'s alternating series is famously slow (needs billions of terms for 10 decimal places); Nilakantha\'s series is much faster; the Chudnovsky algorithm (used by computers) adds 14 digits per term.',
                '## Three π series',
                '- **Leibniz:** π/4 = 1 − 1/3 + 1/5 − 1/7 + … → multiply by 4 — converges as 1/n\n- **Nilakantha:** π = 3 + 4/(2·3·4) − 4/(4·5·6) + 4/(6·7·8) − … — converges as 1/n³\n- **Basel problem approach:** π² = 6·Σ(1/n²) — converges as 1/n²',
                '**Python pattern:** Each approximation is a running total updated in a loop. Tracking the error `abs(approx - math.pi)` at each step and plotting it shows the convergence rate visually — a steeper drop means faster convergence.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER

def leibniz_pi(n_terms):
    """π/4 = 1 - 1/3 + 1/5 - 1/7 + ...  (Leibniz formula)"""
    return 4 * sum((-1)**k / (2*k + 1) for k in range(n_terms))

def nilakantha_pi(n_terms):
    """π = 3 + 4/(2·3·4) - 4/(4·5·6) + ...  (Nilakantha)"""
    result = 3.0
    sign = 1
    for k in range(1, n_terms + 1):
        result += sign * 4 / ((2*k) * (2*k + 1) * (2*k + 2))
        sign *= -1
    return result

def basel_pi(n_terms):
    """π² = 6·Σ(1/k²)  (Basel problem)"""
    return math.sqrt(6 * sum(1/k**2 for k in range(1, n_terms + 1)))

# Compare at various term counts
print(f"{'n':>6}  {'Leibniz':>12}  {'Nilakantha':>12}  {'Basel':>12}  (π={math.pi:.8f})")
print("-" * 58)
for n in [10, 50, 100, 500, 1000]:
    l = leibniz_pi(n)
    ni = nilakantha_pi(n)
    b = basel_pi(n)
    print(f"{n:>6}  {l:>12.8f}  {ni:>12.8f}  {b:>12.8f}")

# Visualize error vs number of terms
ns = [1, 2, 5, 10, 20, 50, 100, 200, 500]
fig = Figure(xmin=0, xmax=510, ymin=0, ymax=0.5,
             title="π approximation error vs number of terms")
fig.grid().axes()
fig.scatter(ns, [abs(leibniz_pi(n) - math.pi) for n in ns],
            color=BLUE, radius=6)
fig.scatter(ns, [abs(nilakantha_pi(n) - math.pi) for n in ns],
            color=RED, radius=6)
fig.scatter(ns, [abs(basel_pi(n) - math.pi) for n in ns],
            color=GREEN, radius=6)
fig.text([350, 0.42], "Blue=Leibniz", color='blue', size=11)
fig.text([350, 0.36], "Red=Nilakantha (faster)", color='red', size=11)
fig.text([350, 0.30], "Green=Basel", color='green', size=11)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── REAL-WORLD: LOAN AMORTISATION ─────────────────────────────────
            {
              id: 11,
              cellTitle: 'Loan amortisation — series in the real world',
              prose: [
                'A fixed-rate mortgage is a geometric series in disguise. Each month you pay a fixed amount P; part covers interest on the current balance B, and the rest reduces B. The balance after n payments is a geometric series, and the payment formula comes from requiring that balance → 0 after exactly N payments.',
                '## The payment formula',
                'Monthly payment P = B₀ · r(1+r)ᴺ / ((1+r)ᴺ − 1) where B₀ = loan amount, r = monthly interest rate = annual rate / 12, N = total number of payments.',
                '## Python',
                'The amortisation schedule is computed iteratively: `balance -= (payment - balance * r)` each month. Collecting all balances gives the full repayment schedule — a decaying sequence. The total interest paid is `N * payment - B₀` — often more than the principal for long mortgages.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER, GREEN, GRAY

def monthly_payment(principal, annual_rate, years):
    """
    Fixed monthly payment for a fully-amortising loan.
    Formula: P = B * r(1+r)^N / ((1+r)^N - 1)
    """
    r = annual_rate / 12          # monthly rate
    N = years * 12                # total payments
    if annual_rate == 0:
        return principal / N
    return principal * r * (1 + r)**N / ((1 + r)**N - 1)

def amortise(principal, annual_rate, years):
    """Return (months, balances, interest_paid_so_far) lists."""
    r = annual_rate / 12
    N = years * 12
    P = monthly_payment(principal, annual_rate, years)
    balance = principal
    balances, interest_cumulative = [balance], [0.0]
    total_interest = 0.0

    for month in range(1, N + 1):
        interest_this_month = balance * r
        principal_this_month = P - interest_this_month
        balance -= principal_this_month
        total_interest += interest_this_month
        balances.append(max(balance, 0))
        interest_cumulative.append(total_interest)

    return list(range(N + 1)), balances, interest_cumulative

# A typical mortgage
loan = 300_000
rate = 0.065    # 6.5% annual
term = 25       # years

P = monthly_payment(loan, rate, term)
months, balances, interest_cum = amortise(loan, rate, term)
total_paid = P * term * 12
total_interest = total_paid - loan

print(f"Loan:           \${loan:>12,.0f}")
print(f"Annual rate:    {rate*100:.1f}%")
print(f"Term:           {term} years  ({term*12} payments)")
print(f"Monthly payment: \${P:>11,.2f}")
print(f"Total paid:      \${total_paid:>11,.2f}")
print(f"Total interest:  \${total_interest:>11,.2f}  ({total_interest/loan*100:.0f}% of principal!)")

# Balance at key milestones
for yr in [0, 5, 10, 15, 20, 25]:
    idx = yr * 12
    print(f"  Year {yr:2}: balance = \${balances[idx]:>11,.0f}  "
          f"interest paid so far = \${interest_cum[idx]:>11,.0f}")

# Plot
fig = Figure(xmin=0, xmax=term * 12 + 5, ymin=0, ymax=loan * 1.1,
             title=f"Mortgage amortisation — \${loan:,} at {rate*100:.1f}% over {term}yr")
fig.grid().axes()

# Plot every 3rd month to keep it readable
every3 = list(range(0, len(months), 3))
fig.scatter([months[i] for i in every3],
            [balances[i] for i in every3],
            color=BLUE, radius=3)
fig.scatter([months[i] for i in every3],
            [interest_cum[i] for i in every3],
            color=RED, radius=3)
fig.text([20, loan * 0.85], "Balance remaining", color='blue', size=11)
fig.text([20, loan * 0.75], "Cumulative interest", color='red', size=11)
fig.hline(0, color=GRAY)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGES ────────────────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'fill',
              challengeNumber: 1,
              challengeTitle: 'Classify and compute sequence types',
              difficulty: 'easy',
              prompt: 'Fill in each blank. For arithmetic sequences provide d and the 20th term. For geometric sequences provide r and the 20th term.',
              starterBlock: `# Sequence A: 3, 7, 11, 15, 19, …
d_A   = ___          # common difference
a20_A = ___          # 20th term using formula aₙ = a₁ + (n-1)d

# Sequence B: 5, 15, 45, 135, …
r_B   = ___          # common ratio
a20_B = ___          # 20th term using formula aₙ = a₁ · r^(n-1)

# Sequence C: 100, 95, 90, 85, …
d_C   = ___
a20_C = ___

# Verify
import math
print(f"A: d={d_A}, a20={a20_A}")
print(f"B: r={r_B}, a20={a20_B:.2f}")
print(f"C: d={d_C}, a20={a20_C}")`,
              code: `d_A   = ___
a20_A = ___
r_B   = ___
a20_B = ___
d_C   = ___
a20_C = ___

print(f"A: d={d_A}, a20={a20_A}")
print(f"B: r={r_B}, a20={a20_B}")
print(f"C: d={d_C}, a20={a20_C}")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
errors = []
if d_A != 4:           errors.append(f"d_A should be 4, got {d_A}")
if a20_A != 3+(20-1)*4: errors.append(f"a20_A should be {3+19*4}, got {a20_A}")
if r_B != 3:           errors.append(f"r_B should be 3, got {r_B}")
if not math.isclose(a20_B, 5*3**19, rel_tol=1e-9): errors.append(f"a20_B should be {5*3**19}, got {a20_B}")
if d_C != -5:          errors.append(f"d_C should be -5, got {d_C}")
if a20_C != 100+(20-1)*(-5): errors.append(f"a20_C should be {100+19*(-5)}, got {a20_C}")
if errors:
    res = "ERROR: " + "; ".join(errors[:2])
else:
    res = f"SUCCESS: A(d=4,a20={a20_A}), B(r=3,a20={a20_B:.0f}), C(d=-5,a20={a20_C})."
res
`,
              hint: 'Arithmetic: d = a₂ − a₁. aₙ = a₁ + (n−1)·d. Geometric: r = a₂/a₁. aₙ = a₁ · r^(n−1). For A: d=7−3=4, a20=3+19×4. For B: r=15/5=3, a20=5·3¹⁹. For C: d=95−100=−5, a20=100+19×(−5).',
            },

            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Implement general partial sum with convergence detection',
              difficulty: 'easy',
              prompt: 'Write `series_info(term_fn, max_n=1000, tol=1e-8)` that computes partial sums up to max_n, returns the final sum, and also returns the index n at which the series "effectively converged" — meaning successive partial sums differ by less than `tol`. Test it on three series and plot all three partial sum sequences.',
              code: `import math, itertools
from opencalc import Figure, BLUE, RED, GREEN, AMBER

def series_info(term_fn, max_n=1000, tol=1e-8):
    """
    Compute partial sums of term_fn(n) for n=1..max_n.
    Returns (partial_sums_list, converged_at_n_or_None, final_sum).
    converged_at_n: smallest n where |S_n - S_{n-1}| < tol.
    """
    pass

# Test on three series
s1, conv1, total1 = series_info(lambda k: (0.5)**k)        # Σ (1/2)^k → 1
s2, conv2, total2 = series_info(lambda k: 1/k**2)           # Σ 1/k² → π²/6
s3, conv3, total3 = series_info(lambda k: (-1)**(k+1)/k)   # alternating → ln(2)

print(f"Σ (1/2)^k: total={total1:.6f}, converged at n={conv1}")
print(f"Σ 1/k²:   total={total2:.6f}, expected π²/6={math.pi**2/6:.6f}, converged at n={conv2}")
print(f"Σ (-1)^k/k: total={total3:.6f}, expected ln(2)={math.log(2):.6f}, converged at n={conv3}")

# Plot all three
fig = Figure(xmin=0, xmax=210, ymin=-0.2, ymax=2.2,
             title="Partial sums — three series converging")
fig.grid().axes()
ns = list(range(1, len(s1) + 1))
fig.scatter(ns[::5], s1[::5], color=BLUE,  radius=3)
fig.scatter(ns[::5], s2[::5], color=RED,   radius=3)
fig.scatter(ns[::5], s3[::5], color=GREEN, radius=3)
fig.hline(1.0,                color=BLUE)
fig.hline(math.pi**2/6,       color=RED)
fig.hline(math.log(2),        color=GREEN)
fig.text([160, 1.06],              "→ 1",          color='blue',  size=11)
fig.text([160, math.pi**2/6+0.06], "→ π²/6",       color='red',   size=11)
fig.text([160, math.log(2)+0.06],  "→ ln(2)",      color='green', size=11)
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'series_info' not in dir():
    res = "ERROR: series_info not defined."
else:
    s1, c1, t1 = series_info(lambda k: (0.5)**k)
    s2, c2, t2 = series_info(lambda k: 1/k**2)
    if s1 is None:
        res = "ERROR: returned None — fill in the function."
    elif not math.isclose(t1, 1.0, rel_tol=1e-6):
        res = f"ERROR: Σ(1/2)^k should converge to 1.0, got {t1:.6f}."
    elif not math.isclose(t2, math.pi**2/6, rel_tol=1e-4):
        res = f"ERROR: Σ1/k² should converge to π²/6={math.pi**2/6:.6f}, got {t2:.6f}."
    elif c1 is None or c1 > 60:
        res = f"ERROR: Σ(1/2)^k should converge quickly (within 60 terms), got n={c1}."
    else:
        res = f"SUCCESS: Σ(1/2)^k→{t1:.4f} (n={c1}), Σ1/k²→{t2:.4f} (n={c2})."
res
`,
              hint: 'Loop k from 1 to max_n, keep a running total. After each step check if abs(term_fn(k)) < tol — if so and converged_at is None, record k. Append total to partial_sums each iteration. Return (partial_sums, converged_at, total).',
            },

            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Geometric series — infinite sum and error bound',
              difficulty: 'medium',
              prompt: 'Write `geo_series(a1, r, n_terms)` returning (partial_sum, infinite_sum, error). Then use it to answer: (1) How many terms of the series 1 + 0.9 + 0.81 + … until the partial sum is within 0.001 of the infinite sum? (2) Plot the partial sum converging to the limit, with the limit marked and the first "close enough" point highlighted.',
              code: `import math
from opencalc import Figure, BLUE, AMBER, RED, GRAY

def geo_series(a1, r, n_terms):
    """
    Compute partial sum of a1 + a1*r + a1*r² + … (n_terms terms).
    Returns (partial_sum, infinite_sum, error).
    infinite_sum is None if |r| >= 1 (diverges).
    """
    pass

# Test
ps, inf_s, err = geo_series(a1=1, r=0.9, n_terms=10)
print(f"10 terms: partial={ps:.6f}, infinite={inf_s:.6f}, error={err:.6f}")

# Find how many terms until error < 0.001
a1, r = 1.0, 0.9
target_err = 0.001
for n in range(1, 200):
    ps, inf_s, err = geo_series(a1, r, n)
    if err < target_err:
        print(f"Within {target_err} after {n} terms (sum={ps:.6f}, error={err:.8f})")
        converged_n, converged_sum = n, ps
        break

# Plot convergence
all_ns = list(range(1, 81))
all_ps = [geo_series(a1, r, n)[0] for n in all_ns]
inf_sum = geo_series(a1, r, 1)[1]

fig = Figure(xmin=0, xmax=82, ymin=0, ymax=12,
             title=f"Σ (0.9)^n converging to {inf_sum:.1f}")
fig.grid().axes()
fig.scatter(all_ns, all_ps, color=BLUE, radius=4)
fig.hline(inf_sum, color=GRAY)
fig.text([55, inf_sum + 0.2], f"limit = {inf_sum}", color='gray', size=11, bold=True)
fig.point([converged_n, converged_sum], color=AMBER, radius=9,
          label=f"n={converged_n}: within {target_err}")
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'geo_series' not in dir():
    res = "ERROR: geo_series not defined."
else:
    ps10, inf_s, err10 = geo_series(1, 0.9, 10)
    ps1, inf_s2, err1 = geo_series(2, 0.5, 5)
    if ps10 is None:
        res = "ERROR: returned None — fill in the formula."
    elif not math.isclose(inf_s, 1/(1-0.9), rel_tol=1e-9):
        res = f"ERROR: infinite sum for r=0.9 should be {1/(1-0.9)}, got {inf_s}."
    elif not math.isclose(ps10, sum(0.9**k for k in range(10)), rel_tol=1e-9):
        res = f"ERROR: partial sum of 10 terms wrong. Got {ps10:.6f}."
    elif not math.isclose(err10, abs(ps10 - inf_s), rel_tol=1e-9):
        res = f"ERROR: error should be |partial - infinite|."
    else:
        res = f"SUCCESS: geo_series correct — 10 terms: partial={ps10:.4f}, inf={inf_s:.1f}, err={err10:.6f}."
res
`,
              hint: 'partial_sum = sum(a1 * r**k for k in range(n_terms)) OR use the formula a1*(1-r**n)/(1-r). infinite_sum = a1/(1-r) if abs(r)<1 else None. error = abs(partial_sum - infinite_sum) if infinite_sum is not None else float("inf").',
            },

            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Mortgage calculator and amortisation plot',
              difficulty: 'medium',
              prompt: 'Write `mortgage(principal, annual_rate_pct, years)` that returns a dict with keys: `monthly_payment`, `total_paid`, `total_interest`, `schedule` (list of monthly balances). Then compare two scenarios: (A) $400k at 5% for 30 years vs (B) $400k at 5% for 15 years. Plot both balance schedules on the same figure.',
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def mortgage(principal, annual_rate_pct, years):
    """
    Compute full mortgage schedule.
    Returns dict with:
      monthly_payment, total_paid, total_interest,
      schedule (list of balances — length years*12+1, starts at principal)
    """
    pass

# Scenario A: 30-year mortgage
result_A = mortgage(400_000, 5.0, 30)
print("=== 30-year mortgage ===")
print(f"Monthly payment:  \${result_A['monthly_payment']:>10,.2f}")
print(f"Total paid:       \${result_A['total_paid']:>10,.2f}")
print(f"Total interest:   \${result_A['total_interest']:>10,.2f}")

# Scenario B: 15-year mortgage
result_B = mortgage(400_000, 5.0, 15)
print("\\n=== 15-year mortgage ===")
print(f"Monthly payment:  \${result_B['monthly_payment']:>10,.2f}")
print(f"Total paid:       \${result_B['total_paid']:>10,.2f}")
print(f"Total interest:   \${result_B['total_interest']:>10,.2f}")

interest_saved = result_A['total_interest'] - result_B['total_interest']
print(f"\\nInterest saved by choosing 15yr: \${interest_saved:>10,.2f}")

# Plot both schedules
sched_A = result_A['schedule']
sched_B = result_B['schedule']
months_A = list(range(len(sched_A)))
months_B = list(range(len(sched_B)))

fig = Figure(xmin=0, xmax=370, ymin=0, ymax=430_000,
             title="Mortgage balance: 30yr (blue) vs 15yr (red) — $400k at 5%")
fig.grid().axes()
fig.scatter(months_A[::6], sched_A[::6], color=BLUE, radius=3)
fig.scatter(months_B[::3], sched_B[::3], color=RED,  radius=3)
fig.text([200, 350_000], "30-year", color='blue', size=12, bold=True)
fig.text([50,  200_000], "15-year", color='red',  size=12, bold=True)
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'mortgage' not in dir():
    res = "ERROR: mortgage not defined."
else:
    m = mortgage(400_000, 5.0, 30)
    if m is None:
        res = "ERROR: returned None — fill in the function."
    elif 'monthly_payment' not in m:
        res = "ERROR: dict missing 'monthly_payment' key."
    else:
        P = m['monthly_payment']
        r = 0.05/12
        N = 360
        expected_P = 400_000 * r*(1+r)**N / ((1+r)**N - 1)
        if not math.isclose(P, expected_P, rel_tol=1e-4):
            res = f"ERROR: monthly payment should be \${expected_P:,.2f}, got \${P:,.2f}."
        elif len(m['schedule']) != 361:
            res = f"ERROR: schedule should have 361 entries (0..360 months), got {len(m['schedule'])}."
        elif not math.isclose(m['schedule'][-1], 0.0, abs_tol=1.0):
            res = f"ERROR: final balance should be ~0, got {m['schedule'][-1]:.2f}."
        else:
            res = f"SUCCESS: mortgage correct — payment=\${P:,.2f}, interest=\${m['total_interest']:,.2f}."
res
`,
              hint: 'r = annual_rate_pct/100/12. N = years*12. P = principal*r*(1+r)**N / ((1+r)**N - 1). Then loop: interest = balance*r; principal_paid = P - interest; balance -= principal_paid. Collect balances in a list. total_paid = P*N.',
            },

            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Compound: build a Taylor series calculator',
              difficulty: 'hard',
              prompt: 'The Taylor series for sin(x) is x − x³/3! + x⁵/5! − x⁷/7! + … Write `taylor_sin(x, n_terms)` that returns the approximation using n_terms. Then: plot the approximation for n=1,3,5,7,9 terms alongside the true sin(x), observe the interval of good approximation growing with more terms, and find the minimum n such that the error at x=π is below 1e-10.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE, GRAY

def taylor_sin(x, n_terms):
    """
    Taylor series for sin(x) around x=0:
    sin(x) ≈ Σ_{k=0}^{n_terms-1} (-1)^k * x^(2k+1) / (2k+1)!
    """
    pass

# Test
print(f"taylor_sin(π/2, 1)  = {taylor_sin(math.pi/2, 1):.6f}  (true={math.sin(math.pi/2):.6f})")
print(f"taylor_sin(π/2, 3)  = {taylor_sin(math.pi/2, 3):.6f}")
print(f"taylor_sin(π/2, 5)  = {taylor_sin(math.pi/2, 5):.6f}")
print(f"taylor_sin(π/2, 10) = {taylor_sin(math.pi/2, 10):.10f}  (true={math.sin(math.pi/2):.10f})")

# Error at x=π with increasing terms
print("\\nError at x=π:")
for n in range(1, 15):
    approx = taylor_sin(math.pi, n)
    err = abs(approx - math.sin(math.pi))
    print(f"  n={n:2}: approx={approx:>12.6f}  error={err:.2e}")

# Find minimum n for error < 1e-10 at x=π
n_needed = next(n for n in range(1, 30)
                if abs(taylor_sin(math.pi, n) - math.sin(math.pi)) < 1e-10)
print(f"\\nMinimum terms for error < 1e-10 at x=π: {n_needed}")

# Plot — watch the approximation improve
fig = Figure(xmin=-4, xmax=4, ymin=-1.5, ymax=1.5,
             title="Taylor series for sin(x) — more terms = wider accuracy")
fig.grid().axes()
fig.plot(math.sin, color=GRAY, label='true sin(x)', width=3)
colors = [RED, BLUE, GREEN, AMBER, PURPLE]
for n, color in zip([1, 3, 5, 7, 9], colors):
    fig.plot(lambda x, n=n: taylor_sin(x, n),
             color=color, label=f'n={n} terms', width=1.5)
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'taylor_sin' not in dir():
    res = "ERROR: taylor_sin not defined."
elif taylor_sin(math.pi/2, 1) is None:
    res = "ERROR: returned None — fill in the series."
else:
    v1 = taylor_sin(math.pi/2, 10)
    v2 = taylor_sin(0.0, 5)
    v3 = taylor_sin(math.pi, 15)
    err_pi_15 = abs(v3 - math.sin(math.pi))
    if not math.isclose(v1, math.sin(math.pi/2), rel_tol=1e-8):
        res = f"ERROR: taylor_sin(π/2, 10) should be ≈1, got {v1:.8f}."
    elif abs(v2) > 1e-12:
        res = f"ERROR: sin(0) should be 0 for any n_terms, got {v2}."
    elif err_pi_15 > 1e-10:
        res = f"ERROR: 15 terms at π should give error < 1e-10, got {err_pi_15:.2e}."
    else:
        n_needed = next(n for n in range(1,30) if abs(taylor_sin(math.pi,n)-math.sin(math.pi))<1e-10)
        res = f"SUCCESS: taylor_sin correct — sin(π/2)≈{v1:.8f}, need {n_needed} terms for 1e-10 accuracy at π."
res
`,
              hint: 'Each term k: coefficient = (-1)**k, power = 2*k+1, factorial = math.factorial(2*k+1). Term = coefficient * x**power / factorial. Sum for k in range(n_terms). Or use the recurrence: multiply previous term by -x²/((2k)(2k+1)) to avoid recomputing factorial each time.',
            },
          ],
        },
      },
    ],
  },
}
