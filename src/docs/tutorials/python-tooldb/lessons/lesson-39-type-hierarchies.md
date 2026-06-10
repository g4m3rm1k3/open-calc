# Python Tool Database — LAB 39 — Type Hierarchies in Python

**Prerequisites:** Lab 38. You can add a generic tool. But a drill has a point angle and no corner radius. An endmill has a corner radius and no point angle. Storing both as `None` on the wrong type and hoping nobody notices is a design smell — this lesson fixes it at the Python level before touching the database or UI.

**What this lab adds:**
- Abstract base classes with `ABC` and `@abstractmethod`
- The tool type hierarchy: `Tool → EndMill, Drill, FaceMill, TurnTool`
- `type_name()` and `type_specific_fields()` as the polymorphic contract
- Why `isinstance()` checks are a code smell and what replaces them
- The `|` union type for type annotations

**Time:** 45–55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You write `if tool.tool_type == "drill": show_point_angle()`. A new tool type "reamer" is added. How many places in the code do you need to update?
> 2. An abstract method has no body. What happens if a subclass forgets to implement it?
> 3. `isinstance(tool, Drill)` vs `tool.type_name() == "drill"` — name one reason the first is better and one reason the second is better.
>
> *(Answers at the end)*

---

## The Problem with Type Strings

Right now a tool is a `dict` with `tool_type: "drill"`. The code that uses it does:

```python
if tool["tool_type"] == "drill":
    show_field("point_angle", tool.get("point_angle"))
elif tool["tool_type"] == "endmill":
    show_field("corner_radius", tool.get("corner_radius"))
elif tool["tool_type"] == "facemill":
    show_field("insert_size", tool.get("insert_size"))
# ... and so on
```

This is called a **type switch** — and it is a red flag. Every time you add a tool type, you find every `if tool_type == ...` in the codebase and add another branch. Miss one and you have a silent bug. The code is brittle, scattered, and hard to test.

The object-oriented solution: make the tool *object* responsible for knowing its own fields. Call `tool.type_specific_fields()` on any tool — it returns the right fields for that type, without any `if`.

---

## Abstract Base Classes

An abstract class is a class you cannot instantiate. It defines a *contract* — a set of methods that every subclass must implement. It is a template, not a thing.

```python
from abc import ABC, abstractmethod

class Tool(ABC):
    @abstractmethod
    def type_name(self) -> str:
        ...

    @abstractmethod
    def type_specific_fields(self) -> dict[str, object]:
        ...
```

If you try to instantiate `Tool()` directly:
```python
t = Tool()  # TypeError: Can't instantiate abstract class Tool with abstract methods type_name, type_specific_fields
```

If a subclass forgets to implement an abstract method:
```python
class Drill(Tool):
    def type_name(self) -> str:
        return "drill"
    # forgot type_specific_fields

d = Drill()  # TypeError: Can't instantiate abstract class Drill with abstract method type_specific_fields
```

The error happens at instantiation, not at the call site. You find out immediately that the contract is broken.

---

## Step 1 — RED: Write the Tests

Create `tests/test_tool_types.py`:

```python
import pytest
from tooldb.models.tool_types import Tool, EndMill, Drill, FaceMill


def test_cannot_instantiate_abstract_tool():
    with pytest.raises(TypeError):
        Tool()


def test_endmill_type_name():
    t = EndMill(name="EM-0500", diameter_inches=0.5, material="carbide", flutes=4)
    assert t.type_name() == "endmill"


def test_drill_type_name():
    t = Drill(name="DR-0250", diameter_inches=0.25, material="HSS", point_angle=118.0)
    assert t.type_name() == "drill"


def test_endmill_type_specific_fields_contains_corner_radius():
    t = EndMill(name="EM-0500", diameter_inches=0.5, material="carbide", flutes=4, corner_radius=0.0)
    fields = t.type_specific_fields()
    assert "corner_radius" in fields


def test_drill_type_specific_fields_contains_point_angle():
    t = Drill(name="DR-0250", diameter_inches=0.25, material="HSS", point_angle=118.0)
    fields = t.type_specific_fields()
    assert "point_angle" in fields
    assert fields["point_angle"] == 118.0


def test_drill_does_not_have_corner_radius_field():
    t = Drill(name="DR-0250", diameter_inches=0.25, material="HSS", point_angle=118.0)
    fields = t.type_specific_fields()
    assert "corner_radius" not in fields


def test_endmill_does_not_have_point_angle_field():
    t = EndMill(name="EM-0500", diameter_inches=0.5, material="carbide", flutes=4)
    fields = t.type_specific_fields()
    assert "point_angle" not in fields


def test_describe_tool_works_on_any_subclass():
    from tooldb.models.tool_types import describe_tool
    endmill = EndMill(name="EM-0500", diameter_inches=0.5, material="carbide", flutes=4)
    drill = Drill(name="DR-0250", diameter_inches=0.25, material="HSS", point_angle=118.0)
    # No isinstance check inside describe_tool — it works via polymorphism
    assert "endmill" in describe_tool(endmill).lower()
    assert "drill" in describe_tool(drill).lower()
```

Run — fails with `ModuleNotFoundError`. Red.

---

## Step 2 — GREEN: Build the Tool Hierarchy

Create `tooldb/models/tool_types.py`:

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class Tool(ABC):
    name: str
    diameter_inches: float
    material: str

    @abstractmethod
    def type_name(self) -> str:
        ...

    @abstractmethod
    def type_specific_fields(self) -> dict[str, object]:
        """Return only the fields that apply to this tool type."""
        ...

    def common_fields(self) -> dict[str, object]:
        return {
            "name": self.name,
            "diameter_inches": self.diameter_inches,
            "material": self.material,
            "tool_type": self.type_name(),
        }

    def all_fields(self) -> dict[str, object]:
        return {**self.common_fields(), **self.type_specific_fields()}


@dataclass
class EndMill(Tool):
    flutes: int = 4
    corner_radius: float = 0.0
    helix_angle: float = 30.0
    flute_length: float | None = None

    def type_name(self) -> str:
        return "endmill"

    def type_specific_fields(self) -> dict[str, object]:
        return {
            "flutes": self.flutes,
            "corner_radius": self.corner_radius,
            "helix_angle": self.helix_angle,
            "flute_length": self.flute_length,
        }


@dataclass
class Drill(Tool):
    point_angle: float = 118.0
    drill_length: float | None = None

    def type_name(self) -> str:
        return "drill"

    def type_specific_fields(self) -> dict[str, object]:
        return {
            "point_angle": self.point_angle,
            "drill_length": self.drill_length,
        }


@dataclass
class FaceMill(Tool):
    insert_size: str | None = None
    num_inserts: int | None = None
    lead_angle: float | None = None

    def type_name(self) -> str:
        return "facemill"

    def type_specific_fields(self) -> dict[str, object]:
        return {
            "insert_size": self.insert_size,
            "num_inserts": self.num_inserts,
            "lead_angle": self.lead_angle,
        }


@dataclass
class TurnTool(Tool):
    insert_shape: str | None = None
    nose_radius: float | None = None
    relief_angle: float | None = None

    def type_name(self) -> str:
        return "turntool"

    def type_specific_fields(self) -> dict[str, object]:
        return {
            "insert_shape": self.insert_shape,
            "nose_radius": self.nose_radius,
            "relief_angle": self.relief_angle,
        }


def describe_tool(tool: Tool) -> str:
    """Works on any Tool subclass — no isinstance check needed."""
    fields = tool.type_specific_fields()
    field_str = ", ".join(f"{k}={v}" for k, v in fields.items() if v is not None)
    return f"{tool.name} ({tool.type_name()}, {tool.diameter_inches}\", {tool.material}) [{field_str}]"
```

Run the tests:

```
pytest tests/test_tool_types.py -v
```

All pass.

---

## Step 3 — `@dataclass` + `ABC` Together

`@dataclass` generates `__init__`, `__repr__`, and `__eq__` from the class fields. Combined with `ABC`, you get a class that:
- Cannot be instantiated directly
- Gets a clean `__init__` from its fields
- Enforces that subclasses implement the abstract methods

One subtlety: `@dataclass` on `Tool` and `@dataclass` on `EndMill` — the subclass inherits `Tool`'s fields (`name`, `diameter_inches`, `material`) and adds its own (`flutes`, `corner_radius`). The generated `__init__` for `EndMill` is:

```python
def __init__(self, name: str, diameter_inches: float, material: str,
             flutes: int = 4, corner_radius: float = 0.0, ...):
```

Python requires all fields with defaults to come after fields without defaults. That is why `Tool`'s fields have no defaults (required) and `EndMill`'s fields have defaults (optional).

---

## Step 4 — The `isinstance` Code Smell, Demonstrated

Here is the wrong way to use this hierarchy:

```python
# Bad — a type switch disguised as Python
def get_type_label(tool: Tool) -> str:
    if isinstance(tool, EndMill):
        return "End Mill"
    elif isinstance(tool, Drill):
        return "Drill"
    elif isinstance(tool, FaceMill):
        return "Face Mill"
    else:
        return "Unknown"
```

Add `TurnTool` — you have to find and update this function. Add `Reamer` — same. The logic for "what is my label?" belongs on the class:

```python
# Good — add a label() method to each subclass
@dataclass
class EndMill(Tool):
    def label(self) -> str:
        return "End Mill"
```

Then `get_type_label` disappears entirely:

```python
tool.label()   # works on any subclass
```

`isinstance` is appropriate when you genuinely need to *branch on type* — for example, in deserialization code that constructs the right subclass from a dict. It is a smell when it appears in business logic that should be handled by the class itself.

---

## Step 5 — SAVE AND TRY

Run the full test suite — the new tests should not break any existing tests:

```
pytest -v
```

Then try building a tool in the REPL:

```python
from tooldb.models.tool_types import EndMill, Drill, describe_tool

em = EndMill("EM-0500", 0.5, "carbide", flutes=4, corner_radius=0.015)
d = Drill("DR-0250", 0.25, "HSS", point_angle=118.0)

print(describe_tool(em))
print(describe_tool(d))
print(em.all_fields())
```

Notice: `describe_tool` takes a `Tool` and calls `.type_specific_fields()`. It has no knowledge of `EndMill` or `Drill` specifically. Add a fifth tool type and `describe_tool` handles it automatically.

---

## Challenge

Add a `Reamer` class. A reamer has:
- `num_flutes: int = 6`
- `reamer_tolerance: str | None = None` (e.g. `"H7"` — an ISO fit tolerance)

Write the test first. Make sure `describe_tool(reamer)` works without changing `describe_tool`.

<details>
<summary>Answer</summary>

```python
# Test:
def test_reamer_type_name_and_fields():
    from tooldb.models.tool_types import Reamer
    r = Reamer(name="RM-0500", diameter_inches=0.5, material="HSS",
               num_flutes=6, reamer_tolerance="H7")
    assert r.type_name() == "reamer"
    fields = r.type_specific_fields()
    assert "num_flutes" in fields
    assert "reamer_tolerance" in fields
    assert fields["reamer_tolerance"] == "H7"
    # describe_tool works without changes:
    from tooldb.models.tool_types import describe_tool
    desc = describe_tool(r)
    assert "reamer" in desc.lower()

# Implementation:
@dataclass
class Reamer(Tool):
    num_flutes: int = 6
    reamer_tolerance: str | None = None

    def type_name(self) -> str:
        return "reamer"

    def type_specific_fields(self) -> dict[str, object]:
        return {
            "num_flutes": self.num_flutes,
            "reamer_tolerance": self.reamer_tolerance,
        }
```

`describe_tool` needed zero changes. That is the point of the lesson.

</details>

---

## Final Check

| | |
|--|--|
| `Tool()` raises `TypeError` — cannot instantiate abstract class | ✓ |
| `Drill.type_specific_fields()` contains `point_angle`, not `corner_radius` | ✓ |
| `EndMill.type_specific_fields()` contains `corner_radius`, not `point_angle` | ✓ |
| `describe_tool` works on any subclass without `isinstance` or `if/elif` | ✓ |
| Adding a new subclass requires zero changes to `describe_tool` | ✓ confirmed by challenge |

---

## Quick Check Answers

1. **Every place.** The `if tool.tool_type == "drill"` pattern forces you to grep the codebase for every type switch and add a new branch. In a large codebase, you will miss some. With polymorphism, you implement `type_specific_fields()` once on the new class and existing code works automatically.

2. **`TypeError` at instantiation time** — Python refuses to create an instance of the subclass. The error message names the unimplemented abstract method. You find out at the moment you try to use the class, not at the call site where the method is invoked.

3. **`isinstance` is better when:** you need to narrow the type for the type checker or access subclass-specific attributes not on the base class. **`tool.type_name() == "drill"` is better when:** you are dealing with deserialized data (dicts from the database) that aren't actual objects yet, or when the string is being stored/displayed rather than used to branch logic.
