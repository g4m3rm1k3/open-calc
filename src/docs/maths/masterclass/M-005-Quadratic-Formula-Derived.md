# M-005 — The Quadratic Formula, Derived From Scratch

**Phase 1 · Algebra Rebuilt · Lesson 3 of 5**

---

You almost certainly know the quadratic formula. If $ax^2 + bx + c = 0$ and $a \neq 0$, then:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

You may have memorised it with a song, or drilled it until it was automatic. But here is something worth asking: where did it come from? Is it a formula someone discovered by intuition, or is it one that any sufficiently patient person could derive from scratch, using nothing but the algebra we have already built?

The answer is the latter — and the derivation reveals something the formula hides: there is a *geometric idea* at its heart. Once you see that idea, the formula stops feeling like a mystery and starts feeling inevitable.

---

## Two Equations, One Hard

Start with two quadratic equations:

$$x^2 + 6x + 5 = 0 \qquad \text{and} \qquad x^2 + 6x + 7 = 0$$

The first one is easy. Factor it: $(x+1)(x+5) = 0$, so $x = -1$ or $x = -5$. Done.

The second one resists factoring. Can you find two numbers that multiply to $7$ and add to $6$? Try: $1 \times 7 = 7$, but $1 + 7 = 8 \neq 6$. Try other pairs: nothing works cleanly. The equation *is* solvable — the solutions exist — but factoring does not reach them easily.

Why does the first equation yield to factoring while the second doesn't? And how would you solve the second one if factoring fails?

---

## Stop and Think: What Do You Wish Were True?

Before reading on, stare at the second equation: $x^2 + 6x + 7 = 0$.

The problem is the constant $7$. If it were $9$ instead, something nice would happen: $x^2 + 6x + 9 = (x+3)^2$. You'd have $(x+3)^2 = 0$, so $x = -3$. Easy.

If it were $0$: $x^2 + 6x = 0$, so $x(x+6) = 0$, giving $x = 0$ or $x = -6$. Also easy.

But $7$ isn't $9$. What if you could *turn* the $7$ into a $9$ — at the cost of adjusting the right-hand side to compensate?

---

## The Geometric Idea: Completing the Square

Here is where the geometry comes in. Think of $x^2$ as the area of a square with side length $x$. Think of $6x$ as the area of a rectangle with sides $x$ and $6$.

Place them together: a square of area $x^2$, and a rectangle of area $6x$. The rectangle is long and thin — it doesn't fit neatly against the square. But if you *cut the rectangle in half* and attach one half to the right side of the square and one half to the top, you get an L-shape that is almost a larger square. It is an $(x+3) \times (x+3)$ square with one small corner — a $3 \times 3$ square — missing from the top right.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(6, 6))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_xlim(-0.3, 5.8)
ax.set_ylim(-0.3, 5.8)
ax.set_aspect('equal')
ax.axis('off')

x_val, h = 2.5, 3.0

# x^2 square (bottom left)
ax.add_patch(patches.Rectangle((0,0), x_val, x_val,
    lw=2, edgecolor='#4fc3f7', facecolor='#0d2535'))
ax.text(x_val/2, x_val/2, '$x^2$', color='#4fc3f7',
        fontsize=14, ha='center', va='center', fontweight='bold')

# Right rectangle: x tall, 3 wide
ax.add_patch(patches.Rectangle((x_val,0), h, x_val,
    lw=2, edgecolor='#ff9800', facecolor='#2a1800'))
ax.text(x_val + h/2, x_val/2, '$3x$', color='#ff9800',
        fontsize=12, ha='center', va='center')

# Top rectangle: 3 tall, x wide
ax.add_patch(patches.Rectangle((0, x_val), x_val, h,
    lw=2, edgecolor='#ff9800', facecolor='#2a1800'))
ax.text(x_val/2, x_val + h/2, '$3x$', color='#ff9800',
        fontsize=12, ha='center', va='center')

# Missing corner: 3 by 3
ax.add_patch(patches.Rectangle((x_val, x_val), h, h,
    lw=2, edgecolor='#8a6aaa', facecolor='#1a0a2a', linestyle='--'))
ax.text(x_val + h/2, x_val + h/2, '$9$\n(add this)', color='#8a6aaa',
        fontsize=10, ha='center', va='center')

ax.text(x_val/2, -0.2, '$x$', color='#4fc3f7', fontsize=12, ha='center')
ax.text(x_val + h/2, -0.2, '$3$', color='#ff9800', fontsize=12, ha='center')
ax.text(-0.2, x_val/2, '$x$', color='#4fc3f7', fontsize=12, ha='center', va='center')
ax.text(-0.2, x_val + h/2, '$3$', color='#ff9800', fontsize=12, ha='center', va='center')

ax.set_title(r'$x^2 + 6x + 9 = (x+3)^2$ — adding the missing corner completes the square',
             color='#5a7a90', fontsize=10, style='italic', pad=10)
plt.tight_layout()
plt.show()
```

The diagram makes the algebra visible. The full $(x+3)^2$ square has area $x^2 + 3x + 3x + 9 = x^2 + 6x + 9$. The L-shape alone has area $x^2 + 6x$. The difference is the missing $3 \times 3 = 9$ corner. So:

$$x^2 + 6x = (x+3)^2 - 9$$

This is **completing the square** — we literally found the missing piece that turns the L-shape into a complete square. The name is geometric, not metaphorical.

---

## Solving the Hard Equation

Now go back to $x^2 + 6x + 7 = 0$. Replace $x^2 + 6x$ with $(x+3)^2 - 9$:

$$(x+3)^2 - 9 + 7 = 0$$
$$(x+3)^2 = 2$$

Take the square root of both sides. Both $+\sqrt{2}$ and $-\sqrt{2}$ are valid, since $(\sqrt{2})^2 = (-\sqrt{2})^2 = 2$:

$$x + 3 = \pm\sqrt{2}$$
$$x = -3 \pm \sqrt{2}$$

Two solutions: $x = -3 + \sqrt{2} \approx -1.586$ and $x = -3 - \sqrt{2} \approx -4.414$.

```python
import math
for sign in [+1, -1]:
    x = -3 + sign * math.sqrt(2)
    check = x**2 + 6*x + 7
    print(f"x = -3 {'+' if sign>0 else '-'} √2 ≈ {x:.6f}:   x²+6x+7 = {check:.2e}")
```

Both give (essentially) zero. The method works.

---

## Stop and Think: Generalising to Any Quadratic

You just completed the square for $x^2 + 6x$, where the coefficient of $x$ was $6$. Half of $6$ is $3$, and you added $3^2 = 9$.

Now try this before reading on. Suppose the coefficient of $x$ is $p$ instead of $6$. What would you add to $x^2 + px$ to complete the square? What perfect square would you get? And if you add that piece to both sides of an equation, what do you subtract to compensate?

Work it out for $p = 10$, then for $p = 1$, then for a general $p$. The pattern is short.

---

## Deriving the General Formula

Take the general quadratic $ax^2 + bx + c = 0$ with $a \neq 0$.

**Step 1. Divide through by $a$.**

$$x^2 + \frac{b}{a}x + \frac{c}{a} = 0$$

We can divide by $a$ because $a \neq 0$ (axiom M4 from M-003 gives every nonzero number a reciprocal).

**Step 2. Move the constant to the right.**

$$x^2 + \frac{b}{a}x = -\frac{c}{a}$$

**Step 3. Complete the square.**

The coefficient of $x$ is $\frac{b}{a}$, so we add $\left(\frac{b}{2a}\right)^2$ to both sides:

$$x^2 + \frac{b}{a}x + \left(\frac{b}{2a}\right)^2 = -\frac{c}{a} + \frac{b^2}{4a^2}$$

The left side is now a perfect square. The right side simplifies (putting both fractions over $4a^2$):

$$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}$$

**Step 4. Take the square root.**

The denominator $4a^2 = (2a)^2$ is always positive (M-004: every square is non-negative, and $2a \neq 0$). So:

$$x + \frac{b}{2a} = \pm\frac{\sqrt{b^2 - 4ac}}{2a} \qquad \text{(provided } b^2 - 4ac \geq 0\text{)}$$

**Step 5. Solve for $x$.**

$$\boxed{x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}}$$

Every step was a consequence of axioms and theorems already proved. The formula did not arrive from nowhere — it was forced.

---

## The Discriminant: One Number, Three Destinies

The expression $b^2 - 4ac$ beneath the square root is called the **discriminant** — from the Latin *discriminare*, to distinguish or separate. You can hear the same root in "discrimination" (making distinctions) or "discerning" (seeing differences clearly). Mathematicians borrowed it because this single number *distinguishes* the three fundamentally different behaviours a quadratic can have:

M-004 proved that every square of a real number is non-negative. So $\sqrt{b^2 - 4ac}$ is only real when $b^2 - 4ac \geq 0$. Three cases:

**$b^2 - 4ac > 0$:** the square root is a positive real number. Adding and subtracting it give two distinct values — two distinct real roots.

**$b^2 - 4ac = 0$:** the square root is zero, so $\pm 0 = 0$. One value: $x = -b/2a$, called a **repeated root**.

**$b^2 - 4ac < 0$:** we would need the square root of a negative number. M-004's theorem ($a^2 \geq 0$ for all real $a$) makes this impossible in $\mathbb{R}$. No real solutions exist. (They do exist in $\mathbb{C}$ — M-012 will show that they come as a conjugate pair $-b/2a \pm i\sqrt{4ac-b^2}/2a$.)

```python
import numpy as np
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 3, figsize=(12, 4))
fig.patch.set_facecolor('#0f1117')

cases = [
    (1, -3, 1,  'Two real roots\n$b^2-4ac = 5$',    '#4fc3f7'),
    (1, -2, 1,  'One repeated root\n$b^2-4ac = 0$',  '#ff9800'),
    (1, -1, 2,  'No real roots\n$b^2-4ac = -7$',     '#e05060'),
]
x = np.linspace(-1, 4, 400)

for ax, (a, b, c, title, color) in zip(axes, cases):
    ax.set_facecolor('#0f1117')
    ax.plot(x, a*x**2 + b*x + c, color=color, lw=2.5)
    ax.axhline(0, color='#3a4060', lw=1)
    disc = b**2 - 4*a*c
    if disc > 0:
        for s in [+1, -1]:
            ax.plot((-b + s*np.sqrt(disc))/(2*a), 0, 'o', color=color, ms=8)
    elif disc == 0:
        ax.plot(-b/(2*a), 0, 'o', color=color, ms=8)
    ax.set_ylim(-2, 5)
    ax.set_title(title, color=color, fontsize=9, pad=6)
    for sp in ax.spines.values():
        sp.set_color('#2a3050')
    ax.tick_params(colors='#555')

fig.suptitle('The discriminant determines how many times the parabola crosses the $x$-axis',
             color='#5a7a90', fontsize=11, style='italic')
plt.tight_layout()
plt.show()
```

The three parabolas make it concrete. The connection to M-004 is worth pausing on: the "no real roots" parabola never touches the $x$-axis because its minimum value is positive. That minimum is positive because of how $a$, $b$, $c$ combine — and the discriminant is precisely the algebraic expression that captures whether the parabola has room to dip below zero or not.

---

## Vieta's Formulas: What the Roots Know About the Coefficients

If $r$ and $s$ are the two roots of $ax^2 + bx + c = 0$, then from the quadratic formula:

$$r + s = \frac{-b + \sqrt{b^2-4ac}}{2a} + \frac{-b - \sqrt{b^2-4ac}}{2a} = \frac{-2b}{2a} = -\frac{b}{a}$$

$$r \cdot s = \frac{-b + \sqrt{b^2-4ac}}{2a} \cdot \frac{-b - \sqrt{b^2-4ac}}{2a} = \frac{(-b)^2 - (b^2-4ac)}{4a^2} = \frac{4ac}{4a^2} = \frac{c}{a}$$

These are called **Vieta's formulas**, after François Viète, a 16th-century French mathematician who developed much of the modern notation for algebra. The formulas say something elegant: you don't need to know the roots individually to know their sum and product. The coefficients carry that information directly.

This has a useful consequence. If you are told $x^2 - 5x + 6 = 0$, you know without solving that the roots sum to $5$ and multiply to $6$. A quick search for two numbers with sum $5$ and product $6$ gives $2$ and $3$. Factoring and the quadratic formula are two different routes to the same information.

---

## Try It Yourself

**Challenge 1.** Derive the solutions to $3x^2 - 7x + 2 = 0$ by completing the square — not by plugging into the formula. Show each step.

**Challenge 2.** For what values of $k$ does $x^2 + kx + 4 = 0$ have exactly one real solution? Solve for $k$.

**Challenge 3.** The formula divides by $2a$. What happens if $a = 0$? Is $0 \cdot x^2 + bx + c = 0$ still a quadratic? What is it, and how is it solved?

**Challenge 4.** Without solving explicitly, find the sum and product of the roots of $2x^2 + 3x - 5 = 0$ using Vieta's formulas. Then verify by solving the equation.

---

## What Comes Next

M-006 introduces absolute value — not as a definition involving cases ("if $x \geq 0$, then $|x| = x$; otherwise $|x| = -x$"), but as a concept: the *distance* from a number to zero on the number line. Distance turns out to be a more powerful way to think about it, because it immediately generalises — to the distance between two numbers, to intervals, and eventually to the core language of limits and continuity in Phase 5.
