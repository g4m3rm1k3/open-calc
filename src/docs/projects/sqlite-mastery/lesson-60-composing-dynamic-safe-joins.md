# Lesson 60: Composing Dynamic, Safe Joins

**What you will build:** a real, small query composer — one, real,
central dictionary naming every joinable "type" this project supports,
and one, real function that safely assembles exactly the joins a real
caller asks for, closing off the exact real failure mode behind "crazy
join statements all over": the same real relationship, hand-written
slightly differently in five different places, with no single, real
place left to fix or extend it.

**What you need to know first:** [Lesson 40](lesson-40-datatables-server-side-processing.md)
— its own real column allowlist, the direct ancestor of this lesson's
own, larger one. [Lesson 09](lesson-09-inner-and-left-joins.md) —
`LEFT JOIN`'s own real shape, assembled dynamically here instead of
written once, by hand, per query.

**Terms introduced in this lesson:** none new — this lesson extends
Lesson 40's own already-explained allowlist principle from a single
column to a whole, composable join clause.

**Objects and methods used:**

**`fastapi.Query` (repeated list parameter)**
- *What it is:* a real, built-in FastAPI helper for declaring query
  parameter behavior beyond a plain default value.
- *Implementation:* `types: list[str] = Query(default=[])` — collects
  every real, repeated `?types=...` occurrence in a request's own URL
  into one real Python list, rather than requiring a single,
  comma-packed value.
- *Its use:* letting a real caller ask for any real combination of this
  lesson's own joinable types in one request.

---

## Concept Unit: One Real Dictionary, Instead of Five Hand-Written Joins

### The Problem

A real part's own full picture touches more than one other real table —
its supplier (Lesson 09), its price history (Lesson 15). A real,
growing application, built one screen at a time, tends to accumulate a
real, separate, hand-written `JOIN` for each real screen that happens
to need supplier data, and a second, separately hand-written one for
each screen that needs price history — the exact real, scattered
pattern this lesson exists to close.

### Introduce the Concept in Isolation

One real, central, named source of truth for every real, joinable
relationship this project currently supports:

```python
JOINABLE_TYPES = {
    "supplier": {
        "join": "LEFT JOIN suppliers ON parts.supplier_id = suppliers.id",
        "columns": ["suppliers.name AS supplier_name", "suppliers.email AS supplier_email"],
    },
    "price_history": {
        "join": "LEFT JOIN price_history ON price_history.part_id = parts.id",
        "columns": ["price_history.old_price", "price_history.new_price", "price_history.changed_at"],
    },
}


def build_parts_query(selected_types):
    unknown = set(selected_types) - JOINABLE_TYPES.keys()
    if unknown:
        raise ValueError(f"Unknown type(s): {sorted(unknown)}")

    columns = ["parts.*"]
    joins = []
    for t in selected_types:
        columns.extend(JOINABLE_TYPES[t]["columns"])
        joins.append(JOINABLE_TYPES[t]["join"])

    return f"SELECT {', '.join(columns)} FROM parts {' '.join(joins)}"
```

```python
>>> build_parts_query(["supplier"])
'SELECT parts.*, suppliers.name AS supplier_name, suppliers.email AS supplier_email FROM parts LEFT JOIN suppliers ON parts.supplier_id = suppliers.id'
>>> build_parts_query(["supplier", "price_history"])
'SELECT parts.*, suppliers.name AS supplier_name, suppliers.email AS supplier_email, price_history.old_price, price_history.new_price, price_history.changed_at FROM parts LEFT JOIN suppliers ON parts.supplier_id = suppliers.id LEFT JOIN price_history ON price_history.part_id = parts.id'
```

Every real join this project needs, for any real combination of
related types, comes from exactly one place — `JOINABLE_TYPES` — rather
than being re-typed, slightly differently, at every real call site that
happens to need it.

### Discard

Nothing throwaway — `JOINABLE_TYPES` and `build_parts_query` are real,
permanent, and this project's own real, only source of these joins from
here on.

### Mechanical Walkthrough

- `JOINABLE_TYPES = {"supplier": {"join": "...", "columns": [...]},
  ...}` — **(c) already basic**, an ordinary Python dictionary of
  dictionaries; its real, deliberate role as a fixed, controlled
  allowlist — not merely a convenient lookup table — is this unit's own
  real point.
- `unknown = set(selected_types) - JOINABLE_TYPES.keys()` — **(b) hard
  concept reappearing**, Python's own real set difference (already
  used, Lesson 24's own `applied_versions`), applied here to catch any
  real, unrecognized type name before it goes anywhere near SQL.
- `columns.extend(...)` / `joins.append(...)` — **(c) already basic**,
  ordinary Python list building.
- `f"SELECT {', '.join(columns)} FROM parts {' '.join(joins)}"` — **(b)
  hard concept reappearing**, the identical safe-shape-only f-string
  pattern Lessons 34/40/58 already established — every real fragment
  spliced in here comes from `JOINABLE_TYPES`'s own fixed, real, Python
  source, never from `selected_types` directly.

### CS Lens

`JOINABLE_TYPES` is a real, direct instance of a **declarative
capability registry**: what this project *can* join is stated once, as
real, inspectable data, rather than implied by however many real
`JOIN` clauses happen to already exist scattered through the codebase —
the identical underlying shape as Lesson 24's own `MIGRATIONS` list, or
a real router's own table of registered real endpoints (Lesson 29's own
CS Lens), applied here to relational joins instead.

### SE Lens

The real, concrete payoff, stated directly against the original,
real complaint: adding a real, new joinable relationship — a future
`category` type, say — now means adding exactly one, real new entry to
`JOINABLE_TYPES`, correct everywhere this composer is used, rather than
hunting down and updating every real, separate hand-written query that
happens to need it. This is the identical real principle behind every
other allowlist this series has built (Lesson 40's own sortable
columns) — a single, real, named place holding the rule, instead of the
rule being implicit in however many places happened to duplicate it
correctly, or not.

## Concept Unit: A Real Endpoint, Composing Whatever a Caller Asks For

### The Problem

`build_parts_query` is real and correct. A real caller — Arc 5's own UI,
letting a real user tick which related data to include — needs a real
way to ask for it over HTTP.

### Introduce the Concept in Isolation

```python
from fastapi import Query


@app.get("/parts/composed")
def list_parts_composed(
    types: list[str] = Query(default=[]),
    db: sqlite3.Connection = Depends(get_db),
):
    try:
        sql = build_parts_query(types)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    rows = db.execute(sql).fetchall()
    return [dict(row) for row in rows]
```

```
$ curl "http://127.0.0.1:8000/parts/composed?types=supplier"
[{"id":1,"name":"Hammer", ...,"supplier_name":"Ace Tools Co.","supplier_email":"sales@acetools.example"}, ...]
```

```
$ curl -i "http://127.0.0.1:8000/parts/composed?types=nonexistent"
HTTP/1.1 400 Bad Request

{"detail":"Unknown type(s): ['nonexistent']"}
```

A real, working composed query for a real, recognized type, and a
real, honest `400 Bad Request` — Lesson 35's own real `HTTPException`
pattern, reused directly — for one that isn't. `?types=supplier` and,
separately, `?types=supplier&types=price_history` (repeated in the same
real URL) both work correctly: `Query(default=[])`'s own real behavior
collects every real, repeated occurrence into one Python list, letting
a real caller ask for any real, valid combination in a single request.

### Discard

Nothing throwaway — `list_parts_composed` is a real, permanent
endpoint, and this is the real, single place Arc 5's own future UI
reaches for any combination of related part data going forward.

### Mechanical Walkthrough

- `types: list[str] = Query(default=[])` — **(a) first appearance**,
  full treatment above.
- `except ValueError as e: raise HTTPException(status_code=400,
  detail=str(e))` — **(b) hard concept reappearing** for `HTTPException`
  (Lesson 35); `400`, specifically — **(a) first appearance** of this
  real, standard status code, distinct from Lesson 35's own real `404`:
  a real, malformed *request* (an unrecognized type name), not a
  correctly-formed request for a resource that doesn't exist.

### CS Lens

Real, direct proof this endpoint never trusts `types` beyond
*selecting keys* from an already-fixed, real, trusted structure: every
real value that ends up inside the executed SQL string — every table
name, every column name, every join condition — traces back to
`JOINABLE_TYPES`'s own fixed, Python-authored text, never to
`types` itself. `types` only ever decides *which* trusted fragments
get included, exactly the same real principle Lesson 40's own
`sortable_columns` allowlist already proved for a single column, now
applied to whole, composable join clauses.

### SE Lens

The real, deliberate discipline this whole lesson depends on, worth
naming directly one final time: the moment any future contributor
"simplifies" `build_parts_query` by falling back to a real, raw,
directly-interpolated join for an unrecognized type — instead of
raising, the way this lesson's own real `ValueError` does — every real
protection this lesson built collapses at once, reopening the identical
real identifier-injection risk Lesson 40's own SE Lens already named.
This lesson's own real `unknown` check, and the `ValueError` it raises,
are not defensive styling — they are the entire real reason this
composer is safe to expose to real, external, unauthenticated-by-schema
input at all.

## Connect the pieces

One real, central `JOINABLE_TYPES` dictionary replaced however many
real, scattered, hand-written joins this project's own growing UI would
otherwise have accumulated — `build_parts_query` assembling exactly the
real columns and joins a caller asks for, always drawn from that one,
fixed, trusted source. `GET /parts/composed`, wired to a real, repeated
`types` query parameter, gave any real caller — Arc 5's own future UI,
directly — a single, safe, correct way to ask for any real combination
of this project's own known relationships, with a real, honest `400`
for anything outside them.

## What breaks without this

Reproduce the exact real danger this lesson's own SE Lens named,
deliberately, in a disposable copy of `build_parts_query` only:

```python
def build_parts_query_unsafe(selected_types):
    columns = ["parts.*"]
    joins = []
    for t in selected_types:
        entry = JOINABLE_TYPES.get(t)
        if entry is None:
            joins.append(f"LEFT JOIN {t} ON {t}.part_id = parts.id")  # a real, dangerous fallback
        else:
            columns.extend(entry["columns"])
            joins.append(entry["join"])
    return f"SELECT {', '.join(columns)} FROM parts {' '.join(joins)}"
```

```
$ curl "http://127.0.0.1:8000/parts/composed-unsafe?types=sqlite_master%20--"
```

A real, genuine identifier-injection attempt — `t`, entirely real,
external, caller-controlled text, spliced directly into the SQL
string's own join clause the instant it fails to match a real,
recognized type. This is the identical real category of danger Lesson
40's own SE Lens already proved for a single column, now shown against
a whole clause: the fix was never "check whether the input looks
dangerous" — it was always "never let unrecognized input reach the SQL
string at all," exactly what this lesson's own real `unknown` check,
raising instead of falling back, guarantees.

## Exercises

1. Add a real, third joinable type — `category`, joining `parts`
   through `suppliers` is not correct here (this series' own real
   schema has no such path); instead, add whatever real, second
   relationship genuinely exists in your own copy of
   `pocket_hardware.db`, following this lesson's own exact
   `JOINABLE_TYPES` shape.
2. Reproduce this lesson's own real, unsafe fallback version, and
   confirm — without necessarily crafting a complete, working exploit —
   that a real, deliberately malformed `types` value reaches the raw
   SQL string in a way this lesson's own real, safe version
   structurally cannot allow.

## Definition of Done

- [ ] You built `JOINABLE_TYPES` and `build_parts_query`, confirmed
      against at least two real, different type combinations.
- [ ] You wired `GET /parts/composed` to a real, repeated `types` query
      parameter, and confirmed a real `400` for an unrecognized one.
- [ ] You reproduced the real, unsafe fallback version and can state,
      precisely, why raising on an unrecognized type is the entire real
      fix, not an optional safeguard.
- [ ] You completed both exercises.

## Arc 8 complete

Five lessons, each answering a real, distinct, working-application
problem directly: a real, visible loading state closing the gap between
a window opening and real, slow work actually finishing; two real,
separate causes of stale data, each with its own real, correct fix;
live, multi-database joins replacing a batch JSON-export step
entirely; a real, safe way to publish a new local replica without ever
touching a file a real user might have open, wired to a live UI refresh
with no restart; and one, real, central allowlist replacing however
many scattered, hand-written joins a growing, complex database would
otherwise accumulate. [Lesson 61 — Series Complete](lesson-61-series-complete.md)
closes this series for real, tracing one thread through all eight arcs.
