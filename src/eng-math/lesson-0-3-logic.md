# Stage 0, Lesson 0.3 — Logic: AND, OR, NOT, and Implication
**Threads:** Math · CS  
**Estimated time:** 55–70 minutes

---

## What This Lesson Is About

Mathematics runs on arguments — chains of reasoning that start from what
is known and arrive at what must be true. But before you can reason
correctly, you need a precise language for the statements you reason about
and the connectives that link them. This lesson builds that language:
**propositional logic**, the study of how statements combine through AND,
OR, NOT, and IF-THEN. You will learn to construct truth tables that
exhaustively verify whether a logical claim holds, to recognise when two
different-looking statements are logically equivalent, and to understand
the implication connective — one of the most commonly misunderstood ideas
in mathematics. By the end of this lesson you will have the tools to read
and write mathematical proofs, and you will recognise these same connectives
in every programming language you ever use.

---

## Historical Context

Aristotle formalised logical reasoning around 350 BCE in his *Organon* —
a collection of works on logic that dominated Western thought for nearly
two thousand years. His syllogisms ("All men are mortal; Socrates is a man;
therefore Socrates is mortal") were the standard form of rigorous argument.
In 1854, George Boole published *An Investigation of the Laws of Thought*,
translating Aristotle's logic into algebra: AND became multiplication,
OR became addition, NOT became subtraction from 1. This "Boolean algebra"
turned out to be the mathematics of switches — every digital circuit ever
built implements Boole's algebra in transistors.

---

## What You Need To Know First

- **Sets and membership** — from Lesson 0.1.
  The connection between sets and logic runs deep: this lesson ends by
  showing that AND/OR/NOT for statements correspond exactly to ∩/∪/complement
  for sets. The two systems are the same algebra in different clothing.
- **Set operations** — from Lesson 0.2, specifically De Morgan's Laws.
  The logical version of De Morgan's Laws is stated and proved here —
  it is the same content, in a different notation.

---

## The Lesson

### Propositions: Statements That Are True or False

```scene
TruthTableScene
```


Logic begins with a basic object: the **proposition**.

**Definition:** A **proposition** is a declarative statement that is
either true or false, but not both. The truth value of a proposition
is either **T** (true) or **F** (false).

**Examples of propositions:**
- "5 is a prime number." (T)
- "The integer 6 is odd." (F)
- "Every continuous function on $[0,1]$ attains its maximum." (T)
- "Paris is the capital of Germany." (F)

**Not propositions:**
- "What time is it?" — a question, not a statement
- "Close the door." — a command
- "This statement is false." — neither true nor false (the liar paradox)
- "$x > 3$" — no truth value until $x$ is specified

We use letters — typically $P$, $Q$, $R$ — to stand for propositions,
exactly as algebra uses letters to stand for numbers.

**Computational connection:** In every programming language, the boolean
type (`bool` in Python, `boolean` in Java, `bool` in C) directly
implements the proposition: a variable that holds either `True` or `False`.
The connectives AND, OR, NOT are built into every language as `and`, `or`,
`not` (Python) or `&&`, `||`, `!` (C, Java, JavaScript).

---

### NOT: Negation

```scene
NegationScene
```

```quiz
{"q": "When is \u00acP (NOT P) true?", "options": ["Always", "When P is true", "When P is false", "Never"], "correct": 2, "explanation": "Negation flips the truth value. \u00acP is true exactly when P is false."}
```


The simplest operation on a proposition is to flip its truth value.

**Definition:** The **negation** of a proposition $P$, written $\lnot P$
(read "not P"), is the proposition that is true when $P$ is false,
and false when $P$ is true.

**Truth table for $\lnot P$:**

| $P$ | $\lnot P$ |
|-----|-----------|
| T   | F         |
| F   | T         |

A **truth table** lists every possible combination of truth values for
the variables, and the resulting truth value of the expression. For one
variable $P$, there are $2^1 = 2$ rows. For two variables, $2^2 = 4$ rows.
For $n$ variables, $2^n$ rows.

**Examples:**
- $P$ = "6 is even." (T). Then $\lnot P$ = "6 is not even." (F).
- $P$ = "7 is divisible by 2." (F). Then $\lnot P$ = "7 is not divisible by 2." (T).

**Geometric picture:** Negation corresponds exactly to the complement
from Lesson 0.2. If $P$ is the set of situations where the statement
is true, then $\lnot P$ is the set of situations where it is false —
the complement. Same idea, different notation.

```python
# Truth table for NOT
print("P     | ¬P")
print("------+------")
for P in [True, False]:
    not_P = not P
    print(f"{'T' if P else 'F'}     | {'T' if not_P else 'F'}")
```

**Walkthrough:** `for P in [True, False]` iterates over both truth values.
`not P` applies Python's negation operator — the direct implementation
of logical $\lnot$. The f-string formats each boolean as `T` or `F`
for readability, using Python's conditional expression
`'T' if P else 'F'` — which returns `'T'` when `P` is `True` and
`'F'` when `P` is `False`.

---

### AND: Conjunction

```scene
ConjunctionScene
```

```quiz
{"q": "P \u2227 Q (P AND Q) is true when:", "options": ["P is true", "Q is true", "Both P and Q are true", "At least one is true"], "correct": 2, "explanation": "Conjunction requires both inputs to be true. Any false input makes P \u2227 Q false."}
```


We often need to assert that two things are simultaneously true.

**Definition:** The **conjunction** of propositions $P$ and $Q$,
written $P \land Q$ (read "P and Q"), is true if and only if both
$P$ and $Q$ are true.

**Truth table for $P \land Q$:**

| $P$ | $Q$ | $P \land Q$ |
|-----|-----|-------------|
| T   | T   | T           |
| T   | F   | F           |
| F   | T   | F           |
| F   | F   | F           |

$P \land Q$ is true in exactly one case: when both inputs are true.
Any false input makes the conjunction false.

**Example:** $P$ = "12 is divisible by 3" (T), $Q$ = "12 is divisible by 4" (T).
$P \land Q$ = "12 is divisible by both 3 and 4" (T).

**Connection to sets:** $P \land Q$ corresponds to intersection $A \cap B$.
An element is in the intersection if it is in $A$ **and** in $B$ — the same
condition. This is not an analogy; it is the same mathematical structure.

```python
# Truth table for AND
print("P     | Q     | P ∧ Q")
print("------+-------+------")
for P in [True, False]:
    for Q in [True, False]:
        conjunction = P and Q
        p_str = 'T' if P else 'F'
        q_str = 'T' if Q else 'F'
        c_str = 'T' if conjunction else 'F'
        print(f"{p_str}     | {q_str}     | {c_str}")
```

**Walkthrough:** The nested `for` loops generate all four combinations
of `(P, Q)`: `(True, True)`, `(True, False)`, `(False, True)`,
`(False, False)`. `P and Q` applies Python's logical AND. The four
rows of output match the truth table exactly, with `T` in the final
column only when both `P` and `Q` are `True`.

---

### OR: Disjunction

```scene
LogicConnectivesScene
```


```quiz
{"q": "P \u2228 Q (P OR Q) is false only when:", "options": ["P is false", "Q is false", "Both P and Q are false", "P and Q differ"], "correct": 2, "explanation": "Disjunction is true whenever at least one input is true. The only false case is when BOTH P and Q are false."}
```


**Definition:** The **disjunction** of propositions $P$ and $Q$,
written $P \lor Q$ (read "P or Q"), is true if at least one of $P$
or $Q$ is true.

**Truth table for $P \lor Q$:**

| $P$ | $Q$ | $P \lor Q$ |
|-----|-----|------------|
| T   | T   | T          |
| T   | F   | T          |
| F   | T   | T          |
| F   | F   | F          |

This is the **inclusive or** — true when one or both are true, false only
when both are false. This is the standard mathematical OR.

**Note on exclusive or:** Natural language "or" is sometimes exclusive
("soup or salad" means one, not both). Mathematical OR is always inclusive.
When exclusive or is meant in mathematics, it is stated explicitly or
written as XOR. Python's `^` operator on booleans computes exclusive or.

**Connection to sets:** $P \lor Q$ corresponds to union $A \cup B$.
An element is in the union if it is in $A$ **or** in $B$ — inclusive or.

```python
# Truth table for OR
print("P     | Q     | P ∨ Q")
print("------+-------+------")
for P in [True, False]:
    for Q in [True, False]:
        disjunction = P or Q
        p_str = 'T' if P else 'F'
        q_str = 'T' if Q else 'F'
        d_str = 'T' if disjunction else 'F'
        print(f"{p_str}     | {q_str}     | {d_str}")
```

---

### Implication: IF-THEN

```scene
ImplicationScene
```

```quiz
{"q": "P \u2192 Q is false only when:", "options": ["P is false and Q is true", "P is true and Q is false", "Both are false", "P equals Q"], "correct": 1, "explanation": "An implication is broken (false) only when the hypothesis P is true but the conclusion Q is false."}
```


The most important connective in mathematics — and the most commonly
misunderstood — is implication.

**Definition:** The **implication** (or conditional) $P \rightarrow Q$
(read "if P then Q," or "P implies Q") is the proposition that is false
only when $P$ is true and $Q$ is false. In all other cases it is true.

**Truth table for $P \rightarrow Q$:**

| $P$ | $Q$ | $P \rightarrow Q$ |
|-----|-----|-------------------|
| T   | T   | T                 |
| T   | F   | **F**             |
| F   | T   | T                 |
| F   | F   | T                 |

The only false case is row 2: $P$ is true but $Q$ is false. This is
the case where the implication is **violated** — the hypothesis holds
but the conclusion fails.

**Why are rows 3 and 4 true?** This is the part students find surprising.
If $P$ is false, the implication $P \rightarrow Q$ is true regardless of $Q$.
The reason: an implication is a **promise**. "If it is raining, I will
bring an umbrella." This promise is broken only if it is raining and I
do not bring an umbrella. If it is not raining, the promise is neither
kept nor broken — it is vacuously satisfied. A false hypothesis makes no
demand on the conclusion.

**Mathematical example:** "If $n$ is divisible by 4, then $n$ is divisible by 2."

- $n = 8$: divisible by 4 (T) and divisible by 2 (T). Implication: T ✓
- $n = 6$: not divisible by 4 (F), but divisible by 2 (T). Implication: T ✓
- $n = 3$: not divisible by 4 (F), not divisible by 2 (F). Implication: T ✓
- Can we find a counterexample? We would need $n$ divisible by 4 but not by 2.
  No such $n$ exists — the implication is always true.

**Terminology:** In $P \rightarrow Q$, $P$ is called the **hypothesis**
(or antecedent), and $Q$ is called the **conclusion** (or consequent).

**The contrapositive:** The implication $P \rightarrow Q$ is logically
equivalent to its **contrapositive** $\lnot Q \rightarrow \lnot P$.
This is one of the most useful facts in proof writing — sometimes proving
the contrapositive is much easier than proving the original statement
directly. We will verify this equivalence below.

```python
# Truth table for implication
print("P     | Q     | P → Q   | Equivalent: ¬Q → ¬P")
print("------+-------+---------+---------------------")
for P in [True, False]:
    for Q in [True, False]:
        # P → Q is False only when P is True and Q is False
        # Logically equivalent to: (not P) or Q
        implication    = (not P) or Q
        contrapositive = (not (not Q)) or (not P)   # ¬Q → ¬P = Q or ¬P
        contrapositive = Q or (not P)
        p_str = 'T' if P else 'F'
        q_str = 'T' if Q else 'F'
        i_str = 'T' if implication else 'F'
        c_str = 'T' if contrapositive else 'F'
        equiv = '✓' if implication == contrapositive else '✗'
        print(f"{p_str}     | {q_str}     | {i_str}       | {c_str}  {equiv}")
```

**Walkthrough:** The implication $P \rightarrow Q$ has no direct Python
operator, but it is equivalent to $(\lnot P) \lor Q$: if $P$ is false,
the whole thing is true regardless of $Q$ (since `(not P)` is True and
True OR anything is True); if $P$ is true, the truth value equals $Q$.
This equivalence is verified in the truth table above. The contrapositive
$\lnot Q \rightarrow \lnot P$ is computed as `Q or (not P)` — substituting
$\lnot Q$ and $\lnot P$ into the same formula. Every row shows `✓`,
confirming that $P \rightarrow Q$ and $\lnot Q \rightarrow \lnot P$
are always equal.

---

### The Biconditional: IF AND ONLY IF

```scene
BiconditionalScene
```

```quiz
{"q": "P \u2194 Q is true when:", "options": ["P is true", "Q is false", "P and Q have the same truth value", "P implies Q"], "correct": 2, "explanation": "The biconditional is true when both sides agree: T\u2194T = T and F\u2194F = T."}
```


**Definition:** The **biconditional** $P \leftrightarrow Q$ (read "P if
and only if Q," abbreviated "P iff Q") is true when $P$ and $Q$ have
the same truth value, and false when they differ.

$$P \leftrightarrow Q \quad \text{means} \quad (P \rightarrow Q) \land (Q \rightarrow P)$$

| $P$ | $Q$ | $P \leftrightarrow Q$ |
|-----|-----|----------------------|
| T   | T   | T                    |
| T   | F   | F                    |
| F   | T   | F                    |
| F   | F   | T                    |

The biconditional is the logical expression of mathematical equality of
conditions. When we write a definition like "a number $n$ is even if and
only if $n = 2k$ for some integer $k$," the "if and only if" is precisely
$\leftrightarrow$. Proving a biconditional requires proving both directions
— the "if" and the "only if" — which is why proofs of biconditionals
have two parts.

The notation "iff" is standard mathematical shorthand for $\leftrightarrow$.

---

### Logical Equivalence

```scene
LogicalEquivalenceScene
```

```quiz
{"q": "\u00ac(P \u2227 Q) is logically equivalent to:", "options": ["\u00acP \u2227 \u00acQ", "\u00acP \u2228 \u00acQ", "\u00ac(P \u2228 Q)", "P \u2228 Q"], "correct": 1, "explanation": "De Morgan's Law: NOT(P AND Q) = (NOT P) OR (NOT Q)."}
```


Two propositions are **logically equivalent** if they have the same truth
value for every possible combination of inputs — if their truth tables are
identical column for column.

**Notation:** $P \equiv Q$ means $P$ and $Q$ are logically equivalent.

Logical equivalence is not the same as the biconditional $P \leftrightarrow Q$:
the biconditional is itself a proposition (which can be true or false for
specific $P$ and $Q$), while logical equivalence says the biconditional
is always true, regardless of the truth values of $P$ and $Q$.

**The most important equivalences to know:**

| Name | Equivalence |
|------|-------------|
| Double negation | $\lnot(\lnot P) \equiv P$ |
| De Morgan's Law 1 | $\lnot(P \land Q) \equiv \lnot P \lor \lnot Q$ |
| De Morgan's Law 2 | $\lnot(P \lor Q) \equiv \lnot P \land \lnot Q$ |
| Contrapositive | $P \rightarrow Q \equiv \lnot Q \rightarrow \lnot P$ |
| Implication rewrite | $P \rightarrow Q \equiv \lnot P \lor Q$ |

**De Morgan's Laws in logic:** Exactly the same content as in Lesson 0.2,
in a new notation. "Not (A and B)" is the same as "not A or not B."
The proof is word-for-word the same as the set version — the algebraic
structure is identical.

```python
# Verify De Morgan's Laws and key equivalences
print("Verifying logical equivalences by truth table\n")
print(f"{'P':^5}{'Q':^5}{'¬(P∧Q)':^9}{'¬P∨¬Q':^9}{'Match':^7}"
      f"  {'¬(P∨Q)':^9}{'¬P∧¬Q':^9}{'Match':^7}")
print("-" * 60)

all_match = True
for P in [True, False]:
    for Q in [True, False]:
        dm1_left  = not (P and Q)
        dm1_right = (not P) or (not Q)
        dm2_left  = not (P or Q)
        dm2_right = (not P) and (not Q)

        match1 = dm1_left == dm1_right
        match2 = dm2_left == dm2_right
        all_match = all_match and match1 and match2

        def tf(b): return 'T' if b else 'F'
        print(f"{tf(P):^5}{tf(Q):^5}{tf(dm1_left):^9}{tf(dm1_right):^9}"
              f"{'✓' if match1 else '✗':^7}"
              f"  {tf(dm2_left):^9}{tf(dm2_right):^9}{'✓' if match2 else '✗':^7}")

print()
print(f"Both De Morgan's Laws hold for all inputs: {all_match}")
```

**Walkthrough:** `def tf(b): return 'T' if b else 'F'` is a helper
function — its name `tf` stands for "true/false formatter." It converts
a Python boolean to the single character `T` or `F`, used throughout
this block for readable output. The nested `for` loops generate all
four input combinations. For each, both De Morgan's laws are computed
and compared. The `all_match` flag accumulates whether every row matched,
producing a single final confirmation. All eight cells in the "Match"
columns show `✓`.

---

### Tautologies and Contradictions

```scene
TautologyScene
```

Some propositions are true for every possible truth value of their variables.
Others are false for every possible truth value.

**Definition:** A **tautology** is a proposition that is always true,
regardless of the truth values of its component propositions.

**Definition:** A **contradiction** is a proposition that is always false,
regardless of the truth values of its component propositions.

The most basic tautology is the **law of the excluded middle**:
$$P \lor \lnot P$$
Every proposition is either true or false — there is no middle ground.
This is always true.

The most basic contradiction is:
$$P \land \lnot P$$
No proposition can be simultaneously true and false.

```python
# Tautology: P ∨ ¬P
print("Law of excluded middle: P ∨ ¬P")
print(f"{'P':^5} | {'P ∨ ¬P':^8}")
print(f"------+---------")
for P in [True, False]:
    tautology = P or (not P)
    print(f"{'T' if P else 'F':^5} | {'T' if tautology else 'F':^8}")

print()

# Contradiction: P ∧ ¬P
print("Contradiction: P ∧ ¬P")
print(f"{'P':^5} | {'P ∧ ¬P':^8}")
print(f"------+---------")
for P in [True, False]:
    contradiction = P and (not P)
    print(f"{'T' if P else 'F':^5} | {'T' if contradiction else 'F':^8}")
```

**Walkthrough:** Both blocks follow the same structure as previous truth
table code. `P or (not P)` always evaluates to `True` — Python confirms
the excluded middle holds for both `True` and `False`. `P and (not P)`
always evaluates to `False` — a value cannot be both true and false.
These are not interesting computationally (the results are obvious),
but they are important to name and recognise as patterns that recur
throughout proof writing.

---

### Visualising Truth Tables as Regions

```scene
RegionTruthScene
```

The connection between logic and set operations becomes visible geometrically.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, axes = plt.subplots(1, 3, figsize=(14, 5))

def draw_logic_venn(ax, title, highlight_regions):
    """
    Draw a Venn diagram with two sets P and Q.
    highlight_regions is a list of region names to shade:
    'only_P', 'both', 'only_Q', 'neither'
    """
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title(title, fontsize=12, pad=10)

    # Rectangle: universal set (all cases)
    rect = patches.FancyBboxPatch(
        (0.3, 0.5), 9.4, 6.0,
        boxstyle="round,pad=0.1",
        fill=True, facecolor='#f0f0f0',
        edgecolor='#555555', linewidth=1.5
    )
    ax.add_patch(rect)

    highlight_color = '#f39c12'
    neutral_color   = '#dce8f5'

    # P oval (left)
    p_color = highlight_color if 'only_P' in highlight_regions else neutral_color
    oval_P = patches.Ellipse((3.8, 3.5), width=5.5, height=4.8,
                              fill=True, facecolor=p_color,
                              edgecolor='#2980b9', linewidth=2, zorder=2)
    ax.add_patch(oval_P)

    # Q oval (right)
    q_color = highlight_color if 'only_Q' in highlight_regions else neutral_color
    oval_Q = patches.Ellipse((6.2, 3.5), width=5.5, height=4.8,
                              fill=True, facecolor=q_color,
                              edgecolor='#27ae60', linewidth=2, zorder=2)
    ax.add_patch(oval_Q)

    # Overlap colour (drawn last to override)
    overlap_color = highlight_color if 'both' in highlight_regions else '#c5d8ec'
    overlap = patches.Ellipse((4.7, 3.5), width=2.5, height=4.2,
                               fill=True, facecolor=overlap_color,
                               edgecolor='none', zorder=3)
    ax.add_patch(overlap)

    # Labels
    ax.text(2.2, 6.0, 'P', fontsize=15, color='#2980b9',
            fontweight='bold', zorder=5)
    ax.text(7.8, 6.0, 'Q', fontsize=15, color='#27ae60',
            fontweight='bold', zorder=5)

# P ∧ Q: only the intersection
draw_logic_venn(axes[0], r'$P \wedge Q$  (AND: only where both are true)',
                ['both'])

# P ∨ Q: everything in either oval
draw_logic_venn(axes[1], r'$P \vee Q$  (OR: wherever at least one is true)',
                ['only_P', 'both', 'only_Q'])

# ¬P: everything outside P
draw_logic_venn(axes[2], r'$\neg P$  (NOT P: everything outside P)',
                ['only_Q', 'neither'])

plt.suptitle('Logical connectives as regions in a Venn diagram',
             fontsize=13, y=1.02)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `draw_logic_venn` draws a two-oval Venn diagram and
highlights specific regions in orange. `highlight_regions` is a list of
strings naming which of the four regions to colour: the left-only region
(`'only_P'`), the overlap (`'both'`), the right-only region (`'only_Q'`),
and the outside region (`'neither'`). For $P \land Q$, only `'both'` is
highlighted — the intersection. For $P \lor Q$, the three regions covering
either oval are highlighted. For $\lnot P$, everything outside the $P$ oval
is highlighted — the right-only region and the "neither" region together.
This makes the correspondence between logic and sets directly visible:
AND is intersection, OR is union, NOT is complement.

---

### A Complete Truth Table: Putting It Together

```scene
CompleteTableScene
```

**Hand-worked example:** Build the complete truth table for
$(P \land \lnot Q) \lor (\lnot P \land Q)$.

This expression is called the **exclusive or** (XOR) — it is true when
exactly one of $P$, $Q$ is true.

We build the table column by column, computing each sub-expression first:

| $P$ | $Q$ | $\lnot P$ | $\lnot Q$ | $P \land \lnot Q$ | $\lnot P \land Q$ | Result |
|-----|-----|-----------|-----------|-------------------|-------------------|--------|
| T   | T   | F         | F         | F                 | F                 | **F**  |
| T   | F   | F         | T         | T                 | F                 | **T**  |
| F   | T   | T         | F         | F                 | T                 | **T**  |
| F   | F   | T         | T         | F                 | F                 | **F**  |

**Narration, row by row:**

*Row 1 ($P$=T, $Q$=T):* $\lnot P$ = F, $\lnot Q$ = F.
$P \land \lnot Q$ = T AND F = F.
$\lnot P \land Q$ = F AND T = F.
Result: F OR F = **F**. (Both true — XOR is false.)

*Row 2 ($P$=T, $Q$=F):* $\lnot P$ = F, $\lnot Q$ = T.
$P \land \lnot Q$ = T AND T = T.
$\lnot P \land Q$ = F AND F = F.
Result: T OR F = **T**. (Only $P$ true — XOR is true.)

*Row 3 ($P$=F, $Q$=T):* $\lnot P$ = T, $\lnot Q$ = F.
$P \land \lnot Q$ = F AND F = F.
$\lnot P \land Q$ = T AND T = T.
Result: F OR T = **T**. (Only $Q$ true — XOR is true.)

*Row 4 ($P$=F, $Q$=F):* $\lnot P$ = T, $\lnot Q$ = T.
$P \land \lnot Q$ = F AND T = F.
$\lnot P \land Q$ = T AND F = F.
Result: F OR F = **F**. (Neither true — XOR is false.)

**Generalise:** XOR is true when exactly one input is true. This matches
the symmetric difference from Lesson 0.2: $A \triangle B$ contains
elements in exactly one of the two sets — the set version of XOR.

```python
# Verify the full XOR truth table and compare to Python's ^ operator
print(f"{'P':^5}{'Q':^5}{'(P∧¬Q)∨(¬P∧Q)':^18}{'P ^ Q (XOR)':^14}{'Match':^7}")
print("-" * 50)
for P in [True, False]:
    for Q in [True, False]:
        xor_formula = (P and not Q) or (not P and Q)
        xor_operator = P ^ Q   # Python's XOR operator for booleans
        p_str   = 'T' if P else 'F'
        q_str   = 'T' if Q else 'F'
        xf_str  = 'T' if xor_formula else 'F'
        xo_str  = 'T' if xor_operator else 'F'
        match   = '✓' if xor_formula == xor_operator else '✗'
        print(f"{p_str:^5}{q_str:^5}{xf_str:^18}{xo_str:^14}{match:^7}")
```

**Walkthrough:** `(P and not Q) or (not P and Q)` translates the formula
directly into Python — `and`, `not`, `or` are Python's boolean operators,
corresponding to $\land$, $\lnot$, $\lor$. `P ^ Q` applies Python's
XOR operator for booleans. Both columns produce identical results,
confirming that the formula is exactly XOR. The `^` symbol is Python's
bitwise XOR, which works correctly on booleans since Python's `True`
and `False` are integers 1 and 0.

---

## Connect the Pieces

**What this lesson built on:** Lesson 0.2's set operations — union,
intersection, and complement — are the same structure as OR, AND, and NOT.
De Morgan's Laws appear in both places because they describe the same
algebraic fact in two different domains. The symmetric difference
$A \triangle B$ from Lesson 0.2's extension problems is exactly XOR.

**What this lesson makes possible:** Lesson 0.5 (Proof by Contradiction)
and Lesson 0.6 (Proof by Induction) — both proof techniques are built on
the logic established here. Proof by contradiction uses the fact that
$P$ and $\lnot P$ cannot both be true (no contradiction is true). Proof
by contrapositive uses $P \rightarrow Q \equiv \lnot Q \rightarrow \lnot P$.

**In computer science:** Every `if` statement in every program is an
implication: `if (condition) { action }` executes `action` only when
the condition is true — precisely $\text{condition} \rightarrow \text{action}$.
Every Boolean expression in code is propositional logic: `x > 0 && y > 0`
is $P \land Q$. De Morgan's Laws tell you how to simplify conditions:
`!(a && b)` equals `!a || !b` — useful when the negated form is easier
to read or compute. Boolean satisfiability (SAT) — determining whether
a propositional formula can be made true — is the archetypal NP-complete
problem and the core of modern program verification tools.

---

## Summary

**Proposition:** A statement that is true or false. Variables: $P$, $Q$, $R$.

**Negation:** $\lnot P$ — true when $P$ is false. ("NOT P")

**Conjunction:** $P \land Q$ — true only when both $P$ and $Q$ are true. ("AND")

**Disjunction:** $P \lor Q$ — true when at least one of $P$, $Q$ is true. ("OR")

**Implication:** $P \rightarrow Q$ — false only when $P$ is true and $Q$ is false.
Equivalent to $\lnot P \lor Q$.

**Biconditional:** $P \leftrightarrow Q$ — true when $P$ and $Q$ have the same truth value.

**Logical equivalence:** $P \equiv Q$ — the same truth value for every input combination.

**Key equivalences:**
$$\lnot(\lnot P) \equiv P$$
$$\lnot(P \land Q) \equiv \lnot P \lor \lnot Q \quad \text{(De Morgan 1)}$$
$$\lnot(P \lor Q) \equiv \lnot P \land \lnot Q \quad \text{(De Morgan 2)}$$
$$P \rightarrow Q \equiv \lnot Q \rightarrow \lnot P \quad \text{(Contrapositive)}$$
$$P \rightarrow Q \equiv \lnot P \lor Q \quad \text{(Implication rewrite)}$$

**Tautology:** Always true. Example: $P \lor \lnot P$.

**Contradiction:** Always false. Example: $P \land \lnot P$.

**Correspondence with sets:**

| Logic | Sets |
|-------|------|
| $\lnot P$ | $A^c$ |
| $P \land Q$ | $A \cap B$ |
| $P \lor Q$ | $A \cup B$ |
| $P \oplus Q$ (XOR) | $A \triangle B$ |

---

## Problems

### Computation

**1.** Build the complete truth table for each expression.
Show all intermediate columns.

(a) $\lnot P \lor Q$

(b) $(P \lor Q) \land \lnot P$

(c) $P \rightarrow (Q \rightarrow P)$

*Answers:*
*(a) Equivalent to $P \rightarrow Q$ — same column as the implication table.*
*(b) T,F,T,F → after computing, the result is F,F,T,F — actually:*
*P=T,Q=T: (T∨T)∧F = T∧F = F. P=T,Q=F: T∧F = F. P=F,Q=T: T∧T = T. P=F,Q=F: F∧T = F.*
*Result: F, F, T, F.*
*(c) A tautology — always T. When P is true, Q→P is true regardless of Q. When P is false, P→(Q→P) has a false hypothesis so it is true.*

**2.** Determine whether each pair of propositions is logically equivalent
by comparing their truth tables.

(a) $P \rightarrow Q$ and $Q \rightarrow P$

(b) $P \rightarrow Q$ and $\lnot P \rightarrow \lnot Q$

(c) $\lnot(P \rightarrow Q)$ and $P \land \lnot Q$

*Answers: (a) Not equivalent — the converse of an implication is not equivalent to it.
(b) Not equivalent — the inverse of an implication is not equivalent to it.
(c) Equivalent — negating an implication gives exactly this.*

---

### Understanding

**3.** Consider the statement: "If a number is divisible by 6, then it is
divisible by 3."

(a) Identify $P$ and $Q$.

(b) State the converse ($Q \rightarrow P$). Is it true?

(c) State the contrapositive ($\lnot Q \rightarrow \lnot P$). Is it true?

(d) State the negation ($\lnot(P \rightarrow Q)$). What would it take for
this to be true?

*Guidance: (b) "If divisible by 3, then divisible by 6" — false (e.g. 9).
(c) "If not divisible by 3, then not divisible by 6" — true (same truth value as original).
(d) "A number is divisible by 6 but not by 3" — never true.*

**4.** A student says: "The implication $P \rightarrow Q$ is false when $P$
is false, because if the hypothesis is false, nothing follows." Explain
precisely what is wrong with this reasoning.

*Guidance: The implication is a promise: "if P is true, Q will be true."
When P is false, the promise is never put to the test — it is neither
kept nor broken. A promise never tested is not a broken promise.
So a false hypothesis makes the implication vacuously true, not false.*

---

### Proof

**5.** Prove that $P \rightarrow Q$ is logically equivalent to $\lnot P \lor Q$
by constructing truth tables for both and showing they are identical.

**6.** Use De Morgan's First Law ($\lnot(P \land Q) \equiv \lnot P \lor \lnot Q$)
to simplify $\lnot(\lnot P \land \lnot Q)$.
Show each step and name each law used.

*Guidance: $\lnot(\lnot P \land \lnot Q) \equiv \lnot(\lnot P) \lor \lnot(\lnot Q)$
(De Morgan 1) $\equiv P \lor Q$ (double negation, applied twice).
This shows that $\lnot(\lnot P \land \lnot Q) \equiv P \lor Q$ —
which is De Morgan's Second Law read from right to left.*

---

### Extension

**7. ★** A proposition built from $n$ variables has $2^n$ rows in its truth
table. For $n = 3$ variables $P$, $Q$, $R$:

(a) How many rows does the truth table have?

(b) Build the truth table for $(P \land Q) \lor R$.

(c) Build the truth table for $P \land (Q \lor R)$.

(d) Are (b) and (c) logically equivalent? What algebraic law does this
demonstrate?

*Answer: (a) $2^3 = 8$ rows. (d) They are not equivalent in general —
AND does not distribute over OR in the same way multiplication distributes
over addition... actually it does. Let me verify: $P \land (Q \lor R) \equiv (P \land Q) \lor (P \land R)$.
The two expressions in (b) and (c) are $(P \land Q) \lor R$ vs $P \land (Q \lor R)$ —
these are different. Students should construct both truth tables and find they differ
at the row $P$=F, $Q$=F, $R$=T: (b) gives $(F \land F) \lor T = F \lor T = T$;
(c) gives $F \land (F \lor T) = F \land T = F$. Not equivalent.*

**8. ★ (Connecting logic and sets):** The correspondence in the Summary
table connects propositional logic to set operations. Use De Morgan's
Law for sets from Lesson 0.2 to immediately write down both De Morgan's
Laws for logic — without constructing a truth table. Then verify one of
them with a truth table.

*Guidance: The set law says $\overline{A \cup B} = A^c \cap B^c$.
Replacing $A$ with "situations where $P$ is true" and $B$ with
"situations where $Q$ is true": the complement of "P or Q" equals
"not P and not Q" — which is $\lnot(P \lor Q) \equiv \lnot P \land \lnot Q$.
The second law follows identically. The structure is the same; only the
notation changes.*
