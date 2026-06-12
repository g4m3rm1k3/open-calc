# M-011 — Polynomials, Division, and Roots

**Phase 3 · Polynomials and Rational Functions · Lesson 1 of 2**

---

Here is a fact that deserves more attention than it usually gets: if you know that $f(3) = 0$, you know that $(x - 3)$ divides $f$ exactly. The function value at a single point tells you about the entire algebraic structure of $f$.

Why? And what does it mean to "divide" one polynomial by another? The answer connects polynomials to ordinary integer division — the same algorithm, the same logic, working in a completely different setting.

---

## What a Polynomial Is

A **polynomial of degree $n$** is:

$$p(x) = a_n x^n + a_{n-1} x^{n-1} + \cdots + a_1 x + a_0, \qquad a_n \neq 0$$

The $a_i$ are **coefficients** (real numbers for now). The values of $x$ where $p(x) = 0$ are called **roots** or **zeros** of $p$.

Polynomials are the simplest functions in calculus: they require only addition and multiplication to define. They cannot have asymptotes, discontinuities, or oscillations. And yet any continuous function on a closed interval can be approximated to any desired accuracy by a polynomial — but that is a theorem for much later.

---

## Division: The Same Algorithm as with Integers

With integers, you can always divide: $17 = 3 \times 5 + 2$. Quotient $5$, remainder $2$, and the remainder is strictly smaller than the divisor.

With polynomials, the exact same thing is true, with "smaller" replaced by "lower degree."

**Theorem (Polynomial Division).** For any polynomials $f(x)$ and $d(x)$ with $\deg(d) \geq 1$, there exist unique polynomials $q(x)$ and $r(x)$ such that:

$$f(x) = d(x) \cdot q(x) + r(x), \qquad \deg(r) < \deg(d)$$

The polynomial $q$ is the **quotient** and $r$ is the **remainder**. When $d(x) = x - a$ (degree 1), the remainder $r$ must have degree $< 1$, so $r$ is a constant.

---

## Stop and Think: What is the Remainder?

When you divide $f(x)$ by $(x - a)$, you get:

$$f(x) = (x - a) \cdot q(x) + r$$

for some polynomial $q(x)$ and some constant $r$. This equation holds for ALL values of $x$.

Try substituting $x = a$ before reading on. What does the left side give you? What does the right side simplify to?

---

Substituting $x = a$:

$$f(a) = (a - a) \cdot q(a) + r = 0 + r = r$$

**The remainder when $f(x)$ is divided by $(x - a)$ equals $f(a)$.**

This is the **Remainder Theorem** — and you just proved it. The proof needed nothing beyond the division algorithm and one substitution.

---

## The Factor Theorem

The Remainder Theorem immediately gives something stronger.

**Factor Theorem.** $(x - a)$ is a factor of $f(x)$ if and only if $f(a) = 0$.

$(x - a)$ being a factor means the remainder is zero. By the Remainder Theorem, the remainder equals $f(a)$. So: remainder is zero $\iff$ $f(a) = 0$. $\square$

This is the connection between roots and factors. Finding one root gives you one factor; dividing it out reduces the problem by one degree. You can then find another root of the smaller polynomial, and so on.

```python
# Remainder Theorem: divide x^3 - 7x + 6 by (x - 2)
# Theorem says remainder = f(2)

def poly_eval(coeffs, x):
    result = 0
    for c in coeffs:
        result = result * x + c   # Horner's method
    return result

# x^3 - 7x + 6 as coefficients [a3, a2, a1, a0]
f = [1, 0, -7, 6]

print("Remainder Theorem: divide f(x) = x³ - 7x + 6 by (x - 2)")
print(f"  f(2) = {poly_eval(f, 2)}  ← this is the remainder")
print()
print("Factor Theorem: which integers are roots?")
for a in range(-5, 6):
    if poly_eval(f, a) == 0:
        print(f"  f({a}) = 0  →  (x - ({a})) = (x {'+' if a<0 else '-'} {abs(a)}) is a factor")
```

---

## Finding All Roots by Factoring Down

Once you have one root, divide it out and repeat.

$f(x) = x^3 - 7x + 6$. Try $x = 1$: $f(1) = 1 - 7 + 6 = 0$. So $(x - 1)$ is a factor.

Divide: $f(x) = (x - 1)(x^2 + x - 6)$.

Now factor the quadratic: $x^2 + x - 6 = (x - 2)(x + 3)$.

So $f(x) = (x - 1)(x - 2)(x + 3)$. Three linear factors, three roots: $1, 2, -3$.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-4.5, 3.5, 400)
y = x**3 - 7*x + 6   # = (x-1)(x-2)(x+3)

fig, ax = plt.subplots(figsize=(8, 5))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.plot(x, y, color='#4fc3f7', lw=2.5)
ax.axhline(0, color='#3a4060', lw=1)
ax.axvline(0, color='#3a4060', lw=1)
ax.set_ylim(-12, 12)

for root, label in [(-3, 'x = -3'), (1, 'x = 1'), (2, 'x = 2')]:
    ax.plot(root, 0, 'o', color='#ff9800', ms=9, zorder=5)
    ax.text(root, -2.5, label, color='#ff9800', fontsize=9, ha='center')

ax.set_title(r'$f(x) = x^3 - 7x + 6 = (x+3)(x-1)(x-2)$ — three simple roots, three crossings',
             color='#5a7a90', fontsize=10, style='italic')
ax.tick_params(colors='#555')
for sp in ax.spines.values():
    sp.set_color('#2a3050')
plt.tight_layout()
plt.show()
```

---

## Multiplicity: How the Graph Behaves at a Root

When $(x - a)^k$ divides $f$ but $(x - a)^{k+1}$ does not, we say $a$ is a root of **multiplicity** $k$. The graph behaves differently depending on $k$:

- **Multiplicity 1:** the graph crosses the axis — it passes straight through.
- **Multiplicity 2:** the graph is tangent to the axis — it touches and bounces back.
- **Multiplicity 3:** the graph crosses but with a flattened S-shape at the root.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-2.5, 2.5, 500)
fig, axes = plt.subplots(1, 3, figsize=(12, 4))
fig.patch.set_facecolor('#0f1117')

cases = [
    ((x - 1) * (x + 1),          '(x−1)(x+1)\nMultiplicity 1 at each root',  '#4fc3f7'),
    ((x - 1)**2 * (x + 1),        '(x−1)²(x+1)\nMultiplicity 2 at x=1',       '#ff9800'),
    ((x - 1)**3,                   '(x−1)³\nMultiplicity 3 at x=1',             '#66bb6a'),
]

for ax, (y, title, color) in zip(axes, cases):
    ax.set_facecolor('#0f1117')
    ax.plot(x, np.clip(y, -4, 4), color=color, lw=2.5)
    ax.axhline(0, color='#3a4060', lw=1)
    ax.axvline(0, color='#3a4060', lw=1)
    ax.set_ylim(-4, 4)
    ax.set_title(title, color=color, fontsize=9, pad=4)
    ax.tick_params(colors='#555')
    for sp in ax.spines.values():
        sp.set_color('#2a3050')

plt.suptitle('Root multiplicity determines the shape of the graph at each zero',
             color='#5a7a90', fontsize=10, style='italic')
plt.tight_layout()
plt.show()
```

Multiplicity is also what the discriminant from M-005 detects: $\Delta = 0$ means a repeated root — the parabola is tangent to the $x$-axis.

---

## Stop and Think: How Many Roots?

> Can a degree-4 polynomial have exactly 3 real roots?

Think about this carefully. If it has roots $r_1, r_2, r_3$ in $\mathbb{R}$, the polynomial factors as $(x - r_1)(x - r_2)(x - r_3) \cdot q(x)$ where $q$ has degree 1. So the fourth root is the root of $q(x)$ — which is a linear factor with a real root. So a degree-4 polynomial over $\mathbb{R}$ always has either 2 or 4 real roots (counting multiplicity). It cannot have exactly 3.

---

## The Fundamental Theorem of Algebra

**Theorem.** Every polynomial of degree $n \geq 1$ with complex coefficients has exactly $n$ roots in $\mathbb{C}$, counted with multiplicity.

This means every degree-$n$ polynomial factors completely over $\mathbb{C}$:

$$p(x) = a_n (x - r_1)(x - r_2) \cdots (x - r_n)$$

The proof requires complex analysis — specifically, that a non-constant polynomial cannot be bounded on $\mathbb{C}$ — and will come in Phase 16. For now, two consequences you can use immediately:

**Every odd-degree real polynomial has at least one real root.** A degree-3 polynomial with $a_3 > 0$ goes to $+\infty$ as $x \to +\infty$ and $-\infty$ as $x \to -\infty$. The Intermediate Value Theorem (Phase 5) forces it to cross zero somewhere.

**Complex roots of real polynomials come in conjugate pairs.** If $a + bi$ is a root, so is $a - bi$. This is why a degree-4 polynomial cannot have exactly one complex root — complex roots must arrive in pairs, so it has 0, 2, or 4.

---

## Try It Yourself

**Challenge 1.** Factorise $p(x) = x^3 + x^2 - 4x - 4$ completely. Start by finding one integer root using the Factor Theorem.

**Challenge 2.** Prove that a polynomial of degree $n$ over $\mathbb{R}$ can have at most $n$ real roots. *(Hint: if $a_1, \ldots, a_k$ are roots, then $(x - a_1) \cdots (x - a_k)$ divides $p$. What does this say about the degree?)*

**Challenge 3.** The polynomial $p(x) = x^4 - 5x^2 + 4$. Without computing, determine how many real roots it has and describe the graph's behaviour at each one. *(Hint: let $u = x^2$ and solve the resulting quadratic.)*

---

## What Comes Next

M-012 introduces complex numbers. The Fundamental Theorem says degree-$n$ polynomials always have $n$ roots in $\mathbb{C}$ — but what exactly is $\mathbb{C}$, and what does it mean to extend $\mathbb{R}$ by adding a square root of $-1$? M-012 builds the complex numbers from scratch, starting from the same consistency principle used in M-007 for exponents.
