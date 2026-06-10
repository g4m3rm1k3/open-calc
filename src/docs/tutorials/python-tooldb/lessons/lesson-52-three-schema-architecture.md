# Python Tool Database — LAB 52 — Wiring the Three Schemas to the Service Layer

**Prerequisites:** Labs 50 and 51. You have `ToolCreate`, `ToolRead`, and `ToolUpdate`. This lesson wires them into the service layer so that every operation — create, read, update, delete — uses the right schema at the right boundary. After this lesson, the Qt UI and any future API layer will communicate through Pydantic schemas, never through raw dicts or SQLAlchemy ORM objects.

**What this lab adds:**
- A `ToolService` that accepts `ToolCreate` and returns `ToolRead`
- How the service translates between schemas and ORM objects
- The complete data flow: Form → ToolCreate → ORM → ToolRead → Table
- Updating the Qt `ToolTableModel` to hold `ToolRead` objects
- Why the UI layer does not import SQLAlchemy

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The service layer's `create_tool(data: ToolCreate) -> ToolRead` method validates, stores, and returns a `ToolRead`. The caller — a Qt dialog — only imports `ToolCreate` and `ToolRead`. Name the three things the dialog does NOT need to know about.
> 2. You have a `ToolRead` object. You call `tool.model_dump()`. You pass the result to `ToolORM(**result)`. Will that work?
> 3. `ToolCreate` has validators. `ToolRead` has no validators. Why not?
>
> *(Answers at the end)*

---

## The Architecture in One Diagram

```
Qt Dialog (Add Tool)
    │ ToolCreate (input, validated)
    ▼
ToolService.create_tool(data: ToolCreate) → ToolRead
    │ translates: ToolCreate.model_dump() → ToolORM(**fields)
    ▼
Repository / Session
    │ SQL: INSERT INTO tools_orm ...
    ▼
Database

Database
    │ SQL: SELECT * FROM tools_orm WHERE id = ?
    ▼
Repository → ToolORM object
    │ translates: ToolRead.model_validate(tool_orm)
    ▼
ToolService.create_tool returns → ToolRead
    │
    ▼
Qt ToolTableModel holds → list[ToolRead]
    │
    ▼
Qt renders tool.name, tool.diameter_inches, ...
```

The Qt dialog and the table model work entirely in `ToolRead` and `ToolCreate`. SQLAlchemy never appears above the service layer.

---

## Step 1 — `ToolService` with Schemas

Create `tooldb/services/tool_service_orm.py` (alongside the existing raw-SQL service):

```python
from sqlalchemy.orm import Session
from sqlalchemy import select
from tooldb.orm.models import ToolORM
from tooldb.schemas.tool_schemas import ToolCreate, ToolRead, ToolUpdate


class ToolService:
    def __init__(self, session: Session):
        self._session = session
```

The session is injected — `ToolService` does not create its own session. This makes it testable: you can inject an in-memory SQLite session in tests without touching the real database file.

**`create_tool`** — the write boundary. `ToolCreate` arrives already validated, so the service trusts it and converts directly to an ORM object:

```python
    def create_tool(self, data: ToolCreate) -> ToolRead:
        fields = data.model_dump()
        tool_orm = ToolORM(**fields)
        self._session.add(tool_orm)
        self._session.commit()
        return ToolRead.model_validate(tool_orm)
```

`data.model_dump()` → `ToolORM(**fields)` works because `ToolCreate` field names match `ToolORM` column names exactly. `ToolRead.model_validate(tool_orm)` converts back to a Pydantic model for the return — the caller never touches the ORM object.

**`get_tool` and `get_all_tools`** — read paths. Both end with the same conversion:

```python
    def get_tool(self, tool_id: int) -> ToolRead | None:
        tool_orm = self._session.get(ToolORM, tool_id)
        if tool_orm is None:
            return None
        return ToolRead.model_validate(tool_orm)

    def get_all_tools(self) -> list[ToolRead]:
        tools = self._session.scalars(select(ToolORM)).all()
        return [ToolRead.model_validate(t) for t in tools]
```

`session.get(ToolORM, id)` checks SQLAlchemy's identity map cache before hitting the database — fast for single-row lookups. `session.scalars(select(ToolORM)).all()` is the explicit query style from Lab 48 for multi-row reads.

**`update_tool`** — the partial update. `ToolUpdate` has all-optional fields; `model_dump(exclude_none=True)` sends only the fields that were actually set:

```python
    def update_tool(self, tool_id: int, update: ToolUpdate) -> ToolRead | None:
        tool_orm = self._session.get(ToolORM, tool_id)
        if tool_orm is None:
            return None

        changes = update.model_dump(exclude_none=True)
        for field, value in changes.items():
            setattr(tool_orm, field, value)

        self._session.commit()
        return ToolRead.model_validate(tool_orm)
```

`setattr(tool_orm, field, value)` is Python's way of setting an attribute by name at runtime — equivalent to `tool_orm.name = value` but works when `field` is a string variable. SQLAlchemy tracks the attribute change and generates an `UPDATE` for only the modified columns on commit.

**`delete_tool`** — returns a bool so the caller can distinguish "deleted" from "didn't exist":

```python
    def delete_tool(self, tool_id: int) -> bool:
        tool_orm = self._session.get(ToolORM, tool_id)
        if tool_orm is None:
            return False
        self._session.delete(tool_orm)
        self._session.commit()
        return True
```

Each method follows the same pattern: take a schema as input (or a plain `int`), do the database work with ORM objects, convert the ORM result to `ToolRead` before returning. The caller — the Qt UI, a test, a future API — works entirely in Pydantic schemas and never sees SQLAlchemy.

---

## Step 2 — Why `ToolCreate.model_dump()` Works for ORM Construction

```python
fields = data.model_dump()
tool_orm = ToolORM(**fields)
```

`model_dump()` returns a plain dict with field names as keys. `ToolORM.__init__` accepts keyword arguments named exactly after its mapped columns. Because the field names in `ToolCreate` match the column names in `ToolORM`, this works without any explicit mapping.

If the names diverged — say, `ToolCreate` used `diam` and `ToolORM` used `diameter_inches` — you would need a translation step. Keeping the names consistent across schemas and ORM is a design discipline worth maintaining. It makes `model_dump() → ORM(**fields)` always work.

---

## Step 3 — Update the Qt Table Model

In Lesson 36, `ToolTableModel` held `list[dict]`. Update it to hold `list[ToolRead]`.

In `tooldb_ui/tool_table_model.py`:

```python
from tooldb.schemas.tool_schemas import ToolRead

class ToolTableModel(QAbstractTableModel):
    def __init__(self, tools: list[ToolRead] | None = None):
        super().__init__()
        self._tools: list[ToolRead] = tools or []

    def reset_data(self, tools: list[ToolRead]) -> None:
        self.beginResetModel()
        self._tools = tools
        self.endResetModel()

    def data(self, index: QModelIndex, role=Qt.DisplayRole):
        if not index.isValid() or role != Qt.DisplayRole:
            return None

        tool = self._tools[index.row()]
        col_name = COLUMNS[index.column()][1]

        value = getattr(tool, col_name, None)
        if value is None:
            return "—"
        return str(value)
```

`getattr(tool, col_name, None)` works because `ToolRead` is a Pydantic model with attribute access. Before, `tool[col_name]` worked because tools were dicts. The change is small — swap `tool[col_name]` for `getattr(tool, col_name, None)`.

---

## Step 4 — Update the Main Window

In `tooldb_ui/main.py`, the window loads tools on startup and after adding a tool:

```python
from tooldb.services.tool_service_orm import ToolService
from tooldb.orm.session import SessionLocal


def make_service() -> tuple[ToolService, "Session"]:
    session = SessionLocal()
    return ToolService(session), session


class ToolDatabaseWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self._service, self._session = make_service()
        # ... rest of init

    def _load_tools(self):
        tools = self._service.get_all_tools()   # returns list[ToolRead]
        self._table_model.reset_data(tools)

    def _on_add_tool(self):
        dialog = AddToolDialog(self)
        if dialog.exec() == QDialog.Accepted:
            tool_obj = dialog.get_tool()          # returns Tool dataclass (Lesson 39)

            # Convert Tool dataclass → ToolCreate Pydantic schema
            tool_create = ToolCreate(
                name=tool_obj.name,
                diameter_inches=tool_obj.diameter_inches,
                material=tool_obj.material,
                tool_type=tool_obj.type_name(),
                **tool_obj.type_specific_fields()
            )

            try:
                self._service.create_tool(tool_create)
                self._load_tools()   # refresh table
            except Exception as e:
                QMessageBox.warning(self, "Error", str(e))
```

---

## Step 5 — Testing the Service

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tooldb.orm.models import Base
from tooldb.services.tool_service_orm import ToolService
from tooldb.schemas.tool_schemas import ToolCreate, ToolUpdate, ToolRead
from pydantic import ValidationError


@pytest.fixture
def service():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield ToolService(session)
    session.close()


def test_create_returns_toolread(service):
    data = ToolCreate(
        name="EM-0500", diameter_inches=0.5, material="carbide",
        tool_type="endmill", flutes=4
    )
    result = service.create_tool(data)

    assert isinstance(result, ToolRead)
    assert result.id is not None
    assert result.name == "EM-0500"
    assert result.tool_type == "endmill"


def test_create_assigns_id(service):
    a = service.create_tool(ToolCreate(
        name="EM-A", diameter_inches=0.5, material="carbide", tool_type="endmill", flutes=4
    ))
    b = service.create_tool(ToolCreate(
        name="EM-B", diameter_inches=0.5, material="carbide", tool_type="endmill", flutes=4
    ))
    assert a.id != b.id


def test_update_partial(service):
    original = service.create_tool(ToolCreate(
        name="EM-0500", diameter_inches=0.5, material="carbide",
        tool_type="endmill", flutes=4
    ))

    updated = service.update_tool(original.id, ToolUpdate(flutes=3))

    assert updated.flutes == 3
    assert updated.diameter_inches == 0.5  # unchanged


def test_update_nonexistent_returns_none(service):
    result = service.update_tool(9999, ToolUpdate(flutes=4))
    assert result is None


def test_delete(service):
    created = service.create_tool(ToolCreate(
        name="EM-DEL", diameter_inches=0.5, material="carbide",
        tool_type="endmill", flutes=4
    ))
    assert service.delete_tool(created.id) is True
    assert service.get_tool(created.id) is None
```

These tests inject an in-memory SQLite session. They run without touching any file on disk. They test the service's behavior — not the ORM, not the schema — by checking what comes out of the public interface.

---

## Step 6 — SAVE AND TRY

**Trace a create call from top to bottom.** Put a `print()` inside each step:

1. In the Qt dialog's accept handler — print `tool_create`
2. In `ToolService.create_tool` — print `fields` before constructing the ORM object
3. In `ToolService.create_tool` — print `tool_orm.id` after commit (should be an integer)
4. After `_load_tools()` — print `type(self._table_model._tools[0])`

The last print should show `<class 'tooldb.schemas.tool_schemas.ToolRead'>` — a Pydantic model, not an ORM object. That is the architecture working.

---

## Concept: Validation at the Boundary

`ToolCreate` validates data when it enters the system. After `ToolCreate` is constructed, the data is trusted. The service does not re-validate fields before writing to the ORM.

This is the boundary principle: validate once, at the entry point. Everything inside the system trusts that the data passed the boundary check.

If you added validation inside the service too — checking material again, checking diameter again — you would duplicate the boundary logic in two places. When the rules change, you change them twice, and they can drift out of sync. One validation layer, at the boundary, is the right design.

---

## Final Check

| | |
|--|--|
| `ToolService` accepts schemas as input and returns schemas as output | ✓ |
| `ToolCreate.model_dump()` → `ToolORM(**fields)` works when names match | ✓ |
| `ToolRead.model_validate(tool_orm)` works because of `from_attributes=True` | ✓ |
| `update_tool` uses `model_dump(exclude_none=True)` to write only sent fields | ✓ |
| The Qt UI imports `ToolCreate`/`ToolRead`, never `ToolORM` or `Session` | ✓ |
| Tests inject a session — no file on disk, deterministic, fast | ✓ |

---

## Quick Check Answers

1. **The dialog does not need to know about: (1) SQLAlchemy sessions, (2) the `ToolORM` model, (3) the database file path.** Those are the service's and repository's responsibility. The dialog's job is to collect data (into a `ToolCreate`) and display results (from a `ToolRead`). Keeping those concerns out of the dialog makes it testable, portable, and reusable for a future web form or CLI.

2. **Yes, with a caveat.** `ToolRead` includes `id` in its `model_dump()`. `ToolORM` has an `id` column with `primary_key=True, autoincrement=True`. If you pass `id=1` to `ToolORM(...)`, SQLAlchemy will attempt to use that ID rather than autogenerating one. For constructing new records from a `ToolRead`, you would need to exclude the `id`: `ToolORM(**read.model_dump(exclude={"id"}))`. This is one reason `ToolCreate` (which has no `id`) is the right schema for inserts, not `ToolRead`.

3. **`ToolRead` has no validators because it represents data leaving the system, not entering it.** The data in a `ToolRead` came from the database, which enforces constraints at the schema level. You trust it. Adding Pydantic validators to `ToolRead` would mean running validation on every row you read back — extra work for no safety benefit. Validation belongs at the entry point, not the exit point.
