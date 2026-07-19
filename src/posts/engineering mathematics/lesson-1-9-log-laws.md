# Stage 1, Lesson 1.9 — Logarithm Laws: Manipulating Logarithmic Expressions
**Threads:** Math · Physics · CS  
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 1.8 built $\ln$ as the inverse of $e^x$ and derived the three
logarithm laws for natural log. This lesson extends those laws to
logarithms of any base, develops fluency with algebraic manipulation
of logarithmic expressions, and applies them to solving equations that
combine multiple logarithms. It also introduces the two most practically
important logarithm bases after $e$: base 10 (the common logarithm,
used in pH, decibels, and the Richter scale) and base 2 (the binary
logarithm, used throughout computer science). By the end of this lesson
you can expand, condense, and simplify any logarithmic expression, solve
equations involving logarithms on both sides, and switch fluently between
bases.

---

## Historical Context

The three logarithm laws were Napier's entire motivation for inventing
logarithms in 1614 — before calculators, multiplying large numbers was
slow and error-prone. The product law $\log(ab) = \log a + \log b$
converts multiplication into addition. Astronomers like Kepler could
multiply six-digit numbers by adding their logarithms from a table and
looking up the antilogarithm. This saved enormous effort. The slide rule
— the standard engineering calculator from the 1600s until the 1970s —
is a physical implementation of the product law: two logarithmic scales
are slid against each other to perform multiplication by addition of
lengths. Every engineer in your grandfather's time did serious
engineering with a slide rule.

---

## What You Need To Know First

- **The natural logarithm $\ln$** — Lesson 1.8. The three laws for
  $\ln$ are the same laws for $\log_b$; only the base changes.
- **Change of base formula** — Lesson 1.8. $\log_b x = \ln x / \ln b$.
- **Solving exponential equations** — Lesson 1.8. The same techniques
  apply here with any base.

---

## The Lesson

### Logarithms of Any Base

**Definition:** For $b > 0$, $b \neq 1$, and $x > 0$:

$$y = \log_b x \quad \Longleftrightarrow \quad b^y = x$$

Read $\log_b x$ as "log base $b$ of $x$" — the power you raise $b$
to in order to get $x$.

**The two standard non-natural bases:**

- $\log_{10} x$, written $\log x$ (no base shown implies base 10) —
  the **common logarithm**. Used in pH, decibels, the Richter scale,
  and logarithmic graph paper.
- $\log_2 x$ — the **binary logarithm**. Used throughout CS:
  binary search takes $\lceil \log_2 n \rceil$ steps, a bit string
  of length $n$ carries $n$ bits of information, perfect binary trees
  have depth $\lfloor \log_2 n \rfloor$.

**Key values to know:**

| Expression | Value | Because |
|-----------|-------|---------|
| $\log_b 1$ | $0$ | $b^0 = 1$ |
| $\log_b b$ | $1$ | $b^1 = b$ |
| $\log_b b^k$ | $k$ | $b^k = b^k$ |
| $b^{\log_b x}$ | $x$ | inverse property |
| $\log_{10} 10^k$ | $k$ | |
| $\log_2 2^k$ | $k$ | |

```python
import math
import numpy as np

print("Key logarithm values:\n")
print(f"{'Expression':>20}  {'Value':>10}  {'Verify'}")
print("-" * 50)

cases = [
    ("log10(1)",     math.log10(1)),
    ("log10(10)",    math.log10(10)),
    ("log10(1000)",  math.log10(1000)),
    ("log10(0.01)",  math.log10(0.01)),
    ("log2(1)",      math.log2(1)),
    ("log2(8)",      math.log2(8)),
    ("log2(1024)",   math.log2(1024)),
    ("log2(0.25)",   math.log2(0.25)),
]

for label, val in cases:
    print(f"{label:>20}  {val:>10.4f}")

print()
# Change of base: all three are proportional to each other
x = 50
print(f"For x = {x}:")
print(f"  ln({x})     = {math.log(x):.6f}")
print(f"  log10({x})  = {math.log10(x):.6f}")
print(f"  log2({x})   = {math.log2(x):.6f}")
print(f"  Ratios: ln/log10 = {math.log(x)/math.log10(x):.6f} (should be ln(10) = {math.log(10):.6f})")
print(f"          ln/log2  = {math.log(x)/math.log2(x):.6f} (should be ln(2) = {math.log(2):.6f})")
```

**Walkthrough:** `math.log10(x)` and `math.log2(x)` are Python's
built-in base-10 and base-2 logarithms. The ratio `ln(x)/log10(x)`
is always `ln(10)` regardless of `x` — this is the change of base
formula: $\ln x = \log_{10} x \cdot \ln 10$, so $\ln x / \log_{10} x
= \ln 10$. Every logarithm base is just $\ln$ scaled by a constant.

---

### The Three Laws for Any Base

For any base $b > 0$, $b \neq 1$ and positive arguments $M$, $N$,
real power $r$:

$$\boxed{\log_b(MN) = \log_b M + \log_b N}$$

$$\boxed{\log_b\!\left(\frac{M}{N}\right) = \log_b M - \log_b N}$$

$$\boxed{\log_b(M^r) = r \log_b M}$$

*Proof of all three:* The same proof as Lesson 1.8 but with base $b$
instead of $e$. Let $\alpha = \log_b M$ and $\beta = \log_b N$,
so $M = b^\alpha$ and $N = b^\beta$.
- Product: $MN = b^\alpha b^\beta = b^{\alpha+\beta}$, so $\log_b(MN) = \alpha + \beta$.
- Quotient: $M/N = b^{\alpha-\beta}$, so $\log_b(M/N) = \alpha - \beta$.
- Power: $M^r = b^{r\alpha}$, so $\log_b(M^r) = r\alpha$. $\blacksquare$

**The laws are the same regardless of base.** The base only affects the
numerical value of $\log_b x$, not the structure of the laws.

---

### Expanding and Condensing

**Expanding** means writing a single log of a complex expression as a
sum/difference of simpler logs. **Condensing** means the reverse.

**Hand-worked: Expand**

$$\log_3\!\left(\frac{x^4 \sqrt{y}}{z^3}\right)$$

$$= \log_3(x^4) + \log_3(\sqrt{y}) - \log_3(z^3)$$

$$= 4\log_3 x + \tfrac{1}{2}\log_3 y - 3\log_3 z$$

**Hand-worked: Condense**

$$2\log x - \log(x+1) + \tfrac{1}{2}\log(x-1)$$

$$= \log(x^2) - \log(x+1) + \log\!\sqrt{x-1}$$

$$= \log\!\left(\frac{x^2\sqrt{x-1}}{x+1}\right)$$

**Hand-worked: Simplify**

$$\log_4 8$$

Convert: $\log_4 8 = \dfrac{\ln 8}{\ln 4} = \dfrac{3\ln 2}{2\ln 2} = \dfrac{3}{2}$.

Verify: $4^{3/2} = (2^2)^{3/2} = 2^3 = 8$. ✓

```python
import math

# Verify the expansion and condensation examples
x, y, z = 4.0, 9.0, 2.0

# Expansion: log3(x^4 * sqrt(y) / z^3)
direct   = math.log(x**4 * y**0.5 / z**3) / math.log(3)
expanded = 4*math.log(x)/math.log(3) + 0.5*math.log(y)/math.log(3) - 3*math.log(z)/math.log(3)
print(f"Expansion: log3({x}^4 * sqrt({y}) / {z}^3)")
print(f"  Direct:   {direct:.8f}")
print(f"  Expanded: {expanded:.8f}")
print(f"  Match: {math.isclose(direct, expanded)}")

print()
# Condensation: 2*log(x) - log(x+1) + 0.5*log(x-1) for x=4
x = 4.0
left  = 2*math.log10(x) - math.log10(x+1) + 0.5*math.log10(x-1)
right = math.log10(x**2 * math.sqrt(x-1) / (x+1))
print(f"Condensation with x={x}:")
print(f"  Sum form: {left:.8f}")
print(f"  Single log: {right:.8f}")
print(f"  Match: {math.isclose(left, right)}")

print()
# Simplify log4(8) = 3/2
val = math.log(8) / math.log(4)
print(f"log4(8) = ln(8)/ln(4) = {val:.8f}  (exact: 3/2 = {3/2})")
```

**Walkthrough:** `math.log(x) / math.log(b)` is the change of base
formula — computing $\log_b x$ using natural logs. When condensing,
building the argument `x**2 * math.sqrt(x-1) / (x+1)` directly and
computing its log numerically confirms the condensation is correct.

---

### Solving Logarithmic Equations

Equations with logarithms require isolating the log, then converting
to exponential form.

**Strategy:**
1. Use log laws to condense each side to a single log
2. If both sides have the same base log: set arguments equal ($\log_b A = \log_b B \Rightarrow A = B$, since $\log_b$ is injective)
3. If one side has no log: convert to exponential form
4. **Always check** that all arguments remain positive (domain restriction)

**Hand-worked example 1:** Solve $\log_2 x + \log_2(x-2) = 3$.

Condense: $\log_2[x(x-2)] = 3$

Convert: $x(x-2) = 2^3 = 8$

Expand: $x^2 - 2x - 8 = 0$

Factor: $(x-4)(x+2) = 0$, so $x = 4$ or $x = -2$.

**Check domain:** arguments of $\log_2$ must be positive.
- $x = 4$: $\log_2(4)$ and $\log_2(2)$ both defined. ✓
- $x = -2$: $\log_2(-2)$ is undefined. ✗ Rejected.

**Answer:** $x = 4$.

**Hand-worked example 2:** Solve $\log(x) + \log(x+3) = 1$.

Condense: $\log[x(x+3)] = 1$

Convert: $x(x+3) = 10^1 = 10$

Expand: $x^2 + 3x - 10 = 0$

Factor: $(x+5)(x-2) = 0$, so $x = -5$ or $x = 2$.

**Check domain:**
- $x = 2$: $\log(2)$ and $\log(5)$ both defined. ✓
- $x = -5$: $\log(-5)$ undefined. ✗ Rejected.

**Answer:** $x = 2$.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

# Visualise the solution to log2(x) + log2(x-2) = 3
x = np.linspace(2.1, 8, 400)
# start just above 2 because log2(x-2) requires x > 2

lhs = np.log2(x) + np.log2(x - 2)
# np.log2: base-2 logarithm, element-wise

rhs = np.full_like(x, 3)
# np.full_like(array, value): creates an array of the same shape filled with value

fig, ax = plt.subplots(figsize=(8, 5))

ax.plot(x, lhs, color='#2980b9', lw=2.5,
        label='$\\log_2 x + \\log_2(x-2)$')
ax.plot(x, rhs, color='#e74c3c', lw=1.8, linestyle='--',
        label='$y = 3$')

# Mark the solution
ax.plot(4, 3, 'o', color='#27ae60', markersize=11, zorder=5,
        label='Solution: $x=4$')
ax.annotate('$x=4$: $\\log_2(4)+\\log_2(2)=2+1=3$ ✓',
            xy=(4, 3), xytext=(5, 2.4),
            arrowprops=dict(arrowstyle='->', color='#27ae60', lw=1.2),
            fontsize=9, color='#27ae60')

ax.axhline(0, color='#333', lw=0.8)
ax.set_title('Solving $\\log_2 x + \\log_2(x-2) = 3$ graphically\n'
             'Intersection at $x=4$ (domain: $x > 2$)', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('value')
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.full_like(x, 3)` creates an array the same length
as `x`, filled with the constant value 3. This is used to plot the
horizontal line $y=3$ as an array matching the `x` array — necessary
because `ax.plot(x, lhs)` and `ax.plot(x, rhs)` both need arrays of
equal length. The domain restriction ($x > 2$) is enforced by starting
`x` at 2.1 — starting at exactly 2 would give $\log_2(0) = -\infty$.

---

### Practical Logarithm Bases

**Base 10 — The Common Logarithm**

$\log_{10}$ (written $\log$ without a base) is used whenever a
measurement spans many orders of magnitude. The three classic applications:

$$\text{pH} = -\log_{10}[\text{H}^+] \qquad \text{Sound level (dB)} = 10\log_{10}\!\frac{P}{P_0} \qquad \text{Richter scale} = \log_{10}\!\frac{A}{A_0}$$

Each unit of increase on these scales corresponds to a factor of 10
in the underlying quantity.

**Base 2 — The Binary Logarithm**

$\log_2$ appears wherever powers of 2 are the natural unit:

- Binary search on $n$ elements: $\lceil\log_2 n\rceil$ comparisons
- A 32-bit integer can represent $2^{32}$ values; you need 32 bits
  because $\log_2(2^{32}) = 32$
- A balanced binary tree with $n$ nodes has depth $\lfloor\log_2 n\rfloor$

```python
import math
import numpy as np
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# --- Left: pH scale ---
H_conc = np.logspace(-14, 0, 300)
# np.logspace(-14, 0, 300): 300 points from 10^-14 to 10^0
# logarithmically spaced -- appropriate since H+ concentration
# spans 14 orders of magnitude

pH = -np.log10(H_conc)

axes[0].plot(H_conc, pH, color='#2980b9', lw=2.5)
axes[0].set_xscale('log')
# ax.set_xscale('log'): switch x-axis to logarithmic scale
# equivalent to ax.semilogx but applied after the plot call

# Mark reference points
ref_points = [
    (1e-1, "Battery acid"),
    (1e-3, "Lemon juice"),
    (1e-7, "Pure water"),
    (1e-11, "Baking soda"),
    (1e-13, "Bleach"),
]
for H, label in ref_points:
    ph = -math.log10(H)
    axes[0].plot(H, ph, 'o', color='#e74c3c', markersize=8, zorder=5)
    axes[0].text(H*1.5, ph, f'{label}\npH={ph:.0f}', fontsize=7.5)

axes[0].set_xlabel('$[H^+]$ concentration (mol/L)')
axes[0].set_ylabel('pH')
axes[0].set_title('pH $= -\\log_{10}[H^+]$\n'
                  'Each unit = factor of 10 in $[H^+]$', fontsize=11)
axes[0].grid(True, alpha=0.3)

# --- Right: Binary search steps ---
n_vals = np.arange(1, 1025)
steps  = np.ceil(np.log2(n_vals))
# np.ceil: ceiling function -- round up to nearest integer
# np.log2: base-2 logarithm, element-wise

axes[1].step(n_vals, steps, color='#27ae60', lw=2, where='post')
# ax.step: staircase plot -- 'where=post' means the step occurs after each x value
# appropriate here since binary search uses a fixed number of steps
# for any n in each doubling range

axes[1].set_title('Binary search: $\\lceil\\log_2 n\\rceil$ comparisons\n'
                  'Steps double only when $n$ doubles', fontsize=11)
axes[1].set_xlabel('Array size $n$')
axes[1].set_ylabel('Comparisons needed')
axes[1].grid(True, alpha=0.3)

# Annotate doubling points
for k in range(1, 11):
    axes[1].axvline(2**k, color='#cccccc', lw=0.8, linestyle=':')

plt.suptitle('$\\log_{10}$ (pH) and $\\log_2$ (binary search): two practical bases',
             fontsize=12)
plt.tight_layout()
plt.show()

print("Binary search comparisons:")
for n in [10, 100, 1000, 1000000]:
    steps = math.ceil(math.log2(n))
    print(f"  n={n:>10}: {steps} comparisons")
```

**Walkthrough:** `np.logspace(-14, 0, 300)` generates 300 values
logarithmically spaced between $10^{-14}$ and $10^0$ — appropriate
when the data spans many orders of magnitude. `ax.set_xscale('log')`
switches the $x$-axis to logarithmic after plotting, making the wide
range of $[\text{H}^+]$ values visible. `ax.step(..., where='post')`
draws a staircase plot: the value holds constant until the next $x$
point, then jumps — this matches binary search's behaviour where the
same number of steps works for all $n$ in a range until the next
power of 2.

---

### Decibels: A Log Scale in Manufacturing

Sound pressure levels in machining environments are measured in decibels:

$$L = 20 \log_{10}\!\frac{p}{p_0}, \qquad p_0 = 20\ \mu\text{Pa}$$

where $p$ is the measured pressure and $p_0$ is the threshold of human
hearing. The factor of 20 (rather than 10) appears because sound energy
is proportional to pressure squared: $20\log_{10}(p/p_0) = 10\log_{10}(p/p_0)^2$.

A CNC machining centre typically operates at 80–95 dB. OSHA requires
hearing protection above 85 dB for 8-hour exposure.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

p0 = 20e-6   # reference pressure in Pa (20 micropascals)

# Sound levels in machining
sources = {
    'Threshold of hearing':    20e-6,
    'Library':                 2e-4,
    'Conversation':            2e-3,
    'CNC mill (light cut)':    1e-1,
    'CNC mill (heavy cut)':    5e-1,
    'OSHA limit (8hr)':        3.56e-1,  # 85 dB
    'Angle grinder':           2.0,
    'Jet engine (30m)':        200.0,
}

print(f"{'Source':<30} {'Pressure (Pa)':>15} {'dB':>8}")
print("-" * 58)
for label, p in sources.items():
    dB = 20 * math.log10(p / p0)
    print(f"{label:<30} {p:>15.2e} {dB:>8.1f}")
```

**Walkthrough:** `20e-6` is $20 \times 10^{-6}$ Pa — scientific
notation for the reference sound pressure. Each 20 dB increase
corresponds to a factor of 10 in pressure (since $20\log_{10}(10) = 20$),
and a factor of 100 in intensity. The output shows that heavy CNC
machining is around 108 dB — well above the OSHA 8-hour limit.

---

## Connect the Pieces

**What this lesson built on:** Logarithm properties for $\ln$ (Lesson 1.8)
— identical structure, extended to any base. Solving equations (Lesson 1.8).
Change of base (Lesson 1.8) — connects all logarithm bases.

**What this lesson makes possible:** Lesson 1.10 (Exponential and
Logarithmic Equations) — the toolkit is now complete. Lesson 1.11
(Logarithmic Scales — decibels, pH, Richter) develops the applications
introduced here. Stage 5 (Calculus) derives $\frac{d}{dx}\log_b x
= \frac{1}{x \ln b}$ — the same change of base factor. Stage 9 (Algorithms)
— $\log_2 n$, $\log_{10} n$, and $\ln n$ differ only by a constant
factor, which is why big-O analysis writes them all as $O(\log n)$.

---

## Summary

**Logarithm of base $b$:** $\log_b x = y \Leftrightarrow b^y = x$.

**Common bases:** $\log = \log_{10}$ (pH, dB, Richter), $\log_2$ (CS), $\ln$ (science/engineering).

**Three laws** (same for any base):
$$\log_b(MN) = \log_b M + \log_b N$$
$$\log_b(M/N) = \log_b M - \log_b N$$
$$\log_b(M^r) = r\log_b M$$

**Change of base:** $\log_b x = \dfrac{\ln x}{\ln b} = \dfrac{\log x}{\log b}$

**Solving $\log_b A = \log_b B$:** $A = B$ (injectivity of $\log_b$).

**Domain check:** always verify all log arguments are positive after solving.

**New Python:**
- `math.log10(x)` — $\log_{10} x$
- `math.log2(x)` — $\log_2 x$
- `np.log10(x)`, `np.log2(x)` — element-wise versions
- `np.full_like(arr, val)` — array of same shape filled with `val`
- `ax.set_xscale('log')` — logarithmic $x$-axis
- `ax.step(x, y, where='post')` — staircase plot
- `np.ceil(x)` — ceiling function element-wise

---

## Problems

### Math

**1.** Evaluate exactly (no calculator).

(a) $\log_2 32$ &emsp;
(b) $\log_3 \frac{1}{27}$ &emsp;
(c) $\log_5 \sqrt{5}$ &emsp;
(d) $\log_4 8$ &emsp;
(e) $\log_{0.5} 4$

<details>
<summary>Answers</summary>

(a) $5$ &emsp;
(b) $-3$ &emsp;
(c) $\frac{1}{2}$ &emsp;
(d) $\frac{3}{2}$ (since $4^{3/2}=8$) &emsp;
(e) $-2$ (since $0.5^{-2} = 4$)

</details>

---

**2.** Expand completely.

(a) $\log_2\!\left(\dfrac{x^3}{y^2 z}\right)$

(b) $\log\!\sqrt{\dfrac{100 x^4}{y}}$

(c) $\ln\!\left(\dfrac{e^{3x} \cdot x^2}{\sqrt{x+1}}\right)$

<details>
<summary>Answers</summary>

(a) $3\log_2 x - 2\log_2 y - \log_2 z$

(b) $\frac{1}{2}[\log 100 + 4\log x - \log y] = 1 + 2\log x - \frac{1}{2}\log y$

(c) $3x + 2\ln x - \frac{1}{2}\ln(x+1)$

</details>

---

**3.** Condense into a single logarithm.

(a) $3\log x - 2\log y + \log z$

(b) $\frac{1}{2}\ln(x+1) - 2\ln x + \ln 5$

(c) $2\log_3 x + \log_3(x-1) - \log_3(x^2 - 1)$

<details>
<summary>Answers</summary>

(a) $\log\!\dfrac{x^3 z}{y^2}$

(b) $\ln\dfrac{5\sqrt{x+1}}{x^2}$

(c) $\log_3\dfrac{x^2(x-1)}{(x-1)(x+1)} = \log_3\dfrac{x^2}{x+1}$ (after cancelling $x-1$)

</details>

---

**4.** Solve each equation. Reject extraneous solutions.

(a) $\log_3(x+4) = 2$

(b) $\log(x) + \log(x-3) = 1$

(c) $\log_2(x+3) - \log_2(x-1) = 2$

(d) $\ln(2x) = \ln(x+3) + \ln 2$

<details>
<summary>Answers</summary>

(a) $x+4=9 \Rightarrow x=5$ ✓

(b) $x(x-3)=10 \Rightarrow x^2-3x-10=0 \Rightarrow (x-5)(x+2)=0$.
$x=5$ ✓; $x=-2$ rejected (log of negative). **$x=5$**.

(c) $\log_2\frac{x+3}{x-1}=2 \Rightarrow \frac{x+3}{x-1}=4 \Rightarrow x+3=4x-4 \Rightarrow x=\frac{7}{3}$ ✓

(d) $\ln(2x)=\ln(2(x+3)) \Rightarrow 2x=2x+6$. No solution.

</details>

---

**5.** (Proof) Prove the change of base formula $\log_b x = \dfrac{\log_a x}{\log_a b}$
for any valid bases $a$ and $b$.

<details>
<summary>Answer</summary>

Let $y = \log_b x$, so $b^y = x$.
Apply $\log_a$ to both sides: $y \log_a b = \log_a x$.
Divide: $y = \dfrac{\log_a x}{\log_a b}$. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Log law expander**

```python
import math

def expand_log(coefficient, numerator_powers, denominator_powers, base=math.e):
    """
    Expand log_base(coeff * x1^p1 * x2^p2 ... / (y1^q1 * y2^q2 ...)).
    
    coefficient:        numeric coefficient inside the log (e.g. 100)
    numerator_powers:   list of (name, power) for numerator factors
    denominator_powers: list of (name, power) for denominator factors
    base:               log base (default e = ln)
    
    Returns a human-readable string of the expanded form.
    Example: expand_log(1, [('x',3),('y',0.5)], [('z',2)])
    -> "3*log(x) + 0.5*log(y) - 2*log(z)"
    """
    pass  # your code here


# --- tests: do not modify ---
result = expand_log(1, [('x', 3)], [('y', 2), ('z', 1)])
assert '3' in result and '2' in result, f"Got: {result}"
assert '-' in result, "Denominator should subtract"

result2 = expand_log(100, [('x', 4)], [], base=10)
assert '2.0' in result2 or '2*' in result2, f"log10(100)=2 missing: {result2}"

print("✓ Challenge 1 passed!")
print(f"  expand_log(1, [('x',3),('y',0.5)], [('z',2)]): "
      f"{expand_log(1, [('x',3),('y',0.5)], [('z',2)])}")
```

---

**Challenge 2 — Log equation solver**

```python
import math

def solve_log_equation(base, lhs_args, rhs_value):
    """
    Solve: log_base(arg1) + log_base(arg2) = rhs_value
    where each arg is a linear function of x: (a, b) represents ax + b.
    
    Condenses: log_base((a1*x+b1)(a2*x+b2)) = rhs_value
    Converts:  (a1*x+b1)(a2*x+b2) = base^rhs_value
    Solves the resulting quadratic.
    Returns list of valid solutions (positive arguments only).
    
    lhs_args: list of (a, b) tuples representing ax+b inside each log
    rhs_value: the right-hand side constant
    """
    pass  # your code here


# --- tests: do not modify ---
# log2(x) + log2(x-2) = 3  =>  x=4
sols = solve_log_equation(2, [(1,0), (1,-2)], 3)
assert 4.0 in [round(s,6) for s in sols], f"Expected x=4, got {sols}"

# log(x) + log(x+3) = 1  =>  x=2
sols2 = solve_log_equation(10, [(1,0),(1,3)], 1)
assert 2.0 in [round(s,6) for s in sols2], f"Expected x=2, got {sols2}"

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Decibel calculator**

```python
import math

def pressure_to_dB(pressure_pa, p0=20e-6):
    """Convert sound pressure (Pa) to decibels."""
    pass

def dB_to_pressure(dB, p0=20e-6):
    """Convert decibels to sound pressure (Pa)."""
    pass

def combined_dB(dB_levels):
    """
    Compute the combined dB level from multiple independent sources.
    
    When combining independent sound sources, pressures add in quadrature:
    p_total^2 = p1^2 + p2^2 + ...
    So: L_total = 10*log10(10^(L1/10) + 10^(L2/10) + ...)
    
    dB_levels: list of individual dB values
    """
    pass


# --- tests: do not modify ---
assert math.isclose(pressure_to_dB(20e-6), 0.0,   abs_tol=0.01)  # threshold = 0 dB
assert math.isclose(pressure_to_dB(2e-5),  0.0,   abs_tol=0.01)  # same
assert math.isclose(pressure_to_dB(0.2),   80.0,  abs_tol=0.01)  # 80 dB
assert math.isclose(dB_to_pressure(0),     20e-6, rel_tol=1e-6)
assert math.isclose(dB_to_pressure(80),    0.2,   rel_tol=1e-4)

# Two identical 80 dB sources combine to ~83 dB (doubles intensity = +3 dB)
combined = combined_dB([80, 80])
assert math.isclose(combined, 83.01, abs_tol=0.01), f"Got {combined:.2f}"

print("✓ Challenge 3 passed!")
print(f"  Two 80 dB sources combined: {combined_dB([80, 80]):.2f} dB")
print(f"  Three 80 dB sources combined: {combined_dB([80, 80, 80]):.2f} dB")
```

<details>
<summary>Hint for combined_dB</summary>

Convert each dB level to intensity (proportional to $10^{L/10}$), sum
the intensities, convert back: $L_\text{total} = 10\log_{10}\!\sum_i 10^{L_i/10}$.

</details>

---

### Extension

**4. ★** Prove that for any $n$ independent identical sound sources each
at level $L$ dB, the combined level is $L + 10\log_{10}(n)$ dB.
What is the combined level of 10 sources at 80 dB? 100 sources?

<details>
<summary>Answer</summary>

Each source has intensity proportional to $10^{L/10}$. Combined:
$n \times 10^{L/10}$. In dB: $10\log_{10}(n \cdot 10^{L/10}) = 10\log_{10}(n) + 10\cdot L/10 = L + 10\log_{10}(n)$.

10 sources at 80 dB: $80 + 10\log_{10}(10) = 80 + 10 = 90$ dB.
100 sources: $80 + 10\log_{10}(100) = 80 + 20 = 100$ dB. $\square$

</details>

**5. ★** The **Benford's Law** states that in many naturally occurring
datasets, the first digit $d$ appears with frequency
$\log_{10}(1 + 1/d)$.

(a) Verify that these probabilities sum to 1:
$\sum_{d=1}^{9} \log_{10}(1 + 1/d) = 1$.

(b) Explain why using log laws.

(c) Implement a function that checks whether a dataset follows Benford's Law.

```python
import math
import collections

def follows_benfords_law(data, tolerance=0.05):
    """
    Check if the first digits of data approximately follow Benford's Law.
    Returns True if all first-digit frequencies are within tolerance
    of the expected Benford frequency.
    
    data: list of positive numbers
    tolerance: maximum allowed deviation from expected frequency
    """
    pass

# Tests
import random
random.seed(0)
# Fibonacci numbers follow Benford's Law
fibs = [1, 1]
while fibs[-1] < 1e15:
    fibs.append(fibs[-1] + fibs[-2])

assert follows_benfords_law(fibs, tolerance=0.03)

# Uniform random integers do NOT follow Benford's Law
uniform = [random.randint(1, 999) for _ in range(10000)]
assert not follows_benfords_law(uniform, tolerance=0.03)

print("✓ Extension 5 passed!")
```
