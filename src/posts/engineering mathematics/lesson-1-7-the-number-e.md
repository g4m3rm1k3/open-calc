# Stage 1, Lesson 1.7 — The Number $e$: Its Definition and Why It Appears
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

There is a particular exponential function — $f(x) = e^x$, where $e \approx 2.71828$ — that appears everywhere in science and engineering. Not because it was chosen by convention, but because it is the only exponential function whose rate of change at every point equals its value at that point. That self-referential property makes $e^x$ the natural language for describing any quantity whose rate of change is proportional to itself: population growth, radioactive decay, charging capacitors, compound interest at every instant. This lesson derives $e$ from three different directions — a compounding limit, a calculus condition, and an infinite series — and shows why all three arrive at the same number. By the end you can state the precise definition of $e$, compute it to arbitrary precision, recognise it in physical models, and use the natural exponential $e^x$ in code.

---

## Historical Context

Jacob Bernoulli discovered the number $e$ in 1683 while studying compound interest. He asked: if you invest one unit at 100% annual interest, how does the final balance depend on how frequently you compound? Compounding once gives 2.0. Compounding twice gives $(1 + \frac{1}{2})^2 = 2.25$. Compounding $n$ times gives $(1 + \frac{1}{n})^n$. Bernoulli noticed this sequence increases but stays below 3, approaching a limit he could not identify. The constant appeared in Leibniz's correspondence under the letter $b$; Euler, in 1731, first called it $e$ — almost certainly for "exponential," not for himself. Euler also showed that $e$ equals the sum of the infinite series $1 + 1 + \frac{1}{2!} + \frac{1}{3!} + \cdots$, which gives a practical way to compute it. Every subsequent use of $e$ in science traces to these two roots: Bernoulli's compounding limit and Euler's series.

---

## What You Need To Know First

- **Exponential functions** — Lesson 1.6. $e^x$ is an exponential function with base $e$; everything from Lesson 1.6 applies.
- **Functions** — Lesson 0.6. $e^x$ is a function $\mathbb{R} \to (0, \infty)$.
- **Factorial notation:** $n! = n \cdot (n-1) \cdot (n-2) \cdots 2 \cdot 1$, with the convention $0! = 1$. First appears here; will be used extensively from Stage 5 onward.

---

## The Lesson

### Compounding Interest and the Limit Definition

Suppose you deposit \$1 at an interest rate of 100% per year. How much do you have after one year, depending on how frequently interest is added?

- **Compounded once:** $\left(1 + 1\right)^1 = 2.000$
- **Compounded twice (every 6 months):** $\left(1 + \tfrac{1}{2}\right)^2 = 2.250$
- **Compounded quarterly:** $\left(1 + \tfrac{1}{4}\right)^4 \approx 2.4414$
- **Compounded monthly:** $\left(1 + \tfrac{1}{12}\right)^{12} \approx 2.6130$
- **Compounded daily:** $\left(1 + \tfrac{1}{365}\right)^{365} \approx 2.7146$

The pattern is increasing but bounded. As $n \to \infty$ (continuous compounding), the limit is:

$$e = \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n$$

This is the **limit definition** of $e$. The number $e$ is the limit of $(1 + 1/n)^n$ as $n \to \infty$.

```python
import numpy as np
import matplotlib.pyplot as plt

# Compute (1 + 1/n)^n for increasing n
ns = [1, 2, 4, 12, 52, 365, 1000, 10000, 1_000_000]
# The underscore in 1_000_000 is a Python readability feature — ignored by the interpreter
values = [(1 + 1/n)**n for n in ns]

import math
e_true = math.e   # Python's built-in value of e = 2.71828...

print(f"{'n':>10} | {'(1+1/n)^n':>14} | {'error':>12}")
print("-" * 42)
for n, v in zip(ns, values):
    print(f"{n:>10,} | {v:>14.8f} | {abs(v - e_true):>12.2e}")
print(f"\nTrue e = {e_true:.10f}")
```

**Walkthrough:** `(1 + 1/n)**n` computes the compounding expression for each `n`. The column `error` shows `abs(v - e_true)` — how far the approximation is from the true value of $e$. The error shrinks as $n$ grows, confirming the sequence converges to $e$.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

ns = np.logspace(0, 6, 300)
# np.logspace(start, stop, n) generates n points evenly spaced on a log scale
# from 10^start to 10^stop — so 10^0=1 to 10^6=1000000

values = (1 + 1/ns)**ns

fig, ax = plt.subplots(figsize=(9, 5))
ax.semilogx(ns, values, color='#2980b9', lw=2.5, label='$(1 + 1/n)^n$')
# semilogx: x-axis is logarithmic, y-axis is linear
ax.axhline(math.e, color='#e74c3c', lw=1.5, linestyle='--', label=f'$e = {math.e:.5f}...$')
ax.set_xlabel('$n$ (log scale)'); ax.set_ylabel('Value')
ax.set_title('$(1+1/n)^n \\to e$ as $n \\to \\infty$')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `ax.semilogx` plots with $n$ on a logarithmic axis, compressing the enormous range $[1, 10^6]$ into a readable width. The dashed red line at $y = e$ shows what the sequence converges to.

---

### The Calculus Condition — What Makes $e$ Special

The limit definition explains where $e$ comes from. But why does it appear so naturally in physics and engineering? The answer is a calculus property.

Every exponential function $f(x) = b^x$ has a rate of change (derivative — covered in full in Stage 5) at each point. For the function $f(x) = b^x$, that rate of change turns out to be:

$$f'(x) = b^x \cdot \ln b$$

(This is derived in Lesson 5.8. For now, accept it as stated.)

There is exactly one base $b$ for which $f'(x) = f(x)$ — the derivative equals the function itself:

$$b^x \cdot \ln b = b^x \implies \ln b = 1 \implies b = e$$

**This is what makes $e$ the natural base:** $e^x$ is the unique exponential function whose rate of change at every point equals its current value.

In physical terms: if a quantity $Q(t)$ grows so that its rate of increase is always equal to its current value, then $Q(t) = Q_0 e^t$. Radioactive decay, capacitor discharge, bacterial growth — all are described by $e^t$ or $e^{-t}$ because in all of them, the rate is proportional to the current amount.

---

### The Series Definition

There is a third way to define $e$, discovered by Euler. First, the definition of factorial:

$$n! = n \cdot (n-1) \cdot (n-2) \cdots 2 \cdot 1, \qquad 0! = 1$$

Read "$n!$" as "$n$ factorial." So $3! = 3 \cdot 2 \cdot 1 = 6$, $4! = 24$, $5! = 120$.

Euler showed:

$$e = \sum_{k=0}^{\infty} \frac{1}{k!} = \frac{1}{0!} + \frac{1}{1!} + \frac{1}{2!} + \frac{1}{3!} + \frac{1}{4!} + \cdots = 1 + 1 + \frac{1}{2} + \frac{1}{6} + \frac{1}{24} + \cdots$$

**Hand-worked example:** Compute the partial sums to six terms.

| $k$ | $\frac{1}{k!}$ | Running sum |
|-----|----------------|-------------|
| 0 | $1/1 = 1$ | $1.000000$ |
| 1 | $1/1 = 1$ | $2.000000$ |
| 2 | $1/2 = 0.5$ | $2.500000$ |
| 3 | $1/6 \approx 0.166\overline{6}$ | $2.666\overline{6}$ |
| 4 | $1/24 \approx 0.04167$ | $2.70833$ |
| 5 | $1/120 \approx 0.00833$ | $2.71667$ |
| 6 | $1/720 \approx 0.00139$ | $2.71806$ |

The true value is $e = 2.71828...$; we are already correct to 3 decimal places with just 7 terms. The factorials grow very fast, so the terms shrink rapidly.

```python
import math

def compute_e_series(num_terms):
    """
    Approximate e using the series sum_{k=0}^{num_terms-1} 1/k!
    Returns the partial sum and the error vs math.e
    """
    total = 0.0
    print(f"{'k':>4} | {'1/k!':>14} | {'partial sum':>14} | {'error':>12}")
    print("-" * 52)
    for k in range(num_terms):
        term = 1 / math.factorial(k)
        # math.factorial(k) computes k! exactly as an integer
        total += term
        error = abs(total - math.e)
        print(f"{k:>4} | {term:>14.10f} | {total:>14.10f} | {error:>12.2e}")
    return total

result = compute_e_series(12)
print(f"\nApproximation: {result:.12f}")
print(f"True e:        {math.e:.12f}")
```

**Walkthrough:** `math.factorial(k)` computes $k!$ as an exact integer. Dividing by it gives `1/k!` as a float. Adding each term to `total` builds the partial sum. Twelve terms gives $e$ correct to 11 decimal places — the series converges very quickly because factorials grow faster than any polynomial.

---

### The More General Limit

The compounding limit generalises. For a rate $r$ compounded $n$ times:

$$\lim_{n \to \infty} \left(1 + \frac{r}{n}\right)^n = e^r$$

This means continuous compounding at rate $r$ gives balance $e^r$ after one year on \$1, and more generally:

$$A(t) = A_0 e^{rt}$$

where $r > 0$ is growth and $r < 0$ is decay. This is the **continuous exponential model**, used in physics whenever the rate is proportional to the current value.

**Hand-worked example:** A capacitor in an RC circuit discharges with $r = -1/RC$. If $R = 1000\ \Omega$, $C = 100\ \mu\text{F} = 10^{-4}\ \text{F}$:

$$RC = 1000 \times 10^{-4} = 0.1\ \text{seconds}$$
$$V(t) = V_0 e^{-t/0.1} = V_0 e^{-10t}$$

After $t = 0.1$ s (one time constant), $V = V_0 e^{-1} \approx 0.368 V_0$.
After $t = 0.5$ s, $V = V_0 e^{-5} \approx 0.0067 V_0$ (less than 1% of original).

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# RC circuit discharge
R = 1000       # ohms
C = 100e-6     # farads (100 microfarads; 1e-6 is Python for 10^-6)
RC = R * C     # time constant in seconds
V0 = 12.0      # initial voltage

t = np.linspace(0, 0.6, 500)
V = V0 * np.exp(-t / RC)
# np.exp(x) computes e^x element-wise; equivalent to math.e**x but faster and
# works on arrays

fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(t * 1000, V, color='#2980b9', lw=2.5, label='$V(t) = 12 e^{-t/RC}$')
# t * 1000 converts seconds to milliseconds for readability

# Mark time constants
for n_tc, color in [(1,'#e74c3c'), (2,'#27ae60'), (3,'#8e44ad')]:
    t_n = n_tc * RC
    V_n = V0 * math.exp(-n_tc)
    ax.plot(t_n * 1000, V_n, 'o', color=color, markersize=9, zorder=5)
    ax.annotate(f'$t = {n_tc}RC$\n$V = {V_n:.2f}$ V ({100*V_n/V0:.1f}%)',
                xy=(t_n * 1000, V_n), xytext=(t_n * 1000 + 30, V_n + 1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1),
                fontsize=9, color=color)

ax.set_xlabel('Time (ms)'); ax.set_ylabel('Voltage (V)')
ax.set_title('RC Circuit Discharge: $V(t) = V_0 e^{-t/RC}$\n'
             f'$R = {R}\\,\\Omega$, $C = 100\\,\\mu$F, $RC = {RC*1000:.0f}$ ms')
ax.grid(True, alpha=0.3); ax.legend(fontsize=10)
plt.tight_layout(); plt.show()

print(f"Time constant RC = {RC*1000:.0f} ms")
print(f"After 1 RC: V = {V0 * math.exp(-1):.4f} V  = {100*math.exp(-1):.1f}% of V0")
print(f"After 5 RC: V = {V0 * math.exp(-5):.6f} V  = {100*math.exp(-5):.3f}% of V0")
```

**Walkthrough:** `np.exp(-t / RC)` computes $e^{-t_i / RC}$ at every point in the time array in one call — faster and cleaner than a loop. `100e-6` is Python scientific notation for $100 \times 10^{-6}$. The plot multiplies `t` by 1000 to show milliseconds rather than seconds, making the graph more readable at this scale.

---

### $e$ Is Irrational and Transcendental

Two important properties of $e$:

**$e$ is irrational:** There are no integers $p, q$ with $e = p/q$. (Euler proved this in 1737 using the series representation.) This means the decimal expansion of $e$ never terminates and never repeats.

**$e$ is transcendental:** $e$ is not the root of any polynomial with integer coefficients. (Proved by Hermite in 1873.) This places $e$ in a more exclusive category than simply "irrational" — numbers like $\sqrt{2}$ are irrational but are roots of $x^2 - 2 = 0$. Transcendental numbers, like $\pi$ and $e$, are not roots of any polynomial.

For this curriculum: accept both properties. The proofs are beautiful but require analysis tools from Stage 5 and beyond. What matters now is that $e$ is a specific, precisely defined constant that cannot be expressed as any finite combination of integers using arithmetic and root-extraction.

---

## Connect the Pieces

**What this lesson built on:** Exponential functions (Lesson 1.6) — $e^x$ is simply an exponential with a specific base determined by a limit. The bijectivity of exponential functions (Lesson 1.6) ensures that $\ln$ (the inverse of $e^x$) exists as a function — that inverse is Lesson 1.8.

**What this lesson makes possible:** Lesson 1.8 (the natural logarithm $\ln$) — the inverse of $e^x$, which allows solving equations like $e^{kt} = c$ for $t$. Lesson 7.2 (separable ODEs) — the continuous growth model $A(t) = A_0 e^{rt}$ is the solution to the differential equation $dA/dt = rA$. Lesson 5.8 (derivatives of exponentials) — where $(e^x)' = e^x$ is proved from the definition of the derivative, confirming the calculus condition stated here.

**In engineering:** Every RC and RL circuit involves $e^{-t/\tau}$ where $\tau$ is the time constant. Newton's law of cooling ($T(t) = T_\infty + (T_0 - T_\infty)e^{-kt}$), radioactive decay ($A(t) = A_0 e^{-\lambda t}$), and the stress relaxation of viscoelastic materials all use $e$ as the base because in each case the rate is proportional to the current value.

**In CS:** The mathematical constant $e$ appears in the analysis of algorithms via the "secretary problem" (the optimal strategy involves accepting the best candidate after $1/e$ of applicants), in the natural logarithm used in entropy calculations (Lesson 8.11), and in the Taylor series for $e^x$ (Lesson 5.14) which is how all exponentials are computed in hardware.

---

## Summary

**Limit definition:**

$$e = \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n \approx 2.71828\,18284\,59045\ldots$$

**Series definition:**

$$e = \sum_{k=0}^{\infty} \frac{1}{k!} = 1 + 1 + \frac{1}{2!} + \frac{1}{3!} + \cdots$$

**Calculus property:** $e^x$ is the unique exponential function satisfying $\frac{d}{dx}e^x = e^x$.

**Continuous growth/decay model:** $A(t) = A_0 e^{rt}$, where $r > 0$ is growth and $r < 0$ is decay.

**Factorial notation:** $n! = n(n-1)\cdots 2 \cdot 1$; $\quad 0! = 1$.

**Properties:** $e$ is irrational (decimal never repeats) and transcendental (not a root of any integer polynomial).

**New Python:**
- `math.e` — the constant $e$ to machine precision
- `math.factorial(n)` — $n!$ as an exact integer
- `np.exp(x)` — $e^x$ element-wise on arrays (preferred over `math.e**x` for arrays)
- `np.logspace(a, b, n)` — $n$ points from $10^a$ to $10^b$ on a logarithmic scale
- `ax.semilogx(...)` — plot with logarithmic $x$-axis

---

## Problems

### Computation

**1.** Compute each value, giving an exact expression and a decimal approximation to 4 d.p.

(a) $e^0$ &emsp; (b) $e^1$ &emsp; (c) $e^{-1}$ &emsp; (d) $e^2$ &emsp; (e) $e^{1/2}$

<details>
<summary>Answers</summary>

(a) $1$ (exact) &emsp; (b) $e \approx 2.7183$ &emsp; (c) $1/e \approx 0.3679$ &emsp; (d) $e^2 \approx 7.3891$ &emsp; (e) $\sqrt{e} \approx 1.6487$

</details>

---

**2.** The partial sum $S_n = \sum_{k=0}^{n} \frac{1}{k!}$ approximates $e$.

(a) Compute $S_3$, $S_5$, and $S_7$ by hand.

(b) How many terms are needed to get $e$ correct to 6 decimal places?

<details>
<summary>Answers</summary>

(a) $S_3 = 1 + 1 + 0.5 + 1/6 = 2.6\overline{6}$; $S_5 = 2.71\overline{6}$; $S_7 \approx 2.718253$.

(b) $S_9 = 2.7182818$ is correct to 6 d.p. ($e = 2.718282$ to 6 d.p.). So 10 terms ($k = 0$ to $9$).

</details>

---

**3.** A bacterial culture starts with 500 cells and doubles every 20 minutes. Using the continuous model $N(t) = N_0 e^{rt}$ (where $t$ is in minutes):

(a) Find $r$ from the condition $N(20) = 1000$.

(b) How many cells after 1 hour?

(c) When does the population reach $10^6$?

<details>
<summary>Answers</summary>

(a) $500 e^{20r} = 1000 \Rightarrow e^{20r} = 2 \Rightarrow r = \ln(2)/20 \approx 0.03466$ per minute.

(b) $N(60) = 500 e^{60 \times 0.03466} = 500 e^{2.079} = 500 \times 8 = 4000$ cells.

(c) $500 e^{rt} = 10^6 \Rightarrow e^{rt} = 2000 \Rightarrow rt = \ln(2000) \Rightarrow t = \ln(2000)/r = \ln(2000)\times 20/\ln(2) \approx 220$ minutes (about 3 h 40 min).

</details>

---

### Understanding

**4.** A student says: "The number $e$ is just an approximation — the real value of $e$ is 2.71828." What is wrong with this claim?

<details>
<summary>Answer</summary>

$e$ is not an approximation — it is a precisely defined constant, the limit of $(1+1/n)^n$ as $n \to \infty$ (or equivalently the sum $\sum 1/k!$). The decimal $2.71828$ is the approximation. $e$ itself is an exact irrational number, like $\pi$ or $\sqrt{2}$: its decimal expansion is infinite and non-repeating, so no finite decimal represents it exactly.

</details>

---

**5.** Explain in words why $e^x$ has the property $(e^x)' = e^x$, using the compounding limit definition. What does this mean physically for a quantity modelled by $e^{rt}$?

<details>
<summary>Answer (guidance)</summary>

The argument: $e^x$ grows at a rate that equals its current value because that is precisely the condition that singles out $e$ as the base — it is the base for which the derivative-of-$b^x$ formula ($b^x \ln b$) gives back $b^x$ unchanged (requiring $\ln b = 1$, i.e. $b = e$). Physically: if $Q(t) = Q_0 e^{rt}$ models a quantity, then $dQ/dt = r Q_0 e^{rt} = r Q(t)$. The rate of change is always proportional to the current value. This is why populations, charges on capacitors, and radioactive nuclei — all processes where the rate depends on "how much is there now" — follow $e^{rt}$.

</details>

---

### Proof

**6.** Prove that $e > 2.7$ using the series definition. Show your reasoning clearly.

<details>
<summary>Answer</summary>

**Claim:** $e > 2.7$.

**Proof:** By the series definition, $e = \sum_{k=0}^{\infty} 1/k!$. All terms are positive, so the partial sum with $k = 0, 1, 2, 3$ is less than $e$:

$$e > S_3 = \frac{1}{0!} + \frac{1}{1!} + \frac{1}{2!} + \frac{1}{3!} = 1 + 1 + \frac{1}{2} + \frac{1}{6} = \frac{6+6+3+1}{6} = \frac{16}{6} = \frac{8}{3} \approx 2.6\overline{6}$$

With one more term: $S_4 = 8/3 + 1/24 = 64/24 + 1/24 = 65/24 \approx 2.708\overline{3} > 2.7$.

Since all terms $1/k!$ are positive and $S_4 > 2.7$, we have $e \geq S_4 > 2.7$. $\blacksquare$

</details>

---

### Extension

**7. ★** The **secretary problem** (also called the optimal stopping problem): you interview $n$ candidates in random order. You must decide immediately after each interview whether to hire or move on. The optimal strategy is to reject the first $k$ candidates and then hire the first one better than all previous candidates. The optimal $k$ is $k = \lfloor n/e \rfloor$.

(a) For $n = 100$, what is the optimal $k$?

(b) Write a Python simulation to verify that this strategy gives the best probability of hiring the best candidate.

(c) The optimal probability of success is approximately $1/e$. Why does $e$ appear in an apparently unrelated problem?

<details>
<summary>Hint for (c)</summary>

The optimal $k/n \to 1/e$ as $n \to \infty$. This comes from maximising a probability that involves a sum $\sum_{i=k}^{n-1} k/i$ — which in the limit becomes $\int_{1/e}^{1} (1/e)/x\, dx$ (a logarithm), and the maximisation gives $1/e$ as the optimal threshold. The same limit $(1+1/n)^n \to e$ drives both this and the compounding formula.

</details>

**8. ★** Prove that the sequence $a_n = (1 + 1/n)^n$ is increasing for all $n \geq 1$.

*(Hint: use the AM-GM inequality: the arithmetic mean of $n+1$ positive numbers is at least their geometric mean.)*

<details>
<summary>Answer sketch</summary>

Apply AM-GM to $n+1$ numbers: one copy of $1$ and $n$ copies of $(1 + 1/n)$:

$$\frac{1 + n(1 + 1/n)}{n+1} \geq \left[1 \cdot \left(1+\frac{1}{n}\right)^n\right]^{1/(n+1)}$$

The left side simplifies: numerator is $1 + n + 1 = n + 2$, so LHS $= (n+2)/(n+1) = 1 + 1/(n+1)$.

Thus $\left(1 + \frac{1}{n+1}\right) \geq \left(1 + \frac{1}{n}\right)^{n/(n+1)}$.

Raising both sides to the power $n+1$: $a_{n+1} = \left(1+\frac{1}{n+1}\right)^{n+1} \geq \left(1+\frac{1}{n}\right)^n = a_n$. $\blacksquare$

</details>
