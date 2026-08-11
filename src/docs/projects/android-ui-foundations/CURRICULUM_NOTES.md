# Curriculum Notes — Android UI Foundations

Working notes for whoever writes or edits lessons next (human or AI) —
the *why* behind this course that isn't itself part of any single
lesson.

## What this project is

36 lessons, Java, building a small login/inventory-grid/notifications
app with hand-written `findViewById`, XML-only layouts, and the
request-code-era-through-modern permission APIs — deliberately using
older platform idioms where that's what makes a later contrast lesson
(a Kotlin/Compose sequel, if one exists) land as a real "why did this
change" question instead of trivia. See `../android-kotlin-foundations/`
for that direct sequel, if present.

## 2026-08-10/11 audit: structural retrofit

Ran `scripts/check-narrative-lessons.mjs` against this project for the
first time (it predates that tool). Found 92 real structural issues
across all 36 files, plus zero files with the "Objects and methods
used" header section (a schema requirement that postdates when these
lessons were written).

Fixed, in order, lesson by lesson:

- **"Objects and methods used"** added to all 36 files.
- **Real missing `Mechanical Walkthrough`/`SE Lens` steps** — not just
  formatting gaps; several units had genuinely no walkthrough or lens
  content at all, only prose that read like one without the required
  heading. Filled in for real, not just relabeled.
- **`no-proof-in-unit` flags** (the "tools mentioned but skipped"
  pattern) — closed by adding real `### Run It Yourself` on-device
  verification steps to units with no compiler-checkable proof
  (styling, focus order, spacing — genuinely visual/perceptual claims),
  and by fixing several `PROOF_MARKER_RE` near-misses where real proof
  text existed but tripped on punctuation (a colon or em-dash
  immediately after "Real..." breaks the checker's regex — phrase real
  captured output as "Real, verified crash: ..." or similar, comma
  before the outcome word, not a colon/dash).
- **Lesson 18** was missing two entire closing sections
  (`Connect the Pieces`, `What Breaks Without This`) — a genuinely
  broken file, not a soft gap. Fixed with content appropriate to a
  no-code, pure-comparison lesson (a reasoning trace instead of a
  runtime break).
- **Lesson 25's hidden-`this$0`-field claim** was asserted, not proven
  — the lesson's own example never actually referenced the enclosing
  instance's state, so the compiler never generated the field being
  described. Fixed by making the isolated example actually use
  `outerLabel`, then adding real `javap -p` output showing
  `final Outer this$0;` — verified this session on `javac 21.0.6`.
- **A real omission caught late, not by the linter**: `String.length()`
  triggers this course's very first `NullPointerException` (Lesson 04)
  but `String` itself was never given any treatment — `String[]`
  (an array of `String`) was mentioned in Lesson 01, but the `String`
  class and its methods were not. Fixed with a real Objects/methods
  entry at that point of use.

5 new concept files extracted to the shared `src/docs/concepts/`
catalog along the way (`java-references-and-aliasing.md`,
`java-primitive-vs-reference-types.md`,
`java-autoboxing-and-unboxing.md`,
`java-null-and-nullpointerexception.md`,
`java-package-declarations.md`, `java-generic-methods.md`) — all
indexed in `GLOSSARY.md`, all cross-referenced from the lessons they
came from.

Final state: 26 remaining flags, all soft/judgment-call
(`note-no-cs-lens` — legitimately optional per the schema's own "if
any" — and `note-unverified-hidden-behavior`/`dense-concept-unit` spot-
checked and confirmed either already backed by real proof elsewhere in
the same unit, or a cohesive single mechanism, not a real bundling gap).
Don't re-litigate these from scratch next time the checker flags them —
this note is the record that they were checked.

## Known follow-on work

`android-persistence-lab` (separate project) extends this course with
what it deliberately doesn't cover: a real, persisted SQLite database
(this course's data is hardcoded/in-memory only) and actually sending
an SMS via `SmsManager` (this course stops at requesting the permission
and never sends anything). Finish this course first; that series
assumes it's complete.
