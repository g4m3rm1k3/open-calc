# UpskillOS Curriculum Contract

This is the single governing document for how UpskillOS curriculum gets built, from a
topic name to a finished, working lesson in the engine. It replaces three separate files
(`CURRICULUM_EXPANSION_CONTRACT.md`, `SERIES_CONTRACT.md`, `LESSON_ENGINE_CONTRACT.md`)
that used to duplicate — and slowly drift from — the same core teaching checklist. There
is now exactly one canonical version of that checklist (Part 0), referenced everywhere
else in this document instead of restated.

Project status, curriculum priority, and architecture notes live separately in
`LESSON_ENGINE_ROADMAP.md` — that document changes as work ships; this one does not. Do
not merge them: conflating "the eternal rules for writing a lesson" with "what's built
so far" is exactly why the roadmap went stale before.

## The Pipeline

Building a series always happens in this order. Each part governs one phase and hands
off a concrete artifact to the next:

```
Part 1 — Decompose a topic into a dependency graph of atomic nodes
              │
              ▼
Part 2 — Sequence atomic nodes into a series (classification, scope, prerequisites)
              │
              ▼
Part 3 — Write each node as one lesson file, to the engine's exact format
              │
              ▼
Part 4 — Know what the engine can actually grade before you write a test fence
```

Skipping a part produces predictable failures: skip Part 1 and you get a Wikipedia
outline instead of a curriculum; skip Part 2 and a series either duplicates another
series or assumes knowledge the learner doesn't have yet; skip Part 3 and you get prose
with a text box at the end, not a lesson; skip Part 4 and you ship a "Run Tests" button
that cannot pass no matter what the learner writes.

---

# Part 0 — The Taught Checklist (canonical)

A concept — at any level, in any part of this pipeline — is **taught** only when all of
the following are true. This is the one list; Parts 2 and 3 both reference it instead of
restating their own versions.

1. **What it is** — a precise name and definition.
2. **Why it exists** — the problem it solves; what you would do without it.
3. **Mental model** — how to picture it; the standard model professionals use; what
   wrong models beginners form and what corrects them.
4. **How it behaves** — during execution, including edge cases, failure cases, and
   surprising behaviour.
5. **Where it appears** — in the current code, at the exact line (lesson level) or in
   real production code (series level).
6. **Usage** — when to reach for it; idiomatic patterns.
7. **Non-usage** — when NOT to use it; what misuse looks like. Knowing what to avoid is
   as much professional knowledge as knowing what to use.
8. **How to debug it** — how to inspect and reason about failures; what the debugger or
   logs show.
9. **Common mistakes** — typical incorrect assumptions, at beginner through experienced
   level, and what corrects each one.
10. **Professional practice** — how experienced practitioners actually apply it, as
    distinct from the textbook description.
11. **Connections** — backwards to concepts already taught, forwards to what this makes
    possible, and where it reappears later in the curriculum.
12. **At least one concrete, runnable example with predicted output** (lesson level —
    a series-level concept is satisfied once some lesson in the series does this).

Only after all applicable items are satisfied may later material rely on the concept
without reintroducing it. Skip an item only when it genuinely does not apply (e.g. "how
to debug it" may not apply to a pure naming convention) — not because it's inconvenient.

**The test, at any level:** run this checklist mentally for every concept. Could the
learner explain it back using only what was shown? If not, it is not taught yet.

---

# Part 1 — Curriculum Decomposition

Governs how a topic becomes a dependency graph of atomic, single-lesson nodes. Run this
before Part 2. A topic list is not a curriculum; a Wikipedia outline is not a curriculum.
A curriculum is a fully decomposed dependency graph where every node is a single
teachable unit with no hidden prerequisites.

## The Stopping Rule

> A topic is fully decomposed only when every remaining node can be taught in a single
> lesson without introducing additional unexplained concepts.

If teaching node X requires explaining Y, then Y must be its own node that appears
earlier in the dependency graph. No concept may be assumed.

## The Algorithm

**Step 1 — Name the topic.** State it as a noun or noun phrase: `Hash Tables`,
`Functions`, `The Call Stack`, `Closures`.

**Step 2 — Expand into dimensions.** For every topic, expand across every dimension
below. Do not invent headings — work through the checklist. Every applicable dimension
becomes one or more child nodes.

**Step 3 — Recurse.** For every child node that is not yet atomic (cannot be taught in
one lesson without introducing unexplained concepts), return to Step 1.

**Step 4 — Verify completeness.** Before finalising any branch: Is every prerequisite
concept present as an earlier node? Is there professional knowledge a working engineer
uses that isn't in a node? Can every node be taught in one lesson end to end, without
deferring explanation? If any answer is no, expand further.

**Step 5 — Assign to lessons.** Each atomic node becomes one lesson, ordered by the
dependency graph (prerequisites before dependents). Each lesson must satisfy Part 3.

## The Expansion Dimensions

Apply every applicable dimension to every topic being decomposed. Skip a dimension only
if it genuinely does not apply.

| Dimension | Ask |
|---|---|
| Purpose | What problem existed before this? What does it make possible? Why was someone motivated to invent it? |
| History | When and why was this invented? State of the field before/after? Who built it and why does that matter? |
| Mental Model | How should a learner picture this? What analogy makes it stick? What wrong models do beginners form? |
| Vocabulary | What terms must the learner know first? What terms does this introduce? What's commonly confused? |
| Anatomy | What are the parts? What does each part do? How do they relate? Draw it, label it, name everything. |
| Execution | What happens step by step when this runs? Trace a minimal example at the relevant abstraction level. |
| Construction | How is this built from scratch? What decisions must be made, and what are their consequences? |
| Interface | What does the public API look like? What does a caller see vs what's hidden? What contract is exposed? |
| Memory Layout | Where does this live in memory? How much space? What's the allocation pattern and lifetime? |
| Usage | When do professionals reach for this? What does idiomatic usage look like in real codebases? |
| Non-Usage | When should you NOT use this? What are the signs it's the wrong tool? What does misuse look like? |
| Alternatives | What competes with this? When is each alternative preferred? What did this replace historically? |
| Tradeoffs | What does this cost, what does it give? Where does it break down at scale? Known failure modes? |
| Performance | Time/space complexity (best/average/worst). Constant factors. Cache behaviour. How does it scale? |
| Debugging | How does this fail? Symptoms of each failure mode? How do professionals inspect it at runtime? |
| Common Mistakes | What do beginners/intermediate/experienced developers each get wrong, why, and how is it fixed? |
| Idioms | What are the professional patterns and conventions? Production codebase vs tutorial? |
| Connections | Prerequisites? What builds on this? What CS principle does this exemplify? |
| Exercises | Guided (scaffolded path), partially guided (approach suggested), independent (spec only). |
| Projects | Where does this appear in real software? What would a professional build requiring mastery of it? |

## Verification Checklist

- [ ] Every dimension above considered (and consciously skipped if inapplicable)
- [ ] Every node is atomic — one lesson, no hidden prerequisites
- [ ] Every prerequisite node exists earlier in the graph
- [ ] No professional knowledge is hidden inside a node that seems simple
- [ ] The execution path exists — traceable from input to output
- [ ] The failure path exists — at least one failure mode is traceable
- [ ] The connection to broader CS/SE principles is explicit
- [ ] The non-usage case is present

## Anti-Patterns

**The Wikipedia Outline** — listing sub-topics at one level with no recursion.
`Hash Tables → hash function, collisions, chaining` is not a curriculum.

**The Assumed Prerequisite** — teaching closures without first teaching scope and
lifetime as separate lessons; teaching Big-O without first teaching "a function growing
over input size."

**The Missing Failure Mode** — teaching a data structure without teaching how it fails,
its symptoms, and how a developer diagnoses it in production.

**The Missing Non-Usage** — teaching when to use something without teaching when not to.

**The Shallow History** — skipping why something was invented. History is the motivation
that makes a concept land, not trivia.

**The Missing Professional Layer** — teaching the textbook concept without the
professional idioms and mistakes that separate reading about it from having shipped it.

**The Premature Atomic Node** — calling a node atomic when it still introduces
unexplained concepts mid-lesson. Apply the stopping rule strictly.

## Example Decomposition — Hash Tables (partial)

```
Hash Tables
├── Purpose
│   ├── O(1) lookup as a design goal (atomic)
│   └── Problems with arrays and linked lists for lookup (atomic)
├── History
│   └── From associative arrays to hash maps in hardware and software (atomic)
├── Mental Model
│   └── Buckets and labels — the post office analogy (atomic)
├── Hash Functions
│   ├── What hashing is — deterministic mapping (atomic)
│   ├── Why uniform distribution matters
│   │   ├── What uniform distribution means (atomic)
│   │   ├── Why clustering hurts performance (atomic)
│   │   └── Visualising distribution (atomic)
│   ├── Modulo and bucket assignment (atomic)
│   ├── Good vs bad hash functions (atomic)
│   ├── Cryptographic vs non-cryptographic hashing (atomic)
│   └── Real examples — djb2, FNV, MurmurHash (atomic)
├── Collisions
│   ├── Why collisions are inevitable (atomic)
│   ├── Separate chaining (atomic)
│   ├── Open addressing
│   │   ├── Linear probing (atomic)
│   │   ├── Quadratic probing (atomic)
│   │   └── Double hashing (atomic)
│   └── Robin Hood hashing (atomic)
├── Memory Layout
│   ├── The bucket array in memory (atomic)
│   └── Node allocation for chaining (atomic)
├── Load Factor and Resizing
│   ├── What load factor is (atomic)
│   ├── When to resize (atomic)
│   └── Rehashing — the full reshuffle (atomic)
├── Performance
│   ├── Average case O(1) — why and when (atomic)
│   ├── Worst case O(n) — when it happens (atomic)
│   └── Amortised analysis of resize cost (atomic)
├── Tradeoffs
│   └── Hash map vs tree map — ordered vs unordered (atomic)
├── Debugging
│   ├── Recognising hash collision degradation (atomic)
│   └── Inspecting a hash map in a debugger (atomic)
├── Common Mistakes
│   ├── Mutable keys (atomic)
│   ├── Missing hashCode/equals contract (atomic)
│   └── Over-relying on default hash for custom objects (atomic)
├── Professional Usage
│   ├── Caches (atomic)
│   ├── Frequency counting (atomic)
│   └── Deduplication (atomic)
└── Connections
    ├── Arrays (prerequisite)
    ├── Linked lists (prerequisite for chaining)
    ├── Pointers and memory (prerequisite)
    ├── Big-O notation (prerequisite)
    └── Sets (unlocked)
```

A surface decomposition would have produced 6 lessons from this topic. Proper recursion
produces roughly 30.

---

# Part 2 — Series Completeness

Governs what it means for a series (the sequenced output of Part 1) to completely teach
a subject. Language-agnostic — applies to programming languages, CS topics, and SE
topics alike. Does not define lesson formatting — that's Part 3.

## Core Principle

Every series must teach the complete intellectual foundation of its subject — not just
commonly-presented beginner material, but the concepts, mental models, execution
behaviour, idioms, edge cases, and professional reasoning fundamental to the subject
itself. A learner who completes the series should understand how the subject works, not
merely how to copy its syntax.

## Series Classification

Every series is exactly one of three types, which determines its internal structure:

| Type | Focus | Examples |
|---|---|---|
| **Language** | Syntax, semantics, execution model, idioms | Python Fundamentals, JavaScript Fundamentals, SQL Fundamentals |
| **Platform** | APIs, runtime behaviour, platform integration | HTML & DOM, Browser APIs, HTTP |
| **Discipline** | Mental models, patterns, trade-offs, engineering decisions | CSS Layout, Data Structures, Software Design |

## Organise by Dependency, Not by Technology

Do not create one large "CSS" series or one large "JavaScript" series. Identify the
subject's dependency graph and make each node its own series — smaller, cohesive,
learnable in one sitting, with a clean prerequisite chain.

**Example — CSS dependency graph:**
```
CSS Fundamentals
      │
      ├──────────────┐
      ▼              ▼
CSS Selectors    CSS Box Model
      │              │
      └──────┬───────┘
             ▼
     CSS Layout Fundamentals
             │
     ┌───────┴───────┐
     ▼               ▼
CSS Flexbox       CSS Grid
     │               │
     └───────┬───────┘
             ▼
   CSS Responsive Design
             │
     ┌───────┴────────┐
     ▼                ▼
CSS Animation    CSS Visual Design
             └──────────┘
                   ▼
          CSS Professional
```

**Example — JavaScript dependency graph:**
```
JavaScript Fundamentals → Functions → Objects → Arrays
                                                  ↓
                         DOM Manipulation → Events → Async JavaScript → Modules
```

Each series in the graph gets its own `series.ts` entry, its own folder in `content/`,
and explicit prerequisites listed in its description.

## Scope

A series teaches only concepts belonging to its subject:

| Series | In Scope | Out of Scope |
|---|---|---|
| Python Fundamentals | Objects, functions, modules, exceptions, idioms, debugging Python | Git, Docker, cloud deployment, editor config |
| JavaScript Fundamentals | Closures, prototypes, async execution, modules, idioms | React, npm, webpack, Node-specific APIs |
| DOM Manipulation | Document, nodes, events, traversal, mutation, rendering | React, Vue, build tools |
| Data Structures & Algorithms | Arrays, linked lists, stacks, queues, hash tables, trees | Git workflows, deployment pipelines |

## Series Independence

Every series begins assuming zero prior knowledge unless prerequisites are explicitly
declared. A learner must be able to start any series without completing unrelated ones.
Valid: `DOM Manipulation → requires JavaScript Fundamentals`. Invalid:
`Data Structures → requires Git Basics`.

## What Every Series Must Teach

For every major concept, apply the **Part 0 Taught Checklist**. A series is complete
only if a learner can, for every major concept, answer: what problem does this solve,
why was it designed this way, what happens during execution, how would I debug it, what
are the common mistakes, how do professionals use it, how does it connect to the rest of
the subject, and when should I choose something else instead? If any major concept fails
this test, the series is incomplete.

## Hidden Curriculum Requirement

Every series must deliberately include knowledge experienced practitioners consider
fundamental but introductory courses often omit: language idioms and conventions, edge
cases and surprising behaviour, execution model details, historical design rationale,
debugging strategies, professional naming conventions, performance trade-offs, mutation
vs immutability, reference vs value behaviour, and misconceptions that persist beyond
beginner level. The hidden curriculum must remain inside the subject's scope.

## Progressive Depth

Advanced ideas should not be avoided — introduce them as soon as they become
understandable. Early lessons build intuition; later lessons revisit the same concept
with greater precision.

**Example:** Early — "A variable points to a value." Later — "A variable stores a
reference to an object." Still later — "Multiple variables may reference the same
mutable object, creating aliasing."

## Curriculum Mining

Do not rely solely on official documentation or popular beginner tutorials. Synthesise
from language/protocol specifications, standard libraries and style guides, production
codebases, books, conference talks, issue trackers, historical discussions, and
experienced practitioner knowledge — capturing both explicit design and implicit
professional knowledge.

## One-Sentence Directive

> When generating an UpskillOS series, teach the complete intellectual foundation of the
> subject itself: include the core concepts, execution model, idioms, edge cases, common
> misconceptions, debugging strategies, professional practices, historical rationale, and
> computer science connections that are fundamental to understanding the subject, while
> excluding tools, workflows, and technologies that belong to separate series unless they
> are explicit prerequisites.

---

# Part 3 — Lesson Authoring

Governs how a single atomic node (from Part 1, sequenced by Part 2) becomes one lesson
file in the engine. Not a style guide — a deterministic teaching algorithm. A lesson
that doesn't follow this is a wall of text with a text box at the end.

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
- `lang` — default language for code fences (`python`, `javascript`, `typescript`, `sql`, etc.).

Everything before the first `##` header is the intro paragraph. It merges into the first
step automatically. State what the lesson covers, why it matters, and what the learner
will be able to do. Do not waste it on "In this lesson we will learn about..."

Each `##` header creates one navigable step. Every step is either a **concept step** or
a **challenge step** — never a mix of both. A concept step needs no code fences at all —
pure reading content (a `text` block for a diagram, or nothing) is a complete, valid
concept step. There is no separate "markdown-only lesson" type to reach for; this is it.

Fence types the engine recognises:
- `` ```python `` / `` ```js `` / `` ```ts `` / `` ```sql `` / `` ```css `` / `` ```html `` / `` ```c `` / `` ```cpp `` / `` ```csharp `` / `` ```java `` / `` ```bash `` — runnable code example
- `` ```text `` — display-only block (execution traces, tables, diagrams) — no Run button
- `` ```challenge `` — editable editor pre-filled with the starter code
- `` ```test `` — assertions run against the learner's code

**The `` ```challenge `` tag is mandatory and literal.** The editable/graded code block
must be fenced with the word `challenge` itself — never with the language name (e.g.
`` ```sql `` instead of `` ```challenge ``). The parser only recognises the literal tag;
a language-tagged fence in a challenge step is parsed as a display-only example, and the
step ends up with a `null` challenge — the engine falls back to Python as the editor
language and an empty starter, and the challenge silently breaks. This exact mistake
shipped in `sql-fundamentals`, `typescript-fundamentals`, `css-professional`, and
`css-visual-design` (fixed). If a step has a `` ```test `` fence, it must also have a
`` ```challenge `` fence, or the test cannot run against anything.

**Challenge language: say it explicitly, don't rely on inference.** By default the
challenge's graded language is inferred from whichever runnable fence immediately
precedes it — fragile, because a scenario-style challenge (the learner fills in a JS
object literal describing what they'd type, not code in the lesson's primary language —
the pattern used by `git-version-control`, `git-advanced`, and parts of
`contributor-series`) can inherit the wrong language from an unrelated context example
placed right before it. Write the language explicitly instead:

```
```challenge javascript
const messages = { good1: '' }
```
```

An explicit second token on the `` ```challenge `` fence always wins over inference.
Fences with no second token behave exactly as before (inferred from the preceding fence,
falling back to the lesson's `lang`).

## The Concept Loop

The core algorithm. Run it once per concept. Do not advance to the next concept until
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
  │     Run the Part 0 Taught Checklist against every primary learning objective.
  │
  │     All items satisfied?
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

## The Teaching Atom

Every piece of code — however short — is composed of **atoms**: the smallest units of
understanding a learner must have before the code makes sense. For a line like
`print(total + tax)`, the atoms are:

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

**Atom classification** — every atom falls into one of three tiers:

| Tier | Definition | Required action |
|---|---|---|
| **Language atom** | Syntax, keyword, operator, built-in, method, control flow | Teach at first use; reference briefly on reuse |
| **CS atom** | Algorithm, data structure, complexity, invariant, design decision | Teach at first use; name and connect on every reuse |
| **SE atom** | Naming, readability, API design, testability, production patterns | Add as SE Lens when it deepens understanding |

Language and CS atoms are separate teaching obligations. `left += 1` contains `+=`
(language atom) and "pointer movement preserving an invariant" (CS atom) — taught
separately.

## Concept Scope

Every concept has exactly three tiers of scope:

**Primary objectives** — must be fully taught before the learner continues. The
challenge tests these. The checklist verifies these.

**Secondary objectives** — may be introduced briefly when they genuinely deepen
understanding of the primary concept. Not tested. Not required for the challenge.

**Out-of-scope** — acknowledged with one sentence if they arise naturally ("stdout is
the output stream — we cover streams in a later lesson"), then deferred. Never expanded
into a full teaching sequence. State the scope at the top of each step if not obvious.

## Rule: Code Completeness

A runnable example is not complete simply because it executes correctly. It is complete
only when every significant atom has either been taught previously (language atoms may
be used silently; CS atoms are named), been introduced in the current step, or been
explicitly scoped out with one sentence of deferral. Significant atoms include syntax
and keywords, operators and operand types, built-in functions and methods, control flow,
algorithms and data structures, design decisions visible in the code, and naming
decisions worth noting. No significant atom may remain silently unexplained.

## Rule: Concept Introduction

Every atom the learner may not know must be defined at the exact point it first
appears — not in a glossary, not in a later step, not assumed from prior experience
unless it is in the prerequisite series.

**Defining a built-in at first use:**

```
char.isalnum() — returns True if the character is a letter or digit, False otherwise.
                 "A".isalnum() → True.  " ".isalnum() → False.
char.lower()   — returns the lowercased version of the character. "A".lower() → "a".
                 Has no effect on digits or punctuation.
```

Names must be descriptive. Single-letter names are only acceptable when established
mathematical convention (`c` for Celsius, `x`/`y` for coordinates), and even then the
meaning is stated explicitly on first use.

## Rule: Instructional Saturation

The stopping condition for explanation is not "enough prose has been written." It is
"no primary learning objective remains unmet" — the Part 0 checklist, fully satisfied.
When in doubt: could the learner complete the challenge without looking anything up,
using only what this step provided? If not, the step is not done.

## Rule: Explanations

Explanations are not limited in number or position. Add as many as the concept
requires, before code, after code, between examples, or anywhere they improve learning.
No required alternating pattern.

**Describing vs Teaching**

| Describing | Teaching |
|---|---|
| `type()` returns the type of a value. | `type()` reads the type Python stored alongside the value in memory. Python does not know the type of `x` when it compiles your file — it reads the type at the moment `type(x)` runs. This is what makes dynamic typing work. |

**The Aha Moment** — when a previously taught concept reappears in a new context, name
the connection explicitly. One sentence is enough:

> "`type(value).__name__` — the same `type()` from the previous step, but `.__name__`
> extracts the name as a plain string instead of the type object itself."

**Repetition** — language atoms are explained once; after first appearance, a `for` loop
or `if` statement is used without comment. CS atoms are named at every reappearance —
one or two sentences connecting the concept to the specific code in front of the
learner. Named CS concepts include recursion, symbol tables, hash maps, type coercion,
invariants, complexity classes, and any named design pattern or SE principle.

## Rule: Instructional Elements

| Element | When to use |
|---|---|
| Prose | Always — the primary vehicle for WHY |
| `text` code block | Execution traces, before-and-after tables, diagrams, step sequences |
| Runnable example | When the concept needs to be seen executing |
| Comparison table | When contrasting two approaches or values |
| Analogy | When the concept maps to something familiar |
| Debug callout | When the concept is best understood by stepping through it |

**Execution Traces** — write as `text` fenced blocks before the runnable code, so the
learner can predict the output before clicking Run:

```text
left=0 → 'r'   right=6 → 'r'   match → move both inward
left=1 → 'a'   right=5 → 'a'   match → move both inward
left=3           right=3         left < right is False → exit → True
```

**Debug Callouts** — when a concept is best understood by watching variables change:

> **Enable Debug and step through this** — watch `left`, `right`, and `current_sum`
> in the variables panel on the right as each line executes.

Add local variables deliberately when they surface values the debugger would otherwise
hide:

```python
left_char = s[left]    # named so the debugger shows the character, not just the index
right_char = s[right]
```

## Rule: Code Examples

1. **One concept per example.** Closely related atoms may share a block only if
   understanding one requires the other.
2. **Self-contained.** The example runs without any prior state.
3. **State what it will print before showing the code.** After the code, explain what
   the output demonstrates.
4. **Descriptive variable names.** `age = 42`, not `x = 42`.
5. **Comments only for non-obvious decisions.** A comment earns its place by stating
   something the name and code cannot.
6. **4–12 lines.** If a concept needs more, split into two examples with prose between them.
7. **Design for the debugger.** Add local variables that surface intermediate state so
   the variables panel shows meaningful values at each step.

## Rule: CS Lens / SE Lens

Add a **CS Lens** (`**CS lens:** ...`) when algorithmic depth benefits understanding:
runtime/memory complexity, correctness proofs and invariants, data structure
properties, computational tradeoffs, why one algorithm beats another here.

Add an **SE Lens** (`**SE lens:** ...`) when engineering considerations are relevant:
readability and naming, API design and invariants callers must satisfy, mutating vs
returning, testing/debugging/observability, when to reach for a different abstraction,
production patterns and idioms.

Both are conditional — skip if they add little value.

## Rule: Challenge Generation

A challenge tests whether the learner can apply the concept in a new context. It is not
a repetition of an example. **The challenge must only use concepts already taught in
this lesson or prior levels** — the concept loop gates this.

**Challenge prose must contain:**
1. **The task, stated as a contract.** What function to write, what inputs it takes,
   what it returns. Do not describe the algorithm.
2. **Any built-ins the learner will need**, defined the same way as in concept steps.
3. **One clarifying constraint** that prevents wrong interpretation.
4. **Nothing else.** No algorithm hints. No step-by-step guidance.

**Starter code rules:**
- Always include the function signature. Never leave the fence empty.
- Use `pass` for Python, `// TODO` for JavaScript/TypeScript.
- Argument names must be descriptive.
- The starter code must be syntactically valid (runs without error, returns wrong answer).

## Rule: Tests

Every challenge has a `test` fence with assertion lines. **The grading mechanism is
different per language, and the engine only implements some of them** — see Part 4 for
the current per-language support table before writing a `test` fence in a new language.
An assertion style the engine can't execute produces a challenge that looks correct in
the markdown and is silently broken for every learner who clicks Run.

For a language the engine can grade:

1. **4–6 assertions.** Fewer under-specifies; more tests peripheral behaviour.
2. **Cover the zero/identity case.**
3. **Cover at least one typical case.**
4. **Cover at least one boundary or edge case.** If the challenge prose defines more
   than one branch/category of behaviour, at least one assertion must exercise every
   branch — an untested branch can be silently wrong and every test still passes.
5. **One assertion per line, no control flow.** Setup/preamble lines between assertions
   (`const i1 = im.report(...)` before several `assert i1....` lines, then more setup,
   then more assertions) are fine and run in their exact source order, interleaved with
   the assertions — this is the standard way to test a sequence of stateful operations.
   A trailing `// comment` explaining what an assertion checks is also fine and
   encouraged. What "no control flow" forbids is wrapping assertions yourself in
   `if`/`for`/`while` — every assertion must run unconditionally.
6. **No ambiguous floating-point equality** — use `round(result, N) == expected`.
7. **Test the contract, not the implementation.** Two different correct implementations
   must both pass all assertions.
8. **The assertions fully specify the function's behaviour** for the inputs they cover.
9. **The example output you claim it prints must actually be what the code prints.** If
   the real output is non-deterministic (concurrency, `Math.random()`, timing), do not
   show one ordering as *the* output — caption it as one possible ordering, or
   restructure the example to be deterministic. Trace it by hand (or run it) before
   publishing.

## Lesson Progression

```
Motivation → Introduction → Understanding → Examples → Execution → Analysis → Practice → Verification
```

The exact order may shift when a different order produces a better educational outcome.
The concept loop enforces completeness regardless of order.

## Checklist

**File format**
- [ ] Frontmatter present — all four fields correct
- [ ] Intro paragraph states the concept, why it matters, and what the learner will be able to do
- [ ] Every `##` step is a concept step or a challenge step — never a mix
- [ ] Challenge fence is literally `` ```challenge ``, never a language name
- [ ] Challenge language is explicit whenever inference from the preceding fence would be wrong

**Concept Steps**
- [ ] Scope declared (primary / secondary / out-of-scope) for each concept
- [ ] Every atom in every example is either taught, referenced, or explicitly deferred
- [ ] Language atoms defined at first use; CS atoms named at every appearance
- [ ] Prose explains WHY, not just WHAT
- [ ] Part 0 Taught Checklist satisfied for every primary objective
- [ ] Execution trace written as a `text` block where helpful
- [ ] Debug callout present when stepping through would aid understanding
- [ ] Every runnable example is self-contained (4–12 lines, descriptive names)
- [ ] Connections backwards, forwards, and to the real world are present
- [ ] CS Lens / SE Lens added where they add value

**Challenge Steps**
- [ ] Challenge uses only concepts already taught in this lesson or prior levels
- [ ] Prose describes the contract, not the algorithm
- [ ] Any built-ins the learner needs are defined in the challenge prose
- [ ] One clarifying constraint present
- [ ] Starter code includes the function signature and a valid empty body
- [ ] Argument names in the starter code are descriptive
- [ ] 4–6 assertions, covering zero/identity, typical, and boundary/edge cases
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

# Part 4 — Engine Capabilities Reference

Unlike Parts 0–3 (stable pedagogy), this part changes as the engine grows. Check it
before writing a `` ```test `` fence for a language you haven't used before — writing to
Part 3's rules doesn't help if the engine can't execute what you wrote.

## Challenge Language

Write it explicitly on the `` ```challenge `` fence when inference from the preceding
fence would pick the wrong language (see Part 3, File Format):

```
```challenge javascript
```
```

## Test Grading, by Language

| Lesson `lang` | Grading mechanism | Status |
|---|---|---|
| `python` | `assert expr` lines, appended to the learner's code, run in Pyodide | **Works** |
| `javascript` / `typescript` | `assert expr` lines, appended to the learner's code, run inline | **Works** |
| `css` | `assert expr` lines using `getComputedStyle(el).property`, run against the learner's CSS + the step's read-only `html` fence in a sandboxed iframe | **Works** — see `runCSSTests` in `testRunner.ts` |
| `jsx` / `react` / `vue` | `assert expr` lines, run against the learner's component after Babel-transpiling JSX and mounting React/Vue from CDN in a sandboxed iframe | **Works** — see `runJSXTests` in `testRunner.ts` |
| `sql` | Grades the raw query **text**, not a result set — no database execution. `code` is bound to the learner's raw SQL string and the `assert` lines run as JS against it (e.g. `var q = code.trim().toLowerCase(); assert q.startsWith('select')`) | **Works** — see `runSqlTests` in `testRunner.ts` |
| `cpp` / `c` | For challenges that define a function or class (most levels): `assert expr` lines, wrapped in try/catch and compiled+run for real — see `buildTestHarness`'s cpp branch. For pre-function challenges where the learner writes a whole `main()`, or any challenge whose contract is what it prints rather than what it returns (no callable unit to test directly): tag the fence `` ```challenge <lang>-program `` (e.g. `cpp-program`, `java-program`); the program is compiled+run for real, its stdout is captured into an `output` string, and the `test` fence grades that string with plain JS (`assert output.includes(...)`) — same "bind the artifact, grade with JS" trick as `sql`. | **Works** — see `buildCppHarness` / `runProgramOutputTest` in `testRunner.ts` |
| `csharp` / `java` | `assert expr` lines, wrapped in try/catch, compiled+run for real via Wandbox. The challenge may define a standalone class (placed before the generated entry point) or a bare static method (nested inside it) — detected the same way `codeRunner.js`'s `autoWrap` already decides whether to wrap. | **Works** — see `buildCSharpHarness` / `buildJavaHarness` in `testRunner.ts` |
| `bash` / `shell` | — | **Not implemented.** No harness exists. Git/shell lessons should use scenario-style JS-graded challenges (the challenge fence is JS describing the scenario, tagged `` ```challenge javascript `` — see Part 3) rather than a `test` fence graded as shell. |

## Known Limitations

- No mechanical check exists yet for whether a predicted-output block actually matches
  what the code prints — Rule: Tests item 9 (Part 3) is enforced by authors tracing by
  hand, not by the engine.
- The corpus-wide structural checks in `src/labs/lesson-engine/content/lessonCorpus.test.ts`
  catch fence-tag mistakes, missing challenges, wiring gaps, and assertion-count
  violations automatically (`npm test`). They do not catch teaching-quality issues —
  whether an explanation truly answers WHY, whether examples are pedagogically sound —
  those still need a human or agent applying Part 0 directly.
