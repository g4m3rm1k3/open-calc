# M-006 — Absolute Value, Distance, and Intervals

**Phase 1 · Algebra Rebuilt · Lesson 4 of 5**

---

There is one piece of notation that will appear in almost every definition in calculus:

$$|f(x) - L| < \varepsilon$$

You will see this in the definition of a limit. You will see it in the definition of convergence. You will see it in the definition of continuity. It is everywhere.

If you do not understand $|x|$, you will struggle with all of these. So let's build it properly — not as a "take away the minus sign if it's negative" rule, but as what it actually is: **distance**.

---

## Absolute Value Is Distance

$|x|$ is the distance from $x$ to $0$ on the number line.

That is the definition. Everything else follows from it.

$$|{-5}| = 5 \quad \text{(distance from -5 to 0 is 5)}$$
$$|3| = 3 \quad \text{(distance from 3 to 0 is 3)}$$
$$|0| = 0 \quad \text{(distance from 0 to itself is 0)}$$

The "remove the minus sign if negative" rule is a consequence, not the definition. It follows because distances are always non-negative.

**The extension:** $|x - y|$ is the distance from $x$ to $y$.

$$|5 - 2| = |3| = 3 \quad \text{(distance between 5 and 2 is 3)}$$
$$|{-1} - 3| = |{-4}| = 4 \quad \text{(distance between -1 and 3 is 4)}$$

This is not a coincidence. "Distance from $x$ to $y$" means "how far apart are $x$ and $y$", which equals $|x - y|$.

---

## Why This Matters for Calculus

The statement "$f(x)$ is within $\varepsilon$ of $L$" translates directly to:

$$|f(x) - L| < \varepsilon$$

"$x$ is within $\delta$ of $a$, but not equal to $a$" translates to:

$$0 < |x - a| < \delta$$

Once you see absolute value as distance, these symbols become transparent. They are just saying "the distance between two things is small." Get comfortable with this now.

---

## Three Equivalent Forms

The expression $|x - a| < \delta$ says exactly the same thing as the double inequality $a - \delta < x < a + \delta$, which is the interval $(a - \delta, a + \delta)$.

$$|x - 3| < 2 \;\iff\; 3 - 2 < x < 3 + 2 \;\iff\; x \in (1, 5)$$

```python
import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(3, 1, figsize=(10, 5))
fig.patch.set_facecolor('#0f1117')

configs = [
    {'a': 3,  'delta': 2,   'label': '|x − 3| < 2  means  x ∈ (1, 5)',    'color': '#4fc3f7'},
    {'a': 0,  'delta': 0.5, 'label': '|x| < 0.5  means  x ∈ (−0.5, 0.5)', 'color': '#ff9800'},
    {'a': -2, 'delta': 1,   'label': '|x + 2| < 1  means  x ∈ (−3, −1)',   'color': '#66bb6a'},
]

for ax, cfg in zip(axes, configs):
    ax.set_facecolor('#0f1117')
    ax.set_xlim(-6, 6)
    ax.set_ylim(-0.5, 0.7)
    ax.axis('off')

    # Number line
    ax.axhline(0, color='#3a4060', lw=1.5, xmin=0.05, xmax=0.95)
    for x in range(-5, 6):
        ax.plot(x, 0, '|', color='#333', ms=6)
        ax.text(x, -0.25, str(x), color='#555', fontsize=8.5, ha='center')

    # Interval
    lo, hi = cfg['a'] - cfg['delta'], cfg['a'] + cfg['delta']
    ax.plot([lo, hi], [0.1, 0.1], '-', color=cfg['color'], lw=4, solid_capstyle='butt')
    # Open endpoints
    for xp in [lo, hi]:
        ax.plot(xp, 0.1, 'o', color='#0f1117', ms=8, zorder=3)
        ax.plot(xp, 0.1, 'o', color=cfg['color'], ms=8, mfc='none', mew=2, zorder=4)
    # Center
    ax.plot(cfg['a'], 0, 's', color=cfg['color'], ms=6, alpha=0.7)
    ax.text(cfg['a'], 0.22, f'a = {cfg["a"]}', color=cfg['color'],
            fontsize=8, ha='center')
    # Label
    ax.text(-5.5, 0.45, cfg['label'], color=cfg['color'], fontsize=9.5, style='italic')

plt.suptitle('|x − a| < δ defines a symmetric interval around a (endpoints excluded)',
             color='#4a6a80', fontsize=10, style='italic', y=0.02)
plt.tight_layout()
plt.show()
```

The hollow circles at the endpoints mean the endpoints are **not included**. This is the open interval notation — more on intervals below.

---

## The Triangle Inequality

$$|a + b| \leq |a| + |b|$$

We proved this in M-004 from the ordering axioms. Here is the geometric picture of why it is true:

The distance from $0$ to $a + b$ is at most the distance from $0$ to $a$ plus the distance from $a$ to $a + b$. In other words: going from $0$ to $a$ and then moving by $b$ might be wasteful — you could be backtracking. The direct distance ($|a + b|$) is at most the total travel ($|a| + |b|$).

Equality holds exactly when $a$ and $b$ have the same sign — when you move in the same direction the whole time, no backtracking.

**The reverse triangle inequality** (equally useful):

$$\bigl||a| - |b|\bigr| \leq |a - b|$$

Proof: $|a| = |(a - b) + b| \leq |a - b| + |b|$, so $|a| - |b| \leq |a - b|$. By symmetry $|b| - |a| \leq |a - b|$. Together: $\bigl||a| - |b|\bigr| \leq |a - b|$. $\square$

---

## Interval Notation

Intervals are subsets of ℝ defined by inequalities. The notation encodes whether endpoints are included:

```python
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(10, 5.5))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_xlim(-0.5, 8.5)
ax.set_ylim(-0.5, 6.5)
ax.axis('off')

intervals = [
    (0.5, '(a, b)', 'Open', 'Both excluded', '#4fc3f7', 1, 5, False, False),
    (1.5, '[a, b]', 'Closed', 'Both included', '#ff9800', 1, 5, True, True),
    (2.5, '[a, b)', 'Half-open', 'Left included, right excluded', '#66bb6a', 1, 5, True, False),
    (3.5, '(a, b]', 'Half-open', 'Left excluded, right included', '#9c77db', 1, 5, False, True),
    (4.8, '(a, ∞)', 'Unbounded right', 'a not included, extends to +∞', '#ff7070', 1, 8, False, None),
    (5.8, '(-∞, b]', 'Unbounded left', 'b included, extends to -∞', '#70c0ff', 0.5, 5, None, True),
]

for (y, notation, name, desc, color, lo, hi, left_closed, right_closed) in intervals:
    # The line
    x_start = lo if lo > 0 else 0.2
    x_end   = hi if hi < 8 else 8.1
    ax.plot([x_start, x_end], [y, y], '-', color=color, lw=3.5,
            solid_capstyle='butt')

    # Endpoint markers
    if left_closed is not None:
        dot = 'o'
        fc = color if left_closed else ax.get_facecolor()
        ax.plot(lo, y, dot, color=color, ms=9,
                mfc=color if left_closed else '#0f1117', mew=2)
    if right_closed is not None:
        ax.plot(hi, y, 'o', color=color, ms=9,
                mfc=color if right_closed else '#0f1117', mew=2)

    # Arrow for unbounded
    if right_closed is None:  # unbounded right
        ax.annotate('', xy=(8.4, y), xytext=(7.8, y),
                    arrowprops=dict(arrowstyle='->', color=color, lw=2))
    if left_closed is None:   # unbounded left
        ax.annotate('', xy=(-0.2, y), xytext=(0.4, y),
                    arrowprops=dict(arrowstyle='->', color=color, lw=2))

    # Labels
    ax.text(-0.4, y, notation, color=color, fontsize=10.5, fontweight='bold',
            ha='right', va='center', fontfamily='monospace')
    ax.text(8.5, y, f'{name}: {desc}', color='#5a7a90', fontsize=8.5,
            va='center', style='italic')

ax.set_title('Interval notation — the square/round bracket tells you about the endpoint',
             color='#4a6a80', fontsize=10.5, style='italic', pad=8)
plt.tight_layout()
plt.show()
```

**The critical distinction:** $(a, b)$ (open) versus $[a, b]$ (closed) will matter enormously from Phase 5 onward.

The **Extreme Value Theorem** (Phase 6) says a continuous function on a *closed* bounded interval must achieve its maximum and minimum. On an *open* interval it need not: $f(x) = x$ on $(0, 1)$ approaches 1 but never reaches it.

The **Intermediate Value Theorem** works on closed intervals. Compactness (Phase 18) is a property that closed bounded intervals have, open intervals do not. The open/closed distinction is not aesthetic — it determines which theorems apply.

---

## Solving Absolute Value Inequalities

$|x - 3| < 2$ means the distance from $x$ to 3 is less than 2: $x \in (1, 5)$.

$|x - 3| > 2$ means the distance from $x$ to 3 is more than 2: $x < 1$ or $x > 5$.

In both cases, convert to distance language first, then to interval notation.

```python
# Verify absolute value inequality solutions

def check_abs_inequality(expr_fn, test_range, expected_fn, label):
    """expr_fn(x) is |f(x)| < c, expected_fn(x) is the expected interval condition."""
    errors = []
    xs = [i/100 for i in range(int(test_range[0]*100), int(test_range[1]*100))]
    for x in xs:
        in_abs = expr_fn(x)
        in_interval = expected_fn(x)
        if in_abs != in_interval:
            errors.append(x)
    if errors:
        print(f"  {label}: MISMATCH at {errors[:3]}")
    else:
        print(f"  {label}: all {len(xs)} test points match ✓")

print("Verifying absolute value interval equivalences:")
# |x - 3| < 2  ↔  x ∈ (1, 5)
check_abs_inequality(
    lambda x: abs(x - 3) < 2,
    (-5, 10),
    lambda x: 1 < x < 5,
    "|x - 3| < 2  ↔  (1, 5)"
)
# |x + 1| <= 3  ↔  x ∈ [-4, 2]
check_abs_inequality(
    lambda x: abs(x + 1) <= 3,
    (-10, 10),
    lambda x: -4 <= x <= 2,
    "|x + 1| ≤ 3  ↔  [-4, 2]"
)
# |x - 0| > 2  ↔  x < -2 or x > 2
check_abs_inequality(
    lambda x: abs(x) > 2,
    (-10, 10),
    lambda x: x < -2 or x > 2,
    "|x| > 2  ↔  x < -2 or x > 2"
)
```

---

## Try It Yourself

1. Write $|x - 5| < 3$ as an interval. Then write $|x - 5| > 3$ as a union of two intervals.

2. Prove that $|x^2 - a^2| = |x - a| \cdot |x + a|$. Use this to bound $|x^2 - 4|$ when $|x - 2| < 1$.
   *(This exact calculation appears in the epsilon-delta proof that $\lim_{x \to 2} x^2 = 4$.)*

3. The "closed" vs "open" interval distinction: give a function $f$ and an open interval $(a, b)$ such that $f$ is continuous on $(a, b)$ but does not achieve its maximum on $(a, b)$.

---

## What Comes Next

One more piece of infrastructure before we leave Phase 1: exponents. The rules for $a^m \cdot a^n = a^{m+n}$ and $(a^m)^n = a^{mn}$ seem like formulas to memorise. They are not — they follow from counting. And every extension (to zero, negative, fractional exponents) is forced by demanding the rules stay consistent. M-007 shows why $a^0 = 1$ is not a definition but the only coherent choice.
