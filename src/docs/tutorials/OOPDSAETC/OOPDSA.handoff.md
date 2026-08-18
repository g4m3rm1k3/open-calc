# OOPDSAETC Handoff

Read this file, `OOPDSA.BRD.md`, and `src/docs/reference/LESSON SCHEMA.md`
at the start of every session on this curriculum. Nothing else in this
folder — not old lesson files, not `Not part of the series.md`, not any
other curriculum's files. That restriction is deliberate (see
"Working rules" below) and stays in force going forward, not just for
the session that set it.

---

## Why this curriculum exists

This isn't a "learn C++" exercise. The learner has a lot of real project
ideas and has tried, repeatedly, to get an AI agent to build them —
every attempt has turned into a mess, because the learner doesn't yet
have the vocabulary or mental model to direct the work or evaluate
what's being built. This curriculum exists to close that gap: not just
syntax, but the actual OOP/DSA/pattern/SE vocabulary and judgment needed
to collaborate with an AI agent on a real, enterprise-grade codebase —
to know what to ask for, what to push back on, and what "good" looks
like.

The explicit bar, stated directly by the learner: **"whatever it takes
to teach deeper is better."** Depth and correctness win over pace every
time. Do not shorten explanations, skip verification, or compress a
concept to keep a lesson a certain size. If a concept needs more room,
take it.

---

## Status

**Track A — File I/O: complete.** All six lessons (A1–A6) are written,
each one taken through the full `LESSON SCHEMA.md` sequence, every code
sample actually compiled and run this session (not written from memory
or confidence).

| File | Vehicle | Concept |
| --- | --- | --- |
| `A1-container-that-grows-itself.md` | fixed buffer overflow | dynamic array (doubling) |
| `A2-one-class-every-type.md` | copy-paste per type | class → template/generics |
| `A3-cleanup-you-cant-forget.md` | file left open on error | RAII |
| `A4-one-value-at-a-time.md` | file too large for memory | generator / lazy evaluation |
| `A5-one-interface-many-behaviors.md` | which lines matter changes | Strategy pattern / virtual dispatch |
| `A6-a-provably-correct-order.md` | need a provable sort | merge sort + comparator lambda |

The running project across all six lessons is one evolving file,
`dynamic_array.cpp` (in spirit — each lesson's Project Change section
states its real filename), plus two deliberate offshoots: `sum_readings.cpp`
(Lesson A4, because eager-materialization and lazy-generation are
different in kind, not a modification of the same feature) and
`strategy_filter.cpp` (Lesson A5, filtering log lines rather than
building the sortable integer container). By Lesson A6, `dynamic_array.cpp`
reads integers from `readings.txt` via RAII'd `std::ifstream`, stores
them in a hand-built generic `Array<T>`, and sorts them in place with a
from-scratch merge sort taking any lambda comparator.

**Track B — Parsing & Structured Data: complete.** All five lessons
(B1–B5) are written, each taken through the full `LESSON SCHEMA.md`
sequence, every code sample actually compiled and run this session.
Per the confirmed scoping decision (see the old "Starting Track B"
section, preserved in git history), no real JSON/XML parser was built
— the tree is constructed directly in code throughout.

| File | Vehicle | Concept |
| --- | --- | --- |
| `B1-three-ways-to-walk-the-same-shape.md` | nested groups need a defined visiting order | binary tree + pre/in/post-order traversal, iterative rewrite with `std::stack` |
| `B2-one-walk-any-number-of-jobs.md` | new read-only ops keep needing new walk copies | Visitor: `accept`/`visit` double dispatch |
| `B3-looping-over-a-shape-that-isnt-flat.md` | want to loop over the tree like any collection | Iterator: `TreeIterator`/`Tree`, range-based for, real desugaring proof |
| `B4-a-bundle-that-passes-for-a-single-item.md` | a bundle should work anywhere one item does | Composite: `CatalogItem`/`Product`/`Category`, recursion for free |
| `B5-one-copy-shared-by-many-records.md` | thousands of records repeat the same tags | Flyweight: `TagPool` interning, real measured memory savings |

Two project files exist for Track B, not one, by deliberate design
(same "genuinely different in kind" exception Track A used for
`sum_readings.cpp`/`strategy_filter.cpp`): `catalog_tree.cpp` (B1–B3
— `TreeNode`, a fixed-binary struct, plus `Visitor`/`accept` and
`TreeIterator`/`Tree`) and `catalog_composite.cpp` (B4–B5 —
`CatalogItem`/`Product`/`Category`, a variable-arity polymorphic
hierarchy, plus `TagPool`). B1 explicitly scoped itself to a binary
tree on purpose, stating plainly that real n-ary nesting was deferred
to B4 — B4 is where that promise was kept, and B2's own explicit
forward-reference (leaf quantity vs. group quantity being "Lesson B4's
own subject") was delivered there too, not left dangling.
`catalog_tree.cpp`'s `Visitor`/`TreeIterator` were **not** retrofitted
onto B4/B5's new hierarchy — that gap is real and stated honestly in
B4's own Project Change reasoning, not silently glossed over.

Every real, compiled proof behind all five lessons — every isolated
lab, every incremental snapshot, every deliberate failure, B5's real
`/usr/bin/time -l` memory measurement — is preserved in
`verification/B1/` through `verification/B5/`, not only in this
session's own scratchpad. See working rule 8 and
`verification/README.md`.

**Track C — Search & Lookup: in progress (2 of 6).** `C1` and `C2` are
both written, each taken through the full `LESSON SCHEMA.md` sequence,
every code sample actually compiled and run this session.

| File | Vehicle | Concept |
| --- | --- | --- |
| `C1-finding-it-instantly-by-key.md` | scanning every record for a match gets slow as data grows | hash map: DJB2 hashing, chaining, load-factor-triggered rehashing |
| `C2-more-than-one-right-answer.md` | typing a few letters should suggest matches — exact-match lookup can't do that | trie: fixed-size children array indexed directly by character code, on-demand node creation during insert, recursive prefix-subtree collection for autocomplete |

Both of the open questions the old "Starting Track C" section
originally posed were resolved while writing C1: the domain is the
existing catalog (`Product`/`CatalogItem`/`TagPool`, reused verbatim
from B4/B5, Reference Source `verification/B5/step_tagged_products.cpp`
lines 5–43) — `ProductIndex` finds a real `Product*` by its real
`label`, not a lookup over a fresh, unrelated domain. And per the
"near-certain" prediction, Track C's project file is new:
`catalog_lookup.cpp` (referenced as such throughout C1's own prose,
though no literal copy of the file was written outside the lesson
itself and `verification/C1/` — see working rule 5's own precedent,
followed here: Track A's and Track B's evolving project files are
likewise never persisted anywhere outside their lessons' own code
blocks and `verification/`). It is not an extension of
`catalog_tree.cpp` or `catalog_composite.cpp` — a bucket array plus
chaining shares no structure with a binary tree or a composite
hierarchy, the same "genuinely different in kind" reasoning Track B
itself already used twice.

C1 also delivered the handoff's own "strong recommendation": a real
`/usr/bin/time`-measured comparison (not just an asserted big-O claim)
of `ProductIndex::find` against a linear scan, at 200,000 products with
5,000 lookups, `-O2`, matching B5's own real-measurement precedent —
done in C1's Closing, not as a separate Concept Unit (see "Working
rules," item 9, below, for why). Real numbers: linear scan `0.54` user
seconds, hash map `0.03` user seconds, for the identical 5,000 lookups
against the identical catalog — see C1's own "Measured" subsection for
the full command sequence and reasoning, not just the headline numbers.

Every real, compiled proof behind C1 — both isolated labs, all three
incremental project-file snapshots, the deliberate `BrokenProductIndex`
failure, and both scale-comparison programs — is preserved in
`verification/C1/`, per working rule 8.

C2 built a `ProductTrie` on top of the same reused B4/B5 catalog
domain, in a new project file, `catalog_lookup.cpp`'s trie counterpart
— referred to throughout C2's own prose as `catalog_autocomplete.cpp`
(same "no literal copy outside the lesson and `verification/`"
precedent C1 set; not written anywhere else). Per working rule 5's
"genuinely different in kind" exception, restated explicitly in C2's
own Project Change: a `TrieNode`'s fixed 128-slot children array,
indexed directly by character code, shares no structure with C1's
hash-bucket-plus-chaining layout. The catalog itself grew from C1's
four products (`Apple`, `Banana`, `Cheese`, `Bread`) to seven —
`Cherry` (added to prove `"Ch"`/`"Che"` both resolve to a
multi-product, shared-prefix subtree) and `Pea`/`Peach` (added
specifically because `Pea` is a strict prefix of `Peach` — the exact
shape that exposes why `isEnd` has to be a real, explicit marker rather
than an inferred "no children means it's a word" shortcut; C2's own
Closing deliberately breaks and restores exactly this). No scale
measurement was added to C2's Closing — per the handoff's own prior
note (preserved below in "Starting C3"), C1's own hash-vs-linear-scan
measurement already discharged working rule 9's "at least once per
track" bar, and C2's own vehicle (autocomplete) had no natural
single-alternative timing comparison to make.

Every real, compiled proof behind C2 — all three isolated labs
(`lab1_trie_node.cpp`, `lab2_insert.cpp`, `lab3_autocomplete.cpp`), all
three incremental project-file snapshots (`step1_trie_node_only.cpp`,
`step2_insert.cpp`, `step3_full_producttrie.cpp`), and the deliberate
`break_no_isend.cpp` failure — is preserved in `verification/C2/`, per
working rule 8.

---

## Working rules (established this session, binding for every future track)

These are interpretive decisions layered on top of `LESSON SCHEMA.md`
and `OOPDSA.BRD.md` — neither file states them, and both are silent or
ambiguous on these points, so restate them here rather than re-deriving
them from old lesson files (which you're not reading).

1. **Syntax floor.** The learner is fluent in Python and picks up raw
   language syntax independently. Bare language mechanics — loops,
   `if`/`else`, variable declarations, basic I/O (`std::cin`/`std::cout`,
   `print`, etc.), an entry-point function, `#include`/imports — are
   assumed background and get **no Concept Unit, no isolated lab, and no
   Header entry**, in any language this curriculum touches. Everything
   else — classes, inheritance, `virtual`/polymorphism, templates,
   pointers, references, RAII, lambdas, recursion, exceptions, any named
   pattern or SE/CS principle — gets full `LESSON SCHEMA.md` treatment,
   no exceptions, every single time it appears (the Repetition Rule
   still applies in full — "already covered in Track A" is never a
   reason to shorten Track B's own explanation).
2. **Everything shown is actually run, every session.** Every command,
   every piece of output, every "what breaks without this" failure, every
   claim about hidden/compiler behavior was verified this session with a
   real tool before being written into a lesson — `g++`/`clang++` (this
   machine: Apple clang 17, arm64 darwin, both `g++` and `clang++`
   resolve to the same toolchain), `lldb` for backtraces, `ulimit -n` to
   force resource exhaustion deterministically, `/usr/bin/time -l` for
   real peak-memory numbers, and reading the actual local standard
   library headers under
   `/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1/`
   when a claim depends on a standard-library type's real declared
   shape. **This failed twice in Track A** (a sum value and a peak-memory
   number in Lesson A4 were written from confidence, not from an actual
   run, and were wrong when actually tested) — treat that as a standing
   warning, not a one-off. Never paste output you haven't actually
   produced in this session, no matter how obviously correct it seems.
   **It failed again in Track B, in a subtler shape worth naming
   specifically:** while writing B1, several intermediate "Introduce the
   Concept in Isolation" and "Run It" blocks pasted output that was real
   (correct values) but attributed to a *file that was never actually
   compiled in that exact state* — the output was genuinely produced by
   a different, later-stage file, and the code block shown and the
   filename/output claimed next to it had quietly drifted apart. This
   was caught and fixed within the same session by rebuilding every
   referenced intermediate file for real and re-verifying each one
   individually, before the lesson was called done — but the standing
   lesson is: verify that the *exact* code block shown compiles to the
   *exact* output claimed next to it, not just that the output is
   correct in isolation. A correct number next to the wrong file is
   still a fabrication.
3. **No shared concept-file catalog.** `LESSON SCHEMA.md` describes a
   `src/docs/concepts/` catalog for cross-curriculum supporting material.
   This curriculum deliberately does not use it — confirmed directly
   with the learner. Every lesson stays fully self-contained; nothing is
   factored out, nothing is looked up. Do not open or write to
   `src/docs/concepts/`.
4. **File naming.** One lesson file per BRD row: `<RowID>-<concept-first-
   slug>.md`, in this same folder (the one housing `OOPDSA.BRD.md`) — not
   feature-first, not a generic name. Concept-first titles inside the
   file too (`# Lesson A1: A Container That Grows Itself`, not `# Lesson
   A1: Reading Files`).
5. **One evolving project file per track, with deliberate exceptions.**
   Each lesson's Project Change section either extends the previous
   lesson's real project file, or — only when the new lesson's feature is
   genuinely different in kind, not just a variation — starts a new file,
   named for what it does, with the reasoning stated explicitly in that
   lesson's Project Change section (see A4 and A5 above for the actual
   precedent).
6. **Pacing.** Build a full requested unit — a whole track, if that's
   what's asked for — completely, verifying everything for real, before
   stopping. Don't pause mid-track to ask permission to continue. Do stop
   at the boundary actually requested (end of a section/track), and
   don't start the next one unprompted.
7. **Header rigor is non-negotiable.** Every lesson's Header carries a
   full "Terms used" glossary (term, bold, em-dash, definition, *and* why
   the thing exists — never a bare description) and a full "Objects and
   methods used" section (three-part What it is / Implementation / Its
   use, for the lesson's own subject *and* everything else the code
   touches, including reappearing items restated in full, never cited).
   This makes Headers long. That's correct, not a problem to fix.
8. **Verification code lives in `verification/`, not only in a
   session's scratchpad.** Working rule 2 requires every command and
   output shown in a lesson to be verified for real, this session, with
   a real tool — but a session-local scratchpad doesn't survive past
   that session, which meant the exact same isolated labs were getting
   rebuilt from scratch every single session, for no real reason.
   `verification/<LessonID>/` (e.g. `verification/B3/`) now holds every
   `lab*.cpp`/`step*.cpp`/`break*.cpp`/`scale*.cpp` file actually
   compiled and run while writing that lesson — see
   `verification/README.md` for the naming convention and how to use
   it. This does **not** relax working rule 2 or the Concept Isolation
   Rule in any way — an existing file here still has to be recompiled
   and actually re-run to confirm a claim, and a new lesson's Concept
   Units still need their own fresh isolated lab, never a bare citation
   to an old one. What it removes is re-typing the same throwaway code
   from memory every session. Backfilled for Track B (B1–B5) this
   session; Track A's own original verification code predates this
   folder and was not recoverable — starting with Track C, every
   lesson's verification files belong here from the start, added as
   part of that lesson's own session, not retrofitted later.
9. **A real quantitative measurement (timing, memory) that closes out a
   track's own performance claim belongs in the lesson's Closing, not a
   separate Concept Unit.** `LESSON SCHEMA.md`'s Concept Unit sequence
   is built for teaching one new *construct*; a scale measurement
   proving a claim about already-taught constructs isn't one — it has
   no new hash function, no new syntax, nothing the Concept Isolation
   Rule's isolated-lab machinery is actually for. B5 set this precedent
   first, measuring Flyweight's real memory savings with
   `/usr/bin/time -l` in its own Closing rather than a sixth Concept
   Unit; C1 followed it, measuring `ProductIndex` against a linear scan
   with plain `/usr/bin/time` (real/user/sys, no `-l` — no memory claim
   this time, a timing one) in its own Closing. Keep doing this in
   Track C where a lesson has a natural head-to-head comparison to make
   — Track C's whole premise is speed, not a one-off concern for C1
   alone — but see "Starting C3," below, for why this isn't a rule to
   force onto every remaining C-lesson regardless of fit.

---

## Starting C3

Track C's BRD framing: *"Language: C++. 'Find this fast' is the excuse;
the data structure that makes it fast is the point."* The six rows (C1
hash map — done, C2 trie — done, C3 Bloom filter, C4 BST, C5
self-balancing tree, C6 skip list) are all straight DSA — no
pattern-vs-parsing scoping ambiguity the way Track B's JSON/XML framing
needed resolving; nothing here needs a scope confirmation the way B1
did.

**Resolved by C1 and C2, not still open:** the domain question this
section originally posed. Both lessons reused the existing catalog
(`Product`/`CatalogItem`/`TagPool`, verbatim from B4/B5), indexing real
products by their real `label` (C1) or full path of characters (C2),
and it worked well both times: real continuity, a built-in reason each
structure exists, no forced or contrived example data. Default to the
same choice for C3 (a Bloom filter giving a cheap "definitely not in
the catalog" pre-check, per the BRD's own C3 framing) unless C3's own
vehicle turns out not to fit the catalog naturally — still a
per-lesson judgment call, not a hard rule, the same status Track B's
own `Array<T>`-vs-`vector` question had. Project file — both C1 and C2
confirmed the prediction that Track C needs a new file per lesson
whose structure is genuinely different in kind from what came before:
`catalog_lookup.cpp` (C1's hash map) and `catalog_autocomplete.cpp`
(C2's trie), neither an extension of the other or of
`catalog_tree.cpp`/`catalog_composite.cpp`, each stating that reasoning
explicitly in its own Project Change per working rule 5. A Bloom
filter — a bit array plus several hash functions, no nodes, no
buckets, no chains — is, in the same way, genuinely different in kind
from both a hash map's bucket-and-chain layout and a trie's
character-indexed node tree; expect C3 to need its own new file too,
and state that reasoning explicitly in C3's own Project Change, the
same as C1 and C2 both did — don't skip restating it because the
pattern is now well established.

**Delivered by C1, carried forward by C2, still open for C3:** working
rule 9 (added while writing C1) — a real quantitative measurement
belongs in a lesson's Closing, not a separate Concept Unit, and Track C
should demonstrate this "at least once in the track," not on every
single lesson regardless of fit. C1 discharged that bar already,
measuring `ProductIndex` against a linear scan with plain
`/usr/bin/time`. C2 correctly did not force one — autocomplete had no
single obvious head-to-head alternative worth measuring. A Bloom
filter's own natural claim is different in kind from either: not "is
this faster," but "how much memory does a maybe-check cost compared to
actually storing every key" — if C3's own vehicle surfaces a real,
natural memory comparison to make (a Bloom filter's bit array vs. the
trie's or hash map's real, actually-storing-every-key footprint), that
would be a legitimate second real measurement for the track, in C3's
own Closing, following B5's and C1's own `/usr/bin/time`/`-l`
precedent — still a per-lesson judgment call based on actual fit, not
a rule requiring one every time.

**C2's own catalog-growth precedent, carry forward if useful:** C2
grew the shared catalog from C1's four products to seven, adding
products specifically chosen to expose its own concept (`Cherry` for a
shared-prefix, multiple-match case; `Pea`/`Peach` for the
one-label-is-a-strict-prefix-of-another case). If C3's own vehicle
benefits from catalog entries chosen the same deliberate way — not
arbitrary padding, but specific data shaped to make the Bloom filter's
own behavior (a real false positive, a real true negative) actually
observable — that's a legitimate move, the same judgment call C2 just
made, not a special case requiring justification beyond what Project
Change already asks for.
