# Perl Getting-Started — Handoff

**Status (2026-08-19):** Draft starter lessons only — Lesson 0 through
Lesson 2. Written under a hard usage budget at the user's request, so
these intentionally skip the full Lesson Schema treatment: no CRC
breakdowns in Objects and methods, no Concept Isolation labs, and no
executed/verified run output (code is believed correct from language
knowledge but was not run this session).

**2026-08-19 update — deprioritized:** the user decided they don't need
a Perl-fundamentals on-ramp after all — they're repurposing this folder
for *Programming Pearls* directly later, and all remaining session
usage was redirected to expanding `pascal-getting-started/` instead.
The real book source (26 `.c`/`.cpp` files) is sitting in
`from the book examples/` inside this same folder — see the note further
down. **Do not resume writing Perl lessons 3+ without checking with the
user first** — this pivot was explicit, not a pause.

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

**Reference material added (2026-08-19):** the user found the book's
real companion file collection via O'Reilly → publisher link (the
book's own printed URL is dead — GoDaddy parking page, no GitHub
mirror found) and pulled the code portion into
`from the book examples/` inside this folder — 26 files, all `.c`/
`.cpp`, not read in full this session. Filenames match known *Programming
Pearls* 2nd edition column programs (`longdup.c` = Column 15 duplicate
substring, `maxsum.c` = Column 8 maximum subarray, `bitsort.c` = Column 1
bitmap sort, `markov.c`/`markovhash.c`/`markovlet.c`, `qsortints.c`,
`sets.cpp`, `wordfreq.c`/`wordfreq.cpp`, `wordlist.cpp`, `rotate.c`,
`search.c`, `sign.c`, `sort.cpp`, `sortints.cpp`, `sortedrand.cpp`,
`spacemod.cpp`, `squash.c`, `timemod.c`/`timemod0.c`, `priqueue.cpp`,
`genbins.c`, `bitsortgen.c`, `macfun.c`) — confidence is from filename
match against the book's known table of contents, not from having
opened and verified the file bodies yet.

**Why this matters for the weekend session:** the user does not know C
or C++, and does not read pseudocode comfortably either — the original
plan of "Perl as a vehicle for the book's ideas" now has real source to
work from instead of reconstructing algorithms from the book's prose
alone. The natural weekend task is picking one file at a time, reading
its real C, and porting the *idea* into a taught Perl lesson — not
translating C syntax line-by-line, but re-deriving what the algorithm
does and re-expressing it as an idiomatic Perl Concept Unit.

**Next session (once usage resets):**
1. Re-read `src/docs/reference/LESSON SCHEMA.md` fresh.
2. Decide whether `from the book examples/` stays nested inside this
   Perl folder or moves to a neutral shared location (e.g. a sibling
   `programming-pearls-examples/` next to `pascal-getting-started/` and
   `perl-getting-started/`) — currently nested here only because that's
   where the user happened to drop it, not a deliberate architecture
   decision yet.
3. Actually open and read each `.c`/`.cpp` file before trusting it as a
   lesson's Reference Source — filenames were matched from memory this
   session, not the bodies.
4. Rebuild the three existing lessons as full schema-compliant lessons:
   Header with Terms + Objects and methods (full CRC breakdown), Concept
   Units with isolated throwaway labs, actually run/verified output,
   CS/SE lenses.
5. Confirm install instructions against a real Strawberry Perl install —
   not verified this session.
6. Plan a lesson sequence that works through the book's columns roughly
   in order, each one grounded in a real file from
   `from the book examples/`, translated to Perl.
