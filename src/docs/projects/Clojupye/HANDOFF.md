# Clojupye — HANDOFF

Read this file, `Curriculum.md`, `Lesson-Plan.md`, `LANGUAGE-SPEC.md`, and
`../../reference/LESSON SCHEMA.md` before starting a session. Nothing
else. Do not open previous lesson files in `lessons/` for reference or
context — each session works from these five documents, not from
accumulated lesson content. (The Lesson Schema's own Repetition Rule is
what makes this safe: every lesson is required to be fully self-contained
already, so no session ever needs a past lesson's prose to write the next
one — only `Curriculum.md`, for what a given section actually specifies,
and `LANGUAGE-SPEC.md`, for the rules already locked in.)

## Why this curriculum exists

Clojupye is a Clojure-inspired Lisp that compiles to Python, built as a
full lesson series under `LESSON SCHEMA.md` from `Curriculum.md`'s
30-section curriculum. It exists because the user is going deep on
parsing, closures, and language implementation as a subject in its own
right — not building a throwaway toy. In the user's own words, deciding
the scope on 2026-08-18: *"I don't want to stop short of production
engineering, I just want it at the end"* — and independently, before
being told this was already the curriculum's design: *"what I was
thinking is a way to wrap python syntax so we can use pip libraries."*

That second idea is not a gap to fill — it's already the architecture
`Curriculum.md` Sections 17 and 20 specify (a generic Python bridge: the
compiler only ever knows import / resolve / get-attribute / call /
construct / index / iterate / catch-exception, never any individual
library by name), and Section 20.5's Critical Checkpoint — install a pip
package the compiler has never seen, use it, zero compiler modification
— is its proof. Treat that checkpoint as the thing this whole project is
ultimately being built to demonstrate, not just another item on the list.

**Decisions already made, load-bearing for every future session:**

- **Full scope, in order, no shortening.** All 30 sections of
  `Curriculum.md` are in the plan, ending at Section 30's real
  multi-module application. Nothing is deferred to an "optional" or
  "extension" track.
- **No outside-book influence, ever.** The user is reading Crafting
  Interpreters and The Little Schemer alongside this project. Lesson
  content must never cite either book, structure itself around either
  book's chapter order, or otherwise be shaped by them — this was an
  explicit correction after an early draft of the plan proposed pairing
  the two, and the user rejected it outright.
- **Checkpoint-driven grouping, not topic-driven grouping.** The user
  works by constantly running small pieces of code to verify behavior,
  and explicitly does not want to "spend hours typing code and not having
  it work." Lessons are grouped so each one ends in something actually
  run with real output shown — a section with too many substantial new
  concepts for one honest checkpoint gets split across multiple lessons
  rather than producing one long lesson with the payoff deferred to the
  end. See `Lesson-Plan.md` for the resulting section→lesson mapping and
  the reasoning per split.
- **Refactor-only sections are flagged, not disguised as feature
  lessons.** Sections 15 and 23 restructure existing code with no new
  visible feature. Their lessons must say so plainly and define the
  checkpoint as "re-run the existing example, confirm identical output"
  — never imply a new printed result that isn't actually coming.
- **Section 10.4 (Differential Testing) is relocated**, not left where
  `Curriculum.md` puts it. It compares interpreter output against
  *compiler* output, but the compiler doesn't exist until Section 11+, so
  it can't run for real at its original position (Section 10). The
  lesson covering Section 10 teaches only 10.1–10.3; differential testing
  becomes its own lesson placed right after Section 12, where it can
  actually execute. `Lesson-Plan.md` has the full detail.
- **Language name and file extension:** `Clojupye`, `.clj` files —
  decided in Lesson 0, matching `Curriculum.md`'s own `math.clj` example.
- **Eventual goal: open source, with a community.** The user intends to
  publish this project and hopes contributors join it. This is why
  `LANGUAGE-SPEC.md` exists as a standalone, versioned artifact separate
  from lesson prose — a contributor needs a document stating what's
  already decided, not a codebase to reverse-engineer intent from.

## How to work a session

- Read only: this HANDOFF, `Curriculum.md`, `Lesson-Plan.md`,
  `LANGUAGE-SPEC.md`, `../../reference/LESSON SCHEMA.md`. Do not read old
  lesson files in `lessons/`.
- A lesson is a written document the user works through themselves, built
  per `LESSON SCHEMA.md` exactly — Concept Units, isolated throwaway
  labs, mechanical walkthroughs, real executed output, CS/SE lenses.
  Producing a lesson means writing that document, not silently doing the
  lesson's work for the user.
- Build one lesson per session, in order, per `Lesson-Plan.md`'s mapping.
  Lesson files live at `lessons/NNN-slug.md`, zero-padded to three digits
  (`000-deciding-before-building.md`, `001-...`).
- If a lesson's checkpoint or design decision requires resolving
  something `LANGUAGE-SPEC.md` left as "principle only, pending Section
  N" (Python interop, modules) and this session **is** that section: fill
  the spec in for real as part of the lesson, and update
  `LANGUAGE-SPEC.md` in the same session — the spec is a living document,
  not frozen after Lesson 0.
- When the lesson is done: add one entry to the Session Log below, and
  stop. Don't start the next lesson in the same session.
- Keep log entries minimal — what was built and its status, not a recap
  of the lesson content (that lives in the lesson's own file).

## Session log

- **Lesson 0 — Deciding Before Building** (2026-08-18): Written to
  `lessons/000-deciding-before-building.md`. No Concept Units — Section 0
  of `Curriculum.md` is explicit that no code exists yet. Produced
  `LANGUAGE-SPEC.md` (syntax, values, collections, special forms,
  evaluation rules, scope rules; Python interop and module rules marked
  principle-only, pending Sections 16–20 and 21 respectively) as the
  checkpoint deliverable, plus `Lesson-Plan.md` mapping all 30
  `Curriculum.md` sections to ~43+ lessons. Status: done.
- **Lesson 1 — Before a Language Can Run, Something Has to Run It
  (Executable Project + REPL)** (2026-08-18): Written to
  `lessons/001-executable-project-and-repl.md`, covering `Curriculum.md`
  Section 1 in full (Capabilities 1.1 and 1.2, per `Lesson-Plan.md`'s
  single-lesson mapping). Eight Concept Units, all built and verified for
  real this session at `code/clojupye/` (a real, runnable, git-tracked
  project — `pyproject.toml`, `src/clojupye/{__init__.py,repl.py}`,
  `tests/test_repl.py`, `.venv/` and build artifacts gitignored) — the
  first code this curriculum has produced, and the pattern every future
  lesson's real code should follow: build and verify for real at
  `code/clojupye/`, not just narrate. Two scope decisions made this
  session, load-bearing for every lesson from here on:
  - **Curriculum's own capability order is not binding on internal
    Concept Unit order within one lesson.** `Curriculum.md`'s own
    Capability 1.1 lists `test organization` before Capability 1.2's REPL
    material — this lesson deliberately taught it *last* (Concept Unit
    8), once `:help`/`:quit` dispatch actually existed to write a
    meaningful test against, rather than testing an inert stub. Same kind
    of judgment call as the already-documented 10.4 relocation above, and
    worth the same scrutiny in future lessons: reorder within a lesson
    when the curriculum's listed order would force testing or verifying
    something before it does anything worth checking.
  - **Reader's assumed Python background:** ordinary procedural
    Python — functions, `if`/`elif`/`while`, `print`/`input` as bare
    syntax, string/list basics — is assumed already known and does not
    get its own Concept Unit; this is consistent with `Curriculum.md`'s
    own framing ("Python *beyond the fundamentals*"). What *does* get
    full first-appearance treatment every time: anything named in a
    Capability's own `Learn:` list, taken literally as the scope
    boundary — packaging, `pyproject.toml`, virtual environments, console
    entry points, `EOFError`/`KeyboardInterrupt` as control flow, pytest
    fixtures, and so on. Use each lesson's own `Learn:` bullets as the
    concept-unit boundary, not a guess about what "feels basic."
  - Also adopted this lesson: the schema's "new-lessons-preferred"
    Concept Unit step order (Project Change → New Code → Updated Project
    → isolated lab referencing the real code just shown, rather than
    lab-then-build) — used throughout, for every one of the eight units.
  Status: done. Next: Lesson 2 — Values and Evaluation (`Curriculum.md`
  Section 2).
</content>
