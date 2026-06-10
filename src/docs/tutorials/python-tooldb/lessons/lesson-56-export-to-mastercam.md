# Python Tool Database — LAB 56 — Exporting Tools to Mastercam Format

**Prerequisites:** Lab 55. You can import tools from a `.tooldb` file into your database. This lesson runs in the opposite direction: you take tools from your database and write a new `.tooldb` file that Mastercam can open.

On the surface, export feels like import in reverse — and it mostly is. But there is one asymmetry that makes export harder, and understanding it will shape how you build every export feature you ever write.

**What this lab adds:**
- Why export is harder than import: you must guarantee the output is valid, not just tolerate bad input
- Creating a target SQLite file with the right schema before any inserts
- The reverse adapter: `ToolRead` → Mastercam row dict
- Required fields your schema does not have: how to fill them with safe defaults
- Round-trip testing: export then re-import, check what survived
- A note on file versioning — why "target a specific version" matters

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. When importing, your adapter returns `None` for records it can't handle. What is the equivalent "bail out" option when exporting?
> 2. Mastercam's `dbo_ToolMgr_Tool` table has `fld_mc_in_use INTEGER NOT NULL`. Your `ToolRead` schema has no `in_use` field. What do you put in that column?
> 3. You export 50 tools and re-import the exported file. You get 48 tools back. Name two reasons why 2 tools might not survive the round trip.
>
> *(Answers at the end)*

---

## The Asymmetry: Lenient Reader, Strict Writer

When you import, you are the reader. If a row is missing a field you expected, you default or skip. You control how forgiving your code is.

When you export, you are the writer. Mastercam is the reader — and it has no special tolerance for your missing fields. If Mastercam's schema says `fld_mc_tool_type_id NOT NULL` and you write `NULL`, Mastercam silently ignores the tool, shows a vague error, or crashes. You will not get a helpful error message.

This means export requires a different attitude:

- **Import**: "Can I make sense of this row? If not, skip it."
- **Export**: "Does this row satisfy every constraint Mastercam requires? If not, either fill in a safe default or don't write the row."

The lesson in one sentence: **import is tolerant of bad input; export must produce correct output.**

---

## Step 1 — Schema First

When you imported, the source `.tooldb` already had its schema. When you export, you create a new empty file and must define the schema yourself before inserting anything.

Create `tooldb/exporters/mastercam_exporter.py`. Start with the schema:

```python
import sqlite3

_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS dbo_ToolMgr_ToolType (
    fld_mc_tool_type_id   INTEGER PRIMARY KEY,
    fld_mc_tool_type_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dbo_ToolMgr_Material (
    fld_mc_material_id    INTEGER PRIMARY KEY,
    fld_mc_material_name  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dbo_ToolMgr_Tool (
    fld_mc_tool_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    fld_mc_tool_type_id     INTEGER NOT NULL,
    fld_mc_tool_name        TEXT NOT NULL,
    fld_mc_tool_comment     TEXT,
    fld_mc_tool_diameter    REAL NOT NULL,
    fld_mc_corner_rad       REAL NOT NULL DEFAULT 0.0,
    fld_mc_flute_len        REAL NOT NULL DEFAULT 0.0,
    fld_mc_overall_len      REAL NOT NULL DEFAULT 0.0,
    fld_mc_num_flutes       INTEGER,
    fld_mc_material         INTEGER NOT NULL DEFAULT 1,
    fld_mc_in_use           INTEGER NOT NULL DEFAULT 1
);
"""
```

Two things to notice. First: the lookup tables come before the tool table. Order matters because `dbo_ToolMgr_Tool` references `dbo_ToolMgr_ToolType` through `fld_mc_tool_type_id` — if the type table does not exist when the tool table is created, the schema is inconsistent.

Second: look at the `NOT NULL DEFAULT` columns on `dbo_ToolMgr_Tool`. `fld_mc_corner_rad NOT NULL DEFAULT 0.0` — Mastercam requires this column to have a value, but `0.0` is safe for any tool type. These are the required-but-defaultable fields. You do not need data from your schema to fill them; you need to know Mastercam's safe default.

Add a function that creates the file and seeds the lookup tables:

```python
def _create_tooldb(path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.executescript(_SCHEMA_SQL)

    conn.executemany(
        "INSERT OR IGNORE INTO dbo_ToolMgr_ToolType VALUES (?, ?)",
        [(1, "End Mill"), (2, "Drill"), (3, "Face Mill"), (4, "Turn Tool")]
    )
    conn.executemany(
        "INSERT OR IGNORE INTO dbo_ToolMgr_Material VALUES (?, ?)",
        [(1, "Carbide"), (2, "High Speed Steel"), (3, "Cobalt")]
    )
    conn.commit()
    return conn
```

`INSERT OR IGNORE` is the right idiom when seeding lookup data that might already exist — it silently skips the insert if the primary key conflicts. This makes `_create_tooldb` safe to call on both new files and existing files.

---

## Step 2 — The Reverse Adapter

The forward adapter converted Mastercam column names to your field names, and integer IDs to string values. The reverse adapter does the opposite: string values back to integer IDs, your field names back to Mastercam column names.

Add a `MastercamExportAdapter` class to `tooldb/adapters/mastercam_adapter.py`:

```python
from tooldb.schemas.tool_schemas import ToolRead

_EXPORT_TYPE_MAP = {
    "endmill":  1,
    "drill":    2,
    "facemill": 3,
    "turntool": 4,
}

_EXPORT_MATERIAL_MAP = {
    "carbide": 1,
    "HSS":     2,
    "cobalt":  3,
}
```

These are the forward maps inverted. When you look at them side by side, the symmetry is obvious — but note that the reverse material map has a gap. The forward map defaulted unknown materials to `"carbide"`. That means a tool that was imported with `material=999` (unknown) got stored as `"carbide"` in your database. When you export it, `"carbide"` → `1` — so the round trip silently changed the material from `999` to `1`. That is a lossy conversion, and it is intentional. You'll explore it in the SAVE AND TRY.

Now the conversion method:

```python
class MastercamExportAdapter:

    def to_mastercam_row(self, tool: ToolRead) -> dict | None:
        type_id = _EXPORT_TYPE_MAP.get(tool.tool_type)
        if type_id is None:
            return None   # unknown type — cannot write a valid row
```

This is the export equivalent of the import's `return None`. You cannot write a Mastercam row without a valid `fld_mc_tool_type_id`. If your database has a tool with `tool_type="tap"` and your `_EXPORT_TYPE_MAP` has no entry for `"tap"`, the safest response is to skip it — rather than write an invalid `NULL` into a `NOT NULL` column.

Continue building the row dict:

```python
        material_id = _EXPORT_MATERIAL_MAP.get(tool.material, 1)
        # Default to 1 (Carbide) for materials not in the map.
        # Same policy as import: material is descriptive, not structural.

        return {
            "fld_mc_tool_type_id":  type_id,
            "fld_mc_tool_name":     tool.name,
            "fld_mc_tool_comment":  tool.notes,
            "fld_mc_tool_diameter": tool.diameter_inches,
            "fld_mc_corner_rad":    tool.corner_radius or 0.0,
            "fld_mc_flute_len":     tool.flute_length or 0.0,
            "fld_mc_overall_len":   0.0,   # your schema has no overall_length — safe default
            "fld_mc_num_flutes":    tool.flutes,
            "fld_mc_material":      material_id,
            "fld_mc_in_use":        1,     # always active on export
        }
```

Scan this dict and notice what each value comes from:

- `type_id` — decoded from your string to Mastercam's integer
- `tool.name`, `tool.notes` — direct passthrough
- `tool.corner_radius or 0.0` — your field uses `None` for "no radius"; Mastercam's field is `NOT NULL`, so you coerce `None` to `0.0`
- `fld_mc_overall_len: 0.0` — your schema has no overall length. `0.0` is the safe default; Mastercam will accept it even if it is not accurate
- `fld_mc_in_use: 1` — always `1` on export. You are exporting tools you want Mastercam to use

---

## Step 3 — The Export Function

```python
from tooldb.exporters.mastercam_exporter import _create_tooldb
from tooldb.schemas.tool_schemas import ToolRead


@dataclass
class ExportResult:
    total: int = 0
    exported: int = 0
    skipped: int = 0
    errors: list[str] = field(default_factory=list)

    def summary(self) -> str:
        parts = [f"Exported: {self.exported}/{self.total}"]
        if self.skipped:
            parts.append(f"Skipped: {self.skipped}")
        return ", ".join(parts)
```

The `ExportResult` mirrors `ImportResult` from Lesson 55. Symmetry here is deliberate — the Qt button handler can display both results the same way.

```python
def export_to_tooldb(tools: list[ToolRead], dest_path: str) -> ExportResult:
    result = ExportResult(total=len(tools))
    adapter = MastercamExportAdapter()

    try:
        conn = _create_tooldb(dest_path)
    except Exception as e:
        result.errors.append(f"Cannot create file: {e}")
        return result
```

This mirrors the import pipeline's structure: try to open the target file first. If it fails, return immediately with an error.

```python
    try:
        for tool in tools:
            row = adapter.to_mastercam_row(tool)
            if row is None:
                result.skipped += 1
                continue

            try:
                conn.execute("""
                    INSERT INTO dbo_ToolMgr_Tool (
                        fld_mc_tool_type_id, fld_mc_tool_name, fld_mc_tool_comment,
                        fld_mc_tool_diameter, fld_mc_corner_rad, fld_mc_flute_len,
                        fld_mc_overall_len, fld_mc_num_flutes, fld_mc_material, fld_mc_in_use
                    ) VALUES (
                        :fld_mc_tool_type_id, :fld_mc_tool_name, :fld_mc_tool_comment,
                        :fld_mc_tool_diameter, :fld_mc_corner_rad, :fld_mc_flute_len,
                        :fld_mc_overall_len, :fld_mc_num_flutes, :fld_mc_material, :fld_mc_in_use
                    )
                """, row)
                result.exported += 1
            except Exception as e:
                result.errors.append(f"Insert failed for '{tool.name}': {e}")

        conn.commit()
    finally:
        conn.close()

    return result
```

The named-parameter syntax (`:fld_mc_tool_type_id`) binds the dict values by key. This is safer than positional `?` markers — if you reorder the column list in the INSERT, the values still bind correctly because they are matched by name, not position.

Note `conn.commit()` is outside the loop — this is one transaction for the whole export, unlike the per-row commits in the import pipeline. Why the difference? Because you are writing to a new file. If the export fails halfway, the user just deletes the incomplete file and tries again. There is no partial state to reason about. One transaction per export is cleaner and faster.

---

## Step 4 — Wire the Qt Button

In `tooldb_ui/main.py`:

```python
from PySide6.QtWidgets import QFileDialog
from tooldb.exporters.mastercam_exporter import export_to_tooldb


def _on_export_mastercam(self):
    # Get the currently displayed tools (respects any active filter)
    tools = self._table_model.get_all_tools()

    if not tools:
        self.statusBar().showMessage("No tools to export.", 3000)
        return

    path, _ = QFileDialog.getSaveFileName(
        self, "Export to Mastercam Tool Library",
        "tools_export.tooldb", "Tool Library (*.tooldb)"
    )
    if not path:
        return

    result = export_to_tooldb(tools, path)
    self.statusBar().showMessage(result.summary(), 5000)
```

`getSaveFileName` prompts the user for a destination path and handles the "file already exists, overwrite?" dialog automatically. If the user cancels, `path` is an empty string.

The export operates on the currently displayed tools — if the user has filtered the table to show only carbide endmills, the export contains only those tools. Exporting what you see is intuitive and avoids exporting tools the user was not looking at.

---

## Step 5 — SAVE AND TRY: The Round-Trip Test

This is the most important test for any export feature: **export, then re-import, and compare what you get back to what you started with.**

```python
from tooldb.services.tool_service_orm import ToolService
from tooldb.exporters.mastercam_exporter import export_to_tooldb
from tooldb.importers.mastercam_importer import import_from_tooldb

# 1. Get tools from your database
tools = service.get_all_tools()

# 2. Export to a temp file
export_result = export_to_tooldb(tools, "round_trip_test.tooldb")
print(f"Exported: {export_result.summary()}")

# 3. Re-import from the temp file
import_result = import_from_tooldb("round_trip_test.tooldb", service)
# (These will all be duplicates — that's fine for the test)

# 4. Read the exported file directly and compare
import sqlite3
conn = sqlite3.connect("round_trip_test.tooldb")
conn.row_factory = sqlite3.Row
exported_rows = conn.execute("SELECT * FROM dbo_ToolMgr_Tool").fetchall()

print(f"\nOriginal tools: {len(tools)}")
print(f"Exported rows: {len(exported_rows)}")

# Check one tool in detail
for tool in tools[:1]:
    row = conn.execute(
        "SELECT * FROM dbo_ToolMgr_Tool WHERE fld_mc_tool_name = ?",
        (tool.name,)
    ).fetchone()
    print(f"\n{tool.name}:")
    print(f"  diameter: {tool.diameter_inches} → {row['fld_mc_tool_diameter']}")
    print(f"  material: {tool.material} → {row['fld_mc_material']}")
    print(f"  tool_type: {tool.tool_type} → {row['fld_mc_tool_type_id']}")
conn.close()
```

Run this. The diameter and type ID should survive perfectly. Now look at `overall_length`:

```python
print(f"  overall_len: (not in schema) → {row['fld_mc_flute_len']}")
```

You will see `0.0`. That field existed in Mastercam's schema, your schema has no equivalent, and you defaulted it to `0.0` on export. This is expected — but it means that if you re-import this exported file and Mastercam later reads it back, it will see overall_length as `0.0` rather than whatever it originally was. **The export is lossy for fields your schema does not capture.**

Knowing which fields are lossy is important. Write them down. For this project:
- `fld_mc_overall_len` — lost on export (defaulted to `0.0`)
- `fld_mc_point_angle` — only captured for drills; lost for other types

These are documented limitations, not bugs. A Mastercam user who exports and re-imports expects to see them. What they should NOT see is wrong data in a field that your schema does capture — diameter, name, type, material.

---

## Concept: File Versioning

Mastercam changes its `.tooldb` schema between major versions. A file created for Mastercam 2022 may not load in Mastercam 2024 if the schema changed. There is no published specification for this.

The practical response: **target a specific version, document it, and test against it.** In your exporter:

```python
# This exporter targets the dbo_ToolMgr_Tool schema as of Mastercam 2023.
# Verified against Mastercam 2023 Update 1 (tooldb schema version 9).
# If Mastercam adds NOT NULL columns in future versions, the INSERT will fail —
# update _SCHEMA_SQL and add the new field to to_mastercam_row().
```

That comment is not just good practice — it is a maintenance contract. When a user reports "the export stopped working after I upgraded Mastercam," you know exactly what changed: a new required field was added to the schema. You update `_SCHEMA_SQL` and `to_mastercam_row`, and you update the version comment.

Without the comment, you have no idea which version you targeted and no way to know what changed.

---

## Challenge

Add an `ExportSelectedDialog` to the Qt UI. Instead of exporting all displayed tools, allow the user to check which tools to include, then export only the checked ones. The dialog should show the tool name and type for each row.

<details>
<summary>Approach</summary>

The key piece: `QListWidget` with `setCheckState`. Populate it with one item per `ToolRead` in `self._table_model.get_all_tools()`. On accept, collect the tools whose items are `Qt.Checked`:

```python
from PySide6.QtWidgets import QDialog, QListWidget, QListWidgetItem, QDialogButtonBox, QVBoxLayout
from PySide6.QtCore import Qt
from tooldb.schemas.tool_schemas import ToolRead


class ExportSelectedDialog(QDialog):
    def __init__(self, tools: list[ToolRead], parent=None):
        super().__init__(parent)
        self._tools = tools
        self.setWindowTitle("Select Tools to Export")

        self._list = QListWidget()
        for tool in tools:
            item = QListWidgetItem(f"{tool.name}  ({tool.tool_type})")
            item.setCheckState(Qt.Checked)
            self._list.addItem(item)

        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)

        layout = QVBoxLayout(self)
        layout.addWidget(self._list)
        layout.addWidget(buttons)

    def selected_tools(self) -> list[ToolRead]:
        return [
            self._tools[i]
            for i in range(self._list.count())
            if self._list.item(i).checkState() == Qt.Checked
        ]
```

The index alignment between `self._tools[i]` and `self._list.item(i)` works because both lists are built from the same `tools` list in the same order. This is a fragile assumption — if items could be reordered or deleted from the list widget, you would need to store the `ToolRead` object directly on each `QListWidgetItem` using `item.setData(Qt.UserRole, tool)`.

</details>

---

## Final Check

| | |
|--|--|
| Export must guarantee valid output; import tolerates bad input | ✓ |
| Schema SQL created before any inserts; lookup tables seeded with `INSERT OR IGNORE` | ✓ |
| Reverse adapter maps strings → integers (opposite of import adapter) | ✓ |
| `NOT NULL` columns your schema lacks are filled with safe defaults | ✓ |
| Export uses one transaction; import uses per-row commits — and the reason for each | ✓ |
| Round-trip test reveals which fields are lossy | ✓ |
| Version comment documents which Mastercam version the schema targets | ✓ |

---

## Quick Check Answers

1. **Return `None` from the reverse adapter and skip the tool in the export loop** — the same signal as import. You cannot write a valid Mastercam row for a tool type you have no mapping for. Skipping is better than writing a row with a `NULL` in a `NOT NULL` column, which would either cause a database error or produce a malformed file.

2. **You hardcode `1`.** `fld_mc_in_use = 1` means "this tool is active in the library." You are only exporting tools the user chose to export — by definition, they want those tools to be active in Mastercam. There is no situation where you export a tool and set it inactive. The value is always `1`, so it is a constant in the row dict, not a field read from your schema.

3. Two likely reasons: **(a) a tool type your `_EXPORT_TYPE_MAP` does not cover** (e.g., `"tap"`) — the reverse adapter returns `None` and the tool is skipped. **(b) a name collision on re-import** — the import pipeline skips duplicates, so 50 exported tools would show as 50 skipped, not 48. The more likely scenario for losing 2 tools is that 2 tools had `tool_type` values with no export mapping. Check `export_result.skipped` to confirm.
