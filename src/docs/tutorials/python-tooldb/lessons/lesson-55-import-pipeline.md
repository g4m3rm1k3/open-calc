# Python Tool Database — LAB 55 — The Import Pipeline

**Prerequisites:** Lab 54. You have a `MastercamAdapter` that converts raw rows to `ToolCreate`. This lesson builds the pipeline that connects the source file to your database — and confronts two problems the adapter alone cannot solve: what happens when a tool already exists, and how do you report what happened.

**What this lab teaches:**
- Why a "simple import" has at least four distinct failure modes
- The `ImportResult` dataclass — what the pipeline returns to the caller
- Upsert vs skip vs error: three policies for handling duplicates, each correct in different situations
- Wrapping the whole import in a single transaction
- Building the "Import from Mastercam" button in the Qt UI

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You import a 100-tool file for the second time. 80 tools already exist in your database. You have three options: skip existing, overwrite existing, or error on existing. Name a real-world situation where each policy is the right choice.
> 2. The import inserts 99 tools successfully. Tool 100 raises an `IntegrityError` (duplicate name). Does the transaction roll back all 99? Should it?
> 3. You report "Imported: 97, Skipped: 3" to the user. Is that enough information?
>
> *(Answers at the end)*

---

## The Four Failure Modes

When you import a file, four things can go wrong — and each one requires a different response:

**1. The file cannot be opened.**
The path is wrong, the file is locked, or it is not a valid SQLite database. This is an error that stops everything — there is nothing to import.

**2. A row cannot be converted.**
`MastercamAdapter.to_tool_create()` returned `None`. The tool is skipped. The import continues.

**3. The `ToolCreate` fails Pydantic validation.**
The row was converted but the data violates your schema constraints (diameter ≤ 0, unknown material after defaulting). The tool is skipped. The import continues.

**4. The database INSERT fails.**
A tool with the same name already exists (`UNIQUE` constraint violation). This is the most important case to get right.

The adapter handles case 2. The Pydantic schema handles case 3. The import pipeline owns cases 1 and 4.

---

## Step 1 — `ImportResult`

You built `ImportReport` in Lesson 30 for batch validation. The import pipeline needs something similar — a structured return value that tells the caller what happened:

```python
from dataclasses import dataclass, field


@dataclass
class ImportResult:
    total_rows: int = 0
    imported: int = 0
    skipped: int = 0
    errors: list[str] = field(default_factory=list)

    def add_error(self, message: str) -> None:
        self.errors.append(message)

    def summary(self) -> str:
        parts = [f"Imported: {self.imported}/{self.total_rows}"]
        if self.skipped:
            parts.append(f"Skipped: {self.skipped}")
        if self.errors:
            parts.append(f"Errors: {len(self.errors)}")
        return ", ".join(parts)
```

`total_rows` is the count of rows read from Mastercam. `imported` is how many made it into your database. The gap between them breaks into `skipped` (filtered by adapter or validation) and `errors` (failed at the INSERT stage).

The caller — the Qt button handler — receives an `ImportResult` and displays `result.summary()` in a status bar or dialog. It does not need to know which row failed or why; that is in `result.errors` for users who want to dig in.

---

## Step 2 — The Duplicate Policy Decision

Before writing the pipeline, decide what to do when a tool name already exists. Three options, each defensible:

**Skip** — "If the tool is already in my database, I don't want Mastercam to overwrite my edits."  
Use when: You have manually edited tools in your database (changed notes, added a preferred feed rate) and do not want imports to overwrite that data.

**Overwrite** — "The Mastercam library is the source of truth. Always take the latest."  
Use when: Your database is a read-only mirror of Mastercam's library. You never edit locally.

**Error** — "A duplicate means something went wrong. Stop and tell me."  
Use when: Your naming conventions should guarantee uniqueness. A duplicate is a data integrity violation worth investigating.

For this project, the right default is **Skip with notification**: if the tool exists, skip it and note it in the result. The user can see which tools were skipped and decide whether to manually update them. This preserves local edits while still reporting the situation.

---

## Step 3 — The Pipeline Function

Create `tooldb/importers/mastercam_importer.py`:

```python
import sqlite3
from pydantic import ValidationError
from tooldb.adapters.mastercam_adapter import MastercamAdapter
from tooldb.services.tool_service_orm import ToolService
from tooldb.schemas.tool_schemas import ToolCreate
from tooldb.importers.import_result import ImportResult


def import_from_tooldb(tooldb_path: str, service: ToolService) -> ImportResult:
    result = ImportResult()

    # Phase 1: open the source file
    try:
        src = sqlite3.connect(tooldb_path)
        src.row_factory = sqlite3.Row
    except Exception as e:
        result.add_error(f"Cannot open file: {e}")
        return result
```

The very first thing: try to open the source. If it fails, return an `ImportResult` with one error and no rows processed. The caller gets a clean result object regardless — no exceptions propagate out of the pipeline.

```python
    # Phase 2: extract all rows
    try:
        rows = src.execute("SELECT * FROM dbo_ToolMgr_Tool").fetchall()
    except sqlite3.OperationalError as e:
        result.add_error(f"Cannot read tool table: {e}")
        src.close()
        return result

    result.total_rows = len(rows)
    src.close()
```

Close the source connection immediately after reading. You are done with it — the rest of the pipeline works in memory and writes to your database only.

Why `fetchall()` instead of iterating row by row? Because you want to close the source connection before opening a write transaction to your database. You are not holding two SQLite connections open simultaneously, and you are not holding the source file locked during the entire import.

```python
    adapter = MastercamAdapter()

    # Phase 3: transform and load
    for row in rows:
        # Transform
        tool_create = adapter.to_tool_create(dict(row))
        if tool_create is None:
            result.skipped += 1
            continue

        # Additional Pydantic validation (catches anything the adapter missed)
        try:
            ToolCreate.model_validate(tool_create.model_dump())
        except ValidationError as e:
            result.skipped += 1
            result.add_error(f"Validation failed for '{row.get('fld_mc_tool_name')}': {e}")
            continue

        # Load — skip if duplicate
        try:
            service.create_tool(tool_create)
            result.imported += 1
        except Exception as e:
            error_text = str(e)
            if "UNIQUE constraint failed" in error_text:
                result.skipped += 1
                # Don't add to errors — skipping duplicates is expected behavior
            else:
                result.add_error(f"Insert failed for '{tool_create.name}': {error_text}")

    return result
```

Walk through the three phases of each row:

**Transform.** The adapter converts the raw dict. If it returns `None`, increment `skipped` and move on. No error recorded — `None` from the adapter means "this is an expected skip condition" (inactive tool, unknown type). You already designed the adapter to handle those cases silently.

**Validate.** This second validation pass may seem redundant — `to_tool_create` already returns a `ToolCreate`, which was already validated on construction. The extra call is a safety net for cases where your adapter created a `ToolCreate` with fields that passed the adapter's internal checks but would fail Pydantic's `@field_validator` rules (for example, if the adapter set `material="carbide"` as a default and carbide is valid, but some edge case produces an invalid combination). In practice, it rarely fires — but when it does, you want to see it in the import log.

**Load.** `try/except` on the INSERT itself. A `UNIQUE constraint failed` error means the tool already exists — increment `skipped` but do not add to `result.errors`. A duplicate during import is not an error; it is an expected condition under the "skip" policy. Any other exception (disk full, schema mismatch) is a genuine error and gets recorded.

---

## Step 4 — The Qt Button

In `tooldb_ui/main.py`, wire up an "Import from Mastercam" menu action:

```python
from PySide6.QtWidgets import QFileDialog, QMessageBox
from tooldb.importers.mastercam_importer import import_from_tooldb


def _on_import_mastercam(self):
    path, _ = QFileDialog.getOpenFileName(
        self, "Open Mastercam Tool Library",
        "", "Tool Library (*.tooldb);;All Files (*)"
    )
    if not path:
        return   # user cancelled

    result = import_from_tooldb(path, self._service)
    self._load_tools()   # refresh table regardless

    summary = result.summary()
    if result.errors:
        detail = "\n".join(result.errors[:10])   # first 10 errors
        if len(result.errors) > 10:
            detail += f"\n...and {len(result.errors) - 10} more"
        QMessageBox.warning(self, "Import Complete", f"{summary}\n\n{detail}")
    else:
        self.statusBar().showMessage(summary, 5000)   # 5-second status bar message
```

Two distinct UI responses: if there are errors, show a dialog so the user reads them. If clean, show a brief status bar message that disappears on its own. The user is not interrupted for a clean import; they are informed. For an import with errors, they need to decide what to do — the dialog makes that decision explicit.

---

## Step 5 — SAVE AND TRY

**Run the import twice.** The first run should import all tools. The second run should skip all of them (duplicate names). The second run's `ImportResult` should show `imported=0, skipped=N`. Verify this.

**Corrupt one row.** In the sample database, set `fld_mc_tool_diameter = -0.5` for one tool. The adapter will produce a `ToolCreate` with a negative diameter, which Pydantic's `check_diameter` validator will reject. That row should appear in `result.errors`.

**Time the import.** Add `import time` and measure how long 4 tools take. Then mentally scale: if 4 tools takes 0.2 seconds, how long does 10,000 tools take? (Roughly 500 seconds.) The next concept block covers this.

---

## Concept: Why Not One Big Transaction?

A natural instinct: wrap the entire import in `BEGIN TRANSACTION / COMMIT` so that either all 1000 tools import or none do. This is correct for financial data. Is it correct here?

Consider: you import a 1000-tool library. Tool 847 has a name collision. With one transaction, you lose all 999 other successful imports because of one duplicate. You show the user "Import failed" and they have to delete the partially-imported data, fix the file, and start over.

The "skip on duplicate" policy with per-row commits is more forgiving: 999 tools imported, 1 skipped. The user gets most of their data and a clear report of what to check.

The downside: if the import crashes halfway through (power loss, process killed), your database is in a partially-imported state with no easy way to know which tools made it. For a tool library import, that is acceptable — you can re-import and duplicates will be skipped. For financial ledger entries, it would not be acceptable.

The right transaction policy depends on whether partial state is recoverable. For imports with a skip-on-duplicate policy, partial state is recoverable. One transaction per row is appropriate.

---

## Final Check

| | |
|--|--|
| `ImportResult` gives the caller a structured report, not a raw exception | ✓ |
| Close the source connection before writing to the destination | ✓ |
| Skip vs overwrite vs error: explicit policy, documented, not accidental | ✓ |
| `UNIQUE constraint` on INSERT → skip, not error (under skip policy) | ✓ |
| Qt button shows dialog for errors, status bar for clean import | ✓ |
| Per-row commits: recoverable partial state for this use case | ✓ |

---

## Quick Check Answers

1. **Skip**: your machinist added custom notes and preferred feed rates to tools in your database. A re-import should not overwrite that local knowledge. **Overwrite**: your database is a read-only mirror of a shared Mastercam library on the network. Local edits are not allowed; the library is always authoritative. **Error**: your import pipeline is a one-time migration script. Any duplicate means the source data is inconsistent — you want to know before you proceed, not after.

2. **Without explicit transaction management, SQLAlchemy commits one row at a time in this implementation.** Tool 100 fails, but tools 1–99 are already committed. Whether that is correct depends on your duplicate policy. If you want true atomicity ("all or nothing"), wrap the entire loop in a single `session.begin()` / `session.commit()` block and call `session.rollback()` on any error. For the "skip on duplicate" policy, per-row commits are correct — you want the 99 successful inserts to persist.

3. **"Imported: 97, Skipped: 3" is the minimum viable report — but 3 skipped for what reason?** A user who imports 100 tools and gets 97 wants to know whether the 3 were inactive in Mastercam (expected), duplicates (expected after re-import), or data problems (unexpected). The `result.errors` list provides this detail. For duplicates, you chose not to log them as errors — but if you want visibility into how many skips were duplicates vs adapter failures, you would track those separately. "Skipped: 3 (2 duplicates, 1 unknown type)" is a better report than "Skipped: 3."
