# Python Tool Database — LAB 30 — Batch Validation: Import the Good, Report the Bad

**Prerequisites:** Lab 29. You have `ValidationResult`, `ToolCreate`, `format_pydantic_errors`, and a `conventions` table. Now you extend validation to handle *lists* of records — the pattern needed for Mastercam import, CSV import, and any bulk operation.

**What this lab adds:**
- The batch validation pattern: validate every record independently, never stop on the first failure
- `ImportReport` — a structured result with imported count, error count, and per-record details
- `batch_import_tools` — the function that runs the batch
- Partial success: import the valid records, report the invalid ones separately
- Two levels of error collection: per-field (Pydantic) and per-record (the batch loop)

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A batch import receives 100 tool records. Record 47 is invalid (negative diameter). Should records 1–46 and 48–100 be imported? Why or why not?
> 2. An error message from a batch import says "diameter must be positive." What critical context is missing?
> 3. `batch_import_tools` returns an `ImportReport`. What three numbers should it always contain?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```python
# tooldb/validation.py (additions)
class ImportReport:
    total: int
    imported: int
    skipped: int
    errors: list[tuple[int, ValidationResult]]  # (row_index, result)

    def summary(self) -> str: ...


def batch_import_tools(
    records: list[dict],
    service: "ToolService",
) -> ImportReport: ...
```

New tests in `tests/test_batch_validation.py`.

---

## Step 1 — The Batch Import Pattern

A batch import works on a list of records. Each record is one potential database row. The batch loop:

1. Takes record 0, validates it, tries to import it
2. If import succeeds: increment `imported`
3. If validation fails: record the errors with the row index, increment `skipped`
4. Move to record 1. Repeat.
5. Return the `ImportReport` after all records are processed.

The critical rule: **never stop on a failed record.** The remaining records might all be valid. A tool importer that aborts at record 3 and forces the user to fix-and-retry-everything is frustrating and slow. Partial success is always better.

---

## Step 2 — RED: Tests for `ImportReport`

Add to `tests/test_batch_validation.py`:

```python
from tooldb.validation import ValidationResult, ImportReport


def test_import_report_summary_shows_counts():
    report = ImportReport(total=10, imported=8, skipped=2, errors=[])
    summary = report.summary()
    assert "10" in summary
    assert "8" in summary
    assert "2" in summary


def test_import_report_is_complete_success_when_no_errors():
    report = ImportReport(total=5, imported=5, skipped=0, errors=[])
    assert report.skipped == 0
    assert len(report.errors) == 0


def test_import_report_stores_row_index_and_result():
    result = ValidationResult()
    result.add_error("diameter_inches", "must be positive", value=-0.5)
    report = ImportReport(total=1, imported=0, skipped=1, errors=[(0, result)])

    row_index, row_result = report.errors[0]
    assert row_index == 0
    assert not row_result.is_valid
    assert any("diameter" in e for e in row_result.errors)
```

Run — fail with `ImportError`. Red step.

---

## Step 3 — GREEN: Build `ImportReport`

Add to `tooldb/validation.py`:

```python
from dataclasses import dataclass, field


@dataclass
class ImportReport:
    total: int
    imported: int
    skipped: int
    errors: list[tuple[int, "ValidationResult"]] = field(default_factory=list)

    def summary(self) -> str:
        parts = [f"Total: {self.total}", f"Imported: {self.imported}", f"Skipped: {self.skipped}"]
        if self.errors:
            parts.append(f"Errors: {len(self.errors)} records")
        return " | ".join(parts)
```

`@dataclass` generates `__init__`, `__repr__`, and `__eq__` automatically. The `field(default_factory=list)` creates a fresh list for each instance — never share a mutable default across instances.

Run the three tests — they pass.

---

## Step 4 — RED: Tests for `batch_import_tools`

```python
import sqlite3
import pytest
from tooldb.validation import batch_import_tools, ImportReport
from tooldb.repositories.tool_repository import ToolRepository
from tooldb.services.tool_service import ToolService


@pytest.fixture
def service(db_conn):
    repo = ToolRepository(db_conn)
    return ToolService(repo)


VALID_TOOL = {
    "name": "Mill-01",
    "diameter_inches": 0.5,
    "material": "carbide",
    "tool_type": "endmill",
}


def test_batch_import_all_valid_imports_all(service):
    records = [
        {"name": "Mill-01", "diameter_inches": 0.5, "material": "carbide", "tool_type": "endmill"},
        {"name": "Mill-02", "diameter_inches": 0.75, "material": "carbide", "tool_type": "endmill"},
        {"name": "Drill-01", "diameter_inches": 0.25, "material": "HSS", "tool_type": "drill"},
    ]
    report = batch_import_tools(records, service)
    assert report.total == 3
    assert report.imported == 3
    assert report.skipped == 0


def test_batch_import_one_invalid_skips_that_record(service):
    records = [
        {"name": "Mill-01", "diameter_inches": 0.5, "material": "carbide", "tool_type": "endmill"},
        {"name": "Bad Tool", "diameter_inches": -1.0, "material": "carbide", "tool_type": "endmill"},
        {"name": "Mill-02", "diameter_inches": 0.75, "material": "carbide", "tool_type": "endmill"},
    ]
    report = batch_import_tools(records, service)
    assert report.total == 3
    assert report.imported == 2
    assert report.skipped == 1


def test_batch_import_error_contains_row_index(service):
    records = [
        {"name": "Mill-01", "diameter_inches": 0.5, "material": "carbide", "tool_type": "endmill"},
        {"name": "Bad", "diameter_inches": -1.0, "material": "carbide", "tool_type": "endmill"},
    ]
    report = batch_import_tools(records, service)
    assert len(report.errors) == 1
    row_index, row_result = report.errors[0]
    assert row_index == 1  # the second record (index 1)
    assert not row_result.is_valid


def test_batch_import_error_contains_field_details(service):
    records = [
        {"name": "Bad", "diameter_inches": -0.5, "material": "unobtanium", "tool_type": "endmill"},
    ]
    report = batch_import_tools(records, service)
    row_index, row_result = report.errors[0]
    error_text = " ".join(row_result.errors)
    assert "diameter" in error_text or "material" in error_text


def test_batch_import_all_invalid_imports_none(service):
    records = [
        {"name": "", "diameter_inches": -1.0, "material": "bad", "tool_type": "endmill"},
        {"name": "", "diameter_inches": -2.0, "material": "bad", "tool_type": "endmill"},
    ]
    report = batch_import_tools(records, service)
    assert report.imported == 0
    assert report.skipped == 2


def test_batch_import_empty_list_returns_zero_counts(service):
    report = batch_import_tools([], service)
    assert report.total == 0
    assert report.imported == 0
    assert report.skipped == 0
```

Run — fails with `ImportError: cannot import name 'batch_import_tools'`. Red step.

---

## Step 5 — GREEN: Build `batch_import_tools`

Add to `tooldb/validation.py`:

```python
from pydantic import ValidationError as PydanticValidationError
from tooldb.schemas.tool_schema import ToolCreate


def batch_import_tools(records: list[dict], service) -> ImportReport:
    imported = 0
    skipped = 0
    errors: list[tuple[int, ValidationResult]] = []

    for index, record in enumerate(records):
        try:
            validated = ToolCreate(**record)
        except PydanticValidationError as exc:
            result = format_pydantic_errors(exc)
            errors.append((index, result))
            skipped += 1
            continue

        try:
            service.repo.insert(
                validated.name,
                validated.diameter_inches,
                validated.material,
                validated.tool_type,
                validated.flutes,
                validated.notes,
            )
            imported += 1
        except Exception as exc:
            result = ValidationResult()
            result.add_error("record", str(exc))
            errors.append((index, result))
            skipped += 1

    return ImportReport(
        total=len(records),
        imported=imported,
        skipped=skipped,
        errors=errors,
    )
```

A few things to note:
- `ToolCreate(**record)` unpacks the dict as keyword arguments. If the dict has extra keys Pydantic doesn't know about, it will raise by default. Add `model_config = ConfigDict(extra="ignore")` to `ToolCreate` if you want unknown fields silently dropped.
- The second `try/except` catches database-level errors (duplicate name, integrity error). These are not validation failures — they are import-time conflicts. They still produce an error record.
- We call `service.repo.insert` directly rather than `service.create_tool` because `create_tool` runs validation again (via `ToolCreate`) and we already validated. In Block 3 this will be refactored — the service layer will accept a pre-validated `ToolCreate` object.

Run the tests:

```
pytest tests/test_batch_validation.py -v
```

---

## Step 6 — REFACTOR: Error Messages Include Row Number

The `ImportReport` stores `(row_index, result)` pairs. When showing errors to the user, each error message should say "Row 2 — diameter_inches: must be positive". Update `summary()` to include this:

```python
@dataclass
class ImportReport:
    ...

    def summary(self) -> str:
        parts = [f"Total: {self.total}", f"Imported: {self.imported}", f"Skipped: {self.skipped}"]
        return " | ".join(parts)

    def error_lines(self) -> list[str]:
        lines = []
        for row_index, result in self.errors:
            for error in result.errors:
                lines.append(f"Row {row_index + 1} — {error}")  # +1 for 1-based display
        return lines
```

Write a test for `error_lines()`:

```python
def test_error_lines_include_row_number(service):
    records = [
        {"name": "Good", "diameter_inches": 0.5, "material": "carbide", "tool_type": "endmill"},
        {"name": "Bad", "diameter_inches": -1.0, "material": "carbide", "tool_type": "endmill"},
    ]
    report = batch_import_tools(records, service)
    lines = report.error_lines()
    assert len(lines) >= 1
    assert "Row 2" in lines[0]  # row_index=1, displayed as "Row 2"
    assert "diameter" in lines[0]
```

---

## Step 7 — SAVE AND TRY

```
pytest -v
```

Then test the batch import manually:

```python
python -c "
import sqlite3
from tooldb.repositories.tool_repository import ToolRepository
from tooldb.services.tool_service import ToolService
from tooldb.validation import batch_import_tools
from tooldb.schema import TOOLS_TABLE_SQL

conn = sqlite3.connect(':memory:')
conn.execute(TOOLS_TABLE_SQL)
conn.commit()

repo = ToolRepository(conn)
service = ToolService(repo)

records = [
    {'name': 'Mill-01', 'diameter_inches': 0.5, 'material': 'carbide', 'tool_type': 'endmill'},
    {'name': 'Bad Tool', 'diameter_inches': -1.0, 'material': 'bad', 'tool_type': 'endmill'},
    {'name': 'Drill-01', 'diameter_inches': 0.25, 'material': 'HSS', 'tool_type': 'drill'},
]

report = batch_import_tools(records, service)
print(report.summary())
for line in report.error_lines():
    print(' ', line)
"
```

Expected output:
```
Total: 3 | Imported: 2 | Skipped: 1
  Row 2 — diameter_inches: must be a positive number, got -1.0
  Row 2 — material: must be one of: HSS, carbide, cobalt, got: 'bad'
```

---

## Challenge

Add a `with_index` parameter to the error report so the row number shown in error messages matches the actual index in the source file (which might be 1-based CSV row numbers, not 0-based Python indices):

```python
def batch_import_tools(
    records: list[dict],
    service,
    start_index: int = 1,  # 1 means row 1 for the first record
) -> ImportReport:
```

Update `error_lines()` to use the start_index when displaying row numbers. Write the test first.

<details>
<summary>Answer</summary>

**Test:**
```python
def test_batch_import_start_index_affects_error_line_numbers(service):
    records = [{"name": "Bad", "diameter_inches": -1.0, "material": "carbide", "tool_type": "endmill"}]
    report = batch_import_tools(records, service, start_index=5)
    lines = report.error_lines(start_index=5)
    assert "Row 5" in lines[0]
```

**Implementation:**

Pass `start_index` to `error_lines`:

```python
def error_lines(self, start_index: int = 1) -> list[str]:
    lines = []
    for row_index, result in self.errors:
        display_row = row_index + start_index
        for error in result.errors:
            lines.append(f"Row {display_row} — {error}")
    return lines
```

The `batch_import_tools` function itself does not need `start_index` — `ImportReport` stores the Python 0-based index, and `error_lines()` applies the offset at display time.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Explain why batch import should never abort on a failed record | |
| Build an `ImportReport` with total, imported, skipped, and per-error details | |
| Write a `batch_import_tools` function using enumerate | |
| Handle both Pydantic validation failures and database errors in the batch loop | |
| Format error messages with row numbers for user display | |
| Test partial success: some records import, some are skipped, with detailed error info | |

---

## Quick Check Answers

1. **Yes — records 1–46 and 48–100 should import.** They are valid. The user should not be forced to re-upload everything because of one bad record. Partial success means fewer re-import cycles and a much better user experience. The `ImportReport` tells the user exactly which records failed so they can fix just those.

2. **The row number is missing.** In a batch of 100 records, "diameter must be positive" tells you the rule but not *which record* to fix. The complete message must be: "Row 47 — diameter_inches: must be a positive number, got: -0.5". The user can then look up row 47 in their source file and correct it.

3. **Total, imported, skipped.** These three numbers always add up: `imported + skipped == total`. They give an instant summary: 97 imported, 3 skipped = 97% success rate, 3 records to fix.
