# Stage 1, Lesson 1.8 — The Natural Logarithm $\ln$
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Lesson 1.7 introduced the exponential function $e^x$: it takes an exponent and produces a value. The natural logarithm $\ln x$ is the inverse: it takes a value and produces the exponent that $e$ must be raised to in order to produce it. If $e^2 \approx 7.389$, then $\ln(7.389) \approx 2$. That definition sounds simple, but the natural logarithm is not merely "the log button on a calculator" — it is the function that appears in every rate calculation involving $e$, including the solution of half-life problems, the time constant of any exponential decay, the entropy of a probability distribution, and the complexity of sorting algorithms. By the end of this lesson you can state the definition of $\ln$ precisely as an inverse function, derive and apply its domain and range, use its key properties, and solve equations involving $e^x$ and $\ln x$.

---

## Historical Context

The natural logarithm was recognised as the "area under the hyperbola $1/x$" by Grégoire de Saint-Vincent in 1647 — before calculus was formalised. The precise connection is $\ln x = \int_1^x \frac{1}{t}\, dt$ (proved in Lesson 5.16). John Napier's 1614 logarithm tables used a different base — his logarithm was related to $1/e$, not $e$ — but the concept of logarithm as a function converting multiplication to addition was already central. Euler, in 1748, established $\ln$ as the inverse of $e^x$ in the modern sense and proved that $\frac{d}{dx}\ln x = 1/x$ — the fact that links $\ln$ to the area interpretation. The notation "$\ln$" for "logarithmus naturalis" is used in engineering and science; pure mathematics sometimes writes $\log x$ with the base $e$ understood.

---

## What You Need To Know First

- **Inverse functions** — Lesson 0.8. $\ln$ is the inverse of $e^x$; the composition laws $\ln(e^x) = x$ and $e^{\ln x} = x$ follow directly from the definition of inverse.
- **The number $e$** — Lesson 1.7. $\ln x$ is defined as the inverse of $e^x$ and cannot be understood separately.
- **Bijectivity** — Lesson 0.7. $e^x: \mathbb{R} \to (0, \infty)$ is bijective, which is why its inverse $\ln: (0, \infty) \to \mathbb{R}$ is well-defined.

---

## The Lesson

### Definition and Domain

**Definition:** The **natural logarithm** $\ln x$ is the inverse function of $e^x$.

Precisely: $\ln x = y$ if and only if $e^y = x$.

In symbols:

$$y = \ln x \iff e^y = x$$

Since $e^y$ is defined for all $y \in \mathbb{R}$ and has range $(0, \infty)$:
- **Domain of $\ln$:** $(0, \infty)$ — only positive numbers have logarithms.
- **Range of $\ln$:** $\mathbb{R}$ — the logarithm can be any real number (positive, zero, or negative).

**Formal lens:**

$$\ln: (0, \infty) \to \mathbb{R}, \qquad \ln x = y \iff e^y = x$$

Being the inverse of $e^x$ (which is bijective onto $(0, \infty)$), $\ln$ is also bijective.

**The two cancellation identities** (follow directly from "inverse" meaning):

$$\ln(e^x) = x \quad \text{for all } x \in \mathbb{R}$$
$$e^{\ln x} = x \quad \text{for all } x > 0$$

These are not formulas to memorise separately — they are the definition of "inverse function" applied to $e^x$ and $\ln$.

**Key values:**

| Expression | Value | Why |
|------------|-------|-----|
| $\ln 1$ | $0$ | $e^0 = 1$ |
| $\ln e$ | $1$ | $e^1 = e$ |
| $\ln(e^2)$ | $2$ | $e^2 = e^2$ |
| $\ln(1/e)$ | $-1$ | $e^{-1} = 1/e$ |
| $\ln(1/e^3)$ | $-3$ | $e^{-3} = 1/e^3$ |

Notice: $\ln x < 0$ when $x < 1$, $\ln x = 0$ when $x = 1$, $\ln x > 0$ when $x > 1$.

---

### The Graph of $\ln x$

**Geometric lens:** The graph of $\ln x$ is the reflection of the graph of $e^x$ across the line $y = x$. Every property of one graph corresponds to a property of the other:

| $e^x$ property | Corresponding $\ln x$ property |
|----------------|-------------------------------|
| Domain: $\mathbb{R}$; Range: $(0, \infty)$ | Domain: $(0, \infty)$; Range: $\mathbb{R}$ |
| Passes through $(0, 1)$ | Passes through $(1, 0)$ |
| $e^x \to 0$ as $x \to -\infty$ (horizontal asymptote) | $\ln x \to -\infty$ as $x \to 0^+$ (vertical asymptote) |
| $e^x \to +\infty$ as $x \to +\infty$ | $\ln x \to +\infty$ as $x \to +\infty$ (but slowly) |

```python
import numpy as np
import matplotlib.pyplot as plt

x_exp = np.linspace(-3, 3, 400)
x_ln  = np.linspace(0.01, 8, 400)
# x_ln starts at 0.01, not 0 — because ln(0) is undefined (vertical asymptote)

fig, ax = plt.subplots(figsize=(8, 7))

ax.plot(x_exp, np.exp(x_exp), color='#2980b9', lw=2.5, label='$y = e^x$')
ax.plot(x_ln,  np.log(x_ln),  color='#e74c3c', lw=2.5, label='$y = \\ln x$')
# np.log(x) computes the natural logarithm (base e), not log base 10
# (np.log10(x) would be base 10)

ax.plot([-3, 8], [-3, 8], color='#aaaaaa', lw=1.2, linestyle='--',
        label='$y = x$ (reflection line)')
ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)

# Mark key points
for pt, label in [((0, 1), '$(0,1)$'), ((1, 0), '$(1,0)$'),
                  ((1, np.e), '$(1,e)$'), ((np.e, 1), '$(e,1)$')]:
    ax.plot(*pt, 'o', color='#555', markersize=7, zorder=5)
    ax.annotate(label, xy=pt, xytext=(pt[0]+0.2, pt[1]+0.3), fontsize=9)

ax.set_xlim(-3, 8); ax.set_ylim(-3, 8)
ax.set_aspect('equal')
ax.set_title('$e^x$ and $\\ln x$ are reflections of each other across $y = x$',
             fontsize=11)
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `np.log(x)` computes the natural logarithm — base $e$. This is a common source of confusion: in Python (and most programming languages), `log` without qualification means natural log. `np.log10(x)` is base 10. `ax.set_aspect('equal')` makes the $x$ and $y$ scales identical, so the reflection across $y = x$ is visually accurate.

---

### Logarithm Laws

The logarithm has three laws that follow directly from the properties of exponents. Each corresponds to an exponent rule.

**Law 1 — Product to sum:**

$$\ln(ab) = \ln a + \ln b, \qquad a, b > 0$$

*Proof:* Let $\ln a = p$ and $\ln b = q$, so $e^p = a$ and $e^q = b$.
Then $ab = e^p \cdot e^q = e^{p+q}$, so $\ln(ab) = p + q = \ln a + \ln b$. $\blacksquare$

**Law 2 — Quotient to difference:**

$$\ln\!\left(\frac{a}{b}\right) = \ln a - \ln b, \qquad a, b > 0$$

*Proof:* $a/b = e^p/e^q = e^{p-q}$, so $\ln(a/b) = p - q = \ln a - \ln b$. $\blacksquare$

**Law 3 — Power to product:**

$$\ln(a^r) = r \ln a, \qquad a > 0, r \in \mathbb{R}$$

*Proof:* $a = e^p$ so $a^r = (e^p)^r = e^{pr}$, thus $\ln(a^r) = pr = r \ln a$. $\blacksquare$

These are not three separate facts — they are all the same fact: logarithm converts exponent arithmetic (powers, roots, products, quotients) into ordinary arithmetic (addition, subtraction, multiplication). That conversion is why logarithm tables (before calculators) reduced hours of multiplication to minutes of addition.

**Hand-worked example:** Simplify $\ln(8) - \ln(2) + \ln(e^3)$.

$$\ln(8) - \ln(2) + \ln(e^3) = \ln\!\left(\frac{8}{2}\right) + 3 = \ln(4) + 3 = \ln(2^2) + 3 = 2\ln 2 + 3$$

Numerically: $2 \times 0.6931 + 3 = 1.3863 + 3 = 4.3863$.

Verify: $\ln(8) - \ln(2) + 3 = 2.0794 - 0.6931 + 3 = 4.3863$. ✓

```python
import math

# Verify all three laws numerically
a, b = 6.0, 4.0
r = 3.5

print("Law 1: ln(ab) = ln(a) + ln(b)")
print(f"  ln({a}*{b}) = ln({a*b}) = {math.log(a*b):.8f}")
print(f"  ln({a}) + ln({b}) = {math.log(a):.8f} + {math.log(b):.8f} = {math.log(a)+math.log(b):.8f}")
print(f"  Equal: {abs(math.log(a*b) - (math.log(a)+math.log(b))) < 1e-12}\n")

print("Law 2: ln(a/b) = ln(a) - ln(b)")
print(f"  ln({a}/{b}) = ln({a/b}) = {math.log(a/b):.8f}")
print(f"  ln({a}) - ln({b}) = {math.log(a) - math.log(b):.8f}")
print(f"  Equal: {abs(math.log(a/b) - (math.log(a)-math.log(b))) < 1e-12}\n")

print("Law 3: ln(a^r) = r * ln(a)")
print(f"  ln({a}^{r}) = ln({a**r:.4f}) = {math.log(a**r):.8f}")
print(f"  {r} * ln({a}) = {r * math.log(a):.8f}")
print(f"  Equal: {abs(math.log(a**r) - r*math.log(a)) < 1e-10}")
```

**Walkthrough:** `math.log(x)` is the natural logarithm; `a**r` is $a^r$. Each verification computes both sides of the law and checks they agree to within `1e-12` — floating-point arithmetic introduces rounding errors below this threshold, so equality within this tolerance confirms the laws hold.

---

### Converting Between Bases

Sometimes you need $\log_b x$ (log base $b$) rather than $\ln x$. The **change of base formula** converts any logarithm to natural logarithms:

$$\log_b x = \frac{\ln x}{\ln b}$$

*Derivation:* If $\log_b x = y$, then $b^y = x$. Taking $\ln$ of both sides: $y \ln b = \ln x$, so $y = \ln x / \ln b$. $\blacksquare$

**Hand-worked example:** Compute $\log_2(32)$.

$$\log_2(32) = \frac{\ln 32}{\ln 2} = \frac{\ln(2^5)}{\ln 2} = \frac{5 \ln 2}{\ln 2} = 5$$

Verify: $2^5 = 32$. ✓

This is also how calculators compute $\log_b x$ internally — they compute two natural logs and divide.

```python
import math

def log_base(x, b):
    """Compute log base b of x using the change of base formula."""
    return math.log(x) / math.log(b)

# Verify
print(f"log_2(32)  = {log_base(32, 2):.6f}  (expected 5)")
print(f"log_10(100) = {log_base(100, 10):.6f} (expected 2)")
print(f"log_3(81)  = {log_base(81, 3):.6f}  (expected 4)")
print(f"log_e(e^7) = {log_base(math.e**7, math.e):.6f} (expected 7)")
```

**Walkthrough:** `math.log(x) / math.log(b)` implements the change of base formula. This is also available as `math.log(x, b)` (Python's two-argument form), but expressing it explicitly makes the formula visible.

---

### Solving Equations with $\ln$ and $e^x$

The standard technique: to solve for a variable in an exponent, take $\ln$ of both sides. To solve for a variable inside a $\ln$, apply $e^{(\cdot)}$ to both sides.

**Pattern 1 — Variable in exponent:**

Solve $e^{2t} = 7$:

$$e^{2t} = 7 \implies \ln(e^{2t}) = \ln 7 \implies 2t = \ln 7 \implies t = \frac{\ln 7}{2} \approx \frac{1.9459}{2} \approx 0.9730$$

Verify: $e^{2 \times 0.9730} = e^{1.9459} \approx 7$. ✓

**Pattern 2 — Variable inside $\ln$:**

Solve $\ln(3x - 1) = 4$:

$$\ln(3x-1) = 4 \implies e^{\ln(3x-1)} = e^4 \implies 3x - 1 = e^4 \implies x = \frac{e^4 + 1}{3} \approx \frac{54.598 + 1}{3} \approx 18.533$$

Verify: $\ln(3 \times 18.533 - 1) = \ln(54.598) \approx 4$. ✓

**Pattern 3 — Half-life formula (from Lesson 1.6 made precise):**

The decay model $A(t) = A_0 e^{-\lambda t}$ reaches half its value when:

$$A_0 e^{-\lambda T_{1/2}} = \frac{A_0}{2} \implies e^{-\lambda T_{1/2}} = \frac{1}{2} \implies -\lambda T_{1/2} = \ln\!\left(\frac{1}{2}\right) = -\ln 2 \implies T_{1/2} = \frac{\ln 2}{\lambda}$$

This derives the half-life formula precisely: $T_{1/2} = \ln 2 / \lambda$.

```python
import math

# Solve e^(kt) = C for t
def solve_exp_eq(k, C):
    """Solve e^(kt) = C for t: t = ln(C)/k"""
    if C <= 0:
        raise ValueError("C must be positive: e^(kt) is always positive")
    return math.log(C) / k

# Solve ln(x) = c for x
def solve_ln_eq(c):
    """Solve ln(x) = c for x: x = e^c"""
    return math.exp(c)

# Half-life from decay constant
def half_life_from_lambda(lam):
    """T_{1/2} = ln(2) / lambda"""
    return math.log(2) / lam

print("Solving e^(2t) = 7:")
t = solve_exp_eq(2, 7)
print(f"  t = ln(7)/2 = {t:.6f}")
print(f"  Verify: e^(2t) = {math.exp(2*t):.6f} (should be 7.000000)\n")

print("Solving ln(3x-1) = 4:")
x = (solve_ln_eq(4) + 1) / 3
print(f"  x = (e^4 + 1)/3 = {x:.6f}")
print(f"  Verify: ln(3x-1) = {math.log(3*x - 1):.6f} (should be 4.000000)\n")

# Carbon-14 half-life: lambda = 1.2097e-4 per year
lam_C14 = 1.2097e-4
print(f"Carbon-14 half-life: T_{{1/2}} = ln(2) / {lam_C14:.4e} = {half_life_from_lambda(lam_C14):.0f} years")
```

**Walkthrough:** `math.log(C) / k` implements $\ln C / k$. `math.exp(c)` computes $e^c$. The carbon-14 calculation shows the formula applied to a real physical constant: the accepted half-life of ${}^{14}\text{C}$ is 5730 years, matching what the formula gives with the standard decay constant.

---

## Connect the Pieces

**What this lesson built on:** The inverse function definition (Lesson 0.8) — $\ln$ is exactly the inverse of $e^x$, nothing more. Exponent laws (Lesson 1.1 prerequisites) — the three logarithm laws are the exponent laws in disguise.

**What this lesson makes possible:** Lesson 1.9 (logarithm laws applied to other bases) — the same three laws hold for $\log_b$ with $b$ in place of $e$, proved by the same argument. Lesson 1.10 (exponential and logarithmic equations) — the solve patterns above are the central technique. Lesson 5.8 (derivative of $\ln$) — where the formula $(d/dx)\ln x = 1/x$ is derived, completing the calculus of logarithms.

**In engineering:** Whenever an exponential model contains an unknown exponent — time to discharge to 1% of initial charge, time for a radioactive sample to reach safe levels, time for a population to double — the answer is obtained by solving $e^{kt} = C$, which gives $t = \ln(C)/k$. Every such calculation uses the natural logarithm.

**In CS:** $\ln n$ appears in algorithm analysis: the number of halvings to reduce $n$ to 1 (binary search depth) is $\log_2 n = \ln n / \ln 2$. The entropy of a probability distribution $H = -\sum p_i \ln p_i$ (Lesson 8.11) uses natural log. The Stirling approximation $\ln(n!) \approx n\ln n - n$ (used in combinatorics) comes directly from properties of $\ln$.

---

## Summary

**Definition:** $y = \ln x \iff e^y = x$. Domain $(0, \infty)$, range $\mathbb{R}$.

**Cancellation identities:** $\ln(e^x) = x$ and $e^{\ln x} = x$.

**Key values:** $\ln 1 = 0$, $\ln e = 1$, $\ln(1/e) = -1$.

**Three laws:**
$$\ln(ab) = \ln a + \ln b \qquad \ln(a/b) = \ln a - \ln b \qquad \ln(a^r) = r\ln a$$

**Change of base:** $\log_b x = \dfrac{\ln x}{\ln b}$

**Solving $e^{kt} = C$:** $t = \dfrac{\ln C}{k}$

**Solving $\ln(f(x)) = c$:** $f(x) = e^c$

**Half-life formula (derived):** $T_{1/2} = \dfrac{\ln 2}{\lambda}$

**New Python:**
- `math.log(x)` — natural logarithm (base $e$)
- `math.log(x, b)` — logarithm base $b$
- `math.log10(x)` — base-10 logarithm
- `np.log(x)` — natural logarithm, element-wise on arrays
- `math.exp(x)` — $e^x$; `np.exp(x)` — element-wise on arrays

---

## Problems

### Computation

**1.** Evaluate exactly (no calculator).

(a) $\ln(e^5)$ &emsp; (b) $e^{\ln 3}$ &emsp; (c) $\ln(1)$ &emsp; (d) $\ln(e^{-2})$ &emsp; (e) $e^{3\ln 2}$

<details>
<summary>Answers</summary>

(a) $5$ &emsp; (b) $3$ &emsp; (c) $0$ &emsp; (d) $-2$ &emsp; (e) $e^{\ln(2^3)} = 2^3 = 8$

</details>

---

**2.** Simplify using logarithm laws. Leave the answer in terms of $\ln 2$ and $\ln 3$ where needed.

(a) $\ln 6$  &emsp;
(b) $\ln(1/4)$  &emsp;
(c) $\ln(12)$  &emsp;
(d) $\ln\!\sqrt{e}$  &emsp;
(e) $\ln(e^2 \cdot 8)$

<details>
<summary>Answers</summary>

(a) $\ln 2 + \ln 3$ &emsp;
(b) $-\ln 4 = -2\ln 2$ &emsp;
(c) $\ln(4 \cdot 3) = \ln 4 + \ln 3 = 2\ln 2 + \ln 3$ &emsp;
(d) $\ln(e^{1/2}) = \tfrac{1}{2}$ &emsp;
(e) $2 + \ln 8 = 2 + 3\ln 2$

</details>

---

**3.** Solve for the unknown. Give exact answers, then decimal approximations to 4 d.p.

(a) $e^{3x} = 20$ &emsp;
(b) $\ln(2x + 5) = 3$ &emsp;
(c) $5e^{-0.2t} = 1$ &emsp;
(d) $\ln x - \ln(x-1) = 1$

<details>
<summary>Answers</summary>

(a) $x = \ln(20)/3 \approx 0.9986$

(b) $2x+5 = e^3 \Rightarrow x = (e^3 - 5)/2 \approx 7.5430$

(c) $e^{-0.2t} = 0.2 \Rightarrow t = -\ln(0.2)/0.2 = \ln 5 / 0.2 \approx 8.0472$

(d) $\ln(x/(x-1)) = 1 \Rightarrow x/(x-1) = e \Rightarrow x = e(x-1) \Rightarrow x(1-e) = -e \Rightarrow x = e/(e-1) \approx 1.5820$

</details>

---

### Understanding

**4.** Why is $\ln(-3)$ undefined? Why is $\ln(0)$ undefined? Explain using the definition $y = \ln x \iff e^y = x$.

<details>
<summary>Answer</summary>

$\ln(-3)$ would require $e^y = -3$ for some $y \in \mathbb{R}$. But $e^y > 0$ for all real $y$ — the exponential function is always positive. There is no $y$ satisfying $e^y = -3$, so $\ln(-3)$ is undefined. The same argument applies to any non-positive input. For $\ln(0)$: $e^y = 0$ would require $e^y \to 0$, which happens only as $y \to -\infty$ — no finite $y$ satisfies $e^y = 0$. So $\ln 0$ is not a real number; the left-hand limit as $x \to 0^+$ gives $\ln x \to -\infty$.

</details>

---

**5.** A student writes $\ln(a + b) = \ln a + \ln b$. What is wrong?

<details>
<summary>Answer</summary>

The law is $\ln(a \cdot b) = \ln a + \ln b$ — the product goes to a sum. There is no simplification of $\ln(a + b)$. For example: $\ln(1 + 1) = \ln 2 \approx 0.693$, but $\ln 1 + \ln 1 = 0 + 0 = 0 \neq \ln 2$.

</details>

---

### Proof

**6.** Prove the change of base formula: $\log_b x = \dfrac{\ln x}{\ln b}$ for $b > 0$, $b \neq 1$, $x > 0$.

<details>
<summary>Answer</summary>

**Statement:** $\log_b x = \ln x / \ln b$.

**Proof:** Let $y = \log_b x$. By the definition of logarithm base $b$: $b^y = x$. Take the natural logarithm of both sides (both sides are positive): $\ln(b^y) = \ln x$. By the power law: $y \ln b = \ln x$. Since $b \neq 1$, $\ln b \neq 0$, so dividing both sides: $y = \ln x / \ln b$. Substituting back the definition of $y$: $\log_b x = \ln x / \ln b$. $\blacksquare$

</details>

---

### Extension

**7. ★** The **natural logarithm as an area:** The fundamental theorem of calculus (Lesson 5.16) establishes that $\ln x = \int_1^x \frac{1}{t}\, dt$ for $x > 0$.

(a) Verify numerically that $\int_1^e \frac{1}{t}\, dt \approx 1$ using the trapezoid rule with 1000 intervals.

```python
import numpy as np

def trapezoid_integral(f, a, b, n):
    """Approximate integral of f from a to b using n trapezoids."""
    t = np.linspace(a, b, n+1)
    y = f(t)
    h = (b - a) / n
    # Trapezoid rule: h * (y[0]/2 + y[1] + y[2] + ... + y[n-1] + y[n]/2)
    return h * (y[0]/2 + np.sum(y[1:-1]) + y[-1]/2)

result = trapezoid_integral(lambda t: 1/t, 1, np.e, 1000)
print(f"Trapezoid rule: ∫_1^e (1/t) dt ≈ {result:.8f}")
print(f"Expected (ln e): 1.00000000")
```

(b) Using the area interpretation, explain without calculus why $\ln(ab) = \ln a + \ln b$.

<details>
<summary>Answer to (b)</summary>

$\ln(ab) = \int_1^{ab} \frac{1}{t}\, dt$. Split the integral at $t = a$:

$= \int_1^a \frac{1}{t}\, dt + \int_a^{ab} \frac{1}{t}\, dt$.

The first integral is $\ln a$. In the second, substitute $t = au$, $dt = a\,du$; when $t = a$, $u = 1$; when $t = ab$, $u = b$:

$\int_a^{ab} \frac{1}{t}\, dt = \int_1^b \frac{1}{au} a\, du = \int_1^b \frac{1}{u}\, du = \ln b$.

So $\ln(ab) = \ln a + \ln b$.

</details>

**8. ★** Prove that $\ln x \leq x - 1$ for all $x > 0$, with equality only at $x = 1$.

*(Hint: let $g(x) = (x-1) - \ln x$ and show $g(x) \geq 0$ with $g(1) = 0$. To show $g$ achieves its minimum at $x=1$, use the derivative $g'(x) = 1 - 1/x$ — Stage 5 tools, but the verification of $g'(1) = 0$ and the sign of $g'$ can be checked numerically here.)*
