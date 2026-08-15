# Lesson 51: Query Performance and the N+1 Problem

**What you will build:** real, direct, *counted* proof — not a vague
claim — that a real, working endpoint issues fifteen separate SQL
statements to answer a question one statement could, and the real,
one-line fix that closes the gap.

**What you need to know first:** [Lesson 09](lesson-09-inner-and-left-joins.md)
— its own SE Lens already named the N+1 problem directly, as the real
alternative `JOIN` avoids; this lesson proves that claim with real,
counted evidence instead of asserting it. [Lesson 31](lesson-31-a-real-database-dependency.md)
— `Depends(get_db)`, reused unchanged by both real endpoints this
lesson compares.

**Terms introduced in this lesson:**
- **N+1 query problem** — a real, named performance anti-pattern:
  fetching a real list of N items with one query, then issuing one
  *further*, separate query per item to fetch related data — N+1 real
  round trips total, where one, correctly-joined query would do.

**Objects and methods used:**

**`Connection.set_trace_callback()`**
- *What it is:* a real, built-in method on a `sqlite3` `Connection`
  object.
- *Implementation:* `conn.set_trace_callback(function)` — `function` is
  called with the real, exact SQL text of every statement this
  connection executes, from that point on.
- *Its use:* the real, precise tool this lesson uses to *count* SQL
  statements directly, rather than estimating or guessing.

---

## Concept Unit: Counting the Real, Hidden Cost

### The Problem

A real "list every part with its supplier's name" endpoint sounds like
one, straightforward feature. Does the most natural way to write it,
looping over the real Python objects Lesson 17 already taught, actually
issue one query, or hides more?

### Introduce the Concept in Isolation

The real, naive, easy-to-write version — a real `for` loop, one real
supplier lookup per part:

```python
@app.get("/parts/with-supplier-naive")
def list_parts_with_supplier_naive(db: sqlite3.Connection = Depends(get_db)):
    parts = db.execute("SELECT * FROM parts").fetchall()
    result = []
    for part in parts:
        part_dict = dict(part)
        supplier = db.execute(
            "SELECT name FROM suppliers WHERE id = ?", (part["supplier_id"],)
        ).fetchone()
        part_dict["supplier_name"] = supplier["name"] if supplier else None
        result.append(part_dict)
    return result
```

Real, direct proof of exactly how many SQL statements this one real
endpoint actually issues:

```python
import sqlite3

statements = []
conn = sqlite3.connect("pocket_hardware.db")
conn.row_factory = sqlite3.Row
conn.set_trace_callback(statements.append)

parts = conn.execute("SELECT * FROM parts").fetchall()
for part in parts:
    conn.execute("SELECT name FROM suppliers WHERE id = ?", (part["supplier_id"],)).fetchone()

print(f"{len(statements)} real SQL statements executed for {len(parts)} parts")
```

```
$ python count_queries.py
15 real SQL statements executed for 14 parts
```

Exactly `15` — one real `SELECT * FROM parts`, plus one further, real,
separate `SELECT` per one of the fourteen real rows it returned. This
is direct, counted, undeniable proof of the **N+1 query problem**
Lesson 09's own SE Lens already named: N real, additional round trips
(`14`) on top of the original one (`1`), where the real, underlying
question — "every part, with its supplier's name" — genuinely needs
only one.

### Discard

`count_queries.py` is real, disposable proof of exactly how many
statements the naive endpoint issues; `list_parts_with_supplier_naive`
itself is real, working code, kept only long enough to be directly
compared against this lesson's own fix.

### Mechanical Walkthrough

- `for part in parts: ... supplier = db.execute(...)` — **(c) already
  basic**, an ordinary Python loop calling an already-explained
  `execute`/`fetchone`; the real *cost* of running it once per row,
  not its syntax, is this unit's own entire point.
- `conn.set_trace_callback(statements.append)` — **(a) first
  appearance**, full treatment above; `statements.append` passed
  directly as the real callback — **(b) hard concept reappearing**,
  Python's own real first-class functions (already assumed familiar),
  here a real list's own bound method used as a callable.

### CS Lens

The N+1 pattern is a real, direct instance of **hidden algorithmic
cost**: `list_parts_with_supplier_naive`'s own real Python code *looks*
linear and simple — one loop, one lookup per item — while its real,
underlying cost is dominated entirely by N separate, real round trips
to the database, a cost invisible from reading the Python alone,
visible only by directly counting what actually executes underneath
it, exactly as this unit's own `set_trace_callback` did.

Also recognized in: a real ORM's own "lazy loading" silently issuing
one query per related object accessed inside a loop (the single most
common, real-world trigger of this exact pattern, across virtually
every real web framework that uses an ORM), a REST client fetching a
list then making one further real HTTP request per item to fetch its
own details, any real system where "loop and fetch" quietly replaces
"fetch once, correctly."

### SE Lens

The real, honest reason this pattern is so easy to write by accident:
`list_parts_with_supplier_naive`'s own code is, in isolation, entirely
correct and reads naturally — nothing about it looks obviously wrong
the way, say, Lesson 06's own WHERE-less `DELETE` visibly does. The
real cost only becomes visible under real, direct measurement (this
unit's own `set_trace_callback` count, or, at production scale, a real
slow endpoint a real user actually notices) — which is exactly why this
lesson insists on *counting*, directly and provably, rather than
trusting that a loop "feels" efficient.

## Concept Unit: The Real Fix — One Query, `JOIN`

### The Problem

Lesson 09 already proved `JOIN` answers exactly this kind of question
in one real statement. Does replacing the loop with it actually reduce
this lesson's own real, counted total?

### Introduce the Concept in Isolation

```python
@app.get("/parts/with-supplier")
def list_parts_with_supplier(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("""
        SELECT parts.*, suppliers.name AS supplier_name
        FROM parts
        LEFT JOIN suppliers ON parts.supplier_id = suppliers.id
    """).fetchall()
    return [dict(row) for row in rows]
```

The identical real counting proof, rerun against this version:

```python
statements = []
conn.set_trace_callback(statements.append)
rows = conn.execute("""
    SELECT parts.*, suppliers.name AS supplier_name
    FROM parts
    LEFT JOIN suppliers ON parts.supplier_id = suppliers.id
""").fetchall()
print(f"{len(statements)} real SQL statements executed for {len(rows)} parts")
```

```
$ python count_queries_fixed.py
1 real SQL statements executed for 14 parts
```

`1` — not `15`. The real, complete, correct result — every part, every
real `supplier_name` correctly resolved, `LEFT JOIN` (Lesson 09)
correctly including `Screwdriver Set`'s own `NULL` supplier exactly as
Lesson 09 already proved — produced by exactly one real round trip,
regardless of whether `parts` holds fourteen rows or fourteen
thousand.

### Discard

Nothing throwaway — `list_parts_with_supplier` is real, permanent,
correct code; `list_parts_with_supplier_naive` is deleted, its own real
job done once this lesson's own direct comparison is complete.

### Mechanical Walkthrough

- `SELECT parts.*, suppliers.name AS supplier_name FROM parts LEFT
  JOIN suppliers ON parts.supplier_id = suppliers.id` — **(b) hard
  concept reappearing** throughout: `LEFT JOIN`/`ON` (Lesson 09),
  `parts.*` as a real, qualified wildcard selecting every column from
  one specific named table in a multi-table query — **(a) first
  appearance** of this specific, small variant of Lesson 02's own `*`.

### CS Lens

This is real, direct proof that pushing a real join down into the
database engine — the identical principle Lesson 01's own opening SE
Lens first named for filtering — scales fundamentally differently than
looping in application code: one real query's own internal cost grows
with the real data (Lesson 13's own indexing directly helps here), but
its *count* stays fixed at `1` regardless of how many real rows match,
where the naive loop's own count grows linearly, forever, with no
upper bound.

### SE Lens

The real, concrete number this unit's own count proved — `15` real
statements collapsed to `1` — is not an abstract or exaggerated
example: this exact shape (list an entity, loop to fetch one related
field per row) is a real, extremely common cause of genuinely slow
production endpoints, and the fix is, provably, this simple: reach for
`JOIN` (Lesson 09) the moment a loop is about to issue a second real
query per row of an already-fetched result, rather than after a real
user complains the endpoint is slow.

## Connect the pieces

One real, countable proof, run twice: the naive, loop-based endpoint
issued exactly `15` real SQL statements to answer a question about
`14` real parts — one to list them, fourteen more, one per row, to
resolve each one's own supplier. The `JOIN`-based fix answered the
identical, correct question in exactly `1` — `set_trace_callback`
proving both real counts directly, not asserted, not estimated.

## What breaks without this

Scale the naive version's own real cost up, conceptually, by
extrapolating this lesson's own real, counted proof: at `14` real
rows, `15` statements is a real, if wasteful, inconvenience; at a real
`10,000`-row `parts` table (a real, plausible future size for a
growing hardware-store chain), the identical naive code would issue
`10,001` real, separate round trips for the exact same one, real,
logical question — not a hypothetical, but a real, direct, linear
consequence of the identical, unchanged code this lesson's own first
unit already proved issues one extra real query per row, every time,
unconditionally.

## Exercises

1. Reproduce this lesson's own real `set_trace_callback` proof
   yourself, both for the naive and the `JOIN`-based version, and
   confirm your own real counts match `15` and `1`.
2. Using `EXPLAIN QUERY PLAN` (Lesson 13), confirm whether this
   lesson's own real `JOIN` query uses an index on `parts.supplier_id`
   or falls back to a real table scan. If it scans, create a real,
   appropriate index and confirm, with `EXPLAIN QUERY PLAN` again, that
   the plan changes.

## Definition of Done

- [ ] You counted, directly and provably, the real `15` statements the
      naive endpoint issues.
- [ ] You counted the real `1` statement the `JOIN`-based fix issues
      for the identical, correct result.
- [ ] You can state, from memory, why the N+1 pattern is so easy to
      write without noticing, despite being provably, measurably
      costly.
- [ ] You completed both exercises.

## Next

[Lesson 52 — Backup and Restore](lesson-52-backup-and-restore.md) covers
a real, different production concern this series has deferred since
Lesson 06's own hard-delete choice: what happens when this project's
own real data needs to be recovered, not merely queried efficiently.
