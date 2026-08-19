# Curriculum Handoff

Read this file first, every session, before writing or revising a lesson.
It exists so a session never needs to read prior lesson files, this
project's file history, or old chat context to know what to do next —
everything required is either here or in the two files it points to.

## Files in this set

- **`pyside.brd.curriclum.md`** — the curriculum blueprint. Source of
  truth for lesson order, numbering (`Series N`, lesson `N.M`), type
  (Core/Support/Lab), and each lesson's one-line Build/Survives note. Do
  not renumber or reorder it from inside a lesson-writing session — note
  drift here instead and let a human decide.
- **`TAUGHT-CONCEPTS.md`** — flat log of every term, construct, and
  object/method already introduced, by lesson. Use it to decide
  new-vs-reappearing per the Lesson Schema's Recursive Concept Extraction
  Rule, without opening any earlier lesson file. Append to it at the end
  of every lesson written. Never use it to shorten a lesson's own
  explanations — the schema's Repetition Rule still requires full,
  real treatment of a reappearing concept, every time.
- **`snapshot/`** — the literal current-state source files of the Asset
  Manager project, exactly as they stand at the end of the last written
  lesson. This is the only thing to read to write an accurate Project
  Change / Updated Project step for the next lesson — never reconstruct
  project state from memory or from old lesson prose. Read only the
  specific file(s) the next lesson's delta actually touches, not the
  whole tree.
- **`lessons/`** — the rendered lesson files, one per curriculum entry,
  grouped in per-series subfolders, named `<series-slug>/<N.M>-<slug>.md`
  (e.g. `series-1-python-foundations/1.1-classes-and-objects.md`).
- **`verification/`** — real, executed proof behind this curriculum's
  lessons, one subfolder per lesson (e.g. `verification/1.1/`), per the
  Lesson Schema's Verification Rule (Persistence part). Does not exist
  yet — created the first time a lesson's code actually requires a run.
  Check here before running anything a past lesson already verified;
  write new runs here, not only into session scratch.

## Standing deviations from the Lesson Schema (deliberate, usage-driven — do not re-litigate per lesson)

1. **Verification follows the shared schema's Verification Rule
   directly — no local override.** An earlier version of this handoff
   opted this curriculum out of execution entirely to control cost; that
   blanket opt-out is retired. `LESSON SCHEMA.md` now carries its own
   Verification Rule with three parts — Necessity (run only code whose
   output a careful reader couldn't already predict by inspection: a
   plain `print` of a literal, a simple class or function with no
   computed logic, instantiating a class with no constructor logic all
   qualify as exempt; real computation, iteration, branching, error
   text, or any real PySide/Qt call does not), Batching (collect
   everything a lesson actually needs to run and execute it together,
   not one snippet at a time), and Persistence (save every real run to
   `verification/`, check there before re-running anything already
   verified). Follow it as written — do not re-derive a stricter or
   looser local version of it here.
2. **No shared concept-file catalog.** `src/docs/concepts/` is out of
   scope for this curriculum — never read or write it. Every
   Terms/Objects-and-methods entry and every supporting explanation is
   written inline, in full, inside the lesson itself, even where the
   schema would normally prefer factoring it into a shared concept file.
   This trades cross-curriculum reuse for never needing to leave this
   folder.
3. **No reference implementation.** This is an original project, not a
   port of an existing codebase. Every Concept Unit's Project Change step
   states, for Reference Source: *"No reference counterpart — original
   curriculum project."*
4. **No in-lesson lesson-number citations for concepts.** This is
   already the schema's own Repetition Rule, restated here because it's
   the reason `TAUGHT-CONCEPTS.md` exists: that file is a bookkeeping aid
   for the author, never a citation to put in a lesson's own prose. The
   only place a lesson number belongs is the Header's "What you need to
   know first" and the closing "next lesson" pointer.
5. **Read only this folder plus the Lesson Schema file.** Never read
   other curricula, other project docs, or `src/docs/concepts/` while
   writing a lesson in this series. If something outside this folder
   seems necessary, stop and ask rather than reading it.

## Current position

**Next lesson to write:** `1.1 — Classes and Objects` (Series 1, Core)

**Blueprint entry:** `pyside.brd.curriclum.md`, section "SERIES 1 —
Python Application Foundations" → "## 1.1 — Classes and Objects."

**Project state:** none yet. This is the first lesson in the curriculum —
`snapshot/` does not exist yet. This lesson creates it, starting with the
first `Asset` class.

**Taught concepts so far:** none — `TAUGHT-CONCEPTS.md` is seeded empty.

## Piloting schema changes here

This curriculum is the first to write lessons under two `LESSON
SCHEMA.md` changes made 2026-08-19: the Verification Rule (deviation 1,
above) and the Concept Unit's new Socratic-prompt step 1 blockquote, plus
a trimmed Closing ("Connect the pieces" only — "What breaks without
this," "Exercises," and "Definition of done" retired). Neither is
settled; both are being dialed in against real use starting with lesson
1.1. After writing each of the first few lessons, say plainly whether
the Socratic questions actually made you pause and try something before
reading on or just read as filler, and whether the trimmed Closing
leaves anything out you'd have wanted back. Report that in the session
rather than silently deciding a fix — adjusting `LESSON SCHEMA.md` again
based on that feedback is expected, and lessons written here so far are
not a fixed target other lessons need to match.

## After finishing a lesson (do this before handing off / before clearing)

1. Update **Current position** above to the next lesson in
   `pyside.brd.curriclum.md`'s order (next `N.M`, its title, its type).
2. Update **Project state** above to name exactly which file(s) in
   `snapshot/` changed and how, in one or two lines — enough for the next
   session to know what to read, not a full re-description.
3. Append every new term, construct, and object/method this lesson
   introduced to `TAUGHT-CONCEPTS.md`, tagged with this lesson's number.
4. Write or update the matching file(s) in `snapshot/` so they match the
   project's real end-of-lesson state exactly — this is what the next
   lesson's Project Change / Updated Project steps will read against.
