# CSS Techniques

**Product:** CSS Tricks / CSS Techniques Laboratory

**Purpose:**
A complete collection of standalone lessons that teach practical CSS techniques through implementation rather than a linear curriculum.

The lessons are **not ordered by difficulty**. They are a **technique library**.

---

## Core Requirement

Every technique must be independently implementable.

A lesson may assume the learner knows basic:
* HTML
* CSS selectors
* classes
* box model
* basic layout

But it must **not require completion of another trick lesson**. The lesson contains everything required to build the technique.

---

## Lesson Contract

Every lesson must produce a **finished visual technique**.

Each lesson must contain:

```text
Technique
├── Name
├── Category
├── Difficulty (1 - 5)
├── What it produces
├── Why it works
├── Required CSS concepts
├── HTML structure
├── CSS implementation
├── Variations
├── Parameters to experiment with
├── Common mistakes
├── Browser considerations
└── Acceptance criteria
```

The lesson is complete when the technique works independently.

---

## Acceptance Criteria

A lesson is complete only if:
* The technique renders correctly.
* The technique works without other lessons.
* The implementation demonstrates the actual CSS mechanism.
* The CSS is understandable.
* Important properties are explained.
* The learner can modify meaningful parameters.
* At least one variation exists.
* Common failure modes are documented.
* Browser limitations are documented where relevant.
* The final result is visually obvious.
* The learner can reuse the technique elsewhere.

*(For detailed structural schema requirements, see `src/docs/reference/CSS_LESSON_SCHEMA.md`)*
