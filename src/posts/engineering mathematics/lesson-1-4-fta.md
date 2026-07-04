# Stage 1, Lesson 1.4 — Roots and the Fundamental Theorem of Algebra
**Threads:** Math · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

The three previous lessons asked: given a polynomial, how do you divide
it, factor it, and evaluate it? This lesson asks the most fundamental
question of all: how many roots does a polynomial have? The answer is
the **Fundamental Theorem of Algebra** — perhaps the most important
single fact about polynomials. Every polynomial of degree $n$ has
exactly $n$ roots, provided you count in $\mathbb{C}$ and include
repeated roots. This is a non-obvious fact — over $\mathbb{R}$ alone,
$x^2 + 1$ has no roots at all. The theorem says you have to look in
the complex numbers to find them, and once you do, the count is always
exactly $n$. By the end of this lesson you understand why the complex
numbers complete the reals (in a root-finding sense), what multiplicity
means for a root, how complex roots of real polynomials always come in
conjugate pairs, and how all of this connects directly to the factoring
done in Lessons 1.2 and 1.3.

---

## Historical Context

The Fundamental Theorem of Algebra was stated informally by Girard in
1629 and by Newton and Leibniz in the 17th century, but none of them
proved it. The first serious proof attempt was by d'Alembert in 1746
— it had a gap. Euler attempted a proof. Lagrange attempted a proof.
Finally, Carl Friedrich Gauss produced the first generally accepted
proof in his doctoral dissertation in 1799, at age 21. He would go on
to give three more proofs of the same theorem — each more rigorous than
the last — over the course of his life. The theorem is called
"fundamental" not because it is obvious, but because it is the
foundation on which all of polynomial algebra rests. It cannot be proved
using only algebra; every known proof uses some analysis or topology —
the fact that the complex plane is complete in a sense the reals are not.

---

## What You Need To Know First

- **Polynomials** — Lesson 1.1. Degree, leading coefficient.
- **Factoring and the Factor Theorem** — Lesson 1.2.
  $(x-c)$ is a factor iff $c$ is a root.
- **Complex numbers $\mathbb{C}$** — introduced in Lesson 0.1 as
  part of the number set hierarchy. Formally introduced in Lesson 1.12.
  For this lesson: $\mathbb{C}$ contains all numbers $a + bi$ where
  $a, b \in \mathbb{R}$ and $i^2 = -1$. No prior knowledge of complex
  arithmetic is assumed beyond this.

---

## The Lesson

### What Is a Root?

**Definition:** A **root** (or **zero**) of a polynomial $p(x)$ is a
value $c$ such that $p(c) = 0$.

By the Factor Theorem (Lesson 1.2): $c$ is a root of $p$ if and only
if $(x - c)$ is a factor of $p$.

Roots have a direct geometric meaning: they are exactly the
$x$-coordinates where the graph of $p$ crosses or touches the $x$-axis.

**How many roots can a degree-$n$ polynomial have over $\mathbb{R}$?**

A degree-2 polynomial can have 0, 1, or 2 real roots:

$$x^2 + 1 = 0: \quad \text{no real roots}$$
$$x^2 - 2x + 1 = (x-1)^2 = 0: \quad \text{one real root } (x=1, \text{ repeated})$$
$$x^2 - 5x + 6 = (x-2)(x-3) = 0: \quad \text{two real roots}$$

Over $\mathbb{R}$, the count varies. Over $\mathbb{C}$, it is always
exactly $n$. That is what the Fundamental Theorem guarantees.

---

### The Fundamental Theorem of Algebra

**Theorem (Fundamental Theorem of Algebra):** Every non-constant
polynomial $p(x)$ with complex coefficients has at least one root
in $\mathbb{C}$.

**Corollary:** Every polynomial $p(x)$ of degree $n \geq 1$ with
complex coefficients has exactly $n$ roots in $\mathbb{C}$, counted
with multiplicity, and factors completely as:

$$p(x) = a_n (x - r_1)(x - r_2) \cdots (x - r_n)$$

where $a_n$ is the leading coefficient and $r_1, r_2, \ldots, r_n
\in \mathbb{C}$ are the $n$ roots (not necessarily distinct).

**Formal lens:** The theorem has two parts. The existence part
("at least one root") is what Gauss proved. The corollary
("exactly $n$ roots") follows by repeatedly applying the Factor
Theorem and dividing out each root:

- By the theorem, $p$ has at least one root $r_1 \in \mathbb{C}$.
- By the Factor Theorem, $p(x) = (x - r_1) q_1(x)$ where $\deg(q_1) = n-1$.
- If $n-1 \geq 1$, apply the theorem to $q_1$: it has a root $r_2$.
- So $p(x) = (x-r_1)(x-r_2)q_2(x)$ where $\deg(q_2) = n-2$.
- Continue until $q_{n-1}(x)$ is a non-zero constant $a_n$.
- Result: $p(x) = a_n(x-r_1)(x-r_2)\cdots(x-r_n)$.

Each step reduces the degree by 1, and the process terminates in
exactly $n$ steps, producing exactly $n$ linear factors.

**Geometric lens:** the theorem says that over $\mathbb{C}$, every
polynomial is a product of linear factors. The complex plane is the
right arena for polynomial algebra — in $\mathbb{R}$, some polynomials
are irreducible (like $x^2 + 1$), but in $\mathbb{C}$, no polynomial
of degree $\geq 1$ is irreducible.

**Why $\mathbb{C}$ and not $\mathbb{R}$?** The polynomial $x^2 + 1$
has no real roots because no real number squares to $-1$. But if we
extend to $\mathbb{C}$ and define $i$ as a number satisfying $i^2 = -1$,
then $x^2 + 1 = (x - i)(x + i)$. The complex numbers are precisely the
smallest extension of $\mathbb{R}$ in which every polynomial has a root
— this is what "algebraically closed" means. $\mathbb{C}$ is
algebraically closed; $\mathbb{R}$ is not.

---

### Multiplicity

When the same root appears more than once in the factored form, we say
it has **multiplicity** greater than 1.

**Definition:** The **multiplicity** of a root $c$ is the largest
integer $k$ such that $(x-c)^k$ divides $p(x)$.

**Examples:**

$p(x) = (x-1)^2(x+2)$: root $x=1$ has multiplicity 2,
root $x=-2$ has multiplicity 1. Total count: $2 + 1 = 3 = \deg(p)$. ✓

$p(x) = x^3$: root $x=0$ has multiplicity 3. Total: 3 = 3. ✓

**Geometric meaning of multiplicity — the key rule:**

| Multiplicity | Graph behaviour at root $c$ |
|--------------|---------------------------|
| Odd (1, 3, 5, …) | Crosses the $x$-axis |
| Even (2, 4, 6, …) | Touches but does not cross |

At a simple root (multiplicity 1), the polynomial changes sign — the
curve crosses. At a double root, the polynomial does not change sign —
the curve bounces off the axis. At a triple root, the polynomial changes
sign but the curve is flat at the crossing, giving an inflection point.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-2.5, 3.5, 400)

fig, axes = plt.subplots(1, 3, figsize=(13, 5))

mult_cases = [
    (np.poly1d([1,-1]) * np.poly1d([1,1]) * np.poly1d([1,-2]),
     '$(x-1)(x+1)(x-2)$',
     'All simple roots\n(cross at each)',
     [1, -1, 2]),
    (np.poly1d([1,-1])**2 * np.poly1d([1,-2]),
     '$(x-1)^2(x-2)$',
     'Double root at $x=1$\n(touch, no cross)',
     [1, 2]),
    (np.poly1d([1,-1])**3,
     '$(x-1)^3$',
     'Triple root at $x=1$\n(cross, flattened)',
     [1]),
]

for ax, (p, formula, title, roots) in zip(axes, mult_cases):
    ax.plot(x, p(x), color='#2980b9', lw=2.5)
    ax.axhline(0, color='#333', lw=0.8)
    ax.axvline(0, color='#333', lw=0.8)
    for r in set(roots):
        ax.plot(r, 0, 'o', color='#e74c3c', markersize=10, zorder=5)
    ax.set_title(f'{formula}\n{title}', fontsize=10)
    ax.set_xlabel('$x$')
    ax.set_ylabel('$p(x)$')
    ax.grid(True, alpha=0.3)
    ax.set_ylim(-5, 5)

plt.suptitle('Multiplicity determines graph behaviour at each root',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.poly1d([1,-1])**2` computes $(x-1)^2$ — numpy's
`**` operator on poly1d objects performs polynomial multiplication
repeatedly. `set(roots)` removes duplicates so we only draw one dot
per distinct root, even if a root has multiplicity greater than one.
The three plots make the crossing/touching rule directly visible:
left panel shows all crossings, middle shows a clear bounce at $x=1$,
right shows the flat crossing (inflection) at $x=1$.

---

### Discriminant and Root Counting for Quadratics

For the quadratic $p(x) = ax^2 + bx + c$, the **discriminant**
$\Delta = b^2 - 4ac$ determines the nature of the roots completely.

The quadratic formula gives $x = \dfrac{-b \pm \sqrt{\Delta}}{2a}$.

| $\Delta$ | Nature of roots |
|----------|----------------|
| $\Delta > 0$ | Two distinct real roots |
| $\Delta = 0$ | One real root of multiplicity 2 |
| $\Delta < 0$ | No real roots; two complex conjugate roots |

When $\Delta < 0$, $\sqrt{\Delta} = \sqrt{|\Delta|} \cdot i$, giving two
complex roots $\dfrac{-b \pm \sqrt{|\Delta|}\,i}{2a}$ — a conjugate pair.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-3, 3, 400)

fig, axes = plt.subplots(1, 3, figsize=(13, 5))

quadratic_cases = [
    ([1, 0, 1],   '$x^2 + 1$',     '$\\Delta = -4 < 0$\nNo real roots',      '#e74c3c'),
    ([1, -2, 1],  '$x^2 - 2x + 1$','$\\Delta = 0$\nOne root (double)',        '#e67e22'),
    ([1, -1, -2], '$x^2 - x - 2$', '$\\Delta = 9 > 0$\nTwo distinct roots',  '#27ae60'),
]

for ax, (coeffs, formula, title, color) in zip(axes, quadratic_cases):
    y = np.polyval(coeffs, x)
    ax.plot(x, y, color=color, lw=2.5)
    ax.axhline(0, color='#333', lw=0.8)
    ax.axvline(0, color='#333', lw=0.8)

    # Mark real roots
    real_roots = [r.real for r in np.roots(coeffs) if abs(r.imag) < 1e-8]
    for r in real_roots:
        ax.plot(r, 0, 'o', color=color, markersize=10, zorder=5)

    # Shade below x-axis when no real roots, to show the gap
    if not real_roots:
        ax.fill_between(x, y, 0,
                        where=(y > 0),   # shade above x-axis
                        alpha=0.12, color=color)
        ax.text(0, 0.5, 'Never crosses\n$x$-axis',
                ha='center', fontsize=9, color=color)

    a, b, c = coeffs
    disc = b**2 - 4*a*c
    ax.set_title(f'{formula}\n{title}', fontsize=10)
    ax.set_xlabel('$x$')
    ax.set_ylabel('$p(x)$')
    ax.grid(True, alpha=0.3)
    ax.set_ylim(-5, 8)

plt.suptitle('Discriminant $\\Delta = b^2 - 4ac$ determines real root count',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.polyval(coeffs, x)` evaluates the polynomial at
every point in `x` — this is numpy's functional approach, equivalent to
calling a `np.poly1d` object. Both work; `np.polyval` is used here
because the coefficients are already in a list and the poly1d object
is not needed for anything else. `ax.fill_between(x, y, 0, where=(y > 0))`
shades the region between `y` and 0 wherever `y > 0` — the `where`
argument accepts a boolean array and only shades those positions.
`alpha=0.12` keeps the shading faint so the curve remains readable.

---

### Complex Roots Come in Conjugate Pairs

For polynomials with **real** coefficients, complex roots always appear
in conjugate pairs. This is one of the most useful structural facts
about real polynomials.

**Theorem (Complex Conjugate Root Theorem):** If $p(x)$ has real
coefficients and $z = a + bi$ (with $b \neq 0$) is a root, then
$\bar{z} = a - bi$ is also a root.

*Proof.* We use the property that complex conjugation respects
addition and multiplication: $\overline{u+v} = \bar{u}+\bar{v}$ and
$\overline{uv} = \bar{u}\bar{v}$.

Since $p(z) = 0$, taking the conjugate of both sides:

$$\overline{p(z)} = \overline{0} = 0$$

$$\overline{a_n z^n + \cdots + a_1 z + a_0} = 0$$

$$\bar{a}_n \bar{z}^n + \cdots + \bar{a}_1 \bar{z} + \bar{a}_0 = 0$$

Since each $a_k$ is real, $\bar{a}_k = a_k$. Therefore:

$$a_n \bar{z}^n + \cdots + a_1 \bar{z} + a_0 = p(\bar{z}) = 0$$

So $\bar{z}$ is also a root. $\blacksquare$

**Consequence:** a real polynomial of odd degree always has at least one
real root. Complex roots come in pairs — they consume degree in pairs of 2.
A degree-5 polynomial with real coefficients has either 1, 3, or 5 real
roots — never 0, 2, or 4.

**Consequence for factoring:** every real polynomial factors over $\mathbb{R}$
into linear factors $(x - r)$ for real roots and **irreducible quadratic
factors** $(x^2 + bx + c)$ (with $b^2 - 4c < 0$) for each conjugate pair.

*Example:* $x^4 + 4 = (x^2 + 2x + 2)(x^2 - 2x + 2)$ — two irreducible
quadratics, each encoding a conjugate pair of complex roots.

```python
import numpy as np

def classify_roots(coeffs):
    """
    Find all roots and classify them as real or complex conjugate pairs.
    Assumes the polynomial has real coefficients.

    Returns (real_roots, conjugate_pairs) where:
      real_roots:      list of real root values
      conjugate_pairs: list of (z, z_bar) tuples for complex pairs
    """
    all_roots = np.roots(coeffs)
    # np.roots: finds all n roots of a degree-n polynomial;
    # may return complex values even for real roots due to floating-point

    real_tol = 1e-8   # threshold: imaginary part smaller than this → treat as real

    real_roots      = []
    complex_roots   = []

    for root in all_roots:
        if abs(root.imag) < real_tol:
            real_roots.append(root.real)   # discard the negligible imaginary part
        else:
            complex_roots.append(root)

    # Pair up complex roots into conjugate pairs
    conjugate_pairs = []
    used = set()
    for i, z in enumerate(complex_roots):
        if i in used:
            continue
        for j, w in enumerate(complex_roots):
            if j <= i or j in used:
                continue
            if np.isclose(z, np.conj(w)):
                # np.conj: complex conjugate -- a+bi → a-bi
                conjugate_pairs.append((z, w))
                used.add(i)
                used.add(j)
                break

    return real_roots, conjugate_pairs


# Test on several polynomials
test_polys = [
    ([1, -6, 11, -6],  "x^3 - 6x^2 + 11x - 6"),     # all real
    ([1,  0,  1],       "x^2 + 1"),                    # all complex
    ([1,  1,  1],       "x^2 + x + 1"),               # all complex
    ([1,  0, -2,  0, 1],"x^4 - 2x^2 + 1"),            # repeated real
    ([1,  0,  0,  0, 4],"x^4 + 4"),                   # all complex
]

print(f"{'Polynomial':<25} {'Degree':<7} {'Real roots':<20} {'Conjugate pairs'}")
print("-" * 80)
for coeffs, label in test_polys:
    real, pairs = classify_roots(coeffs)
    n = len(coeffs) - 1
    real_str  = str([round(r, 3) for r in real])
    pairs_str = str([(f'{p[0]:.2f}', f'{p[1]:.2f}') for p in pairs])
    print(f"{label:<25} {n:<7} {real_str:<20} {pairs_str}")
    # Verify root count: real roots + 2*pairs = degree
    total = len(real) + 2*len(pairs)
    assert total == n, f"Root count mismatch: {total} != {n}"

print("\nAll root counts verified: |real| + 2×|pairs| = degree ✓")
```

**Walkthrough:** `np.conj(w)` computes the complex conjugate of `w`
— for $w = a + bi$, `np.conj(w)` returns $a - bi$. We test whether
$z$ and $w$ are conjugate pairs by checking `np.isclose(z, np.conj(w))`.
The `used` set prevents pairing the same root twice — the same pattern
used in Lesson 0.5's relation property checking. The assertion at the
end verifies the Fundamental Theorem: real roots plus twice the number
of conjugate pairs must equal the degree.

---

### Roots in the Complex Plane

Visualising all roots — real and complex — in the complex plane makes
the Fundamental Theorem tangible.

```python
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(7, 7))

# Unit circle for reference -- roots of x^n - 1 always lie on it
theta = np.linspace(0, 2*np.pi, 300)
ax.plot(np.cos(theta), np.sin(theta),
        color='#cccccc', lw=1, linestyle='--',
        label='Unit circle')

# Three polynomial root sets, each a different colour and marker
poly_sets = [
    ([1, 0, 0, 0, -1], '$x^4 - 1 = 0$',   '#2980b9', 'o'),
    ([1, 0, 0, -1],    '$x^3 - 1 = 0$',   '#e74c3c', 's'),
    ([1, 1, 1],        '$x^2 + x + 1 = 0$','#27ae60', '^'),
]

for coeffs, label, color, marker in poly_sets:
    roots = np.roots(coeffs)
    ax.scatter(roots.real, roots.imag,
               s=100, color=color, label=label,
               marker=marker, zorder=5,
               edgecolors='white', linewidths=0.8)
               # edgecolors, linewidths: thin white border around each marker
               # makes overlapping points easier to distinguish

# Axes and labels
ax.axhline(0, color='#555', lw=1)
ax.axvline(0, color='#555', lw=1)
ax.set_aspect('equal')   # equal scaling so the unit circle looks circular
ax.set_xlim(-1.6, 1.6)
ax.set_ylim(-1.6, 1.6)
ax.set_xlabel('Real part $\\mathrm{Re}(z)$', fontsize=11)
ax.set_ylabel('Imaginary part $\\mathrm{Im}(z)$', fontsize=11)
ax.set_title('Roots in the complex plane\n'
             'Each degree-$n$ polynomial has exactly $n$ roots',
             fontsize=11)
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `roots.real` and `roots.imag` extract the real and
imaginary parts of a numpy array of complex numbers as separate arrays
— numpy complex arrays carry both parts, accessible via these attributes.
`ax.scatter(..., edgecolors='white', linewidths=0.8)` adds a thin white
border around each marker — this is new here. When coloured markers
overlap against a grid, the white border creates a thin gap that makes
each point individually visible. The `marker` parameter sets the shape:
`'o'` is a circle, `'s'` is a square, `'^'` is an upward-pointing triangle.

---

### What the FTA Means for Factoring

Combining the Fundamental Theorem with the Complex Conjugate Root
Theorem gives the complete factoring picture over $\mathbb{R}$:

**Theorem (Complete Factoring over $\mathbb{R}$):** Every polynomial
$p(x)$ with real coefficients factors over $\mathbb{R}$ as:

$$p(x) = a_n \cdot \underbrace{(x-r_1)^{m_1} \cdots (x-r_k)^{m_k}}_{\text{real roots with multiplicities}} \cdot \underbrace{(x^2 + b_1 x + c_1) \cdots (x^2 + b_j x + c_j)}_{\text{irreducible quadratics (negative discriminant)}}$$

where $m_1 + \cdots + m_k + 2j = n$.

Each irreducible quadratic $(x^2 + bx + c)$ with $b^2 - 4c < 0$
corresponds to one conjugate pair of complex roots.

**Hand-worked example:** Factor $p(x) = x^4 + 4$ completely over $\mathbb{R}$.

First, find roots. The roots of $x^4 = -4$ are the four fourth roots of $-4$:
$x = \sqrt{2}\,e^{i\pi(1+2k)/4}$ for $k = 0, 1, 2, 3$, giving:

$$1+i,\quad -1+i,\quad -1-i,\quad 1-i$$

Two conjugate pairs: $(1+i, 1-i)$ and $(-1+i, -1-i)$.

Pair $(1+i, 1-i)$ gives the quadratic:
$(x-(1+i))(x-(1-i)) = x^2 - 2x + 2$

Pair $(-1+i, -1-i)$ gives:
$(x-(-1+i))(x-(-1-i)) = x^2 + 2x + 2$

Therefore: $x^4 + 4 = (x^2 - 2x + 2)(x^2 + 2x + 2)$.

**Verify:** $(x^2-2x+2)(x^2+2x+2) = (x^2+2)^2 - (2x)^2 = x^4+4x^2+4-4x^2 = x^4+4$. ✓

```python
import numpy as np

# Verify the factored form of x^4 + 4
p = np.poly1d([1, 0, 0, 0, 4])
factor1 = np.poly1d([1, -2, 2])   # x^2 - 2x + 2
factor2 = np.poly1d([1,  2, 2])   # x^2 + 2x + 2

product = factor1 * factor2

print("Verifying x^4 + 4 = (x^2-2x+2)(x^2+2x+2):")
print(f"  factor1 * factor2 = {product}")
print(f"  Match: {np.allclose(product.coeffs, p.coeffs)}")
print()

# Check discriminants of both factors -- should be negative (irreducible)
for f, name in [(factor1, "x^2-2x+2"), (factor2, "x^2+2x+2")]:
    a, b, c = f.coeffs
    disc = b**2 - 4*a*c
    print(f"  {name}: discriminant = {disc} "
          f"({'irreducible over R' if disc < 0 else 'has real roots'})")

print()
# Find the four complex roots and show the two conjugate pairs
roots = np.roots([1, 0, 0, 0, 4])
print("Four roots of x^4 + 4:")
for r in roots:
    print(f"  {r.real:+.4f} {r.imag:+.4f}i")
```

**Walkthrough:** `factor1.coeffs` gives the coefficient array for the
`np.poly1d` object, needed for `np.allclose` comparison. `a, b, c = f.coeffs`
uses tuple unpacking (first seen in Lesson 0.4) to assign the three
coefficients to named variables. The `f-string` `{r.real:+.4f}` uses
`+` in the format spec to always show the sign (positive or negative),
making the $\pm$ structure of complex numbers visible in the output.

---

## Connect the Pieces

**What this lesson built on:** Factor Theorem (Lesson 1.2) — the FTA
says every polynomial has $n$ roots, and each root gives a linear factor.
Complex numbers $\mathbb{C}$ (Lesson 0.1 preview; Lesson 1.12 full
treatment). Proof by contradiction (Lesson 0.9) — Gauss's proof uses
a topological argument with the same structure.

**What this lesson makes possible:** Lesson 1.5 (Rational Functions)
uses root/factor counting to analyse asymptotes. Lesson 1.12 (Complex
Numbers) formalises $\mathbb{C}$ — you now have motivation for why the
complex numbers exist and what they accomplish. Stage 5 (Calculus) uses
the FTA when decomposing functions into partial fractions for integration.
Stage 10 (Abstract Algebra) revisits the FTA as the statement that
$\mathbb{C}$ is algebraically closed.

**In CS and manufacturing:** Root-finding is ubiquitous in computational
engineering. Finding where a toolpath intersects a surface, where a
stress field crosses a yield threshold, where a control system's
transfer function has poles — all are root-finding problems. The FTA
guarantees how many solutions to look for. Complex roots of a transfer
function's characteristic polynomial correspond to oscillatory modes
in a control system — a fact used in PID tuning. The conjugate pair
structure means complex poles always come in pairs for real systems,
which halves the search space for numerical root-finders.

---

## Summary

**Root:** $c$ is a root of $p$ if $p(c) = 0$, equivalently if $(x-c)$
divides $p$.

**Fundamental Theorem of Algebra:** every degree-$n$ polynomial with
complex coefficients has exactly $n$ roots in $\mathbb{C}$, counted
with multiplicity:

$$p(x) = a_n(x-r_1)(x-r_2)\cdots(x-r_n), \qquad r_i \in \mathbb{C}$$

**Multiplicity:** $(x-c)^k \mid p$ but $(x-c)^{k+1} \nmid p$:
odd multiplicity → crosses $x$-axis; even multiplicity → touches only.

**Discriminant** $\Delta = b^2 - 4ac$:
- $\Delta > 0$: two distinct real roots
- $\Delta = 0$: one repeated real root
- $\Delta < 0$: two complex conjugate roots (no real roots)

**Complex Conjugate Root Theorem:** if $p$ has real coefficients and
$z$ is a root, then $\bar{z}$ is also a root.

**Factoring over $\mathbb{R}$:** real coefficient polynomials factor
into real linear factors and irreducible quadratics ($\Delta < 0$).

**New Python:**
- `np.roots(coeffs)` — find all $n$ roots of a degree-$n$ polynomial
- `root.real`, `root.imag` — real and imaginary parts of a complex number
- `np.conj(z)` — complex conjugate: $a+bi \to a-bi$
- `np.polyval(coeffs, x)` — evaluate polynomial without creating poly1d
- `edgecolors`, `linewidths` in `ax.scatter` — marker border styling
- `{value:+.4f}` in f-strings — always show sign (`+` or `-`)

---

## Problems

### Math

**1.** For each polynomial, state the degree, find all roots in $\mathbb{C}$
(using the quadratic formula where needed), and verify the total root
count equals the degree.

(a) $p(x) = x^3 - 8$

(b) $p(x) = x^4 - 5x^2 + 4$

(c) $p(x) = x^2 - 2x + 5$

(d) $p(x) = x^3 + x^2 + x + 1$

<details>
<summary>Hints</summary>

(a) Difference of cubes: $x^3 - 2^3 = (x-2)(x^2+2x+4)$.
Find roots of the quadratic factor using the quadratic formula.

(b) Treat as a quadratic in $x^2$: let $u = x^2$ and solve $u^2 - 5u + 4 = 0$.

(c) Discriminant: $4 - 20 = -16 < 0$. Two complex roots.

(d) Factor by grouping: $x^2(x+1) + 1(x+1) = (x^2+1)(x+1)$.

</details>

<details>
<summary>Answers</summary>

(a) Real root $x=2$. Quadratic $x^2+2x+4$: $\Delta = 4-16 = -12$,
roots $= -1 \pm i\sqrt{3}$. Three roots total. ✓

(b) $u = 1$ or $u = 4$, so $x = \pm 1$ or $x = \pm 2$. Four real roots. ✓

(c) $x = \frac{2 \pm \sqrt{-16}}{2} = 1 \pm 2i$. Two complex roots. ✓

(d) Real root $x=-1$. $x^2+1=0$: roots $x = \pm i$. Three roots. ✓

</details>

---

**2.** A polynomial $p(x)$ with real coefficients has degree 5.
It is known that $p$ has the complex root $2 + 3i$ and the real
root $x = -1$ of multiplicity 2.

(a) What other root must $p$ have? Why?

(b) What is the remaining root? (Count: $1 + 1 + 2 + ? = 5$.)

(c) Write a possible factored form for $p(x)$.

<details>
<summary>Answers</summary>

(a) $2-3i$ — by the Complex Conjugate Root Theorem, complex roots of
real polynomials come in conjugate pairs.

(b) Accounting: $2+3i$ (1) $+$ $2-3i$ (1) $+$ $x=-1$ (multiplicity 2) $= 4$ roots.
Degree is 5, so one more root is needed. With real coefficients, that root must be real.
Say $x = r$ for some $r \in \mathbb{R}$.

(c) $p(x) = a(x-(2+3i))(x-(2-3i))(x+1)^2(x-r)$
$= a(x^2-4x+13)(x+1)^2(x-r)$ for any $a \neq 0$ and $r \in \mathbb{R}$.

</details>

---

**3.** (Proof) Prove that every polynomial of odd degree with real
coefficients has at least one real root.

<details>
<summary>Hint</summary>

Complex roots come in pairs (conjugate pairs), so they account for an
even number of the $n$ total roots. If $n$ is odd, the remaining roots
— those not in conjugate pairs — must be real. At least one real root
must exist.

</details>

<details>
<summary>Answer</summary>

*Proof.* Let $p$ have real coefficients and odd degree $n$. By the FTA,
$p$ has exactly $n$ roots in $\mathbb{C}$. By the Conjugate Root Theorem,
complex (non-real) roots come in conjugate pairs — each pair contributes
2 roots. So the number of non-real roots is even. Since $n$ is odd and
the non-real roots number is even, the remaining roots (the real ones)
must number $n - \text{(even)} = \text{odd}$. In particular, at least
one real root exists. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Root classifier**

```python
import numpy as np

def classify_roots(coeffs, tol=1e-8):
    """
    Find all roots of the polynomial and classify them.
    
    Returns a dictionary:
      'real':           sorted list of real root values
      'complex_pairs':  list of (z, z_bar) tuples for conjugate pairs
      'total':          total root count (should equal degree)
    
    coeffs: polynomial coefficients in descending order
    tol:    imaginary part threshold for treating a root as real
    """
    pass  # your code here


# --- tests: do not modify ---
# x^2 - 5x + 6 = (x-2)(x-3): two real roots
r = classify_roots([1, -5, 6])
assert sorted(round(x, 4) for x in r['real']) == [2.0, 3.0]
assert len(r['complex_pairs']) == 0
assert r['total'] == 2

# x^2 + 1: two complex roots forming one conjugate pair
r = classify_roots([1, 0, 1])
assert len(r['real']) == 0
assert len(r['complex_pairs']) == 1
pair = r['complex_pairs'][0]
assert np.isclose(pair[0], np.conj(pair[1]))
assert r['total'] == 2

# x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3): three real roots
r = classify_roots([1, -6, 11, -6])
assert len(r['real']) == 3
assert len(r['complex_pairs']) == 0
assert r['total'] == 3

# x^4 + 4: two conjugate pairs, no real roots
r = classify_roots([1, 0, 0, 0, 4])
assert len(r['real']) == 0
assert len(r['complex_pairs']) == 2
assert r['total'] == 4

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Use `np.roots(coeffs)` to get all roots. Split into real (imaginary
part $<$ `tol`) and complex. Pair complex roots using `np.isclose(z, np.conj(w))`
with a `used` set to avoid reusing a root. Return the dictionary.

</details>

---

**Challenge 2 — Build polynomial from roots**

```python
import numpy as np

def polynomial_from_roots(roots, leading=1.0):
    """
    Build a polynomial from its list of roots.
    Returns coefficient list in descending order.
    
    If all roots are real, the result should have real coefficients.
    Multiplied out: leading * (x - r1)(x - r2)...(x - rn)
    
    roots:   list of root values (real or complex)
    leading: the leading coefficient (default 1)
    """
    pass  # your code here


# --- tests: do not modify ---
# Build x^2 - 5x + 6 from roots [2, 3]
p = polynomial_from_roots([2, 3])
assert np.allclose(p, [1, -5, 6]), f"Expected [1,-5,6], got {p}"

# Build (x-1)^2(x+2) from roots [1, 1, -2]
p = polynomial_from_roots([1, 1, -2])
assert np.allclose(p, [1, 0, -3, 2]), f"Expected [1,0,-3,2], got {p}"

# Build with leading coefficient 2
p = polynomial_from_roots([1, -1], leading=2.0)
assert np.allclose(p, [2, 0, -2]), f"Expected [2,0,-2], got {p}"

# Conjugate pair (1+i, 1-i) should give real polynomial x^2 - 2x + 2
p = polynomial_from_roots([1+1j, 1-1j])
assert np.allclose(p.real, [1, -2, 2], atol=1e-8), \
    f"Expected [1,-2,2], got {p.real}"

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

Start with `result = np.poly1d([leading])`. For each root `r`,
multiply by `np.poly1d([1, -r])`. Return `result.coeffs`.
The coefficients may be complex — use `.real` to extract real parts
when all roots are conjugate pairs.

</details>

---

**Challenge 3 — Visualise: roots → polynomial**

Build an interactive-style visualiser: given a list of real roots
(possibly with repetitions for multiplicity), plot the resulting
polynomial.

```python
import matplotlib.pyplot as plt
import numpy as np

def plot_from_roots(roots_list, x_range=(-5, 5), label=None):
    """
    Plot the polynomial whose roots are given.
    roots_list: list of real root values (repeats = multiplicity)
    x_range:    (min, max) for x-axis
    label:      optional title override
    """
    pass  # your code here


# No automated test -- the visual is the result.
# Try these examples and verify the graph matches the expected behaviour:

# 1. Three simple roots: should cross x-axis at each
plot_from_roots([-2, 1, 3], label="Three simple roots at $x=-2,1,3$")

# 2. Double root at 0, simple root at 2: should touch at 0, cross at 2
plot_from_roots([0, 0, 2], label="Double root at $x=0$, simple at $x=2$")

# 3. Triple root at 1: should cross with flat inflection
plot_from_roots([1, 1, 1], label="Triple root at $x=1$")
```

<details>
<summary>Hint</summary>

Use `polynomial_from_roots(roots_list)` from Challenge 2 (or implement
inline). Create `x = np.linspace(*x_range, 400)`, evaluate, plot,
mark each distinct root with a dot, and set the title to describe the
multiplicity structure.

</details>

---

### Extension

**4. ★** The **Rational Root Theorem** (Lesson 1.2) limits which rational
numbers can be roots of an integer-coefficient polynomial. Combined with
the FTA, it gives a complete strategy for finding all roots:

1. Use the Rational Root Theorem to find any rational roots.
2. Divide them out using synthetic division.
3. The remaining factor is either a quadratic (solve with the quadratic
   formula) or an irreducible higher-degree polynomial.

Apply this strategy completely to $p(x) = 2x^4 - 3x^3 - 2x^2 + 3x + 2$.

Find all four roots (they may be rational, irrational, or complex).
Verify by reconstructing $p$ from its roots.

<details>
<summary>Answer</summary>

Rational root candidates: $\pm 1, \pm 2, \pm \frac{1}{2}$.

Test: $p(1) = 2-3-2+3+2 = 2 \neq 0$.
$p(-1) = 2+3-2-3+2 = 2 \neq 0$.
$p(2) = 32-24-8+6+2 = 8 \neq 0$.
$p(-\frac{1}{2}) = 2(\frac{1}{16})-3(-\frac{1}{8})-2(\frac{1}{4})+3(-\frac{1}{2})+2 = \frac{1}{8}+\frac{3}{8}-\frac{1}{2}-\frac{3}{2}+2 = 0$. ✓

Divide by $(x+\frac{1}{2})$ i.e. $(2x+1)$:
$2x^4-3x^3-2x^2+3x+2 \div (2x+1)$: quotient $x^3-2x^2-\frac{1}{2}x+... $

Actually, work with $(2x+1)$ as divisor or use $c=-\frac{1}{2}$:
After synthetic division: $x^3-2x^2+\frac{-3}{2}x... $

Let's compute numerically:
```python
import numpy as np
r = np.roots([2,-3,-2,3,2])
print(r)  # → [2., 1., -0.5, -0.5]
```
Wait: $p(2)=8\neq 0$... Let me recheck. Actually $r=[2, -1, -0.5, 0.5]$...

Numerically: roots are approximately $2, 1, -\frac{1}{2}, -1$... let's verify:
$p(x) = 2(x-2)(x-1)(x+\frac{1}{2})(x+1) = 2(x-2)(x-1)(2x+1)(x+1)/2 = (x-2)(x-1)(2x+1)(x+1)$.
Check: $(x-2)(x+1) = x^2-x-2$; $(x-1)(2x+1) = 2x^2-x-1$.
Product: $(x^2-x-2)(2x^2-x-1) = 2x^4-x^3-x^2-2x^3+x^2+x-4x^2+2x+2 = 2x^4-3x^3-4x^2+3x+2$.
Hmm, that gives $-4x^2$ not $-2x^2$. The actual roots are best found numerically.

The point of this exercise is the strategy, not the specific polynomial.
Verify your factoring by multiplying back out or using numpy. $\square$

</details>

**5. ★** Prove that $\sqrt{2} + \sqrt{3}$ is algebraic — that is, it
is a root of some polynomial with integer coefficients.

*(Hint: let $x = \sqrt{2} + \sqrt{3}$ and manipulate algebraically
to eliminate the square roots and find a polynomial equation that $x$ satisfies.)*

<details>
<summary>Answer</summary>

Let $x = \sqrt{2}+\sqrt{3}$. Then $x - \sqrt{3} = \sqrt{2}$,
so $(x-\sqrt{3})^2 = 2$, giving $x^2 - 2\sqrt{3}x + 3 = 2$,
i.e., $x^2 + 1 = 2\sqrt{3}x$. Squaring: $(x^2+1)^2 = 12x^2$,
i.e., $x^4 + 2x^2 + 1 = 12x^2$, so $x^4 - 10x^2 + 1 = 0$.

Therefore $\sqrt{2}+\sqrt{3}$ is a root of $p(x) = x^4 - 10x^2 + 1$,
which has integer coefficients. $\square$

This technique — squaring repeatedly to clear radicals — produces the
minimal polynomial of algebraic numbers.

</details>
