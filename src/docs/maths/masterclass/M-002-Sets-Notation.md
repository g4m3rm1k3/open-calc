# M-002 — Collections, Membership, and Why Mathematicians Need Precise Language

**Phase 0 · Mathematical Thinking · Lesson 3 of 3**

---

Here's a question that seems obvious until you think about it: what is the number 2?

Not "2 apples" or "2 centimetres." The abstract thing, the number itself. If you try to define it without using the word "two" or any synonym, you quickly discover you need a way to talk about *collections* of things. The number 2 is, in one precise formulation, the collection of all collections that have exactly two members.

This is why set theory is the foundation of mathematics. Not because mathematicians love abstraction, but because every mathematical object — numbers, functions, sequences, spaces — is ultimately defined in terms of sets.

---

## What a Set Is

A **set** is a collection of distinct objects. Two things and only two things define a set:
- Which objects belong to it
- Nothing else — no order, no repetition

So {1, 2, 3} and {3, 1, 2} are the same set. And {1, 1, 2, 3} is the same set as {1, 2, 3}.

We write $x \in A$ to mean "x is a member of A" and $x \notin A$ to mean "x is not."

---

## The Sets That Run the Whole Curriculum

Mathematics operates inside five nested collections, each one adding something the previous one was missing:

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

fig, ax = plt.subplots(figsize=(9, 6))
ax.set_facecolor('#0f1117')
fig.patch.set_facecolor('#0f1117')
ax.set_aspect('equal')
ax.set_xlim(-3.2, 3.2)
ax.set_ylim(-2.2, 2.2)

# Nested ellipses — largest first
sets = [
    ('ℂ  Complex',   3.0, 1.9, '#0a1520', '#2a4560'),
    ('ℝ  Real',      2.4, 1.5, '#0c1a28', '#2a5570'),
    ('ℚ  Rational',  1.8, 1.1, '#0e1e30', '#2a6570'),
    ('ℤ  Integer',   1.2, 0.75, '#101e30', '#2a7560'),
    ('ℕ  Natural',   0.65, 0.42, '#122030', '#3a8860'),
]

for (label, rx, ry, fill, edge) in sets:
    ellipse = patches.Ellipse((0, 0), 2*rx, 2*ry,
                               facecolor=fill, edgecolor=edge, linewidth=1.5)
    ax.add_patch(ellipse)
    ax.text(0, ry - 0.18, label,
            color=edge, fontsize=10, ha='center', va='top',
            fontfamily='monospace', fontweight='bold')

# Example numbers in each ring
examples = [
    ('1, 2, 3',   0,     0.10, '#3a8860'),   # ℕ interior
    ('−3, −1',   -0.15,  0.52, '#2a7560'),   # ℤ \ ℕ
    ('½, ¾',      0.3,   0.82, '#2a6570'),   # ℚ \ ℤ
    ('√2, π',     0.5,   1.18, '#2a5570'),   # ℝ \ ℚ
    ('2+3i',      0.7,   1.60, '#2a4560'),   # ℂ \ ℝ
]
for (label, x, y, color) in examples:
    ax.text(x, y, label, color=color, fontsize=9,
            ha='center', va='center', style='italic')

ax.text(0, -1.95, 'Each set is contained in all the larger ones:  ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ',
        color='#3a5070', fontsize=9.5, ha='center', style='italic')
ax.axis('off')
ax.set_title('The five number sets — each one adds something the previous one lacked',
             color='#4a6a80', fontsize=11, style='italic', pad=10)
plt.tight_layout()
plt.show()
```

| Symbol | Name | Contains | What it adds |
|---|---|---|---|
| ℕ | Natural | 1, 2, 3, … | Counting |
| ℤ | Integer | …, −2, −1, 0, 1, 2, … | Subtraction (negatives, zero) |
| ℚ | Rational | all fractions p/q | Division (except by zero) |
| ℝ | Real | all points on the number line | Completeness — no gaps |
| ℂ | Complex | a + bi for a, b ∈ ℝ | Square roots of negatives |

We will spend most of this curriculum in ℝ. Understanding why ℝ is different from ℚ — why it has "no gaps" — is one of the deepest questions we address (Phase 16).

---

## Set Operations — Four Ways to Combine Sets

Think of two sets as two overlapping circles. The four basic operations correspond to four regions:

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Circle
import numpy as np

fig, axes = plt.subplots(1, 4, figsize=(12, 3.5))
fig.patch.set_facecolor('#0f1117')

ops = [
    ('A ∪ B', 'Union:\nin A or B (or both)'),
    ('A ∩ B', 'Intersection:\nin both A and B'),
    ('A \\ B', 'Difference:\nin A, not in B'),
    ('Aᶜ',    'Complement:\nNOT in A\n(relative to universe)'),
]

# Circle parameters
cx1, cx2, cy, r = 0.38, 0.62, 0.5, 0.23

for ax, (title, desc) in zip(axes, ops):
    ax.set_facecolor('#0a1018')
    ax.set_xlim(0, 1)
    ax.set_ylim(-0.1, 1.0)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title(title, color='#7a9ab0', fontsize=13, fontweight='bold', pad=4)
    ax.text(0.5, -0.08, desc, color='#4a6880', fontsize=8.5,
            ha='center', va='top', style='italic')

    # ── Draw the highlighted region first (background), then circle outlines on top ──

    if title == 'A ∪ B':
        # Both circles filled
        for cx in [cx1, cx2]:
            c = Circle((cx, cy), r, facecolor='#1e4060', edgecolor='none')
            ax.add_patch(c)

    elif title == 'A ∩ B':
        # Approximate intersection: shade a small ellipse in the middle
        overlap = patches.Ellipse(((cx1+cx2)/2, cy), 0.18, 2*r*0.9,
                                   facecolor='#1e4060', edgecolor='none')
        ax.add_patch(overlap)

    elif title == 'A \\ B':
        # Left circle filled, then cover overlap with dark
        left = Circle((cx1, cy), r, facecolor='#1e4060', edgecolor='none')
        ax.add_patch(left)
        overlap = patches.Ellipse(((cx1+cx2)/2, cy), 0.18, 2*r*0.9,
                                   facecolor='#0a1018', edgecolor='none')
        ax.add_patch(overlap)

    elif title == 'Aᶜ':
        # Everything outside left circle: fill whole panel, then cover left circle
        bg = patches.Rectangle((0, -0.1), 1, 1.1, facecolor='#1e4060', edgecolor='none')
        ax.add_patch(bg)
        left = Circle((cx1, cy), r, facecolor='#0a1018', edgecolor='none')
        ax.add_patch(left)

    # Circle outlines on top
    for cx_c, label in [(cx1, 'A'), (cx2, 'B')]:
        c = Circle((cx_c, cy), r, facecolor='none', edgecolor='#3a6080', linewidth=1.8)
        ax.add_patch(c)
        label_x = cx_c - 0.14 if cx_c == cx1 else cx_c + 0.14
        ax.text(label_x, cy + r + 0.03, label, color='#5a8aaa',
                fontsize=11, fontweight='bold', ha='center')

fig.suptitle('Set operations — four regions of the Venn diagram',
             color='#4a6a80', fontsize=10, style='italic', y=1.02)
plt.tight_layout()
plt.show()
```

In Python, sets work exactly like this:

```python
A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}

print("A ∪ B =", A | B)       # union: in A or B
print("A ∩ B =", A & B)       # intersection: in both
print("A \\ B =", A - B)      # difference: in A, not B
print("B \\ A =", B - A)      # other direction

print()
print("3 ∈ A:", 3 in A)        # True
print("6 ∈ A:", 6 in A)        # False
```

**Change something:** try `A = {1, 2}` and `B = {2, 3, 4, 5, 6}`. Predict the intersection before running.

---

## Subsets and the Power Set

$A \subseteq B$ means every element of A is also in B. A is a **subset** of B.

The **power set** $\mathcal{P}(A)$ is the set of all subsets of A. For {1, 2, 3}:

$$\mathcal{P}(\{1,2,3\}) = \{\emptyset,\, \{1\},\, \{2\},\, \{3\},\, \{1,2\},\, \{1,3\},\, \{2,3\},\, \{1,2,3\}\}$$

Eight subsets. For $n$ elements: $2^n$ subsets — for each element, independently include it or not (two choices, $n$ times).

```python
from itertools import combinations

def power_set(s):
    lst = sorted(s)
    return [set(combo) for r in range(len(lst)+1) for combo in combinations(lst, r)]

for A in [{1,2,3}, {1,2,3,4}]:
    ps = power_set(A)
    print(f"|P({{{','.join(map(str,sorted(A)))}}})| = {len(ps)}  (= 2^{len(A)})")
    if len(A) == 3:
        for s in ps:
            print(" ", s if s else "∅")
```

Why does this matter? In Phase 13 (Combinatorics), counting subsets is the key technique behind $\binom{n}{k}$. In Phase 18 (Topology), a topology is literally defined as a special collection of subsets of a set.

---

## The Cartesian Product

$A \times B$ is the set of all **ordered pairs** $(a, b)$ with $a \in A$ and $b \in B$:

$$\{1, 2\} \times \{x, y, z\} = \{(1,x),\, (1,y),\, (1,z),\, (2,x),\, (2,y),\, (2,z)\}$$

The plane $\mathbb{R}^2 = \mathbb{R} \times \mathbb{R}$ is a Cartesian product — every point is an ordered pair $(x, y)$.

And here is the payoff: a **function** $f: A \to B$ is formally a subset of $A \times B$ with the property that each $a$ appears exactly once as the first element of a pair. That is where we go in Phase 2.

---

## De Morgan's Laws

$$\overline{A \cup B} = \bar{A} \cap \bar{B}$$
$$\overline{A \cap B} = \bar{A} \cup \bar{B}$$

In English: "not (A or B)" = "not A and not B." Look at the Venn diagram — if a point is outside both circles, it is outside the union. Obvious once you see it.

```python
U = set(range(1, 11))   # universe {1..10}
A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}

# Law 1: complement of union = intersection of complements
print("De Morgan 1: comp(A∪B) = comp(A) ∩ comp(B)")
print("  LHS:", sorted(U - (A | B)))
print("  RHS:", sorted((U - A) & (U - B)))
print("  Equal:", U - (A | B) == (U - A) & (U - B))

# Law 2: complement of intersection = union of complements
print("\nDe Morgan 2: comp(A∩B) = comp(A) ∪ comp(B)")
print("  LHS:", sorted(U - (A & B)))
print("  RHS:", sorted((U - A) | (U - B)))
print("  Equal:", U - (A & B) == (U - A) | (U - B))
```

These come up constantly in: logical proofs (where you negate compound conditions), programming (`not (a or b)` equals `not a and not b`), and circuit design (NAND/NOR gates are the hardware implementation of De Morgan).

---

## Try It Yourself

1. **Prove** (not just verify) that $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$. Draw a three-circle Venn diagram and shade both sides.

2. A set has 6 elements. How many subsets contain *exactly* 3 elements? How many contain *at least* one element?

3. In Python: create `A = {n for n in range(1, 20) if n % 2 == 0}` and `B = {n for n in range(1, 20) if n % 3 == 0}`. Predict $A \cap B$ before running — what numbers are both even AND divisible by 3?

---

## What Comes Next

Phase 1 starts with one question: why does algebra work? You have solved equations for years, but have you ever wondered why the rules are the rules? Why does multiplying both sides of an equation by the same number preserve equality? Why is "negative times negative = positive" true rather than just asserted? M-003 derives all of algebra from nine statements — the field axioms — and nothing is taken on faith.
