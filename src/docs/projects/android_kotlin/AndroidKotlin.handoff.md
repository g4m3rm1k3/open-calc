# Android Kotlin Calculator — Handoff

Read this file first each session, before touching anything else. Per
this curriculum's own convention (matching `FirstPrinciples.handoff.md`
and `OOPDSA.handoff.md`): only `brd.md`, `LESSON SCHEMA.md`, and this
file get read at session start — never an old lesson file, in this
curriculum or any other, for format or content precedent.

## Source documents

- BRD: `src/docs/projects/android_kotlin/brd.md` — the master curriculum
  (Stage → Slice → Lesson → Concepts → Practice → Ship), Stage 0 through
  Stage 16.
- Schema: `src/docs/reference/LESSON SCHEMA.md` — the mechanical
  production template every lesson file must follow.

## Standing decisions

- **Math is just-in-time, never speculative.** The user was explicit:
  no math lesson exists unless a concrete function in the project
  actually needs it, "nothing just to have it." The BRD, as written,
  does not require calculus anywhere — Stage 8 needs linear-algebra
  *reasoning* (why matrix multiply/determinant/inverse work, not just
  how to code them) because Slice 8 is a matrix calculator; Stage 9 as
  literally specified (plot `y = f(x)` by sampling) needs no calculus at
  all. No calculus stage has been inserted speculatively. If a later
  session's Stage 9 work adds a concrete feature a real graphing
  calculator would have (tangent line at a point, root-finding, shaded
  area under a curve), that is the trigger for a calculus Concept Unit,
  motivated by that specific feature — not before, and not as a
  separate "math track" bolted alongside the app.
- **File location:** lessons live flat in
  `src/docs/projects/android_kotlin/`, alongside `brd.md`, matching the
  convention already used by `android-ui-foundations/` and
  `android-architecture-lab/` (not `src/docs/tutorials/`, which is where
  `Frist Principles` and `OOPDSAETC` live instead — projects/ is the
  right home for Android curricula per the write-lesson skill's own
  description).
- **File naming:** `Lesson <stage>.<n> <Concept-First Title>.md`,
  keeping the BRD's own `0.1`, `0.2`, `1.1` ... numbering verbatim so a
  file always traces back to its BRD entry. Title is concept-first per
  the schema's Header rule, not copied verbatim from the BRD's
  feature-first phrasing.
- **Verification folder:** not created yet. Per the schema's
  Verification Rule Part 3, create it the first session a lesson
  actually needs to run code, following the OOPDSAETC convention
  (`verification/<lesson-id>/lab*.kt` etc., read
  `src/docs/tutorials/OOPDSAETC/verification/README.md` for the exact
  layout at that point) — adapted to Kotlin.

## Progress

- Stage 0 (Kotlin Foundations), Slice 0 (Console Calculator): in
  progress. Lesson-by-lesson status below, updated as lessons complete.

| Lesson | Title | Status |
|---|---|---|
| 0.1 | The Shape of a Running Program | complete |
| 0.2 | Naming a Piece of Work | complete |
| 0.3 | (Decisions) | not started |
| 0.4 | (Collections) | not started |
| 0.5 | (Nullability) | not started |
| 0.6 | (Classes & Objects) | not started |
| 0.7 | (Interfaces & Polymorphism) | not started |
| 0.8 | (Data Classes & Enums) | not started |
| 0.9 | (Lambdas) | not started |
| 0.10 | (Idiomatic Kotlin) | not started |

Stages 1–16 not yet started; see `brd.md` for the full map.

## Session pacing

Per standing session-management guidance: pace by session
duration/context size, not by lesson count. Do not stop between lessons
to ask permission to continue — keep building until the session's
natural end, then update this file's Progress table and this note
before stopping (handoff gets written at the *start* of the next
session's setup work, not appended at the end of the current one,
except for this initial creation).
