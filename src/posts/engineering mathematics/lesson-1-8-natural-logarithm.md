# Stage 1, Lesson 1.8 — The Natural Logarithm $\ln$
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Lesson 1.7 introduced the exponential function $e^x$: it takes an
exponent and produces a value. The natural logarithm $\ln x$ is the
inverse: it takes a value and produces the exponent that $e$ must be
raised to in order to produce it. If $e^2 \approx 7.389$, then
$\ln(7.389) \approx 2$. That simple reversal has far-reaching
consequences. The natural logarithm is the function that appears in
every rate calculation involving $e$: the half-life of a radioactive
isotope, the time constant of a circuit, the entropy of a probability
distribution, the complexity class of binary search. By the end of
this lesson you can state the definition of $\ln$ as an inverse
function, derive and use its domain, range, and graph, prove and
apply the three logarithm laws, use $\ln$ to solve exponential
equations, and implement these calculations in code.

---

## Historical Context

The natural logarithm was recognised as the "area under the hyperbola
$1/t$ from $t=1$ to $t=x$" by Grégoire de Saint-Vincent in 1647,
before calculus was formalised. The precise connection is
$\ln x = \int_1^x (1/t)\,dt$ (proved in Lesson 5.16). John Napier's
1614 logarithm tables used a different base — his logarithm was
related to $1/e$, not $e$ — but the concept of converting
multiplication to addition was already central. Euler, in 1748,
established $\ln$ as the inverse of $e^x$ in the modern sense and
proved $(d/dx)\ln x = 1/x$ — the result linking $\ln$ to the area
interpretation. The notation "$\ln$" stands for "logarithmus
naturalis"; pure mathematics sometimes writes $\log x$ with base $e$
understood, while engineering reserves $\log$ for base 10.

---

## What You Need To Know First

- **Inverse functions** — Lesson 0.8. $\ln$ is the inverse of $e^x$;
  the composition identities $\ln(e^x) = x$ and $e^{\ln x} = x$
  follow directly from the definition of inverse.
- **The number $e$** — Lesson 1.7. $\ln$ is defined as the inverse of
  $e^x$; it cannot be understood separately from $e$.
- **Bijectivity** — Lesson 0.7. $e^x: \mathbb{R} \to (0,\infty)$ is
  bijective, which is why its inverse exists as a function with domain
  $(0,\infty)$.

---

## The Lesson

### Definition: $\ln$ as Inverse of $e^x$

We need a function that answers the question "which exponent does $e$
need?" Given a positive number $x$, there is exactly one real number
$y$ satisfying $e^y = x$ — because $e^y$ is strictly increasing
and covers all of $(0,\infty)$. That unique $y$ is $\ln x$.

**Definition:** The **natural logarithm** $\ln x$ is the inverse
function of $e^x$:

$$y = \ln x \iff e^y = x, \qquad x > 0$$

**Formal lens:**
$$\ln: (0, \infty) \to \mathbb{R}$$

- **Domain:** $(0,\infty)$ — only positive numbers have a natural logarithm.
- **Range:** $\mathbb{R}$ — $\ln x$ can be any real number.

These follow directly from the domain and range of $e^y$: the domain
of $e^y$ is $\mathbb{R}$ (this becomes the range of $\ln$), and the
range of $e^y$ is $(0,\infty)$ (this becomes the domain of $\ln$).

**The two cancellation identities** — the definition of "inverse" applied:

$$\ln(e^x) = x \qquad \text{for all } x \in \mathbb{R}$$
$$e^{\ln x} = x \qquad \text{for all } x > 0$$

These are not separate facts to memorise. They are the single statement
"$\ln$ and $e^x$ are inverses" written in both directions.

**Key values** — each follows from $e^y = x$:

| Expression | Value | Because |
|------------|-------|---------|
| $\ln 1$ | $0$ | $e^0 = 1$ |
| $\ln e$ | $1$ | $e^1 = e$ |
| $\ln(e^2)$ | $2$ | $e^2 = e^2$ |
| $\ln(1/e)$ | $-1$ | $e^{-1} = 1/e$ |
| $\ln(e^{-5})$ | $-5$ | $e^{-5} = e^{-5}$ |

Pattern: $\ln x < 0$ when $x < 1$; $\ln 1 = 0$; $\ln x > 0$ when $x > 1$.

```python
import math
import numpy as np

# Verify the key values and cancellation identities
print("Key values of ln:")
for x, expected, reason in [
    (1,           0,      "ln(1) = 0 since e^0 = 1"),
    (math.e,      1,      "ln(e) = 1 since e^1 = e"),
    (math.e**2,   2,      "ln(e²) = 2"),
    (1/math.e,   -1,      "ln(1/e) = -1"),
    (math.e**-5, -5,      "ln(e^{-5}) = -5"),
]:
    computed = math.log(x)   # math.log(x) is the natural logarithm (base e)
    print(f"  ln({x:<10.5f}) = {computed:>8.4f}  (expected {expected:>3})  — {reason}")

print("\nCancellation identities:")
for x in [-2, 0, 1, 2.5, 100]:
    # ln(e^x) = x
    result = math.log(math.exp(x))
    print(f"  ln(e^{x:>6.1f}) = {result:>8.4f}  (expected {x:>6.1f})")

print()
for x in [0.01, 1, math.e, 10, 100]:
    # e^(ln x) = x
    result = math.exp(math.log(x))
    print(f"  e^(ln {x:>8.4f}) = {result:>10.4f}  (expected {x:>8.4f})")
```

**Walkthrough:** `math.log(x)` computes the natural logarithm —
base $e$. This is a common source of confusion: in Python (and most
programming languages), `log` without qualification means $\ln$.
`math.log10(x)` gives base-10 logarithm. `math.exp(x)` computes
$e^x$. The two blocks verify both cancellation identities
numerically: $\ln(e^x) = x$ for several values of $x$, and
$e^{\ln x} = x$ for several positive values of $x$.

---

### The Graph of $\ln x$

**Geometric lens:** The graph of $\ln x$ is the reflection of $e^x$
across the line $y = x$. Every geometric property of $e^x$ has a
corresponding property of $\ln x$ obtained by swapping $x$ and $y$.

| Property of $e^x$ | Corresponding property of $\ln x$ |
|-------------------|-----------------------------------|
| Domain: $\mathbb{R}$; Range: $(0,\infty)$ | Domain: $(0,\infty)$; Range: $\mathbb{R}$ |
| Passes through $(0, 1)$ | Passes through $(1, 0)$ |
| Passes through $(1, e)$ | Passes through $(e, 1)$ |
| Horizontal asymptote $y=0$ as $x\to -\infty$ | Vertical asymptote $x=0$ as $x\to 0^+$ |
| Increasing: larger $x$ gives larger output | Increasing: larger $x$ gives larger output |
| Grows rapidly as $x\to+\infty$ | Grows very slowly (sub-polynomial) as $x\to+\infty$ |

The last entry is important in CS: $\ln n$ grows slower than any
positive power of $n$ — slower than $\sqrt{n}$, slower than $n^{0.01}$.
This is why $O(\log n)$ algorithms scale to enormous inputs.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

x_exp = np.linspace(-3, 3.2, 500)
x_ln  = np.linspace(0.01, 8, 500)
# x_ln starts at 0.01, not 0 -- ln(0) is undefined (vertical asymptote at x=0)

fig, ax = plt.subplots(figsize=(8, 8))

ax.plot(x_exp, np.exp(x_exp), color='#2980b9', lw=2.5, label='$y = e^x$')
ax.plot(x_ln,  np.log(x_ln),  color='#e74c3c', lw=2.5, label='$y = \\ln x$')
# np.log(x): natural logarithm (base e) applied element-wise
ax.plot([-3, 8], [-3, 8], color='#aaaaaa', lw=1.2, linestyle='--',
        label='$y = x$ (reflection line)')
ax.axhline(0, color='#333', lw=0.7); ax.axvline(0, color='#333', lw=0.7)

# Mark corresponding key points (related by swapping x and y)
for (x0, y0), label in [
    ((0, 1),      '$(0,1)$ ↔ $(1,0)$'),
    ((1, math.e), '$(1,e)$ ↔ $(e,1)$'),
]:
    ax.plot(x0, y0, 'o', color='#2980b9', markersize=8, zorder=6)
    ax.plot(y0, x0, 'o', color='#e74c3c', markersize=8, zorder=6)
    ax.annotate(label, xy=((x0+y0)/2, (y0+x0)/2),
                xytext=((x0+y0)/2 + 0.4, (y0+x0)/2 + 0.3),
                fontsize=8, color='#555')

ax.set_xlim(-3, 8); ax.set_ylim(-3, 8)
ax.set_aspect('equal')   # equal scales so the y=x line looks at 45°
ax.set_title('$e^x$ and $\\ln x$ are reflections across $y = x$\n'
             'Swapping $x$ and $y$ converts every property of one to the other',
             fontsize=11)
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `np.log(x)` applies the natural logarithm to every
element of the array `x_ln`. `ax.set_aspect('equal')` makes the $x$
and $y$ scales identical so the reflection line $y = x$ is visually
at 45° — without equal scales the reflection would look distorted.
Corresponding points of $e^x$ and $\ln x$ appear in pairs where the
coordinates are swapped: $(0, 1)$ on the $e^x$ curve corresponds to
$(1, 0)$ on the $\ln x$ curve.

---

### The Three Logarithm Laws

The key algebraic properties of $\ln$ follow from the properties of
$e^x$. Each law converts one type of expression (product, quotient,
power) into a simpler arithmetic operation (sum, difference, product).
This is not a coincidence — it is the same mechanism that made logarithm
tables so useful: turning multiplication into addition.

**Law 1 — Product law:**

$$\ln(MN) = \ln M + \ln N, \qquad M, N > 0$$

*Proof:* Let $p = \ln M$ and $q = \ln N$, so $e^p = M$ and $e^q = N$.

Then $MN = e^p \cdot e^q = e^{p+q}$ (exponent addition rule for $e^x$).

Taking $\ln$ of both sides: $\ln(MN) = p + q = \ln M + \ln N$. $\blacksquare$

**Law 2 — Quotient law:**

$$\ln\!\left(\frac{M}{N}\right) = \ln M - \ln N, \qquad M, N > 0$$

*Proof:* $M/N = e^p / e^q = e^{p-q}$, so $\ln(M/N) = p - q$. $\blacksquare$

**Law 3 — Power law:**

$$\ln(M^r) = r\,\ln M, \qquad M > 0,\; r \in \mathbb{R}$$

*Proof:* $M = e^p$ so $M^r = (e^p)^r = e^{pr}$, giving
$\ln(M^r) = pr = r\ln M$. $\blacksquare$

**The pattern:** all three proofs use the same two steps —
translate to exponents using $M = e^{\ln M}$, apply an exponent
rule, translate back. The logarithm laws are the exponent laws
written in a different notation.

**Hand-worked example:** Simplify $\ln(8) - \ln(2) + \ln(e^3)$.

$$\ln(8) - \ln(2) + \ln(e^3)$$
$$= \ln\!\left(\frac{8}{2}\right) + 3 \qquad \text{(quotient law; power law)}$$
$$= \ln(4) + 3$$
$$= \ln(2^2) + 3$$
$$= 2\ln 2 + 3 \approx 2(0.6931) + 3 = 4.3863$$

**Verify:** $\ln(8) - \ln(2) + 3 = 2.0794 - 0.6931 + 3 = 4.3863$. ✓

**The change of base formula** — a consequence of Law 3:

$$\log_b x = \frac{\ln x}{\ln b}$$

*Derivation:* Let $y = \log_b x$, so $b^y = x$. Take $\ln$ of both
sides: $y\ln b = \ln x$, giving $y = \ln x / \ln b$. $\blacksquare$

This is how calculators and code compute $\log_b x$ for any base $b$:
two natural logs and a division.

```python
import math

# Verify all three laws
M, N = 6.0, 4.0
r = 2.5

print("=== Law 1: ln(MN) = ln(M) + ln(N) ===")
lhs = math.log(M * N)
rhs = math.log(M) + math.log(N)
print(f"  ln({M}*{N}) = ln({M*N}) = {lhs:.8f}")
print(f"  ln({M}) + ln({N}) = {math.log(M):.8f} + {math.log(N):.8f} = {rhs:.8f}")
print(f"  Match (< 1e-12): {abs(lhs - rhs) < 1e-12}\n")

print("=== Law 2: ln(M/N) = ln(M) - ln(N) ===")
lhs = math.log(M / N)
rhs = math.log(M) - math.log(N)
print(f"  ln({M}/{N}) = {lhs:.8f}")
print(f"  ln({M}) - ln({N}) = {rhs:.8f}")
print(f"  Match: {abs(lhs - rhs) < 1e-12}\n")

print(f"=== Law 3: ln(M^r) = r*ln(M), r={r} ===")
lhs = math.log(M**r)
rhs = r * math.log(M)
print(f"  ln({M}^{r}) = {lhs:.8f}")
print(f"  {r} * ln({M}) = {rhs:.8f}")
print(f"  Match: {abs(lhs - rhs) < 1e-12}\n")

print("=== Change of base: log_b(x) = ln(x)/ln(b) ===")
for x, b in [(32, 2), (1000, 10), (81, 3), (625, 5)]:
    via_ln    = math.log(x) / math.log(b)    # change of base
    via_python = math.log(x, b)              # Python's built-in log(x, b)
    print(f"  log_{b}({x}) = {via_ln:.6f}  "
          f"(Python log({x},{b}) = {via_python:.6f}, "
          f"exact = {round(via_ln)})")
```

**Walkthrough:** `math.log(x)` is always natural log (base $e$).
`math.log(x, b)` is Python's two-argument form that computes
$\log_b x$ directly, but internally it uses the change-of-base
formula $\ln x / \ln b$. Writing it out explicitly makes the
formula visible. `abs(lhs - rhs) < 1e-12` is the floating-point
equality check — exact equality fails due to rounding at the last
bit; tolerance `1e-12` confirms agreement to 12 decimal places.

---

### Solving Equations with $\ln$ and $e^x$

The fundamental technique: to isolate a variable in an exponent,
take $\ln$ of both sides. To isolate a variable inside a $\ln$,
apply $e^{(\cdot)}$ to both sides.

**Pattern 1 — Variable in exponent:** solve $e^{kt} = C$.

$$e^{kt} = C \implies \ln(e^{kt}) = \ln C \implies kt = \ln C \implies t = \frac{\ln C}{k}$$

**Hand-worked example:** Solve $e^{2t} = 7$.

$$kt = \ln C \implies 2t = \ln 7 \implies t = \frac{\ln 7}{2} \approx \frac{1.9459}{2} \approx 0.9730$$

Verify: $e^{2 \times 0.9730} = e^{1.9459} \approx 7$. ✓

**Pattern 2 — Variable inside $\ln$:** solve $\ln(f(x)) = c$.

$$\ln(f(x)) = c \implies e^{\ln(f(x))} = e^c \implies f(x) = e^c$$

**Hand-worked example:** Solve $\ln(3x - 1) = 4$.

$$3x - 1 = e^4 \implies 3x = e^4 + 1 \implies x = \frac{e^4 + 1}{3} \approx \frac{54.598 + 1}{3} \approx 18.533$$

Verify: $\ln(3 \times 18.533 - 1) = \ln(54.598) \approx 4$. ✓

**Pattern 3 — Half-life formula derived precisely.**

The continuous decay model is $A(t) = A_0\,e^{-\lambda t}$.
The half-life $T_{1/2}$ satisfies $A(T_{1/2}) = A_0/2$:

$$A_0\,e^{-\lambda T_{1/2}} = \frac{A_0}{2}
\implies e^{-\lambda T_{1/2}} = \frac{1}{2}
\implies -\lambda T_{1/2} = \ln\!\left(\frac{1}{2}\right) = -\ln 2
\implies T_{1/2} = \frac{\ln 2}{\lambda}$$

This is the **derived half-life formula**. $\ln 2 \approx 0.6931$,
so $T_{1/2} \approx 0.6931/\lambda$.

```python
import math

def solve_exp_equation(k, C):
    """
    Solve e^(k*t) = C for t.
    t = ln(C) / k
    k: float, coefficient in exponent (nonzero)
    C: float, right-hand side (must be positive)
    """
    if C <= 0:
        raise ValueError(f"C must be positive: e^(kt) is always > 0, cannot equal {C}")
    return math.log(C) / k

def solve_ln_equation(c):
    """
    Solve ln(x) = c for x.
    x = e^c
    """
    return math.exp(c)

def half_life(decay_constant):
    """
    Compute half-life T_{1/2} = ln(2) / lambda.
    decay_constant: lambda in A(t) = A0 * e^(-lambda * t), must be > 0
    """
    return math.log(2) / decay_constant

# Solve e^(2t) = 7
t = solve_exp_equation(k=2, C=7)
print(f"e^(2t) = 7:  t = ln(7)/2 = {t:.6f}")
print(f"  Verify: e^(2 * {t:.6f}) = {math.exp(2*t):.6f}  (expected 7)\n")

# Solve ln(3x-1) = 4
x = (solve_ln_equation(4) + 1) / 3
print(f"ln(3x-1) = 4:  x = (e^4+1)/3 = {x:.6f}")
print(f"  Verify: ln(3*{x:.4f} - 1) = {math.log(3*x-1):.6f}  (expected 4)\n")

# Physical examples
print("Half-life examples:")
for element, lam in [
    ("Carbon-14",    1.2097e-4),   # per year
    ("Radium-226",   4.33e-4),     # per year
    ("Uranium-238",  1.551e-10),   # per year
]:
    T = half_life(lam)
    print(f"  {element:15s}: λ = {lam:.4e}/yr  →  T₁/₂ = {T:,.0f} yr")
```

**Walkthrough:** `math.log(C) / k` computes $\ln C / k$ in one step.
`math.exp(c)` computes $e^c$. For the half-life loop, the format
specifier `{T:,.0f}` prints the result as an integer with thousands
commas (e.g., `5,730`). The accepted half-life of ${}^{14}$C is
5730 years; the formula with $\lambda = 1.2097 \times 10^{-4}$ per
year gives $\ln(2) / (1.2097 \times 10^{-4}) \approx 5730$.

---

### Logarithm Growth: Slower than Every Polynomial

**Physical/Computational lens:** The natural logarithm grows to
infinity as $x \to \infty$, but more slowly than any positive power
of $x$. For any $\varepsilon > 0$:

$$\lim_{x \to \infty} \frac{\ln x}{x^\varepsilon} = 0$$

This means $\ln x$ grows more slowly than $x^{0.001}$, more slowly
than $x^{0.0000001}$. In CS: an $O(\ln n)$ algorithm remains fast
even for $n = 10^{18}$ because $\ln(10^{18}) \approx 41.4$.

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(1, 1000, 500)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left: compare ln(x) to various powers of x
axes[0].plot(x, np.log(x),    color='#e74c3c', lw=2.5, label='$\\ln x$')
axes[0].plot(x, x**0.5,       color='#2980b9', lw=2,   label='$x^{0.5}$')
axes[0].plot(x, x**0.25,      color='#27ae60', lw=2,   label='$x^{0.25}$')
axes[0].plot(x, x**0.1,       color='#8e44ad', lw=2,   label='$x^{0.1}$')
axes[0].set_title('$\\ln x$ grows slower than $x^\\varepsilon$ for any $\\varepsilon > 0$',
                  fontsize=11)
axes[0].set_xlabel('$x$'); axes[0].set_ylabel('$y$')
axes[0].set_ylim(0, 32); axes[0].legend(fontsize=10); axes[0].grid(True, alpha=0.3)

# Right: binary search depth -- number of comparisons to search n items
ns = np.logspace(0, 18, 200)   # 1 to 10^18
depth = np.log2(ns)            # binary search depth = log2(n) = ln(n)/ln(2)
# np.log2(x): log base 2, element-wise

axes[1].semilogx(ns, depth, color='#e74c3c', lw=2.5)
# Mark: even at n = 10^18 (a million trillion), depth is only ~60 comparisons
axes[1].axvline(1e18, color='#555', lw=1, linestyle='--', alpha=0.7)
axes[1].axhline(np.log2(1e18), color='#555', lw=1, linestyle='--', alpha=0.7)
axes[1].annotate(f'$n=10^{{18}}$:\n{np.log2(1e18):.0f} comparisons',
                 xy=(1e18, np.log2(1e18)),
                 xytext=(1e12, 50),
                 arrowprops=dict(arrowstyle='->', color='#e74c3c'),
                 fontsize=9)
axes[1].set_xlabel('$n$ (number of items, log scale)')
axes[1].set_ylabel('Comparisons (binary search depth)')
axes[1].set_title('Binary search: $O(\\log_2 n)$ comparisons\nScales to astronomical inputs',
                  fontsize=11)
axes[1].grid(True, alpha=0.3)

plt.suptitle("$\\ln x$ grows slower than any power of $x$", fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `np.log2(ns)` computes $\log_2 n_i$ element-wise,
giving the exact depth of a binary search tree on $n$ elements.
`np.logspace(0, 18, 200)` generates $n$ values from $10^0 = 1$
to $10^{18}$ on a logarithmic scale — `semilogx` plots them on a
logarithmic $x$-axis, showing that binary search depth grows only
as $\log_2 n$, reaching just 60 comparisons even at $n = 10^{18}$.

---

### Common Errors with Logarithms

These errors appear in student work and in buggy code. Each is
a common confusion.

**Error 1:** $\ln(M + N) \neq \ln M + \ln N$.

The product law applies to products, not sums. $\ln(M + N)$ has no
general simplification. Example: $\ln(1 + 1) = \ln 2 \approx 0.693$,
but $\ln 1 + \ln 1 = 0$.

**Error 2:** $\ln(MN) \neq (\ln M)(\ln N)$.

The product law converts $\ln(MN)$ to a *sum* ($\ln M + \ln N$),
not a *product* of logs.

**Error 3:** $\frac{\ln M}{\ln N} \neq \ln(M/N)$.

The quotient law converts $\ln(M/N)$ to a *difference*. A ratio of
logs $\frac{\ln M}{\ln N}$ is what the change-of-base formula gives:
$\log_N M$, not $\ln(M/N)$.

**Error 4:** $(\ln M)^r \neq r\ln M$.

The power law applies to $\ln(M^r)$ — the argument raised to $r$ —
not to the logarithm itself raised to $r$.

```python
import math

M, N, r = 4.0, 2.0, 3.0

print("=== Common log errors (computing both sides to show inequality) ===\n")

print(f"Error 1: ln(M+N) vs ln(M)+ln(N)  [M={M}, N={N}]")
print(f"  ln({M+N:.0f})       = {math.log(M+N):.6f}")
print(f"  ln({M})+ln({N}) = {math.log(M)+math.log(N):.6f}   ← NOT equal\n")

print(f"Error 2: ln(M*N) vs ln(M)*ln(N)  [M={M}, N={N}]")
print(f"  ln({M*N:.0f})       = {math.log(M*N):.6f}")
print(f"  ln({M})*ln({N}) = {math.log(M)*math.log(N):.6f}   ← NOT equal\n")

print(f"Error 3: ln(M)/ln(N) vs ln(M/N)  [M={M}, N={N}]")
print(f"  ln({M})/ln({N}) = {math.log(M)/math.log(N):.6f}   (this is log_N(M) = log_{int(N)}({int(M)}) = 1)")
print(f"  ln({M}/{N})   = {math.log(M/N):.6f}   ← NOT equal\n")

print(f"Error 4: (ln M)^r vs ln(M^r)  [M={M}, r={r}]")
print(f"  (ln {M})^{r:.0f}   = {math.log(M)**r:.6f}")
print(f"  ln({M}^{r:.0f})   = {math.log(M**r):.6f} = {r:.0f}*ln({M}) = {r*math.log(M):.6f}   ← NOT equal")
```

**Walkthrough:** Each block computes both sides of a commonly
confused identity and prints them side by side to make the
inequality explicit. `math.log(M)/math.log(N)` is the change-of-base
formula, giving $\log_N M$ (here $\log_2 4 = 2$), not $\ln(M/N) = \ln(2)$.

---

## Connect the Pieces

**What this lesson built on:** Inverse functions (Lesson 0.8) — $\ln$
is exactly the inverse of $e^x$. Exponent rules (used in algebra) —
each logarithm law is one exponent rule written as a statement about
$\ln$. Bijectivity of $e^x$ (Lesson 1.6 and 1.7) — ensures $\ln$
is well-defined.

**What this lesson makes possible:** Lesson 1.9 (logarithm laws in
other bases) — the same three laws hold for $\log_b$ with identical
proofs via the change-of-base formula. Lesson 1.10 (exponential and
logarithmic equations) — all equation-solving techniques here will be
drilled further. Lesson 1.11 (logarithmic scales — decibels, pH,
Richter) — $\log_{10}$ with these laws applied to compressing ranges.
Lesson 5.8 (derivative of $\ln$) — proves $(d/dx)\ln x = 1/x$, which
also establishes $\ln x = \int_1^x (1/t)\,dt$.

**In engineering:** Every exponential model with an unknown exponent
is solved using $\ln$: charge time for a capacitor to 99% of supply
voltage ($t = -\tau \ln 0.01 \approx 4.6\tau$), time for a material
to cool to a safe handling temperature, age of a carbon sample from
its ${}^{14}$C fraction. All are $t = \ln(\text{something})/k$.

**In CS:** $\ln n$ (or $\log_2 n = \ln n / \ln 2$) measures the
depth of binary search, the height of balanced binary trees, and
the number of bits needed to represent $n$ distinct values. The
entropy $H = -\sum p_i \ln p_i$ of a probability distribution
(Lesson 8.11) uses natural log. Algorithm complexity $O(\log n)$ is
the same regardless of base because $\log_b n = \ln n / \ln b$ —
different bases differ only by a constant factor.

---

## Summary

**Definition:** $y = \ln x \iff e^y = x$. Domain $(0,\infty)$, range $\mathbb{R}$.

**Cancellation:** $\ln(e^x) = x$ and $e^{\ln x} = x$.

**Key values:** $\ln 1 = 0$; $\ln e = 1$; $\ln(e^k) = k$.

**Three laws** (all proved from exponent rules):
$$\ln(MN) = \ln M + \ln N$$
$$\ln(M/N) = \ln M - \ln N$$
$$\ln(M^r) = r\ln M$$

**Change of base:** $\log_b x = \dfrac{\ln x}{\ln b}$

**Solving $e^{kt} = C$:** $t = \dfrac{\ln C}{k}$

**Solving $\ln(f(x)) = c$:** $f(x) = e^c$

**Half-life (derived):** $T_{1/2} = \dfrac{\ln 2}{\lambda} \approx \dfrac{0.6931}{\lambda}$

**Growth rate:** $\ln x$ grows slower than $x^\varepsilon$ for any $\varepsilon > 0$.

**New Python:**
- `math.log(x)` — $\ln x$ (natural log, base $e$)
- `math.log(x, b)` — $\log_b x$ (Python's two-argument form)
- `math.log10(x)` — $\log_{10} x$; `math.log2(x)` — $\log_2 x$
- `np.log(x)` — $\ln x$ element-wise on arrays
- `np.log2(x)` — $\log_2 x$ element-wise

---

## Problems

### Math

**1.** Evaluate exactly — no calculator.

(a) $\ln(e^7)$ &emsp;
(b) $e^{\ln 5}$ &emsp;
(c) $\ln 1$ &emsp;
(d) $e^{-3\ln 2}$ &emsp;
(e) $\ln\!\left(\sqrt{e}\right)$

<details>
<summary>Answers</summary>

(a) $7$ &emsp;
(b) $5$ &emsp;
(c) $0$ &emsp;
(d) $e^{\ln(2^{-3})} = 2^{-3} = 1/8$ &emsp;
(e) $\ln(e^{1/2}) = 1/2$

</details>

---

**2.** Simplify using logarithm laws. Express answers in terms of $\ln 2$
and $\ln 3$ where needed, then give decimal approximations.

(a) $\ln 12$ &emsp;
(b) $\ln(1/4)$ &emsp;
(c) $\ln\!\left(\dfrac{e^3}{\sqrt{6}}\right)$ &emsp;
(d) $\ln(2^{10})$ &emsp;
(e) $3\ln 2 - \ln 8$

<details>
<summary>Answers</summary>

(a) $\ln(4 \cdot 3) = \ln 4 + \ln 3 = 2\ln 2 + \ln 3 \approx 2.485$

(b) $\ln(1) - \ln(4) = 0 - 2\ln 2 = -2\ln 2 \approx -1.386$

(c) $3 - \tfrac{1}{2}\ln 6 = 3 - \tfrac{1}{2}(\ln 2 + \ln 3) \approx 3 - \tfrac{1}{2}(1.792) = 2.104$

(d) $10\ln 2 \approx 6.931$

(e) $3\ln 2 - 3\ln 2 = 0$ (since $8 = 2^3$)

</details>

---

**3.** Solve for the unknown. Give exact answers, then decimals to 4 d.p.

(a) $e^{3x} = 20$ &emsp;
(b) $\ln(2x+5) = 3$ &emsp;
(c) $5e^{-0.2t} = 1$ &emsp;
(d) $\ln x - \ln(x-1) = 1$

<details>
<summary>Answers</summary>

(a) $3x = \ln 20 \Rightarrow x = \ln(20)/3 \approx 0.9986$

(b) $2x+5 = e^3 \Rightarrow x = (e^3-5)/2 \approx 7.5430$

(c) $e^{-0.2t} = 0.2 \Rightarrow -0.2t = \ln(0.2) \Rightarrow t = \ln(5)/0.2 \approx 8.0472$

(d) $\ln(x/(x-1)) = 1 \Rightarrow x/(x-1) = e \Rightarrow x = e(x-1) \Rightarrow x(1-e) = -e \Rightarrow x = e/(e-1) \approx 1.5820$

</details>

---

**4.** (Proof) Prove that $\ln\!\left(\dfrac{1}{M}\right) = -\ln M$ using
the definition of $\ln$ as the inverse of $e^x$ — do not use the quotient
law directly.

<details>
<summary>Answer</summary>

**Statement:** $\ln(1/M) = -\ln M$ for $M > 0$.

**Proof:** Let $p = \ln M$, so $e^p = M$. Then $1/M = 1/e^p = e^{-p}$.
Taking $\ln$ of both sides: $\ln(1/M) = \ln(e^{-p}) = -p = -\ln M$. $\blacksquare$

*(Alternatively, using the quotient law: $\ln(1/M) = \ln 1 - \ln M = 0 - \ln M = -\ln M$. The approach above shows the law is a consequence of the definition.)*

</details>

---

### Code Challenges

**Challenge 1 — Logarithm evaluator**

```python
import math

def natural_log(x):
    """
    Return ln(x) for x > 0.
    Raise ValueError with a descriptive message for x <= 0.
    
    (Use math.log internally — this challenge is about understanding
     the domain check and the connection to e^x.)
    """
    pass  # your code here

def log_base(x, b):
    """
    Return log_b(x) using the change-of-base formula: ln(x) / ln(b).
    
    Raise ValueError for x <= 0.
    Raise ValueError for b <= 0 or b == 1.
    """
    pass  # your code here


# --- tests: do not modify ---
# Natural log
assert abs(natural_log(1)       - 0)        < 1e-12
assert abs(natural_log(math.e)  - 1)        < 1e-12
assert abs(natural_log(math.e**5) - 5)      < 1e-10
assert abs(natural_log(0.5) - math.log(0.5)) < 1e-12

try:
    natural_log(0)
    assert False, "Should have raised ValueError"
except ValueError:
    pass   # expected

try:
    natural_log(-1)
    assert False, "Should have raised ValueError"
except ValueError:
    pass   # expected

# Change of base
assert abs(log_base(8,  2) - 3)  < 1e-10   # log_2(8) = 3
assert abs(log_base(100, 10) - 2) < 1e-10  # log_10(100) = 2
assert abs(log_base(81, 3) - 4)  < 1e-10   # log_3(81) = 4
assert abs(log_base(1, 5) - 0)   < 1e-12   # log_b(1) = 0 for any b

try:
    log_base(4, 1)                          # base 1 is invalid
    assert False, "Should have raised ValueError"
except ValueError:
    pass

print("✓ Challenge 1 passed!")
print(f"  ln(e^7) = {natural_log(math.e**7):.6f}  (expected 7)")
print(f"  log_2(1024) = {log_base(1024, 2):.6f}  (expected 10)")
```

<details>
<summary>Hint</summary>

`natural_log`: check `if x <= 0: raise ValueError(...)`, then
`return math.log(x)`. `log_base`: validate $b > 0$ and $b \neq 1$,
validate $x > 0$, then `return math.log(x) / math.log(b)`.

</details>

---

**Challenge 2 — Exponential equation solver**

```python
import math

def solve_exponential(k, C):
    """
    Solve e^(k*t) = C for t.
    Returns t = ln(C) / k.
    
    k: float, coefficient in exponent (nonzero)
    C: float, right-hand side (must be positive)
    Raise ValueError with descriptive messages for invalid inputs.
    """
    pass  # your code here

def solve_logarithmic(c):
    """
    Solve ln(x) = c for x.
    Returns x = e^c.
    """
    pass  # your code here

def half_life(decay_constant):
    """
    Compute T_{1/2} = ln(2) / lambda for a continuous decay model
    A(t) = A0 * e^(-lambda * t).
    
    decay_constant: lambda, must be positive
    """
    pass  # your code here


# --- tests: do not modify ---
# solve_exponential: e^(2t)=7 → t = ln(7)/2
t = solve_exponential(2, 7)
assert abs(math.exp(2*t) - 7) < 1e-10

# solve_exponential: e^(-0.1t)=0.5 → half-life concept
t2 = solve_exponential(-0.1, 0.5)
assert abs(math.exp(-0.1*t2) - 0.5) < 1e-10

# Invalid inputs
try:
    solve_exponential(2, -1)     # C must be positive
    assert False
except ValueError:
    pass

try:
    solve_exponential(0, 5)      # k must be nonzero
    assert False
except ValueError:
    pass

# solve_logarithmic: ln(x) = 0 → x = 1
assert abs(solve_logarithmic(0) - 1) < 1e-12
assert abs(solve_logarithmic(1) - math.e) < 1e-12
assert abs(math.log(solve_logarithmic(4.7)) - 4.7) < 1e-10

# half_life: carbon-14
T_C14 = half_life(1.2097e-4)
assert abs(T_C14 - 5730) < 1   # ~5730 years

# half_life: round-trip — after T_{1/2}, exactly half remains
for lam in [0.01, 0.1, 1.0]:
    T = half_life(lam)
    fraction = math.exp(-lam * T)
    assert abs(fraction - 0.5) < 1e-10, f"λ={lam}: fraction={fraction}"

print("✓ Challenge 2 passed!")
print(f"  e^(2t)=7: t = {solve_exponential(2,7):.6f}")
print(f"  Carbon-14 half-life: {half_life(1.2097e-4):.0f} years")
```

<details>
<summary>Hint</summary>

`solve_exponential`: check `C > 0` and `k != 0`, then
`return math.log(C) / k`. `solve_logarithmic`: `return math.exp(c)`.
`half_life`: `return math.log(2) / decay_constant`.

</details>

---

**Challenge 3 — Logarithm law verifier**

```python
import math
import random

def verify_product_law(M, N):
    """
    Check that ln(M*N) == ln(M) + ln(N) up to floating-point tolerance.
    Returns (lhs, rhs, error) where error = |lhs - rhs|.
    M, N: positive floats
    """
    pass  # your code here

def verify_power_law(M, r):
    """
    Check that ln(M^r) == r * ln(M).
    Returns (lhs, rhs, error).
    M: positive float; r: any real float
    """
    pass  # your code here

def expand_log(expr_parts):
    """
    Given a list of (M, sign, r) tuples, compute:
        sign_1 * r_1 * ln(M_1) + sign_2 * r_2 * ln(M_2) + ...
    where sign is +1 or -1 (for product/quotient law).
    
    This implements the expanded form of a single logarithm:
        ln( M1^r1 / M2^r2 * M3^r3 / ... )
    
    expr_parts: list of (M, sign, r) where M>0, sign in {+1,-1}, r real
    Returns: float
    """
    pass  # your code here


# --- tests: do not modify ---
TOL = 1e-10

# Product law
for M, N in [(6, 4), (2.5, 3.7), (100, 0.001), (math.e, math.e**2)]:
    lhs, rhs, err = verify_product_law(M, N)
    assert err < TOL, f"Product law failed for M={M}, N={N}: error={err}"

# Power law
for M, r in [(4, 3), (2, -1), (math.e, 0.5), (10, 100)]:
    lhs, rhs, err = verify_power_law(M, r)
    assert err < TOL, f"Power law failed for M={M}, r={r}: error={err}"

# expand_log: ln(8/2) = ln(8) - ln(2) = ln(4) = 2*ln(2)
# Using (M=8, sign=+1, r=1) and (M=2, sign=-1, r=1)
result = expand_log([(8, +1, 1), (2, -1, 1)])
assert abs(result - math.log(4)) < TOL

# ln(x^2 * y^3 / z) with x=2, y=3, z=4
# = 2*ln(2) + 3*ln(3) - ln(4)
result2 = expand_log([(2, +1, 2), (3, +1, 3), (4, -1, 1)])
exact = 2*math.log(2) + 3*math.log(3) - math.log(4)
assert abs(result2 - exact) < TOL

# Random verification
random.seed(42)
for _ in range(100):
    M  = random.uniform(0.01, 100)
    N  = random.uniform(0.01, 100)
    r  = random.uniform(-5, 5)
    _, _, err1 = verify_product_law(M, N)
    _, _, err2 = verify_power_law(M, r)
    assert err1 < TOL
    assert err2 < TOL

print("✓ Challenge 3 passed!")
print(f"  Product law verified for 100 random (M,N) pairs")
print(f"  Power law verified for 100 random (M,r) pairs")
```

<details>
<summary>Hint</summary>

`verify_product_law`: compute `lhs = math.log(M*N)`,
`rhs = math.log(M) + math.log(N)`, `error = abs(lhs-rhs)`, return tuple.
`verify_power_law`: `lhs = math.log(M**r)`, `rhs = r*math.log(M)`.
`expand_log`: `return sum(sign * r * math.log(M) for M, sign, r in expr_parts)`.

</details>

---

### Extension

**5. ★** Prove that $\ln x \leq x - 1$ for all $x > 0$,
with equality only at $x = 1$.

(a) Define $g(x) = (x-1) - \ln x$. Show $g(1) = 0$.

(b) Use the derivative $g'(x) = 1 - 1/x$ (from Stage 5 — accept for now):
show $g'(x) < 0$ for $0 < x < 1$ and $g'(x) > 0$ for $x > 1$.
Conclude that $x = 1$ is a minimum of $g$.

(c) Verify numerically for $x = 0.1, 0.5, 1, 2, 5, 10$.

(d) Explain the geometric meaning: $\ln x \leq x - 1$ means the line
$y = x - 1$ (the tangent to $y = \ln x$ at $x = 1$) lies everywhere
above or on the curve $y = \ln x$.

<details>
<summary>Answer to (a)–(c)</summary>

(a) $g(1) = (1-1) - \ln 1 = 0 - 0 = 0$. ✓

(b) $g'(x) = 1 - 1/x$. For $0 < x < 1$: $1/x > 1$, so $g'(x) < 0$ (decreasing).
For $x > 1$: $1/x < 1$, so $g'(x) > 0$ (increasing). So $g$ decreases
to $g(1) = 0$ then increases, confirming $g(x) \geq 0$ for all $x > 0$,
i.e. $\ln x \leq x - 1$. Equality only at $x = 1$. $\square$

(c): at $x=0.1$: $(0.1-1) - \ln(0.1) = -0.9 - (-2.303) = 1.403 \geq 0$ ✓;
at $x=2$: $(2-1) - \ln 2 = 1 - 0.693 = 0.307 \geq 0$ ✓.

</details>

**6. ★** The natural logarithm has an area interpretation: it can be defined
as

$$\ln x = \int_1^x \frac{1}{t}\,dt$$

(proved in Lesson 5.16). Use this definition to give a purely geometric
proof of the product law $\ln(MN) = \ln M + \ln N$:

$$\int_1^{MN} \frac{1}{t}\,dt = \int_1^M \frac{1}{t}\,dt + \int_M^{MN} \frac{1}{t}\,dt$$

Show that $\int_M^{MN} \frac{1}{t}\,dt = \int_1^N \frac{1}{t}\,dt$
using the substitution $t = Mu$.
