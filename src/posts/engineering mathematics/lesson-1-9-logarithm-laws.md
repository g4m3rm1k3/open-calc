# Stage 1, Lesson 1.9 — Logarithm Laws: Manipulating Log Expressions
**Threads:** Math · CS  
**Estimated time:** 50–65 minutes

---

## What This Lesson Is About

Lesson 1.8 proved the three logarithm laws for the natural logarithm $\ln$.
Those same laws hold for logarithms in any base, because a logarithm in
any base is $\ln$ divided by a constant. This lesson states the laws for
a general base $b$, proves them, and practises the full range of
manipulations: expanding a single log into a sum or difference,
condensing a sum or difference back into a single log, and identifying
the four most common mistakes. Fluent manipulation of logarithms is
required for Lesson 1.10 (exponential equations), Lesson 1.11
(logarithmic scales), algorithm analysis in Lesson 9.7 (Big O and
$\log n$), and every formula in information theory (Lesson 8.11)
that uses entropy.

---

## Historical Context

John Napier published the first tables of logarithms in 1614, and Henry
Briggs immediately saw the value of standardising on base 10. In 1617,
Briggs published base-10 logarithm tables accurate to 14 decimal places
— a monumental calculation requiring years of hand computation. The laws
that make logarithms useful (product to sum, quotient to difference, power
to product) are the same properties Napier and Briggs exploited to
convert multiplication problems into addition problems. Before the
electronic calculator, every engineer carried a **slide rule** — a
mechanical implementation of the product law: two logarithmic scales
placed side by side, so sliding one against the other performs addition
of exponents, which multiplies the underlying numbers. Slide rules were
the dominant engineering tool from the 17th century until the early 1970s,
when Hewlett-Packard introduced the HP-35 pocket calculator.

---

## What You Need To Know First

- **Natural logarithm** — Lesson 1.8. The laws here are the same laws,
  extended to any base via the change-of-base formula.
- **Change of base formula** — Lesson 1.8: $\log_b x = \ln x / \ln b$.
  Every proof in this lesson is one line because it reduces to the
  $\ln$ case already done.
- **Inverse functions** — Lesson 0.8. $\log_b x$ is the inverse of
  $b^x$: $\log_b x = y \iff b^y = x$.

---

## The Lesson

### Definition and Key Values for $\log_b$

We need a function that answers: "which exponent does $b$ need?" For
$b > 0$, $b \neq 1$, and $x > 0$, there is exactly one $y \in \mathbb{R}$
with $b^y = x$ (because $b^y$ is strictly monotone and bijective onto
$(0,\infty)$). That unique $y$ is $\log_b x$.

**Definition:** For $b > 0$, $b \neq 1$, $x > 0$:

$$\log_b x = y \iff b^y = x$$

**Formal lens:**
$$\log_b: (0,\infty) \to \mathbb{R}$$

Domain $(0,\infty)$, range $\mathbb{R}$ — same as $\ln$.
The restriction $b \neq 1$ is required because $1^y = 1$ for all $y$:
no exponent produces anything other than 1, so $\log_1 x$ would be
undefined for $x \neq 1$ and multi-valued at $x = 1$.

**The three standard bases:**
- **Base 10:** $\log_{10} x$ — written $\log x$ in engineering. Used
  in decibels (Lesson 1.11), pH, and Richter magnitude.
- **Base 2:** $\log_2 x$ — used in information theory, binary system,
  and algorithm complexity.
- **Base $e$:** $\ln x = \log_e x$ — the natural base for all analysis.

**Key values** (each follows from $b^y = x$):

$$\log_b 1 = 0 \quad \text{(because } b^0 = 1\text{)}$$
$$\log_b b = 1 \quad \text{(because } b^1 = b\text{)}$$
$$\log_b(b^k) = k \quad \text{(because } b^k = b^k\text{)}$$
$$b^{\log_b x} = x \quad \text{(cancellation identity)}$$

**Hand-worked example:** evaluate without a calculator.

$\log_2 64$: we need $2^y = 64 = 2^6$, so $y = 6$.

$\log_3(1/27)$: we need $3^y = 1/27 = 3^{-3}$, so $y = -3$.

$\log_4 8$: we need $4^y = 8$. Writing both as powers of 2:
$(2^2)^y = 2^3 \Rightarrow 2y = 3 \Rightarrow y = 3/2$.

```python
import math

def log_base(x, b):
    """Compute log_b(x) using the change-of-base formula."""
    return math.log(x) / math.log(b)

# Verify key values
examples = [
    (64,     2,  6,   "log_2(64) = 6"),
    (1/27,   3, -3,   "log_3(1/27) = -3"),
    (8,      4, 1.5,  "log_4(8) = 3/2"),
    (1,      7,  0,   "log_7(1) = 0"),
    (10,    10,  1,   "log_10(10) = 1"),
    (100,   10,  2,   "log_10(100) = 2"),
    (0.001, 10, -3,   "log_10(0.001) = -3"),
]

print(f"{'Expression':<22} | {'Computed':>10} | {'Expected':>10} | {'Match'}")
print("-" * 60)
for x, b, expected, label in examples:
    computed = log_base(x, b)
    match    = abs(computed - expected) < 1e-10
    print(f"{label:<22} | {computed:>10.4f} | {expected:>10.4f} | {match}")
```

**Walkthrough:** `math.log(x) / math.log(b)` implements the
change-of-base formula $\log_b x = \ln x / \ln b$ using Python's
natural log `math.log`. `abs(computed - expected) < 1e-10` is the
floating-point equality check. Note that `log_base(8, 4)` returns
exactly 1.5 (within float precision) confirming $\log_4 8 = 3/2$.

---

### The Three Laws

The laws hold for any base $b > 0$, $b \neq 1$, and any $M, N > 0$,
$r \in \mathbb{R}$.

**Law 1 — Product:**
$$\log_b(MN) = \log_b M + \log_b N$$

*Proof using change of base:*
$$\log_b(MN) = \frac{\ln(MN)}{\ln b} = \frac{\ln M + \ln N}{\ln b}
             = \frac{\ln M}{\ln b} + \frac{\ln N}{\ln b}
             = \log_b M + \log_b N \qquad \blacksquare$$

**Law 2 — Quotient:**
$$\log_b\!\left(\frac{M}{N}\right) = \log_b M - \log_b N$$

*Proof:*
$$\frac{\ln(M/N)}{\ln b} = \frac{\ln M - \ln N}{\ln b}
  = \log_b M - \log_b N \qquad \blacksquare$$

**Law 3 — Power:**
$$\log_b(M^r) = r\,\log_b M$$

*Proof:*
$$\frac{\ln(M^r)}{\ln b} = \frac{r\,\ln M}{\ln b} = r\,\log_b M \qquad \blacksquare$$

The proofs are one-liners because the general base laws are simply the
$\ln$ laws (already proved in Lesson 1.8) passed through the change-of-base
formula. There is only one logarithm — $\ln$ — and every $\log_b$ is
a scalar multiple of it.

**Important consequences:**

$$\log_b\!\left(\frac{1}{M}\right) = -\log_b M \qquad \text{(quotient law, } N = M\text{)}$$

$$\log_b\!\left(\sqrt[n]{M}\right) = \frac{1}{n}\log_b M \qquad \text{(power law, } r = 1/n\text{)}$$

$$\log_b b^r = r \qquad \text{(power law, then } \log_b b = 1\text{)}$$

**The reciprocal bases identity** — a useful result:

$$\log_b x \cdot \log_x b = 1 \qquad (x \neq 1)$$

*Proof:* $\log_b x = \ln x / \ln b$ and $\log_x b = \ln b / \ln x$.
Their product is $(\ln x / \ln b) \cdot (\ln b / \ln x) = 1$. $\blacksquare$

```python
import math

def log_base(x, b):
    return math.log(x) / math.log(b)   # unchanged from earlier

# Verify the three laws for base-10, base-2, base-3
print("Verifying laws for base 10, base 2, and base 3")
print("=" * 55)
for b in [10, 2, 3]:
    M, N, r = 6.0, 4.0, 2.5
    L1 = abs(log_base(M*N, b) - (log_base(M, b) + log_base(N, b)))
    L2 = abs(log_base(M/N, b) - (log_base(M, b) - log_base(N, b)))
    L3 = abs(log_base(M**r, b) - r * log_base(M, b))
    print(f"Base {b}: Product law error={L1:.2e}  "
          f"Quotient law error={L2:.2e}  "
          f"Power law error={L3:.2e}")

# Reciprocal bases
print("\nReciprocal bases: log_b(x) * log_x(b) = 1")
for b, x in [(2, 8), (3, 27), (10, 100), (math.e, math.e**3)]:
    product = log_base(x, b) * log_base(b, x)
    print(f"  log_{b}({x}) * log_{x}({b}) = {product:.8f}  (expected 1)")
```

**Walkthrough:** The outer loop tests all three laws for three
different bases. Each error is computed as `abs(lhs - rhs)` and
should be near machine precision ($\sim 10^{-15}$). The reciprocal
identity block confirms $\log_b x \cdot \log_x b = 1$ for several
base/value pairs.

---

### Expanding Logarithmic Expressions

"Expanding" means writing a single $\log$ of a compound expression
as a sum or difference of simpler logs with the rules applied
systematically.

**Strategy:**
1. Apply the quotient law first (numerator/denominator split).
2. Apply the product law to any products in numerator or denominator.
3. Apply the power law to move exponents outside.
4. Evaluate any constant logs ($\log_b b^k = k$).

**Hand-worked example 1:** Expand $\log_3\!\left(\dfrac{9x^2}{\sqrt{x+1}}\right)$.

Step 1 — Quotient law:
$$= \log_3(9x^2) - \log_3\!\left(\sqrt{x+1}\right)$$

Step 2 — Product law in the first term:
$$= \log_3 9 + \log_3(x^2) - \log_3\!\left((x+1)^{1/2}\right)$$

Step 3 — Power law:
$$= \log_3 9 + 2\log_3 x - \tfrac{1}{2}\log_3(x+1)$$

Step 4 — Evaluate the constant: $\log_3 9 = \log_3(3^2) = 2$:
$$= 2 + 2\log_3 x - \tfrac{1}{2}\log_3(x+1)$$

**Verify** at $x = 3$:
LHS: $\log_3(9 \cdot 9 / 2) = \log_3(40.5) = \ln(40.5)/\ln(3) \approx 3.369$.
RHS: $2 + 2(1) - \frac{1}{2}\log_3(4) = 4 - \frac{1}{2}(1.261) = 3.369$. ✓

**Hand-worked example 2:** Expand $\ln\!\left(\dfrac{e^2 x^{-1}}{\sqrt[3]{y^4}}\right)$.

Rewrite the cube root: $\sqrt[3]{y^4} = y^{4/3}$.

$$= \ln(e^2) + \ln(x^{-1}) - \ln(y^{4/3})$$
$$= 2 - \ln x - \frac{4}{3}\ln y$$

**Domain:** requires $x > 0$, $y > 0$.

```python
import math
import numpy as np

def log3(x):
    """log base 3 of x."""
    return math.log(x) / math.log(3)

# Verify Example 1: expanded form vs original
def original_1(x):
    return log3(9 * x**2 / math.sqrt(x+1))

def expanded_1(x):
    return 2 + 2*log3(x) - 0.5*log3(x+1)

print("Example 1: log_3(9x^2 / sqrt(x+1)) = 2 + 2*log_3(x) - (1/2)*log_3(x+1)")
print(f"{'x':>6} | {'Original':>12} | {'Expanded':>12} | {'Match'}")
print("-" * 45)
for x in [1, 2, 3, 5, 10]:
    orig = original_1(x)
    expd = expanded_1(x)
    print(f"{x:>6} | {orig:>12.8f} | {expd:>12.8f} | {abs(orig-expd) < 1e-10}")

print()
# Verify Example 2: ln(e^2 * x^(-1) / y^(4/3))
def original_2(x, y):
    return math.log(math.e**2 * x**(-1) / y**(4/3))

def expanded_2(x, y):
    return 2 - math.log(x) - (4/3)*math.log(y)

print("Example 2: ln(e^2 * x^{-1} / y^{4/3}) = 2 - ln(x) - (4/3)*ln(y)")
print(f"{'(x,y)':>10} | {'Original':>12} | {'Expanded':>12} | {'Match'}")
print("-" * 48)
for x, y in [(1,1), (2,3), (math.e, math.e**2), (5, 10)]:
    orig = original_2(x, y)
    expd = expanded_2(x, y)
    print(f"({x:.1f},{y:.1f}):    | {orig:>12.8f} | {expd:>12.8f} | {abs(orig-expd) < 1e-10}")
```

**Walkthrough:** Each function implements one form — original (single
log) and expanded (sum of simpler logs) — and the numerical comparison
confirms they are equal for multiple values of $x$ (and $y$). The
domain constraint requires $x > 1$ for Example 1 (since $x+1 > 0$ and
$x > 0$ are needed for the logs to be defined, but $x+1$ in the
denominator also requires $x+1 > 0$, so $x > -1$; $x > 0$ is needed
for $\log x$).

---

### Condensing Logarithmic Expressions

"Condensing" is the reverse: writing a sum or difference of logs as a
single log. This is the step used when solving logarithmic equations.

**Strategy:**
1. Apply the power law to move coefficients into exponents.
2. Apply the product law to convert sums to products.
3. Apply the quotient law to convert differences to quotients.
4. Simplify the resulting expression where possible.

**Hand-worked example 1:** Condense $2\log_5 x + \log_5(x+3) - \log_5(x^2-1)$.

Step 1 — Power law:
$$= \log_5(x^2) + \log_5(x+3) - \log_5(x^2-1)$$

Step 2 — Product law on the first two terms:
$$= \log_5\!\left(x^2(x+3)\right) - \log_5(x^2-1)$$

Step 3 — Quotient law:
$$= \log_5\!\left(\frac{x^2(x+3)}{x^2-1}\right)$$

Step 4 — Factor $x^2-1 = (x-1)(x+1)$:
$$= \log_5\!\left(\frac{x^2(x+3)}{(x-1)(x+1)}\right)$$

**Domain:** requires $x > 0$, $x + 3 > 0$, $x^2 - 1 > 0$, so $x > 1$.

**Hand-worked example 2:** Condense
$\frac{1}{3}\left[2\ln x - \ln(x^2+1) + 4\ln y\right]$.

Step 1 — Distribute the $1/3$:
$$= \frac{2}{3}\ln x - \frac{1}{3}\ln(x^2+1) + \frac{4}{3}\ln y$$

Step 2 — Power law:
$$= \ln(x^{2/3}) - \ln((x^2+1)^{1/3}) + \ln(y^{4/3})$$

Step 3 — Product and quotient laws:
$$= \ln\!\left(\frac{x^{2/3} \cdot y^{4/3}}{(x^2+1)^{1/3}}\right)$$

Or: $= \ln\!\left(\dfrac{\sqrt[3]{x^2 y^4}}{\sqrt[3]{x^2+1}}\right)
     = \ln\!\sqrt[3]{\dfrac{x^2 y^4}{x^2+1}}$

```python
import math

# Verify Example 1
def expanded_ex1(x, b=5):
    """2*log_5(x) + log_5(x+3) - log_5(x^2-1)"""
    lb = lambda v: math.log(v) / math.log(b)
    return 2*lb(x) + lb(x+3) - lb(x**2-1)

def condensed_ex1(x, b=5):
    """log_5( x^2*(x+3) / (x^2-1) )"""
    return math.log(x**2*(x+3) / (x**2-1)) / math.log(b)

print("Example 1 condensation verification (x > 1):")
for x in [2, 3, 4, 5, 10]:
    e = expanded_ex1(x)
    c = condensed_ex1(x)
    print(f"  x={x}: expanded={e:.6f}, condensed={c:.6f}, match={abs(e-c)<1e-10}")

print()
# Verify Example 2
def expanded_ex2(x, y):
    return (1/3)*(2*math.log(x) - math.log(x**2+1) + 4*math.log(y))

def condensed_ex2(x, y):
    return math.log(((x**2 * y**4) / (x**2+1))**(1/3))

print("Example 2 condensation verification:")
for x, y in [(1,2), (2,3), (3,1), (math.e, math.e)]:
    e = expanded_ex2(x, y)
    c = condensed_ex2(x, y)
    print(f"  x={x:.2f},y={y:.2f}: expanded={e:.6f}, condensed={c:.6f}, match={abs(e-c)<1e-10}")
```

**Walkthrough:** Each function implements the expanded and condensed
forms independently; `abs(e-c) < 1e-10` confirms they are equal.
For Example 2, `(x**2 * y**4 / (x**2+1))**(1/3)` computes the cube
root of the expression inside the log by raising to the power $1/3$.

---

### The Four Most Common Errors

These are the source of the most frequent mistakes in log manipulation.
Each is demonstrated numerically to make the non-equality concrete.

| Error | What students write | Correct form |
|-------|--------------------|-----------------------------|
| Sum of args | $\log(M+N) = \log M + \log N$ | No simplification exists |
| Product of logs | $\log(MN) = (\log M)(\log N)$ | $= \log M + \log N$ |
| Ratio of logs | $\log M/\log N = \log(M/N)$ | $= \log_N M$ (change of base) |
| Log raised to power | $(\log M)^r = r\log M$ | $\log(M^r) = r\log M$ |

```python
import math

M, N, r = 4.0, 2.0, 3.0

print("Four common log errors — computed to show they are NOT equal:\n")

lhs1 = math.log(M + N);      rhs1 = math.log(M) + math.log(N)
print(f"Error 1: log({M}+{N}) vs log({M})+log({N})")
print(f"  log({M+N:.0f}) = {lhs1:.6f}   vs   log({M})+log({N}) = {rhs1:.6f}  NOT equal\n")

lhs2 = math.log(M * N);      rhs2 = math.log(M) * math.log(N)
print(f"Error 2: log({M}*{N}) vs log({M})*log({N})")
print(f"  log({M*N:.0f}) = {lhs2:.6f}   vs   log({M})*log({N}) = {rhs2:.6f}  NOT equal\n")

lhs3 = math.log(M) / math.log(N);   rhs3 = math.log(M / N)
print(f"Error 3: log({M})/log({N}) vs log({M}/{N})")
print(f"  log({M})/log({N}) = {lhs3:.6f}  (= log_{int(N)}({int(M)}) = 2)   vs   log({M/N:.1f}) = {rhs3:.6f}  NOT equal\n")

lhs4 = math.log(M)**r;       rhs4 = r * math.log(M)
print(f"Error 4: (log {M})^{r:.0f} vs {r:.0f}*log({M})")
print(f"  (log {M})^{r:.0f} = {lhs4:.6f}   vs   {r:.0f}*log({M}) = log({M}^{r:.0f}) = log({M**r:.0f}) = {rhs4:.6f}  NOT equal")
```

**Walkthrough:** Each block computes the two sides of a commonly
confused identity numerically. Error 3 is worth examining carefully:
$\log(4)/\log(2) = 2$ — it equals $\log_2(4)$ by the change-of-base
formula, not $\log(4/2) = \log(2)$. The `int()` calls in the
print statements convert the float keys $2.0$, $4.0$ to integers
for cleaner display in the output string.

---

### Why the Base Doesn't Matter in Big O

**CS connection:** In algorithm analysis, $\log n$ appears in the
complexity of binary search, balanced trees, and divide-and-conquer
algorithms. The change-of-base formula shows:

$$\log_b n = \frac{\ln n}{\ln b} = \frac{1}{\ln b} \cdot \ln n$$

Changing the base multiplies the logarithm by a constant $1/\ln b$.
In Big O notation, constant factors are dropped:

$$O(\log_b n) = O\!\left(\frac{1}{\ln b} \cdot \ln n\right) = O(\ln n)$$

So $O(\log_2 n) = O(\log_{10} n) = O(\ln n)$. This is why algorithm
textbooks write $O(\log n)$ without specifying a base — any base gives
the same complexity class.

```python
import numpy as np
import matplotlib.pyplot as plt

n = np.linspace(2, 1000, 500)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left: log_b(n) for different bases -- same shape, different scale
colors = ['#e74c3c', '#2980b9', '#27ae60', '#8e44ad']
for base, color in zip([2, math.e, 10, 100], colors):
    axes[0].plot(n, np.log(n)/np.log(base), color=color, lw=2,
                 label=f'$\\log_{{{base if isinstance(base,int) else "e"}}}\\,n$')

axes[0].set_xlabel('$n$'); axes[0].set_ylabel('$\\log_b n$')
axes[0].set_title('Same shape — different scale\n'
                  'Change of base = multiply by constant', fontsize=11)
axes[0].legend(fontsize=10); axes[0].grid(True, alpha=0.3)

# Right: same functions normalised (divided by constant) -- they collapse
axes[1].plot(n, np.log(n), color='#e74c3c', lw=3, label='All bases (scaled to $\\ln n$)')
for base, color in zip([2, 10, 100], ['#2980b9','#27ae60','#8e44ad']):
    # Scale each base to ln(n): log_b(n) * ln(b) = ln(n)
    axes[1].plot(n, np.log(n)/np.log(base) * np.log(base), '--', color=color,
                 lw=1.5, alpha=0.6, label=f'base {base} rescaled')

axes[1].set_xlabel('$n$'); axes[1].set_ylabel('$\\ln n$ (after scaling)')
axes[1].set_title('After scaling: all bases collapse to $\\ln n$\n'
                  '$O(\\log n)$ is the same regardless of base', fontsize=11)
axes[1].legend(fontsize=9); axes[1].grid(True, alpha=0.3)

plt.suptitle('Change of base = constant factor: irrelevant in Big O', fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** The left panel shows $\log_b n$ for four bases — all
are increasing, all have the same logarithmic shape, they differ only
in vertical scale. The right panel multiplies each $\log_b n$ by
$\ln b$ (the constant factor) to recover $\ln n$, showing all
four curves collapse onto a single curve. This confirms that different
bases produce functions in the same $O$-class.

---

## Connect the Pieces

**What this lesson built on:** Natural logarithm laws (Lesson 1.8) —
every proof here is the $\ln$ law passed through the change-of-base
formula. Inverse functions (Lesson 0.8) — $\log_b x$ is the inverse
of $b^x$.

**What this lesson makes possible:** Lesson 1.10 (exponential and
logarithmic equations) — expanding and condensing are the algebraic
tools for isolating unknowns. Lesson 1.11 (logarithmic scales) —
decibels, pH, and Richter all use $\log_{10}$ with these laws applied
to handle ratios. Lesson 9.7 (Big O notation) — $O(\log n)$ is
base-independent because change of base = constant factor.

**In CS:** Entropy in information theory is $H = -\sum p_i \log_2 p_i$
bits. Using $\ln$ instead gives $H$ in **nats**. The conversion is
$H_{\text{nats}} = H_{\text{bits}} \cdot \ln 2$ — the change-of-base
constant. Both measure the same information; the unit differs.
Similarly, `math.log2(n)` and `math.log(n)/math.log(2)` give
identical results; the two-argument form `math.log(n, 2)` is
syntactic sugar for the same calculation.

---

## Summary

**Definition:** $\log_b x = y \iff b^y = x$.
Domain $(0,\infty)$, range $\mathbb{R}$.

**Key values:** $\log_b 1 = 0$; $\log_b b = 1$; $\log_b(b^k) = k$;
$b^{\log_b x} = x$.

**Three laws** (for $b > 0$, $b \neq 1$; $M, N > 0$; $r \in \mathbb{R}$):
$$\log_b(MN) = \log_b M + \log_b N$$
$$\log_b(M/N) = \log_b M - \log_b N$$
$$\log_b(M^r) = r\,\log_b M$$

**Change of base:** $\log_b x = \dfrac{\ln x}{\ln b}$

**Reciprocal bases:** $\log_b x \cdot \log_x b = 1$

**Big O:** $O(\log_b n) = O(\log n)$ for any fixed $b > 1$.

**New Python:**
- `math.log10(x)` — $\log_{10} x$
- `math.log2(x)` — $\log_2 x$
- `np.log10(x)`, `np.log2(x)` — element-wise on arrays
- `math.log(x, b)` — $\log_b x$ (two-argument form)

---

## Problems

### Math

**1.** Evaluate exactly — no calculator.

(a) $\log_2 128$ &emsp;
(b) $\log_{10}(0.001)$ &emsp;
(c) $\log_3(1/81)$ &emsp;
(d) $\log_4 8$ &emsp;
(e) $\log_5(5^{-3/2})$

<details>
<summary>Answers</summary>

(a) $7$ ($2^7=128$) &emsp;
(b) $-3$ ($10^{-3}=0.001$) &emsp;
(c) $-4$ ($3^{-4}=1/81$) &emsp;
(d) $3/2$ ($(2^2)^y=2^3 \Rightarrow y=3/2$) &emsp;
(e) $-3/2$ (power law)

</details>

---

**2.** Expand completely using logarithm laws.

(a) $\log_2(8x^3 y)$

(b) $\log_{10}\!\left(\dfrac{x^2 y}{\sqrt{z}}\right)$

(c) $\ln\!\left(\dfrac{e^3 \cdot x^{-2}}{\sqrt[4]{x^2+1}}\right)$

<details>
<summary>Answers</summary>

(a) $\log_2 8 + 3\log_2 x + \log_2 y = 3 + 3\log_2 x + \log_2 y$

(b) $2\log x + \log y - \tfrac{1}{2}\log z$ (using $\log = \log_{10}$)

(c) $3 + (-2)\ln x - \tfrac{1}{4}\ln(x^2+1) = 3 - 2\ln x - \tfrac{1}{4}\ln(x^2+1)$

</details>

---

**3.** Condense into a single logarithm.

(a) $\log_3 x + \log_3 5 - \log_3 2$

(b) $2\ln x - 3\ln y + \ln z$

(c) $\dfrac{1}{3}\!\left[\log_2(x^2-4) - \log_2(x+2)\right]$

(d) $\log_{10} x + \log_{10}(x-1) - \log_{10}(x^2+x)$

<details>
<summary>Answers</summary>

(a) $\log_3(5x/2)$

(b) $\ln(x^2 z / y^3)$

(c) $\tfrac{1}{3}\log_2\!\left(\frac{x^2-4}{x+2}\right) = \tfrac{1}{3}\log_2(x-2)$ (since $x^2-4=(x+2)(x-2)$), giving $\log_2\!\left((x-2)^{1/3}\right)$

(d) $\log_{10}\!\left(\frac{x(x-1)}{x^2+x}\right) = \log_{10}\!\left(\frac{x(x-1)}{x(x+1)}\right) = \log_{10}\!\left(\frac{x-1}{x+1}\right)$

</details>

---

**4.** (Proof) Prove that $\log_b x = \dfrac{1}{\log_x b}$ for
$b, x > 0$, $b \neq 1$, $x \neq 1$.

<details>
<summary>Answer</summary>

By the change-of-base formula:
$\log_b x = \ln x / \ln b$ and $\log_x b = \ln b / \ln x$.

Therefore:
$\log_b x = \frac{\ln x}{\ln b} = \frac{1}{\ln b / \ln x} = \frac{1}{\log_x b}$. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Universal log evaluator**

```python
import math

def log_any_base(x, b):
    """
    Compute log_b(x) for any valid base b.
    
    Valid bases: b > 0 and b != 1.
    Valid inputs: x > 0.
    Raise ValueError with a descriptive message for invalid inputs.
    
    Use the change-of-base formula: ln(x) / ln(b).
    """
    pass  # your code here


# --- tests: do not modify ---
# Standard values
assert abs(log_any_base(8,  2)  - 3)     < 1e-10
assert abs(log_any_base(100, 10) - 2)    < 1e-10
assert abs(log_any_base(1,   7)  - 0)    < 1e-12
assert abs(log_any_base(27,  3)  - 3)    < 1e-10
assert abs(log_any_base(8,   4)  - 1.5)  < 1e-10   # log_4(8) = 3/2

# Base e gives ln
assert abs(log_any_base(math.e**3, math.e) - 3) < 1e-10

# Cancellation: log_b(b^k) = k
for b in [2, 3, 10, math.e]:
    for k in [-2, 0, 1, 3, 7]:
        assert abs(log_any_base(b**k, b) - k) < 1e-8, \
            f"log_{b}({b}^{k}) should be {k}"

# Reciprocal identity: log_b(x) * log_x(b) = 1
for b, x in [(2,8), (3,9), (10,100)]:
    product = log_any_base(x, b) * log_any_base(b, x)
    assert abs(product - 1) < 1e-10, f"Reciprocal identity failed for b={b},x={x}"

# Error cases
for bad_b in [0, -1, 1]:
    try:
        log_any_base(5, bad_b)
        assert False, f"Should raise ValueError for b={bad_b}"
    except ValueError:
        pass

try:
    log_any_base(-1, 2)
    assert False, "Should raise ValueError for x=-1"
except ValueError:
    pass

print("✓ Challenge 1 passed!")
print(f"  log_2(1024) = {log_any_base(1024, 2)}")
print(f"  log_10(1e6) = {log_any_base(1e6, 10)}")
```

<details>
<summary>Hint</summary>

Check: `if x <= 0: raise ValueError(...)`. Check: `if b <= 0 or b == 1: raise ValueError(...)`. Then `return math.log(x) / math.log(b)`.

</details>

---

**Challenge 2 — Logarithm laws verifier**

```python
import math
import random

def product_law(M, N, b):
    """
    Return True if log_b(M*N) == log_b(M) + log_b(N) within 1e-10.
    Assumes M, N > 0 and b > 0, b != 1.
    """
    pass  # your code here

def quotient_law(M, N, b):
    """
    Return True if log_b(M/N) == log_b(M) - log_b(N) within 1e-10.
    """
    pass  # your code here

def power_law(M, r, b):
    """
    Return True if log_b(M^r) == r * log_b(M) within 1e-10.
    M > 0, r any real, b > 0, b != 1.
    """
    pass  # your code here


# --- tests: do not modify ---
# Deterministic cases
assert product_law(6, 4, 10)
assert quotient_law(6, 4, 10)
assert power_law(4, 3, 10)

assert product_law(8, 2, 2)    # log_2(16) = 4 = log_2(8)+log_2(2) = 3+1
assert power_law(2, 10, 2)     # log_2(2^10) = 10 = 10*log_2(2) = 10*1

# All three laws for base e (= ln)
assert product_law(math.pi, math.e, math.e)
assert quotient_law(math.pi, 2, math.e)
assert power_law(math.pi, -0.5, math.e)

# Random stress test: 200 random triples
random.seed(99)
failures = []
for _ in range(200):
    M = random.uniform(0.01, 1000)
    N = random.uniform(0.01, 1000)
    r = random.uniform(-10, 10)
    b = random.choice([2, math.e, 10, 3, 7])
    if not product_law(M, N, b):
        failures.append(f"Product law: M={M:.4f}, N={N:.4f}, b={b}")
    if not quotient_law(M, N, b):
        failures.append(f"Quotient law: M={M:.4f}, N={N:.4f}, b={b}")
    if not power_law(M, r, b):
        failures.append(f"Power law: M={M:.4f}, r={r:.4f}, b={b}")

assert failures == [], f"Failures: {failures[:3]}"
print(f"✓ Challenge 2 passed! All 3 laws verified for 200 random triples.")
```

<details>
<summary>Hint</summary>

For `product_law`: compute `lhs = math.log(M*N)/math.log(b)` and
`rhs = math.log(M)/math.log(b) + math.log(N)/math.log(b)`,
return `abs(lhs - rhs) < 1e-10`. Similarly for quotient and power.

</details>

---

**Challenge 3 — Expression expander**

```python
import math

def expand_log_expression(numerator_factors, denominator_factors, b=10):
    """
    Expand log_b(product_of_numerator_factors / product_of_denominator_factors)
    into a sum/difference of individual logarithms.
    
    Each factor is a (base_value, exponent) tuple:
        (v, r) represents v^r
    
    So log_b( (v1^r1 * v2^r2 * ...) / (w1^s1 * w2^s2 * ...) )
    expands to:
        r1*log_b(v1) + r2*log_b(v2) + ... - s1*log_b(w1) - s2*log_b(w2) - ...
    
    Returns: float (the numerical value of the expanded expression)
    
    numerator_factors:   list of (value, exponent) tuples
    denominator_factors: list of (value, exponent) tuples
    b:                   logarithm base
    """
    pass  # your code here


# --- tests: do not modify ---
import math

def lb(x, b=10):
    return math.log(x) / math.log(b)

# log_10(x^2 * y^3) with x=2, y=3
# = 2*log(2) + 3*log(3)
result = expand_log_expression([(2,2),(3,3)], [], b=10)
expected = 2*lb(2) + 3*lb(3)
assert abs(result - expected) < 1e-10, f"Got {result}, expected {expected}"

# log_10(x^2 / y) with x=5, y=4
# = 2*log(5) - log(4)
result = expand_log_expression([(5,2)], [(4,1)], b=10)
expected = 2*lb(5) - lb(4)
assert abs(result - expected) < 1e-10

# ln(e^3 / sqrt(x)) with x=9 -- base=e
# = 3*ln(e) - (1/2)*ln(9) = 3 - (1/2)*ln(9)
result = expand_log_expression([(math.e, 3)], [(9, 0.5)], b=math.e)
expected = 3 - 0.5*math.log(9)
assert abs(result - expected) < 1e-10

# Verify against original log (round-trip)
# log_2( (4^3 * 8^0.5) / (2^4) ) 
# should equal log_2(4^3) + log_2(8^0.5) - log_2(2^4)
#              = 3*2 + 0.5*3 - 4 = 6 + 1.5 - 4 = 3.5
result = expand_log_expression([(4,3),(8,0.5)], [(2,4)], b=2)
assert abs(result - 3.5) < 1e-10, f"Got {result}, expected 3.5"

print("✓ Challenge 3 passed!")
print(f"  log10(100^2 / 10) = {expand_log_expression([(100,2)],[(10,1)],b=10):.4f}  (expected 3.0)")
```

<details>
<summary>Hint</summary>

For each `(v, r)` in `numerator_factors`, add `r * math.log(v) / math.log(b)`.
For each `(w, s)` in `denominator_factors`, subtract `s * math.log(w) / math.log(b)`.
Return the total sum.

</details>

---

### Extension

**5. ★** The **number of digits** of a positive integer $n$ in base $b$
is $\lfloor \log_b n \rfloor + 1$, where $\lfloor x \rfloor$ is the
floor function (greatest integer $\leq x$).

(a) Verify this for $n = 1, 9, 10, 99, 100$ in base 10.

(b) A 32-bit unsigned integer can represent values from 0 to $2^{32}-1$.
How many decimal digits does the largest 32-bit value have?

(c) Write a Python function `digit_count(n, b)` and verify it matches
`len(bin(n)) - 2` for all $n = 1, \ldots, 1023$ (binary digit count).

<details>
<summary>Answers to (a) and (b)</summary>

(a) $\lfloor\log_{10}(1)\rfloor+1=1$ ✓; $\lfloor\log_{10}(9)\rfloor+1=1$ ✓;
$\lfloor\log_{10}(10)\rfloor+1=2$ ✓; $\lfloor\log_{10}(99)\rfloor+1=2$ ✓;
$\lfloor\log_{10}(100)\rfloor+1=3$ ✓.

(b) $2^{32}-1 = 4{,}294{,}967{,}295$. $\lfloor\log_{10}(2^{32}-1)\rfloor+1
= \lfloor 9.633\rfloor+1 = 10$ digits. ✓

</details>

**6. ★** Prove that for $b > 1$, $\log_b n < n$ for all $n \geq 1$.

*(Use the result from Lesson 1.6 that $b^x$ grows faster than any polynomial. Specifically, $b^n > n$ for all sufficiently large $n$ — which means $\log_b n < n$.)*
