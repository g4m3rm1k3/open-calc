# Curriculum Notes — The Bowling Game (TDD in Java)

Working notes for whoever writes Lessons 0–23 next (human or AI).
`README.md` is the roadmap; this file is the *why* and the exact
prerequisite/scope map that isn't itself part of the roadmap.

## Why this project exists, and why this specific kata

The student owns Kent Beck's *Test-Driven Development: By Example* and
*Extreme Programming Explained*, finds them hard to follow today, and
asked for a project that fills that gap directly: TDD discipline, taught
by actually doing it, in a modern, followable form. Beck's own book already
uses the `Money` example — building that again would just be a slower
re-reading of a book the student already owns. **The Bowling Game Kata**
(Robert C. Martin's, not Beck's) was chosen deliberately as a *different*
classic exercise with the same teaching shape: real, incremental,
red-green-refactor, small enough to actually finish, and famous enough
that Martin's own public retrospectives on it are a real, citable second
opinion once the student has built their own version.

**The split this session settled on:** TDD mechanics (this project, in
`docs/projects/`) vs. XP values/practices (a separate blog-post series in
`src/posts/`, each post independently readable — not yet started as of
this writing). Don't conflate the two or try to fold XP practices into
this project's lessons — that's explicitly the other series' job.

## The dual mission, and why neither half is optional

This project has two goals that have to both be served by the same
lessons, not traded off against each other:

1. **Real TDD discipline** — every Epic 1 lesson opens with a failing
   test, named as the lesson's actual subject, before any production code
   exists. This is the whole point of choosing a kata at all.
2. **Real Java fundamentals**, specifically the ones that don't transfer
   from Python or JavaScript — generics, checked exceptions, access
   modifiers, the collections framework, `Optional`, enums with real
   behavior. The student is comfortable with programming itself (loops,
   functions, conditionals) — Lesson 0 must not waste time re-teaching
   those; it should hit the genuinely Java-specific gap directly (the
   student's own example: not knowing the mechanism behind `int` → `String`
   conversion, not "not knowing how to convert types exist").

The kata's own small scope (Epic 1) is not enough surface area to
naturally need generics, enums, exceptions, interfaces, or the collections
framework — Uncle Bob's original kata really is just a `List<Integer>`
and a scoring method. Epic 2 (value types, enums, exceptions, interfaces,
generics, collections, `Optional`) and Epic 3 (growing it into a real
multi-player, persisted, console-driven bowling alley) exist specifically
to give those concepts a genuine, felt reason to appear — not because a
generic "Java features" checklist demanded coverage. If a later session is
tempted to skip straight from the kata (Epic 1) to modern Java syntax
(Epic 4's `record`), that skips the entire reason Epic 2/3 exist.

## What's assumed already known, from `../track/`

The student has done real work in Java already, via `../track/`'s 34-lesson
Android course — basic class syntax, `public`/`private` at a surface
level, `if`/`for`/`while`, method calls, `String`. This project does **not**
re-teach Java syntax basics. Lesson 0 exists specifically for the gap
between "has written Java" and "understands Java's own specific
idioms" — the exact gap the student named directly (Googling int→String
conversion despite otherwise being comfortable). Verify `../track/`'s
current lesson count before assuming this list is complete or current —
it was still growing as of this project's own design session.

## The red-green-refactor adaptation to `LESSON_SCHEMA.md`

Every other project in this curriculum treats a lesson's "Concept Lab" step
as a small, disposable, isolated demonstration before the real feature
lands. For Epic 1 specifically, the *failing test itself* plays that role —
it's not a disposable lab, it's the literal first artifact of the real
production code, kept, not discarded. Structure each Epic 1 lesson as:

1. **Red** — the new test, written out in full, run, shown genuinely
   failing (the real compiler/test-runner failure output, not a
   paraphrase).
2. **Green** — the smallest, most honest change that makes it pass —
   including, where the kata's own history calls for it, an intentionally
   "too simple" fake implementation (a hardcoded return) that a *later*
   test then forces to become real — this is a genuine, well-documented
   part of the kata's real teaching value (Martin's own retrospectives
   discuss "fake it till you make it" directly) and should not be skipped
   as if it were sloppy.
3. **Refactor** — cleanup, with the full test suite re-run afterward as
   proof nothing broke.

This is a deliberate, load-bearing adaptation of the schema's normal
Concept Unit sequence, not a deviation to paper over — say so explicitly in
each Epic 1 lesson, the same way the WPF course explicitly named its
code-behind-before-MVVM ordering choice.

## The design fork at Lesson 8 — don't resolve it prematurely

Uncle Bob's own kata is famous for producing genuinely different final
designs depending on choices made along the way (a flat `int[]` of rolls
with index math, vs. an object-oriented `Frame` list). Lesson 8 is
deliberately a refactor-only lesson (no new test) specifically so both
designs can be shown side by side, with real, honest tradeoffs — this is
one of the best-attested "SE lens: alternative not chosen, real tradeoff"
opportunities in this entire curriculum; don't collapse it into "and then
we refactor to the better design," since Martin's own retrospectives are
explicit that neither one is simply *better*.

## The `record`/`data class` cross-course callback

Lesson 9 has the student hand-write `equals`/`hashCode`/`toString` for a
`Roll` value type — the same manual-boilerplate lesson the Kotlin course's
Lesson 0 already showed for Java specifically (as the "problem" `data
class` solves) and the WPF course covers for C#'s `record`. Lesson 21
reveals Java's own `record` keyword doing the same job in one line. When
writing Lesson 21, name this three-way connection directly — it's a real,
concrete payoff of this curriculum having multiple language tracks, not a
coincidence to leave implicit.

## Status

- [x] `README.md` — 24-lesson roadmap (Lesson 0 + 4 epics), lesson table
      updated to match what was actually built (see deviations below)
- [x] Lessons 0–23 — all written and verified. A real JUnit 5 harness was
      assembled from jars already present on this machine (bundled with a
      Cursor/VS Code Java-test extension:
      `~/.cursor/extensions/vscjava.vscode-java-test-*/server/*.jar`,
      excluding the `*vintage*`/`*junit4*` jars) plus a small hand-written
      `TestRunner.java` using `org.junit.platform.launcher` directly — no
      Gradle/Maven, no network access needed. Every Epic 1 test's red and
      green states were run for real, including the perfect-game case and
      both full alternative `Game` designs compared in Lesson 8. Lessons
      9–23's snippets were all compiled and run directly with plain
      `javac`/`java` (no JUnit needed for most of them).
- [ ] The companion XP-practices blog series in `src/posts/` — agreed on,
      not yet started, a separate task from this one

## Deviations from the original roadmap sketch, and why

The roadmap table drafted before writing began put "generics
(`List<Integer>`)" at Lesson 3 and something vaguer at Lesson 2. Building
the kata for real changed this, for a concrete reason: Lesson 2's own test
(`all ones scores 20`) is what forces `Game` to actually store rolls at
all — generics couldn't wait for a separate lesson, since Lesson 2's fix
*is* introducing `List<Integer>`. Lesson 3 became a test-quality lesson
(varargs, extracting `rollMany`/`rollAll` helpers) instead — real,
valuable, and it needed to happen before Lesson 4's spare test made the
existing test duplication worse. If resuming work on this project, trust
the actual lesson files over the very first roadmap draft's exact
per-lesson assignments — the epics and overall shape held; the precise
lesson-by-lesson slicing was refined by actually doing the kata, the same
way real TDD practice refines a plan by doing the work, not by re-planning
in the abstract.

Lesson 6 (tenth frame) is also worth flagging specifically: it was
designed expecting to force new code, and — verified for real, not
scripted — both tenth-frame tests passed immediately against the existing
Lesson 5 design. The lesson was rewritten to present this honestly (a real
regression-test-writing moment, not a fight) rather than forcing an
artificial complication that wasn't actually needed. Trust this if
revisiting: the flat-list design genuinely does generalize to the tenth
frame for free, verified.
