# Curriculum Notes — PocketDB

Working notes for whoever writes or edits lessons next (human or AI) —
the *why* behind this course that isn't itself part of any single
lesson, so a later session doesn't quietly drift back toward a weaker
version of this plan.

## Why this project exists

**This is not coursework — it's preparation for two real, upcoming
courses**, same term (2026 C-5, Aug–Oct), so their material lands on
real understanding instead of unfamiliar ground:

- **IT-312, Software Devel w/C++.Net** — required text: *Murach's C++
  Programming* (data types, operators, functions, classes and
  inheritance, OOP case studies). ".Net" in the catalog title is the
  department's naming/IDE detail (Visual Studio), not a technical
  requirement — the required textbook teaches standard ISO C++, not
  C++/CLI, and this curriculum targets standard C++ accordingly.
- **CS-370, Current/Emerging Trends in CS** — optional texts: *Applied
  Reinforcement Learning with Python* (OpenAI Gym, TensorFlow, Keras) and
  *Deep Learning with Keras*.

Rather than two disconnected toy projects (a C++ exercise here, a Python
ML notebook there), this is one real system: a database engine written
in C++, with a Python analysis/ML/RL platform built on top of it. Both
courses' *material* is prepared for by building one real thing, not by
running two unrelated curricula that happen to share a repo — but
nothing in this project is submitted to, graded by, or required to match
either course's actual syllabus or assignments.

## The organizing rule, in the user's own words

> I do not want a C++ tutorial, I want a project we learn C++ along the
> way, the project is the vehicle to learn C++, so not 5 lessons of C++
> basics throw away, those are concepts and live in the concepts folder
> linked to the lessons available for each lesson, can have more than
> one in a lesson, and show up when we need them, not all out front,
> everything shows up when we need it, everything is a vertical slice
> from lesson 0's setup, connecting python to C++, building the first
> C++ feature and python talking to it full integration from step one,
> DSA and OOP in both, software engineering in both from the start not
> full C++ then hook python up to it after, but we also don't force one
> in a lesson it doesn't belong.
>
> But a slice is not a lesson, a lesson is a learning increment and
> several lessons can be one slice.

Concretely, this means:

1. **No standalone fundamentals lessons, in either language.** A
   pointer, a class, a template, a decorator, `ctypes` — each is taught
   the first time the *project's own code* genuinely needs it, as that
   lesson's own Concept Unit, following `LESSON SCHEMA.md`'s existing
   Concept Files mechanism for whatever's general enough to write out to
   `src/docs/concepts/` for reuse (see `README.md`'s own section on this
   — not re-derived here to avoid two copies drifting apart).
2. **Lesson 0 already spans the full stack.** The very first lesson
   builds a real, if trivial, `extern "C"` function in C++, compiles it
   to a shared library, and calls it from Python via `ctypes` — proving
   the entire pipeline before any database concept exists, so every
   later lesson only ever adds *capability*, never plumbing-for-the-
   first-time.
3. **DSA and OOP are taught in both languages, from the start, as the
   project actually needs them** — not "C++ does DSA/OOP first, Python
   catches up in a later phase." The original slice plan drafted in this
   session's earlier design conversation put Python-side work after the
   C++ engine was mostly built; that was flagged as wrong and corrected
   before any lesson content was written (see the design conversation
   this file's own git history preserves, not re-transcribed here).
4. **Not forced.** A slice crosses the language boundary somewhere, but
   an individual lesson doesn't manufacture Python-side busywork just to
   keep every single lesson symmetric — see `README.md`'s "Slices vs.
   lessons" section.
5. **One flat folder, one sequential lesson list — not split by
   language.** The first attempt at this structure used `cpp/` and
   `python/` subfolders; corrected the same session, before Slice S01
   was written, per the user's own direction: "They should be sequential
   and the renderer renders them in order I will have to open the menu
   go to the other folder and I won't know when since they won't always
   have the same lesson numbers... if we are building a single project
   it only makes sense we have a single project directory." Every lesson
   file now lives directly in this folder, numbered as one continuous
   sequence (`Lesson-00`, `Lesson-01`, ...) regardless of which language
   it's in — matching Slice S00's own real split (`Lesson-00` is C++,
   `Lesson-01` is Python, same slice, two lessons, one sequence).

## Scope additions, in the user's own words

After Slice S00 was built and reviewed, two more directives, both now
load-bearing on the slice plan in `README.md`:

> I want them to be good build real software, OOP, DSA, Design patterns,
> we should make ways to connect to the database, allow orm connections,
> no libraries used except for the language and ml stuff, we hand roll
> everything we can.

> like we want to be able to pull in a csv into the database, and if we
> can add optimisations that sqlite might have been missing, and keep it
> compatible with sqlite at the same time.

Concretely, folded into the slice plan as S03 (CSV import — originally
planned as S02, reordered after S01 shipped: importing a real dataset
into a database with no persistence yet isn't a very honest showcase of
the feature, so persistence, S02, now comes first), S05 (a
hand-rolled ORM plus a `sqlite3`-module-shaped connection layer — "ways
to connect," plural, on purpose), and the new "SQLite: compatible where
it helps, divergent where it's honestly better" section of `README.md`.
The library policy ("hand roll everything we can" except "the language
and ml stuff") is stated precisely in `README.md`'s "Hand-rolled, not
delegated" principle — read that copy as authoritative, not
re-summarized here to avoid two copies drifting apart.

## The real, persistent reference project

A folder named `pocketdb` directly under the user's own local `Documents`
folder — outside this repo entirely, per explicit instruction ("it
should not live in this workspace... just documents folder is fine,
create a new folder there"); the exact local path is deliberately not
recorded here since this repo is open source and that path is
machine-specific personal information, not project data. This is a real,
working copy of the project, built and verified from that location as
each lesson is written — not scratch/throwaway work, and not duplicated
lesson content; it's the actual, tested proof that what a lesson
instructs a reader to build really does compile and run, kept in sync
lesson by lesson. Currently holds `engine.cpp` (both `extern "C"`
functions from Lessons 0–1), `call_engine.py`, `call_double_no_types.py`,
and `schema.cpp` (Lesson 2) — verified, this session, to build and
produce identical output to what the lessons themselves document.
Compiled artifacts (`.dll`/`.exe`) are rebuilt as needed, not treated as
meaningful source.

## Further scope additions, in the user's own words

> if you want to build it in an upper level folder as you create the
> lessons to test it, then you can add screenshots as well to the
> lessons when testing, and tesing and logging and all, absolutely all
> softare engineering concepts taught, DDD all of the things. I should
> be a master at Cpp and python and these libraries when finished.
>
> following the lesson schema of course.

Concretely:

- **Testing and logging are real, taught concepts, not deferred to the
  end.** Both get introduced — hand-rolled, per the library policy — the
  first time the growing project genuinely needs them (a hand-rolled C++
  test macro/runner once `Schema`/`Row` have real logic worth protecting
  against regressions; a hand-rolled structured logger once a real
  failure needs diagnosing), the same "not forced, introduced when
  needed" rule as everything else in this plan — not reserved for one
  dedicated slice at the end.
- **DDD (Domain-Driven Design)** — entities, value objects, aggregates,
  the Repository pattern — surfaces naturally where the project's own
  shape already calls for it, most directly in the ORM slice (S05,
  `README.md`), where Python model classes mapping to tables *are* DDD's
  entity/aggregate vocabulary in practice, not an abstract add-on.
- **Screenshots, where the project produces real pixels.** This project
  is console/library-first — most output is real, captured text, which
  stays the standard (matching every other curriculum in this repo).
  Once a lesson produces something genuinely visual (a `matplotlib`
  chart in the analysis slices, S11+), the real generated image file is
  what gets embedded, not a manually-described screenshot.
- **Mastery is the actual bar.** "I should be a master at C++ and Python
  and these libraries when finished" is the standing measure for whether
  a lesson's depth is enough — read literally, not as rhetorical
  emphasis, when judging whether an explanation is thorough enough.

## Starting floor — stated once, self-contained

Zero C++ (no assumed exposure to pointers, structs, classes, or any
other C++ construct). Zero Python OOP/DSA beyond this repo's own
established `ai-rl-track` floor (variables, functions, loops, lists,
dictionaries, basic syntax) — reused as a *stated floor*, not as
reused *content*; no lesson here depends on any file in `ai-rl-track`,
`lisp-cpp`, or the Engineering Toolbox C lessons actually existing or
having been completed. This project is fully self-contained by design —
explicitly decided this session after checking whether those other
projects' content could be reused, and ruling it out (mismatched lesson
contracts, and — more importantly — the user's own direction that this
project should be planned and built on its own terms, not stitched
together from audits of unrelated curricula).

## Governing documents

`LESSON SCHEMA.md` + `LESSON_CONTRACT.md` (both in `src/docs/reference/`)
govern every lesson file in this project — the same Concept Unit
structure, Repetition Rule, Concept Isolation Rule, and
explain-don't-describe discipline already proven on `pocket-inventory-wpf`.
Run the checker with: `node scripts/check-narrative-lessons.mjs src/docs/projects/pocket-db`
— a single, flat folder, so no per-language subfolder invocation is
needed the way an earlier draft of this structure required. Consider
adding it to the script's own `DEFAULT_FOLDERS` once the project is far
enough along to be worth linting by default.

## Verification standard

Every C++ example is real, compiled and run for real this session with
`g++` from the MSYS2 install at `C:\msys64\ucrt64\bin\g++.exe` (standard
ISO C++, no compiler-specific extensions — a MinGW.org install also
exists at `C:\MinGW\bin\g++.exe` but its own `g++ -shared` failed
silently every time it was tried this session; not investigated further
once the MSYS2 toolchain was confirmed working). `C:\msys64\ucrt64\bin`
must be on `PATH` or `cc1plus.exe` fails with `STATUS_DLL_NOT_FOUND` —
documented directly in Lesson 0 itself, since it's a real, reproducible
setup step, not a one-off. Every Python example is run for real with the
system `python` (3.13.14) — and once a lesson depends on the compiled
C++ shared library, that library is actually built and actually called
via `ctypes` in this same session, not predicted.

## Naming

The project: **PocketDB**. The Python package: **`pocketdb`**. Rename
either if a better name surfaces later — nothing downstream depends on
the name yet.

## Pacing

Built one lesson at a time, each one reviewed before the next starts —
the same cadence already established across this repo's other curricula
(`pocket-inventory-wpf`, `ai-rl-track`). Within a slice, lessons are
planned loosely ahead of time (see `README.md`'s slice table) but only
actually written one at a time, since a slice's real shape sometimes
calls for a different lesson breakdown than estimated ahead of time.

One real deviation from "reviewed before the next starts," explicitly
authorized: after Lesson 5, the user stepped away ("you can just
continue to build through") and Lessons 6 through 12 were built
autonomously in one continuous session, each still fully verified (real
compiles, real `g++`/`python` runs, both checker passes) and each still
updating the real external reference project — but without the user
reviewing each one before the next began. Worth a read-through pass
when there's time, the same way any unreviewed batch of work would be,
even though nothing here skipped its own real verification.

## Status

**Slice S01 complete** (`Lesson-00` through `Lesson-12`) — the real,
original promise `README.md` stated for it: "Python creates a table in
the C++ engine, inserts a row, reads it back — real data, real round
trip," proven end to end by `demo.py` (Lesson 12), using nothing but
`pocketdb`'s own real, public interface (`Database`, `create_table`,
`insert`, `get`, `close`, `PocketDBError`) — no direct `ctypes` calls,
no raw handles, none of the `extern "C"` machinery visible to a real
user of the package. Along the way, this slice also delivered:
`explicit`/`override`/`std::string`/`std::cout`/`std::endl` (gaps a
manual self-check caught that the structural checker couldn't, all
fixed at their true first appearance in Lesson 2); real C++ exception
handling, both in isolation and applied to the project (Lesson 4, and
extracted afterward into the shared `cpp-exception-handling.md` concept
file); real separate compilation and linking, both proven with caused
failures (Lesson 3); the opaque-handle FFI pattern and the real reason
`std::string`/`Schema` can never cross an `extern "C"` boundary (Lesson
6); a real, caused process crash from an uncaught C++ exception
crossing into Python, and the `try`/`catch`-at-the-boundary fix applied
project-wide (Lesson 7); the correct real memory-ownership pattern
crossing a boundary in the *other* direction — `c_void_p` +
`string_at` + an explicit, matching free call — proven against a real,
tempting wrong approach first (Lesson 8); the first real Python OOP in
this curriculum (Lesson 9); real exception translation at a boundary,
turning Lesson 7/8's own raw sentinels into a real, named
`PocketDBError` (Lesson 10); and `**kwargs`/`*args` completing the
exact ergonomic API `README.md` promised from the start (Lesson 11).

`scripts/check-narrative-lessons.mjs` itself grew a new, permanent
capability during this slice — real C++ code-vocabulary coverage
checking (`std::`-qualified calls, a fixed list of notable keywords),
cross-referenced against every lesson's own Header, in filename order —
added after a manual self-check caught two real gaps
(`std::to_string`, `explicit`) the original, purely-structural checker
had no way to see. This capability is not project-specific; it now
checks every C++ curriculum this script covers.

## The MiniDB BRD — reference, not the active plan

`brd.md` and `lessons.md`, in this same folder, are the user's own
(externally-drafted, pasted into this session) product-requirements
document and curriculum outline for a much larger, production-scale
embedded database ("MiniDB") — MVCC, a cost-based optimizer, SIMD
vectorized execution, columnar storage, Arrow interop, parallel query
execution, vector/full-text search, and more, staged across 52 slices.
Both files are excluded from `check-narrative-lessons.mjs`'s own
lesson-file scan (`NON_LESSON_FILENAMES`) — they're reference material,
not narrative lessons themselves, the same treatment `README.md`/
`CURRICULUM_NOTES.md` already get.

Explicitly **not** the active plan: even the BRD's own stated MVP
(section 75) — persistence, B+ tree, buffer pool, transactions, WAL,
crash recovery, Arrow, pandas, basic vectorized execution — is a
multi-month undertaking for an experienced engineer, let alone taught
at this repo's own real, verified, one-concept-at-a-time depth. Kept as
the honest long-term vision/north star; the real, active plan stays
`README.md`'s own slice table, which pulls *specific* pieces from the
BRD in as new slices when there's an actual, current reason to (S06's
hash index, S07's B-tree, S10's transactions already did this before
the BRD was ever pasted in).

## S02 real vs. shortcut, in the user's own words

> now we are building just data structures and we are probably going
> to just store a flat file?

A real, caught design risk: "page-based binary file storage" (S02's
original one-line description) could have been built as a single
whole-file serialize-on-close/deserialize-on-open blob — genuinely
satisfies "survives a restart," but doesn't scale (every write rewrites
the whole file) and gives S06/S07/S12 (hash index, B-tree, WAL) nothing
real to build on top of later. Corrected before any S02 lesson was
written: S02 is now S02a–d (`README.md`'s own slice table) — a real
file header, a real fixed-size (4 KiB) page manager with a free-list, a
real slotted-page record encoding, *then* `Table`/`Database` rewired to
use real pages — matching the BRD's own Slices 1–4, which is exactly
the "keep the real database parts" the user asked for.

> we can scale down the brd, but keep the real dastabase parts and
> create the mvp that wroks and is useful

> I want to test it with python and C++, so we expose the api on each
> slice and build the python connection to it, this creates a
> repatitive loop and that is what makes it stick.

A real, deliberate tightening of the existing "every slice crosses the
boundary somewhere" rule, scoped to foundational systems work
specifically: S02a through S02d each get their own real `extern "C"`
exposure and their own real Python test, not just S02's own final,
assembled result — see `README.md`'s "Slices vs. lessons" section for
the reasoning (a wrong page format silently corrupts everything built
on it later; catching that early, per-piece, is worth the extra
lessons). Documented as the standing approach for this kind of work
going forward, not a one-time exception.

S02a (`Lesson-13`, the real file header), S02b (`Lesson-14`,
`PageManager` — fixed-size pages, direct-addressed allocation, a
self-hosted free-list), S02c (`Lesson-15`, `record_page` — tag-prefixed
flat `Row` encoding plus a real slotted-page layout), and S02d
(`Lesson-16`, a real catalog page plus `Table`/`Database` rewired to
use it) are all complete and verified in the real reference project.
**S02 — real, on-disk persistence — is done.**

S02d closed both gaps earlier lessons deliberately left open:
`database_c_api.cpp`'s own `database_open` now keeps its `PageManager`
for the `Database`'s whole real lifetime instead of discarding it
(Lesson 14's own documented gap), and `pocketdb.py`'s own
`Database.__init__` finally takes and passes a real path instead of
calling `database_open()` with none at all (Lesson 12's own documented
gap). `demo.py` runs correctly, and a completely separate Python
process reopening the same `games.pdb` afterward reads back the
identical real rows, purely from the file's own bytes — the original
promise `README.md`'s S02d row made, proven for real, in the real
reference project, not just the lesson text.

S03 (`Lesson-17`) is also complete and verified in the real reference
project: `database_insert_many` — a real, bulk `extern "C"` entry point
taking a whole batch of rows as one flat, row-major array — and
`pocketdb.import_csv(path, table)`, using the standard-library `csv`
module. `database_insert_many` deliberately returns a real, partial row
count rather than a flat boolean, since this project has no
transactions yet (S10) to make a bulk insert genuinely atomic — proven
against a real, deliberate page-overflow partial failure, not just the
success path. `import_csv` was proven against a real `.csv` file, then
proven again by a completely separate Python process reopening the
same database afterward and finding the imported rows still there —
the real payoff of sequencing CSV import after persistence (S02)
instead of before it.

S04 (`Lesson-18`) is also complete and verified in the real reference
project: `record_count`/`Table::row_count`/`database_row_count` and
`database_column_names` give a table scan the two minimal real answers
it needs (how many rows, what are the columns called); Python's own
`Record` class supports both `record[0]` and `record["score"]`
(`__getitem__`, matching `sqlite3.Row`'s own real shape — deliberately,
ahead of S05's own committed `sqlite3`-shaped compatibility layer, not
by coincidence) and `Database.query(table)` performs a real table scan
built entirely from already-proven pieces, no new persistence
mechanism. Proven against a multi-row table, an empty one, a
nonexistent one, and — the real point of every S02-and-later slice — a
completely separate Python process reopening the database and getting
the identical, real `Record` objects back.

S05 (`Lesson-19`) is also complete and verified in the real reference
project — no new C++ at all. `dbapi.py` gives PocketDB a real,
`sqlite3`-shaped `connect()`/`.cursor()`/`.execute()`/`.fetchall()`/
`.fetchone()` surface, deliberately narrow: it recognizes only
`SELECT * FROM table` and `INSERT INTO table VALUES (...)` (the qmark
paramstyle `sqlite3` itself defaults to), raising a real error for
anything else rather than guessing, since no real SQL parser exists
yet (S08). `orm.py` gives it a real, hand-rolled `Model` base class —
subclasses describe a table once as `_table`/`_columns`, and
`save`/`all` work for any of them via `setattr`/`getattr`, no
per-model duplication. Both proven against a database shared between
the ORM, the DB-API surface, and a plain `pocketdb.Database` call, and
across a real process restart.

Noted, not scheduled: the user wants an eventual Electron + React +
TypeScript GUI client (DBeaver-shaped) once the engine has enough
query surface (S08+) to be worth building a GUI around — flagged in
`README.md`'s own "Noted future direction" note, would be its own,
separate curriculum, not folded into this lesson sequence.

S06 (`Lesson-20`) is also complete and verified in the real reference
project: a real `std::unordered_map` hash index on `Table`, `mutable`
and lazily built on first use, updated incrementally on every insert
rather than fully rebuilt. Benchmarked for real with
`time.perf_counter()` against `query`'s own linear scan, at the real
worst case (finding the last row of a 100-row table, near this
project's own real one-page-per-table capacity limit, ~130 rows for
that table shape) — a real, repeatable tens-of-times speedup, measured
and printed, not asserted, per `README.md`'s own standing rule on
performance claims.

S07 (`Lesson-21`) is also complete and verified in the real reference
project: a real, hand-rolled `BTreeIndex` (genuine node splitting, not
`std::map` standing in for one), one real tree per column cached
lazily on `Table`, the identical incremental-update/lazy-build
discipline S06 established. Benchmarked for real against `query` plus
a Python-side filter — a real, repeatable ~9x speedup, honestly smaller
than S06's hash-index number (~60-90x), for real, explained reasons
(a range match costs real time proportional to how many rows match,
not just O(1)).

S08 (`Lesson-22`) is also complete and verified in the real reference
project — no new C++, same pattern as S05. `where_parser.py` hand-rolls
tokenizing (`str.split()`) and evaluation for this project's own real,
minimal `WHERE` subset; `dbapi.py`'s `Cursor.execute` now finds
`WHERE`/`ORDER BY`/`LIMIT` in any real, present-or-absent combination.
Deliberately, honestly still a linear scan plus Python-side filter —
`WHERE` does not automatically reach for S06/S07's own indexes, a real,
named, open gap (a real query optimizer's job), not hidden.
Left-to-right condition evaluation with no real operator precedence
(`"a OR b AND c"` behaves as `"(a OR b) AND c"`) is also a documented,
honest simplification.

S09 (`Lesson-23`) is also complete and verified in the real reference
project. This one is worth flagging specially: the hardening half found
a genuine, real, currently-shipping bug, not a hypothetical one —
`page_manager_open` (added Lesson 14) never got the `try`/`catch`
treatment Lesson 7 established for `database_c_api.cpp`, so opening a
corrupted `.pdb` file through it really did crash the whole Python
process (`std::terminate`), reproduced for real in both the lesson and
the reference project before being fixed. `record_page_init` was
hardened too, defensively. The analysis half — `analyze.py`, real
`statistics` + a real, saved `matplotlib` histogram over 100 real,
persistent rows — is the first slice in this whole curriculum that
isn't about the engine's own internals.

S10 (`Lesson-24`) is also complete and verified in the real reference
project — no new C++. `Transaction` (`Database.begin()`/`.commit()`/
`.rollback()`) stages real `insert` calls in memory, proven against a
real experiment runner (`README.md`'s own named S10 use case) where a
failed trial correctly leaves zero real rows behind. Deliberately,
honestly demonstrated where the guarantee stops: a failure *inside*
`commit()` itself (a real page-overflow, reusing Lesson 15's own real
condition) still leaves already-written real rows in place — no
write-ahead log exists to undo them, a named, real, deliberately
deferred gap, not a hidden one. **The engine itself (S00-S10) is done,
for now** — S11-S13 build on top of it rather than extending it
further.

S11 (`Lesson-25`) is also complete and verified in the real reference
project. Real, queried rows convert into a real `pandas.DataFrame` in
one call; a per-team average and a real standard deviation were each
computed two real ways — an explicit, hand-built loop, and
`pandas.groupby`/`numpy.std(ddof=1)` — agreeing exactly to several
decimal places. `pandas`/`numpy` needed installing in the verification
environment (`pip install pandas`; `numpy` came in as a `matplotlib`
dependency already) — a real, expected one-time setup step, not a
curriculum concern (a student's own single Python environment with
`pip install pandas numpy matplotlib` won't hit the dual-Python DLL
quirk this session's own sandboxed verification environment did).

S12 (`Lesson-26`) is also complete and verified in the real reference
project. Real, hand-worked gradient-descent math (verified by hand for
one step before trusting any loop) trained three real ways on a real,
150-row, PocketDB-stored dataset: `scikit-learn`, a hand-built single
neuron, and `Keras`. `scikit-learn` (0.927 accuracy) beat both the
hand-built version and `Keras` (0.880 each, nearly identical to each
other since both run plain SGD) — explained honestly as a better
default optimizer (L-BFGS vs. plain gradient descent), not a different
model. `tensorflow`/`keras` needed installing into a short-path venv
(`C:\tfenv`) since the WindowsApps Python's own deeply-nested
site-packages path hit Windows's MAX_PATH limit installing TensorFlow
directly — a real, environment-specific verification workaround
(avoided the system-wide long-paths registry change deliberately, per
this session's own caution around system-level changes), not a
curriculum concern.

S13 (`Lesson-27`) is also complete and verified in the real reference
project — **the final slice. The full, planned S00-S13 curriculum is
done.** A real `gymnasium` `FrozenLake-v1` Q-learning agent trained
live (5000 episodes, epsilon decay 1.0→0.05) to a perfect 1.00 win
rate; a real, deliberate two-phase design persisted only a small,
bounded sample of the *converged* policy's own experience (60
transitions from 10 episodes, batched per episode via Lesson 24's own
`Transaction`) rather than every transition from all 5000 training
episodes — honestly bounded by, and reframed as a genuine parallel to,
S02's own real one-page-per-table capacity limit (~95 rows for this
schema), which turns out to model a real, standard, bounded
replay-buffer design, not merely work around a limitation. A real,
separate process (`replay_agent.py`) then reopened the database and
replayed nothing but those 60 stored rows — no live environment at all
— into an equally perfect 1.00 win-rate policy. This is `README.md`'s
own S13 promise, and the whole project's own persistence story since
S02, literally demonstrated in one, final, working proof.

Real, notable debugging during this lesson's own development: the
first, naive training attempt (constant epsilon=0.3, 500 episodes) only
found the goal once, because `FrozenLake`'s own sparse-reward,
hole-avoiding map makes pure-epsilon exploration genuinely hard (a pure
random walk wins only ~0.8% of the time, verified directly). Fixed with
real, standard epsilon decay (1.0→0.05) and more episodes (5000) —
documented directly in the lesson's own Mechanical Walkthrough and
"What Breaks Without This" section as real, honest, in-repo proof, not
smoothed over.

`gymnasium` (OpenAI Gym's real, actively-maintained successor) was
installed into the same short-path `C:\tfenv` venv used for S12's own
TensorFlow/Keras verification.

**Session note:** this entire S02-S13 span (Lessons 13-27, 15 real
lessons) was built in one continuous, autonomous run per explicit user
instruction ("finish out this series without stopping"). Every lesson
was verified with the same rigor as S00-S01: isolated proofs compiled/
run for real, full assemblies checker-passed, then copied into and
re-verified against the real reference project at
`C:\Users\g4m3r\Documents\pocketdb\`, before moving to the next slice.
