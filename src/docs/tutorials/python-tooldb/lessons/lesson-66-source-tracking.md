# Python Tool Database — LAB 66 — Source Tracking and Audit Log

**Prerequisites:** Lab 61 (merge strategy, `source_file` column). Lab 49 (Alembic). You added `source_file` to tools. This lesson adds a full audit log — a record of every insert, update, and delete, with who did it and when.

**What this lab adds:**
- The audit log concept: an append-only record of changes
- `ToolAuditORM` — a separate table that records every mutation
- SQLAlchemy `@event.listens_for` on the session — hooking into ORM operations
- Querying the audit log to answer "what changed and when"

**Time:** 50–60 minutes

---

## What You Will Build

A `ToolAuditORM` table that records every tool change. Querying it shows a history:

```
Audit log for "EM-0500":
  2026-05-21 14:30:22  INSERT  source=shop_floor.tooldb
  2026-05-21 15:01:05  UPDATE  field=flute_count  old=4  new=6
  2026-05-21 16:45:10  DELETE  (removed by user)
```

---

> **Quick Check — try to answer before reading:**
>
> 1. You `UPDATE` a tool's name. Three months later someone asks "what was the original name?" Without an audit log, can you answer? With one, can you?
> 2. An audit log is append-only — you never `UPDATE` or `DELETE` rows in it. Why is this the right design?
> 3. SQLAlchemy's `after_flush` event fires after the ORM writes to the database but before the transaction commits. Why is "before commit" the right moment to write an audit record — rather than after the commit?
>
> *(Answers at the end of this lab)*

---

## Concept: The Audit Log

**What it is:** An append-only table that records every change to data — what changed, when, by whom, and from what value to what value.

**The problem before:** Your `tools_orm` table stores the current state. You can see what a tool looks like now, but not what it looked like yesterday, or who changed it, or what the old value was. If someone imports bad data and overwrites 50 tools, there is no way to know what they were before.

**The solution:** A second table, `tool_audit`, where every mutation appends a new row. No rows are ever deleted from this table. The current state of a tool is still in `tools_orm`. The history of that tool is in `tool_audit`.

**What it hides:** Nothing — the audit table is simple. The complexity it introduces is worth naming: you need to write to two tables for every mutation. The SQLAlchemy event system (Step 2) handles this automatically so your service code doesn't have to.

**The protected invariant:** The audit log is append-only. Any row in `tool_audit` is a permanent, immutable record of a historical fact. The row `"EM-0500 was renamed to EM-0500-V2 on 2026-05-21"` is true forever, even after the tool is renamed again.

**You will see this again in:** Financial systems (every transaction is immutable). Medical records (every observation is permanent — corrections add new rows, not updates). Git (every commit is immutable — history cannot be rewritten without force-push). Event sourcing — an architecture where the database IS the audit log. This is a fundamental pattern in any system where "what was true in the past" matters.

**Career signal:** Any system handling financial data, regulated data, or multi-user data will have an audit log. "How would you implement an audit trail?" is a common design interview question.

---

## Step 1 — The ToolAuditORM Model

Add to `tooldb/orm/models.py`:

```python
# Add after ToolORM — this is a new import at the top:
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, Text
from datetime import datetime
```

Then the model:

```python
class ToolAuditORM(Base):
    __tablename__ = "tool_audit"

    id         : Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    tool_id    : Mapped[int | None]    = mapped_column(nullable=True)
    # nullable: the tool may be deleted by the time we query the audit log
    tool_name  : Mapped[str]           = mapped_column(String(200))
    # store the name at the time of the event — not a FK, because the name may change
    action     : Mapped[str]           = mapped_column(String(10))
    # "INSERT", "UPDATE", or "DELETE"
    field_name : Mapped[str | None]    = mapped_column(String(100), nullable=True)
    old_value  : Mapped[str | None]    = mapped_column(Text, nullable=True)
    new_value  : Mapped[str | None]    = mapped_column(Text, nullable=True)
    source_file: Mapped[str | None]    = mapped_column(String(500), nullable=True)
    occurred_at: Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)
    # utcnow — always store in UTC; display code converts to local time
```

Why `tool_name` is stored directly instead of using a foreign key to `tools_orm`: the tool may be deleted, changing its name, or renaming is what we are auditing. A foreign key would either fail (if the tool is deleted) or point to the wrong row (if the name changed). Storing the name at the time of the event keeps the audit record self-contained.

Generate and apply a migration:

```
alembic revision --autogenerate -m "add tool_audit table"
alembic upgrade head
```

### SAVE AND TRY

```python
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import ToolAuditORM

with SessionLocal() as session:
    # Write a test audit record manually:
    record = ToolAuditORM(
        tool_id=1,
        tool_name="EM-0500",
        action="INSERT",
        source_file="test.tooldb",
    )
    session.add(record)
    session.commit()

    # Read it back:
    log = session.query(ToolAuditORM).filter_by(tool_name="EM-0500").all()
    for entry in log:
        print(f"{entry.occurred_at}  {entry.action}  {entry.tool_name}")
```

**You should see:**
```
2026-05-21 14:30:22  INSERT  EM-0500
```

**Change something:** Change `action="INSERT"` to `action="BADVALUE"`. SQLAlchemy accepts it — there is no constraint on the string. This is a deliberate design choice: we keep the model simple. If you wanted enforcement, you would use a `CheckConstraint` in the column definition. Change it back.

---

## Concept: SQLAlchemy Session Events

**What it is:** A hook that fires automatically when the SQLAlchemy session performs a specific action — such as flushing changes to the database.

**The problem before:** To write an audit record every time a tool is changed, you could add audit-writing code to every method in `ToolService`. But that means:
- `create_tool()` writes an audit record
- `update_tool()` writes an audit record
- `delete_tool()` writes an audit record
- Any future method must also remember to write an audit record

Forget one, and that change has no audit trail. The audit logic is scattered.

**The solution:** Register a single `after_flush` listener on the session. SQLAlchemy calls it after any flush, passing you the list of new, changed, and deleted ORM objects. You write audit records there — once, in one place, automatically for every mutation.

**What it hides:** The mechanics of listening to SQLAlchemy's internal event bus. You write one function and one `event.listens_for` call; SQLAlchemy calls your function at the right moment.

**The protected invariant:** Every flush that modifies a `ToolORM` object will produce an audit record in the same transaction. You cannot flush without auditing, because the audit code runs as part of the flush.

**Smallest possible example:**

```python
from sqlalchemy import event

@event.listens_for(Session, "after_flush")
def on_after_flush(session, flush_context):
    for new_obj in session.new:
        print(f"INSERT: {new_obj}")
    for changed_obj in session.dirty:
        print(f"UPDATE: {changed_obj}")
    for deleted_obj in session.deleted:
        print(f"DELETE: {deleted_obj}")
```

`session.new` — ORM objects being INSERTed this flush.
`session.dirty` — ORM objects being UPDATEd this flush.
`session.deleted` — ORM objects being DELETEd this flush.

**You will see this again in:** SQLAlchemy-based applications with audit requirements, soft-delete patterns (where delete means "set a deleted_at timestamp"), and full-text search index maintenance (where changing a tool fires an index update).

**Watch for:** `after_flush` fires BEFORE the transaction commits. You are adding audit records to the same transaction. If the transaction rolls back, the audit records roll back too — which is correct. You never want audit records for changes that were rolled back.

---

## Step 2 — The Audit Listener

Create `tooldb/orm/audit.py`:

```python
from sqlalchemy import event
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import get_history
from tooldb.orm.models import ToolORM, ToolAuditORM
from datetime import datetime
```

`get_history(obj, attr_name)` is a SQLAlchemy utility that returns the history of a specific attribute — what it was before the flush, and what it is now. It returns a named tuple with `.added` (new values) and `.deleted` (old values).

```python
def _make_insert_record(tool: ToolORM) -> ToolAuditORM:
    return ToolAuditORM(
        tool_id=tool.id,
        tool_name=tool.name or "",
        action="INSERT",
        source_file=getattr(tool, "source_file", None),
        occurred_at=datetime.utcnow(),
    )
```

One record for the whole insert — no field tracking needed, because this is a brand-new row. Every field is "new," so recording them individually would just duplicate the INSERT itself.

Updates are different. A single `session.commit()` can change multiple fields at once. You want one audit record per changed field, so the history shows exactly what moved. That is what `get_history(tool, field)` enables — it returns the before and after value of a specific attribute for the current flush:

```python
def _make_update_records(tool: ToolORM) -> list[ToolAuditORM]:
    """One audit record per changed field."""
    records = []
    for field in ("name", "tool_type", "diameter", "flute_count", "material"):
        history = get_history(tool, field)
        if history.deleted and history.added:
            old_val = history.deleted[0]
            new_val = history.added[0]
            if old_val != new_val:
                records.append(ToolAuditORM(
                    tool_id=tool.id,
                    tool_name=tool.name or "",
                    action="UPDATE",
                    field_name=field,
                    old_value=str(old_val) if old_val is not None else None,
                    new_value=str(new_val) if new_val is not None else None,
                    occurred_at=datetime.utcnow(),
                ))
    return records
```

`history.deleted` holds the value before the change; `history.added` holds the new value. When a field was never set (e.g., `flute_count` was `None` since the row was created), `history.deleted` is empty — that is an initial null, not a change, so the `if history.deleted and history.added` check skips it. Only genuine field-to-field transitions produce a record.

Deletes are the simplest case — no fields to compare, just record that the tool is gone:

```python
def _make_delete_record(tool: ToolORM) -> ToolAuditORM:
    return ToolAuditORM(
        tool_id=tool.id,
        tool_name=tool.name or "",
        action="DELETE",
        occurred_at=datetime.utcnow(),
    )
```

Now register the listener. Notice the pattern: `after_flush` is a function defined *inside* `register_audit_listener`. This is a closure — the inner function is only defined when `register_audit_listener(SessionLocal)` is called at startup. That call also runs `@event.listens_for`, which wires the hook. Simply importing the file does nothing; only calling `register_audit_listener` activates the audit trail.

```python
def register_audit_listener(session_class) -> None:
    """
    Call once at startup. Registers the audit hook on the session class —
    fires for every session instance created from this class.
    """

    @event.listens_for(session_class, "after_flush")
    def after_flush(session: Session, flush_context) -> None:
        audit_records = []

        for tool in session.new:
            if isinstance(tool, ToolORM):
                audit_records.append(_make_insert_record(tool))

        for tool in session.dirty:
            if isinstance(tool, ToolORM):
                audit_records.extend(_make_update_records(tool))

        for tool in session.deleted:
            if isinstance(tool, ToolORM):
                audit_records.append(_make_delete_record(tool))

        for record in audit_records:
            session.add(record)    # added to the same transaction
```

Call `register_audit_listener(SessionLocal)` once when the app starts — in `session.py` or in `main.py` after imports.

### SAVE AND TRY

```python
from tooldb.orm.session import SessionLocal
from tooldb.orm.audit import register_audit_listener
from tooldb.orm.models import ToolORM, ToolAuditORM

register_audit_listener(SessionLocal)

with SessionLocal() as session:
    # Insert a tool:
    tool = ToolORM(name="EM-0500-TEST", tool_type="endmill", diameter=12.0)
    session.add(tool)
    session.commit()

    # Update it:
    tool.flute_count = 6
    session.commit()

    # Check the audit log:
    log = session.query(ToolAuditORM).filter_by(tool_name="EM-0500-TEST").all()
    for entry in log:
        print(f"{entry.action:8} {entry.field_name or '':<15} {entry.old_value or ''} → {entry.new_value or ''}")
```

**You should see:**
```
INSERT                           
UPDATE  flute_count      None → 6
```

**Change something:** Change `tool.flute_count = 6` to also change `tool.name = "EM-0500-TEST-RENAMED"`. You should see a second UPDATE record for the `name` field. Change it back.

---

## Step 3 — Querying the Audit Log

Add a helper to `ToolService` (or a standalone function) for reading the audit log:

```python
from tooldb.orm.models import ToolAuditORM
from sqlalchemy import select

def get_tool_history(tool_name: str, session) -> list[ToolAuditORM]:
    """Returns audit records for a tool, newest first."""
    stmt = (
        select(ToolAuditORM)
        .where(ToolAuditORM.tool_name == tool_name)
        .order_by(ToolAuditORM.occurred_at.desc())
    )
    return session.scalars(stmt).all()
```

`order_by(ToolAuditORM.occurred_at.desc())` — `.desc()` on a column produces a descending sort: newest first. `.asc()` would produce oldest first.

### SAVE AND TRY

```python
from tooldb.orm.session import SessionLocal
from tooldb.orm.audit import register_audit_listener

register_audit_listener(SessionLocal)

with SessionLocal() as session:
    history = get_tool_history("EM-0500-TEST", session)
    for entry in history:
        print(f"{entry.occurred_at.strftime('%H:%M:%S')}  {entry.action:8}  "
              f"{entry.field_name or '—':<15}  {entry.old_value or ''} → {entry.new_value or ''}")
```

**You should see** the history in reverse chronological order (newest first).

---

## 🎯 Challenge: Audit Log Tab in the UI

**You know:** `QTabWidget` (Lab 59), `ReportTableModel` returning `list[dict]` rows (Lab 59), `get_tool_history()` returning audit records.

**Task:** Add an "Audit Log" tab to the main window. The tab contains a `QTableWidget` (or a `QTableView` with a model) that shows the audit log for whichever tool is selected in the tools tab. When the user selects a tool and switches to the Audit Log tab, the table shows that tool's history.

**Starting code:**

```python
# In your main window — add the tab:
self._audit_tab = AuditTab(self._service)
self._tab_widget.addTab(self._audit_tab, "Audit Log")

# AuditTab skeleton:
class AuditTab(QWidget):
    def __init__(self, service, parent=None):
        super().__init__(parent)
        self._service = service
        self._table = QTableWidget()
        self._table.setColumnCount(5)
        self._table.setHorizontalHeaderLabels(
            ["Time", "Action", "Field", "Old Value", "New Value"]
        )
        layout = QVBoxLayout(self)
        layout.addWidget(self._table)

    def load_for_tool(self, tool_name: str) -> None:
        # populate self._table with history for tool_name
        ...
```

---

<details>
<summary>▶ Show Solution</summary>

```python
def load_for_tool(self, tool_name: str) -> None:
    from tooldb.orm.session import SessionLocal
    with SessionLocal() as session:
        history = get_tool_history(tool_name, session)

    self._table.setRowCount(len(history))
    for row_idx, entry in enumerate(history):
        values = [
            entry.occurred_at.strftime("%Y-%m-%d %H:%M:%S"),
            entry.action,
            entry.field_name or "",
            entry.old_value or "",
            entry.new_value or "",
        ]
        for col_idx, value in enumerate(values):
            item = QTableWidgetItem(str(value))
            item.setFlags(item.flags() & ~Qt.ItemIsEditable)   # read-only
            self._table.setItem(row_idx, col_idx, item)

    self._table.resizeColumnsToContents()
```

Connect it from the tools tab:

```python
# When the user selects a row in the tools table:
def _on_tool_selected(self, tool: ToolRead) -> None:
    self._audit_tab.load_for_tool(tool.name)
```

**Key insight:** The audit tab is a read-only view of a separate table — it has no business logic. The pattern is the same as the report tab from Lab 59: data → rows → items with read-only flags. The only new piece is the query function. This is what good separation of concerns looks like: `get_tool_history()` is pure data retrieval; `AuditTab.load_for_tool()` is pure display; neither knows about the other's implementation.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| Alembic migration added `tool_audit` table | `PRAGMA table_info(tool_audit)` — see all columns |
| INSERT produces one audit record | Add a tool, query `tool_audit` for that name — one row with `action="INSERT"` |
| UPDATE produces one record per changed field | Update two fields, check `tool_audit` — two rows with `action="UPDATE"` |
| DELETE produces one audit record | Delete a tool, query by name — one row with `action="DELETE"` |
| Rollback does not leave orphan audit records | Begin a transaction, add a tool, rollback — no audit row in database |

---

## Quick Check Answers

**1. Without an audit log, can you answer "what was the original name?"**
No. `UPDATE` in SQL overwrites the old value in place — the old value is gone. The database stores current state, not history. With an audit log, the original INSERT record stores the name at creation time, and every UPDATE record stores `old_value` and `new_value`. The full rename history is recoverable no matter how many times the tool was renamed.

**2. Why is an audit log append-only?**
If you could update or delete audit records, you could cover your tracks — making it appear that a change never happened. The audit log is only trustworthy if it is immutable. In regulated environments (medical, financial), audit log immutability is a legal requirement, not a design preference. In practice, "append-only" is enforced by giving the application user database permissions to INSERT into `tool_audit` but not UPDATE or DELETE. The database engine itself enforces the invariant, not application code.

**3. Why write the audit record before the commit?**
Because the audit record and the data change must succeed or fail together. If you write the data change, commit, then write the audit record, and the process crashes between commit and audit-write, you have an unaudited change. By writing the audit record in the same transaction (before commit), either both changes land or neither does. This is the standard pattern: all side effects of a transaction belong inside the transaction boundary.
