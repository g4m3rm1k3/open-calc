# Python Tool Database — LAB 51 — ToolUpdate and Cross-Field Validation

**Prerequisites:** Lab 50. You have `ToolCreate` and `ToolRead`. This lesson adds the third schema — `ToolUpdate` — and introduces `@model_validator`, which runs after all individual field validators and can see the whole object at once.

**What this lab adds:**
- `ToolUpdate` — all fields optional, only validate what was sent
- Why partial updates require every field to be optional
- `@model_validator(mode="after")` — cross-field rules that individual validators cannot express
- `@model_validator(mode="before")` — preprocessing before fields are parsed
- The validation order: type coercion → field validators → model validators

**Time:** 45–55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You are building `ToolUpdate`. A caller sends `{"flutes": 3}` — just one field. Should `diameter_inches` be required or optional on `ToolUpdate`? Why?
> 2. You want to validate that `flute_length` is less than the overall tool length. This requires seeing both fields at once. Can a `@field_validator` do this? Why or why not?
> 3. `@model_validator(mode="after")` vs `mode="before"` — at what point in the validation pipeline does each run?
>
> *(Answers at the end)*

---

## ToolUpdate: The Partial Update Schema

`ToolCreate` requires all mandatory fields — the caller is creating something from scratch.

`ToolUpdate` represents a partial edit — only the fields the caller wants to change. Every field is optional.

```python
class ToolUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: Optional[str] = None
    diameter_inches: Optional[float] = None
    material: Optional[str] = None
    tool_type: Optional[str] = None
    flutes: Optional[int] = None
    notes: Optional[str] = None

    corner_radius: Optional[float] = None
    helix_angle: Optional[float] = None
    flute_length: Optional[float] = None
    point_angle: Optional[float] = None
    drill_length: Optional[float] = None
    insert_size: Optional[str] = None
    num_inserts: Optional[int] = None
    lead_angle: Optional[float] = None
```

When a caller sends `{"flutes": 3}`, Pydantic validates the `ToolUpdate` with `name=None, diameter_inches=None, ..., flutes=3, ...`. The update function then only writes the non-None fields to the database.

---

## Step 1 — The Service Update Method

```python
def update_tool(session, tool_id: int, update: ToolUpdate) -> ToolRead | None:
    tool_orm = session.get(ToolORM, tool_id)
    if tool_orm is None:
        return None

    # model_dump(exclude_none=True) returns only the fields that were actually set
    changes = update.model_dump(exclude_none=True)

    for field, value in changes.items():
        setattr(tool_orm, field, value)

    session.commit()
    return ToolRead.model_validate(tool_orm)
```

`update.model_dump(exclude_none=True)` is the key. It strips out every field that was left as `None` — those were not sent by the caller and should not be written to the database. Only the fields explicitly set by the caller appear in `changes`.

```python
update = ToolUpdate(flutes=3)
update.model_dump()                  # {"name": None, "diameter_inches": None, ..., "flutes": 3, ...}
update.model_dump(exclude_none=True) # {"flutes": 3}
```

`exclude_none=True` gives you only what the caller cared about.

---

## Step 2 — `@field_validator` Cannot See Other Fields

In Lesson 28 you used `@field_validator` to validate individual fields:

```python
@field_validator("diameter_inches")
@classmethod
def check_diameter(cls, v):
    if v <= 0:
        raise ValueError("diameter must be positive")
    return v
```

This validator only sees `diameter_inches`. It cannot check whether `flute_length < overall_length` because that requires seeing two fields at once. That is the job of `@model_validator`.

A field validator runs immediately after its field is parsed — before any other field has been validated. At that moment, the other fields may not even exist yet.

---

## Step 3 — `@model_validator(mode="after")`

A model validator runs after ALL fields have been parsed and validated. It receives the fully-constructed model instance:

```python
from pydantic import BaseModel, model_validator
from typing import Optional


class ToolCreate(BaseModel):
    name: str
    diameter_inches: float
    material: str
    tool_type: str
    flutes: Optional[int] = None
    flute_length: Optional[float] = None
    overall_length: Optional[float] = None

    @model_validator(mode="after")
    def check_flute_length(self) -> "ToolCreate":
        if (self.flute_length is not None
                and self.overall_length is not None
                and self.flute_length >= self.overall_length):
            raise ValueError(
                f"flute_length ({self.flute_length}) must be less than "
                f"overall_length ({self.overall_length})"
            )
        return self

    @model_validator(mode="after")
    def endmill_requires_flutes(self) -> "ToolCreate":
        if self.tool_type == "endmill" and self.flutes is None:
            raise ValueError("endmills must have a flute count")
        return self
```

Two things to notice:

1. **The validator receives `self`** — the fully-constructed model. All fields are accessible as attributes.
2. **It must return `self`** (or a modified copy). Returning nothing breaks Pydantic.
3. **Raise `ValueError`** — same as field validators. Pydantic catches it and includes it in `ValidationError`.

---

## Step 4 — The Validation Order

The full pipeline for a `ToolCreate(name=" EM-0500 ", diameter_inches=0.5, tool_type="endmill")`:

```
1. Type coercion
   " EM-0500 " → stripped to "EM-0500" (ConfigDict(str_strip_whitespace=True))
   "0.5" → 0.5 (if the caller sent a string for a float field)

2. Field validators (in declaration order)
   check_diameter(0.5) → passes
   check_material("carbide") → passes

3. Model validators (in declaration order)
   endmill_requires_flutes(self) → flutes is None → ValidationError

   If all pass → construction succeeds
```

Field validators run one at a time, per field. The model validator runs once, after all fields are settled.

If a field validator fails, the field is excluded from the model — the model validator may see `None` for that field. Write model validators defensively: check for `None` before comparing.

---

## Step 5 — `@model_validator(mode="before")`

`mode="after"` runs after construction. `mode="before"` runs before any field parsing — it receives the raw input, which is still a dict:

```python
@model_validator(mode="before")
@classmethod
def normalize_tool_type(cls, data: dict) -> dict:
    if "tool_type" in data and isinstance(data["tool_type"], str):
        data["tool_type"] = data["tool_type"].lower().strip()
    return data
```

`mode="before"` is for preprocessing raw input — normalizing keys, renaming fields from an external format, setting derived fields before parsing. Use `mode="after"` for cross-field business logic; use `mode="before"` for input transformation.

The difference:

```
mode="before"  →  raw dict input (before Pydantic touches it)
mode="after"   →  model instance (all fields parsed, all field validators run)
```

---

## Step 6 — Complete `tool_schemas.py`

Add `ToolUpdate` and the model validators to the schema file:

```python
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from typing import Optional

VALID_MATERIALS = {"carbide", "HSS", "cobalt", "ceramic", "diamond", "CBN"}
VALID_TOOL_TYPES = {"endmill", "drill", "facemill", "turntool", "tap", "reamer"}


class ToolCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str
    diameter_inches: float
    material: str
    tool_type: str
    flutes: Optional[int] = None
    notes: Optional[str] = None

    # Subtype-specific (all optional at schema level)
    corner_radius: Optional[float] = None
    helix_angle: Optional[float] = None
    flute_length: Optional[float] = None
    point_angle: Optional[float] = None
    drill_length: Optional[float] = None
    insert_size: Optional[str] = None
    num_inserts: Optional[int] = None
    lead_angle: Optional[float] = None

    @field_validator("diameter_inches")
    @classmethod
    def check_diameter(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("diameter must be positive")
        return v

    @field_validator("material")
    @classmethod
    def check_material(cls, v: str) -> str:
        if v not in VALID_MATERIALS:
            raise ValueError(f"material must be one of {sorted(VALID_MATERIALS)}")
        return v

    @field_validator("tool_type")
    @classmethod
    def check_tool_type(cls, v: str) -> str:
        if v not in VALID_TOOL_TYPES:
            raise ValueError(f"tool_type must be one of {sorted(VALID_TOOL_TYPES)}")
        return v

    @model_validator(mode="after")
    def endmill_requires_flutes(self) -> "ToolCreate":
        if self.tool_type == "endmill" and self.flutes is None:
            raise ValueError("endmills must specify flute count")
        return self


class ToolRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    diameter_inches: float
    material: str
    tool_type: str
    flutes: Optional[int] = None
    notes: Optional[str] = None
    corner_radius: Optional[float] = None
    helix_angle: Optional[float] = None
    flute_length: Optional[float] = None
    point_angle: Optional[float] = None
    drill_length: Optional[float] = None
    insert_size: Optional[str] = None
    num_inserts: Optional[int] = None
    lead_angle: Optional[float] = None
    holder_id: Optional[int] = None


class ToolUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: Optional[str] = None
    diameter_inches: Optional[float] = None
    material: Optional[str] = None
    tool_type: Optional[str] = None
    flutes: Optional[int] = None
    notes: Optional[str] = None
    corner_radius: Optional[float] = None
    helix_angle: Optional[float] = None
    flute_length: Optional[float] = None
    point_angle: Optional[float] = None
    drill_length: Optional[float] = None
    insert_size: Optional[str] = None
    num_inserts: Optional[int] = None
    lead_angle: Optional[float] = None

    @field_validator("diameter_inches")
    @classmethod
    def check_diameter(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("diameter must be positive")
        return v

    @field_validator("material")
    @classmethod
    def check_material(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_MATERIALS:
            raise ValueError(f"material must be one of {sorted(VALID_MATERIALS)}")
        return v
```

The `ToolUpdate` validators check `if v is not None` before validating — because every field is optional, `None` is a valid value meaning "not being updated," not an invalid value.

---

## Step 7 — SAVE AND TRY

**Test the model validator failure path:**

```python
from pydantic import ValidationError
from tooldb.schemas.tool_schemas import ToolCreate

try:
    t = ToolCreate(
        name="EM-0500", diameter_inches=0.5,
        material="carbide", tool_type="endmill"
        # flutes=None — not provided
    )
except ValidationError as e:
    for err in e.errors():
        print(err["loc"], err["msg"])
# ('__root__',) or ('endmill_requires_flutes',) → "endmills must specify flute count"
```

**Test `exclude_none` behavior:**

```python
from tooldb.schemas.tool_schemas import ToolUpdate

u = ToolUpdate(flutes=4)
print(u.model_dump())                   # all fields, most are None
print(u.model_dump(exclude_none=True))  # {"flutes": 4}
```

---

## Challenge

Add a model validator to `ToolCreate` that checks: if `tool_type == "drill"` and `point_angle` is provided, the angle must be between 60 and 180 degrees. If `point_angle` is not provided for a drill, that is fine — it is optional.

<details>
<summary>Answer</summary>

```python
@model_validator(mode="after")
def drill_point_angle_range(self) -> "ToolCreate":
    if (self.tool_type == "drill"
            and self.point_angle is not None
            and not (60 <= self.point_angle <= 180)):
        raise ValueError(
            f"drill point_angle must be between 60 and 180 degrees, "
            f"got {self.point_angle}"
        )
    return self
```

The `is not None` check is critical — the validator runs for all tool types, and for non-drills, `point_angle` is always `None`. Without the check, every non-drill would fail because `None` is not between 60 and 180.

</details>

---

## Final Check

| | |
|--|--|
| `ToolUpdate` has all optional fields; `exclude_none=True` strips unset ones | ✓ |
| `@field_validator` sees one field; `@model_validator` sees all fields | ✓ |
| `mode="after"` receives the model instance; `mode="before"` receives the raw dict | ✓ |
| `ToolUpdate` validators guard against `None` before validating | ✓ |
| Model validators must return `self` | ✓ |

---

## Quick Check Answers

1. **Optional — every field on `ToolUpdate` must be optional.** If `diameter_inches` were required, a caller sending `{"flutes": 3}` would get a validation error because `diameter_inches` was not sent. The point of `ToolUpdate` is to allow partial edits. The caller sends only what changed; the service reads only the non-None fields and applies them.

2. **No — a `@field_validator` cannot see other fields.** A field validator receives the value of one field and has no access to the partially-constructed model. `flute_length` is parsed and validated before `overall_length` is parsed; at that point, `overall_length` does not yet exist. `@model_validator(mode="after")` runs after all fields are set, so it can compare any two fields.

3. **`mode="after"` receives the model instance — all fields are parsed Python objects.** You access them as `self.flute_length`. `mode="before"` receives the raw input dict — fields may still be strings, and the model has not been constructed yet. `mode="before"` is the right place to normalize input (rename keys, lowercase strings); `mode="after"` is the right place to enforce business rules that span fields.
