# Python Tool Database — LAB 07 — Inheritance and Polymorphism

**Prerequisites:** Lab 06. You can write classes with `__init__`, methods, and `__repr__`. `tooldb/holder.py` has the `Holder` class.

**What this lab adds:**
- Inheritance: one class extending another to share code while adding specialization
- `super().__init__()` — calling the parent class initializer from the child
- Method overriding: a subclass providing its own version of a parent method
- Polymorphism: calling the same method name on different types and getting the right behavior for each
- When NOT to use inheritance — the composition tradeoff
- The Liskov Substitution Principle: a subclass must honor the parent's contract
- `EndMill(Tool)` and `Drill(Tool)` subclasses built through Red-Green-Refactor

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `Drill` and `EndMill` are both tools. Without inheritance, how would you share the `name` and `diameter_inches` attributes between them?
> 2. If `EndMill` overrides `describe()`, what does `super().describe()` inside `EndMill.describe()` return?
> 3. The Liskov Substitution Principle says "a subclass must be usable wherever the parent is used." Give one example of how `Drill` could violate this principle.
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have two tool subclasses:

```python
endmill = EndMill("EM-0500", diameter_inches=0.5, flutes=4, corner_radius_inches=0.0)
drill   = Drill("DR-0250",   diameter_inches=0.25, point_angle_degrees=118)

print(endmill.describe())
# → Tool: EM-0500  diameter: 0.500"  type: EndMill  flutes: 4  corner radius: 0.000"

print(drill.describe())
# → Tool: DR-0250  diameter: 0.250"  type: Drill  point angle: 118°

def print_tool_info(tool):       # accepts any Tool subclass
    print(f"Processing: {tool.name} — {tool.describe()}")

print_tool_info(endmill)   # works
print_tool_info(drill)     # also works — same function, different output
```

---

## Step 1 — The Problem Without Inheritance

Before writing inheritance, feel the problem it solves. Open the REPL: `python`

Without inheritance, `EndMill` and `Drill` would duplicate the common fields:

```python
class EndMill:
    def __init__(self, name, diameter_inches, flutes, corner_radius_inches):
        self.name = name                          # duplicate
        self.diameter_inches = diameter_inches    # duplicate
        self.flutes = flutes
        self.corner_radius_inches = corner_radius_inches

class Drill:
    def __init__(self, name, diameter_inches, point_angle_degrees):
        self.name = name                          # duplicate
        self.diameter_inches = diameter_inches    # duplicate
        self.point_angle_degrees = point_angle_degrees
```

If a third tool type is added — say a `FaceMill` — it would also duplicate `name` and `diameter_inches`. If the field name changes from `diameter_inches` to `diameter_in`, you update it in every class. That is the DRY violation inheritance solves: define common attributes once in the parent, and every subclass gets them automatically.

---

### Concept: Inheritance — Sharing Code Through an Is-A Relationship

**What it is:** A mechanism where one class (the **subclass** or **child**) extends another class (the **superclass** or **parent**), inheriting all of the parent's attributes and methods while adding its own.

**The is-a test:** Before using inheritance, apply the is-a test. "An `EndMill` IS-A `Tool`" — true. "An `EndMill` HAS-A holder" — that is composition, not inheritance. The distinction matters: inheritance models specialization, not mere association.

**The syntax:**

```python
class Tool:                          # parent class
    def __init__(self, name, diameter_inches):
        self.name = name
        self.diameter_inches = diameter_inches

class EndMill(Tool):                 # EndMill inherits from Tool
    def __init__(self, name, diameter_inches, flutes):
        super().__init__(name, diameter_inches)  # call Tool's __init__
        self.flutes = flutes                     # add EndMill-specific attribute
```

`class EndMill(Tool)` — the `(Tool)` declares that `EndMill` inherits from `Tool`. Every instance of `EndMill` has everything `Tool` has, plus `flutes`.

**What it hides:** The attribute-lookup mechanism. When you access `endmill.name`, Python first checks `endmill`'s own attributes, then checks `EndMill`'s class attributes, then checks `Tool`'s class attributes. The whole chain is invisible — you just write `endmill.name`.

The invariant inheritance protects: if you add or change an attribute in `Tool.__init__`, every subclass that calls `super().__init__()` gets the change automatically. No hunting through every subclass.

**Canonical example (General):**

A vehicle type hierarchy. `Vehicle` has `color`, `speed`, `fuel_type`. `Car(Vehicle)` adds `door_count`. `Motorcycle(Vehicle)` adds `has_sidecar`. Every car and motorcycle has color and speed — inherited. Each adds its own specific attributes.

**Project application:** `Tool` holds the common data for all cutting tools. `EndMill`, `Drill`, `FaceMill`, `ThreadMill` each add tool-type-specific data without duplicating `name` or `diameter_inches`.

**You will see this again in:** PySide6 (Block 3): `QWidget` is the parent of every widget — `QPushButton(QWidget)`, `QLabel(QWidget)`, `QTableView(QWidget)`. SQLAlchemy (Block 5): `Base` is the parent of every database model. Every Python exception inherits from `Exception`.

**Watch for:** Inheritance hierarchies deeper than two levels are almost always wrong for domain objects. If you have `ToolA(ToolB(ToolC))`, stop and think about whether composition would be cleaner. Deep hierarchies create fragile coupling — a change in `ToolC` can break everything above it.

---

## Step 2 — `super().__init__()`

`super()` returns a proxy object that lets you call a method from the parent class. Its most common use is calling the parent's `__init__`:

```python
class EndMill(Tool):
    def __init__(self, name, diameter_inches, flutes, corner_radius_inches):
        super().__init__(name, diameter_inches)   # let Tool handle its own attributes
        self.flutes = flutes                      # add EndMill-specific attribute
        self.corner_radius_inches = corner_radius_inches
```

**Why you must call `super().__init__()`:** Without it, `Tool.__init__` never runs. `self.name` and `self.diameter_inches` are never set. Any attempt to access them raises `AttributeError`.

Try the failure first in the REPL:

```python
class Tool:
    def __init__(self, name, diameter_inches):
        self.name = name
        self.diameter_inches = diameter_inches

class BrokenEndMill(Tool):
    def __init__(self, name, diameter_inches, flutes):
        # forgot super().__init__() !
        self.flutes = flutes

broken = BrokenEndMill("EM-0500", 0.5, 4)
broken.name   # → AttributeError: 'BrokenEndMill' object has no attribute 'name'
```

Now the correct version:

```python
class EndMill(Tool):
    def __init__(self, name, diameter_inches, flutes, corner_radius_inches):
        super().__init__(name, diameter_inches)  # Tool sets self.name and self.diameter_inches
        self.flutes = flutes
        self.corner_radius_inches = corner_radius_inches

endmill = EndMill("EM-0500", 0.5, 4, 0.0)
endmill.name              # → "EM-0500"  (set by Tool.__init__)
endmill.flutes            # → 4          (set by EndMill.__init__)
```

---

### SAVE AND TRY

In the REPL:

```python
class Tool:
    def __init__(self, name, diameter_inches):
        self.name = name
        self.diameter_inches = diameter_inches

    def describe(self):
        return f'Tool: {self.name}  diameter: {self.diameter_inches:.3f}"'

class EndMill(Tool):
    def __init__(self, name, diameter_inches, flutes, corner_radius_inches):
        super().__init__(name, diameter_inches)
        self.flutes = flutes
        self.corner_radius_inches = corner_radius_inches

    def describe(self):
        base = super().describe()                    # call Tool's describe
        return f'{base}  type: EndMill  flutes: {self.flutes}  corner radius: {self.corner_radius_inches:.3f}"'

endmill = EndMill("EM-0500", 0.5, 4, 0.0)
print(endmill.describe())
```

**You should see:**

```
Tool: EM-0500  diameter: 0.500"  type: EndMill  flutes: 4  corner radius: 0.000"
```

**Console test:** `isinstance(endmill, Tool)`. **Expected:** `True` — every `EndMill` is also a `Tool`. `isinstance(endmill, EndMill)`. **Expected:** `True`.

**Change something:** Remove the `super().__init__()` call from `EndMill.__init__`. Try `endmill.name`. **Expected:** `AttributeError`. Put `super().__init__()` back.

---

## Step 3 — Polymorphism

**Polymorphism** (Greek: many forms) means calling the same method name on different types and getting the behavior appropriate for each type.

```python
class Tool:
    def __init__(self, name, diameter_inches):
        self.name = name
        self.diameter_inches = diameter_inches

    def describe(self):
        return f'Tool: {self.name}  diameter: {self.diameter_inches:.3f}"'

class EndMill(Tool):
    def __init__(self, name, diameter_inches, flutes, corner_radius_inches):
        super().__init__(name, diameter_inches)
        self.flutes = flutes
        self.corner_radius_inches = corner_radius_inches

    def describe(self):                             # overrides Tool.describe
        base = super().describe()
        return f'{base}  type: EndMill  flutes: {self.flutes}'

class Drill(Tool):
    def __init__(self, name, diameter_inches, point_angle_degrees):
        super().__init__(name, diameter_inches)
        self.point_angle_degrees = point_angle_degrees

    def describe(self):                             # overrides Tool.describe
        base = super().describe()
        return f'{base}  type: Drill  point angle: {self.point_angle_degrees}°'

def print_tool_info(tool: Tool) -> None:            # accepts any Tool
    print(tool.describe())                          # calls the RIGHT describe for this type

tools = [
    EndMill("EM-0500", 0.5, 4, 0.0),
    Drill("DR-0250", 0.25, 118),
    EndMill("FM-0750", 0.75, 6, 0.0),
]

for tool in tools:
    print_tool_info(tool)                          # same function, different output per type
```

**You should see:**

```
Tool: EM-0500  diameter: 0.500"  type: EndMill  flutes: 4
Tool: DR-0250  diameter: 0.250"  type: Drill  point angle: 118°
Tool: FM-0750  diameter: 0.750"  type: EndMill  flutes: 6
```

`print_tool_info` does not need `if isinstance(tool, EndMill)` or `if isinstance(tool, Drill)`. Python calls the right `describe()` for each type automatically. That is polymorphism.

---

### Concept: Polymorphism — One Interface, Multiple Behaviors

**What it is:** The ability for different types to respond to the same method call each in their own way.

**The problem without polymorphism:**

```python
def print_tool_info(tool):
    if isinstance(tool, EndMill):
        print(f"... {tool.flutes} flutes")
    elif isinstance(tool, Drill):
        print(f"... {tool.point_angle_degrees}°")
    # add a new tool type → must come back here and add another branch
```

Every new tool type requires modifying `print_tool_info`. That violates the Open/Closed Principle from Lab 00g: open for extension (add a new type), closed for modification (don't change existing code).

**The solution:** Each type implements `describe()`. `print_tool_info` calls `tool.describe()` without knowing or caring which type it has. Add a new tool type, add a `describe()` method to it — `print_tool_info` needs no change.

**Method resolution order (MRO):** When you call `tool.describe()`, Python looks up `describe` in this order:
1. The actual type of the object (e.g., `EndMill`)
2. The parent class (`Tool`)
3. `object` (Python's universal base class)

The first `describe` found wins. This is why `EndMill.describe` is called for an `EndMill` instance even though `print_tool_info` only knows about `Tool`.

**Canonical example (General):**

A music player's `play()` button. Whether you press it on an MP3 player, a vinyl turntable, a CD player, or a cassette deck, the button does the right thing for each. The button (the caller) does not need to know which kind of player it is — each player implements `play()` in its own way.

**Project application:** When the tool database displays a list of tools, every row is a `Tool`. Some are `EndMill`, some are `Drill`, some are `FaceMill`. The display code calls `tool.describe()` or `tool.tool_type` for every row without type checks. Each subclass provides the right data.

**You will see this again in:** SQLAlchemy polymorphic queries (Block 5). Qt signals and slots (Block 3) — any `QWidget` responds to `setVisible()` regardless of actual widget type. In FastAPI (Block 11): Pydantic discriminated unions are polymorphism for JSON deserialization.

**Watch for:** Polymorphism requires the method to be defined on the parent class (or the subclass must override it). If `Tool` has no `describe()` and a caller calls `tool.describe()` on a `Tool` instance directly, it raises `AttributeError`. The parent class defines the contract; subclasses fulfill it.

---

## Step 4 — The Liskov Substitution Principle

From Lab 00g: "anywhere you use a `Tool`, a `Drill` must work correctly."

A subclass violates LSP when it:
- Returns `None` where the parent promises a string
- Raises an exception the parent never raises
- Accepts fewer arguments than the parent
- Modifies behavior in ways the caller did not expect

**LSP violation example:**

```python
class StubDrill(Tool):
    def describe(self):
        return None   # ← parent promises a str; this returns None

def print_tool_info(tool: Tool):
    label = tool.describe()
    print(label.upper())   # AttributeError: 'NoneType' has no attribute 'upper'
    # The caller expected a str; the subclass broke that contract
```

**LSP-compliant design:** Every override of `describe()` returns a non-empty string. The caller never has to check whether it got a string or None.

---

## Step 5 — Composition vs Inheritance

Inheritance is not always the right tool. Consider: should `Holder` inherit from `Tool`?

**Is-a test:** Is a `Holder` a type of `Tool`? No. A holder is a separate physical component that HOLDS a tool. The relationship is "has-a": an assembly HAS-A holder and HAS-A tool. That is composition, not inheritance.

```python
# Wrong — Holder is not a type of Tool:
class Holder(Tool):   # fails the is-a test
    ...

# Correct — Assembly holds a Tool and a Holder:
class Assembly:
    def __init__(self, tool: Tool, holder: Holder, stickout_inches: float):
        self.tool = tool       # composition: Assembly has-a Tool
        self.holder = holder   # composition: Assembly has-a Holder
        self.stickout_inches = stickout_inches
```

**The rule:** Use inheritance when the subclass is a specialization of the parent (is-a). Use composition when the class contains another class as a component (has-a). "Favor composition over inheritance" is a standard principle — composition is more flexible and creates less coupling.

---

## Step 6 — Red: Write the Tests

Create `tests/test_tool_types.py`:

```python
from tooldb.tool_types import Tool, EndMill, Drill   # ← will fail


def test_endmill_is_a_tool():
    endmill = EndMill("EM-0500", 0.5, 4, 0.0)
    assert isinstance(endmill, Tool)             # is-a relationship holds


def test_endmill_inherits_name_and_diameter():
    endmill = EndMill("EM-0500", 0.5, 4, 0.0)
    assert endmill.name == "EM-0500"             # set by Tool.__init__
    assert endmill.diameter_inches == 0.5


def test_endmill_adds_own_attributes():
    endmill = EndMill("EM-0500", 0.5, 4, 0.0)
    assert endmill.flutes == 4
    assert endmill.corner_radius_inches == 0.0


def test_endmill_describe_includes_type_and_flutes():
    endmill = EndMill("EM-0500", 0.5, 4, 0.0)
    result = endmill.describe()
    assert "EndMill" in result
    assert "4" in result                         # flute count


def test_drill_is_a_tool():
    drill = Drill("DR-0250", 0.25, 118)
    assert isinstance(drill, Tool)


def test_drill_describe_includes_type_and_angle():
    drill = Drill("DR-0250", 0.25, 118)
    result = drill.describe()
    assert "Drill" in result
    assert "118" in result                        # point angle


def test_polymorphism_same_function_different_output():
    tools = [
        EndMill("EM-0500", 0.5, 4, 0.0),
        Drill("DR-0250", 0.25, 118),
    ]
    results = [tool.describe() for tool in tools]   # same method call, different output
    assert "EndMill" in results[0]
    assert "Drill" in results[1]
    assert "EndMill" not in results[1]              # Drill output has no "EndMill"
```

Run:

```powershell
pytest tests/test_tool_types.py
```

**You should see:**

```
ModuleNotFoundError: No module named 'tooldb.tool_types'
```

Red.

---

## Step 7 — Green: Write the Classes

Create `tooldb/tool_types.py`:

```python
class Tool:
    def __init__(self, name: str, diameter_inches: float):
        self.name = name                     # every tool has a name
        self.diameter_inches = diameter_inches  # every tool has a diameter

    def describe(self) -> str:
        return f'Tool: {self.name}  diameter: {self.diameter_inches:.3f}"'
        # base description used by all tool types
```

Run the first two tests to confirm `Tool` works:

```powershell
pytest tests/test_tool_types.py -k "endmill_is_a_tool or endmill_inherits"
```

Add `EndMill`:

```python
class EndMill(Tool):                         # ← add after Tool
    def __init__(
        self,
        name: str,
        diameter_inches: float,
        flutes: int,
        corner_radius_inches: float,
    ):
        super().__init__(name, diameter_inches)    # Tool handles name and diameter
        self.flutes = flutes                       # number of cutting edges
        self.corner_radius_inches = corner_radius_inches  # edge rounding (0 = sharp corner)

    def describe(self) -> str:
        base = super().describe()                  # get the Tool base description
        return (
            f"{base}  type: EndMill  "
            f"flutes: {self.flutes}  "
            f'corner radius: {self.corner_radius_inches:.3f}"'
        )
```

Run the EndMill tests:

```powershell
pytest tests/test_tool_types.py -k "endmill"
```

**You should see:** 4 EndMill tests passing.

Add `Drill`:

```python
class Drill(Tool):                           # ← add after EndMill
    def __init__(
        self,
        name: str,
        diameter_inches: float,
        point_angle_degrees: int,
    ):
        super().__init__(name, diameter_inches)       # Tool handles name and diameter
        self.point_angle_degrees = point_angle_degrees  # included angle of drill tip (118° is standard)

    def describe(self) -> str:
        base = super().describe()
        return f"{base}  type: Drill  point angle: {self.point_angle_degrees}°"
        # ° is the degree symbol — Unicode character U+00B0, valid in Python strings
```

Run all tests:

```powershell
pytest tests/test_tool_types.py
```

**You should see:** 7 passed.

---

## Step 8 — Refactor: Full Test Suite

```powershell
pytest tests/
```

**You should see:** All tests pass, including all earlier tests.

**Console test:**

```python
from tooldb.tool_types import EndMill, Drill

tools = [
    EndMill("EM-0500", 0.5, 4, 0.0),
    EndMill("EM-0375", 0.375, 4, 0.03),
    Drill("DR-0250", 0.25, 118),
    Drill("DR-0500", 0.5, 135),
]

for tool in tools:
    print(tool.describe())
```

**You should see:** Four lines, each with the correct type-specific output.

**Change something:** In `Drill.describe()`, remove `super().describe()` and instead return only `f"Drill: {self.name}  {self.point_angle_degrees}°"`. Run the test `test_drill_describe_includes_type_and_angle`. It still passes, but `test_polymorphism_same_function_different_output` might behave differently. Change it back — using `super().describe()` is the pattern that keeps the base information consistent across all types.

---

## 🎯 Challenge: Add `FaceMill`

**You know:** Inheritance, `super().__init__()`, method overriding, polymorphism.

**Task:** Add a `FaceMill` class to `tooldb/tool_types.py`. A face mill has:
- All `Tool` attributes (`name`, `diameter_inches`)
- `insert_count: int` — number of cutting inserts
- `max_depth_of_cut_inches: float` — maximum axial depth per pass

Its `describe()` output should include `type: FaceMill`, the insert count, and the max depth.

Write the tests first:

```python
def test_facemill_is_a_tool():
    fm = FaceMill("FM-0750", 0.75, insert_count=4, max_depth_of_cut_inches=0.125)
    assert isinstance(fm, Tool)

def test_facemill_describe_includes_type_and_inserts():
    fm = FaceMill("FM-0750", 0.75, insert_count=4, max_depth_of_cut_inches=0.125)
    result = fm.describe()
    assert "FaceMill" in result
    assert "4" in result       # insert count
    assert "0.125" in result   # max depth
```

---

<details>
<summary>▶ Show Solution</summary>

**Tests** (add to `tests/test_tool_types.py`):

```python
from tooldb.tool_types import Tool, EndMill, Drill, FaceMill  # ← add FaceMill


def test_facemill_is_a_tool():
    fm = FaceMill("FM-0750", 0.75, insert_count=4, max_depth_of_cut_inches=0.125)
    assert isinstance(fm, Tool)


def test_facemill_describe_includes_type_and_inserts():
    fm = FaceMill("FM-0750", 0.75, insert_count=4, max_depth_of_cut_inches=0.125)
    result = fm.describe()
    assert "FaceMill" in result
    assert "4" in result
    assert "0.125" in result
```

**Class** (add to `tooldb/tool_types.py`):

```python
class FaceMill(Tool):
    def __init__(
        self,
        name: str,
        diameter_inches: float,
        insert_count: int,
        max_depth_of_cut_inches: float,
    ):
        super().__init__(name, diameter_inches)
        self.insert_count = insert_count
        self.max_depth_of_cut_inches = max_depth_of_cut_inches

    def describe(self) -> str:
        base = super().describe()
        return (
            f"{base}  type: FaceMill  "
            f"inserts: {self.insert_count}  "
            f'max depth: {self.max_depth_of_cut_inches:.3f}"'
        )
```

**Key insight:** Adding a new tool type required zero changes to any existing code — not to `Tool`, not to `EndMill`, not to `print_tool_info`, not to any test for existing types. This is the Open/Closed Principle in action: the system is open for extension (new types) and closed for modification (no changes to existing types). Polymorphism makes it possible: `[tool.describe() for tool in tools]` automatically handles `FaceMill` with no changes because `FaceMill` implements `describe()`.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `EndMill` is a `Tool` (is-a) | `test_endmill_is_a_tool` passes |
| `EndMill` inherits `name` and `diameter_inches` | `test_endmill_inherits_name_and_diameter` passes |
| `EndMill.describe()` includes type and flutes | `test_endmill_describe_includes_type_and_flutes` passes |
| `Drill.describe()` includes type and point angle | `test_drill_describe_includes_type_and_angle` passes |
| Same function works on both types | `test_polymorphism_same_function_different_output` passes |
| All previous tests still pass | `pytest tests/` — no regressions |
| Can explain when to use inheritance vs composition | Inheritance for is-a; composition for has-a |

---

## Quick Check Answers

**1. Sharing attributes without inheritance:**

Without inheritance, the only options are duplication (copy `name` and `diameter_inches` into both classes — violates DRY) or a shared dict (no type safety, no method attachment, no `isinstance` checks). A common workaround is to have both classes store a `Tool` object as an attribute: `self.tool = tool`. But then to get the name you write `self.tool.name` instead of `self.name` — that is composition (has-a), not inheritance (is-a). Inheritance is the right choice when `EndMill` IS a specialization of `Tool`, not just when it contains tool-like data.

**2. What does `super().describe()` return inside `EndMill.describe()`?**

It returns the result of `Tool.describe()` for this specific `EndMill` instance — the base tool description: `'Tool: EM-0500  diameter: 0.500"'`. `super()` gives access to the parent class's version of a method, bypassing the override in the current class. This allows `EndMill.describe()` to build on the parent's description rather than duplicating it. The parent call uses `self`, so `self.name` and `self.diameter_inches` in `Tool.describe()` still refer to this specific `EndMill` instance's data.

**3. One way `Drill` could violate LSP:**

If `Drill.describe()` returned `None` instead of a string, code written for `Tool` that does `label = tool.describe(); label.upper()` would crash with `AttributeError: 'NoneType' has no attribute 'upper'`. The caller expected a string (the `Tool` contract); the subclass broke that contract. Other violations: raising an exception that `Tool.describe()` never raises, requiring the caller to handle a `Drill`-specific exception type. The principle states that swapping a `Drill` for a `Tool` should never break code that was written for `Tool`.
