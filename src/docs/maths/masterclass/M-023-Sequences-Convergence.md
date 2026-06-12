# M-023 — Sequences and Their Convergence

**Phase 8 · Sequences and Series · Lesson 1 of 3**
**Pillar: Approximation** · *The epsilon-N definition — same structure as limits, applied to sequences*

---

## What You Will Build

A Python program that visualises convergent and divergent sequences, prints epsilon-N witnesses, and demonstrates the difference between Cauchy sequences in $\mathbb{Q}$ (can fail to converge) and in $\mathbb{R}$ (always converge). You will write your first sequence convergence proof.

---

## What You Need to Know First

- M-016: epsilon-delta limits (same structure, now applied to sequences)
- M-003: completeness of $\mathbb{R}$ (Cauchy sequences converge iff the space is complete)

---

> **Quick Check — try to answer before reading:**
>
> 1. Does the sequence $a_n = 1/n$ converge? What is its limit?
> 2. Does $a_n = (-1)^n$ converge? Why or why not?
> 3. A sequence is Cauchy if its terms get arbitrarily close to each other. Is this the same as converging?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Definition of Convergence

A sequence $\{a_n\}_{n=1}^\infty$ **converges to $L$** if:

$$\forall \varepsilon > 0,\ \exists N \in \mathbb{N} \text{ such that } n > N \implies |a_n - L| < \varepsilon$$

This is the same epsilon-N structure as the epsilon-delta limit definition (M-016) — just replacing $x \to a$ with $n \to \infty$ and $\delta$ with $N$.

**Compare:** $\lim_{x \to a} f(x) = L$: for any tolerance $\varepsilon$, there is a neighbourhood $\delta$ of $a$ such that all $x$ in it give $f(x)$ within $\varepsilon$ of $L$.

$\lim_{n \to \infty} a_n = L$: for any tolerance $\varepsilon$, there is an index $N$ such that all terms after it are within $\varepsilon$ of $L$.

**Proof example:** Show $\lim_{n \to \infty} \frac{1}{n} = 0$.

**Scratchwork:** We want $|1/n - 0| = 1/n < \varepsilon$, i.e. $n > 1/\varepsilon$. Choose $N = \lceil 1/\varepsilon \rceil$ (the ceiling, i.e. the smallest integer $\geq 1/\varepsilon$).

**Proof:** Given $\varepsilon > 0$, choose $N = \lceil 1/\varepsilon \rceil$. For $n > N$:

$|a_n - 0| = \frac{1}{n} < \frac{1}{N} \leq \varepsilon$. $\square$

---

### Cauchy Sequences and Completeness

A sequence $\{a_n\}$ is **Cauchy** if for any $\varepsilon > 0$ there exists $N$ such that $m, n > N \implies |a_m - a_n| < \varepsilon$. The terms eventually cluster together.

**Theorem:** In $\mathbb{R}$: a sequence converges $\iff$ it is Cauchy.

($\Rightarrow$) Every convergent sequence is Cauchy: if $a_n \to L$, then $|a_m - a_n| \leq |a_m - L| + |L - a_n| < \varepsilon/2 + \varepsilon/2 = \varepsilon$ for large $m, n$.

($\Leftarrow$) Every Cauchy sequence converges: this direction requires completeness of $\mathbb{R}$ — a Cauchy sequence is bounded (finite elements plus tail), the set of tail elements has a supremum, and continuity carries it to a limit. The proof is in Phase 16 (M-044).

**Why this fails in $\mathbb{Q}$:** The sequence $a_n = \lfloor \sqrt{2} \times 10^n \rfloor / 10^n$ (decimal truncations of $\sqrt{2}$: $1, 1.4, 1.41, 1.414, \ldots$) is Cauchy in $\mathbb{Q}$ but does not converge in $\mathbb{Q}$ ($\sqrt{2} \notin \mathbb{Q}$). Cauchy + completeness $\Rightarrow$ convergence. In $\mathbb{Q}$, completeness fails.

```python
import math

def converges_to(seq_fn, L, epsilon, N_bound=10000):
    """
    Check if sequence a_n = seq_fn(n) is within epsilon of L for all n > some N.
    Returns the first N where all subsequent terms are within epsilon.
    """
    for N in range(1, N_bound):
        if all(abs(seq_fn(n) - L) < epsilon for n in range(N+1, min(N+100, N_bound))):
            return N
    return None

print("=== Sequence Convergence Analysis ===")
print()

sequences = [
    ("a_n = 1/n",       lambda n: 1/n,          0,   [0.5, 0.1, 0.01]),
    ("a_n = (n+1)/n",   lambda n: (n+1)/n,       1,   [0.5, 0.1, 0.01]),
    ("a_n = 1/n²",      lambda n: 1/n**2,        0,   [0.1, 0.01, 0.001]),
    ("a_n = n/(n²+1)",  lambda n: n/(n**2+1),    0,   [0.5, 0.1, 0.01]),
]

for (name, seq, L, epsilons) in sequences:
    print(f"{name} → {L}")
    for eps in epsilons:
        N = converges_to(seq, L, eps)
        print(f"  ε = {eps}: |a_n - {L}| < ε for all n > {N}")
    print()

# Divergent sequences
print("=== Divergent Sequences ===")
print()
divergent = [
    ("a_n = (-1)^n",     lambda n: (-1)**n,   "oscillates between -1 and 1"),
    ("a_n = n",          lambda n: n,          "grows without bound"),
    ("a_n = sin(n)",     lambda n: math.sin(n),"dense in [-1,1] — no limit"),
]
for (name, seq, reason) in divergent:
    vals = [seq(n) for n in range(1, 8)]
    print(f"{name}: {[f'{v:.3f}' for v in vals]}")
    print(f"  Does not converge: {reason}")
    print()

# Cauchy sequence in Q that "wants to" converge to sqrt(2)
print("=== Cauchy in Q but no limit in Q ===")
print("a_n = floor(sqrt(2) * 10^n) / 10^n  (rational truncations of sqrt(2))")
sqrt2 = math.sqrt(2)
for n in range(1, 9):
    a_n = math.floor(sqrt2 * 10**n) / 10**n
    err = abs(a_n - sqrt2)
    print(f"  n={n}: a_n = {a_n:.{n}f}  |a_n - sqrt(2)| = {err:.{n+2}f}")
print()
print("Sequence is Cauchy (terms cluster), but limit sqrt(2) ∉ Q.")
print("This sequence converges in R (complete) but NOT in Q (incomplete).")

print()
# Monotone convergence theorem: bounded increasing sequences converge
print("=== Monotone Convergence: a_n = (1+1/n)^n → e ===")
for n in [1, 5, 10, 100, 1000, 10000]:
    val = (1 + 1/n)**n
    print(f"  n={n:>6}: a_n = {val:.10f}  (converging to e = {math.e:.10f})")
print()
print("This is bounded (≤ 3) and increasing — MCT guarantees convergence.")
```

---

### Key Sequence Facts

**Algebra of limits:** If $a_n \to L$ and $b_n \to M$:
- $a_n + b_n \to L + M$
- $a_n \cdot b_n \to LM$
- $a_n / b_n \to L/M$ (if $M \neq 0$)

These follow from the triangle inequality and product bounds — same proofs as limit laws in M-017.

**Squeeze theorem:** If $a_n \leq b_n \leq c_n$ for all large $n$ and $a_n \to L$ and $c_n \to L$, then $b_n \to L$.

**Monotone Convergence Theorem (MCT):** Every bounded monotone sequence converges. This is a direct consequence of completeness of $\mathbb{R}$ (the limit is the supremum of the sequence for increasing sequences).

---

## Connect the Pieces

**Backwards:** The definition mirrors M-016 (epsilon-delta). Completeness (M-004 hinted, M-044 proved) is the key to Cauchy sequences.

**Forwards:**
- M-024 (Series): a series converges iff the sequence of partial sums converges — series convergence reduces to sequence convergence.
- M-025 (Taylor series): Taylor series converge (or not) for each $x$ — the convergence is sequence convergence for each fixed $x$.
- M-044 (Real Analysis): Rigorous proof that Cauchy sequences converge in $\mathbb{R}$ using the completeness axiom.

---

## Definition of Done

- [ ] You can state the epsilon-N definition of sequence convergence and explain its relationship to the epsilon-delta limit definition
- [ ] You can prove $\lim_{n \to \infty} 1/n = 0$ using the definition
- [ ] You can define a Cauchy sequence and explain why convergence $\iff$ Cauchy in $\mathbb{R}$ but not in $\mathbb{Q}$
- [ ] You can state the Monotone Convergence Theorem and connect it to completeness

**Proof reconstruction (Sunday):** Prove $\lim_{n \to \infty} \frac{n}{n+1} = 1$ using the epsilon-N definition.

---

## Answers to Quick Check

1. Yes, $a_n = 1/n \to 0$. For any $\varepsilon > 0$, take $N > 1/\varepsilon$; then $1/n < \varepsilon$ for $n > N$.
2. $a_n = (-1)^n$ does not converge — it alternates between $-1$ and $1$. For $\varepsilon = 1$, no $N$ exists such that all terms after $N$ are within $\varepsilon$ of any fixed $L$ (the even and odd subsequences have different limits $+1$ and $-1$).
3. In $\mathbb{R}$: yes, Cauchy $\iff$ convergent. In $\mathbb{Q}$: no. Cauchy is weaker in general — it says the terms cluster but says nothing about where they cluster to.
