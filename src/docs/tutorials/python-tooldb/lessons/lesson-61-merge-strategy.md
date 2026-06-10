# Python Tool Database — LAB 61 — Merge Strategy and Conflict Resolution

**Prerequisites:** Lab 60 (you can scan a directory for `.tooldb` files). Lab 55 (import pipeline). You can find all `.tooldb` files and import one. This lesson decides what to do when two files have the same tool.

**What this lab adds:**
- The merge problem: same tool, two databases, different (or identical) data
- `MergePolicy` as an enum — three explicit strategies, no ambiguity
- Idempotency: running a merge twice produces the same result as running it once
- Tracking provenance: every imported tool remembers which file it came from

**Time:** 45–55 minutes

---

## What You Will Build

A `merge_database(path, policy, service)` function that imports tools from a `.tooldb` file according to a named policy. Running it twice on the same file with `SKIP` policy produces:

```
First run:   Imported: 4, Skipped: 0
Second run:  Imported: 0, Skipped: 4   ← same result regardless of how many times you run it
```

---

> **Quick Check — try to answer before reading:**
>
> 1. You import `shop_floor.tooldb` every night to keep your database current. The same tool "EM-0500" is in both your database and the source file. Should you skip it or overwrite it? What information do you need to decide?
> 2. Running a function twice and getting the same result as running it once is called idempotency. Name one SQL statement you already know that is idempotent by design.
> 3. You import tools from three different files. Later, you want to know which file tool "EM-0500" came from. What column do you need on the tools table?
>
> *(Answers at the end of this lab)*

---

## Concept: `MergePolicy` Enum

**What it is:** An explicit named constant that represents a merge decision, instead of a string or boolean that could mean anything.

**The problem before:** Without an enum:

```python
def merge_database(path, overwrite=False, rename=False):
    # What does overwrite=True, rename=True mean? Both? Neither?
    # What if someone passes overwrite="yes"?
```

String parameters (`policy="skip"`) have the same problem — a typo (`"skp"`) silently does the wrong thing.

**The solution:**

```python
from enum import Enum, auto

class MergePolicy(Enum):
    SKIP      = auto()   # keep existing, ignore incoming duplicate
    OVERWRITE = auto()   # replace existing with incoming
    RENAME    = auto()   # keep both — append a suffix to the incoming name
```

`auto()` assigns sequential integer values automatically — you do not need to manage the numbers yourself. The value is irrelevant; the name is what matters.

**Smallest possible example:**

```python
from enum import Enum, auto

class Direction(Enum):
    NORTH = auto()
    SOUTH = auto()
    EAST  = auto()
    WEST  = auto()

move(Direction.NORTH)       # unambiguous
move("north")               # a typo becomes "nroth" — no error until runtime
```

**You will see this again in:** Every codebase that has a fixed set of choices: HTTP methods, database isolation levels, log levels, game states, UI themes. Python's standard library uses enums throughout (`http.HTTPStatus`, `logging.DEBUG`). Enums are the correct type for "one of N named options."

**Watch for:** `MergePolicy.SKIP` is not the string `"SKIP"`. `policy == "SKIP"` is always `False`. Compare with `policy == MergePolicy.SKIP`.

---

## Step 1 — Define the Enum and Source Column

First, add a `source_file` column to `ToolORM` so each tool knows where it came from:

```python
# In tooldb/orm/models.py — add to ToolORM:
source_file: Mapped[str | None] = mapped_column(String(500), nullable=True)  # ← add this
```

Generate and apply an Alembic migration:

```
alembic revision --autogenerate -m "add source_file to tools_orm"
alembic upgrade head
```

Now define the enum in `tooldb/importers/merge_policy.py`:

```python
from enum import Enum, auto

class MergePolicy(Enum):
    SKIP      = auto()
    OVERWRITE = auto()
    RENAME    = auto()
```

### SAVE AND TRY

```python
from tooldb.importers.merge_policy import MergePolicy

print(MergePolicy.SKIP)           # MergePolicy.SKIP
print(MergePolicy.SKIP.name)      # "SKIP"
print(MergePolicy.SKIP == MergePolicy.SKIP)    # True
print(MergePolicy.SKIP == MergePolicy.OVERWRITE)  # False
```

**You should see:**
```
MergePolicy.SKIP
SKIP
True
False
```

**Change something:** Try `MergePolicy("SKIP")` — you get `ValueError: 'SKIP' is not a valid MergePolicy`. Enums are accessed by name with `MergePolicy['SKIP']` (bracket notation), not by value. Change it back.

---

## Step 2 — Idempotency: The Core Idea

Before writing `merge_database`, nail down what idempotency means for this operation.

**Idempotent:** `f(f(x)) == f(x)` — applying the function twice gives the same result as applying it once.

For imports:
- SKIP policy: second run on the same file → all tools already exist → 0 imported. ✓ idempotent
- OVERWRITE policy: second run → all tools overwritten with identical data → database unchanged net. ✓ idempotent
- RENAME policy: second run → tools renamed again → "EM-0500 (2)" becomes "EM-0500 (3)". ✗ NOT idempotent

RENAME is inherently not idempotent unless you track which tools came from which source and avoid renaming a tool you already renamed. That complexity is out of scope here — the lesson flags it and uses SKIP and OVERWRITE as the safe choices.

---

## Step 3 — The Merge Function

Create `tooldb/importers/merge_policy.py` (extend the file):

```python
from pathlib import Path
from tooldb.importers.merge_policy import MergePolicy
from tooldb.importers.mastercam_importer import import_from_tooldb
from tooldb.services.tool_service_orm import ToolService
from tooldb.schemas.tool_schemas import ToolUpdate


def merge_database(path: str | Path, policy: MergePolicy,
                   service: ToolService) -> dict:
    """
    Imports tools from a .tooldb file according to the given policy.
    Returns a summary dict: {imported, skipped, overwritten, errors}.
    """
    source_name = Path(path).name     # just the filename, not the full path
    result = {"imported": 0, "skipped": 0, "overwritten": 0, "errors": []}
```

Use the existing `import_from_tooldb` function from Lesson 55 as the base — it already handles the adapter and validation. The merge function adds policy-based duplicate handling on top.

```python
    # Import with SKIP policy first (the default behavior)
    import_result = import_from_tooldb(str(path), service)
    result["imported"] = import_result.imported
    result["errors"]   = import_result.errors

    if policy == MergePolicy.OVERWRITE:
        # Re-read the source to find tools that were skipped as duplicates
        # and overwrite them
        from tooldb.adapters.mastercam_adapter import MastercamAdapter
        import sqlite3
        src = sqlite3.connect(str(path))
        src.row_factory = sqlite3.Row
        adapter = MastercamAdapter()

        for row in src.execute("SELECT * FROM dbo_ToolMgr_Tool").fetchall():
            tool_create = adapter.to_tool_create(dict(row))
            if tool_create is None:
                continue
            existing = service.get_tool_by_name(tool_create.name)
            if existing:
                update = ToolUpdate(**{
                    k: v for k, v in tool_create.model_dump().items()
                    if v is not None
                })
                service.update_tool(existing.id, update)
                result["overwritten"] += 1
        src.close()

    return result
```

The OVERWRITE branch re-opens the source file and updates any tool that already existed. This is safe to run multiple times — updating a tool to the same values it already has is a no-op at the database level.

### SAVE AND TRY

```python
from tooldb.importers.merge_policy import MergePolicy, merge_database
from tooldb.orm.session import SessionLocal
from tooldb.services.tool_service_orm import ToolService

with SessionLocal() as session:
    svc = ToolService(session)

    r1 = merge_database("sample_mastercam.tooldb", MergePolicy.SKIP, svc)
    print(f"First run:  imported={r1['imported']}, skipped={r1['skipped']}")

    r2 = merge_database("sample_mastercam.tooldb", MergePolicy.SKIP, svc)
    print(f"Second run: imported={r2['imported']}, skipped={r2['skipped']}")
```

**You should see:**
```
First run:  imported=4, skipped=0
Second run: imported=0, skipped=4
```

**Change something:** Change the second call to `MergePolicy.OVERWRITE`. The second run should show `overwritten=4`. Change it back.

---

## 🎯 Challenge: Add Source Tracking

**You know:** `ToolORM` now has a `source_file` column. The `merge_database` function knows the filename.

**Task:** Update `merge_database` to set `source_file = source_name` on every tool it imports. Tools imported manually (not from a file) should have `source_file = None`.

**Hint:** After `import_from_tooldb` runs successfully, query all tools from that source and update the missing `source_file` field. Or — better — pass `source_name` into the import pipeline so it is set during the INSERT.

---

<details>
<summary>▶ Show Solution</summary>

The cleanest fix is to set `source_file` during `create_tool` in the service. Add an optional parameter:

```python
# In ToolService.create_tool:
def create_tool(self, data: ToolCreate, source_file: str | None = None) -> ToolRead:
    fields = data.model_dump()
    fields["source_file"] = source_file    # ← add this
    tool_orm = ToolORM(**fields)
    self._session.add(tool_orm)
    self._session.commit()
    return ToolRead.model_validate(tool_orm)
```

Pass `source_file=source_name` from `merge_database` through to the importer through to the service. `source_file=None` for manual entries from the UI.

**Key insight:** Threading provenance through the call stack is the right design — the information travels with the data from the moment it enters the system. An alternative (updating source after the fact) is fragile because it requires a second pass and can miss tools if the first pass crashes partway through.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `MergePolicy.SKIP == MergePolicy.SKIP` is `True` | Run the enum comparison in Step 1 |
| `MergePolicy.SKIP == "SKIP"` is `False` | Try it in the REPL |
| SKIP policy: second run imports 0 tools | Run Step 3 SAVE AND TRY |
| OVERWRITE policy: second run updates existing tools | Change policy in Step 3 and rerun |
| Alembic migration added `source_file` column | `PRAGMA table_info(tools_orm)` — see the column |

---

## Quick Check Answers

**1. Skip or overwrite — what information do you need?**
Whether your local edits should be preserved. If you manually corrected a tool's name or notes in your database, SKIP preserves that. If the Mastercam library is the authoritative source and local edits are not allowed, OVERWRITE keeps you in sync. The answer is a policy decision, not a technical one — and it must be explicit.

**2. Name one idempotent SQL statement you already know:**
`INSERT OR IGNORE` (SQLite upsert from Lab 29) — running it twice on the same row inserts once and ignores the second attempt. `CREATE TABLE IF NOT EXISTS` is another — running it 10 times creates the table once. `UPDATE tools SET name='X' WHERE id=1` is also idempotent — setting the same value twice leaves the database unchanged.

**3. What column do you need?**
`source_file` — storing the filename (or full path) of the `.tooldb` file the tool was imported from. With this column, `WHERE source_file = 'shop_floor.tooldb'` shows every tool that came from that file. `WHERE source_file IS NULL` shows every tool entered manually.
