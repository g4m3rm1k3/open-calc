# Pascal Getting-Started — Handoff

**Status (2026-08-19):** Draft starter lessons only — Lesson 0 through
Lesson 2. Written under a hard usage budget at the user's request, so
these intentionally skip the full Lesson Schema treatment: no CRC
breakdowns in Objects and methods, no Concept Isolation labs, and no
executed/verified run output (code is believed correct from language
knowledge but was not compiled this session).

**Why these three lessons exist:** the user is about to read *Software
Tools in Pascal* (Kernighan & Plauger) and knows no Pascal. The goal was
narrowly "get up and running" — install the compiler, understand the
compile/run cycle, learn enough syntax to read simple procedural code —
not a full curriculum.

**What's here:**
- `lesson-0-setup.md` — install Free Pascal, compile/run hello world.
- `lesson-1-variables-and-types.md` — var blocks, core types, I/O, `:=`.
- `lesson-2-control-flow-and-procedures.md` — if/while/for, procedures
  vs. functions, arrays.
- `lesson-3-arrays-and-the-accumulator-pattern.md` — fixed-size arrays,
  `Low`/`High`, the accumulator pattern (sum + average).
- `lesson-4-strings-as-indexable-character-sequences.md` — `Length`,
  `Copy`, `Pos`, `UpCase`, string indexing, string concatenation as a
  second accumulator example.
- `lesson-5-reference-parameters-and-multiple-return-values.md` — `var`
  parameters vs. value parameters, with an optional/skippable C++
  aside (`int&`) — see 2026-08-19 correction below before adding more
  of these.
- `lesson-6-reading-and-writing-text-files.md` — `Text`, `Assign`,
  `Rewrite`/`Reset`, `Close`, `EOF`, the file forms of `readln`/
  `writeln` — the capstone lesson, since *Software Tools in Pascal* is
  built almost entirely around reading and writing text streams.

**2026-08-19 update:** user redirected all remaining usage to Pascal
only — decided they don't need the Perl series (see
`perl-getting-started/HANDOFF.md`, repurposed for *Programming Pearls*
later) and don't need beginner C/C++ material since they don't intend
to read C/C++ directly right now. Lessons 3-6 were written in this same
low-usage session specifically to "fill Pascal as much as possible"
before usage runs out — same draft caveats as Lessons 0-2 apply (no CRC
breakdown, no compiled/verified output, written from language knowledge
only).

**2026-08-19 correction:** Lessons 5 and 6 originally drew load-bearing
C++ parallels (`var` params ↔ `int&` references; `while not EOF` ↔
`while (getline(...))` including stream boolean-conversion mechanics),
written on a mistaken assumption that the user knows C++ well. Actual
background: only "touched it a few times" (see [[user_role]] memory,
corrected same day). Both asides were rewritten to be explicitly
optional/skippable and trimmed to only the beginner-level construct
(basic `&` reference parameters) rather than idiomatic/advanced C++.
**When rebuilding to full schema:** don't restore the stronger framing
— keep any C++ references optional-aside-only, never load-bearing,
unless the user's stated background changes again.

**Next session (once usage resets):**
1. Re-read `src/docs/reference/LESSON SCHEMA.md` fresh (don't assume
   these notes captured every rule).
2. Rebuild all six as full schema-compliant lessons: Header with Terms
   + Objects and methods (full CRC breakdown), Concept Units with
   isolated throwaway labs before each real-project use, actually
   compiled/run output pasted in, CS/SE lenses.
3. Natural next topics beyond Lesson 6: arrays of records (structs),
   recursion, and then starting directly on *Software Tools in
   Pascal*'s actual early utility programs (character counting, simple
   translation/filter tools) now that arrays, strings, `var`
   parameters, and file I/O are all in place.
4. Confirm install instructions against a real run — the current
   Lesson 0 was written from knowledge of Free Pascal, not verified
   against an actual install this session.
5. Compile and actually run all six lessons' code for the first time —
   none of it has been executed yet; treat every "Expected Output"
   block as unverified until then.
