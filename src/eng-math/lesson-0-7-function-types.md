# Stage 0, Lesson 0.7 — Types of Functions: Injective, Surjective, Bijective
**Threads:** Math · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Not all functions behave the same way. Some functions map two different
inputs to the same output — like $f(x) = x^2$, where both $2$ and $-2$
give $4$. Others fail to hit every possible output — like the same
$f(x) = x^2$, which never produces a negative number. And some functions
are perfectly paired: every input gives a distinct output, and every
possible output is reached. These three properties — **injectivity**,
**surjectivity**, and **bijectivity** — classify functions by how their
inputs and outputs relate. They are not abstract curiosities. Injectivity
is what makes a cipher decodable. Surjectivity is what makes a hash
function cover its output space. Bijectivity is the precise mathematical
condition required for a function to have an inverse. By the end of this
lesson you will be able to classify any function, prove or disprove each
property, and implement the classification checks in code.

---

## Historical Context

These properties were formalised in the late 19th century as mathematicians
pushed toward precise definitions of everything. Georg Cantor needed them
to compare the sizes of infinite sets: two sets have the same cardinality
if and only if there exists a bijection between them. This led to his
stunning result that the real numbers are strictly more numerous than the
integers — proved by constructing a function and showing it cannot be
surjective. The words "injective," "surjective," and "bijective" were
coined by Nicolas Bourbaki (the pseudonym of a group of French
mathematicians) in the 1930s–50s to replace the older, inconsistent
terminology of "one-to-one" and "onto."

---

## What You Need To Know First

- **Functions** — Lesson 0.6. A function $f : A \to B$ assigns each
  element of $A$ exactly one element of $B$.
- **Domain, codomain, image** — Lesson 0.6. The image is the set of
  outputs actually produced; the codomain is the declared output set.
- **Sets and subsets** — Lesson 0.1.

---

## The Lesson

### Three Questions About a Function

```scene
FunctionTypesScene
```


Given $f : A \to B$, there are three natural questions about how inputs
and outputs relate:

1. **Injectivity:** can two different inputs produce the same output?
2. **Surjectivity:** does every element of $B$ get used as an output?
3. **Bijectivity:** is $f$ both injective and surjective simultaneously?

Each question captures a different kind of correspondence between $A$ and $B$.

---

### Injective Functions

```scene
InjectiveScene
```

```quiz
{"q": "A function is injective if:", "options": ["Every element of B is hit", "Different inputs always give different outputs", "f has an inverse", "A and B have equal size"], "correct": 1, "explanation": "Injective: if f(a1) = f(a2) then a1 = a2. No two distinct inputs map to the same output."}
```


**Definition:** A function $f : A \to B$ is **injective** (or
**one-to-one**) if different inputs always produce different outputs:

$$\forall a_1, a_2 \in A,\quad f(a_1) = f(a_2) \implies a_1 = a_2$$

Equivalently, by the contrapositive: $a_1 \neq a_2 \implies f(a_1) \neq f(a_2)$.

**Formal lens:** The implication runs from outputs back to inputs:
if the outputs are equal, the inputs must have been equal. This is
the contrapositive of "different inputs give different outputs" —
the two statements are logically equivalent (from Lesson 0.3),
but the implication form is often easier to prove directly.

**Geometric lens:** On a graph in $\mathbb{R}^2$, injectivity is the
**horizontal line test**: every horizontal line $y = c$ crosses the
graph at most once. If a horizontal line crosses twice, two different
inputs produce the same output.

**Geometric lens — arrow diagram:** In an arrow diagram (domain on
left, codomain on right, arrows showing where each input maps), an
injective function has no two arrows pointing to the same output.
Every output is the target of at most one arrow.

**Hand-worked example:**

Is $f : \mathbb{R} \to \mathbb{R}$ defined by $f(x) = 2x + 1$ injective?

*Proof.* We use the definition directly.
Suppose $f(a_1) = f(a_2)$. Then:

$$2a_1 + 1 = 2a_2 + 1$$
$$2a_1 = 2a_2$$
$$a_1 = a_2$$

Since $f(a_1) = f(a_2)$ implies $a_1 = a_2$, the function is injective. $\blacksquare$

Is $g : \mathbb{R} \to \mathbb{R}$ defined by $g(x) = x^2$ injective?

*Disproof.* We exhibit a counterexample.
$g(2) = 4$ and $g(-2) = 4$, so $g(2) = g(-2)$ but $2 \neq -2$.
Therefore $g$ is not injective. $\blacksquare$

---

### Surjective Functions

```scene
SurjectiveScene
```

```quiz
{"q": "A function f: A \u2192 B is surjective if:", "options": ["Different inputs give different outputs", "Every element of B is hit by at least one input", "f(a) = a for all a", "A \u2286 B"], "correct": 1, "explanation": "Surjective: every element of the codomain B is the image of at least one element of A."}
```


**Definition:** A function $f : A \to B$ is **surjective** (or **onto**)
if every element of the codomain is the output of at least one input:

$$\forall b \in B,\ \exists a \in A \text{ such that } f(a) = b$$

Equivalently: $\text{image}(f) = B$. A surjective function uses the
entire codomain — nothing in $B$ is left unvisited.

**Formal lens:** The quantifier structure is $\forall b\ \exists a$:
for every target $b$, we can find at least one input $a$ that hits it.
The order of quantifiers matters — $\exists a\ \forall b$ would mean
a single $a$ works for every $b$, which is a much stronger (and usually
false) statement.

**Geometric lens — arrow diagram:** In an arrow diagram, every element
of $B$ has at least one arrow pointing to it. No element of $B$ is
"unshot."

**Hand-worked example:**

Is $f : \mathbb{R} \to \mathbb{R}$, $f(x) = 2x + 1$ surjective?

*Proof.* Let $b \in \mathbb{R}$ be arbitrary. We need to find $a$ with
$f(a) = b$, i.e., $2a + 1 = b$. Solving: $a = \frac{b-1}{2}$.

Check: $f\!\left(\frac{b-1}{2}\right) = 2 \cdot \frac{b-1}{2} + 1 = (b-1) + 1 = b$. ✓

Since for every $b \in \mathbb{R}$ we can find such an $a$, $f$ is surjective. $\blacksquare$

Is $g : \mathbb{R} \to \mathbb{R}$, $g(x) = x^2$ surjective?

*Disproof.* Take $b = -1 \in \mathbb{R}$. There is no real $a$ with
$a^2 = -1$, since squares of real numbers are non-negative.
So $-1 \notin \text{image}(g)$, and $g$ is not surjective. $\blacksquare$

**Note on codomains:** The same formula can be surjective or not
depending on the codomain. $g : \mathbb{R} \to [0, \infty)$,
$g(x) = x^2$ — with codomain restricted to non-negative reals —
is surjective, because every non-negative number has a square root.
The codomain is part of the function's specification.

---

### The Four Combinations

```scene
FourCombScene
```

```quiz
{"q": "Which type is both injective AND surjective?", "options": ["Injective only", "Surjective only", "Bijective", "Neither"], "correct": 2, "explanation": "A bijection is both injective and surjective \u2014 a perfect one-to-one correspondence."}
```


These two properties are independent. Any combination is possible.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_function_map(ax, domain, codomain_list, pairs, title, subtitle, color):
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_title(f'{title}\n{subtitle}', fontsize=10, pad=10)

    # Domain oval (left)
    d_oval = patches.Ellipse((2.5, 5), width=3.5, height=7.5,
        fill=True, facecolor='#e8f4fd', edgecolor='#2980b9', linewidth=2)
    ax.add_patch(d_oval)
    ax.text(2.5, 9.3, '$A$', ha='center', fontsize=13,
            color='#2980b9', fontweight='bold')

    # Codomain oval (right)
    c_oval = patches.Ellipse((7.5, 5), width=3.5, height=7.5,
        fill=True, facecolor='#e8f8ee', edgecolor='#27ae60', linewidth=2)
    ax.add_patch(c_oval)
    ax.text(7.5, 9.3, '$B$', ha='center', fontsize=13,
            color='#27ae60', fontweight='bold')

    # Position domain elements evenly
    n_d = len(domain)
    d_pos = {}
    for i, elem in enumerate(domain):
        y = 7.5 - i * (5.0 / max(n_d - 1, 1))
        d_pos[elem] = (2.5, y)
        ax.text(2.5, y, str(elem), ha='center', va='center', fontsize=13,
                fontweight='bold', color='#2c3e50',
                bbox=dict(boxstyle='circle,pad=0.15', fc='white', ec='none'))

    # Position codomain elements evenly
    n_c = len(codomain_list)
    c_pos = {}
    for i, elem in enumerate(codomain_list):
        y = 7.5 - i * (5.0 / max(n_c - 1, 1))
        c_pos[elem] = (7.5, y)
        ax.text(7.5, y, str(elem), ha='center', va='center', fontsize=13,
                fontweight='bold', color='#2c3e50',
                bbox=dict(boxstyle='circle,pad=0.15', fc='white', ec='none'))

    # Draw arrows
    for (a, b) in pairs:
        x1, y1 = d_pos[a]
        x2, y2 = c_pos[b]
        ax.annotate('', xy=(x2 - 0.55, y2), xytext=(x1 + 0.55, y1),
                    arrowprops=dict(arrowstyle='->', color=color,
                                   lw=1.8, connectionstyle='arc3,rad=0.05'))

fig, axes = plt.subplots(2, 2, figsize=(13, 10))

cases = [
    ([1,2,3], ['a','b','c','d'],
     [(1,'a'),(2,'b'),(3,'a')],
     'Neither injective nor surjective',
     '1 and 3 both map to $a$  |  $d$ never hit',
     '#e74c3c'),
    ([1,2,3], ['a','b'],
     [(1,'a'),(2,'b'),(3,'a')],
     'Surjective, not injective',
     '1 and 3 both map to $a$  |  all of $B$ is hit',
     '#e67e22'),
    ([1,2,3], ['a','b','c','d'],
     [(1,'a'),(2,'b'),(3,'c')],
     'Injective, not surjective',
     'All outputs distinct  |  $d$ never hit',
     '#8e44ad'),
    ([1,2,3], ['a','b','c'],
     [(1,'a'),(2,'b'),(3,'c')],
     'Bijective',
     'All outputs distinct  |  all of $B$ is hit',
     '#27ae60'),
]

for ax, (dom, cod, pairs, title, subtitle, color) in zip(axes.flat, cases):
    draw_function_map(ax, dom, cod, pairs, title, subtitle, color)

plt.suptitle('The four combinations of injective and surjective',
             fontsize=13, y=1.01)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `draw_function_map` is a reusable drawing function —
this is the first time in the curriculum we define a helper before the
main plotting code. It takes: the domain as a list (order controls
vertical placement), the codomain as a list, the function as pairs,
a title, subtitle, and an arrow colour. `patches.Ellipse` and
`ax.annotate` are used as in Lesson 0.6. The `connectionstyle='arc3,rad=0.05'`
argument gives arrows a very slight curve so overlapping arrows stay
readable. `fig, axes = plt.subplots(2, 2)` creates a $2 \times 2$
grid; `axes.flat` is an iterator over all four axes left-to-right,
top-to-bottom — more convenient than indexing `axes[0,0]`, `axes[0,1]`, etc.

---

### Bijective Functions and Why They Matter

```scene
BijectiveScene
```

**Definition:** A function $f : A \to B$ is **bijective** (or a
**bijection**, or a **one-to-one correspondence**) if it is both
injective and surjective.

A bijection pairs every element of $A$ with exactly one element of $B$,
and every element of $B$ with exactly one element of $A$.
It is a perfect matching — no element on either side is unmatched or
double-matched.

**Why bijections matter — the inverse:** Only bijective functions
have inverses. The **inverse function** $f^{-1} : B \to A$ is defined
by: $f^{-1}(b) = a$ whenever $f(a) = b$.

For $f^{-1}$ to be well-defined as a function, two things are needed:

- *Surjectivity of $f$:* every $b \in B$ must have some $a$ with
  $f(a) = b$ — otherwise $f^{-1}(b)$ has no value.
- *Injectivity of $f$:* there can only be one $a$ with $f(a) = b$ —
  otherwise $f^{-1}(b)$ would have multiple values, violating the
  definition of a function.

Both conditions together — bijectivity — are exactly what is needed.

**Hand-worked example:** $f : \mathbb{R} \to \mathbb{R}$, $f(x) = 2x + 1$.

We proved $f$ is injective and surjective, so $f$ is bijective.

Find $f^{-1}$. We solve $y = 2x + 1$ for $x$:

$$y - 1 = 2x \implies x = \frac{y - 1}{2}$$

So $f^{-1}(y) = \dfrac{y-1}{2}$.

**Verify the round trips:**

$$f^{-1}(f(x)) = f^{-1}(2x+1) = \frac{(2x+1)-1}{2} = \frac{2x}{2} = x \checkmark$$

$$f(f^{-1}(y)) = f\!\left(\frac{y-1}{2}\right) = 2 \cdot \frac{y-1}{2} + 1 = y \checkmark$$

The two conditions $f^{-1}(f(x)) = x$ and $f(f^{-1}(y)) = y$ are the
defining property of an inverse — they confirm the functions undo each other.

---

### Visualising the Types on $\mathbb{R}$

```scene
TypesOnRScene
```

```python
import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(1, 3, figsize=(14, 5))

x = np.linspace(-3, 3, 300)

# --- f(x) = x² : neither ---
ax = axes[0]
ax.plot(x, x**2, color='#e74c3c', linewidth=2.5)

# Horizontal line hits twice — not injective
ax.axhline(2, color='#888', linewidth=1, linestyle='--')
x_hits = [-np.sqrt(2), np.sqrt(2)]
ax.scatter(x_hits, [2, 2], color='#e74c3c', s=80, zorder=5)
ax.annotate('Two inputs\nmap to $y=2$',
            xy=(np.sqrt(2), 2), xytext=(1.5, 4),
            arrowprops=dict(arrowstyle='->', color='#e74c3c'),
            fontsize=9, color='#e74c3c')

# Negative y never hit — not surjective
ax.fill_between([-3, 3], -1, 0, alpha=0.12, color='#e74c3c')
ax.text(0, -0.6, 'Never hit\n(not surjective)', ha='center',
        fontsize=9, color='#e74c3c')

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_xlim(-3, 3); ax.set_ylim(-1, 7)
ax.set_title('$f(x) = x^2$\nNeither injective nor surjective\n(on $\\mathbb{R} \\to \\mathbb{R}$)',
             fontsize=10)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.grid(True, alpha=0.3)

# --- f(x) = 2x+1 : bijective ---
ax = axes[1]
ax.plot(x, 2*x + 1, color='#27ae60', linewidth=2.5)

# Horizontal line hits once — injective
ax.axhline(3, color='#888', lw=1, linestyle='--')
ax.scatter([1], [3], color='#27ae60', s=80, zorder=5)
ax.annotate('Exactly one input\nmaps to $y=3$',
            xy=(1, 3), xytext=(1.5, 5.5),
            arrowprops=dict(arrowstyle='->', color='#27ae60'),
            fontsize=9, color='#27ae60')

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_xlim(-3, 3); ax.set_ylim(-6, 8)
ax.set_title('$f(x) = 2x+1$\nBijective\n(on $\\mathbb{R} \\to \\mathbb{R}$)',
             fontsize=10)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.grid(True, alpha=0.3)

# --- g(x) = x³ : bijective ---
ax = axes[2]
ax.plot(x, x**3, color='#2980b9', linewidth=2.5)

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_xlim(-3, 3); ax.set_ylim(-8, 8)
ax.set_title('$g(x) = x^3$\nBijective\n(on $\\mathbb{R} \\to \\mathbb{R}$)',
             fontsize=10)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.grid(True, alpha=0.3)
ax.text(1.2, -5, 'Every $y$ has exactly\none cube root', fontsize=9,
        color='#2980b9')

plt.suptitle('Classifying functions on $\\mathbb{R}$', fontsize=13, y=1.02)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `ax.fill_between(x_range, y_low, y_high, alpha=0.12)`
shades the region between two horizontal values across the given $x$
range — here used to shade the $y < 0$ region of the first plot,
highlighting the part of the codomain that $x^2$ never reaches.
`alpha=0.12` makes the shading 12% opaque (very faint). Each plot
is independently scaled using `ax.set_xlim` and `ax.set_ylim` so the
relevant features are visible.

---

### Cardinality and the Three Types

```scene
CardinalityTypesScene
```

```quiz
{"q": "Can f: {1,2,3} \u2192 {1,2,3,4} be surjective?", "options": ["Yes, always", "No, the domain is too small", "Only if bijective", "Only if f(1)=1"], "correct": 1, "explanation": "A 3-element domain produces at most 3 distinct outputs, leaving at least one of the 4 codomain elements unhit."}
```


For **finite** sets, the sizes of domain and codomain constrain what
is possible:

| Condition | Consequence |
|-----------|-------------|
| $\|A\| > \|B\|$ | $f$ cannot be injective (pigeonhole principle) |
| $\|A\| < \|B\|$ | $f$ cannot be surjective (not enough inputs) |
| $\|A\| = \|B\|$ | injective $\iff$ surjective $\iff$ bijective |

**The Pigeonhole Principle** states: if more than $n$ objects are placed
into $n$ boxes, at least one box contains more than one object.
Here: if $|A| > |B|$, there are more inputs than outputs, so at least
two inputs must share an output — injectivity fails.

This is why, for finite sets of the same size, you only need to check
one of the two properties: they are equivalent. Checking both is
redundant (but not wrong).

For **infinite** sets, this equivalence breaks down. Cantor proved
there exist injective functions $f : \mathbb{N} \to \mathbb{R}$ that
are not surjective — meaning $\mathbb{R}$ is "larger" than $\mathbb{N}$
in a precise sense. This is the beginning of the theory of infinite
cardinalities, revisited in Stage 8.

---

## Connect the Pieces

**What this lesson built on:** Functions (Lesson 0.6) — the base concept
being classified. Logic (Lesson 0.3) — the definitions use $\forall$,
$\exists$, and implications. The contrapositive (Lesson 0.3) —
injectivity is often proved via its contrapositive form.

**What this lesson makes possible:** Lesson 0.8 (Composition and Inverse
Functions) — inverses require bijectivity, established here. In Stage 1,
logarithms are the inverse functions of exponentials; this requires proving
exponentials are bijective. In Stage 2, the inverse trig functions
($\arcsin$, $\arccos$, $\arctan$) require restricting the domain of
$\sin$, $\cos$, $\tan$ to make them injective before inverting — a
direct application of today's lesson.

**In cryptography (Stage 10):** A cipher must be a bijection — injective
so decryption is unambiguous, surjective so every ciphertext is valid.
The Caesar cipher is a bijection on the 26-letter alphabet.

**In computer science:** A hash function $h : \text{inputs} \to \text{hash values}$
is typically not injective — two inputs can hash to the same value
(a **collision**). Designing hash functions to minimise collisions while
maintaining surjectivity onto the output space is a central problem in
the field.

---

## Summary

**Injective** ($f$ is one-to-one):
$$\forall a_1, a_2 \in A,\quad f(a_1) = f(a_2) \implies a_1 = a_2$$
Different inputs always give different outputs.
Test on $\mathbb{R}$: horizontal line test (each horizontal line crosses at most once).

**Surjective** ($f$ is onto):
$$\forall b \in B,\ \exists a \in A \text{ such that } f(a) = b$$
Every element of the codomain is hit.
Equivalently: $\text{image}(f) = B$.

**Bijective:** injective AND surjective.
Every element of $B$ is hit by exactly one element of $A$.
Bijections have inverses; non-bijections do not.

**Finite set constraints:**
- $|A| > |B|$: cannot be injective
- $|A| < |B|$: cannot be surjective
- $|A| = |B|$: injective $\iff$ surjective $\iff$ bijective

---

## Problems

### Math

**1.** For each function, determine whether it is injective, surjective,
both, or neither. Prove your answer.

(a) $f : \mathbb{R} \to \mathbb{R}$, $f(x) = 3x - 5$

(b) $g : \mathbb{R} \to \mathbb{R}$, $g(x) = x^3 - x$

(c) $h : \mathbb{N} \to \mathbb{N}$, $h(n) = 2n$

(d) $k : \mathbb{Z} \to \mathbb{Z}$, $k(n) = n + 1$

<details>
<summary>Hints</summary>

(a) Try the injectivity proof approach from the lesson: assume $f(a_1) = f(a_2)$ and solve for what that implies.

(b) Check $g(0)$, $g(1)$, and $g(-1)$ — do any give the same output? For surjectivity: can you hit every real number?

(c) The codomain is $\mathbb{N}$. Can $h(n) = 1$? What does that tell you about surjectivity?

(d) Think about what $k$ does geometrically on the integer number line.

</details>

<details>
<summary>Answers</summary>

(a) $f(x) = 3x-5$ is bijective. Injective: $f(a_1) = f(a_2) \Rightarrow 3a_1-5 = 3a_2-5 \Rightarrow a_1 = a_2$. Surjective: given $b$, set $a = (b+5)/3$.

(b) $g(x) = x^3 - x$ is surjective but not injective. Not injective: $g(0)=0$, $g(1)=0$, $g(-1)=0$ — three inputs give output 0. Surjective: $g$ is continuous, $g(x) \to \pm\infty$ as $x \to \pm\infty$, so by the Intermediate Value Theorem (Stage 5) it hits every real value.

(c) $h : \mathbb{N} \to \mathbb{N}$, $h(n) = 2n$ is injective but not surjective. Injective: $2n_1 = 2n_2 \Rightarrow n_1 = n_2$. Not surjective: $h(n) = 1$ requires $n = 1/2 \notin \mathbb{N}$ — odd numbers are never hit.

(d) $k : \mathbb{Z} \to \mathbb{Z}$, $k(n) = n+1$ is bijective. Injective: $n_1+1 = n_2+1 \Rightarrow n_1 = n_2$. Surjective: given $b \in \mathbb{Z}$, set $n = b-1 \in \mathbb{Z}$, then $k(n) = b$.

</details>

---

**2.** (The horizontal line test as a proof)

$f : \mathbb{R} \to \mathbb{R}$, $f(x) = x^2 - 4x + 4 = (x-2)^2$.

(a) Show $f$ is not injective by finding two distinct inputs with the same output.

(b) Show $f$ is not surjective by finding an element of the codomain not in the image.

(c) If you change the codomain to $[0, \infty)$, is $f$ now surjective?
What if you also restrict the domain to $[2, \infty)$? Is $f$ then bijective?

<details>
<summary>Answers</summary>

(a) $f(0) = (0-2)^2 = 4$ and $f(4) = (4-2)^2 = 4$. Two distinct inputs, same output.

(b) $f(x) = (x-2)^2 \geq 0$ for all real $x$, so $-1$ is never hit.

(c) With codomain $[0,\infty)$: yes, surjective — every non-negative number $c$ satisfies $c = (x-2)^2$ for $x = 2 \pm \sqrt{c}$.
Restricting to domain $[2,\infty)$: $f$ is now injective (on $[2,\infty)$, $f$ is strictly increasing) and surjective onto $[0,\infty)$, so bijective. The inverse is $f^{-1}(y) = 2 + \sqrt{y}$.

</details>

---

**3.** (Proof) Prove that if $f : A \to B$ is bijective, then the inverse
function $f^{-1} : B \to A$ (defined by $f^{-1}(b) = a$ when $f(a) = b$)
is also bijective.

<details>
<summary>Hint</summary>

You need to show $f^{-1}$ is injective and surjective. For injectivity:
suppose $f^{-1}(b_1) = f^{-1}(b_2) = a$. What does that tell you about
$b_1$ and $b_2$ using the definition of $f$? For surjectivity: given
$a \in A$, find a $b \in B$ such that $f^{-1}(b) = a$.

</details>

<details>
<summary>Answer</summary>

*Proof.* Let $f : A \to B$ be bijective.

**$f^{-1}$ is injective:** Suppose $f^{-1}(b_1) = f^{-1}(b_2) = a$. By definition of $f^{-1}$, $f(a) = b_1$ and $f(a) = b_2$. Since $f$ is a function, $b_1 = b_2$. So $f^{-1}(b_1) = f^{-1}(b_2) \Rightarrow b_1 = b_2$. ✓

**$f^{-1}$ is surjective:** Let $a \in A$. Since $f$ is a function, $f(a) = b$ for some $b \in B$. Then $f^{-1}(b) = a$. So every $a \in A$ is hit by $f^{-1}$. ✓

Therefore $f^{-1}$ is bijective. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Classify a function**

Implement three functions that check injectivity, surjectivity, and
bijectivity for a function given as a list of `(input, output)` pairs.

```python
def is_injective(pairs):
    """
    Return True if no two different inputs map to the same output.
    pairs: list of (input, output) tuples representing a valid function
    """
    pass  # your code here


def is_surjective(pairs, codomain):
    """
    Return True if every element of codomain appears as an output.
    pairs:    list of (input, output) tuples
    codomain: a set of all declared output values
    """
    pass  # your code here


def is_bijective(pairs, codomain):
    """Return True if both injective and surjective."""
    pass  # your code here


# --- tests: do not modify ---
f1 = [(1,'a'),(2,'b'),(3,'a')]
f2 = [(1,'a'),(2,'b'),(3,'c')]
f3 = [(1,'a'),(2,'b'),(3,'c'),(4,'d')]

assert is_injective(f1)               == False, "1 and 3 both map to a"
assert is_injective(f2)               == True,  "All outputs distinct"
assert is_injective(f3)               == True,  "All outputs distinct"

assert is_surjective(f1, {'a','b'})   == True,  "Both a,b are hit"
assert is_surjective(f2, {'a','b','c','d'}) == False, "d not hit"
assert is_surjective(f2, {'a','b','c'})     == True,  "All hit"

assert is_bijective(f2, {'a','b','c'})      == True,  "Bijection"
assert is_bijective(f1, {'a','b'})          == False, "Not injective"
assert is_bijective(f2, {'a','b','c','d'})  == False, "Not surjective"

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

For `is_injective`: collect all the output values into a list. If any output
appears more than once, the function is not injective. Compare the length
of the list to the length of the set made from it.

For `is_surjective`: collect the set of all outputs. Check if it equals
the codomain.

</details>

---

**Challenge 2 — Build the inverse**

Given a bijective function as a list of pairs, construct its inverse.

```python
def build_inverse(pairs):
    """
    Given a bijective function as (input, output) pairs,
    return the inverse as a list of (output, input) pairs.
    
    Assumes the input is a valid bijective function.
    """
    pass  # your code here


# --- tests: do not modify ---
f = [(1,'a'),(2,'b'),(3,'c')]
f_inv = build_inverse(f)

# The inverse should map a→1, b→2, c→3
assert ('a', 1) in f_inv, "a should map to 1"
assert ('b', 2) in f_inv, "b should map to 2"
assert ('c', 3) in f_inv, "c should map to 3"
assert len(f_inv) == 3,   "Inverse should have same number of pairs"

# Round-trip: applying f then f_inv should return original input
f_dict     = {a: b for (a, b) in f}
f_inv_dict = {a: b for (a, b) in f_inv}
for x in [1, 2, 3]:
    assert f_inv_dict[f_dict[x]] == x, f"Round-trip failed for input {x}"

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

The inverse of a function swaps the roles of input and output.
If $(a, b)$ is in the original function, then $(b, a)$ should be in the inverse.

</details>

---

**Challenge 3 — Plot and classify**

Using matplotlib, produce a single figure with two subplots side by side:

- Left: $f(x) = x^3$ on $[-2, 2]$
- Right: $g(x) = \sin(x)$ on $[-2\pi, 2\pi]$

For each plot, draw three horizontal lines at $y = -0.5$, $y = 0$, and
$y = 0.5$, and mark every intersection point with a red dot. Based on
your plots, classify each function as injective, surjective, or bijective
(as a function $\mathbb{R} \to \mathbb{R}$).

```python
import matplotlib.pyplot as plt
import numpy as np

# Your code here.
# Use np.linspace to create smooth curves.
# Use np.isclose or find crossing points to mark intersections.
# (Hint: look for sign changes in f(x) - y_line to find crossings.)
```

There are no assert tests for this one — the visual is the result. After
you build it, answer in a comment: which function is injective? Which is
surjective? Are either bijective (on all of $\mathbb{R}$)?

<details>
<summary>Expected observations</summary>

$f(x) = x^3$: each horizontal line crosses exactly once → injective.
Every real number is a cube root of something → surjective.
Therefore bijective on $\mathbb{R} \to \mathbb{R}$.

$g(x) = \sin(x)$: every horizontal line between $-1$ and $1$ crosses
infinitely many times → not injective. Values outside $[-1, 1]$ are
never hit → not surjective. Neither.

</details>

---

### Extension

**4. ★** A function $f : A \to B$ is injective if and only if it has a
**left inverse**: a function $g : B \to A$ such that $g(f(a)) = a$ for
all $a \in A$.

(a) Prove the "only if" direction: if $f$ is injective, construct a left
inverse explicitly.

(b) Prove the "if" direction: if $f$ has a left inverse $g$, prove $f$
is injective.

(c) Implement `find_left_inverse` for a function given as pairs.
A left inverse does not need to be unique — construct any valid one.

```python
def find_left_inverse(pairs, codomain):
    """
    Given an injective function as pairs and its codomain,
    return a left inverse as a list of pairs.
    
    For elements of the codomain NOT in the image of f,
    you may map them to any element of the domain.
    """
    pass  # your code here


# --- tests: do not modify ---
f = [(1,'a'),(2,'b'),(3,'c')]
codomain = {'a','b','c','d'}
domain = {1, 2, 3}

g = find_left_inverse(f, codomain)
g_dict = {a: b for (a, b) in g}

# g must be a function from codomain to domain
assert set(g_dict.keys()) == codomain, "g must be defined on all of codomain"
assert all(v in domain for v in g_dict.values()), "g must map into domain"

# g(f(x)) = x for all x in domain (left inverse property)
f_dict = {a: b for (a, b) in f}
for x in domain:
    assert g_dict[f_dict[x]] == x, f"Left inverse property failed for x={x}"

print("✓ Extension 4 passed!")
```

<details>
<summary>Hint for the implementation</summary>

For each pair $(a, b)$ in $f$, you know $g(b) = a$ — that's forced by
the left inverse property. For elements of the codomain not in the image
of $f$, $g$ can map them anywhere in the domain — pick any element of
the domain as a default.

</details>

</details>