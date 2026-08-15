# Lesson 65: Joining Local SQLite Data With Remote Server Data

**What you will build:** a real endpoint combining `parts` (local,
SQLite) with the enterprise server's own `Products` table (remote, SQL
Server) into one, correct result — proving `ATTACH DATABASE` (Lesson
16, Lesson 58) cannot do this directly, and building the real,
application-level join that can, plus a real, better alternative for
when that join needs to happen often.

**What you need to know first:** [Lesson 58](lesson-58-serving-joined-data-from-multiple-databases-live.md)
— `ATTACH DATABASE`'s own real, live, multi-database join, whose one
real requirement (both sides genuinely being SQLite files) this lesson
runs directly into. [Lesson 51](lesson-51-query-performance-and-the-n-plus-1-problem.md)
— the N+1 problem, reappearing here in a real, more expensive form:
across a network, not just across one process.

**Terms introduced in this lesson:** none new — this lesson combines
already-explained real tools (Lesson 24's migrations, Lesson 62's
`pyodbc`, Lesson 59's safe-publish pattern) to solve a genuinely new,
real problem.

**Objects and methods used:** none new.

---

## Concept Unit: A Real Join `ATTACH DATABASE` Cannot Perform

### The Problem

Lesson 58 proved `ATTACH DATABASE` lets one real SQL statement join two
genuinely separate SQLite files. `parts` (local, SQLite) and the
enterprise server's own `Products` table (remote, SQL Server) are not
both SQLite files — does the identical real technique still work?

### Introduce the Concept in Isolation

It does not, and confirming that directly, rather than assuming it,
matters: `ATTACH DATABASE` is real, genuine SQLite syntax, understood
only by SQLite's own engine — there is no real way to hand it a
`pyodbc` connection string, and no real SQL statement that spans two
genuinely different database *engines* at once, regardless of vendor.
A real join across `parts` and `Products` has to happen somewhere else
— in this project's own real Python code, once both real result sets
already exist in memory.

First, a real, one-time migration (Lesson 24's own pattern), giving
`parts` a real way to reference the enterprise system's own real
identifier:

```sql
ALTER TABLE parts ADD COLUMN enterprise_sku INTEGER;
```

A real, working application-level join:

```python
def get_enterprise_products():
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={os.environ['DB_SERVER']};"
        f"DATABASE={os.environ['DB_NAME']};"
        f"UID={os.environ['DB_USER']};"
        f"PWD={os.environ['DB_PASSWORD']};"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT ProductID, ProductName, UnitPrice FROM Products")
    columns = [col[0] for col in cursor.description]
    rows = {row[0]: dict(zip(columns, row)) for row in cursor.fetchall()}
    conn.close()
    return rows


@app.get("/parts/with-enterprise-price")
def list_parts_with_enterprise_price(db: sqlite3.Connection = Depends(get_db)):
    local_parts = [dict(row) for row in db.execute("SELECT * FROM parts").fetchall()]
    enterprise_by_id = get_enterprise_products()
    for part in local_parts:
        match = enterprise_by_id.get(part["enterprise_sku"])
        part["enterprise_price"] = match["UnitPrice"] if match else None
    return local_parts
```

```
$ curl http://127.0.0.1:8000/parts/with-enterprise-price
[{"id":1,"name":"Hammer", ...,"enterprise_sku":null,"enterprise_price":null},
 {"id":9,"name":"Level Vial Kit", ...,"enterprise_sku":1,"enterprise_price":9.99}]
```

A real, correct, combined result — `enterprise_by_id`, built once, with
a *single* real round trip to the enterprise server, then joined
in-memory against every real local `parts` row, using an ordinary
Python `dict` lookup exactly the same real shape you'd reach for
mapping a type code to a display string.

### Discard

Nothing throwaway — `get_enterprise_products` and
`list_parts_with_enterprise_price` are real, permanent code; the real
`ALTER TABLE` migration is a one-time, permanent schema change.

### Mechanical Walkthrough

- `ALTER TABLE parts ADD COLUMN enterprise_sku INTEGER;` — **(b) hard
  concept reappearing**, Lesson 08's own real `ADD COLUMN`, unchanged.
- `rows = {row[0]: dict(zip(columns, row)) for row in
  cursor.fetchall()}` — **(a) first appearance** of a real Python
  **dict comprehension**, building a lookup dictionary keyed by each
  real product's own ID directly, in one expression — the identical
  real shape as the more verbose loop-based version Lesson 24 already
  used, applied here for the first time to build a lookup table instead
  of a set.
- `match = enterprise_by_id.get(part["enterprise_sku"])` — **(b) hard
  concept reappearing**, ordinary real `dict.get`, already used
  (Lesson 47's own naive query, among others), returning `None`
  safely when a real local part has no matching enterprise SKU at all.

### CS Lens

This is a real, direct instance of a **hash join**, performed
explicitly, in application code, rather than inside a real query
planner: build a real, O(1)-lookup structure (a `dict`, keyed by the
real join column) from the smaller or more expensive-to-re-fetch real
side once, then probe it once per row of the other real side — the
identical underlying algorithm a real database's own query planner
(Lesson 13's own `EXPLAIN QUERY PLAN`) might choose internally for an
ordinary, single-engine `JOIN`, made explicit here because no single
real engine spans both real sources.

### SE Lens

The real, deliberate reason this lesson fetches every real enterprise
product *once*, into a real dict, rather than querying the enterprise
server once per local part inside the loop: the latter is Lesson 51's
own real N+1 problem, reappearing in a genuinely more expensive form —
each real round trip here crosses an actual real network to a real,
separate server, not merely a second local SQL statement. Fourteen
real local parts, joined the wrong way, would mean fourteen real,
separate, slow network round trips instead of exactly one; this lesson
avoids that classic mistake by construction, the same discipline Lesson
51 already proved matters, now costing considerably more per real
mistake than it did there.

## Concept Unit: Syncing a Local Copy, When the Join Happens Often

### The Problem

This lesson's own first unit's real join runs one, real, live network
round trip on *every single request* to `list_parts_with_enterprise_price`.
For a real endpoint called often, or joined against several real,
local tables at once, that's a genuine, real, repeated cost.

### Introduce the Concept in Isolation

The real, better alternative for that specific case: reuse Lesson 59's
own already-proven safe-publish pattern, syncing a real, local,
periodically-refreshed copy of the enterprise data — then real,
ordinary `ATTACH DATABASE` (Lesson 58) works again, because both real
sides are SQLite once more:

```python
def sync_enterprise_products_to_local():
    conn = pyodbc.connect(...)
    cursor = conn.cursor()
    cursor.execute("SELECT ProductID, ProductName, UnitPrice FROM Products")
    rows = cursor.fetchall()
    conn.close()

    local = sqlite3.connect("enterprise_products_cache.db")
    local.execute("DROP TABLE IF EXISTS products")
    local.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL)")
    local.executemany("INSERT INTO products VALUES (?, ?, ?)", [tuple(row) for row in rows])
    local.commit()
    local.close()
```

```python
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("ATTACH DATABASE 'enterprise_products_cache.db' AS ent")
    try:
        yield conn
    finally:
        conn.close()


@app.get("/parts/with-enterprise-price-cached")
def list_parts_cached(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("""
        SELECT parts.*, ent.products.price AS enterprise_price
        FROM parts
        LEFT JOIN ent.products ON parts.enterprise_sku = ent.products.id
    """).fetchall()
    return [dict(row) for row in rows]
```

`sync_enterprise_products_to_local`, run on a real, deliberate schedule
(Lesson 59's own polling pattern is the direct, real template), keeps
`enterprise_products_cache.db` current without a single real request
ever needing to reach the enterprise server directly — every real
request against `/parts/with-enterprise-price-cached` runs one, real,
purely local `JOIN`, exactly as fast as any other query this series has
already built.

### Discard

Nothing throwaway — both real patterns are permanent; this lesson's own
first unit's live join and this unit's own cached join are two real,
legitimate tools, chosen per real, specific need.

### Mechanical Walkthrough

- `local.execute("DROP TABLE IF EXISTS products")` — **(a) first
  appearance** of `DROP TABLE IF EXISTS`: the real, safe counterpart to
  `CREATE TABLE IF NOT EXISTS` (Lesson 24), letting this real sync
  function run repeatedly without a real "table already exists" error
  (Lesson 02).
- `local.executemany("INSERT INTO products VALUES (?, ?, ?)",
  [tuple(row) for row in rows])` — **(b) hard concept reappearing**,
  Lesson 21's own real `executemany`, applied here to real rows
  fetched from a genuinely different database engine.
- `conn.execute("ATTACH DATABASE 'enterprise_products_cache.db' AS
  ent")` — **(b) hard concept reappearing**, Lesson 58's own identical
  real pattern, now attaching a real, synced *copy* instead of Lesson
  58's own real, permanent `archive.db`.

### CS Lens

This is a real, direct instance of **materialized view**-style caching:
a real, physical, local copy of a remote query's own result, refreshed
on a real schedule rather than computed fresh on every real request —
the identical underlying tradeoff Lesson 58's own SE Lens already
named honestly (live-and-correct versus cached-and-fast), chosen here
deliberately in the *cached* direction, for a real, repeated, cross-
network join specifically.

### SE Lens

The real, honest choice between this lesson's own two real patterns:
the live, application-level join (this lesson's own first unit) is
correct by construction — never stale, at the real cost of one network
round trip per real request; the synced, local copy (this unit) is
fast and simple to query, exactly like any other local SQLite join,
at the real, honest cost this series has already named directly in
Lesson 58 and Lesson 59 both — a real window, however brief, where the
local copy and the real, live enterprise data can genuinely disagree.
Neither is universally correct; the real, deliberate choice depends on
how current this specific, real join actually needs to be.

## Connect the pieces

`ATTACH DATABASE`'s own real limit — SQLite only — proved a real join
across `parts` and the enterprise server's own `Products` table needs a
genuinely different approach: an application-level hash join, built
once from a real dict, avoiding Lesson 51's own N+1 problem in its most
expensive, cross-network form. And Lesson 59's own already-proven
safe-publish pattern, reused directly, turned that same real join back
into an ordinary, fast, local `ATTACH DATABASE` query the moment
repeated, cross-network cost mattered more than perfect real freshness.

## What breaks without this

Reproduce the real, expensive mistake this lesson's own first unit
deliberately avoided — one real, separate enterprise-server query per
local part, inside the loop:

```python
@app.get("/parts/with-enterprise-price-slow")
def list_parts_slow(db: sqlite3.Connection = Depends(get_db)):
    local_parts = [dict(row) for row in db.execute("SELECT * FROM parts").fetchall()]
    for part in local_parts:
        conn = pyodbc.connect(...)  # a real, new connection, per row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT UnitPrice FROM Products WHERE ProductID = ?", part["enterprise_sku"]
        )
        row = cursor.fetchone()
        part["enterprise_price"] = row[0] if row else None
        conn.close()
    return local_parts
```

For fourteen real local parts, this real endpoint opens and closes
fourteen separate, real, genuine connections to the enterprise server —
each one a real, full network round trip and authentication handshake
— where this lesson's own first unit needed exactly one. This is
Lesson 51's own real N+1 proof, reproduced directly, now costing
real, measurable network latency per row instead of a cheap, local SQL
statement — the concrete, provable reason this lesson's own real dict-
based join isn't a stylistic preference.

## Exercises

1. Add real, basic timing (`time.time()` before and after, the
   identical real tool Lesson 42 already used) around both this
   lesson's own real join and its own deliberately slow, per-row
   version, and confirm directly how much real time the N+1 mistake
   costs at your own project's own real scale.
2. Decide, for your own real, specific use case, whether the live join
   or the synced, cached version is the correct real choice — write two
   or three real sentences stating which one you'd choose and why,
   based on how current your own real data genuinely needs to be.

## Definition of Done

- [ ] You confirmed `ATTACH DATABASE` cannot span a SQLite file and a
      real SQL Server connection directly.
- [ ] You built a real, correct application-level join using a dict,
      avoiding a per-row network round trip.
- [ ] You built a real, synced local cache and confirmed `ATTACH
      DATABASE` works against it exactly as it did in Lesson 58.
- [ ] You completed both exercises.

## Arc 9 complete

Four lessons, and this project now reaches past SQLite entirely: a
real, working connection to a genuine, IT-owned enterprise server
(Lesson 62), the real, portable discipline for understanding its own
unfamiliar schema (Lesson 63), the real, concrete case — and a real,
working fix — for why every `pywebview` client should reach it through
one, central backend rather than connecting directly (Lesson 64), and
the real, correct way to join that server's own data against this
project's own local SQLite, live or cached, depending on what a real,
specific need actually calls for (Lesson 65). Every one of these four
lessons reused a real tool this series had already built — DB-API
portability, `Depends`, Lesson 51's own N+1 discipline, Lesson 59's own
safe-publish pattern — proving, one final time, that this series' own
real foundations were never SQLite-specific knowledge alone.
[Lesson 66 — Series Complete](lesson-66-series-complete.md) closes this
series for real, tracing one thread through all nine arcs.
