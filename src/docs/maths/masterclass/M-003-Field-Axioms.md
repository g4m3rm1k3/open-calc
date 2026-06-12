# M-003 — Why Does Algebra Work?

**Phase 1 · Algebra Rebuilt · Lesson 1 of 5**

---

You have solved hundreds of equations. You know that if 2x = 10 then x = 5. You know that (-3)(-4) = 12. You know that you can add the same number to both sides of an equation.

But here is something almost nobody ever asked you: **why?**

Why can you "do the same thing to both sides"? Why is (-1)(-1) = 1 and not -1? Why is anything times zero equal to zero? These are not obvious. They are **theorems** — things that need to be proved — and they all follow from a list of just nine assumptions.

Today we build algebra from the ground up.

---

## The Question

Here's a question that turns out to be surprisingly deep: what is the *minimum* number of rules you need to assume before all of arithmetic and algebra follows?

The answer is nine. Nine simple statements, and everything else — subtraction, division, the rules for negative numbers, fractions, the quadratic formula — is a logical consequence.

Those nine statements are called the **field axioms**.

---

## The Nine Axioms

A field is any set of numbers with addition (+) and multiplication (×) satisfying these rules. We state them for ℝ (the real numbers), but they hold in ℚ, ℂ, and other systems too.

For all $a, b, c \in \mathbb{R}$:

**Addition:**

| Label | Rule | What it says |
|---|---|---|
| A1 | $a + b = b + a$ | Order of addition doesn't matter |
| A2 | $(a+b)+c = a+(b+c)$ | Grouping doesn't matter |
| A3 | There exists 0 with $a + 0 = a$ | Zero exists and does nothing |
| A4 | There exists $-a$ with $a + (-a) = 0$ | Every number has an opposite |

**Multiplication:**

| Label | Rule | What it says |
|---|---|---|
| M1 | $a \cdot b = b \cdot a$ | Order of multiplication doesn't matter |
| M2 | $(a \cdot b) \cdot c = a \cdot (b \cdot c)$ | Grouping doesn't matter |
| M3 | There exists 1 (≠ 0) with $a \cdot 1 = a$ | One exists and does nothing |
| M4 | For $a \neq 0$: there exists $a^{-1}$ with $a \cdot a^{-1} = 1$ | Every non-zero number has a reciprocal |

**The link between them:**

| Label | Rule | What it says |
|---|---|---|
| D1 | $a \cdot (b + c) = a \cdot b + a \cdot c$ | Multiplication distributes over addition |

**That is everything.** Subtraction ($a - b$) is not a ninth rule — it is just notation for $a + (-b)$. Division ($a \div b$) is notation for $a \cdot b^{-1}$. They are defined from the axioms above.

---

## Why This Matters

Before we derive anything, notice something remarkable: these nine statements do not say what the numbers *are*. They only say how the operations *behave*. This means every proof we write from these axioms will work automatically for *any* field — the rationals ℚ, the complex numbers ℂ, or even finite fields like ℤ/5ℤ (integers mod 5, which we meet in Phase 14). We prove once; it applies everywhere.

This is the power of abstraction. You are not learning rules for ℝ specifically. You are learning the rules for *any system where addition and multiplication make sense*.

---

## Deriving Real Algebra: Three Theorems

### Theorem 1: a × 0 = 0

This seems obvious. But "obvious" is not a proof. Let's prove it from the axioms.

**The move:** use A3 (zero is neutral for addition) and D1 (distributivity), then cancel.

**Proof:**

Start by using A3 backward: since $0 + 0 = 0$, we can write:

$$a \cdot 0 = a \cdot (0 + 0)$$

Apply distributivity D1:

$$= a \cdot 0 + a \cdot 0$$

So we have: $a \cdot 0 = a \cdot 0 + a \cdot 0$

Now add $-(a \cdot 0)$ to both sides (this exists by A4):

$$a \cdot 0 + (-(a \cdot 0)) = a \cdot 0 + a \cdot 0 + (-(a \cdot 0))$$
$$0 = a \cdot 0 + 0$$
$$0 = a \cdot 0 \quad \square$$

Every step cited an axiom. That is what a proof from first principles looks like.

---

### Theorem 2: (−1) × a = −a

This says that multiplying by −1 is the same as negating. It is *not* an axiom — it follows from the axioms.

**Proof:**

We want to show that $(-1) \cdot a$ satisfies the defining property of $-a$ (axiom A4): that it adds with $a$ to give zero.

$$a + (-1) \cdot a = 1 \cdot a + (-1) \cdot a \quad \text{(M3)}$$
$$= (1 + (-1)) \cdot a \quad \text{(D1 in reverse)}$$
$$= 0 \cdot a \quad \text{(A4: } 1 + (-1) = 0\text{)}$$
$$= 0 \quad \text{(Theorem 1, with roles of }a\text{ and }0\text{ switched)}$$

Since $a + (-1) \cdot a = 0$, and since the additive inverse is unique (provable from A1–A4), we have $(-1) \cdot a = -a$. $\square$

---

### Theorem 3: (−1)(−1) = 1

This is the "negative times negative is positive" rule. Here is why it *must* be true — not because someone decided so, but because the axioms force it.

Apply Theorem 2 with $a = -1$:

$$(-1)(-1) = -(-1)$$

What is $-(-1)$? It is the additive inverse of $-1$. The additive inverse of $-1$ is the number you add to $-1$ to get zero. That number is $+1$, since $-1 + 1 = 0$.

Therefore $(-1)(-1) = 1$. $\square$

**What this reveals:** If you tried to define $(-1)(-1) = -1$ instead, you would break distributivity D1. The axioms are not arbitrary — they form a tight logical system where each rule constrains all the others.

---

## Visualising the Logical Chain

These three theorems are not isolated facts. They are a chain: the axioms give Theorem 1, Theorem 1 gives Theorem 2, Theorem 2 gives Theorem 3.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch
import numpy as np

fig, ax = plt.subplots(figsize=(10, 6))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

# Node definitions: (x, y, text, color)
nodes = [
    (1.2, 5.0, 'A3\nzero exists', '#2a5070'),
    (1.2, 3.5, 'D1\ndistributivity', '#2a5070'),
    (1.2, 2.0, 'A4\ninverses exist', '#2a5070'),
    (1.2, 0.7, 'M3\none exists', '#2a5070'),
    (4.2, 4.2, 'Theorem 1\na·0 = 0', '#1e4a3a'),
    (7.0, 3.2, 'Theorem 2\n(−1)·a = −a', '#1e3a4a'),
    (9.2, 2.2, 'Theorem 3\n(−1)(−1) = 1', '#3a2a4a'),
]

def draw_node(ax, x, y, text, color, w=1.5, h=0.75):
    rect = mpatches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                    boxstyle='round,pad=0.08',
                                    facecolor=color, edgecolor='#4a6a80',
                                    linewidth=1.2)
    ax.add_patch(rect)
    ax.text(x, y, text, color='#c8d8e8', fontsize=8.5,
            ha='center', va='center', fontfamily='monospace',
            linespacing=1.5)

for (x, y, text, color) in nodes:
    draw_node(ax, x, y, text, color)

# Arrows: axioms → Theorem 1
arrow_style = dict(arrowstyle='->', color='#3a6080', lw=1.5)
for (ax_y, t_x, t_y) in [(5.0, 4.2, 4.2), (3.5, 4.2, 4.2), (2.0, 4.2, 4.2)]:
    ax.annotate('', xy=(t_x - 0.75, t_y), xytext=(1.95, ax_y),
                arrowprops=arrow_style)

# Theorem 1 → Theorem 2
ax.annotate('', xy=(7.0 - 0.75, 3.2), xytext=(4.95, 4.2),
            arrowprops=arrow_style)

# M3 → Theorem 2
ax.annotate('', xy=(7.0 - 0.75, 3.0), xytext=(1.95, 0.7),
            arrowprops=arrow_style)

# Theorem 2 → Theorem 3
ax.annotate('', xy=(9.2 - 0.75, 2.2), xytext=(7.75, 3.2),
            arrowprops=arrow_style)

ax.set_title('Nine axioms → every algebraic rule you have ever used',
             color='#4a6a80', fontsize=11, style='italic', y=0.02)
plt.tight_layout()
plt.show()
```

Every algebraic rule you have ever used sits somewhere in this chain. When you learned "you can multiply both sides of an equation by the same number," that is M4 (multiplicative inverses) combined with M2 (associativity). When you learned "combine like terms," that is D1 (distributivity). Nothing in algebra is arbitrary.

---

## What Subtraction and Division Really Are

**Subtraction is not a primitive operation.** It is defined:

$$a - b \;\stackrel{\text{def}}{=}\; a + (-b)$$

The symbol $a - b$ is notation. The underlying operation is always "add the additive inverse."

**Division is not a primitive operation.** It is defined:

$$a \div b \;\stackrel{\text{def}}{=}\; a \cdot b^{-1} \quad (b \neq 0)$$

**Why can't you divide by zero?** Axiom M4 only provides a multiplicative inverse for $a \neq 0$. For $a = 0$, no such inverse is guaranteed to exist. In fact, it cannot: if $0^{-1}$ existed, we would have $1 = 0 \cdot 0^{-1} = 0$ by Theorem 1, which contradicts M3 (which requires $1 \neq 0$). Division by zero is not "undefined" by convention. It is logically impossible in any field.

```python
# Verify the field axiom consequences numerically
# (Numerical checks are not proofs, but they confirm the algebra.)

test_values = [-3.5, -1, 0, 1, 2.7, 100]

print("Theorem 1: a × 0 = 0")
for a in test_values:
    result = a * 0
    print(f"  {a:6.1f} × 0 = {result}")

print()
print("Theorem 2: (-1) × a = -a")
for a in test_values:
    lhs = (-1) * a
    rhs = -a
    print(f"  (-1) × {a:6.1f} = {lhs:6.1f}   -a = {rhs:6.1f}   match: {lhs == rhs}")

print()
print("Theorem 3: (-1)(-1) = 1")
print(f"  (-1) × (-1) = {(-1)*(-1)}")

print()
print("Subtraction as addition of inverse:")
for (a, b) in [(5, 3), (-2, 7), (0, -4)]:
    sub  = a - b
    add  = a + (-b)
    print(f"  {a} - {b} = {sub},   {a} + (-{b}) = {add},   same: {sub == add}")
```

---

## A Deeper Look: Why the Axioms Are Not Arbitrary

You might wonder: why these nine axioms and not some other set? Why not add axioms, or use fewer?

Adding axioms makes the system stronger but less general — it would describe fewer things. Removing axioms makes it more general but weaker — you can prove less.

The field axioms are exactly the right strength for algebra. They are weak enough that many different systems satisfy them (ℚ, ℝ, ℂ, ℤ/pℤ), and strong enough that all of arithmetic follows.

One notable fact: ℤ (the integers) is *not* a field. It satisfies A1–A4, M1–M3, and D1, but *not* M4 — for example, 2 has no multiplicative inverse in ℤ (1/2 is not an integer). So ℤ is an almost-field, called a **ring**. We revisit this in Phase 17 (Abstract Algebra).

---

## Try It Yourself

**Challenge 1:** Prove that the additive identity (zero) is unique. That is, show that if $e$ satisfies $a + e = a$ for all $a$, then $e = 0$.

*Hint:* use the axiom A3 (zero exists) and apply the equation to $a = 0$.

**Challenge 2:** Prove that the additive inverse of $a$ is unique. That is, if both $b$ and $c$ satisfy $a + b = 0$ and $a + c = 0$, show $b = c$.

*Hint:* start with $a + b = 0$ and add $c$ to both sides.

```python
# Numerical illustration: uniqueness of the zero element
# If e1 and e2 are both additive identities, they must be equal.

# e1 + e2 = e1  (because e2 is an identity)
# e1 + e2 = e2  (because e1 is an identity)
# Therefore e1 = e2

# Check: what happens if we try two "identities"?
candidates = [0, 1e-15, 1e-100]   # 0 is the real identity; the others fail
a = 3.7
for e in candidates:
    identity_prop = abs(a + e - a) < 1e-10
    print(f"  a + {e} = a ? {identity_prop}   ({a} + {e} = {a + e})")
```

---

## What Comes Next

Axioms A1–A4 and M1–M4 and D1 describe how arithmetic works. But they say nothing about *size* — about which numbers are larger. The real numbers are not just a field; they are an **ordered** field. M-004 adds two more axioms that give us inequalities — and from those two axioms, every rule you know about inequalities follows.
