# Stage 0, Lesson 0.5 — Relations and Equivalence Classes
**Threads:** Math · CS  
**Estimated time:** 55–70 minutes

---

## What This Lesson Is About

Numbers can be related to each other in many ways: one number can
divide another, two numbers can have the same remainder when divided
by 10, two points can be the same distance from the origin. The concept
that captures all these different "ways of being related" in a single
definition is a **relation** — and it turns out to be nothing more than
a set of ordered pairs. This lesson builds the theory of relations from
that starting point, identifies three key properties a relation can
have, and arrives at the **equivalence relation** — a relation that
groups objects into families of interchangeable things. Equivalence
classes are the foundation of modular arithmetic (the mathematics
behind every cryptographic system), of equality between fractions,
and of the way programming languages implement equality between objects.
By the end of this lesson you will understand what it means for two
things to be "the same" in a mathematically precise sense — which turns
out to be a more subtle question than it first appears.

---

## Historical Context

The formal theory of relations was developed as part of the
mathematisation of logic in the late 19th century. Gottlob Frege
(1879) and Giuseppe Peano (1889) both contributed to making
the idea of a relation precise. Equivalence relations in particular
became central to algebra when Ernst Steinitz used them to construct
quotient structures in 1910 — taking a set, declaring certain elements
"equivalent," and treating each equivalence class as a single new
element. This construction, called a **quotient**, builds the integers
from the natural numbers, the rationals from the integers, and the
real numbers from the rationals. Every time you write $\frac{1}{2} = \frac{2}{4}$,
you are using an equivalence relation.

---

## What You Need To Know First

- **Ordered pairs and the Cartesian product** — Lesson 0.4.
  A relation is a subset of a Cartesian product; we need ordered pairs
  to define it.
- **Sets, subsets, membership** — Lesson 0.1.
  A relation is a set; checking its properties uses membership.
- **Logic: AND, OR, implication** — Lesson 0.3.
  The three properties of equivalence relations are stated as implications.

---

## The Lesson

### What Is a Relation?

```scene
RelationDiagramScene
```


```quiz
{"q": "A relation from A to B is formally:", "options": ["A function from A to B", "A subset of A \u00d7 B", "A pair (A, B)", "An element of A \u2229 B"], "correct": 1, "explanation": "A relation R from A to B is any subset of A \u00d7 B."}
```


In everyday language, "is related to" is vague. In mathematics it is exact.

**Definition:** A **binary relation** $R$ from a set $A$ to a set $B$
is a subset of the Cartesian product $A \times B$:

$$R \subseteq A \times B$$

If $(a, b) \in R$, we say "$a$ is related to $b$" and write $a \mathrel{R} b$.
If $(a, b) \notin R$, we write $a \not\mathrel{R} b$.

When $A = B$ — when the relation connects elements of a set to other
elements of the same set — we call it a **relation on $A$**, and we have
$R \subseteq A \times A$.

**Formal lens:** Every relation is completely and precisely described by
listing its ordered pairs. Two elements are related if and only if their
pair appears in $R$. There is no ambiguity, no hidden context — the relation
is the set.

**Geometric lens:** A relation on $\mathbb{R}$ can be plotted in $\mathbb{R}^2$:
the set of points $(a, b)$ where $a \mathrel{R} b$. The relation
"$a \leq b$" is the region at or above the diagonal line $y = x$.
The relation "$a^2 + b^2 = 1$" is the unit circle. Relations on continuous
sets are curves and regions; relations on finite sets are finite collections
of points or arrows in a diagram.

**Computational lens:** A relation is exactly what a database calls a
**table** — a set of records (ordered tuples). The SQL language is named
after "Structured Query Language" for **relational** databases, where
every table is a mathematical relation.

---

### Examples of Relations

```scene
RelationExamplesScene
```

**Example 1: "Less than" on $\mathbb{Z}$**

$R = \{(a, b) \in \mathbb{Z} \times \mathbb{Z} : a < b\}$

For instance, $(2, 5) \in R$ since $2 < 5$; $(5, 2) \notin R$ since
$5 \not< 2$.

**Example 2: "Divides" on $\{1, 2, 3, 4, 6, 12\}$**

$a \mathrel{R} b$ means "$a$ divides $b$" — there is an integer $k$
such that $b = k \cdot a$.

$$R = \{(1,1),(1,2),(1,3),(1,4),(1,6),(1,12),(2,2),(2,4),(2,6),(2,12),$$
$$(3,3),(3,6),(3,12),(4,4),(4,12),(6,6),(6,12),(12,12)\}$$

**Example 3: "Same remainder mod 3" on $\{0, 1, 2, \ldots, 8\}$**

$a \mathrel{R} b$ means $a$ and $b$ have the same remainder when
divided by 3 — written $a \equiv b \pmod{3}$.

$(0, 3) \in R$ since both have remainder 0. $(1, 7) \in R$ since both
have remainder 1. $(2, 4) \notin R$ since 2 has remainder 2 but 4
has remainder 1.

```python
# Relations as sets of ordered pairs
A = {1, 2, 3, 4, 6, 12}

# "divides" relation: a divides b iff b % a == 0
divides = {(a, b) for a in A for b in A if b % a == 0}

print("'Divides' relation on", sorted(A))
print("Ordered pairs (a, b) where a | b:")
for pair in sorted(divides):
    print(f"  {pair[0]} | {pair[1]}")
print(f"Total pairs: {len(divides)}")
print()

# Check specific membership
print("Does 3 divide 12?", (3, 12) in divides)   # True
print("Does 4 divide 6?",  (4, 6)  in divides)   # False
print("Does 1 divide 1?",  (1, 1)  in divides)   # True
```

**Walkthrough:** `{(a, b) for a in A for b in A if b % a == 0}` is a
set comprehension — the Python equivalent of set-builder notation for the
divides relation. `b % a == 0` checks divisibility: `b % a` computes the
remainder when `b` is divided by `a`, and this is zero exactly when `a`
divides `b`. The comprehension generates all pairs `(a, b)` from
$A \times A$ that satisfy the condition. `(3, 12) in divides` checks
whether the ordered pair $(3, 12)$ is a member of the relation set,
returning `True` because $12 = 4 \times 3$.

---

### Three Key Properties of Relations

```scene
RelationPropertiesScene
```

```quiz
{"q": "A relation R on A is reflexive if:", "options": ["(a,b) in R implies (b,a) in R", "(a,a) in R for every a in A", "(a,b) and (b,c) implies (a,c)", "R = A \u00d7 A"], "correct": 1, "explanation": "Reflexivity: aRa for all a in A. Every element is related to itself."}
```


Relations on a set $A$ can have three important structural properties.
We check these for the relations above.

**Definition:** A relation $R$ on a set $A$ is:

- **Reflexive** if every element is related to itself:
  $\forall a \in A,\ a \mathrel{R} a$.
  *(The symbol $\forall$ means "for all," introduced in Lesson 0.1.)*

- **Symmetric** if whenever $a$ is related to $b$, then $b$ is related
  to $a$:
  $\forall a, b \in A,\ a \mathrel{R} b \Rightarrow b \mathrel{R} a$.

- **Transitive** if whenever $a$ is related to $b$ and $b$ is related
  to $c$, then $a$ is related to $c$:
  $\forall a, b, c \in A,\ (a \mathrel{R} b \text{ and } b \mathrel{R} c) \Rightarrow a \mathrel{R} c$.

**Hand-worked example:** Check which properties the "divides" relation
has on $A = \{1, 2, 3, 4, 6, 12\}$.

**Reflexive?** Does $a \mid a$ for every $a \in A$? Yes — every number
divides itself: $a = 1 \cdot a$. ✓ Reflexive.

**Symmetric?** If $a \mid b$, must $b \mid a$?
Counterexample: $2 \mid 4$ (true) but $4 \nmid 2$ (false, since $2/4$
is not an integer). ✗ Not symmetric.

**Transitive?** If $a \mid b$ and $b \mid c$, must $a \mid c$?
If $b = ka$ and $c = \ell b$, then $c = \ell ka = (\ell k) a$, so $a \mid c$.
✓ Transitive.

**General pattern:** "Divides" is reflexive and transitive but not symmetric.
This is a **partial order** — a concept that reappears in Stage 9 (Discrete
Mathematics) when sorting algorithms need a comparison relation.

```python
A = {1, 2, 3, 4, 6, 12}
divides = {(a, b) for a in A for b in A if b % a == 0}

# Reflexive: (a,a) in R for all a in A?
is_reflexive = all((a, a) in divides for a in A)
print(f"Reflexive: {is_reflexive}")

# Symmetric: if (a,b) in R then (b,a) in R?
is_symmetric = all((b, a) in divides for (a, b) in divides)
print(f"Symmetric: {is_symmetric}")

# Find a counterexample to symmetry
counterexample = next(
    ((a, b) for (a, b) in divides if (b, a) not in divides),
    None
)
print(f"Symmetry counterexample: {counterexample}")

# Transitive: if (a,b) and (b,c) in R then (a,c) in R?
is_transitive = all(
    (a, c) in divides
    for (a, b) in divides
    for (b2, c) in divides
    if b == b2
)
print(f"Transitive: {is_transitive}")
```

**Walkthrough:** `all(condition for x in collection)` returns `True` if
the condition holds for every element of the collection, and `False` as
soon as any element fails it — a direct implementation of the $\forall$
quantifier. `next(generator, None)` retrieves the first element produced
by the generator expression, or `None` if the generator is empty — here
it finds the first pair $(a,b)$ in `divides` whose reverse $(b,a)$ is
not also in `divides`, confirming asymmetry with a concrete example.
The transitivity check uses two nested comprehensions to find all pairs
$(a,b)$ and $(b,c)$ sharing the middle element $b$, and checks that
$(a,c)$ is always in the relation.

---

### Equivalence Relations

```scene
EquivalenceClassScene
```


```quiz
{"q": "An equivalence relation must be:", "options": ["Reflexive only", "Symmetric only", "Reflexive, symmetric, and transitive", "Reflexive and transitive only"], "correct": 2, "explanation": "All three: reflexive (aRa), symmetric (aRb \u2192 bRa), and transitive (aRb and bRc \u2192 aRc)."}
```


A relation that is reflexive, symmetric, and transitive simultaneously
is one of the most important structures in mathematics.

**Definition:** A relation $R$ on a set $A$ is an **equivalence relation**
if it is reflexive, symmetric, and transitive.

When $R$ is an equivalence relation, we typically write $a \sim b$
(read "$a$ is equivalent to $b$") instead of $a \mathrel{R} b$.

**Why these three properties together?** Each condition captures one
aspect of what it means for two things to be "the same kind of thing":

- *Reflexive:* everything is the same kind of thing as itself.
- *Symmetric:* if $a$ is the same kind of thing as $b$, then $b$ is the
  same kind of thing as $a$.
- *Transitive:* if $a$ and $b$ are the same kind, and $b$ and $c$ are the
  same kind, then $a$ and $c$ are the same kind.

These are exactly the properties ordinary equality ($=$) satisfies —
equivalence relations are the generalisation of equality to situations
where "equal" is too strict a standard.

**The key example: congruence modulo $n$**

Fix a positive integer $n$. Define: $a \equiv b \pmod{n}$ (read "$a$ is
congruent to $b$ modulo $n$") if $n$ divides $a - b$ — that is, $a$ and
$b$ have the same remainder when divided by $n$.

**Hand-worked example:** Verify that congruence mod 3 is an equivalence
relation on $\mathbb{Z}$.

**Reflexive:** $a \equiv a \pmod{3}$ because $a - a = 0 = 3 \cdot 0$,
so 3 divides $a-a$. ✓

**Symmetric:** If $a \equiv b \pmod{3}$, then $3 \mid (a-b)$, say $a-b = 3k$.
Then $b - a = -3k = 3(-k)$, so $3 \mid (b-a)$, giving $b \equiv a \pmod{3}$. ✓

**Transitive:** If $a \equiv b \pmod{3}$ and $b \equiv c \pmod{3}$,
then $a - b = 3j$ and $b - c = 3k$ for some integers $j, k$.
Adding: $a - c = (a-b) + (b-c) = 3j + 3k = 3(j+k)$.
So $3 \mid (a-c)$, giving $a \equiv c \pmod{3}$. ✓

All three properties hold, so congruence mod 3 is an equivalence relation. $\blacksquare$

```python
# Congruence mod 3 as an equivalence relation
Z9 = set(range(9))  # working with {0, 1, 2, ..., 8}

mod3_relation = {(a, b) for a in Z9 for b in Z9 if (a - b) % 3 == 0}

is_reflexive  = all((a, a) in mod3_relation for a in Z9)
is_symmetric  = all((b, a) in mod3_relation for (a, b) in mod3_relation)
is_transitive = all(
    (a, c) in mod3_relation
    for (a, b) in mod3_relation
    for (b2, c) in mod3_relation
    if b == b2
)

print("Congruence mod 3 on {0,...,8}:")
print(f"  Reflexive:  {is_reflexive}")
print(f"  Symmetric:  {is_symmetric}")
print(f"  Transitive: {is_transitive}")
print(f"  → Equivalence relation: {is_reflexive and is_symmetric and is_transitive}")
print()

# Show some related pairs
print("Sample related pairs (a ≡ b mod 3):")
for a in range(4):
    related_to_a = sorted(b for b in Z9 if (a - b) % 3 == 0)
    print(f"  {a} is related to: {related_to_a}")
```

**Walkthrough:** `(a - b) % 3 == 0` tests whether `a - b` is divisible
by 3 — the defining condition for congruence mod 3. In Python, the `%`
operator always returns a non-negative result when the divisor is positive,
so `(-1) % 3 == 2`, not `-1`. This means `(a - b) % 3 == 0` is equivalent
to checking that `a` and `b` have the same remainder when divided by 3,
which is exactly the definition.

---

### Equivalence Classes: Grouping the Related

```scene
EquivClassDetailScene
```

```quiz
{"q": "Equivalence classes of a relation partition A into:", "options": ["Overlapping subsets", "A single subset", "Disjoint subsets covering all of A", "Nested subsets"], "correct": 2, "explanation": "Equivalence classes form a partition: disjoint, non-empty, and their union is all of A."}
```


Once we have an equivalence relation, every element naturally belongs to
a group of elements related to it.

**Definition:** Let $\sim$ be an equivalence relation on $A$.
The **equivalence class** of an element $a \in A$, written $[a]$, is
the set of all elements related to $a$:

$$[a] = \{x \in A : x \sim a\}$$

Each element $a$ is always in its own equivalence class (by reflexivity:
$a \sim a$, so $a \in [a]$).

**Hand-worked example:** Find the equivalence classes of congruence
mod 3 on $\{0, 1, 2, \ldots, 8\}$.

The possible remainders when dividing by 3 are 0, 1, and 2.
Group elements by their remainder:

$$[0] = \{0, 3, 6\} \qquad [1] = \{1, 4, 7\} \qquad [2] = \{2, 5, 8\}$$

**Verify:**
- Every element of $\{0,\ldots,8\}$ appears in exactly one class ✓
- Elements in the same class are congruent mod 3 ✓
- Elements in different classes are not congruent mod 3 ✓

Notice that $[0] = [3] = [6]$ — the class of 0, 3, and 6 are all the
same set. There is one class per remainder, not one per element.

**Key theorem:** The equivalence classes of any equivalence relation form
a **partition** of the set — they are pairwise disjoint and their union
is the entire set.

This is not a coincidence. It is the fundamental theorem of equivalence
relations, and it explains why equivalence relations are so useful:
they split a set into clean, non-overlapping groups.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Compute equivalence classes
Z8 = list(range(8))  # {0, 1, 2, ..., 7}

# Mod 2 equivalence classes
classes_mod2 = {}
for n in Z8:
    remainder = n % 2
    if remainder not in classes_mod2:
        classes_mod2[remainder] = []
    classes_mod2[remainder].append(n)

print("Equivalence classes of {0,...,7} under mod 2:")
for remainder, members in sorted(classes_mod2.items()):
    print(f"  [{remainder}]₂ = {members}")
print()

# Verify partition: pairwise disjoint and covers all elements
all_classes = list(classes_mod2.values())
class_0 = set(all_classes[0])
class_1 = set(all_classes[1])

print("Partition verification:")
print(f"  Classes disjoint: {class_0 & class_1 == set()}")
print(f"  Classes cover all: {class_0 | class_1 == set(Z8)}")
print()

# Visualise: elements sorted into labelled buckets
fig, ax = plt.subplots(figsize=(9, 5))
ax.set_xlim(0, 9)
ax.set_ylim(0, 5)
ax.axis('off')
ax.set_title('Equivalence classes of mod 2 on {0, 1, ..., 7}:\n'
             'a partition into even and odd numbers', fontsize=12)

# Two ovals for the two classes
even_oval = patches.Ellipse((2.5, 2.5), width=4.0, height=3.5,
    fill=True, facecolor='#d5e8d4', edgecolor='#27ae60', linewidth=2.5)
odd_oval  = patches.Ellipse((6.5, 2.5), width=4.0, height=3.5,
    fill=True, facecolor='#dce8f5', edgecolor='#2980b9', linewidth=2.5)
ax.add_patch(even_oval)
ax.add_patch(odd_oval)

evens = sorted(classes_mod2[0])
odds  = sorted(classes_mod2[1])

for i, n in enumerate(evens):
    ax.text(2.5, 3.6 - i * 0.8, str(n), ha='center', va='center',
            fontsize=16, fontweight='bold', color='#27ae60')
for i, n in enumerate(odds):
    ax.text(6.5, 3.6 - i * 0.8, str(n), ha='center', va='center',
            fontsize=16, fontweight='bold', color='#2980b9')

ax.text(2.5, 0.4, r'$[0]_2$ (even numbers)', ha='center',
        fontsize=11, color='#27ae60', fontweight='bold')
ax.text(6.5, 0.4, r'$[1]_2$ (odd numbers)', ha='center',
        fontsize=11, color='#2980b9', fontweight='bold')

plt.tight_layout()
plt.show()
```

**Walkthrough:** The first section builds the equivalence classes by
grouping elements of `{0,...,7}` by their remainder mod 2 — each element
is placed in the bucket for its remainder. `classes_mod2` is a Python
dictionary mapping each remainder (0 or 1) to a list of elements with
that remainder. The partition verification confirms the two classes are
disjoint (`class_0 & class_1 == set()`) and together cover all elements
(`class_0 | class_1 == set(Z8)`). The visualisation uses two ovals —
precisely the Venn diagram picture from Lesson 0.2, now interpreted as
equivalence classes: no overlap (disjoint), and every number appears
in exactly one oval.

---

### The Quotient Set

```scene
QuotientSetScene
```

When we have an equivalence relation $\sim$ on $A$, we can form a new set
whose elements are the equivalence classes themselves.

**Definition:** The **quotient set** (or **quotient**) of $A$ by $\sim$,
written $A / {\sim}$, is the set of all equivalence classes:

$$A/{\sim} = \{[a] : a \in A\}$$

**Example:** $\{0,1,\ldots,8\} / {\equiv_3} = \{[0],[1],[2]\}$
— a set with three elements, one per remainder.

This is how the integers are built from the natural numbers: take pairs
$(a, b)$ representing "the integer $a - b$," declare $(a,b) \sim (c,d)$
when $a + d = b + c$ (same difference), and take the quotient. Each
equivalence class is one integer. The fractions are built the same way:
declare $\frac{a}{b} \sim \frac{c}{d}$ when $ad = bc$, and take the
quotient of pairs.

**Computational lens:** Hashing in computer science is based on equivalence
classes. A hash function maps elements to hash values; elements with the
same hash value end up in the same "bucket." If the hash function respects
equality (equal elements always have the same hash), then it is computing
a quotient — grouping equal elements into the same class. Python requires
that objects satisfying `a == b` must satisfy `hash(a) == hash(b)` for
exactly this reason.

---

## Connect the Pieces

**What this lesson built on:** Ordered pairs and Cartesian products
(Lesson 0.4) — a relation is a subset of $A \times A$. Sets and
membership (Lesson 0.1) — checking properties uses $\in$. Logic
(Lesson 0.3) — the three properties are stated as implications using $\forall$.

**What this lesson makes possible:**
- Lesson 0.7 (Functions) — a function is a special kind of relation:
  one where each first coordinate appears in at most one pair.
- Stage 1, Lesson 1.7 (Modular arithmetic) — congruence mod $n$ is the
  central example, now understood formally as an equivalence relation
  with $n$ classes.
- Stage 9 (Abstract Algebra) — groups, rings, and fields are all built
  from quotient constructions using equivalence relations.

**In computer science:** The `==` operator defines an equivalence relation
on any type: reflexive (every object equals itself), symmetric (`a == b`
iff `b == a`), transitive (if `a == b` and `b == c` then `a == c`).
The `hashCode`/`hash` contract in Java and Python is the requirement that
the hash function be constant on equivalence classes.

---

## Summary

**Binary relation:** $R \subseteq A \times B$. A relation on $A$ has
$R \subseteq A \times A$.

**Notation:** $a \mathrel{R} b$ means $(a,b) \in R$.

**Three properties (for relations on $A$):**

| Property | Definition |
|----------|-----------|
| Reflexive | $\forall a \in A:\ a \mathrel{R} a$ |
| Symmetric | $\forall a,b \in A:\ a \mathrel{R} b \Rightarrow b \mathrel{R} a$ |
| Transitive | $\forall a,b,c \in A:\ (a \mathrel{R} b \text{ and } b \mathrel{R} c) \Rightarrow a \mathrel{R} c$ |

**Equivalence relation:** Reflexive AND symmetric AND transitive.
Written $a \sim b$.

**Equivalence class:** $[a] = \{x \in A : x \sim a\}$.

**Partition theorem:** The equivalence classes of any equivalence relation
on $A$ form a partition of $A$ — pairwise disjoint sets whose union is $A$.

**Congruence mod $n$:** $a \equiv b \pmod{n}$ iff $n \mid (a-b)$.
Equivalence classes: $[0], [1], \ldots, [n-1]$ — one per remainder.

**Quotient set:** $A/{\sim} = \{[a] : a \in A\}$ — the set of equivalence classes.

---

## Problems

### Computation

**1.** For each relation $R$ on $A = \{1, 2, 3, 4\}$ below, determine
whether it is reflexive, symmetric, and/or transitive. Show your reasoning
for each property.

(a) $R = \{(1,1),(2,2),(3,3),(4,4),(1,2),(2,1)\}$

(b) $R = \{(1,2),(2,3),(1,3)\}$

(c) $R = \{(1,1),(2,2),(3,3),(4,4),(1,2),(2,3),(1,3)\}$

*Answers:
(a) Reflexive ✓, Symmetric ✓, Transitive ✓ (equivalence relation).
(b) Reflexive ✗ (no $(1,1)$), Symmetric ✗ ($(1,2)$ but not $(2,1)$), Transitive ✓.
(c) Reflexive ✓, Symmetric ✗ ($(1,2)$ but not $(2,1)$), Transitive ✓.*

**2.** Find all equivalence classes of congruence mod 4 on $\{0,1,...,11\}$.

*Answer: $[0]=\{0,4,8\}$, $[1]=\{1,5,9\}$, $[2]=\{2,6,10\}$, $[3]=\{3,7,11\}$*

**3.** Consider the relation "$a$ and $b$ have the same first letter"
on the set $\{\text{cat, cow, dog, deer, eagle, elk}\}$.
(a) List the equivalence classes.
(b) What is the quotient set?

*Answers: (a) $\{$cat, cow$\}$, $\{$dog, deer$\}$, $\{$eagle, elk$\}$
(b) $\bigl\{\{$cat,cow$\}$, $\{$dog,deer$\}$, $\{$eagle,elk$\}\bigr\}$*

---

### Understanding

**4.** A student says "the relation $R = \{(1,2),(2,1)\}$ on $\{1,2\}$
is an equivalence relation because it's symmetric." What is missing
from their argument?

*Guidance: It is not reflexive — $(1,1)$ and $(2,2)$ are not in $R$.
And it is not transitive — $(1,2)$ and $(2,1)$ are in $R$, so transitivity
requires $(1,1) \in R$, but it is not. All three properties must hold.*

**5.** Explain why "is the same age as" is an equivalence relation on
the set of all people, while "is older than" is not.

*Guidance: "Same age" is reflexive (you're the same age as yourself),
symmetric (if A is the same age as B, B is the same age as A), and
transitive. "Older than" is not reflexive (you're not older than yourself)
and not symmetric.*

---

### Proof

**6.** Prove that congruence mod $n$ is an equivalence relation on $\mathbb{Z}$
for any positive integer $n$. (Generalise the mod 3 proof from the lesson.)

*Proof structure: State all three properties and prove each. The mod 3
proof in the lesson is the template — replace 3 with $n$ throughout.*

**7.** Prove the **partition theorem**: if $\sim$ is an equivalence relation
on $A$, then the equivalence classes are pairwise disjoint and their union
is $A$.

*Proof strategy: For disjointness, suppose $[a] \cap [b] \neq \emptyset$
and show $[a] = [b]$. For the union being $A$: every $a \in A$ satisfies
$a \in [a]$ by reflexivity.*

*Key step for disjointness: If $c \in [a] \cap [b]$, then $c \sim a$ and
$c \sim b$. By symmetry, $a \sim c$. By transitivity with $c \sim b$,
we get $a \sim b$. Now show $[a] \subseteq [b]$: if $x \in [a]$ then
$x \sim a \sim b$, so $x \in [b]$. By symmetry, $[b] \subseteq [a]$.*

---

### Extension

**8. ★** Define the relation $\sim$ on $\mathbb{Z} \times \mathbb{Z}$
(pairs of integers, with second coordinate nonzero) by:

$$(a, b) \sim (c, d) \quad \iff \quad ad = bc$$

(a) Verify this is an equivalence relation.

(b) The equivalence class of $(1, 2)$ contains $(1,2), (2,4), (3,6), \ldots$
What does this equivalence class represent?

(c) The quotient $(\mathbb{Z} \times \mathbb{Z} \setminus \{0\}) / {\sim}$
is a well-known number system. Which one, and why?

*Answer: (b) All pairs $(a,b)$ with $a/b = 1/2$ — the rational number $\frac{1}{2}$.
(c) The rational numbers $\mathbb{Q}$. This construction builds $\mathbb{Q}$
from $\mathbb{Z}$ by treating a fraction $\frac{a}{b}$ as an equivalence
class of pairs.*

**9. ★ (Connecting to modular arithmetic and cryptography)**

The integers mod $n$, written $\mathbb{Z}/n\mathbb{Z}$, are the quotient
of $\mathbb{Z}$ by congruence mod $n$. For $n = 5$:

(a) List the five equivalence classes of $\mathbb{Z}/5\mathbb{Z}$.

(b) Define addition on these classes: $[a] + [b] = [a+b]$.
Compute $[3] + [4]$ in $\mathbb{Z}/5\mathbb{Z}$.

(c) Compute $[2] \times [4]$ in $\mathbb{Z}/5\mathbb{Z}$.

(d) In Stage 10 (Number Theory), you will prove that $\mathbb{Z}/p\mathbb{Z}$
for prime $p$ is a **field** — a number system where you can add, subtract,
multiply, and divide (except by $[0]$). The RSA cryptographic system and
AES encryption both operate in finite fields of this form. For now, just
verify: what is $[2]^{-1}$ in $\mathbb{Z}/5\mathbb{Z}$? That is, find
$[x]$ such that $[2] \times [x] = [1]$.

*Answers: (a) $[0],[1],[2],[3],[4]$
(b) $[3]+[4]=[7]=[2]$ (since $7 \equiv 2 \pmod{5}$)
(c) $[2]\times[4]=[8]=[3]$
(d) $[3]$, since $2 \times 3 = 6 \equiv 1 \pmod 5$*
