# Python Tool Database — LAB 24 — Testing the Service Layer

**Prerequisites:** Lab 23. You practiced the full TDD cycle on `calculate_sfm`. You have `ToolService` in `tooldb/services/tool_service.py` with `create_tool`, `get_tools`, `get_tool`, and `find_by_material`. Now you write proper tests for those methods using TDD.

**What this lab adds:**
- Testing a class (service) rather than a standalone function
- Test isolation: each test starts with a fresh, blank database
- The three test categories for a service method: normal case, validation error, not-found error
- Using `pytest.raises` to check both the exception type and the message
- Why "hard to test" means "bad design" — and what that signals

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `ToolService` takes a `ToolRepository` in its constructor. Why is this better for testing than having `ToolService` create its own database connection internally?
> 2. You run two tests that both call `ToolService.create_tool(name="Mill-01", ...)`. The second test fails because the name already exists from the first test. What is wrong with this test setup?
> 3. `ToolService.get_tool(99)` raises `ValueError` when tool 99 doesn't exist. What does `pytest.raises(ValueError, match="99")` check that `pytest.raises(ValueError)` does not?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A complete test suite for `ToolService` with one test per meaningful behavior:

```
tests/
    test_tool_service.py    ← EXTEND: add tests for get_tool, get_tools, find_by_material
```

The test file from Lesson 20 had a few tests. This lesson completes the suite using TDD — starting with failing tests, implementing the minimum code, then refactoring.

---

## Step 1 — The Setup Problem

Every test for `ToolService` needs:
1. An in-memory SQLite connection (so tests don't write to disk)
2. A `ToolRepository` connected to that database
3. A `ToolService` connected to that repository
4. The schema applied (the tables need to exist)

Without structure, every test function would repeat this setup. That is four lines of boilerplate before any test logic. In a file with 12 tests, that is 48 lines of duplication.

The solution is a helper function you write at the top of the test file. We will use a plain function for now — Lesson 25 replaces this with a proper pytest fixture.

Add this to `tests/test_tool_service.py`:

```python
import sqlite3
import pytest

from tooldb.repositories.tool_repository import ToolRepository
from tooldb.services.tool_service import ToolService
from tooldb.schema import (
    TOOLS_TABLE_SQL,
    HOLDERS_TABLE_SQL,
    ASSEMBLIES_TABLE_SQL,
    JOBS_TABLE_SQL,
    JOB_ASSEMBLIES_TABLE_SQL,
)


def _make_service():
    """Return a fresh ToolService with an in-memory database."""
    conn = sqlite3.connect(":memory:")
    conn.execute(TOOLS_TABLE_SQL)
    conn.execute(HOLDERS_TABLE_SQL)
    conn.execute(ASSEMBLIES_TABLE_SQL)
    conn.execute(JOBS_TABLE_SQL)
    conn.execute(JOB_ASSEMBLIES_TABLE_SQL)
    conn.commit()
    repo = ToolRepository(conn)
    return ToolService(repo)
```

Every test calls `_make_service()` to get a blank service. No shared state. No leftovers.

---

## Step 2 — RED: Tests for `create_tool`

These tests came from Lesson 20. Verify they are in your file and passing before adding new ones.

```python
def test_create_tool_returns_integer_id():
    service = _make_service()
    tool_id = service.create_tool(
        name="1/2 Carbide EM",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
    )
    assert isinstance(tool_id, int)
    assert tool_id >= 1


def test_create_tool_rejects_negative_diameter():
    service = _make_service()
    with pytest.raises(ValueError, match="diameter"):
        service.create_tool(
            name="Bad Tool",
            diameter_inches=-0.5,
            material="carbide",
            tool_type="endmill",
        )


def test_create_tool_rejects_duplicate_name():
    service = _make_service()
    service.create_tool(
        name="Mill-01",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
    )
    with pytest.raises(ValueError, match="Mill-01"):
        service.create_tool(
            name="Mill-01",
            diameter_inches=0.75,
            material="carbide",
            tool_type="endmill",
        )
```

Run these to confirm they pass before continuing.

---

## Step 3 — RED: Tests for `get_tools`

```python
def test_get_tools_returns_empty_list_when_no_tools():
    service = _make_service()
    result = service.get_tools()
    assert result == []


def test_get_tools_returns_all_created_tools():
    service = _make_service()
    service.create_tool("Mill-01", 0.5, "carbide", "endmill")
    service.create_tool("Mill-02", 0.75, "carbide", "endmill")
    service.create_tool("Drill-01", 0.25, "HSS", "drill")

    result = service.get_tools()

    assert len(result) == 3


def test_get_tools_returns_dicts_with_expected_keys():
    service = _make_service()
    service.create_tool("Mill-01", 0.5, "carbide", "endmill")

    result = service.get_tools()
    tool = result[0]

    assert "id" in tool
    assert "name" in tool
    assert "diameter_inches" in tool
    assert "material" in tool
    assert "tool_type" in tool
```

Run pytest — these should pass if `get_tools` is already implemented. If not, implement it now (minimum: call `self.repo.get_all()` and return the result).

---

## Step 4 — RED: Tests for `get_tool` (single tool by ID)

```python
def test_get_tool_returns_tool_by_id():
    service = _make_service()
    created_id = service.create_tool("Mill-01", 0.5, "carbide", "endmill")

    result = service.get_tool(created_id)

    assert result["id"] == created_id
    assert result["name"] == "Mill-01"


def test_get_tool_raises_for_nonexistent_id():
    service = _make_service()
    with pytest.raises(ValueError, match="99"):
        service.get_tool(99)
```

Run pytest — the second test will fail if `get_tool` currently returns `None` instead of raising. Fix it:

In `tooldb/services/tool_service.py`, `get_tool` should already raise. If not:

```python
def get_tool(self, tool_id: int) -> dict:
    result = self.repo.get_by_id(tool_id)
    if result is None:
        raise ValueError(f"Tool with id {tool_id} not found")
    return result
```

Run pytest — both tests pass.

---

## Step 5 — RED: Tests for `find_by_material`

```python
def test_find_by_material_returns_matching_tools():
    service = _make_service()
    service.create_tool("Carbide-01", 0.5, "carbide", "endmill")
    service.create_tool("Carbide-02", 0.75, "carbide", "endmill")
    service.create_tool("HSS-01", 0.25, "HSS", "drill")

    result = service.find_by_material("carbide")

    assert len(result) == 2
    assert all(t["material"] == "carbide" for t in result)


def test_find_by_material_returns_empty_for_unknown_material():
    service = _make_service()
    service.create_tool("Mill-01", 0.5, "carbide", "endmill")

    result = service.find_by_material("titanium")

    assert result == []


def test_find_by_material_rejects_invalid_material():
    service = _make_service()
    with pytest.raises(ValueError, match="material"):
        service.find_by_material("unobtanium")
```

The last test requires `find_by_material` to validate that the material string is in the allowed set. Open `tooldb/services/tool_service.py` and check: does it validate the material parameter? If not, add it:

```python
VALID_MATERIALS = {"carbide", "HSS", "cobalt"}

def find_by_material(self, material: str) -> list[dict]:
    if material not in VALID_MATERIALS:
        raise ValueError(f"Invalid material '{material}'. Valid: {VALID_MATERIALS}")
    return self.repo.search_by_material(material)
```

But wait — `test_find_by_material_returns_empty_for_unknown_material` passes `"titanium"` and expects `[]`, not a `ValueError`. That contradicts the last test.

This is a design decision. Which behavior do you want?

**Option A:** Unknown-but-plausible materials return empty list. Invalid (gibberish) materials raise.
**Option B:** Only pre-approved materials are valid. Everything else raises.

Option B is simpler and safer for a tool database — tools can only be made from known materials. Pick Option B and update the "returns empty" test:

```python
def test_find_by_material_returns_empty_for_valid_material_with_no_tools():
    service = _make_service()
    # HSS is valid but no HSS tools were inserted
    result = service.find_by_material("HSS")
    assert result == []
```

Run pytest — all tests pass.

---

## Concept Block — Design Signal from Tests

The `find_by_material` contradiction was a design signal. When writing tests revealed conflicting behavior expectations, you had to make a decision. That decision is now documented — not in a comment, but in the tests themselves:

- `test_find_by_material_rejects_invalid_material` — documents that "unobtanium" raises
- `test_find_by_material_returns_empty_for_valid_material_with_no_tools` — documents that "HSS" with no tools returns `[]`

These two tests together communicate the full behavior of the method. No prose documentation needed.

This is what "tests as specification" means. The tests are the spec.

---

## Step 6 — SAVE AND TRY: Full Suite

```
cd python-tooldb
pytest -v
```

Count the tests. Every test in `test_tool_service.py` should be green.

Now run with `--tb=short` to see a more compact failure format if any tests fail:

```
pytest -v --tb=short
```

And run only the service tests to confirm they are independent:

```
pytest tests/test_tool_service.py -v
```

---

## Step 7 — REFACTOR: The `_make_service` Helper

The `_make_service` function duplicates the schema setup from other test files. Every test file that needs a blank database has its own version of this. This is a known issue — Lesson 25 (Test Fixtures) solves it with `@pytest.fixture` and a shared `conftest.py`.

For now, leave `_make_service` as-is. The duplication is deliberate — it makes the upcoming lesson's motivation obvious: "we have this same four-line setup in five test files, let's fix that."

---

## Challenge

Add a test that covers two `create_tool` calls in sequence and verifies the IDs are different:

```python
def test_create_tool_assigns_unique_ids():
    service = _make_service()
    id_1 = service.create_tool("Mill-01", 0.5, "carbide", "endmill")
    id_2 = service.create_tool("Mill-02", 0.75, "carbide", "endmill")
    assert id_1 != id_2
```

Then add a test that verifies the material validation constant is correct — specifically that "cobalt" is valid:

```python
def test_find_by_material_accepts_cobalt():
    service = _make_service()
    result = service.find_by_material("cobalt")
    assert result == []  # valid material, no tools yet
```

<details>
<summary>Answer</summary>

Both tests work as written. The unique IDs test passes because SQLite's AUTOINCREMENT (or just INTEGER PRIMARY KEY) guarantees ascending unique IDs. The cobalt test passes because `VALID_MATERIALS = {"carbide", "HSS", "cobalt"}` already includes it.

If "cobalt" were missing from `VALID_MATERIALS`, the test would fail with `ValueError` — and you would know to add it. This is a small example of the test suite acting as a living specification of what materials are supported.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Create a helper function that returns a fresh service with a blank in-memory database | |
| Write a test for the normal case, the validation error case, and the not-found case | |
| Use `pytest.raises(ValueError, match="...")` to check both type and message | |
| Recognize when test behavior contradicts itself and make a design decision | |
| Explain why tests that share state (database) are a problem | |
| Run the service tests in isolation and confirm they pass independently | |

---

## Quick Check Answers

1. **When `ToolService` receives a repository in its constructor, any test can pass in a repository backed by `:memory:` — no files, no disk, no cleanup needed.** If `ToolService` created its own connection internally, every test would need the same real database or you would have to patch internals. Dependency injection makes the seam visible and testable.

2. **The tests share state — the second test inherits the database row created by the first.** The fix: each test creates its own `ToolService` backed by a fresh `:memory:` connection. Database state is created and destroyed per test, never shared.

3. **`pytest.raises(ValueError, match="99")` also checks that the error message contains "99"** — verifying that the right kind of not-found error was raised, not just any `ValueError`. Without `match`, `raise ValueError("diameter too small")` would also pass the test even though it's the wrong error.
