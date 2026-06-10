# Python Tool Database — LAB 27 — Validation Philosophy: Collect, Don't Stop

**Prerequisites:** Lab 26. You have `ToolService.create_tool` raising `ValueError` on the first problem it finds. You understand what a test is and can practice TDD. Now you learn why "raise on first error" is the wrong approach for user-facing validation, and build the infrastructure to do better.

**What this lab adds:**
- The fail-fast vs collect-all approaches to validation
- What a good error message contains
- The three layers where validation belongs
- A `ValidationResult` class that carries all errors together
- A `validate_tool_data` function that checks everything before touching the database

**Time:** 45–55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A user fills in a form with three errors: missing name, negative diameter, invalid material. The form raises on the first error. How many attempts does the user need to see all three errors?
> 2. An error message says "Validation error." What three pieces of information are missing that would make this useful?
> 3. `ToolService.create_tool` currently raises `ValueError("diameter must be positive")`. What is the problem with using this as a user-facing error message for a form?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `ValidationResult` class and a `validate_tool_data` function:

```python
# tooldb/validation.py
class ValidationResult:
    def __init__(self):
        self.errors: list[str] = []
        self.warnings: list[str] = []

    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0

    def add_error(self, field: str, message: str, value=None) -> None: ...
    def add_warning(self, field: str, message: str, value=None) -> None: ...


def validate_tool_data(data: dict) -> ValidationResult: ...
```

New file:
```
tooldb/
    validation.py    ← NEW
tests/
    test_validation.py    ← NEW
```

---

## Step 1 — Fail Fast vs Collect All

### Fail fast

```python
def create_tool(self, name, diameter_inches, material, tool_type, ...):
    if not name:
        raise ValueError("name is required")
    if diameter_inches <= 0:
        raise ValueError("diameter must be positive")
    if material not in VALID_MATERIALS:
        raise ValueError(f"invalid material: {material}")
    ...
```

The first check that fails raises immediately. The caller sees one error. It fixes that error, submits again. Sees the next error. This is a loop: N errors = N attempts. Painful.

### Collect all

```python
def validate_tool_data(data: dict) -> ValidationResult:
    result = ValidationResult()
    
    if not data.get("name"):
        result.add_error("name", "is required")
    if data.get("diameter_inches", 0) <= 0:
        result.add_error("diameter_inches", "must be a positive number", data.get("diameter_inches"))
    if data.get("material") not in VALID_MATERIALS:
        result.add_error("material", "must be one of: carbide, HSS, cobalt", data.get("material"))
    
    return result  # always returns, never raises
```

Every check runs. Every problem is recorded. The caller receives a `ValidationResult` with all errors at once.

The user sees: three problems, three corrections, one successful submit.

---

## Step 2 — What a Good Error Message Contains

Three components:

| Component | Bad example | Good example |
|-----------|-------------|--------------|
| **Where** | "error" | "field: diameter_inches" |
| **What** | "invalid" | "must be a positive number" |
| **What was received** | (missing) | "got: -0.5" |

Combined: `"diameter_inches: must be a positive number, got: -0.5"`

For batch operations (importing 100 tools), also add:
- **Which record:** `"Row 47 — diameter_inches: must be a positive number, got: -0.5"`

The user reads this once and knows exactly what to fix. No guessing.

---

## Step 3 — RED: Write the Tests First

Create `tests/test_validation.py`:

```python
from tooldb.validation import ValidationResult, validate_tool_data


class TestValidationResult:
    def test_is_valid_when_no_errors(self):
        result = ValidationResult()
        assert result.is_valid is True

    def test_is_not_valid_when_errors_added(self):
        result = ValidationResult()
        result.add_error("name", "is required")
        assert result.is_valid is False

    def test_error_message_includes_field_and_message(self):
        result = ValidationResult()
        result.add_error("diameter_inches", "must be positive", value=-0.5)
        assert len(result.errors) == 1
        assert "diameter_inches" in result.errors[0]
        assert "must be positive" in result.errors[0]
        assert "-0.5" in result.errors[0]

    def test_multiple_errors_are_all_collected(self):
        result = ValidationResult()
        result.add_error("name", "is required")
        result.add_error("diameter_inches", "must be positive", value=-0.5)
        result.add_error("material", "must be one of: carbide, HSS, cobalt", value="titanium")
        assert len(result.errors) == 3
        assert result.is_valid is False


class TestValidateToolData:
    def test_valid_tool_returns_no_errors(self):
        data = {
            "name": "1/2 Carbide EM",
            "diameter_inches": 0.5,
            "material": "carbide",
            "tool_type": "endmill",
        }
        result = validate_tool_data(data)
        assert result.is_valid is True
        assert result.errors == []

    def test_empty_name_produces_error(self):
        data = {"name": "", "diameter_inches": 0.5, "material": "carbide", "tool_type": "endmill"}
        result = validate_tool_data(data)
        assert not result.is_valid
        assert any("name" in e for e in result.errors)

    def test_negative_diameter_produces_error_with_value(self):
        data = {"name": "Mill", "diameter_inches": -0.5, "material": "carbide", "tool_type": "endmill"}
        result = validate_tool_data(data)
        assert not result.is_valid
        assert any("diameter" in e and "-0.5" in e for e in result.errors)

    def test_invalid_material_produces_error(self):
        data = {"name": "Mill", "diameter_inches": 0.5, "material": "unobtanium", "tool_type": "endmill"}
        result = validate_tool_data(data)
        assert not result.is_valid
        assert any("material" in e for e in result.errors)

    def test_three_bad_fields_produce_three_errors(self):
        data = {"name": "", "diameter_inches": -1.0, "material": "unobtanium", "tool_type": "endmill"}
        result = validate_tool_data(data)
        assert len(result.errors) == 3

    def test_missing_tool_type_produces_error(self):
        data = {"name": "Mill", "diameter_inches": 0.5, "material": "carbide", "tool_type": ""}
        result = validate_tool_data(data)
        assert not result.is_valid
        assert any("tool_type" in e for e in result.errors)
```

Run pytest — all tests fail with `ModuleNotFoundError: No module named 'tooldb.validation'`. That is the Red step.

---

## Step 4 — GREEN: Build `ValidationResult`

Create `tooldb/validation.py`:

```python
VALID_MATERIALS = {"carbide", "HSS", "cobalt"}
VALID_TOOL_TYPES = {"endmill", "drill", "tap", "reamer", "facemill", "ballmill", "chamfer"}

MIN_DIAMETER_INCHES = 0.001
MAX_DIAMETER_INCHES = 24.0


class ValidationResult:
    def __init__(self):
        self.errors: list[str] = []
        self.warnings: list[str] = []

    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0

    def add_error(self, field: str, message: str, value=None) -> None:
        if value is not None:
            self.errors.append(f"{field}: {message}, got: {value!r}")
        else:
            self.errors.append(f"{field}: {message}")

    def add_warning(self, field: str, message: str, value=None) -> None:
        if value is not None:
            self.warnings.append(f"{field}: {message}, got: {value!r}")
        else:
            self.warnings.append(f"{field}: {message}")

    def __repr__(self) -> str:
        if self.is_valid:
            return "ValidationResult(valid)"
        return f"ValidationResult({len(self.errors)} errors: {self.errors})"
```

Run the `TestValidationResult` tests — they should all pass now.

---

## Step 5 — GREEN: Build `validate_tool_data`

Add to `tooldb/validation.py`:

```python
def validate_tool_data(data: dict) -> ValidationResult:
    result = ValidationResult()

    name = data.get("name", "")
    if not name or not name.strip():
        result.add_error("name", "is required")

    diameter = data.get("diameter_inches")
    if diameter is None:
        result.add_error("diameter_inches", "is required")
    elif not isinstance(diameter, (int, float)):
        result.add_error("diameter_inches", "must be a number", value=diameter)
    elif diameter <= 0:
        result.add_error("diameter_inches", "must be a positive number", value=diameter)
    elif diameter > MAX_DIAMETER_INCHES:
        result.add_error("diameter_inches", f"must be ≤ {MAX_DIAMETER_INCHES}", value=diameter)

    material = data.get("material", "")
    if not material:
        result.add_error("material", "is required")
    elif material not in VALID_MATERIALS:
        result.add_error("material", f"must be one of: {', '.join(sorted(VALID_MATERIALS))}", value=material)

    tool_type = data.get("tool_type", "")
    if not tool_type or not tool_type.strip():
        result.add_error("tool_type", "is required")
    elif tool_type not in VALID_TOOL_TYPES:
        result.add_error("tool_type", f"must be one of: {', '.join(sorted(VALID_TOOL_TYPES))}", value=tool_type)

    flutes = data.get("flutes")
    if flutes is not None:
        if not isinstance(flutes, int):
            result.add_error("flutes", "must be an integer", value=flutes)
        elif flutes <= 0:
            result.add_error("flutes", "must be a positive integer", value=flutes)

    return result
```

Run all tests:

```
pytest tests/test_validation.py -v
```

All should pass.

---

## Step 6 — REFACTOR: Remove Duplication in Constants

`VALID_MATERIALS` now appears in two places:
- `tooldb/validation.py`
- `tooldb/services/tool_service.py`

This is a violation of DRY. The service can import from validation:

```python
# tooldb/services/tool_service.py
from tooldb.validation import VALID_MATERIALS, MIN_DIAMETER_INCHES, MAX_DIAMETER_INCHES
```

And remove the local definitions from `tool_service.py`. Run the full test suite to confirm nothing broke.

---

## Step 7 — Wire the Validator into ToolService

Currently `ToolService.create_tool` raises individually on the first problem. Update it to use `validate_tool_data`:

```python
# tooldb/services/tool_service.py
from tooldb.validation import validate_tool_data

class ToolService:
    def create_tool(self, name, diameter_inches, material, tool_type, flutes=None, notes=None) -> int:
        result = validate_tool_data({
            "name": name,
            "diameter_inches": diameter_inches,
            "material": material,
            "tool_type": tool_type,
            "flutes": flutes,
        })
        if not result.is_valid:
            raise ValueError("\n".join(result.errors))

        existing = self.repo.search_by_name(name)
        if existing:
            raise ValueError(f"A tool named '{name}' already exists")

        return self.repo.insert(name, diameter_inches, material, tool_type, flutes, notes)
```

The service now collects all validation errors before raising. A form that catches this `ValueError` can split on `\n` to get individual error strings.

Run the full test suite:

```
pytest -v
```

Some tests in `test_tool_service.py` may need updating — the error format changed. Update the `match=` strings in `pytest.raises` calls to match the new format.

---

## Step 8 — SAVE AND TRY

```
cd python-tooldb
pytest -v
```

Confirm all tests pass. Then test the validator manually:

```python
python -c "
from tooldb.validation import validate_tool_data
result = validate_tool_data({'name': '', 'diameter_inches': -1.0, 'material': 'unobtanium', 'tool_type': 'endmill'})
for e in result.errors:
    print(e)
"
```

Expected output (3 lines, one per error):
```
name: is required
diameter_inches: must be a positive number, got: -1.0
material: must be one of: HSS, carbide, cobalt, got: 'unobtanium'
```

---

## Challenge

Add a `validate_diameter_range` check: for an endmill, the maximum practical diameter is 3.0 inches. For a facemill, it can go up to 24.0 inches. Add a test for this cross-field rule:

```python
def test_endmill_diameter_above_3_produces_warning():
    data = {"name": "Big Mill", "diameter_inches": 4.0, "material": "carbide", "tool_type": "endmill"}
    result = validate_tool_data(data)
    assert result.is_valid  # not an error — the data is not wrong, just unusual
    assert len(result.warnings) >= 1
    assert any("diameter" in w for w in result.warnings)
```

<details>
<summary>Answer</summary>

Add to the `diameter` block in `validate_tool_data`:

```python
# After the existing diameter checks:
tool_type = data.get("tool_type", "")
if isinstance(diameter, (int, float)) and diameter > 0:
    if tool_type == "endmill" and diameter > 3.0:
        result.add_warning(
            "diameter_inches",
            f"endmills larger than 3.0\" are unusual — verify this is correct",
            value=diameter,
        )
```

Note: the check for `tool_type == "endmill"` must happen after the `tool_type` variable is assigned, which means you need to read `tool_type` before the diameter block, or restructure the validation so cross-field checks come after all single-field checks. The clean approach: validate all fields first, then run cross-field rules at the end.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Explain why "fail fast" validation is bad for user experience | |
| State the three components a good error message contains | |
| Build a `ValidationResult` class that collects multiple errors | |
| Write a `validate_tool_data` function that checks every field | |
| Run the validator and get all errors at once, not just the first | |
| Import shared constants from `validation.py` rather than duplicating them | |
| Distinguish errors (block submit) from warnings (note but continue) | |

---

## Quick Check Answers

1. **Three attempts.** The fail-fast approach stops at the first error. To discover all three errors, the user must make three separate submission attempts: submit → fix name → submit → fix diameter → submit → fix material → finally succeed. "Collect all" shows all three in one attempt.

2. **A good error message needs: (1) Where — which field caused the problem. (2) What is wrong — the specific rule that failed. (3) What was received — the actual bad value so the user can find the source of the error.** "Validation error" provides none of these.

3. **Two problems:** First, the service raises on the *first* error — if diameter and material are both wrong, the user only sees the diameter message and won't know about material until the next attempt. Second, `ValueError("diameter must be positive")` is an exception for *programmers*, not a user message — it appears in a Python traceback, not in a labelled field. User-facing messages should be collected and displayed by the UI layer, not raised as exceptions mid-stack.
