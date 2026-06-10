# Python Tool Database — LAB 29 — Naming Conventions as Validation Rules

**Prerequisites:** Lab 28. You have `ValidationResult` with errors and warnings, `ToolCreate` with Pydantic validators, and `format_pydantic_errors`. Now you extend validation with *configurable* naming conventions — rules that live in the database, not the code.

**What this lab adds:**
- Naming conventions as database-stored rules (not hard-coded)
- Regular expressions for pattern matching
- `check_naming_convention` — returns a warning, not an error
- A `conventions` table in the database
- Why conventions are warnings (not errors): the data might be valid but unusual

**Time:** 50–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A naming convention rule is currently hard-coded as `TOOL_NAME_PATTERN = r"^[A-Z]{2,4}-\d{4}$"`. Different shops use different conventions. What must change to make this configurable without a code deployment?
> 2. A tool name `"my endmill"` does not match the shop's naming convention. Should validation return an error (reject the tool) or a warning (accept it but flag it)? Why?
> 3. You store a regex pattern in a database TEXT column. A user enters `"[unclosed"` as the pattern. What goes wrong when you try to compile it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `conventions` table and a `check_naming_convention` function:

```python
# tooldb/validation.py (additions)
def check_naming_convention(name: str, pattern: str, description: str, example: str) -> str | None:
    """Return a warning string if name does not match pattern, else None."""


# tooldb/repositories/convention_repository.py (NEW)
class ConventionRepository:
    def get_active_convention(self, entity_type: str, field_name: str) -> dict | None: ...
    def upsert_convention(self, entity_type, field_name, pattern, description, example) -> None: ...
```

New migration:
```
migrations/0005_add_conventions_table.sql
```

New files:
```
tooldb/repositories/convention_repository.py
tests/test_conventions.py
```

---

## Step 1 — Why Conventions Are Warnings, Not Errors

Consider two scenarios:

**Scenario A — imported tool from legacy data:**
A Mastercam `.tooldb` file has a tool named `"1/2 FLAT ENDMILL"`. This doesn't match the shop's convention `EM-0500-4FL-C`. But the data is correct — it is a real tool with valid parameters. The import should succeed; the name should be flagged for review.

**Scenario B — user types a misspelled name:**
A user types `"endmil"` in the Add Tool form. It doesn't match the convention. It might be a typo. It should be flagged — but not rejected. The machinist may know their tool by this name and the convention may not apply to this tool type.

In both cases: the naming convention mismatch is *informational*. It does not make the data invalid. It says "you might want to review this." This is a warning.

The `ValidationResult.warnings` list (which you added in Lesson 27) holds these. They do not block save; they appear in the UI as yellow indicators rather than red errors.

---

## Step 2 — Regular Expressions: The Minimum You Need

A regular expression (regex) is a pattern that matches strings. Python's `re` module handles them.

For naming conventions, you need three operations:

```python
import re

# 1. Check if a string matches a pattern:
pattern = r"^EM-\d{4}-\d{1,2}FL-[CHT]$"
name = "EM-0500-4FL-C"
matches = bool(re.match(pattern, name))  # True

# 2. Check if it doesn't match:
name = "my endmill"
matches = bool(re.match(pattern, name))  # False — this is a warning

# 3. Handle a bad pattern (stored in the database by a user):
bad_pattern = "[unclosed"
try:
    re.compile(bad_pattern)
except re.error as exc:
    # log the error, treat it as "no convention active"
    pass
```

Pattern syntax used in this lesson:

| Pattern | Matches |
|---------|---------|
| `^` | Start of string |
| `$` | End of string |
| `[A-Z]` | Any uppercase letter A–Z |
| `\d` | Any digit 0–9 |
| `{4}` | Exactly 4 of the previous thing |
| `{1,2}` | 1 or 2 of the previous thing |
| `[CHT]` | Any of: C, H, T |

Example convention for tool names: `^[A-Z]{2,4}-\d{4}-\d{1,2}FL-[CHT]$`
- Matches: `EM-0500-4FL-C` (endmill, 0.5", 4 flutes, carbide)
- Matches: `DR-0250-2FL-H` (drill, 0.25", 2 flutes, HSS)
- Doesn't match: `1/2 endmill` (no convention structure)

---

## Step 3 — RED: Tests for `check_naming_convention`

Add to `tests/test_validation.py`:

```python
from tooldb.validation import check_naming_convention

TOOL_PATTERN = r"^[A-Z]{2,4}-\d{4}-\d{1,2}FL-[CHT]$"
TOOL_DESCRIPTION = "Tool names must follow: TYPE-DIAMETER-FLUTES-MATERIAL"
TOOL_EXAMPLE = "EM-0500-4FL-C"


class TestCheckNamingConvention:
    def test_matching_name_returns_none(self):
        result = check_naming_convention("EM-0500-4FL-C", TOOL_PATTERN, TOOL_DESCRIPTION, TOOL_EXAMPLE)
        assert result is None

    def test_non_matching_name_returns_warning_string(self):
        result = check_naming_convention("my endmill", TOOL_PATTERN, TOOL_DESCRIPTION, TOOL_EXAMPLE)
        assert isinstance(result, str)
        assert "my endmill" in result

    def test_warning_includes_example(self):
        result = check_naming_convention("bad name", TOOL_PATTERN, TOOL_DESCRIPTION, TOOL_EXAMPLE)
        assert TOOL_EXAMPLE in result

    def test_warning_includes_description(self):
        result = check_naming_convention("bad name", TOOL_PATTERN, TOOL_DESCRIPTION, TOOL_EXAMPLE)
        assert "TYPE-DIAMETER" in result or "naming convention" in result.lower()

    def test_invalid_pattern_returns_none(self):
        # A bad pattern should not crash — just skip the check
        result = check_naming_convention("any name", "[unclosed", "bad pattern", "example")
        assert result is None
```

Run — fails with `ImportError`. Red step.

---

## Step 4 — GREEN: Build `check_naming_convention`

Add to `tooldb/validation.py`:

```python
import re


def check_naming_convention(
    name: str,
    pattern: str,
    description: str,
    example: str,
) -> str | None:
    try:
        compiled = re.compile(pattern)
    except re.error:
        return None  # bad pattern — skip the check silently

    if compiled.match(name):
        return None  # matches — no warning

    return (
        f"name '{name}' does not match the naming convention. "
        f"{description} (e.g. {example})"
    )
```

Run tests — all pass.

---

## Step 5 — Schema Migration: `conventions` Table

Create `migrations/0005_add_conventions_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS conventions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    field_name TEXT NOT NULL,
    pattern TEXT NOT NULL,
    description TEXT NOT NULL,
    example TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    UNIQUE (entity_type, field_name)
);
```

The `UNIQUE (entity_type, field_name)` constraint means: one active convention per entity+field combination. If you want to change the tool naming convention, you update the row rather than inserting a new one.

`is_active` allows disabling a convention without deleting it — useful during a transition period.

---

## Step 6 — RED: Tests for `ConventionRepository`

Create `tests/test_conventions.py`:

```python
import pytest
from tooldb.repositories.convention_repository import ConventionRepository
from datetime import datetime


def test_get_active_convention_returns_none_when_not_set(db_conn):
    repo = ConventionRepository(db_conn)
    result = repo.get_active_convention("tool", "name")
    assert result is None


def test_upsert_and_get_convention(db_conn):
    repo = ConventionRepository(db_conn)
    repo.upsert_convention(
        entity_type="tool",
        field_name="name",
        pattern=r"^[A-Z]{2,4}-\d{4}-\d{1,2}FL-[CHT]$",
        description="TYPE-DIAMETER-FLUTES-MATERIAL",
        example="EM-0500-4FL-C",
    )
    result = repo.get_active_convention("tool", "name")
    assert result is not None
    assert result["pattern"] == r"^[A-Z]{2,4}-\d{4}-\d{1,2}FL-[CHT]$"
    assert result["example"] == "EM-0500-4FL-C"


def test_upsert_updates_existing_convention(db_conn):
    repo = ConventionRepository(db_conn)
    repo.upsert_convention("tool", "name", r"^OLD$", "old desc", "OLD-0001")
    repo.upsert_convention("tool", "name", r"^NEW-\d{4}$", "new desc", "NEW-0001")
    result = repo.get_active_convention("tool", "name")
    assert result["pattern"] == r"^NEW-\d{4}$"


def test_get_inactive_convention_returns_none(db_conn):
    repo = ConventionRepository(db_conn)
    repo.upsert_convention("tool", "name", r"^[A-Z]+$", "letters only", "MILL")
    db_conn.execute("UPDATE conventions SET is_active = 0 WHERE entity_type = 'tool'")
    db_conn.commit()
    result = repo.get_active_convention("tool", "name")
    assert result is None
```

These tests use `db_conn` from `conftest.py`. But the `conventions` table doesn't exist in that fixture yet — the migration must run first.

Update `tests/conftest.py` to apply all migrations before each test:

```python
# tests/conftest.py — updated db_conn fixture
from tooldb.migrate import apply_migrations
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"

@pytest.fixture
def db_conn():
    """Fresh in-memory SQLite database with all migrations applied."""
    conn = sqlite3.connect(":memory:")
    conn.execute("PRAGMA foreign_keys = ON")
    apply_migrations(conn, MIGRATIONS_DIR)
    yield conn
    conn.close()
```

This replaces the individual `conn.execute(TABLE_SQL)` calls with a migration runner. When you add a new migration, all tests get the new table automatically.

Run the tests — they fail because `ConventionRepository` doesn't exist yet.

---

## Step 7 — GREEN: Build `ConventionRepository`

Create `tooldb/repositories/convention_repository.py`:

```python
import sqlite3
from datetime import datetime


class ConventionRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn

    def get_active_convention(self, entity_type: str, field_name: str) -> dict | None:
        row = self.conn.execute(
            """
            SELECT id, entity_type, field_name, pattern, description, example
            FROM conventions
            WHERE entity_type = ? AND field_name = ? AND is_active = 1
            """,
            (entity_type, field_name),
        ).fetchone()
        if row is None:
            return None
        return {
            "id": row[0],
            "entity_type": row[1],
            "field_name": row[2],
            "pattern": row[3],
            "description": row[4],
            "example": row[5],
        }

    def upsert_convention(
        self,
        entity_type: str,
        field_name: str,
        pattern: str,
        description: str,
        example: str,
    ) -> None:
        now = datetime.now().isoformat()
        self.conn.execute(
            """
            INSERT INTO conventions (entity_type, field_name, pattern, description, example, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, 1, ?)
            ON CONFLICT (entity_type, field_name)
            DO UPDATE SET pattern = excluded.pattern,
                          description = excluded.description,
                          example = excluded.example,
                          is_active = 1,
                          created_at = excluded.created_at
            """,
            (entity_type, field_name, pattern, description, example, now),
        )
        self.conn.commit()
```

`ON CONFLICT ... DO UPDATE` is SQLite's upsert syntax — insert if the row doesn't exist, update if it does.

Run the tests:

```
pytest tests/test_conventions.py -v
```

---

## Step 8 — Wire Convention Check into ToolService

Update `ToolService.create_tool` to check the naming convention if one is configured:

```python
from tooldb.repositories.convention_repository import ConventionRepository
from tooldb.validation import check_naming_convention

class ToolService:
    def __init__(self, repository: ToolRepository, convention_repo: ConventionRepository | None = None) -> None:
        self.repo = repository
        self.convention_repo = convention_repo

    def create_tool(self, name, diameter_inches, material, tool_type, ...) -> int:
        # ... existing validation ...

        warnings = []
        if self.convention_repo:
            convention = self.convention_repo.get_active_convention("tool", "name")
            if convention:
                warning = check_naming_convention(
                    name=validated.name,
                    pattern=convention["pattern"],
                    description=convention["description"],
                    example=convention["example"],
                )
                if warning:
                    warnings.append(warning)

        tool_id = self.repo.insert(...)
        return tool_id  # warnings are returned or logged separately
```

The warnings are not surfaced through the return value here — `create_tool` returns the ID. In the UI layer, the service call would need to return both the ID and any warnings. This is a design decision to revisit in Block 3. For now, the validation logic is in place.

---

## Step 9 — SAVE AND TRY

```
pytest -v
```

Confirm all tests pass. If any tests fail because `conftest.py` now uses migrations and some tests relied on the old direct `conn.execute(TABLE_SQL)` setup, update those tests.

---

## Challenge

Add a `list_conventions(self) -> list[dict]` method to `ConventionRepository` that returns all conventions (active and inactive). Write the test first.

<details>
<summary>Answer</summary>

**Test:**
```python
def test_list_conventions_returns_all(db_conn):
    repo = ConventionRepository(db_conn)
    repo.upsert_convention("tool", "name", r"^[A-Z]+$", "letters", "MILL")
    repo.upsert_convention("holder", "name", r"^H-\d+$", "holders", "H-001")
    db_conn.execute("UPDATE conventions SET is_active = 0 WHERE entity_type = 'holder'")
    db_conn.commit()
    result = repo.list_conventions()
    assert len(result) == 2
    active = [c for c in result if c["is_active"]]
    inactive = [c for c in result if not c["is_active"]]
    assert len(active) == 1
    assert len(inactive) == 1
```

**Implementation:**
```python
def list_conventions(self) -> list[dict]:
    rows = self.conn.execute(
        "SELECT id, entity_type, field_name, pattern, description, example, is_active FROM conventions"
    ).fetchall()
    return [
        {
            "id": r[0], "entity_type": r[1], "field_name": r[2],
            "pattern": r[3], "description": r[4], "example": r[5], "is_active": bool(r[6]),
        }
        for r in rows
    ]
```

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Explain why naming conventions produce warnings, not errors | |
| Write a regex pattern for a simple naming convention | |
| Use `re.compile` and handle `re.error` for invalid patterns | |
| Build a `check_naming_convention` function that returns `str | None` | |
| Create a `conventions` table via a migration file | |
| Use `ON CONFLICT DO UPDATE` for an upsert operation | |
| Update `conftest.py` to use the migration runner instead of raw DDL | |

---

## Quick Check Answers

1. **The convention pattern must move out of the code and into the database.** A `conventions` table with `(entity_type, field_name, pattern, description, example)` allows any authorized user to update the pattern without touching code. The application reads the active convention from the database at validation time.

2. **A warning.** Naming convention mismatches do not make the data incorrect — the tool parameters are still valid. Rejecting `"1/2 FLAT ENDMILL"` because it doesn't match a pattern would block legitimate data. The right response is: save the tool, flag the name for review, let the user decide if they want to rename it.

3. **`re.compile("[unclosed")` raises `re.error: unterminated character set`.** If this pattern was stored in the database by a careless user and your code doesn't handle it, the exception propagates and the validation crashes. The fix: wrap `re.compile()` in a `try/except re.error` block and treat an invalid pattern as "no convention active" — log the problem for the admin, don't fail the user's import.
