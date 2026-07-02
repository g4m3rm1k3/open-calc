# Stage 1, Lesson 1.1 — Polynomials: Structure, Degree, Coefficients
**Threads:** Math · CS  
**Estimated time:** 55–70 minutes

---

## What This Lesson Is About

A polynomial is the simplest kind of function — built from nothing but
a variable, constants, addition, and repeated multiplication. No square
roots, no logarithms, no trigonometry. Just $x$, numbers, and powers.
Despite this simplicity, polynomials can describe almost any smooth curve:
the trajectory of a projectile, the profile of a cam, the shape of a
spline surface in a CAD model. Every curve your CNC machine cuts that is
not a straight line or arc is approximated by polynomials internally.
This lesson builds the vocabulary and arithmetic of polynomials from
scratch — what they are, how they are classified, how their shape is
determined by their degree and leading coefficient, and how to add and
multiply them. By the end you will be able to identify, evaluate,
and perform arithmetic on any polynomial, and implement each operation
in Python both directly and using numpy.

---

## Historical Context

Polynomials are the oldest objects in algebra. Babylonian mathematicians
were solving quadratic equations (degree-2 polynomials) around 1800 BCE,
using geometric methods rather than symbols. The general cubic ($x^3$)
was solved by Cardano in 1545, after being kept secret for years as a
professional advantage in mathematical duels. The quartic ($x^4$) was
solved shortly after. Then mathematics hit a wall: the degree-5 polynomial
resisted every attack for 250 years. In 1824, Niels Abel proved that no
general formula for degree-5 roots can exist — and Évariste Galois, who
died in a duel at 20, explained exactly why, founding the theory of groups
in the process. That theory is Stage 9 of this curriculum. The story of
polynomials runs from 1800 BCE to 1830 CE and ends with abstract algebra.

---

## What You Need To Know First

- **Functions** $f : A \to B$ — Lesson 0.6. A polynomial is a function.
- **Real numbers $\mathbb{R}$** — Lesson 0.1. Polynomials map $\mathbb{R}$ to $\mathbb{R}$.
- **Sets and notation** — Lessons 0.1, 0.11. We use $\forall$, $\in$, $\mathbb{R}$.
- **Proof by induction** — Lesson 0.10. Used in one extension proof.

---

## The Lesson

### What Is a Polynomial?

**Definition:** A **polynomial** in the variable $x$ is a function
$p : \mathbb{R} \to \mathbb{R}$ of the form:

$$p(x) = a_n x^n + a_{n-1} x^{n-1} + \cdots + a_1 x + a_0$$

where $n$ is a non-negative integer and $a_0, a_1, \ldots, a_n \in \mathbb{R}$
are constants called **coefficients**. The coefficient $a_n$ is the
**leading coefficient** and $a_0$ is the **constant term**.

Using sigma notation (introduced in Lesson 0.10):

$$p(x) = \sum_{k=0}^{n} a_k x^k$$

The convention $x^0 = 1$ makes $a_0 x^0 = a_0$, so the constant term
fits naturally into the sum.

**Formal lens:** A polynomial is a function — an element of the function
space $\{f : \mathbb{R} \to \mathbb{R}\}$ defined by a specific form.
The form restricts what operations are allowed: only addition of terms
and multiplication by constants and powers of $x$. No division by $x$,
no square roots, no $\sin x$. These restrictions make polynomials
particularly tractable mathematically — they can always be differentiated,
integrated, and evaluated without worry about undefined values.

**Geometric lens:** every polynomial defines a smooth, unbroken curve
in $\mathbb{R}^2$. Smooth means no corners or kinks. Unbroken means no
gaps or jumps. The shape of the curve — how many hills and valleys,
which way the ends point — is determined entirely by the degree and
leading coefficient.

**Physical/Computational lens:** in CAD and CAM software, **spline curves**
(the smooth curves you draw when modelling a part) are piecewise
polynomials — the curve is divided into segments, each segment a
polynomial of low degree (usually 3 or 4), joined smoothly at the
boundaries. NURBS — the standard representation used in SolidWorks and
most professional CAD systems — stands for Non-Uniform Rational B-Splines,
where B-splines are a specific type of polynomial basis. Understanding
polynomials is understanding what your CAD software is actually computing.

---

### Degree and Classification

**Definition:** The **degree** of a polynomial $p(x) = a_n x^n + \cdots + a_0$
is $n$, provided $a_n \neq 0$. Written $\deg(p) = n$.

The condition $a_n \neq 0$ excludes false leading terms: $0 \cdot x^5 + 2x + 1$
has degree 1, not 5, because the $x^5$ term contributes nothing.

**The zero polynomial** $p(x) = 0$ has no degree by convention — or is
sometimes assigned degree $-\infty$ so that the degree rules work cleanly.

Standard names by degree:

| Degree | Name | General form |
|--------|------|-------------|
| 0 | Constant | $p(x) = a_0$ |
| 1 | Linear | $p(x) = a_1 x + a_0$ |
| 2 | Quadratic | $p(x) = a_2 x^2 + a_1 x + a_0$ |
| 3 | Cubic | $p(x) = a_3 x^3 + a_2 x^2 + a_1 x + a_0$ |
| 4 | Quartic | $p(x) = a_4 x^4 + \cdots + a_0$ |
| 5 | Quintic | $p(x) = a_5 x^5 + \cdots + a_0$ |
| $n$ | Degree-$n$ | $p(x) = a_n x^n + \cdots + a_0$ |

**Hand-worked example:** Identify the degree, leading coefficient,
and constant term of each polynomial.

(a) $p(x) = 3x^4 - 2x^3 + 5x - 7$

Degree: 4. Leading coefficient: $a_4 = 3$. Constant term: $a_0 = -7$.
Note: the $x^2$ term is absent — this means $a_2 = 0$, which is fine.
A polynomial does not need every power present; absent terms have coefficient 0.

(b) $q(x) = -x^3 + x$

Degree: 3. Leading coefficient: $a_3 = -1$. Constant term: $a_0 = 0$.

(c) $r(x) = 5$

Degree: 0. Leading coefficient: $a_0 = 5$. Constant term: $a_0 = 5$.
A constant is a polynomial — a degree-0 one.

(d) $s(x) = 0 \cdot x^5 + 2x + 1$

Degree: 1, not 5. The $x^5$ term vanishes because its coefficient is 0.
Leading coefficient: $a_1 = 2$. Constant term: $a_0 = 1$.

```python
import numpy as np

# np.poly1d constructs a polynomial from its coefficients in DESCENDING order.
# np.poly1d([3, -2, 0, 5, -7]) represents 3x^4 - 2x^3 + 0x^2 + 5x - 7.
# This is the first appearance of np.poly1d -- explained fully below.

p = np.poly1d([3, -2, 0, 5, -7])   # 3x^4 - 2x^3 + 5x - 7
q = np.poly1d([-1, 0, 1, 0])       # -x^3 + x
r = np.poly1d([5])                  # constant polynomial: p(x) = 5

print("p(x) =", p)
print(f"  degree: {p.order}")          # .order returns the degree
print(f"  leading coeff: {p.coeffs[0]}")  # .coeffs is descending array of coefficients
print(f"  constant term: {p.coeffs[-1]}") # index -1: last element = a_0
print()
print("q(x) =", q)
print(f"  degree: {q.order}")
print()
print("r(x) =", r)
print(f"  degree: {r.order}")
```

**Walkthrough:** `np.poly1d([3, -2, 0, 5, -7])` creates a polynomial
object — `np.poly1d` is a numpy class that stores coefficients and
supports arithmetic. The list `[3, -2, 0, 5, -7]` gives coefficients
in **descending** order: the first element is the coefficient of the
highest power, the last is the constant. This is the opposite of the
mathematical convention $\sum_{k=0}^n a_k x^k$, which goes from low
to high — pay attention to which order a library expects.

`.order` returns the degree. `.coeffs` returns the coefficients as a
numpy array in descending order. `p.coeffs[0]` is the leading coefficient
(highest-power term); `p.coeffs[-1]` is the constant term (Python's
`-1` index accesses the last element, introduced in Lesson 0.9's
`y_positions[:-1]` usage — reused freely here).

---

### Evaluating a Polynomial

**Definition:** To **evaluate** $p$ at a point $x = c$ means computing
$p(c) = a_n c^n + \cdots + a_1 c + a_0$.

**Hand-worked example:** Evaluate $p(x) = 3x^4 - 2x^3 + 5x - 7$ at $x = 2$.

$$p(2) = 3(2)^4 - 2(2)^3 + 5(2) - 7 = 3(16) - 2(8) + 10 - 7 = 48 - 16 + 10 - 7 = 35$$

**Horner's method — a smarter evaluation:**

Naively evaluating a degree-$n$ polynomial requires computing each power
$x^k$ separately — that is $O(n^2)$ multiplications in total. Horner's
method rewrites the polynomial to require only $n$ multiplications:

$$p(x) = a_n x^n + a_{n-1}x^{n-1} + \cdots + a_1 x + a_0$$
$$= (\cdots((a_n \cdot x + a_{n-1}) \cdot x + a_{n-2}) \cdot x \cdots + a_1) \cdot x + a_0$$

For $p(x) = 3x^4 - 2x^3 + 5x - 7$ at $x = 2$:

$$((((3) \cdot 2 + (-2)) \cdot 2 + 0) \cdot 2 + 5) \cdot 2 + (-7)$$
$$= (((4) \cdot 2 + 0) \cdot 2 + 5) \cdot 2 - 7$$
$$= ((8) \cdot 2 + 5) \cdot 2 - 7$$
$$= (21) \cdot 2 - 7 = 42 - 7 = 35 \checkmark$$

```python
import numpy as np

def horner_evaluate(coefficients, x):
    """
    Evaluate a polynomial at x using Horner's method.
    coefficients: list of coefficients in DESCENDING order [a_n, ..., a_1, a_0]
    
    Horner's method: start with the leading coefficient, then
    repeatedly multiply by x and add the next coefficient.
    This requires exactly n multiplications for a degree-n polynomial,
    compared to ~n^2/2 multiplications for the naive approach.
    """
    result = 0
    for coefficient in coefficients:
        # Each iteration: result = result * x + next_coefficient
        # This is Horner's nested multiplication -- one multiply and one add per step
        result = result * x + coefficient
    return result

# Verify against direct computation
coefficients = [3, -2, 0, 5, -7]   # 3x^4 - 2x^3 + 0x^2 + 5x - 7

test_values = [-2, -1, 0, 1, 2]
print(f"{'x':>5} | {'Horner':>10} | {'Direct':>10} | {'numpy':>10}")
print("-" * 45)

p = np.poly1d(coefficients)  # unchanged: np.poly1d from earlier in this lesson

for x in test_values:
    horner  = horner_evaluate(coefficients, x)
    direct  = 3*x**4 - 2*x**3 + 5*x - 7  # typed out explicitly for comparison
    via_np  = p(x)                          # np.poly1d objects are callable: p(x) evaluates at x
    print(f"{x:>5} | {horner:>10} | {direct:>10} | {via_np:>10.0f}")
```

**Walkthrough:** `p(x)` — calling a `np.poly1d` object with an argument —
evaluates the polynomial at that value. This is the first time we call
an object as if it were a function: `np.poly1d` overloads Python's
`__call__` mechanism, which means writing `p(2)` is equivalent to
`p.__call__(2)`. The formatted output uses `{value:>10}` — right-aligned
in a field 10 characters wide — and `{value:>10.0f}` — same width,
floating-point with 0 decimal places — to keep columns aligned.

---

### Polynomial Arithmetic

Polynomials can be added, subtracted, and multiplied. The result
is always another polynomial.

**Addition and subtraction:** combine like terms — terms with the
same power of $x$.

**Hand-worked example:** Let $p(x) = 2x^2 + 3x - 1$ and $q(x) = x^2 - x + 4$.

$$p(x) + q(x) = (2+1)x^2 + (3+(-1))x + (-1+4) = 3x^2 + 2x + 3$$

$$p(x) - q(x) = (2-1)x^2 + (3-(-1))x + (-1-4) = x^2 + 4x - 5$$

**Verify:** $\deg(p+q) = \max(\deg p, \deg q) = 2$. ✓
(Though sometimes degrees cancel — if $p = x^2 + 1$ and $q = -x^2 + 3$,
then $p + q = 4$, a degree-0 polynomial.)

**Multiplication:** use the distributive law — multiply every term
of $p$ by every term of $q$.

$$p(x) \cdot q(x) = (2x^2 + 3x - 1)(x^2 - x + 4)$$

$$= 2x^2(x^2-x+4) + 3x(x^2-x+4) - 1(x^2-x+4)$$

$$= (2x^4 - 2x^3 + 8x^2) + (3x^3 - 3x^2 + 12x) + (-x^2 + x - 4)$$

$$= 2x^4 + (-2+3)x^3 + (8-3-1)x^2 + (12+1)x - 4$$

$$= 2x^4 + x^3 + 4x^2 + 13x - 4$$

**Key fact:** $\deg(p \cdot q) = \deg(p) + \deg(q)$.
Degrees add under multiplication — the leading term of $p \cdot q$
is $a_n \cdot b_m \cdot x^{n+m}$, and since $a_n \neq 0$ and $b_m \neq 0$,
this term does not vanish.

```python
import numpy as np
import matplotlib.pyplot as plt

# np.poly1d supports arithmetic with + - * operators directly
p = np.poly1d([2, 3, -1])    # 2x^2 + 3x - 1
q = np.poly1d([1, -1, 4])    # x^2 - x + 4

sum_pq  = p + q    # polynomial addition
diff_pq = p - q    # polynomial subtraction
prod_pq = p * q    # polynomial multiplication

print(f"p(x) = {p}")
print(f"q(x) = {q}")
print(f"p+q  = {sum_pq}")
print(f"p-q  = {diff_pq}")
print(f"p*q  = {prod_pq}")
print()
print(f"deg(p)   = {p.order}")
print(f"deg(q)   = {q.order}")
print(f"deg(p*q) = {prod_pq.order}  (= deg(p) + deg(q) = {p.order + q.order})")

# Visualise all four polynomials on the same axes
x = np.linspace(-3, 3, 300)   # 300 points from -3 to 3 for smooth curves

fig, ax = plt.subplots(figsize=(10, 6))

# Plot each polynomial with a distinct colour and label
ax.plot(x, p(x),       color='#2980b9', lw=2.0, label='$p(x) = 2x^2+3x-1$')
ax.plot(x, q(x),       color='#27ae60', lw=2.0, label='$q(x) = x^2-x+4$')
ax.plot(x, sum_pq(x),  color='#8e44ad', lw=2.0, linestyle='--',
        label='$p(x)+q(x) = 3x^2+2x+3$')
ax.plot(x, prod_pq(x), color='#e74c3c', lw=2.0, linestyle=':',
        label='$p(x)\\cdot q(x)$ (degree 4)')

ax.axhline(0, color='#333', lw=0.8)
ax.axvline(0, color='#333', lw=0.8)
ax.set_ylim(-15, 30)    # fix the y-axis range so all curves are visible
ax.set_xlabel('$x$')
ax.set_ylabel('$y$')
ax.set_title('Polynomial arithmetic: $p$, $q$, $p+q$, and $p \\cdot q$', fontsize=12)
ax.legend(fontsize=10, loc='upper left')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.poly1d` objects support `+`, `-`, `*` operators
directly — these perform the correct polynomial arithmetic internally.
`p(x)` where `x` is a numpy array (from `np.linspace`) evaluates the
polynomial at every point simultaneously, returning an array of the
same length. `linestyle='--'` draws a dashed line; `linestyle=':'`
draws a dotted line — used here to visually distinguish four overlapping
curves without relying on colour alone (useful for printing or
colour-blindness). `loc='upper left'` positions the legend in the
upper-left corner of the axes.

---

### End Behaviour

For large $|x|$, a polynomial is dominated by its highest-degree term —
all lower-degree terms become negligible. This determines the **end
behaviour**: what happens to $p(x)$ as $x \to +\infty$ and $x \to -\infty$.

Four cases, determined entirely by the degree (even or odd) and the
sign of the leading coefficient ($a_n > 0$ or $a_n < 0$):

| Degree | Leading coeff | As $x \to +\infty$ | As $x \to -\infty$ |
|--------|--------------|--------------------|--------------------|
| Even | $a_n > 0$ | $p(x) \to +\infty$ | $p(x) \to +\infty$ |
| Even | $a_n < 0$ | $p(x) \to -\infty$ | $p(x) \to -\infty$ |
| Odd | $a_n > 0$ | $p(x) \to +\infty$ | $p(x) \to -\infty$ |
| Odd | $a_n < 0$ | $p(x) \to -\infty$ | $p(x) \to +\infty$ |

**Intuition:** $x^{\text{even}}$ is always positive (both $x$ and $-x$
give the same positive result when raised to an even power). So even-degree
polynomials with positive leading coefficient go up on both sides.
$x^{\text{odd}}$ flips sign with $x$, so odd-degree polynomials with
positive leading coefficient go down on the left and up on the right.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-4, 4, 400)   # wide range to show end behaviour

fig, axes = plt.subplots(2, 2, figsize=(12, 9))
# plt.subplots(2, 2): 2 rows, 2 columns = 4 subplots

cases = [
    (x**4 - 5*x**2 + 2,    'Even degree, $a_n > 0$\n$p(x)=x^4-5x^2+2$',
     '+∞ both ends', '#2980b9'),
    (-x**4 + 5*x**2 - 2,   'Even degree, $a_n < 0$\n$p(x)=-x^4+5x^2-2$',
     '-∞ both ends', '#8e44ad'),
    (x**3 - 3*x,            'Odd degree, $a_n > 0$\n$p(x)=x^3-3x$',
     '-∞ left, +∞ right', '#27ae60'),
    (-x**3 + 3*x,           'Odd degree, $a_n < 0$\n$p(x)=-x^3+3x$',
     '+∞ left, -∞ right', '#e74c3c'),
]

for ax, (y_vals, title, behaviour, color) in zip(axes.flat, cases):
    # axes.flat: iterator over all 4 axes left-to-right, top-to-bottom
    # zip pairs each ax with its corresponding case
    ax.plot(x, y_vals, color=color, lw=2.5)
    ax.axhline(0, color='#333', lw=0.8)
    ax.axvline(0, color='#333', lw=0.8)
    ax.set_title(title, fontsize=10)
    ax.set_xlabel('$x$')
    ax.grid(True, alpha=0.3)
    ax.set_ylim(-20, 20)
    # Annotate end behaviour in the corner
    ax.text(0.97, 0.05, behaviour, transform=ax.transAxes,
            # transform=ax.transAxes: coordinates in (0,1) range relative to axes,
            # not in data units -- (0,0) is bottom-left, (1,1) is top-right
            ha='right', va='bottom', fontsize=9, color=color, fontweight='bold')

plt.suptitle('End behaviour: determined by degree (even/odd) and sign of leading coefficient',
             fontsize=12, y=1.01)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `transform=ax.transAxes` is new here. Normally `ax.text(x, y, ...)`
places text at data coordinates — values on your axes. With
`transform=ax.transAxes`, the coordinates `(0.97, 0.05)` are interpreted
as fractions of the axes size: $x=0.97$ means 97% of the way across the
axes from left to right, $y=0.05$ means 5% of the way up from the bottom.
This is useful whenever you want to place text in a fixed corner of the
plot regardless of what the data range is.

---

## Connect the Pieces

**What this lesson built on:** Functions (Lesson 0.6) — a polynomial is
a function $p : \mathbb{R} \to \mathbb{R}$. The sigma notation
$\sum_{k=0}^n a_k x^k$ uses the summation introduced in Lesson 0.10.
Injectivity and surjectivity (Lesson 0.7) are already relevant:
odd-degree polynomials are surjective onto $\mathbb{R}$ (they go from
$-\infty$ to $+\infty$, hitting every value) — even-degree polynomials
with real coefficients are not.

**What this lesson makes possible:** Lesson 1.2 (Factoring and the
Factor Theorem) asks when a polynomial can be written as a product of
simpler polynomials — and introduces roots. Lesson 1.4 (The Fundamental
Theorem of Algebra) states that every degree-$n$ polynomial has exactly
$n$ roots in $\mathbb{C}$ — a fact that requires the complex numbers
of Lesson 1.12 to state precisely.

**In CAD and CAM:** the spline curves used in SolidWorks, Mastercam,
and every other geometric modelling system are **piecewise polynomial
curves** — sequences of cubic or quartic polynomial segments joined at
**knots**. Evaluating a spline at a parameter value is polynomial
evaluation, and the software does it millions of times per toolpath
calculation. Horner's method from this lesson is the standard algorithm
used in production CAM software for exactly this reason — $O(n)$
multiplications instead of $O(n^2)$.

---

## Summary

**Polynomial:** $p(x) = \sum_{k=0}^{n} a_k x^k = a_n x^n + \cdots + a_1 x + a_0$,
where $a_n \neq 0$.

**Degree:** $\deg(p) = n$, the highest power with nonzero coefficient.

**Degree rules:**
$$\deg(p + q) \leq \max(\deg p, \deg q) \qquad \deg(p \cdot q) = \deg p + \deg q$$

**End behaviour:**
- Even degree, $a_n > 0$: both ends $\to +\infty$
- Even degree, $a_n < 0$: both ends $\to -\infty$
- Odd degree, $a_n > 0$: left $\to -\infty$, right $\to +\infty$
- Odd degree, $a_n < 0$: left $\to +\infty$, right $\to -\infty$

**Horner's method:** evaluate $p$ at $x$ in $O(n)$ multiplications
by nesting: $p(x) = (\cdots((a_n \cdot x + a_{n-1}) \cdot x + a_{n-2})\cdots) \cdot x + a_0$.

**New Python/numpy:**
- `np.poly1d([a_n, ..., a_0])` — create a polynomial (descending coefficients)
- `p.order` — degree of `p`
- `p.coeffs` — coefficient array (descending)
- `p(x)` — evaluate `p` at `x` (scalar or array)
- `p + q`, `p - q`, `p * q` — polynomial arithmetic
- `transform=ax.transAxes` — place text at axis-fraction coordinates

---

## Problems

### Math

**1.** For each expression, determine whether it is a polynomial.
If yes, state its degree, leading coefficient, and constant term.
If no, explain why not.

(a) $3x^5 - \sqrt{2}x^3 + \pi x - 1$

(b) $\dfrac{x^2 + 1}{x - 1}$

(c) $x^{1/2} + x + 1$

(d) $0$

(e) $(x^2 - 1)(x^2 + 1)$

<details>
<summary>Answers</summary>

(a) Polynomial, degree 5, leading coefficient 3, constant term $-1$.
    ($\sqrt{2}$ and $\pi$ are valid real-number coefficients.)

(b) Not a polynomial — division by an expression containing $x$ is not
    allowed. (Rational function — covered in Lesson 1.5.)

(c) Not a polynomial — $x^{1/2} = \sqrt{x}$ requires a fractional exponent.
    Polynomial exponents must be non-negative integers.

(d) The zero polynomial — no degree by convention (or degree $-\infty$).

(e) Polynomial: $(x^2-1)(x^2+1) = x^4 - 1$. Degree 4, leading coefficient 1,
    constant term $-1$.

</details>

---

**2.** Let $p(x) = x^3 - 2x^2 + x - 1$.

(a) Evaluate $p(0)$, $p(1)$, $p(-1)$, and $p(2)$ by hand using direct
substitution. Show every step.

(b) Re-evaluate $p(2)$ using Horner's method. Show the intermediate values.

(c) What is $\deg(p^2)$? What is the leading coefficient of $p^2$?
You do not need to expand $p^2$ fully.

<details>
<summary>Answers</summary>

(a) $p(0) = -1$. $p(1) = 1-2+1-1 = -1$. $p(-1) = -1-2-1-1 = -5$.
    $p(2) = 8-8+2-1 = 1$.

(b) Coefficients: $[1, -2, 1, -1]$, $x=2$:
    $((1)\cdot 2 + (-2))\cdot 2 + 1)\cdot 2 + (-1) = (0\cdot 2+1)\cdot 2-1 = 2-1=1$. ✓

(c) $\deg(p^2) = 2\cdot \deg(p) = 6$. Leading coefficient of $p^2 = 1^2 = 1$.

</details>

---

**3.** (Proof) Prove that for any two polynomials $p$ and $q$ with
$\deg(p) \neq \deg(q)$, $\deg(p+q) = \max(\deg p, \deg q)$.

*(Note: the inequality $\deg(p+q) \leq \max(\deg p, \deg q)$ always holds,
but equality can fail when $\deg(p) = \deg(q)$ and the leading terms
cancel. Your proof should explain why cancellation cannot happen when
the degrees differ.)*

<details>
<summary>Answer</summary>

*Proof.* Say $\deg p = n$ and $\deg q = m$ with $n > m$ (WLOG).
Then the coefficient of $x^n$ in $p+q$ is $a_n + 0 = a_n \neq 0$,
since $q$ has no $x^n$ term (its degree is $m < n$). Therefore
$\deg(p+q) = n = \max(n,m)$. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Implement Horner's method**

```python
def horner(coefficients, x):
    """
    Evaluate the polynomial with the given coefficients at x,
    using Horner's method.
    
    coefficients: list of coefficients in DESCENDING order [a_n, ..., a_1, a_0]
    x:            the value to evaluate at (float or int)
    
    Returns the polynomial value p(x).
    """
    pass  # your code here


# --- tests: do not modify ---
# p(x) = 3x^4 - 2x^3 + 5x - 7
coeffs = [3, -2, 0, 5, -7]

assert horner(coeffs, 0)  == -7,  "p(0) = -7"
assert horner(coeffs, 1)  == -1,  "p(1) = 3-2+5-7 = -1"
assert horner(coeffs, -1) == -7,  "p(-1) = 3+2-5-7 = -7"
assert horner(coeffs, 2)  == 35,  "p(2) = 48-16+10-7 = 35"
assert horner([1], 42)    == 1,   "constant polynomial p(x)=1"
assert horner([0, 0], 5)  == 0,   "zero polynomial"

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Start with `result = 0`. For each coefficient in the list (in order,
from first to last): `result = result * x + coefficient`. Return
`result` after the loop. That's the entire algorithm.

</details>

---

**Challenge 2 — Polynomial class**

Implement a minimal `Polynomial` class that stores coefficients and
supports evaluation, addition, and degree.

```python
class Polynomial:
    """
    A polynomial stored as a list of coefficients in DESCENDING order.
    Example: Polynomial([2, 3, -1]) represents 2x^2 + 3x - 1.
    """
    
    def __init__(self, coefficients):
        """Store coefficients and strip any leading zeros."""
        pass  # your code here
    
    def degree(self):
        """Return the degree of this polynomial."""
        pass  # your code here
    
    def evaluate(self, x):
        """Evaluate the polynomial at x using Horner's method."""
        pass  # your code here
    
    def __add__(self, other):
        """Return the sum of this polynomial and other."""
        pass  # your code here
    
    def __repr__(self):
        """Return a readable string representation."""
        return f"Polynomial({self.coefficients})"


# --- tests: do not modify ---
p = Polynomial([2, 3, -1])    # 2x^2 + 3x - 1
q = Polynomial([1, -1, 4])    # x^2 - x + 4

assert p.degree()    == 2
assert q.degree()    == 2
assert p.evaluate(0) == -1
assert p.evaluate(1) == 4     # 2 + 3 - 1
assert p.evaluate(2) == 13    # 8 + 6 - 1

sum_pq = p + q
assert sum_pq.degree()    == 2
assert sum_pq.evaluate(0) == 3    # -1 + 4
assert sum_pq.evaluate(1) == 7    # 4 + 3

# Stripping leading zeros: degree of 0x^3 + 2x + 1 should be 1
r = Polynomial([0, 0, 2, 1])
assert r.degree() == 1
assert r.evaluate(3) == 7    # 2*3 + 1

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint for __add__</summary>

The two polynomials may have different degrees. Pad the shorter one's
coefficient list with leading zeros so both have the same length, then
add element-by-element. `zip` won't work directly if the lists have
different lengths — you need to align them on the right (the constant
term side).

</details>

---

**Challenge 3 — Plot and annotate**

Plot $p(x) = x^4 - 4x^2 + 2$ on $[-2.5, 2.5]$. On the same axes:
- Mark every root (zero) with a red dot and label it with its
  approximate value
- Mark the $y$-intercept with a green dot
- Add arrows showing end behaviour

```python
import matplotlib.pyplot as plt
import numpy as np

# Your code here.
# Roots: use np.roots([1, 0, -4, 0, 2]) to find them.
# np.roots(coefficients): finds all roots of the polynomial --
# may return complex roots, so filter to real ones with
# abs(root.imag) < 1e-8.
# np.isclose(a, b): returns True if a and b are approximately equal
# (accounts for floating-point rounding errors).
```

<details>
<summary>Expected output</summary>

Four real roots near $x \approx \pm 0.765$ and $x \approx \pm 1.848$.
$y$-intercept at $(0, 2)$.
The curve opens upward on both ends (even degree, positive leading coefficient).

</details>

---

### Extension

**4. ★** Prove by induction that Horner's method is correct — that is,
for any polynomial $p(x) = \sum_{k=0}^n a_k x^k$ and any $x \in \mathbb{R}$,
Horner's algorithm returns $p(x)$.

*(Let $H_k$ denote the result of Horner's algorithm after processing
the first $k+1$ coefficients. Show $H_k = \sum_{j=0}^k a_{n-j} x^{k-j}$
by induction on $k$.)*

<details>
<summary>Hint</summary>

Base case $k=0$: after processing just the first coefficient $a_n$,
$H_0 = a_n$. The formula gives $a_n x^0 = a_n$. ✓

Inductive step: assume $H_k = \sum_{j=0}^k a_{n-j} x^{k-j}$.
Horner's next step multiplies by $x$ and adds $a_{n-k-1}$:
$H_{k+1} = H_k \cdot x + a_{n-k-1}$.
Substitute and simplify to show $H_{k+1} = \sum_{j=0}^{k+1} a_{n-j} x^{k+1-j}$.

</details>

**5. ★** A polynomial $p$ is **even** if $p(-x) = p(x)$ for all $x$,
and **odd** if $p(-x) = -p(x)$ for all $x$.

(a) Show that $p(x) = x^4 - 4x^2 + 2$ is even.

(b) Show that $q(x) = x^3 - x$ is odd.

(c) Prove: a polynomial is even if and only if all of its odd-power
coefficients are zero. Similarly, it is odd if and only if all
even-power coefficients are zero.

(d) Implement an `is_even_polynomial` and `is_odd_polynomial` checker:

```python
def is_even_polynomial(coefficients):
    """True if p(-x) = p(x) for this polynomial (all odd-power coeffs zero)."""
    pass

def is_odd_polynomial(coefficients):
    """True if p(-x) = -p(x) for this polynomial (all even-power coeffs zero)."""
    pass


# --- tests: do not modify ---
assert is_even_polynomial([1, 0, -4, 0, 2])  == True   # x^4 - 4x^2 + 2
assert is_even_polynomial([1, 1, 0])          == False  # x^2 + x
assert is_odd_polynomial([-1, 0, 1, 0])       == True   # -x^3 + x
assert is_odd_polynomial([1, 0])              == False  # x (not odd: even coeff nonzero)

print("✓ Extension 5 passed!")
```
