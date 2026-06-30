# Stage 0, Lesson 0.1 — Sets: Collecting and Describing Things
**Threads:** Math · CS  
**Estimated time:** 45–60 minutes

---

## What This Lesson Is About

Before you can do mathematics precisely, you need a language to write it in.
The most basic object in that language is a **set** — a collection of distinct
things, considered as a single object. Sets sound simple, and in one sense they
are: a set is just a bag of things. But the moment you ask what "things" are
allowed, whether order matters, what it means for two sets to be equal, and how
one collection can live inside another, you are doing real mathematics. This
lesson builds that language from scratch. By the end you will be able to describe
any collection precisely using mathematical notation, check whether something
belongs to a set, determine whether one set is contained in another, and compare
two sets for equality — all with the rigour that the rest of this curriculum
depends on.

---

## Historical Context

Georg Cantor, a German mathematician, developed the theory of sets between 1874
and 1884. He was not trying to build a foundation for mathematics — he was trying
to answer a specific question about trigonometric series: could the same function
be represented in more than one way? To answer it, he needed precise language for
talking about "collections of points on a line," and set theory grew from that
need. His work was revolutionary enough that the mathematician Henri Poincaré
called it "a disease from which mathematics will one day recover" — and
fundamental enough that today every branch of mathematics is written in it.

---

## What You Need To Know First

This is the first lesson. No mathematical prerequisites beyond the following,
which are part of your starting assumption:

- **Algebra:** variables, equations, what it means to substitute a value
- **Number familiarity:** you know what integers, fractions, and decimals are,
  even if you have not yet studied them formally

Both will be formalised in this curriculum. For now, the informal understanding
is enough.

---

## The Lesson

### What Is a Set?

We need a way to talk about collections of things as single objects. "The
students in this classroom," "the even numbers," "the solutions to $x^2 = 4$,"
"the primary colours" — each of these is a collection we might want to reason
about as a whole. A **set** gives us that ability.

**Formal definition:** A **set** is an unordered collection of distinct objects.
The objects in a set are called its **elements** or **members**.

Three words in that definition carry weight:

- **Unordered** — the set $\{1, 2, 3\}$ and the set $\{3, 1, 2\}$ are the same
  set. Order does not matter. A set is not a list.
- **Distinct** — each element appears at most once. The collection $\{1, 1, 2\}$
  is not a valid set — or rather, it describes the same set as $\{1, 2\}$,
  because repetition carries no information in a set.
- **Objects** — elements can be anything: numbers, letters, other sets, points
  in space, functions, people. The theory places no restriction on what kind of
  thing an element can be.

**Geometric picture:** Picture a set as a closed boundary — an oval drawn on
paper — with its elements sitting inside. The boundary separates "things in this
set" from "things not in this set." Everything inside is an element; everything
outside is not. Later, when we draw two overlapping ovals, the overlap will
represent elements belonging to both sets at once. This picture, called a
**Venn diagram**, is the standard geometric representation of sets.

**Computational connection:** Python has a built-in `set` data type that
implements exactly this mathematical structure. Every element is stored at most
once, and order is not preserved. We will use Python sets throughout this lesson
to verify our hand calculations.

---

### Notation: How to Write a Set

There are two standard ways to describe a set in writing.

**Roster notation** lists the elements explicitly, separated by commas and
enclosed in curly braces:

$$A = \{1, 2, 3, 4, 5\}$$

This works when the set is small enough to list completely, or when a clear
pattern can be suggested with an ellipsis:

$$\mathbb{N} = \{1, 2, 3, 4, 5, \ldots\}$$

The symbol $\mathbb{N}$ — a bold or double-struck capital N — is the standard
name for the **natural numbers**, the counting numbers starting from 1.
(Some authors include 0; this curriculum follows the convention that
$\mathbb{N} = \{1, 2, 3, \ldots\}$ and treats 0 separately.)

**Set-builder notation** describes the elements by stating a property they
must satisfy:

$$\{x : x \text{ is an even integer and } 1 \leq x \leq 10\}$$

Read this as: "the set of all $x$ such that $x$ is an even integer between 1
and 10." The colon $:$ means "such that." Some authors write $|$ instead of $:$;
both mean the same thing.

The same set in roster notation would be $\{2, 4, 6, 8, 10\}$.

Set-builder notation is essential when the set is infinite or when the defining
property is easier to state than the elements are to list:

$$\{x \in \mathbb{N} : x^2 < 20\} = \{1, 2, 3, 4\}$$

Read: "the set of natural numbers $x$ such that $x^2 < 20$." The notation
$x \in \mathbb{N}$ will be explained in the next section.

---

### Membership: $\in$ and $\notin$

The most fundamental relationship between an element and a set is membership.

**Definition:** We write $x \in S$ to mean "$x$ is an element of $S$" — $x$
belongs to the set $S$. We write $x \notin S$ to mean "$x$ is not an element
of $S$."

The symbol $\in$ is a stylised lowercase epsilon (the Greek letter $\varepsilon$),
chosen by the Italian mathematician Giuseppe Peano in 1889 to abbreviate the
Latin word *est* (meaning "is").

**Hand-worked example:** Let $A = \{1, 2, 3, 4, 5\}$. Determine which of the
following statements are true:

$$3 \in A \qquad 6 \in A \qquad 0 \notin A \qquad \{1,2\} \in A$$

Working through each:

- $3 \in A$: Is 3 in the list $\{1, 2, 3, 4, 5\}$? Yes. **True.**
- $6 \in A$: Is 6 in the list? No. **False.** The correct statement is $6 \notin A$.
- $0 \notin A$: Is 0 absent from the list? Yes, 0 does not appear. **True.**
- $\{1,2\} \in A$: Is the set $\{1,2\}$ itself one of the elements of $A$?
  No — $A$ contains the numbers 1, 2, 3, 4, 5, not sets. **False.**

The last example is important: $1 \in A$ is true, but $\{1\} \in A$ is false.
The number 1 and the set containing only the number 1 are different objects.
This distinction matters throughout mathematics.

**Verification in code:**

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Define the set
A = {1, 2, 3, 4, 5}

# Check membership
print("A =", A)
print()
print("3 in A:", 3 in A)      # True
print("6 in A:", 6 in A)      # False
print("0 not in A:", 0 not in A)  # True

# The set {1,2} as an element — Python frozensets allow this
# A regular set {1,2} cannot be an element (sets are not hashable in Python),
# but this demonstrates the concept:
print()
print("The number 1 is in A:", 1 in A)
print("The set {1} is not in A (it is a different kind of object)")
```

**Walkthrough:** `A = {1, 2, 3, 4, 5}` creates a Python set containing
the five integers. `3 in A` uses Python's `in` operator, which returns
`True` if the value appears in the collection and `False` otherwise.
This is the direct computational equivalent of the mathematical $3 \in A$.
`0 not in A` combines `not` with `in` — it returns `True` when the value
is absent. Running this confirms all four membership checks above.

**Visualising membership:**

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_set(ax, elements, title, element_color='#2980b9'):
    """Draw a set as an oval containing its elements."""
    # The oval boundary represents the set
    oval = patches.Ellipse(
        (0.5, 0.5), width=0.85, height=0.65,
        fill=True, facecolor='#e8f4fd',
        edgecolor='#2980b9', linewidth=2.5
    )
    ax.add_patch(oval)

    # Position elements inside the oval
    positions = [
        (0.25, 0.55), (0.45, 0.67), (0.65, 0.55),
        (0.35, 0.36), (0.60, 0.36)
    ]
    for element, (x, y) in zip(elements, positions):
        ax.text(x, y, str(element), fontsize=18,
                ha='center', va='center',
                color=element_color, fontweight='bold')

    ax.set_xlim(0, 1)
    ax.set_ylim(0.05, 0.95)
    ax.axis('off')
    ax.set_title(title, fontsize=13, pad=10)

fig, ax = plt.subplots(figsize=(6, 5))
draw_set(ax, [1, 2, 3, 4, 5], r'$A = \{1, 2, 3, 4, 5\}$')

# Mark that 6 is outside
ax.text(0.88, 0.55, '6', fontsize=18, ha='center', va='center',
        color='#e74c3c', fontweight='bold')
ax.text(0.88, 0.38, r'$6 \notin A$', fontsize=11,
        ha='center', va='center', color='#e74c3c')

plt.suptitle('Elements inside the boundary belong to the set.\n'
             'Elements outside do not.', fontsize=11, y=0.02)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `patches.Ellipse` draws an oval — the boundary that
represents the set. `ax.add_patch(oval)` adds it to the axes.
Each element is placed using `ax.text(x, y, str(element))`, which draws
a text label at coordinates `(x, y)` within the axes. The number 6 is
drawn outside the oval in red, with the label $6 \notin A$ below it,
making the membership relationship directly visible. The function
`draw_set` packages this drawing logic so it can be reused in subsequent
blocks — defined once here, reused with the comment "unchanged" below.

---

### The Empty Set

There is one set that deserves its own name: the set containing nothing.

**Definition:** The **empty set**, written $\emptyset$ or $\{\}$, is the
unique set with no elements. For every object $x$, $x \notin \emptyset$.

The empty set sounds trivial. It is not. The empty set is the starting
point from which all of set theory is built — you can construct every
natural number from the empty set alone using set operations, a fact
that will reappear in Stage 0's lesson on formal number construction.
For now, the empty set matters for one practical reason: many set
descriptions produce it, and we need to be able to say "nothing here"
without confusion.

**Example:** $\{x \in \mathbb{N} : x < 0\} = \emptyset$. There are no
natural numbers less than zero.

**Common error:** $\emptyset \neq \{\emptyset\}$. The empty set has no
elements. The set $\{\emptyset\}$ has exactly one element — the empty
set itself. This is the same distinction as between the number 0 and a
bag containing 0.

```python
# The empty set
empty_set = set()   # set() creates an empty set; {} would create an empty dict

print("empty set:", empty_set)
print("size of empty set:", len(empty_set))  # len() returns the number of elements
print("Is 1 in the empty set?", 1 in empty_set)
print()

# The set containing the empty set is different
# Python cannot directly store a mutable set inside a set,
# but the concept: {∅} has exactly one element
print("∅ has 0 elements. {∅} would have 1 element.")
print("These are different objects, just as 0 ≠ {0}.")
```

**Walkthrough:** `set()` with no arguments creates an empty set.
Note the important Python detail: `{}` looks like it should create
an empty set, but Python interprets `{}` as an empty **dictionary**
(a different data structure). `set()` is required for the empty set.
`len(empty_set)` returns 0 — confirming no elements. `1 in empty_set`
returns `False` — nothing is in the empty set, as the definition requires.

---

### Subsets

One set can be contained within another. This relationship is called
the **subset** relation and it is one of the most important in all of
mathematics.

**Definition:** A set $B$ is a **subset** of a set $A$, written $B \subseteq A$,
if every element of $B$ is also an element of $A$:

$$B \subseteq A \quad \iff \quad \text{for every } x, \text{ if } x \in B \text{ then } x \in A$$

The symbol $\iff$ means "if and only if" — both directions hold. Read
$B \subseteq A$ as "$B$ is a subset of $A$" or "$B$ is contained in $A$."

If $B \subseteq A$ but $B \neq A$ — that is, $A$ has at least one element
not in $B$ — we say $B$ is a **proper subset** of $A$ and write $B \subsetneq A$.

**Important facts that follow directly from the definition:**

1. Every set is a subset of itself: $A \subseteq A$ for any set $A$.
   *(Check: every element of $A$ is in $A$. Trivially true.)*

2. The empty set is a subset of every set: $\emptyset \subseteq A$
   for any set $A$.
   *(Check: the condition "every element of $\emptyset$ is in $A$" is
   vacuously true — there are no elements of $\emptyset$ to check.)*

**Hand-worked example:** Let $A = \{1, 2, 3, 4, 5\}$, $B = \{2, 4\}$,
$C = \{2, 4, 7\}$. Determine whether each is a subset of $A$.

**Is $B \subseteq A$?**
Check every element of $B$:
- $2 \in B$: is $2 \in A$? Yes. ✓
- $4 \in B$: is $4 \in A$? Yes. ✓
Every element of $B$ is in $A$, so $B \subseteq A$. **True.**
Since $A$ contains 1, 3, 5 which are not in $B$, we also have $B \subsetneq A$.

**Is $C \subseteq A$?**
Check every element of $C$:
- $2 \in C$: is $2 \in A$? Yes. ✓
- $4 \in C$: is $4 \in A$? Yes. ✓
- $7 \in C$: is $7 \in A$? No. ✗
One element of $C$ is not in $A$, so $C \not\subseteq A$. **False.**

**Verify:** The moment one element of $C$ fails to be in $A$, the
subset relation fails. We do not need to check further.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

A = {1, 2, 3, 4, 5}
B = {2, 4}
C = {2, 4, 7}

print("A =", A)
print("B =", B)
print("C =", C)
print()

# Subset checks: <= is Python's subset operator
print("B ⊆ A:", B <= A)   # True
print("C ⊆ A:", C <= A)   # False
print()

# Proper subset: < means subset but not equal
print("B ⊊ A (B is a proper subset of A):", B < A)  # True
print("A ⊆ A (every set is a subset of itself):", A <= A)  # True
print("A ⊊ A (no set is a proper subset of itself):", A < A)  # False
print()
print("∅ ⊆ A:", set() <= A)   # True — empty set is subset of everything
```

**Walkthrough:** Python's `<=` operator on sets checks the subset
relation: `B <= A` returns `True` if every element of `B` is in `A`.
Python's `<` operator checks proper subset: `B < A` requires additionally
that `B != A`. Running this reproduces all five results from the
hand-worked example, confirming the computation.

**Visualising subsets:**

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# --- Left plot: B ⊆ A ---
ax = axes[0]
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')
ax.set_title(r'$B \subseteq A$: every element of $B$ is in $A$',
             fontsize=12, pad=12)

# Outer oval: A
outer = patches.Ellipse((0.5, 0.5), width=0.85, height=0.65,
    fill=True, facecolor='#e8f4fd', edgecolor='#2980b9', linewidth=2.5)
# Inner oval: B, sitting inside A
inner = patches.Ellipse((0.38, 0.48), width=0.35, height=0.3,
    fill=True, facecolor='#d5e8d4', edgecolor='#27ae60', linewidth=2)
ax.add_patch(outer)
ax.add_patch(inner)

# Elements of A not in B
for element, (x, y) in zip([1, 3, 5],
                             [(0.68, 0.63), (0.68, 0.38), (0.52, 0.74)]):
    ax.text(x, y, str(element), fontsize=16, ha='center', va='center',
            color='#2980b9', fontweight='bold')

# Elements of B (inside inner oval)
for element, (x, y) in zip([2, 4], [(0.32, 0.52), (0.44, 0.42)]):
    ax.text(x, y, str(element), fontsize=16, ha='center', va='center',
            color='#27ae60', fontweight='bold')

ax.text(0.75, 0.78, 'A', fontsize=15, color='#2980b9', fontweight='bold')
ax.text(0.23, 0.65, 'B', fontsize=15, color='#27ae60', fontweight='bold')

# --- Right plot: C ⊄ A ---
ax = axes[1]
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')
ax.set_title(r'$C \not\subseteq A$: element 7 is in $C$ but not $A$',
             fontsize=12, pad=12)

outer2 = patches.Ellipse((0.45, 0.5), width=0.75, height=0.6,
    fill=True, facecolor='#e8f4fd', edgecolor='#2980b9', linewidth=2.5)
ax.add_patch(outer2)

for element, (x, y) in zip([1, 2, 3, 4, 5],
                             [(0.25, 0.58), (0.4, 0.67),
                              (0.55, 0.58), (0.33, 0.38), (0.55, 0.38)]):
    ax.text(x, y, str(element), fontsize=16, ha='center', va='center',
            color='#2980b9', fontweight='bold')

# Element 7 — outside A, shown in red
ax.text(0.88, 0.58, '7', fontsize=16, ha='center', va='center',
        color='#e74c3c', fontweight='bold')
ax.annotate('', xy=(0.80, 0.55), xytext=(0.84, 0.55),
            arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=1.5))
ax.text(0.83, 0.42, r'$7 \notin A$', fontsize=11,
        ha='center', va='center', color='#e74c3c')

ax.text(0.72, 0.78, 'A', fontsize=15, color='#2980b9', fontweight='bold')

plt.suptitle(r'Subset ($B \subseteq A$) vs. non-subset ($C \not\subseteq A$)',
             fontsize=13, y=1.01)
plt.tight_layout()
plt.show()
```

**Walkthrough:** The left plot shows $B$ as a smaller green oval sitting
entirely inside the blue oval $A$ — a direct picture of "every element of
$B$ is in $A$." The right plot shows that $C$'s element 7 sits outside
$A$'s boundary, with an arrow and label making the failure visible. These
two plots encode the entire definition of subset as a spatial relationship:
$B \subseteq A$ means the $B$-oval fits inside the $A$-oval.

---

### Set Equality

When are two sets the same set?

**Definition:** Two sets $A$ and $B$ are **equal**, written $A = B$,
if they have exactly the same elements:

$$A = B \quad \iff \quad A \subseteq B \text{ and } B \subseteq A$$

This definition is not circular — it reduces equality to two subset
checks. To prove $A = B$, the standard approach is to prove both
$A \subseteq B$ and $B \subseteq A$ separately.

Since sets are unordered and elements are distinct, the following are all
equal sets:

$$\{1, 2, 3\} = \{3, 1, 2\} = \{2, 1, 3\} = \{1, 1, 2, 3\}$$

The last one might look different — it repeats 1 — but since sets contain
each element at most once, the repeated 1 is ignored.

**Hand-worked example:** Prove that $\{x \in \mathbb{N} : x^2 \leq 9\} = \{1, 2, 3\}$.

Let $P = \{x \in \mathbb{N} : x^2 \leq 9\}$ and $Q = \{1, 2, 3\}$.
We prove $P = Q$ by showing $P \subseteq Q$ and $Q \subseteq P$.

**$P \subseteq Q$:** Let $x \in P$, so $x \in \mathbb{N}$ and $x^2 \leq 9$.
Natural numbers with $x^2 \leq 9$:
- $x = 1$: $1^2 = 1 \leq 9$ ✓ and $1 \in Q$ ✓
- $x = 2$: $2^2 = 4 \leq 9$ ✓ and $2 \in Q$ ✓
- $x = 3$: $3^2 = 9 \leq 9$ ✓ and $3 \in Q$ ✓
- $x = 4$: $4^2 = 16 > 9$ ✗ — stops here

Every element of $P$ is in $Q$, so $P \subseteq Q$.

**$Q \subseteq P$:** The elements of $Q$ are 1, 2, 3. We need each
to satisfy $x^2 \leq 9$: $1^2 = 1 \leq 9$ ✓, $2^2 = 4 \leq 9$ ✓,
$3^2 = 9 \leq 9$ ✓. So $Q \subseteq P$.

Since $P \subseteq Q$ and $Q \subseteq P$, we conclude $P = Q$. $\blacksquare$

The symbol $\blacksquare$ (a filled square) marks the end of a proof.

```python
# Verify set equality
P = {x for x in range(1, 20) if x**2 <= 9}  # set-builder in Python
Q = {1, 2, 3}

print("P =", P)
print("Q =", Q)
print()
print("P == Q:", P == Q)
print("P ⊆ Q:", P <= Q)
print("Q ⊆ P:", Q <= P)
print()

# Order and repetition do not matter
S1 = {1, 2, 3}
S2 = {3, 1, 2}
print("{1,2,3} == {3,1,2}:", S1 == S2)
```

**Walkthrough:** `{x for x in range(1, 20) if x**2 <= 9}` is a
**set comprehension** — Python's syntax for set-builder notation.
Read it as: "the set of values `x`, for `x` ranging from 1 to 19,
such that `x**2 <= 9`." (`x**2` is Python's notation for $x^2$;
`**` is the exponentiation operator.) The range 1 to 20 is safely
larger than needed — any natural number with $x^2 \leq 9$ will
be caught, and larger values will be filtered out. `P == Q` confirms
equality. The final two lines confirm that $\{1,2,3\} = \{3,1,2\}$
because Python sets, like mathematical sets, are unordered.

---

### Cardinality

A natural question about any set is: how many elements does it have?

**Definition:** The **cardinality** of a set $A$, written $|A|$, is the
number of elements in $A$. For a finite set, this is simply a count.

$$|\{1, 2, 3, 4, 5\}| = 5 \qquad |\{a, b\}| = 2 \qquad |\emptyset| = 0$$

Cardinality becomes subtle for infinite sets — Cantor showed that some
infinite sets are larger than others, in a precise sense that led to the
theory of cardinal numbers. That is Stage 0's final lesson. For now,
cardinality is just counting.

```python
A = {1, 2, 3, 4, 5}
B = {2, 4}
empty_set = set()

print("|A| =", len(A))          # 5
print("|B| =", len(B))          # 2
print("|∅| =", len(empty_set))  # 0
print()

# Set-builder: count natural numbers satisfying a condition
evens_under_20 = {x for x in range(1, 20) if x % 2 == 0}
print("Even numbers from 1 to 19:", sorted(evens_under_20))
print("Count:", len(evens_under_20))
```

**Walkthrough:** `len()` is a Python built-in function that accepts
any collection and returns the number of elements it contains.
`len(A)` returns 5, `len(empty_set)` returns 0. The `sorted()` function
— which accepts a set and returns a sorted list, not a set — is used only
for display: since sets are unordered, printing them directly can give
elements in any order. Sorting for display is a code-level convenience,
not a mathematical operation on the set itself.

---

### The Standard Number Sets

Mathematics uses several sets so often that they have permanent names
and dedicated symbols. These appear in virtually every subsequent lesson.

| Symbol | Name | Elements |
|--------|------|----------|
| $\mathbb{N}$ | Natural numbers | $\{1, 2, 3, 4, \ldots\}$ |
| $\mathbb{Z}$ | Integers | $\{\ldots, -2, -1, 0, 1, 2, \ldots\}$ |
| $\mathbb{Q}$ | Rational numbers | All fractions $\frac{p}{q}$ with $p, q \in \mathbb{Z}$, $q \neq 0$ |
| $\mathbb{R}$ | Real numbers | All points on the number line |
| $\mathbb{C}$ | Complex numbers | Numbers of the form $a + bi$ |

The letters are the initial letters of the names in various European
languages: $\mathbb{Z}$ from the German *Zahlen* (numbers),
$\mathbb{Q}$ from *quotient*, $\mathbb{R}$ from *real*.

These sets form a chain of subsets:

$$\mathbb{N} \subsetneq \mathbb{Z} \subsetneq \mathbb{Q} \subsetneq \mathbb{R} \subsetneq \mathbb{C}$$

Each is a proper subset of the next. Every natural number is an integer.
Every integer is a rational number (write $n$ as $\frac{n}{1}$). Not every
rational number is an integer (e.g. $\frac{1}{2}$). Later lessons will prove
that not every real number is rational — $\sqrt{2}$ is the first example.

---

## Connect the Pieces

**What this lesson built on:** The informal understanding of numbers and
collections you arrived with. Sets give that understanding a precise language.

**What this lesson makes possible:** Everything. The next lesson (0.2) uses
sets to define union, intersection, and complement — the three operations
that turn sets into an algebra. Lesson 0.7 defines a function as a special
kind of set. Every object in this curriculum — vector spaces, groups, probability
spaces, graphs — is defined as a set with additional structure. The precision
of set notation is what allows those definitions to be unambiguous.

**In computer science:** Python's `set`, Java's `HashSet`, and SQL's
`SELECT DISTINCT` all implement the mathematical set directly. Database tables
are sets of records. A compiler's symbol table is a set of name-value pairs.
Type theory — the foundation of every modern programming language's type system
— is built on sets: a type is a set of values, and a function type is a set of
input-output pairs.

**In engineering:** The feasible region of an engineering optimisation
problem (all designs satisfying the constraints) is a set. Tolerance zones
in manufacturing are sets of acceptable dimensions. The solution set of a
system of equations is a set — often the empty set (no solution), a single
point, a line, or a plane.

---

## Summary

**Set** — an unordered collection of distinct objects. Written in roster
notation $\{1, 2, 3\}$ or set-builder notation $\{x : \text{condition}\}$.

**Element / Member** — an object in a set. $x \in A$ means $x$ is in $A$.
$x \notin A$ means $x$ is not in $A$.

**Empty set** — $\emptyset = \{\}$, the unique set with no elements.
$|\emptyset| = 0$. $\emptyset \subseteq A$ for every set $A$.

**Subset** — $B \subseteq A$ if every element of $B$ is in $A$.
$B \subsetneq A$ if additionally $B \neq A$.
Every set is a subset of itself. The empty set is a subset of every set.

**Set equality** — $A = B$ if and only if $A \subseteq B$ and $B \subseteq A$.
Equivalently: $A$ and $B$ have exactly the same elements.
Order and repetition are irrelevant: $\{3,1,2\} = \{1,2,3\}$.

**Cardinality** — $|A|$ is the number of elements in $A$.

**Standard sets:**
$$\mathbb{N} \subsetneq \mathbb{Z} \subsetneq \mathbb{Q} \subsetneq \mathbb{R} \subsetneq \mathbb{C}$$

---

## Problems

### Computation

**1.** Let $A = \{2, 4, 6, 8, 10\}$, $B = \{1, 2, 3, 4, 5\}$, $C = \{4, 8\}$.

For each statement below, determine whether it is true or false.
If false, write the correct statement.

(a) $6 \in A$ &emsp; (b) $6 \in B$ &emsp; (c) $C \subseteq A$ &emsp;
(d) $C \subseteq B$ &emsp; (e) $A \subseteq B$ &emsp; (f) $|A| = |B|$

*Answers: (a) True (b) False: $6 \notin B$ (c) True (d) False: $8 \notin B$
(e) False: $6 \notin B$ (f) True: both have cardinality 5*

**2.** Write each set in the other notation (roster $\leftrightarrow$ set-builder).

(a) $\{1, 4, 9, 16, 25\}$

(b) $\{x \in \mathbb{Z} : -2 \leq x \leq 2\}$

(c) $\{x \in \mathbb{N} : x \text{ is odd and } x < 10\}$

*Answers: (a) $\{n^2 : n \in \mathbb{N}, n \leq 5\}$
(b) $\{-2, -1, 0, 1, 2\}$
(c) $\{1, 3, 5, 7, 9\}$*

**3.** Find the cardinality of each set.

(a) $\{x \in \mathbb{N} : x^2 < 50\}$

(b) $\{\emptyset, \{\emptyset\}, 1, 2\}$

(c) $\{x \in \mathbb{Z} : x^2 = 4\}$

*Answers: (a) 7 (the set is $\{1,2,3,4,5,6,7\}$)
(b) 4 (four distinct elements: the empty set, the set containing the empty set, 1, and 2)
(c) 2 (the set is $\{-2, 2\}$)*

---

### Understanding

**4.** A student writes $\{1, 2, 3\} \in \{1, 2, 3, 4, 5\}$.
Explain precisely what is wrong with this statement and write the correct version.

*Guidance: The student confused $\in$ (membership) with $\subseteq$ (subset).
$\{1,2,3\}$ is a set, not an element of $\{1,2,3,4,5\}$. The correct
statement is $\{1,2,3\} \subseteq \{1,2,3,4,5\}$.*

**5.** Explain in your own words why the empty set is a subset of every set.
Your explanation should not use the word "vacuous" — explain the logic
directly.

*Guidance: $\emptyset \subseteq A$ means "every element of $\emptyset$ is in $A$."
There are no elements of $\emptyset$. The claim makes no exceptions — it fails
only if we can produce an element of $\emptyset$ that is not in $A$. We cannot
produce any element of $\emptyset$ at all. So the claim stands.*

**6.** Are the following sets equal? Explain.

$$\{x \in \mathbb{R} : x^2 = 4\} \quad \text{and} \quad \{x \in \mathbb{N} : x^2 = 4\}$$

*Guidance: No. The first set is $\{-2, 2\}$ (real solutions to $x^2=4$).
The second set is $\{2\}$ only ($-2$ is not a natural number).
The sets have different elements, so they are not equal.*

---

### Proof

**7.** Prove that for any set $A$, we have $A \subseteq A$.

*Proof: We must show that every element of $A$ is an element of $A$.
Let $x \in A$. Then $x \in A$ (trivially, since $x$ is the same element).
Since $x$ was an arbitrary element of $A$, we have shown every element
of $A$ is in $A$. Therefore $A \subseteq A$. $\blacksquare$*

**8.** Prove that if $A \subseteq B$ and $B \subseteq C$, then $A \subseteq C$.
(This is called the **transitivity** of the subset relation.)

*Proof strategy: We must show every element of $A$ is in $C$.
Take any $x \in A$. Since $A \subseteq B$, we know $x \in B$.
Since $B \subseteq C$, we know $x \in C$. Done.*

---

### Extension

**9. ★** The **power set** of a set $A$, written $\mathcal{P}(A)$, is the
set of all subsets of $A$.

(a) Find $\mathcal{P}(\{1, 2, 3\})$ by listing every subset of $\{1,2,3\}$.

(b) You should find $|\mathcal{P}(\{1,2,3\})| = 8 = 2^3$.
Conjecture a general formula for $|\mathcal{P}(A)|$ when $|A| = n$.

(c) The power set of a set of $n$ elements has $2^n$ elements. In computer
science, this is why checking all subsets of an $n$-element set takes
exponential time — there are $2^n$ of them. For $n = 64$ (a 64-bit integer),
$2^{64} \approx 1.8 \times 10^{19}$. At a billion operations per second,
exhaustive subset search takes about 585 years. This is why exponential
algorithms are considered infeasible. Verify $2^{64}$ in Python.

```python
print(2**64)
print(f"2^64 = {2**64:,}")
print(f"At 10^9 ops/sec: {2**64 / 1e9 / 3600 / 24 / 365.25:.1f} years")
```

*Answer (a): $\mathcal{P}(\{1,2,3\}) = \{\emptyset, \{1\}, \{2\}, \{3\}, \{1,2\}, \{1,3\}, \{2,3\}, \{1,2,3\}\}$*

*Answer (b): $|\mathcal{P}(A)| = 2^{|A|}$*

**10. ★** Sets can contain other sets as elements. Define:

$$\mathcal{F} = \{\emptyset, \{\emptyset\}, \{\{\emptyset\}\}\}$$

(a) What is $|\mathcal{F}|$?

(b) Is $\emptyset \in \mathcal{F}$?

(c) Is $\emptyset \subseteq \mathcal{F}$?

(d) Is $\{\emptyset\} \in \mathcal{F}$?

(e) Is $\{\emptyset\} \subseteq \mathcal{F}$?

Parts (b) through (e) ask you to distinguish carefully between membership
($\in$) and the subset relation ($\subseteq$). This distinction matters
deeply in formal mathematics and in type theory.

*Answers: (a) 3 (b) Yes (c) Yes (d) Yes (e) Yes —
$\{\emptyset\} \subseteq \mathcal{F}$ because $\emptyset \in \mathcal{F}$*
