# PocketDB — a database engine in C++, an analysis platform in Python

## What this is

One running project, two languages, built together from the first lesson,
**one flat, sequentially numbered lesson list** — `Lesson-00`, `Lesson-01`,
`Lesson-02`, and so on, all in this same folder, no per-language
subfolders. The renderer shows lessons in that one order; some are C++,
some are Python, in whatever order the project's own real needs put
them — never a fixed alternation, and never two separate lists you have
to jump between to follow one project.

This isn't coursework itself — it's real, hands-on preparation for what
two upcoming courses will assume you already know: IT-312 (C++, DSA,
OOP — *Murach's C++ Programming*) and CS-370 (which points at *Deep
Learning with Keras* and *Applied Reinforcement Learning with Python*).
Nothing here is a graded deliverable for either course; it's built purely
so those courses land on real understanding instead of unfamiliar ground.

Every lesson is governed by `../../reference/LESSON SCHEMA.md` and
`LESSON_CONTRACT.md` — the same contract already proven on
`pocket-inventory-wpf`. See `CURRICULUM_NOTES.md` in this folder for the
full reasoning behind every decision below.

## The project is the vehicle — there is no tutorial preamble

There is no "5 lessons of C++ basics" and no "5 lessons of Python basics"
before the real project starts. **Lesson 0 already builds and runs real
project code on both sides of the language boundary.** A C++ language
feature (a pointer, a struct, `extern "C"`, a template) or a Python one
(a class, a decorator, `ctypes`) is taught exactly at the lesson where
the project's own code first needs it — never earlier, never as its own
standalone "Learn X" lesson.

Where that feature is narrow — true only of *this* lesson's own code —
it's explained inline, the same as any other curriculum in this repo.
Where it's general enough to plausibly recur elsewhere (a CS idea, a
design pattern, a language feature with a life outside this project), it
gets written out once as a concept file in the repo's one shared catalog,
`src/docs/concepts/`, and every lesson that needs it again — in this
project or a completely different curriculum — cites it by filename. A
single lesson can cite more than one concept file. This is not a new
mechanism: it's `LESSON SCHEMA.md`'s existing "Concept Files — Reuse
Across Lessons and Curricula" rule, applied here from lesson 1 instead of
retrofitted later.

## Slices vs. lessons

A **slice** is a milestone: one new, demonstrable, end-to-end capability
— something you can point at and say "this works now" on both sides of
the boundary. A **lesson** is one learning increment inside a slice. A
slice is usually several lessons, not one; a lesson never spans more than
one new concept-cluster just to hit a slice boundary early.

Every slice crosses the language boundary somewhere — but not every
single lesson inside it does. If a slice's next piece is genuinely
C++-only (say, replacing a table scan with a hash index internally), the
lesson that builds it stays C++-only; the Python-side payoff (benchmarking
the speedup) is its own following lesson, not manufactured busywork
bolted onto the C++ lesson to force symmetry.

**Deliberate exception, starting with S02's page-based storage:** for
foundational systems work — the kind where a subtle bug in one small
piece (a page header, a free-list) silently corrupts everything built on
top of it later — each real sub-piece gets its own `extern "C"`
exposure and its own real Python test, not just the slice's final,
assembled result. This is a real, intentional tightening of the loop
above, not a contradiction of it: repeating "build a real piece, expose
it, prove it from Python" at a finer grain is what actually catches a
wrong page format before three later slices (buffer pool, B+ tree, WAL)
get built on top of it. S02a–d (below) is the first place this applies.

## Architecture

```text
                     Your Application
                            │
             ┌──────────────┴──────────────┐
             │                              │
        C++ Database                  Python Library
             │                              │
      Table / Schema / Row              db.create_table()
      HashIndex / BTree                 db.insert()
      Query parser + engine             db.query()
      Page-based file storage           db.dataset()
             │                              │
             └────────── extern "C" ────────┘
                    database_open()
                    database_close()
                    database_execute()
                    database_fetch()
```

The `extern "C"` row is the one, deliberately narrow, stable boundary.
Everything above the Python side of it — `pocketdb.open()`,
`.create_table()`, `.insert()`, `.query()` — is a real Python package
*you* design, not raw `ctypes` calls exposed directly to whoever uses the
project. The raw FFI machinery (function pointers, `c_char_p`, struct
layouts) is real and taught for real, but it lives inside `pocketdb`'s
own implementation, not in the example code someone using the finished
package would write.

## Design principles

- **Runtime-defined schema.** The C++ engine never knows the subject of a
  table ahead of time — `CREATE TABLE games (id INTEGER, score INTEGER)`
  and `CREATE TABLE machine_data (timestamp INTEGER, temperature REAL)`
  are handled by the identical engine code. The subject is data the
  engine receives, not a C++ class hierarchy baked in per use case. This
  is what makes `Schema`/`Column` (with `IntegerColumn`/`TextColumn`/
  `RealColumn` subclasses) a real, load-bearing OOP design, not a toy one.
- **Two APIs, two audiences.** The `extern "C"` API is the low-level FFI
  boundary — narrow, stable, C-shaped types only. `pocketdb` is the
  actual product — the thing a Python user (including your own later
  ML/RL lessons) actually imports and uses. Both are real engineering
  artifacts you design, not one throwaway wrapper around the other.
- **Every slice is provably real.** Every C++ lesson's code actually
  compiles and runs (this repo verifies with `g++`, standard ISO C++, no
  compiler-specific extensions — also buildable in Visual Studio if
  that's ever useful, though nothing here targets it specifically).
  Every Python lesson's code actually calls into the real compiled
  shared library via `ctypes` and gets a real result back — nothing
  here is predicted output.
- **Hand-rolled, not delegated.** No third-party libraries, in either
  language, for anything the project itself is supposed to teach — no
  SQLite, no existing ORM (SQLAlchemy, peewee), no third-party JSON/CLI/
  test-framework package standing in for something this project should
  build itself. "The language" includes its own standard library (C++'s
  `<fstream>`/`<string>`/`<vector>` for plumbing, Python's `os`/`json`/
  `struct`) — that's not a third-party dependency, it's the language
  itself, the same as any other curriculum in this repo. The one
  deliberate exception is the ML/RL stack named in the slice plan below
  (NumPy, pandas, matplotlib, scikit-learn, TensorFlow, Keras, OpenAI
  Gym) — those are the actual subject of the two courses this project
  prepares for, not a shortcut around building something else.
- **Design patterns, named when they appear, never forced.** OOP and DSA
  are joined by a third pillar: real software-design patterns, arrived
  at because the project's own growing shape needs them, then named —
  Composite/Strategy for `Schema`/`Column`, Iterator for a table scan,
  Factory for index creation, Active Record/Data Mapper/Unit of
  Work/Identity Map for the ORM layer (S04, below), Builder for query
  construction. None of these are scheduled in advance for their own
  sake — the same "not forced" rule from "Slices vs. lessons" applies to
  patterns too; a pattern gets named the moment the code already needs
  it, never earlier.

## The slice plan

Source of truth for where the project is headed; update this table as
the plan evolves, don't let it silently drift from what's actually built.
Lesson counts are estimates, filled in for real once each slice is
actually broken into lessons — a slice's own real shape can call for more
or fewer than the estimate.

| Slice | C++ adds | Python adds | End-to-end result |
|-------|----------|-------------|--------------------|
| S00 | Toolchain, a shared library, one `extern "C"` function | `ctypes`, calls that one function | The full stack proven end to end, before any database concept exists |
| S01 | `Schema`/`Column`/`Row`/`Table`, in-memory only, first real `extern "C"` API (`database_open`/`create_table`/`insert`/`get`) | `pocketdb` package v0: `open()`, `create_table()`, `insert()`, `get()` | Python creates a table in the C++ engine, inserts a row, reads it back — real data, real round trip |
| S02a | Real file format: magic number, version, page size, in a real header | Open a real file, verify the header, distinguish "genuinely a PocketDB file" from "some other file" | Real, provable file identity — before a single row is stored |
| S02b | Page manager: fixed-size (4 KiB) pages, real page IDs, allocation, a free-list for reuse | Allocate a page, write real test bytes into it, read them back | A real page survives being written and re-read, addressed only by its real ID |
| S02c | Slotted-page record encoding: packing a variable-length `Row` into a fixed-size page | Insert one real record into one real page, read it back | A real, correctly-encoded record round-trips through the real on-disk page format |
| S02d | `Table`/`Database` rewired to use real pages instead of `std::vector<Row>` | `close()`/reopen, verify data survives a real process restart | The database is actually a database — it persists, built on the same real pages S02a–c already proved, not a shortcut |
| S03 | A bulk-insert `extern "C"` entry point | Hand-rolled CSV parsing (Python's own `csv` module is standard library, allowed — a *third-party* CSV library is not), `pocketdb.import_csv(path, table)` | A real CSV file becomes real rows in a real, *persistent* table, in one call — actually worth doing, now that it survives past the process that imported it |
| S04 | `SELECT` via table scan | `query()`, real result objects | Arbitrary reads work, no index yet |
| S05 | — (engine stable) | A hand-rolled ORM layer: model classes mapping to tables, plus a `sqlite3`-module-shaped `connect()`/`.cursor()`/`.execute()`/`.fetchall()` compatibility surface, both built on `query()`/`insert()` underneath | Two more real "ways to connect" — object-mapped and DB-API-shaped — on top of the same engine, no new C++ |
| S06 | Hash index | Benchmark indexed vs. unindexed point lookups, at real, growing row counts | Fast lookup by key — and SQLite's own B-tree-for-everything design doesn't have a dedicated equality-lookup structure at all; first real, measured divergence, not just imitation |
| S07 | B-tree index | Benchmark/visualize range queries (`WHERE score > 500`, `ORDER BY`) | Fast range queries, a second index with a genuinely different job |
| S08 | Parser grows incrementally: `WHERE`, then `AND`/`OR`, then `ORDER BY`, then `LIMIT` — a real, if small, subset of SQLite's own SQL dialect, not an invented one | Query interface grows to match | Real SQL, SQLite-compatible for the subset implemented |
| S09 | Query engine hardening, the `extern "C"` API's own stability review | Real data analysis on real stored datasets (stats, `matplotlib`) | The engine is a legitimate place to keep data you actually want to study |
| S10 | Transactions | An experiment runner that depends on writes being reliable | The database survives being used for something that matters |
| S11 | — (engine stable) | NumPy/pandas layered on top of `pocketdb.query(...)`, hand-built vs. professional-tool comparison | Analytical workload, the same "why professional tools exist" beat the rest of this repo's curricula already use |
| S12 | — | scikit-learn → hand-built neural net → TensorFlow/Keras, trained on data actually stored in your own engine | *Deep Learning with Keras*'s material, taught against your own data, not a textbook's |
| S13 | An interface the RL side can persist experience through | OpenAI Gym agent (*Applied Reinforcement Learning*'s material), experience replay stored via `pocketdb`, not an in-memory list | A trained agent whose training data survives the process that trained it — the persistence story from S02, paid off |

Concurrency, further query-language growth, columnar storage, and
anything past S13 are deliberately not planned yet — added when S00–S13
are real and there's an actual next felt need, not speculatively now.

**Noted future direction (not scheduled):** a real GUI client — an
Electron + React + TypeScript app in the shape of DBeaver — talking to
PocketDB, once the engine has enough surface (S08's query language at
least) to make a GUI genuinely useful rather than a shell around
`query()`/`insert()`. Would be its own, separate curriculum (React/
TypeScript/Electron are new stacks entirely), not folded into this
one's own lesson sequence.

## SQLite: compatible where it helps, divergent where it's honestly better

Two separate promises, not one — keep them distinct:

- **SQL-dialect and Python-API compatibility (committed, S05 and S08).**
  The query language S08 grows is a real subset of SQLite's own SQL, not
  an invented dialect — a `SELECT ... WHERE ... ORDER BY ... LIMIT`
  someone already knows from SQLite should work unchanged against
  PocketDB. S05's `connect()`/`.cursor()`/`.execute()`/`.fetchall()`
  layer mirrors Python's own standard-library `sqlite3` module's shape
  (PEP 249, the DB-API 2.0 spec) closely enough to be a real, if
  partial, drop-in for simple scripts.
- **On-disk file-format byte-compatibility — explicitly *not* committed.**
  Producing an actual valid `.sqlite` file byte-for-byte is a
  legitimate, real engineering challenge (SQLite's page format, varint
  encoding, cell layout are all public and documented) but a large one,
  orthogonal to this project's actual teaching goals. Worth a look as an
  optional, later stretch slice if it's ever genuinely interesting — not
  planned now, and nothing above depends on it.
- **Honest, evidence-based divergence, not assumed superiority.** SQLite
  uses a B-tree for every index, including pure equality lookups a hash
  table serves asymptotically better — S06's hash index is a real,
  measured example of PocketDB doing something structurally different
  on purpose, benchmarked against the table-scan baseline the same way
  `pocket-inventory-wpf`'s own Lesson 50 audited its MVVM boundary with
  real evidence instead of assertion. Any future "PocketDB does X better
  than SQLite" claim gets the same treatment: measured, not asserted.

## Slice → lesson number map

Slices are milestones, not files — this table tracks which real,
numbered lesson file(s) each slice actually became, updated as lessons
are written. Lesson numbers are one single, project-wide sequence
(not per-language), matching filename order exactly:

| Slice | Lessons |
|-------|---------|
| S00 | `Lesson-00` (C++: the `extern "C"` boundary, proven with `objdump`) → `Lesson-01` (Python: `ctypes`, `argtypes`/`restype`, proven by causing real failures) |
| S01 | `Lesson-02` (C++: `Column`/`IntegerColumn`/`TextColumn`/`Schema` — abstract classes, polymorphism, `unique_ptr`) → `Lesson-03` (C++: splitting into `schema.h`/`schema.cpp`/`main.cpp` — header guards, declaration vs. definition, real separate compilation and linking, both proven with caused failures) → `Lesson-04` (C++: `Value`/`IntegerValue`/`TextValue` reusing `Column`'s technique; `Row`, validated against its `Schema`'s column count — real `throw`/`try`/`catch`, proven both uncaught and caught) → `Lesson-05` (C++: `Table` (`Schema` + `std::vector<Row>`), `Database` (`std::map<std::string, Table>`), a real `get_table` exception reusing Lesson 4's pattern) → `Lesson-06` (C++: the first real `extern "C"` boundary — opaque handles, `static_cast`, raw `new`/`delete`, crossing a `Schema` definition as parallel C arrays, proven end-to-end from real Python; Lessons 0–1's own `engine.cpp`/test scripts retired, now genuinely obsolete) → `Lesson-07` (C++: a real crash proven on purpose — an uncaught C++ exception terminating a real Python process — then every `extern "C"` function hardened with `try`/`catch`; `database_insert`, parsing real values against a table's own stored `Schema`, `std::stoi`, both real failure paths proven safe) → `Lesson-08` (`database_get`/`database_free_string` — a real, proven-wrong approach (`ctypes.c_char_p` silently losing the real pointer) contrasted with the correct one (`c_void_p` + `string_at` + explicit free); `std::vector::at`, real bounds-checked row access) → `Lesson-09` (Python: the first real OOP in this curriculum — classes, `self`, `__init__`, proven with an isolated `Counter` before `pocketdb.py`'s own real `Database` class wraps the opaque handle) → `Lesson-10` (Python: `PocketDBError`, this project's first custom exception; real `create_table`/`insert`/`get` methods translating Lesson 7/8's raw `-1`/`nullptr` sentinels into real, catchable exceptions, proven against all three real failure paths) → `Lesson-11` (Python: `**kwargs`/`*args` — `db.create_table("games", id=INTEGER, ...)`/`db.insert("games", 1, "Alice", 100)`, the exact ergonomic API `README.md` originally promised, proven correct with no C++/boundary changes at all) → `Lesson-12` (robust `.dll` path resolution via `__file__`, a real `FileNotFoundError` caused and fixed on purpose; `demo.py`, one complete, real, ordinary program proving S01's entire original promise, using nothing but `pocketdb`'s own public interface). **S01 complete.** |
| S02a | `Lesson-13` (C++: `DatabaseFileHeader` — a real 16-byte binary header, magic number, `uint32_t` version/page size, proven byte-for-byte with `xxd`; `database_open` now takes a real path, creates or validates a real `.pdb` file, refuses a non-PocketDB file safely — `pocketdb.py`'s own `Database` class not yet updated to pass a path through, deliberately deferred to S02b) |
| S02b | `Lesson-14` (C++: `PageManager` — real, fixed-size 4 KiB pages, direct-addressed allocation, a self-hosted free-list for reuse, proven in isolation before being assembled into the real class; `file_header.h` extended with `page_count`/`free_list_head`, `file_header.cpp`'s `open_or_create_file` retired and absorbed into `PageManager`'s own constructor; a dedicated `page_manager_c_api` extern "C" surface, proven end-to-end from real Python — allocate, write, read, free, and reuse, all through the real boundary. **S02b complete.**) |
| S02c | `Lesson-15` (C++: `record_page` — a self-describing, tag-prefixed flat encoding for a variable-length `Row` (`encode_row`/`decode_row`), and a real slotted-page layout (`insert_record`/`get_record`, a page-local `Slot` directory growing backward while record data grows forward), each proven in isolation first; `dynamic_cast`'s first real appearance, distinguishing `IntegerValue` from `TextValue` without a `Schema` in hand; a dedicated `record_page_c_api` extern "C" surface built on Lesson 14's own `PageManager`, proven end-to-end from real Python — including a real row surviving a real, separate Python process reopening the same file. **S02c complete.**) |
| S02d | `Lesson-16` (C++: a real **catalog** — page `0` of every `.pdb` file — recording every table's name, schema, and page ID, proven in isolation first (a `31`-byte directory round-trip), alongside `PageManager::page_count()` telling a brand-new file from a reopened one; `Table` rewritten to hold no `std::vector<Row>` at all, delegating every `insert`/`get` to `PageManager`/`record_page` by real `page_id`; `Database` now owns its `PageManager` for its whole real lifetime instead of discarding it (closing Lesson 14's own documented gap); `pocketdb.py`'s own `Database.__init__` finally takes and passes a real path (closing Lesson 12's own documented gap) — proven end-to-end: `demo.py` runs, closes, and a completely separate Python process reopens the same file and reads back the identical real rows purely from its own bytes. **S02d complete — S02 (real, on-disk persistence) done.**) |
| S03 | `Lesson-17` (C++: `database_insert_many` — a real, bulk `extern "C"` entry point taking a whole batch of rows as one flat, row-major array (`row * value_count + col`), proven in isolation first; an honest, real partial-success return value (a row count, not a boolean) since this project has no transactions yet, proven both on a full success and a deliberate, real page-overflow partial failure; Python: `pocketdb.import_csv(path, table)`, using the standard-library `csv` module (not a third-party one) to turn a real `.csv` file into rows for a new `insert_many` method — proven end-to-end, including a completely separate Python process reopening the database afterward and finding the imported rows still there. **S03 complete.**) |
| S04 | `Lesson-18` (C++: `record_count` — exposing a page's own already-maintained `slot_count` as a real, constant-time question, proven in isolation first; `Table::row_count`, `database_row_count`, and `database_column_names` (reusing `database_get`'s own comma-joined convention) — the two minimal real answers (row count, column names) a table scan needs; Python: `Record`, a real result object supporting both `record[0]` and `record["score"]` (`__getitem__`, `isinstance`, `__repr__`), deliberately matching `sqlite3.Row`'s own real shape ahead of S05; `Database.query(table)` — a real **table scan** built entirely from already-proven pieces — proven against a multi-row table, an empty one, a nonexistent one, and a completely separate Python process reopening the database and getting the identical `Record` objects back. **S04 complete.**) |
| S05 | `Lesson-19` (No new C++. Python: `dbapi.py` — a real, `sqlite3`-shaped `connect()`/`.cursor()`/`.execute()`/`.fetchall()`/`.fetchone()` surface using the identical real, positional `?` (qmark) paramstyle `sqlite3` itself defaults to, deliberately, narrowly recognizing only the two statement shapes this project already supports (`SELECT * FROM table`, `INSERT INTO table VALUES (...)`), raising a real error rather than guessing at anything else; `orm.py` — a real, hand-rolled `Model` base class (`@classmethod`, `setattr`/`getattr`) where a table's structure is described once as `_table`/`_columns` and `save`/`all` work for any subclass with no per-model duplication — both built entirely on Lesson 18's own `query`/`insert`, proven end-to-end including a completely separate Python process reopening the database through each surface. **S05 complete.**) |
| S06 | `Lesson-20` (C++: a real hash index — `std::unordered_map<std::string, uint32_t>` on `Table`, `mutable` and lazily built on first use, kept correct by a real, incremental update on every insert (not a full rebuild); `Table::find_by_key`/`database_find` proven from real Python — a hit, a miss, a row inserted after the index was built, and a real reopen with no explicit rebuild step needed; Python: `Database.find(table, key)`, and a real benchmark (`time.perf_counter()`) measuring a real, repeatable tens-of-times speedup over `query`'s own linear scan for the real worst case (finding the last row) — measured, not asserted, per `README.md`'s own standing rule. **S06 complete.**) |
| S07 | `Lesson-21` (C++: a real, hand-rolled `BTreeIndex`/`BTreeNode` — genuine multi-key nodes, real node splitting on insert, proven correct against a 15-key tree before ever touching `Table`; `Table::range_query`, one real B-tree per column cached lazily in a `mutable std::unordered_map<std::string, BTreeIndex>`, kept correct by the same real incremental-update discipline as S06's hash index; `database_range_query` proven from real Python, including a reopen; Python: `Database.range_query(table, column, low, high)`, benchmarked for real against `query` plus a Python-side filter — a real, repeatable ~9x speedup, honestly smaller than S06's hash-index number, for real, explained reasons. **S07 complete.**) |
| S08 | `Lesson-22` (No new C++. Python: `where_parser.py` — real, hand-rolled tokenizing (`str.split()`) and evaluation of this project's own real, minimal `WHERE` subset (`column op value`, chained by `AND`/`OR`, left-to-right, no real operator precedence — a documented, honest gap); `dbapi.py`'s `Cursor.execute` grows to locate `WHERE`/`ORDER BY`/`LIMIT` clauses in any real, present-or-absent combination, still built entirely on Lesson 18's own `query` — a real, honest linear scan plus filter, deliberately not using S06/S07's own indexes automatically; proven against every real clause combination. **S08 complete.**) |
| S09 | `Lesson-23` (C++: a real, systematic re-audit of every `extern "C"` function this project has ever written against Lesson 7's own established exception-safety standard — found and fixed a genuine, currently-shipping crash (`page_manager_open` had no `try`/`catch` around a constructor proven to throw, since Lesson 14; reproduced for real — a live `std::terminate` — then fixed and the identical reproduction rerun to confirm); `record_page_init` hardened too, on the honest "currently harmless isn't safe" reasoning. Python: `analyze.py` — real `statistics.mean`/`.median`/`.stdev` and a real, saved `matplotlib` histogram (`scores_histogram.png`), built from 100 real, persistent, queried rows — the first slice not about the engine's own internals at all. **S09 complete.**) |
| S10 | `Lesson-24` (No new C++. Python: `Transaction` — real, in-memory staging of `insert` calls, `Database.begin()`/`.commit()`/`.rollback()`, proven with a real row count staying at zero until `commit()` runs; a real experiment runner (`README.md`'s own named S10 use case) proving `rollback()` genuinely protects a caller from ever recording a failed experiment's own partial results; then, deliberately, honestly, a real proof of where the guarantee actually ends — a failure *inside* `commit()` itself still leaves already-written rows in place, a named, undeferred gap (no write-ahead log exists), not hidden. **S10 complete — the engine itself is done, for now.**) |
| S11 | `Lesson-25` (No engine changes. Python: real, queried `Record` rows converted into a real `pandas.DataFrame`; a real, side-by-side comparison — a per-team average and a real standard deviation, computed both by an explicit, hand-built loop and with `pandas.groupby`/`numpy.std(ddof=1)` — agreeing exactly, differing only in how much real code and reusable generality each costs; the same "why professional tools exist" beat this repo's other curricula already use. **S11 complete.**) |
| S12 | `Lesson-26` (No engine changes. Python: a real, hand-worked single gradient-descent step verified by hand first (`sigmoid`, error, gradient, one update, prediction moving correctly toward the target); a real, `150`-row dataset stored in and queried from PocketDB, then trained three real ways — `scikit-learn`'s `LogisticRegression`, a real, hand-built single-neuron training loop, and a real `Keras` `Sequential` model — all learning the identical relationship; `scikit-learn`'s own higher accuracy honestly explained (a better optimizer, not a different model) rather than left as unexplained "professional tools are better." **S12 complete.**) |
| S13 | `Lesson-27` (No engine changes. Python: a real, hand-worked Q-learning (Bellman equation) update verified by hand first; a real `gymnasium` `FrozenLake-v1` agent, trained live for 5000 episodes to a perfect (1.00) win rate, then a small, real, bounded sample of its own converged experience (60 transitions, batched per episode via Lesson 24's `Transaction`) persisted through `pocketdb` — honestly bounded by S02's own real, established one-page-per-table capacity, reframed as a real, standard, bounded replay-buffer design rather than a limitation; a completely separate process then replayed nothing but those 60 stored rows into an equally perfect (1.00) win-rate policy, with no live environment at all. **S13 complete — the full, planned curriculum (S00-S13) is done.**) |

**The PocketDB curriculum (S00-S13) is complete.** Every slice above is
verified, checker-clean, and proven end-to-end in the real reference
project at the path described in `CURRICULUM_NOTES.md`. See that file's
own running log for the full, dated decision history behind every
major choice.
