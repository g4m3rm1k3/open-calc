# Stage 0, Lesson 0.4 — Ordered Pairs and the Cartesian Plane
**Threads:** Math · CS · Physics  
**Estimated time:** 45–60 minutes

---

## What This Lesson Is About

A set has no order — $\{1, 2\}$ and $\{2, 1\}$ are the same set. But many
things we care about come with a natural order: the position of a point
on a screen has a horizontal coordinate and a vertical coordinate, and
swapping them gives a different point entirely. A database record has fields
that must stay in the right slots. A function call has arguments in a specific
sequence. This lesson introduces the **ordered pair** — the simplest object
in mathematics that carries sequence — and the **Cartesian product**, which
combines two sets into a collection of all possible ordered pairs from them.
The Cartesian product of $\mathbb{R}$ with itself is the coordinate plane
you have drawn on since school, now given its proper mathematical definition.
By the end of this lesson you will understand what a coordinate system
actually is, be able to compute distances and midpoints from the definition
upward, and see why every 2D position in a program, a game, or an engineering
drawing is a point in $\mathbb{R}^2$.

---

## Historical Context

René Descartes published *La Géométrie* in 1637, introducing the coordinate
system that now bears his name. The legend — probably embellished — is that
he invented it while watching a fly on his bedroom ceiling, realising its
position could be described by two numbers: its distance from each wall.
The deep insight was that algebra and geometry, previously separate subjects,
could be unified: geometric shapes become equations, and equations become
curves. This unification, now called **analytic geometry**, made calculus
possible — Newton and Leibniz needed Descartes' coordinates to describe
motion mathematically. The "Cartesian" in Cartesian product and Cartesian
plane both honour Descartes' Latinised name, *Cartesius*.

---

## What You Need To Know First

- **Sets and membership** — Lesson 0.1. An ordered pair will be defined
  as a special kind of set.
- **Set operations** — Lesson 0.2. The Cartesian product is defined using
  set-builder notation.
- **The real numbers $\mathbb{R}$** — introduced in Lesson 0.1. Understood
  informally here as all points on the number line; a formal treatment
  comes in Stage 1.

---

## The Lesson

### The Problem With Sets: Order Is Lost

```scene
OrderLostScene
```

Sets discard order and repetition. This is exactly what we want for
collections where those things don't matter. But order frequently matters:

- The point $(3, 5)$ is not the same as the point $(5, 3)$ — they are
  different locations in the plane.
- The function call `divide(10, 2)` gives 5; `divide(2, 10)` gives 0.2.
- The date $(2024, 1, 15)$ is January 15th; $(15, 1, 2024)$ is a different
  format entirely.

We need a new kind of object — one that preserves order.

---

### Ordered Pairs

```scene
CartesianProductScene
```


```quiz
{"q": "(a, b) = (c, d) if and only if:", "options": ["a = c or b = d", "a = d and b = c", "a = c and b = d", "a + b = c + d"], "correct": 2, "explanation": "Ordered pairs are equal when both components match in order: first with first, second with second."}
```


**Definition:** An **ordered pair** $(a, b)$ consists of two objects $a$
and $b$ in a specific order. The object $a$ is the **first component**
(or first coordinate) and $b$ is the **second component**.

Two ordered pairs are equal if and only if their first components are
equal and their second components are equal:

$$(a, b) = (c, d) \quad \iff \quad a = c \text{ and } b = d$$

This is the defining property. It means $(1, 2) \neq (2, 1)$, because
even though both pairs contain the same elements, the order differs.

**Formal lens:** An ordered pair can actually be defined using only sets —
Kazimierz Kuratowski showed in 1921 that $(a, b)$ can be defined as
$\{\{a\}, \{a, b\}\}$. This encoding preserves order because the
first element $a$ is the one that appears alone in the inner set.
You do not need to use this encoding in practice, but it demonstrates
that ordered pairs are not a new primitive — they are built from sets.

**Geometric lens:** An ordered pair of real numbers $(x, y)$ is a point
in the plane. The first coordinate tells you how far left or right; the
second tells you how far up or down. Swapping them moves you to a
different point.

**Computational lens:** In Python, a **tuple** is the direct implementation
of an ordered pair (and more generally, an ordered sequence). `(1, 2)` is
a tuple; `(1, 2) == (2, 1)` is `False`. Every pixel in an image, every
2D game coordinate, every row in a CSV file is a tuple.

```python
# Ordered pairs in Python — tuples
pair_ab = (1, 2)
pair_ba = (2, 1)

print("(1, 2) =", pair_ab)
print("(2, 1) =", pair_ba)
print("(1, 2) == (2, 1):", pair_ab == pair_ba)   # False — order matters
print("(1, 2) == (1, 2):", pair_ab == (1, 2))     # True
print()

# Accessing components
print("First component of (1, 2):", pair_ab[0])   # Python uses 0-based indexing
print("Second component of (1, 2):", pair_ab[1])
print()

# Contrast with a set — order is lost in sets
set_12 = {1, 2}
set_21 = {2, 1}
print("{1, 2} == {2, 1}:", set_12 == set_21)   # True — sets ignore order
```

**Walkthrough:** `(1, 2)` creates a Python tuple — an immutable ordered
sequence. `pair_ab[0]` accesses the first component using **index 0**:
Python indexes all sequences starting from 0, so the first element is
at position 0, the second at position 1. `pair_ab == pair_ba` returns
`False` because Python's tuple equality checks both components in order,
exactly matching the mathematical definition. The final lines confirm
the contrast: `{1, 2} == {2, 1}` is `True` because sets discard order,
while `(1, 2) == (2, 1)` is `False` because tuples preserve it.

---

### The Cartesian Product

```scene
CartesianProductScene
```

```quiz
{"q": "If |A| = 3 and |B| = 4, what is |A \u00d7 B|?", "options": ["7", "12", "1", "81"], "correct": 1, "explanation": "|A \u00d7 B| = |A| \u00d7 |B| = 3 \u00d7 4 = 12."}
```


Given two sets, we can form the set of all possible ordered pairs, one
element from each set.

**Definition:** The **Cartesian product** of sets $A$ and $B$, written
$A \times B$ (read "$A$ cross $B$"), is the set of all ordered pairs
$(a, b)$ where $a \in A$ and $b \in B$:

$$A \times B = \{(a, b) : a \in A \text{ and } b \in B\}$$

**Hand-worked example:** Let $A = \{1, 2, 3\}$ and $B = \{p, q\}$.
Find $A \times B$.

We form every possible pair, first coordinate from $A$, second from $B$:

$$A \times B = \{(1, p),\ (1, q),\ (2, p),\ (2, q),\ (3, p),\ (3, q)\}$$

There are $|A| \times |B| = 3 \times 2 = 6$ pairs in total.

**Verify:** Each element of $A$ is paired with each element of $B$ exactly
once. $|A \times B| = 6 = |A| \cdot |B|$. ✓

**General fact:** $|A \times B| = |A| \cdot |B|$.
This is the **multiplication principle** from combinatorics — the number
of ways to make two independent choices, one from $A$ and one from $B$,
is the product of the sizes.

**Is $A \times B = B \times A$?**

Let's check. $B \times A = \{(p,1), (p,2), (p,3), (q,1), (q,2), (q,3)\}$.
The pairs in $A \times B$ have numbers first; in $B \times A$ they have
letters first. These are different ordered pairs, so $A \times B \neq B \times A$
(in general). The Cartesian product is **not commutative** — order of the
sets matters.

```python
# Cartesian product in Python
A = {1, 2, 3}
B = {'p', 'q'}

# List comprehension generates all ordered pairs
A_cross_B = [(a, b) for a in sorted(A) for b in sorted(B)]
B_cross_A = [(b, a) for b in sorted(B) for a in sorted(A)]

print("A × B =", A_cross_B)
print("|A × B| =", len(A_cross_B), "=", len(A), "×", len(B))
print()
print("B × A =", B_cross_A)
print()
print("A × B == B × A:", set(A_cross_B) == set(B_cross_A))
```

**Walkthrough:** `[(a, b) for a in sorted(A) for b in sorted(B)]` is
a **list comprehension** generating ordered pairs — the Python equivalent
of set-builder notation for $A \times B$. The outer loop iterates over
elements of $A$; for each, the inner loop iterates over all elements of
$B$, producing every combination. `sorted()` is used because Python sets
have no guaranteed order, and sorted output is easier to read. The final
comparison converts both to `set` to ignore list ordering, and confirms
$A \times B \neq B \times A$ — the pairs in one are not in the other.

---

### The Cartesian Plane: $\mathbb{R}^2 = \mathbb{R} \times \mathbb{R}$

```scene
CoordinatePlaneScene
```


The most important Cartesian product is $\mathbb{R} \times \mathbb{R}$:
the set of all ordered pairs of real numbers.

$$\mathbb{R}^2 = \mathbb{R} \times \mathbb{R} = \{(x, y) : x \in \mathbb{R},\ y \in \mathbb{R}\}$$

This is the **Cartesian plane** — every point in the 2D plane corresponds
to exactly one ordered pair $(x, y)$, and every ordered pair corresponds
to exactly one point. The plane and $\mathbb{R}^2$ are the same object.

**The coordinate axes:**
- The **$x$-axis** is the set $\{(x, 0) : x \in \mathbb{R}\}$ — all pairs
  with second coordinate 0. This is a horizontal line through the origin.
- The **$y$-axis** is $\{(0, y) : y \in \mathbb{R}\}$ — all pairs with
  first coordinate 0. A vertical line through the origin.
- The **origin** is the point $(0, 0)$, where both coordinates are zero.

**The four quadrants** are the four regions separated by the axes:
- Quadrant I: $x > 0$ and $y > 0$ (upper right)
- Quadrant II: $x < 0$ and $y > 0$ (upper left)
- Quadrant III: $x < 0$ and $y < 0$ (lower left)
- Quadrant IV: $x > 0$ and $y < 0$ (lower right)

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(8, 8))

# Grid lines
for i in range(-5, 6):
    ax.axhline(i, color='#e0e0e0', linewidth=0.6, zorder=1)
    ax.axvline(i, color='#e0e0e0', linewidth=0.6, zorder=1)

# Axes
ax.axhline(0, color='#333333', linewidth=1.5, zorder=2)
ax.axvline(0, color='#333333', linewidth=1.5, zorder=2)

# Quadrant labels
ax.text( 3.0,  3.5, 'Quadrant I\n$x>0, y>0$',
         ha='center', fontsize=10, color='#888888')
ax.text(-3.0,  3.5, 'Quadrant II\n$x<0, y>0$',
         ha='center', fontsize=10, color='#888888')
ax.text(-3.0, -3.5, 'Quadrant III\n$x<0, y<0$',
         ha='center', fontsize=10, color='#888888')
ax.text( 3.0, -3.5, 'Quadrant IV\n$x>0, y<0$',
         ha='center', fontsize=10, color='#888888')

# Sample points with labels
sample_points = [(3, 4), (-2, 3), (-3, -2), (4, -1), (0, 0)]
point_labels  = ['$(3, 4)$', '$(-2, 3)$', '$(-3,-2)$', '$(4,-1)$', 'origin $(0,0)$']
label_offsets = [(0.2, 0.3), (-0.2, 0.3), (-0.2, -0.4), (0.2, -0.4), (0.25, 0.25)]

for (x, y), label, (dx, dy) in zip(sample_points, point_labels, label_offsets):
    ax.plot(x, y, 'o', color='#2980b9', markersize=9, zorder=5)
    ax.annotate(label, (x, y), xytext=(x + dx, y + dy),
                fontsize=11, color='#2c3e50',
                arrowprops=dict(arrowstyle='->', color='#999', lw=0.8))

# Axis tick marks and labels
for i in range(-5, 6):
    if i != 0:
        ax.text(i, -0.35, str(i), ha='center', va='top', fontsize=9, color='#555')
        ax.text(-0.35, i, str(i), ha='right', va='center', fontsize=9, color='#555')

ax.text(5.4, -0.3, '$x$', fontsize=14, color='#333')
ax.text(-0.4, 5.4, '$y$', fontsize=14, color='#333')

ax.set_xlim(-5.5, 5.5)
ax.set_ylim(-5.5, 5.5)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title(r'The Cartesian Plane $\mathbb{R}^2 = \mathbb{R} \times \mathbb{R}$'
             '\nEvery point is an ordered pair $(x, y)$', fontsize=13, pad=15)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `ax.axhline(0)` draws the $x$-axis as a horizontal line
at $y = 0$. `ax.axvline(0)` draws the $y$-axis as a vertical line at $x = 0$.
`ax.plot(x, y, 'o')` places a circular marker at the point $(x, y)$.
`ax.annotate(label, (x,y), xytext=(x+dx, y+dy))` draws a label near each
point with a short arrow connecting the label to the point — the `xytext`
argument gives the label's position, offset from the point by `(dx, dy)`.
The `zorder` argument controls drawing order: higher values are drawn on
top of lower values, so the points ($z = 5$) appear on top of the grid
($z = 1$) and axes ($z = 2$).

---

### The Distance Formula

```scene
DistanceFormulaScene
```

```quiz
{"q": "What is the distance between (0,0) and (3,4)?", "options": ["3", "4", "5", "7"], "correct": 2, "explanation": "Distance = sqrt(3\u00b2 + 4\u00b2) = sqrt(25) = 5. This is a 3-4-5 right triangle."}
```


Given two points $(x_1, y_1)$ and $(x_2, y_2)$ in $\mathbb{R}^2$,
what is the distance between them?

We derive this from the Pythagorean theorem rather than stating it.
Draw a right triangle with the two points as two vertices of the
hypotenuse. The horizontal leg has length $|x_2 - x_1|$ and the
vertical leg has length $|y_2 - y_1|$. By the Pythagorean theorem:

$$d^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2$$

Therefore:

$$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$

This is the **distance formula**. It is not a separate fact to memorise
— it is the Pythagorean theorem applied to coordinates.

**Hand-worked example:** Find the distance from $(1, 2)$ to $(4, 6)$.

$$d = \sqrt{(4-1)^2 + (6-2)^2} = \sqrt{3^2 + 4^2} = \sqrt{9 + 16} = \sqrt{25} = 5$$

**Verify:** A 3-4-5 right triangle. The legs are 3 and 4; the hypotenuse
(distance) is 5. ✓

**Generalise:** The squaring removes the absolute value signs: $(x_2-x_1)^2$
is the same whether $x_2 > x_1$ or $x_2 < x_1$, because a negative number
squared is positive.

---

### The Midpoint Formula

```scene
MidpointScene
```

```quiz
{"q": "What is the midpoint of (2,6) and (8,2)?", "options": ["(5,4)", "(10,8)", "(3,2)", "(6,8)"], "correct": 0, "explanation": "Midpoint = ((2+8)/2, (6+2)/2) = (5, 4)."}
```


The midpoint of the segment from $(x_1, y_1)$ to $(x_2, y_2)$ is the
point halfway between them. Halfway along $x$ is the average of $x_1$
and $x_2$; halfway along $y$ is the average of $y_1$ and $y_2$:

$$\text{Midpoint} = \left(\frac{x_1 + x_2}{2},\ \frac{y_1 + y_2}{2}\right)$$

**Derivation:** The average of two numbers $a$ and $b$ is $\frac{a+b}{2}$,
which is exactly the value halfway between them on the number line. Applying
this independently to each coordinate gives the midpoint.

**Hand-worked example:** Find the midpoint of $(1, 2)$ and $(4, 6)$.

$$\text{Midpoint} = \left(\frac{1+4}{2},\ \frac{2+6}{2}\right) = \left(\frac{5}{2},\ 4\right) = (2.5,\ 4)$$

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import math

def distance(point_1, point_2):
    """Euclidean distance between two points in ℝ²."""
    return math.sqrt((point_2[0] - point_1[0])**2 +
                     (point_2[1] - point_1[1])**2)

def midpoint(point_1, point_2):
    """Midpoint of the segment between two points in ℝ²."""
    return ((point_1[0] + point_2[0]) / 2,
            (point_1[1] + point_2[1]) / 2)

p1 = (1, 2)
p2 = (4, 6)

dist = distance(p1, p2)
mid  = midpoint(p1, p2)

print(f"Points: {p1} and {p2}")
print(f"Distance:  sqrt(({p2[0]}-{p1[0]})² + ({p2[1]}-{p1[1]})²)")
print(f"         = sqrt({(p2[0]-p1[0])**2} + {(p2[1]-p1[1])**2})")
print(f"         = sqrt({(p2[0]-p1[0])**2 + (p2[1]-p1[1])**2})")
print(f"         = {dist}")
print(f"Midpoint:  (({p1[0]}+{p2[0]})/2, ({p1[1]}+{p2[1]})/2) = {mid}")

# Visualise
fig, ax = plt.subplots(figsize=(7, 7))
for i in range(0, 8):
    ax.axhline(i, color='#eeeeee', linewidth=0.6)
    ax.axvline(i, color='#eeeeee', linewidth=0.6)
ax.axhline(0, color='#aaaaaa', linewidth=1)
ax.axvline(0, color='#aaaaaa', linewidth=1)

# Segment between the two points
ax.plot([p1[0], p2[0]], [p1[1], p2[1]], '-', color='#2980b9', linewidth=2, zorder=3)

# Right triangle legs
ax.plot([p1[0], p2[0]], [p1[1], p1[1]], '--', color='#e74c3c', linewidth=1.5, zorder=3)
ax.plot([p2[0], p2[0]], [p1[1], p2[1]], '--', color='#e74c3c', linewidth=1.5, zorder=3)

# Points
for pt, label, va in [(p1, f'$p_1{p1}$', 'top'), (p2, f'$p_2{p2}$', 'bottom')]:
    ax.plot(pt[0], pt[1], 'o', color='#2980b9', markersize=10, zorder=5)
    ax.annotate(label, pt, xytext=(pt[0]+0.15, pt[1]-0.3 if va=='top' else pt[1]+0.2),
                fontsize=12)

# Midpoint
ax.plot(mid[0], mid[1], 's', color='#27ae60', markersize=10, zorder=5)
ax.annotate(f'midpoint {mid}', mid, xytext=(mid[0]+0.15, mid[1]+0.2), fontsize=11,
            color='#27ae60')

# Leg labels
ax.text((p1[0]+p2[0])/2, p1[1]-0.3, f'$|{p2[0]}-{p1[0]}|={p2[0]-p1[0]}$',
        ha='center', fontsize=11, color='#e74c3c')
ax.text(p2[0]+0.2, (p1[1]+p2[1])/2, f'$|{p2[1]}-{p1[1]}|={p2[1]-p1[1]}$',
        ha='left', fontsize=11, color='#e74c3c')
ax.text((p1[0]+p2[0])/2 - 0.5, (p1[1]+p2[1])/2 + 0.2,
        f'$d={dist:.0f}$', fontsize=13, color='#2980b9', fontweight='bold')

ax.set_xlim(-0.5, 6)
ax.set_ylim(-0.5, 7.5)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title('Distance and midpoint derived from the Pythagorean theorem', fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `distance` and `midpoint` implement the two formulas as
functions. `math.sqrt()` — from Python's `math` module, which provides
mathematical functions — computes the square root. Each function takes
two tuples (points) and returns either a float (distance) or a tuple
(midpoint). The visualisation draws the segment in blue, the right-triangle
legs in dashed red, and the midpoint as a green square — making the
Pythagorean theorem derivation of the distance formula directly visible.

---

### Extending to Three Dimensions: $\mathbb{R}^3$

```scene
ThreeDScene
```

The same construction extends naturally. $\mathbb{R}^3 = \mathbb{R} \times \mathbb{R} \times \mathbb{R}$
is the set of all ordered triples $(x, y, z)$, corresponding to points in
3D space. The distance formula extends:

$$d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$

This is derived by applying the Pythagorean theorem twice — once in the
$xy$-plane to get the horizontal distance, then again to account for
the vertical $z$ component. Stage 4 (Linear Algebra) works primarily
in $\mathbb{R}^2$ and $\mathbb{R}^3$, and later in $\mathbb{R}^n$
for any $n$ — the Cartesian product of $\mathbb{R}$ with itself $n$ times.

---

## Connect the Pieces

**What this lesson built on:** Lesson 0.1's sets (ordered pairs are
defined from sets) and the real number line (which now becomes a plane
when crossed with itself).

**What this lesson makes possible:** Lesson 0.5 (Relations) — a relation
on a set $A$ is a subset of $A \times A$. Every relation is a set of
ordered pairs. Stage 2 (Trigonometry) works entirely in $\mathbb{R}^2$.
Stage 4 (Linear Algebra) is the study of functions from $\mathbb{R}^n$
to $\mathbb{R}^m$ — vector spaces built on Cartesian products.

**In computer science:** Every 2D coordinate in a graphics system is an
element of $\mathbb{R}^2$. Screen coordinates are ordered pairs of
pixels. A database table is a subset of the Cartesian product of its
column domains — a row `(Alice, 42, Engineer)` is an ordered triple
from `Names × Ages × Roles`. The SQL term for a table is a **relation**,
directly from this mathematics.

**In engineering:** A CNC machine's position is a point in $\mathbb{R}^3$.
Every G-code move command specifies an ordered triple $(X, Y, Z)$.
The distance formula computes the length of a linear move; the midpoint
formula computes the centre of an arc.

---

## Summary

**Ordered pair:** $(a, b)$ — two objects in sequence.
$(a, b) = (c, d) \iff a = c$ and $b = d$. Order matters; $(a,b) \neq (b,a)$ in general.

**Cartesian product:**
$A \times B = \{(a, b) : a \in A,\ b \in B\}$. Size: $|A \times B| = |A| \cdot |B|$.
Not commutative: $A \times B \neq B \times A$ in general.

**The Cartesian plane:** $\mathbb{R}^2 = \mathbb{R} \times \mathbb{R}$.
Every point is an ordered pair $(x, y)$.

**Distance formula** (from Pythagorean theorem):
$$d\big((x_1,y_1),(x_2,y_2)\big) = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$$

**Midpoint formula** (from averaging coordinates):
$$\text{midpoint} = \left(\frac{x_1+x_2}{2},\ \frac{y_1+y_2}{2}\right)$$

---

## Problems

### Computation

**1.** Let $A = \{0, 1\}$ and $B = \{a, b, c\}$.
(a) List all elements of $A \times B$.
(b) List all elements of $B \times A$.
(c) Are they equal? Explain.
(d) What is $|A \times B|$?

*Answers: (a) $\{(0,a),(0,b),(0,c),(1,a),(1,b),(1,c)\}$
(b) $\{(a,0),(a,1),(b,0),(b,1),(c,0),(c,1)\}$
(c) No — the first components are different types.
(d) $2 \times 3 = 6$*

**2.** Compute the distance and midpoint for each pair of points.
Show the substitution into the formula at each step.

(a) $(0, 0)$ and $(3, 4)$

(b) $(-1, -1)$ and $(2, 3)$

(c) $(5, 2)$ and $(5, 7)$ — what is special about this case geometrically?

*Answers: (a) $d=5$, midpoint $= (1.5, 2)$
(b) $d = \sqrt{9+16} = 5$, midpoint $= (0.5, 1)$
(c) $d = 5$, midpoint $= (5, 4.5)$. Special: the two points share the
same $x$-coordinate, so the segment is vertical — the distance is simply
$|7-2| = 5$, and the horizontal term $(5-5)^2 = 0$ vanishes.*

**3.** A point $P = (x, 3)$ is at distance 5 from the origin $(0,0)$.
Find all possible values of $x$.

*Solution: $\sqrt{x^2 + 9} = 5 \Rightarrow x^2 + 9 = 25 \Rightarrow x^2 = 16 \Rightarrow x = \pm 4$.
Two solutions: $(4, 3)$ and $(-4, 3)$.*

---

### Understanding

**4.** The Cartesian product $\{0,1\} \times \{0,1\}$ has 4 elements.
In a computer, a pair of bits can hold $2^2 = 4$ different values:
$(0,0), (0,1), (1,0), (1,1)$. How many values can a sequence of $n$ bits hold?
What Cartesian product does this correspond to?

*Guidance: $n$ bits correspond to $\underbrace{\{0,1\} \times \{0,1\} \times \cdots \times \{0,1\}}_{n \text{ times}} = \{0,1\}^n$,
which has $2^n$ elements. A byte ($n=8$) has $2^8 = 256$ values.*

**5.** Explain in your own words why the distance formula requires squaring
the differences rather than just taking $|x_2-x_1| + |y_2-y_1|$.

*Guidance: $|x_2-x_1| + |y_2-y_1|$ measures the "taxi-cab distance" —
the distance you would travel along a grid. The Euclidean distance (straight
line) requires the Pythagorean theorem, which involves squares. For a point
at $(3,4)$ from the origin: taxi-cab distance $= 7$, Euclidean distance $= 5$.*

---

### Proof

**6.** Prove that the midpoint $M = \left(\frac{x_1+x_2}{2}, \frac{y_1+y_2}{2}\right)$
is equidistant from $(x_1, y_1)$ and $(x_2, y_2)$ — that is, prove
$d(P_1, M) = d(M, P_2)$.

*Guidance: Compute $d(P_1, M)$ and $d(M, P_2)$ using the distance formula
and show they are equal. The algebra simplifies cleanly.*

---

### Extension

**7. ★** The distance from a point $P = (x_0, y_0)$ to a line
$ax + by + c = 0$ is:
$$d = \frac{|ax_0 + by_0 + c|}{\sqrt{a^2 + b^2}}$$

(a) Find the distance from the point $(3, 4)$ to the line $x + y - 1 = 0$.

(b) Verify your answer using the formula.

(c) This formula appears in machine learning as the **margin** in
a Support Vector Machine (SVM) — the distance from the decision
boundary to the nearest data points. Why would maximising this
distance make a classifier more robust?

*Answer (a) and (b): $d = |3+4-1|/\sqrt{2} = 6/\sqrt{2} = 3\sqrt{2} \approx 4.24$*
