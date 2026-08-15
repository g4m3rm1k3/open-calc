# Lesson 58: Serving Joined Data From Multiple Databases, Live

**What you will build:** a real, live endpoint joining two genuinely
separate real database files — `pocket_hardware.db` and Lesson 16's
own real `archive.db` — in one query, replacing the shape of a batch
"join everything, write a JSON file" pipeline with a real request that
reads current, correct data every single time it runs.

**What you need to know first:** [Lesson 16](lesson-16-sqlite-specific-tour.md)
— `ATTACH DATABASE`, and its own real, permanent `archive.db` file
(holding one real, discontinued part), reused directly, unmodified,
here. [Lesson 31](lesson-31-a-real-database-dependency.md) —
`Depends(get_db)`, extended in this lesson to attach a second real file
on every request.

**Terms introduced in this lesson:** none new — `ATTACH DATABASE`
(Lesson 16) and `UNION ALL` are this lesson's own subject; `UNION ALL`
gets its own first-appearance treatment below.

**Objects and methods used:**

**`UNION ALL`**
- *What it is:* a real SQL operator combining the results of two
  separate `SELECT` statements into one result set.
- *Implementation:* `SELECT ... FROM a UNION ALL SELECT ... FROM b;` —
  both real `SELECT`s must return the same real number of columns, in
  compatible types; every real row from both is kept, including real
  duplicates (its own real, plain `UNION` counterpart, not used here,
  would additionally and expensively remove them).
- *Its use:* combining real, currently-active parts with real,
  discontinued ones into one, unified response.

---

## Concept Unit: Attaching a Second Real Database Per Request

### The Problem

A real, common pattern — joining data that lives in more than one real
source, then writing the combined, real result to a JSON file for a UI
to read — has a real, honest cost: that JSON file is only ever as
current as the last time someone remembered to regenerate it, and every
real, new source database means rerunning the whole real pipeline by
hand.

### Introduce the Concept in Isolation

Lesson 08 already proved `PRAGMA foreign_keys` is a real, per-connection
setting, reset on every fresh connection. `ATTACH DATABASE` (Lesson 16)
is real and per-connection in the identical way — meaning
`Depends(get_db)`'s own real, fresh-connection-per-request shape (Lesson
31) is exactly where a second, real database needs to be attached, every
single time:

```python
ARCHIVE_DB_PATH = "archive.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(f"ATTACH DATABASE '{ARCHIVE_DB_PATH}' AS archive")
    try:
        yield conn
    finally:
        conn.close()
```

A real, live endpoint, reading from both real, attached databases in
one statement:

```python
@app.get("/parts/all-time")
def list_all_time_parts(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("""
        SELECT name, price, quantity, 'active' AS status FROM parts
        UNION ALL
        SELECT name, NULL AS price, NULL AS quantity, 'discontinued' AS status
        FROM archive.discontinued
    """).fetchall()
    return [dict(row) for row in rows]
```

```
$ curl http://127.0.0.1:8000/parts/all-time
[{"name":"Hammer","price":12.99,"quantity":4,"status":"active"},
 ...,
 {"name":"Old Rusty Hinge","price":null,"quantity":null,"status":"discontinued"}]
```

Every real, currently-active part from `pocket_hardware.db` itself,
alongside `Old Rusty Hinge` — Lesson 16's own real, still-existing row
in the genuinely separate `archive.db` file — combined into one real
response, computed fresh, from both real, live files, on every single
request. Nothing here was pre-built, exported, or cached anywhere; the
real `JOIN`/`UNION ALL` runs against both real, current files the
instant this endpoint is called.

### Discard

Nothing throwaway — `get_db`'s own real `ATTACH DATABASE` line, and
`list_all_time_parts`, are both real, permanent additions to this
project's own backend.

### Mechanical Walkthrough

- `conn.execute(f"ATTACH DATABASE '{ARCHIVE_DB_PATH}' AS archive")` —
  **(b) hard concept reappearing**, Lesson 16's own `ATTACH DATABASE`,
  now run inside `get_db` specifically so every real request gets it
  fresh; the f-string itself — **(b) hard concept reappearing**, the
  identical safe-shape pattern Lesson 34 and Lesson 40 both already
  established: `ARCHIVE_DB_PATH` is a real, fixed, application-level
  constant, never real, external input, which is the entire real reason
  splicing it into this string carries none of Lesson 18's own real
  danger.
- `SELECT name, price, quantity, 'active' AS status FROM parts UNION
  ALL SELECT name, NULL AS price, NULL AS quantity, 'discontinued' AS
  status FROM archive.discontinued` — **(a) first appearance** of
  `UNION ALL`, full treatment above; `'active' AS status` / `NULL AS
  price` — **(b) hard concept reappearing**, Lesson 05's own real
  `NULL` literal and Lesson 02's own `AS` naming, both applied here to
  a literal value rather than a column.

### CS Lens

This is a real, direct application of the identical principle Lesson 12's
own `low_stock` view was first built on: a **single source of truth,
read fresh**, rather than a real, separate, derived copy (a JSON file,
built once and hoping no one forgets to rebuild it) that can drift out
of sync the instant either real, underlying database changes.

### SE Lens

The real, honest cost this lesson accepts, stated directly: a live,
cross-database join runs its real query cost on every single request,
where a pre-built JSON file pays that cost exactly once, at export
time. For a real, moderately-sized dataset — this project's own real
scale throughout this series — that tradeoff favors correctness,
provably, every time: Lesson 51's own N+1 lesson already proved a
single, well-formed query is cheap; the real risk a stale, forgotten
JSON export carries (a real user looking at data that was true an hour,
a day, or a week ago, with no way to tell) is the more expensive real
mistake at this project's own scale. A genuinely huge, slow, multi-
database join — beyond what this project has ever needed — is exactly
where a real, deliberate, periodically-refreshed cache would become the
correct tradeoff instead; that real threshold hasn't been crossed here.

## Connect the pieces

`get_db`, extended with one real `ATTACH DATABASE` line, now opens two
real, genuinely separate files on every single request — Lesson 31's
own per-request connection lifecycle making that real, fresh attach
automatic and correct. `UNION ALL` combined both real sources into one,
live response, proving the exact real capability this lesson set out to
build: real data, joined from more than one real database, served live,
with no batch export step anywhere in between.

## What breaks without this

Remove the real `ATTACH DATABASE` line from `get_db`, leaving
`list_all_time_parts` itself completely unchanged:

```
$ curl http://127.0.0.1:8000/parts/all-time
```

```
sqlite3.OperationalError: no such table: archive.discontinued
```

A real, immediate, correct failure — `archive` was never attached to
this specific real connection at all, and SQLite refuses to guess which
real, unattached file `archive.discontinued` might have meant. This is
direct, provable proof `ATTACH DATABASE`'s own real, per-connection
scope (Lesson 16) is not optional bookkeeping — every single request's
own fresh connection genuinely needs it, every time, exactly the same
real requirement Lesson 08 already proved for `PRAGMA foreign_keys`.

## Exercises

1. Add a real, third source — a genuinely new, separate `.db` file of
   your own, attached under a real, different alias — and extend
   `list_all_time_parts`'s own `UNION ALL` chain to include it.
2. Confirm, directly, that a real write through `db` (a real `INSERT
   INTO archive.discontinued ...`) works correctly against the attached
   database, the identical real way Lesson 16 already proved — and
   state, in your own words, why this endpoint currently only ever
   reads from it, never writes.

## Definition of Done

- [ ] You attached `archive.db` inside `get_db` and confirmed it's
      fresh on every real request.
- [ ] You built a real, live endpoint combining both databases with
      `UNION ALL`, confirmed against real, current data in both files.
- [ ] You caused the real "no such table: archive.discontinued" failure
      by removing the attach, and understand exactly why it's scoped
      per-connection.
- [ ] You completed both exercises.

## Next

[Lesson 59 — Safely Syncing and Live-Reloading a Local Read-Only
Replica](lesson-59-safely-syncing-and-live-reloading-a-local-replica.md)
covers a real, different multi-machine problem this lesson doesn't
touch: keeping a real, local copy of a database correct when a real
user might already have it open.
