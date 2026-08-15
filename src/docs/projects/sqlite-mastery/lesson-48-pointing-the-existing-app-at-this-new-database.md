# Lesson 48: Pointing the Existing App at This New Database

**What you will build:** a real, working `GET /books` endpoint, adapted
from Arc 4's own `GET /parts`, serving `library_system.db` correctly —
proven against a real, failing first attempt, and deliberately using
Lesson 47's own recovered, honest availability formula instead of
blindly trusting `qty_avail`.

**What you need to know first:** [Lesson 32](lesson-32-get-endpoints.md)
— `GET /parts`'s own real shape, the direct template this lesson
adapts. [Lesson 47](lesson-47-messy-legacy-schema-realities.md) — the
real, correct, computed-availability query this lesson's own endpoint
reuses directly, rather than trusting `qty_avail` naively.

**Terms introduced in this lesson:** none new — this lesson applies
Arc 4's own already-explained FastAPI patterns to a genuinely different
real schema.

**Objects and methods used:** none new.

---

## Concept Unit: The Naive Swap — a Real, Predictable Failure

### The Problem

Arc 4's own `get_db` (Lesson 31) points at `pocket_hardware.db` by a
fixed, hardcoded path. Does simply changing that one path make this
project's own real, already-working backend serve `library_system.db`
correctly?

### Introduce the Concept in Isolation

The smallest possible real change:

```python
DB_PATH = "library_system.db"
```

Restarting the real server and requesting Lesson 32's own already-real
endpoint, completely unchanged otherwise:

```
$ curl -i http://127.0.0.1:8000/parts
HTTP/1.1 500 Internal Server Error

{"detail":"Internal Server Error"}
```

A real, genuine `500` (Lesson 35's own real, deliberately vague
external response) — the real server console shows the actual, honest
cause:

```
sqlite3.OperationalError: no such table: parts
```

A real, predictable failure — `library_system.db` genuinely has no
table named `parts` at all; Lesson 44 already proved its real table
names directly (`tbl_book`, not `parts`). This is direct, provable
proof that a database's own real *connection string* and its own real
*schema* are two, entirely independent things — Arc 3's own portability
lessons already proved a `.db` file's own format is language-agnostic;
this lesson proves the reverse is not free: a schema-agnostic
connection still requires schema-aware code above it.

### Discard

`DB_PATH = "library_system.db"` alone, with no further real change, is
disposable proof of this unit's own single point — the real, permanent
fix is this lesson's own second unit.

### Mechanical Walkthrough

- `DB_PATH = "library_system.db"` — **(c) already basic**, an ordinary
  Python assignment; the real point is not the syntax, but the real,
  predictable consequence of changing it alone.
- The real `sqlite3.OperationalError` — **(b) hard concept
  reappearing**, the identical real exception category Lesson 02's own
  "no such table" proof at the CLI already established, now
  encountered through Python instead.

### CS Lens

This real failure is direct, provable evidence against an **implicit
schema coupling**: Lesson 32's own `list_parts` function was never
written to depend on anything beyond "a `parts` table with these exact
columns exists" — a real, reasonable assumption for `pocket_hardware.db`
specifically, and a genuinely false one for any other real database,
`library_system.db` included.

### SE Lens

The real, honest lesson this unit's own failure teaches directly:
Lesson 22's own repository pattern, and Arc 4's own endpoint functions
generally, were never truly database-agnostic — they were
`pocket_hardware.db`-schema-agnostic at best, correctly abstracting
*how* to reach SQLite (Lesson 17 onward) while still hardcoding *what*
that specific schema looks like throughout. This is not a design flaw
in earlier lessons — building a genuinely schema-agnostic backend ahead
of time, for a schema that didn't exist yet, would have been real,
wasted, premature generality. This lesson's own real, honest work is
the correct time to pay that real cost, now that a second, real schema
genuinely exists to design against.

## Concept Unit: The Real Fix — a New Model, the Real Table Name, and Honest Availability

### The Problem

`library_system.db` needs its own, real, correctly-shaped endpoint —
and Lesson 47 already proved trusting `tbl_book.qty_avail` directly
would silently serve a real, wrong answer for at least one real row.

### Introduce the Concept in Isolation

A real, new Pydantic model, matching `tbl_book`'s own real, recovered
shape (Lesson 44) instead of `parts`':

```python
class BookOut(BaseModel):
    id: int
    ttl: str
    isbn: str | None = None
    pub_yr: int | None = None
    cat_id: int | None = None
    qty_total: int
    qty_avail: int
```

A real, new endpoint — deliberately *not* simply `SELECT * FROM
tbl_book`, reusing Lesson 47's own real, correct, computed-availability
query instead of the schema's own untrustworthy stored column:

```python
@app.get("/books", response_model=list[BookOut])
def list_books(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("""
        SELECT tbl_book.id, tbl_book.ttl, tbl_book.isbn, tbl_book.pub_yr,
               tbl_book.cat_id, tbl_book.qty_total,
               tbl_book.qty_total - (
                   SELECT COUNT(*) FROM tbl_loan
                   WHERE tbl_loan.book_id = tbl_book.id AND tbl_loan.ret_dt IS NULL
               ) AS qty_avail
        FROM tbl_book
    """).fetchall()
    return [dict(row) for row in rows]
```

```
$ curl http://127.0.0.1:8000/books
[{"id":1,"ttl":"The Pragmatic Programmer", ...,"qty_total":3,"qty_avail":2},
 {"id":2,"ttl":"Dune", ...,"qty_total":2,"qty_avail":1},
 {"id":3,"ttl":"The C Programming Language", ...,"qty_total":1,"qty_avail":0}]
```

Book `3`'s own real `qty_avail` in this response is `0` — the real,
honestly-computed value Lesson 47 already proved correct, not the
schema's own real, stored `1`. This endpoint deliberately never reads
`tbl_book.qty_avail` at all, choosing instead to compute the identical
real subquery Lesson 47's own cross-check already proved trustworthy —
a real, direct, informed decision, not an oversight.

### Discard

Nothing throwaway — `BookOut` and `list_books` are real, permanent,
correct additions to this project's own `main.py`.

### Mechanical Walkthrough

- `class BookOut(BaseModel): id: int; ttl: str; ...` — **(b) hard
  concept reappearing**, Lesson 30's own `BaseModel` shape, applied to
  `tbl_book`'s own real, different columns.
- `@app.get("/books", response_model=list[BookOut])` — **(b) hard
  concept reappearing**, Lesson 32's own real endpoint shape, unchanged
  mechanically; only the real path (`/books` instead of `/parts`) and
  the model are new.
- The real, nested `SELECT ... - (SELECT COUNT(*) FROM tbl_loan
  WHERE ...)` — **(b) hard concept reappearing**: Lesson 11's own real
  subquery shape, and Lesson 47's own exact, already-proven-correct
  availability formula, reused here verbatim rather than re-derived.

### CS Lens

Choosing to compute `qty_avail` fresh, rather than trust the schema's
own stored column, is a real, direct application of the same
**single source of truth** principle Lesson 12's own `low_stock` view
was originally built on: `tbl_loan`'s own real, current rows are the
one, real, authoritative fact this data actually depends on;
`tbl_book.qty_avail`, per Lesson 47's own direct proof, is merely a
real, sometimes-stale cache of it.

### SE Lens

The real, deliberate choice this endpoint makes — trusting a fresh
computation over a schema's own existing, named column — is a real,
concrete instance of a broader, honest principle this entire arc has
built toward: inheriting an unfamiliar schema does not mean accepting
every one of its own real design decisions uncritically. Lesson 47
proved, with real, direct evidence, that `qty_avail` cannot be trusted
blindly; this lesson's own endpoint acts on that real, earned knowledge
rather than ignoring it for the sake of a simpler query. Arc 5's own
real frontend, adapted to call `/books` instead of `/parts` (its own
`columns` configuration renamed from `data: "name"` to `data: "ttl"`,
and so on, following Lesson 39's own already-explained pattern exactly)
now shows every real user honestly correct availability, not a real,
silently drifted number.

## Connect the pieces

One real, deliberate failure, and one real, informed fix: changing only
`DB_PATH` proved a real database's own connection and its own schema
are genuinely independent facts, with a real `no such table: parts`
error as direct, provable evidence. `BookOut` and `list_books` then
gave this project a real, correct endpoint for `library_system.db`'s
own actual shape — deliberately choosing to recompute availability
fresh, using Lesson 47's own already-proven-correct formula, rather
than trust a stored column this arc already caught drifting.

## What breaks without this

Naively reuse `tbl_book.qty_avail` directly, skipping this lesson's own
deliberate computed-availability fix:

```python
@app.get("/books/naive", response_model=list[BookOut])
def list_books_naive(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM tbl_book").fetchall()
    return [dict(row) for row in rows]
```

```
$ curl http://127.0.0.1:8000/books/naive
[..., {"id":3,"ttl":"The C Programming Language", ...,"qty_total":1,"qty_avail":1}]
```

Book `3` reports `qty_avail: 1` — real, served directly to any real
client, silently claiming a genuinely unavailable book is available to
borrow. This is Lesson 47's own real drift, now reaching an actual API
response rather than staying confined to a manual CLI cross-check —
direct, concrete proof of why this lesson's own deliberate choice, not
the naive one, is this project's own real, correct endpoint.

## Exercises

1. Add a real `GET /books/{book_id}` endpoint, following Lesson 31's
   own path-parameter pattern, using this lesson's own identical,
   honest availability computation.
2. Adapt Arc 5's own real `index.html` (Lesson 39) to call `/books`
   instead of `/parts`, updating its own `columns` configuration to
   match `BookOut`'s own real field names — confirm the real,
   correctly-computed availability for `The C Programming Language`
   displays as `0`, not `1`, inside the real DataTable itself.

## Definition of Done

- [ ] You reproduced the real `no such table: parts` failure from
      naively swapping only `DB_PATH`.
- [ ] You built `GET /books`, correctly shaped for `tbl_book`, using
      Lesson 47's own honest, computed availability formula.
- [ ] You reproduced the real, drifted `qty_avail: 1` response from a
      naive version and confirmed your own fixed endpoint correctly
      reports `0` instead.
- [ ] You completed both exercises.

## Next

[Lesson 49 — SQLite's Limited `ALTER TABLE`, and the Table-Rebuild
Pattern](lesson-49-sqlites-limited-alter-table.md) finally makes a real,
structural fix to `library_system.db` itself possible — closing Lesson
47's own real drift at its actual source, not just working around it in
application code.
