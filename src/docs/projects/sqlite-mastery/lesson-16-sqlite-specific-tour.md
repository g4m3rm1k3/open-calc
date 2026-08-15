# Lesson 16: SQLite-Specific Tour

**What you will build:** real, direct answers to "what does this table
actually look like" asked of the engine itself rather than remembered
by hand; a real, reclaimed-space `pocket_hardware.db`; a second real
database file queried alongside the first in one connection; and a
first, real look at two of SQLite's own built-in extensions — storing
and querying real JSON, and real full-text search — both reused
directly in later arcs.

**What you need to know first:** [Lesson 02](lesson-02-create-table-and-type-affinity.md)
— `.schema`, reused here alongside two new, complementary introspection
tools. [Lesson 08](lesson-08-primary-and-foreign-keys.md) — the real
`parts`→`suppliers` foreign key this lesson's own `PRAGMA
foreign_key_list` reads back in a new, structured form.

**Terms introduced in this lesson:**
- **Virtual table** — a real table-like object backed by something
  other than SQLite's own ordinary row storage — here, a real full-text
  search index, queryable with the same `SELECT` syntax as any ordinary
  table.

**Objects and methods used:**

**`PRAGMA table_info`**
- *What it is:* a real, built-in introspection pragma.
- *Implementation:* `PRAGMA table_info(table_name);` — returns one row
  per real column: its position (`cid`), name, declared type, whether
  it's `NOT NULL`, its `DEFAULT` value if any, and whether it's part of
  the primary key.
- *Its use:* reading `parts`' own real, current shape directly from the
  engine, in structured form, rather than parsing `.schema`'s free text
  by eye.

**`PRAGMA foreign_key_list`**
- *What it is:* a real, built-in introspection pragma.
- *Implementation:* `PRAGMA foreign_key_list(table_name);` — returns
  one row per real foreign key the table declares: which column, which
  table and column it references, and its `ON UPDATE`/`ON DELETE`
  behavior.
- *Its use:* confirming `parts.supplier_id`'s own real, declared
  relationship to `suppliers.id`, in the same structured form.

**`VACUUM`**
- *What it is:* a real SQL statement that rebuilds a database file from
  scratch, packing it as tightly as possible.
- *Implementation:* `VACUUM;` — reads the entire real database and
  rewrites it into a fresh file, reclaiming space left behind by
  deleted rows (Lesson 06's own `Old Rusty Hinge`, among others) that
  SQLite doesn't automatically return to the filesystem on ordinary
  `DELETE`.
- *Its use:* real, periodic file-size maintenance.

**`ATTACH DATABASE`**
- *What it is:* a real statement that opens a second database file
  inside the current connection, alongside the already-open main one.
- *Implementation:* `ATTACH DATABASE 'file.db' AS alias;` — every table
  in that second file becomes queryable as `alias.table_name`, including
  in real joins against the main database's own tables.
- *Its use:* a real, second file — `archive.db` — holding discontinued
  parts, queried alongside `pocket_hardware.db` in one connection.

**`json_extract()`**
- *What it is:* a real, built-in SQLite function, part of the JSON1
  extension.
- *Implementation:* `json_extract(json_text, path)` — reads one real
  value out of a JSON string stored in an ordinary `TEXT` column, given
  a path like `'$.color'`.
- *Its use:* reading a structured value back out of real JSON text
  stored directly in a SQLite column.

**`CREATE VIRTUAL TABLE ... USING fts5`**
- *What it is:* a real statement creating a full-text-search virtual
  table, part of the FTS5 extension.
- *Implementation:* `CREATE VIRTUAL TABLE name USING fts5(column, ...);`
  — creates a real, specialized index structure searchable with `MATCH`,
  not an ordinary table.
- *Its use:* real, fast substring/word search over `parts.name` —
  reused directly by Arc 5's own DataTables search box (Lesson 53).

---

## Concept Unit: `PRAGMA table_info`/`foreign_key_list` — Asking the Engine, Not Reading Prose

### The Problem

`.schema parts` (Lesson 02) shows a table's real definition as free
text — correct, but meant for a human to read, not for a program to
parse reliably. Arc 6's own reverse-engineering work, handed an
unfamiliar database with no documentation at all, needs the identical
information in a real, structured, queryable form.

### Introduce the Concept in Isolation

No throwaway table — `parts` and its own real foreign key, asked
directly:

```
$ sqlite3 pocket_hardware.db
sqlite> .headers on
sqlite> .mode column
sqlite> PRAGMA table_info(parts);
cid  name         type     notnull  dflt_value  pk
---  -----------  -------  -------  ----------  --
0    id           INTEGER  0                    1
1    name         TEXT     0                    0
2    price        REAL     0                    0
3    quantity     INTEGER  0                    0
4    supplier_id  INTEGER  0                    0
```

One real row per real column — `pk` correctly flags `id` (`1`) as the
only primary-key column, matching Lesson 02's own `INTEGER PRIMARY KEY`
declaration exactly.

```
sqlite> PRAGMA foreign_key_list(parts);
id  seq  table      from         to  on_update  on_delete  match
--  ---  ---------  -----------  --  ---------  ---------  -----
0   0    suppliers  supplier_id  id  NO ACTION  NO ACTION  NONE
```

One real row, naming exactly what Lesson 08's own `REFERENCES
suppliers(id)` declared: `supplier_id` (`from`) really does point at
`suppliers.id` (`to`), with `NO ACTION` as the real, default behavior
for both `ON UPDATE` and `ON DELETE` — meaning, concretely, neither
action is automatically propagated (no automatic cascade), the same
real default this lesson's own Lesson 08 already proved rejects a
dangling reference outright, under `PRAGMA foreign_keys = ON`, rather
than silently adjusting anything on its own.

### Discard

Nothing throwaway — both pragmas are real, permanent tools this series
reuses directly in Arc 6.

### Mechanical Walkthrough

- `PRAGMA table_info(parts);` — **(b) hard concept reappearing** for
  `PRAGMA` itself, Lesson 08's own `PRAGMA foreign_keys` already gave it
  full treatment; `table_info` as the specific pragma name — **(a)
  first appearance**, full treatment above.
- `PRAGMA foreign_key_list(parts);` — **(a) first appearance** of this
  specific pragma name, full treatment above; `PRAGMA` itself — **(b)
  hard concept reappearing**, as above.

### CS Lens

Both pragmas expose real **reflection**: a running system's own ability
to report on its own structure, queryably, rather than requiring an
outside reader to parse free text or consult separate documentation.

Also recognized in: Python's own `type()`/`dir()` inspecting an object's
real shape at runtime, Java's Reflection API, a REST API's own
self-describing OpenAPI/Swagger schema, a compiler's own symbol table —
every case, a system exposing structured facts about itself rather than
requiring an external, hand-maintained description to stay accurate.

### SE Lens

The real alternative not chosen for Arc 6's own reverse-engineering
work: rely on separate, hand-written documentation of a database's
schema. The real, well-known failure mode of that alternative — an
apparently-authoritative document that has quietly drifted out of sync
with the real schema — is exactly why Arc 6 leans on `PRAGMA
table_info`/`foreign_key_list` (and `.schema`) directly against the
real file instead: a pragma can never be stale, because it reads the
real, current, authoritative structure every single time it's asked.

## Concept Unit: `VACUUM` — Reclaiming Space `DELETE` Leaves Behind

### The Problem

Lesson 06 proved `DELETE` removes a row's real data. It does not prove
the file itself shrinks — SQLite, by real, documented default, marks a
deleted row's space as reusable for a *future* insert into the same
file, without necessarily returning it to the operating system at all.

### Introduce the Concept in Isolation

```
sqlite> VACUUM;
```

A real, complete rebuild: SQLite reads every real table and index in
`pocket_hardware.db` and rewrites the entire file fresh, as compactly
as possible, in one operation. On a small project like this one, the
real size difference is negligible — `VACUUM`'s own real value shows up
on a much larger, longer-lived database that has accumulated many real
deletions and schema changes over time, exactly the kind of database
Arc 6 hands you.

### Discard

Nothing throwaway — a real, permanent maintenance operation, safe to
run again any time.

### Mechanical Walkthrough

- `VACUUM;` — **(a) first appearance**, full treatment above; no
  arguments, no clauses — the entire real database is rebuilt at once.

### CS Lens

`VACUUM` performs real **compaction**: rewriting a data structure to
eliminate fragmentation left behind by prior deletions, reclaiming space
without changing any of the real, logical data itself.

Also recognized in: a garbage-collected language's own compacting
collector (moving live objects together, reclaiming the gaps dead ones
left behind), disk defragmentation, `git gc` repacking a repository's
own object store.

### SE Lens

The real tradeoff: `VACUUM` genuinely locks the whole database for its
own real duration (proportional to the database's total size, not just
what changed), and requires roughly as much free disk space as the
database itself currently occupies, to build the fresh copy before the
old one is discarded. The real, honest reason this project doesn't run
it after every single `DELETE`: the cost is real and non-trivial,
appropriate for real, periodic maintenance — not a step this series
adds to Lesson 06's own ordinary `DELETE` workflow.

## Concept Unit: `ATTACH DATABASE` — Querying a Second Real File

### The Problem

Lesson 06's own real hard-delete choice (`Old Rusty Hinge`, genuinely
gone) traded away history for simplicity. A real, separate archive
file — never mixed into `pocket_hardware.db` itself — is a real way to
keep that history without abandoning the hard-delete design already
chosen.

### Introduce the Concept in Isolation

A real, second file, opened alongside the first in the same connection:

```
sqlite> ATTACH DATABASE 'archive.db' AS archive;
sqlite> CREATE TABLE archive.discontinued (
   ...>     id INTEGER PRIMARY KEY, name TEXT, discontinued_on TEXT
   ...> );
sqlite> INSERT INTO archive.discontinued (name, discontinued_on)
   ...> VALUES ('Old Rusty Hinge', '2026-01-01');
sqlite> SELECT * FROM archive.discontinued;
id  name             discontinued_on
--  ---------------  ---------------
1   Old Rusty Hinge  2026-01-01
```

`archive.discontinued` is a real table in a genuinely separate real
file, `archive.db` — confirmed by `.databases` (Lesson 01's own
dot-command) now reporting two real, distinct file paths in the same
session, `main` and `archive` both. A query can join across both at
once (`SELECT parts.name, archive.discontinued.name FROM parts, ... `,
not run here, but real and valid) exactly as if both tables lived in
one file.

```
sqlite> DETACH DATABASE archive;
```

`DETACH DATABASE` closes the second file again; `archive.discontinued`
stops being queryable from this connection, though the real file and
its real data remain intact on disk, reattachable any time.

### Discard

Nothing throwaway — `archive.db` is a real, permanent second file this
project could reuse (not required by any later lesson in this series,
kept optional).

### Mechanical Walkthrough

- `ATTACH DATABASE 'archive.db' AS archive;` — **(a) first appearance**,
  full treatment above.
- `CREATE TABLE archive.discontinued (...)` — **(b) hard concept
  reappearing** for `CREATE TABLE` itself; the `archive.` prefix on the
  table name — **(a) first appearance**: routes the statement to the
  attached database specifically, rather than the default `main`.
- `DETACH DATABASE archive;` — **(a) first appearance**, the direct
  inverse of `ATTACH`.

### CS Lens

`ATTACH`'s real per-connection scoping (Lesson 08's own `PRAGMA
foreign_keys` proved the identical pattern for a setting instead of a
file) is a real instance of **session state**: a fact true only for
this specific, currently-open connection, never written into any file
itself, and gone the moment a fresh connection opens.

### SE Lens

The real alternative not chosen: keep `discontinued` as a real table
inside `pocket_hardware.db` itself, alongside `parts`. `ATTACH`'s own
real value is physical separation with logical connectivity kept
intact: an archive genuinely never touched by this project's own
day-to-day backup/restore cadence (Lesson 52) can live in its own
file, sized and maintained on its own real schedule, while still being
one real `JOIN` away whenever it's actually needed.

## Concept Unit: JSON1 — Structured Data Inside an Ordinary Column

### The Problem

A real hardware part sometimes has a genuinely variable set of
attributes — a drill bit's sizes, a paint's available colors — that
don't cleanly fit one fixed column each, the same real problem Lesson
02's own rigid `CREATE TABLE` schema doesn't naturally solve.

### Introduce the Concept in Isolation

A throwaway table, holding one real JSON document per row:

```
sqlite> CREATE TABLE probe_json (id INTEGER PRIMARY KEY, data TEXT);
sqlite> INSERT INTO probe_json (data) VALUES ('{"color":"red","sizes":[8,9,10]}');
sqlite> SELECT json_extract(data, '$.color') AS color FROM probe_json;
color
-----
red
```

`data` is stored as perfectly ordinary `TEXT` — Lesson 02's own type
affinity has no special awareness of JSON at all — but `json_extract`
reads real, structured meaning out of it: `'$.color'` is a real JSON
path, and the function returns exactly the real value stored at that
path, not the whole raw string.

```
sqlite> SELECT data ->> '$.color' AS color_arrow FROM probe_json;
color_arrow
-----------
red
```

`->>`, a real, shorter operator form of the identical extraction —
proof `json_extract` isn't the only real spelling for this operation.

### Discard

`probe_json` is a real, illustrative throwaway table — this series'
own project data stays in ordinary typed columns throughout; JSON1 is
introduced here as a real, available tool, not one this specific
project's own schema commits to using.

### Mechanical Walkthrough

- `CREATE TABLE probe_json (id INTEGER PRIMARY KEY, data TEXT);` —
  **(c) already basic**, unchanged.
- `json_extract(data, '$.color')` — **(a) first appearance**, full
  treatment above.
- `data ->> '$.color'` — **(a) first appearance** of `->>` as a real,
  built-in operator alias for `json_extract`.

### CS Lens

Storing JSON inside a relational column is a real, deliberate blend of
**schema-on-write** (Lesson 02's own term, still governing every
ordinary column) and **schema-on-read** (Lesson 01's own term, now
governing whatever real structure lives inside the JSON text itself) —
in the same single table, on a per-column basis, rather than choosing
one model for the whole database.

### SE Lens

The real tradeoff: a JSON column sidesteps Lesson 02's own real
schema-on-write cost (no `ALTER TABLE` needed to add a new attribute to
some rows but not others) at the real cost of losing every constraint
this series' own Lesson 07 taught — nothing stops malformed or
inconsistent JSON from being stored, and no `CHECK` runs against
whatever's inside it, automatically. The right real call for
genuinely variable, rarely-queried-by-value attributes; the wrong one
for anything this project needs to filter, join, or constrain the way
`parts`' own ordinary columns already are.

## Concept Unit: FTS5 — Real, Fast Full-Text Search

### The Problem

Lesson 13's own index made `WHERE name = 'Drill'` fast — an *exact*
match. A real customer typing "drl" or "hamr" into a real search box
(Arc 5's own DataTables UI) needs something an ordinary index cannot
give: a real, fast, fuzzy-ish text search.

### Introduce the Concept in Isolation

A real virtual table, built specifically for this:

```
sqlite> CREATE VIRTUAL TABLE parts_fts USING fts5(name);
sqlite> INSERT INTO parts_fts (rowid, name) SELECT id, name FROM parts;
sqlite> SELECT * FROM parts_fts WHERE name MATCH 'hammer';
name
------
Hammer
```

`parts_fts` is not an ordinary table — `.schema parts_fts` reports a
real `CREATE VIRTUAL TABLE` definition, not a `CREATE TABLE` — it's a
real, specialized full-text index, populated here with a one-time real
copy of `parts.name`. `MATCH` (not `=` or `LIKE`) is FTS5's own real
query operator, matching whole words within the indexed text.

### Discard

Nothing throwaway — `parts_fts` is a real, permanent object, reused
directly by this series' own Lesson 53, once Arc 5's real search box
exists to drive it.

### Mechanical Walkthrough

- `CREATE VIRTUAL TABLE parts_fts USING fts5(name);` — **(a) first
  appearance** of `CREATE VIRTUAL TABLE`, full treatment above.
- `INSERT INTO parts_fts (rowid, name) SELECT id, name FROM parts;` —
  **(a) first appearance** of `INSERT ... SELECT`: instead of a literal
  `VALUES` list (every earlier `INSERT` in this series), the rows to
  insert come from a real query's own result set — here, copying
  `parts`' own `id`/`name` pairs directly into the FTS5 index in one
  statement, matching `parts_fts`'s own `rowid` to `parts.id` on
  purpose so the two stay correlated.
- `WHERE name MATCH 'hammer';` — **(a) first appearance** of `MATCH`,
  full treatment above.

### CS Lens

FTS5 builds and queries a real **inverted index**: a structure mapping
each real word back to every row that contains it, the same real
technique behind every general-purpose search engine, at a scale
several orders of magnitude larger than one hardware store's own
`parts.name` column.

### SE Lens

The real cost this concept unit's own `INSERT ... SELECT` makes
concrete: `parts_fts` is a genuinely separate copy, not a live view —
unlike Lesson 12's own `low_stock`, adding `Chisel` to `parts` today
does **not** automatically appear in `parts_fts` search results, until
something explicitly re-syncs it. Keeping the two in sync automatically
is exactly the real job Lesson 15's own trigger mechanism can do (three
triggers — `AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE` on `parts` —
each keeping `parts_fts` current) — a real, deliberate exercise below
rather than solved silently here.

## Connect the pieces

Six real tools, one shared theme: each is something *specific to
SQLite* (or to a real, official SQLite extension), beyond standard SQL
already covered in Lessons 01–15. `PRAGMA table_info`/`foreign_key_list`
gave this project a real, structured way to ask its own schema
questions Arc 6 will soon have to ask of a database it's never seen
before. `VACUUM` and `ATTACH DATABASE` both concern the real, physical
file(s) underneath the logical schema — reclaiming space in one,
querying a second one alongside the first. JSON1 and FTS5 each extend
what an ordinary `TEXT` column can genuinely do — hold real structured
data, or become a real, fast search index — without leaving SQLite's
own single-file, serverless model (Lesson 01's own opening subject)
behind at any point.

## What breaks without this

Query `parts_fts` for a part added *after* it was built:

```
$ sqlite3 pocket_hardware.db "SELECT * FROM parts_fts WHERE name MATCH 'chisel';"
```

Nothing — a real, empty result, despite `Chisel` being a genuine,
current row in `parts` since Lesson 12. This is direct, real proof of
this lesson's own SE Lens: `parts_fts` is a copy, frozen at the moment
`INSERT ... SELECT` ran, not a live reflection of `parts` the way
Lesson 12's own `low_stock` view is. Nothing about creating a virtual
table wires it to its source automatically — that link, if wanted, has
to be built explicitly, the same real principle Lesson 15's own
triggers already exist to solve for exactly this kind of gap.

## Exercises

1. Run `PRAGMA table_info(suppliers);` and `PRAGMA
   foreign_key_list(suppliers);` yourself, and confirm `suppliers` — a
   table with no foreign keys of its own — correctly returns zero rows
   from the second pragma.
2. Write the three real triggers this lesson's own SE Lens named
   (`AFTER INSERT`, `AFTER UPDATE OF name`, `AFTER DELETE`, each on
   `parts`) to keep `parts_fts` genuinely synchronized automatically.
   Confirm adding a new real part makes it immediately findable via
   `MATCH`, with no manual `INSERT ... SELECT` re-run by hand.

## Definition of Done

- [ ] You read `parts`' real structure with `PRAGMA table_info` and its
      real foreign key with `PRAGMA foreign_key_list`.
- [ ] You ran `VACUUM` and can state, in your own words, what real
      problem it solves that `DELETE` alone doesn't.
- [ ] You attached a real second file, created and queried a real table
      inside it, and detached it again.
- [ ] You stored and extracted a real JSON value with `json_extract`
      and `->>`.
- [ ] You built `parts_fts` and found a real row with `MATCH`, then
      proved it goes stale the moment `parts` changes without it.
- [ ] You completed both exercises.

## Arc 1 complete

Sixteen lessons, one real, growing database: `pocket_hardware.db` now
holds two real tables (`parts`, `suppliers`), a real audit table
(`price_history`) kept current by a real trigger, a real view
(`low_stock`), a real index (`idx_parts_name`), a real foreign key
under real, provably-necessary enforcement, and a real full-text index
alongside it. Every core SQL and SQLite-specific construct from
`CREATE TABLE` through `FTS5` now has full, isolated, proven treatment.
[Arc 2](lesson-17-connecting-from-python.md) puts this exact file behind
real Python code for the first time — the same file, the same data,
read and written from outside the `sqlite3` CLI for the first time in
this series.
