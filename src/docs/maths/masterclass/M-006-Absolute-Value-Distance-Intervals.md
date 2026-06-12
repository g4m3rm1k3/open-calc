# M-006 — Absolute Value, Distance, and Intervals

**Phase 1 · Algebra Rebuilt · Lesson 4 of 5**

---

Here is the piece of notation you will see in almost every definition in calculus:

$$|f(x) - L| < \varepsilon$$

It is in the definition of a limit. It is in the definition of continuity. It is in the definition of convergence of sequences and series. If you cannot read it fluently, every definition in Phase 5 and beyond will feel like a wall of symbols.

So before any of that: what does $|x|$ actually mean?

---

## The Definition That Makes Everything Else Make Sense

Most algebra courses define absolute value like this: if $x \geq 0$, then $|x| = x$; otherwise $|x| = -x$. This is technically correct, but it is the wrong way to think about it. It teaches you an algorithm (check the sign, maybe negate) rather than a concept.

The concept is this: **$|x|$ is the distance from $x$ to $0$ on the number line.**

That is the definition. The case formula is just a consequence — distances are always non-negative, so if $x$ is already non-negative it equals its own distance, and if $x$ is negative you flip the sign to get a positive distance.

$$|-5| = 5 \quad \text{distance from } -5 \text{ to } 0 \text{ is } 5$$
$$|3| = 3 \quad \text{distance from } 3 \text{ to } 0 \text{ is } 3$$
$$|0| = 0 \quad \text{distance from } 0 \text{ to itself is } 0$$

Now here is the key extension. **$|x - y|$ is the distance from $x$ to $y$.**

Why? Because subtracting $y$ slides the whole number line so that $y$ sits at zero. The distance between $x$ and $y$ is the same as the distance between $x - y$ and $0$, which is $|x - y|$.

$$|5 - 2| = |3| = 3 \quad \text{distance between 5 and 2 is 3}$$
$$|-1 - 3| = |-4| = 4 \quad \text{distance between } -1 \text{ and } 3 \text{ is } 4$$

---

## Stop and Think

Before reading on, try to translate these two sentences into absolute value notation using only the idea of distance:

> 1. "$x$ is within 2 units of 5."
> 2. "$x$ and $y$ are more than 3 units apart."

*(Take 60 seconds. The notation is just a direct translation of the English.)*

---

The translations:

1. "$x$ is within 2 units of 5" means the distance from $x$ to 5 is less than 2: $|x - 5| < 2$.

2. "$x$ and $y$ are more than 3 units apart" means the distance between them exceeds 3: $|x - y| > 3$.

Now look at the calculus notation again:

> $|f(x) - L| < \varepsilon$ means "$f(x)$ is within $\varepsilon$ units of $L$."
> $0 < |x - a| < \delta$ means "$x$ is within $\delta$ units of $a$, but not equal to $a$."

These are distance statements. Nothing more. Every limit definition, every continuity proof, every convergence argument is built from this one idea.

---

## The Three Equivalent Forms

The distance condition $|x - a| < \delta$ can be written three different ways, all meaning exactly the same thing:

$$|x - a| < \delta \quad\iff\quad a - \delta < x < a + \delta \quad\iff\quad x \in (a - \delta,\; a + \delta)$$

The first form is distance notation. The second is a double inequality. The third uses **interval notation** — a shorthand for the set of all real numbers between two bounds. The round brackets $($ and $)$ mean the endpoints are *not* included (the distance is *strictly* less than $\delta$, not equal to it).

```python
import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(3, 1, figsize=(10, 5))
fig.patch.set_facecolor('#0f1117')

configs = [
    {'a': 3,  'd': 2,   'label': '|x − 3| < 2  means  x ∈ (1, 5)',     'color': '#4fc3f7'},
    {'a': 0,  'd': 0.5, 'label': '|x| < 0.5  means  x ∈ (−0.5, 0.5)',  'color': '#ff9800'},
    {'a': -2, 'd': 1,   'label': '|x + 2| < 1  means  x ∈ (−3, −1)',    'color': '#66bb6a'},
]

for ax, cfg in zip(axes, configs):
    ax.set_facecolor('#0f1117')
    ax.set_xlim(-6, 6)
    ax.set_ylim(-0.5, 0.7)
    ax.axis('off')
    ax.axhline(0, color='#3a4060', lw=1.5, xmin=0.05, xmax=0.95)
    for x in range(-5, 6):
        ax.plot(x, 0, '|', color='#333', ms=6)
        ax.text(x, -0.25, str(x), color='#555', fontsize=8.5, ha='center')
    lo, hi = cfg['a'] - cfg['d'], cfg['a'] + cfg['d']
    ax.plot([lo, hi], [0.1, 0.1], '-', color=cfg['color'], lw=4, solid_capstyle='butt')
    for xp in [lo, hi]:
        ax.plot(xp, 0.1, 'o', color='#0f1117', ms=8, zorder=3)
        ax.plot(xp, 0.1, 'o', color=cfg['color'], ms=8, mfc='none', mew=2, zorder=4)
    ax.plot(cfg['a'], 0, 's', color=cfg['color'], ms=6, alpha=0.7)
    ax.text(cfg['a'], 0.22, f'centre a = {cfg["a"]}', color=cfg['color'], fontsize=8, ha='center')
    ax.text(-5.5, 0.45, cfg['label'], color=cfg['color'], fontsize=9.5, style='italic')

plt.suptitle('|x − a| < δ  is a symmetric open interval of radius δ around a',
             color='#4a6a80', fontsize=10, style='italic', y=0.02)
plt.tight_layout()
plt.show()
```

The hollow circles at the endpoints mean the endpoints are **not included** — the condition is strict.

---

## Interval Notation — Earning the Square Bracket

Why does the notation use round brackets for "not included" and square brackets for "included"? Historical convention, but the key thing to understand is *why the distinction matters at all*.

Consider two intervals: all $x$ with $0 < x < 1$ (not including the endpoints) versus all $x$ with $0 \leq x \leq 1$ (including the endpoints). As sets of points they are nearly identical — just two extra boundary points separate them. But their *mathematical behaviour* is completely different.

On the closed interval $[0, 1]$, any continuous function is guaranteed to achieve its maximum and minimum values somewhere inside. On the open interval $(0, 1)$, no such guarantee exists: the function $f(x) = x$ is continuous on $(0, 1)$ and approaches 1, but never reaches it.

The square bracket $[$ means "this endpoint is part of the set." The round bracket $($ means "we approach but never include." Mathematicians use **closed** for "endpoints included" (the set is *closed*, it contains its boundary) and **open** for "endpoints excluded" (the set has no boundary points in it).

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 5.5))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_xlim(-0.5, 8.5)
ax.set_ylim(-0.5, 6.5)
ax.axis('off')

intervals = [
    ('(a, b)',   'Open',          'Both endpoints excluded',           '#4fc3f7', 1, 5, False, False),
    ('[a, b]',   'Closed',        'Both endpoints included',           '#ff9800', 1, 5, True,  True ),
    ('[a, b)',   'Half-open',     'Left included, right excluded',     '#66bb6a', 1, 5, True,  False),
    ('(a, b]',   'Half-open',     'Left excluded, right included',     '#9c77db', 1, 5, False, True ),
    ('(a, ∞)',   'Unbounded right','a excluded, extends right forever','#ff7070', 1, 8, False, None ),
    ('(−∞, b]',  'Unbounded left', 'b included, extends left forever', '#70c0ff', 0.5, 5, None, True ),
]

for i, (notation, name, desc, color, lo, hi, lc, rc) in enumerate(intervals):
    y = 6 - i * 0.9
    xs = lo if lo > 0 else 0.2
    xe = hi if hi < 8 else 8.1
    ax.plot([xs, xe], [y, y], '-', color=color, lw=3.5, solid_capstyle='butt')
    if lc is not None:
        ax.plot(lo, y, 'o', color=color, ms=9, mfc=color if lc else '#0f1117', mew=2)
    if rc is not None:
        ax.plot(hi, y, 'o', color=color, ms=9, mfc=color if rc else '#0f1117', mew=2)
    if rc is None:
        ax.annotate('', xy=(8.4, y), xytext=(7.8, y),
                    arrowprops=dict(arrowstyle='->', color=color, lw=2))
    if lc is None:
        ax.annotate('', xy=(-0.2, y), xytext=(0.4, y),
                    arrowprops=dict(arrowstyle='->', color=color, lw=2))
    ax.text(-0.4, y, notation, color=color, fontsize=10.5,
            fontweight='bold', ha='right', va='center', fontfamily='monospace')
    ax.text(8.5, y, f'{name}  —  {desc}', color='#5a7a90',
            fontsize=8.5, va='center', style='italic')

ax.set_title('Interval notation — [ ] means endpoint included,  ( ) means excluded',
             color='#4a6a80', fontsize=10.5, style='italic', pad=8)
plt.tight_layout()
plt.show()
```

The open/closed distinction is not aesthetic. The **Extreme Value Theorem** in Phase 6 holds on closed bounded intervals and can fail on open ones. The **Intermediate Value Theorem** requires a closed interval. **Compactness** in Phase 18 is precisely the property that closed bounded intervals have and open intervals lack. The bracket you write now determines which theorems apply later.

---

## Stop and Think: Solving Absolute Value Inequalities

Try these before reading the solution:

> $|2x - 6| < 4$. What values of $x$ satisfy this?

Think of it as a distance statement: "the distance from $2x$ to $6$ is less than $4$." Or rewrite: "the distance from $x$ to $3$ is less than $2$" (divide everything by 2). That gives $x \in (1, 5)$.

> $|x + 1| \geq 3$. What values of $x$ satisfy this?

"The distance from $x$ to $-1$ is at least 3." So $x \leq -4$ or $x \geq 2$.

The pattern: $|x - a| < r$ gives a single interval $(a - r, a + r)$. $|x - a| > r$ gives two rays pointing outward from $a$.

```python
a, r = 3, 2
print(f"|x - {a}| < {r}  means  x ∈ ({a-r}, {a+r})")
print(f"|x - {a}| > {r}  means  x < {a-r}  or  x > {a+r}")

# Verify with a test value
x_inside = 4
x_outside = 0
print(f"\nx = {x_inside}: |{x_inside}-{a}| = {abs(x_inside-a)},  inside? {abs(x_inside-a) < r}")
print(f"x = {x_outside}: |{x_outside}-{a}| = {abs(x_outside-a)}, outside? {abs(x_outside-a) > r}")
```

---

## The Triangle Inequality — Revisited as Distance

In M-004 we proved $|a + b| \leq |a| + |b|$ from the ordering axioms. Here is why it is geometrically obvious.

Think of $a$ and $b$ as two steps along a road. $|a|$ is the length of the first step, $|b|$ is the length of the second. $|a + b|$ is how far you end up from where you started. If you walk 3 steps right then 3 steps left, your total walking distance is $|a| + |b| = 6$ but your displacement is $|a + b| = 0$. You can never end up farther from the start than the total distance walked.

The most useful form for calculus:

$$|a - b| \leq |a - c| + |c - b|$$

In English: the distance from $a$ to $b$ is at most the distance from $a$ to $c$ plus the distance from $c$ to $b$. This is the literal triangle inequality — the straight-line path is never longer than the detour via $c$. Every limit proof that bounds an error $|f(x) - L|$ uses this form.

---

## Try It Yourself

**Challenge 1.** Write each of the following as an interval, then sketch it on a number line:

- $|x - 7| \leq 4$
- $|2x + 1| < 5$
- $|x| > 3$

**Challenge 2.** Prove that $|x^2 - 4| = |x - 2| \cdot |x + 2|$. Then: if $|x - 2| < 1$, show that $|x + 2| < 5$, and therefore $|x^2 - 4| < 5|x - 2|$.

*(This exact step appears in the epsilon-delta proof that $\lim_{x \to 2} x^2 = 4$ — you have just done the hard part of that proof without knowing it.)*

**Challenge 3.** Give a continuous function on $(0, 1)$ that does not achieve its maximum. Give a continuous function on $(0, 1)$ that does not achieve its minimum. Then explain why both examples fail on $[0, 1]$ instead.

---

## What Comes Next

One more piece of infrastructure before Phase 2: exponents. The rules $a^m \cdot a^n = a^{m+n}$ and $(a^m)^n = a^{mn}$ feel like things to memorise. They are not — they follow directly from counting repeated multiplication. And every extension (to $a^0$, to $a^{-n}$, to $a^{1/2}$) is not defined arbitrarily but *forced* by demanding the counting rules stay consistent. M-007 shows why $a^0 = 1$ is the only coherent choice.
