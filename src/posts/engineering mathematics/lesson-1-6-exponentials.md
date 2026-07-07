# Stage 1, Lesson 1.6 — Exponential Functions: Growth and Decay
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Every polynomial grows by adding — as $x$ increases by 1, a degree-$n$
polynomial adds roughly $n a_n x^{n-1}$ to its value. An exponential
function grows by multiplying — as $x$ increases by 1, the value is
multiplied by a fixed base $b$. That difference in mechanism produces
radically different behaviour. Polynomials eventually win in the long run
against any fixed polynomial, but exponentials grow far faster than any
polynomial — and decay far faster too. Exponential functions describe
tool wear, radioactive decay, compound interest, population growth,
capacitor discharge, and algorithm complexity, all for the same reason:
they model processes where the rate of change is proportional to the
current value. By the end of this lesson you understand the shape and
properties of exponential functions, can transform them, can derive the
doubling time and half-life formulas, and can model real decay and growth
processes in code.

---

## Historical Context

Exponential growth was understood qualitatively long before it was
written algebraically. The legend of the wheat and chessboard — placing
one grain on the first square, two on the second, four on the third,
doubling each time — was already circulating in medieval manuscripts
and illustrates why exponential growth is so counterintuitive: the
total after 64 squares is $2^{64} - 1 \approx 1.8 \times 10^{19}$ grains,
more than all the wheat ever harvested in human history. The formal
algebraic treatment of exponential functions developed alongside
logarithms in the 17th century — Napier published his logarithm tables
in 1614 primarily to convert exponential calculations into the simpler
additions that logarithms allow. Logarithms are the next lesson; the two
subjects were born together.

---

## What You Need To Know First

- **Functions, domain, codomain** — Lesson 0.6.
- **Polynomials** — Lesson 1.1, for comparison.
  Exponentials grow faster than any polynomial, and decay faster too.
- **The real number line $\mathbb{R}$** — Lesson 0.1.
  The base $b$ must be positive and not equal to 1; the exponent $x$
  can be any real number.

---

## The Lesson

### The Definition

**Definition:** An **exponential function** with base $b$ is

$$f(x) = b^x, \qquad b > 0,\ b \neq 1,\ x \in \mathbb{R}$$

The base $b$ must be positive (so that $b^x$ is defined for all real
$x$, including irrationals) and not equal to 1 (which would give the
constant function $f(x) = 1$, uninteresting as an exponential).

**Formal lens:** The domain is all of $\mathbb{R}$; the range is
$(0, \infty)$ — exponential functions are always strictly positive.
The function $f(x) = b^x$ is:
- **Injective** (one-to-one): different inputs give different outputs
- **Surjective onto $(0, \infty)$**: every positive number is a power of $b$
- Therefore **bijective** as a function $\mathbb{R} \to (0, \infty)$

That bijectivity is precisely why the inverse — the logarithm — exists
and is itself a function.

**Geometric lens:** All exponential functions share three properties:

1. They pass through the point $(0, 1)$ — because $b^0 = 1$ for any $b$.
2. They are always positive — the graph never crosses the $x$-axis.
3. The $x$-axis is a **horizontal asymptote**: $b^x \to 0$ as
   $x \to -\infty$ (for $b > 1$) — the function approaches but never reaches zero.

**The two cases:**

- $b > 1$: **growth** — the function increases. As $x \to +\infty$, $b^x \to +\infty$.
  As $x \to -\infty$, $b^x \to 0$.
- $0 < b < 1$: **decay** — the function decreases. As $x \to +\infty$, $b^x \to 0$.
  As $x \to -\infty$, $b^x \to +\infty$.

Note that $f(x) = (1/2)^x = 2^{-x}$ is the reflection of $f(x) = 2^x$
across the $y$-axis — growth and decay are mirror images of each other.

---

### Key Values and the Integer Pattern

**Hand-worked example:** Build a table for $f(x) = 2^x$.

| $x$ | $2^x$ | Note |
|-----|-------|------|
| $-3$ | $\frac{1}{8} = 0.125$ | Each step left: divide by 2 |
| $-2$ | $\frac{1}{4} = 0.25$ | |
| $-1$ | $\frac{1}{2} = 0.5$ | |
| $0$ | $1$ | Always 1 |
| $1$ | $2$ | |
| $2$ | $4$ | Each step right: multiply by 2 |
| $3$ | $8$ | |

**The pattern:** moving right by 1 multiplies the output by $b$.
Moving left by 1 divides by $b$. This is exactly what "exponential"
means: the exponent counts how many times you multiply.

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-3, 3, 300)
# np.linspace(start, stop, n): n evenly spaced values from start to stop

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Growth bases
growth_bases = [2, 3, 5, 10]
colors = ['#2980b9', '#27ae60', '#e74c3c', '#8e44ad']

for b, color in zip(growth_bases, colors):
    # zip pairs each base with its colour
    axes[0].plot(x, b**x, color=color, lw=2, label=f'$b={b}$')

axes[0].axhline(0, color='#333', lw=0.8)
axes[0].axvline(0, color='#333', lw=0.8)
axes[0].axhline(1, color='#aaaaaa', lw=0.8, linestyle=':')
# dotted line at y=1: marks where all curves pass through at x=0
axes[0].set_title('Exponential growth ($b > 1$)\nAll pass through $(0, 1)$', fontsize=11)
axes[0].set_xlabel('$x$'); axes[0].set_ylabel('$b^x$')
axes[0].set_ylim(-0.5, 9); axes[0].legend(fontsize=10)
axes[0].grid(True, alpha=0.3)

# Decay bases
decay_bases = [0.5, 0.7, 0.3, 0.9]
for b, color in zip(decay_bases, colors):
    axes[1].plot(x, b**x, color=color, lw=2, label=f'$b={b}$')

axes[1].axhline(0, color='#333', lw=0.8)
axes[1].axvline(0, color='#333', lw=0.8)
axes[1].axhline(1, color='#aaaaaa', lw=0.8, linestyle=':')
axes[1].set_title('Exponential decay ($0 < b < 1$)\nAll pass through $(0, 1)$', fontsize=11)
axes[1].set_xlabel('$x$'); axes[1].set_ylabel('$b^x$')
axes[1].set_ylim(-0.5, 9); axes[1].legend(fontsize=10)
axes[1].grid(True, alpha=0.3)

plt.suptitle('$f(x) = b^x$: larger $b$ grows faster; smaller $b$ decays faster',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `b**x` raises the scalar `b` to the power of every
element in the numpy array `x` simultaneously — numpy's element-wise
power operation. For `b=2` and `x = np.array([-1, 0, 1])`, this gives
`np.array([0.5, 1.0, 2.0])`. The dotted horizontal line `axhline(1, linestyle=':')`
marks $y=1$; every curve crosses it at exactly $x=0$, which is visible
in the plot.

---

### Exponential vs Polynomial Growth

One of the most important facts in both mathematics and computer science:
**exponentials eventually dominate every polynomial**.

For any base $b > 1$ and any degree $n$:

$$\lim_{x \to \infty} \frac{b^x}{x^n} = \infty$$

That is, $b^x$ grows faster than $x^n$ for large enough $x$, no matter
how large $n$ is.

This is why:
- An $O(2^n)$ algorithm is always eventually slower than any $O(n^k)$
  algorithm, no matter how large $k$ is.
- Compound interest (exponential) always eventually overtakes linear
  savings, no matter how large the linear rate is.
- Radioactive material with exponential decay eventually becomes
  negligible, no matter how slowly it decays.

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 25, 400)

fig, ax = plt.subplots(figsize=(9, 6))

ax.plot(x, 2**x,  color='#e74c3c', lw=2.5, label='$2^x$ (exponential)')
ax.plot(x, x**5,  color='#2980b9', lw=2,   label='$x^5$ (degree 5 poly)')
ax.plot(x, x**10, color='#27ae60', lw=2,   label='$x^{10}$ (degree 10 poly)')

ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)
ax.set_ylim(-1e6, 1.2e7)
ax.set_title('$2^x$ vs polynomials: exponential eventually dominates\n'
             'every polynomial, no matter the degree', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.legend(fontsize=11)
ax.grid(True, alpha=0.3)

# Annotate the crossover point where 2^x overtakes x^5
# 2^x = x^5 near x=22 (rough)
ax.annotate('$2^x$ overtakes $x^5$\naround here',
            xy=(22, 2**22), xytext=(16, 6e6),
            arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=1.2),
            fontsize=9, color='#e74c3c')

plt.tight_layout()
plt.show()
```

**Walkthrough:** `2**x` with a numpy array `x` computes $2^{x_i}$ at
every point. `x**5` computes $x_i^5$ at every point. Both are array
operations, applying the operation element-by-element. `ax.set_ylim(-1e6, 1.2e7)`
uses **scientific notation literals** — `1e6` is Python for $1 \times 10^6$,
and `1.2e7` is $1.2 \times 10^7$. These are plain floats; `e` here is
not Euler's number but exponent notation.

---

### The General Exponential Function and Transformations

The full form of an exponential function with transformations is:

$$f(x) = a \cdot b^{x - h} + k$$

Each parameter has a specific geometric effect:

| Parameter | Effect |
|-----------|--------|
| $a$ | Vertical stretch/compression (and flip if $a < 0$) |
| $b$ | Base — determines growth ($b>1$) or decay ($0<b<1$) |
| $h$ | Horizontal shift (right by $h$) |
| $k$ | Vertical shift; moves the horizontal asymptote to $y = k$ |

**Hand-worked example:** Describe the transformations in $f(x) = 3 \cdot 2^{x-1} - 2$.

- $a = 3$: vertical stretch by factor 3
- $b = 2$: growth function
- $h = 1$: shifted right by 1
- $k = -2$: shifted down by 2; horizontal asymptote is now $y = -2$

Key points: passes through $(h, a + k) = (1, 3 + (-2)) = (1, 1)$.
At $x = 0$: $f(0) = 3 \cdot 2^{-1} - 2 = 1.5 - 2 = -0.5$.

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-3, 5, 300)

fig, axes = plt.subplots(1, 3, figsize=(14, 5))

transforms = [
    (lambda x: 2**x,           '$f(x) = 2^x$',           'Base function'),
    (lambda x: 3 * 2**x,       '$f(x) = 3 \\cdot 2^x$',  'Vertical stretch by 3'),
    (lambda x: 3*2**(x-1) - 2, '$f(x) = 3\\cdot 2^{x-1}-2$', 'Shift right 1, down 2'),
]

for ax, (f, label, desc) in zip(axes, transforms):
    ax.plot(x, f(x), color='#2980b9', lw=2.5)
    ax.axhline(0, color='#333', lw=0.8)
    ax.axvline(0, color='#333', lw=0.8)
    ax.set_title(f'{label}\n{desc}', fontsize=10)
    ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
    ax.set_ylim(-5, 14); ax.grid(True, alpha=0.3)

# On the third plot, mark the horizontal asymptote y=-2
axes[2].axhline(-2, color='#27ae60', lw=1.5, linestyle='--', alpha=0.8,
               label='HA: $y=-2$')
axes[2].legend(fontsize=9)

plt.suptitle('Transformations of $f(x) = 2^x$', fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `lambda x: 3*2**(x-1) - 2` is an anonymous function
encoding $f(x) = 3 \cdot 2^{x-1} - 2$. In Python, operator precedence
means `2**(x-1)` is computed first (exponentiation), then multiplied by
3, then 2 is subtracted — matching the mathematical order. The `zip`
over `axes` and `transforms` pairs each subplot with its case.

---

### Doubling Time and Half-Life

Two key derived quantities for exponential functions:

**Doubling time** — for a growth function $f(t) = f_0 \cdot b^t$ with
$b > 1$, the **doubling time** $T_2$ is the time it takes for the value
to double:

$$f_0 \cdot b^{T_2} = 2 f_0 \implies b^{T_2} = 2 \implies T_2 = \frac{\log 2}{\log b}$$

(Logarithms are formally introduced in Lesson 1.8 — for now, take
$\log$ as the function that inverts $b^x$, so $\log_b(b^x) = x$.)

**Half-life** — for a decay function with $0 < b < 1$, the **half-life**
$T_{1/2}$ is the time for the value to halve:

$$b^{T_{1/2}} = \frac{1}{2} \implies T_{1/2} = \frac{\log(1/2)}{\log b} = \frac{-\log 2}{\log b}$$

Since $0 < b < 1$, $\log b < 0$, so $T_{1/2}$ is positive. ✓

**Hand-worked example:** A tool starts at 100% condition and degrades
at 15% per hour, so $b = 0.85$ (retains 85% each hour).

$$T_{1/2} = \frac{\log(0.5)}{\log(0.85)} = \frac{-0.6931}{-0.1625} \approx 4.27 \text{ hours}$$

After 4.27 hours, the tool is at 50% condition.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Tool wear model: W(t) = 100 * 0.85^t
W0 = 100    # initial condition (%)
b  = 0.85   # 85% retained each hour (15% wear per hour)

# Half-life: time to reach 50%
# Using math.log (natural log) -- consistent since log(0.5)/log(0.85)
# gives the same result regardless of log base (the base cancels)
half_life = math.log(0.5) / math.log(b)
# math.log(x): natural logarithm of x (base e)
# Lesson 1.8 introduces this fully; used here to evaluate the formula

t = np.linspace(0, 20, 400)
W = W0 * b**t   # element-wise: W[i] = 100 * 0.85^t[i]

fig, ax = plt.subplots(figsize=(9, 6))

ax.plot(t, W, color='#e74c3c', lw=2.5,
        label='$W(t) = 100 \\cdot 0.85^t$')

# Horizontal reference lines
ax.axhline(50, color='#aaaaaa', lw=1, linestyle='--')
ax.axhline(25, color='#aaaaaa', lw=1, linestyle='--')
ax.axhline(12.5, color='#aaaaaa', lw=1, linestyle='--')

# Mark successive half-lives
for n, label in [(1,'$T_{1/2}$'), (2,'$2T_{1/2}$'), (3,'$3T_{1/2}$')]:
    t_n = n * half_life
    W_n = W0 * b**t_n
    ax.plot(t_n, W_n, 'o', color='#2980b9', markersize=9, zorder=5)
    ax.annotate(f'{label} = {t_n:.1f} hr\n$W = {W_n:.1f}\\%$',
                xy=(t_n, W_n),
                xytext=(t_n + 1, W_n + 8),
                arrowprops=dict(arrowstyle='->', color='#2980b9', lw=1),
                fontsize=9, color='#2980b9')

ax.set_title('Tool wear: $W(t) = 100 \\cdot 0.85^t$\n'
             f'Half-life $T_{{1/2}} \\approx {half_life:.2f}$ hours', fontsize=11)
ax.set_xlabel('Time (hours)')
ax.set_ylabel('Tool condition (%)')
ax.set_ylim(0, 115)
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

print(f"Half-life: {half_life:.4f} hours")
print(f"After 1 half-life ({half_life:.2f} hr):  W = {W0 * b**half_life:.2f}%")
print(f"After 2 half-lives ({2*half_life:.2f} hr): W = {W0 * b**(2*half_life):.2f}%")
print(f"After 3 half-lives ({3*half_life:.2f} hr): W = {W0 * b**(3*half_life):.2f}%")
```

**Walkthrough:** `math.log(x)` computes the natural logarithm (base $e$).
It appears in the half-life formula because $\log(0.5)/\log(0.85)$ gives
the correct value regardless of which logarithm base is used — the base
cancels in the ratio. Lesson 1.8 derives why. `f'Half-life $T_{{1/2}} \\approx {half_life:.2f}$ hours'`
uses `{{` and `}}` to produce literal braces in the LaTeX subscript —
as established in Lesson 1.5.

---

## Connect the Pieces

**What this lesson built on:** Functions and bijectivity (Lessons 0.6–0.7)
— exponentials are bijective onto $(0,\infty)$, which is why their
inverse (the logarithm) is itself a well-defined function. Rational
functions and asymptotes (Lesson 1.5) — exponentials have a horizontal
asymptote at $y=0$ (or $y=k$ after a shift), the same concept.

**What this lesson makes possible:** Lesson 1.7 (the number $e$) —
the most natural base for an exponential function, determined by a
calculus-flavoured argument. Lesson 1.8 (the natural logarithm) — the
inverse of $e^x$, which undoes the exponential and lets us solve for
$x$ in equations like $b^x = c$. The half-life and doubling time
formulas above use logarithms informally — Lesson 1.8 makes them precise.

**In manufacturing:** tool life follows the Taylor Tool Life equation
$VT^n = C$ (formally derived in Lesson 1.13), which is an exponential
relationship between cutting speed and tool life. Heat treatment cycles,
cooling rates (Newton's law of cooling), and material fatigue
accumulation are all modelled by exponential functions. Understanding
the shape and behaviour of $b^t$ is prerequisite to reading any of
these models correctly.

**In CS:** algorithm complexity classes $O(2^n)$, $O(n!)$, and $O(e^n)$
are all exponential in $n$. The fact proved above — that exponentials
dominate every polynomial — explains why a brute-force $O(2^n)$ algorithm
is fundamentally different from an $O(n^{100})$ one: the exponential
algorithm becomes infeasible for much smaller $n$.

---

## Summary

**Exponential function:** $f(x) = b^x$, where $b > 0$, $b \neq 1$,
domain $\mathbb{R}$, range $(0, \infty)$.

**Growth vs decay:** $b > 1$ → growth; $0 < b < 1$ → decay.

**Universal properties:** passes through $(0,1)$; always positive;
horizontal asymptote at $y = 0$.

**General form:** $f(x) = a \cdot b^{x-h} + k$.
Asymptote shifts to $y = k$.

**Doubling time:** $T_2 = \dfrac{\log 2}{\log b}$ for growth.

**Half-life:** $T_{1/2} = \dfrac{\log(1/2)}{\log b} = \dfrac{-\log 2}{\log b}$ for decay.

**Exponential vs polynomial:** $b^x$ grows faster than $x^n$ for any
fixed $n$, for large enough $x$.

**New Python:**
- `b**x` with numpy array `x` — element-wise exponentiation
- `math.log(x)` — natural logarithm (base $e$)
- `1e6`, `2.5e-3` — scientific notation float literals ($10^6$, $2.5 \times 10^{-3}$)

---

## Problems

### Math

**1.** Evaluate each expression exactly (no calculator).

(a) $2^{-4}$ &emsp;
(b) $\left(\tfrac{1}{3}\right)^{-2}$ &emsp;
(c) $5^0$ &emsp;
(d) $4^{3/2}$ &emsp;
(e) $8^{-1/3}$

<details>
<summary>Answers</summary>

(a) $\frac{1}{16}$ &emsp;
(b) $9$ &emsp;
(c) $1$ &emsp;
(d) $(4^{1/2})^3 = 2^3 = 8$ &emsp;
(e) $\frac{1}{8^{1/3}} = \frac{1}{2}$

</details>

---

**2.** For each exponential function, identify: (i) growth or decay,
(ii) the horizontal asymptote, (iii) the $y$-intercept.

(a) $f(x) = 5 \cdot 3^x$

(b) $g(x) = 2 \cdot (0.4)^x + 1$

(c) $h(x) = -3 \cdot 2^{x+2}$

(d) $k(x) = 4^{-x}$

<details>
<summary>Answers</summary>

(a) Growth ($b=3>1$); HA: $y=0$; $y$-int: $f(0)=5$.

(b) Decay ($b=0.4<1$); HA: $y=1$; $y$-int: $g(0)=3$.

(c) Reflected growth (negative $a$); HA: $y=0$; $y$-int: $h(0)=-12$.

(d) $4^{-x} = (1/4)^x$: decay; HA: $y=0$; $y$-int: $1$.

</details>

---

**3.** A radioactive isotope has a half-life of 8 days.
Starting with 200 grams:

(a) Write the decay model $A(t) = A_0 \cdot b^t$ by finding $b$.

(b) How much remains after 24 days?

(c) After how many days will less than 1 gram remain?

<details>
<summary>Hints</summary>

(a) After one half-life (8 days), half remains: $200 \cdot b^8 = 100$.
Solve for $b$.

(c) Solve $200 \cdot b^t < 1$. Use logarithms (or trial and error for now).

</details>

<details>
<summary>Answers</summary>

(a) $b^8 = 0.5 \Rightarrow b = 0.5^{1/8} = 2^{-1/8} \approx 0.9170$.
Model: $A(t) = 200 \cdot (2^{-1/8})^t = 200 \cdot 2^{-t/8}$.

(b) $A(24) = 200 \cdot 2^{-3} = 200/8 = 25$ grams.

(c) $200 \cdot 2^{-t/8} < 1 \Rightarrow 2^{-t/8} < 1/200$.
$-t/8 < \log_2(1/200) = -\log_2(200) \approx -7.644$.
$t > 61.1$ days. So after 62 days (rounding up to next whole day).

</details>

---

**4.** (Proof) Prove that for any base $b > 1$ and any $\varepsilon > 0$,
there exists $N$ such that $b^x > x^2$ for all $x > N$.

*(This is the simplest case of "exponential dominates polynomial."
Use the fact that $b^x = e^{x \ln b}$ and that $e^u > u^3/6$
for large $u$ — which follows from the Taylor series in Stage 5.
For now, you may state the bound $e^u > u^3/6$ as given.)*

<details>
<summary>Hint</summary>

Write $b^x = e^{x \ln b}$. Let $u = x \ln b$ (so $x = u/\ln b$).
Then $b^x = e^u > u^3/6$. Show that $u^3/6 > x^2$ for large enough $x$.

</details>

<details>
<summary>Answer</summary>

Let $c = \ln b > 0$ (since $b > 1$). Then $b^x = e^{cx}$.
Using the given bound $e^u > u^3/6$ for large $u$:
$e^{cx} > \frac{(cx)^3}{6} = \frac{c^3 x^3}{6}$.
For $x > 6/c^3$: $\frac{c^3 x^3}{6} > x^2 \cdot \frac{c^3 x}{6} > x^2$
whenever $x > 6/c^3$.
So take $N = \max(N_0, 6/c^3)$ where $N_0$ is large enough for the
$e^u > u^3/6$ bound to hold. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Exponential evaluator**

```python
def exp_evaluate(base, x_values):
    """
    Evaluate f(x) = base^x at every value in x_values.
    Returns a list of output values.
    
    base:     the exponential base (positive float, not 1)
    x_values: list of x values to evaluate at
    """
    pass  # your code here


# --- tests: do not modify ---
assert exp_evaluate(2, [0, 1, 2, 3])     == [1, 2, 4, 8]
assert exp_evaluate(0.5, [0, 1, 2])      == [1, 0.5, 0.25]
assert exp_evaluate(10, [-1, 0, 1])      == [0.1, 1, 10]
assert exp_evaluate(3, [])               == []

import math
result = exp_evaluate(math.e, [1])
assert abs(result[0] - math.e) < 1e-10, "f(1) = e for base e"

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Use a list comprehension: `[base**x for x in x_values]`.

</details>

---

**Challenge 2 — Doubling time and half-life calculator**

```python
import math

def doubling_time(base):
    """
    Return the doubling time T such that base^T = 2.
    Requires base > 1.
    """
    pass  # your code here

def half_life(base):
    """
    Return the half-life T such that base^T = 0.5.
    Requires 0 < base < 1.
    """
    pass  # your code here


# --- tests: do not modify ---
import math

# Doubling time of 2^x is 1 (one step doubles)
assert abs(doubling_time(2) - 1.0)    < 1e-10

# Doubling time of e^x is ln(2)
assert abs(doubling_time(math.e) - math.log(2)) < 1e-10

# Half-life of (1/2)^x is 1
assert abs(half_life(0.5) - 1.0)      < 1e-10

# Tool wear base 0.85
T = half_life(0.85)
assert abs(T - 4.265) < 0.001, f"Expected ~4.265, got {T:.4f}"

# Verify: base^(doubling_time) == 2
for b in [2, 3, 1.05, math.e]:
    T = doubling_time(b)
    assert abs(b**T - 2) < 1e-9, f"b={b}: b^T should be 2"

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

$T_2 = \log(2) / \log(b)$ and $T_{1/2} = \log(0.5) / \log(b)$.
Use `math.log(x)` for the natural logarithm. The ratio of two
natural logs equals the ratio of logs in any other base — the
base cancels.

</details>

---

**Challenge 3 — Model fit**

Given data points $(t, W)$ from a tool wear experiment, find the best
exponential model $W(t) = W_0 \cdot b^t$ by estimating $b$.

```python
import numpy as np

def fit_exponential_decay(t_values, w_values):
    """
    Given measured times t_values and corresponding values w_values,
    find the best-fit base b for the model W(t) = w_values[0] * b^t.
    
    Strategy: for each consecutive pair (t_i, W_i), (t_{i+1}, W_{i+1}),
    estimate b as (W_{i+1}/W_i)^(1/(t_{i+1}-t_i)).
    Return the average of these estimates.
    
    t_values: list of time values (increasing)
    w_values: list of measured W values
    Returns: estimated base b
    """
    pass  # your code here


# --- tests: do not modify ---
import math

# Perfect exponential with b=0.85
t = [0, 1, 2, 3, 4, 5]
W = [100 * 0.85**ti for ti in t]
b_fit = fit_exponential_decay(t, W)
assert abs(b_fit - 0.85) < 1e-6, f"Expected 0.85, got {b_fit:.6f}"

# Noisy data: b should be close to 0.9
import random
random.seed(42)
t2 = list(range(10))
W2 = [100 * 0.9**ti * (1 + random.gauss(0, 0.01)) for ti in t2]
b_noisy = fit_exponential_decay(t2, W2)
assert abs(b_noisy - 0.9) < 0.05, f"Noisy fit: expected near 0.9, got {b_noisy:.4f}"

print(f"✓ Challenge 3 passed!")
print(f"  Clean fit: b = {fit_exponential_decay(t, W):.6f} (true: 0.85)")
print(f"  Noisy fit: b = {fit_exponential_decay(t2, W2):.4f} (true: 0.90)")
```

---

### Extension

**4. ★** The **Rule of 72** is an engineering approximation: the
doubling time of a quantity growing at rate $r$% per period is
approximately $72/r$ periods.

(a) The exact formula is $T_2 = \ln(2)/\ln(1 + r/100)$.
For small $r$, show that $T_2 \approx 69.3/r$ (the true approximation)
and explain why 72 is used instead of 69.3.

(b) Verify the rule numerically for $r = 1, 2, 5, 10, 20$.

```python
import math

print(f"{'r%':>5} | {'Exact T':>10} | {'72/r':>8} | {'Error %':>9}")
print("-" * 40)
for r in [1, 2, 5, 10, 20]:
    exact = math.log(2) / math.log(1 + r/100)
    approx = 72 / r
    error = abs(approx - exact) / exact * 100
    print(f"{r:>5} | {exact:>10.4f} | {approx:>8.4f} | {error:>8.2f}%")
```

(c) How long does it take for a 5% annual salary increase to double
your salary? Use both the exact formula and the Rule of 72.

<details>
<summary>Answer to (a)</summary>

Using $\ln(1+x) \approx x$ for small $x$ (Taylor series, Stage 5):
$T_2 = \ln(2)/\ln(1+r/100) \approx \ln(2)/(r/100) = 100\ln(2)/r \approx 69.3/r$.
The rule uses 72 instead of 69.3 because 72 has more integer divisors
(1,2,3,4,6,8,9,12,18,24,36,72) making mental arithmetic easier, and the
approximation is better at the most commonly used rates (6–10%).

</details>

**5. ★** Prove that $f(x) = b^x$ is injective for any $b > 0$, $b \neq 1$.

<details>
<summary>Answer</summary>

Suppose $b^{x_1} = b^{x_2}$. Taking $\log_b$ of both sides (valid
since $b \neq 1$): $x_1 = x_2$. So $f(x_1) = f(x_2) \Rightarrow x_1 = x_2$,
confirming injectivity. $\blacksquare$

Alternatively (without logs): if $x_1 \neq x_2$, say $x_1 < x_2$,
then $b^{x_2}/b^{x_1} = b^{x_2-x_1}$. Since $x_2 - x_1 > 0$:
for $b>1$ this is $>1$, so $b^{x_2} > b^{x_1}$; for $0<b<1$ this is $<1$,
so $b^{x_2} < b^{x_1}$. In either case $b^{x_1} \neq b^{x_2}$. $\blacksquare$

</details>
