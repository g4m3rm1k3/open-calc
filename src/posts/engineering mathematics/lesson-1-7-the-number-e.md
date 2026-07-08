# Stage 1, Lesson 1.7 — The Number $e$: Its Definition and Why It Appears
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

There is a particular exponential function — $f(x) = e^x$, where
$e \approx 2.71828$ — that appears everywhere in science and engineering.
Not because it was chosen by convention, but because it is the only
exponential function whose rate of change at every point equals its
current value. That property makes $e^x$ the natural language for
describing any quantity whose rate of change is proportional to itself:
population growth, radioactive decay, charging capacitors, compound
interest compounded at every instant. This lesson derives $e$ from
three different directions — a compounding limit, a calculus condition,
and an infinite series — and shows why all three arrive at the same
number. By the end you can state the precise definition of $e$,
compute it to arbitrary precision using the series, recognise it in
physical models, connect it to the $RC$ time constant in electronics,
and implement exponential models in code.

---

## Historical Context

Jacob Bernoulli discovered the number $e$ in 1683 while studying
compound interest. He asked: if you invest one unit at 100% annual
interest, how does the final balance depend on how frequently you
compound? Compounding once gives 2.0. Compounding twice gives
$(1 + \frac{1}{2})^2 = 2.25$. Compounding $n$ times gives
$(1 + \frac{1}{n})^n$. Bernoulli noticed that this sequence increases
but stays below 3, approaching a limit he could not identify. The
constant first appeared in a letter by Leibniz in 1690 under the
letter $b$. Euler, in a 1731 letter, was the first to call it $e$ —
almost certainly for "exponential," not for himself — and in his 1748
textbook *Introductio in Analysin Infinitorum* he proved that
$e = 1 + 1 + \frac{1}{2!} + \frac{1}{3!} + \cdots$, gave $e$ to 23
decimal places, and established the connection $e^{i\pi} + 1 = 0$
that would later be called the most beautiful equation in mathematics.

---

## What You Need To Know First

- **Exponential functions** — Lesson 1.6. $e^x$ is an exponential
  function with base $e$; all properties from Lesson 1.6 apply.
- **Functions and domain/range** — Lesson 0.6. $e^x: \mathbb{R} \to (0, \infty)$.
- **Factorial notation** — new here: $n! = n \cdot (n-1) \cdots 2 \cdot 1$,
  with the convention $0! = 1$. So $3! = 6$, $4! = 24$, $5! = 120$.
  Factorials will appear extensively in Stage 5 (Taylor series).

---

## The Lesson

### Bernoulli's Compounding Limit

Suppose you deposit \$1 at an interest rate of 100% per year. How
much do you have after one year, depending on how frequently the
interest is added?

- **Annual (once):** $\left(1 + 1\right)^1 = 2.000$
- **Semi-annual (twice):** $\left(1 + \tfrac{1}{2}\right)^2 = 2.250$
- **Quarterly:** $\left(1 + \tfrac{1}{4}\right)^4 \approx 2.4414$
- **Monthly:** $\left(1 + \tfrac{1}{12}\right)^{12} \approx 2.6130$
- **Daily:** $\left(1 + \tfrac{1}{365}\right)^{365} \approx 2.7146$
- **Hourly:** $\left(1 + \tfrac{1}{8760}\right)^{8760} \approx 2.7181$

Each more frequent compounding gives more money, but the gains
shrink. The sequence converges. Its limit is:

$$\boxed{e = \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n \approx 2.71828\,18284\,59045\ldots}$$

This is the **limit definition** of $e$.

```python
import math

ns = [1, 2, 4, 12, 52, 365, 8760, 525600, 1_000_000]
# 1_000_000: the underscore is a Python readability feature -- ignored by the interpreter
# These represent: annual, semi-annual, quarterly, monthly, weekly, daily, hourly,
# per-minute, and one-million-times-per-year compounding.

print(f"{'n':>10} | {'(1+1/n)^n':>16} | {'error from e':>14}")
print("-" * 47)
for n in ns:
    val   = (1 + 1/n)**n
    error = abs(val - math.e)
    print(f"{n:>10,} | {val:>16.10f} | {error:>14.2e}")

print(f"\nBuilt-in e = {math.e:.12f}")
```

**Walkthrough:** `(1 + 1/n)**n` computes the compounding expression.
The column `error` is `abs(val - math.e)` — how far the approximation
is from Python's built-in constant `math.e`. The commas in `{n:>10,}`
format large numbers with thousands separators (1,000,000 rather than
1000000). The error shrinks as $n$ grows but never reaches zero —
confirming that this expression approaches $e$ asymptotically.

---

### Visualising the Convergence

```python
import numpy as np
import matplotlib.pyplot as plt
import math

ns   = np.logspace(0, 7, 500)
# np.logspace(0, 7, 500): 500 points from 10^0=1 to 10^7 on a log scale
vals = (1 + 1/ns)**ns

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: convergence curve
axes[0].semilogx(ns, vals, color='#2980b9', lw=2.5, label='$(1+1/n)^n$')
# semilogx: x-axis is logarithmic, y-axis linear
axes[0].axhline(math.e, color='#e74c3c', lw=1.5, linestyle='--',
                label=f'$e = {math.e:.5f}\\ldots$')
axes[0].set_xlabel('$n$ (log scale)')
axes[0].set_ylabel('Value')
axes[0].set_title('$(1+1/n)^n \\to e$ as $n\\to\\infty$\n'
                  'Approaches from below', fontsize=11)
axes[0].legend(); axes[0].grid(True, alpha=0.3)

# Right: error on a log-log scale
error = np.abs(vals - math.e)
axes[1].loglog(ns, error, color='#e74c3c', lw=2.5)
# loglog: both axes logarithmic
axes[1].set_xlabel('$n$ (log scale)')
axes[1].set_ylabel('$\\left|(1+1/n)^n - e\\right|$  (log scale)')
axes[1].set_title('Error decays as $1/n$\n(straight line on log-log plot)',
                  fontsize=11)
axes[1].grid(True, alpha=0.3)

plt.suptitle("Bernoulli's compounding limit converges to $e$", fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `np.logspace(0, 7, 500)` generates 500 points
evenly spaced on a logarithmic scale from $10^0 = 1$ to
$10^7 = 10{,}000{,}000$. `axes[1].loglog(...)` uses logarithmic
axes on both $x$ and $y$. A straight line on a log-log plot means
the error is a power law in $n$; the slope of approximately $-1$
confirms that the error is approximately $1/(2n)$ — the sequence
converges, but slowly.

---

### The Calculus Condition — Why $e$ is the Natural Base

Every exponential $f(x) = b^x$ has a rate of change (derivative)
at each point. Stage 5 will prove the general formula; stated now:

$$\frac{d}{dx}\,b^x = b^x \cdot \ln b$$

For most bases, the derivative involves the extra factor $\ln b$.
There is exactly one base for which the derivative equals the
function itself — that is, for which $\ln b = 1$:

$$b = e, \qquad \text{because } \ln e = 1 \text{ by definition of } \ln$$

**$e^x$ is the unique exponential function satisfying
$\dfrac{d}{dx}\,e^x = e^x$.**

This property is why $e$ appears so naturally in physics. Any
quantity $Q(t)$ satisfying "rate of change equals current value"
obeys $dQ/dt = Q$, whose solution is $Q(t) = Q_0 e^t$.

More generally, if the rate is proportional to the current value:

$$\frac{dQ}{dt} = r\,Q(t) \implies Q(t) = Q_0\,e^{rt}$$

- $r > 0$: exponential **growth** (population, compound interest)
- $r < 0$: exponential **decay** (radioactivity, capacitor discharge)

All of these use $e$ as the base — not $2$ or $10$ — because the
rate equation selects $e$ as the natural base.

---

### Euler's Series Definition

Euler showed that $e$ can be written as an infinite sum:

$$e = \sum_{k=0}^{\infty} \frac{1}{k!}
    = \frac{1}{0!} + \frac{1}{1!} + \frac{1}{2!} + \frac{1}{3!}
      + \frac{1}{4!} + \cdots
    = 1 + 1 + \frac{1}{2} + \frac{1}{6} + \frac{1}{24} + \cdots$$

**Hand-worked example:** compute partial sums $S_n = \sum_{k=0}^n \frac{1}{k!}$.

| $k$ | $k!$ | $\dfrac{1}{k!}$ | Running sum $S_k$ |
|-----|------|-----------------|-------------------|
| 0 | 1 | 1.000000 | 1.000000 |
| 1 | 1 | 1.000000 | 2.000000 |
| 2 | 2 | 0.500000 | 2.500000 |
| 3 | 6 | 0.166667 | 2.666667 |
| 4 | 24 | 0.041667 | 2.708333 |
| 5 | 120 | 0.008333 | 2.716667 |
| 6 | 720 | 0.001389 | 2.718056 |
| 7 | 5040 | 0.000198 | 2.718254 |
| 8 | 40320 | 0.000025 | 2.718279 |

True value: $e = 2.71828\,18284\ldots$ — we are correct to 5 decimal
places with only 9 terms. Factorials grow faster than any polynomial,
so each new term is much smaller than the last.

**Why does the sum converge?** Each term $1/k!$ is smaller than
$1/2^k$ for $k \geq 1$ (since $k! > 2^{k-1}$ for $k \geq 2$), and
$\sum 1/2^k = 2$ converges. So the series is bounded and increasing,
hence convergent.

```python
import math

def e_series_table(num_terms):
    """
    Print a table of partial sums of e = sum(1/k! for k=0..∞)
    and return the final partial sum.
    """
    total = 0.0
    print(f"{'k':>4} | {'k!':>12} | {'1/k!':>14} | {'Partial sum':>14} | {'Error':>12}")
    print("-" * 65)
    for k in range(num_terms):
        factorial_k = math.factorial(k)   # math.factorial: exact integer k!
        term  = 1 / factorial_k
        total += term
        error  = abs(total - math.e)
        print(f"{k:>4} | {factorial_k:>12,} | {term:>14.10f} | {total:>14.10f} | {error:>12.2e}")
    return total

result = e_series_table(12)
print(f"\nApproximation (12 terms): {result:.12f}")
print(f"True e:                   {math.e:.12f}")
```

**Walkthrough:** `math.factorial(k)` returns $k!$ as an exact Python
integer (arbitrarily large — no overflow). `{factorial_k:>12,}` right-
aligns the integer in 12 characters with comma thousands separators,
so $40320$ shows as `40,320`. After 12 terms the approximation agrees
with `math.e` to 11 decimal places. The series converges far faster
than the compounding limit — another reason the series definition is
preferable for computation.

---

### The Generalised Limit and Continuous Growth Model

The compounding limit has a more general form. If the annual rate
is $r$ instead of 100%:

$$\lim_{n \to \infty} \left(1 + \frac{r}{n}\right)^n = e^r$$

This means: compounding rate $r$ continuously for one year on \$1
gives $e^r$ dollars. Over time $t$ years from initial amount $A_0$:

$$A(t) = A_0\,e^{rt}$$

This is the **continuous exponential growth/decay model**. It appears
wherever a quantity's rate of change is proportional to its current
value.

**Hand-worked example — RC circuit discharge:**

A capacitor charged to $V_0 = 12$ V discharges through a resistor.
The voltage satisfies $V(t) = V_0\,e^{-t/\tau}$ where
$\tau = RC$ is the **time constant**.

Given $R = 1000\ \Omega$ and $C = 100\ \mu\text{F} = 10^{-4}$ F:

$$\tau = RC = 1000 \times 10^{-4} = 0.1\ \text{s}$$

| Time | Formula | Voltage | % of original |
|------|---------|---------|---------------|
| $t = 0$ | $12 e^0$ | 12.000 V | 100.0% |
| $t = \tau$ | $12 e^{-1}$ | 4.415 V | 36.8% |
| $t = 2\tau$ | $12 e^{-2}$ | 1.624 V | 13.5% |
| $t = 5\tau$ | $12 e^{-5}$ | 0.081 V | 0.7% |

After one time constant, the voltage has fallen to $e^{-1} \approx 36.8\%$
of its initial value. After five time constants, less than 1% remains.
This "$5\tau$ rule" is standard in electronics.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# RC circuit parameters
R   = 1000        # ohms
C   = 100e-6      # farads  (100 microfarads; 1e-6 is Python for 10^-6)
tau = R * C       # time constant in seconds
V0  = 12.0        # initial voltage

t   = np.linspace(0, 5 * tau, 500)
V   = V0 * np.exp(-t / tau)
# np.exp(x): computes e^x element-wise on arrays -- equivalent to math.e**t[i]
# for each index but vectorised (no Python loop needed)

fig, ax = plt.subplots(figsize=(9, 6))
ax.plot(t * 1000, V, color='#2980b9', lw=2.5,
        label=f'$V(t) = {V0}\\,e^{{-t/\\tau}}$, $\\tau = {tau*1000:.0f}$ ms')
# t * 1000 converts seconds to milliseconds for a more readable axis

# Mark each time constant with a dot and annotation
for n_tc in range(1, 6):
    t_n = n_tc * tau
    V_n = V0 * math.exp(-n_tc)
    ax.plot(t_n * 1000, V_n, 'o', color='#e74c3c', markersize=8, zorder=5)
    ax.annotate(f'$t={n_tc}\\tau$\n{V_n:.2f} V ({100*V_n/V0:.1f}%)',
                xy=(t_n*1000, V_n),
                xytext=(t_n*1000 + 15, V_n + 0.8),
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=1),
                fontsize=8, color='#e74c3c')

ax.axhline(0, color='#333', lw=0.8)
ax.set_xlabel('Time (ms)'); ax.set_ylabel('Voltage (V)')
ax.set_title(f'RC Circuit Discharge ($R={R}\\,\\Omega$, $C=100\\,\\mu$F, $\\tau={tau*1000:.0f}$ ms)',
             fontsize=11)
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()

# Print the 5-tau table
print(f"Time constant τ = RC = {tau*1000:.1f} ms")
print(f"\n{'t':>6} | {'V(t)':>8} | {'% initial':>10}")
print("-" * 32)
for n in range(6):
    V_n = V0 * math.exp(-n)
    print(f"{n}τ = {n*tau*1000:>4.0f} ms | {V_n:>6.3f} V | {100*V_n/V0:>9.1f}%")
```

**Walkthrough:** `np.exp(-t / tau)` computes $e^{-t_i/\tau}$ at every
element of the array `t` simultaneously — this is numpy's **vectorised**
operation. `t * 1000` multiplies every element of `t` by 1000,
converting seconds to milliseconds, also without a loop. The annotation
loop calls `math.exp(-n)` (scalar math, not array) for individual
time-constant values.

---

### $e$ Is Irrational and Transcendental

Two important properties to know (proofs require Stage 5 tools):

**$e$ is irrational:** There are no integers $p, q$ with $e = p/q$.
Euler proved this in 1737 by showing that the series for $e$
cannot produce a rational number. In particular, $e$ is not a
terminating or repeating decimal.

**$e$ is transcendental:** $e$ is not the root of any polynomial
$a_n x^n + \cdots + a_0 = 0$ with integer coefficients. Charles
Hermite proved this in 1873. Transcendental numbers are "more
irrational" than numbers like $\sqrt{2}$ (which satisfies $x^2-2=0$).
Both $e$ and $\pi$ are transcendental; $\sqrt{2}$ is irrational but
not transcendental.

For this curriculum: accept both properties. What matters is that $e$
is a precisely defined constant — not an approximation — and that
no finite combination of integer arithmetic and root-extraction
reaches it.

---

### Computing $e$ to Arbitrary Precision

The series definition $e = \sum_{k=0}^\infty 1/k!$ gives a practical
algorithm: add terms until the running error is smaller than the
required precision. Because $1/k!$ is dominated by $1/2^{k-1}$ for
large $k$, the series is **super-convergent** — each term roughly
halves the error.

```python
import math

def compute_e_to_precision(precision):
    """
    Compute e accurate to `precision` decimal places using the series.
    Returns (approximation, number_of_terms_used).
    
    precision: int, number of correct decimal places required
    """
    threshold = 10 ** (-precision)
    # 10^(-p): if the next term is this small, we've reached p decimal places

    total     = 0.0
    factorial = 1      # tracks k! without recomputing from scratch each step
    k         = 0

    while True:
        term   = 1 / factorial
        total += term
        if term < threshold:
            return total, k
        k         += 1
        factorial *= k  # k! = (k-1)! * k -- update incrementally

result, n_terms = compute_e_to_precision(10)
print(f"Approximation: {result:.12f}")
print(f"True e:        {math.e:.12f}")
print(f"Terms used:    {n_terms}")
print(f"Error:         {abs(result - math.e):.2e}")
```

**Walkthrough:** Instead of calling `math.factorial(k)` from scratch
each time (which recomputes the product from 1 every iteration),
`factorial *= k` updates the factorial **incrementally** — each step
multiplies the previous factorial by the new $k$. This is an $O(1)$
update per step rather than $O(k)$. The stopping condition
`term < threshold` works because the terms are strictly decreasing
and positive, so the remaining tail is bounded by the current term.

---

## Connect the Pieces

**What this lesson built on:** Exponential functions (Lesson 1.6) —
$e^x$ is the special case where the base is determined by the
calculus condition rather than chosen arbitrarily. Bijectivity of
$b^x$ (Lesson 1.6) ensures the inverse function $\ln$ (Lesson 1.8)
is well-defined.

**What this lesson makes possible:** Lesson 1.8 (the natural
logarithm) — $\ln x$ is the inverse of $e^x$ and the function
that undoes exponentiation by $e$. Lesson 7.2 (separable ODEs) —
the continuous growth model $A(t) = A_0 e^{rt}$ is the solution
to $dA/dt = rA$. Lesson 5.14 (Taylor series) — the series
$e^x = \sum x^k/k!$ generalises the $e = \sum 1/k!$ result here.
Lesson 1.16 (Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$)
— the same series applied to imaginary arguments.

**In electronics:** Every RC and RL circuit involves $e^{-t/\tau}$.
The time constant $\tau$ is not a rule of thumb — it is the
mathematically derived constant from solving the first-order ODE
for capacitor voltage. Understanding the $5\tau$ rule requires
knowing that $e^{-5} \approx 0.0067$; guessing "about 5 time
constants" without the mathematics is empiricism, not engineering.

**In CS and algorithm analysis:** The number $e$ appears in the
optimal stopping problem (secretary problem) — the optimal strategy
is to reject the first $\lfloor n/e \rfloor$ candidates and then
hire the first one better than all previous. The expected time until
a random permutation first returns to a value above a threshold also
involves $e$. In information theory, entropy in nats (natural units)
uses $\ln$ rather than $\log_2$; the conversion factor is $\ln 2$.

---

## Summary

**Limit definition:**

$$e = \lim_{n \to \infty}\!\left(1 + \frac{1}{n}\right)^n \approx 2.71828\,18284\,59045\ldots$$

**Series definition (Euler):**

$$e = \sum_{k=0}^{\infty}\frac{1}{k!} = 1 + 1 + \frac{1}{2} + \frac{1}{6} + \frac{1}{24} + \cdots$$

**Calculus property:** $e^x$ is the unique exponential satisfying
$(e^x)' = e^x$, equivalently $\ln e = 1$.

**Continuous model:** $Q(t) = Q_0\,e^{rt}$ whenever the rate of
change is proportional to current value ($dQ/dt = rQ$).

**Factorial:** $n! = n(n-1)\cdots 1$; $\quad 0! = 1$.

**Properties:** $e$ is irrational and transcendental.

**New Python:**
- `math.e` — $e$ to machine precision
- `math.factorial(n)` — exact integer $n!$
- `np.exp(x)` — $e^x$ element-wise on arrays (prefer over `math.e**x` for arrays)
- `np.logspace(a, b, n)` — $n$ points from $10^a$ to $10^b$ on log scale
- `ax.semilogx(...)` — logarithmic $x$-axis
- `ax.loglog(...)` — logarithmic $x$ and $y$ axes
- `{n:>10,}` — integer with thousands separator in f-strings

---

## Problems

### Math

**1.** Evaluate exactly. No calculator.

(a) $e^0$ &emsp;
(b) $e^1$ &emsp;
(c) $e^{-1}$, as a fraction &emsp;
(d) $(e^2)^3$ &emsp;
(e) $e^{\,0.5} \cdot e^{\,0.5}$

<details>
<summary>Answers</summary>

(a) 1 &emsp;
(b) $e$ &emsp;
(c) $1/e$ &emsp;
(d) $e^6$ &emsp;
(e) $e^{0.5+0.5} = e^1 = e$

</details>

---

**2.** The series partial sum $S_n = \sum_{k=0}^{n} 1/k!$.

(a) Compute $S_0, S_1, S_2, S_3, S_4$ by hand, as exact fractions.

(b) $S_4 = 65/24$. Compute $|S_4 - e|$ numerically. Is it less than $1/5!$?

(c) Prove that $S_n < e$ for all $n$. *(The series has all positive terms.)*

<details>
<summary>Answers</summary>

(a) $S_0 = 1$; $S_1 = 2$; $S_2 = 5/2$; $S_3 = 8/3$; $S_4 = 65/24$.

(b) $|65/24 - e| = |2.70833\ldots - 2.71828\ldots| \approx 0.00994$.
$1/5! = 1/120 \approx 0.00833$. Actually $|S_4 - e| > 1/5!$ here
because the tail sum from $k=5$ onward exceeds $1/5!$ alone; the
bound $e - S_n < 1/n! \cdot (1 + 1/n + \ldots) \approx 1/(n!(1-1/n))$
is tighter.

(c) $e = S_n + \sum_{k=n+1}^\infty 1/k!$. Each term $1/k! > 0$,
so the tail is positive, giving $e > S_n$ for all $n$. $\square$

</details>

---

**3.** A population of bacteria starts at 1000 and grows continuously
at rate $r = 0.04$ per hour (i.e., 4% per hour, compounded continuously).

(a) Write the population model $N(t) = N_0 e^{rt}$.

(b) What is the population after 10 hours?

(c) When does the population first exceed 5000?

(d) The doubling time $T_2$ satisfies $e^{rT_2} = 2$. Find $T_2$ in
terms of $r$ and $\ln$, then evaluate numerically for $r = 0.04$.

<details>
<summary>Answers</summary>

(a) $N(t) = 1000\,e^{0.04t}$.

(b) $N(10) = 1000\,e^{0.4} \approx 1000 \times 1.4918 = 1491.8 \approx 1492$.

(c) $1000\,e^{0.04t} = 5000 \Rightarrow e^{0.04t} = 5 \Rightarrow 0.04t = \ln 5 \Rightarrow t = \ln 5 / 0.04 \approx 1.609/0.04 \approx 40.2$ hours.

(d) $rT_2 = \ln 2 \Rightarrow T_2 = \ln 2 / r \approx 0.6931 / 0.04 \approx 17.3$ hours.

</details>

---

### Code Challenges

**Challenge 1 — Series approximation**

```python
import math

def approximate_e(num_terms):
    """
    Approximate e using the series sum_{k=0}^{num_terms-1} 1/k!
    
    Compute factorials incrementally (do not call math.factorial each time).
    
    num_terms: int, number of terms to sum (k = 0, 1, ..., num_terms-1)
    Returns:   float, the partial sum
    """
    pass  # your code here


# --- tests: do not modify ---
assert abs(approximate_e(1)  - 1.0)        < 1e-12
assert abs(approximate_e(2)  - 2.0)        < 1e-12
assert abs(approximate_e(3)  - 2.5)        < 1e-12
assert abs(approximate_e(5)  - 65/24)      < 1e-12   # S_4 = 65/24
assert abs(approximate_e(10) - math.e)     < 1e-6
assert abs(approximate_e(20) - math.e)     < 1e-15

print(f"✓ Challenge 1 passed!")
print(f"  10 terms: {approximate_e(10):.10f}  (true e = {math.e:.10f})")
print(f"  20 terms: {approximate_e(20):.15f}")
```

<details>
<summary>Hint</summary>

Use a running factorial variable: start `factorial = 1`, then each
iteration `k` update it with `factorial *= k` (but watch out for
$k=0$: handle it as a special case or keep `factorial = 1` for the
first iteration and only multiply after).

</details>

---

**Challenge 2 — Continuous growth model**

```python
import math

def continuous_growth(A0, r, t):
    """
    Compute A(t) = A0 * e^(r*t) for the continuous growth/decay model.
    
    A0: float, initial amount (must be positive)
    r:  float, continuous growth rate (negative for decay)
    t:  float, time elapsed (non-negative)
    Returns: float, amount at time t
    """
    pass  # your code here

def doubling_time(r):
    """
    Return the time T such that A(T) = 2*A0, given continuous growth rate r > 0.
    That is, solve e^(r*T) = 2 for T.
    """
    pass  # your code here

def half_life(r):
    """
    Return the half-life T_{1/2} for continuous decay rate r > 0.
    (The model is A(t) = A0 * e^(-r*t), so we solve e^(-r*T) = 0.5.)
    """
    pass  # your code here


# --- tests: do not modify ---
# Growth: e^(r*0) = 1 always
assert abs(continuous_growth(100, 0.05, 0) - 100.0) < 1e-10

# After t = 1/r, the amount is A0 * e
r_test = 0.1
assert abs(continuous_growth(1.0, r_test, 1/r_test) - math.e) < 1e-10

# Doubling time: e^(r * T2) = 2
for r in [0.01, 0.05, 0.1, math.log(2)]:
    T2 = doubling_time(r)
    assert abs(continuous_growth(1.0, r, T2) - 2.0) < 1e-9, \
        f"r={r}: doubling_time failed"

# Half-life: e^(-r * T_half) = 0.5
for r in [0.01, 0.05, 0.1]:
    T_half = half_life(r)
    assert abs(continuous_growth(1.0, -r, T_half) - 0.5) < 1e-9, \
        f"r={r}: half_life failed"

# RC circuit: tau = RC, after 5 tau, < 1% remains
tau = 0.1   # seconds
assert continuous_growth(1.0, -1/tau, 5*tau) < 0.01

print("✓ Challenge 2 passed!")
print(f"  Doubling time at r=0.05: {doubling_time(0.05):.4f} years")
print(f"  Half-life at r=0.05:    {half_life(0.05):.4f} years")
```

<details>
<summary>Hint</summary>

`continuous_growth` is one line: `return A0 * math.exp(r * t)`.
For doubling time: solve $e^{rT} = 2$ by taking $\ln$ of both sides
to get $T = \ln(2)/r$. Half-life: solve $e^{-rT} = 1/2$ to get
$T = \ln(2)/r$.

</details>

---

**Challenge 3 — RC circuit simulator**

```python
import math

def rc_discharge(V0, R, C, t_values):
    """
    Simulate RC circuit voltage discharge V(t) = V0 * e^(-t / (R*C)).
    
    V0:       float, initial voltage in volts
    R:        float, resistance in ohms
    C:        float, capacitance in farads
    t_values: list of float, times to evaluate at (in seconds)
    Returns:  list of float, voltage at each time
    """
    pass  # your code here

def time_to_fraction(V0, R, C, fraction):
    """
    Find the time t at which V(t) = fraction * V0.
    That is, solve V0 * e^(-t/tau) = fraction * V0 for t.
    
    fraction: float in (0, 1), e.g., 0.5 for half, 0.01 for 1%
    Returns:  float, time in seconds
    """
    pass  # your code here


# --- tests: do not modify ---
import math

R, C = 1000, 100e-6     # tau = 0.1 s
tau  = R * C

# At t=0, voltage is V0
V0 = 12.0
result = rc_discharge(V0, R, C, [0])
assert abs(result[0] - V0) < 1e-10

# After one time constant, V = V0 / e
result = rc_discharge(V0, R, C, [tau])
assert abs(result[0] - V0 / math.e) < 1e-10

# Multiple time points
ts = [0, tau, 2*tau, 5*tau]
vs = rc_discharge(V0, R, C, ts)
for i, (t, v) in enumerate(zip(ts, vs)):
    expected = V0 * math.exp(-i)
    assert abs(v - expected) < 1e-10, f"Mismatch at t={t}: {v} vs {expected}"

# 5-tau rule: less than 1% remains
assert rc_discharge(V0, R, C, [5*tau])[0] < 0.01 * V0

# time_to_fraction: 50% remaining
t_half = time_to_fraction(V0, R, C, 0.5)
v_at_half = rc_discharge(V0, R, C, [t_half])[0]
assert abs(v_at_half / V0 - 0.5) < 1e-9

# time_to_fraction: 1% remaining (should be about 5*tau)
t_1pct = time_to_fraction(V0, R, C, 0.01)
assert abs(t_1pct - 5 * tau) < 0.01 * tau, \
    f"Expected ~5*tau={5*tau:.4f}, got {t_1pct:.4f}"

print("✓ Challenge 3 passed!")
print(f"  tau = {tau*1000:.1f} ms")
print(f"  Time to 50% = {time_to_fraction(V0,R,C,0.5)*1000:.2f} ms")
print(f"  Time to  1% = {time_to_fraction(V0,R,C,0.01)*1000:.2f} ms  (~5τ = {5*tau*1000:.1f} ms)")
```

<details>
<summary>Hint</summary>

`rc_discharge`: compute `tau = R * C`, then return
`[V0 * math.exp(-t / tau) for t in t_values]`.
`time_to_fraction`: solve $e^{-t/\tau} = \text{fraction}$
by taking $\ln$: $t = -\tau \ln(\text{fraction})$.

</details>

---

### Extension

**4. ★** The **Rule of 70** says the doubling time of a continuously
growing quantity at rate $r\%$ per year is approximately $70/r$ years.

(a) The exact formula is $T_2 = \ln(2)/r$. Show that $\ln 2 \approx 0.693$
and explain why the Rule of 70 is used instead of the exact formula.

(b) Compute the percentage error in the Rule of 70 approximation for
$r = 1\%, 2\%, 5\%, 10\%$ (where $r$ is expressed as a decimal in the
exact formula, e.g., $r = 0.01$).

```python
import math
print(f"{'r%':>5} | {'Exact T2':>10} | {'Rule of 70':>12} | {'Error%':>8}")
print("-" * 42)
for r_pct in [1, 2, 5, 10, 20]:
    r_dec   = r_pct / 100
    exact   = math.log(2) / r_dec
    approx  = 70 / r_pct
    err_pct = abs(approx - exact) / exact * 100
    print(f"{r_pct:>5} | {exact:>10.3f} | {approx:>12.3f} | {err_pct:>7.2f}%")
```

(c) ★★ Prove that the sequence $a_n = (1 + 1/n)^n$ is strictly
**increasing** for $n \geq 1$, using the AM-GM inequality. *(The
AM-GM inequality states that for positive numbers $x_1, \ldots, x_m$,
their arithmetic mean is at least their geometric mean:
$\frac{x_1 + \cdots + x_m}{m} \geq (x_1 \cdots x_m)^{1/m}$.)*

<details>
<summary>Hint for (c)</summary>

Apply AM-GM to $n+1$ numbers: $n$ copies of $(1 + 1/n)$ and one
copy of $1$. Show the arithmetic mean is $(1 + 1/(n+1))$ and the
geometric mean is $a_n^{n/(n+1)}$. Conclude $a_{n+1} > a_n$.

</details>
