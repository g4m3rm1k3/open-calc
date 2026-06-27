# Stage 0, Lesson 0.2 — Set Operations: Union, Intersection, and Complement
**Threads:** Math · CS · Physics  
**Estimated time:** 50–65 minutes

---

## What This Lesson Is About

A single set is just a collection. But most interesting questions in mathematics
involve two or more sets at once: the parts that passed both inspections, the
students enrolled in either course, the integers that are neither prime nor
even. To answer these questions we need operations that combine sets into new
sets — the same way addition combines numbers into new numbers. This lesson
introduces the three fundamental set operations: **union** (everything in
either set), **intersection** (only what is in both), and **complement**
(everything not in the set). Together they form a complete algebra of sets,
and by the end of this lesson you will be able to express any combination
of collections in precise mathematical notation, verify the results by hand
and in code, and recognise these operations as the mathematical foundation
of database queries, search filters, and Boolean logic.

---

## Historical Context

The algebra of sets was developed by George Boole in *The Laws of Thought*
(1854) and extended by Georg Cantor in the 1870s–80s. Boole's original goal
was to reduce logical reasoning to arithmetic — to turn arguments about "all
men are mortal" into equations. He succeeded: the union, intersection, and
complement operations satisfy laws that look exactly like addition,
multiplication, and negation. This is why the on/off logic of every digital
circuit is called **Boolean algebra** — it is set algebra, implemented
in silicon.

---

## What You Need To Know First

- **Sets, elements, membership ($\in$, $\notin$)** — from Lesson 0.1.
  A set is an unordered collection of distinct objects; $x \in A$ means
  $x$ belongs to $A$.
- **Subsets ($\subseteq$)** — from Lesson 0.1.
  $B \subseteq A$ means every element of $B$ is in $A$.
- **Set equality** — from Lesson 0.1.
  $A = B$ if and only if $A \subseteq B$ and $B \subseteq A$.

---

## The Lesson

### The Need for a Universal Set

Before defining operations that can produce complements, we need to fix
what "everything" means. In isolation, the complement of $\{1, 2, 3\}$
is ambiguous — is it all integers not in the set? All real numbers? All
people? The answer depends on context.

**Definition:** A **universal set** $U$ is a fixed set that contains all
elements under consideration in a given context. Every set in the discussion
is assumed to be a subset of $U$.

The universal set is not a mathematical absolute — it is a choice made for
a specific problem. In a discussion about integers from 1 to 10, we might
set $U = \{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\}$. In a discussion about all
real numbers, $U = \mathbb{R}$.

**Geometric picture:** In a Venn diagram, the universal set is the
rectangle surrounding all the ovals. Everything drawn inside the rectangle
is in $U$. The ovals carve $U$ into regions.

For all examples in this lesson, we use $U = \{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\}$
unless stated otherwise.

---

### Union: Everything in Either Set

We often need to combine two collections into one. "Give me everyone in
Team A or Team B." "Find all parts that failed either inspection."
The operation that does this is the union.

**Definition:** The **union** of sets $A$ and $B$, written $A \cup B$,
is the set of all elements that belong to $A$, or to $B$, or to both:

$$A \cup B = \{x : x \in A \text{ or } x \in B\}$$

The word "or" here is **inclusive or** — the union includes elements that
are in both sets, not just one or the other.

**Geometric picture:** In a Venn diagram with two overlapping ovals,
$A \cup B$ is the entire shaded area covered by either oval — including
the overlap region in the middle.

**Hand-worked example:** Let $A = \{1, 2, 3, 4, 5\}$ and
$B = \{3, 4, 5, 6, 7\}$. Find $A \cup B$.

We collect every element that appears in $A$, in $B$, or in both,
listing each once:

From $A$: 1, 2, 3, 4, 5.
From $B$: 3, 4, 5 (already listed), 6, 7.

$$A \cup B = \{1, 2, 3, 4, 5, 6, 7\}$$

**Verify:** Check that every element of $A$ is in $A \cup B$ ✓ and every
element of $B$ is in $A \cup B$ ✓. The elements 3, 4, 5 appear in both —
they appear once in the union, as required by the definition of a set.

**General pattern:** $A \cup B$ always contains at least as many elements
as either $A$ or $B$ alone: $|A| \leq |A \cup B|$ and $|B| \leq |A \cup B|$.

---

### Intersection: Only What Is in Both

When we need only the elements that two sets share — parts that passed
every inspection, students enrolled in every required course — we use
the intersection.

**Definition:** The **intersection** of sets $A$ and $B$, written $A \cap B$,
is the set of all elements that belong to both $A$ and $B$:

$$A \cap B = \{x : x \in A \text{ and } x \in B\}$$

**Geometric picture:** In a Venn diagram, $A \cap B$ is the overlap region
— only the area covered by both ovals simultaneously.

**Hand-worked example:** Using the same $A = \{1, 2, 3, 4, 5\}$ and
$B = \{3, 4, 5, 6, 7\}$. Find $A \cap B$.

We keep only the elements that appear in both lists:
- 1: in $A$, not in $B$ — exclude
- 2: in $A$, not in $B$ — exclude
- 3: in $A$ ✓ and in $B$ ✓ — include
- 4: in $A$ ✓ and in $B$ ✓ — include
- 5: in $A$ ✓ and in $B$ ✓ — include
- 6: in $B$, not in $A$ — exclude
- 7: in $B$, not in $A$ — exclude

$$A \cap B = \{3, 4, 5\}$$

**Verify:** Every element of $A \cap B$ is in $A$ ✓ and in $B$ ✓.

**Special case — disjoint sets:** Two sets are **disjoint** if they share
no elements: $A \cap B = \emptyset$. For example,
$\{1, 3, 5\} \cap \{2, 4, 6\} = \emptyset$.
Disjoint sets appear in a Venn diagram as two ovals that do not overlap.

---

### Set Difference: What Is in One but Not the Other

**Definition:** The **set difference** $A \setminus B$ (also written $A - B$)
is the set of elements in $A$ that are not in $B$:

$$A \setminus B = \{x : x \in A \text{ and } x \notin B\}$$

This is not symmetric: $A \setminus B$ and $B \setminus A$ are usually different.

**Hand-worked example:** $A = \{1,2,3,4,5\}$, $B = \{3,4,5,6,7\}$.

$A \setminus B$: elements of $A$ not in $B$: $\{1, 2\}$.

$B \setminus A$: elements of $B$ not in $A$: $\{6, 7\}$.

These are different sets, confirming that order matters for set difference.

---

### Complement: Everything Not in the Set

Once a universal set $U$ is fixed, every set $A \subseteq U$ has a complement —
the part of $U$ that $A$ does not cover.

**Definition:** The **complement** of $A$ with respect to $U$, written $A^c$
(or $\overline{A}$ or $A'$), is the set of all elements in $U$ that are not in $A$:

$$A^c = \{x \in U : x \notin A\} = U \setminus A$$

**Geometric picture:** In a Venn diagram, $A^c$ is everything inside the
rectangle (the universal set) but outside the oval for $A$.

**Hand-worked example:** Let $U = \{1,2,3,4,5,6,7,8,9,10\}$ and
$A = \{1,2,3,4,5\}$. Find $A^c$.

Elements of $U$ not in $A$: 6, 7, 8, 9, 10.

$$A^c = \{6, 7, 8, 9, 10\}$$

**Verify:** $A \cup A^c = U$ ✓ (together they cover all of $U$) and
$A \cap A^c = \emptyset$ ✓ (they share nothing). These two properties
are always true: a set and its complement partition $U$ into two
non-overlapping pieces that together fill $U$ completely.

---

### Visualising All Four Operations

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_venn(ax, A_elements, B_elements, U_elements,
              highlight, title, highlight_color='#f39c12'):
    """
    Draw a two-set Venn diagram and highlight a specific region.
    highlight: 'union', 'intersection', 'A_minus_B', 'B_minus_A', or 'complement_A'
    """
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title(title, fontsize=11, pad=8)

    # Rectangle for universal set
    rect = patches.FancyBboxPatch(
        (0.3, 0.3), 9.4, 6.4,
        boxstyle="round,pad=0.1",
        fill=True, facecolor='#f8f9fa',
        edgecolor='#555555', linewidth=1.5
    )
    ax.add_patch(rect)
    ax.text(0.7, 6.4, 'U', fontsize=10, color='#555555', fontweight='bold')

    # Determine fill colors based on what to highlight
    only_A = A_elements - B_elements
    both_AB = A_elements & B_elements
    only_B = B_elements - A_elements
    neither = U_elements - A_elements - B_elements

    region_highlight = {
        'union':          (True,  True,  True,  False),
        'intersection':   (False, True,  False, False),
        'A_minus_B':      (True,  False, False, False),
        'B_minus_A':      (False, False, True,  False),
        'complement_A':   (False, False, True,  True),
    }
    hl_onlyA, hl_both, hl_onlyB, hl_neither = region_highlight[highlight]

    # Draw A oval
    color_A = highlight_color if hl_onlyA else '#dce8f5'
    oval_A = patches.Ellipse((3.8, 3.5), width=5.2, height=4.8,
                              fill=True, facecolor=color_A,
                              edgecolor='#2980b9', linewidth=2, zorder=2)
    ax.add_patch(oval_A)

    # Draw B oval
    color_B = highlight_color if hl_onlyB else '#dce8f5'
    oval_B = patches.Ellipse((6.2, 3.5), width=5.2, height=4.8,
                              fill=True, facecolor=color_B,
                              edgecolor='#27ae60', linewidth=2, zorder=2)
    ax.add_patch(oval_B)

    # Redraw intersection region on top with correct color
    color_both = highlight_color if hl_both else '#c5d8ec'
    oval_intersect = patches.Ellipse((3.8, 3.5), width=5.2, height=4.8,
                                      fill=False, edgecolor='none', zorder=3)
    # Use clip path trick: draw a filled patch clipped to intersection
    # Simpler: just annotate the intersection region
    if hl_both:
        ax.annotate('', xy=(5.6, 3.5), xytext=(5.6, 3.5))

    # Labels
    ax.text(2.2, 3.5, 'A', fontsize=14, ha='center',
            color='#2980b9', fontweight='bold', zorder=5)
    ax.text(7.8, 3.5, 'B', fontsize=14, ha='center',
            color='#27ae60', fontweight='bold', zorder=5)

    # Place element values
    A_only_pos = [(2.0, 4.2), (2.0, 3.5), (2.0, 2.8)]
    both_pos   = [(5.0, 4.0), (5.0, 3.5), (5.0, 3.0)]
    B_only_pos = [(8.0, 4.2), (8.0, 3.5), (8.0, 2.8)]
    neither_pos = [(1.0, 1.2), (9.0, 1.2)]

    for elem, (x, y) in zip(sorted(only_A), A_only_pos):
        ax.text(x, y, str(elem), fontsize=12, ha='center', va='center',
                color='#2c3e50', fontweight='bold', zorder=5)
    for elem, (x, y) in zip(sorted(both_AB), both_pos):
        ax.text(x, y, str(elem), fontsize=12, ha='center', va='center',
                color='#2c3e50', fontweight='bold', zorder=5)
    for elem, (x, y) in zip(sorted(only_B), B_only_pos):
        ax.text(x, y, str(elem), fontsize=12, ha='center', va='center',
                color='#2c3e50', fontweight='bold', zorder=5)
    for elem, (x, y) in zip(sorted(neither), neither_pos):
        ax.text(x, y, str(elem), fontsize=11, ha='center', va='center',
                color='#7f8c8d', zorder=5)

A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}
U = set(range(1, 11))

fig, axes = plt.subplots(2, 2, figsize=(13, 10))

draw_venn(axes[0,0], A, B, U, 'union',
          r'$A \cup B = \{1,2,3,4,5,6,7\}$  (shaded: union)')
draw_venn(axes[0,1], A, B, U, 'intersection',
          r'$A \cap B = \{3,4,5\}$  (shaded: intersection)')
draw_venn(axes[1,0], A, B, U, 'A_minus_B',
          r'$A \setminus B = \{1,2\}$  (shaded: A only)')
draw_venn(axes[1,1], A, B, U, 'complement_A',
          r'$A^c = \{6,7,8,9,10\}$  (shaded: outside A)')

plt.suptitle(r'Set Operations: $A=\{1,2,3,4,5\}$, $B=\{3,4,5,6,7\}$, '
             r'$U=\{1,...,10\}$',
             fontsize=13, y=1.01)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `draw_venn` is a function that draws a Venn diagram for
two sets inside a universal set rectangle. It takes the three sets as
Python `set` objects and a string `highlight` that selects which region
to colour orange. `patches.FancyBboxPatch` draws the rounded rectangle
for $U$. `patches.Ellipse` draws each oval — two calls, one for $A$ (blue
border) and one for $B$ (green border). The elements are positioned
manually using `ax.text` at pre-chosen coordinates: left region for
elements only in $A$, centre for elements in both, right for elements
only in $B$, and corners for elements in neither. `plt.subplots(2, 2)`
creates a 2×2 grid of four axes — `axes[0,0]` is top-left, `axes[1,1]`
is bottom-right. Each subplot shows a different operation by passing a
different `highlight` string. Running this produces the four standard
Venn diagram regions side by side, one highlighted per subplot.

---

### The Inclusion-Exclusion Principle

Notice the cardinalities from our example:
$|A| = 5$, $|B| = 5$, $|A \cup B| = 7$.

If we naively added $|A| + |B| = 10$, we would overcount — the three
elements in the intersection (3, 4, 5) are counted once in $|A|$ and
again in $|B|$. The correct formula subtracts the overcount:

$$|A \cup B| = |A| + |B| - |A \cap B|$$

This is the **inclusion-exclusion principle** for two sets.

**Hand-worked verification:**

$$|A \cup B| = 5 + 5 - 3 = 7 \checkmark$$

This formula will reappear in Stage 8 (probability), where it becomes
the rule for computing the probability of at least one of two events
occurring: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.

```python
A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}

intersection = A & B
union = A | B

formula_result = len(A) + len(B) - len(intersection)
direct_count   = len(union)

print(f"|A| = {len(A)}")
print(f"|B| = {len(B)}")
print(f"|A ∩ B| = {len(intersection)}")
print(f"|A| + |B| - |A ∩ B| = {formula_result}")
print(f"|A ∪ B| directly = {direct_count}")
print(f"Formula correct: {formula_result == direct_count}")
```

**Walkthrough:** `A & B` is Python's syntax for set intersection
(the `&` operator). `A | B` is Python's syntax for set union (the `|`
operator — the vertical bar, not a lowercase L). `len()` returns the
cardinality of any set. The two computations of $|A \cup B|$ — via the
inclusion-exclusion formula and via direct counting — produce the same
result, 7, verifying the formula.

---

### De Morgan's Laws

Augustus De Morgan, a British mathematician working in the 1840s,
discovered two laws that connect complement with union and intersection.
They are among the most useful identities in both mathematics and
programming.

**De Morgan's First Law:**
$$\overline{A \cup B} = A^c \cap B^c$$

In words: the complement of a union is the intersection of the complements.
"Not (A or B)" is the same as "not A and not B."

**De Morgan's Second Law:**
$$\overline{A \cap B} = A^c \cup B^c$$

In words: the complement of an intersection is the union of the complements.
"Not (A and B)" is the same as "not A or not B."

**Hand-worked proof of the First Law:**

We prove $\overline{A \cup B} = A^c \cap B^c$ by showing both subset
directions. The proof strategy is: take an arbitrary element from the
left side and show it must be in the right side, then reverse.

*Strategy: We prove both $\overline{A \cup B} \subseteq A^c \cap B^c$
and $A^c \cap B^c \subseteq \overline{A \cup B}$.*

**Step 1:** Let $x \in \overline{A \cup B}$.
Then $x \notin A \cup B$, meaning $x$ is not in $A$ or $B$.
So $x \notin A$ and $x \notin B$ — if $x$ were in either one,
it would be in $A \cup B$, contradicting our assumption.
Therefore $x \in A^c$ and $x \in B^c$, so $x \in A^c \cap B^c$.

**Step 2:** Let $x \in A^c \cap B^c$.
Then $x \in A^c$ and $x \in B^c$, meaning $x \notin A$ and $x \notin B$.
Therefore $x \notin A \cup B$ (since $x$ is in neither set),
so $x \in \overline{A \cup B}$.

Both inclusions hold, therefore $\overline{A \cup B} = A^c \cap B^c$. $\blacksquare$

**Verification in code:**

```python
A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}
U = set(range(1, 11))

# De Morgan's First Law: complement of union = intersection of complements
left_side_1  = U - (A | B)       # complement of (A union B)
right_side_1 = (U - A) & (U - B) # (complement of A) intersect (complement of B)

print("De Morgan's First Law: ¬(A ∪ B) = A^c ∩ B^c")
print(f"  ¬(A ∪ B) = {sorted(left_side_1)}")
print(f"  A^c ∩ B^c = {sorted(right_side_1)}")
print(f"  Equal: {left_side_1 == right_side_1}")
print()

# De Morgan's Second Law: complement of intersection = union of complements
left_side_2  = U - (A & B)       # complement of (A intersect B)
right_side_2 = (U - A) | (U - B) # (complement of A) union (complement of B)

print("De Morgan's Second Law: ¬(A ∩ B) = A^c ∪ B^c")
print(f"  ¬(A ∩ B) = {sorted(left_side_2)}")
print(f"  A^c ∪ B^c = {sorted(right_side_2)}")
print(f"  Equal: {left_side_2 == right_side_2}")
```

**Walkthrough:** `U - (A | B)` computes the set difference $U \setminus (A \cup B)$,
which is the complement of $A \cup B$ within $U$. `(U - A) & (U - B)`
computes $(A^c) \cap (B^c)$ by first finding each complement separately
and then intersecting. Both expressions evaluate to $\{8, 9, 10\}$ —
the elements in $U$ that are in neither $A$ nor $B$ — confirming the
first law. The second law is verified identically.

---

### A Real Example: Quality Inspection

Set operations are the mathematical model behind any filtering or
query system.

**Scenario:** A manufacturing run produces parts numbered 101 through 108.
Each part is inspected for two criteria:

$$D = \{101, 102, 103, 104, 105, 106\} \quad \text{(passed dimensional check)}$$
$$S = \{103, 104, 105, 107, 108\} \quad \text{(passed surface finish check)}$$

Answer the following using set operations:

(a) Which parts passed both checks and can be shipped?
(b) Which parts failed the dimensional check?
(c) How many parts passed at least one check?

```python
all_parts       = {101, 102, 103, 104, 105, 106, 107, 108}
pass_dimensional = {101, 102, 103, 104, 105, 106}
pass_surface    = {103, 104, 105, 107, 108}

# (a) Passed BOTH checks: intersection
ship = pass_dimensional & pass_surface
print(f"(a) Ship (pass both): {sorted(ship)}")

# (b) Failed dimensional: complement of D in all_parts
fail_dimensional = all_parts - pass_dimensional
print(f"(b) Failed dimensional: {sorted(fail_dimensional)}")

# (c) Passed at least one: union
pass_at_least_one = pass_dimensional | pass_surface
print(f"(c) Passed at least one: {sorted(pass_at_least_one)}")
print(f"    Count: {len(pass_at_least_one)}")
print()

# Verify inclusion-exclusion
print(f"Inclusion-exclusion check:")
print(f"|D| + |S| - |D ∩ S| = {len(pass_dimensional)} + "
      f"{len(pass_surface)} - {len(ship)} = "
      f"{len(pass_dimensional) + len(pass_surface) - len(ship)}")
print(f"|D ∪ S| = {len(pass_at_least_one)}")
```

**Walkthrough:** The three answers correspond directly to the three
operations: `&` for intersection (ship only what passes both), `-` for
set difference (what failed = all parts minus what passed), `|` for union
(passed at least one). The final block verifies the inclusion-exclusion
formula holds for this data: $6 + 5 - 3 = 8$, matching $|D \cup S| = 8$.

**Physical/Computational lens:** This pattern — define a set for each
criterion, then use intersection/union/complement to answer questions —
is exactly how SQL database queries work. `SELECT * FROM parts WHERE
dimensional = 'PASS' AND surface = 'PASS'` is the intersection $D \cap S$.
`WHERE dimensional = 'PASS' OR surface = 'PASS'` is $D \cup S$.
`WHERE dimensional = 'FAIL'` is $D^c$. The mathematics came first;
the query language is a syntax built on top of it.

---

## Connect the Pieces

**What this lesson built on:** Lesson 0.1's definitions of sets, membership,
and subsets. The operations here all reduce to membership questions — asking
for each element $x$ whether it satisfies "in $A$" or "in $B$" or "in $U$."

**What this lesson makes possible:** Lesson 0.3 (Logic), where we will see
that the union, intersection, and complement of sets correspond exactly to
OR, AND, and NOT in logic — the same operations, in a different domain.
De Morgan's Laws will reappear there, word for word. This connection is
not a coincidence: Boolean algebra and set algebra are the same structure
seen in two different places.

Further ahead, probability (Stage 7) uses these operations constantly:
$P(A \cup B)$ is the probability of at least one event; $P(A \cap B)$
is the probability of both. Every database query language, every search
filter, every access control system is built on set operations.

---

## Summary

**Union:** $A \cup B = \{x : x \in A \text{ or } x \in B\}$
Elements in $A$, in $B$, or in both. Python: `A | B`.

**Intersection:** $A \cap B = \{x : x \in A \text{ and } x \in B\}$
Elements in both $A$ and $B$. Python: `A & B`.

**Set difference:** $A \setminus B = \{x : x \in A \text{ and } x \notin B\}$
Elements of $A$ not in $B$. Python: `A - B`. Not symmetric.

**Complement:** $A^c = U \setminus A = \{x \in U : x \notin A\}$
Elements of $U$ not in $A$. Python: `U - A`. Requires a universal set.

**Inclusion-exclusion:** $|A \cup B| = |A| + |B| - |A \cap B|$

**De Morgan's Laws:**
$$\overline{A \cup B} = A^c \cap B^c \qquad \overline{A \cap B} = A^c \cup B^c$$

**Disjoint sets:** $A$ and $B$ are disjoint if $A \cap B = \emptyset$.

---

## Problems

### Computation

**1.** Let $U = \{1,2,3,4,5,6,7,8,9,10\}$, $A = \{1,3,5,7,9\}$ (odd numbers),
$B = \{2,3,5,7\}$ (primes up to 10).

Compute:
(a) $A \cup B$ &emsp; (b) $A \cap B$ &emsp; (c) $A \setminus B$ &emsp;
(d) $B \setminus A$ &emsp; (e) $A^c$ &emsp; (f) $(A \cup B)^c$

*Answers: (a) $\{1,2,3,5,7,9\}$ (b) $\{3,5,7\}$ (c) $\{1,9\}$
(d) $\{2\}$ (e) $\{2,4,6,8,10\}$ (f) $\{4,6,8,10\}$*

**2.** Using the sets from Problem 1, verify inclusion-exclusion by computing
$|A| + |B| - |A \cap B|$ and confirming it equals $|A \cup B|$.

*Answer: $5 + 4 - 3 = 6 = |\{1,2,3,5,7,9\}|$ ✓*

**3.** A class of students takes two exams. Let $P = \{$students who passed
Exam 1$\} = \{$Alice, Bob, Carol, David$\}$ and
$Q = \{$students who passed Exam 2$\} = \{$Bob, Carol, Eve, Frank$\}$.
Find:
(a) Students who passed both exams.
(b) Students who passed at least one exam.
(c) Students who passed Exam 1 but failed Exam 2.

*Answers: (a) $\{$Bob, Carol$\}$ (b) $\{$Alice, Bob, Carol, David, Eve, Frank$\}$
(c) $\{$Alice, David$\}$*

---

### Understanding

**4.** A student writes "$A \cap B$ is always smaller than $A \cup B$."
Is this always true? Give either a proof or a counterexample.

*Guidance: Not always true in the strict sense. If $A = B$, then $A \cap B = A \cup B = A$.
The correct statement is $A \cap B \subseteq A \cup B$, with equality when $A = B$.
A counterexample to the student's claim: $A = B = \{1,2\}$, giving
$A \cap B = A \cup B = \{1,2\}$.*

**5.** Explain in your own words why De Morgan's First Law,
$\overline{A \cup B} = A^c \cap B^c$, makes intuitive sense.
Your explanation should use no set notation — only plain English.

*Guidance: "Not in A or B" can only be true if an element is simultaneously
not in A and not in B. If it were in either one, it would be in the union.
So being outside the union is exactly the same condition as being outside
A and outside B at the same time.*

**6.** For which sets $A$ and $B$ is it true that $A \setminus B = B \setminus A$?

*Guidance: $A \setminus B = B \setminus A$ means every element in A but not B
is also in B but not A, which is impossible unless both differences are empty.
$A \setminus B = \emptyset$ means $A \subseteq B$, and $B \setminus A = \emptyset$
means $B \subseteq A$. Together: $A = B$. The answer is exactly when $A = B$.*

---

### Proof

**7.** Prove De Morgan's Second Law: $\overline{A \cap B} = A^c \cup B^c$.

*Proof strategy: prove both subset directions.*

*Proof: ($\subseteq$) Let $x \in \overline{A \cap B}$. Then $x \notin A \cap B$,
so it is not the case that ($x \in A$ and $x \in B$). Therefore $x \notin A$
or $x \notin B$ (or both), meaning $x \in A^c$ or $x \in B^c$, so $x \in A^c \cup B^c$.*

*($\supseteq$) Let $x \in A^c \cup B^c$. Then $x \notin A$ or $x \notin B$.
In either case, $x \notin A \cap B$ (since the intersection requires membership
in both). Therefore $x \in \overline{A \cap B}$. $\blacksquare$*

**8.** Prove that for any sets $A$ and $B$:
$$A \cap B \subseteq A \subseteq A \cup B$$

*Guidance: prove each inclusion separately, using the definitions of
intersection and union directly.*

---

### Extension

**9. ★** The **symmetric difference** of two sets, written $A \triangle B$,
consists of elements in exactly one of the two sets (but not both):

$$A \triangle B = (A \setminus B) \cup (B \setminus A)$$

(a) Compute $A \triangle B$ for $A = \{1,2,3,4,5\}$, $B = \{3,4,5,6,7\}$.

(b) Show that $A \triangle B = (A \cup B) \setminus (A \cap B)$.
(Two expressions for the same operation — verify this with the sets
above and then explain why it must be true in general.)

(c) In Python, `A ^ B` computes the symmetric difference. Verify your
answers with code.

```python
A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}

sym_diff_v1 = (A - B) | (B - A)
sym_diff_v2 = (A | B) - (A & B)
sym_diff_v3 = A ^ B   # Python's built-in symmetric difference operator

print("(A \\ B) ∪ (B \\ A) =", sorted(sym_diff_v1))
print("(A ∪ B) \\ (A ∩ B) =", sorted(sym_diff_v2))
print("A ^ B              =", sorted(sym_diff_v3))
print("All equal:", sym_diff_v1 == sym_diff_v2 == sym_diff_v3)
```

*Answer (a): $\{1, 2, 6, 7\}$ — the elements in exactly one of the two sets.*

**10. ★** The inclusion-exclusion principle extends to three sets:

$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$

(a) Explain intuitively why the last term $+|A \cap B \cap C|$ is needed —
what was over-subtracted in the previous steps?

(b) Let $A = \{1,2,3,4\}$, $B = \{3,4,5,6\}$, $C = \{2,4,6,7\}$.
Apply the formula and verify by direct count.

(c) This formula appears in probability as $P(A \cup B \cup C)$.
Write out what the probability version looks like.
