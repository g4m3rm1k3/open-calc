# Stage 5, Lesson 5.3 — The Limit, Formal (ε–δ)

**Threads:** Math · CS
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Lesson 5.2 defined a limit as "$f(x)$ gets arbitrarily close to $L$ as $x$ gets arbitrarily close to $a$." That phrase did real computational work for two centuries, but "arbitrarily close" is not a mathematical statement — it's a feeling, and you cannot plug a feeling into a proof. This lesson replaces it with an exact, checkable inequality: the **epsilon–delta ($\epsilon$–$\delta$) definition of a limit**, the same definition every rigorous calculus proof from this point forward is built on. The goal isn't to change *how* you compute limits — Lesson 5.2's techniques still work fine for that — it's to make "limit" precise enough to prove things about.

---

## Historical Context

For roughly 150 years after Newton and Leibniz, mathematicians used limits productively but imprecisely, occasionally running into genuine contradictions because "infinitely small quantity" was never pinned down. Augustin-Louis Cauchy took the first serious steps toward rigor in 1821, describing limits using inequalities rather than intuition — but it was Karl Weierstrass, lecturing at the University of Berlin in the 1850s–1861, who finalized the precise $\epsilon$–$\delta$ formulation still used today, finally closing the loopholes that had let subtly incorrect "proofs" circulate for a century.

---

## What You Need To Know First

- **The informal limit and Limit Laws** (Lesson 5.2) — the intuition this lesson makes precise.
- **Absolute value as distance** — $|x-a|$ measures the distance between $x$ and $a$; used constantly below.
- **Solving linear and simple quadratic inequalities** — needed to isolate $\delta$ in terms of $\epsilon$.

---

## The Lesson

### The ε–δ Definition

**Formal definition.** We say $\lim_{x\to a}f(x)=L$ if for **every** $\epsilon>0$ (no matter how small), there **exists** $\delta>0$ such that
$$0 < |x-a| < \delta \implies |f(x)-L| < \epsilon$$

Read this as a challenge-and-response game: someone hands you a tolerance $\epsilon$ for how close to $L$ they demand $f(x)$ to be — and no matter how small a tolerance they pick, you must hand back a distance $\delta$ from $a$ that guarantees it. The limit exists exactly when you can win this game for *every* possible $\epsilon$.

**Geometric picture.** Draw a thin horizontal "epsilon band" of height $2\epsilon$ centered on $L$. Your job is to find a "delta band" of width $2\delta$ centered on $a$, narrow enough that the entire piece of the graph inside it also lands inside the epsilon band — except possibly the single point directly above $a$ itself, which is exactly what the strict $0<|x-a|$ excludes.

**CS lens.** This has the exact shape of a formal correctness proof with a universally-quantified adversary: "for all $\epsilon$ (however small an adversary picks), there exists a $\delta$ (that you must construct) such that a guarantee holds." This "for all ... there exists ..." structure is identical to how formal verification tools state correctness properties of programs — constructing a certificate that survives every possible challenge, not just observed behavior.

```python
import numpy as np

def f1(x):
    return 2*x + 1

a1, L1 = 3, 7
print("Example 1: lim x->3 (2x+1) = 7")
for eps in [1.0, 0.1, 0.01, 0.001]:
    delta = eps / 2
    rng = np.random.default_rng(0)
    xs = a1 + rng.uniform(-delta, delta, 2000)
    xs = xs[xs != a1]
    max_diff = np.max(np.abs(f1(xs) - L1))
    print(f"  eps={eps:<7} delta=eps/2={delta:<8} max|f(x)-L| = {max_diff:.6f}  (< eps: {max_diff < eps})")
```

**Real output, this session:**
```
Example 1: lim x->3 (2x+1) = 7
  eps=1.0     delta=eps/2=0.5      max|f(x)-L| = 0.999620  (< eps: True)
  eps=0.1     delta=eps/2=0.05     max|f(x)-L| = 0.099962  (< eps: True)
  eps=0.01    delta=eps/2=0.005    max|f(x)-L| = 0.009996  (< eps: True)
  eps=0.001   delta=eps/2=0.0005   max|f(x)-L| = 0.001000  (< eps: True)
```

**Walkthrough.** For each `eps`, the code samples 2000 random `x` values inside the `delta`-band (excluding `a` itself, matching the strict `0<|x-a|` in the definition) and reports the *worst* resulting `|f(x)-L|`. Every row confirms it stays under `eps` — this is what the proof below derives algebraically.

---

### Proving a Limit Rigorously — A Linear Function

To prove $\lim_{x\to a}f(x)=L$, you must produce an explicit formula for $\delta$ *in terms of* $\epsilon$, then show algebraically it works for every $\epsilon>0$.

#### Hand-Worked Example

We will prove $\lim_{x\to3}(2x+1)=7$.

**Step 1 — state the goal.** Given any $\epsilon>0$, find $\delta>0$ such that $0<|x-3|<\delta \implies |(2x+1)-7|<\epsilon$.

**Step 2 — scratch work.** $|(2x+1)-7|=|2x-6|=2|x-3|$. We want $2|x-3|<\epsilon$, i.e. $|x-3|<\frac\epsilon2$.

**Step 3 — choose $\delta$.** Let $\delta=\dfrac\epsilon2$.

**Step 4 — forward proof.** Suppose $0<|x-3|<\delta=\frac\epsilon2$. Then $|(2x+1)-7|=2|x-3|<2\cdot\frac\epsilon2=\epsilon$. $\blacksquare$

**Step 5 — generalize.** For *any* linear function $f(x)=mx+b$, the same scratch work gives $\delta=\epsilon/|m|$ — the steeper the line, the smaller a $\delta$-band is needed for a given $\epsilon$-band.

---

### Proving a Limit Rigorously — A Quadratic Function (the "restrict δ" trick)

#### Hand-Worked Example

We will prove $\lim_{x\to2}x^2=4$.

**Step 1 — state the goal.** Given $\epsilon>0$, find $\delta>0$ such that $0<|x-2|<\delta \implies |x^2-4|<\epsilon$.

**Step 2 — scratch work: factor.** $|x^2-4|=|(x-2)(x+2)|=|x-2|\cdot|x+2|$ — two $x$-dependent factors this time, unlike the linear case.

**Step 3 — restrict $\delta\leq1$ first.** If $|x-2|<\delta\leq1$, then $1<x<3$, so $3<x+2<5$, giving $|x+2|<5$.

**Step 4 — combine the bounds.** $|x^2-4|=|x-2|\cdot|x+2|<5|x-2|$. We want $5|x-2|<\epsilon$, i.e. $|x-2|<\epsilon/5$.

**Step 5 — choose $\delta$.** We need *both* restrictions at once: $\delta=\min\!\left(1,\dfrac\epsilon5\right)$.

**Step 6 — forward proof.** Suppose $0<|x-2|<\delta$. Since $\delta\leq1$, Step 3's bound $|x+2|<5$ applies, so $|x^2-4|=|x-2|\cdot|x+2|<\delta\cdot5\leq\frac\epsilon5\cdot5=\epsilon$. $\blacksquare$

**Step 7 — generalize.** The "restrict $\delta\leq1$ first" trick is standard whenever the factored target expression has more than one $x$-dependent factor — it converts an unbounded factor into a fixed numerical bound you can fold into the final $\delta$ formula.

```python
import numpy as np

def f2(x):
    return x**2

a2, L2 = 2, 4
print("Example 2: lim x->2 x^2 = 4")
for eps in [1.0, 0.1, 0.01, 0.001]:
    delta = min(1, eps / 5)
    rng = np.random.default_rng(1)
    xs = a2 + rng.uniform(-delta, delta, 2000)
    xs = xs[xs != a2]
    max_diff = np.max(np.abs(f2(xs) - L2))
    print(f"  eps={eps:<7} delta=min(1,eps/5)={delta:<8} max|f(x)-L| = {max_diff:.6f}  (< eps: {max_diff < eps})")
```

**Real output, this session:**
```
Example 2: lim x->2 x^2 = 4
  eps=1.0     delta=min(1,eps/5)=0.2      max|f(x)-L| = 0.839632  (< eps: True)
  eps=0.1     delta=min(1,eps/5)=0.02     max|f(x)-L| = 0.080366  (< eps: True)
  eps=0.01    delta=min(1,eps/5)=0.002    max|f(x)-L| = 0.008001  (< eps: True)
  eps=0.001   delta=min(1,eps/5)=0.0002   max|f(x)-L| = 0.000800  (< eps: True)
```

**Walkthrough.** As $\epsilon$ shrinks by a factor of 10 each row, `delta` shrinks proportionally once it's below `1` (the point where the `min(1, eps/5)` restriction stops binding) — a direct numerical echo of the Step 5 formula.

![Epsilon-delta bands for the linear and quadratic examples — the delta-band always maps inside the epsilon-band](epsilon_delta.png)

**Walkthrough.** The colored bands are the epsilon-band and delta-band drawn to scale for one specific $\epsilon$ in each example — the entire piece of each curve inside the green delta-band sits inside the gold epsilon-band, exactly what the algebra guarantees for every $\epsilon$, not just the one pictured.

---

## Connect the Pieces

**What this lesson built on:** The informal limit and Limit Laws (Lesson 5.2) — this lesson supplies the missing proofs. Factoring and inequality-solving (Lessons 1.2, 0.3) — the algebraic engine behind every $\delta$ derivation.

**What this lesson makes possible:** Every proof involving limits, derivatives, or integrals for the rest of this curriculum ultimately rests on this definition, even when a proof doesn't spell out the $\epsilon$–$\delta$ argument explicitly. Lesson 5.4 (Continuity) reuses this exact definition, adding one requirement: $f(a)$ must actually equal $L$.

**In CS:** The "for all $\epsilon$, there exists $\delta$" pattern reappears directly in formal software verification (proving a program meets a specification against every possible input) and in numerical error analysis (bounding output error in terms of input precision) — both are $\epsilon$–$\delta$ arguments wearing different clothes.

---

## Summary

- $\lim_{x\to a}f(x)=L$ means: for every $\epsilon>0$, there's a $\delta>0$ with $0<|x-a|<\delta \implies |f(x)-L|<\epsilon$.
- To prove a limit: do **scratch work** (simplify $|f(x)-L|$ in terms of $|x-a|$), choose $\delta$ as a formula in $\epsilon$, then write the forward proof.
- For **linear functions**, $\delta=\epsilon/|m|$ suffices alone.
- For functions with **more than one $x$-dependent factor** after simplifying, restrict $\delta\leq$ some fixed number first (commonly $1$), then combine with the $\epsilon$ requirement using a minimum.

**New Python:**
- `rng = np.random.default_rng(seed)` — a seeded random generator, giving reproducible random sampling for verification.
- `rng.uniform(-delta, delta, n)` — draw `n` uniform random samples in an interval, used to stress-test a $\delta$-band.
- `np.all(condition)` — check that a condition holds across every element of an array at once.

---

## Problems

### Math

**1.** Find a formula for $\delta$ (in terms of $\epsilon$) proving $\lim_{x\to5}(3x-2)=13$.

**2.** Using the restrict-$\delta\leq1$ trick, find a formula for $\delta$ proving $\lim_{x\to1}(x^2+1)=2$.

<details>
<summary>Answers</summary>

1. $|(3x-2)-13|=3|x-5|<\epsilon \Rightarrow \delta=\epsilon/3$.
2. $|x^2+1-2|=|x-1||x+1|$; restrict $\delta\leq1\Rightarrow 0<x<2\Rightarrow|x+1|<3$; need $3|x-1|<\epsilon \Rightarrow \delta=\min(1,\epsilon/3)$.

</details>

---

**3.** Explain, in your own words, why the definition requires $0<|x-a|$ (strictly greater than zero) rather than just $|x-a|<\delta$. What would go wrong at a removable hole, like Lesson 5.2's $\frac{x^2-4}{x-2}$ at $x=2$, if this strict inequality were dropped?

<details>
<summary>Answer</summary>

If $x=a$ were allowed, the definition would require $|f(a)-L|<\epsilon$ too — but at a removable hole, $f(a)$ is *undefined*, so that requirement could never even be checked, and the limit would be forced to not exist despite the function clearly approaching $L$ from both sides. Excluding $x=a$ is precisely what lets a limit exist independently of whether (or how) the function is defined at that single point.

</details>

---

**4.** (Proof) Prove, using the $\epsilon$–$\delta$ definition, that $\lim_{x\to a}c=c$ for any constant function $f(x)=c$.

<details>
<summary>Answer</summary>

Given $\epsilon>0$, choose *any* $\delta>0$ (say $\delta=1$). Then for $0<|x-a|<\delta$: $|f(x)-c|=|c-c|=0<\epsilon$, since $\epsilon>0$ always. $\blacksquare$ (This works for literally any $\delta$, since $f(x)-c$ is always exactly $0$.)

</details>

---

### Code Challenges

**Challenge 1 — Numeric delta finder**

```python
import numpy as np

def find_delta(f, a, L, eps, delta_max=1.0, steps=10000):
    """
    Search for the largest delta in (0, delta_max] such that
    0 < |x-a| < delta implies |f(x)-L| < eps, by testing a fine grid
    of candidate deltas from delta_max downward.
    Return the first (largest) delta that works.
    Raise ValueError if none in the range works.
    """
    pass  # your code here


# --- tests: do not modify ---
def f1(x): return 2*x + 1
d = find_delta(f1, 3, 7, 0.1)
assert d <= 0.1/2 + 1e-3
assert d > 0

print("✓ Challenge 1 passed! delta found:", d)
```

---

**Challenge 2 — Epsilon-delta verifier**

```python
import numpy as np

def verify_epsilon_delta(f, a, L, eps, delta, n=2000, seed=0):
    """
    Sample n random points within delta of a (excluding a) and check
    that |f(x)-L| < eps holds for every single one. Return True or False.
    """
    pass  # your code here


# --- tests: do not modify ---
def f2(x): return x**2
assert verify_epsilon_delta(f2, 2, 4, 0.01, min(1, 0.01/5)) == True
assert verify_epsilon_delta(f2, 2, 4, 0.01, 0.5) == False  # delta too large for this eps

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

Use `rng.uniform(-delta, delta, n)` to sample offsets from `a`, filter out the point equal to `a`, then check `np.all(np.abs(f(xs) - L) < eps)`.

</details>

---

### Extension

**5. ★** The definition says "there exists a $\delta$" — not that it's the *largest possible* one that works. Explain why, if $\delta_0$ is a valid choice for a given $\epsilon$, then any smaller positive $\delta_1<\delta_0$ is also automatically valid — and why this fact justifies the "restrict $\delta\leq1$" trick used in the quadratic example, where larger, possibly-valid choices of $\delta$ were deliberately discarded.
