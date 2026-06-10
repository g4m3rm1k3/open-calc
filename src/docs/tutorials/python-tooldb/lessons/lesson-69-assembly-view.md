# Python Tool Database — LAB 69 — Assembly View and Job Assignment

**Prerequisites:** Lab 59 (QTabWidget). Lab 52 (ToolService). You can add tabs to the main window and use the service layer. This lesson adds an "Assemblies" tab — tool holders paired with tools — and a "Job" concept for grouping assemblies.

**What this lab adds:**
- `AssemblyORM` and `JobORM` — two new tables with relationships
- The many-to-one relationship: many assemblies belong to one job
- Displaying a tree of jobs → assemblies in a `QTreeWidget`
- Assigning a tool to an assembly by dragging from the tool table

**Time:** 60–75 minutes

---

## What You Will Build

An Assemblies tab with a tree view on the left and a detail panel on the right:

```
Assemblies
────────────────────────────────────────────
▼ Job: Shop Floor Setup 2026-05
    ├── Position 1   EM-0600 (endmill, 6mm)
    ├── Position 2   DRL-08  (drill, 8mm)
    └── Position 3   [unassigned]
▼ Job: Special Run
    └── Position 1   EM-1200 (endmill, 12mm)
```

---

> **Quick Check — try to answer before reading:**
>
> 1. An assembly has one tool. A job has many assemblies. In SQL, which table holds the foreign key?
> 2. `QTreeWidget` vs `QTreeView` — the two Qt tree widget types. What is the difference and when do you use each?
> 3. Drag-and-drop in Qt requires the source item to provide data in a specific format. What Qt class wraps data transferred during a drag operation?
>
> *(Answers at the end of this lab)*

---

## Concept: SQLAlchemy One-to-Many Relationship

**What it is:** A database and ORM pattern where one row in table A is related to many rows in table B. The "many" side holds a foreign key pointing to the "one" side.

**The problem before:** Without a relationship:

```python
# To load a job's assemblies, you'd write this every time:
assemblies = session.scalars(
    select(AssemblyORM).where(AssemblyORM.job_id == job.id)
).all()
```

Every place in the code that needs a job's assemblies repeats this query.

**The solution:** Declare the relationship once in the ORM model. SQLAlchemy then loads assemblies automatically when you access `job.assemblies`:

```python
class JobORM(Base):
    # ...
    assemblies: Mapped[list["AssemblyORM"]] = relationship("AssemblyORM", back_populates="job")

class AssemblyORM(Base):
    # ...
    job_id : Mapped[int] = mapped_column(ForeignKey("jobs.id"))
    job    : Mapped["JobORM"] = relationship("JobORM", back_populates="assemblies")
```

`job.assemblies` now returns a list of `AssemblyORM` objects — SQLAlchemy runs the query when you first access it.

**What it hides:** The JOIN query, the foreign key lookup, and the caching. Once loaded, `job.assemblies` is cached for the lifetime of the session — repeated access does not re-query.

**The protected invariant:** `assembly.job` always refers to the parent job in the ORM session. SQLAlchemy keeps the relationship consistent: if you add an assembly to `job.assemblies`, SQLAlchemy automatically sets `assembly.job_id` to `job.id`.

**You will see this again in:** Every ORM-based application with related entities. User → Orders, Order → OrderItems, Department → Employees. The one-to-many relationship is the most common database relationship. SQLAlchemy, Django ORM, ActiveRecord, Hibernate — all declare it with similar syntax.

**Watch for:** Lazy loading. By default, `job.assemblies` runs a query the first time you access it. If you access `assemblies` on 20 jobs in a loop, that is 20 queries. The fix is `joinedload` (Lab 48's concept) — load all assemblies in a single query with a JOIN.

---

## Step 1 — AssemblyORM and JobORM Models

Add to `tooldb/orm/models.py`:

```python
# New imports needed at the top:
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
```

Then the models (after `ToolORM`):

```python
class JobORM(Base):
    __tablename__ = "jobs"

    id          : Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    name        : Mapped[str]           = mapped_column(String(200), unique=True)
    description : Mapped[str | None]    = mapped_column(String(500), nullable=True)
    created_at  : Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)

    # One job has many assemblies:
    assemblies  : Mapped[list["AssemblyORM"]] = relationship(
        "AssemblyORM",
        back_populates="job",
        cascade="all, delete-orphan",    # deleting a job deletes its assemblies
    )
```

`cascade="all, delete-orphan"` means: when a `JobORM` is deleted, SQLAlchemy automatically deletes all its `AssemblyORM` children. Without cascade, you would get a foreign key violation trying to delete a job that still has assemblies.

```python
class AssemblyORM(Base):
    __tablename__ = "assemblies"

    id          : Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    position    : Mapped[int]           = mapped_column()
    # Position number within the job (1, 2, 3...) — not globally unique
    job_id      : Mapped[int]           = mapped_column(ForeignKey("jobs.id"))
    tool_id     : Mapped[int | None]    = mapped_column(ForeignKey("tools_orm.id"), nullable=True)
    # nullable: a position can be unassigned

    job  : Mapped["JobORM"]            = relationship("JobORM",  back_populates="assemblies")
    tool : Mapped["ToolORM | None"]    = relationship("ToolORM")
```

`tool_id` is nullable — an assembly can exist before a tool is assigned to it. This models the real workflow: create the job setup first, then fill in tools.

Generate and apply the migration:

```
alembic revision --autogenerate -m "add jobs and assemblies tables"
alembic upgrade head
```

### SAVE AND TRY

```python
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import JobORM, AssemblyORM, ToolORM
from sqlalchemy import select

with SessionLocal() as session:
    job = JobORM(name="Test Job", description="Fixture A")
    job.assemblies = [
        AssemblyORM(position=1),   # unassigned
        AssemblyORM(position=2),   # unassigned
    ]
    session.add(job)
    session.commit()

    # Load the job and its assemblies:
    loaded = session.scalars(select(JobORM)).first()
    print(f"Job: {loaded.name}")
    for asm in loaded.assemblies:
        print(f"  Position {asm.position}: tool_id={asm.tool_id}")
```

**You should see:**
```
Job: Test Job
  Position 1: tool_id=None
  Position 2: tool_id=None
```

**Change something:** Remove `cascade="all, delete-orphan"` from the relationship, then try to delete the job: `session.delete(loaded); session.commit()`. You should get an IntegrityError. Add the cascade back.

---

## Concept: `QTreeWidget` — Structured Tree Display

**What it is:** A Qt widget that displays hierarchical data as a collapsible tree. Each item can have children, and each row can have multiple columns.

**`QTreeWidget` vs `QTreeView`:** `QTreeWidget` is the "convenience" version — you add items directly to it. `QTreeView` requires a separate tree model (like `QStandardItemModel` or a custom model). `QTreeWidget` is simpler for static or straightforward data where you build the tree manually. `QTreeView` is more powerful when the data comes from a model you already have.

**We use `QTreeWidget` here** because we are building the tree from a known set of jobs and assemblies — we control the structure. If the tree needed sorting, drag-drop reordering, or was backed by a real model, `QTreeView` would be appropriate.

**Smallest possible example:**

```python
from PySide6.QtWidgets import QTreeWidget, QTreeWidgetItem

tree = QTreeWidget()
tree.setHeaderLabels(["Name", "Status"])

parent_item = QTreeWidgetItem(tree, ["Parent", "active"])   # top-level item
child_item  = QTreeWidgetItem(parent_item, ["Child", "pending"])   # child item

tree.expandAll()
```

---

## Step 2 — AssemblyTab Widget

Create `tooldb_ui/assembly_tab.py`:

```python
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QTreeWidget, QTreeWidgetItem, QPushButton, QLabel
)
from PySide6.QtCore import Qt
from tooldb.orm.session import SessionLocal
from tooldb.orm.models import JobORM
from sqlalchemy import select
from sqlalchemy.orm import joinedload
```

```python
class AssemblyTab(QWidget):

    def __init__(self, parent=None):
        super().__init__(parent)
        self._tree = QTreeWidget()
        self._tree.setColumnCount(3)
        self._tree.setHeaderLabels(["Position", "Tool", "Diameter"])
        self._tree.setAlternatingRowColors(True)

        layout = QVBoxLayout(self)
        layout.addWidget(self._tree)
```

```python
    def load_jobs(self) -> None:
        """Clears and rebuilds the tree from the database."""
        self._tree.clear()

        with SessionLocal() as session:
            jobs = session.scalars(
                select(JobORM).options(
                    joinedload(JobORM.assemblies).joinedload(AssemblyORM.tool)
                )
            ).unique().all()
            # .unique() is required when using joinedload with collections —
            # the JOIN produces duplicate rows; .unique() de-duplicates them
```

`joinedload(JobORM.assemblies).joinedload(AssemblyORM.tool)` — chained eager loading. One query loads all jobs, their assemblies, and the tool for each assembly. Without this, accessing `asm.tool` inside the closed `with SessionLocal()` block would raise `DetachedInstanceError` — the session is closed and lazy loading cannot run.

```python
            for job in jobs:
                job_item = QTreeWidgetItem(self._tree)
                job_item.setText(0, f"Job: {job.name}")
                job_item.setExpanded(True)

                for asm in sorted(job.assemblies, key=lambda a: a.position):
                    asm_item = QTreeWidgetItem(job_item)
                    asm_item.setText(0, f"Position {asm.position}")
                    if asm.tool:
                        asm_item.setText(1, asm.tool.name)
                        asm_item.setText(2, f"{asm.tool.diameter:.1f} mm" if asm.tool.diameter else "—")
                    else:
                        asm_item.setText(1, "[unassigned]")
                    asm_item.setData(0, Qt.UserRole, asm.id)
                    # Store assembly ID in UserRole so we can identify the item later
```

`asm_item.setData(0, Qt.UserRole, asm.id)` — `UserRole` is a reserved Qt data role for application data. It is invisible to the user but retrievable with `item.data(0, Qt.UserRole)`. This is how you attach IDs or domain objects to tree items without visible columns.

### SAVE AND TRY

Add the tab to the main window:

```python
from tooldb_ui.assembly_tab import AssemblyTab

self._assembly_tab = AssemblyTab()
self._tab_widget.addTab(self._assembly_tab, "Assemblies")
self._assembly_tab.load_jobs()
```

Run the app and click the Assemblies tab.

**You should see:** The tree showing jobs and their assembly positions. Positions without tools show "[unassigned]".

---

## Step 3 — Creating a Job from the UI

Add a "New Job" button:

```python
# In AssemblyTab.__init__, after the tree:

self._new_job_btn = QPushButton("New Job...")
self._new_job_btn.clicked.connect(self._on_new_job)
layout.addWidget(self._new_job_btn)
```

```python
def _on_new_job(self) -> None:
    from PySide6.QtWidgets import QInputDialog
    name, ok = QInputDialog.getText(self, "New Job", "Job name:")
    if not ok or not name.strip():
        return

    positions, ok = QInputDialog.getInt(
        self, "Positions", "Number of positions:", value=4, min=1, max=50
    )
    if not ok:
        return

    with SessionLocal() as session:
        job = JobORM(name=name.strip())
        job.assemblies = [AssemblyORM(position=i + 1) for i in range(positions)]
        session.add(job)
        session.commit()

    self.load_jobs()   # refresh the tree
```

`QInputDialog.getText()` returns `(text, ok)` — `ok` is `True` if the user clicked OK, `False` if they cancelled. The pattern `text, ok = QInputDialog.getText(...)` unpacks both.

`QInputDialog.getInt()` returns `(value, ok)` with the same convention.

### SAVE AND TRY

Run the app. Click "New Job...". Enter a name and position count.

**You should see:** A new job appears in the tree with the requested number of "[unassigned]" positions.

---

## 🎯 Challenge: Assign a Tool to a Position

**You know:** `QTreeWidgetItem.data(0, Qt.UserRole)` retrieves the assembly ID. `ToolService.get_tool_by_name()` retrieves a tool. You can update `assembly.tool_id` and commit.

**Task:** When the user double-clicks an "[unassigned]" position in the tree, open a `QInputDialog.getText()` asking for a tool name. Look up the tool, assign it to the assembly, and refresh the tree.

**Starting code:**

```python
# Connect in __init__:
self._tree.itemDoubleClicked.connect(self._on_item_double_clicked)

def _on_item_double_clicked(self, item: QTreeWidgetItem, column: int) -> None:
    assembly_id = item.data(0, Qt.UserRole)
    if assembly_id is None:
        return   # double-clicked a job header, not an assembly row

    current_tool = item.text(1)
    if current_tool != "[unassigned]":
        return   # already assigned — don't overwrite (extend this for re-assignment)

    # Ask for tool name, look it up, assign it...
```

---

<details>
<summary>▶ Show Solution</summary>

```python
def _on_item_double_clicked(self, item: QTreeWidgetItem, column: int) -> None:
    assembly_id = item.data(0, Qt.UserRole)
    if assembly_id is None:
        return

    tool_name, ok = QInputDialog.getText(self, "Assign Tool", "Tool name:")
    if not ok or not tool_name.strip():
        return

    from tooldb.orm.models import AssemblyORM, ToolORM
    from sqlalchemy import select

    with SessionLocal() as session:
        tool = session.scalars(
            select(ToolORM).where(ToolORM.name == tool_name.strip())
        ).first()

        if tool is None:
            from PySide6.QtWidgets import QMessageBox
            QMessageBox.warning(self, "Not Found", f"No tool named '{tool_name}'")
            return

        asm = session.get(AssemblyORM, assembly_id)
        asm.tool_id = tool.id
        session.commit()

    self.load_jobs()
```

**Key insight:** `session.get(AssemblyORM, assembly_id)` is the direct-lookup form — fetches by primary key without writing a `select()`. This is faster than a WHERE query and clearer in intent when you already know the ID. Always use `.get()` when you have the primary key; use `select().where()` when you are filtering by other fields.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| Migration created `jobs` and `assemblies` tables | `PRAGMA table_info(jobs)` and `PRAGMA table_info(assemblies)` |
| Job deletion cascades to assemblies | Delete a job, query assemblies — none remain for that job_id |
| Tree shows jobs and positions | Open Assemblies tab — tree with job headers and position rows |
| Unassigned position shows "[unassigned]" | Create a job, positions have no tool — "[unassigned]" displayed |
| `UserRole` data accessible on item | `item.data(0, Qt.UserRole)` returns the assembly ID |

---

## Quick Check Answers

**1. Which table holds the foreign key in a one-to-many relationship?**
The "many" side — the assemblies table. Each assembly row holds `job_id`, pointing to the one job it belongs to. The jobs table has no column referencing assemblies. This is the fundamental rule: the foreign key is always on the child (many) side, never the parent (one) side. Putting it on the parent would require storing a list of IDs in one column — which is not relational and cannot be indexed.

**2. `QTreeWidget` vs `QTreeView` — which to use?**
`QTreeWidget` when you build the tree manually (adding items with `QTreeWidgetItem`), which is fine for static or straightforward hierarchies. `QTreeView` when the data lives in a separate model class — more complex but enables sorting, filtering (via proxy), and model reuse. The rule is the same as `QTableWidget` vs `QTableView`: widget for simple cases, view+model for data-driven cases.

**3. What Qt class wraps data during a drag operation?**
`QMimeData`. It stores typed data — text, URLs, custom byte data — using MIME type strings as keys. A drag source creates a `QMimeData` object, sets data on it (e.g., the tool ID as text), and the drop target reads the same data from the `QMimeData` in the drop event. The MIME type string is the contract between source and target — both must agree on the key name.
