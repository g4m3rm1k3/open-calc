# Lesson 25: Configurable File Types and Form Requirements

**What you will build:** a real, database-backed configuration system
for which file types Forge accepts, and what real, additional metadata
each one requires — replacing Lesson 02's own real, hardcoded
`ALLOWED_EXTENSIONS` set, editable now by any real admin, with no code
change or redeploy required at all.

**What you need to know first:** [Lesson 02](lesson-02-the-domain-layer-for-real.md)
— `is_allowed_file_type`'s own original, real, hardcoded set, this
lesson's own direct replacement. [Lesson 11](lesson-11-roles-and-authorization.md)
— `require_role`, reused directly to protect this lesson's own real,
new admin-only endpoint.

**Terms introduced in this lesson:** none new — **configuration as
data** is a real, direct application of principles this project has
already used repeatedly.

**Objects and methods used:** none new — this lesson uses Python's
real, standard-library `json` module (`json.dumps`/`json.loads`), both
genuinely ordinary, real, standard functions.

---

## Concept Unit: File Types, Stored, Not Hardcoded

### The Problem

Lesson 02's own `ALLOWED_EXTENSIONS` is a real, plain, hardcoded Python
`set`. Adding a real, new, genuinely needed file type — a real,
company-specific CAM format, say — requires editing real source code
and redeploying this project's own entire application.

### Introduce the Concept in Isolation

```sql
-- a real, new migration
CREATE TABLE file_type_configs (
    id INTEGER PRIMARY KEY,
    extension TEXT NOT NULL UNIQUE,
    required_fields TEXT NOT NULL DEFAULT '[]'
)
```

```python
# src/data/file_type_configs_repository.py
import json


def get_allowed_extensions(conn) -> set[str]:
    rows = conn.execute("SELECT extension FROM file_type_configs").fetchall()
    return {row["extension"] for row in rows}


def add_file_type_config(conn, extension: str, required_fields: list[str]) -> None:
    conn.execute(
        """
        INSERT INTO file_type_configs (extension, required_fields) VALUES (?, ?)
        ON CONFLICT(extension) DO UPDATE SET required_fields = excluded.required_fields
        """,
        (extension, json.dumps(required_fields)),
    )
    conn.commit()
```

Lesson 02's own real, pure domain function, revised to accept the real,
allowed set as a real, injected argument, rather than reading a
hardcoded, module-level constant directly:

```python
# src/domain/file_types.py (revised)
import os


def is_allowed_file_type(filename: str, allowed_extensions: set[str]) -> bool:
    if not filename:
        raise ValueError("filename must not be empty")
    _, ext = os.path.splitext(filename)
    return ext.lstrip(".").lower() in allowed_extensions
```

```python
@router.post("/api/file-types")
def create_file_type_config(
    extension: str, required_fields: list[str],
    db=Depends(get_db), current_user=Depends(require_role("admin")),
):
    add_file_type_config(db, extension, required_fields)
    return {"extension": extension, "required_fields": required_fields}
```

```
$ curl -X POST --cookie "session_token=<an admin>" http://127.0.0.1:8000/api/file-types \
    -d '{"extension": "sldprt", "required_fields": ["material", "revision"]}'
{"extension":"sldprt","required_fields":["material","revision"]}
```

A real, new, allowed file type, added entirely through a real, live API
call — no source code touched, no real redeploy required, exactly the
real, concrete capability this project's own real, existing application
already needs.

### Discard

`ALLOWED_EXTENSIONS`, Lesson 02's own original, hardcoded constant, is
retired entirely; every real piece here is permanent.

### Mechanical Walkthrough

- `required_fields TEXT NOT NULL DEFAULT '[]'` — **(b) hard concept
  reappearing** for `NOT NULL`/`DEFAULT` (`sqlite-mastery` Lesson 07);
  storing a real, JSON-encoded list inside an ordinary `TEXT` column —
  **(a) first appearance** of this specific, real, deliberate choice,
  reusing `sqlite-mastery` Lesson 16's own real JSON-in-SQLite
  principle, here handled entirely in Python rather than SQL's own
  JSON1 functions.
- `json.dumps(required_fields)` / `json.loads(row["required_fields"])`
  — **(a) first appearance** of Python's own real, standard-library
  `json` module, converting a real Python list to and from its own
  real, textual JSON representation.
- `is_allowed_file_type(filename, allowed_extensions)` — **(b) hard
  concept reappearing** for the function itself (Lesson 02); the real,
  revised, injected `allowed_extensions` parameter — **(a) first
  appearance** of applying Lesson 17's own real dependency-injection
  discipline to this specific, real function for the first time.

### CS Lens

Moving `ALLOWED_EXTENSIONS` from a real, hardcoded Python constant into
real, live, queryable data is a direct, concrete instance of
**configuration as data** — the identical real principle Lesson 24's
own migration list, and `sqlite-mastery`'s own Lesson 40 sortable-
column allowlist, already applied: a real, changeable fact about how
this system behaves, represented as real, inspectable, real data,
rather than baked into the real, deployed program itself.

### SE Lens

The real, deliberate reason `is_allowed_file_type` now takes
`allowed_extensions` as a real, explicit argument, rather than reading
it directly from the database itself: Lesson 02's own real rule, upheld
once more — the domain layer stays real, pure, and testable with a
plain, real Python set, entirely independent of whether that set
ultimately came from a hardcoded constant or a real, live database
table.

## Concept Unit: A Real, Configurable Requirement, Checked at Check-In

### The Problem

Knowing which extensions are allowed is only half of what this
project's own real, existing application needs — some real file types
require real, additional metadata (a material, a revision number) that
others don't.

### Introduce the Concept in Isolation

```python
def get_required_fields(conn, extension: str) -> list[str]:
    row = conn.execute(
        "SELECT required_fields FROM file_type_configs WHERE extension = ?", (extension,)
    ).fetchone()
    return json.loads(row["required_fields"]) if row else []


def validate_metadata(required_fields: list[str], provided_metadata: dict) -> list[str]:
    return [field for field in required_fields if field not in provided_metadata]
```

```
$ python -c "
from src.domain.file_types import validate_metadata
print(validate_metadata(['material', 'revision'], {'material': '6061-T6'}))
"
['revision']
```

`validate_metadata`, a real, pure, framework-agnostic function (Lesson
02's own rule, upheld again), correctly identifies exactly which real,
required fields are genuinely missing from a real, provided set —
`revision`, and only `revision`, since `material` was actually
supplied.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

- `[field for field in required_fields if field not in
  provided_metadata]` — **(a) first appearance** of this real, standard
  Python list-comprehension pattern, filtering a real list against a
  real, second collection's own membership.

### CS Lens

This is a real, direct instance of a **set difference**, expressed as
ordinary Python rather than SQL — the identical real, underlying
operation `sqlite-mastery`'s own Lesson 24 migration runner already
used (`set(selected_types) - JOINABLE_TYPES.keys()`), applied here to
real, required metadata fields instead.

### SE Lens

The real, deliberate reason this validation lives in the domain layer,
not scattered across every real endpoint that might eventually need
it: Phase 4's own real check-in endpoint (Lesson 22) is the one, real,
correct place to call `validate_metadata` before ever committing a
real file — a real, direct, future integration point this lesson
deliberately leaves as an exercise, rather than retrofitting Lesson
22's own already-complete, real code here.

## Connect the pieces

`file_type_configs`, a real, database-backed table, replaced Lesson
02's own hardcoded `ALLOWED_EXTENSIONS` entirely — real, changeable by
any real admin, through a real, live API call, with `is_allowed_
file_type` revised to accept it as a real, injected argument rather
than a hardcoded constant. `validate_metadata`, a real, pure function,
then gave this project a real, correct way to check whether a real
file's own, provided metadata actually satisfies its own file type's
real, configured requirements.

## What breaks without this

Not applicable in this lesson's own usual sense — Lesson 02's own
original, hardcoded `ALLOWED_EXTENSIONS` *is* this lesson's own real
"what breaks" comparison: adding a real, new file type there requires
editing real, deployed source code directly; this lesson's own real,
live `POST /api/file-types` endpoint requires nothing but one, real,
ordinary API call, from any real admin, with the running application
never restarted at all.

## Exercises

1. Wire `validate_metadata` into Lesson 22's own real check-in
   endpoint — reject a real check-in with a real, honest `400` if any
   of the file's own configured, required fields are missing from the
   real, provided metadata.
2. Add a real `DELETE /api/file-types/{extension}` endpoint, protected
   with `require_role("admin")`, removing a real, previously-configured
   file type entirely.

## Definition of Done

- [ ] You replaced `ALLOWED_EXTENSIONS` with a real, database-backed
      configuration table.
- [ ] You added a real, new file type through a live API call, with no
      code change or redeploy.
- [ ] You built `validate_metadata` and confirmed it correctly
      identifies missing, required fields.
- [ ] You completed both exercises.

## Next

[Lesson 26 — Search](lesson-26-search.md) gives this project's own real,
growing file tree a real, working way to find one specific file by
name, type, or metadata.
