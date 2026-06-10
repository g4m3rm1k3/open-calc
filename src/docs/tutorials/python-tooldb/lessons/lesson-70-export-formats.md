# Python Tool Database — LAB 70 — Export to CSV, JSON, and Mastercam

**Prerequisites:** Lab 56 (Mastercam export adapter). Lab 52 (ToolService). You can export to a `.tooldb` file. This lesson adds CSV and JSON exports and unifies all three under one menu.

**What this lab adds:**
- `csv.DictWriter` — writing dicts as rows in a CSV file
- `json.dump()` with custom serialization for datetime and Decimal
- `QFileDialog.getSaveFileName()` with multiple format filters
- An `ExportService` that dispatches to the correct format

**Time:** 40–50 minutes

---

## What You Will Build

A "File → Export As..." menu with three formats. The user picks a format and a save path:

```
Export As
  ├── CSV Spreadsheet (.csv)
  ├── JSON (.json)
  └── Mastercam ToolDB (.tooldb)
```

Each format produces a file the user can open in another application.

---

> **Quick Check — try to answer before reading:**
>
> 1. `json.dump()` raises `TypeError: Object of type datetime is not JSON serializable`. What does that mean, and what do you need to supply to fix it?
> 2. CSV has no concept of a NULL value. A tool with no `material` field would write what into the CSV cell?
> 3. You have three export formats. One function with three `if` branches, or three separate functions called via dispatch? Which is easier to extend when a fourth format is added?
>
> *(Answers at the end of this lab)*

---

## Concept: `csv.DictWriter`

**What it is:** A Python standard library class that writes dictionaries as rows in a CSV file, using a list of field names as the column headers.

**The problem before:** Building CSV manually:

```python
rows = [["name", "tool_type", "diameter"]]    # header
for tool in tools:
    rows.append([tool.name, tool.tool_type, str(tool.diameter or "")])

with open("tools.csv", "w") as f:
    for row in rows:
        f.write(",".join(row) + "\n")   # BUG: breaks if any value contains a comma
```

Commas inside values break the file. Quotes inside values break it worse. You are reimplementing CSV quoting logic, which has edge cases that take hours to get right.

**The solution:**

```python
import csv

with open("tools.csv", "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "tool_type", "diameter"])
    writer.writeheader()                        # writes the column names
    writer.writerow({"name": "EM-0500", "tool_type": "endmill", "diameter": 6.0})
```

`DictWriter` handles quoting, escaping, and line endings correctly for every value.

**What it hides:** RFC 4180 CSV quoting rules — values containing commas are quoted, values containing quotes have the quotes doubled, line endings are `\r\n` by default. You write dicts; `DictWriter` handles all of this.

**The protected invariant:** The output is valid CSV that any spreadsheet application can open. Values with commas, quotes, or newlines are correctly escaped.

**Why `newline=""`:** Python's built-in line ending handling conflicts with the CSV module's own line ending logic. Passing `newline=""` to `open()` disables Python's translation and lets the CSV module control line endings — preventing double `\r\r\n` on Windows.

**Why `encoding="utf-8-sig"`:** Excel opens UTF-8 CSV files correctly only when the file has a BOM (byte order mark). `utf-8-sig` adds the BOM. For non-Excel consumers (databases, scripts), plain `utf-8` is cleaner. Know your audience.

**You will see this again in:** Data pipelines, reports, spreadsheet exports, log analysis tools. CSV is the lowest-common-denominator exchange format for structured data. Python's `csv` module is in every data-related job description.

---

## Step 1 — CSV Export

Create `tooldb/exporters/csv_exporter.py`:

```python
import csv
from pathlib import Path
from tooldb.schemas.tool_schemas import ToolRead

COLUMNS = ["id", "name", "tool_type", "diameter", "flute_count", "material", "source_file"]
# Explicit column list — controls both the header and the order.
# If ToolRead gains new fields, they do not appear automatically (intentional).
```

```python
def export_to_csv(tools: list[ToolRead], output_path: str | Path) -> int:
    """
    Writes tools to a CSV file. Returns the number of rows written.
    Each ToolRead field listed in COLUMNS becomes one CSV column.
    None values become empty strings.
    """
    output_path = Path(output_path)

    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS, extrasaction="ignore")
        # extrasaction="ignore": if a ToolRead has fields NOT in COLUMNS, ignore them
        # (the alternative is "raise", which would error on extra fields)
        writer.writeheader()

        for tool in tools:
            row = {col: getattr(tool, col, None) for col in COLUMNS}
            # Convert None to "" — CSV has no null concept
            row = {k: ("" if v is None else v) for k, v in row.items()}
            writer.writerow(row)

    return len(tools)
```

`{col: getattr(tool, col, None) for col in COLUMNS}` — builds a dict for each tool. `getattr(tool, col, None)` reads the attribute `col` from the `ToolRead` object, returning `None` if it doesn't exist. This is the same `getattr` pattern from Lab 52's `ToolTableModel`.

### SAVE AND TRY

```python
from tooldb.exporters.csv_exporter import export_to_csv
from tooldb.schemas.tool_schemas import ToolRead

tools = [
    ToolRead(id=1, name="EM-0600", tool_type="endmill", diameter=6.0),
    ToolRead(id=2, name="DRL,08",  tool_type="drill",   diameter=8.0),
    # ↑ comma in the name — this tests that DictWriter quotes it correctly
]

count = export_to_csv(tools, "test_export.csv")
print(f"Exported {count} tools")

# Verify the output:
with open("test_export.csv", encoding="utf-8-sig") as f:
    print(f.read())
```

**You should see:**
```
Exported 2 tools
id,name,tool_type,diameter,flute_count,material,source_file
1,EM-0600,endmill,6.0,,, 
2,"DRL,08",drill,8.0,,,
```

The name `"DRL,08"` is quoted because it contains a comma. Without `csv.DictWriter`, this would have broken any downstream reader.

**Change something:** Remove `extrasaction="ignore"`. Add `extra_field="test"` to one of the row dicts manually. You should get `ValueError: dict contains fields not in fieldnames`. Change it back.

---

## Concept: `json.dump()` with a Custom Encoder

**What it is:** A way to serialize objects that Python's JSON library does not know how to handle — `datetime`, `Decimal`, custom classes — by providing a converter function.

**The problem before:**

```python
import json
from datetime import datetime

data = {"name": "EM-0500", "created_at": datetime.now()}
json.dumps(data)   # TypeError: Object of type datetime is not JSON serializable
```

JSON knows only: strings, numbers, booleans, null, arrays, and objects. `datetime` is none of these.

**The solution:** Pass a `default` function to `json.dump()`. When the encoder encounters an unknown type, it calls `default(obj)` and uses the return value instead:

```python
def json_default(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()    # "2026-05-21T14:30:22"
    raise TypeError(f"Cannot serialize {type(obj)}")

json.dumps(data, default=json_default)
# Output: '{"name": "EM-0500", "created_at": "2026-05-21T14:30:22"}'
```

**Watch for:** The `default` function must raise `TypeError` for types it cannot handle — not return `None`. Returning `None` would silently serialize the value as `null`, hiding the problem. Raising `TypeError` surfaces the issue immediately.

---

## Step 2 — JSON Export

Create `tooldb/exporters/json_exporter.py`:

```python
import json
from pathlib import Path
from datetime import datetime
from decimal import Decimal
from tooldb.schemas.tool_schemas import ToolRead
```

```python
def _json_default(obj):
    """Handles types that json.dump cannot serialize by default."""
    if isinstance(obj, datetime):
        return obj.isoformat()          # "2026-05-21T14:30:22"
    if isinstance(obj, Decimal):
        return float(obj)               # Decimal("6.35") → 6.35
    raise TypeError(f"Cannot serialize {type(obj).__name__}: {obj!r}")
```

```python
def export_to_json(tools: list[ToolRead], output_path: str | Path) -> int:
    """
    Writes tools to a JSON file as an array of objects.
    Returns the number of tools written.
    """
    output_path = Path(output_path)

    records = [tool.model_dump() for tool in tools]
    # model_dump() returns a dict of all fields — from Pydantic v2 (Lab 50)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, default=_json_default)

    return len(tools)
```

`indent=2` produces human-readable JSON with 2-space indentation. For machine-to-machine exchange, `indent=None` produces compact single-line JSON — smaller files, unreadable by humans.

### SAVE AND TRY

```python
from tooldb.exporters.json_exporter import export_to_json
from tooldb.schemas.tool_schemas import ToolRead

tools = [
    ToolRead(id=1, name="EM-0600", tool_type="endmill", diameter=6.0),
]
export_to_json(tools, "test_export.json")

with open("test_export.json") as f:
    print(f.read())
```

**You should see:**
```json
[
  {
    "id": 1,
    "name": "EM-0600",
    "tool_type": "endmill",
    "diameter": 6.0,
    "flute_count": null,
    "material": null
  }
]
```

**Change something:** Change `indent=2` to `indent=None`. The output becomes one line: `[{"id": 1, "name": "EM-0600", ...}]`. Change it back.

---

## Concept: Data-Driven Dispatch

**What it is:** Choosing which function to call based on a lookup in a data structure (a dict or list) rather than through a chain of `if`/`elif` branches.

**The problem before:**

```python
def export(tools, path, fmt):
    if fmt == "csv":
        export_to_csv(tools, path)
    elif fmt == "json":
        export_to_json(tools, path)
    elif fmt == "mastercam":
        export_to_mastercam(tools, path)
    # Adding a fourth format: add an elif here — modify this function
```

Every new format requires editing `export()`. The function grows without bound. Testing it means testing every branch.

**The solution:** Use a dict that maps each format value to the function that handles it:

```python
DISPATCHERS = {
    "csv":       export_to_csv,
    "json":      export_to_json,
    "mastercam": export_to_mastercam,
}

def export(tools, path, fmt):
    fn = DISPATCHERS[fmt]
    return fn(tools, path)
```

Adding a fourth format: add one entry to `DISPATCHERS`. The `export()` function never changes.

**What it hides:** The branching logic — it moves from `if`/`elif` in a function to key-value pairs in a dict. The dict IS the dispatch table.

**The protected invariant:** `export()` is closed for modification and open for extension. You add new formats by adding to the dict, not by editing existing code.

**You will see this again in:** Command parsers (map command name to handler function), event systems (map event type to callback), protocol handlers (map message type to decoder). Any time you find yourself writing a long `if/elif` chain that selects between callables, a dispatch dict is the refactor.

---

## Step 3 — The ExportService Dispatcher

Create `tooldb/exporters/export_service.py`:

```python
from enum import Enum, auto
from pathlib import Path
from tooldb.schemas.tool_schemas import ToolRead
from tooldb.exporters.csv_exporter  import export_to_csv
from tooldb.exporters.json_exporter import export_to_json


class ExportFormat(Enum):
    CSV      = auto()
    JSON     = auto()
    MASTERCAM = auto()


_DISPATCHERS = {
    ExportFormat.CSV:       export_to_csv,
    ExportFormat.JSON:      export_to_json,
    ExportFormat.MASTERCAM: None,   # filled in below — circular import if defined here
}
```

`_DISPATCHERS` is a dict from format to function — the data-driven dispatch pattern. Adding a fourth format means adding one enum value and one dict entry — not modifying existing code.

```python
def export_tools(tools: list[ToolRead], path: str | Path,
                 fmt: ExportFormat, service=None) -> int:
    """
    Exports tools to the given path in the requested format.
    Returns the number of tools exported.
    service: required only for MASTERCAM format (needs the ORM layer).
    """
    if fmt == ExportFormat.MASTERCAM:
        from tooldb.exporters.mastercam_exporter import export_to_mastercam
        return export_to_mastercam(tools, path, service)

    fn = _DISPATCHERS.get(fmt)
    if fn is None:
        raise ValueError(f"Unknown export format: {fmt}")
    return fn(tools, path)
```

The Mastercam case is imported lazily (inside the function) because `mastercam_exporter` imports `ToolService`, which imports from the ORM layer — a circular import if pulled in at module load time. Lazy imports inside the function break the cycle.

### SAVE AND TRY

```python
from tooldb.exporters.export_service import ExportFormat, export_tools
from tooldb.schemas.tool_schemas import ToolRead

tools = [ToolRead(id=1, name="EM-0600", tool_type="endmill", diameter=6.0)]

export_tools(tools, "test.csv",  ExportFormat.CSV)
export_tools(tools, "test.json", ExportFormat.JSON)

print("Both exports written")
```

**You should see:**
```
Both exports written
```

---

## Step 4 — File Dialogs for Each Format

In the main window, connect the menu actions:

```python
from PySide6.QtWidgets import QFileDialog

def _on_export_csv(self) -> None:
    path, _ = QFileDialog.getSaveFileName(
        self, "Export as CSV",
        "tools_export.csv",
        "CSV Files (*.csv)"
    )
    if path:
        tools = self._service.get_all_tools()
        export_tools(tools, path, ExportFormat.CSV)

def _on_export_json(self) -> None:
    path, _ = QFileDialog.getSaveFileName(
        self, "Export as JSON",
        "tools_export.json",
        "JSON Files (*.json)"
    )
    if path:
        tools = self._service.get_all_tools()
        export_tools(tools, path, ExportFormat.JSON)

def _on_export_mastercam(self) -> None:
    path, _ = QFileDialog.getSaveFileName(
        self, "Export as Mastercam ToolDB",
        "tools_export.tooldb",
        "Mastercam ToolDB (*.tooldb)"
    )
    if path:
        tools = self._service.get_all_tools()
        export_tools(tools, path, ExportFormat.MASTERCAM, service=self._service)
```

---

## 🎯 Challenge: Export Only Filtered Tools

**You know:** `ToolFilterProxy` from Lab 67 has `proxy.rowCount()` for the filtered count. `proxy.mapToSource()` converts a proxy index to a source index.

**Task:** Add a checkbox to the export dialog: "Export filtered tools only." When checked, export only the tools currently visible in the proxy (respecting active filters). When unchecked, export all tools regardless of filters.

**Hint:** You can get the visible tools by iterating `proxy.rowCount()` and calling `proxy.data()` for each row, OR by collecting the `ToolRead` objects from the source model for each mapped row.

**Starting code:**

```python
def _get_tools_to_export(self, filtered_only: bool) -> list[ToolRead]:
    if not filtered_only:
        return self._service.get_all_tools()

    # Collect visible tools from the proxy:
    tools = []
    for proxy_row in range(self._proxy.rowCount()):
        source_index = self._proxy.mapToSource(
            self._proxy.index(proxy_row, 0)
        )
        tool = self._model.tool_at_row(source_index.row())   # add this helper to ToolTableModel
        tools.append(tool)
    return tools
```

---

<details>
<summary>▶ Show Solution</summary>

Add to `ToolTableModel`:

```python
def tool_at_row(self, row: int) -> ToolRead:
    return self._tools[row]
```

In `_get_tools_to_export`:

```python
def _get_tools_to_export(self, filtered_only: bool) -> list[ToolRead]:
    if not filtered_only:
        return self._service.get_all_tools()

    tools = []
    for proxy_row in range(self._proxy.rowCount()):
        source_index = self._proxy.mapToSource(self._proxy.index(proxy_row, 0))
        tools.append(self._model.tool_at_row(source_index.row()))
    return tools
```

**Key insight:** `mapToSource()` converts a proxy row index to a source model row index. This is the proxy's primary job — translating between two numbering systems. After `mapToSource()`, you use the source model to retrieve the actual data. The export function never needs to know whether the tools came from a filter or from the full database — it just receives `list[ToolRead]`.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| CSV export: comma in value is quoted | Export a tool named "EM,0600" — check the CSV file wraps it in quotes |
| CSV export: None becomes empty string | Export a tool with no material — CSV cell is empty, not "None" |
| JSON export: valid JSON | Open the file in a JSON viewer or run `json.load(open("test.json"))` |
| JSON export: datetime fields serialize | If any ToolRead has a datetime field, confirm it serializes as ISO string |
| `ExportFormat` dispatcher calls correct function | Add a print to each exporter, check which fires for each format |

---

## Quick Check Answers

**1. `TypeError: Object of type datetime is not JSON serializable` — what does it mean?**
Python's JSON library knows how to serialize six types: `str`, `int`, `float`, `bool`, `None`, and `list`/`dict` containing those types. `datetime` is not on the list. When `json.dump()` encounters a `datetime` object, it does not know what string to produce — should it be ISO format? Unix timestamp? RFC 822? The library refuses to guess. You supply a `default` function that makes the decision: `return obj.isoformat()` for "I want ISO 8601 format."

**2. What does CSV write for a `None` value?**
By default, `csv.DictWriter` writes `None` as the string `"None"`. That is almost never what you want — a spreadsheet user would see the literal text "None" in the cell instead of an empty cell. The fix is to convert `None` to `""` before writing, which produces an empty cell in the CSV. This is done explicitly: `"" if v is None else v`.

**3. One function with `if` branches, or three separate functions with dispatch?**
Separate functions with dispatch. A single function with `if fmt == "csv": ... elif fmt == "json": ...` grows with each new format — you modify existing code every time. With dispatch, adding a fourth format means: add an enum value, add a function, add one entry to the dict. Existing code is not modified. This is the Open/Closed Principle again: open for extension (add new function), closed for modification (don't change the dispatcher logic). The dict IS the dispatch logic.
