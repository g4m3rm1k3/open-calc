# Stage 0, Lesson 0.11 — Mathematical Notation and Writing
**Threads:** Math  
**Estimated time:** 45–60 minutes

---

## What This Lesson Is About

Mathematics has a notation system built up over centuries — compact symbols
that express precise ideas in very little space. But notation is only useful
if you can read it fluently and write it correctly. This lesson does two
things. First, it consolidates every symbol introduced across Lessons 0.1
through 0.10 into one reference, with precise meanings and the most common
mistakes. Second, it teaches the craft of writing mathematical arguments
clearly — the difference between a string of symbols that is technically
correct and a proof that a reader can actually follow. Good mathematical
writing is not decoration: it is the difference between a proof that
convinces and a proof that confuses. By the end of this lesson you have
a complete notation reference for Stage 0, and you can take any informal
mathematical argument and write it with the clarity and precision that the
rest of this curriculum demands.

This lesson contains no new mathematical content — it synthesises what
you have already learned. Treat it as a checkpoint: if any notation here
feels unfamiliar, go back to the lesson where it was introduced before
continuing to Stage 1.

---

## Historical Context

Mathematical notation evolved slowly and painfully. For most of history,
mathematics was written entirely in words — Euclid's *Elements* (300 BCE)
contains almost no symbols. The equals sign $=$ was introduced by Robert
Recorde in 1557; he chose two parallel lines because "no two things can
be more equal." The plus and minus signs $+$ and $-$ appeared in print in
1489. The $\sqrt{\phantom{x}}$ symbol appeared around 1525. Leibniz
invented most of calculus notation ($dy/dx$, $\int$) in the 1670s.
Set notation ($\in$, $\subset$, $\cup$, $\cap$) was introduced by Peano
in 1889. The point is that notation is invented, revised, and settled
through use — it is not handed down from above. When notation feels
arbitrary, remembering this helps.

---

## What You Need To Know First

This lesson assumes all of Lessons 0.1 through 0.10. Its purpose is to
consolidate, not introduce. Every symbol below was taught in a specific
earlier lesson — the source is indicated in the reference table.

---

## The Lesson

### Part 1 — The Complete Stage 0 Reference

```scene
NotationScene
```


```quiz
{"q": "\u2200x \u2208 S, P(x) means:", "options": ["There exists an x in S such that P(x)", "For all x in S, P(x) is true", "P(x) is defined for x in S", "x is the only element with property P"], "correct": 1, "explanation": "\u2200 is the universal quantifier: 'for all'. \u2200x \u2208 S, P(x) means P(x) holds for every element x in S."}
```


Every symbol introduced in Stage 0, in one place.

---

#### Sets and Set Operations (Lessons 0.1–0.2)

| Symbol | Read as | Meaning |
|--------|---------|---------|
| $x \in A$ | "$x$ is in $A$" | $x$ is an element of the set $A$ |
| $x \notin A$ | "$x$ is not in $A$" | $x$ is not an element of $A$ |
| $A \subseteq B$ | "$A$ is a subset of $B$" | every element of $A$ is in $B$ |
| $A \subsetneq B$ | "$A$ is a proper subset of $B$" | $A \subseteq B$ and $A \neq B$ |
| $\|A\|$ | "the cardinality of $A$" | the number of elements in $A$ |
| $\emptyset$ | "the empty set" | the set with no elements |
| $\{x : P(x)\}$ | "the set of $x$ such that $P(x)$" | set-builder notation |
| $A \cup B$ | "$A$ union $B$" | elements in $A$ or $B$ or both |
| $A \cap B$ | "$A$ intersect $B$" | elements in both $A$ and $B$ |
| $A \setminus B$ | "$A$ minus $B$" | elements in $A$ but not in $B$ |
| $A^c$ | "$A$ complement" | elements of $U$ not in $A$ |
| $A \times B$ | "$A$ cross $B$" | all ordered pairs $(a, b)$, $a \in A$, $b \in B$ |
| $A \triangle B$ | "$A$ symmetric difference $B$" | elements in exactly one of $A$, $B$ |

---

#### Standard Number Sets (Lesson 0.1)

| Symbol | Name | Contains |
|--------|------|---------|
| $\mathbb{N}$ | Natural numbers | $\{1, 2, 3, \ldots\}$ |
| $\mathbb{Z}$ | Integers | $\{\ldots, -2, -1, 0, 1, 2, \ldots\}$ |
| $\mathbb{Q}$ | Rational numbers | Fractions $p/q$, $p,q \in \mathbb{Z}$, $q \neq 0$ |
| $\mathbb{R}$ | Real numbers | All points on the number line |
| $\mathbb{C}$ | Complex numbers | Numbers $a + bi$, $a,b \in \mathbb{R}$ |

The chain: $\mathbb{N} \subsetneq \mathbb{Z} \subsetneq \mathbb{Q} \subsetneq \mathbb{R} \subsetneq \mathbb{C}$.

---

#### Logic (Lesson 0.3)

| Symbol | Read as | Meaning |
|--------|---------|---------|
| $\lnot P$ | "not $P$" | true when $P$ is false |
| $P \land Q$ | "$P$ and $Q$" | true when both $P$ and $Q$ are true |
| $P \lor Q$ | "$P$ or $Q$" | true when at least one of $P$, $Q$ is true |
| $P \Rightarrow Q$ | "$P$ implies $Q$" | false only when $P$ is true and $Q$ is false |
| $P \Leftrightarrow Q$ | "$P$ if and only if $Q$" | true when $P$ and $Q$ have the same truth value |
| $P \equiv Q$ | "$P$ is logically equivalent to $Q$" | same truth value for every input |

---

#### Quantifiers (Lessons 0.3, 0.5, 0.7)

| Symbol | Read as | Meaning |
|--------|---------|---------|
| $\forall x \in A,\ P(x)$ | "for all $x$ in $A$, $P(x)$" | $P(x)$ holds for every element of $A$ |
| $\exists x \in A,\ P(x)$ | "there exists $x$ in $A$ such that $P(x)$" | $P(x)$ holds for at least one element of $A$ |
| $\exists! x \in A,\ P(x)$ | "there exists a unique $x$ in $A$ such that $P(x)$" | exactly one element satisfies $P$ |

**Quantifier order matters.** $\forall x\ \exists y\ (y > x)$ and $\exists y\ \forall x\ (y > x)$
are different statements. The first says: "for every $x$, you can find a $y$ bigger than it"
(true for $\mathbb{R}$ — just take $y = x+1$). The second says: "there is a single $y$
bigger than every $x$" (false — no real number is bigger than all reals).

---

#### Functions (Lessons 0.6–0.8)

| Symbol | Read as | Meaning |
|--------|---------|---------|
| $f : A \to B$ | "$f$ from $A$ to $B$" | function with domain $A$, codomain $B$ |
| $f(a)$ | "$f$ of $a$" | the unique output for input $a$ |
| $\text{image}(f)$ | "the image of $f$" | $\{f(a) : a \in A\} \subseteq B$ |
| $f \circ g$ | "$f$ composed with $g$" | $(f \circ g)(x) = f(g(x))$ |
| $f^{-1}$ | "$f$ inverse" | the inverse function (only if $f$ is bijective) |
| $\text{id}_A$ | "the identity on $A$" | $\text{id}_A(x) = x$ |
| $f\|_S$ | "$f$ restricted to $S$" | $f$ with domain restricted to $S \subseteq A$ |

---

#### Relations (Lesson 0.5)

| Symbol | Read as | Meaning |
|--------|---------|---------|
| $a \mathrel{R} b$ | "$a$ is related to $b$" | $(a,b) \in R$ |
| $a \sim b$ | "$a$ is equivalent to $b$" | $R$ is an equivalence relation |
| $[a]$ | "the equivalence class of $a$" | $\{x : x \sim a\}$ |
| $a \equiv b \pmod{n}$ | "$a$ congruent to $b$ mod $n$" | $n \mid (a-b)$ |
| $A/{\sim}$ | "$A$ mod ${\sim}$" | the set of equivalence classes |

---

#### Summation and Product Notation (Lesson 0.10)

$$\sum_{k=1}^{n} f(k) = f(1) + f(2) + \cdots + f(n)$$

$$\prod_{k=1}^{n} f(k) = f(1) \cdot f(2) \cdots f(n)$$

The variable $k$ is a **dummy variable** — it does not appear outside
the sum. $\displaystyle\sum_{k=1}^{n} k^2$ and $\displaystyle\sum_{j=1}^{n} j^2$
are the same expression.

---

#### Proof Notation (Lessons 0.9–0.10)

| Symbol | Meaning |
|--------|---------|
| $\blacksquare$ or $\square$ | End of proof ("QED" — *quod erat demonstrandum*, "what was to be demonstrated") |
| $\therefore$ | Therefore |
| $\because$ | Because |
| $\implies$ | Implies (same as $\Rightarrow$, used in proof steps) |
| $\iff$ | If and only if (same as $\Leftrightarrow$) |
| $\checkmark$ | This step is verified |

---

### Part 2 — Writing Mathematics Clearly

```scene
WritingMathScene
```

```quiz
{"q": "\u2203x \u2208 S : P(x) means:", "options": ["For all x in S, P(x)", "There exists at least one x in S such that P(x)", "P(x) is true only for x in S", "x \u2208 S \u2229 P"], "correct": 1, "explanation": "\u2203 is the existential quantifier: 'there exists'. Asserts at least one x in S satisfies P."}
```


Knowing the symbols is not enough. How you arrange them — what you say
in words, when you use symbols, how you structure an argument — determines
whether a reader can follow your proof or gets lost.

#### Rule 1: Introduce Before You Use

Every variable must be introduced before it appears. Do not write
a symbol and expect the reader to guess what it represents.

**Bad:** "$p^2 = 2q^2$, so $p$ is even."

**Good:** "Let $p, q \in \mathbb{Z}$ with $\gcd(p,q) = 1$.
Squaring $\sqrt{2} = p/q$ gives $p^2 = 2q^2$, so $p$ is even."

**In code:** this is exactly the same rule as declaring a variable
before using it. Writing $p^2 = 2q^2$ without introducing $p$ and $q$
is like writing `x = x + 1` without ever declaring `x`.

---

#### Rule 2: Specify the Set

Every variable should have its set stated — either explicitly or from
clear context.

**Bad:** "Let $x$ be a number."

**Good:** "Let $x \in \mathbb{R}$."

**Why:** "a number" could mean integer, rational, real, or complex.
$x \in \mathbb{R}$ is unambiguous. This matters: "$x^2 \geq 0$" is true
for $x \in \mathbb{R}$ but false for $x \in \mathbb{C}$
(e.g., $i^2 = -1$).

---

#### Rule 3: Use Words to Connect Symbols

A proof is not a sequence of equations — it is an argument written in
sentences that happen to contain equations.

**Bad:**
$$n^2 = 2q^2 \quad p = 2k \quad 4k^2 = 2q^2 \quad q^2 = 2k^2$$

**Good:**
"Since $p^2 = 2q^2$, we know $p^2$ is even. By the Lemma, $p$ is even,
so $p = 2k$ for some $k \in \mathbb{Z}$. Substituting: $4k^2 = 2q^2$,
which simplifies to $q^2 = 2k^2$."

The equations are the same in both versions. The second is readable;
the first is a list of facts with no explanation of how they connect.

---

#### Rule 4: "Let", "Suppose", "Assume", "Define" — Use the Right Word

These words have specific meanings in mathematics:

| Word | When to use it |
|------|---------------|
| **Let** $x = \ldots$ | Introducing a specific object or definition |
| **Suppose** / **Assume** | Introducing a hypothesis — may or may not be true |
| **Suppose for contradiction** | The specific assumption in a proof by contradiction |
| **Define** $f(x) = \ldots$ | Giving a rule or formula |
| **Let** $\varepsilon > 0$ **be arbitrary** | Introducing a universally quantified variable |

Mixing these up is a common source of confusion. "Let $\sqrt{2}$ be rational"
sounds like you are defining it to be rational — use "Suppose, for
contradiction, that $\sqrt{2}$ is rational."

---

#### Rule 5: State What You Are About to Prove

Before writing the proof, state the claim precisely.

**Bad:** (launches straight into algebra without saying what is being proved)

**Good:** "We claim that $\displaystyle\sum_{k=1}^{n} k = \dfrac{n(n+1)}{2}$
for all $n \geq 1$. We prove this by induction."

The reader should never wonder "what are we trying to show?" at any
point in a proof.

---

#### Rule 6: One Idea Per Sentence

Long sentences with many mathematical clauses become unreadable.
Break them.

**Bad:** "Since $p^2 = 2q^2$ and $p^2$ is even so $p$ is even by
the Lemma so $p = 2k$ and substituting gives $q^2 = 2k^2$ so $q$
is also even."

**Good:**
"Since $p^2 = 2q^2$, $p^2$ is even. By the Lemma, $p$ is even.
Write $p = 2k$ for some $k \in \mathbb{Z}$. Substituting into
$p^2 = 2q^2$ gives $4k^2 = 2q^2$, which simplifies to $q^2 = 2k^2$.
Therefore $q^2$ is even, and by the Lemma again, $q$ is even."

---

#### Rule 7: "Since", "Therefore", "Hence" — Signal Your Logic

Signal when you are drawing a conclusion.

| Word | Meaning |
|------|---------|
| **Since** / **Because** | What follows is a reason for something |
| **Therefore** / **Hence** / **So** | What follows is a conclusion drawn from what came before |
| **Thus** | Same as therefore (slightly more formal) |
| **Note that** | Drawing attention to a non-obvious fact |
| **Observe that** | Same as "note that" |
| **It follows that** | The next statement is a logical consequence |
| **We have** | About to state a derived equation or fact |

---

### Part 3 — Common Notation Mistakes

```scene
NotationMistakesScene
```

```quiz
{"q": "The notation f: A \u2192 B means:", "options": ["f = A \u00f7 B", "f is a function with domain A and codomain B", "f maps B into A", "A and B are subsets"], "correct": 1, "explanation": "f: A \u2192 B declares f as a function whose inputs come from A and outputs land in B."}
```


These are the mistakes that appear most often in early mathematical writing.

**Mistake 1: Using $=$ for "implies."**

Bad: "$n$ is even $= n = 2k$."
Good: "$n$ is even $\Rightarrow n = 2k$ for some $k \in \mathbb{Z}$."
Or: "If $n$ is even, then $n = 2k$ for some $k \in \mathbb{Z}$."

The equals sign connects two equal expressions. It does not mean
"therefore" or "implies."

---

**Mistake 2: Losing track of what you are proving.**

In a proof by induction of "$\sum_{k=1}^n k = \frac{n(n+1)}{2}$," the
inductive step must start from the **left side** of the equation for $n+1$
and arrive at the **right side** — not the reverse, and not starting from
the equation you want to prove. Starting from the thing you want to
prove and deriving something true is circular reasoning.

**Circular:**
"$\sum_{k=1}^{n+1} k = \frac{(n+1)(n+2)}{2}$, so expanding: ... ✓"
(You assumed what you were trying to prove.)

**Correct:**
"$\sum_{k=1}^{n+1} k = \sum_{k=1}^{n} k + (n+1) = \frac{n(n+1)}{2} + (n+1) = \cdots = \frac{(n+1)(n+2)}{2}$."
(Started from known facts, arrived at the goal.)

---

**Mistake 3: "Clearly" and "Obviously"**

The words "clearly," "obviously," and "it is easy to see" are red flags.
They either mean:
(a) the step genuinely is simple — in which case, just write the step, and
(b) the writer is not sure the step is valid and hopes the reader will not notice.

Replace "clearly $X$" with either the actual reason $X$ is true, or
a one-line proof of $X$.

---

**Mistake 4: Confusing $\in$ and $\subseteq$.**

$3 \in \{1, 2, 3\}$ — the number 3 is an element.
$\{3\} \subseteq \{1, 2, 3\}$ — the set $\{3\}$ is a subset.
$\{3\} \in \{1, 2, 3\}$ — **wrong** — $\{3\}$ is a set, not an element of $\{1,2,3\}$.

---

**Mistake 5: Existential vs universal quantifiers.**

"There exists an $x$ such that $x^2 > 0$" is true ($x = 1$ works).
"For all $x$, $x^2 > 0$" is false ($x = 0$ is a counterexample).

These are completely different claims. When writing "let $x$..." check
whether you mean a specific $x$ (existential) or any $x$ (universal).

---

### Part 4 — Reading a Proof You Did Not Write

```scene
ReadingProofScene
```

```quiz
{"q": "\u03a3(i=1 to n) i means:", "options": ["The product 1\u00d72\u00d7...\u00d7n", "The maximum of {1,...,n}", "The sum 1 + 2 + ... + n", "The set {1,...,n}"], "correct": 2, "explanation": "Sigma notation \u03a3 represents a sum. The analogous product notation is \u03a0 (capital Pi)."}
```


A skill just as important as writing proofs is reading them. Use this checklist whenever you encounter a proof in a textbook or paper:

1. **What is being proved?** Find the exact claim before reading the argument.
2. **What technique is used?** Direct, contradiction, contrapositive, induction?
3. **What are the hypotheses?** What has been assumed?
4. **What is the first step?** Does it follow from the hypotheses and definitions?
5. **Can you identify the key move?** Usually one step in the proof carries most of the weight.
6. **Does the conclusion follow?** Does the last step actually prove the original claim?

```python
# This code block is a notation lookup tool --
# type any symbol abbreviation and get its meaning.

# A dictionary mapping abbreviations to (symbol, meaning) pairs.
# dict() syntax: {key: value, key: value, ...}
# Introduced in Lesson 0.5's code blocks; used freely here.
notation_reference = {
    'in':        ('∈',  'element of'),
    'notin':     ('∉',  'not element of'),
    'sub':       ('⊆',  'subset'),
    'psub':      ('⊊',  'proper subset'),
    'card':      ('|A|','cardinality'),
    'empty':     ('∅',  'empty set'),
    'union':     ('∪',  'union'),
    'inter':     ('∩',  'intersection'),
    'diff':      ('\\', 'set difference'),
    'comp':      ('ᶜ',  'complement'),
    'cross':     ('×',  'Cartesian product'),
    'symdiff':   ('△',  'symmetric difference'),
    'not':       ('¬',  'logical NOT'),
    'and':       ('∧',  'logical AND'),
    'or':        ('∨',  'logical OR'),
    'implies':   ('⇒',  'implies'),
    'iff':       ('⟺', 'if and only if'),
    'equiv':     ('≡',  'logically equivalent'),
    'forall':    ('∀',  'for all'),
    'exists':    ('∃',  'there exists'),
    'unique':    ('∃!', 'there exists unique'),
    'N':         ('ℕ',  'natural numbers {1,2,3,...}'),
    'Z':         ('ℤ',  'integers {...,-1,0,1,...}'),
    'Q':         ('ℚ',  'rational numbers'),
    'R':         ('ℝ',  'real numbers'),
    'C':         ('ℂ',  'complex numbers'),
    'to':        ('→',  'function arrow (f: A → B)'),
    'compose':   ('∘',  'function composition'),
    'inv':       ('⁻¹', 'inverse function'),
    'id':        ('id', 'identity function'),
    'congruent': ('≡ (mod n)', 'congruent modulo n'),
    'class':     ('[a]', 'equivalence class of a'),
    'sum':       ('Σ',  'summation'),
    'prod':      ('Π',  'product'),
    'qed':       ('□',  'end of proof'),
    'therefore': ('∴',  'therefore'),
    'because':   ('∵',  'because'),
}

def look_up(abbreviation):
    """
    Look up a notation abbreviation and print its symbol and meaning.
    Returns None if not found, with a helpful message.
    """
    key = abbreviation.lower().strip()
    if key in notation_reference:
        symbol, meaning = notation_reference[key]
        print(f"  {abbreviation!r:12s}  →  {symbol}   ({meaning})")
    else:
        print(f"  '{abbreviation}' not found. Available: {sorted(notation_reference.keys())}")

# Demo lookups
print("Notation lookup tool:\n")
for query in ['forall', 'implies', 'iff', 'sub', 'compose', 'congruent', 'qed']:
    look_up(query)

print()
# Show the full reference sorted alphabetically
print("Full reference (sorted):\n")
print(f"{'Abbreviation':15s}  {'Symbol':8s}  {'Meaning'}")
print("-" * 50)
for key in sorted(notation_reference.keys()):
    symbol, meaning = notation_reference[key]
    print(f"{key:15s}  {symbol:8s}  {meaning}")
```

**Walkthrough:** `notation_reference` is a Python **dictionary** —
a data structure that maps keys (abbreviation strings) to values
(tuples of symbol and meaning). `key: value` syntax inside `{...}`
builds the dictionary; `notation_reference[key]` retrieves the value
for a given key. `abbreviation.lower().strip()` converts the input to
lowercase (`.lower()`) and removes leading/trailing spaces (`.strip()`),
making the lookup case-insensitive and whitespace-tolerant.
`{key!r:12s}` in the f-string: `!r` formats the value with `repr()`
(adds quotes around strings), and `:12s` pads to 12 characters wide.

```python
import matplotlib.pyplot as plt

# Build a visual notation reference card using unicode symbols
# (matplotlib's LaTeX renderer has limited symbol support in Agg backend,
# so we use unicode characters directly for display here)

fig, ax = plt.subplots(figsize=(13, 8))
ax.axis('off')

rows = [
    ['Symbol', 'Meaning', '', 'Symbol', 'Meaning'],
    ['x ∈ A',   'x is in A',              '', '¬P',     'NOT P'],
    ['x ∉ A',   'x is not in A',          '', 'P ∧ Q',  'P AND Q'],
    ['A ⊆ B',   'A is a subset of B',     '', 'P ∨ Q',  'P OR Q'],
    ['A ⊊ B',   'A is a proper subset',   '', 'P ⇒ Q',  'P implies Q'],
    ['|A|',     'cardinality of A',        '', 'P ⟺ Q', 'P if and only if Q'],
    ['∅',       'empty set',               '', '∀x',     'for all x'],
    ['{x:P}',   'set-builder notation',   '', '∃x',     'there exists x'],
    ['A ∪ B',   'union',                   '', '∃!x',    'unique x exists'],
    ['A ∩ B',   'intersection',            '', 'f: A→B', 'function f from A to B'],
    ['A \\ B',  'set difference',          '', 'f∘g',    'f composed with g'],
    ['Aᶜ',      'complement (in U)',       '', 'f⁻¹',    'inverse of f'],
    ['A×B',     'Cartesian product',       '', 'Σ / Π',  'sum / product notation'],
    ['[a]',     'equivalence class of a', '', '□',       'end of proof (QED)'],
    ['ℕ ⊊ ℤ ⊊ ℚ ⊊ ℝ ⊊ ℂ', 'the standard number sets in order', '', '∴ / ∵', 'therefore / because'],
]

table = ax.table(
    cellText=rows[1:],
    colLabels=rows[0],
    loc='center',
    cellLoc='left'
)
table.auto_set_font_size(False)
table.set_fontsize(10.5)
table.scale(1, 1.65)  # scale(x_stretch, y_stretch): make rows taller

# Header row styling
for j in range(5):
    table[0, j].set_facecolor('#2980b9')     # blue background
    table[0, j].set_text_props(color='white', fontweight='bold')

# Blank divider column styling
for i in range(1, len(rows)):
    table[i, 2].set_facecolor('#f5f5f5')    # light grey for the gap column

# Alternate row shading for readability
for i in range(1, len(rows)):
    if i % 2 == 0:
        for j in [0, 1, 3, 4]:
            table[i, j].set_facecolor('#f9f9f9')

ax.set_title('Stage 0 — Complete Notation Reference',
             fontsize=14, fontweight='bold', pad=20, color='#2c3e50')
plt.savefig('notation_reference.png', dpi=100, bbox_inches='tight')
plt.show()
```

**Walkthrough:** `table.scale(1, 1.65)` stretches each table row to
1.65× its default height — the first argument scales column width,
the second scales row height. `table[i, j].set_facecolor(colour)`
sets the background colour of cell $(i, j)$; row 0 is the header row
(column labels), rows 1 onward are data rows. The alternating grey
shading (`i % 2 == 0`) improves readability by making it easier to
track which row you are reading across the wide table.

---

## Connect the Pieces

**What this lesson built on:** Every lesson in Stage 0. This lesson has
no new content — its job is to make what you have learned accessible
as a reference and to give you the writing skills to use it.

**What this lesson makes possible:** Stage 1 begins immediately. Every
concept in Stage 1 — polynomials, exponentials, logarithms, complex
numbers — will be stated using the notation consolidated here. You
will see $\forall x \in \mathbb{R}$, $\exists k \in \mathbb{Z}$,
$f : \mathbb{R} \to \mathbb{R}$, and $P \Rightarrow Q$ constantly.
If any symbol in this reference still feels unfamiliar, this is the
moment to resolve it.

**In computer science:** mathematical notation is the specification
language for algorithms, data structures, and type systems. When a
paper writes $\forall x \in S,\ f(x) \leq g(x)$, it is making a claim
about every element of a set — exactly what a `for` loop with an
assertion would check. When a type system paper writes $f : A \to B$,
it is specifying a function type. Reading research papers in CS
requires exactly the fluency this lesson consolidates.

---

## Summary

**Quantifier order matters:** $\forall x\ \exists y$ and $\exists y\ \forall x$
make completely different claims.

**$=$ means equals, not implies.** Use $\Rightarrow$ for logical steps.

**Every variable needs a home set.** "$x$" is ambiguous; "$x \in \mathbb{R}$"
is precise.

**A proof is an argument in sentences,** not a sequence of equations.

**Avoid "clearly" and "obviously."** Write the reason instead.

**Circular reasoning is not proof.** In an inductive step, derive the
conclusion — do not assume it and work backward.

**The notation reference above is permanent.** These symbols appear
in every subsequent stage of this curriculum.

---

## Problems

### Math

**1.** Rewrite each of the following in correct mathematical notation.
Then decide whether the statement is true or false.

(a) "Every real number has a square root."

(b) "There is a real number whose square is negative."

(c) "For any two real numbers, one is larger than the other."

(d) "Every function has an inverse."

<details>
<summary>Answers</summary>

(a) $\forall x \in \mathbb{R},\ \exists y \in \mathbb{R}$ such that $y^2 = x$.
**False** — $x = -1$ has no real square root.
True if restated for $x \geq 0$, or for $\mathbb{C}$.

(b) $\exists x \in \mathbb{R}$ such that $x^2 < 0$.
**False** — $x^2 \geq 0$ for all $x \in \mathbb{R}$.
True in $\mathbb{C}$: $i^2 = -1$.

(c) $\forall x, y \in \mathbb{R}$, $x < y$ or $x > y$ or $x = y$.
**True** — the real numbers are **totally ordered**: any two are comparable.

(d) $\forall f: A \to B$, $\exists f^{-1}: B \to A$ such that $f^{-1} \circ f = \text{id}_A$.
**False** — only bijective functions have inverses (Lesson 0.7).

</details>

---

**2.** The following "proof" contains several errors. Identify every error
and write a corrected version.

> **Claim:** For all integers $n$, if $n^2$ is odd then $n$ is odd.
>
> *Proof.* Let $n$ be an integer. Clearly $n^2 = n \times n$.
> Since $n^2$ is odd $= 2k+1$ for some $k$. So $n \times n = 2k+1$
> therefore $n$ is odd. $\square$

<details>
<summary>Errors identified</summary>

**Error 1:** "Clearly $n^2 = n \times n$" — "clearly" for something that is literally the definition and needs no justification is harmless but sloppy. More importantly, it doesn't advance the proof.

**Error 2:** "$n^2$ is odd $= 2k+1$" — using $=$ to mean "which equals" or "implies." Should be: "Since $n^2$ is odd, $n^2 = 2k+1$ for some $k \in \mathbb{Z}$."

**Error 3:** "$k$" is introduced without stating its set. Should be $k \in \mathbb{Z}$.

**Error 4:** The key logical step — going from $n \times n = 2k+1$ to "$n$ is odd" — is completely missing. This is the hard part of the proof and it is hand-waved away. (The actual argument uses the contrapositive: $n$ even $\Rightarrow$ $n^2$ even, which was proved in Lesson 0.9.)

**Corrected proof:**

*Proof.* We use the contrapositive: we prove that if $n$ is even then $n^2$ is even. Suppose $n$ is even. Then $n = 2m$ for some $m \in \mathbb{Z}$. Therefore $n^2 = (2m)^2 = 4m^2 = 2(2m^2)$. Since $2m^2 \in \mathbb{Z}$, $n^2$ is even. By the contrapositive, if $n^2$ is odd then $n$ is odd. $\blacksquare$

</details>

---

**3.** Write out the following in plain English, then determine whether each statement is true or false for $f : \mathbb{R} \to \mathbb{R}$, $f(x) = x^2$.

(a) $\forall y \in \mathbb{R},\ \exists x \in \mathbb{R}$ such that $f(x) = y$

(b) $\exists y \in \mathbb{R}$ such that $\forall x \in \mathbb{R},\ f(x) = y$

(c) $\forall x_1, x_2 \in \mathbb{R},\ f(x_1) = f(x_2) \Rightarrow x_1 = x_2$

<details>
<summary>Answers</summary>

(a) "For every real $y$, there exists a real $x$ with $f(x) = y$" — this asks whether $f$ is surjective onto $\mathbb{R}$. **False**: $y = -1$ has no solution since $x^2 \geq 0$.

(b) "There exists a real $y$ such that $f(x) = y$ for every $x$" — this asks whether $f$ is a constant function. **False**: $f(1) = 1 \neq 4 = f(2)$.

(c) "If $f(x_1) = f(x_2)$ then $x_1 = x_2$" — this asks whether $f$ is injective. **False**: $f(2) = f(-2) = 4$ but $2 \neq -2$.

</details>

---

### Code Challenges

**Challenge 1 — Notation parser**

Extend the `look_up` function from the lesson so that it also accepts
the actual symbol (e.g., `'∈'`) and returns what it means — not just
the abbreviation.

```python
notation_reference = {
    'in':      ('∈',  'element of'),
    'notin':   ('∉',  'not element of'),
    'sub':     ('⊆',  'subset'),
    'union':   ('∪',  'union'),
    'inter':   ('∩',  'intersection'),
    'forall':  ('∀',  'for all'),
    'exists':  ('∃',  'there exists'),
    'implies': ('⇒',  'implies'),
    'iff':     ('⟺', 'if and only if'),
    'compose': ('∘',  'function composition'),
    'inv':     ('⁻¹', 'inverse function'),
    'qed':     ('□',  'end of proof'),
    'sum':     ('Σ',  'summation'),
    'N':       ('ℕ',  'natural numbers'),
    'Z':       ('ℤ',  'integers'),
    'R':       ('ℝ',  'real numbers'),
}

def look_up(query):
    """
    Look up by abbreviation OR by symbol.
    Returns (symbol, meaning) tuple if found, None if not found.
    Prints the result either way.
    """
    pass  # your code here


# --- tests: do not modify ---
result = look_up('in')
assert result == ('∈', 'element of'), "abbreviation lookup failed"

result = look_up('∈')
assert result == ('∈', 'element of'), "symbol lookup failed"

result = look_up('iff')
assert result[0] == '⟺', "iff symbol wrong"

result = look_up('xyz')
assert result is None, "unknown query should return None"

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Build a second dictionary that maps symbols back to their meanings —
you can construct it from `notation_reference` by reversing the
key/value relationship. Check the query against both dictionaries.

</details>

---

**Challenge 2 — Proof checker scaffold**

A proof by induction has two components: a base case verification and
an inductive step. Implement `check_induction` that takes a formula,
verifies the base case, then checks that the formula holds for every $n$
up to some limit (as a proxy for the inductive step).

```python
def check_induction(formula, direct, base_n, check_up_to):
    """
    Verify an inductive formula:
    1. Check formula(base_n) == direct(base_n)  [base case]
    2. Check formula(n) == direct(n) for all n from base_n to check_up_to  [step proxy]
    
    formula:      closed-form function n → value
    direct:       direct computation  n → value
    base_n:       the starting value of n (usually 0 or 1)
    check_up_to:  check all n from base_n to this value inclusive
    
    Prints what was checked and returns True if all pass, False otherwise.
    """
    pass  # your code here


# --- tests: do not modify ---
# Gauss sum
gauss = lambda n: n*(n+1)//2
gauss_direct = lambda n: sum(range(1, n+1))
assert check_induction(gauss, gauss_direct, base_n=1, check_up_to=100) == True

# Broken formula
broken = lambda n: n*(n+1)//2 + 1
assert check_induction(broken, gauss_direct, base_n=1, check_up_to=5) == False

# Powers of 2
pow2 = lambda n: 2**(n+1) - 1
pow2_direct = lambda n: sum(2**k for k in range(n+1))
assert check_induction(pow2, pow2_direct, base_n=0, check_up_to=30) == True

print("✓ Challenge 2 passed!")
```

---

### Extension

**4. ★** Write a complete, correctly formatted proof of the following
claim, applying every rule from Part 2 of this lesson.

**Claim:** For all $n \geq 1$, $n^3 + 2n$ is divisible by 3.

Your proof must:
- State the claim precisely at the start
- Name the proof technique
- Have a clearly labelled base case
- Have a clearly labelled inductive step that names the inductive hypothesis
- Use words to connect each step
- Conclude with $\blacksquare$
- Contain no uses of "clearly" or "obviously"

<details>
<summary>Model answer</summary>

**Claim:** For all $n \geq 1$, $3 \mid n^3 + 2n$.

*Proof.* By induction on $n$.

**Base case** $(n = 1)$: $1^3 + 2(1) = 3$. Since $3 = 3 \times 1$, we have $3 \mid 3$. ✓

**Inductive step:** Let $k \geq 1$ and suppose $3 \mid k^3 + 2k$
(inductive hypothesis). We must show $3 \mid (k+1)^3 + 2(k+1)$.

Expanding:
$$(k+1)^3 + 2(k+1) = k^3 + 3k^2 + 3k + 1 + 2k + 2$$
$$= (k^3 + 2k) + 3k^2 + 3k + 3$$
$$= (k^3 + 2k) + 3(k^2 + k + 1)$$

By the inductive hypothesis, $3 \mid (k^3 + 2k)$. Since $3 \mid 3(k^2+k+1)$,
and the sum of two multiples of 3 is a multiple of 3, we conclude
$3 \mid (k+1)^3 + 2(k+1)$.

By the principle of induction, $3 \mid n^3 + 2n$ for all $n \geq 1$. $\blacksquare$

</details>

**5. ★** The statement "$f$ is continuous" in calculus is written precisely as:

$$\forall \varepsilon > 0,\ \forall x_0 \in \mathbb{R},\ \exists \delta > 0 \text{ such that } \forall x \in \mathbb{R},\ |x - x_0| < \delta \Rightarrow |f(x) - f(x_0)| < \varepsilon$$

(a) Translate this into plain English, one quantifier at a time.

(b) The negation of "f is continuous" — "f is not continuous at $x_0$" —
can be obtained by negating the quantifiers. Using De Morgan's Laws
for quantifiers ($\lnot \forall x P(x) \equiv \exists x \lnot P(x)$
and $\lnot \exists x P(x) \equiv \forall x \lnot P(x)$), write the
precise definition of "$f$ is discontinuous at $x_0$."

<details>
<summary>Answer</summary>

(a) "For every positive tolerance $\varepsilon$, and for every point $x_0$,
there exists a positive distance $\delta$ such that: whenever $x$ is within
distance $\delta$ of $x_0$, the output $f(x)$ is within distance $\varepsilon$
of $f(x_0)$." In one sentence: "You can keep the output as close to
$f(x_0)$ as you like by keeping the input close enough to $x_0$."

(b) Negate the statement (flip every quantifier, negate the conclusion):

$$\exists \varepsilon > 0 \text{ such that } \exists \delta > 0,\ \forall x \in \mathbb{R},\ |x - x_0| < \delta \text{ but } |f(x) - f(x_0)| \geq \varepsilon$$

Wait — negating more carefully:

$$\exists \varepsilon > 0 \text{ such that } \forall \delta > 0,\ \exists x \in \mathbb{R} \text{ with } |x - x_0| < \delta \text{ and } |f(x) - f(x_0)| \geq \varepsilon$$

"There is some tolerance $\varepsilon > 0$ such that no matter how
small $\delta$ is, you can always find an $x$ near $x_0$ where the
output is not within $\varepsilon$ of $f(x_0)$." This is the precise
definition of a discontinuity — you will encounter it again in Stage 5.

</details>
