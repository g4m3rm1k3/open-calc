# Stage 1, Lesson 1.7 — The Number $e$: Why It Appears Everywhere
**Threads:** Math · Physics · CS  
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

In Lesson 1.6 every exponential function $b^x$ was equally valid —
there was nothing special about any particular base. This lesson
identifies the one base that is not arbitrary: $e \approx 2.71828\ldots$,
Euler's number. It is special for a precise reason — it is the unique
base for which the exponential function is its own rate of change. That
property makes $e^x$ the natural unit of growth: every exponential
process, when described honestly, involves $e$. Compound interest, heat
transfer, radioactive decay, RC circuits, population models — all are
written most cleanly with $e$. By the end of this lesson you will
understand three independent definitions of $e$ that all converge to the
same number, know why $e^x$ is the "right" exponential, and be able to
convert between any base $b$ and base $e$.

---

## Historical Context

The number $e$ was first encountered by Jacob Bernoulli in 1683 while
studying compound interest — specifically the question of what happens
when interest is compounded more and more frequently. He noticed that
$(1 + 1/n)^n$ approaches a fixed limit as $n \to \infty$ but could not
identify the limit precisely. Leonhard Euler named the constant $e$ in
1731 and proved that it is the limit of $(1 + 1/n)^n$. Euler also
calculated $e$ to 18 decimal places and proved it is irrational. The
proof that $e$ is transcendental (not a root of any polynomial with
rational coefficients) was given by Hermite in 1873 — a much harder
result. Euler's identity $e^{i\pi} + 1 = 0$, connecting $e$ with $\pi$,
$i$, 1, and 0, is often called the most beautiful equation in mathematics.

---

## What You Need To Know First

- **Exponential functions** $b^x$ — Lesson 1.6. Properties, shape, growth vs decay.
- **The informal idea of a limit** — Lesson 0.1 introduced sequences.
  We use limits informally here: "the value that $(1 + 1/n)^n$ approaches
  as $n$ grows without bound."
- **The slope of a curve** — informally: the steepness of the graph at a
  point. Formally defined in Stage 5 (the derivative). Used here
  numerically and visually to motivate $e$.

---

## The Lesson

### The Compound Interest Motivation

Start with a concrete financial question that leads directly to $e$.

**Setup:** You invest \$1 at 100\% annual interest. How much do you have
after one year, depending on how often interest is compounded?

- **Compounded annually** ($n=1$): $1 \cdot \left(1 + \frac{1}{1}\right)^1 = 2.00$
- **Compounded semi-annually** ($n=2$): $\left(1 + \frac{1}{2}\right)^2 = 2.25$
- **Compounded quarterly** ($n=4$): $\left(1 + \frac{1}{4}\right)^4 \approx 2.4414$
- **Compounded monthly** ($n=12$): $\left(1 + \frac{1}{12}\right)^{12} \approx 2.6130$
- **Compounded daily** ($n=365$): $\left(1 + \frac{1}{365}\right)^{365} \approx 2.7146$
- **Compounded continuously** ($n \to \infty$): $\lim_{n \to \infty}\left(1 + \frac{1}{n}\right)^n = e$

The sequence converges to a fixed number. That number is $e$.

**Definition 1 (Limit):**

$$e = \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n \approx 2.71828182845904523536\ldots$$

This is the historical definition. It says $e$ is the amount \$1 grows
to when compounded continuously at 100\% for one year.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Convergence of (1 + 1/n)^n to e
n_values = [1, 2, 5, 10, 50, 100, 1000, 10000, 1000000]
approx   = [(1 + 1/n)**n for n in n_values]

print("Convergence of (1 + 1/n)^n to e:\n")
print(f"{'n':>10}  {'(1+1/n)^n':>14}  {'error':>12}")
print("-" * 42)
for n, a in zip(n_values, approx):
    error = abs(a - math.e)
    print(f"{n:>10}  {a:>14.10f}  {error:>12.2e}")

print(f"\n  e = {math.e:.10f}")

# Plot convergence
fig, ax = plt.subplots(figsize=(9, 5))

n_cont = np.logspace(0, 6, 400)
# np.logspace(start, stop, n): n values logarithmically spaced
# from 10^start to 10^stop -- useful when n ranges over many orders of magnitude
y_cont = (1 + 1/n_cont)**n_cont

ax.semilogx(n_cont, y_cont, color='#2980b9', lw=2.5,
            label='$(1 + 1/n)^n$')
# ax.semilogx: logarithmic scale on x-axis, linear on y-axis
# -- makes the convergence visible across 6 orders of magnitude

ax.axhline(math.e, color='#e74c3c', lw=1.5, linestyle='--',
           label=f'$e \\approx {math.e:.5f}$')

# Mark the integer values of n
ax.scatter([n for n in n_values if n <= 1e5],
           [(1+1/n)**n for n in n_values if n <= 1e5],
           color='#2980b9', s=60, zorder=5)

ax.set_xlabel('$n$ (number of compounding periods, log scale)')
ax.set_ylabel('$(1 + 1/n)^n$')
ax.set_title('$(1 + 1/n)^n \\to e$ as $n \\to \\infty$\n'
             'Continuous compounding of \\$1 at 100\\% for 1 year', fontsize=11)
ax.legend(fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.logspace(0, 6, 400)` generates 400 values from
$10^0 = 1$ to $10^6 = 1{,}000{,}000$ spaced evenly on a log scale —
so the values are densely packed near 1 and sparse near a million.
`ax.semilogx(...)` plots with a logarithmic $x$-axis, appropriate when
the data spans many orders of magnitude. On a linear scale, the curve
would look almost flat after $n=100$ because the change from $n=1000$
to $n=1{,}000{,}000$ is tiny in absolute terms but significant relative
to the starting point.

---

### The Slope Motivation

Here is a completely different way to arrive at $e$, from a calculus
perspective (fully developed in Stage 5).

**Observation:** For any base $b$, the slope of $b^x$ at $x=0$
(the steepness of the curve at the $y$-intercept) turns out to be
exactly $\ln(b)$ — the natural logarithm of $b$.

Let us verify this numerically. The slope at $x=0$ is approximately:

$$\text{slope} \approx \frac{b^h - b^0}{h} = \frac{b^h - 1}{h} \quad \text{for small } h$$

```python
import numpy as np
import math

h = 1e-7   # small step for numerical slope estimation

print("Slope of b^x at x=0, numerically:\n")
print(f"{'base b':>10}  {'slope at x=0':>14}  {'ln(b)':>12}")
print("-" * 42)

for b in [2, 2.5, math.e, 3, 10]:
    slope = (b**h - 1) / h   # numerical derivative at x=0
    ln_b  = math.log(b)       # math.log: natural log, base e
    print(f"{b:>10.5f}  {slope:>14.8f}  {ln_b:>12.8f}")

print(f"\n  For b = e: slope = {(math.e**h - 1)/h:.8f}")
print(f"  This is the ONLY base where the slope at x=0 equals exactly 1.")
```

**Walkthrough:** `(b**h - 1) / h` computes the **difference quotient**
— the rise over run for a very small step `h`. As `h → 0`, this
approaches the true slope at $x=0$. `h = 1e-7` is $10^{-7}$, small
enough to give 6+ decimal places of accuracy. The output confirms that
the slope equals `math.log(b)` for every base — and that the unique base
where slope $= 1$ at $x=0$ is $b = e$.

**Definition 2 (Slope):**

$e$ is the unique positive number such that the exponential function
$f(x) = e^x$ has slope exactly 1 at $x = 0$.

Equivalently: $e^x$ is the unique exponential function that is its own
rate of change. This property — $\frac{d}{dx}e^x = e^x$, developed
fully in Stage 5 — is why $e$ appears in physics and engineering: any
process where the rate of change is proportional to the current value
is modelled by $e^x$.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

x = np.linspace(-2, 2, 300)

fig, ax = plt.subplots(figsize=(9, 6))

for b, color, label in [
    (2,      '#8e44ad', '$2^x$ (slope at $x=0$: $\\ln 2 \\approx 0.693$)'),
    (math.e, '#e74c3c', '$e^x$ (slope at $x=0$: exactly 1)'),
    (3,      '#27ae60', '$3^x$ (slope at $x=0$: $\\ln 3 \\approx 1.099$)'),
]:
    ax.plot(x, b**x, color=color, lw=2.5, label=label)

# Draw the tangent line at x=0 for e^x: slope=1 through (0,1)
x_tang = np.linspace(-1.2, 1.5, 100)
ax.plot(x_tang, 1 + 1*x_tang, color='#e74c3c', lw=1.2,
        linestyle='--', alpha=0.7, label='Tangent to $e^x$ at $x=0$: slope$=1$')

ax.plot(0, 1, 'o', color='#e74c3c', markersize=9, zorder=5)

ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)
ax.set_title('$e$ is the unique base where the slope at $(0,1)$ is exactly 1',
             fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$b^x$')
ax.set_ylim(-0.5, 8)
ax.legend(fontsize=9, loc='upper left')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** The tangent line at $(0,1)$ for $e^x$ has slope 1,
so its equation is $y = 1 + x$ (point-slope form through $(0,1)$ with
slope 1). `x_tang = np.linspace(-1.2, 1.5, 100)` creates a shorter
range than the full plot so the tangent line is only drawn near the
point of tangency, not across the full figure.

---

### The Continuous Growth Formula

In Lesson 1.6 we used $A(t) = A_0 \cdot b^t$ for growth/decay with
base $b$. The standard form used in science and engineering writes any
exponential in base $e$:

$$A(t) = A_0 \cdot e^{kt}$$

where $k$ is the **continuous growth rate** (positive for growth,
negative for decay).

**Converting between bases:** any exponential $b^t$ can be written
as $e^{kt}$ where $k = \ln(b)$:

$$b^t = e^{t \ln b} = e^{kt}, \qquad k = \ln(b)$$

This is because $e^{\ln b} = b$ (the exponential and logarithm are
inverses — formally proved in Lesson 1.8).

**Interpretation of $k$:**
- $k > 0$: growth at rate $k$ per unit time
- $k < 0$: decay at rate $|k|$ per unit time
- $|k|$: the fraction added (or removed) per unit time in the limit
  of continuous compounding

**Compound interest in base $e$:**

$$A(t) = P e^{rt}$$

where $P$ is the principal, $r$ is the annual rate, and $t$ is time
in years. This is the limit of $(1 + r/n)^{nt}$ as $n \to \infty$.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Compare discrete compounding vs continuous for $1000 at 5% over 10 years
P, r, t_max = 1000, 0.05, 20
t = np.linspace(0, t_max, 300)

fig, ax = plt.subplots(figsize=(9, 6))

# Continuous: A = Pe^(rt)
A_cont = P * np.exp(r * t)
# np.exp(x): element-wise e^x -- numpy's version of math.exp, works on arrays

ax.plot(t, A_cont, color='#e74c3c', lw=2.5, label='Continuous: $Pe^{rt}$')

# Discrete compounding for several n values
for n, color, style in [
    (1,   '#2980b9', '-'),
    (12,  '#27ae60', '--'),
    (365, '#8e44ad', ':'),
]:
    A_disc = P * (1 + r/n)**(n*t)
    ax.plot(t, A_disc, color=color, lw=1.8, linestyle=style,
            label=f'$n={n}$ ({"annual" if n==1 else "monthly" if n==12 else "daily"})')

ax.set_title(f'\\$1000 at {r*100:.0f}\\% interest: discrete vs continuous compounding',
             fontsize=11)
ax.set_xlabel('Time (years)')
ax.set_ylabel('Amount (\\$)')
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# Print final values
print(f"After {t_max} years at {r*100:.0f}% interest:")
for n, label in [(1,'annual'), (12,'monthly'), (365,'daily')]:
    A = P * (1 + r/n)**(n*t_max)
    print(f"  n={n:>5} ({label}):    ${A:.2f}")
print(f"  continuous:          ${P * math.exp(r*t_max):.2f}")
```

**Walkthrough:** `np.exp(r * t)` computes $e^{rt}$ element-wise on
the array `t` — `np.exp` is numpy's version of `math.exp`, extended
to arrays. `math.exp(x)` works for a single scalar; `np.exp(x)`
works for arrays. Both compute $e^x$ to full floating-point precision.
The plot shows all four curves converging — continuous compounding is the
limit, and the gap between discrete and continuous shrinks as $n$ increases.

---

### $e$ as a Series (Definition 3)

There is a third equivalent definition of $e$, from infinite series
(formally developed in Stage 5):

$$e = \sum_{k=0}^{\infty} \frac{1}{k!} = 1 + 1 + \frac{1}{2} + \frac{1}{6} + \frac{1}{24} + \cdots = \frac{1}{0!} + \frac{1}{1!} + \frac{1}{2!} + \frac{1}{3!} + \cdots$$

where $k! = 1 \times 2 \times 3 \times \cdots \times k$ is the factorial
of $k$ (with $0! = 1$ by convention).

This is the fastest-converging of the three definitions — just 10 terms
gives $e$ to 7 decimal places.

```python
import math

def compute_e_series(n_terms):
    """
    Approximate e using the first n_terms of the series
    e = sum(1/k! for k = 0, 1, 2, ...).
    
    Returns the approximation.
    """
    total     = 0.0
    factorial = 1    # factorial starts at 0! = 1

    for k in range(n_terms):
        if k > 0:
            factorial *= k    # update k! = k * (k-1)!
        total += 1 / factorial

    return total

print("Convergence of the series e = Σ 1/k!:\n")
print(f"{'terms':>7}  {'approximation':>18}  {'error':>12}")
print("-" * 44)
for n in range(1, 16):
    approx = compute_e_series(n)
    error  = abs(approx - math.e)
    print(f"{n:>7}  {approx:>18.15f}  {error:>12.2e}")

print(f"\n  True e = {math.e:.15f}")
```

**Walkthrough:** `factorial *= k` is compound multiplication-assignment:
each iteration multiplies the running factorial by `k`, so after
iteration $k$, `factorial` holds $k!$. After iteration 0 (where
$k=0$, the `if k > 0` skips the update), `factorial = 1 = 0!`. After
$k=1$: `factorial = 1`. After $k=2$: `factorial = 2`. After $k=3$:
`factorial = 6`. And so on. This is more efficient than calling
`math.factorial(k)` inside the loop because it reuses the previous
value rather than recomputing from scratch.

---

### Base Conversion

Any exponential $A_0 \cdot b^t$ can be rewritten in base $e$, and
any $A_0 \cdot e^{kt}$ can be rewritten in base $b$:

$$A_0 \cdot b^t = A_0 \cdot e^{t \ln b} \qquad \text{and} \qquad A_0 \cdot e^{kt} = A_0 \cdot (e^k)^t = A_0 \cdot b^t \text{ where } b = e^k$$

**Hand-worked example:** The tool wear model from Lesson 1.6 used
$W(t) = 100 \cdot 0.85^t$. Write this in base $e$.

$$k = \ln(0.85) = \ln(1 - 0.15) \approx -0.1625$$

$$W(t) = 100 \cdot e^{-0.1625 t}$$

The continuous decay rate is $|k| = 0.1625$ per hour, or about
16.25\% per hour continuously.

**Note:** The discrete rate (15\% per hour as in $b=0.85$) and the
continuous rate (16.25\% per hour as in $k=-0.1625$) describe the
same physical process — just in different mathematical languages.

```python
import math
import numpy as np

# Convert b^t ↔ e^(kt) forms
print("Base conversion: b^t ↔ e^(kt)\n")
print(f"{'Base b':>10}  {'k = ln(b)':>12}  {'Check e^k':>12}")
print("-" * 40)

for b in [0.5, 0.85, 0.9, 1.0, 2.0, math.e, 10.0]:
    if b == 1.0:
        print(f"{b:>10.4f}  {'undefined':>12}  {'(b=1 excluded)':>12}")
        continue
    k    = math.log(b)      # k = ln(b)
    e_k  = math.e**k        # should recover b
    print(f"{b:>10.4f}  {k:>12.6f}  {e_k:>12.6f}")

print()
# Tool wear: both forms give the same answer
W0, b = 100, 0.85
k = math.log(b)   # continuous rate
t_vals = [0, 1, 5, 10]

print("Tool wear: W(t) = 100*0.85^t  vs  W(t) = 100*e^(-0.1625t)")
print(f"\n{'t':>5}  {'100*0.85^t':>14}  {'100*e^(kt)':>14}  {'Match':>7}")
print("-" * 46)
for t in t_vals:
    form1 = W0 * b**t
    form2 = W0 * math.e**(k*t)
    match = "✓" if abs(form1 - form2) < 1e-8 else "✗"
    print(f"{t:>5}  {form1:>14.6f}  {form2:>14.6f}  {match:>7}")
```

**Walkthrough:** `math.log(b)` computes $\ln(b)$ — the natural log
(base $e$). `math.e**k` raises $e$ to the power $k$, which should
recover $b$ exactly (since $e^{\ln b} = b$). The small numerical errors
in floating-point confirm this is working correctly: `math.log(0.85)`
gives $k \approx -0.16252$, and `math.e**k` returns $0.85000\ldots$
to full precision.

---

## Connect the Pieces

**What this lesson built on:** Exponential functions $b^x$ (Lesson 1.6)
— $e^x$ is the special case where $b = e$. The compound interest
calculation is the concrete motivation. The informal limit concept
from Lesson 0.1.

**What this lesson makes possible:** Lesson 1.8 (the natural logarithm
$\ln$) — defined as the inverse of $e^x$. The identity $e^{\ln b} = b$,
used informally here, is proved there. Stage 5 (Calculus) proves
$\frac{d}{dx}e^x = e^x$ rigorously, which is why the slope definition
of $e$ is true. Lesson 1.13 uses $e$ in the Taylor Tool Life equation.
Stage 7 (Differential Equations) — every solution to $y' = ky$ is
$y = Ce^{kt}$, making $e$ the fundamental constant of all natural growth
and decay.

**In CS:** The natural log appears in the complexity of binary search
($O(\log n)$), sorting ($O(n \log n)$), and information theory
($H = -\sum p_i \ln p_i$, the entropy formula from Stage 7). Whenever
a `math.log` appears in an algorithm or formula, it is computing $\ln$
— and the reason it is the natural log, not log base 2 or log base 10,
is that $e$ is the correct base for continuous processes.

---

## Summary

**Three definitions of $e$, all equivalent:**

$$e = \lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n = \text{unique base where slope of } b^x \text{ at } x=0 \text{ is } 1 = \sum_{k=0}^{\infty}\frac{1}{k!}$$

$$e \approx 2.71828182845904523536\ldots$$

**Continuous growth/decay:** $A(t) = A_0 e^{kt}$, where:
- $k > 0$: growth; $k < 0$: decay
- $k = \ln(b)$ converts from base $b$ to base $e$
- $b = e^k$ converts from continuous rate $k$ to discrete base $b$

**Continuous compounding:** $A = Pe^{rt}$ is the limit of
$P(1 + r/n)^{nt}$ as $n \to \infty$.

**New Python:**
- `np.exp(x)` — $e^x$ element-wise on arrays (use instead of `math.e**x` for arrays)
- `math.exp(x)` — $e^x$ for a single scalar
- `np.logspace(start, stop, n)` — logarithmically spaced values
- `ax.semilogx(...)` — plot with log scale on $x$-axis

---

## Problems

### Math

**1.** Evaluate exactly or to 4 decimal places.

(a) $e^0$ &emsp; (b) $e^1$ &emsp; (c) $e^{-1}$ &emsp;
(d) $e^{0.5}$ &emsp; (e) $e^{\ln 3}$ &emsp; (f) $e^{2\ln 5}$

<details>
<summary>Answers</summary>

(a) $1$ &emsp; (b) $e \approx 2.7183$ &emsp; (c) $1/e \approx 0.3679$ &emsp;
(d) $\sqrt{e} \approx 1.6487$ &emsp; (e) $3$ (since $e^{\ln 3} = 3$) &emsp;
(f) $e^{\ln 25} = 25$

</details>

---

**2.** Convert each model to base $e$ form $A_0 e^{kt}$ by finding $k$.

(a) $P(t) = 500 \cdot 1.08^t$ (population growing 8\% per year)

(b) $N(t) = 200 \cdot 0.97^t$ (radioactive material, 3\% decays per day)

(c) $V(t) = 1000 \cdot 2^{t/5}$ (voltage doubling every 5 seconds)

<details>
<summary>Answers</summary>

(a) $k = \ln(1.08) \approx 0.0770$. $P(t) = 500e^{0.0770t}$.

(b) $k = \ln(0.97) \approx -0.0305$. $N(t) = 200e^{-0.0305t}$.

(c) $1.08^t = e^{t\ln 1.08}$. For $2^{t/5}$: $k = \ln(2)/5 \approx 0.1386$.
$V(t) = 1000e^{0.1386t}$.

</details>

---

**3.** \$5000 is invested at 6\% annual interest. Find the final amount
after 15 years under each compounding scheme.

(a) Annually &emsp; (b) Monthly &emsp; (c) Continuously

Which earns the most? By how much over annual compounding?

<details>
<summary>Answers</summary>

(a) $5000(1.06)^{15} \approx \$11{,}982.82$

(b) $5000(1+0.06/12)^{180} \approx \$12{,}270.49$

(c) $5000e^{0.06 \times 15} = 5000e^{0.9} \approx \$12{,}298.02$

Continuous earns the most. Gain over annual: $\$12{,}298.02 - \$11{,}982.82 = \$315.20$.

</details>

---

**4.** (Proof) Show that the three values of $(1+1/n)^n$ for $n=1,2,4$
are strictly increasing, and that they are all less than 3.

<details>
<summary>Answer</summary>

$n=1$: $2$. $n=2$: $2.25$. $n=4$: $\approx 2.4414$.
Strictly increasing: $2 < 2.25 < 2.4414$. ✓

All less than 3: $(1+1/n)^n \leq e < 3$ for all $n$ (since $e \approx 2.718 < 3$).
Alternatively bound directly: $(1+1/n)^n < e^1 = e < 3$,
using $1+x \leq e^x$ for all $x$ (from the Taylor series, Stage 5). $\square$

</details>

---

### Code Challenges

**Challenge 1 — Compute $e$ three ways**

```python
import math

def e_from_limit(n):
    """Approximate e using (1 + 1/n)^n."""
    pass

def e_from_series(n_terms):
    """Approximate e using the first n_terms of sum(1/k!)."""
    pass

def e_from_builtin():
    """Return Python's built-in value of e."""
    return math.e


# --- tests: do not modify ---
assert abs(e_from_limit(1_000_000)  - math.e) < 1e-5
assert abs(e_from_series(15)        - math.e) < 1e-12
assert e_from_builtin() == math.e

# Series converges much faster than the limit
limit_error  = abs(e_from_limit(1000)   - math.e)
series_error = abs(e_from_series(10)    - math.e)
assert series_error < limit_error, \
    f"Series should converge faster: {series_error:.2e} vs {limit_error:.2e}"

print("✓ Challenge 1 passed!")
print(f"  Limit (n=1e6):   {e_from_limit(1_000_000):.10f}")
print(f"  Series (15 terms):{e_from_series(15):.15f}")
print(f"  math.e:          {math.e:.15f}")
```

---

**Challenge 2 — Continuous vs discrete compounding**

```python
import math

def compound_discrete(principal, rate, n, years):
    """A = P(1 + r/n)^(nt)"""
    pass

def compound_continuous(principal, rate, years):
    """A = Pe^(rt)"""
    pass


# --- tests: do not modify ---
import math

# $1000 at 5% for 10 years
P, r, t = 1000, 0.05, 10

annual     = compound_discrete(P, r, 1,   t)
monthly    = compound_discrete(P, r, 12,  t)
daily      = compound_discrete(P, r, 365, t)
continuous = compound_continuous(P, r, t)

assert abs(annual     - 1628.89)  < 0.01
assert abs(monthly    - 1647.01)  < 0.01
assert abs(daily      - 1648.66)  < 0.01
assert abs(continuous - 1648.72)  < 0.01

# Continuous always >= discrete
for n in [1, 4, 12, 52, 365]:
    disc = compound_discrete(P, r, n, t)
    cont = compound_continuous(P, r, t)
    assert cont >= disc, f"Continuous should dominate discrete (n={n})"

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Visualise the slope property**

Plot $f(x) = e^x$, $g(x) = 2^x$, and $h(x) = 3^x$ on the same axes.
For each, draw the tangent line at $x=0$ (the line through $(0,1)$
with slope equal to $\ln(b)$). Label each tangent with its slope.

```python
import matplotlib.pyplot as plt
import numpy as np
import math

# Your code here.
# Tangent at (0,1) for b^x has slope ln(b), equation: y = 1 + ln(b)*x
# Only draw each tangent for a short range near x=0.
```

<details>
<summary>Expected output</summary>

Three exponential curves all crossing $(0,1)$. Three tangent lines also
crossing $(0,1)$ with different slopes: $\ln 2 \approx 0.693$ (shallow),
$\ln e = 1$ (45°), $\ln 3 \approx 1.099$ (steep). The $e^x$ tangent
is the unique one with slope exactly 1.

</details>

---

### Extension

**4. ★** Prove that the sequence $a_n = (1 + 1/n)^n$ is strictly
increasing for $n \geq 1$.

*(Hint: use the AM-GM inequality: for positive reals,
$\frac{x_1 + x_2 + \cdots + x_k}{k} \geq (x_1 x_2 \cdots x_k)^{1/k}$.
Apply it to a cleverly chosen set of $(n+1)$ terms.)*

<details>
<summary>Approach</summary>

Apply AM-GM to $n+1$ numbers: $n$ copies of $(1 + 1/n)$ and one copy of $1$:

$$\frac{n(1+1/n) + 1}{n+1} \geq \left((1+1/n)^n \cdot 1\right)^{1/(n+1)}$$

Left side: $\frac{n + 1 + 1}{n+1} = \frac{n+2}{n+1} = 1 + \frac{1}{n+1}$.

So: $1 + \frac{1}{n+1} \geq (1+1/n)^{n/(n+1)}$.

Raise both sides to the power $n+1$:
$(1+1/(n+1))^{n+1} \geq (1+1/n)^n$.

Therefore $a_{n+1} \geq a_n$, with equality only if all $n+1$ terms are equal
(which requires $1+1/n = 1$, impossible for finite $n$). So the inequality
is strict: $a_{n+1} > a_n$. $\square$

</details>

**5. ★** Using the series definition $e = \sum_{k=0}^{\infty} 1/k!$,
prove that $e$ is irrational. *(This is Euler's original proof, 1737.)*

<details>
<summary>Sketch</summary>

Suppose $e = p/q$ for integers $p$, $q > 0$. Multiply both sides by $q!$:
$q! \cdot e = q! \cdot p/q = (q-1)! \cdot p$, an integer.

But $q! \cdot e = q! \sum_{k=0}^{\infty} 1/k! = \sum_{k=0}^{q} q!/k! + \sum_{k=q+1}^{\infty} q!/k!$.

The first sum is an integer. The second sum equals:
$\frac{1}{q+1} + \frac{1}{(q+1)(q+2)} + \cdots$,
which is between 0 and $\sum_{j=1}^{\infty}(1/(q+1))^j = 1/q \leq 1$.

So $q! \cdot e$ = integer + (something strictly between 0 and 1) —
which is not an integer. But we said $q! \cdot e$ is an integer. Contradiction.
Therefore $e$ is irrational. $\blacksquare$

</details>
