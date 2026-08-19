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

**Next session (once usage resets):**
1. Re-read `src/docs/reference/LESSON SCHEMA.md` fresh (don't assume
   these notes captured every rule).
2. Rebuild these three as full schema-compliant lessons: Header with
   Terms + Objects and methods (full CRC breakdown), Concept Units with
   isolated throwaway labs before each real-project use, actually
   compiled/run output pasted in, CS/SE lenses.
3. Decide how far this series should go before it starts tracking
   chapters of *Software Tools in Pascal* directly (file I/O, string
   handling, and simple text-processing utilities are the natural next
   topics, since that's what the book itself builds toward).
4. Confirm install instructions against a real run — the current
   Lesson 0 was written from knowledge of Free Pascal, not verified
   against an actual install this session.
