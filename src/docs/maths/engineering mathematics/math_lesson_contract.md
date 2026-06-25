# Mathematics Lesson Contract

Every lesson in this curriculum — whether written by a human or an agent — must
meet this contract. It is not a style guide. It is a definition of what teaching
mathematics means here. A lesson that does not meet this contract is not a lesson.
It is a textbook entry.

---

## The Core Problem This Contract Solves

Mathematics education has a structural flaw: it teaches procedures and skips
understanding. The result is a student who can apply the quadratic formula but
cannot explain why completing the square works, who can differentiate $\sin x$
but cannot say what a derivative actually is, who can row-reduce a matrix but
has no picture of what the operation is doing to space.

This happens because most mathematics teaching separates three things that belong
together:

- **The formal definition** — precise, symbolic, unambiguous
- **The geometric picture** — what it looks like, what it means spatially
- **The reason it exists** — what problem it solves, why someone needed it

This curriculum keeps all three together at every step. A definition without a
picture is memorisation. A picture without a definition is intuition without
precision. Neither without a reason is mathematics disconnected from the world.

**The rule is absolute:** every concept is taught with all three — formal
definition, geometric picture, and the reason it exists — at the moment it
first appears.

---

## The Difference Between Describing and Teaching

A description states what something is.
A lesson explains why it is that way, what it connects to, and what breaks without it.

**Description:** The derivative of $f(x)$ is $\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$.

**Teaching:** We define the derivative as a limit because "the slope of a curve at
a point" is not well-defined using ordinary algebra — a curve does not have a single
slope the way a line does. The limit process asks: what slope does the secant line
approach as the second point gets closer and closer to the first? That limiting value
is the slope of the tangent line — the instantaneous rate of change. Newton invented
this to describe velocity: if position is $s(t)$, then $s'(t)$ is the velocity at
the instant $t$, not over an interval. The limit is not a trick — it is the precise
way to make "instantaneous" mean something.

The test: could a student explain not just what the formula says, but why it is
written that way and what problem it is solving?

---

## The Three Lenses

Every significant mathematical concept must be explained through three lenses.
All three are required. None is optional.

**The Formal Lens** — What is the precise definition?
State it in the language of mathematics: symbols, quantifiers, conditions.
Do not hide behind informal language when precision is needed. When a definition
has conditions (e.g., "for all $\epsilon > 0$ there exists $\delta > 0$"), explain
what each condition is doing and why removing it would break the definition.

**The Geometric Lens** — What does this look like?
Every concept in this curriculum has a picture. A function is a machine with an
input and output. A vector is an arrow. A derivative is the slope of a tangent line.
A basis is a set of directions that reaches everywhere. An eigenvalue is a scaling
factor along a direction the transformation does not rotate.
If the student cannot picture it, they do not have the concept — they have the formula.

**The Physical/Computational Lens** — Where does this appear in the real world?
Every mathematical concept in this curriculum was invented to solve a real problem.
Name the problem. Name where the concept appears in physics, engineering, or computer
science. This is not decoration — it is the reason the concept exists, and it makes
the abstraction land on something solid.

For pure mathematics lessons: use the Physical/Computational Lens to name where
the concept appears in a downstream application, even if that application has not
been taught yet. "This will be the structure inside the RSA cipher in Stage 10"
is enough. The forward connection is planted now; it pays off later.

---

## The Historical Thread

Mathematics is a human story. Every major concept has a person, a date, and a
problem that drove it. These are not trivia — they are the most powerful memory
anchor available.

Every lesson must include, briefly:

- **Who** developed this concept (or the historical context if attribution is unclear)
- **When** — the approximate period is enough
- **What problem they were trying to solve** — the specific, concrete problem,
  not a general description of the field

This does not need to be long. Two to four sentences per lesson is enough.
The goal is to make the concept feel discovered rather than handed down.

**Example (correct):**
"John Napier published the first table of logarithms in 1614, motivated by the
labour of multiplying large numbers by hand — the calculations astronomers needed
for navigation. His insight was that multiplication in one system corresponds to
addition in another. Before calculators, logarithm tables reduced hours of
multiplication to minutes of addition. The slide rule, used by engineers until
the 1970s, is a mechanical implementation of this same idea."

**Example (wrong):**
"Logarithms were invented in the 17th century."

---

## Hand-Worked Examples

Every lesson must include at least one complete, hand-worked example — a
calculation performed step by step, showing every intermediate value, with
every step explained.

Rules for hand-worked examples:

1. **State what you are computing before you start.** "We will find the GCD of
   48 and 18 using the Euclidean algorithm."

2. **Show every step.** Do not skip steps with "it follows that" or "clearly."
   If a step requires arithmetic, show the arithmetic.

3. **Narrate each step.** After each line of calculation, explain what was done
   and why. "We divide 48 by 18 and find quotient 2, remainder 12. The Euclidean
   algorithm now replaces the pair (48, 18) with (18, 12) — the GCD has not
   changed, because any divisor of 48 and 18 is also a divisor of 18 and 12."

4. **Verify the result.** Show that the answer is correct by checking it
   directly. For GCD: show that the answer divides both original numbers.
   For a solved equation: substitute back in.

5. **Generalise from the example.** After the specific example, state the
   general pattern. "This is the pattern: divide the larger by the smaller,
   keep the remainder, repeat. The algorithm terminates because the remainders
   strictly decrease."

---

## Code Blocks

This curriculum uses Python, MATLAB, and JavaScript. Code is a tool for
computation and visualisation, not the subject of the lesson. The mathematical
concept is always the subject.

### Every code block is self-contained

Every code block must run on its own, without requiring a previous block to
have been run first. If a function defined earlier in the lesson is needed,
redefine it in the block. Functions that are unchanged from an earlier block
are marked with a comment:

```python
def euclidean_gcd(a, b):
    # unchanged from the previous block
    while b != 0:
        remainder = a % b
        a = b
        b = remainder
    return a
```

This costs some repetition. The benefit — any block can be run in isolation —
is worth it.

### Code follows the mathematical explanation

Code does not replace mathematical explanation. The pattern is:

1. Explain the mathematics
2. Show the hand-worked example
3. Implement it in code
4. Use the code to explore, verify, or visualise

A lesson that jumps straight to code without mathematical explanation first has
inverted the order. The student learns to compute without understanding what
they are computing.

### Code blocks are explained

Every code block has:

- **A stated purpose** — what problem this block solves
- **A walkthrough** — a prose description of what the code does, line by line
  or step by step. Not a comment on each line — a narrative that traces execution
- **A connection** — what this code connects to, either in the mathematics just
  explained or in the larger curriculum

### Every new language construct is explained at first use

Any Python, MATLAB, or JavaScript syntax the student may not know is explained
the first time it appears. This includes:

- Built-in functions (`range()`, `enumerate()`, `zip()` in Python;
  `linspace()`, `plot()` in MATLAB; `Math.cos()` in JavaScript)
- Data structures (`list`, `dict`, `numpy array` in Python; matrix syntax in MATLAB)
- Language features (`list comprehensions`, `lambda`, `f-strings` in Python)

The explanation is brief but complete enough to read the code:

"**`range(1, 26)`** generates the integers 1, 2, 3, ..., 25. The first argument
is the start (inclusive); the second is the stop (exclusive). `range(1, 26)`
stops at 25, not 26."

### Visualisations come early

When a concept has a geometric interpretation — and most do — the visualisation
is built early, even if it starts as a skeleton. A plot with placeholder data
is better than prose saying "we will visualise this later." The student can
see the shape of the result before the mathematics that produces it is complete.

---

## Explanation Standards

### Explain before you show

Before presenting a definition, example, or code block, state the problem
it is solving. The student should understand why this thing is needed before
seeing what it is.

**Wrong order:**
"A function $f: A \to B$ is injective if $f(a_1) = f(a_2)$ implies $a_1 = a_2$."

**Right order:**
"We need a way to describe functions that never send two different inputs to
the same output — functions where knowing the output tells you exactly what
the input was. This property is called injectivity.
Formally: $f: A \to B$ is injective if $f(a_1) = f(a_2)$ implies $a_1 = a_2$."

### Derive, do not state

When a formula, identity, or theorem can be derived from what the student already
knows, derive it. Do not state it and ask the student to accept it.

"The identity $\sin^2\theta + \cos^2\theta = 1$ is not a fact to memorise. It is
a consequence of how $\sin$ and $\cos$ are defined on the unit circle..."
Then derive it from the Pythagorean theorem applied to the unit circle.

Stating without deriving trains the student to accept mathematical facts on
authority. Deriving trains the student to see where facts come from — and to
notice when something seems wrong.

### Nothing is assumed

Every concept a lesson needs is either taught in that lesson or recapped
briefly before it is used.

A student who reads Lesson 4.9 without having read Lesson 4.8 must still be
able to follow Lesson 4.9. The "What you need to know first" section may point
backward, but the explanation must stand on its own. Key ideas from previous
lessons are restated briefly at the point of use, not assumed remembered.

### Notation is introduced, not assumed

Every new symbol is explained when it first appears:

- **$\forall$** means "for all" — a claim that holds for every element of a set
- **$\exists$** means "there exists" — a claim that at least one element satisfies
  a condition
- **$\in$** means "is an element of" — $x \in S$ reads "x is in the set S"
- **$\Rightarrow$** means "implies" — if the left side is true, the right side must be

After first explanation, the symbol is used without comment.

### Hard concepts are restated at every appearance

Some concepts need to be seen many times before they are genuinely understood.
These include:

- Any named theorem (Pythagorean theorem, Fundamental Theorem of Calculus,
  Intermediate Value Theorem, Rank-Nullity theorem)
- Any major definition (limit, derivative, basis, eigenvalue, group)
- Any proof technique (induction, contradiction, contrapositive)
- Any computational concept (Big O, recursion, numerical stability)

When these reappear, they are briefly restated — one or two sentences connecting
the concept to the current context. Not re-taught in full. Just named and
reconnected.

---

## Proof Standards

This curriculum includes proofs. They are not optional or decorative — they are
how mathematics becomes certain rather than plausible.

Every proof must:

1. **State what is being proved** — the exact claim, not a paraphrase of it
2. **State the proof strategy** — "We prove this by contradiction" or "We use
   induction on $n$" — before the proof begins
3. **Be written in complete sentences** — a proof is an argument, not a
   sequence of equations
4. **Explain each step** — not just what follows, but why it follows
5. **State when the proof is complete** — a clear conclusion

**On proof technique:** when a proof technique (contradiction, induction,
contrapositive) appears for the first time, explain the technique itself
before applying it. "Proof by contradiction assumes the opposite of what
we want to prove, and shows that this assumption leads to something
impossible. If the assumption leads to a contradiction, the assumption
must be false, and therefore the original claim must be true."

After the first explanation of a technique, it may be named without
re-explanation.

---

## Problems

Every lesson ends with a **Problems** section. Problems are not optional — they
are where understanding is built. A student who has read a lesson but not done
the problems has not finished the lesson.

### Problem types

Each lesson's problem set includes problems from four categories:

**Computation** — apply the technique to specific numbers.
These confirm the mechanics are understood.
*Example: "Compute $\gcd(252, 105)$ using the Euclidean algorithm,
showing every step."*

**Understanding** — explain a concept in words, or identify what is wrong.
These confirm the idea is understood, not just the procedure.
*Example: "A student claims that $\{[1,0], [0,1], [1,1]\}$ is a basis for
$\mathbb{R}^2$. What is wrong with this claim?"*

**Proof** — prove or disprove a statement.
These build mathematical maturity.
*Example: "Prove that if $a \equiv b \pmod{n}$ and $b \equiv c \pmod{n}$,
then $a \equiv c \pmod{n}$."*

**Extension** — connect to something not yet taught, or go deeper than the lesson.
These are harder and are explicitly marked as such.
*Example: "★ The Euclidean algorithm can be extended to find integers $x$ and $y$
such that $ax + by = \gcd(a, b)$. This is called the extended Euclidean algorithm.
For $a = 48$, $b = 18$, find $x$ and $y$ such that $48x + 18y = 6$."*

Extension problems are marked with ★. They are not required but are worth
attempting.

### Problem standards

- Every problem has a clear, unambiguous statement
- Computation problems have a verifiable answer (given at the end of the lesson
  or in a solutions document)
- Understanding and proof problems have a model answer or guidance note
- Problems are ordered from straightforward to harder within each category
- At least one problem connects the lesson's concept to a future topic or
  a real-world application

---

## Lesson Structure

Every lesson must have these sections, in this order:

### 1. Header Block
```
Stage X, Lesson Y.Z — [Title]
Threads: [Math] [Physics] [CS] (whichever apply)
Estimated time: [30–90 minutes depending on density]
```

### 2. What This Lesson Is About
One paragraph. State the concept being taught, the problem it solves,
and what the student will be able to do by the end. Not a list —
a paragraph that reads like the opening of a story.

### 3. Historical Context
Two to four sentences. Who, when, what problem. See the Historical Thread
section above.

### 4. What You Need To Know First
Explicit list of prerequisite concepts, with a one-sentence reminder of
each. A student who is missing a prerequisite should know it immediately,
not halfway through the lesson.

### 5. The Lesson
The main body. Organised into named sections. Each section:
- States the problem or question it is addressing
- Develops the mathematics (definition, derivation, or theorem)
- Includes a hand-worked example
- Includes a code block if computation or visualisation is relevant
- Applies all three lenses

### 6. Connect the Pieces
A short section — half a page at most — that:
- States explicitly what this lesson built on (backward connection)
- States what this lesson makes possible (forward connection)
- Names at least one place this concept appears in the real world outside
  mathematics (physics, engineering, CS, or another field)

### 7. Summary
A concise restatement of the key definitions, results, and techniques
from the lesson. Formatted for reference — this is the part a student
returns to when they need a reminder without re-reading the whole lesson.
Use precise mathematical notation here.

### 8. Problems
Organised by type: Computation, Understanding, Proof, Extension (★).
Minimum four problems per lesson; more for dense lessons.
Answers or guidance for Computation problems.

---

## Self-Contained Code Blocks: The Rule

Because code blocks are run inline in a markdown environment, every code block
must be fully self-contained. This means:

- Every function the block uses is defined in that block
- Every import the block needs is included in that block
- The block produces visible output when run — a printed value, a plot,
  or a computed result
- The block does not depend on a previous block having been run

Where a function is repeated unchanged from an earlier block, it is included
with the comment `# unchanged from [description]`. This signals to the reader
that the function is not new, but ensures the block runs without it.

This is a hard rule. No exceptions.

---

## The Checklist

Before a lesson is finalised, verify every item:

**Foundations**
- [ ] The lesson states what problem it is solving before presenting any mathematics
- [ ] Every new concept has a formal definition, a geometric picture, and a
      physical/computational connection
- [ ] The historical context is specific — who, when, what problem — not vague
- [ ] The lesson is self-contained: a student without the prerequisites can identify
      them from the "What You Need To Know First" section and from brief recaps

**Teaching**
- [ ] Every definition is motivated before it is stated
- [ ] Every formula or identity that can be derived is derived, not stated
- [ ] Every hand-worked example shows every step and narrates each one
- [ ] Every hand-worked example verifies its own result
- [ ] Hard concepts are briefly restated at every appearance after their first
- [ ] No step is skipped with "clearly," "obviously," or "it follows that"
      without explanation

**Three Lenses**
- [ ] Every significant concept is explained through the Formal Lens
- [ ] Every significant concept is explained through the Geometric Lens
- [ ] Every significant concept has a Physical/Computational connection named

**Code**
- [ ] Every code block is self-contained and runs without prior context
- [ ] Every code block produces visible output
- [ ] Every new language construct is explained at first use
- [ ] Code appears after mathematical explanation, not instead of it
- [ ] Visualisations appear early, not deferred to future lessons

**Proof**
- [ ] Every proof states what is being proved
- [ ] Every proof states its strategy before beginning
- [ ] Every proof is written in complete sentences
- [ ] Every proof technique used for the first time is explained before use

**Problems**
- [ ] At least one Computation problem
- [ ] At least one Understanding problem
- [ ] At least one Proof problem
- [ ] At least one Extension problem (★)
- [ ] Computation problems have answers
- [ ] At least one problem connects to a real-world application or future topic

**Connection**
- [ ] The "Connect the Pieces" section names what came before
- [ ] The "Connect the Pieces" section names what comes next
- [ ] At least one real-world connection is named explicitly

**Structure**
- [ ] All eight sections are present
- [ ] The Summary contains all key definitions in precise notation
- [ ] The lesson reads as a story, not a list of facts

---

## A Final Test

Read the lesson as if you have never seen this mathematics before.

Then ask:

1. Do I know why this concept exists — what problem it solves?
2. Can I picture it geometrically?
3. Can I state the definition precisely, in symbols?
4. Can I work an example by hand without looking at the lesson?
5. Do I know where I will see this again?
6. Can I do the problems?

If the answer to any of these is no, the lesson is not finished.
