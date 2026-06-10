# Python Tool Database — LAB 20 — Layered Architecture: Separating UI, Logic, and Data

**Prerequisites:** Lab 19. You have `ToolRepository` in `tooldb/tool_repository.py`, `ProvenanceRepository`, all five tables, and a passing test suite. You understand the repository pattern.

**What this lab adds:**
- The three-layer architecture: Presentation, Service, Data
- The import rule: no layer skips over another
- Restructuring `tooldb/` into subfolders: `repositories/`, `services/`, `models/`, `schemas/`
- A new `ToolService` class that sits between the UI and the repository
- `ARCHITECTURE.md` — the one-page contract for the project's structure

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Why shouldn't a button click handler in a Qt widget directly call `conn.execute("SELECT ...")`?
> 2. You have a `ToolService.create_tool()` method. Today it is called from a PySide6 form. Next year it will be called from a FastAPI route. What must be true about `ToolService` for this to work without changes?
> 3. You have three layers: `ui/`, `services/`, `repositories/`. A service method needs to check if a tool name already exists before inserting. Which layer runs the SQL query?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A restructured project folder and a new `ToolService`:

```
tooldb/
    repositories/
        __init__.py
        tool_repository.py    ← moved from tooldb/tool_repository.py
    services/
        __init__.py
        tool_service.py       ← NEW: ToolService class
    models/
        __init__.py
        tool.py               ← (placeholder — domain objects will live here)
    schemas/
        __init__.py
    queries.py                ← keep here for now (raw SQL helpers)
    schema.py                 ← keep here (database schema)
    migrate.py                ← keep here (migration runner)

ARCHITECTURE.md               ← NEW: one-page contract at project root
tests/
    test_tool_service.py      ← NEW: 4 tests for ToolService
```

---

## Step 1 — Why Layers Exist

Look at the current `queries.py`. It has `insert_tool`, `find_carbide_tools`, `get_assembly_details`, and others. These functions take a `conn` directly and execute SQL.

Now imagine you have a button in a Qt window that creates a new tool. Without layers:

```python
# In a Qt widget file — wrong:
class AddToolForm(QWidget):
    def on_save_clicked(self):
        name = self.name_input.text()
        diameter = float(self.diameter_input.text())  # crashes if non-numeric
        self.conn.execute(
            "INSERT INTO tools (name, diameter_inches, ...) VALUES (?, ...)",
            (name, diameter, ...)
        )
        self.conn.commit()
```

This widget now:
- Contains SQL
- Does validation (kind of — badly)
- Manages the database connection
- Knows about the database schema

When you decide to replace PySide6 with a React/FastAPI interface, you must rewrite all of this SQL logic in the new interface. The business logic — "a tool name must be unique, diameter must be positive" — lives inside a button handler that you are about to throw away.

**The three-layer solution:**

```python
# In a Qt widget file — correct:
class AddToolForm(QWidget):
    def __init__(self, service: ToolService):
        self.service = service      # ← receives the service, never creates it

    def on_save_clicked(self):
        name = self.name_input.text()
        diameter = self.diameter_input.text()
        result = self.service.create_tool(name=name, diameter_inches=diameter)
        # result is either a success or an error — the widget just displays it
```

The widget knows nothing about SQL. If next year you replace PySide6 with React, the React component calls `service.create_tool()` via an HTTP endpoint — same service, zero rewrite.

---

### Concept: Layered Architecture — The Three-Layer Rule

**What it is:** An architecture where code is divided into three layers, each with a specific responsibility, and a strict rule about which direction dependencies can flow: down only, never up, never skipping.

**The three layers:**

```
┌─────────────────────────────────────────────────────────┐
│ Presentation Layer (ui/)                                │
│ Knows: what the user sees and does. Calls services.     │
│ Does not know: SQL, databases, business rules.          │
├─────────────────────────────────────────────────────────┤
│ Service Layer (services/)                               │
│ Knows: business rules, validation, domain logic.        │
│ Calls: repositories. Returns data shapes (schemas).     │
│ Does not know: widgets, HTTP, user interface.           │
├─────────────────────────────────────────────────────────┤
│ Data Layer (repositories/)                              │
│ Knows: SQL, the database schema, connection details.    │
│ Does not know: business rules, services, widgets.       │
└─────────────────────────────────────────────────────────┘
```

**The import rule:** Dependencies flow downward only.

```python
# CORRECT: service imports repository
from tooldb.repositories.tool_repository import ToolRepository

# CORRECT: ui imports service (not repository)
from tooldb.services.tool_service import ToolService

# WRONG: ui imports repository directly — skips service layer
from tooldb.repositories.tool_repository import ToolRepository  # in a widget file

# WRONG: repository imports service — upward dependency
from tooldb.services.tool_service import ToolService  # in a repository file
```

**What it hides:** The decision of which layer to change when requirements change. When the UI changes (new framework), only `ui/` changes. When business rules change (new validation), only `services/` changes. When the database engine changes (SQLite → PostgreSQL), only `repositories/` changes. Each layer hides its internals from the others.

**The invariant:** Code in `ui/` can call `services/` but never `repositories/`. Code in `services/` can call `repositories/` but never `ui/`. This invariant means the UI is interchangeable — the service layer cannot tell which UI called it.

**Canonical example (General Explanation):**

A restaurant. The waiter (Presentation) takes orders and brings food. The waiter does not cook. The chef (Service) decides how to prepare dishes, applies the menu rules, calls the kitchen staff. The chef does not serve tables. The kitchen staff (Data) manages the raw ingredients, the stove, the refrigerator. They do not make menu decisions.

If the restaurant hires a new waiter (new UI), the chef does not change. If they add new recipes (new service logic), the waiter does not change. If they upgrade the stove (new database), the chef's recipes still work.

**Pattern category:** Architectural (not GoF — this is Presentation-Domain-Data separation from Martin Fowler's "Patterns of Enterprise Application Architecture")

**Tradeoff:** More files, more indirection. Calling `service.create_tool()` instead of `conn.execute(...)` means tracing through two more files to understand what happens. For a one-person hobby script, this is over-engineering. For any project that will grow or change its UI, it pays for itself on the first refactor.

**You will see this again in:** Every production web application: Django (views → services → models), Flask (routes → services → repositories), React+FastAPI (components → API routes → services → repositories). The names differ; the pattern is universal. This is the most important architectural concept in software engineering.

**Career signal:** "Explain the layered architecture pattern" and "how would you structure a Flask app?" both expect this answer. Understanding the pattern — not just knowing the folder names — signals architectural thinking.

**Watch for:** The temptation to "just call the repository directly" when adding a small feature. Every violation is a small shortcut that costs you in the next refactor. Once a widget imports a repository, the layering is broken and the UI is no longer replaceable.

---

## Step 2 — Restructure the Folder

Create the subfolder structure. The existing files in `tooldb/` are not deleted — they are moved.

**Current structure:**

```
tooldb/
    schema.py
    queries.py
    tool_repository.py
    provenance_repository.py
    migrate.py
    sfm.py              (if exists from Block 1)
    classify.py         (if exists from Block 1)
    display.py          (if exists from Block 1)
    holder.py           (if exists from Block 1)
    tool_types.py       (if exists from Block 1)
```

**Target structure:**

```
tooldb/
    repositories/
        __init__.py
        tool_repository.py      ← move from tooldb/tool_repository.py
    services/
        __init__.py
        tool_service.py         ← NEW
    models/
        __init__.py             ← placeholder — domain classes move here later
    schemas/
        __init__.py             ← placeholder — Pydantic schemas will go here
    schema.py                   ← stays here
    queries.py                  ← stays here (raw SQL helpers)
    migrate.py                  ← stays here (migration runner)
    provenance_repository.py    ← stays here for now
```

**Create the directories and `__init__.py` files:**

```powershell
# Run from python-tooldb/ directory
New-Item -ItemType Directory -Path tooldb\repositories
New-Item -ItemType File -Path tooldb\repositories\__init__.py
New-Item -ItemType Directory -Path tooldb\services
New-Item -ItemType File -Path tooldb\services\__init__.py
New-Item -ItemType Directory -Path tooldb\models
New-Item -ItemType File -Path tooldb\models\__init__.py
New-Item -ItemType Directory -Path tooldb\schemas
New-Item -ItemType File -Path tooldb\schemas\__init__.py
```

**Move `tool_repository.py`:**

```powershell
Move-Item tooldb\tool_repository.py tooldb\repositories\tool_repository.py
```

**Update the import in any test file that imports `ToolRepository`:**

In `tests/test_tool_repository.py`, change:

```python
from tooldb.tool_repository import ToolRepository   # ← old import path
```

to:

```python
from tooldb.repositories.tool_repository import ToolRepository   # ← new import path
```

Run the existing tests:

```
pytest tests/test_tool_repository.py -v
```

**You should see:** All tests still passing. The move did not break anything — only the import path changed.

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests passing (some may show import warnings if `provenance_repository` or other files reference the old path — fix those first).

---

## Step 3 — Create `ARCHITECTURE.md`

Create `ARCHITECTURE.md` in the project root (`python-tooldb/ARCHITECTURE.md`):

```markdown
# Architecture Contract

## Layers and Responsibilities

**Data layer** (`tooldb/repositories/`): Talks to the database. Returns dicts or plain Python objects.
Knows: SQL, the database schema, the connection object.
Does NOT know: business rules, services, UI.

**Service layer** (`tooldb/services/`): Business logic and validation. Calls repositories.
Knows: business rules, validation rules, domain constraints.
Does NOT know: SQL, database connections, widgets, HTTP.

**Presentation layer** (`ui/`): Qt widgets, forms, windows.
Knows: what to display, which service to call.
Does NOT know: SQL, repositories, business rules.

## Import Rule

```
ui/ → services/ → repositories/ → database
```

- `ui/` may import from `services/` only.
- `services/` may import from `repositories/` only.
- `repositories/` imports only `sqlite3` and standard library.
- No layer imports from the layer above it.
- No layer skips over another.

## What Changes When

- New UI framework: only `ui/` changes.
- New business rule: only `services/` changes.
- New database engine: only `repositories/` changes.
```

---

## Step 4 — Red: Write the Service Tests

Before writing `ToolService`, write tests for what it should do.

Create `tests/test_tool_service.py`:

```python
import sqlite3
import pytest
from tooldb.schema import create_schema
from tooldb.repositories.tool_repository import ToolRepository
from tooldb.services.tool_service import ToolService   # ← doesn't exist yet


def make_service(tmp_path) -> ToolService:
    """Create a ToolService backed by a fresh test database."""
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)
    repo = ToolRepository(conn)
    return ToolService(repo)   # service receives the repository — it never creates connections


def test_create_tool_returns_id(tmp_path):
    service = make_service(tmp_path)

    tool_id = service.create_tool(
        name="EM-0500",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
    )

    assert tool_id == 1


def test_create_tool_duplicate_name_raises(tmp_path):
    service = make_service(tmp_path)
    service.create_tool("EM-0500", diameter_inches=0.5, material="carbide", tool_type="endmill")

    with pytest.raises(ValueError, match="already exists"):
        service.create_tool("EM-0500", diameter_inches=0.5, material="carbide", tool_type="endmill")


def test_create_tool_negative_diameter_raises(tmp_path):
    service = make_service(tmp_path)

    with pytest.raises(ValueError, match="diameter"):
        service.create_tool(
            name="INVALID",
            diameter_inches=-0.5,   # negative diameter is invalid
            material="carbide",
            tool_type="endmill",
        )


def test_get_tools_returns_all(tmp_path):
    service = make_service(tmp_path)
    service.create_tool("EM-0500", 0.5, "carbide", "endmill")
    service.create_tool("DR-0250", 0.25, "carbide", "drill")

    tools = service.get_tools()

    assert len(tools) == 2
    names = [t["name"] for t in tools]
    assert "EM-0500" in names
    assert "DR-0250" in names
```

Run:

```
pytest tests/test_tool_service.py -v
```

**You should see:** All 4 failing with `ModuleNotFoundError`. Red.

---

## Step 5 — Green: Create `tooldb/services/tool_service.py`

Create `tooldb/services/tool_service.py`:

```python
from tooldb.repositories.tool_repository import ToolRepository

# Business rules as named constants — not magic numbers buried in conditions
MIN_DIAMETER_INCHES = 0.001    # smaller than this is not a real cutting tool
MAX_DIAMETER_INCHES = 24.0     # larger than this is a special-order part, not a standard tool


class ToolService:
    """Business logic for tool management.

    Does NOT talk to the database directly. All database access goes through
    the repository. This class enforces business rules that the database
    cannot enforce: valid diameter ranges, naming conventions, duplicate detection.
    """

    def __init__(self, repository: ToolRepository) -> None:
        self.repo = repository   # dependency injection: the service never opens a connection

    def create_tool(
        self,
        name: str,
        diameter_inches: float,
        material: str,
        tool_type: str,
        flutes: int = None,
        notes: str = None,
    ) -> int:
        """Create a new tool after validating business rules.

        Returns the new tool's id.
        Raises ValueError if validation fails.
        """
        # Business rule: diameter must be positive and within reasonable range
        if diameter_inches <= 0:
            raise ValueError(
                f"diameter_inches must be positive, got {diameter_inches}"
            )
        if diameter_inches > MAX_DIAMETER_INCHES:
            raise ValueError(
                f"diameter_inches {diameter_inches} exceeds maximum {MAX_DIAMETER_INCHES}\""
            )

        # Business rule: tool names must be unique in this database
        existing = self.repo.search_by_name(name)   # we need to add this to ToolRepository
        if existing is not None:
            raise ValueError(f"A tool named '{name}' already exists (id={existing['id']})")

        # All rules pass — delegate the actual insert to the repository
        return self.repo.insert(
            name=name,
            diameter_inches=diameter_inches,
            material=material,
            tool_type=tool_type,
            flutes=flutes,
            notes=notes,
        )

    def get_tools(self) -> list[dict]:
        """Return all tools, ordered by name."""
        return self.repo.get_all()
```

The service references `repo.search_by_name(name)` — this method does not exist yet in `ToolRepository`. Add it.

---

## Step 6 — Add `search_by_name` to `ToolRepository`

Open `tooldb/repositories/tool_repository.py` and add:

```python
    def search_by_name(self, name: str) -> dict | None:
        """Return the tool with this exact name, or None if not found."""
        row = self.conn.execute(
            "SELECT id, name, diameter_inches, flutes, material, tool_type, notes "
            "FROM tools WHERE name = ?",
            (name,),
        ).fetchone()
        return dict(row) if row is not None else None
```

Run the service tests:

```
pytest tests/test_tool_service.py -v
```

**You should see:**

```
PASSED tests/test_tool_service.py::test_create_tool_returns_id
PASSED tests/test_tool_service.py::test_create_tool_duplicate_name_raises
PASSED tests/test_tool_service.py::test_create_tool_negative_diameter_raises
PASSED tests/test_tool_service.py::test_get_tools_returns_all
```

All green.

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests passing.

**Change something:** In `create_tool`, remove the diameter check. Run `test_create_tool_negative_diameter_raises`. The test fails — the negative diameter is now allowed because there is no check. The service has no protection. Restore the check.

---

### Refactor: The Dependency Injection Pattern

Notice the service constructor:

```python
def __init__(self, repository: ToolRepository) -> None:
    self.repo = repository
```

And the test setup:

```python
repo = ToolRepository(conn)
service = ToolService(repo)   # service RECEIVES the repo — does not create it
```

This is **dependency injection** — the service does not create its own dependencies; they are passed in from outside.

**Why this matters for testing:** In the test, `ToolRepository` uses a real SQLite database (in `tmp_path`). In production, `ToolRepository` uses the production `tools.db`. In future tests, a fake repository (a `FakeToolRepository` that stores data in memory) could be passed in — no real database needed at all. The service does not care which one it gets, as long as it has `insert`, `get_all`, and `search_by_name` methods.

**You will see this again in:** Block 3 — the Qt forms will receive the service via the constructor, not create it themselves. Block 2b — `ToolService` will be tested with both real and fake repositories. This is the "D" in SOLID: Dependency Inversion Principle.

---

## 🎯 Challenge: `ToolService.get_tool` and `ToolService.find_by_material`

**You know:** The service layer delegates to the repository, applies business rules, and raises ValueError for invalid inputs.

**Task:** Add two methods to `ToolService`:
1. `get_tool(self, tool_id)` — returns one tool by id, or raises `ValueError("Tool not found")` if the id does not exist
2. `find_by_material(self, material)` — validates that `material` is one of the known values (`"carbide"`, `"HSS"`, `"cobalt"`), raises `ValueError` if not, and returns the matching tools

Write tests for both methods.

**Starting code:**

```python
VALID_MATERIALS = {"carbide", "HSS", "cobalt"}   # add as a module-level constant

def get_tool(self, tool_id: int) -> dict:
    result = self.repo.get_by_id(tool_id)
    if ???:
        raise ValueError(???)
    return result

def find_by_material(self, material: str) -> list[dict]:
    if ???:
        raise ValueError(???)
    return self.repo.search_by_material(material)
```

**Hints:**

1. `get_by_id` returns `None` if no tool is found — check for that
2. The valid materials check is a business rule: the service enforces it; the repository does not

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
VALID_MATERIALS = {"carbide", "HSS", "cobalt"}

def get_tool(self, tool_id: int) -> dict:
    result = self.repo.get_by_id(tool_id)
    if result is None:
        raise ValueError(f"No tool found with id {tool_id}")
    return result

def find_by_material(self, material: str) -> list[dict]:
    if material not in VALID_MATERIALS:
        raise ValueError(
            f"Unknown material '{material}'. Valid materials: {sorted(VALID_MATERIALS)}"
        )
    return self.repo.search_by_material(material)
```

Tests:

```python
def test_get_tool_raises_for_missing_id(tmp_path):
    service = make_service(tmp_path)
    with pytest.raises(ValueError, match="not found"):
        service.get_tool(9999)

def test_get_tool_returns_correct_tool(tmp_path):
    service = make_service(tmp_path)
    tool_id = service.create_tool("EM-0500", 0.5, "carbide", "endmill")
    tool = service.get_tool(tool_id)
    assert tool["name"] == "EM-0500"

def test_find_by_material_rejects_unknown(tmp_path):
    service = make_service(tmp_path)
    with pytest.raises(ValueError, match="Unknown material"):
        service.find_by_material("titanium")

def test_find_by_material_returns_matches(tmp_path):
    service = make_service(tmp_path)
    service.create_tool("EM-0500", 0.5, "carbide", "endmill")
    service.create_tool("EM-HSS", 0.5, "HSS", "endmill")
    results = service.find_by_material("carbide")
    assert len(results) == 1
    assert results[0]["name"] == "EM-0500"
```

**Key insight:** The service is the only place that knows `VALID_MATERIALS`. The repository accepts any string — it just stores what it receives. The service enforces the business rule before delegating. If the valid materials list changes (e.g., "cobalt" is removed), you change it in exactly one place: `VALID_MATERIALS` in `tool_service.py`. The repository, the database schema, and the UI are all unaffected.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `tooldb/repositories/tool_repository.py` exists | `ls tooldb/repositories/` — file present |
| `tooldb/services/tool_service.py` exists | `ls tooldb/services/` — file present |
| Old `test_tool_repository.py` imports updated | Run `pytest tests/test_tool_repository.py -v` — all pass |
| `ToolService.create_tool` enforces positive diameter | Run `test_create_tool_negative_diameter_raises` |
| `ToolService.create_tool` enforces unique name | Run `test_create_tool_duplicate_name_raises` |
| Service does not import sqlite3 | Check `tool_service.py` — no sqlite3 import, no `conn.execute` |
| Repository does not import service | Check `tool_repository.py` — no import from services |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. Why shouldn't a button click handler directly call `conn.execute(...)`?**

Because SQL in a widget file ties the business logic to a specific UI. When the UI changes (new framework, new design, web interface), you must rewrite the SQL in the new UI code. If the business rule "tool names must be unique" is in the widget, it gets lost or duplicated in the new UI. With layers, the widget calls `service.create_tool()` and the service owns the rule — the widget just calls and displays the result. The rule survives UI rewrites.

**2. What must be true about `ToolService` for it to work with both PySide6 and FastAPI?**

The service must know nothing about its caller. It must not import Qt widgets, check request headers, or assume how its methods will be invoked. It receives a repository, applies business rules, and returns plain Python objects (dicts or dataclasses). This makes it caller-agnostic: a Qt button handler and a Flask route handler both call the same `service.create_tool(name, diameter)` with the same arguments and get the same result. The service cannot tell the difference — and must not.

**3. Which layer runs the SQL query for duplicate name checking?**

The repository layer. The service decides that duplicate names are not allowed (a business rule). But the act of "check if this name exists in the database" is a database query — that belongs in the repository. The service calls `repo.search_by_name(name)` and checks the result. The repository knows how to query; the service knows what the result means. Each layer owns its responsibility.
