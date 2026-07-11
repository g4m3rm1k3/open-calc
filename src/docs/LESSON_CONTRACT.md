# UpskillOS Lesson Generation Workflow

```
START LESSON
      │
      ▼
Select the next concept to teach
      │
      ▼
Has this concept already been taught?
      │
      ├──────────────► YES
      │                   │
      │                   ▼
      │          Reference briefly if needed
      │
      ▼
NO
      │
      ▼
Introduce the concept
      │
      ▼
Does the learner need prerequisite knowledge?
      │
      ├──────────────► YES
      │                   │
      │                   ▼
      │          Teach the prerequisite first
      │                   │
      │                   └───────┐
      │                           │
      ▼                           │
NO                                 │
      │                           │
      ▼                           │
Explain WHY the concept exists
      │
      ▼
Explain WHAT the concept does
      │
      ▼
Would a table, trace, analogy, diagram,
comparison, or visualization improve understanding?
      │
      ├──────────────► YES
      │                   │
      │                   ▼
      │          Add the instructional element
      │
      ▼
Present one or more code examples
      │
      ▼
Is every important part of the code understood?
      │
      ├──────────────► NO
      │                   │
      │                   ▼
      │          Add more explanation
      │
      │          Add another example if necessary
      │
      │          Add another table/trace if helpful
      │
      │          Repeat until understood
      │
      └────────────────────────────┘
      │
      ▼
Would a CS Lens deepen understanding?
      │
      ├──────────────► YES
      │                   │
      │                   ▼
      │          Add CS Lens
      │
      ▼
Would an SE Lens deepen understanding?
      │
      ├──────────────► YES
      │                   │
      │                   ▼
      │          Add SE Lens
      │
      ▼
Can the learner solve a problem using only
knowledge already taught?
      │
      ├──────────────► NO
      │                   │
      │                   ▼
      │          Teach the missing knowledge
      │
      └────────────────────────────┐
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
More concepts remaining?
      │
      ├──────────────► YES
      │                   │
      │                   ▼
      │          Repeat entire workflow
      │
      ▼
NO
      │
      ▼
END LESSON
```

---

# Core Rules

These rules are mandatory regardless of lesson topic.

## Concept Introduction

Every new programming concept must be introduced before it is used.

A lesson must never assume knowledge that has not been taught in:

* the current lesson,
* an earlier lesson in the current series,
* or a prerequisite series.

If a concept is required but has not been taught, teach it first.

---

## Explanations

Explanations are not limited in number.

The author should add as many explanatory blocks as necessary until the learner can reasonably understand the code.

Explanations may appear:

* before code
* after code
* between multiple examples
* after a challenge
* anywhere they improve learning

There is no required prose/code alternating pattern.

---

## Code Examples

A concept may have:

* zero code examples (rare)
* one example
* many examples

Examples should increase understanding, not repeat identical information.

If a single example cannot adequately explain the concept, create another.

---

## Instructional Elements

At any point, the lesson may introduce instructional elements that improve understanding, including:

* prose
* tables
* execution traces
* debugger walkthroughs
* comparisons
* diagrams
* analogies
* callouts
* warnings
* notes
* images
* visualizations

Use them whenever they make the explanation clearer.

---

## CS Lens

Add a CS Lens whenever algorithmic understanding benefits from discussing topics such as:

* runtime complexity
* memory complexity
* correctness
* algorithms
* data structures
* recursion
* computational tradeoffs
* abstraction

Skip the CS Lens if it adds little value.

---

## SE Lens

Add an SE Lens whenever software engineering considerations are relevant, including:

* readability
* naming
* maintainability
* modularity
* testing
* debugging
* API design
* refactoring
* documentation
* code quality

Skip the SE Lens if it adds little value.

---

## Challenge Generation

Every challenge must satisfy all of the following:

✓ Uses only concepts already taught.

✓ May use concepts from prerequisite series.

✓ Never introduces a new programming construct.

✓ Reinforces the current concept.

✓ Requires the learner to write code.

---

## Tests

Every challenge must include executable tests.

Tests should verify:

* normal cases
* edge cases
* invalid cases (when appropriate)
* boundary conditions

---

## Lesson Progression

Lessons should progress naturally from:

```
Motivation
        ↓
Introduction
        ↓
Understanding
        ↓
Examples
        ↓
Execution
        ↓
Analysis
        ↓
Practice
        ↓
Verification
```

The exact presentation order may change whenever another ordering produces a better educational outcome.
