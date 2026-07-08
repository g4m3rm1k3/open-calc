# Stage 1, Lesson 1.8 — The Natural Logarithm $\ln$
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

The exponential function $e^x$ takes any real number and produces a
positive number. It is bijective onto $(0, \infty)$. That bijectivity,
established in Lesson 1.6, guarantees an inverse function exists — and
that inverse is the **natural logarithm** $\ln(x)$. Where $e^x$ asks
"what do I get when I raise $e$ to the power $x$?", $\ln(x)$ asks
"what power of $e$ gives me $x$?". The two questions undo each other
perfectly: $e^{\ln x} = x$ and $\ln(e^x) = x$. This lesson builds
$\ln$ from its definition as an inverse, derives its properties from
the exponential laws, plots it, and then uses it to solve exponential
equations — the step that completes the toolkit started in Lesson 1.6.
By the end, you will be able to undo any exponential and solve equations
like $b^x = c$ exactly.

---

## Historical Context

Logarithms predate the number $e$ by about 70 years. John Napier
published his logarithm tables in 1614 to simplify multiplication —
his tables turned multiplication into addition, which was far faster
for astronomers computing planetary positions by hand. Henry Briggs
visited Napier and together they developed the common logarithm (base 10).
The natural logarithm, base $e$, emerged later through the work of
Nicolaus Mercator (1668), who computed $\ln(1+x)$ as an infinite series,
and Euler, who connected it to $e$ and established all its modern
properties. The word "logarithm" comes from Greek: *logos* (ratio) and
*arithmos* (number) — reflecting how Napier originally defined it as
something like the count of a ratio applied repeatedly.

---

## What You Need To Know First

- **Inverse functions** — Lesson 0.8. $\ln$ is the inverse of $e^x$;
  all properties of $\ln$ follow from inversion.
- **The number $e$ and $e^x$** — Lesson 1.7. The domain/range of $e^x$
  becomes the range/domain of $\ln$.
- **Bijective functions** — Lesson 0.7. $e^x : \mathbb{R} \to (0,\infty)$
  is bijective, which is why its inverse exists.

---

## The Lesson

### Definition

**Definition:** The **natural logarithm** $\ln : (0, \infty) \to \mathbb{R}$
is the inverse function of $e^x : \mathbb{R} \to (0, \infty)$.

That is, for any $x \in \mathbb{R}$ and $y > 0$:

$$\ln(e^x) = x \qquad \text{and} \qquad e^{\ln y} = y$$

Read $\ln(y)$ as "the power you raise $e$ to in order to get $y$."

**Formal lens:** as the inverse of a bijection:
- Domain of $\ln$ = Range of $e^x$ = $(0, \infty)$
- Range of $\ln$ = Domain of $e^x$ = $\mathbb{R}$
- $\ln$ is itself bijective (inverse of a bijection is bijective — Lesson 0.7)
- The graph of $\ln$ is the graph of $e^x$ reflected across $y = x$ (Lesson 0.8)

**Key values** (derived directly from $e^x$ values):

| $e^x = y$ | $x$ | Therefore $\ln(y) = $ |
|-----------|-----|----------------------|
| $e^0 = 1$ | $0$ | $\ln(1) = 0$ |
| $e^1 = e$ | $1$ | $\ln(e) = 1$ |
| $e^2 = e^2$ | $2$ | $\ln(e^2) = 2$ |
| $e^{-1} = 1/e$ | $-1$ | $\ln(1/e) = -1$ |
| $e^{1/2} = \sqrt{e}$ | $1/2$ | $\ln(\sqrt{e}) = 1/2$ |

**Two points that must be memorised:** $\ln(1) = 0$ and $\ln(e) = 1$.
Everything else follows from the properties below.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

x_exp = np.linspace(-2.5, 2.5, 300)   # domain for e^x
x_ln  = np.linspace(0.05, 8, 300)      # domain for ln: must be > 0

fig, ax = plt.subplots(figsize=(8, 8))

ax.plot(x_exp, np.exp(x_exp), color='#2980b9', lw=2.5, label='$y = e^x$')
# np.exp: element-wise e^x, unchanged from Lesson 1.7

ax.plot(x_ln, np.log(x_ln),  color='#e74c3c', lw=2.5, label='$y = \\ln(x)$')
# np.log: element-wise natural logarithm (base e)
# Note: np.log is ln, NOT log base 10. np.log10 would be base 10.

ax.plot(x_exp, x_exp, color='#aaaaaa', lw=1.2, linestyle='--',
        label='$y = x$ (mirror line)')

# Mark key points
key_pts_exp = [(-1, math.exp(-1)), (0,1), (1, math.e), (2, math.e**2)]
key_pts_ln  = [(math.exp(-1),-1),  (1,0), (math.e,1),  (math.e**2,2)]

ax.scatter([p[0] for p in key_pts_exp], [p[1] for p in key_pts_exp],
           color='#2980b9', s=70, zorder=5)
ax.scatter([p[0] for p in key_pts_ln],  [p[1] for p in key_pts_ln],
           color='#e74c3c', s=70, zorder=5)

ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)
ax.set_aspect('equal')
ax.set_xlim(-3, 8); ax.set_ylim(-3, 8)
ax.set_title('$\\ln(x)$ is the reflection of $e^x$ across $y=x$\n'
             'Domain of $\\ln$: $(0,\\infty)$;  Range: $\\mathbb{R}$', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.log(x)` computes the natural logarithm $\ln(x)$
element-wise. This is one of the most important things to know about
numpy: **`np.log` is $\ln$, not $\log_{10}$**. The base-10 logarithm
is `np.log10`, and the base-2 logarithm is `np.log2`. The unqualified
`np.log` is always natural. `ax.set_aspect('equal')` forces equal
scaling on both axes — essential here so the reflection across $y=x$
actually looks like a reflection.

---

### The Three Logarithm Laws

The properties of $\ln$ follow directly from the exponential laws.
For any $a, b > 0$ and $r \in \mathbb{R}$:

**Law 1 — Product:**
$$\ln(ab) = \ln a + \ln b$$

*Proof.* Let $\alpha = \ln a$ and $\beta = \ln b$, so $a = e^\alpha$ and $b = e^\beta$.
Then $ab = e^\alpha \cdot e^\beta = e^{\alpha+\beta}$.
Taking $\ln$ of both sides: $\ln(ab) = \alpha + \beta = \ln a + \ln b$. $\blacksquare$

**Law 2 — Quotient:**
$$\ln\!\left(\frac{a}{b}\right) = \ln a - \ln b$$

*Proof.* $a/b = e^\alpha / e^\beta = e^{\alpha - \beta}$,
so $\ln(a/b) = \alpha - \beta = \ln a - \ln b$. $\blacksquare$

**Law 3 — Power:**
$$\ln(a^r) = r \ln a$$

*Proof.* $a^r = (e^\alpha)^r = e^{r\alpha}$,
so $\ln(a^r) = r\alpha = r\ln a$. $\blacksquare$

**Two special cases:**
$$\ln(1/a) = -\ln a \qquad \text{(from Law 2 with } b=a\text{)}$$
$$\ln(\sqrt{a}) = \tfrac{1}{2}\ln a \qquad \text{(from Law 3 with } r=1/2\text{)}$$

**Hand-worked examples:**

(a) Expand $\ln\!\left(\dfrac{x^3 \sqrt{y}}{z^2}\right)$:

$$= \ln(x^3) + \ln(\sqrt{y}) - \ln(z^2) = 3\ln x + \tfrac{1}{2}\ln y - 2\ln z$$

(b) Condense $2\ln 5 + \ln 3 - \ln 75$:

$$= \ln(5^2) + \ln 3 - \ln 75 = \ln(25 \cdot 3) - \ln 75 = \ln 75 - \ln 75 = \ln 1 = 0$$

```python
import math

# Verify all three log laws numerically
a, b, r = 6.0, 4.0, 3.0

print("Verifying logarithm laws:\n")

law1 = math.isclose(math.log(a*b), math.log(a) + math.log(b))
# math.isclose: True if two floats are within a relative tolerance
print(f"Law 1 — Product:   ln({a}×{b}) = ln({a})+ln({b})? {law1}")
print(f"  ln({a*b:.1f}) = {math.log(a*b):.6f}")
print(f"  ln({a})+ln({b}) = {math.log(a)+math.log(b):.6f}")

law2 = math.isclose(math.log(a/b), math.log(a) - math.log(b))
print(f"\nLaw 2 — Quotient:  ln({a}/{b}) = ln({a})-ln({b})? {law2}")
print(f"  ln({a/b:.4f}) = {math.log(a/b):.6f}")
print(f"  ln({a})-ln({b}) = {math.log(a)-math.log(b):.6f}")

law3 = math.isclose(math.log(a**r), r * math.log(a))
print(f"\nLaw 3 — Power:     ln({a}^{r:.0f}) = {r:.0f}×ln({a})? {law3}")
print(f"  ln({a**r:.1f}) = {math.log(a**r):.6f}")
print(f"  {r:.0f}×ln({a}) = {r*math.log(a):.6f}")
```

**Walkthrough:** `math.isclose(a, b)` returns `True` if `a` and `b`
are within a small relative tolerance of each other — safer than `a == b`
for floating-point values. The three laws hold exactly in mathematics but
may differ by a tiny rounding error ($\sim 10^{-16}$) when computed in
floating-point, which `math.isclose` tolerates.

---

### The Graph of $\ln$

Key geometric features of $y = \ln x$:

- **Domain:** $(0, \infty)$ — only positive inputs
- **Range:** $\mathbb{R}$ — outputs can be any real number
- **$x$-intercept:** $(1, 0)$ — since $\ln(1) = 0$
- **No $y$-intercept** — $x=0$ is outside the domain
- **Vertical asymptote:** $x = 0$ — $\ln x \to -\infty$ as $x \to 0^+$
- **Increasing** — larger inputs give larger outputs ($\ln$ is injective)
- **Slow growth** — $\ln x \to +\infty$ as $x \to +\infty$, but extremely slowly

```python
import numpy as np
import matplotlib.pyplot as plt
import math

x = np.linspace(0.05, 10, 400)

fig, ax = plt.subplots(figsize=(9, 6))

ax.plot(x, np.log(x), color='#e74c3c', lw=2.5, label='$y = \\ln(x)$')

# Mark key points
key_x = [1/math.e, 1, math.e, math.e**2]
key_y = [-1,       0, 1,      2        ]
key_labels = ['$(1/e,\\ -1)$', '$(1,\\ 0)$', '$(e,\\ 1)$', '$(e^2,\\ 2)$']

ax.scatter(key_x, key_y, color='#e74c3c', s=80, zorder=5)
for xi, yi, lbl in zip(key_x, key_y, key_labels):
    ax.annotate(lbl, (xi, yi),
                xytext=(xi + 0.3, yi + 0.2),
                fontsize=9, color='#c0392b')

# Vertical asymptote
ax.axvline(0, color='#c0392b', lw=1.5, linestyle='--',
           alpha=0.6, label='VA: $x=0$')
ax.axhline(0, color='#333', lw=0.8)

ax.set_title('$y = \\ln(x)$: domain $(0,\\infty)$, range $\\mathbb{R}$\n'
             'Crosses $x$-axis at $(1,0)$; VA at $x=0$', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$\\ln(x)$')
ax.set_ylim(-3, 3)
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `x = np.linspace(0.05, 10, 400)` starts at $0.05$
rather than $0$ — starting at $0$ would give `np.log(0) = -inf`, which
would cause a gap in the plot. Starting at $0.05$ gets close to the
vertical asymptote without hitting it. The annotated key points are
derived from the inverse relationship: since $e^{-1} = 1/e$, we have
$\ln(1/e) = -1$; since $e^1 = e$, $\ln(e) = 1$; and so on.

---

### Solving Exponential Equations with $\ln$

The primary use of $\ln$ in algebra is solving equations where the
unknown is in an exponent.

**Strategy:** isolate the exponential, then apply $\ln$ to both sides.

**Hand-worked example 1:** Solve $e^x = 7$.

$$e^x = 7 \implies \ln(e^x) = \ln 7 \implies x = \ln 7 \approx 1.9459$$

**Verify:** $e^{1.9459} \approx 7$. ✓

**Hand-worked example 2:** Solve $5 \cdot e^{2x} = 30$.

$$e^{2x} = 6 \implies 2x = \ln 6 \implies x = \frac{\ln 6}{2} \approx 0.8959$$

**Hand-worked example 3:** Solve $3^x = 10$.

The base is not $e$, but $\ln$ still works. Take $\ln$ of both sides:

$$\ln(3^x) = \ln 10 \implies x \ln 3 = \ln 10 \implies x = \frac{\ln 10}{\ln 3} \approx 2.0959$$

This is the **change of base formula:** $\log_b(a) = \dfrac{\ln a}{\ln b}$.

**Hand-worked example 4 (manufacturing):** The tool wear model from
Lesson 1.6: $W(t) = 100 \cdot e^{-0.1625t}$. When does $W = 20\%$?

$$100 e^{-0.1625t} = 20 \implies e^{-0.1625t} = 0.2 \implies -0.1625t = \ln(0.2) \implies t = \frac{\ln(0.2)}{-0.1625} \approx 9.91 \text{ hr}$$

```python
import math

print("Solving exponential equations:\n")

# e^x = 7
x = math.log(7)
print(f"e^x = 7:        x = ln(7) = {x:.6f}")
print(f"  Verify: e^{x:.6f} = {math.e**x:.6f}")

print()
# 5*e^(2x) = 30  =>  e^(2x) = 6  =>  2x = ln(6)
x = math.log(6) / 2
print(f"5e^(2x) = 30:   x = ln(6)/2 = {x:.6f}")
print(f"  Verify: 5*e^(2*{x:.6f}) = {5*math.e**(2*x):.6f}")

print()
# 3^x = 10  =>  x = ln(10)/ln(3)
x = math.log(10) / math.log(3)
print(f"3^x = 10:       x = ln(10)/ln(3) = {x:.6f}")
print(f"  Verify: 3^{x:.6f} = {3**x:.6f}")

print()
# Tool wear: 100*e^(-0.1625t) = 20
k = -0.1625
t = math.log(0.2) / k
print(f"Tool wear W=20%: t = ln(0.2)/(-0.1625) = {t:.4f} hr")
print(f"  Verify: 100*e^(-0.1625*{t:.4f}) = {100*math.e**(k*t):.4f}%")
```

**Walkthrough:** `math.log(7)` computes $\ln 7$ — the natural log.
`math.log(10)/math.log(3)` computes $\log_3(10)$ via the change of
base formula. `math.log(0.2)` gives $\ln(0.2) \approx -1.609$ —
negative because $0.2 < 1$, and $\ln$ of any number between 0 and 1
is negative.

---

### Change of Base Formula

For any base $b > 0$, $b \neq 1$:

$$\log_b(x) = \frac{\ln x}{\ln b}$$

This means $\ln$ is the only logarithm you ever need — any other base
is just a scaled version.

**Proof:** Let $y = \log_b(x)$, meaning $b^y = x$. Take $\ln$ of both
sides: $y \ln b = \ln x$. Divide: $y = \ln x / \ln b$. $\blacksquare$

In Python, `math.log(x, base)` computes $\log_\text{base}(x)$ directly
— but under the hood it computes `math.log(x) / math.log(base)`.

```python
import math

print("Change of base: log_b(x) = ln(x)/ln(b)\n")

cases = [(10, 100, 2), (2, 8, 3), (3, 81, 4), (5, 125, 3)]
for b, x, expected in cases:
    via_ln  = math.log(x) / math.log(b)
    builtin = math.log(x, b)   # math.log(x, base): Python's built-in change of base
    print(f"  log_{b}({x:3d}) = ln({x})/ln({b}) = {via_ln:.6f}  "
          f"(builtin: {builtin:.6f}, expected: {expected})")
```

**Walkthrough:** `math.log(x, b)` is Python's two-argument log: it
computes $\log_b(x)$. Internally it uses the change of base formula.
Providing it here as a cross-check — `via_ln` and `builtin` should
agree to full floating-point precision.

---

### $\ln$ in the Tool Life Equation

The **Taylor Tool Life equation** (a preview of Lesson 1.13) relates
cutting speed $V$ to tool life $T$:

$$VT^n = C \quad \Leftrightarrow \quad \ln V + n \ln T = \ln C$$

Taking $\ln$ converts a nonlinear relationship into a linear one —
the primary reason engineers use logarithms. Plotting $\ln V$ vs $\ln T$
gives a straight line with slope $-1/n$ and intercept $\ln C / n$.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Simulated tool life data: VT^0.25 = 200
n_exp, C = 0.25, 200

# Generate data points
T_vals = np.array([5, 10, 20, 40, 80, 160])   # tool life (minutes)
V_vals = C / T_vals**n_exp                      # cutting speed (m/min)

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: raw V vs T (nonlinear)
axes[0].scatter(T_vals, V_vals, color='#2980b9', s=80, zorder=5)
T_smooth = np.linspace(3, 200, 300)
axes[0].plot(T_smooth, C / T_smooth**n_exp, color='#2980b9', lw=2)
axes[0].set_title('Taylor Tool Life: $VT^{0.25} = 200$\nCurved in linear scale',
                  fontsize=10)
axes[0].set_xlabel('Tool life $T$ (min)'); axes[0].set_ylabel('Speed $V$ (m/min)')
axes[0].grid(True, alpha=0.3)

# Right: ln(V) vs ln(T) — linearised
lnT = np.log(T_vals)
lnV = np.log(V_vals)

axes[1].scatter(lnT, lnV, color='#e74c3c', s=80, zorder=5)

# Fit a line (should have slope -n_exp)
slope, intercept = np.polyfit(lnT, lnV, 1)
# np.polyfit(x, y, deg): fit a polynomial of given degree to data
# returns coefficients [slope, intercept] for deg=1

lnT_line = np.linspace(lnT.min()-0.3, lnT.max()+0.3, 100)
axes[1].plot(lnT_line, slope*lnT_line + intercept,
             color='#e74c3c', lw=2, linestyle='--',
             label=f'Slope = {slope:.3f} (expected: {-n_exp:.3f})')

axes[1].set_title('After taking $\\ln$: $\\ln V = \\ln C - n\\ln T$\n'
                  'Straight line — easy to fit!', fontsize=10)
axes[1].set_xlabel('$\\ln(T)$'); axes[1].set_ylabel('$\\ln(V)$')
axes[1].legend(fontsize=9)
axes[1].grid(True, alpha=0.3)

plt.suptitle('Logarithms linearise power-law relationships', fontsize=12)
plt.tight_layout()
plt.show()

print(f"Fitted slope: {slope:.6f}  (true: {-n_exp:.6f})")
print(f"Fitted intercept: {intercept:.6f}  (ln(C) = {math.log(C):.6f})")
```

**Walkthrough:** `np.polyfit(x, y, 1)` fits a degree-1 polynomial
(a line) to data by least squares — the first appearance of this
function. It returns `[slope, intercept]` for the best-fit line
$y = \text{slope} \cdot x + \text{intercept}$. The key point
demonstrated: $VT^n = C$ is a curve in $(T, V)$ space, but taking
$\ln$ of both sides gives $\ln V + n \ln T = \ln C$, i.e.,
$\ln V = -n \ln T + \ln C$ — a straight line in $(\ln T, \ln V)$ space
with slope $-n$ and intercept $\ln C$. This is why log-log plots are
standard in engineering and science.

---

## Connect the Pieces

**What this lesson built on:** Inverse functions (Lesson 0.8) — $\ln$
is defined as the inverse of $e^x$. Bijectivity (Lesson 0.7) — required
for the inverse to exist. Exponential properties (Lesson 1.7) — the
three log laws are just the exponential laws rewritten.

**What this lesson makes possible:** Lesson 1.9 (Logarithm Laws for
all bases). Lesson 1.10 (Exponential and Logarithmic Equations). The
half-life and doubling time formulas from Lesson 1.6 can now be derived
exactly. Stage 5 (Calculus): $\frac{d}{dx}\ln x = 1/x$ — the derivative
of $\ln$ is one of the most used results in calculus.

**In CS:** `math.log(n)` appears in binary search ($\log_2 n$ steps),
sorting ($n \log n$ comparisons), information entropy ($-p \log p$),
and hash table analysis. All use $\ln$ because the change of base is
just a constant factor that vanishes in big-O notation.

---

## Summary

**Definition:** $\ln = (e^x)^{-1}$. $\ln(e^x) = x$ and $e^{\ln x} = x$.

**Key values:** $\ln(1) = 0$, $\ln(e) = 1$, $\ln(e^k) = k$.

**Domain:** $(0, \infty)$. **Range:** $\mathbb{R}$.

**Laws:**
$$\ln(ab) = \ln a + \ln b \qquad
\ln(a/b) = \ln a - \ln b \qquad
\ln(a^r) = r \ln a$$

**Change of base:** $\log_b(x) = \dfrac{\ln x}{\ln b}$

**Solving $b^x = c$:** $x = \dfrac{\ln c}{\ln b}$

**Graph:** reflection of $e^x$ across $y=x$; VA at $x=0$; crosses
$x$-axis at $(1,0)$; increasing; concave down.

**New Python:**
- `np.log(x)` — natural logarithm $\ln(x)$, element-wise (**not** base 10)
- `math.log(x)` — $\ln(x)$ for a scalar
- `math.log(x, b)` — $\log_b(x)$ for a scalar
- `np.log10(x)`, `np.log2(x)` — base-10 and base-2 logs
- `np.polyfit(x, y, deg)` — least-squares polynomial fit; returns coefficients

---

## Problems

### Math

**1.** Evaluate exactly.

(a) $\ln(e^5)$ &emsp;
(b) $e^{\ln 4}$ &emsp;
(c) $\ln(1)$ &emsp;
(d) $\ln\!\left(\dfrac{1}{e^3}\right)$ &emsp;
(e) $\ln(\sqrt{e})$ &emsp;
(f) $e^{3\ln 2}$

<details>
<summary>Answers</summary>

(a) $5$ &emsp;
(b) $4$ &emsp;
(c) $0$ &emsp;
(d) $-3$ &emsp;
(e) $\tfrac{1}{2}$ &emsp;
(f) $e^{\ln 8} = 8$

</details>

---

**2.** Expand using log laws.

(a) $\ln(x^2 y^3)$

(b) $\ln\!\sqrt{\dfrac{x}{y^2}}$

(c) $\ln\!\left(\dfrac{e^{2x}}{x+1}\right)$

<details>
<summary>Answers</summary>

(a) $2\ln x + 3\ln y$

(b) $\tfrac{1}{2}(\ln x - 2\ln y) = \tfrac{1}{2}\ln x - \ln y$

(c) $2x - \ln(x+1)$

</details>

---

**3.** Solve each equation. Give exact and approximate answers.

(a) $e^x = 15$

(b) $3e^{2x} = 48$

(c) $2^x = 7$

(d) $\ln x = 4$

(e) $\ln(2x-1) = 3$

<details>
<summary>Answers</summary>

(a) $x = \ln 15 \approx 2.708$

(b) $e^{2x} = 16 \Rightarrow 2x = \ln 16 \Rightarrow x = \tfrac{\ln 16}{2} = \tfrac{4\ln 2}{2} = 2\ln 2 \approx 1.386$

(c) $x = \tfrac{\ln 7}{\ln 2} \approx 2.807$

(d) $x = e^4 \approx 54.598$

(e) $2x-1 = e^3 \Rightarrow x = \tfrac{e^3+1}{2} \approx 10.544$

</details>

---

**4.** (Proof) Prove $\ln(a/b) = \ln a - \ln b$ directly from the inverse
relationship $e^{\ln x} = x$, without using the product law.

<details>
<summary>Answer</summary>

Let $\alpha = \ln a$, $\beta = \ln b$. Then $a = e^\alpha$, $b = e^\beta$.
$$\frac{a}{b} = \frac{e^\alpha}{e^\beta} = e^{\alpha-\beta}$$
Taking $\ln$: $\ln(a/b) = \alpha - \beta = \ln a - \ln b$. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Log laws verifier**

```python
import math

def verify_log_laws(a, b, r):
    """
    Verify all three log laws for given a, b > 0 and real r.
    Returns (law1_ok, law2_ok, law3_ok) as booleans.
    """
    pass  # your code here


# --- tests: do not modify ---
for a, b, r in [(6, 4, 3), (math.e, 2, 0.5), (100, 10, -2)]:
    l1, l2, l3 = verify_log_laws(a, b, r)
    assert l1, f"Law 1 failed for a={a}, b={b}"
    assert l2, f"Law 2 failed for a={a}, b={b}"
    assert l3, f"Law 3 failed for a={a}, r={r}"

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Exponential equation solver**

```python
import math

def solve_exp_equation(base, result):
    """
    Solve base^x = result for x.
    Returns x = ln(result) / ln(base).
    Raises ValueError if base <= 0 or base == 1 or result <= 0.
    """
    pass  # your code here


# --- tests: do not modify ---
assert math.isclose(solve_exp_equation(math.e, 7),  math.log(7))
assert math.isclose(solve_exp_equation(2, 8),        3.0)
assert math.isclose(solve_exp_equation(10, 1000),    3.0)
assert math.isclose(solve_exp_equation(3, 1),        0.0)

# Should verify the answer: base^x == result
for base, result in [(2, 32), (5, 25), (math.e, 10)]:
    x = solve_exp_equation(base, result)
    assert math.isclose(base**x, result, rel_tol=1e-9)

try:
    solve_exp_equation(1, 5)
    assert False, "Should raise ValueError for base=1"
except ValueError:
    pass

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Linearise a power law**

Given $(x, y)$ data following a power law $y = a \cdot x^b$, use $\ln$
to linearise it, fit a line, and recover $a$ and $b$.

```python
import numpy as np
import math

def fit_power_law(x_data, y_data):
    """
    Fit y = a * x^b to data using log-linearisation.
    Takes ln of both sides: ln(y) = ln(a) + b*ln(x)
    Uses np.polyfit on (ln(x), ln(y)) to find slope b and intercept ln(a).
    Returns (a, b).
    """
    pass  # your code here


# --- tests: do not modify ---
import numpy as np

# Perfect power law: y = 3 * x^2.5
x = np.array([1, 2, 4, 8, 16], dtype=float)
y = 3 * x**2.5
a_fit, b_fit = fit_power_law(x, y)
assert math.isclose(a_fit, 3.0,  rel_tol=1e-6), f"a={a_fit}"
assert math.isclose(b_fit, 2.5,  rel_tol=1e-6), f"b={b_fit}"

# Tool life data: V = 200 * T^(-0.25), i.e. a=200, b=-0.25
T = np.array([5, 10, 20, 40, 80, 160], dtype=float)
V = 200 * T**(-0.25)
a_fit2, b_fit2 = fit_power_law(T, V)
assert math.isclose(a_fit2, 200.0,  rel_tol=1e-5)
assert math.isclose(b_fit2, -0.25,  rel_tol=1e-5)

print("✓ Challenge 3 passed!")
print(f"  Tool life fit: V = {a_fit2:.1f} * T^({b_fit2:.4f})")
```

<details>
<summary>Hint</summary>

`np.log(x_data)` and `np.log(y_data)` give arrays of log values.
`np.polyfit(np.log(x_data), np.log(y_data), 1)` returns `[b, ln_a]`.
Recover `a = math.exp(ln_a)`.

</details>

---

### Extension

**4. ★** Prove that $\ln(x) < x - 1$ for all $x > 0$, $x \neq 1$.

*(Hint: define $g(x) = x - 1 - \ln x$ and show $g(x) > 0$ for $x \neq 1$.
Use the fact that $g'(x) = 1 - 1/x$, which is 0 at $x=1$ (Stage 5),
and argue from the shape of $g$.)*

<details>
<summary>Answer</summary>

Define $g(x) = x - 1 - \ln x$ on $(0,\infty)$. Then $g(1) = 0$.
$g'(x) = 1 - 1/x$: negative for $x < 1$ (so $g$ is decreasing toward $x=1$),
positive for $x > 1$ (so $g$ is increasing away from $x=1$).
Therefore $x=1$ is a global minimum of $g$, with minimum value $g(1) = 0$.
So $g(x) \geq 0$ for all $x > 0$, with equality only at $x=1$.
Therefore $\ln x \leq x-1$, with equality iff $x=1$. $\square$

</details>

**5. ★** The **entropy** of a probability distribution $(p_1,\ldots,p_n)$
is $H = -\sum_{i=1}^n p_i \ln p_i$ (with $0 \ln 0 := 0$).

(a) Show $H \geq 0$ for any probability distribution.

(b) Compute $H$ for a fair coin $(p_1 = p_2 = 0.5)$ and for a biased
coin $(p_1 = 0.9, p_2 = 0.1)$.

(c) Implement `entropy(probs)` and verify that a uniform distribution
maximises entropy.

```python
import math

def entropy(probs):
    """Compute H = -sum(p * ln(p)) for the probability list probs."""
    pass

# Tests
assert math.isclose(entropy([1.0]),       0.0)
assert math.isclose(entropy([0.5, 0.5]),  math.log(2), rel_tol=1e-9)
assert entropy([0.9, 0.1]) < entropy([0.5, 0.5])  # less uncertainty

# Uniform distribution maximises entropy
n = 6
uniform = [1/n] * n
for _ in range(100):
    import random
    random.seed(_ )
    probs = sorted([random.random() for _ in range(n-1)] + [0, 1])
    trial = [probs[i+1]-probs[i] for i in range(n)]
    assert entropy(uniform) >= entropy(trial) - 1e-10

print("✓ Extension 5 passed!")
```
