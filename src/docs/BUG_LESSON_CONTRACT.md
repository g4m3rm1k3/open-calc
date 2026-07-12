# Bug & Suggestion → Lesson Contract

This is the [Lesson Engine Contract](LESSON_ENGINE_CONTRACT.md) — the real one, unedited below —
plus what changes when the source material is a real bug report or feature suggestion from
this app's Feedback & Bugs board, taught by an AI that does not have direct access to this
codebase. Everything in the Lesson Engine Contract section still applies in full. Nothing in
it is softened, shortened, or optional here.

A lesson produced from this document that only describes a fix or summarizes a feature has not
met this contract. Description is not teaching. See "The Difference Between Describing and
Teaching" logic embedded in "What Taught Means" below — the test is the same one this whole
platform holds every lesson to.

---

## What changes for a bug or suggestion

A normal lesson-engine lesson starts from a planned curriculum topic — the author already knows
which concepts they're teaching before they write a line. A bug or suggestion lesson starts from
the opposite direction: real code broke, or someone wants a real feature, and the concept worth
teaching has to be *found* — it's whatever the actual root cause is, or whatever the actual
design decision is, not a topic chosen in advance.

That changes two things, and only two things:

1. **Concept selection is discovery, not planning.** Before the Concept Loop can run, the
   teacher (the AI) has to identify what the root cause or design decision actually is, from
   real code — not guess, not pattern-match against a similar bug it has seen in training data.
2. **The teacher has no file access.** Most contributors will paste this into a free chat AI
   (ChatGPT, Claude.ai) with no tools, no repo attached. Getting real code in front of it is a
   short, practical, one-time step — not a substitute for teaching, and not something to pad out
   into a long back-and-forth. See "Getting Real Code In Front Of The AI" below.

Everything after that — the actual teaching — runs the exact same Concept Loop, the exact same
"What Taught Means" seven-item bar, the exact same atom classification, the exact same
Define-at-Use rule, on whatever concept the bug or suggestion turned out to require.

---

## Before you start

If you haven't completed the **"How to Contribute"** lessons yet (Help button → Feedback & Bugs
→ "Open the lessons"), do that first. This contract assumes you can find your way around an
unfamiliar file, read a React component, and know basic Git.

**App orientation**, so the AI teaching you isn't guessing at the codebase either:

UpSkillOS (repo folder name: `open-calc`) is a free, open-source, browser-native STEM learning
platform — 784 lessons across 31 courses, plus interactive labs, simulators, and games. Stack:
React 18 + Vite + Tailwind CSS, Firebase for auth and cross-device sync, no paid backend. Runs
entirely client-side; Python runs in-browser via Pyodide.

Where things live:
- `src/courses/{course-id}/{N}-{chapter-slug}/{NNN}-{lesson-slug}.js` — the main curriculum
  (calculus, physics, etc). A different JS-object schema from the lesson-engine format below —
  not what this contract produces, but useful to recognize if you land there while searching.
- `src/labs/lesson-engine/` — the short-form lesson runtime this contract's output targets.
- `src/labs/lesson-engine/series.ts` — registers every series (id, label, ordered list of
  `{level, title, file}`).
- `src/labs/lesson-engine/content/{series-id}/level-{N}.md` — the actual lesson files.
- `src/components/`, `src/context/`, `src/hooks/` — shared UI, React context providers (auth,
  theme, progress), and hooks respectively.
- `src/pages/` — top-level routed pages. `src/App.jsx` wires routes to pages.

Local dev: `npm install` then `npm run dev` (Vite, hot reload). `npm run build` before opening a
PR — catches import/reference errors. Contribution workflow: fork the repo, branch off main,
make focused changes, run `npm run build`, push to your fork, open a PR against
`g4m3rm1k3/upskillos`.

---

## Getting real code in front of the AI

This is the only part of the process that is not teaching, and it should be kept brief:

1. Based on the app orientation above and the bug/suggestion report, the AI names the specific
   file(s) most likely involved and asks you to paste their contents (or the output of a
   targeted search — grep for a keyword from the title/description).
2. You paste it back. No invented code, ever — a lesson built on code the AI made up teaches
   the wrong thing, silently, and there is no way for a learner reading it later to know that.
3. Once real code is in front of the AI, this step is done. It should not keep negotiating for
   more files unless the Concept Loop below genuinely requires something it doesn't have —
   that's a sign of a missing prerequisite concept, not a reason to keep collecting files.

Everything from here on is the Lesson Engine Contract, unmodified.

---

## The Lesson Engine Contract (binding, unedited)

### File Format

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

Everything before the first `##` header is the intro paragraph. It merges into the first step
automatically. State what the lesson covers, why it matters, and what the learner will be able
to do. Do not waste it on "In this lesson we will learn about..."

Each `##` header creates one navigable step. Every step is either a **concept step** or a
**challenge step** — never a mix of both.

Fence types the engine recognises:
- ` ```python ` / ` ```js ` / ` ```ts ` / ` ```sql ` — runnable code example
- ` ```text ` — display-only block (execution traces, tables, diagrams) — no Run button
- ` ```challenge ` — editable editor pre-filled with the starter code
- ` ```test ` — assertions run against the learner's code

### What "Taught" Means

A concept is considered **taught** only when the learner has been shown all of the following:

1. **What it is** — a precise name and definition
2. **Why it exists** — the problem it solves; what you would do without it
3. **How it behaves** — including edge cases, failure cases, and surprising behaviour
4. **Where it appears** — in the current code, at the exact line
5. **How it connects** — to concepts already taught in this or prior lessons
6. **What comes next** — a forward hint: what this concept makes possible
7. **At least one concrete example** — runnable, with predicted output

Only after all seven are satisfied may the lesson rely on that concept without reintroducing it.

### The Teaching Atom

Every piece of code — however short — is composed of **atoms**: the smallest units of
understanding a learner must have before the code makes sense.

For a line like `print(total + tax)`, the atoms are:

```text
print()         — built-in function, what it does, what it writes to
variable        — name bound to a value
+               — addition operator, operand types, result type
expression      — a combination of values and operators that evaluates to one value
function call   — syntax: name(arguments), evaluation order
parentheses     — delimit the argument list; not grouping here
stdout          — where print() sends output
```

The lesson loop runs over atoms, not over lines of code.

**Atom classification:**

Every atom in every example falls into one of three tiers:

| Tier | Definition | Required action |
|---|---|---|
| **Language atom** | Syntax, keyword, operator, built-in, method, control flow | Teach at first use; reference briefly on reuse |
| **CS atom** | Algorithm, data structure, complexity, invariant, design decision | Teach at first use; name and connect on every reuse |
| **SE atom** | Naming, readability, API design, testability, production patterns | Add as SE Lens when it deepens understanding |

Language and CS atoms are separate teaching obligations. A line like `left += 1` contains `+=`
(language atom) and "pointer movement preserving an invariant" (CS atom). They are taught
separately.

### Concept Scope

Every concept taught in a lesson has exactly three tiers of scope:

**Primary objectives** — must be fully taught before the learner continues. The challenge tests
these. The checklist verifies these.

**Secondary objectives** — may be introduced briefly when they genuinely deepen understanding of
the primary concept. Not tested. Not required for the challenge.

**Out-of-scope** — acknowledged with one sentence if they arise naturally ("stdout is the output
stream — we cover streams in a later lesson"), then deferred. Never expanded into a full
teaching sequence.

This prevents a lesson about `print()` from becoming a lesson about operating systems, and a
lesson about two pointers from becoming a lesson about memory layout. State the scope at the top
of each step if it is not obvious.

### The Concept Loop

This is the core algorithm. Run it once per concept. Do not advance to the next concept until
every step is complete.

```
─────────────────────────────────────────────────────────────────
CONCEPT LOOP
─────────────────────────────────────────────────────────────────

  SELECT the next concept to teach.

  ├── Already taught in this lesson or a prior level?
  │       YES → Reference briefly if useful. Do not re-explain.
  │              Language atoms: one sentence.
  │              CS atoms: one sentence naming the concept and connecting it to
  │              the current code.
  │       NO  → Continue.
  │
  ├── Does the learner need prerequisite knowledge?
  │       YES → Run the CONCEPT LOOP for the prerequisite first.
  │              Return here when complete.
  │       NO  → Continue.
  │
  ├── INTRODUCE
  │     Name the concept precisely.
  │     State the primary learning objective.
  │     State the scope (primary / secondary / out-of-scope).
  │
  ├── EXPLAIN
  │     Explain WHY the concept exists.
  │     Explain WHAT it does, including edge cases and failure cases.
  │     Add instructional elements that improve understanding:
  │       traces, tables, comparisons, analogies, diagrams, callouts.
  │     Connect backwards to what the learner already knows.
  │
  ├── DEMONSTRATE
  │     Present a runnable code example.
  │
  │     ┌── ATOM CHECK ───────────────────────────────────────────┐
  │     │                                                         │
  │     │  Identify every atom in the example.                    │
  │     │                                                         │
  │     │  For each atom:                                         │
  │     │    Taught? → Reference if CS atom. Skip if language.    │
  │     │    Not taught? → Teach it now (run CONCEPT LOOP).       │
  │     │                                                         │
  │     │  Repeat until every significant atom is accounted for.  │
  │     │                                                         │
  │     └─────────────────────────────────────────────────────────┘
  │
  │     Does the example leave anything important unclear?
  │       YES → Add another example. Run ATOM CHECK again.
  │       NO  → Continue.
  │
  ├── ANALYZE
  │     Would a CS Lens deepen understanding?
  │       YES → Add CS Lens (format: **CS lens:** ...).
  │     Would an SE Lens deepen understanding?
  │       YES → Add SE Lens (format: **SE lens:** ...).
  │
  ├── CONNECT
  │     Connect forwards: what does this concept make possible?
  │     Connect to the real world: where does this appear in production software?
  │
  ├── INSTRUCTIONAL SATURATION CHECK
  │
  │     For every primary learning objective:
  │       □ Named and defined
  │       □ WHY explained
  │       □ HOW it behaves shown (including edge cases)
  │       □ WHERE in the current code it appears
  │       □ Connected to prior concepts
  │       □ Forward hint given
  │       □ At least one concrete example run
  │
  │     All boxes checked?
  │       NO  → Return to EXPLAIN. Add what is missing.
  │       YES → Continue.
  │
  ├── APPLY
  │     Can the learner solve a challenge using ONLY concepts already taught?
  │       NO  → A concept is missing. Return to SELECT. Teach it. Come back.
  │       YES → Create Challenge. Create Tests.
  │
  └── More concepts remaining in this lesson?
          YES → Return to SELECT.
          NO  → END LESSON.
```

### Rule: Code Completeness

A runnable example is not complete simply because it executes correctly.

An example is complete only when every significant atom has either:

- been taught previously (language atoms may be used silently; CS atoms are named),
- been introduced in the current step, or
- been explicitly scoped out with one sentence of deferral.

Significant atoms include: syntax and keywords, operators and their operand types, built-in
functions and methods, control flow, algorithms and data structures, design decisions visible in
the code, naming decisions worth noting.

No significant atom may remain silently unexplained.

### Rule: Concept Introduction

Every atom the learner may not know must be defined at the exact point it first appears — not in
a glossary, not in a later step, not assumed from prior experience unless it is in the
prerequisite series.

**Defining a built-in at first use:**

```
char.isalnum() — returns True if the character is a letter or digit, False otherwise.
                 "A".isalnum() → True.  " ".isalnum() → False.
char.lower()   — returns the lowercased version of the character. "A".lower() → "a".
                 Has no effect on digits or punctuation.
```

Names must be descriptive. Single-letter names are only acceptable when they are established
mathematical convention (`c` for Celsius, `x` and `y` for coordinates), and even then the meaning
is stated explicitly on first use.

### Rule: Instructional Saturation

The stopping condition for explanation is not "enough prose has been written." It is "no primary
learning objective remains unmet."

Continue adding explanations, examples, traces, comparisons, and debugger walkthroughs until
every primary objective satisfies all seven items in the "What Taught Means" definition above.

When in doubt, ask: could the learner complete the challenge without looking anything up, using
only what this step provided? If not, the step is not done.

### Rule: Explanations

Explanations are not limited in number or position. Add as many as the concept requires.
Explanations may appear before code, after code, between examples, or anywhere they improve
learning. There is no required alternating pattern.

**Describing vs Teaching**

| Describing | Teaching |
|---|---|
| `type()` returns the type of a value. | `type()` reads the type Python stored alongside the value in memory. Python does not know the type of `x` when it compiles your file — it reads the type at the moment `type(x)` runs. This is what makes dynamic typing work. |

**The Aha Moment**

When a previously taught concept reappears in a new context, name the connection explicitly. One
sentence is enough:

> "`type(value).__name__` — the same `type()` from the previous step, but `.__name__` extracts
> the name as a plain string instead of the type object itself."

**Repetition**

Language atoms are explained once. After first appearance, a `for` loop or `if` statement is
used without comment.

CS atoms are named at every reappearance — one or two sentences connecting the concept to the
specific code in front of the learner. Named CS concepts include: recursion, symbol tables, hash
maps, type coercion, invariants, complexity classes, and any named design pattern or SE
principle.

### Rule: Instructional Elements

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

Write traces as `text` fenced blocks before the runnable code. This lets the learner predict the
output before clicking Run:

```text
left=0 → 'r'   right=6 → 'r'   match → move both inward
left=1 → 'a'   right=5 → 'a'   match → move both inward
left=3           right=3         left < right is False → exit → True
```

**Debug Callouts**

When a concept is best understood by watching variables change during execution:

> **Enable Debug and step through this** — watch `left`, `right`, and `current_sum` in the
> variables panel on the right as each line executes.

Add local variables to the example deliberately when they surface values the debugger would
otherwise hide:

```python
left_char = s[left]    # named so the debugger shows the character, not just the index
right_char = s[right]
```

### Rule: Code Examples

A concept may have one example or many. Use as many as understanding requires. Examples should
increase understanding, not repeat identical information.

1. **One concept per example.** Closely related atoms may share a block only if understanding
   one requires the other.
2. **Self-contained.** The example runs without any prior state.
3. **State what it will print before showing the code.** After the code, explain what the
   output demonstrates.
4. **Descriptive variable names.** `age = 42`, not `x = 42`.
5. **Comments only for non-obvious decisions.** A comment earns its place by stating something
   the name and code cannot.
6. **4–12 lines.** If a concept needs more, split into two examples with prose between them.
7. **Design for the debugger.** Add local variables that surface intermediate state so the
   variables panel shows meaningful values at each step.

### Rule: CS Lens

Add a CS Lens when algorithmic depth benefits understanding: runtime and memory complexity
(O(n), O(1), O(n²)); correctness proofs and invariants; data structure properties; computational
tradeoffs (time vs space, exact vs approximate); why one algorithm is better than another for
this problem.

Format: `**CS lens:** ...` in the markdown prose. Skip if it adds little value. Conditional, not
mandatory.

### Rule: SE Lens

Add an SE Lens when software engineering considerations are relevant: readability and naming;
API design and invariants callers must satisfy; mutating vs returning; testing, debugging,
observability; when to reach for a different abstraction; production patterns and idioms.

Format: `**SE lens:** ...` in the markdown prose. Skip if it adds little value. Conditional, not
mandatory.

### Rule: Challenge Generation

A challenge tests whether the learner can apply the concept in a new context. It is not a
repetition of an example.

**The challenge must only use concepts already taught in this lesson or prior levels.** The
concept loop gates this: if a concept is missing, the loop routes back to teach it before
creating the challenge.

**Challenge prose must contain:**

1. **The task, stated as a contract.** What function to write, what inputs it takes, what it
   returns. Do not describe the algorithm.
2. **Any built-ins the learner will need**, defined the same way as in concept steps.
3. **One clarifying constraint** that prevents wrong interpretation.
4. **Nothing else.** No algorithm hints. No step-by-step guidance.

**Starter code rules:**

- Always include the function signature. Never leave the fence empty.
- Use `pass` for Python, `// TODO` for JavaScript/TypeScript.
- Argument names must be descriptive.
- The starter code must be syntactically valid (runs without error, returns wrong answer).

### Rule: Tests

Every challenge has a `test` fence with assertion lines.

1. **4–6 assertions.** Fewer under-specifies; more tests peripheral behaviour.
2. **Cover the zero/identity case.**
3. **Cover at least one typical case.**
4. **Cover at least one boundary or edge case.**
5. **One assertion per line, no control flow.**
6. **No ambiguous floating-point equality** — use `round(result, N) == expected`.
7. **Test the contract, not the implementation.** Two different correct implementations must
   both pass all assertions.
8. **The assertions fully specify the function's behaviour** for the inputs they cover.

### Lesson Progression

```
Motivation → Introduction → Understanding → Examples → Execution → Analysis → Practice → Verification
```

The exact order may shift when a different order produces a better educational outcome. The
concept loop enforces completeness regardless of order.

### Checklist

**File format**
- [ ] Frontmatter present — all four fields correct
- [ ] Intro paragraph states the concept, why it matters, and what the learner will be able to do
- [ ] Every `##` step is a concept step or a challenge step — never a mix

**Concept Steps**
- [ ] Scope declared (primary / secondary / out-of-scope) for each concept
- [ ] Every atom in every example is either taught, referenced, or explicitly deferred
- [ ] Language atoms defined at first use; CS atoms named at every appearance
- [ ] Prose explains WHY, not just WHAT
- [ ] Instructional saturation check passed: every primary objective meets all 7 criteria
- [ ] Execution trace written as a `text` block where helpful
- [ ] Debug callout present when stepping through would aid understanding
- [ ] Every runnable example is self-contained (4–12 lines, descriptive names)
- [ ] Connections backwards, forwards, and to the real world are present
- [ ] CS Lens added where algorithmic depth adds value
- [ ] SE Lens added where engineering considerations add value

**Challenge Steps**
- [ ] Challenge uses only concepts already taught in this lesson or prior levels
- [ ] Prose describes the contract, not the algorithm
- [ ] Any built-ins the learner needs are defined in the challenge prose
- [ ] One clarifying constraint present
- [ ] Starter code includes the function signature and a valid empty body
- [ ] Argument names in the starter code are descriptive
- [ ] 4–6 assertions
- [ ] Zero/identity case, typical case, and boundary/edge case covered
- [ ] Each assertion is one line, no control flow
- [ ] No ambiguous floating-point equality
- [ ] Multiple correct implementations pass all tests

**Teaching quality**
- [ ] Every explanation answers WHY, not just WHAT
- [ ] Reused concepts are named and connected (Aha Moment rule)
- [ ] Secondary insights surfaced without losing primary focus
- [ ] Every step title describes what the learner will understand after reading it
- [ ] Every challenge title names the task, not the concept

---

## Applying this to a bug report

The concept to teach is whatever the **real root cause** turns out to be — not "here's the fix."
Once real code is in front of you (see "Getting Real Code In Front Of The AI"):

1. Determine the actual root cause. Not the symptom the reporter described — the mechanism.
2. Identify what concept(s) that root cause embodies (a language atom? a CS atom — a race
   condition, a stale closure, an off-by-one, a missing null check as a symbol-table lookup
   failure? an SE atom — a violated invariant, a leaky abstraction?).
3. Run the Concept Loop on that concept, using the real broken code and the real fixed code as
   the DEMONSTRATE examples. The fix itself becomes the worked example.
4. The challenge (if the lesson includes one) should be a different, small instance of the same
   class of bug — not the exact same bug restated.

## Applying this to a suggestion

The concept to teach is the **design decision** — which existing pattern in this codebase the
feature should follow or reuse, and why that pattern fits.

1. Determine how this would actually be built here — which files it would touch, which existing
   component/hook/pattern is the closest analog.
2. Identify the concept(s) that decision embodies (an SE atom, usually — API design, composition,
   where state should live; sometimes a CS atom if the feature has real algorithmic content).
3. Run the Concept Loop on that decision, using a real or realistic implementation as the
   DEMONSTRATE example — grounded in actual patterns from this codebase, not invented from
   scratch.
4. The challenge (if included) asks the learner to apply the same pattern to a small, different
   feature — not to implement the original suggestion verbatim.

---

## Deliverable

One lesson-engine Markdown file (frontmatter + body) that satisfies every rule above in full,
built from real code, plus a one-line note on where to register it in `series.ts` (an existing
series, or a proposed new one) and why.

*The test, same as the original: could a person who has never worked on this codebase read this
lesson and explain — in their own words — what the code does, why it is written that way, what
it connects to, and where they will see this concept again? If not, the lesson is not finished.*
