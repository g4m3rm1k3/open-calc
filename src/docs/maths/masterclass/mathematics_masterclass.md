# Mathematics Masterclass
## From Algebra to the Full Foundation of a Maths Major and CS PhD

*Proof-literate · Intuition-first · Code where it illuminates · ~10 hrs/week*

---

## What This Curriculum Is

This is not a textbook review. It is not a formula sheet with explanations. It is a
structured programme for building the mathematical mind of a senior mathematics
undergraduate and first-year CS PhD student — starting from solid basic algebra
and ending with the tools required to read research, derive results, and think
independently about unseen problems.

The single guiding principle: **you never memorise what you can derive.** Every
formula in this curriculum is arrived at, not handed to you. By the end, you will
be able to sit in front of a blank page and reconstruct the quadratic formula, the
derivative of $\sin x$, the characteristic polynomial of a matrix, and the Master
Theorem — not because you remember them, but because you understand what they *are*.

---

## The Mathematics Lesson Contract

*Adapted from the software engineering lesson contract. Rebuilt for mathematics.*

### 1. Intuition Before Formalism

Every concept is introduced through a question or a problem that the formalism
answers. The question comes before the definition. The definition is the answer to
the question, not a decree handed down from above.

**Wrong order:** "A derivative is defined as $\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$. Now let's see what it means."

**Right order:** "You want to know the instantaneous speed of something — not the
average over an interval, but the speed at a single moment. The problem: speed is
distance divided by time, but at a single moment, both distance and time are zero.
How do you divide zero by zero and get something meaningful? That question *is* the
derivative. The limit definition is the precise answer to it."

### 2. Derivation Before Memorisation

No formula is handed to the reader. Every formula is derived in full, from what
came before it. The derivation is the lesson. The formula is the summary at the end.

If you can follow and reconstruct every derivation in a chapter, you have understood
the chapter. If you can only recite the resulting formula, you have memorised a
symbol string.

### 3. The Three Questions

For every theorem, identity, or technique, three questions must be answered:

- **Why is this true?** The proof or derivation — the logical chain that makes it
  necessarily so.
- **Why does this matter?** The problem it solves or the door it opens — what becomes
  possible that was impossible before.
- **What breaks if it's wrong?** The failure mode — what the world looks like if
  the theorem does not hold, or if you apply it where it doesn't apply.

### 4. Proof Literacy, Not Proof Performance

Proofs in this curriculum are not rituals. They are arguments. The standard is not
"write a proof that would satisfy a marker." The standard is: "could you convince a
sceptical, intelligent person who has never seen this result?"

Every proof has three parts as taught here:

1. **The idea** — one or two sentences explaining the strategy. What is the proof
   *doing*? Is it finding a contradiction? Constructing an object directly?
   Using induction? The strategy is stated before the proof begins.
2. **The argument** — the full logical chain, with no steps skipped that are not
   genuinely trivial.
3. **The check** — after the proof, re-examine: what assumptions did we use? Where
   would the proof fail if those assumptions were removed?

### 5. Code as Verification and Insight

Code appears when it does one or more of the following:

- **Verifies a result** — we proved a closed form; code checks it against brute force
- **Makes an abstraction concrete** — an epsilon-delta argument becomes a loop that
  narrows an interval
- **Reveals structure** — plotting eigenvectors shows what a linear transformation
  *does* to space
- **Implements the concept directly** — writing the simplex method is understanding it

Code does not appear merely to transcribe a formula into a function. If implementing
something would teach nothing beyond what the derivation already taught, it is skipped.

All code in this curriculum is Python 3, using only the standard library plus NumPy
and Matplotlib where visualisation or matrix operations genuinely help. Every code
block produces visible output.

### 6. Every Concept Defined at First Use

No mathematical term, notation, or symbol appears before it is defined. This applies
to: set notation, quantifiers ($\forall$, $\exists$), function notation, interval
notation, big-O, summation notation, matrix notation, and everything else.

A symbol seen without explanation is a wall. This curriculum has no walls.

### 7. The Aha Architecture

Concepts are revisited deliberately. The second time a concept appears, the
connection is made explicit. The goal is not coverage but depth: seeing the same
idea from three different angles until it is genuinely understood.

*Example: the idea of an inverse — first seen in algebra as $x \cdot x^{-1} = 1$,
then in functions as $f(f^{-1}(x)) = x$, then in matrices as $A A^{-1} = I$, then
in group theory as the general axiom. Each encounter deepens the first.*

---

## The Architecture of the Curriculum

### The Four Pillars

All of mathematics as taught here rests on four ideas that appear, in increasing
sophistication, across every phase:

| Pillar | First appears | Mature form |
|---|---|---|
| **Structure** — things that obey rules | Phase 1: algebra | Phase 8: groups, rings, fields |
| **Approximation** — getting arbitrarily close | Phase 3: limits | Phase 6: series, convergence |
| **Transformation** — maps that preserve structure | Phase 4: functions | Phase 7: linear maps, eigenvectors |
| **Counting** — how many ways | Phase 2: combinatorics | Phase 9: discrete maths, generating functions |

Every lesson is connected to one or more of these pillars. Knowing which pillar a
topic belongs to is part of understanding the topic.

### The Phases

| Phase | Topic | Duration | Key Question |
|---|---|---|---|
| 0 | **Mathematical Thinking** | 1 week | What is a proof? What is a definition? |
| 1 | **Algebra Rebuilt** | 3 weeks | Why do the rules of algebra work? |
| 2 | **Functions and Their Behaviour** | 3 weeks | What *is* a function? |
| 3 | **Polynomials and Rational Functions** | 2 weeks | What can polynomials do and what can't they? |
| 4 | **Exponentials, Logarithms, and Trig** | 3 weeks | What functions live outside polynomials? |
| 5 | **Limits and Continuity** | 3 weeks | What does "approaching" mean precisely? |
| 6 | **Differential Calculus** | 4 weeks | How do things change? |
| 7 | **Integral Calculus** | 4 weeks | How do we accumulate change? |
| 8 | **Sequences and Series** | 3 weeks | When does an infinite sum have a finite answer? |
| 9 | **Multivariable Calculus** | 4 weeks | How does calculus extend to higher dimensions? |
| 10 | **Linear Algebra I** | 4 weeks | What is a linear transformation? |
| 11 | **Linear Algebra II** | 3 weeks | What do eigenvalues reveal about a transformation? |
| 12 | **Probability and Statistics** | 4 weeks | How do we reason under uncertainty? |
| 13 | **Combinatorics and Discrete Maths** | 3 weeks | How do we count exactly? |
| 14 | **Number Theory** | 3 weeks | What structure do the integers have? |
| 15 | **Concrete Mathematics** | 4 weeks | How do we analyse algorithms mathematically? |
| 16 | **Real Analysis** | 5 weeks | Why does calculus work? |
| 17 | **Abstract Algebra** | 4 weeks | What is the deepest structure behind arithmetic? |
| 18 | **Topology and Metric Spaces** | 3 weeks | What is space without coordinates? |
| 19 | **Synthesis** | 2 weeks | How do all these ideas connect? |

**Total: approximately 70 weeks at 10 hours/week.**

---

## Phase 0 — Mathematical Thinking

*1 week · The foundation everything else is built on*

### What This Phase Is

Before any mathematics, we build the tools used to *do* mathematics. Most
curricula skip this entirely, assuming students will absorb it by exposure.
They don't. The result is students who can follow proofs but cannot write them,
who can read definitions but cannot use them to reason.

This phase is short but foundational. Everything from Phase 1 onward depends on it.

### The Key Question

What separates a mathematical claim from an opinion? What makes something *proved*?

### Lesson 0.1 — Statements, Truth, and Logic

**The problem this lesson solves:**

Mathematics is made of statements. Before we can prove anything, we need to know
what a statement *is* — what it means for one to be true or false, and how truth
compounds when statements are combined.

**What is a mathematical statement?**

A mathematical statement is a sentence that is either true or false — not both,
not neither. "7 is prime" is a statement. "Mathematics is beautiful" is not
(there is no procedure for deciding it). "Is 7 prime?" is not (it is a question).

This seems obvious but immediately produces hard questions:
- "This statement is false" — is that a statement?
- "There exists a largest prime" — true or false?
- "$x > 3$" — is that a statement?

The third one is important: $x > 3$ is not a statement. It is an *open sentence* —
it becomes a statement only when $x$ is given a value. When we write
$\forall x \in \mathbb{R},\ x^2 \geq 0$, we are *closing* the open sentence with a
quantifier, making it a full statement (and a true one).

**Logical connectives — building compound statements:**

From simple statements $P$ and $Q$, we build compound ones:

| Connective | Symbol | Meaning | True when |
|---|---|---|---|
| And | $P \land Q$ | both hold | both $P$ and $Q$ are true |
| Or | $P \lor Q$ | at least one holds | $P$ true, $Q$ true, or both |
| Not | $\neg P$ | the opposite | $P$ is false |
| Implies | $P \Rightarrow Q$ | if $P$ then $Q$ | $P$ false, or both true |
| Iff | $P \Leftrightarrow Q$ | exactly when | both true or both false |

The one that always trips people: $P \Rightarrow Q$ is **false only when $P$ is
true and $Q$ is false.** "If it rains, the ground is wet." If it doesn't rain, the
statement makes no claim about the ground — the implication is not violated.

This is not a convention. It is the only definition that makes mathematical
reasoning work. We will see why in Lesson 0.2 when we use implications in proofs.

**Quantifiers — statements about collections:**

$\forall x \in S,\ P(x)$ means: for every element $x$ in the set $S$, the
statement $P(x)$ is true.

$\exists x \in S,\ P(x)$ means: there exists at least one element $x$ in $S$
for which $P(x)$ is true.

The negations are what trip people:

$$\neg(\forall x \in S,\ P(x)) \equiv \exists x \in S,\ \neg P(x)$$

"Not every integer is even" is equivalent to "there exists an odd integer."
To disprove a for-all statement, you need exactly one counterexample.
To disprove a there-exists statement, you must show no example exists.

This asymmetry is the reason conjectures are hard: to prove $\forall$, you must
handle every case; to disprove it, you need just one.

```python
# The asymmetry of quantifiers, made concrete
# To disprove "all numbers in this list are even", we need ONE odd number

numbers = [2, 4, 6, 7, 10]

# Proving "there exists an odd number" — one witness suffices
for n in numbers:
    if n % 2 != 0:
        print(f"Witness found: {n} is odd. The 'all even' claim is false.")
        break

# Proving "all numbers are even" — every single one must pass
all_even = all(n % 2 == 0 for n in numbers)
print(f"All even: {all_even}")  # False — one counterexample kills it
```

**Output:**
```
Witness found: 7 is odd. The 'all even' claim is false.
All even: False
```

**CS lens:** The for-all / there-exists asymmetry is why $P \neq NP$ is hard to
prove: we would need to show that *no* algorithm solves certain problems efficiently —
a for-all claim over all possible algorithms. Finding a fast algorithm would take
one witness.

### Lesson 0.2 — Proof Strategies

**The four strategies and when to use each:**

Every proof in this curriculum uses one of four strategies. Knowing which to reach
for — and why — is the skill this lesson builds.

**Strategy 1: Direct proof**

You want to prove $P \Rightarrow Q$. Assume $P$ is true and derive $Q$ using logic
and previously established facts.

*When to use it:* When assuming $P$ gives you something concrete to work with.

*Example:* Prove that if $n$ is odd, then $n^2$ is odd.

**Idea:** Odd numbers have a specific algebraic form. Use it.

**Proof:** If $n$ is odd, then $n = 2k + 1$ for some integer $k$ (this is the
*definition* of odd — a number that leaves remainder 1 when divided by 2). Then:

$$n^2 = (2k+1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$$

The last expression has the form $2m + 1$ where $m = 2k^2 + 2k$ is an integer.
Therefore $n^2$ is odd. $\square$

**Check:** Where did we use the assumption that $n$ is odd? In the first line —
writing $n = 2k+1$. If $n$ were even, we could not write it this way, and the
derivation would not work. The proof is tight: every step is necessary.

**Strategy 2: Proof by contradiction**

You want to prove $P$. Assume $\neg P$ (the opposite) and derive a contradiction
— a statement that is necessarily false.

*When to use it:* When assuming the opposite gives you something to push against.
Particularly effective for proving things *don't* exist.

*Example:* Prove that $\sqrt{2}$ is irrational.

**Idea:** Assume it *is* rational and show that leads to a number being both even
and odd simultaneously.

**Proof:** Assume for contradiction that $\sqrt{2}$ is rational. Then $\sqrt{2} =
\frac{p}{q}$ where $p, q$ are integers with no common factor (we can always reduce
a fraction to lowest terms). Squaring: $2 = \frac{p^2}{q^2}$, so $p^2 = 2q^2$.
This means $p^2$ is even. By the result from Strategy 1 (if $n^2$ is even, then $n$
is even — proved similarly), $p$ is even, so $p = 2m$ for some integer $m$. Then:

$$p^2 = 4m^2 = 2q^2 \implies q^2 = 2m^2$$

So $q^2$ is even, and therefore $q$ is even. But then $p$ and $q$ are both even —
contradicting our assumption that they share no common factor. $\square$

**Check:** The contradiction was: $p/q$ in lowest terms yet both even. Remove the
assumption $p/q$ in lowest terms and the proof breaks. The proof is using the fact
that every fraction can be reduced — a property of the rational numbers that is
taken as given here, proved in Phase 14 (Number Theory).

**Strategy 3: Mathematical induction**

You want to prove $P(n)$ for all positive integers $n$. Prove the base case $P(1)$,
then prove that $P(k) \Rightarrow P(k+1)$ for all $k$.

*When to use it:* For statements indexed by a natural number. The strategy matches
the recursive structure of the integers.

*Why it works:* Think of the integers as a chain. Induction is a machine that
knocks them down one by one: $P(1)$ is true; since $P(1)$ is true and $P(k)
\Rightarrow P(k+1)$, $P(2)$ is true; since $P(2)$ is true, $P(3)$ is true; and
so on, for every finite integer in the chain.

*Example:* Prove that $1 + 2 + \cdots + n = \frac{n(n+1)}{2}$.

**Idea:** We won't use the formula — we'll derive it and then prove it by induction.
The derivation: write the sum forwards and backwards:

$$S = 1 + 2 + \cdots + (n-1) + n$$
$$S = n + (n-1) + \cdots + 2 + 1$$

Adding column by column: $2S = (n+1) + (n+1) + \cdots + (n+1) = n(n+1)$.
So $S = \frac{n(n+1)}{2}$. Now we *prove* this formula is correct by induction.

**Proof:** Let $P(n)$ be the statement $\sum_{k=1}^{n} k = \frac{n(n+1)}{2}$.

*Base case* $n=1$: $\sum_{k=1}^{1} k = 1$ and $\frac{1 \cdot 2}{2} = 1$. ✓

*Inductive step:* Assume $P(m)$ holds — that is, $\sum_{k=1}^{m} k = \frac{m(m+1)}{2}$.
We want to prove $P(m+1)$:

$$\sum_{k=1}^{m+1} k = \left(\sum_{k=1}^{m} k\right) + (m+1)
= \frac{m(m+1)}{2} + (m+1) = (m+1)\left(\frac{m}{2} + 1\right) = \frac{(m+1)(m+2)}{2}$$

This is exactly $P(m+1)$ with $n = m+1$. $\square$

```python
# Verify the formula against direct summation for n = 1 to 20
for n in range(1, 21):
    direct_sum = sum(range(1, n + 1))
    formula    = n * (n + 1) // 2
    assert direct_sum == formula, f"Mismatch at n={n}"
    print(f"n={n:2d}:  sum={direct_sum:3d}  formula={formula:3d}  match=✓")
```

**Strategy 4: Proof by contrapositive**

To prove $P \Rightarrow Q$, prove the logically equivalent $\neg Q \Rightarrow \neg P$.

*Why it's equivalent:* The implication $P \Rightarrow Q$ is false only when $P$
is true and $Q$ is false. The contrapositive $\neg Q \Rightarrow \neg P$ is false
only when $\neg Q$ is true (i.e. $Q$ is false) and $\neg P$ is false (i.e. $P$
is true). Same condition. They are logically identical.

*When to use it:* When assuming $\neg Q$ gives you more to work with than assuming
$P$ does.

### Lesson 0.3 — Sets and Notation

**What a set is:**

A set is a collection of distinct objects, called its *elements*. The defining
property: each object either is or is not in the set — no multiplicities, no order.

- $\{1, 2, 3\}$ — a finite set listed explicitly
- $\{x \in \mathbb{Z} : x > 0\}$ — set-builder notation: all integers greater than 0
- $\mathbb{N}$ — the natural numbers $\{1, 2, 3, \ldots\}$ (convention: $0 \in \mathbb{N}$ in some traditions, not others — we will state which we mean when it matters)
- $\mathbb{Z}$ — the integers $\{\ldots, -2, -1, 0, 1, 2, \ldots\}$
- $\mathbb{Q}$ — the rationals $\{p/q : p, q \in \mathbb{Z},\ q \neq 0\}$
- $\mathbb{R}$ — the real numbers (formally constructed in Phase 16; for now, "the number line")
- $\mathbb{C}$ — the complex numbers (introduced in Phase 3)
- $\emptyset$ — the empty set, containing no elements

**Set operations:**

| Operation | Symbol | Meaning |
|---|---|---|
| Union | $A \cup B$ | elements in $A$ or $B$ (or both) |
| Intersection | $A \cap B$ | elements in both $A$ and $B$ |
| Difference | $A \setminus B$ | elements in $A$ but not $B$ |
| Complement | $A^c$ | elements not in $A$ (relative to some universal set) |
| Subset | $A \subseteq B$ | every element of $A$ is in $B$ |
| Power set | $\mathcal{P}(A)$ | the set of all subsets of $A$ |

**Cartesian product:** $A \times B = \{(a, b) : a \in A,\ b \in B\}$ — all ordered
pairs. The plane $\mathbb{R}^2 = \mathbb{R} \times \mathbb{R}$ is a Cartesian product.

---

## Phase 1 — Algebra Rebuilt

*3 weeks · Re-examining what you already know from the ground up*

### What This Phase Is

You can already do algebra. This phase is not about doing it — it is about
*understanding why it works*. The goal is to see algebra as a coherent logical
system, not a collection of techniques, so that every later phase builds on
a foundation you understand rather than one you were handed.

The key question: *why* does $a(b + c) = ab + ac$? Not "because that's the
distributive law." That is a name, not a reason. The reason is that the real
numbers are a *field* — a structure that satisfies certain axioms — and the
distributive law is one of those axioms. Everything else in algebra is derived
from the axioms. This phase shows you the axioms and derives algebra from them.

### Lesson 1.1 — The Real Numbers as a Field

**The field axioms:**

A *field* is a set $F$ with two operations, addition ($+$) and multiplication
($\cdot$), satisfying the following axioms. We state them for $\mathbb{R}$, but
every result derived from these axioms holds in any field.

For all $a, b, c \in \mathbb{R}$:

**Addition axioms:**
- A1. $a + b = b + a$ (commutativity)
- A2. $(a + b) + c = a + (b + c)$ (associativity)
- A3. There exists $0 \in \mathbb{R}$ such that $a + 0 = a$ (additive identity)
- A4. There exists $-a \in \mathbb{R}$ such that $a + (-a) = 0$ (additive inverse)

**Multiplication axioms:**
- M1. $a \cdot b = b \cdot a$ (commutativity)
- M2. $(a \cdot b) \cdot c = a \cdot (b \cdot c)$ (associativity)
- M3. There exists $1 \in \mathbb{R}$, $1 \neq 0$, such that $a \cdot 1 = a$ (multiplicative identity)
- M4. For $a \neq 0$, there exists $a^{-1} \in \mathbb{R}$ such that $a \cdot a^{-1} = 1$ (multiplicative inverse)

**Connecting axiom:**
- D1. $a \cdot (b + c) = a \cdot b + a \cdot c$ (distributivity)

That is the complete list. Everything in algebra is derived from these nine axioms.

**Deriving familiar results from axioms:**

*Theorem:* $a \cdot 0 = 0$ for all $a \in \mathbb{R}$.

**Idea:** Use the definition of $0$ (A3) and distributivity (D1), then cancel.

**Proof:**
$$a \cdot 0 = a \cdot (0 + 0) \quad \text{(A3: } 0 + 0 = 0\text{)}$$
$$= a \cdot 0 + a \cdot 0 \quad \text{(D1)}$$

Now add $-(a \cdot 0)$ to both sides:
$$0 = a \cdot 0 + a \cdot 0 + (-(a \cdot 0)) = a \cdot 0 + 0 = a \cdot 0$$

Therefore $a \cdot 0 = 0$. $\square$

**Check:** We used A3, D1, and A4. Every step cited an axiom. This is what it
means to prove something from first principles.

*Theorem:* $(-1) \cdot a = -a$.

**Proof:**
$$a + (-1) \cdot a = 1 \cdot a + (-1) \cdot a = (1 + (-1)) \cdot a = 0 \cdot a = 0$$

Since $a + (-1)a = 0$ and the additive inverse is unique (provable from A1–A4),
we have $(-1) \cdot a = -a$. $\square$

**What this reveals:** The rule "a negative times a positive is negative" is not
an arbitrary rule. It is the unique consequence of the field axioms. If you
changed it, you would have to abandon at least one axiom — and then algebra
would no longer work.

### Lesson 1.2 — Inequalities and the Ordered Field

$\mathbb{R}$ is not just a field — it is an *ordered* field. The ordering satisfies:

- O1. For all $a$: exactly one of $a > 0$, $a = 0$, $a < 0$ holds (trichotomy)
- O2. If $a > 0$ and $b > 0$, then $a + b > 0$ and $a \cdot b > 0$

From these, all inequality rules follow:

*Theorem:* If $a > b$ and $c > 0$, then $ac > bc$.

**Proof:** $a > b$ means $a - b > 0$ (by definition of $>$). $c > 0$ by assumption.
By O2, $(a-b) \cdot c > 0$. Expanding: $ac - bc > 0$, i.e. $ac > bc$. $\square$

*Theorem:* If $a > b$ and $c < 0$, then $ac < bc$ (inequality flips).

**Proof:** $c < 0$ means $-c > 0$. So $(a-b)(-c) > 0$, i.e. $-(ac - bc) > 0$,
i.e. $bc - ac > 0$, i.e. $bc > ac$. $\square$

**Why this matters:** Inequality manipulation is not a bag of tricks. Every rule
follows from two ordering axioms. When you know this, you never forget the rules —
you reconstruct them.

*Theorem:* $a^2 \geq 0$ for all $a \in \mathbb{R}$.

**Proof:** Either $a \geq 0$ or $a < 0$.

Case 1: $a \geq 0$. Then $a \cdot a \geq 0 \cdot a = 0$ by O2 (if $a > 0$) or
trivially (if $a = 0$).

Case 2: $a < 0$. Then $-a > 0$, so $(-a)(-a) > 0$. But $(-a)(-a) = a^2$
(using $(-1)a = -a$ from Lesson 1.1). $\square$

**What breaks:** $\mathbb{Q}$ also satisfies ordered field axioms. But $\mathbb{R}$
has one more property $\mathbb{Q}$ lacks — *completeness* (every bounded set has
a least upper bound). This is what lets calculus work. We return to it in Phase 16.

### Lesson 1.3 — The Quadratic Formula: Derived, Not Memorised

**The problem:** Given $ax^2 + bx + c = 0$ with $a \neq 0$, find $x$.

The quadratic formula will be *derived* here. After this lesson you will never need
to memorise it, because you will know the technique it encodes: completing the square.

**Completing the square — the idea:**

We want to write $ax^2 + bx + c$ as something squared, plus a constant. A perfect
square $(\alpha x + \beta)^2 = \alpha^2 x^2 + 2\alpha\beta x + \beta^2$ has the
property that the coefficient of $x$ is twice the product of the $x^2$ coefficient
and the constant. We exploit this.

**Derivation:**

Start with $ax^2 + bx + c = 0$. Divide by $a$ (valid since $a \neq 0$):

$$x^2 + \frac{b}{a}x + \frac{c}{a} = 0$$

We want to make the left side a perfect square in $x$. The square $(x + d)^2 =
x^2 + 2dx + d^2$ matches our $x^2$ term. For the $x$ coefficients to match:
$2d = \frac{b}{a}$, so $d = \frac{b}{2a}$. Add and subtract $d^2 = \frac{b^2}{4a^2}$:

$$\left(x + \frac{b}{2a}\right)^2 - \frac{b^2}{4a^2} + \frac{c}{a} = 0$$

$$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2}{4a^2} - \frac{c}{a} = \frac{b^2 - 4ac}{4a^2}$$

Take square roots (both signs, since $(\pm r)^2 = r^2$):

$$x + \frac{b}{2a} = \pm \frac{\sqrt{b^2 - 4ac}}{2a}$$

$$\boxed{x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}}$$

**The discriminant $\Delta = b^2 - 4ac$:**

Inside the square root determines the nature of the solutions:

| $\Delta > 0$ | Two distinct real roots |
| $\Delta = 0$ | One repeated real root (the square touches zero) |
| $\Delta < 0$ | No real roots — but there will be complex roots (Phase 3) |

**What breaks:** The formula requires dividing by $a$. If $a = 0$, the equation
is linear, not quadratic — the formula does not apply.

```python
import math

def quadratic_roots(a, b, c):
    """
    Solve ax^2 + bx + c = 0.
    Returns roots as a tuple, or a message if no real roots exist.
    The discriminant b^2 - 4ac determines which case we're in.
    """
    if a == 0:
        raise ValueError("Coefficient 'a' is zero: equation is linear, not quadratic.")

    discriminant = b**2 - 4*a*c
    print(f"Equation: {a}x² + {b}x + {c} = 0")
    print(f"Discriminant Δ = b²-4ac = {b}²-4·{a}·{c} = {discriminant}")

    if discriminant > 0:
        root1 = (-b + math.sqrt(discriminant)) / (2*a)
        root2 = (-b - math.sqrt(discriminant)) / (2*a)
        print(f"Two real roots: x = {root1:.4f}, x = {root2:.4f}")
        # Verify by substitution
        for r in [root1, root2]:
            check = a*r**2 + b*r + c
            print(f"  Verify: {a}·({r:.4f})² + {b}·({r:.4f}) + {c} = {check:.2e}")
    elif discriminant == 0:
        root = -b / (2*a)
        print(f"One repeated root: x = {root:.4f}")
    else:
        print(f"No real roots (Δ < 0). Complex roots introduced in Phase 3.")

quadratic_roots(1, -5, 6)   # x^2 - 5x + 6 = 0  →  roots 2 and 3
print()
quadratic_roots(1, 2, 5)    # x^2 + 2x + 5 = 0  →  no real roots
```

### Lesson 1.4 — Absolute Value, Distance, and Intervals

**Absolute value as distance:**

The absolute value $|x|$ is defined piecewise:

$$|x| = \begin{cases} x & \text{if } x \geq 0 \\ -x & \text{if } x < 0 \end{cases}$$

But the geometric meaning is primary: $|x|$ is the distance from $x$ to $0$ on
the number line. And $|x - y|$ is the distance from $x$ to $y$.

This is not just a metaphor. In Phase 5 (Limits), we will write "$f(x)$ is within
$\varepsilon$ of $L$" as $|f(x) - L| < \varepsilon$. Every epsilon-delta proof is
a statement about distances. Getting comfortable with $|x - y|$ as a distance now
pays off across the entire curriculum.

**The triangle inequality:**

$$|a + b| \leq |a| + |b|$$

**Proof idea:** Consider all four sign combinations for $a$ and $b$. Or: note that
$-|a| \leq a \leq |a|$ and $-|b| \leq b \leq |b|$, so:

$$-(|a| + |b|) \leq a + b \leq |a| + |b|$$

which is exactly $|a + b| \leq |a| + |b|$. $\square$

The triangle inequality will reappear in: metric spaces (Phase 18), vector norms
(Phase 10), and series convergence (Phase 8). It is a foundational inequality.

**Interval notation:**

| Notation | Meaning |
|---|---|
| $(a, b)$ | open interval: $a < x < b$ |
| $[a, b]$ | closed interval: $a \leq x \leq b$ |
| $[a, b)$ | half-open: $a \leq x < b$ |
| $(a, \infty)$ | $x > a$ (unbounded right) |
| $(-\infty, \infty)$ | all of $\mathbb{R}$ |

The distinction between open and closed will matter enormously in Phase 5 (continuity
on closed vs open intervals) and Phase 16 (compactness).

### Lesson 1.5 — Exponents and Their Laws

**The laws, derived:**

Define $a^n$ for positive integer $n$ as $a$ multiplied by itself $n$ times.
From this definition alone:

- $a^m \cdot a^n = a^{m+n}$ — count the factors: $m$ of them, then $n$ more
- $(a^m)^n = a^{mn}$ — $n$ groups of $m$ factors each
- $(ab)^n = a^n b^n$ — rearrange $n$ copies of $(ab)$

These are derivations, not axioms. Every exponent rule follows from counting.

**Extending to zero, negatives, and rationals:**

We want the rule $a^m \cdot a^n = a^{m+n}$ to hold for all integers, not just
positive ones. This forces us to define:

$a^0$: We need $a^n \cdot a^0 = a^{n+0} = a^n$. So $a^0 = 1$ (for $a \neq 0$).

$a^{-n}$: We need $a^n \cdot a^{-n} = a^0 = 1$. So $a^{-n} = \frac{1}{a^n}$.

$a^{1/n}$: We need $(a^{1/n})^n = a^{n/n} = a^1 = a$. So $a^{1/n}$ is the number
whose $n$th power is $a$ — the $n$th root.

**The pattern:** Every extension of exponents is forced by demanding the rule
$a^m \cdot a^n = a^{m+n}$ continue to hold. We did not choose these definitions
— they are the only consistent choice.

This is a profound pattern that recurs throughout mathematics: extending a structure
by demanding the rules that work in the simple case continue to hold in the
extended one. You will see it again when we extend to complex exponents in Phase 4
and to matrix exponents in Phase 11.

---

## Phase 2 — Functions and Their Behaviour

*3 weeks · What a function is, how it transforms, how it composes*

### What This Phase Is

A function is the most fundamental object in all of mathematics beyond sets.
Numbers, matrices, derivatives, probability distributions — all of these are
functions of one kind or another. Before we can do calculus, we need to understand
what functions *are* at a deep level, not just as "input-output machines."

### Lesson 2.1 — Functions as Sets

**The formal definition:**

A *function* $f: A \to B$ is a rule that assigns to each element $x \in A$ (the
*domain*) exactly one element $f(x) \in B$ (the *codomain*). The *range* (or
*image*) of $f$ is $\{f(x) : x \in A\} \subseteq B$ — the set of values actually
achieved.

The formal set-theoretic definition: $f$ is a subset of $A \times B$ such that
for every $a \in A$, there is exactly one $b \in B$ with $(a, b) \in f$.

**Why the formal definition matters:**

The formal definition settles questions like: is $f(x) = \sqrt{x}$ a function from
$\mathbb{R}$ to $\mathbb{R}$? No — $\sqrt{-1}$ is not a real number, so the domain
is wrong. It is a function from $[0, \infty)$ to $[0, \infty)$.

Is $f(x) = \pm\sqrt{x}$ a function? No — it assigns two values to each $x > 0$,
violating the "exactly one" requirement.

**Injective, surjective, bijective:**

These three words describe how a function relates its domain and codomain.

$f: A \to B$ is *injective* (one-to-one) if: $f(x_1) = f(x_2) \Rightarrow x_1 = x_2$.
Different inputs give different outputs. Equivalently: no two elements of $A$ map
to the same element of $B$.

$f: A \to B$ is *surjective* (onto) if: for every $b \in B$, there exists $a \in A$
with $f(a) = b$. Every element of the codomain is achieved.

$f$ is *bijective* if it is both injective and surjective. A bijection is a perfect
pairing between $A$ and $B$ — every element of $A$ maps to a unique element of $B$,
and every element of $B$ is hit.

**Why bijections matter:** A bijection $f: A \to B$ means $A$ and $B$ "have the
same size" — even when they are infinite. Cantor used this to show that $\mathbb{R}$
is strictly larger than $\mathbb{N}$: no bijection $\mathbb{N} \to \mathbb{R}$
exists (proved in Phase 16).

### Lesson 2.2 — Inverse Functions

**When does an inverse exist?**

The inverse of $f: A \to B$ is a function $f^{-1}: B \to A$ satisfying:
$f^{-1}(f(x)) = x$ for all $x \in A$ and $f(f^{-1}(y)) = y$ for all $y \in B$.

**Theorem:** $f$ has an inverse if and only if $f$ is bijective.

**Proof:**
($\Rightarrow$) If $f^{-1}$ exists: If $f(x_1) = f(x_2)$, apply $f^{-1}$ to both
sides: $x_1 = x_2$. So $f$ is injective. For any $y \in B$: $f(f^{-1}(y)) = y$,
so $y$ is in the range of $f$. So $f$ is surjective.

($\Leftarrow$) If $f$ is bijective: for each $y \in B$, since $f$ is surjective
there exists $x$ with $f(x) = y$; since $f$ is injective this $x$ is unique.
Define $f^{-1}(y) = x$. This is well-defined (unique $x$) and is the inverse. $\square$

**Graphical interpretation:** $f^{-1}$ is the reflection of the graph of $f$
across the line $y = x$. This is because $(a, b)$ is on the graph of $f$ iff
$f(a) = b$ iff $f^{-1}(b) = a$ iff $(b, a)$ is on the graph of $f^{-1}$.

### Lesson 2.3 — Composition and Transformations

**Composition:**

$(f \circ g)(x) = f(g(x))$ — apply $g$ first, then $f$. Requires that the range
of $g$ lies in the domain of $f$.

Composition is *not* commutative: $f \circ g \neq g \circ f$ in general.
But it is associative: $(f \circ g) \circ h = f \circ (g \circ h)$ (apply three
functions in sequence — only the order matters, not the grouping).

**Transformations of graphs:**

If you understand how composition encodes transformations, you can read a function
like $f(2x - 3) + 4$ and immediately know what it does to the graph of $f$ without
computing anything.

The following all follow from substitution — no memorisation needed:

| Transformation | Effect on graph |
|---|---|
| $f(x) + c$ | shift up by $c$ |
| $f(x + c)$ | shift left by $c$ (note the direction!) |
| $f(cx)$ for $c > 1$ | horizontal compression by factor $c$ |
| $f(cx)$ for $0 < c < 1$ | horizontal stretch |
| $cf(x)$ for $c > 1$ | vertical stretch |
| $f(-x)$ | reflect horizontally |
| $-f(x)$ | reflect vertically |

**Why the shift direction surprises people:** $f(x + 2)$ shifts the graph *left*
by 2, not right. The reason: the point $(3, f(3))$ on the original graph maps to
$(1, f(3))$ on the new graph — because $f(1 + 2) = f(3)$. The $x$-value decreases
by 2. Knowing the reason, you never confuse the direction.

---

## Phase 3 — Polynomials and Rational Functions

*2 weeks · The algebraic functions and their limits*

### Lesson 3.1 — Polynomials: Division and Roots

**The division algorithm for polynomials:**

For polynomials $f(x)$ and $d(x)$ with $\deg(d) \geq 1$, there exist unique
polynomials $q(x)$ (quotient) and $r(x)$ (remainder) with $\deg(r) < \deg(d)$, such that:

$$f(x) = d(x) \cdot q(x) + r(x)$$

This is the exact analogue of integer division with remainder. The parallel is not
a coincidence — both follow from the same algebraic structure (called a Euclidean
domain, revisited in Phase 17).

**The remainder theorem:**

When $d(x) = (x - a)$, the remainder $r$ is a constant. Evaluating both sides at
$x = a$: $f(a) = (a - a) \cdot q(a) + r = r$.

*Theorem (Remainder Theorem):* The remainder when $f(x)$ is divided by $(x - a)$
equals $f(a)$.

*Corollary (Factor Theorem):* $(x - a)$ is a factor of $f(x)$ if and only if $f(a) = 0$.

**The Fundamental Theorem of Algebra** (stated; proved in Phase 16 or Complex Analysis):
Every polynomial of degree $n \geq 1$ with complex coefficients has exactly $n$ roots
in $\mathbb{C}$ (counting multiplicity). In particular, every real polynomial of
odd degree has at least one real root.

### Lesson 3.2 — Complex Numbers

**Why complex numbers are necessary:**

The polynomial $x^2 + 1 = 0$ has no real solution — the discriminant is $-4 < 0$.
But the Fundamental Theorem of Algebra says it has two roots *somewhere*. Where?

We extend $\mathbb{R}$ by introducing a symbol $i$ satisfying $i^2 = -1$.
The complex numbers are $\mathbb{C} = \{a + bi : a, b \in \mathbb{R}\}$ with
operations:

$$(a + bi) + (c + di) = (a+c) + (b+d)i$$
$$(a + bi)(c + di) = ac + adi + bci + bdi^2 = (ac - bd) + (ad + bc)i$$

**$\mathbb{C}$ is a field:** Every nonzero $z = a + bi$ has an inverse:

$$\frac{1}{a+bi} = \frac{a - bi}{(a+bi)(a-bi)} = \frac{a-bi}{a^2+b^2}$$

**The complex plane:** Represent $a + bi$ as the point $(a, b)$. The real axis is
the $x$-axis; the imaginary axis is the $y$-axis. This is not just a picture — it
connects complex arithmetic to geometry.

**Modulus and argument:**

$|z| = \sqrt{a^2 + b^2}$ — distance from origin (extending absolute value to $\mathbb{C}$)

$\arg(z) = \theta$ where $a = |z|\cos\theta$, $b = |z|\sin\theta$

**Euler's formula** (derived in Phase 4 using Taylor series):
$$e^{i\theta} = \cos\theta + i\sin\theta$$

This makes complex multiplication geometric: $|z_1 z_2| = |z_1||z_2|$ and
$\arg(z_1 z_2) = \arg(z_1) + \arg(z_2)$ — multiplication scales by the moduli
and adds the angles.

---

## Phase 4 — Exponentials, Logarithms, and Trigonometry

*3 weeks · The transcendental functions*

### Lesson 4.1 — The Exponential Function

**The question that defines the exponential:**

Is there a function that equals its own derivative? That is: $f'(x) = f(x)$?

We don't know what a derivative is yet (that's Phase 6). But we can ask the question
with what we know: is there a function $f$ such that the rate at which it grows is
always proportional to how large it already is?

This is the property of compound interest, population growth, radioactive decay —
the most important class of real-world behaviour. The function that has this
property is the exponential.

**Defining $e$:**

We will define $e$ as the unique number such that the slope of $y = e^x$ at $x = 0$
is exactly 1. The formal definition via limits:

$$e = \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n \approx 2.71828\ldots$$

We will re-derive this in Phase 5 once limits are rigorous. For now: $e$ is the
base that makes the exponential its own derivative.

```python
# Approximate e using the limit definition
# e = lim(1 + 1/n)^n as n → infinity
# We'll see how quickly the sequence converges

for n in [1, 10, 100, 1000, 10000, 1000000]:
    approx_e = (1 + 1/n)**n
    print(f"n = {n:>8d}:  (1+1/n)^n = {approx_e:.8f}")

import math
print(f"\nMath.e      =              {math.e:.8f}")
```

### Lesson 4.2 — Logarithms as Inverses

**The logarithm is the inverse of the exponential:**

Since $f(x) = e^x$ is bijective from $\mathbb{R}$ to $(0, \infty)$, it has an
inverse $f^{-1}: (0, \infty) \to \mathbb{R}$. This inverse is $\ln x$ (the natural
logarithm).

By the definition of inverse: $\ln(e^x) = x$ and $e^{\ln x} = x$.

**The logarithm laws — derived from exponent laws:**

Since $\ln$ is the inverse of $\exp$:

$\ln(ab) = \ln a + \ln b$

**Proof:** Let $a = e^s$ and $b = e^t$ (valid since $\exp$ is surjective onto
$(0,\infty)$). Then $\ln(ab) = \ln(e^s e^t) = \ln(e^{s+t}) = s+t = \ln a + \ln b$. $\square$

Similarly: $\ln(a^r) = r\ln a$ and $\ln(a/b) = \ln a - \ln b$.

**Change of base:** $\log_b(x) = \frac{\ln x}{\ln b}$ — every logarithm is the
natural logarithm scaled by a constant.

### Lesson 4.3 — Trigonometry from the Unit Circle

**The unit circle definition — not the right-triangle definition:**

The right-triangle definition of $\sin$ and $\cos$ only works for angles in
$(0°, 90°)$. The unit circle definition works for all angles, negative angles,
and angles greater than $360°$ — and connects to complex numbers.

Define: for angle $\theta$ (measured in radians from the positive $x$-axis),
$(\cos\theta, \sin\theta)$ is the point on the unit circle $x^2 + y^2 = 1$ at
angle $\theta$.

**Why radians:**

Radians are not a unit — they are a ratio: $\theta$ radians means the arc length
along the unit circle equals $\theta$ (since the circle has circumference $2\pi$
and the arc for angle $\theta$ is $\frac{\theta}{2\pi} \cdot 2\pi = \theta$).

The reason radians are essential for calculus: the derivative of $\sin\theta$ is
$\cos\theta$ *only in radians*. In degrees, it would be $\frac{\pi}{180}\cos\theta$.
Radians make the mathematics clean.

**The Pythagorean identity — proved from definition:**

Since $(\cos\theta, \sin\theta)$ lies on the unit circle $x^2 + y^2 = 1$:

$$\cos^2\theta + \sin^2\theta = 1$$

This is not a formula. It is the definition of the unit circle, rewritten. Everything
else (the other Pythagorean identities, the double angle formulas) follows from this
one identity and the sum formulas.

**The angle addition formulas — derived geometrically:**

$$\cos(\alpha + \beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta$$
$$\sin(\alpha + \beta) = \sin\alpha\cos\beta + \cos\alpha\sin\beta$$

**Derivation via complex numbers** (the cleanest proof):

$e^{i(\alpha+\beta)} = e^{i\alpha} \cdot e^{i\beta}$

By Euler's formula:
$(\cos(\alpha+\beta) + i\sin(\alpha+\beta)) = (\cos\alpha + i\sin\alpha)(\cos\beta + i\sin\beta)$

Expanding the right side and matching real and imaginary parts gives both formulas simultaneously.

**Double angle formulas** (derived, not memorised):

Set $\alpha = \beta$ in the addition formulas:
$$\cos(2\theta) = \cos^2\theta - \sin^2\theta = 2\cos^2\theta - 1 = 1 - 2\sin^2\theta$$
$$\sin(2\theta) = 2\sin\theta\cos\theta$$

---

## Phase 5 — Limits and Continuity

*3 weeks · Making "approaching" precise*

### The Central Question

What does it mean to say a function "approaches" a value? The word seems obvious
until you try to make it precise. The difficulty: we want to say $f(x)$ "gets
close to" $L$ as $x$ "gets close to" $a$ — but how close is close? How do we make
"arbitrarily close" into mathematics?

The answer — the epsilon-delta definition — is one of the great achievements in
the history of mathematics. It took two centuries of calculus being done
intuitively before Weierstrass made it rigorous in the 1870s.

### Lesson 5.1 — The Epsilon-Delta Definition

**Building intuition first:**

The statement $\lim_{x \to a} f(x) = L$ means: we can make $f(x)$ as close to $L$
as we want, by taking $x$ sufficiently close to $a$.

"As close as we want" — any target tolerance $\varepsilon > 0$ can be achieved.
"Sufficiently close" — there exists some radius $\delta > 0$ around $a$ such that
all $x$ within $\delta$ of $a$ produce $f(x)$ within $\varepsilon$ of $L$.

**The formal definition:**

$$\lim_{x \to a} f(x) = L \iff \forall \varepsilon > 0,\ \exists \delta > 0 \text{ such that } 0 < |x - a| < \delta \Rightarrow |f(x) - L| < \varepsilon$$

The order of the quantifiers matters critically: $\forall \varepsilon\ \exists \delta$
means $\delta$ can depend on $\varepsilon$. The smaller the tolerance $\varepsilon$,
the smaller $\delta$ may need to be. This is the whole game.

Note $0 < |x - a|$ — the definition explicitly excludes $x = a$. The limit is about
what $f(x)$ approaches, not what $f(a)$ equals.

**A concrete proof:**

*Claim:* $\lim_{x \to 3} (2x - 1) = 5$.

**Proof strategy:** We need to find, for any $\varepsilon > 0$, a $\delta > 0$ such
that $0 < |x - 3| < \delta$ guarantees $|(2x-1) - 5| < \varepsilon$.

**Scratchwork** (not part of the proof): simplify the conclusion:
$|(2x-1) - 5| = |2x - 6| = 2|x - 3|$. So we need $2|x-3| < \varepsilon$,
i.e. $|x-3| < \varepsilon/2$. So choose $\delta = \varepsilon/2$.

**Proof:** Given $\varepsilon > 0$, choose $\delta = \varepsilon/2$. If $0 < |x-3| < \delta$:
$$|(2x-1) - 5| = |2x - 6| = 2|x-3| < 2\delta = 2 \cdot \frac{\varepsilon}{2} = \varepsilon. \quad \square$$

```python
# Visualise the epsilon-delta definition
# For f(x) = 2x - 1, limit at x=3 is L=5
# Given epsilon, our delta = epsilon/2

import math

def f(x):
    return 2*x - 1

a, L = 3, 5

print("Epsilon-delta verification for lim(2x-1) = 5 as x→3")
print(f"{'epsilon':>10} {'delta':>10} {'max|f(x)-L| in (a±δ)':>25}")
print("-" * 50)

for epsilon in [1.0, 0.1, 0.01, 0.001]:
    delta = epsilon / 2
    # Sample 1000 points in (a-delta, a+delta), excluding a itself
    worst_case = 0
    for k in range(1, 1001):
        x = a - delta + (2*delta * k/1000)
        if x != a:
            worst_case = max(worst_case, abs(f(x) - L))
    print(f"{epsilon:>10.4f} {delta:>10.4f} {worst_case:>25.6f}  {'<ε ✓' if worst_case < epsilon else 'FAIL'}")
```

### Lesson 5.2 — Limit Laws and Continuity

**Limit laws** (proved using the epsilon-delta definition):

If $\lim_{x \to a} f(x) = L$ and $\lim_{x \to a} g(x) = M$, then:

$$\lim_{x \to a} [f(x) + g(x)] = L + M$$
$$\lim_{x \to a} [f(x) \cdot g(x)] = L \cdot M$$
$$\lim_{x \to a} \frac{f(x)}{g(x)} = \frac{L}{M} \quad \text{if } M \neq 0$$

These are proved by the triangle inequality and bounds on products.

**Continuity:**

$f$ is *continuous at $a$* if $\lim_{x \to a} f(x) = f(a)$. Three things must hold:
1. $f(a)$ is defined
2. $\lim_{x \to a} f(x)$ exists
3. They are equal

$f$ is continuous on an interval if it is continuous at every point in the interval.

**The Intermediate Value Theorem (IVT):**

*If $f$ is continuous on $[a,b]$ and $f(a) < 0 < f(b)$ (or vice versa), then
there exists $c \in (a, b)$ with $f(c) = 0$.*

More generally: a continuous function on $[a,b]$ achieves every value between
$f(a)$ and $f(b)$.

**Proof idea:** The IVT is a consequence of the *completeness* of $\mathbb{R}$ —
the property that every bounded set has a least upper bound. The set
$S = \{x \in [a,b] : f(x) < 0\}$ is bounded above by $b$. Its supremum $c$
is the zero. This proof is made rigorous in Phase 16.

**Why IVT matters:** It guarantees root existence without finding the root.
It underlies bisection search — the algorithm that finds a root to any desired
precision by halving an interval.

```python
def bisection(f, a, b, tolerance=1e-10, max_iterations=100):
    """
    Find a root of f in [a,b] using the Intermediate Value Theorem.
    Requires f(a) and f(b) to have opposite signs — IVT guarantees a root exists.
    Each iteration halves the interval, so error after n steps is (b-a)/2^n.
    """
    assert f(a) * f(b) < 0, "IVT precondition: f(a) and f(b) must have opposite signs"

    for iteration in range(max_iterations):
        midpoint = (a + b) / 2
        f_mid = f(midpoint)

        if abs(f_mid) < tolerance or (b - a) / 2 < tolerance:
            return midpoint, iteration + 1

        # The IVT step: keep the half-interval where the sign change occurs
        if f(a) * f_mid < 0:
            b = midpoint   # root is in left half
        else:
            a = midpoint   # root is in right half

    return (a + b) / 2, max_iterations

# Find sqrt(2) as a root of x^2 - 2 = 0
root, iters = bisection(lambda x: x**2 - 2, a=1, b=2)
print(f"sqrt(2) ≈ {root:.15f}  (in {iters} iterations)")
print(f"Verify:  {root}^2 = {root**2:.15f}  (should be 2.0)")
```

---

## Phase 6 — Differential Calculus

*4 weeks · How things change*

### The Central Question

A moving car travels 100 km in 2 hours. Average speed: 50 km/h. But was it going
exactly 50 km/h at every moment? Of course not. The speedometer at any instant
shows something different — an *instantaneous* rate.

Instantaneous rate is the central concept of differential calculus. The challenge:
speed is $\frac{\Delta \text{distance}}{\Delta \text{time}}$, but at a single
instant $\Delta t = 0$, which makes this $\frac{0}{0}$ — undefined. The derivative
is the resolution of this paradox.

### Lesson 6.1 — The Derivative as a Limit

**Definition:**

$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$

This is not arbitrary. The expression $\frac{f(x+h)-f(x)}{h}$ is the slope of the
*secant line* through $(x, f(x))$ and $(x+h, f(x+h))$. As $h \to 0$, the secant
line approaches the *tangent line* at $(x, f(x))$. The derivative is the slope
of the tangent line.

**Computing derivatives from the definition:**

*Derive $\frac{d}{dx}[x^2]$:*

$$\lim_{h \to 0} \frac{(x+h)^2 - x^2}{h} = \lim_{h \to 0} \frac{x^2 + 2xh + h^2 - x^2}{h} = \lim_{h \to 0} \frac{2xh + h^2}{h} = \lim_{h \to 0} (2x + h) = 2x$$

*Derive $\frac{d}{dx}[\sin x]$:*

$$\lim_{h \to 0} \frac{\sin(x+h) - \sin x}{h}$$

Using the angle addition formula: $\sin(x+h) = \sin x \cos h + \cos x \sin h$:

$$= \lim_{h \to 0} \frac{\sin x \cos h + \cos x \sin h - \sin x}{h}$$
$$= \sin x \cdot \lim_{h \to 0} \frac{\cos h - 1}{h} + \cos x \cdot \lim_{h \to 0} \frac{\sin h}{h}$$

Two standard limits (proved using geometry of the unit circle):
$\lim_{h \to 0} \frac{\sin h}{h} = 1$ and $\lim_{h \to 0} \frac{\cos h - 1}{h} = 0$.

Therefore: $\frac{d}{dx}[\sin x] = \cos x$. $\square$

### Lesson 6.2 — Differentiation Rules

**All rules proved from the definition:**

*Product rule:* $\frac{d}{dx}[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)$

**Proof:** Let $F = fg$. Using the definition:

$$F'(x) = \lim_{h \to 0} \frac{f(x+h)g(x+h) - f(x)g(x)}{h}$$

Add and subtract $f(x)g(x+h)$:

$$= \lim_{h\to 0}\left[\frac{f(x+h)-f(x)}{h} \cdot g(x+h) + f(x) \cdot \frac{g(x+h)-g(x)}{h}\right]$$

$$= f'(x) \cdot g(x) + f(x) \cdot g'(x) \quad \square$$

(using continuity of $g$: $\lim_{h\to 0} g(x+h) = g(x)$)

*Chain rule:* $\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x)$

**Proof idea:** The chain rule is the limit of $\frac{\Delta f}{\Delta x} = \frac{\Delta f}{\Delta g} \cdot \frac{\Delta g}{\Delta x}$ as the increments go to zero. The rigorous proof requires care when $\Delta g = 0$ and is given fully in Phase 16.

**The power rule for all real exponents:** $\frac{d}{dx}[x^n] = nx^{n-1}$

For integer $n$: proved by induction using the product rule.
For rational $n = p/q$: use implicit differentiation on $y^q = x^p$.
For real $n$: write $x^n = e^{n\ln x}$ and differentiate using the chain rule.

### Lesson 6.3 — What the Derivative Tells You

**First derivative test — increasing/decreasing:**

If $f'(x) > 0$ on an interval, $f$ is increasing there. If $f'(x) < 0$, decreasing.

**Proof:** By the Mean Value Theorem (below): for $x_1 < x_2$ in the interval,
$f(x_2) - f(x_1) = f'(c)(x_2 - x_1)$ for some $c \in (x_1, x_2)$. If $f'(c) > 0$
and $x_2 > x_1$, then $f(x_2) > f(x_1)$.

**The Mean Value Theorem:**

*If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$, then there exists
$c \in (a,b)$ with $f'(c) = \frac{f(b)-f(a)}{b-a}$.*

Geometrically: the tangent line at some interior point is parallel to the secant
line from $a$ to $b$.

**Second derivative — concavity:**

$f''(x) > 0$: $f$ is concave up (holds water, like a cup).
$f''(x) < 0$: $f$ is concave down.
$f''(c) = 0$ with sign change: inflection point.

**L'Hôpital's Rule:**

If $\lim_{x \to a} f(x) = \lim_{x \to a} g(x) = 0$ (or both $\pm\infty$), then:

$$\lim_{x\to a}\frac{f(x)}{g(x)} = \lim_{x\to a}\frac{f'(x)}{g'(x)}$$

provided the right side exists. Proof uses the Cauchy Mean Value Theorem (generalisation of MVT).

---

## Phase 7 — Integral Calculus

*4 weeks · Accumulation and the Fundamental Theorem*

### The Central Question

We know how to find instantaneous rates of change (derivatives). Now: given the
rate of change, can we recover the original quantity? Can we compute areas,
volumes, total accumulated effects of varying quantities?

These two questions — reconstruction from rates, and area computation — seem unrelated.
The Fundamental Theorem of Calculus says they are the same question.

### Lesson 7.1 — The Riemann Integral

**Defining area rigorously:**

The area under $y = f(x)$ from $a$ to $b$: approximate with $n$ rectangles of
width $\Delta x = (b-a)/n$. Each rectangle has height $f(x_k^*)$ for some
$x_k^* \in [x_{k-1}, x_k]$. The Riemann sum:

$$S_n = \sum_{k=1}^{n} f(x_k^*) \,\Delta x$$

The integral is the limit of Riemann sums as $n \to \infty$ and $\Delta x \to 0$:

$$\int_a^b f(x)\,dx = \lim_{n \to \infty} \sum_{k=1}^{n} f(x_k^*)\,\Delta x$$

This limit exists (and is the same regardless of how $x_k^*$ is chosen) when $f$
is continuous on $[a,b]$ — proved in Phase 16 using the completeness of $\mathbb{R}$.

```python
import math

def riemann_sum(f, a, b, n, method='midpoint'):
    """
    Approximate integral of f from a to b using n rectangles.
    method: 'left', 'right', or 'midpoint'
    The Riemann sum IS the integral, in the limit n → infinity.
    """
    dx = (b - a) / n
    total = 0
    for k in range(n):
        x_left  = a + k * dx
        x_right = a + (k + 1) * dx
        if method == 'left':
            height = f(x_left)
        elif method == 'right':
            height = f(x_right)
        else:
            height = f((x_left + x_right) / 2)
        total += height * dx
    return total

# Integrate x^2 from 0 to 1. Exact answer: 1/3
f = lambda x: x**2
exact = 1/3
print(f"Integral of x² from 0 to 1. Exact: {exact:.6f}")
print(f"\n{'n':>6}  {'midpoint approx':>18}  {'error':>12}")
for n in [10, 100, 1000, 10000]:
    approx = riemann_sum(f, 0, 1, n)
    error  = abs(approx - exact)
    print(f"{n:>6}  {approx:>18.8f}  {error:>12.2e}")
```

### Lesson 7.2 — The Fundamental Theorem of Calculus

**The most important theorem in calculus:**

Let $F(x) = \int_a^x f(t)\,dt$. Then:

**FTC Part 1:** $F'(x) = f(x)$. Integration and differentiation are inverse operations.

**Proof:**
$$F'(x) = \lim_{h \to 0} \frac{F(x+h) - F(x)}{h} = \lim_{h \to 0} \frac{1}{h}\int_x^{x+h} f(t)\,dt$$

Since $f$ is continuous, by the mean value theorem for integrals, $\int_x^{x+h} f(t)\,dt = f(c) \cdot h$ for some $c \in [x, x+h]$. As $h \to 0$, $c \to x$, so $f(c) \to f(x)$. Therefore $F'(x) = f(x)$. $\square$

**FTC Part 2:** If $F'(x) = f(x)$, then $\int_a^b f(x)\,dx = F(b) - F(a)$.

This converts area computation into antidifferentiation — a completely algebraic
operation. This is why integration tables work.

**Integration techniques** — each is a reversal of a differentiation rule:

- Substitution (reverse chain rule): $\int f(g(x))g'(x)\,dx = \int f(u)\,du$
- Integration by parts (reverse product rule): $\int u\,dv = uv - \int v\,du$
- Partial fractions: for rational functions, decompose before integrating

---

## Phase 8 — Sequences and Series

*3 weeks · Infinite processes with finite results*

### The Central Question

$1 + \frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \cdots$

Does this have a finite sum? Intuitively: each term adds less than half what
remains to reach 2, so the sum approaches 2 but never exceeds it. But making
this precise requires the theory of limits applied to sequences.

### Lesson 8.1 — Convergence of Sequences

**Definition:**

A sequence $\{a_n\}$ *converges to $L$* if:

$$\forall \varepsilon > 0,\ \exists N \in \mathbb{N} \text{ such that } n > N \Rightarrow |a_n - L| < \varepsilon$$

This is the same epsilon-delta structure as function limits, applied to sequences.

### Lesson 8.2 — Series and Convergence Tests

**A series** $\sum_{n=1}^{\infty} a_n$ converges if the sequence of partial sums
$S_N = \sum_{n=1}^{N} a_n$ converges.

**The geometric series** (exact closed form):

$$\sum_{n=0}^{\infty} r^n = \frac{1}{1-r} \quad \text{for } |r| < 1$$

**Proof:** $S_N = 1 + r + r^2 + \cdots + r^N$. Multiply by $r$: $rS_N = r + r^2 + \cdots + r^{N+1}$. Subtract: $S_N(1-r) = 1 - r^{N+1}$. So $S_N = \frac{1-r^{N+1}}{1-r}$. As $N \to \infty$ and $|r| < 1$: $r^{N+1} \to 0$, so $S_N \to \frac{1}{1-r}$. $\square$

**Convergence tests** (each with a proof or proof sketch):

| Test | Statement | Use when |
|---|---|---|
| Divergence | If $a_n \not\to 0$ then $\sum a_n$ diverges | Quick elimination |
| Ratio | $\sum a_n$ converges if $\lim |a_{n+1}/a_n| < 1$ | Factorial or exponential terms |
| Integral | $\sum f(n)$ and $\int_1^\infty f(x)\,dx$ converge together | Monotone decreasing $f$ |
| Comparison | $0 \leq a_n \leq b_n$: if $\sum b_n$ converges so does $\sum a_n$ | Against known series |
| Alternating | $\sum (-1)^n b_n$ converges if $b_n \searrow 0$ | Alternating signs |

### Lesson 8.3 — Taylor Series

**The question:** Can we approximate any smooth function by a polynomial?

If $f(x) = c_0 + c_1 x + c_2 x^2 + \cdots$, then differentiating $k$ times and
setting $x = 0$: $f^{(k)}(0) = k! \cdot c_k$. So $c_k = \frac{f^{(k)}(0)}{k!}$.

**Taylor series centred at 0:**

$$f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(0)}{n!} x^n$$

**Key series** (each derived, not memorised):

$$e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots$$

$$\sin x = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{(2n+1)!} = x - \frac{x^3}{6} + \frac{x^5}{120} - \cdots$$

$$\cos x = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n}}{(2n)!} = 1 - \frac{x^2}{2} + \frac{x^4}{24} - \cdots$$

**Euler's formula — derived:**

$$e^{ix} = \sum_{n=0}^{\infty} \frac{(ix)^n}{n!} = 1 + ix - \frac{x^2}{2} - \frac{ix^3}{6} + \cdots$$

Separating real and imaginary parts: $e^{ix} = \cos x + i\sin x$. $\square$

---

## Phase 9 — Multivariable Calculus

*4 weeks · Calculus in higher dimensions*

### Lesson 9.1 — Partial Derivatives

$\frac{\partial f}{\partial x}$ — derivative of $f(x, y)$ with respect to $x$,
holding $y$ constant. Everything from single-variable calculus applies to each
variable in turn.

The *gradient* $\nabla f = \left(\frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}\right)$ points in the direction of steepest ascent. This is not a definition — it is a theorem that follows from the directional derivative.

### Lesson 9.2 — Multiple Integrals

$\iint_D f(x,y)\,dA$ — integrate over a 2D region $D$ by iterated integration (Fubini's theorem: order of integration can be swapped under mild conditions).

### Lesson 9.3 — The Jacobian and Change of Variables

For a change of variables $(x,y) = \Phi(u,v)$, the area element transforms:
$dA = |J_\Phi|\,du\,dv$ where $J_\Phi = \frac{\partial(x,y)}{\partial(u,v)}$ is the
Jacobian determinant. This is the multivariable analogue of $u$-substitution.

---

## Phase 10 — Linear Algebra I

*4 weeks · The geometry of linear transformations*

### The Central Question

What does it mean for a function to be *linear*? And what is the structure of
all linear functions between vector spaces? Linear algebra answers these questions
and in doing so becomes the mathematical foundation for: machine learning (neural
networks are compositions of linear maps), graphics (every 3D transformation is
a matrix), quantum mechanics, economics, and the numerical methods underlying all
scientific computing.

### Lesson 10.1 — Vectors and Vector Spaces

**The abstract definition:**

A *vector space* over $\mathbb{R}$ is a set $V$ with operations of addition and
scalar multiplication satisfying eight axioms (closure, commutativity, associativity,
zero vector, additive inverse, scalar identity, scalar associativity, distributivity).

The key insight: vectors are not "arrows." Vectors are *elements of a vector space*.
$\mathbb{R}^n$, polynomials of degree $\leq n$, continuous functions on $[0,1]$,
$n \times n$ matrices — all are vector spaces. Linear algebra applies to all of them.

**Linear independence and span:**

Vectors $v_1, \ldots, v_k$ are *linearly independent* if the only solution to
$c_1 v_1 + \cdots + c_k v_k = 0$ is $c_1 = \cdots = c_k = 0$.

Their *span* is the set of all linear combinations $\{c_1 v_1 + \cdots + c_k v_k : c_i \in \mathbb{R}\}$.

A *basis* for $V$ is a linearly independent set that spans $V$. The *dimension*
of $V$ is the number of elements in any basis (proved to be well-defined: any
two bases have the same cardinality).

### Lesson 10.2 — Linear Transformations and Matrices

**Linear transformations:**

$T: V \to W$ is *linear* if $T(u + v) = T(u) + T(v)$ and $T(cv) = cT(v)$ for all
$u, v \in V$, $c \in \mathbb{R}$.

A linear transformation is completely determined by what it does to a basis.

**Matrices as linear transformations:**

Every linear map $T: \mathbb{R}^n \to \mathbb{R}^m$ corresponds to an $m \times n$
matrix $A$ via $T(x) = Ax$. The columns of $A$ are the images of the standard basis vectors.

Matrix multiplication $AB$ corresponds to composing transformations: $T_A \circ T_B$.
This is *why* matrix multiplication is defined the way it is — not as an arbitrary
rule, but as the unique definition that makes composition work.

**The Four Fundamental Subspaces:**

For a matrix $A$:
- Column space $\text{Col}(A)$: span of the columns
- Null space $\text{Null}(A)$: $\{x : Ax = 0\}$
- Row space $\text{Row}(A)$: span of the rows
- Left null space $\text{Null}(A^T)$

The *rank-nullity theorem*: $\text{rank}(A) + \text{nullity}(A) = n$ (number of columns).

### Lesson 10.3 — Determinants

**Defining the determinant geometrically:**

The determinant of a $2 \times 2$ matrix $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$
is $ad - bc$. Where does this come from?

The columns $(a,c)$ and $(b,d)$ are two vectors. The parallelogram they span has
signed area $ad - bc$. The determinant *is* the signed scaling factor of the
linear transformation: $|\det A|$ is how much $A$ scales areas/volumes.

If $\det A = 0$: the transformation collapses space — the columns are linearly
dependent, the matrix is singular (non-invertible).

**Gaussian elimination and LU decomposition:**

Row reduction is the systematic algorithm for solving $Ax = b$. Each row operation
is itself a linear transformation (multiplication by an elementary matrix). LU
decomposition records the row operations as a lower triangular matrix $L$, writing
$A = LU$.

```python
import numpy as np

def solve_system(A, b):
    """
    Solve Ax = b using numpy's LU-based solver.
    We verify by checking Ax = b after solving.
    """
    A = np.array(A, dtype=float)
    b = np.array(b, dtype=float)
    x = np.linalg.solve(A, b)
    residual = np.linalg.norm(A @ x - b)
    print(f"Solution x = {x}")
    print(f"Residual |Ax - b| = {residual:.2e}  (should be ~0)")
    return x

# Solve: 2x + y = 5, x + 3y = 10
A = [[2, 1], [1, 3]]
b = [5, 10]
print("Solving 2x + y = 5, x + 3y = 10:")
x = solve_system(A, b)
print(f"Verify: x={x[0]:.3f}, y={x[1]:.3f}")
print(f"  2x+y  = {2*x[0]+x[1]:.3f}  (want 5)")
print(f"  x+3y  = {x[0]+3*x[1]:.3f}  (want 10)")
```

---

## Phase 11 — Linear Algebra II

*3 weeks · Eigenvalues and the spectral theorem*

### The Central Question

Every linear transformation has "preferred directions" — directions that it only
scales, never rotates. Understanding these directions reveals the deep structure
of the transformation. This is the theory of eigenvalues.

### Lesson 11.1 — Eigenvalues and Eigenvectors

**Definition:**

$v \neq 0$ is an *eigenvector* of $A$ with *eigenvalue* $\lambda$ if $Av = \lambda v$.

$A$ doesn't rotate $v$ — it only scales it. $\lambda$ is the scale factor.

**Finding eigenvalues:**

$Av = \lambda v \iff (A - \lambda I)v = 0 \iff A - \lambda I$ is singular $\iff \det(A - \lambda I) = 0$.

The equation $\det(A - \lambda I) = 0$ is the *characteristic equation* — a
polynomial in $\lambda$ of degree $n$. Its roots are the eigenvalues.

**Diagonalisation:**

If $A$ has $n$ linearly independent eigenvectors $v_1, \ldots, v_n$ with eigenvalues
$\lambda_1, \ldots, \lambda_n$, then $A = P D P^{-1}$ where $D = \text{diag}(\lambda_1, \ldots, \lambda_n)$ and $P = [v_1 | \cdots | v_n]$.

**Why diagonalisation matters:** $A^k = P D^k P^{-1}$ — computing matrix powers
reduces to powering diagonal entries. Markov chains, differential equations, page
rank algorithms, and principal component analysis all use this.

### Lesson 11.2 — The Spectral Theorem

**For symmetric matrices:**

*Spectral Theorem:* Every real symmetric matrix $A = A^T$ has:
1. All real eigenvalues
2. Eigenvectors for different eigenvalues are orthogonal
3. $A = Q \Lambda Q^T$ where $Q$ is orthogonal ($Q^T Q = I$) and $\Lambda$ diagonal

This is the most important theorem in applied linear algebra. PCA, covariance
matrices, and quadratic forms all depend on it.

### Lesson 11.3 — Singular Value Decomposition

**Every matrix** $A$ (not just square, not just symmetric) can be written:

$$A = U \Sigma V^T$$

where $U$, $V$ are orthogonal matrices and $\Sigma$ is diagonal with non-negative
entries (the *singular values*).

**Geometric interpretation:** Every linear transformation is a rotation ($V^T$),
followed by a scaling ($\Sigma$), followed by another rotation ($U$). No matter
how complicated the matrix, this is all it does.

SVD underlies: least squares regression, image compression, recommendation systems,
dimensionality reduction (PCA is a special case of SVD), and the pseudoinverse.

---

## Phase 12 — Probability and Statistics

*4 weeks · Reasoning under uncertainty*

### Lesson 12.1 — Probability Spaces

Formally: a probability space is $(\Omega, \mathcal{F}, P)$ where $\Omega$ is the
sample space, $\mathcal{F}$ is a $\sigma$-algebra of events, and $P$ is a
measure with $P(\Omega) = 1$.

For discrete spaces: $P(\{x\}) = p_x \geq 0$ and $\sum_x p_x = 1$.
For continuous spaces: $P(A) = \int_A f(x)\,dx$ where $f$ is the density.

### Lesson 12.2 — Random Variables and Expectation

**Random variable:** a function $X: \Omega \to \mathbb{R}$.

**Expectation:** $E[X] = \sum_x x \cdot P(X = x)$ (discrete) or $\int x f(x)\,dx$ (continuous).

**Linearity of expectation** (proved): $E[X + Y] = E[X] + E[Y]$ regardless of dependence.

**Variance:** $\text{Var}(X) = E[(X - E[X])^2] = E[X^2] - (E[X])^2$.

### Lesson 12.3 — Key Distributions

| Distribution | Arises from | PMF/PDF | $E[X]$ | $\text{Var}(X)$ |
|---|---|---|---|---|
| Bernoulli$(p)$ | Single trial | $P(X=1)=p$ | $p$ | $p(1-p)$ |
| Binomial$(n,p)$ | $n$ independent trials | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| Geometric$(p)$ | Trials until first success | $(1-p)^{k-1}p$ | $1/p$ | $(1-p)/p^2$ |
| Poisson$(\lambda)$ | Rare events in large $n$ | $e^{-\lambda}\lambda^k/k!$ | $\lambda$ | $\lambda$ |
| Normal$(\mu,\sigma^2)$ | Sum of many variables (CLT) | $\frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/2\sigma^2}$ | $\mu$ | $\sigma^2$ |

**The Central Limit Theorem:**

If $X_1, X_2, \ldots$ are i.i.d. with mean $\mu$ and variance $\sigma^2$, then
$\frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \to N(0,1)$ in distribution as $n \to \infty$.

This is why the normal distribution is everywhere: it is the limit of any sum of
independent random variables, regardless of their individual distributions.

---

## Phase 13 — Combinatorics and Discrete Mathematics

*3 weeks · Exact counting*

### Lesson 13.1 — Counting Principles

**The multiplication principle:** If a process has $k$ steps with $n_1, n_2, \ldots, n_k$ choices respectively, the total number of outcomes is $n_1 \cdot n_2 \cdots n_k$.

**Permutations:** Ordered arrangements of $r$ from $n$: $P(n,r) = \frac{n!}{(n-r)!}$.

**Combinations:** Unordered selections of $r$ from $n$: $C(n,r) = \binom{n}{r} = \frac{n!}{r!(n-r)!}$.

**Proof of the combination formula:**

Start with permutations: $P(n,r)$ ways to arrange $r$ items in order. But each
unordered set of $r$ items was counted $r!$ times (once per ordering). So:
$C(n,r) = \frac{P(n,r)}{r!} = \frac{n!}{r!(n-r)!}$. $\square$

### Lesson 13.2 — The Pigeonhole Principle and Inclusion-Exclusion

**Pigeonhole principle:** If $n+1$ objects are placed in $n$ boxes, at least one
box contains at least 2 objects. Simple but powerful — it underlies results in
number theory, Ramsey theory, and complexity theory.

**Inclusion-exclusion:**

$$|A \cup B| = |A| + |B| - |A \cap B|$$

Generalisation: $|A_1 \cup \cdots \cup A_n| = \sum|A_i| - \sum|A_i \cap A_j| + \cdots$

### Lesson 13.3 — Graph Theory Basics

A *graph* $G = (V, E)$ is a set of vertices $V$ and edges $E \subseteq V \times V$.

**Trees:** connected acyclic graphs. A tree on $n$ vertices has exactly $n-1$ edges
(proved by induction).

**Euler's formula:** For a connected planar graph: $V - E + F = 2$ (where $F$ counts faces, including the outer infinite face). Proved using spanning trees.

---

## Phase 14 — Number Theory

*3 weeks · The structure of the integers*

### Lesson 14.1 — Divisibility and the Euclidean Algorithm

(As developed in the Concrete Mathematics prelude, but now in full generality)

**Bézout's theorem:** For $a, b \in \mathbb{Z}$, there exist $x, y \in \mathbb{Z}$
with $ax + by = \gcd(a,b)$.

**The Fundamental Theorem of Arithmetic:** Every integer $n > 1$ has a unique
factorisation into primes (up to order).

### Lesson 14.2 — Modular Arithmetic

**Congruence:** $a \equiv b \pmod{n}$ means $n \mid (a - b)$.

The integers mod $n$, written $\mathbb{Z}/n\mathbb{Z}$, form a ring.
When $n$ is prime, they form a *field* — every nonzero element has a multiplicative
inverse (this is the field $\mathbb{F}_p$, foundational in cryptography).

**Fermat's Little Theorem:** If $p$ is prime and $\gcd(a,p)=1$: $a^{p-1} \equiv 1 \pmod{p}$.

**Chinese Remainder Theorem:** If $n_1, \ldots, n_k$ are pairwise coprime, the
system $x \equiv a_i \pmod{n_i}$ has a unique solution mod $n_1 \cdots n_k$.

---

## Phase 15 — Concrete Mathematics

*4 weeks · The mathematics of algorithm analysis*

*(Full curriculum delivered separately — this is where the Concrete Mathematics
book is read, with the proof-literate approach established in all prior phases.
By this point the student has the linear algebra for generating functions, the
calculus for asymptotics, the number theory for the results in Chapter 4, and the
combinatorics for binomial coefficients.)*

---

## Phase 16 — Real Analysis

*5 weeks · Why calculus works*

### The Central Question

Calculus works. We have been using it since Phase 5. But we have been taking certain
things on faith: that continuous functions on closed intervals attain their bounds,
that every Cauchy sequence converges, that the Riemann integral exists for continuous
functions. Real analysis proves all of these — rigorously, from the completeness
axiom of $\mathbb{R}$.

### Lesson 16.1 — Completeness and the Real Numbers

**The completeness axiom:**

*Every non-empty set of real numbers that is bounded above has a least upper bound
(supremum).*

This one axiom separates $\mathbb{R}$ from $\mathbb{Q}$. The set
$\{x \in \mathbb{Q} : x^2 < 2\}$ has no least upper bound in $\mathbb{Q}$
(it would be $\sqrt{2}$, which is irrational). In $\mathbb{R}$, it does.

**Consequences of completeness:**

- Monotone convergence theorem: bounded monotone sequences converge
- Bolzano-Weierstrass: every bounded sequence has a convergent subsequence
- Heine-Cantor: continuous functions on closed bounded intervals are uniformly continuous
- Extreme value theorem: continuous functions on $[a,b]$ attain max and min

### Lesson 16.2 — Rigorous Epsilon-Delta Proofs

Here we return to limits and continuity with full rigour, proving results we
used in Phases 5–9 from the completeness axiom alone.

### Lesson 16.3 — Uniform Convergence

**Pointwise vs uniform convergence:**

$f_n \to f$ pointwise: for each $x$, $f_n(x) \to f(x)$.
$f_n \to f$ uniformly: $\sup_x |f_n(x) - f(x)| \to 0$.

The difference matters: a pointwise limit of continuous functions need not be
continuous. A uniform limit of continuous functions is continuous. Uniform
convergence is what makes term-by-term integration and differentiation of power
series valid.

---

## Phase 17 — Abstract Algebra

*4 weeks · The deepest structure*

### The Central Question

Throughout this curriculum, we have seen the same patterns appear in different
guises: the integers and polynomials both have division algorithms; $\mathbb{R}$,
$\mathbb{C}$, and $\mathbb{F}_p$ all have field axioms; symmetries of geometric
objects and permutations both compose associatively. Abstract algebra names and
studies these patterns at their most general level.

### Lesson 17.1 — Groups

**Definition:** A *group* is a set $G$ with a binary operation $\star$ satisfying:
- Closure: $a \star b \in G$
- Associativity: $(a \star b) \star c = a \star (b \star c)$
- Identity: $\exists e \in G$ with $e \star a = a \star e = a$
- Inverses: $\forall a \in G,\ \exists a^{-1}$ with $a \star a^{-1} = e$

Examples: $(\mathbb{Z}, +)$, $(\mathbb{R}\setminus\{0\}, \times)$, permutations under composition, the symmetries of a regular polygon.

**Lagrange's theorem:** If $H$ is a subgroup of a finite group $G$, then $|H|$ divides $|G|$.

**Connection to number theory:** Fermat's Little Theorem is a corollary of Lagrange's
theorem applied to the multiplicative group $(\mathbb{Z}/p\mathbb{Z})^*$.

### Lesson 17.2 — Rings and Fields

A *ring* is a group under addition with a second associative distributive
operation (multiplication). A *field* is a ring where every nonzero element
has a multiplicative inverse.

The structures we have seen: $\mathbb{Z}$ (ring, not field), $\mathbb{Q}$, $\mathbb{R}$,
$\mathbb{C}$ (all fields), $\mathbb{Z}/p\mathbb{Z}$ (field when $p$ prime),
polynomial ring $\mathbb{R}[x]$ (ring, not field).

### Lesson 17.3 — Homomorphisms and Isomorphisms

A *homomorphism* $\phi: G \to H$ preserves structure: $\phi(a \star b) = \phi(a) \star \phi(b)$.

An *isomorphism* is a bijective homomorphism — the two groups are "the same structure."

The first isomorphism theorem: $G / \ker\phi \cong \text{Im}(\phi)$.

---

## Phase 18 — Topology and Metric Spaces

*3 weeks · Space without coordinates*

### Lesson 18.1 — Metric Spaces

A *metric space* $(X, d)$ is a set with a distance function $d: X \times X \to \mathbb{R}$
satisfying: $d(x,y) \geq 0$; $d(x,y) = 0 \iff x=y$; $d(x,y) = d(y,x)$; and
the triangle inequality $d(x,z) \leq d(x,y) + d(y,z)$.

Examples: $\mathbb{R}^n$ with Euclidean distance, continuous functions with
$d(f,g) = \max|f(x)-g(x)|$, sequences with various metrics.

All theorems of analysis generalise to metric spaces — the proof structure is the
same, just replace $|x-y|$ with $d(x,y)$.

### Lesson 18.2 — Topological Spaces

A *topology* on $X$ is a collection $\tau$ of subsets (the "open sets") satisfying:
$\emptyset, X \in \tau$; closed under arbitrary union; closed under finite intersection.

Topology is the study of continuity, connectedness, and compactness in the most
general setting — without any notion of distance.

**Compactness:** $K$ is compact if every open cover has a finite subcover. In
$\mathbb{R}^n$: compact $\iff$ closed and bounded (Heine-Borel theorem).

Compactness is the key to: extreme value theorem (continuous functions on compact
sets attain bounds), uniform continuity, and the convergence theorems underlying
numerical methods.

---

## Phase 19 — Synthesis

*2 weeks · Connecting everything*

### What This Phase Is

No new mathematics. Instead: deliberately connecting the ideas that have been
developed across 18 phases. The goal is to see the curriculum not as a list of
topics but as a single coherent structure.

### The Connections

**The recurring ideas:**

1. **Inverse operations** — subtraction inverts addition; division inverts multiplication; logarithm inverts exponential; integral inverts derivative; inverse matrix inverts matrix multiplication; inverse function inverts function composition. One concept, eight manifestations.

2. **Completeness and convergence** — the real numbers are complete; Cauchy sequences converge; power series converge within their radius; eigenvalue methods converge; iterative algorithms converge. The same idea at every level.

3. **Linear structure** — vector spaces, linear maps, inner products, orthogonality. Appears in: polynomial approximation (best linear approximation), Fourier series (orthogonal basis of functions), statistics (least squares is orthogonal projection), quantum mechanics.

4. **The duality of local and global** — derivative (local) vs integral (global); eigenvalue (how a map acts on a vector) vs determinant (how a map scales all of space); pointwise convergence (local) vs uniform convergence (global).

5. **Algebraic structure revealed** — the field axioms underlie all arithmetic; group theory unifies symmetry; ring theory unifies polynomials and integers; topology unifies all notions of continuity.

### The Capstone Projects

*Choose one (or more). Each is a substantial piece of mathematical writing — proof and code together.*

1. **Prove the Prime Number Theorem** using complex analysis (requires the Riemann zeta function, contour integration, and Tauberian theorems).

2. **Implement and analyse the FFT** — derive the Discrete Fourier Transform from inner products on function spaces, prove the Cooley-Tukey factorisation, implement it, and prove the $O(n \log n)$ complexity.

3. **Prove Gödel's First Incompleteness Theorem** — formalise arithmetic, construct the Gödel sentence, prove it is neither provable nor refutable.

4. **Develop the theory of neural networks from first principles** — vector spaces and linear maps (the layers), gradient descent (differentiation and optimisation), backpropagation (chain rule), universal approximation theorem (real analysis).

5. **Prove the spectral theorem for compact self-adjoint operators** — the infinite-dimensional generalisation of the symmetric matrix eigenvalue theorem, which underlies quantum mechanics.

---

## Appendix A — The Weekly Rhythm

At 10 hours per week, each week looks like:

| Session | Duration | Activity |
|---|---|---|
| Daily (5×) | 60 min | Lesson: read, derive, work examples |
| Daily (5×) | 30 min | Problem set: unseen problems from lesson content |
| Saturday | 90 min | Synthesis: connect this week's lesson to prior phases |
| Sunday | 30 min | Proof reconstruction: close the book, rebuild one proof from scratch |

The Sunday session is non-negotiable. The proof reconstruction — done with no
reference material — is the test of whether you understood the lesson or only
followed it.

---

## Appendix B — Resources by Phase

These are referenced materials, not replacements for this curriculum. Use them for
additional problems and alternative perspectives.

| Phase | Primary resource | For deeper reading |
|---|---|---|
| 0–4 | Spivak, *Calculus* (Chs 1–5) | Apostol, *Calculus Vol. 1* |
| 5–7 | Spivak, *Calculus* (Chs 5–18) | Rudin, *Principles of Mathematical Analysis* (as stretch) |
| 8 | Spivak, *Calculus* (Chs 22–24) | Apostol, *Calculus Vol. 1* Chs 10–12 |
| 9 | Stewart, *Multivariable Calculus* | Spivak, *Calculus on Manifolds* (stretch) |
| 10–11 | Strang, *Introduction to Linear Algebra* | Axler, *Linear Algebra Done Right* |
| 12 | Blitzstein & Hwang, *Introduction to Probability* | Feller, *An Introduction to Probability Theory* |
| 13–14 | Graham, Knuth, Patashnik, *Concrete Mathematics* (Chs 1, 4, 5) | Hardy & Wright, *An Introduction to the Theory of Numbers* |
| 15 | Graham, Knuth, Patashnik, *Concrete Mathematics* (full) | Knuth, *The Art of Computer Programming* |
| 16 | Rudin, *Principles of Mathematical Analysis* | Apostol, *Mathematical Analysis* |
| 17 | Dummit & Foote, *Abstract Algebra* (Chs 1–4) | Herstein, *Topics in Algebra* |
| 18 | Munkres, *Topology* (Chs 1–4) | Rudin, *Functional Analysis* (stretch) |

---

## Appendix C — The Proof Reconstruction Log

For each phase, maintain a log of:

1. The theorem
2. The proof strategy (one sentence)
3. The assumptions used
4. Where the proof would fail if an assumption were removed
5. Date reconstructed from scratch

This log is your evidence that you have learned, not just covered, the material.
A phase is not complete until every major theorem in it has an entry in this log.

---

*This curriculum treats mathematics as a unified way of thinking, not a collection
of techniques. Every formula is arrived at. Every theorem is argued for. The student
who completes it will not know more formulas than one who merely took the courses —
they will know why the formulas are true, which is an entirely different thing.*
ENDOFFILE