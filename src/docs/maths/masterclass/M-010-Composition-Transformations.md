# M-010 — Composition and Graph Transformations

**Phase 2 · Functions and Their Behaviour · Lesson 3 of 3**

---

Here is something that trips up almost every algebra student: if $f$ has a peak at $x = 3$, where is the peak of $f(x + 2)$?

Most students say $x = 5$. The answer is $x = 1$.

Adding to $x$ shifts the graph *left*, not right. Subtracting shifts it right. Every student is told this rule; almost nobody is told why. Today we derive the reason — and discover that it follows from understanding **composition**, which is how all function transformations are built.

---

## Composition: One Function After Another

The **composition** of $f: B \to C$ and $g: A \to B$ is the function:

$$(f \circ g)(x) = f(g(x))$$

Apply $g$ first, then feed the result into $f$. The notation $f \circ g$ is read "$f$ of $g$" — and like reading, you evaluate it right to left.

**Example.** $f(x) = x^2$ and $g(x) = x + 1$.

$(f \circ g)(x) = f(g(x)) = f(x+1) = (x+1)^2$

$(g \circ f)(x) = g(f(x)) = g(x^2) = x^2 + 1$

These are different functions. **Composition is not commutative** — the order matters.

```python
# Composition is not commutative
f = lambda x: x**2
g = lambda x: x + 1

x = 3
fog = f(g(x))   # f(g(3)) = f(4) = 16
gof = g(f(x))   # g(f(3)) = g(9) = 10

print(f"(f∘g)(3) = f(g(3)) = f({g(x)}) = {fog}")
print(f"(g∘f)(3) = g(f(3)) = g({f(x)}) = {gof}")
print(f"Equal? {fog == gof}")
```

---

## Stop and Think: The Mystery of Horizontal Shifts

> $f$ has a peak at $x = 3$. Where is the peak of $f(x + 2)$?

Try to answer this before reading on. Be careful.

---

The peak of $f$ occurs where the input equals $3$. In $f(x + 2)$, the input to $f$ is $x + 2$. So the peak of $f(x+2)$ occurs when $x + 2 = 3$, which means $x = 1$.

The peak moved from $3$ to $1$ — it moved **left** by 2, even though we added 2.

The reason: adding 2 inside the argument means we reach the "peak input" sooner. We need $x = 1$ now to deliver $x + 2 = 3$ to $f$. The whole graph shifts left.

This is not a rule to memorize. It is the definition of composition.

---

## Every Graph Transformation is a Composition

The key principle: $y = f(g(x))$ applies the function $f$ to a modified input $g(x)$ instead of $x$. The modification $g$ transforms the graph.

**Vertical shift up by $c$:** $y = f(x) + c$

This is $T_c(f(x))$ where $T_c(y) = y + c$. The output is shifted up by $c$.

**Horizontal shift right by $c$:** $y = f(x - c)$

The input $x - c$ equals $a$ when $x = a + c$. Features that were at $x = a$ are now at $x = a + c$. Right shift uses *subtraction*.

**Vertical stretch by $c$:** $y = c \cdot f(x)$ — outputs scaled by $c$.

**Horizontal compression by $c$:** $y = f(cx)$ for $c > 1$ — the feature at $x = a$ moves to $x = a/c$, closer to the origin.

**Reflection across $x$-axis:** $y = -f(x)$ — all outputs negated.

**Reflection across $y$-axis:** $y = f(-x)$ — input negated.

```python
import matplotlib.pyplot as plt
import numpy as np

# Base function: a recognisable shape with a clear peak
def base(x):
    return np.exp(-0.5 * x**2) * np.cos(x)

x = np.linspace(-4, 4, 400)
fig, axes = plt.subplots(2, 3, figsize=(12, 7))
fig.patch.set_facecolor('#0f1117')

configs = [
    (base(x),          '#4fc3f7', 'f(x)  —  original'),
    (base(x) + 1,      '#66bb6a', 'f(x) + 1  —  shift up 1'),
    (base(x - 1.5),    '#ff9800', 'f(x − 1.5)  —  shift right 1.5'),
    (base(2 * x),      '#ce93d8', 'f(2x)  —  compress horizontally'),
    (-base(x),         '#ef5350', '−f(x)  —  flip vertical'),
    (base(-x),         '#ffb74d', 'f(−x)  —  flip horizontal'),
]

for ax, (y, color, title) in zip(axes.flat, configs):
    ax.set_facecolor('#0f1117')
    ax.plot(x, base(x), color='#2a3a50', lw=1, linestyle='--', alpha=0.5)
    ax.plot(x, y, color=color, lw=2.5)
    ax.axhline(0, color='#3a4060', lw=0.8)
    ax.axvline(0, color='#3a4060', lw=0.8)
    ax.set_ylim(-2.2, 2.2)
    ax.set_title(title, color=color, fontsize=10, pad=4)
    ax.tick_params(colors='#555')
    for sp in ax.spines.values():
        sp.set_color('#2a3050')

plt.suptitle('All six transformations — dashed grey is always the original f(x)',
             color='#5a7a90', fontsize=11, style='italic')
plt.tight_layout()
plt.show()
```

The dashed grey line in each panel is the original $f$. You can see the shift, compression, and reflections directly — and in every case the transformation is a composition with a simple inner or outer function.

---

## Reading a Complex Formula

$y = 2f(3x - 6) + 1$. What transformation is this?

Rewrite: $3x - 6 = 3(x - 2)$.

- $f(3(x - 2))$: horizontal compression by $3$, then shift right by $2$
- $2f(\ldots)$: vertical stretch by $2$
- $2f(\ldots) + 1$: shift up by $1$

You can read the transformation directly from the formula. No computing, no table-lookup.

> **Always rewrite** the inner function in the form $c(x - h)$ to separate the stretch ($c$) from the shift ($h$).

---

## Decomposing Functions into Parts

Any complicated function can be written as a composition of simpler ones. This decomposition reveals the structure of the function.

$h(x) = \sqrt{x^2 + 1}$: let $g(x) = x^2 + 1$ and $f(u) = \sqrt{u}$. Then $h = f \circ g$.

$h(x) = \sin(e^x)$: let $g(x) = e^x$ and $f(u) = \sin u$.

$h(x) = (3x + 1)^5$: let $g(x) = 3x + 1$ and $f(u) = u^5$.

This decomposition is not just organisational. It is exactly what the **chain rule** uses: when you differentiate $f(g(x))$, you need to know which part is the "outer" function $f$ and which is the "inner" function $g$. Understanding composition now means the chain rule in Phase 6 will feel like a natural next step, not a new formula.

---

## Stop and Think: Associativity

> Is composition associative? That is, does $(f \circ g) \circ h$ always equal $f \circ (g \circ h)$?

Think about what both sides mean: both say "apply $h$, then $g$, then $f$." The grouping only determines which composition you compute first — but the order of applying the functions is fixed by the notation. So yes, composition is always associative.

This means for any three functions $f$, $g$, $h$:
$$((f \circ g) \circ h)(x) = f(g(h(x))) = (f \circ (g \circ h))(x)$$

---

## Try It Yourself

**Challenge 1.** For each function, identify the inner function $g$ and outer function $f$ such that $h = f \circ g$:

- $h(x) = (x^2 + 1)^3$
- $h(x) = \sin(2x - \pi)$
- $h(x) = e^{-x^2}$
- $h(x) = \ln(\cos x)$

**Challenge 2.** The function $y = f(x)$ has: a zero at $x = -1$, a maximum at $x = 2$, a minimum at $x = 5$. Without knowing the formula, state the zeros, maxima, and minima of $y = f(2x - 4)$.

**Challenge 3.** Prove that composition is associative directly from the definition: show that $((f \circ g) \circ h)(x) = (f \circ (g \circ h))(x)$ for every $x$.

---

## What Comes Next

Phase 2 is complete. We have defined functions (M-008), their inverses (M-009), and how they compose (M-010).

Phase 3 begins with polynomials. You have been computing with polynomials for years — expanding, factoring, solving. M-011 reveals what polynomials *are* algebraically, why every polynomial over $\mathbb{R}$ factors into linear and quadratic pieces, and why the connection between roots and factors is not a coincidence but a theorem.
