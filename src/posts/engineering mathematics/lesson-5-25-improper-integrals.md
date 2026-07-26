# Stage 5, Lesson 5.25 — Improper Integrals
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 16 closed with `sp.limit(impulse_finite, T, sp.oo)` — taking
a definite integral's upper bound to infinity, presented then as "a
direct, deliberate forward reference." This lesson formalizes that
move properly. An **improper integral** extends the definite integral
(Lesson 13) to infinite limits of integration or to integrands with
a discontinuity (typically a vertical asymptote) somewhere inside the
interval — both handled the same way: replace the problematic bound
with a variable, integrate normally, then take a limit (Lesson 1).
Some improper integrals **converge** to a finite value; others
**diverge**. By the end of this lesson you can evaluate both types of
improper integral, apply the p-test to quickly determine convergence
without full evaluation, and finish Lesson 16's damped-force impulse
calculation as a genuine, properly-justified improper integral — plus
see a first glimpse of why probability distributions (Stage 6) rely
on exactly this machinery to guarantee total probability equals
exactly 1.

---

## What You Need To Know First

- **Limits at infinity** — Lesson 1/5.2.
- **FTC, definite integrals** — Lesson 13, 5.14.
- **The unfinished impulse calculation** — Lesson 16's closing
  example, completed properly here.

---

## The Lesson

### Type 1: Infinite Limits of Integration

$$\int_a^\infty f(x)\,dx = \lim_{t\to\infty}\int_a^t f(x)\,dx$$

If the limit exists (is a finite number), the integral **converges**
to that value. If the limit is infinite or doesn't exist, the
integral **diverges**.

**Hand-worked example:** $\displaystyle\int_1^\infty\frac{1}{x^2}\,dx$.

$$\int_1^t\frac{1}{x^2}\,dx = \left[-\frac1x\right]_1^t = -\frac1t+1$$

$$\lim_{t\to\infty}\left(1-\frac1t\right) = 1$$

**Converges to exactly 1** — a finite area under an infinitely long
curve, a genuinely non-obvious fact worth pausing on: even though the
region extends forever in the $x$-direction, its total area is
finite, because the curve shrinks fast enough.

```python
import sympy as sp

x, t = sp.symbols('x t', positive=True)
integral_to_t = sp.integrate(1/x**2, (x, 1, t))
print(f"∫₁ᵗ 1/x² dx = {integral_to_t}")

limit_result = sp.limit(integral_to_t, t, sp.oo)
print(f"Limit as t→∞: {limit_result}")

# sympy can also evaluate the improper integral directly
direct = sp.integrate(1/x**2, (x, 1, sp.oo))
print(f"Direct: {direct}")
```

**Contrast:** $\displaystyle\int_1^\infty\frac1x\,dx$.

```python
import sympy as sp

x, t = sp.symbols('x t', positive=True)
integral_to_t = sp.integrate(1/x, (x, 1, t))
print(f"∫₁ᵗ 1/x dx = {integral_to_t}")
limit_result = sp.limit(integral_to_t, t, sp.oo)
print(f"Limit as t→∞: {limit_result}")
```

Output:

```
∫₁ᵗ 1/x dx = log(t)
Limit as t→∞: oo
```

**Diverges** — $\ln t$ grows without bound, however slowly. This is a
famously delicate fact: $1/x$ and $1/x^2$ look similar, but one gives
a finite area under an infinite region and the other doesn't — the
difference between them is precisely what the p-test below
generalizes.

---

### The p-test

$$\int_1^\infty \frac{1}{x^p}\,dx \text{ converges if } p>1,\ \text{diverges if } p\le1$$

```python
import sympy as sp

x, t, p = sp.symbols('x t p', positive=True)
for p_val in [0.5, 1, 1.5, 2, 3]:
    integral_to_t = sp.integrate(1/x**p_val, (x, 1, t))
    limit_result = sp.limit(integral_to_t, t, sp.oo)
    status = 'converges' if limit_result.is_finite else 'diverges'
    print(f"p={p_val}: {status} (value: {limit_result})")
```

**Why this threshold at $p=1$ makes sense**: $\int x^{-p}dx =
\dfrac{x^{1-p}}{1-p}$ (power rule, Lesson 4) — as $x\to\infty$, this
grows without bound whenever the exponent $1-p>0$ (i.e., $p<1$), and
shrinks toward zero whenever $1-p<0$ (i.e., $p>1$). At exactly $p=1$
the power rule's formula breaks down entirely (division by
$1-p=0$) — which is precisely why $1/x$ needs the separate $\ln x$
antiderivative and behaves as the delicate boundary case.

---

### Type 2: Discontinuous Integrands

If $f$ has a vertical asymptote at some point $c$ within (or at the
edge of) the interval of integration, split at $c$ and take a
**one-sided limit** approaching it — precisely Lesson 1's one-sided
limit machinery, doing genuine work here.

**Hand-worked example:** $\displaystyle\int_0^1\frac{1}{\sqrt x}\,dx$
($f$ has a vertical asymptote at $x=0$, the interval's own left edge).

$$\int_0^1 x^{-1/2}\,dx = \lim_{t\to0^+}\int_t^1x^{-1/2}\,dx = \lim_{t\to0^+}\Big[2\sqrt x\Big]_t^1 = \lim_{t\to0^+}(2-2\sqrt t) = 2$$

```python
import sympy as sp

x, t = sp.symbols('x t', positive=True)
integral_from_t = sp.integrate(x**sp.Rational(-1,2), (x, t, 1))
print(f"∫ₜ¹ x^(-1/2) dx = {integral_from_t}")
limit_result = sp.limit(integral_from_t, t, 0, dir='+')
print(f"Limit as t→0⁺: {limit_result}")
```

**The analogous p-test for this case**:

$$\int_0^1\frac{1}{x^p}\,dx \text{ converges if } p<1,\ \text{diverges if } p\ge1$$

— note the inequality **flips direction** compared to the
infinite-interval version, a genuine, easy-to-misremember distinction
worth stating explicitly rather than assuming symmetry.

```python
import sympy as sp

x, t = sp.symbols('x t', positive=True)
for p_val in [0.5, 1, 1.5]:
    integral_from_t = sp.integrate(1/x**p_val, (x, t, 1))
    limit_result = sp.limit(integral_from_t, t, 0, dir='+')
    status = 'converges' if limit_result.is_finite else 'diverges'
    print(f"p={p_val} near 0: {status} (value: {limit_result})")
```

---

### The Comparison Test

Sometimes an integral's exact value is hard to find, but its
**convergence** can still be determined by comparing it to a simpler
integral with known behavior: if $0\le f(x)\le g(x)$ and
$\int g(x)\,dx$ converges, then $\int f(x)\,dx$ converges too (it's
"squeezed under" a finite area — a direct descendant of the Squeeze
Theorem's spirit, Lesson 2, applied to areas instead of function
values). Conversely, if $f(x)\ge g(x)\ge0$ and $\int g(x)\,dx$
diverges, so does $\int f(x)\,dx$.

```python
import sympy as sp

x = sp.symbols('x', positive=True)
# e^(-x^2) has no elementary antiderivative (Lesson 14), but its
# convergence on [1,∞) can be confirmed by comparison, without ever
# finding the exact value
# For x >= 1: e^(-x²) <= e^(-x), and ∫₁^∞ e^(-x) dx is easy
comparison_integral = sp.integrate(sp.exp(-x), (x, 1, sp.oo))
print(f"∫₁^∞ e^(-x) dx = {comparison_integral} (converges)")
print(f"Since e^(-x²) ≤ e^(-x) for x≥1, ∫₁^∞ e^(-x²) dx also converges")

# sympy can confirm this directly (using the error function from Lesson 14)
direct = sp.integrate(sp.exp(-x**2), (x, 1, sp.oo))
print(f"Direct confirmation: {direct} ≈ {float(direct):.6f}")
```

---

### Completing Lesson 16's Impulse Calculation

Lesson 16 computed the total impulse from $F(t)=F_0te^{-kt}$ over a
finite window $[0,T]$ and took a limit as $T\to\infty$ — exactly an
improper integral, now properly named and justified.

```python
import sympy as sp

t, F0, k = sp.symbols('t F0 k', positive=True)
F = F0 * t * sp.exp(-k*t)

# The proper, formal improper integral -- directly, rather than via
# a separately-computed finite-window formula and a manual limit
total_impulse = sp.integrate(F, (t, 0, sp.oo))
print(f"∫₀^∞ F₀t e^(-kt) dt = {total_impulse}")

numeric = total_impulse.subs({F0: 500, k: 2})
print(f"With F₀=500N, k=2/s: {numeric} N·s")
```

Output:

```
∫₀^∞ F₀t e^(-kt) dt = F0/k**2
total: 125 N·s
```

Matches Lesson 16's Challenge 3 test exactly (`F0/k**2`) — confirming
the informal "take $T$ large" numerical approach from that lesson and
this lesson's formal improper-integral machinery agree completely,
now with the proper convergence justification (the exponential decay
$e^{-kt}$ guarantees convergence for any $k>0$, by a comparison-test
argument similar to the one used above).

---

### Forward Reference: Why Probability Distributions Need This

A continuous probability distribution's density function $\rho(x)$
must satisfy $\int_{-\infty}^{\infty}\rho(x)\,dx=1$ — total probability
across every possible outcome must equal exactly 1. For a distribution
defined over an infinite range (the normal/Gaussian distribution,
central to Stage 6's statistics, being the most important example),
this is **necessarily an improper integral** — and the fact that it
converges to exactly 1, not some other finite number or infinity, is
a genuine, nontrivial mathematical fact (not automatic just because a
formula "looks like" a valid density) that Stage 6 will rely on this
lesson's machinery to establish properly.

```python
import sympy as sp

x = sp.symbols('x', real=True)
gaussian = sp.exp(-x**2/2) / sp.sqrt(2*sp.pi)
total_probability = sp.integrate(gaussian, (x, -sp.oo, sp.oo))
print(f"∫_{{-∞}}^∞ (standard normal density) dx = {total_probability}")
```

```
∫_{-∞}^∞ (standard normal density) dx = 1
```

Exactly 1 — the defining property of a valid probability density,
confirmed here as a genuine improper integral computation, a direct
and honest preview of Stage 6's statistical machinery resting on
exactly this stage's tools.

---

## Connect the Pieces

Concrete trace: total impulse from a damped force, properly justified.

1. **Type 1 improper integral**: $\int_0^\infty F_0te^{-kt}\,dt$, an
   infinite upper limit — formally $\lim_{T\to\infty}\int_0^TF(t)\,dt$.
2. **Convergence**: guaranteed by the exponential decay outpacing the
   polynomial growth of $t$ — the same kind of comparison-test
   reasoning used for $e^{-x^2}$ earlier in this lesson.
3. **Evaluation**: `sp.integrate` handles the limit internally,
   producing $F_0/k^2$ directly, matching Lesson 16's
   separately-computed finite-window-then-limit approach exactly.
4. **Broader pattern**: the identical infinite-limit machinery
   underlies the normal distribution's total-probability guarantee —
   the same tool, a genuinely different but structurally identical
   application, waiting in Stage 6.

---

## Summary

**Type 1 (infinite limits)**: $\int_a^\infty f\,dx=\lim_{t\to\infty}
\int_a^tf\,dx$ — converges to a finite value or diverges.

**Type 2 (discontinuous integrand)**: split at the discontinuity,
take a one-sided limit — direct reuse of Lesson 1's one-sided limit
machinery.

**p-test**: $\int_1^\infty x^{-p}dx$ converges iff $p>1$;
$\int_0^1x^{-p}dx$ converges iff $p<1$ — inequality direction flips
between the two cases.

**Comparison test**: bound an intractable integrand above/below by a
known-convergent/divergent one — Squeeze Theorem's spirit, applied to
areas.

**Completion**: Lesson 16's impulse calculation is a genuine,
properly convergent improper integral, giving exactly $F_0/k^2$.

**Forward reference**: probability density functions' total-area-
equals-1 property (Stage 6) is fundamentally an improper integral
convergence fact, previewed here via the normal distribution.

**New Python/CS concepts:**
- `sp.limit(..., dir='+')` — explicit one-sided limit direction
- `sp.integrate` with `sp.oo` bounds, computing improper integrals
  directly rather than via a manually-constructed limit

---

## Problems

### Math

**1.** Determine whether $\int_1^\infty\dfrac{1}{x^{1.5}}\,dx$
converges, and find its value if so.

<details><summary>Answer</summary>
$p=1.5>1$: converges. $\int_1^tx^{-1.5}dx=[-2x^{-0.5}]_1^t=
-\frac{2}{\sqrt t}+2\to2$ as $t\to\infty$. Value: $2$.
</details>

---

**2.** Determine whether $\int_0^1\dfrac{1}{x^3}\,dx$ converges.

<details><summary>Answer</summary>
$p=3\ge1$ for the near-zero p-test: diverges.
</details>

---

**3.** Use comparison to argue (without computing exactly) that
$\int_1^\infty\dfrac{1}{x^2+1}\,dx$ converges.

<details><summary>Answer</summary>
For $x\ge1$: $\dfrac{1}{x^2+1}\le\dfrac{1}{x^2}$ (a larger denominator
gives a smaller fraction), and $\int_1^\infty\frac{1}{x^2}dx$
converges (this lesson's opening example). By the comparison test,
$\int_1^\infty\frac{1}{x^2+1}dx$ converges too.
</details>

---

### Code Challenges

**Challenge 1 — Improper integral evaluator**

```python
import sympy as sp

def evaluate_improper(f_expr, var, a, b):
    """
    Evaluate an improper integral where a and/or b may be sp.oo or
    -sp.oo, or where the integrand has a discontinuity at an endpoint.
    Return (value, converges: bool).
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x', positive=True)
val, conv = evaluate_improper(1/x**2, x, 1, sp.oo)
assert conv and val == 1

val2, conv2 = evaluate_improper(1/x, x, 1, sp.oo)
assert not conv2
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — p-test checker**

```python
def p_test(p, near_zero=False):
    """
    Return True if the corresponding improper integral converges,
    per the p-test (near_zero=False: [1,∞); near_zero=True: (0,1]).
    """
    pass

# --- tests: do not modify ---
assert p_test(2, near_zero=False)
assert not p_test(1, near_zero=False)
assert p_test(0.5, near_zero=True)
assert not p_test(1, near_zero=True)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Numerical convergence tracer**

```python
import numpy as np

def trace_convergence(f, a, t_values):
    """
    Numerically integrate f from a to each t in t_values (using
    np.trapz on a fine grid), returning the list of estimates --
    useful for visually confirming convergence/divergence.
    """
    pass

# --- tests: do not modify ---
f = lambda x: 1/x**2
estimates = trace_convergence(f, 1, [10, 100, 1000, 10000])
assert estimates[-1] > 0.9 and estimates[-1] < 1.0   # approaching 1
assert estimates[-1] > estimates[0]   # monotonically increasing toward the limit
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove, using the comparison test, that
$\int_1^\infty\dfrac{2+\sin x}{x^2}\,dx$ converges, despite $\sin x$
making the integrand oscillate and preventing a clean antiderivative
from being the obvious approach.

<details><summary>Answer</summary>
Since $-1\le\sin x\le1$ always, $1\le2+\sin x\le3$ for every $x$, so
$$0 \le \frac{2+\sin x}{x^2} \le \frac{3}{x^2}$$
And $\int_1^\infty\frac{3}{x^2}dx = 3\int_1^\infty\frac1{x^2}dx =
3(1)=3$ converges (this lesson's opening result, scaled by the
constant-multiple property from Lesson 13). By the comparison test,
since the original integrand is squeezed between $0$ and a
convergent integral's integrand, $\int_1^\infty\frac{2+\sin x}{x^2}dx$
converges too. $\blacksquare$ Note this argument establishes
*convergence* without ever finding the *exact value* — a genuinely
different and often more practical goal than full evaluation,
especially for integrands (like this one) that combine oscillation
with no clean elementary antiderivative.
</details>
