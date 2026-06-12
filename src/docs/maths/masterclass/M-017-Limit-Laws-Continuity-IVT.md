# M-017 — Limit Laws, Continuity, and the IVT

**Phase 5 · Limits and Continuity · Lesson 2 of 2**
**Pillar: Approximation** · *Continuity as the property that makes calculus possible*

---

## What You Will Build

A Python bisection algorithm that finds roots by applying the Intermediate Value Theorem — seeing IVT "in action." You will also prove the limit laws from the epsilon-delta definition and understand why the IVT requires completeness of $\mathbb{R}$.

---

## What You Need to Know First

- M-016: the epsilon-delta definition of limits
- M-006: the triangle inequality (needed to prove limit laws)
- M-004: completeness of $\mathbb{R}$ (briefly: every bounded set has a supremum)

---

> **Quick Check — try to answer before reading:**
>
> 1. Is $f(x) = x^2$ continuous everywhere? What about $g(x) = 1/x$?
> 2. Can a continuous function go from $f(0) = -1$ to $f(1) = 2$ without passing through zero?
> 3. What three conditions must a function satisfy to be continuous at $a$?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Limit Laws

If $\lim_{x \to a} f(x) = L$ and $\lim_{x \to a} g(x) = M$, then:

$$\lim_{x \to a} [f(x) + g(x)] = L + M$$
$$\lim_{x \to a} [f(x) \cdot g(x)] = L \cdot M$$
$$\lim_{x \to a} \frac{f(x)}{g(x)} = \frac{L}{M} \quad (M \neq 0)$$

**Proof of the sum law:**

Let $\varepsilon > 0$. We want $|f(x) + g(x) - (L + M)| < \varepsilon$.

By the triangle inequality: $|f(x) + g(x) - L - M| \leq |f(x) - L| + |g(x) - M|$.

If each term is less than $\varepsilon/2$, the sum is less than $\varepsilon$.

Since $\lim f = L$: $\exists \delta_1$ such that $0 < |x-a| < \delta_1 \implies |f(x) - L| < \varepsilon/2$.

Since $\lim g = M$: $\exists \delta_2$ such that $0 < |x-a| < \delta_2 \implies |g(x) - M| < \varepsilon/2$.

Choose $\delta = \min(\delta_1, \delta_2)$. Then for $0 < |x-a| < \delta$:

$$|f(x) + g(x) - (L+M)| \leq |f(x) - L| + |g(x) - M| < \frac{\varepsilon}{2} + \frac{\varepsilon}{2} = \varepsilon \quad \square$$

**The split $\varepsilon/2 + \varepsilon/2 = \varepsilon$ technique** appears in nearly every epsilon-delta proof. Notice the triangle inequality from M-006 is the key tool.

---

### Continuity

**Definition:** $f$ is **continuous at $a$** if:

$$\lim_{x \to a} f(x) = f(a)$$

Three conditions must simultaneously hold:
1. $f(a)$ is defined
2. $\lim_{x \to a} f(x)$ exists
3. The limit equals $f(a)$

**Continuity on an interval:** $f$ is continuous on $(a, b)$ if continuous at every point in $(a, b)$; on $[a, b]$ if continuous on $(a, b)$ and has the appropriate one-sided limits at the endpoints.

**Classes of continuous functions:**
- Polynomials are continuous everywhere (proved from limit laws)
- $e^x$, $\ln x$ (on $(0,\infty)$), $\sin x$, $\cos x$ — all continuous on their domains
- Sums, products, quotients (where denominator $\neq 0$), and compositions of continuous functions are continuous

**Why continuity matters:** A continuous function has no "jumps" — it cannot teleport from one value to another without passing through every intermediate value. This is the IVT.

---

### The Intermediate Value Theorem

**Theorem (IVT):** If $f$ is continuous on $[a, b]$ and $k$ is any value strictly between $f(a)$ and $f(b)$, then there exists $c \in (a, b)$ with $f(c) = k$.

Special case: if $f(a) < 0 < f(b)$ (or vice versa), there is a root in $(a, b)$.

**Proof idea:** (Full proof in Phase 16.) Consider $S = \{x \in [a,b] : f(x) < k\}$. The set $S$ is non-empty (since $a \in S$ if $f(a) < k$) and bounded above by $b$. By the **completeness of $\mathbb{R}$** (M-044), $S$ has a supremum $c = \sup S$. Using continuity of $f$ at $c$, one shows $f(c) = k$. $\square$

**Why completeness is required:** The rational numbers $\mathbb{Q}$ are not complete. The function $f(x) = x^2 - 2$ is continuous on $[1, 2]$ with $f(1) = -1 < 0$ and $f(2) = 2 > 0$. If we worked in $\mathbb{Q}$, the "root" $\sqrt{2}$ is not in $\mathbb{Q}$, so IVT would fail in $\mathbb{Q}$. The theorem requires the number line to have no "gaps" — that is exactly what completeness says.

**Why IVT matters:** It guarantees root existence without finding the root. This is the theoretical foundation of every numerical root-finding algorithm (bisection, Newton's method, Brent's method). You cannot compute the root to arbitrary precision without knowing it exists first.

---

### Bisection: IVT as an Algorithm

The bisection method converts the IVT proof into a root-finding algorithm:

1. Find $[a, b]$ with $f(a)$ and $f(b)$ having opposite signs.
2. Let $m = (a+b)/2$.
3. If $f(a)$ and $f(m)$ have opposite signs, the root is in $[a, m]$. Set $b = m$.
4. Otherwise, the root is in $[m, b]$. Set $a = m$.
5. Repeat until the interval is smaller than your tolerance.

After $n$ bisections: error $\leq (b-a)/2^n$. To achieve 10 decimal digits of accuracy: $n \approx 33$ iterations.

```python
import math

def bisection(f, a, b, tolerance=1e-12, max_iterations=200):
    """
    Find a root of f in [a, b] using the Intermediate Value Theorem.
    
    IVT precondition: f(a) and f(b) have opposite signs.
    After n bisections: guaranteed error ≤ (b-a) / 2^n.
    
    This is a direct implementation of the IVT proof: at each step
    we know a root exists in the current interval (IVT), and we
    halve the interval, keeping the half that must contain the root.
    """
    assert f(a) * f(b) < 0, (
        f"IVT precondition failed: f({a}) = {f(a):.4f}, f({b}) = {f(b):.4f}\n"
        "Need opposite signs."
    )

    initial_interval = b - a
    for iteration in range(1, max_iterations + 1):
        midpoint   = (a + b) / 2
        f_mid      = f(midpoint)
        interval   = b - a
        error_bound = interval / 2

        if abs(f_mid) < tolerance or error_bound < tolerance:
            return midpoint, iteration, error_bound

        # IVT: keep the half where the sign change occurs
        if f(a) * f_mid < 0:
            b = midpoint     # root is in left half
        else:
            a = midpoint     # root is in right half

    return (a + b) / 2, max_iterations, (b - a) / 2


print("=== Bisection Method: IVT in Action ===")
print()

# Find sqrt(2) as a root of x^2 - 2 = 0
print("Example 1: sqrt(2) = root of f(x) = x^2 - 2 on [1, 2]")
print(f"f(1) = {1**2 - 2:.1f}  (negative)")
print(f"f(2) = {2**2 - 2:.1f}  (positive)")
print(f"IVT guarantees a root exists. Bisection finds it:")
print()
root, iters, err_bound = bisection(lambda x: x**2 - 2, 1, 2)
print(f"  Root:        {root:.15f}")
print(f"  sqrt(2):     {math.sqrt(2):.15f}")
print(f"  Error:       {abs(root - math.sqrt(2)):.2e}")
print(f"  Iterations:  {iters}")
print(f"  Error bound: {err_bound:.2e}")
print()

# Show convergence step by step
print("Convergence trace (first 12 iterations):")
a_trace, b_trace = 1.0, 2.0
print(f"{'Iter':>5}  {'a':>18}  {'b':>18}  {'midpoint':>18}  {'error':>12}")
f = lambda x: x**2 - 2
for i in range(1, 13):
    m = (a_trace + b_trace) / 2
    err = abs(m - math.sqrt(2))
    print(f"{i:>5}  {a_trace:>18.14f}  {b_trace:>18.14f}  {m:>18.14f}  {err:>12.2e}")
    if f(a_trace) * f(m) < 0:
        b_trace = m
    else:
        a_trace = m

print()

# Example 2: root of cos(x) = x (fixed point)
print("Example 2: root of g(x) = cos(x) - x on [0, 1]")
print(f"g(0) = {math.cos(0) - 0:.4f}  (positive)")
print(f"g(1) = {math.cos(1) - 1:.4f}  (negative)")
root2, iters2, _ = bisection(lambda x: math.cos(x) - x, 0, 1)
print(f"  Root: {root2:.15f}")
print(f"  Verify: cos({root2:.10f}) = {math.cos(root2):.15f}")
print(f"  (The root satisfies cos(x) = x — the 'Dottie number')")
```

**Walkthrough:** The bisection function implements the IVT directly. The `assert` statement checks the IVT precondition — without opposite signs, the theorem gives no guarantee. At each iteration, we compute the midpoint and check which half has the sign change. After 12 iterations, the interval has shrunk by a factor of $2^{12} = 4096$, and the error is below $10^{-3}$. After 50 iterations: below $10^{-15}$ — full double-precision floating-point accuracy.

---

## Connect the Pieces

**Backwards:** The IVT depends on completeness of $\mathbb{R}$ (M-004 introduced ordering; full proof in M-044). Limit laws use the triangle inequality (M-006). Continuity uses the limit definition (M-016).

**Forwards:**
- M-020 (Mean Value Theorem): requires continuity on $[a,b]$ and differentiability on $(a,b)$.
- M-021 (Riemann Integral): the integral of a continuous function exists — proved using IVT's consequence (extreme value theorem).
- M-017 enables M-018: derivatives are defined as limits; continuity of the function is needed in some derivative theorems.

---

## What Breaks Without This

Without the IVT:
- Bisection has no theoretical guarantee — you cannot prove the root exists before you find it.
- Every numerical method that says "the root is in this interval" assumes IVT.
- The Mean Value Theorem, Rolle's Theorem, and the entire theory of optimisation require IVT (via continuity on closed intervals).

---

## Definition of Done

- [ ] You can prove the limit sum law from the epsilon-delta definition, citing the triangle inequality
- [ ] You can state the three conditions for continuity at a point
- [ ] You can state the IVT and explain what completeness of $\mathbb{R}$ has to do with it
- [ ] You ran the Python bisection algorithm and can trace the first 3 iterations manually
- [ ] You understand the error formula: after $n$ bisections, error $\leq (b-a)/2^n$

**Proof reconstruction (Sunday):** State the IVT. Explain in your own words why the proof requires the completeness of $\mathbb{R}$ (i.e., why the theorem fails in $\mathbb{Q}$). Then: use bisection by hand to find $\sqrt{3}$ to 3 decimal places.

---

## Answers to Quick Check

1. $f(x) = x^2$ is continuous everywhere (polynomial). $g(x) = 1/x$ is continuous on $\mathbb{R} \setminus \{0\}$ but not at $x = 0$ (undefined there).
2. No — by the IVT, a continuous function on $[0, 1]$ with $f(0) = -1$ and $f(1) = 2$ must pass through 0 somewhere in $(0, 1)$.
3. (1) $f(a)$ is defined; (2) $\lim_{x \to a} f(x)$ exists; (3) the limit equals $f(a)$.
