# Python Tool Database — LAB 19 — Data Provenance: Where Did This Come From?

**Prerequisites:** Lab 18. You have a migrations system with `migrate.py` and `migrations/` folder. You have `ToolRepository`. All tests pass.

**What this lab adds:**
- What data provenance means and why it matters for import-heavy systems
- Record-level provenance: `source` and `imported_at` columns
- Field-level provenance: a `field_sources` JSON column
- Why SQLite can store JSON and how to query inside it
- A `ProvenanceRepository` class with `find_by_source`, `find_mixed_provenance`
- Migration `0004_add_provenance.sql`

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A tool's diameter came from a Mastercam import. A machinist later manually updated its `notes` field. If you re-import from Mastercam, which fields should be overwritten? Which should be preserved?
> 2. What is the difference between record-level and field-level provenance? When do you need field-level?
> 3. SQLite has no JSON column type. Yet you will store `{"diameter": "mastercam", "notes": "manual"}` in a column. How?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A migration that adds provenance columns to `tools`, plus a `ProvenanceRepository`:

```
migrations/
    0004_add_provenance.sql    ← NEW: adds source, imported_at, field_sources

tooldb/
    provenance_repository.py  ← NEW: ProvenanceRepository class
tests/
    test_provenance.py        ← NEW: 5 tests
```

After migration `0004`, a tool row looks like:

```
id | name    | material | source     | imported_at          | field_sources
1  | EM-0500 | carbide  | mastercam  | 2024-01-15T09:30:00  | {"diameter": "mastercam", "notes": "manual"}
```

---

## Step 1 — The Provenance Problem

This project has three data entry paths:

1. **Manual entry** — a machinist fills in a form and saves a tool
2. **Mastercam import** — a `.tooldb` file from Mastercam contains tool records (Block 7)
3. **XML import** — a tool library XML file from a cutter manufacturer (Block 8)

What happens when an imported tool is modified by a machinist, and then the source is re-imported?

**Scenario:**

```
Step 1: Import EM-0500 from Mastercam
        diameter_inches = 0.500   (from Mastercam)
        material        = "carbide" (from Mastercam)
        notes           = NULL      (Mastercam doesn't export notes)

Step 2: Machinist adds a note manually
        notes = "Only use for aluminum — brittle edge on steel"

Step 3: Re-import EM-0500 from Mastercam (the file was updated)
        diameter_inches = 0.500   (unchanged)
        material        = "carbide" (unchanged)
        notes           = NULL      (Mastercam still doesn't export notes)
```

**Without provenance tracking:** The re-import overwrites the machinist's note with NULL. The note is gone permanently. The machinist is angry.

**With provenance tracking:** The re-import code checks `field_sources` before overwriting. It sees `"notes": "manual"` — a field the machinist owns. It skips the `notes` field during re-import. The machinist's note survives.

---

### Concept: Data Provenance — Tracking Origin as First-Class Data

**What it is:** Provenance (from the French *provenir* — to come from) records the origin of each piece of data. In a database, this means storing not just the value, but where the value came from and when.

**The two levels:**

**Record-level provenance:** The whole row came from one source.

```
source     = "mastercam"   -- where this tool record originated
imported_at = "2024-01-15T09:30:00"   -- when it was imported
```

Record-level is enough if the entire row either came from one source or was entered manually. It breaks down when different fields have different origins (Step 2 above).

**Field-level provenance:** Each field tracks its own origin.

```
field_sources = '{"diameter": "mastercam", "material": "mastercam", "notes": "manual"}'
```

A JSON column that maps field names to their source. This is more complex but handles mixed-origin records — a record where some fields came from Mastercam, some were typed manually, and some were computed.

**What provenance hides:** The need to handle re-import conflicts in ad-hoc per-field logic throughout the codebase. Without a provenance column, every import function has custom code like "if the field is blank and the existing value is not blank, keep the existing value." With `field_sources`, the re-import logic is centralized: "check `field_sources` before overwriting; only overwrite fields where the source is `imported`."

**The three source values for this project:**

| Value | Meaning |
|-------|---------|
| `"manual"` | A person typed this value directly |
| `"mastercam"` | Came from a Mastercam `.tooldb` import |
| `"xml"` | Came from an XML tool library import |
| `"computed"` | Derived from other fields (e.g., SFM from diameter and RPM) |

**You will see this again in:** Any system that imports data from external sources and allows manual editing. Version control systems track provenance at the commit level. Data warehouses have lineage columns. FHIR (healthcare records): every field can have a `source` reference. The pattern is universal for systems where data has multiple upstream origins.

**Watch for:** The complexity of field-level provenance. For most fields, re-importing is fine — geometry from Mastercam should always be trusted over whatever a machinist typed. Field-level provenance is only needed for fields that machinists legitimately own (notes, SFM preferences, nicknames). Design the import policy before storing provenance: "geometry fields always come from the import source; user-facing annotation fields always come from manual entry."

---

## Step 2 — JSON in SQLite

SQLite has no native JSON column type. It stores JSON as `TEXT`. Starting with SQLite 3.38.0 (2022), JSON functions are built in:

```sql
-- Store JSON as a TEXT column:
INSERT INTO tools (..., field_sources) VALUES (..., '{"diameter": "mastercam"}')

-- Query inside the JSON:
SELECT name FROM tools WHERE json_extract(field_sources, '$.diameter') = 'mastercam'
-- json_extract(column, '$.key') extracts the value for a key from a JSON object
```

**`json_extract` syntax:**

```python
# In Python:
conn.execute(
    "SELECT name FROM tools WHERE json_extract(field_sources, '$.diameter') = ?",
    ("mastercam",),
)
```

**Python's `json` module for encoding/decoding:**

```python
import json

# Encode Python dict → JSON string for storage:
sources = {"diameter": "mastercam", "notes": "manual"}
json_string = json.dumps(sources)   # → '{"diameter": "mastercam", "notes": "manual"}'

# Decode JSON string from database → Python dict:
stored_string = row["field_sources"]    # '{"diameter": "mastercam", ...}'
sources = json.loads(stored_string)     # → {"diameter": "mastercam", "notes": "manual"}
```

**You will see this again in:** PostgreSQL's `JSONB` column type (a native binary JSON format — faster queries than TEXT). MongoDB stores everything as JSON-like BSON documents. REST APIs send JSON in request/response bodies. The `json.dumps` / `json.loads` pattern is used constantly.

**Watch for:** `json.loads(None)` raises a `json.JSONDecodeError` or `TypeError`. When reading `field_sources` from the database, it may be `NULL` if no field sources were recorded. Always check for `None` before calling `json.loads`.

---

## Step 3 — Migration: Add Provenance Columns

Create `migrations/0004_add_provenance.sql`:

```sql
-- Migration 0004: add data provenance columns to tools
-- source: where the record came from ("manual", "mastercam", "xml")
-- imported_at: ISO 8601 timestamp of the import (NULL for manually entered tools)
-- field_sources: JSON object mapping field names to their source
--                e.g. {"diameter": "mastercam", "notes": "manual"}
--                NULL means all fields came from the record-level source

ALTER TABLE tools ADD COLUMN source TEXT DEFAULT 'manual';
ALTER TABLE tools ADD COLUMN imported_at TEXT;
ALTER TABLE tools ADD COLUMN field_sources TEXT;
```

Apply it:

```powershell
python -m tooldb.migrate
```

**You should see:**

```
Applying migration 0004_add_provenance.sql...
  Done. Schema version is now 4.
Migrations complete. Schema version: 4
```

Verify:

```python
python
import sqlite3
conn = sqlite3.connect("python-tooldb/tools.db")
cursor = conn.execute("PRAGMA table_info(tools)")
for row in cursor.fetchall():
    print(row[1], row[2])   # column name, column type
```

**You should see:** `source`, `imported_at`, `field_sources` in the column list.

---

## Step 4 — Red: Write the Tests

Create `tests/test_provenance.py`:

```python
import sqlite3
import json
import pytest
from tooldb.schema import create_schema
from tooldb.migrate import apply_migrations
from pathlib import Path
from tooldb.provenance_repository import ProvenanceRepository   # ← new


MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"


def make_db(tmp_path):
    """Create a database with full schema applied via migrations."""
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    apply_migrations(conn, MIGRATIONS_DIR)   # use migrations, not create_schema
    conn.row_factory = sqlite3.Row
    return conn


def test_insert_manual_tool_has_manual_source(tmp_path):
    conn = make_db(tmp_path)
    repo = ProvenanceRepository(conn)

    tool_id = repo.insert_manual(
        name="EM-0500",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
    )

    row = conn.execute("SELECT source, imported_at FROM tools WHERE id = ?", (tool_id,)).fetchone()
    assert row["source"] == "manual"
    assert row["imported_at"] is None   # manual entry has no import timestamp


def test_insert_imported_tool_has_source_and_timestamp(tmp_path):
    conn = make_db(tmp_path)
    repo = ProvenanceRepository(conn)

    tool_id = repo.insert_imported(
        name="EM-0500",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
        source="mastercam",
        field_sources={"diameter": "mastercam", "material": "mastercam"},
    )

    row = conn.execute("SELECT source, imported_at, field_sources FROM tools WHERE id = ?",
                       (tool_id,)).fetchone()
    assert row["source"] == "mastercam"
    assert row["imported_at"] is not None   # import timestamp was set
    sources = json.loads(row["field_sources"])
    assert sources["diameter"] == "mastercam"


def test_find_by_source_returns_correct_tools(tmp_path):
    conn = make_db(tmp_path)
    repo = ProvenanceRepository(conn)

    repo.insert_manual("EM-0500-manual", 0.5, "carbide", "endmill")
    repo.insert_imported("EM-0500-mc", 0.5, "carbide", "endmill",
                         source="mastercam", field_sources={})

    mastercam_tools = repo.find_by_source("mastercam")
    assert len(mastercam_tools) == 1
    assert mastercam_tools[0]["name"] == "EM-0500-mc"


def test_find_mixed_provenance(tmp_path):
    """Find tools where diameter came from mastercam but notes was entered manually."""
    conn = make_db(tmp_path)
    repo = ProvenanceRepository(conn)

    # Tool 1: diameter from mastercam, notes manual — MIXED
    repo.insert_imported(
        "EM-0500", 0.5, "carbide", "endmill",
        source="mastercam",
        field_sources={"diameter": "mastercam", "notes": "manual"},
    )
    # Tool 2: entirely from mastercam — NOT mixed
    repo.insert_imported(
        "DR-0250", 0.25, "carbide", "drill",
        source="mastercam",
        field_sources={"diameter": "mastercam"},
    )
    # Tool 3: manual entry — NOT this query's concern
    repo.insert_manual("FM-0750", 0.75, "carbide", "facemill")

    # Find tools where diameter came from mastercam AND notes came from manual
    mixed = repo.find_mixed_provenance(
        field="diameter", field_source="mastercam",
        other_field="notes", other_source="manual",
    )
    assert len(mixed) == 1
    assert mixed[0]["name"] == "EM-0500"


def test_update_field_source(tmp_path):
    conn = make_db(tmp_path)
    repo = ProvenanceRepository(conn)

    tool_id = repo.insert_imported(
        "EM-0500", 0.5, "carbide", "endmill",
        source="mastercam",
        field_sources={"diameter": "mastercam"},
    )

    # Machinist manually edits the notes field — update field source
    repo.update_field_source(tool_id, field="notes", source="manual")

    row = conn.execute("SELECT field_sources FROM tools WHERE id = ?", (tool_id,)).fetchone()
    sources = json.loads(row["field_sources"])
    assert sources["diameter"] == "mastercam"   # unchanged
    assert sources["notes"] == "manual"         # newly set
```

Run:

```
pytest tests/test_provenance.py -v
```

**You should see:** All 5 failing with `ModuleNotFoundError`. Red.

---

## Step 5 — Green: Create `tooldb/provenance_repository.py`

Create `tooldb/provenance_repository.py`:

```python
import sqlite3
import json
from datetime import datetime


class ProvenanceRepository:
    """All SQL for tools with provenance tracking.

    Distinguishes between manual entry (user-typed) and imported records
    (from Mastercam, XML, or other sources). Tracks field-level origins
    via a JSON column so re-imports can safely skip manually-edited fields.
    """

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.conn.execute("PRAGMA foreign_keys = ON")
        self.conn.row_factory = sqlite3.Row

    def insert_manual(
        self,
        name: str,
        diameter_inches: float,
        material: str,
        tool_type: str,
        flutes: int = None,
        notes: str = None,
    ) -> int:
        """Insert a tool entered manually by a user. Source is always 'manual'."""
        with self.conn:
            cursor = self.conn.execute(
                """
                INSERT INTO tools
                    (name, diameter_inches, material, tool_type, flutes, notes,
                     source, imported_at, field_sources)
                VALUES (?, ?, ?, ?, ?, ?, 'manual', NULL, NULL)
                """,
                # 'manual' is a literal constant here, not user input — no injection risk
                # imported_at is NULL: manual entry has no import timestamp
                # field_sources is NULL: all fields came from the user (record-level source sufficient)
                (name, diameter_inches, material, tool_type, flutes, notes),
            )
        return cursor.lastrowid

    def insert_imported(
        self,
        name: str,
        diameter_inches: float,
        material: str,
        tool_type: str,
        source: str,                    # "mastercam", "xml", etc.
        field_sources: dict,            # e.g. {"diameter": "mastercam", "notes": "manual"}
        flutes: int = None,
        notes: str = None,
    ) -> int:
        """Insert a tool from an external import source."""
        imported_at = datetime.now().isoformat()
        field_sources_json = json.dumps(field_sources)   # dict → JSON string for TEXT column
        with self.conn:
            cursor = self.conn.execute(
                """
                INSERT INTO tools
                    (name, diameter_inches, material, tool_type, flutes, notes,
                     source, imported_at, field_sources)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (name, diameter_inches, material, tool_type, flutes, notes,
                 source, imported_at, field_sources_json),
            )
        return cursor.lastrowid

    def find_by_source(self, source: str) -> list[dict]:
        """Return all tools from a given source."""
        rows = self.conn.execute(
            """
            SELECT id, name, diameter_inches, material, tool_type,
                   source, imported_at, field_sources
            FROM tools
            WHERE source = ?
            ORDER BY name
            """,
            (source,),
        ).fetchall()
        return [self._row_to_dict(row) for row in rows]

    def find_mixed_provenance(
        self,
        field: str,
        field_source: str,
        other_field: str,
        other_source: str,
    ) -> list[dict]:
        """Find tools where `field` came from `field_source`
        AND `other_field` came from `other_source`.

        Example: field='diameter', field_source='mastercam',
                 other_field='notes', other_source='manual'
        finds tools where Mastercam provided the geometry but a machinist added the note.
        """
        rows = self.conn.execute(
            """
            SELECT id, name, diameter_inches, material, tool_type, source, field_sources
            FROM tools
            WHERE json_extract(field_sources, '$.' || ?) = ?
              AND json_extract(field_sources, '$.' || ?) = ?
            ORDER BY name
            """,
            # '$.' || field builds the JSON path: "$.diameter", "$.notes"
            # '||' is SQLite's string concatenation operator
            (field, field_source, other_field, other_source),
        ).fetchall()
        return [self._row_to_dict(row) for row in rows]

    def update_field_source(
        self,
        tool_id: int,
        field: str,
        source: str,
    ) -> None:
        """Record that a specific field's value came from `source`.

        Reads the existing field_sources JSON, adds/updates the key, writes it back.
        """
        row = self.conn.execute(
            "SELECT field_sources FROM tools WHERE id = ?", (tool_id,)
        ).fetchone()
        if row is None:
            raise ValueError(f"No tool with id {tool_id}")

        # Parse existing JSON (or start with empty dict if NULL)
        existing = json.loads(row["field_sources"]) if row["field_sources"] else {}
        existing[field] = source    # add or overwrite this field's source

        with self.conn:
            self.conn.execute(
                "UPDATE tools SET field_sources = ? WHERE id = ?",
                (json.dumps(existing), tool_id),
            )

    def _row_to_dict(self, row: sqlite3.Row) -> dict:
        """Convert a sqlite3.Row to a dict, decoding field_sources JSON if present."""
        d = dict(row)
        if d.get("field_sources"):
            d["field_sources"] = json.loads(d["field_sources"])   # JSON string → Python dict
        return d
```

Run:

```
pytest tests/test_provenance.py -v
```

**You should see:**

```
PASSED tests/test_provenance.py::test_insert_manual_tool_has_manual_source
PASSED tests/test_provenance.py::test_insert_imported_tool_has_source_and_timestamp
PASSED tests/test_provenance.py::test_find_by_source_returns_correct_tools
PASSED tests/test_provenance.py::test_find_mixed_provenance
PASSED tests/test_provenance.py::test_update_field_source
```

All green.

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests across all files passing.

**Change something:** In `find_mixed_provenance`, remove the `AND` condition — keep only the first `json_extract` clause. Run `test_find_mixed_provenance`. The test fails because both Tool 1 (mixed) and Tool 2 (all mastercam) now match — both have `diameter = "mastercam"`. The AND condition is what distinguishes mixed provenance. Restore it.

---

## 🎯 Challenge: `find_tools_needing_reimport`

**You know:** `find_by_source`, `json_extract`, AND conditions.

**Task:** Add `find_tools_needing_reimport(self, source, days_old)` to `ProvenanceRepository`. It should return tools from a given source whose `imported_at` is older than `days_old` days. These are candidates for re-import (their upstream source may have been updated since the last import).

**Hints:**

1. SQLite date comparison: `imported_at < datetime('now', '-' || ? || ' days')`
2. The `||` operator concatenates strings in SQLite: `'-' || '7' || ' days'` = `'-7 days'`
3. Only tools with a non-NULL `imported_at` can be stale

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def find_tools_needing_reimport(self, source: str, days_old: int) -> list[dict]:
    """Return imported tools whose import_at is older than days_old days."""
    rows = self.conn.execute(
        """
        SELECT id, name, source, imported_at
        FROM tools
        WHERE source = ?
          AND imported_at IS NOT NULL
          AND imported_at < datetime('now', '-' || ? || ' days')
        ORDER BY imported_at ASC
        """,
        (source, str(days_old)),   # days_old must be a string for concatenation in SQL
    ).fetchall()
    return [dict(row) for row in rows]
```

Test (approximate — exact datetime comparison is tricky in tests):

```python
def test_find_tools_needing_reimport_excludes_recent(tmp_path):
    conn = make_db(tmp_path)
    repo = ProvenanceRepository(conn)

    # Insert a tool with a recent import — should NOT be stale
    repo.insert_imported("recent-tool", 0.5, "carbide", "endmill",
                         source="mastercam", field_sources={})

    # Nothing older than 1 day (just inserted)
    stale = repo.find_tools_needing_reimport("mastercam", days_old=1)
    assert len(stale) == 0
```

**Key insight:** SQLite's `datetime('now', '-7 days')` generates a datetime string 7 days in the past. String comparison works correctly for ISO 8601 datetimes because they sort lexicographically in the same order as chronologically. The `||` concatenation builds the modifier string dynamically from the `days_old` parameter — note that the parameter must be cast to a string for the concatenation to work.

</details>

---

## Step 6 — Re-Import Logic (Preview)

Provenance tracking is only valuable if the import logic uses it. Here is the pseudocode for a re-import function (built in Block 7):

```python
def reimport_tool_from_mastercam(conn, mastercam_data, existing_tool_id):
    """Update a tool from a Mastercam import, respecting field-level provenance."""
    repo = ProvenanceRepository(conn)
    existing = conn.execute("SELECT field_sources FROM tools WHERE id = ?",
                            (existing_tool_id,)).fetchone()
    existing_sources = json.loads(existing["field_sources"] or "{}")

    updates = {}
    for field, new_value in mastercam_data.items():
        current_source = existing_sources.get(field, "mastercam")  # assume mastercam if not tracked

        if current_source == "manual":
            # The machinist owns this field — skip the re-import value
            continue

        updates[field] = new_value
        existing_sources[field] = "mastercam"   # re-assert mastercam ownership

    # Apply only the non-manually-owned updates
    if updates:
        with conn:
            for field, value in updates.items():
                conn.execute(f"UPDATE tools SET {field} = ? WHERE id = ?", (value, existing_tool_id))
            conn.execute("UPDATE tools SET field_sources = ?, imported_at = ? WHERE id = ?",
                         (json.dumps(existing_sources), datetime.now().isoformat(), existing_tool_id))
```

The provenance system makes this logic possible. Without `field_sources`, you would have to decide "overwrite everything" or "overwrite nothing" — there is no per-field granularity.

---

## Final Check

| Feature | How to verify |
|---|---|
| Migration 0004 adds provenance columns | Run `python -m tooldb.migrate`, then `PRAGMA table_info(tools)` |
| `insert_manual` sets source='manual', imported_at=NULL | Run `test_insert_manual_tool_has_manual_source` |
| `insert_imported` sets source and timestamp | Run `test_insert_imported_tool_has_source_and_timestamp` |
| `find_by_source` filters by source column | Run `test_find_by_source_returns_correct_tools` |
| `find_mixed_provenance` uses `json_extract` | Run `test_find_mixed_provenance` — only mixed tool returned |
| `update_field_source` updates without overwriting other fields | Run `test_update_field_source` — diameter source unchanged |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. Mastercam re-import: which fields should be overwritten? Which preserved?**

Fields that came from Mastercam originally (geometry: diameter, flutes, tool_type, material) should be overwritten with the new import values — the machinist trusts the CAM system for geometry. Fields that the machinist entered manually (notes, preferred_sfm, custom labels) should be preserved — the machinist owns these fields and the import source has no information about them. The `field_sources` JSON makes this decision per-field: only overwrite fields where `field_sources[field] != "manual"`.

**2. Record-level vs field-level provenance — when do you need field-level?**

Record-level provenance (`source = "mastercam"`) is sufficient when the entire record has one origin. It works for simple use cases: "was this tool imported or entered manually?" Field-level provenance is necessary when different fields on the same record have different origins — for example, geometry from Mastercam and notes from manual entry. Without field-level tracking, a re-import must choose between overwriting everything (losing manual annotations) or overwriting nothing (losing legitimate geometry updates). Field-level tracking is the resolution.

**3. SQLite has no JSON type — how do you store JSON?**

Store it as `TEXT`. A `TEXT` column in SQLite stores any string value. SQLite's `json_extract()` function (built in since 3.38.0) can read inside the JSON string: `json_extract(field_sources, '$.diameter')` returns the value of the `diameter` key. From Python's side, use `json.dumps(dict)` to encode before INSERT and `json.loads(string)` to decode after SELECT. The JSON column is transparent text from SQLite's perspective; the application handles encoding and decoding.
