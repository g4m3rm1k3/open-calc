# UpskillOS Subject Completeness Contract

## Purpose

This contract defines what it means for an UpskillOS series to completely teach a subject.

It is language-agnostic. It applies equally to programming languages, computer science topics, and software engineering topics.

It does not define lesson formatting. Lesson formatting is handled by the UpskillOS Lesson Engine Contract (`LESSON_ENGINE_CONTRACT.md`).

---

## Core Principle

Every series must teach the complete intellectual foundation of its subject.

The goal is not to teach only the commonly presented beginner material. The goal is to teach the concepts, mental models, execution behaviour, idioms, edge cases, and professional reasoning that are fundamental to understanding the subject itself.

A learner who completes the series should understand how the subject works, not merely how to copy its syntax.

---

## Scope

A series teaches only concepts that belong to its subject.

| Series                      | In Scope                                                               | Out of Scope                                        |
|-----------------------------|------------------------------------------------------------------------|-----------------------------------------------------|
| Python Fundamentals         | Objects, functions, modules, exceptions, idioms, debugging Python code | Git, Docker, cloud deployment, editor configuration |
| JavaScript Fundamentals     | Closures, prototypes, async execution, modules, language idioms        | React, npm, webpack, Node-specific APIs             |
| DOM Manipulation            | Document, nodes, events, traversal, mutation, rendering                | React, Vue, build tools                             |
| Data Structures & Algorithms| Arrays, linked lists, stacks, queues, hash tables, trees               | Git workflows, deployment pipelines                 |

Topics outside the subject belong in their own series.

---

## Series Independence

Every series begins assuming zero prior knowledge unless prerequisites are explicitly declared.

A learner must be able to start any series without completing unrelated series.

**Valid prerequisite example:** DOM Manipulation → requires JavaScript Fundamentals

**Invalid prerequisite example:** Data Structures → requires Git Basics

---

## What Every Series Must Teach

For every major concept, the series must teach the following dimensions when they materially improve understanding:

| Dimension             | Required Understanding                         |
|-----------------------|------------------------------------------------|
| Purpose               | Why the concept exists                         |
| Behaviour             | What it does during execution                  |
| Mental Model          | How to think about it                          |
| Usage                 | When to use it                                 |
| Non-Usage             | When not to use it                             |
| Debugging             | How to inspect and reason about failures       |
| Common Mistakes       | Typical incorrect assumptions                  |
| Professional Practice | How experienced practitioners apply it         |
| Connections           | How it relates to earlier and future concepts  |

---

## Hidden Curriculum Requirement

Every series must deliberately include knowledge that experienced practitioners consider fundamental but that many introductory courses omit.

Examples include:

- Language idioms and conventions
- Edge cases and surprising behaviour
- Execution model details
- Historical design rationale
- Common debugging strategies
- Professional naming conventions
- Performance trade-offs
- Mutation vs immutability
- Reference vs value behaviour
- Common misconceptions that persist beyond beginner level

The hidden curriculum must remain inside the subject's scope.

---

## Teaching Rule

A concept is considered taught only when the learner has been shown:

1. What it is
2. Why it exists
3. How it behaves during execution
4. Where it appears in real code
5. How to debug it
6. Common mistakes
7. How it connects to previously learned concepts
8. Where it will appear again later

Only then may later lessons rely on the concept without reintroducing it.

---

## Progressive Depth

Advanced ideas should not be avoided. Introduce them as soon as they become understandable. Early lessons may build intuition; later lessons revisit the same concept with greater precision.

**Example:**

- Early: "A variable points to a value."
- Later: "A variable stores a reference to an object."
- Still later: "Multiple variables may reference the same mutable object, creating aliasing."

---

## Curriculum Mining

Series authors must not rely solely on official documentation or popular beginner tutorials. The curriculum should be synthesised from:

- Language or protocol specifications
- Standard libraries and style guides
- Production codebases
- Books, conference talks, issue trackers
- Historical discussions
- Experienced practitioner knowledge

The goal is to capture both explicit design and implicit professional knowledge.

---

## Completion Test

A series is complete only if a learner can answer, for every major concept:

1. What problem does this solve?
2. Why was it designed this way?
3. What happens during execution?
4. How would I debug it?
5. What are the common mistakes?
6. How do professionals use it?
7. How does it connect to the rest of the subject?
8. When should I choose a different approach?

If any major concept fails this test, the series is incomplete.

---

## One-Sentence Directive

> When generating an UpskillOS series, teach the complete intellectual foundation of the subject itself: include the core concepts, execution model, idioms, edge cases, common misconceptions, debugging strategies, professional practices, historical rationale, and computer science connections that are fundamental to understanding the subject, while excluding tools, workflows, and technologies that belong to separate series unless they are explicit prerequisites.
