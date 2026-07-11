# UpskillOS Lesson Engine Contract

Every lesson written for the interactive lesson engine must meet this contract.
It is not a style guide. It is a definition of what teaching means in this format.
A lesson that does not follow this contract is not a lesson — it is a wall of text
with a text box at the end.

---

## File Format

Every lesson file starts with a frontmatter block:

```
---
series: dsa-python
level: 1
title: Two Pointers
lang: python
---
```

Fields:
- `series` — series identifier. Must match an entry in `series.ts`.
- `level` — integer. Level 0 is first. Levels within a series build on each other.
- `title` — names the concept, not the activity. "Two Pointers" not "Learning About Two Pointers."
- `lang` — default language for code fences (`python`, `javascript`, `typescript`, `sql`).

Everything before the first `##` header is the intro paragraph. It merges into the
first step automatically. State what the lesson covers, why it matters, and what the
learner will be able to do. Do not waste it on "In this lesson we will learn about..."

Each `##` header creates one navigable step. Every step is either a **concept step**
or a **challenge step** — never a mix of both.

Fence types the engine recognises:
- `` ```python `` / `` ```js `` / `` ```ts `` / `` ```sql `` — runnable code example
- `` ```text `` — display-only block (execution traces, tables, diagrams) — no Run button
- `` ```challenge `` — editable editor pre-filled with the starter code
- `` ```test `` — assertions run against the learner's code

---

## Lesson Generation Algorithm

```
START LESSON
      │
      ▼
Select the next concept to teach
      │
      ▼
Has this concept already been taught?
      │
      ├─── YES ──► Reference briefly if needed, do not re-explain
      │
      ▼
NO
      │
      ▼
Does the learner need prerequisite knowledge first?
      │
      ├─── YES ──► Teach the prerequisite (return to top of algorithm for that concept)
      │
      ▼
NO
      │
      ▼
Explain WHY the concept exists
      │
      ▼
Explain WHAT the concept does
      │
      ▼
Would a trace, table, analogy, comparison, or diagram improve understanding?
      │
      ├─── YES ──► Add the instructional element
      │
      ▼
Present a runnable code example
      │
      ▼
Is every important part of the code understood?
      │
      ├─── NO ───► Add more explanation
      │             Add another example if necessary
      │             Add another trace or table if helpful
      │             Repeat until understood
      │
      ▼
Would a CS Lens deepen understanding?
      │
      ├─── YES ──► Add CS Lens
      │
      ▼
Would an SE Lens deepen understanding?
      │
      ├─── YES ──► Add SE Lens
      │
      ▼
Can the learner solve a challenge using ONLY concepts already taught?
      │
      ├─── NO ───► Return to top — teach the missing concept first
      │
      ▼
YES
      │
      ▼
Create Challenge
      │
      ▼
Create Tests
      │
      ▼
More concepts remaining in this lesson?
      │
      ├─── YES ──► Repeat entire algorithm for the next concept
      │
      ▼
NO
      │
      ▼
END LESSON
```

---

## Rule: Concept Introduction

Every concept, construct, built-in function, operator, or syntax the learner may not
know must be defined at the exact point it first appears — not in a glossary, not in
a later step, not assumed from prior experience unless it is in the prerequisite series.

A lesson must never use a concept that has not been taught in:
- the current lesson,
- an earlier level in the current series, or
- a declared prerequisite series.

If a concept is required but has not been taught, the algorithm routes back to the
top and teaches it first.

**Defining a built-in at first use:**

```
char.isalnum() — returns True if the character is a letter or digit, False otherwise.
                 "A".isalnum() → True.  " ".isalnum() → False.
char.lower()   — returns the lowercased version of the character. "A".lower() → "a".
                 Has no effect on digits or punctuation.
```

Names must be descriptive. Single-letter names are only acceptable when they are
established mathematical convention (`c` for Celsius, `x` and `y` for coordinates),
and even then the meaning is stated explicitly on first use.

---

## Rule: Explanations

Explanations are not limited in number or position. Add as many as the concept
requires. Explanations may appear:

- before code (to set up what the learner is about to see)
- after code (to walk through what just happened)
- between examples (to connect one example to the next)
- anywhere they improve learning

**Describing vs Teaching**

A description tells you what something does. Teaching explains why it works, what it
connects to, and what breaks without it.

| Describing | Teaching |
|---|---|
| `type()` returns the type of a value. | `type()` reads the type Python stored alongside the value in memory. Python does not know the type of `x` when it compiles your file — it reads the type at the moment `type(x)` runs. This is what makes dynamic typing work. |

Every explanation should answer: why does this exist, what does it connect to, and
what breaks if it is wrong or missing?

**The Aha Moment**

When a previously taught concept reappears in a new context, name the connection
explicitly. One sentence is enough:

> "`type(value).__name__` — the same `type()` from the previous step, but `.\_\_name\_\_`
> extracts the name as a plain string instead of the type object itself."

**Connections**

- Connect backwards: open by linking to what the learner already knows.
- Connect forwards: hint at what the current concept makes possible.
- Connect to the real world: every concept exists in production software — name where.

**Repetition**

Basic syntax is explained once. After its first appearance, a `for` loop or `if`
statement is used without comment.

Hard concepts are named at every reappearance — one or two sentences connecting the
named concept to the specific code in front of the learner:
- Named CS concepts (recursion, symbol table, hash map, type coercion)
- Named SE principles (separation of concerns, single responsibility, encapsulation)
- Named patterns (dispatch table, factory, observer)
- Mathematical ideas (modular arithmetic, floating-point representation)

**Maximum Extraction**

A code block about `//` is also a block about integer semantics, the difference
between mathematical and integer division, and the historical reason Python 3 changed
`/` to always return a float. Teach as many of those as the step can hold without
losing focus on the primary concept.

The learner should finish each concept knowing:
- What the concept is
- Why it exists
- What it connects to in the language or discipline
- Where they will encounter it again

---

## Rule: Instructional Elements

At any point, use whatever element best serves understanding:

| Element | When to use |
|---|---|
| Prose | Always — the primary vehicle for WHY |
| `text` code block | Execution traces, before-and-after tables, diagrams, step sequences |
| Runnable example | When the concept needs to be seen executing |
| Comparison table | When contrasting two approaches or values |
| Analogy | When the concept maps to something familiar |
| Debug callout | When the concept is best understood by stepping through it |

**Execution Traces**

Write traces as `text` fenced blocks before the runnable code. This lets the learner
predict the output before clicking Run:

```text
left=0 → 'r'   right=6 → 'r'   match → move both inward
left=1 → 'a'   right=5 → 'a'   match → move both inward
left=3           right=3         left < right is False → exit → True
```

**Debug Callouts**

When a concept is best understood by watching variables change during execution, say
so explicitly in the prose:

> **Enable Debug and step through this** — watch `left`, `right`, and `current_sum`
> in the variables panel on the right as each line executes.

Add local variables to the example deliberately when they surface values the debugger
would otherwise hide:

```python
left_char = s[left]    # named so the debugger shows the character, not just the index
right_char = s[right]
```

---

## Rule: Code Examples

A concept may have one example or many. Use as many as understanding requires.

**Quality rules for every runnable example:**

1. **One concept per example.** Do not teach `//`, `%`, and type conversion in one block.
   If they are closely related (a natural pair), they may share a block — but only if
   understanding either one requires the other.

2. **Self-contained.** The example runs without any prior state. No imports from
   other examples, no variables defined in a previous block.

3. **State what it will print before showing the code.** The learner should be able to
   predict the output from the prose before clicking Run. After the code, explain what
   the output demonstrates.

4. **Descriptive variable names.** No `x = 42` unless `x` is a genuine mathematical
   unknown. Use `age = 42`, `temperature = 37.5`, `is_complete = False`. Learners
   acquire naming conventions by seeing them modelled.

5. **Comments only for non-obvious decisions.** `# int` next to `x = 42` adds nothing.
   A comment earns its place by stating something the name and code cannot: why this
   value, why this structure, what breaks if it changes.

6. **4–12 lines.** Longer examples bury the concept in surrounding code. If a concept
   needs more than 12 lines, split it into two sequential examples with prose between them.

7. **Design for the debugger.** If Debug mode would help the learner understand the
   example, add local variables that surface intermediate state so the variables panel
   shows meaningful values at each step.

---

## Rule: CS Lens

Add a CS Lens when algorithmic depth benefits understanding. Topics include:

- Runtime and memory complexity (O(n), O(1), O(n²))
- Correctness proofs and invariants
- Data structure properties (sorted order, contiguous memory, hash tables)
- Computational tradeoffs (time vs space, exact vs approximate)
- Why one algorithm is better than another for this problem

Format: `**CS lens:** ...` in the markdown prose. The parser extracts this into the
Explore tab of the right panel — it does not appear inline in the reading step.

Skip the CS Lens if it adds little value for the concept being taught. It is not
mandatory; it is conditional.

---

## Rule: SE Lens

Add an SE Lens when software engineering considerations are relevant. Topics include:

- Readability and clarity
- API design and naming
- Invariants and preconditions callers must satisfy
- Mutating vs returning (in-place vs copy)
- Testing, debugging, and observability
- When to reach for a different data structure or abstraction
- Production patterns and idioms

Format: `**SE lens:** ...` in the markdown prose. Extracted to the Explore tab.

Skip the SE Lens if it adds little value. Conditional, not mandatory.

---

## Rule: Challenge Generation

A challenge tests whether the learner can apply the concept just taught in a new
context. It is not a repetition of an example. It is a new problem whose solution
requires the concept.

**The challenge must only use concepts already taught in this lesson or prior levels.**
If the intended challenge requires a concept not yet taught, the algorithm routes back
to teaching that concept first.

**Challenge prose must contain:**

1. **The task, stated as a contract.** What function to write, what inputs it takes,
   what it returns. Do not describe the algorithm — describe the behaviour.

2. **Any built-ins or methods the learner will need**, defined the same way as in
   concept steps (name, what it accepts, what it returns, unusual input behaviour).

3. **One clarifying constraint** that prevents a wrong interpretation. "Returns a
   float, not an int." "The empty string is a palindrome."

4. **Nothing else.** No algorithm hints. No step-by-step guidance. The learner reads
   the prose, understands the contract, and writes the code.

**Starter code:**

```challenge
def function_name(descriptive_arg):
    pass
```

- Always include the function signature. Never leave the fence empty.
- Use `pass` for Python, `return null` or `// TODO` for JavaScript/TypeScript.
- Argument names must be descriptive. `c` only if it is accepted mathematical convention.
- If the challenge requires a helper class or stub, include it.
- The starter code must be syntactically valid (runs without error, returns wrong answer).

---

## Rule: Tests

Every challenge has a `test` fence with assertion lines.

**Quality rules:**

1. **4–6 assertions.** Fewer than four under-specifies the contract. More than six
   tests peripheral behaviour.

2. **Cover the zero/identity case.** The input producing the simplest output.
   `rotate_left([], 0)`, `celsius_to_fahrenheit(0) == 32.0`.

3. **Cover at least one typical case.** Representative input from the middle of the domain.

4. **Cover at least one boundary or edge case.** Empty input. Negative numbers.
   The value where behaviour changes.

5. **One assertion per line, no control flow.** No `for` loops, no helper functions.
   Each assertion is independently readable.

6. **No ambiguous floating-point equality** unless the result is mathematically exact
   in IEEE 754. When in doubt, use `round(result, N) == expected`.

7. **Test the contract, not the implementation.** Two different correct implementations
   must both pass all assertions.

8. **The assertions fully specify the function's behaviour** for the inputs they cover.
   A learner who passes all tests should have understood the concept — not reverse-engineered
   the assertions.

---

## Lesson Progression

Lessons move from left to right across this arc. The exact presentation may shift
whenever a different order produces a better educational outcome:

```
Motivation → Introduction → Understanding → Examples → Execution → Analysis → Practice → Verification
```

- **Motivation** — why does this concept exist? What problem does it solve?
- **Introduction** — what is the concept? Name it precisely.
- **Understanding** — how does it work? Traces, tables, walkthroughs.
- **Examples** — see it execute. Predict first, then run, then debug.
- **Execution** — step through it with the debugger. Watch variables change.
- **Analysis** — CS and SE lenses. What does this connect to?
- **Practice** — the challenge. Write code that applies the concept.
- **Verification** — run the tests. Debug if failing.

---

## Checklist

**File format**
- [ ] Frontmatter present — all four fields correct
- [ ] Intro paragraph states the concept, why it matters, and what the learner will be able to do
- [ ] Every `##` step is a concept step or a challenge step — never a mix

**Concept Steps**
- [ ] Every new concept, built-in, or syntax is defined at first use
- [ ] Prose explains WHY the concept exists, not just what it does
- [ ] Execution trace written as a `text` block before the runnable code where helpful
- [ ] Debug callout present when stepping through would aid understanding
- [ ] Every runnable example is self-contained (runs without prior state)
- [ ] Every runnable example is 4–12 lines
- [ ] All variable names are descriptive
- [ ] Comments only appear where the WHY is not obvious from the code
- [ ] Local variables added to examples where they surface useful debugger state
- [ ] Connections backwards, forwards, and to the real world are present
- [ ] CS Lens present where algorithmic depth adds value (in `**CS lens:**` format)
- [ ] SE Lens present where engineering considerations add value (in `**SE lens:**` format)

**Challenge Steps**
- [ ] Challenge uses only concepts already taught in this lesson or prior levels
- [ ] Prose describes the contract (what to build), not the algorithm (how to build it)
- [ ] Any built-ins the learner needs are defined in the challenge prose
- [ ] One clarifying constraint prevents misinterpretation
- [ ] Starter code includes the function signature and a valid empty body
- [ ] Argument names in the starter code are descriptive
- [ ] 4–6 assertions, no more, no fewer
- [ ] Zero/identity case covered
- [ ] At least one typical case covered
- [ ] At least one boundary or edge case covered
- [ ] Each assertion is one line, one `assert`, no control flow
- [ ] No ambiguous floating-point equality
- [ ] Multiple correct implementations would pass all tests

**Teaching quality**
- [ ] Describing vs Teaching: every explanation answers WHY, not just WHAT
- [ ] Aha Moments: reused concepts are named and connected when they reappear
- [ ] Maximum Extraction: secondary insights are surfaced without losing focus
- [ ] Every lesson title names the concept, not the activity
- [ ] Every step title (`##`) describes what the learner will understand after reading it
- [ ] Every challenge title (`## Challenge: ...`) names the task, not the concept

---

_The test: could a learner complete every challenge using only what was taught in this
lesson and prior levels, without looking anything up? If not, the concept step is
incomplete or the challenge arrived too early._
