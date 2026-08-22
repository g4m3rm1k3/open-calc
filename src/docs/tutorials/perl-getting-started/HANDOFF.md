# Perl Getting-Started — Handoff

**Status (2026-08-19):** Draft starter lessons only — Lesson 0 through
Lesson 2. Written under a hard usage budget at the user's request, so
these intentionally skip the full Lesson Schema treatment: no CRC
breakdowns in Objects and methods, no Concept Isolation labs, and no
executed/verified run output (code is believed correct from language
knowledge but was not run this session).

**2026-08-19 update — deprioritized:** the user decided they don't need
a Perl-fundamentals on-ramp after all — all remaining session usage was
redirected to expanding `pascal-getting-started/` instead.

**2026-08-22 update — fully retired, not just paused.** The user
confirmed they want to work the book directly in **C++**, not Perl —
several of the book's real companion files are already `.cpp` (using
`iostream`, STL `set`/`map`, templates), so no translation layer is
needed at all. A new curriculum, `programming-pearls-cpp/`, was created
as a sibling of this folder, and the entire book source collection
(25 files, corrected from an earlier miscount of 26) was moved out of
this folder into `programming-pearls-cpp/book-source/`. **This Perl
series (Lessons 0-2 below) is not going to be continued or rebuilt to
full schema** — it was a placeholder for a plan that changed. Leaving
the three lessons in place as-is rather than deleting them, in case
they're useful later for an unrelated reason, but do not resume work
here without explicit user direction.

**Why Perl, specifically (context for the 3 lessons that already exist):** the user's stated motivation was reading
*Programming Pearls* (Jon Bentley), but that book does not actually use
Perl — its examples are C-like pseudocode. The user asked for "pearl"
as a language to get running in, so this series teaches Perl as a
practical vehicle for trying the book's algorithmic ideas hands-on, not
as something the book itself requires. Worth surfacing again to the
user next session in case the mismatch was a slip rather than intent.

**What's here:**
- `lesson-0-setup.md` — install Strawberry Perl, run hello world two ways.
- `lesson-1-scalars-arrays-hashes.md` — the three sigils (`$` `@` `%`),
  `my`, string interpolation.
- `lesson-2-control-flow-and-subroutines.md` — if/foreach, `sub`, `@_`,
  array processing.

**Reference material — moved, see `programming-pearls-cpp/HANDOFF.md`
(2026-08-22):** the book's real companion file collection (found via
O'Reilly → publisher link; the book's own printed URL is dead — GoDaddy
parking page, no GitHub mirror found) originally landed in
`from the book examples/` inside this folder — 25 files, `.c` and
`.cpp`. All of it has since moved to
`../programming-pearls-cpp/book-source/`, where the active curriculum
now lives. Nothing book-related belongs in this folder anymore.

**If this folder is ever revisited:**
1. Confirm with the user first — see the 2026-08-22 retirement note
   above.
2. Re-read `src/docs/reference/LESSON SCHEMA.md` fresh.
3. Rebuild the three existing lessons as full schema-compliant lessons
   if kept: Header with Terms + Objects and methods (full CRC
   breakdown), Concept Units with isolated throwaway labs, actually
   run/verified output, CS/SE lenses.
4. Confirm install instructions against a real Strawberry Perl install —
   not verified this session.
