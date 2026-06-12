# M-024 — Series and Convergence Tests

**Phase 8 · Sequences and Series · Lesson 2 of 3**
**Pillar: Approximation** · *When does an infinite sum have a finite value — and how do you decide?*

---

## What You Will Build

A Python program that applies all five convergence tests to a battery of series and explains which test applies and why. You will derive the geometric series formula from scratch and prove the divergence of the harmonic series.

---

## What You Need to Know First

- M-023: sequence convergence (a series converges when its partial sum sequence converges)
- M-022: FTC (the integral test uses integration)

---

> **Quick Check — try to answer before reading:**
>
> 1. The series $1 + 1/2 + 1/3 + 1/4 + \cdots$ — does it converge?
> 2. The series $1 + 1/2 + 1/4 + 1/8 + \cdots$ — does it converge? What is the sum?
> 3. If $a_n \to 0$ as $n \to \infty$, does $\sum a_n$ necessarily converge?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Series as Sequences of Partial Sums

A **series** $\sum_{n=1}^\infty a_n$ is the formal sum of infinitely many terms. It **converges** to $S$ if the sequence of partial sums $S_N = \sum_{n=1}^N a_n$ converges to $S$.

$$\sum_{n=1}^\infty a_n = S \iff \lim_{N \to \infty} S_N = S$$

A series that does not converge **diverges**.

---

### The Geometric Series — Derived

$$\sum_{n=0}^\infty r^n = \frac{1}{1-r} \quad \text{for } |r| < 1$$

**Proof:** $S_N = 1 + r + r^2 + \cdots + r^N$. Multiply by $r$: $rS_N = r + r^2 + \cdots + r^{N+1}$.

Subtract: $S_N(1-r) = 1 - r^{N+1}$, so $S_N = \frac{1 - r^{N+1}}{1-r}$.

For $|r| < 1$: $r^{N+1} \to 0$ as $N \to \infty$, so $S_N \to \frac{1}{1-r}$. $\square$

For $|r| \geq 1$: $r^{N+1}$ does not go to 0, so the series diverges.

---

### Convergence Tests

**Test 1 — Divergence Test (Necessary Condition):**

If $\sum a_n$ converges, then $a_n \to 0$.

Equivalently (contrapositive): if $a_n \not\to 0$, then $\sum a_n$ diverges.

**Warning:** The converse is false. $a_n \to 0$ does not imply $\sum a_n$ converges. The harmonic series $\sum 1/n$ has $1/n \to 0$ but diverges.

**Test 2 — Ratio Test:**

If $L = \lim_{n \to \infty} \left|\frac{a_{n+1}}{a_n}\right|$ exists, then:
- $L < 1$: series converges absolutely.
- $L > 1$: series diverges.
- $L = 1$: inconclusive.

**Use when:** terms contain factorials or exponentials (the ratio simplifies nicely).

**Test 3 — Integral Test:**

If $f(x) \geq 0$, decreasing, and continuous for $x \geq 1$, with $f(n) = a_n$, then $\sum a_n$ and $\int_1^\infty f(x)\,dx$ either both converge or both diverge.

**Use when:** $a_n = f(n)$ for a function you can integrate.

**Test 4 — Comparison Test:**

If $0 \leq a_n \leq b_n$ for all large $n$: if $\sum b_n$ converges, so does $\sum a_n$. If $\sum a_n$ diverges, so does $\sum b_n$.

**Test 5 — Alternating Series Test:**

$\sum (-1)^n b_n$ (with $b_n > 0$) converges if:
1. $b_n$ is decreasing: $b_{n+1} \leq b_n$
2. $b_n \to 0$

**Error bound for alternating series:** $|S - S_N| \leq b_{N+1}$ — the error is bounded by the first omitted term.

---

### The Harmonic Series Diverges

$\sum_{n=1}^\infty \frac{1}{n}$ diverges, even though $1/n \to 0$.

**Proof (Cauchy's condensation argument):**

Group the terms: $1 + (1/2) + (1/3 + 1/4) + (1/5 + 1/6 + 1/7 + 1/8) + \cdots$

Each group of $2^k$ terms starting at $1/2^k + 1$ has minimum value $1/2^{k+1}$, and there are $2^k$ such terms, so each group sums to at least $2^k \cdot 1/2^{k+1} = 1/2$.

Since there are infinitely many groups each contributing at least $1/2$, the series diverges. $\square$

```python
import math

def partial_sum(a_fn, N):
    return sum(a_fn(n) for n in range(1, N+1))

def ratio_test(a_fn, n_start=10, n_end=100):
    """Estimate the ratio test limit."""
    ratios = [abs(a_fn(n+1) / a_fn(n)) for n in range(n_start, n_end) if abs(a_fn(n)) > 1e-15]
    return sum(ratios) / len(ratios) if ratios else None

print("=== Convergence Tests Battery ===")
print()

series = [
    {
        "name": "∑ 1/n² (p-series, p=2)",
        "a_n":  lambda n: 1/n**2,
        "test": "Integral test: ∫1/x² dx = 1/x → converges",
        "result": "Converges to π²/6 ≈ 1.6449",
        "exact": math.pi**2/6,
    },
    {
        "name": "∑ 1/n (harmonic series)",
        "a_n":  lambda n: 1/n,
        "test": "Divergence by grouping (Cauchy) — groups each give ≥ 1/2",
        "result": "Diverges (very slowly)",
        "exact": None,
    },
    {
        "name": "∑ (1/2)^n (geometric, r=1/2)",
        "a_n":  lambda n: (1/2)**n,
        "test": "Geometric: r=1/2 < 1 → sum = r/(1-r) = 1",
        "result": "Converges to 1",
        "exact": 1.0,
    },
    {
        "name": "∑ n!/n^n (ratio test)",
        "a_n":  lambda n: math.factorial(min(n, 20)) / n**min(n, 20),
        "test": "Ratio: a_{n+1}/a_n → 1/e < 1 → converges",
        "result": "Converges",
        "exact": None,
    },
    {
        "name": "∑ (-1)^n / n (alternating harmonic)",
        "a_n":  lambda n: (-1)**n / n,
        "test": "Alternating series test: b_n=1/n decreasing → 0",
        "result": "Converges to -ln(2) ≈ -0.6931",
        "exact": -math.log(2),
    },
]

for s in series:
    N = 10000
    ps = partial_sum(s["a_n"], N)
    exact_str = f"  (exact: {s['exact']:.4f})" if s['exact'] else ""
    print(f"Series: {s['name']}")
    print(f"  Test: {s['test']}")
    print(f"  Result: {s['result']}")
    print(f"  S_10000 = {ps:.6f}{exact_str}")
    if s['exact']:
        print(f"  Error: {abs(ps - s['exact']):.2e}")
    print()

print("=== Harmonic Series Divergence ===")
print("Grouping argument: each group of 2^k terms contributes ≥ 1/2")
print()
group_sum = 0
for k in range(0, 7):
    start = 2**k + 1
    end   = 2**(k+1)
    group = sum(1/n for n in range(start, end+1))
    group_sum += group
    print(f"  Group k={k}: terms 1/{start} to 1/{end}: sum = {group:.4f} (≥ 0.5)")
print(f"  Total of 7 groups: {group_sum:.4f} ≥ 7/2 = 3.5")
print("  Since there are infinitely many groups each ≥ 1/2, the series diverges.")
print()

print("=== Geometric Series: Derivation Verification ===")
print("∑_{n=0}^∞ r^n = 1/(1-r) for |r| < 1")
print()
for r in [0.5, 0.1, 0.9, -0.5]:
    formula = 1 / (1 - r)
    approx  = sum(r**n for n in range(1000))
    print(f"  r={r:5.2f}: formula=1/(1-{r})={formula:.6f}, partial sum (n=1000)={approx:.6f}, error={abs(approx-formula):.2e}")
```

---

## Connect the Pieces

**Backwards:** A series is a sequence of partial sums (M-023). The ratio test uses the exponential and factorial (M-013). The integral test uses FTC (M-022).

**Forwards:**
- M-025 (Taylor series): Taylor series are power series $\sum a_n x^n$. Their convergence is determined by the ratio test, giving the radius of convergence.
- M-043 (Concrete Mathematics): Generating functions are formal power series used to count combinatorial objects — the same series we study here.
- M-046 (Real Analysis): Absolute convergence ($\sum |a_n| < \infty$) vs conditional convergence; the Riemann rearrangement theorem shows conditionally convergent series can be rearranged to sum to anything.

---

## What Breaks Without This

Without convergence tests:
- You cannot know whether a Taylor series actually equals the function it represents — the series might diverge. Without the ratio test to find the radius of convergence, Taylor series are computationally meaningless.

---

## Definition of Done

- [ ] You can derive the geometric series formula from the partial sum formula
- [ ] You can prove the harmonic series diverges by Cauchy's grouping argument
- [ ] You can apply all five convergence tests and state when each applies
- [ ] You understand why $a_n \to 0$ is necessary but not sufficient for convergence
- [ ] You ran the Python code and can read the table

**Proof reconstruction (Sunday):** Prove the harmonic series diverges. Then apply the ratio test to $\sum n!/n^n$.

---

## Answers to Quick Check

1. The harmonic series $\sum 1/n$ diverges — even though $1/n \to 0$. The terms get small too slowly.
2. $1 + 1/2 + 1/4 + \cdots = \sum (1/2)^n = 1/(1 - 1/2) = 2$ (geometric series with $r = 1/2$, but note starting from $n=0$: sum $= 1/(1-1/2) = 2$).
3. No. The harmonic series is the canonical counterexample: $1/n \to 0$ but $\sum 1/n$ diverges.
