# M-009 — Inverse Functions

**Phase 2 · Functions and Their Behaviour · Lesson 2 of 3**

---

You have been "undoing" operations your whole mathematical life. Subtract to undo addition. Divide to undo multiplication. Take the square root to undo squaring. This idea — that operations come with opposites — is so natural it feels obvious.

But does squaring always have an opposite? Can you always undo a function? And when you can, what is the relationship between the original and the "undo" version?

---

## Stop and Think: Does f(x) = x² Have an Inverse?

Try to "undo" $f(x) = x^2$. Given an output $y$, find the input $x$ that produced it.

For $y = 9$: $x$ could be $3$ or $-3$. Both square to $9$.

For $y = -1$: no real $x$ at all.

Two problems: one output can come from two different inputs, and some outputs have no input at all. The "undo" operation — if we tried to define it — would either give two answers for the same question (not a function) or be undefined at some inputs.

The name for both problems: $f(x) = x^2$ on $\mathbb{R}$ is not bijective.

---

## When Does an Inverse Exist?

The **inverse** of $f: A \to B$ is a function $f^{-1}: B \to A$ that undoes $f$ in both directions:

$$f^{-1}(f(x)) = x \text{ for every } x \in A \qquad \text{and} \qquad f(f^{-1}(y)) = y \text{ for every } y \in B$$

**Theorem:** An inverse exists if and only if $f$ is bijective.

The proof has two directions.

**If $f^{-1}$ exists, then $f$ is bijective.**

*Injective:* suppose $f(x_1) = f(x_2)$. Apply $f^{-1}$ to both sides: $x_1 = f^{-1}(f(x_1)) = f^{-1}(f(x_2)) = x_2$. So different inputs cannot give the same output.

*Surjective:* for any $y \in B$, the element $x = f^{-1}(y)$ satisfies $f(x) = f(f^{-1}(y)) = y$. So every output is achieved.

**If $f$ is bijective, then $f^{-1}$ exists.**

For each $y \in B$: surjectivity guarantees at least one $x$ with $f(x) = y$. Injectivity guarantees it is unique. Define $f^{-1}(y)$ to be that unique $x$. This defines a function (one output per input) satisfying both inverse conditions. $\square$

---

## Finding the Inverse Algebraically

The method: write $y = f(x)$, solve for $x$, then relabel $x$ as $f^{-1}(y)$.

**Example:** $f(x) = 2x + 3$.

Write $y = 2x + 3$. Solve: $x = (y - 3)/2$. So $f^{-1}(y) = (y-3)/2$.

Check: $f^{-1}(f(x)) = f^{-1}(2x+3) = (2x+3-3)/2 = x$ ✓

**Example:** $f(x) = x^2$ restricted to $[0, \infty)$.

Write $y = x^2$ with $x \geq 0$. Solve: $x = \sqrt{y}$ (taking the positive root because $x \geq 0$). So $f^{-1}(y) = \sqrt{y}$.

The domain restriction is what makes the inverse single-valued. Without it, we would need to decide between $+\sqrt{y}$ and $-\sqrt{y}$ — and there is no "right" choice. The restriction is what makes $f$ bijective and the inverse well-defined.

```python
import math

# Verify f^{-1}(f(x)) = x for several pairs
pairs = [
    (lambda x: 2*x + 3,   lambda y: (y-3)/2,         "2x+3",      "(y-3)/2",  [-2,0,1,3]),
    (lambda x: x**2,       math.sqrt,                  "x²",        "√x",       [0,1,2,4,9]),
    (lambda x: math.exp(x),math.log,                   "eˣ",        "ln(x)",    [-1,0,1,2]),
    (lambda x: x**3,       lambda y: y**(1/3),         "x³",        "∛x",       [0,1,2,8]),
]

for (f, finv, fname, iname, xs) in pairs:
    errors = [abs(finv(f(x)) - x) for x in xs]
    ok = all(e < 1e-10 for e in errors)
    print(f"f={fname:8s}, f⁻¹={iname:8s}: f⁻¹(f(x))=x for all test points? {'✓' if ok else '✗'}")
```

---

## The Graphical Picture

> Why does reflecting across $y = x$ give the graph of $f^{-1}$?

Think about what reflection across $y = x$ does: it swaps coordinates. The point $(a, b)$ becomes $(b, a)$.

Now: the point $(a, b)$ is on the graph of $f$ exactly when $f(a) = b$. And the point $(b, a)$ is on the graph of $f^{-1}$ exactly when $f^{-1}(b) = a$ — which is exactly what $f(a) = b$ means. So reflecting every point of $f$'s graph across $y = x$ gives exactly the graph of $f^{-1}$.

```python
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(7, 7))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_xlim(-0.5, 4)
ax.set_ylim(-0.5, 4)
ax.set_aspect('equal')

# y = x line (reflection axis)
t = np.linspace(-0.5, 4, 100)
ax.plot(t, t, color='#3a4060', lw=1, linestyle='--', label='y = x')

# f(x) = 2^x
x1 = np.linspace(-0.5, 2, 300)
ax.plot(x1, 2**x1, color='#4fc3f7', lw=2.5, label=r'$f(x) = 2^x$')

# f^{-1}(x) = log_2(x)
x2 = np.linspace(0.05, 4, 300)
ax.plot(x2, np.log2(x2), color='#ff9800', lw=2.5, label=r'$f^{-1}(x) = \log_2 x$')

# Show reflected point pair: (1, 2) and (2, 1)
ax.plot(1, 2, 'o', color='white', ms=8, zorder=5)
ax.plot(2, 1, 'o', color='white', ms=8, zorder=5)
ax.plot([1, 2], [2, 1], '--', color='#888', lw=1)
ax.text(1.05, 2.15, '(1, 2)', color='white', fontsize=9)
ax.text(2.05, 0.85, '(2, 1)', color='white', fontsize=9)

ax.axhline(0, color='#3a4060', lw=1)
ax.axvline(0, color='#3a4060', lw=1)

legend = ax.legend(facecolor='#0f1117', edgecolor='#3a4060', labelcolor='white', fontsize=10)
ax.set_title(r'$f^{-1}$ is the reflection of $f$ across $y = x$',
             color='#5a7a90', fontsize=11, style='italic')
ax.tick_params(colors='#555')
for sp in ax.spines.values():
    sp.set_color('#2a3050')
plt.tight_layout()
plt.show()
```

The point $(1, 2)$ is on $f$ because $2^1 = 2$. Its reflection $(2, 1)$ is on $f^{-1}$ because $\log_2 2 = 1$. Every point and its reflection confirm the relationship.

---

## The Inverse Theme

The "undo" idea appears everywhere. The same pattern — an operation paired with its reverse — recurs across all of mathematics:

| Object | Operation | Inverse | When it exists |
|---|---|---|---|
| Numbers | $\times a$ | $\times a^{-1} = \div a$ | $a \neq 0$ |
| Functions | apply $f$ | apply $f^{-1}$ | $f$ bijective |
| Matrices | multiply by $A$ | multiply by $A^{-1}$ | $\det A \neq 0$ |
| Exponential | $e^x$ | $\ln x$ | (always, on $\mathbb{R}$) |
| Differentiation | $\frac{d}{dx}$ | $\int \cdot\, dx$ | (Fundamental Theorem) |

Each row is the same idea in a different context. When you learn matrix inverses or logarithms later, you are not learning something new — you are seeing the same structure you learned here.

---

## Restricting Domains for Trig Functions

$\sin x$ is not injective on $\mathbb{R}$ — it oscillates up and down, hitting every value in $[-1, 1]$ infinitely many times. So $\sin^{-1}$ (arcsine) cannot be defined on all of $\mathbb{R}$.

The fix: restrict $\sin$ to $[-\pi/2, \pi/2]$, where it is strictly increasing and therefore injective. On this domain, $\sin: [-\pi/2, \pi/2] \to [-1, 1]$ is bijective, and $\sin^{-1}: [-1, 1] \to [-\pi/2, \pi/2]$ is well-defined.

The same story applies to $\cos$ (restricted to $[0, \pi]$) and $\tan$ (restricted to $(-\pi/2, \pi/2)$). These restrictions are called **principal branches** — you will see this phrase in Phase 4.

---

## Try It Yourself

**Challenge 1.** Find the inverse of each function, stating the domain restriction you need:

- $f(x) = x^2 - 4$ on $[0, \infty)$
- $g(x) = \frac{x+1}{x-1}$ for $x \neq 1$
- $h(x) = \sqrt{x + 3}$ on $[-3, \infty)$

**Challenge 2.** Prove that the inverse of a bijection is itself a bijection, and that $(f^{-1})^{-1} = f$.

**Challenge 3.** Prove that the inverse is unique: if $g$ and $h$ are both inverses of $f$, then $g = h$.

*Hint: start with $g(y) = g(f(h(y)))$ and apply the inverse conditions one step at a time.*

---

## What Comes Next

You now know what a function is and when it can be undone. The natural next question: what happens when you apply two functions in sequence — first $f$, then $g$? This is **composition**, and it turns out to be the operation that connects all functions into a structure. M-010 builds composition and shows how it connects to the transformations — rotations, reflections, scalings — that you will see throughout linear algebra and geometry.
