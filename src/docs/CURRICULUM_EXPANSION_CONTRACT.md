# Curriculum Expansion Contract

This document defines how topics are decomposed into lessons.
It is not a list of what to teach. It is the algorithm for discovering everything that must be taught.

A topic list is not a curriculum. A Wikipedia outline is not a curriculum.
A curriculum is a fully decomposed dependency graph where every node is a single teachable unit with no hidden prerequisites.

---

## The Stopping Rule

> A topic is fully decomposed only when every remaining node can be taught
> in a single lesson without introducing additional unexplained concepts.

If teaching node X requires explaining Y, then Y must be its own node that
appears earlier in the dependency graph. No concept may be assumed.

---

## The Algorithm

### Step 1 — Name the topic

State the topic as a noun or noun phrase.
Example: `Hash Tables`, `Functions`, `The Call Stack`, `Closures`

### Step 2 — Expand into dimensions

For every topic, expand it across every dimension below.
Do not invent headings. Work through the checklist.
Every dimension that applies becomes one or more child nodes.

### Step 3 — Recurse

For every child node that is not yet atomic (cannot be taught in one lesson
without introducing unexplained concepts), return to Step 1.

### Step 4 — Verify completeness

Before finalising any branch:
- Is every prerequisite concept present as a node earlier in the graph?
- Is there any professional knowledge a working engineer uses that is not in a node?
- Can every node be taught in one lesson, end to end, without deferring explanation?

If any answer is no, expand further.

### Step 5 — Assign to lessons

Each atomic node becomes one lesson. Lessons are ordered by their dependency graph
(prerequisites before dependents). The lesson must satisfy the LESSON_ENGINE_CONTRACT.

---

## The Expansion Dimensions

Apply every applicable dimension to every topic being decomposed.
Skip a dimension only if it genuinely does not apply — not because it is inconvenient.

---

### Purpose
What problem existed before this concept?
What does it make possible that was impossible or painful without it?
Why was someone motivated to invent it?

---

### History
When and why was this invented?
What was the state of the field before it?
What changed after it existed?
Who built it and why does that matter?

---

### Mental Model
How should a learner picture this in their head?
What analogy or physical intuition makes it stick?
What is the standard mental model professionals use?
What wrong mental models do beginners form, and what corrects them?

---

### Vocabulary
What terms must the learner know before engaging with this topic?
What terms does this topic introduce?
What terms are commonly confused?

---

### Anatomy
What are the parts of this thing?
What does each part do?
How do the parts relate?
Draw it. Label it. Name everything.

---

### Execution
What actually happens step by step when this runs?
Trace through a minimal example at the level of the machine, the runtime, or the
language — whichever is the relevant abstraction.
What is the state at each step? What changes?

---

### Construction
How is this built from scratch?
What decisions must be made during construction?
What are the implementation choices and their consequences?

---

### Interface
What does the public API look like?
What does a caller see vs what is hidden?
What contract does this expose?

---

### Memory Layout
Where does this live in memory?
How much space does it take?
What is the allocation pattern?
What is the lifetime?

---

### Usage
When do professionals reach for this?
What does idiomatic usage look like?
What patterns appear repeatedly in real codebases?

---

### Non-Usage
When should you NOT use this?
What are the signs that this is the wrong tool?
What does misuse look like?

---

### Alternatives
What competes with this?
When is each alternative preferred?
What are the historical alternatives that this replaced?

---

### Tradeoffs
What does this cost?
What does it give?
Where does it break down at scale?
What are the known failure modes of this design?

---

### Performance
Time complexity — best, average, worst case.
Space complexity.
Constant factors that matter in practice.
Cache behaviour.
How does it scale?

---

### Debugging
How does this fail?
What are the symptoms of each failure mode?
How do professionals inspect this at runtime?
What does the debugger show?
What do logs reveal?

---

### Common Mistakes
What do beginners get wrong?
What do intermediate developers get wrong?
What do experienced developers get wrong?
For each: what is the mistake, why is it made, what does it look like, how is it fixed?

---

### Idioms
What are the professional patterns for using this?
What conventions exist around it?
What does it look like in a production codebase vs a tutorial?

---

### Connections
What topics does this depend on? (prerequisites)
What topics build on this? (unlocked)
What topics does this appear alongside in the real world?
What CS principle does this exemplify?

---

### Exercises
Guided: a problem where the path is scaffolded.
Partially guided: a problem where the approach is suggested but not the code.
Independent: a problem with only a spec.

---

### Projects
Where does this concept appear in real software?
What kind of systems is it central to?
What would a professional build that requires mastery of this?

---

## Verification Checklist

Before marking a decomposition complete:

- [ ] Every dimension above has been considered (and consciously skipped if inapplicable)
- [ ] Every node is atomic (one lesson, no hidden prerequisites)
- [ ] Every prerequisite node exists earlier in the graph
- [ ] No professional knowledge is hidden inside a node that seems simple
- [ ] The execution path exists: you can trace a complete example from input to output
- [ ] The failure path exists: you can trace at least one failure mode
- [ ] The connection to broader CS/SE principles is explicit
- [ ] The "non-usage" case is present — knowing when NOT to use something is as important as knowing when to

---

## Anti-Patterns

These are the failure modes of curriculum design. A decomposition that exhibits
any of these is incomplete.

**The Wikipedia Outline**
Listing sub-topics at one level of depth with no recursion.
`Hash Tables → hash function, collisions, chaining` is not a curriculum.

**The Assumed Prerequisite**
Teaching closures without first teaching scope and lifetime as separate lessons.
Teaching Big-O without first teaching the concept of a function growing over input size.

**The Missing Failure Mode**
Teaching a data structure without teaching how it fails, what the symptoms are,
and how a developer diagnoses it in production.

**The Missing Non-Usage**
Teaching when to use something without teaching when NOT to.
The decision of what NOT to reach for is professional knowledge that beginners lack.

**The Shallow History**
Skipping why something was invented. History is not trivia. It is the motivation
that makes a concept land. Knowing that linked lists preceded arrays in memory
constrained systems makes the tradeoff visceral, not abstract.

**The Missing Professional Layer**
Teaching the textbook concept without the professional idioms, the production
patterns, and the common mistakes that separate someone who has read about it
from someone who has shipped it.

**The Premature Atomic Node**
Calling a node atomic when it still introduces unexplained concepts mid-lesson.
Apply the stopping rule strictly: if teaching this requires explaining anything
not already covered by a prior node, it is not atomic.

---

## Example Decomposition — Hash Tables

Below is a partial decomposition showing the recursive structure.
Each indented item is a child node. Items marked (atomic) are single lessons.
Items without the mark require further expansion.

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

This partial decomposition already produces approximately 30 lessons from one topic.
A surface decomposition would have produced 6.

---

## How This Contract Relates to the Other Contracts

**LESSON_ENGINE_CONTRACT** — governs what each atomic lesson must contain.
Apply it after decomposition. Every atomic node in the dependency graph
becomes one lesson that must satisfy that contract.

**SERIES_CONTRACT** — governs how a set of lessons is structured into a series.
Apply it after the full dependency graph for a topic is complete.

**This contract** — governs the decomposition itself. It runs first.
Without it, the other contracts are applied to the wrong lessons.

The order is always:
1. Decompose (this contract)
2. Sequence into series (SERIES_CONTRACT)
3. Write each lesson (LESSON_ENGINE_CONTRACT)
