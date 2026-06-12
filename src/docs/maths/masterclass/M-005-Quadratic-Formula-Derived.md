# M-005 — The Quadratic Formula, Derived from Scratch

**Phase 1 · Algebra Rebuilt · Lesson 3 of 5**

---

The quadratic formula is one of the most memorised things in all of school mathematics. It is also one of the most forgotten — students spend years writing it down and lose it within weeks of the exam.

Here is the thing: you don't need to memorise it. If you understand the *technique* behind it, you can rederive it in two minutes from scratch. Forever.

The technique is called **completing the square**, and it is more important than the formula it produces.

---

## The Problem

We want to solve $ax^2 + bx + c = 0$ for $x$, where $a \neq 0$.

We cannot factor it in general — not without already knowing the roots. We cannot isolate $x$ directly — the $x^2$ and $x$ terms are mixed together. We need a new move.

---

## The Observation

A perfect square $( x + d )^2 = x^2 + 2dx + d^2$ has one special property: the coefficient of $x$ is exactly *twice* the square root of the constant term. Check: $2d = 2 \cdot \sqrt{d^2}$.

This gives us a target. If we could rewrite $ax^2 + bx + c$ as $(x + d)^2 + \text{something}$, we could solve by taking a square root.

---

## The Derivation

**Step 1.** Divide by $a$ (valid since $a \neq 0$ — axiom M4):

$$x^2 + \frac{b}{a}x + \frac{c}{a} = 0$$

**Step 2.** Identify $d$. We want $(x + d)^2 = x^2 + 2dx + d^2$. For the $x$-coefficients to match: $2d = b/a$, so $d = b/(2a)$.

**Step 3.** Add and subtract $d^2 = b^2/(4a^2)$:

$$x^2 + \frac{b}{a}x + \frac{b^2}{4a^2} - \frac{b^2}{4a^2} + \frac{c}{a} = 0$$

$$\left(x + \frac{b}{2a}\right)^2 - \frac{b^2}{4a^2} + \frac{c}{a} = 0$$

**Step 4.** Combine the constants on the right:

$$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2}{4a^2} - \frac{c}{a} = \frac{b^2 - 4ac}{4a^2}$$

**Step 5.** Take square roots. Since $(r)^2 = (-r)^2$, both signs are valid:

$$x + \frac{b}{2a} = \pm\frac{\sqrt{b^2 - 4ac}}{2a}$$

**Step 6.** Subtract $b/(2a)$:

$$\boxed{x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}}$$

You derived it. Every symbol has a story. The $-b$ came from subtracting $d = b/(2a)$. The $\pm$ came from taking the square root of both sides. The $2a$ came from dividing out $a$ in step 1 and the squaring in step 3.

---

## The Discriminant Tells Everything

The expression $\Delta = b^2 - 4ac$ (the discriminant) lives inside the square root. It determines the entire character of the solutions before you compute them.

```python
import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(1, 3, figsize=(12, 5))
fig.patch.set_facecolor('#0f1117')

cases = [
    ('Δ > 0\nTwo real roots', 1, -5, 6, '#4fc3f7'),
    ('Δ = 0\nOne repeated root', 1, -4, 4, '#ff9800'),
    ('Δ < 0\nNo real roots', 1, 2, 5,  '#e05060'),
]

x = np.linspace(-1, 6, 400)

for ax, (title, a, b, c, color) in zip(axes, cases):
    ax.set_facecolor('#0f1117')
    y = a*x**2 + b*x + c

    # shaded region below/above x-axis
    ax.fill_between(x, y, 0, where=(y < 0), alpha=0.12, color=color)
    ax.fill_between(x, y, 0, where=(y >= 0), alpha=0.06, color='#fff')

    ax.plot(x, y, color=color, lw=2.5)
    ax.axhline(0, color='#444', lw=1)
    ax.axvline(0, color='#333', lw=1)

    disc = b**2 - 4*a*c
    ax.text(0.05, 0.95, f'a={a}, b={b}, c={c}', transform=ax.transAxes,
            color='#8a9ab0', fontsize=8.5, va='top', fontfamily='monospace')
    ax.text(0.05, 0.85, f'Δ = b²-4ac = {disc}', transform=ax.transAxes,
            color=color, fontsize=9, va='top', fontfamily='monospace')

    # Mark roots if real
    if disc > 0:
        r1 = (-b + disc**0.5)/(2*a)
        r2 = (-b - disc**0.5)/(2*a)
        ax.plot([r1, r2], [0, 0], 'o', color=color, ms=8)
        ax.text(r1, -0.7, f'x={r1:.2f}', color=color, fontsize=8, ha='center')
        ax.text(r2, -0.7, f'x={r2:.2f}', color=color, fontsize=8, ha='center')
    elif disc == 0:
        r = -b/(2*a)
        ax.plot(r, 0, 'o', color=color, ms=8)
        ax.text(r, -0.7, f'x={r:.2f}', color=color, fontsize=8, ha='center')

    ax.set_title(title, color=color, fontsize=11, style='italic', pad=6)
    ax.set_ylim(-2, 8)
    for s in ax.spines.values():
        s.set_color('#2a3050')
    ax.tick_params(colors='#555')

plt.suptitle('The discriminant Δ = b²-4ac determines the nature of the roots',
             color='#4a6a80', fontsize=11, style='italic')
plt.tight_layout()
plt.show()
```

| Discriminant | Shape | Solutions |
|---|---|---|
| $\Delta > 0$ | Parabola crosses x-axis twice | Two distinct real roots |
| $\Delta = 0$ | Parabola just touches x-axis | One repeated real root |
| $\Delta < 0$ | Parabola misses x-axis entirely | No real roots (two complex ones — Phase 3) |

---

## Verification by Substitution

The formula means nothing if we don't check it. A real solution $r$ to $ax^2 + bx + c = 0$ must satisfy: substituting $x = r$ gives exactly zero.

```python
import math

def quadratic_roots(a, b, c):
    disc = b**2 - 4*a*c
    print(f"Solving {a}x² + ({b})x + ({c}) = 0")
    print(f"  Discriminant Δ = {b}² - 4·{a}·{c} = {disc}")

    if disc > 0:
        r1 = (-b + math.sqrt(disc)) / (2*a)
        r2 = (-b - math.sqrt(disc)) / (2*a)
        print(f"  Two roots: x = {r1:.6f}  and  x = {r2:.6f}")
        for r in [r1, r2]:
            check = a*r**2 + b*r + c
            print(f"    Verify: {a}·({r:.4f})² + {b}·({r:.4f}) + {c} = {check:.2e}  {'✓' if abs(check) < 1e-8 else '✗'}")
    elif disc == 0:
        r = -b / (2*a)
        print(f"  One repeated root: x = {r:.6f}")
        check = a*r**2 + b*r + c
        print(f"  Verify: = {check:.2e}  {'✓' if abs(check) < 1e-8 else '✗'}")
    else:
        print(f"  No real roots (Δ < 0)")
        re_part = -b / (2*a)
        im_part = math.sqrt(-disc) / (2*a)
        print(f"  Complex roots: x = {re_part:.4f} ± {im_part:.4f}i  (Phase 3)")
    print()

quadratic_roots(1, -5, 6)    # roots 2 and 3
quadratic_roots(1, -4, 4)    # repeated root 2
quadratic_roots(1, 2, 5)     # no real roots
quadratic_roots(2, -3, -5)   # two real roots
```

---

## Completing the Square Beyond the Formula

Completing the square is not just for deriving the quadratic formula. The same technique appears in:

- **Phase 10 (Linear Algebra):** Completing the square in a quadratic form $\mathbf{x}^T A \mathbf{x}$ is how you diagonalise a symmetric matrix.
- **Phase 12 (Probability):** The integral of the Gaussian $e^{-x^2/2}$ is computed by completing the square in the exponent.
- **Phase 5 (Limits):** $\lim_{x \to -b/2a} \frac{ax^2+bx+c}{x+b/2a}$ is handled by writing the numerator as $(x + b/2a)^2 - \Delta/4a^2$.

The technique is worth knowing. The formula is just a consequence.

---

## Vieta's Formulas

If $r_1$ and $r_2$ are the two roots of $ax^2 + bx + c = 0$:

$$r_1 + r_2 = \frac{-b + \sqrt{\Delta}}{2a} + \frac{-b - \sqrt{\Delta}}{2a} = \frac{-2b}{2a} = -\frac{b}{a}$$

$$r_1 \cdot r_2 = \frac{(-b)^2 - (\sqrt{\Delta})^2}{4a^2} = \frac{b^2 - (b^2 - 4ac)}{4a^2} = \frac{c}{a}$$

So without solving the equation, you immediately know:

**Sum of roots = $-b/a$**, **Product of roots = $c/a$**.

For $x^2 - 5x + 6 = 0$: sum $= 5$, product $= 6$. The roots must be 2 and 3. Check: $2 + 3 = 5$, $2 \times 3 = 6$. ✓

These are called **Vieta's formulas**, and they generalise to polynomials of any degree (Phase 11 — the connection to the characteristic polynomial of a matrix).

---

## Try It Yourself

1. **Derive** the quadratic formula from scratch for $3x^2 - 7x + 2 = 0$, showing all six steps. Do not use the memorised formula — use completing the square.

2. **Without solving:** for $x^2 + px + q = 0$, find a condition on $p$ and $q$ that guarantees both roots are positive.

3. A rectangular garden has perimeter 20m and area 21m². Set up the quadratic equation and find the dimensions.

```python
import math
# Garden problem: length l, width w
# l + w = 10 (half the perimeter)
# l * w = 21
# So l and w are roots of x^2 - 10x + 21 = 0

a, b, c = 1, -10, 21
disc = b**2 - 4*a*c
l = (-b + math.sqrt(disc)) / (2*a)
w = (-b - math.sqrt(disc)) / (2*a)
print(f"Dimensions: {l}m × {w}m")
print(f"Check perimeter: 2({l}+{w}) = {2*(l+w)}m ✓")
print(f"Check area: {l} × {w} = {l*w}m² ✓")
```

---

## What Comes Next

We have been talking about specific numbers all through Phase 1. In M-006 we look at absolute value — the language of distance on the number line. This is not just notation. The epsilon-delta definition of a limit (Phase 5) is written entirely in absolute values. Setting up that language now means the central definition of calculus will not look foreign when we reach it.
