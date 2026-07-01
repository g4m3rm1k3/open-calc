# Stage 0, Lesson 0.12 — Capstone: Putting It All Together
**Threads:** Math · CS  
**Estimated time:** 60–90 minutes

---

## What This Lesson Is About

Stage 0 introduced twelve foundational ideas — sets, logic, ordered pairs,
relations, functions, proof by contradiction, proof by induction, and
mathematical notation. Studied one at a time, these can feel like
isolated tools. They are not. Every concept in Stage 0 is built on the
ones before it, and every concept in Stage 1 onward will be built on
all of Stage 0 together.

This lesson has three jobs. First, it maps the connections explicitly —
showing exactly how sets became functions, how functions became relations,
and how logic threads through every proof. Second, it works through a
synthesis problem that genuinely requires all of Stage 0 at once: a
complete mathematical result stated, proved, and implemented. Third, it
checks your readiness for Stage 1 with a self-assessment that names
exactly what you need to be fluent in before moving on.

There is no new mathematics here. If anything in this lesson feels
unfamiliar, that is the signal to return to the lesson that introduced it.

---

## Historical Context

The foundations laid in Stage 0 were not available to mathematicians
until surprisingly recently. Cantor's set theory dates to 1874; Peano's
axioms for natural numbers (including induction) to 1889; Frege and
Russell's formalisation of logic to the 1900s. Before this, even
professional mathematicians reasoned with informal arguments, sometimes
making errors that went unnoticed for decades. The explicit,
symbol-precise style of Stage 0 — defining every term, stating every
assumption, proving every step — was a 20th-century achievement.
You are doing mathematics the way it has been done since.

---

## What You Need To Know First

All of Stage 0. This lesson assumes Lessons 0.1 through 0.11 completely.

---

## The Lesson

### Part 1 — The Concept Map

Before anything else: here is where each Stage 0 concept came from and
what it feeds into.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(13, 9))
ax.set_xlim(0, 13)
ax.set_ylim(0, 9)
ax.axis('off')
ax.set_title('Stage 0 — How the Concepts Connect', fontsize=14,
             fontweight='bold', pad=15)

# Each node: (x, y, display text, colour)
# Colour groups: blue=sets, purple=logic, teal=geometry,
#               orange=relations, green=functions, red=proof, gold=Stage1
nodes = [
    (6.5, 8.2,  'Sets\n[0.1–0.2]',              '#2980b9'),
    (2.5, 6.5,  'Logic\n[0.3]',                 '#8e44ad'),
    (6.5, 6.5,  'Ordered Pairs\n& Plane [0.4]', '#16a085'),
    (10.5, 6.5, 'Relations\n[0.5]',             '#d35400'),
    (6.5, 4.5,  'Functions\n[0.6–0.8]',         '#27ae60'),
    (2.5, 2.8,  'Proof by\nContradiction [0.9]','#c0392b'),
    (6.5, 2.8,  'Proof by\nInduction [0.10]',   '#c0392b'),
    (10.5, 2.8, 'Notation &\nWriting [0.11]',   '#7f8c8d'),
    (6.5, 0.9,  'STAGE 1 →\nAlgebra II',        '#e67e22'),
]

# Draw each node as a labelled coloured box
for (x, y, label, color) in nodes:
    is_next_stage = 'STAGE 1' in label
    ax.text(x, y, label,
            ha='center', va='center',
            fontsize=9,
            fontweight='bold' if is_next_stage else 'normal',
            color='white',
            bbox=dict(boxstyle='round,pad=0.5',
                      facecolor=color,
                      edgecolor='white',
                      linewidth=1.5,
                      alpha=0.92))

# Draw arrows showing dependencies.
# Each tuple is (tail_x, tail_y, head_x, head_y).
arrow_coords = [
    (6.5, 7.95,  2.8,  6.9),   # Sets → Logic
    (6.5, 7.90,  6.5,  7.10),  # Sets → Ordered Pairs
    (6.5, 7.95, 10.2,  6.9),   # Sets → Relations
    (6.7, 7.90,  6.7,  5.08),  # Sets → Functions
    (2.5, 6.10,  2.5,  3.22),  # Logic → Contradiction
    (6.3, 6.05,  6.3,  5.05),  # Ordered Pairs → Functions
    (10.2,6.10,  6.9,  5.05),  # Relations → Functions
    (6.3, 4.10,  2.8,  3.22),  # Functions → Contradiction
    (6.5, 4.08,  6.5,  3.22),  # Functions → Induction
    (6.7, 4.08,  10.2, 3.0),   # Functions → Notation
    (2.5, 2.38,  5.6,  1.22),  # Contradiction → Stage 1
    (6.5, 2.38,  6.5,  1.22),  # Induction → Stage 1
    (10.5,2.38,  7.5,  1.22),  # Notation → Stage 1
]

for (x1, y1, x2, y2) in arrow_coords:
    ax.annotate('',
                xy=(x2, y2),        # arrowhead position
                xytext=(x1, y1),    # tail position
                arrowprops=dict(
                    arrowstyle='->',
                    color='#aaaaaa',
                    lw=1.2,
                    connectionstyle='arc3,rad=0.05'
                    # arc3,rad=0.05: slight curve so arrows don't
                    # overlap when multiple share the same path
                ))

plt.tight_layout()
plt.show()
```

**Walkthrough:** Each box is drawn with `ax.text(..., bbox=dict(...))` —
the `bbox` argument wraps the text in a coloured rounded rectangle.
`'round,pad=0.5'` is the box style: rounded corners with padding of 0.5
units. The arrows use `ax.annotate('', xy=head, xytext=tail, arrowprops=...)`
with an empty string — this draws only the arrow, no text label.
The concept map reads top to bottom: sets are the foundation, logic and
geometry sit on top of them, functions sit on top of those, and everything
feeds into the proof techniques, which feed into Stage 1.

**Reading the map:** every arrow means "this concept uses the one it
points from." Functions ($f : A \to B$) depend on both sets (domain,
codomain, image are all sets) and ordered pairs (a function is a set
of ordered pairs). Proof by induction depends on functions and logic —
the inductive step is an implication $P(k) \Rightarrow P(k+1)$, and
induction itself is defined over $\mathbb{N}$, which is a set.

---

### Part 2 — A Synthesis Problem

The following result uses sets, functions, relations, and a proof by
contradiction — all at once. This is what mathematics looks like when
the foundations are in place.

**Theorem (Pigeonhole Principle):** If $f : A \to B$ is a function
and $|A| > |B|$, then $f$ is not injective — that is, there exist
$a_1, a_2 \in A$ with $a_1 \neq a_2$ but $f(a_1) = f(a_2)$.

Informally: if you put more pigeons than pigeonholes, at least two
pigeons share a hole. This was used in Lesson 0.7 to justify the
cardinality constraints on injective functions, but stated there
without proof. Here is the full proof.

*Proof.* Suppose, for contradiction, that $f$ is injective.
Then for any $a_1, a_2 \in A$, $f(a_1) = f(a_2)$ implies $a_1 = a_2$.
In other words, different inputs give different outputs — every element
of $A$ maps to a distinct element of $B$.

But this means the image of $f$ contains $|A|$ distinct elements,
all in $B$:

$$|\text{image}(f)| = |A|$$

Since $\text{image}(f) \subseteq B$, we have
$|\text{image}(f)| \leq |B|$, and therefore $|A| \leq |B|$.

This contradicts our assumption that $|A| > |B|$.

Therefore $f$ is not injective. $\blacksquare$

**Let us annotate every step with which Stage 0 lesson it uses:**

| Step | Stage 0 source |
|------|---------------|
| "Suppose, for contradiction, that $f$ is injective" | Contradiction template (0.9) |
| "Then $f(a_1) = f(a_2) \Rightarrow a_1 = a_2$" | Definition of injective (0.7) |
| "Different inputs give different outputs" | Contrapositive form (0.3, 0.9) |
| "$|\text{image}(f)| = |A|$" | Cardinality of a set (0.1), image of $f$ (0.6) |
| "$\text{image}(f) \subseteq B$" | Subset definition (0.1), image is subset of codomain (0.6) |
| "$|\text{image}(f)| \leq |B|$" | If $S \subseteq T$ then $|S| \leq |T|$ (0.1) |
| "Contradicts $|A| > |B|$" | Contradiction (0.9) |

Every tool is from Stage 0. The proof uses nothing from Stage 1 onward.

```python
# Verify the Pigeonhole Principle computationally.
# For various sizes of A and B with |A| > |B|, try ALL possible functions
# and confirm none of them are injective.

from itertools import product as cartesian_product
# itertools.product: generates the Cartesian product of iterables.
# product([0,1,2], repeat=3) gives all triples from {0,1,2} — used here
# to generate all possible functions from A to B.

def all_functions(domain_size, codomain_size):
    """
    Generate all functions from {0,...,domain_size-1} to {0,...,codomain_size-1}
    as lists of output values (index i = output for input i).
    """
    domain   = list(range(domain_size))
    codomain = list(range(codomain_size))
    # cartesian_product(codomain, repeat=domain_size) gives all possible
    # sequences of length domain_size drawn from codomain --
    # each sequence is one function's list of output values
    for outputs in cartesian_product(codomain, repeat=domain_size):
        yield dict(zip(domain, outputs))
        # zip(domain, outputs) pairs each input with its output value;
        # dict(...) converts the pairs to a dictionary

def is_injective(f_dict):
    """True if no two inputs share the same output."""
    outputs = list(f_dict.values())
    return len(outputs) == len(set(outputs))  # set removes duplicates

print("Verifying the Pigeonhole Principle:\n")
print("For every |A| > |B|, confirm no function f: A → B is injective.\n")

for domain_size, codomain_size in [(2,1), (3,2), (3,1), (4,3)]:
    injective_count = 0
    total_count = 0
    for f in all_functions(domain_size, codomain_size):
        total_count += 1
        if is_injective(f):
            injective_count += 1

    print(f"  |A|={domain_size}, |B|={codomain_size}: "
          f"{total_count} total functions, "
          f"{injective_count} injective")
    assert injective_count == 0, \
        f"Found an injective function with |A|={domain_size} > |B|={codomain_size}!"

print("\nPigeonhole Principle confirmed for all tested cases.")
```

**Walkthrough:** `itertools.product(codomain, repeat=domain_size)` is the
key line — it generates every possible sequence of `domain_size` values
chosen from `codomain`, with repetition. Each such sequence represents
one function: the value at position $i$ is the output for input $i$.
For domain size 3 and codomain size 2, this gives $2^3 = 8$ functions —
all possible mappings from $\{0,1,2\}$ to $\{0,1\}$. The assertion
confirms that for every tested pair with $|A| > |B|$, the injective
count is zero — exactly what the Pigeonhole Principle guarantees.

---

### Part 3 — A Manufacturing Application

You work in manufacturing. Here is how Stage 0 shows up in the work
you already do, now with the mathematical language to describe it precisely.

**Setup:** A CNC machine applies a sequence of coordinate transformations
to move from machine coordinates to workpiece coordinates.
Each transformation is a function $f : \mathbb{R}^2 \to \mathbb{R}^2$.
The full chain is a composition of functions.

```python
import matplotlib.pyplot as plt
import numpy as np

# np.linspace reminder: np.linspace(start, stop, n) gives n evenly-spaced values

def translate(dx, dy):
    """
    Returns a function that shifts every point by (dx, dy).
    This is a function factory -- it takes numbers and returns a function.
    """
    def transform(point):
        x, y = point           # unpack the tuple into x and y coordinates
        return (x + dx, y + dy)
    return transform

def rotate(angle_degrees):
    """
    Returns a function that rotates every point by angle_degrees
    counterclockwise around the origin.
    Uses cos and sin from numpy -- explained fully in Stage 2 (Trigonometry).
    For now: cos(0°)=1, sin(0°)=0, cos(90°)=0, sin(90°)=1.
    """
    angle_radians = np.radians(angle_degrees)  # np.radians: degrees → radians
    cos_a = np.cos(angle_radians)              # np.cos: cosine of angle
    sin_a = np.sin(angle_radians)              # np.sin: sine of angle
    def transform(point):
        x, y = point
        return (cos_a*x - sin_a*y,   # rotated x coordinate
                sin_a*x + cos_a*y)   # rotated y coordinate
    return transform

def compose(f, g):
    """
    Returns f∘g: apply g first, then f.
    Same compose from Lesson 0.8 -- unchanged.
    """
    return lambda point: f(g(point))

# Machine coordinate chain:
# 1. Fixture offset: workpiece is at (50, 30) in machine coordinates
# 2. Part rotation: workpiece is rotated 45° on the fixture
# 3. Tool offset: tool centre is 2mm above the spindle

fixture_offset = translate(50, 30)   # workpiece origin in machine coords
part_rotation  = rotate(45)          # part is tilted 45° on fixture
tool_offset    = translate(0, 2)     # tool centre offset from spindle

# Full chain: first apply tool offset, then rotation, then fixture
# (read right-to-left: fixture ∘ rotation ∘ tool)
machine_to_workpiece = compose(fixture_offset, compose(part_rotation, tool_offset))

# Test: where does workpiece point (0, 0) map to in machine coordinates?
workpiece_origin = (0, 0)
machine_coords = machine_to_workpiece(workpiece_origin)
print(f"Workpiece origin (0,0) → machine coords: "
      f"({machine_coords[0]:.2f}, {machine_coords[1]:.2f})")

# Visualise a grid of workpiece points transformed to machine coordinates
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Generate a grid of points in workpiece space
grid_range = np.linspace(-10, 10, 8)   # 8 values from -10 to 10
workpiece_points = [(x, y) for x in grid_range for y in grid_range]
# List comprehension: every (x,y) pair from the grid

machine_points = [machine_to_workpiece(p) for p in workpiece_points]
# Apply the full transform to every workpiece point

wx = [p[0] for p in workpiece_points]  # x-coords in workpiece space
wy = [p[1] for p in workpiece_points]  # y-coords in workpiece space
mx = [p[0] for p in machine_points]    # x-coords in machine space
my = [p[1] for p in machine_points]    # y-coords in machine space

axes[0].scatter(wx, wy, color='#2980b9', s=40, zorder=4)
axes[0].axhline(0, color='#333', lw=0.8)
axes[0].axvline(0, color='#333', lw=0.8)
axes[0].set_title('Workpiece coordinate space', fontsize=11)
axes[0].set_xlabel('$x$ (mm)'); axes[0].set_ylabel('$y$ (mm)')
axes[0].grid(True, alpha=0.3)
axes[0].set_aspect('equal')

axes[1].scatter(mx, my, color='#e74c3c', s=40, zorder=4)
axes[1].axhline(0, color='#333', lw=0.8)
axes[1].axvline(0, color='#333', lw=0.8)
axes[1].set_title('Machine coordinate space\n(after fixture + rotation + tool offset)',
                  fontsize=11)
axes[1].set_xlabel('$x$ (mm)'); axes[1].set_ylabel('$y$ (mm)')
axes[1].grid(True, alpha=0.3)
axes[1].set_aspect('equal')

plt.suptitle('Coordinate transformation as function composition $f_3 \\circ f_2 \\circ f_1$',
             fontsize=12, y=1.02)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `translate` and `rotate` are **function factories** —
functions that return other functions. `translate(50, 30)` does not
transform a point itself; it returns a new function that, when called
with a point, shifts it by $(50, 30)$. This is the same pattern as
`compose` from Lesson 0.8. The full chain `compose(fixture_offset,
compose(part_rotation, tool_offset))` is the mathematical composition
$f_3 \circ (f_2 \circ f_1)$, which by associativity equals
$f_3 \circ f_2 \circ f_1$.

**The Stage 0 content in this code:**
- Each transformation is a function $f : \mathbb{R}^2 \to \mathbb{R}^2$ (Lesson 0.6)
- `compose` is function composition $f \circ g$ (Lesson 0.8)
- The full chain is associative — brackets do not matter (Lesson 0.8)
- To go backward (machine → workpiece), you need the inverse: $(f_3 \circ f_2 \circ f_1)^{-1} = f_1^{-1} \circ f_2^{-1} \circ f_3^{-1}$ (Lesson 0.8)
- Each transformation is bijective — it has an inverse (Lesson 0.7)

---

### Part 4 — Stage 0 Self-Assessment

Before moving to Stage 1, you should be able to do all of the following
without looking anything up. Work through the list honestly.

```python
# Self-assessment runner.
# Each item is a question. Try to answer it before expanding the hint.
# Mark each as confident (3), shaky (2), or need to review (1).

self_assessment = {
    "Sets (0.1)": [
        "Write the set of all even integers between 1 and 20 in set-builder notation.",
        "Is {1,2} ∈ {1,2,3}? Is {1,2} ⊆ {1,2,3}? Why is one true and one false?",
        "What is |∅|? What is |{∅}|? Are these the same?",
    ],
    "Set Operations (0.2)": [
        "State both De Morgan's Laws for sets from memory.",
        "If |A|=7, |B|=5, |A∩B|=3, what is |A∪B|?",
        "Give an example of two disjoint sets.",
    ],
    "Logic (0.3)": [
        "When is P → Q false? Give an example.",
        "What is the contrapositive of 'if n is even then n² is even'?",
        "State De Morgan's Laws for logic from memory.",
    ],
    "Ordered Pairs and Functions (0.4, 0.6)": [
        "Why is (1,2) ≠ (2,1) as an ordered pair but {1,2} = {2,1} as a set?",
        "What is the difference between codomain and image?",
        "Give an example of a relation that is not a function.",
    ],
    "Function Types (0.7-0.8)": [
        "What does injective mean? Give an example and a non-example.",
        "What property does a function need before you can invert it?",
        "If f∘g is bijective, what can you conclude about f and g individually?",
        "State the 'socks and shoes' rule in symbols.",
    ],
    "Relations (0.5)": [
        "What three properties make a relation an equivalence relation?",
        "What are the equivalence classes of congruence mod 4 on {0,...,11}?",
        "What is a partition? How do equivalence classes form one?",
    ],
    "Proof (0.9-0.10)": [
        "Write the template for a proof by contradiction from memory.",
        "Write the template for a proof by induction from memory.",
        "What is the key lemma used in the proof that √2 is irrational?",
        "What is the base case of a proof by induction? Why is it required?",
    ],
}

print("Stage 0 Self-Assessment\n")
print("For each question, try to answer it before reading Stage 1.")
print("Rate yourself: 3=confident, 2=shaky, 1=need to review.\n")
print("=" * 60)

for topic, questions in self_assessment.items():
    print(f"\n{topic}")
    print("-" * len(topic))
    for i, q in enumerate(questions, 1):
        print(f"  {i}. {q}")
```

**Walkthrough:** This block uses a **dictionary of lists** — each key
is a topic string, each value is a list of question strings.
`self_assessment.items()` returns each (key, value) pair, and the outer
`for` loop unpacks them as `topic, questions`. The inner `for` loop
uses `enumerate(questions, 1)` — `enumerate` adds a counter to any
iterable; the second argument `1` means counting starts from 1 rather
than the default 0.

---

### Part 5 — Bridge to Stage 1

Stage 1 begins with polynomials and ends with complex numbers. Every
concept introduced there will be stated using Stage 0 language.
Here is a preview of three results from Stage 1, written in Stage 0
notation — not to teach them now, but so the notation feels familiar
when you arrive.

**From Lesson 1.4 (The Fundamental Theorem of Algebra):**
Every polynomial $p : \mathbb{C} \to \mathbb{C}$ of degree $n \geq 1$
has exactly $n$ roots in $\mathbb{C}$ (counting multiplicity). That is:

$$\exists\ z_1, z_2, \ldots, z_n \in \mathbb{C} \text{ such that }
p(x) = a_n(x - z_1)(x - z_2)\cdots(x - z_n)$$

This is a statement about functions ($p$), sets ($\mathbb{C}$),
and existential quantifiers ($\exists$).

**From Lesson 1.8 (The Natural Logarithm):**
The natural logarithm $\ln : (0, \infty) \to \mathbb{R}$ is the inverse
function of $e^x : \mathbb{R} \to (0, \infty)$. That is,
$\ln \circ \exp = \text{id}_\mathbb{R}$ and
$\exp \circ \ln = \text{id}_{(0,\infty)}$.

This is a statement about inverse functions and composition from
Lesson 0.8 — applied to a specific pair of functions you have not
seen yet, but described in language you already know completely.

**From Lesson 1.16 (Euler's Formula, previewed):**
For every $\theta \in \mathbb{R}$:
$$e^{i\theta} = \cos\theta + i\sin\theta$$

This connects the exponential function ($e^x$, Stage 1), trigonometry
($\cos$, $\sin$, Stage 2), and complex numbers ($i$, $\mathbb{C}$,
Stage 1) in a single equation. All three components are functions
$\mathbb{R} \to \mathbb{C}$, and the equation states that one of
them factors into the others in a specific way. The statement is
stage-1 content. The language — functions, sets, the equals sign —
is pure Stage 0.

---

## Connect the Pieces

**What this lesson built on:** All of Stage 0.

**What this lesson makes possible:** Stage 1 — Algebra II and
Precalculus — starts immediately. The first lesson covers polynomials,
which are functions $f : \mathbb{R} \to \mathbb{R}$ defined by a
specific form of expression. You will use sets to describe domains
and codomains, injectivity and surjectivity to classify them, and
proofs to establish their properties.

**In manufacturing:** every CNC coordinate transformation is a function.
Every tolerance zone is a set. Every quality specification of the form
"all parts must satisfy $x \in [a, b]$" is a set membership claim.
Every time you verify that machining operations can be undone (a setup
is reversible), you are checking that a composition of transformations
is bijective. Stage 0 is not abstract preparation — it is the language
your daily work is already written in.

**In computer science:** type systems are set theory; functions in code
are mathematical functions; recursion is induction; program correctness
is proved by the same proof techniques built in Stage 0. The gap between
"I write code" and "I understand why my code is correct" is exactly
Stage 0. You now have the tools.

---

## Summary

Stage 0 built the language of mathematics:

**Objects:** sets, ordered pairs, relations, functions.

**Properties:** subset, membership, cardinality; injectivity,
surjectivity, bijectivity; reflexivity, symmetry, transitivity;
equivalence class, partition.

**Operations:** union, intersection, complement, Cartesian product,
composition, inversion.

**Proof techniques:** direct proof, contrapositive, contradiction, induction.

**The chain:** $\text{Sets} \to \text{Ordered Pairs} \to \text{Relations}
\to \text{Functions}$. Each is a specialisation of the previous.
A function is a relation with uniqueness; a bijection is an injective
surjective function; an inverse is a bijection's partner.

**What connects everything:** logic. Every definition is a logical
statement. Every proof is a logical argument. The connectives $\land$,
$\lor$, $\lnot$, $\Rightarrow$, $\Leftrightarrow$ and the quantifiers
$\forall$, $\exists$ appear in every definition in this curriculum.

---

## Problems

### Math

**1.** Write a complete proof of the following, using Stage 0 tools only.
Choose the most appropriate proof technique and name it.

> **Claim:** For any sets $A$ and $B$, $|A \times B| = |A| \times |B|$.
> (Assume $A$ and $B$ are finite.)

<details>
<summary>Hint</summary>

Define an injective function from $A \times B$ into some set you can
count directly, then argue bijectivity. Or: think about how many pairs
$(a, b)$ exist for each fixed $a \in A$ — there are exactly $|B|$ of them.
Sum over all $a \in A$.

</details>

<details>
<summary>Answer</summary>

*Proof.* Let $|A| = m$ and $|B| = n$. Write $A = \{a_1, \ldots, a_m\}$.
For each $a_i \in A$, the pairs with first coordinate $a_i$ form the set
$\{(a_i, b) : b \in B\}$, which has exactly $n = |B|$ elements.
Since every pair in $A \times B$ has exactly one first coordinate, the sets
$\{(a_i, b) : b \in B\}$ for $i = 1, \ldots, m$ are pairwise disjoint
and their union is $A \times B$. Therefore:

$$|A \times B| = \sum_{i=1}^{m} |\{(a_i, b) : b \in B\}| = \sum_{i=1}^{m} n = m \times n = |A| \times |B|. \quad \blacksquare$$

</details>

---

**2.** Prove or disprove: if $f : A \to B$ and $g : B \to C$ are both
surjective, then $g \circ f : A \to C$ is surjective.

<details>
<summary>Hint</summary>

To prove surjectivity of $g \circ f$, take an arbitrary $c \in C$ and
find an $a \in A$ with $(g \circ f)(a) = c$. Use the surjectivity of $g$
first to get a $b$, then use surjectivity of $f$ to get $a$.

</details>

<details>
<summary>Answer</summary>

*Proof.* Let $c \in C$ be arbitrary. Since $g$ is surjective, there
exists $b \in B$ with $g(b) = c$. Since $f$ is surjective, there exists
$a \in A$ with $f(a) = b$. Then $(g \circ f)(a) = g(f(a)) = g(b) = c$.
Since $c$ was arbitrary, $g \circ f$ is surjective. $\blacksquare$

</details>

---

**3.** The relation $\sim$ on $\mathbb{Z}$ defined by $a \sim b$
if and only if $f(a) = f(b)$ (where $f : \mathbb{Z} \to \mathbb{Z}$
is some fixed function) is called the **kernel** of $f$.

(a) Prove $\sim$ is an equivalence relation.

(b) What are the equivalence classes when $f(n) = n \bmod 3$?

(c) If $f$ is injective, what are the equivalence classes?

<details>
<summary>Answers</summary>

(a) Reflexive: $f(a) = f(a)$, so $a \sim a$. ✓
Symmetric: if $f(a) = f(b)$ then $f(b) = f(a)$, so $b \sim a$. ✓
Transitive: if $f(a)=f(b)$ and $f(b)=f(c)$, then $f(a)=f(c)$. ✓

(b) $[0] = \{..., -3, 0, 3, 6, ...\}$, $[1] = \{..., -2, 1, 4, 7, ...\}$, $[2] = \{..., -1, 2, 5, 8, ...\}$ — the congruence classes mod 3 from Lesson 0.5.

(c) If $f$ is injective, $f(a) = f(b) \Rightarrow a = b$, so every equivalence class contains exactly one element: $[a] = \{a\}$ for every $a$.

</details>

---

### Code Challenges

**Challenge 1 — Stage 0 integration test**

This challenge requires sets, functions, relations, and the Pigeonhole
Principle working together. Implement a function that, given any function
$f : A \to B$ as a list of pairs and the declared codomain, returns a
complete report: is $f$ valid, injective, surjective, bijective, and
if not injective — exhibit a collision (two inputs with the same output).

```python
def analyse_function(pairs, codomain):
    """
    Analyse a function given as (input, output) pairs.
    
    Returns a dictionary with keys:
      'valid'      : True if each input appears exactly once
      'injective'  : True if no two inputs share an output
      'surjective' : True if every codomain element is an output
      'bijective'  : True if both injective and surjective
      'collision'  : a pair (a1, a2) with f(a1)=f(a2) and a1≠a2,
                     or None if injective
    
    pairs:    list of (input, output) tuples
    codomain: a set of declared output values
    """
    pass  # your code here


# --- tests: do not modify ---
f_bijective   = [(1,'a'),(2,'b'),(3,'c')]
f_surjective  = [(1,'a'),(2,'b'),(3,'a')]     # not injective, surjective onto {a,b}
f_injective   = [(1,'a'),(2,'b'),(3,'c')]     # injective, not surjective onto {a,b,c,d}
f_neither     = [(1,'a'),(2,'a'),(3,'b')]

r1 = analyse_function(f_bijective, {'a','b','c'})
assert r1['valid']      == True
assert r1['injective']  == True
assert r1['surjective'] == True
assert r1['bijective']  == True
assert r1['collision']  is None

r2 = analyse_function(f_surjective, {'a','b'})
assert r2['injective']  == False
assert r2['surjective'] == True
assert r2['collision']  is not None
a1, a2 = r2['collision']
f_dict = dict(f_surjective)
assert f_dict[a1] == f_dict[a2] and a1 != a2, "collision must share output"

r3 = analyse_function(f_neither, {'a','b','c'})
assert r3['injective']  == False
assert r3['surjective'] == False
assert r3['bijective']  == False

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Build the analysis step by step:

1. Check validity: does each input appear exactly once?
2. Check injectivity: are all output values distinct? If not, find two inputs that share an output (loop over output values and find any that appears more than once).
3. Check surjectivity: does the set of outputs equal the codomain?
4. Bijective is `injective and surjective`.

For finding the collision: build a dictionary mapping each output to the *first* input that produced it. Then loop again — if you find an output already in the dictionary with a different input, you have the collision pair.

</details>

---

**Challenge 2 — The inverse of a composition**

Implement `inverse_of_composition` that takes two bijective functions
$f$ and $g$ (as pair lists) and returns $(f \circ g)^{-1} = g^{-1} \circ f^{-1}$.

```python
def invert(pairs):
    """Return the inverse of a bijective function as a list of pairs."""
    pass  # your code here

def compose_pairs(pairs_f, pairs_g):
    """Return f∘g as a list of pairs (apply g first, then f)."""
    pass  # your code here

def inverse_of_composition(pairs_f, pairs_g):
    """
    Given bijective f and g (as pair lists), return (f∘g)⁻¹.
    Uses the socks-and-shoes rule: (f∘g)⁻¹ = g⁻¹ ∘ f⁻¹
    """
    pass  # your code here


# --- tests: do not modify ---
f = [(1, 10), (2, 20), (3, 30)]      # f: {1,2,3} → {10,20,30}
g = [('a',1), ('b',2), ('c',3)]      # g: {a,b,c} → {1,2,3}
# f∘g: {a,b,c} → {10,20,30}

fog_inv = inverse_of_composition(f, g)
fog_inv_dict = dict(fog_inv)

# (f∘g)⁻¹ should map: 10→a, 20→b, 30→c
assert fog_inv_dict[10] == 'a', "10 should map back to a"
assert fog_inv_dict[20] == 'b', "20 should map back to b"
assert fog_inv_dict[30] == 'c', "30 should map back to c"

# Verify round trip: (f∘g)⁻¹ ∘ (f∘g) = id on {a,b,c}
fog = compose_pairs(f, g)
fog_dict = dict(fog)
for x in ['a','b','c']:
    assert fog_inv_dict[fog_dict[x]] == x, f"Round trip failed for {x}"

print("✓ Challenge 2 passed!")
```

---

### Extension

**4. ★** The **Cantor-Schröder-Bernstein Theorem** states: if there
exist injective functions $f : A \to B$ and $g : B \to A$, then there
exists a bijection between $A$ and $B$.

(a) Why is this non-trivial? Why can't you just "combine" $f$ and $g$?

(b) Verify the theorem computationally for small finite sets: write
`find_bijection(A, B)` that, given two sets of the same cardinality,
returns a bijection between them.

```python
def find_bijection(A, B):
    """
    Given two finite sets A and B with |A| = |B|,
    return a bijection as a list of (a, b) pairs.
    """
    pass  # your code here


# --- tests: do not modify ---
bij = find_bijection({1,2,3}, {'x','y','z'})
bij_dict = dict(bij)

assert set(bij_dict.keys())   == {1,2,3},     "domain must be A"
assert set(bij_dict.values()) == {'x','y','z'},"codomain must be B"
assert len(set(bij_dict.values())) == 3,       "must be injective"

print("✓ Extension 4 passed!")
```

(c) The full theorem (for infinite sets) is harder to prove — it requires
constructing the bijection from both injections cleverly. Look up the
"back-and-forth" construction and describe in one paragraph how it works.
(This is a reading exercise, not a coding exercise.)
