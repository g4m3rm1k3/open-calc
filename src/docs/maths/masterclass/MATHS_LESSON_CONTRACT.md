# Mathematics Masterclass — Lesson Contract

**This is not a checklist.** A checklist is something you satisfy. This is a description of what genuine teaching looks like. Read it until you understand what it means, not until you can tick every box. A lesson that passes every item on a checklist while failing to teach is exactly the failure this document exists to prevent.

The test is this: could a student use this lesson as a quick reference — skim it, find the formula, move on — without losing anything? If yes, it is a reference document, not a lesson. A lesson only gives up its value if the student actually engages with it.

---

## What Teaching Actually Is

Teaching is not stating true things clearly. A textbook states true things clearly. Teaching is the process of getting another person to understand something — which means you must think about what they already know, what they are confused by, what they need to see before the new idea makes sense, and what the idea connects to.

The difference between a reference and a lesson is not length or structure. It is whether the student arrives at the idea or receives it.

**Receives it:** "A field is a set with two operations satisfying nine axioms."

**Arrives at it:** You start from arithmetic rules the student already knows. You ask: which of these rules are assumptions and which are consequences? You show that "negative times negative is positive" is not a rule someone decided — it follows from the others. You ask the student to try and break it. Then you say: the minimum set of rules you cannot escape is nine. Those are the field axioms.

Same information. Completely different experience. Only one of them teaches.

---

## The Guiding Principle: The Feynman Standard

Richard Feynman's test for understanding: if you cannot explain something simply — without jargon, without dense notation, without assuming the reader already knows — you do not yet understand it.

Every lesson in this curriculum is written as Feynman would have taught it:

- Start from something the student already knows or finds familiar
- Show a gap, a puzzle, or a limitation in that familiar thing
- Let the student feel the need for the new idea before it appears
- Introduce the new idea as the answer to a question the student is actually asking
- Build from there — step by step, never jumping over anything

The notation, the formalism, and the abstraction come **after** the idea. Never before.

---

## What This Curriculum Is and Is Not

**Is:** A journey from solid basic algebra to PhD-level mathematics, taught intuition-first.

**Is not:** A textbook summary. A formula sheet with explanations. A lecture turned into text.

**Target student at the start:** Someone who knows algebra — can solve $2x + 5 = 11$, knows what a graph is, has seen quadratics. Has never been taught to think mathematically.

**Target student at the end:** Can read research mathematics. Can write proofs. Can derive formulas from first principles without looking anything up. Understands why, not just what.

---

## The Principles (Not Rules — Principles)

These are not items to check off. They are descriptions of what a lesson that genuinely teaches will naturally do. If your lesson does not do these things, it is not finished — not because it failed a test, but because it has not yet taught.

---

### The question comes first

Every concept exists because someone needed it. Before you introduce an idea, the student must feel the need for it. They must be in a situation where the idea is the natural solution to a problem they are actually facing.

If you cannot say in one sentence what problem this concept solves, and why a student who knows only algebra would care about that problem, you have not found the right entry point. Find a better one.

**What this looks like in a bad lesson:** "A function $f: A \to B$ is a subset of $A \times B$ such that for every $a \in A$ there exists exactly one $b$ with $(a,b) \in f$."

**What it looks like in a lesson that teaches:** "You know that $f(x) = x^2$ always gives exactly one output for each input. But $y = \pm\sqrt{x}$ gives two outputs for each positive input — so when you write $y = \sqrt{x}$, you are choosing to take only the positive root. What property are we protecting? 'Exactly one output per input.' A *function* is any rule with that property. Now we can say exactly why $y = \pm\sqrt{x}$ is not a function."

The difference: in the second version, the student understood functions before the word appeared.

---

### Earn every symbol — and every word

No notation appears before it is needed. When a symbol is introduced, it follows the English version.

But the same rule applies to words. Mathematical vocabulary — "trichotomy," "closure," "injective," "bounded," "convergent" — is not assumed. Every technical term is introduced in three steps:

1. Describe the concept in plain English that a student who knows only algebra can follow
2. Give the term and explain what it means — not just define it, but explain why mathematicians use that word and what it is pointing at
3. Use the term from then on, because the student now owns it

**What this looks like done wrong:** "O1. Trichotomy: for every $a$, exactly one of $a > 0$, $a = 0$, $a < 0$ holds."

**What it looks like done right:** "Think about any number you can name. It is either positive, zero, or negative — there is no fourth option. That seems so obvious it barely needs saying. But it is doing serious work: it means every inequality proof can split into exactly three cases and know it has covered everything. Mathematicians call this **trichotomy** — from the Greek for 'cutting into three.' The word is just a handle for something you already knew. We will use it from here on as a shorthand."

The student learns both the idea and the vocabulary. You never hide the terminology — you teach it.

---

### Multiple angles on every idea

A concept explained one way has been stated. A concept explained three ways has been taught.

For every important idea, come at it from at least two of these directions:

- **Geometric or visual:** what does this look like? What does it mean on the number line, in the plane, as a shape?
- **Algebraic:** what does the symbolic manipulation show?
- **Numerical or computational:** what happens when you actually compute with it?
- **Extreme case or edge case:** what happens when you push it to a boundary? What breaks if you remove this condition?

**What this looks like done wrong:** "Multiplying both sides of an inequality by a negative number reverses the direction. Proof: [three lines of algebra]."

**What it looks like done right:** You start with the geometry. Multiplying by $-1$ reflects the number line through zero. Everything that was to the right is now to the left. Of course the order reverses — reflection swaps left and right. Then you write the algebra, and it feels like confirmation of something already understood. Then you ask: what does this mean for the case $-2 < -1$? Multiply by $-1$: you get $2 > 1$. Does that match the reflection picture? Yes. The student checks it from three directions and each one confirms the others.

---

### Take time with every idea

A lesson is not a summary. It does not cover concepts — it builds them. There is no such thing as "too long" if the length is genuine teaching. There is only "too long" if it is padding, repetition without insight, or detail that does not serve the student's understanding.

A concept that gets one sentence has been mentioned. A concept that gets a paragraph has been stated. A concept that gets a page — approached from multiple angles, with examples and a thinking moment and a connection to what comes next — has been taught.

**The specific failure to avoid:** one description, no explanation, one example. That is a dictionary entry. Every concept in this curriculum deserves to be explored, not filed.

---

### The reader discovers, you confirm

Structure lessons so the student arrives at the idea before you state it. They should feel the "aha" — not receive the answer before they have asked the question.

At least twice per lesson, stop the exposition and ask the student to think before reading on. Not rhetorically — genuinely. Ask a question that has a real answer, that the student can make progress on with what they already know, and where thinking about it for 60 seconds makes the explanation that follows land harder.

The sequence that works: **puzzle → attempt → insight → confirmation → generalisation.**

Not: statement → explanation → example.

---

### No definitions dropped from above

Definitions should emerge from examples and questions, not be stated as axioms.

Show three or four examples of the thing. Ask what they have in common. The definition is the precise statement of that common property.

When you reach the formal definition, the student should feel: "yes, that is exactly what I was already thinking about." Not: "here is a thing I must now memorise."

---

### Code does one thing — the smallest runnable unit

Every code block makes exactly one point. Ask: what is the single thing the student should understand after running this that they did not understand before? If the answer involves the word "and," split the block.

**Specific constraints:**
- Each code block should be the smallest piece of code that demonstrates its one point. If you can split it and add explanation in between, you must.
- Functions should be called only once per block — if you are calling the same function with five different inputs, you are doing five things.
- One output per code block. The output should have a shape: a surprise, a pattern, a convergence, a failure. If the output is just a list of confirmations, the code is doing too much.
- Maximum ~20 lines per block. If you need more, the block is doing too much.
- No long output. If running the code produces more than ~12 lines of output, trim it.

**The test for a good code block:** a student who runs it should be able to describe in one sentence what they saw. "The sum converges to π²/6." "The prime formula fails at n=40." "The function is its own inverse." If they cannot do that, the block is doing too much.

Code must reveal something the prose cannot. If the code only confirms what the prose already said, cut it.

---

### Every formula is derived, every theorem is proved

No results are handed down. "It can be shown that" is not acceptable. If you cannot derive it in the lesson, the lesson is not ready to include it.

The derivation comes before the formula. The student should see the formula emerge from the algebra, not have it appear and then be verified.

---

## What a Good Lesson Looks Like (Structure)

Structure is not a template to fill in. These are the natural phases of any good explanation.

**Opening:** A story, a question, a puzzle, a paradox, or a surprising fact. Not "in this lesson we will..." but something that makes the student want to know what comes next. Two or three sentences, then into the content.

**The problem:** What can the student not yet do? What question can they not yet answer? State this concretely. The student should feel the gap before the lesson fills it.

**Discovery:** Walk the reader to the idea through examples and questions. The student should arrive at the key insight slightly before you state it.

**The idea stated precisely:** Now state the idea formally — including its proper mathematical name, explained. It earns its notation and its vocabulary because the student already understands what they mean.

**Proof or derivation:** Conversational first, then formal. Every step has a reason attached.

**Try it:** A non-trivial challenge that requires genuine understanding, not template-following.

**What comes next:** One or two sentences connecting this lesson to the next.

---

## What a Lesson Must Not Contain

**"In this lesson we will cover..."** Start the lesson.

**Terminology without explanation.** Every technical word is taught, not assumed.

**A concept explained from only one angle.** State it, prove it, show it geometrically, show it with code, show what breaks without it.

**One description, no explanation, one example.** That is a reference entry. Every concept gets explored.

**Verification soup.** Code that runs through ten cases and prints ten confirmations teaches nothing. One interesting case, traced clearly, teaches the thing.

**"It can be shown that..."** If you cannot show it, the lesson is not ready to include the result.

**A lesson that functions as a quick reference.** If you can skim it and get the formula without losing anything, it is not a lesson.

---

## How Code Blocks Actually Work in This App

**Python (`python`)** — runs via pyodide. `print()` produces text output. `plt.show()` renders as an inline image. Use matplotlib for all diagrams and visualisations.

**JavaScript (`javascript`)** — runs in a sandboxed `Function()` with only `console`, `require`, `module`, and `exports` in scope. **No DOM access in the output panel.** Do not use `document.createElement`, `document.body.appendChild`, or canvas in javascript blocks. Use Python matplotlib instead.

**OpenMAT (`openmat`)** — produces text output. Plot commands do not render inline. Use Python for plots.

**Consequence:** All diagrams, plots, geometric illustrations → **Python + matplotlib only.**

---

## The Reference Lessons

These lessons set the standard:

- **[M-000](M-000-Statements-Logic.md)** — Opening with "What is mathematics, really?" — the hook, the question, the gentle introduction to formal thinking.
- **[M-001](M-001-Proof-Strategies.md)** — The Gauss story. Discovery before formula. The domino intuition for induction. Code that shows one climactic failure.
- **[M-015](M-015-Trigonometry-Unit-Circle.md)** — The unit circle built from scratch. Geometric picture first. Every trig identity derived, not stated. Radians explained by what they mean.

Every lesson written after these should pass one test: would someone who just read M-000 and M-001 feel that this lesson belongs to the same curriculum?

---

## The Single Question

Before you write a lesson, ask: if the student read this and then closed it, what would they be able to do — think, derive, explain — that they could not do before?

If the answer is "recall the definition" or "follow the procedure," the lesson has not been written yet.

If the answer is "understand why this is true and explain it to someone else," you are on the right track.

---

*The measure of a good mathematics lesson is not how much it covers. It is how much the student understands when they close it — and how much they want to know when they open the next one.*
