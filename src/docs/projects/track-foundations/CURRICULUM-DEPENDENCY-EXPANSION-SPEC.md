# Curriculum Dependency Expansion Specification

> This is the governing specification for `track-foundations/`. It was
> written by the project owner and takes precedence over any other
> framing of this project's purpose. If a future instruction (from a
> user or an agent's own inference) would have this project rewrite,
> simplify, reorder, or otherwise modify `../track/`, that instruction
> conflicts with this spec and must be flagged, not silently followed.

## Purpose

The existing Android lessons (`../track/`) are **not** beginner lessons.
They were written assuming the learner already understands Java,
object-oriented programming, and many Android framework concepts. They
should be treated as **fixed capstone lessons**, not rewritten.

Your task is **not** to simplify, rewrite, or modify those lessons.

Instead, your task is to build the prerequisite curriculum that makes
each existing lesson understandable to someone who only knows basic
programming (approximately Python variables, loops, conditionals,
functions, and simple scripts).

---

## Core Principle

For every existing lesson:

1. Read the lesson completely.
2. Identify every concept the lesson uses without adequately teaching.
3. Build a complete dependency graph of those concepts.
4. Produce new prerequisite lessons that teach those concepts **before**
   the original lesson.
5. Leave the original lesson unchanged. It becomes the capstone of that
   dependency chain.

Think of the existing lesson as the final node of a directed acyclic
graph (DAG). Your job is to construct every missing node beneath it.

---

## Dependency Analysis Process

For every lesson:

### Step 1 — Extract Concepts

Identify every concept the lesson depends upon, including but not
limited to:

- Programming fundamentals
- Java language features
- Object-oriented programming
- Standard library concepts
- Design patterns
- Compiler behavior
- Framework concepts
- Android concepts
- Tooling
- Software engineering concepts
- Computer science concepts

Do not limit yourself to explicitly named terms.

If the lesson uses a concept without explaining it, it is a dependency.

Examples:

- `extends`
- object
- instance
- method overriding
- callback
- framework
- Activity
- lifecycle
- XML
- annotation
- compiler
- namespace
- package
- generated code
- Template Method
- event-driven programming

---

### Step 2 — Build the Dependency Graph

Arrange the concepts from lowest-level prerequisites to highest-level
concepts.

Dependencies must always flow upward.

For example:

```
Programming Fundamentals
        ↓
     Methods
        ↓
     Classes
        ↓
     Objects
        ↓
   Inheritance
        ↓
Method Overriding
        ↓
 Dynamic Dispatch
        ↓
 Template Method
        ↓
Framework Callbacks
        ↓
Android Activity Lifecycle
        ↓
      onCreate()
```

Do **not** order lessons by the order they appear in the capstone.

Order them by conceptual dependency.

---

### Step 3 — Create One Lesson Per Concept

Every node in the dependency graph becomes its own lesson.

Each lesson should introduce exactly one major concept.

Lessons should avoid introducing concepts whose prerequisites have not
yet been taught.

Example:

- Lesson A — Classes
- Lesson B — Objects
- Lesson C — Instantiation (`new`)
- Lesson D — Instance Methods
- Lesson E — Inheritance
- Lesson F — Method Overriding
- Lesson G — Dynamic Dispatch
- Lesson H — Template Method Pattern
- Lesson I — Android Activity
- Lesson J — Activity Lifecycle
- Lesson K — Original Lesson (unchanged)

---

## Teaching Order Rules

Always teach in this order whenever applicable:

1. General programming concepts
2. Java language features
3. Object-oriented programming
4. Java standard library
5. Design patterns
6. Framework concepts
7. Android framework concepts
8. Android project concepts
9. Original capstone lesson

Never introduce an Android concept if a language concept underneath it
has not yet been taught.

---

## Granularity Rule

Prefer many small lessons over one large lesson.

A lesson should answer exactly one question.

Examples:

- "What is an object?"
- "What does `new` do?"
- "What is inheritance?"
- "What is overriding?"
- "What does `super` do?"
- "What is a callback?"
- "What is a framework?"

Each lesson should build directly upon previous lessons.

---

## Existing Lessons Are Immutable

Do not rewrite.

Do not simplify.

Do not reorganize.

Do not replace.

The existing lessons remain exactly as written.

Only create the prerequisite lessons necessary for a beginner to
understand them.

---

## Self-Correcting Discovery Rule

Dependencies are discovered from the lesson itself, not from a
predefined syllabus. The agent should parse the capstone lesson,
identify every concept it relies on (even if it isn't explicitly named),
build a dependency graph from those concepts, and then generate
prerequisite lessons in dependency order. This makes the curriculum
self-correcting: if a future capstone introduces a new concept
unexpectedly, the agent automatically inserts whatever lessons are
needed beneath it instead of assuming the learner already knows it.

---

## Goal

Transform an expert-written curriculum into a beginner-friendly
curriculum by inserting prerequisite lessons underneath each capstone
until every dependency is satisfied.

The learner should be able to progress from basic Python knowledge to
the original lesson without encountering an unexplained concept.
