# Python Tool Database — LAB 54 — The Mastercam Adapter

**Prerequisites:** Lab 53. You have a mapping table: Mastercam column → your schema field, with notes on lookups, unit concerns, and filter conditions. This lesson writes the Transform step — the code that takes a raw Mastercam row and produces a `ToolCreate` Pydantic schema.

The class you will build is called `MastercamAdapter`. By the end of this lesson you will understand why it is its own class, why it is tested in isolation, and what happens when Mastercam's data does not fit cleanly into your schema.

**What this lab teaches:**
- The Adapter design pattern — what it means, why it exists, when to use it
- Writing a transform function that converts between two schemas
- Handling mismatches: missing fields, type differences, value constraints
- Testing with real data shapes before touching the database
- The difference between an error you can skip vs one that stops everything

**Time:** 55–65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You decide to write the import as one function: read from Mastercam, validate, insert into your database — all in sequence. What happens when Mastercam's schema changes in the next version?
> 2. `MastercamAdapter.to_tool_create(row)` returns a `ToolCreate | None`. Why `None` instead of raising an exception?
> 3. You import 50 tools and tool 17 has `fld_mc_tool_type_id = 99` — an ID not in your `type_map`. Do you crash the import, skip tool 17, or ask the user?
>
> *(Answers at the end)*

---

## The Adapter Pattern

In Lesson 39, you learned that `EndMill` and `Drill` both speak the `Tool` interface. An adapter is the same idea applied between two *systems* rather than two *classes*: one side speaks Mastercam's language (column names, integer IDs, nullable fields); the other side speaks your language (`ToolCreate`, validated, structured).

The adapter sits in between. It knows Mastercam's format AND your format. Nothing else in your application needs to know about Mastercam's column names. If Mastercam changes its schema in the next version, you update the adapter — one file. Your service layer, your repository, your UI: none of them change.

```
Mastercam Row (dict)
        ↓
  MastercamAdapter.to_tool_create()
        ↓
  ToolCreate (validated, your schema)
        ↓
  ToolService.create_tool()
        ↓
  Database
```

The adapter is a translation layer. Its entire job is: "I speak both languages."

---

## Step 1 — Start Small: Name and Diameter

Create `tooldb/adapters/mastercam_adapter.py`. Start with just two fields — the ones you are most confident about:

```python
from tooldb.schemas.tool_schemas import ToolCreate


class MastercamAdapter:
    def to_tool_create(self, row: dict) -> ToolCreate | None:
        name = row.get("fld_mc_tool_name")
        diameter = row.get("fld_mc_tool_diameter")

        if not name or diameter is None:
            return None   # can't import a nameless or dimensionless tool

        return ToolCreate(
            name=name,
            diameter_inches=diameter,
            material="carbide",   # placeholder — we'll fix this next
            tool_type="endmill",  # placeholder — we'll fix this next
        )
```

Three things happening here:

First: `row.get(key)` instead of `row[key]`. The `.get()` method returns `None` if the key doesn't exist, rather than raising `KeyError`. External data may have missing keys — `.get()` is safer than direct access.

Second: early `return None` for records that can't be imported. A tool with no name or no diameter is not a recoverable error — there is no way to fill in the missing information. Returning `None` signals "skip this record."

Third: hardcoded placeholders. You build the smallest version that can run, then replace the placeholders one by one. This way each addition is testable.

**Run it now.** Before adding anything else:

```python
adapter = MastercamAdapter()
row = {"fld_mc_tool_name": "1/2 FLAT ENDMILL", "fld_mc_tool_diameter": 0.5}
result = adapter.to_tool_create(row)
print(result)
```

You should get a `ToolCreate` with `name="1/2 FLAT ENDMILL"` and `diameter_inches=0.5`. The material and tool_type are wrong, but the structure works. That is your green state before the next step.

---

## Step 2 — Decode the Tool Type

The `fld_mc_tool_type_id` column holds integers. You built the `type_map` dict in Lesson 53. Add it to the adapter:

```python
_TYPE_MAP = {
    1: "endmill",
    2: "drill",
    3: "facemill",
    4: "turntool",
}
```

This dict is declared at module level (outside the class) because it is a constant — the mapping does not change per-instance. In the method:

```python
type_id = row.get("fld_mc_tool_type_id")
tool_type = _TYPE_MAP.get(type_id)

if tool_type is None:
    return None  # unknown tool type — cannot import
```

`_TYPE_MAP.get(type_id)` returns `None` for any ID not in the map — including the `None` you get from `row.get()` when the column is missing entirely. Both cases result in `return None`: you cannot import a tool whose type you cannot identify.

**Try to make it fail:** what if `type_id = 99`? Run this:

```python
row = {"fld_mc_tool_name": "MYSTERY", "fld_mc_tool_diameter": 0.5, "fld_mc_tool_type_id": 99}
result = adapter.to_tool_create(row)
print(result)   # None — skipped
```

That is the correct behavior for a tool of unknown type. In the next lesson, the import pipeline will count how many tools were skipped and for what reason.

---

## Step 3 — Decode the Material

Same pattern as tool type — integer ID, lookup table, unknown means skip:

```python
_MATERIAL_MAP = {
    1: "carbide",
    2: "HSS",
    3: "cobalt",
}
```

In the method:

```python
material_id = row.get("fld_mc_material")
material = _MATERIAL_MAP.get(material_id, "carbide")  # default to carbide if unknown
```

Notice the difference: for `tool_type`, an unknown value causes a skip (`return None`). For `material`, an unknown value falls back to `"carbide"`. These are different policy decisions:

- **Tool type** is structural — you need to know what kind of tool it is to set up the right fields. You cannot make a meaningful `ToolCreate` without it.
- **Material** is descriptive — it is metadata, not structure. If Mastercam has a material code you haven't mapped, importing the tool with a default material is better than skipping it entirely.

The adapter is where you make these decisions explicitly. Document them:

```python
# Default to "carbide" for unmapped material codes.
# Better to import with a wrong material than to skip the tool entirely —
# the user can correct material in the UI. Skipping silently loses the tool.
material = _MATERIAL_MAP.get(material_id, "carbide")
```

---

## Step 4 — Handle the Filter Condition

In Lesson 53 you noticed `fld_mc_in_use = 0` for inactive (deleted) tools. Add this check before anything else in the method:

```python
if not row.get("fld_mc_in_use", 1):
    return None   # tool marked inactive in Mastercam — skip
```

`row.get("fld_mc_in_use", 1)` has a default of `1` — if the column doesn't exist (older Mastercam version), treat the tool as active. Mastercam added this column partway through its history; older files may not have it. The default-to-active behavior is the safe assumption.

---

## Step 5 — Type-Specific Fields

Mastercam stores all tool fields in one table regardless of type. When you read a drill row, `fld_mc_corner_rad` exists but holds `0.0` — exactly like your single-table inheritance design. Map the type-specific fields conditionally:

```python
corner_radius = None
helix_angle = None
point_angle = None

if tool_type == "endmill":
    corner_radius = row.get("fld_mc_corner_rad") or 0.0
    # fld_mc_helix_angle doesn't exist in our sample; add if your file has it

elif tool_type == "drill":
    point_angle = row.get("fld_mc_point_angle")
```

`row.get("fld_mc_corner_rad") or 0.0` handles two cases at once: if the column is missing (returns `None`) or if the column is `0.0`, both result in `0.0`. This is safe because a corner radius of exactly zero is meaningful — it means "sharp corner, no radius."

---

## Step 6 — The Complete Adapter

```python
from tooldb.schemas.tool_schemas import ToolCreate


_TYPE_MAP = {
    1: "endmill",
    2: "drill",
    3: "facemill",
    4: "turntool",
}

_MATERIAL_MAP = {
    1: "carbide",
    2: "HSS",
    3: "cobalt",
}


class MastercamAdapter:

    def to_tool_create(self, row: dict) -> ToolCreate | None:
        # Filter out inactive tools
        if not row.get("fld_mc_in_use", 1):
            return None

        # Required fields — skip if missing
        name = row.get("fld_mc_tool_name")
        diameter = row.get("fld_mc_tool_diameter")
        type_id = row.get("fld_mc_tool_type_id")

        if not name or diameter is None:
            return None

        tool_type = _TYPE_MAP.get(type_id)
        if tool_type is None:
            return None

        # Material — default if unmapped
        material_id = row.get("fld_mc_material")
        material = _MATERIAL_MAP.get(material_id, "carbide")

        # Sanity check: diameters > 4 inches are suspicious (probably mm)
        if diameter > 4.0:
            diameter = diameter / 25.4   # convert mm to inches

        # Type-specific fields
        corner_radius = None
        point_angle = None
        flutes = row.get("fld_mc_num_flutes")

        if tool_type == "endmill":
            corner_radius = row.get("fld_mc_corner_rad") or 0.0
        elif tool_type == "drill":
            point_angle = row.get("fld_mc_point_angle")

        return ToolCreate(
            name=name,
            diameter_inches=diameter,
            material=material,
            tool_type=tool_type,
            flutes=flutes,
            notes=row.get("fld_mc_tool_comment"),
            corner_radius=corner_radius,
            point_angle=point_angle,
        )
```

The diameter sanity check sits between reading the raw value and using it. It does not assert or raise — it corrects. Whether this is the right policy depends on your situation. If you want to flag the unit mismatch rather than silently correct it, return `None` and let the import pipeline log a warning. For now, silent conversion is a reasonable default.

---

## Step 7 — Tests That Matter

The adapter is a pure function: dict in, `ToolCreate | None` out. No database, no session, no file I/O. That makes it easy to test comprehensively:

```python
import pytest
from tooldb.adapters.mastercam_adapter import MastercamAdapter


@pytest.fixture
def adapter():
    return MastercamAdapter()


def _endmill_row(**overrides):
    base = {
        "fld_mc_tool_name": "TEST ENDMILL",
        "fld_mc_tool_diameter": 0.5,
        "fld_mc_tool_type_id": 1,
        "fld_mc_material": 1,
        "fld_mc_corner_rad": 0.0,
        "fld_mc_num_flutes": 4,
        "fld_mc_in_use": 1,
    }
    base.update(overrides)
    return base


def test_converts_endmill(adapter):
    result = adapter.to_tool_create(_endmill_row())
    assert result is not None
    assert result.name == "TEST ENDMILL"
    assert result.diameter_inches == 0.5
    assert result.tool_type == "endmill"
    assert result.material == "carbide"
    assert result.flutes == 4


def test_inactive_tool_skipped(adapter):
    result = adapter.to_tool_create(_endmill_row(fld_mc_in_use=0))
    assert result is None


def test_unknown_type_skipped(adapter):
    result = adapter.to_tool_create(_endmill_row(fld_mc_tool_type_id=99))
    assert result is None


def test_missing_name_skipped(adapter):
    result = adapter.to_tool_create(_endmill_row(fld_mc_tool_name=None))
    assert result is None


def test_suspicious_diameter_converted(adapter):
    # 12.7 mm should be treated as 0.5 inches
    result = adapter.to_tool_create(_endmill_row(fld_mc_tool_diameter=12.7))
    assert result is not None
    assert abs(result.diameter_inches - 0.5) < 0.001


def test_unknown_material_defaults_to_carbide(adapter):
    result = adapter.to_tool_create(_endmill_row(fld_mc_material=999))
    assert result is not None
    assert result.material == "carbide"
```

The `_endmill_row(**overrides)` helper is the key technique here. You define a known-good row as the default, then override individual fields to test one decision at a time. Each test changes exactly one thing and asserts exactly one behavior. That is the discipline that makes tests useful rather than ceremonial.

---

## Step 8 — SAVE AND TRY

**Test against your actual .tooldb file.** Read all rows from `dbo_ToolMgr_Tool`, run each through the adapter, and print a summary:

```python
import sqlite3
from tooldb.adapters.mastercam_adapter import MastercamAdapter

conn = sqlite3.connect("sample_mastercam.tooldb")
conn.row_factory = sqlite3.Row
adapter = MastercamAdapter()

rows = conn.execute("SELECT * FROM dbo_ToolMgr_Tool").fetchall()
tool_creates = []
skipped = []

for row in rows:
    result = adapter.to_tool_create(dict(row))
    if result is None:
        skipped.append(row["fld_mc_tool_name"])
    else:
        tool_creates.append(result)

print(f"Converted: {len(tool_creates)}")
print(f"Skipped:   {len(skipped)}")
for name in skipped:
    print(f"  skipped: {name}")
```

**Deliberately break one row.** In the sample database, change one `fld_mc_tool_type_id` to `99` by hand using the DB Browser for SQLite (a free GUI for SQLite files). Run the script again. That tool should appear in the "skipped" list.

---

## Concept: Why Separate the Adapter from the Service

You could write the import logic directly in the service: read Mastercam rows, transform, save. The problem is that Mastercam's schema is now woven into the service. If you add a second source — XML, CSV, another vendor's format — the service grows a new branch for each format.

The adapter isolates the format knowledge. Your service knows nothing about where data came from. It accepts `ToolCreate` and saves it. Whether that `ToolCreate` came from the UI, from a Mastercam `.tooldb`, or from a CSV file is not the service's concern.

This is the same principle as the hexagonal architecture from Lesson 00f: your domain and service are the center; adapters (Mastercam, XML, Qt UI, REST API) live on the outside. Each adapter translates an external format into the domain's language.

---

## Final Check

| | |
|--|--|
| The adapter translates Mastercam columns → `ToolCreate` fields | ✓ |
| `return None` signals "skip this record, don't crash" | ✓ |
| Integer lookup columns decode through a `_TYPE_MAP` or `_MATERIAL_MAP` dict | ✓ |
| Skip vs default vs convert: three different policies for handling mismatches | ✓ |
| The adapter is testable in isolation — no database, no file needed | ✓ |
| `_endmill_row(**overrides)` pattern for focused, single-decision tests | ✓ |

---

## Quick Check Answers

1. **When Mastercam's schema changes, you have to change the entire function** — the part that reads from Mastercam, the part that validates, and the part that inserts. Those three concerns are tangled together. With a separate adapter, only the adapter changes. The service and repository are unaffected because they never knew about Mastercam's column names.

2. **`None` because the import pipeline should continue past bad rows.** A file with 50 tools might have 2 that are corrupt, inactive, or use an unrecognized type code. Raising an exception would stop the entire import at row 3. Returning `None` lets the pipeline skip that row, log the reason, and continue with the remaining 47. The user sees "Imported 48, skipped 2" rather than an error dialog. Exception-based early termination is the right choice for errors that mean "the whole file is corrupt." Returning `None` is right for errors that mean "this one record is bad."

3. **Skip tool 17 and log the reason.** Crashing the import at row 17 loses the 33 tools you had not yet processed. Silently importing it with a guessed type corrupts your data. Asking the user blocks the import — if there are 5 unknown type IDs in a 1000-tool file, you don't want 5 dialog boxes. The right answer: skip, record the reason ("fld_mc_tool_type_id=99 not in type map"), and include it in the import report. The user can investigate tool 17 manually.
