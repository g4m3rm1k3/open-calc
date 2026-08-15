# Lesson 04: The Domain Types

**What you will build:** a real, explicit, shared shape for `File` —
this project's own first real domain type — replacing the raw
`sqlite3.Row`/`dict` this series has passed between layers so far, and
direct, run proof of a real, silent data leak that explicit typing
closes.

**What you need to know first:** [Lesson 03](lesson-03-sqlite-and-the-data-layer.md)
— `files_repository.py`'s own real functions, returning raw
`sqlite3.Row` objects (`sqlite-mastery` Lesson 19) this lesson replaces
with something more deliberate.

**Terms introduced in this lesson:**
- **`dataclass`** — a real, standard-library Python decorator
  (`from dataclasses import dataclass`) that turns a real, plain,
  type-annotated class into one with an automatically generated,
  correct `__init__`, `__repr__`, and `__eq__` — Python's own real,
  built-in answer to "a plain, typed shape for a piece of data," with
  zero external dependency at all, not even Pydantic.

**Objects and methods used:**

**`dataclasses.dataclass`**
- *What it is:* a real, standard-library decorator.
- *Implementation:* `@dataclass` above a class whose body is nothing
  but real, type-annotated attributes (`id: int`, `path: str`) —
  Python generates a real, correct constructor accepting each one as a
  real, named argument, in declared order.
- *Its use:* `File`, this project's own real, first domain type.

---

## Concept Unit: `File`, a Real, Explicit Shape

### The Problem

Every real function in `files_repository.py` currently returns a raw
`sqlite3.Row` — real, working, and genuinely unclear, at a glance, what
fields a caller can actually rely on without opening `files_repository.py`
itself and reading the real SQL. This project's own domain layer
(Lesson 02) deserves its own real, explicit vocabulary for what a
`File` actually *is*, independent of how it happens to be stored.

### Introduce the Concept in Isolation

```python
# src/domain/types.py
from dataclasses import dataclass


@dataclass
class File:
    id: int
    path: str
    name: str
    file_type: str
```

```
$ python -c "
from src.domain.types import File
f = File(id=1, path='parts/bracket.sldprt', name='bracket.sldprt', file_type='sldprt')
print(f)
print(f.name)
"
File(id=1, path='parts/bracket.sldprt', name='bracket.sldprt', file_type='sldprt')
bracket.sldprt
```

A real, genuine Python object — `print(f)` shows every real field,
correctly labeled, entirely for free, because `@dataclass` generated a
real `__repr__` automatically; `f.name` reads a real, named attribute,
not a real, easy-to-mistype dictionary key (`f["nmae"]`, say, silently
producing a real `KeyError` only `dict`-based access would risk).

The real, direct payoff — converting a real row into this real,
explicit shape, at the exact real boundary where it enters this
project's own domain:

```python
# src/data/files_repository.py (extended)
from src.domain.types import File


def _row_to_file(row) -> File:
    return File(id=row["id"], path=row["path"], name=row["name"], file_type=row["file_type"])


def list_files(conn) -> list[File]:
    rows = conn.execute("SELECT * FROM files ORDER BY path").fetchall()
    return [_row_to_file(row) for row in rows]
```

### Discard

Nothing throwaway — `src/domain/types.py` and this lesson's own
extended `files_repository.py` are both permanent; every later real
table this project adds gets its own, real, equivalent dataclass.

### Mechanical Walkthrough

- `from dataclasses import dataclass` / `@dataclass class File: id:
  int; path: str; ...` — **(a) first appearance**, full treatment
  above.
- `File(id=1, path='...', name='...', file_type='...')` — **(a) first
  appearance** of a real, automatically-generated dataclass
  constructor, called with real, named keyword arguments.
- `def _row_to_file(row) -> File: return File(id=row["id"], ...)` —
  **(a) first appearance** of this real, deliberate conversion
  pattern: a small, dedicated function translating one real row into
  one real, explicit domain object, at exactly the boundary where raw
  storage becomes real, typed domain data.

### CS Lens

`File` is a real, minimal instance of a **value object** — an
immutable-in-spirit (nothing here technically prevents mutation, but
nothing in this project ever does), plain, comparable representation
of a real piece of data, defined once, by its own real shape, rather
than every caller separately trusting an informally-agreed dictionary
key set.

### SE Lens

The real, deliberate reason this project reaches for a plain
`dataclass` here, rather than reusing `sqlite-mastery`'s own already-
taught Pydantic `BaseModel` (Lesson 30): Pydantic is a real, genuine,
third-party dependency — not FastAPI itself, and so not a literal
violation of Lesson 02's own rule, but still a real, external package
this project's own domain layer has no real reason to depend on, when
the real, standard library already provides everything needed. Pydantic
remains the real, correct tool one layer up, at the API boundary
(Lesson 06's own subject), for real request/response validation
specifically — the same real distinction Lesson 02 already drew between
`ValueError` (domain) and `HTTPException` (API), applied here to typed
shapes instead of exceptions.

## Concept Unit: What an Explicit Shape Closes

### The Problem

A real, new, genuinely sensitive column is added to `files` — a real,
internal note field, never meant for a real, ordinary API response.
Does this project's own code notice?

### Introduce the Concept in Isolation

```
$ sqlite3 forge.db "ALTER TABLE files ADD COLUMN internal_notes TEXT;"
$ sqlite3 forge.db "UPDATE files SET internal_notes = 'flagged for review — do not release' WHERE id = 1;"
```

The real, old route, still returning a raw `dict(row)` (this project's
own earlier, Lesson 03 shape):

```python
@router.get("/api/files/raw")
def get_files_raw(db=Depends(get_db)):
    rows = db.execute("SELECT * FROM files ORDER BY path").fetchall()
    return [dict(row) for row in rows]
```

```
$ curl http://127.0.0.1:8000/api/files/raw
[{"id":1,"path":"parts/bracket.sldprt","name":"bracket.sldprt","file_type":"sldprt","internal_notes":"flagged for review — do not release"}]
```

A real, genuine leak — `internal_notes`, never intended for this real
response, appears anyway, silently, the instant the column existed,
because `dict(row)` includes *every* real column, unconditionally. The
identical real request, through this lesson's own new, `File`-based
route:

```python
@router.get("/api/files")
def get_files(db=Depends(get_db)):
    files = list_files(db)
    return [{"id": f.id, "path": f.path, "name": f.name, "file_type": f.file_type} for f in files]
```

```
$ curl http://127.0.0.1:8000/api/files
[{"id":1,"path":"parts/bracket.sldprt","name":"bracket.sldprt","file_type":"sldprt"}]
```

No leak — `File`'s own real, fixed, explicit fields never included
`internal_notes` at all, because nothing in `_row_to_file` was ever
told to read it. Adding a real, new column to the real table changed
nothing about this route's own real, deliberate output.

### Discard

`internal_notes` and its own real, deliberate test value are throwaway,
added only to prove this unit's own point — a real, permanent
`internal_notes` field, if this project ever genuinely needs one, would
be added to `File` explicitly, by a real, deliberate decision, not
discovered as an accidental leak.

### Mechanical Walkthrough

- `ALTER TABLE files ADD COLUMN internal_notes TEXT;` — **(b) hard
  concept reappearing**, `sqlite-mastery` Lesson 08's own real `ADD
  COLUMN`, unchanged.
- `[dict(row) for row in rows]` — **(b) hard concept reappearing**,
  `sqlite-mastery` Lesson 19's own real `dict(row)` conversion — its
  real, unconditional inclusion of every column is this unit's own
  entire point.
- `[{"id": f.id, "path": f.path, ...} for f in files]` — **(b) hard
  concept reappearing**, ordinary Python attribute access on this
  lesson's own real `File` objects.

### CS Lens

This is the identical real principle `sqlite-mastery`'s own Lesson 30
already proved for `response_model` — an **explicit allowlist**,
stated once, beats an implicit blocklist that has to be remembered
every time new, real data appears — applied here one layer earlier, at
the domain type itself, rather than only at the API's own
`response_model`.

### SE Lens

The real, honest cost of this project's own real, deliberate choice:
every new, real field on `File` has to be added by hand, in a real,
visible place, rather than arriving automatically the moment a column
exists. This is the exact real tradeoff this lesson's own proof
justifies directly — a real, small, ongoing maintenance cost, paid
once per real field, in exchange for the real, structural guarantee
that nothing this project's data layer holds is ever exposed by
accident.

## Connect the pieces

`File`, a real, plain `dataclass` with zero framework dependency,
replaced the raw `sqlite3.Row`/`dict` this project's own data layer
returned since Lesson 03 — `_row_to_file` converting at exactly the
real boundary where storage becomes domain data. A real, new,
genuinely sensitive column then proved the concrete difference
directly: the old, `dict`-based route leaked it immediately; the new,
`File`-based one could not, because nothing in its own real, explicit
shape ever asked for it.

## What breaks without this

Not applicable beyond this lesson's own second unit, which is itself
this lesson's real, concrete proof — the real `internal_notes` leak,
caused and observed directly against the pre-`File` route.

## Exercises

1. Add real, equivalent `User` and `Lock` dataclasses to
   `src/domain/types.py`, anticipating Phase 2 and Phase 4's own real,
   upcoming tables — you do not yet have real tables to back them; the
   real point is committing to their own, explicit shape first.
2. Delete this lesson's own real `get_files_raw` route entirely — it
   was disposable proof, never a real, permanent part of this project —
   and confirm `GET /api/files` alone still returns the real, correct,
   leak-free result.

## Definition of Done

- [ ] You created `File` as a real, plain `dataclass` with zero
      external dependency.
- [ ] You converted real rows into real `File` objects at the data-
      layer boundary.
- [ ] You reproduced the real `internal_notes` leak against the old
      route and confirmed the new one doesn't reproduce it.
- [ ] You completed both exercises.

## Next

[Lesson 05 — Schema Migrations](lesson-05-schema-migrations.md) replaces
this lesson's own real, ad-hoc `ALTER TABLE` command with `sqlite-
mastery`'s own real, versioned migration runner, reused directly.
